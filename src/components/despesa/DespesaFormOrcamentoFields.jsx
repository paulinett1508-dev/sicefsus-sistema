
// src/components/despesa/DespesaFormOrcamentoFields.jsx
// ✅ Componente para campos de classificação orçamentária

import React from "react";

const DespesaFormOrcamentoFields = ({
  formData,
  errors,
  modoVisualizacao,
  handleInputChange,
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📊</span>
        Classificação Orçamentária
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Ação *</label>
          <select
            name="acao"
            value={formData.acao}
            onChange={handleInputChange}
            style={
              errors.acao
                ? { ...styles.select, borderColor: "#dc3545" }
                : styles.select
            }
            disabled={modoVisualizacao}
            required
          >
            <option value="">Selecione a ação</option>
            <option value="8535">
              8535 - Estruturação de Unidades de Atenção Especializada em Saúde
            </option>
            <option value="8536">
              8536 - Estruturação da Rede de Serviços de Atenção Básica de Saúde
            </option>
            <option value="8585">
              8585 - Atenção à Saúde da População para Procedimentos em Média e
              Alta Complexidade
            </option>
            <option value="8730">
              8730 - Atenção à Saúde da População para Procedimentos de Média e
              Alta Complexidade
            </option>
            <option value="20AD">20AD - Atenção Primária à Saúde</option>
            <option value="21C0">
              21C0 - Recursos para estruturação da rede de serviços de atenção
              básica
            </option>
          </select>
          {errors.acao && <span style={styles.errorText}>{errors.acao}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Dotação Orçamentária *</label>
          <input
            type="text"
            name="dotacaoOrcamentaria"
            value={formData.dotacaoOrcamentaria}
            onChange={handleInputChange}
            style={
              errors.dotacaoOrcamentaria ? styles.inputError : styles.input
            }
            readOnly={modoVisualizacao}
            placeholder="Código da dotação orçamentária"
            required
          />
          {errors.dotacaoOrcamentaria && (
            <span style={styles.errorText}>{errors.dotacaoOrcamentaria}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Classificação Funcional-Programática *</label>
          <input
            type="text"
            name="classificacaoFuncional"
            value={formData.classificacaoFuncional}
            onChange={handleInputChange}
            style={
              errors.classificacaoFuncional ? styles.inputError : styles.input
            }
            readOnly={modoVisualizacao}
            placeholder="Ex: 10.301.0001.2001"
            required
          />
          {errors.classificacaoFuncional && (
            <span style={styles.errorText}>{errors.classificacaoFuncional}</span>
          )}
        </div>

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
          <label style={styles.label}>CNPJ do Fornecedor</label>
          <input
            type="text"
            name="cnpjFornecedor"
            value={formData.cnpjFornecedor}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="00.000.000/0000-00"
          />
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
  labelRequired: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
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
};

export default DespesaFormOrcamentoFields;
