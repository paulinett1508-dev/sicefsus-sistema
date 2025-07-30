// Emendas.jsx - LAYOUT PADRONIZADO COM DESPESAS
// ✅ REMOVIDO: Seção "Emendas SICEFSUS"
// ✅ ADICIONADO: Status bar igual Despesas
// ✅ PADRONIZADO: Botões e layout conforme Despesas
// ✅ MANTIDO: Toda lógica de filtro por município
// ✅ CORRIGIDO: Conflito CSS margin/marginBottom

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import EmendaForm from "./emenda/EmendaForm";
import EmendasTable from "./EmendasTable";
import EmendasFilters from "./EmendasFilters";
import PrimeiraDespesaModal from "./PrimeiraDespesaModal";

export default function Emendas({ usuario }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ VERIFICAÇÃO DOS DADOS DO USUÁRIO (mantida)
  console.log("✅ Sistema SICEFSUS v2.1 - Dados do usuário:", {
    email: usuario?.email,
    tipo: usuario?.tipo,
    role: usuario?.role,
    municipio: usuario?.municipio,
    uf: usuario?.uf,
  });

  // ✅ DETERMINAR PERMISSÕES (mantido)
  const userRole = usuario?.tipo || usuario?.role || "operador";
  const userMunicipio = usuario?.municipio || "";
  const userUf = usuario?.uf || "";

  console.log("🔐 Permissões do usuário:", { userRole, userMunicipio, userUf });

  // Estados (mantidos)
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmenda, setEditingEmenda] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmenda, setSelectedEmenda] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [emendasFiltradas, setEmendasFiltradas] = useState([]);

  // ✅ FUNÇÃO CARREGAR EMENDAS (mantida exatamente)
  const carregarEmendas = async () => {
    try {
      setLoading(true);
      console.log("📋 Carregando emendas...");

      let emendasQuery;

      if (userRole === "admin") {
        console.log("👑 Admin: Carregando todas as emendas");
        emendasQuery = query(
          collection(db, "emendas"),
          orderBy("dataAprovacao", "desc"),
        );
      } else if (userRole === "operador" && userMunicipio) {
        console.log(
          `📍 Operador: Carregando emendas de ${userMunicipio}/${userUf}`,
        );
        emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", userMunicipio),
          orderBy("dataAprovacao", "desc"),
        );
      } else {
        console.log("⚠️ Usuário sem permissões ou município definido");
        setEmendas([]);
        setLoading(false);
        return;
      }

      const emendasSnapshot = await getDocs(emendasQuery);
      const emendasData = emendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`✅ ${emendasData.length} emendas carregadas`);
      setEmendas(emendasData);
      setEmendasFiltradas(emendasData);

      // Carregar despesas relacionadas
      if (emendasData.length > 0) {
        const emendasIds = emendasData.map((emenda) => emenda.id);
        console.log("💰 Carregando despesas das emendas filtradas...");

        const batchSize = 10;
        let todasDespesas = [];

        for (let i = 0; i < emendasIds.length; i += batchSize) {
          const batch = emendasIds.slice(i, i + batchSize);
          const despesasQuery = query(
            collection(db, "despesas"),
            where("emendaId", "in", batch),
            orderBy("data", "desc"),
          );

          const despesasSnapshot = await getDocs(despesasQuery);
          const despesasBatch = despesasSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          todasDespesas = [...todasDespesas, ...despesasBatch];
        }

        console.log(`✅ ${todasDespesas.length} despesas carregadas`);
        setDespesas(todasDespesas);
      } else {
        setDespesas([]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar emendas:", error);
      setEmendas([]);
      setDespesas([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CALCULAR MÉTRICAS (mantida)
  const calcularMetricasComDespesas = (emendasList) => {
    return emendasList.map((emenda) => {
      const despesasEmenda = despesas.filter((d) => d.emendaId === emenda.id);
      const totalDespesas = despesasEmenda.length;
      const valorExecutado = despesasEmenda.reduce((acc, despesa) => {
        const valor = parseFloat(despesa.valor || 0);
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);

      const valorRecurso = parseFloat(emenda.valorRecurso || emenda.valor || 0);
      const saldoDisponivel = valorRecurso - valorExecutado;
      const percentualExecutado =
        valorRecurso > 0 ? (valorExecutado / valorRecurso) * 100 : 0;

      return {
        ...emenda,
        totalDespesas,
        valorExecutado,
        saldoDisponivel,
        percentualExecutado,
      };
    });
  };

  const calcularMetricas = () => {
    const emendasAtualizadas = calcularMetricasComDespesas(emendas);
    const emendasLength = emendasAtualizadas.length;
    const comDespesas = emendasAtualizadas.filter(
      (e) => e.totalDespesas > 0,
    ).length;

    const valorTotal = emendasAtualizadas.reduce(
      (acc, e) => acc + parseFloat(e.valorRecurso || e.valor || 0),
      0,
    );

    const valorExecutadoTotal = emendasAtualizadas.reduce(
      (acc, e) => acc + e.valorExecutado,
      0,
    );

    return {
      totalEmendas: emendasLength,
      emendasComRecursos: emendasLength,
      emendasComDespesas: comDespesas,
      valorTotal,
      valorExecutadoTotal,
    };
  };

  // Handlers (mantidos)
  const handleVisualizar = (emenda) => {
    navigate(`/emendas/${emenda.id}/fluxo`);
  };

  const handleEditar = (emenda) => {
    setEditingEmenda(emenda);
    setShowForm(true);
  };

  const handleCriar = () => {
    console.log("➕ Criando nova emenda");
    setEditingEmenda(null);
    setShowForm(true);
  };

  const handleVoltar = () => {
    console.log("🔙 Emendas.jsx: handleVoltar executado");
    setShowForm(false);
    setEditingEmenda(null);
  };

  const handleSalvarEmenda = async () => {
    console.log("💾 Emendas.jsx: handleSalvarEmenda executado");
    await carregarEmendas();
    setShowForm(false);
    setEditingEmenda(null);
  };

  // ✅ NOVO: Handler específico para cancelamento do modal
  const handleCancelarFormulario = () => {
    console.log("❌ Emendas.jsx: handleCancelarFormulario executado - voltando para listagem");
    setShowForm(false);
    setEditingEmenda(null);
    // Garantir que voltamos para a listagem sem interferências
    if (window.location.pathname !== "/emendas") {
      console.log("🔄 Emendas.jsx: Forçando navegação para /emendas");
      window.location.href = "/emendas";
    }
  };

  const handleDeletar = async (emenda) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a emenda ${emenda.numero}?`,
      )
    ) {
      try {
        await carregarEmendas();
      } catch (error) {
        console.error("❌ Erro ao excluir emenda:", error);
      }
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    if (selectedEmenda) {
      navigate(`/despesas?emendaId=${selectedEmenda.id}&acao=criar`);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setSelectedEmenda(null);
  };

  const handleDespesas = (emenda) => {
    setSelectedEmenda(emenda);
    setShowModal(true);
  };

  // ✅ HANDLER PARA FILTROS SIMPLIFICADOS - OTIMIZADO
  const handleFiltroChange = useCallback((emendasFiltradas) => {
    console.log(
      "🔍 Aplicando filtros - emendas filtradas:",
      emendasFiltradas.length,
    );
    setEmendasFiltradas(emendasFiltradas);
  }, []); // ✅ Sem dependências para evitar recriação

  const recarregarDados = async () => {
    await carregarEmendas();
  };

  // Carregar dados ao montar
  useEffect(() => {
    carregarEmendas();
  }, [userRole, userMunicipio, userUf]);

  // ✅ MODO FORMULÁRIO (mantido)
  if (showForm) {
    return (
      <EmendaForm
        emenda={editingEmenda}
        onSave={handleSalvarEmenda}
        onCancel={handleCancelarFormulario}
        usuario={usuario}
      />
    );
  }

  // ✅ MÉTRICAS CALCULADAS
  const totalEmendas = emendasFiltradas.length;
  const { emendasComRecursos, emendasComDespesas, valorTotal } =
    calcularMetricas();

  // ✅ RENDERIZAÇÃO PRINCIPAL - LAYOUT PADRONIZADO
  return (
    <div style={styles.container}>
      {/* ✅ STATUS BAR IGUAL DESPESAS */}
      <div style={styles.statusBar}>
        <span>Status: ✅ Operacional</span>
        <span style={styles.divider}>|</span>
        <span>Versão: v2.1</span>
        <span style={styles.divider}>|</span>
        <span>
          Usuário:{" "}
          {userRole === "admin"
            ? "👑 Admin"
            : `🏘️ ${userMunicipio || "Município não cadastrado"}`}
        </span>
        <span style={styles.divider}>|</span>
        <span>
          Dados: {loading ? "Carregando..." : `${totalEmendas} emendas`}
        </span>
      </div>

      {/* ✅ BANNER DE FILTRO ATIVO PARA OPERADORES */}
      {userRole === "operador" && userMunicipio && (
        <div style={styles.permissaoInfo}>
          <span style={styles.permissaoIcon}>🔒</span>
          <div style={styles.permissaoContent}>
            <span style={styles.permissaoTexto}>
              <strong>Filtro Ativo:</strong> Exibindo apenas emendas do
              município{" "}
              <strong>
                {userMunicipio}/{userUf || "UF não informada"}
              </strong>
            </span>
            <span style={styles.permissaoSubtexto}>
              {emendas.length} emenda(s) disponíveis para seu município
            </span>
          </div>
        </div>
      )}

      {/* ✅ MÉTRICAS IGUAIS DESPESAS */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{totalEmendas}</h3>
          <p style={styles.statLabel}>TOTAL DE EMENDAS</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{emendasComRecursos}</h3>
          <p style={styles.statLabel}>COM RECURSOS</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{emendasComDespesas}</h3>
          <p style={styles.statLabel}>COM DESPESAS</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>
            {valorTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 0,
            })}
          </h3>
          <p style={styles.statLabel}>VALOR TOTAL</p>
        </div>
      </div>

      {/* ✅ BOTÕES DE AÇÃO IGUAIS DESPESAS */}
      <div style={styles.actionContainer}>
        <button style={styles.primaryButton} onClick={handleCriar}>
          ➕ Nova Emenda
        </button>
        <button
          style={styles.refreshButton}
          onClick={recarregarDados}
          disabled={loading}
        >
          🔄 {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {/* ✅ FILTROS SIMPLIFICADOS */}
      <EmendasFilters
        emendas={emendas}
        onFilterChange={handleFiltroChange}
        totalEmendas={totalEmendas}
      />

      {/* ✅ CONTEÚDO DA TABELA */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Carregando emendas...</p>
        </div>
      ) : totalEmendas === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>📋</div>
          <h3>Nenhuma emenda encontrada</h3>
          <p style={styles.emptyText}>
            {userRole === "operador" && userMunicipio
              ? `Nenhuma emenda encontrada para o município ${userMunicipio}`
              : "Adicione uma nova emenda para começar."}
          </p>
        </div>
      ) : (
        <EmendasTable
          emendas={calcularMetricasComDespesas(emendasFiltradas)}
          onView={handleVisualizar}
          onEdit={handleEditar}
          onDelete={handleDeletar}
          onDespesas={handleDespesas}
          userRole={userRole}
        />
      )}

      {/* ✅ MODAL PRIMEIRA DESPESA (mantido) */}
      {showModal && (
        <PrimeiraDespesaModal
          emenda={selectedEmenda}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
}

// ✅ ESTILOS PADRONIZADOS COM DESPESAS - CORREÇÃO CSS
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  statusBar: {
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

  // ✅ CORREÇÃO: Remover conflito margin/marginBottom
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
};

// CSS para animação
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
