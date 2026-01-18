import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import logoSicefsusLight from "../images/logo-sicefsus-ver-modoclaro.png";
import logoSicefsusDark from "../images/logo-sicefsus-ver-mododark.png";
import { useVersion } from "../hooks/useVersion";
import { useTheme } from "../context/ThemeContext";

// Detectar ambiente
const getEnvironment = () => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";
  if (projectId.includes("prod")) return { label: "PROD", color: "#dc2626" };
  if (projectId.includes("60dbd")) return { label: "DEV", color: "#16a34a" };
  return { label: "TEST", color: "#ea580c" };
};

// Menu principal
const menuItems = [
  { label: "Dashboard", icon: "dashboard", path: "/dashboard" },
  { label: "Emendas", icon: "description", path: "/emendas" },
  { label: "Fornecedores", icon: "business", path: "/fornecedores" },
  { label: "Relatórios", icon: "analytics", path: "/relatorios" },
];

// Menu admin
const adminItems = [{ label: "Usuários", icon: "group", path: "/administracao" }];

// Item "Sobre" - movido para o footer

export default function Sidebar({ onNavigate, activePath, usuario, onLogout, onToggleCollapse }) {
  const [collapsed, setCollapsed] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [toggleHovered, setToggleHovered] = useState(false);
  const location = useLocation();
  const { version } = useVersion();
  const { isDark } = useTheme();
  const env = getEnvironment();
  const logoSicefsus = isDark ? logoSicefsusDark : logoSicefsusLight;

  // Notificar o pai quando o collapsed muda
  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsed);
    }
  };

  const isAdmin = usuario?.tipo === "admin";
  const isSuperAdmin = isAdmin && usuario?.superAdmin === true;

  // Detectar se está em formulário
  const isCreatingEmenda =
    location.pathname.includes("/emendas") &&
    (location.search.includes("nova") ||
      location.pathname.includes("nova") ||
      window.location.href.includes("nova"));

  const isEditingEmenda =
    location.pathname.includes("/emendas/") &&
    (location.search.includes("editar") || location.search.includes("modo="));

  const isInFormMode = isCreatingEmenda || isEditingEmenda;

  // Obter nome de exibição
  const getDisplayName = (usuario) => {
    if (usuario?.nome && usuario.nome.trim()) return usuario.nome;
    if (usuario?.name && usuario.name.trim()) return usuario.name;
    if (usuario?.displayName && usuario.displayName.trim()) return usuario.displayName;
    if (usuario?.email) {
      const nameFromEmail = usuario.email.split("@")[0];
      return nameFromEmail
        .replace(/[._-]/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
    return "Usuário";
  };

  // Obter iniciais do nome
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Obter role formatada
  const getRoleLabel = () => {
    if (isSuperAdmin) return "Super Admin";
    if (isAdmin) return "Administrador";
    if (usuario?.tipo === "gestor") return "Gestor";
    return "Operador";
  };

  const handleSearchNavigate = (path) => {
    onNavigate(path);
  };

  const handleSearchResultSelect = (result) => {
    console.log("Resultado selecionado:", result);
  };

  // Navegação protegida para Emendas
  const handleEmendasClick = () => {
    if (isInFormMode) {
      const confirmMessage = isCreatingEmenda
        ? "Você está criando uma emenda. Deseja cancelar e voltar à listagem? Todas as alterações serão perdidas."
        : "Você está editando uma emenda. Deseja cancelar e voltar à listagem? Todas as alterações serão perdidas.";

      if (window.confirm(confirmMessage)) {
        onNavigate("/emendas");
      }
    } else {
      onNavigate("/emendas");
    }
  };

  const handleItemClick = (item) => {
    if (item.path === "/emendas") {
      handleEmendasClick();
    } else {
      onNavigate(item.path);
    }
  };

  const displayName = getDisplayName(usuario);
  const initials = getInitials(displayName);

  return (
    <aside style={styles.sidebar(collapsed)}>
      {/* Header com Logo */}
      <div style={styles.header}>
        <div
          style={styles.logoContainer}
          onClick={() => onNavigate("/dashboard")}
        >
          <img
            src={logoSicefsus}
            alt="SICEFSUS"
            style={collapsed ? styles.logoImageCollapsed : styles.logoImage}
          />
          {!collapsed && <span style={styles.logoText}>SICEFSUS</span>}
        </div>
        
        {/* Botão Toggle Sidebar */}
        <button
          style={{
            ...styles.toggleButton,
            ...(toggleHovered ? styles.toggleButtonHover : {}),
          }}
          onClick={handleToggle}
          onMouseEnter={() => setToggleHovered(true)}
          onMouseLeave={() => setToggleHovered(false)}
          title={collapsed ? "Expandir menu" : "Retrair menu"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Busca */}
      {!collapsed && (
        <div style={styles.searchContainer}>
          <GlobalSearch
            onNavigate={handleSearchNavigate}
            onResultSelect={handleSearchResultSelect}
            compact={true}
          />
        </div>
      )}

      {/* Painel de Informações Expansível - Apenas Super Admin */}
      {!collapsed && isSuperAdmin && (
        <div style={styles.infoPanel(infoExpanded)}>
          <div 
            style={styles.infoPanelHeader} 
            onClick={() => setInfoExpanded(!infoExpanded)}
          >
            <div style={styles.infoPanelTitle}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
              <span>Stack do Sistema</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {infoExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          
          {infoExpanded && (
            <div style={styles.infoPanelContent}>
              <div style={styles.techItem}>
                <span className="material-symbols-outlined" style={styles.techIcon}>code</span>
                <div>
                  <div style={styles.techLabel}>Frontend</div>
                  <div style={styles.techValue}>React + Vite</div>
                </div>
              </div>
              <div style={styles.techItem}>
                <span className="material-symbols-outlined" style={styles.techIcon}>storage</span>
                <div>
                  <div style={styles.techLabel}>Backend</div>
                  <div style={styles.techValue}>Firebase/Firestore</div>
                </div>
              </div>
              <div style={styles.techItem}>
                <span className="material-symbols-outlined" style={styles.techIcon}>cloud</span>
                <div>
                  <div style={styles.techLabel}>Hospedagem</div>
                  <div style={styles.techValue}>Replit</div>
                </div>
              </div>
              <div style={styles.techItem}>
                <span className="material-symbols-outlined" style={styles.techIcon}>router</span>
                <div>
                  <div style={styles.techLabel}>Roteamento</div>
                  <div style={styles.techValue}>React Router</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aviso de formulário ativo */}
      {isInFormMode && !collapsed && (
        <div style={styles.formWarning}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>warning</span>
          <span>Formulário ativo - confirme antes de navegar</span>
        </div>
      )}

      {/* Navegação Principal */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={activePath === item.path}
              collapsed={collapsed}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>

        {/* Admin Items */}
        {isAdmin && (
          <div style={styles.navSection}>
            {adminItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={activePath === item.path}
                collapsed={collapsed}
                onClick={() => onNavigate(item.path)}
              />
            ))}
          </div>
        )}

        {/* Logs - visivel para Admin e Gestor */}
        {(usuario?.tipo === "admin" || usuario?.tipo === "gestor") && (
          <NavItem
            item={{ label: "Logs", icon: "assignment", path: "/logs" }}
            isActive={activePath === "/logs"}
            collapsed={collapsed}
            onClick={() => onNavigate("/logs")}
          />
        )}

        {/* Ferramentas Dev - SuperAdmin */}
        {isSuperAdmin && (
          <NavItem
            item={{ label: "Ferramentas Dev", icon: "build", path: "/ferramentas-dev" }}
            isActive={activePath === "/ferramentas-dev"}
            collapsed={collapsed}
            onClick={() => onNavigate("/ferramentas-dev")}
            badge="DEV"
          />
        )}

        </nav>

      {/* Footer com Usuário */}
      <div style={styles.footer}>
        {/* Link "Sobre" discreto no topo do footer */}
        <div
          style={{
            ...styles.sobreLink,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "8px 0" : "8px 12px",
          }}
          onClick={() => onNavigate("/sobre")}
          title="Sobre o sistema"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: collapsed ? 0 : 8 }}>info</span>
          {!collapsed && <span>Sobre</span>}
        </div>

        <div style={styles.footerDivider} />

        <div style={styles.userSection}>
          <div style={styles.avatar}>
            {initials}
          </div>
          {!collapsed && (
            <div style={styles.userInfo}>
              <p style={styles.userName}>{displayName}</p>
              <p style={styles.userRole}>{getRoleLabel()}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              style={styles.logoutBtn}
              title="Sair"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={onLogout}
            style={styles.logoutBtnCollapsed}
            title="Sair"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          </button>
        )}

        {/* Indicador discreto: Ambiente + Versão */}
        <div style={styles.envIndicator(collapsed)}>
          <span style={{ ...styles.envBadge, backgroundColor: env.color }}>{env.label}</span>
          {!collapsed && <span style={styles.versionText}>v{version}</span>}
        </div>
      </div>
    </aside>
  );
}

// Componente de Item de Navegação
function NavItem({ item, isActive, collapsed, onClick, badge }) {
  const [hovered, setHovered] = useState(false);

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    padding: collapsed ? "10px 0" : "10px 12px",
    margin: collapsed ? "4px 8px" : "2px 12px",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: isActive ? "500" : "400",
    transition: "all 0.15s ease",
    justifyContent: collapsed ? "center" : "flex-start",
    backgroundColor: isActive
      ? "var(--theme-sidebar-item-active-bg)"
      : hovered
        ? "var(--theme-sidebar-item-hover-bg)"
        : "transparent",
    color: "var(--theme-text)",
    opacity: isActive ? 1 : hovered ? 1 : 0.85,
  };

  const iconStyle = {
    fontSize: isActive ? 22 : 20,
    marginRight: collapsed ? 0 : 12,
    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
  };

  return (
    <div
      style={itemStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? item.label : ""}
    >
      <span className="material-symbols-outlined" style={iconStyle}>
        {item.icon}
      </span>
      {!collapsed && (
        <span style={{ flex: 1 }}>{item.label}</span>
      )}
      {!collapsed && badge && (
        <span style={styles.badge}>{badge}</span>
      )}
    </div>
  );
}

// Estilos
const styles = {
  sidebar: (collapsed) => ({
    width: collapsed ? 80 : 256,
    flexShrink: 0,
    backgroundColor: "var(--theme-sidebar-bg, var(--theme-surface))",
    borderRight: "1px solid var(--theme-border)",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.3s ease, background-color 0.3s ease",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 100,
    fontFamily: "'Inter', sans-serif",
  }),

  header: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--theme-border-light)",
    padding: "0 16px",
    position: "relative",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    color: "var(--theme-text)",
  },

  toggleButton: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    border: "1px solid var(--theme-border)",
    borderRadius: "6px",
    cursor: "pointer",
    color: "var(--theme-text-secondary)",
    transition: "all 0.15s ease",
    flexShrink: 0,
  },

  toggleButtonHover: {
    backgroundColor: "var(--theme-sidebar-item-hover-bg)",
    border: "1px solid var(--primary)",
    color: "var(--primary)",
  },

  logoImage: {
    width: 36,
    height: 36,
    objectFit: "contain",
  },

  logoImageCollapsed: {
    width: 32,
    height: 32,
    objectFit: "contain",
  },

  logoText: {
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "-0.5px",
  },

  searchContainer: {
    padding: "16px 16px 8px",
  },

  infoPanel: (expanded) => ({
    margin: "8px 12px",
    backgroundColor: "var(--theme-surface-secondary)",
    border: "1px solid var(--theme-border)",
    borderRadius: "8px",
    overflow: "hidden",
    transition: "all 0.3s ease",
    boxShadow: expanded ? "var(--shadow-sm)" : "none",
  }),

  infoPanelHeader: {
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: "var(--theme-sidebar-item-hover-bg)",
    },
  },

  infoPanelTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--theme-text)",
  },

  infoPanelContent: {
    padding: "8px 12px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderTop: "1px solid var(--theme-border-light)",
    animation: "slideDown 0.3s ease",
  },

  techItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    backgroundColor: "var(--theme-bg)",
    borderRadius: "6px",
  },

  techIcon: {
    fontSize: 18,
    color: "var(--primary)",
    opacity: 0.8,
  },

  techLabel: {
    fontSize: "10px",
    fontWeight: 600,
    color: "var(--theme-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  techValue: {
    fontSize: "12px",
    fontWeight: 500,
    color: "var(--theme-text)",
  },

  formWarning: {
    margin: "8px 12px",
    padding: "10px 12px",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: "8px",
    fontSize: "11px",
    color: "var(--warning-dark)",
    display: "flex",
    alignItems: "center",
  },

  nav: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },

  navSection: {
    marginBottom: 8,
  },

  badge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: "var(--warning-dark)",
    fontSize: "9px",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },

  footer: {
    borderTop: "1px solid var(--theme-border)",
    padding: "12px 16px",
  },

  sobreLink: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "13px",
    color: "var(--theme-text-secondary)",
    transition: "all 0.15s ease",
    marginBottom: 8,
  },

  footerDivider: {
    height: 1,
    backgroundColor: "var(--theme-border-light)",
    margin: "8px 0",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--white)",
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
    boxShadow: "var(--shadow-sm)",
  },

  userInfo: {
    flex: 1,
    overflow: "hidden",
  },

  userName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--theme-text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  userRole: {
    margin: 0,
    fontSize: "12px",
    color: "var(--theme-text-secondary)",
  },

  logoutBtn: {
    background: "transparent",
    border: "none",
    padding: 8,
    cursor: "pointer",
    color: "var(--theme-text-muted)",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },

  logoutBtnCollapsed: {
    background: "transparent",
    border: "none",
    padding: 8,
    cursor: "pointer",
    color: "var(--theme-text-muted)",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    transition: "all 0.15s ease",
  },

  envIndicator: (collapsed) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid var(--theme-border-light)",
  }),

  envBadge: {
    fontSize: "9px",
    fontWeight: 700,
    color: "var(--white)",
    padding: "2px 5px",
    borderRadius: "3px",
    letterSpacing: "0.5px",
  },

  versionText: {
    fontSize: "10px",
    color: "var(--theme-text-muted)",
    fontFamily: "monospace",
  },
};
