// Dashboard.jsx - CORREÇÃO CRÍTICA IMPLEMENTADA
import React, { useEffect, useState, useCallback, useMemo } from "react";
import useEmendaDespesa from "../hooks/useEmendaDespesa";
import "../styles/dashboard.css";
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

const CHART_COLORS = [
  "#154360", // var(--primary)
  "#4A90E2", // var(--accent)
  "#27AE60", // var(--success)
  "#F39C12", // var(--warning)
  "#E74C3C", // var(--error)
  "#9013FE", // var(--purple)
];

export default function Dashboard({ usuario }) {
  console.log("🏠 Dashboard iniciado");
  console.log("👤 Dados do usuário carregados para Dashboard:", usuario);

  useEffect(() => {
    console.log("🏠 Dashboard iniciado");
    console.log("👤 Dados do usuário carregados para Dashboard:", usuario);
  }, [usuario?.uid]); // Só re-executar quando o usuário mudar

  // ✅ CORREÇÃO: Hook corrigido com usuário completo
  const {
    emendas = [], // ✅ Default para array vazio
    despesas = [], // ✅ Default para array vazio
    loading,
    error,
    metricas,
    permissoes,
    obterEstatisticasGerais,
  } = useEmendaDespesa(usuario, {
    carregarTodasEmendas: true,
    incluirEstatisticas: true,
    autoRefresh: true,
    filtroMunicipio: usuario?.municipio,
    filtroUf: usuario?.uf,
    userRole: usuario?.role,
  });

  const [activeCard, setActiveCard] = useState(null);
  const [estatisticas, setEstatisticas] = useState({
    totalEmendas: 0,
    totalDespesas: 0,
    valorTotalEmendas: 0,
    valorTotalDespesas: 0,
    saldoDisponivel: 0,
    percentualExecutado: 0,
    emendasPorStatus: [],
    despesasPorStatus: [],
    evolucaoMensal: [],
    topMunicipios: [],
  });

  // ✅ FUNÇÃO PARA CALCULAR ESTATÍSTICAS LOCAIS (MOVIDA PARA ANTES DO useEffect)
  const calcularEstatisticasLocais = useCallback(() => {
    const totalEmendas = emendas.length;
    const totalDespesas = despesas.length;

    // ✅ CORREÇÃO CRÍTICA: Garantir valores numéricos válidos
    const valorTotalEmendas = emendas.reduce((sum, e) => {
      // Tentar múltiplos campos de valor
      let valor = e.valorRecurso || e.valorTotal || e.valor || 0;

      // Se for string, remover formatação monetária
      if (typeof valor === 'string') {
        valor = valor.replace(/[R$\s.,]/g, '').replace(',', '.');
      }

      valor = parseFloat(valor);
      return sum + (isNaN(valor) || valor < 0 ? 0 : valor);
    }, 0);

    const valorTotalDespesas = despesas.reduce((sum, d) => {
      let valor = d.valor || 0;

      // Se for string, remover formatação monetária
      if (typeof valor === 'string') {
        valor = valor.replace(/[R$\s.,]/g, '').replace(',', '.');
      }

      valor = parseFloat(valor);
      return sum + (isNaN(valor) || valor < 0 ? 0 : valor);
    }, 0);

    // ✅ CORREÇÃO: Cálculo seguro do saldo
    const saldoDisponivel = Math.max(0, valorTotalEmendas - valorTotalDespesas);

    // ✅ CORREÇÃO: Verificação de divisão por zero
    const percentualExecutado =
      valorTotalEmendas > 0
        ? Math.min(100, (valorTotalDespesas / valorTotalEmendas) * 100)
        : 0;

    // Emendas por status
    const emendasPorStatus = emendas.reduce((acc, emenda) => {
      const status = emenda.status || "ativa";
      const existing = acc.find((item) => item.name === status);

      // Processar valor de forma segura
      let valor = emenda.valorRecurso || emenda.valorTotal || emenda.valor || 0;
      if (typeof valor === 'string') {
        valor = valor.replace(/[R$\s.,]/g, '').replace(',', '.');
      }
      valor = parseFloat(valor);
      const valorSeguro = isNaN(valor) || valor < 0 ? 0 : valor;

      if (existing) {
        existing.value += 1;
        existing.valor += valorSeguro;
      } else {
        acc.push({
          name: status,
          value: 1,
          valor: valorSeguro,
        });
      }
      return acc;
    }, []);

    // Despesas por status
    const despesasPorStatus = despesas.reduce((acc, despesa) => {
      const status = despesa.status || "pendente";
      const existing = acc.find((item) => item.name === status);

      // Processar valor de forma segura
      let valor = despesa.valor || 0;
      if (typeof valor === 'string') {
        valor = valor.replace(/[R$\s.,]/g, '').replace(',', '.');
      }
      valor = parseFloat(valor);
      const valorSeguro = isNaN(valor) || valor < 0 ? 0 : valor;

      if (existing) {
        existing.value += 1;
        existing.valor += valorSeguro;
      } else {
        acc.push({
          name: status,
          value: 1,
          valor: valorSeguro,
        });
      }
      return acc;
    }, []);

    // Evolução mensal (últimos 6 meses)
    const evolucaoMensal = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesNome = mes.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });

      const emendasMes = emendas.filter((e) => {
        const dataEmenda =
          e.dataCriacao?.toDate() ||
          e.createdAt?.toDate() ||
          new Date(e.data || Date.now());
        return (
          dataEmenda.getMonth() === mes.getMonth() &&
          dataEmenda.getFullYear() === mes.getFullYear()
        );
      });

      const despesasMes = despesas.filter((d) => {
        const dataDespesa = d.data?.toDate() || new Date(d.data || Date.now());
        return (
          dataDespesa.getMonth() === mes.getMonth() &&
          dataDespesa.getFullYear() === mes.getFullYear()
        );
      });

      // ✅ CORREÇÃO: Valores seguros para evolução mensal
      const valorEmendasMes = emendasMes.reduce((sum, e) => {
        let valor = e.valorRecurso || e.valorTotal || e.valor || 0;
        if (typeof valor === 'string') {
          valor = valor.replace(/[R$\s.,]/g, '').replace(',', '.');
        }
        valor = parseFloat(valor);
        return sum + (isNaN(valor) || valor < 0 ? 0 : valor);
      }, 0);

      const valorDespesasMes = despesasMes.reduce((sum, d) => {
        let valor = d.valor || 0;
        if (typeof valor === 'string') {
          valor = valor.replace(/[R$\s.,]/g, '').replace(',', '.');
        }
        valor = parseFloat(valor);
        return sum + (isNaN(valor) || valor < 0 ? 0 : valor);
      }, 0);

      evolucaoMensal.push({
        mes: mesNome,
        emendas: emendasMes.length,
        despesas: despesasMes.length,
        valorEmendas: valorEmendasMes,
        valorDespesas: valorDespesasMes,
      });
    }

    // Top municípios
    const municipiosMap = {};
    emendas.forEach((emenda) => {
      const municipio = emenda.municipio || "Não informado";

      let valor = emenda.valorRecurso || emenda.valorTotal || emenda.valor || 0;
      if (typeof valor === 'string') {
        valor = valor.replace(/[R$\s.,]/g, '').replace(',', '.');
      }
      valor = parseFloat(valor);
      const valorSeguro = isNaN(valor) || valor < 0 ? 0 : valor;

      if (!municipiosMap[municipio]) {
        municipiosMap[municipio] = { nome: municipio, emendas: 0, valor: 0 };
      }
      municipiosMap[municipio].emendas += 1;
      municipiosMap[municipio].valor += valorSeguro;
    });

    const topMunicipios = Object.values(municipiosMap)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    // ✅ LOG PARA VERIFICAÇÃO
    console.log("📊 Estatísticas calculadas com segurança:", {
      totalEmendas,
      totalDespesas,
      valorTotalEmendas,
      valorTotalDespesas,
      saldoDisponivel,
      percentualExecutado: percentualExecutado.toFixed(2) + "%",
    });

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
  }, [emendas, despesas]);

  // ✅ CALCULAR ESTATÍSTICAS QUANDO DADOS CARREGAREM - COM VERIFICAÇÃO DE SEGURANÇA
  useEffect(() => {
    // ✅ CORREÇÃO: Verificação segura de arrays antes de usar .length
    if (!loading && emendas && Array.isArray(emendas) && emendas.length > 0) {
      console.log("📊 Calculando estatísticas do Dashboard...");
      console.log("📋 Emendas disponíveis:", emendas.length);
      console.log("💰 Despesas disponíveis:", despesas?.length || 0);

      // ✅ CORREÇÃO: Verificar se as estatísticas do hook têm as propriedades corretas
      let stats;
      if (obterEstatisticasGerais && metricas) {
        const hookStats = obterEstatisticasGerais();
        // Mapear as propriedades do hook para o formato esperado pelo Dashboard
        stats = {
          totalEmendas: hookStats.totalEmendas || 0,
          totalDespesas: hookStats.totalDespesas || 0,
          valorTotalEmendas: hookStats.valorTotalGeral || hookStats.valorTotalEmendas || 0,
          valorTotalDespesas: hookStats.valorExecutadoGeral || hookStats.valorTotalDespesas || 0,
          saldoDisponivel: hookStats.saldoDisponivelGeral || hookStats.saldoDisponivel || 0,
          percentualExecutado: hookStats.percentualGeralExecutado || hookStats.percentualExecutado || 0,
          emendasPorStatus: hookStats.emendasPorStatus || [],
          despesasPorStatus: hookStats.despesasPorStatus || [],
          evolucaoMensal: hookStats.evolucaoMensal || [],
          topMunicipios: hookStats.topMunicipios || [],
        };
      } else {
        stats = calcularEstatisticasLocais();
      }

      setEstatisticas(stats);
      console.log("✅ Estatísticas calculadas:", stats);
    } else {
      console.log("⏳ Aguardando dados:", {
        loading,
        emendasValidas: emendas && Array.isArray(emendas) && emendas.length > 0,
        emendasTipo: typeof emendas,
        emendasLength: emendas?.length,
      });
    }
  }, [emendas, despesas, loading, obterEstatisticasGerais, metricas, calcularEstatisticasLocais]);



  // ✅ FORMATAÇÃO DE VALORES
  const formatCurrency = (value) => {
    // Garantir que o valor é numérico e válido
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      return "R$ 0,00";
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados do dashboard...</p>
        {permissoes && permissoes.aviso && (
          <div className="loading-info">
            <p>{permissoes.aviso}</p>
          </div>
        )}
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className="dashboard-error">
        <h3>❌ Erro ao carregar dashboard</h3>
        <p>{error}</p>
        <button
          className="error-button"
          onClick={() => window.location.reload()}
        >
          🔄 Recarregar
        </button>
      </div>
    );
  }

  // ✅ NOVO: VERIFICAÇÃO DE ACESSO NEGADO
  if (permissoes && permissoes.semAcesso) {
    return (
      <div className="dashboard-no-access">
        <div className="no-access-content">
          <div className="no-access-icon">🚫</div>
          <h2>Acesso Restrito</h2>
          <p>{permissoes.aviso}</p>
          <p>
            Entre em contato com o administrador para completar seu cadastro.
          </p>
          <div className="no-access-details">
            <h4>Informações necessárias:</h4>
            <ul>
              <li>✅ Município de atuação</li>
              <li>✅ UF (Estado) válido</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* ✅ BANNER DE PERMISSÕES (se aplicável) */}
      {permissoes && permissoes.aviso && (
        <div className="permissions-banner">
          <div className="banner-content">
            <span className="banner-icon">ℹ️</span>
            <span className="banner-text">{permissoes.aviso}</span>
          </div>
        </div>
      )}

      {/* ✅ HEADER COM INFORMAÇÕES DO USUÁRIO */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Dashboard - Emendas Parlamentares</h1>
          <div className="user-info">
            <span className="user-name">
              👤 {usuario?.nome || usuario?.displayName || "Usuário"}
            </span>
            <span
              className={`user-role ${usuario?.role === "admin" ? "admin" : "user"}`}
            >
              {usuario?.role === "admin" ? "👑 Administrador" : "👤 Operador"}
            </span>
            {usuario?.role !== "admin" && usuario?.municipio && usuario?.uf && (
              <span className="user-location">
                📍 {usuario.municipio}/{usuario.uf.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ✅ CARDS DE RESUMO */}
      <div className="summary-cards">
        <div
          className={`summary-card ${activeCard === "emendas" ? "active" : ""}`}
          onClick={() =>
            setActiveCard(activeCard === "emendas" ? null : "emendas")
          }
        >
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>Total de Emendas</h3>
            <div className="card-value">
              {formatNumber(estatisticas.totalEmendas)}
            </div>
            <div className="card-subtitle">
              {formatCurrency(estatisticas.valorTotalEmendas)} em recursos
            </div>
          </div>
        </div>

        <div
          className={`summary-card ${activeCard === "despesas" ? "active" : ""}`}
          onClick={() =>
            setActiveCard(activeCard === "despesas" ? null : "despesas")
          }
        >
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total de Despesas</h3>
            <div className="card-value">
              {formatNumber(estatisticas.totalDespesas)}
            </div>
            <div className="card-subtitle">
              {formatCurrency(estatisticas.valorTotalDespesas)} executados
            </div>
          </div>
        </div>

        <div
          className={`summary-card ${activeCard === "saldo" ? "active" : ""}`}
          onClick={() => setActiveCard(activeCard === "saldo" ? null : "saldo")}
        >
          <div className="card-icon">💳</div>
          <div className="card-content">
            <h3>Saldo Disponível</h3>
            <div className="card-value">
              {formatCurrency(estatisticas.saldoDisponivel)}
            </div>
            <div className="card-subtitle">
              {(estatisticas.percentualExecutado ?? 0).toFixed(1)}% executado
            </div>
          </div>
        </div>

        <div
          className={`summary-card ${activeCard === "execucao" ? "active" : ""}`}
          onClick={() =>
            setActiveCard(activeCard === "execucao" ? null : "execucao")
          }
        >
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Taxa de Execução</h3>
            <div className="card-value">
              {(estatisticas.percentualExecutado ?? 0).toFixed(1)}%
            </div>
            <div className="card-subtitle">
              {(estatisticas.percentualExecutado ?? 0) > 70
                ? "✅ Boa execução"
                : (estatisticas.percentualExecutado ?? 0) > 40
                  ? "⚠️ Execução moderada"
                  : "🔴 Baixa execução"}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ GRÁFICOS */}
      <div className="charts-grid">
        {/* Gráfico de Emendas por Status */}
        <div className="chart-container">
          <h3>📊 Emendas por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estatisticas.emendasPorStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(estatisticas.emendasPorStatus || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Despesas por Status */}
        <div className="chart-container">
          <h3>💰 Despesas por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={estatisticas.despesasPorStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [formatNumber(value), "Quantidade"]}
              />
              <Bar dataKey="value" fill="#4A90E2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolução Mensal */}
        <div className="chart-container full-width">
          <h3>📈 Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={estatisticas.evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="emendas"
                stroke="#154360"
                strokeWidth={2}
                name="Emendas"
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#27AE60"
                strokeWidth={2}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Municípios */}
        <div className="chart-container">
          <h3>🏆 Top Municípios</h3>
          <div className="top-list">
            {(estatisticas.topMunicipios || []).map((municipio, index) => (
              <div key={municipio.nome} className="top-item">
                <div className="top-rank">#{index + 1}</div>
                <div className="top-info">
                  <div className="top-name">{municipio.nome}</div>
                  <div className="top-details">
                    {municipio.emendas} emendas •{" "}
                    {formatCurrency(municipio.valor)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}