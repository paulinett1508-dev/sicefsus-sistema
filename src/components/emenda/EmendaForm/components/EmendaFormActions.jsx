// src/components/emenda/EmendaForm/components/EmendaFormActions.jsx
// Botões de ação do formulário extraídos
// Baseado no padrão DespesaFormActions.jsx

import React from "react";
import { useEmendaFormNavigation } from "../../../../hooks/useEmendaFormNavigation";

const EmendaFormActions = ({
  modo = "criar",
  loading = false,
  modoVisualizacao = false,
  onSubmit,
  onCancel,
  hasUnsavedChanges = false,
}) => {
  const { navegarParaListaEmendas, cancelarFormulario } =
    useEmendaFormNavigation(hasUnsavedChanges);

  // ✅ HANDLER DE CANCELAMENTO
  const handleCancel = () => {
    if (onCancel && typeof onCancel === "function") {
      onCancel();
    } else {
      cancelarFormulario();
    }
  };

  // ✅ HANDLER DE VOLTAR (apenas no modo edição)
  const handleVoltar = () => {
    navegarParaListaEmendas();
  };

  // ✅ HANDLER DE SUBMIT
  const handleSubmit = (e) => {
    console.log("🖱️ Botão Submit clicado!");
    if (onSubmit && typeof onSubmit === "function") {
      onSubmit(e);
    }
  };

  return (
    <div style={styles.buttonContainer}>
      {/* Botão Voltar apenas no modo edição */}
      {modo === "editar" && (
        <button
          type="button"
          onClick={handleVoltar}
          style={styles.backButton}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#5a6268")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#6c757d")}
        >
          ← Voltar
        </button>
      )}

      {/* Botões principais (não mostrar no modo visualização) */}
      {!modoVisualizacao && (
        <>
          <button
            type="button"
            onClick={handleCancel}
            style={styles.cancelButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#c82333")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc3545")}
          >
            ❌ Cancelar
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading
              ? "Salvando..."
              : modo === "criar"
                ? "✅ Criar Emenda"
                : "✅ Atualizar Emenda"}
          </button>
        </>
      )}
    </div>
  );
};

// ✅ ESTILOS EXTRAÍDOS DO ORIGINAL
const styles = {
  buttonContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #dee2e6",
  },
  backButton: {
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
  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "#dc3545",
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

export default EmendaFormActions;
