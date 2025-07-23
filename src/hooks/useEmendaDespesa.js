// src/hooks/useEmendaDespesa.js - CORREÇÃO CRÍTICA IMPLEMENTADA
// HOOK CUSTOMIZADO - RELACIONAMENTO EMENDA-DESPESA
// ✅ Gerencia relacionamento crítico + cálculos automáticos + validações

import { useState, useEffect, useCallback } from "react";
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
 * @param {Object} usuario - Dados completos do usuário (CORREÇÃO: era string emendaId)
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Dados e funções para gerenciar relacionamento
 */
const useEmendaDespesa = (usuario = null, options = {}) => {
  // Debug logs removidos para melhorar performance

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

  // ✅ CONFIGURAÇÕES DO HOOK
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

  // ✅ CORREÇÃO PRINCIPAL: FUNÇÃO determinarPermissoes (linha ~65)
  const determinarPermissoes = useCallback((user) => {
    console.log("🎯 INICIANDO determinarPermissoes com:", user);

    if (!user) {
      console.log("❌ Usuário não fornecido");
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

    // ✅ VERIFICAÇÃO ROBUSTA DE ADMIN
    const role = user.role;
    console.log("🔍 Role extraída:", role, "| Tipo:", typeof role);

    // Verificação múltipla para garantir detecção de admin
    const isAdmin =
      role === "admin" ||
      role === "Admin" ||
      role === "ADMIN" ||
      (typeof role === "string" && role.toLowerCase() === "admin");

    console.log("👑 isAdmin calculado:", isAdmin);

    if (isAdmin) {
      console.log("✅ ADMIN DETECTADO - Liberando todas as permissões");
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

    // Para usuários não-admin
    console.log("👤 Usuário comum - permissões limitadas");
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
  }, []);

  // ✅ EFEITO: Calcular permissões quando usuário muda
  useEffect(() => {
    console.log("🔄 useEffect disparado - recalculando permissões");
    const novasPermissoes = determinarPermissoes(usuario);
    console.log("📋 Novas permissões calculadas:", novasPermissoes);
    setPermissoes(novasPermissoes);
  }, [usuario, determinarPermissoes]);

  // ✅ FUNÇÃO: Calcular métricas financeiras de uma emenda
  const calcularMetricasEmenda = useCallback(
    (emendaData, despesasData) => {
      if (!emendaData) return metricas;

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

      // ✅ ESTATÍSTICAS POR STATUS (se disponível)
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
    [metricas],
  );

  // ✅ FUNÇÃO: Carregar emenda específica
  const carregarEmenda = useCallback(async (id) => {
    if (!id) return null;

    try {
      setLoading(true);
      const emendaDoc = await getDoc(doc(db, "emendas", id));

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
      setError("Erro ao carregar emenda");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FUNÇÃO: Carregar despesas de uma emenda
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

      setDespesasEmenda(despesasData);
      return despesasData;
    } catch (err) {
      console.error("Erro ao carregar despesas da emenda:", err);
      setError("Erro ao carregar despesas");
      return [];
    }
  }, []);

  // ✅ FUNÇÃO: Carregar todas as emendas com métricas - COM FILTROS DE PERMISSÃO
  const carregarTodasEmendasComMetricas = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ Query base
      let emendasQuery = query(
        collection(db, "emendas"),
        orderBy("numero", "asc"),
      );

      // ✅ Aplicar filtros baseados nas permissões
      if (permissoes.filtroAplicado && filtroMunicipio && filtroUf) {
        console.log("🔍 Aplicando filtros:", { filtroMunicipio, filtroUf });
        emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", filtroMunicipio),
          where("uf", "==", filtroUf),
          orderBy("numero", "asc"),
        );
      }

      const [emendasSnapshot, despesasSnapshot] = await Promise.all([
        getDocs(emendasQuery),
        getDocs(collection(db, "despesas")),
      ]);

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

      console.log("📊 Emendas carregadas:", emendasComMetricas.length);
      setEmendas(emendasComMetricas);
      setDespesas(despesasData);

      return emendasComMetricas;
    } catch (err) {
      console.error("Erro ao carregar emendas:", err);
      setError("Erro ao carregar dados");
      return [];
    } finally {
      setLoading(false);
    }
  }, [
    calcularMetricasEmenda,
    permissoes.filtroAplicado,
    filtroMunicipio,
    filtroUf,
  ]);

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

        // ✅ Atualizar documento da emenda no Firestore
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

  // ✅ FUNÇÃO: Obter estatísticas gerais
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

    const emendasComSaldo = emendas.filter(
      (e) => (e.saldoDisponivel || 0) > 0,
    ).length;
    const emendasEsgotadas = emendas.filter(
      (e) => (e.saldoDisponivel || 0) <= 0,
    ).length;
    const emendasSemDespesas = emendas.filter(
      (e) => (e.totalDespesas || 0) === 0,
    ).length;

    const mediaExecucao =
      totalEmendas > 0
        ? emendas.reduce((sum, e) => sum + (e.percentualExecutado || 0), 0) /
          totalEmendas
        : 0;

    return {
      totalEmendas,
      valorTotalGeral,
      valorExecutadoGeral,
      saldoDisponivelGeral,
      percentualGeralExecutado:
        valorTotalGeral > 0 ? (valorExecutadoGeral / valorTotalGeral) * 100 : 0,
      emendasComSaldo,
      emendasEsgotadas,
      emendasSemDespesas,
      mediaExecucao,
      totalDespesas: despesas.length,
    };
  }, [emendas, despesas]);

  // ✅ FUNÇÃO: Filtrar emendas por critérios
  const filtrarEmendas = useCallback(
    (filtros = {}) => {
      let emendasFiltradas = [...emendas];

      // Filtro por texto
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

      // Filtro por parlamentar
      if (filtros.parlamentar) {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => e.parlamentar === filtros.parlamentar,
        );
      }

      // Filtro por tipo
      if (filtros.tipo) {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => e.tipo === filtros.tipo,
        );
      }

      // Filtro por status financeiro
      if (filtros.statusFinanceiro === "com-saldo") {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => (e.saldoDisponivel || 0) > 0,
        );
      } else if (filtros.statusFinanceiro === "esgotadas") {
        emendasFiltradas = emendasFiltradas.filter(
          (e) => (e.saldoDisponivel || 0) <= 0,
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

  // ✅ FUNÇÃO: Recarregar dados - OTIMIZADA
  const recarregar = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Se há uma emenda específica, carregá-la
      if (emendaId) {
        const [emendaData, despesasData] = await Promise.all([
          carregarEmenda(emendaId),
          carregarDespesasEmenda(emendaId),
        ]);

        if (emendaData && incluirEstatisticas) {
          const metricasCalculadas = calcularMetricasEmenda(
            emendaData,
            despesasData,
          );
          setMetricas(metricasCalculadas);
        }
      }

      if (carregarTodasEmendas) {
        await carregarTodasEmendasComMetricas();
      }
    } catch (err) {
      console.error("Erro ao recarregar dados:", err);
      setError("Erro ao recarregar dados");
    } finally {
      setLoading(false);
    }
  }, [
    emendaId,
    incluirEstatisticas,
    carregarTodasEmendas,
    carregarEmenda,
    carregarDespesasEmenda,
    calcularMetricasEmenda,
    carregarTodasEmendasComMetricas,
  ]);

  // ✅ EFEITO: Carregar dados iniciais - OTIMIZADO
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      // ✅ Só carregar se usuário estiver disponível OU se for carregamento total
      if (!usuario && carregarTodasEmendas && userRole === null) {
        console.log("⏳ Aguardando dados do usuário antes de carregar...");
        return;
      }

      setError(null);

      if (emendaId) {
        const [emendaData, despesasData] = await Promise.all([
          carregarEmenda(emendaId),
          carregarDespesasEmenda(emendaId),
        ]);

        if (emendaData && incluirEstatisticas) {
          const metricasCalculadas = calcularMetricasEmenda(
            emendaData,
            despesasData,
          );
          setMetricas(metricasCalculadas);
        }
      }

      if (carregarTodasEmendas && userRole !== null) {
        console.log("📊 Carregando todas as emendas...");
        await carregarTodasEmendasComMetricas();
      }
    };

    carregarDadosIniciais();
  }, [
    usuario,
    userRole,
    carregarTodasEmendas,
    emendaId,
    incluirEstatisticas,
    carregarEmenda,
    carregarDespesasEmenda,
    calcularMetricasEmenda,
    carregarTodasEmendasComMetricas,
  ]);

  // ✅ EFEITO: Listener em tempo real (se autoRefresh ativado)
  useEffect(() => {
    if (!autoRefresh) return;

    let unsubscribeEmendas;
    let unsubscribeDespesas;

    // Listener para emendas
    if (carregarTodasEmendas && userRole !== null) {
      let emendasQuery = query(
        collection(db, "emendas"),
        orderBy("numero", "asc"),
      );

      // Aplicar filtros se necessário
      if (permissoes.filtroAplicado && filtroMunicipio && filtroUf) {
        emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", filtroMunicipio),
          where("uf", "==", filtroUf),
          orderBy("numero", "asc"),
        );
      }

      unsubscribeEmendas = onSnapshot(
        emendasQuery,
        (snapshot) => {
          const emendasData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEmendas(emendasData);
        },
        (error) => {
          console.error("Erro no listener de emendas:", error);
          setError("Erro ao acompanhar mudanças nas emendas");
        },
      );
    }

    // Listener para despesas
    const despesasQuery = emendaId
      ? query(
          collection(db, "despesas"),
          where("emendaId", "==", emendaId),
          orderBy("data", "desc"),
        )
      : query(collection(db, "despesas"), orderBy("data", "desc"));

    unsubscribeDespesas = onSnapshot(
      despesasQuery,
      (snapshot) => {
        const despesasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (emendaId) {
          setDespesasEmenda(despesasData);
        } else {
          setDespesas(despesasData);
        }

        // Recalcular métricas se necessário
        if (emenda && incluirEstatisticas) {
          const metricasCalculadas = calcularMetricasEmenda(
            emenda,
            despesasData,
          );
          setMetricas(metricasCalculadas);
        }
      },
      (error) => {
        console.error("Erro no listener de despesas:", error);
        setError("Erro ao acompanhar mudanças nas despesas");
      },
    );

    return () => {
      if (unsubscribeEmendas) unsubscribeEmendas();
      if (unsubscribeDespesas) unsubscribeDespesas();
    };
  }, [
    autoRefresh,
    carregarTodasEmendas,
    userRole,
    emendaId,
    emenda,
    incluirEstatisticas,
    calcularMetricasEmenda,
    permissoes.filtroAplicado,
    filtroMunicipio,
    filtroUf,
  ]);

  // ✅ Log final das permissões
  console.log("🏁 PERMISSÕES FINAIS DO HOOK:", permissoes);

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

    // ✅ PERMISSÕES ADICIONADAS
    permissoes,
    ...permissoes, // Espalha podeEditar, podeVisualizar, isAdmin

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

    // ✅ MÉTODOS AUXILIARES PARA COMPATIBILIDADE
    podeEditarCampo: (campo) => {
      const pode = permissoes.isAdmin || permissoes.podeEditar;
      console.log(`🔐 podeEditarCampo(${campo}): ${pode}`);
      return pode;
    },

    podeVisualizarCampo: (campo) => {
      const pode = permissoes.isAdmin || permissoes.podeVisualizar;
      console.log(`👁️ podeVisualizarCampo(${campo}): ${pode}`);
      return pode;
    },

    // Utilitários
    setError: (msg) => setError(msg),
    limparError: () => setError(null),
  };
};

export default useEmendaDespesa;