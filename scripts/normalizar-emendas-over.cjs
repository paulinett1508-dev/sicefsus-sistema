#!/usr/bin/env node
// scripts/normalizar-emendas-over.cjs
// 🔧 Script para corrigir emendas com over-commitment na base de TESTES
// ⚠️ SÓ RODA EM AMBIENTE DEV/TEST

const admin = require('firebase-admin');
const readline = require('readline');

// ====== CONFIGURAÇÃO ======
const AMBIENTE = process.env.FIREBASE_ENV || 'dev';
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || '';

// ⚠️ SEGURANÇA: Verificar se é ambiente de teste
if (!PROJECT_ID.includes('test') && !PROJECT_ID.includes('dev') && !PROJECT_ID.includes('60dbd')) {
  console.error('❌ ERRO: Este script só pode rodar em ambiente DEV/TEST!');
  console.error(`   Project ID atual: ${PROJECT_ID}`);
  process.exit(1);
}

console.log('🔧 Normalizador de Emendas com Over-Commitment');
console.log(`📦 Ambiente: ${AMBIENTE}`);
console.log(`🔑 Project ID: ${PROJECT_ID}`);
console.log('');

// Inicializar Firebase Admin
let serviceAccount;
try {
  // Tentar carregar credenciais de teste
  if (PROJECT_ID.includes('60dbd')) {
    serviceAccount = require('../firebase-migration/test-credentials.json');
  } else {
    console.error('❌ Credenciais não encontradas para este ambiente');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erro ao carregar credenciais:', error.message);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();

// ====== FUNÇÕES AUXILIARES ======
function parseValorMonetario(valor) {
  if (!valor && valor !== 0) return 0;
  if (typeof valor === 'number') return valor;
  const valorString = String(valor);
  const numero = valorString
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const valorFloat = parseFloat(numero);
  return isNaN(valorFloat) ? 0 : valorFloat;
}

function formatCurrency(value) {
  return (value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

// ====== ANÁLISE ======
async function analisarEmendas() {
  console.log('🔍 Analisando emendas...\n');

  const emendasSnapshot = await db.collection('emendas').get();
  const despesasSnapshot = await db.collection('despesas').get();

  const emendas = [];
  emendasSnapshot.forEach(doc => {
    emendas.push({ id: doc.id, ...doc.data() });
  });

  const despesas = [];
  despesasSnapshot.forEach(doc => {
    despesas.push({ id: doc.id, ...doc.data() });
  });

  console.log(`📊 Total: ${emendas.length} emendas, ${despesas.length} despesas\n`);

  const problemasEncontrados = [];

  for (const emenda of emendas) {
    const despesasEmenda = despesas.filter(d => d.emendaId === emenda.id);
    
    if (despesasEmenda.length === 0) continue;

    const valorTotal = parseValorMonetario(
      emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0
    );

    const valorExecutado = despesasEmenda
      .filter(d => d.status !== 'PLANEJADA')
      .reduce((acc, d) => acc + parseValorMonetario(d.valor), 0);

    const valorPlanejado = despesasEmenda
      .filter(d => d.status === 'PLANEJADA')
      .reduce((acc, d) => acc + parseValorMonetario(d.valor), 0);

    const valorComprometido = valorExecutado + valorPlanejado;
    const percentualTotal = valorTotal > 0 ? (valorComprometido / valorTotal) * 100 : 0;

    // Identificar emendas problemáticas
    if (percentualTotal > 100 || valorTotal < 1000) {
      problemasEncontrados.push({
        id: emenda.id,
        numero: emenda.numero,
        valorTotal,
        valorExecutado,
        valorPlanejado,
        valorComprometido,
        percentualTotal,
        totalDespesas: despesasEmenda.length,
        tipo: percentualTotal > 100 ? 'OVER' : 'VALOR_BAIXO',
      });
    }
  }

  return problemasEncontrados;
}

// ====== AÇÕES ======
async function corrigirEmenda(problema) {
  const novoValor = Math.ceil(problema.valorComprometido * 1.2); // 20% de margem
  
  await db.collection('emendas').doc(problema.id).update({
    valor: novoValor,
    valorTotal: novoValor,
    valorRecurso: novoValor,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    normalizadoPor: 'script-normalizar-over',
  });

  console.log(`✅ Emenda ${problema.numero} corrigida:`);
  console.log(`   Valor anterior: ${formatCurrency(problema.valorTotal)}`);
  console.log(`   Novo valor: ${formatCurrency(novoValor)}`);
  console.log(`   Comprometido: ${formatCurrency(problema.valorComprometido)} (${problema.percentualTotal.toFixed(1)}%)`);
}

async function deletarEmenda(problema) {
  // Deletar despesas vinculadas
  const despesasSnapshot = await db.collection('despesas')
    .where('emendaId', '==', problema.id)
    .get();

  const batch = db.batch();
  despesasSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Deletar emenda
  batch.delete(db.collection('emendas').doc(problema.id));

  await batch.commit();

  console.log(`🗑️  Emenda ${problema.numero} deletada (${problema.totalDespesas} despesas removidas)`);
}

// ====== MENU INTERATIVO ======
async function menuPrincipal(problemas) {
  console.log('\n🔍 Emendas com problemas encontradas:\n');

  problemas.forEach((p, index) => {
    console.log(`${index + 1}. Emenda ${p.numero} [${p.tipo}]`);
    console.log(`   Valor Total: ${formatCurrency(p.valorTotal)}`);
    console.log(`   Executado: ${formatCurrency(p.valorExecutado)}`);
    console.log(`   Planejado: ${formatCurrency(p.valorPlanejado)}`);
    console.log(`   Total: ${formatCurrency(p.valorComprometido)} (${p.percentualTotal.toFixed(1)}%)`);
    console.log(`   Despesas: ${p.totalDespesas}`);
    console.log('');
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('Escolha uma ação:');
    console.log('1) Corrigir TODAS (ajustar valor total)');
    console.log('2) Deletar TODAS (remover emendas e despesas)');
    console.log('3) Corrigir apenas emendas OVER (>100%)');
    console.log('4) Deletar apenas emendas com valor < R$ 1.000');
    console.log('5) Sair (sem fazer nada)');
    console.log('');

    rl.question('Digite o número da opção: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ====== EXECUÇÃO PRINCIPAL ======
async function main() {
  try {
    const problemas = await analisarEmendas();

    if (problemas.length === 0) {
      console.log('✅ Nenhum problema encontrado! Todas as emendas estão OK.');
      process.exit(0);
    }

    const opcao = await menuPrincipal(problemas);

    console.log('');

    switch (opcao) {
      case '1': {
        console.log('🔧 Corrigindo TODAS as emendas...\n');
        for (const problema of problemas) {
          await corrigirEmenda(problema);
        }
        console.log(`\n✅ ${problemas.length} emendas corrigidas!`);
        break;
      }

      case '2': {
        console.log('⚠️  Você está prestes a DELETAR todas as emendas problemáticas!');
        const rl2 = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const confirmacao = await new Promise((resolve) => {
          rl2.question('Digite "CONFIRMAR" para prosseguir: ', (answer) => {
            rl2.close();
            resolve(answer.trim());
          });
        });

        if (confirmacao === 'CONFIRMAR') {
          console.log('\n🗑️  Deletando emendas...\n');
          for (const problema of problemas) {
            await deletarEmenda(problema);
          }
          console.log(`\n✅ ${problemas.length} emendas deletadas!`);
        } else {
          console.log('❌ Operação cancelada.');
        }
        break;
      }

      case '3': {
        const emendasOver = problemas.filter(p => p.tipo === 'OVER');
        console.log(`🔧 Corrigindo ${emendasOver.length} emendas com OVER...\n`);
        for (const problema of emendasOver) {
          await corrigirEmenda(problema);
        }
        console.log(`\n✅ ${emendasOver.length} emendas corrigidas!`);
        break;
      }

      case '4': {
        const emendasBaixas = problemas.filter(p => p.tipo === 'VALOR_BAIXO');
        console.log(`🗑️  Deletando ${emendasBaixas.length} emendas com valor baixo...\n`);
        for (const problema of emendasBaixas) {
          await deletarEmenda(problema);
        }
        console.log(`\n✅ ${emendasBaixas.length} emendas deletadas!`);
        break;
      }

      case '5':
      default:
        console.log('👋 Saindo sem fazer alterações.');
        break;
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar
main();
