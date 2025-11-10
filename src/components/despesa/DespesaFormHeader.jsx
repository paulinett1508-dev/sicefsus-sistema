// src/components/despesa/DespesaFormHeader.jsx
// ✅ Componente especializado para header do formulário de despesas

import React from "react";

const DespesaFormHeader = ({
  configModo,
  titulo,
  subtitle,
  despesaParaEditar,
  formData,
  modoVisualizacao,
  showSuccessMessage,
}) => {
  return (
    <>
      <div
        style={{
          ...styles.header,
          backgroundColor:
            configModo.modo === "visualizar" ? "#e7f3ff" : "#d4edda",
          color: configModo.modo === "visualizar" ? "#004085" : "#155724",
        }}
      >
        <h2 style={styles.headerTitle}>
          {configModo.modo === "criar"
            ? "💰 Criar Despesa"
            : configModo.modo === "editar"
              ? "📋 Informações da Despesa"
              : "📋 Informações da Despesa"}
        </h2>
        <p style={styles.headerSubtitle}>
          {titulo ||
            (configModo.modo === "criar"
              ? "Preencha todos os campos obrigatórios conforme documentação oficial"
              : subtitle ||
                (modoVisualizacao
                  ? "Detalhes da despesa da emenda"
                  : `ID: ${despesaParaEditar?.id || ""} | Fornecedor: ${formData.fornecedor || ""}`))}
        </p>
      </div>

      {showSuccessMessage && (
        <div style={styles.successMessage}>
          <span style={styles.successIcon}>✅</span>
          <span style={styles.successText}>
            {configModo.modo === "criar"
              ? "Despesa criada"
              : "Despesa atualizada"}{" "}
            com sucesso!
          </span>
        </div>
      )}
    </>
  );
};

const styles = {
  header: {
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    border: "2px solid #dee2e6",
  },
  headerTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    fontWeight: "bold",
  },
  headerSubtitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    opacity: 0.8,
  },
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #c3e6cb",
    marginBottom: "20px",
  },
  successIcon: {
    fontSize: "20px",
  },
  successText: {
    fontWeight: "bold",
  },
};

export default DespesaFormHeader;
