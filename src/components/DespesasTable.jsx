// DespesasTable.jsx - VERSÃO COMPLETA COM SALDO PROGRESSIVO
// ✅ Saldo calculado progressivamente por despesa
// ✅ Cada linha mostra o saldo APÓS aquela despesa
// ✅ Respeitando ordem cronológica e isolamento por emenda

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, deleteDoc, runTransaction } from "firebase/firestore";

// ✅ CORES PADRONIZADAS
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
  const [excludindo, setExcluindo] = useState(null);
  const [confirmExclusao, setConfirmExclusao] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState("resumido");

  // ✅ Função para formatar datas
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

  // ✅ Helper para buscar dados da emenda
  function getEmendaInfo(emendaId) {
    if (!emendas || !emendaId) return "-";
    const emenda = emendas.find((e) => e.id === emendaId);
    if (!emenda) return "Emenda não encontrada";

    const numero = emenda.numero || emenda.numeroEmenda || "-";
    const parlamentar = emenda.parlamentar || emenda.autor || "-";
    return `${numero} - ${parlamentar}`;
  }

  // ✅ FUNÇÃO PRINCIPAL: Calcular saldo PROGRESSIVO
  function getEmendaSaldoInfo(emendaId, despesaAtualId) {
    if (!emendas || !emendaId) return null;
    const emenda = emendas.find((e) => e.id === emendaId);
    if (!emenda) return null;

    const valorTotal = emenda.valor || 0;

    // Filtrar e ordenar despesas desta emenda
    const despesasDestaEmenda = despesas
      .filter(d => d.emendaId === emendaId)
      .sort((a, b) => {
        // Ordenar por data de pagamento
        if (a.dataPagamento && b.dataPagamento) {
          const dataA = a.dataPagamento.seconds
            ? new Date(a.dataPagamento.seconds * 1000)
            : new Date(a.dataPagamento);
          const dataB = b.dataPagamento.seconds
            ? new Date(b.dataPagamento.seconds * 1000)
            : new Date(b.dataPagamento);
          return dataA - dataB;
        }
        return 0;
      });

    // Encontrar índice da despesa atual
    const indexAtual = despesasDestaEmenda.findIndex(d => d.id === despesaAtualId);

    // Calcular total até esta despesa (inclusive)
    let totalDespesasAteAqui = 0;
    for (let i = 0; i <= indexAtual; i++) {
      totalDespesasAteAqui += despesasDestaEmenda[i].valor || 0;
    }

    // Saldo progressivo
    const saldoAtual = valorTotal - totalDespesasAteAqui;
    const valorExecutado = totalDespesasAteAqui;
    const percentualExecutado = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    return {
      valorTotal,
      saldoAtual,
      valorExecutado,
      percentualExecutado,
      totalDespesasAteAqui,
      despesaNumero: indexAtual + 1,
      totalDespesasEmenda: despesasDestaEmenda.length,
      emenda
    };
  }

  // ✅ Função para definir cor do saldo
  function getSaldoColor(percentualExecutado) {
    if (percentualExecutado >= 90) return ERROR;
    if (percentualExecutado >= 70) return WARNING;
    return SUCCESS;
  }

  // ✅ Função para definir indicador visual
  function getSaldoIndicator(percentualExecutado) {
    if (percentualExecutado >= 90) return "🔴";
    if (percentualExecutado >= 70) return "🟡";
    return "🟢";
  }

  // ✅ Função para excluir despesa
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
    if (onEdit) onEdit(despesa);
  }

  function handleVisualizar(despesa) {
    if (onView) onView(despesa);
  }

  function confirmarExclusao(despesa) {
    setConfirmExclusao(despesa);
  }

  return (
    <div style={styles.container}>
      <div style={styles.tableContainer}>
        {/* Toggle de visualização */}
        <div style={styles.viewToggleContainer}>
          <button
            onClick={() => setModoVisualizacao("resumido")}
            style={{
              ...styles.toggleButton,
              ...(modoVisualizacao === "resumido" ? styles.toggleButtonActive : {}),
            }}
          >
            📊 Resumido
          </button>
          <button
            onClick={() => setModoVisualizacao("detalhado")}
            style={{
              ...styles.toggleButton,
              ...(modoVisualizacao === "detalhado" ? styles.toggleButtonActive : {}),
            }}
          >
            📋 Detalhado
          </button>
        </div>

        {/* Tabela */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Emenda</th>
              <th style={styles.th}>Fornecedor</th>
              <th style={styles.th}>Valor Despesa</th>
              <th style={styles.th}>Saldo da Emenda</th>
              <th style={styles.th}>% Executado</th>
              {modoVisualizacao === "detalhado" && (
                <>
                  <th style={styles.th}>Nº Contrato</th>
                  <th style={styles.th}>Discriminação</th>
                  <th style={styles.th}>Data Empenho</th>
                  <th style={styles.th}>Data Liquidação</th>
                </>
              )}
              <th style={styles.th}>Nº Empenho</th>
              <th style={styles.th}>Nº NF</th>
              <th style={styles.th}>Data Pagamento</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((despesa, index) => {
              const saldoInfo = getEmendaSaldoInfo(despesa.emendaId, despesa.id);
              return (
                <tr
                  key={despesa.id}
                  style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                >
                  <td style={styles.td}>
                    <div style={styles.emendaCell}>
                      {getEmendaInfo(despesa.emendaId)}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.fornecedorCell}>
                      {despesa.fornecedor || "-"}
                    </div>
                  </td>
                  <td style={styles.tdValue}>
                    R$ {(despesa.valor || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{
                    ...styles.tdValue,
                    color: saldoInfo ? getSaldoColor(saldoInfo.percentualExecutado) : "#666"
                  }}>
                    {saldoInfo ? (
                      <>
                        {getSaldoIndicator(saldoInfo.percentualExecutado)}{" "}
                        R$ {saldoInfo.saldoAtual.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </>
                    ) : "-"}
                  </td>
                  <td style={styles.td}>
                    {saldoInfo ? (
                      <div style={{
                        ...styles.percentualCell,
                        backgroundColor: `${getSaldoColor(saldoInfo.percentualExecutado)}15`,
                        color: getSaldoColor(saldoInfo.percentualExecutado)
                      }}>
                        {saldoInfo.percentualExecutado.toFixed(1)}%
                      </div>
                    ) : "-"}
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
                      <td style={styles.td}>
                        <span style={styles.dataCell}>
                          {formatarDataFirestore(despesa.dataEmpenho)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.dataCell}>
                          {formatarDataFirestore(despesa.dataLiquidacao)}
                        </span>
                      </td>
                    </>
                  )}
                  <td style={styles.td}>
                    <span style={styles.numeroCell}>
                      {despesa.numeroEmpenho || "-"}
                    </span>
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
                        onClick={() => handleVisualizar(despesa)}
                        style={styles.viewButton}
                        title="Visualizar despesa"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditar(despesa)}
                        style={styles.editButton}
                        title="Editar despesa"
                        disabled={excludindo === despesa.id}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => confirmarExclusao(despesa)}
                        style={styles.deleteButton}
                        title="Excluir despesa"
                        disabled={excludindo === despesa.id}
                      >
                        {excludindo === despesa.id ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Estado Vazio */}
        {despesas.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💰</div>
            <h3 style={styles.emptyTitle}>Nenhuma despesa registrada</h3>
            <p style={styles.emptyText}>
              Clique em "Nova Despesa" para começar
            </p>
          </div>
        )}
      </div>

      {/* Resumo Final */}
      {despesas.length > 0 && (
        <div style={styles.summarySection}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total de Despesas:</span>
            <span style={styles.summaryValue}>{despesas.length}</span>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Emendas Vinculadas:</span>
            <span style={styles.summaryValue}>
              {new Set(despesas.map((d) => d.emendaId)).size}
            </span>
          </div>

          {/* Indicador de Saldos Críticos */}
          {(() => {
            const emendasCriticas = new Set();
            const emendasProcessadas = new Set();

            despesas.forEach(d => {
              if (!emendasProcessadas.has(d.emendaId)) {
                const todasDespesasEmenda = despesas.filter(desp => desp.emendaId === d.emendaId);
                const ultimaDespesa = todasDespesasEmenda[todasDespesasEmenda.length - 1];
                if (ultimaDespesa) {
                  const saldoFinal = getEmendaSaldoInfo(d.emendaId, ultimaDespesa.id);
                  if (saldoFinal && saldoFinal.percentualExecutado >= 90) {
                    emendasCriticas.add(d.emendaId);
                  }
                }
                emendasProcessadas.add(d.emendaId);
              }
            });

            if (emendasCriticas.size > 0) {
              return (
                <div style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>⚠️ Emendas Críticas:</span>
                  <span style={{ ...styles.summaryValue, color: ERROR }}>
                    {emendasCriticas.size}
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Modal de Confirmação - MELHORADO */}
      {confirmExclusao && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {/* Header simplificado */}
            <div style={styles.modalHeader}>
              <span style={styles.modalIcon}>⚠️</span>
              <h3 style={styles.modalTitle}>Excluir Despesa</h3>
            </div>

            {/* Corpo com informações organizadas */}
            <div style={styles.modalBody}>
              {/* Card com dados da despesa */}
              <div style={styles.despesaCard}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Fornecedor:</span>
                  <span style={styles.value}>{confirmExclusao.fornecedor}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Valor:</span>
                  <span style={styles.valueHighlight}>
                    R$ {(confirmExclusao.valor || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Nº Empenho:</span>
                  <span style={styles.value}>{confirmExclusao.numeroEmpenho || "-"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Descrição:</span>
                  <span style={styles.value}>{confirmExclusao.discriminacao || "-"}</span>
                </div>
              </div>

              {/* Resumo financeiro */}
              {(() => {
                const saldoInfo = getEmendaSaldoInfo(confirmExclusao.emendaId, confirmExclusao.id);
                if (saldoInfo) {
                  const novoSaldo = saldoInfo.saldoAtual + confirmExclusao.valor;
                  return (
                    <div style={styles.financialSummary}>
                      <div style={styles.summaryItem}>
                        <span>Saldo Atual:</span>
                        <span>R$ {saldoInfo.saldoAtual.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}</span>
                      </div>
                      <div style={styles.summaryItemAfter}>
                        <span>Saldo Após Exclusão:</span>
                        <span style={styles.successValue}>
                          R$ {novoSaldo.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Aviso simplificado */}
              <div style={styles.warningMessage}>
                <p>Esta ação não pode ser desfeita. O valor será devolvido ao saldo da emenda.</p>
              </div>
            </div>

            {/* Footer com botões */}
            <div style={styles.modalFooter}>
              <button
                onClick={() => setConfirmExclusao(null)}
                style={styles.cancelButton}
                disabled={excludindo}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExcluir(confirmExclusao)}
                style={styles.confirmDeleteButton}
                disabled={excludindo}
              >
                {excludindo ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Estilos
const styles = {
  container: {
    backgroundColor: WHITE,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden",
    margin: "0",
  },

  tableContainer: {
    overflowX: "auto",
  },

  viewToggleContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #dee2e6",
  },

  toggleButton: {
    padding: "8px 16px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#dee2e6",
    borderRadius: "4px",
    background: "white",
    color: "#6c757d",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  toggleButtonActive: {
    background: PRIMARY,
    color: "white",
    borderColor: PRIMARY,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
  },

  headerRow: {
    backgroundColor: PRIMARY,
  },

  th: {
    padding: "12px 8px",
    textAlign: "left",
    color: WHITE,
    fontWeight: "600",
    fontSize: 11,
    borderRight: "1px solid rgba(255,255,255,0.1)",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
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

  percentualCell: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
    minWidth: "50px",
    textAlign: "center",
  },

  discriminacaoCell: {
    maxWidth: 120,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 11,
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

  financialSummary: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
    background: "#f0f9ff",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    marginBottom: 20,
  },

  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },

  summaryItemAfter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    fontWeight: "600",
    paddingTop: 12,
    borderTop: "1px solid #bfdbfe",
  },

  successValue: {
    color: SUCCESS,
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