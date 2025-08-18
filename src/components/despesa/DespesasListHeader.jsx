
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

  return (
    <>
      {/* Botão voltar se vier de emenda */}
      {onVoltarEmendas && (
        <button onClick={onVoltarEmendas} style={styles.backButton}>
          ← Voltar para Emendas
        </button>
      )}

      {/* Header compacto com informações do sistema */}
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
              : `🏘️ ${userMunicipio || "Município não cadastrado"}`}
          </span>
          <span style={styles.divider}>|</span>
          <span style={styles.statusText}>Dados:</span>
          <span style={styles.versionValue}>
            {loading 
              ? "Carregando..." 
              : `${totalDespesas} despesas`
            }
          </span>
        </div>
      </div>

      {/* Banner de informação para operadores */}
      {userRole === "operador" && userMunicipio && !emenda && (
        <div style={styles.permissaoInfo}>
          <span style={styles.permissaoIcon}>🔒</span>
          <div style={styles.permissaoContent}>
            <span style={styles.permissaoTexto}>
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
          <span style={styles.emendaIcon}>📋</span>
          <div style={styles.emendaContent}>
            <span style={styles.emendaTexto}>
              <strong>Emenda:</strong> {emenda.numero} - {emenda.parlamentar}
            </span>
            <span style={styles.emendaSubtexto}>
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
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    padding: '8px 16px',
    marginBottom: '16px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },

  statusInfo: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    fontSize: '13px',
  },

  statusText: {
    color: '#6c757d',
    fontWeight: '500',
  },

  statusValue: {
    color: '#28a745',
    fontWeight: '600',
  },

  versionText: {
    color: '#6c757d',
    fontWeight: '500',
  },

  versionValue: {
    color: '#495057',
    fontWeight: '600',
  },

  divider: {
    color: '#dee2e6',
    fontWeight: 'normal',
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

  emendaInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#e3f2fd",
    border: "2px solid #2196f3",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#1565c0",
    boxShadow: "0 4px 12px rgba(33, 150, 243, 0.15)",
  },

  emendaIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },

  emendaContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  emendaTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "600",
  },

  emendaSubtexto: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
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

export default DespesasListHeader;
