// src/hooks/useDespesasCalculos.js
// 🎯 Hook responsável por cálculos de saldo e estatísticas
// ✅ Performance otimizada com useMemo
// ✅ Cálculos isolados da lógica de negócio

import { useMemo } from "react";

export function useDespesasCalculos(despesas, emendas) {

  // 💰 Calcular saldo de uma emenda específica
  const calcularSaldoEmenda = useMemo(() => {
    return (emendaId) => {
      const emenda = emendas.find(e => e.id === emendaId);
      if (!emenda) return null;

      // ✅ CRÍTICO: Filtrar APENAS despesas executadas (status !== "PLANEJADA")
      const despesasDaEmenda = despesas.filter(
        d => d.emendaId === emendaId && d.status !== "PLANEJADA"
      );

      const valorExecutado = despesasDaEmenda.reduce((soma, despesa) => {
        return soma + (Number(despesa.valor) || 0);
      }, 0);

      const valorTotal = Number(emenda.valor) || 
                        Number(emenda.valorRecurso) || 
                        Number(emenda.valorTotal) || 0;

      const saldoDisponivel = valorTotal - valorExecutado;
      const percentualExecutado = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

      return {
        valorTotal,
        valorExecutado,
        saldoDisponivel,
        percentualExecutado,
        quantidadeDespesas: despesasDaEmenda.length,
      };
    };
  }, [despesas, emendas]);

  // 📊 Calcular info completa de emenda (com saldo)
  const calcularEmendaCompleta = useMemo(() => {
    return (emenda) => {
      if (!emenda) return null;

      const saldo = calcularSaldoEmenda(emenda.id);

      return {
        ...emenda,
        valorRecurso: saldo?.valorTotal || 0,
        saldoDisponivel: saldo?.saldoDisponivel || 0,
        valorExecutado: saldo?.valorExecutado || 0,
        percentualExecutado: saldo?.percentualExecutado || 0,
      };
    };
  }, [calcularSaldoEmenda]);

  // 📋 Lista de emendas com saldo calculado
  const emendasComSaldo = useMemo(() => {
    return emendas.map(emenda => calcularEmendaCompleta(emenda));
  }, [emendas, calcularEmendaCompleta]);

  // 📈 Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalDespesas = despesas.length;
    const emendasUnicas = new Set(despesas.map(d => d.emendaId)).size;

    const valorTotalDespesas = despesas.reduce((soma, d) => {
      return soma + (Number(d.valor) || 0);
    }, 0);

    const valorTotalEmendas = emendas.reduce((soma, e) => {
      return soma + (Number(e.valor) || 0);
    }, 0);

    return {
      totalDespesas,
      emendasUnicas,
      valorTotalDespesas,
      valorTotalEmendas,
      saldoGeral: valorTotalEmendas - valorTotalDespesas,
      percentualExecutadoGeral: valorTotalEmendas > 0 
        ? (valorTotalDespesas / valorTotalEmendas) * 100 
        : 0,
    };
  }, [despesas, emendas]);

  return {
    calcularSaldoEmenda,
    calcularEmendaCompleta,
    emendasComSaldo,
    estatisticas,
  };
}