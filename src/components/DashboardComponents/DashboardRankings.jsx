// src/components/DashboardComponents/DashboardRankings.jsx
// 🏆 Rankings de Emendas (Top e Bottom Performers)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardRankings = ({ emendas = [] }) => {
  const navigate = useNavigate();
  const [visualizacao, setVisualizacao] = useState("top"); // 'top' ou 'bottom'

  // Calcular rankings
  const calcularRankings = () => {
    // Filtrar apenas emendas com alguma execução
    const emendasComExecucao = emendas.filter((e) => {
      const percentual = e.percentualExecutado || 0;
      return percentual > 0;
    });

    // Top 5 - Maiores percentuais de execução
    const top5 = [...emendasComExecucao]
      .sort((a, b) => b.percentualExecutado - a.percentualExecutado)
      .slice(0, 5);

    // Bottom 5 - Menores percentuais (que precisam atenção)
    const bottom5 = [...emendasComExecucao]
      .sort((a, b) => a.percentualExecutado - b.percentualExecutado)
      .slice(0, 5);

    return { top5, bottom5 };
  };

  const { top5, bottom5 } = calcularRankings();

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  const getMedalha = (posicao) => {
    // Retorna ícone e cor baseado na posição
    const configs = [
      { icon: "workspace_premium", color: "#FFD700" }, // Ouro
      { icon: "workspace_premium", color: "#C0C0C0" }, // Prata
      { icon: "workspace_premium", color: "#CD7F32" }, // Bronze
      { icon: "format_list_numbered", color: "#6B7280" },
      { icon: "format_list_numbered", color: "#6B7280" },
    ];
    return configs[posicao] || { icon: "analytics", color: "#6B7280" };
  };

  const getPercentualColor = (percentual, isTop) => {
    if (isTop) {
      if (percentual >= 90) return "#10B981";
      if (percentual >= 70) return "#2ECC71";
      return "#3498DB";
    } else {
      if (percentual < 30) return "#EF4444";
      if (percentual < 50) return "#E67E22";
      return "#F59E0B";
    }
  };

  const renderLista = (lista, isTop) => {
    if (lista.length === 0) {
      return (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>
            {isTop
              ? "Nenhuma emenda com execução"
              : "Todas as emendas estão bem"}
          </p>
        </div>
      );
    }

    return (
      <div style={styles.lista}>
        {lista.map((emenda, index) => (
          <div
            key={emenda.id}
            style={styles.item}
            onClick={() => navigate("/emendas")}
          >
            <div style={styles.itemRank}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: getMedalha(index).color }}>
                {getMedalha(index).icon}
              </span>
              <span style={styles.itemPosicao}>#{index + 1}</span>
            </div>

            <div style={styles.itemConteudo}>
              <div style={styles.itemHeader}>
                <span style={styles.itemNumero}>{emenda.numero || "S/N"}</span>
                <span
                  style={{
                    ...styles.itemPercentual,
                    color: getPercentualColor(
                      emenda.percentualExecutado,
                      isTop,
                    ),
                  }}
                >
                  {emenda.percentualExecutado.toFixed(1)}%
                </span>
              </div>

              <div style={styles.itemInfo}>
                <span style={styles.itemParlamentar}>
                  {emenda.parlamentar || emenda.autor || "N/A"}
                </span>
                <span style={styles.itemDivider}>•</span>
                <span style={styles.itemLocal}>
                  {emenda.municipio}/{emenda.uf}
                </span>
              </div>

              <div style={styles.itemValores}>
                <span style={styles.itemValorLabel}>Executado:</span>
                <span style={styles.itemValorExecutado}>
                  {formatCurrency(emenda.valorExecutado)}
                </span>
                <span style={styles.itemValorDivider}>de</span>
                <span style={styles.itemValorTotal}>
                  {formatCurrency(emenda.valorRecurso || emenda.valor)}
                </span>
              </div>

              <div style={styles.itemProgress}>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min(emenda.percentualExecutado, 100)}%`,
                      backgroundColor: getPercentualColor(
                        emenda.percentualExecutado,
                        isTop,
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>
              {visualizacao === "top" ? "emoji_events" : "warning"}
            </span>
            {visualizacao === "top" ? "Top Performers" : "Precisam Atenção"}
          </h3>
          <span style={styles.subtitle}>
            {visualizacao === "top"
              ? "Emendas com melhor execução"
              : "Emendas com baixa execução"}
          </span>
        </div>

        <div style={styles.toggleContainer}>
          <button
            style={{
              ...styles.toggleButton,
              ...(visualizacao === "top" ? styles.toggleButtonActive : {}),
            }}
            onClick={() => setVisualizacao("top")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>emoji_events</span> Top 5
          </button>
          <button
            style={{
              ...styles.toggleButton,
              ...(visualizacao === "bottom" ? styles.toggleButtonActive : {}),
            }}
            onClick={() => setVisualizacao("bottom")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span> Bottom 5
          </button>
        </div>
      </div>

      {renderLista(
        visualizacao === "top" ? top5 : bottom5,
        visualizacao === "top",
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--theme-border)",
    marginBottom: "12px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    borderBottom: "1px solid var(--theme-border-light)",
    paddingBottom: "8px",
    flexWrap: "wrap",
    gap: "8px",
  },
  title: {
    margin: "0 0 2px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },
  subtitle: {
    color: "var(--theme-text-secondary)",
    fontSize: "11px",
    fontWeight: "400",
  },
  toggleContainer: {
    display: "flex",
    gap: "4px",
    backgroundColor: "var(--theme-surface-hover)",
    padding: "3px",
    borderRadius: "5px",
  },
  toggleButton: {
    backgroundColor: "transparent",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--theme-text-muted)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  toggleButtonActive: {
    backgroundColor: "var(--theme-surface)",
    color: "var(--primary)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  item: {
    display: "flex",
    gap: "8px",
    padding: "8px",
    backgroundColor: "var(--theme-surface-hover)",
    borderRadius: "6px",
    border: "1px solid var(--theme-border)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  itemRank: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px",
  },
  itemMedalha: {
    fontSize: "18px",
  },
  itemPosicao: {
    fontSize: "9px",
    color: "var(--theme-text-muted)",
    fontWeight: "600",
    marginTop: "1px",
  },
  itemConteudo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemNumero: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--primary)",
  },
  itemPercentual: {
    fontSize: "14px",
    fontWeight: "700",
  },
  itemInfo: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "10px",
    color: "var(--theme-text-secondary)",
  },
  itemParlamentar: {
    fontWeight: "500",
  },
  itemDivider: {
    color: "var(--theme-border)",
  },
  itemLocal: {
    color: "var(--theme-text-muted)",
  },
  itemValores: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "10px",
  },
  itemValorLabel: {
    color: "var(--theme-text-muted)",
  },
  itemValorExecutado: {
    color: "#10B981",
    fontWeight: "600",
  },
  itemValorDivider: {
    color: "var(--theme-text-muted)",
  },
  itemValorTotal: {
    color: "var(--theme-text-secondary)",
    fontWeight: "600",
  },
  itemProgress: {
    marginTop: "2px",
  },
  progressBar: {
    height: "4px",
    backgroundColor: "var(--theme-border)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "24px",
  },
  emptyText: {
    color: "var(--theme-text-muted)",
    fontStyle: "italic",
    fontSize: "12px",
    margin: 0,
  },
};

export default DashboardRankings;
