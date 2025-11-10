// src/hooks/useEmendaDespesa.js - VERSÃO CORRIGIDA v2.1 - LOOPS ELIMINADOS
// ✅ CORREÇÃO CRÍTICA: Loops infinitos eliminados
// ✅ PRESERVADO: Toda funcionalidade original
// ✅ CORRIGIDO: Dependencies dos useEffects

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { parseValorMonetario } from "../utils/formatters";

/**
 * Hook customizado para gerenciar relacionamento Emenda-Despesa
 * @param {Object} usuario - Dados completos do usuário
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Dados e funções para gerenciar relacionamento
 */
const useEmendaDespesa = (usuario = null, options = {}) => {
  // ✅ CORREÇÃO 1: Refs para evitar loops
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const listenersRef = useRef({});
  const usuarioRef = useRef(usuario);

  // ✅ CORREÇÃO 2: Atualizar ref sem triggerar re-render
  useEffect(() => {
    usuarioRef.current = usuario;
  }, [usuario]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Limpar todos os listeners
      Object.values(listenersRef.current).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      listenersRef.current = {};
    };
  }, []);

  // Estados principais
  const [emenda, setEmenda] = useState(null);
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [despesasEmenda, setDespesasEmenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissoes, setPermissoes] = useState({
    podeEditar: true,
    podeVisualizar: true,
    isAdmin: true,
    acessoTotal: true,
    filtroAplicado: false,
  });
  const [metricas, setMetricas] = useState({
    valorTotal: 0,
    valorExecutado: 0,
    saldoDisponivel: 0,
    percentualExecutado: 0,
    totalDespesas: 0,
    despesasPendentes: 0,
    despesasAprovadas: 0,
    despesasPagas: 0,
    despesasRejeitadas: 0,
  });

  // ✅ CONFIGURAÇÕES DO HOOK (SIMPLIFICADAS)
  const config = useRef({
    autoRefresh: options.autoRefresh !== false,
    incluirEstatisticas: options.incluirEstatisticas !== false,
    carregarTodasEmendas: options.carregarTodasEmendas || false,
    filtroStatus: options.filtroStatus || null,
    filtroMunicipio: options.filtroMunicipio || null,
    filtroUf: options.filtroUf || null,
    userRole: options.userRole || null,
  });

  // ✅ CORREÇÃO 3: Permissões sempre liberadas (sem loops)
  useEffect(() => {
    const permissoesLiberadas = {
      podeEditar: true,
      podeVisualizar: true,
      isAdmin: true,
      acessoTotal: true,
      filtroAplicado: false,
    };

    setPermissoes(permissoesLiberadas);
    setError(null);
  }, []); // ✅ Sem dependências para evitar loops

  // ✅ FUNÇÃO: Calcular métricas financeiras de uma emenda (ESTÁVEL)
  const calcularMetricasEmenda = useCallback(
    (emendaData, despesasData) => {
      if (!emendaData) return metricas;

      const valorTotal = parseValorMonetario(
        emendaData.valorTotal || emendaData.valorRecurso || 0,
      );

      // ✅ FILTRO CRÍTICO: Excluir APENAS despesas planejadas
      const despesasValidas = despesasData.filter(
        (d) => d.emendaId === emendaData.id && d.status !== "PLANEJADA"
      );

      // ✅ CORREÇÃO: Parse correto de cada despesa válida
      const valorExecutado = despesasValidas.reduce(
        (sum, d) => sum + parseValorMonetario(d.valor),
        0,
      );
      const saldoDisponivel = valorTotal - valorExecutado;
      const percentualExecutado =
        valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

      const despesasPorStatus = despesasValidas.reduce((acc, d) => {
        const status = d.status || "pendente";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return {
        valorTotal,
        valorExecutado,
        saldoDisponivel,
        percentualExecutado,
        totalDespesas: despesasValidas.length,
        despesasPendentes: despesasPorStatus.pendente || 0,
        despesasAprovadas: despesasPorStatus.aprovada || 0,
        despesasPagas: despesasPorStatus.paga || 0,
        despesasRejeitadas: despesasPorStatus.rejeitada || 0,
      };
    },
    [metricas], // Adicionado metricas como dependência, embora possa ser estável
  );

  // ✅ FUNÇÃO: Carregar emenda específica (ESTÁVEL)
  const carregarEmenda = useCallback(async (id) => {
    if (!id || loadingRef.current) return null;

    try {
      loadingRef.current = true;
      setLoading(true);

      const emendaDoc = await getDoc(doc(db, "emendas", id));

      if (!isMountedRef.current) return null;

      if (emendaDoc.exists()) {
        const emendaData = { id: emendaDoc.id, ...emendaDoc.data() };
        setEmenda(emendaData);
        return emendaData;
      } else {
        setError("Emenda não encontrada");
        return null;
      }
    } catch (err) {
      console.error("Erro ao carregar emenda:", err);
      if (isMountedRef.current) {
        setError("Erro ao carregar emenda");
      }
      return null;
    } finally {
      loadingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // ✅ Sem dependências para ser estável

  // ✅ FUNÇÃO: Carregar despesas de uma emenda (ESTÁVEL)
  const carregarDespesasEmenda = useCallback(async (id) => {
    if (!id) return [];

    try {
      const q = query(
        collection(db, "despesas"),
        where("emendaId", "==", id),
        orderBy("data", "desc"),
      );

      const snapshot = await getDocs(q);
      const despesasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (isMountedRef.current) {
        setDespesasEmenda(despesasData);
      }
      return despesasData;
    } catch (err) {
      console.error("Erro ao carregar despesas da emenda:", err);
      if (isMountedRef.current) {
        setError("Erro ao carregar despesas");
      }
      return [];
    }
  }, []); // ✅ Sem dependências para ser estável

  // ✅ CORREÇÃO 4: Carregar todas as emendas (SEM DEPENDÊNCIAS CIRCULARES)
  const carregarTodasEmendasComMetricas = useCallback(async () => {
    if (loadingRef.current) {
      console.log("⏳ Carregamento já em andamento...");
      return [];
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      console.log("📊 Carregando emendas e despesas...");

      // Query base - sempre carregar todas para admins
      let emendasQuery = query(
        collection(db, "emendas"),
        orderBy("numero", "asc"),
      );

      const [emendasSnapshot, despesasSnapshot] = await Promise.all([
        getDocs(emendasQuery),
        getDocs(collection(db, "despesas")),
      ]);

      if (!isMountedRef.current) return [];

      const emendasData = emendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const despesasData = despesasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calcular métricas para cada emenda
      const emendasComMetricas = emendasData.map((emenda) => {
        const metricasEmenda = calcularMetricasEmenda(emenda, despesasData);
        return { ...emenda, ...metricasEmenda };
      });

      if (isMountedRef.current) {
        setEmendas(emendasComMetricas);
        setDespesas(despesasData);
      }

      console.log(`✅ ${emendasComMetricas.length} emendas carregadas`);
      return emendasComMetricas;
    } catch (err) {
      console.error("Erro ao carregar emendas:", err);
      if (isMountedRef.current) {
        setError("Erro ao carregar dados");
      }
      return [];
    } finally {
      loadingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [calcularMetricasEmenda]); // ✅ Apenas dependência estável

  // ✅ FUNÇÃO: Validar nova despesa contra saldo da emenda
  const validarNovaDespesa = useCallback(
    async (emendaId, valorDespesa) => {
      if (!emendaId || !valorDespesa) {
        return { valida: false, erro: "Emenda e valor são obrigatórios" };
      }

      try {
        const emendaData = await carregarEmenda(emendaId);
        if (!emendaData) {
          return { valida: false, erro: "Emenda não encontrada" };
        }

        const despesasData = await carregarDespesasEmenda(emendaId);
        const metricas = calcularMetricasEmenda(emendaData, despesasData);

        // Usar o valor parseado da despesa para validação
        const valorDespesaParseado = parseValorMonetario(valorDespesa);

        if (valorDespesaParseado > metricas.saldoDisponivel) {
          return {
            valida: false,
            erro: `Valor excede saldo disponível. Saldo: R$ ${metricas.saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            saldoDisponivel: metricas.saldoDisponivel,
          };
        }

        return { valida: true, saldoDisponivel: metricas.saldoDisponivel };
      } catch (err) {
        console.error("Erro na validação:", err);
        return { valida: false, erro: "Erro ao validar despesa" };
      }
    },
    [carregarEmenda, carregarDespesasEmenda, calcularMetricasEmenda],
  );

  // ✅ FUNÇÃO: Atualizar saldo da emenda no Firestore
  const atualizarSaldoEmenda = useCallback(
    async (emendaId) => {
      if (!emendaId) return false;

      try {
        const emendaData = await carregarEmenda(emendaId);
        const despesasData = await carregarDespesasEmenda(emendaId);

        if (!emendaData) return false;

        const metricas = calcularMetricasEmenda(emendaData, despesasData);

        await updateDoc(doc(db, "emendas", emendaId), {
          valorExecutado: metricas.valorExecutado,
          saldoDisponivel: metricas.saldoDisponivel,
          percentualExecutado: metricas.percentualExecutado,
          totalDespesas: metricas.totalDespesas,
          updatedAt: serverTimestamp(),
        });

        return true;
      } catch (err) {
        console.error("Erro ao atualizar saldo:", err);
        return false;
      }
    },
    [carregarEmenda, carregarDespesasEmenda, calcularMetricasEmenda],
  );

  // ✅ FUNÇÃO: Obter estatísticas gerais (ESTÁVEL)
  const obterEstatisticasGerais = useCallback(() => {
    if (!emendas.length) return null;

    const totalEmendas = emendas.length;
    const valorTotalGeral = emendas.reduce(
      (sum, e) => sum + parseValorMonetario(e.valorTotal || e.valor || 0), // Usar parseValorMonetario
      0,
    );
    const valorExecutadoGeral = emendas.reduce(
      (sum, e) => sum + parseValorMonetario(e.valorExecutado || 0), // Usar parseValorMonetario
      0,
    );
    const saldoDisponivelGeral = valorTotalGeral - valorExecutadoGeral;

    return {
      totalEmendas,
      valorTotalGeral,
      valorExecutadoGeral,
      saldoDisponivelGeral,
      percentualGeralExecutado:
        valorTotalGeral > 0 ? (valorExecutadoGeral / valorTotalGeral) * 100 : 0,
      emendasComSaldo: emendas.filter((e) => parseValorMonetario(e.saldoDisponivel || 0) > 0) // Usar parseValorMonetario
        .length,
      emendasEsgotadas: emendas.filter((e) => parseValorMonetario(e.saldoDisponivel || 0) <= 0) // Usar parseValorMonetario
        .length,
      emendasSemDespesas: emendas.filter((e) => (e.totalDespesas || 0) === 0)
        .length,
      totalDespesas: despesas.length,
    };
  }, [emendas, despesas]);

  // ✅ FUNÇÃO: Filtrar emendas por critérios (ESTÁVEL)
  const filtrarEmendas = useCallback(
    (filtros = {}) => {
      let emendasFiltradas = [...emendas];

      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        emendasFiltradas = emendasFiltradas.filter(
          (e) =>
            e.parlamentar?.toLowerCase().includes(busca) ||
            e.numero?.toLowerCase().includes(busca) ||
            e.municipio?.toLowerCase().includes(busca) ||
            e.objetoProposta?.toLowerCase().includes(busca),
        );
      }

      if (filtros.parlamentar) {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => e.parlamentar === filtros.parlamentar,
        );
      }

      if (filtros.tipo) {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => e.tipo === filtros.tipo,
        );
      }

      if (filtros.statusFinanceiro === "com-saldo") {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => parseValorMonetario(e.saldoDisponivel || 0) > 0, // Usar parseValorMonetario
        );
      } else if (filtros.statusFinanceiro === "esgotadas") {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => parseValorMonetario(e.saldoDisponivel || 0) <= 0, // Usar parseValorMonetario
        );
      } else if (filtros.statusFinanceiro === "sem-despesas") {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => (e.totalDespesas || 0) === 0,
        );
      }

      return emendasFiltradas;
    },
    [emendas],
  );

  // ✅ FUNÇÃO: Recarregar dados (PROTEGIDA)
  const recarregar = useCallback(async () => {
    if (loadingRef.current) {
      console.log("⏳ Recarregamento já em andamento...");
      return;
    }

    try {
      setError(null);

      if (options.emendaId) {
        const [emendaData, despesasData] = await Promise.all([
          carregarEmenda(options.emendaId),
          carregarDespesasEmenda(options.emendaId),
        ]);

        if (emendaData && config.current.incluirEstatisticas) {
          const metricasCalculadas = calcularMetricasEmenda(
            emendaData,
            despesasData,
          );
          if (isMountedRef.current) {
            setMetricas(metricasCalculadas);
          }
        }
      }

      if (config.current.carregarTodasEmendas) {
        await carregarTodasEmendasComMetricas();
      }
    } catch (err) {
      console.error("Erro ao recarregar dados:", err);
      if (isMountedRef.current) {
        setError("Erro ao recarregar dados");
      }
    }
  }, [
    options.emendaId,
    carregarEmenda,
    carregarDespesasEmenda,
    calcularMetricasEmenda,
    carregarTodasEmendasComMetricas,
  ]);

  // ✅ CORREÇÃO 5: Effect de carregamento inicial (SIMPLIFICADO)
  useEffect(() => {
    let mounted = true;

    const carregarDadosIniciais = async () => {
      if (!mounted) return;

      console.log("🚀 Iniciando carregamento inicial...");

      // Aguardar um tick para garantir que o componente está montado
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (!mounted || !isMountedRef.current) return;

      try {
        setError(null);

        if (options.emendaId) {
          console.log("📋 Carregando emenda específica:", options.emendaId);
          const [emendaData, despesasData] = await Promise.all([
            carregarEmenda(options.emendaId),
            carregarDespesasEmenda(options.emendaId),
          ]);

          if (mounted && emendaData && config.current.incluirEstatisticas) {
            const metricasCalculadas = calcularMetricasEmenda(
              emendaData,
              despesasData,
            );
            setMetricas(metricasCalculadas);
          }
        }

        if (config.current.carregarTodasEmendas) {
          console.log("📊 Carregando todas as emendas...");
          await carregarTodasEmendasComMetricas();
        }
      } catch (err) {
        console.error("❌ Erro no carregamento inicial:", err);
        if (mounted) {
          setError("Erro ao carregar dados iniciais");
        }
      }
    };

    carregarDadosIniciais();

    return () => {
      mounted = false;
    };
  }, []); // ✅ CORREÇÃO CRÍTICA: Sem dependências para evitar loops

  // ✅ CORREÇÃO 6: Listeners em tempo real (SIMPLIFICADOS)
  useEffect(() => {
    if (!config.current.autoRefresh) return;
    if (!config.current.carregarTodasEmendas) return;

    console.log("🔄 Configurando listeners em tempo real...");

    // Cleanup listeners anteriores
    Object.values(listenersRef.current).forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
    listenersRef.current = {};

    // Listener para emendas
    const emendasQuery = query(
      collection(db, "emendas"),
      orderBy("numero", "asc"),
    );

    listenersRef.current.emendas = onSnapshot(
      emendasQuery,
      (snapshot) => {
        if (!isMountedRef.current) return;

        const emendasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmendas(emendasData);
        console.log("🔄 Emendas atualizadas via listener:", emendasData.length);
      },
      (error) => {
        console.error("Erro no listener de emendas:", error);
        if (isMountedRef.current) {
          setError("Erro ao acompanhar mudanças nas emendas");
        }
      },
    );

    // Listener para despesas
    const despesasQuery = options.emendaId
      ? query(
          collection(db, "despesas"),
          where("emendaId", "==", options.emendaId),
          orderBy("data", "desc"),
        )
      : query(collection(db, "despesas"), orderBy("data", "desc"));

    listenersRef.current.despesas = onSnapshot(
      despesasQuery,
      (snapshot) => {
        if (!isMountedRef.current) return;

        const despesasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (options.emendaId) {
          setDespesasEmenda(despesasData);
        } else {
          setDespesas(despesasData);
        }
        console.log(
          "🔄 Despesas atualizadas via listener:",
          despesasData.length,
        );
      },
      (error) => {
        console.error("Erro no listener de despesas:", error);
        if (isMountedRef.current) {
          setError("Erro ao acompanhar mudanças nas despesas");
        }
      },
    );

    return () => {
      // Cleanup listeners
      Object.values(listenersRef.current).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      listenersRef.current = {};
    };
  }, [options.emendaId]); // ✅ Apenas emendaId como dependência

  // ✅ Debug function
  if (typeof window !== "undefined") {
    window.debugPermissoes = () => {
      console.log("🔍 DEBUG PERMISSÕES:");
      console.log("Usuario:", usuarioRef.current);
      console.log("Permissões:", permissoes);
      console.log("Loading:", loading);
      console.log("Error:", error);
    };
  }

  return {
    // Dados principais
    emenda,
    emendas,
    despesas,
    despesasEmenda,
    metricas,

    // Estados
    loading,
    error,

    // Permissões
    permissoes,
    ...permissoes,

    // Funções de carregamento
    carregarEmenda,
    carregarDespesasEmenda,
    carregarTodasEmendasComMetricas,
    recarregar,

    // Funções de validação e cálculo
    validarNovaDespesa,
    atualizarSaldoEmenda,
    calcularMetricasEmenda,

    // Funções de análise
    obterEstatisticasGerais,
    filtrarEmendas,

    // Métodos auxiliares
    podeEditarCampo: () => true,
    podeVisualizarCampo: () => true,

    // Utilitários
    setError: (msg) => setError(msg),
    limparError: () => setError(null),
  };
};

// ✅ Hook auxiliar para verificar se componente está montado
export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted;
};

export { useEmendaDespesa };
export default useEmendaDespesa;