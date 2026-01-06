// src/components/admin/AdminHeader.jsx
import React from "react";

const AdminHeader = ({
  activeTab,
  onNovoUsuario,
  onAtualizarLogs,
  loading,
}) => {
  return (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        <h1 style={styles.title}>
          {activeTab === "users"
            ? <><span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>group</span> Administração de Usuários</>
            : <><span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>assignment</span> Logs de Auditoria</>}
        </h1>
        <p style={styles.subtitle}>
          {activeTab === "users"
            ? "Gerencie usuários, permissões e acessos do sistema SICEFSUS"
            : "Monitore todas as ações realizadas no sistema"}
        </p>
      </div>

      <div style={styles.headerActions}>
        {activeTab === "users" && (
          <button
            onClick={onNovoUsuario}
            style={styles.primaryButton}
            disabled={loading}
          >
            <span style={styles.buttonIcon}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span></span>
            Novo Usuário
          </button>
        )}
        {activeTab === "logs" && (
          <button
            onClick={onAtualizarLogs}
            style={{ ...styles.primaryButton, backgroundColor: "var(--success-600)" }}
            disabled={loading}
          >
            <span style={styles.buttonIcon}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span></span>
            Atualizar Logs
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: "20px",
  },
  headerLeft: {
    marginBottom: "10px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--theme-text-secondary)",
    margin: "0",
  },
  headerActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "var(--primary-600)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  buttonIcon: {
    fontSize: "16px",
  },
};

export default AdminHeader;
