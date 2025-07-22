// Emendas.jsx - Sistema SICEFSUS v1.7 - CORRIGIDO (Sem Re-renders)
// Componente principal de gestão de emendas

import React, { useState, useEffect } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import EmendaForm from "./EmendaForm";
import EmendasTable from "./EmendasTable";
import DespesaForm from "./DespesaForm";
import useEmendaDespesa from "../hooks/useEmendaDespesa";

const Emendas = () => {
  const [currentView, setCurrentView] = useState("listagem");
  const [emendaSelecionada, setEmendaSelecionada] = useState(null);

  // ✅ Hook integrado - SEM autoRefresh para evitar loops
  const {
    emendas,
    loading,
    error,
    atualizarSaldoEmenda,
    obterEstatisticasGerais,
    recarregar,
  } = useEmendaDespesa(null, {
    carregarTodasEmendas: true,
    incluirEstatisticas: true,
    autoRefresh: false, // ✅ DESATIVADO para evitar loops
  });

  // ✅ UseEffect OTIMIZADO - só roda na primeira vez
  useEffect(() => {
    console.log("🎯 Sistema SICEFSUS v1.7 - Hook integrado carregado");
  }, []); // ✅ Array vazio = só roda uma vez

  // ✅ Log separado para dados (só quando realmente mudam) - OTIMIZADO
  useEffect(() => {
    const emendasLength = emendas?.length || 0;
    if (emendasLength > 0) {
      console.log("✅ Emendas carregadas via hook:", emendasLength);
    }
    if (error) {
      console.error("❌ Erro no hook:", error);
    }
  }, [emendas?.length, error]); // ✅ Dependências específicas

  // Handlers para navegação
  const handleVisualizar = (emenda) => {
    console.log("👁️ Visualizando emenda:", emenda.numero);
    setEmendaSelecionada(emenda);
    setCurrentView("visualizar");
  };

  const handleEditar = (emenda) => {
    console.log("✏️ Editando emenda:", emenda.numero);
    setEmendaSelecionada(emenda);
    setCurrentView("editar");
  };

  const handleCriar = () => {
    console.log("➕ Criando nova emenda");
    setEmendaSelecionada(null);
    setCurrentView("criar");
  };

  const handleVoltar = () => {
    console.log("🔄 Voltando para listagem");
    setCurrentView("listagem");
    setEmendaSelecionada(null);
  };

  const handleVoltarParaListagem = () => {
    if (currentView === "editar" || currentView === "criar") {
      if (
        window.confirm("Tem certeza que deseja sair sem salvar as alterações?")
      ) {
        handleVoltar();
      }
    } else {
      handleVoltar();
    }
  };

  // ✅ FUNÇÃO DELETAR IMPLEMENTADA CORRETAMENTE
  const handleDeletar = async (emendaId) => {
    console.log("🗑️ Deletar emenda ID:", emendaId);

    if (!emendaId) {
      alert("ID da emenda não encontrado!");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir esta emenda?")) {
      try {
        // ✅ Deletar do Firestore
        await deleteDoc(doc(db, "emendas", emendaId));

        // ✅ Recarregar dados
        await recarregar();

        console.log("✅ Emenda deletada com sucesso:", emendaId);
        alert("Emenda deletada com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao deletar emenda:", error);
        alert("Erro ao deletar emenda. Tente novamente.");
      }
    }
  };

  // Expor função para o menu externo
  window.voltarParaListagemEmendas = handleVoltarParaListagem;

  const handleDespesas = (emenda) => {
    console.log("💰 Gerenciar despesas:", emenda.numero);
    setEmendaSelecionada(emenda);
    setCurrentView("despesas");
  };

  // Cálculos para estatísticas usando o hook
  const estatisticas = obterEstatisticasGerais();
  const totalEmendas = estatisticas?.totalEmendas || emendas?.length || 0;
  const emendasComRecursos =
    emendas?.filter((e) => e.valorRecurso > 0).length || 0;
  const valorTotal =
    estatisticas?.valorTotalGeral ||
    emendas?.reduce((sum, e) => sum + (e.valorRecurso || 0), 0) ||
    0;

  // Renderização condicional baseada na view atual
  const renderContent = () => {
    switch (currentView) {
      case "criar":
        return (
          <EmendaForm
            onCancelar={handleVoltar}
            onSalvar={async () => {
              await recarregar(); // ✅ Recarregar após salvar
              handleVoltar();
            }}
            onListarEmendas={handleVoltar}
          />
        );

      case "editar":
        return (
          <EmendaForm
            emendaParaEditar={emendaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={async () => {
              await recarregar(); // ✅ Recarregar após salvar
              handleVoltar();
            }}
            onListarEmendas={handleVoltar}
          />
        );

      case "visualizar":
        return (
          <EmendaForm
            emendaParaEditar={emendaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleVoltar}
            onListarEmendas={handleVoltar}
            modoVisualizacao={true}
          />
        );

      case "despesas":
        return (
          <DespesaForm
            emendaId={emendaSelecionada?.id}
            onSalvar={async () => {
              // Sincronizar dados após salvar usando o hook
              if (emendaSelecionada?.id) {
                await atualizarSaldoEmenda(emendaSelecionada.id);
                await recarregar();
              }
              handleVoltar();
            }}
            onCancelar={handleVoltar}
            usuario={{ uid: "user123" }} // Ajustar conforme seu sistema de auth
          />
        );

      default:
        return (
          <div>
            {/* Header compacto apenas com status */}
            <div style={styles.compactHeader}>
              <div style={styles.statusInfo}>
                <span style={styles.statusText}>Status:</span>
                <span style={styles.statusValue}>✅ Operacional</span>
                <span style={styles.divider}>|</span>
                <span style={styles.versionText}>Versão:</span>
                <span style={styles.versionValue}>v1.7</span>
                <span style={styles.divider}>|</span>
                <span style={styles.statusText}>Dados:</span>
                <span style={styles.versionValue}>
                  {loading ? "Carregando..." : `${totalEmendas} emendas`}
                </span>
              </div>
            </div>

            {/* Estatísticas do Dashboard */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{totalEmendas}</h3>
                <p style={styles.statLabel}>TOTAL DE EMENDAS</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{emendasComRecursos}</h3>
                <p style={styles.statLabel}>EMENDAS COM RECURSOS</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>
                  {valorTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h3>
                <p style={styles.statLabel}>VALOR TOTAL</p>
              </div>
            </div>

            {/* Botão Nova Emenda */}
            <div style={styles.actionContainer}>
              <button style={styles.primaryButton} onClick={handleCriar}>
                ➕ Nova Emenda
              </button>
              <button
                style={styles.refreshButton}
                onClick={recarregar}
                disabled={loading}
              >
                🔄 {loading ? "Carregando..." : "Atualizar"}
              </button>
            </div>

            {/* Tabela de Emendas */}
            {loading ? (
              <div style={styles.loadingContainer}>
                <p style={styles.loadingText}>Carregando emendas...</p>
              </div>
            ) : error ? (
              <div style={styles.errorContainer}>
                <p style={styles.errorText}>❌ {error}</p>
                <button onClick={recarregar} style={styles.retryButton}>
                  🔄 Tentar novamente
                </button>
              </div>
            ) : (
              <EmendasTable
                emendas={emendas || []}
                onView={handleVisualizar}
                onEdit={handleEditar}
                onDelete={handleDeletar}
                onDespesas={handleDespesas}
              />
            )}
          </div>
        );
    }
  };

  return <div style={styles.container}>{renderContent()}</div>;
};

// Estilos do componente
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  compactHeader: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    background: "linear-gradient(135deg, #154360, #4A90E2)",
    color: "white",
    padding: "8px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    width: "100%",
  },
  statusInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
  },
  statusText: {
    fontWeight: "normal",
  },
  statusValue: {
    fontWeight: "500",
  },
  versionText: {
    fontWeight: "normal",
  },
  versionValue: {
    fontWeight: "500",
  },
  divider: {
    opacity: 0.7,
    margin: "0 4px",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#154360",
    margin: "0 0 10px 0",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
  actionContainer: {
    marginBottom: "20px",
    display: "flex",
    gap: "10px",
  },
  primaryButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  refreshButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "40px",
  },
  loadingText: {
    fontSize: "18px",
    color: "#666",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#f8d7da",
    borderRadius: "8px",
    border: "1px solid #f5c6cb",
  },
  errorText: {
    fontSize: "16px",
    color: "#721c24",
    marginBottom: "15px",
  },
  retryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default Emendas;
