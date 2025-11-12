// src/components/admin/UsersSection.jsx
import React from "react";
import UsersTable from "./UsersTable";

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
    <div style={styles.tableContainer}>
      {/* Cabeçalho da seção com botões */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          📋 Lista de Usuários ({users?.length || 0})
        </h3>
        <div style={styles.buttonGroup}>
          <button
            onClick={exportarUsuarios}
            style={styles.exportButton}
            onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
          >
            📥 Exportar CSV
          </button>
          <button
            onClick={handleNovoUsuario}
            style={styles.newUserButton}
            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
          >
            ➕ Novo Usuário
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
          style={styles.searchInput}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
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
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    color: "#333",
  },

  buttonGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  exportButton: {
    backgroundColor: "#28a745",
    color: "white",
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
    backgroundColor: "#007bff",
    color: "white",
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
    marginBottom: "20px",
  },

  searchInput: {
    width: "100%",
    padding: "10px 15px",
    border: "1px solid #ced4da",
    borderRadius: "5px",
    fontSize: "14px",
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
};

export default UsersSection;
