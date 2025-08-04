// Dashboard.jsx - VERSÃO PRODUÇÃO COM LAYOUT REFINADO
// ✅ CORRIGIDO: Contagem de despesas
// ✅ ADICIONADO: Navegação nos cards de prazos

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom"; // ✅ NOVO: Import para navegação
import usePermissions from "../hooks/usePermissions"; // ✅ NOVO: Import do hook de permissões

// 💎 WIDGET CRONOGRAMA REFINADO
const CronogramaWidget = ({ emendas = [] }) => {
  const navigate = useNavigate(); // ✅ NOVO: Hook de navegação
  const [cronogramaData, setCronogramaData] = useState({
    proximasVencer: [],
    vencidas: [],
    emAndamento: [],
    concluidas: [],
  });

  useEffect(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const processarEmendas = () => {
      const proximasVencer = [];
      const vencidas = [];
      const emAndamento = [];
      const concluidas = [];

      emendas.forEach((emenda) => {
        const dataValidadeStr = emenda.dataValidada || emenda.dataValidade;
        if (!dataValidadeStr) return;

        const dataValidade = new Date(dataValidadeStr);
        const diffTime = dataValidade - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const valorTotal = parseFloat(emenda.valor || emenda.valorRecurso || 0);
        const valorExecutado = parseFloat(emenda.valorExecutado || 0);
        const percentualExecutado =
          valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

        const emendaComDias = {
          ...emenda,
          diasRestantes: diffDays,
          percentualExecutado,
          parlamentar: emenda.autor || emenda.parlamentar || "Não informado",
        };

        if (diffDays < 0) {
          vencidas.push(emendaComDias);
        } else if (diffDays <= 30) {
          proximasVencer.push(emendaComDias);
        } else if (percentualExecutado >= 100) {
          concluidas.push(emendaComDias);
        } else if (percentualExecutado > 0) {
          emAndamento.push(emendaComDias);
        }
      });

      setCronogramaData({
        proximasVencer: proximasVencer.sort(
          (a, b) => a.diasRestantes - b.diasRestantes,
        ),
        vencidas: vencidas.sort((a, b) => b.diasRestantes - a.diasRestantes),
        emAndamento: emAndamento.sort(
          (a, b) => b.percentualExecutado - a.percentualExecutado,
        ),
        concluidas: concluidas.slice(0, 5),
      });
    };

    processarEmendas();
  }, [emendas]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // ✅ NOVO: Funções de navegação para cada card
  const handleCardClick = (tipo) => {
    // Navegar para a listagem de emendas com filtro específico
    navigate("/emendas", {
      state: {
        filtroStatus: tipo,
      },
    });
  };

  return (
    <div style={cronogramaStyles.container}>
      <div style={cronogramaStyles.header}>
        <h3 style={cronogramaStyles.title}>Acompanhamento de Prazos</h3>
        <span style={cronogramaStyles.subtitle}>
          Status das emendas por cronograma de execução
        </span>
      </div>

      <div style={cronogramaStyles.metricsGrid}>
        {/* ⚠️ PRÓXIMAS AO VENCIMENTO */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.warningCard,
            cursor: "pointer", // ✅ NOVO: Cursor pointer
          }}
          onClick={() => handleCardClick("proximasVencer")} // ✅ NOVO: Handler de clique
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span
                style={{ ...cronogramaStyles.metricIcon, color: "#f57c00" }}
              >
                ⚠️
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>
                Próximas ao Vencimento
              </h4>
              <p style={cronogramaStyles.metricSubtitle}>≤ 30 dias</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.proximasVencer.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.proximasVencer.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                Nenhuma emenda próxima ao vencimento
              </div>
            ) : (
              cronogramaData.proximasVencer.slice(0, 2).map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {emenda.municipio}/{emenda.uf}
                    </span>
                  </div>
                  <span
                    style={{
                      ...cronogramaStyles.diasBadge,
                      backgroundColor:
                        emenda.diasRestantes <= 7 ? "#d32f2f" : "#f57c00",
                      color: "white",
                    }}
                  >
                    {emenda.diasRestantes}d
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ❌ VENCIDAS */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.dangerCard,
            cursor: "pointer", // ✅ NOVO: Cursor pointer
          }}
          onClick={() => handleCardClick("vencidas")} // ✅ NOVO: Handler de clique
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span
                style={{ ...cronogramaStyles.metricIcon, color: "#d32f2f" }}
              >
                ❌
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Vencidas</h4>
              <p style={cronogramaStyles.metricSubtitle}>Prazo expirado</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.vencidas.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.vencidas.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                Nenhuma emenda vencida
              </div>
            ) : (
              cronogramaData.vencidas.slice(0, 2).map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {emenda.municipio}/{emenda.uf}
                    </span>
                  </div>
                  <span
                    style={{
                      ...cronogramaStyles.diasBadge,
                      backgroundColor: "#d32f2f",
                      color: "white",
                    }}
                  >
                    -{Math.abs(emenda.diasRestantes)}d
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🚀 EM ANDAMENTO */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.successCard,
            cursor: "pointer", // ✅ NOVO: Cursor pointer
          }}
          onClick={() => handleCardClick("emAndamento")} // ✅ NOVO: Handler de clique
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span
                style={{ ...cronogramaStyles.metricIcon, color: "#388e3c" }}
              >
                🚀
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Em Execução</h4>
              <p style={cronogramaStyles.metricSubtitle}>Dentro do prazo</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.emAndamento.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.emAndamento.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                Nenhuma emenda em execução
              </div>
            ) : (
              cronogramaData.emAndamento.slice(0, 2).map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {formatCurrency(emenda.valor || emenda.valorRecurso)}
                    </span>
                  </div>
                  <div style={cronogramaStyles.progressContainer}>
                    <div style={cronogramaStyles.progressBar}>
                      <div
                        style={{
                          ...cronogramaStyles.progressFill,
                          width: `${Math.min(emenda.percentualExecutado, 100)}%`,
                        }}
                      />
                    </div>
                    <span style={cronogramaStyles.progressText}>
                      {emenda.percentualExecutado.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ CONCLUÍDAS */}
        <div
          style={{
            ...cronogramaStyles.metricCard,
            ...cronogramaStyles.infoCard,
            cursor: "pointer", // ✅ NOVO: Cursor pointer
          }}
          onClick={() => handleCardClick("concluidas")} // ✅ NOVO: Handler de clique
        >
          <div style={cronogramaStyles.metricHeader}>
            <div style={cronogramaStyles.iconContainer}>
              <span
                style={{ ...cronogramaStyles.metricIcon, color: "#0277bd" }}
              >
                ✅
              </span>
            </div>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Concluídas</h4>
              <p style={cronogramaStyles.metricSubtitle}>Execução finalizada</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>
            {cronogramaData.concluidas.length}
          </div>

          <div style={cronogramaStyles.itemsList}>
            {cronogramaData.concluidas.length === 0 ? (
              <div style={cronogramaStyles.emptyMessage}>
                Nenhuma emenda concluída
              </div>
            ) : (
              cronogramaData.concluidas.slice(0, 2).map((emenda, index) => (
                <div
                  key={emenda.id || index}
                  style={cronogramaStyles.emendaItem}
                >
                  <div style={cronogramaStyles.emendaInfo}>
                    <strong>{emenda.parlamentar}</strong>
                    <span style={cronogramaStyles.emendaLocal}>
                      {emenda.municipio}/{emenda.uf}
                    </span>
                  </div>
                  <span
                    style={{
                      ...cronogramaStyles.diasBadge,
                      backgroundColor: "#388e3c",
                      color: "white",
                    }}
                  >
                    100%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 📊 RESUMO COMPACTO */}
      <div style={cronogramaStyles.summary}>
        <div style={cronogramaStyles.summaryItem}>
          <span style={cronogramaStyles.summaryValue}>{emendas.length}</span>
          <span style={cronogramaStyles.summaryLabel}>Total</span>
        </div>
        <div style={cronogramaStyles.summaryItem}>
          <span
            style={{
              ...cronogramaStyles.summaryValue,
              color:
                cronogramaData.proximasVencer.length +
                  cronogramaData.vencidas.length >
                0
                  ? "#d32f2f"
                  : "#388e3c",
            }}
          >
            {cronogramaData.proximasVencer.length +
              cronogramaData.vencidas.length}
          </span>
          <span style={cronogramaStyles.summaryLabel}>Atenção</span>
        </div>
        <div style={cronogramaStyles.summaryItem}>
          <span style={{ ...cronogramaStyles.summaryValue, color: "#0277bd" }}>
            {cronogramaData.emAndamento.length}
          </span>
          <span style={cronogramaStyles.summaryLabel}>Ativas</span>
        </div>
      </div>
    </div>
  );
};

// 🏠 COMPONENTE PRINCIPAL DASHBOARD
const Dashboard = ({ usuario }) => {
  // ✅ TODOS OS HOOKS SEMPRE NO TOPO - SEM CONDIÇÕES
  const user = usuario;
  const userLoading = !usuario;
  const permissions = usePermissions(usuario);

  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ VARIÁVEIS DERIVADAS APÓS VALIDAÇÕES
  const userRole = user?.tipo || user?.role || "operador";
  const userMunicipio = user?.municipio || "";
  const userUf = user?.uf || "";

  // ✅ CARREGAR DADOS REAIS - useEffect DEVE VIR ANTES DAS VERIFICAÇÕES
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      let emendasData = [];
      let despesasData = [];

      // Admin e Operador com permissão para ver todas as emendas
      if (permissions.acessoTotal) {
        const emendasRef = collection(db, "emendas");
        const emendasSnapshot = await getDocs(emendasRef);
        emendasSnapshot.forEach((doc) => {
          emendasData.push({ id: doc.id, ...doc.data() });
        });

        const despesasRef = collection(db, "despesas");
        const despesasSnapshot = await getDocs(despesasRef);
        despesasSnapshot.forEach((doc) => {
          despesasData.push({ id: doc.id, ...doc.data() });
        });
      }
      // Operador com permissão apenas para o seu município
      else if (permissions.filtroAplicado && userMunicipio) {
        const emendasRef = collection(db, "emendas");
        const emendasQuery = query(
          emendasRef,
          where("municipio", "==", userMunicipio),
        );
        const emendasSnapshot = await getDocs(emendasQuery);
        emendasSnapshot.forEach((doc) => {
          emendasData.push({ id: doc.id, ...doc.data() });
        });

        if (emendasData.length > 0) {
          const emendasIds = emendasData.map((e) => e.id);
          const batchSize = 10;

          for (let i = 0; i < emendasIds.length; i += batchSize) {
            const batch = emendasIds.slice(i, i + batchSize);
            const despesasRef = collection(db, "despesas");
            const despesasQuery = query(
              despesasRef,
              where("emendaId", "in", batch),
            );
            const despesasSnapshot = await getDocs(despesasQuery);
            despesasSnapshot.forEach((doc) => {
              despesasData.push({ id: doc.id, ...doc.data() });
            });
          }
        }
      } else {
        // Caso em que o usuário tem a permissão geral, mas não tem município cadastrado
        if (userRole !== "admin" && !userMunicipio) {
          setError(
            "Usuário operador sem município definido. Impossível carregar dados.",
          );
        } else {
          setError(
            "Usuário sem permissões adequadas para acessar o dashboard.",
          );
        }
        setLoading(false);
        return;
      }

      console.log("✅ Dados carregados:", {
        emendas: emendasData.length,
        despesas: despesasData.length,
      });

      setEmendas(emendasData);
      setDespesas(despesasData);
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verifica se o usuário tem permissão para ver o dashboard antes de carregar os dados
    if (permissions.temAcesso() && user?.email && user?.tipo) {
      carregarDados();
    } else if (!userLoading && !user) {
      // Se o usuário não está carregando e é nulo, significa que não está autenticado
      setError("Usuário não autenticado.");
    }
  }, [
    user?.email,
    user?.tipo,
    userMunicipio,
    permissions.acessoTotal,
    permissions.filtroAplicado,
  ]); // ✅ Dependências atualizadas

  // ✅ VERIFICAÇÃO APÓS HOOKS
  if (userLoading || !user || !user.email || !user.tipo) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBar}>
          <span>
            Status: ⏳{" "}
            {userLoading ? "Carregando usuário..." : "Verificando dados..."}
          </span>
          <span style={styles.divider}>|</span>
          <span>Versão: v2.4</span>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>
            ⏳{" "}
            {userLoading
              ? "Carregando dados do usuário..."
              : "Aguardando autenticação..."}
          </p>
          <p style={styles.loadingSubtext}>
            Verificando permissões do usuário...
          </p>
        </div>
      </div>
    );
  }

  // ✅ VALIDAR PERMISSÕES APÓS HOOKS
  if (!permissions.temAcesso()) {
    const mensagemErro = permissions.aviso || "Usuário sem permissão para acessar o dashboard.";
    
    return (
      <div style={styles.container}>
        <div style={styles.statusBar}>
          <span>Status: ❌ Permissão negada</span>
          <span style={styles.divider}>|</span>
          <span>Versão: v2.4</span>
        </div>
        <div style={styles.errorContainer}>
          <h2>❌ Acesso Negado</h2>
          <p>{mensagemErro}</p>
          <p>
            Você não possui as permissões necessárias para visualizar este
            conteúdo.
          </p>
        </div>
      </div>
    );
  }

  

  // ✅ CALCULAR ESTATÍSTICAS
  const calcularEstatisticas = () => {
    const totalEmendas = emendas.length;
    const totalDespesas = despesas.length;

    const valorTotalEmendas = emendas.reduce((total, emenda) => {
      const valor = parseFloat(emenda.valor || emenda.valorRecurso || 0);
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);

    const valorTotalDespesas = despesas.reduce((total, despesa) => {
      const valor = parseFloat(despesa.valor || 0);
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);

    const saldoDisponivel = valorTotalEmendas - valorTotalDespesas;
    const percentualExecutado =
      valorTotalEmendas > 0
        ? (valorTotalDespesas / valorTotalEmendas) * 100
        : 0;

    return {
      totalEmendas,
      totalDespesas,
      valorTotalEmendas,
      valorTotalDespesas,
      saldoDisponivel,
      percentualExecutado: Math.round(percentualExecutado * 100) / 100,
    };
  };

  const stats = calcularEstatisticas();

  const formatCurrency = (valor) => {
    const numericValue = parseFloat(valor) || 0;
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  // ✅ ESTADOS DE LOADING E ERRO
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBar}>
          <span>Status: 🔄 Carregando...</span>
          <span style={styles.divider}>|</span>
          <span>Versão: v2.4</span>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Carregando dados do dashboard...</p>
          <p style={styles.loadingSubtext}>
            {permissions.acessoTotal
              ? "Carregando todos os dados do sistema..."
              : `Carregando dados do município ${userMunicipio}...`}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBar}>
          <span>Status: ❌ Erro</span>
          <span style={styles.divider}>|</span>
          <span>Versão: v2.4</span>
        </div>
        <div style={styles.errorContainer}>
          <h2>❌ Erro no Dashboard</h2>
          <p>{error}</p>
          <button onClick={carregarDados} style={styles.retryButton}>
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // ✅ RENDERIZAÇÃO PRINCIPAL
  return (
    <div style={styles.container}>
      {/* STATUS BAR */}
      <div style={styles.statusBar}>
        <span>Status: ✅ Operacional</span>
        <span style={styles.divider}>|</span>
        <span>Versão: v2.4</span>
        <span style={styles.divider}>|</span>
        <span>
          Usuário:{" "}
          {permissions.acessoTotal
            ? "👑 Admin"
            : `🏘️ ${userMunicipio || "Município não cadastrado"}`}
        </span>
        <span style={styles.divider}>|</span>
        <span>
          Dados: {stats.totalEmendas} emendas • {stats.totalDespesas} despesas
        </span>
      </div>

      {/* BANNER OPERADOR */}
      {permissions.filtroAplicado && userMunicipio && (
        <div style={styles.infoBar}>
          <span style={styles.infoIcon}>🔒</span>
          <div style={styles.infoContent}>
            <span style={styles.infoText}>
              <strong>Filtro Ativo:</strong> Exibindo dados do município{" "}
              <strong>
                {userMunicipio}/{userUf || "UF não informada"}
              </strong>
            </span>
            <span style={styles.infoSubtext}>
              {stats.totalEmendas} emenda(s) • {stats.totalDespesas} despesa(s)
              disponíveis
            </span>
          </div>
        </div>
      )}

      {/* MÉTRICAS PRINCIPAIS - COMPACTAS */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricNumber}>{stats.totalEmendas}</div>
          <div style={styles.metricLabel}>Emendas</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricNumber}>{stats.totalDespesas}</div>
          <div style={styles.metricLabel}>Despesas</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {formatCurrency(stats.valorTotalEmendas)}
          </div>
          <div style={styles.metricLabel}>Valor Total</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {formatCurrency(stats.valorTotalDespesas)}
          </div>
          <div style={styles.metricLabel}>Executado</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {formatCurrency(stats.saldoDisponivel)}
          </div>
          <div style={styles.metricLabel}>Saldo</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricPercentage}>
            {stats.percentualExecutado}%
          </div>
          <div style={styles.metricLabel}>Executado</div>
        </div>
      </div>

      {/* 💎 WIDGET CRONOGRAMA - APENAS SE HOUVER EMENDAS */}
      {emendas.length > 0 && <CronogramaWidget emendas={emendas} />}

      {/* ESTADO VAZIO */}
      {stats.totalEmendas === 0 && stats.totalDespesas === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📊</div>
          <h3>Sistema Aguardando Dados</h3>
          <p>
            {permissions.acessoTotal
              ? "Não há emendas ou despesas cadastradas no sistema."
              : `Não há dados cadastrados para o município ${userMunicipio || "não informado"}.`}
          </p>
          <p style={styles.emptySubtext}>
            O dashboard será populado automaticamente conforme os dados forem
            cadastrados.
          </p>
        </div>
      )}
    </div>
  );
};

// 🎨 ESTILOS REFINADOS
const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  statusBar: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    background: "linear-gradient(135deg, #154360, #4A90E2)",
    color: "white",
    padding: "6px 16px",
    borderRadius: "6px",
    marginBottom: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    fontSize: "13px",
    gap: "6px",
  },
  divider: {
    opacity: 0.7,
    margin: "0 3px",
  },
  infoBar: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "#e8f5e8",
    border: "1px solid #4caf50",
    borderRadius: 8,
    marginBottom: "16px",
    fontSize: 13,
    color: "#2e7d32",
    boxShadow: "0 2px 6px rgba(76, 175, 80, 0.1)",
  },
  infoIcon: {
    fontSize: 16,
    flexShrink: 0,
    marginTop: 1,
  },
  infoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 1.3,
    fontWeight: "500",
  },
  infoSubtext: {
    fontSize: 11,
    opacity: 0.8,
    fontWeight: "400",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  metricCard: {
    backgroundColor: "white",
    padding: "16px 12px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e9ecef",
    transition: "box-shadow 0.2s ease",
  },
  metricNumber: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0066cc",
    marginBottom: "4px",
    lineHeight: 1,
  },
  metricValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#28a745",
    marginBottom: "4px",
    lineHeight: 1,
  },
  metricPercentage: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffc107",
    marginBottom: "4px",
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: "11px",
    color: "#6c757d",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "50px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "6px",
  },
  loadingSubtext: {
    fontSize: "13px",
    color: "#666",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#f8d7da",
    borderRadius: "8px",
    border: "1px solid #f5c6cb",
  },
  retryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptySubtext: {
    color: "#666",
    fontSize: "13px",
    fontStyle: "italic",
    marginTop: "8px",
  },
};

// 🎨 ESTILOS DO CRONOGRAMA REFINADOS
const cronogramaStyles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e9ecef",
    marginBottom: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: "20px",
    borderBottom: "1px solid #f1f3f4",
    paddingBottom: "12px",
  },
  title: {
    margin: "0 0 3px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "13px",
    fontWeight: "400",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  metricCard: {
    padding: "16px",
    borderRadius: "6px",
    border: "1px solid #e1e5e9",
    backgroundColor: "#fff",
    transition: "all 0.2s ease", // ✅ MELHORADO: Transição para hover
  },
  warningCard: {
    borderColor: "#f57c00",
    backgroundColor: "#fffbf0",
    "&:hover": {
      // ✅ NOVO: Efeito hover
      borderColor: "#e65100",
      boxShadow: "0 4px 12px rgba(245, 124, 0, 0.2)",
    },
  },
  dangerCard: {
    borderColor: "#d32f2f",
    backgroundColor: "#fef2f2",
    "&:hover": {
      // ✅ NOVO: Efeito hover
      borderColor: "#b71c1c",
      boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)",
    },
  },
  successCard: {
    borderColor: "#388e3c",
    backgroundColor: "#f8fff8",
    "&:hover": {
      // ✅ NOVO: Efeito hover
      borderColor: "#2e7d32",
      boxShadow: "0 4px 12px rgba(56, 142, 60, 0.2)",
    },
  },
  infoCard: {
    borderColor: "#0277bd",
    backgroundColor: "#f0f9ff",
    "&:hover": {
      // ✅ NOVO: Efeito hover
      borderColor: "#01579b",
      boxShadow: "0 4px 12px rgba(2, 119, 189, 0.2)",
    },
  },
  metricHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  iconContainer: {
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  metricIcon: {
    fontSize: "16px",
  },
  metricTitle: {
    margin: "0 0 1px 0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
  },
  metricSubtitle: {
    margin: 0,
    fontSize: "11px",
    color: "#6c757d",
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#212529",
    marginBottom: "12px",
    lineHeight: 1,
  },
  itemsList: {
    maxHeight: "80px",
    overflowY: "auto",
  },
  emendaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #f8f9fa",
    fontSize: "12px",
  },
  emendaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    flex: 1,
    minWidth: 0,
  },
  emendaLocal: {
    color: "#6c757d",
    fontSize: "10px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  diasBadge: {
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: "60px",
  },
  progressBar: {
    width: "30px",
    height: "4px",
    backgroundColor: "#e9ecef",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#388e3c",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#495057",
    minWidth: "22px",
  },
  emptyMessage: {
    fontSize: "11px",
    color: "#6c757d",
    fontStyle: "italic",
    textAlign: "center",
    padding: "8px 0",
  },
  summary: {
    display: "flex",
    justifyContent: "space-around",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #dee2e6",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  summaryLabel: {
    fontSize: "10px",
    color: "#6c757d",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#212529",
  },
};

// ✅ ANIMAÇÕES CSS - ATUALIZADO COM HOVER
if (!document.getElementById("dashboard-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "dashboard-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .metric-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    /* ✅ NOVO: Hover effects para cards clicáveis */
    div[style*="cursor: pointer"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;