// src/components/emenda/EmendaForm/components/EmendaFormActions.jsx
// ✅ MANTENDO: Lógica condicional dos botões - Voltar vs Cancelar baseado em modificações

import React from "react";
import { useNavigate } from "react-router-dom";
import { useEmendaFormNavigation } from "../../../../hooks/useEmendaFormNavigation";

const EmendaFormActions = ({
  modo = "criar",
  loading = false,
  modoVisualizacao = false,
  onSubmit,
  onCancel,
  onSimpleBack,
  hasUnsavedChanges = false,
  isEdit = false,
  salvando = false,
}) => {
  const navigate = useNavigate();
  const { navegarParaListaEmendas } =
    useEmendaFormNavigation(hasUnsavedChanges);

  console.log("🔧 EmendaFormActions - Estado:", {
    modo,
    hasUnsavedChanges,
    salvando,
    isEdit,
    modoVisualizacao,
  });

  // ✅ HANDLER: Cancelar (abre modal)
  const handleCancel = () => {
    console.log("🖱️ Botão Cancelar clicado!");
    if (onCancel && typeof onCancel === "function") {
      onCancel();
    } else {
      console.log("⚠️ Sem onCancel - navegando diretamente");
      navigate("/emendas", { replace: true });
    }
  };

  // ✅ HANDLER: Voltar (navegação direta)
  const handleVoltar = () => {
    console.log("🖱️ Botão Voltar clicado!");
    try {
      if (onSimpleBack && typeof onSimpleBack === "function") {
        onSimpleBack();
      } else if (
        navegarParaListaEmendas &&
        typeof navegarParaListaEmendas === "function"
      ) {
        navegarParaListaEmendas();
      } else {
        navigate("/emendas", { replace: true });
      }
    } catch (error) {
      console.error("❌ Erro ao voltar:", error);
      navigate("/emendas", { replace: true });
    }
  };

  // ✅ HANDLER: Submit
  const handleSubmit = (e) => {
    console.log("🖱️ Botão Submit clicado!");
    if (onSubmit && typeof onSubmit === "function") {
      onSubmit(e);
    }
  };

  // Não mostrar botões no modo visualização
  if (modoVisualizacao) {
    return null;
  }

  return (
    <div style={styles.buttonContainer}>
      {/* ✅ LÓGICA MANTIDA: Baseada no estado de modificações */}

      {/* FORMULÁRIO VAZIO: Mostrar [← Voltar] */}
      {!hasUnsavedChanges && (
        <button
          type="button"
          onClick={handleVoltar}
          style={styles.backButton}
          disabled={salvando}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#5a6268")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#6c757d")}
        >
          ← Voltar
        </button>
      )}

      {/* FORMULÁRIO PREENCHIDO: Mostrar [← Voltar] */}
      {hasUnsavedChanges && (
        <button
          type="button"
          onClick={handleCancel}
          style={styles.cancelButton}
          disabled={salvando}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#c82333")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc3545")}
        >
          ← Voltar
        </button>
      )}

      {/* BOTÃO PRINCIPAL: Sempre presente */}
      <button
        type="submit"
        onClick={handleSubmit}
        style={styles.submitButton}
        disabled={salvando || loading}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#219a52")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#10B981")}
      >
        {salvando || loading ? (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>hourglass_empty</span>
            Processando...
          </>
        ) : modo === "editar" ? (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>save</span>
            Atualizar Emenda
          </>
        ) : (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>check_circle</span>
            Cadastrar Emenda
          </>
        )}
      </button>

      {/* ✅ DEBUG INFO para desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <div style={styles.debugInfo}>
          <small>
            <strong>DEBUG:</strong> Modo: {modo} | Modificado:{" "}
            <span style={{ color: hasUnsavedChanges ? "red" : "green" }}>
              {hasUnsavedChanges ? "SIM" : "NÃO"}
            </span>{" "}
            | Salvando: {salvando ? "SIM" : "NÃO"} | Botão:{" "}
            {hasUnsavedChanges ? "CANCELAR" : "VOLTAR"}
          </small>
        </div>
      )}
    </div>
  );
};

// ✅ ESTILOS MELHORADOS
const styles = {
  buttonContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #e0e0e0",
    flexWrap: "wrap",
    minHeight: "60px",
  },
  backButton: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "120px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "120px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  submitButton: {
    backgroundColor: "#10B981",
    color: "white",
    padding: "12px 32px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
    minWidth: "180px",
  },
  debugInfo: {
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    marginTop: "12px",
    fontSize: "12px",
    color: "#495057",
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    lineHeight: "1.4",
  },
};

export default EmendaFormActions;
