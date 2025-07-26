import React, { useState } from "react";
import GlobalSearch from "./GlobalSearch";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const WHITE = "#fff";

const menuItems = [
  { label: "Dashboard", icon: "📊", path: "/dashboard" },
  { label: "Emendas", icon: "📄", path: "/emendas" },
  { label: "Despesas", icon: "💸", path: "/despesas" },
  { label: "Relatórios", icon: "📈", path: "/relatorios" },
  { label: "Sobre", icon: "ℹ️", path: "/sobre" },
];

const adminItems = [
  { label: "Usuários", icon: "👥", path: "/administracao" }, // Alterado de "Administração" para "Usuários"
];

export default function Sidebar({ onNavigate, activePath, usuario, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = usuario?.role === "admin";

  const handleSearchNavigate = (path) => {
    onNavigate(path);
  };

  const handleSearchResultSelect = (result) => {
    console.log("Resultado selecionado:", result);
  };

  // ✅ NAVEGAÇÃO INTELIGENTE PARA EMENDAS
  const handleEmendasClick = () => {
    // Verificar se existe função de navegação do formulário
    if (typeof window.sicefsusNavigateToEmendas === 'function') {
      try {
        // Usar a função exposta pelo EmendaForm (com verificação de mudanças)
        window.sicefsusNavigateToEmendas();
      } catch (error) {
        console.warn('Erro ao usar navegação do formulário:', error);
        onNavigate("/emendas");
      }
    } else {
      // Navegação direta se não houver formulário ativo
      onNavigate("/emendas");
    }
  };

  // ✅ NAVEGAÇÃO INTELIGENTE GENÉRICA
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
        background: PRIMARY,
        color: WHITE,
        minHeight: "100vh",
        transition: "width 0.2s",
        boxShadow: "2px 0 8px rgba(0,0,0,0.07)",
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
          <span style={{ fontWeight: "bold", fontSize: 20 }}>SICEFSUS</span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: "none",
            border: "none",
            color: WHITE,
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
            borderRadius: 4,
            transition: "background-color 0.2s",
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

      {/* Menu Principal */}
      <nav style={{ marginTop: collapsed ? 24 : 0, flex: 1 }}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => handleItemClick(item)} // ✅ Usando função inteligente
            style={{
              display: "flex",
              alignItems: "center",
              padding: collapsed ? "12px 0" : "12px 24px",
              cursor: "pointer",
              background: activePath === item.path ? ACCENT : "transparent",
              color: activePath === item.path ? WHITE : "#e3e3e3",
              fontWeight: activePath === item.path ? "bold" : "normal",
              fontSize: 16,
              transition: "all 0.2s",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onMouseOver={(e) => {
              if (activePath !== item.path) {
                e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
              }
            }}
            onMouseOut={(e) => {
              if (activePath !== item.path) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
            title={collapsed ? item.label : ""}
          >
            <span style={{ fontSize: 20, marginRight: collapsed ? 0 : 12 }}>
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
                background: activePath === item.path ? ACCENT : "transparent",
                color: activePath === item.path ? WHITE : "#e3e3e3",
                fontWeight: activePath === item.path ? "bold" : "normal",
                fontSize: 16,
                transition: "all 0.2s",
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
                }
              }}
              onMouseOut={(e) => {
                if (activePath !== item.path) {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
              title={collapsed ? item.label : ""}
            >
              <span style={{ fontSize: 20, marginRight: collapsed ? 0 : 12 }}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </div>
          ))}
      </nav>

      {/* Footer com informações do usuário */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: collapsed ? "12px 0" : "16px 20px",
          flexShrink: 0,
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
                color: WHITE,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {usuario.displayName || usuario.email}
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
                  background: usuario.role === "admin" ? "#27ae60" : "#4A90E2",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "2px 8px",
                  fontWeight: "bold",
                  fontSize: 10,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
                title={usuario.role === "admin" ? "Administrador" : "Operador"}
              >
                {usuario.role === "admin" ? "ADMIN" : "USER"}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#bbb",
                  opacity: 0.8,
                }}
              >
                Online
              </span>
            </div>
          </div>
        )}

        <ThemeToggle />

        <button
          onClick={onLogout}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: WHITE,
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: collapsed ? "8px" : "10px 16px",
            cursor: "pointer",
            width: "100%",
            fontSize: collapsed ? 16 : 14,
            fontWeight: "500",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: collapsed ? 0 : 8,
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(255,255,255,0.2)";
            e.target.style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.borderColor = "rgba(255,255,255,0.2)";
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