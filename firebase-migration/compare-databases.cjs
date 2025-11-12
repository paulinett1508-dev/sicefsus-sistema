
// compare-databases.cjs - Comparação Firebase DEV vs PROD (READ-ONLY)
const admin = require("firebase-admin");

console.log("🔍 Iniciando comparação entre bancos Firebase...\n");

// ✅ Inicializar Firebase PRODUÇÃO
const prodApp = admin.initializeApp(
  {
    credential: admin.credential.cert(require("./prod-credentials.json")),
  },
  "prod",
);

// ✅ Inicializar Firebase DESENVOLVIMENTO
const devApp = admin.initializeApp(
  {
    credential: admin.credential.cert(require("./test-credentials.json")),
  },
  "dev",
);

const prodDb = prodApp.firestore();
const devDb = devApp.firestore();

// 📊 Função para obter estatísticas de uma coleção
async function getCollectionStats(db, collectionName, envName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    
    const docs = [];
    snapshot.forEach(doc => {
      docs.push({
        id: doc.id,
        data: doc.data()
      });
    });

    return {
      exists: true,
      count: snapshot.size,
      docs: docs,
      sampleData: snapshot.size > 0 ? docs[0] : null
    };
  } catch (error) {
    return {
      exists: false,
      count: 0,
      docs: [],
      error: error.message
    };
  }
}

// 🔍 Função para comparar coleções
async function compareCollections() {
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

  const results = {
    production: {},
    development: {},
    comparison: []
  };

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 COMPARAÇÃO DETALHADA DE COLEÇÕES");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const collection of collections) {
    console.log(`\n📦 Analisando coleção: ${collection}...`);
    
    const prodStats = await getCollectionStats(prodDb, collection, "PROD");
    const devStats = await getCollectionStats(devDb, collection, "DEV");

    results.production[collection] = prodStats;
    results.development[collection] = devStats;

    const comparison = {
      collection,
      prodExists: prodStats.exists,
      devExists: devStats.exists,
      prodCount: prodStats.count,
      devCount: devStats.count,
      difference: prodStats.count - devStats.count,
      status: ""
    };

    // Determinar status
    if (!prodStats.exists && !devStats.exists) {
      comparison.status = "❌ Não existe em nenhum ambiente";
    } else if (!prodStats.exists) {
      comparison.status = "⚠️  Existe apenas em DEV";
    } else if (!devStats.exists) {
      comparison.status = "⚠️  Existe apenas em PROD";
    } else if (prodStats.count === devStats.count) {
      comparison.status = "✅ Sincronizado";
    } else if (prodStats.count > devStats.count) {
      comparison.status = `📈 PROD tem ${comparison.difference} doc(s) a mais`;
    } else {
      comparison.status = `📉 DEV tem ${Math.abs(comparison.difference)} doc(s) a mais`;
    }

    results.comparison.push(comparison);

    // Exibir resumo
    console.log(`   PROD: ${prodStats.count} documentos | DEV: ${devStats.count} documentos`);
    console.log(`   ${comparison.status}`);
  }

  return results;
}

// 📋 Função para exibir relatório final
function displayReport(results) {
  console.log("\n" + "━".repeat(60));
  console.log("📊 RELATÓRIO FINAL DA COMPARAÇÃO");
  console.log("━".repeat(60));

  console.log("\n📈 RESUMO POR COLEÇÃO:\n");
  
  const table = results.comparison.map(c => ({
    "Coleção": c.collection,
    "PROD": c.prodCount,
    "DEV": c.devCount,
    "Diferença": c.difference > 0 ? `+${c.difference}` : c.difference,
    "Status": c.status
  }));

  console.table(table);

  // Totais
  const totalProd = results.comparison.reduce((sum, c) => sum + c.prodCount, 0);
  const totalDev = results.comparison.reduce((sum, c) => sum + c.devCount, 0);

  console.log("\n📊 TOTAIS GERAIS:");
  console.log(`   PRODUÇÃO: ${totalProd} documentos`);
  console.log(`   DESENVOLVIMENTO: ${totalDev} documentos`);
  console.log(`   Diferença: ${totalProd - totalDev} documentos`);

  // Alertas importantes
  console.log("\n⚠️  ALERTAS IMPORTANTES:");
  
  const prodExclusive = results.comparison.filter(c => c.prodExists && !c.devExists);
  const devExclusive = results.comparison.filter(c => !c.prodExists && c.devExists);
  const outOfSync = results.comparison.filter(c => c.prodExists && c.devExists && c.prodCount !== c.devCount);

  if (prodExclusive.length > 0) {
    console.log(`\n   🔴 Coleções APENAS em PROD:`);
    prodExclusive.forEach(c => console.log(`      - ${c.collection} (${c.prodCount} docs)`));
  }

  if (devExclusive.length > 0) {
    console.log(`\n   🟡 Coleções APENAS em DEV:`);
    devExclusive.forEach(c => console.log(`      - ${c.collection} (${c.devCount} docs)`));
  }

  if (outOfSync.length > 0) {
    console.log(`\n   🟠 Coleções DESSINCRONIZADAS:`);
    outOfSync.forEach(c => {
      const diff = c.prodCount - c.devCount;
      const direction = diff > 0 ? "a mais em PROD" : "a mais em DEV";
      console.log(`      - ${c.collection}: ${Math.abs(diff)} docs ${direction}`);
    });
  }

  // Recomendações
  console.log("\n💡 RECOMENDAÇÕES:");
  
  if (prodExclusive.length > 0 || devExclusive.length > 0) {
    console.log("   ⚠️  Existem coleções exclusivas de um ambiente");
    console.log("   ➡️  Verifique se isso é intencional antes de migrar");
  }

  if (outOfSync.length > 0) {
    console.log("   ⚠️  Ambientes dessincronizados");
    console.log("   ➡️  PROD tem dados que DEV não tem (dados reais dos usuários)");
    console.log("   ➡️  Qualquer migração DEVE preservar os dados de PROD");
  }

  console.log("\n✅ PRÓXIMOS PASSOS SEGUROS:");
  console.log("   1. Revise este relatório cuidadosamente");
  console.log("   2. Identifique quais dados de PROD são críticos");
  console.log("   3. Se necessário, faça backup de PROD antes de qualquer operação");
  console.log("   4. Migre apenas o que for realmente necessário");
  
  console.log("\n" + "━".repeat(60));
}

// 🎯 Executar comparação
async function main() {
  try {
    const results = await compareCollections();
    displayReport(results);

    // Salvar relatório em JSON (opcional)
    const fs = require('fs');
    const reportPath = './comparison-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Relatório completo salvo em: ${reportPath}`);

    console.log("\n✅ Comparação concluída com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  }
}

main();
