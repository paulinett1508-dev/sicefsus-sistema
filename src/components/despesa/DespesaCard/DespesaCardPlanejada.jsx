// components/despesa/DespesaCard/DespesaCardPlanejada.jsx
import React from "react";
import { despesaCardStyles } from "./despesaCardStyles";

const DespesaCardPlanejada = ({ numero, descricao, valor, onClick }) => {
  return (
    <div
      style={despesaCardStyles.despesaCard}
      onClick={onClick}
      onMouseEnter={(e) => {
        Object.assign(
          e.currentTarget.style,
          despesaCardStyles.despesaCardHover,
        );
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={despesaCardStyles.despesaCardHeader}>
        <span style={despesaCardStyles.despesaNumero}>#{numero}</span>
        <span style={despesaCardStyles.despesaStatusPlanejada}>
          <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#F59E0B", marginRight: 4, verticalAlign: "middle" }}>schedule</span>
          <strong>PLANEJADA</strong>
        </span>
      </div>
      <div style={despesaCardStyles.despesaDescricao}>{descricao}</div>
      <div style={despesaCardStyles.despesaValor}>
        <strong>{valor}</strong>
      </div>
    </div>
  );
};

export default DespesaCardPlanejada;
