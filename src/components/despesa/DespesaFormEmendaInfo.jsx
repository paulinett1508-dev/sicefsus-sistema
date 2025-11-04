// src/components/despesa/DespesaFormEmendaInfo.jsx
// ✅ Componente especializado para exibir informações da emenda selecionada
// ✅ ATUALIZADO 04/11/2025: Labels normais, valores em negrito

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
          <span style={styles.label}>Parlamentar:</span>{" "}
          <strong style={styles.value}>{parlamentar}</strong>
        </div>
        <div style={styles.emendaInfoRow}>
          <span style={styles.label}>Número:</span>{" "}
          <strong style={styles.value}>{numero}</strong>
        </div>
        <div style={styles.emendaInfoRow}>
          <span style={styles.label}>Tipo:</span>{" "}
          <strong style={styles.value}>{tipo}</strong>
        </div>
        <div style={styles.emendaInfoRow}>
          <span style={styles.label}>Município:</span>{" "}
          <strong style={styles.value}>
            {municipio}
            {uf ? `/${uf}` : ""}
          </strong>
        </div>
        <div style={styles.emendaInfoRow}>
          <span style={styles.label}>Valor Total:</span>{" "}
          <strong style={styles.value}>
            {typeof valorRecurso === "number"
              ? valorRecurso.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : `R$ ${valorRecurso}`}
          </strong>
        </div>
        <div style={styles.emendaInfoRow}>
          <span style={styles.label}>Saldo Disponível:</span>{" "}
          <strong style={styles.value}>
            {typeof saldoDisponivel === "number"
              ? saldoDisponivel.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : `R$ ${saldoDisponivel}`}
          </strong>
        </div>
        <div style={styles.emendaInfoRow}>
          <span style={styles.label}>Programa:</span>{" "}
          <strong style={styles.value}>{programa}</strong>
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
  label: {
    fontWeight: "normal", // ✅ Labels normais
  },
  value: {
    fontWeight: "bold", // ✅ Valores em negrito
  },
};

export default DespesaFormEmendaInfo;
