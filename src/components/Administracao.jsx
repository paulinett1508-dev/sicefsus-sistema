// src/components/Administracao.jsx - INTERFACE MELHORADA CONFORME SOLICITAÇÃO
import React, { useState, useEffect } from "react";
import userService from "../services/userService";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";
import { useToast } from "./Toast";

export default function Administracao({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    role: "user", // user = operador
    status: "ativo",
    municipio: "",
    uf: "",
    departamento: "",
    telefone: "",
  });

  // ✅ CARREGAR USUÁRIOS
  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await userService.loadUsers();
      setUsuarios(usuariosData);
      console.log("✅ Usuários carregados:", usuariosData.length);
    } catch (error) {
      console.error("❌ Erro ao carregar usuários:", error);
      showToast("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // ✅ RESETAR FORMULÁRIO
  const resetForm = () => {
    setFormData({
      email: "",
      nome: "",
      role: "user",
      status: "ativo",
      municipio: "",
      uf: "",
      departamento: "",
      telefone: "",
    });
    setEditingUser(null);
    setShowUserForm(false);
  };

  // ✅ NOVO USUÁRIO
  const handleNovoUsuario = () => {
    resetForm();
    setShowUserForm(true);
  };

  // ✅ EDITAR USUÁRIO
  const handleEditarUsuario = (user) => {
    console.log("✏️ Editando usuário:", user);

    // ✅ MAPEAMENTO CORRETO DOS CAMPOS
    const roleMap = {
      admin: "admin",
      operador: "user",
      user: "user", // Garantir compatibilidade
    };

    setFormData({
      email: user.email || "",
      nome: user.nome || "",
      role: roleMap[user.tipo] || "user",
      status: user.status || "ativo",
      municipio: user.municipio || "",
      uf: user.uf || "",
      departamento: user.departamento || "",
      telefone: user.telefone || "",
    });
    setEditingUser(user);
    setShowUserForm(true);
  };

  // ✅ CANCELAR FORMULÁRIO
  const handleCancelar = () => {
    resetForm();
  };

  // ✅ SALVAR USUÁRIO
  const handleSalvarUsuario = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let resultado;

      if (editingUser) {
        // Atualizar usuário existente
        resultado = await userService.updateUser(
          editingUser.id,
          formData,
          editingUser.email,
        );
        showToast(
          resultado.message || "Usuário atualizado com sucesso!",
          "success",
        );
      } else {
        // Criar novo usuário
        resultado = await userService.createUser(formData);
        showToast(
          resultado.message || "Usuário criado com sucesso!",
          "success",
        );
      }

      // Recarregar lista e fechar formulário
      await carregarUsuarios();
      resetForm();
    } catch (error) {
      console.error("❌ Erro ao salvar usuário:", error);
      showToast(error.message || "Erro ao salvar usuário", "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ EXCLUIR USUÁRIO
  const handleExcluirUsuario = async (user) => {
    const confirmMessage = `⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR permanentemente o usuário?\n\n👤 ${user.nome}\n📧 ${user.email}\n\n❌ Esta ação NÃO PODE ser desfeita!\n\nPara apenas desativar temporariamente, use a opção "Desativar" instead.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSaving(true);
      const resultado = await userService.deleteUser(user.id);
      showToast(
        resultado.message || "Usuário excluído com sucesso!",
        "success",
      );
      await carregarUsuarios();
    } catch (error) {
      console.error("❌ Erro ao excluir usuário:", error);
      showToast(error.message || "Erro ao excluir usuário", "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ NOVA: DESATIVAR/ATIVAR USUÁRIO
  const handleToggleStatus = async (user) => {
    const novoStatus = user.status === "ativo" ? "inativo" : "ativo";
    const acao = novoStatus === "ativo" ? "ativar" : "desativar";

    const confirmMessage = `Tem certeza que deseja ${acao} o usuário?\n\n👤 ${user.nome}\n📧 ${user.email}\n\n${novoStatus === "inativo" ? "⚠️ Usuário não poderá mais fazer login" : "✅ Usuário poderá fazer login novamente"}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSaving(true);

      // ✅ USAR updateUser COM STATUS ALTERADO
      const dadosAtualizacao = {
        email: user.email,
        nome: user.nome,
        role: user.tipo === "admin" ? "admin" : "user",
        status: novoStatus,
        municipio: user.municipio || "",
        uf: user.uf || "",
        departamento: user.departamento || "",
        telefone: user.telefone || "",
      };

      const resultado = await userService.updateUser(
        user.id,
        dadosAtualizacao,
        user.email,
      );

      showToast(
        `Usuário ${acao === "ativar" ? "ativado" : "desativado"} com sucesso!`,
        "success",
      );
      await carregarUsuarios();
    } catch (error) {
      console.error(`❌ Erro ao ${acao} usuário:`, error);
      showToast(`Erro ao ${acao} usuário: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ RESET SENHA
  const handleResetSenha = async (user) => {
    const confirmMessage = `Enviar email de redefinição de senha para:\n\n👤 ${user.nome}\n📧 ${user.email}\n\nO usuário receberá um link para criar nova senha.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSaving(true);
      const resultado = await userService.sendPasswordReset(user);
      showToast(resultado.message || "Email de reset enviado!", "success");
    } catch (error) {
      console.error("❌ Erro ao enviar reset:", error);
      showToast(error.message || "Erro ao enviar email de reset", "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ CALCULAR ESTATÍSTICAS
  const calcularEstatisticas = () => {
    const total = usuarios.length;
    const ativos = usuarios.filter((u) => u.status === "ativo").length;
    const admins = usuarios.filter((u) => u.tipo === "admin").length;
    const operadores = usuarios.filter((u) => u.tipo === "operador").length;
    const inativos = usuarios.filter((u) => u.status === "inativo").length;

    return { total, ativos, admins, operadores, inativos };
  };

  const stats = calcularEstatisticas();

  return (
    <div style={styles.container}>
      {/* ✅ CABEÇALHO MELHORADO */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>👥 Administração de Usuários</h1>
          <p style={styles.subtitle}>
            Gerencie usuários, permissões e acessos do sistema SICEFSUS
          </p>
        </div>

        {/* ✅ BOTÃO "NOVO USUÁRIO" EM LOCAL ADEQUADO */}
        <div style={styles.headerActions}>
          <button
            onClick={handleNovoUsuario}
            style={styles.primaryButton}
            disabled={loading || saving}
          >
            <span style={styles.buttonIcon}>👤</span>
            Novo Usuário
          </button>
        </div>
      </div>

      {/* ✅ ESTATÍSTICAS */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.ativos}</div>
          <div style={styles.statLabel}>Ativos</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.admins}</div>
          <div style={styles.statLabel}>Admins</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.operadores}</div>
          <div style={styles.statLabel}>Operadores</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.inativos}</div>
          <div style={styles.statLabel}>Inativos</div>
        </div>
      </div>

      {/* ✅ TABELA DE USUÁRIOS MELHORADA */}
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
            onToggleStatus={handleToggleStatus} // ✅ NOVA PROP
            onResetPassword={handleResetSenha}
            loading={saving}
          />
        )}
      </div>

      {/* ✅ FORMULÁRIO DE USUÁRIO */}
      {showUserForm && (
        <UserForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSalvarUsuario}
          onCancel={handleCancelar}
          editingUser={editingUser}
          saving={saving}
        />
      )}
    </div>
  );
}

// ✅ ESTILOS MELHORADOS
const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "var(--theme-bg, #f8f9fa)",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },

  headerLeft: {
    flex: 1,
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
  },

  subtitle: {
    margin: 0,
    fontSize: "16px",
    color: "#6c757d",
    fontWeight: "400",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,123,255,0.3)",
  },

  buttonIcon: {
    fontSize: "18px",
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },

  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },

  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#007bff",
    marginBottom: "4px",
  },

  statLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500",
  },

  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },

  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
  },

  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    gap: "16px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// ✅ CSS ANIMATIONS
if (!document.getElementById("admin-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "admin-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .primary-button:hover {
      background-color: #0056b3 !important;
      transform: translateY(-1px);
    }

    .special-button:hover {
      background-color: #218838 !important;
    }
  `;
  document.head.appendChild(styleSheet);
}
