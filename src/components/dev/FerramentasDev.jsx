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
      icone: "🔍",
      label: "Diagnóstico & Recálculo",
      componente: DiagnosticoTab,
    },
    { 
      id: "manutencao", 
      icone: "🔧", 
      label: "Manutenção", 
      componente: ManutencaoTab 
    },
    { id: "backup", icone: "📥", label: "Backup", componente: BackupTab },
    { id: "usuarios", icone: "👥", label: "Usuários", componente: UsuariosTab },
    {
      id: "iam",
      icone: "🔐",
      label: "IAM",
      componente: IAMTab,
    },
    {
      id: "config",
      icone: "⚙️",
      label: "Configurações",
      componente: ConfigTab,
    },
    {
      id: "rules",
      icone: "📜",
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
    {
      id: "migracao",
      icone: "🔄",
      label: "Migração",
      componente: () => {
        const MigracaoCompleta = React.lazy(() => import("../admin/MigracaoCompleta"));
        return (
          <React.Suspense fallback={<div>Carregando...</div>}>
            <MigracaoCompleta />
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
            onClick={() => {
              setAbaAtiva(aba.id);
              console.log(`🛠️ FerramentasDev - Navigated to tab: ${aba.label} (${aba.id})`);
            }}
          >
            <span className={styles.tabIcon}>{aba.icone}</span>
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
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>🔧</div>
            <p style={{ fontSize: '15px', color: '#94a3b8' }}>
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