// src/components/natureza/NaturezasList.jsx
// Lista de naturezas de despesa de uma emenda

import React, { useState, useCallback } from "react";
import NaturezaCard from "./NaturezaCard";
import NaturezaForm from "./NaturezaForm";
import { parseValorMonetario } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";
import ConfirmationModal from "../ConfirmationModal";

/**
 * Lista de naturezas de uma emenda
 * @param {object} props
 * @param {array} props.naturezas - Lista de naturezas
 * @param {object} props.emenda - Dados da emenda
 * @param {boolean} props.loading - Se esta carregando
 * @param {boolean} props.salvando - Se esta salvando
 * @param {function} props.onCriarNatureza - Callback para criar natureza
 * @param {function} props.onEditarNatureza - Callback para editar natureza
 * @param {function} props.onExcluirNatureza - Callback para excluir natureza
 * @param {function} props.onNovaDespesa - Callback para criar despesa
 * @param {function} props.onEditarDespesa - Callback para editar despesa
 * @param {function} props.onVisualizarDespesa - Callback para visualizar despesa
 * @param {function} props.onCarregarDespesas - Callback para carregar despesas de uma natureza
 * @param {function} props.validarAlocacao - Funcao para validar alocacao
 * @param {object} props.despesasPorNatureza - Mapa de despesas por natureza
 */
const NaturezasList = ({
  naturezas = [],
  emenda,
  loading = false,
  salvando = false,
  onCriarNatureza,
  onEditarNatureza,
  onExcluirNatureza,
  onNovaDespesa,
  onEditarDespesa,
  onVisualizarDespesa,
  onCarregarDespesas,
  validarAlocacao,
  despesasPorNatureza = {},
}) => {
  const { isDark } = useTheme?.() || { isDark: false };

  // Estados
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [naturezaEmEdicao, setNaturezaEmEdicao] = useState(null);
  const [naturezaParaExcluir, setNaturezaParaExcluir] = useState(null);
  const [naturezasExpandidas, setNaturezasExpandidas] = useState({});
  const [carregandoDespesas, setCarregandoDespesas] = useState({});

  // Calcular saldo livre da emenda
  const valorTotal = parseValorMonetario(
    emenda?.valor || emenda?.valorRecurso || emenda?.valorTotal || 0
  );
  const valorAlocado = parseValorMonetario(emenda?.valorAlocado || 0);
  const saldoLivre = valorTotal - valorAlocado;

  // Calculos agregados
  const totalExecutado = naturezas.reduce(
    (sum, n) => sum + parseValorMonetario(n.valorExecutado || 0),
    0
  );

  // Handlers
  const handleAbrirFormulario = () => {
    setNaturezaEmEdicao(null);
    setMostrarFormulario(true);
  };

  const handleEditarNatureza = (natureza) => {
    setNaturezaEmEdicao(natureza);
    setMostrarFormulario(true);
  };

  const handleFecharFormulario = () => {
    setMostrarFormulario(false);
    setNaturezaEmEdicao(null);
  };

  const handleSalvarNatureza = async (dados) => {
    try {
      if (naturezaEmEdicao) {
        await onEditarNatureza?.(naturezaEmEdicao.id, dados);
      } else {
        await onCriarNatureza?.(dados);
      }
      handleFecharFormulario();
    } catch (error) {
      throw error;
    }
  };

  const handleConfirmarExclusao = async () => {
    if (naturezaParaExcluir) {
      try {
        await onExcluirNatureza?.(naturezaParaExcluir.id);
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
      setNaturezaParaExcluir(null);
    }
  };

  const handleExpandir = useCallback(
    async (naturezaId, expandido) => {
      setNaturezasExpandidas((prev) => ({
        ...prev,
        [naturezaId]: expandido,
      }));

      // Carregar despesas se expandindo e ainda nao carregadas
      if (expandido && !despesasPorNatureza[naturezaId] && onCarregarDespesas) {
        setCarregandoDespesas((prev) => ({ ...prev, [naturezaId]: true }));
        try {
          await onCarregarDespesas(naturezaId);
        } catch (error) {
          console.error("Erro ao carregar despesas:", error);
        }
        setCarregandoDespesas((prev) => ({ ...prev, [naturezaId]: false }));
      }
    },
    [despesasPorNatureza, onCarregarDespesas]
  );

  // Estilos - Design compacto e profissional
  const styles = {
    container: {
      marginTop: "16px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    titulo: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    badge: {
      backgroundColor: "var(--primary, #2563EB)",
      color: "var(--white, #ffffff)",
      padding: "2px 6px",
      borderRadius: "var(--border-radius-full, 10px)",
      fontSize: "11px",
      fontWeight: "var(--font-weight-semibold, 600)",
    },
    btnNovo: {
      padding: "6px 12px",
      fontSize: "var(--font-size-xs, 12px)",
      fontWeight: "var(--font-weight-medium, 500)",
      border: "none",
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: "var(--primary, #2563EB)",
      color: "var(--white, #ffffff)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    btnNovoDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    resumo: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "8px",
      marginBottom: "12px",
    },
    cardResumo: {
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius, 6px)",
      padding: "10px 12px",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
    },
    cardResumoLabel: {
      fontSize: "10px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "2px",
    },
    cardResumoValor: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-bold, 700)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
    },
    lista: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    emptyState: {
      textAlign: "center",
      padding: "24px 16px",
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius-md, 8px)",
      border: `1px dashed ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
    },
    emptyIcon: {
      fontSize: 32,
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
      marginBottom: "8px",
    },
    emptyTitulo: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      marginBottom: "4px",
    },
    emptyDescricao: {
      fontSize: "var(--font-size-xs, 12px)",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "12px",
    },
    loading: {
      textAlign: "center",
      padding: "24px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
    },
    formularioContainer: {
      marginBottom: "12px",
    },
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 32, animation: "spin 1s linear infinite" }}
        >
          sync
        </span>
        <p>Carregando naturezas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.titulo}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            account_balance_wallet
          </span>
          Naturezas de Despesa
          <span style={styles.badge}>{naturezas.length}</span>
        </h3>

        {!mostrarFormulario && (
          <button
            style={{
              ...styles.btnNovo,
              ...(saldoLivre <= 0 ? styles.btnNovoDisabled : {}),
            }}
            onClick={handleAbrirFormulario}
            disabled={saldoLivre <= 0}
            title={
              saldoLivre <= 0
                ? "Sem saldo livre para alocar"
                : "Criar nova natureza"
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add
            </span>
            Nova Natureza
          </button>
        )}
      </div>

      {/* Resumo */}
      <div style={styles.resumo}>
        <div style={styles.cardResumo}>
          <div style={styles.cardResumoLabel}>Valor da Emenda</div>
          <div style={styles.cardResumoValor}>
            R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={styles.cardResumo}>
          <div style={styles.cardResumoLabel}>Total Alocado</div>
          <div style={{ ...styles.cardResumoValor, color: "#3b82f6" }}>
            R$ {valorAlocado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={styles.cardResumo}>
          <div style={styles.cardResumoLabel}>Saldo Livre</div>
          <div
            style={{
              ...styles.cardResumoValor,
              color: saldoLivre > 0 ? "#10b981" : "#ef4444",
            }}
          >
            R$ {saldoLivre.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={styles.cardResumo}>
          <div style={styles.cardResumoLabel}>Total Executado</div>
          <div style={{ ...styles.cardResumoValor, color: "#8b5cf6" }}>
            R$ {totalExecutado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div style={styles.formularioContainer}>
          <NaturezaForm
            onSalvar={handleSalvarNatureza}
            onCancelar={handleFecharFormulario}
            naturezaParaEditar={naturezaEmEdicao}
            saldoLivre={
              naturezaEmEdicao
                ? saldoLivre + parseValorMonetario(naturezaEmEdicao.valorAlocado || 0)
                : saldoLivre
            }
            salvando={salvando}
            validarAlocacao={validarAlocacao}
          />
        </div>
      )}

      {/* Lista de naturezas ou empty state */}
      {naturezas.length === 0 ? (
        <div style={styles.emptyState}>
          <span className="material-symbols-outlined" style={styles.emptyIcon}>
            account_balance_wallet
          </span>
          <div style={styles.emptyTitulo}>Nenhuma natureza cadastrada</div>
          <div style={styles.emptyDescricao}>
            Cadastre naturezas de despesa para organizar o orcamento da emenda em
            envelopes. Cada natureza reserva uma parte do saldo para despesas
            especificas.
          </div>
          {!mostrarFormulario && saldoLivre > 0 && (
            <button style={styles.btnNovo} onClick={handleAbrirFormulario}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Cadastrar Primeira Natureza
            </button>
          )}
        </div>
      ) : (
        <div style={styles.lista}>
          {naturezas.map((natureza) => (
            <NaturezaCard
              key={natureza.id}
              natureza={natureza}
              despesas={despesasPorNatureza[natureza.id] || []}
              carregandoDespesas={carregandoDespesas[natureza.id] || false}
              expandido={naturezasExpandidas[natureza.id] || false}
              onExpandir={handleExpandir}
              onNovaDespesa={onNovaDespesa}
              onEditarNatureza={handleEditarNatureza}
              onExcluirNatureza={(n) => setNaturezaParaExcluir(n)}
              onEditarDespesa={onEditarDespesa}
              onVisualizarDespesa={onVisualizarDespesa}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmacao de exclusao */}
      {naturezaParaExcluir && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setNaturezaParaExcluir(null)}
          onConfirm={handleConfirmarExclusao}
          title="Excluir Natureza"
          message={`Tem certeza que deseja excluir a natureza "${naturezaParaExcluir.descricao}"? O valor alocado sera liberado para o saldo livre da emenda.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
        />
      )}
    </div>
  );
};

export default NaturezasList;
