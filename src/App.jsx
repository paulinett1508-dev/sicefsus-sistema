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
import Despesas from "./components/Despesas";
import Relatorios from "./components/Relatorios";
import FluxoEmenda from "./components/FluxoEmenda";
import Sobre from "./components/Sobre";
import Administracao from "./components/Administracao";
import FirebaseError from "./components/FirebaseError";
import { auth, db } from "./firebase/firebaseConfig";
import DespesaForm from "./components/DespesaForm";

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

// Error boundary
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

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { canNavigate } = useNavigationProtection();

  // ✅ GERENCIAR AUTENTICAÇÃO - CORREÇÃO PRINCIPAL
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ✅ SÓ BUSCAR DADOS SE NÃO TEMOS USUÁRIO AINDA (evita conflito com Login.jsx)
        if (!usuario) {
          try {
            console.log(
              "🔍 onAuthStateChanged: Carregando dados do usuário:",
              firebaseUser.uid,
            );
            console.log("📧 Email:", firebaseUser.email);

            // ✅ CORREÇÃO CRÍTICA: Buscar apenas em "usuarios"
            const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));

            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log(
                "✅ Dados encontrados na coleção 'usuarios':",
                userData,
              );

              // ✅ MAPEAMENTO CORRETO DOS CAMPOS SICEFSUS
              const usuario = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,

                // ✅ CAMPOS PRINCIPAIS DO SICEFSUS
                nome:
                  userData.nome ||
                  userData.name ||
                  firebaseUser.email?.split("@")[0] ||
                  "Usuário",
                tipo: userData.tipo || "operador", // admin | operador
                status: userData.status || "ativo", // ativo | inativo
                municipio: userData.municipio || "",
                uf: userData.uf || "",

                // ✅ CAMPOS DE COMPATIBILIDADE (MAPEAMENTO CRÍTICO)
                displayName:
                  userData.nome || userData.name || firebaseUser.displayName,
                role: userData.tipo === "admin" ? "admin" : "user", // ✅ MAPEAMENTO: operador → user
                isActive: userData.status === "ativo",

                // ✅ DADOS ADICIONAIS
                departamento: userData.departamento || "",
                telefone: userData.telefone || "",
                dataCriacao: userData.dataCriacao,
                dataAtualizacao: userData.dataAtualizacao,
                ultimoAcesso: userData.ultimoAcesso,
                primeiroAcesso: userData.primeiroAcesso || false,
                totalAcessos: userData.totalAcessos || 0,
                criadoPor: userData.criadoPor,

                // ✅ PRESERVAR TODOS OS CAMPOS ORIGINAIS
                ...userData,
              };

              setUsuario(usuario);

              console.log("👤 Usuário configurado via onAuthStateChanged:", {
                nome: usuario.nome,
                tipo: usuario.tipo,
                role: usuario.role,
                municipio: usuario.municipio,
                uf: usuario.uf,
                status: usuario.status,
                isAdmin: usuario.tipo === "admin",
              });
            } else {
              console.log("❌ Usuário não encontrado na coleção 'usuarios'");
              console.log("🚨 USUÁRIO ÓRFÃO DETECTADO!");
              console.log("   - Existe no Firebase Auth ✅");
              console.log("   - NÃO existe no Firestore ❌");
              console.log(
                "   - Precisa ser criado via interface de administração",
              );

              // ✅ LOGOUT FORÇADO - NÃO CRIAR AUTOMATICAMENTE
              await signOut(auth);
              setUsuario(null);
              setAuthError(
                "Usuário não encontrado no sistema. Entre em contato com o administrador.",
              );
            }
          } catch (error) {
            console.error("❌ Erro ao carregar dados do usuário:", error);

            // ✅ EM CASO DE ERRO, NÃO CRIAR USUÁRIO FANTASMA
            setAuthError("Erro ao carregar dados do usuário. Tente novamente.");
            await signOut(auth);
            setUsuario(null);
          }
        } else {
          console.log("👤 Usuário já definido, pulando onAuthStateChanged");
        }
      } else {
        console.log("🚪 Usuário deslogado");
        setUsuario(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []); // ✅ SEM 'usuario' nas dependências para evitar loops

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
      setUsuario(null);
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

  // ✅ FUNÇÃO CORRIGIDA PARA RECEBER DADOS COMPLETOS DO LOGIN
  const handleLoginSuccess = useCallback(
    (dadosUsuario) => {
      console.log("✅ handleLoginSuccess chamado:", dadosUsuario);

      // Se recebeu dados do usuário (login com dados), usar diretamente
      if (dadosUsuario && dadosUsuario.uid) {
        console.log(
          "📋 Definindo usuário com dados completos do Login.jsx:",
          dadosUsuario,
        );
        setUsuario(dadosUsuario);
        setShowLogin(false);
        setAuthError(null);
        navigate("/dashboard");
        return;
      }

      // Caso contrário (auto-registro), só fechar modal e navegar
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

  const isAuthenticated = useMemo(() => !!usuario, [usuario]);

  return (
    <div style={styles.app}>
      {/* Modal de Login */}
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

      {/* Erro de autenticação */}
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

              {/* Rotas protegidas */}
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
                path="/emendas"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <Emendas usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />

              {/* ✅ ROTAS DE EMENDA - ADICIONADAS */}
              <Route
                path="/emendas/criar"
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
                path="/despesas/nova"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <DespesaForm usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/despesas/criar"
                element={<Navigate to="/despesas/nova" replace />}
              />
              <Route
                path="/despesas/editar/:id"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <DespesaForm usuario={usuario} />
                    </ProtectedRouteWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/despesas/visualizar/:id"
                element={
                  <PrivateRoute usuario={usuario}>
                    <ProtectedRouteWrapper usuario={usuario}>
                      <DespesaForm usuario={usuario} />
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

              {/* ✅ ROTAS ADMINISTRATIVAS - CORRIGIDAS */}
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
    <ToastProvider>
      <Router>
        <NavigationProtectionProvider>
          <AppContent />
        </NavigationProtectionProvider>
      </Router>
    </ToastProvider>
  );
}

// ✅ EXPORTAR COMO DEFAULT
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
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    color: "#212529",
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