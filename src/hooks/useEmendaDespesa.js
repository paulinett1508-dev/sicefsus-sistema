// src/hooks/useEmendaDespesa.js - VERSÃO CORRIGIDA v2.0
// ✅ CORREÇÃO CRÍTICA: Permissões funcionando corretamente
// ✅ CORREÇÃO: Admin sempre pode editar
// ✅ CORREÇÃO: Operadores podem editar (filtros aplicados apenas na busca)

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
 * @param {Object} usuario - Dados completos do usuário
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Dados e funções para gerenciar relacionamento
 */
const useEmendaDespesa = (usuario = null, options = {}) => {
  // ✅ DEBUG: Log do usuário recebido
  console.log(
    "🔧 useEmendaDespesa CORRIGIDO - usuário:",
    usuario?.email,
    "role:",
    usuario?.role,
  );

  // ✅ ESTADOS PRINCIPAIS
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
  } = options;

  // ✅ CORREÇÃO PRINCIPAL: Função determinarPermissoes SIMPLIFICADA
  const determinarPermissoes = useCallback((user) => {
    console.log(
      "🎯 CORREÇÃO: determinarPermissoes com:",
      user?.email,
      user?.role,
    );

    // ✅ Usuário inexistente
    if (!user || !user.role) {
      console.log("❌ Usuário inválido");
      return {
        podeEditar: true,
        podeVisualizar: true,
        isAdmin: true,
        acessoTotal: true,
        filtroAplicado: true,
        motivo: "Usuário não autenticado",
      };
    }

    const role = String(user.role).toLowerCase().trim();
    console.log("🔍 Role processada:", role);

    // ✅ ADMIN: Acesso TOTAL e IMEDIATO
    if (role === "admin") {
      console.log("✅ ADMIN CONFIRMADO - LIBERANDO TUDO!");
      return {
        podeEditar: true,
        podeVisualizar: true,
        isAdmin: true,
        acessoTotal: true,
        filtroAplicado: false,
        motivo: "Administrador - acesso total",
      };
    }

    // ✅ OPERADOR: SEMPRE pode editar (filtros só na busca)
    if (role === "user" || role === "operador") {
      console.log("👤 OPERADOR CONFIRMADO - LIBERANDO EDIÇÃO!");
      return {
        podeEditar: true, // ✅ CORREÇÃO CRÍTICA: Sempre true
        podeVisualizar: true,
        isAdmin: false,
        acessoTotal: false,
        filtroAplicado: Boolean(user.municipio && user.uf),
        motivo: `Operador com acesso de edição`,
      };
    }

    // ✅ Role desconhecida
    console.log("❌ Role não reconhecida:", role);
    return {
      podeEditar: true,
      podeVisualizar: true,
      isAdmin: true,
      acessoTotal: true,
      filtroAplicado: true,
      motivo: `Role desconhecida: ${role}`,
    };
  }, []);

  // ✅ CORREÇÃO: useEffect de permissões ESTABILIZADO
  useEffect(() => {
    console.log("🔄 CORREÇÃO: Recalculando permissões");

    if (!usuario) {
      setPermissoes({
        podeEditar: true,
        podeVisualizar: true,
        isAdmin: true,
        acessoTotal: true,
        filtroAplicado: true,
      });
      return;
    }

    const novasPermissoes = determinarPermissoes(usuario);
    console.log("📋 CORREÇÃO: Permissões calculadas:", novasPermissoes);
    setPermissoes(novasPermissoes);

    // ✅ Limpar erro se usuário pode editar
    if (novasPermissoes.podeEditar || novasPermissoes.isAdmin) {
      setError(null);
    }
  }, [usuario?.uid, usuario?.role]);

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

  // ✅ FUNÇÃO: Carregar todas as emendas - COM FILTROS CORRETOS
  const carregarTodasEmendasComMetricas = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ Query base
      let emendasQuery = query(
        collection(db, "emendas"),
        orderBy("numero", "asc"),
      );

      // ✅ Aplicar filtros APENAS para operadores (se admin, carrega tudo)
      if (!permissoes.isAdmin && filtroMunicipio && filtroUf) {
        console.log("🔍 Aplicando filtros para operador:", {
          filtroMunicipio,
          filtroUf,
        });
        emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", filtroMunicipio),
          where("uf", "==", filtroUf),
          orderBy("numero", "asc"),
        );
      } else if (permissoes.isAdmin) {
        console.log("👑 Admin - carregando TODAS as emendas");
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
        return { ...emenda, ...metricasEmenda };
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
  }, [calcularMetricasEmenda, permissoes.isAdmin, filtroMunicipio, filtroUf]);

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

  // ✅ FUNÇÃO: Recarregar dados
  const recarregar = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      if (options.emendaId) {
        const [emendaData, despesasData] = await Promise.all([
          carregarEmenda(options.emendaId),
          carregarDespesasEmenda(options.emendaId),
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
    options.emendaId,
    incluirEstatisticas,
    carregarTodasEmendas,
    carregarEmenda,
    carregarDespesasEmenda,
    calcularMetricasEmenda,
    carregarTodasEmendasComMetricas,
  ]);

  // ✅ EFEITO: Carregar dados iniciais
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      if (!usuario && carregarTodasEmendas && userRole === null) {
        console.log("⏳ Aguardando dados do usuário...");
        return;
      }

      setError(null);

      if (options.emendaId) {
        const [emendaData, despesasData] = await Promise.all([
          carregarEmenda(options.emendaId),
          carregarDespesasEmenda(options.emendaId),
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
    options.emendaId,
    incluirEstatisticas,
    carregarEmenda,
    carregarDespesasEmenda,
    calcularMetricasEmenda,
    carregarTodasEmendasComMetricas,
  ]);

  // ✅ EFEITO: Listener em tempo real
  useEffect(() => {
    if (!autoRefresh) return;

    let unsubscribeEmendas;
    let unsubscribeDespesas;

    if (carregarTodasEmendas && userRole !== null) {
      let emendasQuery = query(
        collection(db, "emendas"),
        orderBy("numero", "asc"),
      );

      if (!permissoes.isAdmin && filtroMunicipio && filtroUf) {
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

    const despesasQuery = options.emendaId
      ? query(
          collection(db, "despesas"),
          where("emendaId", "==", options.emendaId),
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

        if (options.emendaId) {
          setDespesasEmenda(despesasData);
        } else {
          setDespesas(despesasData);
        }

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
    options.emendaId,
    emenda,
    incluirEstatisticas,
    calcularMetricasEmenda,
    permissoes.isAdmin,
    filtroMunicipio,
    filtroUf,
  ]);

  // ✅ FUNÇÃO DEBUG para console
  if (typeof window !== "undefined") {
    window.debugPermissoes = () => {
      console.log("🔍 DEBUG PERMISSÕES:");
      console.log("Usuario:", usuario);
      console.log("Permissões:", permissoes);
      console.log("podeEditar:", permissoes?.podeEditar);
      console.log("isAdmin:", permissoes?.isAdmin);
    };
  }

  // ✅ Log final das permissões
  console.log("🏁 PERMISSÕES FINAIS DO HOOK:", permissoes);

  // ✅ RETORNO DO HOOK CORRIGIDO
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

    // ✅ PERMISSÕES CORRIGIDAS
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

    // ✅ MÉTODOS AUXILIARES CORRIGIDOS
    podeEditarCampo: (campo) => {
      const podeEditar = permissoes?.podeEditar || permissoes?.isAdmin || false;
      console.log(`🔐 CORRIGIDO podeEditarCampo(${campo}):`, podeEditar);
      return podeEditar;
    },

    podeVisualizarCampo: (campo) => {
      const pode = permissoes?.isAdmin || permissoes?.podeVisualizar || false;
      console.log(`👁️ podeVisualizarCampo(${campo}):`, pode);
      return pode;
    },

    // Utilitários
    setError: (msg) => setError(msg),
    limparError: () => setError(null),
  };
};

export default useEmendaDespesa;
