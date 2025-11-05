// src/components/despesa/DespesaFormBasicFields.jsx
// 🎯 Campos básicos da despesa (Natureza, Valor, Fornecedor, Discriminação, Emenda)
// 🔒 "Adicionar" e "+ Adicionar despesa" desativados até Natureza selecionada e Valor > 0
// 🧩 Integra com DespesaForm via props: formData, errors, emendas, handleInputChange, etc.

import React, { useMemo } from "react";
import {
  parseValorMonetario,
  formatarMoedaInput,
} from "../../utils/formatters";
import { NATUREZAS_DESPESA } from "../../config/constants";

const toNaturezaOptions = (lista) => {
  try {
    if (Array.isArray(lista)) {
      return lista.map((n) => ({
        value: n.value ?? n.codigo ?? String(n),
        label: n.label ?? n.nome ?? String(n),
      }));
    }
  } catch (_) {}
  return [
    { value: "3.3.9.0.30", label: "3.3.9.0.30 – Material de Despesa" },
    {
      value: "3.3.90.30.99",
      label: "3.3.90.30.99 – Outros Materiais de Consumo",
    },
  ];
};

const DespesaFormBasicFields = ({
  formData,
  errors = {},
  emendas = [],
  emendaPreSelecionada = null,
  emendaInfo = null,
  userRole,
  userMunicipio,
  modoVisualizacao = false,
  valorError,
  handleInputChange,
  onAdicionar, // opcional; se não vier, o botão apenas respeita disabled
  showEmptyCTA = false, // se true, exibe o card de estado vazio com "+ Adicionar despesa"
}) => {
  // Opções normalizadas de Natureza
  const naturezaOptions = useMemo(
    () => toNaturezaOptions(NATUREZAS_DESPESA),
    [],
  );

  // Gate para habilitar botões
  const naturezaSelecionada =
    formData?.naturezaDespesa || formData?.natureza || "";
  const valorNum = parseValorMonetario(formData?.valor);
  const canAdd = Boolean(naturezaSelecionada) && valorNum > 0;

  // Handlers locais (encaminham para o pai)
  const onValorChange = (e) => {
    // Delega a formatação ao handler pai (que já usa useMoedaFormatting/formatters)
    // Caso queira forçar máscara aqui, descomente a linha abaixo e passe "valorFormatado"
    // e.target.value = formatarMoedaInput(e.target.value);
    handleInputChange?.(e);
  };

  const onAdicionarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) return;
    if (typeof onAdicionar === "function") {
      onAdicionar({
        naturezaDespesa: naturezaSelecionada,
        valor: valorNum,
        fornecedor: formData?.fornecedor || "",
        discriminacao: formData?.discriminacao || formData?.descricao || "",
      });
    }
  };

  return (
    <section style={styles.section}>
      {/* EMENDA (quando não pré-selecionada) */}
      {!emendaPreSelecionada && (
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Emenda</label>
            <select
              name="emendaId"
              value={formData?.emendaId || ""}
              onChange={handleInputChange}
              disabled={modoVisualizacao}
              style={styles.select}
            >
              <option value="">Selecione…</option>
              {emendas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.numero || e.numeroEmenda || e.id} —{" "}
                  {e.parlamentar || e.autor || ""}
                </option>
              ))}
            </select>
            {errors?.emendaId && (
              <span style={styles.error}>{errors.emendaId}</span>
            )}
          </div>
        </div>
      )}

      {/* FORNECEDOR */}
      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 2 }}>
          <label style={styles.label}>Fornecedor</label>
          <input
            type="text"
            name="fornecedor"
            placeholder="Razão Social / Nome Fantasia"
            value={formData?.fornecedor || ""}
            onChange={handleInputChange}
            disabled={modoVisualizacao}
            style={styles.input}
          />
          {errors?.fornecedor && (
            <span style={styles.error}>{errors.fornecedor}</span>
          )}
        </div>
      </div>

      {/* DISCRIMINAÇÃO */}
      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 2 }}>
          <label style={styles.label}>Discriminação</label>
          <input
            type="text"
            name="discriminacao"
            placeholder="Descreva brevemente a despesa"
            value={formData?.discriminacao || formData?.descricao || ""}
            onChange={handleInputChange}
            disabled={modoVisualizacao}
            style={styles.input}
          />
          {errors?.discriminacao && (
            <span style={styles.error}>{errors.discriminacao}</span>
          )}
        </div>
      </div>

      {/* NATUREZA + VALOR + (BOTÃO ADICIONAR) */}
      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 2 }}>
          <label style={styles.label}>Natureza da Despesa</label>
          <select
            name="naturezaDespesa"
            value={naturezaSelecionada}
            onChange={handleInputChange}
            disabled={modoVisualizacao}
            style={styles.select}
          >
            <option value="">Selecione…</option>
            {naturezaOptions.map((opt) => (
              <option key={opt.value} value={opt.label || opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Valor</label>
          <input
            type="text"
            name="valor"
            placeholder="R$ 0,00"
            value={formData?.valor || ""}
            onChange={onValorChange}
            disabled={modoVisualizacao}
            style={styles.input}
          />
          {(errors?.valor || valorError) && (
            <span style={styles.error}>{errors?.valor || valorError}</span>
          )}
        </div>

        {/* BOTÃO ADICIONAR (LINHA) */}
        <div style={{ ...styles.field, flex: 0 }}>
          <label style={styles.label}>&nbsp;</label>
          <button
            type="button"
            onClick={onAdicionarClick}
            disabled={!canAdd || modoVisualizacao}
            style={{
              ...styles.addButton,
              opacity: !canAdd || modoVisualizacao ? 0.6 : 1,
              cursor: !canAdd || modoVisualizacao ? "not-allowed" : "pointer",
            }}
            title={
              canAdd ? "Adicionar" : "Selecione Natureza e informe Valor > 0"
            }
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* CTA de estado vazio (opcional) */}
      {showEmptyCTA && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🧾</div>
          <div style={styles.emptyTextBox}>
            <h4 style={styles.emptyTitle}>Nenhuma despesa adicionada</h4>
            <p style={styles.emptyText}>
              Preencha <strong>Natureza</strong> e <strong>Valor</strong> para
              habilitar o botão.
            </p>
            <button
              type="button"
              onClick={onAdicionarClick}
              disabled={!canAdd || modoVisualizacao}
              style={{
                ...styles.addBigButton,
                opacity: !canAdd || modoVisualizacao ? 0.6 : 1,
                cursor: !canAdd || modoVisualizacao ? "not-allowed" : "pointer",
              }}
              title={
                canAdd
                  ? "+ Adicionar despesa"
                  : "Selecione Natureza e informe Valor > 0"
              }
            >
              + Adicionar despesa
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const styles = {
  section: { display: "flex", flexDirection: "column", gap: 16 },
  row: { display: "flex", gap: 16, flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", minWidth: 220 },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#495057",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    height: 40,
    border: "1px solid #ced4da",
    borderRadius: 8,
    padding: "0 12px",
    fontSize: 14,
  },
  select: {
    height: 40,
    border: "1px solid #ced4da",
    borderRadius: 8,
    padding: "0 8px",
    fontSize: 14,
    minWidth: 260,
  },
  error: { color: "#E74C3C", fontSize: 12, marginTop: 6 },

  addButton: {
    height: 40,
    border: "none",
    backgroundColor: "#1c7ed6",
    color: "#fff",
    borderRadius: 8,
    padding: "0 16px",
    fontWeight: 700,
  },

  emptyState: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 16,
    background: "#f8f9fa",
    border: "1px dashed #ced4da",
    borderRadius: 12,
  },
  emptyIcon: { fontSize: 28 },
  emptyTextBox: { display: "flex", alignItems: "center", gap: 12 },
  emptyTitle: { margin: 0, fontSize: 14, color: "#495057", fontWeight: 700 },
  emptyText: { margin: 0, fontSize: 13, color: "#6c757d" },

  addBigButton: {
    height: 40,
    border: "none",
    backgroundColor: "#2f9e44",
    color: "#fff",
    borderRadius: 8,
    padding: "0 16px",
    fontWeight: 700,
  },
};

export default DespesaFormBasicFields;
