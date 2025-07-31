// src/services/userService.js - VERSÃO CORRIGIDA COM CRIAÇÃO ATÔMICA
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  query,
  orderBy,
  where,
  Timestamp,
  increment,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  deleteUser,
} from "firebase/auth";
import { db } from "../firebase/firebaseConfig";

const auth = getAuth();
const COLLECTION_NAME = "usuarios";

// 🔥 FUNÇÃO DE TRACKING DE ACESSO
const trackUserAccess = async (userId) => {
  try {
    console.log("⏰ Registrando acesso do usuário:", userId);

    const userRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userRef, {
      ultimoAcesso: Timestamp.now(),
      totalAcessos: increment(1),
      primeiroAcesso: false,
    });

    // Log de auditoria
    await addDoc(collection(db, "logs"), {
      tipo: "LOGIN",
      userId: userId,
      timestamp: Timestamp.now(),
      detalhes: "Acesso ao sistema registrado",
      userAgent: navigator.userAgent || "N/A",
      ip: "client-side",
    });

    console.log("✅ Acesso registrado com sucesso para:", userId);
    return true;
  } catch (error) {
    console.error("❌ Erro ao registrar acesso:", error);
    return false;
  }
};

// ✅ GERAR SENHA TEMPORÁRIA SEGURA
const generateTempPassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "@#$%&*";

  let password = "";

  // Garantir pelo menos um de cada tipo
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specials.charAt(Math.floor(Math.random() * specials.length));

  // Completar com caracteres aleatórios até 12 caracteres
  const allChars = uppercase + lowercase + numbers + specials;
  for (let i = password.length; i < 12; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Embaralhar a senha
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// ✅ VERIFICAR SE EMAIL JÁ EXISTE
const checkEmailExists = async (email) => {
  try {
    if (!email || !email.trim()) {
      return false;
    }

    const emailToCheck = email.toLowerCase().trim();
    console.log("🔍 Verificando email no Firestore:", emailToCheck);

    const q = query(
      collection(db, COLLECTION_NAME),
      where("email", "==", emailToCheck),
    );

    const querySnapshot = await getDocs(q);
    const exists = !querySnapshot.empty;

    console.log("📊 Email existe:", exists);

    if (exists) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log("👤 Usuário encontrado:", {
          id: doc.id,
          nome: userData.nome,
          email: userData.email,
          tipo: userData.tipo,
          status: userData.status,
          ultimoAcesso: userData.ultimoAcesso,
        });
      });
    }

    return exists;
  } catch (error) {
    console.error("❌ Erro ao verificar email:", error);
    return true; // Conservador: assume que existe em caso de erro
  }
};

// ✅ CONVERTER ROLE PARA TIPO (CORRIGIDO)
const convertRoleToTipo = (role) => {
  const roleMap = {
    admin: "admin",
    user: "operador", // ✅ CORREÇÃO: user -> operador
    operador: "operador",
    administrador: "admin",
  };
  return roleMap[role] || "operador";
};

// ✅ VALIDAR DADOS
const validateFormData = (formData) => {
  console.log("🔍 Validando dados:", formData);
  const errors = [];

  // Validações básicas obrigatórias
  if (!formData.email?.trim()) {
    errors.push("Email é obrigatório");
  }

  if (!formData.nome?.trim()) {
    errors.push("Nome é obrigatório");
  }

  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email.trim())) {
    errors.push("Email inválido");
  }

  // ✅ VALIDAÇÃO PARA OPERADORES - MUNICÍPIO/UF OBRIGATÓRIOS
  const tipoUsuario = convertRoleToTipo(formData.role);

  if (tipoUsuario === "operador") {
    if (!formData.municipio?.trim()) {
      errors.push("Município é obrigatório para operadores");
    }

    if (!formData.uf?.trim()) {
      errors.push("UF é obrigatória para operadores");
    }
  }

  const isValid = errors.length === 0;
  console.log("✅ Validação concluída:", { isValid, errors });

  return { isValid, errors };
};

// ✅ TRATAR ERROS FIREBASE
const handleFirebaseError = (error) => {
  console.error("🔥 Firebase Error:", error.code, error.message);

  if (error.code) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Este email já está sendo usado por outro usuário";
      case "auth/invalid-email":
        return "Email inválido. Verifique o formato";
      case "auth/weak-password":
        return "Senha muito fraca. Use pelo menos 6 caracteres";
      case "auth/operation-not-allowed":
        return "Operação não permitida. Contate o administrador";
      case "auth/network-request-failed":
        return "Erro de conexão. Verifique sua internet";
      default:
        return error.message || "Erro interno do sistema";
    }
  }

  return error.message || "Erro interno do sistema";
};

// ✅ CARREGAR USUÁRIOS
const loadUsers = async () => {
  try {
    console.log("📋 Carregando usuários da collection:", COLLECTION_NAME);
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("dataCriacao", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`✅ ${users.length} usuários carregados`);
    return users;
  } catch (error) {
    console.error("❌ Erro ao carregar usuários:", error);
    throw new Error("Erro ao carregar usuários");
  }
};

// ✅ FUNÇÃO PARA TRATAR USUÁRIO ÓRFÃO (CORRIGIDA)
const handleOrphanedUser = async (email, formData) => {
  console.log("🔍 === DETECTANDO USUÁRIO ÓRFÃO ===");
  console.log("📧 Email:", email);

  try {
    const firestoreExists = await checkEmailExists(email);
    console.log("📊 Existe no Firestore:", firestoreExists);

    if (!firestoreExists) {
      console.log("🎯 USUÁRIO ÓRFÃO DETECTADO!");
      console.log("- Existe no Firebase Auth ✅");
      console.log("- NÃO existe no Firestore ❌");
      console.log("");
      console.log("🔧 Tentando completar criação do usuário órfão...");

      // ✅ CRIAR DOCUMENTO NO FIRESTORE COM ID ÚNICO
      const userData = {
        uid: "recuperado-" + Date.now(), // UID temporário
        email: email.toLowerCase().trim(),
        nome: formData.nome.trim(),
        tipo: convertRoleToTipo(formData.role), // ✅ USAR FUNÇÃO CORRIGIDA
        status: formData.status || "ativo",
        departamento: formData.departamento?.trim() || "",
        telefone: formData.telefone?.trim() || "",
        dataCriacao: Timestamp.now(),
        dataAtualizacao: Timestamp.now(),
        criadoPor: auth.currentUser?.uid || "sistema",
        ultimoAcesso: null,
        primeiroAcesso: true,
        senhaTemporaria: true,
        totalAcessos: 0,
        observacao: "Usuário órfão recuperado automaticamente",
      };

      // ✅ LOCALIZAÇÃO BASEADO NO TIPO
      if (userData.tipo === "operador") {
        userData.municipio = formData.municipio?.trim() || "";
        userData.uf = formData.uf?.trim().toUpperCase() || "";
      } else {
        userData.municipio = "";
        userData.uf = "";
      }

      console.log("💾 Criando documento no Firestore para usuário órfão...");
      console.log("📋 Dados:", {
        email: userData.email,
        nome: userData.nome,
        tipo: userData.tipo,
        municipio: userData.municipio,
      });

      // ✅ USAR addDoc para criar com ID automático
      const docRef = await addDoc(collection(db, COLLECTION_NAME), userData);

      console.log("✅ Usuário órfão recuperado:", docRef.id);
      console.log("📨 Enviando email de redefinição de senha...");

      await sendPasswordResetEmail(auth, email);

      console.log("🎉 USUÁRIO ÓRFÃO RECUPERADO COM SUCESSO!");

      return {
        success: true,
        recovered: true,
        user: userData,
        id: docRef.id,
        message: `Usuário órfão recuperado com sucesso! Email de redefinição enviado para ${email}`,
      };
    } else {
      console.log("❌ Email existe no Firestore - não é órfão");
      throw new Error("Este email já possui dados completos no sistema");
    }
  } catch (error) {
    console.error("❌ Erro ao recuperar usuário órfão:", error);
    throw error;
  }
};

// 🔥 FUNÇÃO PRINCIPAL CORRIGIDA - CRIAÇÃO ATÔMICA
const createUser = async (formData) => {
  console.log("🚀 === CRIAÇÃO DE USUÁRIO (VERSÃO ATÔMICA) ===");
  console.log("📝 Dados recebidos:", formData);

  // 1. Validar formulário
  const validation = validateFormData(formData);
  if (!validation.isValid) {
    const errorMsg = validation.errors.join(", ");
    console.error("❌ Dados inválidos:", errorMsg);
    throw new Error(errorMsg);
  }
  console.log("✅ Formulário válido");

  // 2. Verificar email no Firestore
  const emailExists = await checkEmailExists(formData.email);
  if (emailExists) {
    const errorMsg = "Este email já está cadastrado no sistema";
    console.error("❌ Email duplicado no Firestore:", errorMsg);
    throw new Error(errorMsg);
  }
  console.log("✅ Email disponível no Firestore");

  let userCredential = null;
  let firestoreDocRef = null;
  let rollbackNeeded = false;

  try {
    // 3. Gerar senha
    const senhaTemporaria = generateTempPassword();
    console.log("🔐 Senha gerada");

    // ✅ PASSO CRÍTICO 1: Criar no Firebase Auth PRIMEIRO
    console.log("📧 Criando usuário no Firebase Auth...");
    userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email.trim(),
      senhaTemporaria,
    );
    console.log("✅ Usuário criado no Auth:", userCredential.user.uid);
    rollbackNeeded = true; // Agora precisa de rollback se algo falhar

    // ✅ PASSO CRÍTICO 2: Preparar dados com UID REAL do Auth
    const userData = {
      uid: userCredential.user.uid, // ✅ UID REAL do Firebase Auth
      email: formData.email.trim().toLowerCase(),
      nome: formData.nome.trim(),
      tipo: convertRoleToTipo(formData.role), // ✅ USAR FUNÇÃO CORRIGIDA
      status: formData.status || "ativo",
      departamento: formData.departamento?.trim() || "",
      telefone: formData.telefone?.trim() || "",
      dataCriacao: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
      criadoPor: auth.currentUser?.uid || "sistema",
      ultimoAcesso: null,
      primeiroAcesso: true,
      senhaTemporaria: true,
      totalAcessos: 0,
    };

    // ✅ LOCALIZAÇÃO BASEADA NO TIPO
    if (userData.tipo === "operador") {
      userData.municipio = formData.municipio.trim();
      userData.uf = formData.uf.trim().toUpperCase();
    } else {
      userData.municipio = "";
      userData.uf = "";
    }

    console.log("📋 Dados preparados:", {
      uid: userData.uid,
      email: userData.email,
      nome: userData.nome,
      tipo: userData.tipo,
      municipio: userData.municipio,
    });

    // ✅ PASSO CRÍTICO 3: Criar no Firestore com UID específico
    console.log("💾 Criando documento no Firestore...");
    firestoreDocRef = doc(db, COLLECTION_NAME, userCredential.user.uid);
    await setDoc(firestoreDocRef, userData);
    console.log("✅ Documento criado no Firestore:", userCredential.user.uid);

    // ✅ PASSO CRÍTICO 4: Enviar email
    console.log("📨 Enviando email de reset...");
    await sendPasswordResetEmail(auth, formData.email.trim());
    console.log("✅ Email enviado");

    console.log("🎉 USUÁRIO CRIADO COM SUCESSO (ATÔMICO)!");
    return {
      success: true,
      user: userData,
      id: userCredential.user.uid,
      message: `Usuário criado com sucesso! Email enviado para ${formData.email}`,
    };
  } catch (error) {
    console.error("❌ ERRO na criação atômica:", error);

    // ✅ ROLLBACK COMPLETO EM CASO DE ERRO
    if (rollbackNeeded) {
      console.log("🔄 Iniciando rollback completo...");

      try {
        // 1. Remover do Firestore se foi criado
        if (firestoreDocRef) {
          console.log("🗑️ Removendo documento do Firestore...");
          await deleteDoc(firestoreDocRef);
          console.log("✅ Documento removido do Firestore");
        }

        // 2. Remover do Firebase Auth
        if (userCredential?.user) {
          console.log("🗑️ Removendo usuário do Firebase Auth...");
          await deleteUser(userCredential.user);
          console.log("✅ Usuário removido do Firebase Auth");
        }

        console.log("✅ Rollback completo executado");
      } catch (rollbackError) {
        console.error("❌ ERRO CRÍTICO no rollback:", rollbackError);
        console.error("⚠️ ATENÇÃO: Sistema pode ter ficado inconsistente!");
        console.error("   Verificar manualmente Firebase Auth e Firestore");
      }
    }

    // ✅ VERIFICAR SE É USUÁRIO ÓRFÃO (apenas se Auth falhou)
    if (error.code === "auth/email-already-in-use") {
      console.log("🔍 Email já em uso - verificando usuário órfão...");

      try {
        const resultado = await handleOrphanedUser(formData.email, formData);
        return resultado;
      } catch (orphanError) {
        console.error("❌ Falha ao recuperar usuário órfão:", orphanError);
        throw new Error("Este email já está cadastrado no sistema");
      }
    }

    // ✅ OUTROS ERROS
    const errorMessage = handleFirebaseError(error);
    throw new Error(errorMessage);
  }
};

// ✅ ATUALIZAR USUÁRIO
const updateUser = async (userId, formData, originalEmail) => {
  console.log("✏️ Atualizando usuário:", userId);

  const validation = validateFormData(formData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  if (formData.email !== originalEmail) {
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      throw new Error("Este email já está cadastrado no sistema");
    }
  }

  try {
    const updateData = {
      nome: formData.nome.trim(),
      tipo: convertRoleToTipo(formData.role), // ✅ USAR FUNÇÃO CORRIGIDA
      status: formData.status || "ativo",
      departamento: formData.departamento?.trim() || "",
      telefone: formData.telefone?.trim() || "",
      dataAtualizacao: Timestamp.now(),
      atualizadoPor: auth.currentUser?.uid || "sistema",
    };

    // ✅ LOCALIZAÇÃO BASEADA NO TIPO
    if (updateData.tipo === "admin") {
      updateData.municipio = "";
      updateData.uf = "";
    } else if (updateData.tipo === "operador") {
      updateData.municipio = formData.municipio?.trim() || "";
      updateData.uf = formData.uf?.trim().toUpperCase() || "";
    }

    await updateDoc(doc(db, COLLECTION_NAME, userId), updateData);

    return {
      success: true,
      message: "Usuário atualizado com sucesso!",
    };
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário");
  }
};

// ✅ EXCLUIR USUÁRIO (VERSÃO CORRIGIDA)
const deleteUserById = async (userId) => {
  try {
    console.log("🗑️ === INICIANDO EXCLUSÃO DE USUÁRIO ===");
    console.log("📋 Parâmetro recebido:", userId);
    console.log("🔍 Tipo do parâmetro:", typeof userId);

    // ✅ NORMALIZAR O USERID
    let validUserId;

    if (typeof userId === "object" && userId !== null) {
      validUserId =
        userId.id || userId.uid || userId.userId || userId.key || userId._id;
      console.log("📋 UserId extraído do objeto:", validUserId);
    } else if (typeof userId === "string") {
      validUserId = userId;
      console.log("📋 UserId já é string:", validUserId);
    } else {
      console.error("❌ Tipo de userId inválido:", typeof userId);
      throw new Error(
        `ID do usuário inválido. Tipo recebido: ${typeof userId}`,
      );
    }

    if (
      !validUserId ||
      typeof validUserId !== "string" ||
      validUserId.trim() === ""
    ) {
      console.error("❌ UserId final inválido:", validUserId);
      throw new Error("ID do usuário não encontrado ou inválido");
    }

    const cleanUserId = validUserId.trim();
    console.log("🧹 UserId limpo para usar:", cleanUserId);

    if (auth.currentUser && auth.currentUser.uid === cleanUserId) {
      console.error("❌ Tentativa de auto-exclusão bloqueada");
      throw new Error("Não é possível excluir seu próprio usuário");
    }

    console.log("📄 Criando referência do documento...");
    const userDocRef = doc(db, COLLECTION_NAME, cleanUserId);

    console.log("🔍 Verificando se documento existe...");
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("⚠️ Documento não encontrado");
      return {
        success: true,
        message: "Usuário não encontrado (possivelmente já excluído)",
      };
    }

    const userData = userDoc.data();
    console.log("👤 Dados do usuário a ser excluído:", {
      nome: userData.nome,
      email: userData.email,
      tipo: userData.tipo,
      status: userData.status,
    });

    console.log("✅ Documento encontrado, procedendo com exclusão...");
    await deleteDoc(userDocRef);
    console.log("✅ Documento excluído com sucesso do Firestore");

    // Log de auditoria
    try {
      await addDoc(collection(db, "logs"), {
        tipo: "DELETE_USER",
        userId: cleanUserId,
        userEmail: userData.email,
        userName: userData.nome,
        deletedBy: auth.currentUser?.uid || "sistema",
        timestamp: Timestamp.now(),
        detalhes: "Usuário excluído via interface de administração",
      });
      console.log("📝 Log de auditoria criado");
    } catch (logError) {
      console.warn("⚠️ Erro ao criar log de auditoria:", logError);
    }

    console.log("🎉 === EXCLUSÃO CONCLUÍDA COM SUCESSO ===");

    return {
      success: true,
      message: "Usuário excluído com sucesso!",
    };
  } catch (error) {
    console.error("❌ === ERRO DETALHADO NA EXCLUSÃO ===");
    console.error("🔥 Error object:", error);
    console.error("🔥 Error code:", error.code);
    console.error("🔥 Error message:", error.message);

    let errorMessage = "Erro ao excluir usuário";

    if (error.code === "permission-denied") {
      errorMessage = "Permissão negada para excluir usuário";
    } else if (error.code === "not-found") {
      errorMessage = "Usuário não encontrado";
    } else if (error.code === "invalid-argument") {
      errorMessage = "Argumento inválido fornecido para exclusão";
    } else if (error.code === "unavailable") {
      errorMessage = "Serviço temporariamente indisponível. Tente novamente";
    } else if (error.message) {
      errorMessage = error.message;
    }

    try {
      await addDoc(collection(db, "logs"), {
        tipo: "ERROR_DELETE_USER",
        userId: typeof userId === "string" ? userId : JSON.stringify(userId),
        error: error.message,
        errorCode: error.code,
        timestamp: Timestamp.now(),
        userAgent: navigator.userAgent,
      });
    } catch (logError) {
      console.warn("⚠️ Erro ao log de erro:", logError);
    }

    throw new Error(errorMessage);
  }
};

// ✅ ENVIAR RESET DE SENHA
const sendPasswordReset = async (user) => {
  try {
    console.log("📨 Enviando reset de senha para:", user.email);

    await sendPasswordResetEmail(auth, user.email);

    if (user.primeiroAcesso) {
      await updateDoc(doc(db, COLLECTION_NAME, user.id), {
        primeiroAcesso: false,
        senhaTemporaria: false,
        dataAtualizacao: Timestamp.now(),
      });
    }

    console.log("✅ Email de reset enviado");

    return {
      success: true,
      message: `Email de alteração de senha enviado para ${user.email}!`,
    };
  } catch (error) {
    console.error("❌ Erro ao enviar reset:", error);
    throw new Error("Erro ao enviar email de reset");
  }
};

// ✅ DIAGNÓSTICO DE EMAIL
const diagnoseEmail = async (email) => {
  console.log("🔍 === DIAGNÓSTICO DE EMAIL ===");
  console.log("📧 Email:", email);

  try {
    const firestoreExists = await checkEmailExists(email);
    console.log("📊 Firestore:", firestoreExists ? "EXISTE" : "DISPONÍVEL");

    if (firestoreExists) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("email", "==", email.toLowerCase().trim()),
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log("👤 Dados do usuário existente:", {
          id: doc.id,
          nome: userData.nome,
          tipo: userData.tipo,
          status: userData.status,
          dataCriacao: userData.dataCriacao,
          ultimoAcesso: userData.ultimoAcesso,
        });
      });
    }

    return {
      email: email,
      firestoreExists,
      canCreate: !firestoreExists,
      message: firestoreExists
        ? "Email já cadastrado - escolha outro email"
        : "Email disponível para criação",
    };
  } catch (error) {
    console.error("❌ Erro no diagnóstico:", error);
    return {
      email: email,
      error: error.message,
      canCreate: false,
      message: "Erro ao verificar email - tente novamente",
    };
  }
};

// 🧹 FUNÇÃO PARA LIMPAR USUÁRIOS QUEBRADOS
const cleanupBrokenUsers = async () => {
  console.log("🧹 === LIMPEZA DE USUÁRIOS QUEBRADOS ===");

  try {
    const usuariosSnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const brokenUsers = [];

    console.log(`📋 Verificando ${usuariosSnapshot.size} usuários...`);

    for (const doc of usuariosSnapshot.docs) {
      const userData = doc.data();
      const email = userData.email;

      if (!email) continue;

      // Se o usuário foi "recuperado automaticamente", provavelmente está quebrado
      if (userData.observacao?.includes("órfão recuperado automaticamente")) {
        console.log(`⚠️ Usuário possivelmente quebrado: ${email}`);
        brokenUsers.push({
          id: doc.id,
          email: email,
          nome: userData.nome,
          tipo: userData.tipo,
          reason: "Recuperado como órfão",
        });
      }

      // Se o UID não parece ser do Firebase
      if (userData.uid?.startsWith("recuperado-")) {
        console.log(`⚠️ Usuário com UID inválido: ${email}`);
        brokenUsers.push({
          id: doc.id,
          email: email,
          nome: userData.nome,
          tipo: userData.tipo,
          reason: "UID inválido",
        });
      }
    }

    console.log(`🎯 Encontrados ${brokenUsers.length} usuários problemáticos:`);
    brokenUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.email} (${user.nome}) - ${user.reason}`,
      );
    });

    return {
      total: usuariosSnapshot.size,
      broken: brokenUsers.length,
      users: brokenUsers,
    };
  } catch (error) {
    console.error("❌ Erro na limpeza:", error);
    throw error;
  }
};

// 🔧 FUNÇÃO PARA CORRIGIR USUÁRIO ESPECÍFICO
const fixBrokenUser = async (userId, email, correctUserData) => {
  console.log(`🔧 Corrigindo usuário: ${email}`);

  try {
    // 1. Verificar se documento existe
    const userDoc = await getDoc(doc(db, COLLECTION_NAME, userId));
    if (!userDoc.exists()) {
      throw new Error("Usuário não encontrado no Firestore");
    }

    // 2. Tentar criar no Firebase Auth
    const senhaTemporaria = generateTempPassword();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senhaTemporaria,
    );

    console.log("✅ Usuário criado no Firebase Auth:", userCredential.user.uid);

    // 3. Atualizar documento com UID correto
    const updatedData = {
      ...userDoc.data(),
      uid: userCredential.user.uid,
      dataAtualizacao: Timestamp.now(),
      corrigidoEm: Timestamp.now(),
      observacao: "Usuário corrigido - Auth sincronizado",
      ...correctUserData,
    };

    // 4. Se UID mudou, criar novo documento e deletar antigo
    if (userCredential.user.uid !== userId) {
      console.log("🔄 UID mudou, recriando documento...");

      // Criar novo documento com UID correto
      await setDoc(
        doc(db, COLLECTION_NAME, userCredential.user.uid),
        updatedData,
      );

      // Deletar documento antigo
      await deleteDoc(doc(db, COLLECTION_NAME, userId));

      console.log(
        `✅ Documento recriado: ${userId} → ${userCredential.user.uid}`,
      );
    } else {
      // Apenas atualizar documento existente
      await updateDoc(doc(db, COLLECTION_NAME, userId), updatedData);
      console.log("✅ Documento atualizado");
    }

    // 5. Enviar email de reset
    await sendPasswordResetEmail(auth, email);
    console.log("📨 Email de reset enviado");

    return {
      success: true,
      oldId: userId,
      newId: userCredential.user.uid,
      message: "Usuário corrigido com sucesso",
    };
  } catch (error) {
    console.error(`❌ Erro ao corrigir usuário ${email}:`, error);
    throw error;
  }
};

// ✅ EXPORTAR FUNÇÕES
const userService = {
  loadUsers,
  createUser,
  updateUser,
  deleteUser: deleteUserById,
  sendPasswordReset,
  checkEmailExists,
  validateFormData,
  generateTempPassword,
  convertRoleToTipo,
  handleFirebaseError,
  diagnoseEmail,
  trackUserAccess,
  cleanupBrokenUsers,
  fixBrokenUser,

  // Funções de debug
  async debugCreateUser(formData) {
    console.log("🐛 === MODO DEBUG - CRIAÇÃO DE USUÁRIO ===");

    try {
      console.log("1. Dados recebidos:", formData);

      console.log("2. Validando...");
      const validation = validateFormData(formData);
      console.log("   Resultado:", validation);

      console.log("3. Verificando email...");
      const emailExists = await checkEmailExists(formData.email);
      console.log("   Email existe:", emailExists);

      if (emailExists) {
        console.log("❌ Parou aqui - email já existe");
        return { canProceed: false, reason: "Email já existe" };
      }

      console.log("✅ Pode prosseguir com criação");
      return { canProceed: true, reason: "Tudo validado" };
    } catch (error) {
      console.error("❌ Erro no debug:", error);
      return { canProceed: false, reason: error.message };
    }
  },

  async listAllEmails() {
    console.log("📋 === LISTANDO TODOS OS EMAILS CADASTRADOS ===");

    try {
      const users = await loadUsers();
      const emails = users.map((user) => ({
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        status: user.status,
        ultimoAcesso: user.ultimoAcesso,
      }));

      console.log("📧 Emails cadastrados:");
      emails.forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.email} (${user.nome} - ${user.tipo})`,
        );
      });

      return emails;
    } catch (error) {
      console.error("❌ Erro ao listar emails:", error);
      return [];
    }
  },

  async recoverOrphanedUser(email, userData) {
    console.log("🔧 === RECUPERAÇÃO MANUAL DE USUÁRIO ÓRFÃO ===");
    console.log("📧 Email:", email);

    try {
      return await handleOrphanedUser(email, userData);
    } catch (error) {
      console.error("❌ Erro na recuperação manual:", error);
      throw error;
    }
  },
};

// ✅ EXPORTAÇÕES CORRIGIDAS
export const UserService = {
  createUser,
  updateUser,
  deleteUser: deleteUserById,
  getAllUsers: loadUsers,
  getCurrentUserData: () => null,
  diagnoseEmail,
  cleanupBrokenUsers,
  trackUserAccess,
  sendPasswordReset,
  checkEmailExists,
  validateFormData,
  generateTempPassword,
  convertRoleToTipo,
  handleFirebaseError,
  fixBrokenUser,
};

// Exportações nomeadas
export {
  createUser,
  updateUser,
  deleteUserById as deleteUser,
  loadUsers as getAllUsers,
  diagnoseEmail,
  cleanupBrokenUsers,
};

// ✅ EXPORTAR COMO DEFAULT
export default userService;
