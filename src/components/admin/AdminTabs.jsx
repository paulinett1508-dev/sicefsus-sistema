// src/components/admin/AdminTabs.jsx
import React from "react";

const AdminTabs = ({ activeTab, setActiveTab, usersCount, logsCount }) => {
  return (
    <div style={styles.tabsContainer}>
      <button
        onClick={() => setActiveTab("users")}
        style={{
          ...styles.tabButton,
          ...(activeTab === "users" ? styles.tabButtonActive : {}),
        }}
      >
        👥 Usuários ({usersCount})
      </button>
      <button
        onClick={() => setActiveTab("logs")}
        style={{
          ...styles.tabButton,
          ...(activeTab === "logs" ? styles.tabButtonActive : {}),
        }}
      >
        📋 Logs de Auditoria ({logsCount})
      </button>
    </div>
  );
};

const styles = {
  tabsContainer: {
    display: "flex",
    marginBottom: "24px",
    borderBottom: "2px solid #e9ecef",
    backgroundColor: "white",
    borderRadius: "8px 8px 0 0",
    padding: "0 24px",
  },
  tabButton: {
    padding: "16px 24px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    color: "#6c757d",
    cursor: "pointer",
    borderBottomWidth: "3px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    transition: "all 0.2s ease",
  },
  tabButtonActive: {
    color: "#007bff",
    borderBottomColor: "#007bff",
    backgroundColor: "rgba(0, 123, 255, 0.1)",
  },
};

export default AdminTabs;
