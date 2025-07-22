// src/components/LancamentosList.jsx - CORRIGIDO com nome da emenda
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
import LancamentosFilters from "./LancamentosFilters";
import LancamentosTable from "./LancamentosTable";

const GRAY = "#f4f6f8";

export default function LancamentosList({
  refresh,
  onEdit,
  onNovoLancamento,
  onEditarLancamento,
  onExcluirLancamento,
  usuario,
  filtroInicial = null,
}) {
  const [lancamentos, setLancamentos] = useState([]);
  const [emendas, setEmendas] = useState([]);
  const [lancamentosFiltrados, setLancamentosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar emendas para os filtros
  useEffect(() => {
    async function fetchEmendas() {
      try {
        const q = query(collection(db, "emendas"), orderBy("numero"));
        const snapshot = await getDocs(q);
        setEmendas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Erro ao buscar emendas:", error);
      }
    }
    fetchEmendas();
  }, []);

  // Buscar lançamentos
  useEffect(() => {
    async function fetchLancamentos() {
      setLoading(true);
      try {
        const q = query(collection(db, "lancamentos"), orderBy("data", "desc"));
        const snapshot = await getDocs(q);
        const lancamentosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLancamentos(lancamentosData);

        // Aplicar filtro inicial se existir
        if (filtroInicial?.emendaId) {
          const filtrados = lancamentosData.filter(
            (l) => l.emendaId === filtroInicial.emendaId,
          );
          setLancamentosFiltrados(filtrados);
        } else {
          setLancamentosFiltrados(lancamentosData);
        }
      } catch (error) {
        console.error("Erro ao buscar lançamentos:", error);
      }
      setLoading(false);
    }
    fetchLancamentos();
  }, [refresh, filtroInicial]);

  // Handler para quando filtros são aplicados
  const handleFilter = (lancamentosResultado) => {
    setLancamentosFiltrados(lancamentosResultado);
  };

  // Handler para quando filtros são limpos
  const handleClearFilters = () => {
    setLancamentosFiltrados(lancamentos);
  };

  // Handler para editar com fallbacks
  const handleEdit = (lancamento) => {
    if (onEditarLancamento && typeof onEditarLancamento === "function") {
      onEditarLancamento(lancamento);
    } else if (onEdit && typeof onEdit === "function") {
      onEdit(lancamento);
    } else {
      console.warn("Nenhum handler de edição encontrado");
    }
  };

  // Handler para excluir
  const handleDelete = async (lancamentoId) => {
    if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      return;
    }

    try {
      // Excluir do Firebase
      await deleteDoc(doc(db, "lancamentos", lancamentoId));

      // Atualizar listas locais
      setLancamentos((prev) => prev.filter((l) => l.id !== lancamentoId));
      setLancamentosFiltrados((prev) =>
        prev.filter((l) => l.id !== lancamentoId),
      );

      // Chamar handler do componente pai se existir
      if (onExcluirLancamento && typeof onExcluirLancamento === "function") {
        onExcluirLancamento(lancamentoId);
      }
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      alert("Erro ao excluir lançamento. Tente novamente.");
    }
  };

  // Handler para visualizar/abrir fluxo
  const handleView = (lancamento) => {
    console.log("Visualizar lançamento:", lancamento);
    handleEdit(lancamento);
  };

  // ✅ CORREÇÃO: Função para obter nome da emenda
  const getEmendaDisplayName = () => {
    if (!filtroInicial?.emendaId) return "";

    const emenda = emendas.find((e) => e.id === filtroInicial.emendaId);
    if (emenda) {
      return `${emenda.numero} - ${emenda.parlamentar}`;
    }

    // Fallback: Se não encontrou a emenda, usar dados do filtroInicial
    if (filtroInicial.numero && filtroInicial.parlamentar) {
      return `${filtroInicial.numero} - ${filtroInicial.parlamentar}`;
    }

    // Último fallback: usar ID
    return filtroInicial.emendaId;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Carregando lançamentos...</p>
      </div>
    );
  }

  if (lancamentos.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>💰</div>
          <h2 style={styles.emptyTitle}>Nenhum lançamento registrado</h2>
          <p style={styles.emptyText}>
            Clique em "Novo Lançamento" para começar a registrar despesas.
          </p>
          {onNovoLancamento && (
            <button onClick={onNovoLancamento} style={styles.emptyButton}>
              ➕ Novo Lançamento
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ✅ CORREÇÃO: Banner informativo com nome da emenda */}
      {filtroInicial?.emendaId && (
        <div style={styles.filtroAutomaticoInfo}>
          <span style={styles.filtroIcon}>🔍</span>
          <span style={styles.filtroTexto}>
            Exibindo lançamentos da emenda:{" "}
            <strong>{getEmendaDisplayName()}</strong>
          </span>
        </div>
      )}

      {/* Componente de Filtros */}
      <LancamentosFilters
        lancamentos={lancamentos}
        emendas={emendas}
        onFilter={handleFilter}
        onClear={handleClearFilters}
        filtroInicial={filtroInicial}
      />

      {/* Componente da Tabela com todos os handlers */}
      <LancamentosTable
        lancamentos={lancamentosFiltrados}
        emendas={emendas}
        totalLancamentos={lancamentos.length}
        loading={loading}
        usuario={usuario}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAbrirFluxo={handleView}
      />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: GRAY,
    borderRadius: 12,
    padding: "20px",
    gap: "16px",
    display: "flex",
    flexDirection: "column",
    marginTop: 32,
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    color: "#666",
  },

  loadingSpinner: {
    width: 40,
    height: 40,
    border: "4px solid #e3e3e3",
    borderTop: "4px solid #154360",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 16,
  },

  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.5,
  },

  emptyTitle: {
    color: "#154360",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },

  emptyText: {
    color: "#666",
    fontSize: 16,
    margin: "0 0 24px 0",
  },

  emptyButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },

  // ✅ CORREÇÃO: Estilos para banner de filtro automático melhorados
  filtroAutomaticoInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: "#e3f2fd",
    border: "1px solid #90caf9",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    color: "#1565c0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  filtroIcon: {
    fontSize: 16,
  },

  filtroTexto: {
    fontSize: 14,
    lineHeight: 1.4,
  },
};

// CSS Animation para o spinner
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
