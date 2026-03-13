// src/components/emenda/EmendasTable.jsx
// ✅ CORRIGIDO: Removidos botões "Visualizar" (👁️) e "Gerenciar Despesas" (💸)
// Mantidos apenas: Editar (✏️) e Excluir (🗑️)

import React from "react";
import { parseValorMonetario } from "../../utils/formatters";

const EmendasTable = ({
  emendas,              // ✅ Corrigido
  totalEmendas,         // ✅ Novo
  loading,              // ✅ Novo
  onEdit,               // ✅ Corrigido
  onDelete,             // ✅ Corrigido
  userRole,             // ✅ Corrigido
  onNovaEmenda,
}) => {
  // Compatibilidade interna
  const emendasFiltradas = emendas;
  const usuario = { role: userRole };

  // Função para formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return "Não informado";

    try {
      let dataObj;

      // Se for timestamp do Firebase
      if (dateString.toDate) {
        dataObj = dateString.toDate();
      }
      // Se for string ISO
      else if (typeof dateString === "string") {
        dataObj = new Date(dateString);
      }
      // Se já for Date
      else if (dateString instanceof Date) {
        dataObj = dateString;
      } else {
        return "Data inválida";
      }

      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) {
        return "Data inválida";
      }

      return dataObj.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  // Função para determinar status da emenda
  const getEmendaStatus = (emenda) => {
    const validade = emenda.validade || emenda.dataValidada;
    const saldo = emenda.saldoDisponivel || emenda.saldo || 0;

    if (validade && new Date(validade) < new Date()) {
      return { text: "Vencida", color: "var(--danger-600)", icon: "error", iconColor: "var(--danger-600)" };
    } else if (saldo <= 0) {
      return { text: "Esgotada", color: "var(--warning-600)", icon: "warning", iconColor: "var(--warning-600)" };
    } else if (saldo < parseValorMonetario(emenda.valor || emenda.valorRecurso || 0) * 0.1) {
      // Menos de 10%
      return { text: "Saldo Baixo", color: "var(--warning-500)", icon: "bolt", iconColor: "var(--warning-500)" };
    } else {
      return { text: "Ativa", color: "var(--success-600)", icon: "check_circle", iconColor: "var(--success-600)" };
    }
  };

  // Função para renderizar linha da tabela
  const renderTableRow = (emenda) => {
    const status = getEmendaStatus(emenda);
    const percentualExecutado = emenda.percentualExecutado || 0;
    const totalDespesas = emenda.totalDespesas || 0;

    return (
      <tr key={emenda.id} style={styles.tableRow}>
        <td style={styles.td}>
          <strong style={styles.numeroEmenda}>{emenda.numero}</strong>
          {emenda.criadaEm && (
            <small style={styles.emendaData}>
              Criada:{" "}
              {new Date(
                emenda.criadaEm.seconds * 1000
              ).toLocaleDateString("pt-BR")}
            </small>
          )}
        </td>
        <td style={styles.td}>
          <div style={styles.parlamentarInfo}>
            <strong style={styles.parlamentarNome}>{emenda.parlamentar}</strong>
          </div>
        </td>
        <td style={styles.td}>
          <span style={styles.emendaId}>
            {emenda.numeroEmenda || emenda.numero || "Não informado"}
          </span>
        </td>
        <td style={styles.td}>
          <span style={styles.tipo}>{emenda.tipo}</span>
        </td>
        <td style={styles.td}>
          <div style={styles.localInfo}>
            <span>{emenda.municipio}</span>
            <small style={styles.uf}>{emenda.uf}</small>
          </div>
        </td>
        <td style={styles.td}>
          <strong style={styles.valor}>
            {formatCurrency(emenda.valorRecurso || emenda.valorTotal)}
          </strong>
        </td>
        <td style={styles.td}>
          <div style={styles.executadoInfo}>
            <strong style={{ ...styles.valorExecutado, color: "var(--primary-600)" }}>
              {formatCurrency(emenda.valorExecutado || 0)}
            </strong>
            {/* Barra de progresso visual */}
            <div style={styles.progressBarContainer}>
              <div
                style={{
                  ...styles.progressBarFill,
                  width: `${Math.min(percentualExecutado, 100)}%`,
                  backgroundColor: percentualExecutado >= 100
                    ? "var(--success-600)"
                    : percentualExecutado >= 75
                      ? "var(--warning-500)"
                      : "var(--primary-600)",
                }}
              />
            </div>
            <small style={styles.percentualExecutado}>
              {percentualExecutado.toFixed(1)}% executado
            </small>
          </div>
        </td>
        <td style={styles.td}>
          <strong
            style={{
              ...styles.saldo,
              color:
                (emenda.saldoDisponivel || emenda.saldo || 0) > 0
                  ? "var(--success-600)"
                  : "var(--danger-600)",
            }}
          >
            {formatCurrency(emenda.saldoDisponivel || emenda.saldo)}
          </strong>
        </td>
        <td style={styles.td}>
          <div style={styles.despesasInfo}>
            <span style={styles.despesasCount}>{totalDespesas}</span>
            <small style={styles.despesasLabel}>
              {totalDespesas === 1 ? "despesa" : "despesas"}
            </small>
          </div>
        </td>
        <td style={styles.td}>
          <span style={styles.data}>
            {formatDate(emenda.dataValidada || emenda.validade)}
          </span>
        </td>
        <td style={styles.td}>
          <span style={{ ...styles.status, backgroundColor: status.color }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12, marginRight: 4, verticalAlign: "middle" }}>{status.icon}</span>
            {status.text}
          </span>
        </td>
        <td style={styles.td}>
          <div style={styles.actionsContainer}>
            <button
              onClick={() => onEdit(emenda)}
              style={styles.actionButton}
              title="Editar emenda"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
            </button>
            {usuario?.role === "admin" && (
              <button
                onClick={() => onDelete(emenda.id)}
                style={styles.actionButtonDanger}
                title="Excluir emenda"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div style={styles.tableContainer}>
      {loading ? (
        <div style={styles.loadingState}>
          <p>Carregando emendas...</p>
        </div>
      ) : emendasFiltradas.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--theme-text-muted)" }}>assignment</span>
          </span>
          <h3 style={styles.emptyTitle}>Nenhuma emenda encontrada</h3>
          <p style={styles.emptyMessage}>
            Tente ajustar os filtros para encontrar o que procura.
          </p>
          {emendasFiltradas.length === 0 && onNovaEmenda && (
            <button onClick={onNovaEmenda} style={styles.emptyButton}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4, verticalAlign: "middle" }}>add</span>
              Nova Emenda
            </button>
          )}
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Número</th>
                <th style={styles.th}>Parlamentar</th>
                <th style={styles.th}>Emenda</th>
                <th style={styles.th}>Objeto</th>
                <th style={styles.th}>Município/UF</th>
                <th style={styles.th}>Valor Total</th>
                <th style={styles.th}>Executado</th>
                <th style={styles.th}>Saldo</th>
                <th style={styles.th}>Despesas</th>
                <th style={styles.th}>Válido até</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>{emendasFiltradas.map(renderTableRow)}</tbody>
          </table>
          <div style={styles.footer}>
            <p>Total de Emendas: {totalEmendas}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  tableContainer: {
    minHeight: "400px",
  },

  loadingState: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    fontSize: "18px",
    color: "var(--theme-text-secondary)",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  tableHeader: {
    backgroundColor: "var(--theme-surface-secondary)",
  },

  th: {
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "var(--theme-text-secondary)",
    borderBottom: "2px solid var(--theme-border)",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid var(--theme-border)",
    transition: "background-color 0.2s ease",
  },

  td: {
    padding: "16px 12px",
    verticalAlign: "top",
  },

  numeroEmenda: {
    color: "var(--primary-600)",
    fontSize: "14px",
    fontWeight: "600",
    display: "block",
    marginBottom: "4px",
  },

  emendaData: {
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
    fontWeight: "400",
    display: "block",
  },

  parlamentarInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  parlamentarNome: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },

  emendaId: {
    fontSize: "13px",
    color: "var(--theme-text-secondary)",
    fontFamily: "monospace",
    backgroundColor: "var(--theme-surface-secondary)",
    padding: "2px 6px",
    borderRadius: "4px",
  },

  tipo: {
    fontSize: "13px",
    color: "var(--theme-text-secondary)",
    backgroundColor: "var(--theme-border)",
    padding: "4px 8px",
    borderRadius: "4px",
  },

  localInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  uf: {
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
    fontWeight: "600",
  },

  valor: {
    color: "var(--primary-600)",
    fontSize: "14px",
  },

  executadoInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "100px",
  },

  valorExecutado: {
    fontSize: "14px",
    fontWeight: "600",
  },

  progressBarContainer: {
    width: "100%",
    height: "6px",
    backgroundColor: "var(--theme-border)",
    borderRadius: "3px",
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },

  percentualExecutado: {
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
  },

  saldo: {
    fontSize: "14px",
    fontWeight: "600",
  },

  despesasInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },

  despesasCount: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--success-600)",
  },

  despesasLabel: {
    fontSize: "11px",
    color: "var(--theme-text-secondary)",
  },

  data: {
    fontSize: "13px",
    color: "var(--theme-text-secondary)",
  },

  status: {
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    textAlign: "center",
    minWidth: "60px",
    display: "inline-block",
  },

  actionsContainer: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },

  actionButton: {
    background: "none",
    border: "1px solid #dee2e6",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    minWidth: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonDanger: {
    background: "none",
    border: "1px solid var(--danger-600)",
    color: "var(--danger-600)",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    minWidth: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--theme-text)",
    margin: "0 0 8px 0",
  },

  emptyMessage: {
    fontSize: "14px",
    color: "var(--theme-text-secondary)",
    maxWidth: "400px",
    lineHeight: 1.5,
    margin: "0 0 24px 0",
  },

  emptyButton: {
    backgroundColor: "var(--primary-600)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },

  footer: {
    padding: "16px 12px",
    textAlign: "right",
    borderTop: "1px solid var(--theme-border)",
    backgroundColor: "var(--theme-surface-secondary)",
    fontSize: "14px",
    color: "var(--theme-text-secondary)",
  },
};

export default EmendasTable;