// EmendaForm.jsx - VERSÃO CORRIGIDA COMPLETA
// ✅ Todas as anomalias resolvidas
// ✅ Hook useEmendaDespesa corrigido
// ✅ Verificação de montagem implementada
// ✅ Formatação de valores corrigida
// ✅ Performance otimizada

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useToast } from "./Toast";
import useEmendaDespesa from "../hooks/useEmendaDespesa";

// ✅ Hook para verificar se componente está montado
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
  emendaParaEditar,
  onCancelar,
  onSalvar,
  onListarEmendas,
  modoVisualizacao = false,
}) => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const isMounted = useIsMounted();

  // ✅ CORRIGIDO: Hook para dados integrados com despesas
  const {
    metricas,
    loading: hookLoading,
    error: hookError,
  } = useEmendaDespesa(emendaParaEditar?.id, {
    incluirEstatisticas: true,
    autoRefresh: false, // ✅ Desabilitado para evitar loops
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    parlamentar: "",
    numeroEmenda: "",
    tipo: "Individual",
    municipio: "",
    uf: "",
    valorRecurso: "",
    objetoProposta: "",
    cnpjMunicipio: "",
    beneficiarioCnpj: "",
    numeroProposta: "",
    programa: "",
    outrosValores: "",
    valorExecutado: "",
    saldo: "",
    dataValidada: "",
    dataOb: "",
    inicioExecucao: "",
    finalExecucao: "",
    gnd: "",
    funcional: "",
    acaoOrcamentaria: "",
    dotacaoOrcamentaria: "",
    contrato: "",
    acoesServicos: [],
  });

  // ✅ Estados para gerenciar a nova seção
  const [tipoAcaoServico, setTipoAcaoServico] = useState("Metas Quantitativas");
  const [editandoAcaoServico, setEditandoAcaoServico] = useState(null);
  const [novaAcaoServico, setNovaAcaoServico] = useState({
    tipo: "Metas Quantitativas",
    descricao: "",
    complemento: "",
    valor: "",
  });

  // Determinar modo de operação
  const modoOperacao = modoVisualizacao
    ? "visualizar"
    : emendaParaEditar
      ? "editar"
      : "criar";

  // ✅ CORRIGIDO: Formatação de valores monetários
  const formatarValorMonetario = useCallback((valor) => {
    if (!valor) return "";

    // Se já é um número, formatar diretamente
    if (typeof valor === "number") {
      return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // Remover caracteres não numéricos, exceto vírgula
    const numeroLimpo = valor.toString().replace(/[^\d,]/g, "");

    // Se não há vírgula, adicionar centavos
    if (!numeroLimpo.includes(",")) {
      const numero = parseInt(numeroLimpo) || 0;
      return (numero / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // Se há vírgula, processar como decimal
    const valorFloat = parseFloat(numeroLimpo.replace(",", ".")) || 0;
    return valorFloat.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // ✅ CORRIGIDO: Formatação de CNPJ
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

  // ✅ CORRIGIDO: Função para formatar moeda
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  }, []);

  // ✅ CORRIGIDO: Carregar dados para edição
  useEffect(() => {
    if (emendaParaEditar && isMounted()) {
      console.log("📝 Carregando dados para edição:", emendaParaEditar);

      // Formatar valores monetários para exibição
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

  // ✅ CORRIGIDO: Calcular saldo automaticamente com debounce
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

  // ✅ CORRIGIDO: useEffect com debounce para cálculo de saldo
  useEffect(() => {
    if (!isMounted()) return;

    const timeoutId = setTimeout(() => {
      const novoSaldo = calcularSaldo();
      setFormData((prev) => ({
        ...prev,
        saldo: novoSaldo.toFixed(2),
      }));
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [calcularSaldo, isMounted]);

  // ✅ CORRIGIDO: Função para gerenciar despesas
  const handleGerenciarDespesas = useCallback(() => {
    if (!isMounted()) return;

    if (!emendaParaEditar) {
      error("Salve a emenda antes de gerenciar despesas");
      return;
    }

    // Preparar dados da emenda para o filtro automático
    const filtroAutomatico = {
      emendaId: emendaParaEditar.id,
      numero: formData.numeroEmenda || emendaParaEditar.numero,
      parlamentar: formData.parlamentar,
      valorRecurso:
        parseFloat(
          formData.valorRecurso?.replace(/[^\d,]/g, "").replace(",", "."),
        ) || 0,
    };

    // Navegar para módulo Despesas com filtro automático
    navigate("/despesas", {
      state: {
        filtroAutomatico,
      },
    });
  }, [emendaParaEditar, formData, navigate, error, isMounted]);

  // ✅ CORRIGIDO: Calcular métricas financeiras para exibição
  const calcularMetricasFinanceiras = useCallback(() => {
    const valorRecurso =
      parseFloat(
        formData.valorRecurso?.replace(/[^\d,]/g, "").replace(",", "."),
      ) || 0;

    const valorExecutado = metricas?.valorExecutado || 0;
    const totalDespesas = metricas?.totalDespesas || 0;
    const saldoDisponivel = valorRecurso - valorExecutado;
    const percentualExecutado =
      valorRecurso > 0 ? (valorExecutado / valorRecurso) * 100 : 0;

    return {
      valorRecurso,
      valorExecutado,
      saldoDisponivel,
      totalDespesas,
      percentualExecutado,
    };
  }, [formData.valorRecurso, metricas]);

  // ✅ CORRIGIDO: Handler para mudanças nos campos
  const handleInputChange = useCallback(
    (e) => {
      if (!isMounted()) return;

      const { name, value } = e.target;
      let valorFormatado = value;

      // Aplicar formatações específicas
      if (
        name === "valorRecurso" ||
        name === "outrosValores" ||
        name === "valorExecutado"
      ) {
        valorFormatado = formatarValorMonetario(value);
      }

      if (name === "cnpjMunicipio" || name === "beneficiarioCnpj") {
        valorFormatado = formatarCNPJ(value);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: valorFormatado,
      }));
    },
    [formatarValorMonetario, formatarCNPJ, isMounted],
  );

  // ✅ CORRIGIDO: Funções para gerenciar Ações e Serviços
  const handleNovaAcaoServicoChange = useCallback(
    (campo, valor) => {
      if (!isMounted()) return;

      if (campo === "valor") {
        valor = formatarValorMonetario(valor);
      }
      setNovaAcaoServico((prev) => ({
        ...prev,
        [campo]: valor,
      }));
    },
    [formatarValorMonetario, isMounted],
  );

  const adicionarAcaoServico = useCallback(() => {
    if (!isMounted()) return;

    if (!novaAcaoServico.descricao.trim()) {
      error("A descrição é obrigatória para adicionar uma ação/serviço");
      return;
    }

    const novoItem = {
      id: Date.now(),
      tipo: tipoAcaoServico,
      descricao: novaAcaoServico.descricao.trim(),
      complemento: novaAcaoServico.complemento.trim(),
      valor: novaAcaoServico.valor,
    };

    setFormData((prev) => ({
      ...prev,
      acoesServicos: [...prev.acoesServicos, novoItem],
    }));

    // Limpar formulário
    setNovaAcaoServico({
      tipo: tipoAcaoServico,
      descricao: "",
      complemento: "",
      valor: "",
    });

    success("Ação/Serviço adicionado com sucesso!");
  }, [novaAcaoServico, tipoAcaoServico, error, success, isMounted]);

  const iniciarEdicaoAcaoServico = useCallback(
    (index) => {
      if (!isMounted()) return;

      const item = formData.acoesServicos[index];
      setEditandoAcaoServico(index);
      setNovaAcaoServico({
        tipo: item.tipo,
        descricao: item.descricao,
        complemento: item.complemento,
        valor: item.valor,
      });
      setTipoAcaoServico(item.tipo);
    },
    [formData.acoesServicos, isMounted],
  );

  const salvarEdicaoAcaoServico = useCallback(() => {
    if (!isMounted()) return;

    if (!novaAcaoServico.descricao.trim()) {
      error("A descrição é obrigatória");
      return;
    }

    const acoesAtualizadas = [...formData.acoesServicos];
    acoesAtualizadas[editandoAcaoServico] = {
      ...acoesAtualizadas[editandoAcaoServico],
      tipo: tipoAcaoServico,
      descricao: novaAcaoServico.descricao.trim(),
      complemento: novaAcaoServico.complemento.trim(),
      valor: novaAcaoServico.valor,
    };

    setFormData((prev) => ({
      ...prev,
      acoesServicos: acoesAtualizadas,
    }));

    // Limpar estado de edição
    setEditandoAcaoServico(null);
    setNovaAcaoServico({
      tipo: tipoAcaoServico,
      descricao: "",
      complemento: "",
      valor: "",
    });

    success("Ação/Serviço atualizado com sucesso!");
  }, [
    novaAcaoServico,
    tipoAcaoServico,
    editandoAcaoServico,
    formData.acoesServicos,
    error,
    success,
    isMounted,
  ]);

  const cancelarEdicaoAcaoServico = useCallback(() => {
    if (!isMounted()) return;

    setEditandoAcaoServico(null);
    setNovaAcaoServico({
      tipo: tipoAcaoServico,
      descricao: "",
      complemento: "",
      valor: "",
    });
  }, [tipoAcaoServico, isMounted]);

  const removerAcaoServico = useCallback(
    (index) => {
      if (!isMounted()) return;

      const acoesAtualizadas = formData.acoesServicos.filter(
        (_, i) => i !== index,
      );
      setFormData((prev) => ({
        ...prev,
        acoesServicos: acoesAtualizadas,
      }));
      success("Ação/Serviço removido com sucesso!");
    },
    [formData.acoesServicos, success, isMounted],
  );

  // ✅ CORRIGIDO: Submissão do formulário
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isMounted()) return;

      setLoading(true);

      try {
        // Validar campos obrigatórios
        const camposObrigatorios = [
          "parlamentar",
          "numeroEmenda",
          "tipo",
          "municipio",
          "uf",
          "valorRecurso",
          "objetoProposta",
        ];
        const camposVazios = camposObrigatorios.filter(
          (campo) => !formData[campo],
        );

        if (camposVazios.length > 0) {
          error(
            `Campos obrigatórios não preenchidos: ${camposVazios.join(", ")}`,
          );
          return;
        }

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
          // Atualizar emenda existente
          await updateDoc(
            doc(db, "emendas", emendaParaEditar.id),
            dadosParaSalvar,
          );
          console.log("✅ Emenda atualizada:", emendaParaEditar.id);

          if (isMounted()) {
            success("Emenda atualizada com sucesso!");
          }
        } else {
          // Criar nova emenda
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
          // Mostrar mensagem de sucesso
          setShowSuccessMessage(true);
          setTimeout(() => {
            if (isMounted()) {
              setShowSuccessMessage(false);
              onSalvar && onSalvar();
            }
          }, 2000);
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
    [formData, emendaParaEditar, error, success, onSalvar, isMounted],
  );

  // ✅ CORRIGIDO: Renderizar header baseado no modo
  const renderHeader = useCallback(() => {
    const headers = {
      criar: {
        title: "📝 Criar Emenda",
        subtitle: "Preencha os dados para criar uma nova emenda",
        bgColor: "#d4edda",
        textColor: "#155724",
      },
      editar: {
        title: "✏️ Editar Emenda",
        subtitle: `ID: ${emendaParaEditar?.id || ""} | Parlamentar: ${formData.parlamentar || ""}`,
        bgColor: "#d4edda",
        textColor: "#155724",
      },
      visualizar: {
        title: "👁️ Visualizar Emenda",
        subtitle: `ID: ${emendaParaEditar?.id || ""} | Parlamentar: ${formData.parlamentar || ""}`,
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
  }, [modoOperacao, emendaParaEditar, formData.parlamentar]);

  // ✅ CORRIGIDO: Renderizar painel financeiro integrado
  const renderPainelFinanceiro = useCallback(() => {
    if (!emendaParaEditar || !isMounted()) return null;

    const metricas = calcularMetricasFinanceiras();

    return (
      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>
          <span style={styles.legendIcon}>💰</span>
          Controle Financeiro e Despesas
        </legend>

        {/* Cards financeiros */}
        <div style={styles.financialGrid}>
          <div style={styles.financialCard}>
            <div style={styles.cardIcon}>💰</div>
            <div style={styles.cardContent}>
              <div style={styles.cardValue}>
                {formatCurrency(metricas.valorRecurso)}
              </div>
              <div style={styles.cardLabel}>Valor da Emenda</div>
            </div>
          </div>

          <div style={styles.financialCard}>
            <div style={styles.cardIcon}>📊</div>
            <div style={styles.cardContent}>
              <div style={styles.cardValue}>
                {formatCurrency(metricas.valorExecutado)}
              </div>
              <div style={styles.cardLabel}>Valor Executado</div>
              <div style={styles.cardSubtext}>
                {metricas.percentualExecutado.toFixed(1)}%
              </div>
            </div>
          </div>

          <div
            style={{
              ...styles.financialCard,
              backgroundColor:
                metricas.saldoDisponivel <= 0 ? "#ffe6e6" : "white",
            }}
          >
            <div style={styles.cardIcon}>
              {metricas.saldoDisponivel > 0 ? "💳" : "⚠️"}
            </div>
            <div style={styles.cardContent}>
              <div
                style={{
                  ...styles.cardValue,
                  color: metricas.saldoDisponivel <= 0 ? "#dc3545" : "#28a745",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(Math.abs(metricas.saldoDisponivel))}
              </div>
              <div style={styles.cardLabel}>
                {metricas.saldoDisponivel > 0
                  ? "Saldo Disponível"
                  : "Valor Excedido"}
              </div>
            </div>
          </div>

          <div style={styles.financialCard}>
            <div style={styles.cardIcon}>📋</div>
            <div style={styles.cardContent}>
              <div style={styles.cardValue}>{metricas.totalDespesas}</div>
              <div style={styles.cardLabel}>Despesas Registradas</div>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={styles.progressSection}>
          <div style={styles.progressLabel}>
            Execução da Emenda: {metricas.percentualExecutado.toFixed(1)}%
          </div>
          <div style={styles.progressBarContainer}>
            <div
              style={{
                ...styles.progressBar,
                width: `${Math.min(metricas.percentualExecutado, 100)}%`,
                backgroundColor:
                  metricas.percentualExecutado > 100
                    ? "#dc3545"
                    : metricas.percentualExecutado >= 75
                      ? "#28a745"
                      : metricas.percentualExecutado >= 50
                        ? "#ffc107"
                        : "#17a2b8",
              }}
            />
          </div>
        </div>

        {/* Botão para gerenciar despesas */}
        <div style={styles.actionButtonsContainer}>
          <button
            type="button"
            onClick={handleGerenciarDespesas}
            style={styles.manageExpensesButton}
          >
            💰 Gerenciar Despesas ({metricas.totalDespesas})
          </button>
          <div style={styles.actionButtonsInfo}>
            <span style={styles.actionButtonsText}>
              Clique para visualizar, criar ou editar despesas desta emenda
            </span>
          </div>
        </div>
      </fieldset>
    );
  }, [
    emendaParaEditar,
    calcularMetricasFinanceiras,
    formatCurrency,
    handleGerenciarDespesas,
    isMounted,
  ]);

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
      {renderHeader()}

      {showSuccessMessage && (
        <div style={styles.successMessage}>
          <span style={styles.successIcon}>✅</span>
          <span style={styles.successText}>
            {modoOperacao === "criar" ? "Emenda criada" : "Emenda atualizada"}{" "}
            com sucesso!
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ Painel Financeiro - só aparece quando editando emenda existente */}
        {renderPainelFinanceiro()}

        {/* Dados Básicos */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>📋</span>
            Dados Básicos
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Parlamentar <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="parlamentar"
                value={formData.parlamentar}
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
                value={formData.numeroEmenda}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Tipo <span style={styles.required}>*</span>
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                style={styles.select}
                disabled={modoVisualizacao}
                required
              >
                <option value="Individual">Individual</option>
                <option value="Bancada">Bancada</option>
                <option value="Comissão">Comissão</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Município <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="municipio"
                value={formData.municipio}
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
                value={formData.uf}
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
                value={formData.valorRecurso}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Objeto da Proposta <span style={styles.required}>*</span>
            </label>
            <textarea
              name="objetoProposta"
              value={formData.objetoProposta}
              onChange={handleInputChange}
              style={styles.textarea}
              disabled={modoVisualizacao}
              rows={3}
              required
            />
          </div>
        </fieldset>

        {/* Identificação */}
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
                value={formData.cnpjMunicipio}
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
                value={formData.beneficiarioCnpj}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Número da Proposta</label>
              <input
                type="text"
                name="numeroProposta"
                value={formData.numeroProposta}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Programa</label>
              <input
                type="text"
                name="programa"
                value={formData.programa}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>
          </div>
        </fieldset>

        {/* Valores */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>💰</span>
            Valores
          </legend>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Outros Valores</label>
              <input
                type="text"
                name="outrosValores"
                value={formData.outrosValores}
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
                value={formData.valorExecutado}
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
                value={formData.saldo}
                style={{ ...styles.input, backgroundColor: "#f8f9fa" }}
                disabled={true}
                placeholder="0,00"
              />
            </div>
          </div>
        </fieldset>

        {/* Cronograma */}
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
                value={formData.dataValidada}
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
                value={formData.dataOb}
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
                value={formData.inicioExecucao}
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
                value={formData.finalExecucao}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>
          </div>
        </fieldset>

        {/* ✅ Seção: Ações e Serviços */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            <span style={styles.legendIcon}>🎯</span>
            Ações e Serviços
          </legend>

          {/* Subseção: Tipo de Meta */}
          <div style={styles.subSection}>
            <h4 style={styles.subSectionTitle}>Tipo de Meta</h4>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipoMeta"
                  value="Metas Quantitativas"
                  checked={tipoAcaoServico === "Metas Quantitativas"}
                  onChange={(e) => setTipoAcaoServico(e.target.value)}
                  disabled={modoVisualizacao}
                  style={styles.radioInput}
                />
                Metas Quantitativas
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipoMeta"
                  value="Metas"
                  checked={tipoAcaoServico === "Metas"}
                  onChange={(e) => setTipoAcaoServico(e.target.value)}
                  disabled={modoVisualizacao}
                  style={styles.radioInput}
                />
                Metas
              </label>
            </div>
          </div>

          {/* Formulário para adicionar/editar ação/serviço */}
          {!modoVisualizacao && (
            <div style={styles.acaoServicoForm}>
              <h4 style={styles.subSectionTitle}>
                {editandoAcaoServico !== null ? "Editar" : "Adicionar"}{" "}
                {tipoAcaoServico}
              </h4>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Descrição</label>
                  <input
                    type="text"
                    value={novaAcaoServico.descricao}
                    onChange={(e) =>
                      handleNovaAcaoServicoChange("descricao", e.target.value)
                    }
                    style={styles.input}
                    placeholder="Descrição da ação/serviço"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Complemento</label>
                  <input
                    type="text"
                    value={novaAcaoServico.complemento}
                    onChange={(e) =>
                      handleNovaAcaoServicoChange("complemento", e.target.value)
                    }
                    style={styles.input}
                    placeholder="Informações complementares"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor</label>
                  <input
                    type="text"
                    value={novaAcaoServico.valor}
                    onChange={(e) =>
                      handleNovaAcaoServicoChange("valor", e.target.value)
                    }
                    style={styles.input}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div style={styles.acaoServicoButtons}>
                {editandoAcaoServico !== null ? (
                  <>
                    <button
                      type="button"
                      onClick={salvarEdicaoAcaoServico}
                      style={styles.saveButton}
                    >
                      💾 Salvar Alterações
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicaoAcaoServico}
                      style={styles.cancelButton}
                    >
                      ❌ Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={adicionarAcaoServico}
                    style={styles.addButton}
                  >
                    ➕ Adicionar {tipoAcaoServico}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Lista de ações/serviços adicionados */}
          {formData.acoesServicos.length > 0 && (
            <div style={styles.acaoServicoList}>
              <h4 style={styles.subSectionTitle}>
                Ações e Serviços Cadastrados ({formData.acoesServicos.length})
              </h4>

              {formData.acoesServicos.map((item, index) => (
                <div key={item.id} style={styles.acaoServicoItem}>
                  <div style={styles.acaoServicoHeader}>
                    <span style={styles.acaoServicoTipo}>{item.tipo}</span>
                    {!modoVisualizacao && (
                      <div style={styles.acaoServicoActions}>
                        <button
                          type="button"
                          onClick={() => iniciarEdicaoAcaoServico(index)}
                          style={styles.editButton}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => removerAcaoServico(index)}
                          style={styles.removeButton}
                          title="Remover"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={styles.acaoServicoContent}>
                    <div style={styles.acaoServicoField}>
                      <strong>Descrição:</strong> {item.descricao}
                    </div>
                    {item.complemento && (
                      <div style={styles.acaoServicoField}>
                        <strong>Complemento:</strong> {item.complemento}
                      </div>
                    )}
                    {item.valor && (
                      <div style={styles.acaoServicoField}>
                        <strong>Valor:</strong> R$ {item.valor}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        {/* Dados Técnicos */}
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
                value={formData.gnd}
                onChange={handleInputChange}
                style={styles.input}
                disabled={modoVisualizacao}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Funcional</label>
              <input
                type="text"
                name="funcional"
                value={formData.funcional}
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
                value={formData.acaoOrcamentaria}
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
                value={formData.dotacaoOrcamentaria}
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
                value={formData.contrato}
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
            style={styles.cancelButton}
          >
            ← Voltar
          </button>

          {!modoVisualizacao && (
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? "Salvando..."
                : modoOperacao === "criar"
                  ? "Criar Emenda"
                  : "Atualizar Emenda"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// ✅ Estilos mantidos do original
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

  // Painel Financeiro
  financialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  financialCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "white",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease",
  },

  cardIcon: {
    fontSize: "24px",
    opacity: 0.8,
  },

  cardContent: {
    flex: 1,
  },

  cardValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#154360",
    marginBottom: "2px",
  },

  cardLabel: {
    fontSize: "12px",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },

  cardSubtext: {
    fontSize: "11px",
    color: "#28a745",
    fontWeight: "600",
    marginTop: "2px",
  },

  progressSection: {
    marginTop: "16px",
    marginBottom: "24px",
  },

  progressLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "8px",
  },

  progressBarContainer: {
    position: "relative",
    height: "20px",
    backgroundColor: "#e9ecef",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #dee2e6",
  },

  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: "10px 0 0 10px",
    transition: "width 0.5s ease",
  },

  actionButtonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },

  manageExpensesButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 2px 4px rgba(74, 144, 226, 0.3)",
  },

  actionButtonsInfo: {
    textAlign: "center",
  },

  actionButtonsText: {
    fontSize: "13px",
    color: "#6c757d",
    fontStyle: "italic",
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

  // Estilos para Ações e Serviços
  subSection: {
    backgroundColor: "#f8f9fa",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    marginBottom: "20px",
  },
  subSectionTitle: {
    color: "#154360",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  radioGroup: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    cursor: "pointer",
  },
  radioInput: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  acaoServicoForm: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    marginBottom: "20px",
  },
  acaoServicoButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-start",
    marginTop: "16px",
  },
  addButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background-color 0.3s ease",
  },
  saveButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background-color 0.3s ease",
  },
  acaoServicoList: {
    marginTop: "20px",
  },
  acaoServicoItem: {
    backgroundColor: "white",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  acaoServicoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e9ecef",
  },
  acaoServicoTipo: {
    backgroundColor: "#154360",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  acaoServicoActions: {
    display: "flex",
    gap: "8px",
  },
  editButton: {
    backgroundColor: "#ffc107",
    color: "#000",
    border: "none",
    borderRadius: "4px",
    padding: "6px 10px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "6px 10px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  acaoServicoContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  acaoServicoField: {
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.5",
  },

  // Botões
  buttonContainer: {
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

export default EmendaForm;
