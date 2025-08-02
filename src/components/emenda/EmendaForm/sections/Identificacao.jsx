import React from "react";

const Identificacao = ({ formData = {}, onChange, fieldErrors = {} }) => {
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
      const formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
      onChange({ target: { name, value: formatted } });
    } else {
      onChange(e);
    }
  };

  const isValidCNPJ = (cnpj) => {
    const numbers = cnpj.replace(/\D/g, "");
    if (numbers.length !== 14) return false;

    const digits = numbers.split("").map(Number);

    // Primeiro dígito
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== digits[12]) return false;

    // Segundo dígito
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += digits[i] * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return digit === digits[13];
  };

  const getCNPJStatus = () => {
    if (!formData.cnpj || formData.cnpj.length < 3) return null;
    const cnpjLimpo = formData.cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length < 14) return "incomplete";
    return isValidCNPJ(formData.cnpj) ? "valid" : "invalid";
  };

  const cnpjStatus = getCNPJStatus();

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🏢</span>
        Identificação
      </legend>

      <div style={styles.formGrid}>
        {/* CNPJ */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            CNPJ <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj || ""}
            onChange={handleInputChange}
            placeholder="00.000.000/0000-00"
            style={{
              ...styles.input,
              ...(fieldErrors.cnpj && styles.inputError),
              ...(cnpjStatus === "valid" && styles.inputValid),
              ...(cnpjStatus === "invalid" && styles.inputError),
            }}
            required
          />
          {cnpjStatus === "invalid" && (
            <small style={styles.errorText}>CNPJ inválido</small>
          )}
          {fieldErrors.cnpj && !cnpjStatus && (
            <small style={styles.errorText}>{fieldErrors.cnpj}</small>
          )}
        </div>

        {/* Município */}
        <div style={styles.formGroup}>
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
              ...(fieldErrors.municipio && styles.inputError),
            }}
            required
          />
          {fieldErrors.municipio && (
            <small style={styles.errorText}>{fieldErrors.municipio}</small>
          )}
        </div>

        {/* UF */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            UF <span style={styles.required}>*</span>
          </label>
          <select
            name="uf"
            value={formData.uf || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(fieldErrors.uf && styles.inputError),
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
          {fieldErrors.uf && (
            <small style={styles.errorText}>{fieldErrors.uf}</small>
          )}
        </div>
      </div>
    </fieldset>
  );
};

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
  inputValid: {
    borderColor: "#28a745",
    backgroundColor: "#f8fff9",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },
};

export default Identificacao;
