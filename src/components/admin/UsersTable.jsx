// src/components/admin/UsersTable.jsx
import React from "react";

const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  loading,
}) => {
  if (users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
        <h3>Nenhum usuário encontrado</h3>
        <p>Ainda não há usuários cadastrados no sistema</p>
      </div>
    );
  }

  return (
    <div style={styles.usersTableContainer}>
      <table style={styles.usersTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>👤 Nome</th>
            <th style={styles.tableHeader}>📧 Email</th>
            <th style={styles.tableHeader}>🏢 Local</th>
            <th style={styles.tableHeader}>⚡ Tipo</th>
            <th style={styles.tableHeader}>📊 Status</th>
            <th style={styles.tableHeader}>🔧 Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((usuario, index) => (
            <tr
              key={usuario.id}
              style={{
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <td style={styles.tableCell}>
                <div style={{ fontWeight: "500" }}>
                  {usuario.nome || "N/A"}
                </div>
              </td>
              <td style={styles.tableCell}>
                <div style={{ fontSize: "13px" }}>
                  {usuario.email || "N/A"}
                </div>
              </td>
              <td style={styles.tableCell}>
                {usuario.municipio && usuario.uf ? (
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      {usuario.municipio}
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      {usuario.uf}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: "#999", fontStyle: "italic" }}>
                    N/A
                  </span>
                )}
              </td>
              <td style={styles.tableCell}>
                <span
                  style={{
                    fontSize: "10px",
                    color: "white",
                    backgroundColor:
                      usuario.tipo === "admin" ? "#dc3545" : "#28a745",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  {usuario.tipo || "N/A"}
                </span>
              </td>
              <td style={styles.tableCell}>
                <span
                  style={{
                    fontSize: "10px",
                    color: "white",
                    backgroundColor:
                      usuario.status === "ativo" ? "#28a745" : "#dc3545",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  {usuario.status || "inativo"}
                </span>
              </td>
              <td style={styles.tableCell}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => onEdit(usuario)}
                    style={styles.actionButton}
                    title="Editar usuário"
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onToggleStatus(usuario)}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: usuario.status === "ativo" ? "#ffc107" : "#28a745",
                    }}
                    title={usuario.status === "ativo" ? "Inativar usuário" : "Ativar usuário"}
                    disabled={loading}
                  >
                    {usuario.status === "ativo" ? "⏸️" : "▶️"}
                  </button>
                  <button
                    onClick={() => onResetPassword(usuario)}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: "#17a2b8",
                    }}
                    title="Resetar senha"
                    disabled={loading}
                  >
                    🔑
                  </button>
                  <button
                    onClick={() => {
                      console.log("🗑️ === CLIQUE EXCLUIR ===");
                      console.log("📊 Usuário completo:", usuario);
                      console.log("📊 Status atual:", usuario.status);
                      console.log("📊 Botão habilitado:", usuario.status === "inativo" && !loading);
                      
                      if (usuario.status === "ativo") {
                        console.log("⚠️ Tentativa de excluir usuário ativo bloqueada");
                        return;
                      }
                      
                      console.log("✅ Chamando onDelete...");
                      onDelete(usuario);
                    }}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: usuario.status === "inativo" ? "#dc3545" : "#6c757d",
                      opacity: usuario.status === "inativo" ? 1 : 0.5,
                      cursor: usuario.status === "inativo" ? "pointer" : "not-allowed",
                    }}
                    title={
                      usuario.status === "inativo"
                        ? "Excluir usuário permanentemente"
                        : "Inative o usuário para poder excluir"
                    }
                    disabled={loading || usuario.status === "ativo"}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  usersTableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  usersTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "12px",
    color: "#495057",
    textTransform: "uppercase",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #e9ecef",
  },
  tableCell: {
    padding: "12px",
    fontSize: "13px",
    verticalAlign: "top",
  },
  actionButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "30px",
    height: "30px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
  },
};

export default UsersTable;