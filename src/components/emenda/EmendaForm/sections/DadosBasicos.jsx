// src/components/emenda/EmendaForm/sections/DadosBasicos.jsx - FIX CIRÚRGICO
// ✅ APENAS: ícone ℹ️ + destaque campo obrigatório - TUDO MAIS ORIGINAL

import React from "react";
import { formatarMoedaInput } from "../../../../utils/formatters";

const DadosBasicos = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // ✅ ESTADOS ORIGINAIS PRESERVADOS
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

  // ✅ HANDLER ORIGINAL COM APENAS formatação valor
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    // ✅ ÚNICA MUDANÇA: Formatação do campo "Valor do Recurso"
    if (name === "valorRecurso") {
      valorFormatado = formatarMoedaInput(value);
    }

    onChange?.({ target: { name, value: valorFormatado } });
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

        {/* Município - ORIGINAL */}
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

        {/* UF - ORIGINAL */}
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

        {/* ✅ Valor do Recurso - APENAS ícone adicionado */}
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

        {/* Objeto da Proposta - ORIGINAL */}
        <div style={styles.formGroup}>
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

// ✅ ESTILOS ORIGINAIS + apenas destaque campo obrigatório + ícone
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
  // ✅ CORRIGIDO: usar border completo
  inputError: {
    border: "2px solid #dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },
  // ✅ ÚNICO ACRÉSCIMO: ícone de informação
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default DadosBasicos;