/**
 * VINCULAR DESPESAS A NATUREZAS - SICEFSUS
 * Script para preencher naturezaId nas despesas que estão sem vínculo.
 *
 * Lógica:
 * 1. Para cada despesa sem naturezaId
 * 2. Extrair o código de natureza do campo naturezaDespesa (ex: "339030")
 * 3. Buscar natureza existente com mesmo código + emendaId
 * 4. Se existir: vincular
 * 5. Se não existir: criar a natureza e vincular
 *
 * Uso:
 *   node scripts/vincular-despesas-naturezas.cjs           # modo dry-run
 *   node scripts/vincular-despesas-naturezas.cjs --apply   # aplicar correções
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
 * Extrair código de natureza (6 dígitos) do campo naturezaDespesa
 * Exemplos:
 *   "339030 - MATERIAL DE CONSUMO" -> "339030"
 *   "3.3.90.30" -> "339030"
 *   "339039" -> "339039"
 */
function extrairCodigoNatureza(naturezaDespesa) {
  if (!naturezaDespesa) return null;

  const str = naturezaDespesa.toString().trim();

  // Padrão 1: "339030 - DESCRIÇÃO" ou apenas "339030"
  const match1 = str.match(/^(\d{6})/);
  if (match1) return match1[1];

  // Padrão 2: "3.3.90.30" -> remover pontos -> "339030"
  const match2 = str.match(/^(\d)\.(\d)\.(\d{2})\.(\d{2})/);
  if (match2) {
    return match2[1] + match2[2] + match2[3] + match2[4];
  }

  // Padrão 3: "3.3.9.0.30" (formato alternativo) -> "339030"
  const match3 = str.match(/^(\d)\.(\d)\.(\d)\.(\d)\.(\d{2})/);
  if (match3) {
    return match3[1] + match3[2] + match3[3] + match3[4] + match3[5];
  }

  // Padrão 4: qualquer sequência de 6 dígitos
  const match4 = str.match(/(\d{6})/);
  if (match4) return match4[1];

  return null;
}

/**
 * Obter descrição padrão para um código de natureza
 */
function getDescricaoNatureza(codigo) {
  const descricoes = {
    '339004': '339004 - CONTRATACAO POR TEMPO DETERMINADO - PES.CIVIL',
    '339030': '339030 - MATERIAL DE CONSUMO',
    '339032': '339032 - MATERIAL DE DISTRIBUICAO GRATUITA',
    '339033': '339033 - PASSAGENS E DESPESAS COM LOCOMOCAO',
    '339034': '339034 - OUTRAS DESPESAS DE PESSOAL - CONTRATOS DE TERCEIRIZACAO',
    '339035': '339035 - SERVICOS DE CONSULTORIA',
    '339036': '339036 - OUTROS SERVICOS DE TERCEIROS - PESSOA FISICA',
    '339037': '339037 - LOCACAO DE MAO-DE-OBRA',
    '339039': '339039 - OUTROS SERVICOS DE TERCEIROS-PESSOA JURIDICA',
    '339040': '339040 - SERVICOS DE TECNOLOGIA DA INFORMACAO E COMUNICACAO - PESSOA JURIDICA',
    '339047': '339047 - OBRIGACOES TRIBUTARIAS E CONTRIBUTIVAS',
    '339092': '339092 - DESPESAS DE EXERCICIOS ANTERIORES',
    '339093': '339093 - INDENIZACOES E RESTITUICOES',
    '449052': '449052 - EQUIPAMENTOS E MATERIAL PERMANENTE',
  };
  return descricoes[codigo] || `${codigo} - NATUREZA DE DESPESA`;
}

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
 * Buscar todas as naturezas
 */
async function buscarNaturezas() {
  const snapshot = await db.collection('naturezas').get();
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
 * Criar nova natureza
 */
async function criarNatureza(dados) {
  const docRef = await db.collection('naturezas').add({
    ...dados,
    criadaEm: admin.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    criadaPor: 'Script vincular-despesas-naturezas',
    atualizadoPor: 'Script vincular-despesas-naturezas',
  });
  return docRef.id;
}

/**
 * Atualizar despesa com naturezaId
 */
async function atualizarDespesa(despesaId, naturezaId) {
  await db.collection('despesas').doc(despesaId).update({
    naturezaId: naturezaId,
    vinculadoEm: admin.firestore.FieldValue.serverTimestamp(),
    vinculadoPor: 'Script vincular-despesas-naturezas',
  });
}

/**
 * Função principal
 */
async function main() {
  console.log('');
  console.log('='.repeat(80));
  console.log(' VINCULAR DESPESAS A NATUREZAS - SICEFSUS');
  console.log(' Preenche naturezaId nas despesas e cria naturezas quando necessário');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Modo: ${APPLY_CHANGES ? '⚠️  APLICAR CORREÇÕES' : '🔍 DRY-RUN (apenas diagnóstico)'}`);
  console.log('');

  // Buscar dados
  console.log('Buscando despesas...');
  const despesas = await buscarDespesas();
  console.log(`Total de despesas: ${despesas.length}`);

  console.log('Buscando naturezas existentes...');
  const naturezas = await buscarNaturezas();
  console.log(`Total de naturezas: ${naturezas.length}`);
  console.log('');

  // Criar mapa de naturezas por emendaId + codigo
  const naturezasMap = {};
  for (const n of naturezas) {
    const key = `${n.emendaId}|${n.codigo}`;
    naturezasMap[key] = n;
  }

  // Filtrar despesas sem naturezaId
  const despesasSemNatureza = despesas.filter(d => !d.naturezaId);
  console.log(`Despesas sem naturezaId: ${despesasSemNatureza.length}`);
  console.log('');

  if (despesasSemNatureza.length === 0) {
    console.log('✅ Todas as despesas já têm naturezaId vinculado!');
    process.exit(0);
  }

  // Cache de emendas
  const emendasCache = {};

  // Processar cada despesa
  const vincularExistente = [];  // Natureza já existe
  const criarENovincular = [];   // Precisa criar natureza
  const semCodigo = [];          // Não tem código de natureza
  const semEmenda = [];          // Não tem emenda

  console.log('Analisando despesas...');
  console.log('-'.repeat(80));

  for (const despesa of despesasSemNatureza) {
    const emendaId = despesa.emendaId;

    // Verificar se tem emenda
    if (!emendaId) {
      semEmenda.push(despesa);
      continue;
    }

    // Extrair código de natureza
    const codigo = extrairCodigoNatureza(despesa.naturezaDespesa);
    if (!codigo) {
      semCodigo.push(despesa);
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

    // Verificar se natureza já existe
    const key = `${emendaId}|${codigo}`;
    const naturezaExistente = naturezasMap[key];

    if (naturezaExistente) {
      vincularExistente.push({
        despesa,
        natureza: naturezaExistente,
        emenda,
        codigo,
      });
    } else {
      criarENovincular.push({
        despesa,
        emenda,
        codigo,
        descricao: getDescricaoNatureza(codigo),
      });
    }
  }

  // Resumo
  console.log('');
  console.log('='.repeat(80));
  console.log(' RESULTADO DA ANÁLISE');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Despesas sem naturezaId: ${despesasSemNatureza.length}`);
  console.log(`  - Vincular a natureza existente: ${vincularExistente.length}`);
  console.log(`  - Criar natureza nova e vincular: ${criarENovincular.length}`);
  console.log(`  - Sem código de natureza: ${semCodigo.length}`);
  console.log(`  - Sem emenda válida: ${semEmenda.length}`);
  console.log('');

  // Estatísticas por código
  const porCodigo = {};
  for (const item of [...vincularExistente, ...criarENovincular]) {
    porCodigo[item.codigo] = (porCodigo[item.codigo] || 0) + 1;
  }

  console.log('Por código de natureza:');
  for (const [cod, count] of Object.entries(porCodigo).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cod}: ${count} despesas`);
  }
  console.log('');

  // Naturezas que serão criadas
  if (criarENovincular.length > 0) {
    const naturezasAcriar = {};
    for (const item of criarENovincular) {
      const key = `${item.emenda.id}|${item.codigo}`;
      if (!naturezasAcriar[key]) {
        naturezasAcriar[key] = {
          emendaId: item.emenda.id,
          emendaNumero: item.emenda.numero,
          municipio: item.emenda.municipio,
          codigo: item.codigo,
          descricao: item.descricao,
          despesasCount: 0,
        };
      }
      naturezasAcriar[key].despesasCount++;
    }

    console.log('-'.repeat(80));
    console.log(`Naturezas a serem CRIADAS (${Object.keys(naturezasAcriar).length}):`);
    console.log('-'.repeat(80));
    for (const n of Object.values(naturezasAcriar).slice(0, 10)) {
      console.log(`  ${n.codigo} | Emenda: ${n.emendaNumero} | ${n.municipio} | ${n.despesasCount} despesas`);
    }
    if (Object.keys(naturezasAcriar).length > 10) {
      console.log(`  ... e mais ${Object.keys(naturezasAcriar).length - 10}`);
    }
    console.log('');
  }

  // Despesas sem código
  if (semCodigo.length > 0) {
    console.log('-'.repeat(80));
    console.log(`⚠️  Despesas SEM código de natureza (${semCodigo.length}):`);
    console.log('-'.repeat(80));
    for (const d of semCodigo.slice(0, 5)) {
      console.log(`  ${d.id.substring(0, 20)}... | naturezaDespesa: "${d.naturezaDespesa || 'VAZIO'}"`);
    }
    if (semCodigo.length > 5) {
      console.log(`  ... e mais ${semCodigo.length - 5}`);
    }
    console.log('');
  }

  // Aplicar correções se solicitado
  if (APPLY_CHANGES) {
    console.log('='.repeat(80));
    console.log(' APLICANDO CORREÇÕES');
    console.log('='.repeat(80));
    console.log('');

    let vinculadas = 0;
    let naturezasCriadas = 0;
    let erros = 0;

    // Cache de naturezas criadas nesta execução
    const naturezasCriadasCache = {};

    // 1. Vincular a naturezas existentes
    console.log('Vinculando a naturezas existentes...');
    for (const item of vincularExistente) {
      try {
        await atualizarDespesa(item.despesa.id, item.natureza.id);
        vinculadas++;
        if (vinculadas % 20 === 0) {
          console.log(`  Progresso: ${vinculadas}/${vincularExistente.length}`);
        }
      } catch (error) {
        console.log(`  ❌ Erro: ${item.despesa.id} - ${error.message}`);
        erros++;
      }
    }
    console.log(`  ✅ ${vinculadas} despesas vinculadas a naturezas existentes`);
    console.log('');

    // 2. Criar naturezas e vincular
    console.log('Criando naturezas novas e vinculando...');
    for (const item of criarENovincular) {
      try {
        const key = `${item.emenda.id}|${item.codigo}`;

        // Verificar se já criamos essa natureza nesta execução
        let naturezaId = naturezasCriadasCache[key];

        if (!naturezaId) {
          // Criar nova natureza
          naturezaId = await criarNatureza({
            emendaId: item.emenda.id,
            codigo: item.codigo,
            descricao: item.descricao,
            valorAlocado: 0,
            valorExecutado: 0,
            saldoDisponivel: 0,
            percentualExecutado: 0,
            status: 'ativo',
            municipio: item.emenda.municipio,
            uf: item.emenda.uf,
          });
          naturezasCriadasCache[key] = naturezaId;
          naturezasCriadas++;
        }

        // Vincular despesa
        await atualizarDespesa(item.despesa.id, naturezaId);
        vinculadas++;

        if ((vinculadas + naturezasCriadas) % 20 === 0) {
          console.log(`  Progresso: ${vinculadas} vinculadas, ${naturezasCriadas} naturezas criadas`);
        }
      } catch (error) {
        console.log(`  ❌ Erro: ${item.despesa.id} - ${error.message}`);
        erros++;
      }
    }
    console.log(`  ✅ ${naturezasCriadas} naturezas criadas`);
    console.log('');

    // Resumo final
    console.log('='.repeat(80));
    console.log(' RESUMO FINAL');
    console.log('='.repeat(80));
    console.log(`  ✅ Despesas vinculadas: ${vinculadas}`);
    console.log(`  ✅ Naturezas criadas: ${naturezasCriadas}`);
    console.log(`  ❌ Erros: ${erros}`);
    console.log(`  ⚠️  Não processadas (sem código/emenda): ${semCodigo.length + semEmenda.length}`);
    console.log('');
  } else {
    console.log('');
    console.log('💡 Para aplicar as correções, execute:');
    console.log('   node scripts/vincular-despesas-naturezas.cjs --apply');
    console.log('');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
