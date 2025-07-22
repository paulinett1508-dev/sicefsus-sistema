// src/components/PrintButton.jsx
import React from "react";
import { printReport } from "../utils/printUtils";

const PrintButton = ({ reportId, title, className = "" }) => {
  const [isPrinting, setIsPrinting] = React.useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printReport(reportId, title);
    } catch (error) {
      console.error("Erro na impressão:", error);
      alert("Erro ao imprimir relatório");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isPrinting}
      style={{
        padding: "8px 16px",
        backgroundColor: isPrinting ? "#666" : "#154360",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: isPrinting ? "not-allowed" : "pointer",
        opacity: isPrinting ? 0.6 : 1,
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s ease",
      }}
    >
      {isPrinting ? (
        <>
          <span
            style={{
              display: "inline-block",
              width: "12px",
              height: "12px",
              border: "2px solid transparent",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></span>
          Imprimindo...
        </>
      ) : (
        <>🖨️ Imprimir</>
      )}
    </button>
  );
};

// Adiciona animação de spinning
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default PrintButton;
