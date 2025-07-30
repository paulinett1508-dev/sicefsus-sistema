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

  // ✅ NAVEGAÇÃO ESPECÍFICA PARA EMENDAS (SEMPRE PARA /emendas) - CORRIGIDA
  const navegarParaListaEmendas = useCallback(() => {
    console.log("🎯 Navegando especificamente para /emendas");
    console.log("📍 Localização atual:", location.pathname);

    // Verificar se já estamos EXATAMENTE em /emendas (listagem)
    // Não apenas se contém /emendas (que inclui /emendas/criar, /emendas/editar/id)
    if (location.pathname === "/emendas") {
      console.log("✅ Já estamos na listagem /emendas - não é necessário navegar");
      return;
    }

    console.log("🔄 Estamos em uma subpágina de emendas, navegando para listagem...");

    // Múltiplas tentativas de navegação com delays progressivos
    const tentarNavegacao = (tentativa = 1) => {
      console.log(`🎯 Tentativa ${tentativa} de navegação`);
      
      try {
        if (tentativa === 1) {
          // 1ª tentativa: navigate com replace
          navigate("/emendas", { replace: true });
          console.log("✅ Tentativa 1: navigate com replace");
        } else if (tentativa === 2) {
          // 2ª tentativa: navigate sem replace
          navigate("/emendas");
          console.log("✅ Tentativa 2: navigate sem replace");
        } else {
          // 3ª tentativa: window.location
          console.log("✅ Tentativa 3: window.location (fallback final)");
          window.location.href = "/emendas";
          return;
        }

        // Verificar se a navegação foi bem-sucedida após delay
        setTimeout(() => {
          const currentPath = window.location.pathname;
          console.log(`📍 Verificação pós-navegação (tentativa ${tentativa}):`, currentPath);
          
          if (currentPath !== "/emendas" && tentativa < 3) {
            console.log(`⚠️ Navegação tentativa ${tentativa} falhou, tentando próxima...`);
            tentarNavegacao(tentativa + 1);
          } else if (currentPath === "/emendas") {
            console.log(`✅ Navegação bem-sucedida na tentativa ${tentativa}!`);
          }
        }, tentativa * 100); // Delay progressivo: 100ms, 200ms, 300ms

      } catch (error) {
        console.error(`❌ Erro na tentativa ${tentativa}:`, error);
        if (tentativa < 3) {
          tentarNavegacao(tentativa + 1);
        }
      }
    };

    // Iniciar processo de navegação
    tentarNavegacao(1);
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
