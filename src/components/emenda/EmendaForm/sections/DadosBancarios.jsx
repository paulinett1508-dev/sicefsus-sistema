// src/components/emenda/EmendaForm/sections/DadosBancarios.jsx
// Seção "Dados Bancários" extraída do EmendaForm
// Banco, agência, conta

import React, { useState } from "react";
import { useTheme } from "../../../../context/ThemeContext";

const DadosBancarios = ({
  formData = {},
  onChange,
  fieldErrors = {},
  onClearError,
  disabled = false,
}) => {
  const { isDark } = useTheme();

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    fieldset: {
      borderColor: isDark ? "var(--theme-border)" : "#2563EB",
      background: isDark ? "var(--theme-surface)" : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.1)",
    },
    legend: {
      background: isDark ? "var(--theme-surface-secondary)" : "white",
      borderColor: isDark ? "var(--theme-border)" : "#2563EB",
      color: isDark ? "var(--theme-text)" : "#2563EB",
    },
    label: {
      color: isDark ? "var(--theme-text)" : "#333",
    },
    input: {
      borderColor: isDark ? "var(--theme-border)" : "#dee2e6",
      backgroundColor: isDark ? "var(--theme-input-bg)" : "white",
      color: isDark ? "var(--theme-text)" : "inherit",
    },
    collapsibleSection: {
      borderColor: isDark ? "var(--theme-border)" : "#dee2e6",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f8f9fa",
    },
    toggleButton: {
      color: isDark ? "var(--theme-text-secondary)" : "#495057",
    },
    bankCodesContent: {
      backgroundColor: isDark ? "var(--theme-surface)" : "white",
      borderTopColor: isDark ? "var(--theme-border)" : "#dee2e6",
    },
    bankItem: {
      color: isDark ? "var(--theme-text-muted)" : "#6c757d",
    },
  };

  // ✅ DEBUG: Verificar props recebidas
  React.useEffect(() => {
    console.log('📋 DadosBancarios - Props recebidas:', {
      hasOnChange: typeof onChange === 'function',
      hasFormData: !!formData
    });
  }, [onChange, formData]);

  const [showBankCodes, setShowBankCodes] = useState(false);
  // ✅ HANDLER DE MUDANÇA
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Permitir apenas números para alguns campos
    let valorFormatado = value;

    if (name === "banco" || name === "agencia" || name === "conta") {
      // Remover caracteres não numéricos exceto para conta que pode ter dígito
      if (name === "conta") {
        valorFormatado = value.replace(/[^\d-]/g, "");
      } else {
        valorFormatado = value.replace(/[^\d]/g, "");
      }
    }

    onChange?.({ target: { name, value: valorFormatado } });
  };

  // ✅ BANCOS MAIS COMUNS (para referência)
  const bancosComuns = [
    { codigo: "001", nome: "Banco do Brasil" },
    { codigo: "104", nome: "Caixa Econômica Federal" },
    { codigo: "237", nome: "Bradesco" },
    { codigo: "341", nome: "Itaú" },
    { codigo: "033", nome: "Santander" },
    { codigo: "745", nome: "Citibank" },
    { codigo: "422", nome: "Banco Safra" },
  ];

  return (
    <fieldset style={{ ...styles.fieldset, ...dynamicStyles.fieldset }}>
      <legend style={{ ...styles.legend, ...dynamicStyles.legend }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_balance</span>
        Dados Bancários
      </legend>

      <div style={styles.formGrid}>
        {/* Banco */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            Banco <span style={styles.required}>*</span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14, color: "#0066cc", cursor: "help" }}
              title="Código de 3 dígitos do banco (ex: 001 - Banco do Brasil)"
            >
              info
            </span>
          </label>
          <input
            type="text"
            name="banco"
            value={formData.banco || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...dynamicStyles.input,
              ...(fieldErrors.banco && styles.inputError),
            }}
            disabled={disabled}
            placeholder="001"
            maxLength={3}
            required
          />
          {fieldErrors.banco && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Agência */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            Agência <span style={styles.required}>*</span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14, color: "#0066cc", cursor: "help" }}
              title="Número da agência (sem dígito verificador)"
            >
              info
            </span>
          </label>
          <input
            type="text"
            name="agencia"
            value={formData.agencia || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...dynamicStyles.input,
              ...(fieldErrors.agencia && styles.inputError),
            }}
            disabled={disabled}
            placeholder="024120"
            maxLength={6}
            required
          />
          {fieldErrors.agencia && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Conta */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            Conta <span style={styles.required}>*</span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14, color: "#0066cc", cursor: "help" }}
              title="Número da conta (com dígito verificador se houver)"
            >
              info
            </span>
          </label>
          <input
            type="text"
            name="conta"
            value={formData.conta || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...dynamicStyles.input,
              ...(fieldErrors.conta && styles.inputError),
            }}
            disabled={disabled}
            placeholder="00002666965"
            maxLength={15}
            required
          />
          {fieldErrors.conta && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>
      </div>

      {/* Seção colapsível de códigos bancários */}
      <div style={{ ...styles.collapsibleSection, ...dynamicStyles.collapsibleSection }}>
        <button
          type="button"
          onClick={() => setShowBankCodes(!showBankCodes)}
          style={{ ...styles.toggleButton, ...dynamicStyles.toggleButton }}
          disabled={disabled}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--theme-primary)", transition: "transform 0.2s ease" }}>
            {showBankCodes ? "expand_more" : "chevron_right"}
          </span>
          <span style={styles.toggleText}>Códigos de Bancos Mais Comuns</span>
        </button>

        {showBankCodes && (
          <div style={{ ...styles.bankCodesContent, ...dynamicStyles.bankCodesContent }}>
            <div style={styles.bankList}>
              {bancosComuns.map((banco) => (
                <div key={banco.codigo} style={{ ...styles.bankItem, ...dynamicStyles.bankItem }}>
                  <strong>{banco.codigo}</strong> - {banco.nome}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS CORRIGIDOS - CSS CONFLICT RESOLVIDO
const styles = {
  fieldset: {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#2563EB",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#2563EB",
    color: "#2563EB",
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
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#dee2e6",
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
  collapsibleSection: {
    marginTop: "20px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#dee2e6",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
  },
  toggleButton: {
    width: "100%",
    padding: "12px 15px",
    backgroundColor: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
    transition: "background-color 0.2s ease",
    textAlign: "left",
  },
  toggleIcon: {
    fontSize: "12px",
    color: "#2563EB",
    transition: "transform 0.2s ease",
  },
  toggleText: {
    fontSize: "14px",
  },
  bankCodesContent: {
    padding: "15px",
    backgroundColor: "white",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#dee2e6",
  },
  bankList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "8px",
  },
  bankItem: {
    fontSize: "13px",
    color: "#6c757d",
    padding: "4px 0",
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default DadosBancarios;