/**
 * IMPORTAR FORNECEDORES DAS DESPESAS - SICEFSUS
 *
 * Script de migracao unica para extrair fornecedores das despesas existentes
 * e criar na colecao fornecedores.
 *
 * Uso:
 *   node scripts/import-fornecedores.cjs dev    # Para ambiente DEV
 *   node scripts/import-fornecedores.cjs prod   # Para ambiente PROD
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Verificar argumento de ambiente
const ambiente = process.argv[2];

if (!ambiente || !['dev', 'prod'].includes(ambiente)) {
  console.log('');
  console.log('Uso: node scripts/import-fornecedores.cjs <ambiente>');
  console.log('');
  console.log('Ambientes disponiveis:');
  console.log('  dev  - Ambiente de desenvolvimento');
  console.log('  prod - Ambiente de producao');
  console.log('');
  process.exit(1);
}

// Carregar credenciais corretas
const credentialsPath = ambiente === 'prod'
  ? '../firebase-migration/prod-credentials.json'
  : '../firebase-migration/test-credentials.json';

let serviceAccount;
try {
  serviceAccount = require(credentialsPath);
} catch (error) {
  console.error(`Erro ao carregar credenciais: ${credentialsPath}`);
  console.error('Verifique se o arquivo existe.');
  process.exit(1);
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Formatar CNPJ
 */
function formatarCNPJ(cnpj) {
  if (!cnpj) return '';
  const numeros = cnpj.replace(/\D/g, '');
  if (numeros.length !== 14) return cnpj;
  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Extrair fornecedores unicos das despesas
 */
async function extrairFornecedores() {
  console.log('Buscando despesas...');

  const snapshot = await db.collection('despesas').get();
  console.log(`Total de despesas: ${snapshot.docs.length}`);

  const mapa = new Map();

  snapshot.docs.forEach(doc => {
    const despesa = doc.data();
    const cnpj = despesa.cnpjFornecedor?.replace(/\D/g, '');

    // Ignorar se nao tem CNPJ valido
    if (!cnpj || cnpj.length < 14) return;

    // Se ja existe no mapa, atualiza contagem
    if (mapa.has(cnpj)) {
      const existente = mapa.get(cnpj);
      // Prioriza dados mais completos
      if (!existente.razaoSocial && despesa.fornecedor) {
        existente.razaoSocial = despesa.fornecedor;
      }
      if (!existente.nomeFantasia && despesa.nomeFantasia) {
        existente.nomeFantasia = despesa.nomeFantasia;
      }
      existente.qtdDespesas++;
      return;
    }

    // Parsear endereco (formato: "LOGRADOURO, NUMERO, BAIRRO")
    const enderecoParts = (despesa.enderecoFornecedor || '').split(',').map(p => p.trim());
    const cidadeUfParts = (despesa.cidadeUf || '').split('/').map(p => p.trim());

    mapa.set(cnpj, {
      cnpj: cnpj,
      razaoSocial: despesa.fornecedor || '',
      nomeFantasia: despesa.nomeFantasia || '',
      endereco: {
        logradouro: enderecoParts[0] || '',
        numero: enderecoParts[1] || '',
        bairro: enderecoParts[2] || '',
        cidade: cidadeUfParts[0] || '',
        uf: cidadeUfParts[1] || '',
        cep: despesa.cep || ''
      },
      contato: {
        telefone: despesa.telefoneFornecedor || '',
        email: despesa.emailFornecedor || ''
      },
      situacaoCadastral: despesa.situacaoCadastral || 'ATIVA',
      qtdDespesas: 1
    });
  });

  return Array.from(mapa.values()).sort((a, b) =>
    (a.razaoSocial || '').localeCompare(b.razaoSocial || '')
  );
}

/**
 * Buscar fornecedores ja cadastrados
 */
async function buscarFornecedoresCadastrados() {
  const snapshot = await db.collection('fornecedores').get();
  return new Set(snapshot.docs.map(doc => {
    const data = doc.data();
    return data.cnpj?.replace(/\D/g, '');
  }));
}

/**
 * Importar fornecedores
 */
async function importarFornecedores(fornecedores, cnpjsCadastrados) {
  let importados = 0;
  let ignorados = 0;
  let erros = 0;

  for (const f of fornecedores) {
    // Pular se ja cadastrado
    if (cnpjsCadastrados.has(f.cnpj)) {
      ignorados++;
      continue;
    }

    try {
      await db.collection('fornecedores').add({
        cnpj: f.cnpj,
        razaoSocial: f.razaoSocial || '',
        nomeFantasia: f.nomeFantasia || '',
        endereco: f.endereco || {},
        contato: f.contato || {},
        situacaoCadastral: f.situacaoCadastral || 'ATIVA',
        criadoPor: 'script-import-fornecedores',
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        atualizadoPor: 'script-import-fornecedores',
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        uf: f.endereco?.uf || '',
        municipiosAtendidos: []
      });

      console.log(`  + ${formatarCNPJ(f.cnpj)} - ${f.razaoSocial || 'Sem razao social'}`);
      importados++;
    } catch (error) {
      console.log(`  X ERRO ${f.cnpj}: ${error.message}`);
      erros++;
    }
  }

  return { importados, ignorados, erros };
}

/**
 * Main
 */
async function main() {
  console.log('');
  console.log('='.repeat(70));
  console.log(' IMPORTAR FORNECEDORES DAS DESPESAS - SICEFSUS');
  console.log(` Ambiente: ${ambiente.toUpperCase()}`);
  console.log('='.repeat(70));
  console.log('');

  // Fase 1: Extrair fornecedores
  console.log('FASE 1: EXTRAINDO FORNECEDORES DAS DESPESAS');
  console.log('-'.repeat(70));

  const fornecedores = await extrairFornecedores();
  console.log(`Fornecedores unicos encontrados: ${fornecedores.length}`);
  console.log('');

  // Fase 2: Verificar ja cadastrados
  console.log('FASE 2: VERIFICANDO CADASTROS EXISTENTES');
  console.log('-'.repeat(70));

  const cnpjsCadastrados = await buscarFornecedoresCadastrados();
  console.log(`Fornecedores ja cadastrados: ${cnpjsCadastrados.size}`);

  const novos = fornecedores.filter(f => !cnpjsCadastrados.has(f.cnpj));
  console.log(`Fornecedores novos para importar: ${novos.length}`);
  console.log('');

  if (novos.length === 0) {
    console.log('Nenhum fornecedor novo para importar!');
    process.exit(0);
  }

  // Fase 3: Listar fornecedores novos
  console.log('FORNECEDORES A SEREM IMPORTADOS:');
  console.log('-'.repeat(70));

  novos.forEach((f, i) => {
    console.log(`${(i + 1).toString().padStart(3)}. ${formatarCNPJ(f.cnpj)} - ${f.razaoSocial || 'Sem razao social'} (${f.qtdDespesas} despesa${f.qtdDespesas > 1 ? 's' : ''})`);
  });
  console.log('');

  // Fase 4: Confirmacao
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const resposta = await new Promise(resolve => {
    rl.question(`Deseja importar ${novos.length} fornecedor(es) para ${ambiente.toUpperCase()}? (s/n): `, resolve);
  });
  rl.close();

  if (resposta.toLowerCase() !== 's') {
    console.log('\nOperacao cancelada pelo usuario.');
    process.exit(0);
  }

  // Fase 5: Importar
  console.log('');
  console.log('FASE 5: IMPORTANDO FORNECEDORES');
  console.log('-'.repeat(70));

  const resultado = await importarFornecedores(novos, cnpjsCadastrados);

  // Resumo
  console.log('');
  console.log('='.repeat(70));
  console.log(' RESUMO');
  console.log('='.repeat(70));
  console.log(`  Fornecedores importados: ${resultado.importados}`);
  console.log(`  Ja existentes (ignorados): ${resultado.ignorados}`);
  console.log(`  Erros: ${resultado.erros}`);
  console.log('');

  process.exit(0);
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
