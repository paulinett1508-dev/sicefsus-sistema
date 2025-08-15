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
        return "🚨";
      case "info":
        return "ℹ️";
      case "save":
        return "💾";
      default:
        return "⚠️";
    }
  };

  const getColorByType = () => {
    switch (type) {
      case "danger":
        return "#dc3545";
      case "info":
        return "#007bff";
      case "save":
        return "#28a745";
      default:
        return "#ffc107";
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
          <button onClick={onCancel} style={styles.cancelButton}>
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{
              ...styles.confirmButton,
              backgroundColor: getColorByType(),
            }}
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
    backgroundColor: "white",
    borderRadius: "12px",
    maxWidth: "450px",
    width: "90%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
    border: "1px solid #e9ecef",
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
    color: "#2c3e50",
    margin: 0,
  },

  body: {
    padding: "0 24px 24px 24px",
    textAlign: "center",
  },

  message: {
    fontSize: "16px",
    color: "#495057",
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
    border: "1px solid #6c757d",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#6c757d",
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
    color: "white",
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
