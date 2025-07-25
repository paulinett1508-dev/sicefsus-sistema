// DespesaForm.jsx - VERSÃO CORRIGIDA v3.0 - CRÍTICA
// ✅ CORREÇÃO CRÍTICA: Simplificada verificação readOnly
// ✅ CORREÇÃO CRÍTICA: Campos sempre editáveis quando não em modo readOnly
// ✅ CORREÇÃO CRÍTICA: Eliminada lógica complexa de permissões

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import { useNavigationProtection } from "../App";
import { useToast } from "./Toast";
import ConfirmationModal from "./ConfirmationModal";
import useEmendaDespesa from "../hooks/useEmendaDespesa";
import SaldoEmendaWidget from "./SaldoEmendaWidget";

const DespesaForm = ({
  despesa,
  onSalvar,
  onCancelar,
  emendaId,
  usuario,
  readOnly = false, // ✅ CORREÇÃO CRÍTICA: Única fonte de verdade
  onChangeDetected,
}) => {
  const { success, error, warning } = useToast();
  const { setFormActive } = useNavigationProtection();

  // ✅ Hook integrado para validações e cálculos
  const {
    emendas,
    validarNovaDespesa,
    atualizarSaldoEmenda,
    loading: hookLoading,
    error: hookError,
    recarregar,
  } = useEmendaDespesa(null, {
    carregarTodasEmendas: true,
    incluirEstatisticas: true,
    autoRefresh: true,
  });

  // ✅ Data atual formatada
  const getDataAtual = () => {
    const hoje = new Date();
    return hoje.toISOString().split("T")[0];
  };

  // ✅ Estado inicial do formulário
  const [formData, setFormData] = useState({
    numero: "",
    emendaId: emendaId || "",
    descricao: "",
    valor: "",
    data: getDataAtual(),
    dataPagamento: "",
    numeroContrato: "",
    acao: "",
    dotacaoOrcamentaria: "",
    notaFiscalNumero: "",
    notaFiscalData: "",
    notaFiscalFornecedor: "",
    notaFiscalDescricao: "",
    numeroEmpenho: "",
    naturezaDespesa: "",
    dataEmpenho: "",
    dataLiquidacao: "",
    discriminacao: "",
    classificacaoFuncional: "",
    observacoes: "",
    itens: [{ descricao: "", valor: "", quantidade: "1" }],
    totalItens: "0,00",
    createdAt: "",
    updatedAt: "",
  });

  // ✅ Estados de controle
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Estados para controle pós-salvamento
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const [despesaSalva, setDespesaSalva] = useState(null);
  const [modoOperacao, setModoOperacao] = useState(
    readOnly ? "visualizar" : despesa ? "editar" : "criar",
  );

  // ✅ Opções para campos de seleção
  const naturezasDespesa = [
    "MATERIAL DE CONSUMO",
    "MATERIAL PERMANENTE",
    "SERVIÇOS TERCEIRIZADOS",
    "OBRAS E INSTALAÇÕES",
    "EQUIPAMENTOS E MATERIAL PERMANENTE",
    "OUTROS SERVIÇOS DE TERCEIROS - PESSOA FÍSICA",
    "OUTROS SERVIÇOS DE TERCEIROS - PESSOA JURÍDICA",
  ];

  // ✅ Carregar dados para edição
  useEffect(() => {
    if (despesa && !isFormInitialized) {
      const formatarParaExibicao = (valor) => {
        if (typeof valor === "number") {
          return valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        return valor || "";
      };

      const itensFormatados =
        despesa.itens?.length > 0
          ? despesa.itens.map((item) => ({
              descricao: item.descricao || "",
              valor: formatarParaExibicao(item.valor || 0),
              quantidade: item.quantidade || "1",
            }))
          : [{ descricao: "", valor: "", quantidade: "1" }];

      const dadosIniciais = {
        ...despesa,
        valor: formatarParaExibicao(despesa.valor),
        itens: itensFormatados,
        totalItens: formatarParaExibicao(despesa.totalItens || 0),
      };

      setFormData(dadosIniciais);
      setInitialFormData(dadosIniciais);
      setIsFormInitialized(true);
    }
  }, [despesa, isFormInitialized]);

  // ✅ Atualizar total dos itens automaticamente
  useEffect(() => {
    const calcularTotalItens = () => {
      const total = formData.itens.reduce((sum, item) => {
        const valor = parseFloat(
          item.valor?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
        );
        const quantidade = parseInt(item.quantidade) || 1;
        return sum + valor * quantidade;
      }, 0);

      const totalFormatado = total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      if (formData.totalItens !== totalFormatado) {
        setFormData((prev) => ({
          ...prev,
          totalItens: totalFormatado,
        }));
      }
    };

    calcularTotalItens();
  }, [formData.itens, formData.totalItens]);

  // ✅ Detectar mudanças no formulário
  useEffect(() => {
    if (initialFormData && onChangeDetected) {
      const hasChangesNow =
        JSON.stringify(formData) !== JSON.stringify(initialFormData);
      if (hasChangesNow !== hasChanges) {
        setHasChanges(hasChangesNow);
        onChangeDetected(hasChangesNow);
      }
    }
  }, [formData, initialFormData, hasChanges, onChangeDetected]);

  // ✅ Ativar proteção de navegação quando há mudanças
  useEffect(() => {
    if (setFormActive) {
      setFormActive(hasChanges && !readOnly);
    }
  }, [hasChanges, readOnly, setFormActive]);

  // ✅ Formatação de valores monetários
  const formatarValorMonetario = (valor) => {
    if (!valor) return "";

    if (typeof valor === "number") {
      return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    const numeroLimpo = valor.toString().replace(/[^\d,]/g, "");

    if (!numeroLimpo.includes(",")) {
      const numero = parseInt(numeroLimpo) || 0;
      return (numero / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    const valorFloat = parseFloat(numeroLimpo.replace(",", ".")) || 0;
    return valorFloat.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ✅ CORREÇÃO CRÍTICA: Handler EXTREMAMENTE SIMPLIFICADO
  const handleInputChange = (e) => {
    if (readOnly) return; // ✅ ÚNICA verificação necessária

    const { name, value } = e.target;
    let valorFormatado = value;

    // Formatação específica para campos monetários
    if (name === "valor") {
      valorFormatado = formatarValorMonetario(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: valorFormatado,
    }));

    // Limpar erro específico do campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // ✅ Handler para itens da nota fiscal
  const handleItemChange = (index, campo, valor) => {
    if (readOnly) return; // ✅ ÚNICA verificação necessária

    let valorFormatado = valor;
    if (campo === "valor") {
      valorFormatado = formatarValorMonetario(valor);
    }

    const novosItens = [...formData.itens];
    novosItens[index] = {
      ...novosItens[index],
      [campo]: valorFormatado,
    };

    setFormData((prev) => ({
      ...prev,
      itens: novosItens,
    }));
  };

  // ✅ Adicionar novo item
  const adicionarItem = () => {
    if (readOnly) return; // ✅ ÚNICA verificação necessária

    setFormData((prev) => ({
      ...prev,
      itens: [...prev.itens, { descricao: "", valor: "", quantidade: "1" }],
    }));
  };

  // ✅ Remover item
  const removerItem = (index) => {
    if (readOnly) return; // ✅ ÚNICA verificação necessária
    if (formData.itens.length <= 1) return;

    const novosItens = formData.itens.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      itens: novosItens,
    }));
  };

  // ✅ Validações do formulário
  const validarFormulario = () => {
    const novosErros = {};

    // Campos obrigatórios
    if (!formData.emendaId) {
      novosErros.emendaId = "Emenda é obrigatória";
    }
    if (!formData.descricao?.trim()) {
      novosErros.descricao = "Descrição é obrigatória";
    }
    if (!formData.valor) {
      novosErros.valor = "Valor é obrigatório";
    }
    if (!formData.data) {
      novosErros.data = "Data de lançamento é obrigatória";
    }
    if (!formData.acao?.trim()) {
      novosErros.acao = "Ação é obrigatória";
    }
    if (!formData.dotacaoOrcamentaria?.trim()) {
      novosErros.dotacaoOrcamentaria = "Dotação orçamentária é obrigatória";
    }
    if (!formData.notaFiscalNumero?.trim()) {
      novosErros.notaFiscalNumero = "Número da nota fiscal é obrigatório";
    }
    if (!formData.notaFiscalData) {
      novosErros.notaFiscalData = "Data da nota fiscal é obrigatória";
    }
    if (!formData.notaFiscalFornecedor?.trim()) {
      novosErros.notaFiscalFornecedor =
        "Fornecedor da nota fiscal é obrigatório";
    }

    // Validação de datas
    if (formData.data && formData.notaFiscalData) {
      const dataLancamento = new Date(formData.data);
      const dataNF = new Date(formData.notaFiscalData);

      if (dataLancamento < dataNF) {
        novosErros.data =
          "Data de lançamento deve ser maior ou igual à data da nota fiscal";
      }
    }

    // Validação do valor da NF vs total dos itens
    const valorNF = parseFloat(
      formData.valor?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
    );
    const totalItens = parseFloat(
      formData.totalItens?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
    );

    if (Math.abs(valorNF - totalItens) > 0.01) {
      novosErros.valor =
        "Valor da nota fiscal deve ser igual ao total dos itens";
      novosErros.totalItens =
        "Total dos itens deve ser igual ao valor da nota fiscal";
    }

    // Validação dos itens
    const itensValidos = formData.itens.every((item) => {
      return item.descricao?.trim() && item.valor && item.quantidade;
    });

    if (!itensValidos) {
      novosErros.itens =
        "Todos os itens devem ter descrição, valor e quantidade preenchidos";
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // ✅ CORREÇÃO CRÍTICA: Submissão EXTREMAMENTE SIMPLIFICADA
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return; // ✅ ÚNICA verificação necessária

    if (!validarFormulario()) {
      error("Por favor, corrija os erros no formulário antes de continuar");
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para salvar
      const dadosParaSalvar = {
        ...formData,
        valor: parseFloat(
          formData.valor?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
        ),
        totalItens: parseFloat(
          formData.totalItens?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
        ),
        itens: formData.itens.map((item) => ({
          ...item,
          valor: parseFloat(
            item.valor?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
          ),
          quantidade: parseInt(item.quantidade) || 1,
        })),
        updatedAt: serverTimestamp(),
      };

      if (despesa) {
        // Atualizar despesa existente
        await updateDoc(doc(db, "despesas", despesa.id), dadosParaSalvar);
        success("Despesa atualizada com sucesso!");
      } else {
        // Criar nova despesa
        const novaDespesaRef = await addDoc(collection(db, "despesas"), {
          ...dadosParaSalvar,
          numero: `DSP${String(Date.now()).slice(-6)}`,
          createdAt: serverTimestamp(),
        });
        success("Despesa criada com sucesso!");
        setDespesaSalva({ id: novaDespesaRef.id, ...dadosParaSalvar });
      }

      // Atualizar saldo da emenda
      if (formData.emendaId) {
        await atualizarSaldoEmenda(formData.emendaId);
      }

      setShowSuccessOptions(true);
      setHasChanges(false);

      if (onSalvar) {
        onSalvar();
      }
    } catch (err) {
      console.error("❌ Erro ao salvar despesa:", err);
      error("Erro ao salvar despesa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handler para cancelar
  const handleCancel = () => {
    if (hasChanges && !readOnly) {
      setShowConfirmationModal(true);
    } else {
      onCancelar();
    }
  };

  // ✅ Confirmar cancelamento
  const confirmarCancelamento = () => {
    setShowConfirmationModal(false);
    setHasChanges(false);
    onCancelar();
  };

  // ✅ Upload de arquivo
  const handleFileUpload = async (file) => {
    if (readOnly) return; // ✅ ÚNICA verificação necessária

    try {
      const storageRef = ref(storage, `despesas/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setUploadedFile({
        name: file.name,
        url: downloadURL,
        size: file.size,
      });

      success("Arquivo enviado com sucesso!");
    } catch (err) {
      console.error("❌ Erro no upload:", err);
      error("Erro ao enviar arquivo. Tente novamente.");
    }
  };

  // ✅ Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (readOnly) return; // ✅ ÚNICA verificação necessária

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // ✅ Renderização do componente
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          {readOnly
            ? "👁️ Visualizar Despesa"
            : despesa
              ? "✏️ Editar Despesa"
              : "➕ Nova Despesa"}
        </h2>

        {hookError && (
          <div style={styles.errorMessage}>❌ Erro: {hookError}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ Widget de saldo da emenda */}
        {formData.emendaId && (
          <SaldoEmendaWidget
            emendaId={formData.emendaId}
            valorNovaDespesa={parseFloat(
              formData.valor?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
            )}
            despesaAtualId={despesa?.id}
          />
        )}

        {/* ✅ Seção: Dados Básicos */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📋</span>
            Dados Básicos da Despesa
          </legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Emenda *</label>
              <select
                name="emendaId"
                value={formData.emendaId || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.select,
                  ...(errors.emendaId ? styles.inputError : {}),
                }}
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              >
                <option value="">Selecione uma emenda</option>
                {emendas.map((emenda) => (
                  <option key={emenda.id} value={emenda.id}>
                    {emenda.numero} - {emenda.parlamentar} - {emenda.municipio}/
                    {emenda.uf}
                  </option>
                ))}
              </select>
              {errors.emendaId && (
                <div style={styles.errorMessage}>{errors.emendaId}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Número do Contrato</label>
              <input
                type="text"
                name="numeroContrato"
                value={formData.numeroContrato || ""}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Ex: CT-2025-001"
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Descrição da Despesa *</label>
              <textarea
                name="descricao"
                value={formData.descricao || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.textarea,
                  ...(errors.descricao ? styles.inputError : {}),
                }}
                placeholder="Ex: Construção de praça"
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
              {errors.descricao && (
                <div style={styles.errorMessage}>{errors.descricao}</div>
              )}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ação *</label>
              <input
                type="text"
                name="acao"
                value={formData.acao || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.acao ? styles.inputError : {}),
                }}
                placeholder="Ex: Construção de praça"
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
              {errors.acao && (
                <div style={styles.errorMessage}>{errors.acao}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dotação Orçamentária *</label>
              <input
                type="text"
                name="dotacaoOrcamentaria"
                value={formData.dotacaoOrcamentaria || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.dotacaoOrcamentaria ? styles.inputError : {}),
                }}
                placeholder="Ex: 12.361.0001.2010"
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
              {errors.dotacaoOrcamentaria && (
                <div style={styles.errorMessage}>
                  {errors.dotacaoOrcamentaria}
                </div>
              )}
            </div>
          </div>

          {/* Campo de observações (opcional) */}
          {(formData.observacoes || !readOnly) && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes || ""}
                onChange={handleInputChange}
                style={styles.textarea}
                placeholder="Observações adicionais sobre a despesa..."
                rows="2"
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
            </div>
          )}
        </fieldset>

        {/* ✅ Seção: Nota Fiscal */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🧾</span>
            Dados da Nota Fiscal
          </legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Número da Nota Fiscal *</label>
              <input
                type="text"
                name="notaFiscalNumero"
                value={formData.notaFiscalNumero || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalNumero ? styles.inputError : {}),
                }}
                placeholder="Ex: NF-001234"
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
              {errors.notaFiscalNumero && (
                <div style={styles.errorMessage}>{errors.notaFiscalNumero}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Valor da Nota Fiscal *</label>
              <input
                type="text"
                name="valor"
                value={formData.valor || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.valor ? styles.inputError : {}),
                }}
                placeholder="0,00"
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
              {errors.valor && (
                <div style={styles.errorMessage}>{errors.valor}</div>
              )}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data da Nota Fiscal *</label>
              <input
                type="date"
                name="notaFiscalData"
                value={formData.notaFiscalData || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalData ? styles.inputError : {}),
                }}
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
              {errors.notaFiscalData && (
                <div style={styles.errorMessage}>{errors.notaFiscalData}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Lançamento *</label>
              <input
                type="date"
                name="data"
                value={formData.data || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.data ? styles.inputError : {}),
                }}
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
              {errors.data && (
                <div style={styles.errorMessage}>{errors.data}</div>
              )}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fornecedor *</label>
              <input
                type="text"
                name="notaFiscalFornecedor"
                value={formData.notaFiscalFornecedor || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalFornecedor ? styles.inputError : {}),
                }}
                placeholder="Nome do fornecedor"
                required
                disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
              />
              {errors.notaFiscalFornecedor && (
                <div style={styles.errorMessage}>
                  {errors.notaFiscalFornecedor}
                </div>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descrição da Nota Fiscal</label>
            <textarea
              name="notaFiscalDescricao"
              value={formData.notaFiscalDescricao || ""}
              onChange={handleInputChange}
              style={styles.textarea}
              placeholder="Descrição detalhada dos itens da nota fiscal..."
              rows="2"
              disabled={readOnly} // ✅ CORREÇÃO CRÍTICA: Única verificação
            />
          </div>
        </fieldset>

        {/* ✅ Seção: Itens da Nota Fiscal */}
        {!readOnly && ( // ✅ CORREÇÃO CRÍTICA: Única verificação
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              <span style={styles.legendIcon}>📦</span>
              Itens da Nota Fiscal
            </legend>

            {formData.itens.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <div style={styles.itemNumber}>{index + 1}</div>

                <div style={styles.itemFields}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descrição do Item *</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) =>
                        handleItemChange(index, "descricao", e.target.value)
                      }
                      style={styles.input}
                      placeholder="Ex: Cimento Portland"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Quantidade *</label>
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) =>
                        handleItemChange(index, "quantidade", e.target.value)
                      }
                      style={styles.input}
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Valor Unitário *</label>
                    <input
                      type="text"
                      value={item.valor}
                      onChange={(e) =>
                        handleItemChange(index, "valor", e.target.value)
                      }
                      style={styles.input}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total</label>
                    <input
                      type="text"
                      value={(() => {
                        const valor = parseFloat(
                          item.valor
                            ?.replace(/[^\d,]/g, "")
                            .replace(",", ".") || "0",
                        );
                        const quantidade = parseInt(item.quantidade) || 1;
                        const total = valor * quantidade;
                        return total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                      })()}
                      style={styles.inputReadonly}
                      readOnly
                    />
                  </div>
                </div>

                {formData.itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerItem(index)}
                    style={styles.removeItemButton}
                    title="Remover item"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}

            <div style={styles.itemActions}>
              <button
                type="button"
                onClick={adicionarItem}
                style={styles.addItemButton}
              >
                ➕ Adicionar Item
              </button>

              <div style={styles.totalItens}>
                <strong>Total dos Itens: R$ {formData.totalItens}</strong>
                {errors.totalItens && (
                  <div style={styles.errorMessage}>{errors.totalItens}</div>
                )}
              </div>
            </div>
          </fieldset>
        )}

        {/* ✅ Seção: Upload de Arquivos */}
        {!readOnly && ( // ✅ CORREÇÃO CRÍTICA: Única verificação
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              <span style={styles.legendIcon}>📎</span>
              Anexar Documentos
            </legend>

            <div
              style={{
                ...styles.dropZone,
                ...(dragActive ? styles.dropZoneActive : {}),
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div style={styles.dropZoneContent}>
                <span style={styles.dropZoneIcon}>📁</span>
                <p style={styles.dropZoneText}>
                  Arraste arquivos aqui ou{" "}
                  <label style={styles.fileInputLabel}>
                    clique para selecionar
                    <input
                      type="file"
                      style={styles.fileInput}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                </p>
                <p style={styles.dropZoneSubtext}>
                  Formatos aceitos: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>
            </div>

            {uploadedFile && (
              <div style={styles.uploadedFile}>
                <span style={styles.fileIcon}>📄</span>
                <div style={styles.fileInfo}>
                  <div style={styles.fileName}>{uploadedFile.name}</div>
                  <div style={styles.fileSize}>
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <a
                  href={uploadedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.fileLink}
                >
                  Ver arquivo
                </a>
              </div>
            )}
          </fieldset>
        )}

        {/* ✅ Botões de ação */}
        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleCancel}
            style={styles.cancelButton}
          >
            {readOnly ? "Fechar" : "Cancelar"}
          </button>

          {!readOnly && ( // ✅ CORREÇÃO CRÍTICA: Única verificação
            <button
              type="submit"
              disabled={loading || hookLoading}
              style={{
                ...styles.submitButton,
                opacity: loading || hookLoading ? 0.6 : 1,
              }}
            >
              {loading
                ? "Salvando..."
                : despesa
                  ? "💾 Atualizar Despesa"
                  : "➕ Criar Despesa"}
            </button>
          )}
        </div>
      </form>

      {/* ✅ Modal de confirmação */}
      {showConfirmationModal && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={confirmarCancelamento}
          title="Confirmar Cancelamento"
          message="Você tem alterações não salvas. Tem certeza que deseja cancelar?"
          confirmText="Sim, cancelar"
          cancelText="Continuar editando"
        />
      )}

      {/* ✅ Opções pós-salvamento */}
      {showSuccessOptions && (
        <div style={styles.successOptions}>
          <div style={styles.successOptionsContent}>
            <h3 style={styles.successTitle}>✅ Despesa salva com sucesso!</h3>
            <p style={styles.successMessage}>
              O que você gostaria de fazer agora?
            </p>
            <div style={styles.successButtons}>
              <button
                onClick={() => {
                  setShowSuccessOptions(false);
                  onCancelar();
                }}
                style={styles.successButton}
              >
                📋 Voltar à Lista
              </button>
              <button
                onClick={() => {
                  setShowSuccessOptions(false);
                  // Limpar formulário para nova despesa
                  setFormData({
                    numero: "",
                    emendaId: formData.emendaId, // Manter a mesma emenda
                    descricao: "",
                    valor: "",
                    data: getDataAtual(),
                    dataPagamento: "",
                    numeroContrato: "",
                    acao: "",
                    dotacaoOrcamentaria: "",
                    notaFiscalNumero: "",
                    notaFiscalData: "",
                    notaFiscalFornecedor: "",
                    notaFiscalDescricao: "",
                    numeroEmpenho: "",
                    naturezaDespesa: "",
                    dataEmpenho: "",
                    dataLiquidacao: "",
                    discriminacao: "",
                    classificacaoFuncional: "",
                    observacoes: "",
                    itens: [{ descricao: "", valor: "", quantidade: "1" }],
                    totalItens: "0,00",
                    createdAt: "",
                    updatedAt: "",
                  });
                  setErrors({});
                  setHasChanges(false);
                }}
                style={styles.successButton}
              >
                ➕ Nova Despesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Estilos do componente
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "10px",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
    marginTop: "5px",
    fontSize: "12px",
  },
  form: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  fieldset: {
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "25px",
    backgroundColor: "#fafbfc",
  },
  legend: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#495057",
    padding: "0 10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendIcon: {
    fontSize: "20px",
  },
  formRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  formGroup: {
    flex: "1",
    minWidth: "250px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#495057",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "#ffffff",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },
  inputReadonly: {
    width: "100%",
    padding: "12px",
    border: "2px solid #e9ecef",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#f8f9fa",
    color: "#6c757d",
  },
  select: {
    width: "100%",
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "80px",
    backgroundColor: "#ffffff",
  },
  itemRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#ffffff",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
  },
  itemNumber: {
    backgroundColor: "#007bff",
    color: "white",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    flexShrink: 0,
  },
  itemFields: {
    display: "flex",
    gap: "15px",
    flex: "1",
    flexWrap: "wrap",
  },
  removeItemButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "16px",
    flexShrink: 0,
  },
  itemActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  },
  addItemButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  totalItens: {
    fontSize: "16px",
    color: "#495057",
  },
  dropZone: {
    border: "2px dashed #dee2e6",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    backgroundColor: "#fafbfc",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  dropZoneActive: {
    borderColor: "#007bff",
    backgroundColor: "#f0f8ff",
  },
  dropZoneContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  dropZoneIcon: {
    fontSize: "48px",
    opacity: 0.5,
  },
  dropZoneText: {
    fontSize: "16px",
    color: "#495057",
    margin: 0,
  },
  dropZoneSubtext: {
    fontSize: "12px",
    color: "#6c757d",
    margin: 0,
  },
  fileInputLabel: {
    color: "#007bff",
    textDecoration: "underline",
    cursor: "pointer",
  },
  fileInput: {
    display: "none",
  },
  uploadedFile: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "8px",
    marginTop: "15px",
  },
  fileIcon: {
    fontSize: "24px",
  },
  fileInfo: {
    flex: "1",
  },
  fileName: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#155724",
  },
  fileSize: {
    fontSize: "12px",
    color: "#6c757d",
  },
  fileLink: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    marginTop: "30px",
    flexWrap: "wrap",
  },
  submitButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "12px 30px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "12px 30px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  successOptions: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  successOptionsContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    maxWidth: "400px",
    width: "90%",
  },
  successTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: "10px",
  },
  successMessage: {
    fontSize: "16px",
    color: "#495057",
    marginBottom: "20px",
  },
  successButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  successButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default DespesaForm;
