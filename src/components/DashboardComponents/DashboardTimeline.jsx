// src/components/DashboardComponents/DashboardTimeline.jsx
// 📅 Timeline de Próximos Eventos (30 dias)

import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardTimeline = ({ emendas = [] }) => {
  const navigate = useNavigate();

  // Calcular próximos eventos
  const calcularProximosEventos = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const eventos = [];

    emendas.forEach((emenda) => {
      const dataValidade = emenda.dataValidade
        ? new Date(emenda.dataValidade)
        : null;

      if (!dataValidade) return;

      const diffTime = dataValidade - hoje;
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Apenas eventos nos próximos 30 dias
      if (diasRestantes >= 0 && diasRestantes <= 30) {
        eventos.push({
          tipo: "vencimento",
          data: dataValidade,
          diasRestantes,
          titulo: `Vencimento: ${emenda.numero || "Emenda"}`,
          descricao: `${emenda.parlamentar || "N/A"} - ${emenda.municipio}/${emenda.uf}`,
          prioridade:
            diasRestantes <= 7
              ? "alta"
              : diasRestantes <= 15
                ? "media"
                : "baixa",
          emendaId: emenda.id,
          percentualExecutado: emenda.percentualExecutado || 0,
        });
      }
    });

    // Ordenar por data
    return eventos.sort((a, b) => a.data - b.data).slice(0, 10);
  };

  const eventos = calcularProximosEventos();

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case "alta":
        return "#EF4444";
      case "media":
        return "#F59E0B";
      case "baixa":
        return "#3498DB";
      default:
        return "#95A5A6";
    }
  };

  const getPrioridadeIcon = (prioridade) => {
    switch (prioridade) {
      case "alta":
        return "🔴";
      case "media":
        return "🟡";
      case "baixa":
        return "🔵";
      default:
        return "⚪";
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getDiasTexto = (dias) => {
    if (dias === 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    return `${dias} dias`;
  };

  if (eventos.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>📅 Próximos 30 Dias</h3>
        </div>
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>✅</span>
          <p style={styles.emptyText}>Nenhum evento próximo</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📅 Próximos 30 Dias</h3>
        <span style={styles.subtitle}>{eventos.length} eventos</span>
      </div>

      <div style={styles.timeline}>
        {eventos.map((evento, index) => (
          <div
            key={`${evento.emendaId}-${evento.diasRestantes}`}
            style={styles.eventoItem}
            onClick={() => navigate("/emendas")}
          >
            <div style={styles.eventoDate}>
              <span style={styles.eventoDay}>
                {formatDate(evento.data).split(" ")[0]}
              </span>
              <span style={styles.eventoMonth}>
                {formatDate(evento.data).split(" ")[1]}
              </span>
            </div>

            <div
              style={{
                ...styles.eventoBadge,
                backgroundColor: getPrioridadeColor(evento.prioridade),
              }}
            >
              <span style={styles.eventoDias}>
                {getDiasTexto(evento.diasRestantes)}
              </span>
            </div>

            <div style={styles.eventoContent}>
              <div style={styles.eventoHeader}>
                <span style={styles.eventoIcon}>
                  {getPrioridadeIcon(evento.prioridade)}
                </span>
                <span style={styles.eventoTitulo}>{evento.titulo}</span>
              </div>
              <span style={styles.eventoDescricao}>{evento.descricao}</span>

              {evento.percentualExecutado < 100 && (
                <div style={styles.eventoProgress}>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${evento.percentualExecutado}%`,
                        backgroundColor:
                          evento.percentualExecutado >= 80
                            ? "#10B981"
                            : evento.percentualExecutado >= 50
                              ? "#F59E0B"
                              : "#EF4444",
                      }}
                    />
                  </div>
                  <span style={styles.progressText}>
                    {evento.percentualExecutado.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
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
  },
  title: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },
  subtitle: {
    color: "var(--theme-text-secondary)",
    fontSize: "11px",
    fontWeight: "400",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "280px",
    overflowY: "auto",
  },
  eventoItem: {
    display: "flex",
    gap: "8px",
    padding: "8px",
    backgroundColor: "var(--theme-surface-hover)",
    borderRadius: "6px",
    border: "1px solid var(--theme-border)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  eventoDate: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "40px",
    padding: "6px",
    backgroundColor: "var(--theme-surface)",
    borderRadius: "5px",
    border: "1px solid var(--theme-border)",
  },
  eventoDay: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--theme-text)",
    lineHeight: 1,
  },
  eventoMonth: {
    fontSize: "9px",
    color: "var(--theme-text-muted)",
    textTransform: "uppercase",
    marginTop: "1px",
  },
  eventoBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3px 6px",
    borderRadius: "10px",
    alignSelf: "flex-start",
    marginTop: "2px",
  },
  eventoDias: {
    fontSize: "9px",
    color: "white",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  eventoContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  eventoHeader: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  eventoIcon: {
    fontSize: "12px",
  },
  eventoTitulo: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },
  eventoDescricao: {
    fontSize: "10px",
    color: "var(--theme-text-secondary)",
  },
  eventoProgress: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "2px",
  },
  progressBar: {
    flex: 1,
    height: "3px",
    backgroundColor: "var(--theme-border)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "9px",
    fontWeight: "600",
    color: "var(--theme-text-secondary)",
    minWidth: "24px",
    textAlign: "right",
  },
  emptyState: {
    textAlign: "center",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  emptyIcon: {
    fontSize: "32px",
  },
  emptyText: {
    color: "var(--theme-text-muted)",
    fontStyle: "italic",
    fontSize: "12px",
    margin: 0,
  },
};

export default DashboardTimeline;
