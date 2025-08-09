// 🔧 CORREÇÃO CRÍTICA: userService.js - Fix Logout Automático
// Problema: createUserWithEmailAndPassword desloga admin automaticamente
// Solução: Implementar signOut imediato + redirecionamento controlado

import {
  createUserWithEmailAndPassword,
  signOut,
  auth,
} from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// 🎯 FUNÇÃO CORRIGIDA: Criar usuário com logout controlado
export const createUserInFirebase = async (userData, navigate, showToast) => {
  let userCredential = null;

  try {
    console.log("🔄 Iniciando criação de usuário...");

    // 1. Gerar senha temporária
    const senhaTemporaria = Math.random().toString(36).slice(-8);

    // 2. ⚠️ IMPORTANTE: Este comando VAI deslogar o admin atual
    console.log("⚠️ ATENÇÃO: Admin será deslogado após criação do usuário");

    userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email.trim(),
      senhaTemporaria,
    );

    console.log("✅ Usuário criado no Firebase Auth:", userCredential.user.uid);

    // 3. 🔧 CORREÇÃO PRINCIPAL: Deslogar imediatamente o usuário recém-criado
    await signOut(auth);
    console.log(
      "✅ Usuário recém-criado deslogado (admin também foi deslogado)",
    );

    // 4. Salvar dados do usuário no Firestore
    const userDoc = {
      uid: userCredential.user.uid,
      nome: userData.nome,
      email: userData.email,
      municipio: userData.municipio,
      uf: userData.uf,
      tipo: userData.tipo || "operador",
      status: "ativo",
      senhaTemporaria: senhaTemporaria,
      criadoEm: serverTimestamp(),
      primeiroLogin: true,
    };

    await addDoc(collection(db, "usuarios"), userDoc);
    console.log("✅ Dados do usuário salvos no Firestore");

    // 5. 🎯 REDIRECIONAMENTO CONTROLADO com mensagem explicativa
    if (showToast) {
      showToast({
        tipo: "sucesso",
        titulo: "✅ Usuário Criado com Sucesso!",
        mensagem: `Usuário ${userData.nome} foi criado. Você será redirecionado para o login.`,
        duracao: 4000,
      });
    }

    // 6. Aguardar um momento para o usuário ler a mensagem
    setTimeout(() => {
      if (navigate) {
        navigate("/login", {
          state: {
            message: "✅ Usuário criado com sucesso! Faça login novamente.",
            type: "success",
            userCreated: userData.nome,
          },
        });
      }
    }, 2000);

    return {
      sucesso: true,
      uid: userCredential.user.uid,
      senhaTemporaria: senhaTemporaria,
      mensagem: "Usuário criado com sucesso",
    };
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);

    // Se houver erro, tentar fazer logout mesmo assim para limpar estado
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error("❌ Erro adicional no signOut:", signOutError);
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

// 🎯 FUNÇÃO ALTERNATIVA: Para casos onde queremos manter admin logado
export const createUserWithAdminSDK = async (userData) => {
  // ⚠️ NOTA: Esta função requeria Firebase Admin SDK
  // Por ora, não implementada - usar createUserInFirebase
  throw new Error("Função não implementada. Use createUserInFirebase.");
};

// 🎯 WRAPPER FUNCTION: Para compatibilidade com código existente
export const createUser = async (userData, options = {}) => {
  const { navigate, showToast, preserveSession = false } = options;

  if (preserveSession) {
    // Futuro: implementar com Admin SDK
    throw new Error("Preservar sessão requer Firebase Admin SDK");
  }

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

// 📋 EXEMPLO DE USO NO COMPONENTE:
/*
// No UserForm.jsx ou Administracao.jsx:

import { createUser } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const handleCreateUser = async (formData) => {
  try {
    const result = await createUser(formData, {
      navigate,
      showToast,
      preserveSession: false // por enquanto sempre false
    });

    console.log('Usuário criado:', result);

  } catch (error) {
    showToast({
      tipo: 'erro',
      titulo: 'Erro ao criar usuário',
      mensagem: error.mensagem || 'Erro desconhecido'
    });
  }
};
*/

export default {
  createUser,
  createUserInFirebase,
  checkAuthState,
  logoutUser,
};
