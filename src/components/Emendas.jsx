// Emendas.jsx - Design Moderno v3.0
// ✅ Layout baseado no template Tailwind
// ✅ Stat cards com ícones modernos
// ✅ Toolbar com filtros e busca
// ✅ Integração com EmendasTable v3.0

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext";
import EmendasTable from "./EmendasTable";
import Toast from "./Toast";
import ModalExclusaoEmenda from "./emenda/ModalExclusaoEmenda";

// Função auxiliar para parsear valores monetários
const parseValorMonetario = (valor) => {
  if (!valor && valor !== 0) return 0;
  if (typeof valor === "number") return valor;
  const valorString = String(valor);
  const numero = valorString
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const valorFloat = parseFloat(numero);
  return isNaN(valorFloat) ? 0 : valorFloat;
};

const Emendas = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  // Estados principais
  const [emendas, setEmendas] = useState([]);
  const [emendasFiltradas, setEmendasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Estados do modal de exclusão
  const [modalExclusao, setModalExclusao] = useState({
    isOpen: false,
    emenda: null,
    loading: false,
  });

  const userRole = user?.tipo || "operador";
  const userMunicipio = user?.municipio;
  const userUf = user?.uf;
  const userEmail = user?.email;

  // Loading do usuário
  if (userLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Carregando...</p>
      </div>
    );
  }

  // Validação do usuário
  if (!user || !userEmail) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Erro ao carregar dados do usuário...</p>
      </div>
    );
  }

  // Carregar dados
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let emendasQuery;
      let despesasQuery;

      if (userRole === "admin") {
        emendasQuery = collection(db, "emendas");
        despesasQuery = collection(db, "despesas");
      } else {
        emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", userMunicipio),
          where("uf", "==", userUf)
        );
        despesasQuery = query(
          collection(db, "despesas"),
          where("municipio", "==", userMunicipio),
          where("uf", "==", userUf)
        );
      }

      const [emendasSnapshot, despesasSnapshot] = await Promise.all([
        getDocs(emendasQuery),
        getDocs(despesasQuery),
      ]);

      const emendasData = emendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const despesasData = despesasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calcular execução
      const emendasComExecucao = emendasData.map((emenda) => {
        const despesasEmenda = despesasData.filter(
          (despesa) => despesa.emendaId === emenda.id
        );

        const valorTotal = parseValorMonetario(
          emenda.valorTotal || emenda.valorRecurso || emenda.valor || 0
        );

        const valorExecutado = despesasEmenda
          .filter((d) => d.status !== "PLANEJADA")
          .reduce((acc, despesa) => acc + parseValorMonetario(despesa.valor), 0);

        const saldoDisponivel = valorTotal - valorExecutado;
        const percentualExecutado =
          valorTotal > 0
            ? parseFloat(((valorExecutado / valorTotal) * 100).toFixed(1))
            : 0;

        return {
          ...emenda,
          valorTotal,
          valorExecutado,
          saldoDisponivel,
          percentualExecutado,
          totalDespesas: despesasEmenda.length,
        };
      });

      const emendasOrdenadas = emendasComExecucao.sort((a, b) => {
        const dataA = a.criadoEm?.seconds || 0;
        const dataB = b.criadoEm?.seconds || 0;
        return dataB - dataA;
      });

      setEmendas(emendasOrdenadas);
      setEmendasFiltradas(emendasOrdenadas);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [userRole, userMunicipio, userUf]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Filtrar por busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setEmendasFiltradas(emendas);
      return;
    }

    const termo = searchTerm.toLowerCase();
    const filtradas = emendas.filter(
      (e) =>
        (e.numero || "").toLowerCase().includes(termo) ||
        (e.parlamentar || "").toLowerCase().includes(termo) ||
        (e.municipio || "").toLowerCase().includes(termo) ||
        (e.objeto || "").toLowerCase().includes(termo)
    );
    setEmendasFiltradas(filtradas);
    setCurrentPage(1);
  }, [searchTerm, emendas]);

  // Handlers
  const handleCriar = () => navigate("/emendas/novo");
  const handleEditar = (emenda) => navigate(`/emendas/${emenda.id}`);

  const handleDeletar = (emendaParam) => {
    let emendaObj =
      typeof emendaParam === "string"
        ? emendas.find((e) => e.id === emendaParam)
        : emendaParam;

    if (!emendaObj?.id) {
      setToast({ show: true, message: "Emenda não encontrada!", type: "error" });
      return;
    }

    setModalExclusao({ isOpen: true, emenda: emendaObj, loading: false });
  };

  const handleConfirmarExclusao = async () => {
    if (!modalExclusao.emenda?.id) return;

    if (userRole === "operador") {
      setToast({
        show: true,
        message: "Operadores não podem excluir emendas!",
        type: "error",
      });
      setModalExclusao({ isOpen: false, emenda: null, loading: false });
      return;
    }

    try {
      setModalExclusao((prev) => ({ ...prev, loading: true }));
      await deleteDoc(doc(db, "emendas", modalExclusao.emenda.id));

      setEmendas((prev) => prev.filter((e) => e.id !== modalExclusao.emenda.id));
      setEmendasFiltradas((prev) =>
        prev.filter((e) => e.id !== modalExclusao.emenda.id)
      );
      setModalExclusao({ isOpen: false, emenda: null, loading: false });
      setToast({ show: true, message: "Emenda excluída com sucesso!", type: "success" });
    } catch (error) {
      setModalExclusao((prev) => ({ ...prev, loading: false }));
      setToast({ show: true, message: `Erro: ${error.message}`, type: "error" });
    }
  };

  // Estatísticas
  const totalEmendas = emendasFiltradas.length;
  const emendasExecutadas = emendasFiltradas.filter(
    (e) => e.percentualExecutado >= 100
  ).length;
  const emendasAtivas = emendasFiltradas.filter(
    (e) => e.percentualExecutado > 0 && e.percentualExecutado < 100
  ).length;
  const valorTotal = emendasFiltradas.reduce(
    (acc, e) => acc + (e.valorTotal || 0),
    0
  );

  // Loading
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Carregando emendas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* Modal de exclusão */}
      <ModalExclusaoEmenda
        isOpen={modalExclusao.isOpen}
        emenda={modalExclusao.emenda}
        loading={modalExclusao.loading}
        userRole={userRole}
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setModalExclusao({ isOpen: false, emenda: null, loading: false })}
      />

      {/* Info Bar */}
      <div style={styles.infoBar}>
        <div style={styles.infoContent}>
          <span style={styles.flagIcon}>🇧🇷</span>
          <span style={styles.infoLabel}>Sistema Ativo</span>
          <span style={styles.infoDivider}>|</span>
          <span style={styles.infoText}>Último acesso: Hoje</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {/* Total de Emendas */}
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total de Emendas</p>
            <h3 style={styles.statNumber}>{totalEmendas}</h3>
          </div>
          <div style={{ ...styles.statIcon, backgroundColor: "rgba(37, 99, 235, 0.1)", color: "#2563EB" }}>
            <span className="material-symbols-outlined">assignment</span>
          </div>
        </div>

        {/* Executadas */}
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Executadas</p>
            <h3 style={{ ...styles.statNumber, color: "#6366F1" }}>{emendasExecutadas}</h3>
          </div>
          <div style={{ ...styles.statIcon, backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#6366F1" }}>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>

        {/* Emendas Ativas */}
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Emendas Ativas</p>
            <h3 style={{ ...styles.statNumber, color: "#10B981" }}>{emendasAtivas}</h3>
          </div>
          <div style={{ ...styles.statIcon, backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
            <span className="material-symbols-outlined">play_circle</span>
          </div>
        </div>

        {/* Valor Total */}
        <div style={styles.statCardDark}>
          <div style={styles.statIconBg}>
            <span className="material-symbols-outlined icon-xl" style={{ opacity: 0.1 }}>payments</span>
          </div>
          <p style={styles.statLabelLight}>Valor Total</p>
          <h3 style={styles.statNumberLight}>
            {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </h3>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <button style={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <span className="material-symbols-outlined icon-sm">tune</span>
            <span style={styles.filterText}>Filtros Avançados</span>
            {searchTerm && <span style={styles.filterBadge}>1</span>}
          </button>
        </div>

        <div style={styles.toolbarRight}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <span className="material-symbols-outlined icon-sm" style={styles.searchIcon}>search</span>
            <input
              type="text"
              placeholder="Pesquisa rápida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Nova Emenda */}
          <button style={styles.primaryButton} onClick={handleCriar}>
            <span className="material-symbols-outlined icon-sm">add</span>
            <span style={styles.buttonText}>Nova Emenda</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>⚠️</span>
          <div>
            <h3 style={styles.errorTitle}>Erro ao carregar emendas</h3>
            <p style={styles.errorText}>{error}</p>
          </div>
          <button style={styles.retryButton} onClick={carregarDados}>
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Table */}
      {totalEmendas === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>Nenhuma emenda encontrada</h3>
          <p style={styles.emptyText}>
            {searchTerm
              ? "Ajuste sua pesquisa para encontrar resultados."
              : "Clique em 'Nova Emenda' para começar."}
          </p>
        </div>
      ) : (
        <EmendasTable
          emendas={emendasFiltradas}
          onEdit={handleEditar}
          onDelete={handleDeletar}
          currentPage={currentPage}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Footer */}
      <div style={styles.footer}>
        © 2025 SICEFSUS - Sistema Integrado de Controle de Emendas.
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "16px 32px",
    backgroundColor: "var(--theme-bg, #F8FAFC)",
    minHeight: "100vh",
    fontFamily: "var(--font-family, 'Inter', sans-serif)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid var(--gray-200, #E2E8F0)",
    borderTop: "3px solid var(--primary, #2563EB)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "var(--gray-500, #64748B)",
    fontSize: "14px",
  },
  // Info Bar
  infoBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
    padding: "8px 16px",
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "8px",
    border: "1px solid var(--theme-border, #E2E8F0)",
    boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
    width: "fit-content",
  },
  infoContent: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "var(--gray-500, #64748B)",
  },
  flagIcon: {
    fontSize: "16px",
  },
  infoLabel: {
    fontWeight: "500",
    color: "var(--gray-700, #334155)",
  },
  infoDivider: {
    color: "var(--gray-300, #CBD5E1)",
  },
  infoText: {
    color: "var(--gray-500, #64748B)",
  },
  // Stats Grid
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid var(--theme-border, #E2E8F0)",
    boxShadow: "var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.05))",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    transition: "border-color 0.2s ease",
  },
  statCardDark: {
    background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #334155",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  statIconBg: {
    position: "absolute",
    top: "0",
    right: "0",
    padding: "12px",
    color: "#ffffff",
  },
  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--gray-400, #94A3B8)",
    margin: 0,
  },
  statLabelLight: {
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#94A3B8",
    margin: 0,
    position: "relative",
    zIndex: 1,
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--gray-800, #1E293B)",
    margin: 0,
  },
  statNumberLight: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
    position: "relative",
    zIndex: 1,
  },
  statIcon: {
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Toolbar
  toolbar: {
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "12px",
    border: "1px solid var(--theme-border, #E2E8F0)",
    boxShadow: "var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.05))",
    padding: "16px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    justifyContent: "flex-end",
  },
  filterButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "transparent",
    border: "1px solid var(--theme-border, #E2E8F0)",
    borderRadius: "8px",
    cursor: "pointer",
    color: "var(--primary, #2563EB)",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.15s ease",
    boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
  },
  filterText: {
    color: "var(--gray-700, #334155)",
  },
  filterBadge: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    color: "var(--primary, #2563EB)",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "9999px",
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
    maxWidth: "256px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--gray-400, #94A3B8)",
  },
  searchInput: {
    width: "100%",
    height: "36px",
    padding: "0 12px 0 40px",
    border: "1px solid var(--theme-border, #E2E8F0)",
    borderRadius: "8px",
    backgroundColor: "var(--gray-50, #F8FAFC)",
    fontSize: "14px",
    color: "var(--gray-900, #0F172A)",
    outline: "none",
    transition: "all 0.15s ease",
  },
  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "var(--primary, #2563EB)",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 2px rgba(37, 99, 235, 0.2)",
  },
  buttonText: {
    display: "inline",
  },
  // Error
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  errorIcon: {
    fontSize: "24px",
  },
  errorTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#DC2626",
    margin: 0,
  },
  errorText: {
    fontSize: "13px",
    color: "#DC2626",
    margin: "4px 0 0 0",
  },
  retryButton: {
    marginLeft: "auto",
    padding: "8px 16px",
    backgroundColor: "#DC2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  // Empty State
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "12px",
    border: "1px solid var(--theme-border, #E2E8F0)",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--gray-700, #334155)",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: "var(--gray-500, #64748B)",
    textAlign: "center",
  },
  // Footer
  footer: {
    marginTop: "32px",
    textAlign: "center",
    fontSize: "10px",
    color: "var(--gray-400, #94A3B8)",
    paddingBottom: "16px",
  },
};

// Adicionar keyframes para spinner
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.getElementById("emendas-keyframes")) {
    style.id = "emendas-keyframes";
    document.head.appendChild(style);
  }
}

export default Emendas;
