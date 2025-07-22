// DespesasTable.jsx - PADRONIZADO COM EMENDASTABLE v1.0
// ✅ Mesmo padrão visual e estrutural da tabela de emendas

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, deleteDoc, runTransaction } from "firebase/firestore";

// ✅ CORES PADRONIZADAS (mesmo padrão do Emendas)
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

  // ✅ Função para formatar datas do Firestore (mesmo padrão)
  function formatarDataFirestore(data) {
    if (!data) return "";
    
    try {
      let date;
      
      // Se for timestamp do Firestore
      if (data.seconds) {
        date = new Date(data.seconds * 1000);
      }
      // Se for string ISO ou timestamp
      else if (typeof data === "string") {
        date = new Date(data);
      }
      // Se já for Date
      else if (data instanceof Date) {
        date = data;
      }
      // Se for timestamp numérico
      else if (typeof data === "number") {
        date = new Date(data);
      }
      else {
        return "";
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return "";
      }
      
      // Formatar para padrão brasileiro
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric"
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error, data);
      return "";
    }
  }

  // ✅ Helper para buscar dados da emenda
  function getEmendaInfo(id) {
    if (!emendas) return "Carregando...";
    const emenda = emendas.find((e) => e.id === id);
    return emenda
      ? `${emenda.numero} - ${emenda.parlamentar}`
      : "Emenda não encontrada";
  }

  // ✅ Função para abrir fluxo da emenda
  function handleAbrirFluxo(despesa) {
    navigate(`/emendas/${despesa.emendaId}/fluxo/${despesa.id}`);
  }

  // ✅ Função para excluir despesa
  async function handleExcluir(despesa) {
    setExcluindo(despesa.id);
    try {
      // Usar transação para garantir consistência
      await runTransaction(db, async (transaction) => {
        // Buscar emenda atual
        const emendaRef = doc(db, "emendas", despesa.emendaId);
        const emendaDoc = await transaction.get(emendaRef);

        if (!emendaDoc.exists()) {
          throw new Error("Emenda não encontrada");
        }

        const saldoAtual = emendaDoc.data().saldo;
        const novoSaldo = saldoAtual + despesa.valor;

        // Atualizar saldo da emenda (estornar valor)
        transaction.update(emendaRef, { saldo: novoSaldo });

        // Excluir despesa
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

  // ✅ Função para confirmar exclusão
  function confirmarExclusao(despesa) {
    setConfirmExclusao(despesa);
  }

  // ✅ Handlers de ação
  function handleEditar(despesa) {
    if (onEdit) onEdit(despesa);
  }

  function handleVisualizar(despesa) {
    if (onView) onView(despesa);
  }

  // ✅ Função para identificar emendas únicas
  function getEmendasUnicas() {
    return [...new Set(despesas.map(d => d.emendaId))];
  }

  return (
    <div style={styles.container}>
      {/* ✅ Header da Tabela (mesmo padrão do Emendas) */}
      <div style={styles.tableHeader}>
        <h2 style={styles.title}>
          💰 Despesas Registradas ({despesas.length}
          {despesas.length !== totalDespesas &&
            totalDespesas > 0 &&
            ` de ${totalDespesas}`}
          )
        </h2>
        <div style={styles.summary}>
          {despesas.length !== totalDespesas && totalDespesas > 0 && (
            <span style={styles.resultInfo}>
              📊 {despesas.length} resultado(s) filtrado(s)
            </span>
          )}
        </div>
      </div>

      {/* ✅ Container da Tabela */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Número</th>
              <th style={styles.th}>Emenda</th>
              <th style={styles.th}>Descrição</th>
              <th style={styles.th}>Valor</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Fornecedor</th>
              <th style={styles.th}>NF</th>
              <th style={styles.th}>Status</th>
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
                  <span style={styles.numeroCell}>
                    {despesa.numero || "Não definido"}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.emendaInfo}>
                    {getEmendaInfo(despesa.emendaId)}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.descricaoCell}>
                    {despesa.descricao || "-"}
                  </div>
                </td>
                <td style={styles.tdValue}>
                  R${" "}
                  {despesa.valor?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td style={styles.td}>
                  <span style={styles.dataCell}>
                    {formatarDataFirestore(despesa.data)}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.fornecedorCell}>
                    {despesa.notaFiscalFornecedor || "-"}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.nfNumero}>
                    {despesa.notaFiscalNumero || "-"}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={styles.statusBadge}>✅ Processado</span>
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
                      onClick={() => handleAbrirFluxo(despesa)}
                      style={styles.fluxoButton}
                      title="Abrir fluxo da emenda"
                    >
                      📊
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

        {/* ✅ Estado Vazio (mesmo padrão do Emendas) */}
        {despesas.length === 0 && (
          <div style={styles.emptyState}>
            {totalDespesas > 0 ? (
              <>
                <div style={styles.emptyIcon}>🔍</div>
                <h3 style={styles.emptyTitle}>Nenhuma despesa encontrada</h3>
                <p style={styles.emptyText}>
                  Tente ajustar os filtros ou limpar a pesquisa
                </p>
              </>
            ) : (
              <>
                <div style={styles.emptyIcon}>💰</div>
                <h3 style={styles.emptyTitle}>Nenhuma despesa registrada</h3>
                <p style={styles.emptyText}>
                  Clique em "Nova Despesa" para começar
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ✅ Resumo Simplificado */}
      {despesas.length > 0 && (
        <div style={styles.summarySection}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total de Despesas:</span>
            <span style={styles.summaryValue}>{despesas.length}</span>
            {despesas.length !== totalDespesas && totalDespesas > 0 && (
              <span style={styles.summarySubtext}>
                (de {totalDespesas} total)
              </span>
            )}
          </div>
          {getEmendasUnicas().length > 1 && (
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>Emendas Envolvidas:</span>
              <span style={styles.summaryValue}>{getEmendasUnicas().length}</span>
              <span style={styles.summarySubtext}>diferentes</span>
            </div>
          )}
        </div>
      )}

      {/* ✅ Modal de Confirmação de Exclusão (mesmo padrão) */}
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
                  <strong>Número:</strong>{" "}
                  {confirmExclusao.numero || "Não definido"}
                </p>
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

// ✅ Estilos padronizados (mesmo padrão do EmendasTable)
const styles = {
  container: {
    backgroundColor: WHITE,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden",
    margin: "0 32px 24px 32px",
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
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    padding: "14px 12px",
    textAlign: "left",
    color: WHITE,
    fontWeight: "600",
    fontSize: 13,
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
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    color: "#333",
    verticalAlign: "middle",
  },

  tdValue: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    color: SUCCESS,
    fontWeight: "600",
    textAlign: "right",
    fontFamily: "monospace",
  },

  tdActions: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    color: "#333",
    textAlign: "center",
    whiteSpace: "nowrap",
  },

  numeroCell: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY,
    backgroundColor: "#e3f2fd",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "inline-block",
  },

  emendaInfo: {
    maxWidth: 200,
    fontWeight: "500",
    fontSize: 12,
    color: ACCENT,
  },

  descricaoCell: {
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: "500",
  },

  dataCell: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  fornecedorCell: {
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: "500",
    color: "#495057",
  },

  nfNumero: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "500",
    color: "#6c757d",
  },

  statusBadge: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  actionsContainer: {
    display: "flex",
    gap: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  viewButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 6,
    borderRadius: 4,
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
    fontSize: 16,
    padding: 6,
    borderRadius: 4,
    color: WARNING,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  fluxoButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 6,
    borderRadius: 4,
    color: PRIMARY,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 6,
    borderRadius: 4,
    color: ERROR,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summarySection: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderTop: "2px solid #f0f0f0",
    backgroundColor: "#f8f9fa",
    flexWrap: "wrap",
    gap: 16,
  },

  summaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: "150px",
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

  summarySubtext: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
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

  // ✅ Modal styles (mesmo padrão do Emendas)
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
