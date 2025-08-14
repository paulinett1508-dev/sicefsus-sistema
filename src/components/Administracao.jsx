// src/components/Administracao.jsx - VERSÃO REFATORADA E LIMPA
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

// 📦 IMPORTS DOS COMPONENTES SEGMENTADOS
import UsersSection from "./admin/UsersSection";
import LogsSection from "./admin/LogsSection";
import UserModal from "./admin/UserModal";
import AdminTabs from "./admin/AdminTabs";
import AdminHeader from "./admin/AdminHeader";

// 📦 IMPORTS DE SERVIÇOS E UTILS
import Toast from "./Toast";
import ConfirmationModal from "./ConfirmationModal";
import { UserContext } from "../context/UserContext";
import {
  createUser,
  updateUser,
  deleteUserById,
  sendPasswordReset,
} from "../services/userService";

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
      role: usuario.tipo === "admin" ? "admin" : "user",
      municipio: usuario.municipio || "",
      uf: usuario.uf || "",
      status: usuario.status || "ativo",
      departamento: usuario.departamento || "",
      telefone: usuario.telefone || "",
    });
    setShowUserModal(true);
  };

  const handleSalvarUsuario = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      console.log("💾 Salvando usuário:", formData);

      if (editingUser) {
        await updateUser(
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
        const resultado = await createUser({
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

  // 🎯 FUNÇÃO: Mostrar toast (MOVIDA PARA ANTES DE handleDelete)
  const showToast = useCallback((toastData) => {
    setToast({ ...toastData, show: true });
    setTimeout(() => {
      setToast({ show: false });
    }, toastData.duracao || 5000);
  }, []);

  // 🗑️ FUNÇÃO: Excluir usuário (VERSÃO SIMPLIFICADA ORIGINAL)
  const handleDelete = async (usuario) => {
    console.log("🗑️ === EXCLUSÃO UNIVERSAL ===");
    console.log("🗑️ Dados do usuário:", {
      id: usuario?.id,
      uid: usuario?.uid,
      nome: usuario?.nome,
      email: usuario?.email,
      status: usuario?.status
    });

    // Verificar dados básicos
    if (!usuario?.id) {
      console.error("❌ ID do usuário não encontrado");
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Dados do usuário incompletos"
      });
      return;
    }

    // Verificar se usuário está inativo
    if (usuario.status === "ativo") {
      showToast({
        tipo: "warning",
        titulo: "Usuário Ativo",
        mensagem: "Desative o usuário primeiro para poder excluir"
      });
      return;
    }

    // ✅ USAR WINDOW.CONFIRM (ORIGINAL QUE FUNCIONAVA)
    const confirmar = window.confirm(
      `🗑️ EXCLUIR PERMANENTEMENTE?\n\n` +
      `Nome: ${usuario.nome || 'N/A'}\n` +
      `Email: ${usuario.email || 'N/A'}\n` +
      `ID: ${usuario.id}\n\n` +
      `Esta ação NÃO pode ser desfeita!`
    );

    if (!confirmar) {
      console.log("❌ Exclusão cancelada pelo usuário");
      return;
    }

    try {
      console.log("🗑️ Executando exclusão...");
      setLoading(true);

      // ✅ EXCLUSÃO DIRETA DO FIRESTORE (ORIGINAL)
      await deleteDoc(doc(db, "usuarios", usuario.id));
      console.log("✅ Usuário excluído do Firestore");

      // Log de auditoria
      if (window.auditService) {
        await window.auditService.logAction(
          "DELETE_USER",
          `Usuário ${usuario.nome} (${usuario.email}) excluído permanentemente`,
          {
            usuarioExcluido: {
              id: usuario.id,
              uid: usuario.uid,
              nome: usuario.nome,
              email: usuario.email,
              municipio: usuario.municipio,
              uf: usuario.uf,
            },
          }
        );
      }

      showToast({
        tipo: "success",
        titulo: "Sucesso",
        mensagem: "Usuário excluído permanentemente!"
      });

      // Recarregar lista
      await carregarUsuarios();

    } catch (error) {
      console.error("❌ Erro na exclusão:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: `Erro ao excluir usuário: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 FUNÇÃO: Toggle status do usuário (AUDITSERVICE CORRETO)
  const handleToggleStatus = async (usuario) => {
    const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo";

    console.log(
      `🔄 Alterando status do usuário ${usuario.nome} para: ${novoStatus}`,
    );

    try {
      // ✅ SOLUÇÃO DIRETA: updateDoc apenas o campo status
      const userRef = doc(db, "usuarios", usuario.id);
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

  // 🔑 FUNÇÃO: Reset de senha (COMPLETA)
  const handleResetSenha = async (usuario) => {
    console.log("🔑 Resetando senha para:", usuario.email);

    setConfirmationModal({
      isOpen: true,
      title: "Redefinir Senha",
      message: `Enviar email de redefinição de senha para "${usuario.email}"?`,
      confirmText: "Enviar",
      cancelText: "Cancelar",
      type: "warning",
      onConfirm: async () => {
        try {
          // Usar sendPasswordReset com email e uid para melhor funcionamento
          await sendPasswordReset(usuario.email, usuario.uid);

          showToast({
            tipo: "success",
            titulo: "Sucesso",
            mensagem: "Email de redefinição enviado com sucesso!",
          });
        } catch (error) {
          console.error("❌ Erro ao enviar reset:", error);
          showToast({
            tipo: "error",
            titulo: "Erro",
            mensagem: error.message || "Erro ao enviar email de redefinição",
          });
        }

        setConfirmationModal({ isOpen: false });
      },
      onCancel: () => {
        setConfirmationModal({ isOpen: false });
      },
    });
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
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
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

      {showUserModal && (
        <UserModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSalvarUsuario}
          onCancel={() => setShowUserModal(false)}
          editingUser={editingUser}
          saving={saving}
        />
      )}

      {/* CABEÇALHO */}
      <AdminHeader
        activeTab={activeTab}
        onNovoUsuario={handleNovoUsuario}
        onAtualizarLogs={carregarLogs}
        loading={loading || saving}
      />

      {/* NAVEGAÇÃO POR TABS */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ borderBottom: "1px solid #ddd" }}>
          <button
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom:
                activeTab === "users" ? "2px solid #007bff" : "none",
              backgroundColor:
                activeTab === "users" ? "#f8f9fa" : "transparent",
              cursor: "pointer",
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
            }}
            onClick={() => setActiveTab("logs")}
          >
            📋 Logs ({logs.length})
          </button>
          
        </div>
      </div>

      {/* CONTEÚDO CONDICIONAL */}
      {activeTab === "users" ? (
        <UsersSection
          users={getFilteredUsers()}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          onEdit={handleEditarUsuario}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetSenha}
          loading={loading}
        />
      ) : (
        <LogsSection
          logs={getFilteredLogs()}
          logFilters={logFilters}
          setLogFilters={setLogFilters}
          loading={loading}
        />
      )}
    </div>
  );
};

// 🎨 ESTILOS BÁSICOS (movidos para arquivo separado depois)
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
};

export default Administracao;
