// src/services/userService.js - VERSÃO COM ADMIN SDK ATIVO
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

// ✅ FUNÇÃO: Excluir usuário via Cloud Run Function
export const deleteUserComplete = async (firestoreId, authUid) => {
  try {
    console.log('🔥 Iniciando exclusão via Cloud Run...');
    console.log('📊 Parâmetros:', { firestoreId, authUid });

    // Obter token de autenticação
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const token = await currentUser.getIdToken();
    console.log('✅ Token obtido');

    // Chamar Cloud Run Function
    const response = await fetch('https://sicefsus-delete-user-578597529619.southamerica-east1.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        uid: authUid || firestoreId,
        firestoreId: firestoreId
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log('✅ Resultado Cloud Run:', result);

    return {
      success: result.success,
      method: 'cloud_run',
      details: result.details,
      message: result.message
    };

  } catch (error) {
    console.error('❌ Erro na Cloud Run Function:', error);
    
    // Fallback para método original
    console.log('🔄 Tentando fallback para Firestore apenas...');
    try {
      await deleteDoc(doc(db, "usuarios", firestoreId));
      return {
        success: true,
        method: 'firestore_fallback',
        message: 'Usuário removido apenas do Firestore (Cloud Run falhou)'
      };
    } catch (fallbackError) {
      console.error('❌ Fallback também falhou:', fallbackError);
      throw new Error(`Cloud Run e fallback falharam: ${error.message}`);
    }
  }
};

// 🌐 URL DA ADMIN API
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || "/api/admin";

// 🔧 SEGUNDA INSTÂNCIA FIREBASE (mantida para fallback)
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

// 🎯 FUNÇÃO: Obter token de autenticação
const getAuthToken = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Usuário não autenticado");
    }
    return await currentUser.getIdToken();
  } catch (error) {
    console.error("❌ Erro ao obter token:", error);
    throw error;
  }
};

// 🎯 FUNÇÃO: Excluir usuário via Admin API
const deleteUserViaAdminAPI = async (uid) => {
  try {
    console.log("🗑️ [ADMIN API] Tentando excluir usuário:", uid);

    const token = await getAuthToken();

    const response = await fetch(`${ADMIN_API_URL}/api/admin/users/${uid}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Admin API Error: ${response.status} - ${errorData.message}`,
      );
    }

    const result = await response.json();
    console.log("✅ [ADMIN API] Usuário excluído:", result);

    return {
      success: true,
      method: "admin_api",
      message: "Usuário excluído permanentemente do Auth e Firestore",
      details: result,
    };
  } catch (error) {
    console.error("❌ [ADMIN API] Falha na exclusão:", error);
    throw error;
  }
};

// 🎯 FUNÇÃO: Criar usuário via Admin API
const createUserViaAdminAPI = async (userData) => {
  try {
    console.log("👤 [ADMIN API] Tentando criar usuário:", userData.email);

    const token = await getAuthToken();

    const response = await fetch(`${ADMIN_API_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: userData.email,
        nome: userData.nome,
        role: userData.role,
        municipio: userData.municipio,
        uf: userData.uf,
        departamento: userData.departamento,
        telefone: userData.telefone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Admin API Error: ${response.status} - ${errorData.message}`,
      );
    }

    const result = await response.json();
    console.log("✅ [ADMIN API] Usuário criado:", result);

    return {
      success: true,
      method: "admin_api",
      uid: result.user.uid,
      senhaTemporaria: result.user.senhaTemporaria,
      resetLink: result.user.resetLink,
      mensagem: `Usuário criado via Admin API! Senha temporária: ${result.user.senhaTemporaria}`,
    };
  } catch (error) {
    console.error("❌ [ADMIN API] Falha na criação:", error);
    throw error;
  }
};

// 🎯 FUNÇÃO: Reset de senha via Admin API
const resetPasswordViaAdminAPI = async (uid) => {
  try {
    console.log("🔐 [ADMIN API] Tentando reset de senha:", uid);

    const token = await getAuthToken();

    const response = await fetch(
      `${ADMIN_API_URL}/api/admin/users/${uid}/reset-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Admin API Error: ${response.status} - ${errorData.message}`,
      );
    }

    const result = await response.json();
    console.log("✅ [ADMIN API] Reset realizado:", result);

    return {
      success: true,
      method: "admin_api",
      message: "Link de reset gerado via Admin API",
      resetLink: result.resetLink,
    };
  } catch (error) {
    console.error("❌ [ADMIN API] Falha no reset:", error);
    throw error;
  }
};

// 🎯 FUNÇÃO PRINCIPAL: Criar usuário com fallback automático
export const createUser = async (userData, options = {}) => {
  console.log("👤 === CRIAÇÃO DE USUÁRIO UNIVERSAL ===");
  console.log("📊 Dados:", userData);
  console.log("🌐 Admin API URL:", ADMIN_API_URL);

  try {
    // 🔄 TENTAR ADMIN API PRIMEIRO
    try {
      const result = await createUserViaAdminAPI(userData);
      console.log("🎉 [SUCESSO] Usuário criado via Admin API");
      return result;
    } catch (adminError) {
      console.warn(
        "⚠️ [FALLBACK] Admin API falhou, usando método original:",
        adminError.message,
      );

      // 🔄 FALLBACK: Método original
      return await createUserInFirebase(
        userData,
        options.navigate,
        options.showToast,
      );
    }
  } catch (error) {
    console.error("❌ Erro total na criação:", error);
    throw error;
  }
};

// 🎯 FUNÇÃO PRINCIPAL: Excluir usuário com fallback automático
export const deleteUserById = async (userId, userUid) => {
  console.log("🗑️ === EXCLUSÃO DE USUÁRIO UNIVERSAL ===");
  console.log("📊 Dados:", { userId, userUid });
  console.log("🌐 Admin API URL:", ADMIN_API_URL);

  try {
    // 🔄 TENTAR ADMIN API PRIMEIRO (exclusão completa)
    if (userUid) {
      try {
        const result = await deleteUserViaAdminAPI(userUid);
        console.log("🎉 [SUCESSO] Usuário excluído via Admin API");
        return result;
      } catch (adminError) {
        console.warn(
          "⚠️ [FALLBACK] Admin API falhou, usando método original:",
          adminError.message,
        );
      }
    }

    // 🔄 FALLBACK: Exclusão apenas do Firestore
    console.log("🔄 [FALLBACK] Excluindo apenas do Firestore...");

    await deleteDoc(doc(db, "usuarios", userId));
    console.log("✅ Usuário excluído do Firestore");

    return {
      success: true,
      method: "firestore_only",
      message:
        "Usuário excluído do Firestore. Auth permanece (requer Admin API)",
      warning: "Email ficará bloqueado até exclusão via Admin API",
    };
  } catch (error) {
    console.error("❌ Erro na exclusão:", error);
    throw new Error("Erro ao excluir usuário: " + error.message);
  }
};

// 🎯 FUNÇÃO: Reset de senha com fallback
export const sendPasswordReset = async (email, uid = null) => {
  console.log("🔐 === RESET DE SENHA UNIVERSAL ===");
  console.log("📊 Dados:", { email, uid });
  console.log("🌐 Admin API URL:", ADMIN_API_URL);

  try {
    // 🔄 TENTAR ADMIN API PRIMEIRO (se tiver UID)
    if (uid) {
      try {
        const result = await resetPasswordViaAdminAPI(uid);
        console.log("🎉 [SUCESSO] Reset via Admin API");
        return result;
      } catch (adminError) {
        console.warn(
          "⚠️ [FALLBACK] Admin API falhou, usando método original:",
          adminError.message,
        );
      }
    }

    // 🔄 FALLBACK: Método original
    console.log("🔄 [FALLBACK] Reset via Firebase Auth...");
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Reset via Firebase Auth");

    return {
      success: true,
      method: "firebase_auth",
      message: "Email de redefinição enviado com sucesso!",
    };
  } catch (error) {
    console.error("❌ Erro no reset:", error);
    throw new Error("Erro ao enviar email de redefinição: " + error.message);
  }
};

// 🎯 FUNÇÃO ORIGINAL: Criar usuário (fallback)
export const createUserInFirebase = async (userData, navigate, showToast) => {
  let userCredential = null;

  try {
    console.log("🔄 [FALLBACK] Criando via Firebase diretamente...");

    const senhaTemporaria = Math.random().toString(36).slice(-8);

    userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      userData.email.trim(),
      senhaTemporaria,
    );

    console.log("✅ Usuário criado no Firebase Auth:", userCredential.user.uid);

    await signOut(secondaryAuth);
    console.log("✅ Usuário deslogado da instância secundária");

    const userDoc = {
      uid: userCredential.user.uid,
      email: userData.email,
      nome: userData.nome,
      tipo: userData.role || "operador",
      status: "ativo",
      departamento: userData.departamento || "",
      telefone: userData.telefone || "",
      municipio: userData.role === "admin" ? "" : userData.municipio || "",
      uf: userData.role === "admin" ? "" : userData.uf || "",
      ativo: true,
      primeiroAcesso: true,
      ultimoAcesso: null,
      criadoEm: serverTimestamp(),
      dataAtualizacao: serverTimestamp(),
      senhaTemporaria: senhaTemporaria,
      primeiroLogin: true,
    };

    await setDoc(doc(db, "usuarios", userCredential.user.uid), userDoc);
    console.log("✅ Dados salvos no Firestore");

    await sendPasswordResetEmail(auth, userData.email.trim());
    console.log("✅ Email de configuração enviado");

    if (showToast) {
      showToast({
        tipo: "sucesso",
        titulo: "✅ Usuário Criado (Fallback)!",
        mensagem: `Usuário ${userData.nome} criado! Senha temporária: ${senhaTemporaria}`,
        duracao: 8000,
      });
    }

    return {
      success: true,
      method: "firebase_fallback",
      uid: userCredential.user.uid,
      senhaTemporaria: senhaTemporaria,
      mensagem: `Usuário criado via fallback! Senha temporária: ${senhaTemporaria}`,
    };
  } catch (error) {
    console.error("❌ Erro no fallback:", error);

    if (userCredential) {
      try {
        await signOut(secondaryAuth);
      } catch (signOutError) {
        console.error("❌ Erro adicional no signOut:", signOutError);
      }
    }

    throw {
      codigo: error.code,
      mensagem: getErrorMessage(error),
      detalhes: error.message,
    };
  }
};

// 🎯 FUNÇÃO: Mensagens de erro
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

// 🎯 OUTRAS FUNÇÕES (mantidas iguais)
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

export default {
  createUser,
  createUserInFirebase,
  updateUser,
  deleteUserById,
  sendPasswordReset,
  checkAuthState,
  logoutUser,
};
