
// src/components/AdminStats.jsx - Estatísticas Padronizadas SICEFSUS
import React, { useMemo } from "react";

const AdminStats = ({ users }) => {
  // ✅ CALCULAR ESTATÍSTICAS ESSENCIAIS COM LOCALIZAÇÃO - MEMOIZED
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ativo").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const operators = users.filter((u) => u.role === "user").length;
    const pendingFirstAccess = users.filter((u) => u.primeiroAcesso).length;
    
    // ✅ ESTATÍSTICAS DE LOCALIZAÇÃO
    const operatorsWithLocation = users.filter((u) => 
      u.role === "user" && u.municipio && u.uf
    ).length;
    const operatorsWithoutLocation = operators - operatorsWithLocation;
    
    // Contagem por UF
    const locationStats = users
      .filter((u) => u.role === "user" && u.uf)
      .reduce((acc, user) => {
        const uf = user.uf.toUpperCase();
        acc[uf] = (acc[uf] || 0) + 1;
        return acc;
      }, {});

    return { 
      total, 
      active, 
      admins, 
      operators,
      pendingFirstAccess,
      operatorsWithLocation,
      operatorsWithoutLocation,
      locationStats
    };
  }, [users]); // Recalcular apenas quando users mudar

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
      {/* ✅ RESUMO COMPACTO COM LOCALIZAÇÃO */}
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
        <div style={styles.summaryDivider}>•</div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Operadores:</span>
          <span style={{...styles.summaryValue, color: 'var(--info)'}}>{stats.operators}</span>
        </div>
        {stats.operatorsWithoutLocation > 0 && (
          <>
            <div style={styles.summaryDivider}>•</div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Sem Localização:</span>
              <span style={{...styles.summaryValue, color: 'var(--error)'}}>{stats.operatorsWithoutLocation}</span>
            </div>
          </>
        )}
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

      {/* ✅ ALERTAS IMPORTANTES DE LOCALIZAÇÃO E ACESSO */}
      {stats.operatorsWithoutLocation > 0 && (
        <div style={{...styles.alertBanner, borderColor: 'var(--error)', backgroundColor: 'var(--error-light)'}}>
          <span style={styles.alertIcon}>🚨</span>
          <span style={{...styles.alertText, color: 'var(--error-dark)'}}>
            <strong>CRÍTICO:</strong> {stats.operatorsWithoutLocation} operador(es) sem localização definida - não poderão acessar emendas
          </span>
        </div>
      )}
      
      {stats.pendingFirstAccess > 0 && (
        <div style={styles.alertBanner}>
          <span style={styles.alertIcon}>⚠️</span>
          <span style={styles.alertText}>
            {stats.pendingFirstAccess} usuário(s) aguardando primeiro acesso
          </span>
        </div>
      )}

      {Object.keys(stats.locationStats).length > 0 && (
        <div style={{...styles.alertBanner, borderColor: 'var(--info)', backgroundColor: 'var(--info-light)'}}>
          <span style={styles.alertIcon}>📍</span>
          <span style={{...styles.alertText, color: 'var(--info-dark)'}}>
            Operadores por UF: {Object.entries(stats.locationStats)
              .map(([uf, count]) => `${uf}(${count})`)
              .join(', ')}
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
    gap: "var(--space-4)",
    fontFamily: "var(--font-family)",
  },

  // ✅ BARRA DE RESUMO SEGUINDO PADRÃO DASHBOARD
  summaryBar: {
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)",
    borderRadius: "var(--border-radius-lg)",
    padding: "var(--space-4) var(--space-5)",
    border: "2px solid var(--theme-border)",
    gap: "var(--space-5)",
    fontSize: "var(--font-size-sm)",
    boxShadow: "var(--shadow)",
    transition: "all var(--transition-normal)",
  },

  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
  },

  summaryLabel: {
    color: "var(--theme-text-secondary)",
    fontWeight: "var(--font-weight-medium)",
  },

  summaryValue: {
    color: "var(--theme-text)",
    fontWeight: "var(--font-weight-semibold)",
    fontSize: "1.1em",
  },

  summaryDivider: {
    color: "var(--theme-text-muted)",
    fontSize: "0.8em",
    opacity: 0.6,
  },

  // ✅ BANNER DE ALERTA PADRONIZADO
  alertBanner: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    background: "var(--warning-light)",
    border: "2px solid var(--warning)",
    borderRadius: "var(--border-radius)",
    padding: "var(--space-3) var(--space-4)",
    fontSize: "var(--font-size-sm)",
    boxShadow: "var(--shadow-sm)",
    animation: "slideUp 0.3s ease",
  },

  alertIcon: {
    fontSize: "1.2em",
  },

  alertText: {
    color: "var(--warning-dark)",
    fontWeight: "var(--font-weight-medium)",
  },

  // ✅ CARDS SEGUINDO PADRÃO DO SISTEMA
  compactCard: {
    background: "linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)",
    borderRadius: "var(--border-radius-lg)",
    padding: "var(--space-4) var(--space-5)",
    border: "2px solid var(--theme-border)",
    borderLeft: "4px solid",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-4)",
    transition: "all var(--transition-normal)",
    boxShadow: "var(--shadow)",
  },

  cardIcon: {
    fontSize: "1.5em",
    opacity: 0.8,
  },

  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },

  cardValue: {
    fontSize: "1.4em",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--theme-text)",
    lineHeight: 1,
  },

  cardLabel: {
    fontSize: "var(--font-size-xs)",
    color: "var(--theme-text-secondary)",
    fontWeight: "var(--font-weight-medium)",
  },
};

export default React.memo(AdminStats);
