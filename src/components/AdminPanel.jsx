// src/components/AdminPanel.jsx - Versão Refatorada Profissional
import React, { useState, useEffect } from "react";
import { useToast } from "./Toast";
import ConfirmationModal from "./ConfirmationModal";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";
import AdminStats from "./AdminStats";
import { UserService } from "../services/userService";
import "../styles/adminStyles.css";

const AdminPanel = () => {
  // ✅ ESTADOS PRINCIPAIS
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // ✅ ESTADOS DE MODALS
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // ✅ ESTADO DO FORMULÁRIO
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    role: "user",
    status: "ativo",
    departamento: "",
    telefone: "",
    municipio: "",
    uf: "",
  });

  // ✅ FILTROS DE LOGS
  const [logFilters, setLogFilters] = useState({
    usuario: "",
    acao: "",
    dataInicio: "",
    dataFim: "",
  });

  // ✅ SERVIÇOS
  const { showToast } = useToast();
  const userService = new UserService();

  // ✅ CARREGAMENTO INICIAL
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadLogs()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToast("Erro ao carregar dados do sistema", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARREGAR USUÁRIOS
  const loadUsers = async () => {
    try {
      const usersData = await userService.loadUsers();
      setUsers(usersData);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // ✅ CARREGAR LOGS
  const loadLogs = async () => {
    try {
      const logsData = await userService.loadLogs();
      setLogs(logsData);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // ✅ CRIAR USUÁRIO
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await userService.createUser(formData);
      await userService.addLog("CREATE_USER", result.message);

      showToast(result.message, "success");
      await loadUsers();
      resetForm();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ ATUALIZAR USUÁRIO
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);

    try {
      const result = await userService.updateUser(
        editingUser.id,
        formData,
        editingUser.email,
      );
      await userService.addLog(
        "UPDATE_USER",
        `Usuário atualizado: ${formData.email}`,
      );

      showToast(result.message, "success");
      await loadUsers();
      resetForm();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ EXCLUIR USUÁRIO
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const result = await userService.deleteUser(userToDelete.id);
      await userService.addLog(
        "DELETE_USER",
        `Usuário excluído: ${userToDelete.email}`,
      );

      showToast(result.message, "success");
      await loadUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // ✅ RESET DE SENHA
  const handleResetPassword = async (user) => {
    try {
      const result = await userService.sendPasswordReset(user);
      await userService.addLog(
        "RESET_PASSWORD",
        `Reset de senha: ${user.email}`,
      );

      showToast(result.message, "success");
      await loadUsers(); // Recarregar para atualizar flags
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // ✅ UTILITÁRIOS DE FORMULÁRIO
  const resetForm = () => {
    setFormData({
      email: "",
      nome: "",
      role: "user",
      status: "ativo",
      departamento: "",
      telefone: "",
      municipio: "",
      uf: "",
    });
    setShowUserForm(false);
    setEditingUser(null);
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nome: user.nome,
      role: user.role,
      status: user.status,
      departamento: user.departamento || "",
      telefone: user.telefone || "",
      municipio: user.municipio || "",
      uf: user.uf || "",
    });
    setShowUserForm(true);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // ✅ FILTRAR LOGS
  const getFilteredLogs = () => {
    return logs.filter((log) => {
      let matches = true;

      if (logFilters.usuario) {
        matches =
          matches &&
          (log.userEmail || "")
            .toLowerCase()
            .includes(logFilters.usuario.toLowerCase());
      }

      if (logFilters.acao) {
        matches =
          matches &&
          (log.action || "")
            .toLowerCase()
            .includes(logFilters.acao.toLowerCase());
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
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* ✅ HEADER COM ESTATÍSTICAS */}
      <div className="admin-header">
        <div className="header-content">
          <h1>🔐 Painel Administrativo</h1>
          <AdminStats users={users} />
        </div>
      </div>

      {/* ✅ NAVEGAÇÃO POR TABS */}
      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Usuários ({users.length})
        </button>
        <button
          className={`tab ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          📋 Logs de Auditoria ({logs.length})
        </button>
      </div>

      {/* ✅ ABA DE USUÁRIOS */}
      {activeTab === "users" && (
        <div className="users-section">
          <div className="section-header">
            <h2>Gestão de Usuários</h2>
            <button
              className="btn-primary"
              onClick={() => setShowUserForm(true)}
              disabled={saving}
            >
              ➕ Novo Usuário
            </button>
          </div>

          <UsersTable
            users={users}
            onEdit={startEdit}
            onResetPassword={handleResetPassword}
            onDelete={confirmDelete}
            saving={saving}
          />
        </div>
      )}

      {/* ✅ ABA DE LOGS */}
      {activeTab === "logs" && (
        <div className="logs-section">
          <div className="section-header">
            <h2>📋 Logs de Auditoria</h2>
          </div>

          {/* ✅ FILTROS DE LOGS */}
          <div className="logs-filters">
            <div className="filter-grid">
              <input
                type="text"
                placeholder="Filtrar por usuário..."
                value={logFilters.usuario}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, usuario: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Filtrar por ação..."
                value={logFilters.acao}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, acao: e.target.value })
                }
              />
              <input
                type="date"
                placeholder="Data início"
                value={logFilters.dataInicio}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, dataInicio: e.target.value })
                }
              />
              <input
                type="date"
                placeholder="Data fim"
                value={logFilters.dataFim}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, dataFim: e.target.value })
                }
              />
            </div>
          </div>

          {/* ✅ TABELA DE LOGS */}
          <div className="logs-table">
            <div className="table-container">
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
                  {getFilteredLogs().map((log) => (
                    <tr key={log.id}>
                      <td>{log.timestamp?.toDate().toLocaleString("pt-BR")}</td>
                      <td>{log.userEmail}</td>
                      <td>
                        <span
                          className={`action-badge ${log.action.toLowerCase()}`}
                        >
                          {log.action.replace("_", " ")}
                        </span>
                      </td>
                      <td>{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE FORMULÁRIO */}
      {showUserForm && (
        <UserForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={resetForm}
          editingUser={editingUser}
          saving={saving}
        />
      )}

      {/* ✅ MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o usuário "${userToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        confirmButtonClass="btn-danger"
      />
    </div>
  );
};

export default AdminPanel;
