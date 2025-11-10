// App.jsx - VERSÃO CORRIGIDA PARA SICEFSUS
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ToastProvider } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import Emendas from "./components/Emendas";
import EmendaForm from "./components/emenda/EmendaForm";
// import Despesas from "./components/Despesas"; // ❌ REMOVIDO - Agora é aba dentro de Emendas
import Relatorios from "./components/Relatorios";
import FluxoEmenda from "./components/FluxoEmenda";
import Sobre from "./components/Sobre";
import Administracao from "./components/Administracao";
import MigracaoCompleta from "./components/admin/MigracaoCompleta";
import FerramentasDev from "./components/dev/FerramentasDev";
import FirebaseError from "./components/FirebaseError";
import { auth, db } from "./firebase/firebaseConfig";
// import DespesaForm from "./components/DespesaForm"; // ❌ REMOVIDO - Agora é usado dentro da aba Despesas
import { useUser, UserProvider } from "./context/UserContext";
import { checkVersion } from "./utils/versionControl";
import { useVersion } from "./hooks/useVersion";
import ErrorBoundary from "./components/ErrorBoundary";
import UpdateNotification from "./components/UpdateNotification";

console.log("🔥 PROD Firebase Check:", {
  mode: import.meta.env.MODE,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
});

// Sistema inteligente de controle de logs
import { configureConsole } from "./utils/DisableConsole";

// Configurar console inteligente apenas uma vez
if (!window.__consoleConfigured) {
  configureConsole();
  window.__consoleConfigured = true;
}

// Tratar erros não capturados globalmente
window.addEventListener("unhandledrejection", (event) => {
  console.error("🚨 Promise rejeitada não tratada:", event.reason);
  event.preventDefault();
});

window.addEventListener("error", (event) => {
  console.error("🚨 Erro global capturado:", event.error);
});

// Context para proteção de navegação
const NavigationProtectionContext = React.createContext({
  isFormActive: false,
  setFormActive: () => {},
  canNavigate: () => true,
  formComponent: null,
  hasChanges: false,
});

// Hook para proteção de navegação
export const useNavigationProtection = () => {
  const context = React.useContext(NavigationProtectionContext);
  if (!context) {
    return {
      isFormActive: false,
      setFormActive: () => {},
      canNavigate: () => true,
      formComponent: null,
      hasChanges: false,
    };
  }
  return context;
};

// Provider para proteção de navegação
function NavigationProtectionProvider({ children }) {
  const [isFormActive, setIsFormActive] = useState(false);
  const [formComponent, setFormComponent] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const setFormActive = (active, component = null, changes = false) => {
    setIsFormActive(active);
    setFormComponent(component);
    setHasChanges(changes);
  };

  const canNavigate = (showConfirm = true) => {
    if (!isFormActive || !hasChanges) return true;

    if (!showConfirm) return false;

    const confirmacao = window.confirm(
      "⚠️ Você está no meio de um cadastro.\n\n" +
        "Deseja realmente sair?\n" +
        '• Clique "OK" para sair (dados serão perdidos)\n' +
        '• Clique "Cancelar" para continuar editando',
    );

    if (confirmacao) {
      setFormActive(false);
      return true;
    }

    return false;
  };

  const value = {
    isFormActive,
    formComponent,
    hasChanges,
    setFormActive,
    canNavigate,
  };

  return (
    <NavigationProtectionContext.Provider value={value}>
      {children}
    </NavigationProtectionContext.Provider>
  );
}

// Componente wrapper
function ProtectedRouteWrapper({ children, usuario }) {
  return <div style={{ position: "relative" }}>{children}</div>;
}

// Sidebar com proteção
function ProtectedSidebar({ onNavigate, activePath, usuario, onLogout }) {
  const { canNavigate } = useNavigationProtection();

  const handleNavigate = (path) => {
    if (canNavigate()) {
      onNavigate(path);
    }
  };

  const handleLogout = () => {
    if (canNavigate()) {
      onLogout();
    }
  };

  return (
    <Sidebar
      onNavigate={handleNavigate}
      activePath={activePath}
      usuario={usuario}
      onLogout={handleLogout}
      isBlocked={false}
    />
  );
}

// Componente de loading
function LoadingSpinner() {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Carregando...</p>
    </div>
  );
}

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { user: usuario, loading } = useUser();
  const { version } = useVersion();
  const navigate = useNavigate();
  const location = useLocation();
  const { canNavigate } = useNavigationProtection();

  // Redirecionamento
  useEffect(() => {
    if (
      !usuario &&
      location.pathname !== "/" &&
      location.pathname !== "/login" &&
      !showLogin
    ) {
      navigate("/");
    }
  }, [usuario, location.pathname, navigate, showLogin]);

  // Função de logout corrigida
  const handleLogout = useCallback(async () => {
    if (!canNavigate()) {
      return;
    }
    try {
      await signOut(auth);
      setShowLogin(false);
      setAuthError(null);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setAuthError("Erro ao fazer logout. Tente novamente.");
    }
  }, [canNavigate, navigate]);

  const handleNavigate = useCallback(
    (path) => {
      if (canNavigate()) {
        navigate(path);
      }
    },
    [canNavigate, navigate],
  );

  const handleShowLogin = useCallback(() => {
    setShowLogin(true);
    setAuthError(null);
  }, []);

  const handleLoginSuccess = useCallback(
    (dadosUsuario) => {
      console.log("✅ handleLoginSuccess chamado:", dadosUsuario);

      if (dadosUsuario && dadosUsuario.uid) {
        console.log(
          "📋 Definindo usuário com dados completos do Login.jsx:",
          dadosUsuario,
        );
        setShowLogin(false);
        setAuthError(null);
        navigate("/dashboard");
        return;
      }

      console.log("📋 Login sem dados - deixar onAuthStateChanged carregar");
      setShowLogin(false);
      setAuthError(null);
      navigate("/dashboard");
    },
    [navigate],
  );

  const handleLoginClose = useCallback(() => {
    setShowLogin(false);
    setAuthError(null);
  }, []);

  // Função para obter o nome da página atual
  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path.includes("/emendas")) return "Emendas";
    // if (path.includes("/despesas")) return "Despesas"; // ❌ REMOVIDO - Agora é aba
    if (path.includes("/relatorios")) return "Relatórios";
    if (path.includes("/ferramentas-dev")) return "Ferramentas Dev";
    if (path.includes("/admin") || path.includes("/administracao"))
      return "Administração";
    if (path.includes("/sobre")) return "Sobre";
    if (path === "/dashboard") return "Dashboard";
    return "SICEFSUS";
  };

  const isAuthenticated = useMemo(() => !!usuario, [usuario]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.app}>
      {/* Barra de Status Global */}
      {usuario && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "32px",
            backgroundColor: "#2c3e50",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            fontSize: "12px",
            zIndex: 9999,
            gap: "15px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
          }}
        >
          <span style={{ color: "#2ecc71" }}>✅ Operacional</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ opacity: 0.7, fontSize: "11px" }}>
            v{version || "2.3.70"}
          </span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ opacity: 0.7, fontSize: "11px" }}>
            🔐 {usuario.tipo === "admin" ? "Admin" : "Operador"}
          </span>
          {usuario.superAdmin && (
            <>
              <span style={{ opacity: 0.5 }}>|</span>
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                👑 SUPER
              </span>
            </>
          )}
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ opacity: 0.7, fontSize: "11px" }}>
            📍 {usuario.tipo === "admin" 
              ? "Acesso Total" 
              : usuario.municipio 
                ? `${usuario.municipio}/${usuario.uf || ""}` 
                : "Sem município"}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <span style={{ opacity: 0.7, fontSize: "11px" }}>
              📄 {getCurrentPageName()}
            </span>
          </div>
        </div>
      )}

      <div style={{ ...styles.container, marginTop: usuario ? "32px" : 0 }}>
        {/* Sidebar */}
        {usuario && (
          <ProtectedSidebar
            onNavigate={handleNavigate}
            activePath={location.pathname}
            usuario={usuario}
            onLogout={handleLogout}
          />
        )}

        {/* Conteúdo principal */}
        <div style={styles.content}>
          {authError && (
            <div style={styles.authErrorContainer}>
              <div style={styles.authError}>
                <span style={styles.authErrorIcon}>⚠️</span>
                <span style={styles.authErrorText}>{authError}</span>
                <button
                  style={styles.authErrorClose}
                  onClick={() => setAuthError(null)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <ErrorBoundary>
            <Routes>
              <Route
                path="/"
                element={
                  usuario ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Login 
                      onLoginSuccess={handleLoginSuccess}
                      onClose={() => {}} 
                    />
                  )
                }
              />

              {showLogin && (
                <Route
                  path="/login"
                  element={
                    <div style={styles.overlay} onClick={handleLoginClose}>
                      <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Login
                          onLoginSuccess={handleLoginSuccess}
                          onClose={handleLoginClose}
                        />
                      </div>
                    </div>
                  }
                />
              )}

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Dashboard usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />

              <Route
                path="/emendas"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Emendas usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/emendas/novo"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <EmendaForm usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/emendas/:id"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <EmendaForm usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/emendas/:id/editar"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <EmendaForm usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/relatorios"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Relatorios usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/emendas/:emendaId/fluxo/:despesaId?"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <FluxoEmenda />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/sobre"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Sobre />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />

              {/* 🔄 ROTA TEMPORÁRIA: Migração Completa */}
              <Route
                path="/admin/migracao"
                element={
                  <PrivateRoute usuario={usuario} requiredRole="admin">
                    <ProtectedRouteWrapper usuario={usuario}>
                      <MigracaoCompleta />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />

              {/* 🔧 ROTA SUPERADMIN: Ferramentas de Desenvolvedor */}
              <Route
                path="/ferramentas-dev"
                element={
                  <PrivateRoute usuario={usuario} requiredRole="admin">
                    <ProtectedRouteWrapper usuario={usuario}>
                      <FerramentasDev />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />

              {/* Rotas administrativas */}
              <Route
                path="/admin"
                element={<Navigate to="/administracao" replace />}
              />
              <Route
                path="/administracao"
                element={
                  <PrivateRoute usuario={usuario} requiredRole="admin">
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Administracao usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />

              <Route
                path="/unauthorized"
                element={
                  <div style={styles.unauthorizedContainer}>
                    <h2 style={styles.unauthorizedTitle}>🚫 Acesso Negado</h2>
                    <p style={styles.unauthorizedText}>
                      Você não tem permissão para acessar esta página.
                    </p>
                    <button
                      onClick={() =>
                        navigate(isAuthenticated ? "/dashboard" : "/")
                      }
                      style={styles.button}
                    >
                      {isAuthenticated ? "Voltar ao Dashboard" : "Ir para Home"}
                    </button>
                  </div>
                }
              />

              <Route
                path="*"
                element={
                  <div style={styles.notFoundContainer}>
                    <h2 style={styles.notFoundTitle}>
                      📄 Página não encontrada
                    </h2>
                    <p style={styles.notFoundText}>
                      A página que você está procurando não existe.
                    </p>
                    <button
                      onClick={() =>
                        navigate(isAuthenticated ? "/dashboard" : "/")
                      }
                      style={styles.button}
                    >
                      {isAuthenticated ? "Ir para Dashboard" : "Ir para Home"}
                    </button>
                  </div>
                }
              />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

// Componente principal
function App() {
  if (!auth) {
    return <FirebaseError />;
  }

  return (
    <UserProvider>
      <ToastProvider>
        <Router>
          <NavigationProtectionProvider>
            <AppContent />
            <UpdateNotification />
          </NavigationProtectionProvider>
        </Router>
      </ToastProvider>
    </UserProvider>
  );
}

export default App;

// Estilos
const styles = {
  app: {
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    color: "#212529",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  content: {
    flex: 1,
    marginLeft: 220,
    transition: "margin-left 0.2s ease",
    minHeight: "100vh",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    color: "#154360",
  },
  loadingSpinner: {
    width: 50,
    height: 50,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #154360",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    margin: 0,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 0,
    maxWidth: 420,
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  authErrorContainer: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9998,
  },
  authError: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    borderRadius: 8,
    padding: "12px 16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    maxWidth: 400,
  },
  authErrorIcon: {
    fontSize: 16,
  },
  authErrorText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  authErrorClose: {
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  notFoundContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center",
    color: "#154360",
    padding: 32,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    maxWidth: 400,
  },
  unauthorizedContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center",
    color: "#154360",
    padding: 32,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
    color: "#E74C3C",
  },
  unauthorizedText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    maxWidth: 400,
  },
  button: {
    backgroundColor: "#154360",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
};

// CSS para animações
const additionalCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = additionalCSS;
  document.head.appendChild(style);
}
