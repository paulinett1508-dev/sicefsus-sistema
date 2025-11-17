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
import DashboardRankings from "./DashboardComponents/DashboardRankings";
import DashboardMunicipios from "./DashboardComponents/DashboardMunicipios";
import AlertasDetalhados from "./DashboardComponents/DashboardAlertasDetalhados";

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

  // Verificar se usuário está autenticado
  if (!user) {
    return null;
  }

  // 🚨 BLOQUEAR ACESSO SE CADASTRO INCOMPLETO
  if (user.cadastroIncompleto) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '100px auto',
        backgroundColor: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#856404', marginBottom: '20px' }}>
          ⚠️ Cadastro Incompleto
        </h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#856404', marginBottom: '20px' }}>
          Seu usuário <strong>{user.email}</strong> foi criado no sistema de autenticação,
          mas ainda não foi completamente configurado no Firestore.
        </p>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ffc107',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#856404', marginBottom: '12px' }}>🔧 O que precisa ser feito:</h3>
          <ol style={{ color: '#856404', lineHeight: '1.8' }}>
            <li>Solicite a um <strong>administrador</strong> que acesse o módulo <strong>Administração</strong></li>
            <li>Peça para ele criar/completar seu cadastro no sistema</li>
            <li>Certifique-se de que seu município e UF sejam definidos</li>
            <li>Aguarde a confirmação de que o cadastro foi concluído</li>
          </ol>
        </div>
        <p style={{ fontSize: '14px', color: '#856404', fontStyle: 'italic' }}>
          💡 Após a conclusão do cadastro, faça logout e login novamente para acessar o sistema.
        </p>
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

  // ✅ VERIFICAÇÃO ESPECIAL: Operador sem configuração
  if (user?.tipo === "operador" && (!user.municipio || !user.uf)) {
    return (
      <div style={styles.container}>
        <div style={styles.configPendente}>
          <div style={styles.configIcon}>⚙️</div>
          <h2 style={styles.configTitle}>Configuração Pendente</h2>
          <p style={styles.configMessage}>
            Seu usuário ainda não foi configurado pelo administrador.
          </p>
          <p style={styles.configSubmessage}>
            Entre em contato com o administrador para definir seu município e UF de acesso.
          </p>
          <div style={styles.configInfo}>
            <strong>Email:</strong> {user.email}<br/>
            <strong>Nome:</strong> {user.nome || user.displayName}<br/>
            <strong>Status:</strong> Aguardando configuração
          </div>
        </div>
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
              {/* Badge do Tipo de Usuário */}
              <span
                style={{
                  ...styles.badge,
                  backgroundColor:
                    user.tipo === "admin"
                      ? "#dc3545"
                      : user.tipo === "gestor"
                      ? "#ffc107"
                      : "#28a745",
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
              >
                {user.tipo === "admin"
                  ? "👑 Admin"
                  : user.tipo === "gestor"
                  ? "🏛️ Gestor"
                  : "👤 Operador"}
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

      {/* ========== SEÇÃO DE ALERTAS CRÍTICOS (DETALHADA) ========== */}
      <AlertasDetalhados
        emendas={emendas}
        onVerDetalhes={() => navigate("/emendas")}
      />

      {/* ========== GRID PRINCIPAL: EXECUÇÃO + TIMELINE ========== */}
      <div style={styles.mainGrid}>
        <DashboardExecucao emendas={emendas} />
        <DashboardTimeline emendas={emendas} />
      </div>

      {/* ========== RANKINGS ========== */}
      <DashboardRankings emendas={emendas} />

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

// Componentes de cards removidos - substituídos por AlertasDetalhados

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
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#154360",
    marginBottom: "16px",
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
  configPendente: {
    textAlign: "center",
    padding: "60px 24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    maxWidth: "600px",
    margin: "0 auto",
  },
  configIcon: {
    fontSize: "64px",
    marginBottom: "24px",
  },
  configTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#154360",
    marginBottom: "12px",
  },
  configMessage: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "8px",
  },
  configSubmessage: {
    fontSize: "14px",
    color: "#999",
    marginBottom: "24px",
  },
  configInfo: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "left",
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.8",
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