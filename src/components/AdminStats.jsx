
// src/components/AdminStats.jsx - Estatísticas com Design Melhorado
import React from "react";

const AdminStats = ({ users }) => {
  // ✅ CALCULAR ESTATÍSTICAS
  const calculateStats = () => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ativo").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const pendingFirstAccess = users.filter((u) => u.primeiroAcesso).length;

    // Usuários que acessaram nas últimas 24h
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    const recentLogins = users.filter((u) => {
      if (!u.ultimoAcesso) return false;
      return u.ultimoAcesso.toDate() > dayAgo;
    }).length;

    return { total, active, admins, recentLogins, pendingFirstAccess };
  };

  const stats = calculateStats();

  const StatCard = ({ icon, value, label, color = "primary", subtext, trend }) => (
    <div style={{...styles.statCard, ...styles[`statCard${color.charAt(0).toUpperCase() + color.slice(1)}`]}}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statContent}>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
        {subtext && <div style={styles.statSubtext}>{subtext}</div>}
        {trend && <div style={styles.statTrend}>{trend}</div>}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.statsGrid}>
        <StatCard 
          icon="👥"
          value={stats.total} 
          label="Total de Usuários" 
          color="primary"
          subtext="Todos os usuários cadastrados"
        />

        <StatCard 
          icon="✅"
          value={stats.active} 
          label="Usuários Ativos" 
          color="success"
          subtext={`${Math.round((stats.active / stats.total) * 100)}% do total`}
        />

        <StatCard 
          icon="👑"
          value={stats.admins} 
          label="Administradores" 
          color="warning"
          subtext="Acesso completo ao sistema"
        />

        <StatCard 
          icon="🔄"
          value={stats.recentLogins} 
          label="Login Recente" 
          color="info"
          subtext="Últimas 24 horas"
        />

        {stats.pendingFirstAccess > 0 && (
          <StatCard
            icon="🔑"
            value={stats.pendingFirstAccess}
            label="Primeiro Acesso"
            color="danger"
            subtext="Aguardando ativação"
          />
        )}
      </div>

      {/* ✅ INDICADORES ADICIONAIS */}
      <div style={styles.additionalInfo}>
        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>📊 Resumo do Sistema</h4>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Taxa de Ativação:</span>
              <span style={styles.infoValue}>
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Usuários Operacionais:</span>
              <span style={styles.infoValue}>{stats.total - stats.admins}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Últimos Acessos:</span>
              <span style={styles.infoValue}>
                {stats.recentLogins > 0 ? `${stats.recentLogins} usuários` : "Nenhum acesso"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },

  statCard: {
    background: "var(--theme-surface)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "var(--shadow)",
    border: "2px solid var(--theme-border)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },

  statCardPrimary: {
    borderLeftColor: "var(--primary)",
    borderLeftWidth: "4px",
  },

  statCardSuccess: {
    borderLeftColor: "var(--success)",
    borderLeftWidth: "4px",
  },

  statCardWarning: {
    borderLeftColor: "var(--warning)",
    borderLeftWidth: "4px",
  },

  statCardInfo: {
    borderLeftColor: "var(--info)",
    borderLeftWidth: "4px",
  },

  statCardDanger: {
    borderLeftColor: "var(--error)",
    borderLeftWidth: "4px",
  },

  statIcon: {
    fontSize: "2.5em",
    marginBottom: "10px",
    opacity: 0.8,
  },

  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  statValue: {
    fontSize: "2.2em",
    fontWeight: "700",
    color: "var(--primary)",
    lineHeight: 1,
  },

  statLabel: {
    fontSize: "1em",
    fontWeight: "600",
    color: "var(--theme-text)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statSubtext: {
    fontSize: "0.85em",
    color: "var(--theme-text-secondary)",
    fontStyle: "italic",
  },

  statTrend: {
    fontSize: "0.8em",
    fontWeight: "600",
    color: "var(--success)",
    marginTop: "5px",
  },

  additionalInfo: {
    marginTop: "10px",
  },

  infoCard: {
    background: "var(--theme-surface-secondary)",
    borderRadius: "12px",
    padding: "20px",
    border: "2px solid var(--theme-border)",
    boxShadow: "var(--shadow-sm)",
  },

  infoTitle: {
    margin: "0 0 15px 0",
    color: "var(--primary)",
    fontSize: "1.1em",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid var(--theme-border)",
  },

  infoLabel: {
    fontSize: "0.9em",
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: "1em",
    color: "var(--theme-text)",
    fontWeight: "600",
  },
};

export default AdminStats;
