// src/components/emenda/EmendaForm/sections/Cronograma.jsx - SIMPLIFICADO
import React from "react";

const Cronograma = ({
  formData = {},
  onChange,
  fieldErrors = {},
  onClearError,
  disabled = false,
}) => {
  // ✅ DEBUG: Verificar props recebidas
  React.useEffect(() => {
    console.log('📋 Cronograma - Props recebidas:', {
      hasOnChange: typeof onChange === 'function',
      hasFormData: !!formData
    });
  }, [onChange, formData]);

  // Handler para limpar erro ao digitar
  const handleChange = (e) => {
    const { name } = e.target;
    onChange(e);
    if (onClearError && fieldErrors[name]) {
      onClearError(name);
    }
  };

  return (
    <div style={styles.sectionContainer}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>📅 Cronograma</h3>
      </div>

      {/* GRID DE DATAS */}
      <div style={styles.dateGrid}>
        {/* DATA DE APROVAÇÃO - OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={styles.label}>🏛️ Data de Aprovação *</label>
          <input
            type="date"
            name="dataAprovacao"
            value={formData.dataAprovacao || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(fieldErrors.dataAprovacao ? styles.inputError : {}),
              borderColor: fieldErrors.dataAprovacao ? "#dc3545" : "#ced4da",
            }}
          />
          {fieldErrors.dataAprovacao && (
            <div style={styles.errorText}>
              <span style={styles.errorIcon}>🚨</span>
              {fieldErrors.dataAprovacao}
            </div>
          )}
          <div style={styles.helperText}>
            📋 Aprovação pelo Congresso Nacional
          </div>
        </div>

        {/* DATA OB - AGORA OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={styles.label}>📄 Data OB *</label>
          <input
            type="date"
            name="dataOb"
            value={formData.dataOb || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(fieldErrors.dataOb ? styles.inputError : {}),
              borderColor: fieldErrors.dataOb ? "#dc3545" : "#ced4da",
            }}
          />
          {fieldErrors.dataOb && (
            <div style={styles.errorText}>
              <span style={styles.errorIcon}>🚨</span>
              {fieldErrors.dataOb}
            </div>
          )}
          <div style={styles.helperText}>
            📄 Ordem Bancária (após aprovação)
          </div>
        </div>

        {/* INÍCIO DA EXECUÇÃO - AGORA OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={styles.label}>🚀 Início da Execução *</label>
          <input
            type="date"
            name="inicioExecucao"
            value={formData.inicioExecucao || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(fieldErrors.inicioExecucao ? styles.inputError : {}),
              borderColor: fieldErrors.inicioExecucao ? "#dc3545" : "#ced4da",
            }}
          />
          {fieldErrors.inicioExecucao && (
            <div style={styles.errorText}>
              <span style={styles.errorIcon}>🚨</span>
              {fieldErrors.inicioExecucao}
            </div>
          )}
          <div style={styles.helperText}>🚀 Início das ações executivas</div>
        </div>

        {/* FINAL DA EXECUÇÃO - AGORA OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={styles.label}>🏁 Final da Execução *</label>
          <input
            type="date"
            name="finalExecucao"
            value={formData.finalExecucao || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(fieldErrors.finalExecucao ? styles.inputError : {}),
              borderColor: fieldErrors.finalExecucao ? "#dc3545" : "#ced4da",
            }}
          />
          {fieldErrors.finalExecucao && (
            <div style={styles.errorText}>
              <span style={styles.errorIcon}>🚨</span>
              {fieldErrors.finalExecucao}
            </div>
          )}
          <div style={styles.helperText}>🏁 Conclusão das ações</div>
        </div>

        {/* DATA DE VALIDADE - OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={styles.label}>⏰ Data de Validade *</label>
          <input
            type="date"
            name="dataValidade"
            value={formData.dataValidade || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...(fieldErrors.dataValidade ? styles.inputError : {}),
              borderColor: fieldErrors.dataValidade ? "#dc3545" : "#ced4da",
            }}
          />
          {fieldErrors.dataValidade && (
            <div style={styles.errorText}>
              <span style={styles.errorIcon}>🚨</span>
              {fieldErrors.dataValidade}
            </div>
          )}
          <div style={styles.helperText}>⏰ Prazo legal final</div>
        </div>

        {/* DATA DA ÚLTIMA ATUALIZAÇÃO - AUTOMÁTICA */}
        <div style={styles.formGroup}>
          <label style={styles.label}>📄 Data de Última Atualização</label>
          <input
            type="date"
            name="dataUltimaAtualizacao"
            value={new Date().toISOString().split("T")[0]}
            readOnly
            disabled
            style={{
              ...styles.input,
              backgroundColor: "#f8f9fa",
              color: "#6c757d",
              cursor: "not-allowed",
            }}
          />
          <div style={styles.helperText}>
            ✅ Atualizada automaticamente pelo sistema
          </div>
        </div>
      </div>

      {/* ERRO GERAL DE CRONOGRAMA */}
      {fieldErrors.cronogramaGeral && (
        <div style={styles.globalError}>
          <div style={styles.errorIcon}>🚨</div>
          <div>
            <strong>Erro na Sequência Cronológica:</strong>
            <br />
            {fieldErrors.cronogramaGeral}
          </div>
        </div>
      )}

      {/* VALIDAÇÃO VISUAL DAS DATAS */}
      <div style={styles.validationSummary}>
        <div style={styles.validationHeader}>
          📊 Status das Datas Obrigatórias:
        </div>
        <div style={styles.validationGrid}>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.dataAprovacao
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            {formData.dataAprovacao ? "✅" : "❌"} Aprovação
          </div>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.dataOb
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            {formData.dataOb ? "✅" : "❌"} OB
          </div>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.inicioExecucao
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            {formData.inicioExecucao ? "✅" : "❌"} Início
          </div>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.finalExecucao
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            {formData.finalExecucao ? "✅" : "❌"} Final
          </div>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.dataValidade
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            {formData.dataValidade ? "✅" : "❌"} Validade
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🎨 ESTILOS SIMPLIFICADOS
// ============================================

const styles = {
  sectionContainer: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "24px",
    backgroundColor: "#fdfdfd",
    marginBottom: "24px",
  },

  sectionHeader: {
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #007bff",
  },

  sectionTitle: {
    margin: "0 0 8px 0",
    color: "#333",
    fontSize: "20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  dateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  requiredLabel: {
    color: "#dc3545",
    fontSize: "10px",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginLeft: "4px",
    backgroundColor: "#fff5f5",
    padding: "2px 6px",
    borderRadius: "8px",
    border: "1px solid #f8d7da",
  },

  autoLabel: {
    color: "#28a745",
    fontSize: "10px",
    fontWeight: "500",
    textTransform: "uppercase",
    marginLeft: "4px",
    backgroundColor: "#d4edda",
    padding: "2px 6px",
    borderRadius: "8px",
    border: "1px solid #c3e6cb",
  },

  input: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    transition: "all 0.2s ease",
    fontFamily: "monospace",
  },

  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
    boxShadow: "0 0 8px rgba(220, 53, 69, 0.4)",
  },

  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  errorIcon: {
    fontSize: "14px",
  },

  helperText: {
    fontSize: "11px",
    color: "#6c757d",
    marginTop: "4px",
    fontStyle: "italic",
  },

  globalError: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "16px",
  },

  validationSummary: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    padding: "16px",
  },

  validationHeader: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
    marginBottom: "12px",
  },

  validationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "8px",
  },

  validationItem: {
    padding: "8px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "center",
  },

  validationValid: {
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },

  validationInvalid: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
};

export default Cronograma;