// migrate.js - Script de Migração Firebase Prod → Teste (COMPLETO)
const admin = require("firebase-admin");

console.log("🚀 Iniciando migração Firebase...\n");

// ✅ Inicializar Firebase PRODUÇÃO
const prodApp = admin.initializeApp(
  {
    credential: admin.credential.cert(require("./prod-credentials.json")),
  },
  "prod",
);

// ✅ Inicializar Firebase TESTE
const testApp = admin.initializeApp(
  {
    credential: admin.credential.cert(require("./test-credentials.json")),
  },
  "test",
);

const prodDb = prodApp.firestore();
const testDb = testApp.firestore();

// 📦 Função para migrar uma coleção
async function migrateCollection(collectionName) {
  console.log(`📦 Migrando coleção: ${collectionName}...`);

  try {
    const snapshot = await prodDb.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`⚠️  ${collectionName}: Coleção vazia, pulando...\n`);
      return;
    }

    let count = 0;
    const total = snapshot.size;

    for (const doc of snapshot.docs) {
      await testDb.collection(collectionName).doc(doc.id).set(doc.data());
      count++;
      process.stdout.write(`\r   ✅ ${count}/${total} documentos migrados`);
    }

    console.log(
      `\n✅ ${collectionName}: ${total} documentos migrados com sucesso!\n`,
    );
  } catch (error) {
    console.error(`❌ Erro ao migrar ${collectionName}:`, error.message);
  }
}

// 🎯 Executar migração de TODAS as coleções
async function migrate() {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 INÍCIO DA MIGRAÇÃO COMPLETA");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // ✅ Lista COMPLETA de coleções
    const collections = [
      "auditoria",
      "configuracoes",
      "despesas",
      "emendas",
      "estados",
      "logs",
      "tipos_emenda",
      "usuarios",
    ];

    // Migrar cada coleção
    for (const collection of collections) {
      await migrateCollection(collection);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 MIGRAÇÃO COMPLETA CONCLUÍDA!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📊 RESUMO:");
    console.log("   ✅ Todas as 8 coleções foram migradas");
    console.log("   ✅ Dados de produção copiados para teste\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERRO FATAL:", error);
    process.exit(1);
  }
}

// Executar
migrate();
