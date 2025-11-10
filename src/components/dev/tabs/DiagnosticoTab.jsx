import React, { useState } from 'react';
import DiagnosticoSistema from '../DiagnosticoSistema';
import AlertaBanner from '../shared/AlertaBanner';

/**
 * ABA: DIAGNÓSTICO DO SISTEMA
 * Integra o componente DiagnosticoSistema.jsx
 */
function DiagnosticoTab() {
  const [showDiagnostico, setShowDiagnostico] = useState(true);

  // Verificar se DiagnosticoSistema existe
  if (!DiagnosticoSistema) {
    return (
      <div className="tab-diagnostico">
        <div className="tab-header">
          <h2>🔍 Diagnóstico do Sistema</h2>
          <p className="tab-descricao">
            Identifica inconsistências, erros e problemas nos dados do sistema.
          </p>
        </div>

        <AlertaBanner
          tipo="erro"
          mensagem="Componente DiagnosticoSistema não encontrado. Verifique a estrutura do projeto."
        />
      </div>
    );
  }

  return (
    <div className="tab-diagnostico">
      <div className="tab-header">
        <h2>🔍 Diagnóstico do Sistema</h2>
        <p className="tab-descricao">
          Analisa todas as emendas do sistema em busca de inconsistências nos valores calculados vs armazenados.
        </p>
      </div>

      <AlertaBanner
        tipo="info"
        mensagem="Este diagnóstico verifica a integridade dos dados financeiros das emendas. Execute sempre que suspeitar de inconsistências nos saldos."
      />

      {showDiagnostico ? (
        <DiagnosticoSistema />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <button
            onClick={() => setShowDiagnostico(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🔍 Executar Diagnóstico
          </button>
        </div>
      )}
    </div>
  );
}

export default DiagnosticoTab;