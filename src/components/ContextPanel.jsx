// 🔧 CORREÇÃO URGENTE: ContextPanel.jsx - Cálculo de Saldo Disponível
// PROBLEMA: Saldo mostrando R$ 0,00 quando deveria mostrar R$ 73.000,00

import React, { useMemo } from "react";
import {
  formatarMoedaDisplay,
  parseValorMonetario,
} from "../utils/formatters";

const ContextPanel = ({ emenda, despesas = [] }) => {
  // 🚨 CORREÇÃO PRINCIPAL: Cálculo do saldo com debug e validações
  const { valorTotal, valorExecutado, saldoRestante } = useMemo(() => {
    console.log("🔍 DEBUG SALDO - ContextPanel:");
    console.log("Emenda recebida:", emenda);
    console.log("Despesas recebidas:", despesas);

    // 1. GARANTIR QUE EMENDA EXISTE
    if (!emenda) {
      console.warn("⚠️ Emenda não fornecida");
      return { valorTotal: 0, valorExecutado: 0, saldoRestante: 0 };
    }

    // 2. EXTRAIR VALOR TOTAL COM FALLBACKS ORDENADOS
    // Prioridade: valorTotal > valor > valorRecurso
    let valorTotalCalculado = 0;

    if (emenda.valorTotal !== undefined && emenda.valorTotal !== null) {
      valorTotalCalculado = emenda.valorTotal;
      console.log("✅ Usando emenda.valorTotal:", valorTotalCalculado);
    } else if (emenda.valor !== undefined && emenda.valor !== null) {
      valorTotalCalculado = emenda.valor;
      console.log("✅ Usando emenda.valor:", valorTotalCalculado);
    } else if (
      emenda.valorRecurso !== undefined &&
      emenda.valorRecurso !== null
    ) {
      valorTotalCalculado = emenda.valorRecurso;
      console.log("✅ Usando emenda.valorRecurso:", valorTotalCalculado);
    } else {
      console.warn("⚠️ Nenhum campo de valor encontrado na emenda");
    }

    // 3. CONVERTER PARA NUMBER (caso seja string)
    if (typeof valorTotalCalculado === "string") {
      // Remove formatação monetária se existir
      const valorLimpo = valorTotalCalculado.replace(/[R$\s.,]/g, "");
      valorTotalCalculado = parseFloat(valorLimpo) || 0;
      console.log("🔄 Valor convertido de string:", valorTotalCalculado);
    } else {
      valorTotalCalculado = Number(valorTotalCalculado) || 0;
    }

    console.log("💰 Valor Total Final:", valorTotalCalculado);
    console.log("📊 Tipo do Valor Total:", typeof valorTotalCalculado);

    // 4. CALCULAR VALOR EXECUTADO COM VALIDAÇÕES
    const despesasValidas = Array.isArray(despesas) ? despesas : [];
    console.log("📋 Despesas válidas:", despesasValidas.length);

    const valorExecutadoCalculado = despesasValidas.reduce((soma, despesa) => {
      if (!despesa) return soma;

      let valorDespesa = despesa.valor || despesa.valorDespesa || 0;

      // Converter string para number se necessário
      if (typeof valorDespesa === "string") {
        // Utiliza a função parseValorMonetario para um parsing correto
        valorDespesa = parseValorMonetario(valorDespesa) || 0;
      } else {
        valorDespesa = Number(valorDespesa) || 0;
      }

      console.log(`💸 Despesa ${despesa.id || "sem-id"}: R$ ${valorDespesa}`);
      return soma + valorDespesa;
    }, 0);

    console.log("💸 Valor Executado Total:", valorExecutadoCalculado);

    // 5. CALCULAR SALDO RESTANTE
    const saldoCalculado = valorTotalCalculado - valorExecutadoCalculado;
    console.log("💰 Saldo Calculado:", saldoCalculado);

    // 6. VALIDAÇÃO FINAL
    if (saldoCalculado < 0) {
      console.warn("⚠️ Saldo negativo detectado!");
    }

    return {
      valorTotal: valorTotalCalculado,
      valorExecutado: valorExecutadoCalculado,
      saldoRestante: saldoCalculado,
    };
  }, [emenda, despesas]);

  // 🎨 RENDER DO BANNER DE CONTEXTO
  return (
    <div className="context-panel bg-white border rounded-lg p-4 mb-4 shadow-sm">
      {/* Informações da Emenda */}
      <div className="emenda-info mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {emenda?.parlamentar || "Parlamentar não informado"} -{" "}
              {emenda?.numero || "S/N"}
            </h3>
            <p className="text-sm text-gray-600">
              {emenda?.municipio || "Município não informado"}/
              {emenda?.uf || "UF"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {emenda?.programa || "Programa não informado"}
            </p>
          </div>

          {/* Status da Emenda */}
          <div className="text-right">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                emenda?.status === "Ativa"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {emenda?.status || "Status não definido"}
            </span>
          </div>
        </div>
      </div>

      {/* Métricas Financeiras - BANNER PRINCIPAL */}
      <div className="financial-metrics grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Valor Total */}
        <div className="metric-card bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-700">Valor Total</div>
          <div className="text-xl font-bold text-blue-800">
            {formatarMoedaDisplay(valorTotal)}
          </div>
        </div>

        {/* Valor Executado */}
        <div className="metric-card bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-sm font-medium text-orange-700">
            Valor Executado
          </div>
          <div className="text-xl font-bold text-orange-800">
            {formatarMoedaDisplay(valorExecutado)}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {despesas.length} despesa(s) cadastrada(s)
          </div>
        </div>

        {/* Saldo Disponível - CAMPO PROBLEMÁTICO CORRIGIDO */}
        <div
          className={`metric-card border rounded-lg p-3 ${
            saldoRestante > 0
              ? "bg-green-50 border-green-200"
              : saldoRestante === 0
                ? "bg-gray-50 border-gray-200"
                : "bg-red-50 border-red-200"
          }`}
        >
          <div
            className={`text-sm font-medium ${
              saldoRestante > 0
                ? "text-green-700"
                : saldoRestante === 0
                  ? "text-gray-700"
                  : "text-red-700"
            }`}
          >
            Saldo Disponível
          </div>
          <div
            className={`text-xl font-bold ${
              saldoRestante > 0
                ? "text-green-800"
                : saldoRestante === 0
                  ? "text-gray-800"
                  : "text-red-800"
            }`}
          >
            {formatarMoedaDisplay(saldoRestante)}
          </div>
          {saldoRestante <= 0 && (
            <div className="text-xs text-red-600 mt-1">
              {saldoRestante === 0
                ? "Recurso totalmente executado"
                : "Execução excedente"}
            </div>
          )}
        </div>
      </div>

      {/* Indicadores de Progresso */}
      <div className="progress-section mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Execução</span>
          <span className="text-sm text-gray-600">
            {valorTotal > 0
              ? Math.round((valorExecutado / valorTotal) * 100)
              : 0}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              valorTotal > 0 && valorExecutado / valorTotal <= 1
                ? "bg-green-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${valorTotal > 0 ? Math.min((valorExecutado / valorTotal) * 100, 100) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">🔍 Debug Info</summary>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
            {`Valor Total: ${valorTotal} (${typeof valorTotal})
Valor Executado: ${valorExecutado} (${typeof valorExecutado})
Saldo Restante: ${saldoRestante} (${typeof saldoRestante})
Despesas: ${despesas.length} itens
Emenda.valor: ${emenda?.valor}
Emenda.valorTotal: ${emenda?.valorTotal}
Emenda.valorRecurso: ${emenda?.valorRecurso}`}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ContextPanel;