// src/hooks/useEmendaFormNavigation.js
// Hook especializado para navegação do EmendaForm
// Resolve problema de navegação para Dashboard

import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigationProtection } from "./useNavigationProtection";

export const useEmendaFormNavigation = (hasUnsavedChanges = false) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateWithConfirmation, createLinkHandler } =
    useNavigationProtection();

  // ✅ NAVEGAÇÃO ESPECÍFICA PARA EMENDAS (SEMPRE PARA /emendas)
  const navegarParaListaEmendas = useCallback(() => {
    console.log("🎯 Navegando especificamente para /emendas");
    console.log("📍 Localização atual:", location.pathname);

    try {
      // 1ª tentativa: navigate do React Router
      navigate("/emendas", { replace: true });
      console.log("✅ Navegação via React Router realizada");
      
      // Verificação de segurança após pequeno delay
      setTimeout(() => {
        if (window.location.pathname !== "/emendas") {
          console.log("🔄 Fallback: Forçando navegação com window.location");
          window.location.href = "/emendas";
        }
      }, 100);
    } catch (error) {
      console.error("❌ Erro na navegação React Router:", error);
      // Fallback: navegação direta
      try {
        window.location.href = "/emendas";
      } catch (fallbackError) {
        console.error("❌ Erro crítico na navegação:", fallbackError);
      }
    }
  }, [navigate, location.pathname]);

  // ✅ NAVEGAÇÃO COM CONFIRMAÇÃO (se há alterações não salvas)
  const navegarComConfirmacao = useCallback(
    (destino = "/emendas") => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          "Tem certeza que deseja sair? As alterações não salvas serão perdidas.",
        );
        if (!confirmed) return;
      }
      navegarParaListaEmendas();
    },
    [hasUnsavedChanges, navegarParaListaEmendas],
  );

  // ✅ CANCELAR FORMULÁRIO
  const cancelarFormulario = useCallback(() => {
    console.log("❌ Cancelamento solicitado");
    navegarComConfirmacao("/emendas");
  }, [navegarComConfirmacao]);

  // ✅ APÓS SALVAR COM SUCESSO
  const navegarAposSalvar = useCallback(
    (delay = 1500) => {
      console.log("✅ Navegando após salvamento bem-sucedido");
      setTimeout(() => {
        navegarParaListaEmendas();
      }, delay);
    },
    [navegarParaListaEmendas],
  );

  // ✅ NAVEGAÇÃO PARA EDIÇÃO DE EMENDA
  const navegarParaEdicao = useCallback(
    (emendaId) => {
      const path = `/emendas/editar/${emendaId}`;
      navigate(path);
    },
    [navigate],
  );

  // ✅ NAVEGAÇÃO PARA CRIAÇÃO
  const navegarParaCriacao = useCallback(() => {
    navigate("/emendas/criar");
  }, [navigate]);

  // ✅ NAVEGAÇÃO PARA VISUALIZAÇÃO
  const navegarParaVisualizacao = useCallback(
    (emendaId) => {
      const path = `/emendas/visualizar/${emendaId}`;
      navigate(path);
    },
    [navigate],
  );

  // ✅ CRIAR HANDLER PROTEGIDO PARA LINKS
  const criarLinkProtegido = useCallback(
    (destino) => {
      return () => {
        if (hasUnsavedChanges) {
          const confirmed = window.confirm(
            "Tem certeza que deseja sair? As alterações não salvas serão perdidas.",
          );
          if (!confirmed) return;
        }
        navigate(destino);
      };
    },
    [navigate, hasUnsavedChanges],
  );

  return {
    // Navegação principal
    navegarParaListaEmendas,
    navegarComConfirmacao,
    cancelarFormulario,
    navegarAposSalvar,

    // Navegação específica de emendas
    navegarParaEdicao,
    navegarParaCriacao,
    navegarParaVisualizacao,

    // Utilitários
    criarLinkProtegido,

    // Estado
    hasUnsavedChanges,
    currentPath: location.pathname,
  };
};
