// EmendaForm.jsx - ALTERAÇÕES CONFORME SOLICITAÇÃO
// ✅ REMOVIDO: Seção "Dados Técnicos"
// ✅ MOVIDO: Seção "Identificação" para baixo de "Dados Básicos"
// ✅ REMOVIDO: Campo "CNPJ Beneficiário" da seção Identificação
// ✅ REMOVIDO: Campo "Beneficiário" da seção Dados do Beneficiário

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useToast } from "./Toast";
import useEmendaDespesa from "../hooks/useEmendaDespesa";

// ✅ CORREÇÃO: Hook useIsMounted corrigido
const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true; // ✅ Garantir que inicia como true
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ CORREÇÃO: Retornar função que acessa o valor atual
  return useCallback(() => {
    console.log("🔍 isMounted check:", isMountedRef.current);
    return isMountedRef.current;
  }, []);
};

const EmendaForm = ({
  usuario,
  emendaParaEditar,
  onCancelar,
  onSalvar,
  onListarEmendas,
  modoVisualizacao = false,
  defaultMunicipio = null,
  defaultUf = null,
  isOperador = false,
}) => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const isMounted = useIsMounted();

  // Hook com assinatura correta para métricas
  const {
    metricas,
    loading: hookLoading,
    error: hookError,
    permissoes,
    podeEditarCampo,
  } = useEmendaDespesa(usuario, {
    emendaId: emendaParaEditar?.id,
    incluirEstatisticas: true,
    autoRefresh: false,
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ✅ Estado inicial atualizado - valorExecutado será calculado automaticamente
  const [formData, setFormData] = useState({
    // Campos obrigatórios conforme print
    parlamentar: "",
    numeroEmenda: "",
    municipio: defaultMunicipio || "",
    uf: defaultUf || "",
    valorRecurso: "",
    objetoProposta: "",
    programa: "",
    cnpj: "",
    // ✅ REMOVIDO: beneficiario (conforme solicitação)
    numeroProposta: "",
    funcional: "",
    banco: "",
    agencia: "",
    conta: "",
    // Campos existentes mantidos
    tipo: "Individual",
    cnpjMunicipio: "",
    // ✅ REMOVIDO: beneficiarioCnpj (será removido da seção Identificação)
    outrosValores: "",
    valorExecutado: 0, // ✅ ALTERADO: Agora será calculado automaticamente
    saldo: "",
    dataValidada: "",
    dataOb: "",
    inicioExecucao: "",
    finalExecucao: "",
    // ✅ REMOVIDOS: Campos da seção "Dados Técnicos"
    // gnd: "",
    // acaoOrcamentaria: "",
    // dotacaoOrcamentaria: "",
    // contrato: "",
    acoesServicos: [],
  });

  // Estados para gerenciar a nova seção
  const [tipoAcaoServico, setTipoAcaoServico] = useState("Metas Quantitativas");
  const [editandoAcaoServico, setEditandoAcaoServico] = useState(null);
  const [novaAcaoServico, setNovaAcaoServico] = useState({
    tipo: "Metas Quantitativas",
    descricao: "",
    complemento: "",
    valor: "",
  });

  // Configuração de modo simplificada
  const configModo = useMemo(() => {
    if (modoVisualizacao) return { modo: "visualizar", readOnly: true };
    if (emendaParaEditar) return { modo: "editar", readOnly: false };
    return { modo: "criar", readOnly: false };
  }, [modoVisualizacao, emendaParaEditar]);

  const readOnly = modoVisualizacao;

  // Formatação de valores monetários com digitação contínua
  const formatarValorMonetario = useCallback((valor) => {
    if (!valor) return "";

    if (typeof valor === "number") {
      return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    const apenasNumeros = valor.toString().replace(/\D/g, "");
    if (!apenasNumeros) return "";

    const numero = parseInt(apenasNumeros) || 0;
    const valorDecimal = numero / 100;

    return valorDecimal.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // Formatação de CNPJ
  const formatarCNPJ = useCallback((cnpj) => {
    if (!cnpj) return "";
    const numeros = cnpj.replace(/[^\d]/g, "");
    if (numeros.length <= 14) {
      return numeros.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }
    return cnpj;
  }, []);

  // Função para formatar moeda
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  }, []);

  // ✅ CORREÇÃO: Usar métricas do hook para valor executado
  useEffect(() => {
    if (emendaParaEditar && metricas && isMounted()) {
      console.log("📝 Carregando dados para edição:", emendaParaEditar);
      console.log("💰 Métricas carregadas:", metricas);

      const formatarParaExibicao = (valor) => {
        if (typeof valor === "number") {
          return valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        return valor || "";
      };

      setFormData({
        ...emendaParaEditar,
        valorRecurso: formatarParaExibicao(emendaParaEditar.valorRecurso),
        outrosValores: formatarParaExibicao(emendaParaEditar.outrosValores),
        // ✅ CORREÇÃO: Usar valor executado das métricas (calculado com base nas despesas)
        valorExecutado: metricas.valorExecutado || 0,
        saldo: formatarParaExibicao(
          metricas.saldoDisponivel || emendaParaEditar.saldo,
        ),
        acoesServicos: emendaParaEditar.acoesServicos || [],
      });
    }
  }, [emendaParaEditar, metricas, isMounted]); // ✅ Adicionar metricas como dependência

  // ✅ CORREÇÃO: Calcular saldo usando valor executado das métricas
  const calcularSaldo = useCallback(() => {
    const parseValue = (value) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        return parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
      }
      return 0;
    };

    const valorRecurso = parseValue(formData.valorRecurso);
    // ✅ Para edição, usar métricas; para criação, usar 0
    const valorExecutado =
      emendaParaEditar && metricas ? metricas.valorExecutado : 0;
    const saldo = valorRecurso - valorExecutado;

    return saldo;
  }, [formData.valorRecurso, emendaParaEditar, metricas]);

  // useEffect com debounce para cálculo de saldo
  useEffect(() => {
    if (!isMounted()) return;

    const timeoutId = setTimeout(() => {
      const novoSaldo = calcularSaldo();
      setFormData((prev) => ({
        ...prev,
        saldo: novoSaldo.toFixed(2),
      }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [calcularSaldo, isMounted]);

  // ✅ CORREÇÃO: Handler com limpeza de erros visuais
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      let valorFormatado = value;

      // Formatação específica para campos monetários (exceto valorExecutado)
      if (
        name === "valorRecurso" ||
        name === "outrosValores"
        // ✅ REMOVIDO: valorExecutado da formatação pois não é mais editável
      ) {
        valorFormatado = formatarValorMonetario(value);
      }

      // Formatação específica para CNPJ
      if (name === "cnpj" || name === "cnpjMunicipio") {
        valorFormatado = formatarCNPJ(value);

        // ✅ NOVO: Limpar erro visual ao digitar
        if (fieldErrors[name]) {
          setFieldErrors((prev) => ({ ...prev, [name]: false }));
        }
      }

      // ✅ NOVO: Limpar erro visual de datas ao alterar
      if (name.includes("data") || name.includes("Data")) {
        const camposData = [
          "dataValidada",
          "dataOb",
          "inicioExecucao",
          "finalExecucao",
        ];
        const novosErros = { ...fieldErrors };
        camposData.forEach((campo) => {
          if (novosErros[campo]) {
            novosErros[campo] = false;
          }
        });
        setFieldErrors(novosErros);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: valorFormatado,
      }));
    },
    [formatarValorMonetario, formatarCNPJ, fieldErrors],
  );

  // ✅ CORREÇÃO: Validação com datas e CNPJ obrigatório
  const validarFormulario = useCallback(() => {
    console.log("🔍 INICIANDO VALIDAÇÃO DO FORMULÁRIO");
    console.log("📋 Dados do formulário:", formData);

    const camposObrigatorios = [
      "parlamentar",
      "numeroEmenda",
      "municipio",
      "uf",
      "valorRecurso",
      "objetoProposta",
      "programa",
      "cnpj",
      "numeroProposta",
      "funcional",
      "banco",
      "agencia",
      "conta",
      "cnpjMunicipio", // ✅ NOVO: CNPJ do município obrigatório
      "dataValidada", // ✅ NOVO: Data de validade obrigatória
    ];

    console.log("📝 Campos obrigatórios:", camposObrigatorios);

    const camposVazios = camposObrigatorios.filter((campo) => {
      const valor = formData[campo];
      const isEmpty = !valor || valor.toString().trim() === "";
      if (isEmpty) {
        console.log(`❌ Campo vazio encontrado: ${campo} = "${valor}"`);
      } else {
        console.log(`✅ Campo preenchido: ${campo} = "${valor}"`);
      }
      return isEmpty;
    });

    console.log("📊 Campos vazios encontrados:", camposVazios);

    // ✅ Limpar erros visuais anteriores
    setFieldErrors({});
    const novosErros = {};

    if (camposVazios.length > 0) {
      const mensagem = `Campos obrigatórios não preenchidos: ${camposVazios.join(", ")}`;
      console.log("❌ VALIDAÇÃO FALHOU:", mensagem);
      error(mensagem);
      return false;
    }

    // ✅ NOVO: Validação CNPJ com destaque visual
    if (formData.cnpj && !validarCNPJ(formData.cnpj)) {
      console.log("❌ CNPJ inválido:", formData.cnpj);
      novosErros.cnpj = true;
      setFieldErrors(novosErros);
      error("CNPJ do beneficiário inválido");
      return false;
    }

    // ✅ NOVO: Validação CNPJ do município com destaque visual
    if (formData.cnpjMunicipio && !validarCNPJ(formData.cnpjMunicipio)) {
      console.log("❌ CNPJ do município inválido:", formData.cnpjMunicipio);
      novosErros.cnpjMunicipio = true;
      setFieldErrors(novosErros);
      error("CNPJ do município inválido");
      return false;
    }

    // ✅ NOVO: Validação de datas
    if (formData.dataValidada) {
      const dataValidade = new Date(formData.dataValidada);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Data de validade deve ser futura
      if (dataValidade <= hoje) {
        console.log(
          "❌ Data de validade deve ser futura:",
          formData.dataValidada,
        );
        novosErros.dataValidada = true;
        setFieldErrors(novosErros);
        error("Data de validade deve ser futura");
        return false;
      }

      // ✅ NOVO: Outras datas não podem ser maiores que data de validade
      const datasParaValidar = [
        { campo: "dataOb", label: "Data OB" },
        { campo: "inicioExecucao", label: "Início da Execução" },
        { campo: "finalExecucao", label: "Final da Execução" },
      ];

      for (const { campo, label } of datasParaValidar) {
        if (formData[campo]) {
          const dataComparacao = new Date(formData[campo]);
          if (dataComparacao > dataValidade) {
            console.log(
              `❌ ${label} não pode ser maior que data de validade:`,
              formData[campo],
            );
            novosErros[campo] = true;
            setFieldErrors(novosErros);
            error(`${label} não pode ser maior que a data de validade`);
            return false;
          }
        }
      }
    }

    console.log("✅ VALIDAÇÃO PASSOU - Todos os campos estão corretos");
    return true;
  }, [formData, error]);

  // Validação de CNPJ
  const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]/g, "");
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let soma = 0;
    let peso = 2;

    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }

    let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (parseInt(cnpj.charAt(12)) !== digito1) return false;

    soma = 0;
    peso = 2;

    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }

    let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return parseInt(cnpj.charAt(13)) === digito2;
  };

  // ✅ CORREÇÃO: Submissão com verificação melhorada de montagem
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      console.log("🚀 SUBMIT INICIADO");
      console.log("📋 FormData atual:", formData);
      console.log("🔧 Modo visualização:", modoVisualizacao);
      console.log("🏗️ Emenda para editar:", emendaParaEditar);

      // ✅ CORREÇÃO: Verificação de montagem melhorada
      const componenteMontado = isMounted();
      console.log("🔍 Componente montado?", componenteMontado);

      if (!componenteMontado) {
        console.log("❌ Componente não está montado");
        return;
      }

      if (modoVisualizacao) {
        console.log("❌ Modo visualização ativo");
        error("Modo apenas visualização - não é possível salvar");
        return;
      }

      console.log("🔍 Iniciando validação...");
      const validacao = validarFormulario();
      console.log("✅ Resultado da validação:", validacao);

      if (!validacao) {
        console.log("❌ Validação falhou");
        return;
      }

      console.log("⏳ Iniciando salvamento...");
      setLoading(true);

      try {
        // ✅ CORREÇÃO: Preparar dados com logs detalhados
        const dadosParaSalvar = {
          // Campos básicos obrigatórios
          parlamentar: formData.parlamentar,
          numeroEmenda: formData.numeroEmenda,
          municipio: formData.municipio,
          uf: formData.uf,
          valorRecurso:
            parseFloat(
              formData.valorRecurso?.replace(/[^\d,]/g, "").replace(",", "."),
            ) || 0,
          objetoProposta: formData.objetoProposta,
          programa: formData.programa,
          cnpj: formData.cnpj,
          numeroProposta: formData.numeroProposta,
          funcional: formData.funcional,
          banco: formData.banco,
          agencia: formData.agencia,
          conta: formData.conta,

          // Campos opcionais
          tipo: formData.tipo || "Individual",
          cnpjMunicipio: formData.cnpjMunicipio || "",
          outrosValores:
            parseFloat(
              formData.outrosValores?.replace(/[^\d,]/g, "").replace(",", "."),
            ) || 0,

          // Campos calculados
          valorExecutado:
            emendaParaEditar && metricas ? metricas.valorExecutado : 0,
          saldo: parseFloat(formData.saldo) || 0,

          // Datas
          dataValidada: formData.dataValidada || "",
          dataOb: formData.dataOb || "",
          inicioExecucao: formData.inicioExecucao || "",
          finalExecucao: formData.finalExecucao || "",

          // Ações e serviços
          acoesServicos: (formData.acoesServicos || []).map((item) => ({
            ...item,
            valor: item.valor
              ? parseFloat(
                  item.valor.replace(/[^\d,]/g, "").replace(",", "."),
                ) || 0
              : 0,
          })),

          // Metadados
          updatedAt: new Date().toISOString(),
        };

        console.log("💾 Dados preparados para salvar:", dadosParaSalvar);

        // ✅ CORREÇÃO: Verificação de montagem antes de Firebase
        if (!isMounted()) {
          console.log("❌ Componente desmontado durante preparação");
          return;
        }

        if (emendaParaEditar) {
          console.log("✏️ Atualizando emenda existente:", emendaParaEditar.id);
          await updateDoc(
            doc(db, "emendas", emendaParaEditar.id),
            dadosParaSalvar,
          );
          console.log("✅ Emenda atualizada com sucesso");

          if (isMounted()) {
            success("Emenda atualizada com sucesso!");
          }
        } else {
          console.log("➕ Criando nova emenda...");
          const timestamp = Date.now();
          const emendaId = `emenda_${timestamp}`;
          console.log("🆔 ID da nova emenda:", emendaId);

          const novaEmenda = {
            ...dadosParaSalvar,
            id: emendaId,
            numero:
              formData.numeroEmenda || `EMD${String(timestamp).slice(-6)}`,
            createdAt: new Date().toISOString(),
            status: "ativa",
          };

          console.log("📝 Objeto completo da nova emenda:", novaEmenda);

          const novaEmendaRef = doc(db, "emendas", emendaId);
          console.log("📄 Referência do documento:", novaEmendaRef);

          await setDoc(novaEmendaRef, novaEmenda);
          console.log("✅ Nova emenda criada com sucesso:", emendaId);

          if (isMounted()) {
            success("Emenda criada com sucesso!");
          }
        }

        // ✅ NOVO: Navegação automática para lista após salvar
        if (isMounted()) {
          console.log("🎉 Mostrando mensagem de sucesso...");
          setShowSuccessMessage(true);

          setTimeout(() => {
            if (isMounted()) {
              console.log("🔄 Executando navegação de volta...");
              setShowSuccessMessage(false);

              // ✅ CORREÇÃO: Sempre navegar de volta para lista
              if (onSalvar && typeof onSalvar === "function") {
                console.log("📞 Chamando onSalvar...");
                onSalvar();
              } else if (onCancelar && typeof onCancelar === "function") {
                console.log("📞 Chamando onCancelar para voltar à lista...");
                onCancelar();
              } else {
                // ✅ FALLBACK: Navegar diretamente se callbacks não funcionarem
                console.log("🔄 Navegando diretamente para /emendas");
                navigate("/emendas");
              }
            }
          }, 1500);
        }
      } catch (err) {
        console.error("❌ ERRO DETALHADO ao salvar emenda:", err);
        console.error("❌ Stack trace:", err.stack);
        console.error("❌ Código do erro:", err.code);
        console.error("❌ Mensagem:", err.message);

        if (isMounted()) {
          error(
            `Erro ao salvar emenda: ${err.message || "Erro desconhecido. Verifique o console."}`,
          );
        }
      } finally {
        if (isMounted()) {
          console.log("🏁 Finalizando processo de salvamento...");
          setLoading(false);
        }
      }
    },
    [
      formData,
      emendaParaEditar,
      metricas,
      error,
      success,
      onSalvar,
      onCancelar,
      isMounted,
      modoVisualizacao,
      validarFormulario,
    ],
  );

  // Estados brasileiros
  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
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
            ? "📝 Criar Emenda"
            : configModo.modo === "editar"
              ? "✏️ Editar Emenda"
              : "👁️ Visualizar Emenda"}
        </h2>
        <p style={styles.headerSubtitle}>
          {configModo.modo === "criar"
            ? "Preencha os dados para criar uma nova emenda"
            : `ID: ${emendaParaEditar?.id || ""} | Parlamentar: ${formData.parlamentar || ""}`}
        </p>
      </div>

      {showSuccessMessage && (
        <div style={styles.successMessage}>
          <span style={styles.successIcon}>✅</span>
          <span style={styles.successText}>
            {configModo.modo === "criar"
              ? "Emenda criada"
              : "Emenda atualizada"}{" "}
            com sucesso!
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ SEÇÃO 1: Dados Básicos Obrigatórios (mantida) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📋</span>
            Dados Básicos Obrigatórios
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Parlamentar <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="parlamentar"
                value={formData.parlamentar || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Número da Emenda <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="numeroEmenda"
                value={formData.numeroEmenda || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Município <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="municipio"
                value={formData.municipio || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                UF <span style={styles.required}>*</span>
              </label>
              <select
                name="uf"
                value={formData.uf || ""}
                onChange={handleInputChange}
                style={styles.select}
                disabled={modoVisualizacao}
                required
              >
                <option value="">Selecione...</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Valor do Recurso <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="valorRecurso"
                value={formData.valorRecurso || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="0,00"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Programa <span style={styles.required}>*</span>
              </label>
              <select
                name="programa"
                value={formData.programa || ""}
                onChange={handleInputChange}
                style={styles.select}
                disabled={modoVisualizacao}
                required
              >
                <option value="">Selecione o programa</option>
                <option value="2015">
                  2015 - Fortalecimento do Sistema Único de Saúde (SUS)
                </option>
                <option value="2016">
                  2016 - Política Nacional de Atenção Integral à Saúde da Mulher
                </option>
                <option value="2017">
                  2017 - Política Nacional de Atenção Integral à Saúde do Homem
                </option>
                <option value="2018">
                  2018 - Política Nacional de Atenção à Saúde dos Povos
                  Indígenas
                </option>
                <option value="2019">
                  2019 - Atenção Especializada à Saúde
                </option>
                <option value="2020">2020 - Atenção Primária à Saúde</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Objeto da Proposta <span style={styles.required}>*</span>
            </label>
            <textarea
              name="objetoProposta"
              value={formData.objetoProposta || ""}
              onChange={handleInputChange}
              style={styles.textarea}
              disabled={modoVisualizacao}
              rows={3}
              required
            />
          </div>
        </fieldset>

        {/* ✅ SEÇÃO 2: Identificação (MOVIDA para baixo de Dados Básicos) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🏛️</span>
            Identificação
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                CNPJ do Município <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="cnpjMunicipio"
                value={formData.cnpjMunicipio || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.cnpjMunicipio && styles.inputError),
                }}
                disabled={modoVisualizacao}
                placeholder="00.000.000/0000-00"
                required
              />
              {fieldErrors.cnpjMunicipio && (
                <small style={styles.errorText}>CNPJ inválido</small>
              )}
            </div>

            {/* ✅ REMOVIDO: Campo "CNPJ Beneficiário" conforme solicitação */}

            <div style={styles.formGroup}>
              <label style={styles.label}>Outros Valores</label>
              <input
                type="text"
                name="outrosValores"
                value={formData.outrosValores || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="0,00"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Valor Executado (Automático)</label>
              <input
                type="text"
                name="valorExecutado"
                value={
                  emendaParaEditar && metricas
                    ? formatCurrency(metricas.valorExecutado || 0)
                    : "R$ 0,00"
                }
                style={{
                  ...styles.input,
                  backgroundColor: "#f8f9fa",
                  color: "#6c757d",
                }}
                disabled={true}
                placeholder="Calculado automaticamente com base nas despesas"
                title="Este valor é calculado automaticamente com base nas despesas cadastradas para esta emenda"
              />
              <small
                style={{ color: "#6c757d", fontSize: "12px", marginTop: "4px" }}
              >
                💡 Valor calculado automaticamente com base nas despesas
                lançadas
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Saldo (Calculado)</label>
              <input
                type="text"
                name="saldo"
                value={formData.saldo || ""}
                style={{ ...styles.input, backgroundColor: "#f8f9fa" }}
                disabled={true}
                placeholder="0,00"
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO 3: Dados do Beneficiário (sem campo Beneficiário) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🏢</span>
            Dados do Beneficiário
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                CNPJ <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.cnpj && styles.inputError),
                }}
                disabled={modoVisualizacao}
                placeholder="00.000.000/0000-00"
                required
              />
              {fieldErrors.cnpj && (
                <small style={styles.errorText}>CNPJ inválido</small>
              )}
            </div>

            {/* ✅ REMOVIDO: Campo "Beneficiário" conforme solicitação */}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Número da Proposta <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="numeroProposta"
                value={formData.numeroProposta || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                required
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO 4: Dados Bancários (mantida) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🏦</span>
            Dados Bancários
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Banco <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="banco"
                value={formData.banco || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="001"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Agência <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="agencia"
                value={formData.agencia || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="024120"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Conta <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="conta"
                value={formData.conta || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="00002666965"
                required
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO 5: Classificação Técnica (mantida) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🔧</span>
            Classificação Técnica
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Funcional <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="funcional"
                value={formData.funcional || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo</label>
              <select
                name="tipo"
                value={formData.tipo || "Individual"}
                onChange={handleInputChange}
                style={styles.select}
                disabled={modoVisualizacao}
              >
                <option value="Individual">Individual</option>
                <option value="Bancada">Bancada</option>
                <option value="Comissão">Comissão</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* ✅ SEÇÃO 6: Ações e Serviços (mantida) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📊</span>
            Ações e Serviços
          </legend>

          {/* Formulário para adicionar nova ação/serviço */}
          <div style={styles.novaAcaoContainer}>
            <div style={styles.tipoSelector}>
              <label style={styles.label}>Tipo de Ação/Serviço</label>
              <select
                value={tipoAcaoServico}
                onChange={(e) => setTipoAcaoServico(e.target.value)}
                style={styles.select}
                disabled={modoVisualizacao}
              >
                <option value="Metas Quantitativas">Metas Quantitativas</option>
                <option value="Metas">Metas</option>
              </select>
            </div>

            <div
              style={
                window.innerWidth <= 768
                  ? styles.smallScreenAcoesFormGrid
                  : styles.acoesFormGrid
              }
            >
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {tipoAcaoServico === "Metas Quantitativas"
                    ? "Estratégia"
                    : "Título da Meta"}
                </label>
                <input
                  type="text"
                  value={novaAcaoServico.descricao}
                  onChange={(e) =>
                    setNovaAcaoServico((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  style={styles.input}
                  placeholder={
                    tipoAcaoServico === "Metas Quantitativas"
                      ? "Ex: Estratégia de Rastreamento e Controle de Condições Crônicas"
                      : "Ex: Oferta de medicamentos da Atenção Básica"
                  }
                  disabled={modoVisualizacao}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {tipoAcaoServico === "Metas Quantitativas"
                    ? "Descrição Detalhada"
                    : "Detalhamento"}
                </label>
                <textarea
                  value={novaAcaoServico.complemento}
                  onChange={(e) =>
                    setNovaAcaoServico((prev) => ({
                      ...prev,
                      complemento: e.target.value,
                    }))
                  }
                  style={{ ...styles.textarea, minHeight: "80px" }}
                  placeholder={
                    tipoAcaoServico === "Metas Quantitativas"
                      ? "Aquisição de Insumos e Materiais de Uso Contínuo para Acompanhamento de Pessoas com Condições Crônicas"
                      : "Manutenção da oferta de medicamentos, insumos e materiais de forma regular para os estabelecimentos de saúde"
                  }
                  disabled={modoVisualizacao}
                />
              </div>

              {tipoAcaoServico === "Metas Quantitativas" && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor (R$)</label>
                  <input
                    type="text"
                    value={novaAcaoServico.valor}
                    onChange={(e) => {
                      const valorFormatado = formatarValorMonetario(
                        e.target.value,
                      );
                      setNovaAcaoServico((prev) => ({
                        ...prev,
                        valor: valorFormatado,
                      }));
                    }}
                    style={styles.input}
                    placeholder="200.000,00"
                    disabled={modoVisualizacao}
                  />
                </div>
              )}

              {!modoVisualizacao && (
                <button
                  type="button"
                  onClick={() => {
                    if (!novaAcaoServico.descricao.trim()) {
                      error("Preencha a descrição/estratégia");
                      return;
                    }
                    if (!novaAcaoServico.complemento.trim()) {
                      error("Preencha o detalhamento");
                      return;
                    }
                    if (
                      tipoAcaoServico === "Metas Quantitativas" &&
                      (!novaAcaoServico.valor ||
                        novaAcaoServico.valor === "0,00")
                    ) {
                      error("Preencha o valor para Metas Quantitativas");
                      return;
                    }

                    const novaAcao = {
                      tipo: tipoAcaoServico,
                      estrategia: novaAcaoServico.descricao,
                      descricao: novaAcaoServico.complemento,
                      valor:
                        tipoAcaoServico === "Metas Quantitativas"
                          ? novaAcaoServico.valor
                          : "",
                      id: Date.now(), // ID temporário para edição
                    };

                    setFormData((prev) => ({
                      ...prev,
                      acoesServicos: [...(prev.acoesServicos || []), novaAcao],
                    }));

                    // Limpar formulário
                    setNovaAcaoServico({
                      tipo: tipoAcaoServico,
                      descricao: "",
                      complemento: "",
                      valor: "",
                    });

                    success(`${tipoAcaoServico} adicionada com sucesso!`);
                  }}
                  style={{
                    ...styles.addButton,
                    ...((!novaAcaoServico.descricao.trim() ||
                      !novaAcaoServico.complemento.trim() ||
                      (tipoAcaoServico === "Metas Quantitativas" &&
                        (!novaAcaoServico.valor ||
                          novaAcaoServico.valor === "0,00"))) &&
                      styles.addButtonDisabled),
                  }}
                  disabled={
                    !novaAcaoServico.descricao.trim() ||
                    !novaAcaoServico.complemento.trim() ||
                    (tipoAcaoServico === "Metas Quantitativas" &&
                      (!novaAcaoServico.valor ||
                        novaAcaoServico.valor === "0,00"))
                  }
                >
                  ➕ Adicionar {tipoAcaoServico}
                </button>
              )}
            </div>
          </div>

          {/* Lista de ações/serviços adicionadas */}
          <div style={styles.acoesListContainer}>
            <h4 style={{ margin: "0 0 15px 0", color: "#154360" }}>
              Ações/Serviços Cadastradas (
              {(formData.acoesServicos || []).length})
            </h4>

            {!formData.acoesServicos || formData.acoesServicos.length === 0 ? (
              <div style={styles.emptyState}>
                Nenhuma ação/serviço cadastrada ainda.
                <br />
                <small>
                  Use o formulário acima para adicionar metas quantitativas ou
                  metas.
                </small>
              </div>
            ) : (
              <div style={styles.acoesList}>
                {formData.acoesServicos.map((acao, index) => (
                  <div key={acao.id || index} style={styles.acaoItem}>
                    <div
                      style={
                        window.innerWidth <= 768
                          ? styles.smallScreenAcaoHeader
                          : styles.acaoHeader
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <span style={styles.acaoTipo}>{acao.tipo}</span>
                        {acao.tipo === "Metas Quantitativas" && acao.valor && (
                          <span style={styles.acaoValor}>
                            {typeof acao.valor === "string" &&
                            acao.valor.includes(",")
                              ? `R$ ${acao.valor}`
                              : formatCurrency(parseFloat(acao.valor) || 0)}
                          </span>
                        )}
                      </div>
                      {!modoVisualizacao && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Tem certeza que deseja remover esta ação/serviço?",
                              )
                            ) {
                              setFormData((prev) => ({
                                ...prev,
                                acoesServicos: prev.acoesServicos.filter(
                                  (_, i) => i !== index,
                                ),
                              }));
                              success("Ação/Serviço removida!");
                            }
                          }}
                          style={styles.removeButton}
                          onMouseEnter={(e) =>
                            (e.target.style.background =
                              styles.removeButtonHover.background)
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background =
                              styles.removeButton.background)
                          }
                        >
                          🗑️ Remover
                        </button>
                      )}
                    </div>

                    <div style={styles.acaoDescricao}>
                      <strong>{acao.estrategia}</strong>
                    </div>

                    <div style={styles.acaoComplemento}>{acao.descricao}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumo total apenas para Metas Quantitativas */}
            {formData.acoesServicos &&
              formData.acoesServicos.some(
                (a) => a.tipo === "Metas Quantitativas" && a.valor,
              ) && (
                <div style={styles.resumoTotal}>
                  <strong>
                    Valor Total das Metas Quantitativas:{" "}
                    {formatCurrency(
                      formData.acoesServicos
                        .filter(
                          (a) => a.tipo === "Metas Quantitativas" && a.valor,
                        )
                        .reduce((total, a) => {
                          const valor =
                            typeof a.valor === "string" && a.valor.includes(",")
                              ? parseFloat(
                                  a.valor
                                    .replace(/[^\d,]/g, "")
                                    .replace(",", "."),
                                )
                              : parseFloat(a.valor);
                          return total + (valor || 0);
                        }, 0),
                    )}
                  </strong>
                </div>
              )}
          </div>
        </fieldset>

        {/* ✅ SEÇÃO 7: Cronograma (mantida) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📅</span>
            Cronograma
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Data de Validade <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="dataValidada"
                value={formData.dataValidada || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.dataValidada && styles.inputError),
                }}
                disabled={modoVisualizacao}
                required
              />
              {fieldErrors.dataValidada && (
                <small style={styles.errorText}>Data deve ser futura</small>
              )}
              <small style={{ color: "#6c757d", fontSize: "12px" }}>
                💡 Outras datas não podem ser posteriores a esta
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data OB</label>
              <input
                type="date"
                name="dataOb"
                value={formData.dataOb || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.dataOb && styles.inputError),
                }}
                disabled={modoVisualizacao}
              />
              {fieldErrors.dataOb && (
                <small style={styles.errorText}>
                  Não pode ser maior que data de validade
                </small>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Início da Execução</label>
              <input
                type="date"
                name="inicioExecucao"
                value={formData.inicioExecucao || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.inicioExecucao && styles.inputError),
                }}
                disabled={modoVisualizacao}
              />
              {fieldErrors.inicioExecucao && (
                <small style={styles.errorText}>
                  Não pode ser maior que data de validade
                </small>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Final da Execução</label>
              <input
                type="date"
                name="finalExecucao"
                value={formData.finalExecucao || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.finalExecucao && styles.inputError),
                }}
                disabled={modoVisualizacao}
              />
              {fieldErrors.finalExecucao && (
                <small style={styles.errorText}>
                  Não pode ser maior que data de validade
                </small>
              )}
            </div>
          </div>
        </fieldset>

        {/* ✅ REMOVIDO: Seção "Dados Técnicos" conforme solicitação */}

        {/* Botões corrigidos - Voltar apenas na edição */}
        <div style={styles.buttonContainer}>
          {/* Botão Voltar apenas no modo edição */}
          {configModo.modo === "editar" && (
            <button
              type="button"
              onClick={() => {
                console.log("🔙 Botão Voltar clicado (modo edição)");
                navigate("/emendas");
              }}
              style={styles.backButton}
            >
              ← Voltar
            </button>
          )}

          {!modoVisualizacao && (
            <>
              <button
                type="button"
                onClick={() => {
                  console.log("❌ Botão Cancelar clicado");
                  if (
                    window.confirm(
                      "Tem certeza que deseja cancelar? Todas as alterações serão perdidas.",
                    )
                  ) {
                    console.log(
                      "✅ Usuário confirmou cancelamento - navegando para /emendas",
                    );
                    navigate("/emendas");
                  } else {
                    console.log("❌ Usuário cancelou o cancelamento");
                  }
                }}
                style={styles.cancelButton}
              >
                ❌ Cancelar
              </button>

              <button
                type="submit"
                onClick={(e) => {
                  console.log("🖱️ Botão Submit clicado!");
                  console.log("📋 Evento:", e);
                  console.log("🔧 Loading atual:", loading);
                  console.log("👁️ Modo visualização:", modoVisualizacao);
                  handleSubmit(e);
                }}
                style={{
                  ...styles.submitButton,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading
                  ? "Salvando..."
                  : configModo.modo === "criar"
                    ? "✅ Criar Emenda"
                    : "✅ Atualizar Emenda"}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

// Estilos compactos
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
  required: {
    color: "#dc3545",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
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
  buttonContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #dee2e6",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },
  backButton: {
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
  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
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
  novaAcaoContainer: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    border: "2px dashed #dee2e6",
  },
  tipoSelector: {
    marginBottom: "15px",
  },
  acoesFormGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 200px",
    gap: "20px",
    alignItems: "start",
  },
  addButton: {
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    whiteSpace: "nowrap",
  },
  addButtonDisabled: {
    background: "#6c757d",
    cursor: "not-allowed",
  },
  acoesListContainer: {
    marginTop: "20px",
  },
  emptyState: {
    textAlign: "center",
    color: "#6c757d",
    fontStyle: "italic",
    padding: "20px",
  },
  acoesList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  acaoItem: {
    background: "white",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  acaoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  acaoTipo: {
    background: "#154360",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "bold",
  },
  acaoValor: {
    background: "#28a745",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
  },
  removeButton: {
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "0.9em",
  },
  removeButtonHover: {
    background: "#c82333",
  },
  acaoDescricao: {
    color: "#154360",
    marginBottom: "8px",
    fontSize: "1.05em",
  },
  acaoComplemento: {
    color: "#6c757d",
    fontSize: "0.95em",
    lineHeight: "1.4",
  },
  resumoTotal: {
    background: "#e9ecef",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "center",
    color: "#154360",
  },
  smallScreenAcoesFormGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
    alignItems: "start",
  },
  smallScreenAcaoHeader: {
    flexDirection: "column",
    gap: "10px",
    alignItems: "flex-start",
  },
};

export default EmendaForm;
