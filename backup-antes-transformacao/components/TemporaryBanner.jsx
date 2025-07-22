// src/components/TemporaryBanner.jsx - Banner Temporário que Aparece e Desaparece
import React, { useState, useEffect } from "react";

const TemporaryBanner = ({
  isVisible,
  message,
  type = "warning",
  duration = 3000,
  onClose,
}) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Animação de entrada
      setTimeout(() => setAnimate(true), 50);

      // Auto-dismiss após duration
      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleHide();
    }
  }, [isVisible, duration]);

  const handleHide = () => {
    setAnimate(false);
    setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, 300);
  };

  const getStylesByType = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#d4edda",
          borderColor: "#c3e6cb",
          color: "#155724",
          icon: "✅",
        };
      case "error":
        return {
          backgroundColor: "#f8d7da",
          borderColor: "#f5c6cb",
          color: "#721c24",
          icon: "❌",
        };
      case "info":
        return {
          backgroundColor: "#d1ecf1",
          borderColor: "#bee5eb",
          color: "#0c5460",
          icon: "ℹ️",
        };
      default: // warning
        return {
          backgroundColor: "#fff3cd",
          borderColor: "#ffeaa7",
          color: "#856404",
          icon: "⚠️",
        };
    }
  };

  if (!show) return null;

  const typeStyles = getStylesByType();

  return (
    <div
      style={{
        ...styles.banner,
        ...typeStyles,
        transform: animate ? "translateY(0)" : "translateY(-100%)",
        opacity: animate ? 1 : 0,
      }}
    >
      <div style={styles.content}>
        <span style={styles.icon}>{typeStyles.icon}</span>
        <span style={styles.message}>{message}</span>
      </div>

      <button onClick={handleHide} style={styles.closeButton} title="Fechar">
        ✕
      </button>
    </div>
  );
};

const styles = {
  banner: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10000,
    padding: "12px 20px",
    borderRadius: "8px",
    border: "1px solid",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "400px",
    maxWidth: "600px",
    transition: "all 0.3s ease-out",
    backdropFilter: "blur(5px)",
  },

  content: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },

  icon: {
    fontSize: "16px",
  },

  message: {
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: 1.4,
  },

  closeButton: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    opacity: 0.7,
    padding: "0",
    marginLeft: "12px",
    transition: "opacity 0.2s ease",
    color: "inherit",
  },
};

export default TemporaryBanner;
