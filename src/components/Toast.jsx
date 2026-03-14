// Toast.jsx - SISTEMA CORRIGIDO v2.0
// ✅ CORREÇÃO: Hook useToast compatível
// ✅ CORREÇÃO: Função showToast sempre disponível
// ✅ CORREÇÃO: Provider context otimizado

import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => showToast(message, "success", duration),
    [showToast],
  );
  const error = useCallback(
    (message, duration) => showToast(message, "error", duration),
    [showToast],
  );
  const warning = useCallback(
    (message, duration) => showToast(message, "warning", duration),
    [showToast],
  );
  const info = useCallback(
    (message, duration) => showToast(message, "info", duration),
    [showToast],
  );

  const value = {
    toasts,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

// ✅ CORREÇÃO: Hook sempre retorna funções válidas
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    // ✅ Fallback para quando não há provider
    console.warn(
      "useToast usado fora do ToastProvider - usando console como fallback",
    );
    return {
      showToast: (message, type) =>
        console.log(`[${type?.toUpperCase() || "INFO"}] ${message}`),
      success: (message) => console.log(`[SUCCESS] ${message}`),
      error: (message) => console.error(`[ERROR] ${message}`),
      warning: (message) => console.warn(`[WARNING] ${message}`),
      info: (message) => console.info(`[INFO] ${message}`),
      hideToast: () => {},
      toasts: [],
    };
  }

  return context;
};

const ToastContainer = ({ toasts, onHide }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onHide={() => onHide(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onHide }) => {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>;
      case "error":
        return <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span>;
      case "warning":
        return <span className="material-symbols-outlined" style={{ fontSize: 16 }}>warning</span>;
      default:
        return <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>;
    }
  };

  const getStyles = () => {
    const baseStyle = styles.toast;
    switch (toast.type) {
      case "success":
        return { ...baseStyle, ...styles.success };
      case "error":
        return { ...baseStyle, ...styles.error };
      case "warning":
        return { ...baseStyle, ...styles.warning };
      default:
        return { ...baseStyle, ...styles.info };
    }
  };

  return (
    <div style={getStyles()}>
      <span style={styles.icon}>{getIcon()}</span>
      <span style={styles.message}>{toast.message}</span>
      <button onClick={onHide} style={styles.closeButton}>
        ×
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 400,
    width: "100%",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    animation: "slideIn 0.3s ease-out",
    fontSize: 14,
    fontWeight: 500,
    maxWidth: "100%",
    wordBreak: "break-word",
  },
  success: {
    backgroundColor: "var(--success-bg)",
    color: "var(--success-fg)",
    border: "1px solid var(--success-light)",
  },
  error: {
    backgroundColor: "var(--danger-bg)",
    color: "var(--danger-fg)",
    border: "1px solid var(--error-light)",
  },
  warning: {
    backgroundColor: "var(--warning-bg)",
    color: "var(--warning-fg)",
    border: "1px solid var(--warning-light)",
  },
  info: {
    backgroundColor: "var(--info-bg)",
    color: "var(--info-fg)",
    border: "1px solid var(--info-light)",
  },
  icon: {
    fontSize: 16,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    lineHeight: 1.4,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "inherit",
    opacity: 0.7,
    padding: 0,
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};

// CSS para animação
const toastCSS = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .toast-container {
    left: 10px !important;
    right: 10px !important;
    top: 10px !important;
    max-width: none !important;
  }
}
`;

// Inserir CSS dinamicamente
if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("toast-styles");
  if (!existingStyle) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = toastCSS;
    document.head.appendChild(style);
  }
}

export default ToastProvider;
