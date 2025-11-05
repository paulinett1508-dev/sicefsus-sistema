// src/components/despesa/DespesaFormEmendaInfo.jsx
// ✅ Componente especializado para exibir informações da emenda selecionada
// ✅ ATUALIZADO 05/11/2025: UX aprimorada com progresso visual e cores semafóricas

import React from "react";

const DespesaFormEmendaInfo = ({
  emendaInfo,
  formData = {},
  handleInputChange = () => {},
  modoVisualizacao = false,
}) => {
  // 🆕 Garantir que todos os dados sejam encontrados com fallbacks
  const parlamentar =
    emendaInfo?.parlamentar || emendaInfo?.autor || "Não informado";
  const numero =
    emendaInfo?.numero || emendaInfo?.numeroEmenda || "Não informado";
  const tipo = emendaInfo?.tipo || emendaInfo?.tipoEmenda || "Não informado";
  const municipio = emendaInfo?.municipio || "Não informado";
  const uf = emendaInfo?.uf || "";
  const valorRecurso = emendaInfo?.valorRecurso || emendaInfo?.valor || 0;
  const saldoDisponivel = emendaInfo?.saldoDisponivel ?? 0;
  const programa =
    emendaInfo?.programa ||
    emendaInfo?.programaSaude ||
    emendaInfo?.objeto ||
    "Não informado";

  // 🎯 CÁLCULOS PARA UX APRIMORADA
  const valorExecutado = valorRecurso - saldoDisponivel;
  const percentualExecutado =
    valorRecurso > 0 ? (valorExecutado / valorRecurso) * 100 : 0;
  const percentualDisponivel = 100 - percentualExecutado;

  // 🚦 CORES SEMAFÓRICAS BASEADAS NO SALDO
  const getSaldoColor = () => {
    if (percentualDisponivel > 70) return "#27ae60"; // Verde
    if (percentualDisponivel > 30) return "#f39c12"; // Amarelo
    return "#e74c3c"; // Vermelho
  };

  const getSaldoBgColor = () => {
    if (percentualDisponivel > 70) return "#d4edda";
    if (percentualDisponivel > 30) return "#fff3cd";
    return "#f8d7da";
  };

  const getSaldoIcon = () => {
    if (percentualDisponivel > 70) return "✅";
    if (percentualDisponivel > 30) return "⚠️";
    return "🚨";
  };

  // 📊 STATUS DA EMENDA
  const getStatusEmenda = () => {
    if (saldoDisponivel <= 0) return { label: "Finalizada", color: "#95a5a6" };
    if (percentualExecutado < 25) return { label: "Início", color: "#3498db" };
    if (percentualExecutado < 75)
      return { label: "Em Execução", color: "#f39c12" };
    return { label: "Quase Finalizada", color: "#e67e22" };
  };

  const status = getStatusEmenda();

  const formatMoeda = (valor) => {
    return typeof valor === "number"
      ? valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : `R$ ${valor}`;
  };

  return (
    <div style={styles.container}>
      {/* 📋 HEADER COM STATUS */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h3 style={styles.title}>📋 Dados da Emenda Selecionada</h3>
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: status.color,
            }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* 📊 BARRA DE PROGRESSO VISUAL */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Execução Orçamentária</span>
          <span style={styles.progressPercentage}>
            {percentualExecutado.toFixed(1)}% executado
          </span>
        </div>
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressBarFilled,
              width: `${percentualExecutado}%`,
              backgroundColor:
                percentualExecutado > 75
                  ? "#27ae60"
                  : percentualExecutado > 50
                    ? "#f39c12"
                    : "#3498db",
            }}
          />
        </div>
        <div style={styles.progressValues}>
          <span style={styles.progressValueItem}>
            <strong>Executado:</strong> {formatMoeda(valorExecutado)}
          </span>
          <span style={styles.progressValueItem}>
            <strong>Disponível:</strong> {formatMoeda(saldoDisponivel)}
          </span>
        </div>
      </div>

      {/* 💰 SALDO DISPONÍVEL DESTACADO */}
      <div
        style={{
          ...styles.saldoDestaque,
          backgroundColor: getSaldoBgColor(),
          borderColor: getSaldoColor(),
        }}
      >
        <div style={styles.saldoContent}>
          <span style={styles.saldoIcon}>{getSaldoIcon()}</span>
          <div style={styles.saldoInfo}>
            <span style={styles.saldoLabel}>Saldo Disponível</span>
            <span style={{ ...styles.saldoValor, color: getSaldoColor() }}>
              {formatMoeda(saldoDisponivel)}
            </span>
          </div>
          <span style={styles.saldoPercentual}>
            {percentualDisponivel.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 📝 INFORMAÇÕES DETALHADAS */}
      <div style={styles.detailsGrid}>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>👤 Parlamentar</span>
          <strong style={styles.detailValue}>{parlamentar}</strong>
        </div>

        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>🔢 Número</span>
          <strong style={styles.detailValue}>{numero}</strong>
        </div>

        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>📄 Tipo</span>
          <strong style={styles.detailValue}>{tipo}</strong>
        </div>

        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>📍 Município</span>
          <strong style={styles.detailValue}>
            {municipio}
            {uf ? `/${uf}` : ""}
          </strong>
        </div>

        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>💵 Valor Total</span>
          <strong style={styles.detailValue}>
            {formatMoeda(valorRecurso)}
          </strong>
        </div>

        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>🎯 Programa</span>
          <strong style={styles.detailValue}>{programa}</strong>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#ffffff",
    border: "2px solid #e3f2fd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },

  // 📋 HEADER
  header: {
    marginBottom: "12px",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#1565c0",
    margin: 0,
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "16px",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  // 📊 BARRA DE PROGRESSO
  progressSection: {
    marginBottom: "12px",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  progressLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  progressPercentage: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#1565c0",
  },
  progressBarContainer: {
    width: "100%",
    height: "16px",
    backgroundColor: "#e9ecef",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "8px",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
  },
  progressBarFilled: {
    height: "100%",
    transition: "width 0.8s ease, background-color 0.3s ease",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: "8px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
  },
  progressValues: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#495057",
  },
  progressValueItem: {
    display: "flex",
    gap: "4px",
  },

  // 💰 SALDO DESTACADO
  saldoDestaque: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "2px solid",
    marginBottom: "12px",
    transition: "all 0.3s ease",
  },
  saldoContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  saldoIcon: {
    fontSize: "20px",
  },
  saldoInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  saldoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  saldoValor: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  saldoPercentual: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#6c757d",
  },

  // 📝 GRID DE DETALHES
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
  },
  detailCard: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "8px 10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
  },
  detailLabel: {
    fontSize: "10px",
    color: "#6c757d",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  detailValue: {
    fontSize: "12px",
    color: "#2c3e50",
    fontWeight: "600",
    wordBreak: "break-word",
  },
};

export default DespesaFormEmendaInfo;
