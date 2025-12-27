
// src/components/DashboardComponents/DashboardAlertasDetalhados.jsx
// 🚨 Alertas Detalhados - Lista de 3-5 Emendas Críticas

import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardAlertasDetalhados = ({ emendas = [], onVerDetalhes }) => {
  const navigate = useNavigate();

  // Calcular emendas críticas
  const calcularAlertas = () => {
    const hoje = new Date();

    const emendasProximasVencer = emendas
      .filter((e) => {
        const validade = e.dataValidade ? new Date(e.dataValidade) : null;
        if (!validade) return false;

        const diasRestantes = Math.ceil(
          (validade - hoje) / (1000 * 60 * 60 * 24)
        );
        return (
          diasRestantes > 0 &&
          diasRestantes <= 30 &&
          e.percentualExecutado < 80
        );
      })
      .sort((a, b) => {
        const diasA = Math.ceil(
          (new Date(a.dataValidade) - hoje) / (1000 * 60 * 60 * 24)
        );
        const diasB = Math.ceil(
          (new Date(b.dataValidade) - hoje) / (1000 * 60 * 60 * 24)
        );
        return diasA - diasB;
      })
      .slice(0, 3);

    const emendasVencidas = emendas
      .filter((e) => {
        const validade = e.dataValidade ? new Date(e.dataValidade) : null;
        return validade && validade < hoje && e.percentualExecutado < 100;
      })
      .sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade))
      .slice(0, 3);

    const emendasSemExecucao = emendas
      .filter((e) => {
        if (!e.criadaEm) return false;
        const diasDesdeRegistro = Math.ceil(
          (hoje - new Date(e.criadaEm.seconds * 1000)) / (1000 * 60 * 60 * 24)
        );
        return diasDesdeRegistro >= 60 && e.percentualExecutado === 0;
      })
      .slice(0, 2);

    return {
      proximasVencer: emendasProximasVencer,
      vencidas: emendasVencidas,
      semExecucao: emendasSemExecucao,
      total:
        emendasProximasVencer.length +
        emendasVencidas.length +
        emendasSemExecucao.length,
    };
  };

  const alertas = calcularAlertas();

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  const getDiasRestantes = (dataValidade) => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
    return dias;
  };

  if (alertas.total === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.headerSuccess}>
          <div style={styles.headerIcon}>✅</div>
          <div>
            <h2 style={styles.titleSuccess}>Sem Alertas Críticos</h2>
            <p style={styles.subtitleSuccess}>
              Todas as emendas estão dentro dos prazos e com boa execução
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>🚨</div>
        <div style={styles.headerContent}>
          <h2 style={styles.title}>Requer Atenção Imediata</h2>
          <p style={styles.subtitle}>
            {alertas.total} {alertas.total === 1 ? "emenda crítica" : "emendas críticas"} identificadas
          </p>
        </div>
        <button onClick={onVerDetalhes} style={styles.verDetalhesButton}>
          Ver Todas as Emendas →
        </button>
      </div>

      <div style={styles.alertsList}>
        {/* PRÓXIMAS AO VENCIMENTO */}
        {alertas.proximasVencer.length > 0 && (
          <div style={styles.alertaCategoria}>
            <div style={styles.categoriaHeader}>
              <span style={styles.categoriaIcon}>⚠️</span>
              <h3 style={styles.categoriaTitle}>
                Próximas ao Vencimento ({alertas.proximasVencer.length})
              </h3>
            </div>
            {alertas.proximasVencer.map((emenda) => {
              const diasRestantes = getDiasRestantes(emenda.dataValidade);
              return (
                <div
                  key={emenda.id}
                  style={styles.alertaItem}
                  onClick={() => navigate("/emendas")}
                >
                  <div style={styles.itemHeader}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemNumero}>
                        {emenda.numero || "S/N"}
                      </span>
                      <span style={styles.itemParlamentar}>
                        {emenda.parlamentar || "Não informado"}
                      </span>
                      <span style={styles.itemLocal}>
                        {emenda.municipio}/{emenda.uf}
                      </span>
                    </div>
                    <div
                      style={{
                        ...styles.itemBadge,
                        backgroundColor:
                          diasRestantes <= 7 ? "#EF4444" : "#F59E0B",
                      }}
                    >
                      {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}
                    </div>
                  </div>
                  <div style={styles.itemMetrics}>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Execução:</span>
                      <span
                        style={{
                          ...styles.metricValue,
                          color:
                            emenda.percentualExecutado >= 50
                              ? "#10B981"
                              : "#EF4444",
                        }}
                      >
                        {emenda.percentualExecutado.toFixed(1)}%
                      </span>
                    </div>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Saldo:</span>
                      <span style={styles.metricValue}>
                        {formatCurrency(emenda.saldoDisponivel)}
                      </span>
                    </div>
                  </div>
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(emenda.percentualExecutado, 100)}%`,
                          backgroundColor:
                            emenda.percentualExecutado >= 50
                              ? "#10B981"
                              : "#EF4444",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VENCIDAS */}
        {alertas.vencidas.length > 0 && (
          <div style={styles.alertaCategoria}>
            <div style={styles.categoriaHeader}>
              <span style={styles.categoriaIcon}>🔴</span>
              <h3 style={styles.categoriaTitle}>
                Vencidas ({alertas.vencidas.length})
              </h3>
            </div>
            {alertas.vencidas.map((emenda) => {
              const diasVencidos = Math.abs(getDiasRestantes(emenda.dataValidade));
              return (
                <div
                  key={emenda.id}
                  style={styles.alertaItem}
                  onClick={() => navigate("/emendas")}
                >
                  <div style={styles.itemHeader}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemNumero}>
                        {emenda.numero || "S/N"}
                      </span>
                      <span style={styles.itemParlamentar}>
                        {emenda.parlamentar || "Não informado"}
                      </span>
                      <span style={styles.itemLocal}>
                        {emenda.municipio}/{emenda.uf}
                      </span>
                    </div>
                    <div
                      style={{
                        ...styles.itemBadge,
                        backgroundColor: "#EF4444",
                      }}
                    >
                      Vencida há {diasVencidos} {diasVencidos === 1 ? "dia" : "dias"}
                    </div>
                  </div>
                  <div style={styles.itemMetrics}>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Execução:</span>
                      <span
                        style={{ ...styles.metricValue, color: "#EF4444" }}
                      >
                        {emenda.percentualExecutado.toFixed(1)}%
                      </span>
                    </div>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Não executado:</span>
                      <span style={{ ...styles.metricValue, color: "#EF4444" }}>
                        {formatCurrency(emenda.saldoDisponivel)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SEM EXECUÇÃO HÁ MAIS DE 60 DIAS */}
        {alertas.semExecucao.length > 0 && (
          <div style={styles.alertaCategoria}>
            <div style={styles.categoriaHeader}>
              <span style={styles.categoriaIcon}>⏸️</span>
              <h3 style={styles.categoriaTitle}>
                Sem Execução ({alertas.semExecucao.length})
              </h3>
            </div>
            {alertas.semExecucao.map((emenda) => {
              const diasDesdeRegistro = Math.ceil(
                (new Date() - new Date(emenda.criadaEm.seconds * 1000)) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={emenda.id}
                  style={styles.alertaItem}
                  onClick={() => navigate("/emendas")}
                >
                  <div style={styles.itemHeader}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemNumero}>
                        {emenda.numero || "S/N"}
                      </span>
                      <span style={styles.itemParlamentar}>
                        {emenda.parlamentar || "Não informado"}
                      </span>
                      <span style={styles.itemLocal}>
                        {emenda.municipio}/{emenda.uf}
                      </span>
                    </div>
                    <div
                      style={{
                        ...styles.itemBadge,
                        backgroundColor: "#6c757d",
                      }}
                    >
                      {diasDesdeRegistro} dias sem execução
                    </div>
                  </div>
                  <div style={styles.itemMetrics}>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Valor total:</span>
                      <span style={styles.metricValue}>
                        {formatCurrency(
                          emenda.valorRecurso || emenda.valor || 0
                        )}
                      </span>
                    </div>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Despesas:</span>
                      <span style={{ ...styles.metricValue, color: "#EF4444" }}>
                        0
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
    border: "2px solid #EF4444",
    marginBottom: "24px",
    transition: "background-color 0.3s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid var(--theme-border-light)",
    flexWrap: "wrap",
  },
  headerSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    fontSize: "48px",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#EF4444",
  },
  titleSuccess: {
    margin: "0 0 4px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#10B981",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "var(--theme-text-secondary)",
  },
  subtitleSuccess: {
    margin: 0,
    fontSize: "14px",
    color: "var(--theme-text-secondary)",
  },
  verDetalhesButton: {
    backgroundColor: "var(--primary, #1A3A4A)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  alertsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  alertaCategoria: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  categoriaHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  categoriaIcon: {
    fontSize: "20px",
  },
  categoriaTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },
  alertaItem: {
    backgroundColor: "var(--theme-surface-hover)",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid var(--theme-border)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    gap: "12px",
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  itemNumero: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--primary, #1A3A4A)",
  },
  itemParlamentar: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--theme-text-secondary)",
  },
  itemLocal: {
    fontSize: "12px",
    color: "var(--theme-text-muted)",
  },
  itemBadge: {
    padding: "6px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    whiteSpace: "nowrap",
  },
  itemMetrics: {
    display: "flex",
    gap: "20px",
    marginBottom: "8px",
  },
  metricItem: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: "12px",
    color: "var(--theme-text-muted)",
  },
  metricValue: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },
  progressContainer: {
    marginTop: "4px",
  },
  progressBar: {
    height: "6px",
    backgroundColor: "var(--theme-border)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
};

export default DashboardAlertasDetalhados;
