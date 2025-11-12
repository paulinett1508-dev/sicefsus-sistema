// src/components/Administracao.jsx - CORREÇÃO CRÍTICA: EXCLUSÃO SEM CORS
// ✅ CORRIGIDO: Função deleteUserById substituída por exclusão local
// ✅ PRESERVADO: Todo fluxo e UI existente
// ✅ BYPASS: Cloud Function problemática

import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
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
import SystemHeader from "./shared/SystemHeader"; // ✅ MANTER HEADER AZUL

// 📦 COMPONENTES MODULARES
import AdminHeader from "./admin/AdminHeader";
import AdminTabs from "./admin/AdminTabs";
import UsersSection from "./admin/UsersSection";
import LogsSection from "./admin/LogsSection";
import FirestoreRulesSection from "./admin/FirestoreRulesSection";
import MigracaoCompleta from "./admin/MigracaoCompleta";
import UsersReportSection from "./admin/UsersReportSection";

const Administracao = () => {
  // 🎯 CONTEXTO DO USUÁRIO
  const { currentUser, isSuperAdmin: isSuperAdminFromContext } = useContext(UserContext);

  // 🎯 VERIFICAR SE É SUPERADMIN - USAR DO CONTEXTO OU CALCULAR LOCALMENTE
  const isSuperAdmin = React.useMemo(() => {
    if (!currentUser) return false;

    // ✅ PRIORIZAR O VALOR DO CONTEXTO
    if (isSuperAdminFromContext !== undefined) {
      console.log("🔐 SuperAdmin Check (do contexto):", {
        isSuperAdmin: isSuperAdminFromContext,
        email: currentUser.email
      });
      return isSuperAdminFromContext;
    }

    // ✅ FALLBACK: CALCULAR LOCALMENTE
    const result = currentUser.tipo === "admin" && currentUser.superAdmin === true;
    console.log("🔐 SuperAdmin Check (calculado):", {
      tipo: currentUser.tipo,
      superAdmin: currentUser.superAdmin,
      isSuperAdmin: result,
      email: currentUser.email
    });
    return result;
  }, [currentUser, isSuperAdminFromContext]);

  // 🎯 ESTADOS PRINCIPAIS
  const [usuarios, setUsuarios] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("usuarios");

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

  // 🔧 FUNÇÃO: Mostrar toast
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
          role: data.role || data.tipo || "user",
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

  const handleSalvarUsuario = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      console.log("💾 Salvando usuário:", formData);

      if (editingUser) {
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

  // ✅ CORREÇÃO CRÍTICA: Função de exclusão sem CORS
  const deleteUserLocal = async (userId) => {
    try {
      console.log("🗑️ Excluindo usuário do Firestore:", userId);

      // 1. Deletar documento do usuário no Firestore
      await deleteDoc(doc(db, "usuarios", userId));

      // 2. Log de auditoria
      try {
        await auditService.logAction({
          action: "DELETE_USER_FIRESTORE",
          resourceType: "usuarios",
          resourceId: userId,
          dataBefore: { status: "deletado_firestore" },
          dataAfter: null,
          user: {
            uid: currentUser?.uid || "unknown",
            email: currentUser?.email || "system",
            tipo: currentUser?.tipo || "admin",
            municipio: currentUser?.municipio || null,
            uf: currentUser?.uf || null,
          },
          metadata: {
            origem: "interface_administracao_bypass_cors",
            method: "firestore_direct",
            ip: "unknown",
          },
          relatedResources: {
            targetUserId: userId,
            method: "bypass_cloud_function",
          },
        });
      } catch (auditError) {
        console.warn("⚠️ Erro no log de auditoria:", auditError);
      }

      console.log("✅ Usuário removido do Firestore com sucesso");

      return {
        success: true,
        method: "firestore_bypass",
        details: {
          firestore: true,
          auth: false,
          note: "Cloud Function CORS contornado - apenas Firestore removido",
        },
      };
    } catch (error) {
      console.error("❌ Erro ao deletar usuário local:", error);
      throw error;
    }
  };

  const handleDelete = async (usuario) => {
    console.log("🗑️ === EXCLUSÃO COM BYPASS CORS ===");
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

    // Modal de confirmação
    setConfirmationModal({
      isOpen: true,
      title: "🗑️ Exclusão Simplificada (Bypass CORS)",
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
            <li>✅ Firebase Firestore (dados)</li>
            <li>⚠️ Firebase Auth (permanece temporariamente)</li>
          </ul>
          <p style={{ fontSize: "14px", color: "#666" }}>
            🚀 Usando método direto (bypass Cloud Function)
            <br />⚡ Resolve problema de CORS temporariamente
          </p>
          <p
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#e3f2fd",
              border: "1px solid #90caf9",
              borderRadius: "5px",
              color: "#1565c0",
              fontWeight: "500",
              textAlign: "center",
              fontSize: "13px",
            }}
          >
            ℹ️ Usuário será removido da interface e não conseguirá fazer login.
            <br />
            Email permanece no Auth até correção da Cloud Function.
          </p>
          <p
            style={{
              marginTop: "10px",
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
      confirmText: "Sim, Excluir do Sistema",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: async () => {
        setConfirmationModal({ isOpen: false });

        try {
          setLoading(true);
          console.log("🔥 Executando exclusão com bypass CORS...");

          // ✅ CORREÇÃO: Usar função local ao invés de Cloud Function
          const resultado = await deleteUserLocal(usuario.id);

          console.log("📊 Resultado:", resultado);

          showToast({
            tipo: "success",
            titulo: "Exclusão Realizada",
            mensagem:
              "✅ Usuário removido do sistema!\n\n🎯 Método: Bypass CORS\n📍 Firestore: Removido\n⚠️ Auth: Permanece temporariamente\n\n✨ Funcionando normalmente!",
            duracao: 8000,
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

  const handleToggleStatus = async (usuario) => {
    const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo";

    console.log(
      `🔄 Alterando status do usuário ${usuario.nome} para: ${novoStatus}`,
    );

    try {
      const userRef = doc(db, "usuarios", usuario.id);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado no banco de dados");
      }

      await updateDoc(userRef, {
        status: novoStatus,
        dataAtualizacao: serverTimestamp(),
      });

      // Log de auditoria
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
      }

      showToast({
        tipo: "success",
        titulo: "Sucesso",
        mensagem: `Usuário ${novoStatus === "ativo" ? "ativado" : "inativado"} com sucesso!`,
      });

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

  // 🎯 RENDER PRINCIPAL - ORQUESTRADOR LIMPO
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

      {/* ✅ MANTER: Header azul superior com informações do sistema */}
      <SystemHeader
        usuario={currentUser}
        loading={loading}
        modulo="Administração"
        dadosTexto="usuários cadastrados"
        dadosContador={usuarios.length}
      />

      {/* Tabs de navegação */}
      {(() => {
        console.log("🎬 Administracao.jsx - ANTES DE RENDERIZAR AdminTabs:", {
          activeTab,
          usuariosCount: usuarios.length,
          logsCount: logs.length,
          isSuperAdmin,
          isSuperAdminType: typeof isSuperAdmin,
          currentUser,
          currentUserSuperAdmin: currentUser?.superAdmin,
          currentUserIsSuperAdmin: currentUser?.isSuperAdmin
        });
        return (
          <AdminTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            usersCount={usuarios.length}
            logsCount={logs.length}
            isSuperAdmin={isSuperAdmin}
          />
        );
      })()}

      {/* Conteúdo das Tabs */}
      {activeTab === "usuarios" && (
        <UsersSection
          users={getFilteredUsers()}
          loading={loading}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          handleNovoUsuario={handleNovoUsuario}
          handleEditarUsuario={handleEditarUsuario}
          handleDelete={handleDelete}
          handleToggleStatus={handleToggleStatus}
        />
      )}

      {activeTab === "relatorio" && (
        <UsersReportSection users={usuarios} loading={loading} />
      )}

      {activeTab === "logs" && (
        <LogsSection
          logs={getFilteredLogs()}
          logFilters={logFilters}
          setLogFilters={setLogFilters}
        />
      )}

      {isSuperAdmin && activeTab === "rules" && <FirestoreRulesSection />}
      {isSuperAdmin && activeTab === "migracao" && <MigracaoCompleta />}
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