// src/components/emenda/EmendaForm/sections/ClassificacaoTecnica.jsx
import React from "react";

const ClassificacaoTecnica = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🏛️</span>
        Classificação Técnica
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Funcional Programática <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="funcionalProgramatica"
            value={formData.funcionalProgramatica || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(fieldErrors.funcionalProgramatica && styles.inputError),
            }}
            disabled={disabled}
            placeholder="Ex: 10.301.0001.2001"
            required
          />
          {fieldErrors.funcionalProgramatica && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Tipo de Aplicação</label>
          <select
            name="tipoAplicacao"
            value={formData.tipoAplicacao || ""}
            onChange={onChange}
            style={styles.input}
            disabled={disabled}
          >
            <option value="">Selecione</option>
            <option value="direta">Aplicação Direta</option>
            <option value="transferencia">Transferência</option>
          </select>
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

export default ClassificacaoTecnica;