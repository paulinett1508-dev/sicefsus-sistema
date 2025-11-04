// src/components/relatorios/RelatoriosFiltros.jsx
// ✅ ATUALIZADO 04/11/2025: Adicionados filtros por emenda e parlamentar
import React from "react";
import { formatCurrency } from "../../utils/pdfHelpers";
import "../../styles/relatorios.css";

export default function RelatoriosFiltros({
  selectedReport,
  filtros,
  onFiltroChange,
  onLimparFiltros,
  parlamentares,
  ufs,
  emendas = [], // ✅ NOVO: Lista de emendas para filtro
  previewData,
}) {
  return (
    <div className="relatorios-filters">
      <h3 className="relatorios-filters-title">
        Configure os Filtros do Relatório
      </h3>

      <div className="relatorios-filters-grid">
        {/* Filtro de Período */}
        {(selectedReport.campos.includes("periodo") ||
          selectedReport.campos.includes("mes")) && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label">Período</label>
            <div className="relatorios-date-group">
              <input
                type="date"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={onFiltroChange}
                className="relatorios-date-input"
              />
              <span className="relatorios-date-separator">até</span>
              <input
                type="date"
                name="dataFim"
                value={filtros.dataFim}
                onChange={onFiltroChange}
                className="relatorios-date-input"
              />
            </div>
          </div>
        )}

        {/* ✅ NOVO: Filtro de Parlamentar */}
        {selectedReport.campos.includes("parlamentar") && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label">Parlamentar</label>
            <select
              name="parlamentar"
              value={filtros.parlamentar}
              onChange={onFiltroChange}
              className="relatorios-select"
            >
              <option value="">Todos</option>
              {parlamentares.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ✅ NOVO: Filtro de Emenda */}
        {selectedReport.campos.includes("emenda") && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label">Emenda Específica</label>
            <select
              name="emenda"
              value={filtros.emenda}
              onChange={onFiltroChange}
              className="relatorios-select"
            >
              <option value="">Todas as emendas</option>
              {emendas.map((emenda) => (
                <option key={emenda.id} value={emenda.id}>
                  {emenda.numero || emenda.numeroEmenda} -{" "}
                  {emenda.parlamentar || emenda.autor} - {emenda.municipio}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro de Município */}
        {selectedReport.campos.includes("municipio") && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label">Município</label>
            <input
              type="text"
              name="municipio"
              value={filtros.municipio}
              onChange={onFiltroChange}
              placeholder="Digite o município"
              className="relatorios-input"
            />
          </div>
        )}

        {/* Filtro de UF */}
        {selectedReport.campos.includes("uf") && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label">UF</label>
            <select
              name="uf"
              value={filtros.uf}
              onChange={onFiltroChange}
              className="relatorios-select"
            >
              <option value="">Todas</option>
              {ufs.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ✅ NOVO: Filtro de Fornecedor (para relatório de despesas) */}
        {selectedReport.campos.includes("fornecedor") && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label">Fornecedor</label>
            <input
              type="text"
              name="fornecedor"
              value={filtros.fornecedor || ""}
              onChange={onFiltroChange}
              placeholder="Nome ou CNPJ do fornecedor"
              className="relatorios-input"
            />
          </div>
        )}
      </div>

      {/* Preview dos dados filtrados */}
      <div className="relatorios-preview">
        <h4 className="relatorios-preview-title">Prévia dos Dados</h4>
        <div className="relatorios-preview-stats">
          <div className="relatorios-preview-stat">
            <span className="relatorios-preview-label">Emendas:</span>
            <span className="relatorios-preview-value">
              {previewData.totalEmendas}
            </span>
          </div>
          <div className="relatorios-preview-stat">
            <span className="relatorios-preview-label">Despesas:</span>
            <span className="relatorios-preview-value">
              {previewData.totalDespesas}
            </span>
          </div>
          <div className="relatorios-preview-stat">
            <span className="relatorios-preview-label">Valor Total:</span>
            <span className="relatorios-preview-value">
              {formatCurrency(previewData.valorTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Botão Limpar */}
      <div className="relatorios-filter-actions">
        <button className="relatorios-clear-btn" onClick={onLimparFiltros}>
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}
