// src/components/despesa/DespesaFormBasicFields.jsx
// ✅ ATUALIZADO 05/11/2025: Nova estrutura com seção "Dados Básicos da Despesa"
// 🎯 Campos: Emenda (não editável), Valor (editável com alerta), Discriminação (1 linha)
// 🔧 CORREÇÃO 05/11/2025: Validação de saldo considera valor anterior da despesa ao editar
// 🆕 ATUALIZADO 05/11/2025: Botão "Limpar" discreto no campo Discriminação
// 🎯 ATUALIZADO 05/11/2025: Modal de confirmação ao alterar valor diferente do planejado

import React, { useState, useEffect } from "react";
import { NATUREZAS_DESPESA } from "../../config/constants";

const toNaturezaOptions = (lista) => {
  try {
    if (Array.isArray(lista)) {
      return lista.map((n) => ({
        value: n.value ?? n.codigo ?? String(n),
        label: n.label ?? n.nome ?? String(n),
      }));
    }
  } catch (_) {}
  return [
    { value: "3.3.9.0.30", label: "3.3.9.0.30 – Material de Despesa" },
    {
      value: "3.3.90.30.99",
      label: "3.3.90.30.99 – Outros Materiais de Consumo",
    },
  ];
};

// 🔧 HELPER: Parse seguro de valor monetário
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
  emendas = [],
  emendaPreSelecionada = null,
  emendaInfo = null,
  userRole,
  userMunicipio,
  modoVisualizacao = false,
  valorError,
  handleInputChange,
  despesaParaEditar = null,
}) => {
  // 🆕 Estados para modal de confirmação
  const [showModalConfirmacao, setShowModalConfirmacao] = useState(false);
  const [novoValorPendente, setNovoValorPendente] = useState(null);
  const [valorAnterior, setValorAnterior] = useState(null);

  // Normalizar opções de Natureza
  const naturezaOptions = React.useMemo(
    () => toNaturezaOptions(NATUREZAS_DESPESA),
    [],
  );

  // Dados da emenda para exibir no campo não editável
  const emendaDisplay = emendaInfo
    ? `${emendaInfo.numero || emendaInfo.numeroEmenda || ""} - ${emendaInfo.parlamentar || emendaInfo.autor || ""}`
    : "Nenhuma emenda selecionada";

  // 🔧 CORREÇÃO: Calcular saldo disponível considerando edição
  const calcularSaldoParaValidacao = () => {
    let saldoBase = emendaInfo?.saldoDisponivel ?? 0;

    if (despesaParaEditar?.id && despesaParaEditar?.valor) {
      const valorAnterior =
        typeof despesaParaEditar.valor === "number"
          ? despesaParaEditar.valor
          : parseFloat(
              String(despesaParaEditar.valor || "").replace(/\D/g, ""),
            ) / 100;

      saldoBase += valorAnterior;
    }

    return saldoBase;
  };

  const saldoDisponivel = calcularSaldoParaValidacao();

  // Converter valor para número
  const valorNum =
    typeof formData.valor === "number"
      ? formData.valor
      : parseFloat(String(formData.valor || "").replace(/\D/g, "")) / 100;

  const valorExcedeSaldo = valorNum > saldoDisponivel;

  // 🆕 Valor original da despesa (ao editar) ou planejado (ao criar)
  const valorOriginal = despesaParaEditar?.valor
    ? parseValorMonetario(despesaParaEditar.valor)
    : emendaInfo?.valorPlanejado || 0;

  const valorFoiAlterado =
    valorNum > 0 && valorNum !== valorOriginal && valorOriginal > 0;

  // 🆕 Formatar valor para exibição monetária
  const formatarValorMonetario = (valor) => {
    if (!valor && valor !== 0) return "";
    const num =
      typeof valor === "number"
        ? valor
        : parseFloat(String(valor).replace(/\D/g, "")) / 100;

    if (isNaN(num)) return "";

    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 🎯 Handler para formatar valor enquanto digita (SEM validação)
  const handleValorChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor === "") {
      e.target.value = "";
      handleInputChange(e);
      return;
    }

    const numeroValor = parseFloat(valor) / 100;

    // Formatar como moeda
    e.target.value = numeroValor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    handleInputChange(e);
  };

  // 🎯 Handler para validar quando o usuário SAI do campo (onBlur)
  const handleValorBlur = (e) => {
    const valorAtual = e.target.value;
    const numeroValor = parseValorMonetario(valorAtual);

    // 🐛 DEBUG
    console.group("🔍 DEBUG handleValorBlur");
    console.log("valorOriginal:", valorOriginal);
    console.log("numeroValor atual:", numeroValor);
    console.log("São diferentes?", numeroValor !== valorOriginal);
    console.log("valorOriginal > 0?", valorOriginal > 0);
    console.log(
      "Vai abrir modal?",
      valorOriginal > 0 && numeroValor !== valorOriginal,
    );
    console.groupEnd();

    // ✅ SE valor difere do original, mostrar modal de confirmação
    if (valorOriginal > 0 && numeroValor !== valorOriginal) {
      console.log("🎯 ABRINDO MODAL DE CONFIRMAÇÃO");
      setValorAnterior(valorOriginal);
      setNovoValorPendente(numeroValor);
      setShowModalConfirmacao(true);
    }
  };

  // 🎯 Confirmar alteração de valor
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

  // 🎯 Cancelar alteração de valor (restaura valor original)
  const cancelarAlteracaoValor = () => {
    // Restaurar valor original no campo
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

  return (
    <>
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>📄 Dados Básicos da Despesa</h3>

        <div style={styles.fieldsGrid}>
          {/* EMENDA (não editável) */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Emenda <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={emendaDisplay}
              disabled
              style={{
                ...styles.input,
                backgroundColor: "#f8f9fa",
                cursor: "not-allowed",
                color: "#495057",
              }}
            />
          </div>

          {/* VALOR (editável com modal de confirmação) */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Valor <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="valor"
              placeholder="R$ 0,00"
              value={
                formData?.valor
                  ? typeof formData.valor === "string" &&
                    formData.valor.includes("R$")
                    ? formData.valor
                    : formatarValorMonetario(formData.valor)
                  : ""
              }
              onChange={handleValorChange}
              onBlur={handleValorBlur}
              disabled={modoVisualizacao}
              style={{
                ...styles.input,
                borderColor:
                  valorExcedeSaldo || valorFoiAlterado ? "#ffc107" : "#ced4da",
              }}
            />
            {valorExcedeSaldo && (
              <small style={styles.warningText}>
                ⚠️ Valor excede o saldo disponível (R${" "}
                {saldoDisponivel.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
                )
              </small>
            )}
            {(errors?.valor || valorError) &&
              !valorExcedeSaldo &&
              !valorFoiAlterado && (
                <small style={styles.error}>
                  {errors?.valor || valorError}
                </small>
              )}
          </div>

          {/* DISCRIMINAÇÃO (1 linha normal - EDITÁVEL) com botão LIMPAR */}
          <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Discriminação</label>
              {formData.discriminacao && !modoVisualizacao && (
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: { name: "discriminacao", value: "" },
                    })
                  }
                  style={styles.clearButton}
                  title="Limpar campo"
                >
                  🗑️ Limpar
                </button>
              )}
            </div>
            <input
              type="text"
              name="discriminacao"
              placeholder="Descreva brevemente a despesa (opcional)"
              value={formData.discriminacao || ""}
              onChange={handleInputChange}
              disabled={modoVisualizacao}
              style={styles.input}
            />
            {errors?.discriminacao && (
              <small style={styles.error}>{errors.discriminacao}</small>
            )}
          </div>
        </div>
      </section>

      {/* 🎯 MODAL DE CONFIRMAÇÃO DE ALTERAÇÃO DE VALOR */}
      {showModalConfirmacao && (
        <div style={styles.modalOverlay} onClick={cancelarAlteracaoValor}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>⚠️ Confirmar Alteração de Valor</h3>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.valorComparacao}>
                <div style={styles.valorBox}>
                  <span style={styles.valorLabel}>Valor Planejado:</span>
                  <span style={styles.valorAntigo}>
                    {formatarValorMonetario(valorAnterior)}
                  </span>
                </div>

                <div style={styles.setaAlteracao}>→</div>

                <div style={styles.valorBox}>
                  <span style={styles.valorLabel}>Novo Valor:</span>
                  <span style={styles.valorNovo}>
                    {formatarValorMonetario(novoValorPendente)}
                  </span>
                </div>
              </div>

              <p style={styles.modalMensagem}>
                Você está alterando o valor da despesa em relação ao valor
                planejado. Deseja realmente prosseguir com esta alteração?
              </p>

              {novoValorPendente > saldoDisponivel && (
                <div style={styles.alertaSaldo}>
                  ⚠️ Atenção: O novo valor excede o saldo disponível da emenda!
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={cancelarAlteracaoValor}
                style={styles.btnCancelar}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarAlteracaoValor}
                style={styles.btnConfirmar}
              >
                ✓ Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  section: {
    backgroundColor: "#fff",
    border: "2px solid #27AE60",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#27AE60",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  required: {
    color: "#dc3545",
  },
  clearButton: {
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#6c757d",
    backgroundColor: "transparent",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  input: {
    height: "40px",
    padding: "0 12px",
    fontSize: "14px",
    border: "2px solid #ced4da",
    borderRadius: "6px",
    transition: "border-color 0.3s ease",
    outline: "none",
  },
  error: {
    fontSize: "12px",
    color: "#dc3545",
    fontWeight: "600",
  },
  warningText: {
    fontSize: "12px",
    color: "#dc3545",
    fontWeight: "600",
  },

  // 🎯 ESTILOS DO MODAL
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    maxWidth: "500px",
    width: "100%",
    animation: "slideIn 0.3s ease",
  },
  modalHeader: {
    padding: "20px",
    borderBottom: "2px solid #f0f0f0",
  },
  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#f39c12",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  modalBody: {
    padding: "24px",
  },
  valorComparacao: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
  valorBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  valorLabel: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  valorAntigo: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#6c757d",
    textDecoration: "line-through",
  },
  valorNovo: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#27AE60",
  },
  setaAlteracao: {
    fontSize: "24px",
    color: "#6c757d",
    fontWeight: "bold",
  },
  modalMensagem: {
    fontSize: "14px",
    color: "#495057",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
  },
  alertaSaldo: {
    padding: "12px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "6px",
    color: "#856404",
    fontSize: "13px",
    fontWeight: "600",
  },
  modalFooter: {
    padding: "16px 20px",
    borderTop: "2px solid #f0f0f0",
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  btnCancelar: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  btnConfirmar: {
    padding: "10px 20px",
    backgroundColor: "#27AE60",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 2px 8px rgba(39, 174, 96, 0.3)",
  },
};

export default DespesaFormBasicFields;
