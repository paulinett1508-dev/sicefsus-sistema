import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

// Importar abas
import RecalculoTab from "./tabs/RecalculoTab";
import DiagnosticoTab from "./tabs/DiagnosticoTab";
import LimpezaTab from "./tabs/LimpezaTab";
import BackupTab from "./tabs/BackupTab";
import UsuariosTab from "./tabs/UsuariosTab";
import ValidacaoTab from "./tabs/ValidacaoTab";
import AnalisesTab from "./tabs/AnalisesTab";
import ConfigTab from "./tabs/ConfigTab";

// CSS Module
import styles from "./FerramentasDev.module.css";

const FerramentasDev = () => {
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("recalculo");

  // Verificar se é SuperAdmin
  const isSuperAdmin =
    usuario?.tipo === "admin" && usuario?.superAdmin === true;

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/dashboard");
    }
  }, [isSuperAdmin, navigate]);

  if (!isSuperAdmin) {
    return null;
  }

  // Abas disponíveis (sem Dashboard e Geografia)
  const abas = [
    {
      id: "recalculo",
      icone: "🔄",
      label: "Recálculo",
      componente: RecalculoTab,
    },
    {
      id: "diagnostico",
      icone: "🔍",
      label: "Diagnóstico",
      componente: DiagnosticoTab,
    },
    { id: "limpeza", icone: "🧹", label: "Limpeza", componente: LimpezaTab },
    { id: "backup", icone: "📥", label: "Backup", componente: BackupTab },
    { id: "usuarios", icone: "👥", label: "Usuários", componente: UsuariosTab },
    {
      id: "validacao",
      icone: "✅",
      label: "Validação",
      componente: ValidacaoTab,
    },
    { id: "analises", icone: "📈", label: "Análises", componente: AnalisesTab },
    {
      id: "config",
      icone: "⚙️",
      label: "Configurações",
      componente: ConfigTab,
    },
  ];

  const abaAtual = abas.find((aba) => aba.id === abaAtiva);
  const ComponenteAtivo = abaAtual?.componente;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>🔧 Ferramentas de Desenvolvimento</h1>
          <span className={styles.badge}>👑 SUPER</span>
        </div>
        <div className={styles.alertaBanner}>
          ⚠️ Área restrita para SuperAdministradores. Todas as ações são
          registradas.
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className={styles.tabsContainer}>
        {abas.map((aba) => (
          <button
            key={aba.id}
            className={`${styles.tabButton} ${abaAtiva === aba.id ? styles.tabButtonActive : ""}`}
            onClick={() => setAbaAtiva(aba.id)}
          >
            <span className={styles.tabIcon}>{aba.icone}</span>
            <span className={styles.tabLabel}>{aba.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className={styles.content}>
        {ComponenteAtivo ? <ComponenteAtivo /> : <div>Aba não encontrada</div>}
      </div>
    </div>
  );
};

export default FerramentasDev;
