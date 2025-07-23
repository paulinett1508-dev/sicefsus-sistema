// Dashboard.jsx - CORREÇÃO CRÍTICA IMPLEMENTADA + ERROR BOUNDARY
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useEmendaDespesa from "../hooks/useEmendaDespesa";
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
  // ✅ SISTEMA DE DETECÇÃO DE ERROS
  const [dashboardError, setDashboardError] = useState(null);
  const [renderCount, setRenderCount] = useState(0);
  const [isStable, setIsStable] = useState(true);
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const mountTime = useRef(Date.now());

  // ✅ DETECÇÃO DE LOOP INFINITO
  useEffect(() => {
    renderCountRef.current += 1;
    setRenderCount(renderCountRef.current);
    
    const now = Date.now();
    const timeSinceMount = now - mountTime.current;
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Se renderizou mais de 50 vezes em menos de 5 segundos, há um problema
    if (renderCountRef.current > 50 && timeSinceMount < 5000) {
      console.error("🚨 LOOP INFINITO DETECTADO no Dashboard!");
      setDashboardError({
        tipo: "loop_infinito",
        message: "Loop infinito de renderização detectado",
        detalhes: `${renderCountRef.current} renders em ${timeSinceMount}ms`,
        solucao: "Recarregue a página ou contate o suporte"
      });
      setIsStable(false);
      return;
    }
    
    // Se renderizou muito rapidamente (< 10ms), pode ser instabilidade
    if (timeSinceLastRender < 10 && renderCountRef.current > 10) {
      console.warn("⚠️ Renderização muito frequente detectada");
      setIsStable(false);
    }
    
    lastRenderTime.current = now;
  });

  // Dashboard iniciado
  console.log("🏠 Dashboard iniciado");

  // ✅ CORREÇÃO 2: DASHBOARD.JSX - Linhas 38-65
  const [userRole, setUserRole] = useState(null);
  const [userMunicipio, setUserMunicipio] = useState(null);
  const [userUf, setUserUf] = useState(null);

  // ✅ VALIDAÇÃO E MEMOIZAÇÃO DOS DADOS DO USUÁRIO
  const usuarioValidated = useMemo(() => {
    if (!usuario) {
      setDashboardError({
        tipo: "usuario_ausente",
        message: "Dados do usuário não encontrados",
        detalhes: "O componente Dashboard foi carregado sem dados de usuário válidos",
        solucao: "Faça login novamente ou recarregue a página"
      });
      return null;
    }

    // Validações específicas
    const validacoes = [];
    
    if (!usuario.role) {
      validacoes.push("Papel/função do usuário não definido");
    }
    
    if (usuario.role !== "admin" && (!usuario.municipio || !usuario.uf)) {
      validacoes.push("Localização (município/UF) não configurada para usuário operador");
    }
    
    if (!usuario.email) {
      validacoes.push("Email do usuário não encontrado");
    }

    if (validacoes.length > 0) {
      setDashboardError({
        tipo: "dados_incompletos",
        message: "Configuração do usuário incompleta",
        detalhes: validacoes.join("; "),
        solucao: "Complete seu perfil ou contate o administrador"
      });
      return null;
    }

    return {
      uid: usuario.uid,
      email: usuario.email,
      role: usuario.role,
      municipio: usuario.municipio,
      uf: usuario.uf,
      nome: usuario.nome || usuario.displayName,
    };
  }, [usuario]);

  // ✅ Carregar dados do usuário primeiro com validação
  useEffect(() => {
    if (usuarioValidated) {
      setUserRole(usuarioValidated.role);
      setUserMunicipio(usuarioValidated.municipio);
      setUserUf(usuarioValidated.uf);

      // Limpar erro se dados estão OK
      if (dashboardError?.tipo === "usuario_ausente" || dashboardError?.tipo === "dados_incompletos") {
        setDashboardError(null);
      }
    }
  }, [usuarioValidated, dashboardError]);

  // ✅ Construir objeto usuário completo para o hook
  const usuarioParaHook = useMemo(() => {
    if (!usuarioValidated || !userRole) return null;
    
    return {
      uid: usuarioValidated.uid,
      email: usuarioValidated.email,
      role: userRole,
      municipio: userMunicipio,
      uf: userUf,
    };
  }, [usuarioValidated, userRole, userMunicipio, userUf]);

  // ✅ MEMOIZAÇÃO DAS OPÇÕES DO HOOK - SÓ RECRIAR QUANDO NECESSÁRIO
  const hookOptions = useMemo(() => ({
    carregarTodasEmendas: userRole !== null,
    incluirEstatisticas: true,
    autoRefresh: true, // ✅ Sempre true, throttle é feito no hook
    filtroMunicipio: userRole !== "admin" ? userMunicipio : null,
    filtroUf: userRole !== "admin" ? userUf : null,
    userRole: userRole,
  }), [userRole, userMunicipio, userUf]); // ✅ Removido isStable da dependência

  const {
    emendas = [], // ✅ Default para array vazio
    despesas = [], // ✅ Default para array vazio
    loading,
    error: hookError,
    metricas,
    permissoes,
  } = useEmendaDespesa(usuarioParaHook, hookOptions);

  // ✅ FUNÇÃO PARA OBTER ESTATÍSTICAS GERAIS (ESTÁVEL)
  const obterEstatisticasGerais = useCallback(() => {
    if (!emendas.length) return null;

    const totalEmendas = emendas.length;
    const totalDespesas = despesas.length;

    const valorTotalEmendas = emendas.reduce(
      (sum, e) => sum + (e.valorTotal || e.valorRecurso || 0),
      0,
    );
    const valorTotalDespesas = despesas.reduce(
      (sum, d) => sum + (d.valor || 0),
      0,
    );
    const saldoDisponivel = valorTotalEmendas - valorTotalDespesas;
    const percentualExecutado =
      valorTotalEmendas > 0
        ? (valorTotalDespesas / valorTotalEmendas) * 100
        : 0;

    // Emendas por status
    const emendasPorStatus = emendas.reduce((acc, emenda) => {
      const status = emenda.status || "ativa";
      const existing = acc.find((item) => item.name === status);
      if (existing) {
        existing.value += 1;
        existing.valor += emenda.valorTotal || emenda.valorRecurso || 0;
      } else {
        acc.push({
          name: status,
          value: 1,
          valor: emenda.valorTotal || emenda.valorRecurso || 0,
        });
      }
      return acc;
    }, []);

    // Despesas por status
    const despesasPorStatus = despesas.reduce((acc, despesa) => {
      const status = despesa.status || "pendente";
      const existing = acc.find((item) => item.name === status);
      if (existing) {
        existing.value += 1;
        existing.valor += despesa.valor || 0;
      } else {
        acc.push({
          name: status,
          value: 1,
          valor: despesa.valor || 0,
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

      evolucaoMensal.push({
        mes: mesNome,
        emendas: emendasMes.length,
        despesas: despesasMes.length,
        valorEmendas: emendasMes.reduce(
          (sum, e) => sum + (e.valorTotal || e.valorRecurso || 0),
          0,
        ),
        valorDespesas: despesasMes.reduce((sum, d) => sum + (d.valor || 0), 0),
      });
    }

    // Top municípios
    const municipiosMap = {};
    emendas.forEach((emenda) => {
      const municipio = emenda.municipio || "Não informado";
      if (!municipiosMap[municipio]) {
        municipiosMap[municipio] = { nome: municipio, emendas: 0, valor: 0 };
      }
      municipiosMap[municipio].emendas += 1;
      municipiosMap[municipio].valor +=
        emenda.valorTotal || emenda.valorRecurso || 0;
    });

    const topMunicipios = Object.values(municipiosMap)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

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

  // ✅ CONSOLIDAÇÃO DE ERROS
  const error = useMemo(() => {
    if (dashboardError) return dashboardError.message;
    if (hookError) return hookError;
    return null;
  }, [dashboardError, hookError]);

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

  // ✅ CALCULAR ESTATÍSTICAS QUANDO DADOS CARREGAREM - OTIMIZADO
  useEffect(() => {
    if (!loading && emendas && Array.isArray(emendas) && emendas.length > 0) {
      console.log("📊 Calculando estatísticas do Dashboard...");
      
      const stats = obterEstatisticasGerais() || calcularEstatisticasLocais();
      setEstatisticas(stats);
    }
  }, [emendas.length, despesas.length, loading]); // ✅ SÓ LENGTH para evitar loops

  // ✅ FUNÇÃO FALLBACK PARA CALCULAR ESTATÍSTICAS LOCALMENTE
  const calcularEstatisticasLocais = useCallback(() => {
    const totalEmendas = emendas.length;
    const totalDespesas = despesas.length;

    const valorTotalEmendas = emendas.reduce(
      (sum, e) => sum + (e.valorTotal || e.valorRecurso || 0),
      0,
    );
    const valorTotalDespesas = despesas.reduce(
      (sum, d) => sum + (d.valor || 0),
      0,
    );
    const saldoDisponivel = valorTotalEmendas - valorTotalDespesas;
    const percentualExecutado =
      valorTotalEmendas > 0
        ? (valorTotalDespesas / valorTotalEmendas) * 100
        : 0;

    // Emendas por status
    const emendasPorStatus = emendas.reduce((acc, emenda) => {
      const status = emenda.status || "ativa";
      const existing = acc.find((item) => item.name === status);
      if (existing) {
        existing.value += 1;
        existing.valor += emenda.valorTotal || emenda.valorRecurso || 0;
      } else {
        acc.push({
          name: status,
          value: 1,
          valor: emenda.valorTotal || emenda.valorRecurso || 0,
        });
      }
      return acc;
    }, []);

    // Despesas por status
    const despesasPorStatus = despesas.reduce((acc, despesa) => {
      const status = despesa.status || "pendente";
      const existing = acc.find((item) => item.name === status);
      if (existing) {
        existing.value += 1;
        existing.valor += despesa.valor || 0;
      } else {
        acc.push({
          name: status,
          value: 1,
          valor: despesa.valor || 0,
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

      evolucaoMensal.push({
        mes: mesNome,
        emendas: emendasMes.length,
        despesas: despesasMes.length,
        valorEmendas: emendasMes.reduce(
          (sum, e) => sum + (e.valorTotal || e.valorRecurso || 0),
          0,
        ),
        valorDespesas: despesasMes.reduce((sum, d) => sum + (d.valor || 0), 0),
      });
    }

    // Top municípios
    const municipiosMap = {};
    emendas.forEach((emenda) => {
      const municipio = emenda.municipio || "Não informado";
      if (!municipiosMap[municipio]) {
        municipiosMap[municipio] = { nome: municipio, emendas: 0, valor: 0 };
      }
      municipiosMap[municipio].emendas += 1;
      municipiosMap[municipio].valor +=
        emenda.valorTotal || emenda.valorRecurso || 0;
    });

    const topMunicipios = Object.values(municipiosMap)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

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

  // ✅ FORMATAÇÃO DE VALORES
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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

  // ✅ SISTEMA DE ERRO APRIMORADO
  if (dashboardError || error) {
    const errorInfo = dashboardError || {
      tipo: "erro_geral",
      message: error,
      detalhes: "Erro não especificado",
      solucao: "Recarregue a página"
    };

    return (
      <div className="dashboard-error-container">
        <div className="dashboard-error">
          <div className="error-icon">
            {errorInfo.tipo === "loop_infinito" ? "🔄" : 
             errorInfo.tipo === "usuario_ausente" ? "👤" :
             errorInfo.tipo === "dados_incompletos" ? "⚙️" : "❌"}
          </div>
          
          <h2>Oops! Algo deu errado</h2>
          <h3>{errorInfo.message}</h3>
          
          <div className="error-details">
            <p><strong>Detalhes:</strong> {errorInfo.detalhes}</p>
            <p><strong>Solução sugerida:</strong> {errorInfo.solucao}</p>
          </div>

          {errorInfo.tipo === "loop_infinito" && (
            <div className="error-warning">
              <p>⚠️ <strong>Problema técnico detectado:</strong></p>
              <p>O sistema detectou um loop infinito de renderização. Isso geralmente indica um problema de configuração ou dados instáveis.</p>
              <p><strong>Renders executados:</strong> {renderCount}</p>
            </div>
          )}
          
          <div className="error-actions">
            <button
              className="error-button primary"
              onClick={() => {
                setDashboardError(null);
                setRenderCount(0);
                renderCountRef.current = 0;
                mountTime.current = Date.now();
                setIsStable(true);
              }}
            >
              🔄 Tentar Novamente
            </button>
            
            <button
              className="error-button secondary"
              onClick={() => window.location.reload()}
            >
              📄 Recarregar Página
            </button>
            
            {errorInfo.tipo === "dados_incompletos" && (
              <button
                className="error-button info"
                onClick={() => window.location.href = "/perfil"}
              >
                ⚙️ Completar Perfil
              </button>
            )}
          </div>

          <div className="error-debug">
            <details>
              <summary>Informações técnicas (para suporte)</summary>
              <pre>{JSON.stringify({
                tipo: errorInfo.tipo,
                usuario: usuarioValidated,
                renderCount,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
              }, null, 2)}</pre>
            </details>
          </div>
        </div>
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
              {estatisticas.percentualExecutado.toFixed(1)}% executado
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
              {estatisticas.percentualExecutado.toFixed(1)}%
            </div>
            <div className="card-subtitle">
              {estatisticas.percentualExecutado > 70
                ? "✅ Boa execução"
                : estatisticas.percentualExecutado > 40
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
                {estatisticas.emendasPorStatus.map((entry, index) => (
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
            {estatisticas.topMunicipios.map((municipio, index) => (
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

      {/* ✅ ESTILOS MIGRADOS PARA VARIÁVEIS CSS */}
      <style>{`
        .dashboard {
          padding: 20px;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #154360;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-info {
          text-align: center;
          color: #6c757d;
          font-style: italic;
        }

        .dashboard-error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 40px 20px;
          background: #f8f9fa;
        }

        .dashboard-error {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          max-width: 600px;
          width: 100%;
          border: 2px solid #E74C3C;
        }

        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .dashboard-error h2 {
          color: #E74C3C;
          margin: 0 0 10px 0;
          font-size: 28px;
        }

        .dashboard-error h3 {
          color: #333;
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 500;
        }

        .error-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
          border-left: 4px solid #4A90E2;
        }

        .error-details p {
          margin: 10px 0;
          line-height: 1.5;
        }

        .error-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }

        .error-warning p {
          margin: 8px 0;
          color: #856404;
        }

        .error-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 30px 0 20px 0;
        }

        .error-button {
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s ease;
          min-width: 140px;
        }

        .error-button.primary {
          background: #154360;
          color: white;
        }

        .error-button.primary:hover {
          background: #1e5f7a;
          transform: translateY(-1px);
        }

        .error-button.secondary {
          background: #6c757d;
          color: white;
        }

        .error-button.secondary:hover {
          background: #545b62;
          transform: translateY(-1px);
        }

        .error-button.info {
          background: #4A90E2;
          color: white;
        }

        .error-button.info:hover {
          background: #357abd;
          transform: translateY(-1px);
        }

        .error-debug {
          margin-top: 30px;
          text-align: left;
        }

        .error-debug details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .error-debug summary {
          cursor: pointer;
          font-weight: 500;
          color: #6c757d;
          margin-bottom: 10px;
        }

        .error-debug pre {
          background: #2d3748;
          color: #e2e8f0;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.4;
          margin: 10px 0 0 0;
        }

        .dashboard-no-access {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 40px;
        }

        .no-access-content {
          text-align: center;
          background: white;
          padding: 60px 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          max-width: 500px;
          border: 2px solid #E74C3C;
        }

        .no-access-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .no-access-content h2 {
          color: #E74C3C;
          margin-bottom: 15px;
        }

        .no-access-details {
          margin-top: 30px;
          text-align: left;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .no-access-details h4 {
          margin-bottom: 10px;
          color: #154360;
        }

        .no-access-details ul {
          margin: 0;
          padding-left: 20px;
        }

        .permissions-banner {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .banner-icon {
          font-size: 1.2em;
        }

        .banner-text {
          color: #856404;
          font-weight: 500;
        }

        .dashboard-header {
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-content h1 {
          margin: 0;
          color: #154360;
          font-size: 1.8em;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .user-name {
          font-weight: 600;
          color: #154360;
        }

        .user-role {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 500;
          color: white;
        }

        .user-role.admin {
          background: #E74C3C;
        }

        .user-role.user {
          background: #27AE60;
        }

        .user-location {
          background: #4A90E2;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 500;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .summary-card.active {
          border-color: #4A90E2;
          box-shadow: 0 4px 20px rgba(74, 144, 226, 0.3);
        }

        .summary-card .card-icon {
          font-size: 2.5em;
          margin-bottom: 15px;
        }

        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #6c757d;
          font-size: 1em;
          font-weight: 500;
        }

        .card-value {
          font-size: 2em;
          font-weight: 700;
          color: #154360;
          margin-bottom: 5px;
        }

        .card-subtitle {
          color: #6c757d;
          font-size: 0.9em;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .chart-container.full-width {
          grid-column: 1 / -1;
        }

        .chart-container h3 {
          margin: 0 0 20px 0;
          color: #154360;
          font-size: 1.2em;
        }

        .top-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .top-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #4A90E2;
        }

        .top-rank {
          font-size: 1.5em;
          font-weight: 700;
          color: #4A90E2;
          min-width: 40px;
        }

        .top-info {
          flex: 1;
        }

        .top-name {
          font-weight: 600;
          color: #154360;
          margin-bottom: 4px;
        }

        .top-details {
          color: #6c757d;
          font-size: 0.9em;
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 10px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .user-info {
            justify-content: flex-start;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .chart-container {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}