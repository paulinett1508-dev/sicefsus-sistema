// src/hooks/useEmendaDespesa.js - CORREÇÃO CRÍTICA DO LOOP INFINITO
// HOOK CUSTOMIZADO - RELACIONAMENTO EMENDA-DESPESA
// ✅ Gerencia relacionamento crítico + cálculos automáticos + validações

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

/**
 * Hook customizado para gerenciar relacionamento Emenda-Despesa
 * @param {Object} usuario - Dados completos do usuário
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Dados e funções para gerenciar relacionamento
 */
const useEmendaDespesa = (usuario = null, options = {}) => {
  // ✅ REF PARA EVITAR LOOPS
  const mountedRef = useRef(true);
  const lastLoadRef = useRef(0);

  // ✅ ESTADOS PRINCIPAIS
  const [emenda, setEmenda] = useState(null);
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [despesasEmenda, setDespesasEmenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissoes, setPermissoes] = useState({
    podeEditar: false,
    podeVisualizar: false,
    isAdmin: false,
    acessoTotal: false,
    filtroAplicado: true,
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

  // ✅ MEMOIZAÇÃO DAS CONFIGURAÇÕES PARA EVITAR RECRIAÇÃO
  const configMemo = useMemo(() => {
    const {
      autoRefresh = true,
      incluirEstatisticas = true,
      carregarTodasEmendas = false,
      filtroStatus = null,
      filtroMunicipio = null,
      filtroUf = null,
      userRole = null,
      emendaId = null,
    } = options;

    return {
      autoRefresh,
      incluirEstatisticas,
      carregarTodasEmendas,
      filtroStatus,
      filtroMunicipio,
      filtroUf,
      userRole,
      emendaId,
    };
  }, [
    options.autoRefresh,
    options.incluirEstatisticas,
    options.carregarTodasEmendas,
    options.filtroStatus,
    options.filtroMunicipio,
    options.filtroUf,
    options.userRole,
    options.emendaId,
  ]);

  // ✅ MEMOIZAÇÃO DO USUÁRIO PARA EVITAR RECÁLCULOS
  const usuarioMemo = useMemo(() => {
    if (!usuario) return null;

    return {
      uid: usuario.uid,
      email: usuario.email,
      role: usuario.role,
      municipio: usuario.municipio,
      uf: usuario.uf,
    };
  }, [usuario?.uid, usuario?.email, usuario?.role, usuario?.municipio, usuario?.uf]);

  // ✅ FUNÇÃO determinarPermissoes ESTÁVEL
  const determinarPermissoes = useCallback((user) => {
    if (!user) {
      return {
        podeEditar: false,
        podeVisualizar: false,
        isAdmin: false,
        acessoTotal: false,
        filtroAplicado: true,
        motivo: "Usuário não autenticado",
        aviso: "Aguardando dados do usuário...",
      };
    }

    const role = user.role;
    const isAdmin =
      role === "admin" ||
      role === "Admin" ||
      role === "ADMIN" ||
      (typeof role === "string" && role.toLowerCase() === "admin");

    if (isAdmin) {
      return {
        podeEditar: true,
        podeVisualizar: true,
        isAdmin: true,
        acessoTotal: true,
        filtroAplicado: false,
        motivo: "Usuário administrador - acesso total",
        aviso: null,
      };
    }

    return {
      podeEditar: false,
      podeVisualizar: true,
      isAdmin: false,
      acessoTotal: false,
      filtroAplicado: true,
      motivo: "Usuário operador - acesso limitado ao município",
      aviso:
        user.municipio && user.uf
          ? `Visualizando dados de ${user.municipio}/${user.uf}`
          : "Município/UF não configurado",
    };
  }, []); // ✅ SEM DEPENDÊNCIAS - função pura

  // ✅ EFEITO PARA CALCULAR PERMISSÕES - SÓ QUANDO USUÁRIO MUDAR
  useEffect(() => {
    if (!mountedRef.current) return;

    const novasPermissoes = determinarPermissoes(usuarioMemo);
    setPermissoes(novasPermissoes);
  }, [usuarioMemo, determinarPermissoes]);

  // ✅ FUNÇÃO PARA CALCULAR MÉTRICAS - ESTÁVEL
  const calcularMetricasEmenda = useCallback((emendaData, despesasData) => {
    if (!emendaData) {
      return {
        valorTotal: 0,
        valorExecutado: 0,
        saldoDisponivel: 0,
        percentualExecutado: 0,
        totalDespesas: 0,
        despesasPendentes: 0,
        despesasAprovadas: 0,
        despesasPagas: 0,
        despesasRejeitadas: 0,
      };
    }

    const valorTotal = emendaData.valorTotal || emendaData.valorRecurso || 0;
    const despesasValidas = despesasData.filter(
      (d) => d.emendaId === emendaData.id,
    );

    const valorExecutado = despesasValidas.reduce(
      (sum, d) => sum + (d.valor || 0),
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
  }, []); // ✅ SEM DEPENDÊNCIAS - função pura

  // ✅ FUNÇÃO PARA CARREGAR EMENDA - ESTÁVEL
  const carregarEmenda = useCallback(async (id) => {
    if (!id || !mountedRef.current) return null;

    try {
      const emendaDoc = await getDoc(doc(db, "emendas", id));
      if (emendaDoc.exists() && mountedRef.current) {
        const emendaData = { id: emendaDoc.id, ...emendaDoc.data() };
        setEmenda(emendaData);
        return emendaData;
      } else {
        if (mountedRef.current) setError("Emenda não encontrada");
        return null;
      }
    } catch (err) {
      console.error("Erro ao carregar emenda:", err);
      if (mountedRef.current) setError("Erro ao carregar emenda");
      return null;
    }
  }, []); // ✅ SEM DEPENDÊNCIAS

  // ✅ FUNÇÃO PARA CARREGAR DESPESAS - ESTÁVEL
  const carregarDespesasEmenda = useCallback(async (id) => {
    if (!id || !mountedRef.current) return [];

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

      if (mountedRef.current) setDespesasEmenda(despesasData);
      return despesasData;
    } catch (err) {
      console.error("Erro ao carregar despesas da emenda:", err);
      if (mountedRef.current) setError("Erro ao carregar despesas");
      return [];
    }
  }, []); // ✅ SEM DEPENDÊNCIAS

  // ✅ FUNÇÃO PRINCIPAL PARA CARREGAR DADOS - COM THROTTLE
  const carregarTodasEmendasComMetricas = useCallback(async () => {
    if (!mountedRef.current) return [];

    // ✅ THROTTLE - evitar chamadas muito frequentes
    const now = Date.now();
    if (now - lastLoadRef.current < 1000) { // 1 segundo de throttle
      console.log("🚫 Carregamento throttled - muito frequente");
      return emendas;
    }
    lastLoadRef.current = now;

    try {
      setLoading(true);
      setError(null);

      let emendasQuery = query(
        collection(db, "emendas"),
        orderBy("numero", "asc"),
      );

      // ✅ Aplicar filtros baseados nas permissões
      if (permissoes.filtroAplicado && configMemo.filtroMunicipio && configMemo.filtroUf) {
        emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", configMemo.filtroMunicipio),
          where("uf", "==", configMemo.filtroUf),
          orderBy("numero", "asc"),
        );
      }

      const [emendasSnapshot, despesasSnapshot] = await Promise.all([
        getDocs(emendasQuery),
        getDocs(collection(db, "despesas")),
      ]);

      if (!mountedRef.current) return [];

      const emendasData = emendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const despesasData = despesasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Calcular métricas para cada emenda
      const emendasComMetricas = emendasData.map((emenda) => {
        const metricasEmenda = calcularMetricasEmenda(emenda, despesasData);
        return {
          ...emenda,
          ...metricasEmenda,
        };
      });

      if (mountedRef.current) {
        setEmendas(emendasComMetricas);
        setDespesas(despesasData);
      }

      return emendasComMetricas;
    } catch (err) {
      console.error("Erro ao carregar emendas:", err);
      if (mountedRef.current) setError("Erro ao carregar dados");
      return [];
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [
    emendas,
    permissoes.filtroAplicado,
    configMemo.filtroMunicipio,
    configMemo.filtroUf,
    calcularMetricasEmenda,
  ]);

  // ✅ OUTRAS FUNÇÕES ESTÁVEIS
  const validarNovaDespesa = useCallback(async (emendaId, valorDespesa) => {
    if (!emendaId || !valorDespesa || !mountedRef.current) {
      return { valida: false, erro: "Emenda e valor são obrigatórios" };
    }

    try {
      const emendaData = await carregarEmenda(emendaId);
      if (!emendaData) {
        return { valida: false, erro: "Emenda não encontrada" };
      }

      const despesasData = await carregarDespesasEmenda(emendaId);
      const metricas = calcularMetricasEmenda(emendaData, despesasData);

      if (valorDespesa > metricas.saldoDisponivel) {
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
  }, [carregarEmenda, carregarDespesasEmenda, calcularMetricasEmenda]);

  const atualizarSaldoEmenda = useCallback(async (emendaId) => {
    if (!emendaId || !mountedRef.current) return false;

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
  }, [carregarEmenda, carregarDespesasEmenda, calcularMetricasEmenda]);

  const obterEstatisticasGerais = useCallback(() => {
    if (!emendas.length) return null;

    const totalEmendas = emendas.length;
    const valorTotalGeral = emendas.reduce(
      (sum, e) => sum + (e.valorTotal || 0),
      0,
    );
    const valorExecutadoGeral = emendas.reduce(
      (sum, e) => sum + (e.valorExecutado || 0),
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
      totalDespesas: despesas.length,
    };
  }, [emendas, despesas]);

  const filtrarEmendas = useCallback((filtros = {}) => {
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

    return emendasFiltradas;
  }, [emendas]);

  const recarregar = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setError(null);

      if (configMemo.emendaId) {
        const [emendaData, despesasData] = await Promise.all([
          carregarEmenda(configMemo.emendaId),
          carregarDespesasEmenda(configMemo.emendaId),
        ]);

        if (emendaData && configMemo.incluirEstatisticas && mountedRef.current) {
          const metricasCalculadas = calcularMetricasEmenda(emendaData, despesasData);
          setMetricas(metricasCalculadas);
        }
      }

      if (configMemo.carregarTodasEmendas) {
        await carregarTodasEmendasComMetricas();
      }
    } catch (err) {
      console.error("Erro ao recarregar dados:", err);
      if (mountedRef.current) setError("Erro ao recarregar dados");
    }
  }, [
    configMemo.emendaId,
    configMemo.incluirEstatisticas,
    configMemo.carregarTodasEmendas,
    carregarEmenda,
    carregarDespesasEmenda,
    calcularMetricasEmenda,
    carregarTodasEmendasComMetricas,
  ]);

  // ✅ EFEITO PRINCIPAL - SÓ EXECUTA QUANDO NECESSÁRIO
  useEffect(() => {
    if (!usuarioMemo && configMemo.carregarTodasEmendas) {
      console.log("⏳ Aguardando dados do usuário...");
      return;
    }

    if (!configMemo.carregarTodasEmendas && !configMemo.emendaId) {
      setLoading(false);
      return;
    }

    const carregarDados = async () => {
      if (configMemo.carregarTodasEmendas && configMemo.userRole !== null) {
        await carregarTodasEmendasComMetricas();
      }

      if (configMemo.emendaId) {
        const [emendaData, despesasData] = await Promise.all([
          carregarEmenda(configMemo.emendaId),
          carregarDespesasEmenda(configMemo.emendaId),
        ]);

        if (emendaData && configMemo.incluirEstatisticas && mountedRef.current) {
          const metricasCalculadas = calcularMetricasEmenda(emendaData, despesasData);
          setMetricas(metricasCalculadas);
        }
      }
    };

    carregarDados();
  }, [
    usuarioMemo?.uid, // ✅ SÓ UID para evitar loops
    configMemo.carregarTodasEmendas,
    configMemo.userRole,
    configMemo.emendaId,
    configMemo.incluirEstatisticas,
  ]); // ✅ DEPENDÊNCIAS MÍNIMAS E ESTÁVEIS

  // ✅ CLEANUP AO DESMONTAR
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ✅ RETORNO DO HOOK
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

    // Funções estáveis
    carregarEmenda,
    carregarDespesasEmenda,
    carregarTodasEmendasComMetricas,
    recarregar,
    validarNovaDespesa,
    atualizarSaldoEmenda,
    calcularMetricasEmenda,
    obterEstatisticasGerais,
    filtrarEmendas,

    // Métodos auxiliares
    podeEditarCampo: (campo) => permissoes.isAdmin || permissoes.podeEditar,
    podeVisualizarCampo: (campo) => permissoes.isAdmin || permissoes.podeVisualizar,

    // Utilitários
    setError: (msg) => mountedRef.current && setError(msg),
    limparError: () => mountedRef.current && setError(null),
  };
};

export default useEmendaDespesa;