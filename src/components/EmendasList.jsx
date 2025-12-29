// src/components/EmendasList.jsx - REFATORADO
// Componente orquestrador que delega responsabilidades aos sub-componentes

import React, { useState, useEffect } from "react";
import useEmendaDespesa from "../hooks/useEmendaDespesa";
import EmendasListHeader from "./emenda/EmendasListHeader";
import EmendasStats from "./emenda/EmendasStats";
import EmendasFilters from "./emenda/EmendasFilters";
import EmendasTable from "./emenda/EmendasTable";

const EmendasList = ({
  usuario,
  onNovaEmenda,
  onEditarEmenda,
  onVisualizarEmenda,
  onAbrirEmenda,
  onExcluirEmenda,
  onVerDespesas,
  onVoltarDespesas,
}) => {
  // Hook integrado para dados em tempo real
  const {
    emendas: emendasComMetricas,
    loading: hookLoading,
    error: hookError,
    obterEstatisticasGerais,
    filtrarEmendas,
    recarregar,
  } = useEmendaDespesa(usuario, {
    carregarTodasEmendas: true,
    incluirEstatisticas: true,
    autoRefresh: true,
    userRole: usuario?.role || usuario?.tipo || "operador",
  });

  // Estados locais
  const [filtros, setFiltros] = useState({
    busca: "",
    parlamentar: "",
    tipo: "",
    status: "",
    statusFinanceiro: "",
  });

  const [emendasFiltradas, setEmendasFiltradas] = useState([]);
  const [estatisticasGerais, setEstatisticasGerais] = useState(null);
  const [showFiltros, setShowFiltros] = useState(false);

  // Efeito para atualizar emendas filtradas
  useEffect(() => {
    if (emendasComMetricas.length > 0) {
      const filtradas = filtrarEmendas(filtros);
      setEmendasFiltradas(filtradas);

      // Calcular estatísticas gerais
      const stats = obterEstatisticasGerais();
      setEstatisticasGerais(stats);
    } else {
      setEmendasFiltradas([]);
    }
  }, [emendasComMetricas, filtros, filtrarEmendas, obterEstatisticasGerais]);

  // Handlers de filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      parlamentar: "",
      tipo: "",
      status: "",
      statusFinanceiro: "",
    });
  };

  const toggleFiltros = () => {
    setShowFiltros(!showFiltros);
  };

  // Preparar dados únicos para filtros
  const parlamentaresUnicos = [
    ...new Set(emendasComMetricas.map((e) => e.parlamentar)),
  ]
    .filter(Boolean)
    .sort();

  const tiposUnicos = [...new Set(emendasComMetricas.map((e) => e.tipo))]
    .filter(Boolean)
    .sort();

  // Estados de loading e erro
  if (hookLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Carregando emendas com métricas financeiras...</p>
        </div>
      </div>
    );
  }

  if (hookError) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <h3 style={styles.errorTitle}>Erro ao carregar dados</h3>
          <p style={styles.errorMessage}>{hookError}</p>
          <button onClick={recarregar} style={styles.retryButton}>
            🔄 Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização principal
  return (
    <div style={styles.container}>
      {/* Header do sistema */}
      <EmendasListHeader
        usuario={usuario}
        loading={hookLoading}
        totalEmendas={emendasComMetricas.length}
        onVoltarDespesas={onVoltarDespesas}
      />

      {/* Estatísticas */}
      <EmendasStats
        estatisticasGerais={estatisticasGerais}
        loading={hookLoading}
      />

      {/* Filtros */}
      <EmendasFilters
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onLimparFiltros={limparFiltros}
        showFiltros={showFiltros}
        onToggleFiltros={toggleFiltros}
        parlamentaresUnicos={parlamentaresUnicos}
        tiposUnicos={tiposUnicos}
        totalEmendas={emendasComMetricas.length}
        emendasFiltradas={emendasFiltradas.length}
      />

      {/* Tabela */}
      <EmendasTable
        emendasFiltradas={emendasFiltradas}
        usuario={usuario}
        onAbrirEmenda={onAbrirEmenda || onVisualizarEmenda}
        onEditarEmenda={onEditarEmenda}
        onExcluirEmenda={onExcluirEmenda}
        onVerDespesas={onVerDespesas}
        onNovaEmenda={onNovaEmenda}
      />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-md)",
    overflow: "hidden",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
  },

  loadingSpinner: {
    width: 40,
    height: 40,
    border: "4px solid var(--theme-border)",
    borderTop: "4px solid var(--primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 16,
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
  },

  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  errorTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--error)",
    margin: "0 0 8px 0",
  },

  errorMessage: {
    fontSize: "14px",
    color: "var(--theme-text-secondary)",
    margin: "0 0 24px 0",
  },

  retryButton: {
    backgroundColor: "var(--primary)",
    color: "var(--white)",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  },
};

// Adicionar animação CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default EmendasList;
