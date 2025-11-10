// src/components/admin/LogsSection.jsx
import React from "react";

const LogsSection = ({
  logs,
  logFilters,
  setLogFilters,
  onAtualizarLogs, // ✅ NOVA PROP
  loading,
}) => {
  // 🔍 Função para filtrar logs
  const getFilteredLogs = () => {
    return logs.filter((log) => {
      // Filtro por usuário
      if (logFilters.usuario) {
        const matchUsuario = 
          (log.userEmail || "").toLowerCase().includes(logFilters.usuario.toLowerCase()) ||
          (log.userName || "").toLowerCase().includes(logFilters.usuario.toLowerCase());
        if (!matchUsuario) return false;
      }

      // Filtro por ação
      if (logFilters.acao && log.action !== logFilters.acao) {
        return false;
      }

      // Filtro por data início
      if (logFilters.dataInicio) {
        const dataInicio = new Date(logFilters.dataInicio + 'T00:00:00');
        
        const logDate = log.timestamp?.seconds 
          ? new Date(log.timestamp.seconds * 1000)
          : new Date(log.timestamp);
        
        if (logDate < dataInicio) return false;
      }

      // Filtro por data fim
      if (logFilters.dataFim) {
        const dataFim = new Date(logFilters.dataFim + 'T23:59:59');
        
        const logDate = log.timestamp?.seconds 
          ? new Date(log.timestamp.seconds * 1000)
          : new Date(log.timestamp);
        
        if (logDate > dataFim) return false;
      }

      return true;
    });
  };

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
      ) : getFilteredLogs().length === 0 ? (
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
                <th style={styles.tableHeader}>👤 Usuário (Nome + Email)</th>
                <th style={styles.tableHeader}>⚡ Ação</th>
                <th style={styles.tableHeader}>📋 Recurso</th>
                <th style={styles.tableHeader}>📝 Dados ANTES</th>
                <th style={styles.tableHeader}>✏️ Dados DEPOIS</th>
                <th style={styles.tableHeader}>✅ Status</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredLogs().map((log, index) => (
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
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "6px" 
                    }}>
                      {/* Nome do usuário em destaque (se disponível) */}
                      {log.userName && (
                        <div style={{ 
                          fontWeight: "700",
                          color: "#2c3e50",
                          fontSize: "14px"
                        }}>
                          {log.userName}
                        </div>
                      )}
                      
                      {/* Email */}
                      <div style={{ 
                        fontWeight: log.userName ? "400" : "600",
                        color: "#495057",
                        fontSize: "12px"
                      }}>
                        📧 {log.userEmail || "Sistema"}
                      </div>
                      
                      {/* Badge do perfil */}
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "white",
                            backgroundColor:
                              log.userRole === "admin" ? "#dc3545" : "#28a745",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            display: "inline-block"
                          }}
                        >
                          {log.userRole === "admin" ? "👑 ADMIN" : "👤 OPERADOR"}
                        </span>
                      </div>
                    </div>
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
                  {/* DADOS ANTES */}
                  <td style={{...styles.tableCell, maxWidth: '200px'}}>
                    {log.dataBefore ? (
                      <details style={styles.detailsExpand}>
                        <summary style={styles.detailsSummary}>
                          Ver dados anteriores 🔍
                        </summary>
                        <pre style={styles.jsonPre}>
                          {JSON.stringify(log.dataBefore, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span style={{ color: "#999", fontSize: "11px" }}>
                        {log.action?.includes('CREATE') ? '(Criação - sem dados anteriores)' : 'N/A'}
                      </span>
                    )}
                  </td>

                  {/* DADOS DEPOIS */}
                  <td style={{...styles.tableCell, maxWidth: '200px'}}>
                    {log.dataAfter ? (
                      <details style={styles.detailsExpand}>
                        <summary style={styles.detailsSummary}>
                          Ver dados atualizados 🔍
                        </summary>
                        <pre style={styles.jsonPre}>
                          {JSON.stringify(log.dataAfter, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span style={{ color: "#999", fontSize: "11px" }}>
                        {log.action?.includes('DELETE') ? '(Exclusão - sem dados finais)' : 'N/A'}
                      </span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td style={{...styles.tableCell, textAlign: 'center'}}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        fontSize: '20px',
                        filter: log.success !== false ? 'none' : 'grayscale(100%)'
                      }}>
                        {log.success !== false ? '✅' : '❌'}
                      </span>
                      {log.errorMessage && (
                        <span style={{
                          fontSize: '10px',
                          color: '#dc3545',
                          backgroundColor: '#f8d7da',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          maxWidth: '120px',
                          wordBreak: 'break-word'
                        }}>
                          {log.errorMessage}
                        </span>
                      )}
                    </div>
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
  
  // Estilos para expansão de dados
  detailsExpand: {
    cursor: "pointer",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    padding: "4px 8px",
    border: "1px solid #dee2e6"
  },
  detailsSummary: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#007bff",
    userSelect: "none",
    listStyle: "none",
    padding: "4px 0"
  },
  jsonPre: {
    fontSize: "10px",
    backgroundColor: "#282c34",
    color: "#61dafb",
    padding: "8px",
    borderRadius: "4px",
    overflow: "auto",
    maxHeight: "200px",
    marginTop: "8px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word"
  }
};

export default LogsSection;
