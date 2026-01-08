// src/components/natureza/NaturezaCard.jsx
// Card expansivel para exibir natureza de despesa e suas despesas

import React, { useState, useEffect } from "react";
import { parseValorMonetario } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";

/**
 * Card expansivel de natureza de despesa
 * @param {object} props
 * @param {object} props.natureza - Dados da natureza
 * @param {array} props.despesas - Lista de despesas da natureza
 * @param {function} props.onNovaDespesa - Callback para criar despesa
 * @param {function} props.onEditarNatureza - Callback para editar natureza
 * @param {function} props.onExcluirNatureza - Callback para excluir natureza
 * @param {function} props.onEditarDespesa - Callback para editar despesa
 * @param {function} props.onVisualizarDespesa - Callback para visualizar despesa
 * @param {boolean} props.carregandoDespesas - Se esta carregando despesas
 * @param {function} props.onExpandir - Callback ao expandir
 * @param {boolean} props.expandido - Se esta expandido
 */
const NaturezaCard = ({
  natureza,
  despesas = [],
  onNovaDespesa,
  onEditarNatureza,
  onExcluirNatureza,
  onEditarDespesa,
  onVisualizarDespesa,
  carregandoDespesas = false,
  onExpandir,
  expandido = false,
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const [expandidoLocal, setExpandidoLocal] = useState(expandido);

  useEffect(() => {
    setExpandidoLocal(expandido);
  }, [expandido]);

  // Calculos
  const valorAlocado = parseValorMonetario(natureza.valorAlocado || 0);
  const valorExecutado = parseValorMonetario(natureza.valorExecutado || 0);
  const saldoDisponivel = parseValorMonetario(natureza.saldoDisponivel || 0);
  const percentualExecutado = natureza.percentualExecutado || 0;

  // Status visual
  const getStatusColor = () => {
    if (percentualExecutado >= 100) return "#ef4444"; // Vermelho - esgotado
    if (percentualExecutado >= 80) return "#f59e0b"; // Amarelo - atencao
    return "#10b981"; // Verde - ok
  };

  const handleToggleExpandir = () => {
    const novoEstado = !expandidoLocal;
    setExpandidoLocal(novoEstado);
    if (onExpandir) {
      onExpandir(natureza.id, novoEstado);
    }
  };

  // Estilos
  const styles = {
    card: {
      backgroundColor: isDark ? "var(--bg-secondary)" : "#ffffff",
      borderRadius: "12px",
      border: `1px solid ${isDark ? "var(--border-color)" : "#e2e8f0"}`,
      overflow: "hidden",
      marginBottom: "12px",
    },
    header: {
      display: "flex",
      alignItems: "center",
      padding: "16px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      backgroundColor: expandidoLocal
        ? isDark
          ? "var(--bg-tertiary)"
          : "#f8fafc"
        : "transparent",
    },
    expandIcon: {
      fontSize: 20,
      color: isDark ? "var(--text-secondary)" : "#64748b",
      marginRight: "12px",
      transition: "transform 0.2s",
      transform: expandidoLocal ? "rotate(90deg)" : "rotate(0deg)",
    },
    info: {
      flex: 1,
    },
    titulo: {
      fontSize: "14px",
      fontWeight: 600,
      color: isDark ? "var(--text-primary)" : "#1e293b",
      marginBottom: "4px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    codigo: {
      fontSize: "12px",
      color: isDark ? "var(--text-secondary)" : "#64748b",
      backgroundColor: isDark ? "var(--bg-tertiary)" : "#f1f5f9",
      padding: "2px 8px",
      borderRadius: "4px",
      fontFamily: "monospace",
    },
    metricas: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    metrica: {
      textAlign: "right",
    },
    metricaLabel: {
      fontSize: "11px",
      color: isDark ? "var(--text-secondary)" : "#94a3b8",
      display: "block",
    },
    metricaValor: {
      fontSize: "14px",
      fontWeight: 600,
      color: isDark ? "var(--text-primary)" : "#1e293b",
    },
    progressBar: {
      width: "100px",
      height: "6px",
      backgroundColor: isDark ? "var(--bg-tertiary)" : "#e2e8f0",
      borderRadius: "3px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: getStatusColor(),
      borderRadius: "3px",
      transition: "width 0.3s",
    },
    percentual: {
      fontSize: "12px",
      fontWeight: 600,
      color: getStatusColor(),
      marginLeft: "8px",
      minWidth: "40px",
    },
    body: {
      borderTop: `1px solid ${isDark ? "var(--border-color)" : "#e2e8f0"}`,
      padding: "16px",
      display: expandidoLocal ? "block" : "none",
    },
    acoes: {
      display: "flex",
      gap: "8px",
      marginBottom: "16px",
    },
    btnAcao: {
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: 500,
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    btnPrimario: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
    },
    btnSecundario: {
      backgroundColor: isDark ? "var(--bg-tertiary)" : "#f1f5f9",
      color: isDark ? "var(--text-primary)" : "#64748b",
    },
    btnPerigo: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#fee2e2",
      color: "#dc2626",
    },
    despesasList: {
      marginTop: "16px",
    },
    despesaItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px",
      backgroundColor: isDark ? "var(--bg-tertiary)" : "#f8fafc",
      borderRadius: "8px",
      marginBottom: "8px",
    },
    despesaInfo: {
      flex: 1,
    },
    despesaDescricao: {
      fontSize: "13px",
      fontWeight: 500,
      color: isDark ? "var(--text-primary)" : "#1e293b",
      marginBottom: "4px",
    },
    despesaMeta: {
      fontSize: "12px",
      color: isDark ? "var(--text-secondary)" : "#64748b",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    despesaValor: {
      fontSize: "14px",
      fontWeight: 600,
      color: isDark ? "var(--text-primary)" : "#1e293b",
    },
    despesaAcoes: {
      display: "flex",
      gap: "8px",
    },
    btnIcone: {
      padding: "6px",
      border: "none",
      borderRadius: "6px",
      backgroundColor: "transparent",
      color: isDark ? "var(--text-secondary)" : "#64748b",
      cursor: "pointer",
    },
    emptyState: {
      textAlign: "center",
      padding: "24px",
      color: isDark ? "var(--text-secondary)" : "#94a3b8",
    },
    emptyIcon: {
      fontSize: 40,
      marginBottom: "8px",
      opacity: 0.5,
    },
    statusBadge: {
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: 600,
      textTransform: "uppercase",
    },
    statusPendente: {
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#fef3c7",
      color: "#d97706",
    },
    statusEmpenhado: {
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#dbeafe",
      color: "#2563eb",
    },
    statusLiquidado: {
      backgroundColor: isDark ? "rgba(139, 92, 246, 0.1)" : "#ede9fe",
      color: "#7c3aed",
    },
    statusPago: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "#d1fae5",
      color: "#059669",
    },
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pago":
        return styles.statusPago;
      case "liquidado":
        return styles.statusLiquidado;
      case "empenhado":
        return styles.statusEmpenhado;
      default:
        return styles.statusPendente;
    }
  };

  return (
    <div style={styles.card}>
      {/* Header - sempre visivel */}
      <div style={styles.header} onClick={handleToggleExpandir}>
        <span className="material-symbols-outlined" style={styles.expandIcon}>
          chevron_right
        </span>

        <div style={styles.info}>
          <div style={styles.titulo}>
            <span style={styles.codigo}>{natureza.codigo}</span>
            {natureza.descricao?.replace(`${natureza.codigo} - `, "")}
          </div>
        </div>

        <div style={styles.metricas}>
          <div style={styles.metrica}>
            <span style={styles.metricaLabel}>Alocado</span>
            <span style={styles.metricaValor}>
              R$ {valorAlocado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={styles.metrica}>
            <span style={styles.metricaLabel}>Saldo</span>
            <span style={{ ...styles.metricaValor, color: getStatusColor() }}>
              R$ {saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(percentualExecutado, 100)}%`,
                }}
              />
            </div>
            <span style={styles.percentual}>
              {percentualExecutado.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Body - expansivel */}
      <div style={styles.body}>
        {/* Acoes */}
        <div style={styles.acoes}>
          <button
            style={{ ...styles.btnAcao, ...styles.btnPrimario }}
            onClick={() => onNovaDespesa?.(natureza)}
            disabled={saldoDisponivel <= 0}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              add
            </span>
            Nova Despesa
          </button>

          <button
            style={{ ...styles.btnAcao, ...styles.btnSecundario }}
            onClick={() => onEditarNatureza?.(natureza)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              edit
            </span>
            Editar
          </button>

          {despesas.length === 0 && (
            <button
              style={{ ...styles.btnAcao, ...styles.btnPerigo }}
              onClick={() => onExcluirNatureza?.(natureza)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                delete
              </span>
              Excluir
            </button>
          )}
        </div>

        {/* Lista de despesas */}
        <div style={styles.despesasList}>
          <h4
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: isDark ? "var(--text-secondary)" : "#64748b",
              marginBottom: "12px",
            }}
          >
            Despesas ({despesas.length})
          </h4>

          {carregandoDespesas ? (
            <div style={styles.emptyState}>
              <span
                className="material-symbols-outlined"
                style={{ ...styles.emptyIcon, animation: "spin 1s linear infinite" }}
              >
                sync
              </span>
              <p>Carregando despesas...</p>
            </div>
          ) : despesas.length === 0 ? (
            <div style={styles.emptyState}>
              <span className="material-symbols-outlined" style={styles.emptyIcon}>
                receipt_long
              </span>
              <p>Nenhuma despesa cadastrada nesta natureza</p>
            </div>
          ) : (
            despesas.map((despesa) => (
              <div key={despesa.id} style={styles.despesaItem}>
                <div style={styles.despesaInfo}>
                  <div style={styles.despesaDescricao}>
                    {despesa.discriminacao || despesa.descricao || "Despesa sem descricao"}
                  </div>
                  <div style={styles.despesaMeta}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(despesa.statusPagamento),
                      }}
                    >
                      {despesa.statusPagamento || "pendente"}
                    </span>
                    {despesa.fornecedor && (
                      <span>
                        <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: "middle" }}>
                          business
                        </span>{" "}
                        {despesa.fornecedor}
                      </span>
                    )}
                    {despesa.notaFiscal && (
                      <span>
                        <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: "middle" }}>
                          receipt
                        </span>{" "}
                        NF {despesa.notaFiscal}
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.despesaValor}>
                  R${" "}
                  {parseValorMonetario(despesa.valor).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>

                <div style={styles.despesaAcoes}>
                  <button
                    style={styles.btnIcone}
                    onClick={() => onVisualizarDespesa?.(despesa)}
                    title="Visualizar"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      visibility
                    </span>
                  </button>
                  <button
                    style={styles.btnIcone}
                    onClick={() => onEditarDespesa?.(despesa)}
                    title="Editar"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      edit
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NaturezaCard;
