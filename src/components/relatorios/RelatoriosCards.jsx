// src/components/relatorios/RelatoriosCards.jsx
import React from "react";
import { TIPOS_RELATORIOS } from "../../utils/relatoriosConstants";
import "../../styles/relatorios.css";

export default function RelatoriosCards({ onSelectReport }) {
  return (
    <div className="relatorios-cards-grid">
      {TIPOS_RELATORIOS.map((tipo) => (
        <div
          key={tipo.id}
          className="relatorios-card"
          style={{ borderTop: `4px solid ${tipo.cor}` }}
          onClick={() => onSelectReport(tipo)}
        >
          <div className="relatorios-card-icon">{tipo.icone}</div>
          <h3 className="relatorios-card-title">{tipo.titulo}</h3>
          <p className="relatorios-card-description">{tipo.descricao}</p>
          <button
            className="relatorios-select-btn"
            style={{ backgroundColor: tipo.cor }}
          >
            Selecionar
          </button>
        </div>
      ))}
    </div>
  );
}
