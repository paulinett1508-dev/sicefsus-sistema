// src/components/admin/AdminTabs.jsx
import React from "react";

const AdminTabs = ({ activeTab, setActiveTab, usersCount, logsCount, isSuperAdmin = false }) => {
  const allTabs = [
    { id: "usuarios", label: "👥 Usuários", icon: "👥", showAlways: true },
    { id: "logs", label: "📊 Logs", icon: "📊", showAlways: true },
    { id: "rules", label: "🔐 Firestore Rules", icon: "🔐", superAdminOnly: true },
    { id: "migracao", label: "🔄 Migração", icon: "🔄", superAdminOnly: true },
  ];
  
  const tabs = allTabs.filter(tab => tab.showAlways || (tab.superAdminOnly && isSuperAdmin));
  
  console.log("🔍 AdminTabs Debug:", {
    isSuperAdmin,
    totalTabs: allTabs.length,
    visibleTabs: tabs.length,
    tabsVisiveis: tabs.map(t => t.id),
    tabsConfig: allTabs.map(t => ({
      id: t.id,
      superAdminOnly: t.superAdminOnly,
      showAlways: t.showAlways,
      visible: t.showAlways || (t.superAdminOnly && isSuperAdmin)
    }))
  });

  return (
    <div style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            ...styles.tabButton,
            ...(activeTab === tab.id ? styles.tabButtonActive : {}),
          }}
        >
          {tab.label}
        </button>
      ))}
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