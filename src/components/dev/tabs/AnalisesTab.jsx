
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

function AnalisesTab() {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    integridade: {
      despesasOrfas: 0,
      emendasSemDespesas: 0,
      camposObrigatoriosFaltando: 0,
      inconsistenciasFinanceiras: 0,
      documentosMalformados: 0,
    },
    performance: {
      totalDocumentos: 0,
      storageEstimado: '0 KB',
      tempoAnalise: '0s',
      tempoMedioQuery: '0ms',
    },
    seguranca: {
      logsErro24h: 0,
      acessosNegados: 0,
      usuariosElevados: 0,
      alteracoesCriticas24h: 0,
    },
    firebase: {
      ambiente: 'unknown',
      projectId: '',
      regrasAtualizadas: 'N/A',
      indicesFaltando: [],
    },
  });

  const [ultimosErros, setUltimosErros] = useState([]);
  const [docsMalformados, setDocsMalformados] = useState([]);

  useEffect(() => {
    analisarSistema();
  }, []);

  const analisarSistema = async () => {
    setLoading(true);
    const inicioAnalise = performance.now();

    try {
      // Buscar dados em paralelo
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

      // === 1. INTEGRIDADE DE DADOS ===
      const emendasIds = new Set(emendas.map(e => e.id));
      const despesasOrfas = despesas.filter(d => !emendasIds.has(d.emendaId)).length;

      const despesasPorEmenda = despesas.reduce((acc, d) => {
        acc[d.emendaId] = (acc[d.emendaId] || 0) + 1;
        return acc;
      }, {});
      const emendasSemDespesas = emendas.filter(e => !despesasPorEmenda[e.id]).length;

      const camposFaltando = emendas.filter(e => 
        !e.numeroEmenda || !e.municipio || !e.uf || !e.valorTotal
      ).length + despesas.filter(d => 
        !d.descricao || !d.valor || !d.emendaId
      ).length;

      const inconsistenciasFinanceiras = emendas.filter(e => {
        const valorExecutado = e.valorExecutado || 0;
        const valorTotal = e.valorTotal || 0;
        return valorExecutado > valorTotal || valorExecutado < 0;
      }).length;

      // Detectar documentos malformados
      const malformados = [];
      emendas.forEach(e => {
        if (typeof e.valorTotal !== 'number' && e.valorTotal) {
          malformados.push({
            tipo: 'emenda',
            id: e.id,
            campo: 'valorTotal',
            problema: `Tipo inválido: ${typeof e.valorTotal}`,
          });
        }
      });

      despesas.forEach(d => {
        if (typeof d.valor !== 'number' && d.valor) {
          malformados.push({
            tipo: 'despesa',
            id: d.id,
            campo: 'valor',
            problema: `Tipo inválido: ${typeof d.valor}`,
          });
        }
      });

      setDocsMalformados(malformados.slice(0, 10));

      // === 2. PERFORMANCE ===
      const totalDocumentos = emendas.length + despesas.length + usuarios.length + logs.length;
      const storageEstimado = ((JSON.stringify([...emendas, ...despesas]).length) / 1024).toFixed(2);
      const fimAnalise = performance.now();
      const tempoAnalise = ((fimAnalise - inicioAnalise) / 1000).toFixed(2);

      // === 3. SEGURANÇA ===
      const agora = new Date();
      const umDiaAtras = new Date(agora - 24 * 60 * 60 * 1000);

      const logsErro24h = logs.filter(log => {
        const logDate = log.timestamp?.toDate?.() || new Date(0);
        return logDate > umDiaAtras && log.success === false;
      }).length;

      const acessosNegados = logs.filter(log => log.success === false).length;

      const alteracoesCriticas24h = logs.filter(log => {
        const logDate = log.timestamp?.toDate?.() || new Date(0);
        return logDate > umDiaAtras && (
          log.action?.includes('DELETE') || 
          log.action?.includes('UPDATE_USER')
        );
      }).length;

      const usuariosElevados = usuarios.filter(u => 
        u.tipo === 'admin' || u.superAdmin === true
      ).length;

      const erros = logs
        .filter(log => log.success === false)
        .slice(0, 5)
        .map(log => ({
          acao: log.action || 'N/A',
          usuario: log.userEmail || 'N/A',
          erro: log.errorMessage || 'N/A',
          timestamp: log.timestamp?.toDate?.()?.toLocaleString('pt-BR') || 'N/A',
        }));

      setUltimosErros(erros);

      // === 4. FIREBASE ===
      const ambiente = import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('-prod') 
        ? 'production' 
        : 'development';
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'N/A';

      setMetricas({
        integridade: {
          despesasOrfas,
          emendasSemDespesas,
          camposObrigatoriosFaltando: camposFaltando,
          inconsistenciasFinanceiras,
          documentosMalformados: malformados.length,
        },
        performance: {
          totalDocumentos,
          storageEstimado: `${storageEstimado} KB`,
          tempoAnalise: `${tempoAnalise}s`,
          tempoMedioQuery: `${(parseFloat(tempoAnalise) / 4 * 1000).toFixed(0)}ms`,
        },
        seguranca: {
          logsErro24h,
          acessosNegados,
          usuariosElevados,
          alteracoesCriticas24h,
        },
        firebase: {
          ambiente,
          projectId,
          regrasAtualizadas: 'Manual',
          indicesFaltando: [],
        },
      });

    } catch (error) {
      console.error('❌ Erro ao analisar sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Analisando integridade do sistema...</p>
      </div>
    );
  }

  return (
    <div className="tab-analises">
      <div className="tab-header">
        <h2>🔧 Análise Técnica do Sistema</h2>
        <p className="tab-descricao">
          Métricas de integridade, performance, segurança e saúde do Firebase
        </p>
        <button onClick={analisarSistema} className="btn-refresh">
          🔄 Atualizar Análise
        </button>
      </div>

      <div className="analises-grid">
        {/* 1️⃣ INTEGRIDADE DE DADOS */}
        <div className="analise-secao">
          <h3>🔍 Integridade de Dados</h3>
          <div className="metricas-lista">
            <div className={`metrica ${metricas.integridade.despesasOrfas > 0 ? 'error' : 'ok'}`}>
              <span className="metrica-label">Despesas Órfãs</span>
              <span className="metrica-valor">{metricas.integridade.despesasOrfas}</span>
            </div>
            <div className={`metrica ${metricas.integridade.emendasSemDespesas > 10 ? 'warning' : 'ok'}`}>
              <span className="metrica-label">Emendas sem Despesas</span>
              <span className="metrica-valor">{metricas.integridade.emendasSemDespesas}</span>
            </div>
            <div className={`metrica ${metricas.integridade.camposObrigatoriosFaltando > 0 ? 'error' : 'ok'}`}>
              <span className="metrica-label">Campos Obrigatórios Ausentes</span>
              <span className="metrica-valor">{metricas.integridade.camposObrigatoriosFaltando}</span>
            </div>
            <div className={`metrica ${metricas.integridade.inconsistenciasFinanceiras > 0 ? 'error' : 'ok'}`}>
              <span className="metrica-label">Inconsistências Financeiras</span>
              <span className="metrica-valor">{metricas.integridade.inconsistenciasFinanceiras}</span>
            </div>
            <div className={`metrica ${metricas.integridade.documentosMalformados > 0 ? 'warning' : 'ok'}`}>
              <span className="metrica-label">Documentos Malformados</span>
              <span className="metrica-valor">{metricas.integridade.documentosMalformados}</span>
            </div>
          </div>
        </div>

        {/* 2️⃣ PERFORMANCE */}
        <div className="analise-secao">
          <h3>⚡ Performance & Disponibilidade</h3>
          <div className="metricas-lista">
            <div className="metrica ok">
              <span className="metrica-label">Total de Documentos</span>
              <span className="metrica-valor">{metricas.performance.totalDocumentos}</span>
            </div>
            <div className="metrica ok">
              <span className="metrica-label">Storage Estimado</span>
              <span className="metrica-valor">{metricas.performance.storageEstimado}</span>
            </div>
            <div className="metrica ok">
              <span className="metrica-label">Tempo de Análise</span>
              <span className="metrica-valor">{metricas.performance.tempoAnalise}</span>
            </div>
            <div className="metrica ok">
              <span className="metrica-label">Tempo Médio/Query</span>
              <span className="metrica-valor">{metricas.performance.tempoMedioQuery}</span>
            </div>
          </div>
        </div>

        {/* 3️⃣ SEGURANÇA */}
        <div className="analise-secao">
          <h3>🔒 Segurança & Auditoria</h3>
          <div className="metricas-lista">
            <div className={`metrica ${metricas.seguranca.logsErro24h > 0 ? 'warning' : 'ok'}`}>
              <span className="metrica-label">Logs de Erro (24h)</span>
              <span className="metrica-valor">{metricas.seguranca.logsErro24h}</span>
            </div>
            <div className={`metrica ${metricas.seguranca.acessosNegados > 0 ? 'warning' : 'ok'}`}>
              <span className="metrica-label">Acessos Negados (Total)</span>
              <span className="metrica-valor">{metricas.seguranca.acessosNegados}</span>
            </div>
            <div className="metrica ok">
              <span className="metrica-label">Usuários com Permissões Elevadas</span>
              <span className="metrica-valor">{metricas.seguranca.usuariosElevados}</span>
            </div>
            <div className="metrica ok">
              <span className="metrica-label">Alterações Críticas (24h)</span>
              <span className="metrica-valor">{metricas.seguranca.alteracoesCriticas24h}</span>
            </div>
          </div>
        </div>

        {/* 4️⃣ FIREBASE */}
        <div className="analise-secao">
          <h3>🔥 Saúde do Firebase</h3>
          <div className="metricas-lista">
            <div className="metrica ok">
              <span className="metrica-label">Ambiente</span>
              <span className="metrica-valor">{metricas.firebase.ambiente}</span>
            </div>
            <div className="metrica ok">
              <span className="metrica-label">Project ID</span>
              <span className="metrica-valor" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {metricas.firebase.projectId.substring(0, 20)}...
              </span>
            </div>
            <div className="metrica ok">
              <span className="metrica-label">Rules Deployment</span>
              <span className="metrica-valor">{metricas.firebase.regrasAtualizadas}</span>
            </div>
            <div className="metrica ok">
              <span className="metrica-label">Índices Compostos Faltando</span>
              <span className="metrica-valor">{metricas.firebase.indicesFaltando.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETALHES: ÚLTIMOS ERROS */}
      {ultimosErros.length > 0 && (
        <div className="detalhes-secao">
          <h3>❌ Últimos Erros Registrados</h3>
          <div className="tabela-erros">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Ação</th>
                  <th>Usuário</th>
                  <th>Erro</th>
                </tr>
              </thead>
              <tbody>
                {ultimosErros.map((erro, idx) => (
                  <tr key={idx}>
                    <td>{erro.timestamp}</td>
                    <td><code>{erro.acao}</code></td>
                    <td>{erro.usuario}</td>
                    <td style={{ color: '#dc3545', fontSize: '12px' }}>{erro.erro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETALHES: DOCUMENTOS MALFORMADOS */}
      {docsMalformados.length > 0 && (
        <div className="detalhes-secao">
          <h3>⚠️ Documentos Malformados</h3>
          <div className="tabela-erros">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>ID</th>
                  <th>Campo</th>
                  <th>Problema</th>
                </tr>
              </thead>
              <tbody>
                {docsMalformados.map((doc, idx) => (
                  <tr key={idx}>
                    <td>{doc.tipo}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{doc.id.substring(0, 12)}...</td>
                    <td><code>{doc.campo}</code></td>
                    <td style={{ color: '#dc3545' }}>{doc.problema}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Se não houver problemas */}
      {ultimosErros.length === 0 && docsMalformados.length === 0 && (
        <div className="status-ok-global">
          ✅ Sistema sem problemas críticos detectados
        </div>
      )}

      <style>
        {`
        .tab-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .tab-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #2d3748;
        }

        .tab-descricao {
          margin: 0 0 16px 0;
          color: #718096;
          font-size: 14px;
        }

        .btn-refresh {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .analises-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .analise-secao {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .analise-secao h3 {
          margin: 0 0 16px 0;
          font-size: 15px;
          color: #2d3748;
          font-weight: 600;
        }

        .metricas-lista {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .metrica {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f7fafc;
          border-radius: 6px;
          border-left: 4px solid #cbd5e1;
          transition: all 0.2s;
        }

        .metrica:hover {
          background: #edf2f7;
        }

        .metrica.ok {
          border-left-color: #10b981;
        }

        .metrica.warning {
          border-left-color: #f59e0b;
          background: #fef3c7;
        }

        .metrica.error {
          border-left-color: #dc2626;
          background: #fee2e2;
        }

        .metrica-label {
          font-size: 13px;
          color: #4a5568;
          font-weight: 500;
        }

        .metrica-valor {
          font-size: 16px;
          font-weight: 700;
          color: #2d3748;
        }

        .detalhes-secao {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          margin-bottom: 20px;
        }

        .detalhes-secao h3 {
          margin: 0 0 16px 0;
          font-size: 15px;
          color: #2d3748;
          font-weight: 600;
        }

        .tabela-erros table {
          width: 100%;
          border-collapse: collapse;
        }

        .tabela-erros th {
          background: #f7fafc;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #4a5568;
          border-bottom: 2px solid #e2e8f0;
          font-size: 12px;
        }

        .tabela-erros td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #2d3748;
          font-size: 13px;
        }

        .status-ok-global {
          padding: 24px;
          text-align: center;
          background: #d1fae5;
          border: 2px solid #10b981;
          border-radius: 12px;
          color: #065f46;
          font-size: 16px;
          font-weight: 600;
        }
      `}
      </style>
    </div>
  );
}

export default AnalisesTab;
