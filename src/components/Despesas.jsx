// Despesas.jsx - CORREÇÃO CRÍTICA APLICADA
// ✅ Integração com useEmendaDespesa corrigido + sistema de permissões

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigationProtection } from "../App";
import { useToast } from "./Toast";
import useEmendaDespesa from "../hooks/useEmendaDespesa";
import DespesaForm from "./DespesaForm";
import DespesasList from "./DespesasList";
import TemporaryBanner from "./TemporaryBanner";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// ✅ CORES PADRONIZADAS (mesmo padrão do Emendas)
const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const SUCCESS = "#27AE60";
const WARNING = "#F39C12";
const ERROR = "#E74C3C";
const WHITE = "#fff";
const GRAY = "#f4f6f8";

export default function Despesas({ usuario }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error, warning } = useToast();
  const { setFormActive, canNavigate } = useNavigationProtection();

  // ✅ CORREÇÃO: Estados para dados do usuário (mesmo padrão do Emendas/Dashboard)
  const [userRole, setUserRole] = useState(null);
  const [userMunicipio, setUserMunicipio] = useState(null);
  const [userUf, setUserUf] = useState(null);

  // ✅ NOVO: Obter filtro automático da navegação
  const [filtroAutomatico, setFiltroAutomatico] = useState(null);

  // ✅ Buscar dados do usuário no Firestore (igual ao Emendas)
  useEffect(() => {
    const loadUserData = async () => {
      if (usuario?.uid) {
        try {
          const usersSnapshot = await getDocs(
            query(collection(db, "users"), where("uid", "==", usuario.uid)),
          );

          if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data();
            setUserMunicipio(userData.municipio);
            setUserUf(userData.uf);
            setUserRole(userData.role);
            console.log("👤 Dados do usuário carregados (Despesas):", {
              municipio: userData.municipio,
              uf: userData.uf,
              role: userData.role,
            });
          }
        } catch (error) {
          console.error("❌ Erro ao buscar dados do usuário:", error);
        }
      }
    };

    loadUserData();
  }, [usuario]);

  // ✅ CORREÇÃO CRÍTICA: Construir objeto usuário completo para o hook
  const usuarioParaHook = userRole
    ? {
        uid: usuario?.uid,
        email: usuario?.email,
        role: userRole,
        municipio: userMunicipio,
        uf: userUf,
      }
    : null;

  console.log("✅ Usuário completo configurado (Despesas):", usuarioParaHook);

  // ✅ CORREÇÃO: Hook integrado com usuário completo
  const {
    emendas,
    despesas,
    loading,
    error: hookError,
    metricasGerais,
    permissoes,
    recarregar,
  } = useEmendaDespesa(usuarioParaHook, {
    carregarTodasEmendas: userRole !== null, // ✅ Só carrega quando role definida
    incluirEstatisticas: true,
    autoRefresh: true,
    filtroMunicipio: userRole !== "admin" ? userMunicipio : null,
    filtroUf: userRole !== "admin" ? userUf : null,
    userRole: userRole,
  });

  // ✅ Estados principais (mesmo padrão do Emendas)
  const [currentView, setCurrentView] = useState("listagem");
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ NOVO: Verificar se veio com filtro automático do módulo Emendas
  useEffect(() => {
    if (location.state?.filtroAutomatico) {
      const filtro = location.state.filtroAutomatico;
      setFiltroAutomatico(filtro);

      // Mostrar banner informativo
      setBannerMessage(
        `🔍 Filtro aplicado: Exibindo despesas da emenda ${filtro.numero} - ${filtro.parlamentar}`,
      );
      setShowBanner(true);

      // Limpar o state após usar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ Função global para navegação (mesmo padrão do Emendas)
  useEffect(() => {
    window.voltarParaListagemDespesas = () => {
      if (canNavigate()) {
        setCurrentView("listagem");
        setDespesaSelecionada(null);
        setFormActive(false);
      }
    };

    return () => {
      delete window.voltarParaListagemDespesas;
    };
  }, [canNavigate, setFormActive]);

  // ✅ Handlers de navegação
  const handleNovaDespesa = () => {
    if (!canNavigate()) return;

    setDespesaSelecionada(null);
    setCurrentView("criar");
    setFormActive(true, "DespesaForm", false);
  };

  const handleEditarDespesa = (despesa) => {
    if (!canNavigate()) return;

    setDespesaSelecionada(despesa);
    setCurrentView("editar");
    setFormActive(true, "DespesaForm", false);
  };

  const handleVisualizarDespesa = (despesa) => {
    if (!canNavigate()) return;

    setDespesaSelecionada(despesa);
    setCurrentView("visualizar");
    setFormActive(false);
  };

  const handleSalvarDespesa = async (dados) => {
    try {
      const mensagem = despesaSelecionada
        ? "Despesa atualizada com sucesso!"
        : "Despesa criada com sucesso!";

      success(mensagem);
      setBannerMessage(mensagem);
      setShowBanner(true);

      setCurrentView("listagem");
      setDespesaSelecionada(null);
      setFormActive(false);
      setRefreshKey((prev) => prev + 1);
      await recarregar();
    } catch (err) {
      console.error("Erro ao salvar despesa:", err);
      error("Erro ao salvar despesa");
    }
  };

  const handleCancelarForm = () => {
    setCurrentView("listagem");
    setDespesaSelecionada(null);
    setFormActive(false);
  };

  const handleExcluirDespesa = async (despesaId) => {
    try {
      success("Despesa excluída com sucesso!");
      setBannerMessage("Despesa excluída com sucesso!");
      setShowBanner(true);
      setRefreshKey((prev) => prev + 1);
      await recarregar();
    } catch (err) {
      console.error("Erro ao excluir despesa:", err);
      error("Erro ao excluir despesa");
    }
  };

  // ✅ NOVO: Função para voltar para a emenda de origem
  const handleVoltarParaEmenda = () => {
    if (filtroAutomatico?.emendaId) {
      navigate("/emendas", {
        state: {
          editarEmenda: filtroAutomatico.emendaId,
        },
      });
    } else {
      navigate("/emendas");
    }
  };

  // ✅ NOVO: Função para limpar filtro automático
  const handleLimparFiltroAutomatico = () => {
    setFiltroAutomatico(null);
    setBannerMessage("Filtro removido. Exibindo todas as despesas.");
    setShowBanner(true);
  };

  // ✅ Calcular estatísticas do dashboard (mesmo padrão do Emendas)
  const calcularEstatisticas = () => {
    // ✅ Verificação segura dos arrays
    const despesasSeguras = despesas || [];

    // Se há filtro automático, calcular apenas para essa emenda
    const despesasFiltradas = filtroAutomatico
      ? despesasSeguras.filter((d) => d.emendaId === filtroAutomatico.emendaId)
      : despesasSeguras;

    const totalDespesas = despesasFiltradas.length;
    const valorTotalDespesas = despesasFiltradas.reduce(
      (sum, d) => sum + (d.valor || 0),
      0,
    );
    const mediaValorDespesa =
      totalDespesas > 0 ? valorTotalDespesas / totalDespesas : 0;
    const emendasComDespesas = new Set(despesasFiltradas.map((d) => d.emendaId))
      .size;

    // Despesas por mês atual
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    const despesasMesAtual = despesasFiltradas.filter((d) => {
      const dataDespesa = new Date(d.data);
      return (
        dataDespesa.getMonth() === mesAtual &&
        dataDespesa.getFullYear() === anoAtual
      );
    });

    return {
      totalDespesas,
      valorTotalDespesas,
      mediaValorDespesa,
      emendasComDespesas,
      despesasMesAtual: despesasMesAtual.length,
      valorMesAtual: despesasMesAtual.reduce(
        (sum, d) => sum + (d.valor || 0),
        0,
      ),
    };
  };

  const estatisticas = calcularEstatisticas();

  // ✅ Função para formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ VERIFICAÇÃO DE ACESSO (mesmo padrão do Dashboard)
  if (userRole !== "admin" && (!userMunicipio || !userUf) && !loading) {
    return (
      <div style={styles.container}>
        <div style={styles.warningContainer}>
          <div style={styles.warningCard}>
            <h2 style={styles.warningTitle}>⚠️ Configuração Pendente</h2>
            <p style={styles.warningText}>
              Seu usuário não possui município/UF cadastrado no sistema.
            </p>
            <p style={styles.warningText}>
              Entre em contato com o administrador para configurar seu acesso.
            </p>
            <div style={styles.userInfo}>
              <strong>Usuário:</strong> {usuario?.email}
              <br />
              <strong>Perfil:</strong> Operador
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Renderização condicional baseada na view atual
  if (currentView === "criar" || currentView === "editar") {
    return (
      <div style={styles.container}>
        <DespesaForm
          despesa={currentView === "editar" ? despesaSelecionada : null}
          emendaId={filtroAutomatico?.emendaId} // ✅ Pré-selecionar emenda se vier do filtro
          onSalvar={handleSalvarDespesa}
          onCancelar={handleCancelarForm}
          usuario={usuario}
          onChangeDetected={(hasChanges) =>
            setFormActive(true, "DespesaForm", hasChanges)
          }
        />
      </div>
    );
  }

  if (currentView === "visualizar") {
    return (
      <div style={styles.container}>
        <DespesaForm
          despesa={despesaSelecionada}
          onSalvar={handleSalvarDespesa}
          onCancelar={handleCancelarForm}
          usuario={usuario}
          readOnly={true}
          onChangeDetected={() => {}}
        />
      </div>
    );
  }

  // ✅ LAYOUT PADRONIZADO 100% COM EMENDAS
  return (
    <div style={styles.container}>
      {/* ✅ Banner de status SIMPLES (igual ao Emendas) */}
      <div style={styles.statusBanner}>
        Status: ✅ Operacional | Versão: v1.7
        {filtroAutomatico && (
          <span style={styles.filtroIndicador}>| 🔍 Filtrado por Emenda</span>
        )}
        {userRole !== "admin" && userMunicipio && userUf && (
          <span style={styles.filtroIndicador}>
            | 📍 {userMunicipio}/{userUf}
          </span>
        )}
      </div>

      {/* ✅ NOVO: Banner especial para filtro automático */}
      {filtroAutomatico && (
        <div style={styles.filtroAutomaticoBanner}>
          <div style={styles.filtroAutomaticoContent}>
            <div style={styles.filtroAutomaticoInfo}>
              <span style={styles.filtroAutomaticoIcon}>🎯</span>
              <div>
                <div style={styles.filtroAutomaticoTitle}>
                  Despesas da Emenda: {filtroAutomatico.numero}
                </div>
                <div style={styles.filtroAutomaticoSubtitle}>
                  {filtroAutomatico.parlamentar} | Valor:{" "}
                  {formatCurrency(filtroAutomatico.valorRecurso)}
                </div>
              </div>
            </div>
            <div style={styles.filtroAutomaticoActions}>
              <button
                onClick={handleVoltarParaEmenda}
                style={styles.voltarEmendaButton}
              >
                ← Voltar para Emenda
              </button>
              <button
                onClick={handleLimparFiltroAutomatico}
                style={styles.limparFiltroButton}
              >
                ✕ Ver Todas as Despesas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Banner temporário para notificações */}
      {showBanner && (
        <TemporaryBanner
          message={bannerMessage}
          isVisible={showBanner}
          onClose={() => setShowBanner(false)}
          type="success"
          autoHide={true}
        />
      )}

      {/* ✅ Container principal (mesmo padding do Emendas) */}
      <div style={styles.mainContent}>
        {/* ✅ Cards do Dashboard (mesmo layout do Emendas) */}
        <div style={styles.dashboardCards}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{estatisticas.totalDespesas}</div>
            <div style={styles.statLabel}>
              {filtroAutomatico
                ? "DESPESAS DESTA EMENDA"
                : userRole === "admin"
                  ? "TOTAL DE DESPESAS"
                  : "DESPESAS DO MUNICÍPIO"}
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {estatisticas.emendasComDespesas}
            </div>
            <div style={styles.statLabel}>
              {filtroAutomatico ? "EMENDA SELECIONADA" : "EMENDAS COM RECURSOS"}
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {formatCurrency(estatisticas.valorTotalDespesas)
                .replace("R$", "")
                .trim()}
            </div>
            <div style={styles.statLabel}>
              {filtroAutomatico ? "VALOR EXECUTADO" : "VALOR TOTAL"}
            </div>
          </div>
        </div>

        {/* ✅ Botão Nova Despesa (mesmo posicionamento do Emendas) */}
        <div style={styles.buttonContainer}>
          <button onClick={handleNovaDespesa} style={styles.newButton}>
            ➕ Nova Despesa
            {filtroAutomatico && (
              <span style={styles.newButtonSubtext}>
                (para {filtroAutomatico.numero})
              </span>
            )}
          </button>
          <button
            onClick={recarregar}
            disabled={loading}
            style={styles.refreshButton}
          >
            🔄 {loading ? "Carregando..." : "Atualizar"}
          </button>
        </div>

        {/* ✅ Seção de Filtros (mesmo layout do Emendas) */}
        <div style={styles.filtersSection}>
          <div style={styles.filtersHeader}>
            <span style={styles.filtersTitle}>
              🔍{" "}
              {filtroAutomatico ? "Filtros Adicionais" : "Filtros de Pesquisa"}
            </span>
            <button style={styles.showFiltersButton}>▼ Mostrar</button>
          </div>
          <div style={styles.filtersInfo}>
            Total: {estatisticas.totalDespesas} despesa
            {estatisticas.totalDespesas !== 1 ? "s" : ""}
            {filtroAutomatico && " (filtrada)"}
            {userRole !== "admin" &&
              !filtroAutomatico &&
              ` - ${userMunicipio}/${userUf}`}
          </div>
        </div>

        {/* ✅ Componente de listagem */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>Carregando despesas...</p>
          </div>
        ) : hookError ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>❌ {hookError}</p>
            <button onClick={recarregar} style={styles.retryButton}>
              🔄 Tentar novamente
            </button>
          </div>
        ) : (
          <DespesasList
            refresh={refreshKey}
            onEdit={handleEditarDespesa}
            onView={handleVisualizarDespesa}
            onDelete={handleExcluirDespesa}
            onNovaDespesa={handleNovaDespesa}
            usuario={usuario}
            filtroInicial={filtroAutomatico} // ✅ Passar filtro automático
          />
        )}
      </div>
    </div>
  );
}

// ✅ Estilos IDÊNTICOS ao módulo Emendas + novos para filtro automático
const styles = {
  container: {
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    padding: 0,
    margin: 0,
  },

  // ✅ Banner simples igual ao Emendas
  statusBanner: {
    background: "linear-gradient(135deg, #154360, #4A90E2)",
    color: "white",
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "left",
    width: "100%",
    boxSizing: "border-box",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  filtroIndicador: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },

  // ✅ NOVO: Banner para filtro automático
  filtroAutomaticoBanner: {
    backgroundColor: "#e8f4fd",
    border: "2px solid #4A90E2",
    padding: "16px 20px",
    margin: "0",
    boxShadow: "0 2px 8px rgba(74, 144, 226, 0.2)",
  },

  filtroAutomaticoContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },

  filtroAutomaticoInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },

  filtroAutomaticoIcon: {
    fontSize: "24px",
    flexShrink: 0,
  },

  filtroAutomaticoTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#154360",
    marginBottom: "4px",
  },

  filtroAutomaticoSubtitle: {
    fontSize: "14px",
    color: "#6c757d",
  },

  filtroAutomaticoActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  voltarEmendaButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  limparFiltroButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // ✅ Container principal igual ao Emendas
  mainContent: {
    padding: "20px",
    backgroundColor: "#ffffff",
  },

  // ✅ Cards do dashboard iguais ao Emendas
  dashboardCards: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  statCard: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    minWidth: "200px",
    flex: "1",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: "8px",
    lineHeight: "1",
  },

  statLabel: {
    fontSize: "12px",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },

  // ✅ Botão igual ao Emendas
  buttonContainer: {
    marginBottom: "24px",
    display: "flex",
    gap: "10px",
  },

  newButton: {
    backgroundColor: SUCCESS,
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    gap: "4px",
    boxShadow: "0 2px 4px rgba(39, 174, 96, 0.3)",
    transition: "all 0.3s ease",
  },

  newButtonSubtext: {
    fontSize: "11px",
    opacity: 0.9,
    fontWeight: "400",
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

  // ✅ Seção de filtros igual ao Emendas
  filtersSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    padding: "16px 0",
    borderBottom: "1px solid #e9ecef",
  },

  filtersHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  filtersTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: PRIMARY,
  },

  showFiltersButton: {
    backgroundColor: ACCENT,
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
  },

  filtersInfo: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500",
  },

  // ✅ Estados de loading/erro (igual ao Emendas)
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

  // ✅ Warning container (igual ao Emendas)
  warningContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    padding: "20px",
  },

  warningCard: {
    background: "white",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    border: "2px solid #ffc107",
  },

  warningTitle: {
    color: "#856404",
    marginBottom: "15px",
    fontSize: "24px",
  },

  warningText: {
    color: "#856404",
    marginBottom: "15px",
    lineHeight: "1.6",
  },

  userInfo: {
    background: "#fff3cd",
    padding: "15px",
    borderRadius: "8px",
    color: "#856404",
    fontSize: "14px",
    textAlign: "left",
    marginTop: "20px",
  },
};

// ✅ CSS adicional para hover effects (igual ao Emendas)
const additionalCSS = `
.new-button:hover {
  background-color: #219A52;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.4);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.show-filters-button:hover {
  background-color: #357ABD;
}

.voltar-emenda-button:hover {
  background-color: #357ABD;
  transform: translateY(-1px);
}

.limpar-filtro-button:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .dashboard-cards {
    flex-direction: column;
  }

  .stat-card {
    min-width: auto;
  }

  .filters-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filtro-automatico-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filtro-automatico-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
`;

// Inserir CSS dinamicamente
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = additionalCSS;
  document.head.appendChild(style);
}
