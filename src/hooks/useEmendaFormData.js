// src/hooks/useEmendaFormData.js - ARQUIVO COMPLETO PARA SUBSTITUIÇÃO
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext";
import { validarCNPJ, limparCNPJ } from "../utils/cnpjUtils";

export const useEmendaFormData = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  // ✅ ESTADOS PRINCIPAIS
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    numero: "",
    autor: "",
    municipio: "",
    uf: "",
    cnpj: "",
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

  const [expandedSections, setExpandedSections] = useState({
    identificacao: true,
    dadosBasicos: true,
    beneficiario: false,
    complementares: false,
  });

  const mountedRef = useRef(true);
  const isEdicao = Boolean(id);

  // ✅ DETECÇÃO DE MUDANÇAS
  const isFormModified = () => {
    const fieldsToCheck = ["autor", "municipio", "valor", "programa", "objeto"];
    return fieldsToCheck.some((field) => {
      const value = formData[field];
      return value && value.toString().trim() !== "";
    });
  };

  const hasUnsavedChanges = isFormModified();

  // 🚨 VALIDAÇÕES ABSOLUTAS - TODAS AS DATAS OBRIGATÓRIAS
  const getFieldErrors = () => {
    const errors = {};
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // ============================================
    // 🚨 SEÇÃO IDENTIFICAÇÃO - OBRIGATÓRIA
    // ============================================
    if (!formData.numero?.trim()) {
      errors.numero = "🚨 Número da emenda é obrigatório";
    }
    if (!formData.autor?.trim()) {
      errors.autor = "🚨 Parlamentar é obrigatório";
    }
    if (!formData.municipio?.trim()) {
      errors.municipio = "🚨 Município é obrigatório";
    }
    if (!formData.uf?.trim()) {
      errors.uf = "🚨 UF é obrigatória";
    }

    // ============================================
    // 🚨 SEÇÃO DADOS BÁSICOS - OBRIGATÓRIA
    // ============================================
    if (!formData.programa?.trim()) {
      errors.programa = "🚨 Programa é obrigatório";
    }
    if (!formData.objeto?.trim()) {
      errors.objeto = "🚨 Objeto da Proposta é obrigatório";
    }
    if (!formData.valor?.toString().trim()) {
      errors.valor = "🚨 Valor do Recurso é obrigatório";
    } else {
      const valorNumerico = parseFloat(
        formData.valor
          .toString()
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        errors.valor = "🚨 Valor deve ser maior que zero";
      }
    }

    // ============================================
    // 🚨 SEÇÃO BENEFICIÁRIO - OBRIGATÓRIA
    // ============================================
    if (!formData.beneficiario?.trim()) {
      errors.beneficiario = "🚨 Beneficiário (CNPJ) é obrigatório";
    } else {
      const cnpjLimpo = limparCNPJ(formData.beneficiario);
      if (cnpjLimpo && cnpjLimpo.length === 14) {
        if (!validarCNPJ(formData.beneficiario)) {
          errors.beneficiario = "🚨 CNPJ do beneficiário é inválido";
        }
      } else if (cnpjLimpo && cnpjLimpo.length > 0) {
        errors.beneficiario = "🚨 CNPJ do beneficiário está incompleto";
      }
    }

    // ============================================
    // 🚨 SEÇÃO DADOS BANCÁRIOS - OBRIGATÓRIA
    // ============================================
    if (!formData.banco?.trim()) {
      errors.banco = "🚨 Banco é obrigatório";
    } else {
      const bancoNumerico = formData.banco.replace(/\D/g, "");
      if (bancoNumerico.length !== 3) {
        errors.banco = "🚨 Código do banco deve ter 3 dígitos";
      }
    }

    if (!formData.agencia?.trim()) {
      errors.agencia = "🚨 Agência é obrigatória";
    } else {
      const agenciaLimpa = formData.agencia.replace(/\D/g, "");
      if (agenciaLimpa.length < 4) {
        errors.agencia = "🚨 Agência deve ter pelo menos 4 dígitos";
      }
    }

    if (!formData.conta?.trim()) {
      errors.conta = "🚨 Conta é obrigatória";
    } else {
      const contaLimpa = formData.conta.replace(/\D/g, "");
      if (contaLimpa.length < 5) {
        errors.conta = "🚨 Conta deve ter pelo menos 5 dígitos";
      }
    }

    // ============================================
    // 🚨 SEÇÃO CRONOGRAMA - TODAS AS DATAS OBRIGATÓRIAS
    // ============================================

    const parseDate = (dateString) => {
      if (!dateString || !dateString.trim() || dateString === "dd/mm/aaaa")
        return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "INVALID" : date;
    };

    const dataAprov = parseDate(formData.dataAprovacao);
    const dataVal = parseDate(formData.dataValidade);
    const dataOB = parseDate(formData.dataOb);
    const dataInicio = parseDate(formData.inicioExecucao);
    const dataFinal = parseDate(formData.finalExecucao);

    // 🚨 1️⃣ DATA DE APROVAÇÃO - OBRIGATÓRIA
    if (
      !formData.dataAprovacao?.trim() ||
      formData.dataAprovacao === "dd/mm/aaaa"
    ) {
      errors.dataAprovacao = "🚨 Data de Aprovação é obrigatória";
    } else if (dataAprov === "INVALID") {
      errors.dataAprovacao = "🚨 Data de Aprovação inválida";
    } else {
      if (dataAprov.getFullYear() < 2020) {
        errors.dataAprovacao =
          "🚨 Data de Aprovação não pode ser anterior a 2020";
      }
      if (dataAprov > hoje) {
        errors.dataAprovacao = "🚨 Data de Aprovação não pode ser futura";
      }
    }

    // 🚨 2️⃣ DATA OB - AGORA OBRIGATÓRIA
    if (!formData.dataOb?.trim() || formData.dataOb === "dd/mm/aaaa") {
      errors.dataOb = "🚨 Data do OB é obrigatória";
    } else if (dataOB === "INVALID") {
      errors.dataOb = "🚨 Data do OB inválida";
    } else {
      if (dataAprov && dataAprov !== "INVALID" && dataOB < dataAprov) {
        errors.dataOb =
          "🚨 Data do OB não pode ser anterior à Data de Aprovação";
      }
      if (dataVal && dataVal !== "INVALID" && dataOB > dataVal) {
        errors.dataOb =
          "🚨 Data do OB não pode ser posterior à Data de Validade";
      }
    }

    // 🚨 3️⃣ INÍCIO DA EXECUÇÃO - AGORA OBRIGATÓRIA
    if (
      !formData.inicioExecucao?.trim() ||
      formData.inicioExecucao === "dd/mm/aaaa"
    ) {
      errors.inicioExecucao = "🚨 Data de Início da Execução é obrigatória";
    } else if (dataInicio === "INVALID") {
      errors.inicioExecucao = "🚨 Data de Início da Execução inválida";
    } else {
      if (dataAprov && dataAprov !== "INVALID" && dataInicio < dataAprov) {
        errors.inicioExecucao =
          "🚨 Início da Execução não pode ser anterior à Data de Aprovação";
      }
      if (dataOB && dataOB !== "INVALID" && dataInicio < dataOB) {
        errors.inicioExecucao =
          "🚨 Início da Execução deve ser posterior ou igual à Data do OB";
      }
      if (dataVal && dataVal !== "INVALID" && dataInicio > dataVal) {
        errors.inicioExecucao =
          "🚨 Início da Execução não pode ser posterior à Data de Validade";
      }
    }

    // 🚨 4️⃣ FINAL DA EXECUÇÃO - AGORA OBRIGATÓRIA
    if (
      !formData.finalExecucao?.trim() ||
      formData.finalExecucao === "dd/mm/aaaa"
    ) {
      errors.finalExecucao = "🚨 Data de Final da Execução é obrigatória";
    } else if (dataFinal === "INVALID") {
      errors.finalExecucao = "🚨 Data de Final da Execução inválida";
    } else {
      if (dataInicio && dataInicio !== "INVALID" && dataFinal <= dataInicio) {
        errors.finalExecucao =
          "🚨 Final da Execução deve ser posterior ao Início da Execução";
      }
      if (dataVal && dataVal !== "INVALID" && dataFinal > dataVal) {
        errors.finalExecucao =
          "🚨 Final da Execução não pode ser posterior à Data de Validade";
      }
      if (dataAprov && dataAprov !== "INVALID" && dataFinal < dataAprov) {
        errors.finalExecucao =
          "🚨 Final da Execução não pode ser anterior à Data de Aprovação";
      }
      if (dataOB && dataOB !== "INVALID" && dataFinal < dataOB) {
        errors.finalExecucao =
          "🚨 Final da Execução deve ser posterior à Data do OB";
      }
    }

    // 🚨 5️⃣ DATA DE VALIDADE - OBRIGATÓRIA
    if (
      !formData.dataValidade?.trim() ||
      formData.dataValidade === "dd/mm/aaaa"
    ) {
      errors.dataValidade = "🚨 Data de Validade é obrigatória";
    } else if (dataVal === "INVALID") {
      errors.dataValidade = "🚨 Data de Validade inválida";
    } else {
      if (dataVal <= hoje) {
        errors.dataValidade = "🚨 Data de Validade deve ser futura";
      }
      if (dataAprov && dataAprov !== "INVALID" && dataVal <= dataAprov) {
        errors.dataValidade =
          "🚨 Data de Validade deve ser posterior à Data de Aprovação";
      }
    }

    // ============================================
    // 🚨 VERIFICAÇÃO DE SEQUÊNCIA CRONOLÓGICA COMPLETA
    // ============================================
    if (
      dataAprov &&
      dataAprov !== "INVALID" &&
      dataOB &&
      dataOB !== "INVALID" &&
      dataInicio &&
      dataInicio !== "INVALID" &&
      dataFinal &&
      dataFinal !== "INVALID" &&
      dataVal &&
      dataVal !== "INVALID"
    ) {
      // Sequência obrigatória: Aprovação ≤ OB ≤ Início ≤ Final ≤ Validade
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
          !errors.dataOb &&
          !errors.inicioExecucao &&
          !errors.finalExecucao &&
          !errors.dataValidade
        ) {
          errors.cronogramaGeral =
            "🚨 Sequência cronológica inválida: Aprovação ≤ OB ≤ Início ≤ Final ≤ Validade";
        }
      }
    }

    // ============================================
    // 🚨 SEÇÃO AÇÕES E SERVIÇOS - OBRIGATÓRIA
    // ============================================
    if (!formData.acoesServicos || formData.acoesServicos.length === 0) {
      errors.acoesServicos =
        "🚨 Pelo menos uma meta deve ser cadastrada em Ações e Serviços";
    } else {
      let hasValidMeta = false;

      formData.acoesServicos.forEach((meta, index) => {
        if (meta.descricao?.trim() && meta.quantidade > 0) {
          hasValidMeta = true;
        } else {
          if (!meta.descricao?.trim()) {
            errors[`meta_${index}_descricao`] =
              "🚨 Descrição da meta é obrigatória";
          }
          if (!meta.quantidade || meta.quantidade <= 0) {
            errors[`meta_${index}_quantidade`] =
              "🚨 Quantidade da meta é obrigatória";
          }
        }
      });

      if (!hasValidMeta) {
        errors.acoesServicos =
          "🚨 Pelo menos uma meta válida deve ser preenchida";
      }
    }

    // ============================================
    // VALIDAÇÃO CNPJ MUNICÍPIO (OPCIONAL)
    // ============================================
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

    return errors;
  };

  // ✅ ORDENAR ERROS POR PRIORIDADE
  const getOrderedFieldErrors = () => {
    const errors = getFieldErrors();
    const fieldOrder = [
      "numero",
      "autor",
      "municipio",
      "uf",
      "cnpj",
      "programa",
      "objeto",
      "valor",
      "beneficiario",
      "banco",
      "agencia",
      "conta",
      "dataAprovacao",
      "dataOb",
      "inicioExecucao",
      "finalExecucao",
      "dataValidade",
      "acoesServicos",
    ];

    const orderedErrors = {};
    fieldOrder.forEach((field) => {
      if (errors[field]) orderedErrors[field] = errors[field];
    });

    Object.keys(errors).forEach((field) => {
      if (!orderedErrors[field]) orderedErrors[field] = errors[field];
    });

    return orderedErrors;
  };

  // ✅ FOCO INTELIGENTE EM ERROS
  const focusFirstErrorField = (fieldErrors) => {
    const errorFields = Object.keys(fieldErrors);

    for (const fieldName of errorFields) {
      const selectors = [
        `input[name="${fieldName}"]`,
        `select[name="${fieldName}"]`,
        `textarea[name="${fieldName}"]`,
        `input[type="date"][name="${fieldName}"]`,
        `[data-field="${fieldName}"]`,
        `#${fieldName}`,
      ];

      for (const selector of selectors) {
        const errorInput = document.querySelector(selector);
        if (errorInput && errorInput.offsetParent !== null) {
          if (errorInput.disabled || errorInput.readOnly) continue;

          errorInput.focus();
          errorInput.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });

          // Destaque visual
          const originalBoxShadow = errorInput.style.boxShadow;
          const originalBorder = errorInput.style.border;

          errorInput.style.transition = "all 0.3s ease";
          errorInput.style.boxShadow =
            "0 0 15px #dc3545, 0 0 25px rgba(220, 53, 69, 0.3)";
          errorInput.style.border = "2px solid #dc3545";

          setTimeout(() => {
            errorInput.style.boxShadow = originalBoxShadow;
            errorInput.style.border = originalBorder;
          }, 3000);

          return fieldName;
        }
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    return null;
  };

  // ✅ INICIALIZAÇÃO
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isEdicao && id) {
          const emendaDoc = await getDoc(doc(db, "emendas", id));

          if (!emendaDoc.exists()) {
            throw new Error("Emenda não encontrada");
          }

          const emendaData = emendaDoc.data();
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
            cnpj: emendaData.cnpj || "",
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
          if (user?.tipo === "operador" && user?.municipio && user?.uf) {
            setFormData((prev) => ({
              ...prev,
              municipio: user.municipio,
              uf: user.uf,
            }));
          }
        }

        setIsReady(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      inicializar();
    }
  }, [user, id, isEdicao]);

  // ✅ HANDLERS
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

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

  // 🚨 VALIDAÇÃO CRÍTICA - TODAS AS DATAS OBRIGATÓRIAS
  const criticalValidation = () => {
    const errors = [];

    // SEÇÃO IDENTIFICAÇÃO
    if (!formData.numero?.trim())
      errors.push("❌ CRÍTICO: Número da emenda obrigatório");
    if (!formData.autor?.trim())
      errors.push("❌ CRÍTICO: Parlamentar obrigatório");
    if (!formData.municipio?.trim())
      errors.push("❌ CRÍTICO: Município obrigatório");
    if (!formData.uf?.trim()) errors.push("❌ CRÍTICO: UF obrigatória");

    // SEÇÃO DADOS BÁSICOS
    if (!formData.programa?.trim())
      errors.push("❌ CRÍTICO: Programa obrigatório");
    // Validação crítica melhorada do objeto
    const objetoLimpo = formData.objeto?.toString().replace(/\s+/g, ' ').trim();
    if (!objetoLimpo || objetoLimpo.length < 3) {
      errors.push("❌ CRÍTICO: Objeto da Proposta obrigatório (mín. 3 caracteres)");
    }
    if (!formData.valor?.toString().trim())
      errors.push("❌ CRÍTICO: Valor do Recurso obrigatório");

    // SEÇÃO BENEFICIÁRIO
    if (!formData.beneficiario?.trim())
      errors.push("❌ CRÍTICO: Beneficiário obrigatório");

    // SEÇÃO DADOS BANCÁRIOS
    if (!formData.banco?.trim()) errors.push("❌ CRÍTICO: Banco obrigatório");
    if (!formData.agencia?.trim())
      errors.push("❌ CRÍTICO: Agência obrigatória");
    if (!formData.conta?.trim()) errors.push("❌ CRÍTICO: Conta obrigatória");

    // 🚨 SEÇÃO CRONOGRAMA - TODAS AS DATAS OBRIGATÓRIAS
    if (
      !formData.dataAprovacao?.trim() ||
      formData.dataAprovacao === "dd/mm/aaaa"
    ) {
      errors.push("❌ CRÍTICO: Data de Aprovação obrigatória");
    }
    if (!formData.dataOb?.trim() || formData.dataOb === "dd/mm/aaaa") {
      errors.push("❌ CRÍTICO: Data do OB obrigatória");
    }
    if (
      !formData.inicioExecucao?.trim() ||
      formData.inicioExecucao === "dd/mm/aaaa"
    ) {
      errors.push("❌ CRÍTICO: Data de Início da Execução obrigatória");
    }
    if (
      !formData.finalExecucao?.trim() ||
      formData.finalExecucao === "dd/mm/aaaa"
    ) {
      errors.push("❌ CRÍTICO: Data de Final da Execução obrigatória");
    }
    if (
      !formData.dataValidade?.trim() ||
      formData.dataValidade === "dd/mm/aaaa"
    ) {
      errors.push("❌ CRÍTICO: Data de Validade obrigatória");
    }

    // SEÇÃO AÇÕES E SERVIÇOS
    if (!formData.acoesServicos || formData.acoesServicos.length === 0) {
      errors.push("❌ CRÍTICO: Pelo menos uma meta deve ser cadastrada");
    } else {
      const hasValidMeta = formData.acoesServicos.some(
        (meta) => meta.descricao?.trim() && meta.quantidade > 0,
      );
      if (!hasValidMeta) {
        errors.push(
          "❌ CRÍTICO: Pelo menos uma meta válida deve ser preenchida",
        );
      }
    }

    // VALIDAÇÕES DE DATAS
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const parseDate = (dateString, fieldName) => {
      if (!dateString || !dateString.trim() || dateString === "dd/mm/aaaa")
        return null;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        errors.push(`❌ CRÍTICO: ${fieldName} com formato inválido`);
        return "INVALID";
      }
      return date;
    };

    const dataAprov = parseDate(formData.dataAprovacao, "Data de Aprovação");
    const dataOB = parseDate(formData.dataOb, "Data OB");
    const dataInicio = parseDate(formData.inicioExecucao, "Início da Execução");
    const dataFinal = parseDate(formData.finalExecucao, "Final da Execução");
    const dataVal = parseDate(formData.dataValidade, "Data de Validade");

    if (dataAprov && dataAprov !== "INVALID") {
      if (dataAprov > hoje)
        errors.push("❌ CRÍTICO: Data de Aprovação não pode ser futura");
      if (dataAprov.getFullYear() < 2020)
        errors.push(
          "❌ CRÍTICO: Data de Aprovação não pode ser anterior a 2020",
        );
    }

    if (dataVal && dataVal !== "INVALID") {
      if (dataVal <= hoje)
        errors.push("❌ CRÍTICO: Data de Validade deve ser futura");
      if (dataAprov && dataAprov !== "INVALID" && dataVal <= dataAprov) {
        errors.push(
          "❌ CRÍTICO: Data de Validade deve ser posterior à Data de Aprovação",
        );
      }
    }

    // Verificação de sequência cronológica
    if (
      dataAprov &&
      dataAprov !== "INVALID" &&
      dataOB &&
      dataOB !== "INVALID" &&
      dataInicio &&
      dataInicio !== "INVALID" &&
      dataFinal &&
      dataFinal !== "INVALID" &&
      dataVal &&
      dataVal !== "INVALID"
    ) {
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
          !errors.dataOb &&
          !errors.inicioExecucao &&
          !errors.finalExecucao &&
          !errors.dataValidade
        ) {
          errors.cronogramaGeral =
            "🚨 Sequência cronológica inválida: Aprovação ≤ OB ≤ Início ≤ Final ≤ Validade";
        }
      }
    }

    return errors;
  };

  // 💾 LÓGICA DE SALVAMENTO
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 ATUALIZAR DATA AUTOMATICAMENTE
    const dataAtual = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      dataUltimaAtualizacao: dataAtual,
    }));

    // VALIDAÇÃO COM FEEDBACK VISUAL
    const fieldErrorsResult = getOrderedFieldErrors();

    if (Object.keys(fieldErrorsResult).length > 0) {
      setFieldErrors(fieldErrorsResult);

      const errorList = Object.values(fieldErrorsResult);
      setToast({
        show: true,
        message: `🚨 CAMPOS OBRIGATÓRIOS FALTANDO:\n\n${errorList
          .slice(0, 8)
          .map((err) => `• ${err}`)
          .join(
            "\n",
          )}\n\n${errorList.length > 8 ? `\n... e mais ${errorList.length - 8} campos` : ""}\n\n⚠️ TODAS AS DATAS DO CRONOGRAMA SÃO OBRIGATÓRIAS.`,
        type: "error",
      });

      setTimeout(() => {
        focusFirstErrorField(fieldErrorsResult);
      }, 100);

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // VALIDAÇÃO CRÍTICA
    const criticalErrors = criticalValidation();
    if (criticalErrors.length > 0) {
      setToast({
        show: true,
        message: `🚨 ERRO CRÍTICO - Salvamento bloqueado:\n\n${criticalErrors.join("\n")}\n\n⚠️ Todas as datas do cronograma devem estar preenchidas.`,
        type: "error",
      });
      return;
    }

    setFieldErrors({});

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

      const dadosParaSalvar = {
        numero: formData.numero?.trim(),
        autor: formData.autor?.trim(),
        parlamentar: formData.autor?.trim(),
        municipio: formData.municipio?.trim(),
        uf: formData.uf?.trim(),
        cnpj: formData.cnpj?.trim(),
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
        // 🚨 TODAS AS DATAS OBRIGATÓRIAS
        dataAprovacao: formData.dataAprovacao?.trim(),
        dataOb: formData.dataOb?.trim(),
        inicioExecucao: formData.inicioExecucao?.trim(),
        finalExecucao: formData.finalExecucao?.trim(),
        dataValidade: formData.dataValidade?.trim(),
        numeroProposta: formData.numeroProposta?.trim(),
        funcional: formData.funcional?.trim(),
        acoesServicos: formData.acoesServicos || [],
        observacoes: formData.observacoes?.trim(),
        valorExecutado: 0,
        status: "Ativa",
        dataUltimaAtualizacao: dataAtual,
        atualizadoEm: serverTimestamp(),
        atualizadoPor: user.uid || user.email,
      };

      // VERIFICAÇÃO FINAL ABSOLUTA - TODAS AS DATAS
      const datasObrigatorias = [
        "dataAprovacao",
        "dataOb",
        "inicioExecucao",
        "finalExecucao",
        "dataValidade",
      ];

      const datasFaltando = datasObrigatorias.filter(
        (campo) => !dadosParaSalvar[campo],
      );

      if (datasFaltando.length > 0) {
        setToast({
          show: true,
          message: `🚨 ERRO CRÍTICO: Datas obrigatórias não preenchidas:\n\n${datasFaltando.map((d) => `• ${d}`).join("\n")}\n\n❌ TODAS as datas do cronograma são obrigatórias.`,
          type: "error",
        });
        setSalvando(false);
        return;
      }

      // SALVAR NO FIREBASE
      if (isEdicao) {
        await updateDoc(doc(db, "emendas", id), dadosParaSalvar);
        setToast({
          show: true,
          message:
            "✅ Emenda atualizada com sucesso! Todas as datas foram salvas.",
          type: "success",
        });
      } else {
        dadosParaSalvar.criadoEm = serverTimestamp();
        dadosParaSalvar.criadoPor = user.uid || user.email;
        await addDoc(collection(db, "emendas"), dadosParaSalvar);
        setToast({
          show: true,
          message:
            "✅ Emenda cadastrada com sucesso! Cronograma completo salvo.",
          type: "success",
        });
      }

      setTimeout(() => {
        navigate("/emendas", { replace: true });
      }, 800);
    } catch (error) {
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

  return {
    // Estados
    formData,
    setFormData,
    loading,
    saving,
    error,
    setError,
    isReady,
    salvando,
    toast,
    setToast,
    fieldErrors,
    setFieldErrors,
    expandedSections,
    hasUnsavedChanges,
    isEdicao,

    // Funções de validação
    getFieldErrors,
    getOrderedFieldErrors,
    focusFirstErrorField,
    clearFieldError,

    // Handlers
    handleInputChange,
    handleSubmit,
    toggleSection,
    buscarDadosFornecedor,

    // Utilitários
    criticalValidation,
  };
};