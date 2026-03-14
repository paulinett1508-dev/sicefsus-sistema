// src/components/despesa/DespesasStats.jsx
import React from "react";
import { parseValorMonetario } from "../../utils/formatters";

const DespesasStats = ({
  despesas,
  loading,
  filtroAutomatico,
  userMunicipio,
}) => {
  // Calcular estatísticas
  const totalDespesas = despesas.length;
  const despesasPagas = despesas.filter((d) => d.status === "pago").length;
  const despesasPendentes = despesas.filter(
    (d) => d.status === "pendente",
  ).length;
  const valorTotal = despesas.reduce((sum, despesa) => {
    return sum + parseValorMonetario(despesa.valor || 0);
  }, 0);

  return (
    <div style={styles.statsContainer}>
      <div style={styles.statCard}>
        <h3 style={styles.statNumber}>{totalDespesas}</h3>
        <p style={styles.statLabel}>
          {filtroAutomatico
            ? "DESPESAS DA EMENDA"
            : userMunicipio
              ? `DESPESAS - ${userMunicipio}`
              : "TOTAL DE DESPESAS"}
        </p>
      </div>

      <div style={styles.statCard}>
        <h3 style={styles.statNumber}>{despesasPagas}</h3>
        <p style={styles.statLabel}>DESPESAS PAGAS</p>
      </div>

      <div style={styles.statCard}>
        <h3 style={styles.statNumber}>{despesasPendentes}</h3>
        <p style={styles.statLabel}>DESPESAS PENDENTES</p>
      </div>

      <div style={styles.statCard}>
        <h3 style={styles.statNumber}>
          {valorTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </h3>
        <p style={styles.statLabel}>VALOR TOTAL</p>
      </div>
    </div>
  );
};

const styles = {
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #E2E8F0",
    textAlign: "center",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
    fontFamily: "'Inter', sans-serif",
  },

  statNumber: {
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--action)",
    margin: "0 0 8px 0",
  },

  statLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: 0,
  },
};

export default DespesasStats;
