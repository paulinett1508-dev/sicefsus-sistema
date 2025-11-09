import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import styles from "./FerramentasDev.module.css";

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
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitulo}>
          <h1>
            <span className={styles.iconeFerramenta}>👑</span>
            Ferramentas de Desenvolvedor
          </h1>
          <p className={styles.headerSubtitulo}>
            Acesso exclusivo SuperAdmin • Use com cautela
          </p>
        </div>

        <div className={styles.headerInfo}>
          <span className={styles.infoUsuario}>
            👤 {usuario?.nome || usuario?.email}
          </span>
          <span className={styles.badgeSuperadmin}>👑 SUPER</span>
        </div>
      </div>

      {/* Alerta de Segurança */}
      <div className={styles.alertaSeguranca}>
        <div className={styles.alertaIcone}>⚠️</div>
        <div className={styles.alertaConteudo}>
          <strong>ATENÇÃO:</strong> Estas ferramentas podem alterar dados
          críticos do sistema. Sempre faça backup antes de operações em massa.
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className={styles.abasNavegacao}>
        {abas.map((aba) => (
          <button
            key={aba.id}
            className={`${styles.abaBtn} ${abaAtiva === aba.id ? styles.ativa : ""}`}
            onClick={() => setAbaAtiva(aba.id)}
          >
            <span className={styles.abaIcone}>{aba.icon}</span>
            <span className={styles.abaLabel}>{aba.label}</span>
            {aba.badge && <span className={styles.abaBadge}>{aba.badge}</span>}
          </button>
        ))}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className={styles.conteudoAba}>{renderConteudo()}</div>

      {/* Footer com Informações */}
      <div className={styles.footer}>
        <div className={styles.footerInfo}>
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

export default FerramentasDev;
