// App.jsx - Versão Corrigida v5.3 (Banner inteligente REMOVIDO para evitar conflito)
import React, { useState, useEffect } from "react";
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
import Lancamentos from "./components/Lancamentos";
import { auth, db } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Relatorios from "./components/Relatorios";
import FluxoEmenda from "./components/FluxoEmenda";
import Sobre from "./components/Sobre"; // ✅ IMPORTAÇÃO CORRIGIDA

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

// ✅ CORREÇÃO 3: Componente wrapper SEM banner fixo (usa apenas TemporaryBanner)
function ProtectedRouteWrapper({ children, usuario }) {
  const { isFormActive, hasChanges } = useNavigationProtection();

  // ✅ REMOVIDO: Banner fixo que causava conflito
  // O banner agora é controlado pelos componentes TemporaryBanner individualmente

  return (
    <div style={{ position: "relative" }}>
      {/* ✅ SEM BANNER FIXO - apenas o conteúdo da rota */}
      {children}
    </div>
  );
}

// ✅ CORREÇÃO 4: Sidebar com proteção SIMPLIFICADA
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

  // ✅ SIMPLIFICADO: Menu não fica visualmente bloqueado
  // A proteção é apenas funcional, não visual
  return (
    <Sidebar
      onNavigate={handleNavigate}
      activePath={activePath}
      usuario={usuario}
      onLogout={handleLogout}
      isBlocked={false} // ✅ Sempre false para não confundir com TemporaryBanner
    />
  );
}

// Componente de loading personalizado (PRESERVADO)
function LoadingSpinner() {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Carregando...</p>
    </div>
  );
}

// Componente de erro boundary (PRESERVADO)
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

// Função utilitária para criar usuário no Firestore se não existir (PRESERVADA)
async function criarUsuarioSeNaoExiste(user, role = "user") {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: role,
        displayName: user.displayName || null,
        isActive: true,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      return {
        uid: user.uid,
        email: user.email,
        role: role,
        displayName: user.displayName,
        isActive: true,
      };
    } else {
      await setDoc(
        userRef,
        {
          lastLogin: serverTimestamp(),
          isActive: true,
        },
        { merge: true },
      );
      return userDoc.data();
    }
  } catch (error) {
    console.error("Erro ao criar/atualizar usuário:", error);
    return {
      uid: user.uid,
      email: user.email,
      role: "user",
      displayName: user.displayName,
      isActive: true,
    };
  }
}

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { canNavigate } = useNavigationProtection();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setAuthError(null);

      if (firebaseUser) {
        try {
          await criarUsuarioSeNaoExiste(firebaseUser, "user");
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userInfo = userDoc.data();

            if (userInfo.isActive === false) {
              setAuthError(
                "Usuário desativado. Entre em contato com o administrador.",
              );
              await signOut(auth);
              setUsuario(null);
              return;
            }

            setUsuario({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userInfo.role || "user",
              displayName:
                userInfo.displayName || firebaseUser.displayName || null,
              isActive: userInfo.isActive !== false,
              ...userInfo,
            });
          }
          setShowLogin(false);
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
          setAuthError("Erro ao carregar dados do usuário. Tente novamente.");
          setUsuario({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "user",
            displayName: firebaseUser.displayName,
            isActive: true,
          });
        }
      } else {
        setUsuario(null);
        if (location.pathname !== "/" && location.pathname !== "/login") {
          navigate("/");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  async function handleLogout() {
    if (!canNavigate()) {
      return;
    }

    try {
      await signOut(auth);
      setUsuario(null);
      setShowLogin(false);
      setAuthError(null);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setAuthError("Erro ao fazer logout. Tente novamente.");
    }
  }

  function handleNavigate(path) {
    if (canNavigate()) {
      navigate(path);
    }
  }

  function handleShowLogin() {
    setShowLogin(true);
    setAuthError(null);
  }

  function handleLoginSuccess() {
    setShowLogin(false);
    setAuthError(null);
    navigate("/dashboard");
  }

  function handleLoginClose() {
    setShowLogin(false);
    setAuthError(null);
  }

  const isAuthenticated = !!usuario;

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
        {/* Sidebar com proteção simplificada */}
        {isAuthenticated && (
          <ProtectedSidebar
            onNavigate={handleNavigate}
            activePath={location.pathname}
            usuario={usuario}
            onLogout={handleLogout}
          />
        )}

        {/* Conteúdo principal */}
        <div
          style={{
            ...styles.content,
            marginLeft: isAuthenticated ? 220 : 0,
          }}
        >
          <ErrorBoundary>
            <Routes>
              {/* Rota inicial (PRESERVADA) */}
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

              {/* Rotas protegidas com UX simplificada */}
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
                path="/lancamentos"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Lancamentos usuario={usuario} />
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
                path="/emendas/:emendaId/fluxo/:lancamentoId?"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <FluxoEmenda />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />

              {/* ✅ ROTA SOBRE CORRIGIDA - Movida para dentro do Routes */}
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

              {/* Rotas administrativas (PRESERVADAS) */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute usuario={usuario} requiredRole="admin">
                    <ProtectedRouteWrapper usuario={usuario}>
                      <div style={styles.adminPlaceholder}>
                        <h2>Painel Administrativo</h2>
                        <p>
                          Funcionalidades administrativas em desenvolvimento...
                        </p>
                      </div>
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

// Componente principal com providers
export default function App() {
  return (
    <ToastProvider>
      <Router>
        <NavigationProtectionProvider>
          <AppContent />
        </NavigationProtectionProvider>
      </Router>
    </ToastProvider>
  );
}

// ✅ Estilos SIMPLIFICADOS (removidos estilos do banner fixo)
const styles = {
  app: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
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

  // ✅ REMOVIDOS: Estilos do banner fixo para evitar conflito
  // O TemporaryBanner.jsx terá seus próprios estilos

  // Estilos preservados (SEM ALTERAÇÕES)
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
    border: "4px solid #e3e3e3",
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
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
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
    backgroundColor: "#E74C3C",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "500",
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
  adminPlaceholder: {
    padding: 40,
    textAlign: "center",
    color: "#154360",
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

// CSS adicional para animações
const additionalCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inserir CSS dinamicamente
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = additionalCSS;
  document.head.appendChild(style);
}
