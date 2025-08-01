// src/components/emenda/EmendaForm/sections/InformacoesComplementares.jsx
// ✅ ANTIGA ClassificacaoTecnica - Agora com opção de exibir/ocultar

import React, { useState } from "react";

const InformacoesComplementares = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ✅ TIPOS DE EMENDA ORIGINAIS
  const tiposEmenda = [
    "Individual",
    "Bancada",
    "Comissão",
    "Relator",
    "Extra orçamentária",
  ];

  const handleInputChange = (e) => {
    onChange?.(e);
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={styles.toggleButton}
        >
          <span style={styles.legendIcon}>📋</span>
          Informações Complementares
          <span style={styles.toggleIcon}>{isExpanded ? "▼" : "▶"}</span>
        </button>
      </legend>

      {isExpanded && (
        <div style={styles.content}>
          <div style={styles.formGrid}>
            {/* Tipo de Emenda */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Tipo de Emenda <span style={styles.required}>*</span>
              </label>
              <select
                name="tipoEmenda"
                value={formData.tipoEmenda || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.tipoEmenda && styles.inputError),
                }}
                disabled={disabled}
                required
              >
                <option value="">Selecione o tipo</option>
                {tiposEmenda.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              {fieldErrors.tipoEmenda && (
                <small style={styles.errorText}>Campo obrigatório</small>
              )}
            </div>

            {/* Modalidade de Aplicação */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Modalidade de Aplicação <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="modalidadeAplicacao"
                value={formData.modalidadeAplicacao || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.modalidadeAplicacao && styles.inputError),
                }}
                disabled={disabled}
                placeholder="Ex: Transferência a Municípios"
                required
              />
              {fieldErrors.modalidadeAplicacao && (
                <small style={styles.errorText}>Campo obrigatório</small>
              )}
            </div>

            {/* Funcional Programática */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Funcional Programática <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="funcionalProgramatica"
                value={formData.funcionalProgramatica || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.funcionalProgramatica && styles.inputError),
                }}
                disabled={disabled}
                placeholder="Ex: 10.301.5019.219A.0001"
                required
              />
              {fieldErrors.funcionalProgramatica && (
                <small style={styles.errorText}>Campo obrigatório</small>
              )}
            </div>

            {/* Função */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Função <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="funcao"
                value={formData.funcao || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.funcao && styles.inputError),
                }}
                disabled={disabled}
                placeholder="Ex: 10 - Saúde"
                required
              />
              {fieldErrors.funcao && (
                <small style={styles.errorText}>Campo obrigatório</small>
              )}
            </div>

            {/* Subfunção */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Subfunção <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="subfuncao"
                value={formData.subfuncao || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.subfuncao && styles.inputError),
                }}
                disabled={disabled}
                placeholder="Ex: 301 - Atenção Básica"
                required
              />
              {fieldErrors.subfuncao && (
                <small style={styles.errorText}>Campo obrigatório</small>
              )}
            </div>

            {/* Natureza da Despesa */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Natureza da Despesa</label>
              <input
                type="text"
                name="naturezaDespesa"
                value={formData.naturezaDespesa || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={disabled}
                placeholder="Ex: 4.4.90.51"
              />
            </div>

            {/* Fonte de Recursos */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Fonte de Recursos</label>
              <input
                type="text"
                name="fonteRecursos"
                value={formData.fonteRecursos || ""}
                onChange={handleInputChange}
                style={styles.input}
                disabled={disabled}
                placeholder="Ex: 100 - Recursos Ordinários"
              />
            </div>

            {/* Observações Técnicas */}
            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.label}>Observações Técnicas</label>
              <textarea
                name="observacoesTecnicas"
                value={formData.observacoesTecnicas || ""}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  minHeight: "80px",
                  resize: "vertical",
                }}
                disabled={disabled}
                placeholder="Observações adicionais sobre aspectos técnicos da emenda"
              />
            </div>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div style={styles.collapsedMessage}>
          Clique para expandir e preencher informações complementares
        </div>
      )}
    </fieldset>
  );
};

// ✅ ESTILOS COM TOGGLE
const styles = {
  fieldset: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "0",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginTop: "20px",
  },
  legend: {
    background: "white",
    padding: "0",
    borderRadius: "20px",
    border: "2px solid #154360",
    margin: "0",
    width: "auto",
  },
  toggleButton: {
    background: "none",
    border: "none",
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#154360",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "20px",
    transition: "background-color 0.2s",
    width: "100%",
  },
  legendIcon: {
    fontSize: "18px",
  },
  toggleIcon: {
    marginLeft: "auto",
    fontSize: "14px",
    transition: "transform 0.2s",
  },
  content: {
    padding: "20px",
    animation: "fadeIn 0.3s ease-in",
  },
  collapsedMessage: {
    padding: "20px",
    textAlign: "center",
    color: "#6c757d",
    fontSize: "14px",
    fontStyle: "italic",
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
  },
};

// CSS para animação
if (!document.getElementById("info-complementares-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "info-complementares-animations";
  styleSheet.innerHTML = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    fieldset legend button:hover {
      background-color: rgba(21, 67, 96, 0.1) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default InformacoesComplementares;
