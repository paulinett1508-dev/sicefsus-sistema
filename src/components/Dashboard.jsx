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
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--warning)", marginBottom: 24 }}>settings</span>
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
            <h1 style={styles.title}>Bem-vindo, {user.nome || "Usuário"}</h1>
            <div style={styles.badges}>
              {/* Badge do Tipo de Usuário */}
              <span
                style={{
                  ...styles.badge,
                  backgroundColor:
                    user.tipo === "admin"
                      ? "#EF4444"
                      : user.tipo === "gestor"
                      ? "#F59E0B"
                      : "#10B981",
                  fontSize: "11px",
                  padding: "4px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {user.tipo === "admin" ? "shield_person" : user.tipo === "gestor" ? "account_balance" : "person"}
                </span>
                {user.tipo === "admin"
                  ? "Admin"
                  : user.tipo === "gestor"
                  ? "Gestor"
                  : "Operador"}
              </span>
              {!permissions.acessoTotal && (
                <span style={{ ...styles.badge, backgroundColor: "#2563EB", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                  {user.municipio}/{user.uf}
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
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
          Atualizar
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
          <h2 style={styles.sectionTitle}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_month</span>
            Acompanhamento de Prazos
          </h2>
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
    <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#EF4444", marginBottom: 16 }}>error</span>
    <h2 style={{ color: "#DC2626", marginBottom: 8 }}>{title}</h2>
    <p style={{ color: "#DC2626" }}>{message}</p>
    {onRetry && (
      <button onClick={onRetry} style={styles.retryButton}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
        Tentar Novamente
      </button>
    )}
  </div>
);

const EmptyState = ({ isAdmin, municipio }) => (
  <div style={styles.emptyState}>
    <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--gray-300)", marginBottom: 16 }}>analytics</span>
    <h3 style={{ color: "var(--gray-700)", marginBottom: 8 }}>Sem dados para exibir</h3>
    <p style={{ color: "var(--gray-500)", fontSize: 14 }}>
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

// ==================== ESTILOS MODERNOS ====================

const styles = {
  container: {
    padding: "16px 32px",
    backgroundColor: "var(--theme-bg, #F8FAFC)",
    minHeight: "100vh",
    fontFamily: "var(--font-family, 'Inter', sans-serif)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    padding: "20px 24px",
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.05))",
    border: "1px solid var(--theme-border, #E2E8F0)",
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
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--gray-800, #1E293B)",
    margin: 0,
  },
  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--gray-500, #64748B)",
    marginTop: "6px",
    marginBottom: 0,
    textTransform: "capitalize",
  },
  refreshButton: {
    backgroundColor: "var(--primary, #2563EB)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--gray-700, #334155)",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid var(--gray-200, #E2E8F0)",
    borderTop: "3px solid var(--primary, #2563EB)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "var(--gray-500, #64748B)",
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(239, 68, 68, 0.2)",
  },
  retryButton: {
    backgroundColor: "var(--error, #EF4444)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "16px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "12px",
    border: "1px solid var(--theme-border, #E2E8F0)",
    boxShadow: "var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.05))",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.3,
  },
  configPendente: {
    textAlign: "center",
    padding: "60px 24px",
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.05))",
    border: "1px solid var(--theme-border, #E2E8F0)",
    maxWidth: "600px",
    margin: "0 auto",
  },
  configIcon: {
    fontSize: "48px",
    marginBottom: "24px",
  },
  configTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--gray-800, #1E293B)",
    marginBottom: "12px",
  },
  configMessage: {
    fontSize: "14px",
    color: "var(--gray-600, #475569)",
    marginBottom: "8px",
  },
  configSubmessage: {
    fontSize: "13px",
    color: "var(--gray-500, #64748B)",
    marginBottom: "24px",
  },
  configInfo: {
    backgroundColor: "var(--gray-50, #F8FAFC)",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "left",
    fontSize: "13px",
    color: "var(--gray-600, #475569)",
    lineHeight: "1.8",
    border: "1px solid var(--theme-border, #E2E8F0)",
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