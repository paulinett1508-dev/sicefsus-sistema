// src/components/despesa/DespesaFormAdvancedFields.jsx
// ✅ Componente especializado para campos avançados da despesa

import React from "react";

const DespesaFormAdvancedFields = ({
  formData,
  errors,
  cnpjError,
  modoVisualizacao,
  handleInputChange,
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📝</span>
        Campos Avançados
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            <option value="pendente">Pendente</option>
            <option value="empenhado">Empenhado</option>
            <option value="liquidado">Liquidado</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Categoria</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            <option value="">Selecione a categoria</option>
            <option value="equipamentos">Equipamentos</option>
            <option value="reformas">Reformas</option>
            <option value="construcao">Construção</option>
            <option value="servicos">Serviços</option>
            <option value="medicamentos">Medicamentos</option>
            <option value="materiais">Materiais</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Centro de Custo</label>
          <input
            type="text"
            name="centroCusto"
            value={formData.centroCusto}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Código do centro de custo"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Natureza da Despesa</label>
          <input
            type="text"
            name="naturezaDespesa"
            value={formData.naturezaDespesa}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Ex: 4.4.90.52"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Elemento de Despesa</label>
          <input
            type="text"
            name="elementoDespesa"
            value={formData.elementoDespesa}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Código do elemento"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            CNPJ do Fornecedor
            <span
              style={styles.infoIcon}
              title="CNPJ será validado automaticamente"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="cnpjFornecedor"
            value={formData.cnpjFornecedor}
            onChange={handleInputChange}
            style={cnpjError ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            placeholder="00.000.000/0000-00"
            maxLength="18"
          />
          {cnpjError && <span style={styles.errorText}>{cnpjError}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Telefone do Fornecedor</label>
          <input
            type="text"
            name="telefoneFornecedor"
            value={formData.telefoneFornecedor}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email do Fornecedor</label>
          <input
            type="email"
            name="emailFornecedor"
            value={formData.emailFornecedor}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="fornecedor@email.com"
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Endereço do Fornecedor</label>
        <textarea
          name="enderecoFornecedor"
          value={formData.enderecoFornecedor}
          onChange={handleInputChange}
          style={styles.textarea}
          readOnly={modoVisualizacao}
          placeholder="Endereço completo do fornecedor..."
          rows={3}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Observações</label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={handleInputChange}
          style={styles.textarea}
          readOnly={modoVisualizacao}
          placeholder="Observações adicionais sobre a despesa..."
          rows={3}
        />
      </div>
    </fieldset>
  );
};

const styles = {
  fieldset: {
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  legend: {
    background: "white",
    padding: "6px 16px",
    borderRadius: "9999px",
    border: "1px solid #E2E8F0",
    color: "#334155",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Inter', sans-serif",
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
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  inputError: {
    padding: "12px",
    border: "2px solid #dc3545",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default DespesaFormAdvancedFields;
