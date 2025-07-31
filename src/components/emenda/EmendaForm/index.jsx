// src/components/emenda/EmendaForm/index.jsx - FIX VALIDAÇÃO
// ✅ CORREÇÃO: Erros no console + validação sem schema inválido

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

// ✅ HOOKS EXISTENTES REUTILIZADOS
import { useToast } from "../../Toast";
import useEmendaDespesa from "../../../hooks/useEmendaDespesa";
import { useEmendaFormNavigation } from "../../../hooks/useEmendaFormNavigation";

// ✅ UTILS EXISTENTES REUTILIZADOS
import { formatarMoedaInput } from "../../../utils/formatters";
import { validarCNPJ } from "../../../utils/validators";

// ✅ COMPONENTES EXTRAÍDOS
import EmendaFormHeader from "./components/EmendaFormHeader";
import EmendaFormActions from "./components/EmendaFormActions";
import EmendaFormCancelModal from "./components/EmendaFormCancelModal";
import DadosBasicos from "./sections/DadosBasicos";
import Identificacao from "./sections/Identificacao";
import DadosBeneficiario from "./sections/DadosBeneficiario";
import DadosBancarios from "./sections/DadosBancarios";
import ClassificacaoTecnica from "./sections/ClassificacaoTecnica";
import AcoesServicos from "./sections/AcoesServicos";
import Cronograma from "./sections/Cronograma";

const EmendaForm = ({
  usuario,
  emendaParaEditar,
  onCancelar,
  onSalvar,
  modoVisualizacao = false,
  defaultMunicipio = null,
  defaultUf = null,
}) => {
  // ✅ HOOKS REUTILIZADOS
  const { success, error } = useToast();
  const navigate = useNavigate();
  const { navegarAposSalvar, cancelarFormulario } = useEmendaFormNavigation();

  // ✅ HOOK EXISTENTE PARA MÉTRICAS
  const {
    metricas,
    loading: hookLoading,
    error: hookError,
  } = useEmendaDespesa(usuario, {
    emendaId: emendaParaEditar?.id,
    incluirEstatisticas: true,
    autoRefresh: false,
  });

  // ✅ ESTADOS SIMPLIFICADOS - FUNCIONAL SEMPRE VAZIO
  const [formData, setFormData] = useState({
    parlamentar: "",
    numeroEmenda: "",
    municipio: defaultMunicipio || "",
    uf: defaultUf || "",
    valorRecurso: "",
    objetoProposta: "",
    programa: "",
    cnpj: "",
    numeroProposta: "",
    funcional: "", // ✅ SEMPRE VAZIO POR PADRÃO
    banco: "",
    agencia: "",
    conta: "",
    tipo: "Individual",
    cnpjMunicipio: "",
    outrosValores: "",
    valorExecutado: 0,
    saldo: "",
    dataValidada: "",
    dataOb: "",
    inicioExecucao: "",
    finalExecucao: "",
    acoesServicos: [],
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ✅ FUNÇÃO LOCAL PARA FORMATAÇÃO DE MOEDA
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ CONFIGURAÇÃO DE MODO SIMPLIFICADA
  const configModo = useMemo(() => {
    if (modoVisualizacao) return { modo: "visualizar", readOnly: true };
    if (emendaParaEditar) return { modo: "editar", readOnly: false };
    return { modo: "criar", readOnly: false };
  }, [modoVisualizacao, emendaParaEditar]);

  // ✅ CARREGAR DADOS PARA EDIÇÃO - PRESERVANDO FUNCIONAL VAZIO
  useEffect(() => {
    if (emendaParaEditar && metricas) {
      console.log("📝 Carregando dados para edição:", emendaParaEditar);

      setFormData({
        ...emendaParaEditar,
        // ✅ FIX: Funcional sempre vazio se não existir
        funcional: emendaParaEditar.funcional || "",
        valorRecurso: formatarMoedaInput(emendaParaEditar.valorRecurso),
        outrosValores: formatarMoedaInput(emendaParaEditar.outrosValores),
        valorExecutado: metricas.valorExecutado || 0,
        saldo: formatarMoedaInput(
          metricas.saldoDisponivel || emendaParaEditar.saldo,
        ),
        acoesServicos: emendaParaEditar.acoesServicos || [],
      });
    }
  }, [emendaParaEditar, metricas]);

  // ✅ HANDLER DE MUDANÇA SIMPLIFICADO
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Limpar erros visuais ao digitar
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ FIX: Validação SEM useValidation hook (elimina erro do console)
  const validarFormulario = () => {
    console.log("🔍 Iniciando validação do formulário");

    // ✅ VERIFICAÇÃO robusta de formData
    if (!formData || typeof formData !== "object") {
      console.error("❌ formData inválido:", formData);
      error("Dados do formulário inválidos");
      return false;
    }

    // ✅ CAMPOS OBRIGATÓRIOS attualizados
    const camposObrigatorios = [
      "parlamentar",
      "numeroEmenda",
      "municipio",
      "uf",
      "valorRecurso",
      "objetoProposta",
      "programa",
      "cnpj",
      "numeroProposta",
      "funcional", // ✅ Obrigatório mas deve começar vazio
      "banco",
      "agencia",
      "conta",
      "cnpjMunicipio",
      "dataValidada",
    ];

    const novosErrors = {};
    let isValid = true;

    // ✅ VALIDAÇÃO manual robusta
    camposObrigatorios.forEach((campo) => {
      const valor = formData[campo];
      if (!valor || (typeof valor === "string" && !valor.trim())) {
        novosErrors[campo] = true; // Apenas marcar como erro
        isValid = false;
        console.log(`❌ Campo obrigatório vazio: ${campo}`);
      }
    });

    // ✅ VALIDAÇÕES específicas
    if (formData.cnpj && !validarCNPJ(formData.cnpj)) {
      novosErrors.cnpj = true;
      isValid = false;
      console.log("❌ CNPJ beneficiário inválido");
    }

    if (formData.cnpjMunicipio && !validarCNPJ(formData.cnpjMunicipio)) {
      novosErrors.cnpjMunicipio = true;
      isValid = false;
      console.log("❌ CNPJ município inválido");
    }

    // ✅ VALIDAÇÃO de valor do recurso
    if (formData.valorRecurso) {
      const valorNumerico = parseFloat(
        formData.valorRecurso.replace(/[^\d,]/g, "").replace(",", "."),
      );
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        novosErrors.valorRecurso = true;
        isValid = false;
        console.log("❌ Valor do recurso inválido");
      }
    }

    // ✅ VALIDAÇÃO de datas no cronograma
    if (formData.dataValidada) {
      const dataValidade = new Date(formData.dataValidada);

      // Verificar se data final não excede validade
      if (formData.finalExecucao) {
        const dataFinal = new Date(formData.finalExecucao);
        if (dataFinal > dataValidade) {
          novosErrors.finalExecucao = true;
          isValid = false;
          console.log("❌ Data final excede validade da emenda");
        }
      }

      // Verificar se data início não excede validade
      if (formData.inicioExecucao) {
        const dataInicio = new Date(formData.inicioExecucao);
        if (dataInicio > dataValidade) {
          novosErrors.inicioExecucao = true;
          isValid = false;
          console.log("❌ Data início excede validade da emenda");
        }
      }
    }

    // ✅ RESULTADO da validação
    if (!isValid) {
      setFieldErrors(novosErrors);
      const camposComErro = Object.keys(novosErrors);
      error(`Corrija os seguintes campos: ${camposComErro.join(", ")}`);
      console.log("❌ Validação falhou:", camposComErro);
      return false;
    }

    setFieldErrors({});
    console.log("✅ Validação passou");
    return true;
  };

  // ✅ FIX: handleSubmit sem erros
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Iniciando submissão");

    if (modoVisualizacao) {
      error("Modo apenas visualização - não é possível salvar");
      return;
    }

    // ✅ VALIDAÇÃO robusta
    try {
      if (!validarFormulario()) {
        console.log("❌ Validação falhou - parando submissão");
        return;
      }
    } catch (validationError) {
      console.error("❌ Erro na validação:", validationError);
      error("Erro interno de validação. Tente novamente.");
      return;
    }

    setLoading(true);

    try {
      // ✅ DADOS para salvar
      const dadosParaSalvar = {
        ...formData,
        valorRecurso:
          parseFloat(
            formData.valorRecurso?.replace(/[^\d,]/g, "").replace(",", "."),
          ) || 0,
        outrosValores:
          parseFloat(
            formData.outrosValores?.replace(/[^\d,]/g, "").replace(",", "."),
          ) || 0,
        valorExecutado:
          emendaParaEditar && metricas ? metricas.valorExecutado : 0,
        saldo:
          parseFloat(
            formData.saldo?.replace(/[^\d,]/g, "").replace(",", "."),
          ) || 0,
        updatedAt: new Date().toISOString(),
      };

      console.log("💾 Dados para salvar:", dadosParaSalvar);

      if (emendaParaEditar) {
        await updateDoc(
          doc(db, "emendas", emendaParaEditar.id),
          dadosParaSalvar,
        );
        success("Emenda atualizada com sucesso!");
      } else {
        const timestamp = Date.now();
        const emendaId = `emenda_${timestamp}`;

        const novaEmenda = {
          ...dadosParaSalvar,
          id: emendaId,
          numero: formData.numeroEmenda || `EMD${String(timestamp).slice(-6)}`,
          createdAt: new Date().toISOString(),
          status: "ativa",
        };

        await setDoc(doc(db, "emendas", emendaId), novaEmenda);
        success("Emenda criada com sucesso!");
      }

      setShowSuccessMessage(true);

      // Callback para o componente pai se fornecido
      if (onSalvar && typeof onSalvar === "function") {
        onSalvar(dadosParaSalvar);
      } else {
        navegarAposSalvar();
      }
    } catch (err) {
      console.error("❌ Erro ao salvar emenda:", err);
      error(`Erro ao salvar emenda: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLERS DE MODAL
  const handleCancelClick = () => {
    console.log("🖱️ handleCancelClick - abrindo modal");
    setShowCancelModal(true);
  };

  // ✅ CORRIGIDO: handleConfirmCancel com fallbacks robustos
  const handleConfirmCancel = () => {
    console.log("✅ handleConfirmCancel - confirmando cancelamento");
    setShowCancelModal(false);

    try {
      if (onCancelar && typeof onCancelar === "function") {
        console.log("🔧 Usando onCancelar prop");
        onCancelar();
        return;
      }

      if (cancelarFormulario && typeof cancelarFormulario === "function") {
        console.log("🔧 Usando cancelarFormulario do hook");
        cancelarFormulario();
        return;
      }

      console.log("⚠️ Usando navegação direta como fallback");
      navigate("/emendas");
    } catch (error) {
      console.error("❌ Erro no cancelamento:", error);
      try {
        navigate("/emendas");
      } catch (navError) {
        console.error("❌ Erro crítico na navegação:", navError);
        window.location.href = "/emendas";
      }
    }
  };

  const handleCancelModalClose = () => {
    console.log("❌ handleCancelModalClose - fechando modal sem cancelar");
    setShowCancelModal(false);
  };

  // ✅ VERIFICAR SE HÁ ALTERAÇÕES NÃO SALVAS
  const hasUnsavedChanges = useMemo(() => {
    if (!emendaParaEditar) {
      return Object.values(formData).some(
        (value) =>
          value !== "" && value !== 0 && value !== null && value !== undefined,
      );
    }
    return false;
  }, [formData, emendaParaEditar]);

  // ✅ LOADING STATE
  if (hookLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Carregando dados da emenda...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ✅ HEADER EXTRAÍDO */}
      <EmendaFormHeader
        modo={configModo.modo}
        emendaId={emendaParaEditar?.id}
        parlamentar={formData.parlamentar}
        showSuccessMessage={showSuccessMessage}
      />

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ TODAS AS SEÇÕES EXTRAÍDAS */}
        <DadosBasicos
          formData={formData}
          onChange={handleInputChange}
          disabled={modoVisualizacao}
          fieldErrors={fieldErrors}
        />

        <Identificacao
          formData={formData}
          onChange={handleInputChange}
          disabled={modoVisualizacao}
          fieldErrors={fieldErrors}
          metricas={metricas}
          emendaParaEditar={emendaParaEditar}
        />

        <DadosBeneficiario
          formData={formData}
          onChange={handleInputChange}
          disabled={modoVisualizacao}
          fieldErrors={fieldErrors}
        />

        <Cronograma
          formData={formData}
          onChange={handleInputChange}
          disabled={modoVisualizacao}
          fieldErrors={fieldErrors}
        />

        <DadosBancarios
          formData={formData}
          onChange={handleInputChange}
          disabled={modoVisualizacao}
          fieldErrors={fieldErrors}
        />

        <ClassificacaoTecnica
          formData={formData}
          onChange={handleInputChange}
          disabled={modoVisualizacao}
          fieldErrors={fieldErrors}
        />

        <AcoesServicos
          formData={formData}
          onChange={handleInputChange}
          disabled={modoVisualizacao}
          fieldErrors={fieldErrors}
        />

        {/* ✅ AÇÕES EXTRAÍDAS */}
        <EmendaFormActions
          modo={configModo.modo}
          loading={loading}
          modoVisualizacao={modoVisualizacao}
          onSubmit={handleSubmit}
          onCancel={handleCancelClick}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </form>

      {/* ✅ MODAL EXTRAÍDA */}
      <EmendaFormCancelModal
        show={showCancelModal}
        onConfirm={handleConfirmCancel}
        onClose={handleCancelModalClose}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
};

// ✅ ESTILOS BÁSICOS
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "20px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #154360",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// ✅ KEYFRAMES PARA SPINNER
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.querySelector('style[data-component="emenda-form"]')) {
  styleSheet.setAttribute("data-component", "emenda-form");
  document.head.appendChild(styleSheet);
}

export default EmendaForm;
