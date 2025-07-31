` tags. I will pay close attention to the CSS style conflicts and the data validation errors mentioned in the intention, and I will ensure that the indentation and structure of the original code are preserved. I will also make sure that all necessary parts of the original code are included in the final code.

```
<replit_final_file>
// src/components/emenda/EmendaForm/sections/Cronograma.jsx
import React from "react";

const Cronograma = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📅</span>
        Cronograma de Execução
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Data Validada na UO <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="dataValidada"
            value={formData.dataValidada || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(fieldErrors.dataValidada && styles.inputError),
            }}
            disabled={disabled}
            required
          />
          {fieldErrors.dataValidada && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Data da OB</label>
          <input
            type="date"
            name="dataOb"
            value={formData.dataOb || ""}
            onChange={onChange}
            style={styles.input}
            disabled={disabled}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Início da Execução</label>
          <input
            type="date"
            name="inicioExecucao"
            value={formData.inicioExecucao || ""}
            onChange={onChange}
            style={styles.input}
            disabled={disabled}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Final da Execução</label>
          <input
            type="date"
            name="finalExecucao"
            value={formData.finalExecucao || ""}
            onChange={onChange}
            style={styles.input}
            disabled={disabled}
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
  // ✅ CORRIGIDO: usar border completo
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
};

export default Cronograma;