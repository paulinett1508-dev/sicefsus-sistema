// src/components/despesa/DespesaFormActions.jsx
// ✅ Componente especializado para botões de ação do formulário

import React from "react";

const DespesaFormActions = ({
  onCancelar,
  loading,
  modoVisualizacao,
  configModo,
}) => {
  return (
    <div style={styles.buttonContainer}>
      <button
        type="button"
        onClick={onCancelar}
        style={styles.cancelButtonStyle}
        disabled={loading}
      >
        ← Voltar
      </button>

      {!modoVisualizacao && (
        <button
          type="submit"
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading
            ? "⏳ Salvando..."
            : configModo.modo === "criar"
              ? "✅ Criar Despesa"
              : "✅ Atualizar Despesa"}
        </button>
      )}
    </div>
  );
};

const styles = {
  buttonContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #dee2e6",
  },
  cancelButtonStyle: {
    padding: "12px 24px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  submitButton: {
    padding: "12px 24px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default DespesaFormActions;
