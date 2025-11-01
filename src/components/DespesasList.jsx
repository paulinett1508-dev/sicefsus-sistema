// DespesasList.jsx - CORRIGIDO SEM useEmendaDespesa
// ✅ CORREÇÃO: Receber dados via props ao invés do hook conflitante

import React, { useEffect, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import DespesasFilters from "./DespesasFilters";
import DespesasTable from "./DespesasTable";

// ✅ CORES PADRONIZADAS (mesmo padrão do Emendas)
const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const SUCCESS = "#27AE60";
const WARNING = "#F39C12";
const ERROR = "#E74C3C";
const WHITE = "#fff";
const GRAY = "#f4f6f8";

const DespesasList = ({
  // ✅ CORREÇÃO: Receber dados via props ao invés do hook
  despesas = [],
  emendas = [],
  loading = false,
  error = null,
  onEdit,
  onView,
  onDelete,
  onNovaDespesa,
  onEditarDespesa,
  onExcluirDespesa,
  usuario,
  filtroInicial = null,
  onRecarregar, // ✅ NOVO: Callback para recarregar dados
  usarLayoutCards = false, // ✅ NOVO: Permitir layout em cards ao invés de tabela
  estilosCustomizados = null,
}) => {
  // ✅ Estados locais simplificados
  const [despesasFiltradas, setDespesasFiltradas] = useState([]);
  const [estatisticasFiltro, setEstatisticasFiltro] = useState(null);

  console.log("📊 DespesasList: Recebendo dados via props", {
    despesasCount: despesas.length,
    emendasCount: emendas.length,
    loading,
    error,
  });

  // ✅ Sincronizar dados recebidos via props
  useEffect(() => {
    console.log("📊 DespesasList: Sincronizando dados", despesas.length);

    // Aplicar filtro inicial se existir
    if (filtroInicial?.emendaId) {
      const filtradas = despesas.filter(
        (d) => d.emendaId === filtroInicial.emendaId,
      );
      setDespesasFiltradas(filtradas);
      calcularEstatisticasFiltro(filtradas);
    } else {
      setDespesasFiltradas(despesas);
      calcularEstatisticasFiltro(despesas);
    }
  }, [despesas, filtroInicial]);

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

    setEstatisticasFiltro({
      totalDespesas,
      valorTotalDespesas,
    });
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

  // ✅ Handler para excluir simplificado
  const handleDelete = async (despesaId) => {


    try {
      // Excluir do Firebase
      await deleteDoc(doc(db, "despesas", despesaId));

      console.log("✅ DespesasList: Despesa deletada:", despesaId);

      // Chamar callback para recarregar dados no componente pai
      if (onRecarregar && typeof onRecarregar === "function") {
        onRecarregar();
      }

      // Chamar handler do componente pai se existir
      if (onExcluirDespesa && typeof onExcluirDespesa === "function") {
        onExcluirDespesa(despesaId);
      } else if (onDelete && typeof onDelete === "function") {
        onDelete(despesaId);
      }
    } catch (error) {
      console.error("❌ DespesasList: Erro ao excluir despesa:", error);
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

  // ✅ Loading
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Carregando despesas...</p>
      </div>
    );
  }

  // ✅ Error
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>❌</div>
        <h3 style={styles.errorTitle}>Erro ao carregar dados</h3>
        <p style={styles.errorMessage}>{error}</p>
        {onRecarregar && (
          <button onClick={onRecarregar} style={styles.retryButton}>
            🔄 Tentar novamente
          </button>
        )}
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
          <p style={styles.emptyText}>
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


      {/* ✅ Layout em Cards (padrão visual das planejadas) */}
      {usarLayoutCards ? (
        <div style={styles.cardsContainer}>
          {despesasFiltradas.map((despesa, index) => {
          const emendaRelacionada = emendas.find(
            (e) => e.id === despesa.emendaId,
          );

          // Usar estilos customizados se fornecidos
          const cardStyle = estilosCustomizados?.despesaCardExecutada || styles.despesaCard;

          return (
            <div key={despesa.id} style={cardStyle}>
              <div style={estilosCustomizados?.despesaStatusExecutada || styles.despesaStatusExecutada}>
                {despesa.status || "✅ EXECUTADA"}
              </div>
              <div style={estilosCustomizados?.despesaContent || styles.despesaContent}>
                <div style={estilosCustomizados?.despesaTopLine || styles.despesaTopLine}>
                  <span style={estilosCustomizados?.despesaNumero || styles.despesaNumero}>#{index + 1}</span>
                  <span style={estilosCustomizados?.despesaDescricao || styles.despesaDescricao}>
                    {despesa.discriminacao || despesa.estrategia || despesa.naturezaDespesa}
                  </span>
                  <span style={estilosCustomizados?.despesaValor || styles.despesaValor}>
                    {parseFloat(despesa.valor || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div style={estilosCustomizados?.despesaInfoLine || styles.despesaInfoLine}>
                  <span style={estilosCustomizados?.despesaInfo || styles.despesaInfo}>
                    📄 Empenho: {despesa.numeroEmpenho || "N/A"}
                  </span>
                  <span style={estilosCustomizados?.despesaInfo || styles.despesaInfo}>
                    📅 {despesa.dataPagamento ? new Date(despesa.dataPagamento).toLocaleDateString("pt-BR") : "Sem data"}
                  </span>
                  <span style={estilosCustomizados?.despesaInfo || styles.despesaInfo}>
                    🏢 {despesa.fornecedor || "Sem fornecedor"}
                  </span>
                </div>
              </div>
              <div style={estilosCustomizados?.despesaAcoes || styles.despesaAcoes}>
                <button
                  type="button"
                  onClick={() => handleView(despesa)}
                  style={estilosCustomizados?.btnVisualizar || styles.btnVisualizar}
                  title="Visualizar despesa"
                >
                  👁️
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(despesa)}
                  style={estilosCustomizados?.btnEditar || styles.btnEditar}
                  title="Editar despesa"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(despesa.id)}
                  style={estilosCustomizados?.btnRemover || styles.btnRemover}
                  title="Remover despesa"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ✅ Componente da Tabela (modo original) */
        <DespesasTable
          despesas={despesasFiltradas}
          emendas={emendas}
          totalDespesas={despesas.length}
          loading={false}
          usuario={usuario}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default DespesasList;

// ✅ Estilos mantidos (sem mudanças)
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

  // ✅ ESTILOS PARA CARDS DE DESPESAS EXECUTADAS
  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "0 32px 32px 32px",
  },

  despesaCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f0fdf4",
    border: "2px solid #22c55e",
    borderLeft: "6px solid #22c55e",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(34, 197, 94, 0.1)",
  },

  despesaStatusExecutada: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "6px 12px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },

  despesaContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },

  despesaTopLine: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  despesaNumero: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6c757d",
    minWidth: "32px",
  },

  despesaDescricao: {
    fontSize: "14px",
    color: "#495057",
    flex: 1,
    fontWeight: "500",
  },

  despesaValor: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#16a34a",
    minWidth: "120px",
    textAlign: "right",
  },

  despesaInfoLine: {
    display: "flex",
    gap: "16px",
    paddingLeft: "48px",
    fontSize: "12px",
    color: "#6b7280",
  },

  despesaInfo: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  despesaAcoes: {
    display: "flex",
    gap: "8px",
  },

  btnVisualizar: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  btnEditar: {
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  btnRemover: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};