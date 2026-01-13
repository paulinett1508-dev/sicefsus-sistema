/**
 * RECALCULAR VALOR EXECUTADO - SICEFSUS
 * Script para recalcular o campo valorExecutado em TODAS as emendas
 * com base na soma das despesas EXECUTADAS vinculadas.
 *
 * Problema detectado: 9 emendas têm valorExecutado=0 mas possuem
 * milhões em despesas executadas.
 *
 * Uso:
 *   node scripts/recalcular-valor-executado.cjs           # modo dry-run
 *   node scripts/recalcular-valor-executado.cjs --apply   # aplicar correções
 *
 * Ambiente: PROD (usa prod-credentials.json)
 */

const admin = require('firebase-admin');
const path = require('path');

// Verificar se credenciais existem
const credentialsPath = path.join(__dirname, '../firebase-migration/prod-credentials.json');
let serviceAccount;
try {
  serviceAccount = require(credentialsPath);
} catch (err) {
  console.error('ERRO: Arquivo de credenciais não encontrado em:', credentialsPath);
  console.error('Copie as credenciais de produção para esse caminho.');
  process.exit(1);
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Argumento de linha de comando
const APPLY_CHANGES = process.argv.includes('--apply');

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
 * Formatar moeda para exibição
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

/**
 * Buscar todas as emendas
 */
async function buscarEmendas() {
  const snapshot = await db.collection('emendas').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Buscar despesas executadas de uma emenda
 */
async function buscarDespesasExecutadas(emendaId) {
  const snapshot = await db.collection('despesas')
    .where('emendaId', '==', emendaId)
    .get();

  return snapshot.docs
    .map(doc => doc.data())
    .filter(d => d.status === 'EXECUTADA');
}

/**
 * Buscar naturezas ativas de uma emenda
 */
async function buscarNaturezas(emendaId) {
  const snapshot = await db.collection('naturezas')
    .where('emendaId', '==', emendaId)
    .where('status', '==', 'ativo')
    .get();

  return snapshot.docs.map(doc => doc.data());
}

/**
 * Calcular valores de uma emenda
 */
async function calcularValoresEmenda(emenda) {
  const despesasExecutadas = await buscarDespesasExecutadas(emenda.id);
  const naturezas = await buscarNaturezas(emenda.id);

  // Valor total da emenda
  const valorTotal = parseValorMonetario(
    emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0
  );

  // Soma das despesas executadas
  const valorExecutadoCalculado = despesasExecutadas.reduce((sum, d) => {
    return sum + parseValorMonetario(d.valor || 0);
  }, 0);

  // Soma das naturezas alocadas
  const valorAlocado = naturezas.reduce((sum, n) => {
    return sum + parseValorMonetario(n.valorAlocado || 0);
  }, 0);

  // Valores atuais na emenda
  const valorExecutadoAtual = parseValorMonetario(emenda.valorExecutado || 0);
  const saldoDisponivelAtual = parseValorMonetario(emenda.saldoDisponivel || 0);

  // Valores corrigidos
  const saldoDisponivel = valorTotal - valorExecutadoCalculado;
  const saldoLivre = valorTotal - valorAlocado;
  const percentualExecutado = valorTotal > 0 ? (valorExecutadoCalculado / valorTotal) * 100 : 0;
  const percentualAlocado = valorTotal > 0 ? (valorAlocado / valorTotal) * 100 : 0;

  // Arredondar para 2 casas decimais
  const valoresCorrigidos = {
    valorExecutado: Math.round(valorExecutadoCalculado * 100) / 100,
    saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
    percentualExecutado: Math.round(percentualExecutado * 100) / 100,
    valorAlocado: Math.round(valorAlocado * 100) / 100,
    saldoLivre: Math.round(saldoLivre * 100) / 100,
    percentualAlocado: Math.round(percentualAlocado * 100) / 100,
  };

  // Verificar se há divergência (tolerância de R$ 0.01)
  const divergencia = Math.abs(valorExecutadoCalculado - valorExecutadoAtual) > 0.01;

  return {
    emenda: {
      id: emenda.id,
      numero: emenda.numero || 'N/A',
      municipio: emenda.municipio || 'N/A',
      uf: emenda.uf || 'N/A',
      parlamentar: emenda.parlamentar || 'N/A',
    },
    valorTotal,
    despesasCount: despesasExecutadas.length,
    naturezasCount: naturezas.length,
    valoresAtuais: {
      valorExecutado: valorExecutadoAtual,
      saldoDisponivel: saldoDisponivelAtual,
    },
    valoresCorrigidos,
    divergencia,
    diferencaValorExecutado: valorExecutadoCalculado - valorExecutadoAtual,
  };
}

/**
 * Aplicar correção em uma emenda
 */
async function aplicarCorrecao(emendaId, valoresCorrigidos) {
  const emendaRef = db.collection('emendas').doc(emendaId);

  await emendaRef.update({
    ...valoresCorrigidos,
    recalculadoEm: admin.firestore.FieldValue.serverTimestamp(),
    recalculadoPor: 'Script recalcular-valor-executado',
  });
}

/**
 * Função principal
 */
async function main() {
  console.log('');
  console.log('='.repeat(80));
  console.log(' RECALCULAR VALOR EXECUTADO - SICEFSUS');
  console.log(' Recalcula valorExecutado em todas as emendas com base nas despesas');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Modo: ${APPLY_CHANGES ? '⚠️  APLICAR CORREÇÕES' : '🔍 DRY-RUN (apenas diagnóstico)'}`);
  console.log('');

  // Buscar todas as emendas
  console.log('Buscando emendas...');
  const emendas = await buscarEmendas();
  console.log(`Total de emendas: ${emendas.length}`);
  console.log('');

  // Processar cada emenda
  const resultados = [];
  const divergentes = [];

  console.log('Processando emendas...');
  console.log('-'.repeat(80));

  for (const emenda of emendas) {
    const resultado = await calcularValoresEmenda(emenda);
    resultados.push(resultado);

    if (resultado.divergencia) {
      divergentes.push(resultado);
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log(' RESULTADO DA ANÁLISE');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Total de emendas analisadas: ${resultados.length}`);
  console.log(`Emendas com valores corretos: ${resultados.length - divergentes.length}`);
  console.log(`Emendas com DIVERGÊNCIA: ${divergentes.length}`);
  console.log('');

  if (divergentes.length === 0) {
    console.log('✅ Todas as emendas estão com valores corretos!');
    console.log('');
    process.exit(0);
  }

  // Mostrar divergentes
  console.log('='.repeat(80));
  console.log(' EMENDAS COM DIVERGÊNCIA');
  console.log('='.repeat(80));
  console.log('');

  let totalDiferenca = 0;

  for (const r of divergentes) {
    console.log(`📌 ${r.emenda.numero} - ${r.emenda.municipio}/${r.emenda.uf}`);
    console.log(`   ID: ${r.emenda.id}`);
    console.log(`   Parlamentar: ${r.emenda.parlamentar}`);
    console.log(`   Valor Total: ${formatarMoeda(r.valorTotal)}`);
    console.log(`   Despesas Executadas: ${r.despesasCount}`);
    console.log('');
    console.log('   VALORES ATUAIS (na emenda):');
    console.log(`     valorExecutado: ${formatarMoeda(r.valoresAtuais.valorExecutado)}`);
    console.log(`     saldoDisponivel: ${formatarMoeda(r.valoresAtuais.saldoDisponivel)}`);
    console.log('');
    console.log('   VALORES CALCULADOS (soma das despesas):');
    console.log(`     valorExecutado: ${formatarMoeda(r.valoresCorrigidos.valorExecutado)}`);
    console.log(`     saldoDisponivel: ${formatarMoeda(r.valoresCorrigidos.saldoDisponivel)}`);
    console.log(`     percentualExecutado: ${r.valoresCorrigidos.percentualExecutado.toFixed(2)}%`);
    console.log('');
    console.log(`   ⚠️  DIFERENÇA: ${formatarMoeda(r.diferencaValorExecutado)}`);
    console.log('-'.repeat(80));

    totalDiferenca += r.diferencaValorExecutado;
  }

  console.log('');
  console.log(`TOTAL DA DIFERENÇA ACUMULADA: ${formatarMoeda(totalDiferenca)}`);
  console.log('');

  // Aplicar correções se solicitado
  if (APPLY_CHANGES) {
    console.log('='.repeat(80));
    console.log(' APLICANDO CORREÇÕES');
    console.log('='.repeat(80));
    console.log('');

    let corrigidas = 0;
    let erros = 0;

    for (const r of divergentes) {
      try {
        await aplicarCorrecao(r.emenda.id, r.valoresCorrigidos);
        console.log(`  ✅ ${r.emenda.numero} - ${r.emenda.municipio}`);
        corrigidas++;
      } catch (error) {
        console.log(`  ❌ ${r.emenda.numero} - ERRO: ${error.message}`);
        erros++;
      }
    }

    console.log('');
    console.log('='.repeat(80));
    console.log(' RESUMO FINAL');
    console.log('='.repeat(80));
    console.log(`  Emendas corrigidas: ${corrigidas}`);
    console.log(`  Erros: ${erros}`);
    console.log('');
  } else {
    console.log('');
    console.log('💡 Para aplicar as correções, execute:');
    console.log('   node scripts/recalcular-valor-executado.cjs --apply');
    console.log('');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
