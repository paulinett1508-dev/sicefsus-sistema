// src/components/fornecedor/FornecedorCard.jsx
// Card compacto e expansivel para fornecedor - otimizado para listas grandes

import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Card de fornecedor otimizado para listas grandes
 */
const FornecedorCard = ({
  fornecedor,
  despesasVinculadas = 0,
  onEditar,
  onExcluir,
  onSelecionar,
  modoSelecao = false,
  selecionado = false,
  podeEditar = true,
  podeExcluir = true,
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const [expandido, setExpandido] = useState(false);

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

  // Status config
  const getStatusConfig = () => {
    const status = fornecedor.situacaoCadastral?.toUpperCase();
    if (status === "ATIVA") return { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", label: "Ativa" };
    if (status === "BAIXADA") return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", label: "Baixada" };
    if (status === "SUSPENSA") return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "Suspensa" };
    if (status === "INAPTA") return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", label: "Inapta" };
    return { color: "#64748b", bg: "rgba(100, 116, 139, 0.1)", label: "N/A" };
  };

  const statusConfig = getStatusConfig();
  const endereco = fornecedor.endereco || {};
  const contato = fornecedor.contato || {};

  // Montar endereco resumido
  const enderecoResumo = [endereco.cidade, endereco.uf].filter(Boolean).join("/");

  // Handler de clique
  const handleClick = () => {
    if (modoSelecao) {
      onSelecionar?.(fornecedor);
    } else {
      setExpandido(!expandido);
    }
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
        borderRadius: "8px",
        border: selecionado
          ? "2px solid var(--primary, #2563EB)"
          : `1px solid ${isDark ? "var(--theme-border)" : "#e2e8f0"}`,
        overflow: "hidden",
        transition: "all 0.15s ease",
      }}
    >
      {/* Header - Sempre visivel, layout horizontal compacto */}
      <div
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          gap: "12px",
          cursor: "pointer",
          backgroundColor: expandido
            ? isDark ? "rgba(255,255,255,0.02)" : "#f8fafc"
            : "transparent",
        }}
      >
        {/* Icone expand/select */}
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 20,
            color: modoSelecao && selecionado
              ? "var(--primary, #2563EB)"
              : isDark ? "var(--text-secondary)" : "#94a3b8",
            transition: "transform 0.2s",
            transform: !modoSelecao && expandido ? "rotate(90deg)" : "rotate(0)",
            flexShrink: 0,
          }}
        >
          {modoSelecao ? (selecionado ? "check_circle" : "radio_button_unchecked") : "chevron_right"}
        </span>

        {/* CNPJ - Monoespaçado, destaque */}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: 600,
            color: isDark ? "var(--text-primary)" : "#334155",
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
            padding: "4px 8px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          {formatarCNPJ(fornecedor.cnpj)}
        </span>

        {/* Razao Social - Flex grow, truncate */}
        <span
          style={{
            flex: 1,
            fontSize: "14px",
            fontWeight: 500,
            color: isDark ? "var(--text-primary)" : "#1e293b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
          title={fornecedor.razaoSocial}
        >
          {fornecedor.razaoSocial || "Sem razao social"}
        </span>

        {/* Cidade/UF */}
        {enderecoResumo && (
          <span
            style={{
              fontSize: "12px",
              color: isDark ? "var(--text-secondary)" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
            {enderecoResumo}
          </span>
        )}

        {/* Despesas badge */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: despesasVinculadas > 0
              ? isDark ? "#60a5fa" : "#2563eb"
              : isDark ? "var(--text-secondary)" : "#94a3b8",
            backgroundColor: despesasVinculadas > 0
              ? isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.08)"
              : "transparent",
            padding: despesasVinculadas > 0 ? "4px 8px" : "4px 0",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>receipt_long</span>
          {despesasVinculadas}
        </span>

        {/* Status badge */}
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            color: statusConfig.color,
            backgroundColor: statusConfig.bg,
            padding: "4px 8px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Body expandido - Detalhes */}
      {expandido && !modoSelecao && (
        <div
          style={{
            padding: "0 16px 16px 48px",
            borderTop: `1px solid ${isDark ? "var(--theme-border)" : "#e2e8f0"}`,
          }}
        >
          {/* Grid de informacoes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              paddingTop: "16px",
            }}
          >
            {/* Dados da Empresa */}
            <div>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: isDark ? "var(--text-secondary)" : "#64748b",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>business</span>
                Empresa
              </h4>
              <div style={{ fontSize: "13px", color: isDark ? "var(--text-primary)" : "#334155" }}>
                {fornecedor.nomeFantasia && (
                  <div style={{ marginBottom: "4px" }}>
                    <span style={{ color: isDark ? "var(--text-secondary)" : "#94a3b8" }}>Fantasia: </span>
                    {fornecedor.nomeFantasia}
                  </div>
                )}
                <div>
                  <span style={{ color: isDark ? "var(--text-secondary)" : "#94a3b8" }}>Situacao: </span>
                  <span style={{ color: statusConfig.color, fontWeight: 500 }}>
                    {fornecedor.situacaoCadastral || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Endereco */}
            {(endereco.logradouro || endereco.cidade) && (
              <div>
                <h4
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: isDark ? "var(--text-secondary)" : "#64748b",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                  Endereco
                </h4>
                <div style={{ fontSize: "13px", color: isDark ? "var(--text-primary)" : "#334155", lineHeight: 1.5 }}>
                  {endereco.logradouro && (
                    <div>{endereco.logradouro}{endereco.numero ? `, ${endereco.numero}` : ""}</div>
                  )}
                  {endereco.bairro && <div>{endereco.bairro}</div>}
                  {endereco.cidade && (
                    <div>{endereco.cidade}{endereco.uf ? `/${endereco.uf}` : ""}</div>
                  )}
                  {endereco.cep && (
                    <div style={{ color: isDark ? "var(--text-secondary)" : "#94a3b8" }}>
                      CEP: {endereco.cep}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contato */}
            {(contato.telefone || contato.email) && (
              <div>
                <h4
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: isDark ? "var(--text-secondary)" : "#64748b",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>contact_phone</span>
                  Contato
                </h4>
                <div style={{ fontSize: "13px", color: isDark ? "var(--text-primary)" : "#334155" }}>
                  {contato.telefone && (
                    <div style={{ marginBottom: "4px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4, color: isDark ? "var(--text-secondary)" : "#94a3b8" }}>call</span>
                      {contato.telefone}
                    </div>
                  )}
                  {contato.email && (
                    <div>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4, color: isDark ? "var(--text-secondary)" : "#94a3b8" }}>mail</span>
                      {contato.email}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Acoes */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: `1px solid ${isDark ? "var(--theme-border)" : "#e2e8f0"}`,
            }}
          >
            {podeEditar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar?.(fornecedor);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: `1px solid ${isDark ? "var(--theme-border)" : "#e2e8f0"}`,
                  borderRadius: "6px",
                  backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
                  color: isDark ? "var(--text-primary)" : "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                Editar
              </button>
            )}

            {podeExcluir && despesasVinculadas === 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExcluir?.(fornecedor);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                Excluir
              </button>
            )}

            {despesasVinculadas > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "12px",
                  color: isDark ? "var(--text-secondary)" : "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
                Vinculado a {despesasVinculadas} despesa{despesasVinculadas > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FornecedorCard;
