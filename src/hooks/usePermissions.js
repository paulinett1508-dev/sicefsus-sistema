// src/hooks/usePermissions.js - HOOK CENTRALIZADO DE PERMISSÕES
// ✅ Centraliza toda lógica de permissões do sistema

import { useState, useEffect, useMemo, useCallback } from "react";
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
    if (usuario.tipo === "admin") {
      return {
        acessoTotal: true,
        filtroAplicado: false,
        semAcesso: false,
        temAcessoSistema: true,
        podeGerenciarUsuarios: true, // ✅ ADMIN PODE GERENCIAR USUÁRIOS
        motivo: "Usuário administrador - acesso total",
        aviso: null,
        filtroMunicipio: null,
        filtroUf: null,
        tipo: "admin_total",
      };
    }

    // ✅ GESTOR: Acesso total em seu município/UF
    if (usuario.tipo === "gestor") {
      const municipio = normalizeMunicipio(usuario.municipio);
      const uf = normalizeUF(usuario.uf);
      const localizacao = validateLocation(municipio, uf);

      if (localizacao.valido) {
        return {
          acessoTotal: false, // Não vê tudo, mas gerencia seu município
          filtroAplicado: true,
          semAcesso: false,
          temAcessoSistema: true,
          podeGerenciarUsuarios: false, // Gestor não gerencia usuários globalmente
          podeGerenciarDespesas: true, // ✅ GESTOR PODE CRIAR/EDITAR/DELETAR DESPESAS
          podeCriarDespesas: true, // ✅ GESTOR PODE CRIAR DESPESAS
          podeEditarDespesas: true, // ✅ GESTOR PODE EDITAR DESPESAS
          motivo: `Gestor com acesso a ${localizacao.municipio}/${localizacao.uf.toUpperCase()}`,
          aviso: null,
          filtroMunicipio: localizacao.municipio,
          filtroUf: localizacao.uf,
          tipo: "gestor_filtrado",
        };
      } else {
        // Gestor sem localização válida - acesso bloqueado até completar
        return {
          acessoTotal: false,
          filtroAplicado: false,
          semAcesso: true,
          temAcessoSistema: false,
          podeGerenciarUsuarios: false,
          podeGerenciarDespesas: false,
          podeCriarDespesas: false,
          podeEditarDespesas: false,
          motivo: "Gestor com localização incompleta",
          aviso: "⚠️ Complete seu cadastro com município/UF para acessar o sistema como Gestor",
          filtroMunicipio: null,
          filtroUf: null,
          tipo: "gestor_localização_pendente",
          errosLocalizacao: localizacao.erros,
        };
      }
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
        temAcessoSistema: true, // ✅ OPERADOR TEM ACESSO AO SISTEMA
        podeGerenciarUsuarios: false, // ✅ MAS NÃO PODE GERENCIAR USUÁRIOS
        motivo: `Operador com acesso a ${localizacao.municipio}/${localizacao.uf.toUpperCase()}`,
        aviso: null,
        filtroMunicipio: localizacao.municipio,
        filtroUf: localizacao.uf,
        tipo: "operador_filtrado",
      };
    }

    // ✅ OPERADOR SEM LOCALIZAÇÃO VÁLIDA: Aviso mas ainda tem acesso básico
    return {
      acessoTotal: false,
      filtroAplicado: false,
      semAcesso: false, // ✅ MUDANÇA: Não bloquear completamente
      temAcessoSistema: true, // ✅ TEM ACESSO BÁSICO
      podeGerenciarUsuarios: false,
      motivo: "Operador com localização incompleta",
      aviso: "⚠️ Complete seu cadastro com município/UF para ver emendas específicas da sua região",
      filtroMunicipio: null,
      filtroUf: null,
      tipo: "operador_localização_pendente",
      errosLocalizacao: localizacao.erros,
    };
  }, [usuario]);

  // ✅ MÉTODOS QUE PODEM SER CHAMADOS POR QUALQUER TIPO DE USUÁRIO
  const methodsComuns = useMemo(
    () => ({
      /**
       * Verificar se usuário tem acesso ao sistema
       */
      temAcesso: () => {
        return permissoes?.temAcessoSistema === true;
      },

      /**
       * Verificar se usuário pode gerenciar outros usuários
       */
      podeGerenciarUsuarios: () => {
        return permissoes?.podeGerenciarUsuarios === true;
      },

      /**
       * Verificar se é administrador
       */
      isAdmin: () => {
        return usuario?.tipo === "admin";
      },

      /**
       * Verificar se é gestor
       */
      isGestor: () => {
        return usuario?.tipo === "gestor";
      },

      /**
       * Verificar se é operador
       */
      isOperador: () => {
        return usuario?.tipo === "operador";
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
          case "gestor_filtrado":
            return `💼 Gestor - Visualizando emendas de ${permissoes.filtroMunicipio}/${permissoes.filtroUf.toUpperCase()}`;
          case "operador_filtrado":
            return `📍 Operador - Visualizando emendas de ${permissoes.filtroMunicipio}/${permissoes.filtroUf.toUpperCase()}`;
          case "operador_localização_pendente":
            return `⚠️ Operador - Complete o cadastro de localização`;
          case "gestor_localização_pendente":
            return `⚠️ Gestor - Complete o cadastro de localização`;
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

  // ✅ MÉTODOS ESPECÍFICOS PARA CONTROLE DE AÇÕES
  const methodsEspecificos = useMemo(
    () => ({
      /**
       * Verificar se usuário pode ver todas as emendas
       */
      podeVerTodasEmendas: () => {
        return permissoes?.acessoTotal === true;
      },

      /**
       * Verificar se usuário pode criar despesas
       */
      podeCriarDespesas: () => {
        return permissoes?.podeCriarDespesas === true || permissoes?.acessoTotal === true;
      },

      /**
       * Verificar se usuário pode editar despesas
       */
      podeEditarDespesas: () => {
        return permissoes?.podeEditarDespesas === true || permissoes?.acessoTotal === true;
      },

      /**
       * Verificar se usuário pode gerenciar despesas
       */
      podeGerenciarDespesas: () => {
        return permissoes?.podeGerenciarDespesas === true || permissoes?.acessoTotal === true;
      },
    }),
    [permissoes],
  );

  // ✅ FILTRAR EMENDAS POR PERMISSÃO
  const filtrarEmendasPorPermissao = useCallback(
    (emendas) => {
      if (!usuario) return [];

      // Admin vê tudo
      if (usuario.tipo === "admin") {
        return emendas;
      }

      // Gestor e Operador veem apenas do seu município
      if (usuario.tipo === "gestor" || usuario.tipo === "operador") {
        return emendas.filter(
          (emenda) =>
            emenda.municipio === usuario.municipio && emenda.uf === usuario.uf,
        );
      }

      return [];
    },
    [usuario],
  );

  // ✅ PERMISSÃO PARA DELETAR EMENDA E DESPESA (ADMIN E GESTOR)
  const podeDeletarEmenda = useCallback(() => {
    return usuario?.tipo === "admin" || usuario?.tipo === "gestor";
  }, [usuario]);

  const podeDeletarDespesa = useCallback(() => {
    return usuario?.tipo === "admin" || usuario?.tipo === "gestor";
  }, [usuario]);

  // ✅ ATUALIZAR PERMISSÕES QUANDO USUÁRIO MUDAR
  useEffect(() => {
    setLoading(true);

    const novasPermissoes = calcularPermissoes;
    setPermissoes(novasPermissoes);

    setLoading(false);
  }, [calcularPermissoes, usuario]);

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
    ...methodsComuns,
    ...methodsEspecificos,
    filtrarEmendasPorPermissao,
    podeDeletarEmenda,
    podeDeletarDespesa,
  };
};

export default usePermissions;