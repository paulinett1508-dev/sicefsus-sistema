// src/components/fornecedor/FornecedorSelect.jsx
// Dropdown para selecionar fornecedor existente

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import FornecedorForm from "./FornecedorForm";

/**
 * Dropdown para selecionar fornecedor
 * @param {object} props
 * @param {array} props.fornecedores - Lista de fornecedores disponiveis
 * @param {string} props.value - ID do fornecedor selecionado
 * @param {function} props.onChange - Callback quando seleciona
 * @param {function} props.onCriarFornecedor - Callback para criar novo fornecedor
 * @param {boolean} props.disabled - Se esta desabilitado
 * @param {string} props.placeholder - Texto do placeholder
 * @param {boolean} props.loading - Se esta carregando
 */
const FornecedorSelect = ({
  fornecedores = [],
  value,
  onChange,
  onCriarFornecedor,
  disabled = false,
  placeholder = "Selecione um fornecedor...",
  loading = false,
}) => {
  const { isDark } = useTheme?.() || { isDark: false };

  const [aberto, setAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvandoNovo, setSalvandoNovo] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fornecedor selecionado
  const fornecedorSelecionado = useMemo(() => {
    if (!value) return null;
    return fornecedores.find((f) => f.id === value) || null;
  }, [value, fornecedores]);

  // Filtrar fornecedores (apenas ATIVOS e pelo termo de busca)
  const fornecedoresFiltrados = useMemo(() => {
    // Primeiro, filtrar apenas fornecedores com situacao ATIVA
    const ativos = fornecedores.filter((f) => {
      const situacao = f.situacaoCadastral?.toUpperCase();
      return situacao === "ATIVA" || !situacao; // Aceita ATIVA ou sem situacao definida
    });

    if (!termoBusca) return ativos;

    const termoLower = termoBusca.toLowerCase();
    const termoNumerico = termoBusca.replace(/\D/g, "");

    return ativos.filter((f) => {
      const matchCNPJ =
        termoNumerico && f.cnpj?.replace(/\D/g, "").includes(termoNumerico);
      const matchRazao = f.razaoSocial?.toLowerCase().includes(termoLower);
      const matchFantasia = f.nomeFantasia?.toLowerCase().includes(termoLower);
      return matchCNPJ || matchRazao || matchFantasia;
    });
  }, [fornecedores, termoBusca]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Foco no input ao abrir
  useEffect(() => {
    if (aberto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [aberto]);

  // Formatar documento (CPF ou CNPJ)
  const formatarDocumento = (doc) => {
    if (!doc) return "-";
    const numeros = doc.replace(/\D/g, "");
    if (numeros.length === 11) {
      return numeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    if (numeros.length === 14) {
      return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }
    return doc;
  };

  // Handlers
  const handleToggle = () => {
    if (!disabled) {
      setAberto(!aberto);
      if (!aberto) {
        setTermoBusca("");
      }
    }
  };

  const handleSelecionar = (fornecedor) => {
    onChange?.(fornecedor);
    setAberto(false);
    setTermoBusca("");
  };

  const handleLimpar = (e) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const handleCriarNovo = () => {
    setAberto(false);
    setMostrarFormulario(true);
  };

  const handleSalvarNovo = async (dados) => {
    setSalvandoNovo(true);
    try {
      const novoFornecedor = await onCriarFornecedor?.(dados);
      if (novoFornecedor) {
        // Selecionar o novo fornecedor criado
        onChange?.({ id: novoFornecedor, ...dados });
      }
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
      throw error;
    } finally {
      setSalvandoNovo(false);
    }
  };

  // Estilos
  const styles = {
    container: {
      position: "relative",
      width: "100%",
    },
    trigger: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      border: `1px solid ${
        aberto
          ? "var(--primary, var(--action))"
          : isDark
            ? "var(--theme-border)"
            : "var(--theme-border, #E2E8F0)"
      }`,
      borderRadius: "var(--border-radius, 6px)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "border-color 0.2s",
    },
    triggerContent: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      minWidth: 0,
    },
    placeholder: {
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
      fontSize: "var(--font-size-sm, 14px)",
    },
    selecionado: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      minWidth: 0,
    },
    razaoSocial: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-medium, 500)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    cnpj: {
      fontSize: "12px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      fontFamily: "monospace",
    },
    actions: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      flexShrink: 0,
    },
    btnClear: {
      padding: "4px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      borderRadius: "var(--border-radius-sm, 4px)",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
    },
    chevron: {
      fontSize: 18,
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
      transition: "transform 0.2s",
      transform: aberto ? "rotate(180deg)" : "rotate(0deg)",
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      borderRadius: "var(--border-radius-md, 8px)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      zIndex: 1000,
      maxHeight: "320px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    searchContainer: {
      padding: "8px",
      borderBottom: `1px solid ${isDark ? "var(--theme-border)" : "var(--gray-200, #E2E8F0)"}`,
    },
    searchInput: {
      width: "100%",
      padding: "8px 10px",
      fontSize: "var(--font-size-sm, 14px)",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--gray-200, #E2E8F0)"}`,
      borderRadius: "var(--border-radius-sm, 4px)",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-50, #F8FAFC)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      outline: "none",
    },
    lista: {
      flex: 1,
      overflowY: "auto",
      maxHeight: "200px",
    },
    item: {
      display: "flex",
      alignItems: "center",
      padding: "10px 12px",
      cursor: "pointer",
      transition: "background-color 0.15s",
      gap: "10px",
    },
    itemHover: {
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-50, #F8FAFC)",
    },
    itemIcon: {
      width: "36px",
      height: "36px",
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-100, #F1F5F9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    itemInfo: {
      flex: 1,
      minWidth: 0,
    },
    itemRazao: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-medium, 500)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    itemMeta: {
      fontSize: "12px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    emptyState: {
      padding: "20px",
      textAlign: "center",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
    },
    footer: {
      padding: "8px",
      borderTop: `1px solid ${isDark ? "var(--theme-border)" : "var(--gray-200, #E2E8F0)"}`,
    },
    btnCriarNovo: {
      width: "100%",
      padding: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-medium, 500)",
      color: "var(--primary, var(--action))",
      backgroundColor: isDark ? "rgba(37, 99, 235, 0.1)" : "rgba(37, 99, 235, 0.05)",
      border: "none",
      borderRadius: "var(--border-radius, 6px)",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    statusBadge: {
      padding: "2px 6px",
      borderRadius: "var(--border-radius-sm, 4px)",
      fontSize: "10px",
      fontWeight: 600,
      textTransform: "uppercase",
    },
    statusAtivo: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.1)",
      color: "#10b981",
    },
    statusInativo: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
    },
  };

  return (
    <div style={styles.container} ref={containerRef}>
      {/* Trigger */}
      <div style={styles.trigger} onClick={handleToggle}>
        <div style={styles.triggerContent}>
          {loading ? (
            <span style={styles.placeholder}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, animation: "spin 1s linear infinite", marginRight: 6, verticalAlign: "middle" }}
              >
                sync
              </span>
              Carregando...
            </span>
          ) : fornecedorSelecionado ? (
            <div style={styles.selecionado}>
              <span style={styles.razaoSocial}>{fornecedorSelecionado.razaoSocial}</span>
              <span style={styles.cnpj}>{formatarDocumento(fornecedorSelecionado.cnpj)}</span>
            </div>
          ) : (
            <span style={styles.placeholder}>{placeholder}</span>
          )}
        </div>

        <div style={styles.actions}>
          {fornecedorSelecionado && !disabled && (
            <button
              style={styles.btnClear}
              onClick={handleLimpar}
              title="Limpar selecao"
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                close
              </span>
            </button>
          )}
          <span className="material-symbols-outlined" style={styles.chevron}>
            expand_more
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {aberto && !disabled && (
        <div style={styles.dropdown}>
          {/* Busca */}
          <div style={styles.searchContainer}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar por CPF/CNPJ ou razao social..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Lista */}
          <div style={styles.lista}>
            {fornecedoresFiltrados.length === 0 ? (
              <div style={styles.emptyState}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 8 }}>
                  search_off
                </span>
                <p>Nenhum fornecedor encontrado</p>
              </div>
            ) : (
              fornecedoresFiltrados.map((fornecedor) => (
                <div
                  key={fornecedor.id}
                  style={{
                    ...styles.item,
                    backgroundColor:
                      fornecedor.id === value
                        ? isDark
                          ? "rgba(37, 99, 235, 0.1)"
                          : "rgba(37, 99, 235, 0.05)"
                        : "transparent",
                  }}
                  onClick={() => handleSelecionar(fornecedor)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      fornecedor.id === value
                        ? isDark
                          ? "rgba(37, 99, 235, 0.15)"
                          : "rgba(37, 99, 235, 0.1)"
                        : isDark
                          ? "var(--theme-surface-secondary)"
                          : "var(--gray-50)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      fornecedor.id === value
                        ? isDark
                          ? "rgba(37, 99, 235, 0.1)"
                          : "rgba(37, 99, 235, 0.05)"
                        : "transparent";
                  }}
                >
                  <div style={styles.itemIcon}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 18,
                        color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500)",
                      }}
                    >
                      {fornecedor.tipoPessoa === "PF" ? "person" : "business"}
                    </span>
                  </div>

                  <div style={styles.itemInfo}>
                    <div style={styles.itemRazao}>{fornecedor.razaoSocial}</div>
                    <div style={styles.itemMeta}>
                      <span style={{ fontFamily: "monospace" }}>
                        {formatarDocumento(fornecedor.cnpj)}
                      </span>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(fornecedor.situacaoCadastral === "ATIVA"
                            ? styles.statusAtivo
                            : styles.statusInativo),
                        }}
                      >
                        {fornecedor.situacaoCadastral || "N/A"}
                      </span>
                    </div>
                  </div>

                  {fornecedor.id === value && (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18, color: "var(--primary, var(--action))" }}
                    >
                      check
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer - Criar novo */}
          {onCriarFornecedor && (
            <div style={styles.footer}>
              <button
                type="button"
                style={styles.btnCriarNovo}
                onClick={handleCriarNovo}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  add
                </span>
                Cadastrar Novo Fornecedor
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <FornecedorForm
          isVisible={true}
          onSalvar={handleSalvarNovo}
          onClose={() => setMostrarFormulario(false)}
          salvando={salvandoNovo}
        />
      )}
    </div>
  );
};

export default FornecedorSelect;
