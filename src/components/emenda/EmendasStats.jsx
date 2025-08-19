// src/components/emenda/EmendasStats.jsx
import React from "react";

const EmendasStats = ({ estatisticasGerais, loading }) => {
  if (!estatisticasGerais || loading) {
    return null;
  }

  // Função para formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  return (
    <div style={styles.statsSection}>
      <h3 style={styles.statsTitle}>📊 Resumo Financeiro</h3>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>
            {estatisticasGerais.totalEmendas}
          </span>
          <span style={styles.statLabel}>Emendas</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>
            {formatCurrency(estatisticasGerais.valorTotalGeral)}
          </span>
          <span style={styles.statLabel}>Valor Total</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>
            {formatCurrency(estatisticasGerais.valorExecutadoGeral)}
          </span>
          <span style={styles.statLabel}>Executado</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>
            {formatCurrency(estatisticasGerais.saldoDisponivelGeral)}
          </span>
          <span style={styles.statLabel}>Saldo Disponível</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>
            {estatisticasGerais.percentualGeralExecutado.toFixed(1)}%
          </span>
          <span style={styles.statLabel}>% Executado</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>
            {estatisticasGerais.emendasComSaldo}
          </span>
          <span style={styles.statLabel}>Com Saldo</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  statsSection: {
    padding: "20px 24px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
  },

  statsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0 0 16px 0",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },

  statCard: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  statValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2c3e50",
  },

  statLabel: {
    fontSize: "12px",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};

export default EmendasStats;
