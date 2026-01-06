// src/components/emenda/EmendaForm/components/TabNavigation.jsx
// Componente de navegação por abas com suporte a dark mode

import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  const { isDark } = useTheme();

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    container: {
      marginBottom: "24px",
      borderBottom: `2px solid ${isDark ? "var(--theme-border)" : "#e9ecef"}`,
    },
    tabActive: {
      color: "var(--primary)",
      borderBottomColor: "var(--primary)",
      backgroundColor: isDark ? "rgba(37, 99, 235, 0.1)" : "#f0f9ff",
    },
    tabInactive: {
      color: isDark ? "var(--theme-text-secondary)" : "#6b7280",
      borderBottomColor: "transparent",
    },
  };

  return (
    <div style={dynamicStyles.container}>
      <div style={styles.tabsWrapper}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? dynamicStyles.tabActive : dynamicStyles.tabInactive),
            }}
          >
            <span className="material-symbols-outlined" style={styles.tabIcon}>{tab.icon}</span>
            <span style={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  tabsWrapper: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    border: "none",
    borderBottom: "3px solid transparent",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    outline: "none",
  },
  tabIcon: {
    fontSize: "18px",
  },
  tabLabel: {
    whiteSpace: "nowrap",
  },
};

export default TabNavigation;
