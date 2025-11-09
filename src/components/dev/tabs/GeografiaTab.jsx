import React from 'react';

function GeografiaTab() {
  const regioes = [
    { uf: 'CE', municipios: '--', emendas: '--', executado: 'R$ ---', icone: '🏖️' },
    { uf: 'SP', municipios: '--', emendas: '--', executado: 'R$ ---', icone: '🏙️' },
    { uf: 'RJ', municipios: '--', emendas: '--', executado: 'R$ ---', icone: '🌊' },
    { uf: 'BA', municipios: '--', emendas: '--', executado: 'R$ ---', icone: '🌴' },
    { uf: 'PE', municipios: '--', emendas: '--', executado: 'R$ ---', icone: '🎭' },
  ];

  return (
    <div className="tab-geografia">
      <div className="tab-header">
        <h2>🗺️ Visão Geográfica</h2>
        <p className="tab-descricao">
          Análise de execução de emendas por região, estado e município.
        </p>
      </div>

      <div className="geografia-content">
        <div className="mapa-section">
          <h3>Mapa de Calor de Recursos</h3>
          <div className="mapa-placeholder">
            <span className="icone-mapa">🗺️</span>
            <p>Mapa interativo do Brasil</p>
            <small>Visualização geográfica em desenvolvimento</small>
          </div>
        </div>

        <div className="ranking-section">
          <h3>🏆 Ranking por Estado</h3>
          <div className="ranking-lista">
            {regioes.map((regiao, index) => (
              <div key={regiao.uf} className="ranking-item">
                <div className="ranking-posicao">#{index + 1}</div>
                <div className="ranking-icone">{regiao.icone}</div>
                <div className="ranking-info">
                  <div className="ranking-uf">{regiao.uf}</div>
                  <div className="ranking-stats">
                    {regiao.municipios} municípios • {regiao.emendas} emendas
                  </div>
                </div>
                <div className="ranking-valor">{regiao.executado}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="municipios-section">
          <h3>📊 Top Municípios</h3>
          <div className="em-construcao">
            <span>🏗️</span>
            <p>Ranking de municípios por execução</p>
          </div>
        </div>

        <div className="distribuicao-section">
          <h3>📈 Distribuição Regional</h3>
          <div className="em-construcao">
            <span>📊</span>
            <p>Gráfico de distribuição de recursos</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .geografia-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }

        .mapa-section,
        .ranking-section,
        .municipios-section,
        .distribuicao-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .mapa-section {
          grid-column: 1 / -1;
        }

        h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #2d3748;
        }

        .mapa-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%);
          border-radius: 8px;
          border: 2px dashed #e2e8f0;
        }

        .icone-mapa {
          font-size: 80px;
          margin-bottom: 16px;
        }

        .mapa-placeholder p {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .mapa-placeholder small {
          color: #718096;
          font-size: 13px;
        }

        .ranking-lista {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .ranking-item:hover {
          background: #edf2f7;
          transform: translateX(4px);
        }

        .ranking-posicao {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #667eea;
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 700;
        }

        .ranking-icone {
          font-size: 24px;
        }

        .ranking-info {
          flex: 1;
        }

        .ranking-uf {
          font-size: 16px;
          font-weight: 700;
          color: #2d3748;
        }

        .ranking-stats {
          font-size: 12px;
          color: #718096;
        }

        .ranking-valor {
          font-size: 16px;
          font-weight: 700;
          color: #48bb78;
        }

        .em-construcao {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: #f7fafc;
          border-radius: 8px;
          border: 2px dashed #e2e8f0;
        }

        .em-construcao span {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .em-construcao p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default GeografiaTab;
