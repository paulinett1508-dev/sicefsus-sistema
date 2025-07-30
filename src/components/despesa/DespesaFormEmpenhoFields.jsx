// src/components/despesa/DespesaFormEmpenhoFields.jsx
// ✅ Componente especializado para campos de empenho e nota fiscal

import React from "react";

const DespesaFormEmpenhoFields = ({
  formData,
  errors,
  modoVisualizacao,
  handleInputChange,
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📄</span>
        Dados do Empenho e Nota Fiscal
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Nº do Empenho *</label>
          <input
            type="text"
            name="numeroEmpenho"
            value={formData.numeroEmpenho}
            onChange={handleInputChange}
            style={errors.numeroEmpenho ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            placeholder="Número do empenho"
            required
          />
          {errors.numeroEmpenho && (
            <span style={styles.errorText}>{errors.numeroEmpenho}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>
            Nº da Nota Fiscal *
            <span
              style={styles.infoIcon}
              title="Obrigatório - toda despesa deve ter nota fiscal"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="numeroNota"
            value={formData.numeroNota}
            onChange={handleInputChange}
            style={errors.numeroNota ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            placeholder="Número da nota fiscal"
            required
          />
          {errors.numeroNota && (
            <span style={styles.errorText}>{errors.numeroNota}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Nº do Contrato</label>
          <input
            type="text"
            name="numeroContrato"
            value={formData.numeroContrato}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Número do contrato (se houver)"
          />
        </div>
      </div>
    </fieldset>
  );
};

const styles = {
  fieldset: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid #154360",
    color: "#154360",
    fontWeight: "bold",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendIcon: {
    fontSize: "18px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  labelRequired: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  inputError: {
    padding: "12px",
    border: "2px solid #dc3545",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default DespesaFormEmpenhoFields;
