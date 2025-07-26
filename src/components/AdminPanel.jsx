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
    municipio: "",
    uf: "",
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

    // Validação específica para operadores
    if (formData.role === "user" && (!formData.municipio || !formData.uf)) {
      showToast("Município e UF são obrigatórios para operadores", "error");
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
      const userData = {
        uid: userCredential.user.uid,
        email: formData.email,
        nome: formData.nome,
        role: formData.role,
        status: formData.status,
        departamento: formData.departamento,
        telefone: formData.telefone,
        dataCriacao: Timestamp.now(),
        ultimoAcesso: null,
      };

      // Adicionar município e UF apenas para operadores
      if (formData.role === "user") {
        userData.municipio = formData.municipio.trim();
        userData.uf = formData.uf.trim().toLowerCase();
      }

      await addDoc(collection(db, "users"), userData);

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

    // Validação específica para operadores
    if (formData.role === "user" && (!formData.municipio || !formData.uf)) {
      showToast("Município e UF são obrigatórios para operadores", "error");
      return;
    }

    try {
      const updateData = {
        nome: formData.nome,
        role: formData.role,
        status: formData.status,
        departamento: formData.departamento,
        telefone: formData.telefone,
        dataModificacao: Timestamp.now(),
      };

      // Gerenciar município e UF baseado no perfil
      if (formData.role === "admin") {
        // Se mudou para admin, remover município e UF
        updateData.municipio = null;
        updateData.uf = null;
      } else if (formData.role === "user") {
        // Se é operador, incluir município e UF
        updateData.municipio = formData.municipio.trim();
        updateData.uf = formData.uf.trim().toLowerCase();
      }

      await updateDoc(doc(db, "users", editingUser.id), updateData);

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

  // Filtrar logs
  const filteredLogs = logs.filter((log) => {
    let matches = true;

    if (logFilters.usuario) {
      matches =
        matches &&
        (log.userEmail || "").toLowerCase().includes(logFilters.usuario.toLowerCase());
    }

    if (logFilters.acao) {
      matches =
        matches &&
        (log.action || "").toLowerCase().includes(logFilters.acao.toLowerCase());
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
            <div className="form-modal-overlay">
              <div className="form-modal">
                <div className="form-modal-header">
                  <h2>{editingUser ? "✏️ Editar Usuário" : "➕ Novo Usuário"}</h2>
                  <button className="close-button" onClick={resetForm}>
                    ✕
                  </button>
                </div>

                <form
                  className="form-container"
                  onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                >
                  <div className="form-section">
                    <h3 className="section-title">📋 Dados Pessoais</h3>
                    
                    <div className="form-row">
                      <div className="form-field">
                        <label className="field-label required">Email</label>
                        <input
                          type="email"
                          className="field-input"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={editingUser}
                          required
                          placeholder="usuario@exemplo.com"
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label required">Nome Completo</label>
                        <input
                          type="text"
                          className="field-input"
                          value={formData.nome}
                          onChange={(e) =>
                            setFormData({ ...formData, nome: e.target.value })
                          }
                          required
                          placeholder="Nome completo do usuário"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label className="field-label">Departamento</label>
                        <input
                          type="text"
                          className="field-input"
                          value={formData.departamento}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              departamento: e.target.value,
                            })
                          }
                          placeholder="Ex: Secretaria de Saúde"
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label">Telefone</label>
                        <input
                          type="tel"
                          className="field-input"
                          value={formData.telefone}
                          onChange={(e) =>
                            setFormData({ ...formData, telefone: e.target.value })
                          }
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">🔐 Configurações de Acesso</h3>
                    
                    <div className="form-row">
                      <div className="form-field">
                        <label className="field-label">Perfil do Usuário</label>
                        <select
                          className="field-select"
                          value={formData.role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            setFormData({ 
                              ...formData, 
                              role: newRole,
                              municipio: newRole === "admin" ? "" : formData.municipio,
                              uf: newRole === "admin" ? "" : formData.uf
                            });
                          }}
                        >
                          <option value="user">👤 Operador</option>
                          <option value="admin">👑 Administrador</option>
                        </select>
                        <small className="field-hint">
                          {formData.role === "admin" 
                            ? "Acesso total ao sistema" 
                            : "Acesso limitado por localização"
                          }
                        </small>
                      </div>

                      <div className="form-field">
                        <label className="field-label">Status</label>
                        <select
                          className="field-select"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                        >
                          <option value="ativo">✅ Ativo</option>
                          <option value="inativo">⏸️ Inativo</option>
                          <option value="bloqueado">🚫 Bloqueado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Seção de Localização para Operadores */}
                  {formData.role === "user" && (
                    <div className="form-section location-section">
                      <h3 className="section-title">📍 Localização de Acesso</h3>
                      <div className="location-info">
                        <p>⚠️ Operadores têm acesso limitado a emendas de sua região</p>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-field">
                          <label className="field-label required">Município</label>
                          <input
                            type="text"
                            className="field-input"
                            value={formData.municipio}
                            onChange={(e) =>
                              setFormData({ ...formData, municipio: e.target.value })
                            }
                            placeholder="Digite o nome do município"
                            required={formData.role === "user"}
                          />
                        </div>

                        <div className="form-field">
                          <label className="field-label required">Estado (UF)</label>
                          <select
                            className="field-select"
                            value={formData.uf}
                            onChange={(e) =>
                              setFormData({ ...formData, uf: e.target.value })
                            }
                            required={formData.role === "user"}
                          >
                            <option value="">Selecione o Estado</option>
                            <option value="ac">AC - Acre</option>
                            <option value="al">AL - Alagoas</option>
                            <option value="ap">AP - Amapá</option>
                            <option value="am">AM - Amazonas</option>
                            <option value="ba">BA - Bahia</option>
                            <option value="ce">CE - Ceará</option>
                            <option value="df">DF - Distrito Federal</option>
                            <option value="es">ES - Espírito Santo</option>
                            <option value="go">GO - Goiás</option>
                            <option value="ma">MA - Maranhão</option>
                            <option value="mt">MT - Mato Grosso</option>
                            <option value="ms">MS - Mato Grosso do Sul</option>
                            <option value="mg">MG - Minas Gerais</option>
                            <option value="pa">PA - Pará</option>
                            <option value="pb">PB - Paraíba</option>
                            <option value="pr">PR - Paraná</option>
                            <option value="pe">PE - Pernambuco</option>
                            <option value="pi">PI - Piauí</option>
                            <option value="rj">RJ - Rio de Janeiro</option>
                            <option value="rn">RN - Rio Grande do Norte</option>
                            <option value="rs">RS - Rio Grande do Sul</option>
                            <option value="ro">RO - Rondônia</option>
                            <option value="rr">RR - Roraima</option>
                            <option value="sc">SC - Santa Catarina</option>
                            <option value="sp">SP - São Paulo</option>
                            <option value="se">SE - Sergipe</option>
                            <option value="to">TO - Tocantins</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetForm}
                    >
                      ❌ Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingUser ? "💾 Atualizar" : "✅ Criar"} Usuário
                    </button>
                  </div>
                </form>
              </div>
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
                  <th>Município/UF</th>
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
                      {user.role === "admin" 
                        ? "🌐 Acesso Total" 
                        : user.municipio && user.uf 
                          ? `${user.municipio}/${user.uf.toUpperCase()}`
                          : "⚠️ Não configurado"
                      }
                    </td>
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

        /* ✅ FORMULÁRIO MODAL - PADRÃO SICEFSUS */
        .form-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .form-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border: 2px solid #154360;
        }

        .form-modal-header {
          background: linear-gradient(135deg, #154360, #1A5276);
          color: white;
          padding: 20px 25px;
          border-radius: 10px 10px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-modal-header h2 {
          margin: 0;
          font-size: 1.5em;
          font-weight: 600;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          font-size: 1.2em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .form-container {
          padding: 25px;
        }

        .form-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #154360;
        }

        .section-title {
          color: #154360;
          font-size: 1.1em;
          font-weight: 600;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 15px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }

        .field-label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .field-label.required::after {
          content: " *";
          color: #dc3545;
          font-weight: bold;
        }

        .field-input,
        .field-select {
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          background: white;
        }

        .field-input:focus,
        .field-select:focus {
          outline: none;
          border-color: #154360;
          box-shadow: 0 0 0 3px rgba(21, 67, 96, 0.1);
        }

        .field-input:disabled {
          background: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .field-hint {
          color: #6c757d;
          font-size: 12px;
          margin-top: 5px;
          font-style: italic;
        }

        .location-section {
          border-left-color: #ffc107;
          background: #fff8e1;
        }

        .location-info {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 15px;
        }

        .location-info p {
          margin: 0;
          color: #856404;
          font-size: 14px;
          font-weight: 500;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          padding-top: 20px;
          border-top: 2px solid #e9ecef;
          margin-top: 20px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #154360, #1A5276);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #1A5276, #2C5F84);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(21, 67, 96, 0.3);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
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

          /* ✅ RESPONSIVIDADE DO FORMULÁRIO */
          .form-modal-overlay {
            padding: 10px;
          }

          .form-modal {
            max-width: 100%;
            max-height: 95vh;
          }

          .form-modal-header {
            padding: 15px 20px;
          }

          .form-modal-header h2 {
            font-size: 1.3em;
          }

          .form-container {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .form-section {
            padding: 15px;
            margin-bottom: 20px;
          }

          .form-actions {
            flex-direction: column;
            gap: 10px;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
