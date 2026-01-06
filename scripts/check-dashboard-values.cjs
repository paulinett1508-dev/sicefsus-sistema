// Script temporário para verificar valores do Dashboard
require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const projectId = process.env.FIREBASE_DEV_PROJECT_ID;
const clientEmail = process.env.FIREBASE_DEV_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_DEV_PRIVATE_KEY?.replace(/\\n/g, "\n");

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
}, "dashboard-check-" + Date.now());

const db = getFirestore(app);

function parseValorMonetario(valor) {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === "number") return valor;
  const valorString = valor.toString();
  const numero = valorString
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  return parseFloat(numero) || 0;
}

const formatMoeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

(async () => {
  try {
    const emendasSnap = await db.collection("emendas").get();
    const emendas = emendasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const despesasSnap = await db.collection("despesas").get();
    const despesas = despesasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const despesasPlanejadas = despesas.filter(d => d.status === "PLANEJADA");
    const despesasExecutadas = despesas.filter(d => d.status !== "PLANEJADA");

    console.log("═══════════════════════════════════════════════════════════");
    console.log("         VERIFICAÇÃO DE VALORES - DASHBOARD ADMIN          ");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("");
    console.log("📊 TOTAIS GERAIS:");
    console.log("   Emendas:", emendas.length);
    console.log("   Despesas Total:", despesas.length);
    console.log("   - PLANEJADAS:", despesasPlanejadas.length);
    console.log("   - EXECUTADAS:", despesasExecutadas.length);
    console.log("");

    const valorTotalEmendas = emendas.reduce((sum, e) => {
      return sum + parseValorMonetario(e.valor || e.valorRecurso || e.valorTotal || 0);
    }, 0);

    const valorExecutadoComPlanejadas = despesas.reduce((sum, d) => {
      return sum + parseValorMonetario(d.valor || 0);
    }, 0);

    const valorExecutadoSemPlanejadas = despesasExecutadas.reduce((sum, d) => {
      return sum + parseValorMonetario(d.valor || 0);
    }, 0);

    const valorPlanejadas = despesasPlanejadas.reduce((sum, d) => {
      return sum + parseValorMonetario(d.valor || 0);
    }, 0);

    const saldoCorreto = valorTotalEmendas - valorExecutadoSemPlanejadas;
    const percentualCorreto = valorTotalEmendas > 0 ? (valorExecutadoSemPlanejadas / valorTotalEmendas) * 100 : 0;

    console.log("💰 VALORES FINANCEIROS:");
    console.log("");
    console.log("   Valor Total Emendas:     ", formatMoeda(valorTotalEmendas));
    console.log("");
    console.log("   ❌ ANTES (com PLANEJADAS):");
    console.log("      Valor Executado:      ", formatMoeda(valorExecutadoComPlanejadas));
    console.log("      Saldo:                ", formatMoeda(valorTotalEmendas - valorExecutadoComPlanejadas));
    console.log("      % Executado:          ", ((valorExecutadoComPlanejadas / valorTotalEmendas) * 100).toFixed(2) + "%");
    console.log("");
    console.log("   ✅ DEPOIS (sem PLANEJADAS) - CORRETO:");
    console.log("      Valor Executado:      ", formatMoeda(valorExecutadoSemPlanejadas));
    console.log("      Saldo Disponível:     ", formatMoeda(saldoCorreto));
    console.log("      % Executado:          ", percentualCorreto.toFixed(2) + "%");
    console.log("");
    console.log("   📋 Despesas PLANEJADAS:  ", formatMoeda(valorPlanejadas));
    console.log("");

    // Diferença entre antes e depois
    const diferenca = valorExecutadoComPlanejadas - valorExecutadoSemPlanejadas;
    if (diferenca > 0) {
      console.log("   ⚠️  DIFERENÇA CORRIGIDA:  ", formatMoeda(diferenca));
      console.log("      (valor que estava inflado por despesas PLANEJADAS)");
    }

    console.log("");
    console.log("═══════════════════════════════════════════════════════════");

    // Detalhe por emenda (Top 5)
    console.log("");
    console.log("📝 DETALHE POR EMENDA (Top 5 com despesas):");
    console.log("");

    const emendasComDespesas = emendas
      .map(emenda => {
        const despEmenda = despesasExecutadas.filter(d => d.emendaId === emenda.id);
        const valorTotal = parseValorMonetario(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
        const valorExec = despEmenda.reduce((s, d) => s + parseValorMonetario(d.valor), 0);
        return {
          numero: emenda.numero || emenda.id.substring(0, 8),
          municipio: emenda.municipio || "N/A",
          valorTotal,
          valorExec,
          saldo: valorTotal - valorExec,
          despesas: despEmenda.length,
          percentual: valorTotal > 0 ? (valorExec / valorTotal * 100).toFixed(1) : "0.0"
        };
      })
      .filter(e => e.despesas > 0)
      .sort((a, b) => b.despesas - a.despesas)
      .slice(0, 5);

    emendasComDespesas.forEach((e, i) => {
      console.log(`   ${i+1}. ${e.numero} (${e.municipio})`);
      console.log(`      Total: ${formatMoeda(e.valorTotal)}`);
      console.log(`      Executado: ${formatMoeda(e.valorExec)} (${e.percentual}%)`);
      console.log(`      Saldo: ${formatMoeda(e.saldo)} | Despesas: ${e.despesas}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
})();
