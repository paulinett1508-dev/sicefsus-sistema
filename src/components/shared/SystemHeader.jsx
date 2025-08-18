// src/components/shared/SystemHeader.jsx
// Header superior genérico para todos os módulos do SICEFSUS
import React from "react";
import { useVersion } from "../../hooks/useVersion";

const SystemHeader = ({
  usuario,
  loading = false,
  modulo = "Sistema", // "Despesas", "Emendas", "Relatórios", "Usuários"
  dadosTexto = "dados", // Texto customizado para dados
  dadosContador = 0, // Número de itens
  children, // Banners específicos abaixo do header
}) => {
  const { formatVersion } = useVersion();
  const userRole = usuario?.tipo || "operador";
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  return (
    <>
      {/* Header principal com informações do sistema */}
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
            {loading ? "Carregando..." : `${dadosContador} ${dadosTexto}`}
          </span>
        </div>
      </div>

      {/* Banners específicos de cada módulo */}
      {children}

      {/* Aviso para usuário sem município (genérico para operadores) */}
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

export default SystemHeader;
