// src/components/despesa/DespesaFormBasicFields.jsx
// ✅ ATUALIZADO 05/11/2025: Nova estrutura com seção "Dados Básicos da Despesa"
// 🎯 Campos: Emenda (não editável), Valor (editável com alerta), Discriminação (1 linha), Fornecedor, Natureza
// 🔧 CORREÇÃO 05/11/2025: Validação de saldo considera valor anterior da despesa ao editar

import React from "react";
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
  despesaParaEditar = null, // 🆕 Nova prop para saber se está editando
}) => {
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

    // Se está editando uma despesa, "devolve" o valor anterior ao saldo
    if (despesaParaEditar?.id && despesaParaEditar?.valor) {
      const valorAnterior =
        typeof despesaParaEditar.valor === "number"
          ? despesaParaEditar.valor
          : parseFloat(
              String(despesaParaEditar.valor || "").replace(/\D/g, ""),
            ) / 100;

      saldoBase += valorAnterior;

      console.log("🔍 Validação de Saldo (EDIÇÃO):", {
        saldoAtualEmenda: emendaInfo?.saldoDisponivel ?? 0,
        valorAnteriorDespesa: valorAnterior,
        saldoDisponivel: saldoBase,
      });
    } else {
      console.log("🔍 Validação de Saldo (NOVA):", {
        saldoDisponivel: saldoBase,
      });
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

  // 🆕 Valor original do planejamento (da emenda)
  const valorPlanejado = emendaInfo?.valorPlanejado || 0;
  const valorFoiAlterado =
    valorNum > 0 && valorNum !== valorPlanejado && valorPlanejado > 0;

  // 🆕 Formatar valor para exibição monetária
  const formatarValorMonetario = (valor) => {
    if (!valor) return "";
    const num =
      typeof valor === "number"
        ? valor
        : parseFloat(String(valor).replace(/\D/g, "")) / 100;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 🆕 Handler para formatar valor ao digitar
  const handleValorChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    if (valor === "") {
      e.target.value = "";
      handleInputChange(e);
      return;
    }

    // Converter para número com centavos
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

  return (
    <section style={styles.section}>
      <h3 style={styles.sectionTitle}>📝 Dados Básicos da Despesa</h3>

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
          <small style={styles.hint}>
            Emenda vinculada a esta despesa (não editável)
          </small>
        </div>

        {/* VALOR (editável com alerta) */}
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
          {valorFoiAlterado && !valorExcedeSaldo && (
            <small style={styles.alertText}>
              ⚠️ Valor difere do planejado (
              {formatarValorMonetario(valorPlanejado)}). Tem certeza?
            </small>
          )}
          {(errors?.valor || valorError) &&
            !valorExcedeSaldo &&
            !valorFoiAlterado && (
              <small style={styles.error}>{errors?.valor || valorError}</small>
            )}
          <small style={styles.hint}>
            Valor originado do planejamento (editável)
          </small>
        </div>

        {/* DISCRIMINAÇÃO (1 linha normal - EDITÁVEL) */}
        <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Discriminação</label>
          <input
            type="text"
            name="discriminacao"
            placeholder="Descreva brevemente a despesa"
            value={formData.discriminacao || ""}
            onChange={handleInputChange}
            disabled={modoVisualizacao}
            style={styles.input}
          />
          {errors?.discriminacao && (
            <small style={styles.error}>{errors.discriminacao}</small>
          )}
          <small style={styles.hint}>
            Campo livre para descrição da despesa
          </small>
        </div>
      </div>
    </section>
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
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  required: {
    color: "#dc3545",
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
  select: {
    height: "40px",
    padding: "0 12px",
    fontSize: "14px",
    border: "2px solid #ced4da",
    borderRadius: "6px",
    outline: "none",
  },
  hint: {
    fontSize: "12px",
    color: "#6c757d",
    fontStyle: "italic",
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
  alertText: {
    fontSize: "12px",
    color: "#ffc107",
    fontWeight: "600",
  },
};

export default DespesaFormBasicFields;
