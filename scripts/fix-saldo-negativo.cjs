/**
 * FIX SALDO NEGATIVO - SICEFSUS
 * Script para corrigir emendas com saldo negativo em PROD
 *
 * Causa: Durante um recalculo manual, valorTotal foi lido como 0,
 * resultando em saldoDisponivel = 0 - valorExecutado = -valorExecutado
 *
 * Uso: node scripts/fix-saldo-negativo.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-migration/prod-credentials.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// IDs das 4 emendas com saldo negativo identificadas
const EMENDAS_COM_PROBLEMA = [
  '7MXuX8veyPeL54igKbbW', // Passagem Franca - Andre Fufuca (PAP)
  '9OORfj0LThxPUMDpvKXk', // Sucupira do Riachao - Dr. Benjamim
  'O9xKeS3IhYbXql3Hgq0X', // Sucupira do Riachao - Weverton
  'srwLjuVnyBbc7dcHhQQq', // Passagem Franca - Andre Fufuca (MAC)
];

/**
 * Parse valor monetario (igual ao do projeto)
 */
function parseValorMonetario(valorFormatado) {
  if (!valorFormatado) return 0;
  if (typeof valorFormatado === 'number') return valorFormatado;

  const valorString = valorFormatado.toString();
  const numero = valorString
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  return parseFloat(numero) || 0;
}

/**
 * Formatar moeda para exibicao
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

/**
 * Recalcular uma emenda
 */
async function recalcularEmenda(emendaId) {
  // Buscar emenda
  const emendaRef = db.collection('emendas').doc(emendaId);
  const emendaSnap = await emendaRef.get();

  if (!emendaSnap.exists) {
    return { success: false, error: 'Emenda nao encontrada' };
  }

  const emenda = emendaSnap.data();

  // Buscar despesas (excluindo PLANEJADAS)
  const despesasQuery = await db.collection('despesas')
    .where('emendaId', '==', emendaId)
    .get();

  const despesas = despesasQuery.docs
    .map(doc => doc.data())
    .filter(d => d.status !== 'PLANEJADA');

  // Buscar naturezas ativas
  const naturezasQuery = await db.collection('naturezas')
    .where('emendaId', '==', emendaId)
    .where('status', '==', 'ativo')
    .get();

  const naturezas = naturezasQuery.docs.map(doc => doc.data());

  // Calcular valores
  const valorTotal = parseValorMonetario(
    emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0
  );

  const valorExecutado = despesas.reduce((sum, d) => {
    return sum + parseValorMonetario(d.valor || 0);
  }, 0);

  const valorAlocado = naturezas.reduce((sum, n) => {
    return sum + parseValorMonetario(n.valorAlocado || 0);
  }, 0);

  // Calcular saldos
  const saldoDisponivel = valorTotal - valorExecutado;
  const saldoLivre = valorTotal - valorAlocado;

  // Calcular percentuais
  const percentualExecutado = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;
  const percentualAlocado = valorTotal > 0 ? (valorAlocado / valorTotal) * 100 : 0;

  // Arredondar
  const valoresCalculados = {
    valorExecutado: Math.round(valorExecutado * 100) / 100,
    saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
    percentualExecutado: Math.round(percentualExecutado * 100) / 100,
    valorAlocado: Math.round(valorAlocado * 100) / 100,
    saldoLivre: Math.round(saldoLivre * 100) / 100,
    percentualAlocado: Math.round(percentualAlocado * 100) / 100,
  };

  return {
    success: true,
    emenda: {
      id: emendaId,
      numero: emenda.numero || 'N/A',
      municipio: emenda.municipio,
      uf: emenda.uf,
      parlamentar: emenda.parlamentar,
    },
    valorTotal,
    despesasCount: despesas.length,
    naturezasCount: naturezas.length,
    valoresAtuais: {
      valorExecutado: emenda.valorExecutado,
      saldoDisponivel: emenda.saldoDisponivel,
      percentualExecutado: emenda.percentualExecutado,
    },
    valoresCorrigidos: valoresCalculados,
  };
}

/**
 * Aplicar correcao
 */
async function aplicarCorrecao(emendaId, valoresCorrigidos) {
  const emendaRef = db.collection('emendas').doc(emendaId);

  await emendaRef.update({
    ...valoresCorrigidos,
    corrigidoEm: admin.firestore.FieldValue.serverTimestamp(),
    corrigidoPor: 'Script fix-saldo-negativo',
  });
}

/**
 * Main
 */
async function main() {
  console.log('='.repeat(70));
  console.log(' FIX SALDO NEGATIVO - SICEFSUS');
  console.log(' Corrigir emendas com saldo negativo em PROD');
  console.log('='.repeat(70));
  console.log('');

  const resultados = [];

  // Fase 1: Diagnostico
  console.log('FASE 1: DIAGNOSTICO');
  console.log('-'.repeat(70));
  console.log('');

  for (const emendaId of EMENDAS_COM_PROBLEMA) {
    const resultado = await recalcularEmenda(emendaId);
    resultados.push(resultado);

    if (resultado.success) {
      console.log(`Emenda: ${resultado.emenda.numero}`);
      console.log(`  Municipio: ${resultado.emenda.municipio}/${resultado.emenda.uf}`);
      console.log(`  Parlamentar: ${resultado.emenda.parlamentar}`);
      console.log(`  Valor Total: ${formatarMoeda(resultado.valorTotal)}`);
      console.log(`  Despesas: ${resultado.despesasCount}`);
      console.log('');
      console.log('  VALORES ATUAIS (ERRADOS):');
      console.log(`    Valor Executado: ${formatarMoeda(resultado.valoresAtuais.valorExecutado)}`);
      console.log(`    Saldo Disponivel: ${formatarMoeda(resultado.valoresAtuais.saldoDisponivel)}`);
      console.log(`    Percentual Executado: ${resultado.valoresAtuais.percentualExecutado?.toFixed(2) || 0}%`);
      console.log('');
      console.log('  VALORES CORRIGIDOS:');
      console.log(`    Valor Executado: ${formatarMoeda(resultado.valoresCorrigidos.valorExecutado)}`);
      console.log(`    Saldo Disponivel: ${formatarMoeda(resultado.valoresCorrigidos.saldoDisponivel)}`);
      console.log(`    Percentual Executado: ${resultado.valoresCorrigidos.percentualExecutado.toFixed(2)}%`);
      console.log('');
      console.log('-'.repeat(70));
    } else {
      console.log(`ERRO: ${emendaId} - ${resultado.error}`);
    }
  }

  // Fase 2: Confirmacao
  console.log('');
  console.log('FASE 2: APLICAR CORRECOES');
  console.log('-'.repeat(70));

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const resposta = await new Promise(resolve => {
    rl.question('\nDeseja aplicar as correcoes? (s/n): ', resolve);
  });
  rl.close();

  if (resposta.toLowerCase() !== 's') {
    console.log('\nOperacao cancelada pelo usuario.');
    process.exit(0);
  }

  // Fase 3: Aplicar
  console.log('\nAplicando correcoes...\n');

  let corrigidas = 0;
  let erros = 0;

  for (const resultado of resultados) {
    if (resultado.success) {
      try {
        await aplicarCorrecao(resultado.emenda.id, resultado.valoresCorrigidos);
        console.log(`  OK: ${resultado.emenda.numero} (${resultado.emenda.municipio})`);
        corrigidas++;
      } catch (error) {
        console.log(`  ERRO: ${resultado.emenda.numero} - ${error.message}`);
        erros++;
      }
    }
  }

  // Resumo
  console.log('');
  console.log('='.repeat(70));
  console.log(' RESUMO');
  console.log('='.repeat(70));
  console.log(`  Emendas corrigidas: ${corrigidas}`);
  console.log(`  Erros: ${erros}`);
  console.log('');

  process.exit(0);
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
