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
} from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import { useToast } from "./Toast";
import ConfirmationModal from "./ConfirmationModal";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Formulário usuário
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    role: "user",
    status: "ativo",
    departamento: "",
    telefone: "",
  });

  // Filtros logs
  const [logFilters, setLogFilters] = useState({
    usuario: "",
    acao: "",
    dataInicio: "",
    dataFim: "",
  });

  const { showToast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "users"), orderBy("dataCriacao", "desc")),
      );
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      showToast("Erro ao carregar usuários", "error");
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(
        query(collection(db, "logs"), orderBy("timestamp", "desc")),
      );
      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logsData);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      showToast("Erro ao carregar logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.nome) {
      showToast("Email e nome são obrigatórios", "error");
      return;
    }

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        "TempPassword123!", // Senha temporária
      );

      // Criar documento do usuário no Firestore
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email: formData.email,
        nome: formData.nome,
        role: formData.role,
        status: formData.status,
        departamento: formData.departamento,
        telefone: formData.telefone,
        dataCriacao: Timestamp.now(),
        ultimoAcesso: null,
      });

      // Enviar email de reset de senha
      await sendPasswordResetEmail(auth, formData.email);

      // Log da ação
      await addLog("CREATE_USER", `Usuário criado: ${formData.email}`);

      showToast(
        "Usuário criado com sucesso! Email de configuração enviado.",
        "success",
      );
      loadUsers();
      resetForm();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      showToast("Erro ao criar usuário: " + error.message, "error");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        nome: formData.nome,
        role: formData.role,
        status: formData.status,
        departamento: formData.departamento,
        telefone: formData.telefone,
        dataModificacao: Timestamp.now(),
      });

      await addLog("UPDATE_USER", `Usuário atualizado: ${formData.email}`);

      showToast("Usuário atualizado com sucesso!", "success");
      loadUsers();
      resetForm();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      showToast("Erro ao atualizar usuário", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      await addLog("DELETE_USER", `Usuário excluído: ${userToDelete.email}`);

      showToast("Usuário excluído com sucesso!", "success");
      loadUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      showToast("Erro ao excluir usuário", "error");
    }
  };

  const handleResetPassword = async (user) => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      await addLog(
        "RESET_PASSWORD",
        `Reset de senha enviado para: ${user.email}`,
      );
      showToast("Email de reset de senha enviado!", "success");
    } catch (error) {
      console.error("Erro ao enviar reset:", error);
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
      console.error("Erro ao adicionar log:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      nome: "",
      role: "user",
      status: "ativo",
      departamento: "",
      telefone: "",
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
    });
    setShowUserForm(true);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔐 Painel Administrativo</h1>
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Total Usuários</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.activeUsers}</span>
            <span className="stat-label">Ativos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.adminUsers}</span>
            <span className="stat-label">Admins</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.recentLogins}</span>
            <span className="stat-label">Login 24h</span>
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
            <h2>Gestão de Usuários</h2>
            <button
              className="btn-primary"
              onClick={() => setShowUserForm(true)}
            >
              ➕ Novo Usuário
            </button>
          </div>

          {showUserForm && (
            <div className="user-form-container">
              <div className="form-header">
                <h3>{editingUser ? "Editar Usuário" : "Novo Usuário"}</h3>
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
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={editingUser}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Perfil</label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
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
                      value={formData.departamento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departamento: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingUser ? "Atualizar" : "Criar"} Usuário
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Departamento</th>
                  <th>Último Acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role}`}>
                        {user.role === "admin" ? "👑 Admin" : "👤 Usuário"}
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
          <h2>📋 Logs de Auditoria</h2>

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
                value={logFilters.dataInicio}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, dataInicio: e.target.value })
                }
              />
              <input
                type="date"
                value={logFilters.dataFim}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, dataFim: e.target.value })
                }
              />
            </div>
          </div>

          <div className="logs-table">
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
      )}

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

        .admin-header h1 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.8em;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .stat-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #007bff;
        }

        .stat-value {
          display: block;
          font-size: 1.8em;
          font-weight: 700;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 0.9em;
          color: #6c757d;
          margin-top: 5px;
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
          color: #2c3e50;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          margin-right: 10px;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .user-form-container {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
          border: 1px solid #dee2e6;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .form-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5em;
          cursor: pointer;
          color: #6c757d;
        }

        .btn-close:hover {
          color: #dc3545;
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
        }

        .form-group label {
          font-weight: 500;
          margin-bottom: 5px;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select {
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .users-table, .logs-table {
          overflow-x: auto;
        }

        .users-table table,
        .logs-table table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .users-table th,
        .users-table td,
        .logs-table th,
        .logs-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }

        .users-table th,
        .logs-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
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
          font-size: 0.85em;
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
          font-size: 1.2em;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          transition: background-color 0.2s;
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

        .filter-grid input {
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }

        .action-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
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
            font-size: 0.9em;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
