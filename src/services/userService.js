// src/services/userService.js - Serviço de Usuários
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

export class UserService {
  constructor() {
    this.auth = getAuth();
  }

  // ✅ GERAR SENHA TEMPORÁRIA SEGURA
  generateTempPassword() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // ✅ VERIFICAR SE EMAIL JÁ EXISTE
  async checkEmailExists(email) {
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email.toLowerCase().trim()),
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      throw new Error("Erro ao verificar email no sistema");
    }
  }

  // ✅ CARREGAR TODOS OS USUÁRIOS
  async loadUsers() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "users"), orderBy("dataCriacao", "desc")),
      );
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      throw new Error("Erro ao carregar usuários");
    }
  }

  // ✅ VALIDAR DADOS DO FORMULÁRIO COM FOCO EM LOCALIZAÇÃO
  validateFormData(formData, isEditing = false) {
    const errors = [];

    // Validações básicas
    if (!formData.email || !formData.nome) {
      errors.push("Email e nome são obrigatórios");
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Email inválido");
    }

    // ✅ VALIDAÇÃO RIGOROSA PARA OPERADORES
    if (formData.role === "user") {
      // Município obrigatório
      if (!formData.municipio || formData.municipio.trim().length === 0) {
        errors.push("Município é obrigatório para operadores");
      } else if (formData.municipio.trim().length < 2) {
        errors.push("Município deve ter pelo menos 2 caracteres");
      } else if (formData.municipio.trim().length > 100) {
        errors.push("Município não pode ter mais de 100 caracteres");
      }

      // UF obrigatória
      if (!formData.uf || formData.uf.trim().length === 0) {
        errors.push("UF é obrigatória para operadores");
      }

      // Validação de caracteres especiais no município
      const municipioRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
      if (formData.municipio && !municipioRegex.test(formData.municipio)) {
        errors.push("Município contém caracteres inválidos");
      }
    }

    // ✅ ADMINS NÃO DEVEM TER LOCALIZAÇÃO
    if (formData.role === "admin") {
      if (formData.municipio || formData.uf) {
        console.warn("⚠️ Admin com localização será limpa automaticamente");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ✅ CRIAR NOVO USUÁRIO
  async createUser(formData) {
    // Validar formulário
    const validation = this.validateFormData(formData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    // Verificar email único
    const emailExists = await this.checkEmailExists(formData.email);
    if (emailExists) {
      throw new Error("Este email já está cadastrado no sistema");
    }

    let userCredential = null;

    try {
      // Gerar senha temporária
      const senhaTemporaria = this.generateTempPassword();

      // Criar usuário no Firebase Auth
      userCredential = await createUserWithEmailAndPassword(
        this.auth,
        formData.email,
        senhaTemporaria,
      );

      // Preparar dados do usuário
      const userData = {
        uid: userCredential.user.uid,
        email: formData.email,
        nome: formData.nome,
        role: formData.role,
        status: formData.status,
        departamento: formData.departamento || "",
        telefone: formData.telefone || "",
        dataCriacao: Timestamp.now(),
        ultimoAcesso: null,
        dataModificacao: Timestamp.now(),
        primeiroAcesso: true,
        senhaTemporaria: true,
      };

      // ✅ GERENCIAR LOCALIZAÇÃO BASEADO NO PERFIL
      if (formData.role === "user") {
        // Operadores: localização obrigatória e normalizada
        userData.municipio = formData.municipio.trim();
        userData.uf = formData.uf.trim().toLowerCase();
        
        console.log(`📍 Operador criado com localização: ${userData.municipio}/${userData.uf.toUpperCase()}`);
      } else {
        // Admins: sem localização
        userData.municipio = null;
        userData.uf = null;
        
        console.log(`👑 Admin criado sem restrição de localização`);
      }

      // Criar documento no Firestore
      await addDoc(collection(db, "users"), userData);

      // Enviar email de primeiro acesso
      await sendPasswordResetEmail(this.auth, formData.email);

      return {
        success: true,
        user: userData,
        message: `Usuário criado! Email com instruções enviado para ${formData.email}`,
      };
    } catch (firestoreError) {
      // Rollback: remover usuário do Auth se Firestore falhou
      if (userCredential?.user) {
        try {
          await deleteUser(userCredential.user);
          console.log("Rollback: usuário removido do Firebase Auth");
        } catch (rollbackError) {
          console.error("Erro no rollback:", rollbackError);
        }
      }
      throw new Error("Erro ao salvar dados do usuário. Operação cancelada.");
    }
  }

  // ✅ ATUALIZAR USUÁRIO EXISTENTE
  async updateUser(userId, formData, originalEmail) {
    // Validar formulário
    const validation = this.validateFormData(formData, true);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    // Verificar email único (apenas se mudou)
    if (formData.email !== originalEmail) {
      const emailExists = await this.checkEmailExists(formData.email);
      if (emailExists) {
        throw new Error("Este email já está cadastrado no sistema");
      }
    }

    try {
      const updateData = {
        nome: formData.nome,
        role: formData.role,
        status: formData.status,
        departamento: formData.departamento || "",
        telefone: formData.telefone || "",
        dataModificacao: Timestamp.now(),
      };

      // Gerenciar localização baseado no perfil
      if (formData.role === "admin") {
        updateData.municipio = null;
        updateData.uf = null;
      } else if (formData.role === "user") {
        updateData.municipio = formData.municipio.trim();
        updateData.uf = formData.uf.trim().toLowerCase();
      }

      await updateDoc(doc(db, "users", userId), updateData);

      return {
        success: true,
        message: "Usuário atualizado com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw new Error("Erro ao atualizar usuário");
    }
  }

  // ✅ EXCLUIR USUÁRIO
  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, "users", userId));
      return {
        success: true,
        message: "Usuário excluído com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      throw new Error("Erro ao excluir usuário");
    }
  }

  // ✅ ENVIAR RESET DE SENHA
  async sendPasswordReset(user) {
    try {
      await sendPasswordResetEmail(this.auth, user.email);

      // Remover flags de primeiro acesso se existir
      if (user.primeiroAcesso) {
        await updateDoc(doc(db, "users", user.id), {
          primeiroAcesso: false,
          senhaTemporaria: false,
          dataModificacao: Timestamp.now(),
        });
      }

      return {
        success: true,
        message: `Email de alteração de senha enviado para ${user.email}!`,
      };
    } catch (error) {
      console.error("Erro ao enviar reset:", error);
      throw new Error("Erro ao enviar email de reset");
    }
  }

  // ✅ ADICIONAR LOG DE AUDITORIA
  async addLog(action, description) {
    try {
      await addDoc(collection(db, "logs"), {
        action,
        description,
        timestamp: Timestamp.now(),
        userId: this.auth.currentUser?.uid || "system",
        userEmail: this.auth.currentUser?.email || "system",
      });
    } catch (error) {
      console.error("Erro ao adicionar log:", error);
    }
  }

  // ✅ CARREGAR LOGS DE AUDITORIA
  async loadLogs() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "logs"), orderBy("timestamp", "desc")),
      );
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      throw new Error("Erro ao carregar logs");
    }
  }
}
