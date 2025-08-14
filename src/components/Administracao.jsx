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
import TesteUsuarios from "./TesteUsuarios";

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
  const showToast = (toastData) => {
    setToast({ ...toastData, show: true });
    setTimeout(() => {
      setToast({ show: false });
    }, toastData.duracao || 5000);
  };

  // 🗑️ FUNÇÃO: Excluir usuário (CORRIGIDA COM DEBUG EXTRA)
  const handleDelete = useCallback(async (usuario) => {
    console.log("🗑️ === INÍCIO EXCLUSÃO ===");
    console.log("📋 Dados recebidos:", {
      id: usuario?.id,
      uid: usuario?.uid,
      nome: usuario?.nome,
      email: usuario?.email,
      status: usuario?.status,
    });

    // DEBUG EXTRA: Verificar se o objeto está sendo passado corretamente
    console.log("🔍 DEBUG COMPLETO do usuário:", usuario);
    console.log("🔍 Status EXATO:", JSON.stringify(usuario?.status));
    console.log("🔍 Tipo do status:", typeof usuario?.status);

    // VALIDAÇÕES INICIAIS
    if (!usuario) {
      console.error("❌ Objeto usuário é null/undefined");
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Dados do usuário não encontrados",
      });
      return;
    }

    if (usuario.status !== "inativo") {
      console.log("⚠️ Usuário não está inativo:", usuario.status);
      showToast({
        tipo: "warning",
        titulo: "Atenção",
        mensagem: "Apenas usuários inativos podem ser excluídos",
      });
      return;
    }

    if (!usuario.id && !usuario.uid) {
      console.error("❌ Nem ID nem UID encontrados");
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Identificador do usuário não encontrado",
      });
      return;
    }

    console.log("✅ Validações passaram, abrindo modal de confirmação");

    // MODAL DE CONFIRMAÇÃO
    setConfirmationModal({
      isOpen: true,
      title: "Excluir Usuário",
      message: `Tem certeza que deseja excluir permanentemente o usuário "${usuario.nome}"?\n\nEsta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: async () => {
        console.log("🗑️ === EXECUTANDO EXCLUSÃO ===");
        setLoading(true);

        try {
          const userIdToDelete = usuario.id || usuario.uid;
          const userUidForAPI = usuario.uid || usuario.id;

          console.log("🎯 Tentando exclusão completa via userService...");
          console.log("📊 IDs para exclusão:", {
            userIdToDelete,
            userUidForAPI,
            method: "deleteUserById"
          });

          // Usar o userService que já tem fallback automático
          const resultado = await deleteUserById(userIdToDelete, userUidForAPI);
          
          console.log("✅ Resultado da exclusão:", resultado);

          // Determinar mensagem baseada no método usado
          let mensagem = "Usuário excluído com sucesso!";
          if (resultado.method === "firestore_only") {
            mensagem = "Usuário removido do sistema. Auth permanece ativo.";
          } else if (resultado.method === "admin_api") {
            mensagem = "Usuário excluído permanentemente do Auth e Firestore!";
          }

          showToast({
            tipo: "success",
            titulo: "Exclusão Realizada",
            mensagem: mensagem,
          });

          console.log("🔄 Recarregando lista de usuários...");
          await carregarUsuarios();

        } catch (error) {
          console.error("❌ Erro na exclusão:", error);

          let errorMessage = "Erro desconhecido na exclusão";
          
          if (error.message) {
            errorMessage = error.message;
          } else if (error.code === 'permission-denied') {
            errorMessage = "Permissão negada para excluir usuário";
          } else if (error.code === 'not-found') {
            errorMessage = "Usuário não encontrado no sistema";
          }

          showToast({
            tipo: "error",
            titulo: "Erro na Exclusão",
            mensagem: errorMessage,
          });
        } finally {
          setLoading(false);
          setConfirmationModal({ isOpen: false });
        }
      },
      onCancel: () => {
        console.log("❌ Exclusão cancelada");
        setConfirmationModal({ isOpen: false });
      },
    });
  }, [showToast, setConfirmationModal, setLoading, carregarUsuarios]);

  // 🔄 FUNÇÃO: Toggle status do usuário (AUDITSERVICE CORRETO)
  const handleToggleStatus = async (usuario) => {
    const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo";

    console.log(`🔄 Alterando status do usuário ${usuario.nome} para: ${novoStatus}`);

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
      
      {/* DEBUG TEMPORÁRIO - REMOVER DEPOIS */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          zIndex: 9999,
          backgroundColor: '#ff9800',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => {
          if (window.confirm('Abrir Debug de Usuários?')) {
            const debugWindow = window.open('', '_blank', 'width=1200,height=800');
            debugWindow.document.write(`
              <html>
                <head><title>Debug Usuários SICEFSUS</title></head>
                <body>
                  <div id="debug-root"></div>
                  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                </body>
              </html>
            `);
          }
        }}>
          🔍 DEBUG
        </div>
      )}

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
      <div style={{ marginBottom: '20px' }}>
        <div style={{ borderBottom: '1px solid #ddd' }}>
          <button
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === 'users' ? '2px solid #007bff' : 'none',
              backgroundColor: activeTab === 'users' ? '#f8f9fa' : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('users')}
          >
            👥 Usuários ({usuarios.length})
          </button>
          <button
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === 'logs' ? '2px solid #007bff' : 'none',
              backgroundColor: activeTab === 'logs' ? '#f8f9fa' : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('logs')}
          >
            📋 Logs ({logs.length})
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              style={{
                padding: '10px 20px',
                border: 'none',
                borderBottom: activeTab === 'teste' ? '2px solid #ff9800' : 'none',
                backgroundColor: activeTab === 'teste' ? '#fff3e0' : 'transparent',
                cursor: 'pointer',
                color: '#ff9800'
              }}
              onClick={() => setActiveTab('teste')}
            >
              🧪 Teste DB
            </button>
          )}
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
      ) : activeTab === "logs" ? (
        <LogsSection
          logs={getFilteredLogs()}
          logFilters={logFilters}
          setLogFilters={setLogFilters}
          loading={loading}
        />
      ) : activeTab === "teste" ? (
        <div>
          <h3>🧪 Teste de Conectividade do Banco de Dados</h3>
          <TesteUsuarios />
        </div>
      ) : null}
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