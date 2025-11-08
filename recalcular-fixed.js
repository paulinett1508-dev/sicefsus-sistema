// recalcular-fixed.js - COM DOTENV
import "dotenv/config";
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

// Carregar credenciais do .env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log("🔍 Verificando credenciais...");
console.log("   Project ID:", firebaseConfig.projectId);
console.log("   Auth Domain:", firebaseConfig.authDomain);

if (!firebaseConfig.projectId) {
  console.error("\n❌ ERRO: Variáveis de ambiente não carregadas!");
  console.error("   Verifique se o arquivo .env existe e contém:");
  console.error("   VITE_FIREBASE_PROJECT_ID=...");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function recalcular() {
  const EMENDA_ID = "7MXuX8veyPeL54igKbbW";

  console.log("\n🔧 Recalculando emenda 30460003...\n");

  try {
    // Buscar emenda
    const emendaSnap = await getDoc(doc(db, "emendas", EMENDA_ID));

    if (!emendaSnap.exists()) {
      console.error("❌ Emenda não encontrada!");
      return;
    }

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
        `   - ${doc.data().discriminacao}: R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigals: 2 })}`,
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
    console.error(error);
  }
}

recalcular();
