// src/components/EnvironmentIndicator.jsx
import { useState } from "react";

const EnvironmentIndicator = () => {
  const [showDetails, setShowDetails] = useState(false);

  // Detectar ambiente baseado no PROJECT_ID
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const isProduction = projectId?.includes("prod");
  const isDevelopment = projectId?.includes("60dbd");

  // Configurações visuais por ambiente
  const envConfig = {
    production: {
      label: "PROD",
      color: "#dc2626", // Vermelho
      bgColor: "rgba(220, 38, 38, 0.1)",
      borderColor: "#dc2626",
      description: "Ambiente de Produção",
    },
    development: {
      label: "DEV",
      color: "#16a34a", // Verde
      bgColor: "rgba(22, 163, 74, 0.1)",
      borderColor: "#16a34a",
      description: "Ambiente de Desenvolvimento",
    },
    staging: {
      label: "TEST",
      color: "#ea580c", // Laranja
      bgColor: "rgba(234, 88, 12, 0.1)",
      borderColor: "#ea580c",
      description: "Ambiente de Testes",
    },
  };

  // Determinar ambiente atual
  let currentEnv = "staging"; // fallback
  if (isProduction) currentEnv = "production";
  if (isDevelopment) currentEnv = "development";

  const config = envConfig[currentEnv];

  // Estilos inline para não depender de CSS externo
  const indicatorStyle = {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    zIndex: 9999,
    fontFamily: "monospace",
    fontSize: "10px",
    fontWeight: "bold",
    color: config.color,
    backgroundColor: config.bgColor,
    border: `1px solid ${config.borderColor}`,
    borderRadius: "3px",
    padding: "2px 6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    opacity: 0.6,
    userSelect: "none",
  };

  const hoverStyle = {
    ...indicatorStyle,
    opacity: 1,
    transform: "scale(1.1)",
  };

  const tooltipStyle = {
    position: "absolute",
    bottom: "100%",
    right: "0",
    marginBottom: "5px",
    backgroundColor: "#1f2937",
    color: "#f9fafb",
    padding: "8px 12px",
    borderRadius: "4px",
    fontSize: "11px",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    border: "1px solid #374151",
  };

  const triangleStyle = {
    position: "absolute",
    top: "100%",
    right: "8px",
    width: "0",
    height: "0",
    borderLeft: "4px solid transparent",
    borderRight: "4px solid transparent",
    borderTop: "4px solid #1f2937",
  };

  return (
    <div
      style={showDetails ? hoverStyle : indicatorStyle}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      title={`Ambiente: ${config.description}`}
    >
      {config.label}

      {showDetails && (
        <div style={tooltipStyle}>
          <div>{config.description}</div>
          <div style={{ fontSize: "9px", opacity: 0.8, marginTop: "2px" }}>
            Project: {projectId || "undefined"}
          </div>
          <div style={triangleStyle}></div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentIndicator;
