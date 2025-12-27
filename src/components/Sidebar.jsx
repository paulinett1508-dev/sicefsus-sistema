import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";

// Menu principal
const menuItems = [
  { label: "Dashboard", icon: "dashboard", path: "/dashboard" },
  { label: "Emendas", icon: "description", path: "/emendas" },
  { label: "Relatórios", icon: "analytics", path: "/relatorios" },
];

// Menu admin
const adminItems = [{ label: "Usuários", icon: "group", path: "/administracao" }];

// Menu de configurações
const configItems = [{ label: "Sistema", icon: "settings", path: "/sobre" }];

export default function Sidebar({ onNavigate, activePath, usuario, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
          <span className="material-symbols-outlined" style={styles.logoIcon}>
            token
          </span>
          {!collapsed && <span style={styles.logoText}>SICEFSUS</span>}
        </div>
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

        {/* Seção Configurações */}
        {isAdmin && (
          <div style={styles.configSection}>
            {!collapsed && (
              <div style={styles.sectionTitle}>Configurações</div>
            )}
            {configItems.map((item) => (
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
      </nav>

      {/* Footer com Usuário */}
      <div style={styles.footer}>
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
      ? "rgba(37, 99, 235, 0.08)"
      : hovered
        ? "rgba(241, 245, 249, 1)"
        : "transparent",
    color: isActive ? "#2563EB" : hovered ? "#2563EB" : "#64748B",
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
    backgroundColor: "#ffffff",
    borderRight: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.3s ease",
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
    justifyContent: "center",
    borderBottom: "1px solid #F1F5F9",
    padding: "0 16px",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    color: "#2563EB",
  },

  logoIcon: {
    fontSize: 32,
    fontVariationSettings: "'FILL' 0, 'wght' 400",
  },

  logoText: {
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "-0.5px",
  },

  searchContainer: {
    padding: "16px 16px 8px",
  },

  formWarning: {
    margin: "8px 12px",
    padding: "10px 12px",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: "8px",
    fontSize: "11px",
    color: "#B45309",
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

  configSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #F1F5F9",
  },

  sectionTitle: {
    padding: "0 24px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 8,
  },

  badge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: "#B45309",
    fontSize: "9px",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },

  footer: {
    borderTop: "1px solid #E2E8F0",
    padding: "16px",
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
    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
    boxShadow: "0 2px 4px rgba(99, 102, 241, 0.3)",
  },

  userInfo: {
    flex: 1,
    overflow: "hidden",
  },

  userName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 500,
    color: "#334155",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  userRole: {
    margin: 0,
    fontSize: "12px",
    color: "#64748B",
  },

  logoutBtn: {
    background: "transparent",
    border: "none",
    padding: 8,
    cursor: "pointer",
    color: "#94A3B8",
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
    color: "#94A3B8",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    transition: "all 0.15s ease",
  },
};
