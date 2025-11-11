import React, { useState } from "react";
import { useLocation } from "react-router-dom"; // ✅ ADICIONADO: Para detectar rota atual
import GlobalSearch from "./GlobalSearch";

const menuItems = [
  { label: "Dashboard", icon: "📊", path: "/dashboard" },
  { label: "Emendas", icon: "📄", path: "/emendas" },
  { label: "Relatórios", icon: "📈", path: "/relatorios" },
];

const adminItems = [{ label: "Usuários", icon: "👥", path: "/administracao" }];

const bottomItems = [{ label: "Sobre", icon: "ℹ️", path: "/sobre" }];

export default function Sidebar({ onNavigate, activePath, usuario, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation(); // ✅ ADICIONADO: Hook para detectar rota

  const isAdmin = usuario?.tipo === "admin";
  const isSuperAdmin = isAdmin && usuario?.superAdmin === true; // 👑 NOVO

  // ✅ ADICIONADO: Detectar se está em processo de criação/edição
  const isCreatingEmenda =
    location.pathname.includes("/emendas") &&
    (location.search.includes("nova") ||
      location.pathname.includes("nova") ||
      window.location.href.includes("nova"));

  const isEditingEmenda =
    location.pathname.includes("/emendas/") &&
    (location.search.includes("editar") || location.search.includes("modo="));

  const isInFormMode = isCreatingEmenda || isEditingEmenda;

  // ✅ FUNÇÃO PARA OBTER NOME DE EXIBIÇÃO CORRETO (mantida)
  const getDisplayName = (usuario) => {
    // Primeiro: tentar campo 'nome' (padrão do sistema)
    if (usuario?.nome && usuario.nome.trim()) {
      return usuario.nome;
    }

    // Segundo: tentar campo 'name' (alternativo)
    if (usuario?.name && usuario.name.trim()) {
      return usuario.name;
    }

    // Terceiro: tentar displayName do Firebase
    if (usuario?.displayName && usuario.displayName.trim()) {
      return usuario.displayName;
    }

    // Quarto: extrair nome do email
    if (usuario?.email) {
      const nameFromEmail = usuario.email.split("@")[0];
      // Capitalizar primeira letra e limpar caracteres especiais
      return nameFromEmail
        .replace(/[._-]/g, " ")
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
    }

    // Fallback final
    return "Usuário";
  };

  const handleSearchNavigate = (path) => {
    onNavigate(path);
  };

  const handleSearchResultSelect = (result) => {
    console.log("Resultado selecionado:", result);
  };

  // ✅ ALTERAÇÃO: Navegação protegida para Emendas
  const handleEmendasClick = () => {
    console.log(`🔍 Tentativa de navegação para Emendas:`, {
      currentPath: location.pathname,
      isInFormMode,
      isCreatingEmenda,
      isEditingEmenda,
    });

    // Se está no processo de criação/edição
    if (isInFormMode) {
      const confirmMessage = isCreatingEmenda
        ? "Você está criando uma emenda. Deseja cancelar e voltar à listagem? Todas as alterações serão perdidas."
        : "Você está editando uma emenda. Deseja cancelar e voltar à listagem? Todas as alterações serão perdidas.";

      if (window.confirm(confirmMessage)) {
        console.log("✅ Usuário confirmou navegação - saindo do formulário");
        onNavigate("/emendas");
      } else {
        console.log(
          "❌ Usuário cancelou navegação - permanecendo no formulário",
        );
      }
    } else {
      // Navegação normal
      console.log("✅ Navegação normal para Emendas");
      onNavigate("/emendas");
    }
  };

  // ✅ ALTERAÇÃO: Navegação inteligente genérica com proteção
  const handleItemClick = (item) => {
    if (item.path === "/emendas") {
      handleEmendasClick();
    } else {
      onNavigate(item.path);
    }
  };

  return (
    <div
      style={{
        width: collapsed ? 64 : 220,
        background: "var(--primary)",
        color: "var(--white)",
        minHeight: "100vh",
        transition:
          "width 0.2s ease, background-color 0.3s ease, color 0.3s ease",
        boxShadow: "2px 0 8px var(--theme-shadow)",
        position: "fixed",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <span
            onClick={() => onNavigate("/dashboard")}
            style={{
              fontWeight: "bold",
              fontSize: 20,
              color: "var(--white)",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.8")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
            title="Ir para Dashboard"
          >
            SICEFSUS
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: "none",
            border: "none",
            color: "var(--white)",
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
            borderRadius: 4,
            transition: "background-color 0.2s ease",
          }}
          title={collapsed ? "Expandir" : "Recolher"}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = "rgba(255,255,255,0.1)")
          }
          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Busca Global */}
      {!collapsed && (
        <div
          style={{
            padding: "16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <GlobalSearch
            onNavigate={handleSearchNavigate}
            onResultSelect={handleSearchResultSelect}
            compact={true}
          />
        </div>
      )}

      {/* ✅ ADICIONADO: Aviso de proteção se está em modo formulário */}
      {isInFormMode && !collapsed && (
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "rgba(255, 193, 7, 0.2)",
            borderLeft: "4px solid #ffc107",
            margin: "8px 12px",
            borderRadius: "4px",
            fontSize: "11px",
            lineHeight: "1.4",
            color: "#fff3cd",
          }}
        >
          ⚠️ <strong>Formulário ativo:</strong> Confirme antes de navegar para
          não perder alterações.
        </div>
      )}

      {/* Menu Principal */}
      <nav style={{ marginTop: collapsed ? 24 : 0, flex: 1 }}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => handleItemClick(item)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: collapsed ? "12px 0" : "12px 24px",
              cursor: "pointer",
              background:
                activePath === item.path ? "var(--accent)" : "transparent",
              color:
                activePath === item.path ? "var(--white)" : "var(--gray-200)",
              fontWeight: activePath === item.path ? "bold" : "normal",
              fontSize: 16,
              transition: "all 0.2s ease",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onMouseOver={(e) => {
              if (activePath !== item.path) {
                e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.target.style.color = "var(--white)";
              }
            }}
            onMouseOut={(e) => {
              if (activePath !== item.path) {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "var(--gray-200)";
              }
            }}
            title={collapsed ? item.label : ""}
          >
            <span
              style={{
                fontSize: 20,
                marginRight: collapsed ? 0 : 12,
                filter: activePath === item.path ? "brightness(1.2)" : "none",
              }}
            >
              {item.icon}
            </span>
            {!collapsed && item.label}
          </div>
        ))}

        {/* Menu Admin */}
        {isAdmin &&
          adminItems.map((item) => (
            <div
              key={item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: collapsed ? "12px 0" : "12px 24px",
                cursor: "pointer",
                background:
                  activePath === item.path ? "var(--accent)" : "transparent",
                color:
                  activePath === item.path ? "var(--white)" : "var(--gray-200)",
                fontWeight: activePath === item.path ? "bold" : "normal",
                fontSize: 16,
                transition: "all 0.2s ease",
                justifyContent: collapsed ? "center" : "flex-start",
                marginTop: 8,
                borderTop: collapsed
                  ? "none"
                  : "1px solid rgba(255,255,255,0.1)",
                paddingTop: collapsed ? 12 : 20,
              }}
              onMouseOver={(e) => {
                if (activePath !== item.path) {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.target.style.color = "var(--white)";
                }
              }}
              onMouseOut={(e) => {
                if (activePath !== item.path) {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "var(--gray-200)";
                }
              }}
              title={collapsed ? item.label : ""}
            >
              <span
                style={{
                  fontSize: 20,
                  marginRight: collapsed ? 0 : 12,
                  filter: activePath === item.path ? "brightness(1.2)" : "none",
                }}
              >
                {item.icon}
              </span>
              {!collapsed && item.label}
            </div>
          ))}

        {/* 👑 FERRAMENTAS DEV - APENAS SUPERADMIN */}
        {isSuperAdmin && (
          <div
            onClick={() => onNavigate("/ferramentas-dev")}
            style={{
              display: "flex",
              alignItems: "center",
              padding: collapsed ? "12px 0" : "12px 24px",
              cursor: "pointer",
              background:
                activePath === "/ferramentas-dev"
                  ? "var(--accent)"
                  : "transparent",
              color:
                activePath === "/ferramentas-dev"
                  ? "var(--white)"
                  : "var(--gray-200)",
              fontWeight: activePath === "/ferramentas-dev" ? "bold" : "normal",
              fontSize: 16,
              transition: "all 0.2s ease",
              justifyContent: collapsed ? "center" : "flex-start",
              marginTop: 4,
            }}
            onMouseOver={(e) => {
              if (activePath !== "/ferramentas-dev") {
                e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.target.style.color = "var(--white)";
              }
            }}
            onMouseOut={(e) => {
              if (activePath !== "/ferramentas-dev") {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "var(--gray-200)";
              }
            }}
            title={collapsed ? "Ferramentas Dev" : ""}
          >
            <span
              style={{
                fontSize: 20,
                marginRight: collapsed ? 0 : 12,
                filter:
                  activePath === "/ferramentas-dev"
                    ? "brightness(1.2)"
                    : "none",
              }}
            >
              🔧
            </span>
            {!collapsed && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flex: 1,
                }}
              >
                Ferramentas Dev
                <span
                  style={{
                    fontSize: 10,
                    backgroundColor: "#ffc107",
                    color: "#1a1a2e",
                    padding: "2px 6px",
                    borderRadius: 10,
                    fontWeight: "bold",
                    marginLeft: "auto",
                  }}
                >
                  👑
                </span>
              </span>
            )}
          </div>
        )}

        {/* Espaçador flexível */}
        <div style={{ flex: 1 }}></div>

        {/* Menu Inferior - Sobre */}
        {isAdmin &&
          bottomItems.map((item) => (
            <div
              key={item.path}
              onClick={() => handleItemClick(item)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: collapsed ? "12px 0" : "12px 24px",
                cursor: "pointer",
                background:
                  activePath === item.path ? "var(--accent)" : "transparent",
                color:
                  activePath === item.path ? "var(--white)" : "var(--gray-200)",
                fontWeight: activePath === item.path ? "bold" : "normal",
                fontSize: 16,
                transition: "all 0.2s ease",
                justifyContent: collapsed ? "center" : "flex-start",
                borderTop: collapsed
                  ? "none"
                  : "1px solid rgba(255,255,255,0.1)",
                marginBottom: 8,
              }}
              onMouseOver={(e) => {
                if (activePath !== item.path) {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.target.style.color = "var(--white)";
                }
              }}
              onMouseOut={(e) => {
                if (activePath !== item.path) {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "var(--gray-200)";
                }
              }}
              title={collapsed ? item.label : ""}
            >
              <span
                style={{
                  fontSize: 20,
                  marginRight: collapsed ? 0 : 12,
                  filter: activePath === item.path ? "brightness(1.2)" : "none",
                }}
              >
                {item.icon}
              </span>
              {!collapsed && item.label}
            </div>
          ))}
      </nav>

      {/* Footer com informações do usuário (mantido original) */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: collapsed ? "12px 0" : "16px 20px",
          flexShrink: 0,
          backgroundColor: "rgba(0,0,0,0.1)",
        }}
      >
        {!collapsed && usuario && (
          <div
            style={{
              marginBottom: 12,
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "var(--white)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {/* ✅ CORREÇÃO PRINCIPAL: Usar função que busca nome correto */}
              {getDisplayName(usuario)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "white",
                  backgroundColor: isAdmin 
                    ? "#dc3545" 
                    : usuario?.tipo === "gestor"
                    ? "#ffc107"
                    : "#28a745",
                  padding: "3px 8px",
                  borderRadius: "10px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  marginLeft: "8px",
                }}
                title={
                  isAdmin
                    ? "Administrador"
                    : usuario?.tipo === "gestor"
                    ? "Gestor"
                    : "Operador"
                }
              >
                {isAdmin ? "ADMIN" : usuario?.tipo === "gestor" ? "GESTOR" : "OPERADOR"}
              </span>
              {/* 👑 Badge SuperAdmin */}
              {isSuperAdmin && (
                <span
                  style={{
                    backgroundColor: "#ffc107",
                    color: "#1a1a2e",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontWeight: "bold",
                    fontSize: 9,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                  }}
                  title="Super Administrador"
                >
                  👑 SUPER
                </span>
              )}
              <span
                style={{
                  fontSize: 10,
                  color: "var(--success-light)",
                  opacity: 0.9,
                  fontWeight: 500,
                }}
              >
                • Online
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "var(--white)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: collapsed ? "8px" : "10px 16px",
            cursor: "pointer",
            width: "100%",
            fontSize: collapsed ? 16 : 14,
            fontWeight: "500",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: collapsed ? 0 : 8,
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(255,255,255,0.2)";
            e.target.style.borderColor = "rgba(255,255,255,0.4)";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.borderColor = "rgba(255,255,255,0.2)";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
          title={collapsed ? "Sair" : ""}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          {!collapsed && "Sair"}
        </button>
      </div>
    </div>
  );
}