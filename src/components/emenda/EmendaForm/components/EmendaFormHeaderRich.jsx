// src/components/emenda/EmendaForm/components/EmendaFormHeaderRich.jsx
// Cabeçalho rico com informações contextuais da emenda

import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

const EmendaFormHeaderRich = ({ modo, formData, activeTab, despesas = [] }) => {
  const { isDark } = useTheme();

  // Calcular valores
  const valorRecurso =
    parseFloat(
      formData?.valorRecurso?.replace?.(/[^\d,]/g, "")?.replace(",", "."),
    ) || 0;
  const acoesServicos = formData?.acoesServicos || [];

  // Total planejado
  const totalPlanejado = acoesServicos.reduce((sum, acao) => {
    const valor =
      parseFloat(acao.valorAcao?.replace?.(/[^\d,]/g, "")?.replace(",", ".")) ||
      0;
    return sum + valor;
  }, 0);

  // Total executado
  const totalExecutado = despesas.reduce(
    (sum, d) => sum + (parseFloat(d.valor) || 0),
    0,
  );

  // Saldos
  const saldoPlanejamento = valorRecurso - totalPlanejado;
  const saldoExecucao = valorRecurso - totalExecutado;
  const percentualExecutado =
    valorRecurso > 0 ? ((totalExecutado / valorRecurso) * 100).toFixed(1) : 0;

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(valor || 0);
  };

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? "var(--theme-surface)" : "white",
      borderRadius: "8px",
      padding: "20px 24px",
      marginBottom: "20px",
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.06)",
      border: `1px solid ${isDark ? "var(--theme-border)" : "#e9ecef"}`,
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "var(--primary)",
      margin: "0 0 8px 0",
    },
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "8px",
      fontSize: "14px",
      color: isDark ? "var(--theme-text-secondary)" : "#6b7280",
    },
    breadcrumbItem: {
      color: isDark ? "var(--theme-text)" : "#374151",
    },
    breadcrumbSep: {
      color: isDark ? "var(--theme-text-muted)" : "#d1d5db",
    },
    infoCards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      paddingTop: "16px",
      borderTop: `1px solid ${isDark ? "var(--theme-border)" : "#e9ecef"}`,
    },
    card: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f8f9fa",
      borderRadius: "6px",
      border: `1px solid ${isDark ? "var(--theme-border)" : "#e9ecef"}`,
    },
    cardLabel: {
      fontSize: "11px",
      color: isDark ? "var(--theme-text-secondary)" : "#6b7280",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px",
    },
    cardValue: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "var(--primary)",
      lineHeight: 1.2,
    },
    cardSubtext: {
      fontSize: "11px",
      color: isDark ? "var(--theme-text-muted)" : "#9ca3af",
      marginTop: "2px",
    },
  };

  return (
    <div style={dynamicStyles.container}>
      {/* Título e Info Básica */}
      <div style={styles.headerTop}>
        <div style={styles.titleSection}>
          <h2 style={dynamicStyles.title}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>
              {modo === "editar" ? "edit" : "add_circle"}
            </span>
            {modo === "editar" ? "Editando Emenda" : "Nova Emenda"}
          </h2>
          <div style={dynamicStyles.breadcrumb}>
            {formData?.numero && (
              <span style={dynamicStyles.breadcrumbItem}>
                <strong>Nº {formData.numero}</strong>
              </span>
            )}
            {formData?.autor && (
              <>
                <span style={dynamicStyles.breadcrumbSep}>•</span>
                <span style={dynamicStyles.breadcrumbItem}>{formData.autor}</span>
              </>
            )}
            {formData?.municipio && formData?.uf && (
              <>
                <span style={dynamicStyles.breadcrumbSep}>•</span>
                <span style={dynamicStyles.breadcrumbItem}>
                  {formData.municipio}/{formData.uf}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Informações Contextuais */}
      {modo === "editar" && valorRecurso > 0 && (
        <div style={dynamicStyles.infoCards}>
          {/* Card: Valor Total */}
          <div style={dynamicStyles.card}>
            <div style={styles.cardIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)" }}>payments</span>
            </div>
            <div style={styles.cardContent}>
              <div style={dynamicStyles.cardLabel}>Valor da Emenda</div>
              <div style={dynamicStyles.cardValue}>{formatarMoeda(valorRecurso)}</div>
            </div>
          </div>

          {/* Card: Planejamento */}
          {activeTab === "planejamento" && (
            <>
              <div style={dynamicStyles.card}>
                <div style={styles.cardIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--success)" }}>target</span>
                </div>
                <div style={styles.cardContent}>
                  <div style={dynamicStyles.cardLabel}>Total Planejado</div>
                  <div style={dynamicStyles.cardValue}>
                    {formatarMoeda(totalPlanejado)}
                  </div>
                  <div style={dynamicStyles.cardSubtext}>
                    {acoesServicos.length}{" "}
                    {acoesServicos.length === 1 ? "natureza" : "naturezas"}
                  </div>
                </div>
              </div>

              <div style={dynamicStyles.card}>
                <div style={styles.cardIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: saldoPlanejamento >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {saldoPlanejamento >= 0 ? "check_circle" : "warning"}
                  </span>
                </div>
                <div style={styles.cardContent}>
                  <div style={dynamicStyles.cardLabel}>Saldo para Planejar</div>
                  <div
                    style={{
                      ...dynamicStyles.cardValue,
                      color: saldoPlanejamento >= 0 ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {formatarMoeda(saldoPlanejamento)}
                  </div>
                  <div style={dynamicStyles.cardSubtext}>
                    {saldoPlanejamento >= 0 ? "Disponível" : "Excedido!"}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Card: Despesas */}
          {activeTab === "despesas" && (
            <>
              <div style={dynamicStyles.card}>
                <div style={styles.cardIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--warning)" }}>upload</span>
                </div>
                <div style={styles.cardContent}>
                  <div style={dynamicStyles.cardLabel}>Total Executado</div>
                  <div style={{ ...dynamicStyles.cardValue, color: "var(--warning)" }}>
                    {formatarMoeda(totalExecutado)}
                  </div>
                  <div style={dynamicStyles.cardSubtext}>
                    {despesas.length}{" "}
                    {despesas.length === 1 ? "despesa" : "despesas"}
                  </div>
                </div>
              </div>

              <div style={dynamicStyles.card}>
                <div style={styles.cardIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--success)" }}>account_balance_wallet</span>
                </div>
                <div style={styles.cardContent}>
                  <div style={dynamicStyles.cardLabel}>Saldo Disponível</div>
                  <div
                    style={{
                      ...dynamicStyles.cardValue,
                      color: saldoExecucao >= 0 ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {formatarMoeda(saldoExecucao)}
                  </div>
                  <div style={dynamicStyles.cardSubtext}>
                    {percentualExecutado}% executado
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Estilos estáticos (sem cores - cores estão nos dynamicStyles)
const styles = {
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "16px",
  },
  titleSection: {
    flex: 1,
  },
  cardIcon: {
    fontSize: "28px",
    lineHeight: 1,
  },
  cardContent: {
    flex: 1,
  },
};

export default EmendaFormHeaderRich;
