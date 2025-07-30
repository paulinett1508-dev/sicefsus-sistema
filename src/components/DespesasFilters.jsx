import React, { useState, useEffect } from "react";

const DespesasFilters = ({
  despesas = [],
  emendas = [],
  onFilterChange,
  totalDespesas = 0,
}) => {
  // ✅ FILTROS BÁSICOS (4 campos como Emendas)
  const [filtros, setFiltros] = useState({
    termoBusca: "",
    emendaId: "",
    valorMin: "",
    valorMax: "",
  });

  // ✅ FUNÇÃO FILTRAR DESPESAS
  const filtrarDespesas = (despesas, filtros) => {
    return despesas.filter((despesa) => {
      // Filtro Busca Geral (fornecedor, descrição, CNPJ)
      if (filtros.termoBusca) {
        const termo = filtros.termoBusca.toLowerCase();
        const fornecedor = despesa.fornecedor?.toLowerCase() || "";
        const descricao = despesa.descricao?.toLowerCase() || "";
        const cnpj = despesa.cnpj?.toLowerCase() || "";

        if (
          !fornecedor.includes(termo) &&
          !descricao.includes(termo) &&
          !cnpj.includes(termo)
        ) {
          return false;
        }
      }

      // Filtro por Emenda específica
      if (filtros.emendaId && despesa.emendaId !== filtros.emendaId) {
        return false;
      }

      // Filtro Valor Mínimo
      if (filtros.valorMin) {
        const valorDespesa = parseFloat(despesa.valor) || 0;
        const valorMinimo = parseFloat(filtros.valorMin) || 0;
        if (valorDespesa < valorMinimo) {
          return false;
        }
      }

      // Filtro Valor Máximo
      if (filtros.valorMax) {
        const valorDespesa = parseFloat(despesa.valor) || 0;
        const valorMaximo = parseFloat(filtros.valorMax) || 0;
        if (valorDespesa > valorMaximo) {
          return false;
        }
      }

      return true;
    });
  };

  // ✅ APLICAR FILTROS AUTOMATICAMENTE - CORRIGIDO
  useEffect(() => {
    const resultado = filtrarDespesas(despesas, filtros);
    if (onFilterChange) {
      onFilterChange(resultado);
    }
  }, [despesas, filtros]); // ✅ REMOVIDO onFilterChange das dependências

  // ✅ ATUALIZAR FILTRO
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ✅ LIMPAR FILTROS
  const limparFiltros = () => {
    const filtrosLimpos = {
      termoBusca: "",
      emendaId: "",
      valorMin: "",
      valorMax: "",
    };
    setFiltros(filtrosLimpos);
  };

  // ✅ CONTAR FILTROS ATIVOS
  const contarFiltrosAtivos = () => {
    return Object.values(filtros).filter((valor) => valor.trim() !== "").length;
  };

  // ✅ OBTER NOME DA EMENDA
  const getEmendaDisplayName = (emendaId) => {
    const emenda = emendas.find((e) => e.id === emendaId);
    if (!emenda) return "Emenda não encontrada";
    return `${emenda.numero || emenda.id} - ${emenda.autor || "Sem autor"}`;
  };

  return (
    <div style={styles.container}>
      {/* ✅ HEADER IGUAL EMENDAS */}
      <div style={styles.header}>
        <h3 style={styles.title}>🔍 Filtros de Pesquisa</h3>
        <div style={styles.resultsBadge}>
          {totalDespesas} despesas encontradas
        </div>
      </div>

      {/* ✅ FILTROS BÁSICOS (4 CAMPOS) */}
      <div style={styles.filtersGrid}>
        {/* Busca Geral */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>🔍 Busca Geral</label>
          <input
            type="text"
            placeholder="Fornecedor, descrição, CNPJ..."
            value={filtros.termoBusca}
            onChange={(e) => handleFiltroChange("termoBusca", e.target.value)}
            style={styles.filterInput}
          />
        </div>

        {/* Emenda */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>📄 Emenda</label>
          <select
            value={filtros.emendaId}
            onChange={(e) => handleFiltroChange("emendaId", e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">Todas as emendas</option>
            {emendas.map((emenda) => (
              <option key={emenda.id} value={emenda.id}>
                {getEmendaDisplayName(emenda.id)}
              </option>
            ))}
          </select>
        </div>

        {/* Valor Mínimo */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>💰 Valor Mínimo</label>
          <input
            type="number"
            placeholder="Ex: 1000"
            value={filtros.valorMin}
            onChange={(e) => handleFiltroChange("valorMin", e.target.value)}
            style={styles.filterInput}
            min="0"
            step="0.01"
          />
        </div>

        {/* Valor Máximo */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>💰 Valor Máximo</label>
          <input
            type="number"
            placeholder="Ex: 100000"
            value={filtros.valorMax}
            onChange={(e) => handleFiltroChange("valorMax", e.target.value)}
            style={styles.filterInput}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* ✅ BOTÕES DE AÇÃO */}
      <div style={styles.filterActions}>
        <button
          onClick={() => {
            /* Filtros são aplicados automaticamente */
          }}
          style={styles.buttonFilter}
          disabled={contarFiltrosAtivos() === 0}
        >
          🔍 {contarFiltrosAtivos()} Filtro
          {contarFiltrosAtivos() !== 1 ? "s" : ""} Ativo
          {contarFiltrosAtivos() !== 1 ? "s" : ""}
        </button>

        <button
          onClick={limparFiltros}
          style={styles.buttonClear}
          disabled={contarFiltrosAtivos() === 0}
        >
          🗑️ Limpar Filtros
        </button>
      </div>
    </div>
  );
};

// ✅ ESTILOS PADRONIZADOS
const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2c3e50",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  resultsBadge: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
  },

  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "6px",
  },

  filterInput: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    transition: "border-color 0.2s",
    backgroundColor: "#fafbfc",
  },

  filterSelect: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },

  filterActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },

  buttonFilter: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
  },

  buttonClear: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
  },
};

export default DespesasFilters;
