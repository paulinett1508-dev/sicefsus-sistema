// src/components/UsersTable.jsx - TABELA MELHORADA COM OPÇÃO DESATIVAR
import React from "react";

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  onToggleStatus, // ✅ NOVA PROP PARA ATIVAR/DESATIVAR
  onResetPassword,
  loading,
}) {
  // ✅ FORMATAR ÚLTIMO ACESSO
  const formatLastAccess = (lastAccess) => {
    if (!lastAccess) return "Nunca";

    try {
      let date;
      if (lastAccess.toDate) {
        // Firestore Timestamp
        date = lastAccess.toDate();
      } else if (typeof lastAccess === "string") {
        date = new Date(lastAccess);
      } else {
        date = lastAccess;
      }

      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  // ✅ FORMATAR LOCALIZAÇÃO (COM "-" PARA ADMINS)
  const formatLocation = (user) => {
    if (user.tipo === "admin") {
      return <span style={styles.adminLocation}>-</span>;
    }

    if (!user.municipio && !user.uf) {
      return <span style={styles.notConfigured}>⚠️ Não configurado</span>;
    }

    return (
      <span style={styles.location}>
        {user.municipio || "?"}/{user.uf || "?"}
      </span>
    );
  };

  // ✅ FORMATAR STATUS
  const formatStatus = (status) => {
    const statusMap = {
      ativo: { label: "Ativo", style: styles.statusActive },
      inativo: { label: "Inativo", style: styles.statusInactive },
      bloqueado: { label: "Bloqueado", style: styles.statusBlocked },
    };

    const statusInfo = statusMap[status] || statusMap.ativo;

    return <span style={statusInfo.style}>{statusInfo.label}</span>;
  };

  // ✅ FORMATAR PERFIL
  const formatRole = (tipo) => {
    if (tipo === "admin") {
      return <span style={styles.roleAdmin}>👑 Admin</span>;
    }
    return <span style={styles.roleUser}>👤 Operador</span>;
  };

  if (users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <h3>📭 Nenhum usuário encontrado</h3>
        <p>Clique em "Novo Usuário" para criar o primeiro usuário.</p>
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.headerCell}>NOME</th>
            <th style={styles.headerCell}>EMAIL</th>
            <th style={styles.headerCell}>PERFIL</th>
            <th style={styles.headerCell}>STATUS</th>
            <th style={styles.headerCell}>DEPARTAMENTO</th>
            <th style={styles.headerCell}>MUNICÍPIO/UF</th>
            <th style={styles.headerCell}>ÚLTIMO ACESSO</th>
            <th style={styles.headerCell}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={styles.bodyRow}>
              {/* NOME */}
              <td style={styles.bodyCell}>
                <div style={styles.userName}>
                  {user.nome || "Nome não informado"}
                </div>
              </td>

              {/* EMAIL */}
              <td style={styles.bodyCell}>
                <div style={styles.userEmail}>{user.email}</div>
              </td>

              {/* PERFIL */}
              <td style={styles.bodyCell}>{formatRole(user.tipo)}</td>

              {/* STATUS */}
              <td style={styles.bodyCell}>{formatStatus(user.status)}</td>

              {/* DEPARTAMENTO */}
              <td style={styles.bodyCell}>
                <div style={styles.department}>{user.departamento || "-"}</div>
              </td>

              {/* MUNICÍPIO/UF */}
              <td style={styles.bodyCell}>{formatLocation(user)}</td>

              {/* ÚLTIMO ACESSO */}
              <td style={styles.bodyCell}>
                <div style={styles.lastAccess}>
                  {formatLastAccess(user.ultimoAcesso)}
                </div>
              </td>

              {/* AÇÕES */}
              <td style={styles.bodyCell}>
                <div style={styles.actionsContainer}>
                  {/* ✅ BOTÃO EDITAR */}
                  <button
                    onClick={() => onEdit(user)}
                    style={styles.actionButton}
                    title="Editar usuário"
                    disabled={loading}
                  >
                    ✏️
                  </button>

                  {/* ✅ BOTÃO ATIVAR/DESATIVAR */}
                  <button
                    onClick={() => onToggleStatus(user)}
                    style={{
                      ...styles.actionButton,
                      ...(user.status === "ativo"
                        ? styles.deactivateButton
                        : styles.activateButton),
                    }}
                    title={
                      user.status === "ativo"
                        ? "Desativar usuário"
                        : "Ativar usuário"
                    }
                    disabled={loading}
                  >
                    {user.status === "ativo" ? "⏸️" : "▶️"}
                  </button>

                  {/* ✅ BOTÃO RESET SENHA */}
                  <button
                    onClick={() => onResetPassword(user)}
                    style={styles.actionButton}
                    title="Redefinir senha"
                    disabled={loading}
                  >
                    🔑
                  </button>

                  {/* ✅ BOTÃO EXCLUIR (APENAS SE INATIVO) */}
                  <button
                    onClick={() => onDelete(user)}
                    style={{
                      ...styles.actionButton,
                      ...styles.deleteButton,
                      opacity: user.status === "ativo" ? 0.3 : 1,
                      cursor:
                        user.status === "ativo" ? "not-allowed" : "pointer",
                    }}
                    title={
                      user.status === "ativo"
                        ? "Desative primeiro para excluir"
                        : "Excluir permanentemente"
                    }
                    disabled={loading || user.status === "ativo"}
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
}

// ✅ ESTILOS DA TABELA
const styles = {
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  headerRow: {
    backgroundColor: "#34495e",
    color: "white",
  },

  headerCell: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "12px",
    letterSpacing: "0.5px",
    borderRight: "1px solid rgba(255,255,255,0.1)",
  },

  bodyRow: {
    borderBottom: "1px solid #e9ecef",
    transition: "background-color 0.2s ease",
  },

  bodyCell: {
    padding: "12px 16px",
    verticalAlign: "middle",
    borderRight: "1px solid #f8f9fa",
  },

  userName: {
    fontWeight: "500",
    color: "#2c3e50",
  },

  userEmail: {
    color: "#6c757d",
    fontSize: "13px",
  },

  roleAdmin: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#ffeaa7",
    color: "#e17055",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },

  roleUser: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#a8e6cf",
    color: "#00b894",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },

  statusActive: {
    display: "inline-block",
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },

  statusInactive: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#f8f9fa",
    color: "#495057",
    border: "1px solid #dee2e6",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500"
  },

  statusBlocked: {
    display: "inline-block",
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },

  department: {
    color: "#6c757d",
    fontSize: "13px",
  },

  // ✅ ESTILO ESPECIAL PARA ADMIN (SEM LOCALIZAÇÃO)
  adminLocation: {
    color: "#6c757d",
    fontSize: "16px",
    fontWeight: "500",
  },

  location: {
    color: "#495057",
    fontSize: "13px",
    backgroundColor: "#e3f2fd",
    padding: "2px 6px",
    borderRadius: "4px",
  },

  notConfigured: {
    color: "#dc3545",
    fontSize: "12px",
    fontWeight: "500",
  },

  lastAccess: {
    color: "#6c757d",
    fontSize: "12px",
  },

  actionsContainer: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },

  actionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    backgroundColor: "#f8f9fa",
    color: "#495057",
    border: "1px solid #dee2e6",
  },

  // ✅ BOTÃO DESATIVAR (LARANJA)
  deactivateButton: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    borderColor: "#ffeaa7",
  },

  // ✅ BOTÃO ATIVAR (VERDE)
  activateButton: {
    backgroundColor: "#d4edda",
    color: "#155724",
    borderColor: "#c3e6cb",
  },

  // ✅ BOTÃO EXCLUIR (VERMELHO)
  deleteButton: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderColor: "#f1aeb5",
  },

  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
  },
};

// ✅ CSS HOVER EFFECTS
if (!document.getElementById("usertable-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "usertable-styles";
  styleSheet.innerHTML = `
    .users-table tbody tr:hover {
      background-color: #f8f9fa !important;
    }

    .action-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }
  `;
  document.head.appendChild(styleSheet);
}