// src/components/DashboardComponents/DashboardMunicipios.jsx
// 🗺️ Ranking de Municípios (Admin Only)

import React from "react";

const DashboardMunicipios = ({ emendas = [], userRole = "operador" }) => {
  // Não mostrar para operadores
  if (userRole !== "admin") {
    return null;
  }

  // Agrupar por município
  const calcularRankingMunicipios = () => {
    const municipios = {};

    emendas.forEach((emenda) => {
      const chave = `${emenda.municipio}/${emenda.uf}`;
      const valorTotal = parseFloat(emenda.valorRecurso || emenda.valor || 0);
      const valorExecutado = parseFloat(emenda.valorExecutado || 0);

      if (!municipios[chave]) {
        municipios[chave] = {
          municipio: emenda.municipio,
          uf: emenda.uf,
          valorTotal: 0,
          valorExecutado: 0,
          quantidade: 0,
        };
      }

      municipios[chave].valorTotal += valorTotal;
      municipios[chave].valorExecutado += valorExecutado;
      municipios[chave].quantidade += 1;
    });

    // Calcular percentuais e ordenar
    return Object.values(municipios)
      .map((m) => ({
        ...m,
        percentualExecutado:
          m.valorTotal > 0 ? (m.valorExecutado / m.valorTotal) * 100 : 0,
      }))
      .sort((a, b) => b.valorExecutado - a.valorExecutado)
      .slice(0, 10);
  };

  const ranking = calcularRankingMunicipios();

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  const getPosicaoColor = (posicao) => {
    if (posicao === 0) return "#FFD700"; // Ouro
    if (posicao === 1) return "#C0C0C0"; // Prata
    if (posicao === 2) return "#CD7F32"; // Bronze
    return "#3B82F6";
  };

  const getPosicaoEmoji = (posicao) => {
    if (posicao === 0) return "🥇";
    if (posicao === 1) return "🥈";
    if (posicao === 2) return "🥉";
    return "📍";
  };

  if (ranking.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>🗺️ Ranking de Municípios</h3>
        </div>
        <div style={styles.emptyState}>
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>🗺️ Ranking de Municípios</h3>
          <span style={styles.subtitle}>Top 10 por valor executado</span>
        </div>
        <div style={styles.headerBadge}>
          <span style={styles.badgeIcon}>👑</span>
          <span style={styles.badgeText}>Admin Only</span>
        </div>
      </div>

      <div style={styles.rankingLista}>
        {ranking.map((item, index) => (
          <div
            key={`${item.municipio}-${item.uf}`}
            style={{
              ...styles.rankingItem,
              borderLeft: `4px solid ${getPosicaoColor(index)}`,
            }}
          >
            <div style={styles.rankingPosicao}>
              <span style={styles.rankingEmoji}>{getPosicaoEmoji(index)}</span>
              <span style={styles.rankingNumero}>#{index + 1}</span>
            </div>

            <div style={styles.rankingConteudo}>
              <div style={styles.rankingHeader}>
                <span style={styles.rankingMunicipio}>{item.municipio}</span>
                <span style={styles.rankingUf}>{item.uf}</span>
              </div>

              <div style={styles.rankingMetricas}>
                <div style={styles.metricaItem}>
                  <span style={styles.metricaLabel}>Executado:</span>
                  <span style={styles.metricaValor}>
                    {formatCurrency(item.valorExecutado)}
                  </span>
                </div>

                <div style={styles.metricaDivider}>|</div>

                <div style={styles.metricaItem}>
                  <span style={styles.metricaLabel}>Total:</span>
                  <span style={styles.metricaTotal}>
                    {formatCurrency(item.valorTotal)}
                  </span>
                </div>

                <div style={styles.metricaDivider}>|</div>

                <div style={styles.metricaItem}>
                  <span style={styles.metricaLabel}>Emendas:</span>
                  <span style={styles.metricaQuantidade}>
                    {item.quantidade}
                  </span>
                </div>
              </div>

              <div style={styles.rankingProgress}>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min(item.percentualExecutado, 100)}%`,
                      backgroundColor:
                        item.percentualExecutado >= 80
                          ? "#10B981"
                          : item.percentualExecutado >= 50
                            ? "#F59E0B"
                            : "#EF4444",
                    }}
                  />
                </div>
                <span style={styles.progressText}>
                  {item.percentualExecutado.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo Total */}
      <div style={styles.resumoTotal}>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Total Municípios:</span>
          <span style={styles.resumoValor}>{ranking.length}</span>
        </div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Executado (Top 10):</span>
          <span style={styles.resumoValor}>
            {formatCurrency(
              ranking.reduce((sum, m) => sum + m.valorExecutado, 0),
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--theme-border)",
    marginBottom: "16px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid var(--theme-border-light)",
    paddingBottom: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    margin: "0 0 3px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },
  subtitle: {
    color: "var(--theme-text-secondary)",
    fontSize: "13px",
    fontWeight: "400",
  },
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "var(--primary, #1A3A4A)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  badgeIcon: {
    fontSize: "14px",
  },
  badgeText: {
    fontSize: "11px",
  },
  rankingLista: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  rankingItem: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    backgroundColor: "var(--theme-surface-hover)",
    borderRadius: "8px",
    border: "1px solid var(--theme-border)",
    transition: "all 0.2s ease",
  },
  rankingPosicao: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "50px",
  },
  rankingEmoji: {
    fontSize: "28px",
  },
  rankingNumero: {
    fontSize: "11px",
    color: "var(--theme-text-muted)",
    fontWeight: "600",
    marginTop: "2px",
  },
  rankingConteudo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  rankingHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  rankingMunicipio: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--primary, #1A3A4A)",
  },
  rankingUf: {
    fontSize: "13px",
    color: "var(--theme-text-muted)",
    fontWeight: "500",
    backgroundColor: "var(--theme-border)",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  rankingMetricas: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  metricaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  metricaLabel: {
    fontSize: "10px",
    color: "var(--theme-text-muted)",
    textTransform: "uppercase",
  },
  metricaValor: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#10B981",
  },
  metricaTotal: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--theme-text-secondary)",
  },
  metricaQuantidade: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#3B82F6",
  },
  metricaDivider: {
    color: "var(--theme-border)",
    fontSize: "12px",
  },
  rankingProgress: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  progressBar: {
    flex: 1,
    height: "8px",
    backgroundColor: "var(--theme-border)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--theme-text-secondary)",
    minWidth: "40px",
    textAlign: "right",
  },
  resumoTotal: {
    display: "flex",
    justifyContent: "space-around",
    padding: "16px",
    backgroundColor: "var(--theme-surface-hover)",
    borderRadius: "8px",
    border: "1px solid var(--theme-border)",
  },
  resumoItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  resumoLabel: {
    fontSize: "11px",
    color: "var(--theme-text-muted)",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  resumoValor: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--primary, #1A3A4A)",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "var(--theme-text-muted)",
    fontStyle: "italic",
  },
};

export default DashboardMunicipios;
