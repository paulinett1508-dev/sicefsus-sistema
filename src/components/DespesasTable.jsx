// DespesasTable.jsx - ATUALIZADA CONFORME PRINT OFICIAL
// ✅ Colunas sincronizadas com MÓDULO DESPESAS
// ✅ Exibição da Natureza das Despesas Programadas
// ✅ Campos do print organizados conforme layout oficial

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
  const [modoVisualizacao, setModoVisualizacao] = useState("resumido"); // "resumido" ou "detalhado"

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
  function getEmendaInfo(id) {
    if (!emendas) return "Carregando...";
    const emenda = emendas.find((e) => e.id === id);
    return emenda
      ? `${emenda.numero || emenda.numeroEmenda} - ${emenda.parlamentar}`
      : "Emenda não encontrada";
  }

  // ✅ Calcular total por natureza de despesa
  const calcularTotalPorNatureza = () => {
    return despesas.reduce((acc, despesa) => {
      const natureza = despesa.naturezaDespesaProgramada || "NÃO CLASSIFICADO";
      const valor = parseFloat(
        despesa.valorNaturezaDespesa || despesa.valor || 0,
      );

      if (!acc[natureza]) {
        acc[natureza] = { quantidade: 0, valor: 0 };
      }

      acc[natureza].quantidade += 1;
      acc[natureza].valor += valor;

      return acc;
    }, {});
  };

  const totaisPorNatureza = calcularTotalPorNatureza();

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

  // ✅ Handlers de ação
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
      {/* ✅ Header com Natureza das Despesas Programadas */}
      <div style={styles.headerSection}>
        <div style={styles.tableHeader}>
          <h2 style={styles.title}>
            💰 Módulo Despesas ({despesas.length}
            {despesas.length !== totalDespesas &&
              totalDespesas > 0 &&
              ` de ${totalDespesas}`}
            )
          </h2>
          <div style={styles.viewToggle}>
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

        {/* ✅ Natureza das Despesas Programadas - Conforme Print */}
        <div style={styles.naturezaSection}>
          <h3 style={styles.naturezaTitle}>
            NATUREZA DAS DESPESAS PROGRAMADAS:
          </h3>
          <div style={styles.naturezaGrid}>
            {Object.keys(totaisPorNatureza).map((natureza) => (
              <div key={natureza} style={styles.naturezaItem}>
                <div style={styles.naturezaLabel}>{natureza}</div>
                <div style={styles.naturezaValor}>
                  R${" "}
                  {totaisPorNatureza[natureza].valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div style={styles.naturezaQuantidade}>
                  {totaisPorNatureza[natureza].quantidade} despesa(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Tabela Principal */}
      <div style={styles.tableContainer}>
        {modoVisualizacao === "resumido" ? (
          // ✅ MODO RESUMIDO - Campos principais
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Fornecedor</th>
                <th style={styles.th}>Valor</th>
                <th style={styles.th}>Nº Empenho</th>
                <th style={styles.th}>Nº NF</th>
                <th style={styles.th}>Data Pagamento</th>
                <th style={styles.th}>Natureza</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((despesa, index) => (
                <tr
                  key={despesa.id}
                  style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                >
                  <td style={styles.td}>
                    <div style={styles.fornecedorCell}>
                      {despesa.fornecedor || "-"}
                    </div>
                  </td>
                  <td style={styles.tdValue}>
                    R${" "}
                    {(despesa.valor || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
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
                  <td style={styles.td}>
                    <span style={styles.naturezaBadge}>
                      {despesa.naturezaDespesaProgramada || "N/A"}
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
              ))}
            </tbody>
          </table>
        ) : (
          // ✅ MODO DETALHADO - Todos os campos conforme print
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Fornecedor</th>
                <th style={styles.th}>Valor</th>
                <th style={styles.th}>Nº Empenho</th>
                <th style={styles.th}>Nº Contrato</th>
                <th style={styles.th}>Nº NF</th>
                <th style={styles.th}>Discriminação</th>
                <th style={styles.th}>Data Empenho</th>
                <th style={styles.th}>Data Liquidação</th>
                <th style={styles.th}>Data Pagamento</th>
                <th style={styles.th}>Ação</th>
                <th style={styles.th}>Dotação</th>
                <th style={styles.th}>Class. Funcional</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((despesa, index) => (
                <tr
                  key={despesa.id}
                  style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                >
                  <td style={styles.td}>
                    <div style={styles.fornecedorCell}>
                      {despesa.fornecedor || "-"}
                    </div>
                  </td>
                  <td style={styles.tdValue}>
                    R${" "}
                    {(despesa.valor || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.numeroCell}>
                      {despesa.numeroEmpenho || "-"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.numeroCell}>
                      {despesa.numeroContrato || "-"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.numeroCell}>
                      {despesa.numeroNotaFiscal || despesa.numeroNota || "-"}
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
                  <td style={styles.td}>
                    <span style={styles.dataCell}>
                      {formatarDataFirestore(despesa.dataPagamento)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.acaoCell}>{despesa.acao || "-"}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.numeroCell}>
                      {despesa.dotacaoOrcamentaria || "-"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.classificacaoCell}>
                      {despesa.classificacaoFuncionalProgramatica ||
                        despesa.classificacaoFuncional ||
                        "-"}
                    </div>
                  </td>
                  <td style={styles.tdActions}>
                    <div style={styles.actionsContainer}>
                      <button
                        onClick={() => handleVisualizar(despesa)}
                        style={styles.viewButton}
                        title="Visualizar"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditar(despesa)}
                        style={styles.editButton}
                        title="Editar"
                        disabled={excludindo === despesa.id}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => confirmarExclusao(despesa)}
                        style={styles.deleteButton}
                        title="Excluir"
                        disabled={excludindo === despesa.id}
                      >
                        {excludindo === despesa.id ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ✅ Estado Vazio */}
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

      {/* ✅ Resumo Final */}
      {despesas.length > 0 && (
        <div style={styles.summarySection}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total de Despesas:</span>
            <span style={styles.summaryValue}>{despesas.length}</span>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Valor Total:</span>
            <span style={styles.summaryValueMoney}>
              R${" "}
              {despesas
                .reduce((sum, d) => sum + (d.valor || 0), 0)
                .toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
            </span>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Naturezas Diferentes:</span>
            <span style={styles.summaryValue}>
              {Object.keys(totaisPorNatureza).length}
            </span>
          </div>
        </div>
      )}

      {/* ✅ Modal de Confirmação */}
      {confirmExclusao && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>⚠️ Confirmar Exclusão</h3>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>
                Tem certeza que deseja excluir esta despesa?
              </p>
              <div style={styles.modalDetails}>
                <p>
                  <strong>Fornecedor:</strong> {confirmExclusao.fornecedor}
                </p>
                <p>
                  <strong>Valor:</strong> R${" "}
                  {(confirmExclusao.valor || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p>
                  <strong>Nº Empenho:</strong> {confirmExclusao.numeroEmpenho}
                </p>
                <p>
                  <strong>Discriminação:</strong>{" "}
                  {confirmExclusao.discriminacao}
                </p>
              </div>
              <div style={styles.modalWarning}>
                ⚠️ <strong>Atenção:</strong> O valor será estornado para o saldo
                da emenda. Esta ação não pode ser desfeita.
              </div>
            </div>
            <div style={styles.modalActions}>
              <button
                onClick={() => setConfirmExclusao(null)}
                style={styles.cancelButton}
                disabled={excludindo}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExcluir(confirmExclusao)}
                style={styles.confirmButton}
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

// ✅ Estilos Atualizados
const styles = {
  container: {
    backgroundColor: WHITE,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden",
    margin: "0 32px 24px 32px",
  },

  headerSection: {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e9ecef",
  },

  title: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: "600",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  viewToggle: {
    display: "flex",
    gap: "8px",
  },

  toggleButton: {
    padding: "8px 16px",
    border: "1px solid #dee2e6",
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

  naturezaSection: {
    padding: "20px 24px",
  },

  naturezaTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: PRIMARY,
    textTransform: "uppercase",
    marginBottom: "15px",
    letterSpacing: "0.5px",
  },

  naturezaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "15px",
  },

  naturezaItem: {
    background: "white",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  naturezaLabel: {
    fontWeight: "bold",
    color: PRIMARY,
    fontSize: "13px",
    flex: 1,
  },

  naturezaValor: {
    fontWeight: "bold",
    color: SUCCESS,
    fontSize: "16px",
    fontFamily: "monospace",
  },

  naturezaQuantidade: {
    fontSize: "11px",
    color: "#6c757d",
    textAlign: "right",
    minWidth: "80px",
  },

  tableContainer: {
    overflowX: "auto",
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

  naturezaBadge: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  discriminacaoCell: {
    maxWidth: 120,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 11,
  },

  acaoCell: {
    fontSize: 11,
    fontWeight: "500",
    color: ACCENT,
  },

  classificacaoCell: {
    maxWidth: 100,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 10,
    fontFamily: "monospace",
  },

  actionsContainer: {
    display: "flex",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  viewButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 3,
    color: ACCENT,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  editButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 3,
    color: WARNING,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 3,
    color: ERROR,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  summaryValueMoney: {
    fontSize: 18,
    fontWeight: "700",
    color: SUCCESS,
    fontFamily: "monospace",
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

  // ✅ Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },

  modalContent: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 0,
    maxWidth: 500,
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },

  modalTitle: {
    color: ERROR,
    margin: 0,
    fontSize: 20,
    fontWeight: "600",
    padding: "20px 24px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fdf2f2",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  modalBody: {
    padding: 24,
  },

  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },

  modalDetails: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    border: "1px solid #e9ecef",
  },

  modalWarning: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    border: "1px solid #ffeaa7",
  },

  modalActions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    padding: "16px 24px",
    borderTop: "1px solid #eee",
    backgroundColor: "#fafafa",
  },

  cancelButton: {
    padding: "10px 20px",
    border: "1px solid #ddd",
    borderRadius: 6,
    background: WHITE,
    color: "#666",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
    transition: "all 0.2s",
  },

  confirmButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: 6,
    background: ERROR,
    color: WHITE,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
};
