import React from 'react';
import RecalcularEmenda from '../RecalcularEmenda';

/**
 * ABA 1: RECÁLCULO DE EMENDAS
 * 
 * Wrapper que importa o componente RecalcularEmenda.jsx existente.
 * Este componente já está funcional e testado.
 */
function RecalculoTab() {
  return (
    <div className="tab-recalculo">
      <div className="tab-header">
        <h2>🔄 Recálculo de Emendas</h2>
        <p className="tab-descricao">
          Recalcule valores de emendas individuais ou em massa. 
          Útil para corrigir inconsistências entre valores executados e saldos disponíveis.
        </p>
      </div>

      <RecalcularEmenda />
    </div>
  );
}

export default RecalculoTab;