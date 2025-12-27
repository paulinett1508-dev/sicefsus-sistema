// src/components/admin/UsersTable.jsx - VERSÃO CORRIGIDA COMPLETA
import React from "react";
import { useTheme } from "../../context/ThemeContext";

const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  loading,
}) => {
  const { isDark } = useTheme();

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? "var(--theme-surface)" : "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.1)",
      border: isDark ? "1px solid var(--theme-border)" : "none",
    },
    tableHeader: {
      padding: "12px",
      textAlign: "left",
      fontWeight: "bold",
      fontSize: "12px",
      color: isDark ? "var(--theme-text-secondary)" : "#495057",
      textTransform: "uppercase",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f8f9fa",
      borderBottom: isDark ? "2px solid var(--theme-border)" : "2px solid #e9ecef",
    },
    rowEven: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#ffffff",
      borderBottom: isDark ? "1px solid var(--theme-border)" : "1px solid #e9ecef",
    },
    rowOdd: {
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f8f9fa",
      borderBottom: isDark ? "1px solid var(--theme-border)" : "1px solid #e9ecef",
    },
    subdued: {
      color: isDark ? "var(--theme-text-muted)" : "#666",
    },
    muted: {
      color: isDark ? "var(--theme-text-muted)" : "#999",
      fontStyle: "italic",
    },
    emptyState: {
      textAlign: "center",
      padding: "40px",
      color: isDark ? "var(--theme-text-muted)" : "#6c757d",
      backgroundColor: isDark ? "var(--theme-surface)" : "transparent",
      borderRadius: "8px",
    },
  };

  if (!users || users.length === 0) {
    return (
      <div style={dynamicStyles.emptyState}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: isDark ? "var(--theme-text-muted)" : "#6c757d" }}>group</span>
        </div>
        <h3 style={{ color: isDark ? "var(--theme-text)" : "inherit" }}>Nenhum usuário encontrado</h3>
        <p>Ainda não há usuários cadastrados no sistema</p>
      </div>
    );
  }

  return (
    <div style={dynamicStyles.container}>
      <table style={styles.usersTable}>
        <thead>
          <tr>
            <th style={dynamicStyles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>person</span> Nome</th>
            <th style={dynamicStyles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>mail</span> Email</th>
            <th style={dynamicStyles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>location_city</span> Local</th>
            <th style={dynamicStyles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>bolt</span> Tipo</th>
            <th style={dynamicStyles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>monitoring</span> Status</th>
            <th style={dynamicStyles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>build</span> Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((usuario, index) => (
            <tr
              key={usuario.id}
              style={index % 2 === 0 ? dynamicStyles.rowEven : dynamicStyles.rowOdd}
            >
              <td style={{ ...styles.tableCell, color: isDark ? "var(--theme-text)" : "inherit" }}>
                <div style={{ fontWeight: "500" }}>{usuario.nome || "N/A"}</div>
              </td>
              <td style={{ ...styles.tableCell, color: isDark ? "var(--theme-text)" : "inherit" }}>
                <div style={{ fontSize: "13px" }}>{usuario.email || "N/A"}</div>
              </td>
              <td style={styles.tableCell}>
                {usuario.municipio && usuario.uf ? (
                  <div>
                    <div style={{ fontWeight: "500", color: isDark ? "var(--theme-text)" : "inherit" }}>{usuario.municipio}</div>
                    <div style={{ fontSize: "11px", ...dynamicStyles.subdued }}>
                      {usuario.uf}
                    </div>
                  </div>
                ) : (
                  <span style={dynamicStyles.muted}>
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
                      usuario.tipo === "admin" 
                        ? "#dc3545" 
                        : usuario.tipo === "gestor"
                        ? "#ffc107"
                        : "#28a745",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  {usuario.tipo === "gestor" ? (
                    <><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>account_balance</span> GESTOR</>
                  ) : usuario.tipo || "N/A"}
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
                  {/* EDITAR */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("EDIT clicado:", usuario.nome);
                      onEdit(usuario);
                    }}
                    style={styles.actionButton}
                    title="Editar usuário"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
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
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {usuario.status === "ativo" ? "pause" : "play_arrow"}
                    </span>
                  </button>

                  {/* DELETE - SÓ PERMITE SE INATIVO */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (usuario.status !== "ativo") {
                        console.log("Excluindo usuário inativo:", usuario.nome);
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
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
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
