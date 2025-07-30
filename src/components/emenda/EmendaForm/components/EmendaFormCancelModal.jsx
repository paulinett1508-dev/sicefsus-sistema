// src/components/emenda/EmendaForm/components/EmendaFormCancelModal.jsx
// Modal de cancelamento usando ConfirmationModal.jsx existente

import React from "react";
import ConfirmationModal from "../../../ConfirmationModal";
import { useEmendaFormNavigation } from "../../../../hooks/useEmendaFormNavigation";

const EmendaFormCancelModal = ({
  show = false,
  onClose,
  hasUnsavedChanges = false,
}) => {
  const { navegarParaListaEmendas } = useEmendaFormNavigation();

  // ✅ HANDLER DE CONFIRMAÇÃO
  const handleConfirm = () => {
    console.log("✅ Usuário confirmou cancelamento - navegando para /emendas");
    onClose?.(); // Fechar modal
    navegarParaListaEmendas(); // Navegar
  };

  // ✅ HANDLER DE CANCELAMENTO DA MODAL
  const handleCancel = () => {
    console.log("❌ Usuário cancelou o cancelamento - continuando edição");
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
