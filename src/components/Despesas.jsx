// Despesas.jsx - Sistema SICEFSUS v2.0 - FLUXO EMENDA->DESPESA CORRIGIDO
// ✅ CORREÇÃO: Filtro automático baseado em state navigation
// ✅ CORREÇÃO: Breadcrumb para navegação de volta
// ✅ CORREÇÃO: Contexto preservado da emenda de origem
// ✅ CORREÇÃO: Carregamento otimizado com filtros

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
import DespesasTable from "./DespesasTable";
import useEmendaDespesa from "../hooks/useEmendaDespesa";

const Despesas = ({ usuario }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("listagem");
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);

  // ✅ CORREÇÃO: Estados para filtro automático e breadcrumb
  const [filtroAutomatico, setFiltroAutomatico] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState(null);
  const [filtros, setFiltros] = useState({
    emendaId: "",
    busca: "",
    parlamentar: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  });

  // ✅ Dados do usuário
  const userRole = usuario?.role;
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  console.log("✅ Sistema SICEFSUS v2.0 - Despesas - Dados do usuário:", {
    email: usuario?.email,
    role: userRole,
    municipio: userMunicipio,
    uf: userUf,
  });

  // ✅ Hook para carregar despesas
  const { despesas, loading, error, atualizarSaldoEmenda, recarregar } =
    useEmendaDespesa(usuario, {
      carregarTodasEmendas: false, // Não carrega emendas aqui
      incluirEstatisticas: false,
      autoRefresh: true,
      userRole: userRole,
    });

  // ✅ Estados locais para despesas filtradas
  const [despesasFiltradas, setDespesasFiltradas] = useState([]);
  const [emendasDisponiveis, setEmendasDisponiveis] = useState([]);
  const [carregandoDespesas, setCarregandoDespesas] = useState(false);

  // ✅ CORREÇÃO PRINCIPAL: Aplicar filtro automático da navegação
  useEffect(() => {
    const { state } = location;
    if (state?.filtroAutomatico) {
      const filtro = state.filtroAutomatico;
      console.log("🎯 Aplicando filtro automático da emenda:", filtro);

      // Salvar filtro automático
      setFiltroAutomatico(filtro);

      // Aplicar filtros
      setFiltros((prev) => ({
        ...prev,
        emendaId: filtro.emendaId,
        busca: filtro.numeroEmenda || "",
        parlamentar: filtro.parlamentar || "",
      }));

      // Mostrar breadcrumb
      if (filtro.breadcrumb) {
        setBreadcrumb(filtro.breadcrumb);
        console.log("🍞 Breadcrumb configurado:", filtro.breadcrumb);
      }

      // Carregar despesas filtradas automaticamente
      carregarDespesasFiltradas(filtro);

      // Limpar state para evitar reaplicação
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // ✅ Função para carregar despesas com filtros
  const carregarDespesasFiltradas = useCallback(
    async (filtroConfig = null) => {
      const filtroAtivo = filtroConfig || filtros;

      if (
        !filtroAtivo.emendaId &&
        !filtroAtivo.busca &&
        !filtroAtivo.parlamentar
      ) {
        // Se não há filtros específicos, carregar todas as despesas
        setDespesasFiltradas(despesas || []);
        return;
      }

      setCarregandoDespesas(true);
      console.log("🔍 Carregando despesas com filtros:", filtroAtivo);

      try {
        let despesasQuery = collection(db, "despesas");
        let constraints = [];

        // Filtro por emenda específica
        if (filtroAtivo.emendaId) {
          constraints.push(where("emendaId", "==", filtroAtivo.emendaId));
        }

        // Adicionar ordenação
        constraints.push(orderBy("data", "desc"));

        // Construir query
        if (constraints.length > 0) {
          despesasQuery = query(despesasQuery, ...constraints);
        }

        const snapshot = await getDocs(despesasQuery);
        let despesasCarregadas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Aplicar filtros adicionais no lado cliente
        if (filtroAtivo.busca) {
          const busca = filtroAtivo.busca.toLowerCase();
          despesasCarregadas = despesasCarregadas.filter(
            (despesa) =>
              despesa.numeroEmenda?.toLowerCase().includes(busca) ||
              despesa.descricao?.toLowerCase().includes(busca) ||
              despesa.fornecedor?.toLowerCase().includes(busca),
          );
        }

        if (filtroAtivo.parlamentar) {
          despesasCarregadas = despesasCarregadas.filter(
            (despesa) => despesa.parlamentar === filtroAtivo.parlamentar,
          );
        }

        if (filtroAtivo.status) {
          despesasCarregadas = despesasCarregadas.filter(
            (despesa) => despesa.status === filtroAtivo.status,
          );
        }

        console.log(
          "✅ Despesas filtradas carregadas:",
          despesasCarregadas.length,
        );
        setDespesasFiltradas(despesasCarregadas);
      } catch (error) {
        console.error("❌ Erro ao carregar despesas filtradas:", error);
        setDespesasFiltradas([]);
      } finally {
        setCarregandoDespesas(false);
      }
    },
    [filtros, despesas],
  );

  // ✅ Carregar emendas disponíveis para seleção
  const carregarEmendasDisponiveis = useCallback(async () => {
    try {
      let emendasQuery = collection(db, "emendas");
      let constraints = [];

      // Aplicar filtros de usuário se não for admin
      if (userRole !== "admin" && userMunicipio && userUf) {
        constraints.push(where("municipio", "==", userMunicipio));
        constraints.push(where("uf", "==", userUf));
      }

      constraints.push(orderBy("numero", "asc"));

      if (constraints.length > 0) {
        emendasQuery = query(emendasQuery, ...constraints);
      }

      const snapshot = await getDocs(emendasQuery);
      const emendasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEmendasDisponiveis(emendasData);
      console.log("📋 Emendas disponíveis carregadas:", emendasData.length);
    } catch (error) {
      console.error("❌ Erro ao carregar emendas:", error);
      setEmendasDisponiveis([]);
    }
  }, [userRole, userMunicipio, userUf]);

  // ✅ Carregar dados iniciais
  useEffect(() => {
    console.log("🎯 Sistema SICEFSUS v2.0 - Despesas carregado");
    carregarEmendasDisponiveis();
  }, [carregarEmendasDisponiveis]);

  // ✅ Recarregar despesas quando filtros mudarem
  useEffect(() => {
    if (!filtroAutomatico) {
      // Não recarregar se está usando filtro automático
      carregarDespesasFiltradas();
    }
  }, [filtros, carregarDespesasFiltradas, filtroAutomatico]);

  // ✅ Usar despesas filtradas ou todas as despesas
  const despesasParaExibir =
    despesasFiltradas.length > 0 || Object.values(filtros).some((v) => v)
      ? despesasFiltradas
      : despesas || [];

  // ✅ DEBUG: Log estados para diagnosticar problema de loading
  useEffect(() => {
    console.log("🔍 DESPESAS DEBUG:", {
      hookLoading: loading,
      carregandoDespesas,
      despesasHookLength: (despesas || []).length,
      despesasFiltradasLength: despesasFiltradas.length,
      despesasParaExibirLength: despesasParaExibir.length,
      temFiltros: Object.values(filtros).some((v) => v),
      filtroAutomatico: !!filtroAutomatico
    });
  }, [loading, carregandoDespesas, despesas, despesasFiltradas, despesasParaExibir, filtros, filtroAutomatico]);

  // Handlers para navegação
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

  // ✅ Handler para salvar despesa
  const handleSalvarDespesa = useCallback(
    async (dadosSalvos) => {
      console.log("📝 handleSalvarDespesa chamado com:", dadosSalvos);

      try {
        // Atualizar saldo da emenda se houver emendaId
        if (dadosSalvos?.emendaId) {
          await atualizarSaldoEmenda(dadosSalvos.emendaId);
        }

        // Recarregar dados
        await recarregar();
        await carregarDespesasFiltradas();

        console.log("✅ Dados recarregados após salvamento");
        handleVoltar();
      } catch (error) {
        console.error("❌ Erro no handleSalvarDespesa:", error);
      }
    },
    [atualizarSaldoEmenda, recarregar, carregarDespesasFiltradas],
  );

  // ✅ Função deletar despesa
  const handleDeletar = async (despesaId) => {
    console.log("🗑️ Deletar despesa ID:", despesaId);

    if (!despesaId) {
      alert("ID da despesa não encontrado!");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      try {
        await deleteDoc(doc(db, "despesas", despesaId));
        await recarregar();
        await carregarDespesasFiltradas();
        console.log("✅ Despesa deletada com sucesso:", despesaId);
        alert("Despesa deletada com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao deletar despesa:", error);
        alert("Erro ao deletar despesa. Tente novamente.");
      }
    }
  };

  // ✅ Função para aplicar filtros
  const handleFiltroChange = (novosFiltros) => {
    console.log("🔍 Aplicando novos filtros:", novosFiltros);
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
    setFiltroAutomatico(null); // Limpar filtro automático quando usuário filtra manualmente
  };

  // ✅ Função para limpar filtros
  const limparFiltros = () => {
    console.log("🧹 Limpando filtros");
    setFiltros({
      emendaId: "",
      busca: "",
      parlamentar: "",
      status: "",
      dataInicio: "",
      dataFim: "",
    });
    setFiltroAutomatico(null);
    setBreadcrumb(null);
    setDespesasFiltradas([]);
  };

  // ✅ Renderizar breadcrumb
  const renderBreadcrumb = () => {
    if (!breadcrumb) return null;

    return (
      <div style={styles.breadcrumb}>
        <button
          onClick={() => navigate("/emendas")}
          style={styles.breadcrumbLink}
          title="Voltar para listagem de emendas"
        >
          📋 {breadcrumb.origem}
        </button>
        <span style={styles.breadcrumbSeparator}> › </span>
        <span style={styles.breadcrumbCurrent}>
          💰 Despesas: {breadcrumb.emenda}
        </span>
        {breadcrumb.totalDespesas && (
          <span style={styles.breadcrumbCount}>
            ({breadcrumb.totalDespesas} despesa
            {breadcrumb.totalDespesas !== 1 ? "s" : ""})
          </span>
        )}
      </div>
    );
  };

  // ✅ Renderizar filtros
  const renderFiltros = () => {
    return (
      <div style={styles.filtrosContainer}>
        <div style={styles.filtrosGrid}>
          <div style={styles.filtroGroup}>
            <label style={styles.filtroLabel}>Emenda:</label>
            <select
              value={filtros.emendaId}
              onChange={(e) => handleFiltroChange({ emendaId: e.target.value })}
              style={styles.filtroSelect}
            >
              <option value="">Todas as emendas</option>
              {emendasDisponiveis.map((emenda) => (
                <option key={emenda.id} value={emenda.id}>
                  {emenda.parlamentar} - {emenda.numero}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filtroGroup}>
            <label style={styles.filtroLabel}>Buscar:</label>
            <input
              type="text"
              value={filtros.busca}
              onChange={(e) => handleFiltroChange({ busca: e.target.value })}
              placeholder="Número, descrição, fornecedor..."
              style={styles.filtroInput}
            />
          </div>

          <div style={styles.filtroGroup}>
            <label style={styles.filtroLabel}>Status:</label>
            <select
              value={filtros.status}
              onChange={(e) => handleFiltroChange({ status: e.target.value })}
              style={styles.filtroSelect}
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="paga">Paga</option>
              <option value="rejeitada">Rejeitada</option>
            </select>
          </div>

          <div style={styles.filtroActions}>
            <button onClick={limparFiltros} style={styles.limparButton}>
              🧹 Limpar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Cálculos para estatísticas
  const totalDespesas = despesasParaExibir?.length || 0;
  const valorTotalDespesas =
    despesasParaExibir?.reduce((sum, d) => sum + (d.valor || 0), 0) || 0;
  const despesasPendentes =
    despesasParaExibir?.filter((d) => d.status === "pendente").length || 0;
  const despesasAprovadas =
    despesasParaExibir?.filter((d) => d.status === "aprovada").length || 0;
  const despesasPagas =
    despesasParaExibir?.filter((d) => d.status === "paga").length || 0;

  // Renderização condicional baseada na view atual
  const renderContent = () => {
    switch (currentView) {
      case "criar":
        return (
          <DespesaForm
            usuario={usuario}
            onCancelar={handleVoltar}
            onSalvar={handleSalvarDespesa}
            emendasDisponiveis={emendasDisponiveis}
            emendaPreSelecionada={filtroAutomatico?.emendaId} // ✅ CORREÇÃO: Passar emenda do filtro
            emendaInfo={
              filtroAutomatico
                ? {
                    numero: filtroAutomatico.numeroEmenda,
                    parlamentar: filtroAutomatico.parlamentar,
                    valorRecurso: filtroAutomatico.valorRecurso,
                  }
                : null
            }
          />
        );

      case "editar":
        return (
          <DespesaForm
            usuario={usuario}
            despesaParaEditar={despesaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleSalvarDespesa}
            emendasDisponiveis={emendasDisponiveis}
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
            emendasDisponiveis={emendasDisponiveis}
          />
        );

      default:
        return (
          <div>
            {/* Breadcrumb */}
            {renderBreadcrumb()}

            {/* Header com informações */}
            <div style={styles.compactHeader}>
              <div style={styles.statusInfo}>
                <span style={styles.statusText}>Status:</span>
                <span style={styles.statusValue}>✅ Operacional</span>
                <span style={styles.divider}>|</span>
                <span style={styles.versionText}>Versão:</span>
                <span style={styles.versionValue}>v2.0</span>
                <span style={styles.divider}>|</span>
                <span style={styles.statusText}>Dados:</span>
                <span style={styles.versionValue}>
                  {loading || carregandoDespesas
                    ? "Carregando..."
                    : `${totalDespesas} despesas`}
                </span>
                {filtroAutomatico && (
                  <>
                    <span style={styles.divider}>|</span>
                    <span style={styles.filtroAtivo}>
                      🎯 Filtrado por emenda
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{totalDespesas}</h3>
                <p style={styles.statLabel}>TOTAL DE DESPESAS</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>
                  {valorTotalDespesas.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h3>
                <p style={styles.statLabel}>VALOR TOTAL</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{despesasPendentes}</h3>
                <p style={styles.statLabel}>PENDENTES</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{despesasAprovadas}</h3>
                <p style={styles.statLabel}>APROVADAS</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{despesasPagas}</h3>
                <p style={styles.statLabel}>PAGAS</p>
              </div>
            </div>

            {/* Filtros */}
            {renderFiltros()}

            {/* Botões de Ação */}
            <div style={styles.actionContainer}>
              <button style={styles.primaryButton} onClick={handleCriar}>
                ➕ Nova Despesa
              </button>
              <button
                style={styles.refreshButton}
                onClick={() => {
                  recarregar();
                  carregarDespesasFiltradas();
                }}
                disabled={loading || carregandoDespesas}
              >
                🔄{" "}
                {loading || carregandoDespesas ? "Atualizando..." : "Atualizar"}
              </button>
            </div>

            {/* Tabela de Despesas */}
            {loading ? (
              <div style={styles.loadingContainer}>
                <p style={styles.loadingText}>
                  {filtroAutomatico
                    ? "Carregando despesas da emenda..."
                    : "Carregando despesas..."}
                </p>
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
                    ? `Nenhuma despesa encontrada para a emenda selecionada.`
                    : Object.values(filtros).some((v) => v)
                      ? "Nenhuma despesa encontrada com os filtros aplicados."
                      : "Nenhuma despesa cadastrada no sistema."}
                </p>
                {filtroAutomatico && (
                  <button onClick={limparFiltros} style={styles.primaryButton}>
                    Ver todas as despesas
                  </button>
                )}
              </div>
            ) : (
              <DespesasTable
                despesas={despesasParaExibir}
                onView={handleVisualizar}
                onEdit={handleEditar}
                onDelete={handleDeletar}
                emendasDisponiveis={emendasDisponiveis}
              />
            )}
          </div>
        );
    }
  };

  return <div style={styles.container}>{renderContent()}</div>;
};

// ✅ Estilos completos
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "#e3f2fd",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #bbdefb",
  },
  breadcrumbLink: {
    background: "none",
    border: "none",
    color: "#1976d2",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "background-color 0.2s ease",
  },
  breadcrumbSeparator: {
    color: "#666",
    margin: "0 8px",
    fontWeight: "bold",
  },
  breadcrumbCurrent: {
    color: "#333",
    fontWeight: "600",
  },
  breadcrumbCount: {
    color: "#666",
    fontSize: "12px",
    marginLeft: "8px",
    fontStyle: "italic",
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
  filtroAtivo: {
    fontWeight: "600",
    background: "rgba(76, 175, 80, 0.3)",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
    fontSize: "22px",
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
  filtrosContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  filtrosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    alignItems: "end",
  },
  filtroGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  filtroLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#333",
    textTransform: "uppercase",
  },
  filtroInput: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  filtroSelect: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  filtroActions: {
    display: "flex",
    gap: "10px",
  },
  limparButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
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
    marginBottom: "20px",
  },
};

export default Despesas;
