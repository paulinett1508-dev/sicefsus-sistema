import React from "react";
import Logo from "../images/logo-sicefsus-ver-modoclaro.png";

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
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--primary-light)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "var(--primary)")}
        >
          Entrar / Login
        </button>
      </div>
      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} SICEFSUS</span>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif",
  },
  card: {
    background: "var(--theme-surface)",
    borderRadius: 20,
    boxShadow: "var(--shadow-lg)",
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
    boxShadow: "var(--shadow-sm)",
    background: "var(--theme-surface-secondary)",
    padding: 8,
  },
  title: {
    fontSize: 32,
    color: "var(--primary)",
    fontWeight: 700,
    margin: 0,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "var(--theme-text-secondary)",
    margin: "8px 0 24px 0",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  button: {
    background: "var(--primary)",
    color: "var(--white)",
    border: "none",
    borderRadius: 8,
    padding: "14px 0",
    width: "100%",
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "var(--shadow-sm)",
    transition: "background 0.2s",
    marginTop: 8,
    letterSpacing: 1,
  },
  footer: {
    marginTop: 40,
    color: "var(--white)",
    fontSize: 14,
    opacity: 0.85,
    textAlign: "center",
  },
};
