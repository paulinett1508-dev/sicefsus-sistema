// recalcular.js - Corrige valores corrompidos da emenda 30460003
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

async function recalcular() {
  const EMENDA_ID = "7MXuX8veyPeL54igKbbW";

  console.log("🔧 Recalculando emenda 30460003...\n");

  try {
    // Buscar emenda
    const emendaSnap = await getDoc(doc(db, "emendas", EMENDA_ID));
    const emenda = emendaSnap.data();
    const valorTotal = emenda.valorRecurso || emenda.valor || 0;

    console.log(
      "📋 Valor Total: R$",
      valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    );

    // Buscar despesas
    const despesasSnap = await getDocs(
      query(collection(db, "despesas"), where("emendaId", "==", EMENDA_ID)),
    );

    console.log(`💰 Total de despesas: ${despesasSnap.size}\n`);

    let totalDespesas = 0;
    despesasSnap.forEach((doc) => {
      const valor = doc.data().valor || 0;
      totalDespesas += valor;
      console.log(
        `   - ${doc.data().discriminacao}: R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      );
    });

    const saldo = valorTotal - totalDespesas;
    const percentual = (totalDespesas / valorTotal) * 100;

    console.log(
      `\n✅ Total Despesas: R$ ${totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(
      `✅ Saldo: R$ ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(`✅ Percentual: ${percentual.toFixed(1)}%\n`);

    // Atualizar Firebase
    console.log("🔄 Atualizando Firebase...");
    await updateDoc(doc(db, "emendas", EMENDA_ID), {
      valorExecutado: totalDespesas,
      saldoDisponivel: saldo,
      percentualExecutado: percentual,
      atualizadoEm: new Date(),
    });

    console.log("✅ Emenda atualizada com sucesso!");
    console.log("\n🎯 Próximos passos:");
    console.log("   1. Vá para a página de emendas");
    console.log("   2. Force refresh: Ctrl+Shift+R");
    console.log("   3. Verifique se os valores aparecem corretos");
  } catch (error) {
    console.error("\n❌ ERRO:", error.message);
  }
}

recalcular();
