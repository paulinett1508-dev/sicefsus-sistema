// src/components/emenda/EmendaForm/sections/DadosBancarios.jsx
import React from "react";

const DadosBancarios = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🏦</span>
        Dados Bancários
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Banco <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Código de 3 dígitos do banco (ex: 001 - Banco do Brasil)"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="banco"
            value={formData.banco || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(fieldErrors.banco && styles.inputError),
            }}
            disabled={disabled}
            placeholder="001"
            maxLength={3}
            required
          />
          {fieldErrors.banco && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Agência <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Número da agência (sem dígito verificador)"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="agencia"
            value={formData.agencia || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(fieldErrors.agencia && styles.inputError),
            }}
            disabled={disabled}
            placeholder="024120"
            maxLength={6}
            required
          />
          {fieldErrors.agencia && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Conta <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Número da conta (com dígito verificador se houver)"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="conta"
            value={formData.conta || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(fieldErrors.conta && styles.inputError),
            }}
            disabled={disabled}
            placeholder="00002666965"
            maxLength={15}
            required
          />
          {fieldErrors.conta && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
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
    marginBottom: "20px",
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
  required: {
    color: "#dc3545",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },
  inputError: {
    border: "2px solid #dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },
  referenceBox: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "20px",
  },
  referenceTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
    color: "#495057",
    marginBottom: "10px",
    fontSize: "14px",
  },
  referenceIcon: {
    fontSize: "16px",
  },
  bankList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "8px",
  },
  bankItem: {
    fontSize: "13px",
    color: "#6c757d",
    padding: "4px 0",
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default DadosBancarios;