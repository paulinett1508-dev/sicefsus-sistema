// src/components/Relatorios.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
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
import PrintButton from "./PrintButton";

const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const SUCCESS = "#27AE60";
const WARNING = "#F39C12";
const ERROR = "#E74C3C";
const WHITE = "#fff";
const GRAY = "#f8f9fa";

const COLORS = [PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, "#9B59B6", "#E67E22"];

export default function Relatorios({ usuario }) {
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateFilter, setDateFilter] = useState("all");

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [emendasSnapshot, despesasSnapshot] = await Promise.all([
          getDocs(collection(db, "emendas")),
          getDocs(collection(db, "despesas")),
        ]);

        const emendasData = emendasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const despesasData = despesasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEmendas(emendasData);
        setDespesas(despesasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Funções de cálculo
  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  // Relatórios calculados
  const getOverviewData = () => {
    const totalEmendas = emendas.length;
    const valorTotalEmendas = emendas.reduce(
      (sum, e) => sum + (e.valorTotal || 0),
      0,
    );
    const valorExecutado = despesas.reduce(
      (sum, l) => sum + (l.valor || 0),
      0,
    );
    const saldoDisponivel = emendas.reduce((sum, e) => sum + (e.saldo || 0), 0);
    const percentualExecutado =
      valorTotalEmendas > 0 ? (valorExecutado / valorTotalEmendas) * 100 : 0;

    const emendasVencidas = emendas.filter((e) => {
      if (!e.validade) return false;
      return new Date(e.validade) < new Date();
    }).length;

    return {
      totalEmendas,
      valorTotalEmendas,
      valorExecutado,
      saldoDisponivel,
      percentualExecutado,
      emendasVencidas,
      totalDespesas: despesas.length,
      ticketMedio:
        despesas.length > 0 ? valorExecutado / despesas.length : 0,
    };
  };

  const getExecucaoPorAutor = () => {
    const execucaoPorAutor = {};

    emendas.forEach((emenda) => {
      const autor = emenda.autor || "Sem autor";
      if (!execucaoPorAutor[autor]) {
        execucaoPorAutor[autor] = {
          autor,
          valorTotal: 0,
          valorExecutado: 0,
          quantidadeEmendas: 0,
          quantidadeDespesas: 0,
        };
      }

      execucaoPorAutor[autor].valorTotal += emenda.valorTotal || 0;
      execucaoPorAutor[autor].quantidadeEmendas += 1;

      const despesasAutor = despesas.filter(
        (l) => l.emendaId === emenda.id,
      );
      execucaoPorAutor[autor].valorExecutado += despesasAutor.reduce(
        (sum, l) => sum + (l.valor || 0),
        0,
      );
      execucaoPorAutor[autor].quantidadeDespesas += despesasAutor.length;
    });

    return Object.values(execucaoPorAutor)
      .map((item) => ({
        ...item,
        percentualExecutado:
          item.valorTotal > 0
            ? (item.valorExecutado / item.valorTotal) * 100
            : 0,
      }))
      .sort((a, b) => b.valorExecutado - a.valorExecutado);
  };

  const getExecucaoPorTipo = () => {
    const execucaoPorTipo = {};

    emendas.forEach((emenda) => {
      const tipo = emenda.tipo || "Não definido";
      if (!execucaoPorTipo[tipo]) {
        execucaoPorTipo[tipo] = {
          tipo,
          valorTotal: 0,
          valorExecutado: 0,
          quantidade: 0,
        };
      }

      execucaoPorTipo[tipo].valorTotal += emenda.valorTotal || 0;
      execucaoPorTipo[tipo].quantidade += 1;

      const despesasTipo = despesas.filter(
        (l) => l.emendaId === emenda.id,
      );
      execucaoPorTipo[tipo].valorExecutado += despesasTipo.reduce(
        (sum, l) => sum + (l.valor || 0),
        0,
      );
    });

    return Object.values(execucaoPorTipo);
  };

  const getFornecedores = () => {
    const fornecedores = {};

    despesas.forEach((despesa) => {
      const fornecedor = despesa.notaFiscalFornecedor || "Não informado";
      if (!fornecedores[fornecedor]) {
        fornecedores[fornecedor] = {
          nome: fornecedor,
          valorTotal: 0,
          quantidadeNotas: 0,
          ultimaCompra: null,
        };
      }

      fornecedores[fornecedor].valorTotal += despesa.valor || 0;
      fornecedores[fornecedor].quantidadeNotas += 1;

      const dataDespesa = new Date(despesa.data || 0);
      if (
        !fornecedores[fornecedor].ultimaCompra ||
        dataDespesa > new Date(fornecedores[fornecedor].ultimaCompra)
      ) {
        fornecedores[fornecedor].ultimaCompra = despesa.data;
      }
    });

    return Object.values(fornecedores)
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10); // Top 10
  };

  const getEmendasProximasVencimento = () => {
    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);

    return emendas
      .filter((emenda) => {
        if (!emenda.validade || emenda.saldo <= 0) return false;
        const vencimento = new Date(emenda.validade);
        return vencimento >= hoje && vencimento <= em30Dias;
      })
      .sort((a, b) => new Date(a.validade) - new Date(b.validade));
  };

  const overview = getOverviewData();
  const execucaoPorAutor = getExecucaoPorAutor();
  const execucaoPorTipo = getExecucaoPorTipo();
  const topFornecedores = getFornecedores();
  const emendasVencimento = getEmendasProximasVencimento();

  const reportTypes = [
    { id: "overview", label: "📊 Visão Geral", icon: "📊" },
    { id: "execucao", label: "👥 Execução por Autor", icon: "👥" },
    { id: "tipos", label: "📋 Execução por Tipo", icon: "📋" },
    { id: "fornecedores", label: "🏪 Top Fornecedores", icon: "🏪" },
    { id: "vencimentos", label: "⏰ Próximos Vencimentos", icon: "⏰" },
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📈 Relatórios Gerenciais</h1>
        <div style={styles.filters}>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            style={styles.select}
          >
            {reportTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          {/* Botão de impressão do relatório atual */}
          <PrintButton
            reportId={`relatorio-${selectedReport}`}
            title={
              reportTypes.find((r) => r.id === selectedReport)?.label ||
              "Relatório"
            }
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedReport(type.id)}
            style={{
              ...styles.tab,
              ...(selectedReport === type.id ? styles.activeTab : {}),
            }}
          >
            <span style={styles.tabIcon}>{type.icon}</span>
            <span style={styles.tabLabel}>
              {type.label.replace(/^.+ /, "")}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {selectedReport === "overview" && (
          <div id="relatorio-overview" style={styles.reportSection}>
            <h2 style={styles.sectionTitle}>📊 Visão Geral do Sistema</h2>

            {/* KPIs */}
            <div style={styles.kpiGrid}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>{overview.totalEmendas}</div>
                <div style={styles.kpiLabel}>Emendas Cadastradas</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>
                  {formatCurrency(overview.valorTotalEmendas)}
                </div>
                <div style={styles.kpiLabel}>Valor Total das Emendas</div>
              </div>
              <div
                style={{ ...styles.kpiCard, borderLeft: `4px solid ${ERROR}` }}
              >
                <div style={{ ...styles.kpiValue, color: ERROR }}>
                  {formatCurrency(overview.valorExecutado)}
                </div>
                <div style={styles.kpiLabel}>Valor Executado</div>
              </div>
              <div
                style={{
                  ...styles.kpiCard,
                  borderLeft: `4px solid ${SUCCESS}`,
                }}
              >
                <div style={{ ...styles.kpiValue, color: SUCCESS }}>
                  {formatCurrency(overview.saldoDisponivel)}
                </div>
                <div style={styles.kpiLabel}>Saldo Disponível</div>
              </div>
              <div
                style={{
                  ...styles.kpiCard,
                  borderLeft: `4px solid ${WARNING}`,
                }}
              >
                <div style={{ ...styles.kpiValue, color: WARNING }}>
                  {overview.percentualExecutado.toFixed(1)}%
                </div>
                <div style={styles.kpiLabel}>Percentual Executado</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>{overview.totalDespesas}</div>
                <div style={styles.kpiLabel}>Total de Despesas</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiValue}>
                  {formatCurrency(overview.ticketMedio)}
                </div>
                <div style={styles.kpiLabel}>Ticket Médio</div>
              </div>
              <div
                style={{ ...styles.kpiCard, borderLeft: `4px solid ${ERROR}` }}
              >
                <div style={{ ...styles.kpiValue, color: ERROR }}>
                  {overview.emendasVencidas}
                </div>
                <div style={styles.kpiLabel}>Emendas Vencidas</div>
              </div>
            </div>

            {/* Gráfico de Execução por Tipo */}
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Execução por Tipo de Emenda</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={execucaoPorTipo}
                    dataKey="valorExecutado"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {execucaoPorTipo.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedReport === "execucao" && (
          <div id="relatorio-execucao" style={styles.reportSection}>
            <h2 style={styles.sectionTitle}>👥 Execução por Parlamentar</h2>

            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={execucaoPorAutor.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="autor"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `R$ ${(value / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(value),
                      name === "valorExecutado"
                        ? "Valor Executado"
                        : "Valor Total",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="valorTotal" fill={ACCENT} name="Valor Total" />
                  <Bar
                    dataKey="valorExecutado"
                    fill={ERROR}
                    name="Valor Executado"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela detalhada */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Parlamentar</th>
                    <th style={styles.th}>Emendas</th>
                    <th style={styles.th}>Valor Total</th>
                    <th style={styles.th}>Valor Executado</th>
                    <th style={styles.th}>% Executado</th>
                    <th style={styles.th}>Despesass</th>
                  </tr>
                </thead>
                <tbody>
                  {execucaoPorAutor.map((item, index) => (
                    <tr
                      key={index}
                      style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      <td style={styles.td}>{item.autor}</td>
                      <td style={styles.td}>{item.quantidadeEmendas}</td>
                      <td style={styles.tdCurrency}>
                        {formatCurrency(item.valorTotal)}
                      </td>
                      <td style={styles.tdCurrency}>
                        {formatCurrency(item.valorExecutado)}
                      </td>
                      <td style={styles.tdPercent}>
                        <span
                          style={{
                            color:
                              item.percentualExecutado >= 80
                                ? SUCCESS
                                : item.percentualExecutado >= 50
                                  ? WARNING
                                  : ERROR,
                          }}
                        >
                          {item.percentualExecutado.toFixed(1)}%
                        </span>
                      </td>
                      <td style={styles.td}>{item.quantidadeDespesas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === "tipos" && (
          <div id="relatorio-tipos" style={styles.reportSection}>
            <h2 style={styles.sectionTitle}>📋 Análise por Tipo de Emenda</h2>

            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={execucaoPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis
                    tickFormatter={(value) =>
                      `R$ ${(value / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="valorTotal" fill={ACCENT} name="Valor Total" />
                  <Bar
                    dataKey="valorExecutado"
                    fill={ERROR}
                    name="Valor Executado"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedReport === "fornecedores" && (
          <div id="relatorio-fornecedores" style={styles.reportSection}>
            <h2 style={styles.sectionTitle}>🏪 Top 10 Fornecedores</h2>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Posição</th>
                    <th style={styles.th}>Fornecedor</th>
                    <th style={styles.th}>Valor Total</th>
                    <th style={styles.th}>Qtd. Notas</th>
                    <th style={styles.th}>Última Compra</th>
                    <th style={styles.th}>Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {topFornecedores.map((fornecedor, index) => (
                    <tr
                      key={index}
                      style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      <td style={styles.tdRank}>#{index + 1}</td>
                      <td style={styles.td}>{fornecedor.nome}</td>
                      <td style={styles.tdCurrency}>
                        {formatCurrency(fornecedor.valorTotal)}
                      </td>
                      <td style={styles.td}>{fornecedor.quantidadeNotas}</td>
                      <td style={styles.td}>
                        {formatDate(fornecedor.ultimaCompra)}
                      </td>
                      <td style={styles.tdCurrency}>
                        {formatCurrency(
                          fornecedor.valorTotal / fornecedor.quantidadeNotas,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === "vencimentos" && (
          <div id="relatorio-vencimentos" style={styles.reportSection}>
            <h2 style={styles.sectionTitle}>
              ⏰ Emendas Próximas ao Vencimento (30 dias)
            </h2>

            {emendasVencimento.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>✅</div>
                <div style={styles.emptyText}>
                  Nenhuma emenda vence nos próximos 30 dias!
                </div>
              </div>
            ) : (
              <div style={styles.alertContainer}>
                {emendasVencimento.map((emenda, index) => {
                  const diasRestantes = Math.ceil(
                    (new Date(emenda.validade) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isUrgente = diasRestantes <= 7;

                  return (
                    <div
                      key={emenda.id}
                      style={{
                        ...styles.alertCard,
                        borderLeft: `4px solid ${isUrgente ? ERROR : WARNING}`,
                      }}
                    >
                      <div style={styles.alertHeader}>
                        <div>
                          <h4 style={styles.alertTitle}>
                            {isUrgente ? "🚨" : "⚠️"} Emenda {emenda.numero}
                          </h4>
                          <p style={styles.alertAutor}>Autor: {emenda.autor}</p>
                        </div>
                        <div style={styles.alertDays}>
                          <span
                            style={{
                              ...styles.daysLabel,
                              color: isUrgente ? ERROR : WARNING,
                            }}
                          >
                            {diasRestantes} dia{diasRestantes !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div style={styles.alertDetails}>
                        <div style={styles.alertDetail}>
                          <strong>Vencimento:</strong>{" "}
                          {formatDate(emenda.validade)}
                        </div>
                        <div style={styles.alertDetail}>
                          <strong>Saldo:</strong> {formatCurrency(emenda.saldo)}
                        </div>
                        <div style={styles.alertDetail}>
                          <strong>Tipo:</strong> {emenda.tipo}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: GRAY,
    padding: "20px",
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  },

  title: {
    color: PRIMARY,
    fontSize: 28,
    fontWeight: "600",
    margin: 0,
  },

  filters: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  select: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: WHITE,
    cursor: "pointer",
  },

  tabs: {
    display: "flex",
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflowX: "auto",
    gap: 2,
  },

  tab: {
    background: "none",
    border: "none",
    padding: "12px 16px",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },

  activeTab: {
    backgroundColor: PRIMARY,
    color: WHITE,
  },

  tabIcon: {
    fontSize: 16,
  },

  tabLabel: {
    fontSize: 14,
  },

  content: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },

  reportSection: {
    width: "100%",
  },

  sectionTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
    margin: 0,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 32,
  },

  kpiCard: {
    backgroundColor: GRAY,
    padding: 20,
    borderRadius: 8,
    textAlign: "center",
    borderLeft: `4px solid ${PRIMARY}`,
  },

  kpiValue: {
    fontSize: 24,
    fontWeight: "600",
    color: PRIMARY,
    marginBottom: 8,
  },

  kpiLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  chartContainer: {
    backgroundColor: GRAY,
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },

  chartTitle: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },

  tableHeader: {
    backgroundColor: PRIMARY,
  },

  th: {
    padding: "12px 8px",
    textAlign: "left",
    color: WHITE,
    fontWeight: "600",
    fontSize: 13,
  },

  evenRow: {
    backgroundColor: "#f9f9f9",
  },

  oddRow: {
    backgroundColor: WHITE,
  },

  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    color: "#333",
  },

  tdCurrency: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
  },

  tdPercent: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },

  tdRank: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    color: PRIMARY,
    fontWeight: "600",
    textAlign: "center",
  },

  alertContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  alertCard: {
    backgroundColor: GRAY,
    padding: 16,
    borderRadius: 8,
    borderLeft: `4px solid ${WARNING}`,
  },

  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  alertTitle: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "600",
    margin: 0,
    marginBottom: 4,
  },

  alertAutor: {
    color: "#666",
    fontSize: 14,
    margin: 0,
  },

  alertDays: {
    textAlign: "right",
  },

  daysLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  alertDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
  },

  alertDetail: {
    fontSize: 13,
    color: "#666",
  },

  emptyState: {
    textAlign: "center",
    padding: 60,
    color: "#666",
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "500",
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
