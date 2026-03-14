// src/components/DespesasTable.jsx
// ✅ OTIMIZADA: Foco em pagamentos por emenda
// ✅ AGRUPAMENTO: Pagamentos organizados por emenda
// ✅ CORRIGIDO: Badge agora mostra "Objeto da Emenda" em vez de "N/A"
// ✅ CORRIGIDO: Status diferenciado (Pago, Empenhado, etc.)

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { useTheme } from "../context/ThemeContext";
import { doc, deleteDoc, runTransaction } from "firebase/firestore";
import { NATUREZAS_DESPESA } from "../config/constants"; // mapeia código → rótulo (fallback seguro abaixo)

const PRIMARY = "var(--action)";
const ACCENT = "#3B82F6";
const WHITE = "#fff";
const ERROR = "#EF4444";
const SUCCESS = "#10B981";
const WARNING = "#F59E0B";

// 🔧 HELPER: Parse seguro de valor monetário
const parseValorMonetario = (valor) => {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;

  // Remove tudo exceto números, vírgula e ponto
  const valorLimpo = String(valor)
    .replace(/[^\d,.-]/g, "") // Remove R$, espaços, etc
    .replace(/\./g, "") // Remove separador de milhar
    .replace(",", "."); // Vírgula vira ponto

  const numero = parseFloat(valorLimpo);
  return isNaN(numero) ? 0 : numero;
};

export default function DespesasTable({
  despesas,
  emendas,
  loading,
  onEdit,
  onView,
  onDelete,
  totalDespesas = 0,
  ocultarBotoesAgrupamento = false, // Nova prop para ocultar botões de agrupamento
}) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [excluindo, setExcluindo] = useState(null);
  const [confirmExclusao, setConfirmExclusao] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState("detalhado");
  const [modoAgrupamento, setModoAgrupamento] = useState("agrupado"); // 🆕

  // ✅ AGRUPAR DESPESAS POR EMENDA
  const despesasAgrupadas = useMemo(() => {
    const grupos = {};

    despesas.forEach((despesa) => {
      const emendaId = despesa.emendaId;
      if (!grupos[emendaId]) {
        const emenda = emendas.find((e) => e.id === emendaId);
        grupos[emendaId] = {
          emenda: emenda || {
            id: emendaId,
            numero: emendaId, // Mostrar ID ao invés de N/A
            objeto: "Emenda sem dados",
          },
          despesas: [],
          totalValor: 0,
        };
      }
      grupos[emendaId].despesas.push(despesa);
      grupos[emendaId].totalValor += parseValorMonetario(despesa.valor);
    });

    return Object.values(grupos);
  }, [despesas, emendas]);

  // =====================================================
  // 📦 HELPERS (datas, pick, natureza, ação, CNPJ, município/UF)
  // =====================================================

  // ✅ Formatar datas (Firestore Timestamp, ISO string, Date, number)
  function formatarDataFirestore(data) {
    if (!data) return "-";

    try {
      let date;
      if (data.seconds) {
        date = new Date(data.seconds * 1000);
      } else if (typeof data === "string") {
        date = new Date(data);
      } else if (data instanceof Date) {
        date = data;
      } else if (typeof data === "number") {
        date = new Date(data);
      } else {
        return "-";
      }

      if (isNaN(date.getTime())) {
        return "-";
      }

      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error, data);
      return "-";
    }
  }

  // ✅ utilitário pick (pega o primeiro campo válido)
  const pick = (obj, keys) => {
    if (!obj) return undefined;
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  };

  // ✅ tabela de natureza (código → rótulo) com fallback
  const naturezaMap = useMemo(() => {
    try {
      if (Array.isArray(NATUREZAS_DESPESA)) {
        return Object.fromEntries(
          NATUREZAS_DESPESA.map((n) => [
            n.value ?? n.codigo ?? n,
            n.label ?? n.nome ?? n,
          ]),
        );
      }
    } catch (e) {
      // ignora
    }
    return {};
  }, []);

  const getNaturezaLabel = (despesa) => {
    const codigo = pick(despesa, [
      "natureza",
      "naturezaDespesa",
      "codNatureza",
      "natureza_despesa",
    ]);
    const rotuloDireto = pick(despesa, [
      "naturezaLabel",
      "naturezaDescricao",
      "natureza_descricao",
    ]);
    return rotuloDireto || naturezaMap[codigo] || codigo || "-";
  };

  // 🔧 FUNÇÃO REMOVIDA - Coluna MUNICÍPIO/UF foi excluída
  // const getMunicipioUF = (despesa) => {
  //   let mun = pick(despesa, ["municipio", "municipioNome", "cidade"]);
  //   let uf = pick(despesa, ["uf", "estado"]);
  //
  //   if (!mun || !uf) {
  //     const emenda = emendas?.find((e) => e.id === despesa.emendaId);
  //     if (emenda) {
  //       mun = mun || pick(emenda, ["municipio", "municipioNome", "cidade"]);
  //       uf = uf || pick(emenda, ["uf", "estado"]);
  //     }
  //   }
  //   return mun || uf ? `${mun || ""}${uf ? `/${uf}` : ""}` : "-";
  // };

  // =====================================================
  // 🔎 Info da Emenda e Status
  // =====================================================

  // ✅ Buscar dados da emenda
  function getEmendaInfo(emendaId) {
    if (!emendas || !emendaId) return "-";
    const emenda = emendas.find((e) => e.id === emendaId);
    if (!emenda) return "Emenda não encontrada";

    const numero = emenda.numero || emenda.numeroEmenda || "-";
    const parlamentar = emenda.parlamentar || emenda.autor || "-";
    return `${numero} - ${parlamentar}`;
  }

  // ✅ Objeto/tipo da emenda
  function getObjetoEmenda(emendaId) {
    if (!emendas || !emendaId) return "N/A";
    const emenda = emendas.find((e) => e.id === emendaId);
    if (!emenda) return "N/A";
    // Campo correto: tipoEmenda (ex: "Custeio PAP", "Custeio MAC", etc.)
    return emenda.tipoEmenda || emenda.tipo || "N/A";
  }

  // ✅ Cor do badge de tipo/objeto
  function getObjetoColor(objeto) {
    const cores = {
      "Custeio PAP": "#007bff",
      "Custeio MAC": "#28a745",
      "Investimento PAP": "#ffc107",
      "Investimento MAC": "#6f42c1",
      "Custeio PAP – Estadual": "#17a2b8",
      "Custeio MAC – Estadual": "#fd7e14",
      Individual: "#007bff",
      Bancada: "#28a745",
    };

    // Se não encontrar cor específica, usa cinza
    return cores[objeto] || "#6c757d";
  }

  // ✅ Status com cores diferenciadas
  function getStatusColor(status) {
    if (!status) return "#6c757d";

    const statusLimpo = String(status).toUpperCase().trim();

    const cores = {
      PENDENTE: "#6c757d",
      EMPENHADO: "#007bff",
      LIQUIDADO: "#ffc107",
      PAGO: SUCCESS,
      EXECUTADA: SUCCESS,
      CANCELADO: ERROR,
    };

    return cores[statusLimpo] || "#6c757d";
  }

  // ✅ Formatar status para exibição
  function formatarStatus(status) {
    if (!status) return "Pendente";

    // Se status for "EXECUTADA", mostrar "Pago"
    const statusLimpo = String(status).toUpperCase().trim();

    const statusMap = {
      EXECUTADA: "Pago",
      PAGO: "Pago",
      EMPENHADO: "Empenhado",
      LIQUIDADO: "Liquidado",
      PENDENTE: "Pendente",
      CANCELADO: "Cancelado",
    };

    return statusMap[statusLimpo] || status;
  }

  // ✅ Cor do Status Financeiro (statusPagamento)
  function getStatusFinanceiroColor(statusPagamento) {
    if (!statusPagamento) return "#6c757d";

    const statusLimpo = String(statusPagamento).toLowerCase().trim();

    const cores = {
      pago: SUCCESS, // Verde
      pendente: "#ffc107", // Amarelo
      parcial: "#17a2b8", // Azul (info)
      atrasado: ERROR, // Vermelho
      cancelado: "#6c757d", // Cinza
    };

    return cores[statusLimpo] || "#6c757d";
  }

  // ✅ Formatar Status Financeiro para exibição
  function formatarStatusFinanceiro(statusPagamento) {
    if (!statusPagamento) return "Pendente";

    const statusLimpo = String(statusPagamento).toLowerCase().trim();

    const statusMap = {
      pago: "Pago",
      pendente: "Pendente",
      parcial: "Parcial",
      atrasado: "Atrasado",
      cancelado: "Cancelado",
    };

    return statusMap[statusLimpo] || statusPagamento;
  }

  // =====================================================
  // 🗑️ Ações
  // =====================================================

  // ✅ Excluir despesa
  async function handleExcluir(despesa) {
    setExcluindo(despesa.id);
    try {
      await runTransaction(db, async (transaction) => {
        const emendaRef = doc(db, "emendas", despesa.emendaId);
        const emendaDoc = await transaction.get(emendaRef);

        if (!emendaDoc.exists()) {
          throw new Error("Emenda não encontrada");
        }

        // ✅ CORREÇÃO: Apenas despesas EXECUTADAS devolvem saldo
        if (despesa.status === "EXECUTADA") {
          const saldoAtual = emendaDoc.data().saldo;
          const novoSaldo = saldoAtual + parseValorMonetario(despesa.valor || 0);
          transaction.update(emendaRef, { saldo: novoSaldo });
          console.log(`✅ Despesa EXECUTADA deletada - Saldo devolvido: R$ ${despesa.valor}`);
        } else {
          console.log(`ℹ️ Despesa PLANEJADA deletada - Saldo não alterado`);
        }

        const despesaRef = doc(db, "despesas", despesa.id);
        transaction.delete(despesaRef);
      });

      setConfirmExclusao(null);
      if (onDelete) onDelete(despesa.id);
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      alert("Erro ao excluir despesa: " + error.message);
    } finally {
      setExcluindo(null);
    }
  }

  // ✅ Handlers
  function handleEditar(despesa) {
    if (onEdit && typeof onEdit === "function") {
      onEdit(despesa);
    } else {
      console.error("❌ DespesasTable: onEdit não é uma função!", {
        onEdit,
        tipoOnEdit: typeof onEdit,
      });
      alert("⚠️ Erro: Função de edição não configurada em DespesasTable");
    }
  }

  function handleVisualizar(despesa) {
    if (onView) onView(despesa);
  }

  function confirmarExclusao(despesa) {
    setConfirmExclusao(despesa);
  }

  // =====================================================
  // 🧱 Render da linha (mantém ordem com os <th>)
  // =====================================================
  const renderDespesaRow = (despesa, index, showEmenda = true) => (
    <tr
      key={despesa.id}
      style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
    >
      {showEmenda && (
        <td style={styles.td}>
          <div style={styles.emendaCell}>{getEmendaInfo(despesa.emendaId)}</div>
        </td>
      )}
      {showEmenda && (
        <td style={styles.td}>
          <span
            style={{
              ...styles.tipoBadge,
              backgroundColor: getObjetoColor(
                getObjetoEmenda(despesa.emendaId),
              ),
            }}
          >
            {getObjetoEmenda(despesa.emendaId)}
          </span>
        </td>
      )}

      {/* FORNECEDOR */}
      <td style={styles.td}>
        <div style={styles.fornecedorCell}>{despesa.fornecedor || "-"}</div>
      </td>

      {/* VALOR */}
      <td style={styles.tdValue}>
        R{"$"}{" "}
        {parseValorMonetario(despesa.valor).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}
      </td>

      {/* STATUS (Financeiro) */}
      <td style={styles.td}>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: getStatusFinanceiroColor(despesa.statusPagamento),
          }}
        >
          {formatarStatusFinanceiro(despesa.statusPagamento)}
        </span>
      </td>

      {/* Bloco Detalhado: Natureza, Ação, Contrato, Discriminação */}
      {modoVisualizacao === "detalhado" && (
        <>
          <td style={styles.td}>{getNaturezaLabel(despesa)}</td>
          <td style={styles.td}>
            <span style={styles.numeroCell}>
              {despesa.numeroContrato || "-"}
            </span>
          </td>
          <td style={styles.td}>
            <div style={styles.discriminacaoCell}>
              {despesa.discriminacao || "-"}
            </div>
          </td>
        </>
      )}

      {/* Nº EMPENHO, Nº NF, DATA PGTO */}
      <td style={styles.td}>
        <span style={styles.numeroCell}>{despesa.numeroEmpenho || "-"}</span>
      </td>
      <td style={styles.td}>
        <span style={styles.numeroCell}>
          {despesa.numeroNotaFiscal || despesa.numeroNota || "-"}
        </span>
      </td>
      <td style={styles.td}>
        <span style={styles.dataCell}>
          {formatarDataFirestore(despesa.dataPagamento)}
        </span>
      </td>

      {/* Bloco Detalhado removido: Município/UF */}

      {/* AÇÕES */}
      <td style={styles.tdActions}>
        <div style={styles.actionsContainer}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEditar(despesa);
            }}
            style={styles.editButton}
            title="Editar despesa"
            disabled={excluindo === despesa.id}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              confirmarExclusao(despesa);
            }}
            style={styles.deleteButton}
            title="Excluir despesa"
            disabled={excluindo === despesa.id}
          >
            {excluindo === despesa.id ? (
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>hourglass_empty</span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
            )}
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div style={styles.container}>
      <div style={styles.tableContainer}>
        {/* Toggle de visualização */}
        <div style={styles.viewToggleContainer}>
          {/* 🆕 Toggle de Agrupamento - OCULTAR quando dentro da emenda */}
          {!ocultarBotoesAgrupamento && (
            <div style={styles.toggleGroup}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModoAgrupamento("agrupado");
                }}
                style={{
                  ...styles.toggleButton,
                  ...(modoAgrupamento === "agrupado"
                    ? styles.toggleButtonActive
                    : {}),
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: "middle" }}>folder</span>
                Agrupado por Emenda
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModoAgrupamento("lista");
                }}
                style={{
                  ...styles.toggleButton,
                  ...(modoAgrupamento === "lista"
                    ? styles.toggleButtonActive
                    : {}),
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: "middle" }}>list</span>
                Lista Completa
              </button>
            </div>
          )}

          {/* Toggle Resumido/Detalhado - MANTER sempre visível */}
          <div style={styles.toggleGroup}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setModoVisualizacao("resumido");
              }}
              style={{
                ...styles.toggleButton,
                ...(modoVisualizacao === "resumido"
                  ? styles.toggleButtonActive
                  : {}),
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: "middle" }}>bar_chart</span>
              Resumido
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setModoVisualizacao("detalhado");
              }}
              style={{
                ...styles.toggleButton,
                ...(modoVisualizacao === "detalhado"
                  ? styles.toggleButtonActive
                  : {}),
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 6, verticalAlign: "middle" }}>view_list</span>
              Detalhado
            </button>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p>Carregando despesas...</p>
          </div>
        ) : despesas.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}><span className="material-symbols-outlined" style={{ fontSize: 48 }}>payments</span></div>
            <h3 style={styles.emptyTitle}>Nenhuma despesa cadastrada</h3>
            <p style={styles.emptyText}>
              Clique em "Nova Despesa" para adicionar registros
            </p>
          </div>
        ) : (
          <>
            {/* ============================= */}
            {/* MODO: AGRUPADO POR EMENDA */}
            {/* ============================= */}
            {modoAgrupamento === "agrupado" ? (
              <div style={styles.groupedContainer}>
                {despesasAgrupadas.map((grupo) => {
                  const emenda = grupo.emenda;
                  const despesasDoGrupo = grupo.despesas;

                  // ✅ Só mostrar header se houver MÚLTIPLAS emendas
                  const mostrarHeaderEmenda = despesasAgrupadas.length > 1;

                  return (
                    <div key={emenda.id} style={styles.emendaGroup}>
                      {/* Header da Emenda - CONDICIONAL */}
                      {mostrarHeaderEmenda && (
                        <div style={styles.emendaHeader}>
                          <div style={styles.emendaInfoHeader}>
                            <h3 style={styles.emendaNumero}>
                              Emenda {emenda.numero || "N/A"}
                            </h3>
                            <span style={styles.parlamentarText}>
                              {emenda.parlamentar || emenda.autor || "-"}
                            </span>
                            <span
                              style={{
                                ...styles.tipoBadgeHeader,
                                backgroundColor: getObjetoColor(
                                  getObjetoEmenda(emenda.id),
                                ),
                              }}
                            >
                              {getObjetoEmenda(emenda.id)}
                            </span>
                          </div>
                          <div style={styles.emendaStatsHeader}>
                            <span style={styles.statLabel}>
                              {despesasDoGrupo.length} pagamento(s)
                            </span>
                            <span style={styles.statValue}>
                              R{"$"}{" "}
                              {grupo.totalValor.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Tabela de Despesas da Emenda */}
                      <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                          <thead>
                            <tr style={styles.headerRow}>
                              <th style={styles.th}>FORNECEDOR</th>

                              <th style={styles.th}>VALOR</th>
                              <th style={styles.th}>STATUS</th>
                              {modoVisualizacao === "detalhado" && (
                                <>
                                  <th style={styles.th}>NATUREZA</th>

                                  <th style={styles.th}>Nº CONTRATO</th>
                                  <th style={styles.th}>DISCRIMINAÇÃO</th>
                                </>
                              )}
                              <th style={styles.th}>Nº EMPENHO</th>
                              <th style={styles.th}>Nº NF</th>
                              <th style={styles.th}>DATA PGTO</th>
                              <th style={{ ...styles.th, textAlign: "center" }}>
                                AÇÕES
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {despesasDoGrupo.map((despesa, index) =>
                              renderDespesaRow(despesa, index, false),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ============================= */
              /* MODO: LISTA COMPLETA */
              /* ============================= */
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.headerRow}>
                      <th style={styles.th}>EMENDA</th>
                      <th style={styles.th}>TIPO</th>
                      <th style={styles.th}>FORNECEDOR</th>

                      <th style={styles.th}>VALOR</th>
                      <th style={styles.th}>STATUS</th>
                      {modoVisualizacao === "detalhado" && (
                        <>
                          <th style={styles.th}>NATUREZA</th>

                          <th style={styles.th}>Nº CONTRATO</th>
                          <th style={styles.th}>DISCRIMINAÇÃO</th>
                        </>
                      )}
                      <th style={styles.th}>Nº EMPENHO</th>
                      <th style={styles.th}>Nº NF</th>
                      <th style={styles.th}>DATA PGTO</th>
                      <th style={{ ...styles.th, textAlign: "center" }}>
                        AÇÕES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {despesas.map((despesa, index) =>
                      renderDespesaRow(despesa, index, true),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmExclusao && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <span style={styles.modalIcon}>⚠️</span>
              <h2 style={styles.modalTitle}>Confirmar Exclusão</h2>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.despesaCard}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Fornecedor:</span>
                  <span style={styles.value}>
                    {confirmExclusao.fornecedor || "-"}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Valor:</span>
                  <span style={styles.valueHighlight}>
                    R{"$"}{" "}
                    {Number(confirmExclusao.valor || 0).toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Nº Empenho:</span>
                  <span style={styles.value}>
                    {confirmExclusao.numeroEmpenho || "-"}
                  </span>
                </div>
              </div>
              <div style={styles.warningMessage}>
                <p style={{ margin: 0, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--warning)" }}>warning</span>
                  Esta ação não pode ser desfeita. O saldo da emenda será
                  restaurado.
                </p>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setConfirmExclusao(null)}
                style={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExcluir(confirmExclusao)}
                style={styles.confirmDeleteButton}
                disabled={excluindo === confirmExclusao.id}
              >
                {excluindo === confirmExclusao.id
                  ? "Excluindo..."
                  : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// ESTILOS
// ========================================
const styles = {
  container: {
    backgroundColor: "var(--theme-surface, #fff)",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },

  tableContainer: {
    width: "100%",
  },

  viewToggleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "var(--theme-surface-secondary, #f8f9fa)",
    borderBottom: "1px solid var(--theme-border, #e9ecef)",
    gap: 16,
    flexWrap: "wrap",
  },

  toggleGroup: {
    display: "flex",
    gap: 8,
    backgroundColor: "var(--theme-surface, #fff)",
    borderRadius: 8,
    padding: 4,
    border: "1px solid var(--theme-border, #e9ecef)",
  },

  toggleButton: {
    padding: "8px 16px",
    border: "none",
    backgroundColor: "transparent",
    color: "var(--theme-text-secondary)",
    fontSize: 13,
    fontWeight: "500",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },

  toggleButtonActive: {
    backgroundColor: "var(--primary)",
    color: "#fff",
    fontWeight: "600",
  },

  loadingContainer: {
    padding: "60px 20px",
    textAlign: "center",
    color: "var(--theme-text-secondary, #666)",
  },

  loadingSpinner: {
    width: 40,
    height: 40,
    border: "4px solid var(--theme-border)",
    borderTop: "4px solid var(--primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },

  groupedContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    padding: 24,
  },

  emendaGroup: {
    border: "1px solid var(--theme-border, #e9ecef)",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "var(--theme-surface, #fff)",
  },

  emendaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "var(--theme-surface-secondary, #f8f9fa)",
    borderBottom: "2px solid var(--theme-border, #e9ecef)",
  },

  emendaInfoHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  emendaNumero: {
    fontSize: 16,
    fontWeight: "700",
    color: "var(--theme-text)",
    margin: 0,
  },

  parlamentarText: {
    fontSize: 14,
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
  },

  tipoBadgeHeader: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "4px",
    color: "var(--white)",
  },

  emendaStatsHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },

  statLabel: {
    fontSize: 12,
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: SUCCESS,
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
  },

  headerRow: {
    backgroundColor: "#1E293B",
    color: "#fff",
  },

  th: {
    padding: "12px 8px",
    textAlign: "left",
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    borderBottom: "2px solid #34495e",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    position: "sticky",
    top: 0,
    backgroundColor: "#1E293B",
    zIndex: 10,
  },

  evenRow: {
    backgroundColor: "var(--theme-surface-secondary)",
  },

  oddRow: {
    backgroundColor: "var(--theme-surface)",
  },

  td: {
    padding: "10px 8px",
    borderBottom: "1px solid var(--theme-border, #eee)",
    fontSize: 12,
    color: "var(--theme-text, #333)",
    verticalAlign: "middle",
  },

  tdValue: {
    padding: "10px 8px",
    borderBottom: "1px solid var(--theme-border)",
    fontSize: 12,
    color: SUCCESS,
    fontWeight: "600",
    textAlign: "right",
    fontFamily: "monospace",
  },

  tdActions: {
    padding: "10px 8px",
    borderBottom: "1px solid var(--theme-border, #eee)",
    fontSize: 12,
    color: "var(--theme-text, #333)",
    textAlign: "center",
    whiteSpace: "nowrap",
  },

  emendaCell: {
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: "500",
    fontSize: 11,
    color: "var(--theme-text)",
  },

  fornecedorCell: {
    maxWidth: 150,
    fontWeight: "500",
    fontSize: 12,
    color: "var(--theme-text)",
  },

  numeroCell: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "600",
    color: "var(--theme-text)",
    backgroundColor: "var(--theme-surface-secondary)",
    padding: "2px 6px",
    borderRadius: "3px",
    display: "inline-block",
  },

  dataCell: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "var(--theme-text-secondary, #666)",
    fontWeight: "500",
  },

  discriminacaoCell: {
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 11,
  },

  tipoBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "var(--white)",
    display: "inline-block",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "var(--white)",
    display: "inline-block",
    whiteSpace: "nowrap",
    textTransform: "capitalize",
  },

  actionsContainer: {
    display: "flex",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  viewButton: {
    background: "none",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 3,
    color: "var(--info)",
    transition: "all 0.2s",
  },

  editButton: {
    background: "none",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 3,
    color: "var(--warning)",
    transition: "all 0.2s",
  },

  deleteButton: {
    background: "none",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 3,
    color: "var(--danger)",
    transition: "all 0.2s",
  },

  summarySection: {
    display: "flex",
    justifyContent: "flex-start",
    padding: "16px 24px",
    borderTop: "2px solid var(--theme-border)",
    backgroundColor: "var(--theme-surface-secondary)",
    flexWrap: "wrap",
    gap: 24,
  },

  summaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: "140px",
  },

  summaryLabel: {
    fontSize: 12,
    color: "var(--theme-text-secondary, #666)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "var(--primary)",
  },

  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    color: "var(--theme-text-secondary, #666)",
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.3,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "var(--theme-text-muted)",
  },

  emptyText: {
    fontSize: 14,
    margin: 0,
    color: "var(--theme-text-secondary, #666)",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modalContent: {
    backgroundColor: "var(--theme-surface, #fff)",
    borderRadius: 12,
    maxWidth: 500,
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "24px 24px 20px",
    borderBottom: "1px solid var(--theme-border, #e5e7eb)",
  },

  modalIcon: {
    fontSize: 28,
  },

  modalTitle: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "var(--theme-text, #1f2937)",
  },

  modalBody: {
    padding: "24px",
  },

  despesaCard: {
    background: "var(--theme-surface-secondary)",
    border: "1px solid var(--theme-border)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  label: {
    fontWeight: "500",
    color: "var(--theme-text-secondary)",
    fontSize: 14,
  },

  value: {
    fontWeight: "500",
    color: "var(--theme-text)",
    textAlign: "right",
  },

  valueHighlight: {
    fontWeight: "600",
    color: ERROR,
    fontSize: 16,
  },

  warningMessage: {
    background: "rgba(245, 158, 11, 0.15)",
    border: "1px solid var(--warning)",
    borderRadius: 8,
    padding: "12px 16px",
  },

  modalFooter: {
    display: "flex",
    gap: 12,
    padding: "20px 24px",
    borderTop: "1px solid var(--theme-border)",
    background: "var(--theme-surface-secondary)",
  },

  cancelButton: {
    padding: "10px 20px",
    border: "1px solid var(--theme-border)",
    background: "var(--theme-surface)",
    color: "var(--theme-text)",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
    transition: "all 0.2s",
  },

  confirmDeleteButton: {
    flex: 1,
    padding: "10px 20px",
    border: "none",
    background: "var(--danger)",
    color: "#fff",
    borderRadius: 8,
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};