// src/components/DespesaForm.jsx
// ✅ REFATORADO: De 1404 linhas para ~200 linhas
// Reutiliza componentes modulares existentes + hooks/utils existentes

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// ✅ COMPONENTES MODULARES EXISTENTES REUTILIZADOS
import DespesaFormHeader from "./despesa/DespesaFormHeader";
import DespesaFormBanners from "./despesa/DespesaFormBanners";
import DespesaFormEmendaInfo from "./despesa/DespesaFormEmendaInfo";
import DespesaFormBasicFields from "./despesa/DespesaFormBasicFields";
import DespesaFormEmpenhoFields from "./despesa/DespesaFormEmpenhoFields";
import DespesaFormDateFields from "./despesa/DespesaFormDateFields";
import DespesaFormOrcamentoFields from "./despesa/DespesaFormOrcamentoFields";
import DespesaFormAdvancedFields from "./despesa/DespesaFormAdvancedFields";
import DespesaFormActions from "./despesa/DespesaFormActions";

// ✅ HOOKS E UTILS EXISTENTES REUTILIZADOS
import Toast from "./Toast";
import { useIsMounted } from "../hooks/useEmendaDespesa";
import {
  useMoedaFormatting,
  parseValorMonetario,
  formatarMoedaDisplay,
} from "../utils/formatters";
import { useCNPJValidation } from "../utils/validators";

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
}) => {
  // ✅ HOOKS REUTILIZADOS
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { valorError, handleValorChange } = useMoedaFormatting();
  const { cnpjError, handleCNPJChange } = useCNPJValidation();

  // ✅ DADOS DO USUÁRIO SIMPLIFICADOS
  const userRole = usuario?.role || usuario?.tipo;
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  // ✅ ESTADOS SIMPLIFICADOS
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
    dotacaoOrcamentaria: "",
    classificacaoFuncional: "",
    numeroContrato: "",
    categoria: "",
    descricao: "",
    observacoes: "",
    status: "pendente",
    centroCusto: "",
    naturezaDespesa: "",
    elementoDespesa: "",
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
    enderecoFornecedor: "",
    telefoneFornecedor: "",
    emailFornecedor: "",
    dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [mostrarCamposAvancados, setMostrarCamposAvancados] = useState(false);
  const [emendas, setEmendas] = useState(emendasDisponiveis);
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

  // ✅ EFFECTS SIMPLIFICADOS
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
      if (!isMounted) return;

      const { name, value } = e.target;

      // Tratamento especial para valor monetário
      if (name === "valor") {
        handleValorChange(value, emendaInfo, setFormData);
        return;
      }

      // Tratamento especial para CNPJ
      if (name === "cnpjFornecedor") {
        handleCNPJChange(value, setFormData);
        return;
      }

      // Outros campos
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Limpar erro do campo
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [isMounted, errors, emendaInfo, handleValorChange, handleCNPJChange],
  );

  // ✅ VALIDAÇÃO SIMPLIFICADA
  const validarFormulario = useCallback(() => {
    const novosErrors = {};

    const camposObrigatorios = {
      emendaId: "Emenda é obrigatória",
      discriminacao: "Discriminação é obrigatória",
      fornecedor: "Fornecedor é obrigatório",
      valor: "Valor é obrigatório",
      numeroEmpenho: "Nº do Empenho é obrigatório",
      numeroNota: "Nº da Nota Fiscal é obrigatório",
      dataEmpenho: "Data do Empenho é obrigatória",
      dataLiquidacao: "Data da Liquidação é obrigatória",
      dataPagamento: "Data do Pagamento é obrigatória",
      acao: "Ação é obrigatória",
      dotacaoOrcamentaria: "Dotação Orçamentária é obrigatória",
      classificacaoFuncional: "Classificação Funcional é obrigatória",
    };

    Object.keys(camposObrigatorios).forEach((campo) => {
      if (!formData[campo] || formData[campo].toString().trim() === "") {
        novosErrors[campo] = camposObrigatorios[campo];
      }
    });

    // Validação para valor monetário
    if (formData.valor) {
      const valor = parseValorMonetario(formData.valor);
      if (isNaN(valor) || valor <= 0) {
        novosErrors.valor = "Valor deve ser maior que 0";
      }

      if (emendaInfo && valor > emendaInfo.saldoDisponivel) {
        novosErrors.valor = `Valor excede o saldo disponível (R$ ${emendaInfo.saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`;
      }
    }

    // ✅ NOVA VALIDAÇÃO: Verificar se datas não excedem validade da emenda
    if (emendaInfo?.dataValidade) {
      const dataValidade = new Date(emendaInfo.dataValidade);

      if (
        formData.dataEmpenho &&
        new Date(formData.dataEmpenho) > dataValidade
      ) {
        novosErrors.dataEmpenho = `Data não pode ser posterior à validade da emenda (${dataValidade.toLocaleDateString("pt-BR")})`;
      }

      if (
        formData.dataLiquidacao &&
        new Date(formData.dataLiquidacao) > dataValidade
      ) {
        novosErrors.dataLiquidacao = `Data não pode ser posterior à validade da emenda (${dataValidade.toLocaleDateString("pt-BR")})`;
      }

      if (
        formData.dataPagamento &&
        new Date(formData.dataPagamento) > dataValidade
      ) {
        novosErrors.dataPagamento = `Data não pode ser posterior à validade da emenda (${dataValidade.toLocaleDateString("pt-BR")})`;
      }
    }

    if (valorError) {
      novosErrors.valor = valorError;
    }

    if (formData.cnpjFornecedor && cnpjError) {
      novosErrors.cnpjFornecedor = cnpjError;
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  }, [formData, emendaInfo, valorError, cnpjError]);

  // ✅ SUBMISSÃO SIMPLIFICADA
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setToast({
        show: true,
        message: "Por favor, preencha todos os campos obrigatórios.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const dadosParaSalvar = {
        ...formData,
        valor: parseValorMonetario(formData.valor) || 0,
        contrapartida: parseFloat(formData.contrapartida) || 0,
        percentualExecucao: parseFloat(formData.percentualExecucao) || 0,
        dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
        criadoPor: usuario?.email || "sistema",
        atualizadoEm: new Date(),
        criadoEm: despesaParaEditar?.criadoEm || new Date(),
      };

      if (despesaParaEditar) {
        const despesaRef = doc(db, "despesas", despesaParaEditar.id);
        await updateDoc(despesaRef, dadosParaSalvar);
        setToast({
          show: true,
          message: "Despesa atualizada com sucesso!",
          type: "success",
        });
      } else {
        const collectionRef = collection(db, "despesas");
        const docRef = await addDoc(collectionRef, dadosParaSalvar);

        // Verificar se foi criado
        const docCheck = await getDoc(docRef);
        if (!docCheck.exists()) {
          throw new Error("Documento não foi criado corretamente");
        }

        setToast({
          show: true,
          message: "Despesa criada com sucesso!",
          type: "success",
        });
      }

      if (isMounted) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          if (isMounted) {
            setShowSuccessMessage(false);
            if (onSalvar && typeof onSalvar === "function") {
              onSalvar();
            }
          }
        }, 1500);
      }
    } catch (error) {
      console.error("❌ Erro ao salvar despesa:", error);

      let mensagemErro = "Erro ao salvar despesa. ";
      if (error.code === "permission-denied") {
        mensagemErro += "Verifique as regras de segurança do Firebase.";
      } else if (error.code === "network-request-failed") {
        mensagemErro += "Problema de conexão.";
      } else {
        mensagemErro += "Tente novamente.";
      }

      setToast({
        show: true,
        message: mensagemErro,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* ✅ HEADER EXTRAÍDO */}
      <DespesaFormHeader
        configModo={configModo}
        titulo={titulo}
        subtitle={subtitle}
        despesaParaEditar={despesaParaEditar}
        formData={formData}
        modoVisualizacao={modoVisualizacao}
        showSuccessMessage={showSuccessMessage}
      />

      {/* ✅ BANNERS EXTRAÍDOS */}
      <DespesaFormBanners
        userRole={userRole}
        userMunicipio={userMunicipio}
        userUf={userUf}
        emendas={emendas}
        showSuccessMessage={showSuccessMessage}
        configModo={configModo}
      />

      {/* ✅ CARD DA EMENDA EXTRAÍDO */}
      {emendaInfo && <DespesaFormEmendaInfo emendaInfo={emendaInfo} />}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ TODAS AS SEÇÕES EXTRAÍDAS PARA COMPONENTES MODULARES */}
        <DespesaFormBasicFields
          formData={formData}
          errors={errors}
          emendas={emendas}
          emendaPreSelecionada={emendaPreSelecionada}
          emendaInfo={emendaInfo}
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
          emendaInfo={emendaInfo} // ✅ NOVO: Passar emendaInfo
        />

        <DespesaFormOrcamentoFields
          formData={formData}
          errors={errors}
          modoVisualizacao={modoVisualizacao}
          handleInputChange={handleInputChange}
        />

        {/* ✅ CAMPOS AVANÇADOS COM TOGGLE */}
        {!modoVisualizacao && (
          <button
            type="button"
            onClick={() => setMostrarCamposAvancados(!mostrarCamposAvancados)}
            style={styles.toggleButton}
          >
            {mostrarCamposAvancados ? "🔼 Ocultar" : "🔽 Mostrar"} Campos
            Avançados
          </button>
        )}

        {(mostrarCamposAvancados || modoVisualizacao) && (
          <DespesaFormAdvancedFields
            formData={formData}
            errors={errors}
            cnpjError={cnpjError}
            modoVisualizacao={modoVisualizacao}
            handleInputChange={handleInputChange}
          />
        )}

        {/* ✅ AÇÕES EXTRAÍDAS */}
        <DespesaFormActions
          configModo={configModo}
          loading={loading}
          modoVisualizacao={modoVisualizacao}
          onCancelar={onCancelar}
        />
      </form>
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
  toggleButton: {
    backgroundColor: "#17a2b8",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "20px",
    transition: "background-color 0.3s ease",
  },
};

export default DespesaForm;
