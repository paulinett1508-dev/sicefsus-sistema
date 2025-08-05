// 🔧 MELHORAR AdminPanel.jsx - Integrar com AuditService
// ✅ Apenas ADICIONAR/MODIFICAR as seções de logs
// ✅ Preservar toda estrutura existente

// ADICIONAR IMPORT no topo do arquivo (após os imports existentes):
import { auditService } from "../services/auditService";

// MODIFICAR a função loadLogs() (linha ~84):
const loadLogs = async () => {
  try {
    // ✅ NOVO: Usar auditService ao invés de userService
    const logsData = await auditService.getLogs({ limit: 50 });
    console.log('📋 Logs de auditoria carregados:', logsData.length);
    setLogs(logsData);
  } catch (error) {
    console.error('❌ Erro ao carregar logs de auditoria:', error);
    showToast("Erro ao carregar logs de auditoria", "error");
  }
};

// SUBSTITUIR a seção "ABA DE LOGS" (linha ~220-290) por:
{activeTab === "logs" && (
  <div className="logs-section">
    <div className="section-header">
      <h2>📋 Logs de Auditoria do Sistema</h2>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>
          Últimos 50 registros • Atualização automática
        </span>
        <button 
          onClick={loadLogs}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Atualizar
        </button>
      </div>
    </div>

    {/* ✅ FILTROS MELHORADOS */}
    <div className="logs-filters">
      <div className="filter-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '10px',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '4px' }}>
            👤 Usuário
          </label>
          <input
            type="text"
            placeholder="Filtrar por email..."
            value={logFilters.usuario}
            onChange={(e) =>
              setLogFilters({ ...logFilters, usuario: e.target.value })
            }
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '4px' }}>
            ⚡ Ação
          </label>
          <select
            value={logFilters.acao}
            onChange={(e) =>
              setLogFilters({ ...logFilters, acao: e.target.value })
            }
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
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
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '4px' }}>
            📅 Data Início
          </label>
          <input
            type="date"
            value={logFilters.dataInicio}
            onChange={(e) =>
              setLogFilters({ ...logFilters, dataInicio: e.target.value })
            }
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '4px' }}>
            📅 Data Fim
          </label>
          <input
            type="date"
            value={logFilters.dataFim}
            onChange={(e) =>
              setLogFilters({ ...logFilters, dataFim: e.target.value })
            }
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>

    {/* ✅ ESTATÍSTICAS RÁPIDAS */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div style={{
        padding: '12px',
        backgroundColor: '#e3f2fd',
        borderRadius: '6px',
        textAlign: 'center',
        border: '1px solid #2196f3'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>
          {getFilteredLogs().length}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>Total de Logs</div>
      </div>

      <div style={{
        padding: '12px',
        backgroundColor: '#f3e5f5',
        borderRadius: '6px',
        textAlign: 'center',
        border: '1px solid #9c27b0'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7b1fa2' }}>
          {new Set(getFilteredLogs().map(log => log.userEmail)).size}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>Usuários Únicos</div>
      </div>

      <div style={{
        padding: '12px',
        backgroundColor: '#e8f5e8',
        borderRadius: '6px',
        textAlign: 'center',
        border: '1px solid #4caf50'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#388e3c' }}>
          {getFilteredLogs().filter(log => log.success !== false).length}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>Sucessos</div>
      </div>

      <div style={{
        padding: '12px',
        backgroundColor: '#ffebee',
        borderRadius: '6px',
        textAlign: 'center',
        border: '1px solid #f44336'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d32f2f' }}>
          {getFilteredLogs().filter(log => log.success === false).length}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>Erros</div>
      </div>
    </div>

    {/* ✅ TABELA DE LOGS MELHORADA */}
    <div className="logs-table">
      <div className="table-container" style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {getFilteredLogs().length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#666',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Nenhum log encontrado</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {logFilters.usuario || logFilters.acao || logFilters.dataInicio || logFilters.dataFim
                ? 'Tente ajustar os filtros para ver mais resultados'
                : 'Ainda não há logs de auditoria registrados no sistema'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
              <tr>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  color: '#495057',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📅 Data/Hora
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  color: '#495057',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  👤 Usuário
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  color: '#495057',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ⚡ Ação
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  color: '#495057',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📋 Recurso
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  color: '#495057',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  🏢 Local
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  color: '#495057',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ✅ Status
                </th>
              </tr>
            </thead>
            <tbody>
              {getFilteredLogs().map((log, index) => {
                const isSuccess = log.success !== false;
                const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';

                return (
                  <tr 
                    key={log.id || index} 
                    style={{ 
                      borderBottom: '1px solid #e9ecef',
                      backgroundColor: bgColor,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.parentElement.style.backgroundColor = '#e3f2fd'}
                    onMouseOut={(e) => e.target.parentElement.style.backgroundColor = bgColor}
                  >
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      <div style={{ fontWeight: '500' }}>
                        {log.timestamp instanceof Date 
                          ? log.timestamp.toLocaleDateString('pt-BR')
                          : new Date(log.timestamp?.seconds * 1000 || log.timestamp).toLocaleDateString('pt-BR')
                        }
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        {log.timestamp instanceof Date 
                          ? log.timestamp.toLocaleTimeString('pt-BR')
                          : new Date(log.timestamp?.seconds * 1000 || log.timestamp).toLocaleTimeString('pt-BR')
                        }
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                        {log.userEmail || 'N/A'}
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: 'white',
                        backgroundColor: log.userRole === 'admin' ? '#dc3545' : '#28a745',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>
                        {log.userRole || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: getActionColor(log.action),
                        color: 'white',
                        letterSpacing: '0.3px'
                      }}>
                        {getActionIcon(log.action)} {(log.action || 'UNKNOWN').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      <div style={{ fontWeight: '500' }}>
                        {log.resourceType || 'N/A'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        ID: {(log.resourceId || 'N/A').substring(0, 8)}...
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {log.userMunicipio && log.userUf ? (
                        <div>
                          <div style={{ fontWeight: '500' }}>{log.userMunicipio}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>{log.userUf}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '16px',
                        filter: isSuccess ? 'none' : 'grayscale(100%)'
                      }}>
                        {isSuccess ? '✅' : '❌'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}

// ADICIONAR estas funções auxiliares no final do componente (antes do export):

// ✅ FUNÇÃO PARA COR DA AÇÃO
const getActionColor = (action) => {
  switch (action) {
    case 'DELETE_EMENDA':
    case 'DELETE_DESPESA':
    case 'DELETE_USER':
      return '#dc3545'; // Vermelho para exclusões
    case 'CREATE_EMENDA':
    case 'CREATE_DESPESA':
    case 'CREATE_USER':
      return '#28a745'; // Verde para criações
    case 'UPDATE_EMENDA':
    case 'UPDATE_DESPESA':
    case 'UPDATE_USER':
      return '#ffc107'; // Amarelo para edições
    default:
      return '#6c757d'; // Cinza para outras ações
  }
};

// ✅ FUNÇÃO PARA ÍCONE DA AÇÃO
const getActionIcon = (action) => {
  switch (action) {
    case 'DELETE_EMENDA':
    case 'DELETE_DESPESA':
    case 'DELETE_USER':
      return '🗑️';
    case 'CREATE_EMENDA':
    case 'CREATE_DESPESA':
    case 'CREATE_USER':
      return '➕';
    case 'UPDATE_EMENDA':
    case 'UPDATE_DESPESA':
    case 'UPDATE_USER':
      return '✏️';
    default:
      return '⚡';
  }
};