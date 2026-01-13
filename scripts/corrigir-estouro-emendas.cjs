/**
 * CORRIGIR ESTOURO DE EMENDAS - SICEFSUS
 * Script para ajustar o valor das emendas que têm despesas executadas
 * acima do valor original (saldo negativo).
 *
 * Correção: Aumentar o campo `valor` e `valorRecurso` para cobrir
 * o total das despesas executadas.
 *
 * Uso:
 *   node scripts/corrigir-estouro-emendas.cjs           # modo dry-run
 *   node scripts/corrigir-estouro-emendas.cjs --apply   # aplicar correções
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
 * Formatar moeda
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

/**
 * Parse valor monetário
 */
function parseValor(valor) {
  if (!valor) return 0;
  if (typeof valor === 'number') return valor;
  return parseFloat(valor.toString().replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
}

/**
 * IDs das emendas com estouro identificadas na auditoria
 */
const EMENDAS_COM_ESTOURO = [
  'pnRUg8N64cFn1e0j6QHu', // Antônio Almeida - JULUO CESAR - 55% estouro
  'UKszNILYhFKD419rY6qn', // São Domingos - PRT 6916 - 34% estouro
  'Gu9wWwt4BG9GTfyiXVGW', // Antônio Almeida - COMISSÃO - 22% estouro
  'jVSzeMhoN5gldVQVEiDv', // São Domingos - WEVERTON - 7.5% estouro
];

/**
 * Buscar emenda por ID
 */
async function buscarEmenda(emendaId) {
  const doc = await db.collection('emendas').doc(emendaId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Buscar despesas executadas de uma emenda
 */
async function buscarDespesasExecutadas(emendaId) {
  const snapshot = await db.collection('despesas')
    .where('emendaId', '==', emendaId)
    .get();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(d => d.status === 'EXECUTADA');
}

/**
 * Aplicar correção na emenda
 */
async function aplicarCorrecao(emendaId, novoValor, valorExecutado) {
  const emendaRef = db.collection('emendas').doc(emendaId);

  await emendaRef.update({
    valor: novoValor,
    valorRecurso: novoValor,
    valorExecutado: Math.round(valorExecutado * 100) / 100,
    saldoDisponivel: 0, // Zera o saldo pois usou tudo
    percentualExecutado: 100,
    corrigidoEstouroEm: admin.firestore.FieldValue.serverTimestamp(),
    corrigidoEstouroPor: 'Script corrigir-estouro-emendas',
    observacoesCorrecao: `Valor ajustado de ${formatarMoeda(novoValor - (novoValor - valorExecutado))} para ${formatarMoeda(novoValor)} para cobrir despesas executadas.`,
  });
}

/**
 * Função principal
 */
async function main() {
  console.log('');
  console.log('='.repeat(80));
  console.log(' CORRIGIR ESTOURO DE EMENDAS - SICEFSUS');
  console.log(' Ajusta valor das emendas para cobrir despesas executadas');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Modo: ${APPLY_CHANGES ? '⚠️  APLICAR CORREÇÕES' : '🔍 DRY-RUN (apenas diagnóstico)'}`);
  console.log('');

  const correcoes = [];

  console.log('Analisando emendas com estouro...');
  console.log('-'.repeat(80));
  console.log('');

  for (const emendaId of EMENDAS_COM_ESTOURO) {
    const emenda = await buscarEmenda(emendaId);

    if (!emenda) {
      console.log(`⚠️  Emenda ${emendaId} não encontrada`);
      continue;
    }

    const despesas = await buscarDespesasExecutadas(emendaId);
    const totalExecutado = despesas.reduce((sum, d) => sum + parseValor(d.valor), 0);
    const valorAtual = parseValor(emenda.valor || emenda.valorRecurso);
    const estouro = totalExecutado - valorAtual;

    if (estouro <= 0) {
      console.log(`✅ ${emenda.numero} - Sem estouro (já corrigida?)`);
      continue;
    }

    // Arredondar para cima para o próximo centavo
    const novoValor = Math.ceil(totalExecutado * 100) / 100;

    correcoes.push({
      emenda,
      valorAtual,
      totalExecutado,
      estouro,
      novoValor,
      despesasCount: despesas.length,
    });

    console.log(`📌 ${emenda.numero} - ${emenda.municipio}/${emenda.uf}`);
    console.log(`   Parlamentar: ${emenda.parlamentar}`);
    console.log(`   Despesas executadas: ${despesas.length}`);
    console.log('');
    console.log(`   Valor ATUAL:     ${formatarMoeda(valorAtual)}`);
    console.log(`   Total EXECUTADO: ${formatarMoeda(totalExecutado)}`);
    console.log(`   ESTOURO:         ${formatarMoeda(estouro)} (${((estouro / valorAtual) * 100).toFixed(1)}%)`);
    console.log('');
    console.log(`   ➡️  NOVO VALOR:   ${formatarMoeda(novoValor)}`);
    console.log('-'.repeat(80));
    console.log('');
  }

  // Resumo
  console.log('='.repeat(80));
  console.log(' RESUMO');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Emendas a corrigir: ${correcoes.length}`);

  if (correcoes.length === 0) {
    console.log('✅ Nenhuma emenda com estouro encontrada!');
    process.exit(0);
  }

  const totalEstouro = correcoes.reduce((sum, c) => sum + c.estouro, 0);
  console.log(`Total do estouro: ${formatarMoeda(totalEstouro)}`);
  console.log('');

  // Tabela resumo
  console.log('Correções:');
  console.log('-'.repeat(80));
  for (const c of correcoes) {
    console.log(`  ${c.emenda.numero.padEnd(15)} | ${formatarMoeda(c.valorAtual).padStart(15)} → ${formatarMoeda(c.novoValor).padStart(15)} | +${formatarMoeda(c.estouro)}`);
  }
  console.log('');

  // Aplicar correções
  if (APPLY_CHANGES) {
    console.log('='.repeat(80));
    console.log(' APLICANDO CORREÇÕES');
    console.log('='.repeat(80));
    console.log('');

    let corrigidas = 0;
    let erros = 0;

    for (const c of correcoes) {
      try {
        await aplicarCorrecao(c.emenda.id, c.novoValor, c.totalExecutado);
        console.log(`  ✅ ${c.emenda.numero} - Valor ajustado para ${formatarMoeda(c.novoValor)}`);
        corrigidas++;
      } catch (error) {
        console.log(`  ❌ ${c.emenda.numero} - ERRO: ${error.message}`);
        erros++;
      }
    }

    console.log('');
    console.log('='.repeat(80));
    console.log(' RESUMO FINAL');
    console.log('='.repeat(80));
    console.log(`  ✅ Emendas corrigidas: ${corrigidas}`);
    console.log(`  ❌ Erros: ${erros}`);
    console.log('');
  } else {
    console.log('');
    console.log('💡 Para aplicar as correções, execute:');
    console.log('   node scripts/corrigir-estouro-emendas.cjs --apply');
    console.log('');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
