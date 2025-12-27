// src/components/SystemStatusBar.jsx
// Header compacto com status do sistema, versão, ambiente e página atual
import React from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useVersion } from "../hooks/useVersion";

// Detectar ambiente
const getEnvironment = () => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";
  if (projectId.includes("prod")) return { label: "PROD", color: "#dc2626", bgColor: "rgba(220, 38, 38, 0.1)" };
  if (projectId.includes("60dbd")) return { label: "DEV", color: "#16a34a", bgColor: "rgba(22, 163, 74, 0.1)" };
  return { label: "TEST", color: "#ea580c", bgColor: "rgba(234, 88, 12, 0.1)" };
};

// Obter nome da página atual
const getPageName = (pathname) => {
  if (pathname.includes("/emendas/") && pathname.includes("editar")) return "Editar Emenda";
  if (pathname.includes("/emendas/nova")) return "Nova Emenda";
  if (pathname.includes("/emendas/")) return "Detalhes da Emenda";
  if (pathname.includes("/emendas")) return "Emendas";
  if (pathname.includes("/relatorios")) return "Relatórios";
  if (pathname.includes("/ferramentas-dev")) return "Ferramentas Dev";
  if (pathname.includes("/administracao")) return "Administração";
  if (pathname.includes("/sobre")) return "Sistema";
  if (pathname === "/dashboard") return "Dashboard";
  return "SICEFSUS";
};

// Obter ícone da página
const getPageIcon = (pathname) => {
  if (pathname.includes("/emendas")) return "description";
  if (pathname.includes("/relatorios")) return "analytics";
  if (pathname.includes("/ferramentas-dev")) return "build";
  if (pathname.includes("/administracao")) return "admin_panel_settings";
  if (pathname.includes("/sobre")) return "info";
  return "dashboard";
};

export default function SystemStatusBar() {
  const location = useLocation();
  const { usuario } = useUser();
  const { version } = useVersion();
  const env = getEnvironment();

  const isAdmin = usuario?.tipo === "admin";
  const isSuperAdmin = isAdmin && usuario?.superAdmin === true;
  const pageName = getPageName(location.pathname);
  const pageIcon = getPageIcon(location.pathname);

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        {/* Status Operacional */}
        <span style={styles.statusItem}>
          <span style={styles.statusDot}></span>
          <span style={styles.statusText}>Operacional</span>
        </span>

        <span style={styles.divider}>|</span>

        {/* Versão */}
        <span style={styles.versionText}>v{version}</span>

        <span style={styles.divider}>|</span>

        {/* Ambiente */}
        <span style={{ ...styles.envBadge, backgroundColor: env.bgColor, color: env.color }}>
          {env.label}
        </span>

        {/* Admin Badge */}
        {isAdmin && (
          <>
            <span style={styles.divider}>|</span>
            <span style={styles.adminBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2 }}>shield</span>
              Admin
            </span>
          </>
        )}

        {/* Super Admin Badge */}
        {isSuperAdmin && (
          <>
            <span style={styles.divider}>|</span>
            <span style={styles.superBadge}>SUPER</span>
          </>
        )}

        {/* Acesso Total */}
        {isSuperAdmin && (
          <>
            <span style={styles.divider}>|</span>
            <span style={styles.accessBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2 }}>key</span>
              Acesso Total
            </span>
          </>
        )}
      </div>

      <div style={styles.rightSection}>
        <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, color: "var(--theme-text-secondary)" }}>
          {pageIcon}
        </span>
        <span style={styles.pageText}>{pageName}</span>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 32,
    backgroundColor: "var(--theme-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    fontSize: 11,
    color: "var(--theme-text-secondary)",
    borderBottom: "1px solid var(--theme-border)",
    flexShrink: 0,
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
  },

  statusItem: {
    display: "flex",
    alignItems: "center",
    color: "#10b981",
  },

  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: "#10b981",
    borderRadius: "50%",
    marginRight: 4,
  },

  statusText: {
    fontSize: 10,
  },

  divider: {
    color: "var(--theme-border)",
    fontSize: 10,
  },

  versionText: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "var(--theme-text-muted)",
  },

  envBadge: {
    fontSize: 9,
    fontWeight: 700,
    padding: "1px 5px",
    borderRadius: 3,
    textTransform: "uppercase",
  },

  adminBadge: {
    display: "flex",
    alignItems: "center",
    color: "#f59e0b",
    fontSize: 10,
  },

  superBadge: {
    fontSize: 9,
    fontWeight: 700,
    padding: "1px 5px",
    borderRadius: 3,
    backgroundColor: "#4f46e5",
    color: "#fff",
  },

  accessBadge: {
    display: "flex",
    alignItems: "center",
    color: "#ef4444",
    fontSize: 10,
  },

  pageText: {
    fontSize: 11,
    color: "var(--theme-text)",
    fontWeight: 500,
  },
};
