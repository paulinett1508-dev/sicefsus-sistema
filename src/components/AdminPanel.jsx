// src/components/AdminPanel.jsx - Versão Completa e Funcional
import React, { useState, useEffect } from "react";
import { useToast } from "./Toast";
import ConfirmationModal from "./ConfirmationModal";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";
import AdminStats from "./AdminStats";
import { UserService } from "../services/userService";

const AdminPanel = () => {
  // ✅ ESTADOS PRINCIPAIS
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [logs, setLogs] = useState([]);

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

  const loadUsers = async () => {
    try {
      const loadedUsers = await userService.loadUsers();
      setUsers(loadedUsers);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      showToast("Erro ao carregar usuários", "error");
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

  // ✅ CRIAR NOVO USUÁRIO
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await userService.createUser(formData);
      await userService.addLog("CREATE_USER", `Usuário criado: ${formData.email}`);

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
      const result = await userService.updateUser(editingUser.id, formData, editingUser.email);
      await userService.addLog("UPDATE_USER", `Usuário atualizado: ${formData.email}`);

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
      await userService.addLog("DELETE_USER", `Usuário excluído: ${userToDelete.email}`);

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
      await userService.addLog("RESET_PASSWORD", `Reset de senha: ${user.email}`);

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

  // ✅ HANDLERS DE AÇÕES
  const handleNovoUsuario = () => {
    console.log("🆕 Botão Novo Usuário clicado");
    resetForm();
    setShowUserForm(true);
  };

  const handleEditarUsuario = (user) => {
    console.log("✏️ Editando usuário:", user);
    setFormData({
      email: user.email || "",
      nome: user.nome || "",
      role: user.role || "user",
      status: user.status || "ativo",
      departamento: user.departamento || "",
      telefone: user.telefone || "",
      municipio: user.municipio || "",
      uf: user.uf || "",
    });
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleConfirmarExclusao = (user) => {
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>⏳</div>
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ✅ HEADER */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>
            <span style={styles.headerIcon}>👥</span>
            Administração de Usuários
          </h1>
          <p style={styles.headerSubtitle}>
            Gerencie usuários, permissões e acessos do sistema SICEFSUS
          </p>
        </div>
        <button
          style={styles.addButton}
          onClick={handleNovoUsuario}
          disabled={loading || saving}
        >
          <span style={styles.buttonIcon}>➕</span>
          Novo Usuário
        </button>
      </div>

        {/* ✅ ESTATÍSTICAS */}
        <AdminStats users={users} />

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
            </div>

            <UsersTable
              users={users}
              onEdit={handleEditarUsuario}
              onResetPassword={handleResetPassword}
              onDelete={handleConfirmarExclusao}
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
        cancelText="Cancelar"
      />
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "var(--font-family)",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
  },

  loadingSpinner: {
    fontSize: "3em",
    marginBottom: "20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    gap: "20px",
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: "2em",
    fontWeight: "700",
    color: "var(--primary)",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  headerIcon: {
    fontSize: "0.9em",
  },

  headerSubtitle: {
    color: "var(--theme-text-secondary)",
    fontSize: "1.1em",
    margin: 0,
    lineHeight: "1.4",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, var(--success), var(--success-dark))",
    color: "var(--white)",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "1em",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "var(--shadow)",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  buttonIcon: {
    fontSize: "1.1em",
  },

  tableContainer: {
    background: "var(--theme-surface)",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "var(--shadow)",
    border: "2px solid var(--theme-border)",
  },

  tableHeader: {
    padding: "20px 24px",
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    borderBottom: "2px solid var(--theme-border)",
  },

  tableTitle: {
    color: "var(--white)",
    fontSize: "1.3em",
    fontWeight: "600",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  tableIcon: {
    fontSize: "0.9em",
  },
};

export default AdminPanel;