// src/components/FluxoEmenda.jsx - CORRIGIDO com fallback para onClose
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const PRIMARY = "#2563EB";
const ACCENT = "#3B82F6";
const SUCCESS = "#10B981";
const WARNING = "#F59E0B";
const ERROR = "#EF4444";
const WHITE = "#fff";

export default function FluxoEmenda({ emenda, onClose, onEdit }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // ✅ CORREÇÃO: Fallback para onClose
  const handleClose = () => {
    if (onClose && typeof onClose === "function") {
      onClose();
    } else {
      // Fallback: navegar de volta
      navigate(-1); // Volta para página anterior
    }
  };

  // ✅ Validação de props no início
  if (!emenda) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.errorContainer}>
          <h3 style={styles.errorTitle}><span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 6, verticalAlign: "middle" }}>cancel</span> Erro</h3>
          <p style={styles.errorMessage}>Dados da emenda não encontrados.</p>
          <button onClick={handleClose} style={styles.errorButton}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  const displayCNPJ = (cnpj) => {
    if (!cnpj) return "";
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    return cleanCNPJ.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  };

  const handleEditClick = () => {
    if (onEdit && typeof onEdit === "function") {
      onEdit(emenda);
    }
  };

  // Validação adicional nas métricas
  const valorTotal = emenda?.valorTotal || 0;
  const outrasComposicoes = emenda?.outrasComposicoes || 0;
  const saldoTotal = valorTotal + outrasComposicoes;
  const saldoDisponivel = emenda?.saldo || 0;
  const valorExecutado = saldoTotal - saldoDisponivel;
  const percentualExecutado =
    saldoTotal > 0 ? (valorExecutado / saldoTotal) * 100 : 0;

  // Verificar status da emenda
  const isAtiva = saldoDisponivel > 0;
  const isProximaVencimento = () => {
    if (!emenda?.validade) return false;
    const hoje = new Date();
    const vencimento = new Date(emenda.validade);
    const diasRestantes = Math.ceil(
      (vencimento - hoje) / (1000 * 60 * 60 * 24),
    );
    return diasRestantes <= 30 && diasRestantes > 0;
  };

  const isVencida = () => {
    if (!emenda?.validade) return false;
    return new Date(emenda.validade) < new Date();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        {/* Header do Modal */}
        <div style={styles.modalHeader}>
          <div style={styles.headerContent}>
            <h2 style={styles.modalTitle}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>description</span> Emenda {emenda?.numero || "S/N"}
            </h2>
            <div style={styles.statusContainer}>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: isAtiva ? SUCCESS : ERROR,
                }}
              >
                {isAtiva ? <><span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>check_circle</span> ATIVA</> : <><span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>cancel</span> ESGOTADA</>}
              </span>
              {isProximaVencimento() && (
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: WARNING,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>warning</span> PRÓX. VENCIMENTO
                </span>
              )}
              {isVencida() && (
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: ERROR,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>schedule</span> VENCIDA
                </span>
              )}
            </div>
          </div>
          <button onClick={handleClose} style={styles.closeButton}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div style={styles.modalContent}>
          {/* Seção: Visão Geral */}
          <div style={styles.overviewSection}>
            <div style={styles.metricas}>
              <div style={styles.metricaCard}>
                <h3 style={styles.metricaValor}>
                  {formatCurrency(valorTotal)}
                </h3>
                <p style={styles.metricaLabel}>Valor Total</p>
              </div>

              {outrasComposicoes > 0 && (
                <div style={styles.metricaCard}>
                  <h3 style={{ ...styles.metricaValor, color: ACCENT }}>
                    {formatCurrency(outrasComposicoes)}
                  </h3>
                  <p style={styles.metricaLabel}>Outras Composições</p>
                </div>
              )}

              <div style={styles.metricaCard}>
                <h3 style={{ ...styles.metricaValor, color: SUCCESS }}>
                  {formatCurrency(saldoDisponivel)}
                </h3>
                <p style={styles.metricaLabel}>Saldo Disponível</p>
              </div>

              <div style={styles.metricaCard}>
                <h3 style={{ ...styles.metricaValor, color: WARNING }}>
                  {percentualExecutado.toFixed(1)}%
                </h3>
                <p style={styles.metricaLabel}>Executado</p>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div style={styles.progressContainer}>
              <div style={styles.progressLabel}>
                Execução: {percentualExecutado.toFixed(1)}%
              </div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min(percentualExecutado, 100)}%`,
                    backgroundColor:
                      percentualExecutado >= 80
                        ? ERROR
                        : percentualExecutado >= 50
                          ? WARNING
                          : SUCCESS,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Seção: Identificação */}
          <div style={styles.detailSection}>
            <h3 style={styles.detailSectionTitle}><span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>description</span> Identificação</h3>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Número:</span>
                <span style={styles.detailValue}>{emenda?.numero || "-"}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Emenda:</span>
                <span style={styles.detailValue}>{emenda?.emenda || "-"}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Tipo:</span>
                <span style={styles.detailValue}>{emenda?.tipo || "-"}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Parlamentar:</span>
                <span style={styles.detailValue}>
                  {emenda?.parlamentar || "-"}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Validade:</span>
                <span
                  style={{
                    ...styles.detailValue,
                    color: isVencida()
                      ? ERROR
                      : isProximaVencimento()
                        ? WARNING
                        : "#333",
                  }}
                >
                  {formatDate(emenda?.validade)}
                </span>
              </div>
            </div>
          </div>

          {/* Seção: Localização */}
          <div style={styles.detailSection}>
            <h3 style={styles.detailSectionTitle}><span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>location_on</span> Localização</h3>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Município:</span>
                <span style={styles.detailValue}>
                  {emenda?.municipio || "-"}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>UF:</span>
                <span style={styles.detailValue}>{emenda?.uf || "-"}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>CNPJ:</span>
                <span style={styles.detailValue}>
                  {displayCNPJ(emenda?.cnpj)}
                </span>
              </div>
            </div>
          </div>

          {/* Seção: Proposta */}
          <div style={styles.detailSection}>
            <h3 style={styles.detailSectionTitle}><span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>article</span> Detalhes da Proposta</h3>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Objeto da Proposta:</span>
              <div style={styles.detailTextArea}>
                {emenda?.objetoProposta || "-"}
              </div>
            </div>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>GND:</span>
                <span style={styles.detailValue}>{emenda?.gnd || "-"}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Funcional:</span>
                <span style={styles.detailValue}>
                  {emenda?.funcional || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Seção: Cronograma */}
          <div style={styles.detailSection}>
            <h3 style={styles.detailSectionTitle}><span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>calendar_today</span> Cronograma</h3>
            <div style={styles.cronogramaGrid}>
              <div style={styles.cronogramaItem}>
                <span style={styles.cronogramaLabel}>Data da OB</span>
                <span style={styles.cronogramaData}>
                  {formatDate(emenda?.dataOb)}
                </span>
              </div>
              <div style={styles.cronogramaItem}>
                <span style={styles.cronogramaLabel}>Início da Execução</span>
                <span style={styles.cronogramaData}>
                  {formatDate(emenda?.inicioExecucao)}
                </span>
              </div>
              <div style={styles.cronogramaItem}>
                <span style={styles.cronogramaLabel}>Final da Execução</span>
                <span style={styles.cronogramaData}>
                  {formatDate(emenda?.finalExecucao)}
                </span>
              </div>
              <div style={styles.cronogramaItem}>
                <span style={styles.cronogramaLabel}>Validade</span>
                <span
                  style={{
                    ...styles.cronogramaData,
                    color: isVencida()
                      ? ERROR
                      : isProximaVencimento()
                        ? WARNING
                        : SUCCESS,
                  }}
                >
                  {formatDate(emenda?.validade)}
                </span>
              </div>
            </div>
          </div>

          {/* Seção: Metadados */}
          <div style={styles.detailSection}>
            <h3 style={styles.detailSectionTitle}><span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>analytics</span> Informações do Sistema</h3>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Criado em:</span>
                <span style={styles.detailValue}>
                  {emenda?.createdAt ? formatDate(emenda.createdAt) : "N/A"}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Última atualização:</span>
                <span style={styles.detailValue}>
                  {emenda?.updatedAt ? formatDate(emenda.updatedAt) : "N/A"}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>ID do Sistema:</span>
                <span style={styles.detailValue}>{emenda?.id || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer do Modal */}
        <div style={styles.modalFooter}>
          <button onClick={handleEditClick} style={styles.editButton}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>edit</span> Editar Emenda
          </button>
          <button onClick={handleClose} style={styles.closeModalButton}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 20,
  },

  modalContainer: {
    backgroundColor: "var(--theme-surface, #fff)",
    borderRadius: 12,
    maxWidth: "95vw",
    maxHeight: "95vh",
    width: "100%",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 24px",
    borderBottom: "2px solid var(--theme-border, #f0f0f0)",
    backgroundColor: "var(--theme-surface-secondary, #f8f9fa)",
    borderRadius: "12px 12px 0 0",
  },

  headerContent: {
    flex: 1,
  },

  modalTitle: {
    color: PRIMARY,
    fontSize: 24,
    fontWeight: "600",
    margin: 0,
    marginBottom: 12,
  },

  statusContainer: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  statusBadge: {
    padding: "4px 8px",
    borderRadius: 12,
    color: WHITE,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  closeButton: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "var(--theme-text-secondary, #666)",
    padding: 8,
    borderRadius: 4,
    marginLeft: 16,
  },

  modalContent: {
    padding: 24,
    flex: 1,
    overflowY: "auto",
  },

  overviewSection: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: "var(--theme-surface-secondary, #f8f9fa)",
    borderRadius: 8,
    border: "1px solid var(--theme-border, #e9ecef)",
  },

  metricas: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },

  metricaCard: {
    textAlign: "center",
    padding: 16,
    backgroundColor: "var(--theme-surface, #fff)",
    borderRadius: 8,
    border: "1px solid var(--theme-border, #e9ecef)",
  },

  metricaValor: {
    fontSize: 18,
    fontWeight: "600",
    margin: 0,
    marginBottom: 8,
    color: PRIMARY,
  },

  metricaLabel: {
    fontSize: 12,
    color: "var(--theme-text-secondary, #666)",
    margin: 0,
    textTransform: "uppercase",
    fontWeight: "500",
  },

  progressContainer: {
    marginTop: 16,
  },

  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY,
    marginBottom: 8,
  },

  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "var(--theme-border)",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    transition: "width 0.5s ease",
  },

  detailSection: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: "var(--theme-surface-secondary, #f8f9fa)",
    borderRadius: 8,
    border: "1px solid var(--theme-border, #e9ecef)",
  },

  detailSectionTitle: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: "2px solid var(--theme-border, #e9ecef)",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "var(--theme-text-secondary, #666)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "var(--theme-text, #333)",
    backgroundColor: "var(--theme-surface, #fff)",
    padding: "8px 12px",
    borderRadius: 4,
    border: "1px solid var(--theme-border, #e9ecef)",
  },

  detailTextArea: {
    fontSize: 14,
    color: "var(--theme-text, #333)",
    backgroundColor: "var(--theme-surface, #fff)",
    padding: "12px",
    borderRadius: 4,
    border: "1px solid var(--theme-border, #e9ecef)",
    lineHeight: 1.5,
    minHeight: 60,
  },

  cronogramaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },

  cronogramaItem: {
    backgroundColor: "var(--theme-surface, #fff)",
    padding: 16,
    borderRadius: 8,
    border: "1px solid var(--theme-border, #e9ecef)",
    textAlign: "center",
  },

  cronogramaLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: "600",
    color: "var(--theme-text-secondary, #666)",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  cronogramaData: {
    display: "block",
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY,
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    padding: "20px 24px",
    borderTop: "1px solid var(--theme-border, #f0f0f0)",
    backgroundColor: "var(--theme-surface-secondary, #f8f9fa)",
    borderRadius: "0 0 12px 12px",
  },

  editButton: {
    backgroundColor: ACCENT,
    color: WHITE,
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  closeModalButton: {
    backgroundColor: "var(--secondary)",
    color: WHITE,
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "500",
    cursor: "pointer",
  },

  // ✅ CORREÇÃO: Estilos para tela de erro
  errorContainer: {
    backgroundColor: "var(--theme-surface, #fff)",
    padding: 40,
    borderRadius: 12,
    textAlign: "center",
    maxWidth: 400,
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },

  errorTitle: {
    color: ERROR,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },

  errorMessage: {
    color: "var(--theme-text-secondary, #666)",
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 1.5,
  },

  errorButton: {
    backgroundColor: ERROR,
    color: WHITE,
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};
