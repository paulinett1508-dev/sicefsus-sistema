// src/components/emenda/EmendaForm/index.jsx — ações sempre inline (remove sticky e lógica dinâmica)
// UI apenas; lógica preservada. A aba Execução continua renderizando ExecucaoOrcamentaria.

import React, { useState, useEffect, useContext } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useSearchParams, useParams, useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { UserContext } from "../../../context/UserContext";
import { useTheme } from "../../../context/ThemeContext";

import { useEmendaFormData } from "../../../hooks/useEmendaFormData";
import { useEmendaFormNavigation } from "../../../hooks/useEmendaFormNavigation";
import { hasPermission } from "../../../config/permissions"; // 🔒 Sistema de permissões

import TabNavigation from "./components/TabNavigation";
import DadosBasicosTab from "./sections/DadosBasicosTab";
import ExecucaoOrcamentaria from "./sections/ExecucaoOrcamentaria";
import EmendaFormHeaderRich from "./components/EmendaFormHeaderRich";
import EmendaFormActions from "./components/EmendaFormActions";
import EmendaFormCancelModal from "./components/EmendaFormCancelModal";
import LoadingOverlay from "../../LoadingOverlay";
import Toast from "../../Toast";

export default function EmendaForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dadosBasicos");
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const { isDark } = useTheme();

  // 🔒 Verificar permissões
  const userRole = user?.tipo || "operador";
  const podeCriarEmendas = hasPermission(userRole, "podeCriarEmendas");
  const podeEditarEmendas = hasPermission(userRole, "podeEditarEmendas");
  const isNovo = !id || id === "novo";

  // 🔒 Bloquear acesso não autorizado
  useEffect(() => {
    if (isNovo && !podeCriarEmendas) {
      console.warn("🔒 Acesso negado: usuário não tem permissão para criar emendas");
      navigate("/emendas", { replace: true });
    } else if (!isNovo && !podeEditarEmendas && !podeCriarEmendas) {
      // Se não pode criar nem editar, só pode visualizar (operador)
      // Operador pode visualizar emendas existentes
    }
  }, [isNovo, podeCriarEmendas, podeEditarEmendas, navigate]);

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    container: {
      padding: 16,
      backgroundColor: isDark ? "var(--theme-bg)" : "#f8f9fa",
    },
    form: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
      borderRadius: 8,
      padding: 24,
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.06)",
      border: isDark ? "1px solid var(--theme-border)" : "1px solid #e9ecef",
    },
    actionsInline: {
      marginTop: 16,
      paddingTop: 12,
      borderTop: isDark ? "1px solid var(--theme-border)" : "1px solid #e9ecef",
    },
    loadingContainer: {
      textAlign: "center",
      padding: "40px 20px",
      backgroundColor: isDark ? "var(--theme-surface)" : "white",
      borderRadius: 8,
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.06)",
      margin: "20px 0",
      color: isDark ? "var(--theme-text)" : "inherit",
    },
    spinner: {
      width: 50,
      height: 50,
      border: isDark ? "4px solid var(--theme-border)" : "4px solid #f3f3f3",
      borderTop: "4px solid #007bff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 20px",
    },
    errorContainer: {
      textAlign: "center",
      padding: "40px 20px",
      backgroundColor: isDark ? "var(--theme-surface)" : "white",
      borderRadius: 8,
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.06)",
      margin: "20px 0",
      color: isDark ? "var(--theme-text)" : "inherit",
    },
  };

  const {
    formData,
    loading,
    saving,
    error,
    setError,
    salvando,
    toast,
    setToast,
    fieldErrors,
    hasUnsavedChanges,
    isEdicao,
    handleInputChange,
    handleSubmit,
    clearFieldError,
  } = useEmendaFormData();

  const {
    showCancelModal,
    handleCancel,
    handleConfirmCancel,
    handleContinueEditing,
    handleSimpleBack,
  } = useEmendaFormNavigation(hasUnsavedChanges, isEdicao);

  // Detectar se veio do modal de criação de emenda com aba específica
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Limpar o state para não reabrir em navegações futuras
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Processa navegação via query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'despesas' || tabParam === 'execucao') {
      console.log("🔄 Ativando aba Execução via query param");
      setActiveTab('execucao');
      // Limpar query string da URL APÓS renderizar
      setTimeout(() => {
        const currentPath = window.location.pathname;
        window.history.replaceState({}, '', currentPath);
      }, 500); // Aumentei para 500ms para garantir renderização
    }
  }, [searchParams, id]); // Adicionei 'id' como dependência

  // Carrega despesas para o header
  const [despesas, setDespesas] = useState([]);
  useEffect(() => {
    const carregarDespesas = async () => {
      if (!isEdicao || !formData?.id) {
        setDespesas([]);
        return;
      }
      try {
        const qy = query(
          collection(db, "despesas"),
          where("emendaId", "==", formData.id),
        );
        const snap = await getDocs(qy);
        setDespesas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
        setDespesas([]);
      }
    };
    carregarDespesas();
  }, [isEdicao, formData?.id]);

  if (loading) {
    return (
      <div style={dynamicStyles.container}>
        <div style={dynamicStyles.loadingContainer}>
          <div style={dynamicStyles.spinner}></div>
          <h3>
            {isEdicao
              ? "Carregando dados da emenda..."
              : "Preparando formulário..."}
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={dynamicStyles.container}>
        <div style={dynamicStyles.errorContainer}>
          <div style={styles.errorIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#EF4444" }}>warning</span>
          </div>
          <h3>Erro no Formulário</h3>
          <p>{error}</p>
          <div style={styles.errorActions}>
            <button onClick={() => setError(null)} style={styles.retryButton}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4, verticalAlign: "middle" }}>refresh</span>
              Tentar Novamente
            </button>
            <button onClick={handleSimpleBack} style={styles.backButton}>
              ← Voltar para Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dadosBasicos", label: "Dados Básicos", icon: "description" },
    { id: "execucao", label: "Execução Orçamentária", icon: "payments" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dadosBasicos":
        console.log('🔍 EmendaForm renderizando DadosBasicosTab:', {
          hasHandleInputChange: typeof handleInputChange === 'function',
          hasFormData: !!formData,
          handleInputChangeName: handleInputChange?.name
        });

        return (
          <DadosBasicosTab
            formData={formData}
            onChange={handleInputChange}
            fieldErrors={fieldErrors}
            onClearError={clearFieldError}
          />
        );
      case "execucao":
        // ✅ GARANTIR que formData tenha o ID correto
        const formDataComId = {
          ...formData,
          id: id || formData?.id, // Priorizar ID da URL (edição)
          emendaId: id || formData?.id || formData?.emendaId
        };

        console.log('🔄 EmendaForm - Passando formData CORRIGIDO:', {
          idOriginal: formData?.id,
          idURL: id,
          emendaIdFinal: formDataComId.emendaId,
          numero: formDataComId.numero
        });

        return (
          <ExecucaoOrcamentaria
            formData={formDataComId}
            onChange={handleInputChange}
            fieldErrors={fieldErrors}
            onClearError={clearFieldError}
            usuario={user}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={dynamicStyles.container}>
      <EmendaFormHeaderRich
        modo={isEdicao ? "editar" : "criar"}
        formData={formData}
        activeTab={activeTab}
        despesas={despesas}
      />

      <form onSubmit={handleSubmit} style={dynamicStyles.form}>
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div style={styles.tabContent}>{renderTabContent()}</div>

        {/* AÇÕES: sempre inline, logo após o conteúdo */}
        <div style={dynamicStyles.actionsInline}>
          <EmendaFormActions
            modo={isEdicao ? "editar" : "criar"}
            onCancel={handleCancel}
            onSimpleBack={handleSimpleBack}
            onSubmit={handleSubmit}
            isEdit={isEdicao}
            salvando={salvando}
            loading={saving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </form>

      {showCancelModal && (
        <EmendaFormCancelModal
          show={showCancelModal}
          onClose={handleContinueEditing}
          onConfirm={handleConfirmCancel}
          onCancel={handleContinueEditing}
          hasUnsavedChanges={hasUnsavedChanges}
          isEdit={isEdicao}
        />
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />

      <LoadingOverlay
        show={salvando}
        message={
          isEdicao
            ? "Atualizando emenda parlamentar..."
            : "Cadastrando nova emenda parlamentar..."
        }
      />
    </div>
  );
}

// Estilos estáticos (cores dinâmicas estão em dynamicStyles dentro do componente)
const styles = {
  tabContent: { marginTop: 16 },
};

if (
  !document.querySelector('style[data-component="emenda-form-inline-actions"]')
) {
  const styleSheet = document.createElement("style");
  styleSheet.setAttribute("data-component", "emenda-form-inline-actions");
  styleSheet.textContent = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(styleSheet);
}