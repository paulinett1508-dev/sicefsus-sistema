// Emendas.jsx - Layout Padronizado com Despesas v2.3
// ✅ CORRIGIDO: Execução baseada APENAS em despesas reais
// ✅ REMOVIDO: Metas não são contabilizadas como execução
// ✅ NOVO: Modal de exclusão melhorado com restrições para operadores
// 🔧 CORREÇÃO: Versão dinâmica integrada com versionControl.js

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

  const handleDespesas = (emenda) => {
    console.log("💰 Ver despesas da emenda:", emenda.id);
    navigate(`/emendas/${emenda.id}/despesas`);
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
      console.warn("⚠️ Operador tentando excluir emenda - ação bloqueada");
      setToast({
        show: true,
        message: "Você não tem permissão para excluir emendas!",
        type: "warning",
      });
      return;
    }

    setModalExclusao((prev) => ({ ...prev, loading: true }));

    console.log("🗑️ Iniciando exclusão da emenda:", emendaId);

    try {
      // Deletar todas as despesas vinculadas primeiro
      if (modalExclusao.emenda.despesasVinculadas?.length > 0) {
        console.log(
          `🗑️ Deletando ${modalExclusao.emenda.despesasVinculadas.length} despesas vinculadas...`,
        );
        const deletePromises = modalExclusao.emenda.despesasVinculadas.map(
          (despesa) => deleteDoc(doc(db, "despesas", despesa.id)),
        );
        await Promise.all(deletePromises);
      }

      // Deletar a emenda
      await deleteDoc(doc(db, "emendas", emendaId));

      console.log("✅ Emenda e despesas deletadas com sucesso:", emendaId);

      setToast({
        show: true,
        message: "Emenda excluída com sucesso!",
        type: "success",
      });

      // Fechar modal e recarregar dados
      setModalExclusao({ isOpen: false, emenda: null, loading: false });
      await recarregar();
    } catch (error) {
      console.error("❌ Erro ao deletar emenda:", error);
      setToast({
        show: true,
        message: `Erro ao excluir emenda: ${error.message}`,
        type: "error",
      });
      setModalExclusao((prev) => ({ ...prev, loading: false }));
    }
  };

  // ✅ CALCULAR: Estatísticas COM VALORES REAIS
  const totalEmendas = emendasFiltradas.length;
  const valorTotal = emendasFiltradas.reduce((sum, emenda) => {
    const valor = parseFloat(emenda.valorRecurso || emenda.valor || 0);
    return sum + valor;
  }, 0);

  const emendasAtivas = emendasFiltradas.filter((e) => {
    const saldo = parseFloat(e.saldoDisponivel || 0);
    return saldo > 0;
  }).length;

  const emendasExecutadas = emendasFiltradas.filter((e) => {
    const executado = parseFloat(e.valorExecutado || 0);
    return executado > 0;
  }).length;

  const valorExecutado = emendasFiltradas.reduce((sum, emenda) => {
    const executado = parseFloat(emenda.valorExecutado || 0);
    return sum + executado;
  }, 0);

  console.log("📊 Estatísticas calculadas:", {
    totalEmendas,
    valorTotal,
    valorExecutado,
    emendasAtivas,
    emendasExecutadas,
  });

  // ✅ RENDERIZAÇÃO: Estados especiais
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Carregando emendas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>📋</div>
          <h3>Erro ao carregar dados</h3>
          <p style={styles.emptyText}>{error}</p>
          <button onClick={recarregar} style={styles.retryButton}>
            🔄 Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (emendas.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>📋</div>
          <h2>Nenhuma emenda cadastrada</h2>
          <p style={styles.emptyText}>
            Clique em "Nova Emenda" para começar a cadastrar suas emendas
            parlamentares.
          </p>
          <button onClick={handleCriar} style={styles.emptyButton}>
            ➕ Nova Emenda
          </button>
        </div>
      </div>
    );
  }

  // ✅ RENDERIZAÇÃO: Layout principal
  return (
    <div style={styles.container}>
      {/* Toast de notificações */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* Modal de Exclusão */}
      <ModalExclusaoEmenda
        isOpen={modalExclusao.isOpen}
        onClose={() =>
          setModalExclusao({ isOpen: false, emenda: null, loading: false })
        }
        onConfirm={handleConfirmarExclusao}
        emenda={modalExclusao.emenda}
        userRole={userRole}
        loading={modalExclusao.loading}
      />

      {/* Header com informações do sistema */}
      <div style={styles.compactHeader}>
        <div style={styles.statusInfo}>
          <span style={styles.statusText}>Status:</span>
          <span style={styles.statusValue}>✅ Operacional</span>
          <span style={styles.divider}>|</span>
          <span style={styles.versionText}>Versão:</span>
          <span style={styles.versionValue}>{formatVersion()}</span>
          <span style={styles.divider}>|</span>
          <span style={styles.statusText}>Usuário:</span>
          <span style={styles.versionValue}>
            {userRole === "admin"
              ? "👑 Admin"
              : `🏘️ ${userMunicipio || "Município não cadastrado"}`}
          </span>
          <span style={styles.divider}>|</span>
          <span style={styles.statusText}>Dados:</span>
          <span style={styles.versionValue}>
            {loading ? "Carregando..." : `${totalEmendas} emendas`}
          </span>
        </div>
      </div>

      {/* Banner de informação de permissões para operadores */}
      {userRole === "operador" && userMunicipio && (
        <div style={styles.permissaoInfo}>
          <span style={styles.permissaoIcon}>🔒</span>
          <div style={styles.permissaoContent}>
            <span style={styles.permissaoTexto}>
              <strong>Acesso Local:</strong> Visualizando emendas relacionadas
              ao município{" "}
              <strong>
                {userMunicipio}/{userUf || "UF não informada"}
              </strong>
            </span>
            <span style={styles.permissaoSubtexto}>
              {totalEmendas} emenda(s) encontrada(s) para sua região
            </span>
          </div>
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
          onDespesas={handleDespesas}
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
