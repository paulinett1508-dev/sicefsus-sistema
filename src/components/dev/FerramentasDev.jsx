import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

// Importar abas
import DiagnosticoTab from "./tabs/DiagnosticoTab";
import ManutencaoTab from "./tabs/ManutencaoTab";
import BackupTab from "./tabs/BackupTab";
import UsuariosTab from "./tabs/UsuariosTab";
import ConfigTab from "./tabs/ConfigTab";
import IAMTab from "./tabs/IAMTab";
import AnalyticsTab from './tabs/AnalyticsTab'; // Importar aba Analytics

// CSS Module
import styles from "./FerramentasDev.module.css";

const FerramentasDev = () => {
  const { usuario: currentUser } = useUser(); // Renamed from 'usuario' to 'currentUser' for clarity
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState(null);

  // 🎯 Verificar se é SuperAdmin
  const isSuperAdmin = React.useMemo(() => {
    const result = currentUser?.tipo === "admin" && currentUser?.superAdmin === true;
    console.log("🛠️ FerramentasDev - SuperAdmin Check:", {
      tipo: currentUser?.tipo,
      superAdmin: currentUser?.superAdmin,
      isSuperAdmin: result
    });
    return result;
  }, [currentUser]);

  useEffect(() => {
    if (!isSuperAdmin) {
      console.log("🛠️ FerramentasDev - Not SuperAdmin, redirecting to dashboard.");
      navigate("/dashboard");
    } else {
      console.log("🛠️ FerramentasDev - SuperAdmin confirmed, proceeding.");
    }
  }, [isSuperAdmin, navigate]);

  if (!isSuperAdmin) {
    console.log("🛠️ FerramentasDev - Render null because not SuperAdmin.");
    return null;
  }

  // Abas disponíveis
  const abas = [
    {
      id: "diagnostico",
      icone: "troubleshoot",
      label: "Diagnóstico & Recálculo",
      componente: DiagnosticoTab,
    },
    {
      id: "manutencao",
      icone: "build",
      label: "Manutenção & Monitoramento",
      componente: ManutencaoTab
    },
    { id: "backup", icone: "backup", label: "Backup", componente: BackupTab },
    {
      id: "analytics",
      icone: "analytics",
      label: "Analytics",
      componente: AnalyticsTab,
    },
    { id: "usuarios", icone: "group", label: "Usuários", componente: UsuariosTab },
    {
      id: "iam",
      icone: "admin_panel_settings",
      label: "IAM",
      componente: IAMTab,
    },
    {
      id: "config",
      icone: "settings",
      label: "Configurações",
      componente: ConfigTab,
    },
    {
      id: "rules",
      icone: "description",
      label: "Firestore Rules",
      componente: () => {
        const FirestoreRulesSection = React.lazy(() => import("../admin/FirestoreRulesSection"));
        return (
          <React.Suspense fallback={<div>Carregando...</div>}>
            <FirestoreRulesSection />
          </React.Suspense>
        );
      },
    },
  ];

  const abaAtual = abas.find((aba) => aba.id === abaAtiva);
  const ComponenteAtivo = abaAtual?.componente;

  console.log("🛠️ FerramentasDev - Rendering component with active tab:", abaAtiva);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>build</span>
            Ferramentas de Desenvolvimento
          </h1>
          <span className={styles.badge}>
            <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>verified_user</span>
            SUPER
          </span>
        </div>
        <div className={styles.alertaBanner}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>warning</span>
          Área restrita para SuperAdministradores. Todas as ações são registradas.
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className={styles.tabsContainer}>
        {abas.map((aba) => (
          <button
            key={aba.id}
            className={`${styles.tabButton} ${abaAtiva === aba.id ? styles.tabButtonActive : ""}`}
            onClick={() => {
              setAbaAtiva(aba.id);
              console.log(`🛠️ FerramentasDev - Navigated to tab: ${aba.label} (${aba.id})`);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{aba.icone}</span>
            <span className={styles.tabLabel}>{aba.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className={styles.content}>
        {!abaAtiva ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, marginBottom: 16, opacity: 0.3, color: 'var(--theme-text-muted)' }}>build</span>
            <p style={{ fontSize: '15px', color: 'var(--theme-text-secondary)' }}>
              Selecione uma ferramenta acima para começar
            </p>
          </div>
        ) : ComponenteAtivo ? (
          <ComponenteAtivo />
        ) : (
          <div>Aba não encontrada</div>
        )}
      </div>
    </div>
  );
};

export default FerramentasDev;