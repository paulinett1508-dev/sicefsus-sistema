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
      <RecalcularEmenda />
    </div>
  );
}

export default RecalculoTab;