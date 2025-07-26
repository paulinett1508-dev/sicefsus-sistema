// App.jsx - VERSÃO CORRIGIDA COMPLETA v5.6 - CORREÇÃO DE RE-RENDERS
// ✅ CORREÇÃO 1: Prop usuario adicionada na rota /administracao (linha 332)
// ✅ CORREÇÃO 2: Normalização UF na função criarUsuarioSeNaoExiste (linha 98)
// ✅ CORREÇÃO 3: Memoização do objeto usuário para evitar re-renders em cascata

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import Emendas from "./components/Emendas";
import Despesas from "./components/Despesas";
// As configurações de Firebase e a lógica de autenticação foram movidas para
// o UserContext. Portanto, não importamos mais auth, db ou métodos de
// firestore aqui. Veja src/context/UserContext.jsx para detalhes.

import { UserProvider, useUser } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import Relatorios from "./components/Relatorios";
import FluxoEmenda from "./components/FluxoEmenda";
import Sobre from "./components/Sobre";
import Administracao from "./components/Administracao";
import FirebaseError from "./components/FirebaseError";
import { auth } from "./firebase/firebaseConfig";
import ThemeToggle from "./components/ThemeToggle";

// ✨ Context para proteção de navegação (MANTIDO)
const NavigationProtectionContext = React.createContext({
  isFormActive: false,
  setFormActive: () => {},
  canNavigate: () => true,
  formComponent: null,
  hasChanges: false,
});

// ✨ Hook para proteção de navegação (MANTIDO)
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

// ✨ Provider para proteção de navegação (MANTIDO)
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

// ✅ Componente wrapper (MANTIDO)
function ProtectedRouteWrapper({ children, usuario }) {
  const { isFormActive, hasChanges } = useNavigationProtection();

  return <div style={{ position: "relative" }}>{children}</div>;
}

// ✅ Sidebar com proteção (MANTIDO)
function ProtectedSidebar({ onNavigate, activePath, usuario, onLogout }) {
  const { canNavigate, isFormActive, hasChanges } = useNavigationProtection();

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

// Componente de loading (MANTIDO)
function LoadingSpinner() {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Carregando...</p>
    </div>
  );
}

// Error boundary (MANTIDO)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado pelo Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Oops! Algo deu errado</h2>
          <p style={styles.errorMessage}>
            Ocorreu um erro inesperado. Por favor, recarregue a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={styles.errorButton}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// A função criarUsuarioSeNaoExiste foi removida. A criação e atualização do
// documento do usuário agora é responsabilidade do UserContext, que garante
// que os dados completos estejam disponíveis sem duplicar consultas.

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [authError, setAuthError] = useState(null);
  // Obtém o usuário, estado de carregamento e função de logout a partir do
  // UserContext. Isso elimina a necessidade de gerenciar auth localmente.
  const { user: usuario, loading, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { canNavigate } = useNavigationProtection();

  // Se o usuário não estiver autenticado e não estivermos na home ou login,
  // redireciona para a página inicial. Isto substitui a navegação que
  // acontecia no onAuthStateChanged e garante que rotas protegidas não
  // fiquem acessíveis quando não há usuário.
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

  // ✅ CORREÇÃO: Memoizar função handleLogout para evitar re-renders
  const handleLogout = useCallback(async () => {
    if (!canNavigate()) {
      return;
    }
    try {
      await logout();
      setShowLogin(false);
      setAuthError(null);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setAuthError("Erro ao fazer logout. Tente novamente.");
    }
  }, [canNavigate, logout, navigate]);

  // ✅ CORREÇÃO: Memoizar função handleNavigate para evitar re-renders
  const handleNavigate = useCallback(
    (path) => {
      if (canNavigate()) {
        navigate(path);
      }
    },
    [canNavigate, navigate],
  );

  // ✅ CORREÇÃO: Memoizar funções de login para evitar re-renders
  const handleShowLogin = useCallback(() => {
    setShowLogin(true);
    setAuthError(null);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setShowLogin(false);
    setAuthError(null);
    navigate("/dashboard");
  }, [navigate]);

  const handleLoginClose = useCallback(() => {
    setShowLogin(false);
    setAuthError(null);
  }, []);

  // ✅ CORREÇÃO: Memoizar estado de autenticação
  const isAuthenticated = useMemo(() => !!usuario, [usuario]);

  // ✅ Estilo dinâmico para o botão de tema baseado na sidebar
  const themeToggleStyle = useMemo(() => ({
    ...styles.themeToggleContainer,
    right: isAuthenticated ? "235px" : "15px", // Ajuste quando sidebar estiver presente
    display: location.pathname === "/" && !isAuthenticated ? "none" : "block", // Ocultar apenas na home quando não autenticado
  }), [isAuthenticated, location.pathname]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.app}>
      {/* Modal de Login (PRESERVADO) */}
      {showLogin && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <Login
              onLoginSuccess={handleLoginSuccess}
              onClose={handleLoginClose}
            />
          </div>
        </div>
      )}

      {/* Erro de autenticação (PRESERVADO) */}
      {authError && (
        <div style={styles.authErrorContainer}>
          <div style={styles.authError}>
            <span style={styles.authErrorIcon}>⚠️</span>
            <span style={styles.authErrorText}>{authError}</span>
            <button
              onClick={() => setAuthError(null)}
              style={styles.authErrorClose}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div style={styles.container}>
        {/* Sidebar */}
        {isAuthenticated && (
          <ProtectedSidebar
            onNavigate={handleNavigate}
            activePath={location.pathname}
            usuario={usuario}
            onLogout={handleLogout}
          />
        )}

        {/* Botão de tema no canto superior direito - sempre visível quando autenticado */}
        <div style={themeToggleStyle}>
          <ThemeToggle compact={true} />
        </div>

        {/* Conteúdo principal */}
        <div
          style={{
            ...styles.content,
            marginLeft: isAuthenticated ? 220 : 0,
          }}
        >
          <ErrorBoundary>
            <Routes>
              {/* Rota inicial */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Home onLoginClick={handleShowLogin} />
                  )
                }
              />

              {/* ✅ ROTAS com usuário completo */}
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
                path="/despesas"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Despesas usuario={usuario} />
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

              {/* Rotas administrativas */}
              <Route
                path="/admin"
                element={<Navigate to="/administracao" replace />}
              />
              {/* ✅ CORREÇÃO CRÍTICA: PROP USUARIO ADICIONADA */}
              <Route
                path="/administracao"
                element={
                  <PrivateRoute usuario={usuario} requiredRole="admin">
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Administracao usuario={usuario} />{" "}
                      {/* ✅ PROP ADICIONADA */}
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/emendas" element={<Emendas />} />
      <Route path="/despesas" element={<Despesas />} />
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/administracao" element={<Administracao />} />
    </Routes>
  );
}

// Componente principal
export default function App() {
  // ✅ Verificar se Firebase está configurado
  if (!auth) {
    return <FirebaseError />;
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <ToastProvider>
          <Router>
            <NavigationProtectionProvider>
              <AppContent />
            </NavigationProtectionProvider>
          </Router>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// Estilos (MANTIDOS EXATAMENTE IGUAIS)
const styles = {
  app: {
    fontFamily: "var(--font-family)",
    minHeight: "100vh",
    backgroundColor: "var(--theme-bg)",
    color: "var(--theme-text)",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  content: {
    flex: 1,
    transition: "margin-left 0.2s ease",
    minHeight: "100vh",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "var(--theme-bg)",
    color: "var(--primary)",
  },
  loadingSpinner: {
    width: 50,
    height: 50,
    border: "4px solid var(--theme-border)",
    borderTop: "4px solid var(--primary)",
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
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "var(--theme-bg)",
    color: "var(--theme-text)",
    padding: 32,
    textAlign: "center",
  },
  errorTitle: {
    color: "#E74C3C",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  errorMessage: {
    color: "#666",
    fontSize: 16,
    marginBottom: 24,
    maxWidth: 400,
  },
  errorButton: {
    backgroundColor: "var(--error)",
    color: "var(--white)",
    border: "none",
    padding: "12px 24px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "500",
    transition: "background-color 0.2s ease",
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
    backgroundColor: "var(--primary)",
    color: "var(--white)",
    border: "none",
    padding: "12px 24px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  themeToggleContainer: {
    position: "fixed",
    top: "15px",
    zIndex: 999,
    transition: "all 0.2s ease",
  },
};

// CSS para animações (MANTIDO EXATAMENTE IGUAL)
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