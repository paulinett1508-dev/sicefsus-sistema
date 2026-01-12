
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

function ManutencaoTab() {
  const [metricas, setMetricas] = useState(null);
  const [expandido, setExpandido] = useState({
    integridade: true,
    performance: false,
    seguranca: false,
    sistema: true
  });
  const [loading, setLoading] = useState(true);
  const [metricsRealTime, setMetricsRealTime] = useState({
    memory: { used: 0, total: 0, percentage: 0 },
    uptime: 0,
    firebase: { status: 'checking', latency: 0 },
    env: { status: 'checking', count: 0 }
  });

  useEffect(() => {
    analisarSistema();
    const interval = setInterval(updateRealTimeMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateRealTimeMetrics = async () => {
    try {
      // Memória
      const memory = performance.memory || {};
      const used = memory.usedJSHeapSize || 0;
      const total = memory.jsHeapSizeLimit || 100000000;
      
      // Uptime
      const uptime = performance.now() / 1000;

      // Firebase latency
      const startTime = Date.now();
      await getDocs(query(collection(db, 'usuarios'), where('tipo', '==', 'admin')));
      const latency = Date.now() - startTime;

      // Environment
      const envCount = Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).length;

      setMetricsRealTime({
        memory: {
          used: (used / 1024 / 1024).toFixed(2),
          total: (total / 1024 / 1024).toFixed(2),
          percentage: ((used / total) * 100).toFixed(1)
        },
        uptime: Math.floor(uptime),
        firebase: {
          status: latency < 500 ? 'ok' : latency < 1000 ? 'warning' : 'slow',
          latency
        },
        env: {
          status: envCount >= 6 ? 'ok' : 'warning',
          count: envCount
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    }
  };

  const analisarSistema = async () => {
    setLoading(true);
    try {
      const despesasSnap = await getDocs(collection(db, 'despesas'));
      const emendasSnap = await getDocs(collection(db, 'emendas'));
      const usuariosSnap = await getDocs(collection(db, 'usuarios'));

      // Logs pode não ter permissão - tratar separadamente
      let logsSnap = { docs: [], size: 0 };
      try {
        logsSnap = await getDocs(collection(db, 'logs'));
      } catch (logsError) {
        console.warn('⚠️ Sem permissão para ler logs:', logsError.message);
      }

      const despesas = despesasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const emendas = emendasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const usuarios = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Integridade
      const despesasOrfas = despesas.filter(d => !emendas.find(e => e.id === d.emendaId));
      const emendasSemDespesas = emendas.filter(e => !despesas.find(d => d.emendaId === e.id));
      const camposFaltando = despesas.filter(d => !d.valor || !d.data || !d.status);
      const inconsistenciasFinanceiras = despesas.filter(d => {
        const emenda = emendas.find(e => e.id === d.emendaId);
        return emenda && parseFloat(d.valor || 0) > parseFloat(emenda.valorTotal || 0);
      });

      // Performance
      const totalDocs = despesasSnap.size + emendasSnap.size + usuariosSnap.size + logsSnap.size;
      const storageKB = (totalDocs / 1024).toFixed(2);

      // Segurança
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      const logsErro24h = logsSnap.docs
        .map(doc => doc.data())
        .filter(log => log.success === false && log.timestamp?.toDate?.() > ontem);
      
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
          tempoAnalise: Date.now(),
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'ok': return 'var(--success, #10b981)';
      case 'warning': return 'var(--warning, #f59e0b)';
      case 'slow': return 'var(--danger, #ef4444)';
      default: return 'var(--theme-text-muted, #6b7280)';
    }
  };

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) {
    return <div style={styles.loading}>⏳ Analisando sistema...</div>;
  }

  if (!metricas) {
    return <div style={styles.loading}>Carregando...</div>;
  }

  const Metric = ({ label, value, status, unit = '' }) => (
    <div style={styles.metric}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={{...styles.metricValue, color: getStatusColor(status)}}>
        {value}{unit}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔧 Manutenção & Monitoramento</h2>
        <button onClick={analisarSistema} style={styles.btnRefresh}>
          🔄 Atualizar
        </button>
      </div>

      {/* MÉTRICAS EM TEMPO REAL */}
      <div style={styles.section}>
        <div style={styles.sectionHeader} onClick={() => toggle('sistema')}>
          <span>📊 Métricas do Sistema (Tempo Real)</span>
          <span style={styles.toggle}>{expandido.sistema ? '▼' : '▶'}</span>
        </div>
        {expandido.sistema && (
          <div style={styles.realTimeGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricCardIcon}>💾</div>
              <div style={styles.metricCardTitle}>Memória JS Heap</div>
              <div style={styles.metricCardValue}>
                {metricsRealTime.memory.used} MB
              </div>
              <div style={styles.metricCardSubtext}>
                de {metricsRealTime.memory.total} MB ({metricsRealTime.memory.percentage}%)
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'var(--theme-border)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '8px'
              }}>
                <div style={{
                  width: `${metricsRealTime.memory.percentage}%`,
                  height: '100%',
                  background: parseFloat(metricsRealTime.memory.percentage) > 80 ? 'var(--danger, #ef4444)' : 'var(--success, #10b981)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricCardIcon}>⏱️</div>
              <div style={styles.metricCardTitle}>Uptime</div>
              <div style={styles.metricCardValue}>
                {formatUptime(metricsRealTime.uptime)}
              </div>
              <div style={styles.metricCardSubtext}>
                Desde o último carregamento
              </div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricCardIcon}>🔥</div>
              <div style={styles.metricCardTitle}>Firebase</div>
              <div style={{
                ...styles.metricCardValue,
                color: getStatusColor(metricsRealTime.firebase.status)
              }}>
                {metricsRealTime.firebase.latency}ms
              </div>
              <div style={styles.metricCardSubtext}>
                Latência de consulta
              </div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricCardIcon}>🔐</div>
              <div style={styles.metricCardTitle}>Env Vars</div>
              <div style={{
                ...styles.metricCardValue,
                color: getStatusColor(metricsRealTime.env.status)
              }}>
                {metricsRealTime.env.count}
              </div>
              <div style={styles.metricCardSubtext}>
                Variáveis VITE carregadas
              </div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricCardIcon}>📦</div>
              <div style={styles.metricCardTitle}>Storage Firestore</div>
              <div style={styles.metricCardValue}>
                {metricas.performance.storageKB} MB
              </div>
              <div style={styles.metricCardSubtext}>
                {metricas.performance.totalDocs} documentos
              </div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricCardIcon}>👥</div>
              <div style={styles.metricCardTitle}>Usuários</div>
              <div style={styles.metricCardValue}>
                {metricas.seguranca.usuariosElevados.length}
              </div>
              <div style={styles.metricCardSubtext}>
                Administradores ativos
              </div>
            </div>
          </div>
        )}
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
            status={metricas.integridade.despesasOrfas.length > 0 ? 'warning' : 'ok'}
          />
          <Metric 
            label="Emendas sem Despesas" 
            value={metricas.integridade.emendasSemDespesas.length}
            status={metricas.integridade.emendasSemDespesas.length > 0 ? 'warning' : 'ok'}
          />
          <Metric 
            label="Campos Faltando" 
            value={metricas.integridade.camposFaltando.length}
            status={metricas.integridade.camposFaltando.length > 0 ? 'warning' : 'ok'}
          />
          <Metric 
            label="Inconsistências $$" 
            value={metricas.integridade.inconsistenciasFinanceiras.length}
            status={metricas.integridade.inconsistenciasFinanceiras.length > 0 ? 'warning' : 'ok'}
          />
        </div>
        {expandido.integridade && metricas.integridade.despesasOrfas.length > 0 && (
          <div style={styles.details}>
            <strong>Despesas Órfãs (sem emenda):</strong>
            <ul>
              {metricas.integridade.despesasOrfas.slice(0, 5).map(d => (
                <li key={d.id}>{d.descricao || 'Sem descrição'} - R$ {d.valor || 0}</li>
              ))}
            </ul>
          </div>
        )}
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
                </tr>
              </thead>
              <tbody>
                {metricas.seguranca.logsErro24h.slice(0, 5).map((log, i) => (
                  <tr key={i}>
                    <td>{log.timestamp?.toDate?.()?.toLocaleString('pt-BR') || 'N/A'}</td>
                    <td><code>{log.action || 'N/A'}</code></td>
                    <td>{log.userEmail || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Dark Mode Compatible Styles
const styles = {
  container: {
    padding: '0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--theme-text)',
    margin: 0
  },
  btnRefresh: {
    padding: '8px 16px',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  section: {
    background: 'var(--theme-surface)',
    border: '1px solid var(--theme-border)',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  sectionHeader: {
    padding: '16px',
    background: 'var(--theme-bg)',
    borderBottom: '1px solid var(--theme-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    color: 'var(--theme-text)'
  },
  toggle: {
    fontSize: '12px',
    color: 'var(--theme-text-muted)'
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    padding: '16px'
  },
  metric: {
    textAlign: 'center'
  },
  metricLabel: {
    fontSize: '12px',
    color: 'var(--theme-text-muted)',
    marginBottom: '4px'
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: '700'
  },
  details: {
    padding: '16px',
    background: 'var(--theme-hover)',
    borderTop: '1px solid var(--theme-border)',
    fontSize: '13px',
    color: 'var(--theme-text-secondary)'
  },
  table: {
    width: '100%',
    marginTop: '8px',
    borderCollapse: 'collapse',
    fontSize: '12px',
    color: 'var(--theme-text)'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: 'var(--theme-text-muted)'
  },
  realTimeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    padding: '16px'
  },
  metricCard: {
    background: 'var(--theme-hover)',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid var(--theme-border)',
    textAlign: 'center'
  },
  metricCardIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  metricCardTitle: {
    fontSize: '12px',
    color: 'var(--theme-text-muted)',
    marginBottom: '8px',
    fontWeight: '500'
  },
  metricCardValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--theme-text)',
    marginBottom: '4px'
  },
  metricCardSubtext: {
    fontSize: '11px',
    color: 'var(--theme-text-muted)'
  }
};

export default ManutencaoTab;
