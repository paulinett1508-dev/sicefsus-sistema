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
 * @param {function} props.onExcluirDespesa - Callback para excluir despesa
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
  onRegularizarNatureza,
  onEditarDespesa,
  onVisualizarDespesa,
  onExcluirDespesa,
  carregandoDespesas = false,
  onExpandir,
  expandido = false,
  usuario, // 🔒 Prop para controle de permissão
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const [expandidoLocal, setExpandidoLocal] = useState(expandido);
  const [valorRegularizacao, setValorRegularizacao] = useState("");
  const [mostrarFormRegularizacao, setMostrarFormRegularizacao] = useState(false);

  // 🔒 Verificação de permissão: operadores não podem excluir despesas
  const isOperador = usuario?.tipo === "operador" || usuario?.tipo === "Operador";
  const podeExcluirDespesa = !isOperador;

  useEffect(() => {
    setExpandidoLocal(expandido);
  }, [expandido]);

  // Natureza virtual precisa de regularizacao
  const isVirtual = natureza.isVirtual || false;

  // Calculos
  const valorAlocado = parseValorMonetario(natureza.valorAlocado || 0);
  const valorExecutado = parseValorMonetario(natureza.valorExecutado || 0);
  // Calcular saldo: se não vier definido, calcular como valorAlocado - valorExecutado
  const saldoDisponivel = natureza.saldoDisponivel !== undefined 
    ? parseValorMonetario(natureza.saldoDisponivel) 
    : (valorAlocado - valorExecutado);
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

  // Handler para regularizar
  const handleRegularizar = async () => {
    const valor = parseValorMonetario(valorRegularizacao) || valorExecutado;
    if (valor < valorExecutado) {
      alert(`O valor alocado deve ser pelo menos R$ ${valorExecutado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (total executado)`);
      return;
    }
    await onRegularizarNatureza?.(natureza, valor);
    setMostrarFormRegularizacao(false);
    setValorRegularizacao("");
  };

  // Estilos - Design compacto e profissional
  const styles = {
    card: {
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius-md, 8px)",
      border: isVirtual
        ? `2px dashed ${isDark ? "#f59e0b" : "#f59e0b"}`
        : `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      overflow: "hidden",
      position: "relative",
    },
    virtualBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: "#f59e0b",
      color: "#fff",
      padding: "2px 8px",
      fontSize: "10px",
      fontWeight: 600,
      borderBottomLeftRadius: "6px",
    },
    header: {
      display: "flex",
      alignItems: "center",
      padding: "10px 12px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      backgroundColor: expandidoLocal
        ? isDark
          ? "var(--theme-surface-secondary)"
          : "var(--gray-50, #F8FAFC)"
        : "transparent",
    },
    expandIcon: {
      fontSize: 18,
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginRight: "8px",
      transition: "transform 0.2s",
      transform: expandidoLocal ? "rotate(90deg)" : "rotate(0deg)",
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    titulo: {
      fontSize: "var(--font-size-sm, 13px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    codigo: {
      fontSize: "11px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-100, #F1F5F9)",
      padding: "2px 6px",
      borderRadius: "var(--border-radius-sm, 4px)",
      fontFamily: "monospace",
      flexShrink: 0,
    },
    metricas: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexShrink: 0,
    },
    metrica: {
      textAlign: "right",
    },
    metricaLabel: {
      fontSize: "10px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
      display: "block",
    },
    metricaValor: {
      fontSize: "var(--font-size-sm, 13px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
    },
    progressBar: {
      width: "60px",
      height: "4px",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-200, #E2E8F0)",
      borderRadius: "2px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: getStatusColor(),
      borderRadius: "2px",
      transition: "width 0.3s",
    },
    percentual: {
      fontSize: "11px",
      fontWeight: 600,
      color: getStatusColor(),
      marginLeft: "6px",
      minWidth: "32px",
    },
    body: {
      borderTop: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      padding: "12px",
      display: expandidoLocal ? "block" : "none",
    },
    acoes: {
      display: "flex",
      gap: "6px",
      marginBottom: "12px",
    },
    btnAcao: {
      padding: "6px 12px",
      fontSize: "var(--font-size-xs, 12px)",
      fontWeight: "var(--font-weight-medium, 500)",
      border: "none",
      borderRadius: "var(--border-radius-sm, 4px)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    btnPrimario: {
      backgroundColor: "var(--primary, #2563EB)",
      color: "var(--white, #ffffff)",
    },
    btnSecundario: {
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-100, #F1F5F9)",
      color: isDark ? "var(--theme-text)" : "var(--gray-500, #64748B)",
    },
    btnPerigo: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
      color: "var(--error, #EF4444)",
    },
    despesasList: {
      marginTop: "10px",
    },
    despesaItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 10px",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-50, #F8FAFC)",
      borderRadius: "var(--border-radius, 6px)",
      marginBottom: "6px",
    },
    despesaInfo: {
      flex: 1,
      minWidth: 0,
    },
    despesaDescricao: {
      fontSize: "var(--font-size-xs, 12px)",
      fontWeight: "var(--font-weight-medium, 500)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      marginBottom: "2px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    despesaMeta: {
      fontSize: "11px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    despesaValor: {
      fontSize: "var(--font-size-sm, 13px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      marginLeft: "8px",
      flexShrink: 0,
    },
    despesaAcoes: {
      display: "flex",
      gap: "4px",
      marginLeft: "8px",
    },
    btnIcone: {
      padding: "4px",
      border: "none",
      borderRadius: "var(--border-radius-sm, 4px)",
      backgroundColor: "transparent",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      cursor: "pointer",
    },
    btnIconePerigo: {
      color: isDark ? "#f87171" : "#EF4444",
    },
    emptyState: {
      textAlign: "center",
      padding: "16px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
    },
    emptyIcon: {
      fontSize: 28,
      marginBottom: "6px",
      opacity: 0.5,
    },
    statusBadge: {
      padding: "2px 6px",
      borderRadius: "var(--border-radius-sm, 4px)",
      fontSize: "10px",
      fontWeight: "var(--font-weight-semibold, 600)",
      textTransform: "uppercase",
    },
    statusPendente: {
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.15)",
      color: "var(--warning, #F59E0B)",
    },
    statusEmpenhado: {
      backgroundColor: isDark ? "rgba(37, 99, 235, 0.1)" : "rgba(37, 99, 235, 0.1)",
      color: "var(--primary, #2563EB)",
    },
    statusLiquidado: {
      backgroundColor: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.1)",
      color: "#8B5CF6",
    },
    statusPago: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.1)",
      color: "var(--success, #10B981)",
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
      {/* Badge para natureza virtual */}
      {isVirtual && (
        <div style={styles.virtualBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>
            schedule
          </span>
          Pendente
        </div>
      )}

      {/* Header - sempre visivel */}
      <div
        style={styles.header}
        onClick={handleToggleExpandir}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleExpandir(); } }}
        role="button"
        tabIndex={0}
        aria-expanded={expandidoLocal}
        aria-label={`${natureza.descricao}, ${expandidoLocal ? 'clique para recolher' : 'clique para expandir'}`}
      >
        <span className="material-symbols-outlined" style={styles.expandIcon} aria-hidden="true">
          chevron_right
        </span>

        <div style={styles.info}>
          <div style={styles.titulo}>
            <span style={styles.codigo}>{natureza.codigo}</span>
            {natureza.descricao?.replace(`${natureza.codigo} - `, "")}
            {isVirtual && (
              <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 4 }}>
                ({despesas.length} despesas)
              </span>
            )}
          </div>
        </div>

        <div style={styles.metricas}>
          {isVirtual ? (
            <>
              <div style={styles.metrica}>
                <span style={styles.metricaLabel}>Executado</span>
                <span style={{ ...styles.metricaValor, color: "#8b5cf6" }}>
                  R$ {valorExecutado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={styles.metrica}>
                <span style={styles.metricaLabel}>Alocado</span>
                <span style={{ ...styles.metricaValor, color: "#f59e0b" }}>
                  R$ 0,00
                </span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Body - expansivel */}
      <div style={styles.body}>
        {/* Acoes para natureza virtual */}
        {isVirtual ? (
          <div>
            {/* Banner de regularizacao */}
            <div style={{
              padding: "12px",
              backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#fef3c7",
              borderRadius: 8,
              marginBottom: 12,
              border: `1px solid ${isDark ? "#f59e0b" : "#fcd34d"}`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: mostrarFormRegularizacao ? 12 : 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#f59e0b" }}>info</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#fcd34d" : "#92400e" }}>
                    Natureza detectada automaticamente
                  </span>
                  <p style={{ fontSize: 12, color: isDark ? "#fcd34d" : "#b45309", margin: "4px 0 0 0" }}>
                    Esta natureza foi criada a partir de {despesas.length} despesas existentes.
                    Defina o valor a ser alocado para regularizar.
                  </p>
                </div>
              </div>

              {mostrarFormRegularizacao ? (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: isDark ? "#fcd34d" : "#92400e", display: "block", marginBottom: 4 }}>
                      Valor a Alocar (mínimo R$ {valorExecutado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                    </label>
                    <input
                      type="text"
                      value={valorRegularizacao}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d,]/g, "");
                        setValorRegularizacao(v);
                      }}
                      placeholder={valorExecutado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        fontSize: 13,
                        border: `1px solid ${isDark ? "#f59e0b" : "#fcd34d"}`,
                        borderRadius: 6,
                        backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
                        color: isDark ? "var(--theme-text)" : "#1e293b",
                        fontFamily: "monospace",
                        textAlign: "right",
                      }}
                    />
                  </div>
                  <button
                    style={{ ...styles.btnAcao, backgroundColor: "#f59e0b", color: "#fff" }}
                    onClick={handleRegularizar}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                    Confirmar
                  </button>
                  <button
                    style={{ ...styles.btnAcao, ...styles.btnSecundario }}
                    onClick={() => setMostrarFormRegularizacao(false)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  style={{ ...styles.btnAcao, backgroundColor: "#f59e0b", color: "#fff", marginTop: 8 }}
                  onClick={() => setMostrarFormRegularizacao(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
                  Regularizar Natureza
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Acoes para natureza normal */
          <div style={styles.acoes}>
            <button
              style={{ 
                ...styles.btnAcao, 
                ...styles.btnPrimario,
                ...(saldoDisponivel <= 0 ? { 
                  opacity: 0.5, 
                  cursor: "not-allowed",
                  backgroundColor: isDark ? "#475569" : "#94a3b8"
                } : {})
              }}
              onClick={() => onNovaDespesa?.(natureza)}
              disabled={saldoDisponivel <= 0}
              title={saldoDisponivel <= 0 ? "Sem saldo disponível nesta natureza" : "Criar nova despesa"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                add
              </span>
              Nova Despesa
            </button>

            {/* 🔒 Botões de editar/excluir natureza só para admin/gestor */}
            {!isOperador && (
              <button
                style={{ ...styles.btnAcao, ...styles.btnSecundario }}
                onClick={() => onEditarNatureza?.(natureza)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  edit
                </span>
                Editar
              </button>
            )}

            {!isOperador && despesas.length === 0 && (
              <button
                style={{ ...styles.btnAcao, ...styles.btnPerigo }}
                onClick={() => onExcluirNatureza?.(natureza)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  delete
                </span>
                Excluir
              </button>
            )}
          </div>
        )}

        {/* Lista de despesas */}
        <div style={styles.despesasList}>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: isDark ? "var(--text-secondary)" : "#64748b",
              margin: "0 0 8px 0",
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
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      visibility
                    </span>
                  </button>
                  <button
                    style={styles.btnIcone}
                    onClick={() => onEditarDespesa?.(despesa)}
                    title="Editar"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      edit
                    </span>
                  </button>
                  {podeExcluirDespesa && (
                    <button
                      style={{ ...styles.btnIcone, ...styles.btnIconePerigo }}
                      onClick={() => onExcluirDespesa?.(despesa)}
                      title="Excluir despesa"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        delete
                      </span>
                    </button>
                  )}
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
