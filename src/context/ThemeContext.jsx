// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const THEME_KEY = "sicefsus_theme";

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Verificar localStorage primeiro
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === "dark";
    // Fallback: preferência do sistema
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Salvar preferência
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");

    // Aplicar classe no documento
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    // Atualizar meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#0F172A" : "#F8FAFC");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const setTheme = (dark) => setIsDark(dark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}

export default ThemeContext;
