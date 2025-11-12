
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { formatarMoeda } from '../../../utils/formatters';

function AnalisesTab() {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    integridade: {
      despesasOrfas: 0,
      emendasSemDespesas: 0,
      camposObrigatoriosFaltando: 0,
      inconsistenciasFinanceiras: 0,
    },
    performance: {
      totalDocumentos: 0,
      storageEstimado: '0 KB',
      queriesLentas: [],
      tempoMedioResposta: 0,
    },
    seguranca: {
      tentativasAcessoNegado: 0,
      alteracoesCriticas24h: 0,
      usuariosElevados: 0,
      logsErro: [],
    },
    estrutura: {
      documentosMalformados: [],
      tiposInconsistentes: [],
      indicesFaltando: [],
    },
  });

  useEffect(() => {
    analisarSistema();
  }, []);

  const analisarSistema = async () => {
    setLoading(true);
    const inicio = performance.now();

    try {
      // 1️⃣ INTEGRIDADE DE DADOS
      const [emendasSnap, despesasSnap, usuariosSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, 'emendas')),
        getDocs(collection(db, 'despesas')),
        getDocs(collection(db, 'usuarios')),
        getDocs(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100))),
      ]);

      const emendas = emendasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const despesas = despesasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const usuarios = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 🔍 Despesas órfãs (sem emenda vinculada)
      const emendasIds = new Set(emendas.map(e => e.id));
      const despesasOrfas = despesas.filter(d => !emendasIds.has(d.emendaId)).length;

      // 🔍 Emendas sem despesas
      const despesasPorEmenda = despesas.reduce((acc, d) => {
        acc[d.emendaId] = (acc[d.emendaId] || 0) + 1;
        return acc;
      }, {});
      const emendasSemDespesas = emendas.filter(e => !despesasPorEmenda[e.id]).length;

      // 🔍 Campos obrigatórios faltando
      const camposFaltando = emendas.filter(e => 
        !e.numeroEmenda || !e.municipio || !e.uf || !e.valorTotal
      ).length + despesas.filter(d => 
        !d.descricao || !d.valor || !d.emendaId
      ).length;

      // 🔍 Inconsistências financeiras
      const inconsistenciasFinanceiras = emendas.filter(e => {
        const valorExecutado = e.valorExecutado || 0;
        const valorTotal = e.valorTotal || 0;
        return valorExecutado > valorTotal || valorExecutado < 0;
      }).length;

      // 2️⃣ PERFORMANCE
      const totalDocumentos = emendas.length + despesas.length + usuarios.length + logs.length;
      const storageEstimado = ((JSON.stringify([...emendas, ...despesas]).length) / 1024).toFixed(2);

      const fim = performance.now();
      const tempoMedioResposta = ((fim - inicio) / 1000).toFixed(2);

      // 3️⃣ SEGURANÇA
      const agora = new Date();
      const umDiaAtras = new Date(agora - 24 * 60 * 60 * 1000);

      const alteracoesCriticas24h = logs.filter(log => {
        const logDate = log.timestamp?.toDate?.() || new Date(0);
        return logDate > umDiaAtras && (
          log.action?.includes('DELETE') || 
          log.action?.includes('UPDATE_USER')
        );
      }).length;

      const tentativasAcessoNegado = logs.filter(log => 
        log.success === false
      ).length;

      const usuariosElevados = usuarios.filter(u => 
        u.tipo === 'admin' || u.superAdmin === true
      ).length;

      const logsErro = logs
        .filter(log => log.success === false)
        .slice(0, 5)
        .map(log => ({
          acao: log.action,
          usuario: log.userEmail,
          erro: log.errorMessage,
          timestamp: log.timestamp?.toDate?.()?.toLocaleString('pt-BR') || 'N/A',
        }));

      // 4️⃣ ESTRUTURA
      const documentosMalformados = [];
      
      emendas.forEach(e => {
        if (typeof e.valorTotal !== 'number' && e.valorTotal) {
          documentosMalformados.push({
            tipo: 'emenda',
            id: e.id,
            campo: 'valorTotal',
            problema: `Tipo inválido: ${typeof e.valorTotal}`,
          });
        }
      });

      despesas.forEach(d => {
        if (typeof d.valor !== 'number' && d.valor) {
          documentosMalformados.push({
            tipo: 'despesa',
            id: d.id,
            campo: 'valor',
            problema: `Tipo inválido: ${typeof d.valor}`,
          });
        }
      });

      setMetricas({
        integridade: {
          despesasOrfas,
          emendasSemDespesas,
          camposObrigatoriosFaltando: camposFaltando,
          inconsistenciasFinanceiras,
        },
        performance: {
          totalDocumentos,
          storageEstimado: `${storageEstimado} KB`,
          tempoMedioResposta: `${tempoMedioResposta}s`,
        },
        seguranca: {
          tentativasAcessoNegado,
          alteracoesCriticas24h,
          usuariosElevados,
          logsErro,
        },
        estrutura: {
          documentosMalformados,
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
        <h2>🔧 Análises Técnicas do Sistema</h2>
        <p className="tab-descricao">
          Métricas de integridade, performance, segurança e estrutura de dados.
        </p>
        <button onClick={analisarSistema} className="btn-refresh">
          🔄 Atualizar Análises
        </button>
      </div>

      <div className="analises-container">
        {/* 1️⃣ INTEGRIDADE DE DADOS */}
        <div className="analise-secao">
          <h3>🔍 Integridade de Dados</h3>
          <div className="analise-cards">
            <div className={`analise-item ${metricas.integridade.despesasOrfas > 0 ? 'warning' : ''}`}>
              <span className="analise-label">Despesas Órfãs (sem emenda)</span>
              <span className="analise-valor">{metricas.integridade.despesasOrfas}</span>
            </div>
            <div className={`analise-item ${metricas.integridade.emendasSemDespesas > 10 ? 'warning' : ''}`}>
              <span className="analise-label">Emendas sem Despesas</span>
              <span className="analise-valor">{metricas.integridade.emendasSemDespesas}</span>
            </div>
            <div className={`analise-item ${metricas.integridade.camposObrigatoriosFaltando > 0 ? 'error' : ''}`}>
              <span className="analise-label">Campos Obrigatórios Faltando</span>
              <span className="analise-valor">{metricas.integridade.camposObrigatoriosFaltando}</span>
            </div>
            <div className={`analise-item ${metricas.integridade.inconsistenciasFinanceiras > 0 ? 'error' : ''}`}>
              <span className="analise-label">Inconsistências Financeiras</span>
              <span className="analise-valor">{metricas.integridade.inconsistenciasFinanceiras}</span>
            </div>
          </div>
        </div>

        {/* 2️⃣ PERFORMANCE */}
        <div className="analise-secao">
          <h3>⚡ Performance & Disponibilidade</h3>
          <div className="analise-cards">
            <div className="analise-item">
              <span className="analise-label">Total de Documentos</span>
              <span className="analise-valor">{metricas.performance.totalDocumentos}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Storage Estimado</span>
              <span className="analise-valor">{metricas.performance.storageEstimado}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Tempo de Análise Completa</span>
              <span className="analise-valor">{metricas.performance.tempoMedioResposta}</span>
            </div>
          </div>
        </div>

        {/* 3️⃣ SEGURANÇA */}
        <div className="analise-secao">
          <h3>🔒 Segurança & Auditoria</h3>
          <div className="analise-cards">
            <div className={`analise-item ${metricas.seguranca.tentativasAcessoNegado > 0 ? 'warning' : ''}`}>
              <span className="analise-label">Tentativas de Acesso Negado</span>
              <span className="analise-valor">{metricas.seguranca.tentativasAcessoNegado}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Alterações Críticas (24h)</span>
              <span className="analise-valor">{metricas.seguranca.alteracoesCriticas24h}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Usuários com Permissões Elevadas</span>
              <span className="analise-valor">{metricas.seguranca.usuariosElevados}</span>
            </div>
          </div>

          {metricas.seguranca.logsErro.length > 0 && (
            <div className="logs-erro-section">
              <h4>❌ Últimos Erros Registrados:</h4>
              <div className="logs-erro-table">
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
                    {metricas.seguranca.logsErro.map((log, idx) => (
                      <tr key={idx}>
                        <td>{log.timestamp}</td>
                        <td>{log.acao}</td>
                        <td>{log.usuario}</td>
                        <td style={{ color: '#dc3545' }}>{log.erro || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 4️⃣ ESTRUTURA */}
        <div className="analise-secao full-width">
          <h3>🏗️ Estrutura de Dados</h3>
          {metricas.estrutura.documentosMalformados.length > 0 ? (
            <div className="docs-malformados">
              <h4>⚠️ Documentos Malformados ({metricas.estrutura.documentosMalformados.length}):</h4>
              <div className="malformados-table">
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
                    {metricas.estrutura.documentosMalformados.slice(0, 10).map((doc, idx) => (
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
          ) : (
            <div className="status-ok">
              ✅ Nenhum documento malformado detectado
            </div>
          )}
        </div>
      </div>

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

        .analises-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .analise-secao {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .analise-secao.full-width {
          grid-column: 1 / -1;
        }

        .analise-secao h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #2d3748;
        }

        .analise-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .analise-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid #cbd5e1;
          transition: all 0.2s;
        }

        .analise-item:hover {
          background: #edf2f7;
        }

        .analise-item.warning {
          border-left-color: #f59e0b;
          background: #fef3c7;
        }

        .analise-item.error {
          border-left-color: #dc2626;
          background: #fee2e2;
        }

        .analise-label {
          font-size: 14px;
          color: #4a5568;
          font-weight: 500;
        }

        .analise-valor {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .logs-erro-section,
        .docs-malformados {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .logs-erro-section h4,
        .docs-malformados h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #4a5568;
        }

        .logs-erro-table table,
        .malformados-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-erro-table th,
        .malformados-table th {
          background: #f7fafc;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #4a5568;
          border-bottom: 2px solid #e2e8f0;
          font-size: 12px;
        }

        .logs-erro-table td,
        .malformados-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #2d3748;
          font-size: 13px;
        }

        .status-ok {
          padding: 20px;
          text-align: center;
          color: #10b981;
          font-size: 16px;
          font-weight: 600;
        }
      `}
      </style>
    </div>
  );
}

export default AnalisesTab;
