// Emendas.jsx - CORREÇÃO MÍNIMA: Apenas o import path
// ✅ MANTÉM: Todo o código original funcionando
// ✅ CORRIGE: Apenas o caminho do UserContext

import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext"; // ✅ IGUAL AO DESPESAS.JSX
import { useNavigate, useLocation } from "react-router-dom";

const Emendas = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ ESTRUTURA IDÊNTICA AO DASHBOARD v2.4
  const { user } = useUser();
  const userLoading = !user;

  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ TIMEOUT DE SEGURANÇA
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // ✅ CLEANUP
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ✅ VERIFICAÇÃO DE USUÁRIO (IDÊNTICA AO DASHBOARD)
  if (userLoading || !user || !user.email || !user.tipo) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>📋 Emendas</h2>
          <div style={styles.headerActions}>
            <button
              onClick={() => navigate("/dashboard")}
              style={styles.dashboardButton}
            >
              🏠 Dashboard
            </button>
          </div>
        </div>

        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>⏳ Aguardando dados do usuário...</p>
          <p style={styles.loadingSubtext}>
            Verificando permissões do usuário...
          </p>
        </div>
      </div>
    );
  }

  // ✅ PERMISSÕES (IDÊNTICAS AO DASHBOARD)
  const userRole = user.tipo || user.role || "operador";
  const userMunicipio = user.municipio || "";
  const userUf = user.uf || "";

  console.log("🔐 Permissões Emendas:", { userRole, userMunicipio, userUf });

  // ✅ CARREGAMENTO COM TIMEOUT (IGUAL DASHBOARD)
  const carregarEmendas = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📋 Iniciando carregamento de emendas...");
      console.log("👤 Tipo de usuário:", userRole);

      // Timeout de segurança - 30 segundos (aumentado para primeira carga)
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          console.warn(
            "⏰ Timeout: Carregamento de emendas demorou mais que 30s",
          );
          setLoading(false);
          // Se não tem emendas após timeout, não é erro - pode ser banco vazio
          if (emendas.length === 0) {
            console.log(
              "📋 Nenhuma emenda encontrada - banco pode estar vazio",
            );
          }
        }
      }, 30000); // Aumentado para 30 segundos

      let emendasData = [];

      if (userRole === "admin") {
        console.log("👑 Admin: Carregando todas as emendas");

        const emendasRef = collection(db, "emendas");
        const emendasQuery = query(
          emendasRef,
          orderBy("dataAprovacao", "desc"),
        );
        const emendasSnapshot = await getDocs(emendasQuery);

        emendasSnapshot.forEach((doc) => {
          emendasData.push({ id: doc.id, ...doc.data() });
        });
      } else if (userRole === "operador" && userMunicipio) {
        console.log(
          `🏘️ Operador: Carregando emendas do município ${userMunicipio}`,
        );

        const emendasRef = collection(db, "emendas");
        const emendasQuery = query(
          emendasRef,
          where("municipio", "==", userMunicipio),
          orderBy("dataAprovacao", "desc"),
        );
        const emendasSnapshot = await getDocs(emendasQuery);

        emendasSnapshot.forEach((doc) => {
          emendasData.push({ id: doc.id, ...doc.data() });
        });
      } else {
        setError("Usuário sem permissões adequadas para acessar emendas.");
        setLoading(false);
        return;
      }

      // ✅ Só atualizar se componente ainda montado
      if (mountedRef.current) {
        clearTimeout(timeoutRef.current);
        setEmendas(emendasData);
        setLoading(false);
        console.log(`✅ ${emendasData.length} emendas carregadas`);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar emendas:", error);

      if (mountedRef.current) {
        clearTimeout(timeoutRef.current);
        setError(`Erro ao carregar emendas: ${error.message}`);
        setLoading(false);
      }
    }
  };

  // ✅ EFFECT COM DEPENDÊNCIAS ESPECÍFICAS (IGUAL DASHBOARD)
  useEffect(() => {
    if (user && user.email && (user.tipo || user.role)) {
      console.log("🔄 Carregando emendas para usuário:", user.email);
      carregarEmendas();
    } else {
      console.log("⏳ Aguardando dados completos do usuário...");
      // Fallback: se não tem dados do usuário após 5s, mostrar erro
      const fallbackTimeout = setTimeout(() => {
        if (mountedRef.current && !user?.email) {
          setError(
            "Dados do usuário não carregaram. Tente fazer login novamente.",
          );
          setLoading(false);
        }
      }, 5000);

      return () => clearTimeout(fallbackTimeout);
    }
  }, [user?.email, user?.tipo, user?.role]);

  // ✅ FORÇA PARADA DO LOADING (botão de emergência)
  const forcarParada = () => {
    console.log("🛑 Forçando parada do carregamento de emendas");
    clearTimeout(timeoutRef.current);
    setLoading(false);
    // Não forçar erro se foi interrompido manualmente
  };

  // ✅ RETRY
  const tentarNovamente = () => {
    setError(null);
    setLoading(true);
    carregarEmendas();
  };

  // ✅ NAVEGAÇÃO SEGURA
  const irParaDashboard = () => {
    navigate("/dashboard");
  };

  const criarEmenda = () => {
    navigate("/emendas/criar");
  };

  const editarEmenda = (id) => {
    navigate(`/emendas/${id}/editar`);
  };

  const visualizarEmenda = (id) => {
    navigate(`/emendas/${id}`);
  };

  const verDespesas = (id) => {
    navigate(`/emendas/${id}/despesas`);
  };

  // ✅ FORMATADORES (COMPATÍVEIS COM DASHBOARD)
  const formatCurrency = (valor) => {
    const numericValue = parseFloat(valor) || 0;
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data não informada";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  // ✅ LOADING COM BOTÃO DE EMERGÊNCIA
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>📋 Emendas</h2>
          <div style={styles.headerActions}>
            <button onClick={irParaDashboard} style={styles.dashboardButton}>
              🏠 Dashboard
            </button>
          </div>
        </div>

        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3>Carregando dados da emenda...</h3>
          <p style={styles.loadingText}>
            {userRole === "admin"
              ? "Carregando todas as emendas do sistema..."
              : `Carregando emendas do município ${userMunicipio}...`}
          </p>

          {/* 🛑 BOTÃO DE EMERGÊNCIA */}
          <div style={styles.emergencyControls}>
            <button onClick={forcarParada} style={styles.stopButton}>
              🛑 Parar Carregamento
            </button>
            <p style={styles.emergencyText}>
              Se o carregamento está demorando muito, clique acima para
              interromper
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ERROR com opções de recuperação
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>📋 Emendas</h2>
          <div style={styles.headerActions}>
            <button onClick={irParaDashboard} style={styles.dashboardButton}>
              🏠 Dashboard
            </button>
          </div>
        </div>

        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <h3>Erro ao Carregar Emendas</h3>
          <p style={styles.errorMessage}>{error}</p>

          <div style={styles.errorActions}>
            <button onClick={tentarNovamente} style={styles.retryButton}>
              🔄 Tentar Novamente
            </button>
            <button onClick={irParaDashboard} style={styles.backButton}>
              🏠 Voltar ao Dashboard
            </button>
          </div>

          <div style={styles.debugInfo}>
            <details>
              <summary>Informações de Debug</summary>
              <pre style={styles.debugText}>
                {JSON.stringify(
                  {
                    user: user?.email || "não logado",
                    tipo: user?.tipo || user?.role || "indefinido",
                    municipio: user?.municipio || "não informado",
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // ✅ LISTA DE EMENDAS (estado vazio ou com dados)
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📋 Emendas</h2>
        <div style={styles.headerActions}>
          <button onClick={criarEmenda} style={styles.createButton}>
            ➕ Nova Emenda
          </button>
          <button onClick={irParaDashboard} style={styles.dashboardButton}>
            🏠 Dashboard
          </button>
        </div>
      </div>

      {/* STATUS */}
      <div style={styles.statusBar}>
        <span>✅ {emendas.length} emenda(s) encontrada(s)</span>
        <div style={styles.statusActions}>
          <button onClick={tentarNovamente} style={styles.refreshButton}>
            🔄 Atualizar
          </button>
          {userRole === "operador" && userMunicipio && (
            <span style={styles.filterInfo}>
              📍 Filtro: {userMunicipio}/{userUf}
            </span>
          )}
        </div>
      </div>

      {/* LISTA OU ESTADO VAZIO */}
      {emendas.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <h3>Nenhuma Emenda Encontrada</h3>
          <p>
            {userRole === "admin"
              ? "Não há emendas cadastradas no sistema."
              : `Não há emendas cadastradas para o município ${userMunicipio || "informado"}.`}
          </p>
          <button onClick={criarEmenda} style={styles.createFirstButton}>
            ➕ Cadastrar Primeira Emenda
          </button>
        </div>
      ) : (
        <div style={styles.emendasGrid}>
          {emendas.map((emenda, index) => {
            // Calcular métricas básicas
            const valorTotal = parseFloat(
              emenda.valor || emenda.valorRecurso || 0,
            );
            const valorExecutado = parseFloat(emenda.valorExecutado || 0);
            const saldoDisponivel = valorTotal - valorExecutado;
            const percentualExecutado =
              valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

            // Status da emenda
            const hoje = new Date();
            const dataValidade = emenda.dataValidade || emenda.dataValidada;
            const isVencida = dataValidade && new Date(dataValidade) < hoje;
            const isProximaVencer =
              dataValidade &&
              !isVencida &&
              new Date(dataValidade) - hoje <= 30 * 24 * 60 * 60 * 1000; // 30 dias

            return (
              <div
                key={emenda.id || index}
                style={{
                  ...styles.emendaCard,
                  borderLeft: isVencida
                    ? "4px solid #dc3545"
                    : isProximaVencer
                      ? "4px solid #ffc107"
                      : "4px solid #28a745",
                }}
              >
                <div style={styles.emendaHeader}>
                  <div>
                    <h4 style={styles.emendaTitle}>
                      {emenda.autor ||
                        emenda.parlamentar ||
                        "Autor não informado"}
                    </h4>
                    <p style={styles.emendaNumber}>
                      {emenda.numero ||
                        emenda.numeroEmenda ||
                        `#${emenda.id?.slice(-6)}`}
                    </p>
                  </div>
                  <div style={styles.emendaValue}>
                    <span style={styles.valueAmount}>
                      {formatCurrency(valorTotal)}
                    </span>
                    <span style={styles.valueLabel}>Valor Total</span>
                  </div>
                </div>

                <div style={styles.emendaDetails}>
                  <div style={styles.detailRow}>
                    <span>
                      📍 {emenda.municipio}/{emenda.uf}
                    </span>
                    <span>📅 {formatDate(emenda.dataAprovacao)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>🏷️ {emenda.tipo || "Individual"}</span>
                    <span>
                      📋 {emenda.programa || "Programa não informado"}
                    </span>
                  </div>
                </div>

                {/* Progresso de Execução */}
                <div style={styles.progressSection}>
                  <div style={styles.progressHeader}>
                    <span>Execução</span>
                    <span>{percentualExecutado.toFixed(1)}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(percentualExecutado, 100)}%`,
                        backgroundColor:
                          percentualExecutado >= 100
                            ? "#28a745"
                            : percentualExecutado >= 50
                              ? "#ffc107"
                              : "#dc3545",
                      }}
                    />
                  </div>
                  <div style={styles.progressDetails}>
                    <span>Executado: {formatCurrency(valorExecutado)}</span>
                    <span>Saldo: {formatCurrency(saldoDisponivel)}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div style={styles.statusBadge}>
                  {isVencida ? (
                    <span
                      style={{ ...styles.badge, backgroundColor: "#dc3545" }}
                    >
                      ❌ Vencida
                    </span>
                  ) : isProximaVencer ? (
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: "#ffc107",
                        color: "#212529",
                      }}
                    >
                      ⚠️ Próxima Vencer
                    </span>
                  ) : percentualExecutado >= 100 ? (
                    <span
                      style={{ ...styles.badge, backgroundColor: "#28a745" }}
                    >
                      ✅ Concluída
                    </span>
                  ) : percentualExecutado > 0 ? (
                    <span
                      style={{ ...styles.badge, backgroundColor: "#007bff" }}
                    >
                      🚀 Em Andamento
                    </span>
                  ) : (
                    <span
                      style={{ ...styles.badge, backgroundColor: "#6c757d" }}
                    >
                      ⏸️ Não Iniciada
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div style={styles.emendaActions}>
                  <button
                    onClick={() => visualizarEmenda(emenda.id)}
                    style={styles.actionButton}
                    title="Visualizar Emenda"
                  >
                    👁️ Ver
                  </button>
                  <button
                    onClick={() => editarEmenda(emenda.id)}
                    style={styles.actionButton}
                    title="Editar Emenda"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => verDespesas(emenda.id)}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: "#28a745",
                    }}
                    title="Ver Despesas"
                  >
                    💰 Despesas
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 🎨 ESTILOS CONSISTENTES COM DASHBOARD v2.4
const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "0 10px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  createButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  dashboardButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#e8f5e8",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  statusActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  refreshButton: {
    backgroundColor: "transparent",
    border: "1px solid #28a745",
    color: "#28a745",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  filterInfo: {
    fontSize: "12px",
    color: "#2e7d32",
    fontWeight: "500",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    margin: "20px 0",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  loadingText: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "30px",
  },
  loadingSubtext: {
    fontSize: "13px",
    color: "#666",
    marginTop: "8px",
  },
  emergencyControls: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#fff3cd",
    borderRadius: "6px",
    border: "1px solid #ffeaa7",
  },
  stopButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  emergencyText: {
    fontSize: "12px",
    color: "#856404",
    margin: 0,
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    margin: "20px 0",
  },
  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  errorMessage: {
    color: "#dc3545",
    fontSize: "14px",
    marginBottom: "20px",
  },
  errorActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  retryButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  backButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  debugInfo: {
    marginTop: "20px",
    textAlign: "left",
  },
  debugText: {
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "4px",
    fontSize: "11px",
    overflow: "auto",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  createFirstButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "20px",
  },
  emendasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px",
  },
  emendaCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  emendaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  emendaTitle: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#212529",
  },
  emendaNumber: {
    margin: 0,
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
  },
  emendaValue: {
    textAlign: "right",
  },
  valueAmount: {
    display: "block",
    fontSize: "18px",
    fontWeight: "700",
    color: "#28a745",
    lineHeight: 1,
  },
  valueLabel: {
    fontSize: "10px",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  emendaDetails: {
    marginBottom: "16px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#495057",
    marginBottom: "4px",
  },
  progressSection: {
    marginBottom: "16px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "6px",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
    borderRadius: "4px",
  },
  progressDetails: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#6c757d",
  },
  statusBadge: {
    marginBottom: "16px",
  },
  badge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    color: "white",
  },
  emendaActions: {
    display: "flex",
    gap: "8px",
  },
  actionButton: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};

// CSS para animações
if (!document.getElementById("emendas-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "emendas-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .emenda-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .action-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Emendas;
