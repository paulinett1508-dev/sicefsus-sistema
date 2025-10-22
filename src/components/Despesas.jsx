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

  const handleEditar = (despesa) => {
    setDespesaSelecionada(despesa);
    setCurrentView("editar");
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

// ✅ ESTILOS SIMPLIFICADOS
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
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

  operadorBanner: {
    backgroundColor: "#f8f9fa",
    borderLeft: "4px solid #0066cc",
    padding: "10px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#495057",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    borderRadius: "0 4px 4px 0",
  },

  errorMessage: {
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    margin: "20px 0",
  },
};

export default Despesas;
