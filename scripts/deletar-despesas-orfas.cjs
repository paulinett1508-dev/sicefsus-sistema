/**
 * DELETAR DESPESAS ÓRFÃS - SICEFSUS
 * Script para remover despesas cuja emenda vinculada não existe mais.
 *
 * Uso:
 *   node scripts/deletar-despesas-orfas.cjs           # modo dry-run (apenas lista)
 *   node scripts/deletar-despesas-orfas.cjs --apply   # deletar despesas órfãs
 *   node scripts/deletar-despesas-orfas.cjs --dev     # usar banco DEV
 *   node scripts/deletar-despesas-orfas.cjs --dev --apply
 */

const admin = require('firebase-admin');
const path = require('path');

// Argumentos de linha de comando
const APPLY_CHANGES = process.argv.includes('--apply');
const USE_DEV = process.argv.includes('--dev');

// Verificar credenciais
const credentialsFile = USE_DEV ? 'dev-credentials.json' : 'prod-credentials.json';
const credentialsPath = path.join(__dirname, '../firebase-migration', credentialsFile);

let serviceAccount;
try {
  serviceAccount = require(credentialsPath);
} catch (err) {
  console.error('ERRO: Arquivo de credenciais não encontrado em:', credentialsPath);
  console.error(`Copie as credenciais de ${USE_DEV ? 'desenvolvimento' : 'produção'} para esse caminho.`);
  process.exit(1);
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  console.log('');
  console.log('='.repeat(70));
  console.log(' DELETAR DESPESAS ÓRFÃS - SICEFSUS');
  console.log(' Remove despesas cuja emenda vinculada não existe mais');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Ambiente: ${USE_DEV ? '🔧 DEV' : '🔴 PROD'}`);
  console.log(`Modo: ${APPLY_CHANGES ? '⚠️  DELETAR DESPESAS' : '🔍 DRY-RUN (apenas lista)'}`);
  console.log('');

  // Buscar todas as emendas (para cache de IDs válidos)
  console.log('Buscando emendas...');
  const emendasSnapshot = await db.collection('emendas').get();
  const emendasIds = new Set(emendasSnapshot.docs.map(doc => doc.id));
  console.log(`Total de emendas: ${emendasIds.size}`);

  // Buscar todas as despesas
  console.log('Buscando despesas...');
  const despesasSnapshot = await db.collection('despesas').get();
  const despesas = despesasSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log(`Total de despesas: ${despesas.length}`);
  console.log('');

  // Identificar despesas órfãs
  const orfas = despesas.filter(d => {
    // Se não tem emendaId, considerar órfã
    if (!d.emendaId) return true;
    // Se emendaId não existe nas emendas, é órfã
    return !emendasIds.has(d.emendaId);
  });

  console.log('-'.repeat(70));
  console.log(`🚨 DESPESAS ÓRFÃS ENCONTRADAS: ${orfas.length}`);
  console.log('-'.repeat(70));

  if (orfas.length === 0) {
    console.log('✅ Nenhuma despesa órfã encontrada!');
    process.exit(0);
  }

  // Agrupar por emendaId para diagnóstico
  const porEmenda = {};
  orfas.forEach(d => {
    const key = d.emendaId || 'SEM_EMENDA_ID';
    if (!porEmenda[key]) {
      porEmenda[key] = [];
    }
    porEmenda[key].push(d);
  });

  console.log('\nAgrupadas por emendaId (deletado):');
  Object.entries(porEmenda).forEach(([emendaId, deps]) => {
    console.log(`  ${emendaId}: ${deps.length} despesas`);
    deps.slice(0, 3).forEach(d => {
      const valor = d.valor ? `R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A';
      console.log(`    - ${d.id.substring(0, 15)}... | ${valor} | ${d.status || 'N/A'}`);
    });
    if (deps.length > 3) {
      console.log(`    ... e mais ${deps.length - 3}`);
    }
  });

  // Calcular valor total das despesas órfãs
  const valorTotal = orfas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  console.log(`\n💰 Valor total das despesas órfãs: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

  // Aplicar deleção se solicitado
  if (APPLY_CHANGES) {
    console.log('\n' + '='.repeat(70));
    console.log(' DELETANDO DESPESAS ÓRFÃS');
    console.log('='.repeat(70));

    let deletadas = 0;
    let erros = 0;

    for (const despesa of orfas) {
      try {
        await db.collection('despesas').doc(despesa.id).delete();
        deletadas++;

        if (deletadas % 10 === 0) {
          console.log(`  Progresso: ${deletadas}/${orfas.length} deletadas...`);
        }
      } catch (error) {
        console.log(`  ❌ Erro ao deletar ${despesa.id}: ${error.message}`);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(' RESUMO FINAL');
    console.log('='.repeat(70));
    console.log(`  ✅ Despesas deletadas: ${deletadas}`);
    console.log(`  ❌ Erros: ${erros}`);
    console.log('');
  } else {
    console.log('\n💡 Para deletar as despesas órfãs, execute:');
    console.log(`   node scripts/deletar-despesas-orfas.cjs${USE_DEV ? ' --dev' : ''} --apply`);
    console.log('');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
