/**
 * CORRIGIR LÓGICA ORÇAMENTÁRIA - SICEFSUS
 * Script para:
 * 1. Auto-regularizar naturezas com valorAlocado=0 mas valorExecutado>0
 * 2. Recalcular campos das emendas com novos nomes
 *
 * Uso:
 *   node scripts/corrigir-logica-orcamentaria.cjs           # modo dry-run
 *   node scripts/corrigir-logica-orcamentaria.cjs --apply   # aplicar correções
 *   node scripts/corrigir-logica-orcamentaria.cjs --dev     # usar banco DEV
 *   node scripts/corrigir-logica-orcamentaria.cjs --dev --apply
 *
 * Ambiente padrão: PROD
 */

const admin = require('firebase-admin');
const path = require('path');

// Verificar argumentos
const USE_DEV = process.argv.includes('--dev');
const APPLY_CHANGES = process.argv.includes('--apply');

// Selecionar credenciais
const credentialsFile = USE_DEV
  ? 'test-credentials.json'  // DEV = emendas-parlamentares-60dbd
  : 'prod-credentials.json'; // PROD = emendas-parlamentares-prod
const credentialsPath = path.join(__dirname, '../firebase-migration', credentialsFile);

let serviceAccount;
try {
  serviceAccount = require(credentialsPath);
} catch (err) {
  console.error(`ERRO: Arquivo de credenciais não encontrado em: ${credentialsPath}`);
  console.error('Copie as credenciais para esse caminho.');
  process.exit(1);
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║     CORREÇÃO DE LÓGICA ORÇAMENTÁRIA - SICEFSUS                 ║
╠════════════════════════════════════════════════════════════════╣
║  Ambiente: ${USE_DEV ? 'DEV (desenvolvimento)' : 'PROD (produção)'}
║  Modo: ${APPLY_CHANGES ? 'APLICAR CORREÇÕES' : 'DRY-RUN (apenas diagnóstico)'}
╚════════════════════════════════════════════════════════════════╝
`);

/**
 * Parse valor monetário para número
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
 * Formatar valor para exibição
 */
function formatCurrency(valor) {
  return (valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * FASE 1: Auto-regularizar naturezas
 */
async function regularizarNaturezas() {
  console.log('\n━━━ FASE 1: AUTO-REGULARIZAR NATUREZAS ━━━\n');

  const naturezasSnapshot = await db.collection('naturezas').get();
  const naturezas = naturezasSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  console.log(`Total de naturezas: ${naturezas.length}`);

  const naturezasParaCorrigir = naturezas.filter(n => {
    const valorAlocado = parseValorMonetario(n.valorAlocado);
    const valorExecutado = parseValorMonetario(n.valorExecutado);
    return valorAlocado === 0 && valorExecutado > 0 && n.status !== 'encerrado';
  });

  console.log(`Naturezas com valorAlocado=0 mas valorExecutado>0: ${naturezasParaCorrigir.length}\n`);

  if (naturezasParaCorrigir.length === 0) {
    console.log('Nenhuma natureza precisa de regularização.');
    return [];
  }

  const correcoes = [];

  for (const natureza of naturezasParaCorrigir) {
    const valorExecutado = parseValorMonetario(natureza.valorExecutado);
    const novoValorAlocado = valorExecutado; // Auto-regularizar: alocado = executado
    const novoSaldoDisponivel = novoValorAlocado - valorExecutado; // = 0

    console.log(`  📦 Natureza ${natureza.codigo} (${natureza.id.substring(0, 8)}...)`);
    console.log(`     Emenda: ${natureza.emendaId?.substring(0, 8)}...`);
    console.log(`     ANTES: valorAlocado=${formatCurrency(natureza.valorAlocado)}, valorExecutado=${formatCurrency(valorExecutado)}`);
    console.log(`     DEPOIS: valorAlocado=${formatCurrency(novoValorAlocado)}, saldoDisponivel=${formatCurrency(novoSaldoDisponivel)}`);

    if (APPLY_CHANGES) {
      await db.collection('naturezas').doc(natureza.id).update({
        valorAlocado: novoValorAlocado,
        saldoDisponivel: novoSaldoDisponivel,
        percentualExecutado: 100, // 100% executado quando alocado = executado
        autoRegularizado: true,
        autoRegularizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`     ✅ CORRIGIDO\n`);
    } else {
      console.log(`     ⏸️  Seria corrigido (dry-run)\n`);
    }

    correcoes.push({
      naturezaId: natureza.id,
      emendaId: natureza.emendaId,
      codigo: natureza.codigo,
      valorAlocadoAntigo: natureza.valorAlocado,
      valorAlocadoNovo: novoValorAlocado,
    });
  }

  return correcoes;
}

/**
 * FASE 2: Recalcular emendas com novos campos
 */
async function recalcularEmendas() {
  console.log('\n━━━ FASE 2: RECALCULAR EMENDAS ━━━\n');

  const emendasSnapshot = await db.collection('emendas').get();
  const emendas = emendasSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  console.log(`Total de emendas: ${emendas.length}\n`);

  let corrigidas = 0;
  let semAlteracao = 0;

  for (const emenda of emendas) {
    // Buscar despesas executadas da emenda
    const despesasSnapshot = await db.collection('despesas')
      .where('emendaId', '==', emenda.id)
      .get();

    const despesas = despesasSnapshot.docs
      .map(doc => doc.data())
      .filter(d => d.status !== 'PLANEJADA');

    // Buscar naturezas ativas da emenda
    const naturezasSnapshot = await db.collection('naturezas')
      .where('emendaId', '==', emenda.id)
      .where('status', '==', 'ativo')
      .get();

    const naturezas = naturezasSnapshot.docs.map(doc => doc.data());

    // Calcular valores
    const valorTotal = parseValorMonetario(
      emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0
    );

    const valorExecutado = despesas.reduce((sum, d) =>
      sum + parseValorMonetario(d.valor || 0), 0
    );

    const valorAlocado = naturezas.reduce((sum, n) =>
      sum + parseValorMonetario(n.valorAlocado || 0), 0
    );

    // Novos campos
    const saldoParaNaturezas = valorTotal - valorAlocado;
    const saldoNaoExecutado = valorTotal - valorExecutado;
    const percentualExecutado = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;
    const percentualAlocado = valorTotal > 0 ? (valorAlocado / valorTotal) * 100 : 0;

    // Verificar se precisa atualizar
    const valorExecutadoAtual = parseValorMonetario(emenda.valorExecutado);
    const valorAlocadoAtual = parseValorMonetario(emenda.valorAlocado);
    const saldoLivreAtual = parseValorMonetario(emenda.saldoLivre);
    const saldoDisponivelAtual = parseValorMonetario(emenda.saldoDisponivel);

    const precisaAtualizar =
      Math.abs(valorExecutadoAtual - valorExecutado) > 0.01 ||
      Math.abs(valorAlocadoAtual - valorAlocado) > 0.01 ||
      Math.abs(saldoLivreAtual - saldoParaNaturezas) > 0.01 ||
      Math.abs(saldoDisponivelAtual - saldoNaoExecutado) > 0.01;

    if (precisaAtualizar) {
      console.log(`  📋 Emenda ${emenda.numero || emenda.id.substring(0, 8)}`);
      console.log(`     Valor Total: ${formatCurrency(valorTotal)}`);
      console.log(`     Naturezas: ${naturezas.length} | Despesas: ${despesas.length}`);
      console.log(`     ANTES:`);
      console.log(`       valorAlocado: ${formatCurrency(valorAlocadoAtual)}`);
      console.log(`       valorExecutado: ${formatCurrency(valorExecutadoAtual)}`);
      console.log(`       saldoLivre: ${formatCurrency(saldoLivreAtual)}`);
      console.log(`       saldoDisponivel: ${formatCurrency(saldoDisponivelAtual)}`);
      console.log(`     DEPOIS:`);
      console.log(`       valorAlocado: ${formatCurrency(valorAlocado)}`);
      console.log(`       valorExecutado: ${formatCurrency(valorExecutado)}`);
      console.log(`       saldoParaNaturezas: ${formatCurrency(saldoParaNaturezas)}`);
      console.log(`       saldoNaoExecutado: ${formatCurrency(saldoNaoExecutado)}`);

      if (APPLY_CHANGES) {
        await db.collection('emendas').doc(emenda.id).update({
          // Campos existentes (atualizados)
          valorExecutado: Math.round(valorExecutado * 100) / 100,
          valorAlocado: Math.round(valorAlocado * 100) / 100,
          percentualExecutado: Math.round(percentualExecutado * 100) / 100,
          percentualAlocado: Math.round(percentualAlocado * 100) / 100,
          // Novos campos com nomes claros
          saldoParaNaturezas: Math.round(saldoParaNaturezas * 100) / 100,
          saldoNaoExecutado: Math.round(saldoNaoExecutado * 100) / 100,
          // Manter campos antigos para compatibilidade (alias)
          saldoLivre: Math.round(saldoParaNaturezas * 100) / 100,
          saldoDisponivel: Math.round(saldoNaoExecutado * 100) / 100,
          // Metadados
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          versaoCalculo: Date.now(),
        });
        console.log(`     ✅ CORRIGIDA\n`);
      } else {
        console.log(`     ⏸️  Seria corrigida (dry-run)\n`);
      }
      corrigidas++;
    } else {
      semAlteracao++;
    }
  }

  console.log(`\nResumo: ${corrigidas} emendas precisam correção, ${semAlteracao} já estão corretas.`);
  return corrigidas;
}

/**
 * Executar script
 */
async function main() {
  try {
    // Fase 1: Regularizar naturezas
    const naturezasCorrigidas = await regularizarNaturezas();

    // Fase 2: Recalcular emendas
    const emendasCorrigidas = await recalcularEmendas();

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                        RESUMO FINAL                            ║
╠════════════════════════════════════════════════════════════════╣
║  Naturezas regularizadas: ${naturezasCorrigidas.length.toString().padStart(3)}
║  Emendas recalculadas: ${emendasCorrigidas.toString().padStart(6)}
╠════════════════════════════════════════════════════════════════╣
║  ${APPLY_CHANGES ? '✅ CORREÇÕES APLICADAS' : '⏸️  DRY-RUN (nenhuma alteração feita)'}
╚════════════════════════════════════════════════════════════════╝
`);

    if (!APPLY_CHANGES && (naturezasCorrigidas.length > 0 || emendasCorrigidas > 0)) {
      console.log('Para aplicar as correções, execute:');
      console.log(`  node scripts/corrigir-logica-orcamentaria.cjs ${USE_DEV ? '--dev ' : ''}--apply\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO:', error);
    process.exit(1);
  }
}

main();
