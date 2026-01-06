// src/components/admin/UsersSection.jsx
import React from "react";
import UsersTable from "./UsersTable";
import { useTheme } from "../../context/ThemeContext";

const UsersSection = ({
  users,
  userFilter,
  setUserFilter,
  handleNovoUsuario,
  handleEditarUsuario,
  handleDelete,
  handleToggleStatus,
  loading,
}) => {
  const { isDark } = useTheme();

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    tableContainer: {
      backgroundColor: isDark ? "var(--theme-surface)" : "white",
      borderRadius: "8px",
      padding: "12px 16px",
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.1)",
      border: isDark ? "1px solid var(--theme-border)" : "none",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      margin: 0,
      color: isDark ? "var(--theme-text)" : "#333",
    },
    searchInput: {
      width: "100%",
      padding: "8px 12px",
      border: isDark ? "1px solid var(--theme-border)" : "1px solid #ced4da",
      borderRadius: "5px",
      fontSize: "13px",
      backgroundColor: isDark ? "var(--theme-input-bg)" : "white",
      color: isDark ? "var(--theme-text)" : "#333",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: isDark ? "3px solid var(--theme-border)" : "3px solid #f3f3f3",
      borderTop: "3px solid #007bff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 16px",
    },
  };

  const exportarUsuarios = () => {
    if (!users || users.length === 0) {
      alert("Nenhum usuário para exportar");
      return;
    }

    // Preparar dados para exportação
    const dadosExport = users.map(user => ({
      Nome: user.nome || "",
      Email: user.email || "",
      Tipo: user.tipo || "",
      Status: user.status || "",
      Município: user.municipio || "",
      UF: user.uf || "",
      Departamento: user.departamento || "",
      Telefone: user.telefone || "",
      "Último Acesso": user.ultimoAcesso ? new Date(user.ultimoAcesso.seconds * 1000).toLocaleString("pt-BR") : "Nunca"
    }));

    // Criar CSV
    const headers = Object.keys(dadosExport[0]);
    const csvContent = [
      headers.join(","),
      ...dadosExport.map(row => 
        headers.map(header => {
          let value = row[header] || "";
          value = String(value).replace(/"/g, '""');
          return `"${value}"`;
        }).join(",")
      )
    ].join("\n");

    // Download
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={dynamicStyles.tableContainer}>
      {/* Cabeçalho da seção com botões */}
      <div style={styles.sectionHeader}>
        <h3 style={dynamicStyles.sectionTitle}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: "middle", marginRight: 6 }}>group</span>
          Lista de Usuários ({users?.length || 0})
        </h3>
        <div style={styles.buttonGroup}>
          <button
            onClick={exportarUsuarios}
            style={styles.exportButton}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>download</span>
            Exportar CSV
          </button>
          <button
            onClick={handleNovoUsuario}
            style={styles.newUserButton}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>person_add</span>
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Campo de busca */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar usuário por nome ou email..."
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          style={dynamicStyles.searchInput}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={dynamicStyles.spinner}></div>
          <p>Carregando usuários...</p>
        </div>
      ) : (
        <UsersTable
          users={users}
          onEdit={handleEditarUsuario}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      )}
    </div>
  );
};

const styles = {
  tableContainer: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--theme-border)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    color: "var(--theme-text)",
  },

  buttonGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  exportButton: {
    backgroundColor: "var(--success)",
    color: "var(--white)",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  newUserButton: {
    backgroundColor: "var(--primary)",
    color: "var(--white)",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  searchContainer: {
    marginBottom: "12px",
  },

  searchInput: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--theme-border)",
    borderRadius: "5px",
    fontSize: "13px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
  },

  loading: {
    textAlign: "center",
    padding: "40px",
    color: "var(--theme-text-secondary)",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid var(--theme-border)",
    borderTop: "3px solid var(--primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
};

export default UsersSection;
