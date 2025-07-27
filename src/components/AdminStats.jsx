
// src/components/AdminStats.jsx - Estatísticas com Design Melhorado
import React from "react";

const AdminStats = ({ users }) => {
  // ✅ CALCULAR ESTATÍSTICAS ESSENCIAIS
  const calculateStats = () => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ativo").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const pendingFirstAccess = users.filter((u) => u.primeiroAcesso).length;

    return { total, active, admins, pendingFirstAccess };
  };

  const stats = calculateStats();

  // ✅ CARDS COMPACTOS E FOCADOS
  const CompactCard = ({ icon, value, label, color = "primary", alert = false }) => (
    <div style={{
      ...styles.compactCard, 
      borderLeftColor: `var(--${color})`,
      backgroundColor: alert ? `var(--${color}-light)` : 'var(--theme-surface)'
    }}>
      <div style={styles.cardIcon}>{icon}</div>
      <div style={styles.cardContent}>
        <div style={styles.cardValue}>{value}</div>
        <div style={styles.cardLabel}>{label}</div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* ✅ RESUMO COMPACTO EM UMA LINHA */}
      <div style={styles.summaryBar}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Total:</span>
          <span style={styles.summaryValue}>{stats.total}</span>
        </div>
        <div style={styles.summaryDivider}>•</div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Ativos:</span>
          <span style={{...styles.summaryValue, color: 'var(--success)'}}>{stats.active}</span>
        </div>
        <div style={styles.summaryDivider}>•</div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Admins:</span>
          <span style={{...styles.summaryValue, color: 'var(--warning)'}}>{stats.admins}</span>
        </div>
        {stats.pendingFirstAccess > 0 && (
          <>
            <div style={styles.summaryDivider}>•</div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Pendentes:</span>
              <span style={{...styles.summaryValue, color: 'var(--error)'}}>{stats.pendingFirstAccess}</span>
            </div>
          </>
        )}
      </div>

      {/* ✅ ALERTAS IMPORTANTES APENAS QUANDO NECESSÁRIO */}
      {stats.pendingFirstAccess > 0 && (
        <div style={styles.alertBanner}>
          <span style={styles.alertIcon}>⚠️</span>
          <span style={styles.alertText}>
            {stats.pendingFirstAccess} usuário(s) aguardando primeiro acesso
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  // ✅ BARRA DE RESUMO COMPACTA
  summaryBar: {
    display: "flex",
    alignItems: "center",
    background: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "12px 16px",
    border: "1px solid var(--theme-border)",
    gap: "16px",
    fontSize: "0.9em",
  },

  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  summaryLabel: {
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
  },

  summaryValue: {
    color: "var(--theme-text)",
    fontWeight: "600",
    fontSize: "1.1em",
  },

  summaryDivider: {
    color: "var(--theme-text-muted)",
    fontSize: "0.8em",
  },

  // ✅ BANNER DE ALERTA DISCRETO
  alertBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--warning-light)",
    border: "1px solid var(--warning)",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "0.9em",
  },

  alertIcon: {
    fontSize: "1.1em",
  },

  alertText: {
    color: "var(--warning-dark)",
    fontWeight: "500",
  },

  // ✅ CARDS COMPACTOS PARA CASOS ESPECIAIS
  compactCard: {
    background: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "12px 16px",
    border: "1px solid var(--theme-border)",
    borderLeft: "4px solid",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.2s ease",
  },

  cardIcon: {
    fontSize: "1.5em",
    opacity: 0.8,
  },

  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  cardValue: {
    fontSize: "1.4em",
    fontWeight: "600",
    color: "var(--theme-text)",
    lineHeight: 1,
  },

  cardLabel: {
    fontSize: "0.8em",
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
  },
};

export default AdminStats;
