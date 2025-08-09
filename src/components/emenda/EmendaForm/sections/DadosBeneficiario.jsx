import React, { useState } from "react";
import CNPJInput from "../../../CNPJInput";

const DadosBeneficiario = ({ formData, onChange, setFormData, styles, buscarDadosFornecedor, errors = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={styles.section}>
      {/* ✅ HEADER COLAPSÁVEL */}
      <div style={styles.headerContainer} onClick={toggleExpanded}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🏢</span>
          Informações Adicionais do Beneficiário (opcional)
        </h3>
        <div style={styles.toggleButton}>
          <span style={styles.toggleIcon}>
            {isExpanded ? '−' : '+'}
          </span>
          <span style={styles.toggleText}>
            {isExpanded ? 'Ocultar' : 'Exibir'}
          </span>
        </div>
      </div>

      {/* ✅ CONTEÚDO COLAPSÁVEL */}
      {isExpanded && (
        <div style={styles.content}>
          {/* Primeira linha - Nome e Endereço */}
          <fieldset style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                Nome/Razão Social do Beneficiário
              </label>
              <input
                type="text"
                name="beneficiario"
                value={formData?.beneficiario || ""}
                onChange={onChange}
                placeholder="Nome completo da instituição beneficiária"
                style={styles.input}
              />
              {errors?.beneficiario && (
                <span style={styles.errorText}>{errors.beneficiario}</span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Endereço do Beneficiário
              </label>
              <input
                type="text"
                name="enderecoBeneficiario"
                value={formData?.enderecoBeneficiario || ""}
                onChange={onChange}
                placeholder="Rua, número, bairro"
                style={styles.input}
              />
            </div>
          </fieldset>

          {/* Segunda linha - Telefone, Email, Responsável */}
          <fieldset style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                Telefone de Contato
              </label>
              <input
                type="text"
                name="telefoneBeneficiario"
                value={formData?.telefoneBeneficiario || ""}
                onChange={onChange}
                placeholder="(00) 00000-0000"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Email do Beneficiário
              </label>
              <input
                type="email"
                name="emailBeneficiario"
                value={formData?.emailBeneficiario || ""}
                onChange={onChange}
                placeholder="email@instituicao.com.br"
                style={styles.input}
              />
            </div>
          </fieldset>

          {/* Terceira linha - Responsável Legal e CPF */}
          <fieldset style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                Responsável Legal
              </label>
              <input
                type="text"
                name="responsavelLegal"
                value={formData?.responsavelLegal || ""}
                onChange={onChange}
                placeholder="Nome do responsável pela instituição"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                CPF do Responsável
              </label>
              <input
                type="text"
                name="cpfResponsavel"
                value={formData?.cpfResponsavel || ""}
                onChange={onChange}
                placeholder="000.000.000-00"
                style={styles.input}
              />
            </div>
          </fieldset>

          {/* CNPJ do Beneficiário */}
          <fieldset style={styles.row}>
            <div style={styles.field}>
              <CNPJInput
                label="CNPJ do Beneficiário"
                value={formData.cnpjBeneficiario || ''}
                onChange={(e) => onChange({
                  target: {
                    name: 'cnpjBeneficiario',
                    value: e.target.value
                  }
                })}
                required={true}
                placeholder="00.000.000/0000-00"
                style={styles.formGroup}
              />
            </div>
          </fieldset>

          {/* ✅ BANNER INFORMATIVO */}
          <div style={styles.infoBanner}>
            <div style={styles.infoIcon}>ℹ️</div>
            <div style={styles.infoText}>
              Estas informações complementam os dados do beneficiário e facilitam o contato e acompanhamento da execução da emenda. O CNPJ do beneficiário deve ser preenchido na seção de Dados Básicos.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  section: {
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

  sectionTitle: {
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

  sectionIcon: {
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

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
    border: "none",
    padding: "0",
  },

  field: {
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
    boxSizing: "border-box",
  },

  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
  },

  infoBanner: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#e3f2fd",
    border: "1px solid #bbdefb",
    borderRadius: "6px",
    marginTop: "20px",
  },

  infoIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },

  infoText: {
    fontSize: "14px",
    color: "#1565c0",
    lineHeight: "1.4",
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};

export default DadosBeneficiario;