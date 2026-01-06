// DespesasList.jsx - CORRIGIDO: Removido espaço vazio
// ✅ CORREÇÃO: Ajustado container para não forçar altura mínima

import React, { useEffect, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import DespesasFilters from "./DespesasFilters";
import DespesasTable from "./DespesasTable";

// ✅ CORES PADRONIZADAS (mesmo padrão do Emendas)
const PRIMARY = "#2563EB";
const ACCENT = "#3B82F6";
const SUCCESS = "#10B981";
const WARNING = "#F59E0B";
const ERROR = "#EF4444";
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
  ocultarBotoesAgrupamento = false,
}) => {
  // ✅ Estados locais simplificados
  const [despesasFiltradas, setDespesasFiltradas] = useState([]);
  const [estatisticasFiltro, setEstatisticasFiltro] = useState(null);

  console.log("📊 DespesasList: Recebendo dados via props", {
    despesasCount: despesas.length,
    emendasCount: emendas.length,
    loading,
    error,
    temOnEdit: !!onEdit,
    temOnEditarDespesa: !!onEditarDespesa,
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

  // ✅ Handler para editar - usa onEdit como padrão
  const handleEdit = (despesa) => {
    console.log("🔧 DespesasList.handleEdit CHAMADO:", {
      despesaId: despesa?.id,
      despesaDiscriminacao: despesa?.discriminacao,
    });

    if (onEdit && typeof onEdit === "function") {
      console.log("✅ Chamando onEdit");
      onEdit(despesa);
    } else {
      console.error("❌ onEdit não é uma função!", { onEdit });
    }
  };

  // ✅ Handler para visualizar
  const handleView = (despesa) => {
    console.log("👁️ DespesasList.handleView CHAMADO:", despesa?.id);
    if (onView && typeof onView === "function") {
      onView(despesa);
    } else {
      handleEdit(despesa); // Fallback para edição
    }
  };

  // ✅ Handler para excluir simplificado
  const handleDelete = async (despesaId) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) {
      return;
    }

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
        <div style={styles.errorIcon}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--danger)" }}>error</span>
        </div>
        <h3 style={styles.errorTitle}>Erro ao carregar dados</h3>
        <p style={styles.errorMessage}>{error}</p>
        {onRecarregar && (
          <button onClick={onRecarregar} style={styles.retryButton}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>refresh</span>
            Tentar novamente
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
          <div style={styles.emptyIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--theme-text-secondary)", opacity: 0.5 }}>payments</span>
          </div>
          <h2 style={styles.emptyTitle}>Nenhuma despesa registrada</h2>
          <p style={styles.emptyText}>
            Clique em "Nova Despesa" para começar a registrar suas despesas
            financeiras.
          </p>
          {onNovaDespesa && (
            <button onClick={onNovaDespesa} style={styles.emptyButton}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>add</span>
              Nova Despesa
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
            const cardStyle =
              estilosCustomizados?.despesaCardExecutada || styles.despesaCard;

            return (
              <div key={despesa.id} style={cardStyle}>
                <div
                  style={
                    estilosCustomizados?.despesaStatusExecutada ||
                    styles.despesaStatusExecutada
                  }
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>check_circle</span>
                  {despesa.status || "EXECUTADA"}
                </div>
                <div
                  style={
                    estilosCustomizados?.despesaContent || styles.despesaContent
                  }
                >
                  <div
                    style={
                      estilosCustomizados?.despesaTopLine ||
                      styles.despesaTopLine
                    }
                  >
                    <span
                      style={
                        estilosCustomizados?.despesaNumero ||
                        styles.despesaNumero
                      }
                    >
                      #{index + 1}
                    </span>
                    <span
                      style={
                        estilosCustomizados?.despesaDescricao ||
                        styles.despesaDescricao
                      }
                    >
                      {despesa.discriminacao ||
                        despesa.estrategia ||
                        despesa.naturezaDespesa}
                    </span>
                    <span
                      style={
                        estilosCustomizados?.despesaValor || styles.despesaValor
                      }
                    >
                      {parseFloat(despesa.valor || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <div
                    style={
                      estilosCustomizados?.despesaInfoLine ||
                      styles.despesaInfoLine
                    }
                  >
                    <span
                      style={
                        estilosCustomizados?.despesaInfo || styles.despesaInfo
                      }
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>description</span>
                      Empenho: {despesa.numeroEmpenho || "N/A"}
                    </span>
                    <span
                      style={
                        estilosCustomizados?.despesaInfo || styles.despesaInfo
                      }
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>calendar_today</span>
                      {despesa.dataPagamento
                        ? new Date(despesa.dataPagamento).toLocaleDateString(
                            "pt-BR",
                          )
                        : "N/A"}
                    </span>
                    {emendaRelacionada && (
                      <span
                        style={
                          estilosCustomizados?.despesaInfo || styles.despesaInfo
                        }
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>account_balance</span>
                        {emendaRelacionada.numero || "N/A"}
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.despesaAcoes}>
                  <button
                    type="button"
                    onClick={() => {
                      console.log(
                        "Visualizar clicado (DespesasList Cards):",
                        despesa.id,
                      );
                      handleView(despesa);
                    }}
                    style={
                      estilosCustomizados?.btnVisualizar || styles.btnVisualizar
                    }
                    title="Visualizar despesa"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log(
                        "Editar clicado (DespesasList Cards):",
                        despesa.id,
                      );
                      handleEdit(despesa);
                    }}
                    style={estilosCustomizados?.btnEditar || styles.btnEditar}
                    title="Editar despesa"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(despesa.id)}
                    style={estilosCustomizados?.btnRemover || styles.btnRemover}
                    title="Remover despesa"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  </button>
                </div>
              </div>
            );
          })}
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
          ocultarBotoesAgrupamento={ocultarBotoesAgrupamento}
        />
      )}
    </div>
  );
};

export default DespesasList;

// ✅ ESTILOS CORRIGIDOS - Removido minHeight e backgrounds desnecessários
const styles = {
  container: {
    backgroundColor: "transparent", // ✅ CORRIGIDO: Transparente para não criar fundo extra
    minHeight: "auto", // ✅ CORRIGIDO: Altura automática sem forçar mínimo
    paddingBottom: "0", // ✅ CORRIGIDO: Sem padding extra
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    color: "var(--primary)",
  },

  loadingSpinner: {
    width: 48,
    height: 48,
    border: "4px solid var(--theme-border)",
    borderTop: "4px solid var(--primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 20,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    margin: 0,
    color: "var(--theme-text-secondary)",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
    backgroundColor: "var(--theme-surface)",
    borderRadius: 12,
    boxShadow: "var(--shadow)",
    margin: "32px 0",
    border: "1px solid var(--theme-border)",
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
    color: "var(--theme-text-secondary)",
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
    backgroundColor: "var(--theme-surface)",
    borderRadius: 12,
    boxShadow: "var(--shadow)",
    margin: "0",
    border: "1px solid var(--theme-border)",
  },

  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
    opacity: 0.3,
  },

  emptyTitle: {
    color: "var(--primary)",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },

  emptyText: {
    color: "var(--theme-text-secondary)",
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
    backgroundColor: "rgba(14, 165, 233, 0.1)",
    border: "2px solid var(--info)",
    borderRadius: 12,
    margin: "0 0 24px 0",
    fontSize: 14,
    color: "var(--info)",
    boxShadow: "var(--shadow-sm)",
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
    padding: "0", // ✅ CORRIGIDO: Sem padding extra
  },

  despesaCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    border: "3px solid var(--success)",
    borderLeft: "8px solid var(--success)",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-sm)",
  },

  despesaStatusExecutada: {
    fontSize: "14px",
    fontWeight: "800",
    color: "var(--success)",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    padding: "8px 16px",
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
    color: "var(--theme-text-secondary)",
    minWidth: "32px",
  },

  despesaDescricao: {
    fontSize: "14px",
    color: "var(--theme-text)",
    flex: 1,
    fontWeight: "500",
  },

  despesaValor: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--success)",
    minWidth: "120px",
    textAlign: "right",
  },

  despesaInfoLine: {
    display: "flex",
    gap: "16px",
    paddingLeft: "48px",
    fontSize: "12px",
    color: "var(--theme-text-muted)",
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
    backgroundColor: "var(--info)",
    color: "var(--white)",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  btnEditar: {
    backgroundColor: "var(--warning)",
    color: "var(--white)",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  btnRemover: {
    backgroundColor: "var(--error)",
    color: "var(--white)",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};