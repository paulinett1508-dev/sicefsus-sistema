// src/hooks/useDashboardData.js
// 🎯 Hook centralizado para dados do Dashboard
// ✅ CORREÇÃO: Filtro operador com município + UF
// ✅ PRESERVADO: Lógica Admin 100% funcional
// ✅ CORREÇÃO: parseValorMonetario para cálculos monetários
// ✅ NOVO: Cache com TTL para otimização de performance

import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { parseValorMonetario } from "../utils/formatters";
import { DESPESA_STATUS } from "../config/constants";

// ✅ CACHE GLOBAL com TTL de 5 minutos
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos em ms
const dashboardCache = {
  data: null,
  timestamp: null,
  userKey: null,
};

const getCacheKey = (user, permissions) => {
  return `${user?.email}_${permissions?.acessoTotal ? 'admin' : user?.municipio}_${user?.uf}`;
};

const isCacheValid = (cacheKey) => {
  if (!dashboardCache.data || dashboardCache.userKey !== cacheKey) {
    return false;
  }
  const now = Date.now();
  const elapsed = now - dashboardCache.timestamp;
  return elapsed < CACHE_TTL;
};

const setCache = (data, cacheKey) => {
  dashboardCache.data = data;
  dashboardCache.timestamp = Date.now();
  dashboardCache.userKey = cacheKey;
};

const getCache = () => dashboardCache.data;

const useDashboardData = (user, permissions) => {
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  // Cleanup para evitar setState após desmontagem
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 🔧 ADMIN: Carrega todos os dados (PRESERVADO - funciona 100%)
  const carregarDadosAdmin = async () => {
    try {
      console.log("🔓 ADMIN: Carregando TODOS os dados do sistema");

      const emendasRef = collection(db, "emendas");
      const emendasSnapshot = await getDocs(emendasRef);
      const emendasData = [];
      emendasSnapshot.forEach((doc) => {
        emendasData.push({ id: doc.id, ...doc.data() });
      });

      const despesasRef = collection(db, "despesas");
      const despesasSnapshot = await getDocs(despesasRef);
      const despesasData = [];
      despesasSnapshot.forEach((doc) => {
        despesasData.push({ id: doc.id, ...doc.data() });
      });

      console.log(
        `✅ ADMIN carregou: ${emendasData.length} emendas, ${despesasData.length} despesas`,
      );
      return { emendasData, despesasData };
    } catch (error) {
      console.error("❌ Erro admin:", error);
      throw error;
    }
  };

  // 🔧 OPERADOR: Carrega dados filtrados (CORRIGIDO)
  const carregarDadosOperador = async () => {
    try {
      const userMunicipio = user?.municipio?.trim();

      // ✅ VALIDAÇÃO: Município vazio = sem dados
      if (!userMunicipio || userMunicipio === "") {
        console.warn("⚠️ Operador sem município definido, retornando dados vazios");
        return { emendasData: [], despesasData: [] };
      }
      const userUf = user?.uf?.trim();

      console.log("🔐 OPERADOR/GESTOR: Aplicando filtros geográficos");
      console.log("👤 Dados do usuário:", {
        email: user?.email,
        municipio: userMunicipio,
        uf: userUf,
        tipo: user?.tipo,
      });

      if (!userMunicipio) {
        throw new Error("❌ Operador deve ter município definido");
      }

      const emendasRef = collection(db, "emendas");

      // ✅ CARREGAR EMENDAS COM FILTRO COMPOSTO (município + UF)
      const emendasQuery = query(
        emendasRef,
        where("municipio", "==", userMunicipio),
        where("uf", "==", userUf)
      );

      const emendasSnapshot = await getDocs(emendasQuery);
      const emendasData = [];
      emendasSnapshot.forEach((doc) => {
        emendasData.push({ id: doc.id, ...doc.data() });
      });

      console.log(
        `✅ OPERADOR/GESTOR encontrou: ${emendasData.length} emendas para ${userMunicipio}/${userUf}`,
      );

      // ✅ CORREÇÃO: Carregar despesas pelo emendaId (não por município)
      // Despesas são vinculadas às emendas, não têm município próprio
      let despesasData = [];
      if (emendasData.length > 0) {
        const emendasIds = emendasData.map((e) => e.id);
        const batchSize = 10; // Firestore limita "in" a 10 valores

        for (let i = 0; i < emendasIds.length; i += batchSize) {
          const batch = emendasIds.slice(i, i + batchSize);
          const despesasRef = collection(db, "despesas");
          // ✅ FILTRAR DESPESAS PELO emendaId (vinculadas às emendas do município)
          const despesasQuery = query(
            despesasRef,
            where("emendaId", "in", batch)
          );
          const despesasSnapshot = await getDocs(despesasQuery);
          despesasSnapshot.forEach((doc) => {
            despesasData.push({ id: doc.id, ...doc.data() });
          });
        }
      }

      console.log(`✅ OPERADOR/GESTOR carregou: ${despesasData.length} despesas (via emendaId)`);
      return { emendasData, despesasData };
    } catch (error) {
      console.error("❌ Erro operador/gestor:", error);
      throw error;
    }
  };

  // 🎯 Função principal de carregamento
  const carregarDados = async () => {
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey(user, permissions);

      // ✅ PERFORMANCE: Verificar cache antes de buscar do Firestore
      if (isCacheValid(cacheKey)) {
        console.log("⚡ Dados carregados do cache (válido por mais",
          Math.round((CACHE_TTL - (Date.now() - dashboardCache.timestamp)) / 1000),
          "segundos)");
        const cachedData = getCache();
        if (!isMountedRef.current) return;
        setEmendas(cachedData.emendas);
        setDespesas(cachedData.despesas);
        setLoading(false);
        return;
      }

      console.log("🔄 Carregando dados do Firestore:", {
        userEmail: user?.email,
        userTipo: user?.tipo,
        acessoTotal: permissions?.acessoTotal,
        filtroAplicado: permissions?.filtroAplicado,
      });

      let resultado;

      // Determinar estratégia de carregamento baseada em permissões
      if (permissions?.acessoTotal) {
        resultado = await carregarDadosAdmin();
      } else if (permissions?.filtroAplicado && user?.municipio) {
        resultado = await carregarDadosOperador();
      } else {
        // Caso de erro: operador sem município ou permissões inválidas
        const mensagem = !user?.municipio
          ? "Usuário operador sem município cadastrado"
          : "Configuração de permissões inválida";
        throw new Error(mensagem);
      }

      // Verificar se componente ainda está montado após operações async
      if (!isMountedRef.current) return;

      // ✅ CORREÇÃO: Calcular execução individual de cada emenda COM parseValorMonetario
      const emendasComExecucao = resultado.emendasData.map((emenda) => {
        const todasDespesasEmenda = resultado.despesasData.filter(
          (despesa) => despesa.emendaId === emenda.id
        );

        // ✅ SEPARAR: Executado (pago) e Planejado
        const despesasExecutadas = todasDespesasEmenda.filter(
          (despesa) => despesa.status !== DESPESA_STATUS.PLANEJADA
        );

        const despesasPlanejadas = todasDespesasEmenda.filter(
          (despesa) => despesa.status === DESPESA_STATUS.PLANEJADA
        );

        // ✅ CORREÇÃO P1: Ordem padronizada de fallback
        const valorTotal = parseValorMonetario(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);

        // ✅ CORREÇÃO: Usar parseValorMonetario no reduce
        const valorExecutado = despesasExecutadas.reduce((sum, despesa) => {
          return sum + parseValorMonetario(despesa.valor);
        }, 0);

        const valorPlanejado = despesasPlanejadas.reduce((sum, despesa) => {
          return sum + parseValorMonetario(despesa.valor);
        }, 0);

        // Saldo considera apenas EXECUTADAS (alinhado com emendaCalculos.js)
        const saldoDisponivel = valorTotal - valorExecutado;
        
        const percentualExecutado =
          valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

        const percentualPlanejado =
          valorTotal > 0 ? (valorPlanejado / valorTotal) * 100 : 0;

        // Alerta: Detectar execucao acima de 100%
        if (percentualExecutado > 100 && valorTotal > 0) {
          console.error(`Dashboard: Emenda ${emenda.numero || emenda.id} executou ${percentualExecutado.toFixed(1)}%`, {
            valorTotal,
            valorExecutado,
            excesso: valorExecutado - valorTotal,
            totalDespesas: todasDespesasEmenda.length
          });
        }

        return {
          ...emenda,
          valorExecutado,
          valorPlanejado,
          saldoDisponivel,
          percentualExecutado,
          percentualPlanejado,
          totalDespesas: todasDespesasEmenda.length,
          despesasVinculadas: todasDespesasEmenda,
        };
      });

      setEmendas(emendasComExecucao);
      setDespesas(resultado.despesasData);

      // ✅ PERFORMANCE: Salvar no cache
      setCache({
        emendas: emendasComExecucao,
        despesas: resultado.despesasData,
      }, cacheKey);
      
      console.log("💾 Dados salvos no cache (válido por 5 minutos)");
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      if (isMountedRef.current) {
        setError(error.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 📊 Calcular estatísticas dos dados carregados
  const calcularEstatisticas = () => {
    const totalEmendas = emendas.length;
    const totalDespesas = despesas.length;

    // ✅ CORREÇÃO P1: Ordem padronizada de fallback
    const valorTotalEmendas = emendas.reduce((total, emenda) => {
      const valor = parseValorMonetario(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
      return total + valor;
    }, 0);

    // ✅ CORREÇÃO: Usar valorExecutado já calculado em cada emenda
    const valorExecutado = emendas.reduce((total, emenda) => {
      return total + (emenda.valorExecutado || 0);
    }, 0);

    const saldoDisponivel = valorTotalEmendas - valorExecutado;
    const percentualExecutado =
      valorTotalEmendas > 0 ? (valorExecutado / valorTotalEmendas) * 100 : 0;

    return {
      totalEmendas,
      totalDespesas,
      valorTotalEmendas,
      valorExecutado,
      saldoDisponivel,
      percentualExecutado: Math.round(percentualExecutado * 100) / 100,
    };
  };

  // 🔄 Effect para carregar dados quando usuário/permissões mudam
  useEffect(() => {
    const shouldLoad =
      user?.email &&
      user?.tipo &&
      permissions?.temAcesso &&
      permissions.temAcesso();

    if (shouldLoad) {
      carregarDados();
    } else if (user && !permissions?.temAcesso?.()) {
      setError("Usuário sem permissão para acessar o dashboard");
      setLoading(false);
    }
  }, [
    user?.email,
    user?.tipo,
    user?.municipio,
    user?.uf,
    permissions?.acessoTotal,
    permissions?.filtroAplicado,
  ]);

  // 🎯 Retornar estado e funções
  return {
    // Dados
    emendas,
    despesas,

    // Estados
    loading,
    error,

    // Estatísticas calculadas
    stats: calcularEstatisticas(),

    // Funções
    recarregar: carregarDados,

    // Informações de debug
    debug: {
      totalCarregado: emendas.length + despesas.length,
      filtroAtivo: permissions?.filtroAplicado,
      tipoUsuario: user?.tipo,
      localizacao: `${user?.municipio || "N/A"}/${user?.uf || "N/A"}`,
    },
  };
};

export default useDashboardData;