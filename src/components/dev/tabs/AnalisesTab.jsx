import React from 'react';

function AnalisesTab() {
  return (
    <div className="tab-analises">
      <div className="tab-header">
        <h2>📈 Análises & Estatísticas</h2>
        <p className="tab-descricao">
          Análises avançadas sobre o uso e performance do sistema.
        </p>
      </div>

      <div className="analises-container">
        <div className="analise-secao">
          <h3>📊 Performance do Sistema</h3>
          <div className="analise-cards">
            <div className="analise-item">
              <span className="analise-label">Queries Lentas</span>
              <span className="analise-valor">---</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Uso de Storage</span>
              <span className="analise-valor">--- MB</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Tempo Médio de Resposta</span>
              <span className="analise-valor">--- ms</span>
            </div>
          </div>
        </div>

        <div className="analise-secao">
          <h3>👥 Atividade de Usuários</h3>
          <div className="analise-cards">
            <div className="analise-item">
              <span className="analise-label">Logins Hoje</span>
              <span className="analise-valor">---</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Usuários Ativos (7d)</span>
              <span className="analise-valor">---</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Taxa de Retenção</span>
              <span className="analise-valor">---%</span>
            </div>
          </div>
        </div>

        <div className="analise-secao">
          <h3>📋 Ações no Sistema</h3>
          <div className="analise-cards">
            <div className="analise-item">
              <span className="analise-label">Emendas Criadas (30d)</span>
              <span className="analise-valor">---</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Despesas Executadas (30d)</span>
              <span className="analise-valor">---</span>
            </div>
            <div className="analise-item">
              <span className="analise-label">Relatórios Gerados (30d)</span>
              <span className="analise-valor">---</span>
            </div>
          </div>
        </div>

        <div className="analise-secao full-width">
          <h3>⏰ Horários de Maior Uso</h3>
          <div className="grafico-placeholder">
            <span className="icone-grafico">📊</span>
            <p>Gráfico de uso por horário (em desenvolvimento)</p>
          </div>
        </div>
      </div>

      <style>
        {`
        .analises-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-top: 24px;
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
        }

        .analise-label {
          font-size: 14px;
          color: #4a5568;
        }

        .analise-valor {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .grafico-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: #f7fafc;
          border-radius: 8px;
          border: 2px dashed #e2e8f0;
        }

        .icone-grafico {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .grafico-placeholder p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }
      `}
      </style>
    </div>
  );
}

export default AnalisesTab;
