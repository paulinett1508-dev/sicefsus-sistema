// src/components/DespesaForm.jsx
// ✅ REFATORADO: De 1404 linhas para ~200 linhas
// Reutiliza componentes modulares existentes + hooks/utils existentes
// 🔄 ATUALIZADO: Nova seção unificada "Classificação Funcional-Programática"
// 🗑️ ATUALIZADO: Removidos campos "Centro de Custo" e "Dotação Orçamentária"
// ✅ ATUALIZADO 05/11/2025: Props corretas para DespesaFormEmendaInfo

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

  // ✅ MODO EDIÇÃO: Popular formulário com a despesa para editar
  useEffect(() => {
    if (despesaParaEditar && Object.keys(despesaParaEditar).length > 0) {
      // 🔥 CRÍTICO: discriminacao sempre em branco ao editar
      const { discriminacao, ...restoDosDados } = despesaParaEditar;

      setFormData((prev) => ({
        ...prev,
        ...restoDosDados,
        discriminacao: "", // 🔥 SEMPRE EM BRANCO
        dataEmpenho: despesaParaEditar.dataEmpenho || "",
        dataLiquidacao: despesaParaEditar.dataLiquidacao || "",
        dataPagamento: despesaParaEditar.dataPagamento || "",
      }));

      if (despesaParaEditar.emendaId) {
        carregarDadosEmenda(despesaParaEditar.emendaId);
      }
    }
  }, [despesaParaEditar, carregarDadosEmenda]);

  // ✅ HANDLER GENÉRICO PARA INPUTS
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ VALIDAÇÃO SIMPLES
  const validarFormulario = () => {
    const erros = {};

    if (!formData.emendaId) erros.emendaId = "Selecione uma emenda";
    if (!formData.fornecedor?.trim())
      erros.fornecedor = "Fornecedor é obrigatório";
    if (!formData.valor || parseFloat(formData.valor) <= 0)
      erros.valor = "Valor deve ser maior que zero";

    setErrors(erros);
    return Object.keys(erros).length === 0;
  };

  // ✅ SUBMIT DO FORMULÁRIO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setToast({
        show: true,
        message: "Corrija os erros antes de salvar",
        type: "error",
      });
      return;
    }

    setSalvando(true);
    setLoading(true);

    try {
      const dadosParaSalvar = {
        ...formData,
        municipio: userMunicipio,
        uf: userUf,
        usuarioId: usuario.uid,
        atualizadoEm: serverTimestamp(),
        ...(despesaParaEditar
          ? {}
          : { criadoEm: serverTimestamp(), criadoPor: usuario.uid }),
      };

      if (despesaParaEditar?.id) {
        const despesaRef = doc(db, "despesas", despesaParaEditar.id);
        await updateDoc(despesaRef, dadosParaSalvar);

        setToast({
          show: true,
          message: "✅ Despesa atualizada com sucesso!",
          type: "success",
        });

        if (onSuccess && typeof onSuccess === "function") {
          console.log("✅ DespesaForm: Chamando onSuccess (não vai navegar)");
          setTimeout(() => {
            onSuccess();
          }, 800);
          return; // ⚠️ CRÍTICO: Prevenir navegação quando há onSuccess
        }

        // Só navega se NÃO tiver onSuccess
        console.log("⚠️ DespesaForm: Sem onSuccess, navegando para /despesas");
        setTimeout(() => {
          navigate("/despesas", { replace: true });
        }, 800);
      } else {
        await addDoc(collection(db, "despesas"), dadosParaSalvar);

        setToast({
          show: true,
          message: "✅ Despesa cadastrada com sucesso!",
          type: "success",
        });

        if (onSuccess && typeof onSuccess === "function") {
          console.log("✅ DespesaForm: Chamando onSuccess (não vai navegar)");
          setTimeout(() => {
            onSuccess();
          }, 800);
          return; // ⚠️ CRÍTICO: Prevenir navegação quando há onSuccess
        }

        // Só navega se NÃO tiver onSuccess
        console.log("⚠️ DespesaForm: Sem onSuccess, navegando para /despesas");
        setTimeout(() => {
          navigate("/despesas", { replace: true });
        }, 800);
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

      <form onSubmit={handleSubmit} style={styles.form}>
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
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: salvando || !canSubmit ? 0.6 : 1,
                cursor: salvando || !canSubmit ? "not-allowed" : "pointer",
              }}
              disabled={salvando || !canSubmit}
              onClick={(e) => {
                if (!canSubmit && !salvando) {
                  e.preventDefault();
                  return;
                }
              }}
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
      </form>

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
