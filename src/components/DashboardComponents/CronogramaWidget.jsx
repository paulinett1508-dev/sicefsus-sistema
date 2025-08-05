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
              <span
                style={{ ...cronogramaStyles.metricIcon, color: "#f57c00" }}
              >
                ⚠️
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
              <span
                style={{ ...cronogramaStyles.metricIcon, color: "#d32f2f" }}
              >
                ❌
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
                      backgroundColor: "#d32f2f",
                      color: "white",
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
              <span
                style={{ ...cronogramaStyles.metricIcon, color: "#388e3c" }}
              >
                🚀
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
              <span
                style={{ ...cronogramaStyles.metricIcon, color: "#0277bd" }}
              >
                ✅
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
                      backgroundColor: "#388e3c",
                      color: "white",
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
                  ? "#d32f2f"
                  : "#388e3c",
            }}
          >
            {cronogramaData.proximasVencer.length +
              cronogramaData.vencidas.length}
          </span>
          <span style={cronogramaStyles.summaryLabel}>Atenção</span>
        </div>
        <div style={cronogramaStyles.summaryItem}>
          <span style={{ ...cronogramaStyles.summaryValue, color: "#0277bd" }}>
            {cronogramaData.emAndamento.length}
          </span>
          <span style={cronogramaStyles.summaryLabel}>Ativas</span>
        </div>
      </div>
    </div>
  );
};

// 🎨 ESTILOS DO CRONOGRAMA
const cronogramaStyles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e9ecef",
    marginBottom: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: "20px",
    borderBottom: "1px solid #f1f3f4",
    paddingBottom: "12px",
  },
  title: {
    margin: "0 0 3px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "13px",
    fontWeight: "400",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  metricCard: {
    padding: "16px",
    borderRadius: "6px",
    border: "1px solid #e1e5e9",
    backgroundColor: "#fff",
    transition: "all 0.2s ease",
  },
  warningCard: {
    borderColor: "#f57c00",
    backgroundColor: "#fffbf0",
  },
  dangerCard: {
    borderColor: "#d32f2f",
    backgroundColor: "#fef2f2",
  },
  successCard: {
    borderColor: "#388e3c",
    backgroundColor: "#f8fff8",
  },
  infoCard: {
    borderColor: "#0277bd",
    backgroundColor: "#f0f9ff",
  },
  metricHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  iconContainer: {
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  metricIcon: {
    fontSize: "16px",
  },
  metricTitle: {
    margin: "0 0 1px 0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
  },
  metricSubtitle: {
    margin: 0,
    fontSize: "11px",
    color: "#6c757d",
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#212529",
    marginBottom: "12px",
    lineHeight: 1,
  },
  itemsList: {
    maxHeight: "80px",
    overflowY: "auto",
  },
  emendaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #f8f9fa",
    fontSize: "12px",
  },
  emendaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    flex: 1,
    minWidth: 0,
  },
  emendaLocal: {
    color: "#6c757d",
    fontSize: "10px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  diasBadge: {
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: "60px",
  },
  progressBar: {
    width: "30px",
    height: "4px",
    backgroundColor: "#e9ecef",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#388e3c",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#495057",
    minWidth: "22px",
  },
  emptyMessage: {
    fontSize: "11px",
    color: "#6c757d",
    fontStyle: "italic",
    textAlign: "center",
    padding: "8px 0",
  },
  summary: {
    display: "flex",
    justifyContent: "space-around",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #dee2e6",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  summaryLabel: {
    fontSize: "10px",
    color: "#6c757d",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#212529",
  },
};

export default CronogramaWidget;
