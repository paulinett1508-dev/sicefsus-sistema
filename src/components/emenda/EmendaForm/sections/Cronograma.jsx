// src/components/emenda/EmendaForm/sections/Cronograma.jsx
// ✅ VERSÃO CLEAN: Apenas validação essencial, sem resumo visual

import React from "react";

const Cronograma = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // ✅ HANDLER com validação de datas em tempo real
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    onChange?.({ target: { name, value } });
  };

  // ✅ VALIDAÇÃO: Data não pode ser futura
  const isDataFutura = (dataInput) => {
    if (!dataInput) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dataInput);
    return data > hoje;
  };

  // ✅ VALIDAÇÃO: Data deve ser válida para comparação
  const isDataValidaComparacao = (dataInput) => {
    if (!dataInput) return false;
    const data = new Date(dataInput);
    return !isNaN(data.getTime());
  };

  // ✅ VALIDAÇÃO: Verificar se data excede validade da emenda
  const isDataExcedeValidade = (dataInput, dataValidade) => {
    if (!dataInput || !dataValidade) return false;
    if (
      !isDataValidaComparacao(dataInput) ||
      !isDataValidaComparacao(dataValidade)
    )
      return false;

    const data = new Date(dataInput);
    const validade = new Date(dataValidade);
    return data > validade;
  };

  // ✅ FUNÇÃO para obter mensagem de erro específica
  const getDataErrorMessage = (fieldName, value) => {
    if (!value) return null;

    if (!isDataValidaComparacao(value)) {
      return "Data inválida";
    }

    if (fieldName === "dataValidada" && isDataFutura(value)) {
      return "Data validada não pode ser futura";
    }

    if (fieldName === "dataOb" && isDataFutura(value)) {
      return "Data OB não pode ser futura";
    }

    // ✅ VALIDAÇÃO: Verificar contra data de validade
    if (fieldName === "finalExecucao" && formData.dataValidada) {
      if (isDataExcedeValidade(value, formData.dataValidada)) {
        return "Data final não pode ser posterior à validade da emenda";
      }
    }

    if (fieldName === "inicioExecucao" && formData.dataValidada) {
      if (isDataExcedeValidade(value, formData.dataValidada)) {
        return "Data início não pode ser posterior à validade da emenda";
      }
    }

    // ✅ VALIDAÇÃO: Início deve ser antes do fim
    if (fieldName === "finalExecucao" && formData.inicioExecucao) {
      if (
        isDataValidaComparacao(value) &&
        isDataValidaComparacao(formData.inicioExecucao)
      ) {
        const inicio = new Date(formData.inicioExecucao);
        const fim = new Date(value);
        if (fim < inicio) {
          return "Data final deve ser posterior à data de início";
        }
      }
    }

    return null;
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📅</span>
        Cronograma
      </legend>

      <div style={styles.formGrid}>
        {/* Data Validada */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Data Validada <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Data em que a emenda foi validada oficialmente"
            >
              ℹ️
            </span>
          </label>
          <input
            type="date"
            name="dataValidada"
            value={formData.dataValidada || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.dataValidada && styles.inputError),
              ...(getDataErrorMessage("dataValidada", formData.dataValidada) &&
                styles.inputError),
            }}
            disabled={disabled}
            required
          />
          {getDataErrorMessage("dataValidada", formData.dataValidada) && (
            <small style={styles.errorText}>
              {getDataErrorMessage("dataValidada", formData.dataValidada)}
            </small>
          )}
          {fieldErrors.dataValidada &&
            !getDataErrorMessage("dataValidada", formData.dataValidada) && (
              <small style={styles.errorText}>Campo obrigatório</small>
            )}
        </div>

        {/* Data OB */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Data OB
            <span
              style={styles.infoIcon}
              title="Data do Ofício de Bancada (se aplicável)"
            >
              ℹ️
            </span>
          </label>
          <input
            type="date"
            name="dataOb"
            value={formData.dataOb || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(getDataErrorMessage("dataOb", formData.dataOb) &&
                styles.inputError),
            }}
            disabled={disabled}
          />
          {getDataErrorMessage("dataOb", formData.dataOb) && (
            <small style={styles.errorText}>
              {getDataErrorMessage("dataOb", formData.dataOb)}
            </small>
          )}
        </div>

        {/* Início da Execução */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Início da Execução
            <span
              style={styles.infoIcon}
              title="Data prevista para início da execução da emenda"
            >
              ℹ️
            </span>
          </label>
          <input
            type="date"
            name="inicioExecucao"
            value={formData.inicioExecucao || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(getDataErrorMessage(
                "inicioExecucao",
                formData.inicioExecucao,
              ) && styles.inputError),
            }}
            disabled={disabled}
          />
          {getDataErrorMessage("inicioExecucao", formData.inicioExecucao) && (
            <small style={styles.errorText}>
              {getDataErrorMessage("inicioExecucao", formData.inicioExecucao)}
            </small>
          )}
        </div>

        {/* Final da Execução */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Final da Execução
            <span
              style={styles.infoIcon}
              title="Data prevista para conclusão da execução da emenda"
            >
              ℹ️
            </span>
          </label>
          <input
            type="date"
            name="finalExecucao"
            value={formData.finalExecucao || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(getDataErrorMessage(
                "finalExecucao",
                formData.finalExecucao,
              ) && styles.inputError),
            }}
            disabled={disabled}
          />
          {getDataErrorMessage("finalExecucao", formData.finalExecucao) && (
            <small style={styles.errorText}>
              {getDataErrorMessage("finalExecucao", formData.finalExecucao)}
            </small>
          )}
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS CLEAN - Sem resumo visual
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
    fontWeight: "bold",
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default Cronograma;
