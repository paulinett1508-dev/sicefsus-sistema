// src/components/emenda/EmendasTable.jsx
import React from "react";

const EmendasTable = ({
  emendasFiltradas,
  usuario,
  onAbrirEmenda,
  onEditarEmenda,
  onExcluirEmenda,
  onVerDespesas,
  onNovaEmenda,
}) => {
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
      return { text: "Vencida", color: "#dc3545", icon: "🚨" };
    } else if (saldo <= 0) {
      return { text: "Esgotada", color: "#ffc107", icon: "⚠️" };
    } else if (saldo < (emenda.valorTotal || emenda.valorRecurso || 0) * 0.1) {
      // Menos de 10%
      return { text: "Saldo Baixo", color: "#fd7e14", icon: "⚡" };
    } else {
      return { text: "Ativa", color: "#28a745", icon: "✅" };
    }
  };

  // Handler para abrir emenda
  const handleAbrirEmenda = (emenda) => {
    if (onAbrirEmenda && typeof onAbrirEmenda === "function") {
      onAbrirEmenda(emenda);
    } else {
      console.warn("Nenhum handler válido encontrado para abrir emenda");
    }
  };

  // Handler para ver despesas
  const handleVerDespesas = (emenda) => {
    if (onVerDespesas && typeof onVerDespesas === "function") {
      onVerDespesas(emenda);
    } else {
      console.log(`Ver despesas da emenda: ${emenda.numero}`);
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
            <strong style={{ ...styles.valorExecutado, color: "#007bff" }}>
              {formatCurrency(emenda.valorExecutado || 0)}
            </strong>
            <small style={styles.percentualExecutado}>
              {percentualExecutado.toFixed(1)}%
            </small>
          </div>
        </td>
        <td style={styles.td}>
          <strong
            style={{
              ...styles.saldo,
              color:
                (emenda.saldoDisponivel || emenda.saldo || 0) > 0
                  ? "#28a745"
                  : "#dc3545",
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
            {status.icon} {status.text}
          </span>
        </td>
        <td style={styles.td}>
          <div style={styles.actionsContainer}>
            <button
              onClick={() => handleAbrirEmenda(emenda)}
              style={styles.actionButton}
              title="Abrir emenda"
            >
              👁️
            </button>
            <button
              onClick={() => handleVerDespesas(emenda)}
              style={{
                ...styles.actionButton,
                ...styles.actionButtonDespesas,
              }}
              title="Ver despesas vinculadas"
            >
              💸
            </button>
            <button
              onClick={() => onEditarEmenda(emenda)}
              style={styles.actionButton}
              title="Editar emenda"
            >
              ✏️
            </button>
            {usuario?.role === "admin" && (
              <button
                onClick={() => onExcluirEmenda(emenda.id)}
                style={styles.actionButtonDanger}
                title="Excluir emenda"
              >
                🗑️
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div style={styles.tableContainer}>
      {emendasFiltradas.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📋</span>
          <h3 style={styles.emptyTitle}>Nenhuma emenda encontrada</h3>
          <p style={styles.emptyMessage}>
            Tente ajustar os filtros para encontrar o que procura.
          </p>
          {emendasFiltradas.length === 0 && onNovaEmenda && (
            <button onClick={onNovaEmenda} style={styles.emptyButton}>
              ➕ Nova Emenda
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
                <th style={styles.th}>Tipo</th>
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
        </div>
      )}
    </div>
  );
};

const styles = {
  tableContainer: {
    minHeight: "400px",
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
    backgroundColor: "#f8f9fa",
  },

  th: {
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#495057",
    borderBottom: "2px solid #e9ecef",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #e9ecef",
    transition: "background-color 0.2s ease",
  },

  td: {
    padding: "16px 12px",
    verticalAlign: "top",
  },

  numeroEmenda: {
    color: "#007bff",
    fontSize: "14px",
    fontWeight: "600",
  },

  parlamentarInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  parlamentarNome: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },

  emendaId: {
    fontSize: "13px",
    color: "#6c757d",
    fontFamily: "monospace",
    backgroundColor: "#f8f9fa",
    padding: "2px 6px",
    borderRadius: "4px",
  },

  tipo: {
    fontSize: "13px",
    color: "#495057",
    backgroundColor: "#e9ecef",
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
    color: "#6c757d",
    fontWeight: "600",
  },

  valor: {
    color: "#007bff",
    fontSize: "14px",
  },

  executadoInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  valorExecutado: {
    fontSize: "14px",
    fontWeight: "600",
  },

  percentualExecutado: {
    fontSize: "11px",
    color: "#6c757d",
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
    color: "#28a745",
  },

  despesasLabel: {
    fontSize: "11px",
    color: "#6c757d",
  },

  data: {
    fontSize: "13px",
    color: "#495057",
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

  actionButtonDespesas: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
    color: "white",
  },

  actionButtonDanger: {
    background: "none",
    border: "1px solid #dc3545",
    color: "#dc3545",
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
    color: "#2c3e50",
    margin: "0 0 8px 0",
  },

  emptyMessage: {
    fontSize: "14px",
    color: "#6c757d",
    maxWidth: "400px",
    lineHeight: 1.5,
    margin: "0 0 24px 0",
  },

  emptyButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};

export default EmendasTable;
