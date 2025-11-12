
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { formatarMoeda } from '../../../utils/formatters';

function AnalisesTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    performance: {
      totalEmendas: 0,
      totalDespesas: 0,
      valorTotalEmendas: 0,
      valorTotalExecutado: 0,
      taxaExecucao: 0,
    },
    atividade: {
      loginsHoje: 0,
      usuariosAtivos7d: 0,
      emendasCriadas30d: 0,
      despesasExecutadas30d: 0,
    },
    topMunicipios: [],
    topUsuarios: [],
    execucaoPorMes: [],
  });

  useEffect(() => {
    carregarAnalises();
  }, []);

  const carregarAnalises = async () => {
    setLoading(true);
    try {
      // 1️⃣ Dados de Performance
      const [emendasSnap, despesasSnap] = await Promise.all([
        getDocs(collection(db, 'emendas')),
        getDocs(collection(db, 'despesas')),
      ]);

      const emendas = emendasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const despesas = despesasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const valorTotalEmendas = emendas.reduce((sum, e) => sum + (e.valorTotal || 0), 0);
      const valorTotalExecutado = emendas.reduce((sum, e) => sum + (e.valorExecutado || 0), 0);
      const taxaExecucao = valorTotalEmendas > 0 
        ? (valorTotalExecutado / valorTotalEmendas) * 100 
        : 0;

      // 2️⃣ Atividade Recente
      const agora = new Date();
      const umDiaAtras = new Date(agora - 24 * 60 * 60 * 1000);
      const seteDiasAtras = new Date(agora - 7 * 24 * 60 * 60 * 1000);
      const trintaDiasAtras = new Date(agora - 30 * 24 * 60 * 60 * 1000);

      const usuariosSnap = await getDocs(collection(db, 'usuarios'));
      const usuarios = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const loginsHoje = usuarios.filter(u => {
        const ultimoAcesso = u.ultimoAcesso?.toDate?.() || new Date(0);
        return ultimoAcesso > umDiaAtras;
      }).length;

      const usuariosAtivos7d = usuarios.filter(u => {
        const ultimoAcesso = u.ultimoAcesso?.toDate?.() || new Date(0);
        return ultimoAcesso > seteDiasAtras;
      }).length;

      const emendasCriadas30d = emendas.filter(e => {
        const dataCriacao = e.dataCriacao?.toDate?.() || new Date(0);
        return dataCriacao > trintaDiasAtras;
      }).length;

      const despesasExecutadas30d = despesas.filter(d => {
        const dataExecucao = d.dataExecucao?.toDate?.();
        return dataExecucao && dataExecucao > trintaDiasAtras;
      }).length;

      // 3️⃣ Top Municípios por Execução
      const execucaoPorMunicipio = {};
      emendas.forEach(emenda => {
        const municipio = emenda.municipio || 'Não informado';
        if (!execucaoPorMunicipio[municipio]) {
          execucaoPorMunicipio[municipio] = {
            municipio,
            totalEmendas: 0,
            valorExecutado: 0,
          };
        }
        execucaoPorMunicipio[municipio].totalEmendas++;
        execucaoPorMunicipio[municipio].valorExecutado += emenda.valorExecutado || 0;
      });

      const topMunicipios = Object.values(execucaoPorMunicipio)
        .sort((a, b) => b.valorExecutado - a.valorExecutado)
        .slice(0, 5);

      // 4️⃣ Top Usuários por Atividade
      const atividadePorUsuario = {};
      [...emendas, ...despesas].forEach(item => {
        const usuario = item.criadoPor || 'Sistema';
        if (!atividadePorUsuario[usuario]) {
          atividadePorUsuario[usuario] = {
            usuario,
            totalAcoes: 0,
          };
        }
        atividadePorUsuario[usuario].totalAcoes++;
      });

      const topUsuarios = Object.values(atividadePorUsuario)
        .sort((a, b) => b.totalAcoes - a.totalAcoes)
        .slice(0, 5);

      // 5️⃣ Execução por Mês (últimos 6 meses)
      const execucaoPorMes = [];
      for (let i = 5; i >= 0; i--) {
        const mesData = new Date();
        mesData.setMonth(mesData.getMonth() - i);
        const mesNome = mesData.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        const despesasDoMes = despesas.filter(d => {
          const dataExecucao = d.dataExecucao?.toDate?.();
          if (!dataExecucao) return false;
          return dataExecucao.getMonth() === mesData.getMonth() &&
                 dataExecucao.getFullYear() === mesData.getFullYear();
        });

        const valorMes = despesasDoMes.reduce((sum, d) => sum + (d.valor || 0), 0);
        execucaoPorMes.push({ mes: mesNome, valor: valorMes, quantidade: despesasDoMes.length });
      }

      setStats({
        performance: {
          totalEmendas: emendas.length,
          totalDespesas: despesas.length,
          valorTotalEmendas,
          valorTotalExecutado,
          taxaExecucao,
        },
        atividade: {
          loginsHoje,
          usuariosAtivos7d,
          emendasCriadas30d,
          despesasExecutadas30d,
        },
        topMunicipios,
        topUsuarios,
        execucaoPorMes,
      });

    } catch (error) {
      console.error('❌ Erro ao carregar análises:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Carregando análises...</p>
      </div>
    );
  }

  return (
    <div className="tab-analises">
      <div className="tab-header">
        <h2>📈 Análises & Estatísticas do Sistema</h2>
        <p className="tab-descricao">
          Análises em tempo real sobre uso, performance e dados do sistema.
        </p>
        <button onClick={carregarAnalises} className="btn-refresh">
          🔄 Atualizar Dados
        </button>
      </div>

      <div className="analises-container">
        {/* Performance Geral */}
        <div className="analise-secao">
          <h3>📊 Performance do Sistema</h3>
          <div className="analise-cards">
            <div className="analise-item">
              <span className="analise-label">Total de Emendas</span>
              <span className="analise-valor">{stats.performance.totalEmendas}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Total de Despesas</span>
              <span className="analise-valor">{stats.performance.totalDespesas}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Valor Total Emendas</span>
              <span className="analise-valor">{formatarMoeda(stats.performance.valorTotalEmendas)}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Valor Executado</span>
              <span className="analise-valor">{formatarMoeda(stats.performance.valorTotalExecutado)}</span>
            </div>
            <div className="analise-item highlight">
              <span className="analise-label">Taxa de Execução</span>
              <span className="analise-valor">{stats.performance.taxaExecucao.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Atividade de Usuários */}
        <div className="analise-secao">
          <h3>👥 Atividade de Usuários</h3>
          <div className="analise-cards">
            <div className="analise-item">
              <span className="analise-label">Logins Hoje (24h)</span>
              <span className="analise-valor">{stats.atividade.loginsHoje}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Usuários Ativos (7d)</span>
              <span className="analise-valor">{stats.atividade.usuariosAtivos7d}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Emendas Criadas (30d)</span>
              <span className="analise-valor">{stats.atividade.emendasCriadas30d}</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Despesas Executadas (30d)</span>
              <span className="analise-valor">{stats.atividade.despesasExecutadas30d}</span>
            </div>
          </div>
        </div>

        {/* Top Municípios */}
        <div className="analise-secao full-width">
          <h3>🏆 Top 5 Municípios por Execução</h3>
          <div className="ranking-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Município</th>
                  <th>Emendas</th>
                  <th>Valor Executado</th>
                </tr>
              </thead>
              <tbody>
                {stats.topMunicipios.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.municipio}</td>
                    <td>{item.totalEmendas}</td>
                    <td>{formatarMoeda(item.valorExecutado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Usuários */}
        <div className="analise-secao full-width">
          <h3>👤 Top 5 Usuários por Atividade</h3>
          <div className="ranking-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuário</th>
                  <th>Total de Ações</th>
                </tr>
              </thead>
              <tbody>
                {stats.topUsuarios.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.usuario}</td>
                    <td>{item.totalAcoes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Execução Mensal */}
        <div className="analise-secao full-width">
          <h3>📅 Execução por Mês (Últimos 6 meses)</h3>
          <div className="grafico-barras">
            {stats.execucaoPorMes.map((mes, index) => {
              const maxValor = Math.max(...stats.execucaoPorMes.map(m => m.valor), 1);
              const altura = (mes.valor / maxValor) * 100;
              return (
                <div key={index} className="barra-container">
                  <div className="barra-info">
                    <span className="barra-valor">{formatarMoeda(mes.valor)}</span>
                    <span className="barra-qtd">({mes.quantidade} despesas)</span>
                  </div>
                  <div className="barra" style={{ height: `${altura}%` }}></div>
                  <span className="barra-label">{mes.mes}</span>
                </div>
              );
            })}
          </div>
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
          transition: all 0.2s;
        }

        .analise-item:hover {
          background: #edf2f7;
        }

        .analise-item.highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .analise-item.highlight .analise-label,
        .analise-item.highlight .analise-valor {
          color: white;
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

        .ranking-table {
          overflow-x: auto;
        }

        .ranking-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .ranking-table th {
          background: #f7fafc;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #4a5568;
          border-bottom: 2px solid #e2e8f0;
        }

        .ranking-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #2d3748;
        }

        .ranking-table tr:hover {
          background: #f7fafc;
        }

        .grafico-barras {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 300px;
          padding: 20px 0;
          gap: 12px;
        }

        .barra-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .barra-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 50px;
        }

        .barra-valor {
          font-size: 13px;
          font-weight: 700;
          color: #667eea;
        }

        .barra-qtd {
          font-size: 11px;
          color: #718096;
        }

        .barra {
          width: 100%;
          max-width: 80px;
          background: linear-gradient(to top, #667eea, #764ba2);
          border-radius: 8px 8px 0 0;
          min-height: 4px;
          transition: all 0.3s ease;
        }

        .barra:hover {
          opacity: 0.8;
        }

        .barra-label {
          font-size: 12px;
          color: #4a5568;
          font-weight: 600;
          text-transform: uppercase;
        }
      `}
      </style>
    </div>
  );
}

export default AnalisesTab;
