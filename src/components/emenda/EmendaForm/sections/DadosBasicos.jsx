// src/components/emenda/EmendaForm/sections/DadosBasicos.jsx
// ✅ ATUALIZADO: Importando constantes centralizadas

import React, { useCallback } from "react";
import CNPJInput from "../../../CNPJInput";
import { PROGRAMAS_SAUDE, OBJETOS_EMENDA } from "../../../../config/constants";
import { useTheme } from "../../../../context/ThemeContext";

const DadosBasicos = React.memo(
  ({ formData = {}, onChange, fieldErrors = {}, onClearError }) => {
    const { isDark } = useTheme();

    if (process.env.NODE_ENV === "development") {
      console.log("📋 DadosBasicos renderizado");
    }

    // Estilos dinâmicos baseados no tema
    const dynamicStyles = {
      fieldset: {
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: isDark ? "var(--theme-border)" : "#2563EB",
        borderRadius: "10px",
        padding: "20px",
        background: isDark
          ? "var(--theme-surface)"
          : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.1)",
      },
      legend: {
        background: isDark ? "var(--theme-surface-secondary)" : "white",
        padding: "5px 15px",
        borderRadius: "20px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: isDark ? "var(--theme-border)" : "#2563EB",
        color: isDark ? "var(--theme-text)" : "#2563EB",
        fontWeight: "bold",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      },
      label: {
        fontWeight: "bold",
        color: isDark ? "var(--theme-text)" : "#333",
        fontSize: "14px",
      },
      input: {
        padding: "12px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: isDark ? "var(--theme-border)" : "#dee2e6",
        borderRadius: "6px",
        fontSize: "14px",
        transition: "border-color 0.3s ease",
        backgroundColor: isDark ? "var(--theme-input-bg)" : "white",
        color: isDark ? "var(--theme-text)" : "inherit",
      },
    };

    const formatarMoeda = useCallback((valor) => {
      const numero = valor.replace(/\D/g, "");
      if (!numero) return "";
      const centavos = parseInt(numero, 10);
      const reais = centavos / 100;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(reais);
    }, []);

    const handleInputChange = useCallback(
      (e) => {
        const { name, value } = e.target;

        if (
          process.env.NODE_ENV === "development" &&
          ["objeto", "autor", "numero", "valor"].includes(name)
        ) {
          console.log(`📄 Campo ${name} alterado para: "${value}"`);
        }

        if (onClearError && fieldErrors[name]) {
          onClearError(name);
        }

        if (name === "valor" || name === "valorRecurso") {
          const valorFormatado = formatarMoeda(value);
          onChange({ target: { name, value: valorFormatado } });
        } else {
          onChange(e);
        }
      },
      [onChange, onClearError, fieldErrors, formatarMoeda],
    );

    return (
      <fieldset style={dynamicStyles.fieldset}>
        <legend style={dynamicStyles.legend}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>payments</span>
          Dados Básicos
        </legend>

        <div style={styles.formGrid}>
          {/* Programa - ✅ ATUALIZADO COM CONSTANTES */}
          <div style={styles.formGroup}>
            <label style={dynamicStyles.label}>
              Programa <span style={styles.required}>*</span>
            </label>
            <select
              name="programa"
              value={formData.programa || ""}
              onChange={handleInputChange}
              style={{
                ...dynamicStyles.input,
                ...(fieldErrors.programa && styles.inputError),
              }}
              required
            >
              <option value="">Selecione o programa</option>
              {PROGRAMAS_SAUDE.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
            {fieldErrors.programa && (
              <small style={styles.errorText}>{fieldErrors.programa}</small>
            )}
          </div>

          {/* Objeto da Proposta */}
          <div style={styles.formGroup}>
            <label style={dynamicStyles.label}>
              Objeto da Proposta <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="objeto"
              value={formData.objeto || ""}
              onChange={handleInputChange}
              style={{
                ...dynamicStyles.input,
                ...(fieldErrors.objeto && styles.inputError),
              }}
              required
            />
            {fieldErrors.objeto && (
              <small style={styles.errorText}>{fieldErrors.objeto}</small>
            )}
          </div>

          {/* Parlamentar/Autor */}
          <div style={styles.formGroup}>
            <label style={dynamicStyles.label}>
              Parlamentar/Autor <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="autor"
              value={formData.autor || ""}
              onChange={handleInputChange}
              placeholder="Nome do parlamentar"
              style={{
                ...dynamicStyles.input,
                ...(fieldErrors.autor && styles.inputError),
              }}
              required
            />
            {fieldErrors.autor && (
              <small style={styles.errorText}>{fieldErrors.autor}</small>
            )}
          </div>

          {/* Número da Emenda */}
          <div style={styles.formGroup}>
            <label style={dynamicStyles.label}>
              Número da Emenda <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero || ""}
              onChange={handleInputChange}
              placeholder="Ex: 30460003"
              style={{
                ...dynamicStyles.input,
                ...(fieldErrors.numero && styles.inputError),
              }}
              required
            />
            {fieldErrors.numero && (
              <small style={styles.errorText}>{fieldErrors.numero}</small>
            )}
          </div>

          {/* Objeto da Emenda - ✅ ATUALIZADO COM CONSTANTES */}
          <div style={styles.formGroup}>
            <label style={dynamicStyles.label}>
              Objeto da Emenda <span style={styles.required}>*</span>
            </label>
            <select
              name="tipo"
              value={formData.tipo || formData.objetoEmenda || ""}
              onChange={(e) => {
                // Salvar em ambos os campos para compatibilidade
                handleInputChange(e);
                onChange({ target: { name: "objetoEmenda", value: e.target.value } });
              }}
              style={{
                ...dynamicStyles.input,
                ...(fieldErrors.tipo && styles.inputError),
              }}
              required
            >
              <option value="">Selecione o objeto...</option>
              {OBJETOS_EMENDA.map((obj) => (
                <option key={obj} value={obj}>
                  {obj}
                </option>
              ))}
            </select>
            {fieldErrors.tipo && (
              <small style={styles.errorText}>{fieldErrors.tipo}</small>
            )}
          </div>

          {/* Nº da Proposta */}
          <div style={styles.formGroup}>
            <label style={dynamicStyles.label}>Nº da Proposta</label>
            <input
              type="text"
              name="numeroProposta"
              value={formData.numeroProposta || ""}
              onChange={handleInputChange}
              placeholder="Ex: 36000660361202500"
              style={dynamicStyles.input}
            />
          </div>

          {/* Funcional */}
          <div style={styles.formGroup}>
            <label style={dynamicStyles.label}>Funcional</label>
            <input
              type="text"
              name="funcional"
              value={formData.funcional || ""}
              onChange={handleInputChange}
              placeholder="Ex: 10301311928590021"
              style={dynamicStyles.input}
            />
          </div>

          {/* Beneficiário - CNPJ */}
          <div style={styles.formGroup}>
            <CNPJInput
              label="Beneficiário (CNPJ)"
              value={formData.beneficiario || ""}
              onChange={(e) => {
                const cnpjValue = e.target.value;
                
                if (process.env.NODE_ENV === "development") {
                  console.log(`📄 CNPJInput beneficiario: "${cnpjValue}"`);
                }
                
                // ✅ CORREÇÃO: Atualizar AMBOS os campos simultaneamente
                handleInputChange({
                  target: {
                    name: "beneficiario",
                    value: cnpjValue,
                  },
                });
                
                // Sincronizar cnpjBeneficiario
                handleInputChange({
                  target: {
                    name: "cnpjBeneficiario",
                    value: cnpjValue,
                  },
                });
              }}
              required={true}
              placeholder="00.000.000/0000-00"
              showValidation={true}
              style={styles.formGroup}
              inputStyle={{
                ...dynamicStyles.input,
                padding: "12px",
                fontSize: "14px",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: fieldErrors.beneficiario ? "#dc3545" : "#dee2e6",
                borderRadius: "6px",
              }}
            />
            {fieldErrors.beneficiario && (
              <small style={styles.errorText}>{fieldErrors.beneficiario}</small>
            )}
          </div>

          {/* Valor do Recurso */}
          <div style={styles.formGroup}>
            <label style={dynamicStyles.label}>
              Valor do Recurso <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="valor"
              value={formData.valor || ""}
              onChange={handleInputChange}
              style={{
                ...dynamicStyles.input,
                ...styles.inputMoney,
                ...(fieldErrors.valor && styles.inputError),
              }}
              required
            />
            {fieldErrors.valor && (
              <small style={styles.errorText}>{fieldErrors.valor}</small>
            )}
          </div>
        </div>
      </fieldset>
    );
  },
);

DadosBasicos.displayName = "DadosBasicos";

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
  inputMoney: {
    fontWeight: "600",
    color: "#059669",
    textAlign: "right",
    fontSize: "16px",
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  inputValid: {
    borderColor: "#28a745",
    backgroundColor: "#f8fff9",
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
  successMessage: {
    color: "#27ae60",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
    fontWeight: "500",
  },
};

export default DadosBasicos;
