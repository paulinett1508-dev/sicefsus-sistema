// src/components/emenda/EmendaForm/sections/ClassificacaoTecnica.jsx
// ✅ FIX: Campo Funcional sempre zerado (sem preenchimento automático)

import React from "react";

const ClassificacaoTecnica = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // ✅ TIPOS DE EMENDA ORIGINAIS
  const tiposEmenda = [
    "Individual",
    "Bancada Estadual",
    "Bancada Regional",
    "Comissão",
    "Relator-Geral",
  ];

  // ✅ HANDLER ORIGINAL - sem preenchimento automático
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    onChange?.({ target: { name, value } });
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📋</span>
        Classificação Técnica
      </legend>

      <div style={styles.formGrid}>
        {/* Tipo da Emenda */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Tipo da Emenda <span style={styles.required}>*</span>
          </label>
          <select
            name="tipo"
            value={formData.tipo || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.tipo && styles.inputError),
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
          {fieldErrors.tipo && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* ✅ FIX: Campo Funcional SEMPRE VAZIO por padrão */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Funcional <span style={styles.required}>*</span>
            <span
              style={styles.infoIcon}
              title="Classificação funcional programática da despesa (ex: 10.301.0001.2001)"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="funcional"
            value={formData.funcional || ""} // ✅ SEMPRE VAZIO se não preenchido
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.funcional && styles.inputError),
            }}
            disabled={disabled}
            placeholder="Ex: 10.301.0001.2001"
            required
          />
          {fieldErrors.funcional && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
          <small style={styles.helpText}>
            Formato: Função.Subfunção.Programa.Ação
          </small>
        </div>

        {/* Subação */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Subação
            <span
              style={styles.infoIcon}
              title="Detalhamento da ação orçamentária (se aplicável)"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="subacao"
            value={formData.subacao || ""}
            onChange={handleInputChange}
            style={styles.input}
            disabled={disabled}
            placeholder="Ex: 0001"
          />
        </div>

        {/* Fonte de Recurso */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Fonte de Recurso
            <span
              style={styles.infoIcon}
              title="Código da fonte de financiamento do recurso"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="fonteRecurso"
            value={formData.fonteRecurso || ""}
            onChange={handleInputChange}
            style={styles.input}
            disabled={disabled}
            placeholder="Ex: 100, 134, 142"
          />
        </div>

        {/* Natureza da Despesa */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Natureza da Despesa
            <span
              style={styles.infoIcon}
              title="Classificação da natureza da despesa orçamentária"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="naturezaDespesa"
            value={formData.naturezaDespesa || ""}
            onChange={handleInputChange}
            style={styles.input}
            disabled={disabled}
            placeholder="Ex: 4.4.90.52"
          />
        </div>

        {/* Modalidade de Aplicação */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Modalidade de Aplicação
            <span
              style={styles.infoIcon}
              title="Forma de aplicação dos recursos (direta, transferência, etc.)"
            >
              ℹ️
            </span>
          </label>
          <select
            name="modalidadeAplicacao"
            value={formData.modalidadeAplicacao || ""}
            onChange={handleInputChange}
            style={styles.input}
            disabled={disabled}
          >
            <option value="">Selecione a modalidade</option>
            <option value="20">20 - Transferências à União</option>
            <option value="30">30 - Transferências a Estados e ao DF</option>
            <option value="40">40 - Transferências a Municípios</option>
            <option value="50">
              50 - Transferências a Instituições Privadas sem fins lucrativos
            </option>
            <option value="71">
              71 - Transferências a Consórcios Públicos
            </option>
            <option value="90">90 - Aplicações Diretas</option>
          </select>
        </div>
      </div>

      {/* ✅ NOTA INFORMATIVA sobre classificação */}
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>📋</span>
        <div style={styles.infoContent}>
          <strong>Classificação Orçamentária:</strong>
          <p>
            Os campos de classificação técnica seguem a estrutura orçamentária
            federal. O campo "Funcional" é obrigatório e deve seguir o formato:
            Função.Subfunção.Programa.Ação.
          </p>
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS ORIGINAIS
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
  helpText: {
    color: "#6c757d",
    fontSize: "11px",
    fontStyle: "italic",
    marginTop: "2px",
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    backgroundColor: "#e8f4f8",
    border: "1px solid #bee5eb",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "20px",
  },
  infoContent: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#0c5460",
  },
};

export default ClassificacaoTecnica;
