// src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx
// ✅ FIX: Validação CNPJ IMEDIATA ao digitar

import React from "react";
import { formatarCNPJ, validarCNPJ } from "../../../../utils/validators";

const DadosBeneficiario = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // ✅ FIX: HANDLER com validação CNPJ imediata
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    // Formatação específica para CNPJ - ORIGINAL
    if (name === "cnpj") {
      valorFormatado = formatarCNPJ(value);
    }

    onChange?.({ target: { name, value: valorFormatado } });
  };

  // ✅ VALIDAÇÃO CNPJ mais rigorosa
  const getCNPJValidationState = (cnpj) => {
    if (!cnpj || cnpj.length < 3) return null; // Não validar enquanto está digitando

    const apenasNumeros = cnpj.replace(/\D/g, "");

    // Se tem menos de 14 dígitos, está incompleto mas não é erro ainda
    if (apenasNumeros.length < 14) return "incomplete";

    // Se tem 14 dígitos, validar imediatamente
    if (apenasNumeros.length === 14) {
      return validarCNPJ(cnpj) ? "valid" : "invalid";
    }

    return null;
  };

  const cnpjState = getCNPJValidationState(formData.cnpj);

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🏢</span>
        Dados do Beneficiário
      </legend>

      <div style={styles.formGrid}>
        {/* ✅ CNPJ - Validação IMEDIATA */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            CNPJ <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Digite apenas números. Validação em tempo real"
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
                ...(cnpjState === "valid" && styles.inputValid),
                ...(cnpjState === "invalid" && styles.inputInvalid),
                ...(cnpjState === "incomplete" && styles.inputIncomplete),
              }}
              disabled={disabled}
              placeholder="00.000.000/0000-00"
              required
            />
            {/* ✅ INDICADOR VISUAL CNPJ IMEDIATO */}
            {formData.cnpj && formData.cnpj.length >= 3 && (
              <span style={styles.validationIcon}>
                {cnpjState === "valid" && "✅"}
                {cnpjState === "invalid" && "❌"}
                {cnpjState === "incomplete" && "⏳"}
              </span>
            )}
          </div>
          {/* ✅ MENSAGENS DE VALIDAÇÃO IMEDIATA */}
          {cnpjState === "invalid" && (
            <small style={styles.errorText}>
              CNPJ inválido - Verifique os dígitos
            </small>
          )}
          {cnpjState === "incomplete" &&
            formData.cnpj &&
            formData.cnpj.length >= 8 && (
              <small style={styles.warningText}>
                Continue digitando... (14 dígitos necessários)
              </small>
            )}
          {fieldErrors.cnpj && cnpjState !== "invalid" && (
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

        {/* Campo Funcional */}
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

// ✅ ESTILOS com validação CNPJ aprimorada
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
    transition: "all 0.3s ease",
    backgroundColor: "white",
    flex: "1",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  inputValid: {
    borderColor: "#28a745",
    backgroundColor: "#f8fff8",
    boxShadow: "0 0 0 2px rgba(40, 167, 69, 0.25)",
  },
  inputInvalid: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  // ✅ NOVO: Estado incompleto (digitando)
  inputIncomplete: {
    borderColor: "#ffc107",
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
    fontWeight: "bold",
  },
  // ✅ NOVO: Texto de aviso (amarelo)
  warningText: {
    color: "#856404",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
    fontStyle: "italic",
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
