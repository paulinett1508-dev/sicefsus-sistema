// src/components/emenda/EmendaForm/sections/Identificacao.jsx
// ✅ REORGANIZAÇÃO: CNPJ, Município e UF movidos para cá

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
  // ✅ ESTADOS BRASILEIROS (movidos de DadosBasicos)
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

  // ✅ HANDLER COM FORMATAÇÃO E VALIDAÇÃO
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    // Formatação específica para CNPJ
    if (name === "cnpjMunicipio") {
      valorFormatado = formatarCNPJ(value);
    }

    onChange?.({ target: { name, value: valorFormatado } });
    warningText: {
    color: "#ffc107",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },
};

  // Estado de validação do CNPJ
  const getCNPJStatus = () => {
    if (!formData.cnpjMunicipio) return null;
    const cnpjLimpo = formData.cnpjMunicipio.replace(/\D/g, '');
    if (cnpjLimpo.length < 14) return 'digitando';
    return validarCNPJ(formData.cnpjMunicipio) ? 'valido' : 'invalido';
  };

  const cnpjStatus = getCNPJStatus();

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🏛️</span>
        Identificação
      </legend>

      <div style={styles.formGrid}>
        {/* ✅ CNPJ do Município */}
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
                ...(cnpjStatus === 'valido' && styles.inputValid),
                ...(cnpjStatus === 'invalido' && styles.inputInvalid),
              }}
              disabled={disabled}
              placeholder="00.000.000/0000-00"
              required
            />
            {/* ✅ INDICADOR VISUAL CNPJ EM TEMPO REAL */}
            {formData.cnpjMunicipio && (
              <span style={{
                ...styles.validationIcon,
                color: cnpjStatus === 'valido' ? '#28a745' : 
                       cnpjStatus === 'invalido' ? '#dc3545' : '#6c757d'
              }}>
                {cnpjStatus === 'valido' ? "✅" : 
                 cnpjStatus === 'invalido' ? "❌" : "⏳"}
              </span>
            )}
          </div>
          {fieldErrors.cnpjMunicipio && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
          {cnpjStatus === 'invalido' && (
            <small style={styles.warningText}>CNPJ inválido</small>
          )}
        </div>

        {/* ✅ Município (MOVIDO DE DADOS BÁSICOS) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Município <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="municipio"
            value={formData.municipio || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.municipio && styles.inputError),
            }}
            disabled={disabled}
            placeholder="Nome do município"
            required
          />
          {fieldErrors.municipio && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* ✅ UF (MOVIDO DE DADOS BÁSICOS) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            UF <span style={styles.required}>*</span>
          </label>
          <select
            name="uf"
            value={formData.uf || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.uf && styles.inputError),
            }}
            disabled={disabled}
            required
          >
            <option value="">Selecione o estado</option>
            {estados.map((estado) => (
              <option key={estado.sigla} value={estado.sigla}>
                {estado.sigla} - {estado.nome}
              </option>
            ))}
          </select>
          {fieldErrors.uf && (
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
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default Identificacao;