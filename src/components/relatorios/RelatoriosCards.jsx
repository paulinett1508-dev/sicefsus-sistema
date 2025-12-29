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
          style={{ borderLeft: `4px solid ${tipo.cor}` }}
          onClick={() => onSelectReport(tipo)}
        >
          <div className="relatorios-card-icon" style={{ color: tipo.cor }}>
            <span className="material-symbols-outlined">{tipo.icone}</span>
          </div>
          <div className="relatorios-card-content">
            <h3 className="relatorios-card-title">{tipo.titulo}</h3>
            <p className="relatorios-card-description">{tipo.descricao}</p>
          </div>
          <button
            className="relatorios-select-btn"
            style={{ backgroundColor: tipo.cor }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>
      ))}
    </div>
  );
}
