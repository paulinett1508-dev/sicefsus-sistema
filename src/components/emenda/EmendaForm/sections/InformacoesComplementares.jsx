import React, { useState } from "react";

const InformacoesComplementares = ({
  formData = {},
  onChange,
  fieldErrors = {},
}) => {
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
          Informações Complementares (Opcional)
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
          <div style={styles.formGrid}>
            {/* Área de Atuação */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Área de Atuação</label>
              <select
                name="areaAtuacao"
                value={formData.areaAtuacao || ""}
                onChange={handleInputChange}
                style={styles.input}
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
              <label style={styles.label}>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone || ""}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>E-mail</label>
              <input
                type="email"
                name="emailContato"
                value={formData.emailContato || ""}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            {/* Modalidade */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Modalidade de Aplicação</label>
              <select
                name="modalidadeAplicacao"
                value={formData.modalidadeAplicacao || ""}
                onChange={handleInputChange}
                style={styles.input}
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
              <label style={styles.label}>Público-Alvo</label>
              <input
                type="text"
                name="publicoAlvo"
                value={formData.publicoAlvo || ""}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            {/* Beneficiários */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Número de Beneficiários</label>
              <input
                type="number"
                name="numeroBeneficiarios"
                value={formData.numeroBeneficiarios || ""}
                onChange={handleInputChange}
                min="1"
                style={styles.input}
              />
            </div>
          </div>

          {/* Campos de texto maiores */}
          <div style={styles.textAreaGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Justificativa</label>
              <textarea
                name="justificativa"
                value={formData.justificativa || ""}
                onChange={handleInputChange}
                rows="3"
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Observações</label>
              <textarea
                name="observacoesFinais"
                value={formData.observacoesFinais || ""}
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
