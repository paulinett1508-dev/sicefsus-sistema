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
          role="button"
          tabIndex={0}
          aria-label={`Selecionar relatório: ${tipo.titulo}`}
          onClick={() => onSelectReport(tipo)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectReport(tipo)}
        >
          <div className="relatorios-card-icon" style={{ color: tipo.cor }}>
            <span className="material-symbols-outlined">{tipo.icone}</span>
          </div>
          <div className="relatorios-card-content">
            <h3 className="relatorios-card-title">{tipo.titulo}</h3>
            <p className="relatorios-card-description" title={tipo.descricao}>{tipo.descricao}</p>
          </div>
          <button
            type="button"
            className="relatorios-select-btn"
            style={{ backgroundColor: tipo.cor }}
            aria-hidden="true"
            tabIndex={-1}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>
      ))}
    </div>
  );
}
