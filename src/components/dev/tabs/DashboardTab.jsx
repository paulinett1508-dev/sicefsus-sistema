import React from 'react';

function DashboardTab() {
  const metricas = [
    { label: 'Total de Emendas', valor: '---', icone: '📊', cor: '#667eea' },
    { label: 'Total de Despesas', valor: '---', icone: '💰', cor: '#48bb78' },
    { label: 'Usuários Ativos', valor: '---', icone: '👥', cor: '#4299e1' },
    { label: 'Municípios', valor: '---', icone: '🏙️', cor: '#f6ad55' },
  ];

  return (
    <div className="tab-dashboard">
      <div className="tab-header">
        <h2>📊 Dashboard Administrativo</h2>
        <p className="tab-descricao">
          Visão global da saúde financeira do sistema.
        </p>
      </div>

      <div className="metricas-grid">
        {metricas.map((metrica, index) => (
          <div key={index} className="metrica-card" style={{ borderLeftColor: metrica.cor }}>
            <div className="metrica-icone" style={{ color: metrica.cor }}>
              {metrica.icone}
            </div>
            <div className="metrica-conteudo">
              <div className="metrica-label">{metrica.label}</div>
              <div className="metrica-valor">{metrica.valor}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="em-breve">
        <span className="icone-construcao">🚧</span>
        <h3>Dashboard em Construção</h3>
        <p>
          Aqui você verá métricas detalhadas sobre:
        </p>
        <ul>
          <li>Saúde financeira global do sistema</li>
          <li>Execução por município e UF</li>
          <li>Emendas com problemas de saldo</li>
          <li>Previsão de esgotamento de recursos</li>
          <li>Ranking de municípios</li>
        </ul>
      </div>

      <style jsx>{`
        .metricas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin: 24px 0;
        }

        .metrica-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .metrica-icone {
          font-size: 36px;
        }

        .metrica-label {
          font-size: 13px;
          color: #718096;
          margin-bottom: 4px;
        }

        .metrica-valor {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
        }

        .em-breve {
          background: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          border: 2px dashed #e2e8f0;
        }

        .icone-construcao {
          font-size: 64px;
          display: block;
          margin-bottom: 16px;
        }

        .em-breve h3 {
          margin: 0 0 12px 0;
          color: #2d3748;
        }

        .em-breve p {
          color: #718096;
          margin-bottom: 16px;
        }

        .em-breve ul {
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
          color: #4a5568;
        }

        .em-breve li {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}

export default DashboardTab;
