// src/components/despesa/DespesasStats.jsx
import React from "react";

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
    return sum + (parseFloat(despesa.valor) || 0);
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
    gap: "15px",
    marginBottom: "20px",
  },

  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },

  statNumber: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#154360",
    margin: "0 0 10px 0",
  },

  statLabel: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
};

export default DespesasStats;
