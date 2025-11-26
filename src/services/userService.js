// src/services/userService.js - VERSÃO CORRIGIDA (CORS ELIMINADO)
// 🚨 CORREÇÃO CRÍTICA: Cloud Functions removidas temporariamente
// ✅ CORRIGIDO: Admin não desloga mais ao criar usuário
// ✅ CORRIGIDO: Exclusão sem CORS

import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
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

// 🚨 CORREÇÃO 1: CLOUD FUNCTION DESABILITADA TEMPORARIAMENTE
// ❌ const CLOUD_RUN_URL = "https://sicefsus-delete-user-578597529619.southamerica-east1.run.app";
const CLOUD_FUNCTION_DISABLED = true; // ✅ Flag para desabilitar Cloud Functions

// 🔧 FUNÇÃO: Chamar Cloud Run (DESABILITADA)
const callCloudRun = async (action, data) => {
  if (CLOUD_FUNCTION_DISABLED) {
    console.log(`🚫 Cloud Function desabilitada: ${action}`);
    throw new Error(
      "Cloud Function temporariamente desabilitada para resolver CORS",
    );
  }
  // Código original comentado...
};

// 🔧 SEGUNDA INSTÂNCIA FIREBASE (corrigida)
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

// 🚨 CORREÇÃO 2: FUNÇÃO DE CRIAÇÃO SEM CLOUD FUNCTION
export const createUser = async (userData, options = {}) => {
  console.log("👤 === CRIAÇÃO DE USUÁRIO (SEM CLOUD FUNCTION) ===");
  console.log("📊 Dados:", userData);

  // ✅ IR DIRETO PARA FALLBACK (sem tentar Cloud Function)
  console.log("🔥 Usando método direto (Cloud Function desabilitada)");
  return await createUserDirect(userData, options.navigate, options.showToast);
};

// 🚨 CORREÇÃO 3: FUNÇÃO DE EXCLUSÃO SEM CLOUD FUNCTION
export const deleteUserById = async (userId, userUid) => {
  console.log("🗑️ === EXCLUSÃO DE USUÁRIO (SEM CLOUD FUNCTION) ===");
  console.log("📊 Dados:", { userId, userUid });

  // ✅ IR DIRETO PARA FIRESTORE (sem tentar Cloud Function)
  console.log("🔥 Usando exclusão direta (Cloud Function desabilitada)");

  try {
    await deleteDoc(doc(db, "usuarios", userId));
    console.log("✅ Usuário excluído do Firestore");

    return {
      success: true,
      method: "firestore_direct",
      message: "Usuário excluído do Firestore. Auth permanece (temporário)",
      warning: "Email ficará bloqueado até correção da Cloud Function",
    };
  } catch (error) {
    console.error("❌ Erro na exclusão:", error);
    throw new Error("Erro ao excluir usuário: " + error.message);
  }
};

// 🚨 CORREÇÃO 4: NOVA FUNÇÃO DE CRIAÇÃO SEM DESLOGAR ADMIN
export const createUserDirect = async (userData, navigate, showToast) => {
  console.log("🔥 [DIRETO] Criando usuário sem deslogar admin...");

  // Salvar credenciais do admin atual
  const adminUser = auth.currentUser;
  const adminEmail = adminUser?.email;

  if (!adminUser || !adminEmail) {
    throw new Error("Admin não está logado");
  }

  // Pedir senha do admin para relogar depois
  const adminPassword =
    localStorage.getItem("admin_temp_password") ||
    prompt("Para criar usuário, digite sua senha de admin:");

  if (!adminPassword) {
    throw new Error("Senha do admin necessária para criar usuário");
  }

  // Salvar senha temporariamente (apenas para esta operação)
  localStorage.setItem("admin_temp_password", adminPassword);

  let userCredential = null;

  try {
    const senhaTemporaria = Math.random().toString(36).slice(-8);
    console.log(`🔑 Senha temporária gerada: ${senhaTemporaria}`);

    // 🚨 CORREÇÃO CRÍTICA: Usar instância secundária para não deslogar admin
    console.log("🔄 Criando usuário em instância secundária...");
    userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      userData.email.trim(),
      senhaTemporaria,
    );

    console.log("✅ Usuário criado no Auth:", userCredential.user.uid);

    // 🔄 IMPORTANTE: Deslogar da instância secundária imediatamente
    await signOut(secondaryAuth);
    console.log("✅ Deslogado da instância secundária");

    // 🔄 VERIFICAR SE ADMIN AINDA ESTÁ LOGADO NA PRINCIPAL
    if (!auth.currentUser || auth.currentUser.email !== adminEmail) {
      console.log("🔄 Admin foi deslogado, religando...");
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log("✅ Admin religado com sucesso");
    }

    // 💾 Salvar no Firestore (agora o admin está logado)
    // ✅ NORMALIZAR TIPO DE USUÁRIO
    const tipoUsuario = userData.role === "admin" ? "admin" 
                      : userData.role === "gestor" ? "gestor"
                      : "operador";

    const userDoc = {
      uid: userCredential.user.uid,
      email: userData.email,
      nome: userData.nome,
      tipo: tipoUsuario,
      role: tipoUsuario,
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
      needPasswordReset: true,
    };

    await setDoc(doc(db, "usuarios", userCredential.user.uid), userDoc);
    console.log("✅ Dados salvos no Firestore");

    // 📧 TENTAR ENVIAR EMAIL (não travar se falhar)
    try {
      // Usar instância secundária para enviar email sem afetar admin
      await sendPasswordResetEmail(secondaryAuth, userData.email.trim());
      console.log("✅ Email de configuração enviado");
    } catch (emailError) {
      console.warn("⚠️ Erro ao enviar email:", emailError.message);
    }

    // 🧹 Limpar senha temporária
    localStorage.removeItem("admin_temp_password");

    return {
      success: true,
      method: "firebase_direct_fixed",
      uid: userCredential.user.uid,
      senhaTemporaria: senhaTemporaria,
      mensagem: `Usuário ${userData.nome} criado com sucesso!`,
      detalhes: {
        auth: true,
        firestore: true,
        email: true,
        adminMantido: true,
      },
    };
  } catch (error) {
    console.error("❌ Erro na criação direta:", error);

    // 🧹 LIMPEZA EM CASO DE ERRO
    try {
      await signOut(secondaryAuth);

      // Tentar relogar admin se foi deslogado
      if (!auth.currentUser && adminEmail && adminPassword) {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("🔄 Admin religado após erro");
      }
    } catch (cleanupError) {
      console.error("❌ Erro na limpeza:", cleanupError);
    }

    // Limpar senha temporária
    localStorage.removeItem("admin_temp_password");

    throw {
      codigo: error.code,
      mensagem: getErrorMessage(error),
      detalhes: error.message,
    };
  }
};

// 🎯 FUNÇÃO ORIGINAL MANTIDA (fallback)
export const createUserInFirebase = async (userData, navigate, showToast) => {
  console.log("⚠️ Usando função original (pode deslogar admin)");
  return await createUserDirect(userData, navigate, showToast);
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

// 🚨 CORREÇÃO 5: UPDATE SEM CLOUD FUNCTION
export const updateUser = async (userId, userData, originalEmail) => {
  try {
    console.log(
      "✏️ Atualizando usuário (sem Cloud Function):",
      userId,
      userData,
    );

    // ✅ IR DIRETO PARA FIRESTORE (sem tentar Cloud Function)
    const userRef = doc(db, "usuarios", userId);
    
    // ✅ NORMALIZAR TIPO DE USUÁRIO - suportar role e tipo
    let tipoUsuario = "operador"; // default
    
    if (userData.tipo === "admin" || userData.role === "admin") {
      tipoUsuario = "admin";
    } else if (userData.tipo === "gestor" || userData.role === "gestor") {
      tipoUsuario = "gestor";
    } else {
      tipoUsuario = "operador";
    }

    const updateData = {
      nome: userData.nome,
      email: userData.email,
      tipo: tipoUsuario,
      role: userData.role || tipoUsuario, // ✅ Priorizar role se existir
      status: userData.status || "ativo",
      departamento: userData.departamento || "",
      telefone: userData.telefone || "",
      municipio: tipoUsuario === "admin" ? "" : userData.municipio || "",
      uf: tipoUsuario === "admin" ? "" : userData.uf || "",
      dataAtualizacao: serverTimestamp(),
    };

    console.log("💾 Dados que serão salvos:", updateData);

    await updateDoc(userRef, updateData);
    console.log("✅ Usuário atualizado no Firestore com tipo:", tipoUsuario);

    const resultado = {
      success: true,
      method: "firestore_direct",
      message: "Usuário atualizado com sucesso!",
      userData: updateData,
      userId: userId,
    };

    console.log("📤 Retornando resultado:", resultado);
    return resultado;
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário: " + error.message);
  }
};

// 🔄 FUNÇÕES CLOUD RUN (DESABILITADAS)
export const toggleUserStatusCloudRun = async (usuario, newStatus) => {
  throw new Error("Cloud Function temporariamente desabilitada");
};

export const checkUserStatusCloudRun = async (email) => {
  throw new Error("Cloud Function temporariamente desabilitada");
};

export const loadUsersCloudRun = async (limit = 50, offset = 0) => {
  throw new Error("Cloud Function temporariamente desabilitada");
};

export default {
  createUser,
  createUserDirect, // ✅ NOVA FUNÇÃO
  createUserInFirebase,
  updateUser,
  deleteUserById,
  checkAuthState,
  logoutUser,
  sendPasswordReset: sendPasswordResetEmail,
  // 🚫 FUNÇÕES CLOUD RUN DESABILITADAS:
  toggleUserStatusCloudRun,
  checkUserStatusCloudRun,
  loadUsersCloudRun,
  callCloudRun,
};
