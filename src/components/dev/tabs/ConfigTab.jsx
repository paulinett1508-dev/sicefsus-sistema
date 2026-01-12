import React, { useState } from 'react';
import AlertaBanner from '../shared/AlertaBanner';

function ConfigTab() {
  const [mostrarSensiveis, setMostrarSensiveis] = useState(false);

  const variaveis = [
    { key: 'VITE_FIREBASE_PROJECT_ID', valor: 'emendas-parlamentares-prod', sensivel: false },
    { key: 'VITE_FIREBASE_API_KEY', valor: '••••••••••••••••', sensivel: true },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', valor: 'emendas-parlamentares-prod.firebaseapp.com', sensivel: false },
    { key: 'NODE_ENV', valor: 'production', sensivel: false },
  ];

  return (
    <div className="tab-config">
      <div className="tab-header">
        <h2>⚙️ Configurações do Sistema</h2>
        <p className="tab-descricao">
          Visualizar e gerenciar configurações críticas do sistema.
        </p>
      </div>

      <AlertaBanner
        tipo="aviso"
        mensagem="Modificações nas configurações podem afetar o funcionamento do sistema. Faça backup antes de qualquer alteração."
      />

      <div className="config-sections">
        {/* Variáveis de Ambiente */}
        <div className="config-section">
          <div className="section-header">
            <h3>🔐 Variáveis de Ambiente</h3>
            <label className="toggle-sensiveis">
              <input
                type="checkbox"
                checked={mostrarSensiveis}
                onChange={(e) => setMostrarSensiveis(e.target.checked)}
              />
              <span>Mostrar valores sensíveis</span>
            </label>
          </div>

          <div className="variaveis-lista">
            {variaveis.map((variavel, index) => (
              <div key={index} className="variavel-item">
                <div className="variavel-key">
                  {variavel.sensivel && <span className="badge-sensivel">🔒</span>}
                  {variavel.key}
                </div>
                <div className="variavel-valor">
                  {variavel.sensivel && !mostrarSensiveis
                    ? '••••••••••••••••'
                    : variavel.valor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .config-sections {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 24px;
        }

        .config-section {
          background: var(--theme-surface);
          padding: 24px;
          border-radius: 12px;
          border: 1px solid var(--theme-border);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .config-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: var(--theme-text);
        }

        .toggle-sensiveis {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--theme-text-secondary);
          cursor: pointer;
        }

        .variaveis-lista {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .variavel-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--theme-hover);
          border-radius: 8px;
        }

        .variavel-key {
          font-size: 13px;
          font-weight: 600;
          color: var(--theme-text);
          font-family: monospace;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .badge-sensivel {
          font-size: 10px;
        }

        .variavel-valor {
          font-size: 13px;
          color: var(--theme-text-muted);
          font-family: monospace;
        }

        .config-opcoes {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .config-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--theme-hover);
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: var(--theme-text-secondary);
        }

        .limites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .limite-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .limite-label {
          font-size: 13px;
          color: var(--theme-text-secondary);
          font-weight: 600;
        }

        .limite-item input {
          padding: 10px 12px;
          border: 1px solid var(--theme-border);
          border-radius: 8px;
          font-size: 14px;
          background: var(--theme-surface);
          color: var(--theme-text);
        }

        .limite-item input:disabled {
          background: var(--theme-hover);
          cursor: not-allowed;
        }

        .personalizacao-opcoes {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-personalizacao {
          padding: 12px 20px;
          background: var(--theme-surface);
          border: 1px solid var(--theme-border);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          color: var(--theme-text);
        }

        .btn-personalizacao:hover:not(:disabled) {
          border-color: var(--primary);
          background: var(--theme-hover);
        }

        .btn-personalizacao:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default ConfigTab;
