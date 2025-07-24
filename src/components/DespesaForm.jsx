// DespesaForm.jsx - VERSÃO FINAL COM VALIDAÇÕES RIGOROSAS
// ✅ Validação: Valor NF = Total Itens
// ✅ Validação: Data lançamento >= Data NF
// ✅ Novo fluxo: Permanece na tela após salvar com opções de navegação

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
import { db } from "../firebase/firebaseConfig";
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
  readOnly = false,
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
    data: getDataAtual(), // ✅ NOVO: Sempre data atual por padrão
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
  const [errors, setErrors] = useState({});

  // ✅ NOVO: Estados para controle pós-salvamento
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
      // Função para formatar valores para exibição
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
    if (formData.itens && formData.itens.length > 0) {
      const novoTotal = calcularTotalItens(formData.itens);
      setFormData((prev) => ({
        ...prev,
        totalItens: novoTotal,
      }));
    }
  }, [formData.itens]);

  // ✅ NOVO: Sincronizar valor da despesa com total dos itens
  useEffect(() => {
    if (formData.itens && formData.itens.length > 0) {
      const totalItens = calcularTotalItens(formData.itens);
      setFormData((prev) => ({
        ...prev,
        valor: totalItens, // ✅ Valor da NF sempre igual ao total dos itens
        totalItens: totalItens,
      }));
    }
  }, [formData.itens]);

  // ✅ Notificar mudanças para proteção de navegação
  useEffect(() => {
    if (onChangeDetected) {
      onChangeDetected(hasChanges);
    }
  }, [hasChanges, onChangeDetected]);

  // ✅ Função parseValue
  const parseValue = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      return parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    }
    return 0;
  };

  // ✅ Formatação de valores monetários
  const formatarValorMonetario = (valor) => {
    if (typeof valor === "number") {
      return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    const numero = valor.replace(/[^\d]/g, "");
    const valorFloat = parseFloat(numero) / 100;
    return valorFloat.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ✅ Calcular total dos itens
  const calcularTotalItens = (itens) => {
    const total = itens.reduce((acc, item) => {
      const valor = parseValue(item.valor || "0");
      const quantidade = parseInt(item.quantidade || "1");
      return acc + valor * quantidade;
    }, 0);
    return total.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ✅ Verificar mudanças
  const checkForChanges = (currentData) => {
    if (!initialFormData || !isFormInitialized) return false;

    const fieldsToCompare = [
      "descricao",
      "valor",
      "data",
      "dataPagamento",
      "numeroContrato",
      "acao",
      "dotacaoOrcamentaria",
      "notaFiscalNumero",
      "notaFiscalData",
      "notaFiscalFornecedor",
      "notaFiscalDescricao",
      "emendaId",
      "numeroEmpenho",
      "naturezaDespesa",
      "dataEmpenho",
      "dataLiquidacao",
      "discriminacao",
      "classificacaoFuncional",
      "observacoes",
    ];

    return fieldsToCompare.some((field) => {
      const current = currentData[field]?.toString().trim() || "";
      const initial = initialFormData[field]?.toString().trim() || "";
      return current !== initial;
    });
  };

  // ✅ Gerenciamento de itens
  const adicionarItem = () => {
    setFormData((prev) => ({
      ...prev,
      itens: [...prev.itens, { descricao: "", valor: "", quantidade: "1" }],
    }));
    setHasChanges(true);
  };

  const removerItem = (index) => {
    if (formData.itens.length > 1) {
      setFormData((prev) => ({
        ...prev,
        itens: prev.itens.filter((_, i) => i !== index),
      }));
      setHasChanges(true);
    }
  };

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...formData.itens];
    if (campo === "valor") {
      novosItens[index][campo] = formatarValorMonetario(valor);
    } else {
      novosItens[index][campo] = valor;
    }
    setFormData((prev) => ({ ...prev, itens: novosItens }));
    setHasChanges(true);
  };

  // ✅ Upload de arquivo - REMOVIDO TEMPORARIAMENTE
  // TODO: Implementar upload de arquivos com configuração CORS correta do Firebase Storage

  // ✅ NOVA: Validação rigorosa do formulário
  const validarFormulario = async () => {
    const novosErrors = {};

    // Campos obrigatórios
    if (!formData.emendaId) novosErrors.emendaId = "Emenda é obrigatória";
    if (!formData.descricao.trim())
      novosErrors.descricao = "Descrição é obrigatória";
    if (!formData.acao.trim()) novosErrors.acao = "Ação é obrigatória";
    if (!formData.dotacaoOrcamentaria.trim())
      novosErrors.dotacaoOrcamentaria = "Dotação Orçamentária é obrigatória";
    if (!formData.notaFiscalNumero.trim())
      novosErrors.notaFiscalNumero = "Número da NF é obrigatório";
    if (!formData.notaFiscalData)
      novosErrors.notaFiscalData = "Data da NF é obrigatória";
    if (!formData.notaFiscalFornecedor.trim())
      novosErrors.notaFiscalFornecedor = "Fornecedor é obrigatório";
    if (!formData.numeroEmpenho.trim())
      novosErrors.numeroEmpenho = "Número do Empenho é obrigatório";
    if (!formData.naturezaDespesa)
      novosErrors.naturezaDespesa = "Natureza da Despesa é obrigatória";
    if (!formData.dataEmpenho)
      novosErrors.dataEmpenho = "Data do Empenho é obrigatória";
    if (!formData.data) novosErrors.data = "Data de lançamento é obrigatória";

    // ✅ NOVA VALIDAÇÃO: Data de lançamento >= Data da NF
    if (formData.data && formData.notaFiscalData) {
      const dataLancamento = new Date(formData.data);
      const dataNF = new Date(formData.notaFiscalData);

      if (dataLancamento < dataNF) {
        novosErrors.data =
          "Data de lançamento não pode ser anterior à data da NF";
      }
    }

    // ✅ NOVA VALIDAÇÃO: Verificar se há pelo menos um item válido
    const itensValidos = formData.itens.filter(
      (item) =>
        item.descricao.trim() && item.valor && parseInt(item.quantidade) > 0,
    );

    if (itensValidos.length === 0) {
      novosErrors.itens =
        "Deve haver pelo menos um item válido com descrição, valor e quantidade";
    }

    // ✅ NOVA VALIDAÇÃO: Valor da NF deve bater com total dos itens
    const valorNF = parseValue(formData.valor);
    const totalItens = parseValue(formData.totalItens);

    if (Math.abs(valorNF - totalItens) > 0.01) {
      // Tolerância de 1 centavo para arredondamento
      novosErrors.valor = `Valor da NF (${formData.valor}) deve ser igual ao total dos itens (${formData.totalItens})`;
    }

    // Validação usando hook para saldo da emenda
    if (formData.emendaId && valorNF > 0) {
      const validacao = await validarNovaDespesa(formData.emendaId, valorNF);
      if (!validacao.valida) {
        novosErrors.valor = validacao.erro;
      }
    }

    // Validar itens individualmente
    formData.itens.forEach((item, index) => {
      if (item.descricao.trim() || item.valor || item.quantidade !== "1") {
        // Se algum campo foi preenchido, todos são obrigatórios
        if (!item.descricao.trim()) {
          novosErrors[`item_descricao_${index}`] =
            "Descrição do item é obrigatória";
        }
        if (!item.valor) {
          novosErrors[`item_valor_${index}`] = "Valor do item é obrigatório";
        }
        if (!item.quantidade || parseInt(item.quantidade) < 1) {
          novosErrors[`item_quantidade_${index}`] =
            "Quantidade deve ser maior que 0";
        }
      }
    });

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

  // ✅ Gerar próximo número
  const gerarProximoNumero = async () => {
    try {
      const ano = new Date().getFullYear();
      const q = query(
        collection(db, "despesas"),
        where("numero", ">=", `D${ano}001`),
        where("numero", "<=", `D${ano}999`),
      );

      const snapshot = await getDocs(q);
      const numeros = snapshot.docs.map((doc) => doc.data().numero).sort();

      if (numeros.length === 0) {
        return `D${ano}001`;
      }

      const ultimoNumero = numeros[numeros.length - 1];
      const proximoSequencial = parseInt(ultimoNumero.slice(-3)) + 1;
      return `D${ano}${proximoSequencial.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Erro ao gerar número:", error);
      return `D${new Date().getFullYear()}001`;
    }
  };

  // ✅ NOVO: Submit do formulário com novo fluxo
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (readOnly) return;

    if (!(await validarFormulario())) {
      error("❌ Corrija os erros antes de salvar");
      return;
    }

    setLoading(true);

    try {
      // ✅ Upload de arquivos removido temporariamente devido a problemas de CORS
      const valorNumerico = parseValue(formData.valor);

      // Dados para salvar
      const dadosParaSalvar = {
        emendaId: formData.emendaId,
        descricao: formData.descricao.trim(),
        valor: valorNumerico,
        data: formData.data,
        dataPagamento: formData.dataPagamento || null,
        numeroContrato: formData.numeroContrato.trim() || null,
        acao: formData.acao.trim(),
        dotacaoOrcamentaria: formData.dotacaoOrcamentaria.trim(),
        notaFiscalNumero: formData.notaFiscalNumero.trim(),
        notaFiscalData: formData.notaFiscalData,
        notaFiscalFornecedor: formData.notaFiscalFornecedor.trim(),
        notaFiscalDescricao: formData.notaFiscalDescricao.trim() || null,
        numeroEmpenho: formData.numeroEmpenho.trim(),
        naturezaDespesa: formData.naturezaDespesa,
        dataEmpenho: formData.dataEmpenho,
        dataLiquidacao: formData.dataLiquidacao || null,
        discriminacao: formData.discriminacao.trim() || null,
        classificacaoFuncional: formData.classificacaoFuncional.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        itens: formData.itens
          .filter((item) => item.descricao.trim()) // Só salvar itens com descrição
          .map((item) => ({
            descricao: item.descricao.trim(),
            valor: parseValue(item.valor),
            quantidade: parseInt(item.quantidade) || 1,
          })),
        totalItens: parseValue(formData.totalItens),
        userId: usuario.uid,
        updatedAt: serverTimestamp(),
      };

      let despesaId;
      if (despesa) {
        // Atualizar despesa existente
        await updateDoc(doc(db, "despesas", despesa.id), dadosParaSalvar);
        despesaId = despesa.id;
        success("Despesa atualizada com sucesso!");
      } else {
        // Criar nova despesa
        dadosParaSalvar.numero = await gerarProximoNumero();
        dadosParaSalvar.createdAt = serverTimestamp();
        const docRef = await addDoc(
          collection(db, "despesas"),
          dadosParaSalvar,
        );
        despesaId = docRef.id;
        success("Despesa criada com sucesso!");
      }

      // Atualizar saldo da emenda usando hook
      await atualizarSaldoEmenda(formData.emendaId);
      await recarregar();

      // ✅ NOVO: Salvar dados da despesa e mostrar opções
      setDespesaSalva({
        id: despesaId,
        ...dadosParaSalvar,
        numero: dadosParaSalvar.numero || formData.numero,
      });

      setHasChanges(false);
      setFormActive(false);
      setShowSuccessOptions(true); // ✅ Mostrar opções de navegação
    } catch (error) {
      console.error("Erro ao salvar:", error);
      error("Erro ao salvar despesa");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVAS: Funções para opções pós-salvamento
  const handleVoltarParaEmenda = () => {
    setShowSuccessOptions(false);
    if (onSalvar) {
      onSalvar(); // Volta para o módulo Emendas
    }
  };

  const handleEditarDespesaSalva = () => {
    setShowSuccessOptions(false);
    // Já está na mesma tela, apenas esconde as opções
    setModoOperacao("editar");
  };

  const handleNovaDespesaMesmaEmenda = () => {
    setShowSuccessOptions(false);

    // Resetar formulário mantendo apenas a emenda
    const novoFormData = {
      numero: "",
      emendaId: formData.emendaId, // ✅ Manter a mesma emenda
      descricao: "",
      valor: "",
      data: getDataAtual(), // ✅ Nova data atual
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
    };

    setFormData(novoFormData);
    setInitialFormData(novoFormData);
    setModoOperacao("criar");
    setErrors({});
    setHasChanges(false);

    success("Formulário resetado para nova despesa da mesma emenda");
  };

  const handleIrParaListagemDespesas = () => {
    setShowSuccessOptions(false);
    // Navegar para listagem usando função global
    if (window.voltarParaListagemDespesas) {
      window.voltarParaListagemDespesas();
    }
  };

  // ✅ Cancelar formulário
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmationModal(true);
    } else {
      setFormActive(false);
      if (onCancelar) {
        onCancelar();
      }
    }
  };

  // ✅ Handle input change
  const handleInputChange = (e) => {
    if (readOnly || modoOperacao === "visualizar") return;

    const { name, value } = e.target;
    let valorProcessado = value;

    // ✅ REMOVIDA: Formatação automática do valor principal (agora é calculado pelos itens)

    const newFormData = { ...formData, [name]: valorProcessado };
    setFormData(newFormData);

    // Verificar mudanças após inicialização
    if (isFormInitialized) {
      const hasRealChanges = checkForChanges(newFormData);
      setHasChanges(hasRealChanges);
    }

    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Função para formatar display da emenda
  const formatarDisplayEmenda = (emenda) => {
    const numero = emenda.numero || "S/N";
    const parlamentar = emenda.parlamentar || "Não informado";
    const objeto = emenda.objetoProposta || "Objeto não informado";
    const municipio = emenda.municipio || "";

    const objetoTruncado =
      objeto.length > 50 ? objeto.substring(0, 50) + "..." : objeto;

    return `${numero} - ${parlamentar} | ${objetoTruncado} (${municipio})`;
  };

  // ✅ Renderizar header baseado no modo
  const renderHeader = () => {
    const headers = {
      criar: {
        title: "📝 Criar Despesa",
        subtitle: "Preencha os dados para criar uma nova despesa",
        bgColor: "#d4edda",
        textColor: "#155724",
      },
      editar: {
        title: "✏️ Editar Despesa",
        subtitle: `ID: ${despesa?.id || despesaSalva?.id || ""} | Emenda: ${formData.emendaId || ""}`,
        bgColor: "#d4edda",
        textColor: "#155724",
      },
      visualizar: {
        title: "👁️ Visualizar Despesa",
        subtitle: `ID: ${despesa?.id || ""} | Emenda: ${formData.emendaId || ""}`,
        bgColor: "#e7f3ff",
        textColor: "#004085",
      },
    };

    const config = headers[modoOperacao];

    return (
      <div
        style={{
          ...styles.header,
          backgroundColor: config.bgColor,
          color: config.textColor,
        }}
      >
        <h2 style={styles.headerTitle}>{config.title}</h2>
        <p style={styles.headerSubtitle}>{config.subtitle}</p>
      </div>
    );
  };

  // ✅ NOVO: Renderizar painel de opções pós-salvamento
  const renderSuccessOptions = () => {
    if (!showSuccessOptions) return null;

    const emendaAtual = emendas.find((e) => e.id === formData.emendaId);

    return (
      <div style={styles.successOptionsOverlay}>
        <div style={styles.successOptionsModal}>
          <div style={styles.successOptionsHeader}>
            <h3 style={styles.successOptionsTitle}>
              ✅ Despesa salva com sucesso!
            </h3>
            <p style={styles.successOptionsSubtitle}>
              Número: {despesaSalva?.numero} | Valor: R$ {formData.valor}
            </p>
          </div>

          <div style={styles.successOptionsContent}>
            <p style={styles.successOptionsQuestion}>
              O que você gostaria de fazer agora?
            </p>

            <div style={styles.successOptionsButtons}>
              <button
                onClick={handleVoltarParaEmenda}
                style={styles.successOptionButton}
              >
                ← Voltar para Emenda
                <span style={styles.successOptionSubtext}>
                  {emendaAtual?.numero} - {emendaAtual?.parlamentar}
                </span>
              </button>

              <button
                onClick={handleEditarDespesaSalva}
                style={styles.successOptionButton}
              >
                ✏️ Editar Esta Despesa
                <span style={styles.successOptionSubtext}>
                  Continuar editando a despesa salva
                </span>
              </button>

              <button
                onClick={handleNovaDespesaMesmaEmenda}
                style={styles.successOptionButton}
              >
                ➕ Nova Despesa (Mesma Emenda)
                <span style={styles.successOptionSubtext}>
                  Criar outra despesa para esta emenda
                </span>
              </button>

              <button
                onClick={handleIrParaListagemDespesas}
                style={styles.successOptionButton}
              >
                📋 Ir para Listagem de Despesas
                <span style={styles.successOptionSubtext}>
                  Ver todas as despesas cadastradas
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {renderHeader()}

      {/* ✅ Widget de saldo da emenda */}
      {formData.emendaId && !readOnly && (
        <SaldoEmendaWidget
          emendaId={formData.emendaId}
          valorDespesaAtual={parseValue(formData.valor)}
          compacto={false}
        />
      )}

      {/* ✅ Alert para erros do hook */}
      {hookError && <div style={styles.alertError}>⚠️ {hookError}</div>}

      {/* ✅ NOVO: Alerta sobre validações importantes */}
      <div style={styles.validationAlert}>
        <div style={styles.validationAlertHeader}>
          📋 <strong>Validações Importantes:</strong>
        </div>
        <ul style={styles.validationAlertList}>
          <li>✅ Valor da NF deve ser igual ao total dos itens</li>
          <li>
            ✅ Data de lançamento deve ser igual ou posterior à data da NF
          </li>
          <li>✅ Todos os campos obrigatórios (*) devem ser preenchidos</li>
          <li>✅ Data de lançamento é sempre a data atual por padrão</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ Seção: Dados da Despesa */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>💼</span>
            Dados da Despesa
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Emenda Parlamentar <span style={styles.required}>*</span>
              </label>
              <select
                name="emendaId"
                value={formData.emendaId}
                onChange={handleInputChange}
                style={{
                  ...styles.select,
                  ...(errors.emendaId ? styles.inputError : {}),
                }}
                required
                disabled={readOnly}
              >
                <option value="">Selecione uma emenda...</option>
                {emendas.map((emenda) => (
                  <option key={emenda.id} value={emenda.id}>
                    {formatarDisplayEmenda(emenda)}
                  </option>
                ))}
              </select>
              {errors.emendaId && (
                <div style={styles.errorMessage}>{errors.emendaId}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Natureza da Despesa <span style={styles.required}>*</span>
              </label>
              <select
                name="naturezaDespesa"
                value={formData.naturezaDespesa}
                onChange={handleInputChange}
                style={{
                  ...styles.select,
                  ...(errors.naturezaDespesa ? styles.inputError : {}),
                }}
                required
                disabled={readOnly}
              >
                <option value="">Selecione...</option>
                {naturezasDespesa.map((natureza) => (
                  <option key={natureza} value={natureza}>
                    {natureza}
                  </option>
                ))}
              </select>
              {errors.naturezaDespesa && (
                <div style={styles.errorMessage}>{errors.naturezaDespesa}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Valor Total da NF <span style={styles.required}>*</span>
                <span style={styles.autoCalculated}>
                  {" "}
                  (Calculado pelos itens)
                </span>
              </label>
              <input
                type="text"
                name="valor"
                value={formData.valor}
                style={{
                  ...styles.input,
                  backgroundColor: "#f8f9fa",
                  ...(errors.valor ? styles.inputError : {}),
                }}
                placeholder="0,00"
                disabled={true} // ✅ Campo calculado automaticamente
              />
              {errors.valor && (
                <div style={styles.errorMessage}>{errors.valor}</div>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Descrição da Despesa <span style={styles.required}>*</span>
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              style={{
                ...styles.textarea,
                ...(errors.descricao ? styles.inputError : {}),
              }}
              placeholder="Descreva detalhadamente a despesa..."
              required
              rows="3"
              disabled={readOnly}
            />
            {errors.descricao && (
              <div style={styles.errorMessage}>{errors.descricao}</div>
            )}
          </div>
        </fieldset>

        {/* ✅ Seção: Controle Fiscal */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📋</span>
            Controle Fiscal
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Número do Empenho <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="numeroEmpenho"
                value={formData.numeroEmpenho}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.numeroEmpenho ? styles.inputError : {}),
                }}
                placeholder="Ex: 2025NE000123"
                required
                disabled={readOnly}
              />
              {errors.numeroEmpenho && (
                <div style={styles.errorMessage}>{errors.numeroEmpenho}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Data do Empenho <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="dataEmpenho"
                value={formData.dataEmpenho}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.dataEmpenho ? styles.inputError : {}),
                }}
                required
                disabled={readOnly}
              />
              {errors.dataEmpenho && (
                <div style={styles.errorMessage}>{errors.dataEmpenho}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Liquidação</label>
              <input
                type="date"
                name="dataLiquidacao"
                value={formData.dataLiquidacao}
                onChange={handleInputChange}
                style={styles.input}
                disabled={readOnly}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Classificação Funcional-Programática
              </label>
              <input
                type="text"
                name="classificacaoFuncional"
                value={formData.classificacaoFuncional}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Ex: 10.122.0001.2010"
                disabled={readOnly}
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ Seção: Cronograma */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📅</span>
            Cronograma
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Data de Lançamento <span style={styles.required}>*</span>
                <span style={styles.validationNote}>
                  {" "}
                  (Deve ser ≥ Data da NF)
                </span>
              </label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.data ? styles.inputError : {}),
                }}
                required
                disabled={readOnly}
              />
              {errors.data && (
                <div style={styles.errorMessage}>{errors.data}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Pagamento</label>
              <input
                type="date"
                name="dataPagamento"
                value={formData.dataPagamento}
                onChange={handleInputChange}
                style={styles.input}
                disabled={readOnly}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Nº do Contrato <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="numeroContrato"
                value={formData.numeroContrato}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Ex: CT-2025-001"
                disabled={readOnly}
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ Seção: Dados Complementares */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📋</span>
            Dados Complementares
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Ação <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="acao"
                value={formData.acao}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.acao ? styles.inputError : {}),
                }}
                placeholder="Ex: Construção de praça"
                required
                disabled={readOnly}
              />
              {errors.acao && (
                <div style={styles.errorMessage}>{errors.acao}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Dotação Orçamentária <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="dotacaoOrcamentaria"
                value={formData.dotacaoOrcamentaria}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.dotacaoOrcamentaria ? styles.inputError : {}),
                }}
                placeholder="Ex: 12.361.0001.2010"
                required
                disabled={readOnly}
              />
              {errors.dotacaoOrcamentaria && (
                <div style={styles.errorMessage}>
                  {errors.dotacaoOrcamentaria}
                </div>
              )}
            </div>
          </div>

          {formData.observacoes && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                style={styles.textarea}
                placeholder="Observações adicionais sobre a despesa..."
                rows="2"
                disabled={readOnly}
              />
            </div>
          )}
        </fieldset>

        {/* ✅ Seção: Dados da Nota Fiscal */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🧾</span>
            Dados da Nota Fiscal
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Número da NF <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="notaFiscalNumero"
                value={formData.notaFiscalNumero}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalNumero ? styles.inputError : {}),
                }}
                placeholder="Ex: NF-001234"
                required
                disabled={readOnly}
              />
              {errors.notaFiscalNumero && (
                <div style={styles.errorMessage}>{errors.notaFiscalNumero}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Data da NF <span style={styles.required}>*</span>
                <span style={styles.validationNote}>
                  {" "}
                  (Deve ser ≤ Data de lançamento)
                </span>
              </label>
              <input
                type="date"
                name="notaFiscalData"
                value={formData.notaFiscalData}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalData ? styles.inputError : {}),
                }}
                required
                disabled={readOnly}
              />
              {errors.notaFiscalData && (
                <div style={styles.errorMessage}>{errors.notaFiscalData}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Fornecedor <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="notaFiscalFornecedor"
                value={formData.notaFiscalFornecedor}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalFornecedor ? styles.inputError : {}),
                }}
                placeholder="Nome do fornecedor"
                required
                disabled={readOnly}
              />
              {errors.notaFiscalFornecedor && (
                <div style={styles.errorMessage}>
                  {errors.notaFiscalFornecedor}
                </div>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descrição da NF</label>
            <textarea
              name="notaFiscalDescricao"
              value={formData.notaFiscalDescricao}
              onChange={handleInputChange}
              style={styles.textarea}
              placeholder="Descrição detalhada dos itens da nota fiscal..."
              rows="2"
              disabled={readOnly}
            />
          </div>
        </fieldset>

        {/* ✅ Seção: Itens da Nota Fiscal */}
        {!readOnly && (
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              <span style={styles.legendIcon}>📦</span>
              Itens da Nota Fiscal
              <span style={styles.legendNote}>
                {" "}
                (O valor da NF será o total dos itens)
              </span>
            </legend>

            {formData.itens.map((item, index) => (
              <div key={index} style={styles.itemContainer}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemTitle}>Item {index + 1}</span>
                  {formData.itens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerItem(index)}
                      style={styles.removeButton}
                      title="Remover item"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Descrição <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) =>
                        atualizarItem(index, "descricao", e.target.value)
                      }
                      style={{
                        ...styles.input,
                        ...(errors[`item_descricao_${index}`]
                          ? styles.inputError
                          : {}),
                      }}
                      placeholder="Descrição do item"
                      required
                    />
                    {errors[`item_descricao_${index}`] && (
                      <div style={styles.errorMessage}>
                        {errors[`item_descricao_${index}`]}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Valor Unitário <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={item.valor}
                      onChange={(e) =>
                        atualizarItem(index, "valor", e.target.value)
                      }
                      style={{
                        ...styles.input,
                        ...(errors[`item_valor_${index}`]
                          ? styles.inputError
                          : {}),
                      }}
                      placeholder="0,00"
                      required
                    />
                    {errors[`item_valor_${index}`] && (
                      <div style={styles.errorMessage}>
                        {errors[`item_valor_${index}`]}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Quantidade <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarItem(index, "quantidade", e.target.value)
                      }
                      style={{
                        ...styles.input,
                        ...(errors[`item_quantidade_${index}`]
                          ? styles.inputError
                          : {}),
                      }}
                      placeholder="1"
                      min="1"
                      required
                    />
                    {errors[`item_quantidade_${index}`] && (
                      <div style={styles.errorMessage}>
                        {errors[`item_quantidade_${index}`]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={adicionarItem}
              style={styles.addButton}
            >
              ➕ Adicionar Item
            </button>

            {/* Total dos Itens */}
            <div style={styles.totalItensBox}>
              <div style={styles.totalItensLabel}>
                Total dos Itens = Valor da NF:
              </div>
              <div style={styles.totalItensValor}>R$ {formData.totalItens}</div>
            </div>

            {/* ✅ Alerta sobre validação de itens */}
            {errors.itens && (
              <div style={styles.errorMessage}>{errors.itens}</div>
            )}
          </fieldset>
        )}

        {/* ✅ Seção: Upload de Arquivos - REMOVIDA TEMPORARIAMENTE */}
        {/* TODO: Implementar upload de arquivos após configurar CORS no Firebase Storage */}

        {/* ✅ Informações do Sistema */}
        <div style={styles.systemInfo}>
          <div style={styles.systemInfoTitle}>Informações do Sistema</div>
          <div style={styles.systemInfoContent}>
            <span>
              Número:{" "}
              {formData.numero ||
                despesaSalva?.numero ||
                "Será gerado automaticamente"}
            </span>
            <span>
              Criado:{" "}
              {formData.createdAt
                ? new Date(
                    formData.createdAt.toDate?.() || formData.createdAt,
                  ).toLocaleDateString("pt-BR")
                : "Agora"}
            </span>
            <span>
              Atualizado:{" "}
              {formData.updatedAt
                ? new Date(
                    formData.updatedAt.toDate?.() || formData.updatedAt,
                  ).toLocaleDateString("pt-BR")
                : "Agora"}
            </span>
          </div>
        </div>

        {/* ✅ Botões de Ação */}
        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={() => window.voltarParaListagemDespesas?.()}
            style={styles.infoButton}
          >
            📋 Listar Despesas
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={styles.cancelButton}
          >
            {readOnly ? "Fechar" : "Cancelar"}
          </button>

          {!readOnly && (
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
                : modoOperacao === "editar"
                  ? "💾 Atualizar"
                  : "💾 Salvar"}
            </button>
          )}
        </div>
      </form>

      {/* ✅ NOVO: Modal de opções pós-salvamento */}
      {renderSuccessOptions()}

      {/* ✅ Modal de Confirmação */}
      <ConfirmationModal
        isVisible={showConfirmationModal}
        onCancel={() => setShowConfirmationModal(false)}
        onConfirm={() => {
          setShowConfirmationModal(false);
          setHasChanges(false);
          setFormActive(false);
          if (onCancelar) {
            onCancelar();
          }
        }}
        title="⚠️ Alterações não salvas"
        message="Existem alterações não salvas. Deseja realmente continuar e perder as alterações?"
        confirmText="Sim, continuar"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
};

// ✅ Estilos expandidos com novos elementos
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
    margin: 0,
    fontSize: "14px",
    opacity: 0.8,
  },
  alertError: {
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    color: "#721c24",
    fontSize: "14px",
    fontWeight: "500",
  },

  // ✅ NOVO: Estilos para alerta de validações
  validationAlert: {
    backgroundColor: "#e3f2fd",
    border: "2px solid #2196f3",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    color: "#1976d2",
  },
  validationAlertHeader: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  validationAlertList: {
    margin: "0",
    paddingLeft: "20px",
    fontSize: "13px",
    lineHeight: "1.6",
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
  legendNote: {
    fontSize: "12px",
    fontWeight: "normal",
    opacity: 0.8,
    marginLeft: "8px",
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
  required: {
    color: "#dc3545",
  },
  autoCalculated: {
    color: "#28a745",
    fontSize: "12px",
    fontWeight: "normal",
  },
  validationNote: {
    color: "#fd7e14",
    fontSize: "11px",
    fontWeight: "normal",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },
  inputError: {
    borderColor: "#dc3545",
    boxShadow: "0 0 0 3px rgba(220, 53, 69, 0.1)",
  },
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "Arial, sans-serif",
  },
  errorMessage: {
    background: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: "6px",
    padding: "8px 12px",
    color: "#721c24",
    fontSize: "13px",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  itemContainer: {
    border: "2px solid #e8f0fe",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px",
    background: "white",
    position: "relative",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e8f0fe",
  },
  itemTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#154360",
  },
  removeButton: {
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  addButton: {
    background: "linear-gradient(135deg, #27AE60 0%, #219A52 100%)",
    color: "white",
    border: "2px solid #27AE60",
    borderRadius: "8px",
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "16px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  totalItensBox: {
    background: "linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)",
    border: "2px solid #27AE60",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    marginTop: "20px",
  },
  totalItensLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#155724",
    marginBottom: "8px",
  },
  totalItensValor: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#27AE60",
    fontFamily: "monospace",
  },
  // ✅ Estilos de upload removidos - será reimplementado no futuro
  systemInfo: {
    marginTop: "24px",
    padding: "16px",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
  },
  systemInfoTitle: {
    fontWeight: "600",
    color: "#495057",
    marginBottom: "8px",
    fontSize: "14px",
  },
  systemInfoContent: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    fontSize: "12px",
    color: "#6c757d",
  },
  buttonContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #dee2e6",
  },
  infoButton: {
    padding: "12px 24px",
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  cancelButton: {
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

  // ✅ NOVOS: Estilos para modal de opções pós-salvamento
  successOptionsOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  successOptionsModal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: 0,
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    animation: "slideIn 0.3s ease",
  },
  successOptionsHeader: {
    padding: "24px 24px 16px 24px",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#d4edda",
    borderRadius: "12px 12px 0 0",
    textAlign: "center",
  },
  successOptionsTitle: {
    color: "#155724",
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  successOptionsSubtitle: {
    color: "#155724",
    margin: 0,
    fontSize: "14px",
    opacity: 0.8,
  },
  successOptionsContent: {
    padding: "24px",
  },
  successOptionsQuestion: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "24px",
    textAlign: "center",
    fontWeight: "500",
  },
  successOptionsButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  successOptionButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    padding: "16px 20px",
    backgroundColor: "#f8f9fa",
    border: "2px solid #dee2e6",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    color: "#154360",
    transition: "all 0.3s ease",
    textAlign: "left",
    width: "100%",
  },
  successOptionSubtext: {
    fontSize: "13px",
    color: "#6c757d",
    fontWeight: "400",
    lineHeight: "1.4",
  },
};

// ✅ CSS adicional para animações e hover effects
const additionalCSS = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.success-option-button:hover {
  background-color: #e3f2fd !important;
  border-color: #4A90E2 !important;
  transform: translateX(4px);
}

.success-option-button:first-child:hover {
  background-color: #fff3cd !important;
  border-color: #ffc107 !important;
}

.success-option-button:nth-child(2):hover {
  background-color: #e7f3ff !important;
  border-color: #007bff !important;
}

.success-option-button:nth-child(3):hover {
  background-color: #d4edda !important;
  border-color: #28a745 !important;
}

.success-option-button:last-child:hover {
  background-color: #f8d7da !important;
  border-color: #dc3545 !important;
}

.add-button:hover {
  background-color: #219A52;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.4);
}

.remove-button:hover {
  background-color: #c82333;
  transform: scale(1.1);
}

/* Upload área removida temporariamente */

.input:focus,
.select:focus,
.textarea:focus {
  border-color: #4A90E2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  outline: none;
}

.item-container:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.total-itens-box {
  position: relative;
  overflow: hidden;
}

.total-itens-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .success-options-modal {
    width: 95%;
    margin: 20px;
  }

  .success-options-buttons {
    gap: 8px;
  }

  .success-option-button {
    padding: 12px 16px;
    font-size: 14px;
  }

  .button-container {
    flex-direction: column;
    gap: 10px;
  }

  .validation-alert-list {
    font-size: 12px;
    padding-left: 16px;
  }
}
`;

// Inserir CSS dinamicamente
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = additionalCSS;

  // Adicionar classes aos elementos para hover effects
  style.textContent += `
    .success-option-button {
      transition: all 0.3s ease;
    }
  `;

  document.head.appendChild(style);
}

export default DespesaForm;
