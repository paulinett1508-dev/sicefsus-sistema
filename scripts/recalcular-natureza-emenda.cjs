/**
 * Script para recalcular uma natureza específica e sua emenda
 */
const admin = require("firebase-admin");
const path = require("path");

const args = process.argv.slice(2);
const isDev = args.includes("--dev");
const naturezaId = args.find(a => a.startsWith("--natureza="))?.split("=")[1];
const emendaId = args.find(a => a.startsWith("--emenda="))?.split("=")[1];

if (!naturezaId || !emendaId) {
  console.log("Uso: node scripts/recalcular-natureza-emenda.cjs --dev --natureza=ID --emenda=ID");
  process.exit(1);
}

const credentialsPath = isDev
  ? path.join(__dirname, "../firebase-migration/dev-credentials.json")
  : path.join(__dirname, "../firebase-migration/prod-credentials.json");

const serviceAccount = require(credentialsPath);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function recalcular() {
  console.log(`\n🔥 Firebase: ${isDev ? "DEV" : "PROD"}`);
  console.log(`📍 Natureza: ${naturezaId}`);
  console.log(`📍 Emenda: ${emendaId}\n`);

  // 1. Buscar despesas da natureza
  console.log("🔄 Recalculando natureza...");
  const despesasSnap = await db.collection("despesas")
    .where("naturezaId", "==", naturezaId)
    .get();

  let valorExecutado = 0;
  despesasSnap.forEach(doc => {
    const d = doc.data();
    if (d.status === "EXECUTADA") {
      valorExecutado += parseFloat(d.valor) || 0;
    }
    console.log(`  Despesa: ${doc.id} | valor: ${d.valor} | status: ${d.status}`);
  });

  // 2. Atualizar natureza
  const naturezaRef = db.collection("naturezas").doc(naturezaId);
  const naturezaSnap = await naturezaRef.get();

  if (!naturezaSnap.exists) {
    console.error("❌ Natureza não encontrada!");
    process.exit(1);
  }

  const natureza = naturezaSnap.data();
  const valorAlocado = parseFloat(natureza.valorAlocado) || 0;
  const saldoDisponivel = valorAlocado - valorExecutado;
  const percentualExecutado = valorAlocado > 0 ? (valorExecutado / valorAlocado) * 100 : 0;

  console.log(`\n📊 Natureza ANTES:`, {
    valorAlocado: natureza.valorAlocado,
    valorExecutado: natureza.valorExecutado,
    saldoDisponivel: natureza.saldoDisponivel
  });

  await naturezaRef.update({
    valorExecutado: Math.round(valorExecutado * 100) / 100,
    saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
    percentualExecutado: Math.round(percentualExecutado * 100) / 100,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    recalculadoPor: "script-manual"
  });

  console.log(`✅ Natureza DEPOIS:`, {
    valorAlocado,
    valorExecutado: Math.round(valorExecutado * 100) / 100,
    saldoDisponivel: Math.round(saldoDisponivel * 100) / 100
  });

  // 3. Recalcular emenda
  console.log("\n🔄 Recalculando emenda...");

  const naturezasSnap = await db.collection("naturezas")
    .where("emendaId", "==", emendaId)
    .where("status", "==", "ativo")
    .get();

  let totalAlocado = 0;
  let totalExecutado = 0;

  for (const doc of naturezasSnap.docs) {
    const n = doc.data();
    totalAlocado += parseFloat(n.valorAlocado) || 0;

    // Para a natureza que acabamos de atualizar, usar o valor novo
    if (doc.id === naturezaId) {
      totalExecutado += valorExecutado;
    } else {
      totalExecutado += parseFloat(n.valorExecutado) || 0;
    }
    console.log(`  Natureza: ${n.codigo} | alocado: ${n.valorAlocado} | executado: ${doc.id === naturezaId ? valorExecutado : n.valorExecutado}`);
  }

  const emendaRef = db.collection("emendas").doc(emendaId);
  const emendaSnap = await emendaRef.get();

  if (!emendaSnap.exists) {
    console.error("❌ Emenda não encontrada!");
    process.exit(1);
  }

  const emenda = emendaSnap.data();
  const valorTotal = parseFloat(emenda.valor) || 0;
  const saldoParaNaturezas = valorTotal - totalAlocado;
  const saldoNaoExecutado = valorTotal - totalExecutado;
  const percentualExec = valorTotal > 0 ? (totalExecutado / valorTotal) * 100 : 0;
  const percentualAloc = valorTotal > 0 ? (totalAlocado / valorTotal) * 100 : 0;

  console.log(`\n📊 Emenda ANTES:`, {
    valor: emenda.valor,
    valorAlocado: emenda.valorAlocado,
    valorExecutado: emenda.valorExecutado,
    saldoParaNaturezas: emenda.saldoParaNaturezas,
    saldoNaoExecutado: emenda.saldoNaoExecutado
  });

  await emendaRef.update({
    valorAlocado: Math.round(totalAlocado * 100) / 100,
    valorExecutado: Math.round(totalExecutado * 100) / 100,
    saldoParaNaturezas: Math.round(saldoParaNaturezas * 100) / 100,
    saldoNaoExecutado: Math.round(saldoNaoExecutado * 100) / 100,
    saldoLivre: Math.round(saldoParaNaturezas * 100) / 100,
    saldoDisponivel: Math.round(saldoNaoExecutado * 100) / 100,
    percentualExecutado: Math.round(percentualExec * 100) / 100,
    percentualAlocado: Math.round(percentualAloc * 100) / 100,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    recalculadoPor: "script-manual"
  });

  console.log(`✅ Emenda DEPOIS:`, {
    valor: valorTotal,
    valorAlocado: Math.round(totalAlocado * 100) / 100,
    valorExecutado: Math.round(totalExecutado * 100) / 100,
    saldoParaNaturezas: Math.round(saldoParaNaturezas * 100) / 100,
    saldoNaoExecutado: Math.round(saldoNaoExecutado * 100) / 100
  });

  console.log("\n✅ Recálculo concluído!");
}

recalcular().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
