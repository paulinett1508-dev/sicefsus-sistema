// components/despesa/DespesaCard/DespesaCardExecutada.jsx
import React from "react";
import { despesaCardStyles } from "./despesaCardStyles";

const DespesaCardExecutada = ({
  numero,
  descricao,
  valor,
  empenho,
  data,
  natureza,
  onClick,
}) => {
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
        <span style={despesaCardStyles.despesaStatusExecutada}>
          <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#22c55e", marginRight: 4, verticalAlign: "middle" }}>check_circle</span>
          <strong>EXECUTADA</strong>
        </span>
      </div>
      <div style={despesaCardStyles.despesaDescricao}>{descricao}</div>
      <div style={despesaCardStyles.despesaValor}>
        <strong>{valor}</strong>
      </div>
      <div style={despesaCardStyles.despesaInfoExtra}>
        Empenho: {empenho} • {data} • {natureza}
      </div>
    </div>
  );
};

export default DespesaCardExecutada;
