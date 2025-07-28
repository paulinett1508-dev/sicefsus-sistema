import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Logo from "../images/logo-sicefsus.png";

const PRIMARY = "#154360"; // Azul petróleo principal
const SECONDARY = "#1A5276"; // Tom complementar
const ACCENT = "#4A90E2"; // Azul claro para detalhes
const WHITE = "#fff";
const GRAY = "#f4f6f8";
const TEXT = "#222";

export default function Home() {
  const { usuario, loading } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (usuario) {
    return <Dashboard />;
  }
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
          onClick={() => setShowLogin(true)}
          onMouseOver={(e) => (e.currentTarget.style.background = ACCENT)}
          onMouseOut={(e) => (e.currentTarget.style.background = PRIMARY)}
        >
          Entrar / Login
        </button>
        
        {showLogin && (
          <Login onLoginSuccess={() => setShowLogin(false)} />
        )}
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
    background: `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-family)",
    transition: "background 0.3s ease",
  },
  card: {
    background: "var(--theme-surface)",
    borderRadius: 20,
    boxShadow: "0 8px 32px var(--theme-shadow)",
    padding: "48px 32px 40px 32px",
    maxWidth: 400,
    width: "90%",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    border: "1px solid var(--theme-border-light)",
    transition: "all 0.3s ease",
  },
  logo: {
    width: 96,
    height: 96,
    objectFit: "contain",
    marginBottom: 12,
    borderRadius: 16,
    boxShadow: "0 2px 8px var(--theme-shadow)",
    background: "var(--theme-surface-secondary)",
    padding: 8,
    transition: "all 0.3s ease",
  },
  title: {
    fontSize: 32,
    color: "var(--primary)",
    fontWeight: 700,
    margin: 0,
    letterSpacing: 1,
    transition: "color 0.3s ease",
  },
  subtitle: {
    fontSize: 16,
    color: "var(--theme-text-secondary)",
    margin: "8px 0 24px 0",
    fontWeight: 400,
    lineHeight: 1.5,
    transition: "color 0.3s ease",
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
    boxShadow: "0 2px 8px var(--theme-shadow)",
    transition: "all 0.3s ease",
    marginTop: 8,
    letterSpacing: 1,
  },
  footer: {
    marginTop: 40,
    color: "var(--white)",
    fontSize: 14,
    opacity: 0.85,
    textAlign: "center",
    transition: "color 0.3s ease",
  },
};
