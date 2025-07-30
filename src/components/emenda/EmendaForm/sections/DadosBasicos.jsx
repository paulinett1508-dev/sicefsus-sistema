// src/components/emenda/EmendaForm/sections/DadosBasicos.jsx
// Seção "Dados Básicos Obrigatórios" extraída do EmendaForm
// Usa formatters.js e validators.js existentes

import React from "react";
import { formatarMoedaInput } from "../../../../utils/formatters";

const DadosBasicos = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // ✅ ESTADOS BRASILEIROS (do arquivo original)
  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  // ✅ PROGRAMAS SUS (do arquivo original)
  const programas = [
    { value: "", label: "Selecione o programa" },
    {
      value: "2015",
      label: "2015 - Fortalecimento do Sistema Único de Saúde (SUS)",
    },
    {
      value: "2016",
      label: "2016 - Política Nacional de Atenção Integral à Saúde da Mulher",
    },
    {
      value: "2017",
      label: "2017 - Política Nacional de Atenção Integral à Saúde do Homem",
    },
    {
      value: "2018",
      label: "2018 - Política Nacional de Atenção à Saúde dos Povos Indígenas",
    },
    { value: "2019", label: "2019 - Atenção Especializada à Saúde" },
    { value: "2020", label: "2020 - Atenção Primária à Saúde" },
  ];

  // ✅ HANDLER DE MUDANÇA
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let valorFormatado = value;

    // Formatação para campos monetários usando formatters.js existente
    if (name === "valorRecurso") {
      valorFormatado = formatarMoedaInput(value);
    }

    onChange?.({ target: { name, value: valorFormatado } });
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📋</span>
        Dados Básicos Obrigatórios
      </legend>

      <div style={styles.formGrid}>
        {/* Parlamentar */}
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
            required
          />
        </div>

        {/* Número da Emenda */}
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
            required
          />
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
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.municipio && styles.inputError),
            }}
            disabled={disabled}
            required
          />
        </div>

        {/* UF */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            UF <span style={styles.required}>*</span>
          </label>
          <select
            name="uf"
            value={formData.uf || ""}
            onChange={handleInputChange}
            style={{
              ...styles.select,
              ...(fieldErrors.uf && styles.inputError),
            }}
            disabled={disabled}
            required
          >
            <option value="">Selecione...</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {/* Valor do Recurso */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Valor do Recurso <span style={styles.required}>*</span>
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
        </div>

        {/* Programa */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Programa <span style={styles.required}>*</span>
          </label>
          <select
            name="programa"
            value={formData.programa || ""}
            onChange={handleInputChange}
            style={{
              ...styles.select,
              ...(fieldErrors.programa && styles.inputError),
            }}
            disabled={disabled}
            required
          >
            {programas.map((programa) => (
              <option key={programa.value} value={programa.value}>
                {programa.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Objeto da Proposta */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Objeto da Proposta <span style={styles.required}>*</span>
        </label>
        <textarea
          name="objetoProposta"
          value={formData.objetoProposta || ""}
          onChange={handleInputChange}
          style={{
            ...styles.textarea,
            ...(fieldErrors.objetoProposta && styles.inputError),
          }}
          disabled={disabled}
          rows={3}
          required
        />
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
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "Arial, sans-serif",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
};

export default DadosBasicos;
