// src/components/DespesasTable.jsx
// ✅ OTIMIZADA: Foco em pagamentos por emenda
// ✅ AGRUPAMENTO: Pagamentos organizados por emenda
// ✅ CORRIGIDO: Badge agora mostra "Objeto da Emenda" em vez de "N/A"
// ✅ CORRIGIDO: Status diferenciado (Pago, Empenhado, etc.)

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, deleteDoc, runTransaction } from "firebase/firestore";

const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const WHITE = "#fff";
const ERROR = "#E74C3C";
const SUCCESS = "#27AE60";
const WARNING = "#F39C12";

export default function DespesasTable({
  despesas,
  emendas,
  loading,
  onEdit,
  onView,
  onDelete,
  totalDespesas = 0,
}) {
  const navigate = useNavigate();
  const [excluindo, setExcluindo] = useState(null);
  const [confirmExclusao, setConfirmExclusao] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState("resumido");
  const [modoAgrupamento, setModoAgrupamento] = useState("agrupado"); // 🆕

  // ✅ AGRUPAR DESPESAS POR EMENDA
  const despesasAgrupadas = useMemo(() => {
    const grupos = {};

    despesas.forEach((despesa) => {
      const emendaId = despesa.emendaId;
      if (!grupos[emendaId]) {
        const emenda = emendas.find((e) => e.id === emendaId);
        grupos[emendaId] = {
          emenda: emenda || { id: emendaId, numero: "N/A" },
          despesas: [],
          totalValor: 0,
        };
      }
      grupos[emendaId].despesas.push(despesa);
      grupos[emendaId].totalValor += despesa.valor || 0;
    });

    return Object.values(grupos);
  }, [despesas, emendas]);

  // ✅ Formatar datas
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

  // ✅ Buscar dados da emenda
  function getEmendaInfo(emendaId) {
    if (!emendas || !emendaId) return "-";
    const emenda = emendas.find((e) => e.id === emendaId);
    if (!emenda) return "Emenda não encontrada";

    const numero = emenda.numero || emenda.numeroEmenda || "-";
    const parlamentar = emenda.parlamentar || emenda.autor || "-";
    return `${numero} - ${parlamentar}`;
  }

  // ✅ CORREÇÃO: Obter objeto/custeio da emenda
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

  // ✅ CORREÇÃO: Status com cores diferenciadas
  function getStatusColor(status) {
    if (!status) return "#6c757d";

    const statusLimpo = status.toUpperCase().trim();

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

  // ✅ CORREÇÃO: Formatar status para exibição
  function formatarStatus(status) {
    if (!status) return "Pendente";

    // Se status for "EXECUTADA", mostrar "Pago"
    const statusLimpo = status.toUpperCase().trim();

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

        const saldoAtual = emendaDoc.data().saldo;
        const novoSaldo = saldoAtual + (despesa.valor || 0);

        transaction.update(emendaRef, { saldo: novoSaldo });

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
    console.log("🔧 DespesasTable.handleEditar CHAMADO:", {
      despesaId: despesa?.id,
      despesaDiscriminacao: despesa?.discriminacao,
      temOnEdit: !!onEdit,
      tipoOnEdit: typeof onEdit,
    });

    if (onEdit && typeof onEdit === "function") {
      console.log("✅ DespesasTable: Chamando onEdit");
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

  // ✅ RENDERIZAR LINHA DE DESPESA
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
      <td style={styles.td}>
        <div style={styles.fornecedorCell}>{despesa.fornecedor || "-"}</div>
      </td>
      <td style={styles.tdValue}>
        R${" "}
        {(despesa.valor || 0).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(despesa.status),
          }}
        >
          {formatarStatus(despesa.status)}
        </span>
      </td>
      {modoVisualizacao === "detalhado" && (
        <>
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
      <td style={styles.tdActions}>
        <div style={styles.actionsContainer}>
          <button
            onClick={() => {
              console.log("🖱️ BOTÃO EDITAR CLICADO (DespesasTable):", {
                id: despesa.id,
                discriminacao: despesa.discriminacao,
              });
              handleEditar(despesa);
            }}
            style={styles.editButton}
            title="Editar despesa"
            disabled={excluindo === despesa.id}
          >
            ✏️
          </button>
          <button
            onClick={() => confirmarExclusao(despesa)}
            style={styles.deleteButton}
            title="Excluir despesa"
            disabled={excluindo === despesa.id}
          >
            {excluindo === despesa.id ? "⏳" : "🗑️"}
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
          {/* 🆕 Toggle de Agrupamento */}
          <div style={styles.toggleGroup}>
            <button
              onClick={() => setModoAgrupamento("agrupado")}
              style={{
                ...styles.toggleButton,
                ...(modoAgrupamento === "agrupado"
                  ? styles.toggleButtonActive
                  : {}),
              }}
            >
              📁 Agrupado por Emenda
            </button>
            <button
              onClick={() => setModoAgrupamento("lista")}
              style={{
                ...styles.toggleButton,
                ...(modoAgrupamento === "lista"
                  ? styles.toggleButtonActive
                  : {}),
              }}
            >
              📄 Lista Completa
            </button>
          </div>

          {/* Toggle Resumido/Detalhado */}
          <div style={styles.toggleGroup}>
            <button
              onClick={() => setModoVisualizacao("resumido")}
              style={{
                ...styles.toggleButton,
                ...(modoVisualizacao === "resumido"
                  ? styles.toggleButtonActive
                  : {}),
              }}
            >
              📊 Resumido
            </button>
            <button
              onClick={() => setModoVisualizacao("detalhado")}
              style={{
                ...styles.toggleButton,
                ...(modoVisualizacao === "detalhado"
                  ? styles.toggleButtonActive
                  : {}),
              }}
            >
              📋 Detalhado
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
            <div style={styles.emptyIcon}>💰</div>
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
                {despesasAgrupadas.map((grupo, grupoIndex) => {
                  const emenda = grupo.emenda;
                  const despesasDoGrupo = grupo.despesas;

                  return (
                    <div key={emenda.id} style={styles.emendaGroup}>
                      {/* Header da Emenda */}
                      <div style={styles.emendaHeader}>
                        <div style={styles.emendaInfoHeader}>
                          <h3 style={styles.emendaNumero}>
                            Emenda {emenda.numero || "N/A"}
                          </h3>
                          <span style={styles.parlamentarText}>
                            {emenda.parlamentar ||
                              emenda.autor ||
                              "DR. BENJAMIM"}
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
                            R${" "}
                            {grupo.totalValor.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>

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
                    R${" "}
                    {(confirmExclusao.valor || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
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
                <p style={{ margin: 0, fontSize: 14 }}>
                  ⚠️ Esta ação não pode ser desfeita. O saldo da emenda será
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
    backgroundColor: WHITE,
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
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
    gap: 16,
    flexWrap: "wrap",
  },

  toggleGroup: {
    display: "flex",
    gap: 8,
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 4,
    border: "1px solid #e9ecef",
  },

  toggleButton: {
    padding: "8px 16px",
    border: "none",
    backgroundColor: "transparent",
    color: "#6c757d",
    fontSize: 13,
    fontWeight: "500",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },

  toggleButtonActive: {
    backgroundColor: PRIMARY,
    color: WHITE,
    fontWeight: "600",
  },

  loadingContainer: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#666",
  },

  loadingSpinner: {
    width: 40,
    height: 40,
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #154360",
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
    border: "1px solid #e9ecef",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: WHITE,
  },

  emendaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #e9ecef",
  },

  emendaInfoHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  emendaNumero: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
    margin: 0,
  },

  parlamentarText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },

  tipoBadgeHeader: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "4px",
    color: "white",
  },

  emendaStatsHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },

  statLabel: {
    fontSize: 12,
    color: "#6c757d",
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
    backgroundColor: "#2c3e50",
    color: "white",
  },

  th: {
    padding: "12px 8px",
    textAlign: "left",
    color: WHITE,
    fontWeight: "600",
    fontSize: 14,
    borderBottom: "2px solid #34495e",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    position: "sticky",
    top: 0,
    backgroundColor: "#2c3e50",
    zIndex: 10,
  },

  evenRow: {
    backgroundColor: "#f9f9f9",
  },

  oddRow: {
    backgroundColor: WHITE,
  },

  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 12,
    color: "#333",
    verticalAlign: "middle",
  },

  tdValue: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 12,
    color: SUCCESS,
    fontWeight: "600",
    textAlign: "right",
    fontFamily: "monospace",
  },

  tdActions: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 12,
    color: "#333",
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
    color: ACCENT,
  },

  fornecedorCell: {
    maxWidth: 150,
    fontWeight: "500",
    fontSize: 12,
    color: "#495057",
  },

  numeroCell: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "600",
    color: PRIMARY,
    backgroundColor: "#e3f2fd",
    padding: "2px 6px",
    borderRadius: "3px",
    display: "inline-block",
  },

  dataCell: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },

  discriminacaoCell: {
    maxWidth: 120,
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
    color: "white",
    display: "inline-block",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "white",
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
    color: ACCENT,
    transition: "all 0.2s",
  },

  editButton: {
    background: "none",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 3,
    color: WARNING,
    transition: "all 0.2s",
  },

  deleteButton: {
    background: "none",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 3,
    color: ERROR,
    transition: "all 0.2s",
  },

  summarySection: {
    display: "flex",
    justifyContent: "flex-start",
    padding: "16px 24px",
    borderTop: "2px solid #f0f0f0",
    backgroundColor: "#f8f9fa",
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
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY,
  },

  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    color: "#666",
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
    color: "#999",
  },

  emptyText: {
    fontSize: 14,
    margin: 0,
    color: "#666",
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
    backgroundColor: WHITE,
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
    borderBottom: "1px solid #e5e7eb",
  },

  modalIcon: {
    fontSize: 28,
  },

  modalTitle: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
  },

  modalBody: {
    padding: "24px",
  },

  despesaCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
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
    color: "#6b7280",
    fontSize: 14,
  },

  value: {
    fontWeight: "500",
    color: "#1f2937",
    textAlign: "right",
  },

  valueHighlight: {
    fontWeight: "600",
    color: ERROR,
    fontSize: 16,
  },

  warningMessage: {
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: 8,
    padding: "12px 16px",
  },

  modalFooter: {
    display: "flex",
    gap: 12,
    padding: "20px 24px",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
  },

  cancelButton: {
    padding: "10px 20px",
    border: "1px solid #d1d5db",
    background: WHITE,
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
    background: ERROR,
    color: WHITE,
    borderRadius: 8,
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};
