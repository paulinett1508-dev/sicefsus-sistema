// src/components/despesa/DespesaFormBasicFields.jsx
// ✅ SIMPLIFICADO 06/11/2025: Apenas emenda, valor e discriminação

import React, { useState } from "react";

const parseValorMonetario = (valor) => {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  const valorLimpo = String(valor)
    .replace(/[^\d,]/g, "")
    .replace(",", ".");
  const numero = parseFloat(valorLimpo);
  return isNaN(numero) ? 0 : numero;
};

const DespesaFormBasicFields = ({
  formData,
  errors = {},
  emendaInfo = null,
  modoVisualizacao = false,
  handleInputChange,
  despesaParaEditar = null,
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

  const handleValorChange = (e) => {
    const valorDigitado = e.target.value;

    // Permite campo vazio
    if (valorDigitado === "" || valorDigitado === "R$ ") {
      handleInputChange({ target: { name: "valor", value: "" } });
      return;
    }

    // Remove tudo exceto números
    let apenasNumeros = valorDigitado.replace(/\D/g, "");

    if (apenasNumeros === "") {
      handleInputChange({ target: { name: "valor", value: "" } });
      return;
    }

    // Converte para número (centavos para reais)
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
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },
    formGridDiscriminacao: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
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
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    requiredMark: {
      color: "#dc3545",
      fontSize: "16px",
    },
    input: {
      padding: "12px",
      paddingRight: "90px",
      border: "2px solid #dee2e6",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
      backgroundColor: "white",
      boxSizing: "border-box",
    },
    inputCompact: {
      padding: "8px 12px",
      border: "2px solid #dee2e6",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
      backgroundColor: "white",
      boxSizing: "border-box",
      maxWidth: "280px",
    },
    textarea: {
      padding: "12px",
      border: "2px solid #dee2e6",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
      backgroundColor: "white",
      boxSizing: "border-box",
      minHeight: "100px",
      resize: "vertical",
      fontFamily: "Arial, sans-serif",
    },
    inputError: {
      padding: "12px",
      paddingRight: "90px",
      border: "2px solid #dc3545",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
      backgroundColor: "#fff5f5",
      boxSizing: "border-box",
    },
    inputErrorCompact: {
      padding: "8px 12px",
      border: "2px solid #dc3545",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
      backgroundColor: "#fff5f5",
      boxSizing: "border-box",
      maxWidth: "280px",
    },
    textareaError: {
      padding: "12px",
      border: "2px solid #dc3545",
      borderRadius: "6px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
      backgroundColor: "#fff5f5",
      boxSizing: "border-box",
      minHeight: "100px",
      resize: "vertical",
      fontFamily: "Arial, sans-serif",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    clearButton: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "#f8f9fa",
      border: "1px solid #dee2e6",
      borderRadius: "4px",
      color: "#dc3545",
      fontSize: "12px",
      cursor: "pointer",
      padding: "6px 10px",
      lineHeight: "1",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontWeight: "500",
    },
    clearButtonHover: {
      background: "#dc3545",
      color: "white",
      borderColor: "#dc3545",
    },
    emendaInfoBox: {
      padding: "12px",
      backgroundColor: "#f8f9fa",
      border: "2px solid #dee2e6",
      borderRadius: "6px",
      minHeight: "44px",
      display: "flex",
      alignItems: "center",
    },
    emendaText: {
      fontSize: "14px",
      color: "#495057",
      fontWeight: "500",
    },
    errorText: {
      color: "#dc3545",
      fontSize: "12px",
      marginTop: "5px",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
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
          {/* ✅ EMENDA E VALOR NA MESMA LINHA */}
          <div style={styles.formGridRow}>
            {/* EMENDA VINCULADA (READ-ONLY) */}
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

            {/* VALOR DA DESPESA (SEMPRE EDITÁVEL) */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                💰 Valor da Despesa
                <span style={styles.requiredMark}>*</span>
              </label>
              <input
                type="text"
                name="valor"
                value={formatarValorMonetario(formData.valor) || ""}
                onChange={handleValorChange}
                onBlur={handleValorBlur}
                style={
                  valorExcedeSaldo || errors.valor
                    ? styles.inputError
                    : styles.input
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

          {/* ✅ DISCRIMINAÇÃO (MESMA LARGURA QUE EMENDA VINCULADA) */}
          <div style={styles.formGridRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                📝 Discriminação da Despesa
              </label>
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
                    🗑️ Limpar
                  </button>
                )}
              </div>
              {errors.discriminacao && (
                <span style={styles.errorText}>{errors.discriminacao}</span>
              )}
            </div>
            <div></div>
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