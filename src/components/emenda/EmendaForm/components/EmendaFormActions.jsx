// src/components/emenda/EmendaForm/components/EmendaFormActions.jsx
// Botões de ação do formulário extraídos
// Baseado no padrão DespesaFormActions.jsx
// ✅ CORRIGIDO: Botão Cancelar com fallback robusto

import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADICIONADO: Import direto para navegação
import { useEmendaFormNavigation } from "../../../../hooks/useEmendaFormNavigation";

const EmendaFormActions = ({
  modo = "criar",
  loading = false,
  modoVisualizacao = false,
  onSubmit,
  onCancel,
  hasUnsavedChanges = false,
}) => {
  const navigate = useNavigate(); // ✅ ADICIONADO: Navegação direta como fallback
  const { navegarParaListaEmendas, cancelarFormulario } =
    useEmendaFormNavigation(hasUnsavedChanges);

  // ✅ HANDLER DE CANCELAMENTO SIMPLIFICADO - apenas abre modal
  const handleCancel = () => {
    console.log("🖱️ Botão Cancelar clicado!");
    console.log("📊 Estado:", { hasUnsavedChanges, onCancel: !!onCancel });
    console.log("✅ Abrindo modal de confirmação");

    // Sempre usar onCancel se fornecido (que abre o modal)
    if (onCancel && typeof onCancel === "function") {
      onCancel();
    } else {
      // Fallback direto se não tem onCancel
      console.log("⚠️ Sem onCancel - navegando diretamente");
      navigate("/emendas", { replace: true });
    }
  };

  // ✅ HANDLER DE VOLTAR (apenas no modo edição)
  const handleVoltar = () => {
    console.log("🖱️ Botão Voltar clicado!");
    try {
      if (
        navegarParaListaEmendas &&
        typeof navegarParaListaEmendas === "function"
      ) {
        navegarParaListaEmendas();
      } else {
        navigate("/emendas");
      }
    } catch (error) {
      console.error("❌ Erro ao voltar:", error);
      navigate("/emendas");
    }
  };

  // ✅ HANDLER DE SUBMIT (mantido igual)
  const handleSubmit = (e) => {
    console.log("🖱️ Botão Submit clicado!");
    if (onSubmit && typeof onSubmit === "function") {
      onSubmit(e);
    }
  };

  // Determine if we are in edit mode based on the 'modo' prop
  const isEdit = modo === "editar";
  // Use 'salvando' if provided, otherwise default to 'loading' for consistency
  const salvando = loading; 

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
              opacity: salvando ? 0.6 : 1,
              cursor: salvando ? "not-allowed" : "pointer",
            }}
            disabled={salvando}
          >
            {salvando ? (
              "Processando..."
            ) : (
              isEdit ? "↻ Atualizar Emenda" : "✓ Cadastrar Emenda"
            )}
          </button>
        </>
      )}
    </div>
  );
};

// ✅ ESTILOS EXTRAÍDOS DO ORIGINAL (mantidos iguais)
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