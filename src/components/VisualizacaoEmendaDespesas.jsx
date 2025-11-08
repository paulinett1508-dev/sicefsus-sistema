import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
// ==================================
// === 🎯 INÍCIO DA MODIFICAÇÃO 1 ===
// ==================================
// Importar os estilos centralizados
import { despesaCardStyles } from "../despesa/DespesaCard/despesaCardStyles";
import DespesasList from "../DespesasList";
// ==================================
// === 🎯 FIM DA MODIFICAÇÃO 1 ===
// ==================================

const VisualizacaoEmendaDespesas = ({
  emendaId,
  onVoltar,
  onEditarEmenda,
  usuario,
}) => {
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [mostrarFormDespesa, setMostrarFormDespesa] = useState(false);
  const [despesaParaEditar, setDespesaParaEditar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Dados simulados para demonstração
  const [emenda] = useState({
    id: emendaId || "demo-emenda-1",
    numero: "E2025001",
    parlamentar: "João Silva",
    emenda: "EMD-30460003",
    tipo: "Individual",
    municipio: "São Paulo",
    uf: "SP",
    cnpj: "12.009.188/0001-18",
    objetoProposta: "CUSTEIO DA ATENÇÃO PRIMÁRIA À SAÚDE",
    funcional: "103015119266900021",
    valorTotal: 200000,
    validade: "2025-12-31",
  });

  const [despesasEmenda] = useState([
    {
      id: "1",
      numero: "L2025001",
      descricao: "Aquisição de medicamentos",
      valor: 45000,
      data: "2025-01-15",
      emendaId: emendaId || "demo-emenda-1",
      naturezaDespesa: "MATERIAL DE CONSUMO",
      numeroEmpenho: "2025NE000123",
    },
    {
      id: "2",
      numero: "L2025002",
      descricao: "Equipamentos médicos",
      valor: 35000,
      data: "2025-02-10",
      emendaId: emendaId || "demo-emenda-1",
      naturezaDespesa: "MATERIAL PERMANENTE",
      numeroEmpenho: "2025NE000124",
    },
    {
      id: "3",
      numero: "L2025003",
      descricao: "Serviços especializados",
      valor: 25000,
      data: "2025-03-05",
      emendaId: emendaId || "demo-emenda-1",
      naturezaDespesa: "SERVIÇOS TERCEIRIZADOS",
      numeroEmpenho: "2025NE000125",
    },
  ]);

  const [metricas] = useState({
    valorTotal: 200000,
    valorExecutado: 105000,
    saldoDisponivel: 95000,
    percentualExecutado: 52.5,
    totalDespesas: 3,
    despesasPendentes: 1,
    despesasAprovadas: 2,
    despesasPagas: 2,
    despesasRejeitadas: 0,
  });

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Cores para gráficos
  const COLORS = ["#4A90E2", "#27AE60", "#F5A623", "#D0021B", "#9013FE"];
  const PRIMARY = "#154360";
  const ACCENT = "#4A90E2";
  const SUCCESS = "#27AE60";
  const WARNING = "#F39C12";
  const ERROR = "#E74C3C";

  // ✅ Formatação de moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ Formatação de data
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // ✅ Determinar status da emenda
  const getStatusEmenda = () => {
    if (!emenda) return { text: "Carregando...", color: "#6c757d" };

    const validade = emenda.validade || emenda.dataValidada;
    const saldo = metricas.saldoDisponivel || 0;

    if (validade && new Date(validade) < new Date()) {
      return { text: "Vencida", color: ERROR, icon: "🚨" };
    } else if (saldo <= 0) {
      return { text: "Esgotada", color: WARNING, icon: "⚠️" };
    } else if (saldo < (metricas.valorTotal || 0) * 0.1) {
      return { text: "Saldo Baixo", color: "#fd7e14", icon: "⚡" };
    } else {
      return { text: "Ativa", color: SUCCESS, icon: "✅" };
    }
  };

  // ✅ Dados para gráfico de execução
  const dadosExecucao = emenda
    ? [
        {
          name: "Executado",
          value: metricas.valorExecutado || 0,
          color: SUCCESS,
        },
        {
          name: "Disponível",
          value: metricas.saldoDisponivel || 0,
          color: ACCENT,
        },
      ]
    : [];

  // ✅ Dados para gráfico de despesas por mês
  const despesasPorMes = despesasEmenda.reduce((acc, despesa) => {
    if (!despesa.data) return acc;
    const mes = new Date(despesa.data).toLocaleString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
    acc[mes] = (acc[mes] || 0) + (despesa.valor || 0);
    return acc;
  }, {});

  const dadosLinha = Object.entries(despesasPorMes).map(([mes, valor]) => ({
    mes,
    valor,
  }));

  // ✅ Handlers simplificados
  const handleNovaDespesa = () => {
    setDespesaParaEditar(null);
    setMostrarFormDespesa(true);
    setAbaAtiva("nova-despesa");
  };

  const handleEditarDespesa = (despesa) => {
    setDespesaParaEditar(despesa);
    setMostrarFormDespesa(true);
    setAbaAtiva("nova-despesa");
  };

  const handleSalvarDespesa = async () => {
    setMostrarFormDespesa(false);
    setDespesaParaEditar(null);
    // Aqui você integraria com seu sistema de salvamento
    console.log("Salvando despesa...");
    setAbaAtiva("despesas");
  };

  const handleCancelarDespesa = () => {
    setMostrarFormDespesa(false);
    setDespesaParaEditar(null);
    setAbaAtiva("despesas");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Carregando dados da emenda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>❌</div>
        <h3 style={styles.errorTitle}>Erro ao carregar emenda</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={() => setError(null)} style={styles.retryButton}>
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  if (!emenda) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>🔍</div>
        <h3 style={styles.errorTitle}>Emenda não encontrada</h3>
        <p style={styles.errorMessage}>
          A emenda solicitada não foi encontrada.
        </p>
        <button onClick={onVoltar} style={styles.retryButton}>
          ← Voltar
        </button>
      </div>
    );
  }

  const status = getStatusEmenda();

  return (
    <div style={styles.container}>
      {/* ✅ Header da Emenda */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerInfo}>
            <h1 style={styles.headerTitle}>
              {emenda.numero} - {emenda.parlamentar}
            </h1>
            <p style={styles.headerSubtitle}>
              {emenda.objetoProposta || "Sem descrição"}
            </p>
            <div style={styles.headerMeta}>
              <span style={styles.metaItem}>
                📍 {emenda.municipio}, {emenda.uf}
              </span>
              <span style={styles.metaItem}>
                📅 Validade:{" "}
                {formatDate(emenda.validade || emenda.dataValidada)}
              </span>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: status.color,
                }}
              >
                {status.icon} {status.text}
              </span>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button onClick={onVoltar} style={styles.btnSecondary}>
              ← Voltar
            </button>
            <button
              onClick={() => onEditarEmenda(emenda)}
              style={styles.btnPrimary}
            >
              ✏️ Editar Emenda
            </button>
          </div>
        </div>
      </div>

      {/* ✅ KPIs Financeiros */}
      <div style={styles.kpiSection}>
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>💰</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>
                {formatCurrency(metricas.valorTotal)}
              </div>
              <div style={styles.kpiLabel}>Valor Total</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>📊</div>
            <div style={styles.kpiContent}>
              <div style={{ ...styles.kpiValue, color: SUCCESS }}>
                {formatCurrency(metricas.valorExecutado)}
              </div>
              <div style={styles.kpiLabel}>Executado</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>💳</div>
            <div style={styles.kpiContent}>
              <div
                style={{
                  ...styles.kpiValue,
                  color: metricas.saldoDisponivel > 0 ? SUCCESS : ERROR,
                }}
              >
                {formatCurrency(metricas.saldoDisponivel)}
              </div>
              <div style={styles.kpiLabel}>Saldo Disponível</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>📈</div>
            <div style={styles.kpiContent}>
              <div style={{ ...styles.kpiValue, color: PRIMARY }}>
                {metricas.percentualExecutado?.toFixed(1)}%
              </div>
              <div style={styles.kpiLabel}>% Executado</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>💸</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>{metricas.totalDespesas}</div>
              <div style={styles.kpiLabel}>Despesas</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Navegação por Abas */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabsHeader}>
          <button
            style={{
              ...styles.tab,
              ...(abaAtiva === "visao-geral" ? styles.tabActive : {}),
            }}
            onClick={() => setAbaAtiva("visao-geral")}
          >
            📊 Visão Geral
          </button>
          <button
            style={{
              ...styles.tab,
              ...(abaAtiva === "despesas" ? styles.tabActive : {}),
            }}
            onClick={() => setAbaAtiva("despesas")}
          >
            💸 Despesas ({metricas.totalDespesas})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(abaAtiva === "nova-despesa" ? styles.tabActive : {}),
            }}
            onClick={handleNovaDespesa}
          >
            ➕ Nova Despesa
          </button>
        </div>

        <div style={styles.tabContent}>
          {/* ✅ ABA: Visão Geral */}
          {abaAtiva === "visao-geral" && (
            <div style={styles.visaoGeralContainer}>
              {/* Gráficos */}
              <div style={styles.chartsGrid}>
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>📊 Distribuição de Execução</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={dadosExecucao}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosExecucao.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>
                    📈 Despesas ao Longo do Tempo
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dadosLinha}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Line
                        type="monotone"
                        dataKey="valor"
                        stroke={ACCENT}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detalhes da Emenda */}
              <div style={styles.detalhesGrid}>
                <div style={styles.detalheCard}>
                  <h4 style={styles.detalheTitle}>📋 Informações Gerais</h4>
                  <div style={styles.detalheContent}>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>Número:</span>
                      <span style={styles.detalheValue}>{emenda.numero}</span>
                    </div>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>Emenda:</span>
                      <span style={styles.detalheValue}>{emenda.emenda}</span>
                    </div>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>Tipo:</span>
                      <span style={styles.detalheValue}>{emenda.tipo}</span>
                    </div>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>Funcional:</span>
                      <span style={styles.detalheValue}>
                        {emenda.funcional}
                      </span>
                    </div>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>CNPJ:</span>
                      <span style={styles.detalheValue}>{emenda.cnpj}</span>
                    </div>
                  </div>
                </div>

                <div style={styles.detalheCard}>
                  <h4 style={styles.detalheTitle}>📊 Estatísticas</h4>
                  <div style={styles.detalheContent}>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>
                        Total de Despesas:
                      </span>
                      <span style={styles.detalheValue}>
                        {metricas.totalDespesas}
                      </span>
                    </div>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>
                        Média por Despesa:
                      </span>
                      <span style={styles.detalheValue}>
                        {formatCurrency(
                          metricas.totalDespesas > 0
                            ? metricas.valorExecutado / metricas.totalDespesas
                            : 0,
                        )}
                      </span>
                    </div>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>Pendentes:</span>
                      <span style={styles.detalheValue}>
                        {metricas.despesasPendentes}
                      </span>
                    </div>
                    <div style={styles.detalheRow}>
                      <span style={styles.detalheLabel}>Aprovadas:</span>
                      <span style={styles.detalheValue}>
                        {metricas.despesasAprovadas}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div style={styles.acoesRapidas}>
                <h4 style={styles.acoesTitle}>⚡ Ações Rápidas</h4>
                <div style={styles.acoesGrid}>
                  <button onClick={handleNovaDespesa} style={styles.acaoButton}>
                    ➕ Nova Despesa
                  </button>
                  <button
                    onClick={() => setAbaAtiva("despesas")}
                    style={styles.acaoButton}
                  >
                    📋 Ver Todas as Despesas
                  </button>
                  <button
                    onClick={() => onEditarEmenda(emenda)}
                    style={styles.acaoButton}
                  >
                    ✏️ Editar Emenda
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ ABA: Lista de Despesas */}
          {abaAtiva === "despesas" && (
            <div style={styles.despesasContainer}>
              <div style={styles.despesasHeader}>
                <h3 style={styles.despesasTitle}>
                  💸 Despesas da Emenda ({metricas.totalDespesas})
                </h3>
                <button onClick={handleNovaDespesa} style={styles.btnSuccess}>
                  ➕ Nova Despesa
                </button>
              </div>

              {despesasEmenda.length === 0 ? (
                <div style={styles.emptyDespesas}>
                  <div style={styles.emptyIcon}>📋</div>
                  <p style={styles.emptyText}>
                    Nenhuma despesa cadastrada para esta emenda.
                  </p>
                  <button onClick={handleNovaDespesa} style={styles.btnSuccess}>
                    ➕ Cadastrar primeira despesa
                  </button>
                </div>
              ) : (
                <>
                  {/* DESPESAS PLANEJADAS */}
                  <div style={despesaCardStyles.despesasSection}>
                    <h3 style={despesaCardStyles.despesasSectionTitle}>
                      🟡 Despesas Planejadas (2)
                    </h3>
                    <div style={despesaCardStyles.despesasCardsGrid}>
                      <div
                        style={{
                          ...despesaCardStyles.despesaCard,
                          backgroundColor: "#fffbeb",
                          borderColor: "#fde68a",
                        }}
                      >
                        <div style={despesaCardStyles.despesaCardHeader}>
                          <span style={despesaCardStyles.despesaNumero}>
                            #1
                          </span>
                          <span
                            style={despesaCardStyles.despesaStatusPlanejada}
                          >
                            🟡 <strong>PLANEJADA</strong>
                          </span>
                        </div>
                        <div style={despesaCardStyles.despesaDescricao}>
                          Equipamentos hospitalares
                        </div>
                        <div style={despesaCardStyles.despesaValor}>
                          <strong>R$ 2.500,00</strong>
                        </div>
                      </div>

                      <div
                        style={{
                          ...despesaCardStyles.despesaCard,
                          backgroundColor: "#fffbeb",
                          borderColor: "#fde68a",
                        }}
                      >
                        <div style={despesaCardStyles.despesaCardHeader}>
                          <span style={despesaCardStyles.despesaNumero}>
                            #2
                          </span>
                          <span
                            style={despesaCardStyles.despesaStatusPlanejada}
                          >
                            🟡 <strong>PLANEJADA</strong>
                          </span>
                        </div>
                        <div style={despesaCardStyles.despesaDescricao}>
                          Medicamentos e suplementos
                        </div>
                        <div style={despesaCardStyles.despesaValor}>
                          <strong>R$ 2.500,00</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DESPESAS EXECUTADAS - Usando DespesasList */}
                  <div style={despesaCardStyles.despesasSection}>
                    <h3 style={despesaCardStyles.despesasSectionTitle}>
                      🟢 Despesas Executadas ({despesasEmenda.length})
                    </h3>
                    <DespesasList
                      despesas={despesasEmenda}
                      emendas={[]}
                      loading={false}
                      error={null}
                      onEdit={handleEditarDespesa}
                      onView={handleEditarDespesa}
                      onDelete={(id) => console.log("Deletar despesa:", id)}
                      usuario={usuario}
                      usarLayoutCards={true}
                      ocultarBotoesAgrupamento={true}
                      estilosCustomizados={{
                        despesaCardExecutada: {
                          ...despesaCardStyles.despesaCard,
                          backgroundColor: "#f0fdf4",
                          borderColor: "#bbf7d0",
                        },
                        despesaStatusExecutada: despesaCardStyles.despesaStatusExecutada,
                        despesaContent: despesaCardStyles.despesaContent,
                        despesaTopLine: despesaCardStyles.despesaTopLine,
                        despesaNumero: despesaCardStyles.despesaNumero,
                        despesaDescricao: despesaCardStyles.despesaDescricao,
                        despesaValor: despesaCardStyles.despesaValor,
                        despesaInfoLine: despesaCardStyles.despesaInfoLine,
                        despesaInfo: despesaCardStyles.despesaInfo,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ✅ ABA: Nova Despesa */}
          {abaAtiva === "nova-despesa" && (
            <div style={styles.formContainer}>
              <div style={styles.formHeader}>
                <h3 style={styles.formTitle}>
                  {despesaParaEditar ? "✏️ Editar Despesa" : "➕ Nova Despesa"}
                </h3>
                <div style={styles.formActions}>
                  <button
                    onClick={handleCancelarDespesa}
                    style={styles.btnSecondary}
                  >
                    ✖️ Cancelar
                  </button>
                  <button
                    onClick={handleSalvarDespesa}
                    style={styles.btnSuccess}
                  >
                    💾 Salvar Despesa
                  </button>
                </div>
              </div>

              <div style={styles.formContent}>
                {/* Saldo Disponível */}
                <div style={styles.saldoInfo}>
                  <span style={styles.saldoLabel}>Saldo Disponível:</span>
                  <span style={styles.saldoValue}>
                    {formatCurrency(metricas.saldoDisponivel)}
                  </span>
                </div>

                {/* Campos do formulário */}
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Descrição *</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      placeholder="Ex: Aquisição de equipamentos"
                      defaultValue={despesaParaEditar?.descricao || ""}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Valor *</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      placeholder="R$ 0,00"
                      defaultValue={
                        despesaParaEditar
                          ? formatCurrency(despesaParaEditar.valor)
                          : ""
                      }
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Data da Despesa *</label>
                    <input
                      type="date"
                      style={styles.formInput}
                      defaultValue={despesaParaEditar?.data || ""}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Natureza da Despesa *
                    </label>
                    <select
                      style={styles.formInput}
                      defaultValue={despesaParaEditar?.naturezaDespesa || ""}
                    >
                      <option value="">Selecione...</option>
                      <option value="MATERIAL DE CONSUMO">
                        Material de Consumo
                      </option>
                      <option value="MATERIAL PERMANENTE">
                        Material Permanente
                      </option>
                      <option value="SERVIÇOS TERCEIRIZADOS">
                        Serviços Terceirizados
                      </option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Número do Empenho</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      placeholder="Ex: 2025NE000123"
                      defaultValue={despesaParaEditar?.numeroEmpenho || ""}
                    />
                  </div>
                </div>

                {/* Nota informativa */}
                <div style={styles.formNote}>
                  <strong>📌 Observação:</strong> Todos os campos marcados com *
                  são obrigatórios. O valor da despesa não pode exceder o saldo
                  disponível da emenda.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ ESTILOS COMPLETOS
const styles = {
  // Loading & Error States
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    padding: "40px",
  },

  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #4A90E2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "16px",
    fontSize: "16px",
    color: "#6c757d",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    padding: "40px",
    textAlign: "center",
  },

  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  errorTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#E74C3C",
    margin: "0 0 8px 0",
  },

  errorMessage: {
    fontSize: "16px",
    color: "#6c757d",
    margin: "0 0 24px 0",
  },

  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },

  // Container Principal
  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },

  // Header
  header: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
  },

  headerInfo: {
    flex: "1",
    minWidth: "300px",
  },

  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#154360",
    margin: "0 0 8px 0",
  },

  headerSubtitle: {
    fontSize: "14px",
    color: "#6c757d",
    margin: "0 0 12px 0",
  },

  headerMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
  },

  metaItem: {
    fontSize: "13px",
    color: "#495057",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },

  // Buttons
  btnPrimary: {
    padding: "10px 20px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  btnSecondary: {
    padding: "10px 20px",
    backgroundColor: "white",
    color: "#495057",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  btnSuccess: {
    padding: "10px 20px",
    backgroundColor: "#27AE60",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // KPI Section
  kpiSection: {
    marginBottom: "20px",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },

  kpiCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  kpiIcon: {
    fontSize: "32px",
    flexShrink: 0,
  },

  kpiContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  kpiValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#154360",
  },

  kpiLabel: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
  },

  // Tabs
  tabsContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  tabsHeader: {
    display: "flex",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
    overflowX: "auto",
  },

  tab: {
    padding: "16px 24px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6c757d",
    cursor: "pointer",
    transition: "all 0.2s",
    borderBottom: "3px solid transparent",
  },

  tabActive: {
    color: "#4A90E2",
    backgroundColor: "white",
    borderBottomColor: "#4A90E2",
  },

  tabContent: {
    padding: "24px",
  },

  visaoGeralContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
  },

  chartCard: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },

  chartTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#154360",
    margin: "0 0 16px 0",
    textAlign: "center",
  },

  detalhesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  detalheCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e9ecef",
  },

  detalheTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#154360",
    margin: "0 0 12px 0",
  },

  detalheContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  detalheRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detalheLabel: {
    fontSize: "13px",
    color: "#6c757d",
    fontWeight: "500",
  },

  detalheValue: {
    fontSize: "13px",
    color: "#495057",
    fontWeight: "600",
  },

  acoesRapidas: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e9ecef",
  },

  acoesTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#154360",
    margin: "0 0 12px 0",
  },

  acoesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },

  acaoButton: {
    backgroundColor: "white",
    border: "1px solid #dee2e6",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center",
  },

  despesasContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  despesasHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  despesasTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#154360",
    margin: 0,
  },

  formContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    border: "1px solid #e9ecef",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e9ecef",
  },

  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#154360",
    margin: 0,
  },

  formActions: {
    display: "flex",
    gap: "12px",
  },

  formContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  formLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
  },

  formInput: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    transition: "border-color 0.15s ease-in-out",
  },

  saldoInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#e8f5e8",
    borderRadius: "8px",
    border: "1px solid #d4edda",
  },

  saldoLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#155724",
  },

  saldoValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#28a745",
  },

  formNote: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    fontSize: "13px",
    color: "#6c757d",
    lineHeight: 1.4,
  },

  emptyDespesas: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.5,
  },

  emptyText: {
    fontSize: "16px",
    color: "#6c757d",
    margin: "0 0 24px 0",
  },

  editButton: {
    padding: "8px 12px",
    backgroundColor: "#ffc107",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "10px",
  },

  // ==================================
  // === 🎯 INÍCIO DA MODIFICAÇÃO 3 ===
  // ==================================
  // ❌ REMOVIDOS estilos duplicados (linhas 1245-1318 do original):
  // despesasSection, despesasSectionTitle, despesasCardsGrid,
  // despesaCard, despesaCardHeader, despesaNumero,
  // despesaStatusPlanejada, despesaStatusExecutada,
  // despesaDescricao, despesaValor, despesaInfoExtra
  // ==================================
  // === 🎯 FIM DA MODIFICAÇÃO 3 ===
  // ==================================
};

// CSS Animation para spinner
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

export default VisualizacaoEmendaDespesas;