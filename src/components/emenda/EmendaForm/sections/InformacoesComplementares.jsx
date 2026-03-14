import React, { useState } from "react";
import { useTheme } from "../../../../context/ThemeContext";

const InformacoesComplementares = ({
  formData = {},
  onChange,
  fieldErrors = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    fieldset: {
      border: isDark ? "2px solid var(--theme-border)" : "2px solid var(--action)",
      background: isDark ? "var(--theme-surface)" : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.1)",
    },
    headerContainer: {
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f8f9fa",
      borderBottom: isDark ? "1px solid var(--theme-border)" : "1px solid #dee2e6",
    },
    legend: {
      background: isDark ? "var(--theme-surface)" : "white",
      border: isDark ? "2px solid var(--theme-border)" : "2px solid var(--action)",
      color: isDark ? "var(--theme-text)" : "var(--action)",
    },
    toggleButton: {
      color: isDark ? "var(--theme-text-secondary)" : "#495057",
    },
    toggleIcon: {
      color: isDark ? "var(--theme-primary)" : "var(--action)",
    },
    label: {
      color: isDark ? "var(--theme-text)" : "#333",
    },
    input: {
      border: isDark ? "2px solid var(--theme-border)" : "2px solid #dee2e6",
      backgroundColor: isDark ? "var(--theme-input-bg)" : "white",
      color: isDark ? "var(--theme-text)" : "inherit",
    },
  };

  const handleInputChange = (e) => {
    onChange(e);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <fieldset style={{ ...styles.fieldset, ...dynamicStyles.fieldset }}>
      {/* Header colapsável */}
      <div style={{ ...styles.headerContainer, ...dynamicStyles.headerContainer }} onClick={toggleExpanded}>
        <legend style={{ ...styles.legend, ...dynamicStyles.legend }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment</span>
          Informações Complementares (Opcional)
        </legend>
        <div style={{ ...styles.toggleButton, ...dynamicStyles.toggleButton }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, ...dynamicStyles.toggleIcon }}>
            {isExpanded ? "remove" : "add"}
          </span>
          <span style={styles.toggleText}>
            {isExpanded ? "Ocultar" : "Exibir"}
          </span>
        </div>
      </div>

      {/* Conteúdo colapsável */}
      {isExpanded && (
        <div style={styles.content}>
          <div style={styles.formGrid}>
            {/* Área de Atuação */}
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...dynamicStyles.label }}>Área de Atuação</label>
              <select
                name="areaAtuacao"
                value={formData.areaAtuacao || ""}
                onChange={handleInputChange}
                style={{ ...styles.input, ...dynamicStyles.input }}
              >
                <option value="">Selecione a área</option>
                <option value="saude">Saúde</option>
                <option value="educacao">Educação</option>
                <option value="assistencia-social">Assistência Social</option>
                <option value="esporte-lazer">Esporte e Lazer</option>
                <option value="cultura">Cultura</option>
                <option value="meio-ambiente">Meio Ambiente</option>
                <option value="infraestrutura">Infraestrutura</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Telefone */}
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...dynamicStyles.label }}>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone || ""}
                onChange={handleInputChange}
                style={{ ...styles.input, ...dynamicStyles.input }}
              />
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...dynamicStyles.label }}>E-mail</label>
              <input
                type="email"
                name="emailContato"
                value={formData.emailContato || ""}
                onChange={handleInputChange}
                style={{ ...styles.input, ...dynamicStyles.input }}
              />
            </div>

            {/* Modalidade */}
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...dynamicStyles.label }}>Modalidade de Aplicação</label>
              <select
                name="modalidadeAplicacao"
                value={formData.modalidadeAplicacao || ""}
                onChange={handleInputChange}
                style={{ ...styles.input, ...dynamicStyles.input }}
              >
                <option value="">Selecione</option>
                <option value="transferencia-direta">
                  Transferência Direta
                </option>
                <option value="convenio">Convênio</option>
                <option value="termo-parceria">Termo de Parceria</option>
                <option value="contrato-repasse">Contrato de Repasse</option>
              </select>
            </div>

            {/* Público-Alvo */}
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...dynamicStyles.label }}>Público-Alvo</label>
              <input
                type="text"
                name="publicoAlvo"
                value={formData.publicoAlvo || ""}
                onChange={handleInputChange}
                style={{ ...styles.input, ...dynamicStyles.input }}
              />
            </div>

            {/* Beneficiários */}
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...dynamicStyles.label }}>Número de Beneficiários</label>
              <input
                type="number"
                name="numeroBeneficiarios"
                value={formData.numeroBeneficiarios || ""}
                onChange={handleInputChange}
                min="1"
                style={{ ...styles.input, ...dynamicStyles.input }}
              />
            </div>
          </div>

          {/* Campos de texto maiores */}
          <div style={styles.textAreaGrid}>
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...dynamicStyles.label }}>Justificativa</label>
              <textarea
                name="justificativa"
                value={formData.justificativa || ""}
                onChange={handleInputChange}
                rows="3"
                style={{ ...styles.textarea, ...dynamicStyles.input }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, ...dynamicStyles.label }}>Observações</label>
              <textarea
                name="observacoesFinais"
                value={formData.observacoesFinais || ""}
                onChange={handleInputChange}
                rows="3"
                style={{ ...styles.textarea, ...dynamicStyles.input }}
              />
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
};

const styles = {
  fieldset: {
    border: "2px solid var(--action)",
    borderRadius: "10px",
    padding: "0",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
    marginBottom: "20px",
    marginTop: "20px",
  },
  headerContainer: {
    padding: "15px 20px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #dee2e6",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background-color 0.2s ease",
  },
  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid var(--action)",
    color: "var(--action)",
    fontWeight: "bold",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
  },
  legendIcon: {
    fontSize: "18px",
  },
  toggleButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#495057",
    fontWeight: "500",
  },
  toggleIcon: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "var(--action)",
  },
  toggleText: {
    fontSize: "14px",
  },
  content: {
    padding: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  textAreaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    resize: "vertical",
    fontFamily: "inherit",
  },
};

export default InformacoesComplementares;
