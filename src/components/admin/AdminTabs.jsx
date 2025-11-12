// src/components/admin/AdminTabs.jsx
import React from "react";

const AdminTabs = ({ activeTab, setActiveTab, usersCount, logsCount, isSuperAdmin = false }) => {
  console.log("🎬 AdminTabs RENDER - Props recebidas:", {
    activeTab,
    usersCount,
    logsCount,
    isSuperAdmin,
    typeOfSuperAdmin: typeof isSuperAdmin
  });

  const allTabs = [
    { id: "usuarios", label: "👥 Usuários", icon: "👥", showAlways: true },
    { id: "logs", label: "📊 Logs", icon: "📊", showAlways: true },
    { id: "rules", label: "🔐 Firestore Rules", icon: "🔐", superAdminOnly: true },
    { id: "migracao", label: "🔄 Migração", icon: "🔄", superAdminOnly: true },
  ];

  const tabs = allTabs.filter(tab => {
    // ✅ CORREÇÃO: Garantir que isSuperAdmin seja booleano
    const isSuperAdminBool = Boolean(isSuperAdmin);
    const shouldShow = tab.showAlways === true || (tab.superAdminOnly === true && isSuperAdminBool === true);

    console.log(`🔍 Tab "${tab.id}" ANÁLISE DETALHADA:`, {
      showAlways: tab.showAlways,
      showAlwaysType: typeof tab.showAlways,
      superAdminOnly: tab.superAdminOnly,
      superAdminOnlyType: typeof tab.superAdminOnly,
      isSuperAdmin: isSuperAdmin,
      isSuperAdminType: typeof isSuperAdmin,
      isSuperAdminBool: isSuperAdminBool,
      shouldShow: shouldShow,
      formula: `${tab.showAlways} || (${tab.superAdminOnly} && ${isSuperAdminBool})`
    });

    return shouldShow;
  });

  console.log("✅ AdminTabs RESULTADO FINAL:", {
    isSuperAdmin,
    isSuperAdminType: typeof isSuperAdmin,
    totalTabs: allTabs.length,
    visibleTabs: tabs.length,
    tabsVisiveis: tabs.map(t => t.id),
    tabsOcultas: allTabs.filter(t => !tabs.includes(t)).map(t => t.id),
    detalhamento: allTabs.map(t => ({
      id: t.id,
      superAdminOnly: t.superAdminOnly,
      showAlways: t.showAlways,
      incluida: tabs.some(tab => tab.id === t.id)
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