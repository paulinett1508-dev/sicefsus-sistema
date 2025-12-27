// src/components/ThemeToggleButton.jsx
// Botão flutuante para alternar entre dark/light mode
import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={styles.button}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <span className="material-symbols-outlined" style={styles.icon}>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}

const styles = {
  button: {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 9999,
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "var(--theme-surface)",
    border: "1px solid var(--theme-border)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  icon: {
    fontSize: 22,
    color: "var(--theme-text)",
  },
};
