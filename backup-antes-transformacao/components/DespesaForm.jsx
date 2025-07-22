// LancamentoForm.jsx - Versão Corrigida e Padronizada com EmendaForm
// Sistema Integrado de Gestão de Emendas Parlamentares
// ✅ LAYOUT IDÊNTICO AO EMENDAFORM - Estrutura padronizada
// ✅ CORREÇÕES APLICADAS - Botões funcionando, saldo atualizado
// ✅ TOTAL DOS ITENS - Campo calculado automaticamente
// ✅ VALIDAÇÕES ROBUSTAS - Data NF x Data Lançamento

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import { useNavigationProtection } from "../App";
import ConfirmationModal from "./ConfirmationModal";
import TemporaryBanner from "./TemporaryBanner";

const LancamentoForm = ({
  lancamento,
  onSalvar,
  onCancelar,
  emendaId,
  onListarLancamentos,
  usuario,
}) => {
  const navigate = useNavigate();

  // ✅ Data atual formatada para input date
  const getDataAtual = () => {
    const hoje = new Date();
    return hoje.toISOString().split("T")[0];
  };

  // ✅ Estados principais - Organizados como EmendaForm
  const [formData, setFormData] = useState({
    numero: "",
    emendaId: emendaId || "",
    descricao: "",
    valor: "",
    data: getDataAtual(), // ✅ Data atual por padrão
    dataPagamento: "",
    numeroContrato: "",
    acao: "",
    dotacaoOrcamentaria: "",
    notaFiscalNumero: "",
    notaFiscalData: "",
    notaFiscalFornecedor: "",
    itens: [{ descricao: "", valor: "", quantidade: "1" }],
    totalItens: "0,00", // ✅ NOVO campo calculado
    createdAt: "",
    updatedAt: "",
  });

  // ✅ Estados de controle - Idênticos ao EmendaForm
  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [targetPath, setTargetPath] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  // Hook de proteção de navegação
  const { setFormActive } = useNavigationProtection();

  // ✅ CSS Styles IDÊNTICOS ao EmendaForm - Layout padronizado
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "15px",
      backgroundColor: "#f4f6f8",
      minHeight: "100vh",
    },
    form: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 3px 15px rgba(20, 67, 96, 0.08)",
      marginBottom: "20px",
    },
    title: {
      color: "#154360",
      marginBottom: "20px",
      fontSize: "22px",
      fontWeight: "600",
      borderBottom: "2px solid #4A90E2",
      paddingBottom: "8px",
    },
    fieldset: {
      border: "2px solid #e8f0fe",
      borderRadius: "8px",
      padding: "18px",
      marginBottom: "18px",
      background: "linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%)",
      position: "relative",
    },
    legend: {
      fontWeight: "600",
      color: "#154360",
      padding: "6px 12px",
      fontSize: "15px",
      background: "white",
      border: "2px solid #4A90E2",
      borderRadius: "18px",
      boxShadow: "0 2px 6px rgba(74, 144, 226, 0.15)",
      marginLeft: "8px",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "15px",
      marginBottom: "12px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    formGroupFull: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      gridColumn: "1 / -1",
    },
    label: {
      fontWeight: "600",
      color: "#2c3e50",
      fontSize: "13px",
      marginBottom: "4px",
    },
    input: {
      padding: "10px 12px",
      border: "2px solid #e1e8ed",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "all 0.3s ease",
      backgroundColor: "white",
      fontFamily: "inherit",
    },
    inputFocus: {
      borderColor: "#4A90E2",
      boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
      outline: "none",
      backgroundColor: "#fafbfc",
    },
    inputReadOnly: {
      backgroundColor: "#f8f9fa",
      cursor: "not-allowed",
      borderColor: "#dee2e6",
      color: "#6c757d",
    },
    inputRequired: {
      borderColor: "#dc3545",
    },
    select: {
      padding: "10px 12px",
      border: "2px solid #e1e8ed",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "all 0.3s ease",
      backgroundColor: "white",
      fontFamily: "inherit",
      cursor: "pointer",
    },
    textarea: {
      padding: "10px 12px",
      border: "2px solid #e1e8ed",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "all 0.3s ease",
      backgroundColor: "white",
      fontFamily: "inherit",
      resize: "vertical",
      minHeight: "80px",
      lineHeight: "1.4",
    },
    formActions: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
      marginTop: "20px",
      paddingTop: "18px",
      borderTop: "2px solid #e8f0fe",
    },
    btn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px 20px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textDecoration: "none",
      border: "2px solid",
      minWidth: "110px",
      gap: "6px",
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
      borderColor: "#4A90E2",
      color: "white",
    },
    btnSecondary: {
      background: "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)",
      borderColor: "#6c757d",
      color: "white",
    },
    btnSuccess: {
      background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
      borderColor: "#28a745",
      color: "white",
    },
    btnInfo: {
      background: "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
      borderColor: "#17a2b8",
      color: "white",
    },
    systemInfo: {
      marginTop: "15px",
      padding: "10px",
      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      border: "1px solid #dee2e6",
      borderRadius: "6px",
      fontSize: "11px",
      color: "#6c757d",
    },
    itemContainer: {
      border: "2px solid #e8f0fe",
      borderRadius: "6px",
      padding: "15px",
      marginBottom: "12px",
      background: "white",
      position: "relative",
    },
    itemHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      paddingBottom: "8px",
      borderBottom: "1px solid #e8f0fe",
    },
    itemTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#154360",
    },
    removeButton: {
      background: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "28px",
      height: "28px",
      cursor: "pointer",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    addButton: {
      background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
      color: "white",
      border: "2px solid #28a745",
      borderRadius: "6px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      marginTop: "12px",
      transition: "all 0.2s ease",
    },
    uploadArea: {
      border: "2px dashed #4A90E2",
      borderRadius: "8px",
      padding: "20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: dragActive ? "#e3f2fd" : "#f8f9fa",
    },
    uploadText: {
      color: "#666",
      fontSize: "14px",
      margin: "8px 0",
    },
    totalItensBox: {
      background: "linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)",
      border: "2px solid #28a745",
      borderRadius: "8px",
      padding: "15px",
      textAlign: "center",
      marginTop: "15px",
    },
    totalItensLabel: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#155724",
      marginBottom: "8px",
    },
    totalItensValor: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#28a745",
    },
    validationError: {
      background: "#f8d7da",
      border: "1px solid #f5c6cb",
      borderRadius: "6px",
      padding: "8px 12px",
      color: "#721c24",
      fontSize: "13px",
      marginTop: "8px",
    },
    infoIcon: {
      marginLeft: "6px",
      fontSize: "12px",
      cursor: "help",
      fontWeight: "normal",
      opacity: 0.8,
      transition: "opacity 0.3s ease",
    },
    infoIconAuto: {
      color: "#17a2b8",
    },
    infoIconCalc: {
      color: "#28a745",
    },
  };

  // ✅ EFEITO: Configurar proteção de navegação
  useEffect(() => {
    setFormActive(true, "LancamentoForm", hasChanges);
    return () => setFormActive(false);
  }, [hasChanges, setFormActive]);

  // ✅ EFEITO: Carregar emendas
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "emendas"),
      (snapshot) => {
        const emendasData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            if (a.numero && b.numero) {
              return a.numero.localeCompare(b.numero);
            }
            return 0;
          });
        setEmendas(emendasData);
      },
      (error) => console.error("Erro ao carregar emendas:", error),
    );

    return unsubscribe;
  }, []);

  // ✅ EFEITO: Carregar dados do lançamento para edição
  useEffect(() => {
    if (lancamento && !isFormInitialized) {
      const itensFormatados =
        lancamento.itens?.length > 0
          ? lancamento.itens.map((item) => ({
              descricao: item.descricao || "",
              valor: formatarMoeda(item.valor || 0),
              quantidade: item.quantidade || "1",
            }))
          : [{ descricao: "", valor: "", quantidade: "1" }];

      const dadosIniciais = {
        numero: lancamento.numero || "",
        emendaId: lancamento.emendaId || "",
        descricao: lancamento.descricao || "",
        valor: formatarMoeda(lancamento.valor || 0),
        data: lancamento.data || getDataAtual(),
        dataPagamento: lancamento.dataPagamento || "",
        numeroContrato: lancamento.numeroContrato || "",
        acao: lancamento.acao || "",
        dotacaoOrcamentaria: lancamento.dotacaoOrcamentaria || "",
        notaFiscalNumero: lancamento.notaFiscalNumero || "",
        notaFiscalData: lancamento.notaFiscalData || "",
        notaFiscalFornecedor: lancamento.notaFiscalFornecedor || "",
        itens: itensFormatados,
        totalItens: "0,00",
        createdAt: lancamento.createdAt || "",
        updatedAt: lancamento.updatedAt || "",
      };

      setFormData(dadosIniciais);
      setInitialFormData(dadosIniciais);
      setIsFormInitialized(true);
    }
  }, [lancamento, isFormInitialized]);

  // ✅ FUNÇÃO: Formatação de moeda IDÊNTICA ao EmendaForm
  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return "";
    const numero = parseFloat(valor);
    if (isNaN(numero)) return "";
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (value) => {
    if (!value) return 0;
    const cleanValue = value.toString().replace(/[^\d,.]/g, "");
    const numericValue = cleanValue.replace(/\./g, "").replace(",", ".");
    return parseFloat(numericValue) || 0;
  };

  const formatarValorInput = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    if (!numeros) return "";
    const numero = parseInt(numeros);
    const reais = numero / 100;
    return reais.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ✅ FUNÇÃO: Formatar display da emenda
  const formatarDisplayEmenda = (emenda) => {
    const numero = emenda.numero || "S/N";
    const parlamentar = emenda.parlamentar || "Não informado";
    const emendaInfo = emenda.emenda || "Não informado";
    const objeto = emenda.objetoProposta || "Objeto não informado";
    const municipio = emenda.municipio || "";

    const objetoTruncado =
      objeto.length > 50 ? objeto.substring(0, 50) + "..." : objeto;

    return `${numero} - ${emendaInfo} | ${objetoTruncado} (${parlamentar} - ${municipio})`;
  };

  // ✅ FUNÇÃO: Calcular total dos itens automaticamente
  const calcularTotalItens = (itens) => {
    const total = itens.reduce((acc, item) => {
      const valor = parseCurrency(item.valor || "0");
      const quantidade = parseInt(item.quantidade || "1");
      return acc + valor * quantidade;
    }, 0);
    return formatarMoeda(total);
  };

  // ✅ EFEITO: Atualizar total dos itens automaticamente
  useEffect(() => {
    if (formData.itens && formData.itens.length > 0) {
      const novoTotal = calcularTotalItens(formData.itens);
      setFormData((prev) => ({
        ...prev,
        totalItens: novoTotal,
      }));
    }
  }, [formData.itens]);

  // ✅ FUNÇÃO: Validação de datas
  const validarDatas = (dataLancamento, dataNF) => {
    if (!dataLancamento || !dataNF) return true;

    const lancamento = new Date(dataLancamento);
    const notaFiscal = new Date(dataNF);

    return lancamento >= notaFiscal;
  };

  // ✅ FUNÇÃO: Verificar mudanças como EmendaForm
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
      "emendaId",
    ];

    return fieldsToCompare.some((field) => {
      const current = currentData[field]?.toString().trim() || "";
      const initial = initialFormData[field]?.toString().trim() || "";
      return current !== initial;
    });
  };

  // ✅ FUNÇÃO: Gerenciar itens da nota fiscal
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
      novosItens[index][campo] = formatarValorInput(valor);
    } else {
      novosItens[index][campo] = valor;
    }
    setFormData((prev) => ({ ...prev, itens: novosItens }));
    setHasChanges(true);
  };

  // ✅ FUNÇÃO: Gerenciar upload de arquivos
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processarArquivo(file);
  };

  const processarArquivo = (file) => {
    const tiposPermitidos = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/png",
      "image/jpeg",
      "application/xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(file.type)) {
      mostrarBanner(
        "❌ Tipo de arquivo não permitido. Use: PDF, DOCX, TXT, PNG, JPEG, XML, XLSX",
      );
      return;
    }

    if (file.size > tamanhoMaximo) {
      mostrarBanner("❌ Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    setUploadedFile(file);
    mostrarBanner("✅ Arquivo selecionado com sucesso!");
    setHasChanges(true);
  };

  // ✅ FUNÇÃO: Drag and Drop
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processarArquivo(e.dataTransfer.files[0]);
    }
  };

  // ✅ FUNÇÃO: Mostrar banner como EmendaForm
  const mostrarBanner = (mensagem) => {
    setBannerMessage(mensagem);
    setShowBanner(true);
  };

  // ✅ FUNÇÃO: Validação do formulário robusta
  const validarFormulario = () => {
    const novosErrors = {};

    // Campos obrigatórios básicos
    if (!formData.emendaId) novosErrors.emendaId = "Emenda é obrigatória";
    if (!formData.descricao.trim())
      novosErrors.descricao = "Descrição é obrigatória";
    if (!formData.valor) novosErrors.valor = "Valor é obrigatório";
    if (!formData.data) novosErrors.data = "Data é obrigatória";
    if (!formData.acao.trim()) novosErrors.acao = "Ação é obrigatória";
    if (!formData.dotacaoOrcamentaria.trim())
      novosErrors.dotacaoOrcamentaria = "Dotação Orçamentária é obrigatória";
    if (!formData.notaFiscalNumero.trim())
      novosErrors.notaFiscalNumero = "Número da NF é obrigatório";
    if (!formData.notaFiscalData)
      novosErrors.notaFiscalData = "Data da NF é obrigatória";
    if (!formData.notaFiscalFornecedor.trim())
      novosErrors.notaFiscalFornecedor = "Fornecedor é obrigatório";

    // ✅ Validação de datas
    if (formData.data && formData.notaFiscalData) {
      if (!validarDatas(formData.data, formData.notaFiscalData)) {
        novosErrors.data =
          "Data do lançamento não pode ser anterior à data da NF";
      }
    }

    // ✅ Validação do total dos itens
    const valorTotal = parseCurrency(formData.valor);
    const totalItens = parseCurrency(formData.totalItens);
    if (Math.abs(valorTotal - totalItens) > 0.01) {
      // Tolerância de 1 centavo
      novosErrors.totalItens =
        "O total dos itens deve ser igual ao valor total do lançamento";
    }

    // Validar itens
    formData.itens.forEach((item, index) => {
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
    });

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

  // ✅ FUNÇÃO: Gerar próximo número
  const gerarProximoNumero = async () => {
    try {
      const ano = new Date().getFullYear();
      const q = query(
        collection(db, "lancamentos"),
        where("numero", ">=", `L${ano}001`),
        where("numero", "<=", `L${ano}999`),
      );

      const snapshot = await getDocs(q);
      const numeros = snapshot.docs.map((doc) => doc.data().numero).sort();

      if (numeros.length === 0) {
        return `L${ano}001`;
      }

      const ultimoNumero = numeros[numeros.length - 1];
      const proximoSequencial = parseInt(ultimoNumero.slice(-3)) + 1;
      return `L${ano}${proximoSequencial.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Erro ao gerar número:", error);
      return `L${new Date().getFullYear()}001`;
    }
  };

  // ✅ FUNÇÃO: Atualizar saldo da emenda no Firestore
  const atualizarSaldoEmenda = async (
    emendaId,
    valorLancamento,
    isEdicao = false,
    valorAnterior = 0,
  ) => {
    try {
      const emendaRef = doc(db, "emendas", emendaId);
      const emendaSnap = await getDoc(emendaRef);

      if (emendaSnap.exists()) {
        const emendaData = emendaSnap.data();
        let novoValorExecutado = emendaData.valorExecutado || 0;

        if (isEdicao) {
          // Se for edição, subtrai o valor anterior e adiciona o novo
          novoValorExecutado =
            novoValorExecutado - valorAnterior + valorLancamento;
        } else {
          // Se for novo lançamento, apenas adiciona
          novoValorExecutado += valorLancamento;
        }

        const novoSaldo = (emendaData.valorTotal || 0) - novoValorExecutado;

        await updateDoc(emendaRef, {
          valorExecutado: novoValorExecutado,
          saldo: novoSaldo,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar saldo da emenda:", error);
    }
  };

  // ✅ FUNÇÃO: Salvar lançamento com atualização de saldo
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      mostrarBanner("❌ Corrija os erros antes de salvar");
      return;
    }

    setLoading(true);

    try {
      let attachmentUrl = null;
      let attachmentData = null;

      // Upload do arquivo se existir
      if (uploadedFile) {
        const storageRef = ref(
          storage,
          `lancamentos/${Date.now()}_${uploadedFile.name}`,
        );
        const snapshot = await uploadBytes(storageRef, uploadedFile);
        attachmentUrl = await getDownloadURL(snapshot.ref);

        attachmentData = {
          url: attachmentUrl,
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
        };
      }

      const valorNumerico = parseCurrency(formData.valor);

      // Preparar dados para salvar
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
        itens: formData.itens.map((item) => ({
          descricao: item.descricao.trim(),
          valor: parseCurrency(item.valor),
          quantidade: parseInt(item.quantidade) || 1,
        })),
        totalItens: parseCurrency(formData.totalItens),
        userId: usuario.uid,
        updatedAt: serverTimestamp(),
      };

      if (attachmentData) {
        dadosParaSalvar.attachment = attachmentData;
      }

      if (lancamento) {
        // ✅ Atualizar lançamento existente
        await updateDoc(doc(db, "lancamentos", lancamento.id), dadosParaSalvar);

        // ✅ Atualizar saldo da emenda (edição)
        const valorAnterior = lancamento.valor || 0;
        await atualizarSaldoEmenda(
          formData.emendaId,
          valorNumerico,
          true,
          valorAnterior,
        );

        mostrarBanner("✅ Lançamento atualizado com sucesso!");
      } else {
        // ✅ Criar novo lançamento
        dadosParaSalvar.numero = await gerarProximoNumero();
        dadosParaSalvar.createdAt = serverTimestamp();
        await addDoc(collection(db, "lancamentos"), dadosParaSalvar);

        // ✅ Atualizar saldo da emenda (novo)
        await atualizarSaldoEmenda(formData.emendaId, valorNumerico);

        mostrarBanner("✅ Lançamento criado com sucesso!");
      }

      setHasChanges(false);

      if (onSalvar) {
        onSalvar();
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      mostrarBanner("❌ Erro ao salvar lançamento");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO: Navegação como EmendaForm
  const handleNavigation = (targetPath) => {
    if (hasChanges) {
      setShowConfirmationModal(true);
      setTargetPath(targetPath);
    } else {
      navigate(targetPath);
    }
  };

  // ✅ FUNÇÃO: Cancelar CORRIGIDA como EmendaForm
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmationModal(true);
      setTargetPath("");
    } else {
      setFormActive(false);
      if (onCancelar) {
        onCancelar();
      } else {
        navigate("/lancamentos");
      }
    }
  };

  // ✅ FUNÇÃO: Listar lançamentos CORRIGIDA como EmendaForm
  const handleListarLancamentos = () => {
    if (hasChanges) {
      setShowConfirmationModal(true);
      setTargetPath("/lancamentos");
    } else {
      setFormActive(false);
      if (onListarLancamentos) {
        onListarLancamentos();
      } else {
        navigate("/lancamentos", { replace: true });
      }
    }
  };

  // ✅ FUNÇÃO: Controlar mudanças nos campos como EmendaForm
  const handleInputChange = (campo, valor) => {
    let valorProcessado = valor;

    if (campo === "valor") {
      valorProcessado = formatarValorInput(valor);
    }

    const newFormData = { ...formData, [campo]: valorProcessado };
    setFormData(newFormData);

    // Verificar mudanças apenas após inicialização
    if (isFormInitialized) {
      const hasRealChanges = checkForChanges(newFormData);
      setHasChanges(hasRealChanges);
    }

    // Limpar erro do campo
    if (errors[campo]) {
      setErrors((prev) => ({ ...prev, [campo]: "" }));
    }

    // ✅ Validação de data em tempo real
    if (campo === "data" || campo === "notaFiscalData") {
      const dataLancamento = campo === "data" ? valor : formData.data;
      const dataNF =
        campo === "notaFiscalData" ? valor : formData.notaFiscalData;

      if (dataLancamento && dataNF && !validarDatas(dataLancamento, dataNF)) {
        setErrors((prev) => ({
          ...prev,
          data: "Data do lançamento não pode ser anterior à data da NF",
        }));
      } else {
        setErrors((prev) => ({ ...prev, data: "" }));
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Banner Temporário */}
      <TemporaryBanner
        message={bannerMessage}
        isVisible={showBanner}
        onClose={() => setShowBanner(false)}
        type="success"
      />

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>
          {lancamento
            ? "Editar Lançamento Financeiro"
            : "Novo Lançamento Financeiro"}
        </h2>

        {/* ✅ SEÇÃO: Dados do Lançamento */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>💼 Dados do Lançamento</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Emenda Parlamentar *</label>
              <select
                style={{
                  ...styles.select,
                  ...(errors.emendaId ? styles.inputRequired : {}),
                }}
                value={formData.emendaId}
                onChange={(e) => handleInputChange("emendaId", e.target.value)}
                required
              >
                <option value="">Selecione uma emenda...</option>
                {emendas.map((emenda) => (
                  <option key={emenda.id} value={emenda.id}>
                    {formatarDisplayEmenda(emenda)}
                  </option>
                ))}
              </select>
              {errors.emendaId && (
                <div style={styles.validationError}>{errors.emendaId}</div>
              )}
            </div>

            <div style={styles.formGroupFull}>
              <label style={styles.label}>Descrição do Lançamento *</label>
              <textarea
                style={{
                  ...styles.textarea,
                  ...(errors.descricao ? styles.inputRequired : {}),
                }}
                placeholder="Descreva detalhadamente o lançamento..."
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                required
                rows="3"
              />
              {errors.descricao && (
                <div style={styles.validationError}>{errors.descricao}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Valor Total *</label>
              <input
                type="text"
                style={{
                  ...styles.input,
                  ...(errors.valor ? styles.inputRequired : {}),
                }}
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => handleInputChange("valor", e.target.value)}
                required
              />
              {errors.valor && (
                <div style={styles.validationError}>{errors.valor}</div>
              )}
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO: Cronograma */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>📅 Cronograma</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Data do Lançamento *
                <span
                  style={{ ...styles.infoIcon, ...styles.infoIconAuto }}
                  title="Data atual automática"
                >
                  ℹ️ Auto
                </span>
              </label>
              <input
                type="date"
                style={{
                  ...styles.input,
                  ...(errors.data ? styles.inputRequired : {}),
                }}
                value={formData.data}
                onChange={(e) => handleInputChange("data", e.target.value)}
                required
              />
              {errors.data && (
                <div style={styles.validationError}>{errors.data}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Pagamento</label>
              <input
                type="date"
                style={styles.input}
                value={formData.dataPagamento}
                onChange={(e) =>
                  handleInputChange("dataPagamento", e.target.value)
                }
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nº do Contrato</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Ex: CT-2025-001"
                value={formData.numeroContrato}
                onChange={(e) =>
                  handleInputChange("numeroContrato", e.target.value)
                }
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO: Dados Complementares */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>📋 Dados Complementares</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ação *</label>
              <input
                type="text"
                style={{
                  ...styles.input,
                  ...(errors.acao ? styles.inputRequired : {}),
                }}
                placeholder="Ex: Construção de praça"
                value={formData.acao}
                onChange={(e) => handleInputChange("acao", e.target.value)}
                required
              />
              {errors.acao && (
                <div style={styles.validationError}>{errors.acao}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dotação Orçamentária *</label>
              <input
                type="text"
                style={{
                  ...styles.input,
                  ...(errors.dotacaoOrcamentaria ? styles.inputRequired : {}),
                }}
                placeholder="Ex: 12.361.0001.2010"
                value={formData.dotacaoOrcamentaria}
                onChange={(e) =>
                  handleInputChange("dotacaoOrcamentaria", e.target.value)
                }
                required
              />
              {errors.dotacaoOrcamentaria && (
                <div style={styles.validationError}>
                  {errors.dotacaoOrcamentaria}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO: Dados da Nota Fiscal */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>🧾 Dados da Nota Fiscal</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Número da NF *</label>
              <input
                type="text"
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalNumero ? styles.inputRequired : {}),
                }}
                placeholder="Ex: 001234"
                value={formData.notaFiscalNumero}
                onChange={(e) =>
                  handleInputChange("notaFiscalNumero", e.target.value)
                }
                required
              />
              {errors.notaFiscalNumero && (
                <div style={styles.validationError}>
                  {errors.notaFiscalNumero}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data da NF *</label>
              <input
                type="date"
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalData ? styles.inputRequired : {}),
                }}
                value={formData.notaFiscalData}
                onChange={(e) =>
                  handleInputChange("notaFiscalData", e.target.value)
                }
                required
              />
              {errors.notaFiscalData && (
                <div style={styles.validationError}>
                  {errors.notaFiscalData}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fornecedor *</label>
              <input
                type="text"
                style={{
                  ...styles.input,
                  ...(errors.notaFiscalFornecedor ? styles.inputRequired : {}),
                }}
                placeholder="Ex: ABC Materiais Ltda"
                value={formData.notaFiscalFornecedor}
                onChange={(e) =>
                  handleInputChange("notaFiscalFornecedor", e.target.value)
                }
                required
              />
              {errors.notaFiscalFornecedor && (
                <div style={styles.validationError}>
                  {errors.notaFiscalFornecedor}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO: Itens da Nota Fiscal COM TOTAL CALCULADO */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>📦 Itens da Nota Fiscal</legend>

          {formData.itens.map((item, index) => (
            <div key={index} style={styles.itemContainer}>
              <div style={styles.itemHeader}>
                <span style={styles.itemTitle}>Item {index + 1}</span>
                {formData.itens.length > 1 && (
                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => removerItem(index)}
                    title="Remover item"
                  >
                    ×
                  </button>
                )}
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Descrição *</label>
                  <input
                    type="text"
                    style={{
                      ...styles.input,
                      ...(errors[`item_descricao_${index}`]
                        ? styles.inputRequired
                        : {}),
                    }}
                    placeholder="Ex: Cimento Portland"
                    value={item.descricao}
                    onChange={(e) =>
                      atualizarItem(index, "descricao", e.target.value)
                    }
                    required
                  />
                  {errors[`item_descricao_${index}`] && (
                    <div style={styles.validationError}>
                      {errors[`item_descricao_${index}`]}
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    style={{
                      ...styles.input,
                      ...(errors[`item_quantidade_${index}`]
                        ? styles.inputRequired
                        : {}),
                    }}
                    placeholder="1"
                    value={item.quantidade}
                    onChange={(e) =>
                      atualizarItem(index, "quantidade", e.target.value)
                    }
                    required
                  />
                  {errors[`item_quantidade_${index}`] && (
                    <div style={styles.validationError}>
                      {errors[`item_quantidade_${index}`]}
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor Unitário *</label>
                  <input
                    type="text"
                    style={{
                      ...styles.input,
                      ...(errors[`item_valor_${index}`]
                        ? styles.inputRequired
                        : {}),
                    }}
                    placeholder="0,00"
                    value={item.valor}
                    onChange={(e) =>
                      atualizarItem(index, "valor", e.target.value)
                    }
                    required
                  />
                  {errors[`item_valor_${index}`] && (
                    <div style={styles.validationError}>
                      {errors[`item_valor_${index}`]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            style={styles.addButton}
            onClick={adicionarItem}
          >
            ➕ Adicionar Item
          </button>

          {/* ✅ NOVO: Total dos Itens Calculado Automaticamente */}
          <div style={styles.totalItensBox}>
            <div style={styles.totalItensLabel}>
              Total dos Itens da Nota Fiscal
              <span
                style={{ ...styles.infoIcon, ...styles.infoIconCalc }}
                title="Calculado automaticamente"
              >
                ℹ️ Calc
              </span>
            </div>
            <div style={styles.totalItensValor}>R$ {formData.totalItens}</div>
            {errors.totalItens && (
              <div style={styles.validationError}>{errors.totalItens}</div>
            )}
          </div>
        </fieldset>

        {/* ✅ SEÇÃO: Upload de Arquivo */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>📎 Anexar Arquivo</legend>

          <div
            style={styles.uploadArea}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <div style={styles.uploadText}>
              📎 Clique ou arraste um arquivo aqui
            </div>
            <div style={styles.uploadText}>
              PDF, DOCX, TXT, PNG, JPEG, XML, XLSX (máx. 5MB)
            </div>
            {uploadedFile && (
              <div
                style={{
                  ...styles.uploadText,
                  color: "#28a745",
                  fontWeight: "bold",
                }}
              >
                ✅ {uploadedFile.name}
              </div>
            )}
          </div>

          <input
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            accept=".pdf,.docx,.txt,.png,.jpeg,.jpg,.xml,.xlsx"
            onChange={handleFileChange}
          />
        </fieldset>

        {/* Informações do Sistema - Como EmendaForm */}
        <div style={styles.systemInfo}>
          <div
            style={{ fontWeight: "600", color: "#495057", marginBottom: "5px" }}
          >
            Informações do Sistema
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              fontSize: "10px",
            }}
          >
            <span>
              Número: {formData.numero || "Será gerado automaticamente"}
            </span>
            <span>
              Criado:{" "}
              {formData.createdAt
                ? new Date(
                    formData.createdAt.toDate?.() || formData.createdAt,
                  ).toLocaleDateString()
                : "Agora"}
            </span>
            <span>
              Atualizado:{" "}
              {formData.updatedAt
                ? new Date(
                    formData.updatedAt.toDate?.() || formData.updatedAt,
                  ).toLocaleDateString()
                : "Agora"}
            </span>
          </div>
        </div>

        {/* ✅ BOTÕES DE AÇÃO - Idênticos ao EmendaForm */}
        <div style={styles.formActions}>
          {/* ✅ CORRIGIDO: Botão Listar Lançamentos */}
          <button
            type="button"
            onClick={handleListarLancamentos}
            style={{ ...styles.btn, ...styles.btnInfo }}
          >
            📋 Listar todos os lançamentos
          </button>

          {/* ✅ CORRIGIDO: Botão Cancelar */}
          <button
            type="button"
            onClick={handleCancel}
            style={{ ...styles.btn, ...styles.btnSecondary }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Salvando..." : lancamento ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>

      {/* ✅ MODAL DE CONFIRMAÇÃO - Idêntico ao EmendaForm */}
      <ConfirmationModal
        isVisible={showConfirmationModal}
        onCancel={() => setShowConfirmationModal(false)}
        onConfirm={() => {
          setShowConfirmationModal(false);
          setHasChanges(false);
          setFormActive(false);
          if (targetPath) {
            navigate(targetPath);
          } else if (onCancelar) {
            onCancelar();
          } else {
            navigate("/lancamentos");
          }
        }}
        title="Alterações não salvas"
        message="Existem alterações não salvas. Deseja realmente continuar e perder as alterações?"
        confirmText="Sim, continuar"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
};

export default LancamentoForm;
