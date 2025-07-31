// src/components/emenda/EmendaForm/sections/AcoesServicos.jsx
import React from "react";

const AcoesServicos = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>⚙️</span>
        Ações e Serviços
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Ações e Serviços</label>
          <textarea
            name="acoesServicos"
            value={formData.acoesServicos || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              minHeight: "100px",
              resize: "vertical",
            }}
            disabled={disabled}
            placeholder="Descreva as ações e serviços relacionados à emenda"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Outros Valores</label>
          <input
            type="text"
            name="outrosValores"
            value={formData.outrosValores || ""}
            onChange={onChange}
            style={styles.input}
            disabled={disabled}
            placeholder="R$ 0,00"
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
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },
};

export default AcoesServicos;