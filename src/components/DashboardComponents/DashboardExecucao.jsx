// src/components/DashboardComponents/DashboardExecucao.jsx
// 📊 Gráfico de Execução por Tipo de Emenda

import React from "react";

const DashboardExecucao = ({ emendas = [] }) => {
  // Agrupar emendas por tipo e calcular execução
  const calcularExecucaoPorTipo = () => {
    const tipos = {};

    emendas.forEach((emenda) => {
      const tipo = emenda.tipo || emenda.tipoEmenda || "Não informado";
      const valorTotal = parseFloat(emenda.valorRecurso || emenda.valor || 0);
      const valorExecutado = parseFloat(emenda.valorExecutado || 0);

      if (!tipos[tipo]) {
        tipos[tipo] = {
          tipo,
          valorTotal: 0,
          valorExecutado: 0,
          quantidade: 0,
        };
      }

      tipos[tipo].valorTotal += valorTotal;
      tipos[tipo].valorExecutado += valorExecutado;
      tipos[tipo].quantidade += 1;
    });

    // Calcular percentuais
    return Object.values(tipos).map((item) => ({
      ...item,
      percentual:
        item.valorTotal > 0 ? (item.valorExecutado / item.valorTotal) * 100 : 0,
    }));
  };

  const dados = calcularExecucaoPorTipo();

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  const getBarColor = (percentual) => {
    if (percentual >= 80) return "#27AE60";
    if (percentual >= 50) return "#F39C12";
    if (percentual >= 20) return "#E67E22";
    return "#E74C3C";
  };

  if (dados.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>💰 Execução por Tipo de Emenda</h3>
        </div>
        <div style={styles.emptyState}>
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>💰 Execução por Tipo de Emenda</h3>
        <span style={styles.subtitle}>Distribuição do orçamento</span>
      </div>

      <div style={styles.barsContainer}>
        {dados.map((item, index) => (
          <div key={index} style={styles.barItem}>
            <div style={styles.barHeader}>
              <div style={styles.barInfo}>
                <span style={styles.barLabel}>{item.tipo}</span>
                <span style={styles.barCount}>({item.quantidade})</span>
              </div>
              <span
                style={{
                  ...styles.barPercentage,
                  color: getBarColor(item.percentual),
                }}
              >
                {item.percentual.toFixed(0)}%
              </span>
            </div>

            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${Math.min(item.percentual, 100)}%`,
                  backgroundColor: getBarColor(item.percentual),
                }}
              />
            </div>

            <div style={styles.barFooter}>
              <span style={styles.barValue}>
                {formatCurrency(item.valorExecutado)}
              </span>
              <span style={styles.barDivider}>de</span>
              <span style={styles.barTotal}>
                {formatCurrency(item.valorTotal)}
              </span>
            </div>
          </div>
        ))}
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
    color: "#2c3e50",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "13px",
    fontWeight: "400",
  },
  barsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  barItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  barHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  barLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  barCount: {
    fontSize: "12px",
    color: "#6c757d",
  },
  barPercentage: {
    fontSize: "16px",
    fontWeight: "700",
  },
  barTrack: {
    height: "12px",
    backgroundColor: "#e9ecef",
    borderRadius: "6px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    transition: "width 0.5s ease",
    borderRadius: "6px",
  },
  barFooter: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
  },
  barValue: {
    color: "#27AE60",
    fontWeight: "600",
  },
  barDivider: {
    color: "#6c757d",
  },
  barTotal: {
    color: "#495057",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
    fontStyle: "italic",
  },
};

export default DashboardExecucao;
