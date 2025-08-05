// Despesas.jsx - Sistema SICEFSUS v2.1 - COM FILTROS BÁSICOS
// ✅ ADICIONADO: Componente DespesasFilters
// ✅ MANTIDO: Toda lógica de filtro por município
// ✅ MANTIDO: Layout original (já estava bom)
// ✅ CORRIGIDO: Mensagens padronizadas com Emendas

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  deleteDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import DespesaForm from "./DespesaForm";
import DespesasList from "./DespesasList";
import DespesasFilters from "./DespesasFilters"; // ✅ NOVO IMPORT
import Toast from "./Toast";

const Despesas = ({ usuario }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("listagem");
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [filtroAutomatico, setFiltroAutomatico] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Estados locais para dados
  const [despesas, setDespesas] = useState([]);
  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [despesasFiltradas, setDespesasFiltradas] = useState([]); // ✅ MANTIDO

  // ✅ NOVO: Estado para filtros locais
  const [despesasComFiltros, setDespesasComFiltros] = useState([]);

  // Dados do usuário para filtro por município (mantido)
  const userRole = usuario?.tipo || "operador"; // Usando 'tipo' consistentemente
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  console.log("🔒 Despesas.jsx v2.1 - Dados do usuário completos:", {
    usuario: usuario,
    email: usuario?.email,
    role: userRole, // Exibe o papel correto
    tipo: usuario?.tipo,
    municipio: userMunicipio,
    uf: userUf,
  });

  // Validações críticas (mantidas)
  if (!usuario) {
    console.error("❌ ERRO CRÍTICO: Usuario não definido!");
    return <div>Erro: Usuário não encontrado</div>;
  }

  if (!userRole) {
    console.error(
      "❌ ERRO CRÍTICO: Role/Tipo do usuário não definido!",
      usuario,
    );
    return <div>Erro: Permissões do usuário não definidas</div>;
  }

  // ✅ TODA A LÓGICA DE CARREGAMENTO MANTIDA EXATAMENTE
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("📊 Carregando dados com filtro por município...");

        // STEP 1: Carregar emendas baseado no role do usuário
        let emendasPermitidas = [];
        let emendasData = [];

        if (userRole === "admin") {
          console.log("👑 Usuário ADMIN - carregando todas as emendas");
          const emendasQuery = query(collection(db, "emendas"));
          const emendasSnapshot = await getDocs(emendasQuery);

          emendasSnapshot.forEach((doc) => {
            const emendaData = { id: doc.id, ...doc.data() };
            emendasData.push(emendaData);
            emendasPermitidas.push(doc.id);
          });
        } else if (
          (userRole === "operador" || userRole === "user") &&
          userMunicipio
        ) {
          console.log(
            `🏘️ Usuário ${userRole.toUpperCase()} - carregando emendas do município: ${userMunicipio}/${userUf}`,
          );

          // ✅ CORREÇÃO: Usar mesma estratégia do Dashboard (buscar por UF + filtro manual)
          console.log(
            "🔍 Despesas: Buscando emendas da UF para filtrar manualmente...",
          );

          const emendasRef = collection(db, "emendas");
          const emendasQuery = userUf
            ? query(emendasRef, where("uf", "==", userUf))
            : query(emendasRef);

          const emendasSnapshot = await getDocs(emendasQuery);
          const todasEmendas = [];
          emendasSnapshot.forEach((doc) => {
            todasEmendas.push({ id: doc.id, ...doc.data() });
          });

          console.log(
            `📊 Despesas: Total de emendas na UF ${userUf}: ${todasEmendas.length}`,
          );

          // 🎯 FILTRO MANUAL com normalização (igual ao Dashboard)
          const normalizarTexto = (texto) => {
            if (!texto) return "";
            return texto
              .toString()
              .trim()
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
          };

          const municipioNormalizado = normalizarTexto(userMunicipio);
          console.log(
            "🔄 Despesas: Município normalizado:",
            municipioNormalizado,
          );

          const emendasFiltradas = todasEmendas.filter((emenda) => {
            const emendaMunicipio = normalizarTexto(emenda.municipio);
            return emendaMunicipio === municipioNormalizado;
          });

          console.log(
            `✅ Despesas: Filtro manual encontrou ${emendasFiltradas.length} emendas para ${userMunicipio}`,
          );

          // Adicionar emendas filtradas aos arrays
          emendasFiltradas.forEach((emenda) => {
            emendasData.push(emenda);
            emendasPermitidas.push(emenda.id);
          });

          if (emendasPermitidas.length === 0) {
            console.warn(
              "⚠️ Despesas: Nenhuma emenda encontrada após filtro manual",
            );
            console.warn(
              "📊 Despesas: Todas as emendas da UF para comparação:",
            );
            todasEmendas.forEach((emenda) => {
              const normalizada = normalizarTexto(emenda.municipio);
              console.warn(
                `  - Original: "${emenda.municipio}" | Normalizada: "${normalizada}" | Match: ${normalizada === municipioNormalizado}`,
              );
            });

            // ✅ CORREÇÃO: Mensagem igual ao Emendas
            setError(
              `Nenhuma emenda encontrada para o município ${userMunicipio}`,
            );
            setEmendas([]);
            setDespesas([]);
            setDespesasFiltradas([]);
            setDespesasComFiltros([]); // ✅ NOVO
            setLoading(false);
            return;
          }
        } else {
          console.error("❌ CONFIGURAÇÃO INVÁLIDA DO USUÁRIO:", {
            userRole,
            userMunicipio,
            userUf,
            usuarioCompleto: usuario,
          });

          let mensagemErro = "Configuração de usuário inválida. ";
          if (!userMunicipio && userRole !== "admin") {
            mensagemErro =
              "Usuário operador sem município cadastrado. Entre em contato com o administrador.";
          } else {
            mensagemErro =
              "Tipo de usuário não reconhecido. Entre em contato com o administrador.";
          }

          setError(mensagemErro);
          setEmendas([]);
          setDespesas([]);
          setDespesasFiltradas([]);
          setDespesasComFiltros([]); // ✅ NOVO
          setLoading(false);
          return;
        }

        console.log(
          `✅ Emendas permitidas carregadas: ${emendasPermitidas.length}`,
        );
        console.log("📋 IDs das emendas permitidas:", emendasPermitidas);
        setEmendas(emendasData);

        // STEP 2: Carregar despesas das emendas permitidas
        let despesasData = [];

        if (emendasPermitidas.length > 0) {
          const batchSize = 10;

          for (let i = 0; i < emendasPermitidas.length; i += batchSize) {
            const batch = emendasPermitidas.slice(i, i + batchSize);
            console.log(
              `📦 Processando lote ${Math.floor(i / batchSize) + 1} - IDs:`,
              batch,
            );

            const despesasQuery = query(
              collection(db, "despesas"),
              where("emendaId", "in", batch),
            );
            const despesasSnapshot = await getDocs(despesasQuery);

            despesasSnapshot.forEach((doc) => {
              despesasData.push({
                id: doc.id,
                ...doc.data(),
              });
            });
          }
        }

        console.log(`✅ Despesas filtradas carregadas: ${despesasData.length}`);
        console.log(
          "💰 Amostra de despesas:",
          despesasData.slice(0, 3).map((d) => ({
            id: d.id,
            emendaId: d.emendaId,
            fornecedor: d.fornecedor,
            valor: d.valor,
          })),
        );

        setDespesas(despesasData);
        setDespesasFiltradas(despesasData);
        setDespesasComFiltros(despesasData); // ✅ NOVO: Inicializar filtros locais
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        setError(`Erro ao carregar despesas: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [userRole, userMunicipio]);

  // ✅ TODA A LÓGICA DE FILTRO AUTOMÁTICO MANTIDA
  useEffect(() => {
    if (location.state?.filtroAutomatico) {
      const filtro = location.state.filtroAutomatico;
      console.log("🎯 Aplicando filtro automático da emenda:", filtro);

      setFiltroAutomatico(filtro);

      if (filtro.breadcrumb) {
        console.log("🍞 Breadcrumb configurado:", filtro.breadcrumb);
        setBreadcrumb(filtro.breadcrumb);
      }

      if (despesas.length > 0) {
        carregarDespesasComFiltro(filtro);
      }
    }
  }, [location.state, despesas]);

  const carregarDespesasComFiltro = useCallback(async (filtro) => {
    if (!filtro) return;

    try {
      console.log("🔍 Carregando despesas com filtros:", filtro);

      const despesasQuery = query(
        collection(db, "despesas"),
        where("emendaId", "==", filtro.emendaId),
      );

      const despesasSnapshot = await getDocs(despesasQuery);
      const despesasData = [];

      despesasSnapshot.forEach((doc) => {
        despesasData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("✅ Despesas filtradas carregadas:", despesasData.length);
      setDespesasFiltradas(despesasData);
      setDespesasComFiltros(despesasData); // ✅ NOVO: Sincronizar
    } catch (error) {
      console.error("❌ Erro ao carregar despesas filtradas:", error);
    }
  }, []);

  // ✅ NOVO: Handler para filtros do componente DespesasFilters - OTIMIZADO
  const handleFiltrosChange = useCallback((despesasFiltradas) => {
    console.log("🔍 Aplicando filtros locais:", despesasFiltradas.length);
    setDespesasComFiltros(despesasFiltradas);
  }, []); // ✅ Sem dependências para evitar recriação

  // ✅ TODAS AS OUTRAS FUNÇÕES MANTIDAS EXATAMENTE
  const recarregar = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Recarregando dados com filtro por município...");

      let emendasPermitidas = [];
      let emendasData = [];

      if (userRole === "admin") {
        const emendasQuery = query(collection(db, "emendas"));
        const emendasSnapshot = await getDocs(emendasQuery);

        emendasSnapshot.forEach((doc) => {
          const emendaData = { id: doc.id, ...doc.data() };
          emendasData.push(emendaData);
          emendasPermitidas.push(doc.id);
        });
      } else if (
        (userRole === "operador" || userRole === "user") &&
        userMunicipio
      ) {
        const emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", userMunicipio),
        );
        const emendasSnapshot = await getDocs(emendasQuery);

        emendasSnapshot.forEach((doc) => {
          const emendaData = { id: doc.id, ...doc.data() };
          emendasData.push(emendaData);
          emendasPermitidas.push(doc.id);
        });
      }

      setEmendas(emendasData);

      let despesasData = [];

      if (emendasPermitidas.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < emendasPermitidas.length; i += batchSize) {
          const batch = emendasPermitidas.slice(i, i + batchSize);
          const despesasQuery = query(
            collection(db, "despesas"),
            where("emendaId", "in", batch),
          );
          const despesasSnapshot = await getDocs(despesasQuery);

          despesasSnapshot.forEach((doc) => {
            despesasData.push({ id: doc.id, ...doc.data() });
          });
        }
      }

      setDespesas(despesasData);

      if (filtroAutomatico) {
        carregarDespesasComFiltro(filtroAutomatico);
      } else {
        setDespesasFiltradas(despesasData);
        setDespesasComFiltros(despesasData); // ✅ NOVO: Sincronizar
      }

      console.log("✅ Dados recarregados com sucesso");
    } catch (error) {
      console.error("❌ Erro ao recarregar:", error);
      setError(`Erro ao recarregar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [filtroAutomatico, carregarDespesasComFiltro, userRole, userMunicipio]);

  // Handlers mantidos exatamente
  const handleVisualizar = (despesa) => {
    console.log("👁️ Visualizando despesa:", despesa.id);
    setDespesaSelecionada(despesa);
    setCurrentView("visualizar");
  };

  const handleEditar = (despesa) => {
    console.log("✏️ Editando despesa:", despesa.id);
    setDespesaSelecionada(despesa);
    setCurrentView("editar");
  };

  const handleCriar = () => {
    console.log("➕ Criando nova despesa");
    setDespesaSelecionada(null);
    setCurrentView("criar");
  };

  const handleVoltar = () => {
    console.log("🔄 Voltando para listagem");
    setCurrentView("listagem");
    setDespesaSelecionada(null);
  };

  const handleSalvarDespesa = useCallback(
    async (dadosSalvos) => {
      console.log("📝 handleSalvarDespesa chamado com:", dadosSalvos);

      try {
        await recarregar();
        console.log("✅ Dados recarregados após salvamento");
        handleVoltar();
      } catch (error) {
        console.error("❌ Erro no handleSalvarDespesa:", error);
      }
    },
    [recarregar],
  );

  const handleDeletarDespesa = async (despesaId) => {
    console.log("🗑️ Deletar despesa ID:", despesaId);

    if (!despesaId) {
      alert("ID da despesa não encontrado!");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      try {
        await deleteDoc(doc(db, "despesas", despesaId));
        await recarregar();
        console.log("✅ Despesa deletada com sucesso:", despesaId);

        setToast({
          show: true,
          message: "Despesa deletada com sucesso!",
          type: "success",
        });
      } catch (error) {
        console.error("❌ Erro ao deletar despesa:", error);
        setToast({
          show: true,
          message: "Erro ao deletar despesa. Tente novamente.",
          type: "error",
        });
      }
    }
  };

  const handleLimparFiltros = () => {
    console.log("🧹 Limpando filtros");
    setFiltroAutomatico(null);
    setBreadcrumb(null);
    setDespesasFiltradas(despesas);
    setDespesasComFiltros(despesas); // ✅ NOVO: Sincronizar
    navigate(location.pathname, { replace: true });
  };

  // ✅ CALCULAR ESTATÍSTICAS - USAR DESPESAS COM FILTROS LOCAIS
  const despesasParaExibir = filtroAutomatico
    ? despesasFiltradas
    : despesasComFiltros;
  const totalDespesas = despesasParaExibir.length;
  const valorTotal = despesasParaExibir.reduce((sum, despesa) => {
    const valor = parseFloat(despesa.valor) || 0;
    return sum + valor;
  }, 0);

  const estatisticasPermissao = {
    totalEmendas: emendas.length,
    totalDespesas: despesas.length,
    municipioFiltrado: userRole === "operador" ? userMunicipio : null,
    tipoUsuario: userRole,
  };

  // ✅ RENDERIZAÇÃO CONDICIONAL - ADICIONADO FILTROS
  const renderContent = () => {
    switch (currentView) {
      case "criar":
        return (
          <DespesaForm
            usuario={usuario}
            onCancelar={handleVoltar}
            onSalvar={handleSalvarDespesa}
            emendasDisponiveis={emendas}
            emendaPreSelecionada={filtroAutomatico?.emendaId}
            emendaInfo={filtroAutomatico}
            isPrimeiraDespesa={false}
          />
        );

      case "editar":
        return (
          <DespesaForm
            usuario={usuario}
            despesaParaEditar={despesaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleSalvarDespesa}
            emendasDisponiveis={emendas}
          />
        );

      case "visualizar":
        return (
          <DespesaForm
            usuario={usuario}
            despesaParaEditar={despesaSelecionada}
            onCancelar={handleVoltar}
            onSalvar={handleVoltar}
            modoVisualizacao={true}
            emendasDisponiveis={emendas}
          />
        );

      default:
        return (
          <div>
            {/* Header com informações (mantido) */}
            <div style={styles.compactHeader}>
              <div style={styles.statusInfo}>
                <span style={styles.statusText}>Status:</span>
                <span style={styles.statusValue}>✅ Operacional</span>
                <span style={styles.divider}>|</span>
                <span style={styles.versionText}>Versão:</span>
                <span style={styles.versionValue}>v2.1</span>
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
                  {loading ? "Carregando..." : `${totalDespesas} despesas`}
                </span>
              </div>
            </div>

            {/* Banner de Informação de Permissões (mantido) */}
            {(userRole === "operador" || userRole === "user") &&
              userMunicipio && (
                <div style={styles.permissaoInfo}>
                  <span style={styles.permissaoIcon}>🔒</span>
                  <div style={styles.permissaoContent}>
                    <span style={styles.permissaoTexto}>
                      <strong>Filtro Ativo:</strong> Exibindo apenas despesas de
                      emendas do município{" "}
                      <strong>
                        {userMunicipio}/{userUf || "UF não informada"}
                      </strong>
                    </span>
                    <span style={styles.permissaoSubtexto}>
                      {estatisticasPermissao.totalEmendas} emenda(s) •{" "}
                      {estatisticasPermissao.totalDespesas} despesa(s)
                      disponíveis para seu município
                    </span>
                  </div>
                </div>
              )}

            {/* Banner de Aviso - Usuário sem Município (mantido) */}
            {(userRole === "operador" || userRole === "user") &&
              !userMunicipio && (
                <div style={styles.avisoMunicipio}>
                  <span style={styles.avisoIcon}>⚠️</span>
                  <div style={styles.avisoContent}>
                    <span style={styles.avisoTexto}>
                      <strong>Configuração Pendente:</strong> Seu usuário não
                      possui município/UF cadastrado no sistema.
                    </span>
                    <span style={styles.avisoSubtexto}>
                      Entre em contato com o administrador para configurar seu
                      acesso.
                    </span>
                  </div>
                </div>
              )}

            {/* Breadcrumb (mantido) */}
            {breadcrumb && (
              <div style={styles.breadcrumbContainer}>
                <div style={styles.breadcrumbContent}>
                  <span style={styles.breadcrumbItem}>
                    📋 {breadcrumb.origem}
                  </span>
                  <span style={styles.breadcrumbSeparator}>→</span>
                  <span style={styles.breadcrumbItem}>
                    📄 {breadcrumb.emenda}
                  </span>
                  <span style={styles.breadcrumbSeparator}>→</span>
                  <span style={styles.breadcrumbCurrent}>
                    💰 Despesas ({breadcrumb.totalDespesas})
                  </span>
                </div>
                <button
                  onClick={handleLimparFiltros}
                  style={styles.breadcrumbClearButton}
                >
                  🧹 Limpar Filtro
                </button>
              </div>
            )}

            {/* Estatísticas (mantidas) */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{totalDespesas}</h3>
                <p style={styles.statLabel}>
                  {filtroAutomatico
                    ? "DESPESAS DA EMENDA"
                    : userRole === "operador" || userRole === "user"
                      ? `DESPESAS - ${userMunicipio || "SEM MUNICÍPIO"}`
                      : "TOTAL DE DESPESAS"}
                </p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>
                  {despesasParaExibir.filter((d) => d.status === "pago").length}
                </h3>
                <p style={styles.statLabel}>DESPESAS PAGAS</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>
                  {
                    despesasParaExibir.filter((d) => d.status === "pendente")
                      .length
                  }
                </h3>
                <p style={styles.statLabel}>DESPESAS PENDENTES</p>
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

            {/* Botões de Ação (mantidos) */}
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

            {/* ✅ NOVO: Componente de Filtros */}
            <DespesasFilters
              despesas={filtroAutomatico ? despesasFiltradas : despesas}
              emendas={emendas}
              onFilterChange={handleFiltrosChange}
              totalDespesas={totalDespesas}
            />

            {/* Lista de Despesas (mantida original) */}
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Carregando despesas...</p>
              </div>
            ) : error ? (
              <div style={styles.emptyContainer}>
                <div style={styles.emptyIcon}>📋</div>
                <h3>Nenhuma emenda encontrada</h3>
                <p style={styles.emptyText}>{error}</p>
                <button onClick={recarregar} style={styles.retryButton}>
                  🔄 Tentar novamente
                </button>
              </div>
            ) : totalDespesas === 0 ? (
              <div style={styles.emptyContainer}>
                <div style={styles.emptyIcon}>💰</div>
                <h3>Nenhuma despesa encontrada</h3>
                <p style={styles.emptyText}>
                  {filtroAutomatico
                    ? "Esta emenda ainda não possui despesas cadastradas"
                    : userRole === "operador" || userRole === "user"
                      ? `Nenhuma despesa encontrada para o município ${userMunicipio || "não cadastrado"}`
                      : "Nenhuma despesa cadastrada no sistema"}
                </p>
                {(userRole === "operador" || userRole === "user") &&
                  totalDespesas === 0 && (
                    <p style={styles.emptySubtext}>
                      💡 Dicas: Despesas são vinculadas a emendas. Verifique se
                      existem emendas cadastradas para seu município.
                    </p>
                  )}
              </div>
            ) : (
              <DespesasList
                despesas={despesasParaExibir}
                emendas={emendas}
                loading={loading}
                error={error}
                onEdit={handleEditar}
                onView={handleVisualizar}
                onDelete={handleDeletarDespesa}
                onRecarregar={recarregar}
                usuario={usuario}
                filtroInicial={filtroAutomatico}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
      {renderContent()}
    </div>
  );
};

// ✅ ESTILOS PADRONIZADOS COM EMENDAS - CORES E FORMATO IGUAIS
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

  avisoMunicipio: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#856404",
    boxShadow: "0 4px 12px rgba(255, 193, 7, 0.15)",
  },

  avisoIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },

  avisoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  avisoTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },

  avisoSubtexto: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
  },

  breadcrumbContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: "15px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "2px solid #2196f3",
  },

  breadcrumbContent: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },

  breadcrumbItem: {
    color: "#1565c0",
    fontWeight: "500",
    fontSize: "14px",
  },

  breadcrumbSeparator: {
    margin: "0 10px",
    color: "#1565c0",
    fontWeight: "bold",
  },

  breadcrumbCurrent: {
    color: "#1565c0",
    fontWeight: "bold",
    fontSize: "14px",
  },

  breadcrumbClearButton: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
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

  // ✅ CORREÇÃO: Spinner igual ao Emendas (sem conflito CSS)
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

  // Remover errorContainer e errorIcon - usar apenas emptyContainer

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

  emptySubtext: {
    fontSize: "14px",
    color: "#888",
    fontStyle: "italic",
  },
};

// CSS para animação
if (!document.getElementById("despesas-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "despesas-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Despesas;
