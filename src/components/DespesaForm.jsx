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
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

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

// ✅ 🆕 NOVO: Hook e Modal para Naturezas Dinâmicas
import { useNaturezasDespesa } from "../hooks/useNaturezasDespesa";
import ModalNovaNatureza from "./ModalNovaNatureza";

// ✅ HOOKS E UTILS EXISTENTES REUTILIZADOS
import Toast from "./Toast";
import LoadingOverlay from "./LoadingOverlay";
import {
  useMoedaFormatting,
  parseValorMonetario,
  formatarMoedaDisplay,
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
}) => {
  // ✅ HOOKS REUTILIZADOS
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const { valorError, handleValorChange } = useMoedaFormatting();

  // ✅ 🆕 NOVO: Hook para naturezas dinâmicas
  const {
    naturezas,
    loading: loadingNaturezas,
    adicionarNatureza,
  } = useNaturezasDespesa();
  const [modalNaturezaAberto, setModalNaturezaAberto] = useState(false);

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

  // ✅ FUNÇÃO PARA CONVERSÃO SEGURA DE DATAS
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
    if (despesaParaEditar) return { modo: "editar", readOnly: false };
    return { modo: "criar", readOnly: false };
  }, [modoVisualizacao, despesaParaEditar]);

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
    if (emendaPreSelecionada && emendaInfo) {
      setEmendaInfoDinamica(emendaInfo);
      return;
    }

    if (formData.emendaId && !emendaPreSelecionada) {
      carregarDadosEmenda(formData.emendaId);
    } else if (!formData.emendaId) {
      setEmendaInfoDinamica(null);
    }
  }, [
    formData.emendaId,
    emendaPreSelecionada,
    emendaInfo,
    carregarDadosEmenda,
  ]);

  // ✅ CARREGAR EMENDAS NA PRIMEIRA VEZ (se necessário)
  useEffect(() => {
    if (emendas.length === 0 && !emendaPreSelecionada) {
      carregarEmendas();
    }
  }, [emendas.length, emendaPreSelecionada, carregarEmendas]);

  // ✅ PREENCHER FORMULÁRIO COM DADOS DA DESPESA (EDIÇÃO)
  useEffect(() => {
    if (despesaParaEditar) {
      console.group("🔍 DEBUG: Carregando Despesa para Edição");
      console.log("despesaParaEditar recebida:", despesaParaEditar);

      const camposParaCarregar = {
        emendaId:
          despesaParaEditar.emendaId || emendaPreSelecionada || emendaId || "",
        discriminacao: despesaParaEditar.discriminacao || "",
        fornecedor: despesaParaEditar.fornecedor || "",
        valor:
          despesaParaEditar.valor ||
          despesaParaEditar.valorEmpenho ||
          despesaParaEditar.valorExecutado ||
          "",
        numeroEmpenho:
          despesaParaEditar.numeroEmpenho ||
          despesaParaEditar.empenho ||
          despesaParaEditar.numeroNota ||
          "",
        numeroNota: despesaParaEditar.numeroNota || "",
        dataEmpenho: convertToDateString(despesaParaEditar.dataEmpenho),
        dataLiquidacao: convertToDateString(despesaParaEditar.dataLiquidacao),
        dataPagamento: convertToDateString(despesaParaEditar.dataPagamento),
        acao:
          despesaParaEditar.acao || despesaParaEditar.acaoOrcamentaria || "",
        classificacaoFuncional: despesaParaEditar.classificacaoFuncional || "",
        numeroContrato: despesaParaEditar.numeroContrato || "",
        categoria: despesaParaEditar.categoria || "",
        descricao: despesaParaEditar.descricao || "",
        observacoes: despesaParaEditar.observacoes || "",
        status: despesaParaEditar.status || "PLANEJADA",
        statusPagamento:
          despesaParaEditar.statusPagamento ||
          despesaParaEditar.situacao ||
          "pendente",
        naturezaDespesa:
          despesaParaEditar.naturezaDespesa ||
          despesaParaEditar.natureza ||
          "3.3.9.0.30 – Material de Despesa",
        elementoDespesa:
          despesaParaEditar.elementoDespesa ||
          "3.3.90.30.99 - Outros Materiais de Consumo",
        fonteRecurso: despesaParaEditar.fonteRecurso || "",
        programaTrabalho: despesaParaEditar.programaTrabalho || "",
        planoInterno: despesaParaEditar.planoInterno || "",
        contrapartida: despesaParaEditar.contrapartida || 0,
        percentualExecucao: despesaParaEditar.percentualExecucao || 0,
        etapaExecucao: despesaParaEditar.etapaExecucao || "",
        coordenadasGeograficas: despesaParaEditar.coordenadasGeograficas || "",
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
          despesaParaEditar.dataUltimaAtualizacao ||
          new Date().toISOString().split("T")[0],
      };

      console.log("Campos carregados para o formulário:", camposParaCarregar);
      console.groupEnd();

      setFormData(camposParaCarregar);
    }
  }, [despesaParaEditar, emendaPreSelecionada, emendaId]);

  // ✅ MANIPULAR MUDANÇAS DE INPUT
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 🆕 NOVO: Detectar seleção de "Digitar Outra"
    if (name === "naturezaDespesa" && value === "__DIGITAR_OUTRA__") {
      setModalNaturezaAberto(true);
      return; // Não atualizar formData ainda
    }

    if (name === "valor") {
      handleValorChange(e, setFormData);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ✅ 🆕 NOVO: Handler para salvar nova natureza
  const handleSalvarNovaNatureza = async (codigo, descricao) => {
    try {
      const novaNatureza = await adicionarNatureza(codigo, descricao);

      // Atualizar formData com a nova natureza
      setFormData((prev) => ({
        ...prev,
        naturezaDespesa: novaNatureza.natureza,
      }));

      setToast({
        show: true,
        message: "✅ Nova natureza de despesa adicionada com sucesso!",
        type: "success",
      });

      setModalNaturezaAberto(false);
    } catch (error) {
      console.error("Erro ao adicionar natureza:", error);
      throw error; // Propagar erro para o modal mostrar
    }
  };

  // ✅ NAVEGAÇÃO APÓS SALVAR
  const navegarAposSalvar = () => {
    if (onSuccess) {
      onSuccess();
    } else if (onSalvar) {
      onSalvar();
    } else if (
      despesaParaEditar?.emendaId ||
      emendaPreSelecionada ||
      emendaId
    ) {
      const targetEmendaId =
        despesaParaEditar?.emendaId || emendaPreSelecionada || emendaId;
      navigate(`/emendas/${targetEmendaId}`);
    } else {
      navigate("/despesas");
    }
  };

  // ✅ SUBMIT DO FORMULÁRIO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modoVisualizacao) {
      console.log("Modo visualização - submit ignorado");
      return;
    }

    setSalvando(true);
    setLoading(true);

    try {
      const dadosParaSalvar = {
        ...formData,
        emendaId:
          formData.emendaId || despesaParaEditar?.emendaId || emendaId || "",
        valor: parseFloat(formData.valor) || 0,
        contrapartida: parseFloat(formData.contrapartida) || 0,
        percentualExecucao: parseFloat(formData.percentualExecucao) || 0,
        dataEmpenho: formData.dataEmpenho
          ? new Date(formData.dataEmpenho)
          : null,
        dataLiquidacao: formData.dataLiquidacao
          ? new Date(formData.dataLiquidacao)
          : null,
        dataPagamento: formData.dataPagamento
          ? new Date(formData.dataPagamento)
          : null,
        dataUltimaAtualizacao: formData.dataUltimaAtualizacao
          ? new Date(formData.dataUltimaAtualizacao)
          : new Date(),
        atualizadoEm: serverTimestamp(),
      };

      if (!dadosParaSalvar.criadoEm) {
        dadosParaSalvar.criadoEm = serverTimestamp();
      }

      if (despesaParaEditar?.id) {
        const despesaRef = doc(db, "despesas", despesaParaEditar.id);
        await updateDoc(despesaRef, dadosParaSalvar);

        setToast({
          show: true,
          message: "✅ Despesa atualizada com sucesso!",
          type: "success",
        });

        navegarAposSalvar();
      } else {
        await addDoc(collection(db, "despesas"), dadosParaSalvar);

        setToast({
          show: true,
          message: "✅ Despesa cadastrada com sucesso!",
          type: "success",
        });

        navegarAposSalvar();
      }
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
    Boolean(naturezaSelecionada) && valorNum > 0 && formData.fornecedor?.trim();

  return (
    <div style={styles.container}>
      {toast.show && (
        <div style={styles.toast}>
          <p>{toast.message}</p>
          <button onClick={() => setToast({ ...toast, show: false })}>✕</button>
        </div>
      )}

      {/* 🆕 Modal para adicionar nova natureza */}
      <ModalNovaNatureza
        isOpen={modalNaturezaAberto}
        onClose={() => setModalNaturezaAberto(false)}
        onSalvar={handleSalvarNovaNatureza}
      />

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

      {/* ✅ ATUALIZADO: Props corretas incluindo formData e handleInputChange */}
      {(emendaInfoDinamica || emendaInfo) && (
        <DespesaFormEmendaInfo
          emendaInfo={emendaInfoDinamica || emendaInfo}
          formData={formData}
          handleInputChange={handleInputChange}
          modoVisualizacao={modoVisualizacao}
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
          modoVisualizacao={modoVisualizacao}
          valorError={valorError}
          handleInputChange={handleInputChange}
          despesaParaEditar={despesaParaEditar}
          naturezas={naturezas} // 🆕 Passar naturezas dinâmicas
          loadingNaturezas={loadingNaturezas} // 🆕 Status de carregamento
        />

        <DespesaFormEmpenhoFields
          formData={formData}
          errors={errors}
          modoVisualizacao={modoVisualizacao}
          handleInputChange={handleInputChange}
        />

        <DespesaFormDateFields
          formData={formData}
          errors={errors}
          modoVisualizacao={modoVisualizacao}
          handleInputChange={handleInputChange}
          emendaInfo={emendaInfoDinamica || emendaInfo}
        />

        {/* ✅ NOVA SEÇÃO UNIFICADA */}
        <DespesaFormClassificacaoFuncional
          formData={formData}
          errors={errors}
          modoVisualizacao={modoVisualizacao}
          handleInputChange={handleInputChange}
        />

        {/* Ações do formulário */}
        {!modoVisualizacao && (
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={onCancelar}
              style={styles.cancelButton}
              disabled={salvando}
            >
              ← Voltar
            </button>

            <button
              type="button"
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
          despesaParaEditar
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
};

export default DespesaForm;
