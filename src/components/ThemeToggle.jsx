// src/components/ThemeToggle.jsx - Versão sem contexto
import React, { useState, useEffect } from "react";

export default function ThemeToggle({ compact = false }) {
  const [theme, setTheme] = useState("light");

  // Carregar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem("sicefsus-theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Aplicar tema ao documento
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sicefsus-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      style={compact ? styles.compactButton : styles.button}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}

const styles = {
  button: {
    background: "var(--theme-surface, #ffffff)",
    border: "2px solid var(--theme-border, #dee2e6)",
    color: "var(--theme-text, #212529)",
    borderRadius: "50%",
    padding: "12px",
    cursor: "pointer",
    fontSize: "18px",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  compactButton: {
    background: "var(--theme-surface, #ffffff)",
    border: "2px solid var(--theme-border, #dee2e6)",
    color: "var(--theme-text, #212529)",
    borderRadius: "50%",
    padding: "8px",
    cursor: "pointer",
    fontSize: "16px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
};
