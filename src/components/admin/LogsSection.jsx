// src/components/admin/LogsSection.jsx
import React from "react";

const LogsSection = ({
  logs,
  logFilters,
  setLogFilters,
  onAtualizarLogs, // ✅ NOVA PROP
  loading,
}) => {
  // 🔍 Função para filtrar logs - VERSÃO CORRIGIDA E ROBUSTA
  const getFilteredLogs = () => {
    if (!Array.isArray(logs)) {
      console.warn('⚠️ logs não é um array válido');
      return [];
    }

    return logs.filter((log) => {
      // Validação básica do log
      if (!log || typeof log !== 'object') return false;

      // ✅ Filtro por usuário (email ou nome)
      if (logFilters.usuario && logFilters.usuario.trim() !== '') {
        const searchTerm = logFilters.usuario.toLowerCase().trim();
        const userEmail = (log.userEmail || '').toLowerCase();
        const userName = (log.userName || '').toLowerCase();
        
        const matchUsuario = userEmail.includes(searchTerm) || userName.includes(searchTerm);
        if (!matchUsuario) return false;
      }

      // ✅ Filtro por ação
      if (logFilters.acao && logFilters.acao !== '') {
        const logAction = (log.action || '').toUpperCase();
        const filterAction = logFilters.acao.toUpperCase();
        
        if (logAction !== filterAction) return false;
      }

      // ✅ Filtro por data início - CORRIGIDO
      if (logFilters.dataInicio && logFilters.dataInicio.trim() !== '') {
        try {
          // Criar data de início às 00:00:00 do dia selecionado
          const [ano, mes, dia] = logFilters.dataInicio.split('-');
          const dataInicio = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 0, 0, 0, 0);
          
          // Converter timestamp do log para Date
          let logDate;
          if (log.timestamp?.seconds) {
            // Firestore Timestamp
            logDate = new Date(log.timestamp.seconds * 1000);
          } else if (log.timestamp?.toDate) {
            // Firestore Timestamp com método toDate
            logDate = log.timestamp.toDate();
          } else if (log.timestamp instanceof Date) {
            // Já é um objeto Date
            logDate = log.timestamp;
          } else if (typeof log.timestamp === 'string') {
            // String de data
            logDate = new Date(log.timestamp);
          } else {
            // Timestamp inválido
            console.warn('⚠️ Timestamp inválido no log:', log);
            return false;
          }
          
          // Comparar apenas as datas (ignorar horário)
          if (logDate < dataInicio) return false;
        } catch (error) {
          console.error('❌ Erro ao processar data início:', error);
          return false;
        }
      }

      // ✅ Filtro por data fim - CORRIGIDO
      if (logFilters.dataFim && logFilters.dataFim.trim() !== '') {
        try {
          // Criar data de fim às 23:59:59 do dia selecionado
          const [ano, mes, dia] = logFilters.dataFim.split('-');
          const dataFim = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 23, 59, 59, 999);
          
          // Converter timestamp do log para Date
          let logDate;
          if (log.timestamp?.seconds) {
            // Firestore Timestamp
            logDate = new Date(log.timestamp.seconds * 1000);
          } else if (log.timestamp?.toDate) {
            // Firestore Timestamp com método toDate
            logDate = log.timestamp.toDate();
          } else if (log.timestamp instanceof Date) {
            // Já é um objeto Date
            logDate = log.timestamp;
          } else if (typeof log.timestamp === 'string') {
            // String de data
            logDate = new Date(log.timestamp);
          } else {
            // Timestamp inválido
            console.warn('⚠️ Timestamp inválido no log:', log);
            return false;
          }
          
          // Comparar apenas as datas (ignorar horário)
          if (logDate > dataFim) return false;
        } catch (error) {
          console.error('❌ Erro ao processar data fim:', error);
          return false;
        }
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
        return "var(--error)";
      case "CREATE_EMENDA":
      case "CREATE_DESPESA":
      case "CREATE_USER":
        return "var(--success)";
      case "UPDATE_EMENDA":
      case "UPDATE_DESPESA":
      case "UPDATE_USER":
        return "var(--warning)";
      default:
        return "var(--secondary)";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "DELETE_EMENDA":
      case "DELETE_DESPESA":
      case "DELETE_USER":
        return <span className="material-symbols-outlined" style={{ fontSize: 12 }}>delete</span>;
      case "CREATE_EMENDA":
      case "CREATE_DESPESA":
      case "CREATE_USER":
        return <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>;
      case "UPDATE_EMENDA":
      case "UPDATE_DESPESA":
      case "UPDATE_USER":
        return <span className="material-symbols-outlined" style={{ fontSize: 12 }}>edit</span>;
      default:
        return <span className="material-symbols-outlined" style={{ fontSize: 12 }}>bolt</span>;
    }
  };

  return (
    <div style={styles.tableContainer}>
      {/* Cabeçalho da seção com botão */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>assignment</span> Logs de Auditoria do Sistema ({logs.length})
        </h3>
        <button
          onClick={onAtualizarLogs}
          style={styles.refreshButton}
          disabled={loading}
          title="Atualizar logs de auditoria"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>refresh</span> Atualizar Logs
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div>
            <label style={styles.filterLabel}><span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>person</span> Usuário</label>
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
            <label style={styles.filterLabel}><span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>bolt</span> Ação</label>
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
            <label style={styles.filterLabel}><span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>calendar_today</span> Data Início</label>
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
            <label style={styles.filterLabel}><span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>calendar_today</span> Data Fim</label>
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}><span className="material-symbols-outlined" style={{ fontSize: 48 }}>assignment</span></div>
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
                <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>calendar_today</span> Data/Hora</th>
                <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>person</span> Usuário (Nome + Email)</th>
                <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>bolt</span> Ação</th>
                <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>assignment</span> Recurso</th>
                <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>edit_note</span> Dados ANTES</th>
                <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>edit</span> Dados DEPOIS</th>
                <th style={styles.tableHeader}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>check_circle</span> Status</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredLogs().map((log, index) => (
                <tr
                  key={log.id || index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "var(--theme-surface)" : "var(--theme-surface-secondary)",
                    borderBottom: "1px solid var(--theme-border)",
                  }}
                >
                  <td style={styles.tableCell}>
                    <div style={{ fontWeight: "500", fontSize: "13px" }}>
                      {(() => {
                        let logDate;
                        if (log.timestamp?.seconds) {
                          logDate = new Date(log.timestamp.seconds * 1000);
                        } else if (log.timestamp?.toDate) {
                          logDate = log.timestamp.toDate();
                        } else if (log.timestamp instanceof Date) {
                          logDate = log.timestamp;
                        } else if (typeof log.timestamp === 'string') {
                          logDate = new Date(log.timestamp);
                        } else {
                          return "-";
                        }
                        
                        // Formatar data no padrão brasileiro
                        return logDate.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "America/Sao_Paulo"
                        });
                      })()}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--theme-text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      {(() => {
                        let logDate;
                        if (log.timestamp?.seconds) {
                          logDate = new Date(log.timestamp.seconds * 1000);
                        } else if (log.timestamp?.toDate) {
                          logDate = log.timestamp.toDate();
                        } else if (log.timestamp instanceof Date) {
                          logDate = log.timestamp;
                        } else if (typeof log.timestamp === 'string') {
                          logDate = new Date(log.timestamp);
                        } else {
                          return "-";
                        }
                        
                        // Formatar hora no padrão brasileiro (24h)
                        return logDate.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZone: "America/Sao_Paulo"
                        });
                      })()}
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
                          color: "var(--theme-text)",
                          fontSize: "14px"
                        }}>
                          {log.userName}
                        </div>
                      )}

                      {/* Email */}
                      <div style={{
                        fontWeight: log.userName ? "400" : "600",
                        color: "var(--theme-text-secondary)",
                        fontSize: "12px"
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 2, verticalAlign: "middle" }}>mail</span> {log.userEmail || "Sistema"}
                      </div>
                      
                      {/* Badge do perfil */}
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--white)",
                            backgroundColor:
                              log.userRole === "admin" ? "var(--error)" : "var(--success)",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            display: "inline-block"
                          }}
                        >
                          {log.userRole === "admin" ? <><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>workspace_premium</span> ADMIN</> : <><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>person</span> OPERADOR</>}
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
                        color: "var(--white)",
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
                    <div style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>
                      ID: {(log.resourceId || "N/A").substring(0, 8)}...
                    </div>
                  </td>
                  {/* DADOS ANTES */}
                  <td style={{...styles.tableCell, maxWidth: '200px'}}>
                    {log.dataBefore ? (
                      <details style={styles.detailsExpand}>
                        <summary style={styles.detailsSummary}>
                          Ver dados anteriores <span className="material-symbols-outlined" style={{ fontSize: 12, marginLeft: 4, verticalAlign: "middle" }}>search</span>
                        </summary>
                        <pre style={styles.jsonPre}>
                          {JSON.stringify(log.dataBefore, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span style={{ color: "var(--theme-text-muted)", fontSize: "11px" }}>
                        {log.action?.includes('CREATE') ? '(Criação - sem dados anteriores)' : 'N/A'}
                      </span>
                    )}
                  </td>

                  {/* DADOS DEPOIS */}
                  <td style={{...styles.tableCell, maxWidth: '200px'}}>
                    {log.dataAfter ? (
                      <details style={styles.detailsExpand}>
                        <summary style={styles.detailsSummary}>
                          Ver dados atualizados <span className="material-symbols-outlined" style={{ fontSize: 12, marginLeft: 4, verticalAlign: "middle" }}>search</span>
                        </summary>
                        <pre style={styles.jsonPre}>
                          {JSON.stringify(log.dataAfter, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span style={{ color: "var(--theme-text-muted)", fontSize: "11px" }}>
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
                        {log.success !== false ? <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--success)" }}>check_circle</span> : <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--error)" }}>cancel</span>}
                      </span>
                      {log.errorMessage && (
                        <span style={{
                          fontSize: '10px',
                          color: 'var(--danger-600)',
                          backgroundColor: 'var(--danger-50)',
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
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px var(--theme-shadow)",
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
    color: "var(--theme-text)",
  },

  refreshButton: {
    backgroundColor: "var(--secondary)",
    color: "var(--white)",
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
    backgroundColor: "var(--theme-surface-secondary)",
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
    color: "var(--theme-text-secondary)",
    display: "block",
    marginBottom: "4px",
  },
  filterInput: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--theme-border)",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid var(--theme-border)",
    borderTop: "3px solid var(--primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  emptyLogs: {
    textAlign: "center",
    padding: "40px",
    color: "var(--theme-text-secondary)",
  },
  logsTableContainer: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 4px var(--theme-shadow)",
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
    color: "var(--theme-text-secondary)",
    textTransform: "uppercase",
    backgroundColor: "var(--theme-surface-secondary)",
    borderBottom: "2px solid var(--theme-border)",
  },
  tableCell: {
    padding: "12px",
    fontSize: "13px",
    verticalAlign: "top",
  },
  
  // Estilos para expansão de dados
  detailsExpand: {
    cursor: "pointer",
    backgroundColor: "var(--theme-surface-secondary)",
    borderRadius: "4px",
    padding: "4px 8px",
    border: "1px solid var(--theme-border)"
  },
  detailsSummary: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--primary-600)",
    userSelect: "none",
    listStyle: "none",
    padding: "4px 0"
  },
  jsonPre: {
    fontSize: "10px",
    backgroundColor: "var(--theme-surface-secondary)",
    color: "var(--primary-500)",
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
