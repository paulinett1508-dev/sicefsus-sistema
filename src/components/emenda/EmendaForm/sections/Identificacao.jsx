// src/components/emenda/EmendaForm/sections/Identificacao.jsx
import React from "react";
import { validarCNPJ, formatarCNPJ } from "../../../../utils/validators";

const Identificacao = ({ formData, onChange, fieldErrors = {} }) => {
  const estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "cnpj") {
      const formatted = formatarCNPJ(value);
      onChange({ target: { name, value: formatted } });
    } else {
      onChange(e);
    }
  };

  // Função para obter o status de validação do CNPJ
  const getCNPJStatus = () => {
    if (!formData.cnpj || formData.cnpj.length < 3) return null;

    const cnpjLimpo = formData.cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length < 14) return "incomplete";
    if (cnpjLimpo.length === 14) {
      return validarCNPJ(formData.cnpj) ? "valid" : "invalid";
    }

    return null;
  };

  const cnpjStatus = getCNPJStatus();

  // Função para obter o estilo do input baseado no status
  const getInputStyle = () => {
    const baseStyle = { ...styles.input };

    if (fieldErrors?.cnpj) {
      return { ...baseStyle, ...styles.inputError };
    }

    if (cnpjStatus === "valid") {
      return { ...baseStyle, ...styles.inputValid };
    }

    if (cnpjStatus === "invalid") {
      return { ...baseStyle, ...styles.inputInvalid };
    }

    if (cnpjStatus === "incomplete") {
      return { ...baseStyle, ...styles.inputIncomplete };
    }

    return baseStyle;
  };

  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        <span style={styles.sectionIcon}>🏢</span>
        Identificação
      </h3>

      <div style={styles.row}>
        {/* CNPJ */}
        <div style={styles.field}>
          <label style={styles.label}>
            CNPJ <span style={styles.required}>*</span>
          </label>
          <div style={styles.inputContainer}>
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj || ""}
              onChange={handleInputChange}
              placeholder="00.000.000/0000-00"
              style={getInputStyle()}
              required
            />
            {formData.cnpj && formData.cnpj.length >= 3 && (
              <span style={styles.validationIcon}>
                {cnpjStatus === "valid" && "✅"}
                {cnpjStatus === "invalid" && "❌"}
                {cnpjStatus === "incomplete" && "⏳"}
              </span>
            )}
          </div>
          {cnpjStatus === "invalid" && (
            <span style={styles.errorText}>CNPJ inválido</span>
          )}
          {cnpjStatus === "incomplete" &&
            formData.cnpj &&
            formData.cnpj.length >= 8 && (
              <span style={styles.warningText}>Continue digitando...</span>
            )}
          {fieldErrors?.cnpj && !cnpjStatus && (
            <span style={styles.errorText}>{fieldErrors.cnpj}</span>
          )}
        </div>

        {/* Município */}
        <div style={styles.field}>
          <label style={styles.label}>
            Município <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="municipio"
            value={formData.municipio || ""}
            onChange={onChange}
            placeholder="Nome do município"
            style={{
              ...styles.input,
              ...(fieldErrors?.municipio ? styles.inputError : {}),
            }}
            required
          />
          {fieldErrors?.municipio && (
            <span style={styles.errorText}>{fieldErrors.municipio}</span>
          )}
        </div>

        {/* UF */}
        <div style={styles.field}>
          <label style={styles.label}>
            UF <span style={styles.required}>*</span>
          </label>
          <select
            name="uf"
            value={formData.uf || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(fieldErrors?.uf ? styles.inputError : {}),
            }}
            required
          >
            <option value="">Selecione</option>
            {estados.map((estado) => (
              <option key={estado.sigla} value={estado.sigla}>
                {estado.sigla} - {estado.nome}
              </option>
            ))}
          </select>
          {fieldErrors?.uf && (
            <span style={styles.errorText}>{fieldErrors.uf}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  section: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e9ecef",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#2c3e50",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionIcon: {
    fontSize: "20px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#495057",
  },
  required: {
    color: "#dc3545",
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    padding: "10px 12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ced4da",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "all 0.2s",
    backgroundColor: "white",
    width: "100%",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
  },
  inputValid: {
    borderColor: "#28a745",
    backgroundColor: "#f8fff8",
  },
  inputInvalid: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
  },
  inputIncomplete: {
    borderColor: "#ffc107",
    backgroundColor: "#fffbf0",
  },
  validationIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
  },
  warningText: {
    color: "#856404",
    fontSize: "12px",
    marginTop: "4px",
  },
};

export default Identificacao;
