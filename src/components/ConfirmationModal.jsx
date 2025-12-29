// src/components/ConfirmationModal.jsx - Modal de Confirmação Personalizado
import React from "react";

const ConfirmationModal = ({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning", // warning, danger, info, save
}) => {
  if (!isVisible) return null;

  const getIconByType = () => {
    switch (type) {
      case "danger":
        return <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--error)" }}>error</span>;
      case "info":
        return <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--info)" }}>info</span>;
      case "save":
        return <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--success)" }}>save</span>;
      default:
        return <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--warning)" }}>warning</span>;
    }
  };

  const getColorByType = () => {
    switch (type) {
      case "danger":
        return "var(--error)";
      case "info":
        return "var(--info)";
      case "save":
        return "var(--success)";
      default:
        return "var(--warning)";
    }
  };

  // Handler para clique no overlay (fechar modal)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>{getIconByType()}</span>
          </div>
          <h3 style={styles.title}>{title}</h3>
        </div>

        <div style={styles.body}>
          {typeof message === 'string' ? (
            <p style={styles.message}>{message}</p>
          ) : (
            <div style={styles.message}>{message}</div>
          )}
        </div>

        <div style={styles.footer}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("❌ Modal cancelado pelo usuário");
              onCancel();
            }} 
            style={styles.cancelButton}
            type="button"
          >
            {cancelText}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("✅ Modal confirmado pelo usuário");
              onConfirm();
            }}
            style={{
              ...styles.confirmButton,
              backgroundColor: getColorByType(),
            }}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    animation: "fadeIn 0.2s ease-out",
  },

  modal: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "12px",
    maxWidth: "450px",
    width: "90%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
    border: "1px solid var(--theme-border)",
  },

  header: {
    padding: "24px 24px 16px 24px",
    textAlign: "center",
  },

  iconContainer: {
    marginBottom: "16px",
  },

  icon: {
    fontSize: "48px",
  },

  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--theme-text)",
    margin: 0,
  },

  body: {
    padding: "0 24px 24px 24px",
    textAlign: "center",
  },

  message: {
    fontSize: "16px",
    color: "var(--theme-text-secondary)",
    lineHeight: 1.5,
    margin: 0,
  },

  footer: {
    display: "flex",
    gap: "12px",
    padding: "0 24px 24px 24px",
  },

  cancelButton: {
    flex: 1,
    padding: "12px 20px",
    border: "1px solid var(--theme-border)",
    borderRadius: "6px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text-secondary)",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  confirmButton: {
    flex: 1,
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    color: "var(--white)",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

// CSS para animações
const modalCSS = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    transform: translateY(-50px) scale(0.9);
    opacity: 0;
  }
  to { 
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
`;

// Inserir CSS dinamicamente
if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("confirmation-modal-styles");
  if (!existingStyle) {
    const style = document.createElement("style");
    style.id = "confirmation-modal-styles";
    style.textContent = modalCSS;
    document.head.appendChild(style);
  }
}

export default ConfirmationModal;
