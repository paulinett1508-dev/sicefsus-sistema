// components/emenda/EmendaDetail/sections/NovaDespesaTab.jsx
import React from "react";
import { emendaDetailStyles } from "../styles/emendaDetailStyles";

const NovaDespesaTab = ({
  despesaParaEditar,
  metricas,
  formatCurrency,
  handleSalvarDespesa,
  handleCancelarDespesa,
}) => {
  return (
    <div style={emendaDetailStyles.formContainer}>
      <div style={emendaDetailStyles.formHeader}>
        <h3 style={emendaDetailStyles.formTitle}>
          {despesaParaEditar ? "✏️ Editar Despesa" : "➕ Nova Despesa"}
        </h3>
        <div style={emendaDetailStyles.formActions}>
          <button
            onClick={handleCancelarDespesa}
            style={emendaDetailStyles.btnSecondary}
          >
            ✖️ Cancelar
          </button>
          <button
            onClick={handleSalvarDespesa}
            style={emendaDetailStyles.btnSuccess}
          >
            💾 Salvar Despesa
          </button>
        </div>
      </div>

      <div style={emendaDetailStyles.formContent}>
        {/* Saldo Disponível */}
        <div style={emendaDetailStyles.saldoInfo}>
          <span style={emendaDetailStyles.saldoLabel}>Saldo Disponível:</span>
          <span style={emendaDetailStyles.saldoValue}>
            {formatCurrency(metricas.saldoDisponivel)}
          </span>
        </div>

        {/* Campos do formulário */}
        <div style={emendaDetailStyles.formGrid}>
          <div style={emendaDetailStyles.formGroup}>
            <label style={emendaDetailStyles.formLabel}>Descrição *</label>
            <input
              type="text"
              style={emendaDetailStyles.formInput}
              placeholder="Ex: Aquisição de equipamentos"
              defaultValue={despesaParaEditar?.descricao || ""}
            />
          </div>

          <div style={emendaDetailStyles.formGroup}>
            <label style={emendaDetailStyles.formLabel}>Valor *</label>
            <input
              type="text"
              style={emendaDetailStyles.formInput}
              placeholder="R$ 0,00"
              defaultValue={
                despesaParaEditar ? formatCurrency(despesaParaEditar.valor) : ""
              }
            />
          </div>

          <div style={emendaDetailStyles.formGroup}>
            <label style={emendaDetailStyles.formLabel}>
              Data da Despesa *
            </label>
            <input
              type="date"
              style={emendaDetailStyles.formInput}
              defaultValue={despesaParaEditar?.data || ""}
            />
          </div>

          <div style={emendaDetailStyles.formGroup}>
            <label style={emendaDetailStyles.formLabel}>
              Natureza da Despesa *
            </label>
            <select
              style={emendaDetailStyles.formInput}
              defaultValue={despesaParaEditar?.naturezaDespesa || ""}
            >
              <option value="">Selecione...</option>
              <option value="MATERIAL DE CONSUMO">Material de Consumo</option>
              <option value="MATERIAL PERMANENTE">Material Permanente</option>
              <option value="SERVIÇOS TERCEIRIZADOS">
                Serviços Terceirizados
              </option>
            </select>
          </div>

          <div style={emendaDetailStyles.formGroup}>
            <label style={emendaDetailStyles.formLabel}>
              Número do Empenho
            </label>
            <input
              type="text"
              style={emendaDetailStyles.formInput}
              placeholder="Ex: 2025NE000123"
              defaultValue={despesaParaEditar?.numeroEmpenho || ""}
            />
          </div>
        </div>

        {/* Nota informativa */}
        <div style={emendaDetailStyles.formNote}>
          <strong>📌 Observação:</strong> Todos os campos marcados com * são
          obrigatórios. O valor da despesa não pode exceder o saldo disponível
          da emenda.
        </div>
      </div>
    </div>
  );
};

export default NovaDespesaTab;
