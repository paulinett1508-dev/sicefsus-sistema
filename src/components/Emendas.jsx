// Emendas.jsx - Layout Padronizado com Despesas v2.3
// ✅ CORRIGIDO: Execução baseada APENAS em despesas reais
// ✅ REMOVIDO: Metas não são contabilizadas como execução
// ✅ NOVO: Modal de exclusão melhorado com restrições para operadores
// 🔧 CORREÇÃO: Versão dinâmica integrada com versionControl.js
// ❌ REMOVIDO: Botões 👁️ (Visualizar) e 💰 (Ver Despesas) - Redundantes
// 🔧 FIX: Navegação corrigida para /emendas/novo

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

// Função auxiliar para parsear valores monetários (ex: R$ 1.000,50 para 1000.50)
const parseValorMonetario = (valor) => {
  if (!valor && valor !== 0) return 0;

  // Se já é número, retorna direto
  if (typeof valor === "number") return valor;

  const valorString = String(valor);

  // Remove pontos (separador de milhar) e substitui vírgula (decimal) por ponto
  const numero = valorString
    .replace(/\./g, "") // Remove pontos (separador de milhar)
    .replace(",", ".") // Substitui vírgula (decimal) por ponto
    .replace(/[^\d.-]/g, ""); // Remove qualquer outro caractere não numérico

  const valorFloat = parseFloat(numero);
  return isNaN(valorFloat) ? 0 : valorFloat;
};

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

  // ✅ FUNÇÃO: Carregar dados com useCallback (prevenir re-renders desnecessários)
  const carregarDados = useCallback(async () => {
    try {
      console.log("📊 Carregando emendas e despesas...");
      console.log("👤 Usuário:", {
        role: userRole,
        municipio: userMunicipio,
        uf: userUf,
      });

      setLoading(true);
      setError(null);

      let emendasQuery;
      if (userRole === "admin") {
        console.log("🔓 Admin - carregando TODAS as emendas");
        emendasQuery = collection(db, "emendas");
      } else {
        // ✅ GESTOR/OPERADOR: Filtrar por município E UF (query composta)
        if (userRole === "gestor" || userRole === "operador") {
          console.log(
            `🔒 Operador - filtrando por município: ${userMunicipio} e UF: ${userUf}`,
          );
          emendasQuery = query(
            collection(db, "emendas"),
            where("municipio", "==", userMunicipio),
            where("uf", "==", userUf)
          );
        }
      }

      // Buscar despesas com os mesmos filtros
      let despesasQuery;
      if (userRole === "admin") {
        console.log("🔓 Admin - carregando TODAS as despesas");
        despesasQuery = collection(db, "despesas");
      } else {
        // ✅ GESTOR/OPERADOR: Filtrar por município E UF (query composta)
        if (userRole === "gestor" || userRole === "operador") {
          console.log(
            `🔒 Operador - filtrando despesas por município: ${userMunicipio} e UF: ${userUf}`,
          );
          despesasQuery = query(
            collection(db, "despesas"),
            where("municipio", "==", userMunicipio),
            where("uf", "==", userUf)
          );
        }
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

      console.log("✅ Emendas encontradas:", emendasData.length);
      console.log("✅ Despesas encontradas:", despesasData.length);

      // ✅ CALCULAR EXECUÇÃO: Baseado APENAS em despesas reais (não metas)
      const emendasComExecucao = emendasData.map((emenda) => {
        const despesasEmenda = despesasData.filter(
          (despesa) => despesa.emendaId === emenda.id,
        );

        // ✅ Valor Total - Parsing robusto com fallback
        // Tenta valorTotal, se não existir tenta valorRecurso, se não existir tenta valor
        const valorTotal = parseValorMonetario(
          emenda.valorTotal || emenda.valorRecurso || emenda.valor || 0,
        );

        // 🔍 DEBUG: Verificar qual campo foi usado
        if (valorTotal === 0) {
          console.warn(
            `⚠️ Emenda ${emenda.numero || emenda.id} com valorTotal = 0`,
            {
              valorTotal: emenda.valorTotal,
              valorRecurso: emenda.valorRecurso,
              valor: emenda.valor,
              tipoValorTotal: typeof emenda.valorTotal,
              tipoValorRecurso: typeof emenda.valorRecurso,
              tipoValor: typeof emenda.valor,
              emendaCompleta: emenda,
            },
          );
        } else {
          console.log(
            `✅ Emenda ${emenda.numero || emenda.id} valorTotal OK:`,
            {
              valorParsed: valorTotal,
              campoUsado: emenda.valorTotal
                ? "valorTotal"
                : emenda.valorRecurso
                  ? "valorRecurso"
                  : emenda.valor
                    ? "valor"
                    : "nenhum",
            },
          );
        }

        // ✅ Total Executado - Soma despesas que NÃO são planejadas
        const valorExecutado = despesasEmenda
          .filter(d => d.status !== "PLANEJADA")
          .reduce((acc, despesa) => {
            const valorDespesa = parseValorMonetario(despesa.valor);
            return acc + valorDespesa;
          }, 0);

        // ✅ Saldo Disponível
        const saldoDisponivel = valorTotal - valorExecutado;

        // ✅ Percentual Executado (arredondado para 1 casa decimal) - RETORNA NÚMERO
        const percentualExecutado =
          valorTotal > 0
            ? parseFloat(((valorExecutado / valorTotal) * 100).toFixed(1))
            : 0;

        console.log(
          `💰 Emenda ${emenda.numero} (${emenda.municipio}/${emenda.uf}):`,
          {
            valorTotal: valorTotal,
            valorExecutadoDespesas: valorExecutado,
            saldoDisponivel: saldoDisponivel,
            percentualExecutado: percentualExecutado,
          },
        );

        return {
          ...emenda,
          valorTotal: valorTotal,
          valorExecutado: valorExecutado,
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

      // ✅ ORDENAR por data de criação (mais recentes primeiro)
      const emendasOrdenadas = emendasComExecucao.sort((a, b) => {
        const dataA = a.criadoEm?.seconds || 0;
        const dataB = b.criadoEm?.seconds || 0;
        return dataB - dataA; // Decrescente (mais recentes primeiro)
      });

      setEmendas(emendasOrdenadas);
      setEmendasFiltradas(emendasOrdenadas);
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
    navigate("/emendas/novo"); // 🔧 CORREÇÃO: Rota corrigida
  };

  const handleEditar = (emenda) => {
    console.log("✏️ Editando emenda:", emenda.id);
    // ✅ CORREÇÃO: Rota correta sem /editar
    navigate(`/emendas/${emenda.id}`);
  };

  // ❌ REMOVIDO: Botões 👁️ (Visualizar) e 💰 (Ver Despesas)
  // Motivo: Redundante com botão de Editar

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

      // Fechar modal
      setModalExclusao({ isOpen: false, emenda: null, loading: false });

      // Exibir toast de sucesso
      setToast({
        show: true,
        message: "✅ Emenda excluída com sucesso!",
        type: "success",
      });
    } catch (error) {
      console.error("❌ Erro ao excluir emenda:", error);
      setModalExclusao((prev) => ({ ...prev, loading: false }));
      setToast({
        show: true,
        message: `Erro ao excluir emenda: ${error.message}`,
        type: "error",
      });
    }
  };

  // ✅ NOVO: Handler para cancelar exclusão
  const handleCancelarExclusao = () => {
    console.log("❌ Exclusão cancelada pelo usuário");
    setModalExclusao({ isOpen: false, emenda: null, loading: false });
  };

  // ✅ CÁLCULOS: Estatísticas das emendas
  const totalEmendas = emendasFiltradas.length;
  const emendasExecutadas = emendasFiltradas.filter(
    (emenda) => parseFloat(emenda.percentualExecutado) >= 100,
  ).length;
  const emendasAtivas = emendasFiltradas.filter(
    (emenda) => parseFloat(emenda.percentualExecutado) > 0,
  ).length;
  const valorTotal = emendasFiltradas.reduce(
    (acc, emenda) => acc + (emenda.valorTotal || 0),
    0,
  );

  console.log("📊 Estatísticas calculadas:", {
    totalEmendas,
    emendasExecutadas,
    emendasAtivas,
    valorTotal,
  });

  // ✅ RENDERIZAÇÃO: Loading
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando emendas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header compacto */}
      <div style={styles.compactHeader}>
        <span style={styles.statusInfo}>
          <span style={styles.statusText}>📊 Sistema:</span>
          <span style={styles.statusValue}>Ativo</span>
        </span>
        <span style={styles.statusInfo}>|</span>
        <span style={styles.statusInfo}>
          <span style={styles.statusText}>👤 Usuário:</span>
          <span style={styles.statusValue}>{user?.nome}</span>
        </span>
        <span style={styles.statusInfo}>|</span>
        <span style={styles.statusInfo}>
          <span style={styles.versionText}>
            {formatVersion("Emendas.jsx v2.3")}
          </span>
        </span>
      </div>

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
          onDelete={handleDeletar}
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

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "20px",
  },

  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #154360",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    color: "#154360",
    fontSize: "18px",
    fontWeight: "500",
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  statCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    border: "2px solid #dee2e6",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },

  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#154360",
    margin: "0 0 10px 0",
  },

  statLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0",
  },

  actionContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  primaryButton: {
    backgroundColor: "#154360",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(21, 67, 96, 0.3)",
  },

  refreshButton: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(108, 117, 125, 0.3)",
  },

  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginTop: "20px",
    border: "2px dashed #dee2e6",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },

  emptyText: {
    color: "#666",
    fontSize: "16px",
    marginTop: "10px",
  },

  retryButton: {
    marginTop: "20px",
    backgroundColor: "#154360",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

// ✅ Adicionar keyframes para animação do spinner
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  ${Object.keys(styles)
    .map((key) => {
      if (key === "primaryButton" || key === "refreshButton") {
        return `
          .${key}:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
          }
          .${key}:active {
            transform: translateY(0);
          }
        `;
      }
      return "";
    })
    .join("")}
`;
document.head.appendChild(style);

export default Emendas;