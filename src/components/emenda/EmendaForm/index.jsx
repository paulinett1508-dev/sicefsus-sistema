// src/components/emenda/EmendaForm/index.jsx - COM CARREGAMENTO DE DESPESAS
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

// ✅ HOOKS ESPECIALIZADOS
import { useEmendaFormData } from "../../../hooks/useEmendaFormData";
import { useEmendaFormNavigation } from "../../../hooks/useEmendaFormNavigation";

// ✅ SEÇÕES MODULARES
import Identificacao from "./sections/Identificacao";
import DadosBasicos from "./sections/DadosBasicos";
import DadosBancarios from "./sections/DadosBancarios";
import Cronograma from "./sections/Cronograma";
import AcoesServicos from "./sections/AcoesServicos";
import InformacoesComplementares from "./sections/InformacoesComplementares";

// ✅ COMPONENTES AUXILIARES
import EmendaFormHeader from "./components/EmendaFormHeader";
import EmendaFormActions from "./components/EmendaFormActions";
import EmendaFormCancelModal from "./components/EmendaFormCancelModal";
import LoadingOverlay from "../../LoadingOverlay";
import Toast from "../../Toast";

const EmendaForm = () => {
  // 🎣 HOOK PRINCIPAL: Estado e lógica do formulário
  const {
    // Estados
    formData,
    loading,
    saving,
    error,
    setError,
    isReady,
    salvando,
    toast,
    setToast,
    fieldErrors,
    expandedSections,
    hasUnsavedChanges,
    isEdicao,

    // Handlers
    handleInputChange,
    handleSubmit,
    toggleSection,
    buscarDadosFornecedor,
    clearFieldError,
  } = useEmendaFormData();

  // 🎣 HOOK DE NAVEGAÇÃO: Modal de cancelamento e navegação
  const {
    showCancelModal,
    setShowCancelModal,
    handleCancel,
    handleConfirmCancel,
    handleContinueEditing,
    handleSimpleBack,
  } = useEmendaFormNavigation(hasUnsavedChanges, isEdicao);

  // 💰 NOVO: Estado para despesas da emenda
  const [despesas, setDespesas] = useState([]);
  const [loadingDespesas, setLoadingDespesas] = useState(false);

  // 💰 NOVO: Carregar despesas quando estiver editando uma emenda
  useEffect(() => {
    const carregarDespesas = async () => {
      // Só carregar se estiver editando e tiver ID da emenda
      if (!isEdicao || !formData.id) {
        setDespesas([]);
        return;
      }

      try {
        setLoadingDespesas(true);
        console.log("💰 Carregando despesas da emenda:", formData.id);

        const despesasRef = collection(db, "despesas");
        const q = query(despesasRef, where("emendaId", "==", formData.id));
        const snapshot = await getDocs(q);

        const despesasData = [];
        snapshot.forEach((doc) => {
          despesasData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        console.log(`✅ ${despesasData.length} despesas carregadas`);
        setDespesas(despesasData);
      } catch (error) {
        console.error("❌ Erro ao carregar despesas:", error);
        // Não mostrar erro crítico, apenas log
        setDespesas([]);
      } finally {
        setLoadingDespesas(false);
      }
    };

    carregarDespesas();
  }, [isEdicao, formData.id]);

  // 📄 RENDERIZAÇÃO CONDICIONAL: Loading
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3>
            {isEdicao
              ? "Carregando dados da emenda..."
              : "Preparando formulário..."}
          </h3>
        </div>
      </div>
    );
  }

  // 📄 RENDERIZAÇÃO CONDICIONAL: Erro
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3>Erro no Formulário</h3>
          <p>{error}</p>
          <div style={styles.errorActions}>
            <button onClick={() => setError(null)} style={styles.retryButton}>
              🔄 Tentar Novamente
            </button>
            <button onClick={handleSimpleBack} style={styles.backButton}>
              ← Voltar para Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 RENDERIZAÇÃO PRINCIPAL: Formulário funcional
  return (
    <div style={styles.container}>
      {/* 📋 HEADER DO FORMULÁRIO */}
      <EmendaFormHeader
        modo={isEdicao ? "editar" : "criar"}
        emendaId={isEdicao ? formData.numero : null}
        parlamentar={formData.autor}
      />

      {/* 📝 FORMULÁRIO PRINCIPAL */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ SEÇÃO: Identificação */}
        <Identificacao
          formData={formData}
          onChange={handleInputChange}
          fieldErrors={fieldErrors}
          onClearError={clearFieldError}
        />

        {/* ✅ SEÇÃO: Dados Básicos */}
        <DadosBasicos
          formData={formData}
          onChange={handleInputChange}
          fieldErrors={fieldErrors}
          onClearError={clearFieldError}
        />

        {/* ✅ SEÇÃO: Dados Bancários */}
        <DadosBancarios
          formData={formData}
          onChange={handleInputChange}
          fieldErrors={fieldErrors}
          onClearError={clearFieldError}
        />

        {/* ✅ SEÇÃO: Cronograma */}
        <Cronograma
          formData={formData}
          onChange={handleInputChange}
          fieldErrors={fieldErrors}
          onClearError={clearFieldError}
        />

        {/* ✅ SEÇÃO: Ações e Serviços - AGORA COM DESPESAS */}
        <AcoesServicos
          formData={formData}
          onChange={handleInputChange}
          fieldErrors={fieldErrors}
          onClearError={clearFieldError}
          despesas={despesas}
          loadingDespesas={loadingDespesas}
        />

        {/* ✅ SEÇÃO: Informações Complementares */}
        <InformacoesComplementares
          formData={formData}
          onChange={handleInputChange}
          fieldErrors={fieldErrors}
          onClearError={clearFieldError}
        />

        {/* 🎛️ AÇÕES DO FORMULÁRIO */}
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
      </form>

      {/* 🔒 MODAL DE CANCELAMENTO */}
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

      {/* 📢 TOAST DE FEEDBACK */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />

      {/* ⏳ LOADING OVERLAY */}
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
};

// 🎨 ESTILOS PRESERVADOS
const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  form: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e9ecef",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    margin: "20px 0",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    margin: "20px 0",
  },
  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  errorActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  retryButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  backButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
};

// 🎭 ANIMAÇÃO CSS PRESERVADA
if (
  !document.querySelector(
    'style[data-component="emenda-form-refactored-dates"]',
  )
) {
  const styleSheet = document.createElement("style");
  styleSheet.setAttribute("data-component", "emenda-form-refactored-dates");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default EmendaForm;
