// src/components/despesa/DespesaFormHeader.jsx
// ✅ Componente especializado para header do formulário de despesas

import React from "react";
import { useTheme } from "../../context/ThemeContext";

const DespesaFormHeader = ({
  configModo,
  titulo,
  subtitle,
  despesaParaEditar,
  formData,
  modoVisualizacao,
  showSuccessMessage,
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const styles = getStyles(isDark);

  // Cores adaptativas para tema dark
  const headerColors = {
    visualizar: {
      bg: isDark ? "rgba(59, 130, 246, 0.15)" : "#e7f3ff",
      color: isDark ? "#93c5fd" : "#004085",
      border: isDark ? "rgba(59, 130, 246, 0.3)" : "#b6d4fe",
    },
    editar: {
      bg: isDark ? "rgba(34, 197, 94, 0.15)" : "#d4edda",
      color: isDark ? "#86efac" : "#155724",
      border: isDark ? "rgba(34, 197, 94, 0.3)" : "#c3e6cb",
    },
    criar: {
      bg: isDark ? "rgba(34, 197, 94, 0.15)" : "#d4edda",
      color: isDark ? "#86efac" : "#155724",
      border: isDark ? "rgba(34, 197, 94, 0.3)" : "#c3e6cb",
    },
  };

  const currentColors = headerColors[configModo.modo] || headerColors.visualizar;

  return (
    <>
      <div
        style={{
          ...styles.header,
          backgroundColor: currentColors.bg,
          color: currentColors.color,
          borderColor: currentColors.border,
        }}
      >
        <h2 style={styles.headerTitle}>
          {configModo.modo === "criar"
            ? <><span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>payments</span> Criar Despesa</>
            : configModo.modo === "editar"
              ? <><span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>description</span> Informações da Despesa</>
              : <><span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>description</span> Informações da Despesa</>}
        </h2>
        <p style={styles.headerSubtitle}>
          {titulo ||
            (configModo.modo === "criar"
              ? "Preencha todos os campos obrigatórios conforme documentação oficial"
              : subtitle ||
                (modoVisualizacao
                  ? "Detalhes da despesa da emenda"
                  : `ID: ${despesaParaEditar?.id || ""} | Fornecedor: ${formData.fornecedor || ""}`))}
        </p>
      </div>

      {showSuccessMessage && (
        <div style={styles.successMessage}>
          <span style={styles.successIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: isDark ? "#86efac" : "#155724" }}>check_circle</span>
          </span>
          <span style={styles.successText}>
            {configModo.modo === "criar"
              ? "Despesa criada"
              : "Despesa atualizada"}{" "}
            com sucesso!
          </span>
        </div>
      )}
    </>
  );
};

const getStyles = (isDark) => ({
  header: {
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    borderWidth: "2px",
    borderStyle: "solid",
  },
  headerTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    fontWeight: "bold",
  },
  headerSubtitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    opacity: 0.85,
  },
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : "#d4edda",
    color: isDark ? "#86efac" : "#155724",
    padding: "15px",
    borderRadius: "8px",
    border: isDark ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid #c3e6cb",
    marginBottom: "20px",
  },
  successIcon: {
    fontSize: "20px",
  },
  successText: {
    fontWeight: "bold",
  },
});

export default DespesaFormHeader;
