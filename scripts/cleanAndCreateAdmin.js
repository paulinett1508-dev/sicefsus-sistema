
// scripts/cleanAndCreateAdmin.js - Limpar usuários e criar admin
const { initializeApp } = require("firebase/app");
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  addDoc 
} = require("firebase/firestore");
const { 
  getAuth, 
  createUserWithEmailAndPassword 
} = require("firebase/auth");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9kE_rZXMnb7pJbVj5wuCwjbKqZYp4jnQ",
  authDomain: "sicefsus-dev.firebaseapp.com",
  projectId: "sicefsus-dev",
  storageBucket: "sicefsus-dev.firebasestorage.app",
  messagingSenderId: "537816203988",
  appId: "1:537816203988:web:a123456789abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function cleanAllUsers() {
  console.log("🧹 === LIMPANDO TODOS OS USUÁRIOS ===");
  
  try {
    // Buscar todos os usuários da coleção 'usuarios'
    const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
    
    console.log(`📊 Encontrados ${usuariosSnapshot.size} usuários para deletar`);
    
    // Deletar cada usuário
    const deletePromises = usuariosSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      console.log(`🗑️ Deletando: ${userData.email} (${userData.nome})`);
      return deleteDoc(doc(db, "usuarios", userDoc.id));
    });
    
    await Promise.all(deletePromises);
    console.log("✅ Todos os usuários foram deletados!");
    
  } catch (error) {
    console.error("❌ Erro ao limpar usuários:", error);
    throw error;
  }
}

async function createAdminUser() {
  console.log("👑 === CRIANDO USUÁRIO ADMINISTRADOR ===");
  
  const adminEmail = "paulinett@live.com";
  const adminPassword = "123456";
  const adminNome = "Paulinette Administrador";
  
  try {
    // 1. Criar no Firebase Auth
    console.log("🔥 Criando no Firebase Auth...");
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminEmail, 
      adminPassword
    );
    
    const { uid } = userCredential.user;
    console.log("✅ Criado no Auth com UID:", uid);
    
    // 2. Preparar dados do administrador
    const adminData = {
      // Campos básicos
      uid: uid,
      email: adminEmail.toLowerCase().trim(),
      nome: adminNome,
      
      // 🔑 CAMPOS CRÍTICOS PARA ADMIN:
      tipo: "admin",        // Campo principal usado pelo backend
      role: "admin",        // Campo usado pelo frontend para compatibilidade
      status: "ativo",      // Status ativo
      
      // 🌍 LOCALIZAÇÃO ADMIN (vazio = acesso total):
      municipio: "",        // Vazio para admin
      uf: "",              // Vazio para admin
      
      // Campos opcionais
      departamento: "Administração",
      telefone: "",
      
      // Controles de acesso
      primeiroAcesso: false,    // Admin não tem primeiro acesso
      senhaTemporaria: false,   // Senha definitiva
      
      // Auditoria
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      criadoPor: "sistema-limpeza",
      ultimoAcesso: null,
      
      // Observação
      observacao: "Usuário administrador criado após limpeza do sistema"
    };
    
    // 3. Salvar na coleção 'usuarios'
    console.log("💾 Salvando no Firestore (coleção: usuarios)...");
    const docRef = await addDoc(collection(db, "usuarios"), adminData);
    console.log("✅ Documento criado com ID:", docRef.id);
    
    console.log("🎉 ADMINISTRADOR CRIADO COM SUCESSO!");
    console.log("👤 Dados de login:");
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔐 Senha: ${adminPassword}`);
    console.log(`   👑 Tipo: admin`);
    console.log(`   🆔 UID: ${uid}`);
    console.log(`   📄 Doc ID: ${docRef.id}`);
    
    return {
      success: true,
      uid: uid,
      docId: docRef.id,
      email: adminEmail,
      nome: adminNome
    };
    
  } catch (error) {
    console.error("❌ Erro ao criar administrador:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 === LIMPEZA E CRIAÇÃO DE ADMIN ===");
  console.log("⚠️  ATENÇÃO: Todos os usuários serão deletados!");
  console.log("📊 Coleção utilizada: 'usuarios'");
  console.log("");
  
  try {
    // Passo 1: Limpar todos os usuários
    await cleanAllUsers();
    console.log("");
    
    // Passo 2: Criar novo administrador
    const result = await createAdminUser();
    console.log("");
    
    console.log("🎯 === PROCESSO CONCLUÍDO ===");
    console.log("✅ Sistema limpo e novo administrador criado!");
    console.log("");
    console.log("🔐 CREDENCIAIS DO ADMIN:");
    console.log(`   Email: ${result.email}`);
    console.log(`   Senha: 123456`);
    console.log("");
    console.log("⚡ Agora você pode fazer login no sistema!");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error.message);
    process.exit(1);
  }
}

// Executar o script
main();
