
// src/services/createAdminUser.js - Criar usuário admin diretamente no Firebase
import { 
  createUserWithEmailAndPassword,
  getAuth 
} from "firebase/auth";
import { 
  collection, 
  addDoc,
  query,
  where,
  getDocs 
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const auth = getAuth();

/**
 * Criar usuário administrador diretamente no Firebase
 * @param {string} email - Email do administrador
 * @param {string} password - Senha do administrador
 * @param {string} nome - Nome do administrador
 */
export const createAdminUser = async (email, password, nome = "Administrador") => {
  console.log("🔧 === CRIAÇÃO DIRETA DE USUÁRIO ADMIN ===");
  console.log("📧 Email:", email);
  
  try {
    // 1. Verificar se email já existe no Firestore
    console.log("🔍 Verificando se email já existe...");
    const q = query(
      collection(db, "usuarios"),
      where("email", "==", email.toLowerCase().trim())
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error(`Email ${email} já está cadastrado no sistema`);
    }
    
    // 2. Criar usuário no Firebase Auth
    console.log("🔥 Criando usuário no Firebase Auth...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    console.log("✅ Usuário criado no Auth:", uid);
    
    // 3. Preparar dados do administrador
    const adminData = {
      // Campos básicos
      uid: uid,
      email: email.toLowerCase().trim(),
      nome: nome.trim(),
      
      // 🔑 CAMPOS CRÍTICOS PARA ADMIN:
      tipo: "admin",        // Campo principal usado pelo backend
      role: "admin",        // Campo usado pelo frontend para compatibilidade
      status: "ativo",      // Status ativo
      
      // 🌍 LOCALIZAÇÃO ADMIN (vazio = acesso total):
      municipio: "",        // Vazio para admin
      uf: "",              // Vazio para admin
      
      // Campos opcionais
      departamento: "",
      telefone: "",
      
      // Controles de acesso
      primeiroAcesso: false,    // Admin não tem primeiro acesso
      senhaTemporaria: false,   // Senha definitiva
      
      // Auditoria
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      criadoPor: "sistema-direto",
      ultimoAcesso: null,
      
      // Observação
      observacao: "Usuário administrador criado diretamente"
    };
    
    // 4. Salvar no Firestore
    console.log("💾 Salvando dados no Firestore...");
    const docRef = await addDoc(collection(db, "usuarios"), adminData);
    console.log("✅ Documento criado:", docRef.id);
    
    console.log("🎉 ADMINISTRADOR CRIADO COM SUCESSO!");
    console.log("👤 Dados:", {
      id: docRef.id,
      uid: uid,
      email: email,
      nome: nome,
      tipo: "admin",
      role: "admin"
    });
    
    return {
      success: true,
      id: docRef.id,
      uid: uid,
      email: email,
      nome: nome,
      message: `Administrador ${nome} criado com sucesso!`
    };
    
  } catch (error) {
    console.error("❌ Erro ao criar administrador:", error);
    
    // Tratar erros específicos do Firebase
    let errorMessage = error.message;
    
    if (error.code) {
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este email já está sendo usado no Firebase Auth";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido";
          break;
        case "auth/weak-password":
          errorMessage = "Senha muito fraca (mínimo 6 caracteres)";
          break;
        default:
          errorMessage = `Erro Firebase: ${error.code}`;
      }
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Função de conveniência para criar admin específico
 */
export const createPaulinetteAdmin = async () => {
  return await createAdminUser(
    "paulinett@live.com", 
    "123456", 
    "Paulinette Administrador"
  );
};
