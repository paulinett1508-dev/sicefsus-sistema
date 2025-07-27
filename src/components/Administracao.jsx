// src/components/Administracao.jsx - CORRIGIDO PARA ESTRUTURA SICEFSUS
import React, { useState, useEffect, useCallback } from "react";
import userService from "../services/userService"; // ✅ Import das funções
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";
import AdminStats from "./AdminStats";
import Toast from "./Toast";
import { formStyles, addFormInteractivity } from "../utils/formStyles";

const Administracao = ({ usuario }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // ✅ Adicionar interatividade dos formulários
  useEffect(() => {
    addFormInteractivity();
  }, []);

  // ✅ ESTADO DO FORMULÁRIO PADRONIZADO SICEFSUS
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    role: "user", // Mantém compatibilidade frontend (convertido no backend)
    status: "ativo",
    departamento: "",
    telefone: "",
    municipio: "",
    uf: "",
  });

  // ✅ MOSTRAR TOAST
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ✅ CARREGAR USUÁRIOS
  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📋 Carregando usuários...');
      const usuariosData = await userService.loadUsers();
      setUsers(usuariosData);
      console.log(`✅ ${usuariosData.length} usuários carregados`);
    } catch (err) {
      console.error("❌ Erro ao carregar usuários:", err);
      showToast("Erro ao carregar usuários: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  // ✅ RESETAR FORMULÁRIO
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
    setEditingUser(null);
  };

  // ✅ NOVO USUÁRIO
  const handleNovoUsuario = () => {
    console.log('🆕 Iniciando criação de novo usuário');
    resetForm();
    setShowForm(true);
  };

  // ✅ EDITAR USUÁRIO
  const handleEditarUsuario = (user) => {
    console.log('✏️ Editando usuário:', user);

    // ✅ CONVERTER TIPO PARA ROLE (compatibilidade frontend)
    const roleMap = {
      'admin': 'admin',
      'operador': 'user',
      'administrador': 'admin'
    };

    setFormData({
      email: user.email || "",
      nome: user.nome || "",
      role: roleMap[user.tipo] || user.role || "user",
      status: user.status || "ativo",
      departamento: user.departamento || "",
      telefone: user.telefone || "",
      municipio: user.municipio || "",
      uf: user.uf || "",
    });
    setEditingUser(user);
    setShowForm(true);
  };

  // ✅ CANCELAR FORMULÁRIO
  const handleCancelar = () => {
    console.log('🚪 Cancelando formulário');
    setShowForm(false);
    resetForm();
  };

  // ✅ SALVAR USUÁRIO (CRIAR OU EDITAR)
  const handleSalvarUsuario = async (e) => {
    e.preventDefault();

    if (saving) {
      console.log('⏳ Salvamento já em andamento...');
      return;
    }

    setSaving(true);
    console.log('💾 Salvando usuário...', formData);

    try {
      // ✅ VALIDAÇÕES BÁSICAS NO FRONTEND
      if (!formData.email?.trim()) {
        throw new Error('Email é obrigatório');
      }

      if (!formData.nome?.trim()) {
        throw new Error('Nome é obrigatório');
      }

      // Validação para operadores
      if (formData.role === 'user') {
        if (!formData.municipio?.trim()) {
          throw new Error('Município é obrigatório para operadores');
        }

        if (!formData.uf?.trim()) {
          throw new Error('UF é obrigatória para operadores');
        }
      }

      let resultado;

      if (editingUser) {
        // ✏️ ATUALIZAR USUÁRIO EXISTENTE
        console.log('✏️ Atualizando usuário existente:', editingUser.id);
        resultado = await userService.updateUser(editingUser.id, formData, editingUser.email);

      } else {
        // 🆕 CRIAR NOVO USUÁRIO
        console.log('🆕 Criando novo usuário...');
        resultado = await userService.createUser(formData);
      }

      console.log('✅ Operação concluída:', resultado);

      // Mostrar mensagem de sucesso
      showToast(resultado.message, 'success');

      // 🔄 RECARREGAR LISTA
      await carregarUsuarios();

      // 🚪 FECHAR FORMULÁRIO
      setShowForm(false);
      resetForm();

    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error);

      // 🚨 TRATAMENTO DE ERROS ESPECÍFICOS
      let errorMessage = 'Erro ao salvar usuário';

      if (error.message.includes('já está cadastrado')) {
        errorMessage = 'Este email já está cadastrado no sistema';
      } else if (error.message.includes('Email inválido')) {
        errorMessage = 'Formato de email inválido';
      } else if (error.message.includes('obrigatório')) {
        errorMessage = error.message;
      } else if (error.message.includes('network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');

    } finally {
      setSaving(false);
    }
  };

  // ✅ EXCLUIR USUÁRIO
  const handleExcluirUsuario = async (userId) => {
    const user = users.find(u => u.id === userId);
    const confirmMessage = `Tem certeza que deseja excluir o usuário "${user?.nome}"?\n\nEsta ação não pode ser desfeita.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('🗑️ Excluindo usuário:', userId);

      const resultado = await userService.deleteUser(userId);

      if (resultado.success) {
        showToast(resultado.message, 'success');

        // 🔄 RECARREGAR LISTA
        await carregarUsuarios();
      }

    } catch (err) {
      console.error("❌ Erro ao excluir usuário:", err);
      showToast("Erro ao excluir usuário: " + err.message, 'error');
    }
  };

  // ✅ RESET DE SENHA
  const handleResetSenha = async (user) => {
    const confirmMessage = `Enviar email de redefinição de senha para:\n${user.email}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('📨 Enviando reset de senha para:', user.email);

      const resultado = await userService.sendPasswordReset(user);

      if (resultado.success) {
        showToast(resultado.message, 'success');
        await carregarUsuarios();
      }

    } catch (err) {
      console.error("❌ Erro ao enviar reset:", err);
      showToast("Erro ao enviar email de reset: " + err.message, 'error');
    }
  };

  return (
    <div style={styles.container}>
      {/* ✅ HEADER PADRONIZADO SICEFSUS */}
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
          disabled={loading}
        >
          <span style={styles.buttonIcon}>➕</span>
          Novo Usuário
        </button>
      </div>

      {/* ✅ ESTATÍSTICAS COMPACTAS */}
      <AdminStats users={users} />

      {/* ✅ TABELA PRINCIPAL */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>
            <span style={styles.tableIcon}>📋</span>
            Lista de Usuários ({users.length})
          </h2>

          {loading && (
            <div style={styles.loadingIndicator}>
              <div style={styles.spinner}></div>
              Carregando...
            </div>
          )}
        </div>

        {!loading && (
          <UsersTable
            users={users}
            onEdit={handleEditarUsuario}
            onResetPassword={handleResetSenha}
            onDelete={handleExcluirUsuario}
            saving={saving}
          />
        )}
      </div>

      {/* ✅ MODAL DE FORMULÁRIO */}
      {showForm && (
        <UserForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSalvarUsuario}
          onCancel={handleCancelar}
          editingUser={editingUser}
          saving={saving}
        />
      )}

      {/* ✅ TOAST NOTIFICATIONS */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// ✅ ESTILOS PADRONIZADOS SEGUINDO PADRÃO SICEFSUS
const styles = {
  container: {
    ...formStyles.container,
    maxWidth: "1400px",
    padding: "var(--space-6)",
  },

  // ✅ HEADER SEGUINDO PADRÃO SICEFSUS
  header: {
    background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
    color: "var(--white)",
    border: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "var(--space-6) var(--space-8)",
    borderRadius: "var(--border-radius-lg)",
    boxShadow: "var(--shadow-lg)",
    marginBottom: "var(--space-6)",
    gap: "var(--space-4)",
  },

  headerContent: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },

  headerTitle: {
    color: "var(--white)",
    fontSize: "var(--font-size-3xl)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    margin: 0,
    fontWeight: "600",
  },

  headerIcon: {
    fontSize: "1.2em",
    opacity: 0.9,
  },

  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "var(--font-size-lg)",
    margin: 0,
    fontWeight: "400",
  },

  addButton: {
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    color: "var(--white)",
    padding: "var(--space-4) var(--space-6)",
    fontSize: "var(--font-size-base)",
    fontWeight: "var(--font-weight-semibold)",
    borderRadius: "var(--border-radius-lg)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    transition: "all var(--transition-normal)",
    boxShadow: "var(--shadow)",
    minWidth: "fit-content",
    height: "fit-content",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },

  buttonIcon: {
    fontSize: "1.1em",
  },

  // ✅ CONTAINER DA TABELA
  tableContainer: {
    background: "var(--theme-surface)",
    borderRadius: "var(--border-radius-lg)",
    border: "2px solid var(--theme-border)",
    boxShadow: "var(--shadow)",
    overflow: "hidden",
    transition: "all var(--transition-normal)",
  },

  tableHeader: {
    background: "linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)",
    padding: "var(--space-5) var(--space-6)",
    borderBottom: "2px solid var(--theme-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tableTitle: {
    margin: 0,
    fontSize: "var(--font-size-xl)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--primary)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  },

  tableIcon: {
    fontSize: "1.1em",
    opacity: 0.8,
  },

  loadingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    color: "var(--theme-text-secondary)",
    fontSize: "var(--font-size-sm)",
  },

  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid var(--primary)",
    borderRadius: "50%",
    animation: "administracaoSpin 1s linear infinite",
  },

  // ✅ RESPONSIVIDADE
  "@media (max-width: 768px)": {
    container: {
      padding: "var(--space-4)",
    },

    header: {
      flexDirection: "column",
      gap: "var(--space-4)",
      textAlign: "center",
    },

    headerTitle: {
      fontSize: "var(--font-size-2xl)",
    },

    addButton: {
      width: "100%",
      justifyContent: "center",
    },

    tableHeader: {
      flexDirection: "column",
      gap: "var(--space-3)",
      alignItems: "flex-start",
    },
  },
};

// ✅ CSS ANIMATIONS
if (!document.getElementById('administracao-animations')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'administracao-animations';
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes administracaoSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Administracao;