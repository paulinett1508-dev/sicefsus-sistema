// AdminPanel.jsx - CORREÇÃO CRÍTICA v6.0
// ✅ CORREÇÃO 1: Prevenção de duplicação de usuários
// ✅ CORREÇÃO 2: Sistema de mutex para criação
// ✅ CORREÇÃO 3: Validação prévia de email existente

import React, { useState, useEffect, useRef } from "react";
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

// ✅ MUTEX GLOBAL para prevenir criação simultânea
let creationMutex = false;

const AdminPanel = ({ usuario }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // ✅ REF para controle de componente montado
  const isMountedRef = useRef(true);

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
  const { showToast } = useToast();
  const auth = getAuth();

  // ✅ CLEANUP ao desmontar componente
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      creationMutex = false; // Reset mutex
    };
  }, []);

  useEffect(() => {
    // ✅ Verificar se Firebase está configurado antes de carregar usuários
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      console.error("❌ AdminPanel: Firebase não configurado");
      setLoading(false);
      return;
    }
    
    console.log("🔄 AdminPanel: Carregando usuários...");
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (isMountedRef.current) {
        setUsers(usersData);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar usuários:", error);
      if (isMountedRef.current) {
        showToast("Erro ao carregar usuários", "error");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // ✅ VALIDAÇÃO PRÉVIA - Verificar se email já existe
  const verificarEmailExistente = async (email) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", normalizedEmail)),
      );

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      return false;
    }
  };

  // ✅ VALIDAÇÃO COM VERIFICAÇÃO DE EMAIL
  const validateFormWithEmailCheck = async (data) => {
    const erros = {};

    // Validação básica
    if (!data.email || !data.email.includes("@")) {
      erros.email = "Email válido é obrigatório";
    } else {
      // ✅ VERIFICAR SE EMAIL JÁ EXISTE
      const emailExiste = await verificarEmailExistente(data.email);
      if (emailExiste && !editingUser) {
        erros.email = "Este email já está cadastrado no sistema";
      }
    }

    if (!editingUser && (!data.senha || data.senha.length < 6)) {
      erros.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!data.nome || data.nome.trim().length < 2) {
      erros.nome = "Nome completo é obrigatório";
    }

    // Validação condicional para operadores
    if (data.role !== "admin") {
      if (!data.municipio || data.municipio.trim().length === 0) {
        erros.municipio = "Município é obrigatório para operadores";
      }
      if (!data.uf || data.uf.length !== 2) {
        erros.uf = "UF é obrigatório para operadores";
      }
    }

    setFormErrors(erros);
    return Object.keys(erros).length === 0;
  };

  // ✅ CRIAÇÃO DE USUÁRIO COM MUTEX E VERIFICAÇÕES
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // ✅ VERIFICAÇÃO 1: Mutex global
    if (creationMutex) {
      showToast("⚠️ Criação já em andamento. Aguarde...", "warning");
      return;
    }

    // ✅ VERIFICAÇÃO 2: Estado local
    if (isCreatingUser) {
      return;
    }

    // ✅ VERIFICAÇÃO 3: Componente montado
    if (!isMountedRef.current) {
      return;
    }

    // ✅ ATIVAR MUTEX E ESTADO
    creationMutex = true;
    setIsCreatingUser(true);

    try {
      console.log("🔒 MUTEX ATIVADO - Iniciando criação de usuário");

      // ✅ VALIDAÇÃO COMPLETA COM EMAIL
      const isValid = await validateFormWithEmailCheck(formData);
      if (!isValid) {
        showToast("Corrija os erros no formulário", "error");
        return;
      }

      // ✅ VERIFICAÇÃO DUPLA DE EMAIL
      const emailJaExiste = await verificarEmailExistente(formData.email);
      if (emailJaExiste) {
        setFormErrors({ email: "Email já cadastrado durante a validação" });
        showToast("❌ Email já existe no sistema", "error");
        return;
      }

      // ✅ CONFIRMAÇÃO DE SENHA ADMIN
      const currentUser = auth.currentUser;
      const adminEmail = currentUser?.email;
      const adminPassword = prompt(
        "🔐 Para criar usuário, digite sua senha de administrador:",
      );

      if (!adminPassword) {
        showToast("Senha de admin necessária", "warning");
        return;
      }

      console.log("👤 Criando usuário no Firebase Auth...");

      // ✅ CRIAÇÃO NO AUTH COM TIMEOUT
      const createPromise = createUserWithEmailAndPassword(
        auth,
        formData.email.toLowerCase().trim(),
        formData.senha,
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout na criação")), 10000),
      );

      const userCredential = await Promise.race([
        createPromise,
        timeoutPromise,
      ]);
      console.log("✅ Usuário criado no Auth:", userCredential.user.uid);

      // ✅ LOGOUT DO USUÁRIO CRIADO
      await signOut(auth);
      console.log("🔄 Usuário criado deslogado");

      // ✅ RELOGAR ADMIN
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log("✅ Admin relogado");

      // ✅ VERIFICAÇÃO FINAL: Se componente ainda montado
      if (!isMountedRef.current) {
        console.log("⚠️ Componente desmontado durante criação");
        return;
      }

      // ✅ CRIAR DOCUMENTO NO FIRESTORE
      const documentData = {
        uid: userCredential.user.uid,
        email: formData.email.toLowerCase().trim(),
        nome: formData.nome.trim(),
        role: formData.role,
        status: formData.status,
        departamento: formData.departamento || "",
        telefone: formData.telefone || "",
        dataCriacao: Timestamp.now(),
        createdAt: Timestamp.now(),
        ultimoAcesso: null,
      };

      // ✅ ADICIONAR LOCALIZAÇÃO APENAS PARA OPERADORES
      if (formData.role !== "admin") {
        documentData.municipio = formData.municipio.trim();
        documentData.uf = formData.uf.toLowerCase().trim();
      }

      await addDoc(collection(db, "users"), documentData);
      console.log("✅ Documento criado no Firestore");

      // ✅ LOG DE AUDITORIA
      const logMessage =
        formData.role === "admin"
          ? `Admin criado: ${formData.email}`
          : `Operador criado: ${formData.email} - ${formData.municipio}/${formData.uf.toUpperCase()}`;

      await addLog("CREATE_USER", logMessage);

      // ✅ FEEDBACK E LIMPEZA
      if (isMountedRef.current) {
        showToast("✅ Usuário criado com sucesso!", "success");
        await loadUsers();
        resetForm();
      }
    } catch (error) {
      console.error("❌ Erro na criação:", error);

      if (isMountedRef.current) {
        let errorMessage = "Erro ao criar usuário";

        if (error.code === "auth/email-already-in-use") {
          errorMessage = "❌ Email já cadastrado no Firebase Auth";
          setFormErrors({ email: "Email já existe no Firebase" });
        } else if (error.code === "auth/weak-password") {
          errorMessage = "❌ Senha muito fraca";
          setFormErrors({ senha: "Senha deve ser mais forte" });
        } else if (error.message === "Timeout na criação") {
          errorMessage = "❌ Timeout - Tente novamente";
        }

        showToast(errorMessage, "error");
      }

      // ✅ TENTAR RELOGAR ADMIN EM CASO DE ERRO
      try {
        const adminEmail = auth.currentUser?.email || usuario?.email;
        if (adminEmail) {
          // Não podemos relogar automaticamente sem senha
          console.log("⚠️ Admin precisa fazer login novamente");
        }
      } catch (reloginError) {
        console.error("Erro no relogin:", reloginError);
      }
    } finally {
      // ✅ SEMPRE LIMPAR MUTEX E ESTADO
      creationMutex = false;

      if (isMountedRef.current) {
        setIsCreatingUser(false);
      }

      console.log("🔓 MUTEX LIBERADO");
    }
  };

  // ✅ FUNÇÃO AUXILIAR PARA LOGS
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

  // ✅ RESET FORM LIMPO
  const resetForm = () => {
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

  // ✅ INTERFACE SEM ALTERAÇÕES (mantém design original)
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
      <div className="admin-header card">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Total Usuários</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {users.filter((u) => u.status === "ativo").length}
            </span>
            <span className="stat-label">Ativos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {users.filter((u) => u.role === "admin").length}
            </span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      <div className="users-section">
        <div className="section-header">
          <h2>👥 Gestão de Usuários</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowUserForm(true)}
            disabled={isCreatingUser || creationMutex}
          >
            {isCreatingUser || creationMutex
              ? "🔒 Criando usuário..."
              : "➕ Novo Usuário"}
          </button>
        </div>

        {showUserForm && (
          <div className="user-form-container card">
            <div className="form-header">
              <h3>{editingUser ? "Editar Usuário" : "Novo Usuário"}</h3>
              <button className="btn-close" onClick={resetForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? "error" : ""}`}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={editingUser || isCreatingUser}
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
                        setFormData((prev) => ({
                          ...prev,
                          senha: e.target.value,
                        }))
                      }
                      disabled={isCreatingUser}
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    disabled={isCreatingUser}
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: e.target.value,
                        // Limpar campos se mudou para admin
                        municipio:
                          e.target.value === "admin" ? "" : prev.municipio,
                        uf: e.target.value === "admin" ? "" : prev.uf,
                      }))
                    }
                    disabled={isCreatingUser}
                  >
                    <option value="user">Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {/* Campos condicionais para operadores */}
                {formData.role !== "admin" && (
                  <>
                    <div className="form-group">
                      <label>Município *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.municipio ? "error" : ""}`}
                        value={formData.municipio}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            municipio: e.target.value,
                          }))
                        }
                        disabled={isCreatingUser}
                        required
                      />
                      {formErrors.municipio && (
                        <span className="error-text">
                          {formErrors.municipio}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>UF *</label>
                      <select
                        className={`form-control ${formErrors.uf ? "error" : ""}`}
                        value={formData.uf}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            uf: e.target.value,
                          }))
                        }
                        disabled={isCreatingUser}
                        required
                      >
                        <option value="">Selecione...</option>
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
                      {formErrors.uf && (
                        <span className="error-text">{formErrors.uf}</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Alerta de status */}
              {(isCreatingUser || creationMutex) && (
                <div className="creation-status">
                  <div className="status-icon">🔒</div>
                  <div className="status-text">
                    <strong>Criação em andamento...</strong>
                    <br />
                    <small>
                      Não feche esta janela. O processo pode levar alguns
                      segundos.
                    </small>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={isCreatingUser || creationMutex}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    isCreatingUser ||
                    creationMutex ||
                    Object.keys(formErrors).length > 0
                  }
                >
                  {isCreatingUser || creationMutex
                    ? "🔒 Criando..."
                    : editingUser
                      ? "Atualizar"
                      : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de usuários existente... */}
        <div className="users-table card">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Localização</th>
                <th>Criado em</th>
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
                      {user.status === "ativo" ? "✅ Ativo" : "❌ Inativo"}
                    </span>
                  </td>
                  <td>
                    {user.role === "admin" ? (
                      <span className="admin-access">👑 Acesso Total</span>
                    ) : user.municipio && user.uf ? (
                      <span>
                        {user.municipio}/{user.uf.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-error">❌ Não cadastrado</span>
                    )}
                  </td>
                  <td>
                    {user.createdAt?.toDate()?.toLocaleDateString("pt-BR") ||
                      user.dataCriacao?.toDate()?.toLocaleDateString("pt-BR") ||
                      "Não informado"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
          color: white;
        }

        .stat-value {
          display: block;
          font-size: 1.8em;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.9em;
          opacity: 0.9;
          margin-top: 5px;
        }

        .users-section {
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

        .btn {
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
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
          opacity: 0.6;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
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
          padding-bottom: 15px;
          border-bottom: 1px solid #dee2e6;
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
          padding: 5px;
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
        }

        .form-control {
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
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

        .form-control:disabled {
          background-color: #e9ecef;
          opacity: 0.6;
        }

        .error-text {
          color: #dc3545;
          font-size: 0.8em;
          font-weight: 500;
        }

        /* ✅ NOVO: Status de criação */
        .creation-status {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          margin: 20px 0;
        }

        .status-icon {
          font-size: 24px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-text {
          flex: 1;
          color: #856404;
        }

        .status-text strong {
          font-size: 14px;
        }

        .status-text small {
          font-size: 12px;
          opacity: 0.8;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }

        .users-table {
          overflow-x: auto;
        }

        .users-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }

        .users-table th {
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
          background: #f8d7da;
          color: #721c24;
        }

        .admin-access {
          color: #856404;
          font-weight: 500;
          font-size: 0.9em;
        }

        .text-error {
          color: #dc3545;
          font-weight: 500;
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
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
