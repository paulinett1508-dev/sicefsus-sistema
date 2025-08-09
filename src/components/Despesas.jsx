// Despesas.jsx - VERSÃO REFATORADA
// Componente orquestrador que delega responsabilidades aos sub-componentes

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import DespesaForm from "./DespesaForm";
import DespesasList from "./DespesasList";
import DespesasListHeader from "./despesa/DespesasListHeader"; // Nome mais claro
import DespesasStats from "./despesa/DespesasStats";
import Toast from "./Toast";

const Despesas = ({ usuario }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Estados principais
  const [currentView, setCurrentView] = useState("listagem");
  
  // Debug
  console.log("🔍 Despesas - currentView:", currentView);
  console.log("🔍 Despesas - usuario:", usuario);
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [despesas, setDespesas] = useState([]);
  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroAutomatico, setFiltroAutomatico] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Dados do usuário
  const userRole = usuario?.tipo || "operador";
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  // Hook para carregar dados
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Se vier de uma emenda específica
      if (params.id) {
        const emendaDoc = await getDoc(doc(db, "emendas", params.id));
        if (emendaDoc.exists()) {
          const emendaData = { id: emendaDoc.id, ...emendaDoc.data() };
          setEmendas([emendaData]);

          // Carregar apenas despesas desta emenda
          const despesasQuery = query(
            collection(db, "despesas"),
            where("emendaId", "==", params.id),
          );
          const despesasSnapshot = await getDocs(despesasQuery);
          const despesasData = despesasSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setDespesas(despesasData);
          setFiltroAutomatico({
            emendaId: params.id,
            emenda: emendaData,
          });

          return;
        }
      }

      // Carregamento normal com filtros por role
      let emendasQuery = collection(db, "emendas");
      let emendasData = [];

      if (userRole === "admin") {
        const snapshot = await getDocs(emendasQuery);
        emendasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else if (userMunicipio && userUf) {
        // Filtrar por município para operadores
        const snapshot = await getDocs(emendasQuery);
        const todasEmendas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const normalizarTexto = (texto) => {
          if (!texto) return "";
          return texto
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        };

        emendasData = todasEmendas.filter(
          (emenda) =>
            normalizarTexto(emenda.municipio) ===
            normalizarTexto(userMunicipio),
        );
      }

      setEmendas(emendasData);

      // Carregar despesas das emendas permitidas
      if (emendasData.length > 0) {
        const emendasIds = emendasData.map((e) => e.id);
        const despesasData = [];

        // Processar em lotes
        for (let i = 0; i < emendasIds.length; i += 10) {
          const batch = emendasIds.slice(i, i + 10);
          const despesasQuery = query(
            collection(db, "despesas"),
            where("emendaId", "in", batch),
          );
          const snapshot = await getDocs(despesasQuery);
          snapshot.docs.forEach((doc) => {
            despesasData.push({ id: doc.id, ...doc.data() });
          });
        }

        setDespesas(despesasData);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [params.id, userRole, userMunicipio, userUf]);

  // Carregar dados na montagem
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Processar filtro da location
  useEffect(() => {
    if (location.state?.filtroAutomatico) {
      setFiltroAutomatico(location.state.filtroAutomatico);
    }
  }, [location.state]);

  // Handlers de navegação
  const handleCriar = () => {
    console.log("🔍 Mudando para view 'criar'");
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
    await carregarDados();
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

  // Renderização condicional por view
  if (currentView === "criar" || currentView === "editar" || currentView === "visualizar") {
    return (
      <div style={styles.container}>
        <DespesaForm
          usuario={usuario}
          despesaParaEditar={despesaSelecionada}
          onCancelar={handleVoltar}
          onSalvar={handleSalvarDespesa}
          onSuccess={handleSalvarDespesa}
          emendasDisponiveis={emendas}
          emendaPreSelecionada={filtroAutomatico?.emendaId}
          emendaInfo={filtroAutomatico?.emenda}
          modoVisualizacao={currentView === "visualizar"}
          titulo={
            currentView === "criar" ? "Nova Despesa" :
            currentView === "editar" ? "Editar Despesa" :
            "Visualizar Despesa"
          }
        />
      </div>
    );
  }

  // View principal - Listagem
  return (
    <div style={styles.container}>
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
        emenda={filtroAutomatico?.emenda}
      />

      {/* Estatísticas */}
      <DespesasStats
        despesas={despesas}
        loading={loading}
        filtroAutomatico={filtroAutomatico}
        userMunicipio={userMunicipio}
      />

      {/* Botões de ação */}
      <div style={styles.actionContainer}>
        <button 
          style={styles.primaryButton} 
          onClick={() => {
            console.log("🖱️ Clicou em Nova Despesa");
            handleCriar();
          }}
        >
          ➕ Nova Despesa
        </button>
        <button
          style={styles.refreshButton}
          onClick={carregarDados}
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
        onRecarregar={carregarDados}
        usuario={usuario}
        filtroInicial={filtroAutomatico}
      />
    </div>
  );
};

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
};

export default Despesas;
