// 🔧 CORREÇÃO: Administracao.jsx - Implementar Modal de Usuário
// ✅ Preservar toda estrutura existente
// ✅ Adicionar apenas o necessário para o modal funcionar

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auditService } from "../services/auditService";
// ✅ ADICIONAR: Import do UserForm e userService
import UserForm from "./UserForm";
import userService from "../services/userService"; // Corrigido: import default
import Toast from "./Toast";
import ConfirmationModal from "./ConfirmationModal";

const Administracao = () => {
  // Estados principais
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ ADICIONAR: Estados para o modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    role: "user",
    municipio: "",
    uf: "",
    status: "ativo",
    departamento: "",
    telefone: "",
  });

  // ✅ ADICIONAR: Estados para feedback
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Estados para logs
  const [activeTab, setActiveTab] = useState("users");
  const [logs, setLogs] = useState([]);
  const [logFilters, setLogFilters] = useState({
    usuario: "",
    acao: "",
    dataInicio: "",
    dataFim: "",
  });

  // ✅ CORREÇÃO: Implementar carregamento real de usuários com debugging
  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      console.log("📋 Carregando usuários...");

      // Buscar usuários no Firestore
      const usuariosRef = collection(db, "usuarios");
      const snapshot = await getDocs(usuariosRef);

      const usuariosData = [];
      snapshot.forEach((doc) => {
        const userData = {
          id: doc.id, // ✅ ID do documento Firestore
          ...doc.data(),
        };
        usuariosData.push(userData);
        
        // ✅ DEBUG: Mostrar estrutura de dados
        console.log("👤 Usuário carregado:", {
          documentId: doc.id,
          uid: userData.uid,
          email: userData.email,
          nome: userData.nome,
          status: userData.status
        });
      });

      setUsuarios(usuariosData);
      console.log(`✅ ${usuariosData.length} usuários carregados com sucesso`);
    } catch (error) {
      console.error("❌ Erro ao carregar usuários:", error);
      showToast("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPLEMENTAR: Handler para novo usuário
  const handleNovoUsuario = () => {
    console.log("🆕 Abrindo modal de novo usuário");
    setEditingUser(null);
    setFormData({
      nome: "",
      email: "",
      role: "user",
      municipio: "",
      uf: "",
      status: "ativo",
      departamento: "",
      telefone: "",
    });
    setShowUserModal(true);
  };

  // ✅ CORREÇÃO CRÍTICA: Handler para editar usuário
  const handleEditarUsuario = (usuario) => {
    console.log("✏️ Editando usuário:", usuario);
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome || "",
      email: usuario.email || "", // ✅ CORREÇÃO: Incluir email
      role: usuario.tipo === "admin" ? "admin" : "user", // ✅ CORREÇÃO: Mapear corretamente
      municipio: usuario.municipio || "",
      uf: usuario.uf || "",
      status: usuario.status || "ativo",
      departamento: usuario.departamento || "",
      telefone: usuario.telefone || "",
    });
    setShowUserModal(true);
  };

  // ✅ CORREÇÃO CRÍTICA: Handler para salvar usuário
  const handleSalvarUsuario = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      console.log("💾 Salvando usuário:", formData);

      if (editingUser) {
        // ✅ CORREÇÃO: Atualizar usuário existente COM email original
        await userService.updateUser(
          editingUser.id,
          {
            nome: formData.nome,
            email: formData.email, // ✅ INCLUIR email no formData
            role: formData.role === "admin" ? "admin" : "operador",
            municipio: formData.role === "admin" ? "" : formData.municipio,
            uf: formData.role === "admin" ? "" : formData.uf,
            status: formData.status,
            departamento: formData.departamento,
            telefone: formData.telefone,
          },
          editingUser.email, // ✅ CORREÇÃO: Passar email original como terceiro parâmetro
        );

        showToast("✅ Usuário atualizado com sucesso!", "success");
      } else {
        // Criar novo usuário
        const resultado = await userService.createUser({
          email: formData.email,
          nome: formData.nome,
          role: formData.role === "admin" ? "admin" : "operador", // ✅ USAR role ao invés de tipo
          municipio: formData.role === "admin" ? "" : formData.municipio,
          uf: formData.role === "admin" ? "" : formData.uf,
          status: formData.status,
          departamento: formData.departamento,
          telefone: formData.telefone,
        });

        if (resultado.success) {
          showToast(
            `✅ Usuário criado com sucesso! Email de configuração enviado.`,
            "success",
          );
        }
      }

      // Fechar modal e recarregar lista
      setShowUserModal(false);
      await carregarUsuarios();
    } catch (error) {
      console.error("❌ Erro ao salvar usuário:", error);
      showToast(error.message || "Erro ao salvar usuário", "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ FUNÇÃO CORRIGIDA PARA EXCLUIR USUÁRIO PERMANENTEMENTE
  const handleExcluirUsuario = async (usuario) => {
    console.log("🗑️ handleExcluirUsuario chamado com:", {
      id: usuario?.id,
      uid: usuario?.uid,
      nome: usuario?.nome,
      status: usuario?.status
    });

    // ✅ CORREÇÃO: Verificar tanto ID quanto UID
    if (!usuario?.id && !usuario?.uid) {
      console.error("❌ ID ou UID do usuário não fornecido");
      showToast("❌ Dados do usuário incompletos", "error");
      return;
    }

    // Verificar se o usuário está inativo
    if (usuario.status === "ativo") {
      showToast("⚠️ Desative o usuário antes de excluí-lo", "warning");
      return;
    }

    // Confirmar exclusão permanente
    setConfirmModal({
      isOpen: true,
      title: "Excluir Usuário Permanentemente",
      message: `Tem certeza que deseja excluir permanentemente o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`,
      type: "danger",
      onConfirm: async () => {
        try {
          console.log("🗑️ Executando exclusão permanente...");
          
          let documentId = null;
          let userUid = usuario.uid;

          // ✅ CORREÇÃO: Se temos o ID do documento, usar diretamente
          if (usuario.id) {
            documentId = usuario.id;
            console.log("📋 Usando ID do documento direto:", documentId);
          } else {
            // ✅ FALLBACK: Buscar por UID se não temos o ID
            console.log("🔍 Buscando documento por UID:", usuario.uid);
            const usuariosQuery = query(
              collection(db, "usuarios"),
              where("uid", "==", usuario.uid)
            );
            const usuariosSnapshot = await getDocs(usuariosQuery);

            if (usuariosSnapshot.empty) {
              throw new Error("Usuário não encontrado na base de dados");
            }

            documentId = usuariosSnapshot.docs[0].id;
            console.log("📋 ID do documento encontrado:", documentId);
          }

          // ✅ CORREÇÃO: Excluir usando o ID correto
          await deleteDoc(doc(db, "usuarios", documentId));
          console.log("✅ Usuário excluído do Firestore com ID:", documentId);

          // ⚠️ NOTA: Exclusão do Firebase Auth deve ser feita no backend
          console.log("⚠️ UID para exclusão do Auth (backend):", userUid);

          // Log de auditoria
          if (window.auditService) {
            await window.auditService.logAction(
              "DELETE_USER",
              `Usuário ${usuario.nome} (${usuario.email}) excluído permanentemente`,
              {
                usuarioExcluido: {
                  documentId: documentId,
                  uid: userUid,
                  nome: usuario.nome,
                  email: usuario.email,
                  municipio: usuario.municipio,
                  uf: usuario.uf,
                },
              }
            );
          }

          showToast("✅ Usuário excluído permanentemente do sistema!", "success");
          await carregarUsuarios();
        } catch (error) {
          console.error("❌ Erro ao excluir usuário:", error);
          showToast(`❌ Erro ao excluir usuário: ${error.message}`, "error");
        }
      },
      onCancel: () => {
        console.log("❌ Exclusão cancelada pelo usuário");
      },
    });
  };

  const handleToggleStatus = async (usuario) => {
    try {
      const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo";

      // ✅ Update simples apenas do status
      const userRef = doc(db, "usuarios", usuario.id);
      await updateDoc(userRef, {
        status: novoStatus,
        dataAtualizacao: new Date(),
      });

      showToast(`✅ Status alterado para ${novoStatus}!`, "success");
      await carregarUsuarios();
    } catch (error) {
      console.error("❌ Erro ao alterar status:", error);
      showToast("Erro ao alterar status", "error");
    }
  };

  // ✅ ADICIONAR: Nova função para inativar antes de excluir
  const handleInativarUsuario = async (usuario) => {
    if (usuario.status === "inativo") {
      // Se já está inativo, pode excluir
      handleExcluirUsuario(usuario);
      return;
    }

    // Se está ativo, primeiro inativar
    setConfirmModal({
      isOpen: true,
      title: "Inativar Usuário",
      message: `Deseja inativar o usuário "${usuario.nome}"? Usuários inativos não podem acessar o sistema.`,
      type: "warning",
      onConfirm: async () => {
        try {
          const userRef = doc(db, "usuarios", usuario.id);
          await updateDoc(userRef, {
            status: "inativo",
            dataAtualizacao: new Date(),
          });
          showToast("✅ Usuário inativado com sucesso!", "success");
          await carregarUsuarios();
        } catch (error) {
          console.error("❌ Erro ao inativar usuário:", error);
          showToast("Erro ao inativar usuário", "error");
        }
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  // ✅ IMPLEMENTAR: Handler para resetar senha
  const handleResetSenha = (usuario) => {
    setConfirmModal({
      isOpen: true,
      title: "Resetar Senha",
      message: `Deseja enviar um email de redefinição de senha para "${usuario.email}"?`,
      type: "warning",
      onConfirm: async () => {
        try {
          await userService.sendPasswordReset(usuario.email);
          showToast("✅ Email de redefinição enviado!", "success");
        } catch (error) {
          console.error("❌ Erro ao resetar senha:", error);
          showToast("Erro ao enviar email de redefinição", "error");
        }
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  // ✅ ATUALIZAR: Função showToast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Função para carregar logs
  const carregarLogs = async () => {
    try {
      console.log("📋 Carregando logs de auditoria...");
      const logsData = await auditService.getLogs({ limit: 50 });
      setLogs(logsData);
      console.log(`✅ ${logsData.length} logs carregados`);
    } catch (error) {
      console.error("❌ Erro ao carregar logs:", error);
      showToast("Erro ao carregar logs de auditoria", "error");
    }
  };

  // useEffect para carregar dados
  useEffect(() => {
    const loadData = async () => {
      await carregarUsuarios();
      await carregarLogs();
    };
    loadData();
  }, []);

  // Função para filtrar logs
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
        const logDate =
          log.timestamp instanceof Date
            ? log.timestamp
            : new Date(log.timestamp?.seconds * 1000 || log.timestamp);
        matches = matches && logDate >= inicio;
      }

      if (logFilters.dataFim) {
        const fim = new Date(logFilters.dataFim);
        fim.setHours(23, 59, 59, 999);
        const logDate =
          log.timestamp instanceof Date
            ? log.timestamp
            : new Date(log.timestamp?.seconds * 1000 || log.timestamp);
        matches = matches && logDate <= fim;
      }

      return matches;
    });
  };

  // Funções auxiliares para logs
  const getActionColor = (action) => {
    switch (action) {
      case "DELETE_EMENDA":
      case "DELETE_DESPESA":
      case "DELETE_USER":
        return "#dc3545";
      case "CREATE_EMENDA":
      case "CREATE_DESPESA":
      case "CREATE_USER":
        return "#28a745";
      case "UPDATE_EMENDA":
      case "UPDATE_DESPESA":
      case "UPDATE_USER":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "DELETE_EMENDA":
      case "DELETE_DESPESA":
      case "DELETE_USER":
        return "🗑️";
      case "CREATE_EMENDA":
      case "CREATE_DESPESA":
      case "CREATE_USER":
        return "➕";
      case "UPDATE_EMENDA":
      case "UPDATE_DESPESA":
      case "UPDATE_USER":
        return "✏️";
      default:
        return "⚡";
    }
  };

  // ✅ CORREÇÃO: Componente UsersTable com dados reais
  const UsersTable = ({
    users,
    onEdit,
    onDelete,
    onToggleStatus,
    onResetPassword,
    loading,
  }) => {
    if (users.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
          <h3>Nenhum usuário encontrado</h3>
          <p>Ainda não há usuários cadastrados no sistema</p>
        </div>
      );
    }

    return (
      <div style={styles.usersTableContainer}>
        <table style={styles.usersTable}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>👤 Nome</th>
              <th style={styles.tableHeader}>📧 Email</th>
              <th style={styles.tableHeader}>🏢 Local</th>
              <th style={styles.tableHeader}>⚡ Tipo</th>
              <th style={styles.tableHeader}>📊 Status</th>
              <th style={styles.tableHeader}>🔧 Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((usuario, index) => (
              <tr
                key={usuario.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                  borderBottom: "1px solid #e9ecef",
                }}
              >
                <td style={styles.tableCell}>
                  <div style={{ fontWeight: "500" }}>
                    {usuario.nome || "N/A"}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ fontSize: "13px" }}>
                    {usuario.email || "N/A"}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  {usuario.municipio && usuario.uf ? (
                    <div>
                      <div style={{ fontWeight: "500" }}>
                        {usuario.municipio}
                      </div>
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        {usuario.uf}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "#999", fontStyle: "italic" }}>
                      N/A
                    </span>
                  )}
                </td>
                <td style={styles.tableCell}>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "white",
                      backgroundColor:
                        usuario.tipo === "admin" ? "#dc3545" : "#28a745",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {usuario.tipo || "N/A"}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "white",
                      backgroundColor:
                        usuario.status === "ativo" ? "#28a745" : "#dc3545",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {usuario.status || "inativo"}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => onEdit(usuario)}
                      style={styles.actionButton}
                      title="Editar usuário"
                      disabled={loading}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onToggleStatus(usuario)}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: usuario.status === "ativo" ? "#ffc107" : "#28a745",
                      }}
                      title={usuario.status === "ativo" ? "Inativar usuário" : "Ativar usuário"}
                      disabled={loading}
                    >
                      {usuario.status === "ativo" ? "⏸️" : "▶️"}
                    </button>
                    <button
                      onClick={() => onResetPassword(usuario)}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: "#17a2b8",
                      }}
                      title="Resetar senha"
                      disabled={loading}
                    >
                      🔑
                    </button>

                    {/* ✅ CORREÇÃO: Botão excluir com função correta */}
                    <button
                      onClick={() => {
                        console.log("🗑️ Clique no botão excluir:", usuario);
                        onDelete(usuario);
                      }}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: usuario.status === "inativo" ? "#dc3545" : "#6c757d",
                        opacity: usuario.status === "inativo" ? 1 : 0.5,
                        cursor: usuario.status === "inativo" ? "pointer" : "not-allowed",
                      }}
                      title={
                        usuario.status === "inativo"
                          ? "Excluir usuário permanentemente"
                          : "Inative o usuário para poder excluir"
                      }
                      disabled={loading || usuario.status === "ativo"}
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
    );
  };

  return (
    <div style={styles.container}>
      {/* ✅ ADICIONAR: Toast para feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ✅ ADICIONAR: Modal de confirmação */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}

      {/* ✅ ADICIONAR: Modal de usuário */}
      {showUserModal && (
        <UserForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSalvarUsuario}
          onCancel={() => setShowUserModal(false)}
          editingUser={editingUser}
          saving={saving}
        />
      )}

      {/* Cabeçalho com tabs */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            {activeTab === "users"
              ? "👥 Administração de Usuários"
              : "📋 Logs de Auditoria"}
          </h1>
          <p style={styles.subtitle}>
            {activeTab === "users"
              ? "Gerencie usuários, permissões e acessos do sistema SICEFSUS"
              : "Monitore todas as ações realizadas no sistema"}
          </p>
        </div>

        <div style={styles.headerActions}>
          {activeTab === "users" && (
            <button
              onClick={handleNovoUsuario}
              style={styles.primaryButton}
              disabled={loading || saving}
            >
              <span style={styles.buttonIcon}>👤</span>
              Novo Usuário
            </button>
          )}
          {activeTab === "logs" && (
            <button
              onClick={carregarLogs}
              style={{ ...styles.primaryButton, backgroundColor: "#28a745" }}
              disabled={loading}
            >
              <span style={styles.buttonIcon}>🔄</span>
              Atualizar Logs
            </button>
          )}
        </div>
      </div>

      {/* Navegação por tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            ...styles.tabButton,
            ...(activeTab === "users" ? styles.tabButtonActive : {}),
          }}
        >
          👥 Usuários ({usuarios.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          style={{
            ...styles.tabButton,
            ...(activeTab === "logs" ? styles.tabButtonActive : {}),
          }}
        >
          📋 Logs de Auditoria ({logs.length})
        </button>
      </div>

      {/* Conteúdo condicional */}
      {activeTab === "users" ? (
        <div style={styles.tableContainer}>
          <h3 style={styles.sectionTitle}>
            📋 Lista de Usuários ({usuarios.length})
          </h3>

          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Carregando usuários...</p>
            </div>
          ) : (
            <UsersTable
              users={usuarios}
              onEdit={handleEditarUsuario}
              onDelete={handleExcluirUsuario}
              onToggleStatus={handleToggleStatus}
              onResetPassword={handleResetSenha}
              loading={loading}
            />
          )}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <h3 style={styles.sectionTitle}>
            📋 Logs de Auditoria do Sistema ({getFilteredLogs().length})
          </h3>

          {/* Filtros */}
          <div style={styles.filtersContainer}>
            <div style={styles.filtersGrid}>
              <div>
                <label style={styles.filterLabel}>👤 Usuário</label>
                <input
                  type="text"
                  placeholder="Filtrar por email..."
                  value={logFilters.usuario}
                  onChange={(e) =>
                    setLogFilters({ ...logFilters, usuario: e.target.value })
                  }
                  style={styles.filterInput}
                />
              </div>

              <div>
                <label style={styles.filterLabel}>⚡ Ação</label>
                <select
                  value={logFilters.acao}
                  onChange={(e) =>
                    setLogFilters({ ...logFilters, acao: e.target.value })
                  }
                  style={styles.filterInput}
                >
                  <option value="">Todas as ações</option>
                  <option value="CREATE_EMENDA">Criar Emenda</option>
                  <option value="UPDATE_EMENDA">Editar Emenda</option>
                  <option value="DELETE_EMENDA">Deletar Emenda</option>
                  <option value="CREATE_DESPESA">Criar Despesa</option>
                  <option value="UPDATE_DESPESA">Editar Despesa</option>
                  <option value="DELETE_DESPESA">Deletar Despesa</option>
                </select>
              </div>

              <div>
                <label style={styles.filterLabel}>📅 Data Início</label>
                <input
                  type="date"
                  value={logFilters.dataInicio}
                  onChange={(e) =>
                    setLogFilters({ ...logFilters, dataInicio: e.target.value })
                  }
                  style={styles.filterInput}
                />
              </div>

              <div>
                <label style={styles.filterLabel}>📅 Data Fim</label>
                <input
                  type="date"
                  value={logFilters.dataFim}
                  onChange={(e) =>
                    setLogFilters({ ...logFilters, dataFim: e.target.value })
                  }
                  style={styles.filterInput}
                />
              </div>
            </div>
          </div>

          {/* Tabela de Logs */}
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Carregando logs...</p>
            </div>
          ) : getFilteredLogs().length === 0 ? (
            <div style={styles.emptyLogs}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
              <h3>Nenhum log encontrado</h3>
              <p>
                {logFilters.usuario ||
                logFilters.acao ||
                logFilters.dataInicio ||
                logFilters.dataFim
                  ? "Tente ajustar os filtros para ver mais resultados"
                  : "Ainda não há logs de auditoria registrados no sistema"}
              </p>
            </div>
          ) : (
            <div style={styles.logsTableContainer}>
              <table style={styles.logsTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>📅 Data/Hora</th>
                    <th style={styles.tableHeader}>👤 Usuário</th>
                    <th style={styles.tableHeader}>⚡ Ação</th>
                    <th style={styles.tableHeader}>📋 Recurso</th>
                    <th style={styles.tableHeader}>🏢 Local</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredLogs().map((log, index) => (
                    <tr
                      key={log.id || index}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                        borderBottom: "1px solid #e9ecef",
                      }}
                    >
                      <td style={styles.tableCell}>
                        <div style={{ fontWeight: "500", fontSize: "13px" }}>
                          {new Date(
                            log.timestamp?.seconds * 1000 || log.timestamp,
                          ).toLocaleDateString("pt-BR")}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#666",
                            marginTop: "2px",
                          }}
                        >
                          {new Date(
                            log.timestamp?.seconds * 1000 || log.timestamp,
                          ).toLocaleTimeString("pt-BR")}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={{ fontWeight: "500" }}>
                          {log.userEmail || "N/A"}
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "white",
                            backgroundColor:
                              log.userRole === "admin" ? "#dc3545" : "#28a745",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            textTransform: "uppercase",
                            fontWeight: "bold",
                          }}
                        >
                          {log.userRole || "N/A"}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            backgroundColor: getActionColor(log.action),
                            color: "white",
                          }}
                        >
                          {getActionIcon(log.action)}{" "}
                          {(log.action || "UNKNOWN").replace("_", " ")}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={{ fontWeight: "500" }}>
                          {log.resourceType || "N/A"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          ID: {(log.resourceId || "N/A").substring(0, 8)}...
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        {log.userMunicipio && log.userUf ? (
                          <div>
                            <div style={{ fontWeight: "500" }}>
                              {log.userMunicipio}
                            </div>
                            <div style={{ fontSize: "11px", color: "#666" }}>
                              {log.userUf}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#999", fontStyle: "italic" }}>
                            N/A
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ CORREÇÃO: Estilos com CSS warning corrigido
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    marginBottom: "20px",
  },
  headerLeft: {
    marginBottom: "10px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  headerActions: {
    marginBottom: "20px",
  },
  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: "8px",
  },
  tabsContainer: {
    display: "flex",
    marginBottom: "24px",
    borderBottom: "2px solid #e9ecef",
    backgroundColor: "white",
    borderRadius: "8px 8px 0 0",
    padding: "0 24px",
  },
  tabButton: {
    padding: "16px 24px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    color: "#6c757d",
    cursor: "pointer",
    borderBottomWidth: "3px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent", // ✅ CORREÇÃO: Propriedades separadas
    transition: "all 0.2s ease",
  },
  tabButtonActive: {
    color: "#007bff",
    borderBottomColor: "#007bff",
    backgroundColor: "rgba(0, 123, 255, 0.1)",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  filtersContainer: {
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#495057",
    display: "block",
    marginBottom: "4px",
  },
  filterInput: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
  },
  emptyLogs: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
  },
  logsTableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  usersTableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logsTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  usersTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "12px",
    color: "#495057",
    textTransform: "uppercase",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #e9ecef",
  },
  tableCell: {
    padding: "12px",
    fontSize: "13px",
    verticalAlign: "top",
  },
  actionButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

// ✅ ADICIONAR: Animação do spinner (se não existir)
if (!document.getElementById("admin-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "admin-animations";
  styleSheet.type = "text/css";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Administracao;