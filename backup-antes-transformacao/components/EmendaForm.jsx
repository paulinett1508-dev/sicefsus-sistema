import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import ConfirmationModal from "./ConfirmationModal";
import TemporaryBanner from "./TemporaryBanner";

const EmendaForm = ({
  emendaParaEditar,
  onCancelar,
  onSalvar,
  navegacaoForcada,
  onNavegacaoForcada,
  onListarEmendas,
}) => {
  const navigate = useNavigate();

  // Estados principais - Reorganizados conforme solicitação
  const [formData, setFormData] = useState({
    numero: "",
    parlamentar: "",
    emenda: "",
    tipo: "",
    validade: "",
    municipio: "",
    uf: "",
    cnpj: "",
    objetoProposta: "",
    gnd: "",
    funcional: "",
    valorTotal: "",
    outrosValores: "",
    valorExecutado: "",
    saldo: "",
    dataValidada: "",
    dataOb: "",
    inicioExecucao: "",
    finalExecucao: "",
    contrato: "",
    acaoOrcamentaria: "",
    dotacaoOrcamentaria: "",
    createdAt: "",
    updatedAt: "",
  });

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [targetPath, setTargetPath] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // ✅ CSS Styles COMPACTADOS - Layout profissional e clean
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
    infoIconOpcional: {
      color: "#6c757d",
    },
  };

  // ✅ OPÇÕES ORIGINAIS COMPLETAS
  const tiposEmenda = [
    "Individual",
    "Bancada Estadual",
    "Bancada Municipal",
    "Comissão Permanente",
    "Comissão Especial",
    "Comissão Mista",
    "Relator Geral",
    "Relator Setorial",
  ];

  const opcoesGND = [
    "1 - Pessoal e Encargos Sociais",
    "2 - Juros e Encargos da Dívida",
    "3 - Outras Despesas Correntes",
    "4 - Investimentos",
    "5 - Inversões Financeiras",
    "6 - Amortização da Dívida",
    "7 - Reserva de Contingência",
    "8 - Reserva do RPPS",
    "9 - Reserva de Contingência do RPPS",
  ];

  // Configurar formulário para edição ou nova entrada
  useEffect(() => {
    if (emendaParaEditar && !isFormInitialized) {
      const formatarData = (data) => {
        if (!data) return "";
        if (data.toDate) return data.toDate().toISOString().split("T")[0];
        if (typeof data === "string") return data.split("T")[0];
        return data;
      };

      const dadosIniciais = {
        numero: emendaParaEditar.numero || "",
        parlamentar: emendaParaEditar.parlamentar || "",
        emenda: emendaParaEditar.emenda || "",
        tipo: emendaParaEditar.tipo || "",
        municipio: emendaParaEditar.municipio || "",
        uf: emendaParaEditar.uf || "",
        cnpj: emendaParaEditar.cnpj || "",
        objetoProposta: emendaParaEditar.objetoProposta || "",
        gnd: emendaParaEditar.gnd || "",
        funcional: emendaParaEditar.funcional || "",
        valorTotal: formatarMoeda(emendaParaEditar.valorTotal) || "",
        outrosValores:
          formatarMoeda(
            emendaParaEditar.outrasComposicoes ||
              emendaParaEditar.outrosValores,
          ) || "",
        valorExecutado: formatarMoeda(emendaParaEditar.valorExecutado || 0),
        saldo: formatarMoeda(emendaParaEditar.saldo) || "",
        dataValidada: formatarData(
          emendaParaEditar.dataValidada || emendaParaEditar.validade,
        ),
        dataOb: formatarData(emendaParaEditar.dataOb),
        inicioExecucao: formatarData(emendaParaEditar.inicioExecucao),
        finalExecucao: formatarData(emendaParaEditar.finalExecucao),
        contrato: emendaParaEditar.contrato || "",
        acaoOrcamentaria: emendaParaEditar.acaoOrcamentaria || "",
        dotacaoOrcamentaria: emendaParaEditar.dotacaoOrcamentaria || "",
        createdAt: emendaParaEditar.createdAt || "",
        updatedAt: emendaParaEditar.updatedAt || "",
      };

      setFormData(dadosIniciais);
      setInitialFormData(dadosIniciais);
      setIsFormInitialized(true);

      // Carregar valor executado em tempo real dos lançamentos
      carregarValorExecutado(emendaParaEditar.id);
    }
  }, [emendaParaEditar, isFormInitialized]);

  // ✅ NOVO: Carregar valor executado em tempo real dos lançamentos
  const carregarValorExecutado = (emendaId) => {
    if (!emendaId) return;

    const lancamentosRef = collection(db, "lancamentos");
    const unsubscribe = onSnapshot(lancamentosRef, (snapshot) => {
      let totalExecutado = 0;

      snapshot.docs.forEach((doc) => {
        const lancamento = doc.data();
        if (lancamento.emendaId === emendaId && lancamento.valor) {
          totalExecutado += parseFloat(lancamento.valor) || 0;
        }
      });

      setFormData((prev) => ({
        ...prev,
        valorExecutado: formatarMoeda(totalExecutado),
      }));
    });

    return unsubscribe;
  };

  // ✅ CÁLCULO AUTOMÁTICO CORRIGIDO DO SALDO (Valor da Emenda - Valor Executado)
  useEffect(() => {
    if (isFormInitialized || formData.valorTotal || formData.valorExecutado) {
      const valorEmenda = parseCurrency(formData.valorTotal || "0");
      const valorExecutado = parseCurrency(formData.valorExecutado || "0");
      const saldoCalculado = valorEmenda - valorExecutado; // Mudança: subtração ao invés de soma

      const saldoFormatado = formatarMoeda(saldoCalculado);

      setFormData((prev) => ({
        ...prev,
        saldo: saldoFormatado,
      }));
    }
  }, [formData.valorTotal, formData.valorExecutado, isFormInitialized]);

  // Navegação forçada
  useEffect(() => {
    if (navegacaoForcada && onNavegacaoForcada) {
      onNavegacaoForcada();
    }
  }, [navegacaoForcada, onNavegacaoForcada]);

  // ✅ FORMATAÇÃO MODERNA DE MOEDA (SEM LIMITE)
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
    // Remove tudo exceto números, vírgula e ponto
    const cleanValue = value.toString().replace(/[^\d,.]/g, "");
    // Substitui vírgula por ponto para parseFloat
    const numericValue = cleanValue.replace(/\./g, "").replace(",", ".");
    return parseFloat(numericValue) || 0;
  };

  const formatarValorInput = (valor) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, "");

    // Se não há números, retorna vazio
    if (!numeros) return "";

    // Converte para número (em centavos)
    const numero = parseInt(numeros);

    // Converte para reais (divide por 100)
    const reais = numero / 100;

    // Formata como moeda brasileira
    return reais.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
    if (cnpjLimpo.length !== 14) return false;

    // Validação básica de CNPJ
    const calcularDigito = (base, pesos) => {
      const soma = base
        .split("")
        .reduce((acc, digit, index) => acc + parseInt(digit) * pesos[index], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const base = cnpjLimpo.slice(0, 12);
    const digito1 = calcularDigito(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const digito2 = calcularDigito(
      base + digito1,
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );

    return cnpjLimpo.slice(-2) === `${digito1}${digito2}`;
  };

  const formatarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
    if (cnpjLimpo.length <= 14) {
      return cnpjLimpo.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5",
      );
    }
    return cnpj;
  };

  const gerarProximoNumero = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const emendasRef = collection(db, "emendas");
      const q = query(
        emendasRef,
        where("numero", ">=", `E${currentYear}000`),
        where("numero", "<=", `E${currentYear}999`),
        orderBy("numero", "desc"),
        limit(1),
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return `E${currentYear}001`;
      }

      const ultimoNumero = snapshot.docs[0].data().numero;
      const numeroAtual = parseInt(ultimoNumero.substring(5));
      const proximoNumero = numeroAtual + 1;

      return `E${currentYear}${proximoNumero.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Erro ao gerar número:", error);
      return `E${new Date().getFullYear()}001`;
    }
  };

  const checkForChanges = (currentData) => {
    if (!initialFormData || !isFormInitialized) return false;

    const fieldsToCompare = [
      "parlamentar",
      "emenda",
      "tipo",
      "municipio",
      "valorTotal",
      "outrosValores",
      "objetoProposta",
      "cnpj",
      "uf",
      "dataValidada", // Corrigido: remover 'validade'
      "funcional",
      "dataOb",
      "inicioExecucao",
      "finalExecucao",
    ];

    return fieldsToCompare.some((field) => {
      const current = currentData[field]?.toString().trim() || "";
      const initial = initialFormData[field]?.toString().trim() || "";
      return current !== initial;
    });
  };

  const handleInputChange = (campo, valor) => {
    let valorProcessado = valor;

    // ✅ FORMATAÇÃO MODERNA DE MOEDA
    if (campo === "valorTotal" || campo === "outrosValores") {
      valorProcessado = formatarValorInput(valor);
    }

    // Formatação de CNPJ
    if (campo === "cnpj") {
      valorProcessado = formatarCNPJ(valor);
    }

    const newFormData = { ...formData, [campo]: valorProcessado };
    setFormData(newFormData);

    // Verificar mudanças apenas após inicialização
    if (isFormInitialized) {
      const hasRealChanges = checkForChanges(newFormData);
      setHasChanges(hasRealChanges);
    }
  };

  const mostrarBanner = (mensagem) => {
    setBannerMessage(mensagem);
    setShowBanner(true);
  };

  // ✅ VALIDAÇÃO COMPLETA - REORGANIZADA conforme nova estrutura
  const validarFormulario = () => {
    const camposObrigatorios = [
      { campo: "parlamentar", nome: "Nome do parlamentar" },
      { campo: "objetoProposta", nome: "Objeto da proposta" },
      { campo: "gnd", nome: "GND" },
      { campo: "emenda", nome: "Número da emenda" },
      { campo: "funcional", nome: "Funcional" },
      { campo: "tipo", nome: "Tipo da emenda" },
      { campo: "municipio", nome: "Município" },
      { campo: "uf", nome: "UF" },
      { campo: "cnpj", nome: "CNPJ" },
      { campo: "dataValidada", nome: "Data de Validade da Emenda" },
      { campo: "dataOb", nome: "Data OB" },
      { campo: "inicioExecucao", nome: "Início da execução" },
      { campo: "finalExecucao", nome: "Final da execução" },
      { campo: "valorTotal", nome: "Valor da emenda" },
      { campo: "contrato", nome: "Contrato" },
      { campo: "acaoOrcamentaria", nome: "Ação orçamentária" },
      { campo: "dotacaoOrcamentaria", nome: "Dotação orçamentária" },
    ];

    for (const { campo, nome } of camposObrigatorios) {
      if (!formData[campo] || !formData[campo].toString().trim()) {
        alert(`${nome} é obrigatório`);
        return false;
      }
    }

    if (!formData.valorTotal || parseCurrency(formData.valorTotal) <= 0) {
      alert("Valor da emenda deve ser maior que zero");
      return false;
    }

    if (formData.cnpj && !validarCNPJ(formData.cnpj)) {
      alert("CNPJ inválido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setLoading(true);

    try {
      // ✅ CALCULAR VALOR EXECUTADO REAL DOS LANÇAMENTOS
      let valorExecutadoReal = 0;

      if (emendaParaEditar?.id) {
        // Para emenda existente, buscar lançamentos
        const lancamentosRef = collection(db, "lancamentos");
        const q = query(
          lancamentosRef,
          where("emendaId", "==", emendaParaEditar.id),
        );
        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
          const lancamento = doc.data();
          if (lancamento.valor) {
            valorExecutadoReal += parseFloat(lancamento.valor) || 0;
          }
        });
      }

      const valorTotalNumerico = parseCurrency(formData.valorTotal);
      const outrosValoresNumerico = parseCurrency(
        formData.outrosValores || "0",
      );

      const dadosEmenda = {
        parlamentar: formData.parlamentar.trim(),
        emenda: formData.emenda.trim(),
        tipo: formData.tipo,
        validade: formData.dataValidada, // Mapear dataValidada para validade para compatibilidade
        municipio: formData.municipio.trim(),
        uf: formData.uf,
        cnpj: formData.cnpj.trim(),
        objetoProposta: formData.objetoProposta.trim(),
        gnd: formData.gnd.trim(),
        funcional: formData.funcional.trim(),
        valorTotal: valorTotalNumerico,
        outrasComposicoes: outrosValoresNumerico, // Manter compatibilidade
        outrosValores: outrosValoresNumerico,
        valorExecutado: valorExecutadoNumerico,
        saldo: valorTotalNumerico - valorExecutadoNumerico, // Corrigido: subtração
        dataValidada: formData.dataValidada,
        dataOb: formData.dataOb,
        inicioExecucao: formData.inicioExecucao,
        finalExecucao: formData.finalExecucao,
        contrato: formData.contrato.trim(),
        acaoOrcamentaria: formData.acaoOrcamentaria.trim(),
        dotacaoOrcamentaria: formData.dotacaoOrcamentaria.trim(),
        executado: valorExecutadoNumerico,
        updatedAt: new Date().toISOString(),
      };

      if (emendaParaEditar) {
        // Edição
        const docRef = doc(db, "emendas", emendaParaEditar.id);
        await updateDoc(docRef, dadosEmenda);
        mostrarBanner("Emenda atualizada com sucesso!");
      } else {
        // Nova emenda
        const numero = await gerarProximoNumero();
        dadosEmenda.numero = numero;
        dadosEmenda.createdAt = new Date().toISOString();

        await addDoc(collection(db, "emendas"), dadosEmenda);
        mostrarBanner("Emenda criada com sucesso!");
      }

      setHasChanges(false);

      // Navegação
      if (navegacaoForcada) {
        setTimeout(() => {
          navigate("/lancamentos", {
            state: {
              emendaSelecionada: {
                id: emendaParaEditar?.id || "nova-emenda",
                numero: formData.numero || dadosEmenda.numero,
                parlamentar: formData.parlamentar,
                objetoProposta: formData.objetoProposta,
                valorTotal: dadosEmenda.valorTotal,
                executado: dadosEmenda.executado,
                contrato: formData.contrato,
                acaoOrcamentaria: formData.acaoOrcamentaria,
                dotacaoOrcamentaria: formData.dotacaoOrcamentaria,
              },
            },
          });
        }, 2000);
      } else if (onSalvar) {
        onSalvar();
      }
    } catch (error) {
      console.error("Erro ao salvar emenda:", error);
      alert("Erro ao salvar emenda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (targetPath) => {
    if (hasChanges) {
      setShowConfirmationModal(true);
      setTargetPath(targetPath);
    } else {
      navigate(targetPath);
    }
  };

  // ✅ BOTÃO CANCELAR CORRIGIDO
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmationModal(true);
      setTargetPath("");
    } else {
      if (onCancelar) {
        onCancelar();
      } else {
        navigate("/emendas");
      }
    }
  };

  // ✅ FUNÇÃO PARA LISTAR EMENDAS - CORRIGIDA
  const handleListarEmendas = () => {
    if (hasChanges) {
      setShowConfirmationModal(true);
      setTargetPath("/emendas");
    } else {
      // Navegação direta sem verificação adicional
      if (onCancelar) {
        onCancelar(); // Usar callback se disponível
      } else {
        navigate("/emendas", { replace: true }); // Navegação forçada
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
          {emendaParaEditar ? "Editar Emenda" : "Nova Emenda Parlamentar"}
        </h2>

        {/* ✅ SEÇÃO REORGANIZADA: Proposta */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>🎯 Proposta</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome do Parlamentar *</label>
              <input
                type="text"
                value={formData.parlamentar}
                onChange={(e) =>
                  handleInputChange("parlamentar", e.target.value)
                }
                placeholder="Ex: João Silva"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroupFull}>
              <label style={styles.label}>Objeto da Proposta *</label>
              <textarea
                value={formData.objetoProposta}
                onChange={(e) =>
                  handleInputChange("objetoProposta", e.target.value)
                }
                placeholder="Descrição detalhada do projeto..."
                rows="3"
                required
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>GND *</label>
              <select
                value={formData.gnd}
                onChange={(e) => handleInputChange("gnd", e.target.value)}
                required
                style={styles.select}
              >
                <option value="">Selecione...</option>
                {opcoesGND.map((gnd) => (
                  <option key={gnd} value={gnd}>
                    {gnd}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO REORGANIZADA: Dados Básicos */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>📋 Dados Básicos</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Emenda *</label>
              <input
                type="text"
                value={formData.emenda}
                onChange={(e) => handleInputChange("emenda", e.target.value)}
                placeholder="Ex: EMD-2024-001"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Funcional *</label>
              <input
                type="text"
                value={formData.funcional}
                onChange={(e) => handleInputChange("funcional", e.target.value)}
                placeholder="Ex: 12.361.0001"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de Emenda *</label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                required
                style={styles.select}
              >
                <option value="">Selecione o tipo...</option>
                {tiposEmenda.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Seção: Localização - Mantida igual */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>📍 Localização</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Município *</label>
              <input
                type="text"
                value={formData.municipio}
                onChange={(e) => handleInputChange("municipio", e.target.value)}
                placeholder="Ex: São Paulo"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>UF *</label>
              <select
                value={formData.uf}
                onChange={(e) => handleInputChange("uf", e.target.value)}
                required
                style={styles.select}
              >
                <option value="">Selecione...</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>CNPJ *</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
                required
                style={styles.input}
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO REORGANIZADA: Valores */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>💰 Valores</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Valor da Emenda *</label>
              <input
                type="text"
                value={formData.valorTotal}
                onChange={(e) =>
                  handleInputChange("valorTotal", e.target.value)
                }
                placeholder="0,00"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Valor Executado da Emenda
                <span
                  style={{
                    ...styles.infoIcon,
                    ...styles.infoIconAuto,
                  }}
                  title="Calculado automaticamente com base nos lançamentos"
                >
                  ℹ️ Auto
                </span>
              </label>
              <input
                type="text"
                value={formData.valorExecutado}
                readOnly
                placeholder="0,00"
                style={{ ...styles.input, ...styles.inputReadOnly }}
                title="Calculado automaticamente com base nos lançamentos"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Saldo Disponível da Emenda
                <span
                  style={{
                    ...styles.infoIcon,
                    ...styles.infoIconCalc,
                  }}
                  title="Valor da Emenda - Valor Executado"
                >
                  ℹ️ Calc
                </span>
              </label>
              <input
                type="text"
                value={formData.saldo}
                readOnly
                style={{
                  ...styles.input,
                  ...styles.inputReadOnly,
                  color:
                    parseCurrency(formData.saldo) >= 0 ? "#28a745" : "#dc3545",
                  fontWeight: "bold",
                }}
                title="Valor da Emenda - Valor Executado"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Outros Valores
                <span
                  style={{
                    ...styles.infoIcon,
                    ...styles.infoIconOpcional,
                  }}
                  title="Campo opcional para valores adicionais"
                >
                  ℹ️ Opcional
                </span>
              </label>
              <input
                type="text"
                value={formData.outrosValores}
                onChange={(e) =>
                  handleInputChange("outrosValores", e.target.value)
                }
                placeholder="0,00"
                style={styles.input}
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO REORGANIZADA: Cronograma */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>📅 Cronograma</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Validade da Emenda *</label>
              <input
                type="date"
                value={formData.dataValidada}
                onChange={(e) =>
                  handleInputChange("dataValidada", e.target.value)
                }
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data OB *</label>
              <input
                type="date"
                value={formData.dataOb}
                onChange={(e) => handleInputChange("dataOb", e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Início da Execução *</label>
              <input
                type="date"
                value={formData.inicioExecucao}
                onChange={(e) =>
                  handleInputChange("inicioExecucao", e.target.value)
                }
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Final da Execução *</label>
              <input
                type="date"
                value={formData.finalExecucao}
                onChange={(e) =>
                  handleInputChange("finalExecucao", e.target.value)
                }
                required
                style={styles.input}
              />
            </div>
          </div>
        </fieldset>

        {/* Seção: Dados Complementares - Mantida igual */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>📋 Dados Complementares</legend>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contrato *</label>
              <input
                type="text"
                value={formData.contrato}
                onChange={(e) => handleInputChange("contrato", e.target.value)}
                placeholder="Número do contrato"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Ação Orçamentária *</label>
              <input
                type="text"
                value={formData.acaoOrcamentaria}
                onChange={(e) =>
                  handleInputChange("acaoOrcamentaria", e.target.value)
                }
                placeholder="Código da ação orçamentária"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dotação Orçamentária *</label>
              <input
                type="text"
                value={formData.dotacaoOrcamentaria}
                onChange={(e) =>
                  handleInputChange("dotacaoOrcamentaria", e.target.value)
                }
                placeholder="Código da dotação orçamentária"
                required
                style={styles.input}
              />
            </div>
          </div>
        </fieldset>

        {/* Informações do Sistema - Mantidas iguais */}
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
                ? new Date(formData.createdAt).toLocaleDateString()
                : "Agora"}
            </span>
            <span>
              Atualizado:{" "}
              {formData.updatedAt
                ? new Date(formData.updatedAt).toLocaleDateString()
                : "Agora"}
            </span>
          </div>
        </div>

        {/* Botões de Ação - Mantidos iguais */}
        <div style={styles.formActions}>
          {/* ✅ NOVO: Botão Listar Emendas */}
          <button
            type="button"
            onClick={handleListarEmendas}
            style={{ ...styles.btn, ...styles.btnInfo }}
          >
            📋 Listar todas as emendas
          </button>

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
            {loading
              ? "Salvando..."
              : emendaParaEditar
                ? "Atualizar"
                : "Salvar"}
          </button>

          {!emendaParaEditar && (
            <button
              type="button"
              onClick={() => {
                if (hasChanges) {
                  handleSubmit(new Event("submit"));
                } else {
                  handleNavigation("/despesas");
                }
              }}
              style={{ ...styles.btn, ...styles.btnSuccess }}
              disabled={loading}
            >
              {hasChanges ? "Salvar e Ir para Despesass" : "Ir para Despesas"}
            </button>
          )}
        </div>
      </form>

      {/* Modal de Confirmação - Mantido igual */}
      <ConfirmationModal
        isVisible={showConfirmationModal}
        onCancel={() => setShowConfirmationModal(false)}
        onConfirm={() => {
          setShowConfirmationModal(false);
          setHasChanges(false);
          if (targetPath) {
            navigate(targetPath);
          } else if (onCancelar) {
            onCancelar();
          } else {
            navigate("/emendas");
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

export default EmendaForm;
