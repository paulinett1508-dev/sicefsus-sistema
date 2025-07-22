// EmendasList.jsx - Versão Corrigida sem Warnings DOM
import React, { useState } from "react";

const EmendasList = ({
  emendas = [],
  usuario,
  onNovaEmenda,
  onEditarEmenda,
  onVisualizarEmenda,
  onAbrirEmenda,
  onExcluirEmenda,
}) => {
  const [filtros, setFiltros] = useState({
    busca: "",
    parlamentar: "",
    tipo: "",
    status: "",
  });

  // Filtrar emendas
  const emendasFiltradas = emendas.filter((emenda) => {
    const matchBusca =
      !filtros.busca ||
      emenda.parlamentar?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      emenda.numero?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      emenda.emenda?.toLowerCase().includes(filtros.busca.toLowerCase());

    const matchParlamentar =
      !filtros.parlamentar || emenda.parlamentar === filtros.parlamentar;
    const matchTipo = !filtros.tipo || emenda.tipo === filtros.tipo;

    let matchStatus = true;
    if (filtros.status === "ativa") {
      matchStatus = emenda.saldo > 0 && new Date(emenda.validade) >= new Date();
    } else if (filtros.status === "esgotada") {
      matchStatus = emenda.saldo <= 0;
    } else if (filtros.status === "vencida") {
      matchStatus = new Date(emenda.validade) < new Date();
    }

    return matchBusca && matchParlamentar && matchTipo && matchStatus;
  });

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Determinar status da emenda
  const getEmendaStatus = (emenda) => {
    if (new Date(emenda.validade) < new Date()) {
      return { text: "Vencida", color: "#dc3545" };
    } else if (emenda.saldo <= 0) {
      return { text: "Esgotada", color: "#ffc107" };
    } else {
      return { text: "Ativa", color: "#28a745" };
    }
  };

  // Handler para botão abrir
  const handleAbrirEmenda = (emenda) => {
    if (onAbrirEmenda && typeof onAbrirEmenda === "function") {
      onAbrirEmenda(emenda);
    } else if (onVisualizarEmenda && typeof onVisualizarEmenda === "function") {
      onVisualizarEmenda(emenda);
    } else {
      console.warn("Nenhum handler válido encontrado para abrir emenda");
    }
  };

  // Parlamentares únicos para filtro
  const parlamentaresUnicos = [...new Set(emendas.map((e) => e.parlamentar))]
    .filter(Boolean)
    .sort();

  // Tipos únicos para filtro
  const tiposUnicos = [...new Set(emendas.map((e) => e.tipo))]
    .filter(Boolean)
    .sort();

  // ✅ Renderizar linha da tabela sem whitespace
  const renderTableRow = (emenda) => {
    const status = getEmendaStatus(emenda);

    return React.createElement(
      "tr",
      {
        key: emenda.id,
        style: styles.tableRow,
      },
      [
        React.createElement(
          "td",
          { key: "numero", style: styles.td },
          React.createElement(
            "strong",
            { style: styles.numeroEmenda },
            emenda.numero,
          ),
        ),
        React.createElement(
          "td",
          { key: "parlamentar", style: styles.td },
          React.createElement(
            "div",
            { style: styles.parlamentarInfo },
            React.createElement(
              "strong",
              { style: styles.parlamentarNome },
              emenda.parlamentar,
            ),
          ),
        ),
        React.createElement(
          "td",
          { key: "emenda", style: styles.td },
          React.createElement(
            "span",
            { style: styles.emendaId },
            emenda.emenda,
          ),
        ),
        React.createElement(
          "td",
          { key: "tipo", style: styles.td },
          React.createElement("span", { style: styles.tipo }, emenda.tipo),
        ),
        React.createElement(
          "td",
          { key: "local", style: styles.td },
          React.createElement("div", { style: styles.localInfo }, [
            React.createElement("span", { key: "municipio" }, emenda.municipio),
            React.createElement(
              "small",
              { key: "uf", style: styles.uf },
              emenda.uf,
            ),
          ]),
        ),
        React.createElement(
          "td",
          { key: "valor", style: styles.td },
          React.createElement(
            "strong",
            { style: styles.valor },
            formatCurrency(emenda.valorTotal),
          ),
        ),
        React.createElement(
          "td",
          { key: "saldo", style: styles.td },
          React.createElement(
            "strong",
            {
              style: {
                ...styles.saldo,
                color: emenda.saldo > 0 ? "#28a745" : "#dc3545",
              },
            },
            formatCurrency(emenda.saldo),
          ),
        ),
        React.createElement(
          "td",
          { key: "validade", style: styles.td },
          React.createElement(
            "span",
            { style: styles.data },
            formatDate(emenda.validade),
          ),
        ),
        React.createElement(
          "td",
          { key: "status", style: styles.td },
          React.createElement(
            "span",
            {
              style: { ...styles.status, backgroundColor: status.color },
            },
            status.text,
          ),
        ),
        React.createElement(
          "td",
          { key: "acoes", style: styles.td },
          React.createElement("div", { style: styles.actionsContainer }, [
            React.createElement(
              "button",
              {
                key: "abrir",
                onClick: () => handleAbrirEmenda(emenda),
                style: styles.actionButton,
                title: "Abrir emenda",
              },
              "👁️",
            ),
            React.createElement(
              "button",
              {
                key: "editar",
                onClick: () => onEditarEmenda(emenda),
                style: styles.actionButton,
                title: "Editar emenda",
              },
              "✏️",
            ),
            ...(usuario?.role === "admin"
              ? [
                  React.createElement(
                    "button",
                    {
                      key: "excluir",
                      onClick: () => onExcluirEmenda(emenda.id),
                      style: styles.actionButtonDanger,
                      title: "Excluir emenda",
                    },
                    "🗑️",
                  ),
                ]
              : []),
          ]),
        ),
      ],
    );
  };

  return (
    <div style={styles.container}>
      {/* Filtros */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>🔍 Filtros</h3>
          <button
            onClick={() =>
              setFiltros({ busca: "", parlamentar: "", tipo: "", status: "" })
            }
            style={styles.clearButton}
          >
            Limpar Filtros
          </button>
        </div>

        <div style={styles.filtersGrid}>
          <input
            type="text"
            placeholder="Buscar por parlamentar, número ou emenda..."
            value={filtros.busca}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, busca: e.target.value }))
            }
            style={styles.searchInput}
          />

          <select
            value={filtros.parlamentar}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, parlamentar: e.target.value }))
            }
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
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, tipo: e.target.value }))
            }
            style={styles.filterSelect}
          >
            <option value="">Todos os tipos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>

          <select
            value={filtros.status}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, status: e.target.value }))
            }
            style={styles.filterSelect}
          >
            <option value="">Todos os status</option>
            <option value="ativa">Ativas</option>
            <option value="esgotada">Esgotadas</option>
            <option value="vencida">Vencidas</option>
          </select>
        </div>
      </div>

      {/* Resumo */}
      <div style={styles.summary}>
        <span style={styles.summaryText}>
          Exibindo <strong>{emendasFiltradas.length}</strong> de{" "}
          <strong>{emendas.length}</strong> emendas
        </span>
        {(filtros.busca ||
          filtros.parlamentar ||
          filtros.tipo ||
          filtros.status) && (
          <span style={styles.filtersBadge}>Filtros ativos</span>
        )}
      </div>

      {/* Tabela */}
      <div style={styles.tableContainer}>
        {emendasFiltradas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📋</span>
            <h3 style={styles.emptyTitle}>
              {emendas.length === 0
                ? "Nenhuma emenda cadastrada"
                : "Nenhuma emenda encontrada"}
            </h3>
            <p style={styles.emptyMessage}>
              {emendas.length === 0
                ? 'Clique em "Nova Emenda" para cadastrar a primeira emenda.'
                : "Tente ajustar os filtros para encontrar o que procura."}
            </p>
            {emendas.length === 0 && (
              <button onClick={onNovaEmenda} style={styles.emptyButton}>
                ➕ Nova Emenda
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            {/* ✅ Tabela criada programaticamente para evitar warnings */}
            {React.createElement("table", { style: styles.table }, [
              React.createElement(
                "thead",
                { key: "head" },
                React.createElement("tr", { style: styles.tableHeader }, [
                  React.createElement(
                    "th",
                    { key: "th-numero", style: styles.th },
                    "Número",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-parlamentar", style: styles.th },
                    "Parlamentar",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-emenda", style: styles.th },
                    "Emenda",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-tipo", style: styles.th },
                    "Tipo",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-local", style: styles.th },
                    "Município/UF",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-valor", style: styles.th },
                    "Valor Total",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-saldo", style: styles.th },
                    "Saldo",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-validade", style: styles.th },
                    "Validade",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-status", style: styles.th },
                    "Status",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-acoes", style: styles.th },
                    "Ações",
                  ),
                ]),
              ),
              React.createElement(
                "tbody",
                { key: "body" },
                emendasFiltradas.map(renderTableRow),
              ),
            ])}
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos iguais aos anteriores
const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

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
    color: "#2c3e50",
    margin: 0,
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

  tableContainer: {
    minHeight: "400px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  tableHeader: {
    backgroundColor: "#f8f9fa",
  },

  th: {
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#495057",
    borderBottom: "2px solid #e9ecef",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #e9ecef",
    transition: "background-color 0.2s ease",
  },

  td: {
    padding: "16px 12px",
    verticalAlign: "top",
  },

  numeroEmenda: {
    color: "#007bff",
    fontSize: "14px",
    fontWeight: "600",
  },

  parlamentarInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  parlamentarNome: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },

  emendaId: {
    fontSize: "13px",
    color: "#6c757d",
    fontFamily: "monospace",
    backgroundColor: "#f8f9fa",
    padding: "2px 6px",
    borderRadius: "4px",
  },

  tipo: {
    fontSize: "13px",
    color: "#495057",
    backgroundColor: "#e9ecef",
    padding: "4px 8px",
    borderRadius: "4px",
  },

  localInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  uf: {
    fontSize: "11px",
    color: "#6c757d",
    fontWeight: "600",
  },

  valor: {
    color: "#007bff",
    fontSize: "14px",
  },

  saldo: {
    fontSize: "14px",
    fontWeight: "600",
  },

  data: {
    fontSize: "13px",
    color: "#495057",
  },

  status: {
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    textAlign: "center",
    minWidth: "60px",
    display: "inline-block",
  },

  actionsContainer: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },

  actionButton: {
    background: "none",
    border: "1px solid #dee2e6",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    minWidth: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonDanger: {
    background: "none",
    border: "1px solid #dc3545",
    color: "#dc3545",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    minWidth: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0 0 8px 0",
  },

  emptyMessage: {
    fontSize: "14px",
    color: "#6c757d",
    maxWidth: "400px",
    lineHeight: 1.5,
    margin: "0 0 24px 0",
  },

  emptyButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};

export default EmendasList;
