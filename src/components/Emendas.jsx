// Emendas.jsx - Sistema SICEFSUS v2.0 - COM MODAL UX MELHORADO
// ✅ ATUALIZADO: Modal UX para primeira despesa implementado

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import EmendaForm from "./EmendaForm";
import EmendasTable from "./EmendasTable";
import DespesaForm from "./DespesaForm";
import PrimeiraDespesaModal from "./PrimeiraDespesaModal"; // ✅ NOVO IMPORT
import useEmendaDespesa from "../hooks/useEmendaDespesa";

const Emendas = ({ usuario }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("listagem");
  const [emendaSelecionada, setEmendaSelecionada] = useState(null);

  // ✅ NOVOS ESTADOS PARA O MODAL UX
  const [showPrimeiraDespesaModal, setShowPrimeiraDespesaModal] = useState(false);
  const [emendaParaPrimeiraDespesa, setEmendaParaPrimeiraDespesa] = useState(null);

  // ✅ CORREÇÃO CRÍTICA: Usar dados direto da prop usuario
  const userRole = usuario?.role;
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  console.log("✅ Sistema SICEFSUS v2.0 - Dados do usuário:", {
    email: usuario?.email,
    role: userRole,
    municipio: userMunicipio,
    uf: userUf,
  });

  // ✅ Hook integrado - COM USUÁRIO COMPLETO direto da prop
  const {
    emendas,
    loading,
    error,
    atualizarSaldoEmenda,
    obterEstatisticasGerais,
    recarregar,
  } = useEmendaDespesa(usuario, {
    carregarTodasEmendas: userRole !== null,
    incluirEstatisticas: true,
    autoRefresh: false,
    filtroMunicipio: userRole !== "admin" ? userMunicipio : null,
    filtroUf: userRole !== "admin" ? userUf : null,
    userRole: userRole,
  });

  // ✅ CORREÇÃO: Calcular métricas com despesas em tempo real
  const [emendasComMetricas, setEmendasComMetricas] = useState([]);
  const [calculandoMetricas, setCalculandoMetricas] = useState(false);

  // ✅ CORREÇÃO: Função para calcular métricas de despesas
  const calcularMetricasComDespesas = useCallback(async (emendasData) => {
    if (!emendasData || emendasData.length === 0) return [];

    setCalculandoMetricas(true);
    console.log(
      "📊 Calculando métricas de despesas para",
      emendasData.length,
      "emendas",
    );

    try {
      const emendasComMetricas = await Promise.all(
        emendasData.map(async (emenda) => {
          try {
            // Buscar despesas da emenda
            const despesasQuery = query(
              collection(db, "despesas"),
              where("emendaId", "==", emenda.id),
            );
            const despesasSnapshot = await getDocs(despesasQuery);

            const totalDespesas = despesasSnapshot.size;
            const valorExecutado = despesasSnapshot.docs.reduce(
              (sum, doc) => sum + (doc.data().valor || 0),
              0,
            );

            const valorRecurso = emenda.valorRecurso || emenda.valorTotal || 0;
            const saldoDisponivel = valorRecurso - valorExecutado;
            const percentualExecutado =
              valorRecurso > 0 ? (valorExecutado / valorRecurso) * 100 : 0;

            return {
              ...emenda,
              totalDespesas,
              valorExecutado,
              saldoDisponivel,
              percentualExecutado,
              temDespesas: totalDespesas > 0,
            };
          } catch (error) {
            console.error(
              "Erro ao calcular métricas para emenda:",
              emenda.id,
              error,
            );
            return {
              ...emenda,
              totalDespesas: 0,
              valorExecutado: 0,
              temDespesas: false,
            };
          }
        }),
      );

      console.log("✅ Métricas calculadas:", emendasComMetricas.length);
      return emendasComMetricas;
    } catch (error) {
      console.error("❌ Erro ao calcular métricas:", error);
      return emendasData.map((emenda) => ({
        ...emenda,
        totalDespesas: 0,
        temDespesas: false,
      }));
    } finally {
      setCalculandoMetricas(false);
    }
  }, []);

  // ✅ Efeito para calcular métricas quando emendas mudam
  useEffect(() => {
    const calcularMetricas = async () => {
      if (emendas && emendas.length > 0) {
        const emendasAtualizadas = await calcularMetricasComDespesas(emendas);
        setEmendasComMetricas(emendasAtualizadas);
      } else {
        setEmendasComMetricas([]);
      }
    };

    calcularMetricas();
  }, [emendas, calcularMetricasComDespesas]);

  // ✅ UseEffect OTIMIZADO - só roda na primeira vez
  useEffect(() => {
    console.log("🎯 Sistema SICEFSUS v2.0 - Fluxo Emenda->Despesa carregado");
  }, []);

  // ✅ Log otimizado para dados
  useEffect(() => {
    const emendasLength = emendasComMetricas?.length || 0;
    if (emendasLength > 0) {
      console.log("✅ Emendas com métricas carregadas:", emendasLength);
      const comDespesas = emendasComMetricas.filter(
        (e) => e.temDespesas,
      ).length;
      console.log("💰 Emendas com despesas:", comDespesas);
    }
    if (error) {
      console.error("❌ Erro no hook:", error);
    }
  }, [emendasComMetricas?.length, error]);

  // Handlers para navegação
  const handleVisualizar = (emenda) => {
    console.log("👁️ Visualizando emenda:", emenda.numero);
    setEmendaSelecionada(emenda);
    setCurrentView("visualizar");
  };

  const handleEditar = (emenda) => {
    console.log("✏️ Editando emenda:", emenda.numero);
    setEmendaSelecionada(emenda);
    setCurrentView("editar");
  };

  const handleCriar = () => {
    console.log("➕ Criando nova emenda");
    setEmendaSelecionada(null);
    setCurrentView("criar");
  };

  const handleVoltar = () => {
    console.log("🔄 Voltando para listagem");
    setCurrentView("listagem");
    setEmendaSelecionada(null);
  };

  const handleVoltarParaListagem = () => {
    if (currentView === "editar" || currentView === "criar") {
      if (
        window.confirm("Tem certeza que deseja sair sem salvar as alterações?")
      ) {
        handleVoltar();
      }
    } else {
      handleVoltar();
    }
  };

  // ✅ CORREÇÃO DEFINITIVA: handleSalvarEmenda funcional
  const handleSalvarEmenda = useCallback(
    async (dadosSalvos) => {
      console.log("📝 handleSalvarEmenda chamado com:", dadosSalvos);

      try {
        // Aguardar recarregamento imediato
        await recarregar();
        console.log("✅ Dados recarregados após salvamento");

        // Voltar para listagem após confirmação
        handleVoltar();
      } catch (error) {
        console.error("❌ Erro no handleSalvarEmenda:", error);
      }
    },
    [recarregar],
  );

  // ✅ FUNÇÃO DELETAR IMPLEMENTADA CORRETAMENTE
  const handleDeletar = async (emendaId) => {
    console.log("🗑️ Deletar emenda ID:", emendaId);

    if (!emendaId) {
      alert("ID da emenda não encontrado!");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir esta emenda?")) {
      try {
        await deleteDoc(doc(db, "emendas", emendaId));
        await recarregar();
        console.log("✅ Emenda deletada com sucesso:", emendaId);
        alert("Emenda deletada com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao deletar emenda:", error);
        alert("Erro ao deletar emenda. Tente novamente.");
      }
    }
  };

  // ✅ FUNÇÃO MODIFICADA: Handler de despesas com MODAL UX
  const handleDespesas = useCallback(
    (emenda) => {
      console.log(
        "💰 Acessando despesas da emenda:",
        emenda.numero,
        "- Total:",
        emenda.totalDespesas,
      );

      // Verificar se tem despesas
      if (!emenda.totalDespesas || emenda.totalDespesas === 0) {
        // ✅ NOVO: Usar modal UX ao invés de window.confirm
        setEmendaParaPrimeiraDespesa(emenda);
        setShowPrimeiraDespesaModal(true);
        return;
      }

      // Se tem despesas, navegar para listagem filtrada
      console.log("📋 Navegando para despesas filtradas:", {
        emendaId: emenda.id,
        totalDespesas: emenda.totalDespesas,
      });

      navigate("/despesas", {
        state: {
          filtroAutomatico: {
            emendaId: emenda.id,
            numeroEmenda: emenda.numero || emenda.numeroEmenda,
            parlamentar: emenda.parlamentar,
            valorRecurso: emenda.valorRecurso || emenda.valorTotal,
            totalDespesas: emenda.totalDespesas,
            breadcrumb: {
              origem: "Emendas",
              emenda: `${emenda.parlamentar} - ${emenda.numero || emenda.numeroEmenda}`,
              totalDespesas: emenda.totalDespesas,
            },
          },
        },
      });
    },
    [navigate],
  );

  // Expor função para o menu externo
  window.voltarParaListagemEmendas = handleVoltarParaListagem;

  // Cálculos para estatísticas usando as emendas com métricas
  const totalEmendas = emendasComMetricas?.length || 0;
  const emendasComRecursos =
    emendasComMetricas?.filter((e) => e.valorRecurso > 0).length || 0;
  const emendasComDespesas =
    emendasComMetricas?.filter((e) => e.temDespesas).length || 0;
  const valorTotal =
    emendasComMetricas?.reduce((sum, e) => sum + (e.valorRecurso || 0), 0) || 0;
  const valorExecutadoTotal =
    emendasComMetricas?.reduce((sum, e) => sum + (e.valorExecutado || 0), 0) ||
    0;

  // Renderização condicional baseada na view atual
  const renderContent = () => {
    // Verificar se o usuário tem município/UF cadastrado (apenas para operadores)
    if (userRole !== "admin" && (!userMunicipio || !userUf) && !loading) {
      return (
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
      );
    }

    switch (currentView) {
      case "criar":
        return (
          <EmendaForm
            usuario={usuario}
            onCancelar={handleVoltar}
            onSalvar={handleSalvarEmenda}
            onListarEmendas={handleVoltar}
            defaultMunicipio={userRole !== "admin" ? userMunicipio : null}
            defaultUf={userRole !== "admin" ? userUf : null}
            isOperador={userRole !== "admin"}
          />
        );

      case "editar":
        return (
          <EmendaForm
            usuario={usuario}
            emendaParaEditar={emendaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleSalvarEmenda}
            onListarEmendas={handleVoltar}
            isOperador={userRole !== "admin"}
          />
        );

      case "visualizar":
        return (
          <EmendaForm
            usuario={usuario}
            emendaParaEditar={emendaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleVoltar}
            onListarEmendas={handleVoltar}
            modoVisualizacao={true}
          />
        );

      case "criar-despesa":
        return (
          <DespesaForm
            emendaId={emendaSelecionada?.id}
            emendaInfo={{
              numero:
                emendaSelecionada?.numero || emendaSelecionada?.numeroEmenda,
              parlamentar: emendaSelecionada?.parlamentar,
              valorRecurso:
                emendaSelecionada?.valorRecurso ||
                emendaSelecionada?.valorTotal,
              municipio: emendaSelecionada?.municipio,
              uf: emendaSelecionada?.uf,
            }}
            onSalvar={async () => {
              console.log("💾 Salvando primeira despesa...");
              // Atualizar métricas da emenda
              if (emendaSelecionada?.id) {
                await atualizarSaldoEmenda(emendaSelecionada.id);
                await recarregar();
              }
              // Voltar para listagem
              handleVoltar();
            }}
            onCancelar={handleVoltar}
            usuario={usuario}
            isPrimeiraDespesa={true}
            titulo="💰 Criar Primeira Despesa"
            subtitle={`Emenda: ${emendaSelecionada?.parlamentar} - ${emendaSelecionada?.numero}`}
          />
        );

      default:
        return (
          <div>
            {/* Header com informações de filtro */}
            <div style={styles.compactHeader}>
              <div style={styles.statusInfo}>
                <span style={styles.statusText}>Status:</span>
                <span style={styles.statusValue}>✅ Operacional</span>
                <span style={styles.divider}>|</span>
                <span style={styles.versionText}>Versão:</span>
                <span style={styles.versionValue}>v2.0</span>
                <span style={styles.divider}>|</span>
                <span style={styles.statusText}>Dados:</span>
                <span style={styles.versionValue}>
                  {loading ? "Carregando..." : `${totalEmendas} emendas`}
                </span>
                {calculandoMetricas && (
                  <>
                    <span style={styles.divider}>|</span>
                    <span style={styles.calculating}>📊 Calculando...</span>
                  </>
                )}
                {userRole !== "admin" && userMunicipio && userUf && (
                  <>
                    <span style={styles.divider}>|</span>
                    <span style={styles.filterInfo}>
                      📍 {userMunicipio}/{userUf}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Estatísticas do Dashboard CORRIGIDAS */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{totalEmendas}</h3>
                <p style={styles.statLabel}>
                  {userRole === "admin"
                    ? "TOTAL DE EMENDAS"
                    : "EMENDAS DO MUNICÍPIO"}
                </p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{emendasComRecursos}</h3>
                <p style={styles.statLabel}>EMENDAS COM RECURSOS</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{emendasComDespesas}</h3>
                <p style={styles.statLabel}>EMENDAS COM DESPESAS</p>
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
          </div>
        );
    }
  };

  const styles = {
    compactHeader: {
      backgroundColor: "#f0f0f0",
      padding: "10px",
      marginBottom: "20px",
      borderRadius: "5px",
    },
    statusInfo: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
    },
    statusText: {
      fontWeight: "bold",
      marginRight: "5px",
    },
    statusValue: {
      color: "green",
      marginRight: "10px",
    },
    versionText: {
      fontWeight: "bold",
      marginRight: "5px",
    },
    versionValue: {
      color: "#555",
      marginRight: "10px",
    },
    divider: {
      margin: "0 5px",
    },
    filterInfo: {
      fontStyle: "italic",
      color: "#777",
    },
    calculating: {
      fontStyle: "italic",
      color: "orange",
    },
    statsContainer: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    statCard: {
      backgroundColor: "#fff",
      padding: "15px",
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      textAlign: "center",
      width: "200px",
      marginBottom: "15px",
    },
    statNumber: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#333",
    },
    statLabel: {
      fontSize: "14px",
      color: "#666",
    },
    button: {
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "10px 20px",
      margin: "0 10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    actionButtons: {
      marginTop: "20px",
      textAlign: "center",
    },
    warningContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f9f9f9",
    },
    warningCard: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      maxWidth: "500px",
    },
    warningTitle: {
      color: "#ff9800",
      marginBottom: "15px",
    },
    warningText: {
      color: "#555",
      marginBottom: "10px",
      fontSize: "16px",
    },
    userInfo: {
      marginTop: "20px",
      fontSize: "14px",
      color: "#777",
    },
  };

  return (
    <>
      {/* Modal UX - Primeira Despesa (IMPLEMENTADO) */}
      <PrimeiraDespesaModal
        show={showPrimeiraDespesaModal}
        onClose={() => setShowPrimeiraDespesaModal(false)}
        emenda={emendaParaPrimeiraDespesa}
        onCriarDespesa={() => {
          console.log(
            "✅ Modal UX - Criar primeira despesa para",
            emendaParaPrimeiraDespesa.numero,
          );
          setShowPrimeiraDespesaModal(false);
          setEmendaSelecionada(emendaParaPrimeiraDespesa);
          setCurrentView("criar-despesa");
        }}
      />
      {renderContent()}
    </>
  );
};

export default Emendas;