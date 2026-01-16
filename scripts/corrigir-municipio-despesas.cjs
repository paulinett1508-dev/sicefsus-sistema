/**
 * CORRIGIR MUNICÍPIO DAS DESPESAS - SICEFSUS
 * Script para preencher o campo municipio nas despesas que estão vazias,
 * copiando da emenda vinculada.
 *
 * Uso:
 *   node scripts/corrigir-municipio-despesas.cjs           # modo dry-run PROD
 *   node scripts/corrigir-municipio-despesas.cjs --apply   # aplicar correções PROD
 *   node scripts/corrigir-municipio-despesas.cjs --dev     # modo dry-run DEV
 *   node scripts/corrigir-municipio-despesas.cjs --dev --apply   # aplicar correções DEV
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

/**
 * Buscar todas as despesas
 */
async function buscarDespesas() {
  const snapshot = await db.collection('despesas').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Buscar emenda por ID
 */
async function buscarEmenda(emendaId) {
  if (!emendaId) return null;
  const doc = await db.collection('emendas').doc(emendaId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Verificar se município está vazio ou inválido
 */
function municipioVazio(municipio) {
  if (!municipio) return true;
  if (typeof municipio !== 'string') return true;
  const val = municipio.trim().toLowerCase();
  return val === '' || val === 'n/a' || val === 'null' || val === 'undefined';
}

/**
 * Aplicar correção em uma despesa
 */
async function aplicarCorrecao(despesaId, dados) {
  const despesaRef = db.collection('despesas').doc(despesaId);
  await despesaRef.update({
    ...dados,
    corrigidoEm: admin.firestore.FieldValue.serverTimestamp(),
    corrigidoPor: 'Script corrigir-municipio-despesas',
  });
}

/**
 * Função principal
 */
async function main() {
  console.log('');
  console.log('='.repeat(80));
  console.log(' CORRIGIR MUNICÍPIO DAS DESPESAS - SICEFSUS');
  console.log(' Preenche municipio/uf nas despesas copiando da emenda vinculada');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Ambiente: ${USE_DEV ? '🔧 DEV' : '🔴 PROD'}`);
  console.log(`Modo: ${APPLY_CHANGES ? '⚠️  APLICAR CORREÇÕES' : '🔍 DRY-RUN (apenas diagnóstico)'}`);
  console.log('');

  // Buscar todas as despesas
  console.log('Buscando despesas...');
  const despesas = await buscarDespesas();
  console.log(`Total de despesas: ${despesas.length}`);
  console.log('');

  // Filtrar despesas com município vazio
  const despesasSemMunicipio = despesas.filter(d => municipioVazio(d.municipio));
  console.log(`Despesas com município vazio/N/A: ${despesasSemMunicipio.length}`);
  console.log('');

  if (despesasSemMunicipio.length === 0) {
    console.log('✅ Todas as despesas têm município preenchido!');
    process.exit(0);
  }

  // Cache de emendas para evitar buscas repetidas
  const emendasCache = {};

  // Processar cada despesa
  const correcoes = [];
  const semEmenda = [];
  const emendaSemMunicipio = [];

  console.log('Analisando despesas...');
  console.log('-'.repeat(80));

  for (const despesa of despesasSemMunicipio) {
    const emendaId = despesa.emendaId;

    if (!emendaId) {
      semEmenda.push(despesa);
      continue;
    }

    // Buscar emenda (com cache)
    if (!emendasCache[emendaId]) {
      emendasCache[emendaId] = await buscarEmenda(emendaId);
    }
    const emenda = emendasCache[emendaId];

    if (!emenda) {
      semEmenda.push(despesa);
      continue;
    }

    if (municipioVazio(emenda.municipio)) {
      emendaSemMunicipio.push({ despesa, emenda });
      continue;
    }

    // Preparar correção
    correcoes.push({
      despesa: {
        id: despesa.id,
        descricao: (despesa.descricao || '').substring(0, 40),
        valor: despesa.valor,
        status: despesa.status,
      },
      emenda: {
        id: emenda.id,
        numero: emenda.numero,
        municipio: emenda.municipio,
        uf: emenda.uf,
      },
      dadosCorrecao: {
        municipio: emenda.municipio,
        uf: emenda.uf,
      }
    });
  }

  // Resumo
  console.log('');
  console.log('='.repeat(80));
  console.log(' RESULTADO DA ANÁLISE');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Despesas sem município: ${despesasSemMunicipio.length}`);
  console.log(`  - Podem ser corrigidas: ${correcoes.length}`);
  console.log(`  - Sem emendaId ou emenda não encontrada: ${semEmenda.length}`);
  console.log(`  - Emenda também sem município: ${emendaSemMunicipio.length}`);
  console.log('');

  // Mostrar correções por município
  const porMunicipio = {};
  for (const c of correcoes) {
    const key = `${c.emenda.municipio}/${c.emenda.uf}`;
    porMunicipio[key] = (porMunicipio[key] || 0) + 1;
  }

  console.log('Correções por município:');
  for (const [mun, count] of Object.entries(porMunicipio).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${mun}: ${count} despesas`);
  }
  console.log('');

  // Mostrar algumas correções de exemplo
  if (correcoes.length > 0) {
    console.log('-'.repeat(80));
    console.log('Exemplos de correções (primeiras 5):');
    console.log('-'.repeat(80));
    for (const c of correcoes.slice(0, 5)) {
      console.log(`  Despesa: ${c.despesa.id.substring(0, 15)}...`);
      console.log(`    Descrição: ${c.despesa.descricao || 'N/A'}...`);
      console.log(`    Emenda: ${c.emenda.numero} (${c.emenda.id.substring(0, 15)}...)`);
      console.log(`    Município será: ${c.dadosCorrecao.municipio}/${c.dadosCorrecao.uf}`);
      console.log('');
    }
  }

  // Mostrar despesas sem emenda
  if (semEmenda.length > 0) {
    console.log('-'.repeat(80));
    console.log(`⚠️  Despesas SEM emenda vinculada (${semEmenda.length}):`);
    console.log('-'.repeat(80));
    for (const d of semEmenda.slice(0, 5)) {
      console.log(`  ${d.id.substring(0, 20)}... | emendaId: ${d.emendaId || 'NULO'}`);
    }
    if (semEmenda.length > 5) {
      console.log(`  ... e mais ${semEmenda.length - 5}`);
    }
    console.log('');
  }

  // Aplicar correções se solicitado
  if (APPLY_CHANGES && correcoes.length > 0) {
    console.log('='.repeat(80));
    console.log(' APLICANDO CORREÇÕES');
    console.log('='.repeat(80));
    console.log('');

    let aplicadas = 0;
    let erros = 0;

    for (const c of correcoes) {
      try {
        await aplicarCorrecao(c.despesa.id, c.dadosCorrecao);
        aplicadas++;

        // Mostrar progresso a cada 10
        if (aplicadas % 10 === 0) {
          console.log(`  Progresso: ${aplicadas}/${correcoes.length} corrigidas...`);
        }
      } catch (error) {
        console.log(`  ❌ Erro em ${c.despesa.id}: ${error.message}`);
        erros++;
      }
    }

    console.log('');
    console.log('='.repeat(80));
    console.log(' RESUMO FINAL');
    console.log('='.repeat(80));
    console.log(`  ✅ Despesas corrigidas: ${aplicadas}`);
    console.log(`  ❌ Erros: ${erros}`);
    console.log(`  ⚠️  Não corrigidas (sem emenda): ${semEmenda.length}`);
    console.log('');
  } else if (!APPLY_CHANGES && correcoes.length > 0) {
    console.log('');
    console.log('💡 Para aplicar as correções, execute:');
    console.log('   node scripts/corrigir-municipio-despesas.cjs --apply');
    console.log('');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
