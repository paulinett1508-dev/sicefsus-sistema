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
    const medalhas = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    return medalhas[posicao] || "📊";
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
              <span style={styles.itemMedalha}>{getMedalha(index)}</span>
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
            {visualizacao === "top"
              ? "🏆 Top Performers"
              : "⚠️ Precisam Atenção"}
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
            🏆 Top 5
          </button>
          <button
            style={{
              ...styles.toggleButton,
              ...(visualizacao === "bottom" ? styles.toggleButtonActive : {}),
            }}
            onClick={() => setVisualizacao("bottom")}
          >
            ⚠️ Bottom 5
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
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e9ecef",
    marginBottom: "16px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #f1f3f4",
    paddingBottom: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    margin: "0 0 3px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#1E293B",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "13px",
    fontWeight: "400",
  },
  toggleContainer: {
    display: "flex",
    gap: "8px",
    backgroundColor: "#f8f9fa",
    padding: "4px",
    borderRadius: "6px",
  },
  toggleButton: {
    backgroundColor: "transparent",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6c757d",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  toggleButtonActive: {
    backgroundColor: "white",
    color: "#2563EB",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  item: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  itemRank: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "50px",
  },
  itemMedalha: {
    fontSize: "24px",
  },
  itemPosicao: {
    fontSize: "11px",
    color: "#6c757d",
    fontWeight: "600",
    marginTop: "2px",
  },
  itemConteudo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemNumero: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2563EB",
  },
  itemPercentual: {
    fontSize: "18px",
    fontWeight: "700",
  },
  itemInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#495057",
  },
  itemParlamentar: {
    fontWeight: "500",
  },
  itemDivider: {
    color: "#dee2e6",
  },
  itemLocal: {
    color: "#6c757d",
  },
  itemValores: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
  },
  itemValorLabel: {
    color: "#6c757d",
  },
  itemValorExecutado: {
    color: "#10B981",
    fontWeight: "600",
  },
  itemValorDivider: {
    color: "#6c757d",
  },
  itemValorTotal: {
    color: "#495057",
    fontWeight: "600",
  },
  itemProgress: {
    marginTop: "4px",
  },
  progressBar: {
    height: "6px",
    backgroundColor: "#e9ecef",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
  },
  emptyText: {
    color: "#6c757d",
    fontStyle: "italic",
    margin: 0,
  },
};

export default DashboardRankings;
