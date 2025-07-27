// src/components/AdminPanel.jsx - Versão Refatorada Profissional
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
      await Promise.all([
        loadUsers(),
        loadLogs()
      ]);
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
        matches = matches && (log.userEmail || "")
          .toLowerCase()
          .includes(logFilters.usuario.toLowerCase());
      }

      if (logFilters.acao) {
        matches = matches && (log.action || "")
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
                        <span className={`action-badge ${log.action.toLowerCase()}`}>
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

      <style>{`
        .admin-panel {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
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

        .admin-header {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .header-content h1 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.8em;
        }

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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
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
          padding-bottom: 15px;
          border-bottom: 2px solid #f8f9fa;
        }

        .section-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.4em;
        }

        .btn-primary {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-primary:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .logs-filters {
          margin-bottom: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .filter-grid input {
          padding: 10px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .filter-grid input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .logs-table table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .logs-table th,
        .logs-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }

        .logs-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
          font-size: 14px;
        }

        .logs-table td {
          font-size: 14px;
          color: #495057;
        }

        .logs-table tr:hover {
          background: #f8f9fa;
        }

        .action-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
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

        .action-badge.error {
          background: #f8d7da;
          color: #721c24;
        }

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
      await Promise.all([
        loadUsers(),
        loadLogs()
      ]);
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
        matches = matches && (log.userEmail || "")
          .toLowerCase()
          .includes(logFilters.usuario.toLowerCase());
      }

      if (logFilters.acao) {
        matches = matches && (log.action || "")
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
                        <span className={`action-badge ${log.action.toLowerCase()}`}>
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
      `}</style>
    </div>
  );
};

export default AdminPanel;