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
      if (!isMounted()) return;

      const { name, value } = e.target;

      // Formatação especial para valor monetário
      if (name === "valor") {
        const valorFormatado = formatarMoeda(value);
        setFormData((prev) => ({ ...prev, [name]: valorFormatado }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }

      // Limpar erro do campo
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [isMounted, errors],
  );

  const formatarMoeda = (valor) => {
    let numero = valor.replace(/\D/g, "");

    if (numero.length === 0) return "";
    if (numero.length === 1) return `0,0${numero}`;
    if (numero.length === 2) return `0,${numero}`;

    numero = numero.replace(/^(\d+)(\d{2})$/, "$1,$2");
    numero = numero.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

    return numero;
  };

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
      const valor = parseFloat(
        formData.valor.replace(/[^\d,]/g, "").replace(",", "."),
      );
      if (isNaN(valor) || valor <= 0) {
        novosErrors.valor = "Valor deve ser maior que 0";
      }

      // Verificar se não excede o saldo da emenda
      if (emendaInfo && valor > emendaInfo.saldoDisponivel) {
        novosErrors.valor = `Valor excede o saldo disponível (R$ ${emendaInfo.saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`;
      }
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
        valor:
          parseFloat(formData.valor.replace(/[^\d,]/g, "").replace(",", ".")) ||
          0,
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

      if (onSalvar && typeof onSalvar === "function") {
        onSalvar();
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

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
      backgroundColor: "#f8f9fa",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "30px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      marginBottom: "20px",
    },
    header: {
      borderBottom: "2px solid #e9ecef",
      paddingBottom: "20px",
      marginBottom: "30px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#333",
      margin: "0 0 8px 0",
    },
    subtitle: {
      fontSize: "14px",
      color: "#666",
      margin: 0,
    },
    emendaInfo: {
      backgroundColor: "#e3f2fd",
      border: "2px solid #2196f3",
      borderRadius: "8px",
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
    section: {
      marginBottom: "30px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#495057",
      marginBottom: "20px",
      paddingBottom: "10px",
      borderBottom: "1px solid #dee2e6",
    },
    formRow: {
      display: "flex",
      gap: "20px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    formGroup: {
      flex: 1,
      minWidth: "200px",
    },
    formGroupMedium: {
      flex: "0 0 200px",
    },
    label: {
      display: "block",
      fontWeight: "bold",
      marginBottom: "8px",
      color: "#333",
      fontSize: "14px",
    },
    labelRequired: {
      display: "block",
      fontWeight: "bold",
      marginBottom: "8px",
      color: "#333",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "2px solid #e9ecef",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
      boxSizing: "border-box",
    },
    inputError: {
      width: "100%",
      padding: "12px",
      border: "2px solid #dc3545",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
      boxSizing: "border-box",
    },
    inputReadonly: {
      width: "100%",
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
      width: "100%",
      padding: "12px",
      border: "2px solid #e9ecef",
      borderRadius: "6px",
      fontSize: "14px",
      backgroundColor: "white",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      border: "2px solid #e9ecef",
      borderRadius: "6px",
      fontSize: "14px",
      minHeight: "100px",
      resize: "vertical",
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
    buttonGroup: {
      display: "flex",
      gap: "15px",
      justifyContent: "flex-end",
      marginTop: "30px",
      paddingTop: "20px",
      borderTop: "1px solid #dee2e6",
    },
    button: {
      padding: "12px 24px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "bold",
      cursor: "pointer",
      border: "none",
      transition: "all 0.3s ease",
    },
    buttonPrimary: {
      backgroundColor: "#007bff",
      color: "white",
    },
    buttonSecondary: {
      backgroundColor: "#6c757d",
      color: "white",
    },
    buttonSuccess: {
      backgroundColor: "#28a745",
      color: "white",
    },
    toggleButton: {
      backgroundColor: "#17a2b8",
      color: "white",
      padding: "8px 16px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
      marginBottom: "20px",
    },
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

      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {titulo ||
              (modoVisualizacao
                ? "Visualizar Despesa"
                : despesaParaEditar
                  ? "Editar Despesa"
                  : "Nova Despesa")}
          </h2>
          <p style={styles.subtitle}>
            {subtitle ||
              (modoVisualizacao
                ? "Detalhes da despesa da emenda"
                : "Preencha todos os campos obrigatórios conforme documentação oficial")}
          </p>
        </div>

        {/* Card informativo da emenda quando pré-selecionada */}
        {emendaInfo && (
          <div style={styles.emendaInfo}>
            <h3 style={styles.emendaInfoTitle}>
              📄 Dados da Emenda Selecionada
            </h3>
            <div style={styles.emendaInfoGrid}>
              <div style={styles.emendaInfoRow}>
                <strong>Parlamentar:</strong> {emendaInfo.parlamentar}
              </div>
              <div style={styles.emendaInfoRow}>
                <strong>Número:</strong> {emendaInfo.numeroEmenda}
              </div>
              <div style={styles.emendaInfoRow}>
                <strong>Município:</strong> {emendaInfo.municipio}/
                {emendaInfo.uf}
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

        <form onSubmit={handleSubmit}>
          {/* Seção 1: Dados Básicos */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📋 Dados Básicos da Despesa</h3>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.labelRequired}>Emenda *</label>
                {emendaPreSelecionada && emendaInfo ? (
                  <>
                    <input
                      type="text"
                      value={`${emendaInfo.parlamentar} - ${emendaInfo.numeroEmenda}`}
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
            </div>

            <div style={styles.formRow}>
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
                />
                {errors.discriminacao && (
                  <span style={styles.errorText}>{errors.discriminacao}</span>
                )}
              </div>
            </div>

            <div style={styles.formRow}>
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
                />
                {errors.fornecedor && (
                  <span style={styles.errorText}>{errors.fornecedor}</span>
                )}
              </div>

              <div style={styles.formGroupMedium}>
                <label style={styles.labelRequired}>Valor *</label>
                <input
                  type="text"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  style={errors.valor ? styles.inputError : styles.input}
                  readOnly={modoVisualizacao}
                  placeholder="0,00"
                />
                {errors.valor && (
                  <span style={styles.errorText}>{errors.valor}</span>
                )}
                <span style={styles.helpText}>
                  Digite apenas números. Ex: 100000 = R$ 1.000,00
                </span>
              </div>
            </div>
          </div>

          {/* Seção 2: Dados do Empenho e Nota Fiscal */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              📄 Dados do Empenho e Nota Fiscal
            </h3>

            <div style={styles.formRow}>
              <div style={styles.formGroupMedium}>
                <label style={styles.labelRequired}>Nº do Empenho *</label>
                <input
                  type="text"
                  name="numeroEmpenho"
                  value={formData.numeroEmpenho}
                  onChange={handleInputChange}
                  style={
                    errors.numeroEmpenho ? styles.inputError : styles.input
                  }
                  readOnly={modoVisualizacao}
                  placeholder="Número do empenho"
                />
                {errors.numeroEmpenho && (
                  <span style={styles.errorText}>{errors.numeroEmpenho}</span>
                )}
              </div>

              <div style={styles.formGroupMedium}>
                <label style={styles.labelRequired}>Nº da Nota Fiscal *</label>
                <input
                  type="text"
                  name="numeroNota"
                  value={formData.numeroNota}
                  onChange={handleInputChange}
                  style={errors.numeroNota ? styles.inputError : styles.input}
                  readOnly={modoVisualizacao}
                  placeholder="Número da nota fiscal"
                />
                {errors.numeroNota && (
                  <span style={styles.errorText}>{errors.numeroNota}</span>
                )}
                <span style={styles.helpText}>
                  Obrigatório - toda despesa deve ter nota fiscal
                </span>
              </div>

              <div style={styles.formGroupMedium}>
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
          </div>

          {/* Seção 3: Datas Obrigatórias */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Datas da Despesa</h3>

            <div style={styles.formRow}>
              <div style={styles.formGroupMedium}>
                <label style={styles.labelRequired}>Data do Empenho *</label>
                <input
                  type="date"
                  name="dataEmpenho"
                  value={formData.dataEmpenho}
                  onChange={handleInputChange}
                  style={errors.dataEmpenho ? styles.inputError : styles.input}
                  readOnly={modoVisualizacao}
                />
                {errors.dataEmpenho && (
                  <span style={styles.errorText}>{errors.dataEmpenho}</span>
                )}
              </div>

              <div style={styles.formGroupMedium}>
                <label style={styles.labelRequired}>Data da Liquidação *</label>
                <input
                  type="date"
                  name="dataLiquidacao"
                  value={formData.dataLiquidacao}
                  onChange={handleInputChange}
                  style={
                    errors.dataLiquidacao ? styles.inputError : styles.input
                  }
                  readOnly={modoVisualizacao}
                />
                {errors.dataLiquidacao && (
                  <span style={styles.errorText}>{errors.dataLiquidacao}</span>
                )}
              </div>

              <div style={styles.formGroupMedium}>
                <label style={styles.labelRequired}>Data do Pagamento *</label>
                <input
                  type="date"
                  name="dataPagamento"
                  value={formData.dataPagamento}
                  onChange={handleInputChange}
                  style={
                    errors.dataPagamento ? styles.inputError : styles.input
                  }
                  readOnly={modoVisualizacao}
                />
                {errors.dataPagamento && (
                  <span style={styles.errorText}>{errors.dataPagamento}</span>
                )}
              </div>
            </div>
          </div>

          {/* Seção 4: Classificação Orçamentária */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💰 Classificação Orçamentária</h3>

            <div style={styles.formRow}>
              <div style={styles.formGroupMedium}>
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
                <label style={styles.labelRequired}>
                  Dotação Orçamentária *
                </label>
                <input
                  type="text"
                  name="dotacaoOrcamentaria"
                  value={formData.dotacaoOrcamentaria}
                  onChange={handleInputChange}
                  style={
                    errors.dotacaoOrcamentaria
                      ? styles.inputError
                      : styles.input
                  }
                  readOnly={modoVisualizacao}
                  placeholder="Código da dotação orçamentária"
                />
                {errors.dotacaoOrcamentaria && (
                  <span style={styles.errorText}>
                    {errors.dotacaoOrcamentaria}
                  </span>
                )}
              </div>
            </div>

            <div style={styles.formRow}>
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
                />
                {errors.classificacaoFuncional && (
                  <span style={styles.errorText}>
                    {errors.classificacaoFuncional}
                  </span>
                )}
                <span style={styles.helpText}>Ex: 10.302.0002.20AD.0001</span>
              </div>
            </div>
          </div>

          {/* Seção 5: Campos Avançados (Toggle) */}
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
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📝 Campos Avançados</h3>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    readOnly={modoVisualizacao}
                    placeholder="Observações adicionais sobre a despesa..."
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroupMedium}>
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

                <div style={styles.formGroupMedium}>
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

                <div style={styles.formGroupMedium}>
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

              <div style={styles.formRow}>
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
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CNPJ do Fornecedor</label>
                  <input
                    type="text"
                    name="cnpjFornecedor"
                    value={formData.cnpjFornecedor}
                    onChange={handleInputChange}
                    style={styles.input}
                    readOnly={modoVisualizacao}
                    placeholder="00.000.000/0000-00"
                  />
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

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Endereço do Fornecedor</label>
                  <textarea
                    name="enderecoFornecedor"
                    value={formData.enderecoFornecedor}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    readOnly={modoVisualizacao}
                    placeholder="Endereço completo do fornecedor..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          {!modoVisualizacao && (
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={onCancelar}
                style={{ ...styles.button, ...styles.buttonSecondary }}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                style={{ ...styles.button, ...styles.buttonSuccess }}
                disabled={loading}
              >
                {loading
                  ? "⏳ Salvando..."
                  : despesaParaEditar
                    ? "✅ Atualizar Despesa"
                    : "✅ Criar Despesa"}
              </button>
            </div>
          )}

          {modoVisualizacao && (
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={onCancelar}
                style={{ ...styles.button, ...styles.buttonPrimary }}
              >
                ← Voltar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DespesaForm;
