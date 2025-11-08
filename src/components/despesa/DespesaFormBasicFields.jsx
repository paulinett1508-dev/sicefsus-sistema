// src/components/despesa/DespesaFormBasicFields.jsx
// ✅ VERSÃO MELHORADA - 08/11/2025
// ✅ Botão "Limpar" discreto
// ✅ Campo "Valor" mais compacto e destacado
// ✅ Lógica de input corrigida

import React, { useState, useEffect } from "react";

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
}) => {
  const [showModalConfirmacao, setShowModalConfirmacao] = useState(false);
  const [novoValorPendente, setNovoValorPendente] = useState(null);
  const [valorAnterior, setValorAnterior] = useState(null);

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
    let saldoBase = emendaInfo?.saldoDisponivel ?? 0;
    if (despesaParaEditar?.id && despesaParaEditar?.valor) {
      const valorAnteriorDespesa = parseValorMonetario(despesaParaEditar.valor);
      saldoBase += valorAnteriorDespesa;
    }
    return saldoBase;
  };

  const saldoDisponivel = calcularSaldoParaValidacao();
  const valorNum = parseValorMonetario(formData.valor);
  const valorExcedeSaldo = valorNum > saldoDisponivel;

  // ✅ Callback de saldo
  React.useEffect(() => {
    if (onValorExcedeSaldo) {
      onValorExcedeSaldo(valorExcedeSaldo);
    }
  }, [valorExcedeSaldo]);

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

  // Atualizar valor quando emendaInfo mudar (para modo criar)
  useEffect(() => {
    if (!despesaParaEditar && emendaInfo?.saldoDisponivel) {
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
  }, [emendaInfo?.saldoDisponivel, despesaParaEditar]);

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

  const styles = {
    fieldset: {
      border: "2px solid #154360",
      borderRadius: "10px",
      padding: "20px",
      marginBottom: "20px",
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
    legendIcon: { fontSize: "18px" },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "20px",
    },
    formGridRow: {
      display: "grid",
      gridTemplateColumns: "1.2fr 0.8fr", // ✅ Emenda maior, Valor menor
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
      color: "#2c3e50",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    requiredMark: { color: "#e74c3c", fontSize: "16px", marginLeft: "2px" },
    input: {
      padding: "12px",
      border: "2px solid #bdc3c7",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
      backgroundColor: "white",
    },
    inputError: {
      padding: "12px",
      border: "2px solid #e74c3c",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
      backgroundColor: "#fff5f5",
    },
    // ✅ CAMPO VALOR DESTACADO
    inputValor: {
      padding: "14px 16px",
      border: "2px solid #27ae60",
      borderRadius: "8px",
      fontSize: "18px", // ✅ Fonte maior
      fontWeight: "600", // ✅ Negrito
      transition: "all 0.3s ease",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f0fdf4",
      color: "#065f46",
      textAlign: "right", // ✅ Alinhado à direita (padrão para valores)
      letterSpacing: "0.5px",
    },
    inputValorError: {
      padding: "14px 16px",
      border: "2px solid #e74c3c",
      borderRadius: "8px",
      fontSize: "18px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#fef2f2",
      color: "#991b1b",
      textAlign: "right",
      letterSpacing: "0.5px",
    },
    emendaInfoBox: {
      padding: "12px 15px",
      backgroundColor: "#e8f4f8",
      border: "2px solid #3498db",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    emendaText: {
      color: "#2c3e50",
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
    // ✅ BOTÃO LIMPAR DISCRETO
    clearButton: {
      padding: "8px 12px",
      backgroundColor: "#f8f9fa", // ✅ Cinza claro
      color: "#6c757d", // ✅ Texto cinza
      border: "1px solid #dee2e6", // ✅ Borda sutil
      borderRadius: "6px",
      fontSize: "12px", // ✅ Menor
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    clearButtonHover: {
      backgroundColor: "#e9ecef",
      borderColor: "#adb5bd",
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
      backgroundColor: "white",
      borderRadius: "12px",
      width: "90%",
      maxWidth: "500px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      overflow: "hidden",
    },
    modalHeader: {
      padding: "20px",
      backgroundColor: "#fff3cd",
      borderBottom: "2px solid #ffc107",
    },
    modalTitle: {
      margin: 0,
      fontSize: "20px",
      color: "#856404",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    modalBody: {
      padding: "30px 20px",
    },
    modalText: {
      fontSize: "15px",
      color: "#333",
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
      backgroundColor: "#f8f9fa",
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
      color: "#6c757d",
      textTransform: "uppercase",
      fontWeight: "600",
    },
    valorAntigo: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#dc3545",
    },
    valorNovo: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#28a745",
    },
    seta: {
      fontSize: "24px",
      color: "#6c757d",
    },
    modalWarning: {
      fontSize: "13px",
      color: "#856404",
      backgroundColor: "#fff3cd",
      padding: "12px",
      borderRadius: "6px",
      border: "1px solid #ffc107",
      textAlign: "center",
    },
    modalFooter: {
      padding: "15px 20px",
      backgroundColor: "#f8f9fa",
      borderTop: "1px solid #dee2e6",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
    },
    btnCancelar: {
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "6px",
      border: "2px solid #6c757d",
      backgroundColor: "white",
      color: "#6c757d",
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
          <span style={styles.legendIcon}>📋</span>
          Dados Básicos da Despesa
        </legend>
        <div style={styles.formGrid}>
          {/* ✅ EMENDA E VALOR NA MESMA LINHA (proporções ajustadas) */}
          <div style={styles.formGridRow}>
            {/* EMENDA VINCULADA (READ-ONLY) - 60% */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                📌 Emenda Vinculada
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
                💰 Valor da Despesa
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
                  ⚠️ Valor excede o saldo disponível (
                  {formatarValorMonetario(saldoDisponivel)})
                </span>
              )}
              {errors.valor && !valorExcedeSaldo && (
                <span style={styles.errorText}>{errors.valor}</span>
              )}
            </div>
          </div>

          {/* ✅ DISCRIMINAÇÃO - LARGURA TOTAL */}
          <div style={styles.formGroupFull}>
            <label style={styles.label}>📝 Discriminação da Despesa</label>
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
              <h3 style={styles.modalTitle}>⚠️ Confirmar Alteração de Valor</h3>
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
                ⚠️ Esta alteração pode impactar o planejamento orçamentário da
                emenda.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={cancelarAlteracaoValor}
                style={styles.btnCancelar}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={confirmarAlteracaoValor}
                style={styles.btnConfirmar}
              >
                ✅ Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DespesaFormBasicFields;
