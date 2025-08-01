// src/components/emenda/EmendaForm/sections/DadosBasicos.jsx
// ✅ REORGANIZAÇÃO: Município e UF movidos para Identificação, campos financeiros adicionados

import React from "react";
import {
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../../utils/formatters";

const DadosBasicos = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
  metricas = null,
  emendaParaEditar = null,
}) => {
  // ✅ PROGRAMAS ORIGINAIS PRESERVADOS
  const programas = [
    "Atenção Básica",
    "Média e Alta Complexidade",
    "Vigilância em Saúde",
    "Assistência Farmacêutica",
    "Gestão do SUS",
    "Investimentos na Rede de Serviços",
    "Outros",
  ];

  // ✅ HANDLER COM FORMATAÇÃO
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    // Formatação para campos monetários
    if (name === "valorRecurso" || name === "outrosValores") {
      valorFormatado = formatarMoedaInput(value);
    }

    onChange?.({ target: { name, value: valorFormatado } });
  };

  // ✅ FUNÇÕES DE CÁLCULO
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const getValorExecutado = () => {
    if (emendaParaEditar && metricas) {
      return formatCurrency(metricas.valorExecutado || 0);
    }
    return "R$ 0,00";
  };

  const getSaldo = () => {
    const valorRecurso = parseFloat(
      formData.valorRecurso?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
    );
    const outrosValores = parseFloat(
      formData.outrosValores?.replace(/[^\d,]/g, "").replace(",", ".") || "0",
    );
    const valorTotal = valorRecurso + outrosValores;
    const valorExecutado = metricas?.valorExecutado || 0;
    const saldo = valorTotal - valorExecutado;

    return formatCurrency(saldo);
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📋</span>
        Dados Básicos
      </legend>

      <div style={styles.formGrid}>
        {/* Parlamentar - ORIGINAL */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Parlamentar <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="parlamentar"
            value={formData.parlamentar || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.parlamentar && styles.inputError),
            }}
            disabled={disabled}
            placeholder="Nome do deputado/senador"
            required
          />
          {fieldErrors.parlamentar && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Número da Emenda - ORIGINAL */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Número da Emenda <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="numeroEmenda"
            value={formData.numeroEmenda || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.numeroEmenda && styles.inputError),
            }}
            disabled={disabled}
            placeholder="Ex: 123456789"
            required
          />
          {fieldErrors.numeroEmenda && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* ✅ Valor do Recurso */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Valor do Recurso <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Digite apenas números. Formatação aplicada automaticamente"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="valorRecurso"
            value={formData.valorRecurso || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.valorRecurso && styles.inputError),
            }}
            disabled={disabled}
            placeholder="0,00"
            required
          />
          {fieldErrors.valorRecurso && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* ✅ Outros Valores (MOVIDO DA IDENTIFICAÇÃO) */}
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
            style={styles.input}
            disabled={disabled}
            placeholder="0,00"
          />
        </div>

        {/* ✅ Valor Executado (MOVIDO DA IDENTIFICAÇÃO) */}
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
            value={getValorExecutado()}
            style={{
              ...styles.input,
              backgroundColor: "#f8f9fa",
              color: "#6c757d",
            }}
            disabled={true}
            placeholder="Calculado automaticamente"
          />
        </div>

        {/* ✅ Saldo (MOVIDO DA IDENTIFICAÇÃO) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Saldo (Calculado)
            <span
              style={styles.infoIcon}
              title="Saldo = (Valor do Recurso + Outros Valores) - Valor Executado"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            value={getSaldo()}
            style={{
              ...styles.input,
              backgroundColor: "#f8f9fa",
              color:
                parseFloat(
                  getSaldo()
                    .replace(/[^\d,-]/g, "")
                    .replace(",", "."),
                ) < 0
                  ? "#dc3545"
                  : "#28a745",
              fontWeight: "bold",
            }}
            disabled={true}
            placeholder="0,00"
          />
        </div>

        {/* Objeto da Proposta - ORIGINAL */}
        <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
          <label style={styles.label}>
            Objeto da Proposta <span style={styles.required}>*</span>
          </label>
          <textarea
            name="objetoProposta"
            value={formData.objetoProposta || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.objetoProposta && styles.inputError),
              minHeight: "80px",
              resize: "vertical",
            }}
            disabled={disabled}
            placeholder="Descrição detalhada do objeto da emenda"
            required
          />
          {fieldErrors.objetoProposta && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Programa - ORIGINAL */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Programa <span style={styles.required}>*</span>
          </label>
          <select
            name="programa"
            value={formData.programa || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.programa && styles.inputError),
            }}
            disabled={disabled}
            required
          >
            <option value="">Selecione o programa</option>
            {programas.map((programa) => (
              <option key={programa} value={programa}>
                {programa}
              </option>
            ))}
          </select>
          {fieldErrors.programa && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS ORIGINAIS MANTIDOS
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

export default DadosBasicos;
