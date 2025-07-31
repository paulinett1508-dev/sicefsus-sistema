// Dashboard.jsx - INTEGRAÇÃO CIRÚRGICA COM WIDGET CRONOGRAMA
// ✅ PRESERVA: Toda lógica existente de permissões e carregamento
// ✅ ADICIONA: Widget CronogramaWidget abaixo das métricas

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext";

// 💎 WIDGET CRONOGRAMA INTELIGENTE
const CronogramaWidget = ({ emendas = [] }) => {
  const [cronogramaData, setCronogramaData] = useState({
    proximasVencer: [],
    vencidas: [],
    emAndamento: [],
    concluidas: []
};

// ✅ CSS PARA ANIMAÇÃO - PRESERVADO
if (!document.getElementById("dashboard-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "dashboard-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;);

  // ✅ PROCESSAR dados das emendas
  useEffect(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const processarEmendas = () => {
      const proximasVencer = [];
      const vencidas = [];
      const emAndamento = [];
      const concluidas = [];

      emendas.forEach(emenda => {
        // Usar campos do SICEFSUS: dataValidada ou dataValidade
        const dataValidadeStr = emenda.dataValidada || emenda.dataValidade;
        if (!dataValidadeStr) return;

        const dataValidade = new Date(dataValidadeStr);
        const diffTime = dataValidade - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calcular percentual executado
        const valorTotal = parseFloat(emenda.valor || emenda.valorRecurso || 0);
        const valorExecutado = parseFloat(emenda.valorExecutado || 0);
        const percentualExecutado = valorTotal > 0 ? (valorExecutado / valorTotal * 100) : 0;

        const emendaComDias = {
          ...emenda,
          diasRestantes: diffDays,
          percentualExecutado,
          parlamentar: emenda.autor || emenda.parlamentar || 'Não informado'
        };

        if (diffDays < 0) {
          vencidas.push(emendaComDias);
        } else if (diffDays <= 30) {
          proximasVencer.push(emendaComDias);
        } else if (emenda.inicioExecucao && emenda.finalExecucao) {
          const dataInicio = new Date(emenda.inicioExecucao);
          const dataFim = new Date(emenda.finalExecucao);

          if (hoje >= dataInicio && hoje <= dataFim) {
            emAndamento.push(emendaComDias);
          } else if (hoje > dataFim) {
            concluidas.push(emendaComDias);
          }
        } else if (percentualExecutado >= 100) {
          concluidas.push(emendaComDias);
        } else if (percentualExecutado > 0) {
          emAndamento.push(emendaComDias);
        }
      });

      setCronogramaData({
        proximasVencer: proximasVencer.sort((a, b) => a.diasRestantes - b.diasRestantes),
        vencidas: vencidas.sort((a, b) => b.diasRestantes - a.diasRestantes),
        emAndamento: emAndamento.sort((a, b) => b.percentualExecutado - a.percentualExecutado),
        concluidas: concluidas.slice(0, 5)
      });
    };

    processarEmendas();
  }, [emendas]);

  // ✅ FORMATADORES
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div style={cronogramaStyles.container}>
      <div style={cronogramaStyles.header}>
        <h3 style={cronogramaStyles.title}>
          <span style={cronogramaStyles.icon}>📅</span>
          Cronograma Inteligente
        </h3>
        <span style={cronogramaStyles.subtitle}>
          Acompanhamento de prazos e execução
        </span>
      </div>

      <div style={cronogramaStyles.metricsGrid}>
        {/* ⚠️ EMENDAS PRÓXIMAS AO VENCIMENTO */}
        <div style={{...cronogramaStyles.metricCard, ...cronogramaStyles.warningCard}}>
          <div style={cronogramaStyles.metricHeader}>
            <span style={cronogramaStyles.metricIcon}>⚠️</span>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Próximas ao Vencimento</h4>
              <p style={cronogramaStyles.metricSubtitle}>≤ 30 dias</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>{cronogramaData.proximasVencer.length}</div>

          {cronogramaData.proximasVencer.slice(0, 3).map((emenda, index) => (
            <div key={emenda.id || index} style={cronogramaStyles.emendaItem}>
              <div style={cronogramaStyles.emendaInfo}>
                <strong>{emenda.parlamentar}</strong>
                <span style={cronogramaStyles.emendaLocal}>{emenda.municipio}/{emenda.uf}</span>
              </div>
              <div style={cronogramaStyles.emendaDias}>
                <span style={{
                  ...cronogramaStyles.diasBadge,
                  backgroundColor: emenda.diasRestantes <= 7 ? '#dc3545' : '#ffc107',
                  color: emenda.diasRestantes <= 7 ? 'white' : '#212529'
                }}>
                  {emenda.diasRestantes} dias
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ❌ EMENDAS VENCIDAS */}
        <div style={{...cronogramaStyles.metricCard, ...cronogramaStyles.dangerCard}}>
          <div style={cronogramaStyles.metricHeader}>
            <span style={cronogramaStyles.metricIcon}>❌</span>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Vencidas</h4>
              <p style={cronogramaStyles.metricSubtitle}>Prazo expirado</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>{cronogramaData.vencidas.length}</div>

          {cronogramaData.vencidas.slice(0, 3).map((emenda, index) => (
            <div key={emenda.id || index} style={cronogramaStyles.emendaItem}>
              <div style={cronogramaStyles.emendaInfo}>
                <strong>{emenda.parlamentar}</strong>
                <span style={cronogramaStyles.emendaLocal}>{emenda.municipio}/{emenda.uf}</span>
              </div>
              <div style={cronogramaStyles.emendaDias}>
                <span style={{...cronogramaStyles.diasBadge, backgroundColor: '#dc3545', color: 'white'}}>
                  {Math.abs(emenda.diasRestantes)} dias atrás
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 🚀 EM ANDAMENTO */}
        <div style={{...cronogramaStyles.metricCard, ...cronogramaStyles.successCard}}>
          <div style={cronogramaStyles.metricHeader}>
            <span style={cronogramaStyles.metricIcon}>🚀</span>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Em Andamento</h4>
              <p style={cronogramaStyles.metricSubtitle}>Executando no prazo</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>{cronogramaData.emAndamento.length}</div>

          {cronogramaData.emAndamento.slice(0, 3).map((emenda, index) => (
            <div key={emenda.id || index} style={cronogramaStyles.emendaItem}>
              <div style={cronogramaStyles.emendaInfo}>
                <strong>{emenda.parlamentar}</strong>
                <span style={cronogramaStyles.emendaLocal}>{formatCurrency(emenda.valor || emenda.valorRecurso)}</span>
              </div>
              <div style={cronogramaStyles.progressContainer}>
                <div style={cronogramaStyles.progressBar}>
                  <div 
                    style={{
                      ...cronogramaStyles.progressFill,
                      width: `${Math.min(emenda.percentualExecutado, 100)}%`
                    }}
                  />
                </div>
                <span style={cronogramaStyles.progressText}>
                  {emenda.percentualExecutado.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ CONCLUÍDAS */}
        <div style={{...cronogramaStyles.metricCard, ...cronogramaStyles.infoCard}}>
          <div style={cronogramaStyles.metricHeader}>
            <span style={cronogramaStyles.metricIcon}>✅</span>
            <div>
              <h4 style={cronogramaStyles.metricTitle}>Concluídas</h4>
              <p style={cronogramaStyles.metricSubtitle}>Execução finalizada</p>
            </div>
          </div>
          <div style={cronogramaStyles.metricValue}>{cronogramaData.concluidas.length}</div>

          {cronogramaData.concluidas.slice(0, 3).map((emenda, index) => (
            <div key={emenda.id || index} style={cronogramaStyles.emendaItem}>
              <div style={cronogramaStyles.emendaInfo}>
                <strong>{emenda.parlamentar}</strong>
                <span style={cronogramaStyles.emendaLocal}>{emenda.municipio}/{emenda.uf}</span>
              </div>
              <div style={cronogramaStyles.emendaDias}>
                <span style={{...cronogramaStyles.diasBadge, backgroundColor: '#28a745', color: 'white'}}>
                  100%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📊 RESUMO GERAL */}
      <div style={cronogramaStyles.summary}>
        <div style={cronogramaStyles.summaryItem}>
          <span style={cronogramaStyles.summaryLabel}>Total de Emendas:</span>
          <span style={cronogramaStyles.summaryValue}>{emendas.length}</span>
        </div>
        <div style={cronogramaStyles.summaryItem}>
          <span style={cronogramaStyles.summaryLabel}>Requer Atenção:</span>
          <span style={{
            ...cronogramaStyles.summaryValue,
            color: cronogramaData.proximasVencer.length + cronogramaData.vencidas.length > 0 ? '#dc3545' : '#28a745'
          }}>
            {cronogramaData.proximasVencer.length + cronogramaData.vencidas.length}
          </span>
        </div>
        <div style={cronogramaStyles.summaryItem}>
          <span style={cronogramaStyles.summaryLabel}>Em Execução:</span>
          <span style={{...cronogramaStyles.summaryValue, color: '#0066cc'}}>
            {cronogramaData.emAndamento.length}
          </span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ usuario }) => {
  const user = usuario;
  const userLoading = !usuario;

  // Estados - PRESERVADOS
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("🏠 Dashboard iniciado");
  console.log("👤 Dados do usuário carregados para Dashboard:", user);

  // ✅ VERIFICAÇÃO - PRESERVADA
  if (userLoading || !user || !user.email || !user.tipo) {
    console.log("⏳ Aguardando dados completos do usuário...", {
      userLoading,
      hasUser: !!user,
      hasEmail: !!user?.email,
      hasTipo: !!user?.tipo,
      user: user,
    });

    return (
      <div style={styles.container}>
        <div style={styles.statusBar}>
          <span>
            Status: ⏳{" "}
            {userLoading ? "Carregando usuário..." : "Verificando dados..."}
          </span>
          <span style={styles.divider}>|</span>
          <span>Versão: v2.2</span>
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

  // ✅ DETERMINAR PERMISSÕES - PRESERVADO
  const userRole = user.tipo || user.role || "operador";
  const userMunicipio = user.municipio || "";
  const userUf = user.uf || "";

  console.log("🔐 Permissões detectadas:", { userRole, userMunicipio, userUf });

  // ✅ FUNÇÃO PARA CARREGAR DADOS - PRESERVADA
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Iniciando carregamento de dados...");
      console.log("👤 Tipo de usuário:", userRole);

      let emendasData = [];
      let despesasData = [];

      // ✅ ADMIN: Carrega TODOS os dados sem filtro
      if (userRole === "admin") {
        console.log("👑 ADMIN: Carregando TODOS os dados (sem filtro)");

        // Carregar TODAS as emendas
        try {
          const emendasRef = collection(db, "emendas");
          const emendasQuery = query(
            emendasRef,
            orderBy("dataAprovacao", "desc"),
          );
          const emendasSnapshot = await getDocs(emendasQuery);

          emendasSnapshot.forEach((doc) => {
            emendasData.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          console.log(`✅ Admin - Emendas carregadas: ${emendasData.length}`);
        } catch (error) {
          console.error("❌ Erro ao carregar emendas para admin:", error);
        }

        // Carregar TODAS as despesas
        try {
          const despesasRef = collection(db, "despesas");
          const despesasQuery = query(despesasRef, orderBy("data", "desc"));
          const despesasSnapshot = await getDocs(despesasQuery);

          despesasSnapshot.forEach((doc) => {
            despesasData.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          console.log(`✅ Admin - Despesas carregadas: ${despesasData.length}`);
        } catch (error) {
          console.error("❌ Erro ao carregar despesas para admin:", error);
        }
      }

      // ✅ OPERADOR: Carrega apenas do município
      else if (userRole === "operador" && userMunicipio) {
        console.log(
          `🏘️ OPERADOR: Carregando dados do município ${userMunicipio}`,
        );

        // Carregar emendas do município
        try {
          const emendasRef = collection(db, "emendas");
          const emendasQuery = query(
            emendasRef,
            where("municipio", "==", userMunicipio),
            orderBy("dataAprovacao", "desc"),
          );
          const emendasSnapshot = await getDocs(emendasQuery);

          emendasSnapshot.forEach((doc) => {
            emendasData.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          console.log(
            `✅ Operador - Emendas do município carregadas: ${emendasData.length}`,
          );
        } catch (error) {
          console.error("❌ Erro ao carregar emendas para operador:", error);
        }

        // Carregar despesas das emendas do município
        try {
          if (emendasData.length > 0) {
            const emendasIds = emendasData.map((e) => e.id);

            // Carregar em lotes devido ao limite do Firestore
            const batchSize = 10;
            for (let i = 0; i < emendasIds.length; i += batchSize) {
              const batch = emendasIds.slice(i, i + batchSize);

              const despesasRef = collection(db, "despesas");
              const despesasQuery = query(
                despesasRef,
                where("emendaId", "in", batch),
                orderBy("data", "desc"),
              );
              const despesasSnapshot = await getDocs(despesasQuery);

              despesasSnapshot.forEach((doc) => {
                despesasData.push({
                  id: doc.id,
                  ...doc.data(),
                });
              });
            }
          }

          console.log(
            `✅ Operador - Despesas do município carregadas: ${despesasData.length}`,
          );
        } catch (error) {
          console.error("❌ Erro ao carregar despesas para operador:", error);
        }
      }

      // ✅ USUÁRIO SEM PERMISSÕES ADEQUADAS
      else {
        console.warn("⚠️ Usuário sem permissões adequadas:", {
          userRole,
          userMunicipio,
        });
        setError("Usuário sem permissões adequadas para acessar o dashboard.");
        setLoading(false);
        return;
      }

      // ✅ ATUALIZAR ESTADOS
      setEmendas(emendasData);
      setDespesas(despesasData);

      console.log("✅ Carregamento concluído:", {
        emendas: emendasData.length,
        despesas: despesasData.length,
      });
    } catch (error) {
      console.error("❌ Erro geral no carregamento:", error);
      setError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ EFFECT PARA CARREGAR DADOS - PRESERVADO
  useEffect(() => {
    console.log(
      "🔄 useEffect Dashboard - Verificando necessidade de carregar dados",
    );
    console.log("👤 User disponível:", !!user);
    console.log("📧 Email:", user?.email);
    console.log("🔐 Tipo:", user?.tipo);
    console.log(
      "📊 Dados atuais - emendas:",
      emendas.length,
      "despesas:",
      despesas.length,
    );

    // Verificar se tem os dados essenciais
    if (user && user.email && user.tipo) {
      console.log("🚀 Iniciando carregamento de dados para:", userRole);
      carregarDados();
    } else {
      console.log("⏳ Aguardando dados completos do usuário...");
      console.log("Dados recebidos:", {
        user,
        email: user?.email,
        tipo: user?.tipo,
      });
    }
  }, [user?.email, user?.tipo]); // Dependências mais específicas

  // ✅ CALCULAR MÉTRICAS - PRESERVADO
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

  // ✅ FORMATADOR DE MOEDA - PRESERVADO
  const formatCurrency = (valor) => {
    const numericValue = parseFloat(valor) || 0;
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  // ✅ RENDERIZAÇÃO CONDICIONAL - PRESERVADA
  if (loading) {
    return (
      <div style={styles.container}>
        {/* Status Bar */}
        <div style={styles.statusBar}>
          <span>Status: 🔄 Carregando...</span>
          <span style={styles.divider}>|</span>
          <span>Versão: v2.2</span>
          <span style={styles.divider}>|</span>
          <span>
            Usuário: {userRole === "admin" ? "👑 Admin" : `🏘️ ${userMunicipio}`}
          </span>
          <span style={styles.divider}>|</span>
          <span>Dados: Carregando...</span>
        </div>

        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Carregando dados do dashboard...</p>
          <p style={styles.loadingSubtext}>
            {userRole === "admin"
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
          <span>Versão: v2.2</span>
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

  // ✅ RENDERIZAÇÃO PRINCIPAL - ATUALIZADA COM WIDGET
  return (
    <div style={styles.container}>
      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span>Status: ✅ Operacional</span>
        <span style={styles.divider}>|</span>
        <span>Versão: v2.2</span>
        <span style={styles.divider}>|</span>
        <span>
          Usuário:{" "}
          {userRole === "admin"
            ? "👑 Admin"
            : `🏘️ ${userMunicipio || "Município não cadastrado"}`}
        </span>
        <span style={styles.divider}>|</span>
        <span>
          Dados: {stats.totalEmendas} emendas • {stats.totalDespesas} despesas
        </span>
      </div>

      {/* Banner Informativo */}
      {userRole === "operador" && userMunicipio && (
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

      {/* Métricas Principais - PRESERVADAS */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricNumber}>{stats.totalEmendas}</div>
          <div style={styles.metricLabel}>EMENDAS CADASTRADAS</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricNumber}>{stats.totalDespesas}</div>
          <div style={styles.metricLabel}>DESPESAS REGISTRADAS</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {formatCurrency(stats.valorTotalEmendas)}
          </div>
          <div style={styles.metricLabel}>VALOR TOTAL EMENDAS</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {formatCurrency(stats.valorTotalDespesas)}
          </div>
          <div style={styles.metricLabel}>VALOR EXECUTADO</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {formatCurrency(stats.saldoDisponivel)}
          </div>
          <div style={styles.metricLabel}>SALDO DISPONÍVEL</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricPercentage}>
            {stats.percentualExecutado}%
          </div>
          <div style={styles.metricLabel}>PERCENTUAL EXECUTADO</div>
        </div>
      </div>

      {/* 💎 NOVO: WIDGET CRONOGRAMA */}
      {emendas.length > 0 && <CronogramaWidget emendas={emendas} />}

      {/* Estado Vazio - PRESERVADO */}
      {stats.totalEmendas === 0 && stats.totalDespesas === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📊</div>
          <h3>Sistema Limpo</h3>
          <p>
            {userRole === "admin"
              ? "Não há emendas ou despesas cadastradas no sistema."
              : `Não há dados cadastrados para o município ${userMunicipio || "não informado"}.`}
          </p>
          <p style={styles.emptySubtext}>
            Os dados aparecerão aqui conforme forem sendo cadastrados.
          </p>
        </div>
      )}
    </div>
  );
};

// ✅ ESTILOS ORIGINAIS - PRESERVADOS
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  statusBar: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    background: "linear-gradient(135deg, #154360, #4A90E2)",
    color: "white",
    padding: "8px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    fontSize: "14px",
    gap: "8px",
  },

  divider: {
    opacity: 0.7,
    margin: "0 4px",
  },

  infoBar: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#e8f5e8",
    border: "2px solid #4caf50",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#2e7d32",
    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.15)",
  },

  infoIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },

  infoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  infoText: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },

  infoSubtext: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  metricCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },

  metricNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: "8px",
  },

  metricValue: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: "8px",
  },

  metricPercentage: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#ffc107",
    marginBottom: "8px",
  },

  metricLabel: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  loadingContainer: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
    fontSize: "18px",
    color: "#333",
    marginBottom: "8px",
  },

  loadingSubtext: {
    fontSize: "14px",
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
    padding: "12px 24px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },

  emptySubtext: {
    color: "#666",
    fontSize: "14px",
    fontStyle: "italic",
  },
};

// 💎 ESTILOS DO WIDGET CRONOGRAMA
const cronogramaStyles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e9ecef',
    marginBottom: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    marginBottom: '24px',
    borderBottom: '2px solid #f8f9fa',
    paddingBottom: '16px'
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: '#212529',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  icon: {
    fontSize: '24px'
  },
  subtitle: {
    color: '#6c757d',
    fontSize: '14px',
    fontWeight: '400'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  metricCard: {
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    backgroundColor: '#fff'
  },
  warningCard: {
    borderColor: '#ffc107',
    backgroundColor: '#fffbf0'
  },
  dangerCard: {
    borderColor: '#dc3545',
    backgroundColor: '#fef2f2'
  },
  successCard: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff8'
  },
  infoCard: {
    borderColor: '#17a2b8',
    backgroundColor: '#f0f9ff'
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  metricIcon: {
    fontSize: '20px'
  },
  metricTitle: {
    margin: '0 0 2px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057'
  },
  metricSubtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#6c757d'
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '16px'
  },
  emendaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f8f9fa',
    fontSize: '13px'
  },
  emendaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1
  },
  emendaLocal: {
    color: '#6c757d',
    fontSize: '11px'
  },
  emendaDias: {
    display: 'flex',
    alignItems: 'center'
  },
  diasBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '80px'
  },
  progressBar: {
    width: '50px',
    height: '6px',
    backgroundColor: '#e9ecef',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#495057',
    minWidth: '25px'
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  summaryValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#212529'
  }