// src/components/LoadingOverlay.jsx
import React from "react";

const LoadingOverlay = ({ show, message = "Processando..." }) => {
  if (!show) return null;

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.spinner}></div>
          <p style={styles.text}>{message}</p>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(2px)",
  },
  content: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    minWidth: "280px",
  },
  spinner: {
    width: "56px",
    height: "56px",
    border: "5px solid #e0e0e0",
    borderTopColor: "#27AE60",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
  },
};

export default LoadingOverlay;
