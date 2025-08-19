// src/hooks/useEmendaFormData.js - Estado e Lógica Completa
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

  // 🚨 VALIDAÇÕES ABSOLUTAS DE DATAS - ZERO TOLERÂNCIA
  const getFieldErrors = () => {
    const errors = {};
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // CAMPOS OBRIGATÓRIOS
    if (!formData.numero?.trim())
      errors.numero = "Número da emenda é obrigatório";
    if (!formData.autor?.trim()) errors.autor = "Parlamentar é obrigatório";
    if (!formData.municipio?.trim())
      errors.municipio = "Município é obrigatório";
    if (!formData.uf?.trim()) errors.uf = "UF é obrigatória";
    if (!formData.programa?.trim()) errors.programa = "Programa é obrigatório";
    if (!formData.objeto?.trim())
      errors.objeto = "Objeto da Proposta é obrigatório";
    if (!formData.beneficiario?.trim())
      errors.beneficiario = "Beneficiário (CNPJ) é obrigatório";
    if (!formData.valor?.toString().trim())
      errors.valor = "Valor do Recurso é obrigatório";

    // PARSING SEGURO DE DATAS
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

    // 🚨 VALIDAÇÕES CRÍTICAS DE DATAS
    // 1️⃣ DATA DE APROVAÇÃO - OBRIGATÓRIA
    if (!formData.dataAprovacao?.trim()) {
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

    // 2️⃣ DATA DE VALIDADE - OBRIGATÓRIA
    if (!formData.dataValidade?.trim()) {
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

    // 3️⃣ DATA OB - SE PREENCHIDA, VALIDAR
    if (formData.dataOb?.trim()) {
      if (dataOB === "INVALID") {
        errors.dataOb = "🚨 Data do OB inválida";
      } else {
        if (dataAprov && dataAprov !== "INVALID" && dataOB < dataAprov) {
          errors.dataOb =
            "🚨 Data do OB não pode ser anterior à Data de Aprovação";
        }
        if (dataInicio && dataInicio !== "INVALID" && dataOB > dataInicio) {
          errors.dataOb =
            "🚨 Data do OB deve ser anterior ou igual ao Início da Execução";
        }
        if (dataVal && dataVal !== "INVALID" && dataOB > dataVal) {
          errors.dataOb =
            "🚨 Data do OB não pode ser posterior à Data de Validade";
        }
      }
    }

    // 4️⃣ INÍCIO DA EXECUÇÃO - SE PREENCHIDA
    if (formData.inicioExecucao?.trim()) {
      if (dataInicio === "INVALID") {
        errors.inicioExecucao = "🚨 Data de Início de Execução inválida";
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
    }

    // 5️⃣ FINAL DA EXECUÇÃO - SE PREENCHIDA
    if (formData.finalExecucao?.trim()) {
      if (dataFinal === "INVALID") {
        errors.finalExecucao = "🚨 Data de Final de Execução inválida";
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
    }

    // VALIDAÇÕES DE CNPJ
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

    // VALIDAÇÃO DE VALOR
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
      "dataAprovacao",
      "dataOb",
      "dataValidade",
      "inicioExecucao",
      "finalExecucao",
      "beneficiario",
      "banco",
      "agencia",
      "conta",
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

  // 🚨 VALIDAÇÃO CRÍTICA ANTES DO FIREBASE
  const criticalValidation = () => {
    const errors = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

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
    const dataInicio = parseDate(formData.inicioExecucao, "Início da Execução");
    const dataFinal = parseDate(formData.finalExecucao, "Final da Execução");

    // VERIFICAÇÕES OBRIGATÓRIAS
    if (!formData.dataAprovacao)
      errors.push("❌ CRÍTICO: Data de Aprovação obrigatória");
    if (!formData.dataValidade)
      errors.push("❌ CRÍTICO: Data de Validade obrigatória");

    // VERIFICAÇÕES DE CONSISTÊNCIA
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

    // VERIFICAÇÕES ADICIONAIS DE SEQUÊNCIA
    if (dataOB && dataOB !== "INVALID") {
      if (dataAprov && dataAprov !== "INVALID" && dataOB < dataAprov) {
        errors.push(
          "❌ CRÍTICO: Data do OB não pode ser anterior à Data de Aprovação",
        );
      }
    }

    if (dataInicio && dataInicio !== "INVALID") {
      if (dataAprov && dataAprov !== "INVALID" && dataInicio < dataAprov) {
        errors.push(
          "❌ CRÍTICO: Início da Execução não pode ser anterior à Data de Aprovação",
        );
      }
      if (dataOB && dataOB !== "INVALID" && dataInicio < dataOB) {
        errors.push(
          "❌ CRÍTICO: Início da Execução deve ser posterior ou igual à Data do OB",
        );
      }
    }

    if (dataFinal && dataFinal !== "INVALID") {
      if (dataInicio && dataInicio !== "INVALID" && dataFinal <= dataInicio) {
        errors.push(
          "❌ CRÍTICO: Final da Execução deve ser posterior ao Início da Execução",
        );
      }
      if (dataVal && dataVal !== "INVALID" && dataFinal > dataVal) {
        errors.push(
          "❌ CRÍTICO: Final da Execução não pode ser posterior à Data de Validade",
        );
      }
    }

    return errors;
  };

  // 💾 LÓGICA DE SALVAMENTO
  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDAÇÃO COM FEEDBACK VISUAL
    const fieldErrorsResult = getOrderedFieldErrors();

    if (Object.keys(fieldErrorsResult).length > 0) {
      setFieldErrors(fieldErrorsResult);

      const errorList = Object.values(fieldErrorsResult);
      setToast({
        show: true,
        message: `🚨 Existem campos que precisam ser preenchidos corretamente:\n\n${errorList.map((err) => `• ${err}`).join("\n")}\n\n🔍 Os campos com erro estão destacados em vermelho.`,
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
        message: `🚨 ERRO CRÍTICO - Salvamento bloqueado:\n\n${criticalErrors.join("\n")}\n\n⚠️ O sistema não pode salvar emendas com datas inválidas.`,
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

      // VERIFICAÇÃO FINAL ABSOLUTA
      if (!dadosParaSalvar.dataAprovacao || !dadosParaSalvar.dataValidade) {
        setToast({
          show: true,
          message:
            "🚨 ERRO CRÍTICO: Não é possível salvar emenda sem Data de Aprovação e Data de Validade válidas.",
          type: "error",
        });
        setSalvando(false);
        return;
      }

      // VALIDAÇÕES FINAIS DE CONSISTÊNCIA
      const finalDataAprov = new Date(dadosParaSalvar.dataAprovacao);
      const finalDataVal = new Date(dadosParaSalvar.dataValidade);
      const finalHoje = new Date();
      finalHoje.setHours(0, 0, 0, 0);

      const finalErrors = [];
      if (isNaN(finalDataAprov.getTime()))
        finalErrors.push("Data de Aprovação inválida");
      if (isNaN(finalDataVal.getTime()))
        finalErrors.push("Data de Validade inválida");

      if (!isNaN(finalDataAprov.getTime()) && !isNaN(finalDataVal.getTime())) {
        if (finalDataVal <= finalDataAprov)
          finalErrors.push(
            "Data de Validade deve ser posterior à Data de Aprovação",
          );
        if (finalDataVal <= finalHoje)
          finalErrors.push("Data de Validade deve ser futura");
        if (finalDataAprov > finalHoje)
          finalErrors.push("Data de Aprovação não pode ser futura");
      }

      if (finalErrors.length > 0) {
        setToast({
          show: true,
          message: `🚨 ERRO CRÍTICO - Dados inconsistentes detectados:\n\n${finalErrors.map((err) => `• ${err}`).join("\n")}\n\n❌ Salvamento bloqueado para proteger a integridade dos dados.`,
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
          message: "✅ Emenda atualizada com sucesso!",
          type: "success",
        });
      } else {
        dadosParaSalvar.criadoEm = serverTimestamp();
        dadosParaSalvar.criadoPor = user.uid || user.email;
        await addDoc(collection(db, "emendas"), dadosParaSalvar);
        setToast({
          show: true,
          message: "✅ Emenda cadastrada com sucesso!",
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
