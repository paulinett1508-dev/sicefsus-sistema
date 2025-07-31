// src/components/Dashboard.jsx - Dashboard Principal SICEFSUS
import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import AdminPanel from "./AdminPanel";
import Emendas from "./Emendas";
import Despesas from "./Despesas";
import Relatorios from "./Relatorios";
import DataManager from "./DataManager";
import WorkflowManager from "./WorkflowManager";
import ContextPanel from "./ContextPanel";
import Sobre from "./Sobre";
import AdminStats from "./AdminStats";
import { useToast } from "./Toast";

const Dashboard = () => {
  const { usuario, loading } = useUser();
  const [activeTab, setActiveTab] = useState("emendas");
  const [contextData, setContextData] = useState(null);
  const toast = useToast();

  // ✅ VERIFICAÇÃO DE CARREGAMENTO
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  // ✅ VERIFICAÇÃO DE USUÁRIO
  if (!usuario) {
    return (
      <div style={styles.errorContainer}>
        <h2>⚠️ Acesso Negado</h2>
        <p>Usuário não autenticado. Faça login para acessar o dashboard.</p>
      </div>
    );
  }

  // ✅ DETERMINAR ABAS DISPONÍVEIS BASEADO NO TIPO DE USUÁRIO
  const getAvailableTabs = () => {
    const isAdmin = usuario.tipo === "admin" || usuario.role === "admin";

    const baseTabs = [
      { id: "emendas", label: "📋 Emendas", icon: "📋" },
      { id: "despesas", label: "💰 Despesas", icon: "💰" },
      { id: "relatorios", label: "📊 Relatórios", icon: "📊" },
      { id: "sobre", label: "ℹ️ Sobre", icon: "ℹ️" },
    ];

    // ✅ ABAS EXCLUSIVAS PARA ADMIN
    if (isAdmin) {
      baseTabs.splice(2, 0, 
        { id: "admin", label: "👥 Administração", icon: "👥" },
        { id: "stats", label: "📈 Estatísticas", icon: "📈" },
        { id: "data", label: "🗄️ Dados", icon: "🗄️ " },
        { id: "workflow", label: "🔄 Workflows", icon: "🔄" }
      );
    }

    return baseTabs;
  };

  const availableTabs = getAvailableTabs();

  // ✅ VERIFICAR SE ABA ATUAL É VÁLIDA PARA O USUÁRIO
  useEffect(() => {
    const isTabValid = availableTabs.some(tab => tab.id === activeTab);
    if (!isTabValid) {
      setActiveTab("emendas"); // Fallback para aba padrão
    }
  }, [usuario, activeTab, availableTabs]);

  // ✅ RENDERIZAR CONTEÚDO DA ABA ATIVA
  const renderActiveContent = () => {
    const isAdmin = usuario.tipo === "admin" || usuario.role === "admin";

    switch (activeTab) {
      case "emendas":
        return <Emendas usuario={usuario} onContextChange={setContextData} />;

      case "despesas":
        return <Despesas usuario={usuario} onContextChange={setContextData} />;

      case "relatorios":
        return <Relatorios usuario={usuario} />;

      case "admin":
        return isAdmin ? <AdminPanel /> : <div>Acesso negado</div>;

      case "stats":
        return isAdmin ? <AdminStats /> : <div>Acesso negado</div>;

      case "data":
        return isAdmin ? <DataManager /> : <div>Acesso negado</div>;

      case "workflow":
        return isAdmin ? <WorkflowManager /> : <div>Acesso negado</div>;

      case "sobre":
        return <Sobre />;

      default:
        return <Emendas usuario={usuario} onContextChange={setContextData} />;
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* ✅ HEADER COM INFORMAÇÕES DO USUÁRIO */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            🏛️ SICEFSUS Dashboard
          </h1>
          <p style={styles.subtitle}>
            Sistema de Controle de Emendas - Fundo de Saúde
          </p>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>
              👤 {usuario.nome || usuario.displayName || "Usuário"}
            </span>
            <span style={styles.userRole}>
              {usuario.tipo === "admin" ? "🔑 Administrador" : "👨‍💼 Operador"}
            </span>
            {usuario.municipio && (
              <span style={styles.userLocation}>
                📍 {usuario.municipio}/{usuario.uf}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ✅ NAVEGAÇÃO POR ABAS */}
      <div style={styles.tabsContainer}>
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span style={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ✅ LAYOUT PRINCIPAL */}
      <div style={styles.mainLayout}>
        {/* CONTEÚDO PRINCIPAL */}
        <div style={styles.mainContent}>
          {renderActiveContent()}
        </div>

        {/* PAINEL DE CONTEXTO (LATERAL) */}
        {contextData && (
          <div style={styles.contextSidebar}>
            <ContextPanel 
              data={contextData} 
              onClose={() => setContextData(null)}
              usuario={usuario}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ ESTILOS DO DASHBOARD
const styles = {
  dashboard: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    display: "flex",
    flexDirection: "column",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    textAlign: "center",
    padding: "20px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },

  header: {
    backgroundColor: "#ffffff",
    padding: "20px 30px",
    borderBottom: "2px solid #e9ecef",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  headerLeft: {
    display: "flex",
    flexDirection: "column",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
  },

  title: {
    margin: "0 0 5px 0",
    color: "#2c3e50",
    fontSize: "24px",
    fontWeight: "bold",
  },

  subtitle: {
    margin: 0,
    color: "#6c757d",
    fontSize: "14px",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },

  userName: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#2c3e50",
  },

  userRole: {
    fontSize: "12px",
    color: "#007bff",
    fontWeight: "500",
  },

  userLocation: {
    fontSize: "11px",
    color: "#6c757d",
  },

  tabsContainer: {
    backgroundColor: "#ffffff",
    display: "flex",
    borderBottom: "1px solid #e9ecef",
    overflowX: "auto",
    padding: "0 30px",
  },

  tab: {
    background: "none",
    border: "none",
    padding: "15px 20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#6c757d",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    borderBottom: "3px solid transparent",
    whiteSpace: "nowrap",
  },

  activeTab: {
    color: "#007bff",
    borderBottomColor: "#007bff",
    backgroundColor: "#f8f9ff",
  },

  tabIcon: {
    fontSize: "16px",
  },

  tabLabel: {
    fontSize: "14px",
  },

  mainLayout: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },

  mainContent: {
    flex: 1,
    padding: "30px",
    overflow: "auto",
  },

  contextSidebar: {
    width: "400px",
    backgroundColor: "#ffffff",
    borderLeft: "1px solid #e9ecef",
    overflow: "auto",
  },
};

// ✅ ADICIONAR ANIMAÇÃO CSS PARA O SPINNER
if (typeof document !== "undefined" && !document.getElementById("dashboard-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "dashboard-styles";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .dashboard-tabs {
        padding: 0 15px;
      }

      .dashboard-main-content {
        padding: 20px 15px;
      }

      .dashboard-context-sidebar {
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
        height: 100vh;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;