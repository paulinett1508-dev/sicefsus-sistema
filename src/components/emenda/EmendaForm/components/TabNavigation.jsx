// src/components/emenda/EmendaForm/components/TabNavigation.jsx
// Componente de navegação por abas
// ✅ NÃO PRECISA DE ALTERAÇÃO - Já funciona perfeitamente com as novas abas

import React from "react";

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div style={styles.container}>
      <div style={styles.tabsWrapper}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive),
            }}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span style={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: "24px",
    borderBottom: "2px solid #e9ecef",
  },
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
  tabActive: {
    color: "#2563EB",
    borderBottomColor: "#2563EB",
    backgroundColor: "#f0f9ff",
  },
  tabInactive: {
    color: "#6b7280",
    borderBottomColor: "transparent",
  },
  tabIcon: {
    fontSize: "18px",
  },
  tabLabel: {
    whiteSpace: "nowrap",
  },
};

export default TabNavigation;
