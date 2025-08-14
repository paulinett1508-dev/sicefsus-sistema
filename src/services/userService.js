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

// 🌐 URL DA ADMIN API
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || "/api/admin";

// 🔥 URL DA CLOUD RUN FUNCTION
const CLOUD_RUN_URL = 'https://sicefsus-delete-user-578597529619.southamerica-east1.run.app';

// 🔧 FUNÇÃO: Chamar Cloud Run
const callCloudRun = async (action, data) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(CLOUD_RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: action,
        ...data
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Cloud Run Error: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ [CLOUD RUN] Erro em ${action}:`, error);
    throw error;
  }
};

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

  try {
    // 🔥 TENTAR CLOUD RUN PRIMEIRO (NOVO)
    try {
      console.log("🔥 [CLOUD RUN] Tentando criar usuário...");
      
      const result = await callCloudRun('createUser', {
        email: userData.email,
        userData: userData
      });
      
      console.log("🎉 [SUCESSO] Usuário criado via Cloud Run");
      return {
        success: result.success,
        method: 'cloud_run',
        uid: result.uid,
        resetLink: result.resetLink,
        mensagem: 'Usuário criado via Cloud Run Admin SDK!'
      };
      
    } catch (cloudRunError) {
      console.warn("⚠️ [FALLBACK] Cloud Run falhou:", cloudRunError.message);
      
      // Se erro é de email existente, não fazer fallback
      if (cloudRunError.message.includes('email-already-exists')) {
        throw {
          codigo: 'auth/email-already-in-use',
          mensagem: 'Este email já está sendo usado. Use a função de exclusão primeiro.',
          detalhes: cloudRunError.message
        };
      }
    }

    // 🔄 TENTAR ADMIN API (MANTER LÓGICA EXISTENTE)
    try {
      const result = await createUserViaAdminAPI(userData);
      console.log("🎉 [SUCESSO] Usuário criado via Admin API");
      return result;
    } catch (adminError) {
      console.warn("⚠️ [FALLBACK] Admin API falhou:", adminError.message);

      // 🔄 FALLBACK FINAL: Método original (MANTER)
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

  try {
    // 🔥 TENTAR CLOUD RUN PRIMEIRO (NOVO)
    if (userUid) {
      try {
        console.log("🔥 [CLOUD RUN] Tentando excluir usuário...");
        
        const result = await callCloudRun('deleteUser', {
          uid: userUid,
          firestoreId: userId
        });
        
        console.log("🎉 [SUCESSO] Usuário excluído via Cloud Run");
        return {
          success: result.success,
          method: 'cloud_run',
          details: result.details,
          message: result.message
        };
        
      } catch (cloudRunError) {
        console.warn("⚠️ [FALLBACK] Cloud Run falhou:", cloudRunError.message);
      }
    }

    // 🔄 TENTAR ADMIN API (MANTER LÓGICA EXISTENTE)
    if (userUid) {
      try {
        const result = await deleteUserViaAdminAPI(userUid);
        console.log("🎉 [SUCESSO] Usuário excluído via Admin API");
        return result;
      } catch (adminError) {
        console.warn("⚠️ [FALLBACK] Admin API falhou:", adminError.message);
      }
    }

    // 🔄 FALLBACK FINAL: Exclusão apenas do Firestore (MANTER)
    console.log("🔄 [FALLBACK] Excluindo apenas do Firestore...");

    await deleteDoc(doc(db, "usuarios", userId));
    console.log("✅ Usuário excluído do Firestore");

    return {
      success: true,
      method: "firestore_only",
      message: "Usuário excluído do Firestore. Auth permanece (requer Admin SDK)",
      warning: "Email ficará bloqueado até exclusão via Admin SDK",
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

// 🔄 FUNÇÃO: Toggle Status via Cloud Run
export const toggleUserStatusCloudRun = async (usuario, newStatus) => {
  try {
    console.log("🔄 [CLOUD RUN] Alterando status...");
    
    const result = await callCloudRun('toggleUserStatus', {
      uid: usuario.uid || usuario.id,
      firestoreId: usuario.id,
      newStatus: newStatus
    });

    return {
      success: result.success,
      method: 'cloud_run',
      details: result.details,
      newStatus: result.newStatus
    };

  } catch (error) {
    console.error("❌ [CLOUD RUN] Erro ao alterar status:", error);
    throw error;
  }
};

// 🔍 FUNÇÃO: Verificar Status via Cloud Run
export const checkUserStatusCloudRun = async (email) => {
  try {
    console.log("🔍 [CLOUD RUN] Verificando status...");
    
    const result = await callCloudRun('checkUserStatus', {
      email: email
    });

    return result;

  } catch (error) {
    console.error("❌ [CLOUD RUN] Erro ao verificar status:", error);
    throw error;
  }
};

// 📋 FUNÇÃO: Carregar Usuários via Cloud Run
export const loadUsersCloudRun = async (limit = 50, offset = 0) => {
  try {
    console.log("📋 [CLOUD RUN] Carregando usuários...");
    
    const result = await callCloudRun('listUsers', {
      limit: limit,
      offset: offset
    });

    return result.usuarios;

  } catch (error) {
    console.error("❌ [CLOUD RUN] Erro ao carregar usuários:", error);
    throw error;
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
  // 🔥 NOVAS FUNÇÕES CLOUD RUN:
  toggleUserStatusCloudRun,
  checkUserStatusCloudRun,
  loadUsersCloudRun,
  callCloudRun
};
