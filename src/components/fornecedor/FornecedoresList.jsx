// src/components/fornecedor/FornecedoresList.jsx
// Pagina de listagem de fornecedores

import React, { useState, useMemo, useEffect } from "react";
import FornecedorCard from "./FornecedorCard";
import FornecedorForm from "./FornecedorForm";
import { useFornecedoresData } from "../../hooks/useFornecedoresData";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import ConfirmationModal from "../ConfirmationModal";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

/**
 * Pagina de listagem de fornecedores
 */
const FornecedoresList = () => {
  const { usuario } = useUser();
  const { isDark } = useTheme?.() || { isDark: false };

  // Hook de fornecedores
  const {
    fornecedores,
    loading,
    error,
    salvando,
    calculos,
    criar,
    atualizar,
    excluir,
    filtrar,
  } = useFornecedoresData(usuario);

  // Estados locais
  const [termoBusca, setTermoBusca] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [fornecedorEmEdicao, setFornecedorEmEdicao] = useState(null);
  const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState(null);
  const [despesasPorFornecedor, setDespesasPorFornecedor] = useState({});
  const [carregandoDespesas, setCarregandoDespesas] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: "razaoSocial", direcao: "asc" });

  // Permissoes
  const userRole = usuario?.tipo || "operador";
  const isAdmin = userRole === "admin";

  // Filtrar e ordenar fornecedores
  const fornecedoresFiltrados = useMemo(() => {
    const filtrados = filtrar(termoBusca);

    // Aplicar ordenação
    return [...filtrados].sort((a, b) => {
      let valorA, valorB;

      switch (ordenacao.campo) {
        case "razaoSocial":
          valorA = (a.razaoSocial || "").toLowerCase();
          valorB = (b.razaoSocial || "").toLowerCase();
          break;
        case "cidade":
          valorA = (a.endereco?.cidade || "").toLowerCase();
          valorB = (b.endereco?.cidade || "").toLowerCase();
          break;
        case "cnpj":
          valorA = (a.cnpj || "").replace(/\D/g, "");
          valorB = (b.cnpj || "").replace(/\D/g, "");
          break;
        default:
          valorA = (a.razaoSocial || "").toLowerCase();
          valorB = (b.razaoSocial || "").toLowerCase();
      }

      if (valorA < valorB) return ordenacao.direcao === "asc" ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === "asc" ? 1 : -1;
      return 0;
    });
  }, [termoBusca, filtrar, ordenacao]);

  // Handler para alternar ordenação
  const handleOrdenacao = (campo) => {
    setOrdenacao((prev) => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === "asc" ? "desc" : "asc",
    }));
  };

  // Carregar contagem de despesas por fornecedor (por CNPJ)
  useEffect(() => {
    const carregarDespesas = async () => {
      if (!fornecedores.length) return;

      setCarregandoDespesas(true);
      const contagens = {};

      try {
        // Buscar todas as despesas
        const snapshot = await getDocs(collection(db, "despesas"));

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Contar por CNPJ (campo cnpjFornecedor nas despesas)
          const cnpj = data.cnpjFornecedor?.replace(/\D/g, "");
          if (cnpj) {
            contagens[cnpj] = (contagens[cnpj] || 0) + 1;
          }
        });
      } catch (err) {
        console.error("Erro ao carregar despesas:", err);
      }

      setDespesasPorFornecedor(contagens);
      setCarregandoDespesas(false);
    };

    carregarDespesas();
  }, [fornecedores]);

  // Handlers
  const handleNovoFornecedor = () => {
    setFornecedorEmEdicao(null);
    setMostrarFormulario(true);
  };

  const handleEditarFornecedor = (fornecedor) => {
    setFornecedorEmEdicao(fornecedor);
    setMostrarFormulario(true);
  };

  const handleFecharFormulario = () => {
    setMostrarFormulario(false);
    setFornecedorEmEdicao(null);
  };

  const handleSalvarFornecedor = async (dados) => {
    try {
      if (fornecedorEmEdicao) {
        await atualizar(fornecedorEmEdicao.id, dados);
      } else {
        await criar(dados);
      }
      handleFecharFormulario();
    } catch (error) {
      throw error;
    }
  };

  const handleExcluirFornecedor = (fornecedor) => {
    setFornecedorParaExcluir(fornecedor);
  };

  const handleConfirmarExclusao = async () => {
    if (fornecedorParaExcluir) {
      try {
        await excluir(fornecedorParaExcluir.id);
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
      setFornecedorParaExcluir(null);
    }
  };

  // Verificar se pode editar
  const podeEditar = (fornecedor) => {
    if (isAdmin) return true;
    if (userRole === "gestor" && fornecedor.criadoPor === usuario?.id) return true;
    return false;
  };

  // Verificar se pode excluir
  const podeExcluir = (fornecedor) => {
    if (isAdmin) return true;
    return false;
  };

  // Estilos
  const styles = {
    container: {
      padding: "16px 32px",
      backgroundColor: isDark ? "var(--theme-bg)" : "var(--theme-bg, #F8FAFC)",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "16px",
    },
    titleSection: {
      flex: 1,
    },
    titulo: {
      fontSize: "24px",
      fontWeight: "700",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "4px",
    },
    subtitulo: {
      fontSize: "14px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginLeft: "36px",
    },
    btnNovo: {
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "var(--primary, var(--action))",
      color: "#ffffff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    resumoCards: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
      marginBottom: "32px",
    },
    cardResumo: {
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "12px",
      padding: "20px",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      boxShadow: "var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.05))",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      transition: "border-color 0.2s ease",
    },
    cardResumoIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cardResumoInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    cardResumoLabel: {
      fontSize: "13px",
      fontWeight: "500",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      textTransform: "uppercase",
      letterSpacing: "0.025em",
    },
    cardResumoValor: {
      fontSize: "28px",
      fontWeight: "700",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      lineHeight: "1",
    },
    toolbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      padding: "12px 16px",
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "12px",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      boxShadow: "var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.05))",
      gap: "16px",
      flexWrap: "wrap",
    },
    buscaContainer: {
      flex: 1,
      minWidth: "200px",
    },
    inputBusca: {
      width: "100%",
      maxWidth: "400px",
      padding: "10px 14px 10px 40px",
      fontSize: "14px",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      borderRadius: "8px",
      backgroundColor: isDark ? "var(--theme-bg)" : "var(--gray-50, #F8FAFC)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      outline: "none",
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
    inputWrapper: {
      position: "relative",
      display: "inline-block",
      width: "100%",
      maxWidth: "400px",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 18,
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
    },
    ordenacaoBar: (isDark) => ({
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "16px",
    }),
    ordenacaoLabel: (isDark) => ({
      fontSize: "13px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
    }),
    ordenacaoBotoes: {
      display: "flex",
      gap: "8px",
    },
    ordenacaoBotao: (isDark, ativo) => ({
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 12px",
      fontSize: "13px",
      fontWeight: ativo ? "600" : "500",
      border: `1px solid ${ativo ? "var(--primary, var(--action))" : isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      borderRadius: "6px",
      backgroundColor: ativo
        ? isDark ? "rgba(37, 99, 235, 0.1)" : "rgba(37, 99, 235, 0.05)"
        : isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      color: ativo
        ? "var(--primary, var(--action))"
        : isDark ? "var(--theme-text)" : "var(--gray-700, #334155)",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
    lista: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    emptyState: {
      textAlign: "center",
      padding: "48px 24px",
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius-lg, 12px)",
      border: `1px dashed ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
    },
    emptyIcon: {
      fontSize: 48,
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-300, #CBD5E1)",
      marginBottom: "16px",
    },
    emptyTitulo: {
      fontSize: "var(--font-size-lg, 18px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      marginBottom: "8px",
    },
    emptyDescricao: {
      fontSize: "var(--font-size-sm, 14px)",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "20px",
      maxWidth: "400px",
      margin: "0 auto 20px auto",
    },
    loading: {
      textAlign: "center",
      padding: "48px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
    },
    error: {
      textAlign: "center",
      padding: "24px",
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
      borderRadius: "var(--border-radius-md, 8px)",
      color: "var(--error, #EF4444)",
    },
    resultadoBusca: {
      fontSize: "13px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      whiteSpace: "nowrap",
    },
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 48, animation: "spin 1s linear infinite", marginBottom: 16 }}
          >
            sync
          </span>
          <p>Carregando fornecedores...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 8 }}>
            error
          </span>
          <p>Erro ao carregar fornecedores: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.titulo}>
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
              business
            </span>
            Fornecedores
          </h1>
          <p style={styles.subtitulo}>
            Gerencie os fornecedores cadastrados no sistema
          </p>
        </div>

        <button style={styles.btnNovo} onClick={handleNovoFornecedor}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            add
          </span>
          Novo Fornecedor
        </button>
      </div>

      {/* Cards de Resumo */}
      <div style={styles.resumoCards}>
        <div style={styles.cardResumo}>
          <div style={styles.cardResumoInfo}>
            <div style={styles.cardResumoLabel}>Total Cadastrados</div>
            <div style={styles.cardResumoValor}>{calculos.total}</div>
          </div>
          <div
            style={{
              ...styles.cardResumoIcon,
              backgroundColor: isDark ? "rgba(37, 99, 235, 0.1)" : "rgba(37, 99, 235, 0.1)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#2563eb" }}>
              business
            </span>
          </div>
        </div>

        <div style={styles.cardResumo}>
          <div style={styles.cardResumoInfo}>
            <div style={styles.cardResumoLabel}>Ativos</div>
            <div style={{ ...styles.cardResumoValor, color: "#10b981" }}>{calculos.ativos}</div>
          </div>
          <div
            style={{
              ...styles.cardResumoIcon,
              backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.1)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#10b981" }}>
              check_circle
            </span>
          </div>
        </div>

        <div style={styles.cardResumo}>
          <div style={styles.cardResumoInfo}>
            <div style={styles.cardResumoLabel}>Inativos</div>
            <div style={{ ...styles.cardResumoValor, color: "#ef4444" }}>{calculos.inativos}</div>
          </div>
          <div
            style={{
              ...styles.cardResumoIcon,
              backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#ef4444" }}>
              cancel
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar com Busca */}
      <div style={styles.toolbar}>
        <div style={styles.buscaContainer}>
          <div style={styles.inputWrapper}>
            <span className="material-symbols-outlined" style={styles.searchIcon}>
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por CPF/CNPJ, razao social ou cidade..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              style={styles.inputBusca}
            />
          </div>
        </div>
        {termoBusca && (
          <span style={styles.resultadoBusca}>
            {fornecedoresFiltrados.length} encontrado(s)
          </span>
        )}
      </div>

      {/* Lista ou Empty State */}
      {fornecedoresFiltrados.length === 0 ? (
        <div style={styles.emptyState}>
          <span className="material-symbols-outlined" style={styles.emptyIcon}>
            business
          </span>
          <div style={styles.emptyTitulo}>
            {termoBusca ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}
          </div>
          <div style={styles.emptyDescricao}>
            {termoBusca
              ? `Nao encontramos fornecedores para "${termoBusca}". Tente outro termo ou cadastre um novo fornecedor.`
              : "Cadastre fornecedores para facilitar o preenchimento das despesas. Uma vez cadastrado, voce pode seleciona-lo rapidamente ao criar novas despesas."}
          </div>
          {!termoBusca && (
            <button style={styles.btnNovo} onClick={handleNovoFornecedor}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                add
              </span>
              Cadastrar Primeiro Fornecedor
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Barra de ordenação */}
          <div style={styles.ordenacaoBar(isDark)}>
            <span style={styles.ordenacaoLabel(isDark)}>Ordenar por:</span>
            <div style={styles.ordenacaoBotoes}>
              <button
                style={styles.ordenacaoBotao(isDark, ordenacao.campo === "razaoSocial")}
                onClick={() => handleOrdenacao("razaoSocial")}
              >
                Nome
                {ordenacao.campo === "razaoSocial" && (
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {ordenacao.direcao === "asc" ? "arrow_upward" : "arrow_downward"}
                  </span>
                )}
              </button>
              <button
                style={styles.ordenacaoBotao(isDark, ordenacao.campo === "cnpj")}
                onClick={() => handleOrdenacao("cnpj")}
              >
                CPF/CNPJ
                {ordenacao.campo === "cnpj" && (
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {ordenacao.direcao === "asc" ? "arrow_upward" : "arrow_downward"}
                  </span>
                )}
              </button>
              <button
                style={styles.ordenacaoBotao(isDark, ordenacao.campo === "cidade")}
                onClick={() => handleOrdenacao("cidade")}
              >
                Cidade
                {ordenacao.campo === "cidade" && (
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {ordenacao.direcao === "asc" ? "arrow_upward" : "arrow_downward"}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Lista de fornecedores */}
          <div style={styles.lista}>
            {fornecedoresFiltrados.map((fornecedor) => {
              const cnpjLimpo = fornecedor.cnpj?.replace(/\D/g, "");
              return (
                <FornecedorCard
                  key={fornecedor.id}
                  fornecedor={fornecedor}
                  despesasVinculadas={despesasPorFornecedor[cnpjLimpo] || 0}
                  onEditar={handleEditarFornecedor}
                  onExcluir={handleExcluirFornecedor}
                  podeEditar={podeEditar(fornecedor)}
                  podeExcluir={podeExcluir(fornecedor)}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <FornecedorForm
          isVisible={true}
          fornecedor={fornecedorEmEdicao}
          onSalvar={handleSalvarFornecedor}
          onClose={handleFecharFormulario}
          salvando={salvando}
        />
      )}

      {/* Modal de Confirmacao de Exclusao */}
      {fornecedorParaExcluir && (
        <ConfirmationModal
          isVisible={true}
          onCancel={() => setFornecedorParaExcluir(null)}
          onConfirm={handleConfirmarExclusao}
          title="Excluir Fornecedor"
          message={`Tem certeza que deseja excluir o fornecedor "${fornecedorParaExcluir.razaoSocial}"? Esta acao nao pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
        />
      )}
    </div>
  );
};

export default FornecedoresList;
