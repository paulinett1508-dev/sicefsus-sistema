// Lancamentos.jsx - v5.3 com Navegação Inteligente da Emenda
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import LancamentosList from "./LancamentosList";
import LancamentoForm from "./LancamentoForm";
import TemporaryBanner from "./TemporaryBanner";

const Lancamentos = ({ usuario }) => {
  const [lancamentos, setLancamentos] = useState([]);
  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("list");
  const [selectedLancamento, setSelectedLancamento] = useState(null);
  const [hasFormChanges, setHasFormChanges] = useState(false);

  // ✨ Estados para navegação inteligente
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [emendaSelecionada, setEmendaSelecionada] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ✨ Verificar se veio da navegação de uma emenda
  useEffect(() => {
    if (location.state) {
      const {
        novoLancamento,
        emendaSelecionada: emenda,
        lancamentosCount,
      } = location.state;

      if (novoLancamento && emenda) {
        // Veio do EmendaForm para criar novo lançamento
        setEmendaSelecionada(emenda);
        setCurrentView("form");

        // Mostrar banner informativo
        setBannerMessage(
          `📋 Criando lançamento para: ${emenda.numero} - ${emenda.parlamentar} ${lancamentosCount > 0 ? `(${lancamentosCount} existentes)` : "(primeiro lançamento)"}`,
        );
        setShowBanner(true);

        // Limpar state da navegação para não interferir em futuras navegações
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar lançamentos
      const lancamentosQuery = query(
        collection(db, "lancamentos"),
        orderBy("numero", "desc"),
      );
      const lancamentosSnapshot = await getDocs(lancamentosQuery);
      const lancamentosData = lancamentosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Carregar emendas
      const emendasQuery = query(
        collection(db, "emendas"),
        orderBy("numero", "desc"),
      );
      const emendasSnapshot = await getDocs(emendasQuery);
      const emendasData = emendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLancamentos(lancamentosData);
      setEmendas(emendasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✨ Verificar se pode navegar (proteção contra perda de dados)
  const canNavigate = () => {
    if (hasFormChanges) {
      const confirmacao = window.confirm(
        "⚠️ Existem alterações não salvas.\n\nDeseja realmente continuar e perder as alterações?",
      );
      return confirmacao;
    }
    return true;
  };

  // ✨ Handler para novo lançamento
  const handleNovoLancamento = () => {
    if (!canNavigate()) return;

    setSelectedLancamento(null);
    setEmendaSelecionada(null); // Limpar seleção anterior
    setCurrentView("form");
  };

  // ✨ Handler para editar lançamento
  const handleEditarLancamento = (lancamento) => {
    if (!canNavigate()) return;

    setSelectedLancamento(lancamento);
    setEmendaSelecionada(null); // Limpar seleção anterior
    setCurrentView("form");
  };

  // ✨ Handler para voltar à lista
  const handleBackToList = () => {
    if (!canNavigate()) return;

    setSelectedLancamento(null);
    setEmendaSelecionada(null);
    setCurrentView("list");
    setHasFormChanges(false);

    // Se tinha emenda selecionada, mostrar opção de voltar
    if (location.state?.emendaSelecionada) {
      setBannerMessage(
        '💡 Clique em "Voltar à Emenda" para retornar ao formulário anterior',
      );
      setShowBanner(true);
    }
  };

  // ✨ Handler para voltar à emenda (navegação reversa)
  const handleVoltarParaEmenda = () => {
    if (!canNavigate()) return;

    const emenda = location.state?.emendaSelecionada;
    if (emenda) {
      navigate("/emendas", {
        state: {
          editarEmenda: emenda,
          voltandoDeLancamentos: true,
        },
      });
    }
  };

  // Handler para salvar
  const handleSave = () => {
    loadData();
    setHasFormChanges(false);
  };

  // Handler para mudanças no formulário
  const handleFormChanges = (hasChanges) => {
    setHasFormChanges(hasChanges);
  };

  // Handler para excluir
  const handleExcluirLancamento = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "lancamentos", id));
      loadData();
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      alert("Erro ao excluir lançamento");
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Carregando lançamentos...</p>
      </div>
    );
  }

  return (
    <>
      {/* ✨ Banner para navegação contextual */}
      <TemporaryBanner
        isVisible={showBanner}
        message={bannerMessage}
        type="info"
        duration={5000}
        onClose={() => setShowBanner(false)}
      />

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>💰 Despesas Financeiras</h1>

            {/* ✨ Breadcrumb contextual */}
            {location.state?.emendaSelecionada && (
              <div style={styles.breadcrumb}>
                <span style={styles.breadcrumbItem}>
                  📋 Emenda: {location.state.emendaSelecionada.numero}
                </span>
                <span style={styles.breadcrumbSeparator}>→</span>
                <span style={styles.breadcrumbCurrent}>💰 Despesas</span>
              </div>
            )}
          </div>

          <div style={styles.headerActions}>
            {/* ✨ Botão para voltar à emenda (se veio de navegação) */}
            {location.state?.emendaSelecionada && currentView === "list" && (
              <button
                onClick={handleVoltarParaEmenda}
                style={styles.backToEmendaButton}
                title="Voltar ao formulário da emenda"
              >
                ← Voltar à Emenda
              </button>
            )}

            {currentView === "list" ? (
              <button onClick={handleNovaDespesa} style={styles.primaryButton}>
                ➕ Nova Despesa
              </button>
            ) : (
              <button
                onClick={handleBackToList}
                style={styles.secondaryButton}
                disabled={hasFormChanges && !canNavigate()}
              >
                ← Voltar à Lista
              </button>
            )}
          </div>
        </div>

        <div style={styles.content}>
          {currentView === "list" ? (
            <DespesasList
              despesas={despesas}
              emendas={emendas}
              usuario={usuario}
              onNovaDespesa={handleNovaDespesa}
              onEditarDespesa={handleEditarDespesa}
              onExcluirDespesa={handleExcluirDespesa}
              // ✨ Passar filtro automático se veio de uma emenda específica
              filtroInicial={
                location.state?.emendaSelecionada
                  ? {
                      emendaId: location.state.emendaSelecionada.id,
                    }
                  : null
              }
            />
          ) : (
            <DespesaForm
              despesa={selectedDespesa}
              emendas={emendas}
              usuario={usuario}
              onBack={handleBackToList}
              onSave={handleSave}
              onChanges={handleFormChanges}
              // ✨ Passar emenda selecionada para o formulário
              emendaSelecionada={emendaSelecionada}
            />
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  headerContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: 0,
  },

  // ✨ Estilos para breadcrumb contextual
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#6c757d",
  },

  breadcrumbItem: {
    color: "#007bff",
    backgroundColor: "#e3f2fd",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  },

  breadcrumbSeparator: {
    color: "#6c757d",
  },

  breadcrumbCurrent: {
    color: "#28a745",
    fontWeight: "500",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,123,255,0.3)",
  },

  secondaryButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },

  // ✨ Botão especial para voltar à emenda
  backToEmendaButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    boxShadow: "0 2px 4px rgba(40,167,69,0.3)",
  },

  content: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    textAlign: "center",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
};

export default Lancamentos;
