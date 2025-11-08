// test-connection.cjs - APENAS LEITURA (não modifica nada)
const admin = require('firebase-admin');

console.log('🔍 Testando conexão com os bancos...\n');

// Produção
const prodApp = admin.initializeApp({
  credential: admin.credential.cert(require('./prod-credentials.json')),
}, 'prod');

// Teste
const testApp = admin.initializeApp({
  credential: admin.credential.cert(require('./test-credentials.json')),
}, 'test');

const prodDb = prodApp.firestore();
const testDb = testApp.firestore();

async function testarConexao() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 BANCO DE PRODUÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const collections = ['auditoria', 'configuracoes', 'despesas', 'emendas', 'estados', 'logs', 'tipos_emenda', 'usuarios'];

    for (const col of collections) {
      const snapshot = await prodDb.collection(col).get();
      console.log(`   ${col}: ${snapshot.size} documentos`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 BANCO DE TESTE (ANTES DA MIGRAÇÃO)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const col of collections) {
      const snapshot = await testDb.collection(col).get();
      console.log(`   ${col}: ${snapshot.size} documentos`);
    }

    console.log('\n✅ Conexões testadas com sucesso!');
    console.log('📌 O script de migração vai copiar os dados de PRODUÇÃO para TESTE.');
    console.log('⚠️  O banco de PRODUÇÃO não será modificado.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testarConexao();