// components/emenda/EmendaDetail/index.jsx
// ✅ ORQUESTRADOR LIMPO - SEM LÓGICA DE UI, SEM ESTILOS
import React, { useState, useEffect } from "react";
import { emendaDetailStyles, THEME_COLORS } from "./styles/emendaDetailStyles";
import EmendaHeader from "./components/EmendaHeader";
import EmendaKPIs from "./components/EmendaKPIs";
import EmendaTabs from "./components/EmendaTabs";
import VisaoGeralTab from "./sections/VisaoGeralTab";
import DespesasTab from "./sections/DespesasTab";
import NovaDespesaTab from "./sections/NovaDespesaTab";
import { parseValorMonetario } from "../../../utils/formatters";

const EmendaDetail = ({ emendaId, onVoltar, onEditarEmenda, usuario }) => {
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [mostrarFormDespesa, setMostrarFormDespesa] = useState(false);
  const [despesaParaEditar, setDespesaParaEditar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Dados simulados (em produção, viriam de props ou context)
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

  // ✅ UTILS - Formatadores
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // ✅ COMPUTED - Status da emenda
  const getStatusEmenda = () => {
    if (!emenda) return { text: "Carregando...", color: "#6c757d" };

    const validade = emenda.validade || emenda.dataValidada;
    const saldo = metricas.saldoDisponivel || 0;
    const { ERROR, WARNING, SUCCESS } = THEME_COLORS;

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

  // ✅ COMPUTED - Dados para gráficos
  const dadosExecucao = emenda
    ? [
        {
          name: "Executado",
          value: metricas.valorExecutado || 0,
          color: THEME_COLORS.SUCCESS,
        },
        {
          name: "Disponível",
          value: metricas.saldoDisponivel || 0,
          color: THEME_COLORS.ACCENT,
        },
      ]
    : [];

  const despesasPorMes = despesasEmenda.reduce((acc, despesa) => {
    if (!despesa.data) return acc;
    const mes = new Date(despesa.data).toLocaleString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
    acc[mes] = (acc[mes] || 0) + parseValorMonetario(despesa.valor || 0);
    return acc;
  }, {});

  const dadosLinha = Object.entries(despesasPorMes).map(([mes, valor]) => ({
    mes,
    valor,
  }));

  // ✅ HANDLERS
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
    console.log("Salvando despesa...");
    setAbaAtiva("despesas");
  };

  const handleCancelarDespesa = () => {
    setMostrarFormDespesa(false);
    setDespesaParaEditar(null);
    setAbaAtiva("despesas");
  };

  // ✅ EFFECTS
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div style={emendaDetailStyles.loadingContainer}>
        <div style={emendaDetailStyles.loadingSpinner}></div>
        <p style={emendaDetailStyles.loadingText}>
          Carregando dados da emenda...
        </p>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div style={emendaDetailStyles.errorContainer}>
        <div style={emendaDetailStyles.errorIcon}>❌</div>
        <h3 style={emendaDetailStyles.errorTitle}>Erro ao carregar emenda</h3>
        <p style={emendaDetailStyles.errorMessage}>{error}</p>
        <button
          onClick={() => setError(null)}
          style={emendaDetailStyles.retryButton}
        >
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  // ✅ NOT FOUND STATE
  if (!emenda) {
    return (
      <div style={emendaDetailStyles.errorContainer}>
        <div style={emendaDetailStyles.errorIcon}>🔍</div>
        <h3 style={emendaDetailStyles.errorTitle}>Emenda não encontrada</h3>
        <p style={emendaDetailStyles.errorMessage}>
          A emenda solicitada não foi encontrada.
        </p>
        <button onClick={onVoltar} style={emendaDetailStyles.retryButton}>
          ← Voltar
        </button>
      </div>
    );
  }

  const status = getStatusEmenda();

  // ✅ RENDER PRINCIPAL
  return (
    <div style={emendaDetailStyles.container}>
      <EmendaHeader
        emenda={emenda}
        status={status}
        formatDate={formatDate}
        onVoltar={onVoltar}
        onEditarEmenda={onEditarEmenda}
      />

      <EmendaKPIs metricas={metricas} formatCurrency={formatCurrency} />

      <div style={emendaDetailStyles.tabsContainer}>
        <EmendaTabs
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          totalDespesas={metricas.totalDespesas}
        />

        <div style={emendaDetailStyles.tabContent}>
          {abaAtiva === "visao-geral" && (
            <VisaoGeralTab
              emenda={emenda}
              metricas={metricas}
              dadosExecucao={dadosExecucao}
              dadosLinha={dadosLinha}
              formatCurrency={formatCurrency}
              handleNovaDespesa={handleNovaDespesa}
              setAbaAtiva={setAbaAtiva}
              onEditarEmenda={onEditarEmenda}
            />
          )}

          {abaAtiva === "despesas" && (
            <DespesasTab
              despesasEmenda={despesasEmenda}
              metricas={metricas}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              handleNovaDespesa={handleNovaDespesa}
              handleEditarDespesa={handleEditarDespesa}
            />
          )}

          {abaAtiva === "nova-despesa" && (
            <NovaDespesaTab
              despesaParaEditar={despesaParaEditar}
              metricas={metricas}
              formatCurrency={formatCurrency}
              handleSalvarDespesa={handleSalvarDespesa}
              handleCancelarDespesa={handleCancelarDespesa}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmendaDetail;
