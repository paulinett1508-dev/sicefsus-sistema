// src/components/DespesaForm.jsx
// ✅ REFATORADO: De 1404 linhas para ~200 linhas
// Reutiliza componentes modulares existentes + hooks/utils existentes
// 🔄 ATUALIZADO: Nova seção unificada "Classificação Funcional-Programática"
// 🗑️ ATUALIZADO: Removidos campos "Centro de Custo" e "Dotação Orçamentária"

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

// ✅ COMPONENTES MODULARES EXISTENTES REUTILIZADOS
import DespesaFormHeader from "./despesa/DespesaFormHeader";
import DespesaFormBanners from "./despesa/DespesaFormBanners";
import DespesaFormEmendaInfo from "./despesa/DespesaFormEmendaInfo";
import DespesaFormBasicFields from "./despesa/DespesaFormBasicFields";
import DespesaFormEmpenhoFields from "./despesa/DespesaFormEmpenhoFields";
import DespesaFormDateFields from "./despesa/DespesaFormDateFields";
import DespesaFormClassificacaoFuncional from "./despesa/DespesaFormClassificacaoFuncional"; // ✅ NOVO COMPONENTE UNIFICADO

// ✅ HOOKS E UTILS EXISTENTES REUTILIZADOS
import DespesaFormActions from "./despesa/DespesaFormActions";
import Toast from "./Toast";
import {
  useMoedaFormatting,
  parseValorMonetario,
  formatarMoedaDisplay,
} from "../utils/formatters";
import LoadingOverlay from "./LoadingOverlay";

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

  // ✅ ESTADOS SIMPLIFICADOS - REMOVIDOS centroCusto e dotacaoOrcamentaria
  // ✅ ADICIONADOS: nomeFantasia e situacaoCadastral para API CNPJ
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
    status: "PLANEJADA",              // Inicia como planejada
    statusPagamento: "pendente",      // Pagamento pendente
    naturezaDespesa: "3.3.9.0.30 – Material de Despesa", // ✅ VALOR PRÉ-DEFINIDO
    elementoDespesa: "3.3.90.30.99 - Outros Materiais de Consumo", // ✅ VALOR PRÉ-DEFINIDO
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
          message:
            "Configuração de usuário incompleta. Entre em contato com o administrador.",
          type: "error",
        });
        return;
      }

      const querySnapshot = await getDocs(q);
      const emendasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`✅ Emendas carregadas: ${emendasData.length}`);
      setEmendas(emendasData);
    } catch (error) {
      console.error("❌ Erro ao carregar emendas:", error);
      setToast({
        show: true,
        message: "Erro ao carregar emendas disponíveis",
        type: "error",
      });
    }
  }, [userRole, userMunicipio]);

  // ✅ FUNÇÃO para buscar dados da emenda selecionada:
  const carregarDadosEmenda = useCallback(async (emendaId) => {
    if (!emendaId) {
      setEmendaInfoDinamica(null);
      return;
    }

    try {
      console.log("🔍 Buscando dados da emenda:", emendaId);

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

        setEmendaInfoDinamica(emendaCompleta);
        console.log("✅ Dados da emenda carregados:", emendaCompleta);
      } else {
        console.warn("⚠️ Emenda não encontrada:", emendaId);
        setEmendaInfoDinamica(null);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados da emenda:", error);
      setToast({
        show: true,
        message: "Erro ao carregar informações da emenda",
        type: "error",
      });
      setEmendaInfoDinamica(null);
    }
  }, []);

  // ✅ EFFECTS SIMPLIFICADOS
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ useEffect para monitorar mudanças na emenda selecionada:
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

  useEffect(() => {
    if (emendas.length === 0 && !emendaPreSelecionada) {
      carregarEmendas();
    }
  }, [emendas.length, emendaPreSelecionada, carregarEmendas]);

  useEffect(() => {
    if (despesaParaEditar) {
      setFormData((prev) => ({
        ...prev,
        ...despesaParaEditar,
        dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
      }));
    }
  }, [despesaParaEditar]);

  useEffect(() => {
    if (emendaPreSelecionada && emendaInfo && !despesaParaEditar) {
      setFormData((prev) => ({
        ...prev,
        emendaId: emendaPreSelecionada,
      }));
    }
  }, [emendaPreSelecionada, emendaInfo, despesaParaEditar]);

  // ✅ HANDLER DE MUDANÇA SIMPLIFICADO
  const handleInputChange = useCallback(
    (e) => {
      if (!isMountedRef.current) return;

      const { name, value } = e.target;

      if (name === "emendaId") {
        setFormData((prev) => ({ ...prev, emendaId: value }));
        carregarDadosEmenda(value);
        return;
      }

      if (name === "valor") {
        handleValorChange(e, (valorFormatado, valorNumerico) => {
          setFormData((prev) => ({
            ...prev,
            valor: valorFormatado,
          }));

          if (emendaInfoDinamica?.saldoDisponivel !== undefined) {
            if (valorNumerico > emendaInfoDinamica.saldoDisponivel) {
              setErrors((prev) => ({
                ...prev,
                valor: `Valor excede o saldo disponível (${formatarMoedaDisplay(emendaInfoDinamica.saldoDisponivel)})`,
              }));
            } else {
              setErrors((prev) => {
                const { valor, ...rest } = prev;
                return rest;
              });
            }
          }
        });
        return;
      }

      // Lógica para atualizar statusPagamento ao mudar dataPagamento
      if (name === "dataPagamento") {
        setFormData((prev) => ({
          ...prev,
          dataPagamento: value,
          statusPagamento: value ? "pago" : "pendente", // Define como pago se houver data, senão pendente
        }));
        return;
      }


      setFormData((prev) => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors((prev) => {
          const { [name]: removed, ...rest } = prev;
          return rest;
        });
      }
    },
    [
      handleValorChange,
      emendaInfoDinamica,
      errors,
      carregarDadosEmenda,
      isMountedRef,
    ],
  );

  // ✅ VALIDAÇÃO SIMPLIFICADA
  const validateForm = () => {
    const newErrors = {};

    if (!formData.emendaId) newErrors.emendaId = "Selecione uma emenda válida";
    if (!formData.fornecedor.trim())
      newErrors.fornecedor = "Fornecedor é obrigatório";
    if (!formData.valor || parseValorMonetario(formData.valor) <= 0) {
      newErrors.valor = "Valor inválido";
    }
    if (!formData.numeroEmpenho.trim())
      newErrors.numeroEmpenho = "Número do empenho é obrigatório";
    if (!formData.numeroNota.trim())
      newErrors.numeroNota = "Número da nota é obrigatório";
    if (!formData.dataEmpenho)
      newErrors.dataEmpenho = "Data do empenho é obrigatória";
    if (!formData.dataLiquidacao)
      newErrors.dataLiquidacao = "Data de liquidação é obrigatória";
    if (!formData.dataPagamento)
      newErrors.dataPagamento = "Data de pagamento é obrigatória";
    if (!formData.acao) newErrors.acao = "Ação é obrigatória";

    const valorNumerico = parseValorMonetario(formData.valor);
    if (
      emendaInfoDinamica?.saldoDisponivel !== undefined &&
      valorNumerico > emendaInfoDinamica.saldoDisponivel
    ) {
      newErrors.valor = `Valor excede o saldo disponível (${formatarMoedaDisplay(emendaInfoDinamica.saldoDisponivel)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função auxiliar para determinar o status de execução
  const determinarStatusExecucao = (data) => {
    // Se a data de pagamento foi preenchida, considera executada.
    // Caso contrário, permanece planejada.
    return data.dataPagamento ? "EXECUTADA" : "PLANEJADA";
  };


  // ✅ SUBMIT SIMPLIFICADO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({
        show: true,
        message: "⚠️ Por favor, corrija os erros no formulário",
        type: "error",
      });
      return;
    }

    setSalvando(true);
    setLoading(true);

    try {
      const valorNumerico = parseValorMonetario(formData.valor);

      const dadosParaSalvar = {
        ...formData,
        valor: valorNumerico,
        usuarioCriacao: usuario.uid || usuario.id,
        dataUltimaAtualizacao: serverTimestamp(),
        status: determinarStatusExecucao(formData),  // ✅ Determina automaticamente (PLANEJADA ou EXECUTADA)
        statusPagamento: formData.statusPagamento || "pendente",  // Mantém statusPagamento
        ...(despesaParaEditar
          ? {}
          : {
              dataCriacao: serverTimestamp(),
              criadoPor: usuario.uid || usuario.id,
            }),
      };

      if (despesaParaEditar) {
        const despesaRef = doc(db, "despesas", despesaParaEditar.id);
        await updateDoc(despesaRef, dadosParaSalvar);

        setToast({
          show: true,
          message: "✅ Despesa atualizada com sucesso!",
          type: "success",
        });

        if (onSuccess && typeof onSuccess === "function") {
          setTimeout(() => {
            onSuccess();
          }, 800);
        } else {
          setTimeout(() => {
            navigate("/despesas", { replace: true });
          }, 800);
        }
      } else {
        await addDoc(collection(db, "despesas"), dadosParaSalvar);

        setToast({
          show: true,
          message: "✅ Despesa cadastrada com sucesso!",
          type: "success",
        });

        if (onSuccess && typeof onSuccess === "function") {
          setTimeout(() => {
            onSuccess();
          }, 800);
        } else {
          setTimeout(() => {
            navigate("/despesas", { replace: true });
          }, 800);
        }

        if (!onSuccess) {
          limparFormulario();
        }
      }
    } catch (error) {
      console.error("❌ Erro ao salvar despesa:", error);
      let mensagemErro = "❌ Erro ao salvar despesa. ";

      if (error.code === "permission-denied") {
        mensagemErro += "Você não tem permissão para esta operação.";
      } else if (error.code === "unavailable") {
        mensagemErro += "Serviço temporariamente indisponível.";
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
      setLoading(false);
    }
  };

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
      naturezaDespesa: "3.3.9.0.30 – Material de Despesa", // ✅ VALOR PRÉ-DEFINIDO
      elementoDespesa: "3.3.90.30.99 - Outros Materiais de Consumo", // ✅ VALOR PRÉ-DEFINIDO
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

  return (
    <div style={styles.container}>
      {toast.show && (
        <div style={styles.toast}>
          <p>{toast.message}</p>
          <button onClick={() => setToast({ ...toast, show: false })}>✕</button>
        </div>
      )}

      {/* 🆕 Só renderizar header se não estiver escondido (modal já tem header) */}
      {!hideHeader && (
        <DespesaFormHeader
          configModo={configModo}
          titulo={titulo}
          subtitle={subtitle}
          despesaParaEditar={despesaParaEditar}
          formData={formData}
          modoVisualizacao={modoVisualizacao}
          showSuccessMessage={showSuccessMessage}
        />
      )}

      <DespesaFormBanners
        userRole={userRole}
        userMunicipio={userMunicipio}
        userUf={userUf}
        emendas={emendas}
        showSuccessMessage={showSuccessMessage}
        configModo={configModo}
      />

      {(emendaInfoDinamica || emendaInfo) && (
        <DespesaFormEmendaInfo emendaInfo={emendaInfoDinamica || emendaInfo} />
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
                opacity: salvando ? 0.6 : 1,
                cursor: salvando ? "not-allowed" : "pointer",
              }}
              disabled={salvando}
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
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