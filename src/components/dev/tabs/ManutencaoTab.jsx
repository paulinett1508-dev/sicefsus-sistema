
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

function ManutencaoTab() {
  const [loading, setLoading] = useState(false);
  const [metricas, setMetricas] = useState(null);
  const [expandido, setExpandido] = useState({
    integridade: false,
    performance: false,
    seguranca: false,
    erros: false,
  });

  useEffect(() => {
    analisarSistema();
  }, []);

  const analisarSistema = async () => {
    setLoading(true);
    const inicioAnalise = performance.now();

    try {
      const [emendasSnap, despesasSnap, usuariosSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, 'emendas')),
        getDocs(collection(db, 'despesas')),
        getDocs(collection(db, 'usuarios')),
        getDocs(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100))),
      ]);

      const emendas = emendasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const despesas = despesasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const usuarios = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // INTEGRIDADE
      const emendasIds = new Set(emendas.map(e => e.id));
      const despesasOrfas = despesas.filter(d => !emendasIds.has(d.emendaId));
      const despesasPorEmenda = despesas.reduce((acc, d) => {
        acc[d.emendaId] = (acc[d.emendaId] || 0) + 1;
        return acc;
      }, {});
      const emendasSemDespesas = emendas.filter(e => !despesasPorEmenda[e.id]);
      const camposFaltando = emendas.filter(e => !e.numeroEmenda || !e.municipio || !e.valorTotal).length +
                             despesas.filter(d => !d.descricao || !d.valor).length;
      const inconsistenciasFinanceiras = emendas.filter(e => {
        const executado = e.valorExecutado || 0;
        const total = e.valorTotal || 0;
        return executado > total || executado < 0;
      });

      // PERFORMANCE
      const totalDocs = emendas.length + despesas.length + usuarios.length + logs.length;
      const storageKB = (JSON.stringify([...emendas, ...despesas]).length / 1024).toFixed(2);
      const tempoAnalise = ((performance.now() - inicioAnalise) / 1000).toFixed(2);

      // SEGURANÇA
      const agora = new Date();
      const umDiaAtras = new Date(agora - 24 * 60 * 60 * 1000);
      const logsErro24h = logs.filter(log => {
        const logDate = log.timestamp?.toDate?.() || new Date(0);
        return logDate > umDiaAtras && log.success === false;
      });
      const usuariosElevados = usuarios.filter(u => u.tipo === 'admin' || u.superAdmin);

      setMetricas({
        integridade: {
          despesasOrfas,
          emendasSemDespesas,
          camposFaltando,
          inconsistenciasFinanceiras,
        },
        performance: {
          totalDocs,
          storageKB,
          tempoAnalise,
        },
        seguranca: {
          logsErro24h,
          usuariosElevados,
        },
      });

    } catch (error) {
      console.error('❌ Erro ao analisar sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (secao) => setExpandido(prev => ({ ...prev, [secao]: !prev[secao] }));

  if (loading) {
    return <div style={styles.loading}>⏳ Analisando sistema...</div>;
  }

  if (!metricas) {
    return <div style={styles.loading}>Carregando...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔧 Manutenção & Integridade</h2>
        <button onClick={analisarSistema} style={styles.btnRefresh}>
          🔄 Atualizar
        </button>
      </div>

      {/* INTEGRIDADE */}
      <div style={styles.section}>
        <div style={styles.sectionHeader} onClick={() => toggle('integridade')}>
          <span>🔍 Integridade de Dados</span>
          <span style={styles.toggle}>{expandido.integridade ? '▼' : '▶'}</span>
        </div>
        <div style={styles.metricsRow}>
          <Metric 
            label="Despesas Órfãs" 
            value={metricas.integridade.despesasOrfas.length}
            status={metricas.integridade.despesasOrfas.length === 0 ? 'ok' : 'error'}
          />
          <Metric 
            label="Emendas sem Despesas" 
            value={metricas.integridade.emendasSemDespesas.length}
            status={metricas.integridade.emendasSemDespesas.length > 10 ? 'warning' : 'ok'}
          />
          <Metric 
            label="Campos Faltando" 
            value={metricas.integridade.camposFaltando}
            status={metricas.integridade.camposFaltando === 0 ? 'ok' : 'error'}
          />
          <Metric 
            label="Inconsistências Financeiras" 
            value={metricas.integridade.inconsistenciasFinanceiras.length}
            status={metricas.integridade.inconsistenciasFinanceiras.length === 0 ? 'ok' : 'error'}
          />
        </div>
        {expandido.integridade && (
          <div style={styles.details}>
            {metricas.integridade.despesasOrfas.length > 0 && (
              <div>
                <strong>Despesas Órfãs:</strong>
                <ul style={styles.list}>
                  {metricas.integridade.despesasOrfas.slice(0, 5).map(d => (
                    <li key={d.id}>{d.id} - {d.descricao}</li>
                  ))}
                </ul>
                <button style={styles.btnAction} disabled>🗑️ Remover Órfãs (em breve)</button>
              </div>
            )}
            {metricas.integridade.inconsistenciasFinanceiras.length > 0 && (
              <div>
                <strong>Inconsistências Financeiras:</strong>
                <ul style={styles.list}>
                  {metricas.integridade.inconsistenciasFinanceiras.slice(0, 5).map(e => (
                    <li key={e.id}>
                      Emenda {e.numeroEmenda}: Executado R$ {e.valorExecutado?.toFixed(2)} / Total R$ {e.valorTotal?.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PERFORMANCE */}
      <div style={styles.section}>
        <div style={styles.sectionHeader} onClick={() => toggle('performance')}>
          <span>⚡ Performance</span>
          <span style={styles.toggle}>{expandido.performance ? '▼' : '▶'}</span>
        </div>
        <div style={styles.metricsRow}>
          <Metric label="Total Documentos" value={metricas.performance.totalDocs} status="ok" />
          <Metric label="Storage" value={`${metricas.performance.storageKB} KB`} status="ok" />
          <Metric label="Tempo Análise" value={`${metricas.performance.tempoAnalise}s`} status="ok" />
        </div>
      </div>

      {/* SEGURANÇA */}
      <div style={styles.section}>
        <div style={styles.sectionHeader} onClick={() => toggle('seguranca')}>
          <span>🔒 Segurança & Auditoria</span>
          <span style={styles.toggle}>{expandido.seguranca ? '▼' : '▶'}</span>
        </div>
        <div style={styles.metricsRow}>
          <Metric 
            label="Erros (24h)" 
            value={metricas.seguranca.logsErro24h.length}
            status={metricas.seguranca.logsErro24h.length > 0 ? 'warning' : 'ok'}
          />
          <Metric 
            label="Usuários Elevados" 
            value={metricas.seguranca.usuariosElevados.length}
            status="ok"
          />
        </div>
        {expandido.seguranca && metricas.seguranca.logsErro24h.length > 0 && (
          <div style={styles.details}>
            <strong>Últimos Erros:</strong>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Ação</th>
                  <th>Usuário</th>
                  <th>Erro</th>
                </tr>
              </thead>
              <tbody>
                {metricas.seguranca.logsErro24h.slice(0, 5).map((log, i) => (
                  <tr key={i}>
                    <td>{log.timestamp?.toDate?.()?.toLocaleString('pt-BR') || 'N/A'}</td>
                    <td><code>{log.action || 'N/A'}</code></td>
                    <td>{log.userEmail || 'N/A'}</td>
                    <td style={{ color: '#dc3545', fontSize: '11px' }}>{log.errorMessage || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LIMPEZA */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span>🧹 Ferramentas de Limpeza</span>
        </div>
        <div style={styles.toolsRow}>
          <button style={styles.btnTool} disabled>🗑️ Remover Despesas Órfãs</button>
          <button style={styles.btnTool} disabled>📋 Detectar Duplicatas</button>
          <button style={styles.btnTool} disabled>🔄 Migrar Despesas</button>
        </div>
      </div>
    </div>
  );
}

// Componente de Métrica
function Metric({ label, value, status }) {
  const colors = {
    ok: '#10b981',
    warning: '#f59e0b',
    error: '#dc2626',
  };

  return (
    <div style={{
      ...styles.metric,
      borderLeft: `4px solid ${colors[status]}`,
    }}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={styles.metricValue}>{value}</div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'monospace',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e2e8f0',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#2d3748',
  },
  btnRefresh: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  section: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: '12px 16px',
    background: '#f7fafc',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  toggle: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    padding: '16px',
  },
  metric: {
    background: '#f9fafb',
    padding: '12px',
    borderRadius: '6px',
    borderLeft: '4px solid #cbd5e1',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#64748b',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e293b',
  },
  details: {
    padding: '16px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '13px',
  },
  list: {
    margin: '8px 0',
    paddingLeft: '20px',
    fontSize: '12px',
  },
  table: {
    width: '100%',
    marginTop: '8px',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  btnAction: {
    marginTop: '8px',
    padding: '6px 12px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  toolsRow: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
  },
  btnTool: {
    padding: '8px 16px',
    background: '#cbd5e0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '12px',
    opacity: 0.6,
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#64748b',
  },
};

export default ManutencaoTab;
