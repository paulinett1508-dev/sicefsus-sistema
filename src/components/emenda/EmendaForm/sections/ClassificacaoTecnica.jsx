// src/components/emenda/EmendaForm/sections/ClassificacaoTecnica.jsx
// Seção "Classificação Técnica" extraída do EmendaForm
// Funcional, tipo de emenda

import React from "react";

const ClassificacaoTecnica = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // ✅ TIPOS DE EMENDA
  const tiposEmenda = [
    { value: "Individual", label: "Individual" },
    { value: "Bancada", label: "Bancada" },
    { value: "Comissão", label: "Comissão" },
  ];

  // ✅ HANDLER DE MUDANÇA
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange?.({ target: { name, value } });
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🔧</span>
        Classificação Técnica
      </legend>

      <div style={styles.formGrid}>
        {/* Funcional */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Funcional <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Classificação funcional programática da emenda"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="funcional"
            value={formData.funcional || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.funcional && styles.inputError),
              ...(!formData.funcional && styles.inputRequired),
            }}
            disabled={disabled}
            placeholder="Ex: 10.301.0001.20TP"
            required
          />
          {fieldErrors.funcional && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Tipo de Emenda */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Tipo de Emenda
            <span
              style={styles.infoIcon}
              title="Tipo de emenda conforme origem parlamentar"
            >
              ℹ️
            </span>
          </label>
          <select
            name="tipo"
            value={formData.tipo || "Individual"}
            onChange={handleInputChange}
            style={{
              ...styles.select,
              ...(fieldErrors.tipo && styles.inputError),
            }}
            disabled={disabled}
          >
            {tiposEmenda.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Informações técnicas */}
      <div style={styles.infoBox}>
        <div style={styles.infoTitle}>
          <span style={styles.infoIcon}>📋</span>
          Informações sobre Classificação
        </div>
        <div style={styles.infoContent}>
          <div style={styles.infoItem}>
            <strong>Individual:</strong> Emenda de parlamentar individual
            (Deputado ou Senador)
          </div>
          <div style={styles.infoItem}>
            <strong>Bancada:</strong> Emenda de bancada estadual ou regional
          </div>
          <div style={styles.infoItem}>
            <strong>Comissão:</strong> Emenda de comissão permanente do
            Congresso Nacional
          </div>
          <div style={styles.infoItem}>
            <strong>Funcional:</strong> Código que identifica a função,
            subfunção, programa e ação orçamentária
          </div>
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS EXTRAÍDOS DO ORIGINAL
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
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  inputError: {
    borderColor: "#dc3545",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  inputRequired: {
    borderColor: "#ff6b6b",
    boxShadow: "0 0 0 1px rgba(255, 107, 107, 0.3)",
    backgroundColor: "#fff5f5",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "20px",
  },
  infoTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
    color: "#495057",
    marginBottom: "12px",
    fontSize: "14px",
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
  infoContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoItem: {
    fontSize: "13px",
    color: "#6c757d",
    lineHeight: "1.4",
  },
};

export default ClassificacaoTecnica;