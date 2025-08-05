// 🔧 CORREÇÃO: Administracao.jsx - Adicionar aba de Logs de Auditoria
// ✅ Preservar toda estrutura existente
// ✅ Adicionar apenas a funcionalidade de logs

// 1️⃣ ADICIONAR IMPORT no topo (após os imports existentes):
import { auditService } from "../services/auditService";

// 2️⃣ ADICIONAR ESTADOS para logs (após os estados existentes, linha ~12):
const [activeTab, setActiveTab] = useState("users"); // Novo estado para tabs
const [logs, setLogs] = useState([]); // Novo estado para logs
const [logFilters, setLogFilters] = useState({ // Novo estado para filtros
  usuario: "",
  acao: "",
  dataInicio: "",
  dataFim: "",
});

// 3️⃣ ADICIONAR FUNÇÃO para carregar logs (após carregarUsuarios, linha ~35):
const carregarLogs = async () => {
  try {
    console.log('📋 Carregando logs de auditoria...');
    const logsData = await auditService.getLogs({ limit: 50 });
    setLogs(logsData);
    console.log(`✅ ${logsData.length} logs carregados`);
  } catch (error) {
    console.error('❌ Erro ao carregar logs:', error);
    showToast("Erro ao carregar logs de auditoria", "error");
  }
};

// 4️⃣ MODIFICAR useEffect para carregar logs também (linha ~40):
useEffect(() => {
  const loadData = async () => {
    await carregarUsuarios();
    await carregarLogs(); // ✅ ADICIONAR esta linha
  };
  loadData();
}, []);

// 5️⃣ ADICIONAR FUNÇÃO para filtrar logs (antes do return, linha ~200):
const getFilteredLogs = () => {
  return logs.filter((log) => {
    let matches = true;

    if (logFilters.usuario) {
      matches = matches &&
        (log.userEmail || "")
          .toLowerCase()
          .includes(logFilters.usuario.toLowerCase());
    }

    if (logFilters.acao) {
      matches = matches &&
        (log.action || "")
          .toLowerCase()
          .includes(logFilters.acao.toLowerCase());
    }

    if (logFilters.dataInicio) {
      const inicio = new Date(logFilters.dataInicio);
      const logDate = log.timestamp instanceof Date 
        ? log.timestamp 
        : new Date(log.timestamp?.seconds * 1000 || log.timestamp);
      matches = matches && logDate >= inicio;
    }

    if (logFilters.dataFim) {
      const fim = new Date(logFilters.dataFim);
      fim.setHours(23, 59, 59, 999);
      const logDate = log.timestamp instanceof Date 
        ? log.timestamp 
        : new Date(log.timestamp?.seconds * 1000 || log.timestamp);
      matches = matches && logDate <= fim;
    }

    return matches;
  });
};

// 6️⃣ FUNÇÕES auxiliares para logs (antes do return):
const getActionColor = (action) => {
  switch (action) {
    case 'DELETE_EMENDA':
    case 'DELETE_DESPESA':
    case 'DELETE_USER':
      return '#dc3545';
    case 'CREATE_EMENDA':
    case 'CREATE_DESPESA':
    case 'CREATE_USER':
      return '#28a745';
    case 'UPDATE_EMENDA':
    case 'UPDATE_DESPESA':
    case 'UPDATE_USER':
      return '#ffc107';
    default:
      return '#6c757d';
  }
};

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

// 7️⃣ SUBSTITUIR o CABEÇALHO (linha ~210) para incluir tabs:
<div style={styles.header}>
  <div style={styles.headerLeft}>
    <h1 style={styles.title}>
      {activeTab === "users" ? "👥 Administração de Usuários" : "📋 Logs de Auditoria"}
    </h1>
    <p style={styles.subtitle}>
      {activeTab === "users" 
        ? "Gerencie usuários, permissões e acessos do sistema SICEFSUS"
        : "Monitore todas as ações realizadas no sistema"}
    </p>
  </div>

  <div style={styles.headerActions}>
    {activeTab === "users" && (
      <button
        onClick={handleNovoUsuario}
        style={styles.primaryButton}
        disabled={loading || saving}
      >
        <span style={styles.buttonIcon}>👤</span>
        Novo Usuário
      </button>
    )}
    {activeTab === "logs" && (
      <button
        onClick={carregarLogs}
        style={{...styles.primaryButton, backgroundColor: '#28a745'}}
        disabled={loading}
      >
        <span style={styles.buttonIcon}>🔄</span>
        Atualizar Logs
      </button>
    )}
  </div>
</div>

{/* ✅ NOVA SEÇÃO: Navegação por tabs */}
<div style={styles.tabsContainer}>
  <button
    onClick={() => setActiveTab("users")}
    style={{
      ...styles.tabButton,
      ...(activeTab === "users" ? styles.tabButtonActive : {})
    }}
  >
    👥 Usuários ({usuarios.length})
  </button>
  <button
    onClick={() => setActiveTab("logs")}
    style={{
      ...styles.tabButton,
      ...(activeTab === "logs" ? styles.tabButtonActive : {})
    }}
  >
    📋 Logs de Auditoria ({logs.length})
  </button>
</div>

// 8️⃣ MODIFICAR a seção de estatísticas para ser condicional (linha ~240):
{activeTab === "users" && (
  <div style={styles.statsContainer}>
    {/* ... manter todo código de estatísticas existente ... */}
  </div>
)}

// 9️⃣ MODIFICAR a seção da tabela para ser condicional (linha ~290):
{activeTab === "users" ? (
  <div style={styles.tableContainer}>
    <h3 style={styles.sectionTitle}>
      📋 Lista de Usuários ({usuarios.length})
    </h3>

    {loading ? (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Carregando usuários...</p>
      </div>
    ) : (
      <UsersTable
        users={usuarios}
        onEdit={handleEditarUsuario}
        onDelete={handleExcluirUsuario}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetSenha}
        loading={saving}
      />
    )}
  </div>
) : (
  // ✅ NOVA SEÇÃO: Aba de Logs
  <div style={styles.tableContainer}>
    <h3 style={styles.sectionTitle}>
      📋 Logs de Auditoria do Sistema ({getFilteredLogs().length})
    </h3>

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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3>Nenhum log encontrado</h3>
        <p>
          {logFilters.usuario || logFilters.acao || logFilters.dataInicio || logFilters.dataFim
            ? 'Tente ajustar os filtros para ver mais resultados'
            : 'Ainda não há logs de auditoria registrados no sistema'}
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
            {getFilteredLogs().map((log, index) => (
              <tr key={log.id || index} style={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                borderBottom: '1px solid #e9ecef'
              }}>
                <td style={styles.tableCell}>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>
                    {new Date(log.timestamp?.seconds * 1000 || log.timestamp).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                    {new Date(log.timestamp?.seconds * 1000 || log.timestamp).toLocaleTimeString('pt-BR')}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ fontWeight: '500' }}>{log.userEmail || 'N/A'}</div>
                  <span style={{
                    fontSize: '10px',
                    color: 'white',
                    backgroundColor: log.userRole === 'admin' ? '#dc3545' : '#28a745',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {log.userRole || 'N/A'}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: getActionColor(log.action),
                    color: 'white'
                  }}>
                    {getActionIcon(log.action)} {(log.action || 'UNKNOWN').replace('_', ' ')}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ fontWeight: '500' }}>{log.resourceType || 'N/A'}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    ID: {(log.resourceId || 'N/A').substring(0, 8)}...
                  </div>
                </td>
                <td style={styles.tableCell}>
                  {log.userMunicipio && log.userUf ? (
                    <div>
                      <div style={{ fontWeight: '500' }}>{log.userMunicipio}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{log.userUf}</div>
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)};

const styles = {
  // ... outros estilos existentes ...
  
  tabsContainer: {
    display: 'flex',
    marginBottom: '24px',
    borderBottom: '2px solid #e9ecef',
    backgroundColor: 'white',
    borderRadius: '8px 8px 0 0',
    padding: '0 24px',
  },

  tabButton: {
    padding: '16px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6c757d',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s ease',
  },

  tabButtonActive: {
    color: '#007bff',
    borderBottomColor: '#007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },

  filtersContainer: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },

  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },

  filterLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#495057',
    display: 'block',
    marginBottom: '4px',
  },

  filterInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
  },

  emptyLogs: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
  },

  logsTableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  logsTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  tableHeader: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '12px',
    color: '#495057',
    textTransform: 'uppercase',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
  },

  tableCell: {
    padding: '12px',
    fontSize: '13px',
    verticalAlign: 'top',
  },