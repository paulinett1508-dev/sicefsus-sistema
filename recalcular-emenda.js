// recalcular-emenda.js
// Recalcula valorExecutado e saldoDisponivel baseado nas despesas REAIS

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EMENDA_ID = "7MXuX8veyPeL54igKbbW"; // Emenda 30460003

async function recalcularEmenda() {
  console.log("\n🔧 RECALCULANDO EMENDA 30460003\n");

  try {
    // 1. Buscar emenda
    const emendaRef = doc(db, "emendas", EMENDA_ID);
    const emendaSnap = await getDoc(emendaRef);

    if (!emendaSnap.exists()) {
      console.error("❌ Emenda não encontrada!");
      return;
    }

    const emenda = emendaSnap.data();
    const valorTotal = emenda.valorRecurso || emenda.valor || 0;

    console.log("📋 DADOS ATUAIS DA EMENDA:");
    console.log(`   Número: ${emenda.numero}`);
    console.log(
      `   Valor Total: R$ ${valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(
      `   Valor Executado (campo): R$ ${(emenda.valorExecutado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(
      `   Saldo Disponível (campo): R$ ${(emenda.saldoDisponivel || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );

    // 2. Buscar despesas vinculadas
    const q = query(
      collection(db, "despesas"),
      where("emendaId", "==", EMENDA_ID),
    );

    const despesasSnap = await getDocs(q);
    console.log(`\n💰 DESPESAS VINCULADAS: ${despesasSnap.size}`);

    // 3. Somar despesas REAIS
    let totalDespesas = 0;
    despesasSnap.forEach((doc) => {
      const despesa = doc.data();
      totalDespesas += despesa.valor || 0;
      console.log(
        `   - ${despesa.discriminacao || "N/A"}: R$ ${(despesa.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      );
    });

    console.log(
      `\n   TOTAL: R$ ${totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );

    // 4. Calcular valores corretos
    const valorExecutadoCorreto = totalDespesas;
    const saldoDisponivelCorreto = valorTotal - totalDespesas;
    const percentualExecutado = (valorExecutadoCorreto / valorTotal) * 100;

    console.log("\n✅ VALORES RECALCULADOS:");
    console.log(
      `   Valor Executado: R$ ${valorExecutadoCorreto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(
      `   Saldo Disponível: R$ ${saldoDisponivelCorreto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(`   Percentual: ${percentualExecutado.toFixed(1)}%`);

    // 5. Atualizar Firebase
    console.log("\n🔄 Atualizando Firebase...");
    await updateDoc(emendaRef, {
      valorExecutado: valorExecutadoCorreto,
      saldoDisponivel: saldoDisponivelCorreto,
      percentualExecutado: percentualExecutado,
      atualizadoEm: new Date(),
      recalculadoAutomaticamente: true,
    });

    console.log("✅ Emenda atualizada com sucesso!");
    console.log("\n🎯 Próximos passos:");
    console.log("   1. Recarregue a página de emendas");
    console.log("   2. Force refresh: Ctrl+Shift+R");
    console.log("   3. Verifique se os valores agora aparecem corretos");
  } catch (error) {
    console.error("\n❌ ERRO:", error);
  }
}

recalcularEmenda();
