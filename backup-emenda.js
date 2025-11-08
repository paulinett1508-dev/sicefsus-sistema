// backup-emenda.js
// Cria backup em JSON da emenda e suas despesas ANTES de qualquer alteração

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { writeFileSync } from "fs";

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

const EMENDA_ID = "7MXuX8veyPeL54igKbbW";

async function criarBackup() {
  console.log("\n💾 CRIANDO BACKUP DA EMENDA 30460003\n");

  try {
    // 1. Buscar emenda
    const emendaRef = doc(db, "emendas", EMENDA_ID);
    const emendaSnap = await getDoc(emendaRef);

    if (!emendaSnap.exists()) {
      console.error("❌ Emenda não encontrada!");
      return;
    }

    const emendaData = {
      id: emendaSnap.id,
      ...emendaSnap.data(),
    };

    // 2. Buscar despesas
    const q = query(
      collection(db, "despesas"),
      where("emendaId", "==", EMENDA_ID),
    );

    const despesasSnap = await getDocs(q);
    const despesasData = [];

    despesasSnap.forEach((doc) => {
      despesasData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // 3. Criar objeto de backup
    const backup = {
      dataBackup: new Date().toISOString(),
      motivo: "Backup antes de recalcular valores corrompidos",
      emenda: emendaData,
      despesas: despesasData,
      resumo: {
        numeroEmenda: emendaData.numero,
        valorTotal: emendaData.valorRecurso || emendaData.valor,
        valorExecutadoAntigo: emendaData.valorExecutado,
        saldoDisponivelAntigo: emendaData.saldoDisponivel,
        totalDespesas: despesasData.length,
        somaDespesas: despesasData.reduce((sum, d) => sum + (d.valor || 0), 0),
      },
    };

    // 4. Salvar em arquivo JSON
    const filename = `backup-emenda-30460003-${Date.now()}.json`;
    writeFileSync(filename, JSON.stringify(backup, null, 2));

    console.log("✅ Backup criado com sucesso!");
    console.log(`📁 Arquivo: ${filename}`);
    console.log("\n📊 RESUMO DO BACKUP:");
    console.log(`   Emenda: ${backup.resumo.numeroEmenda}`);
    console.log(
      `   Valor Total: R$ ${backup.resumo.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(
      `   Valor Executado (campo): R$ ${(backup.resumo.valorExecutadoAntigo || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(
      `   Saldo Disponível (campo): R$ ${(backup.resumo.saldoDisponivelAntigo || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
    console.log(`   Total de Despesas: ${backup.resumo.totalDespesas}`);
    console.log(
      `   Soma Real das Despesas: R$ ${backup.resumo.somaDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );

    console.log(
      "\n✅ Backup salvo! Agora você pode executar o script de recálculo com segurança.",
    );
    console.log(
      "💡 Para restaurar, use este arquivo JSON no Firebase Console.",
    );
  } catch (error) {
    console.error("\n❌ ERRO:", error);
  }
}

criarBackup();
