// Emendas.jsx - COM FILTRO POR MUNICÍPIO PARA OPERADORES
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import EmendaForm from "./EmendaForm";
import EmendasTable from "./EmendasTable";
import EmendasFilters from "./EmendasFilters";
import PrimeiraDespesaModal from "./PrimeiraDespesaModal";

export default function Emendas({ usuario }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ VERIFICAR DADOS DO USUÁRIO
  console.log("✅ Sistema SICEFSUS v2.1 - Dados do usuário:", {
    email: usuario?.email,
    tipo: usuario?.tipo,
    role: usuario?.role,
    municipio: usuario?.municipio,
    uf: usuario?.uf,
  });

  // ✅ DETERMINAR PERMISSÕES BASEADO NO TIPO
  const userRole = usuario?.tipo || usuario?.role || "operador";
  const userMunicipio = usuario?.municipio || "";
  const userUf = usuario?.uf || "";

  console.log("🔐 Permissões do usuário:", { userRole, userMunicipio, userUf });

  // Estados
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmenda, setEditingEmenda] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmenda, setSelectedEmenda] = useState(null);
  const [filtros, setFiltros] = useState({});

  // ✅ FUNÇÃO PARA CARREGAR EMENDAS COM FILTRO AUTOMÁTICO
  const carregarEmendas = async () => {
    try {
      setLoading(true);
      console.log("📋 Carregando emendas...");

      let emendasQuery;

      // ✅ ADMIN VÊ TODAS AS EMENDAS
      if (userRole === "admin") {
        console.log("👑 Admin: Carregando todas as emendas");
        emendasQuery = query(
          collection(db, "emendas"),
          orderBy("dataAprovacao", "desc"),
        );
      }
      // ✅ OPERADOR VÊ APENAS SEU MUNICÍPIO
      else if (userRole === "operador" && userMunicipio) {
        console.log(
          `📍 Operador: Carregando emendas de ${userMunicipio}/${userUf}`,
        );
        emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", userMunicipio),
          orderBy("dataAprovacao", "desc"),
        );
      }
      // ✅ SEM PERMISSÃO OU SEM MUNICÍPIO
      else {
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

      // ✅ CARREGAR DESPESAS RELACIONADAS ÀS EMENDAS FILTRADAS
      if (emendasData.length > 0) {
        const emendasIds = emendasData.map((emenda) => emenda.id);
        console.log("💰 Carregando despesas das emendas filtradas...");

        // Carregar despesas em lotes para evitar limite do Firestore
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

  // ✅ CALCULAR MÉTRICAS COM DESPESAS FILTRADAS
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

  // ✅ APLICAR FILTROS LOCAIS
  const emendasFiltradas = useMemo(() => {
    let resultado = emendas;

    // Aplicar filtros de busca
    if (filtros.termoBusca) {
      const termo = filtros.termoBusca.toLowerCase();
      resultado = resultado.filter(
        (emenda) =>
          emenda.numero?.toLowerCase().includes(termo) ||
          emenda.autor?.toLowerCase().includes(termo) ||
          emenda.municipio?.toLowerCase().includes(termo),
      );
    }

    if (filtros.municipio) {
      resultado = resultado.filter(
        (emenda) =>
          emenda.municipio?.toLowerCase() === filtros.municipio.toLowerCase(),
      );
    }

    if (filtros.uf) {
      resultado = resultado.filter(
        (emenda) => emenda.uf?.toLowerCase() === filtros.uf.toLowerCase(),
      );
    }

    return calcularMetricasComDespesas(resultado);
  }, [emendas, despesas, filtros]);

  // ✅ CALCULAR MÉTRICAS GERAIS
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
      saldoDisponivel: valorTotal - valorExecutadoTotal,
      percentualExecutado:
        valorTotal > 0 ? (valorExecutadoTotal / valorTotal) * 100 : 0,
    };
  };

  // Carregar dados ao montar
  useEffect(() => {
    carregarEmendas();
  }, [userRole, userMunicipio, userUf]);

  // ✅ HANDLERS
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
    setShowForm(false);
    setEditingEmenda(null);
  };

  const handleVoltarParaListagem = () => {
    setShowForm(false);
    setEditingEmenda(null);
    carregarEmendas();
  };

  const handleSalvarEmenda = async () => {
    await carregarEmendas();
    setShowForm(false);
    setEditingEmenda(null);
  };

  const handleDeletar = async (emenda) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a emenda ${emenda.numero}?`,
      )
    ) {
      try {
        // Implementar exclusão se necessário
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

  // ✅ MODO FORMULÁRIO
  if (showForm) {
    console.log("🎯 Sistema SICEFSUS v2.1 - Modal UX carregado");

    return (
      <EmendaForm
        emenda={editingEmenda}
        onSave={handleSalvarEmenda}
        onCancel={handleVoltar}
        usuario={usuario}
      />
    );
  }

  // ✅ MÉTRICAS
  const totalEmendas = emendasFiltradas.length;
  const {
    emendasComRecursos,
    emendasComDespesas,
    valorTotal,
    valorExecutadoTotal,
  } = calcularMetricas();

  // ✅ RENDERIZAÇÃO PRINCIPAL
  const renderContent = () => (
    <div style={styles.container}>
      {/* ✅ HEADER COM FILTRO ATIVO */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>📋 Emendas SICEFSUS</h1>
          <p style={styles.subtitle}>
            Gerencie emendas parlamentares do SUS
            {userRole === "operador" && userMunicipio && (
              <span style={styles.filterBadge}>
                📍 Filtrado para: {userMunicipio}/{userUf}
              </span>
            )}
          </p>
        </div>
        <div style={styles.headerActions}>
          {userRole === "admin" && (
            <button onClick={handleCriar} style={styles.primaryButton}>
              ➕ Nova Emenda
            </button>
          )}
        </div>
      </div>

      {/* ✅ MÉTRICAS */}
      <div style={styles.metricas}>
        <div style={styles.metricaCard}>
          <div style={styles.metricaNumero}>{totalEmendas}</div>
          <div style={styles.metricaLabel}>Total de Emendas</div>
        </div>
        <div style={styles.metricaCard}>
          <div style={styles.metricaNumero}>{emendasComRecursos}</div>
          <div style={styles.metricaLabel}>Com Recursos</div>
        </div>
        <div style={styles.metricaCard}>
          <div style={styles.metricaNumero}>{emendasComDespesas}</div>
          <div style={styles.metricaLabel}>Com Despesas</div>
        </div>
        <div style={styles.metricaCard}>
          <div style={styles.metricaNumero}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 0,
            }).format(valorTotal)}
          </div>
          <div style={styles.metricaLabel}>Valor Total</div>
        </div>
      </div>

      {/* ✅ FILTROS */}
      <EmendasFilters
        emendas={emendas}
        onFilter={setFiltros}
        showMunicipioFilter={userRole === "admin"} // Só admin vê filtro de município
      />

      {/* ✅ TABELA */}
      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Carregando emendas...</p>
        </div>
      ) : (
        <EmendasTable
          emendas={emendasFiltradas}
          onView={handleVisualizar}
          onEdit={handleEditar}
          onDelete={handleDeletar}
          onDespesas={handleDespesas}
          userRole={userRole}
        />
      )}

      {/* ✅ MODAL PRIMEIRA DESPESA */}
      {showModal && (
        <PrimeiraDespesaModal
          emenda={selectedEmenda}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );

  return renderContent();
}

// ✅ ESTILOS
const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },

  headerLeft: {
    flex: 1,
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
  },

  subtitle: {
    margin: 0,
    fontSize: "16px",
    color: "#6c757d",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  filterBadge: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  metricas: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },

  metricaCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
  },

  metricaNumero: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#007bff",
    marginBottom: "8px",
  },

  metricaLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500",
  },

  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
