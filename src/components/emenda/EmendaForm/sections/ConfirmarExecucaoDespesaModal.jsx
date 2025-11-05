// src/components/emenda/EmendaForm/sections/ConfirmarExecucaoDespesaModal.jsx
// 🎯 MODAL DE CONFIRMAÇÃO ANTES DE EXECUTAR DESPESA

import React from "react";
import { formatCurrency } from "../../../../utils/formatters";

const ConfirmarExecucaoDespesaModal = ({
  isOpen,
  onConfirm,
  onCancel,
  despesa,
  saldoAtual,
}) => {
  if (!isOpen || !despesa) return null;

  const valorDespesa = parseFloat(despesa.valor) || 0;
  const novoSaldo = saldoAtual - valorDespesa;
  const saldoNegativo = novoSaldo < 0;

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>⚠️ Confirmar Execução de Despesa</h2>
          <button onClick={onCancel} style={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div style={styles.content}>
          <div style={styles.alertBox}>
            <div style={styles.alertIcon}>💡</div>
            <div style={styles.alertText}>
              Ao executar esta despesa, o valor será{" "}
              <strong>descontado do saldo disponível</strong> da emenda,
              independente do status de pagamento inicial.
            </div>
          </div>

          {/* Informações da Despesa */}
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>📋 Detalhes da Despesa</h3>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Natureza:</span>
              <span style={styles.infoValue}>
                {despesa.estrategia || despesa.naturezaDespesa}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Valor a executar:</span>
              <span style={{ ...styles.infoValue, ...styles.valorDestaque }}>
                {formatCurrency(valorDespesa)}
              </span>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Saldo atual da emenda:</span>
              <span style={styles.infoValue}>{formatCurrency(saldoAtual)}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Novo saldo após execução:</span>
              <span
                style={{
                  ...styles.infoValue,
                  color: saldoNegativo ? "#dc3545" : "#28a745",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(novoSaldo)}
              </span>
            </div>
          </div>

          {/* Alerta de saldo negativo */}
          {saldoNegativo && (
            <div style={styles.warningBox}>
              <div style={styles.warningIcon}>⚠️</div>
              <div>
                <strong>Atenção:</strong> A execução desta despesa resultará em{" "}
                <strong>saldo negativo</strong>. Você tem certeza que deseja
                continuar?
              </div>
            </div>
          )}

          {/* Info adicional */}
          <div style={styles.footerInfo}>
            <p style={styles.footerText}>
              ✓ A despesa será marcada como <strong>EXECUTADA</strong>
            </p>
            <p style={styles.footerText}>
              ✓ Você poderá preencher os dados completos (empenho, fornecedor,
              etc.) na próxima tela
            </p>
            <p style={styles.footerText}>
              ✓ A despesa planejada será removida da lista de planejamento
            </p>
          </div>
        </div>

        {/* Footer - Botões */}
        <div style={styles.footer}>
          <button onClick={onCancel} style={styles.btnCancelar}>
            ❌ Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={
              saldoNegativo ? styles.btnConfirmarWarning : styles.btnConfirmar
            }
          >
            ✅ Sim, executar despesa
          </button>
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (valor) => {
  return (Number(valor) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "2px solid #e9ecef",
    backgroundColor: "#fff3cd",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold",
    color: "#856404",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    color: "#6c757d",
    cursor: "pointer",
    padding: "0",
    width: "32px",
    height: "32px",
  },
  content: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  alertBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#d1ecf1",
    border: "1px solid #bee5eb",
    borderLeft: "4px solid #17a2b8",
    borderRadius: "6px",
    alignItems: "flex-start",
  },
  alertIcon: {
    fontSize: "24px",
    flexShrink: 0,
  },
  alertText: {
    fontSize: "14px",
    color: "#0c5460",
    lineHeight: "1.5",
  },
  infoSection: {
    backgroundColor: "#f8f9fa",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  },
  infoTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#154360",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: "14px",
    color: "#6c757d",
  },
  infoValue: {
    fontSize: "14px",
    color: "#495057",
    fontWeight: "500",
  },
  valorDestaque: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#154360",
  },
  divider: {
    height: "1px",
    backgroundColor: "#dee2e6",
    margin: "12px 0",
  },
  warningBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderLeft: "4px solid #ffc107",
    borderRadius: "6px",
    alignItems: "flex-start",
  },
  warningIcon: {
    fontSize: "24px",
    flexShrink: 0,
  },
  footerInfo: {
    backgroundColor: "#e7f3ff",
    padding: "16px",
    borderRadius: "6px",
    border: "1px solid #b3d9ff",
  },
  footerText: {
    margin: "8px 0",
    fontSize: "13px",
    color: "#004085",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "20px 24px",
    borderTop: "2px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },
  btnCancelar: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnConfirmar: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(40, 167, 69, 0.2)",
  },
  btnConfirmarWarning: {
    backgroundColor: "#ffc107",
    color: "#000",
    border: "none",
    padding: "12px 32px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(255, 193, 7, 0.2)",
  },
};

export default ConfirmarExecucaoDespesaModal;
