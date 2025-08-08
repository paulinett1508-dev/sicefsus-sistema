// src/hooks/useDashboardData.js
// 🎯 Hook centralizado para dados do Dashboard
// ✅ CORREÇÃO: Filtro operador com município + UF
// ✅ PRESERVADO: Lógica Admin 100% funcional

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const useDashboardData = (user, permissions) => {
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔧 ADMIN: Carrega todos os dados (PRESERVADO - funciona 100%)
  const carregarDadosAdmin = async () => {
    try {
      console.log("🔑 ADMIN: Carregando TODOS os dados do sistema");

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
      const userUf = user?.uf?.trim();

      console.log("🔑 OPERADOR: Aplicando filtros geográficos");
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

      // 🔧 ESTRATÉGIA: Buscar por UF e filtrar manualmente (resolve case sensitivity)
      console.log(
        "🔍 Buscando todas as emendas da UF para filtrar manualmente...",
      );

      const emendasQuery = userUf
        ? query(emendasRef, where("uf", "==", userUf))
        : query(emendasRef);

      const emendasSnapshot = await getDocs(emendasQuery);
      const todasEmendas = [];
      emendasSnapshot.forEach((doc) => {
        todasEmendas.push({ id: doc.id, ...doc.data() });
      });

      console.log(
        `📊 Total de emendas na UF ${userUf}: ${todasEmendas.length}`,
      );

      // 🎯 FILTRO MANUAL com normalização (resolve diferenças de case/acentos)
      const normalizarTexto = (texto) => {
        if (!texto) return "";
        return texto
          .toString()
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
      };

      const municipioNormalizado = normalizarTexto(userMunicipio);
      console.log("🔄 Município normalizado:", municipioNormalizado);

      const emendasData = todasEmendas.filter((emenda) => {
        const emendaMunicipio = normalizarTexto(emenda.municipio);
        const match = emendaMunicipio === municipioNormalizado;

        if (!match) {
          console.log(
            `🔍 Comparando: "${municipioNormalizado}" vs "${emendaMunicipio}" = ${match}`,
          );
        }

        return match;
      });

      console.log(
        `✅ Filtro manual encontrou: ${emendasData.length} emendas para ${userMunicipio}`,
      );

      // 🔍 DEBUG: Mostrar resultados da query
      console.log(
        `✅ OPERADOR encontrou: ${emendasData.length} emendas para ${userMunicipio}/${userUf}`,
      );

      if (emendasData.length > 0) {
        console.log("📋 Emendas encontradas:");
        emendasData.forEach((emenda) => {
          console.log(
            `  - ${emenda.numero || "S/N"}: ${emenda.municipio}/${emenda.uf} - ${emenda.autor}`,
          );
        });
      } else {
        console.warn("⚠️ Após filtro manual ainda não encontrou emendas");
        console.warn("📊 Todas as emendas da UF para comparação:");
        todasEmendas.forEach((emenda) => {
          const normalizada = normalizarTexto(emenda.municipio);
          console.warn(
            `  - Original: "${emenda.municipio}" | Normalizada: "${normalizada}" | Match: ${normalizada === municipioNormalizado}`,
          );
        });
      }

      // Carregar despesas das emendas encontradas
      let despesasData = [];
      if (emendasData.length > 0) {
        const emendasIds = emendasData.map((e) => e.id);
        const batchSize = 10;

        for (let i = 0; i < emendasIds.length; i += batchSize) {
          const batch = emendasIds.slice(i, i + batchSize);
          const despesasRef = collection(db, "despesas");
          const despesasQuery = query(
            despesasRef,
            where("emendaId", "in", batch),
          );
          const despesasSnapshot = await getDocs(despesasQuery);
          despesasSnapshot.forEach((doc) => {
            despesasData.push({ id: doc.id, ...doc.data() });
          });
        }
      }

      console.log(`✅ OPERADOR carregou: ${despesasData.length} despesas`);
      return { emendasData, despesasData };
    } catch (error) {
      console.error("❌ Erro operador:", error);
      throw error;
    }
  };

  // 🎯 Função principal de carregamento
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Iniciando carregamento de dados:", {
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

      // ✅ CORREÇÃO: Calcular execução individual de cada emenda
      const emendasComExecucao = resultado.emendasData.map((emenda) => {
        // Calcular despesas desta emenda
        const despesasEmenda = resultado.despesasData.filter(
          (despesa) => despesa.emendaId === emenda.id,
        );

        // Calcular valores
        const valorTotal = parseFloat(emenda.valorRecurso || emenda.valor || 0);
        const valorExecutado = despesasEmenda.reduce((sum, despesa) => {
          return sum + parseFloat(despesa.valor || 0);
        }, 0);

        const saldoDisponivel = valorTotal - valorExecutado;
        const percentualExecutado =
          valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

        return {
          ...emenda,
          valorExecutado,
          saldoDisponivel,
          percentualExecutado,
          totalDespesas: despesasEmenda.length,
          despesasVinculadas: despesasEmenda,
        };
      });

      setEmendas(emendasComExecucao);
      setDespesas(resultado.despesasData);
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 📊 Calcular estatísticas dos dados carregados
  const calcularEstatisticas = () => {
    const totalEmendas = emendas.length;
    const totalDespesas = despesas.length;

    const valorTotalEmendas = emendas.reduce((total, emenda) => {
      const valor = parseFloat(emenda.valor || emenda.valorRecurso || 0);
      return total + (isNaN(valor) ? 0 : valor);
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
      valorExecutado, // ✅ Nome corrigido
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
