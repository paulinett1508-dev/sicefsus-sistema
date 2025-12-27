// src/components/Despesas.jsx
// ✅ REFATORADA: De 599 linhas para ~180 linhas
// 🎯 Responsabilidade única: Orquestração de views
// 🔧 Lógica delegada para hooks customizados

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

// ✅ HOOKS CUSTOMIZADOS
import { useDespesasData } from "../hooks/useDespesasData";
import { useDespesasCalculos } from "../hooks/useDespesasCalculos";

// ✅ COMPONENTES
import DespesaForm from "./DespesaForm";
import DespesasList from "./DespesasList";
import DespesasListHeader from "./despesa/DespesasListHeader";
import DespesasStats from "./despesa/DespesasStats";
import DespesasBanner from "./despesa/DespesasBanner";
import Toast from "./Toast";

const Despesas = ({ usuario }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // ✅ Estados de UI
  const [currentView, setCurrentView] = useState("listagem");
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [filtroAutomatico, setFiltroAutomatico] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // ✅ Dados do usuário
  const userRole = usuario?.tipo || "operador";
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  // ✅ HOOK DE DADOS (substitui 150+ linhas de lógica)
  const { despesas, emendas, loading, error, recarregar } = useDespesasData(
    usuario,
    params.id,
  );

  // ✅ HOOK DE CÁLCULOS (substitui 100+ linhas de lógica)
  const { calcularEmendaCompleta, emendasComSaldo, estatisticas } =
    useDespesasCalculos(despesas, emendas);

  // ✅ Processar filtro da location
  useEffect(() => {
    if (location.state?.filtroAutomatico) {
      setFiltroAutomatico(location.state.filtroAutomatico);
    }
  }, [location.state]);

  // ✅ Se vier de emenda específica, configurar filtro
  useEffect(() => {
    if (params.id && emendas.length > 0) {
      const emenda = emendas.find((e) => e.id === params.id);
      if (emenda) {
        setFiltroAutomatico({
          emendaId: params.id,
          emenda: calcularEmendaCompleta(emenda),
        });
      }
    }
  }, [params.id, emendas, calcularEmendaCompleta]);

  // ✅ HANDLERS DE NAVEGAÇÃO
  const handleCriar = () => {
    setDespesaSelecionada(null);
    setCurrentView("criar");
  };

  // ✅ Handler para editar - corrigido para garantir navegação
  const handleEditar = (despesa) => {
    console.log("🔧 Despesas.handleEditar CHAMADO:", {
      despesaId: despesa?.id,
      despesaDiscriminacao: despesa?.discriminacao,
      currentView,
    });

    // Definir despesa selecionada e mudar view
    setDespesaSelecionada(despesa);
    setCurrentView("editar");
    console.log("✅ View alterada para 'editar'");
  };


  const handleVisualizar = (despesa) => {
    setDespesaSelecionada(despesa);
    setCurrentView("visualizar");
  };

  const handleVoltar = () => {
    setCurrentView("listagem");
    setDespesaSelecionada(null);
  };

  const handleSalvarDespesa = async () => {
    await recarregar();
    handleVoltar();
    setToast({
      show: true,
      message: "Despesa salva com sucesso!",
      type: "success",
    });
  };

  const handleVoltarEmendas = () => {
    navigate("/emendas");
  };

  const handleLimparFiltro = () => {
    setFiltroAutomatico(null);
    navigate("/despesas");
    recarregar();
  };

  // ✅ RENDERIZAÇÃO: FORMULÁRIO
  if (["criar", "editar", "visualizar"].includes(currentView)) {
    if (!usuario) {
      return (
        <div style={styles.container}>
          <div style={styles.errorMessage}>
            <h3>Erro: Usuário não encontrado</h3>
            <p>Por favor, faça login novamente.</p>
            <button onClick={() => window.location.reload()}>
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <DespesaForm
          usuario={usuario}
          despesaParaEditar={despesaSelecionada}
          onCancelar={handleVoltar}
          onSalvar={handleSalvarDespesa}
          onSuccess={handleSalvarDespesa}
          emendasDisponiveis={emendasComSaldo}
          emendaPreSelecionada={filtroAutomatico?.emendaId}
          emendaInfo={calcularEmendaCompleta(filtroAutomatico?.emenda)}
          modoVisualizacao={currentView === "visualizar"}
          titulo={
            currentView === "criar"
              ? "Nova Despesa"
              : currentView === "editar"
                ? "Editar Despesa"
                : "Visualizar Despesa"
          }
        />
      </div>
    );
  }

  // ✅ RENDERIZAÇÃO: ERRO
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button onClick={recarregar}>Tentar Novamente</button>
        </div>
      </div>
    );
  }

  // ✅ RENDERIZAÇÃO: LISTAGEM PRINCIPAL
  return (
    <div style={styles.container}>
      {/* Toast de notificação */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* Header do sistema */}
      <DespesasListHeader
        usuario={usuario}
        loading={loading}
        totalDespesas={despesas.length}
        onVoltarEmendas={params.id ? handleVoltarEmendas : null}
        emenda={null}
      />

      {/* Estatísticas */}
      <DespesasStats
        despesas={despesas}
        loading={loading}
        filtroAutomatico={filtroAutomatico}
        userMunicipio={userMunicipio}
      />

      {/* Banner de filtro por emenda */}
      {filtroAutomatico?.emenda && (
        <DespesasBanner
          emenda={filtroAutomatico.emenda}
          quantidadeDespesas={
            despesas.filter((d) => d.emendaId === filtroAutomatico.emenda.id)
              .length
          }
          onLimpar={handleLimparFiltro}
        />
      )}

      {/* Banner para operadores sem filtro específico */}
      {userRole === "operador" &&
        userMunicipio &&
        !filtroAutomatico?.emenda && (
          <div style={styles.operadorBanner}>
            <strong style={{ color: "#0066cc" }}>Filtro:</strong>{" "}
            {userMunicipio}/{userUf}
          </div>
        )}

      {/* Botões de ação */}
      <div style={styles.actionContainer}>
        <button style={styles.primaryButton} onClick={handleCriar}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Nova Despesa
        </button>
        <button
          style={styles.refreshButton}
          onClick={recarregar}
          disabled={loading}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {/* Lista de despesas */}
      <DespesasList
        despesas={despesas}
        emendas={emendas}
        loading={loading}
        error={error}
        onEdit={handleEditar}
        onView={handleVisualizar}
        onRecarregar={recarregar}
        usuario={usuario}
        filtroInicial={filtroAutomatico}
      />
    </div>
  );
};

// ✅ ESTILOS MODERNOS
const styles = {
  container: {
    padding: "16px 32px",
    backgroundColor: "var(--theme-bg, #F8FAFC)",
    minHeight: "100vh",
    fontFamily: "var(--font-family, 'Inter', sans-serif)",
  },

  actionContainer: {
    marginBottom: "20px",
    display: "flex",
    gap: "8px",
  },

  primaryButton: {
    backgroundColor: "var(--success, #10B981)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 2px rgba(16, 185, 129, 0.2)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  refreshButton: {
    backgroundColor: "var(--primary, #2563EB)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 2px rgba(37, 99, 235, 0.2)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  operadorBanner: {
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderLeft: "4px solid var(--primary, #2563EB)",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "var(--gray-600, #475569)",
    boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
    borderRadius: "0 8px 8px 0",
    border: "1px solid var(--theme-border, #E2E8F0)",
    borderLeftWidth: "4px",
    borderLeftColor: "var(--primary, #2563EB)",
  },

  errorMessage: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    margin: "20px 0",
  },
};

export default Despesas;