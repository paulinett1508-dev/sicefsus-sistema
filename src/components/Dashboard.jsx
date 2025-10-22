// src/components/Dashboard.jsx - VERSÃO ESTRATÉGICA REFATORADA
// ✅ Integra todos os novos componentes
// ✅ Preserva CronogramaWidget existente
// ✅ Remove redundâncias do MetricsGrid

import React from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../hooks/usePermissions";
import useDashboardData from "../hooks/useDashboardData";

// ✅ Componentes existentes (manter)
import CronogramaWidget from "./DashboardComponents/CronogramaWidget";

// 🆕 Novos componentes estratégicos
import DashboardExecucao from "./DashboardComponents/DashboardExecucao";
import DashboardTimeline from "./DashboardComponents/DashboardTimeline";
import DashboardVelocidade from "./DashboardComponents/DashboardVelocidade";
import DashboardRankings from "./DashboardComponents/DashboardRankings";
import DashboardMunicipios from "./DashboardComponents/DashboardMunicipios";

const Dashboard = ({ usuario }) => {
  const navigate = useNavigate();
  const user = usuario;
  const userLoading = !usuario;
  const permissions = usePermissions(usuario);

  const { emendas, despesas, loading, error, stats, recarregar } =
    useDashboardData(user, permissions);

  // ==================== ESTADOS DE CARREGAMENTO ====================

  // Loading inicial
  if (userLoading || !user || !user.email || !user.tipo) {
    return (
      <div style={styles.container}>
        <LoadingState message="Carregando dashboard..." />
      </div>
    );
  }

  // Verificação de permissões
  if (!permissions.temAcesso()) {
    return (
      <div style={styles.container}>
        <ErrorState
          title="Acesso Negado"
          message={
            permissions.aviso || "Sem permissão para acessar o dashboard."
          }
        />
      </div>
    );
  }

  // Loading de dados
  if (loading) {
    return (
      <div style={styles.container}>
        <LoadingState message="Carregando dados..." />
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div style={styles.container}>
        <ErrorState
          title="Erro no Dashboard"
          message={error}
          onRetry={recarregar}
        />
      </div>
    );
  }

  // ==================== CÁLCULOS PARA INSIGHTS ====================

  const taxaExecucao =
    stats.valorTotalEmendas > 0
      ? ((stats.valorExecutado / stats.valorTotalEmendas) * 100).toFixed(1)
      : 0;

  const emendasCriticas = emendas.filter((e) => {
    const hoje = new Date();
    const validade = e.dataValidade ? new Date(e.dataValidade) : null;
    const diasRestantes = validade
      ? Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24))
      : 0;
    return (
      diasRestantes > 0 && diasRestantes <= 30 && e.percentualExecutado < 80
    );
  }).length;

  const emendasVencidas = emendas.filter((e) => {
    const hoje = new Date();
    const validade = e.dataValidade ? new Date(e.dataValidade) : null;
    return validade && validade < hoje && e.percentualExecutado < 100;
  }).length;

  // ==================== RENDER PRINCIPAL ====================

  return (
    <div style={styles.container}>
      {/* ========== HEADER PERSONALIZADO ========== */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTop}>
            <h1 style={styles.title}>👋 Bem-vindo, {user.nome || "Usuário"}</h1>
            <div style={styles.badges}>
              <span
                style={{
                  ...styles.badge,
                  backgroundColor:
                    user.tipo === "admin" ? "#E74C3C" : "#27AE60",
                }}
              >
                {user.tipo === "admin" ? "👑 Admin" : "👤 Operador"}
              </span>
              {!permissions.acessoTotal && (
                <span style={{ ...styles.badge, backgroundColor: "#3498DB" }}>
                  📍 {user.municipio}/{user.uf}
                </span>
              )}
            </div>
          </div>
          <p style={styles.subtitle}>
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button onClick={recarregar} style={styles.refreshButton}>
          🔄 Atualizar
        </button>
      </div>

      {/* ========== CARDS DE MÉTRICAS PRINCIPAIS (INSIGHTS) ========== */}
      <div style={styles.metricsGrid}>
        <MetricCard
          title="Valor Total"
          value={formatCurrency(stats.valorTotalEmendas)}
          subtitle={`${stats.totalEmendas} emendas`}
          icon="💰"
          color="#154360"
          onClick={() => navigate("/emendas")}
        />
        <MetricCard
          title="Executado"
          value={formatCurrency(stats.valorExecutado)}
          subtitle={`${taxaExecucao}% do total`}
          icon="📊"
          color="#27AE60"
          progress={taxaExecucao}
          onClick={() => navigate("/despesas")}
        />
        <MetricCard
          title="Saldo Disponível"
          value={formatCurrency(stats.saldoDisponivel)}
          subtitle="Para execução"
          icon="💵"
          color="#4A90E2"
        />
        <MetricCard
          title="Alertas"
          value={emendasCriticas + emendasVencidas}
          subtitle={`${emendasCriticas} críticas, ${emendasVencidas} vencidas`}
          icon="⚠️"
          color={emendasCriticas + emendasVencidas > 0 ? "#E74C3C" : "#95A5A6"}
          highlight={emendasCriticas + emendasVencidas > 0}
        />
      </div>

      {/* ========== ALERTAS CRÍTICOS ========== */}
      {(emendasCriticas > 0 || emendasVencidas > 0) && (
        <div style={styles.alertsSection}>
          <h2 style={styles.sectionTitle}>🚨 Requer Atenção Imediata</h2>
          <div style={styles.alertsGrid}>
            {emendasCriticas > 0 && (
              <AlertCard
                type="warning"
                title={`${emendasCriticas} emendas próximas do vencimento`}
                message="Com menos de 30 dias e execução abaixo de 80%"
                action="Ver emendas críticas"
                onAction={() => navigate("/emendas")}
              />
            )}
            {emendasVencidas > 0 && (
              <AlertCard
                type="danger"
                title={`${emendasVencidas} emendas vencidas`}
                message="Prazo expirado com execução incompleta"
                action="Ver emendas vencidas"
                onAction={() => navigate("/emendas")}
              />
            )}
          </div>
        </div>
      )}

      {/* ========== GRID PRINCIPAL: EXECUÇÃO + TIMELINE ========== */}
      <div style={styles.mainGrid}>
        <DashboardExecucao emendas={emendas} />
        <DashboardTimeline emendas={emendas} />
      </div>

      {/* ========== GRID SECUNDÁRIO: RANKINGS + VELOCIDADE ========== */}
      <div style={styles.mainGrid}>
        <DashboardRankings emendas={emendas} />
        <DashboardVelocidade despesas={despesas} stats={stats} />
      </div>

      {/* ========== RANKING DE MUNICÍPIOS (Admin Only) ========== */}
      <DashboardMunicipios emendas={emendas} userRole={user.tipo} />

      {/* ========== CRONOGRAMA WIDGET (EXISTENTE - PRESERVADO) ========== */}
      {emendas.length > 0 && (
        <div style={styles.cronogramaSection}>
          <h2 style={styles.sectionTitle}>📅 Acompanhamento de Prazos</h2>
          <CronogramaWidget emendas={emendas} />
        </div>
      )}

      {/* ========== ESTADO VAZIO ========== */}
      {stats.totalEmendas === 0 && (
        <EmptyState
          isAdmin={permissions.acessoTotal}
          municipio={user.municipio}
        />
      )}
    </div>
  );
};

// ==================== COMPONENTES AUXILIARES ====================

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  progress,
  onClick,
  highlight,
}) => (
  <div
    style={{
      ...styles.metricCard,
      borderLeft: `4px solid ${color}`,
      cursor: onClick ? "pointer" : "default",
      animation: highlight ? "pulse 2s infinite" : "none",
    }}
    onClick={onClick}
  >
    <div style={styles.metricHeader}>
      <span style={styles.metricIcon}>{icon}</span>
      <span style={styles.metricTitle}>{title}</span>
    </div>
    <div style={styles.metricValue}>{value}</div>
    <div style={styles.metricSubtitle}>{subtitle}</div>
    {progress !== undefined && (
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    )}
  </div>
);

const AlertCard = ({ type, title, message, action, onAction }) => (
  <div
    style={{
      ...styles.alertCard,
      backgroundColor: type === "danger" ? "#FADBD8" : "#FCF3CF",
      borderColor: type === "danger" ? "#E74C3C" : "#F39C12",
    }}
  >
    <h4 style={styles.alertTitle}>{title}</h4>
    <p style={styles.alertMessage}>{message}</p>
    <button
      onClick={onAction}
      style={{
        ...styles.alertButton,
        backgroundColor: type === "danger" ? "#E74C3C" : "#F39C12",
      }}
    >
      {action}
    </button>
  </div>
);

const LoadingState = ({ message }) => (
  <div style={styles.loadingContainer}>
    <div style={styles.spinner}></div>
    <p style={styles.loadingText}>{message}</p>
  </div>
);

const ErrorState = ({ title, message, onRetry }) => (
  <div style={styles.errorContainer}>
    <h2>{title}</h2>
    <p>{message}</p>
    {onRetry && (
      <button onClick={onRetry} style={styles.retryButton}>
        🔄 Tentar Novamente
      </button>
    )}
  </div>
);

const EmptyState = ({ isAdmin, municipio }) => (
  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>📊</div>
    <h3>Sem dados para exibir</h3>
    <p>
      {isAdmin
        ? "Não há emendas cadastradas no sistema."
        : `Não há dados para o município ${municipio}.`}
    </p>
  </div>
);

// ==================== FUNÇÕES AUXILIARES ====================

const formatCurrency = (value) => {
  return (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

// ==================== ESTILOS ====================

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#154360",
    margin: 0,
  },
  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginTop: "8px",
    marginBottom: 0,
    textTransform: "capitalize",
  },
  refreshButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  metricCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.3s",
  },
  metricHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  metricIcon: {
    fontSize: "24px",
  },
  metricTitle: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "600",
  },
  metricValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#154360",
    marginBottom: "4px",
  },
  metricSubtitle: {
    fontSize: "13px",
    color: "#999",
  },
  progressBar: {
    height: "4px",
    backgroundColor: "#e9ecef",
    borderRadius: "2px",
    marginTop: "12px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  alertsSection: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#154360",
    marginBottom: "16px",
  },
  alertsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  },
  alertCard: {
    padding: "20px",
    borderRadius: "8px",
    border: "2px solid",
  },
  alertTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 8px 0",
  },
  alertMessage: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 12px 0",
  },
  alertButton: {
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  cronogramaSection: {
    marginBottom: "24px",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #4A90E2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 24px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#666",
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "#fee",
    borderRadius: "8px",
  },
  retryButton: {
    backgroundColor: "#E74C3C",
    color: "white",
    border: "none",
    padding: "10px 24px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "16px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.3,
  },
};

// CSS para animações
if (!document.getElementById("dashboard-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "dashboard-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.8; }
      100% { opacity: 1; }
    }
    div[style*="cursor: pointer"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;
