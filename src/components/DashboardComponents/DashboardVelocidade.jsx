// src/components/DashboardComponents/DashboardVelocidade.jsx
// ⚡ Velocidade de Execução e Projeções

import React from "react";
import { parseValorMonetario } from "../../utils/formatters";

const DashboardVelocidade = ({ despesas = [], stats = {} }) => {
  // Calcular velocidade de execução
  const calcularVelocidade = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Mês anterior
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

    // Filtrar despesas do mês atual
    const despesasMesAtual = despesas.filter((d) => {
      if (!d.data) return false;
      const dataDespesa = new Date(d.data);
      return (
        dataDespesa.getMonth() === mesAtual &&
        dataDespesa.getFullYear() === anoAtual
      );
    });

    // Filtrar despesas do mês anterior
    const despesasMesAnterior = despesas.filter((d) => {
      if (!d.data) return false;
      const dataDespesa = new Date(d.data);
      return (
        dataDespesa.getMonth() === mesAnterior &&
        dataDespesa.getFullYear() === anoAnterior
      );
    });

    // Calcular totais
    const valorMesAtual = despesasMesAtual.reduce(
      (sum, d) => sum + parseValorMonetario(d.valor || 0),
      0,
    );

    const valorMesAnterior = despesasMesAnterior.reduce(
      (sum, d) => sum + parseValorMonetario(d.valor || 0),
      0,
    );

    // Calcular variação
    const variacao =
      valorMesAnterior > 0
        ? ((valorMesAtual - valorMesAnterior) / valorMesAnterior) * 100
        : 0;

    // Projeção: quanto tempo para concluir baseado na velocidade atual
    const saldoDisponivel = stats.saldoDisponivel || 0;
    const mesesParaConcluir =
      valorMesAtual > 0 ? Math.ceil(saldoDisponivel / valorMesAtual) : 0;

    return {
      valorMesAtual,
      valorMesAnterior,
      variacao,
      mesesParaConcluir,
      variacaoPositiva: variacao >= 0,
    };
  };

  const dados = calcularVelocidade();

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  const getNomeMes = (offset = 0) => {
    const hoje = new Date();
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1);
    return mes.toLocaleDateString("pt-BR", { month: "long" });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>⚡ Velocidade de Execução</h3>
        <span style={styles.subtitle}>Análise de tendência</span>
      </div>

      {/* Comparativo Mensal */}
      <div style={styles.comparativoGrid}>
        <div style={styles.comparativoCard}>
          <span style={styles.comparativoLabel}>Mês Anterior</span>
          <span style={styles.comparativoValue}>
            {formatCurrency(dados.valorMesAnterior)}
          </span>
          <span style={styles.comparativoMes}>
            {getNomeMes(-1).charAt(0).toUpperCase() + getNomeMes(-1).slice(1)}
          </span>
        </div>

        <div style={styles.comparativoSeparator}>
          <div
            style={{
              ...styles.variacaoArrow,
              color: dados.variacaoPositiva ? "#10B981" : "#EF4444",
            }}
          >
            {dados.variacaoPositiva ? "📈" : "📉"}
          </div>
          <div
            style={{
              ...styles.variacaoPercentual,
              color: dados.variacaoPositiva ? "#10B981" : "#EF4444",
            }}
          >
            {dados.variacaoPositiva ? "+" : ""}
            {dados.variacao.toFixed(1)}%
          </div>
        </div>

        <div style={{ ...styles.comparativoCard, ...styles.comparativoAtual }}>
          <span style={styles.comparativoLabel}>Mês Atual</span>
          <span style={{ ...styles.comparativoValue, color: "var(--action)" }}>
            {formatCurrency(dados.valorMesAtual)}
          </span>
          <span style={styles.comparativoMes}>
            {getNomeMes(0).charAt(0).toUpperCase() + getNomeMes(0).slice(1)}
          </span>
        </div>
      </div>

      {/* Análise de Ritmo */}
      <div style={styles.analiseRitmo}>
        <div style={styles.analiseHeader}>
          <span style={styles.analiseIcon}>
            {dados.variacaoPositiva ? "🚀" : "⚠️"}
          </span>
          <span style={styles.analiseTexto}>
            {dados.variacaoPositiva ? "Ritmo Acelerado" : "Ritmo Desacelerado"}
          </span>
        </div>
        <p style={styles.analiseDescricao}>
          {dados.variacaoPositiva
            ? `Execução está ${Math.abs(dados.variacao).toFixed(1)}% mais rápida que o mês anterior`
            : `Execução está ${Math.abs(dados.variacao).toFixed(1)}% mais lenta que o mês anterior`}
        </p>
      </div>

      {/* Projeção */}
      <div style={styles.projecaoCard}>
        <h4 style={styles.projecaoTitulo}>📊 Projeção</h4>

        {dados.valorMesAtual > 0 ? (
          <div style={styles.projecaoConteudo}>
            <div style={styles.projecaoItem}>
              <span style={styles.projecaoLabel}>Saldo Restante:</span>
              <span style={styles.projecaoValor}>
                {formatCurrency(stats.saldoDisponivel)}
              </span>
            </div>

            <div style={styles.projecaoItem}>
              <span style={styles.projecaoLabel}>Ritmo Atual:</span>
              <span style={styles.projecaoValor}>
                {formatCurrency(dados.valorMesAtual)}/mês
              </span>
            </div>

            <div style={styles.projecaoDestaque}>
              {dados.mesesParaConcluir > 0 ? (
                <>
                  <span style={styles.projecaoIcon}>🎯</span>
                  <div style={styles.projecaoTextoWrapper}>
                    <span style={styles.projecaoTexto}>
                      Mantendo o ritmo atual, conclusão em
                    </span>
                    <span style={styles.projecaoMeses}>
                      {dados.mesesParaConcluir}{" "}
                      {dados.mesesParaConcluir === 1 ? "mês" : "meses"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span style={styles.projecaoIcon}>✅</span>
                  <span style={styles.projecaoTexto}>
                    Todas as emendas executadas!
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.projecaoVazio}>
            <p style={styles.projecaoVazioTexto}>
              Sem execução no mês atual para calcular projeção
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e9ecef",
    marginBottom: "16px",
  },
  header: {
    marginBottom: "20px",
    borderBottom: "1px solid #f1f3f4",
    paddingBottom: "12px",
  },
  title: {
    margin: "0 0 3px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#1E293B",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "13px",
    fontWeight: "400",
  },
  comparativoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: "16px",
    marginBottom: "20px",
    alignItems: "center",
  },
  comparativoCard: {
    backgroundColor: "#f8f9fa",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
    border: "1px solid #e9ecef",
  },
  comparativoAtual: {
    backgroundColor: "#e3f2fd",
    borderColor: "#90caf9",
  },
  comparativoLabel: {
    display: "block",
    fontSize: "11px",
    color: "#6c757d",
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  comparativoValue: {
    display: "block",
    fontSize: "20px",
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: "4px",
  },
  comparativoMes: {
    display: "block",
    fontSize: "12px",
    color: "#495057",
  },
  comparativoSeparator: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  variacaoArrow: {
    fontSize: "24px",
  },
  variacaoPercentual: {
    fontSize: "16px",
    fontWeight: "700",
  },
  analiseRitmo: {
    backgroundColor: "#f8f9fa",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    marginBottom: "16px",
  },
  analiseHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  analiseIcon: {
    fontSize: "20px",
  },
  analiseTexto: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1E293B",
  },
  analiseDescricao: {
    margin: 0,
    fontSize: "13px",
    color: "#6c757d",
    lineHeight: 1.5,
  },
  projecaoCard: {
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "8px",
    padding: "16px",
  },
  projecaoTitulo: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#856404",
  },
  projecaoConteudo: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  projecaoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },
  projecaoLabel: {
    color: "#856404",
    fontWeight: "500",
  },
  projecaoValor: {
    color: "#1E293B",
    fontWeight: "600",
  },
  projecaoDestaque: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "6px",
    marginTop: "4px",
  },
  projecaoIcon: {
    fontSize: "20px",
  },
  projecaoTextoWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  projecaoTexto: {
    fontSize: "13px",
    color: "#495057",
  },
  projecaoMeses: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--action)",
  },
  projecaoVazio: {
    textAlign: "center",
    padding: "20px",
  },
  projecaoVazioTexto: {
    margin: 0,
    fontSize: "13px",
    color: "#856404",
    fontStyle: "italic",
  },
};

export default DashboardVelocidade;
