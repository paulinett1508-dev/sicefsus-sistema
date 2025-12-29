// src/components/SaldoNaturezaWidget.jsx
// 📅 Versão: 2.3.71
// 📅 Data: 28/10/2025
// 💰 Widget que mostra saldo disponível por natureza de despesa
// ✅ CORRIGIDO: Normalização e match correto entre despesas e planejamento
// ✅ CORRIGIDO: Logs detalhados para debug de campos

import React, { useMemo } from "react";
import { parseValorMonetario } from "../utils/formatters";

const SaldoNaturezaWidget = ({
  emenda = {},
  despesas = [],
  compacto = false,
}) => {
  // 🔧 FUNÇÃO AUXILIAR: Normalizar natureza de despesa para comparação
  const normalizarNatureza = (texto) => {
    if (!texto) return "SEM NATUREZA";

    // Remove espaços extras e converte para maiúsculas
    let normalizado = texto.trim().toUpperCase();

    // Remove código de elemento de despesa (ex: "339030 - MATERIAL DE CONSUMO" → "MATERIAL DE CONSUMO")
    normalizado = normalizado.replace(/^\d+\s*-\s*/, "");

    // Remove caracteres especiais extras
    normalizado = normalizado.replace(/[^\w\sÀ-ÿ]/g, " ");

    // Remove espaços múltiplos
    normalizado = normalizado.replace(/\s+/g, " ").trim();

    return normalizado;
  };

  // Calcular saldo por natureza de despesa
  const saldoPorNatureza = useMemo(() => {
    if (!emenda || !emenda.acoesServicos) return [];

    const metas = emenda.acoesServicos || [];

    console.log("📊 SaldoNaturezaWidget - Processando:", {
      totalMetas: metas.length,
      totalDespesas: despesas.length,
    });

    // 🔧 Agrupar despesas por natureza NORMALIZADA
    const despesasPorNatureza = {};
    despesas.forEach((despesa, index) => {
      // 🔍 LOG DETALHADO: Ver TODOS os campos da despesa
      console.log(`  🔍 Despesa #${index + 1} - Campos disponíveis:`, {
        naturezaDespesa: despesa.naturezaDespesa,
        estrategia: despesa.estrategia,
        elementoDespesa: despesa.elementoDespesa,
        natureza: despesa.natureza,
        descricao: despesa.descricao,
        valor: despesa.valor,
        todosOsCampos: Object.keys(despesa),
      });

      // ✅ Buscar em múltiplos campos possíveis
      const naturezaRaw =
        despesa.naturezaDespesa ||
        despesa.estrategia ||
        despesa.elementoDespesa ||
        despesa.natureza ||
        "SEM NATUREZA";

      const naturezaNormalizada = normalizarNatureza(naturezaRaw);

      if (!despesasPorNatureza[naturezaNormalizada]) {
        despesasPorNatureza[naturezaNormalizada] = 0;
      }

      const valorDespesa = parseValorMonetario(despesa.valor || 0);
      despesasPorNatureza[naturezaNormalizada] += valorDespesa;

      console.log(
        `  💸 Despesa: "${naturezaRaw}" → "${naturezaNormalizada}" = R$ ${valorDespesa.toFixed(2)}`,
      );
    });

    console.log("📦 Despesas agrupadas:", despesasPorNatureza);

    // ✅ Calcular valores para cada meta
    const resultado = metas.map((meta) => {
      const naturezaMetaRaw = meta.estrategia || "SEM NATUREZA";
      const naturezaMetaNormalizada = normalizarNatureza(naturezaMetaRaw);

      const planejado = parseValorMonetario(meta.valorAcao || 0);
      const executado = despesasPorNatureza[naturezaMetaNormalizada] || 0;
      const saldo = planejado - executado;
      const percentualExecutado =
        planejado > 0 ? (executado / planejado) * 100 : 0;
      const percentualDisponivel =
        planejado > 0 ? (saldo / planejado) * 100 : 0;

      console.log(
        `  🎯 Meta: "${naturezaMetaRaw}" → "${naturezaMetaNormalizada}"`,
        {
          planejado: `R$ ${planejado.toFixed(2)}`,
          executado: `R$ ${executado.toFixed(2)}`,
          saldo: `R$ ${saldo.toFixed(2)}`,
        },
      );

      return {
        natureza: naturezaMetaRaw, // Usar texto original para exibição
        naturezaNormalizada: naturezaMetaNormalizada,
        planejado,
        executado,
        saldo,
        percentualExecutado,
        percentualDisponivel,
      };
    });

    // Ordenar por maior saldo disponível
    return resultado.sort((a, b) => b.saldo - a.saldo);
  }, [emenda, despesas]);

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getCorStatus = (percentual) => {
    if (percentual >= 80) return "#dc3545"; // Vermelho - crítico
    if (percentual >= 50) return "#ffc107"; // Amarelo - atenção
    return "#28a745"; // Verde - ok
  };

  if (!emenda.acoesServicos || emenda.acoesServicos.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}><span className="material-symbols-outlined" style={{ fontSize: 48 }}>description</span></span>
        <p style={styles.emptyText}>
          Nenhum planejamento de despesas cadastrado nesta emenda
        </p>
      </div>
    );
  }

  // Totais gerais
  const totalPlanejado = saldoPorNatureza.reduce(
    (sum, item) => sum + item.planejado,
    0,
  );
  const totalExecutado = saldoPorNatureza.reduce(
    (sum, item) => sum + item.executado,
    0,
  );
  const totalSaldo = saldoPorNatureza.reduce(
    (sum, item) => sum + item.saldo,
    0,
  );
  const percentualGeralExecutado =
    totalPlanejado > 0 ? (totalExecutado / totalPlanejado) * 100 : 0;

  return (
    <div style={compacto ? styles.containerCompacto : styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}><span className="material-symbols-outlined" style={{ fontSize: 32 }}>payments</span></span>
          <div>
            <h3 style={styles.headerTitle}>Saldo por Natureza de Despesa</h3>
            <p style={styles.headerSubtitle}>Planejamento vs Execução</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.totalCard}>
            <span style={styles.totalLabel}>Saldo Total</span>
            <span style={styles.totalValue}>{formatCurrency(totalSaldo)}</span>
          </div>
        </div>
      </div>

      {/* Lista de Naturezas */}
      <div style={compacto ? styles.listaCompacta : styles.lista}>
        {saldoPorNatureza.map((item) => (
          <div
            key={item.natureza}
            style={{
              ...styles.naturezaCard,
              borderLeft: `4px solid ${getCorStatus(item.percentualExecutado)}`,
            }}
          >
            {/* Cabeçalho do Card */}
            <div style={styles.naturezaHeader}>
              <span style={styles.naturezaNome}>{item.natureza}</span>
            </div>

            {/* Grid de valores */}
            <div style={styles.valoresGrid}>
              <div style={styles.valorItem}>
                <span style={styles.valorLabel}>Planejado</span>
                <span style={styles.valorNumero}>
                  {formatCurrency(item.planejado)}
                </span>
              </div>

              <div style={styles.valorItem}>
                <span style={styles.valorLabel}>Executado</span>
                <span style={{ ...styles.valorNumero, color: "var(--error)" }}>
                  {formatCurrency(item.executado)}
                </span>
              </div>

              <div style={styles.valorItem}>
                <span style={styles.valorLabel}>Saldo</span>
                <span style={{ ...styles.valorNumero, color: "var(--success)" }}>
                  {formatCurrency(item.saldo)}
                </span>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min(item.percentualExecutado, 100)}%`,
                    backgroundColor: getCorStatus(item.percentualExecutado),
                  }}
                />
              </div>
              <div style={styles.progressLabels}>
                <span style={styles.progressLabel}>
                  {item.percentualExecutado.toFixed(1)}% executado
                </span>
                <span style={styles.progressLabel}>
                  {item.percentualDisponivel.toFixed(1)}% disponível
                </span>
              </div>
            </div>

            {/* Alerta se saldo crítico */}
            {item.saldo < 0 && (
              <div style={styles.alertaNegativo}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>warning</span> Execução excedeu o planejado em{" "}
                {formatCurrency(Math.abs(item.saldo))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumo Geral */}
      <div style={styles.resumoGeral}>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Total Planejado</span>
          <span style={styles.resumoValor}>
            {formatCurrency(totalPlanejado)}
          </span>
        </div>
        <div style={styles.resumoDivider}>→</div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Total Executado</span>
          <span style={{ ...styles.resumoValor, color: "var(--error)" }}>
            {formatCurrency(totalExecutado)}
          </span>
        </div>
        <div style={styles.resumoDivider}>→</div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Saldo Disponível</span>
          <span
            style={{
              ...styles.resumoValor,
              color: "var(--success)",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            {formatCurrency(totalSaldo)}
          </span>
        </div>
        <div style={styles.resumoDivider}>|</div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Execução Geral</span>
          <span style={styles.resumoValor}>
            {percentualGeralExecutado.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "12px",
    border: "2px solid var(--primary)",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "var(--shadow)",
  },
  containerCompacto: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    border: "1px solid var(--theme-border)",
    padding: "16px",
    marginBottom: "16px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid var(--theme-border)",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerIcon: {
    fontSize: "32px",
  },
  headerTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--primary)",
  },
  headerSubtitle: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "var(--theme-text-secondary)",
  },
  headerRight: {
    display: "flex",
    gap: "12px",
  },
  totalCard: {
    backgroundColor: "var(--theme-surface-secondary)",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "2px solid var(--info)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  totalValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--primary)",
    marginTop: "4px",
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "20px",
  },
  listaCompacta: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },
  naturezaCard: {
    backgroundColor: "var(--theme-surface-secondary)",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid var(--theme-border)",
    transition: "all 0.2s ease",
  },
  naturezaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  naturezaNome: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--primary)",
  },
  valoresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "12px",
  },
  valorItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  valorLabel: {
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  valorNumero: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--primary)",
  },
  progressContainer: {
    marginTop: "8px",
  },
  progressBar: {
    height: "8px",
    backgroundColor: "var(--theme-border)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
  },
  alertaNegativo: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "var(--error)",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    marginTop: "12px",
    border: "1px solid var(--error)",
  },
  resumoGeral: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "var(--theme-surface-secondary)",
    borderRadius: "8px",
    border: "1px solid var(--theme-border)",
    flexWrap: "wrap",
    gap: "16px",
  },
  resumoItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  resumoLabel: {
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  resumoValor: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--primary)",
  },
  resumoDivider: {
    fontSize: "20px",
    color: "var(--theme-border)",
    fontWeight: "300",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "var(--theme-surface-secondary)",
    borderRadius: "8px",
    border: "1px dashed var(--theme-border)",
  },
  emptyIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "12px",
  },
  emptyText: {
    color: "var(--theme-text-secondary)",
    fontSize: "14px",
    margin: 0,
  },
};

export default SaldoNaturezaWidget;
