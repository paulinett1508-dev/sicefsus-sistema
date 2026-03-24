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
  emendas = [],
  previewData,
}) {
  return (
    <div className="relatorios-filters">
      <h3 className="relatorios-filters-title">
        Configure os Filtros do Relatório
      </h3>

      <div className="relatorios-filters-grid">
        {/* Filtro de Mês/Ano (para relatório consolidado mensal) */}
        {selectedReport.campos.includes("mes") && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label" id="label-mes-ano">Mês / Ano</label>
            <div className="relatorios-date-group" role="group" aria-labelledby="label-mes-ano">
              <select
                id="mes"
                name="mes"
                value={filtros.mes}
                onChange={onFiltroChange}
                className="relatorios-select"
                aria-label="Mês de referência"
              >
                {[
                  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
                ].map((nome, idx) => (
                  <option key={nome} value={idx + 1}>{nome}</option>
                ))}
              </select>
              <input
                type="number"
                id="ano"
                name="ano"
                value={filtros.ano}
                onChange={onFiltroChange}
                min="2020"
                max="2099"
                className="relatorios-date-input relatorios-year-input"
                aria-label="Ano de referência"
              />
            </div>
          </div>
        )}

        {/* Filtro de Período */}
        {selectedReport.campos.includes("periodo") && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label" id="label-periodo">Período</label>
            <div className="relatorios-date-group" role="group" aria-labelledby="label-periodo">
              <input
                type="date"
                id="dataInicio"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={onFiltroChange}
                className="relatorios-date-input"
                aria-label="Data de início do período"
              />
              <span className="relatorios-date-separator">até</span>
              <input
                type="date"
                id="dataFim"
                name="dataFim"
                value={filtros.dataFim}
                onChange={onFiltroChange}
                className="relatorios-date-input"
                aria-label="Data de fim do período"
              />
            </div>
          </div>
        )}


        {/* Filtro de Parlamentar */}
        {selectedReport.campos.includes("parlamentar") && (
          <div className="relatorios-filter-group">
            <label htmlFor="parlamentar" className="relatorios-filter-label">Parlamentar</label>
            <select
              id="parlamentar"
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

        {/* Filtro de Emenda */}
        {selectedReport.campos.includes("emenda") && (
          <div className="relatorios-filter-group">
            <label htmlFor="emenda" className="relatorios-filter-label">Emenda Específica</label>
            <select
              id="emenda"
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
            <label htmlFor="municipio" className="relatorios-filter-label">Município</label>
            <input
              type="text"
              id="municipio"
              name="municipio"
              value={filtros.municipio}
              onChange={onFiltroChange}
              placeholder="Digite o município"
              className="relatorios-input"
            />
          </div>
        )}

        {/* Filtro de Fornecedor (para relatório de despesas) */}
        {selectedReport.campos.includes("fornecedor") && (
          <div className="relatorios-filter-group">
            <label htmlFor="fornecedor" className="relatorios-filter-label">Fornecedor</label>
            <input
              type="text"
              id="fornecedor"
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
        {previewData.totalEmendas === 0 ? (
          <p style={{ color: "var(--theme-text-secondary)", fontSize: 14, margin: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>search_off</span>
            Nenhuma emenda encontrada com os filtros selecionados.
          </p>
        ) : (
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
        )}
      </div>

      {/* Botão Limpar */}
      <div className="relatorios-filter-actions">
        <button type="button" className="relatorios-clear-btn" onClick={onLimparFiltros}>
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}
