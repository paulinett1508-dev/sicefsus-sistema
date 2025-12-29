// src/components/despesa/DespesaFormEmpenhoFields.jsx
// ✅ CORRIGIDO: Inputs controlados com || ''

import React from "react";
import { useTheme } from "../../context/ThemeContext";

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
            value={formData.numeroEmpenho || ""}
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
            value={formData.numeroNota || ""}
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
            value={formData.numeroContrato || ""}
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
    border: "1px solid var(--theme-border, #E2E8F0)",
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: "var(--theme-surface, #ffffff)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  legend: {
    background: "var(--theme-surface, white)",
    padding: "6px 16px",
    borderRadius: "9999px",
    border: "1px solid var(--theme-border, #E2E8F0)",
    color: "var(--theme-text, #334155)",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Inter', sans-serif",
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
    color: "var(--theme-text, #333)",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  labelRequired: {
    fontWeight: "bold",
    color: "var(--theme-text, #333)",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  input: {
    padding: "12px",
    border: "2px solid var(--theme-border, #dee2e6)",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "var(--theme-input-bg, white)",
    color: "var(--theme-text, inherit)",
    boxSizing: "border-box",
  },
  inputError: {
    padding: "12px",
    border: "2px solid #dc3545",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "var(--theme-input-bg, white)",
    color: "var(--theme-text, inherit)",
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
