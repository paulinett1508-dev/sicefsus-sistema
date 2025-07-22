// Emendas.jsx - Componente Principal de Gestão de Emendas
// Sistema Integrado de Gestão de Emendas Parlamentares v5.3

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import EmendaForm from "./EmendaForm";
import EmendasFilters from "./EmendasFilters";
import EmendasTable from "./EmendasTable";
import ConfirmationModal from "./ConfirmationModal";
import TemporaryBanner from "./TemporaryBanner";

const Emendas = ({ usuario }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados principais
  const [emendas, setEmendas] = useState([]);
  const [emendasFiltradas, setEmendasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de controle de navegação
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [emendaParaEditar, setEmendaParaEditar] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Estados de controle de ações
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emendaParaDeletar, setEmendaParaDeletar] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerType, setBannerType] = useState("success");

  // ✅ SEMPRE MOSTRAR LISTAGEM QUANDO ACESSAR /emendas
  useEffect(() => {
    setMostrarFormulario(false);
    setEmendaParaEditar(null);
    setModoEdicao(false);
  }, []);

  // Carregar emendas do Firestore
  useEffect(() => {
    carregarEmendas();
  }, []);

  // Listener em tempo real para mudanças nas emendas
  useEffect(() => {
    const emendasRef = collection(db, "emendas");
    const q = query(emendasRef, orderBy("numero", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const emendasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmendas(emendasData);
        setEmendasFiltradas(emendasData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar emendas em tempo real:", error);
        setError("Erro ao carregar emendas");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const carregarEmendas = async () => {
    try {
      setLoading(true);
      const emendasRef = collection(db, "emendas");
      const q = query(emendasRef, orderBy("numero", "desc"));
      const snapshot = await getDocs(q);

      const emendasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEmendas(emendasData);
      setEmendasFiltradas(emendasData);
      setError(null);
    } catch (error) {
      console.error("Erro ao carregar emendas:", error);
      setError("Erro ao carregar emendas. Tente recarregar a página.");
      mostrarBanner("Erro ao carregar emendas", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA VOLTAR À LISTAGEM
  const voltarParaListagem = () => {
    setMostrarFormulario(false);
    setEmendaParaEditar(null);
    setModoEdicao(false);

    // Atualizar URL sem recarregar a página
    if (location.pathname !== "/emendas") {
      navigate("/emendas", { replace: true });
    }
  };

  const handleNovaEmenda = () => {
    setEmendaParaEditar(null);
    setModoEdicao(false);
    setMostrarFormulario(true);

    // Atualizar URL
    window.history.pushState(null, "", "/emendas/nova");
  };

  const handleEditarEmenda = (emenda) => {
    setEmendaParaEditar(emenda);
    setModoEdicao(true);
    setMostrarFormulario(true);

    // Atualizar URL
    window.history.pushState(null, "", `/emendas/editar/${emenda.id}`);
  };

  const handleVisualizarEmenda = (emenda) => {
    setEmendaParaEditar(emenda);
    setModoEdicao(false);
    setMostrarFormulario(true);

    // Atualizar URL
    window.history.pushState(null, "", `/emendas/visualizar/${emenda.id}`);
  };

  const handleDeletarEmenda = (emenda) => {
    setEmendaParaDeletar(emenda);
    setShowDeleteModal(true);
  };

  const confirmarDelecao = async () => {
    if (!emendaParaDeletar) return;

    try {
      await deleteDoc(doc(db, "emendas", emendaParaDeletar.id));
      mostrarBanner(
        `Emenda ${emendaParaDeletar.numero} deletada com sucesso!`,
        "success",
      );

      // Atualizar lista local
      const novasEmendas = emendas.filter((e) => e.id !== emendaParaDeletar.id);
      setEmendas(novasEmendas);
      setEmendasFiltradas(novasEmendas);
    } catch (error) {
      console.error("Erro ao deletar emenda:", error);
      mostrarBanner("Erro ao deletar emenda", "error");
    } finally {
      setShowDeleteModal(false);
      setEmendaParaDeletar(null);
    }
  };

  const handleFluxoEmenda = (emenda) => {
    navigate(`/emendas/${emenda.id}/fluxo`);
  };

  const handleLancamentos = (emenda) => {
    navigate("/lancamentos", {
      state: {
        emendaSelecionada: emenda,
      },
    });
  };

  const mostrarBanner = (mensagem, tipo = "success") => {
    setBannerMessage(mensagem);
    setBannerType(tipo);
    setShowBanner(true);
  };

  const handleFiltroChange = (emendasFiltradas) => {
    setEmendasFiltradas(emendasFiltradas);
  };

  const handleSalvarEmenda = () => {
    voltarParaListagem();
    mostrarBanner(
      modoEdicao
        ? "Emenda atualizada com sucesso!"
        : "Emenda criada com sucesso!",
      "success",
    );
    carregarEmendas(); // Recarregar para garantir dados atualizados
  };

  // Estatísticas para o header
  const calcularEstatisticas = () => {
    if (!emendas.length) return { total: 0, valorTotal: 0, executado: 0 };

    const total = emendas.length;
    const valorTotal = emendas.reduce(
      (acc, emenda) => acc + (parseFloat(emenda.valorTotal) || 0),
      0,
    );
    const executado = emendas.reduce(
      (acc, emenda) => acc + (parseFloat(emenda.executado) || 0),
      0,
    );

    return { total, valorTotal, executado };
  };

  const stats = calcularEstatisticas();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Carregando emendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3 style={styles.errorTitle}>❌ Erro ao carregar dados</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={carregarEmendas} style={styles.retryButton}>
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Banner Temporário */}
      <TemporaryBanner
        message={bannerMessage}
        isVisible={showBanner}
        onClose={() => setShowBanner(false)}
        type={bannerType}
      />

      {!mostrarFormulario ? (
        // ✅ MOSTRAR LISTAGEM
        <div>
          {/* Header com Estatísticas */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <h1 style={styles.title}>📋 Gestão de Emendas Parlamentares</h1>
            </div>

            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>{stats.total}</span>
                <span style={styles.statLabel}>Total de Emendas</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>
                  R${" "}
                  {stats.valorTotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span style={styles.statLabel}>Valor Total</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>
                  {stats.valorTotal > 0
                    ? ((stats.executado / stats.valorTotal) * 100).toFixed(1)
                    : 0}
                  %
                </span>
                <span style={styles.statLabel}>Executado</span>
              </div>
            </div>
          </div>

          {/* Ações Principais */}
          <div style={styles.actionsContainer}>
            <button onClick={handleNovaEmenda} style={styles.primaryButton}>
              ➕ Nova Emenda
            </button>

            <button
              onClick={carregarEmendas}
              style={styles.secondaryButton}
              disabled={loading}
            >
              🔄 Atualizar Lista
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              style={styles.tertiaryButton}
            >
              📊 Ver Dashboard
            </button>
          </div>

          {/* Sistema de Filtros */}
          <EmendasFilters
            emendas={emendas}
            onFiltroChange={handleFiltroChange}
          />

          {/* Tabela de Emendas */}
          <div style={styles.tableContainer}>
            {emendasFiltradas.length > 0 ? (
              <EmendasTable
                emendas={emendasFiltradas}
                onEditar={handleEditarEmenda}
                onVisualizar={handleVisualizarEmenda}
                onDeletar={handleDeletarEmenda}
                onFluxo={handleFluxoEmenda}
                onLancamentos={handleLancamentos}
                loading={loading}
              />
            ) : (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📋</span>
                <h3 style={styles.emptyTitle}>Nenhuma emenda encontrada</h3>
                <p style={styles.emptyMessage}>
                  {emendas.length === 0
                    ? "Comece criando sua primeira emenda parlamentar."
                    : "Nenhuma emenda corresponde aos filtros aplicados."}
                </p>
                {emendas.length === 0 && (
                  <button
                    onClick={handleNovaEmenda}
                    style={styles.primaryButton}
                  >
                    ➕ Criar Primeira Emenda
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        // ✅ MOSTRAR FORMULÁRIO
        <EmendaForm
          emendaParaEditar={emendaParaEditar}
          onCancelar={voltarParaListagem}
          onSalvar={handleSalvarEmenda}
          onListarEmendas={voltarParaListagem}
          modoEdicao={modoEdicao}
          usuario={usuario}
        />
      )}

      {/* Modal de Confirmação de Deleção */}
      <ConfirmationModal
        isVisible={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setEmendaParaDeletar(null);
        }}
        onConfirm={confirmarDelecao}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja deletar a emenda ${emendaParaDeletar?.numero}? Esta ação não pode ser desfeita.`}
        confirmText="Sim, deletar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "20px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    backgroundColor: "white",
    borderRadius: "12px",
    margin: "20px",
    boxShadow: "0 4px 20px rgba(20, 67, 96, 0.08)",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e3e3e3",
    borderTop: "4px solid #4A90E2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#6c757d",
    fontWeight: "500",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    backgroundColor: "white",
    borderRadius: "12px",
    margin: "20px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(20, 67, 96, 0.08)",
  },
  errorTitle: {
    color: "#dc3545",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "15px",
  },
  errorMessage: {
    color: "#6c757d",
    fontSize: "16px",
    marginBottom: "25px",
    maxWidth: "400px",
  },
  retryButton: {
    background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  header: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(20, 67, 96, 0.08)",
    marginBottom: "25px",
  },
  headerContent: {
    marginBottom: "25px",
  },
  title: {
    color: "#154360",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    margin: "0",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "16px",
    margin: "0",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#154360",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500",
  },
  actionsContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  secondaryButton: {
    background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tertiaryButton: {
    background: "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(20, 67, 96, 0.08)",
    overflow: "hidden",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "15px",
    margin: "0 0 15px 0",
  },
  emptyMessage: {
    fontSize: "16px",
    color: "#6c757d",
    marginBottom: "30px",
    maxWidth: "400px",
    lineHeight: "1.5",
    margin: "0 0 30px 0",
  },
};

// CSS adicional para animações
const additionalCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.primaryButton:hover,
.secondaryButton:hover,
.tertiaryButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.primaryButton:active,
.secondaryButton:active,
.tertiaryButton:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .actionsContainer {
    flex-direction: column;
  }

  .primaryButton,
  .secondaryButton,
  .tertiaryButton {
    width: 100%;
    justify-content: center;
  }

  .statsContainer {
    grid-template-columns: 1fr;
  }
}
`;

// Inserir CSS dinamicamente
if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("emendas-styles");
  if (!existingStyle) {
    const style = document.createElement("style");
    style.id = "emendas-styles";
    style.textContent = additionalCSS;
    document.head.appendChild(style);
  }
}

export default Emendas;
