import React from "react";

const ClassificacaoTecnica = ({
  formData = {},
  onChange,
  fieldErrors = {},
}) => {
  const tiposEmenda = [
    "Individual",
    "Bancada Estadual",
    "Bancada Regional",
    "Comissão",
    "Relator-Geral",
  ];

  const handleInputChange = (e) => {
    onChange(e);
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

        {/* Funcional */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Funcional <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="funcional"
            value={formData.funcional || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.funcional && styles.inputError),
            }}
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
          <label style={styles.label}>Subação</label>
          <input
            type="text"
            name="subacao"
            value={formData.subacao || ""}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Ex: 0001"
          />
        </div>

        {/* Fonte de Recurso */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Fonte de Recurso</label>
          <input
            type="text"
            name="fonteRecurso"
            value={formData.fonteRecurso || ""}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Ex: 100, 134, 142"
          />
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
            placeholder="Ex: 4.4.90.52"
          />
        </div>

        {/* Modalidade de Aplicação */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Modalidade de Aplicação</label>
          <select
            name="modalidadeAplicacao"
            value={formData.modalidadeAplicacao || ""}
            onChange={handleInputChange}
            style={styles.input}
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
    </fieldset>
  );
};

const styles = {
  fieldset: {
    border: "2px solid var(--action)",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
    fontWeight: "bold",
  },
  helpText: {
    color: "#6c757d",
    fontSize: "11px",
    fontStyle: "italic",
    marginTop: "2px",
  },
};

export default ClassificacaoTecnica;
