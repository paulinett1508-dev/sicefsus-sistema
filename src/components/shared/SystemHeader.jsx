// src/components/shared/SystemHeader.jsx
// Header superior genérico para todos os módulos do SICEFSUS
import React from "react";
import { useVersion } from "../../hooks/useVersion";

const SystemHeader = ({
  usuario,
  loading = false,
  modulo = "Sistema",
  dadosTexto = "dados",
  dadosContador = 0,
  children,
}) => {
  const { formatVersion } = useVersion();
  const userRole = usuario?.tipo || "operador";
  const userMunicipio = usuario?.municipio;

  const getRoleBadge = () => {
    if (userRole === "admin") {
      return { label: "Admin", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" };
    }
    if (userRole === "gestor") {
      return { label: "Gestor", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" };
    }
    return { label: "Operador", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" };
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Header principal com informações do sistema */}
      <div style={styles.header}>
        <div style={styles.leftSection}>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot}></span>
            <span style={styles.statusText}>Operacional</span>
            <span style={styles.versionText}>{formatVersion()}</span>
          </div>
        </div>

        <div style={styles.rightSection}>
          {/* Dados */}
          <div style={styles.infoItem}>
            <span className="material-symbols-outlined" style={styles.infoIcon}>database</span>
            <span style={styles.infoValue}>
              {loading ? "..." : dadosContador}
            </span>
            <span style={styles.infoLabel}>{dadosTexto}</span>
          </div>

          {/* Município (se não for admin) */}
          {userRole !== "admin" && userMunicipio && (
            <div style={styles.infoItem}>
              <span className="material-symbols-outlined" style={styles.infoIcon}>location_on</span>
              <span style={styles.infoValue}>{userMunicipio}</span>
            </div>
          )}

          {/* Role Badge */}
          <div style={{ ...styles.roleBadge, backgroundColor: badge.bg, color: badge.color }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {userRole === "admin" ? "shield_person" : userRole === "gestor" ? "account_balance" : "person"}
            </span>
            {badge.label}
          </div>
        </div>
      </div>

      {/* Banners específicos de cada módulo */}
      {children}
    </>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "12px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    border: "1px solid #E2E8F0",
    fontFamily: "'Inter', sans-serif",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: "9999px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#10B981",
  },

  statusText: {
    fontSize: 12,
    fontWeight: 500,
    color: "#059669",
  },

  versionText: {
    fontSize: 11,
    color: "#64748B",
    marginLeft: 4,
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#64748B",
  },

  infoIcon: {
    fontSize: 16,
    color: "#94A3B8",
  },

  infoValue: {
    fontWeight: 600,
    color: "#334155",
  },

  infoLabel: {
    fontWeight: 400,
  },

  roleBadge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: 11,
    fontWeight: 600,
  },
};

export default SystemHeader;
