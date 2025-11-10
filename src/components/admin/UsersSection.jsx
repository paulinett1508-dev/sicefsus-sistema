// src/components/admin/UsersSection.jsx
import React from "react";
import UsersTable from "./UsersTable";

const UsersSection = ({
  users,
  userFilter,
  setUserFilter,
  onEdit,
  onDelete,
  onToggleStatus,
  onNovoUsuario,
  loading,
  currentUserType,
}) => {
  return (
    <div style={styles.tableContainer}>
      {/* Cabeçalho da seção com botão */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          📋 Lista de Usuários ({users.length})
        </h3>
        {currentUserType === "admin" && onNovoUsuario && (
          <button
            onClick={onNovoUsuario}
            style={styles.newUserButton}
            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
          >
            ➕ Novo Usuário
          </button>
        )}
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
          onEdit={onEdit}
          onDelete={(usuario) => {
            console.log(
              "🔗 UsersSection: onDelete chamado para:",
              usuario.nome,
            );
            console.log(
              "🔗 Função onDelete existe:",
              typeof onDelete === "function",
            );
            onDelete(usuario);
          }}
          onToggleStatus={onToggleStatus}
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
