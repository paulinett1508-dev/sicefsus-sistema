// src/components/CNPJInput.jsx
import React, { useState, useEffect } from "react";
import { formatarCNPJ, validarCNPJ } from "../utils/cnpjUtils";

const CNPJInput = ({
  value = "",
  onChange,
  onValidChange,
  label = "CNPJ",
  required = false,
  placeholder = "00.000.000/0000-00",
  disabled = false,
  autoFocus = false,
  showValidation = true,
  style = {},
  inputStyle = {},
  className = "",
}) => {
  const [cnpj, setCNPJ] = useState(value);
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCNPJ(formatarCNPJ(value));
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatarCNPJ(rawValue);

    // Só permite números e formatação
    if (rawValue.length > formatted.length + 1) return;

    setCNPJ(formatted);

    // Callback com valor formatado
    if (onChange) {
      onChange({
        target: {
          name: e.target.name,
          value: formatted,
          rawValue: formatted.replace(/\D/g, ""),
        },
      });
    }

    // Valida se tiver 14 dígitos
    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 14) {
      const valid = validarCNPJ(formatted);
      setIsValid(valid);

      // Callback de validação
      if (onValidChange) {
        onValidChange(valid, formatted);
      }
    } else {
      setIsValid(false);
      if (onValidChange) {
        onValidChange(false, formatted);
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handleKeyPress = (e) => {
    // Permite apenas números
    const char = String.fromCharCode(e.which);
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  const hasError = touched && !isValid && cnpj.length > 0;
  const showSuccess = touched && isValid && cnpj.length === 18;

  return (
    <div style={{ ...styles.container, ...style }} className={className}>
      {label && (
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}> *</span>}
        </label>
      )}

      <div style={styles.inputWrapper}>
        <input
          type="text"
          value={cnpj}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={18}
          style={{
            ...styles.input,
            ...(hasError ? styles.inputError : {}),
            ...(showSuccess ? styles.inputSuccess : {}),
            ...inputStyle,
          }}
        />

        {showValidation && cnpj.length > 0 && (
          <div style={styles.validationIcon}>
            {loading ? (
              <span style={styles.loadingIcon}>🔄</span>
            ) : showSuccess ? (
              <span style={styles.successIcon}>✅</span>
            ) : hasError ? (
              <span style={styles.errorIcon}>❌</span>
            ) : (
              <span style={styles.pendingIcon}>⚪</span>
            )}
          </div>
        )}
      </div>

      {showValidation && hasError && (
        <div style={styles.errorMessage}>
          CNPJ inválido. Verifique os dígitos.
        </div>
      )}

      {showValidation && showSuccess && (
        <div style={styles.successMessage}>CNPJ válido!</div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },

  required: {
    color: "#e74c3c",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  input: {
    width: "100%",
    padding: "12px 40px 12px 16px",
    fontSize: "16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "monospace",
    letterSpacing: "0.5px",
  },

  inputError: {
    borderColor: "#e74c3c",
    backgroundColor: "#fff5f5",
  },

  inputSuccess: {
    borderColor: "#27ae60",
    backgroundColor: "#f0fff4",
  },

  validationIcon: {
    position: "absolute",
    right: "12px",
    fontSize: "20px",
  },

  loadingIcon: {
    animation: "spin 1s linear infinite",
  },

  successIcon: {
    color: "#27ae60",
  },

  errorIcon: {
    color: "#e74c3c",
  },

  pendingIcon: {
    color: "#95a5a6",
    opacity: 0.7,
  },

  errorMessage: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#e74c3c",
    fontWeight: "500",
  },

  successMessage: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#27ae60",
    fontWeight: "500",
  },
};

export default CNPJInput;
