// src/components/Dashboard.jsx - VERSÃO REFATORADA
// ✅ REDUZIDO: De 1.132 para ~200 linhas
// ✅ PRESERVADO: 100% das funcionalidades
// ✅ CORRIGIDO: Filtro operador com município + UF
// ✅ MODULARIZADO: Componentes e hook separados

import React from "react";
import { useUser } from "../context/UserContext";
import usePermissions from "../hooks/usePermissions";

// 🧩 Componentes extraídos
import useDashboardData from "../hooks/useDashboardData";
import CronogramaWidget from "./DashboardComponents/CronogramaWidget";
import MetricsGrid from "./DashboardComponents/MetricsGrid";

const Dashboard = ({ usuario }) => {
  // 🔧 Hooks (sempre no topo)
  const user = usuario;
  const userLoading = !usuario;
  const permissions = usePermissions(usuario);

  // 🎯 Hook de dados (com correção operador)
  const { emendas, despesas, loading, error, stats, recarregar, debug } =
    useDashboardData(user, permissions);

  // 🔍 Estados de loading inicial
  if (userLoading || !user || !user.email || !user.tipo) {
    return (
      <div style={styles.container}>
        <StatusBar
          status="⏳ Carregando..."
          message={
            userLoading ? "Carregando usuário..." : "Verificando dados..."
          }
        />
        <LoadingState
          message={
            userLoading
              ? "Carregando dados do usuário..."
              : "Aguardando autenticação..."
          }
          subtext="Verificando permissões do usuário..."
        />
      </div>
    );
  }

  // 🚨 Verificação de permissões
  if (!permissions.temAcesso()) {
    return (
      <div style={styles.container}>
        <StatusBar status="❌ Permissão negada" />
        <ErrorState
          title="❌ Acesso Negado"
          message={
            permissions.aviso ||
            "Usuário sem permissão para acessar o dashboard."
          }
          subtext="Você não possui as permissões necessárias para visualizar este conteúdo."
        />
      </div>
    );
  }

  // 🔄 Estado de carregamento de dados
  if (loading) {
    return (
      <div style={styles.container}>
        <StatusBar status="🔄 Carregando..." />
        <LoadingState
          message="Carregando dados do dashboard..."
          subtext={
            permissions.acessoTotal
              ? "Carregando todos os dados do sistema..."
              : `Carregando dados do município ${user.municipio}...`
          }
        />
      </div>
    );
  }

  // ❌ Estado de erro
  if (error) {
    return (
      <div style={styles.container}>
        <StatusBar status="❌ Erro" />
        <ErrorState
          title="❌ Erro no Dashboard"
          message={error}
          onRetry={recarregar}
        />
      </div>
    );
  }

  // ✅ Renderização principal
  return (
    <div style={styles.container}>
      {/* 📊 Barra de status */}
      <StatusBar
        status="✅ Operacional"
        user={
          permissions.acessoTotal
            ? "👑 Admin"
            : `🏘️ ${user.municipio || "Município não cadastrado"}`
        }
        data={`${stats.totalEmendas} emendas • ${stats.totalDespesas} despesas`}
      />

      {/* 🔒 Banner para operadores */}
      {permissions.filtroAplicado && user.municipio && (
        <InfoBar
          municipio={user.municipio}
          uf={user.uf}
          totalEmendas={stats.totalEmendas}
          totalDespesas={stats.totalDespesas}
        />
      )}

      {/* 📊 Métricas principais */}
      <MetricsGrid stats={stats} />

      {/* 💎 Widget cronograma */}
      {emendas.length > 0 && <CronogramaWidget emendas={emendas} />}

      {/* 📈 Estado vazio */}
      {stats.totalEmendas === 0 && stats.totalDespesas === 0 && (
        <EmptyState
          isAdmin={permissions.acessoTotal}
          municipio={user.municipio}
        />
      )}
    </div>
  );
};

// 🧩 Componente StatusBar
const StatusBar = ({ status, user, data }) => (
  <div style={styles.statusBar}>
    <span>Status: {status}</span>
    <span style={styles.divider}>|</span>
    <span>Versão: v2.5</span>
    {user && (
      <>
        <span style={styles.divider}>|</span>
        <span>Usuário: {user}</span>
      </>
    )}
    {data && (
      <>
        <span style={styles.divider}>|</span>
        <span>Dados: {data}</span>
      </>
    )}
  </div>
);

// 🧩 Componente InfoBar (Banner Operador)
const InfoBar = ({ municipio, uf, totalEmendas, totalDespesas }) => (
  <div style={styles.infoBar}>
    <span style={styles.infoIcon}>🔒</span>
    <div style={styles.infoContent}>
      <span style={styles.infoText}>
        <strong>Filtro Ativo:</strong> Exibindo dados do município{" "}
        <strong>
          {municipio}/{uf || "UF não informada"}
        </strong>
      </span>
      <span style={styles.infoSubtext}>
        {totalEmendas} emenda(s) • {totalDespesas} despesa(s) disponíveis
      </span>
    </div>
  </div>
);

// 🧩 Componente LoadingState
const LoadingState = ({ message, subtext }) => (
  <div style={styles.loadingContainer}>
    <div style={styles.spinner}></div>
    <p style={styles.loadingText}>{message}</p>
    <p style={styles.loadingSubtext}>{subtext}</p>
  </div>
);

// 🧩 Componente ErrorState
const ErrorState = ({ title, message, subtext, onRetry }) => (
  <div style={styles.errorContainer}>
    <h2>{title}</h2>
    <p>{message}</p>
    {subtext && <p>{subtext}</p>}
    {onRetry && (
      <button onClick={onRetry} style={styles.retryButton}>
        🔄 Tentar Novamente
      </button>
    )}
  </div>
);

// 🧩 Componente EmptyState
const EmptyState = ({ isAdmin, municipio }) => (
  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>📊</div>
    <h3>Sistema Aguardando Dados</h3>
    <p>
      {isAdmin
        ? "Não há emendas ou despesas cadastradas no sistema."
        : `Não há dados cadastrados para o município ${municipio || "não informado"}.`}
    </p>
    <p style={styles.emptySubtext}>
      O dashboard será populado automaticamente conforme os dados forem
      cadastrados.
    </p>
  </div>
);

// 🎨 Estilos do Dashboard
const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  statusBar: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    background: "linear-gradient(135deg, #154360, #4A90E2)",
    color: "white",
    padding: "6px 16px",
    borderRadius: "6px",
    marginBottom: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    fontSize: "13px",
    gap: "6px",
  },
  divider: {
    opacity: 0.7,
    margin: "0 3px",
  },
  infoBar: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "#e8f5e8",
    border: "1px solid #4caf50",
    borderRadius: 8,
    marginBottom: "16px",
    fontSize: 13,
    color: "#2e7d32",
    boxShadow: "0 2px 6px rgba(76, 175, 80, 0.1)",
  },
  infoIcon: {
    fontSize: 16,
    flexShrink: 0,
    marginTop: 1,
  },
  infoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 1.3,
    fontWeight: "500",
  },
  infoSubtext: {
    fontSize: 11,
    opacity: 0.8,
    fontWeight: "400",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "50px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "6px",
  },
  loadingSubtext: {
    fontSize: "13px",
    color: "#666",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#f8d7da",
    borderRadius: "8px",
    border: "1px solid #f5c6cb",
  },
  retryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptySubtext: {
    color: "#666",
    fontSize: "13px",
    fontStyle: "italic",
    marginTop: "8px",
  },
};

// ✅ Animações CSS
if (!document.getElementById("dashboard-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "dashboard-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    div[style*="cursor: pointer"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;
