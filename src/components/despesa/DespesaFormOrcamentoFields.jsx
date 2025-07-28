// src/components/despesa/DespesaFormOrcamentoFields.jsx
// ✅ Componente especializado para campos de classificação orçamentária

import React from "react";

const DespesaFormOrcamentoFields = ({
  formData,
  errors,
  modoVisualizacao,
  handleInputChange,
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>💰</span>
        Classificação Orçamentária
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Ação *</label>
          <select
            name="acao"
            value={formData.acao}
            onChange={handleInputChange}
            style={
              errors.acao
                ? { ...styles.select, borderColor: "#dc3545" }
                : styles.select
            }
            disabled={modoVisualizacao}
            required
          >
            <option value="">Selecione a ação</option>
            <option value="8535">
              8535 - Estruturação de Unidades de Atenção Especializada em Saúde
            </option>
            <option value="8536">
              8536 - Estruturação da Rede de Serviços de Atenção Básica de Saúde
            </option>
            <option value="8585">
              8585 - Atenção à Saúde da População para Procedimentos em Média e
              Alta Complexidade
            </option>
            <option value="8730">
              8730 - Atenção à Saúde da População para Procedimentos de Média e
              Alta Complexidade
            </option>
            <option value="20AD">20AD - Atenção Primária à Saúde</option>
            <option value="21C0">
              21C0 - Recursos para estruturação da rede de serviços de atenção
              básica
            </option>
          </select>
          {errors.acao && <span style={styles.errorText}>{errors.acao}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Dotação Orçamentária *</label>
          <input
            type="text"
            name="dotacaoOrcamentaria"
            value={formData.dotacaoOrcamentaria}
            onChange={handleInputChange}
            style={
              errors.dotacaoOrcamentaria ? styles.inputError : styles.input
            }
            readOnly={modoVisualizacao}
            placeholder="Código da dotação orçamentária"
            required
          />
          {errors.dotacaoOrcamentaria && (
            <span style={styles.errorText}>{errors.dotacaoOrcamentaria}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>
            Classificação Funcional-Programática *
          </label>
          <input
            type="text"
            name="classificacaoFuncional"
            value={formData.classificacaoFuncional}
            onChange={handleInputChange}
            style={
              errors.classificacaoFuncional ? styles.inputError : styles.input
            }
            readOnly={modoVisualizacao}
            placeholder="Classificação funcional-programática"
            required
          />
          {errors.classificacaoFuncional && (
            <span style={styles.errorText}>
              {errors.classificacaoFuncional}
            </span>
          )}
          <span style={styles.helpText}>Ex: 10.302.0002.20AD.0001</span>
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
  labelRequired: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  inputError: {
    padding: "12px",
    border: "2px solid #dc3545",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
  },
  helpText: {
    color: "#6c757d",
    fontSize: "12px",
    marginTop: "5px",
  },
};

export default DespesaFormOrcamentoFields;
