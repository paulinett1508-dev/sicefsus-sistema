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

  // ✅ HANDLER DE CONFIRMAÇÃO CORRIGIDO - com múltiplos fallbacks
  const handleConfirm = () => {
    console.log(
      "✅ Modal: Usuário confirmou cancelamento - iniciando navegação",
    );

    try {
      console.log("🔧 Modal: Fechando modal...");
      onClose?.(); // Fechar modal primeiro

      // Delay pequeno para garantir que modal feche antes da navegação
      setTimeout(() => {
        try {
          // 1ª opção: usar hook de navegação
          if (
            navegarParaListaEmendas &&
            typeof navegarParaListaEmendas === "function"
          ) {
            console.log("🔧 Modal: Usando navegarParaListaEmendas do hook");
            navegarParaListaEmendas();
            return;
          }

          // 2ª opção: navegação direta (fallback)
          console.log("⚠️ Modal: Usando navegação direta como fallback");
          navigate("/emendas");
        } catch (error) {
          console.error("❌ Modal: Erro no cancelamento:", error);
          // Fallback de emergência
          console.log("🚨 Modal: Tentando fallback de emergência");
          window.location.href = "/emendas";
        }
      }, 100);
    } catch (error) {
      console.error("❌ Modal: Erro crítico:", error);
      // Último recurso imediato
      window.location.href = "/emendas";
    }
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

  // ✅ USAR MODAL EXISTENTE
  return (
    <ConfirmationModal show={show} onClose={handleCancel} {...modalConfig} />
  );
};

export default EmendaFormCancelModal;
