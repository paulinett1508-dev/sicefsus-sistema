// src/services/userService.js - VERSÃO CORRIGIDA COM SEGUNDA INSTÂNCIA FIREBASE
import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { db, auth } from "../firebase/firebaseConfig";

// 🔧 SOLUÇÃO: Segunda instância Firebase para criar usuários sem afetar admin
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const secondaryApp = initializeApp(firebaseConfig, "secondary");
const secondaryAuth = getAuth(secondaryApp);

// 🎯 FUNÇÃO CORRIGIDA: Criar usuário SEM deslogar admin
export const createUserInFirebase = async (userData, navigate, showToast) => {
  let userCredential = null;

  try {
    console.log("🔄 Iniciando criação de usuário...");

    // 1. Gerar senha temporária
    const senhaTemporaria = Math.random().toString(36).slice(-8);

    // 2. ✅ CORREÇÃO: Usar instância secundária - admin não é afetado
    console.log(
      "📧 Criando usuário na instância secundária (admin preservado)...",
    );

    userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      userData.email.trim(),
      senhaTemporaria,
    );

    console.log("✅ Usuário criado no Firebase Auth:", userCredential.user.uid);

    // 3. ✅ IMPORTANTE: Deslogar apenas da instância secundária
    await signOut(secondaryAuth);
    console.log(
      "✅ Usuário deslogado da instância secundária (admin preservado)",
    );

    // 4. ✅ CORREÇÃO: Salvar dados com estrutura COMPLETA igual ao admin
    const userDoc = {
      uid: userCredential.user.uid,
      email: userData.email,
      nome: userData.nome,
      tipo: userData.tipo || "operador",
      status: "ativo",
      departamento: userData.departamento || "",
      telefone: userData.telefone || "",
      municipio: userData.tipo === "admin" ? "" : userData.municipio || "",
      uf: userData.tipo === "admin" ? "" : userData.uf || "",

      // ✅ CAMPOS OBRIGATÓRIOS DO SISTEMA
      ativo: true,
      primeiroAcesso: true,
      ultimoAcesso: null,
      ultimo_acesso: null,

      // ✅ TIMESTAMPS PADRONIZADOS
      criadoEm: serverTimestamp(),
      data_criacao: serverTimestamp(),
      dataAtualizacao: serverTimestamp(),
      data_atualizacao: serverTimestamp(),

      // ✅ CONFIGURAÇÕES PADRÃO
      configuracoes: {
        idioma: "pt-BR",
        tema: "light",
        timezone: "America/Sao_Paulo",
        notificacoes_email: true,
      },

      // ✅ PERMISSÕES BASEADAS NO TIPO
      permissoes:
        userData.tipo === "admin"
          ? {
              // Permissões de administrador
              criar_emenda: true,
              editar_emenda: true,
              excluir_emenda: true,
              criar_despesa: true,
              editar_despesa: true,
              excluir_despesa: true,
              criar_usuario: true,
              editar_usuario: true,
              desativar_usuario: true,
              gerenciar_usuarios: true,
              acessar_relatorios: true,
              relatorios_avancados: true,
              visualizar_auditoria: true,
              visualizar_todas_emendas: true,
              visualizar_todas_despesas: true,
              configurar_sistema: true,
              backup_dados: true,
              exportar_dados: true,
            }
          : {
              // Permissões de operador
              criar_emenda: false,
              editar_emenda: false,
              excluir_emenda: false,
              criar_despesa: true,
              editar_despesa: true,
              excluir_despesa: false,
              criar_usuario: false,
              editar_usuario: false,
              desativar_usuario: false,
              gerenciar_usuarios: false,
              acessar_relatorios: true,
              relatorios_avancados: false,
              visualizar_auditoria: false,
              visualizar_todas_emendas: false,
              visualizar_todas_despesas: false,
              configurar_sistema: false,
              backup_dados: false,
              exportar_dados: false,
            },

      // ✅ CAMPOS TEMPORÁRIOS
      senhaTemporaria: senhaTemporaria,
      primeiroLogin: true,
    };

    // ✅ USAR setDoc com UID como ID do documento
    await setDoc(doc(db, "usuarios", userCredential.user.uid), userDoc);
    console.log(
      "✅ Dados do usuário salvos no Firestore com estrutura completa:",
      userCredential.user.uid,
    );

    // 5. ✅ CORREÇÃO: Enviar email de configuração inicial (não reset)
    console.log("📨 Enviando email de configuração inicial...");
    await sendPasswordResetEmail(auth, userData.email.trim());
    console.log("✅ Email de configuração enviado");

    // 6. ✅ ALTERNATIVA: Mostrar senha temporária para admin
    if (showToast) {
      showToast({
        tipo: "sucesso",
        titulo: "✅ Usuário Criado!",
        mensagem: `Usuário ${userData.nome} criado! Senha temporária: ${senhaTemporaria}`,
        duracao: 8000, // Mais tempo para copiar senha
      });
    }

    return {
      sucesso: true,
      adminPreserved: true,
      uid: userCredential.user.uid,
      senhaTemporaria: senhaTemporaria, // ✅ INCLUIR senha para o admin ver
      mensagem: `Usuário criado! Senha temporária: ${senhaTemporaria}`,
    };
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);

    // Se houver erro, tentar fazer logout da instância secundária
    try {
      await signOut(secondaryAuth);
    } catch (signOutError) {
      console.error("❌ Erro adicional no signOut secundário:", signOutError);
    }

    throw {
      codigo: error.code,
      mensagem: getErrorMessage(error),
      detalhes: error.message,
    };
  }
};

// 🎯 FUNÇÃO AUXILIAR: Melhorar mensagens de erro
const getErrorMessage = (error) => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Este email já está sendo usado por outro usuário";
    case "auth/invalid-email":
      return "Email inválido";
    case "auth/weak-password":
      return "Senha muito fraca";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet";
    default:
      return "Erro ao criar usuário. Tente novamente.";
  }
};

// 🎯 WRAPPER FUNCTION: Para compatibilidade com código existente
export const createUser = async (userData, options = {}) => {
  const { navigate, showToast } = options;
  return await createUserInFirebase(userData, navigate, showToast);
};

// 🎯 FUNÇÃO PARA VERIFICAR STATUS DA SESSÃO
export const checkAuthState = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve({
        isLoggedIn: !!user,
        user: user,
        timestamp: new Date().toISOString(),
      });
    });
  });
};

// 🎯 FUNÇÃO PARA LOGOUT MANUAL
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("✅ Logout realizado com sucesso");
    return { sucesso: true };
  } catch (error) {
    console.error("❌ Erro no logout:", error);
    throw error;
  }
};

// ✅ FUNÇÃO PARA ATUALIZAR USUÁRIO
export const updateUser = async (userId, userData, originalEmail) => {
  try {
    console.log("✏️ Atualizando usuário:", userId, userData);

    const userRef = doc(db, "usuarios", userId);
    const updateData = {
      nome: userData.nome,
      tipo: userData.role === "admin" ? "admin" : "operador",
      status: userData.status || "ativo",
      departamento: userData.departamento || "",
      telefone: userData.telefone || "",
      municipio: userData.role === "admin" ? "" : userData.municipio || "",
      uf: userData.role === "admin" ? "" : userData.uf || "",
      dataAtualizacao: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);
    console.log("✅ Usuário atualizado com sucesso");

    return {
      success: true,
      message: "Usuário atualizado com sucesso!",
    };
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário: " + error.message);
  }
};

// ✅ FUNÇÃO CORRIGIDA PARA EXCLUIR USUÁRIO COMPLETAMENTE
export const deleteUserById = async (userId, userUid) => {
  try {
    console.log("🗑️ Excluindo usuário completo:", { userId, userUid });

    // 1. EXCLUIR do Firestore primeiro
    const userRef = doc(db, "usuarios", userId);
    await deleteDoc(userRef);
    console.log("✅ Usuário excluído do Firestore");

    // 2. EXCLUIR do Firebase Auth usando Admin SDK (simulação)
    // ⚠️ NOTA: Para produção real, isso deve ser feito no backend
    // Por enquanto, apenas removemos do Firestore
    console.log("⚠️ Exclusão do Firebase Auth deve ser implementada no backend");
    console.log("🔧 UID para exclusão do Auth:", userUid);

    return {
      success: true,
      message: "Usuário excluído do sistema (Firestore). Auth requer backend.",
      details: {
        firestoreDeleted: true,
        authDeleteRequired: true,
        uid: userUid
      }
    };
  } catch (error) {
    console.error("❌ Erro ao excluir usuário:", error);
    throw new Error("Erro ao excluir usuário: " + error.message);
  }
};

// ✅ FUNÇÃO PARA RESETAR SENHA
export const sendPasswordReset = async (email) => {
  try {
    console.log("📨 Enviando reset de senha para:", email);

    // Usar a instância principal de auth para enviar email
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Email de reset enviado");

    return {
      success: true,
      message: "Email de redefinição enviado com sucesso!",
    };
  } catch (error) {
    console.error("❌ Erro ao enviar reset:", error);
    throw new Error("Erro ao enviar email de redefinição: " + error.message);
  }
};

export default {
  createUser,
  createUserInFirebase,
  updateUser,
  deleteUserById,
  sendPasswordReset,
  checkAuthState,
  logoutUser,
};
