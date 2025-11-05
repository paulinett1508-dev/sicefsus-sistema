// src/hooks/useEmendaFormData.js - ARQUIVO COMPLETO OTIMIZADO
// ✅ CORREÇÕES: Re-renderização + Foco removido + Modal simples + Performance

import { useState, useEffect, useRef, useCallback } from "react";
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
    tipo: "Custeio PAP",
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

  // 🛡️ FUNÇÃO DE LIMPEZA UNIVERSAL - RESOLVE PROBLEMAS DE CARACTERES INVISÍVEIS
  const cleanField = useCallback((value) => {
    if (!value) return "";
    return value
      .toString()
      .replace(/\s+/g, " ") // Remove espaços múltiplos e caracteres invisíveis
      .trim() // Remove espaços das extremidades
      .replace(/\u00A0/g, " ") // Remove espaços não-quebráveis (nbsp)
      .replace(/\u200B/g, "") // Remove zero-width spaces
      .replace(/\u2003/g, " ") // Remove em-spaces
      .replace(/\u2002/g, " ") // Remove en-spaces
      .replace(/\u2009/g, " ") // Remove thin spaces
      .replace(/\uFEFF/g, ""); // Remove BOM (Byte Order Mark)
  }, []);

  // ✅ DETECÇÃO DE MUDANÇAS OTIMIZADA
  const isFormModified = useCallback(() => {
    const fieldsToCheck = ["autor", "municipio", "valor", "programa", "objeto"];
    return fieldsToCheck.some((field) => {
      const value = cleanField(formData[field]);
      return value && value.length > 0;
    });
  }, [formData, cleanField]);

  const hasUnsavedChanges = isFormModified();

  // 🚨 VALIDAÇÕES ABSOLUTAS - TODAS CORRIGIDAS COM MELHORIAS APLICADAS
  const getFieldErrors = useCallback(() => {
    const errors = {};
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // ✅ LOGS OTIMIZADOS: Menos verbose
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Validação executada - campos:", {
        objeto: formData.objeto?.length || 0,
        autor: formData.autor?.length || 0,
        numero: formData.numero?.length || 0,
      });
    }

    // ============================================
    // 🚨 SEÇÃO IDENTIFICAÇÃO - OBRIGATÓRIA
    // ============================================
    const numeroLimpo = cleanField(formData.numero);
    if (!numeroLimpo || numeroLimpo.length < 3) {
      errors.numero = numeroLimpo
        ? "🚨 Número da emenda deve ter pelo menos 3 caracteres"
        : "🚨 Número da emenda é obrigatório";
    }

    const autorLimpo = cleanField(formData.autor);
    if (!autorLimpo || autorLimpo.length < 3) {
      errors.autor = autorLimpo
        ? "🚨 Parlamentar deve ter pelo menos 3 caracteres"
        : "🚨 Parlamentar é obrigatório";
    }

    const municipioLimpo = cleanField(formData.municipio);
    if (!municipioLimpo || municipioLimpo.length < 2) {
      errors.municipio = municipioLimpo
        ? "🚨 Município deve ter pelo menos 2 caracteres"
        : "🚨 Município é obrigatório";
    }

    const ufLimpo = cleanField(formData.uf);
    if (!ufLimpo || ufLimpo.length !== 2) {
      errors.uf = ufLimpo
        ? "🚨 UF deve ter exatamente 2 caracteres"
        : "🚨 UF é obrigatória";
    }

    // ============================================
    // 🚨 SEÇÃO DADOS BÁSICOS - OBRIGATÓRIA
    // ============================================
    const programaLimpo = cleanField(formData.programa);
    if (!programaLimpo || programaLimpo.length < 5) {
      errors.programa = programaLimpo
        ? "🚨 Programa deve ter pelo menos 5 caracteres"
        : "🚨 Programa é obrigatório";
    }

    const objetoLimpo = cleanField(formData.objeto);
    if (!objetoLimpo || objetoLimpo.length < 10) {
      errors.objeto = objetoLimpo
        ? "🚨 Objeto da Proposta deve ter pelo menos 10 caracteres"
        : "🚨 Objeto da Proposta é obrigatório";
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
    const beneficiarioLimpo = cleanField(formData.beneficiario);
    if (!beneficiarioLimpo) {
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
    const bancoLimpo = cleanField(formData.banco);
    if (!bancoLimpo) {
      errors.banco = "🚨 Banco é obrigatório";
    } else {
      const bancoNumerico = bancoLimpo.replace(/\D/g, "");
      if (bancoNumerico.length !== 3) {
        errors.banco = "🚨 Código do banco deve ter exatamente 3 dígitos";
      }
    }

    const agenciaLimpa = cleanField(formData.agencia);
    if (!agenciaLimpa) {
      errors.agencia = "🚨 Agência é obrigatória";
    } else {
      const agenciaNumeros = agenciaLimpa.replace(/\D/g, "");
      if (agenciaNumeros.length < 4) {
        errors.agencia = "🚨 Agência deve ter pelo menos 4 dígitos";
      }
    }

    const contaLimpa = cleanField(formData.conta);
    if (!contaLimpa) {
      errors.conta = "🚨 Conta é obrigatória";
    } else {
      const contaNumeros = contaLimpa.replace(/\D/g, "");
      if (contaNumeros.length < 5) {
        errors.conta = "🚨 Conta deve ter pelo menos 5 dígitos";
      }
    }

    // ============================================
    // 🚨 SEÇÃO CRONOGRAMA - VALIDAÇÃO INTELIGENTE
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

    // ✅ MELHORIA 2: VALIDAÇÃO CRONOLÓGICA INTELIGENTE
    // Só valida sequência se TODAS as datas estiverem preenchidas
    const todasDatasPreenchidas =
      formData.dataAprovacao?.trim() &&
      formData.dataOb?.trim() &&
      formData.inicioExecucao?.trim() &&
      formData.finalExecucao?.trim() &&
      formData.dataValidade?.trim();

    if (todasDatasPreenchidas) {
      // 🚨 2️⃣ DATA OB - Validar apenas se todas as datas estão preenchidas
      if (dataOB === "INVALID") {
        errors.dataOb = "🚨 Data do OB inválida";
      } else if (dataOB) {
        if (dataAprov && dataAprov !== "INVALID" && dataOB < dataAprov) {
          errors.dataOb =
            "🚨 Data do OB não pode ser anterior à Data de Aprovação";
        }
        if (dataVal && dataVal !== "INVALID" && dataOB > dataVal) {
          errors.dataOb =
            "🚨 Data do OB não pode ser posterior à Data de Validade";
        }
      }

      // 🚨 3️⃣ INÍCIO DA EXECUÇÃO - Validar apenas se todas as datas estão preenchidas
      if (dataInicio === "INVALID") {
        errors.inicioExecucao = "🚨 Data de Início da Execução inválida";
      } else if (dataInicio) {
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

      // 🚨 4️⃣ FINAL DA EXECUÇÃO - Validar apenas se todas as datas estão preenchidas
      if (dataFinal === "INVALID") {
        errors.finalExecucao = "🚨 Data de Final da Execução inválida";
      } else if (dataFinal) {
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
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "⚠️ CRONOGRAMA: Validação de sequência pulada - nem todas as datas preenchidas",
        );
      }
    }

    // ============================================
    // ✅ MELHORIA 1: AÇÕES E SERVIÇOS - ARRAY VAZIO PERMITIDO NA CRIAÇÃO
    // ============================================

    // Se estamos em modo de edição OU formulário tem dados significativos preenchidos,
    // então validar Ações e Serviços
    const formularioAvancado =
      autorLimpo &&
      municipioLimpo &&
      programaLimpo &&
      objetoLimpo &&
      beneficiarioLimpo &&
      bancoLimpo &&
      agenciaLimpa &&
      contaLimpa;

    // ============================================
    // ✅ CORREÇÃO: AÇÕES E SERVIÇOS - ESTRUTURA CORRETA
    // ============================================
    if (isEdicao || formularioAvancado) {
      if (!formData.acoesServicos || formData.acoesServicos.length === 0) {
        errors.acoesServicos =
          "🚨 Pelo menos uma meta deve ser cadastrada em Ações e Serviços";
      } else {
        let hasValidMeta = false;

        formData.acoesServicos.forEach((meta, index) => {
          // ✅ CORRIGIDO: Validar apenas campos existentes (estrategia e valorAcao)
          const estrategiaLimpa = cleanField(meta.estrategia);
          const temValorValido =
            meta.valorAcao &&
            parseFloat(
              meta.valorAcao
                .replace(/[R$\s]/g, "")
                .replace(/\./g, "")
                .replace(",", "."),
            ) > 0;

          if (
            estrategiaLimpa &&
            estrategiaLimpa.length >= 5 &&
            temValorValido
          ) {
            hasValidMeta = true;
          } else {
            // Erros específicos
            if (!estrategiaLimpa || estrategiaLimpa.length < 5) {
              errors[`meta_${index}_estrategia`] =
                "🚨 Natureza de despesa deve ter pelo menos 5 caracteres";
            }
            if (!temValorValido) {
              errors[`meta_${index}_valor`] = "🚨 Valor é obrigatório";
            }
          }
        });

        if (!hasValidMeta) {
          errors.acoesServicos =
            '🚨 O campo "Valor" da Natureza de Despesas está em branco.';
        }
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "⚠️ AÇÕES E SERVIÇOS: Validação pulada - criação inicial permitida",
        );
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
  }, [formData, isEdicao, cleanField]);

  // ✅ ORDENAR ERROS POR PRIORIDADE
  const getOrderedFieldErrors = useCallback(() => {
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
  }, [getFieldErrors]);

  // 🚨 MODAL SIMPLES - SUBSTITUINDO FOCO INTELIGENTE
  const showSimpleErrorModal = useCallback((fieldErrors) => {
    const errorCount = Object.keys(fieldErrors).length;
    const errorList = Object.values(fieldErrors)
      .slice(0, 5)
      .map((err) => `• ${err.replace("🚨 ", "")}`)
      .join("\n");

    alert(
      `⚠️ FORMULÁRIO INCOMPLETO\n\n` +
        `${errorCount} campo(s) obrigatório(s):\n\n${errorList}\n\n` +
        `${errorCount > 5 ? `... e mais ${errorCount - 5} campos\n\n` : ""}` +
        `✅ Preencha os campos em vermelho e tente novamente.`,
    );
  }, []);

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

  // ✅ HANDLER PRINCIPAL OTIMIZADO
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // ✅ OTIMIZAÇÃO: Batch updates
      const updateStates = () => {
        // 📄 Atualizar formData
        setFormData((prev) => {
          // ✅ OTIMIZAÇÃO: Só atualizar se valor realmente mudou
          if (prev[name] === value) return prev;

          return {
            ...prev,
            [name]: value,
          };
        });

        // 🧹 Limpeza de erros OTIMIZADA
        setFieldErrors((prev) => {
          // ✅ OTIMIZAÇÃO: Só limpar se erro existir
          if (!prev[name]) return prev;

          const newErrors = { ...prev };
          delete newErrors[name];

          // Limpeza condicional de erros relacionados
          const cleanValue = cleanField(value);
          if (cleanValue && cleanValue.length > 0) {
            // Remove erros relacionados
            const relatedFields = {
              autor: ["autor"],
              objeto: ["objeto"],
              valor: ["valor"],
              programa: ["programa"],
              numero: ["numero"],
              municipio: ["municipio"],
              uf: ["uf"],
            };

            if (relatedFields[name]) {
              relatedFields[name].forEach((field) => {
                delete newErrors[field];
              });
            }
          }

          return newErrors;
        });
      };

      updateStates();

      // ✅ LOGS OTIMIZADOS: Menos verbose
      if (
        process.env.NODE_ENV === "development" &&
        ["objeto", "autor", "numero", "valor"].includes(name)
      ) {
        console.log(`📄 Campo ${name} alterado para: "${value}"`);
      }
    },
    [cleanField],
  );

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const toggleSection = useCallback((sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  }, []);

  const buscarDadosFornecedor = useCallback(async (cnpj) => {
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
  }, []);

  // 🚨 VALIDAÇÃO CRÍTICA - CORRIGIDA COM LIMPEZA UNIVERSAL
  const criticalValidation = useCallback(() => {
    const errors = [];

    // SEÇÃO IDENTIFICAÇÃO - LIMPEZA APLICADA
    const numeroLimpo = cleanField(formData.numero);
    if (!numeroLimpo || numeroLimpo.length < 3)
      errors.push(
        "❌ CRÍTICO: Número da emenda obrigatório (mín. 3 caracteres)",
      );

    const autorLimpo = cleanField(formData.autor);
    if (!autorLimpo || autorLimpo.length < 3)
      errors.push("❌ CRÍTICO: Parlamentar obrigatório (mín. 3 caracteres)");

    const municipioLimpo = cleanField(formData.municipio);
    if (!municipioLimpo || municipioLimpo.length < 2)
      errors.push("❌ CRÍTICO: Município obrigatório (mín. 2 caracteres)");

    const ufLimpo = cleanField(formData.uf);
    if (!ufLimpo || ufLimpo.length !== 2)
      errors.push("❌ CRÍTICO: UF obrigatória (exatos 2 caracteres)");

    // SEÇÃO DADOS BÁSICOS - LIMPEZA APLICADA
    const programaLimpo = cleanField(formData.programa);
    if (!programaLimpo || programaLimpo.length < 5)
      errors.push("❌ CRÍTICO: Programa obrigatório (mín. 5 caracteres)");

    const objetoLimpo = cleanField(formData.objeto);
    if (!objetoLimpo || objetoLimpo.length < 10)
      errors.push(
        "❌ CRÍTICO: Objeto da Proposta obrigatório (mín. 10 caracteres)",
      );

    if (!formData.valor?.toString().trim())
      errors.push("❌ CRÍTICO: Valor do Recurso obrigatório");

    // SEÇÃO BENEFICIÁRIO - LIMPEZA APLICADA
    const beneficiarioLimpo = cleanField(formData.beneficiario);
    if (!beneficiarioLimpo) errors.push("❌ CRÍTICO: Beneficiário obrigatório");

    // SEÇÃO DADOS BANCÁRIOS - LIMPEZA APLICADA
    const bancoLimpo = cleanField(formData.banco);
    if (!bancoLimpo) errors.push("❌ CRÍTICO: Banco obrigatório");

    const agenciaLimpa = cleanField(formData.agencia);
    if (!agenciaLimpa) errors.push("❌ CRÍTICO: Agência obrigatória");

    const contaLimpa = cleanField(formData.conta);
    if (!contaLimpa) errors.push("❌ CRÍTICO: Conta obrigatória");

    // ✅ MELHORIA APLICADA: SÓ VALIDA CRONOGRAMA SE FOR EDIÇÃO OU FORMULÁRIO AVANÇADO
    const formularioAvancado =
      autorLimpo &&
      municipioLimpo &&
      programaLimpo &&
      objetoLimpo &&
      beneficiarioLimpo &&
      bancoLimpo &&
      agenciaLimpa &&
      contaLimpa;

    if (isEdicao || formularioAvancado) {
      // 🚨 SEÇÃO CRONOGRAMA - APENAS SE NECESSÁRIO
      if (
        !formData.dataAprovacao?.trim() ||
        formData.dataAprovacao === "dd/mm/aaaa"
      ) {
        errors.push("❌ CRÍTICO: Data de Aprovação obrigatória");
      }
      if (
        !formData.dataValidade?.trim() ||
        formData.dataValidade === "dd/mm/aaaa"
      ) {
        errors.push("❌ CRÍTICO: Data de Validade obrigatória");
      }

      // ✅ MELHORIA APLICADA: SÓ VALIDA AÇÕES E SERVIÇOS SE NECESSÁRIO
      if (!formData.acoesServicos || formData.acoesServicos.length === 0) {
        errors.push("❌ CRÍTICO: Pelo menos uma meta deve ser cadastrada");
      } else {
        const hasValidMeta = formData.acoesServicos.some((meta) => {
          const descricaoLimpa = cleanField(meta.estrategia);
          const temValorValido =
            meta.valorAcao &&
            parseFloat(
              meta.valorAcao
                .replace(/[R$\s]/g, "")
                .replace(/\./g, "")
                .replace(",", "."),
            ) > 0;

          return descricaoLimpa && descricaoLimpa.length >= 5 && temValorValido;
        });
        if (!hasValidMeta) {
          errors.push(
            "❌ CRÍTICO: Pelo menos uma meta válida deve ser preenchida (mín. 5 caracteres)",
          );
        }
      }
    }

    return errors;
  }, [formData, isEdicao, cleanField]);

  // 💾 LÓGICA DE SALVAMENTO - FOCO REMOVIDO + MODAL SIMPLES
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // 🚨 ATUALIZAR DATA AUTOMATICAMENTE
      const dataAtual = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        dataUltimaAtualizacao: dataAtual,
      }));

      // VALIDAÇÃO COM MODAL SIMPLES
      const fieldErrorsResult = getOrderedFieldErrors();

      if (Object.keys(fieldErrorsResult).length > 0) {
        setFieldErrors(fieldErrorsResult);

        // 🚨 MODAL SIMPLES - SEM FOCO NEM SCROLL
        showSimpleErrorModal(fieldErrorsResult);
        return;
      }

      // VALIDAÇÃO CRÍTICA
      const criticalErrors = criticalValidation();
      if (criticalErrors.length > 0) {
        setToast({
          show: true,
          message: `🚨 ERRO CRÍTICO - Salvamento bloqueado:\n\n${criticalErrors.join("\n")}\n\n✅ Sistema com melhorias aplicadas.`,
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
          numero: cleanField(formData.numero),
          autor: cleanField(formData.autor),
          parlamentar: cleanField(formData.autor),
          municipio: cleanField(formData.municipio),
          uf: cleanField(formData.uf),
          cnpj: cleanField(formData.cnpj),
          valor: valorNumerico,
          valorRecurso: valorNumerico,
          programa: cleanField(formData.programa),
          beneficiario: cleanField(formData.beneficiario),
          cnpjBeneficiario: cleanField(formData.cnpjBeneficiario),
          tipo: formData.tipo,
          modalidade: cleanField(formData.modalidade),
          objeto: cleanField(formData.objeto),
          banco: cleanField(formData.banco),
          agencia: cleanField(formData.agencia),
          conta: cleanField(formData.conta),
          // ✅ DATAS OPCIONAIS NA CRIAÇÃO INICIAL
          dataAprovacao: formData.dataAprovacao?.trim() || null,
          dataOb: formData.dataOb?.trim() || null,
          inicioExecucao: formData.inicioExecucao?.trim() || null,
          finalExecucao: formData.finalExecucao?.trim() || null,
          dataValidade: formData.dataValidade?.trim() || null,
          numeroProposta: cleanField(formData.numeroProposta),
          funcional: cleanField(formData.funcional),
          acoesServicos: formData.acoesServicos || [],
          observacoes: cleanField(formData.observacoes),
          valorExecutado: 0,
          status: "Ativa",
          dataUltimaAtualizacao: dataAtual,
          atualizadoEm: serverTimestamp(),
          atualizadoPor: user.uid || user.email,
        };

        // SALVAR NO FIREBASE
        if (isEdicao) {
          await updateDoc(doc(db, "emendas", id), dadosParaSalvar);
          setToast({
            show: true,
            message:
              "✅ Emenda atualizada com sucesso! Melhorias aplicadas funcionando.",
            type: "success",
          });
        } else {
          dadosParaSalvar.criadoEm = serverTimestamp();
          dadosParaSalvar.criadoPor = user.uid || user.email;
          await addDoc(collection(db, "emendas"), dadosParaSalvar);
          setToast({
            show: true,
            message:
              "✅ Emenda cadastrada com sucesso! Sistema com melhorias implementadas.",
            type: "success",
          });
        }

        setTimeout(() => {
          // 🔧 CRÍTICO: Não navegar automaticamente
          // Deixar o componente decidir quando navegar
          console.log("✅ Emenda salva com sucesso");
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
    },
    [
      formData,
      getOrderedFieldErrors,
      showSimpleErrorModal,
      criticalValidation,
      cleanField,
      salvando,
      isEdicao,
      id,
      user,
      navigate,
    ],
  );

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
    // focusFirstErrorField, // 🚨 REMOVIDO COMPLETAMENTE
    clearFieldError,
    cleanField,

    // Handlers
    handleInputChange,
    handleSubmit,
    toggleSection,
    buscarDadosFornecedor,

    // Utilitários
    criticalValidation,
  };
};
