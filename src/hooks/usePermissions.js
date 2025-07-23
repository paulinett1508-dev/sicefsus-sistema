// src/hooks/usePermissions.js - HOOK CENTRALIZADO DE PERMISSÕES
// ✅ Centraliza toda lógica de permissões do sistema

import { useState, useEffect, useMemo } from "react";
import {
  validateLocation,
  normalizeUF,
  normalizeMunicipio,
} from "../utils/validators";

/**
 * ✅ HOOK PARA GERENCIAR PERMISSÕES DE USUÁRIO
 * @param {Object} usuario - Dados do usuário autenticado
 * @returns {Object} - Objeto com permissões e métodos
 */
const usePermissions = (usuario) => {
  const [permissoes, setPermissoes] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CALCULAR PERMISSÕES BASEADO NO USUÁRIO
  const calcularPermissoes = useMemo(() => {
    if (!usuario) {
      return {
        acessoTotal: false,
        filtroAplicado: false,
        semAcesso: true,
        motivo: "Usuário não autenticado",
        aviso: "Faça login para acessar o sistema",
        filtroMunicipio: null,
        filtroUf: null,
        tipo: "sem_autenticacao",
      };
    }

    // ✅ ADMIN: Acesso total sempre
    if (usuario.role === "admin") {
      return {
        acessoTotal: true,
        filtroAplicado: false,
        semAcesso: false,
        motivo: "Usuário administrador - acesso total",
        aviso: null,
        filtroMunicipio: null,
        filtroUf: null,
        tipo: "admin_total",
      };
    }

    // ✅ OPERADOR: Verificar dados de localização
    const municipio = normalizeMunicipio(usuario.municipio);
    const uf = normalizeUF(usuario.uf);

    const localizacao = validateLocation(municipio, uf);

    if (localizacao.valido) {
      return {
        acessoTotal: false,
        filtroAplicado: true,
        semAcesso: false,
        motivo: `Filtrado por ${localizacao.municipio}/${localizacao.uf.toUpperCase()}`,
        aviso: null,
        filtroMunicipio: localizacao.municipio,
        filtroUf: localizacao.uf,
        tipo: "operador_filtrado",
      };
    }

    // ✅ OPERADOR SEM LOCALIZAÇÃO VÁLIDA: Sem acesso
    return {
      acessoTotal: false,
      filtroAplicado: false,
      semAcesso: true,
      motivo: "Dados de localização não cadastrados ou inválidos",
      aviso:
        "⚠️ ACESSO BLOQUEADO: Complete seu cadastro com município/UF válidos para acessar o sistema",
      filtroMunicipio: null,
      filtroUf: null,
      tipo: "operador_bloqueado",
      errosLocalizacao: localizacao.erros,
    };
  }, [usuario]);

  // ✅ ATUALIZAR PERMISSÕES QUANDO USUÁRIO MUDAR
  useEffect(() => {
    setLoading(true);

    const novasPermissoes = calcularPermissoes;
    setPermissoes(novasPermissoes);

    setLoading(false);
  }, [calcularPermissoes, usuario]);

  // ✅ MÉTODOS UTILITÁRIOS
  const methods = useMemo(
    () => ({
      /**
       * Verificar se usuário pode ver todas as emendas
       */
      podeVerTodasEmendas: () => {
        return permissoes?.acessoTotal === true;
      },

      /**
       * Verificar se usuário tem acesso ao sistema
       */
      temAcesso: () => {
        return permissoes && !permissoes.semAcesso;
      },

      /**
       * Verificar se é administrador
       */
      isAdmin: () => {
        return usuario?.role === "admin";
      },

      /**
       * Verificar se é operador
       */
      isOperador: () => {
        return usuario?.role === "user" || (!usuario?.role && usuario);
      },

      /**
       * Obter filtros a serem aplicados nas consultas
       */
      getFiltros: () => {
        if (!permissoes || !permissoes.filtroAplicado) {
          return null;
        }

        return {
          municipio: permissoes.filtroMunicipio,
          uf: permissoes.filtroUf,
        };
      },

      /**
       * Obter mensagem de status para exibição
       */
      getMensagemStatus: () => {
        if (!permissoes) return "Carregando permissões...";

        switch (permissoes.tipo) {
          case "admin_total":
            return `👑 Administrador - Visualizando todas as emendas do sistema`;
          case "operador_filtrado":
            return `📍 Operador - Visualizando emendas de ${permissoes.filtroMunicipio}/${permissoes.filtroUf.toUpperCase()}`;
          case "operador_bloqueado":
            return `🚫 Acesso bloqueado - Complete seu cadastro`;
          case "sem_autenticacao":
            return `🔒 Não autenticado`;
          default:
            return permissoes.motivo;
        }
      },

      /**
       * Verificar se precisa mostrar aviso
       */
      temAviso: () => {
        return permissoes?.aviso !== null;
      },

      /**
       * Obter dados para componentes
       */
      getPermissionData: () => permissoes,

      /**
       * Verificar se está carregando
       */
      isLoading: () => loading,

      /**
       * Recarregar permissões (útil após atualizar perfil)
       */
      recarregar: () => {
        const novasPermissoes = calcularPermissoes;
        setPermissoes(novasPermissoes);
      },
    }),
    [permissoes, usuario, loading, calcularPermissoes],
  );

  return {
    // Estados
    permissoes,
    loading,

    // Dados de acesso
    acessoTotal: permissoes?.acessoTotal || false,
    filtroAplicado: permissoes?.filtroAplicado || false,
    semAcesso: permissoes?.semAcesso || false,

    // Filtros para consultas
    filtroMunicipio: permissoes?.filtroMunicipio || null,
    filtroUf: permissoes?.filtroUf || null,

    // Mensagens
    motivo: permissoes?.motivo || "",
    aviso: permissoes?.aviso || null,

    // Métodos
    ...methods,
  };
};

export default usePermissions;