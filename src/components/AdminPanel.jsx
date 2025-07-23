// AdminPanel.jsx - VERSÃO CORRIGIDA FINAL v4.0
// ✅ CORREÇÃO 1: Prop usuario adicionada
// ✅ CORREÇÃO 2: Imports corrigidos (sem validators.js)
// ✅ CORREÇÃO 3: Hook useToast compatível
// ✅ CORREÇÃO 4: Normalização UF integrada
// ✅ CORREÇÃO 5: Validações integradas no arquivo

import React, { useState, useEffect } from "react";
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
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import { useToast } from "./Toast";
import ConfirmationModal from "./ConfirmationModal";

// ✅ LISTA DE ESTADOS NORMALIZADA (lowercase)
const ESTADOS_BR = [
  { sigla: "ac", nome: "Acre" },
  { sigla: "al", nome: "Alagoas" },
  { sigla: "ap", nome: "Amapá" },
  { sigla: "am", nome: "Amazonas" },
  { sigla: "ba", nome: "Bahia" },
  { sigla: "ce", nome: "Ceará" },
  { sigla: "df", nome: "Distrito Federal" },
  { sigla: "es", nome: "Espírito Santo" },
  { sigla: "go", nome: "Goiás" },
  { sigla: "ma", nome: "Maranhão" },
  { sigla: "mt", nome: "Mato Grosso" },
  { sigla: "ms", nome: "Mato Grosso do Sul" },
  { sigla: "mg", nome: "Minas Gerais" },
  { sigla: "pa", nome: "Pará" },
  { sigla: "pb", nome: "Paraíba" },
  { sigla: "pr", nome: "Paraná" },
  { sigla: "pe", nome: "Pernambuco" },
  { sigla: "pi", nome: "Piauí" },
  { sigla: "rj", nome: "Rio de Janeiro" },
  { sigla: "rn", nome: "Rio Grande do Norte" },
  { sigla: "rs", nome: "Rio Grande do Sul" },
  { sigla: "ro", nome: "Rondônia" },
  { sigla: "rr", nome: "Roraima" },
  { sigla: "sc", nome: "Santa Catarina" },
  { sigla: "sp", nome: "São Paulo" },
  { sigla: "se", nome: "Sergipe" },
  { sigla: "to", nome: "Tocantins" },
];

// ✅ FUNÇÕES DE VALIDAÇÃO INTEGRADAS (substitui validators.js)
const validateUserData = (data) => {
  const erros = {};
  const dadosNormalizados = { ...data };

  // Validar email
  if (!data.email || !data.email.includes("@")) {
    erros.email = "Email válido é obrigatório";
  } else {
    dadosNormalizados.email = data.email.toLowerCase().trim();
  }

  // Validar senha (apenas na criação)
  if (data.senha !== undefined) {
    if (!data.senha || data.senha.length < 6) {
      erros.senha = "Senha deve ter pelo menos 6 caracteres";
    }
  }

  // Validar nome
  if (!data.nome || data.nome.trim().length < 2) {
    erros.nome = "Nome completo é obrigatório (mínimo 2 caracteres)";
  } else {
    dadosNormalizados.nome = data.nome.trim();
  }

  // Validar município
  if (!data.municipio || data.municipio.trim().length === 0) {
    erros.municipio = "Município é obrigatório";
  } else {
    dadosNormalizados.municipio = data.municipio.trim();
  }

  // Validar UF
  if (!data.uf || data.uf.length !== 2) {
    erros.uf = "UF deve ter exatamente 2 caracteres";
  } else {
    dadosNormalizados.uf = data.uf.toLowerCase().trim();
  }

  // Validar telefone (opcional, mas se preenchido deve ser válido)
  if (data.telefone && data.telefone.trim()) {
    const telefoneNumeros = data.telefone.replace(/\D/g, "");
    if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
      erros.telefone = "Telefone deve ter 10 ou 11 dígitos";
    } else {
      dadosNormalizados.telefone = telefoneNumeros;
    }
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    dadosNormalizados,
  };
};

const normalizeUF = (uf) => {
  if (!uf) return "";
  return uf.toLowerCase().trim();
};

const normalizeMunicipio = (municipio) => {
  if (!municipio) return "";
  return municipio.trim();
};

const logValidation = (tipo, dados, validacao) => {
  console.log(`🔍 ${tipo}:`, {
    dados,
    valido: validacao.valido,
    erros: validacao.erros,
    dadosNormalizados: validacao.dadosNormalizados,
  });
};

// ✅ CORREÇÃO PRINCIPAL: PROP USUARIO ADICIONADA
const AdminPanel = ({ usuario }) => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // ✅ FORMULÁRIO COM VALIDAÇÃO INTEGRADA
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    nome: "",
    role: "user",
    status: "ativo",
    departamento: "",
    telefone: "",
    municipio: "",
    uf: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Filtros logs
  const [logFilters, setLogFilters] = useState({
    usuario: "",
    acao: "",
    dataInicio: "",
    dataFim: "",
  });

  // ✅ CORREÇÃO: Hook useToast compatível
  const { showToast } = useToast();

  const auth = getAuth();

  // ✅ VERIFICAÇÃO: Prop usuario recebida
  useEffect(() => {
    if (!usuario) {
      console.error("❌ Prop 'usuario' não encontrada no AdminPanel");
      showToast("Erro: Dados do usuário não encontrados", "error");
      return;
    }
    console.log("✅ AdminPanel carregado com usuário:", usuario);
  }, [usuario, showToast]);

  useEffect(() => {
    console.log("🔄 Carregando dados do AdminPanel...");
    loadUsers();
    loadLogs();
  }, []);

  const loadUsers = async () => {
    try {
      console.log("🔄 Carregando usuários...");
      let querySnapshot;

      try {
        querySnapshot = await getDocs(
          query(collection(db, "users"), orderBy("createdAt", "desc")),
        );
      } catch (error) {
        console.log("⚠️ Tentando ordenação alternativa...");
        try {
          querySnapshot = await getDocs(
            query(collection(db, "users"), orderBy("dataCriacao", "desc")),
          );
        } catch (error2) {
          console.log("⚠️ Carregando sem ordenação...");
          querySnapshot = await getDocs(collection(db, "users"));
        }
      }

      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Usuários carregados:", usersData.length);
      setUsers(usersData);
    } catch (error) {
      console.error("❌ Erro ao carregar usuários:", error);
      showToast("Erro ao carregar usuários", "error");
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      console.log("🔄 Carregando logs...");

      let querySnapshot;
      try {
        querySnapshot = await getDocs(
          query(collection(db, "logs"), orderBy("timestamp", "desc")),
        );
      } catch (error) {
        console.log("⚠️ Carregando logs sem ordenação...");
        querySnapshot = await getDocs(collection(db, "logs"));
      }

      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Logs carregados:", logsData.length);
      setLogs(logsData);
    } catch (error) {
      console.error("❌ Erro ao carregar logs:", error);
      showToast("Erro ao carregar logs", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ VALIDAÇÃO EM TEMPO REAL DO FORMULÁRIO
  const validateForm = (data, isEdit = false) => {
    const validationData = { ...data };
    if (isEdit) {
      delete validationData.senha; // Não validar senha na edição
    }

    const validation = validateUserData(validationData);
    logValidation(
      isEdit ? "Edição de usuário" : "Criação de usuário",
      data,
      validation,
    );

    setFormErrors(validation.erros);
    return validation;
  };

  // ✅ CRIAR USUÁRIO COM VALIDAÇÃO CENTRALIZADA
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (isCreatingUser) {
      console.log("⚠️ Criação já em andamento, ignorando...");
      return;
    }

    console.log("➕ Iniciando criação de usuário...");

    // ✅ VALIDAR DADOS
    const validation = validateForm(formData, false);
    if (!validation.valido) {
      showToast("Corrija os erros no formulário antes de continuar", "error");
      return;
    }

    setIsCreatingUser(true);

    try {
      // Salvar dados do admin atual
      const currentUser = auth.currentUser;
      const adminEmail = currentUser?.email;
      const adminPassword = prompt(
        "🔐 Confirmação de Segurança\n\nPara criar um novo usuário, digite sua senha de administrador:",
      );

      if (!adminPassword) {
        showToast("Senha de admin necessária para criar usuário", "warning");
        setIsCreatingUser(false);
        return;
      }

      console.log("🔐 Criando usuário no Firebase Auth...");

      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        validation.dadosNormalizados.email,
        formData.senha,
      );

      console.log("✅ Usuário criado no Auth:", userCredential.user.uid);

      // Fazer logout do usuário recém-criado e relogar como admin
      await signOut(auth);
      console.log("🔄 Fazendo logout do usuário criado...");

      // Relogar como admin
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log("✅ Admin relogado com sucesso");

      // ✅ CRIAR DOCUMENTO COM DADOS NORMALIZADOS
      console.log("📄 Criando documento no Firestore...");
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email: validation.dadosNormalizados.email,
        nome: validation.dadosNormalizados.nome,
        role: validation.dadosNormalizados.role,
        status: validation.dadosNormalizados.status,
        departamento: validation.dadosNormalizados.departamento || "",
        telefone: validation.dadosNormalizados.telefone || "",
        municipio: validation.dadosNormalizados.municipio,
        uf: validation.dadosNormalizados.uf, // ✅ SEMPRE lowercase
        dataCriacao: Timestamp.now(),
        createdAt: Timestamp.now(),
        ultimoAcesso: null,
      });

      console.log("✅ Documento criado no Firestore");

      // Log da ação
      await addLog(
        "CREATE_USER",
        `Usuário criado: ${validation.dadosNormalizados.email} - ${validation.dadosNormalizados.municipio}/${validation.dadosNormalizados.uf.toUpperCase()}`,
      );

      showToast("Usuário criado com sucesso!", "success");

      // Recarregar lista imediatamente
      console.log("🔄 Recarregando lista de usuários...");
      loadUsers();

      resetForm();
    } catch (error) {
      console.error("❌ Erro ao criar usuário:", error);

      // Traduzir erros do Firebase
      const errorMessage = translateFirebaseError(error.code);
      showToast(errorMessage, "error");

      // Tentar relogar como admin em caso de erro
      try {
        if (adminEmail && adminPassword) {
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          console.log("✅ Admin relogado após erro");
        }
      } catch (reloginError) {
        console.error("❌ Erro ao relogar admin:", reloginError);
        showToast("Erro ao relogar. Faça login novamente.", "error");
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  // ✅ ATUALIZAR USUÁRIO COM VALIDAÇÃO CENTRALIZADA
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    console.log("✏️ Atualizando usuário:", editingUser.id);

    // ✅ VALIDAR DADOS (sem senha)
    const validation = validateForm(formData, true);
    if (!validation.valido) {
      showToast("Corrija os erros no formulário antes de continuar", "error");
      return;
    }

    try {
      // ✅ ATUALIZAR COM DADOS NORMALIZADOS
      await updateDoc(doc(db, "users", editingUser.id), {
        nome: validation.dadosNormalizados.nome,
        role: validation.dadosNormalizados.role,
        status: validation.dadosNormalizados.status,
        departamento: validation.dadosNormalizados.departamento || "",
        telefone: validation.dadosNormalizados.telefone || "",
        municipio: validation.dadosNormalizados.municipio,
        uf: validation.dadosNormalizados.uf, // ✅ SEMPRE lowercase
        dataModificacao: Timestamp.now(),
      });

      await addLog(
        "UPDATE_USER",
        `Usuário atualizado: ${validation.dadosNormalizados.email} - ${validation.dadosNormalizados.municipio}/${validation.dadosNormalizados.uf.toUpperCase()}`,
      );

      console.log("✅ Usuário atualizado com sucesso");
      showToast("Usuário atualizado com sucesso!", "success");
      loadUsers();
      resetForm();
    } catch (error) {
      console.error("❌ Erro ao atualizar usuário:", error);
      showToast("Erro ao atualizar usuário", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) {
      console.log("⚠️ Nenhum usuário selecionado para exclusão");
      return;
    }

    console.log("🗑️ Excluindo usuário:", userToDelete.id, userToDelete.email);

    try {
      await deleteDoc(doc(db, "users", userToDelete.id));

      await addLog("DELETE_USER", `Usuário excluído: ${userToDelete.email}`);

      console.log("✅ Usuário excluído com sucesso");
      showToast("Usuário excluído com sucesso!", "success");

      loadUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("❌ Erro ao excluir usuário:", error);
      showToast("Erro ao excluir usuário: " + error.message, "error");
    }
  };

  const handleResetPassword = async (user) => {
    console.log("🔑 Enviando reset de senha para:", user.email);

    try {
      await sendPasswordResetEmail(auth, user.email);
      await addLog(
        "RESET_PASSWORD",
        `Reset de senha enviado para: ${user.email}`,
      );
      console.log("✅ Email de reset enviado");
      showToast("Email de reset de senha enviado!", "success");
    } catch (error) {
      console.error("❌ Erro ao enviar reset:", error);
      showToast("Erro ao enviar email de reset", "error");
    }
  };

  const addLog = async (action, description) => {
    try {
      await addDoc(collection(db, "logs"), {
        action,
        description,
        timestamp: Timestamp.now(),
        userId: auth.currentUser?.uid || "system",
        userEmail: auth.currentUser?.email || "system",
      });
    } catch (error) {
      console.error("❌ Erro ao adicionar log:", error);
    }
  };

  // ✅ RESET FORM COM LIMPEZA DE ERROS
  const resetForm = () => {
    console.log("🔄 Resetando formulário");
    setFormData({
      email: "",
      senha: "",
      nome: "",
      role: "user",
      status: "ativo",
      departamento: "",
      telefone: "",
      municipio: "",
      uf: "",
    });
    setFormErrors({});
    setShowUserForm(false);
    setEditingUser(null);
  };

  // ✅ INICIAR EDIÇÃO COM NORMALIZAÇÃO
  const startEdit = (user) => {
    console.log("✏️ Iniciando edição do usuário:", user.id);
    setEditingUser(user);
    setFormData({
      email: user.email,
      senha: "", // Não preencher senha na edição
      nome: user.nome || "",
      role: user.role || "user",
      status: user.status || "ativo",
      departamento: user.departamento || "",
      telefone: user.telefone || "",
      municipio: user.municipio || "",
      uf: normalizeUF(user.uf || user.UF) || "", // ✅ NORMALIZAÇÃO
    });
    setFormErrors({});
    setShowUserForm(true);
  };

  const confirmDelete = (user) => {
    console.log("❓ Confirmando exclusão do usuário:", user.id, user.email);
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // ✅ ATUALIZAÇÃO EM TEMPO REAL DO FORMULÁRIO
  const updateFormField = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Validar apenas se o formulário já foi submetido uma vez
    if (Object.keys(formErrors).length > 0) {
      validateForm(newFormData, !!editingUser);
    }
  };

  // Função para traduzir erros do Firebase
  const translateFirebaseError = (errorCode) => {
    const errorMessages = {
      "auth/email-already-in-use":
        "❌ Email já cadastrado no sistema. Verifique se o usuário não foi criado anteriormente ou use um email diferente.",
      "auth/weak-password":
        "❌ Senha muito fraca. Use pelo menos 6 caracteres com letras e números.",
      "auth/invalid-email": "❌ Email inválido. Verifique o formato do email.",
      "auth/operation-not-allowed":
        "❌ Operação não permitida. Contate o administrador.",
      "auth/too-many-requests":
        "❌ Muitas tentativas. Tente novamente em alguns minutos.",
    };

    return errorMessages[errorCode] || `❌ Erro: ${errorCode}`;
  };

  // Filtrar logs
  const filteredLogs = logs.filter((log) => {
    let matches = true;

    if (logFilters.usuario) {
      matches =
        matches &&
        log.userEmail?.toLowerCase().includes(logFilters.usuario.toLowerCase());
    }

    if (logFilters.acao) {
      matches =
        matches &&
        log.action?.toLowerCase().includes(logFilters.acao.toLowerCase());
    }

    if (logFilters.dataInicio) {
      const inicio = new Date(logFilters.dataInicio);
      matches = matches && log.timestamp?.toDate() >= inicio;
    }

    if (logFilters.dataFim) {
      const fim = new Date(logFilters.dataFim);
      fim.setHours(23, 59, 59, 999);
      matches = matches && log.timestamp?.toDate() <= fim;
    }

    return matches;
  });

  // Estatísticas
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "ativo").length,
    adminUsers: users.filter((u) => u.role === "admin").length,
    recentLogins: users.filter((u) => {
      if (!u.ultimoAcesso) return false;
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return u.ultimoAcesso.toDate() > dayAgo;
    }).length,
  };

  // ✅ VERIFICAÇÃO: Prop usuario obrigatória
  if (!usuario) {
    return (
      <div className="admin-panel">
        <div className="error-container">
          <h2>❌ Erro de Configuração</h2>
          <p>Prop 'usuario' não foi passada para o AdminPanel.</p>
          <p>Verifique se o App.jsx está passando a prop corretamente:</p>
          <code>&lt;AdminPanel usuario={usuario} /&gt;</code>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner animate-spin"></div>
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header card">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value text-primary">{stats.totalUsers}</span>
            <span className="stat-label text-muted">Total Usuários</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-success">{stats.activeUsers}</span>
            <span className="stat-label text-muted">Ativos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-accent">{stats.adminUsers}</span>
            <span className="stat-label text-muted">Admins</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-warning">
              {stats.recentLogins}
            </span>
            <span className="stat-label text-muted">Login 24h</span>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Usuários
        </button>
        <button
          className={`tab ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          📋 Logs de Auditoria
        </button>
      </div>

      {activeTab === "users" && (
        <div className="users-section">
          <div className="section-header">
            <h2 className="text-primary">Gestão de Usuários</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                console.log("➕ Botão Novo Usuário clicado");
                setShowUserForm(true);
              }}
              disabled={isCreatingUser}
            >
              ➕ {isCreatingUser ? "Criando..." : "Novo Usuário"}
            </button>
          </div>

          {showUserForm && (
            <div className="user-form-container card">
              <div className="form-header">
                <h3 className="text-primary">
                  {editingUser ? "Editar Usuário" : "Novo Usuário"}
                </h3>
                <button className="btn-close" onClick={resetForm}>
                  ✕
                </button>
              </div>

              <form
                onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? "error" : ""}`}
                      value={formData.email}
                      onChange={(e) => updateFormField("email", e.target.value)}
                      disabled={editingUser}
                      required
                    />
                    {formErrors.email && (
                      <span className="error-text">{formErrors.email}</span>
                    )}
                  </div>

                  {!editingUser && (
                    <div className="form-group">
                      <label>Senha *</label>
                      <input
                        type="password"
                        className={`form-control ${formErrors.senha ? "error" : ""}`}
                        value={formData.senha}
                        onChange={(e) =>
                          updateFormField("senha", e.target.value)
                        }
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                      {formErrors.senha && (
                        <span className="error-text">{formErrors.senha}</span>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.nome ? "error" : ""}`}
                      value={formData.nome}
                      onChange={(e) => updateFormField("nome", e.target.value)}
                      placeholder="Nome e sobrenome"
                      required
                    />
                    {formErrors.nome && (
                      <span className="error-text">{formErrors.nome}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Perfil</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => updateFormField("role", e.target.value)}
                    >
                      <option value="user">Operador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) =>
                        updateFormField("status", e.target.value)
                      }
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Departamento</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.departamento}
                      onChange={(e) =>
                        updateFormField("departamento", e.target.value)
                      }
                      placeholder="Ex: Secretaria de Saúde"
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="tel"
                      className={`form-control ${formErrors.telefone ? "error" : ""}`}
                      value={formData.telefone}
                      onChange={(e) =>
                        updateFormField("telefone", e.target.value)
                      }
                      placeholder="11987654321"
                    />
                    {formErrors.telefone && (
                      <span className="error-text">{formErrors.telefone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Município *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.municipio ? "error" : ""}`}
                      value={formData.municipio}
                      onChange={(e) =>
                        updateFormField("municipio", e.target.value)
                      }
                      placeholder="Nome do município"
                      required
                    />
                    {formErrors.municipio && (
                      <span className="error-text">{formErrors.municipio}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>UF *</label>
                    <select
                      className={`form-control ${formErrors.uf ? "error" : ""}`}
                      value={formData.uf}
                      onChange={(e) => updateFormField("uf", e.target.value)}
                      required
                    >
                      <option value="">Selecione o estado</option>
                      {ESTADOS_BR.map((estado) => (
                        <option key={estado.sigla} value={estado.sigla}>
                          {estado.sigla.toUpperCase()} - {estado.nome}
                        </option>
                      ))}
                    </select>
                    {formErrors.uf && (
                      <span className="error-text">{formErrors.uf}</span>
                    )}
                  </div>
                </div>

                <div className="form-info">
                  <p>
                    <strong>⚠️ Importante:</strong> O operador visualizará
                    apenas as emendas do município/UF cadastrado.
                    {formData.municipio && formData.uf && (
                      <span className="location-preview">
                        <br />
                        📍 Localização:{" "}
                        <strong>
                          {formData.municipio}/{formData.uf.toUpperCase()}
                        </strong>
                        {formErrors.municipio || formErrors.uf ? (
                          <span className="text-error">
                            {" "}
                            - Corrija os erros
                          </span>
                        ) : (
                          <span className="text-success"> - ✅ Válida</span>
                        )}
                      </span>
                    )}
                  </p>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      isCreatingUser || Object.keys(formErrors).length > 0
                    }
                  >
                    {isCreatingUser
                      ? "Criando..."
                      : editingUser
                        ? "Atualizar"
                        : "Criar"}{" "}
                    Usuário
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="users-table card">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Município/UF</th>
                  <th>Departamento</th>
                  <th>Último Acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nome || "Nome não informado"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role}`}>
                        {user.role === "admin" ? "👑 Admin" : "👤 Operador"}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${user.status}`}>
                        {user.status === "ativo"
                          ? "✅ Ativo"
                          : user.status === "inativo"
                            ? "⏸️ Inativo"
                            : "🚫 Bloqueado"}
                      </span>
                    </td>
                    <td>
                      {user.municipio && (user.uf || user.UF) ? (
                        <span>
                          {user.municipio}/{(user.uf || user.UF).toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-error">❌ Não cadastrado</span>
                      )}
                    </td>
                    <td>{user.departamento || "-"}</td>
                    <td>
                      {user.ultimoAcesso
                        ? user.ultimoAcesso.toDate().toLocaleString("pt-BR")
                        : "Nunca"}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => startEdit(user)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-reset"
                          onClick={() => handleResetPassword(user)}
                          title="Reset Senha"
                        >
                          🔄
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => confirmDelete(user)}
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="logs-section">
          <h2 className="text-primary">📋 Logs de Auditoria</h2>

          <div className="logs-filters card">
            <div className="filter-grid">
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar por usuário..."
                value={logFilters.usuario}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, usuario: e.target.value })
                }
              />
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar por ação..."
                value={logFilters.acao}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, acao: e.target.value })
                }
              />
              <input
                type="date"
                className="form-control"
                value={logFilters.dataInicio}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, dataInicio: e.target.value })
                }
              />
              <input
                type="date"
                className="form-control"
                value={logFilters.dataFim}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, dataFim: e.target.value })
                }
              />
            </div>
          </div>

          <div className="logs-table card">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.timestamp?.toDate().toLocaleString("pt-BR")}</td>
                    <td>{log.userEmail}</td>
                    <td>
                      <span
                        className={`action-badge ${(log.action || "").toLowerCase()}`}
                      >
                        {(log.action || "").replace("_", " ")}
                      </span>
                    </td>
                    <td>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isVisible={showDeleteModal}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          console.log("❌ Exclusão cancelada");
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o usuário "${userToDelete?.nome || userToDelete?.email}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        type="danger"
      />

      {/* ✅ ESTILOS CSS COMPLETOS */}
      <style>{`
        .admin-panel {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .error-container {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          color: #721c24;
        }

        .error-container h2 {
          margin: 0 0 10px 0;
          font-size: 1.5em;
        }

        .error-container p {
          margin: 5px 0;
        }

        .error-container code {
          background: #f1f3f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          gap: 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .admin-header {
          margin-bottom: 20px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .stat-item {
          background: linear-gradient(135deg, #4A90E2, #357ABD);
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #2C5282;
          box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
        }

        .stat-value {
          display: block;
          font-size: 1.8em;
          font-weight: 700;
          color: #FFFFFF;
        }

        .stat-label {
          font-size: 0.9em;
          color: #E2E8F0;
          margin-top: 5px;
        }

        .text-primary { color: #007bff; }
        .text-success { color: #28a745; }
        .text-error, .text-danger { color: #dc3545; }
        .text-warning { color: #ffc107; }
        .text-muted { color: #6c757d; }
        .text-accent { color: #17a2b8; }

        .admin-tabs {
          display: flex;
          background: white;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .tab {
          flex: 1;
          padding: 15px 20px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          color: #495057;
        }

        .tab.active {
          background: #007bff;
          color: white;
        }

        .tab:hover:not(.active) {
          background: #e9ecef;
        }

        .users-section, .logs-section {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.5em;
          font-weight: 600;
        }

        .btn {
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          margin-right: 10px;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .user-form-container {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          margin-bottom: 25px;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .form-header h3 {
          margin: 0;
          font-size: 1.3em;
          font-weight: 600;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5em;
          cursor: pointer;
          color: #6c757d;
          padding: 5px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .btn-close:hover {
          color: #dc3545;
          background: #f1f1f1;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-weight: 500;
          color: #495057;
          font-size: 0.9em;
        }

        .form-control {
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        .form-control.error {
          border-color: #dc3545;
          background-color: rgba(220, 53, 69, 0.05);
        }

        .error-text {
          color: #dc3545;
          font-size: 0.8em;
          font-weight: 500;
          margin-top: 2px;
        }

        .form-info {
          background: #e7f3ff;
          border: 1px solid #b8daff;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .form-info p {
          margin: 0;
          color: #004085;
          font-size: 0.9em;
          line-height: 1.4;
        }

        .location-preview {
          display: block;
          margin-top: 8px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }

        .users-table, .logs-table {
          overflow-x: auto;
        }

        .users-table table,
        .logs-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td,
        .logs-table th,
        .logs-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
          font-size: 0.9em;
        }

        .users-table th,
        .logs-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 500;
        }

        .badge.admin {
          background: #dc3545;
          color: white;
        }

        .badge.user {
          background: #28a745;
          color: white;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 500;
        }

        .status.ativo {
          background: #d4edda;
          color: #155724;
        }

        .status.inativo {
          background: #fff3cd;
          color: #856404;
        }

        .status.bloqueado {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
        }

        .btn-edit,
        .btn-reset,
        .btn-delete {
          background: none;
          border: none;
          font-size: 1.1em;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .btn-edit:hover {
          background: #007bff;
          color: white;
        }

        .btn-reset:hover {
          background: #17a2b8;
          color: white;
        }

        .btn-delete:hover {
          background: #dc3545;
          color: white;
        }

        .logs-filters {
          margin-bottom: 20px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .action-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75em;
          font-weight: 500;
          text-transform: uppercase;
        }

        .action-badge.create_user {
          background: #d4edda;
          color: #155724;
        }

        .action-badge.update_user {
          background: #fff3cd;
          color: #856404;
        }

        .action-badge.delete_user {
          background: #f8d7da;
          color: #721c24;
        }

        .action-badge.reset_password {
          background: #cce5ff;
          color: #004085;
        }

        @media (max-width: 768px) {
          .admin-panel {
            padding: 10px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .users-table,
          .logs-table {
            font-size: 0.8em;
          }

          .action-buttons {
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column;
          }

          .section-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
