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
              <label style={styles.label}>Área de Atuação Principal</label>
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
                <option value="desenvolvimento-social">
                  Desenvolvimento Social
                </option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Telefone */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Telefone de Contato</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone || ""}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                style={styles.input}
              />
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>E-mail de Contato</label>
              <input
                type="email"
                name="emailContato"
                value={formData.emailContato || ""}
                onChange={handleInputChange}
                placeholder="contato@entidade.org.br"
                style={styles.input}
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
              <label style={styles.label}>Público-Alvo Beneficiado</label>
              <input
                type="text"
                name="publicoAlvo"
                value={formData.publicoAlvo || ""}
                onChange={handleInputChange}
                placeholder="Ex: Crianças de 0 a 6 anos, Idosos..."
                style={styles.input}
              />
            </div>

            {/* Número de Beneficiários */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Número de Beneficiários Estimado
              </label>
              <input
                type="number"
                name="numeroBeneficiarios"
                value={formData.numeroBeneficiarios || ""}
                onChange={handleInputChange}
                placeholder="0"
                min="1"
                style={styles.input}
              />
            </div>
          </div>

          {/* Campos de texto maiores */}
          <div style={styles.textAreaGroup}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Justificativa da Emenda</label>
              <textarea
                name="justificativa"
                value={formData.justificativa || ""}
                onChange={handleInputChange}
                placeholder="Justifique a necessidade e importância desta emenda..."
                rows="3"
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Observações Adicionais</label>
              <textarea
                name="observacoesFinais"
                value={formData.observacoesFinais || ""}
                onChange={handleInputChange}
                placeholder="Informações complementares que julgar necessárias..."
                rows="3"
                style={styles.textarea}
              />
            </div>
          </div>

          {/* Banner informativo */}
          <div style={styles.infoBanner}>
            <div style={styles.infoIcon}>ℹ️</div>
            <div style={styles.infoText}>
              Estas informações são opcionais e complementam os dados da emenda.
              Podem ser úteis para acompanhamento e relatórios posteriores.
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
};

export default InformacoesFinais;
