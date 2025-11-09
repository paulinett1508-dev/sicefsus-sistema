import React, { useState } from 'react';
import AlertaBanner from '../shared/AlertaBanner';

function BackupTab() {
  const [formato, setFormato] = useState('json');

  return (
    <div className="tab-backup">
      <div className="tab-header">
        <h2>📥 Backup & Export</h2>
        <p className="tab-descricao">
          Exportar dados do sistema para backup ou análise externa.
        </p>
      </div>

      <AlertaBanner
        tipo="info"
        mensagem="Sempre faça backup antes de operações críticas no sistema."
      />

      <div className="backup-section">
        <h3>Exportar Dados</h3>
        
        <div className="export-options">
          <label>
            <input
              type="radio"
              value="json"
              checked={formato === 'json'}
              onChange={(e) => setFormato(e.target.value)}
            />
            JSON (estruturado)
          </label>
          <label>
            <input
              type="radio"
              value="csv"
              checked={formato === 'csv'}
              onChange={(e) => setFormato(e.target.value)}
            />
            CSV (planilha)
          </label>
        </div>

        <div className="export-buttons">
          <button className="btn-export" disabled>
            📥 Exportar Emendas
          </button>
          <button className="btn-export" disabled>
            📥 Exportar Despesas
          </button>
          <button className="btn-export" disabled>
            📥 Exportar Usuários
          </button>
          <button className="btn-export-all" disabled>
            📦 Exportar Tudo
          </button>
        </div>
      </div>

      <style jsx>{`
        .backup-section {
          margin-top: 24px;
          padding: 24px;
          background: white;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .backup-section h3 {
          margin: 0 0 16px 0;
          color: #2d3748;
        }

        .export-options {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
        }

        .export-options label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .export-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .btn-export,
        .btn-export-all {
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-export:hover:not(:disabled) {
          border-color: #667eea;
          background: #f7fafc;
        }

        .btn-export-all {
          background: #667eea;
          color: white;
          border-color: #667eea;
          grid-column: 1 / -1;
        }

        .btn-export-all:hover:not(:disabled) {
          background: #5568d3;
        }

        .btn-export:disabled,
        .btn-export-all:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default BackupTab;
