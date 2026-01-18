/**
 * Script: diagnosticar-naturezas-inconsistentes.cjs
 *
 * Verifica naturezas onde o valorExecutado não corresponde
 * à soma das despesas EXECUTADAS vinculadas.
 *
 * Uso:
 *   node scripts/diagnosticar-naturezas-inconsistentes.cjs           # PROD dry-run
 *   node scripts/diagnosticar-naturezas-inconsistentes.cjs --dev     # DEV dry-run
 *   node scripts/diagnosticar-naturezas-inconsistentes.cjs --apply   # PROD aplicar
 *   node scripts/diagnosticar-naturezas-inconsistentes.cjs --dev --apply  # DEV aplicar
 */

const admin = require("firebase-admin");
const path = require("path");

const args = process.argv.slice(2);
const isDev = args.includes("--dev");
const aplicar = args.includes("--apply");

const credentialsPath = isDev
  ? path.join(__dirname, "../firebase-migration/dev-credentials.json")
  : path.join(__dirname, "../firebase-migration/prod-credentials.json");

try {
  const serviceAccount = require(credentialsPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log(`\n🔥 Firebase: ${isDev ? "🟢 DEV" : "🔴 PROD"}`);
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

const db = admin.firestore();

async function diagnosticar() {
  console.log("═".repeat(60));
  console.log("  DIAGNÓSTICO DE NATUREZAS INCONSISTENTES");
  console.log("═".repeat(60));
  console.log(`  Ambiente: ${isDev ? "🟢 DEV" : "🔴 PROD"}`);
  console.log(`  Modo: ${aplicar ? "⚡ APLICAR CORREÇÕES" : "🔍 DRY-RUN"}`);
  console.log("═".repeat(60));

  // 1. Buscar todas as naturezas ativas
  console.log("\n📊 Analisando naturezas...\n");

  const naturezasSnap = await db.collection("naturezas")
    .where("status", "==", "ativo")
    .get();

  const inconsistentes = [];
  const estatisticas = {
    total: naturezasSnap.size,
    analisadas: 0,
    consistentes: 0,
    inconsistentes: 0,
    diferencaTotal: 0
  };

  for (const doc of naturezasSnap.docs) {
    const natureza = doc.data();
    const naturezaId = doc.id;
    estatisticas.analisadas++;

    // Buscar despesas EXECUTADAS vinculadas
    const despesasSnap = await db.collection("despesas")
      .where("naturezaId", "==", naturezaId)
      .get();

    let somaExecutadas = 0;
    let qtdExecutadas = 0;
    let qtdPlanejadas = 0;

    despesasSnap.forEach(despDoc => {
      const d = despDoc.data();
      if (d.status === "EXECUTADA") {
        somaExecutadas += parseFloat(d.valor) || 0;
        qtdExecutadas++;
      } else if (d.status === "PLANEJADA") {
        qtdPlanejadas++;
      }
    });

    const valorExecutadoNatureza = parseFloat(natureza.valorExecutado) || 0;
    const diferenca = Math.abs(somaExecutadas - valorExecutadoNatureza);

    // Considerar inconsistente se diferença > 0.01 (tolerância para arredondamento)
    if (diferenca > 0.01) {
      estatisticas.inconsistentes++;
      estatisticas.diferencaTotal += diferenca;

      // Buscar dados da emenda
      let emendaInfo = "N/A";
      if (natureza.emendaId) {
        const emendaDoc = await db.collection("emendas").doc(natureza.emendaId).get();
        if (emendaDoc.exists) {
          const e = emendaDoc.data();
          emendaInfo = `${e.numero || "s/n"} - ${e.municipio}/${e.uf}`;
        }
      }

      inconsistentes.push({
        id: naturezaId,
        codigo: natureza.codigo,
        descricao: natureza.descricao,
        emendaId: natureza.emendaId,
        emendaInfo,
        valorAlocado: parseFloat(natureza.valorAlocado) || 0,
        valorExecutadoAtual: valorExecutadoNatureza,
        valorExecutadoCorreto: somaExecutadas,
        saldoDisponivelAtual: parseFloat(natureza.saldoDisponivel) || 0,
        diferenca,
        qtdDespesas: despesasSnap.size,
        qtdExecutadas,
        qtdPlanejadas
      });
    } else {
      estatisticas.consistentes++;
    }
  }

  // Relatório
  console.log("📈 RESUMO:");
  console.log(`   Total de naturezas ativas: ${estatisticas.total}`);
  console.log(`   Consistentes: ${estatisticas.consistentes}`);
  console.log(`   Inconsistentes: ${estatisticas.inconsistentes}`);
  console.log(`   Diferença total: R$ ${estatisticas.diferencaTotal.toFixed(2)}`);

  if (inconsistentes.length === 0) {
    console.log("\n✅ Nenhuma inconsistência encontrada!");
    process.exit(0);
  }

  console.log("\n" + "─".repeat(60));
  console.log("📋 NATUREZAS INCONSISTENTES:");
  console.log("─".repeat(60));

  for (const nat of inconsistentes) {
    const saldoCorreto = nat.valorAlocado - nat.valorExecutadoCorreto;

    console.log(`\n  ID: ${nat.id}`);
    console.log(`  Código: ${nat.codigo} | ${nat.descricao}`);
    console.log(`  Emenda: ${nat.emendaInfo}`);
    console.log(`  Despesas: ${nat.qtdDespesas} total (${nat.qtdExecutadas} exec, ${nat.qtdPlanejadas} plan)`);
    console.log(`  valorAlocado: R$ ${nat.valorAlocado.toFixed(2)}`);
    console.log(`  valorExecutado: R$ ${nat.valorExecutadoAtual.toFixed(2)} → R$ ${nat.valorExecutadoCorreto.toFixed(2)}`);
    console.log(`  saldoDisponivel: R$ ${nat.saldoDisponivelAtual.toFixed(2)} → R$ ${saldoCorreto.toFixed(2)}`);
    console.log(`  Diferença: R$ ${nat.diferenca.toFixed(2)}`);
  }

  // Aplicar correções
  if (aplicar) {
    console.log("\n" + "═".repeat(60));
    console.log("⚡ APLICANDO CORREÇÕES...");
    console.log("═".repeat(60));

    const emendasParaRecalcular = new Set();
    let corrigidas = 0;
    let erros = 0;

    for (const nat of inconsistentes) {
      try {
        const valorAlocado = nat.valorAlocado;
        const valorExecutado = nat.valorExecutadoCorreto;
        const saldoDisponivel = valorAlocado - valorExecutado;
        const percentualExecutado = valorAlocado > 0 ? (valorExecutado / valorAlocado) * 100 : 0;

        await db.collection("naturezas").doc(nat.id).update({
          valorExecutado: Math.round(valorExecutado * 100) / 100,
          saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
          percentualExecutado: Math.round(percentualExecutado * 100) / 100,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          recalculadoPor: "script-diagnostico"
        });

        corrigidas++;
        console.log(`  ✅ ${nat.codigo}: ${nat.valorExecutadoAtual} → ${valorExecutado}`);

        if (nat.emendaId) {
          emendasParaRecalcular.add(nat.emendaId);
        }
      } catch (error) {
        erros++;
        console.error(`  ❌ ${nat.codigo}: ${error.message}`);
      }
    }

    // Recalcular emendas afetadas
    if (emendasParaRecalcular.size > 0) {
      console.log(`\n🔄 Recalculando ${emendasParaRecalcular.size} emendas...`);

      for (const emendaId of emendasParaRecalcular) {
        try {
          // Buscar naturezas ativas da emenda
          const natsSnap = await db.collection("naturezas")
            .where("emendaId", "==", emendaId)
            .where("status", "==", "ativo")
            .get();

          let totalAlocado = 0;
          let totalExecutado = 0;

          natsSnap.forEach(doc => {
            const n = doc.data();
            totalAlocado += parseFloat(n.valorAlocado) || 0;
            totalExecutado += parseFloat(n.valorExecutado) || 0;
          });

          const emendaDoc = await db.collection("emendas").doc(emendaId).get();
          if (emendaDoc.exists) {
            const emenda = emendaDoc.data();
            const valorTotal = parseFloat(emenda.valor) || 0;
            const saldoParaNaturezas = valorTotal - totalAlocado;
            const saldoNaoExecutado = valorTotal - totalExecutado;

            await db.collection("emendas").doc(emendaId).update({
              valorAlocado: Math.round(totalAlocado * 100) / 100,
              valorExecutado: Math.round(totalExecutado * 100) / 100,
              saldoParaNaturezas: Math.round(saldoParaNaturezas * 100) / 100,
              saldoNaoExecutado: Math.round(saldoNaoExecutado * 100) / 100,
              saldoLivre: Math.round(saldoParaNaturezas * 100) / 100,
              saldoDisponivel: Math.round(saldoNaoExecutado * 100) / 100,
              percentualExecutado: valorTotal > 0 ? Math.round((totalExecutado / valorTotal) * 10000) / 100 : 0,
              percentualAlocado: valorTotal > 0 ? Math.round((totalAlocado / valorTotal) * 10000) / 100 : 0,
              atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
              recalculadoPor: "script-diagnostico"
            });

            console.log(`  ✅ Emenda ${emenda.numero || emendaId} recalculada`);
          }
        } catch (error) {
          console.error(`  ❌ Emenda ${emendaId}: ${error.message}`);
        }
      }
    }

    console.log("\n" + "─".repeat(60));
    console.log(`  Naturezas corrigidas: ${corrigidas}`);
    console.log(`  Emendas recalculadas: ${emendasParaRecalcular.size}`);
    console.log(`  Erros: ${erros}`);
    console.log("─".repeat(60));
  } else {
    console.log("\n" + "═".repeat(60));
    console.log("🔍 MODO DRY-RUN - Nenhuma alteração foi feita");
    console.log("   Para aplicar correções, execute com --apply");
    console.log("═".repeat(60));
  }
}

diagnosticar().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
