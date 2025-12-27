// src/components/despesa/DespesasBanner.jsx
// 🎯 Banner informativo de filtro por emenda
// ✅ Componente reutilizável e isolado
// ✅ Fácil manutenção

import React from "react";

export default function DespesasBanner({
  emenda,
  quantidadeDespesas,
  onLimpar,
}) {
  if (!emenda) return null;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <span style={styles.badge}>Filtro</span>

        <div style={styles.infoContainer}>
          <span style={styles.emendaNumero}>
            <strong>Emenda {emenda.numero}</strong>
          </span>

          {emenda.objeto && (
            <>
              <span style={styles.separator}>•</span>
              <span style={styles.objeto}>{emenda.objeto}</span>
            </>
          )}

          <span style={styles.separator}>•</span>
          <span style={styles.info}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>location_on</span> {emenda.municipio}/{emenda.uf}
          </span>

          <span style={styles.separator}>•</span>
          <span style={styles.info}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>payments</span> R${" "}
            {(emenda.valor || 0).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>

          <span style={styles.separator}>•</span>
          <span style={styles.info}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>analytics</span> {quantidadeDespesas} despesa(s)</span>
        </div>
      </div>

      <button onClick={onLimpar} style={styles.clearButton}>
        <span style={styles.closeIcon}>×</span>
        Limpar
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f8f9fa",
    borderLeft: "4px solid #0066cc",
    padding: "12px 20px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#495057",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    borderRadius: "0 4px 4px 0",
  },

  content: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flex: 1,
  },

  badge: {
    fontWeight: "600",
    color: "#0066cc",
    textTransform: "uppercase",
    fontSize: "12px",
    letterSpacing: "0.5px",
  },

  infoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "14px",
    flex: 1,
    flexWrap: "wrap",
  },

  emendaNumero: {
    fontSize: "14px",
  },

  objeto: {
    fontStyle: "italic",
    color: "#495057",
  },

  separator: {
    color: "#6c757d",
  },

  info: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  clearButton: {
    backgroundColor: "transparent",
    border: "1px solid #dee2e6",
    color: "#6c757d",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s ease",
  },

  closeIcon: {
    fontSize: "16px",
    lineHeight: "0",
  },
};
