// src/hooks/useEmendaFormData.js - ARQUIVO COMPLETO OTIMIZADO
// ✅ CORREÇÕES: Re-renderização + Foco removido + Modal simples + Performance
// ✅ NOVA CORREÇÃO: Planejamento de Despesas (acoesServicos) OPCIONAL

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
    } else if (dataAprov > hoje) {
      errors.dataAprovacao = "🚨 Data de Aprovação não pode ser futura";
    }

    // 🚨 2️⃣ DATA DE VALIDADE - OBRIGATÓRIA
    if (
      !formData.dataValidade?.trim() ||
      formData.dataValidade === "dd/mm/aaaa"
    ) {
      errors.dataValidade = "🚨 Data de Validade é obrigatória";
    } else if (dataVal === "INVALID") {
      errors.dataValidade = "🚨 Data de Validade inválida";
    } else if (dataAprov && dataVal && dataVal < dataAprov) {
      errors.dataValidade =
        "🚨 Data de Validade deve ser posterior à Data de Aprovação";
    }

    // ✅ 3️⃣ DATA OB - OPCIONAL, MAS SE PREENCHIDA VALIDA
    if (formData.dataOb?.trim() && formData.dataOb !== "dd/mm/aaaa") {
      if (dataOB === "INVALID") {
        errors.dataOb = "🚨 Data OB inválida";
      } else if (dataAprov && dataOB && dataOB < dataAprov) {
        errors.dataOb = "🚨 Data OB deve ser posterior à Data de Aprovação";
      }
    }

    // ✅ 4️⃣ INÍCIO DA EXECUÇÃO - OPCIONAL, MAS SE PREENCHIDA VALIDA
    if (
      formData.inicioExecucao?.trim() &&
      formData.inicioExecucao !== "dd/mm/aaaa"
    ) {
      if (dataInicio === "INVALID") {
        errors.inicioExecucao = "🚨 Data de Início inválida";
      } else if (dataAprov && dataInicio && dataInicio < dataAprov) {
        errors.inicioExecucao =
          "🚨 Início da Execução deve ser posterior à Aprovação";
      } else if (dataOB && dataInicio && dataInicio < dataOB) {
        errors.inicioExecucao =
          "🚨 Início da Execução deve ser posterior à Data OB";
      }
    }

    // ✅ 5️⃣ FINAL DA EXECUÇÃO - OPCIONAL, MAS SE PREENCHIDA VALIDA
    if (
      formData.finalExecucao?.trim() &&
      formData.finalExecucao !== "dd/mm/aaaa"
    ) {
      if (dataFinal === "INVALID") {
        errors.finalExecucao = "🚨 Data Final inválida";
      } else if (dataInicio && dataFinal && dataFinal < dataInicio) {
        errors.finalExecucao =
          "🚨 Final da Execução deve ser posterior ao Início";
      } else if (dataVal && dataFinal && dataFinal > dataVal) {
        errors.finalExecucao =
          "🚨 Final da Execução não pode ultrapassar a Data de Validade";
      }
    }

    // ✅ MELHORIA APLICADA: Validação completa de acoesServicos agora é OPCIONAL
    // O componente AcoesServicos.jsx já valida individualmente ao adicionar metas
    // Não precisa mais forçar ter pelo menos uma meta cadastrada

    return errors;
  }, [formData, cleanField]);

  // ✅ ORDENAÇÃO DOS ERROS POR SEÇÃO
  const getOrderedFieldErrors = useCallback(() => {
    const fieldErrorsResult = getFieldErrors();

    const sectionOrder = [
      "numero",
      "autor",
      "municipio",
      "uf",
      "programa",
      "objeto",
      "valor",
      "beneficiario",
      "banco",
      "agencia",
      "conta",
      "dataAprovacao",
      "dataValidade",
      "dataOb",
      "inicioExecucao",
      "finalExecucao",
      "acoesServicos",
    ];

    return Object.keys(fieldErrorsResult)
      .sort((a, b) => {
        const indexA = sectionOrder.indexOf(a);
        const indexB = sectionOrder.indexOf(b);
        return indexA - indexB;
      })
      .reduce((acc, key) => {
        acc[key] = fieldErrorsResult[key];
        return acc;
      }, {});
  }, [getFieldErrors]);

  // 🚨 MODAL SIMPLES DE ERRO - SEM FOCO NEM SCROLL
  const showSimpleErrorModal = useCallback((errors) => {
    const firstError = Object.entries(errors)[0];
    if (!firstError) return;

    const [field, message] = firstError;
    const errorCount = Object.keys(errors).length;

    let modalMessage = `🚨 FORMULÁRIO INCOMPLETO\n\n${errorCount} campo(s) obrigatório(s):\n`;

    Object.entries(errors).forEach(([key, msg]) => {
      modalMessage += `• ${msg.replace("🚨 ", "")}\n`;
    });

    modalMessage +=
      "\n⚠️ Preencha os campos em vermelho e tente novamente.\n\n✅ Sistema com melhorias aplicadas.";

    alert(modalMessage);
  }, []);

  // ✅ LIMPEZA DE ERRO DE CAMPO ESPECÍFICO
  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // 🔄 HANDLERS
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // 🔍 BUSCAR DADOS DO FORNECEDOR (CNPJ)
  const buscarDadosFornecedor = useCallback(
    async (cnpj) => {
      const cnpjLimpo = limparCNPJ(cnpj);

      if (cnpjLimpo.length !== 14) {
        return { error: "CNPJ deve ter 14 dígitos" };
      }

      if (!validarCNPJ(cnpj)) {
        return { error: "CNPJ inválido" };
      }

      try {
        const response = await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
        );

        if (!response.ok) {
          return { error: "CNPJ não encontrado na Receita Federal" };
        }

        const data = await response.json();
        return {
          success: true,
          razaoSocial: data.razao_social || data.nome_fantasia,
          nomeFantasia: data.nome_fantasia,
        };
      } catch (error) {
        return { error: "Erro ao consultar CNPJ. Verifique sua conexão." };
      }
    },
    [validarCNPJ, limparCNPJ],
  );

  // 🔄 CARREGAR DADOS DA EMENDA (SE EDIÇÃO)
  useEffect(() => {
    if (!id) {
      setIsReady(true);
      return;
    }

    const carregarEmenda = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "emendas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setFormData({
            numero: data.numero || "",
            autor: data.autor || data.parlamentar || "",
            municipio: data.municipio || "",
            uf: data.uf || "",
            cnpj: data.cnpj || "",
            valor:
              data.valor?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }) || "",
            valorRecurso:
              data.valorRecurso?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }) || "",
            programa: data.programa || "",
            beneficiario: data.beneficiario || "",
            cnpjBeneficiario: data.cnpjBeneficiario || "",
            tipo: data.tipo || "Custeio PAP",
            modalidade: data.modalidade || "",
            objeto: data.objeto || "",
            banco: data.banco || "",
            agencia: data.agencia || "",
            conta: data.conta || "",
            dataAprovacao: data.dataAprovacao || "",
            dataValidade: data.dataValidade || "",
            inicioExecucao: data.inicioExecucao || "",
            finalExecucao: data.finalExecucao || "",
            numeroProposta: data.numeroProposta || "",
            funcional: data.funcional || "",
            dataOb: data.dataOb || "",
            dataUltimaAtualizacao:
              data.dataUltimaAtualizacao ||
              new Date().toISOString().split("T")[0],
            acoesServicos: data.acoesServicos || [],
            observacoes: data.observacoes || "",
          });

          setIsReady(true);
        } else {
          setError("Emenda não encontrada");
          navigate("/emendas");
        }
      } catch (error) {
        setError("Erro ao carregar emenda: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    carregarEmenda();

    return () => {
      mountedRef.current = false;
    };
  }, [id, navigate]);

  // 🚨 VALIDAÇÃO CRÍTICA ANTES DE SALVAR
  const criticalValidation = useCallback(() => {
    const errors = [];

    // SEÇÃO IDENTIFICAÇÃO - LIMPEZA APLICADA
    const numeroLimpo = cleanField(formData.numero);
    if (!numeroLimpo || numeroLimpo.length < 3)
      errors.push("❌ CRÍTICO: Número da emenda obrigatório (mín. 3 chars)");

    const autorLimpo = cleanField(formData.autor);
    if (!autorLimpo || autorLimpo.length < 3)
      errors.push("❌ CRÍTICO: Parlamentar obrigatório (mín. 3 chars)");

    const municipioLimpo = cleanField(formData.municipio);
    if (!municipioLimpo || municipioLimpo.length < 2)
      errors.push("❌ CRÍTICO: Município obrigatório (mín. 2 chars)");

    const ufLimpo = cleanField(formData.uf);
    if (!ufLimpo || ufLimpo.length !== 2)
      errors.push("❌ CRÍTICO: UF obrigatória (exatos 2 chars)");

    // SEÇÃO DADOS BÁSICOS - LIMPEZA APLICADA
    const programaLimpo = cleanField(formData.programa);
    if (!programaLimpo || programaLimpo.length < 5)
      errors.push("❌ CRÍTICO: Programa obrigatório (mín. 5 chars)");

    const objetoLimpo = cleanField(formData.objeto);
    if (!objetoLimpo || objetoLimpo.length < 10)
      errors.push("❌ CRÍTICO: Objeto obrigatório (mín. 10 chars)");

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

      // ✅ VALIDAÇÃO DE AÇÕES E SERVIÇOS REMOVIDA - AGORA É OPCIONAL
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
        let emendaId = id; // Para edição

        if (isEdicao) {
          await updateDoc(doc(db, "emendas", id), dadosParaSalvar);
          setToast({
            show: true,
            message: "✅ Emenda atualizada com sucesso!",
            type: "success",
          });

          // 🔄 EDIÇÃO: NÃO navegar, deixar usuário na emenda
          // Apenas mostra toast de sucesso
        } else {
          // 🆕 CRIAÇÃO: Salvar e perguntar sobre primeira despesa
          dadosParaSalvar.criadoEm = serverTimestamp();
          dadosParaSalvar.criadoPor = user.uid || user.email;
          const docRef = await addDoc(
            collection(db, "emendas"),
            dadosParaSalvar,
          );
          emendaId = docRef.id; // Capturar ID da nova emenda

          setToast({
            show: true,
            message: "✅ Emenda cadastrada com sucesso!",
            type: "success",
          });

          // 🎯 MODAL BONITO CUSTOMIZADO
          setTimeout(() => {
            // Criar modal customizado no DOM
            const modalOverlay = document.createElement("div");
            modalOverlay.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              animation: fadeIn 0.2s ease;
            `;

            const modalBox = document.createElement("div");
            modalBox.style.cssText = `
              background: white;
              border-radius: 12px;
              padding: 30px;
              max-width: 450px;
              width: 90%;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              animation: slideUp 0.3s ease;
            `;

            modalBox.innerHTML = `
              <style>
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes slideUp {
                  from { transform: translateY(30px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
              </style>
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                <h2 style="color: #154360; margin: 0 0 12px 0; font-size: 22px; font-weight: 600;">
                  Emenda Cadastrada!
                </h2>
                <p style="color: #666; margin: 0 0 24px 0; font-size: 15px; line-height: 1.5;">
                  Deseja cadastrar a primeira despesa desta emenda agora?
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                  <button id="modal-nao" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 6px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                  ">
                    Não, voltar
                  </button>
                  <button id="modal-sim" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 6px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                  ">
                    Sim, cadastrar
                  </button>
                </div>
              </div>
            `;

            modalOverlay.appendChild(modalBox);
            document.body.appendChild(modalOverlay);

            // Efeitos hover
            const btnSim = document.getElementById("modal-sim");
            const btnNao = document.getElementById("modal-nao");

            btnSim.onmouseover = () => (btnSim.style.background = "#218838");
            btnSim.onmouseout = () => (btnSim.style.background = "#28a745");

            btnNao.onmouseover = () => (btnNao.style.background = "#5a6268");
            btnNao.onmouseout = () => (btnNao.style.background = "#6c757d");

            // Handlers dos botões
            btnSim.onclick = () => {
              document.body.removeChild(modalOverlay);
              // ✅ USAR NAVIGATE DO REACT ROUTER
              // Replace: true força recarga da rota mesmo se for a mesma
              navigate(`/emendas/${emendaId}`, {
                replace: true,
                state: { activeTab: "execucao" },
              });
            };

            btnNao.onclick = () => {
              document.body.removeChild(modalOverlay);
              navigate("/emendas");
            };

            // Fechar ao clicar fora
            modalOverlay.onclick = (e) => {
              if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
                navigate("/emendas");
              }
            };
          }, 1000);
        }
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
