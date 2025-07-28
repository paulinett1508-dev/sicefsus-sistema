
// scripts/cleanAndCreateAdmin.js - Limpar usuários e criar admin
const admin = require('firebase-admin');

// Configuração do Firebase Admin usando as mesmas credenciais
const serviceAccount = {
  type: "service_account",
  project_id: "sicefsus-dev",
  private_key_id: "key_id_placeholder",
  private_key: "-----BEGIN PRIVATE KEY-----\nplaceholder_key\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk@sicefsus-dev.iam.gserviceaccount.com",
  client_id: "client_id_placeholder",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://sicefsus-dev-default-rtdb.firebaseio.com`
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function cleanAllUsers() {
  console.log("🧹 === LIMPANDO TODOS OS USUÁRIOS ===");
  
  try {
    // 1. Limpar Firestore
    console.log("🗑️ Limpando Firestore...");
    const usuariosSnapshot = await db.collection("usuarios").get();
    
    console.log(`📊 Encontrados ${usuariosSnapshot.size} usuários no Firestore`);
    
    const deletePromises = usuariosSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      console.log(`🗑️ Deletando Firestore: ${userData.email} (${userData.nome})`);
      return userDoc.ref.delete();
    });
    
    await Promise.all(deletePromises);
    console.log("✅ Firestore limpo!");

    // 2. Limpar Firebase Auth
    console.log("🔥 Limpando Firebase Auth...");
    let authUsers = [];
    let nextPageToken;
    
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      authUsers = authUsers.concat(listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`📊 Encontrados ${authUsers.length} usuários no Auth`);
    
    for (const user of authUsers) {
      try {
        console.log(`🗑️ Deletando Auth: ${user.email}`);
        await auth.deleteUser(user.uid);
      } catch (error) {
        console.log(`⚠️ Erro ao deletar ${user.email}:`, error.message);
      }
    }
    
    console.log("✅ Firebase Auth limpo!");
    
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
    const userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: adminNome,
      emailVerified: true,
    });
    
    const { uid } = userRecord;
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
    const docRef = await db.collection("usuarios").add(adminData);
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
    
    process.exit(0);
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error.message);
    process.exit(1);
  }
}

// Executar o script
main();
