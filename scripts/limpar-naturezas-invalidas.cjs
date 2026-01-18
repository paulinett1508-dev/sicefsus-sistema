/**
 * Script: limpar-naturezas-invalidas.cjs
 *
 * Remove naturezas inválidas criadas por migração automática:
 * - Código inválido (000000, vazio, etc.)
 * - Valor alocado = 0
 * - Criadas por migração automática
 *
 * Uso:
 *   node scripts/limpar-naturezas-invalidas.cjs           # Dry-run em PROD
 *   node scripts/limpar-naturezas-invalidas.cjs --dev     # Dry-run em DEV
 *   node scripts/limpar-naturezas-invalidas.cjs --apply   # Aplicar em PROD
 *   node scripts/limpar-naturezas-invalidas.cjs --dev --apply  # Aplicar em DEV
 */

const admin = require("firebase-admin");
const path = require("path");

// Argumentos
const args = process.argv.slice(2);
const isDev = args.includes("--dev");
const aplicar = args.includes("--apply");

// Credenciais
const credentialsPath = isDev
  ? path.join(__dirname, "../firebase-migration/dev-credentials.json")
  : path.join(__dirname, "../firebase-migration/prod-credentials.json");

// Inicializar Firebase
try {
  const serviceAccount = require(credentialsPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log(`\n🔥 Firebase inicializado: ${isDev ? "DEV" : "PROD"}`);
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  console.error(`   Verifique se o arquivo existe: ${credentialsPath}`);
  process.exit(1);
}

const db = admin.firestore();

// Critérios de natureza inválida
const CODIGOS_INVALIDOS = ["000000", "0", "", "null", "undefined", "Outros"];
const isCodigoInvalido = (codigo) => {
  if (!codigo) return true;
  const codigoStr = String(codigo).trim();
  if (CODIGOS_INVALIDOS.includes(codigoStr)) return true;
  // Código válido deve ter pelo menos 5 dígitos numéricos (ex: 339030)
  if (!/^\d{5,6}$/.test(codigoStr.replace(/\./g, ""))) return true;
  return false;
};

async function analisarNaturezas() {
  console.log("\n📊 Analisando naturezas...\n");

  const naturezasRef = db.collection("naturezas");
  const snapshot = await naturezasRef.get();

  const naturezasInvalidas = [];
  const naturezasValidas = [];
  const estatisticas = {
    total: snapshot.size,
    codigoInvalido: 0,
    valorZero: 0,
    migracao: 0,
    semDespesas: 0,
  };

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const natureza = { id: doc.id, ...data };

    const codigo = String(data.codigo || "").trim();
    const valorAlocado = parseFloat(data.valorAlocado) || 0;
    const valorExecutado = parseFloat(data.valorExecutado) || 0;
    const criadaPor = String(data.criadaPor || "");
    const isMigracao = criadaPor.includes("migracao");

    // Verificar se tem despesas vinculadas
    const despesasSnap = await db
      .collection("despesas")
      .where("naturezaId", "==", doc.id)
      .limit(1)
      .get();
    const temDespesas = !despesasSnap.empty;

    // Critérios para natureza inválida:
    // 1. Código inválido E valor alocado = 0
    // 2. OU foi criada por migração E valor alocado = 0 E sem despesas
    const codigoInvalido = isCodigoInvalido(codigo);
    const valorZero = valorAlocado === 0 && valorExecutado === 0;

    const ehInvalida =
      (codigoInvalido && valorZero) ||
      (isMigracao && valorZero && !temDespesas);

    if (ehInvalida) {
      naturezasInvalidas.push({
        ...natureza,
        motivos: {
          codigoInvalido,
          valorZero,
          isMigracao,
          temDespesas,
        },
      });

      if (codigoInvalido) estatisticas.codigoInvalido++;
      if (valorZero) estatisticas.valorZero++;
      if (isMigracao) estatisticas.migracao++;
      if (!temDespesas) estatisticas.semDespesas++;
    } else {
      naturezasValidas.push(natureza);
    }
  }

  return { naturezasInvalidas, naturezasValidas, estatisticas };
}

async function buscarEmenda(emendaId) {
  if (!emendaId) return null;
  const emendaDoc = await db.collection("emendas").doc(emendaId).get();
  if (!emendaDoc.exists) return null;
  return { id: emendaDoc.id, ...emendaDoc.data() };
}

async function excluirNatureza(naturezaId) {
  await db.collection("naturezas").doc(naturezaId).delete();
}

async function main() {
  console.log("═".repeat(60));
  console.log("  LIMPEZA DE NATUREZAS INVÁLIDAS");
  console.log("═".repeat(60));
  console.log(`  Ambiente: ${isDev ? "🟢 DEV" : "🔴 PROD"}`);
  console.log(`  Modo: ${aplicar ? "⚡ APLICAR EXCLUSÕES" : "🔍 DRY-RUN (apenas diagnóstico)"}`);
  console.log("═".repeat(60));

  try {
    const { naturezasInvalidas, naturezasValidas, estatisticas } =
      await analisarNaturezas();

    // Resumo
    console.log("\n📈 RESUMO DA ANÁLISE:");
    console.log(`   Total de naturezas: ${estatisticas.total}`);
    console.log(`   Naturezas válidas: ${naturezasValidas.length}`);
    console.log(`   Naturezas inválidas: ${naturezasInvalidas.length}`);
    console.log("\n   Motivos das inválidas:");
    console.log(`   - Código inválido: ${estatisticas.codigoInvalido}`);
    console.log(`   - Valor zerado: ${estatisticas.valorZero}`);
    console.log(`   - De migração: ${estatisticas.migracao}`);
    console.log(`   - Sem despesas: ${estatisticas.semDespesas}`);

    if (naturezasInvalidas.length === 0) {
      console.log("\n✅ Nenhuma natureza inválida encontrada!");
      process.exit(0);
    }

    // Listar naturezas inválidas
    console.log("\n" + "─".repeat(60));
    console.log("📋 NATUREZAS INVÁLIDAS ENCONTRADAS:");
    console.log("─".repeat(60));

    for (const nat of naturezasInvalidas) {
      const emenda = await buscarEmenda(nat.emendaId);
      const emendaInfo = emenda
        ? `${emenda.numero || "s/n"} - ${emenda.municipio}/${emenda.uf}`
        : "Emenda não encontrada";

      console.log(`\n  ID: ${nat.id}`);
      console.log(`  Código: "${nat.codigo}" | Descrição: "${nat.descricao}"`);
      console.log(`  Valor Alocado: R$ ${(nat.valorAlocado || 0).toFixed(2)}`);
      console.log(`  Valor Executado: R$ ${(nat.valorExecutado || 0).toFixed(2)}`);
      console.log(`  Criada por: ${nat.criadaPor}`);
      console.log(`  Status: ${nat.status}`);
      console.log(`  Emenda: ${emendaInfo}`);
      console.log(`  Motivos: ${Object.entries(nat.motivos)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(", ")}`);
    }

    // Aplicar exclusões
    if (aplicar) {
      console.log("\n" + "═".repeat(60));
      console.log("⚡ APLICANDO EXCLUSÕES...");
      console.log("═".repeat(60));

      let excluidas = 0;
      let erros = 0;

      for (const nat of naturezasInvalidas) {
        try {
          await excluirNatureza(nat.id);
          excluidas++;
          console.log(`  ✅ Excluída: ${nat.id} (${nat.codigo})`);
        } catch (error) {
          erros++;
          console.error(`  ❌ Erro ao excluir ${nat.id}: ${error.message}`);
        }
      }

      console.log("\n" + "─".repeat(60));
      console.log(`  Total excluídas: ${excluidas}`);
      console.log(`  Erros: ${erros}`);
      console.log("─".repeat(60));
    } else {
      console.log("\n" + "═".repeat(60));
      console.log("🔍 MODO DRY-RUN - Nenhuma alteração foi feita");
      console.log("   Para aplicar as exclusões, execute com --apply");
      console.log("═".repeat(60));
    }
  } catch (error) {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
