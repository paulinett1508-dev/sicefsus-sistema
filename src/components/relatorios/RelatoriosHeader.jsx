
// src/components/relatorios/RelatoriosHeader.jsx
import React from "react";

const RelatoriosHeader = ({
  onGerarRelatorio,
  onExportarDados,
  loading = false,
  selectedFilters = {}
}) => {
  const hasFilters = Object.values(selectedFilters).some(filter => 
    filter && (Array.isArray(filter) ? filter.length > 0 : true)
  );

  return (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        <h1 style={styles.title}>📊 Relatórios Gerenciais</h1>
        <p style={styles.subtitle}>
          Gere relatórios personalizados de emendas e despesas do sistema SICEFSUS
        </p>
      </div>

      <div style={styles.headerActions}>
        <button
          onClick={onGerarRelatorio}
          style={{
            ...styles.primaryButton,
            backgroundColor: hasFilters ? "#28a745" : "#6c757d"
          }}
          disabled={loading || !hasFilters}
          title={hasFilters ? "Gerar relatório com filtros aplicados" : "Aplique filtros para gerar relatório"}
        >
          <span style={styles.buttonIcon}>📋</span>
          {loading ? "Gerando..." : "Gerar Relatório"}
        </button>
        
        {onExportarDados && (
          <button
            onClick={onExportarDados}
            style={{...styles.primaryButton, backgroundColor: "#17a2b8"}}
            disabled={loading}
          >
            <span style={styles.buttonIcon}>📤</span>
            Exportar Dados
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
    color: "#154360",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  headerActions: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#007bff",
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
    transition: "background-color 0.2s",
  },
  buttonIcon: {
    fontSize: "16px",
  },
};

export default RelatoriosHeader;
