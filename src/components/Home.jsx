import React from "react";
import Logo from "../images/logo-sicefsus.png";

const PRIMARY = "#154360"; // Azul petróleo principal
const SECONDARY = "#1A5276"; // Tom complementar
const ACCENT = "#4A90E2"; // Azul claro para detalhes
const WHITE = "#fff";
const GRAY = "#f4f6f8";
const TEXT = "#222";

export default function Home({ onLoginClick }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={Logo} alt="Logo SICEFSUS" style={styles.logo} />
        <h1 style={styles.title}>SICEFSUS</h1>
        <p style={styles.subtitle}>
          Sistema de Controle de Execuções Financeiras do SUS
        </p>
        <button
          style={styles.button}
          onClick={onLoginClick}
          onMouseOver={(e) => (e.currentTarget.style.background = ACCENT)}
          onMouseOut={(e) => (e.currentTarget.style.background = PRIMARY)}
        >
          Entrar / Login
        </button>
      </div>
      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} SICEFSUSM</span>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
  },
  card: {
    background: WHITE,
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(20, 67, 96, 0.18)",
    padding: "48px 32px 40px 32px",
    maxWidth: 400,
    width: "90%",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 96,
    height: 96,
    objectFit: "contain",
    marginBottom: 12,
    borderRadius: 16,
    boxShadow: "0 2px 8px rgba(20, 67, 96, 0.10)",
    background: GRAY,
    padding: 8,
  },
  title: {
    fontSize: 32,
    color: PRIMARY,
    fontWeight: 700,
    margin: 0,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: SECONDARY,
    margin: "8px 0 24px 0",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  button: {
    background: PRIMARY,
    color: WHITE,
    border: "none",
    borderRadius: 8,
    padding: "14px 0",
    width: "100%",
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(20, 67, 96, 0.10)",
    transition: "background 0.2s",
    marginTop: 8,
    letterSpacing: 1,
  },
  footer: {
    marginTop: 40,
    color: WHITE,
    fontSize: 14,
    opacity: 0.85,
    textAlign: "center",
  },
};