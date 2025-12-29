// src/components/DespesasFilters.jsx
// ✅ Filtro otimizado para visualização de pagamentos por emenda
// 🎯 FOCO: Filtrar despesas de forma simples e eficiente
// ❌ REMOVIDO: Campos desnecessários de Saldo e %

import React, { useState, useEffect } from "react";

const DespesasFilters = ({
  despesas = [],
  emendas = [],
  onFilterChange,
  totalDespesas = 0,
}) => {
  const [filtros, setFiltros] = useState({
    termoBusca: "",
    emendaId: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  });

  // ✅ FUNÇÃO FILTRAR DESPESAS
  const filtrarDespesas = (despesas, filtros) => {
    return despesas.filter((despesa) => {
      // Filtro Busca Geral (fornecedor, discriminação, número empenho)
      if (filtros.termoBusca) {
        const termo = filtros.termoBusca.toLowerCase();
        const fornecedor = despesa.fornecedor?.toLowerCase() || "";
        const discriminacao = despesa.discriminacao?.toLowerCase() || "";
        const numeroEmpenho = despesa.numeroEmpenho?.toLowerCase() || "";
        const numeroNota = despesa.numeroNota?.toLowerCase() || "";

        if (
          !fornecedor.includes(termo) &&
          !discriminacao.includes(termo) &&
          !numeroEmpenho.includes(termo) &&
          !numeroNota.includes(termo)
        ) {
          return false;
        }
      }

      // Filtro por Emenda específica
      if (filtros.emendaId && despesa.emendaId !== filtros.emendaId) {
        return false;
      }

      // Filtro por Status
      if (filtros.status && despesa.status !== filtros.status) {
        return false;
      }

      // Filtro por Data Início
      if (filtros.dataInicio) {
        const dataDespesa = new Date(
          despesa.dataPagamento || despesa.dataEmpenho,
        );
        const dataFiltroInicio = new Date(filtros.dataInicio);
        if (dataDespesa < dataFiltroInicio) {
          return false;
        }
      }

      // Filtro por Data Fim
      if (filtros.dataFim) {
        const dataDespesa = new Date(
          despesa.dataPagamento || despesa.dataEmpenho,
        );
        const dataFiltroFim = new Date(filtros.dataFim);
        if (dataDespesa > dataFiltroFim) {
          return false;
        }
      }

      return true;
    });
  };

  // ✅ APLICAR FILTROS AUTOMATICAMENTE
  useEffect(() => {
    const resultado = filtrarDespesas(despesas, filtros);
    if (onFilterChange) {
      onFilterChange(resultado);
    }
  }, [despesas, filtros]);

  // ✅ ATUALIZAR FILTRO
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ✅ LIMPAR FILTROS
  const limparFiltros = () => {
    setFiltros({
      termoBusca: "",
      emendaId: "",
      status: "",
      dataInicio: "",
      dataFim: "",
    });
  };

  // ✅ CONTAR FILTROS ATIVOS
  const contarFiltrosAtivos = () => {
    return Object.values(filtros).filter((valor) => valor.trim() !== "").length;
  };

  // ✅ OBTER NOME DA EMENDA
  const getEmendaDisplayName = (emendaId) => {
    const emenda = emendas.find((e) => e.id === emendaId);
    if (!emenda) return "Emenda não encontrada";
    return `${emenda.numero || emenda.id} - ${emenda.parlamentar || emenda.autor || "Sem autor"}`;
  };

  return (
    <div style={styles.container}>
      {/* ✅ HEADER */}
      <div style={styles.header}>
        <h3 style={styles.title}><span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: "middle", marginRight: 6 }}>search</span> Filtros de Pesquisa</h3>
        <div style={styles.resultsBadge}>
          {totalDespesas} {totalDespesas === 1 ? "pagamento" : "pagamentos"}
        </div>
      </div>

      {/* ✅ FILTROS OTIMIZADOS (5 CAMPOS) */}
      <div style={styles.filtersGrid}>
        {/* Busca Geral */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>search</span> Busca Geral</label>
          <input
            type="text"
            placeholder="Fornecedor, nº empenho, nº nota..."
            value={filtros.termoBusca}
            onChange={(e) => handleFiltroChange("termoBusca", e.target.value)}
            style={styles.filterInput}
          />
        </div>

        {/* Filtro por Emenda - DESTACADO */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>star</span> Emenda
            <span style={styles.highlightBadge}>Principal</span>
          </label>
          <select
            value={filtros.emendaId}
            onChange={(e) => handleFiltroChange("emendaId", e.target.value)}
            style={styles.filterSelectHighlight}
          >
            <option value="">Todas as emendas</option>
            {emendas.map((emenda) => (
              <option key={emenda.id} value={emenda.id}>
                {getEmendaDisplayName(emenda.id)}
              </option>
            ))}
          </select>
        </div>

        {/* Status do Pagamento */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>push_pin</span> Status</label>
          <select
            value={filtros.status}
            onChange={(e) => handleFiltroChange("status", e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="empenhado">Empenhado</option>
            <option value="liquidado">Liquidado</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Data Início */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>calendar_today</span> Data Início</label>
          <input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
            style={styles.filterInput}
          />
        </div>

        {/* Data Fim */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>calendar_today</span> Data Fim</label>
          <input
            type="date"
            value={filtros.dataFim}
            onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
            style={styles.filterInput}
          />
        </div>
      </div>

      {/* ✅ BOTÕES DE AÇÃO */}
      <div style={styles.filterActions}>
        <button
          style={styles.buttonFilter}
          disabled={contarFiltrosAtivos() === 0}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>search</span> {contarFiltrosAtivos()} Filtro
          {contarFiltrosAtivos() !== 1 ? "s" : ""} Ativo
          {contarFiltrosAtivos() !== 1 ? "s" : ""}
        </button>

        <button
          onClick={limparFiltros}
          style={styles.buttonClear}
          disabled={contarFiltrosAtivos() === 0}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>delete</span> Limpar Filtros
        </button>
      </div>

      {/* ✅ DICA VISUAL */}
      {filtros.emendaId && (
        <div style={styles.hint}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>lightbulb</span> <strong>Dica:</strong> Visualizando pagamentos da emenda
          selecionada
        </div>
      )}
    </div>
  );
};

// ✅ ESTILOS PADRONIZADOS
const styles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--theme-border)",
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
    color: "var(--theme-text)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  resultsBadge: {
    backgroundColor: "var(--primary)",
    color: "var(--white)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
    color: "var(--theme-text-secondary)",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  highlightBadge: {
    fontSize: "10px",
    backgroundColor: "var(--warning)",
    color: "var(--gray-900)",
    padding: "2px 6px",
    borderRadius: "10px",
    fontWeight: "bold",
  },

  filterInput: {
    padding: "10px 12px",
    border: "1px solid var(--theme-border)",
    borderRadius: "4px",
    fontSize: "14px",
    transition: "border-color 0.2s",
    backgroundColor: "var(--theme-surface-secondary)",
    color: "var(--theme-text)",
  },

  filterSelect: {
    padding: "10px 12px",
    border: "1px solid var(--theme-border)",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
    cursor: "pointer",
  },

  filterSelectHighlight: {
    padding: "10px 12px",
    border: "2px solid var(--warning)",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
    cursor: "pointer",
    fontWeight: "500",
  },

  filterActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },

  buttonFilter: {
    backgroundColor: "var(--primary)",
    color: "var(--white)",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
  },

  buttonClear: {
    backgroundColor: "var(--secondary)",
    color: "var(--white)",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
  },

  hint: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "var(--theme-surface-secondary)",
    border: "1px solid var(--theme-border)",
    borderRadius: "4px",
    fontSize: "13px",
    color: "var(--info)",
  },
};

export default DespesasFilters;
