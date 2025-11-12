import React from 'react';
import RecalcularEmenda from '../RecalcularEmenda';
import AlertaBanner from '../shared/AlertaBanner';

/**
 * ABA: DIAGNÓSTICO E RECÁLCULO UNIFICADO
 * Une as funcionalidades de diagnóstico e recálculo em uma única interface
 */
function DiagnosticoTab() {
  return (
    <div className="tab-diagnostico">
      <div className="tab-header">
        <h2>🔍 Diagnóstico e Recálculo de Emendas</h2>
        <p className="tab-descricao">
          Identifique inconsistências nos valores das emendas e corrija-as em um único lugar.
        </p>
      </div>

      <AlertaBanner
        tipo="info"
        mensagem="Esta ferramenta verifica a integridade dos dados financeiros das emendas e permite corrigir inconsistências encontradas."
      />

      <RecalcularEmenda />
    </div>
  );
}

export default DiagnosticoTab;