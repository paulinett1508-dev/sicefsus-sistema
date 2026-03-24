// src/components/relatorios/RelatoriosFiltros.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatCurrency } from "../../utils/pdfHelpers";
import "../../styles/relatorios.css";

/**
 * Dropdown com busca por digitação — substitui select nativo
 */
function SearchableSelect({ id, name, value, onChange, placeholder, options, className }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Label visível do valor selecionado
  const selectedLabel = value
    ? (options.find(o => o.value === value)?.label || "")
    : "";

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = useCallback((optValue) => {
    onChange({ target: { name, value: optValue } });
    setIsOpen(false);
    setSearch("");
  }, [name, onChange]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange({ target: { name, value: "" } });
    setSearch("");
  }, [name, onChange]);

  return (
    <div className="relatorios-searchable" ref={containerRef}>
      <div
        className={`relatorios-searchable-trigger ${className || ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <span className="relatorios-searchable-value">
            {selectedLabel}
            <button
              type="button"
              className="relatorios-searchable-clear"
              onClick={handleClear}
              aria-label="Limpar seleção"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
            </button>
          </span>
        ) : (
          <span className="relatorios-searchable-placeholder">{placeholder}</span>
        )}
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--theme-text-secondary)" }}>
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </div>

      {isOpen && (
        <div className="relatorios-searchable-dropdown">
          <input
            type="text"
            className="relatorios-searchable-input"
            placeholder="Digite para buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <ul className="relatorios-searchable-list">
            <li
              className={`relatorios-searchable-option ${!value ? "relatorios-searchable-option--active" : ""}`}
              onClick={() => handleSelect("")}
            >
              {placeholder}
            </li>
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <li
                  key={o.value}
                  className={`relatorios-searchable-option ${value === o.value ? "relatorios-searchable-option--active" : ""}`}
                  onClick={() => handleSelect(o.value)}
                >
                  {o.label}
                </li>
              ))
            ) : (
              <li className="relatorios-searchable-empty">Nenhum resultado</li>
            )}
          </ul>
        </div>
      )}

      {/* Hidden input para manter compatibilidade com formulário */}
      <input type="hidden" id={id} name={name} value={value} />
    </div>
  );
}

/**
 * Badge visual para campos preenchidos automaticamente pela inteligência de filtros
 */
function AutoFilledBadge() {
  return (
    <span
      className="relatorios-autofilled-badge"
      title="Preenchido automaticamente com base nos outros filtros"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: "middle", marginRight: 2 }}>auto_awesome</span>
      auto
    </span>
  );
}

export default function RelatoriosFiltros({
  selectedReport,
  filtros,
  onFiltroChange,
  onLimparFiltros,
  parlamentares,
  emendas = [],
  totalEmendas = 0,
  municipios = [],
  fornecedores = [],
  autoFilled = new Set(),
  previewData,
}) {
  const periodoDesativado = autoFilled.has("periodo");

  // Opções formatadas para os SearchableSelects
  const parlamentarOptions = parlamentares.map((p) => ({ value: p, label: p }));

  const emendaOptions = emendas.map((emenda) => ({
    value: emenda.id,
    label: `${emenda.numero || emenda.numeroEmenda || "S/N"} - ${emenda.parlamentar || emenda.autor || "?"} - ${emenda.municipio || "?"}`,
  }));

  const municipioOptions = municipios.map((m) => ({ value: m, label: m }));

  const fornecedorOptions = fornecedores.map((f) => ({ value: f, label: f }));

  // Contagem de filtros ativos (para feedback visual)
  const filtrosAtivos = [
    filtros.parlamentar,
    filtros.emenda,
    filtros.municipio,
    filtros.fornecedor,
    filtros.dataInicio || filtros.dataFim,
  ].filter(Boolean).length;

  return (
    <div className="relatorios-filters">
      <h3 className="relatorios-filters-title">
        Configure os Filtros do Relatório
        {filtrosAtivos > 0 && (
          <span className="relatorios-filters-count">
            {filtrosAtivos} filtro{filtrosAtivos > 1 ? "s" : ""} ativo{filtrosAtivos > 1 ? "s" : ""}
          </span>
        )}
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
          <div className={`relatorios-filter-group relatorios-filter-group--periodo ${periodoDesativado ? "relatorios-filter-group--disabled" : ""}`}>
            <label className="relatorios-filter-label" id="label-periodo">
              Período
              {periodoDesativado && (
                <span className="relatorios-filter-hint">
                  (desativado — emenda específica selecionada)
                </span>
              )}
            </label>
            <div className="relatorios-date-group" role="group" aria-labelledby="label-periodo">
              <input
                type="date"
                id="dataInicio"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={onFiltroChange}
                className="relatorios-date-input"
                aria-label="Data de início do período"
                disabled={periodoDesativado}
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
                disabled={periodoDesativado}
              />
            </div>
          </div>
        )}

        {/* Filtro de Parlamentar — com busca + auto-fill */}
        {selectedReport.campos.includes("parlamentar") && (
          <div className={`relatorios-filter-group ${autoFilled.has("parlamentar") ? "relatorios-filter-group--autofilled" : ""}`}>
            <label className="relatorios-filter-label">
              Parlamentar
              {autoFilled.has("parlamentar") && <AutoFilledBadge />}
            </label>
            <SearchableSelect
              id="parlamentar"
              name="parlamentar"
              value={filtros.parlamentar}
              onChange={onFiltroChange}
              placeholder="Todos"
              options={parlamentarOptions}
            />
          </div>
        )}

        {/* Filtro de Emenda — com busca (opções filtradas por outros filtros) */}
        {selectedReport.campos.includes("emenda") && (
          <div className={`relatorios-filter-group ${autoFilled.has("emenda") ? "relatorios-filter-group--autofilled" : ""}`}>
            <label className="relatorios-filter-label">
              Emenda Específica
              {autoFilled.has("emenda") && <AutoFilledBadge />}
              {emendaOptions.length < totalEmendas && !filtros.emenda && (
                <span className="relatorios-filter-hint">
                  ({emendaOptions.length} de {totalEmendas} disponíveis)
                </span>
              )}
            </label>
            <SearchableSelect
              id="emenda"
              name="emenda"
              value={filtros.emenda}
              onChange={onFiltroChange}
              placeholder="Todas as emendas"
              options={emendaOptions}
            />
          </div>
        )}

        {/* Filtro de Município — agora com SearchableSelect */}
        {selectedReport.campos.includes("municipio") && (
          <div className={`relatorios-filter-group ${autoFilled.has("municipio") ? "relatorios-filter-group--autofilled" : ""}`}>
            <label className="relatorios-filter-label">
              Município
              {autoFilled.has("municipio") && <AutoFilledBadge />}
            </label>
            <SearchableSelect
              id="municipio"
              name="municipio"
              value={filtros.municipio}
              onChange={onFiltroChange}
              placeholder="Todos os municípios"
              options={municipioOptions}
            />
          </div>
        )}

        {/* Filtro de Fornecedor — agora com SearchableSelect */}
        {selectedReport.campos.includes("fornecedor") && (
          <div className="relatorios-filter-group">
            <label className="relatorios-filter-label">
              Fornecedor
              {fornecedorOptions.length > 0 && !filtros.fornecedor && (
                <span className="relatorios-filter-hint">
                  ({fornecedorOptions.length} disponíveis)
                </span>
              )}
            </label>
            <SearchableSelect
              id="fornecedor"
              name="fornecedor"
              value={filtros.fornecedor || ""}
              onChange={onFiltroChange}
              placeholder="Todos os fornecedores"
              options={fornecedorOptions}
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
