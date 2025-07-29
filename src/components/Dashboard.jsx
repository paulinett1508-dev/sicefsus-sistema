// Dashboard.jsx - COM FILTRO POR MUNICÍPIO PARA OPERADORES
import React, { useMemo } from "react";
import { useEmendaDespesa } from "../hooks/useEmendaDespesa";

const CHART_COLORS = {
  primary: "#3498db",
  success: "#27ae60",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#9b59b6",
  secondary: "#95a5a6",
};

export default function Dashboard({ usuario }) {
  console.log("🏠 Dashboard iniciado");
  console.log("👤 Dados do usuário carregados para Dashboard:", usuario);

  // ✅ HOOK PARA CARREGAR DADOS COM FILTRO AUTOMÁTICO
  const { emendas, despesas, loading, error, estatisticasGerais, recarregar } =
    useEmendaDespesa(usuario);

  // ✅ APLICAR FILTRO POR MUNICÍPIO PARA OPERADORES
  const dadosFiltrados = useMemo(() => {
    console.log("🔍 Aplicando filtro de município para Dashboard...");
    console.log("👤 Tipo de usuário:", usuario?.tipo);
    console.log("📍 Município do usuário:", usuario?.municipio);
    console.log("📋 Total de emendas recebidas:", emendas?.length || 0);
    console.log("💰 Total de despesas recebidas:", despesas?.length || 0);

    // ✅ ADMIN VÊ TUDO
    if (usuario?.tipo === "admin") {
      console.log("👑 Admin: Exibindo todos os dados");
      return {
        emendasFiltradas: emendas || [],
        despesasFiltradas: despesas || [],
      };
    }

    // ✅ OPERADOR/USER VÊ APENAS SEU MUNICÍPIO
    if ((usuario?.tipo === "operador" || usuario?.tipo === "user") && usuario?.municipio) {
      const emendasFiltradas = (emendas || []).filter((emenda) => {
        const municipioEmenda = emenda.municipio?.toLowerCase().trim();
        const municipioUsuario = usuario.municipio?.toLowerCase().trim();
        const match = municipioEmenda === municipioUsuario;

        if (!match) {
          console.log(
            `🚫 Emenda filtrada: ${emenda.numero} (${emenda.municipio}) != ${usuario.municipio}`,
          );
        }

        return match;
      });

      const despesasFiltradas = (despesas || []).filter((despesa) => {
        // Buscar emenda associada à despesa
        const emendaAssociada = emendas?.find((e) => e.id === despesa.emendaId);
        if (!emendaAssociada) return false;

        const municipioEmenda = emendaAssociada.municipio?.toLowerCase().trim();
        const municipioUsuario = usuario.municipio?.toLowerCase().trim();
        return municipioEmenda === municipioUsuario;
      });

      console.log(`✅ Filtro aplicado para ${usuario.municipio}:`);
      console.log(
        `   📋 Emendas: ${emendasFiltradas.length}/${emendas?.length || 0}`,
      );
      console.log(
        `   💰 Despesas: ${despesasFiltradas.length}/${despesas?.length || 0}`,
      );

      return {
        emendasFiltradas,
        despesasFiltradas,
      };
    }

    // ✅ FALLBACK: SEM DADOS SE NÃO TEM MUNICÍPIO DEFINIDO
    console.log("⚠️ Usuário sem município definido - sem dados filtrados");
    return {
      emendasFiltradas: [],
      despesasFiltradas: [],
    };
  }, [emendas, despesas, usuario]);

  // ✅ CALCULAR ESTATÍSTICAS FILTRADAS
  const estatisticasLocais = useMemo(() => {
    if (!dadosFiltrados.emendasFiltradas || !dadosFiltrados.despesasFiltradas) {
      return {
        totalEmendas: 0,
        totalDespesas: 0,
        valorTotalEmendas: 0,
        valorTotalDespesas: 0,
        saldoDisponivel: 0,
        percentualExecutado: 0,
        emendasPorStatus: {},
        despesasPorStatus: {},
        evolucaoMensal: [],
        topMunicipios: [],
      };
    }

    const totalEmendas = dadosFiltrados.emendasFiltradas.length;
    const totalDespesas = dadosFiltrados.despesasFiltradas.length;

    const valorTotalEmendas = dadosFiltrados.emendasFiltradas.reduce(
      (acc, emenda) => {
        const valor = parseFloat(emenda.valorRecurso || emenda.valor || 0);
        return acc + (isNaN(valor) ? 0 : valor);
      },
      0,
    );

    const valorTotalDespesas = dadosFiltrados.despesasFiltradas.reduce(
      (acc, despesa) => {
        const valor = parseFloat(despesa.valor || 0);
        return acc + (isNaN(valor) ? 0 : valor);
      },
      0,
    );

    const saldoDisponivel = valorTotalEmendas - valorTotalDespesas;
    const percentualExecutado =
      valorTotalEmendas > 0
        ? (valorTotalDespesas / valorTotalEmendas) * 100
        : 0;

    // Status das emendas
    const emendasPorStatus = dadosFiltrados.emendasFiltradas.reduce(
      (acc, emenda) => {
        const status = emenda.status || "ativa";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {},
    );

    // Status das despesas
    const despesasPorStatus = dadosFiltrados.despesasFiltradas.reduce(
      (acc, despesa) => {
        const status = despesa.status || "processada";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {},
    );

    // Evolução mensal
    const evolucaoMensal = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesNome = mes.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });

      const emendasMes = dadosFiltrados.emendasFiltradas.filter((emenda) => {
        if (!emenda.dataAprovacao) return false;
        const dataEmenda = new Date(emenda.dataAprovacao);
        return (
          dataEmenda.getMonth() === mes.getMonth() &&
          dataEmenda.getFullYear() === mes.getFullYear()
        );
      });

      const despesasMes = dadosFiltrados.despesasFiltradas.filter((despesa) => {
        if (!despesa.data) return false;
        const dataDespesa = new Date(despesa.data);
        return (
          dataDespesa.getMonth() === mes.getMonth() &&
          dataDespesa.getFullYear() === mes.getFullYear()
        );
      });

      const valorEmendasMes = emendasMes.reduce(
        (acc, e) => acc + parseFloat(e.valorRecurso || e.valor || 0),
        0,
      );
      const valorDespesasMes = despesasMes.reduce(
        (acc, d) => acc + parseFloat(d.valor || 0),
        0,
      );

      evolucaoMensal.push({
        mes: mesNome,
        emendas: valorEmendasMes,
        despesas: valorDespesasMes,
      });
    }

    // Top municípios (apenas para admin - operadores veem apenas seu município)
    const topMunicipios =
      usuario?.tipo === "admin"
        ? Object.entries(
            dadosFiltrados.emendasFiltradas.reduce((acc, emenda) => {
              const municipio = emenda.municipio || "Não informado";
              acc[municipio] =
                (acc[municipio] || 0) +
                parseFloat(emenda.valorRecurso || emenda.valor || 0);
              return acc;
            }, {}),
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([municipio, valor]) => ({ municipio, valor }))
        : [];

    return {
      totalEmendas,
      totalDespesas,
      valorTotalEmendas,
      valorTotalDespesas,
      saldoDisponivel,
      percentualExecutado,
      emendasPorStatus,
      despesasPorStatus,
      evolucaoMensal,
      topMunicipios,
    };
  }, [dadosFiltrados, usuario]);

  // ✅ FUNÇÃO PARA FORMATAR MOEDA
  const formatCurrency = (valor) => {
    const numericValue =
      typeof valor === "string" ? parseFloat(valor) || 0 : valor || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const formatNumber = (valor) => {
    return new Intl.NumberFormat("pt-BR").format(valor || 0);
  };

  // Debug logs
  console.log("🔍 Debug Dashboard:", {
    loading,
    emendasValidas: Array.isArray(emendas),
    emendasTipo: typeof emendas,
    emendasLength: emendas?.length || 0,
    despesasLength: despesas?.length || 0,
    emendasFiltradasLength: dadosFiltrados.emendasFiltradas?.length || 0,
    despesasFiltradasLength: dadosFiltrados.despesasFiltradas?.length || 0,
  });

  if (loading) {
    console.log("⏳ Aguardando dados:", {
      loading,
      emendasValidas: Array.isArray(emendas),
      emendasTipo: typeof emendas,
      emendasLength: emendas?.length || 0,
    });

    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3 style={styles.errorTitle}>❌ Erro ao carregar dados</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={recarregar} style={styles.retryButton}>
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  console.log("📊 Calculando estatísticas do Dashboard...");
  console.log(
    "📋 Emendas disponíveis:",
    dadosFiltrados.emendasFiltradas?.length || 0,
  );
  console.log(
    "💰 Despesas disponíveis:",
    dadosFiltrados.despesasFiltradas?.length || 0,
  );

  const stats = estatisticasLocais;
  console.log("✅ Estatísticas calculadas:", stats);

  return (
    <div style={styles.container}>
      {/* ✅ HEADER COM FILTRO ATIVO */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>📊 Dashboard SICEFSUS</h1>
          <p style={styles.subtitle}>
            Visão geral das emendas e despesas
            {(usuario?.tipo === "operador" || usuario?.tipo === "user") && usuario?.municipio && (
              <span style={styles.filterBadge}>
                📍 Filtrado para: {usuario.municipio}{usuario.uf ? `/${usuario.uf}` : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ✅ CARDS PRINCIPAIS */}
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div
            style={{
              ...styles.cardIcon,
              backgroundColor: CHART_COLORS.primary,
            }}
          >
            📋
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>
              {formatNumber(stats.totalEmendas)}
            </div>
            <div style={styles.cardLabel}>Emendas</div>
          </div>
        </div>

        <div style={styles.card}>
          <div
            style={{
              ...styles.cardIcon,
              backgroundColor: CHART_COLORS.success,
            }}
          >
            💰
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>
              {formatNumber(stats.totalDespesas)}
            </div>
            <div style={styles.cardLabel}>Despesas</div>
          </div>
        </div>

        <div style={styles.card}>
          <div
            style={{
              ...styles.cardIcon,
              backgroundColor: CHART_COLORS.warning,
            }}
          >
            💵
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>
              {formatCurrency(stats.valorTotalEmendas)}
            </div>
            <div style={styles.cardLabel}>Valor Total Emendas</div>
          </div>
        </div>

        <div style={styles.card}>
          <div
            style={{ ...styles.cardIcon, backgroundColor: CHART_COLORS.error }}
          >
            💸
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>
              {formatCurrency(stats.valorTotalDespesas)}
            </div>
            <div style={styles.cardLabel}>Valor Executado</div>
          </div>
        </div>

        <div style={styles.card}>
          <div
            style={{ ...styles.cardIcon, backgroundColor: CHART_COLORS.info }}
          >
            💳
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>
              {formatCurrency(stats.saldoDisponivel)}
            </div>
            <div style={styles.cardLabel}>Saldo Disponível</div>
          </div>
        </div>

        <div style={styles.card}>
          <div
            style={{
              ...styles.cardIcon,
              backgroundColor: CHART_COLORS.secondary,
            }}
          >
            📈
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardValue}>
              {stats.percentualExecutado.toFixed(1)}%
            </div>
            <div style={styles.cardLabel}>Percentual Executado</div>
          </div>
        </div>
      </div>

      {/* ✅ SEÇÃO DE GRÁFICOS */}
      <div style={styles.chartsGrid}>
        {/* Status das Emendas */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📋 Status das Emendas</h3>
          <div style={styles.statusList}>
            {Object.entries(stats.emendasPorStatus).map(([status, count]) => (
              <div key={status} style={styles.statusItem}>
                <span style={styles.statusLabel}>{status}</span>
                <span style={styles.statusValue}>{count}</span>
              </div>
            ))}
            {Object.keys(stats.emendasPorStatus).length === 0 && (
              <p style={styles.noData}>Nenhuma emenda encontrada</p>
            )}
          </div>
        </div>

        {/* Status das Despesas */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>💰 Status das Despesas</h3>
          <div style={styles.statusList}>
            {Object.entries(stats.despesasPorStatus).map(([status, count]) => (
              <div key={status} style={styles.statusItem}>
                <span style={styles.statusLabel}>{status}</span>
                <span style={styles.statusValue}>{count}</span>
              </div>
            ))}
            {Object.keys(stats.despesasPorStatus).length === 0 && (
              <p style={styles.noData}>Nenhuma despesa encontrada</p>
            )}
          </div>
        </div>

        {/* Evolução Mensal */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Evolução dos Últimos 6 Meses</h3>
          <div style={styles.evolutionChart}>
            {stats.evolucaoMensal.map((item, index) => (
              <div key={index} style={styles.evolutionItem}>
                <div style={styles.evolutionMonth}>{item.mes}</div>
                <div style={styles.evolutionValues}>
                  <div style={styles.evolutionEmendas}>
                    {formatCurrency(item.emendas)}
                  </div>
                  <div style={styles.evolutionDespesas}>
                    {formatCurrency(item.despesas)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Municípios (apenas para admin) */}
        {usuario?.tipo === "admin" && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🏆 Top 5 Municípios</h3>
            <div style={styles.topMunicipios}>
              {stats.topMunicipios.map((item, index) => (
                <div key={index} style={styles.municipioItem}>
                  <span style={styles.municipioPosition}>{index + 1}º</span>
                  <span style={styles.municipioName}>{item.municipio}</span>
                  <span style={styles.municipioValue}>
                    {formatCurrency(item.valor)}
                  </span>
                </div>
              ))}
              {stats.topMunicipios.length === 0 && (
                <p style={styles.noData}>Nenhum dado de município disponível</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ ESTILOS
const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },

  header: {
    marginBottom: "32px",
  },

  headerContent: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: "32px",
    fontWeight: "700",
    color: "#2c3e50",
  },

  subtitle: {
    margin: 0,
    fontSize: "16px",
    color: "#6c757d",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  filterBadge: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },

  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "white",
  },

  cardContent: {
    flex: 1,
  },

  cardValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2c3e50",
    lineHeight: 1,
    marginBottom: "4px",
  },

  cardLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500",
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },

  chartCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },

  chartTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
  },

  statusList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  statusItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },

  statusLabel: {
    fontSize: "14px",
    color: "#495057",
    fontWeight: "500",
    textTransform: "capitalize",
  },

  statusValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2c3e50",
  },

  evolutionChart: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  evolutionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },

  evolutionMonth: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6c757d",
    minWidth: "80px",
  },

  evolutionValues: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },

  evolutionEmendas: {
    fontSize: "14px",
    color: CHART_COLORS.primary,
    fontWeight: "500",
  },

  evolutionDespesas: {
    fontSize: "14px",
    color: CHART_COLORS.success,
    fontWeight: "500",
  },

  topMunicipios: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  municipioItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },

  municipioPosition: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#6c757d",
    minWidth: "30px",
  },

  municipioName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
    flex: 1,
  },

  municipioValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#2c3e50",
  },

  noData: {
    textAlign: "center",
    color: "#6c757d",
    fontStyle: "italic",
    margin: "20px 0",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "20px",
  },

  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e9ecef",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    fontSize: "16px",
    color: "#6c757d",
    margin: 0,
  },

  errorContainer: {
    textAlign: "center",
    padding: "40px",
    color: "#721c24",
  },

  errorTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px",
  },

  errorMessage: {
    fontSize: "16px",
    marginBottom: "20px",
  },

  retryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

// CSS para animação
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
