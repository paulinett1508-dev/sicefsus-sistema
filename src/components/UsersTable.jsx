
// src/components/UsersTable.jsx - Tabela de Usuários com UX Melhorada
import React from "react";

const UsersTable = ({
  users,
  onEdit,
  onResetPassword,
  onDelete,
  saving = false,
}) => {
  const formatLastAccess = (lastAccess) => {
    if (!lastAccess) {
      return <span style={styles.neverAccessed}>Nunca acessou</span>;
    }
    return <span>{lastAccess.toDate().toLocaleString("pt-BR")}</span>;
  };

  const formatLocation = (user) => {
    if (user.role === "admin") {
      return <span style={styles.locationBadge}>🌐 Acesso Total</span>;
    }

    if (user.municipio && user.uf) {
      return (
        <span style={styles.locationBadge}>
          {user.municipio}/{user.uf.toUpperCase()}
        </span>
      );
    }

    return <span style={styles.locationWarning}>⚠️ Não configurado</span>;
  };

  const formatStatus = (status) => {
    const statusMap = {
      ativo: { label: "✅ Ativo", style: styles.statusAtivo },
      inativo: { label: "⏸️ Inativo", style: styles.statusInativo },
      bloqueado: { label: "🚫 Bloqueado", style: styles.statusBloqueado },
    };

    const statusInfo = statusMap[status] || statusMap.ativo;
    return (
      <span style={statusInfo.style}>
        {statusInfo.label}
      </span>
    );
  };

  const formatRole = (role) => {
    return (
      <span style={role === "admin" ? styles.badgeAdmin : styles.badgeUser}>
        {role === "admin" ? "👑 Admin" : "👤 Usuário"}
      </span>
    );
  };

  if (users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>👥</div>
        <h3 style={styles.emptyTitle}>Nenhum usuário encontrado</h3>
        <p style={styles.emptyText}>
          Clique em "Novo Usuário" para adicionar o primeiro usuário ao sistema.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.tableContainer}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Perfil</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Departamento</th>
              <th style={styles.th}>Município/UF</th>
              <th style={styles.th}>Último Acesso</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                style={{
                  ...styles.row,
                  ...(user.primeiroAcesso ? styles.firstAccessRow : {})
                }}
              >
                <td style={styles.td}>
                  <div style={styles.userNameContainer}>
                    <span style={styles.userName}>{user.nome}</span>
                    {user.primeiroAcesso && (
                      <span style={styles.firstAccessBadge}>
                        🔑 Primeiro acesso
                      </span>
                    )}
                  </div>
                </td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{formatRole(user.role)}</td>
                <td style={styles.td}>{formatStatus(user.status)}</td>
                <td style={styles.td}>{user.departamento || "-"}</td>
                <td style={styles.td}>{formatLocation(user)}</td>
                <td style={styles.td}>
                  <div style={styles.accessInfo}>
                    {formatLastAccess(user.ultimoAcesso)}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      style={styles.btnEdit}
                      onClick={() => onEdit(user)}
                      title="Editar dados"
                      disabled={saving}
                    >
                      ✏️
                    </button>
                    <button
                      style={styles.btnReset}
                      onClick={() => onResetPassword(user)}
                      title={
                        user.primeiroAcesso
                          ? "Reenviar email de primeiro acesso"
                          : "Enviar reset de senha"
                      }
                      disabled={saving}
                    >
                      🔑
                    </button>
                    <button
                      style={styles.btnDelete}
                      onClick={() => onDelete(user)}
                      title="Excluir usuário"
                      disabled={saving}
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
    </div>
  );
};

const styles = {
  tableContainer: {
    background: "var(--theme-surface)",
    borderRadius: "12px",
    boxShadow: "var(--shadow)",
    border: "2px solid var(--theme-border)",
    overflow: "hidden",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  headerRow: {
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
  },

  th: {
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "var(--white)",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  row: {
    transition: "all 0.2s ease",
    borderBottom: "1px solid var(--theme-border)",
  },

  firstAccessRow: {
    backgroundColor: "var(--warning-light)",
  },

  td: {
    padding: "12px",
    color: "var(--theme-text)",
    verticalAlign: "middle",
  },

  userNameContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  userName: {
    fontWeight: "600",
    color: "var(--primary)",
  },

  firstAccessBadge: {
    backgroundColor: "var(--warning)",
    color: "var(--white)",
    fontSize: "0.75em",
    padding: "2px 8px",
    borderRadius: "12px",
    fontWeight: "500",
    width: "fit-content",
  },

  badgeAdmin: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "600",
    background: "var(--error)",
    color: "var(--white)",
  },

  badgeUser: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "600",
    background: "var(--success)",
    color: "var(--white)",
  },

  statusAtivo: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "600",
    background: "var(--success-light)",
    color: "var(--success-dark)",
    border: "1px solid var(--success)",
  },

  statusInativo: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "600",
    background: "var(--warning-light)",
    color: "var(--warning-dark)",
    border: "1px solid var(--warning)",
  },

  statusBloqueado: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "600",
    background: "var(--error-light)",
    color: "var(--error-dark)",
    border: "1px solid var(--error)",
  },

  locationBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8em",
    fontWeight: "500",
    background: "var(--accent-light)",
    color: "var(--accent-dark)",
    border: "1px solid var(--accent)",
  },

  locationWarning: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8em",
    fontWeight: "500",
    background: "var(--error-light)",
    color: "var(--error-dark)",
    border: "1px solid var(--error)",
  },

  accessInfo: {
    fontSize: "0.9em",
  },

  neverAccessed: {
    color: "var(--error)",
    fontStyle: "italic",
    fontWeight: "500",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
  },

  btnEdit: {
    background: "var(--info)",
    border: "none",
    color: "var(--white)",
    fontSize: "1.1em",
    cursor: "pointer",
    padding: "8px 10px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-sm)",
  },

  btnReset: {
    background: "var(--accent)",
    border: "none",
    color: "var(--white)",
    fontSize: "1.1em",
    cursor: "pointer",
    padding: "8px 10px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-sm)",
  },

  btnDelete: {
    background: "var(--error)",
    border: "none",
    color: "var(--white)",
    fontSize: "1.1em",
    cursor: "pointer",
    padding: "8px 10px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-sm)",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "var(--theme-text-secondary)",
    background: "var(--theme-surface)",
    borderRadius: "12px",
    border: "2px dashed var(--theme-border)",
  },

  emptyIcon: {
    fontSize: "4em",
    marginBottom: "20px",
    opacity: 0.5,
  },

  emptyTitle: {
    margin: "0 0 10px 0",
    color: "var(--theme-text)",
    fontSize: "1.5em",
  },

  emptyText: {
    margin: 0,
    fontSize: "1em",
    lineHeight: 1.5,
  },
};

export default UsersTable;
