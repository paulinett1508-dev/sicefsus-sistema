// src/components/admin/UsersTable.jsx
import React from "react";

const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  loading,
}) => {
  if (!users || users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--theme-text-muted)" }}>group</span>
        </div>
        <h3 style={{ color: "var(--theme-text)" }}>Nenhum usuário encontrado</h3>
        <p>Ainda não há usuários cadastrados no sistema</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <table style={styles.usersTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>person</span> Nome</th>
            <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>mail</span> Email</th>
            <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>location_city</span> Local</th>
            <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>bolt</span> Tipo</th>
            <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>monitoring</span> Status</th>
            <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>build</span> Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((usuario, index) => (
            <tr
              key={usuario.id}
              style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
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
                    <div style={styles.subdued}>
                      {usuario.uf}
                    </div>
                  </div>
                ) : (
                  <span style={styles.muted}>
                    N/A
                  </span>
                )}
              </td>
              <td style={styles.tableCell}>
                <span
                  style={{
                    fontSize: "10px",
                    color: usuario.tipo === "gestor" ? "var(--warning-800)" : "var(--white)",
                    backgroundColor:
                      usuario.tipo === "admin"
                        ? "var(--error)"
                        : usuario.tipo === "gestor"
                        ? "var(--warning-200)"
                        : "var(--success)",
                    padding: "3px 8px",
                    borderRadius: "10px",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
                    {usuario.tipo === "admin" ? "shield" : usuario.tipo === "gestor" ? "account_balance" : "person"}
                  </span>
                  {usuario.tipo?.toUpperCase() || "N/A"}
                </span>
              </td>
              <td style={styles.tableCell}>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--white)",
                    backgroundColor:
                      usuario.status === "ativo" ? "var(--success)" : "var(--error)",
                    padding: "3px 8px",
                    borderRadius: "10px",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
                    {usuario.status === "ativo" ? "check_circle" : "cancel"}
                  </span>
                  {usuario.status || "inativo"}
                </span>
              </td>
              <td style={styles.tableCell}>
                <div
                  style={{ display: "flex", gap: "4px", alignItems: "center" }}
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

                  {/* Toggle Status */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleStatus(usuario);
                    }}
                    style={{
                      ...styles.actionButton,
                      backgroundColor:
                        usuario.status === "ativo" ? "var(--warning)" : "var(--success)",
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
                      backgroundColor: usuario.status === "ativo" ? "var(--secondary)" : "var(--error)",
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
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--theme-border)",
  },
  usersTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    padding: "8px 10px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
    textTransform: "uppercase",
    backgroundColor: "var(--theme-surface-secondary)",
    borderBottom: "2px solid var(--theme-border)",
  },
  rowEven: {
    backgroundColor: "var(--theme-surface)",
    borderBottom: "1px solid var(--theme-border)",
  },
  rowOdd: {
    backgroundColor: "var(--theme-surface-secondary)",
    borderBottom: "1px solid var(--theme-border)",
  },
  tableCell: {
    padding: "6px 10px",
    fontSize: "12px",
    verticalAlign: "middle",
    color: "var(--theme-text)",
  },
  subdued: {
    fontSize: "11px",
    color: "var(--theme-text-muted)",
  },
  muted: {
    color: "var(--theme-text-muted)",
    fontStyle: "italic",
  },
  actionButton: {
    backgroundColor: "var(--success)",
    color: "var(--white)",
    border: "none",
    padding: "4px 6px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "28px",
    minHeight: "28px",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "var(--theme-text-secondary)",
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
  },
};

export default UsersTable;
