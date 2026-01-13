/**
 * FIX VALOR EXECUTADO DAS EMENDAS
 * Corrige emendas onde valorExecutado está zerado mas tem despesas executadas.
 * 
 * Uso:
 *   node scripts/fix-valor-executado-emendas.cjs           # modo dry-run
 *   node scripts/fix-valor-executado-emendas.cjs --apply   # aplicar correções
 *   node scripts/fix-valor-executado-emendas.cjs --dev     # usar banco DEV
 */

const admin = require('firebase-admin');
const path = require('path');

// Verificar flags
const APPLY_CHANGES = process.argv.includes('--apply');
const USE_DEV = process.argv.includes('--dev');

// Credenciais
const credentialsPath = USE_DEV 
  ? path.join(__dirname, '../firebase-migration/dev-credentials.json')
  : path.join(__dirname, '../firebase-migration/prod-credentials.json');

let serviceAccount;
try {
  serviceAccount = require(credentialsPath);
} catch (err) {
  console.error('ERRO: Arquivo de credenciais não encontrado em:', credentialsPath);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  console.log('');
  console.log('='.repeat(80));
  console.log(' FIX VALOR EXECUTADO DAS EMENDAS');
  console.log('='.repeat(80));
  console.log(`Ambiente: ${USE_DEV ? 'DEV' : 'PROD'}`);
  console.log(`Modo: ${APPLY_CHANGES ? 'APLICAR CORREÇÕES' : 'DRY-RUN'}`);
  console.log('');

  // Buscar todas as emendas
  const emendasSnap = await db.collection('emendas').get();
  console.log(`Total de emendas: ${emendasSnap.size}`);
  console.log('');

  const emendasParaCorrigir = [];

  for (const emendaDoc of emendasSnap.docs) {
    const emenda = emendaDoc.data();
    const emendaId = emendaDoc.id;

    // Buscar despesas EXECUTADAS desta emenda
    const despesasSnap = await db.collection('despesas')
      .where('emendaId', '==', emendaId)
      .where('status', '==', 'EXECUTADA')
      .get();

    const totalExecutadoDespesas = despesasSnap.docs.reduce((sum, doc) => {
      const valor = parseFloat(doc.data().valor) || 0;
      return sum + valor;
    }, 0);

    const valorExecutadoAtual = parseFloat(emenda.valorExecutado) || 0;
    const valorTotal = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal) || 0;

    // Verificar se há inconsistência
    const diferencaSignificativa = Math.abs(valorExecutadoAtual - totalExecutadoDespesas) > 0.01;

    if (diferencaSignificativa && totalExecutadoDespesas > 0) {
      const percentualCorreto = valorTotal > 0 ? (totalExecutadoDespesas / valorTotal) * 100 : 0;
      const saldoCorreto = valorTotal - totalExecutadoDespesas;

      emendasParaCorrigir.push({
        id: emendaId,
        numero: emenda.numero,
        valorTotal,
        valorExecutadoAtual,
        valorExecutadoCorreto: totalExecutadoDespesas,
        percentualExecutadoCorreto: Math.round(percentualCorreto * 100) / 100,
        saldoDisponivel: Math.round(saldoCorreto * 100) / 100,
        qtdDespesas: despesasSnap.size,
      });
    }
  }

  console.log(`Emendas com valorExecutado incorreto: ${emendasParaCorrigir.length}`);
  console.log('');

  if (emendasParaCorrigir.length === 0) {
    console.log('✅ Todas as emendas estão com valorExecutado correto!');
    process.exit(0);
  }

  // Mostrar detalhes
  console.log('-'.repeat(80));
  for (const e of emendasParaCorrigir) {
    console.log(`Emenda: ${e.numero} (${e.id.substring(0, 8)}...)`);
    console.log(`  Valor Total: R$ ${e.valorTotal.toFixed(2)}`);
    console.log(`  valorExecutado atual: R$ ${e.valorExecutadoAtual.toFixed(2)} ❌`);
    console.log(`  valorExecutado correto: R$ ${e.valorExecutadoCorreto.toFixed(2)} ✅`);
    console.log(`  percentualExecutado: ${e.percentualExecutadoCorreto}%`);
    console.log(`  Despesas executadas: ${e.qtdDespesas}`);
    console.log('');
  }

  // Aplicar correções
  if (APPLY_CHANGES) {
    console.log('='.repeat(80));
    console.log(' APLICANDO CORREÇÕES');
    console.log('='.repeat(80));
    console.log('');

    let corrigidas = 0;
    for (const e of emendasParaCorrigir) {
      try {
        await db.collection('emendas').doc(e.id).update({
          valorExecutado: e.valorExecutadoCorreto,
          percentualExecutado: e.percentualExecutadoCorreto,
          saldoDisponivel: e.saldoDisponivel,
          saldoNaoExecutado: e.saldoDisponivel,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Corrigida: ${e.numero}`);
        corrigidas++;
      } catch (err) {
        console.log(`❌ Erro em ${e.numero}: ${err.message}`);
      }
    }

    console.log('');
    console.log(`Total corrigidas: ${corrigidas}/${emendasParaCorrigir.length}`);
  } else {
    console.log('');
    console.log('💡 Para aplicar as correções, execute:');
    console.log(`   node scripts/fix-valor-executado-emendas.cjs --apply${USE_DEV ? ' --dev' : ''}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
