// src/components/admin/LogsSection.jsx
import React from "react";

const LogsSection = ({
  logs,
  logFilters,
  setLogFilters,
  onAtualizarLogs, // ✅ NOVA PROP
  loading,
}) => {
  // Funções auxiliares para logs
  const getActionColor = (action) => {
    switch (action) {
      case "DELETE_EMENDA":
      case "DELETE_DESPESA":
      case "DELETE_USER":
        return "#dc3545";
      case "CREATE_EMENDA":
      case "CREATE_DESPESA":
      case "CREATE_USER":
        return "#28a745";
      case "UPDATE_EMENDA":
      case "UPDATE_DESPESA":
      case "UPDATE_USER":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "DELETE_EMENDA":
      case "DELETE_DESPESA":
      case "DELETE_USER":
        return "🗑️";
      case "CREATE_EMENDA":
      case "CREATE_DESPESA":
      case "CREATE_USER":
        return "➕";
      case "UPDATE_EMENDA":
      case "UPDATE_DESPESA":
      case "UPDATE_USER":
        return "✏️";
      default:
        return "⚡";
    }
  };

  return (
    <div style={styles.tableContainer}>
      {/* Cabeçalho da seção com botão */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          📋 Logs de Auditoria do Sistema ({logs.length})
        </h3>
        <button
          onClick={onAtualizarLogs}
          style={styles.refreshButton}
          disabled={loading}
          title="Atualizar logs de auditoria"
        >
          🔄 Atualizar Logs
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div>
            <label style={styles.filterLabel}>👤 Usuário</label>
            <input
              type="text"
              placeholder="Filtrar por email..."
              value={logFilters.usuario}
              onChange={(e) =>
                setLogFilters({ ...logFilters, usuario: e.target.value })
              }
              style={styles.filterInput}
            />
          </div>

          <div>
            <label style={styles.filterLabel}>⚡ Ação</label>
            <select
              value={logFilters.acao}
              onChange={(e) =>
                setLogFilters({ ...logFilters, acao: e.target.value })
              }
              style={styles.filterInput}
            >
              <option value="">Todas as ações</option>
              <option value="CREATE_EMENDA">Criar Emenda</option>
              <option value="UPDATE_EMENDA">Editar Emenda</option>
              <option value="DELETE_EMENDA">Deletar Emenda</option>
              <option value="CREATE_DESPESA">Criar Despesa</option>
              <option value="UPDATE_DESPESA">Editar Despesa</option>
              <option value="DELETE_DESPESA">Deletar Despesa</option>
              <option value="CREATE_USER">Criar Usuário</option>
              <option value="UPDATE_USER">Editar Usuário</option>
              <option value="DELETE_USER">Deletar Usuário</option>
              <option value="ACTIVATE_USER">Ativar Usuário</option>
              <option value="DEACTIVATE_USER">Inativar Usuário</option>
              <option value="RESET_PASSWORD">Resetar Senha</option>
            </select>
          </div>

          <div>
            <label style={styles.filterLabel}>📅 Data Início</label>
            <input
              type="date"
              value={logFilters.dataInicio}
              onChange={(e) =>
                setLogFilters({ ...logFilters, dataInicio: e.target.value })
              }
              style={styles.filterInput}
            />
          </div>

          <div>
            <label style={styles.filterLabel}>📅 Data Fim</label>
            <input
              type="date"
              value={logFilters.dataFim}
              onChange={(e) =>
                setLogFilters({ ...logFilters, dataFim: e.target.value })
              }
              style={styles.filterInput}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Carregando logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div style={styles.emptyLogs}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <h3>Nenhum log encontrado</h3>
          <p>
            {logFilters.usuario ||
            logFilters.acao ||
            logFilters.dataInicio ||
            logFilters.dataFim
              ? "Tente ajustar os filtros para ver mais resultados"
              : "Ainda não há logs de auditoria registrados no sistema"}
          </p>
        </div>
      ) : (
        <div style={styles.logsTableContainer}>
          <table style={styles.logsTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>📅 Data/Hora</th>
                <th style={styles.tableHeader}>👤 Usuário</th>
                <th style={styles.tableHeader}>⚡ Ação</th>
                <th style={styles.tableHeader}>📋 Recurso</th>
                <th style={styles.tableHeader}>🏢 Local</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr
                  key={log.id || index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <td style={styles.tableCell}>
                    <div style={{ fontWeight: "500", fontSize: "13px" }}>
                      {new Date(
                        log.timestamp?.seconds * 1000 || log.timestamp,
                      ).toLocaleDateString("pt-BR")}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        marginTop: "2px",
                      }}
                    >
                      {new Date(
                        log.timestamp?.seconds * 1000 || log.timestamp,
                      ).toLocaleTimeString("pt-BR")}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={{ fontWeight: "500" }}>
                      {log.userEmail || "N/A"}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "white",
                        backgroundColor:
                          log.userRole === "admin" ? "#dc3545" : "#28a745",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                      }}
                    >
                      {log.userRole || "N/A"}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor: getActionColor(log.action),
                        color: "white",
                      }}
                    >
                      {getActionIcon(log.action)}{" "}
                      {(log.action || "UNKNOWN").replace("_", " ")}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={{ fontWeight: "500" }}>
                      {log.resourceType || "N/A"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      ID: {(log.resourceId || "N/A").substring(0, 8)}...
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    {log.userMunicipio && log.userUf ? (
                      <div>
                        <div style={{ fontWeight: "500" }}>
                          {log.userMunicipio}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          {log.userUf}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#999", fontStyle: "italic" }}>
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

  refreshButton: {
    backgroundColor: "#6c757d",
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

  filtersContainer: {
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#495057",
    display: "block",
    marginBottom: "4px",
  },
  filterInput: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
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
  emptyLogs: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
  },
  logsTableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logsTable: {
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
};

export default LogsSection;
