// DespesasList.jsx - PADRONIZADO COM EMENDASLIST v1.0
// ✅ Mesmo padrão visual e estrutural da listagem de emendas

import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import DespesasFilters from "./DespesasFilters";
import DespesasTable from "./DespesasTable";
import useEmendaDespesa from "../hooks/useEmendaDespesa";

// ✅ CORES PADRONIZADAS (mesmo padrão do Emendas)
const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const SUCCESS = "#27AE60";
const WARNING = "#F39C12";
const ERROR = "#E74C3C";
const WHITE = "#fff";
const GRAY = "#f4f6f8";

export default function DespesasList({
  refresh,
  onEdit,
  onView,
  onDelete,
  onNovaDespesa,
  onEditarDespesa,
  onExcluirDespesa,
  usuario,
  filtroInicial = null,
}) {
  // ✅ Hook integrado para dados em tempo real
  const {
    emendas,
    despesas: despesasHook,
    loading: hookLoading,
    error: hookError,
    obterEstatisticasGerais,
    atualizarSaldoEmenda,
    recarregar,
  } = useEmendaDespesa(null, {
    carregarTodasEmendas: true,
    incluirEstatisticas: true,
    autoRefresh: true,
  });

  // ✅ Estados locais
  const [despesas, setDespesas] = useState([]);
  const [despesasFiltradas, setDespesasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estatisticasGerais, setEstatisticasGerais] = useState(null);
  const [estatisticasFiltro, setEstatisticasFiltro] = useState(null);

  // ✅ Sincronizar dados do hook com estado local
  useEffect(() => {
    if (despesasHook.length >= 0) {
      setDespesas(despesasHook);

      // Aplicar filtro inicial se existir
      if (filtroInicial?.emendaId) {
        const filtradas = despesasHook.filter(
          (d) => d.emendaId === filtroInicial.emendaId,
        );
        setDespesasFiltradas(filtradas);
        calcularEstatisticasFiltro(filtradas);
      } else {
        setDespesasFiltradas(despesasHook);
        calcularEstatisticasFiltro(despesasHook);
      }

      setLoading(false);
    }
  }, [despesasHook, filtroInicial]);

  // ✅ Calcular estatísticas gerais
  useEffect(() => {
    const stats = obterEstatisticasGerais();
    setEstatisticasGerais(stats);
  }, [obterEstatisticasGerais]);

  // ✅ Função para calcular estatísticas dos despesas filtradas
  const calcularEstatisticasFiltro = (despesasList) => {
    if (!despesasList.length) {
      setEstatisticasFiltro(null);
      return;
    }

    const totalDespesas = despesasList.length;
    const valorTotalDespesas = despesasList.reduce(
      (sum, d) => sum + (d.valor || 0),
      0,
    );
    const mediaValorDespesa =
      totalDespesas > 0 ? valorTotalDespesas / totalDespesas : 0;

    // Estatísticas por natureza
    const despesasPorNatureza = despesasList.reduce((acc, d) => {
      const natureza = d.naturezaDespesa || "Não informado";
      acc[natureza] = (acc[natureza] || 0) + 1;
      return acc;
    }, {});

    // Estatísticas por fornecedor
    const despesasPorFornecedor = despesasList.reduce((acc, d) => {
      const fornecedor = d.notaFiscalFornecedor || "Não informado";
      acc[fornecedor] = (acc[fornecedor] || 0) + 1;
      return acc;
    }, {});

    // Emendas envolvidas
    const emendasEnvolvidas = [...new Set(despesasList.map((d) => d.emendaId))]
      .length;

    // Despesas por mês
    const despesasPorMes = despesasList.reduce((acc, d) => {
      if (!d.data) return acc;
      const mes = new Date(d.data).toLocaleString("pt-BR", {
        month: "2-digit",
        year: "numeric",
      });
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});

    // Valores máximo e mínimo
    const valores = despesasList.map((d) => d.valor || 0);
    const maiorDespesa = Math.max(...valores);
    const menorDespesa = Math.min(...valores.filter((v) => v > 0));

    setEstatisticasFiltro({
      totalDespesas,
      valorTotalDespesas,
      mediaValorDespesa,
      despesasPorNatureza,
      despesasPorFornecedor,
      emendasEnvolvidas,
      despesasPorMes,
      maiorDespesa: maiorDespesa > 0 ? maiorDespesa : 0,
      menorDespesa: menorDespesa < Infinity ? menorDespesa : 0,
    });
  };

  // ✅ Função para formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ Handler para filtros
  const handleFilter = (despesasResultado) => {
    setDespesasFiltradas(despesasResultado);
    calcularEstatisticasFiltro(despesasResultado);
  };

  // ✅ Handler para limpar filtros
  const handleClearFilters = () => {
    setDespesasFiltradas(despesas);
    calcularEstatisticasFiltro(despesas);
  };

  // ✅ Handler para editar com fallbacks
  const handleEdit = (despesa) => {
    if (onEditarDespesa && typeof onEditarDespesa === "function") {
      onEditarDespesa(despesa);
    } else if (onEdit && typeof onEdit === "function") {
      onEdit(despesa);
    } else {
      console.warn("Nenhum handler de edição encontrado");
    }
  };

  // ✅ Handler para visualizar
  const handleView = (despesa) => {
    if (onView && typeof onView === "function") {
      onView(despesa);
    } else {
      handleEdit(despesa); // Fallback para edição
    }
  };

  // ✅ Handler para excluir atualizado com hook
  const handleDelete = async (despesaId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      return;
    }

    try {
      // Encontrar despesa para obter emendaId
      const despesa = despesas.find((d) => d.id === despesaId);
      const emendaId = despesa?.emendaId;

      // Excluir do Firebase
      await deleteDoc(doc(db, "despesas", despesaId));

      // Atualizar listas locais
      setDespesas((prev) => prev.filter((d) => d.id !== despesaId));
      setDespesasFiltradas((prev) => prev.filter((d) => d.id !== despesaId));

      // Usar hook para atualizar saldo da emenda
      if (emendaId) {
        await atualizarSaldoEmenda(emendaId);
        await recarregar();
      }

      // Chamar handler do componente pai se existir
      if (onExcluirDespesa && typeof onExcluirDespesa === "function") {
        onExcluirDespesa(despesaId);
      } else if (onDelete && typeof onDelete === "function") {
        onDelete(despesaId);
      }
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      alert("Erro ao excluir despesa. Tente novamente.");
    }
  };

  // ✅ Função para obter nome da emenda
  const getEmendaDisplayName = () => {
    if (!filtroInicial?.emendaId) return "";

    const emenda = emendas.find((e) => e.id === filtroInicial.emendaId);
    if (emenda) {
      return `${emenda.numero} - ${emenda.parlamentar}`;
    }

    // Fallback
    if (filtroInicial.numero && filtroInicial.parlamentar) {
      return `${filtroInicial.numero} - ${filtroInicial.parlamentar}`;
    }

    return filtroInicial.emendaId;
  };

  // ✅ Loading combinado
  if (loading || hookLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Carregando despesas...</p>
      </div>
    );
  }

  // ✅ Error do hook
  if (hookError) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>❌</div>
        <h3 style={styles.errorTitle}>Erro ao carregar dados</h3>
        <p style={styles.errorMessage}>{hookError}</p>
        <button onClick={recarregar} style={styles.retryButton}>
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  // ✅ Estado vazio
  if (despesas.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>💰</div>
          <h2 style={styles.emptyTitle}>Nenhuma despesa registrada</h2>
          <p style={styles.emptyText          }>
            Clique em "Nova Despesa" para começar a registrar suas despesas
            financeiras.
          </p>
          {onNovaDespesa && (
            <button onClick={onNovaDespesa} style={styles.emptyButton}>
              ➕ Nova Despesa
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ✅ Banner informativo para filtro de emenda específica */}
      {filtroInicial?.emendaId && (
        <div style={styles.filtroAutomaticoInfo}>
          <span style={styles.filtroIcon}>🔍</span>
          <div style={styles.filtroContent}>
            <span style={styles.filtroTexto}>
              <strong>Filtro Automático:</strong> Exibindo despesas da emenda{" "}
              <strong>{getEmendaDisplayName()}</strong>
            </span>
            <span style={styles.filtroSubtexto}>
              {despesasFiltradas.length} despesa(s) encontrada(s)
            </span>
          </div>
        </div>
      )}

      {/* ✅ Componente de Filtros */}
      <DespesasFilters
        despesas={despesas}
        emendas={emendas}
        onFilter={handleFilter}
        onClear={handleClearFilters}
        filtroInicial={filtroInicial}
      />

      {/* ✅ Componente da Tabela */}
      <DespesasTable
        despesas={despesasFiltradas}
        emendas={emendas}
        totalDespesas={despesas.length}
        loading={loading}
        usuario={usuario}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
}

// ✅ Estilos padronizados (mesmo padrão do EmendasList)
const styles = {
  container: {
    backgroundColor: GRAY,
    minHeight: "100vh",
    paddingBottom: "32px",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    color: PRIMARY,
  },

  loadingSpinner: {
    width: 48,
    height: 48,
    border: "4px solid #e3e3e3",
    borderTop: "4px solid #154360",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 20,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    margin: 0,
    color: "#666",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
    backgroundColor: WHITE,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    margin: "32px",
  },

  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  errorTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: ERROR,
    margin: "0 0 8px 0",
  },

  errorMessage: {
    fontSize: "14px",
    color: "#6c757d",
    margin: "0 0 24px 0",
  },

  retryButton: {
    backgroundColor: ACCENT,
    color: WHITE,
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  emptyContainer: {
    textAlign: "center",
    padding: "80px 32px",
    backgroundColor: WHITE,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    margin: "32px",
  },

  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
    opacity: 0.3,
  },

  emptyTitle: {
    color: PRIMARY,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },

  emptyText: {
    color: "#666",
    fontSize: 16,
    margin: "0 0 32px 0",
    lineHeight: 1.5,
  },

  emptyButton: {
    backgroundColor: SUCCESS,
    color: WHITE,
    border: "none",
    padding: "14px 28px",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
  },

  filtroAutomaticoInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#e3f2fd",
    border: "2px solid #90caf9",
    borderRadius: 12,
    margin: "0 32px 24px 32px",
    fontSize: 14,
    color: "#1565c0",
    boxShadow: "0 4px 12px rgba(33, 150, 243, 0.15)",
  },

  filtroIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },

  filtroContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  filtroTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },

  filtroSubtexto: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
  },

  statsSection: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: "24px",
    margin: "0 32px 24px 32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },

  statsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: PRIMARY,
    margin: "0 0 20px 0",
    borderBottom: "2px solid #4A90E2",
    paddingBottom: "8px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },

  statCard: {
    backgroundColor: "#f8f9fa",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #e9ecef",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.3s ease",
    cursor: "default",
  },

  statIcon: {
    fontSize: "24px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: "50%",
    flexShrink: 0,
  },

  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
    minWidth: 0,
  },

  statValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: PRIMARY,
    wordBreak: "break-word",
  },

  statLabel: {
    fontSize: "11px",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },

  distributionSection: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: "20px",
    margin: "0 32px 24px 32px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  distributionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: PRIMARY,
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  distributionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },

  distributionItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
  },

  distributionCount: {
    fontSize: "16px",
    fontWeight: "700",
    color: ACCENT,
    minWidth: "28px",
    textAlign: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: "6px",
    padding: "4px 8px",
  },

  distributionLabel: {
    fontSize: "13px",
    color: "#495057",
    flex: 1,
    fontWeight: "500",
  },
};

// ✅ CSS adicional para animações
const additionalCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.distribution-item:hover {
  background-color: #e3f2fd;
  border-color: #90caf9;
  transform: translateX(2px);
}

.empty-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.retry-button:hover {
  background-color: #357ABD;
  transform: translateY(-1px);
}

@media (max-width: 768px}) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .stat-card {
    padding: 12px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    fontSize: 20px;
  }

  .stat-value {
    font-size: 14px;
  }

  .distribution-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .filtro-automatico-info {
    margin: 0 16px 16px 16px;
    padding: 12px 16px;
  }

  .stats-section,
  .distribution-section {
    margin: 0 16px 16px 16px;
    padding: 16px;
  }
}
`;

// Inserir CSS dinamicamente
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = additionalCSS;
  document.head.appendChild(style);
}
```