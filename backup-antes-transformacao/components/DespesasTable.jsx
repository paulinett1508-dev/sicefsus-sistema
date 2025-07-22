// src/components/LancamentosTable.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, deleteDoc, runTransaction } from "firebase/firestore";

const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const WHITE = "#fff";
const ERROR = "#E74C3C";
const SUCCESS = "#27AE60";

export default function LancamentosTable({
  lancamentos,
  emendas,
  loading,
  onEdit,
  onDelete,
  totalLancamentos = 0,
}) {
  const navigate = useNavigate();
  const [excludindo, setExcluindo] = useState(null);
  const [confirmExclusao, setConfirmExclusao] = useState(null);

  // Função para formatar datas do Firestore
  function formatarDataFirestore(data) {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (data.seconds) {
      const d = new Date(data.seconds * 1000);
      return d.toLocaleDateString("pt-BR");
    }
    if (data instanceof Date) {
      return data.toLocaleDateString("pt-BR");
    }
    return "";
  }

  // Helper para buscar dados da emenda
  function getEmendaInfo(id) {
    if (!emendas) return "Carregando...";
    const emenda = emendas.find((e) => e.id === id);
    return emenda
      ? `${emenda.numero} - ${emenda.parlamentar}`
      : "Emenda não encontrada";
  }

  // Função para abrir fluxo da emenda
  function handleAbrirFluxo(lancamento) {
    navigate(`/emendas/${lancamento.emendaId}/fluxo/${lancamento.id}`);
  }

  // Função para excluir lançamento
  async function handleExcluir(lancamento) {
    setExcluindo(lancamento.id);
    try {
      // Usar transação para garantir consistência
      await runTransaction(db, async (transaction) => {
        // Buscar emenda atual
        const emendaRef = doc(db, "emendas", lancamento.emendaId);
        const emendaDoc = await transaction.get(emendaRef);

        if (!emendaDoc.exists()) {
          throw new Error("Emenda não encontrada");
        }

        const saldoAtual = emendaDoc.data().saldo;
        const novoSaldo = saldoAtual + lancamento.valor;

        // Atualizar saldo da emenda (estornar valor)
        transaction.update(emendaRef, { saldo: novoSaldo });

        // Excluir lançamento
        const lancamentoRef = doc(db, "lancamentos", lancamento.id);
        transaction.delete(lancamentoRef);
      });

      setConfirmExclusao(null);
      if (onDelete) onDelete(lancamento.id);
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      alert("Erro ao excluir lançamento: " + error.message);
    } finally {
      setExcluindo(null);
    }
  }

  // Função para confirmar exclusão
  function confirmarExclusao(lancamento) {
    setConfirmExclusao(lancamento);
  }

  // Função para editar lançamento
  function handleEditar(lancamento) {
    if (onEdit) {
      onEdit(lancamento);
    }
  }

  // Calcular totais
  const valorTotal = lancamentos.reduce((acc, l) => acc + (l.valor || 0), 0);

  return (
    <div style={styles.container}>
      {/* Header da Tabela */}
      <div style={styles.tableHeader}>
        <h2 style={styles.title}>
          Lançamentos Financeiros ({lancamentos.length}
          {lancamentos.length !== totalLancamentos &&
            totalLancamentos > 0 &&
            ` de ${totalLancamentos}`}
          )
        </h2>
        <div style={styles.summary}>
          {lancamentos.length !== totalLancamentos && totalLancamentos > 0 && (
            <span style={styles.resultInfo}>
              📊 {lancamentos.length} resultado(s) filtrado(s)
            </span>
          )}
        </div>
      </div>

      {/* Container da Tabela */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Fluxo</th>
              <th style={styles.th}>Emenda</th>
              <th style={styles.th}>Valor</th>
              <th style={styles.th}>Descrição</th>
              <th style={styles.th}>Nº NF</th>
              <th style={styles.th}>Data NF</th>
              <th style={styles.th}>Fornecedor</th>
              <th style={styles.th}>Descrição NF</th>
              <th style={styles.th}>Data Lançamento</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((l, index) => (
              <tr
                key={l.id}
                style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
              >
                <td style={styles.tdActions}>
                  <button
                    onClick={() => handleAbrirFluxo(l)}
                    style={styles.fluxoButton}
                    title="Abrir fluxo da emenda"
                  >
                    📊 Abrir Fluxo
                  </button>
                </td>
                <td style={styles.td}>
                  <div style={styles.emendaInfo}>
                    {getEmendaInfo(l.emendaId)}
                  </div>
                </td>
                <td style={styles.tdValue}>
                  R${" "}
                  {l.valor?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td style={styles.td}>
                  <div style={styles.descricaoCell}>{l.descricao || "-"}</div>
                </td>
                <td style={styles.td}>
                  <span style={styles.nfNumero}>
                    {l.notaFiscalNumero || "-"}
                  </span>
                </td>
                <td style={styles.td}>
                  {formatarDataFirestore(l.notaFiscalData)}
                </td>
                <td style={styles.td}>
                  <div style={styles.fornecedorCell}>
                    {l.notaFiscalFornecedor || "-"}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.descricaoNfCell}>
                    {l.notaFiscalDescricao || "-"}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.dataLancamento}>
                    {formatarDataFirestore(l.data)}
                  </span>
                </td>
                <td style={styles.tdActions}>
                  <div style={styles.actionsContainer}>
                    <button
                      onClick={() => handleEditar(l)}
                      style={styles.editButton}
                      title="Editar lançamento"
                      disabled={excludindo === l.id}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => confirmarExclusao(l)}
                      style={styles.deleteButton}
                      title="Excluir lançamento"
                      disabled={excludindo === l.id}
                    >
                      {excludindo === l.id ? "⏳" : "🗑️"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Estado Vazio */}
        {lancamentos.length === 0 && (
          <div style={styles.emptyState}>
            {totalLancamentos > 0 ? (
              // Estado vazio por filtros
              <>
                <div style={styles.emptyIcon}>🔍</div>
                <h3 style={styles.emptyTitle}>Nenhum lançamento encontrado</h3>
                <p style={styles.emptyText}>
                  Tente ajustar os filtros ou limpar a pesquisa
                </p>
              </>
            ) : (
              // Estado vazio sem dados
              <>
                <div style={styles.emptyIcon}>💰</div>
                <h3 style={styles.emptyTitle}>Nenhum lançamento registrado</h3>
                <p style={styles.emptyText}>
                  Clique em "Novo Lançamento" para começar
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Resumo Financeiro */}
      {lancamentos.length > 0 && (
        <div style={styles.summarySection}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total de Lançamentos:</span>
            <span style={styles.summaryValue}>{lancamentos.length}</span>
            {lancamentos.length !== totalLancamentos &&
              totalLancamentos > 0 && (
                <span style={styles.summarySubtext}>
                  (de {totalLancamentos} total)
                </span>
              )}
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Valor Total:</span>
            <span style={styles.summaryValueMoney}>
              R${" "}
              {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmExclusao && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Confirmar Exclusão</h3>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>
                Tem certeza que deseja excluir este lançamento?
              </p>
              <div style={styles.modalDetails}>
                <p>
                  <strong>Valor:</strong> R${" "}
                  {confirmExclusao.valor?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p>
                  <strong>Descrição:</strong> {confirmExclusao.descricao}
                </p>
                <p>
                  <strong>Fornecedor:</strong>{" "}
                  {confirmExclusao.notaFiscalFornecedor}
                </p>
              </div>
              <div style={styles.modalWarning}>
                ⚠️ <strong>Atenção:</strong> O valor será estornado para o saldo
                da emenda.
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

const styles = {
  container: {
    backgroundColor: WHITE,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#f8f9fa",
  },

  title: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: "600",
    margin: 0,
  },

  summary: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },

  resultInfo: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: "600",
    backgroundColor: "#e3f2fd",
    padding: "4px 8px",
    borderRadius: 4,
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },

  headerRow: {
    backgroundColor: PRIMARY,
  },

  th: {
    padding: "12px 8px",
    textAlign: "left",
    color: WHITE,
    fontWeight: "600",
    fontSize: 12,
    borderRight: "1px solid rgba(255,255,255,0.1)",
    whiteSpace: "nowrap",
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
    fontSize: 13,
    color: "#333",
    verticalAlign: "top",
  },

  tdValue: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
    fontFamily: "monospace",
  },

  tdActions: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },

  emendaInfo: {
    maxWidth: 200,
    fontWeight: "500",
    fontSize: 12,
  },

  descricaoCell: {
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  nfNumero: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "500",
  },

  fornecedorCell: {
    maxWidth: 120,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: "500",
  },

  descricaoNfCell: {
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 12,
    color: "#666",
  },

  dataLancamento: {
    fontFamily: "monospace",
    fontSize: 12,
  },

  actionsContainer: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
  },

  fluxoButton: {
    background: ACCENT,
    color: WHITE,
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    padding: "6px 10px",
    borderRadius: 4,
    transition: "background-color 0.2s",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: 4,
    whiteSpace: "nowrap",
  },

  editButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 6,
    borderRadius: 4,
    color: ACCENT,
    transition: "background-color 0.2s",
  },

  deleteButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 6,
    borderRadius: 4,
    color: ERROR,
    transition: "background-color 0.2s",
  },

  summarySection: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderTop: "1px solid #f0f0f0",
    backgroundColor: "#f8f9fa",
    flexWrap: "wrap",
    gap: 16,
  },

  summaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  summaryLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY,
  },

  summaryValueMoney: {
    fontSize: 16,
    fontWeight: "600",
    color: SUCCESS,
    fontFamily: "monospace",
  },

  summarySubtext: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#666",
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#999",
  },

  emptyText: {
    fontSize: 14,
    margin: 0,
  },

  // Modal styles
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
  },

  modalWarning: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
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
