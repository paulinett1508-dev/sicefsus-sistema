// src/components/Administracao.jsx - VERSÃO CORRIGIDA COMPLETA
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auditService } from "../services/auditService";

// 🔧 CORREÇÃO: Import correto do userService
import userService from "../services/userService"; // ✅ Import default

// 🔧 CORREÇÃO: Usar UserForm ao invés de UserModal inexistente
import UserForm from "./UserForm"; // ✅ UserForm existe
import Toast from "./Toast";
import ConfirmationModal from "./ConfirmationModal";
import { UserContext } from "../context/UserContext";
import AdminHeader from "./admin/AdminHeader";

const Administracao = () => {
  // 🎯 CONTEXTO DO USUÁRIO
  const { currentUser } = useContext(UserContext);

  // 🎯 ESTADOS PRINCIPAIS
  const [usuarios, setUsuarios] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // 🎯 ESTADOS DO MODAL DE USUÁRIO
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

  // 🎯 ESTADOS DE FEEDBACK
  const [toast, setToast] = useState({ show: false });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    type: "warning",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // 🎯 ESTADOS DE FILTROS
  const [userFilter, setUserFilter] = useState("");
  const [logFilters, setLogFilters] = useState({
    usuario: "",
    acao: "",
    dataInicio: "",
    dataFim: "",
  });

  // 🔧 FUNÇÃO: Mostrar toast (MOVIDA PARA ANTES DE handleDelete)
  const showToast = useCallback((toastData) => {
    setToast({ ...toastData, show: true });
    setTimeout(() => {
      setToast({ show: false });
    }, toastData.duracao || 5000);
  }, []);

  // 📋 FUNÇÃO: Carregar usuários
  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      console.log("📋 Carregando usuários...");

      const usuariosRef = collection(db, "usuarios");
      const snapshot = await getDocs(usuariosRef);

      const usuariosData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid || doc.id,
          email: data.email,
          nome: data.nome || data.name || "Nome não informado",
          tipo: data.tipo || data.role || "operador",
          role: data.role || data.tipo || "user", // Compatibilidade
          status: data.status || "ativo",
          departamento: data.departamento || "",
          telefone: data.telefone || "",
          municipio: data.municipio || "",
          uf: data.uf || "",
          ultimoAcesso: data.ultimoAcesso || data.ultimo_acesso,
          criadoEm: data.criadoEm || data.data_criacao,
          ...data,
        };
      });

      setUsuarios(usuariosData);
      console.log(`✅ ${usuariosData.length} usuários carregados com sucesso`);
    } catch (error) {
      console.error("❌ Erro ao carregar usuários:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Erro ao carregar usuários",
      });
    } finally {
      setLoading(false);
    }
  };

  // 📋 FUNÇÃO: Carregar logs
  const carregarLogs = async () => {
    try {
      console.log("📋 Carregando logs de auditoria...");
      const logsData = await auditService.getLogs({ limit: 50 });
      setLogs(logsData);
      console.log(`✅ ${logsData.length} logs carregados`);
    } catch (error) {
      console.error("❌ Erro ao carregar logs:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Erro ao carregar logs de auditoria",
      });
    }
  };

  // 🎯 HANDLERS DE USUÁRIOS
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

  const handleEditarUsuario = (usuario) => {
    console.log("✏️ Editando usuário:", usuario);
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome || "",
      email: usuario.email || "",
      role:
        usuario.tipo === "admin" || usuario.role === "admin" ? "admin" : "user",
      municipio: usuario.municipio || "",
      uf: usuario.uf || "",
      status: usuario.status || "ativo",
      departamento: usuario.departamento || "",
      telefone: usuario.telefone || "",
    });
    setShowUserModal(true);
  };

  // ✅ CORREÇÃO: handleSalvarUsuario com userService correto
  const handleSalvarUsuario = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      console.log("💾 Salvando usuário:", formData);

      if (editingUser) {
        // ✅ USAR userService.updateUser
        await userService.updateUser(
          editingUser.id,
          {
            nome: formData.nome,
            email: formData.email,
            role: formData.role === "admin" ? "admin" : "operador",
            municipio: formData.role === "admin" ? "" : formData.municipio,
            uf: formData.role === "admin" ? "" : formData.uf,
            status: formData.status,
            departamento: formData.departamento,
            telefone: formData.telefone,
          },
          editingUser.email,
        );

        showToast({
          tipo: "success",
          titulo: "Sucesso",
          mensagem: "Usuário atualizado com sucesso!",
        });
      } else {
        // ✅ USAR userService.createUser
        const resultado = await userService.createUser({
          email: formData.email,
          nome: formData.nome,
          role: formData.role === "admin" ? "admin" : "operador",
          municipio: formData.role === "admin" ? "" : formData.municipio,
          uf: formData.role === "admin" ? "" : formData.uf,
          status: formData.status,
          departamento: formData.departamento,
          telefone: formData.telefone,
        });

        if (resultado.success) {
          showToast({
            tipo: "success",
            titulo: "Sucesso",
            mensagem:
              "Usuário criado com sucesso! Email de configuração enviado.",
          });
        }
      }

      setShowUserModal(false);
      await carregarUsuarios();
    } catch (error) {
      console.error("❌ Erro ao salvar usuário:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: error.message || "Erro ao salvar usuário",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ CORREÇÃO: handleDelete com userService correto
  const handleDelete = async (usuario) => {
    console.log("🗑️ === EXCLUSÃO VIA CLOUD RUN ===");
    console.log("🗑️ Dados do usuário:", usuario);

    // Validações básicas
    if (!usuario?.id) {
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Dados do usuário incompletos",
      });
      return;
    }

    if (usuario.status === "ativo") {
      showToast({
        tipo: "warning",
        titulo: "Usuário Ativo",
        mensagem: "Desative o usuário primeiro para poder excluir",
      });
      return;
    }

    // ✅ USAR MODAL DE CONFIRMAÇÃO
    setConfirmationModal({
      isOpen: true,
      title: "🔥 Exclusão Completa via Cloud Run",
      message: (
        <div style={{ textAlign: "left" }}>
          <p>
            <strong>Usuário:</strong> {usuario.nome}
          </p>
          <p>
            <strong>Email:</strong> {usuario.email}
          </p>
          <hr style={{ margin: "10px 0", opacity: 0.3 }} />
          <p style={{ marginBottom: "10px" }}>
            ✅ <strong>Será removido de:</strong>
          </p>
          <ul style={{ marginLeft: "20px", marginBottom: "10px" }}>
            <li>Firebase Firestore (dados)</li>
            <li>Firebase Auth (login)</li>
          </ul>
          <p style={{ fontSize: "14px", color: "#666" }}>
            ⚡ Usando Cloud Run Function com Admin SDK
            <br />
            🎯 Email ficará disponível para reutilização
          </p>
          <p
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "5px",
              color: "#856404",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            ⚠️ Esta ação NÃO pode ser desfeita!
          </p>
        </div>
      ),
      confirmText: "Sim, Excluir Permanentemente",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: async () => {
        setConfirmationModal({ isOpen: false });

        // Continuar com a exclusão
        try {
          setLoading(true);
          console.log("🔥 Executando exclusão via Cloud Run...");

          // ✅ USAR userService.deleteUserById
          const resultado = await userService.deleteUserById(
            usuario.id,
            usuario.uid || usuario.id,
          );

          console.log("📊 Resultado:", resultado);

          // ✅ MENSAGEM BASEADA NO RESULTADO
          let tipo = "success";
          let titulo = "Exclusão Completa";
          let mensagem = "Usuário excluído com sucesso!";

          if (resultado.method === "cloud_run") {
            if (resultado.details.firestore && resultado.details.auth) {
              mensagem =
                "🎉 EXCLUSÃO COMPLETA!\n\n✅ Removido do Firestore\n✅ Removido do Firebase Auth\n✅ Email liberado para reutilização\n\n⚡ Processado via Cloud Run";
            } else if (resultado.details.firestore) {
              tipo = "warning";
              titulo = "Exclusão Parcial";
              mensagem =
                "⚠️ Usuário removido do Firestore.\nProblema ao remover do Auth.\n\nVerifique os logs da Cloud Function.";
            }
          } else if (resultado.method === "firestore_fallback") {
            tipo = "warning";
            titulo = "Exclusão Parcial";
            mensagem =
              "⚠️ Cloud Run indisponível.\nUsuário removido apenas do Firestore.\n\nEmail permanece no Auth.";
          }

          showToast({
            tipo: tipo,
            titulo: titulo,
            mensagem: mensagem,
            duracao: 10000,
          });

          await carregarUsuarios();
        } catch (error) {
          console.error("❌ Erro na exclusão:", error);
          showToast({
            tipo: "error",
            titulo: "Erro na Exclusão",
            mensagem: `Erro: ${error.message}`,
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        console.log("❌ Exclusão cancelada");
        setConfirmationModal({ isOpen: false });
      },
    });
  };

  // 🔄 FUNÇÃO: Toggle status do usuário (AUDITSERVICE CORRETO)
  const handleToggleStatus = async (usuario) => {
    const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo";

    console.log(
      `🔄 Alterando status do usuário ${usuario.nome} para: ${novoStatus}`,
    );

    try {
      // ADICIONAR: Verificar se o documento existe antes de atualizar
      const userRef = doc(db, "usuarios", usuario.id);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado no banco de dados");
      }

      // ✅ SOLUÇÃO DIRETA: updateDoc apenas o campo status
      await updateDoc(userRef, {
        status: novoStatus,
        dataAtualizacao: serverTimestamp(),
      });

      // ✅ CORREÇÃO: Log de auditoria com parâmetros CORRETOS (objeto único)
      try {
        await auditService.logAction({
          action: "UPDATE_USER_STATUS",
          resourceType: "usuarios",
          resourceId: usuario.id,
          dataBefore: { status: usuario.status },
          dataAfter: { status: novoStatus },
          user: {
            uid: currentUser?.uid || "unknown",
            email: currentUser?.email || "system",
            tipo: currentUser?.tipo || "admin",
            municipio: currentUser?.municipio || null,
            uf: currentUser?.uf || null,
          },
          metadata: {
            origem: "interface_administracao",
            ip: "unknown",
          },
          relatedResources: {
            targetUserEmail: usuario.email,
            targetUserNome: usuario.nome,
          },
        });
        console.log("📝 Audit log registrado com sucesso");
      } catch (auditError) {
        console.warn("⚠️ Erro no log de auditoria:", auditError);
        // Não falha a operação por causa do log
      }

      showToast({
        tipo: "success",
        titulo: "Sucesso",
        mensagem: `Usuário ${novoStatus === "ativo" ? "ativado" : "inativado"} com sucesso!`,
      });

      // Recarregar lista
      await carregarUsuarios();
    } catch (error) {
      console.error("❌ Erro ao alterar status:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: error.message || "Erro ao alterar status do usuário",
      });
    }
  };

  // 🎯 FUNÇÃO: Filtrar usuários
  const getFilteredUsers = () => {
    return usuarios.filter(
      (user) =>
        user.nome.toLowerCase().includes(userFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(userFilter.toLowerCase()),
    );
  };

  // 🎯 FUNÇÃO: Filtrar logs
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

  // 🎯 USE EFFECT: Carregamento inicial
  useEffect(() => {
    const loadData = async () => {
      console.log("🚀 Iniciando carregamento de dados...");
      try {
        await carregarUsuarios();
        await carregarLogs();
      } catch (error) {
        console.error("❌ Erro no carregamento inicial:", error);
        showToast({
          tipo: "error",
          titulo: "Erro",
          mensagem: "Erro ao carregar dados iniciais",
        });
      }
    };

    loadData();
  }, []);

  // 🎯 RENDER PRINCIPAL - LIMPO E ORGANIZADO
  return (
    <div style={styles.container}>
      {/* MODAIS E TOASTS */}
      {confirmationModal.isOpen && (
        <ConfirmationModal
          isVisible={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
          onConfirm={confirmationModal.onConfirm}
          onCancel={confirmationModal.onCancel}
          type={confirmationModal.type}
        />
      )}

      {toast.show && (
        <Toast
          tipo={toast.tipo}
          titulo={toast.titulo}
          mensagem={toast.mensagem}
          onClose={() => setToast({ show: false })}
          duracao={toast.duracao}
        />
      )}

      {/* ✅ CORREÇÃO: UserForm ao invés de UserModal */}
      {showUserModal && (
        <UserForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSalvarUsuario}
          onCancel={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          editingUser={editingUser}
          saving={saving}
          usuario={currentUser} // ✅ ADICIONAR: Prop usuario necessária
        />
      )}

      {/* CABEÇALHO BÁSICO */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, flex: 1 }}>👥 Administração SICEFSUS</h1>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
          onClick={handleNovoUsuario}
          disabled={loading}
        >
          ➕ Novo Usuário
        </button>

        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
          onClick={carregarLogs}
          disabled={loading}
        >
          🔄 Atualizar Logs
        </button>
      </div>

      {/* NAVEGAÇÃO POR TABS */}
      <div style={{ borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "users" ? "2px solid #007bff" : "none",
            backgroundColor: activeTab === "users" ? "#f8f9fa" : "transparent",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
          onClick={() => setActiveTab("users")}
        >
          👥 Usuários ({usuarios.length})
        </button>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "logs" ? "2px solid #007bff" : "none",
            backgroundColor: activeTab === "logs" ? "#f8f9fa" : "transparent",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
          onClick={() => setActiveTab("logs")}
        >
          📋 Logs ({logs.length})
        </button>
      </div>

      {/* CONTEÚDO CONDICIONAL */}
      {activeTab === "users" ? (
        <div>
          {/* FILTRO BÁSICO */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Filtrar usuários por nome ou email..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "300px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* TABELA BÁSICA DE USUÁRIOS */}
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", fontSize: "16px" }}
            >
              📋 Carregando usuários...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "800px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      Nome
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      Tipo
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      Localização
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredUsers().map((usuario) => (
                    <tr key={usuario.id} style={{ backgroundColor: "white" }}>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <div>
                          <div
                            style={{ fontWeight: "600", marginBottom: "2px" }}
                          >
                            {usuario.nome}
                          </div>
                          {usuario.departamento && (
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {usuario.departamento}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          fontSize: "14px",
                        }}
                      >
                        {usuario.email}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor:
                              usuario.tipo === "admin" ||
                              usuario.role === "admin"
                                ? "#fff3cd"
                                : "#d1ecf1",
                            color:
                              usuario.tipo === "admin" ||
                              usuario.role === "admin"
                                ? "#856404"
                                : "#0c5460",
                          }}
                        >
                          {usuario.tipo === "admin" || usuario.role === "admin"
                            ? "👑 Admin"
                            : "👤 Operador"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          fontSize: "13px",
                        }}
                      >
                        {usuario.tipo === "admin" ||
                        usuario.role === "admin" ? (
                          <span style={{ color: "#28a745", fontWeight: "600" }}>
                            🌐 Acesso Total
                          </span>
                        ) : (
                          <div>
                            {usuario.municipio && usuario.uf ? (
                              <>
                                <div style={{ fontWeight: "600" }}>
                                  {usuario.municipio}
                                </div>
                                <div style={{ color: "#666" }}>
                                  {usuario.uf}
                                </div>
                              </>
                            ) : (
                              <span
                                style={{
                                  color: "#dc3545",
                                  fontStyle: "italic",
                                }}
                              >
                                ❌ Não definido
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor:
                              usuario.status === "ativo"
                                ? "#d4edda"
                                : "#f8d7da",
                            color:
                              usuario.status === "ativo"
                                ? "#155724"
                                : "#721c24",
                          }}
                        >
                          {usuario.status === "ativo"
                            ? "✅ Ativo"
                            : "⏸️ Inativo"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                            onClick={() => handleEditarUsuario(usuario)}
                            title="Editar usuário"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            style={{
                              padding: "4px 8px",
                              backgroundColor:
                                usuario.status === "ativo"
                                  ? "#ffc107"
                                  : "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                            onClick={() => handleToggleStatus(usuario)}
                            title={
                              usuario.status === "ativo"
                                ? "Inativar usuário"
                                : "Ativar usuário"
                            }
                          >
                            {usuario.status === "ativo"
                              ? "⏸️ Inativar"
                              : "▶️ Ativar"}
                          </button>
                          {usuario.status !== "ativo" && (
                            <button
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                              onClick={() => handleDelete(usuario)}
                              title="Excluir usuário permanentemente"
                            >
                              🗑️ Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {getFilteredUsers().length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  {userFilter ? (
                    <>🔍 Nenhum usuário encontrado para "{userFilter}"</>
                  ) : (
                    <>📝 Nenhum usuário cadastrado</>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* SEÇÃO DE LOGS BÁSICA */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0" }}>📋 Logs de Auditoria</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <input
                type="text"
                placeholder="Filtrar por usuário..."
                value={logFilters.usuario}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, usuario: e.target.value })
                }
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <input
                type="text"
                placeholder="Filtrar por ação..."
                value={logFilters.acao}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, acao: e.target.value })
                }
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <input
                type="date"
                placeholder="Data início"
                value={logFilters.dataInicio}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, dataInicio: e.target.value })
                }
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <input
                type="date"
                placeholder="Data fim"
                value={logFilters.dataFim}
                onChange={(e) =>
                  setLogFilters({ ...logFilters, dataFim: e.target.value })
                }
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", fontSize: "16px" }}
            >
              📋 Carregando logs...
            </div>
          ) : (
            <div
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              {getFilteredLogs().map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    borderBottom:
                      index < getFilteredLogs().length - 1
                        ? "1px solid #eee"
                        : "none",
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "4px",
                    }}
                  >
                    <div style={{ fontWeight: "600", color: "#495057" }}>
                      {log.action} {log.userEmail && `- ${log.userEmail}`}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      {new Date(
                        log.timestamp?.seconds * 1000 || log.timestamp,
                      ).toLocaleString()}
                    </div>
                  </div>
                  {log.resourceType && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "2px",
                      }}
                    >
                      📄 Recurso: {log.resourceType} ({log.resourceId})
                    </div>
                  )}
                  {log.relatedResources?.targetUserNome && (
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      👤 Usuário afetado: {log.relatedResources.targetUserNome}
                    </div>
                  )}
                </div>
              ))}

              {getFilteredLogs().length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  📝 Nenhum log encontrado
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 🎨 ESTILOS BÁSICOS
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
};

export default Administracao;