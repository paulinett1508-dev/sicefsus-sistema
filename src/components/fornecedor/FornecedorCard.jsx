// src/components/fornecedor/FornecedorCard.jsx
// Card expansivel para exibir dados de fornecedor

import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Card expansivel de fornecedor
 * @param {object} props
 * @param {object} props.fornecedor - Dados do fornecedor
 * @param {number} props.despesasVinculadas - Quantidade de despesas vinculadas
 * @param {function} props.onEditar - Callback para editar
 * @param {function} props.onExcluir - Callback para excluir
 * @param {function} props.onSelecionar - Callback para selecionar (modo selecao)
 * @param {boolean} props.modoSelecao - Se esta em modo selecao
 * @param {boolean} props.selecionado - Se este fornecedor esta selecionado
 * @param {function} props.onExpandir - Callback ao expandir
 * @param {boolean} props.expandido - Se esta expandido
 * @param {boolean} props.podeEditar - Se pode editar
 * @param {boolean} props.podeExcluir - Se pode excluir
 */
const FornecedorCard = ({
  fornecedor,
  despesasVinculadas = 0,
  onEditar,
  onExcluir,
  onSelecionar,
  modoSelecao = false,
  selecionado = false,
  onExpandir,
  expandido = false,
  podeEditar = true,
  podeExcluir = true,
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const [expandidoLocal, setExpandidoLocal] = useState(expandido);

  useEffect(() => {
    setExpandidoLocal(expandido);
  }, [expandido]);

  // Formatar CNPJ
  const formatarCNPJ = (cnpj) => {
    if (!cnpj) return "-";
    const numeros = cnpj.replace(/\D/g, "");
    if (numeros.length !== 14) return cnpj;
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  };

  // Status visual
  const getStatusColor = () => {
    const status = fornecedor.situacaoCadastral?.toUpperCase();
    if (status === "ATIVA") return "#10b981"; // Verde
    if (status === "BAIXADA") return "#ef4444"; // Vermelho
    if (status === "SUSPENSA") return "#f59e0b"; // Amarelo
    return "#64748b"; // Cinza
  };

  const handleToggleExpandir = () => {
    if (modoSelecao) {
      onSelecionar?.(fornecedor);
      return;
    }
    const novoEstado = !expandidoLocal;
    setExpandidoLocal(novoEstado);
    if (onExpandir) {
      onExpandir(fornecedor.id, novoEstado);
    }
  };

  // Estilos
  const styles = {
    card: {
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius-md, 8px)",
      border: selecionado
        ? `2px solid var(--primary, #2563EB)`
        : `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      overflow: "hidden",
      position: "relative",
      transition: "border-color 0.2s, box-shadow 0.2s",
      ...(modoSelecao && {
        cursor: "pointer",
        "&:hover": {
          borderColor: "var(--primary, #2563EB)",
        },
      }),
    },
    statusBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: getStatusColor(),
      color: "#fff",
      padding: "2px 8px",
      fontSize: "10px",
      fontWeight: 600,
      borderBottomLeftRadius: "6px",
      textTransform: "uppercase",
    },
    header: {
      display: "flex",
      alignItems: "center",
      padding: "10px 12px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      backgroundColor: expandidoLocal
        ? isDark
          ? "var(--theme-surface-secondary)"
          : "var(--gray-50, #F8FAFC)"
        : selecionado
          ? isDark
            ? "rgba(37, 99, 235, 0.1)"
            : "rgba(37, 99, 235, 0.05)"
          : "transparent",
    },
    expandIcon: {
      fontSize: 18,
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginRight: "8px",
      transition: "transform 0.2s",
      transform: expandidoLocal ? "rotate(90deg)" : "rotate(0deg)",
    },
    checkIcon: {
      fontSize: 18,
      color: selecionado ? "var(--primary, #2563EB)" : isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
      marginRight: "8px",
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    titulo: {
      fontSize: "var(--font-size-sm, 13px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    cnpj: {
      fontSize: "11px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-100, #F1F5F9)",
      padding: "2px 6px",
      borderRadius: "var(--border-radius-sm, 4px)",
      fontFamily: "monospace",
      flexShrink: 0,
    },
    razaoSocial: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    metricas: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexShrink: 0,
    },
    metrica: {
      textAlign: "right",
    },
    metricaLabel: {
      fontSize: "10px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
      display: "block",
    },
    metricaValor: {
      fontSize: "var(--font-size-sm, 13px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
    },
    body: {
      borderTop: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      padding: "12px",
      display: expandidoLocal ? "block" : "none",
    },
    section: {
      marginBottom: "12px",
    },
    sectionTitle: {
      fontSize: "11px",
      fontWeight: 600,
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "8px",
    },
    campo: {
      fontSize: "12px",
    },
    campoLabel: {
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
      fontSize: "10px",
      display: "block",
      marginBottom: "2px",
    },
    campoValor: {
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      fontWeight: 500,
    },
    acoes: {
      display: "flex",
      gap: "6px",
      marginTop: "12px",
      paddingTop: "12px",
      borderTop: `1px solid ${isDark ? "var(--theme-border)" : "var(--gray-200, #E2E8F0)"}`,
    },
    btnAcao: {
      padding: "6px 12px",
      fontSize: "var(--font-size-xs, 12px)",
      fontWeight: "var(--font-weight-medium, 500)",
      border: "none",
      borderRadius: "var(--border-radius-sm, 4px)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    btnSecundario: {
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-100, #F1F5F9)",
      color: isDark ? "var(--theme-text)" : "var(--gray-600, #475569)",
    },
    btnPerigo: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
      color: "var(--error, #EF4444)",
    },
    btnDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  };

  const endereco = fornecedor.endereco || {};
  const contato = fornecedor.contato || {};

  // Montar endereco completo
  const enderecoCompleto = [
    endereco.logradouro,
    endereco.numero && `n ${endereco.numero}`,
    endereco.complemento,
    endereco.bairro,
    endereco.cidade && endereco.uf && `${endereco.cidade}/${endereco.uf}`,
    endereco.cep && `CEP: ${endereco.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div style={styles.card}>
      {/* Badge de status */}
      <div style={styles.statusBadge}>
        {fornecedor.situacaoCadastral || "N/A"}
      </div>

      {/* Header - sempre visivel */}
      <div
        style={styles.header}
        onClick={handleToggleExpandir}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleExpandir();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expandidoLocal}
        aria-label={`${fornecedor.razaoSocial}, ${expandidoLocal ? "clique para recolher" : "clique para expandir"}`}
      >
        {modoSelecao ? (
          <span className="material-symbols-outlined" style={styles.checkIcon} aria-hidden="true">
            {selecionado ? "check_circle" : "radio_button_unchecked"}
          </span>
        ) : (
          <span className="material-symbols-outlined" style={styles.expandIcon} aria-hidden="true">
            chevron_right
          </span>
        )}

        <div style={styles.info}>
          <div style={styles.titulo}>
            <span style={styles.cnpj}>{formatarCNPJ(fornecedor.cnpj)}</span>
            <span style={styles.razaoSocial}>
              {fornecedor.razaoSocial || "Sem razao social"}
            </span>
          </div>
        </div>

        <div style={styles.metricas}>
          <div style={styles.metrica}>
            <span style={styles.metricaLabel}>Despesas</span>
            <span style={styles.metricaValor}>{despesasVinculadas}</span>
          </div>
          {endereco.cidade && (
            <div style={styles.metrica}>
              <span style={styles.metricaLabel}>Cidade</span>
              <span style={styles.metricaValor}>
                {endereco.cidade}/{endereco.uf}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body - expansivel */}
      {!modoSelecao && (
        <div style={styles.body}>
          {/* Dados da Empresa */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                business
              </span>
              Dados da Empresa
            </div>
            <div style={styles.grid}>
              <div style={styles.campo}>
                <span style={styles.campoLabel}>CNPJ</span>
                <span style={styles.campoValor}>{formatarCNPJ(fornecedor.cnpj)}</span>
              </div>
              <div style={styles.campo}>
                <span style={styles.campoLabel}>Situacao Cadastral</span>
                <span style={{ ...styles.campoValor, color: getStatusColor() }}>
                  {fornecedor.situacaoCadastral || "N/A"}
                </span>
              </div>
              <div style={{ ...styles.campo, gridColumn: "1 / -1" }}>
                <span style={styles.campoLabel}>Razao Social</span>
                <span style={styles.campoValor}>{fornecedor.razaoSocial || "-"}</span>
              </div>
              {fornecedor.nomeFantasia && (
                <div style={{ ...styles.campo, gridColumn: "1 / -1" }}>
                  <span style={styles.campoLabel}>Nome Fantasia</span>
                  <span style={styles.campoValor}>{fornecedor.nomeFantasia}</span>
                </div>
              )}
            </div>
          </div>

          {/* Endereco */}
          {enderecoCompleto && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  location_on
                </span>
                Endereco
              </div>
              <div style={styles.campo}>
                <span style={styles.campoValor}>{enderecoCompleto}</span>
              </div>
            </div>
          )}

          {/* Contato */}
          {(contato.telefone || contato.email) && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  contact_phone
                </span>
                Contato
              </div>
              <div style={styles.grid}>
                {contato.telefone && (
                  <div style={styles.campo}>
                    <span style={styles.campoLabel}>Telefone</span>
                    <span style={styles.campoValor}>{contato.telefone}</span>
                  </div>
                )}
                {contato.email && (
                  <div style={styles.campo}>
                    <span style={styles.campoLabel}>Email</span>
                    <span style={styles.campoValor}>{contato.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acoes */}
          <div style={styles.acoes}>
            {podeEditar && (
              <button
                style={{ ...styles.btnAcao, ...styles.btnSecundario }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar?.(fornecedor);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  edit
                </span>
                Editar
              </button>
            )}

            {podeExcluir && despesasVinculadas === 0 && (
              <button
                style={{ ...styles.btnAcao, ...styles.btnPerigo }}
                onClick={(e) => {
                  e.stopPropagation();
                  onExcluir?.(fornecedor);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  delete
                </span>
                Excluir
              </button>
            )}

            {despesasVinculadas > 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginLeft: "auto",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  info
                </span>
                {despesasVinculadas} despesa(s) vinculada(s)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FornecedorCard;
