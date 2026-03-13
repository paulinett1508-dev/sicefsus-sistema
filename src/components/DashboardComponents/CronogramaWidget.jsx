// src/components/DashboardComponents/CronogramaWidget.jsx
// ✅ Extraído do Dashboard principal
// ✅ Preservado: Toda funcionalidade existente

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CronogramaWidget = ({ emendas = [] }) => {
  const navigate = useNavigate();
  const [cronogramaData, setCronogramaData] = useState({
    proximasVencer: [],
    vencidas: [],
    emAndamento: [],
    concluidas: [],
  });

  useEffect(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const processarEmendas = () => {
      const proximasVencer = [];
      const vencidas = [];
      const emAndamento = [];
      const concluidas = [];

      emendas.forEach((emenda) => {
        const dataValidadeStr = emenda.dataValidada || emenda.dataValidade;
        if (!dataValidadeStr) return;

        const dataValidade = new Date(dataValidadeStr);
        const diffTime = dataValidade - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const valorTotal = parseFloat(emenda.valor || emenda.valorRecurso || 0);
        const valorExecutado = parseFloat(emenda.valorExecutado || 0);
        const percentualExecutado =
          valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

        const emendaComDias = {
          ...emenda,
          diasRestantes: diffDays,
          percentualExecutado,
          parlamentar: emenda.autor || emenda.parlamentar || "Não informado",
        };

        if (diffDays < 0) {
          vencidas.push(emendaComDias);
        } else if (diffDays <= 30) {
          proximasVencer.push(emendaComDias);
        } else if (percentualExecutado >= 100) {
          concluidas.push(emendaComDias);
        } else if (percentualExecutado > 0) {
          emAndamento.push(emendaComDias);
        }
      });

      setCronogramaData({
        proximasVencer: proximasVencer.sort(
          (a, b) => a.diasRestantes - b.diasRestantes,
        ),
        vencidas: vencidas.sort((a, b) => b.diasRestantes - a.diasRestantes),
        emAndamento: emAndamento.sort(
          (a, b) => b.percentualExecutado - a.percentualExecutado,
        ),
        concluidas: concluidas.slice(0, 5),
      });
    };

    processarEmendas();
  }, [emendas]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const handleCardClick = (tipo) => {
    navigate("/emendas", {
      state: {
        filtroStatus: tipo,
      },
    });
  };

  return (
    <div style={cronogramaStyles.container}>
      <div style={cronogramaStyles.header}>
        <h3 style={cronogramaStyles.title}>Acompanhamento de Prazos</h3>
        <span style={cronogramaStyles.subtitle}>
          Status das emendas por cronograma de execução
        </span>
      </div>

      <div style={cronogramaStyles.metricsGrid}>
        {/* 📅 PRÓXIMOS 30 DIAS */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.timelineCard,
            cursor: "pointer",
          }}
          onClick={() => handleCardClick("proximasVencer")}
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#1565c0" }}>
                calendar_month
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Próximos 30 Dias</h4>
              <p style={cronogramaStyles.metricSubtitle}>Eventos próximos</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.proximasVencer.length + cronogramaData.vencidas.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.proximasVencer.length === 0 && cronogramaData.vencidas.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#10B981", verticalAlign: "middle", marginRight: 4 }}>
                  check_circle
                </span>
                Nenhum evento próximo
              </div>
            ) : (
              [...cronogramaData.vencidas.slice(0, 1), ...cronogramaData.proximasVencer.slice(0, 2)].map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {emenda.numero || ""} - {emenda.municipio}/{emenda.uf}
                    </span>
                  </div>
                  <span
                    style={{
                      ...cronogramaStyles.diasBadge,
                      backgroundColor: emenda.diasRestantes < 0
                        ? "#d32f2f"
                        : emenda.diasRestantes <= 7
                          ? "#f57c00"
                          : "#1565c0",
                      color: "white",
                    }}
                  >
                    {emenda.diasRestantes < 0
                      ? `-${Math.abs(emenda.diasRestantes)}d`
                      : emenda.diasRestantes === 0
                        ? "Hoje"
                        : `${emenda.diasRestantes}d`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ⚠️ PRÓXIMAS AO VENCIMENTO */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.warningCard,
            cursor: "pointer",
          }}
          onClick={() => handleCardClick("proximasVencer")}
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#f57c00" }}>
                warning
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>
                Próximas ao Vencimento
              </h4>
              <p style={cronogramaStyles.metricSubtitle}>≤ 30 dias</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.proximasVencer.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.proximasVencer.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                Nenhuma emenda próxima ao vencimento
              </div>
            ) : (
              cronogramaData.proximasVencer.slice(0, 2).map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {emenda.municipio}/{emenda.uf}
                    </span>
                  </div>
                  <span
                    style={{
                      ...cronogramaStyles.diasBadge,
                      backgroundColor:
                        emenda.diasRestantes <= 7 ? "#d32f2f" : "#f57c00",
                      color: "white",
                    }}
                  >
                    {emenda.diasRestantes}d
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ❌ VENCIDAS */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.dangerCard,
            cursor: "pointer",
          }}
          onClick={() => handleCardClick("vencidas")}
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#d32f2f" }}>
                cancel
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Vencidas</h4>
              <p style={cronogramaStyles.metricSubtitle}>Prazo expirado</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.vencidas.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.vencidas.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                Nenhuma emenda vencida
              </div>
            ) : (
              cronogramaData.vencidas.slice(0, 2).map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {emenda.municipio}/{emenda.uf}
                    </span>
                  </div>
                  <span
                    style={{
                      ...cronogramaStyles.diasBadge,
                      backgroundColor: "var(--error)",
                      color: "var(--white)",
                    }}
                  >
                    -{Math.abs(emenda.diasRestantes)}d
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🚀 EM ANDAMENTO */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.successCard,
            cursor: "pointer",
          }}
          onClick={() => handleCardClick("emAndamento")}
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--success)" }}>
                rocket_launch
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Em Execução</h4>
              <p style={cronogramaStyles.metricSubtitle}>Dentro do prazo</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.emAndamento.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.emAndamento.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                Nenhuma emenda em execução
              </div>
            ) : (
              cronogramaData.emAndamento.slice(0, 2).map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {formatCurrency(emenda.valor || emenda.valorRecurso)}
                    </span>
                  </div>
                  <div style={cronogramaStyles.progressContainer}>
                    <div style={cronogramaStyles.progressBar}>
                      <div
                        style={{
                          ...cronogramaStyles.progressFill,
                          width: `${Math.min(emenda.percentualExecutado, 100)}%`,
                        }}
                      />
                    </div>
                    <span style={cronogramaStyles.progressText}>
                      {emenda.percentualExecutado.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ CONCLUÍDAS */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.infoCard,
            cursor: "pointer",
          }}
          onClick={() => handleCardClick("concluidas")}
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--info)" }}>
                check_circle
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Concluídas</h4>
              <p style={cronogramaStyles.metricSubtitle}>Execução finalizada</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.concluidas.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.concluidas.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                Nenhuma emenda concluída
              </div>
            ) : (
              cronogramaData.concluidas.slice(0, 2).map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {emenda.municipio}/{emenda.uf}
                    </span>
                  </div>
                  <span
                    style={{
                      ...cronogramaStyles.diasBadge,
                      backgroundColor: "var(--success)",
                      color: "var(--white)",
                    }}
                  >
                    100%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 📊 RESUMO COMPACTO */}
      <div style={cronogramaStyles.summary}>
        <div style={cronogramaStyles.summaryItem}>
          <span style={cronogramaStyles.summaryValue}>{emendas.length}</span>
          <span style={cronogramaStyles.summaryLabel}>Total</span>
        </div>
        <div style={cronogramaStyles.summaryItem}>
          <span
            style={{
              ...cronogramaStyles.summaryValue,
              color:
                cronogramaData.proximasVencer.length +
                  cronogramaData.vencidas.length >
                0
                  ? "var(--error)"
                  : "var(--success)",
            }}
          >
            {cronogramaData.proximasVencer.length +
              cronogramaData.vencidas.length}
          </span>
          <span style={cronogramaStyles.summaryLabel}>Atenção</span>
        </div>
        <div style={cronogramaStyles.summaryItem}>
          <span style={{ ...cronogramaStyles.summaryValue, color: "var(--info)" }}>
            {cronogramaData.emAndamento.length}
          </span>
          <span style={cronogramaStyles.summaryLabel}>Ativas</span>
        </div>
      </div>
    </div>
  );
};

// 🎨 ESTILOS DO CRONOGRAMA (Dark mode compatible)
const cronogramaStyles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--theme-border)",
    marginBottom: "12px",
    fontFamily: "var(--font-family)",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  header: {
    marginBottom: "12px",
    borderBottom: "1px solid var(--theme-border-light)",
    paddingBottom: "8px",
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
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "8px",
    marginBottom: "10px",
  },
  metricCard: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid var(--theme-border)",
    backgroundColor: "var(--theme-surface)",
    transition: "all 0.2s ease",
  },
  warningCard: {
    borderColor: "#f57c00",
    backgroundColor: "rgba(245, 124, 0, 0.08)",
  },
  dangerCard: {
    borderColor: "#d32f2f",
    backgroundColor: "rgba(211, 47, 47, 0.08)",
  },
  successCard: {
    borderColor: "#388e3c",
    backgroundColor: "rgba(56, 142, 60, 0.08)",
  },
  timelineCard: {
    borderColor: "#1565c0",
    backgroundColor: "rgba(21, 101, 192, 0.08)",
  },
  infoCard: {
    borderColor: "#0277bd",
    backgroundColor: "rgba(2, 119, 189, 0.08)",
  },
  metricHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  iconContainer: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "5px",
    backgroundColor: "var(--theme-surface-hover)",
  },
  metricIcon: {
    fontSize: "14px",
  },
  metricTitle: {
    margin: "0 0 1px 0",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },
  metricSubtitle: {
    margin: 0,
    fontSize: "9px",
    color: "var(--theme-text-muted)",
  },
  metricValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--theme-text)",
    marginBottom: "8px",
    lineHeight: 1,
  },
  itemsList: {
    maxHeight: "60px",
    overflowY: "auto",
  },
  emendaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
    borderBottom: "1px solid var(--theme-border-light)",
    fontSize: "10px",
    color: "var(--theme-text)",
  },
  emendaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    flex: 1,
    minWidth: 0,
    color: "var(--theme-text)",
  },
  emendaLocal: {
    color: "var(--theme-text-muted)",
    fontSize: "9px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  diasBadge: {
    padding: "2px 5px",
    borderRadius: "8px",
    fontSize: "9px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    minWidth: "50px",
  },
  progressBar: {
    width: "24px",
    height: "3px",
    backgroundColor: "var(--theme-border)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#388e3c",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "9px",
    fontWeight: "600",
    color: "var(--theme-text-secondary)",
    minWidth: "20px",
  },
  emptyMessage: {
    fontSize: "10px",
    color: "var(--theme-text-muted)",
    fontStyle: "italic",
    textAlign: "center",
    padding: "6px 0",
  },
  summary: {
    display: "flex",
    justifyContent: "space-around",
    padding: "8px",
    backgroundColor: "var(--theme-surface-hover)",
    borderRadius: "6px",
    border: "1px solid var(--theme-border)",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1px",
  },
  summaryLabel: {
    fontSize: "9px",
    color: "var(--theme-text-muted)",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--theme-text)",
  },
};

export default CronogramaWidget;
