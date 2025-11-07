// Emendas.jsx - Layout Padronizado com Despesas v2.3
// ✅ CORRIGIDO: Execução baseada APENAS em despesas reais
// ✅ REMOVIDO: Metas não são contabilizadas como execução
// ✅ NOVO: Modal de exclusão melhorado com restrições para operadores
// 🔧 CORREÇÃO: Versão dinâmica integrada com versionControl.js
// 🔧 FIX: Adicionadas props onView e onDespesas para EmendasTable

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useVersion } from "../hooks/useVersion";
import EmendasFilters from "./EmendasFilters";
import EmendasTable from "./EmendasTable";
import Toast from "./Toast";
import ModalExclusaoEmenda from "./emenda/ModalExclusaoEmenda";

const Emendas = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ CORREÇÃO: Desestruturação correta do contexto
  const { user, loading: userLoading } = useUser();
  const { formatVersion } = useVersion();

  // Estados principais
  const [emendas, setEmendas] = useState([]);
  const [emendasFiltradas, setEmendasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Estados do modal de exclusão
  const [modalExclusao, setModalExclusao] = useState({
    isOpen: false,
    emenda: null,
    loading: false,
  });

  // ✅ CORREÇÃO: Acesso correto às propriedades do usuário
  const userRole = user?.tipo || "operador";
  const userMunicipio = user?.municipio;
  const userUf = user?.uf;
  const userEmail = user?.email;

  console.log("📋 Emendas.jsx v2.3 - Dados do usuário:", {
    email: userEmail,
    role: userRole,
    municipio: userMunicipio,
    uf: userUf,
    user: user,
  });

  // ✅ CORREÇÃO: Aguardar carregamento do usuário
  if (userLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando usuário...</p>
      </div>
    );
  }

  // Validações críticas
  if (!user || !userEmail) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Erro ao carregar dados do usuário...</p>
      </div>
    );
  }

  // ✅ FUNÇÃO: Carregar dados principais COM DESPESAS
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📊 Carregando emendas e despesas...");
      console.log("👤 Usuário:", {
        role: userRole,
        municipio: userMunicipio,
        uf: userUf,
      });

      // ✅ CORREÇÃO: Query com filtro baseado no tipo de usuário
      let emendasQuery;

      if (userRole === "admin") {
        // Admin vê todas as emendas
        console.log("🔓 Admin - carregando TODAS as emendas");
        emendasQuery = collection(db, "emendas");
      } else {
        // Operador vê apenas emendas do seu município/UF
        if (userMunicipio && userUf) {
          console.log(`🔒 Operador - filtrando por ${userMunicipio}/${userUf}`);
          emendasQuery = query(
            collection(db, "emendas"),
            where("municipio", "==", userMunicipio),
            where("uf", "==", userUf),
          );
        } else {
          console.warn(
            "⚠️ Operador sem município/UF definido - não carregando emendas",
          );
          setEmendas([]);
          setEmendasFiltradas([]);
          setLoading(false);
          return;
        }
      }

      // Carregar emendas (com filtro) e despesas em paralelo
      const [emendasSnapshot, despesasSnapshot] = await Promise.all([
        getDocs(emendasQuery), // ✅ AGORA COM FILTRO!
        getDocs(collection(db, "despesas")),
      ]);

      const emendasData = [];
      emendasSnapshot.forEach((doc) => {
        emendasData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const despesasData = [];
      despesasSnapshot.forEach((doc) => {
        despesasData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Emendas encontradas: ${emendasData.length}`);
      console.log(`✅ Despesas encontradas: ${despesasData.length}`);

      // ✅ CALCULAR EXECUÇÃO REAL baseado APENAS nas despesas
      const emendasComExecucao = emendasData.map((emenda) => {
        // Buscar despesas desta emenda
        const despesasEmenda = despesasData.filter(
          (despesa) => despesa.emendaId === emenda.id,
        );

        // ✅ CORREÇÃO: Calcular valor executado APENAS das despesas
        const valorExecutadoDespesas = despesasEmenda.reduce((sum, despesa) => {
          return sum + (parseFloat(despesa.valor) || 0);
        }, 0);

        // ✅ TOTAL EXECUTADO: Apenas Despesas
        const valorExecutadoTotal = valorExecutadoDespesas;

        // Calcular valores finais
        const valorTotal = emenda.valorRecurso || emenda.valor || 0;
        const saldoDisponivel = valorTotal - valorExecutadoTotal;
        const percentualExecutado =
          valorTotal > 0 ? (valorExecutadoTotal / valorTotal) * 100 : 0;

        console.log(
          `💰 Emenda ${emenda.numero} (${emenda.municipio}/${emenda.uf}):`,
          {
            valorTotal,
            valorExecutadoDespesas,
            saldoDisponivel,
            percentualExecutado: percentualExecutado.toFixed(1) + "%",
          },
        );

        return {
          ...emenda,
          valorExecutado: valorExecutadoTotal,
          saldoDisponivel: saldoDisponivel,
          percentualExecutado: percentualExecutado,
          totalDespesas: despesasEmenda.length,
          totalMetas: (emenda.acoesServicos || []).length,
          despesasVinculadas: despesasEmenda,
          metasVinculadas: emenda.acoesServicos || [],
        };
      });

      console.log(
        `✅ ${emendasComExecucao.length} emendas processadas para usuário ${userRole}`,
      );

      setEmendas(emendasComExecucao);
      setEmendasFiltradas(emendasComExecucao);
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [userRole, userMunicipio, userUf]); // ✅ ADICIONAR dependências
  // ✅ EFEITO: Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // ✅ FUNÇÃO: Recarregar dados
  const recarregar = useCallback(async () => {
    console.log("🔄 Recarregando emendas...");
    await carregarDados();
  }, [carregarDados]);

  // ✅ HANDLER: Filtros das emendas
  const handleFiltrosChange = useCallback((emendasFiltradas) => {
    console.log("🔍 Aplicando filtros:", emendasFiltradas.length);
    setEmendasFiltradas(emendasFiltradas);
  }, []);

  // ✅ HANDLERS: Ações das emendas
  const handleCriar = () => {
    console.log("➕ Criando nova emenda");
    navigate("/emendas/criar");
  };

  const handleEditar = (emenda) => {
    console.log("✏️ Editando emenda:", emenda.id);
    navigate(`/emendas/${emenda.id}/editar`);
  };

  const handleVisualizar = (emenda) => {
    console.log("👁️ Visualizando emenda:", emenda.id);
    navigate(`/emendas/${emenda.id}`);
  };

  // ✅ NOVO: Handler para visualizar despesas da emenda
  const handleVerDespesas = (emenda) => {
    console.log("💰 Visualizando despesas da emenda:", emenda.id);
    navigate(`/emendas/${emenda.id}`, { state: { activeTab: "despesas" } });
  };

  // ✅ NOVO: Handler para abrir modal de exclusão
  const handleDeletar = (emendaParam) => {
    console.log("🗑️ handleDeletar recebeu:", emendaParam);

    // Verificar se recebeu um ID string ou um objeto emenda
    let emendaObj;

    if (typeof emendaParam === "string") {
      // Se recebeu apenas o ID, buscar a emenda completa
      emendaObj = emendas.find((e) => e.id === emendaParam);
      console.log(
        "🔍 Buscando emenda por ID:",
        emendaParam,
        "Encontrada:",
        emendaObj,
      );
    } else if (emendaParam && typeof emendaParam === "object") {
      // Se recebeu o objeto completo
      emendaObj = emendaParam;
    }

    if (!emendaObj || !emendaObj.id) {
      console.error("❌ Emenda não encontrada ou sem ID:", emendaParam);
      setToast({
        show: true,
        message: "Erro: Emenda não encontrada!",
        type: "error",
      });
      return;
    }

    console.log(
      "✅ Abrindo modal de exclusão para emenda:",
      emendaObj.id,
      emendaObj,
    );
    setModalExclusao({
      isOpen: true,
      emenda: emendaObj,
      loading: false,
    });
  };

  // ✅ NOVO: Handler para confirmar exclusão
  const handleConfirmarExclusao = async () => {
    // Validações de segurança
    if (!modalExclusao.emenda) {
      console.error("❌ Nenhuma emenda selecionada para exclusão!");
      setToast({
        show: true,
        message: "Erro: Nenhuma emenda selecionada!",
        type: "error",
      });
      return;
    }

    const emendaId = modalExclusao.emenda?.id;

    if (!emendaId) {
      console.error("❌ ID da emenda não encontrado!", modalExclusao.emenda);
      setToast({
        show: true,
        message: "Erro: ID da emenda não encontrado!",
        type: "error",
      });
      return;
    }

    // Se for operador, não deve chegar aqui (o modal já bloqueia)
    if (userRole === "operador" || userRole === "Operador") {
      console.error("❌ Operador tentou excluir emenda!");
      setToast({
        show: true,
        message: "Erro: Operadores não podem excluir emendas!",
        type: "error",
      });
      setModalExclusao({ isOpen: false, emenda: null, loading: false });
      return;
    }

    try {
      console.log("🗑️ Excluindo emenda:", emendaId);

      // Ativar loading no modal
      setModalExclusao((prev) => ({ ...prev, loading: true }));

      // Excluir emenda do Firebase
      await deleteDoc(doc(db, "emendas", emendaId));

      console.log("✅ Emenda excluída com sucesso!");

      // Atualizar lista de emendas (remover da lista local)
      setEmendas((prevEmendas) =>
        prevEmendas.filter((emenda) => emenda.id !== emendaId),
      );
      setEmendasFiltradas((prevEmendasFiltradas) =>
        prevEmendasFiltradas.filter((emenda) => emenda.id !== emendaId),
      );

      // Exibir mensagem de sucesso
      setToast({
        show: true,
        message: `✅ Emenda ${modalExclusao.emenda.numero || emendaId} excluída com sucesso!`,
        type: "success",
      });

      // Fechar modal
      setModalExclusao({ isOpen: false, emenda: null, loading: false });
    } catch (error) {
      console.error("❌ Erro ao excluir emenda:", error);

      // Desativar loading
      setModalExclusao((prev) => ({ ...prev, loading: false }));

      // Exibir mensagem de erro
      setToast({
        show: true,
        message: `❌ Erro ao excluir emenda: ${error.message}`,
        type: "error",
      });
    }
  };

  // ✅ NOVO: Handler para cancelar exclusão
  const handleCancelarExclusao = () => {
    console.log("❌ Exclusão cancelada pelo usuário");
    setModalExclusao({ isOpen: false, emenda: null, loading: false });
  };

  // Loading state
  if (loading && emendas.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando emendas...</p>
      </div>
    );
  }

  // ✅ CÁLCULOS: Estatísticas simples
  const totalEmendas = emendasFiltradas.length;
  const emendasExecutadas = emendasFiltradas.filter(
    (e) => e.percentualExecutado >= 100,
  ).length;
  const emendasAtivas = emendasFiltradas.filter(
    (e) => e.percentualExecutado > 0 && e.percentualExecutado < 100,
  ).length;
  const valorTotal = emendasFiltradas.reduce(
    (sum, emenda) => sum + (emenda.valorRecurso || emenda.valor || 0),
    0,
  );

  console.log("📊 Estatísticas calculadas:", {
    totalEmendas,
    emendasExecutadas,
    emendasAtivas,
    valorTotal,
  });

  return (
    <div style={styles.container}>
      {/* Header compacto */}
      <div style={styles.compactHeader}>
        <div style={styles.statusInfo}>
          <span style={styles.statusText}>📋 EMENDAS</span>
          <span style={styles.divider}>|</span>
          <span style={styles.statusText}>
            {userRole === "admin" ? "👑 Administrador" : "👤 Operador"}
          </span>
          {userRole === "operador" && (
            <>
              <span style={styles.divider}>|</span>
              <span style={styles.statusValue}>
                {userMunicipio}/{userUf}
              </span>
            </>
          )}
          <span style={styles.divider}>|</span>
          <span style={styles.versionText}>v{formatVersion()}</span>
        </div>
      </div>

      {/* Permissões de operador */}
      {userRole === "operador" && (
        <div style={styles.permissaoInfo}>
          <div style={styles.permissaoIcon}>ℹ️</div>
          <div style={styles.permissaoContent}>
            <div style={styles.permissaoTexto}>
              Você visualiza apenas emendas do município de{" "}
              <strong>{userMunicipio}</strong>
            </div>
            <div style={styles.permissaoSubtexto}>
              Permissões de operador: criar despesas, visualizar e editar
              emendas do seu município
            </div>
          </div>
        </div>
      )}

      {/* Toast de feedback */}
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
        onCancel={handleCancelarExclusao}
      />

      {/* Erro de carregamento */}
      {error && (
        <div
          style={{
            ...styles.emptyContainer,
            backgroundColor: "#ffebee",
            border: "2px solid #f44336",
          }}
        >
          <div style={styles.emptyIcon}>⚠️</div>
          <h3>Erro ao carregar emendas</h3>
          <p style={styles.emptyText}>{error}</p>
          <button style={styles.retryButton} onClick={recarregar}>
            🔄 Tentar Novamente
          </button>
        </div>
      )}

      {/* Cards de estatísticas */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{totalEmendas}</h3>
          <p style={styles.statLabel}>TOTAL DE EMENDAS</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{emendasExecutadas}</h3>
          <p style={styles.statLabel}>EMENDAS EXECUTADAS</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{emendasAtivas}</h3>
          <p style={styles.statLabel}>EMENDAS ATIVAS</p>
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

      {/* Botões de ação */}
      <div style={styles.actionContainer}>
        <button style={styles.primaryButton} onClick={handleCriar}>
          ➕ Nova Emenda
        </button>
        <button
          style={styles.refreshButton}
          onClick={recarregar}
          disabled={loading}
        >
          🔄 {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {/* Componente de filtros */}
      <EmendasFilters
        emendas={emendas}
        onFilterChange={handleFiltrosChange}
        totalEmendas={totalEmendas}
      />

      {/* Estado vazio com filtros */}
      {totalEmendas === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>📋</div>
          <h3>Nenhuma emenda encontrada</h3>
          <p style={styles.emptyText}>
            Ajuste os filtros de pesquisa ou cadastre uma nova emenda.
          </p>
        </div>
      ) : (
        /* Tabela de emendas */
        <EmendasTable
          emendas={emendasFiltradas}
          totalEmendas={emendas.length}
          loading={false}
          onEdit={handleEditar}
          onView={handleVisualizar}
          onDelete={handleDeletar}
          onDespesas={handleVerDespesas}
          userRole={userRole}
        />
      )}
    </div>
  );
};

// ✅ ESTILOS: Idênticos ao Despesas.jsx
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
    fontSize: "14px",
    gap: "8px",
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
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "16px",
  },

  loadingText: {
    fontSize: "18px",
    color: "#666",
  },

  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  emptyText: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "10px",
  },

  emptyButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
  },

  retryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginTop: "10px",
  },
};

// CSS para animação (evita conflito)
if (!document.getElementById("emendas-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "emendas-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Emendas;
