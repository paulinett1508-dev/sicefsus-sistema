// src/hooks/useRelatoriosData.js
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { parseFirestoreTimestamp, parseValorMonetario } from "../utils/formatters";

// enabled: lazy loading — só carrega quando o usuário selecionar um relatório
export function useRelatoriosData(usuario, enabled = false) {
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userRole = usuario?.role || usuario?.tipo;
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  useEffect(() => {
    // Não carrega até o usuário selecionar um tipo de relatório
    if (!enabled) {
      setEmendas([]);
      setDespesas([]);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    async function loadData() {
      if (mounted) {
        setLoading(true);
        setError(null);
      }

      try {
        // 🔒 SEGURANÇA: Operador/Gestor SEM localização válida não pode ver NADA
        const isAdmin = userRole === "admin";
        const temLocalizacaoValida = userMunicipio && userUf;

        if (!isAdmin && !temLocalizacaoValida) {
          if (mounted) {
            setEmendas([]);
            setDespesas([]);
            setError("Seu cadastro não possui município/UF definido. Contate o administrador.");
            setLoading(false);
          }
          return;
        }

        // Construir queries (emendas + despesas) antes de disparar em paralelo
        // 🔒 IMPORTANTE: Firestore Rules exigem filtro por municipio E uf para operadores/gestores
        let emendasRef = collection(db, "emendas");
        let despesasRef = collection(db, "despesas");

        if (!isAdmin) {
          const filtroLocalizacao = [
            where("municipio", "==", userMunicipio),
            where("uf", "==", userUf),
          ];
          emendasRef = query(emendasRef, ...filtroLocalizacao);
          despesasRef = query(despesasRef, ...filtroLocalizacao);
        }

        // Disparar as duas queries em paralelo — reduz latência de T(e)+T(d) para max(T(e),T(d))
        const [emendasSnapshot, despesasSnapshot] = await Promise.all([
          getDocs(emendasRef),
          getDocs(despesasRef),
        ]);

        const emendasData = emendasSnapshot.docs.map((doc) => {
          const data = doc.data();
          const valorOriginal = data.valor || data.valorRecurso || data.valorTotal || 0;
          return {
            id: doc.id,
            ...data,
            valorTotal: parseValorMonetario(valorOriginal),
          };
        });

        let despesasData = despesasSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            valor: parseValorMonetario(data.valor),
          };
        });

        // Filtro adicional por emendas permitidas (segurança extra)
        if (!isAdmin) {
          const allowedEmendaIds = new Set(emendasData.map((e) => e.id));
          despesasData = despesasData.filter((d) =>
            allowedEmendaIds.has(d.emendaId),
          );
        }

        if (mounted) {
          setEmendas(emendasData);
          setDespesas(despesasData);
        }
      } catch (error) {
        if (mounted) setError(error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => { mounted = false; };
  }, [enabled, userRole, userMunicipio, userUf]);

  // Função para aplicar filtros aos dados
  // opcoes.usarMesAno: true para relatórios que usam mes/ano em vez de período (ex: consolidado-mensal)
  const aplicarFiltros = (filtros, { usarMesAno = false } = {}) => {
    // Base: excluir emendas inativas
    let emendasFiltradas = emendas.filter(
      (e) => (e.status || "").toLowerCase() !== "inativa",
    );
    let despesasFiltradas = [...despesas];

    // Pré-calcular limites de data uma única vez
    let tsInicio = filtros.dataInicio
      ? new Date(filtros.dataInicio).getTime()
      : null;
    let tsFim = null;
    if (filtros.dataFim) {
      const d = new Date(filtros.dataFim);
      d.setHours(23, 59, 59, 999);
      tsFim = d.getTime();
    }

    // Se o relatório usa mês/ano (ex: consolidado-mensal) e não há período explícito,
    // derivar tsInicio e tsFim do primeiro ao último dia do mês selecionado
    if (usarMesAno && tsInicio === null && tsFim === null) {
      const mes = Number(filtros.mes);
      const ano = Number(filtros.ano);
      if (mes && ano) {
        tsInicio = new Date(ano, mes - 1, 1).getTime();
        const fimMes = new Date(ano, mes, 0); // dia 0 do mês seguinte = último dia do mês
        fimMes.setHours(23, 59, 59, 999);
        tsFim = fimMes.getTime();
      }
    }

    // ── PASSO 1: Filtros NÃO-temporais em emendas ──────────────────────────
    // O cascade (passo 2) usa essas emendas, garantindo que despesas de emendas
    // fora do período não sejam eliminadas inadvertidamente.

    if (filtros.parlamentar) {
      emendasFiltradas = emendasFiltradas.filter((e) =>
        (e.autor || e.parlamentar)
          ?.toLowerCase()
          .includes(filtros.parlamentar.toLowerCase()),
      );
    }

    if (filtros.emenda) {
      emendasFiltradas = emendasFiltradas.filter((e) => e.id === filtros.emenda);
    }

    if (filtros.municipio) {
      emendasFiltradas = emendasFiltradas.filter((e) =>
        e.municipio?.toLowerCase().includes(filtros.municipio.toLowerCase()),
      );
    }

    if (filtros.uf) {
      emendasFiltradas = emendasFiltradas.filter((e) => e.uf === filtros.uf);
    }

    // ── PASSO 2: CASCADE com emendas sem filtro temporal ───────────────────
    // Restringe despesas às emendas permitidas pelos filtros não-temporais.
    // Não usa emendasFiltradas com data para não eliminar despesas cujas
    // emendas foram criadas fora do período pesquisado.
    const emendasIds = new Set(emendasFiltradas.map((e) => e.id));
    despesasFiltradas = despesasFiltradas.filter((d) =>
      emendasIds.has(d.emendaId),
    );

    // ── PASSO 3: Filtro temporal em emendas (para relatórios de emenda) ────
    if (tsInicio !== null) {
      emendasFiltradas = emendasFiltradas.filter((e) => {
        const ts =
          parseFirestoreTimestamp(e.dataAprovacao) ||
          parseFirestoreTimestamp(e.dataOb) ||
          parseFirestoreTimestamp(e.criadaEm);
        return ts !== null && ts >= tsInicio;
      });
    }

    if (tsFim !== null) {
      emendasFiltradas = emendasFiltradas.filter((e) => {
        const ts =
          parseFirestoreTimestamp(e.dataAprovacao) ||
          parseFirestoreTimestamp(e.dataOb) ||
          parseFirestoreTimestamp(e.criadaEm);
        return ts !== null && ts <= tsFim;
      });
    }

    // ── PASSO 4: Filtro temporal em despesas (independente das emendas) ────
    // Hierarquia alinhada com os geradores de PDF:
    // dataPagamento > dataLiquidacao > dataEmpenho > data > criadaEm
    if (tsInicio !== null) {
      despesasFiltradas = despesasFiltradas.filter((d) => {
        const ts =
          parseFirestoreTimestamp(d.dataPagamento) ||
          parseFirestoreTimestamp(d.dataLiquidacao) ||
          parseFirestoreTimestamp(d.dataEmpenho) ||
          parseFirestoreTimestamp(d.data) ||
          parseFirestoreTimestamp(d.criadaEm);
        return ts !== null && ts >= tsInicio;
      });
    }

    if (tsFim !== null) {
      despesasFiltradas = despesasFiltradas.filter((d) => {
        const ts =
          parseFirestoreTimestamp(d.dataPagamento) ||
          parseFirestoreTimestamp(d.dataLiquidacao) ||
          parseFirestoreTimestamp(d.dataEmpenho) ||
          parseFirestoreTimestamp(d.data) ||
          parseFirestoreTimestamp(d.criadaEm);
        return ts !== null && ts <= tsFim;
      });
    }

    // ── PASSO 5: Filtro por fornecedor em despesas ─────────────────────────
    if (filtros.fornecedor) {
      despesasFiltradas = despesasFiltradas.filter((d) => {
        const fornecedor = (d.fornecedor || "").toLowerCase();
        const cnpj = (d.cnpjFornecedor || "").toLowerCase();
        const filtroLower = filtros.fornecedor.toLowerCase();
        return fornecedor.includes(filtroLower) || cnpj.includes(filtroLower);
      });
    }

    return { emendasFiltradas, despesasFiltradas };
  };

  // Obter listas únicas para os selects
  const parlamentares = [
    ...new Set(emendas.map((e) => e.autor || e.parlamentar).filter(Boolean)),
  ].sort();
  const ufs = [...new Set(emendas.map((e) => e.uf).filter(Boolean))].sort();

  return {
    emendas,
    despesas,
    loading,
    error,
    aplicarFiltros,
    parlamentares,
    ufs,
  };
}
