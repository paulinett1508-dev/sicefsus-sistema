// src/components/despesa/DespesasListHeader.jsx
// Header da página de listagem de despesas (diferente do DespesaFormHeader)
import React from "react";
import { useVersion } from "../../hooks/useVersion";

const DespesasListHeader = ({
  usuario,
  loading,
  totalDespesas,
  onVoltarEmendas,
  emenda,
}) => {
  const { formatVersion } = useVersion();
  const userRole = usuario?.tipo || "operador";
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  const getRoleBadge = () => {
    if (userRole === "admin") {
      return { label: "Admin", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", icon: "shield_person" };
    }
    if (userRole === "gestor") {
      return { label: "Gestor", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", icon: "account_balance" };
    }
    return { label: "Operador", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", icon: "person" };
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Botão voltar se vier de emenda */}
      {onVoltarEmendas && (
        <button onClick={onVoltarEmendas} style={styles.backButton}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>arrow_back</span>
          Voltar para Emendas
        </button>
      )}

      {/* Header com informações */}
      <div style={styles.compactHeader}>
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
              {loading ? "..." : totalDespesas}
            </span>
            <span style={styles.infoLabel}>despesas</span>
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
              {badge.icon}
            </span>
            {badge.label}
          </div>
        </div>
      </div>

      {/* Banner de informação para operadores */}
      {userRole === "operador" && userMunicipio && !emenda && (
        <div style={styles.permissaoInfo}>
          <span className="material-symbols-outlined" style={styles.bannerIcon}>lock</span>
          <div style={styles.bannerContent}>
            <span style={styles.bannerTexto}>
              <strong>Filtro Ativo:</strong> Exibindo apenas despesas de emendas
              do município{" "}
              <strong>
                {userMunicipio}/{userUf || "UF não informada"}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Banner de emenda específica */}
      {emenda && (
        <div style={styles.emendaInfo}>
          <span className="material-symbols-outlined" style={styles.bannerIcon}>description</span>
          <div style={styles.bannerContent}>
            <span style={styles.bannerTexto}>
              <strong>Emenda:</strong> {emenda.numero} - {emenda.parlamentar}
            </span>
            <span style={styles.bannerSubtexto}>
              {emenda.municipio}/{emenda.uf} • Valor:{" "}
              {(emenda.valorRecurso || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </div>
      )}

      {/* Aviso para usuário sem município */}
      {userRole === "operador" && !userMunicipio && (
        <div style={styles.avisoMunicipio}>
          <span className="material-symbols-outlined" style={styles.bannerIcon}>warning</span>
          <div style={styles.bannerContent}>
            <span style={styles.bannerTexto}>
              <strong>Configuração Pendente:</strong> Seu usuário não possui
              município/UF cadastrado no sistema.
            </span>
            <span style={styles.bannerSubtexto}>
              Entre em contato com o administrador para configurar seu acesso.
            </span>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  backButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#64748B",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "16px",
    transition: "background-color 0.2s",
    fontFamily: "'Inter', sans-serif",
  },

  compactHeader: {
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

  permissaoInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#059669",
  },

  emendaInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    border: "1px solid rgba(37, 99, 235, 0.2)",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#2563EB",
  },

  avisoMunicipio: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#B45309",
  },

  bannerIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },

  bannerContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  bannerTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },

  bannerSubtexto: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
  },
};

export default DespesasListHeader;
