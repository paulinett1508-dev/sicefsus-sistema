// Despesas.jsx - Sistema SICEFSUS v2.1 - COM FILTRO POR MUNICÍPIO
// ✅ CORREÇÃO PRINCIPAL: Implementação de filtro por município para operadores
// ✅ MANTIDO: Layout e interface originais
// ✅ MANTIDO: Toda a estrutura de componentes existente
// ✅ NOVA LÓGICA: Despesas filtradas por município do usuário operador

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  deleteDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import DespesaForm from "./DespesaForm";
import DespesasList from "./DespesasList";
import Toast from "./Toast";

const Despesas = ({ usuario }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("listagem");
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [filtroAutomatico, setFiltroAutomatico] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Função para carregar despesas com filtro (mantida original)
  const carregarDespesasComFiltro = useCallback(async (filtro) => {
    if (!filtro) return;

    try {
      console.log("🔍 Carregando despesas com filtros:", filtro);

      const despesasQuery = query(
        collection(db, "despesas"),
        where("emendaId", "==", filtro.emendaId),
      );

      const despesasSnapshot = await getDocs(despesasQuery);
      const despesasData = [];

      despesasSnapshot.forEach((doc) => {
        despesasData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("✅ Despesas filtradas carregadas:", despesasData.length);
      setDespesasFiltradas(despesasData);
    } catch (error) {
      console.error("❌ Erro ao carregar despesas filtradas:", error);
    }
  }, []);

  // ✅ CORREÇÃO: Função de recarregamento atualizada com filtro por município
  const recarregar = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Recarregando dados com filtro por município...");

      // Recarregar emendas baseado no role
      let emendasPermitidas = [];
      let emendasData = [];

      if (userRole === "admin") {
        const emendasQuery = query(collection(db, "emendas"));
        const emendasSnapshot = await getDocs(emendasQuery);

        emendasSnapshot.forEach((doc) => {
          const emendaData = { id: doc.id, ...doc.data() };
          emendasData.push(emendaData);
          emendasPermitidas.push(doc.id);
        });
      } else if (userRole === "operador" && userMunicipio) {
        const emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", userMunicipio)
        );
        const emendasSnapshot = await getDocs(emendasQuery);

        emendasSnapshot.forEach((doc) => {
          const emendaData = { id: doc.id, ...doc.data() };
          emendasData.push(emendaData);
          emendasPermitidas.push(doc.id);
        });
      }

      setEmendas(emendasData);

      // Recarregar despesas das emendas permitidas
      let despesasData = [];

      if (emendasPermitidas.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < emendasPermitidas.length; i += batchSize) {
          const batch = emendasPermitidas.slice(i, i + batchSize);
          const despesasQuery = query(
            collection(db, "despesas"),
            where("emendaId", "in", batch)
          );
          const despesasSnapshot = await getDocs(despesasQuery);

          despesasSnapshot.forEach((doc) => {
            despesasData.push({ id: doc.id, ...doc.data() });
          });
        }
      }

      setDespesas(despesasData);

      if (filtroAutomatico) {
        carregarDespesasComFiltro(filtroAutomatico);
      } else {
        setDespesasFiltradas(despesasData);
      }

      console.log("✅ Dados recarregados com sucesso");
    } catch (error) {
      console.error("❌ Erro ao recarregar:", error);
      setError(`Erro ao recarregar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [filtroAutomatico, carregarDespesasComFiltro, userRole, userMunicipio]);

  // Handlers (mantidos originais)
  const handleVisualizar = (despesa) => {
    console.log("👁️ Visualizando despesa:", despesa.id);
    setDespesaSelecionada(despesa);
    setCurrentView("visualizar");
  };

  const handleEditar = (despesa) => {
    console.log("✏️ Editando despesa:", despesa.id);
    setDespesaSelecionada(despesa);
    setCurrentView("editar");
  };

  const handleCriar = () => {
    console.log("➕ Criando nova despesa");
    setDespesaSelecionada(null);
    setCurrentView("criar");
  };

  const handleVoltar = () => {
    console.log("🔄 Voltando para listagem");
    setCurrentView("listagem");
    setDespesaSelecionada(null);
  };

  const handleSalvarDespesa = useCallback(
    async (dadosSalvos) => {
      console.log("📝 handleSalvarDespesa chamado com:", dadosSalvos);

      try {
        // ✅ CORREÇÃO: Usar função de recarregamento atualizada
        await recarregar();
        console.log("✅ Dados recarregados após salvamento");

        handleVoltar();
      } catch (error) {
        console.error("❌ Erro no handleSalvarDespesa:", error);
      }
    },
    [recarregar],
  );

  const handleDeletarDespesa = async (despesaId) => {
    console.log("🗑️ Deletar despesa ID:", despesaId);

    if (!despesaId) {
      alert("ID da despesa não encontrado!");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      try {
        await deleteDoc(doc(db, "despesas", despesaId));
        await recarregar();
        console.log("✅ Despesa deletada com sucesso:", despesaId);

        setToast({
          show: true,
          message: "Despesa deletada com sucesso!",
          type: "success",
        });
      } catch (error) {
        console.error("❌ Erro ao deletar despesa:", error);
        setToast({
          show: true,
          message: "Erro ao deletar despesa. Tente novamente.",
          type: "error",
        });
      }
    }
  };

  const handleLimparFiltros = () => {
    console.log("🧹 Limpando filtros");
    setFiltroAutomatico(null);
    setBreadcrumb(null);
    setDespesasFiltradas(despesas);

    // Limpar state da navegação
    navigate(location.pathname, { replace: true });
  };

  // Calcular estatísticas (mantido original)
  const despesasParaExibir = filtroAutomatico ? despesasFiltradas : despesas;
  const totalDespesas = despesasParaExibir.length;
  const valorTotal = despesasParaExibir.reduce((sum, despesa) => {
    const valor = parseFloat(despesa.valor) || 0;
    return sum + valor;
  }, 0);

  // ✅ Estatísticas de permissão para exibição
  const estatisticasPermissao = {
    totalEmendas: emendas.length,
    totalDespesas: despesas.length,
    municipioFiltrado: userRole === "operador" ? userMunicipio : null,
    tipoUsuario: userRole
  };

  // Renderização condicional (mantida original)
  const renderContent = () => {
    switch (currentView) {
      case "criar":
        return (
          <DespesaForm
            usuario={usuario}
            onCancelar={handleVoltar}
            onSalvar={handleSalvarDespesa}
            emendasDisponiveis={emendas}
            emendaPreSelecionada={filtroAutomatico?.emendaId}
            emendaInfo={filtroAutomatico}
            isPrimeiraDespesa={false}
          />
        );

      case "editar":
        return (
          <DespesaForm
            usuario={usuario}
            despesaParaEditar={despesaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleSalvarDespesa}
            emendasDisponiveis={emendas}
          />
        );

      case "visualizar":
        return (
          <DespesaForm
            usuario={usuario}
            despesaParaEditar={despesaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleVoltar}
            modoVisualizacao={true}
            emendasDisponiveis={emendas}
          />
        );

      default:
        return (
          <div>
            {/* Header com informações (atualizado com dados de permissão) */}
            <div style={styles.compactHeader}>
              <div style={styles.statusInfo}>
                <span style={styles.statusText}>Status:</span>
                <span style={styles.statusValue}>✅ Operacional</span>
                <span style={styles.divider}>|</span>
                <span style={styles.versionText}>Versão:</span>
                <span style={styles.versionValue}>v2.1</span>
                <span style={styles.divider}>|</span>
                <span style={styles.statusText}>Usuário:</span>
                <span style={styles.versionValue}>
                  {userRole === "admin" ? "👑 Admin" : `🏘️ ${userMunicipio}`}
                </span>
                <span style={styles.divider}>|</span>
                <span style={styles.statusText}>Dados:</span>
                <span style={styles.versionValue}>
                  {loading ? "Carregando..." : `${totalDespesas} despesas`}
                </span>
              </div>
            </div>

            {/* ✅ Banner de Informação de Permissões */}
            {userRole === "operador" && userMunicipio && (
              <div style={styles.permissaoInfo}>
                <span style={styles.permissaoIcon}>🔒</span>
                <div style={styles.permissaoContent}>
                  <span style={styles.permissaoTexto}>
                    <strong>Filtro Ativo:</strong> Exibindo apenas despesas de emendas do município <strong>{userMunicipio}/{userUf}</strong>
                  </span>
                  <span style={styles.permissaoSubtexto}>
                    {estatisticasPermissao.totalEmendas} emenda(s) • {estatisticasPermissao.totalDespesas} despesa(s) disponíveis para seu município
                  </span>
                </div>
              </div>
            )}

            {/* Breadcrumb (mantido original) */}
            {breadcrumb && (
              <div style={styles.breadcrumbContainer}>
                <div style={styles.breadcrumbContent}>
                  <span style={styles.breadcrumbItem}>
                    📋 {breadcrumb.origem}
                  </span>
                  <span style={styles.breadcrumbSeparator}>→</span>
                  <span style={styles.breadcrumbItem}>
                    📄 {breadcrumb.emenda}
                  </span>
                  <span style={styles.breadcrumbSeparator}>→</span>
                  <span style={styles.breadcrumbCurrent}>
                    💰 Despesas ({breadcrumb.totalDespesas})
                  </span>
                </div>
                <button
                  onClick={handleLimparFiltros}
                  style={styles.breadcrumbClearButton}
                >
                  🧹 Limpar Filtro
                </button>
              </div>
            )}

            {/* Estatísticas (mantidas originais) */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{totalDespesas}</h3>
                <p style={styles.statLabel}>
                  {filtroAutomatico
                    ? "DESPESAS DA EMENDA"
                    : userRole === "operador" 
                      ? `DESPESAS - ${userMunicipio}`
                      : "TOTAL DE DESPESAS"}
                </p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>
                  {despesasParaExibir.filter((d) => d.status === "pago").length}
                </h3>
                <p style={styles.statLabel}>DESPESAS PAGAS</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>
                  {
                    despesasParaExibir.filter((d) => d.status === "pendente")
                      .length
                  }
                </h3>
                <p style={styles.statLabel}>DESPESAS PENDENTES</p>
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

            {/* Botões de Ação (mantidos originais) */}
            <div style={styles.actionContainer}>
              <button style={styles.primaryButton} onClick={handleCriar}>
                ➕ Nova Despesa
              </button>
              <button
                style={styles.refreshButton}
                onClick={recarregar}
                disabled={loading}
              >
                🔄 {loading ? "Atualizando..." : "Atualizar"}
              </button>
            </div>

            {/* Lista de Despesas (mantida original) */}
            {loading ? (
              <div style={styles.loadingContainer}>
                <p style={styles.loadingText}>Carregando despesas...</p>
              </div>
            ) : error ? (
              <div style={styles.errorContainer}>
                <p style={styles.errorText}>❌ {error}</p>
                <button onClick={recarregar} style={styles.retryButton}>
                  🔄 Tentar novamente
                </button>
              </div>
            ) : totalDespesas === 0 ? (
              <div style={styles.emptyContainer}>
                <p style={styles.emptyText}>
                  {filtroAutomatico
                    ? "Esta emenda ainda não possui despesas cadastradas."
                    : userRole === "operador" 
                      ? `Nenhuma despesa encontrada para o município ${userMunicipio}.`
                      : "Nenhuma despesa cadastrada no sistema."}
                </p>
                {userRole === "operador" && totalDespesas === 0 && (
                  <p style={styles.emptySubtext}>
                    💡 Dica: Despesas são vinculadas a emendas. Verifique se existem emendas cadastradas para seu município.
                  </p>
                )}
              </div>
            ) : (
              <DespesasList
                despesas={despesasParaExibir}
                emendas={emendas}
                loading={loading}
                error={error}
                onEdit={handleEditar}
                onView={handleVisualizar}
                onDelete={handleDeletarDespesa}
                onRecarregar={recarregar} // ✅ NOVO: Callback para recarregar
                usuario={usuario}
                filtroInicial={filtroAutomatico}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
      {renderContent()}
    </div>
  );
};

// Estilos originais + novos estilos para permissões
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
  // ✅ NOVOS ESTILOS PARA BANNER DE PERMISSÕES
  permissaoInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#e8f5e8",
    border: "2px solid #4caf50",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#2e7d32",
    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.15)",
  },
  permissaoIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },
  permissaoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  permissaoTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },
  permissaoSubtexto: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
  },
  breadcrumbContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: "15px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "2px solid #2196f3",
  },
  breadcrumbContent: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  breadcrumbItem: {
    color: "#1565c0",
    fontWeight: "500",
    fontSize: "14px",
  },
  breadcrumbSeparator: {
    margin: "0 10px",
    color: "#1565c0",
    fontWeight: "bold",
  },
  breadcrumbCurrent: {
    color: "#1565c0",
    fontWeight: "bold",
    fontSize: "14px",
  },
  breadcrumbClearButton: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
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
    fontSize: "24px",
    fontWeight: "bold",
    color: "#154360",
    margin: "0 0 10px 0",
  },
  statLabel: {
    fontSize: "11px",
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
  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  emptyText: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "10px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#888",
    fontStyle: "italic",
  },
};

export default Despesas;