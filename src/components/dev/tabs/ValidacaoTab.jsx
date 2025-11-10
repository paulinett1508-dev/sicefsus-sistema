import React from "react";

function ValidacaoTab() {
  return (
    <div className="tab-validacao">
      <div className="tab-header">
        <h2>✅ Validação & Integridade</h2>
        <p className="tab-descricao">
          Verificar e validar dados críticos do sistema.
        </p>
      </div>

      <div className="validacoes-grid">
        <div className="validacao-card">
          <div className="validacao-status pendente">⏳</div>
          <h3>Auditoria Completa</h3>
          <p>Rastreio de quem criou/editou registros</p>
          <div className="validacao-info">
            <span>--- registros</span>
            <button disabled>Gerar Relatório</button>
          </div>
        </div>

        <div className="validacao-card">
          <div className="validacao-status pendente">⏳</div>
          <h3>Integridade Referencial</h3>
          <p>Verificar relacionamentos entre dados</p>
          <div className="validacao-info">
            <span>--- erros</span>
            <button disabled>Verificar</button>
          </div>
        </div>
      </div>

      <style>
        {`
        .tab-validacao {
          padding: 30px;
          background: #f8fafc;
          min-height: calc(100vh - 100px);
        }

        .tab-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .tab-header h2 {
          font-size: 28px;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .tab-descricao {
          font-size: 16px;
          color: #718096;
          max-width: 600px;
          margin: 0 auto;
        }

        .validacoes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }

        .validacao-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .validacao-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .validacao-status {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 16px;
        }

        .validacao-status.pendente {
          background: #fef3c7;
        }

        .validacao-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #2d3748;
        }

        .validacao-card p {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #718096;
          min-height: 40px;
        }

        .validacao-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .validacao-info span {
          font-size: 13px;
          color: #718096;
          font-weight: 600;
        }

        .validacao-info button {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .validacao-info button:disabled {
          background: #cbd5e0;
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}
      </style>
    </div>
  );
}

export default ValidacaoTab;