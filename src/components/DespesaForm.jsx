import React, { useState, useEffect, useCallback } from "react";
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
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import Toast from "./Toast";
import { useIsMounted } from "../hooks/useEmendaDespesa";
import { useMoedaFormatting, parseValorMonetario } from "../utils/formatters";
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
  const isMounted = useIsMounted();
  const navigate = useNavigate();

  // Estado inicial com campos obrigatórios conforme print oficial
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
    dataVencimento: "",
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

  // ✅ Hooks de formatação
  const { valorError, handleValorChange } = useMoedaFormatting();
  const { cnpjError, handleCNPJChange } = useCNPJValidation();

  // Configuração de modo simplificada (seguindo padrão do EmendaForm)
  const configModo = {
    modo: modoVisualizacao
      ? "visualizar"
      : despesaParaEditar
        ? "editar"
        : "criar",
    readOnly: modoVisualizacao,
  };

  // Carregar emendas se não foram fornecidas
  useEffect(() => {
    if (emendas.length === 0 && !emendaPreSelecionada) {
      carregarEmendas();
    }
  }, []);

  // Carregar dados para edição
  useEffect(() => {
    if (despesaParaEditar) {
      setFormData((prev) => ({
        ...prev,
        ...despesaParaEditar,
        dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
      }));
    }
  }, [despesaParaEditar]);

  // Preencher dados da emenda quando vem pré-selecionada
  useEffect(() => {
    if (emendaPreSelecionada && emendaInfo && !despesaParaEditar) {
      setFormData((prev) => ({
        ...prev,
        emendaId: emendaPreSelecionada,
      }));
    }
  }, [emendaPreSelecionada, emendaInfo, despesaParaEditar]);

  const carregarEmendas = async () => {
    try {
      const q = query(collection(db, "emendas"));
      const querySnapshot = await getDocs(q);
      const emendasData = [];

      querySnapshot.forEach((doc) => {
        emendasData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setEmendas(emendasData);
    } catch (error) {
      console.error("Erro ao carregar emendas:", error);
    }
  };

  const handleInputChange = useCallback(
    (e) => {
      // ✅ CORREÇÃO: Verificar se isMounted é true (não uma função)
      if (!isMounted) return;

      const { name, value } = e.target;

      // Formatação especial para campos específicos
      if (name === "valor") {
        handleValorChange(value, emendaInfo, setFormData);
      } else if (name === "cnpjFornecedor") {
        handleCNPJChange(value, setFormData);
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }

      // Limpar erro do campo
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [isMounted, errors, emendaInfo, handleValorChange, handleCNPJChange],
  );

  

  const validarFormulario = () => {
    const novosErrors = {};

    // Campos obrigatórios conforme print oficial
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

      // Verificar se não excede o saldo da emenda
      if (emendaInfo && valor > emendaInfo.saldoDisponivel) {
        novosErrors.valor = `Valor excede o saldo disponível (R$ ${emendaInfo.saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`;
      }
    }

    // Adicionar erros dos hooks de formatação
    if (valorError) {
      novosErrors.valor = valorError;
    }

    if (cnpjError) {
      novosErrors.cnpjFornecedor = cnpjError;
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

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
        const docRef = await addDoc(
          collection(db, "despesas"),
          dadosParaSalvar,
        );
        setToast({
          show: true,
          message: "Despesa criada com sucesso!",
          type: "success",
        });
      }

      // ✅ CORREÇÃO: Verificar isMounted sem função
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
      setToast({
        show: true,
        message: "Erro ao salvar despesa. Tente novamente.",
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

      {/* Header padronizado */}
      <div
        style={{
          ...styles.header,
          backgroundColor:
            configModo.modo === "visualizar" ? "#e7f3ff" : "#d4edda",
          color: configModo.modo === "visualizar" ? "#004085" : "#155724",
        }}
      >
        <h2 style={styles.headerTitle}>
          {configModo.modo === "criar"
            ? "💰 Criar Despesa"
            : configModo.modo === "editar"
              ? "✏️ Editar Despesa"
              : "👁️ Visualizar Despesa"}
        </h2>
        <p style={styles.headerSubtitle}>
          {titulo ||
            (configModo.modo === "criar"
              ? "Preencha todos os campos obrigatórios conforme documentação oficial"
              : subtitle ||
                (modoVisualizacao
                  ? "Detalhes da despesa da emenda"
                  : `ID: ${despesaParaEditar?.id || ""} | Fornecedor: ${formData.fornecedor || ""}`))}
        </p>
      </div>

      {showSuccessMessage && (
        <div style={styles.successMessage}>
          <span style={styles.successIcon}>✅</span>
          <span style={styles.successText}>
            {configModo.modo === "criar"
              ? "Despesa criada"
              : "Despesa atualizada"}{" "}
            com sucesso!
          </span>
        </div>
      )}

      {/* Card informativo da emenda quando pré-selecionada */}
      {emendaInfo && (
        <div style={styles.emendaInfo}>
          <h3 style={styles.emendaInfoTitle}>📄 Dados da Emenda Selecionada</h3>
          <div style={styles.emendaInfoGrid}>
            <div style={styles.emendaInfoRow}>
              <strong>Parlamentar:</strong> {emendaInfo.parlamentar}
            </div>
            <div style={styles.emendaInfoRow}>
              <strong>Número:</strong>{" "}
              {emendaInfo.numero || emendaInfo.numeroEmenda}
            </div>
            <div style={styles.emendaInfoRow}>
              <strong>Município:</strong> {emendaInfo.municipio}/{emendaInfo.uf}
            </div>
            <div style={styles.emendaInfoRow}>
              <strong>Valor Total:</strong> R${" "}
              {emendaInfo.valorRecurso?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div style={styles.emendaInfoRow}>
              <strong>Saldo Disponível:</strong> R${" "}
              {emendaInfo.saldoDisponivel?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div style={styles.emendaInfoRow}>
              <strong>Programa:</strong> {emendaInfo.programa}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Dados Básicos da Despesa */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📋</span>
            Dados Básicos da Despesa
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Emenda *</label>
              {emendaPreSelecionada && emendaInfo ? (
                <>
                  <input
                    type="text"
                    value={`${emendaInfo.parlamentar} - ${emendaInfo.numero || emendaInfo.numeroEmenda}`}
                    style={styles.inputReadonly}
                    readOnly
                  />
                  <input
                    type="hidden"
                    name="emendaId"
                    value={formData.emendaId}
                  />
                  <span style={styles.helpText}>
                    Emenda pré-selecionada do fluxo anterior
                  </span>
                </>
              ) : (
                <select
                  name="emendaId"
                  value={formData.emendaId}
                  onChange={handleInputChange}
                  style={
                    errors.emendaId
                      ? { ...styles.select, borderColor: "#dc3545" }
                      : styles.select
                  }
                  disabled={modoVisualizacao}
                  required
                >
                  <option value="">Selecione uma emenda...</option>
                  {emendas.map((emenda) => (
                    <option key={emenda.id} value={emenda.id}>
                      {emenda.parlamentar} - {emenda.numeroEmenda} -{" "}
                      {emenda.municipio}/{emenda.uf}
                    </option>
                  ))}
                </select>
              )}
              {errors.emendaId && (
                <span style={styles.errorText}>{errors.emendaId}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Fornecedor *</label>
              <input
                type="text"
                name="fornecedor"
                value={formData.fornecedor}
                onChange={handleInputChange}
                style={errors.fornecedor ? styles.inputError : styles.input}
                readOnly={modoVisualizacao}
                placeholder="Nome completo do fornecedor"
                required
              />
              {errors.fornecedor && (
                <span style={styles.errorText}>{errors.fornecedor}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Valor *</label>
              <input
                type="text"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                style={errors.valor ? styles.inputError : styles.input}
                readOnly={modoVisualizacao}
                placeholder="0,00"
                required
              />
              {errors.valor && (
                <span style={styles.errorText}>{errors.valor}</span>
              )}
              <span style={styles.helpText}>
                Digite apenas números. Ex: 100000 = R$ 1.000,00
              </span>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.labelRequired}>Discriminação *</label>
            <textarea
              name="discriminacao"
              value={formData.discriminacao}
              onChange={handleInputChange}
              style={
                errors.discriminacao
                  ? { ...styles.textarea, borderColor: "#dc3545" }
                  : styles.textarea
              }
              readOnly={modoVisualizacao}
              placeholder="Descreva detalhadamente a discriminação da despesa..."
              rows={3}
              required
            />
            {errors.discriminacao && (
              <span style={styles.errorText}>{errors.discriminacao}</span>
            )}
          </div>
        </fieldset>

        {/* Dados do Empenho e Nota Fiscal */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📄</span>
            Dados do Empenho e Nota Fiscal
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Nº do Empenho *</label>
              <input
                type="text"
                name="numeroEmpenho"
                value={formData.numeroEmpenho}
                onChange={handleInputChange}
                style={errors.numeroEmpenho ? styles.inputError : styles.input}
                readOnly={modoVisualizacao}
                placeholder="Número do empenho"
                required
              />
              {errors.numeroEmpenho && (
                <span style={styles.errorText}>{errors.numeroEmpenho}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Nº da Nota Fiscal *</label>
              <input
                type="text"
                name="numeroNota"
                value={formData.numeroNota}
                onChange={handleInputChange}
                style={errors.numeroNota ? styles.inputError : styles.input}
                readOnly={modoVisualizacao}
                placeholder="Número da nota fiscal"
                required
              />
              {errors.numeroNota && (
                <span style={styles.errorText}>{errors.numeroNota}</span>
              )}
              <span style={styles.helpText}>
                Obrigatório - toda despesa deve ter nota fiscal
              </span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nº do Contrato</label>
              <input
                type="text"
                name="numeroContrato"
                value={formData.numeroContrato}
                onChange={handleInputChange}
                style={styles.input}
                readOnly={modoVisualizacao}
                placeholder="Número do contrato (se houver)"
              />
            </div>
          </div>
        </fieldset>

        {/* Datas da Despesa */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📅</span>
            Datas da Despesa
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Data do Empenho *</label>
              <input
                type="date"
                name="dataEmpenho"
                value={formData.dataEmpenho}
                onChange={handleInputChange}
                style={errors.dataEmpenho ? styles.inputError : styles.input}
                readOnly={modoVisualizacao}
                required
              />
              {errors.dataEmpenho && (
                <span style={styles.errorText}>{errors.dataEmpenho}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Data da Liquidação *</label>
              <input
                type="date"
                name="dataLiquidacao"
                value={formData.dataLiquidacao}
                onChange={handleInputChange}
                style={errors.dataLiquidacao ? styles.inputError : styles.input}
                readOnly={modoVisualizacao}
                required
              />
              {errors.dataLiquidacao && (
                <span style={styles.errorText}>{errors.dataLiquidacao}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Data do Pagamento *</label>
              <input
                type="date"
                name="dataPagamento"
                value={formData.dataPagamento}
                onChange={handleInputChange}
                style={errors.dataPagamento ? styles.inputError : styles.input}
                readOnly={modoVisualizacao}
                required
              />
              {errors.dataPagamento && (
                <span style={styles.errorText}>{errors.dataPagamento}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Vencimento</label>
              <input
                type="date"
                name="dataVencimento"
                value={formData.dataVencimento}
                onChange={handleInputChange}
                style={styles.input}
                readOnly={modoVisualizacao}
              />
            </div>
          </div>
        </fieldset>

        {/* Classificação Orçamentária */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>💰</span>
            Classificação Orçamentária
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Ação *</label>
              <select
                name="acao"
                value={formData.acao}
                onChange={handleInputChange}
                style={
                  errors.acao
                    ? { ...styles.select, borderColor: "#dc3545" }
                    : styles.select
                }
                disabled={modoVisualizacao}
                required
              >
                <option value="">Selecione a ação</option>
                <option value="8535">
                  8535 - Estruturação de Unidades de Atenção Especializada em
                  Saúde
                </option>
                <option value="8536">
                  8536 - Estruturação da Rede de Serviços de Atenção Básica de
                  Saúde
                </option>
                <option value="8585">
                  8585 - Atenção à Saúde da População para Procedimentos em
                  Média e Alta Complexidade
                </option>
                <option value="8730">
                  8730 - Atenção à Saúde da População para Procedimentos de
                  Média e Alta Complexidade
                </option>
                <option value="20AD">20AD - Atenção Primária à Saúde</option>
                <option value="21C0">
                  21C0 - Recursos para estruturação da rede de serviços de
                  atenção básica
                </option>
              </select>
              {errors.acao && (
                <span style={styles.errorText}>{errors.acao}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>Dotação Orçamentária *</label>
              <input
                type="text"
                name="dotacaoOrcamentaria"
                value={formData.dotacaoOrcamentaria}
                onChange={handleInputChange}
                style={
                  errors.dotacaoOrcamentaria ? styles.inputError : styles.input
                }
                readOnly={modoVisualizacao}
                placeholder="Código da dotação orçamentária"
                required
              />
              {errors.dotacaoOrcamentaria && (
                <span style={styles.errorText}>
                  {errors.dotacaoOrcamentaria}
                </span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelRequired}>
                Classificação Funcional-Programática *
              </label>
              <input
                type="text"
                name="classificacaoFuncional"
                value={formData.classificacaoFuncional}
                onChange={handleInputChange}
                style={
                  errors.classificacaoFuncional
                    ? styles.inputError
                    : styles.input
                }
                readOnly={modoVisualizacao}
                placeholder="Classificação funcional-programática"
                required
              />
              {errors.classificacaoFuncional && (
                <span style={styles.errorText}>
                  {errors.classificacaoFuncional}
                </span>
              )}
              <span style={styles.helpText}>Ex: 10.302.0002.20AD.0001</span>
            </div>
          </div>
        </fieldset>

        {/* Campos Avançados */}
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
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              <span style={styles.legendIcon}>📝</span>
              Campos Avançados
            </legend>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={styles.select}
                  disabled={modoVisualizacao}
                >
                  <option value="pendente">Pendente</option>
                  <option value="empenhado">Empenhado</option>
                  <option value="liquidado">Liquidado</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Categoria</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  style={styles.select}
                  disabled={modoVisualizacao}
                >
                  <option value="">Selecione a categoria</option>
                  <option value="equipamentos">Equipamentos</option>
                  <option value="reformas">Reformas</option>
                  <option value="construcao">Construção</option>
                  <option value="servicos">Serviços</option>
                  <option value="medicamentos">Medicamentos</option>
                  <option value="materiais">Materiais</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Centro de Custo</label>
                <input
                  type="text"
                  name="centroCusto"
                  value={formData.centroCusto}
                  onChange={handleInputChange}
                  style={styles.input}
                  readOnly={modoVisualizacao}
                  placeholder="Código do centro de custo"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Natureza da Despesa</label>
                <input
                  type="text"
                  name="naturezaDespesa"
                  value={formData.naturezaDespesa}
                  onChange={handleInputChange}
                  style={styles.input}
                  readOnly={modoVisualizacao}
                  placeholder="Ex: 4.4.90.52"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Elemento de Despesa</label>
                <input
                  type="text"
                  name="elementoDespesa"
                  value={formData.elementoDespesa}
                  onChange={handleInputChange}
                  style={styles.input}
                  readOnly={modoVisualizacao}
                  placeholder="Código do elemento"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>CNPJ do Fornecedor</label>
                <input
                  type="text"
                  name="cnpjFornecedor"
                  value={formData.cnpjFornecedor}
                  onChange={handleInputChange}
                  style={cnpjError ? styles.inputError : styles.input}
                  readOnly={modoVisualizacao}
                  placeholder="00.000.000/0000-00"
                />
                {cnpjError && (
                  <span style={styles.errorText}>{cnpjError}</span>
                )}
                <span style={styles.helpText}>
                  CNPJ será formatado automaticamente conforme você digita
                </span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Telefone do Fornecedor</label>
                <input
                  type="text"
                  name="telefoneFornecedor"
                  value={formData.telefoneFornecedor}
                  onChange={handleInputChange}
                  style={styles.input}
                  readOnly={modoVisualizacao}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email do Fornecedor</label>
                <input
                  type="email"
                  name="emailFornecedor"
                  value={formData.emailFornecedor}
                  onChange={handleInputChange}
                  style={styles.input}
                  readOnly={modoVisualizacao}
                  placeholder="fornecedor@email.com"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Endereço do Fornecedor</label>
              <textarea
                name="enderecoFornecedor"
                value={formData.enderecoFornecedor}
                onChange={handleInputChange}
                style={styles.textarea}
                readOnly={modoVisualizacao}
                placeholder="Endereço completo do fornecedor..."
                rows={3}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                style={styles.textarea}
                readOnly={modoVisualizacao}
                placeholder="Observações adicionais sobre a despesa..."
                rows={3}
              />
            </div>
          </fieldset>
        )}

        {/* Botões de Ação */}
        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={onCancelar}
            style={styles.cancelButtonStyle}
            disabled={loading}
          >
            ← Voltar
          </button>

          {!modoVisualizacao && (
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading
                ? "⏳ Salvando..."
                : configModo.modo === "criar"
                  ? "✅ Criar Despesa"
                  : "✅ Atualizar Despesa"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Estilos padronizados seguindo o padrão do EmendaForm
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    border: "2px solid #dee2e6",
  },
  headerTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    fontWeight: "bold",
  },
  headerSubtitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    opacity: 0.8,
  },
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #c3e6cb",
    marginBottom: "20px",
  },
  successIcon: {
    fontSize: "20px",
  },
  successText: {
    fontWeight: "bold",
  },
  emendaInfo: {
    backgroundColor: "#e3f2fd",
    border: "2px solid #2196f3",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "30px",
  },
  emendaInfoTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  emendaInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  emendaInfoRow: {
    fontSize: "14px",
    color: "#1565c0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  fieldset: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid #154360",
    color: "#154360",
    fontWeight: "bold",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendIcon: {
    fontSize: "18px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
  },
  labelRequired: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  inputError: {
    padding: "12px",
    border: "2px solid #dc3545",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  inputReadonly: {
    padding: "12px",
    border: "2px solid #2196f3",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    fontWeight: "bold",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
  },
  helpText: {
    color: "#6c757d",
    fontSize: "12px",
    marginTop: "5px",
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
  buttonContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #dee2e6",
  },
  cancelButtonStyle: {
    padding: "12px 24px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  submitButton: {
    padding: "12px 24px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default DespesaForm;
