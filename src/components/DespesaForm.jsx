// src/components/DespesaForm.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  serverTimestamp,
  deleteDoc, // Import deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { recalcularSaldoEmenda } from "../utils/emendaCalculos"; // ✅ RECÁLCULO AUTOMÁTICO

// ✅ HELPERS PARA VALIDAÇÃO DE BOTÕES
const pick = (obj, keys) => {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

// parse seguro de BRL -> número (usa fallback se vier string)
const parseBRL = (v) => {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const s = String(v)
    .replace(/\s/g, "")
    .replace(/\./g, "") // remove separador de milhar
    .replace(",", ".") // vírgula -> ponto
    .replace(/[^\d.-]/g, ""); // remove qualquer coisa não numérica
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// ✅ COMPONENTES MODULARES EXISTENTES REUTILIZADOS
import DespesaFormHeader from "./despesa/DespesaFormHeader";
import DespesaFormBanners from "./despesa/DespesaFormBanners";
import DespesaFormEmendaInfo from "./despesa/DespesaFormEmendaInfo";
import DespesaFormBasicFields from "./despesa/DespesaFormBasicFields";
import DespesaFormEmpenhoFields from "./despesa/DespesaFormEmpenhoFields";
import DespesaFormDateFields from "./despesa/DespesaFormDateFields";
import DespesaFormClassificacaoFuncional from "./despesa/DespesaFormClassificacaoFuncional"; // ✅ NOVO COMPONENTE UNIFICADO

// Importações de modal removidas

// ✅ HOOKS E UTILS EXISTENTES REUTILIZADOS
import Toast from "./Toast";
import LoadingOverlay from "./LoadingOverlay";
import {
  useMoedaFormatting,
  parseValorMonetario,
  formatarMoedaDisplay,
  formatarMoedaInput,
} from "../utils/formatters";

const DespesaForm = ({
  usuario,
  despesaParaEditar,
  onCancelar,
  onSalvar,
  modoVisualizacao = false,
  emendasDisponiveis = [],
  emendaPreSelecionada = null,
  emendaInfo = null,
  isPrimeiraDespesa = false,
  titulo = null,
  subtitle = null,
  emendaId = null,
  onSuccess,
  hideHeader = false, // 🆕 Nova prop para esconder header redundante no modal
  modoExecucao = false, // ✅ NOVA PROP: Indica se está executando uma despesa planejada
}) => {
  // ✅ DETECTAR MODO DE OPERAÇÃO
  const isExecucao = modoExecucao === true;
  const isEdicao = !isExecucao && despesaParaEditar?.id;

  console.log("🔍 DespesaForm - Modo:", {
    modoExecucao,
    isExecucao,
    isEdicao,
    despesaId: despesaParaEditar?.id,
    status: despesaParaEditar?.status,
  });

  // ✅ HOOKS REUTILIZADOS
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  // ✅ DADOS DO USUÁRIO SIMPLIFICADOS
  const userRole = usuario?.role || usuario?.tipo;
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  // ✅ ESTADO DO FORMULÁRIO (ESSENCIAL)
  const [formData, setFormData] = useState({
    emendaId: emendaPreSelecionada || emendaId || "",
    discriminacao: "",
    fornecedor: "",
    valor: "",
    numeroEmpenho: "",
    numeroNota: "",
    dataEmpenho: "",
    dataLiquidacao: "",
    dataPagamento: "",
    acao: "",
    classificacaoFuncional: "",
    numeroContrato: "",
    categoria: "",
    descricao: "",
    observacoes: "",
    status: "PLANEJADA",
    statusPagamento: "pendente",
    naturezaDespesa: "3.3.9.0.30 – Material de Despesa",
    elementoDespesa: "3.3.90.30.99 - Outros Materiais de Consumo",
    fonteRecurso: "",
    programaTrabalho: "",
    planoInterno: "",
    contrapartida: 0,
    percentualExecucao: 0,
    etapaExecucao: "",
    coordenadasGeograficas: "",
    populacaoBeneficiada: "",
    impactoSocial: "",
    cnpjFornecedor: "",
    nomeFantasia: "",
    enderecoFornecedor: "",
    cidadeUf: "",
    cep: "",
    telefoneFornecedor: "",
    emailFornecedor: "",
    situacaoCadastral: "",
    dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [emendas, setEmendas] = useState(emendasDisponiveis);
  const [emendaData, setEmendaData] = useState(emendaInfo);
  const [emendaInfoDinamica, setEmendaInfoDinamica] = useState(emendaInfo);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [valorExcedeSaldo, setValorExcedeSaldo] = useState(false); // ✅ NOVO: Controla se valor excede saldo

  // ✅ Função para converter datas de forma segura
  const convertToDateString = (dateValue) => {
    if (!dateValue) return "";

    try {
      // Se é Timestamp do Firebase (tem .seconds)
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toISOString().split("T")[0];
      }

      // Se já é string ISO ou data válida
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      return "";
    } catch (error) {
      console.warn("⚠️ Erro ao converter data:", dateValue, error);
      return "";
    }
  };

  // ✅ CONFIGURAÇÃO DE MODO SIMPLIFICADA
  const configModo = useMemo(() => {
    if (modoVisualizacao) return { modo: "visualizar", readOnly: true };
    if (isExecucao) return { modo: "executar", readOnly: false }; // Ajustado para modo de execução
    if (despesaParaEditar) return { modo: "editar", readOnly: false };
    return { modo: "criar", readOnly: false };
  }, [modoVisualizacao, despesaParaEditar, isExecucao]); // Adicionado isExecucao

  // ✅ CARREGAR EMENDAS COM FILTRO POR MUNICÍPIO
  const carregarEmendas = useCallback(async () => {
    try {
      console.log("🔍 Carregando emendas com filtro por município...");

      let q;
      if (userRole === "admin") {
        q = query(collection(db, "emendas"));
      } else if (
        (userRole === "operador" || userRole === "user") &&
        userMunicipio
      ) {
        q = query(
          collection(db, "emendas"),
          where("municipio", "==", userMunicipio),
        );
      } else {
        setEmendas([]);
        setToast({
          show: true,
          message: "Configuração de usuário incompleta.",
          type: "error",
        });
        return;
      }

      const querySnapshot = await getDocs(q);
      const emendasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmendas(emendasData);
    } catch (error) {
      console.error("Erro ao carregar emendas:", error);
      setToast({
        show: true,
        message: "Erro ao carregar emendas disponíveis",
        type: "error",
      });
    }
  }, [userRole, userMunicipio]);

  // ✅ CARREGAR INFORMAÇÕES DA EMENDA + SALDO/EXECUÇÃO
  const carregarDadosEmenda = useCallback(async (emendaId) => {
    if (!emendaId) return; // Sai se não houver emendaId
    setLoading(true);
    try {
      const emendaRef = doc(db, "emendas", emendaId);
      const emendaDoc = await getDoc(emendaRef);

      if (emendaDoc.exists()) {
        const emendaData = { id: emendaDoc.id, ...emendaDoc.data() };

        // Calcular saldo disponível
        const despesasQuery = query(
          collection(db, "despesas"),
          where("emendaId", "==", emendaId),
        );
        const despesasSnapshot = await getDocs(despesasQuery);

        const totalExecutado = despesasSnapshot.docs.reduce((total, doc) => {
          const despesa = doc.data();
          return total + (parseFloat(despesa.valor) || 0);
        }, 0);

        const saldoDisponivel =
          (parseFloat(emendaData.valor) || 0) - totalExecutado;

        const emendaCompleta = {
          ...emendaData,
          saldoDisponivel,
          totalExecutado,
          percentualExecucao:
            emendaData.valor > 0
              ? (totalExecutado / emendaData.valor) * 100
              : 0,
        };

        setEmendaData(emendaCompleta);
        setEmendaInfoDinamica(emendaCompleta);
      } else {
        setEmendaData(null);
        setEmendaInfoDinamica(null);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da emenda:", error);
      setToast({
        show: true,
        message: "Erro ao carregar informações da emenda",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ SETUP/UNMOUNT
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ SINCRONIZAR EMENDA PRE-SELECIONADA
  useEffect(() => {
    // 1. Se tem emenda pré-selecionada com info, usa direto
    if (emendaPreSelecionada && emendaInfo) {
      setEmendaInfoDinamica(emendaInfo);
      return;
    }

    // 2. Se tem emendaId no formData, SEMPRE carregar (criar OU editar)
    if (formData.emendaId) {
      carregarDadosEmenda(formData.emendaId);
    }
  }, [
    formData.emendaId,
    emendaPreSelecionada,
    emendaInfo,
    carregarDadosEmenda,
  ]);

  // ✅ CARREGAR EMENDAS DISPONÍVEIS (criar nova despesa sem emenda pré-selecionada)
  useEffect(() => {
    if (!emendaPreSelecionada && !emendaId && emendas.length === 0) {
      carregarEmendas();
    }
  }, [emendaPreSelecionada, emendaId, emendas.length, carregarEmendas]);

  // ✅ CARREGAR DADOS DA DESPESA PARA EDITAR OU EXECUTAR
  useEffect(() => {
    if (despesaParaEditar) {
      console.log("🔍 DEBUG: Carregando Despesa para Edição/Execução");
      console.log("despesaParaEditar recebida:", despesaParaEditar);

      setFormData((prevFormData) => {
        const updatedFormData = {
          ...prevFormData,
          emendaId: despesaParaEditar.emendaId || emendaId || "",
          naturezaDespesa:
            despesaParaEditar.estrategia ||
            despesaParaEditar.naturezaDespesa ||
            "3.3.9.0.30 – Material de Despesa",
          valor:
            despesaParaEditar.valor != null
              ? formatarMoedaInput((despesaParaEditar.valor * 100).toFixed(0))
              : "",
          // ✅ SE FOR EXECUÇÃO: discriminacao vazia (usuário preenche)
          // ✅ SE FOR EDIÇÃO: discriminacao da despesa existente
          discriminacao: isExecucao
            ? ""
            : despesaParaEditar.discriminacao || "",
          fornecedor: despesaParaEditar.fornecedor || "",
          numeroEmpenho: despesaParaEditar.numeroEmpenho || "",
          numeroNota: despesaParaEditar.numeroNota || "",
          dataEmpenho: convertToDateString(despesaParaEditar.dataEmpenho),
          dataLiquidacao: convertToDateString(despesaParaEditar.dataLiquidacao),
          dataPagamento: convertToDateString(despesaParaEditar.dataPagamento),
          acao: despesaParaEditar.acao || "",
          classificacaoFuncional:
            despesaParaEditar.classificacaoFuncional || "",
          numeroContrato: despesaParaEditar.numeroContrato || "",
          categoria: despesaParaEditar.categoria || "",
          descricao: despesaParaEditar.descricao || "",
          observacoes: despesaParaEditar.observacoes || "",
          status: despesaParaEditar.status || "PLANEJADA",
          statusPagamento: despesaParaEditar.statusPagamento || "pendente",
          elementoDespesa:
            despesaParaEditar.elementoDespesa ||
            "3.3.90.30.99 - Outros Materiais de Consumo",
          fonteRecurso: despesaParaEditar.fonteRecurso || "",
          programaTrabalho: despesaParaEditar.programaTrabalho || "",
          planoInterno: despesaParaEditar.planoInterno || "",
          contrapartida: despesaParaEditar.contrapartida || 0,
          percentualExecucao: despesaParaEditar.percentualExecucao || 0,
          etapaExecucao: despesaParaEditar.etapaExecucao || "",
          coordenadasGeograficas:
            despesaParaEditar.coordenadasGeograficas || "",
          populacaoBeneficiada: despesaParaEditar.populacaoBeneficiada || "",
          impactoSocial: despesaParaEditar.impactoSocial || "",
          cnpjFornecedor: despesaParaEditar.cnpjFornecedor || "",
          nomeFantasia: despesaParaEditar.nomeFantasia || "",
          enderecoFornecedor: despesaParaEditar.enderecoFornecedor || "",
          cidadeUf: despesaParaEditar.cidadeUf || "",
          cep: despesaParaEditar.cep || "",
          telefoneFornecedor: despesaParaEditar.telefoneFornecedor || "",
          emailFornecedor: despesaParaEditar.emailFornecedor || "",
          situacaoCadastral: despesaParaEditar.situacaoCadastral || "",
          dataUltimaAtualizacao:
            convertToDateString(despesaParaEditar.dataUltimaAtualizacao) ||
            new Date().toISOString().split("T")[0],
        };
        return updatedFormData;
      });

      if (despesaParaEditar.emendaId) {
        carregarDadosEmenda(despesaParaEditar.emendaId);
      }
    }
  }, [despesaParaEditar, emendaId, isExecucao, carregarDadosEmenda]); // Adicionado isExecucao

  // ✅ BLOQUEAR FECHAMENTO AUTOMÁTICO EM MODO EXECUÇÃO
  useEffect(() => {
    if (isExecucao && despesaParaEditar) {
      console.log(
        "⚠️ Modo execução ativado - formulário deve permanecer aberto",
      );
    }
  }, [isExecucao, despesaParaEditar]);

  // 📦 STATES AUXILIARES
  // (Este bloco já existia e foi mantido)

  // ✅ MANIPULADORES DE EVENTOS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ NAVEGAÇÃO PÓS SALVAR
  const navegarAposSalvar = () => {
    // 🔑 PRIORIDADE 1: onSuccess (modal/emenda)
    if (onSuccess) {
      console.log(
        "✅ DespesaForm: Chamando onSuccess (retorna ao contexto de origem)",
      );
      onSuccess();
      return; // ⚠️ CRÍTICO: Prevenir navegação
    }

    // 🔑 PRIORIDADE 2: onSalvar
    if (onSalvar) {
      console.log("✅ DespesaForm: Chamando onSalvar");
      onSalvar();
      return; // ⚠️ CRÍTICO: Prevenir navegação
    }

    // 🔑 PRIORIDADE 3: Navegar para emenda se houver contexto
    if (despesaParaEditar?.emendaId || emendaPreSelecionada || emendaId) {
      const targetEmendaId =
        despesaParaEditar?.emendaId || emendaPreSelecionada || emendaId;
      console.log("🔄 DespesaForm: Navegando para emenda", targetEmendaId);
      navigate(`/emendas/${targetEmendaId}`);
      return;
    }

    // 🔑 FALLBACK: Navegar para listagem de despesas
    console.log("🔄 DespesaForm: Navegando para /despesas");
    navigate("/despesas");
  };

  // ✅ SUBMIT DO FORMULÁRIO
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Permitir edição em modo execução
    if (modoVisualizacao && !isExecucao) {
      console.log("Modo visualização - submit ignorado");
      return;
    }

    setSalvando(true);
    setLoading(true);

    try {
      // ✅ CORREÇÃO: Remover campos vazios ANTES de criar dadosParaSalvar
      const formDataLimpo = Object.fromEntries(
        Object.entries(formData).filter(
          ([_, v]) => v !== "" && v !== null && v !== undefined,
        ),
      );

      const despesaRef = despesaParaEditar?.id
        ? doc(db, "despesas", despesaParaEditar.id)
        : null;

      const despesaData = {
        ...formDataLimpo,
        emendaId:
          formData.emendaId || despesaParaEditar?.emendaId || emendaId || "",
        valor: parseValorMonetario(formData.valor),
        contrapartida: parseFloat(formData.contrapartida) || 0,
        percentualExecucao: parseFloat(formData.percentualExecucao) || 0,
        dataEmpenho:
          formData.dataEmpenho && formData.dataEmpenho !== ""
            ? new Date(formData.dataEmpenho)
            : null,
        dataLiquidacao:
          formData.dataLiquidacao && formData.dataLiquidacao !== ""
            ? new Date(formData.dataLiquidacao)
            : null,
        dataPagamento:
          formData.dataPagamento && formData.dataPagamento !== ""
            ? new Date(formData.dataPagamento)
            : null,
        dataUltimaAtualizacao:
          formData.dataUltimaAtualizacao &&
          formData.dataUltimaAtualizacao !== ""
            ? new Date(formData.dataUltimaAtualizacao)
            : new Date(),
        atualizadoEm: serverTimestamp(),
      };

      if (!despesaData.criadoEm) {
        despesaData.criadoEm = serverTimestamp();
      }

      // 🔄 SALVAR NO FIREBASE
      if (isExecucao) {
        // ✅ MODO EXECUÇÃO: Deletar planejada + Criar executada
        console.log("▶️ Executando transição: PLANEJADA → EXECUTADA");

        // 1. Criar despesa executada (SEM o ID da planejada)
        const dadosExecutada = {
          ...despesaData,
          status: "EXECUTADA", // 🔑 Força status como executada
          criadaEm: new Date().toISOString(),
          executadaEm: new Date().toISOString(),
        };

        await addDoc(collection(db, "despesas"), dadosExecutada);
        console.log("✅ Despesa executada criada com sucesso");

        // 2. Deletar despesa planejada
        if (despesaParaEditar?.id) {
          await deleteDoc(doc(db, "despesas", despesaParaEditar.id));
          console.log("✅ Despesa planejada deletada:", despesaParaEditar.id);
        }
        setToast({
          show: true,
          message: "✅ Despesa executada com sucesso!",
          type: "success",
        });
      } else if (despesaRef) {
        // ✅ EDIÇÃO NORMAL
        console.log("✏️ Atualizando despesa existente");
        await updateDoc(despesaRef, despesaData);
        console.log("✅ Despesa atualizada com sucesso");
        setToast({
          show: true,
          message: "✅ Despesa atualizada com sucesso!",
          type: "success",
        });
      } else {
        // ✅ CRIAÇÃO NORMAL
        console.log("🆕 Criando nova despesa");
        await addDoc(collection(db, "despesas"), despesaData);
        console.log("✅ Nova despesa criada com sucesso");
        setToast({
          show: true,
          message: "✅ Despesa cadastrada com sucesso!",
          type: "success",
        });
      }

      // 🔄 RECÁLCULO AUTOMÁTICO DA EMENDA
      const emendaIdParaRecalcular =
        formData.emendaId || despesaParaEditar?.emendaId || emendaId;

      if (emendaIdParaRecalcular) {
        console.log(
          `🔄 Iniciando recálculo automático da emenda ${emendaIdParaRecalcular}...`,
        );
        const resultado = await recalcularSaldoEmenda(emendaIdParaRecalcular);

        if (resultado.success) {
          console.log(`✅ Recálculo automático concluído:`, resultado.valores);
        } else {
          console.warn(`⚠️ Recálculo automático falhou: ${resultado.error}`);
          // ⚠️ NÃO bloqueia o fluxo - apenas loga o aviso
        }
      }

      console.log("🔍 DespesaForm: ANTES de chamar navegarAposSalvar");
      console.log("🔍 DespesaForm: onSuccess existe?", !!onSuccess);
      console.log("🔍 DespesaForm: onSalvar existe?", !!onSalvar);

      navegarAposSalvar();

      console.log("🔍 DespesaForm: DEPOIS de chamar navegarAposSalvar");
    } catch (error) {
      console.error("❌ Erro ao salvar despesa:", error);
      setToast({
        show: true,
        message: "❌ Erro ao salvar despesa. Tente novamente.",
        type: "error",
      });
    } finally {
      setSalvando(false);
      setLoading(false);
    }
  };

  // ✅ LIMPAR FORMULÁRIO
  const limparFormulario = () => {
    setFormData({
      emendaId: emendaPreSelecionada || emendaId || "",
      discriminacao: "",
      fornecedor: "",
      valor: "",
      numeroEmpenho: "",
      numeroNota: "",
      dataEmpenho: "",
      dataLiquidacao: "",
      dataPagamento: "",
      acao: "",
      classificacaoFuncional: "",
      numeroContrato: "",
      categoria: "",
      descricao: "",
      observacoes: "",
      status: "PLANEJADA",
      statusPagamento: "pendente",
      naturezaDespesa: "3.3.9.0.30 – Material de Despesa",
      elementoDespesa: "3.3.90.30.99 - Outros Materiais de Consumo",
      fonteRecurso: "",
      programaTrabalho: "",
      planoInterno: "",
      contrapartida: 0,
      percentualExecucao: 0,
      etapaExecucao: "",
      coordenadasGeograficas: "",
      populacaoBeneficiada: "",
      impactoSocial: "",
      cnpjFornecedor: "",
      nomeFantasia: "",
      enderecoFornecedor: "",
      cidadeUf: "",
      cep: "",
      telefoneFornecedor: "",
      emailFornecedor: "",
      situacaoCadastral: "",
      dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
    });
    setErrors({});
  };

  // ✅ VALIDAÇÃO PARA HABILITAR/DESABILITAR BOTÕES
  const naturezaSelecionada = pick(formData, ["naturezaDespesa", "natureza"]);
  const valorNum = parseBRL(formData?.valor);
  const canSubmit =
    Boolean(naturezaSelecionada) &&
    valorNum > 0 &&
    formData.fornecedor?.trim() &&
    !valorExcedeSaldo; // ✅ BLOQUEIA SE SALDO INSUFICIENTE

  return (
    <div style={styles.container}>
      {toast.show && (
        <div style={styles.toast}>
          <p>{toast.message}</p>
          <button onClick={() => setToast({ ...toast, show: false })}>✕</button>
        </div>
      )}

      {/* 🆕 Só renderizar header e banners se não estiver escondido (modal já tem header) */}
      {!hideHeader && (
        <>
          <DespesaFormHeader
            configModo={configModo}
            titulo={titulo}
            subtitle={subtitle}
            despesaParaEditar={despesaParaEditar}
            formData={formData}
            modoVisualizacao={modoVisualizacao}
            showSuccessMessage={showSuccessMessage}
          />

          <DespesaFormBanners
            userRole={userRole}
            userMunicipio={userMunicipio}
            userUf={userUf}
            emendas={emendas}
            showSuccessMessage={showSuccessMessage}
            configModo={configModo}
          />
        </>
      )}

      {/* Header do modal/formulário */}
      <h2 style={styles.modalTitle}>
        {modoVisualizacao
          ? "👁️ Visualizar Despesa"
          : isExecucao
            ? "▶️ Executar Despesa Planejada"
            : despesaParaEditar
              ? "✏️ Editar Despesa"
              : "🆕 Nova Despesa"}
      </h2>

      {/* ✅ ATUALIZADO: Props corretas incluindo formData e handleInputChange */}
      {(emendaInfoDinamica || emendaInfo) && (
        <DespesaFormEmendaInfo
          emendaInfo={emendaInfoDinamica || emendaInfo}
          formData={formData}
          handleInputChange={handleInputChange}
          modoVisualizacao={modoVisualizacao} // ✅ Apenas modo visualizar bloqueia
        />
      )}

      <div style={styles.form}>
        <DespesaFormBasicFields
          formData={formData}
          errors={errors}
          emendas={emendas}
          emendaPreSelecionada={emendaPreSelecionada}
          emendaInfo={emendaInfoDinamica || emendaInfo}
          userRole={userRole}
          userMunicipio={userMunicipio}
          modoVisualizacao={modoVisualizacao} // ✅ Apenas modo visualizar bloqueia
          handleInputChange={handleInputChange}
          despesaParaEditar={despesaParaEditar}
          onValorExcedeSaldo={setValorExcedeSaldo} // ✅ NOVO: Callback para receber status do saldo
        />

        <DespesaFormEmpenhoFields
          formData={formData}
          errors={errors}
          modoVisualizacao={modoVisualizacao} // ✅ Apenas modo visualizar bloqueia
          handleInputChange={handleInputChange}
        />

        <DespesaFormDateFields
          formData={formData}
          errors={errors}
          modoVisualizacao={modoVisualizacao} // ✅ Apenas modo visualizar bloqueia
          handleInputChange={handleInputChange}
          emendaInfo={emendaInfoDinamica || emendaInfo}
        />

        {/* ✅ NOVA SEÇÃO UNIFICADA */}
        <DespesaFormClassificacaoFuncional
          formData={formData}
          errors={errors}
          modoVisualizacao={modoVisualizacao} // ✅ Apenas modo visualizar bloqueia
          handleInputChange={handleInputChange}
        />

        {/* Ações do formulário */}
        {!modoVisualizacao && (
          <div style={styles.formActions}>
            <button
              type="button" // Mudado para button normal para evitar submit automático
              onClick={handleSubmit}
              style={{
                ...styles.submitButton,
                opacity: salvando || !canSubmit ? 0.6 : 1,
                cursor: salvando || !canSubmit ? "not-allowed" : "pointer",
              }}
              disabled={salvando || !canSubmit}
            >
              {salvando
                ? "Processando..."
                : isExecucao
                  ? "✅ Confirmar Execução"
                  : despesaParaEditar
                    ? "↻ Atualizar Despesa"
                    : "✓ Cadastrar Despesa"}
            </button>
          </div>
        )}

        {modoVisualizacao && (
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={onCancelar}
              style={styles.cancelButton}
            >
              ← Voltar
            </button>
          </div>
        )}
      </div>

      <LoadingOverlay
        show={salvando}
        message={
          isExecucao
            ? "Executando despesa..."
            : despesaParaEditar
              ? "Atualizando despesa..."
              : "Cadastrando nova despesa..."
        }
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
  },
  form: { display: "flex", flexDirection: "column", gap: "30px" },
  formActions: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #dee2e6",
  },
  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  submitButton: {
    backgroundColor: "#27AE60",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
    minWidth: "200px",
  },
  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#333",
    color: "white",
    padding: "15px",
    borderRadius: "5px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
  },
};

export default DespesaForm;
