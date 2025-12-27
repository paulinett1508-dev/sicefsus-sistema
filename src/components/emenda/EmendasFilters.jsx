// src/components/emenda/EmendasFilters.jsx
import React from "react";

const EmendasFilters = ({
  filtros,
  onFiltroChange,
  onLimparFiltros,
  showFiltros,
  onToggleFiltros,
  parlamentaresUnicos,
  tiposUnicos,
  totalEmendas,
  emendasFiltradas,
}) => {
  const temFiltrosAtivos =
    filtros.busca ||
    filtros.parlamentar ||
    filtros.tipo ||
    filtros.status ||
    filtros.statusFinanceiro;

  return (
    <>
      {/* Seção de Filtros */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>🔍 Filtros de Pesquisa</h3>
          <div style={styles.filtersButtons}>
            <button onClick={onToggleFiltros} style={styles.toggleButton}>
              {showFiltros ? "🔼 Ocultar Filtros" : "🔽 Mostrar Filtros"}
            </button>
            {showFiltros && (
              <button onClick={onLimparFiltros} style={styles.clearButton}>
                🗑️ Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {showFiltros && (
          <div style={styles.filtersGrid}>
            <input
              type="text"
              placeholder="Buscar por parlamentar, número ou emenda..."
              value={filtros.busca}
              onChange={(e) => onFiltroChange("busca", e.target.value)}
              style={styles.searchInput}
            />

            <select
              value={filtros.parlamentar}
              onChange={(e) => onFiltroChange("parlamentar", e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Todos os parlamentares</option>
              {parlamentaresUnicos.map((parlamentar) => (
                <option key={parlamentar} value={parlamentar}>
                  {parlamentar}
                </option>
              ))}
            </select>

            <select
              value={filtros.tipo}
              onChange={(e) => onFiltroChange("tipo", e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Todos os objetos</option>
              {tiposUnicos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <select
              value={filtros.status}
              onChange={(e) => onFiltroChange("status", e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Todos os status</option>
              <option value="ativa">Ativas</option>
              <option value="esgotada">Esgotadas</option>
              <option value="vencida">Vencidas</option>
            </select>

            <select
              value={filtros.statusFinanceiro}
              onChange={(e) =>
                onFiltroChange("statusFinanceiro", e.target.value)
              }
              style={styles.filterSelect}
            >
              <option value="">Status Financeiro</option>
              <option value="com-saldo">Com Saldo</option>
              <option value="esgotadas">Esgotadas</option>
              <option value="sem-despesas">Sem Despesas</option>
            </select>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div style={styles.summary}>
        <span style={styles.summaryText}>
          Exibindo <strong>{emendasFiltradas}</strong> de{" "}
          <strong>{totalEmendas}</strong> emendas
        </span>
        {temFiltrosAtivos && (
          <span style={styles.filtersBadge}>Filtros ativos</span>
        )}
      </div>
    </>
  );
};

const styles = {
  filtersSection: {
    padding: "24px",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },

  filtersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  filtersTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1E293B",
    margin: 0,
  },

  filtersButtons: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  toggleButton: {
    backgroundColor: "transparent",
    color: "#3B82F6",
    border: "1px solid #3B82F6",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },

  clearButton: {
    background: "none",
    border: "1px solid #6c757d",
    color: "#6c757d",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },

  searchInput: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
  },

  filterSelect: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },

  summary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
  },

  summaryText: {
    fontSize: "14px",
    color: "#6c757d",
  },

  filtersBadge: {
    fontSize: "12px",
    backgroundColor: "#007bff",
    color: "white",
    padding: "4px 8px",
    borderRadius: "12px",
  },
};

export default EmendasFilters;
