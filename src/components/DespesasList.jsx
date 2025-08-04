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

export default function DespesasList({
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
}) {
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
    if (!window.confirm("Tem certeza que deseja excluir esta despesa?")) {
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

      {/* ✅ Componente da Tabela */}
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
    </div>
  );
}

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
};
