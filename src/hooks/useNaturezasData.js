// src/hooks/useNaturezasData.js
// Hook para carregar e gerenciar naturezas de despesa de uma emenda

import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { parseValorMonetario } from "../utils/formatters";
import {
  criarNatureza,
  atualizarNatureza,
  excluirNatureza,
  listarDespesasNatureza,
} from "../services/naturezaService";
import {
  recalcularNatureza,
  recalcularAlocacaoEmenda,
  validarAlocacaoNatureza,
  validarDespesaNatureza,
} from "../utils/naturezaCalculos";

/**
 * Hook para gerenciar naturezas de uma emenda
 * @param {string} emendaId - ID da emenda
 * @param {object} usuario - Usuario logado
 * @param {object} options - Opcoes adicionais
 * @returns {object} Estado e funcoes para gerenciar naturezas
 */
export const useNaturezasData = (emendaId, usuario, options = {}) => {
  const { incluirEncerradas = false, autoCarregar = true } = options;

  // Estados
  const [naturezas, setNaturezas] = useState([]);
  const [despesasPorNatureza, setDespesasPorNatureza] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // Listener em tempo real para naturezas
  useEffect(() => {
    if (!emendaId || !autoCarregar) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query para naturezas da emenda
    let naturezasQuery;
    if (incluirEncerradas) {
      naturezasQuery = query(
        collection(db, "naturezas"),
        where("emendaId", "==", emendaId)
      );
    } else {
      naturezasQuery = query(
        collection(db, "naturezas"),
        where("emendaId", "==", emendaId),
        where("status", "==", "ativo")
      );
    }

    // Listener em tempo real
    const unsubscribe = onSnapshot(
      naturezasQuery,
      (snapshot) => {
        const naturezasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ordenar por codigo
        naturezasData.sort((a, b) =>
          (a.codigo || "").localeCompare(b.codigo || "")
        );

        setNaturezas(naturezasData);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar naturezas:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [emendaId, incluirEncerradas, autoCarregar]);

  // Carregar despesas de uma natureza especifica
  const carregarDespesasNatureza = useCallback(async (naturezaId) => {
    try {
      const despesas = await listarDespesasNatureza(naturezaId);
      setDespesasPorNatureza((prev) => ({
        ...prev,
        [naturezaId]: despesas,
      }));
      return despesas;
    } catch (err) {
      console.error("Erro ao carregar despesas:", err);
      throw err;
    }
  }, []);

  // Criar nova natureza
  const criar = useCallback(
    async (dados) => {
      setSalvando(true);
      try {
        const id = await criarNatureza(
          {
            ...dados,
            emendaId,
          },
          usuario
        );
        return id;
      } catch (err) {
        console.error("Erro ao criar natureza:", err);
        throw err;
      } finally {
        setSalvando(false);
      }
    },
    [emendaId, usuario]
  );

  // Atualizar natureza existente
  const atualizar = useCallback(
    async (naturezaId, dados) => {
      setSalvando(true);
      try {
        await atualizarNatureza(naturezaId, dados, usuario);
      } catch (err) {
        console.error("Erro ao atualizar natureza:", err);
        throw err;
      } finally {
        setSalvando(false);
      }
    },
    [usuario]
  );

  // Excluir natureza
  const excluir = useCallback(
    async (naturezaId, forcar = false) => {
      setSalvando(true);
      try {
        await excluirNatureza(naturezaId, usuario, forcar);
      } catch (err) {
        console.error("Erro ao excluir natureza:", err);
        throw err;
      } finally {
        setSalvando(false);
      }
    },
    [usuario]
  );

  // Validar se valor pode ser alocado
  const validarAlocacao = useCallback(
    async (valorDesejado, naturezaIdExcluir = null) => {
      return validarAlocacaoNatureza(emendaId, valorDesejado, naturezaIdExcluir);
    },
    [emendaId]
  );

  // Validar se despesa pode ser criada em uma natureza
  const validarDespesa = useCallback(
    async (naturezaId, valorDespesa, despesaIdExcluir = null) => {
      return validarDespesaNatureza(naturezaId, valorDespesa, despesaIdExcluir);
    },
    []
  );

  // Recalcular natureza
  const recalcular = useCallback(async (naturezaId) => {
    try {
      await recalcularNatureza(naturezaId);
    } catch (err) {
      console.error("Erro ao recalcular natureza:", err);
      throw err;
    }
  }, []);

  // Recalcular alocacao da emenda
  const recalcularEmenda = useCallback(async () => {
    try {
      await recalcularAlocacaoEmenda(emendaId);
    } catch (err) {
      console.error("Erro ao recalcular emenda:", err);
      throw err;
    }
  }, [emendaId]);

  // Calculos derivados (memoizados)
  const calculos = useMemo(() => {
    const valorTotalAlocado = naturezas.reduce((sum, nat) => {
      return sum + parseValorMonetario(nat.valorAlocado || 0);
    }, 0);

    const valorTotalExecutado = naturezas.reduce((sum, nat) => {
      return sum + parseValorMonetario(nat.valorExecutado || 0);
    }, 0);

    const saldoTotalDisponivel = naturezas.reduce((sum, nat) => {
      return sum + parseValorMonetario(nat.saldoDisponivel || 0);
    }, 0);

    const quantidadeNaturezas = naturezas.length;
    const naturezasAtivas = naturezas.filter((n) => n.status === "ativo").length;

    return {
      valorTotalAlocado: Math.round(valorTotalAlocado * 100) / 100,
      valorTotalExecutado: Math.round(valorTotalExecutado * 100) / 100,
      saldoTotalDisponivel: Math.round(saldoTotalDisponivel * 100) / 100,
      quantidadeNaturezas,
      naturezasAtivas,
      percentualMedioExecutado:
        valorTotalAlocado > 0
          ? Math.round((valorTotalExecutado / valorTotalAlocado) * 10000) / 100
          : 0,
    };
  }, [naturezas]);

  // Buscar natureza por ID
  const buscarPorId = useCallback(
    (naturezaId) => {
      return naturezas.find((n) => n.id === naturezaId) || null;
    },
    [naturezas]
  );

  // Buscar natureza por codigo
  const buscarPorCodigo = useCallback(
    (codigo) => {
      return naturezas.find((n) => n.codigo === codigo) || null;
    },
    [naturezas]
  );

  return {
    // Estado
    naturezas,
    despesasPorNatureza,
    loading,
    error,
    salvando,
    calculos,

    // Acoes CRUD
    criar,
    atualizar,
    excluir,

    // Acoes auxiliares
    carregarDespesasNatureza,
    validarAlocacao,
    validarDespesa,
    recalcular,
    recalcularEmenda,

    // Buscas
    buscarPorId,
    buscarPorCodigo,
  };
};

export default useNaturezasData;
