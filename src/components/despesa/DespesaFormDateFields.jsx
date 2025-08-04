// src/components/despesa/DespesaFormDateFields.jsx
// ✅ ATUALIZADO: Removido campo data de vencimento e adicionada validação contra data de validade da emenda

import React from "react";

const DespesaFormDateFields = ({
  formData,
  errors,
  modoVisualizacao,
  handleInputChange,
  emendaInfo, // ✅ NOVO: Para acessar a data de validade da emenda
}) => {
  // ✅ Função para obter a data máxima permitida (data de validade da emenda)
  const getDataMaxima = () => {
    if (emendaInfo?.dataValidade) {
      return emendaInfo.dataValidade;
    }
    return null;
  };

  const dataMaxima = getDataMaxima();

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📅</span>
        Datas da Despesa
      </legend>

      {/* ✅ Aviso sobre limite de data */}
      {dataMaxima && (
        <div style={styles.avisoDataLimite}>
          <span style={styles.avisoIcon}>⚠️</span>
          <span style={styles.avisoTexto}>
            Todas as datas devem ser anteriores à validade da emenda:{" "}
            <strong>{new Date(dataMaxima).toLocaleDateString("pt-BR")}</strong>
          </span>
        </div>
      )}

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Data do Empenho *</label>
          <input
            type="date"
            name="dataEmpenho"
            value={formData.dataEmpenho}
            onChange={handleInputChange}
            style={errors.dataEmpenho ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            max={dataMaxima} // ✅ Limita pela data de validade
            required
          />
          {errors.dataEmpenho && (
            <span style={styles.errorText}>{errors.dataEmpenho}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Data da Liquidação *</label>
          <input
            type="date"
            name="dataLiquidacao"
            value={formData.dataLiquidacao}
            onChange={handleInputChange}
            style={errors.dataLiquidacao ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            max={dataMaxima} // ✅ Limita pela data de validade
            required
          />
          {errors.dataLiquidacao && (
            <span style={styles.errorText}>{errors.dataLiquidacao}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Data do Pagamento *</label>
          <input
            type="date"
            name="dataPagamento"
            value={formData.dataPagamento}
            onChange={handleInputChange}
            style={errors.dataPagamento ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            max={dataMaxima} // ✅ Limita pela data de validade
            required
          />
          {errors.dataPagamento && (
            <span style={styles.errorText}>{errors.dataPagamento}</span>
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
  avisoDataLimite: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 15px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "6px",
    marginBottom: "15px",
    fontSize: "13px",
    color: "#856404",
  },
  avisoIcon: {
    fontSize: "16px",
  },
  avisoTexto: {
    flex: 1,
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
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
  },
};

export default DespesaFormDateFields;
