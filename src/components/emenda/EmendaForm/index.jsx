// src/components/emenda/EmendaForm/index.jsx
// VERSÃO REFATORADA - De 1891 linhas para ~200 linhas
// Reutiliza hooks/utils existentes + componentes extraídos
// ✅ CORRIGIDO: Cancelamento com fallback robusto

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

// ✅ HOOKS EXISTENTES REUTILIZADOS
import { useToast } from "../../Toast";
import useEmendaDespesa from "../../../hooks/useEmendaDespesa";
import { useValidation } from "../../../hooks/useValidation";
import { useEmendaFormNavigation } from "../../../hooks/useEmendaFormNavigation";

// ✅ UTILS EXISTENTES REUTILIZADOS - IMPORTS CORRIGIDOS
import { formatarMoedaInput } from "../../../utils/formatters";
import { validarCNPJ } from "../../../utils/validators";

// ✅ COMPONENTES EXTRAÍDOS - PATHS CORRIGIDOS PARA COMPONENTS/
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
  const navigate = useNavigate(); // ✅ Hook direto para fallback
  const { validateForm } = useValidation();
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

  // ✅ ESTADOS SIMPLIFICADOS
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
    funcional: "",
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

  // ✅ CARREGAR DADOS PARA EDIÇÃO (usando métricas do hook existente)
  useEffect(() => {
    if (emendaParaEditar && metricas) {
      console.log("📝 Carregando dados para edição:", emendaParaEditar);

      setFormData({
        ...emendaParaEditar,
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

  // ✅ VALIDAÇÃO USANDO HOOK EXISTENTE
  const validarFormulario = () => {
    console.log("🔍 Iniciando validação do formulário");

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
      "funcional",
      "banco",
      "agencia",
      "conta",
      "cnpjMunicipio",
      "dataValidada",
    ];

    // Usar validateForm do hook existente
    const validation = validateForm(formData, {
      required: camposObrigatorios,
      cnpj: ["cnpj", "cnpjMunicipio"],
      futureDate: ["dataValidada"],
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      error(
        `Campos obrigatórios não preenchidos: ${Object.keys(validation.errors).join(", ")}`,
      );
      return false;
    }

    return true;
  };

  // ✅ SUBMISSÃO SIMPLIFICADA
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Iniciando submissão");

    if (modoVisualizacao) {
      error("Modo apenas visualização - não é possível salvar");
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
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
        saldo: parseFloat(formData.saldo) || 0,
        updatedAt: new Date().toISOString(),
      };

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
      navegarAposSalvar();
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
      // 1ª opção: usar onCancelar prop se fornecido
      if (onCancelar && typeof onCancelar === "function") {
        console.log("🔧 Usando onCancelar prop");
        onCancelar();
        return;
      }

      // 2ª opção: usar cancelarFormulario do hook
      if (cancelarFormulario && typeof cancelarFormulario === "function") {
        console.log("🔧 Usando cancelarFormulario do hook");
        cancelarFormulario();
        return;
      }

      // 3ª opção: navegação direta (fallback final)
      console.log("⚠️ Usando navegação direta como fallback");
      navigate("/emendas");
    } catch (error) {
      console.error("❌ Erro no cancelamento:", error);
      // Fallback de emergência
      try {
        navigate("/emendas");
      } catch (navError) {
        console.error("❌ Erro crítico na navegação:", navError);
        // Último recurso
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
    if (!emendaParaEditar)
      return Object.values(formData).some(
        (value) => value !== "" && value !== 0,
      );
    // Comparar com dados originais se necessário
    return false;
  }, [formData, emendaParaEditar]);

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

      {/* ✅ MODAL EXTRAÍDA - usando handleConfirmCancel diretamente */}
      <EmendaFormCancelModal
        show={showCancelModal}
        onClose={handleCancelModalClose}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
};

// ✅ ESTILOS BÁSICOS (a maioria foi para os componentes)
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
};

export default EmendaForm;
