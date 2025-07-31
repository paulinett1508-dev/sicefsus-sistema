// src/components/emenda/EmendaForm/components/EmendaFormCancelModal.jsx
// Modal de cancelamento usando ConfirmationModal.jsx existente
// ✅ CORRIGIDO: Navegação direta como fallback robusto

import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADICIONADO: Para navegação direta
import ConfirmationModal from "../../../ConfirmationModal";
import { useEmendaFormNavigation } from "../../../../hooks/useEmendaFormNavigation";

const EmendaFormCancelModal = ({
  show = false,
  onClose,
  hasUnsavedChanges = false,
}) => {
  const navigate = useNavigate(); // ✅ ADICIONADO: Navegação direta como fallback
  const { navegarParaListaEmendas } = useEmendaFormNavigation();

  // ✅ LOG DE DEBUG PARA VERIFICAR RENDERIZAÇÃO
  console.log("🔍 EmendaFormCancelModal renderizado:", {
    show,
    hasUnsavedChanges,
  });

  // ✅ HANDLER DE CONFIRMAÇÃO - SOLUÇÃO DIRETA
  const handleConfirm = () => {
    console.log(
      "✅ Modal: Usuário confirmou cancelamento - FORÇANDO ida para /emendas",
    );

    // FECHAR MODAL PRIMEIRO
    if (onClose) {
      onClose();
    }

    // SOLUÇÃO DEFINITIVA: Forçar navegação para /emendas
    setTimeout(() => {
      console.log("🎯 REDIRECIONAMENTO FORÇADO: /emendas");
      window.location.href = "/emendas";
    }, 100);
  };

  // ✅ HANDLER DE CANCELAMENTO DA MODAL
  const handleCancel = () => {
    console.log(
      "❌ Modal: Usuário cancelou o cancelamento - continuando edição",
    );
    onClose?.();
  };

  // ✅ CONFIGURAÇÃO DA MODAL
  const modalConfig = {
    type: "warning", // Define ícone e cores
    title: "Confirmar Cancelamento",
    message: "Tem certeza que deseja cancelar?",
    details: hasUnsavedChanges
      ? "Todas as alterações não salvas serão perdidas e você retornará à listagem de emendas."
      : "Você retornará à listagem de emendas.",
    confirmText: "Sim, Cancelar",
    cancelText: "Continuar Editando",
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  // ✅ USAR MODAL SIMPLES DIRETAMENTE - BYPASS do ConfirmationModal problemático
  console.log("🎯 Modal: Renderizando modal simples com show =", show);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#dc3545" }}>
          ⚠️ Confirmar Cancelamento
        </h3>
        <p style={{ margin: "15px 0" }}>Tem certeza que deseja cancelar?</p>
        <p style={{ margin: "10px 0", fontSize: "14px", color: "#666" }}>
          {hasUnsavedChanges
            ? "Todas as alterações não salvas serão perdidas e você retornará à listagem de emendas."
            : "Você retornará à listagem de emendas."}
        </p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            marginTop: "25px",
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Continuar Editando
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Sim, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmendaFormCancelModal;
