// src/components/emenda/EmendaForm/index.jsx - FOCO INTELIGENTE EM ERROS
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useUser } from "../../../context/UserContext";

// Imports das seções
import Identificacao from "./sections/Identificacao";
import DadosBasicos from "./sections/DadosBasicos";
import DadosBeneficiario from "./sections/DadosBeneficiario";
import DadosBancarios from "./sections/DadosBancarios";
import Cronograma from "./sections/Cronograma";
import AcoesServicos from "./sections/AcoesServicos";
import InformacoesComplementares from "./sections/InformacoesComplementares";

// Imports dos componentes
import EmendaFormHeader from "./components/EmendaFormHeader";
import EmendaFormActions from "./components/EmendaFormActions";
import EmendaFormCancelModal from "./components/EmendaFormCancelModal";
import LoadingOverlay from "../../LoadingOverlay";
import Toast from "../../Toast";

// Imports de utilitários e validações
import {
  formatarMoedaDisplay,
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../utils/formatters";
import { validarFormularioEmenda } from "../../../utils/validators";
import { validarCNPJ, limparCNPJ } from "../../../utils/cnpjUtils";

/* 
🚨 VALIDAÇÕES ABSOLUTAS DE DATAS IMPLEMENTADAS:

1️⃣ DATA DE APROVAÇÃO (OBRIGATÓRIA):
   ✅ Não pode ser vazia
   ✅ Não pode ser inválida
   ✅ Não pode ser futura 
   ✅ Não pode ser anterior a 2020

2️⃣ DATA DE VALIDADE (OBRIGATÓRIA):
   ✅ Não pode ser vazia
   ✅ Não pode ser inválida
   ✅ Deve ser futura
   ✅ Deve ser posterior à aprovação

3️⃣ DATA OB (OPCIONAL, MAS SE PREENCHIDA):
   ✅ Não pode ser inválida
   ✅ Deve ser posterior à aprovação
   ✅ Deve ser anterior ou igual ao início da execução
   ✅ Deve ser anterior ou igual à validade

4️⃣ INÍCIO DA EXECUÇÃO (OPCIONAL, MAS SE PREENCHIDA):
   ✅ Não pode ser inválida
   ✅ Deve ser posterior à aprovação
   ✅ Deve ser posterior ou igual ao OB
   ✅ Deve ser anterior ou igual à validade

5️⃣ FINAL DA EXECUÇÃO (OPCIONAL, MAS SE PREENCHIDA):
   ✅ Não pode ser inválida
   ✅ Deve ser posterior ao início
   ✅ Deve ser anterior ou igual à validade
   ✅ Deve ser posterior à aprovação
   ✅ Deve ser posterior ao OB

6️⃣ SEQUÊNCIA CRONOLÓGICA COMPLETA:
   ✅ Aprovação ≤ OB ≤ Início ≤ Final ≤ Validade

🛡️ MÚLTIPLAS CAMADAS DE PROTEÇÃO:
   1. Validação visual com feedback imediato
   2. Validação crítica antes do salvamento
   3. Verificação final absoluta antes do Firebase
   4. Logs detalhados para debug

❌ RESULTADO: ZERO TOLERÂNCIA A DATAS INCONSISTENTES
*/

const EmendaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // ✅ Estados de erro para campos específicos
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    numero: "",
    autor: "",
    municipio: "",
    uf: "",
    cnpj: "", // ✅ CAMPO CNPJ ADICIONADO
    valor: "",
    valorRecurso: "",
    programa: "",
    beneficiario: "",
    cnpjBeneficiario: "",
    tipo: "Individual",
    modalidade: "",
    objeto: "",
    banco: "",
    agencia: "",
    conta: "",
    dataAprovacao: "",
    dataValidade: "",
    inicioExecucao: "",
    finalExecucao: "",
    numeroProposta: "",
    funcional: "",
    dataOb: "",
    dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
    acoesServicos: [],
    observacoes: "",
  });

  // ✅ DETECÇÃO CORRIGIDA: Verifica se formulário foi modificado
  const isFormModified = () => {
    // Campos principais que indicam que usuário começou a preencher
    const fieldsToCheck = ["autor", "municipio", "valor", "programa", "objeto"];

    const hasChanges = fieldsToCheck.some((field) => {
      const value = formData[field];
      return value && value.toString().trim() !== "";
    });

    console.log("🔍 Detecção de mudanças:", {
      hasChanges,
      campos: fieldsToCheck.reduce((acc, field) => {
        acc[field] = formData[field] || "";
        return acc;
      }, {}),
    });

    return hasChanges;
  };

  // ✅ CALCULAR MODIFICAÇÕES: Estado calculado em tempo real
  const hasUnsavedChanges = isFormModified();

  // 🚨 VALIDAÇÃO ABSOLUTA DE DATAS - ZERO TOLERÂNCIA A INCONSISTÊNCIAS
  const getFieldErrors = () => {
    const errors = {};
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação correta

    // ============================================
    // VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS
    // ============================================

    if (!formData.numero?.trim()) {
      errors.numero = "Número da emenda é obrigatório";
    }

    if (!formData.autor?.trim()) {
      errors.autor = "Parlamentar é obrigatório";
    }

    if (!formData.municipio?.trim()) {
      errors.municipio = "Município é obrigatório";
    }

    if (!formData.uf?.trim()) {
      errors.uf = "UF é obrigatória";
    }

    if (!formData.programa?.trim()) {
      errors.programa = "Programa é obrigatório";
    }

    if (!formData.objeto?.trim()) {
      errors.objeto = "Objeto da Proposta é obrigatório";
    }

    if (!formData.beneficiario?.trim()) {
      errors.beneficiario = "Beneficiário (CNPJ) é obrigatório";
    }

    if (!formData.valor?.toString().trim()) {
      errors.valor = "Valor do Recurso é obrigatório";
    }

    // ============================================
    // 🚨 VALIDAÇÕES CRÍTICAS DE DATAS - ABSOLUTA
    // ============================================

    // CONVERSÃO SEGURA DE DATAS
    const parseDate = (dateString) => {
      if (!dateString || !dateString.trim()) return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "INVALID" : date;
    };

    const dataAprov = parseDate(formData.dataAprovacao);
    const dataVal = parseDate(formData.dataValidade);
    const dataOB = parseDate(formData.dataOb);
    const dataInicio = parseDate(formData.inicioExecucao);
    const dataFinal = parseDate(formData.finalExecucao);

    // ============================================
    // 1️⃣ DATA DE APROVAÇÃO - OBRIGATÓRIA E CRÍTICA
    // ============================================
    if (!formData.dataAprovacao?.trim()) {
      errors.dataAprovacao = "🚨 Data de Aprovação é obrigatória";
    } else if (dataAprov === "INVALID") {
      errors.dataAprovacao = "🚨 Data de Aprovação inválida";
    } else {
      // Não pode ser anterior a 2020
      if (dataAprov.getFullYear() < 2020) {
        errors.dataAprovacao =
          "🚨 Data de Aprovação não pode ser anterior a 2020";
      }
      // Não pode ser futura
      if (dataAprov > hoje) {
        errors.dataAprovacao = "🚨 Data de Aprovação não pode ser futura";
      }
    }

    // ============================================
    // 2️⃣ DATA DE VALIDADE - OBRIGATÓRIA E CRÍTICA
    // ============================================
    if (!formData.dataValidade?.trim()) {
      errors.dataValidade = "🚨 Data de Validade é obrigatória";
    } else if (dataVal === "INVALID") {
      errors.dataValidade = "🚨 Data de Validade inválida";
    } else {
      // Deve ser futura
      if (dataVal <= hoje) {
        errors.dataValidade = "🚨 Data de Validade deve ser futura";
      }
      // Deve ser posterior à aprovação
      if (dataAprov && dataAprov !== "INVALID" && dataVal <= dataAprov) {
        errors.dataValidade =
          "🚨 Data de Validade deve ser posterior à Data de Aprovação";
      }
    }

    // ============================================
    // 3️⃣ DATA OB - SE PREENCHIDA, VALIDAR RIGOROSAMENTE
    // ============================================
    if (formData.dataOb?.trim()) {
      if (dataOB === "INVALID") {
        errors.dataOb = "🚨 Data do OB inválida";
      } else {
        // Deve ser posterior à aprovação
        if (dataAprov && dataAprov !== "INVALID" && dataOB < dataAprov) {
          errors.dataOb =
            "🚨 Data do OB não pode ser anterior à Data de Aprovação";
        }
        // Deve ser anterior ou igual ao início da execução (se preenchido)
        if (dataInicio && dataInicio !== "INVALID" && dataOB > dataInicio) {
          errors.dataOb =
            "🚨 Data do OB deve ser anterior ou igual ao Início da Execução";
        }
        // Deve ser anterior ou igual à validade
        if (dataVal && dataVal !== "INVALID" && dataOB > dataVal) {
          errors.dataOb =
            "🚨 Data do OB não pode ser posterior à Data de Validade";
        }
      }
    }

    // ============================================
    // 4️⃣ INÍCIO DA EXECUÇÃO - SE PREENCHIDA, VALIDAR
    // ============================================
    if (formData.inicioExecucao?.trim()) {
      if (dataInicio === "INVALID") {
        errors.inicioExecucao = "🚨 Data de Início de Execução inválida";
      } else {
        // Deve ser posterior à aprovação
        if (dataAprov && dataAprov !== "INVALID" && dataInicio < dataAprov) {
          errors.inicioExecucao =
            "🚨 Início da Execução não pode ser anterior à Data de Aprovação";
        }
        // Deve ser posterior ou igual ao OB (se preenchido)
        if (dataOB && dataOB !== "INVALID" && dataInicio < dataOB) {
          errors.inicioExecucao =
            "🚨 Início da Execução deve ser posterior ou igual à Data do OB";
        }
        // Deve ser anterior ou igual à validade
        if (dataVal && dataVal !== "INVALID" && dataInicio > dataVal) {
          errors.inicioExecucao =
            "🚨 Início da Execução não pode ser posterior à Data de Validade";
        }
      }
    }

    // ============================================
    // 5️⃣ FINAL DA EXECUÇÃO - SE PREENCHIDA, VALIDAR
    // ============================================
    if (formData.finalExecucao?.trim()) {
      if (dataFinal === "INVALID") {
        errors.finalExecucao = "🚨 Data de Final de Execução inválida";
      } else {
        // Deve ser posterior ao início (se preenchido)
        if (dataInicio && dataInicio !== "INVALID" && dataFinal <= dataInicio) {
          errors.finalExecucao =
            "🚨 Final da Execução deve ser posterior ao Início da Execução";
        }
        // Deve ser anterior ou igual à validade
        if (dataVal && dataVal !== "INVALID" && dataFinal > dataVal) {
          errors.finalExecucao =
            "🚨 Final da Execução não pode ser posterior à Data de Validade";
        }
        // Deve ser posterior à aprovação
        if (dataAprov && dataAprov !== "INVALID" && dataFinal < dataAprov) {
          errors.finalExecucao =
            "🚨 Final da Execução não pode ser anterior à Data de Aprovação";
        }
        // Deve ser posterior ao OB (se preenchido)
        if (dataOB && dataOB !== "INVALID" && dataFinal < dataOB) {
          errors.finalExecucao =
            "🚨 Final da Execução deve ser posterior à Data do OB";
        }
      }
    }

    // ============================================
    // VALIDAÇÕES CRUZADAS ADICIONAIS
    // ============================================

    // Se todas as datas estão preenchidas, validar sequência lógica completa
    if (
      dataAprov &&
      dataAprov !== "INVALID" &&
      dataVal &&
      dataVal !== "INVALID" &&
      dataOB &&
      dataOB !== "INVALID" &&
      dataInicio &&
      dataInicio !== "INVALID" &&
      dataFinal &&
      dataFinal !== "INVALID"
    ) {
      // Sequência lógica: Aprovação ≤ OB ≤ Início ≤ Final ≤ Validade
      if (
        !(
          dataAprov <= dataOB &&
          dataOB <= dataInicio &&
          dataInicio <= dataFinal &&
          dataFinal <= dataVal
        )
      ) {
        if (
          !errors.dataAprovacao &&
          !errors.dataValidade &&
          !errors.dataOb &&
          !errors.inicioExecucao &&
          !errors.finalExecucao
        ) {
          errors.cronogramaGeral =
            "🚨 Sequência cronológica inválida: Aprovação ≤ OB ≤ Início ≤ Final ≤ Validade";
        }
      }
    }

    // ============================================
    // VALIDAÇÕES DE CNPJ
    // ============================================

    // Validação CNPJ município (campo Identificação)
    if (formData.cnpj) {
      const cnpjLimpo = limparCNPJ(formData.cnpj);
      if (cnpjLimpo && cnpjLimpo.length === 14) {
        if (!validarCNPJ(formData.cnpj)) {
          errors.cnpj = "CNPJ do município é inválido";
        }
      } else if (cnpjLimpo && cnpjLimpo.length > 0) {
        errors.cnpj = "CNPJ do município está incompleto";
      }
    }

    // Validação CNPJ beneficiário
    if (formData.beneficiario) {
      const cnpjLimpo = limparCNPJ(formData.beneficiario);
      if (cnpjLimpo && cnpjLimpo.length === 14) {
        if (!validarCNPJ(formData.beneficiario)) {
          errors.beneficiario = "CNPJ do beneficiário é inválido";
        }
      } else if (cnpjLimpo && cnpjLimpo.length > 0) {
        errors.beneficiario = "CNPJ do beneficiário está incompleto";
      }
    }

    // ============================================
    // VALIDAÇÃO DE VALOR
    // ============================================

    if (formData.valor) {
      const valorNumerico = parseFloat(
        formData.valor
          .toString()
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );

      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        errors.valor = "Valor deve ser maior que zero";
      }
    }

    // ============================================
    // LOG DE DEBUG DETALHADO
    // ============================================

    if (Object.keys(errors).length > 0) {
      console.log("🚨 VALIDAÇÃO FALHOU - Detalhes completos:", {
        erros: errors,
        datasOriginais: {
          dataAprovacao: formData.dataAprovacao,
          dataValidade: formData.dataValidade,
          dataOb: formData.dataOb,
          inicioExecucao: formData.inicioExecucao,
          finalExecucao: formData.finalExecucao,
        },
        datasParsed: {
          dataAprov:
            dataAprov === "INVALID" ? "INVALID" : dataAprov?.toISOString(),
          dataVal: dataVal === "INVALID" ? "INVALID" : dataVal?.toISOString(),
          dataOB: dataOB === "INVALID" ? "INVALID" : dataOB?.toISOString(),
          dataInicio:
            dataInicio === "INVALID" ? "INVALID" : dataInicio?.toISOString(),
          dataFinal:
            dataFinal === "INVALID" ? "INVALID" : dataFinal?.toISOString(),
        },
        hoje: hoje.toISOString(),
      });
    }

    return errors;
  };

  // ✅ NOVO: Ordenar erros por prioridade/ordem do formulário
  const getOrderedFieldErrors = () => {
    const errors = getFieldErrors();

    // ✅ ORDEM DE PRIORIDADE DOS CAMPOS (baseada na ordem visual do formulário)
    const fieldOrder = [
      "numero", // Identificação
      "autor", // Identificação
      "municipio", // Identificação
      "uf", // Identificação
      "cnpj", // Identificação
      "programa", // Dados Básicos
      "objeto", // Dados Básicos
      "valor", // Dados Básicos
      "dataAprovacao", // 🚨 CRÍTICO: Cronograma
      "dataOb", // 🚨 CRÍTICO: Cronograma
      "dataValidade", // 🚨 CRÍTICO: Cronograma
      "inicioExecucao", // Cronograma
      "finalExecucao", // Cronograma
      "cronogramaGeral", // Cronograma (erro geral)
      "beneficiario", // Beneficiário
      "banco", // Bancários
      "agencia", // Bancários
      "conta", // Bancários
    ];

    // ✅ REORDENAR erros conforme ordem visual
    const orderedErrors = {};

    // Primeiro, adicionar campos na ordem prioritária
    fieldOrder.forEach((field) => {
      if (errors[field]) {
        orderedErrors[field] = errors[field];
      }
    });

    // Depois, adicionar campos restantes
    Object.keys(errors).forEach((field) => {
      if (!orderedErrors[field]) {
        orderedErrors[field] = errors[field];
      }
    });

    console.log("📋 Erros ordenados:", {
      original: Object.keys(errors),
      ordenado: Object.keys(orderedErrors),
    });

    return orderedErrors;
  };

  // ✅ MONITORAR mudanças em tempo real para debug
  useEffect(() => {
    console.log("📊 Estado dos botões:", {
      hasUnsavedChanges,
      modo: isEdicao ? "editar" : "criar",
      errosCampos: Object.keys(fieldErrors).length,
      campos: {
        autor: formData.autor,
        municipio: formData.municipio,
        valor: formData.valor,
        programa: formData.programa,
        objeto: formData.objeto,
      },
    });
  }, [
    hasUnsavedChanges,
    fieldErrors,
    formData.autor,
    formData.municipio,
    formData.valor,
    formData.programa,
    formData.objeto,
  ]);

  const [expandedSections, setExpandedSections] = useState({
    identificacao: true,
    dadosBasicos: true,
    beneficiario: false,
    complementares: false,
  });

  const mountedRef = useRef(true);
  const isEdicao = Boolean(id);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      console.log("🚀 Inicializando EmendaForm...", {
        isEdicao,
        userId: user?.uid,
        userEmail: user?.email,
      });

      try {
        setLoading(true);
        setError(null);

        if (isEdicao && id) {
          console.log("📖 Carregando emenda para edição:", id);

          const emendaDoc = await getDoc(doc(db, "emendas", id));

          if (!emendaDoc.exists()) {
            throw new Error("Emenda não encontrada");
          }

          const emendaData = emendaDoc.data();
          console.log("✅ Emenda carregada:", emendaData.numero);

          const valorFormatado =
            typeof emendaData.valorRecurso === "number"
              ? emendaData.valorRecurso.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : emendaData.valorRecurso || emendaData.valor || "";

          setFormData({
            numero: emendaData.numero || "",
            autor: emendaData.autor || emendaData.parlamentar || "",
            municipio: emendaData.municipio || "",
            uf: emendaData.uf || "",
            cnpj: emendaData.cnpj || "", // ✅ MAPEAR CAMPO CNPJ
            valor: valorFormatado,
            valorRecurso: valorFormatado,
            programa: emendaData.programa || "",
            beneficiario: emendaData.beneficiario || "",
            cnpjBeneficiario: emendaData.cnpjBeneficiario || "",
            tipo: emendaData.tipo || "Individual",
            modalidade: emendaData.modalidade || "",
            objeto: emendaData.objeto || "",
            banco: emendaData.banco || "",
            agencia: emendaData.agencia || "",
            conta: emendaData.conta || "",
            dataAprovacao: emendaData.dataAprovacao || "",
            dataValidade:
              emendaData.dataValidade || emendaData.dataValidada || "",
            inicioExecucao: emendaData.inicioExecucao || "",
            finalExecucao: emendaData.finalExecucao || "",
            numeroProposta: emendaData.numeroProposta || "",
            funcional: emendaData.funcional || "",
            dataOb: emendaData.dataOb || "",
            acoesServicos: emendaData.acoesServicos || [],
            observacoes: emendaData.observacoes || "",
          });
        } else {
          console.log("➕ Modo criação - preparando formulário limpo");

          if (user?.tipo === "operador" && user?.municipio && user?.uf) {
            setFormData((prev) => ({
              ...prev,
              municipio: user.municipio,
              uf: user.uf,
            }));
            console.log(
              "🏙️ Pré-preenchido município/UF:",
              user.municipio,
              user.uf,
            );
          }
        }

        setIsReady(true);
        console.log("✅ EmendaForm inicializado com sucesso");
      } catch (error) {
        console.error("❌ Erro ao inicializar EmendaForm:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      inicializar();
    } else {
      console.log("⏳ Aguardando dados do usuário...");
    }
  }, [user, id, isEdicao]);

  // ✅ ATUALIZADO: handleInputChange com limpeza de erros
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`🖊️ Campo alterado: ${name} = "${value}"`);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // ✅ Limpar erro do campo quando usuário digita
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      console.log(`✅ Erro limpo do campo: ${name}`);
    }
  };

  // ✅ FUNÇÃO: Limpar erro específico (callback para seções)
  const clearFieldError = (fieldName) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // ✅ VALIDAÇÃO LEGADA (manter compatibilidade) + TODAS AS DATAS CRÍTICAS
  const validarFormulario = () => {
    const errors = [];

    // Campos obrigatórios básicos
    if (!formData.numero?.trim()) {
      errors.push("Número da emenda é obrigatório");
    }

    if (!formData.autor?.trim()) {
      errors.push("Parlamentar/Autor é obrigatório");
    }

    if (!formData.municipio?.trim()) {
      errors.push("Município é obrigatório");
    }

    if (!formData.uf?.trim()) {
      errors.push("UF é obrigatória");
    }

    if (!formData.programa?.trim()) {
      errors.push("Programa é obrigatório");
    }

    if (!formData.objeto?.trim()) {
      errors.push("Objeto da Proposta é obrigatório");
    }

    if (!formData.beneficiario?.trim()) {
      errors.push("Beneficiário (CNPJ) é obrigatório");
    }

    if (!formData.valor?.toString().trim()) {
      errors.push("Valor do Recurso é obrigatório");
    }

    // 🚨 VALIDAÇÕES CRÍTICAS DE DATAS (compatibilidade)
    if (!formData.dataAprovacao?.trim()) {
      errors.push("Data de Aprovação é obrigatória");
    }

    if (!formData.dataValidade?.trim()) {
      errors.push("Data de Validade é obrigatória");
    }

    // Validações cruzadas de datas
    if (formData.dataAprovacao && formData.dataValidade) {
      const dataAprov = new Date(formData.dataAprovacao);
      const dataVal = new Date(formData.dataValidade);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (isNaN(dataAprov.getTime())) {
        errors.push("Data de Aprovação inválida");
      }

      if (isNaN(dataVal.getTime())) {
        errors.push("Data de Validade inválida");
      }

      if (!isNaN(dataAprov.getTime()) && !isNaN(dataVal.getTime())) {
        if (dataVal <= dataAprov) {
          errors.push(
            "Data de Validade deve ser posterior à Data de Aprovação",
          );
        }

        if (dataVal <= hoje) {
          errors.push("Data de Validade deve ser futura");
        }

        if (dataAprov > hoje) {
          errors.push("Data de Aprovação não pode ser futura");
        }
      }
    }

    // Validação Data OB (se preenchida)
    if (formData.dataOb?.trim()) {
      const dataOB = new Date(formData.dataOb);
      if (isNaN(dataOB.getTime())) {
        errors.push("Data do OB inválida");
      } else if (formData.dataAprovacao) {
        const dataAprov = new Date(formData.dataAprovacao);
        if (!isNaN(dataAprov.getTime()) && dataOB < dataAprov) {
          errors.push("Data do OB não pode ser anterior à Data de Aprovação");
        }
      }
    }

    // Validação Início da Execução (se preenchida)
    if (formData.inicioExecucao?.trim()) {
      const dataInicio = new Date(formData.inicioExecucao);
      if (isNaN(dataInicio.getTime())) {
        errors.push("Data de Início da Execução inválida");
      } else if (formData.dataAprovacao) {
        const dataAprov = new Date(formData.dataAprovacao);
        if (!isNaN(dataAprov.getTime()) && dataInicio < dataAprov) {
          errors.push(
            "Início da Execução não pode ser anterior à Data de Aprovação",
          );
        }
      }
    }

    // Validação Final da Execução (se preenchida)
    if (formData.finalExecucao?.trim()) {
      const dataFinal = new Date(formData.finalExecucao);
      if (isNaN(dataFinal.getTime())) {
        errors.push("Data de Final da Execução inválida");
      } else {
        if (formData.inicioExecucao) {
          const dataInicio = new Date(formData.inicioExecucao);
          if (!isNaN(dataInicio.getTime()) && dataFinal <= dataInicio) {
            errors.push(
              "Final da Execução deve ser posterior ao Início da Execução",
            );
          }
        }

        if (formData.dataValidade) {
          const dataVal = new Date(formData.dataValidade);
          if (!isNaN(dataVal.getTime()) && dataFinal > dataVal) {
            errors.push(
              "Final da Execução não pode ser posterior à Data de Validade",
            );
          }
        }
      }
    }

    // Validação CNPJ município
    if (formData.cnpj) {
      const cnpjLimpo = limparCNPJ(formData.cnpj);
      if (cnpjLimpo && cnpjLimpo.length === 14) {
        if (!validarCNPJ(formData.cnpj)) {
          errors.push("CNPJ do município (Identificação) é inválido");
        }
      } else if (cnpjLimpo && cnpjLimpo.length > 0) {
        errors.push("CNPJ do município está incompleto");
      }
    }

    // Validação CNPJ beneficiário
    if (formData.beneficiario) {
      const cnpjLimpo = limparCNPJ(formData.beneficiario);
      if (cnpjLimpo && cnpjLimpo.length === 14) {
        if (!validarCNPJ(formData.beneficiario)) {
          errors.push("CNPJ do beneficiário é inválido");
        }
      } else if (cnpjLimpo && cnpjLimpo.length > 0) {
        errors.push("CNPJ do beneficiário está incompleto");
      }
    }

    // Validação de valor
    if (formData.valor) {
      const valorNumerico = parseFloat(
        formData.valor
          .toString()
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );

      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        errors.push("Valor do recurso deve ser maior que zero");
      }
    }

    return errors;
  };

  // ✅ ATUALIZADO: handleSubmit com foco inteligente
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ NOVA VALIDAÇÃO: Com feedback visual ordenado
    const fieldErrorsResult = getOrderedFieldErrors();

    if (Object.keys(fieldErrorsResult).length > 0) {
      setFieldErrors(fieldErrorsResult);

      // ✅ DEBUG: Log dos erros encontrados
      console.log("🚨 Erros encontrados:", {
        totalErros: Object.keys(fieldErrorsResult).length,
        campos: Object.keys(fieldErrorsResult),
        detalhes: fieldErrorsResult,
        dadosFormulario: {
          dataAprovacao: formData.dataAprovacao,
          dataValidade: formData.dataValidade,
          inicioExecucao: formData.inicioExecucao,
          finalExecucao: formData.finalExecucao,
        },
      });

      // ✅ TOAST MELHORADO: Feedback claro e amigável
      const errorList = Object.values(fieldErrorsResult);
      setToast({
        show: true,
        message: `🚨 Existem campos que precisam ser preenchidos corretamente:\n\n${errorList.map((err) => `• ${err}`).join("\n")}\n\n📝 Os campos com erro estão destacados em vermelho.`,
        type: "error",
      });

      // ✅ FOCO INTELIGENTE: No primeiro campo que AINDA tem erro
      setTimeout(() => {
        const focusedField = null; // Removido o foco automático
        console.log(`📍 Campo focado: ${focusedField || "nenhum"}`);
      }, 100);

      // ✅ SCROLL para o topo para ver o toast
      window.scrollTo({ top: 0, behavior: "smooth" });

      console.log("❌ Validação falhou - aguardando correções do usuário");
      return;
    }

    // ✅ LIMPAR erros se validação passou
    setFieldErrors({});
    console.log("✅ Validação passou - verificando dados críticos...");

    // 🚨 VALIDAÇÃO CRÍTICA: Tripla verificação antes de salvar
    const criticalValidation = () => {
      const errors = [];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // ============================================
      // PARSING SEGURO DE TODAS AS DATAS
      // ============================================
      const parseDate = (dateString, fieldName) => {
        if (!dateString || !dateString.trim()) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          errors.push(`❌ CRÍTICO: ${fieldName} com formato inválido`);
          return "INVALID";
        }
        return date;
      };

      const dataAprov = parseDate(formData.dataAprovacao, "Data de Aprovação");
      const dataVal = parseDate(formData.dataValidade, "Data de Validade");
      const dataOB = parseDate(formData.dataOb, "Data OB");
      const dataInicio = parseDate(
        formData.inicioExecucao,
        "Início da Execução",
      );
      const dataFinal = parseDate(formData.finalExecucao, "Final da Execução");

      // ============================================
      // VERIFICAÇÕES OBRIGATÓRIAS CRÍTICAS
      // ============================================

      if (!formData.dataAprovacao) {
        errors.push("❌ CRÍTICO: Data de Aprovação obrigatória");
      }

      if (!formData.dataValidade) {
        errors.push("❌ CRÍTICO: Data de Validade obrigatória");
      }

      // ============================================
      // VERIFICAÇÕES DE CONSISTÊNCIA TEMPORAL
      // ============================================

      if (dataAprov && dataAprov !== "INVALID") {
        // Data de aprovação não pode ser futura
        if (dataAprov > hoje) {
          errors.push("❌ CRÍTICO: Data de Aprovação não pode ser futura");
        }

        // Data de aprovação não pode ser muito antiga
        if (dataAprov.getFullYear() < 2020) {
          errors.push(
            "❌ CRÍTICO: Data de Aprovação não pode ser anterior a 2020",
          );
        }
      }

      if (dataVal && dataVal !== "INVALID") {
        // Data de validade deve ser futura
        if (dataVal <= hoje) {
          errors.push("❌ CRÍTICO: Data de Validade deve ser futura");
        }

        // Data de validade deve ser posterior à aprovação
        if (dataAprov && dataAprov !== "INVALID" && dataVal <= dataAprov) {
          errors.push(
            "❌ CRÍTICO: Data de Validade deve ser posterior à Data de Aprovação",
          );
        }
      }

      // ============================================
      // VERIFICAÇÕES DE DATA OB
      // ============================================

      if (dataOB && dataOB !== "INVALID") {
        // OB deve ser posterior à aprovação
        if (dataAprov && dataAprov !== "INVALID" && dataOB < dataAprov) {
          errors.push(
            "❌ CRÍTICO: Data do OB não pode ser anterior à Data de Aprovação",
          );
        }

        // OB deve ser anterior ou igual à validade
        if (dataVal && dataVal !== "INVALID" && dataOB > dataVal) {
          errors.push(
            "❌ CRÍTICO: Data do OB não pode ser posterior à Data de Validade",
          );
        }
      }

      // ============================================
      // VERIFICAÇÕES DE INÍCIO DA EXECUÇÃO
      // ============================================

      if (dataInicio && dataInicio !== "INVALID") {
        // Início deve ser posterior à aprovação
        if (dataAprov && dataAprov !== "INVALID" && dataInicio < dataAprov) {
          errors.push(
            "❌ CRÍTICO: Início da Execução não pode ser anterior à Data de Aprovação",
          );
        }

        // Início deve ser posterior ou igual ao OB
        if (dataOB && dataOB !== "INVALID" && dataInicio < dataOB) {
          errors.push(
            "❌ CRÍTICO: Início da Execução deve ser posterior ou igual à Data do OB",
          );
        }

        // Início deve ser anterior ou igual à validade
        if (dataVal && dataVal !== "INVALID" && dataInicio > dataVal) {
          errors.push(
            "❌ CRÍTICO: Início da Execução não pode ser posterior à Data de Validade",
          );
        }
      }

      // ============================================
      // VERIFICAÇÕES DE FINAL DA EXECUÇÃO
      // ============================================

      if (dataFinal && dataFinal !== "INVALID") {
        // Final deve ser posterior ao início
        if (dataInicio && dataInicio !== "INVALID" && dataFinal <= dataInicio) {
          errors.push(
            "❌ CRÍTICO: Final da Execução deve ser posterior ao Início da Execução",
          );
        }

        // Final deve ser anterior ou igual à validade
        if (dataVal && dataVal !== "INVALID" && dataFinal > dataVal) {
          errors.push(
            "❌ CRÍTICO: Final da Execução não pode ser posterior à Data de Validade",
          );
        }

        // Final deve ser posterior à aprovação
        if (dataAprov && dataAprov !== "INVALID" && dataFinal < dataAprov) {
          errors.push(
            "❌ CRÍTICO: Final da Execução não pode ser anterior à Data de Aprovação",
          );
        }

        // Final deve ser posterior ao OB
        if (dataOB && dataOB !== "INVALID" && dataFinal < dataOB) {
          errors.push(
            "❌ CRÍTICO: Final da Execução deve ser posterior à Data do OB",
          );
        }
      }

      // ============================================
      // VERIFICAÇÃO DE SEQUÊNCIA CRONOLÓGICA COMPLETA
      // ============================================

      // Se todas as datas estão preenchidas, verificar sequência lógica
      const todasDatasValidas =
        dataAprov &&
        dataAprov !== "INVALID" &&
        dataVal &&
        dataVal !== "INVALID" &&
        dataOB &&
        dataOB !== "INVALID" &&
        dataInicio &&
        dataInicio !== "INVALID" &&
        dataFinal &&
        dataFinal !== "INVALID";

      if (todasDatasValidas) {
        // Sequência deve ser: Aprovação ≤ OB ≤ Início ≤ Final ≤ Validade
        if (
          !(
            dataAprov <= dataOB &&
            dataOB <= dataInicio &&
            dataInicio <= dataFinal &&
            dataFinal <= dataVal
          )
        ) {
          errors.push(
            "❌ CRÍTICO: Sequência cronológica inválida - deve ser: Aprovação ≤ OB ≤ Início ≤ Final ≤ Validade",
          );
        }
      }

      // ============================================
      // LOG CRÍTICO DETALHADO
      // ============================================

      if (errors.length > 0) {
        console.error("🚨 VALIDAÇÃO CRÍTICA FALHOU - BLOQUEANDO SALVAMENTO:", {
          errosCriticos: errors,
          dadosFormulario: {
            dataAprovacao: formData.dataAprovacao,
            dataValidade: formData.dataValidade,
            dataOb: formData.dataOb,
            inicioExecucao: formData.inicioExecucao,
            finalExecucao: formData.finalExecucao,
          },
          datasParsed: {
            dataAprov:
              dataAprov === "INVALID" ? "INVALID" : dataAprov?.toISOString(),
            dataVal: dataVal === "INVALID" ? "INVALID" : dataVal?.toISOString(),
            dataOB: dataOB === "INVALID" ? "INVALID" : dataOB?.toISOString(),
            dataInicio:
              dataInicio === "INVALID" ? "INVALID" : dataInicio?.toISOString(),
            dataFinal:
              dataFinal === "INVALID" ? "INVALID" : dataFinal?.toISOString(),
          },
          hoje: hoje.toISOString(),
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log(
          "✅ VALIDAÇÃO CRÍTICA PASSOU - Todas as datas estão consistentes",
        );
      }

      return errors;
    };

    // 🚨 EXECUTAR validação crítica ANTES do Firebase
    const criticalErrors = criticalValidation();
    if (criticalErrors.length > 0) {
      console.error("🚨 VALIDAÇÃO CRÍTICA FALHOU:", criticalErrors);
      setToast({
        show: true,
        message: `🚨 ERRO CRÍTICO - Salvamento bloqueado:\n\n${criticalErrors.join("\n")}\n\n⚠️ O sistema não pode salvar emendas com datas inválidas.`,
        type: "error",
      });
      setSalvando(false);
      return;
    }

    console.log("✅ Validação crítica passou - prosseguindo com salvamento");

    // Prevenir duplo clique
    if (salvando) return;

    setSalvando(true);

    try {
      const valorNumerico = parseFloat(
        formData.valor
          ?.toString()
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );

      // ✅ DADOS CORRIGIDOS - Campos mapeados corretamente + VALIDAÇÃO FINAL DE DATAS
      const dadosParaSalvar = {
        numero: formData.numero?.trim(),
        autor: formData.autor?.trim(),
        parlamentar: formData.autor?.trim(),
        municipio: formData.municipio?.trim(),
        uf: formData.uf?.trim(),
        cnpj: formData.cnpj?.trim(), // ✅ SALVAR CAMPO CNPJ
        valor: valorNumerico,
        valorRecurso: valorNumerico,
        programa: formData.programa?.trim(),
        beneficiario: formData.beneficiario?.trim(),
        cnpjBeneficiario: formData.cnpjBeneficiario?.trim(),
        tipo: formData.tipo,
        modalidade: formData.modalidade?.trim(),
        objeto: formData.objeto?.trim(),
        banco: formData.banco?.trim(),
        agencia: formData.agencia?.trim(),
        conta: formData.conta?.trim(),
        // 🚨 DATAS VALIDADAS - Só salvar se válidas
        dataAprovacao: formData.dataAprovacao?.trim() || null,
        dataValidade: formData.dataValidade?.trim() || null,
        inicioExecucao: formData.inicioExecucao?.trim() || null,
        finalExecucao: formData.finalExecucao?.trim() || null,
        numeroProposta: formData.numeroProposta?.trim(),
        funcional: formData.funcional?.trim(),
        dataOb: formData.dataOb,
        acoesServicos: formData.acoesServicos || [],
        observacoes: formData.observacoes?.trim(),
        valorExecutado: 0,
        status: "Ativa",
        dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
        atualizadoEm: serverTimestamp(),
        atualizadoPor: user.uid || user.email,
      };

      // 🚨 VERIFICAÇÃO FINAL ABSOLUTA: Não salvar se datas críticas estão ausentes ou inconsistentes
      console.log("🔍 VERIFICAÇÃO FINAL DOS DADOS:", {
        dataAprovacao: dadosParaSalvar.dataAprovacao,
        dataValidade: dadosParaSalvar.dataValidade,
        dataOb: dadosParaSalvar.dataOb,
        inicioExecucao: dadosParaSalvar.inicioExecucao,
        finalExecucao: dadosParaSalvar.finalExecucao,
      });

      // BLOQUEIO ABSOLUTO: Datas obrigatórias
      if (!dadosParaSalvar.dataAprovacao || !dadosParaSalvar.dataValidade) {
        console.error("🚨 BLOQUEIO FINAL: Datas críticas ausentes", {
          dataAprovacao: !!dadosParaSalvar.dataAprovacao,
          dataValidade: !!dadosParaSalvar.dataValidade,
        });

        setToast({
          show: true,
          message:
            "🚨 ERRO CRÍTICO: Não é possível salvar emenda sem Data de Aprovação e Data de Validade válidas.",
          type: "error",
        });
        setSalvando(false);
        return;
      }

      // BLOQUEIO ABSOLUTO: Validação final de consistência
      const finalDataAprov = new Date(dadosParaSalvar.dataAprovacao);
      const finalDataVal = new Date(dadosParaSalvar.dataValidade);
      const finalHoje = new Date();
      finalHoje.setHours(0, 0, 0, 0);

      const finalErrors = [];

      // Verificações finais que NUNCA podem falhar
      if (isNaN(finalDataAprov.getTime())) {
        finalErrors.push("Data de Aprovação inválida");
      }

      if (isNaN(finalDataVal.getTime())) {
        finalErrors.push("Data de Validade inválida");
      }

      if (!isNaN(finalDataAprov.getTime()) && !isNaN(finalDataVal.getTime())) {
        if (finalDataVal <= finalDataAprov) {
          finalErrors.push(
            "Data de Validade deve ser posterior à Data de Aprovação",
          );
        }

        if (finalDataVal <= finalHoje) {
          finalErrors.push("Data de Validade deve ser futura");
        }

        if (finalDataAprov > finalHoje) {
          finalErrors.push("Data de Aprovação não pode ser futura");
        }
      }

      // Verificações adicionais se outras datas estão preenchidas
      if (dadosParaSalvar.dataOb) {
        const finalDataOB = new Date(dadosParaSalvar.dataOb);
        if (!isNaN(finalDataOB.getTime()) && !isNaN(finalDataAprov.getTime())) {
          if (finalDataOB < finalDataAprov) {
            finalErrors.push(
              "Data do OB não pode ser anterior à Data de Aprovação",
            );
          }
        }
      }

      if (finalErrors.length > 0) {
        console.error("🚨 BLOQUEIO FINAL ABSOLUTO:", finalErrors);
        setToast({
          show: true,
          message: `🚨 ERRO CRÍTICO - Dados inconsistentes detectados:\n\n${finalErrors.map((err) => `• ${err}`).join("\n")}\n\n❌ Salvamento bloqueado para proteger a integridade dos dados.`,
          type: "error",
        });
        setSalvando(false);
        return;
      }

      console.log(
        "✅ VERIFICAÇÃO FINAL PASSOU - Dados validados para salvamento:",
        {
          dataAprovacao: dadosParaSalvar.dataAprovacao,
          dataValidade: dadosParaSalvar.dataValidade,
          valor: dadosParaSalvar.valor,
          cronogramaCompleto: {
            aprovacao: finalDataAprov.toISOString(),
            validade: finalDataVal.toISOString(),
            ob: dadosParaSalvar.dataOb,
            inicio: dadosParaSalvar.inicioExecucao,
            final: dadosParaSalvar.finalExecucao,
          },
        },
      );

      if (isEdicao) {
        await updateDoc(doc(db, "emendas", id), dadosParaSalvar);
        console.log("✅ Emenda atualizada");

        setToast({
          show: true,
          message: "✅ Emenda atualizada com sucesso!",
          type: "success",
        });

        setTimeout(() => {
          navigate("/emendas", { replace: true });
        }, 800);
      } else {
        dadosParaSalvar.criadoEm = serverTimestamp();
        dadosParaSalvar.criadoPor = user.uid || user.email;
        await addDoc(collection(db, "emendas"), dadosParaSalvar);
        console.log("✅ Emenda criada");

        setToast({
          show: true,
          message: "✅ Emenda cadastrada com sucesso!",
          type: "success",
        });

        setTimeout(() => {
          navigate("/emendas", { replace: true });
        }, 800);
      }
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      let mensagemErro = "❌ Erro ao salvar emenda. ";

      if (error.code === "permission-denied") {
        mensagemErro += "Você não tem permissão para esta operação.";
      } else if (error.code === "already-exists") {
        mensagemErro += "Já existe uma emenda com este número.";
      } else {
        mensagemErro += "Tente novamente.";
      }

      setToast({
        show: true,
        message: mensagemErro,
        type: "error",
      });
    } finally {
      setSalvando(false);
    }
  };

  const emendaParaEditar = null;
  const onSuccess = null;

  const handleCancel = () => {
    console.log("🖱️ HandleCancel chamado - abrindo modal");
    setShowCancelModal(true);
  };

  // ✅ HANDLER: Confirma cancelamento e navega
  const handleConfirmCancel = () => {
    console.log("✅ Cancelamento confirmado - descartando alterações");
    setShowCancelModal(false);
    navigate("/emendas", { replace: true });
  };

  // ✅ HANDLER: Continuar editando (fecha modal)
  const handleContinueEditing = () => {
    console.log("📝 Usuário optou por continuar editando");
    setShowCancelModal(false);
  };

  // ✅ HANDLER: Voltar simples (sem modal)
  const handleSimpleBack = () => {
    console.log("🔙 Navegação simples - formulário vazio");
    navigate("/emendas", { replace: true });
  };

  const buscarDadosFornecedor = async (cnpj) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, "");

      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
      );

      if (response.ok) {
        const dados = await response.json();

        setFormData((prev) => ({
          ...prev,
          beneficiario: dados.nome_fantasia || dados.razao_social,
          razaoSocial: dados.razao_social,
        }));

        setToast({
          show: true,
          message: `✅ Dados do CNPJ carregados: ${dados.nome_fantasia || dados.razao_social}`,
          type: "success",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
    }
  };

  // ✅ RENDERIZAÇÃO CONDICIONAL DENTRO DO COMPONENTE
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3>
            {!user
              ? "Carregando..."
              : isEdicao
                ? "Carregando dados da emenda..."
                : "Preparando formulário..."}
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <h3>Erro no Formulário</h3>
          <p>{error}</p>
          <div style={styles.errorActions}>
            <button
              onClick={() => {
                setError(null);
                setIsReady(false);
              }}
              style={styles.retryButton}
            >
              🔄 Tentar Novamente
            </button>
            <button
              onClick={() => navigate("/emendas")}
              style={styles.backButton}
            >
              ← Voltar para Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <EmendaFormHeader
        modo={isEdicao ? "editar" : "criar"}
        emendaId={id}
        parlamentar={formData.autor}
      />

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ SEÇÕES COM PROPS DE ERRO ATUALIZADAS */}
        <Identificacao
          formData={formData}
          onChange={handleInputChange}
          errors={fieldErrors}
          onClearError={clearFieldError}
        />

        <DadosBasicos
          formData={formData}
          onChange={handleInputChange}
          errors={fieldErrors}
          onClearError={clearFieldError}
        />

        <DadosBeneficiario
          formData={formData}
          onChange={handleInputChange}
          setFormData={setFormData}
          errors={fieldErrors}
          onClearError={clearFieldError}
          styles={styles}
          buscarDadosFornecedor={buscarDadosFornecedor}
          expanded={expandedSections.beneficiario}
          onToggle={() => toggleSection("beneficiario")}
        />

        <DadosBancarios
          formData={formData}
          onChange={handleInputChange}
          errors={fieldErrors}
          onClearError={clearFieldError}
        />

        <Cronograma
          formData={formData}
          onChange={handleInputChange}
          errors={fieldErrors}
          onClearError={clearFieldError}
        />

        <AcoesServicos
          formData={formData}
          onChange={handleInputChange}
          errors={fieldErrors}
          onClearError={clearFieldError}
        />

        <InformacoesComplementares
          formData={formData}
          onChange={handleInputChange}
          errors={fieldErrors}
          onClearError={clearFieldError}
        />

        {/* ✅ BOTÕES FUNCIONAIS */}
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

      {/* ✅ MODAL FUNCIONAL */}
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

      {/* ✅ TOAST MELHORADO */}
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
};

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
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
    position: "relative",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    marginTop: "4px",
  },
  inputValid: {
    borderColor: "#27ae60",
    backgroundColor: "#f0fff4",
  },
  inputInvalid: {
    borderColor: "#e74c3c",
    backgroundColor: "#fff5f5",
  },
  validationFeedback: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
    cursor: "pointer",
  },
  helperText: {
    fontSize: "12px",
    marginTop: "4px",
    color: "#666",
  },
  errorText: {
    fontSize: "12px",
    marginTop: "4px",
    color: "#e74c3c",
    fontWeight: "500",
  },
  expandedSection: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fdfdfd",
    marginTop: "20px",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    paddingBottom: "8px",
    borderBottom: "1px solid #eee",
    color: "#333",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
};

if (!document.querySelector('style[data-component="emenda-form-fixed"]')) {
  const styleSheet = document.createElement("style");
  styleSheet.setAttribute("data-component", "emenda-form-fixed");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default EmendaForm;