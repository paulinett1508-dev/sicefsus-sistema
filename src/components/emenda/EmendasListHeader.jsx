// src/components/emenda/EmendasListHeader.jsx
import React from "react";
import { useVersion } from "../../hooks/useVersion";

const EmendasListHeader = ({
  usuario,
  loading,
  totalEmendas,
  onVoltarDespesas,
}) => {
  const { formatVersion } = useVersion();
  const userRole = usuario?.tipo || "operador";
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  return (
    <>
      {/* Botão voltar se vier de despesas */}
      {onVoltarDespesas && (
        <button onClick={onVoltarDespesas} style={styles.backButton}>
          ← Voltar para Despesas
        </button>
      )}

      {/* Header com informações */}
      <div style={styles.compactHeader}>
        <div style={styles.statusInfo}>
          <span style={styles.statusText}>Status:</span>
          <span style={styles.statusValue}>✅ Operacional</span>
          <span style={styles.divider}>|</span>
          <span style={styles.versionText}>Versão:</span>
          <span style={styles.versionValue}>{formatVersion()}</span>
          <span style={styles.divider}>|</span>
          <span style={styles.statusText}>Usuário:</span>
          <span style={styles.versionValue}>
            {userRole === "admin"
              ? "👑 Admin"
              : `🏛️ ${userMunicipio || "Município não cadastrado"}`}
          </span>
          <span style={styles.divider}>|</span>
          <span style={styles.statusText}>Dados:</span>
          <span style={styles.versionValue}>
            {loading ? "Carregando..." : `${totalEmendas} emendas`}
          </span>
        </div>
      </div>

      {/* Banner de informação para operadores */}
      {userRole === "operador" && userMunicipio && (
        <div style={styles.permissaoInfo}>
          <span style={styles.permissaoIcon}>🔒</span>
          <div style={styles.permissaoContent}>
            <span style={styles.permissaoTexto}>
              <strong>Filtro Ativo:</strong> Exibindo apenas emendas do
              município{" "}
              <strong>
                {userMunicipio}/{userUf || "UF não informada"}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Aviso para usuário sem município */}
      {userRole === "operador" && !userMunicipio && (
        <div style={styles.avisoMunicipio}>
          <span style={styles.avisoIcon}>⚠️</span>
          <div style={styles.avisoContent}>
            <span style={styles.avisoTexto}>
              <strong>Configuração Pendente:</strong> Seu usuário não possui
              município/UF cadastrado no sistema.
            </span>
            <span style={styles.avisoSubtexto}>
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
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "16px",
    transition: "background-color 0.2s",
  },

  compactHeader: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    background: "linear-gradient(135deg, #154360, #4A90E2)",
    color: "white",
    padding: "8px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    fontSize: "14px",
    gap: "8px",
  },

  statusInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
  },

  statusText: {
    fontWeight: "normal",
  },

  statusValue: {
    fontWeight: "500",
  },

  versionText: {
    fontWeight: "normal",
  },

  versionValue: {
    fontWeight: "500",
  },

  divider: {
    opacity: 0.7,
    margin: "0 4px",
  },

  permissaoInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#e8f5e8",
    border: "2px solid #4caf50",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#2e7d32",
    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.15)",
  },

  permissaoIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },

  permissaoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  permissaoTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },

  avisoMunicipio: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#856404",
    boxShadow: "0 4px 12px rgba(255, 193, 7, 0.15)",
  },

  avisoIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },

  avisoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  avisoTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },

  avisoSubtexto: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
  },
};

export default EmendasListHeader;
