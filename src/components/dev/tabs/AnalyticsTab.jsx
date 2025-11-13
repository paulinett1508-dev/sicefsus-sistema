
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('7d'); // 24h, 7d, 30d
  const [analytics, setAnalytics] = useState({
    requests: {
      total: 0,
      timeline: [],
      byHour: {},
    },
    topURLs: [],
    topUsers: [],
    httpStatuses: {
      success: 0, // 2xx
      redirect: 0, // 3xx
      clientError: 0, // 4xx
      serverError: 0, // 5xx
    },
    requestDurations: {
      avg: 0,
      min: 0,
      max: 0,
      p50: 0,
      p95: 0,
    },
    topActions: [],
    topBrowsers: [],
    topCountries: [],
    userActivity: {
      activeUsers: 0,
      totalSessions: 0,
      avgSessionTime: 0,
    },
  });

  useEffect(() => {
    carregarAnalytics();
  }, [periodo]);

  const gerarDadosTeste = () => {
    console.log('🧪 Gerando dados de teste...');
    
    // Simular logs dos últimos 7 dias
    const dadosTeste = [];
    const agora = new Date();
    
    const acoes = ['CRIAR_EMENDA', 'EDITAR_EMENDA', 'DELETAR_EMENDA', 'CRIAR_DESPESA', 'EDITAR_DESPESA', 'DELETAR_DESPESA', 'BUSCAR', 'VISUALIZAR'];
    const usuarios = ['admin@sistema.com', 'usuario1@teste.com', 'usuario2@teste.com', 'guest@sistema.com'];
    const navegadores = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const ufs = ['RO', 'AC', 'AM', 'RR', 'PA', 'AP', 'TO', 'MA', 'PI'];
    
    // Gerar ~500 logs distribuídos nos últimos 7 dias
    for (let i = 0; i < 500; i++) {
      const horasAtras = Math.random() * (7 * 24); // 7 dias em horas
      const timestamp = new Date(agora.getTime() - horasAtras * 60 * 60 * 1000);
      
      dadosTeste.push({
        id: `test_${i}`,
        action: acoes[Math.floor(Math.random() * acoes.length)],
        userEmail: usuarios[Math.floor(Math.random() * usuarios.length)],
        timestamp: timestamp,
        success: Math.random() > 0.1, // 90% de sucesso
        metadata: {
          userAgent: navegadores[Math.floor(Math.random() * navegadores.length)]
        },
        userUf: ufs[Math.floor(Math.random() * ufs.length)]
      });
    }
    
    console.log('✅ Dados de teste gerados:', dadosTeste.length);
    processarAnalytics(dadosTeste);
    setLoading(false);
  };

  const carregarAnalytics = async () => {
    setLoading(true);
    try {
      console.log('📊 [Analytics] Iniciando carregamento de dados...');
      
      // Calcular data de corte baseado no período
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (periodo) {
        case '24h':
          cutoffDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        default:
          cutoffDate.setDate(now.getDate() - 7);
      }

      console.log('📊 [Analytics] Período:', periodo, 'De:', cutoffDate.toLocaleString(), 'Até:', now.toLocaleString());

      // Buscar logs de auditoria do período
      const logsRef = collection(db, 'logs');
      const logsQuery = query(
        logsRef,
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
        orderBy('timestamp', 'desc'),
        limit(5000)
      );

      console.log('📊 [Analytics] Buscando logs no Firestore...');
      const logsSnapshot = await getDocs(logsQuery);
      
      console.log('📊 [Analytics] Logs encontrados:', logsSnapshot.size);

      if (logsSnapshot.empty) {
        console.warn('⚠️ [Analytics] Nenhum log encontrado no período!');
        console.log('💡 [Analytics] Dica: Execute ações no sistema (criar, editar, deletar) para gerar logs');
        
        // Tentar buscar TODOS os logs (sem filtro de data)
        const allLogsQuery = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
        const allLogsSnapshot = await getDocs(allLogsQuery);
        
        console.log('📊 [Analytics] Total de logs no banco (últimos 100):', allLogsSnapshot.size);
        
        if (allLogsSnapshot.empty) {
          console.warn('⚠️ [Analytics] Coleção "logs" está completamente vazia!');
          console.log('💡 [Analytics] O auditService registrará logs quando você usar o sistema');
        }
      }

      const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      console.log('📊 [Analytics] Processando', logs.length, 'logs...');

      // Processar analytics
      processarAnalytics(logs);

      console.log('✅ [Analytics] Carregamento concluído!');

    } catch (error) {
      console.error('❌ [Analytics] Erro ao carregar analytics:', error);
      console.error('📋 [Analytics] Detalhes do erro:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const processarAnalytics = (logs) => {
    // 1. REQUESTS TIMELINE
    const requestsByHour = {};
    const requestTimeline = [];

    logs.forEach(log => {
      const hour = new Date(log.timestamp).toISOString().slice(0, 13);
      requestsByHour[hour] = (requestsByHour[hour] || 0) + 1;
    });

    Object.keys(requestsByHour).sort().forEach(hour => {
      requestTimeline.push({
        time: new Date(hour).toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: 'short', 
          hour: '2-digit' 
        }),
        count: requestsByHour[hour]
      });
    });

    // 2. TOP URLs (ações mais executadas)
    const actionCounts = {};
    logs.forEach(log => {
      const action = log.action || 'UNKNOWN';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    const topURLs = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ url: action, count }));

    // 3. TOP USERS (usuários mais ativos)
    const userCounts = {};
    logs.forEach(log => {
      const user = log.userEmail || 'Sistema';
      userCounts[user] = (userCounts[user] || 0) + 1;
    });

    const topUsers = Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([user, count]) => ({ user, count }));

    // 4. HTTP STATUSES (baseado em success/error)
    const httpStatuses = {
      success: logs.filter(log => log.success !== false).length,
      clientError: 0,
      serverError: logs.filter(log => log.success === false).length,
      redirect: 0,
    };

    // 5. TOP ACTIONS
    const topActions = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ 
        action: action.replace(/_/g, ' '),
        count,
        percentage: ((count / logs.length) * 100).toFixed(1)
      }));

    // 6. TOP BROWSERS (baseado em userAgent)
    const browserCounts = {};
    logs.forEach(log => {
      const ua = log.metadata?.userAgent || 'Unknown';
      let browser = 'Desconhecido';
      
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';
      
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    const topBrowsers = Object.entries(browserCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([browser, count]) => ({ 
        browser, 
        count,
        percentage: ((count / logs.length) * 100).toFixed(1)
      }));

    // 7. TOP COUNTRIES (baseado em UF)
    const ufCounts = {};
    logs.forEach(log => {
      const uf = log.userUf || log.relatedResources?.uf || 'N/A';
      ufCounts[uf] = (ufCounts[uf] || 0) + 1;
    });

    const topCountries = Object.entries(ufCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([uf, count]) => ({ 
        country: uf, 
        count,
        percentage: ((count / logs.length) * 100).toFixed(1)
      }));

    // 8. USER ACTIVITY
    const uniqueUsers = new Set(logs.map(log => log.userEmail)).size;

    setAnalytics({
      requests: {
        total: logs.length,
        timeline: requestTimeline,
        byHour: requestsByHour,
      },
      topURLs,
      topUsers,
      httpStatuses,
      topActions,
      topBrowsers,
      topCountries,
      userActivity: {
        activeUsers: uniqueUsers,
        totalSessions: logs.length,
        avgSessionTime: 0,
      },
    });
  };

  const getStatusColor = (type) => {
    switch(type) {
      case 'success': return '#10b981';
      case 'clientError': return '#f59e0b';
      case 'serverError': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <p>Carregando analytics...</p>
      </div>
    );
  }

  // Verificar se há dados
  const temDados = analytics.requests.total > 0;

  return (
    <div className="tab-analytics">
      {/* BANNER INFORMATIVO SE NÃO HOUVER DADOS */}
      {!temDados && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>💡</div>
          <div>
            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
              Nenhum dado de analytics disponível
            </div>
            <div style={{ fontSize: '14px', color: '#78350f' }}>
              Os dados de analytics são gerados automaticamente quando você usa o sistema.
              Execute ações como criar, editar ou visualizar emendas/despesas para começar a coletar dados.
            </div>
          </div>
        </div>
      )}
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 Analytics & Monitoramento</h2>
          <p style={styles.subtitle}>Métricas de uso e performance do sistema</p>
        </div>
        <div style={styles.controls}>
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            style={styles.select}
          >
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          <button onClick={gerarDadosTeste} style={{...styles.refreshBtn, backgroundColor: '#f59e0b', marginRight: '8px'}}>
            🧪 Dados de Teste
          </button>
          <button onClick={carregarAnalytics} style={styles.refreshBtn}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🌐</div>
          <div>
            <div style={styles.summaryValue}>{analytics.requests.total.toLocaleString()}</div>
            <div style={styles.summaryLabel}>Total de Requisições</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>👥</div>
          <div>
            <div style={styles.summaryValue}>{analytics.userActivity.activeUsers}</div>
            <div style={styles.summaryLabel}>Usuários Ativos</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>✅</div>
          <div>
            <div style={styles.summaryValue}>
              {((analytics.httpStatuses.success / analytics.requests.total) * 100).toFixed(1)}%
            </div>
            <div style={styles.summaryLabel}>Taxa de Sucesso</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>⚡</div>
          <div>
            <div style={styles.summaryValue}>{analytics.topActions.length}</div>
            <div style={styles.summaryLabel}>Ações Diferentes</div>
          </div>
        </div>
      </div>

      {/* REQUESTS TIMELINE */}
      <div style={styles.chartSection}>
        <h3 style={styles.chartTitle}>📈 Requisições ao Longo do Tempo</h3>
        <div style={styles.timelineContainer}>
          {analytics.requests.timeline.slice(-24).map((point, idx) => (
            <div key={idx} style={styles.timelineBar}>
              <div 
                style={{
                  ...styles.timelineBarFill,
                  height: `${(point.count / Math.max(...analytics.requests.timeline.map(p => p.count))) * 100}%`
                }}
              />
              <div style={styles.timelineLabel}>{point.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* GRID DE MÉTRICAS */}
      <div style={styles.metricsGrid}>
        {/* TOP URLs */}
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>🔗 Top Ações Executadas</h3>
          <div style={styles.listContainer}>
            {analytics.topURLs.slice(0, 5).map((item, idx) => (
              <div key={idx} style={styles.listItem}>
                <span style={styles.listRank}>#{idx + 1}</span>
                <div style={styles.listContent}>
                  <div style={styles.listLabel}>{item.url}</div>
                  <div style={styles.listBar}>
                    <div 
                      style={{
                        ...styles.listBarFill,
                        width: `${(item.count / analytics.topURLs[0].count) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <span style={styles.listValue}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP USERS */}
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>👥 Usuários Mais Ativos</h3>
          <div style={styles.listContainer}>
            {analytics.topUsers.slice(0, 5).map((item, idx) => (
              <div key={idx} style={styles.listItem}>
                <span style={styles.listRank}>#{idx + 1}</span>
                <div style={styles.listContent}>
                  <div style={styles.listLabel}>{item.user}</div>
                  <div style={styles.listBar}>
                    <div 
                      style={{
                        ...styles.listBarFill,
                        width: `${(item.count / analytics.topUsers[0].count) * 100}%`,
                        backgroundColor: '#667eea'
                      }}
                    />
                  </div>
                </div>
                <span style={styles.listValue}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HTTP STATUSES */}
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>📊 Status das Requisições</h3>
          <div style={styles.statusGrid}>
            <div style={styles.statusItem}>
              <div style={{...styles.statusDot, backgroundColor: '#10b981'}} />
              <div style={styles.statusContent}>
                <div style={styles.statusLabel}>Sucesso (2xx)</div>
                <div style={styles.statusValue}>{analytics.httpStatuses.success}</div>
              </div>
            </div>
            <div style={styles.statusItem}>
              <div style={{...styles.statusDot, backgroundColor: '#ef4444'}} />
              <div style={styles.statusContent}>
                <div style={styles.statusLabel}>Erros (5xx)</div>
                <div style={styles.statusValue}>{analytics.httpStatuses.serverError}</div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP BROWSERS */}
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>🌐 Navegadores</h3>
          <div style={styles.listContainer}>
            {analytics.topBrowsers.map((item, idx) => (
              <div key={idx} style={styles.listItem}>
                <div style={styles.listContent}>
                  <div style={styles.listLabel}>{item.browser}</div>
                  <div style={styles.listBar}>
                    <div 
                      style={{
                        ...styles.listBarFill,
                        width: `${item.percentage}%`,
                        backgroundColor: '#f59e0b'
                      }}
                    />
                  </div>
                </div>
                <span style={styles.listValue}>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP COUNTRIES (UFs) */}
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>🗺️ Distribuição por UF</h3>
          <div style={styles.listContainer}>
            {analytics.topCountries.slice(0, 5).map((item, idx) => (
              <div key={idx} style={styles.listItem}>
                <div style={styles.listContent}>
                  <div style={styles.listLabel}>{item.country}</div>
                  <div style={styles.listBar}>
                    <div 
                      style={{
                        ...styles.listBarFill,
                        width: `${item.percentage}%`,
                        backgroundColor: '#10b981'
                      }}
                    />
                  </div>
                </div>
                <span style={styles.listValue}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP ACTIONS */}
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>⚡ Principais Ações</h3>
          <div style={styles.listContainer}>
            {analytics.topActions.map((item, idx) => (
              <div key={idx} style={styles.listItem}>
                <div style={styles.listContent}>
                  <div style={styles.listLabel}>{item.action}</div>
                  <div style={styles.listBar}>
                    <div 
                      style={{
                        ...styles.listBarFill,
                        width: `${item.percentage}%`,
                        backgroundColor: '#8b5cf6'
                      }}
                    />
                  </div>
                </div>
                <span style={styles.listValue}>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0'
  },
  controls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  refreshBtn: {
    padding: '8px 16px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  summaryIcon: {
    fontSize: '32px'
  },
  summaryValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827'
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px'
  },
  chartSection: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '24px'
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '20px',
    margin: 0
  },
  timelineContainer: {
    display: 'flex',
    gap: '4px',
    alignItems: 'flex-end',
    height: '200px',
    padding: '20px 0'
  },
  timelineBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end'
  },
  timelineBarFill: {
    width: '100%',
    backgroundColor: '#667eea',
    borderRadius: '4px 4px 0 0',
    minHeight: '4px',
    transition: 'height 0.3s ease'
  },
  timelineLabel: {
    fontSize: '10px',
    color: '#6b7280',
    marginTop: '8px',
    transform: 'rotate(-45deg)',
    transformOrigin: 'top left',
    whiteSpace: 'nowrap'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px'
  },
  metricCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  metricTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
    margin: 0
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  listRank: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#6b7280',
    minWidth: '32px'
  },
  listContent: {
    flex: 1,
    minWidth: 0
  },
  listLabel: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  listBar: {
    height: '6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  listBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  listValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    minWidth: '48px',
    textAlign: 'right'
  },
  statusGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  statusContent: {
    flex: 1
  },
  statusLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '2px'
  },
  statusValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827'
  }
};

export default AnalyticsTab;
