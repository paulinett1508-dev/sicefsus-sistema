// marcar-superadmin.js
// Script ÚNICO para definir paulinett1508@gmail.com como SuperAdmin
// ⚠️ EXECUTAR APENAS UMA VEZ

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
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

async function marcarSuperAdmin() {
  const EMAIL_SUPERADMIN = "paulinett1508@gmail.com";

  console.log("\n👑 MARCANDO SUPERADMIN\n");
  console.log("=".repeat(60));

  try {
    // Buscar usuário pelo email
    const q = query(
      collection(db, "usuarios"),
      where("email", "==", EMAIL_SUPERADMIN),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error(`\n❌ ERRO: Usuário ${EMAIL_SUPERADMIN} não encontrado!`);
      console.log("\n💡 Certifique-se de que:");
      console.log("   1. O usuário está cadastrado no sistema");
      console.log("   2. O email está escrito corretamente");
      console.log("   3. O usuário já fez login ao menos uma vez");
      return;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log("\n📋 USUÁRIO ENCONTRADO:");
    console.log(`   ID: ${userDoc.id}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Nome: ${userData.nome || "N/A"}`);
    console.log(`   Tipo Atual: ${userData.tipo || "N/A"}`);
    console.log(`   SuperAdmin Atual: ${userData.superAdmin || false}`);

    // Verificar se já é SuperAdmin
    if (userData.superAdmin === true && userData.tipo === "admin") {
      console.log(
        "\n✅ Usuário JÁ é SuperAdmin! Nenhuma alteração necessária.",
      );
      return;
    }

    // Atualizar para SuperAdmin
    console.log("\n🔄 Aplicando alterações...");

    await updateDoc(doc(db, "usuarios", userDoc.id), {
      tipo: "admin", // Garante que é admin
      superAdmin: true, // Marca como SuperAdmin
      superAdminDesde: new Date().toISOString(),
      atualizadoEm: new Date(),
    });

    console.log("\n✅ SUCESSO!");
    console.log("\n👑 O usuário agora é SuperAdmin!");
    console.log("\n📋 Novas permissões:");
    console.log("   ✅ Acesso total de Admin");
    console.log("   ✅ Acesso a Ferramentas de Desenvolvedor");
    console.log("   ✅ Recalcular emendas");
    console.log("   ✅ Diagnosticar sistema");
    console.log("\n🔐 IMPORTANTE:");
    console.log("   - Este status NÃO pode ser alterado pela interface");
    console.log("   - Apenas via Firebase Console ou script");
    console.log("   - Protegido pelas Firestore Rules");

    console.log("\n🎯 Próximos passos:");
    console.log("   1. O usuário deve fazer logout e login novamente");
    console.log("   2. O menu 'Ferramentas Dev' aparecerá na sidebar");
    console.log("   3. Todas as funcionalidades estarão disponíveis");
  } catch (error) {
    console.error("\n❌ ERRO:", error.message);
    console.error(error);
  }
}

console.log("\n⚠️  ATENÇÃO:");
console.log("   Este script marca um usuário como SuperAdmin.");
console.log("   SuperAdmins têm acesso total às ferramentas de manutenção.");
console.log("   Execute apenas se tiver certeza!\n");

marcarSuperAdmin();
