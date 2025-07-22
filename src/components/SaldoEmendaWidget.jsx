// SaldoEmendaWidget.jsx - Widget para mostrar saldo da emenda em destaque
// ✅ Usado no DespesaForm para alertar sobre limites
// ✅ Versão COMPLETA sem truncamentos

import React from "react";
import useEmendaDespesa from "../hooks/useEmendaDespesa";

const SaldoEmendaWidget = ({
  emendaId,
  valorDespesaAtual = 0,
  compacto = false,
}) => {
  const { emenda, metricas, loading } = useEmendaDespesa(emendaId, {
    autoRefresh: true,
    incluirEstatisticas: true,
  });

  if (loading || !emenda) {
    return (
      <div style={styles.loading}>
        <span>Carregando informações da emenda...</span>
      </div>
    );
  }

  const valorRecurso = emenda.valorRecurso || 0;
  const valorExecutado = metricas.valorExecutado || 0;
  const saldoAtual = valorRecurso - valorExecutado;
  const saldoAposNovaDespesa = saldoAtual - valorDespesaAtual;
  const percentualExecutado =
    valorRecurso > 0 ? (valorExecutado / valorRecurso) * 100 : 0;
  const percentualAposNovaDespesa =
    valorRecurso > 0
      ? ((valorExecutado + valorDespesaAtual) / valorRecurso) * 100
      : 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const getSaldoStatus = () => {
    if (saldoAposNovaDespesa < 0) {
      return {
        color: "#dc3545",
        bgColor: "#ffe6e6",
        borderColor: "#dc3545",
        icon: "⚠️",
        status: "ATENÇÃO: Valor excede saldo!",
        severity: "error",
      };
    } else if (saldoAposNovaDespesa < valorRecurso * 0.1) {
      return {
        color: "#fd7e14",
        bgColor: "#fff3cd",
        borderColor: "#fd7e14",
        icon: "⚡",
        status: "Saldo baixo",
        severity: "warning",
      };
    } else {
      return {
        color: "#28a745",
        bgColor: "#e6ffe6",
        borderColor: "#28a745",
        icon: "✅",
        status: "Saldo OK",
        severity: "success",
      };
    }
  };

  const saldoStatus = getSaldoStatus();

  if (compacto) {
    return (
      <div
        style={{
          ...styles.widgetCompacto,
          backgroundColor: saldoStatus.bgColor,
          borderColor: saldoStatus.borderColor,
          color: saldoStatus.color,
        }}
      >
        <span style={styles.iconCompacto}>{saldoStatus.icon}</span>
        <div style={styles.contentCompacto}>
          <span style={styles.saldoCompacto}>
            Saldo: {formatCurrency(saldoAtual)}
          </span>
          {valorDespesaAtual > 0 && (
            <span style={styles.previsaoCompacto}>
              → {formatCurrency(saldoAposNovaDespesa)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.widget,
        backgroundColor: saldoStatus.bgColor,
        borderColor: saldoStatus.borderColor,
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <h4 style={styles.title}>💰 Controle de Saldo - {emenda.numero}</h4>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: saldoStatus.color,
            color: "white",
          }}
        >
          {saldoStatus.icon} {saldoStatus.status}
        </span>
      </div>

      {/* Informações da emenda */}
      <div style={styles.emendaInfo}>
        <span>
          <strong>Parlamentar:</strong> {emenda.parlamentar}
        </span>
        <span>
          <strong>Município:</strong> {emenda.municipio}/{emenda.uf}
        </span>
      </div>

      {/* Grid financeiro */}
      <div style={styles.financialGrid}>
        <div style={styles.financialCard}>
          <div style={styles.cardIcon}>💰</div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>{formatCurrency(valorRecurso)}</div>
            <div style={styles.cardLabel}>Valor Total</div>
          </div>
        </div>

        <div style={styles.financialCard}>
          <div style={styles.cardIcon}>📊</div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>{formatCurrency(valorExecutado)}</div>
            <div style={styles.cardLabel}>Já Executado</div>
            <div style={styles.cardSubtext}>
              {percentualExecutado.toFixed(1)}%
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.financialCard,
            backgroundColor: saldoAtual <= 0 ? "#ffe6e6" : "white",
          }}
        >
          <div style={styles.cardIcon}>{saldoAtual > 0 ? "💳" : "⚠️"}</div>
          <div style={styles.cardContent}>
            <div
              style={{
                ...styles.cardValue,
                color: saldoAtual <= 0 ? "#dc3545" : "#28a745",
                fontWeight: "700",
              }}
            >
              {formatCurrency(Math.abs(saldoAtual))}
            </div>
            <div style={styles.cardLabel}>
              {saldoAtual > 0 ? "Saldo Disponível" : "Valor Excedido"}
            </div>
          </div>
        </div>

        <div style={styles.financialCard}>
          <div style={styles.cardIcon}>📋</div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>{metricas.totalDespesas || 0}</div>
            <div style={styles.cardLabel}>Despesas</div>
          </div>
        </div>
      </div>

      {/* Simulação se há valor de despesa atual */}
      {valorDespesaAtual > 0 && (
        <div style={styles.simulacao}>
          <h5 style={styles.simulacaoTitle}>🔮 Simulação com Nova Despesa</h5>
          <div style={styles.simulacaoContent}>
            <div style={styles.simulacaoItem}>
              <span style={styles.simulacaoLabel}>Valor da nova despesa:</span>
              <span style={styles.simulacaoValor}>
                {formatCurrency(valorDespesaAtual)}
              </span>
            </div>
            <div style={styles.simulacaoItem}>
              <span style={styles.simulacaoLabel}>
                Saldo após esta despesa:
              </span>
              <span
                style={{
                  ...styles.simulacaoValor,
                  color: saldoAposNovaDespesa < 0 ? "#dc3545" : "#28a745",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(saldoAposNovaDespesa)}
              </span>
            </div>
            <div style={styles.simulacaoItem}>
              <span style={styles.simulacaoLabel}>Execução total:</span>
              <span
                style={{
                  ...styles.simulacaoValor,
                  color: percentualAposNovaDespesa > 100 ? "#dc3545" : "#333",
                }}
              >
                {percentualAposNovaDespesa.toFixed(1)}%
              </span>
            </div>
          </div>

          {saldoAposNovaDespesa < 0 && (
            <div style={styles.alerta}>
              ⚠️ <strong>ATENÇÃO:</strong> Esta despesa excederá o valor da
              emenda em {formatCurrency(Math.abs(saldoAposNovaDespesa))}
            </div>
          )}
        </div>
      )}

      {/* Barra de progresso */}
      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>
          Execução da Emenda: {percentualExecutado.toFixed(1)}%
          {valorDespesaAtual > 0 && (
            <span style={{ opacity: 0.7 }}>
              → {percentualAposNovaDespesa.toFixed(1)}%
            </span>
          )}
        </div>
        <div style={styles.progressBarContainer}>
          {/* Barra atual */}
          <div
            style={{
              ...styles.progressBar,
              width: `${Math.min(percentualExecutado, 100)}%`,
              backgroundColor:
                percentualExecutado > 100
                  ? "#dc3545"
                  : percentualExecutado >= 75
                    ? "#28a745"
                    : percentualExecutado >= 50
                      ? "#ffc107"
                      : "#17a2b8",
            }}
          />
          {/* Barra de simulação */}
          {valorDespesaAtual > 0 && (
            <div
              style={{
                ...styles.progressBarSimulacao,
                left: `${Math.min(percentualExecutado, 100)}%`,
                width: `${Math.min(
                  percentualAposNovaDespesa - percentualExecutado,
                  100 - percentualExecutado,
                )}%`,
                backgroundColor:
                  percentualAposNovaDespesa > 100 ? "#dc3545" : "#ffc107",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ ESTILOS COMPLETOS (anteriormente truncados)
const styles = {
  widget: {
    border: "2px solid",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },

  widgetCompacto: {
    border: "1px solid",
    borderRadius: "6px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
  },

  loading: {
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    color: "#6c757d",
    fontStyle: "italic",
  },

  iconCompacto: {
    fontSize: "16px",
  },

  contentCompacto: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  saldoCompacto: {
    fontSize: "12px",
    fontWeight: "600",
  },

  previsaoCompacto: {
    fontSize: "11px",
    opacity: 0.8,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },

  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#154360",
  },

  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  emendaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#495057",
  },

  financialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  financialCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "white",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease",
  },

  cardIcon: {
    fontSize: "24px",
    opacity: 0.8,
  },

  cardContent: {
    flex: 1,
  },

  cardValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#154360",
    marginBottom: "2px",
  },

  cardLabel: {
    fontSize: "12px",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },

  cardSubtext: {
    fontSize: "11px",
    color: "#28a745",
    fontWeight: "600",
    marginTop: "2px",
  },

  simulacao: {
    backgroundColor: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
  },

  simulacaoTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
  },

  simulacaoContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  simulacaoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },

  simulacaoLabel: {
    color: "#6c757d",
  },

  simulacaoValor: {
    fontWeight: "600",
    color: "#333",
  },

  alerta: {
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: "6px",
    padding: "12px",
    color: "#721c24",
    fontSize: "13px",
    marginTop: "12px",
  },

  progressSection: {
    marginTop: "16px",
  },

  progressLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "8px",
  },

  progressBarContainer: {
    position: "relative",
    height: "20px",
    backgroundColor: "#e9ecef",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #dee2e6",
  },

  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: "10px 0 0 10px",
    transition: "width 0.5s ease",
  },

  progressBarSimulacao: {
    position: "absolute",
    top: 0,
    height: "100%",
    opacity: 0.7,
    borderLeft: "2px dashed white",
    borderRight: "2px dashed white",
    transition: "all 0.5s ease",
  },
};

// ✅ Hover effects via CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .financial-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    @media (max-width: 768px) {
      .financial-grid {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .simulacao-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `;
  document.head.appendChild(style);
}

export default SaldoEmendaWidget;
