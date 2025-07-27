// src/components/PrimeiraDespesaModal.jsx
// ✅ MODAL UX MELHORADO - Componente para primeira despesa

import React from "react";

const PrimeiraDespesaModal = ({ isOpen, onConfirm, onCancel, emendaInfo }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header com ícone */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>💰</span>
          </div>
          <h2 style={styles.title}>Primeira Despesa</h2>
          <p style={styles.subtitle}>
            Esta emenda ainda não possui despesas registradas
          </p>
        </div>

        {/* Conteúdo principal */}
        <div style={styles.content}>
          {/* Card da emenda */}
          <div style={styles.emendaCard}>
            <div style={styles.emendaHeader}>
              <span style={styles.emendaIcon}>📄</span>
              <div style={styles.emendaInfo}>
                <h3 style={styles.emendaTitle}>
                  {emendaInfo?.parlamentar || "Emenda Selecionada"}
                </h3>
                <p style={styles.emendaDetails}>
                  {emendaInfo?.numero && `Nº ${emendaInfo.numero} • `}
                  {emendaInfo?.municipio &&
                    `${emendaInfo.municipio}/${emendaInfo.uf}`}
                </p>
              </div>
            </div>
            {emendaInfo?.valorRecurso && (
              <div style={styles.valorContainer}>
                <span style={styles.valorLabel}>Valor Total:</span>
                <span style={styles.valorValue}>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(emendaInfo.valorRecurso)}
                </span>
              </div>
            )}
          </div>

          {/* Benefícios */}
          <div style={styles.benefitsContainer}>
            <h4 style={styles.benefitsTitle}>
              🎯 Ao criar a primeira despesa você poderá:
            </h4>
            <ul style={styles.benefitsList}>
              <li style={styles.benefitItem}>
                <span style={styles.benefitIcon}>✅</span>
                Iniciar o controle de execução orçamentária
              </li>
              <li style={styles.benefitItem}>
                <span style={styles.benefitIcon}>📊</span>
                Acompanhar o saldo disponível em tempo real
              </li>
              <li style={styles.benefitItem}>
                <span style={styles.benefitIcon}>📈</span>
                Gerar relatórios de acompanhamento
              </li>
            </ul>
          </div>

          {/* Ação sugerida */}
          <div style={styles.actionSuggestion}>
            <div style={styles.suggestionIcon}>💡</div>
            <div style={styles.suggestionText}>
              <strong>Sugestão:</strong> Comece registrando a primeira despesa
              para ativar o controle financeiro completo desta emenda.
            </div>
          </div>
        </div>

        {/* Footer com ações */}
        <div style={styles.footer}>
          <button
            onClick={onCancel}
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <span style={styles.buttonIcon}>👀</span>
            Apenas Visualizar
          </button>

          <button
            onClick={onConfirm}
            style={styles.confirmButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(39, 174, 96, 0.3)";
            }}
          >
            <span style={styles.buttonIcon}>➕</span>
            Criar Primeira Despesa
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ ESTILOS DO MODAL COM DARK MODE
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(8px)",
    animation: "fadeIn 0.3s ease",
  },

  modal: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "16px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    border: "1px solid var(--theme-border)",
    animation: "slideUp 0.3s ease",
  },

  header: {
    padding: "32px 24px 24px",
    textAlign: "center",
    background:
      "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
    color: "var(--white)",
    position: "relative",
  },

  iconContainer: {
    width: "64px",
    height: "64px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
  },

  icon: {
    fontSize: "28px",
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--white)",
  },

  subtitle: {
    margin: 0,
    fontSize: "14px",
    opacity: 0.9,
    color: "var(--white)",
  },

  content: {
    padding: "24px",
  },

  emendaCard: {
    backgroundColor: "var(--theme-surface-secondary)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px solid var(--theme-border)",
  },

  emendaHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },

  emendaIcon: {
    fontSize: "24px",
    marginTop: "2px",
  },

  emendaInfo: {
    flex: 1,
  },

  emendaTitle: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--primary)",
  },

  emendaDetails: {
    margin: 0,
    fontSize: "14px",
    color: "var(--theme-text-secondary)",
  },

  valorContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "var(--success-light)",
    borderRadius: "8px",
    border: "1px solid var(--success)",
  },

  valorLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--success-dark)",
  },

  valorValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--success-dark)",
    fontFamily: "monospace",
  },

  benefitsContainer: {
    marginBottom: "24px",
  },

  benefitsTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },

  benefitsList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },

  benefitItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
    fontSize: "14px",
    color: "var(--theme-text)",
  },

  benefitIcon: {
    fontSize: "16px",
    minWidth: "20px",
  },

  actionSuggestion: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "var(--warning-light)",
    borderRadius: "8px",
    border: "1px solid var(--warning)",
  },

  suggestionIcon: {
    fontSize: "20px",
    marginTop: "2px",
  },

  suggestionText: {
    fontSize: "14px",
    color: "var(--warning-dark)",
    lineHeight: "1.5",
  },

  footer: {
    display: "flex",
    gap: "12px",
    padding: "20px 24px",
    backgroundColor: "var(--theme-surface-secondary)",
    borderTop: "1px solid var(--theme-border)",
  },

  cancelButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
    border: "2px solid var(--theme-border)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  confirmButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "var(--success)",
    color: "var(--white)",
    border: "2px solid var(--success)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(39, 174, 96, 0.3)",
  },

  buttonIcon: {
    fontSize: "16px",
  },
};

export default PrimeiraDespesaModal;
