// src/components/emenda/EmendaForm/sections/Cronograma.jsx
// Seção "Cronograma" extraída do EmendaForm
// ÚLTIMA SEÇÃO - Datas de validade, OB, execução

import React from "react";

const Cronograma = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // ✅ HANDLER DE MUDANÇA COM VALIDAÇÃO DE DATAS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange?.({ target: { name, value } });
  };

  // ✅ VALIDAR SE DATA É FUTURA
  const isDataFutura = (data) => {
    if (!data) return true;
    const dataInput = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataInput > hoje;
  };

  // ✅ VALIDAR SE DATA NÃO É MAIOR QUE VALIDADE
  const isDataValidaComparacao = (data, dataValidade) => {
    if (!data || !dataValidade) return true;
    const dataInput = new Date(data);
    const dataValidadeInput = new Date(dataValidade);
    return dataInput <= dataValidadeInput;
  };

  // ✅ OBTER MENSAGEM DE ERRO PARA DATA
  const getDataErrorMessage = (fieldName) => {
    if (fieldName === "dataValidada") {
      return "Data deve ser futura";
    }
    return "Não pode ser maior que data de validade";
  };

  // ✅ CALCULAR DIAS RESTANTES ATÉ VALIDADE
  const calcularDiasRestantes = () => {
    if (!formData.dataValidada) return null;

    const dataValidade = new Date(formData.dataValidada);
    const hoje = new Date();
    const diffTime = dataValidade - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const diasRestantes = calcularDiasRestantes();

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📅</span>
        Cronograma
      </legend>

      <div style={styles.formGrid}>
        {/* Data de Validade */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Data de Validade <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="dataValidada"
            value={formData.dataValidada || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.dataValidada && styles.inputError),
            }}
            disabled={disabled}
            required
          />
          {fieldErrors.dataValidada && (
            <small style={styles.errorText}>
              {getDataErrorMessage("dataValidada")}
            </small>
          )}
          <small style={styles.helpText}>
            💡 Outras datas não podem ser posteriores a esta
          </small>

          {/* Indicador de dias restantes */}
          {diasRestantes !== null && (
            <div
              style={{
                ...styles.diasRestantes,
                ...(diasRestantes <= 30 && styles.diasRestantesAviso),
                ...(diasRestantes <= 7 && styles.diasRestantesUrgente),
              }}
            >
              {diasRestantes > 0
                ? `${diasRestantes} dias restantes`
                : diasRestantes === 0
                  ? "Vence hoje!"
                  : `Vencida há ${Math.abs(diasRestantes)} dias`}
            </div>
          )}
        </div>

        {/* Data OB */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Data OB</label>
          <input
            type="date"
            name="dataOb"
            value={formData.dataOb || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.dataOb && styles.inputError),
            }}
            disabled={disabled}
          />
          {fieldErrors.dataOb && (
            <small style={styles.errorText}>
              {getDataErrorMessage("dataOb")}
            </small>
          )}
          <small style={styles.helpText}>💡 Data da Ordem Bancária</small>
        </div>

        {/* Início da Execução */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Início da Execução</label>
          <input
            type="date"
            name="inicioExecucao"
            value={formData.inicioExecucao || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.inicioExecucao && styles.inputError),
            }}
            disabled={disabled}
          />
          {fieldErrors.inicioExecucao && (
            <small style={styles.errorText}>
              {getDataErrorMessage("inicioExecucao")}
            </small>
          )}
          <small style={styles.helpText}>
            💡 Data prevista para início da execução
          </small>
        </div>

        {/* Final da Execução */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Final da Execução</label>
          <input
            type="date"
            name="finalExecucao"
            value={formData.finalExecucao || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.finalExecucao && styles.inputError),
            }}
            disabled={disabled}
          />
          {fieldErrors.finalExecucao && (
            <small style={styles.errorText}>
              {getDataErrorMessage("finalExecucao")}
            </small>
          )}
          <small style={styles.helpText}>
            💡 Data prevista para conclusão da execução
          </small>
        </div>
      </div>

      {/* Timeline visual do cronograma */}
      {(formData.inicioExecucao ||
        formData.finalExecucao ||
        formData.dataOb) && (
        <div style={styles.timelineContainer}>
          <div style={styles.timelineTitle}>
            <span style={styles.timelineIcon}>📊</span>
            Cronograma da Emenda
          </div>
          <div style={styles.timeline}>
            {formData.dataOb && (
              <div style={styles.timelineItem}>
                <div style={styles.timelineMarker}></div>
                <div style={styles.timelineContent}>
                  <strong>Data OB:</strong> {formatDateBR(formData.dataOb)}
                </div>
              </div>
            )}
            {formData.inicioExecucao && (
              <div style={styles.timelineItem}>
                <div
                  style={{
                    ...styles.timelineMarker,
                    backgroundColor: "#28a745",
                  }}
                ></div>
                <div style={styles.timelineContent}>
                  <strong>Início:</strong>{" "}
                  {formatDateBR(formData.inicioExecucao)}
                </div>
              </div>
            )}
            {formData.finalExecucao && (
              <div style={styles.timelineItem}>
                <div
                  style={{
                    ...styles.timelineMarker,
                    backgroundColor: "#dc3545",
                  }}
                ></div>
                <div style={styles.timelineContent}>
                  <strong>Conclusão:</strong>{" "}
                  {formatDateBR(formData.finalExecucao)}
                </div>
              </div>
            )}
            {formData.dataValidada && (
              <div style={styles.timelineItem}>
                <div
                  style={{
                    ...styles.timelineMarker,
                    backgroundColor: "#ffc107",
                  }}
                ></div>
                <div style={styles.timelineContent}>
                  <strong>Validade:</strong>{" "}
                  {formatDateBR(formData.dataValidada)}
                  {diasRestantes !== null && (
                    <span style={styles.timelineDays}>
                      ({diasRestantes > 0 ? `${diasRestantes} dias` : "Vencida"}
                      )
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informações sobre o cronograma */}
      <div style={styles.infoBox}>
        <div style={styles.infoTitle}>
          <span style={styles.infoIcon}>📋</span>
          Informações sobre Cronograma
        </div>
        <div style={styles.infoContent}>
          <div style={styles.infoItem}>
            <strong>Data de Validade:</strong> Data limite para utilização dos
            recursos (obrigatório)
          </div>
          <div style={styles.infoItem}>
            <strong>Data OB:</strong> Data da Ordem Bancária de liberação dos
            recursos
          </div>
          <div style={styles.infoItem}>
            <strong>Período de Execução:</strong> Cronograma previsto para
            implementação da emenda
          </div>
          <div style={styles.infoItem}>
            <strong>Regra:</strong> Todas as datas devem ser anteriores ou
            iguais à data de validade
          </div>
        </div>
      </div>
    </fieldset>
  );
};

// ✅ FUNÇÃO AUXILIAR PARA FORMATAR DATA
const formatDateBR = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("pt-BR");
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
  helpText: {
    color: "#6c757d",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },
  diasRestantes: {
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "4px",
    backgroundColor: "#d4edda",
    color: "#155724",
    marginTop: "4px",
    textAlign: "center",
    fontWeight: "bold",
  },
  diasRestantesAviso: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  diasRestantesUrgente: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  timelineContainer: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "20px",
  },
  timelineTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
    color: "#495057",
    marginBottom: "15px",
    fontSize: "14px",
  },
  timelineIcon: {
    fontSize: "16px",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  timelineItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  timelineMarker: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#154360",
    flexShrink: 0,
  },
  timelineContent: {
    fontSize: "14px",
    color: "#495057",
  },
  timelineDays: {
    marginLeft: "8px",
    fontSize: "12px",
    color: "#6c757d",
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "20px",
  },
  infoTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
    color: "#495057",
    marginBottom: "12px",
    fontSize: "14px",
  },
  infoIcon: {
    fontSize: "16px",
  },
  infoContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoItem: {
    fontSize: "13px",
    color: "#6c757d",
    lineHeight: "1.4",
  },
};

export default Cronograma;
