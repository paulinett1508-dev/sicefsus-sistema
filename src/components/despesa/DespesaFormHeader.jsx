// src/components/despesa/DespesaFormHeader.jsx
// ✅ Componente especializado para header do formulário de despesas
// ✅ ATUALIZADO: Mostra contexto da natureza quando criando despesa dentro de uma

import React from "react";
import { useTheme } from "../../context/ThemeContext";

const formatMoeda = (valor) => {
  const num = typeof valor === "number" ? valor : parseFloat(valor) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const DespesaFormHeader = ({
  configModo,
  titulo,
  subtitle,
  despesaParaEditar,
  formData,
  modoVisualizacao,
  showSuccessMessage,
  naturezaInfo = null, // 🆕 Informações da natureza (envelope orçamentário)
  emendaInfo = null, // 🆕 Informações da emenda para referência
  modoCriacaoDireta = false, // 🆕 Flag direta para criação de despesa executada
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const styles = getStyles(isDark);

  // Verificar se está criando despesa dentro de uma natureza
  const temNatureza = naturezaInfo && naturezaInfo.id;

  // Se tem natureza E está em modo de criação/execução, usar layout compacto
  const usarLayoutCompacto = temNatureza && (
    modoCriacaoDireta ||
    configModo.modo === "criar" ||
    configModo.modo === "executar"
  );

  if (usarLayoutCompacto) {
    const saldoNatureza = naturezaInfo.saldoDisponivel || 0;
    const percentualUsado = naturezaInfo.valorAlocado > 0
      ? ((naturezaInfo.valorExecutado / naturezaInfo.valorAlocado) * 100)
      : 0;

    // Cor do saldo baseada no percentual disponível
    const getSaldoColor = () => {
      const percentualDisponivel = 100 - percentualUsado;
      if (percentualDisponivel >= 15) return isDark ? "#4ade80" : "#16a34a";
      if (percentualDisponivel >= 5) return isDark ? "#fbbf24" : "#d97706";
      if (percentualDisponivel > 0) return isDark ? "#f87171" : "#dc2626";
      return isDark ? "#6b7280" : "#9ca3af";
    };

    return (
      <>
        {/* Header compacto com contexto da natureza */}
        <div style={styles.headerNatureza}>
          {/* Linha superior: Natureza em destaque */}
          <div style={styles.naturezaRow}>
            <div style={styles.naturezaInfo}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: isDark ? "#60a5fa" : "#2563eb" }}>
                account_balance_wallet
              </span>
              <div>
                <span style={styles.naturezaCodigo}>{naturezaInfo.codigo}</span>
                <span style={styles.naturezaDescricao}>
                  {naturezaInfo.descricao?.replace(`${naturezaInfo.codigo} - `, "")}
                </span>
              </div>
            </div>

            {/* Saldo disponível da natureza em destaque */}
            <div style={{ ...styles.saldoBox, borderColor: getSaldoColor() }}>
              <span style={styles.saldoLabel}>Saldo Disponível</span>
              <span style={{ ...styles.saldoValor, color: getSaldoColor() }}>
                {formatMoeda(saldoNatureza)}
              </span>
            </div>
          </div>

          {/* Barra de progresso da natureza */}
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(percentualUsado, 100)}%`,
                  backgroundColor: percentualUsado >= 100 ? "#ef4444" : percentualUsado >= 80 ? "#f59e0b" : "#3b82f6"
                }}
              />
            </div>
            <span style={styles.progressText}>{percentualUsado.toFixed(0)}% utilizado</span>
          </div>

          {/* Linha inferior: Referência discreta à emenda */}
          {emendaInfo && (
            <div style={styles.emendaRef}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, opacity: 0.7 }}>link</span>
              <span style={styles.emendaRefText}>
                Emenda {emendaInfo.numero || emendaInfo.numeroEmenda}
                {(emendaInfo.parlamentar || emendaInfo.autor) && ` • ${emendaInfo.parlamentar || emendaInfo.autor}`}
              </span>
            </div>
          )}
        </div>

        {showSuccessMessage && (
          <div style={styles.successMessage}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: isDark ? "#86efac" : "#155724" }}>check_circle</span>
            <span style={styles.successText}>Despesa criada com sucesso!</span>
          </div>
        )}
      </>
    );
  }

  // Layout padrão (sem natureza)
  const headerColors = {
    visualizar: {
      bg: isDark ? "rgba(59, 130, 246, 0.15)" : "#e7f3ff",
      color: isDark ? "#93c5fd" : "#004085",
      border: isDark ? "rgba(59, 130, 246, 0.3)" : "#b6d4fe",
    },
    editar: {
      bg: isDark ? "rgba(34, 197, 94, 0.15)" : "#d4edda",
      color: isDark ? "#86efac" : "#155724",
      border: isDark ? "rgba(34, 197, 94, 0.3)" : "#c3e6cb",
    },
    criar: {
      bg: isDark ? "rgba(34, 197, 94, 0.15)" : "#d4edda",
      color: isDark ? "#86efac" : "#155724",
      border: isDark ? "rgba(34, 197, 94, 0.3)" : "#c3e6cb",
    },
  };

  const currentColors = headerColors[configModo.modo] || headerColors.visualizar;

  return (
    <>
      <div
        style={{
          ...styles.header,
          backgroundColor: currentColors.bg,
          color: currentColors.color,
          borderColor: currentColors.border,
        }}
      >
        <h2 style={styles.headerTitle}>
          {configModo.modo === "criar"
            ? <><span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>payments</span> Criar Despesa</>
            : configModo.modo === "editar"
              ? <><span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>description</span> Informações da Despesa</>
              : <><span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>description</span> Informações da Despesa</>}
        </h2>
        <p style={styles.headerSubtitle}>
          {titulo ||
            (configModo.modo === "criar"
              ? "Preencha todos os campos obrigatórios conforme documentação oficial"
              : subtitle ||
                (modoVisualizacao
                  ? "Detalhes da despesa da emenda"
                  : `ID: ${despesaParaEditar?.id || ""} | Fornecedor: ${formData.fornecedor || ""}`))}
        </p>
      </div>

      {showSuccessMessage && (
        <div style={styles.successMessage}>
          <span style={styles.successIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: isDark ? "#86efac" : "#155724" }}>check_circle</span>
          </span>
          <span style={styles.successText}>
            {configModo.modo === "criar"
              ? "Despesa criada"
              : "Despesa atualizada"}{" "}
            com sucesso!
          </span>
        </div>
      )}
    </>
  );
};

const getStyles = (isDark) => ({
  // ===== Estilos para header com natureza (novo layout compacto) =====
  headerNatureza: {
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
    backgroundColor: isDark ? "var(--theme-surface, #1e293b)" : "#ffffff",
    border: `1px solid ${isDark ? "var(--theme-border, #334155)" : "#e2e8f0"}`,
    boxShadow: isDark ? "0 2px 6px rgba(0,0,0,0.2)" : "0 2px 6px rgba(0,0,0,0.06)",
  },
  naturezaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  naturezaInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: "200px",
  },
  naturezaCodigo: {
    fontFamily: "monospace",
    fontSize: "14px",
    fontWeight: 700,
    color: isDark ? "#60a5fa" : "#2563eb",
    backgroundColor: isDark ? "rgba(96, 165, 250, 0.15)" : "#eff6ff",
    padding: "4px 10px",
    borderRadius: "6px",
    marginRight: "8px",
  },
  naturezaDescricao: {
    fontSize: "14px",
    fontWeight: 500,
    color: isDark ? "var(--theme-text, #e2e8f0)" : "#1e293b",
  },
  saldoBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    padding: "10px 14px",
    borderRadius: "8px",
    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
    border: "2px solid",
    minWidth: "140px",
  },
  saldoLabel: {
    fontSize: "10px",
    fontWeight: 600,
    color: isDark ? "var(--theme-text-secondary, #94a3b8)" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "2px",
  },
  saldoValor: {
    fontSize: "18px",
    fontWeight: 700,
    fontFamily: "monospace",
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  progressBar: {
    flex: 1,
    height: "6px",
    backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "11px",
    fontWeight: 600,
    color: isDark ? "var(--theme-text-secondary, #94a3b8)" : "#64748b",
    minWidth: "80px",
    textAlign: "right",
  },
  emendaRef: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    paddingTop: "10px",
    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
  },
  emendaRefText: {
    fontSize: "12px",
    color: isDark ? "var(--theme-text-secondary, #94a3b8)" : "#64748b",
  },

  // ===== Estilos padrão (layout original) =====
  header: {
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    borderWidth: "2px",
    borderStyle: "solid",
  },
  headerTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    fontWeight: "bold",
  },
  headerSubtitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    opacity: 0.85,
  },
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : "#d4edda",
    color: isDark ? "#86efac" : "#155724",
    padding: "15px",
    borderRadius: "8px",
    border: isDark ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid #c3e6cb",
    marginBottom: "20px",
  },
  successIcon: {
    fontSize: "20px",
  },
  successText: {
    fontWeight: "bold",
  },
});

export default DespesaFormHeader;
