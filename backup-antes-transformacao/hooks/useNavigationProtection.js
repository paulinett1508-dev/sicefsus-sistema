// hooks/useNavigationProtection.js - Hook Completo para Proteção de Navegação
import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook personalizado para proteção de navegação com dados não salvos
 *
 * @param {boolean} hasUnsavedChanges - Se existem alterações não salvas
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Funções e estados do hook
 */
export const useNavigationProtection = (
  hasUnsavedChanges = false,
  options = {},
) => {
  const {
    message = "⚠️ Existem alterações não salvas.\n\nDeseja realmente sair?",
    blockBack = true,
    blockRefresh = true,
    onBeforeUnload = null,
    onNavigationBlocked = null,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();

  // Proteção contra refresh/fechamento do navegador
  useEffect(() => {
    if (!blockRefresh || !hasUnsavedChanges) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;

      if (onBeforeUnload) {
        onBeforeUnload(e);
      }

      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message, blockRefresh, onBeforeUnload]);

  // Função para navegação segura
  const safeNavigate = useCallback(
    (to, options = {}) => {
      if (hasUnsavedChanges) {
        const shouldNavigate = window.confirm(message);

        if (!shouldNavigate) {
          if (onNavigationBlocked) {
            onNavigationBlocked({ to, blocked: true });
          }
          return false;
        }
      }

      navigate(to, options);
      return true;
    },
    [hasUnsavedChanges, message, navigate, onNavigationBlocked],
  );

  // Função para navegação com confirmação personalizada
  const navigateWithConfirmation = useCallback(
    (to, customMessage, options = {}) => {
      if (hasUnsavedChanges) {
        const shouldNavigate = window.confirm(customMessage || message);

        if (!shouldNavigate) {
          if (onNavigationBlocked) {
            onNavigationBlocked({ to, blocked: true, customMessage });
          }
          return false;
        }
      }

      navigate(to, options);
      return true;
    },
    [hasUnsavedChanges, message, navigate, onNavigationBlocked],
  );

  // Função para verificar se pode navegar
  const canNavigate = useCallback(
    (customMessage = null) => {
      if (!hasUnsavedChanges) return true;

      const confirmMessage = customMessage || message;
      return window.confirm(confirmMessage);
    },
    [hasUnsavedChanges, message],
  );

  // Função para navegação com salvamento automático
  const navigateWithSave = useCallback(
    async (to, saveFunction, options = {}) => {
      if (hasUnsavedChanges) {
        const choice = window.confirm(
          "⚠️ Existem alterações não salvas.\n\n" +
            '• "OK" = Salvar e navegar\n' +
            '• "Cancelar" = Navegar sem salvar',
        );

        if (choice && saveFunction) {
          try {
            await saveFunction();
          } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar. Navegação cancelada.");
            return false;
          }
        }
      }

      navigate(to, options);
      return true;
    },
    [hasUnsavedChanges, navigate],
  );

  // Função para criar handler de link
  const createLinkHandler = useCallback(
    (to, options = {}) => {
      return (e) => {
        e.preventDefault();
        safeNavigate(to, options);
      };
    },
    [safeNavigate],
  );

  // Função para criar handler de botão
  const createButtonHandler = useCallback(
    (action, customMessage = null) => {
      return () => {
        if (canNavigate(customMessage)) {
          action();
        }
      };
    },
    [canNavigate],
  );

  return {
    // Estados
    hasUnsavedChanges,
    isProtected: hasUnsavedChanges,

    // Funções de navegação
    safeNavigate,
    navigateWithConfirmation,
    navigateWithSave,
    canNavigate,

    // Helpers para componentes
    createLinkHandler,
    createButtonHandler,

    // Navegação original (para casos especiais)
    navigate,
    location,
  };
};

/**
 * Hook específico para formulários com navegação para entidades relacionadas
 *
 * @param {boolean} hasChanges - Se há alterações no formulário
 * @param {Function} saveFunction - Função para salvar os dados
 * @param {Object} navigationOptions - Opções de navegação
 * @returns {Object} - Funções específicas para formulários
 */
export const useFormNavigation = (
  hasChanges,
  saveFunction,
  navigationOptions = {},
) => {
  const {
    confirmSaveMessage = "⚠️ Existem alterações não salvas.\n\nDeseja salvar antes de continuar?",
    confirmDiscardMessage = "⚠️ Existem alterações não salvas.\n\nDeseja realmente descartar as alterações?",
  } = navigationOptions;

  const { safeNavigate, navigateWithSave, canNavigate, navigate } =
    useNavigationProtection(hasChanges);

  // Navegação para entidade relacionada (ex: emenda -> lançamentos)
  const navigateToRelated = useCallback(
    async (to, relatedInfo, options = {}) => {
      if (hasChanges) {
        const shouldSave = window.confirm(confirmSaveMessage);

        if (shouldSave && saveFunction) {
          try {
            await saveFunction();
          } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar. Corrija os erros e tente novamente.");
            return false;
          }
        } else if (!shouldSave && !window.confirm(confirmDiscardMessage)) {
          return false;
        }
      }

      navigate(to, {
        state: {
          ...options.state,
          filtroEmenda: relatedInfo,
          fromForm: true,
          autoFiltrar: true,
        },
        ...options,
      });

      return true;
    },
    [
      hasChanges,
      saveFunction,
      confirmSaveMessage,
      confirmDiscardMessage,
      navigate,
    ],
  );

  // Cancelar formulário com confirmação
  const cancelForm = useCallback(
    (onCancel) => {
      if (hasChanges) {
        const shouldDiscard = window.confirm(confirmDiscardMessage);
        if (!shouldDiscard) return false;
      }

      if (onCancel) {
        onCancel();
      }

      return true;
    },
    [hasChanges, confirmDiscardMessage],
  );

  return {
    // Funções herdadas
    safeNavigate,
    navigateWithSave,
    canNavigate,

    // Funções específicas para formulários
    navigateToRelated,
    cancelForm,

    // Estados
    hasUnsavedChanges: hasChanges,
    isFormDirty: hasChanges,
  };
};

/**
 * Hook para navegação entre módulos relacionados (emendas <-> lançamentos)
 *
 * @param {string} currentModule - Módulo atual ('emendas' ou 'lancamentos')
 * @param {Object} contextData - Dados de contexto da navegação
 * @returns {Object} - Funções para navegação entre módulos
 */
export const useModuleNavigation = (currentModule, contextData = {}) => {
  const { navigate, location } = useNavigationProtection();

  // Navegar para lançamentos de uma emenda específica
  const goToEmendaLancamentos = useCallback(
    (emendaInfo, options = {}) => {
      navigate("/lancamentos", {
        state: {
          filtroEmenda: emendaInfo,
          fromEmenda: true,
          autoFiltrar: true,
          ...options.state,
        },
        ...options,
      });
    },
    [navigate],
  );

  // Voltar para emenda de origem
  const returnToEmenda = useCallback(
    (emendaId, options = {}) => {
      navigate("/emendas", {
        state: {
          editarEmenda: emendaId,
          fromLancamentos: true,
          ...options.state,
        },
        ...options,
      });
    },
    [navigate],
  );

  // Criar lançamento para emenda específica
  const createLancamentoForEmenda = useCallback(
    (emendaInfo, options = {}) => {
      navigate("/lancamentos", {
        state: {
          novoLancamento: true,
          emendaPreSelecionada: emendaInfo,
          fromEmenda: true,
          ...options.state,
        },
        ...options,
      });
    },
    [navigate],
  );

  // Verificar origem da navegação
  const getNavigationSource = useCallback(() => {
    return {
      fromEmenda: location.state?.fromEmenda || false,
      fromLancamentos: location.state?.fromLancamentos || false,
      hasFilter: !!location.state?.filtroEmenda,
      autoFilter: location.state?.autoFiltrar || false,
    };
  }, [location.state]);

  return {
    // Navegação entre módulos
    goToEmendaLancamentos,
    returnToEmenda,
    createLancamentoForEmenda,

    // Informações de contexto
    getNavigationSource,

    // Dados de contexto atual
    currentModule,
    contextData,

    // Estado da navegação
    navigationState: location.state || {},
  };
};

export default useNavigationProtection;
