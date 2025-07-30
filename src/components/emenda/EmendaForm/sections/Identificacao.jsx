// src/components/emenda/EmendaForm/sections/Identificacao.jsx
// Seção "Identificação" extraída do EmendaForm
// CNPJ do município, outros valores, valor executado, saldo

import React from "react";
import { formatarMoedaInput } from "../../../../utils/formatters";
import { formatarCNPJ } from "../../../../utils/validators";

const Identificacao = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
  metricas = null,
  emendaParaEditar = null,
}) => {
  // ✅ HANDLER DE MUDANÇA COM FORMATAÇÃO
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

  // ✅ FUNÇÃO LOCAL PARA FORMATAÇÃO DE MOEDA
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ CALCULAR VALOR EXECUTADO (automático)
  const getValorExecutado = () => {
    if (emendaParaEditar && metricas) {
      return formatCurrency(metricas.valorExecutado || 0);
    }
    return "R$ 0,00";
  };

  // ✅ CALCULAR SALDO (baseado em valor do recurso - valor executado)
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
        {/* CNPJ do Município */}
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
            disabled={disabled}
            placeholder="00.000.000/0000-00"
            required
          />
          {fieldErrors.cnpjMunicipio && (
            <small style={styles.errorText}>CNPJ inválido</small>
          )}
        </div>

        {/* Outros Valores */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Outros Valores</label>
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
        </div>

        {/* Valor Executado (Automático) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Valor Executado (Automático)
            <span
              style={styles.infoIcon}
              title="Valor calculado automaticamente com base nas despesas lançadas"
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
            title="Este valor é calculado automaticamente com base nas despesas cadastradas para esta emenda"
          />
        </div>

        {/* Saldo (Calculado) */}
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
            title="Saldo = Valor do Recurso - Valor Executado"
          />
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS EXTRAÍDOS DO ORIGINAL
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
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
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
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default Identificacao;
