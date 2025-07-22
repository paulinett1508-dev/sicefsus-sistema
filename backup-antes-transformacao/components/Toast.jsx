// src/components/Toast.jsx
import React, { useState, useEffect, createContext, useContext } from "react";

const ToastContext = createContext();

// Hook para usar o toast em qualquer componente
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
};

// Provider do Toast - deve envolver toda a aplicação
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    // Auto remove após duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Métodos de conveniência
  const success = (message, duration = 4000) =>
    addToast(message, "success", duration);
  const error = (message, duration = 6000) =>
    addToast(message, "error", duration);
  const warning = (message, duration = 5000) =>
    addToast(message, "warning", duration);
  const info = (message, duration = 4000) =>
    addToast(message, "info", duration);

  const value = {
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    toasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Componente individual do Toast
function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = {
      ...styles.toast,
      transform: isVisible && !isLeaving ? "translateX(0)" : "translateX(100%)",
      opacity: isVisible && !isLeaving ? 1 : 0,
    };

    switch (toast.type) {
      case "success":
        return { ...baseStyles, ...styles.success };
      case "error":
        return { ...baseStyles, ...styles.error };
      case "warning":
        return { ...baseStyles, ...styles.warning };
      default:
        return { ...baseStyles, ...styles.info };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div style={getToastStyles()}>
      <div style={styles.content}>
        <span style={styles.icon}>{getIcon()}</span>
        <span style={styles.message}>{toast.message}</span>
      </div>
      <button
        onClick={handleRemove}
        style={styles.closeButton}
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
}

// Container dos Toasts
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Estilos do componente
const styles = {
  container: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxWidth: 400,
    pointerEvents: "none", // Permite cliques através do container
  },
  toast: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",
    minWidth: 300,
    maxWidth: 400,
    wordBreak: "break-word",
    pointerEvents: "auto", // Reativa cliques no toast
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  icon: {
    fontSize: 16,
    flexShrink: 0,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    lineHeight: 1.4,
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    padding: "4px 6px",
    marginLeft: 8,
    borderRadius: 4,
    opacity: 0.7,
    fontSize: 12,
    flexShrink: 0,
    transition: "opacity 0.2s",
    ":hover": {
      opacity: 1,
    },
  },
  success: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  error: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  warning: {
    background: "#fff3cd",
    color: "#856404",
    border: "1px solid #ffeaa7",
  },
  info: {
    background: "#d1ecf1",
    color: "#0c5460",
    border: "1px solid #bee5eb",
  },
};

// CSS para animações (adicionar ao App.css)
const cssAnimations = `
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Hover effect para close button */
.toast-close-button:hover {
  opacity: 1 !important;
  background-color: rgba(0,0,0,0.1);
}

/* Responsividade para mobile */
@media (max-width: 480px) {
  .toast-container {
    left: 10px;
    right: 10px;
    top: 10px;
  }

  .toast-item {
    min-width: auto;
    max-width: none;
  }
}
`;

export { cssAnimations };
export default ToastProvider;
