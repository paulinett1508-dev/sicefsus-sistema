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
            ? <><span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>hourglass_empty</span> Salvando...</>
            : configModo.modo === "criar"
              ? <><span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>check_circle</span> Criar Despesa</>
              : <><span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>check_circle</span> Atualizar Despesa</>}
        </button>
      )}
    </div>
  );
};

const styles = {
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelButtonStyle: {
    backgroundColor: '#95a5a6',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  submitButton: {
    backgroundColor: '#10B981',
    color: 'white',
    padding: '12px 32px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
  },
};

export default DespesaFormActions;
