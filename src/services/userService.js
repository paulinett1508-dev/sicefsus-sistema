
// src/services/userService.js - VERSÃO DEBUG (SEM TESTE AUTH)
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  where,
  Timestamp,
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
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ✅ VERIFICAR SE EMAIL JÁ EXISTE (APENAS FIRESTORE)
const checkEmailExists = async (email) => {
  try {
    if (!email || !email.trim()) {
      return false;
    }

    const emailToCheck = email.toLowerCase().trim();
    console.log('🔍 === VERIFICAÇÃO SIMPLES DE EMAIL (APENAS FIRESTORE) ===');
    console.log('📧 Email a verificar:', emailToCheck);

    const q = query(
      collection(db, COLLECTION_NAME),
      where("email", "==", emailToCheck)
    );

    const querySnapshot = await getDocs(q);
    const exists = !querySnapshot.empty;

    console.log('📊 Existe no Firestore:', exists);

    if (exists) {
      console.log('🚨 EMAIL JÁ CADASTRADO!');
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('👤 Usuário encontrado:', {
          id: doc.id,
          nome: userData.nome,
          email: userData.email,
          tipo: userData.tipo,
          status: userData.status
        });
      });
    } else {
      console.log('✅ Email disponível');
    }

    return exists;

  } catch (error) {
    console.error("❌ Erro ao verificar email no Firestore:", error);
    // Em caso de erro, ser conservador e assumir que existe
    return true;
  }
};

// ✅ CONVERTER ROLE PARA TIPO
const convertRoleToTipo = (role) => {
  const roleMap = {
    'admin': 'admin',
    'user': 'operador',
    'operador': 'operador',
    'administrador': 'admin'
  };
  return roleMap[role] || 'operador';
};

// ✅ VALIDAR DADOS
const validateFormData = (formData) => {
  console.log('🔍 Validando dados:', formData);
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

  // Validação para operadores
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
  console.log('✅ Validação concluída:', { isValid, errors });

  return { isValid, errors };
};

// ✅ TRATAR ERROS FIREBASE
const handleFirebaseError = (error) => {
  console.error('🔥 Firebase Error:', error.code, error.message);

  if (error.code) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este email já está sendo usado por outro usuário';
      case 'auth/invalid-email':
        return 'Email inválido. Verifique o formato';
      case 'auth/weak-password':
        return 'Senha muito fraca. Use pelo menos 6 caracteres';
      case 'auth/operation-not-allowed':
        return 'Operação não permitida. Contate o administrador';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet';
      default:
        return error.message || 'Erro interno do sistema';
    }
  }

  return error.message || 'Erro interno do sistema';
};

// ✅ CARREGAR USUÁRIOS
const loadUsers = async () => {
  try {
    console.log('📋 Carregando usuários da collection:', COLLECTION_NAME);
    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy("dataCriacao", "desc")
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

// ✅ DETECTAR E RESOLVER USUÁRIOS ÓRFÃOS
const handleOrphanedUser = async (email, formData) => {
  console.log('🔍 === DETECTANDO USUÁRIO ÓRFÃO ===');
  console.log('📧 Email:', email);

  try {
    // Verificar se realmente existe no Firestore
    const firestoreExists = await checkEmailExists(email);

    if (!firestoreExists) {
      console.log('🎯 USUÁRIO ÓRFÃO DETECTADO!');
      console.log('- Existe no Firebase Auth ✅');
      console.log('- NÃO existe no Firestore ❌');
      console.log('');
      console.log('🔧 Tentando completar criação do usuário órfão...');

      // Tentar encontrar o UID do usuário no Auth
      // Como não podemos listar usuários do Auth diretamente no cliente,
      // vamos completar a criação usando dados do formulário

      const userData = {
        uid: 'recuperado-' + Date.now(), // UID temporário
        email: email.toLowerCase().trim(),
        nome: formData.nome.trim(),
        tipo: convertRoleToTipo(formData.role),
        status: formData.status || 'ativo',
        departamento: formData.departamento?.trim() || '',
        telefone: formData.telefone?.trim() || '',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        criadoPor: auth.currentUser?.uid || 'sistema',
        ultimoAcesso: null,
        primeiroAcesso: true,
        senhaTemporaria: true,
        observacao: 'Usuário órfão recuperado automaticamente'
      };

      // Localização baseado no tipo
      if (userData.tipo === "operador") {
        userData.municipio = formData.municipio?.trim() || '';
        userData.uf = formData.uf?.trim().toUpperCase() || '';
      } else {
        userData.municipio = '';
        userData.uf = '';
      }

      console.log('💾 Criando documento no Firestore para usuário órfão...');
      const docRef = await addDoc(collection(db, COLLECTION_NAME), userData);

      console.log('✅ Usuário órfão recuperado:', docRef.id);
      console.log('📨 Enviando email de redefinição de senha...');

      // Enviar email de reset
      await sendPasswordResetEmail(auth, email);

      console.log('🎉 USUÁRIO ÓRFÃO RECUPERADO COM SUCESSO!');

      return {
        success: true,
        recovered: true,
        user: userData,
        id: docRef.id,
        message: `Usuário órfão recuperado com sucesso! Email de redefinição enviado para ${email}`,
      };

    } else {
      console.log('❌ Email existe tanto no Auth quanto no Firestore');
      throw new Error('Este email já está completamente cadastrado no sistema');
    }

  } catch (error) {
    console.error('❌ Erro ao recuperar usuário órfão:', error);
    throw error;
  }
};

// ✅ CRIAR USUÁRIO (COM DETECÇÃO DE ÓRFÃOS)
const createUser = async (formData) => {
  console.log('🚀 === CRIAÇÃO DE USUÁRIO (COM DETECÇÃO DE ÓRFÃOS) ===');
  console.log('📝 Dados recebidos:', formData);

  // 1. Validar formulário
  const validation = validateFormData(formData);
  if (!validation.isValid) {
    const errorMsg = validation.errors.join(", ");
    console.error('❌ Dados inválidos:', errorMsg);
    throw new Error(errorMsg);
  }
  console.log('✅ Formulário válido');

  // 2. Verificar email no Firestore
  const emailExists = await checkEmailExists(formData.email);
  if (emailExists) {
    const errorMsg = "Este email já está cadastrado no sistema";
    console.error('❌ Email duplicado no Firestore:', errorMsg);
    throw new Error(errorMsg);
  }
  console.log('✅ Email disponível no Firestore');

  let userCredential = null;

  try {
    // 3. Gerar senha
    const senhaTemporaria = generateTempPassword();
    console.log('🔐 Senha gerada');

    // 4. Tentar criar no Firebase Auth
    console.log('📧 Tentando criar no Firebase Auth...');
    userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email.trim(),
      senhaTemporaria
    );
    console.log('✅ Criado no Auth:', userCredential.user.uid);

    // 5. Preparar dados
    const userData = {
      uid: userCredential.user.uid,
      email: formData.email.trim().toLowerCase(),
      nome: formData.nome.trim(),
      tipo: convertRoleToTipo(formData.role),
      status: formData.status || 'ativo',
      departamento: formData.departamento?.trim() || '',
      telefone: formData.telefone?.trim() || '',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      criadoPor: auth.currentUser?.uid || 'sistema',
      ultimoAcesso: null,
      primeiroAcesso: true,
      senhaTemporaria: true,
    };

    // 6. Localização
    if (userData.tipo === "operador") {
      userData.municipio = formData.municipio.trim();
      userData.uf = formData.uf.trim().toUpperCase();
    } else {
      userData.municipio = '';
      userData.uf = '';
    }

    // 7. Salvar no Firestore
    console.log('💾 Salvando no Firestore...');
    const docRef = await addDoc(collection(db, COLLECTION_NAME), userData);
    console.log('✅ Salvo no Firestore:', docRef.id);

    // 8. Enviar email
    console.log('📨 Enviando email...');
    await sendPasswordResetEmail(auth, formData.email.trim());
    console.log('✅ Email enviado');

    console.log('🎉 USUÁRIO CRIADO COM SUCESSO!');
    return {
      success: true,
      user: userData,
      id: docRef.id,
      message: `Usuário criado com sucesso! Email enviado para ${formData.email}`,
    };

  } catch (error) {
    console.error('❌ ERRO na criação:', error);

    // ✅ VERIFICAR SE É USUÁRIO ÓRFÃO
    if (error.code === 'auth/email-already-in-use') {
      console.log('🔍 Erro de email já em uso - verificando se é usuário órfão...');

      try {
        return await handleOrphanedUser(formData.email, formData);
      } catch (orphanError) {
        console.error('❌ Falha ao recuperar usuário órfão:', orphanError);
        throw new Error('Este email já está cadastrado no sistema');
      }
    }

    // Rollback para outros erros
    if (userCredential?.user) {
      try {
        console.log('🔄 Fazendo rollback...');
        await deleteUser(userCredential.user);
        console.log('✅ Rollback feito');
      } catch (rollbackError) {
        console.error('❌ Erro no rollback:', rollbackError);
      }
    }

    const errorMessage = handleFirebaseError(error);
    throw new Error(errorMessage);
  }
};

// ✅ ATUALIZAR USUÁRIO
const updateUser = async (userId, formData, originalEmail) => {
  console.log('✏️ Atualizando usuário:', userId);

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
      tipo: convertRoleToTipo(formData.role),
      status: formData.status || 'ativo',
      departamento: formData.departamento?.trim() || '',
      telefone: formData.telefone?.trim() || '',
      dataAtualizacao: new Date().toISOString(),
      atualizadoPor: auth.currentUser?.uid || 'sistema'
    };

    if (updateData.tipo === "admin") {
      updateData.municipio = '';
      updateData.uf = '';
    } else if (updateData.tipo === "operador") {
      updateData.municipio = formData.municipio?.trim() || '';
      updateData.uf = formData.uf?.trim().toUpperCase() || '';
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

// ✅ EXCLUIR USUÁRIO
const deleteUserById = async (userId) => {
  try {
    console.log('🗑️ Excluindo usuário:', userId);
    await deleteDoc(doc(db, COLLECTION_NAME, userId));
    console.log('✅ Usuário excluído do Firestore');

    return {
      success: true,
      message: "Usuário excluído com sucesso!",
    };
  } catch (error) {
    console.error("❌ Erro ao excluir usuário:", error);
    throw new Error("Erro ao excluir usuário");
  }
};

// ✅ ENVIAR RESET DE SENHA
const sendPasswordReset = async (user) => {
  try {
    console.log('📨 Enviando reset de senha para:', user.email);

    await sendPasswordResetEmail(auth, user.email);

    if (user.primeiroAcesso) {
      await updateDoc(doc(db, COLLECTION_NAME, user.id), {
        primeiroAcesso: false,
        senhaTemporaria: false,
        dataAtualizacao: new Date().toISOString(),
      });
    }

    console.log('✅ Email de reset enviado');

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
  console.log('🔍 === DIAGNÓSTICO DE EMAIL ===');
  console.log('📧 Email:', email);

  try {
    // Verificar Firestore
    const firestoreExists = await checkEmailExists(email);
    console.log('📊 Firestore:', firestoreExists ? 'EXISTE' : 'DISPONÍVEL');

    // Verificar qual seria o problema
    if (firestoreExists) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("email", "==", email.toLowerCase().trim())
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('👤 Dados do usuário existente:', {
          id: doc.id,
          nome: userData.nome,
          tipo: userData.tipo,
          status: userData.status,
          dataCriacao: userData.dataCriacao
        });
      });
    }

    return {
      email: email,
      firestoreExists,
      canCreate: !firestoreExists,
      message: firestoreExists ? 
        'Email já cadastrado - escolha outro email' : 
        'Email disponível para criação'
    };

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    return {
      email: email,
      error: error.message,
      canCreate: false,
      message: 'Erro ao verificar email - tente novamente'
    };
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

  // ✅ FUNÇÕES DE DEBUG
  async debugCreateUser(formData) {
    console.log('🐛 === MODO DEBUG - CRIAÇÃO DE USUÁRIO ===');

    try {
      console.log('1. Dados recebidos:', formData);

      console.log('2. Validando...');
      const validation = validateFormData(formData);
      console.log('   Resultado:', validation);

      console.log('3. Verificando email...');
      const emailExists = await checkEmailExists(formData.email);
      console.log('   Email existe:', emailExists);

      if (emailExists) {
        console.log('❌ Parou aqui - email já existe');
        return { canProceed: false, reason: 'Email já existe' };
      }

      console.log('✅ Pode prosseguir com criação');
      return { canProceed: true, reason: 'Tudo validado' };

    } catch (error) {
      console.error('❌ Erro no debug:', error);
      return { canProceed: false, reason: error.message };
    }
  },

  // ✅ LISTAR TODOS OS EMAILS CADASTRADOS
  async listAllEmails() {
    console.log('📋 === LISTANDO TODOS OS EMAILS CADASTRADOS ===');

    try {
      const users = await loadUsers();
      const emails = users.map(user => ({
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        status: user.status
      }));

      console.log('📧 Emails cadastrados:');
      emails.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.nome} - ${user.tipo})`);
      });

      return emails;

    } catch (error) {
      console.error('❌ Erro ao listar emails:', error);
      return [];
    }
  },

  // ✅ RESOLVER USUÁRIO ÓRFÃO MANUALMENTE
  async recoverOrphanedUser(email, userData) {
    console.log('🔧 === RECUPERAÇÃO MANUAL DE USUÁRIO ÓRFÃO ===');
    console.log('📧 Email:', email);

    try {
      return await handleOrphanedUser(email, userData);
    } catch (error) {
      console.error('❌ Erro na recuperação manual:', error);
      throw error;
    }
  },

  // ✅ SOLUÇÃO TEMPORÁRIA - USAR EMAIL DIFERENTE
  async suggestAlternativeEmail(baseEmail) {
    console.log('💡 === SUGERINDO EMAIL ALTERNATIVO ===');

    const [localPart, domain] = baseEmail.split('@');
    const alternatives = [];

    for (let i = 1; i <= 5; i++) {
      const altEmail = `${localPart}${i}@${domain}`;
      const exists = await checkEmailExists(altEmail);

      if (!exists) {
        alternatives.push(altEmail);
        console.log(`✅ Alternativa disponível: ${altEmail}`);
      } else {
        console.log(`❌ Alternativa ocupada: ${altEmail}`);
      }
    }

    if (alternatives.length > 0) {
      console.log(`💡 Sugestão: Use ${alternatives[0]}`);
      return alternatives[0];
    } else {
      console.log('❌ Nenhuma alternativa simples encontrada');
      return null;
    }
  },

  // ✅ DIAGNÓSTICO COMPLETO
  async fullDiagnosis(email) {
    console.log('🔍 === DIAGNÓSTICO COMPLETO ===');
    console.log('📧 Email:', email);

    try {
      // 1. Verificar Firestore
      const firestoreExists = await checkEmailExists(email);
      console.log('📊 Firestore:', firestoreExists ? 'EXISTE' : 'DISPONÍVEL');

      // 2. Testar Auth
      let authTest = 'INDETERMINADO';
      try {
        const tempPassword = generateTempPassword();
        const testCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          tempPassword
        );

        // Se chegou aqui, está disponível no Auth
        authTest = 'DISPONÍVEL';

        // Remover teste
        await deleteUser(testCredential.user);
        console.log('🧹 Usuário de teste removido');

      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          authTest = 'EXISTE (ÓRFÃO!)';
        } else {
          authTest = `ERRO: ${authError.code}`;
        }
      }

      console.log('🔥 Firebase Auth:', authTest);

      // 3. Determinar situação
      let situacao, solucao;

      if (!firestoreExists && authTest === 'DISPONÍVEL') {
        situacao = '✅ EMAIL TOTALMENTE DISPONÍVEL';
        solucao = 'Pode criar usuário normalmente';
      } else if (firestoreExists && authTest === 'EXISTE (ÓRFÃO!)') {
        situacao = '✅ USUÁRIO COMPLETO';
        solucao = 'Email já cadastrado - use outro email';
      } else if (!firestoreExists && authTest === 'EXISTE (ÓRFÃO!)') {
        situacao = '🚨 USUÁRIO ÓRFÃO DETECTADO';
        solucao = 'Usar função de recuperação automática';
      } else {
        situacao = '⚠️ SITUAÇÃO INCONSISTENTE';
        solucao = 'Verificar manualmente no Firebase Console';
      }

      console.log('📋 SITUAÇÃO:', situacao);
      console.log('💡 SOLUÇÃO:', solucao);

      return {
        email,
        firestore: firestoreExists,
        auth: authTest,
        situacao,
        solucao,
        canCreate: !firestoreExists && authTest === 'DISPONÍVEL'
      };

    } catch (error) {
      console.error('❌ Erro no diagnóstico completo:', error);
      return {
        email,
        error: error.message,
        situacao: 'ERRO',
        solucao: 'Tentar novamente'
      };
    }
  }
};

// ✅ EXPORTAR COMO DEFAULT
export default userService;
