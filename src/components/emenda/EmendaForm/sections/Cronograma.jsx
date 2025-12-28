// src/components/emenda/EmendaForm/sections/Cronograma.jsx - SIMPLIFICADO
import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

const Cronograma = ({
  formData = {},
  onChange,
  fieldErrors = {},
  onClearError,
  disabled = false,
}) => {
  const { isDark } = useTheme();

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    sectionContainer: {
      border: isDark ? "1px solid var(--theme-border)" : "1px solid #e0e0e0",
      backgroundColor: isDark ? "var(--theme-surface)" : "#fdfdfd",
    },
    sectionHeader: {
      borderBottom: isDark ? "2px solid var(--theme-primary)" : "2px solid #007bff",
    },
    sectionTitle: {
      color: isDark ? "var(--theme-text)" : "#333",
    },
    label: {
      color: isDark ? "var(--theme-text)" : "#333",
    },
    input: {
      border: isDark ? "1px solid var(--theme-border)" : "1px solid #ced4da",
      backgroundColor: isDark ? "var(--theme-input-bg)" : "white",
      color: isDark ? "var(--theme-text)" : "inherit",
    },
    helperText: {
      color: isDark ? "var(--theme-text-muted)" : "#6c757d",
    },
    validationSummary: {
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f8f9fa",
      border: isDark ? "1px solid var(--theme-border)" : "1px solid #dee2e6",
    },
    validationHeader: {
      color: isDark ? "var(--theme-text-secondary)" : "#495057",
    },
  };

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
    <div style={{ ...styles.sectionContainer, ...dynamicStyles.sectionContainer }}>
      <div style={{ ...styles.sectionHeader, ...dynamicStyles.sectionHeader }}>
        <h3 style={{ ...styles.sectionTitle, ...dynamicStyles.sectionTitle }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_month</span>
          Cronograma
        </h3>
      </div>

      {/* GRID DE DATAS */}
      <div style={styles.dateGrid}>
        {/* DATA DE APROVAÇÃO - OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>account_balance</span>
            Data de Aprovação *
          </label>
          <input
            type="date"
            name="dataAprovacao"
            value={formData.dataAprovacao || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...dynamicStyles.input,
              ...(fieldErrors.dataAprovacao ? styles.inputError : {}),
            }}
          />
          {fieldErrors.dataAprovacao && (
            <div style={styles.errorText}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#dc3545" }}>error</span>
              {fieldErrors.dataAprovacao}
            </div>
          )}
          <div style={{ ...styles.helperText, ...dynamicStyles.helperText }}>
            Aprovação pelo Congresso Nacional
          </div>
        </div>

        {/* DATA OB - AGORA OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>receipt_long</span>
            Data OB *
          </label>
          <input
            type="date"
            name="dataOb"
            value={formData.dataOb || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...dynamicStyles.input,
              ...(fieldErrors.dataOb ? styles.inputError : {}),
            }}
          />
          {fieldErrors.dataOb && (
            <div style={styles.errorText}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#dc3545" }}>error</span>
              {fieldErrors.dataOb}
            </div>
          )}
          <div style={{ ...styles.helperText, ...dynamicStyles.helperText }}>
            Ordem Bancária (após aprovação)
          </div>
        </div>

        {/* INÍCIO DA EXECUÇÃO - AGORA OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>play_arrow</span>
            Início da Execução *
          </label>
          <input
            type="date"
            name="inicioExecucao"
            value={formData.inicioExecucao || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...dynamicStyles.input,
              ...(fieldErrors.inicioExecucao ? styles.inputError : {}),
            }}
          />
          {fieldErrors.inicioExecucao && (
            <div style={styles.errorText}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#dc3545" }}>error</span>
              {fieldErrors.inicioExecucao}
            </div>
          )}
          <div style={{ ...styles.helperText, ...dynamicStyles.helperText }}>Início das ações executivas</div>
        </div>

        {/* FINAL DA EXECUÇÃO - AGORA OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>flag</span>
            Final da Execução *
          </label>
          <input
            type="date"
            name="finalExecucao"
            value={formData.finalExecucao || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...dynamicStyles.input,
              ...(fieldErrors.finalExecucao ? styles.inputError : {}),
            }}
          />
          {fieldErrors.finalExecucao && (
            <div style={styles.errorText}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#dc3545" }}>error</span>
              {fieldErrors.finalExecucao}
            </div>
          )}
          <div style={{ ...styles.helperText, ...dynamicStyles.helperText }}>Conclusão das ações</div>
        </div>

        {/* DATA DE VALIDADE - OBRIGATÓRIA */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
            Data de Validade *
          </label>
          <input
            type="date"
            name="dataValidade"
            value={formData.dataValidade || ""}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              ...dynamicStyles.input,
              ...(fieldErrors.dataValidade ? styles.inputError : {}),
            }}
          />
          {fieldErrors.dataValidade && (
            <div style={styles.errorText}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#dc3545" }}>error</span>
              {fieldErrors.dataValidade}
            </div>
          )}
          <div style={{ ...styles.helperText, ...dynamicStyles.helperText }}>Prazo legal final</div>
        </div>

        {/* DATA DA ÚLTIMA ATUALIZAÇÃO - AUTOMÁTICA */}
        <div style={styles.formGroup}>
          <label style={{ ...styles.label, ...dynamicStyles.label }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>update</span>
            Data de Última Atualização
          </label>
          <input
            type="date"
            name="dataUltimaAtualizacao"
            value={new Date().toISOString().split("T")[0]}
            readOnly
            disabled
            style={{
              ...styles.input,
              backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f8f9fa",
              color: isDark ? "var(--theme-text-muted)" : "#6c757d",
              cursor: "not-allowed",
            }}
          />
          <div style={{ ...styles.helperText, ...dynamicStyles.helperText }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: "middle" }}>check_circle</span>
            Atualizada automaticamente pelo sistema
          </div>
        </div>
      </div>

      {/* ERRO GERAL DE CRONOGRAMA */}
      {fieldErrors.cronogramaGeral && (
        <div style={styles.globalError}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#dc3545" }}>error</span>
          <div>
            <strong>Erro na Sequência Cronológica:</strong>
            <br />
            {fieldErrors.cronogramaGeral}
          </div>
        </div>
      )}

      {/* VALIDAÇÃO VISUAL DAS DATAS */}
      <div style={{ ...styles.validationSummary, ...dynamicStyles.validationSummary }}>
        <div style={{ ...styles.validationHeader, ...dynamicStyles.validationHeader, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>checklist</span>
          Status das Datas Obrigatórias:
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
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>
              {formData.dataAprovacao ? "check_circle" : "cancel"}
            </span> Aprovação
          </div>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.dataOb
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>
              {formData.dataOb ? "check_circle" : "cancel"}
            </span> OB
          </div>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.inicioExecucao
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>
              {formData.inicioExecucao ? "check_circle" : "cancel"}
            </span> Início
          </div>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.finalExecucao
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>
              {formData.finalExecucao ? "check_circle" : "cancel"}
            </span> Final
          </div>
          <div
            style={{
              ...styles.validationItem,
              ...(formData.dataValidade
                ? styles.validationValid
                : styles.validationInvalid),
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>
              {formData.dataValidade ? "check_circle" : "cancel"}
            </span> Validade
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