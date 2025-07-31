// src/components/emenda/EmendaForm/sections/Identificacao.jsx
// ✅ FIX CIRÚRGICO: APENAS ícones + validação CNPJ - CAMPOS ORIGINAIS

import React from "react";
import {
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../../utils/formatters";
import { formatarCNPJ, validarCNPJ } from "../../../../utils/validators";

const Identificacao = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
  metricas = null,
  emendaParaEditar = null,
}) => {
  // ✅ HANDLER ORIGINAL COM APENAS formatação CNPJ e monetária
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    // Formatação específica para CNPJ
    if (name === "cnpjMunicipio") {
      valorFormatado = formatarCNPJ(value);
    }

    // Formatação para campos monetários
    if (name === "outrosValores") {
      valorFormatado = formatarMoedaInput(value);
    }

    onChange?.({ target: { name, value: valorFormatado } });
  };

  // ✅ FUNÇÃO ORIGINAL PRESERVADA
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ CALCULAR VALOR EXECUTADO (original)
  const getValorExecutado = () => {
    if (emendaParaEditar && metricas) {
      return formatCurrency(metricas.valorExecutado || 0);
    }
    return "R$ 0,00";
  };

  // ✅ CALCULAR SALDO (original)
  const getSaldo = () => {
    if (formData.saldo) {
      return formData.saldo;
    }

    // Calcular saldo se não existir
    const valorRecurso = parseFloat(
      formData.valorRecurso?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
    );
    const valorExecutado = metricas?.valorExecutado || 0;
    const saldo = valorRecurso - valorExecutado;

    return saldo.toFixed(2).replace(".", ",");
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🏛️</span>
        Identificação
      </legend>

      <div style={styles.formGrid}>
        {/* ✅ CNPJ do Município - APENAS validação visual CNPJ */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            CNPJ do Município <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Digite apenas números. Formatação automática aplicada"
            >
              ℹ️
            </span>
          </label>
          <div style={styles.inputContainer}>
            <input
              type="text"
              name="cnpjMunicipio"
              value={formData.cnpjMunicipio || ""}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(fieldErrors.cnpjMunicipio && styles.inputError),
                ...(formData.cnpjMunicipio &&
                  validarCNPJ(formData.cnpjMunicipio) &&
                  styles.inputValid),
                ...(formData.cnpjMunicipio &&
                  !validarCNPJ(formData.cnpjMunicipio) &&
                  styles.inputInvalid),
              }}
              disabled={disabled}
              placeholder="00.000.000/0000-00"
              required
            />
            {/* ✅ INDICADOR VISUAL CNPJ */}
            {formData.cnpjMunicipio && (
              <span style={styles.validationIcon}>
                {validarCNPJ(formData.cnpjMunicipio) ? "✅" : "❌"}
              </span>
            )}
          </div>
          {fieldErrors.cnpjMunicipio && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* ✅ Outros Valores - APENAS ícone removido texto */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Outros Valores
            <span
              style={styles.infoIcon}
              title="Digite apenas números. Formatação automática aplicada"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="outrosValores"
            value={formData.outrosValores || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.outrosValores && styles.inputError),
            }}
            disabled={disabled}
            placeholder="0,00"
          />
          {fieldErrors.outrosValores && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Valor Executado (Automático) - ORIGINAL */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Valor Executado (Automático)
            <span
              style={styles.infoIcon}
              title="Valor calculado automaticamente com base nas despesas"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="valorExecutado"
            value={getValorExecutado()}
            style={{
              ...styles.input,
              backgroundColor: "#f8f9fa",
              color: "#6c757d",
            }}
            disabled={true}
            placeholder="Calculado automaticamente com base nas despesas"
          />
        </div>

        {/* Saldo (Calculado) - ORIGINAL */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Saldo (Calculado)
            <span
              style={styles.infoIcon}
              title="Saldo = Valor do Recurso - Valor Executado"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="saldo"
            value={getSaldo()}
            style={{
              ...styles.input,
              backgroundColor: "#f8f9fa",
              color: "#6c757d",
            }}
            disabled={true}
            placeholder="0,00"
          />
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS ORIGINAIS + apenas validação CNPJ + campo obrigatório destacado
const styles = {
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
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  required: {
    color: "#dc3545",
  },
  inputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    flex: "1",
  },
  // ✅ CORRIGIDO: usar border completo
  inputError: {
    border: "2px solid #dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  // ✅ CORRIGIDO: validação CNPJ válido
  inputValid: {
    border: "2px solid #28a745",
    backgroundColor: "#f8fff8",
    boxShadow: "0 0 0 2px rgba(40, 167, 69, 0.25)",
  },
  // ✅ CORRIGIDO: validação CNPJ inválido
  inputInvalid: {
    border: "2px solid #ffc107",
    backgroundColor: "#fffbf0",
    boxShadow: "0 0 0 2px rgba(255, 193, 7, 0.25)",
  },
  validationIcon: {
    position: "absolute",
    right: "12px",
    fontSize: "16px",
    pointerEvents: "none",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },
  // ✅ ÚNICO ACRÉSCIMO: ícone de informação
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
  inputRequired: {
    borderColor: "#ff6b6b",
    boxShadow: "0 0 0 1px rgba(255, 107, 107, 0.3)",
    backgroundColor: "#fff5f5",
  },
};

export default Identificacao;