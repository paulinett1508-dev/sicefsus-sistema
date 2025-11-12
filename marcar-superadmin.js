// marcar-superadmin.js
// Script ÚNICO para definir paulinett1508@gmail.com como SuperAdmin
// ⚠️ EXECUTAR APENAS UMA VEZ

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8u0BQtubMpzrzAKG3uOqHTJlAKuBxmvg",
  authDomain: "emendas-parlamentares-60dbd.firebaseapp.com",
  projectId: "emendas-parlamentares-60dbd",
  storageBucket: "emendas-parlamentares-60dbd.firebasestorage.app",
  messagingSenderId: "685589881395",
  appId: "1:685589881395:web:f81b1a22b4e25d0baa45de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function marcarSuperAdmin(email) {
  try {
    console.log(`🔍 Procurando usuário: ${email}...`);

    // Buscar usuário pelo email
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error('❌ Usuário não encontrado!');
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    console.log('✅ Usuário encontrado:', userDoc.id);
    console.log('📋 Dados atuais:', userDoc.data());

    // Atualizar para SuperAdmin
    await updateDoc(doc(db, 'usuarios', userDoc.id), {
      superAdmin: true,
      tipo: 'admin',
      status: 'ativo'
    });

    console.log('✅ Usuário marcado como SuperAdmin com sucesso!');
    console.log('🔄 Faça logout e login novamente para aplicar as mudanças');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Execute com: node marcar-superadmin.js
marcarSuperAdmin('paulinett1508@gmail.com');