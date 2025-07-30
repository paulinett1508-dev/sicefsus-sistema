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

  // ✅ HANDLER DE CONFIRMAÇÃO CORRIGIDO - com fallbacks robustos
  const handleConfirm = () => {
    console.log("✅ Modal: Usuário confirmou cancelamento - navegando para /emendas");

    // Fechar modal primeiro
    onClose?.();

    // Navegar imediatamente com múltiplos fallbacks
    try {
      console.log("🎯 Modal: Tentativa 1 - hook navegarParaListaEmendas");
      navegarParaListaEmendas();
    } catch (error) {
      console.error("❌ Erro no hook, tentando navigate direto:", error);
      try {
        console.log("🎯 Modal: Tentativa 2 - navigate direto");
        navigate("/emendas", { replace: true });
      } catch (navError) {
        console.error("❌ Erro no navigate, forçando window.location:", navError);
        console.log("🎯 Modal: Tentativa 3 - window.location (fallback final)");
        window.location.href = "/emendas";
      }
    }

    // Verificação de segurança após delay
    setTimeout(() => {
      if (window.location.pathname !== "/emendas") {
        console.log("⚠️ Modal: Navegação não ocorreu, forçando redirecionamento");
        window.location.href = "/emendas";
      }
    }, 200);
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
    <ConfirmationModal isVisible={show} onClose={handleCancel} {...modalConfig} />
  );
};

export default EmendaFormCancelModal;
