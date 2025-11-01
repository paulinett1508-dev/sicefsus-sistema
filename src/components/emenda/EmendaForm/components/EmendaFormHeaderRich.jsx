// src/components/emenda/EmendaForm/components/EmendaFormHeaderRich.jsx
// Cabeçalho rico com informações contextuais da emenda

import React from "react";

const EmendaFormHeaderRich = ({ modo, formData, activeTab, despesas = [] }) => {
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

  return (
    <div style={styles.container}>
      {/* Título e Info Básica */}
      <div style={styles.headerTop}>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>
            {modo === "editar" ? "✏️ Editando Emenda" : "➕ Nova Emenda"}
          </h2>
          <div style={styles.breadcrumb}>
            {formData?.numero && (
              <span style={styles.breadcrumbItem}>
                <strong>Nº {formData.numero}</strong>
              </span>
            )}
            {formData?.autor && (
              <>
                <span style={styles.breadcrumbSep}>•</span>
                <span style={styles.breadcrumbItem}>{formData.autor}</span>
              </>
            )}
            {formData?.municipio && formData?.uf && (
              <>
                <span style={styles.breadcrumbSep}>•</span>
                <span style={styles.breadcrumbItem}>
                  {formData.municipio}/{formData.uf}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Informações Contextuais */}
      {modo === "editar" && valorRecurso > 0 && (
        <div style={styles.infoCards}>
          {/* Card: Valor Total */}
          <div style={styles.card}>
            <div style={styles.cardIcon}>💰</div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Valor da Emenda</div>
              <div style={styles.cardValue}>{formatarMoeda(valorRecurso)}</div>
            </div>
          </div>

          {/* Card: Planejamento */}
          {activeTab === "planejamento" && (
            <>
              <div style={styles.card}>
                <div style={styles.cardIcon}>🎯</div>
                <div style={styles.cardContent}>
                  <div style={styles.cardLabel}>Total Planejado</div>
                  <div style={styles.cardValue}>
                    {formatarMoeda(totalPlanejado)}
                  </div>
                  <div style={styles.cardSubtext}>
                    {acoesServicos.length}{" "}
                    {acoesServicos.length === 1 ? "natureza" : "naturezas"}
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardIcon}>
                  {saldoPlanejamento >= 0 ? "✅" : "⚠️"}
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.cardLabel}>Saldo para Planejar</div>
                  <div
                    style={{
                      ...styles.cardValue,
                      color: saldoPlanejamento >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {formatarMoeda(saldoPlanejamento)}
                  </div>
                  <div style={styles.cardSubtext}>
                    {saldoPlanejamento >= 0 ? "Disponível" : "Excedido!"}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Card: Despesas */}
          {activeTab === "despesas" && (
            <>
              <div style={styles.card}>
                <div style={styles.cardIcon}>📤</div>
                <div style={styles.cardContent}>
                  <div style={styles.cardLabel}>Total Executado</div>
                  <div style={{ ...styles.cardValue, color: "#f97316" }}>
                    {formatarMoeda(totalExecutado)}
                  </div>
                  <div style={styles.cardSubtext}>
                    {despesas.length}{" "}
                    {despesas.length === 1 ? "despesa" : "despesas"}
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardIcon}>💵</div>
                <div style={styles.cardContent}>
                  <div style={styles.cardLabel}>Saldo Disponível</div>
                  <div
                    style={{
                      ...styles.cardValue,
                      color: saldoExecucao >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {formatarMoeda(saldoExecucao)}
                  </div>
                  <div style={styles.cardSubtext}>
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

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px 24px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e9ecef",
  },
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
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#154360",
    margin: "0 0 8px 0",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    fontSize: "14px",
    color: "#6b7280",
  },
  breadcrumbItem: {
    color: "#374151",
  },
  breadcrumbSep: {
    color: "#d1d5db",
  },
  infoCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e9ecef",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  },
  cardIcon: {
    fontSize: "28px",
    lineHeight: 1,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  cardValue: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#154360",
    lineHeight: 1.2,
  },
  cardSubtext: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "2px",
  },
};

export default EmendaFormHeaderRich;
