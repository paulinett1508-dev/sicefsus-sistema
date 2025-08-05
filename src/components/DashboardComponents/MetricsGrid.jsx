// src/components/DashboardComponents/MetricsGrid.jsx
// 🎯 Grid de métricas principais do Dashboard

import React from "react";

const MetricsGrid = ({ stats }) => {
  const formatCurrency = (valor) => {
    const numericValue = parseFloat(valor) || 0;
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  return (
    <div style={styles.metricsGrid}>
      <div style={styles.metricCard}>
        <div style={styles.metricNumber}>{stats.totalEmendas}</div>
        <div style={styles.metricLabel}>Emendas</div>
      </div>

      <div style={styles.metricCard}>
        <div style={styles.metricNumber}>{stats.totalDespesas}</div>
        <div style={styles.metricLabel}>Despesas</div>
      </div>

      <div style={styles.metricCard}>
        <div style={styles.metricValue}>
          {formatCurrency(stats.valorTotalEmendas)}
        </div>
        <div style={styles.metricLabel}>Valor Total</div>
      </div>

      <div style={styles.metricCard}>
        <div style={styles.metricValue}>
          {formatCurrency(stats.valorTotalDespesas)}
        </div>
        <div style={styles.metricLabel}>Executado</div>
      </div>

      <div style={styles.metricCard}>
        <div style={styles.metricValue}>
          {formatCurrency(stats.saldoDisponivel)}
        </div>
        <div style={styles.metricLabel}>Saldo</div>
      </div>

      <div style={styles.metricCard}>
        <div style={styles.metricPercentage}>{stats.percentualExecutado}%</div>
        <div style={styles.metricLabel}>Executado</div>
      </div>
    </div>
  );
};

const styles = {
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  metricCard: {
    backgroundColor: "white",
    padding: "16px 12px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e9ecef",
    transition: "box-shadow 0.2s ease",
  },
  metricNumber: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0066cc",
    marginBottom: "4px",
    lineHeight: 1,
  },
  metricValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#28a745",
    marginBottom: "4px",
    lineHeight: 1,
  },
  metricPercentage: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffc107",
    marginBottom: "4px",
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: "11px",
    color: "#6c757d",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
};

export default MetricsGrid;
