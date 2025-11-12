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
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔧</div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
              Ferramentas de Desenvolvimento
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', marginBottom: '32px' }}>
              Selecione uma das ferramentas acima para começar. Estas ferramentas permitem realizar diagnósticos, 
              recálculos, backups e outras operações avançadas no sistema.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              maxWidth: '800px',
              width: '100%'
            }}>
              {abas.slice(0, 6).map((aba) => (
                <div
                  key={aba.id}
                  style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setAbaAtiva(aba.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eff6ff';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{aba.icone}</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>{aba.label}</div>
                </div>
              ))}
            </div>
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