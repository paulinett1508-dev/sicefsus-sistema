// Emendas.jsx - Sistema SICEFSUS v1.7 - CORREÇÃO CRÍTICA APLICADA
// Componente principal de gestão de emendas

import React, { useState, useEffect } from "react";
import {
  deleteDoc,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import EmendaForm from "./EmendaForm";
import EmendasTable from "./EmendasTable";
import DespesaForm from "./DespesaForm";
import useEmendaDespesa from "../hooks/useEmendaDespesa";

const Emendas = ({ usuario }) => {
  const [currentView, setCurrentView] = useState("listagem");
  const [emendaSelecionada, setEmendaSelecionada] = useState(null);
  const [userMunicipio, setUserMunicipio] = useState(null);
  const [userUf, setUserUf] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // ✅ Buscar dados do usuário no Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (usuario?.uid) {
        try {
          // Buscar documento do usuário
          const usersSnapshot = await getDocs(
            query(collection(db, "users"), where("uid", "==", usuario.uid)),
          );

          if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data();
            setUserMunicipio(userData.municipio);
            setUserUf(userData.uf);
            setUserRole(userData.role);
            console.log("👤 Dados do usuário carregados:", {
              municipio: userData.municipio,
              uf: userData.uf,
              role: userData.role,
            });
          }
        } catch (error) {
          console.error("❌ Erro ao buscar dados do usuário:", error);
        }
      }
    };

    loadUserData();
  }, [usuario]);

  // ✅ CORREÇÃO CRÍTICA: Construir objeto usuário completo para o hook
  const usuarioParaHook = userRole
    ? {
        uid: usuario?.uid,
        email: usuario?.email,
        role: userRole,
        municipio: userMunicipio,
        uf: userUf,
      }
    : null;

  console.log("✅ Usuário completo configurado:", usuarioParaHook);

  // ✅ Hook integrado - COM USUÁRIO COMPLETO
  const {
    emendas,
    loading,
    error,
    atualizarSaldoEmenda,
    obterEstatisticasGerais,
    recarregar,
  } = useEmendaDespesa(usuarioParaHook, {
    carregarTodasEmendas: userRole !== null, // ✅ Só carrega quando role estiver definida
    incluirEstatisticas: true,
    autoRefresh: false,
    filtroMunicipio: userRole !== "admin" ? userMunicipio : null,
    filtroUf: userRole !== "admin" ? userUf : null,
    userRole: userRole, // ✅ Também nas options para compatibilidade
  });

  // ✅ Usar emendas direto do hook (já filtradas)
  const emendasFiltradas = emendas; // Já vem filtradas do hook se for operador

  // ✅ UseEffect OTIMIZADO - só roda na primeira vez
  useEffect(() => {
    console.log("🎯 Sistema SICEFSUS v1.7 - Hook integrado carregado");
  }, []);

  // ✅ Log separado para dados (só quando realmente mudam) - OTIMIZADO
  useEffect(() => {
    const emendasLength = emendasFiltradas?.length || 0;
    if (emendasLength > 0) {
      console.log("✅ Emendas filtradas carregadas:", emendasLength);
    }
    if (error) {
      console.error("❌ Erro no hook:", error);
    }
  }, [emendasFiltradas?.length, error]);

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

  // ✅ FUNÇÃO DELETAR IMPLEMENTADA CORRETAMENTE
  const handleDeletar = async (emendaId) => {
    console.log("🗑️ Deletar emenda ID:", emendaId);

    if (!emendaId) {
      alert("ID da emenda não encontrado!");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir esta emenda?")) {
      try {
        // ✅ Deletar do Firestore
        await deleteDoc(doc(db, "emendas", emendaId));

        // ✅ Recarregar dados
        await recarregar();

        console.log("✅ Emenda deletada com sucesso:", emendaId);
        alert("Emenda deletada com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao deletar emenda:", error);
        alert("Erro ao deletar emenda. Tente novamente.");
      }
    }
  };

  // Expor função para o menu externo
  window.voltarParaListagemEmendas = handleVoltarParaListagem;

  const handleDespesas = (emenda) => {
    console.log("💰 Gerenciar despesas:", emenda.numero);
    setEmendaSelecionada(emenda);
    setCurrentView("despesas");
  };

  // Cálculos para estatísticas usando as emendas filtradas
  const totalEmendas = emendasFiltradas?.length || 0;
  const emendasComRecursos =
    emendasFiltradas?.filter((e) => e.valorRecurso > 0).length || 0;
  const valorTotal =
    emendasFiltradas?.reduce((sum, e) => sum + (e.valorRecurso || 0), 0) || 0;

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
            onCancelar={handleVoltar}
            onSalvar={async () => {
              await recarregar();
              handleVoltar();
            }}
            onListarEmendas={handleVoltar}
            // Passar município/UF do usuário como padrão para operadores
            defaultMunicipio={userRole !== "admin" ? userMunicipio : null}
            defaultUf={userRole !== "admin" ? userUf : null}
            isOperador={userRole !== "admin"}
          />
        );

      case "editar":
        return (
          <EmendaForm
            emendaParaEditar={emendaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={async () => {
              await recarregar();
              handleVoltar();
            }}
            onListarEmendas={handleVoltar}
            isOperador={userRole !== "admin"}
          />
        );

      case "visualizar":
        return (
          <EmendaForm
            emendaParaEditar={emendaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleVoltar}
            onListarEmendas={handleVoltar}
            modoVisualizacao={true}
          />
        );

      case "despesas":
        return (
          <DespesaForm
            emendaId={emendaSelecionada?.id}
            onSalvar={async () => {
              if (emendaSelecionada?.id) {
                await atualizarSaldoEmenda(emendaSelecionada.id);
                await recarregar();
              }
              handleVoltar();
            }}
            onCancelar={handleVoltar}
            usuario={usuario}
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
                <span style={styles.versionValue}>v1.7</span>
                <span style={styles.divider}>|</span>
                <span style={styles.statusText}>Dados:</span>
                <span style={styles.versionValue}>
                  {loading ? "Carregando..." : `${totalEmendas} emendas`}
                </span>
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

            {/* Estatísticas do Dashboard */}
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
                <h3 style={styles.statNumber}>
                  {valorTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h3>
                <p style={styles.statLabel}>VALOR TOTAL</p>
              </div>
            </div>

            {/* Botão Nova Emenda */}
            <div style={styles.actionContainer}>
              <button style={styles.primaryButton} onClick={handleCriar}>
                ➕ Nova Emenda
              </button>
              <button
                style={styles.refreshButton}
                onClick={recarregar}
                disabled={loading}
              >
                🔄 {loading ? "Carregando..." : "Atualizar"}
              </button>
            </div>

            {/* Tabela de Emendas */}
            {loading ? (
              <div style={styles.loadingContainer}>
                <p style={styles.loadingText}>Carregando emendas...</p>
              </div>
            ) : error ? (
              <div style={styles.errorContainer}>
                <p style={styles.errorText}>❌ {error}</p>
                <button onClick={recarregar} style={styles.retryButton}>
                  🔄 Tentar novamente
                </button>
              </div>
            ) : totalEmendas === 0 ? (
              <div style={styles.emptyContainer}>
                <p style={styles.emptyText}>
                  {userRole === "admin"
                    ? "Nenhuma emenda cadastrada no sistema."
                    : `Nenhuma emenda encontrada para ${userMunicipio}/${userUf}.`}
                </p>
              </div>
            ) : (
              <EmendasTable
                emendas={emendasFiltradas}
                onView={handleVisualizar}
                onEdit={handleEditar}
                onDelete={handleDeletar}
                onDespesas={handleDespesas}
              />
            )}
          </div>
        );
    }
  };

  return <div style={styles.container}>{renderContent()}</div>;
};

// Estilos do componente
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
    width: "100%",
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
  filterInfo: {
    fontWeight: "600",
    background: "rgba(255,255,255,0.2)",
    padding: "2px 10px",
    borderRadius: "12px",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
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
    fontSize: "28px",
    fontWeight: "bold",
    color: "#154360",
    margin: "0 0 10px 0",
  },
  statLabel: {
    fontSize: "12px",
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
  },
  loadingText: {
    fontSize: "18px",
    color: "#666",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#f8d7da",
    borderRadius: "8px",
    border: "1px solid #f5c6cb",
  },
  errorText: {
    fontSize: "16px",
    color: "#721c24",
    marginBottom: "15px",
  },
  retryButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  emptyText: {
    fontSize: "16px",
    color: "#666",
  },
  warningContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    padding: "20px",
  },
  warningCard: {
    background: "white",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    border: "2px solid #ffc107",
  },
  warningTitle: {
    color: "#856404",
    marginBottom: "15px",
    fontSize: "24px",
  },
  warningText: {
    color: "#856404",
    marginBottom: "15px",
    lineHeight: "1.6",
  },
  userInfo: {
    background: "#fff3cd",
    padding: "15px",
    borderRadius: "8px",
    color: "#856404",
    fontSize: "14px",
    textAlign: "left",
    marginTop: "20px",
  },
};

export default Emendas;
