// src/components/despesa/DespesaFormEmendaInfo.jsx
// ✅ Componente especializado para exibir informações da emenda selecionada

import React from "react";

const DespesaFormEmendaInfo = ({ emendaInfo }) => {
  return (
    <div style={styles.emendaInfo}>
      <h3 style={styles.emendaInfoTitle}>📄 Dados da Emenda Selecionada</h3>
      <div style={styles.emendaInfoGrid}>
        <div style={styles.emendaInfoRow}>
          <strong>Parlamentar:</strong> {emendaInfo.parlamentar}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Número:</strong>{" "}
          {emendaInfo.numero || emendaInfo.numeroEmenda}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Tipo:</strong> {emendaInfo.tipo || "Não informado"}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Município:</strong> {emendaInfo.municipio}/{emendaInfo.uf}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Valor Total:</strong> R${" "}
          {emendaInfo.valorRecurso?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Saldo Disponível:</strong> R${" "}
          {emendaInfo.saldoDisponivel?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Programa:</strong> {emendaInfo.programa}
        </div>
      </div>
    </div>
  );
};

const styles = {
  emendaInfo: {
    backgroundColor: "#e3f2fd",
    border: "2px solid #2196f3",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "30px",
  },
  emendaInfoTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  emendaInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  emendaInfoRow: {
    fontSize: "14px",
    color: "#1565c0",
  },
};

export default DespesaFormEmendaInfo;
