// src/components/admin/UsersTable.jsx - VERSÃO CORRIGIDA COMPLETA
import React from "react";

const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
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
                <div style={{ fontWeight: "500" }}>{usuario.nome || "N/A"}</div>
              </td>
              <td style={styles.tableCell}>
                <div style={{ fontSize: "13px" }}>{usuario.email || "N/A"}</div>
              </td>
              <td style={styles.tableCell}>
                {usuario.municipio && usuario.uf ? (
                  <div>
                    <div style={{ fontWeight: "500" }}>{usuario.municipio}</div>
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
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  {/* ✏️ EDITAR */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("✏️ EDIT clicado:", usuario.nome);
                      onEdit(usuario);
                    }}
                    style={styles.actionButton}
                    title="Editar usuário"
                  >
                    ✏️
                  </button>

                  {/* 🔄 TOGGLE STATUS */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "🔄 TOGGLE clicado:",
                        usuario.nome,
                        usuario.status,
                      );
                      onToggleStatus(usuario);
                    }}
                    style={{
                      ...styles.actionButton,
                      backgroundColor:
                        usuario.status === "ativo" ? "#ffc107" : "#28a745",
                    }}
                    title={
                      usuario.status === "ativo"
                        ? "Inativar usuário"
                        : "Ativar usuário"
                    }
                  >
                    {usuario.status === "ativo" ? "⏸️" : "▶️"}
                  </button>

                  {/* 🗑️ DELETE - SÓ PERMITE SE INATIVO */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (usuario.status !== "ativo") {
                        console.log("🗑️ Excluindo usuário inativo:", usuario.nome);
                        onDelete(usuario);
                      }
                    }}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: usuario.status === "ativo" ? "#6c757d" : "#dc3545",
                      opacity: usuario.status === "ativo" ? 0.5 : 1,
                      cursor: usuario.status === "ativo" ? "not-allowed" : "pointer",
                    }}
                    title={
                      usuario.status === "ativo" 
                        ? "Inative o usuário primeiro para excluir" 
                        : "Excluir usuário"
                    }
                    disabled={usuario.status === "ativo"}
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
    padding: "6px 8px", // ✅ Aumentei padding
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px", // ✅ Aumentei fonte
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "32px", // ✅ Largura mínima
    minHeight: "32px", // ✅ Altura mínima
    transition: "all 0.2s ease", // ✅ Transição suave
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
  },
};

export default UsersTable;
