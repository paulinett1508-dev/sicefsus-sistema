import React, { useState } from "react";

const InformacoesFinais = ({ formData = {}, onChange, fieldErrors = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (e) => {
    onChange(e);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <fieldset style={styles.fieldset}>
      {/* Header colapsável */}
      <div style={styles.headerContainer} onClick={toggleExpanded}>
        <legend style={styles.legend}>
          <span style={styles.legendIcon}>📋</span>
          Informações Adicionais do Beneficiário (Opcional)
        </legend>
        <div style={styles.toggleButton}>
          <span style={styles.toggleIcon}>{isExpanded ? "−" : "+"}</span>
          <span style={styles.toggleText}>
            {isExpanded ? "Ocultar" : "Exibir"}
          </span>
        </div>
      </div>

      {/* Conteúdo colapsável */}
      {isExpanded && (
        <div style={styles.content}>
          {/* PRIMEIRA LINHA - Informações do Beneficiário */}
          <div style={styles.formGrid}>
            {/* Nome/Razão Social */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Nome/Razão Social do Beneficiário
              </label>
              <input
                type="text"
                name="nomeRazaoSocial"
                value={formData.nomeRazaoSocial || ""}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            {/* Endereço */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Endereço do Beneficiário</label>
              <input
                type="text"
                name="enderecoBeneficiario"
                value={formData.enderecoBeneficiario || ""}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            {/* Telefone */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Telefone de Contato</label>
              <input
                type="tel"
                name="telefoneContato"
                value={formData.telefoneContato || ""}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>E-mail do Beneficiário</label>
              <input
                type="email"
                name="emailBeneficiario"
                value={formData.emailBeneficiario || ""}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            {/* Responsável Legal */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Responsável Legal</label>
              <input
                type="text"
                name="responsavelLegal"
                value={formData.responsavelLegal || ""}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Campos de texto maiores */}
          <div style={styles.textAreaGroup}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Observações sobre o Beneficiário
              </label>
              <textarea
                name="observacoesBeneficiario"
                value={formData.observacoesBeneficiario || ""}
                onChange={handleInputChange}
                rows="3"
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Informações Adicionais</label>
              <textarea
                name="informacoesAdicionais"
                value={formData.informacoesAdicionais || ""}
                onChange={handleInputChange}
                rows="3"
                style={styles.textarea}
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
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "0",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  headerContainer: {
    padding: "20px",
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
    border: "2px solid #154360",
    color: "#154360",
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
    color: "#154360",
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
  textAreaGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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

export default InformacoesFinais;
