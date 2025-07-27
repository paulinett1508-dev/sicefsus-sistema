// src/components/Administracao.jsx - Página Principal de Administração SICEFSUS
import React, { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/userService";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";
import AdminStats from "./AdminStats";
import { useToast } from "./Toast";
import { formStyles, addFormInteractivity } from "../utils/formStyles";

const Administracao = ({ usuario }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();
  const userService = new UserService();

  // ✅ Adicionar interatividade dos formulários
  useEffect(() => {
    addFormInteractivity();
  }, []);

  // Carregar usuários
  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const usuariosData = await userService.loadUsers();
      setUsers(usuariosData);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [error, userService]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  // Estado do formulário
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

  // Handlers de ação
  const handleNovoUsuario = () => {
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
    setModoVisualizacao(false);
    setShowForm(true);
  };

  const handleEditarUsuario = (user) => {
    setFormData({
      email: user.email || "",
      nome: user.nome || "",
      role: user.role || "user",
      status: user.status || "ativo",
      departamento: user.departamento || "",
      telefone: user.telefone || "",
      municipio: user.municipio || "",
      uf: user.uf || "",
    });
    setEditingUser(user);
    setModoVisualizacao(false);
    setShowForm(true);
  };

  const handleVisualizarUsuario = (user) => {
    setFormData({
      email: user.email || "",
      nome: user.nome || "",
      role: user.role || "user",
      status: user.status || "ativo",
      departamento: user.departamento || "",
      telefone: user.telefone || "",
      municipio: user.municipio || "",
      uf: user.uf || "",
    });
    setEditingUser(user);
    setModoVisualizacao(true);
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditingUser(null);
    setModoVisualizacao(false);
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
  };

  const handleSalvarUsuario = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const result = await userService.updateUser(editingUser.id, formData, editingUser.email);
        if (result.success) {
          success(result.message);
        }
      } else {
        // Criar novo usuário
        const result = await userService.createUser(formData);
        if (result.success) {
          success(result.message);
        }
      }

      // Fechar formulário e recarregar dados
      setShowForm(false);
      setEditingUser(null);
      setModoVisualizacao(false);
      await carregarUsuarios();
      
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      error(err.message || "Erro ao salvar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleExcluirUsuario = async (userId) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      success("Usuário excluído com sucesso!");
      await carregarUsuarios();
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      error("Erro ao excluir usuário");
    }
  };

  const handleResetSenha = async (user) => {
    if (!window.confirm(`Enviar email de reset de senha para ${user.email}?`)) {
      return;
    }

    try {
      const result = await userService.sendPasswordReset(user);
      if (result.success) {
        success(result.message);
        await carregarUsuarios();
      }
    } catch (err) {
      console.error("Erro ao enviar reset:", err);
      error("Erro ao enviar email de reset");
    }
  };

  return (
    <div style={styles.container}>
      {/* ✅ HEADER PADRONIZADO */}
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
        </div>

        <UsersTable
            users={users}
            onEdit={handleEditarUsuario}
            onResetPassword={handleResetSenha}
            onDelete={handleExcluirUsuario}
            saving={saving}
          />
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
          modoVisualizacao={modoVisualizacao}
        />
      )}
    </div>
  );
};

// ✅ ESTILOS PADRONIZADOS SEGUINDO EMENDAS.JSX
const styles = {
  container: {
    ...formStyles.container,
    maxWidth: "1400px",
  },

  // ✅ HEADER SEGUINDO PADRÃO EMENDAS
  header: {
    ...formStyles.header,
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
    ...formStyles.headerTitle,
    color: "var(--white)",
    fontSize: "var(--font-size-3xl)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    margin: 0,
  },

  headerIcon: {
    fontSize: "1.2em",
    opacity: 0.9,
  },

  headerSubtitle: {
    ...formStyles.headerSubtitle,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "var(--font-size-lg)",
    margin: 0,
  },

  addButton: {
    ...formStyles.submitButton,
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

  // ✅ RESPONSIVIDADE
  "@media (max-width: 768px)": {
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
  },
};

export default Administracao;