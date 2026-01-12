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

  // Permissoes
  const userRole = usuario?.tipo || "operador";
  const isAdmin = userRole === "admin";

  // Filtrar fornecedores pelo termo de busca
  const fornecedoresFiltrados = useMemo(() => {
    return filtrar(termoBusca);
  }, [termoBusca, filtrar]);

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
      padding: "24px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "16px",
    },
    titleSection: {
      flex: 1,
    },
    titulo: {
      fontSize: "var(--font-size-xl, 20px)",
      fontWeight: "var(--font-weight-bold, 700)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
    },
    subtitulo: {
      fontSize: "var(--font-size-sm, 14px)",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
    },
    btnNovo: {
      padding: "10px 16px",
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      border: "none",
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: "var(--primary, #2563EB)",
      color: "var(--white, #ffffff)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "background-color 0.2s",
    },
    resumoCards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "12px",
      marginBottom: "24px",
    },
    cardResumo: {
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius-md, 8px)",
      padding: "16px",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    cardResumoIcon: {
      width: "44px",
      height: "44px",
      borderRadius: "var(--border-radius-md, 8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cardResumoInfo: {
      flex: 1,
    },
    cardResumoLabel: {
      fontSize: "12px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "2px",
    },
    cardResumoValor: {
      fontSize: "var(--font-size-lg, 18px)",
      fontWeight: "var(--font-weight-bold, 700)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
    },
    buscaContainer: {
      marginBottom: "20px",
    },
    inputBusca: {
      width: "100%",
      maxWidth: "400px",
      padding: "10px 14px 10px 40px",
      fontSize: "var(--font-size-sm, 14px)",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      outline: "none",
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
      fontSize: "var(--font-size-sm, 14px)",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "12px",
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
          <div style={styles.cardResumoInfo}>
            <div style={styles.cardResumoLabel}>Total Cadastrados</div>
            <div style={styles.cardResumoValor}>{calculos.total}</div>
          </div>
        </div>

        <div style={styles.cardResumo}>
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
          <div style={styles.cardResumoInfo}>
            <div style={styles.cardResumoLabel}>Ativos</div>
            <div style={{ ...styles.cardResumoValor, color: "#10b981" }}>{calculos.ativos}</div>
          </div>
        </div>

        <div style={styles.cardResumo}>
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
          <div style={styles.cardResumoInfo}>
            <div style={styles.cardResumoLabel}>Inativos</div>
            <div style={{ ...styles.cardResumoValor, color: "#ef4444" }}>{calculos.inativos}</div>
          </div>
        </div>
      </div>

      {/* Campo de Busca */}
      <div style={styles.buscaContainer}>
        <div style={styles.inputWrapper}>
          <span className="material-symbols-outlined" style={styles.searchIcon}>
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por CNPJ, razao social ou cidade..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={styles.inputBusca}
          />
        </div>
      </div>

      {/* Resultado da busca */}
      {termoBusca && (
        <p style={styles.resultadoBusca}>
          {fornecedoresFiltrados.length} fornecedor(es) encontrado(s) para "{termoBusca}"
        </p>
      )}

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
