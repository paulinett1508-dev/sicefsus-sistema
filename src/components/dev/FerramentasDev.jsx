
import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

// Importar abas
import RecalculoTab from "./tabs/RecalculoTab";
import DiagnosticoTab from "./tabs/DiagnosticoTab";
import LimpezaTab from "./tabs/LimpezaTab";
import BackupTab from "./tabs/BackupTab";
import DashboardTab from "./tabs/DashboardTab";
import UsuariosTab from "./tabs/UsuariosTab";
import ValidacaoTab from "./tabs/ValidacaoTab";
import AnalisesTab from "./tabs/AnalisesTab";
import GeografiaTab from "./tabs/GeografiaTab";
import ConfigTab from "./tabs/ConfigTab";

function FerramentasDev() {
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("recalculo");

  // Verificar se é SuperAdmin
  const isSuperAdmin =
    usuario?.tipo === "admin" && usuario?.superAdmin === true;

  // Redirecionar se não for SuperAdmin
  React.useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/dashboard");
    }
  }, [isSuperAdmin, navigate]);

  if (!isSuperAdmin) {
    return null;
  }

  // Definir abas
  const abas = [
    { id: "recalculo", icon: "🔄", label: "Recálculo", badge: null },
    { id: "diagnostico", icon: "🔍", label: "Diagnóstico", badge: null },
    { id: "limpeza", icon: "🧹", label: "Limpeza", badge: null },
    { id: "backup", icon: "📥", label: "Backup/Export", badge: null },
    { id: "dashboard", icon: "📊", label: "Dashboard", badge: "novo" },
    { id: "usuarios", icon: "👥", label: "Usuários", badge: null },
    { id: "validacao", icon: "✅", label: "Validação", badge: null },
    { id: "analises", icon: "📈", label: "Análises", badge: "novo" },
    { id: "geografia", icon: "🗺️", label: "Geografia", badge: "novo" },
    { id: "config", icon: "⚙️", label: "Configurações", badge: null },
  ];

  // Renderizar conteúdo da aba ativa
  const renderConteudo = () => {
    switch (abaAtiva) {
      case "recalculo":
        return <RecalculoTab />;
      case "diagnostico":
        return <DiagnosticoTab />;
      case "limpeza":
        return <LimpezaTab />;
      case "backup":
        return <BackupTab />;
      case "dashboard":
        return <DashboardTab />;
      case "usuarios":
        return <UsuariosTab />;
      case "validacao":
        return <ValidacaoTab />;
      case "analises":
        return <AnalisesTab />;
      case "geografia":
        return <GeografiaTab />;
      case "config":
        return <ConfigTab />;
      default:
        return <RecalculoTab />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitulo}>
          <h1 style={styles.h1}>
            <span style={styles.iconeFerramen}>👑</span>
            Ferramentas de Desenvolvedor
          </h1>
          <p style={styles.headerSubtitulo}>
            Acesso exclusivo SuperAdmin • Use com cautela
          </p>
        </div>

        <div style={styles.headerInfo}>
          <span style={styles.infoUsuario}>
            👤 {usuario?.nome || usuario?.email}
          </span>
          <span style={styles.badgeSuperadmin}>👑 SUPER</span>
        </div>
      </div>

      {/* Alerta de Segurança */}
      <div style={styles.alertaSeguranca}>
        <div style={styles.alertaIcone}>⚠️</div>
        <div style={styles.alertaConteudo}>
          <strong>ATENÇÃO:</strong> Estas ferramentas podem alterar dados
          críticos do sistema. Sempre faça backup antes de operações em massa.
        </div>
      </div>

      {/* Navegação por Abas */}
      <div style={styles.abasNavegacao}>
        {abas.map((aba) => (
          <button
            key={aba.id}
            style={{
              ...styles.abaBtn,
              ...(abaAtiva === aba.id ? styles.abaBtnAtiva : {}),
            }}
            onClick={() => setAbaAtiva(aba.id)}
            onMouseEnter={(e) => {
              if (abaAtiva !== aba.id) {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#d1d5da";
                e.currentTarget.style.color = "#24292e";
              }
            }}
            onMouseLeave={(e) => {
              if (abaAtiva !== aba.id) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.color = "#586069";
              }
            }}
          >
            <span style={styles.abaIcone}>{aba.icon}</span>
            <span style={styles.abaLabel}>{aba.label}</span>
            {aba.badge && <span style={styles.abaBadge}>{aba.badge}</span>}
          </button>
        ))}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div style={styles.conteudoAba}>{renderConteudo()}</div>

      {/* Footer com Informações */}
      <div style={styles.footer}>
        <div style={styles.footerInfo}>
          <span>🔒 Todas as ações são registradas em log</span>
          <span>•</span>
          <span>📅 {new Date().toLocaleDateString("pt-BR")}</span>
          <span>•</span>
          <span>v{import.meta.env.VITE_APP_VERSION || "2.3.70"}</span>
        </div>
      </div>
    </div>
  );
}

// ✅ ESTILOS 100% ISOLADOS (CSS-in-JS)
const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    background: "#ffffff",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    background: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #e1e4e8",
  },
  headerTitulo: {},
  h1: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#24292e",
    margin: "0 0 4px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  iconeFerramen: {
    fontSize: "24px",
  },
  headerSubtitulo: {
    fontSize: "13px",
    color: "#586069",
    margin: 0,
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  infoUsuario: {
    fontSize: "13px",
    color: "#586069",
  },
  badgeSuperadmin: {
    background: "#ffd33d",
    color: "#24292e",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  alertaSeguranca: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 16px",
    background: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "6px",
    marginBottom: "16px",
  },
  alertaIcone: {
    fontSize: "20px",
    lineHeight: 1,
  },
  alertaConteudo: {
    fontSize: "13px",
    color: "#856404",
    lineHeight: 1.5,
  },
  abasNavegacao: {
    display: "flex",
    gap: "4px",
    padding: "8px",
    background: "#f6f8fa",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #e1e4e8",
    overflowX: "auto",
  },
  abaBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#586069",
    cursor: "pointer",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
  },
  abaBtnAtiva: {
    background: "#ffffff",
    borderColor: "#0366d6",
    color: "#0366d6",
    boxShadow: "0 1px 3px rgba(3, 102, 214, 0.1)",
  },
  abaIcone: {
    fontSize: "16px",
    lineHeight: 1,
  },
  abaLabel: {
    fontSize: "13px",
  },
  abaBadge: {
    background: "#28a745",
    color: "white",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  conteudoAba: {
    background: "#ffffff",
    border: "1px solid #e1e4e8",
    borderRadius: "8px",
    padding: "24px",
    minHeight: "400px",
  },
  footer: {
    marginTop: "24px",
    padding: "16px",
    background: "#f6f8fa",
    borderRadius: "6px",
    border: "1px solid #e1e4e8",
  },
  footerInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    fontSize: "12px",
    color: "#586069",
  },
};

export default FerramentasDev;
