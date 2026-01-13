// src/components/despesa/DespesaFormBasicFields.jsx
// ✅ VERSÃO MELHORADA - 08/11/2025
// ✅ Botão "Limpar" discreto
// ✅ Campo "Valor" mais compacto e destacado
// ✅ Lógica de input corrigida

import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

const parseValorMonetario = (valor) => {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;

  const valorString = String(valor);

  // ✅ CORREÇÃO: Remove pontos PRIMEIRO, DEPOIS troca vírgula
  const valorLimpo = valorString
    .replace(/\./g, "") // Remove separador de milhar (pontos)
    .replace(",", ".") // Troca vírgula decimal por ponto
    .replace(/[^\d.-]/g, ""); // Remove qualquer outro caractere

  const numero = parseFloat(valorLimpo);
  return isNaN(numero) ? 0 : numero;
};

// Função auxiliar para formatar moeda no input (sem R$)
const formatarMoedaInput = (valor) => {
  if (!valor && valor !== 0) return "";
  const num = typeof valor === "number" ? valor : parseValorMonetario(valor);
  if (isNaN(num)) return "";

  // Formata para exibição no input (ex: 1.234,56)
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const DespesaFormBasicFields = ({
  formData,
  errors = {},
  emendaInfo = null,
  modoVisualizacao = false,
  handleInputChange,
  despesaParaEditar = null,
  onValorExcedeSaldo,
  naturezaInfo = null, // 🆕 Informações da natureza (envelope orçamentário)
  modoCriacaoDireta = false, // 🆕 Indica criação direta de despesa executada
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const [showModalConfirmacao, setShowModalConfirmacao] = useState(false);
  const [novoValorPendente, setNovoValorPendente] = useState(null);
  const [valorAnterior, setValorAnterior] = useState(null);
  const [valorExcedeSaldo, setValorExcedeSaldo] = useState(false);

  const emendaDisplay = emendaInfo
    ? `${emendaInfo.numero || emendaInfo.numeroEmenda || ""} - ${emendaInfo.parlamentar || emendaInfo.autor || ""}`
    : "Nenhuma emenda selecionada";

  const valorOriginal = React.useMemo(() => {
    if (despesaParaEditar?.valor) {
      return parseValorMonetario(despesaParaEditar.valor);
    }
    return emendaInfo?.valorPlanejado || 0;
  }, [despesaParaEditar, emendaInfo]);

  const calcularSaldoParaValidacao = () => {
    // ✅ CORREÇÃO CRÍTICA: Usar o saldo da emenda (que já exclui planejadas)
    // O saldoDisponivel da emenda é calculado APENAS com despesas executadas
    let saldoBase = emendaInfo?.saldoDisponivel ?? 0;
    
    // Se estiver editando uma despesa executada existente, 
    // devolver o valor dela ao saldo para revalidação
    if (despesaParaEditar?.id && despesaParaEditar?.status !== "PLANEJADA" && despesaParaEditar?.valor) {
      const valorAnteriorDespesa = parseValorMonetario(despesaParaEditar.valor);
      saldoBase += valorAnteriorDespesa;
    }
    
    return saldoBase;
  };

  const formatarValorMonetario = (valor) => {
    if (!valor && valor !== 0) return "";
    const num = typeof valor === "number" ? valor : parseValorMonetario(valor);
    if (isNaN(num)) return "";
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ✅ LÓGICA SIMPLIFICADA E CORRIGIDA
  const handleValorChange = (e) => {
    const valorDigitado = e.target.value;

    // Permite campo vazio
    if (
      valorDigitado === "" ||
      valorDigitado === "R$ " ||
      valorDigitado === "R$"
    ) {
      handleInputChange({ target: { name: "valor", value: "" } });
      return;
    }

    // Remove TUDO exceto números
    let apenasNumeros = valorDigitado.replace(/\D/g, "");

    if (apenasNumeros === "") {
      handleInputChange({ target: { name: "valor", value: "" } });
      return;
    }

    // ✅ LÓGICA SIMPLES: Sempre divide por 100 para tratar como centavos
    const numeroValor = parseFloat(apenasNumeros) / 100;

    // Formata para exibição
    const valorFormatado = formatarValorMonetario(numeroValor);

    // Atualiza o estado através da função pai
    handleInputChange({ target: { name: "valor", value: valorFormatado } });
  };

  const handleValorBlur = (e) => {
    const valorAtual = e.target.value;

    // Se campo vazio, não faz nada
    if (!valorAtual || valorAtual === "R$ ") {
      return;
    }

    const numeroValor = parseValorMonetario(valorAtual);

    // Verifica se houve alteração significativa
    const diferencaSignificativa = Math.abs(numeroValor - valorOriginal) > 0.01;
    const deveAbrirModal =
      valorOriginal > 0 && numeroValor > 0 && diferencaSignificativa;

    if (deveAbrirModal) {
      setValorAnterior(valorOriginal);
      setNovoValorPendente(numeroValor);
      setShowModalConfirmacao(true);
    }
  };

  const confirmarAlteracaoValor = () => {
    const eventoSimulado = {
      target: {
        name: "valor",
        value: formatarValorMonetario(novoValorPendente),
      },
    };
    handleInputChange(eventoSimulado);
    setShowModalConfirmacao(false);
    setNovoValorPendente(null);
    setValorAnterior(null);
  };

  const cancelarAlteracaoValor = () => {
    const eventoSimulado = {
      target: {
        name: "valor",
        value: formatarValorMonetario(valorOriginal),
      },
    };
    handleInputChange(eventoSimulado);
    setShowModalConfirmacao(false);
    setNovoValorPendente(null);
    setValorAnterior(null);
  };

  // Atualizar valor quando emendaInfo ou naturezaInfo mudar (para modo criar)
  useEffect(() => {
    if (!despesaParaEditar) {
      // 🆕 Priorizar saldo da natureza se estiver criando dentro de uma natureza
      if (modoCriacaoDireta && naturezaInfo?.saldoDisponivel > 0) {
        const valorFormatado = formatarMoedaInput(
          String(naturezaInfo.saldoDisponivel),
        );
        handleInputChange({
          target: {
            name: "valor",
            value: valorFormatado,
          },
        });
        return;
      }
      // Fallback: usar saldo da emenda
      if (emendaInfo?.saldoDisponivel) {
        const valorFormatado = formatarMoedaInput(
          String(emendaInfo.saldoDisponivel),
        );
        handleInputChange({
          target: {
            name: "valor",
            value: valorFormatado,
          },
        });
      }
    }
  }, [emendaInfo?.saldoDisponivel, despesaParaEditar, modoCriacaoDireta, naturezaInfo?.saldoDisponivel]);

  // ✅ FORMATAR VALOR AO CARREGAR DESPESA PARA EDIÇÃO
  useEffect(() => {
    if (despesaParaEditar?.valor) {
      const valorNum = parseValorMonetario(despesaParaEditar.valor);
      const valorFormatado = formatarValorMonetario(valorNum);

      // Só atualiza se o valor atual for diferente
      const valorAtualFormatado = formatarValorMonetario(formData.valor);
      if (valorFormatado !== valorAtualFormatado) {
        handleInputChange({
          target: {
            name: "valor",
            value: valorFormatado,
          },
        });
      }
    }
  }, [despesaParaEditar?.valor]);

  // ✅ VALIDAÇÃO DE SALDO - Diferente para cada modo
  useEffect(() => {
    // 🆕 Se é criação direta (despesa executada) E tem naturezaInfo, validar saldo da NATUREZA
    if (modoCriacaoDireta && naturezaInfo) {
      const valorDespesa = parseValorMonetario(formData.valor);
      const saldoNatureza = naturezaInfo.saldoDisponivel || 0;

      const excede = valorDespesa > saldoNatureza;
      setValorExcedeSaldo(excede);
      onValorExcedeSaldo?.(excede);

      if (excede) {
        console.log(`⚠️ Valor excede saldo da natureza: R$ ${valorDespesa.toFixed(2)} > R$ ${saldoNatureza.toFixed(2)}`);
      }
      return;
    }

    // 🚫 Despesas planejadas: SEM validação de saldo
    // ✅ É apenas planejamento, pode ser qualquer valor
    setValorExcedeSaldo(false);
    onValorExcedeSaldo?.(false);
  }, [formData.valor, onValorExcedeSaldo, modoCriacaoDireta, naturezaInfo]);


  const styles = {
    fieldset: {
      border: "1px solid var(--theme-border, #E2E8F0)",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px",
      backgroundColor: "var(--theme-surface, #ffffff)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    legend: {
      background: "var(--theme-surface, white)",
      padding: "6px 16px",
      borderRadius: "9999px",
      border: "1px solid var(--theme-border, #E2E8F0)",
      color: "var(--theme-text, #334155)",
      fontWeight: "600",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontFamily: "'Inter', sans-serif",
    },
    legendIcon: { fontSize: "18px" },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "20px",
    },
    formGridRow: {
      display: "grid",
      gridTemplateColumns: "0.8fr 1.2fr", // ✅ Emenda 40%, Valor 60%
      gap: "20px",
      alignItems: "start",
    },
    formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
    formGroupFull: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      gridColumn: "1 / -1",
    },
    label: {
      fontWeight: "600",
      color: "var(--theme-text, #1E293B)",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    requiredMark: { color: "#e74c3c", fontSize: "16px", marginLeft: "2px" },
    input: {
      padding: "14px 16px",
      height: "54px",
      width: "100%",
      border: "2px solid var(--theme-border, #bdc3c7)",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
      backgroundColor: "var(--theme-input-bg, white)",
      color: "var(--theme-text, inherit)",
      boxSizing: "border-box",
    },
    inputError: {
      padding: "14px 16px",
      height: "54px",
      width: "100%",
      border: "2px solid #e74c3c",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
      backgroundColor: isDark ? "rgba(220, 53, 69, 0.1)" : "#fff5f5",
      color: isDark ? "var(--theme-text)" : "inherit",
      boxSizing: "border-box",
    },
    // ✅ CAMPO VALOR DESTACADO - Dark mode compatible
    inputValor: {
      padding: "14px 16px",
      height: "54px",
      border: `2px solid ${isDark ? "#22c55e" : "#27ae60"}`,
      borderRadius: "8px",
      fontSize: "18px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      backgroundColor: isDark ? "rgba(34, 197, 94, 0.1)" : "#f0fdf4",
      color: isDark ? "#4ade80" : "#065f46",
      textAlign: "right",
      letterSpacing: "0.5px",
      boxSizing: "border-box",
    },
    inputValorError: {
      padding: "14px 16px",
      height: "54px",
      border: "2px solid #e74c3c",
      borderRadius: "8px",
      fontSize: "18px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      backgroundColor: isDark ? "rgba(220, 53, 69, 0.1)" : "#fef2f2",
      color: isDark ? "#f87171" : "#991b1b",
      textAlign: "right",
      letterSpacing: "0.5px",
      boxSizing: "border-box",
    },
    emendaInfoBox: {
      padding: "14px 16px",
      height: "54px",
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#e8f4f8",
      border: `2px solid ${isDark ? "#3b82f6" : "#3498db"}`,
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      boxSizing: "border-box",
    },
    emendaText: {
      color: "var(--theme-text, #1E293B)",
      fontWeight: "500",
      fontSize: "14px",
    },
    errorText: {
      color: "#e74c3c",
      fontSize: "13px",
      marginTop: "4px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },
    // ✅ BOTÃO LIMPAR DISCRETO - Dark mode compatible
    clearButton: {
      padding: "8px 12px",
      backgroundColor: isDark ? "var(--theme-surface-secondary, #1e293b)" : "#f8f9fa",
      color: isDark ? "var(--theme-text-secondary)" : "#6c757d",
      border: `1px solid ${isDark ? "var(--theme-border)" : "#dee2e6"}`,
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    clearButtonHover: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#e9ecef",
      borderColor: isDark ? "var(--theme-border)" : "#adb5bd",
      transform: "scale(1.02)",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
      backdropFilter: "blur(4px)",
    },
    modalContent: {
      backgroundColor: "var(--theme-surface, white)",
      borderRadius: "12px",
      width: "90%",
      maxWidth: "500px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      overflow: "hidden",
    },
    modalHeader: {
      padding: "20px",
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fff3cd",
      borderBottom: `2px solid ${isDark ? "#f59e0b" : "#ffc107"}`,
    },
    modalTitle: {
      margin: 0,
      fontSize: "20px",
      color: isDark ? "#fbbf24" : "#856404",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    modalBody: {
      padding: "30px 20px",
    },
    modalText: {
      fontSize: "15px",
      color: "var(--theme-text, #333)",
      marginBottom: "20px",
      textAlign: "center",
    },
    valorComparacao: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      gap: "15px",
      marginBottom: "20px",
      padding: "20px",
      backgroundColor: isDark ? "var(--theme-surface-secondary, #0f172a)" : "#f8f9fa",
      borderRadius: "8px",
    },
    valorBox: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
    },
    valorLabel: {
      fontSize: "12px",
      color: isDark ? "var(--theme-text-secondary)" : "#6c757d",
      textTransform: "uppercase",
      fontWeight: "600",
    },
    valorAntigo: {
      fontSize: "20px",
      fontWeight: "bold",
      color: isDark ? "#f87171" : "#dc3545",
    },
    valorNovo: {
      fontSize: "20px",
      fontWeight: "bold",
      color: isDark ? "#4ade80" : "#28a745",
    },
    seta: {
      fontSize: "24px",
      color: isDark ? "var(--theme-text-secondary)" : "#6c757d",
    },
    modalWarning: {
      fontSize: "13px",
      color: isDark ? "#fbbf24" : "#856404",
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#fff3cd",
      padding: "12px",
      borderRadius: "6px",
      border: `1px solid ${isDark ? "#f59e0b" : "#ffc107"}`,
      textAlign: "center",
    },
    modalFooter: {
      padding: "15px 20px",
      backgroundColor: isDark ? "var(--theme-surface-secondary, #0f172a)" : "#f8f9fa",
      borderTop: `1px solid ${isDark ? "var(--theme-border)" : "#dee2e6"}`,
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
    },
    btnCancelar: {
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "6px",
      border: `2px solid ${isDark ? "var(--theme-border)" : "#6c757d"}`,
      backgroundColor: isDark ? "var(--theme-surface)" : "white",
      color: isDark ? "var(--theme-text)" : "#6c757d",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    btnConfirmar: {
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#28a745",
      color: "white",
      cursor: "pointer",
      transition: "all 0.2s",
    },
  };

  return (
    <>
      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>
          <span style={styles.legendIcon}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>description</span></span>
          Dados Básicos da Despesa
        </legend>
        <div style={styles.formGrid}>
          {/* 🆕 Banner informativo quando criando dentro de uma natureza */}
          {modoCriacaoDireta && naturezaInfo && (
            <div style={{
              gridColumn: "1 / -1",
              padding: "16px",
              backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "#3b82f6" : "#93c5fd"}`,
              marginBottom: "8px",
            }}>
              {/* Seção da Natureza */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#3b82f6" }}>account_balance_wallet</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#93c5fd" : "#1e40af" }}>
                  Natureza: {naturezaInfo.codigo}
                </span>
              </div>
              <div style={{ display: "flex", gap: "24px", fontSize: 13, marginBottom: "16px" }}>
                <div>
                  <span style={{ color: isDark ? "var(--theme-text-secondary)" : "#64748b" }}>Alocado: </span>
                  <span style={{ fontWeight: 600, color: isDark ? "var(--theme-text)" : "#0f172a" }}>
                    {formatarValorMonetario(naturezaInfo.valorAlocado)}
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? "var(--theme-text-secondary)" : "#64748b" }}>Executado: </span>
                  <span style={{ fontWeight: 600, color: isDark ? "#f87171" : "#dc2626" }}>
                    {formatarValorMonetario(naturezaInfo.valorExecutado)}
                  </span>
                </div>
                <div>
                  <span style={{ color: isDark ? "var(--theme-text-secondary)" : "#64748b" }}>Disponível: </span>
                  <span style={{
                    fontWeight: 600,
                    color: naturezaInfo.saldoDisponivel > 0
                      ? (isDark ? "#4ade80" : "#16a34a")
                      : (isDark ? "#f87171" : "#dc2626")
                  }}>
                    {formatarValorMonetario(naturezaInfo.saldoDisponivel)}
                  </span>
                </div>
              </div>

              {/* Seção de Execução da Emenda */}
              {emendaInfo && (
                <div style={{
                  paddingTop: "12px",
                  borderTop: `1px solid ${isDark ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: isDark ? "#a78bfa" : "#7c3aed" }}>analytics</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#a78bfa" : "#7c3aed" }}>
                        Execução da Emenda
                      </span>
                    </div>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isDark ? "#a78bfa" : "#7c3aed",
                    }}>
                      {((parseValorMonetario(emendaInfo.valorExecutado || emendaInfo.totalExecutado || 0) / parseValorMonetario(emendaInfo.valor || emendaInfo.valorRecurso || 1)) * 100).toFixed(1)}% executado
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div style={{
                    height: "8px",
                    backgroundColor: isDark ? "rgba(167, 139, 250, 0.2)" : "#ede9fe",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginBottom: "8px",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min((parseValorMonetario(emendaInfo.valorExecutado || emendaInfo.totalExecutado || 0) / parseValorMonetario(emendaInfo.valor || emendaInfo.valorRecurso || 1)) * 100, 100)}%`,
                      backgroundColor: isDark ? "#a78bfa" : "#7c3aed",
                      borderRadius: "4px",
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                  {/* Valores da emenda */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: isDark ? "var(--theme-text-secondary)" : "#64748b" }}>
                      Executado: <strong style={{ color: isDark ? "#a78bfa" : "#7c3aed" }}>
                        {formatarValorMonetario(emendaInfo.valorExecutado || emendaInfo.totalExecutado || 0)}
                      </strong>
                    </span>
                    <span style={{ color: isDark ? "var(--theme-text-secondary)" : "#64748b" }}>
                      Total: <strong style={{ color: isDark ? "var(--theme-text)" : "#0f172a" }}>
                        {formatarValorMonetario(emendaInfo.valor || emendaInfo.valorRecurso || 0)}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ✅ EMENDA E VALOR NA MESMA LINHA (proporções ajustadas) */}
          <div style={styles.formGridRow}>
            {/* EMENDA VINCULADA (READ-ONLY) - 60% */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4, verticalAlign: "middle" }}>push_pin</span> Emenda Vinculada
                <span style={styles.requiredMark}>*</span>
              </label>
              <div style={styles.emendaInfoBox}>
                <span style={styles.emendaText}>{emendaDisplay}</span>
              </div>
              {errors.emendaId && (
                <span style={styles.errorText}>{errors.emendaId}</span>
              )}
            </div>

            {/* VALOR DA DESPESA (EDITÁVEL) - 40% */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4, verticalAlign: "middle" }}>payments</span> Valor da Despesa
                <span style={styles.requiredMark}>*</span>
              </label>
              <input
                type="text"
                name="valor"
                value={formData.valor || ""}
                onChange={handleValorChange}
                onBlur={handleValorBlur}
                style={
                  valorExcedeSaldo || errors.valor
                    ? styles.inputValorError
                    : styles.inputValor
                }
                placeholder="R$ 0,00"
                disabled={false}
                readOnly={false}
                autoComplete="off"
              />
              {valorExcedeSaldo && (
                <span style={styles.errorText}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>warning</span>
                  {naturezaInfo
                    ? `Valor excede o saldo da natureza (${formatarValorMonetario(naturezaInfo.saldoDisponivel)})`
                    : `Valor excede o saldo disponível (${formatarValorMonetario(emendaInfo?.saldoDisponivel || 0)})`
                  }
                </span>
              )}
              {errors.valor && !valorExcedeSaldo && (
                <span style={styles.errorText}>{errors.valor}</span>
              )}
            </div>
          </div>

          {/* ✅ DISCRIMINAÇÃO - LARGURA TOTAL */}
          <div style={styles.formGroupFull}>
            <label style={styles.label}><span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4, verticalAlign: "middle" }}>edit_note</span> Discriminação da Despesa</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                name="discriminacao"
                value={formData.discriminacao || ""}
                onChange={handleInputChange}
                style={errors.discriminacao ? styles.inputError : styles.input}
                placeholder="Ex: Aquisição de equipamentos médicos"
                readOnly={modoVisualizacao}
              />
              {formData.discriminacao && !modoVisualizacao && (
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: { name: "discriminacao", value: "" },
                    })
                  }
                  style={styles.clearButton}
                  onMouseEnter={(e) => {
                    Object.assign(e.target.style, styles.clearButtonHover);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.target.style, styles.clearButton);
                  }}
                  title="Limpar campo"
                >
                  <span style={{ fontSize: "10px" }}>✕</span>
                  <span>Limpar</span>
                </button>
              )}
            </div>
            {errors.discriminacao && (
              <span style={styles.errorText}>{errors.discriminacao}</span>
            )}
          </div>
        </div>
      </fieldset>

      {/* ✅ MODAL DE CONFIRMAÇÃO DE ALTERAÇÃO */}
      {showModalConfirmacao && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}><span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>warning</span> Confirmar Alteração de Valor</h3>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>
                Você está alterando o valor da despesa:
              </p>
              <div style={styles.valorComparacao}>
                <div style={styles.valorBox}>
                  <span style={styles.valorLabel}>Valor Anterior:</span>
                  <span style={styles.valorAntigo}>
                    {formatarValorMonetario(valorAnterior)}
                  </span>
                </div>
                <span style={styles.seta}>→</span>
                <div style={styles.valorBox}>
                  <span style={styles.valorLabel}>Novo Valor:</span>
                  <span style={styles.valorNovo}>
                    {formatarValorMonetario(novoValorPendente)}
                  </span>
                </div>
              </div>
              <p style={styles.modalWarning}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>warning</span> Esta alteração pode impactar o planejamento orçamentário da
                emenda.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={cancelarAlteracaoValor}
                style={styles.btnCancelar}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>close</span> Cancelar
              </button>
              <button
                onClick={confirmarAlteracaoValor}
                style={styles.btnConfirmar}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>check</span> Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DespesaFormBasicFields;