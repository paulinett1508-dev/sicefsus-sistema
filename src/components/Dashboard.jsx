// src/components/Dashboard.jsx - VERSÃO PROFISSIONAL
// ✅ FOCO: Visão gerencial e tomada de decisões
// ✅ UX: Cards informativos com insights acionáveis
// ✅ MANTIDO: Padrões visuais do sistema

import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import usePermissions from "../hooks/usePermissions";
import useDashboardData from "../hooks/useDashboardData";
import CronogramaWidget from "./DashboardComponents/CronogramaWidget";

const Dashboard = ({ usuario }) => {
  const navigate = useNavigate();
  const user = usuario;
  const userLoading = !usuario;
  const permissions = usePermissions(usuario);

  const { emendas, despesas, loading, error, stats, recarregar } =
    useDashboardData(user, permissions);

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

  // Cálculos para insights
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

  const topEmendas = [...emendas]
    .sort((a, b) => (b.valorRecurso || 0) - (a.valorRecurso || 0))
    .slice(0, 5);

  return (
    <div style={styles.container}>
      {/* Header Profissional */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard Gerencial</h1>
          <p style={styles.subtitle}>
            {permissions.acessoTotal
              ? "Visão geral do sistema"
              : `${user.municipio}/${user.uf}`}
          </p>
        </div>
        <div style={styles.headerActions}>
          <span style={styles.lastUpdate}>
            Atualizado em: {new Date().toLocaleString("pt-BR")}
          </span>
          <button onClick={recarregar} style={styles.refreshButton}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
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

      {/* Insights Acionáveis */}
      {(emendasCriticas > 0 || emendasVencidas > 0) && (
        <div style={styles.alertsSection}>
          <h2 style={styles.sectionTitle}>⚡ Ações Necessárias</h2>
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

      {/* Visão por Status */}
      <div style={styles.statusSection}>
        <h2 style={styles.sectionTitle}>📈 Distribuição por Status</h2>
        <div style={styles.statusGrid}>
          <StatusCard
            status="Executando"
            count={
              emendas.filter((e) => {
                const percentual = e.percentualExecutado || 0;
                return percentual > 0 && percentual < 100;
              }).length
            }
            total={stats.totalEmendas}
            color="#F39C12"
          />
          <StatusCard
            status="Concluídas"
            count={
              emendas.filter((e) => {
                const percentual = e.percentualExecutado || 0;
                return percentual >= 100;
              }).length
            }
            total={stats.totalEmendas}
            color="#27AE60"
          />
          <StatusCard
            status="Não Iniciadas"
            count={
              emendas.filter((e) => {
                const percentual = e.percentualExecutado || 0;
                const totalDespesas = e.totalDespesas || 0;
                return percentual === 0 && totalDespesas === 0;
              }).length
            }
            total={stats.totalEmendas}
            color="#95A5A6"
          />
          <StatusCard
            status="Vencidas"
            count={emendasVencidas}
            total={stats.totalEmendas}
            color="#E74C3C"
          />
        </div>
      </div>

      {/* Top Emendas */}
      {topEmendas.length > 0 && (
        <div style={styles.topEmendasSection}>
          <h2 style={styles.sectionTitle}>🏆 Maiores Emendas</h2>
          <div style={styles.topEmendasGrid}>
            {topEmendas.map((emenda, index) => (
              <TopEmendaCard
                key={emenda.id}
                rank={index + 1}
                emenda={emenda}
                onClick={() => navigate(`/emendas/${emenda.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cronograma Widget */}
      {emendas.length > 0 && (
        <div style={styles.cronogramaSection}>
          <h2 style={styles.sectionTitle}>📅 Cronograma de Execução</h2>
          <CronogramaWidget emendas={emendas} />
        </div>
      )}

      {/* Estado Vazio */}
      {stats.totalEmendas === 0 && (
        <EmptyState
          isAdmin={permissions.acessoTotal}
          municipio={user.municipio}
        />
      )}
    </div>
  );
};

// Componente MetricCard
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

// Componente AlertCard
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

// Componente StatusCard
const StatusCard = ({ status, count, total, color }) => (
  <div style={styles.statusCard}>
    <div style={{ ...styles.statusIndicator, backgroundColor: color }} />
    <div style={styles.statusContent}>
      <span style={styles.statusLabel}>{status}</span>
      <span style={styles.statusCount}>{count}</span>
      <span style={styles.statusPercent}>
        {total > 0 ? `${((count / total) * 100).toFixed(0)}%` : "0%"}
      </span>
    </div>
  </div>
);

// Componente TopEmendaCard
const TopEmendaCard = ({ rank, emenda, onClick }) => (
  <div style={styles.topEmendaCard} onClick={onClick}>
    <div style={styles.topEmendaRank}>#{rank}</div>
    <div style={styles.topEmendaContent}>
      <div style={styles.topEmendaHeader}>
        <span style={styles.topEmendaNumero}>{emenda.numero}</span>
        <span style={styles.topEmendaValor}>
          {formatCurrency(emenda.valorRecurso || 0)}
        </span>
      </div>
      <div style={styles.topEmendaInfo}>
        <span>{emenda.parlamentar}</span>
        <span style={styles.topEmendaDivider}>•</span>
        <span>
          {emenda.municipio}/{emenda.uf}
        </span>
      </div>
      <div style={styles.topEmendaProgress}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${emenda.percentualExecutado || 0}%`,
              backgroundColor: getProgressColor(emenda.percentualExecutado),
            }}
          />
        </div>
        <span style={styles.topEmendaPercent}>
          {(emenda.percentualExecutado || 0).toFixed(0)}% executado
        </span>
      </div>
    </div>
  </div>
);

// Componentes auxiliares
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

// Funções auxiliares
const formatCurrency = (value) => {
  return (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const getProgressColor = (percent) => {
  if (percent >= 80) return "#27AE60";
  if (percent >= 50) return "#F39C12";
  if (percent >= 20) return "#E67E22";
  return "#E74C3C";
};

// Estilos
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
    marginBottom: "32px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#154360",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginTop: "4px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  lastUpdate: {
    fontSize: "12px",
    color: "#999",
  },
  refreshButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
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
    marginBottom: "32px",
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
    border: "1px solid",
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
  statusSection: {
    marginBottom: "32px",
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  statusCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statusIndicator: {
    width: "8px",
    height: "40px",
    borderRadius: "4px",
  },
  statusContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  statusLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
  },
  statusCount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#154360",
  },
  statusPercent: {
    fontSize: "12px",
    color: "#999",
  },
  topEmendasSection: {
    marginBottom: "32px",
  },
  topEmendasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "16px",
  },
  topEmendaCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    gap: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  topEmendaRank: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#4A90E2",
  },
  topEmendaContent: {
    flex: 1,
  },
  topEmendaHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  topEmendaNumero: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#154360",
  },
  topEmendaValor: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#27AE60",
  },
  topEmendaInfo: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "8px",
  },
  topEmendaDivider: {
    margin: "0 8px",
  },
  topEmendaProgress: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  topEmendaPercent: {
    fontSize: "12px",
    color: "#666",
    whiteSpace: "nowrap",
  },
  cronogramaSection: {
    marginBottom: "32px",
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
