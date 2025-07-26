// EmendaForm.jsx - CORREÇÃO DEFINITIVA - CAMPOS OBRIGATÓRIOS CONFORME PRINT
// ✅ CORREÇÃO: Baseado no arquivo original funcional
// ✅ CORREÇÃO: Apenas campos obrigatórios adicionados conforme print oficial

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

// Hook para verificar se componente está montado
const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
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

  // ✅ CORREÇÃO: Estado inicial com campos obrigatórios conforme print oficial
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
    beneficiario: "",
    numeroProposta: "",
    funcional: "",
    banco: "",
    agencia: "",
    conta: "",
    // Campos existentes mantidos
    tipo: "Individual",
    cnpjMunicipio: "",
    beneficiarioCnpj: "",
    outrosValores: "",
    valorExecutado: "",
    saldo: "",
    dataValidada: "",
    dataOb: "",
    inicioExecucao: "",
    finalExecucao: "",
    gnd: "",
    acaoOrcamentaria: "",
    dotacaoOrcamentaria: "",
    contrato: "",
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

  // ✅ CORREÇÃO: Formatação de CNPJ
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

  // Carregar dados para edição
  useEffect(() => {
    if (emendaParaEditar && isMounted()) {
      console.log("📝 Carregando dados para edição:", emendaParaEditar);

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
        valorExecutado: formatarParaExibicao(emendaParaEditar.valorExecutado),
        saldo: formatarParaExibicao(emendaParaEditar.saldo),
        acoesServicos: emendaParaEditar.acoesServicos || [],
      });
    }
  }, [emendaParaEditar, isMounted]);

  // Calcular saldo automaticamente
  const calcularSaldo = useCallback(() => {
    const parseValue = (value) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        return parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
      }
      return 0;
    };

    const valorRecurso = parseValue(formData.valorRecurso);
    const valorExecutado = parseValue(formData.valorExecutado);
    const saldo = valorRecurso - valorExecutado;

    return saldo;
  }, [formData.valorRecurso, formData.valorExecutado]);

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

  // Handler com formatação automática fluida
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      let valorFormatado = value;

      // Formatação específica para campos monetários
      if (
        name === "valorRecurso" ||
        name === "outrosValores" ||
        name === "valorExecutado"
      ) {
        valorFormatado = formatarValorMonetario(value);
      }

      // ✅ CORREÇÃO: Formatação específica para CNPJ
      if (
        name === "cnpj" ||
        name === "cnpjMunicipio" ||
        name === "beneficiarioCnpj"
      ) {
        valorFormatado = formatarCNPJ(value);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: valorFormatado,
      }));
    },
    [formatarValorMonetario, formatarCNPJ],
  );

  // ✅ CORREÇÃO: Validação com campos obrigatórios conforme print
  const validarFormulario = useCallback(() => {
    const camposObrigatorios = [
      "parlamentar",
      "numeroEmenda",
      "municipio",
      "uf",
      "valorRecurso",
      "objetoProposta",
      "programa",
      "cnpj",
      "beneficiario",
      "numeroProposta",
      "funcional",
      "banco",
      "agencia",
      "conta",
    ];

    const camposVazios = camposObrigatorios.filter(
      (campo) => !formData[campo] || formData[campo].toString().trim() === "",
    );

    if (camposVazios.length > 0) {
      error(`Campos obrigatórios não preenchidos: ${camposVazios.join(", ")}`);
      return false;
    }

    // ✅ Validação CNPJ
    if (formData.cnpj && !validarCNPJ(formData.cnpj)) {
      error("CNPJ inválido");
      return false;
    }

    return true;
  }, [formData, error]);

  // ✅ Validação de CNPJ
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

  // Submissão simplificada
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isMounted()) return;
      if (modoVisualizacao) {
        error("Modo apenas visualização - não é possível salvar");
        return;
      }

      if (!validarFormulario()) return;

      setLoading(true);

      try {
        // Preparar dados para salvar
        const dadosParaSalvar = {
          ...formData,
          valorRecurso:
            parseFloat(
              formData.valorRecurso?.replace(/[^\d,]/g, "").replace(",", "."),
            ) || 0,
          outrosValores:
            parseFloat(
              formData.outrosValores?.replace(/[^\d,]/g, "").replace(",", "."),
            ) || 0,
          valorExecutado:
            parseFloat(
              formData.valorExecutado?.replace(/[^\d,]/g, "").replace(",", "."),
            ) || 0,
          saldo: parseFloat(formData.saldo) || 0,
          updatedAt: Timestamp.now().toDate().toISOString(),
          acoesServicos: formData.acoesServicos.map((item) => ({
            ...item,
            valor: item.valor
              ? parseFloat(
                  item.valor.replace(/[^\d,]/g, "").replace(",", "."),
                ) || 0
              : 0,
          })),
        };

        if (!isMounted()) return;

        if (emendaParaEditar) {
          await updateDoc(
            doc(db, "emendas", emendaParaEditar.id),
            dadosParaSalvar,
          );
          console.log("✅ Emenda atualizada:", emendaParaEditar.id);

          if (isMounted()) {
            success("Emenda atualizada com sucesso!");
          }
        } else {
          const novaEmendaRef = doc(db, "emendas", `emenda_${Date.now()}`);
          await setDoc(novaEmendaRef, {
            ...dadosParaSalvar,
            id: novaEmendaRef.id,
            numero: `EMD${String(Date.now()).slice(-6)}`,
            createdAt: Timestamp.now().toDate().toISOString(),
          });
          console.log("✅ Nova emenda criada:", novaEmendaRef.id);

          if (isMounted()) {
            success("Emenda criada com sucesso!");
          }
        }

        if (isMounted()) {
          setShowSuccessMessage(true);
          setTimeout(() => {
            if (isMounted()) {
              setShowSuccessMessage(false);
              if (onSalvar && typeof onSalvar === "function") {
                onSalvar();
              }
            }
          }, 1500);
        }
      } catch (err) {
        console.error("❌ Erro ao salvar emenda:", err);
        if (isMounted()) {
          error("Erro ao salvar emenda. Tente novamente.");
        }
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [
      formData,
      emendaParaEditar,
      error,
      success,
      onSalvar,
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
        {/* ✅ CORREÇÃO: Dados Básicos Obrigatórios */}
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

        {/* ✅ CORREÇÃO: Dados do Beneficiário */}
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
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Beneficiário <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="beneficiario"
                value={formData.beneficiario || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                required
              />
            </div>

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

        {/* ✅ CORREÇÃO: Dados Bancários */}
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

        {/* ✅ CORREÇÃO: Classificação Técnica */}
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

        {/* Identificação (mantida do original) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🏛️</span>
            Identificação
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>CNPJ do Município</label>
              <input
                type="text"
                name="cnpjMunicipio"
                value={formData.cnpjMunicipio || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>CNPJ Beneficiário</label>
              <input
                type="text"
                name="beneficiarioCnpj"
                value={formData.beneficiarioCnpj || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="00.000.000/0000-00"
              />
            </div>

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
              <label style={styles.label}>Valor Executado</label>
              <input
                type="text"
                name="valorExecutado"
                value={formData.valorExecutado || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="0,00"
              />
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

        {/* Cronograma (mantido do original) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📅</span>
            Cronograma
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Validade</label>
              <input
                type="date"
                name="dataValidada"
                value={formData.dataValidada || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data OB</label>
              <input
                type="date"
                name="dataOb"
                value={formData.dataOb || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Início da Execução</label>
              <input
                type="date"
                name="inicioExecucao"
                value={formData.inicioExecucao || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Final da Execução</label>
              <input
                type="date"
                name="finalExecucao"
                value={formData.finalExecucao || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>
          </div>
        </fieldset>

        {/* Dados Técnicos (mantido do original) */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🔧</span>
            Dados Técnicos
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>GND</label>
              <input
                type="text"
                name="gnd"
                value={formData.gnd || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Ação Orçamentária</label>
              <input
                type="text"
                name="acaoOrcamentaria"
                value={formData.acaoOrcamentaria || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dotação Orçamentária</label>
              <input
                type="text"
                name="dotacaoOrcamentaria"
                value={formData.dotacaoOrcamentaria || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contrato</label>
              <input
                type="text"
                name="contrato"
                value={formData.contrato || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>
          </div>
        </fieldset>

        {/* Botões */}
        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={onCancelar}
            style={styles.cancelButtonStyle}
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
                ? "Salvando..."
                : configModo.modo === "criar"
                  ? "✅ Criar Emenda"
                  : "✅ Atualizar Emenda"}
            </button>
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
          border-radius: "8px",
          padding: "20px",
          marginBottom: "20px",
          border: "2px dashed #dee2e6",
        },

        tipoSelector: {
          marginBottom: "15px",
        },

        novaAcaoForm: {
          display: "grid",
          gridTemplateColumns: "2fr 3fr 1fr auto",
          gap: "15px",
          alignItems: "end",
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

        smallScreenNovaAcaoForm: {
          gridTemplateColumns: "1fr",
        },

        smallScreenAcaoHeader: {
          flexDirection: "column",
          gap: "10px",
          alignItems: "flex-start",
        },
};

export default EmendaForm;