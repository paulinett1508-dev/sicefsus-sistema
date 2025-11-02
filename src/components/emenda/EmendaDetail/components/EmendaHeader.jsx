// components/emenda/EmendaDetail/components/EmendaHeader.jsx
import React from "react";
import { emendaDetailStyles } from "../styles/emendaDetailStyles";

const EmendaHeader = ({
  emenda,
  status,
  formatDate,
  onVoltar,
  onEditarEmenda,
}) => {
  return (
    <div style={emendaDetailStyles.header}>
      <div style={emendaDetailStyles.headerContent}>
        <div style={emendaDetailStyles.headerInfo}>
          <h1 style={emendaDetailStyles.headerTitle}>
            {emenda.numero} - {emenda.parlamentar}
          </h1>
          <p style={emendaDetailStyles.headerSubtitle}>
            {emenda.objetoProposta || "Sem descrição"}
          </p>
          <div style={emendaDetailStyles.headerMeta}>
            <span style={emendaDetailStyles.metaItem}>
              📍 {emenda.municipio}, {emenda.uf}
            </span>
            <span style={emendaDetailStyles.metaItem}>
              📅 Validade: {formatDate(emenda.validade || emenda.dataValidada)}
            </span>
            <span
              style={{
                ...emendaDetailStyles.statusBadge,
                backgroundColor: status.color,
              }}
            >
              {status.icon} {status.text}
            </span>
          </div>
        </div>
        <div style={emendaDetailStyles.headerActions}>
          <button onClick={onVoltar} style={emendaDetailStyles.btnSecondary}>
            ← Voltar
          </button>
          <button
            onClick={() => onEditarEmenda(emenda)}
            style={emendaDetailStyles.btnPrimary}
          >
            ✏️ Editar Emenda
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmendaHeader;
