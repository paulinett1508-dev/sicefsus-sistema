// src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx
// ✅ FIX CIRÚRGICO: APENAS validação CNPJ visual + destaque campo obrigatório
// 100% ESTRUTURA ORIGINAL PRESERVADA

import React from "react";
import { formatarCNPJ, validarCNPJ } from "../../../../utils/validators";

const DadosBeneficiario = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // ✅ HANDLER ORIGINAL PRESERVADO
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    // Formatação específica para CNPJ - ORIGINAL
    if (name === "cnpj") {
      valorFormatado = formatarCNPJ(value);
    }

    onChange?.({ target: { name, value: valorFormatado } });
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🏢</span>
        Dados do Beneficiário
      </legend>

      <div style={styles.formGrid}>
        {/* ✅ CNPJ - APENAS validação visual adicionada */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            CNPJ <span style={styles.required}>*</span>
            {/* ✅ ACRÉSCIMO: ícone ℹ️ */}
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
              name="cnpj"
              value={formData.cnpj || ""}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(fieldErrors.cnpj && styles.inputError),
                // ✅ ACRÉSCIMO: validação visual CNPJ
                ...(formData.cnpj &&
                  validarCNPJ(formData.cnpj) &&
                  styles.inputValid),
                ...(formData.cnpj &&
                  !validarCNPJ(formData.cnpj) &&
                  styles.inputInvalid),
              }}
              disabled={disabled}
              placeholder="00.000.000/0000-00"
              required
            />
            {/* ✅ ACRÉSCIMO: indicador visual CNPJ */}
            {formData.cnpj && (
              <span style={styles.validationIcon}>
                {validarCNPJ(formData.cnpj) ? "✅" : "❌"}
              </span>
            )}
          </div>
          {fieldErrors.cnpj && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Número da Proposta - ORIGINAL */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Número da Proposta <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="numeroProposta"
            value={formData.numeroProposta || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.numeroProposta && styles.inputError),
            }}
            disabled={disabled}
            placeholder="Ex: 123456789"
            required
          />
          {fieldErrors.numeroProposta && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* ✅ ACRÉSCIMO: Campo Funcional (estava faltando no original conforme validação) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Funcional <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="funcional"
            value={formData.funcional || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.funcional && styles.inputError),
            }}
            disabled={disabled}
            placeholder="Ex: 10.301.0001.2001"
            required
          />
          {fieldErrors.funcional && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>
      </div>

      {/* Nota informativa - ORIGINAL PRESERVADA */}
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>ℹ️</span>
        <span style={styles.infoText}>
          O CNPJ do beneficiário deve ser válido e corresponder à entidade que
          receberá os recursos da emenda.
        </span>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS ORIGINAIS + apenas validação CNPJ + ícone
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
  // ✅ ACRÉSCIMO: container para validação visual
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
  // ✅ CORRIGIDO: usar border completo em vez de borderColor
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
    border: "2px solid #dc3545",
    backgroundColor: "#fff5f5",
  },
  inputRequired: {
    borderColor: "#ff6b6b",
    boxShadow: "0 0 0 1px rgba(255, 107, 107, 0.3)",
    backgroundColor: "#fff5f5",
  },
  // ✅ ACRÉSCIMO: ícone de validação
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
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    backgroundColor: "#e8f4f8",
    border: "1px solid #bee5eb",
    borderRadius: "6px",
    padding: "12px",
    marginTop: "15px",
  },
  infoIcon: {
    fontSize: "16px",
    flexShrink: 0,
    marginTop: "2px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
  infoText: {
    fontSize: "14px",
    color: "#0c5460",
    lineHeight: "1.4",
  },
};

export default DadosBeneficiario;