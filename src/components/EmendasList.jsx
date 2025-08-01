// EmendasList.jsx - ORIGINAL CORRIGIDO
// ✅ Problemas corrigidos: Emenda ID → Número, Data de validade, Valor total, Filtros expansíveis

import React, { useState, useEffect } from "react";
import useEmendaDespesa from "../hooks/useEmendaDespesa";

const EmendasList = ({
  usuario,
  onNovaEmenda,
  onEditarEmenda,
  onVisualizarEmenda,
  onAbrirEmenda,
  onExcluirEmenda,
  onVerDespesas,
}) => {
  // ✅ HOOK INTEGRADO - useEmendaDespesa para dados em tempo real
  const {
    emendas: emendasComMetricas,
    loading: hookLoading,
    error: hookError,
    obterEstatisticasGerais,
    filtrarEmendas,
    recarregar,
  } = useEmendaDespesa(usuario, {
    carregarTodasEmendas: true,
    incluirEstatisticas: true,
    autoRefresh: true,
    userRole: usuario?.role || usuario?.tipo || "operador",
  });

  const [filtros, setFiltros] = useState({
    busca: "",
    parlamentar: "",
    tipo: "",
    status: "",
    statusFinanceiro: "",
  });

  const [emendasFiltradas, setEmendasFiltradas] = useState([]);
  const [estatisticasGerais, setEstatisticasGerais] = useState(null);
  const [showFiltros, setShowFiltros] = useState(false); // ✅ NOVO - Mostrar/ocultar filtros

  // ✅ EFEITO: Atualizar emendas filtradas quando dados mudarem
  useEffect(() => {
    if (emendasComMetricas.length > 0) {
      const filtradas = filtrarEmendas(filtros);
      setEmendasFiltradas(filtradas);

      // Calcular estatísticas gerais
      const stats = obterEstatisticasGerais();
      setEstatisticasGerais(stats);
    }
  }, [emendasComMetricas, filtros, filtrarEmendas, obterEstatisticasGerais]);

  // ✅ FUNÇÃO: Formatar moeda (CORRIGIDA)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ FUNÇÃO: Formatar data (CORRIGIDA)
  const formatDate = (dateString) => {
    if (!dateString) return "Não informado";

    try {
      let dataObj;

      // Se for timestamp do Firebase
      if (dateString.toDate) {
        dataObj = dateString.toDate();
      }
      // Se for string ISO
      else if (typeof dateString === "string") {
        dataObj = new Date(dateString);
      }
      // Se já for Date
      else if (dateString instanceof Date) {
        dataObj = dateString;
      } else {
        return "Data inválida";
      }

      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) {
        return "Data inválida";
      }

      return dataObj.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  // ✅ FUNÇÃO: Determinar status da emenda (MELHORADA com novos critérios)
  const getEmendaStatus = (emenda) => {
    const validade = emenda.validade || emenda.dataValidada;
    const saldo = emenda.saldoDisponivel || emenda.saldo || 0;

    if (validade && new Date(validade) < new Date()) {
      return { text: "Vencida", color: "#dc3545", icon: "🚨" };
    } else if (saldo <= 0) {
      return { text: "Esgotada", color: "#ffc107", icon: "⚠️" };
    } else if (saldo < (emenda.valorTotal || emenda.valorRecurso || 0) * 0.1) {
      // Menos de 10%
      return { text: "Saldo Baixo", color: "#fd7e14", icon: "⚡" };
    } else {
      return { text: "Ativa", color: "#28a745", icon: "✅" };
    }
  };

  // ✅ FUNÇÃO: Handler para botão abrir (mantém existente)
  const handleAbrirEmenda = (emenda) => {
    if (onAbrirEmenda && typeof onAbrirEmenda === "function") {
      onAbrirEmenda(emenda);
    } else if (onVisualizarEmenda && typeof onVisualizarEmenda === "function") {
      onVisualizarEmenda(emenda);
    } else {
      console.warn("Nenhum handler válido encontrado para abrir emenda");
    }
  };

  // ✅ NOVA FUNÇÃO: Handler para ver despesas de uma emenda
  const handleVerDespesas = (emenda) => {
    if (onVerDespesas && typeof onVerDespesas === "function") {
      onVerDespesas(emenda);
    } else {
      console.log(`Ver despesas da emenda: ${emenda.numero}`);
    }
  };

  // ✅ FUNÇÃO: Handler para filtros (ATUALIZADA)
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ✅ FUNÇÃO: Limpar filtros (ATUALIZADA)
  const limparFiltros = () => {
    setFiltros({
      busca: "",
      parlamentar: "",
      tipo: "",
      status: "",
      statusFinanceiro: "",
    });
  };

  // Parlamentares únicos para filtro
  const parlamentaresUnicos = [
    ...new Set(emendasComMetricas.map((e) => e.parlamentar)),
  ]
    .filter(Boolean)
    .sort();

  // Tipos únicos para filtro
  const tiposUnicos = [...new Set(emendasComMetricas.map((e) => e.tipo))]
    .filter(Boolean)
    .sort();

  // ✅ FUNÇÃO: Renderizar linha da tabela (CORRIGIDA)
  const renderTableRow = (emenda) => {
    const status = getEmendaStatus(emenda);
    const percentualExecutado = emenda.percentualExecutado || 0;
    const totalDespesas = emenda.totalDespesas || 0;

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
            // ✅ CORRIGIDO: Mostrar numeroEmenda ao invés do ID
            emenda.numeroEmenda || emenda.numero || "Não informado",
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
            // ✅ CORRIGIDO: Usar valorRecurso como principal
            formatCurrency(emenda.valorRecurso || emenda.valorTotal),
          ),
        ),
        // ✅ NOVA COLUNA: Valor Executado
        React.createElement(
          "td",
          { key: "executado", style: styles.td },
          React.createElement("div", { style: styles.executadoInfo }, [
            React.createElement(
              "strong",
              {
                key: "valor-executado",
                style: { ...styles.valorExecutado, color: "#007bff" },
              },
              formatCurrency(emenda.valorExecutado || 0),
            ),
            React.createElement(
              "small",
              {
                key: "percentual",
                style: styles.percentualExecutado,
              },
              `${percentualExecutado.toFixed(1)}%`,
            ),
          ]),
        ),
        React.createElement(
          "td",
          { key: "saldo", style: styles.td },
          React.createElement(
            "strong",
            {
              style: {
                ...styles.saldo,
                color:
                  (emenda.saldoDisponivel || emenda.saldo || 0) > 0
                    ? "#28a745"
                    : "#dc3545",
              },
            },
            formatCurrency(emenda.saldoDisponivel || emenda.saldo),
          ),
        ),
        // ✅ NOVA COLUNA: Despesas Vinculadas
        React.createElement(
          "td",
          { key: "despesas", style: styles.td },
          React.createElement("div", { style: styles.despesasInfo }, [
            React.createElement(
              "span",
              { key: "count", style: styles.despesasCount },
              totalDespesas,
            ),
            React.createElement(
              "small",
              { key: "label", style: styles.despesasLabel },
              totalDespesas === 1 ? "despesa" : "despesas",
            ),
          ]),
        ),
        React.createElement(
          "td",
          { key: "validade", style: styles.td },
          React.createElement(
            "span",
            { style: styles.data },
            // ✅ CORRIGIDO: Formatar data corretamente
            formatDate(emenda.dataValidada || emenda.validade),
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
            `${status.icon} ${status.text}`,
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
            // ✅ NOVO BOTÃO: Ver Despesas
            React.createElement(
              "button",
              {
                key: "despesas",
                onClick: () => handleVerDespesas(emenda),
                style: {
                  ...styles.actionButton,
                  ...styles.actionButtonDespesas,
                },
                title: "Ver despesas vinculadas",
              },
              "💸",
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

  // ✅ LOADING do hook
  if (hookLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Carregando emendas com métricas financeiras...</p>
      </div>
    );
  }

  // ✅ ERROR do hook
  if (hookError) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>❌</div>
        <h3 style={styles.errorTitle}>Erro ao carregar dados</h3>
        <p style={styles.errorMessage}>{hookError}</p>
        <button onClick={recarregar} style={styles.retryButton}>
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ✅ NOVA SEÇÃO: Estatísticas Gerais */}
      {estatisticasGerais && (
        <div style={styles.statsSection}>
          <h3 style={styles.statsTitle}>📊 Resumo Financeiro</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {estatisticasGerais.totalEmendas}
              </span>
              <span style={styles.statLabel}>Emendas</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {formatCurrency(estatisticasGerais.valorTotalGeral)}
              </span>
              <span style={styles.statLabel}>Valor Total</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {formatCurrency(estatisticasGerais.valorExecutadoGeral)}
              </span>
              <span style={styles.statLabel}>Executado</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {formatCurrency(estatisticasGerais.saldoDisponivelGeral)}
              </span>
              <span style={styles.statLabel}>Saldo Disponível</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {estatisticasGerais.percentualGeralExecutado.toFixed(1)}%
              </span>
              <span style={styles.statLabel}>% Executado</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {estatisticasGerais.emendasComSaldo}
              </span>
              <span style={styles.statLabel}>Com Saldo</span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FILTROS - ATUALIZADOS com toggle show/hide */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>🔍 Filtros de Pesquisa</h3>
          <div style={styles.filtersButtons}>
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              style={styles.toggleButton}
            >
              {showFiltros ? "🔼 Ocultar Filtros" : "🔽 Mostrar Filtros"}
            </button>
            {showFiltros && (
              <button onClick={limparFiltros} style={styles.clearButton}>
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
              onChange={(e) => handleFiltroChange("busca", e.target.value)}
              style={styles.searchInput}
            />

            <select
              value={filtros.parlamentar}
              onChange={(e) =>
                handleFiltroChange("parlamentar", e.target.value)
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
              onChange={(e) => handleFiltroChange("tipo", e.target.value)}
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
              onChange={(e) => handleFiltroChange("status", e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Todos os status</option>
              <option value="ativa">Ativas</option>
              <option value="esgotada">Esgotadas</option>
              <option value="vencida">Vencidas</option>
            </select>

            {/* ✅ NOVO FILTRO: Status Financeiro */}
            <select
              value={filtros.statusFinanceiro}
              onChange={(e) =>
                handleFiltroChange("statusFinanceiro", e.target.value)
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

      {/* Resumo - ATUALIZADO */}
      <div style={styles.summary}>
        <span style={styles.summaryText}>
          Exibindo <strong>{emendasFiltradas.length}</strong> de{" "}
          <strong>{emendasComMetricas.length}</strong> emendas
        </span>
        {(filtros.busca ||
          filtros.parlamentar ||
          filtros.tipo ||
          filtros.status ||
          filtros.statusFinanceiro) && (
          <span style={styles.filtersBadge}>Filtros ativos</span>
        )}
      </div>

      {/* Tabela - ATUALIZADA com novas colunas */}
      <div style={styles.tableContainer}>
        {emendasFiltradas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📋</span>
            <h3 style={styles.emptyTitle}>
              {emendasComMetricas.length === 0
                ? "Nenhuma emenda cadastrada"
                : "Nenhuma emenda encontrada"}
            </h3>
            <p style={styles.emptyMessage}>
              {emendasComMetricas.length === 0
                ? 'Clique em "Nova Emenda" para cadastrar a primeira emenda.'
                : "Tente ajustar os filtros para encontrar o que procura."}
            </p>
            {emendasComMetricas.length === 0 && (
              <button onClick={onNovaEmenda} style={styles.emptyButton}>
                ➕ Nova Emenda
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            {/* ✅ Tabela criada programaticamente com correções */}
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
                    "Emenda", // ✅ CORRIGIDO: Mostra numeroEmenda
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
                    "Valor Total", // ✅ CORRIGIDO: Mostra valorRecurso
                  ),
                  // ✅ NOVA COLUNA: Valor Executado
                  React.createElement(
                    "th",
                    { key: "th-executado", style: styles.th },
                    "Executado",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-saldo", style: styles.th },
                    "Saldo",
                  ),
                  // ✅ NOVA COLUNA: Despesas
                  React.createElement(
                    "th",
                    { key: "th-despesas", style: styles.th },
                    "Despesas",
                  ),
                  React.createElement(
                    "th",
                    { key: "th-validade", style: styles.th },
                    "Válido até", // ✅ CORRIGIDO: Formata data corretamente
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

// ✅ ESTILOS ATUALIZADOS com novos elementos
const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  // ✅ NOVOS ESTILOS: Seção de estatísticas
  statsSection: {
    padding: "20px 24px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
  },

  statsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0 0 16px 0",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },

  statCard: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  statValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2c3e50",
  },

  statLabel: {
    fontSize: "12px",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // ✅ ESTILOS ATUALIZADOS para filtros
  filtersSection: {
    padding: "24px",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },

  filtersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: showFiltros ? "16px" : "0",
  },

  filtersTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
  },

  filtersButtons: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  // ✅ NOVO ESTILO: Botão de toggle
  toggleButton: {
    backgroundColor: "transparent",
    color: "#4A90E2",
    border: "1px solid #4A90E2",
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

  // ✅ NOVOS ESTILOS: Para valor executado
  executadoInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  valorExecutado: {
    fontSize: "14px",
    fontWeight: "600",
  },

  percentualExecutado: {
    fontSize: "11px",
    color: "#6c757d",
    fontWeight: "500",
  },

  saldo: {
    fontSize: "14px",
    fontWeight: "600",
  },

  // ✅ NOVOS ESTILOS: Para despesas vinculadas
  despesasInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },

  despesasCount: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#28a745",
  },

  despesasLabel: {
    fontSize: "11px",
    color: "#6c757d",
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

  // ✅ NOVO ESTILO: Botão de despesas
  actionButtonDespesas: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
    color: "white",
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

  // ✅ NOVOS ESTILOS: Loading e Error
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
  },

  loadingSpinner: {
    width: 40,
    height: 40,
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 16,
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
  },

  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  errorTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#dc3545",
    margin: "0 0 8px 0",
  },

  errorMessage: {
    fontSize: "14px",
    color: "#6c757d",
    margin: "0 0 24px 0",
  },

  retryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default EmendasList;
