// src/components/despesa/DespesaFormEmendaInfo.jsx
// ✅ Componente especializado para exibir informações da emenda selecionada

import React from "react";

const DespesaFormEmendaInfo = ({ emendaInfo }) => {
  // 🆕 Garantir que todos os dados sejam encontrados com fallbacks
  const parlamentar =
    emendaInfo?.parlamentar || emendaInfo?.autor || "Não informado";
  const numero =
    emendaInfo?.numero || emendaInfo?.numeroEmenda || "Não informado";
  const tipo = emendaInfo?.tipo || emendaInfo?.tipoEmenda || "Não informado";
  const municipio = emendaInfo?.municipio || "Não informado";
  const uf = emendaInfo?.uf || "";
  const valorRecurso = emendaInfo?.valorRecurso || emendaInfo?.valor || 0;
  const saldoDisponivel = emendaInfo?.saldoDisponivel ?? 0;
  const programa =
    emendaInfo?.programa ||
    emendaInfo?.programaSaude ||
    emendaInfo?.objeto ||
    "Não informado";

  return (
    <div style={styles.emendaInfo}>
      <h3 style={styles.emendaInfoTitle}>📋 Dados da Emenda Selecionada</h3>
      <div style={styles.emendaInfoGrid}>
        <div style={styles.emendaInfoRow}>
          <strong>Parlamentar:</strong> {parlamentar}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Número:</strong> {numero}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Tipo:</strong> {tipo}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Município:</strong> {municipio}
          {uf ? `/${uf}` : ""}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Valor Total:</strong>{" "}
          {typeof valorRecurso === "number"
            ? valorRecurso.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : `R$ ${valorRecurso}`}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Saldo Disponível:</strong>{" "}
          {typeof saldoDisponivel === "number"
            ? saldoDisponivel.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : `R$ ${saldoDisponivel}`}
        </div>
        <div style={styles.emendaInfoRow}>
          <strong>Programa:</strong> {programa}
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
