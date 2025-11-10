import React from 'react';

/**
 * ABA 2: LIMPEZA DE DADOS
 * 
 * Ferramentas para limpeza e manutenção dos dados:
 * - Remover despesas órfãs
 * - Detectar e remover duplicatas
 * - Migrar dados entre emendas
 */
function LimpezaTab() {
  return (
    <div className="tab-limpeza">
      <div className="tab-header">
        <h2>🧹 Limpeza de Dados</h2>
        <p className="tab-descricao">
          Ferramentas de manutenção e limpeza do banco de dados.
        </p>
      </div>

      <div className="ferramentas-grid">
        {/* Card: Despesas Órfãs */}
        <div className="ferramenta-card">
          <div className="card-icon">🗑️</div>
          <h3>Despesas Órfãs</h3>
          <p>Remover despesas sem emenda vinculada</p>
          <button className="btn-ferramenta" disabled>
            Em breve
          </button>
        </div>

        {/* Card: Duplicatas */}
        <div className="ferramenta-card">
          <div className="card-icon">📋</div>
          <h3>Detectar Duplicatas</h3>
          <p>Encontrar e remover registros duplicados</p>
          <button className="btn-ferramenta" disabled>
            Em breve
          </button>
        </div>

        {/* Card: Migração */}
        <div className="ferramenta-card">
          <div className="card-icon">🔄</div>
          <h3>Migrar Despesas</h3>
          <p>Mover despesas entre emendas</p>
          <button className="btn-ferramenta" disabled>
            Em breve
          </button>
        </div>
      </div>

      <style>
        {`
        .ferramentas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }

        .ferramenta-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .ferramenta-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          transform: translateY(-4px);
        }

        .card-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .ferramenta-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #2d3748;
        }

        .ferramenta-card p {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #718096;
        }

        .btn-ferramenta {
          padding: 10px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-ferramenta:hover:not(:disabled) {
          background: #5568d3;
          transform: scale(1.05);
        }

        .btn-ferramenta:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}
      </style>
    </div>
  );
}

export default LimpezaTab;