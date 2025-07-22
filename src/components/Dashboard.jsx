import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#4A90E2", "#27AE60", "#F5A623", "#D0021B", "#9013FE"];
const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const SUCCESS = "#27AE60";
const WARNING = "#F39C12";
const ERROR = "#E74C3C";
const WHITE = "#fff";
const GRAY = "#6B7280";

export default function Dashboard({ usuario }) {
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [emendasSnap, despesasSnap] = await Promise.all([
          getDocs(collection(db, "emendas")),
          getDocs(query(collection(db, "despesas"), orderBy("data", "desc"))),
        ]);

        setEmendas(emendasSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setDespesas(despesasSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // ✅ NOVOS CÁLCULOS ENTERPRISE - FASE 1
  const calcularMetricasIntegradas = () => {
    // Calcular valor executado por emenda
    const emendasComExecucao = emendas.map((emenda) => {
      const despesasEmenda = despesas.filter((d) => d.emendaId === emenda.id);
      const valorExecutado = despesasEmenda.reduce(
        (sum, d) => sum + (d.valor || 0),
        0,
      );
      const valorTotal = emenda.valorTotal || emenda.valorRecurso || 0;
      const saldoDisponivel = valorTotal - valorExecutado;
      const percentualExecutado =
        valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

      return {
        ...emenda,
        valorExecutado,
        saldoDisponivel,
        percentualExecutado,
        despesasCount: despesasEmenda.length,
      };
    });

    return emendasComExecucao;
  };

  const emendasComMetricas = calcularMetricasIntegradas();

  // Cálculos principais atualizados
  const totalEmendas = emendas.length;
  const totalDespesas = despesas.length;
  const valorTotalEmendas = emendasComMetricas.reduce(
    (sum, e) => sum + (e.valorTotal || e.valorRecurso || 0),
    0,
  );
  const valorTotalExecutado = emendasComMetricas.reduce(
    (sum, e) => sum + (e.valorExecutado || 0),
    0,
  );
  const saldoTotalDisponivel = valorTotalEmendas - valorTotalExecutado;
  const percentualGeralExecutado =
    valorTotalEmendas > 0 ? (valorTotalExecutado / valorTotalEmendas) * 100 : 0;

  // ✅ NOVAS MÉTRICAS ENTERPRISE
  const emendasComSaldo = emendasComMetricas.filter(
    (e) => e.saldoDisponivel > 0,
  ).length;
  const emendasEsgotadas = emendasComMetricas.filter(
    (e) => e.saldoDisponivel <= 0,
  ).length;
  const emendasSemDespesas = emendasComMetricas.filter(
    (e) => e.despesasCount === 0,
  ).length;
  const mediaExecucaoPorEmenda =
    emendasComMetricas.length > 0
      ? emendasComMetricas.reduce((sum, e) => sum + e.percentualExecutado, 0) /
        emendasComMetricas.length
      : 0;

  // Dados para gráficos atualizados
  const emendasPorMes = emendas.reduce((acc, e) => {
    if (!e.data && !e.dataValidada && !e.validade) return acc;
    const dataEmenda = e.data || e.dataValidada || e.validade;
    const mes = new Date(dataEmenda).toLocaleString("pt-BR", {
      month: "short",
      year: "numeric",
    });
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  const dataBar = Object.entries(emendasPorMes).map(([mes, count]) => ({
    mes,
    count,
  }));

  // ✅ NOVO GRÁFICO: Execução por Emenda
  const execucaoPorEmenda = emendasComMetricas
    .filter((e) => e.valorTotal > 0)
    .slice(0, 10) // Top 10
    .map((e) => ({
      nome: e.numero || e.parlamentar?.substring(0, 15) || "S/N",
      valorTotal: e.valorTotal || 0,
      valorExecutado: e.valorExecutado || 0,
      percentual: e.percentualExecutado || 0,
    }));

  const execucaoPorTipo = emendas.reduce((acc, e) => {
    const tipo = e.tipo || "Não definido";
    if (!acc[tipo]) {
      acc[tipo] = { name: tipo, value: 0, total: 0 };
    }
    const executado = despesas
      .filter((l) => l.emendaId === e.id)
      .reduce((sum, l) => sum + (l.valor || 0), 0);
    acc[tipo].value += executado;
    acc[tipo].total += e.valorTotal || 0;
    return acc;
  }, {});

  const dataPie = Object.values(execucaoPorTipo);

  // Alertas e insights atualizados
  const emendasVencidas = emendas.filter((e) => {
    const validade = e.validade || e.dataValidada;
    if (!validade) return false;
    return new Date(validade) < new Date();
  });

  const emendasProximasVencimento = emendas.filter((e) => {
    const validade = e.validade || e.dataValidada;
    if (!validade) return false;
    const vencimento = new Date(validade);
    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);
    return vencimento >= hoje && vencimento <= em30Dias;
  });

  // ✅ NOVOS ALERTAS ENTERPRISE
  const emendasSaldoBaixo = emendasComMetricas.filter((e) => {
    const saldo = e.saldoDisponivel || 0;
    const total = e.valorTotal || 0;
    return total > 0 && saldo > 0 && saldo / total < 0.1; // Menos de 10%
  });

  const ultimosDespesas = despesas.slice(0, 5);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  const handleCardClick = (cardType, path) => {
    setActiveCard(cardType);
    setTimeout(() => {
      // Navegação seria implementada aqui
      console.log(`Navegar para: ${path}`);
      setActiveCard(null);
    }, 200);
  };

  const getEmendaInfo = (emendaId) => {
    const emenda = emendas.find((e) => e.id === emendaId);
    return emenda
      ? `${emenda.numero} - ${emenda.parlamentar}`
      : "Emenda não encontrada";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header com saudação */}
      <div style={styles.welcomeSection}>
        <div>
          <h1 style={styles.welcomeTitle}>
            👋 Olá,{" "}
            {usuario?.displayName || usuario?.email?.split("@")[0] || "Usuário"}
            !
          </h1>
          <p style={styles.welcomeSubtitle}>
            Dashboard integrado - Relacionamento Emendas e Despesas
          </p>
        </div>
        <div style={styles.welcomeDate}>
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ✅ KPIs ATUALIZADOS COM MÉTRICAS ENTERPRISE */}
      <div style={styles.kpiGrid}>
        <div
          style={{
            ...styles.kpiCard,
            ...(activeCard === "emendas" ? styles.activeCard : {}),
            borderLeft: `4px solid ${ACCENT}`,
          }}
          onClick={() => handleCardClick("emendas", "/emendas")}
        >
          <div style={styles.kpiIcon}>📄</div>
          <div style={styles.kpiContent}>
            <h3 style={{ ...styles.kpiValue, color: ACCENT }}>
              {totalEmendas}
            </h3>
            <p style={styles.kpiLabel}>Emendas Cadastradas</p>
            <span style={styles.clickHint}>
              {emendasComSaldo} com saldo disponível
            </span>
          </div>
        </div>

        <div
          style={{
            ...styles.kpiCard,
            ...(activeCard === "despesas" ? styles.activeCard : {}),
            borderLeft: `4px solid ${SUCCESS}`,
          }}
          onClick={() => handleCardClick("despesas", "/despesas")}
        >
          <div style={styles.kpiIcon}>💸</div>
          <div style={styles.kpiContent}>
            <h3 style={{ ...styles.kpiValue, color: SUCCESS }}>
              {totalDespesas}
            </h3>
            <p style={styles.kpiLabel}>Despesas Registradas</p>
            <span style={styles.clickHint}>Vinculadas às emendas</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: `4px solid ${WARNING}` }}>
          <div style={styles.kpiIcon}>💰</div>
          <div style={styles.kpiContent}>
            <h3 style={{ ...styles.kpiValue, color: WARNING }}>
              {formatCurrency(valorTotalEmendas)}
            </h3>
            <p style={styles.kpiLabel}>Valor Total Emendas</p>
            <span style={styles.kpiSubtext}>Recursos disponibilizados</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: `4px solid ${ERROR}` }}>
          <div style={styles.kpiIcon}>📊</div>
          <div style={styles.kpiContent}>
            <h3 style={{ ...styles.kpiValue, color: ERROR }}>
              {formatCurrency(valorTotalExecutado)}
            </h3>
            <p style={styles.kpiLabel}>Valor Executado</p>
            <span style={styles.kpiSubtext}>
              {percentualGeralExecutado.toFixed(1)}% do total
            </span>
          </div>
        </div>

        <div
          style={{
            ...styles.kpiCard,
            borderLeft: `4px solid ${saldoTotalDisponivel > 0 ? SUCCESS : ERROR}`,
          }}
        >
          <div style={styles.kpiIcon}>💳</div>
          <div style={styles.kpiContent}>
            <h3
              style={{
                ...styles.kpiValue,
                color: saldoTotalDisponivel > 0 ? SUCCESS : ERROR,
              }}
            >
              {formatCurrency(saldoTotalDisponivel)}
            </h3>
            <p style={styles.kpiLabel}>Saldo Total Disponível</p>
            <span style={styles.kpiSubtext}>
              {emendasEsgotadas} emendas esgotadas
            </span>
          </div>
        </div>

        {/* ✅ NOVO KPI: Média de Execução */}
        <div style={{ ...styles.kpiCard, borderLeft: `4px solid ${PRIMARY}` }}>
          <div style={styles.kpiIcon}>📈</div>
          <div style={styles.kpiContent}>
            <h3 style={{ ...styles.kpiValue, color: PRIMARY }}>
              {mediaExecucaoPorEmenda.toFixed(1)}%
            </h3>
            <p style={styles.kpiLabel}>Média de Execução</p>
            <span style={styles.kpiSubtext}>
              {emendasSemDespesas} sem despesas
            </span>
          </div>
        </div>
      </div>

      {/* ✅ ALERTAS ATUALIZADOS COM NOVOS CENÁRIOS */}
      {(emendasVencidas.length > 0 ||
        emendasProximasVencimento.length > 0 ||
        emendasSaldoBaixo.length > 0) && (
        <div style={styles.alertsSection}>
          <h2 style={styles.sectionTitle}>⚠️ Alertas Importantes</h2>
          <div style={styles.alertsGrid}>
            {emendasVencidas.length > 0 && (
              <div
                style={{
                  ...styles.alertCard,
                  borderLeft: `4px solid ${ERROR}`,
                }}
              >
                <div style={styles.alertIcon}>🚨</div>
                <div>
                  <h4 style={{ ...styles.alertTitle, color: ERROR }}>
                    {emendasVencidas.length} Emenda
                    {emendasVencidas.length !== 1 ? "s" : ""} Vencida
                    {emendasVencidas.length !== 1 ? "s" : ""}
                  </h4>
                  <p style={styles.alertText}>
                    Emendas com prazo de validade expirado
                  </p>
                </div>
              </div>
            )}

            {emendasProximasVencimento.length > 0 && (
              <div
                style={{
                  ...styles.alertCard,
                  borderLeft: `4px solid ${WARNING}`,
                }}
              >
                <div style={styles.alertIcon}>⏰</div>
                <div>
                  <h4 style={{ ...styles.alertTitle, color: WARNING }}>
                    {emendasProximasVencimento.length} Emenda
                    {emendasProximasVencimento.length !== 1 ? "s" : ""} Próxima
                    {emendasProximasVencimento.length !== 1 ? "s" : ""} ao
                    Vencimento
                  </h4>
                  <p style={styles.alertText}>Vencem nos próximos 30 dias</p>
                </div>
              </div>
            )}

            {/* ✅ NOVO ALERTA: Saldo Baixo */}
            {emendasSaldoBaixo.length > 0 && (
              <div
                style={{
                  ...styles.alertCard,
                  borderLeft: `4px solid ${WARNING}`,
                }}
              >
                <div style={styles.alertIcon}>⚠️</div>
                <div>
                  <h4 style={{ ...styles.alertTitle, color: WARNING }}>
                    {emendasSaldoBaixo.length} Emenda
                    {emendasSaldoBaixo.length !== 1 ? "s" : ""} com Saldo Baixo
                  </h4>
                  <p style={styles.alertText}>
                    Menos de 10% do valor disponível
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ GRÁFICOS ATUALIZADOS + NOVO GRÁFICO DE EXECUÇÃO */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>📊 Execução por Tipo de Emenda</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: WHITE, borderRadius: 8 }}
                formatter={(value) => [
                  formatCurrency(value),
                  "Valor Executado",
                ]}
              />
              <Legend />
              <Pie
                data={dataPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
              >
                {dataPie.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ NOVO GRÁFICO: Top Emendas por Execução */}
        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>
            🎯 Top Emendas - Execução Financeira
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={execucaoPorEmenda}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: WHITE, borderRadius: 8 }}
                formatter={(value, name) => [
                  name === "percentual"
                    ? `${value.toFixed(1)}%`
                    : formatCurrency(value),
                  name === "valorTotal"
                    ? "Valor Total"
                    : name === "valorExecutado"
                      ? "Executado"
                      : "Execução",
                ]}
              />
              <Legend />
              <Bar dataKey="valorTotal" fill="#4A90E2" name="Valor Total" />
              <Bar dataKey="valorExecutado" fill="#27AE60" name="Executado" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>📈 Emendas Cadastradas por Período</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataBar}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: WHITE, borderRadius: 8 }}
              />
              <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimas despesas - mantido igual */}
      <div style={styles.recentSection}>
        <div style={styles.recentHeader}>
          <h2 style={styles.sectionTitle}>🕐 Últimas Despesas</h2>
          <button
            style={styles.viewAllButton}
            onClick={() => console.log("Navegar para /despesas")}
          >
            Ver todas
          </button>
        </div>

        {ultimosDespesas.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>Nenhuma despesa registrada ainda</p>
          </div>
        ) : (
          <div style={styles.recentList}>
            {ultimosDespesas.map((despesa, index) => (
              <div
                key={despesa.id}
                style={styles.recentItem}
                onClick={() =>
                  console.log(
                    `Navegar para /emendas/${despesa.emendaId}/fluxo/${despesa.id}`,
                  )
                }
              >
                <div style={styles.recentIcon}>💸</div>
                <div style={styles.recentContent}>
                  <h4 style={styles.recentTitle}>
                    {formatCurrency(despesa.valor)}
                  </h4>
                  <p style={styles.recentDescription}>{despesa.descricao}</p>
                  <p style={styles.recentEmenda}>
                    {getEmendaInfo(despesa.emendaId)}
                  </p>
                </div>
                <div style={styles.recentDate}>{formatDate(despesa.data)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ações rápidas - mantidas iguais */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>⚡ Ações Rápidas</h2>
        <div style={styles.actionsGrid}>
          <button
            style={styles.actionButton}
            onClick={() => console.log("Navegar para /emendas")}
          >
            <span style={styles.actionIcon}>📄</span>
            <span>Nova Emenda</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => console.log("Navegar para /despesas")}
          >
            <span style={styles.actionIcon}>💸</span>
            <span>Nova Despesa</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => console.log("Navegar para /relatorios")}
          >
            <span style={styles.actionIcon}>📈</span>
            <span>Ver Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos mantidos iguais do arquivo original
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    padding: "24px",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
    color: PRIMARY,
  },

  loadingSpinner: {
    width: 40,
    height: 40,
    border: "4px solid #e3e3e3",
    borderTop: "4px solid " + PRIMARY,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 16,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    margin: 0,
  },

  welcomeSection: {
    background:
      "linear-gradient(135deg, " + PRIMARY + " 0%, " + ACCENT + " 100%)",
    borderRadius: 16,
    padding: "32px",
    marginBottom: 32,
    color: WHITE,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },

  welcomeTitle: {
    fontSize: 32,
    fontWeight: "600",
    margin: 0,
    marginBottom: 8,
  },

  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.9,
    margin: 0,
  },

  welcomeDate: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "right",
    textTransform: "capitalize",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
    marginBottom: 32,
  },

  kpiCard: {
    background: WHITE,
    borderRadius: 12,
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 16,
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },

  activeCard: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  },

  kpiIcon: {
    fontSize: 32,
    flexShrink: 0,
  },

  kpiContent: {
    flex: 1,
  },

  kpiValue: {
    fontSize: 28,
    fontWeight: "600",
    margin: 0,
    marginBottom: 4,
    lineHeight: 1,
  },

  kpiLabel: {
    fontSize: 14,
    color: "#666",
    margin: 0,
    marginBottom: 4,
    fontWeight: "500",
  },

  kpiSubtext: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },

  clickHint: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: "500",
  },

  alertsSection: {
    marginBottom: 32,
  },

  sectionTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    margin: 0,
  },

  alertsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
  },

  alertCard: {
    background: WHITE,
    borderRadius: 12,
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  alertIcon: {
    fontSize: 24,
    flexShrink: 0,
  },

  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    margin: 0,
    marginBottom: 4,
  },

  alertText: {
    fontSize: 14,
    color: "#666",
    margin: 0,
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: 24,
    marginBottom: 32,
  },

  chartCard: {
    background: WHITE,
    borderRadius: 12,
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  chartTitle: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },

  recentSection: {
    background: WHITE,
    borderRadius: 12,
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: 32,
  },

  recentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  viewAllButton: {
    background: ACCENT,
    color: WHITE,
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
    transition: "background-color 0.2s",
  },

  emptyState: {
    textAlign: "center",
    padding: 40,
    color: "#666",
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 16,
    margin: 0,
  },

  recentList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  recentItem: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px",
    borderRadius: 8,
    background: "#f8f9fa",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },

  recentIcon: {
    fontSize: 20,
    flexShrink: 0,
  },

  recentContent: {
    flex: 1,
  },

  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: ERROR,
    margin: 0,
    marginBottom: 4,
  },

  recentDescription: {
    fontSize: 14,
    color: "#333",
    margin: 0,
    marginBottom: 4,
  },

  recentEmenda: {
    fontSize: 12,
    color: "#666",
    margin: 0,
  },

  recentDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },

  quickActions: {
    background: WHITE,
    borderRadius: 12,
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },

  actionButton: {
    background: GRAY,
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    padding: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    fontWeight: "500",
    color: PRIMARY,
    transition: "all 0.2s",
  },

  actionIcon: {
    fontSize: 20,
  },
};

// CSS Animation
const spinnerCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = spinnerCSS;
  document.head.appendChild(style);
}
