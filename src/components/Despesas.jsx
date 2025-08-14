// Despesas.jsx - VERSÃO REFATORADA
// Componente orquestrador que delega responsabilidades aos sub-componentes

import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  // Debug controlado
  useEffect(() => {
    console.log("🔍 Despesas - currentView mudou:", currentView);
  }, [currentView]);
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

  // ✅ FUNÇÃO PARA CALCULAR SALDO DISPONÍVEL
  const calcularEmendaInfoCompleta = useCallback(
    (emenda) => {
      if (!emenda) return null;

      // Buscar despesas desta emenda específica
      const despesasDaEmenda = despesas.filter((d) => d.emendaId === emenda.id);

      // Calcular valor executado
      const valorExecutado = despesasDaEmenda.reduce((soma, despesa) => {
        const valor = Number(despesa.valor) || 0;
        return soma + valor;
      }, 0);

      // Extrair valor total da emenda (com fallbacks)
      const valorTotal =
        Number(emenda.valor) ||
        Number(emenda.valorRecurso) ||
        Number(emenda.valorTotal) ||
        0;

      // Calcular saldo disponível
      const saldoDisponivel = valorTotal - valorExecutado;

      console.log("🔍 DEBUG SALDO EMENDA:");
      console.log("Emenda ID:", emenda.id);
      console.log("Valor Total:", valorTotal);
      console.log("Valor Executado:", valorExecutado);
      console.log("Saldo Disponível:", saldoDisponivel);
      console.log("Despesas encontradas:", despesasDaEmenda.length);

      // Retornar emenda completa com saldo calculado
      return {
        ...emenda,
        valorRecurso: valorTotal, // Padronizar campo de valor
        saldoDisponivel: saldoDisponivel,
      };
    },
    [despesas],
  );

  // 🚨 CALCULAR SALDO PARA TODAS AS EMENDAS DISPONÍVEIS
  const emendasComSaldo = useMemo(() => {
    return emendas.map((emenda) => calcularEmendaInfoCompleta(emenda));
  }, [emendas, calcularEmendaInfoCompleta]);

  // Renderização condicional por view
  if (
    currentView === "criar" ||
    currentView === "editar" ||
    currentView === "visualizar"
  ) {
    console.log("🔍 Renderizando formulário - View:", currentView);

    // Verificar se todos os dados necessários estão disponíveis
    if (!usuario) {
      console.error("❌ Usuário não encontrado");
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

    try {
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
            emendaInfo={calcularEmendaInfoCompleta(filtroAutomatico?.emenda)}
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
    } catch (error) {
      console.error("❌ Erro ao renderizar DespesaForm:", error);
      return (
        <div style={styles.container}>
          <div style={styles.errorMessage}>
            <h3>Erro ao carregar formulário</h3>
            <p>Detalhes: {error.message}</p>
            <button onClick={handleVoltar}>Voltar para Lista</button>
          </div>
        </div>
      );
    }
  }

  // Verificar se há erro crítico
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              carregarDados();
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // View principal - Listagem
  try {
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

        {/* Banner de Filtro Ativo - adicionar após DespesasStats */}
        {filtroAutomatico && filtroAutomatico.emenda && (
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '5px',
            padding: '12px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <span style={{
              color: '#155724',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <strong>Filtro Ativo:</strong> Exibindo apenas despesas da emenda {filtroAutomatico.emenda.numero} - {filtroAutomatico.emenda.objeto}
              {filtroAutomatico.emenda.municipio && ` do município ${filtroAutomatico.emenda.municipio}/${filtroAutomatico.emenda.uf}`}
            </span>
            <button
              onClick={() => {
                setFiltroAutomatico(null);
                navigate('/despesas');
                carregarDados();
              }}
              style={{
                marginLeft: 'auto',
                backgroundColor: 'transparent',
                border: '1px solid #155724',
                color: '#155724',
                padding: '4px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ✕ Limpar Filtro
            </button>
          </div>
        )}

        {/* Para operadores - mostrar filtro de município sempre ativo */}
        {userRole === 'operador' && userMunicipio && !filtroAutomatico && (
          <div style={{
            backgroundColor: '#cce5ff',
            border: '1px solid #b8daff',
            borderRadius: '5px',
            padding: '12px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '20px' }}>🏛️</span>
            <span style={{
              color: '#004085',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <strong>Filtro Ativo:</strong> Exibindo apenas despesas de emendas do município <strong>{userMunicipio}/{userUf}</strong>
            </span>
          </div>
        )}

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
  } catch (renderError) {
    console.error("❌ Erro na renderização principal:", renderError);
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          <h3>Oops! Algo deu errado</h3>
          <p>Ocorreu um erro inesperado. Por favor, recarregue a página.</p>
          <button onClick={() => window.location.reload()}>
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }
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