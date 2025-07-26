// EmendasTable.jsx - Com integração para Despesas
// ✅ Cálculos baseados nos dados reais das emendas + Botão Despesas

import React, { useState, useMemo } from "react";

const EmendasTable = ({ emendas, onEdit, onView, onDelete, onDespesas }) => {
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // ✅ Função para calcular execução real
  const calcularExecucao = (emenda) => {
    const valorRecurso = emenda.valorRecurso || 0;
    const valorExecutado = emenda.valorExecutado || 0;

    if (valorRecurso === 0) {
      return { percentual: 0, texto: "0,0% (R$ 0,00)" };
    }

    const percentual = (valorExecutado / valorRecurso) * 100;
    const valorFormatado = valorExecutado.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return {
      percentual,
      texto: `${percentual.toFixed(1)}% (${valorFormatado})`,
    };
  };

  const renderIconeDespesas = (emenda) => {
    const temDespesas = emenda.totalDespesas > 0;

    return (
      <button
        onClick={() => onDespesas(emenda)}
        style={{
          ...styles.actionButton,
          backgroundColor: temDespesas ? "#4A90E2" : "#cccccc",
          cursor: temDespesas ? "pointer" : "not-allowed",
          opacity: temDespesas ? 1 : 0.5,
        }}
        disabled={!temDespesas}
        title={
          temDespesas
            ? `Ver ${emenda.totalDespesas} despesa(s)`
            : "Nenhuma despesa cadastrada"
        }
      >
        💰 {emenda.totalDespesas || 0}
      </button>
    );
  };

  // ✅ Função para calcular status real
  const calcularStatus = (emenda) => {
    const execucao = calcularExecucao(emenda);
    const percentual = execucao.percentual;

    // Verificar se há despesas associadas
    const temDespesas = emenda.totalDespesas > 0;

    // Verificar datas para determinar status mais preciso
    const hoje = new Date();
    const dataInicio = emenda.inicioExecucao
      ? new Date(emenda.inicioExecucao)
      : null;
    const dataFim = emenda.finalExecucao
      ? new Date(emenda.finalExecucao)
      : null;

    // Lógica de status baseada em execução e datas
    if (percentual === 0 && !temDespesas) {
      return {
        status: "Não Iniciado",
        cor: "#6c757d",
        icone: "⏸️",
      };
    }

    if (percentual > 0 && percentual < 25) {
      return {
        status: "Iniciado",
        cor: "#17a2b8",
        icone: "▶️",
      };
    }

    if (percentual >= 25 && percentual < 75) {
      return {
        status: "Em Andamento",
        cor: "#ffc107",
        icone: "⚙️",
      };
    }

    if (percentual >= 75 && percentual < 100) {
      return {
        status: "Quase Concluído",
        cor: "#fd7e14",
        icone: "🔄",
      };
    }

    if (percentual >= 100) {
      return {
        status: "Concluído",
        cor: "#28a745",
        icone: "✅",
      };
    }

    // Status baseado em datas se não há execução financeira
    if (dataFim && hoje > dataFim && percentual === 0) {
      return {
        status: "Vencido",
        cor: "#dc3545",
        icone: "⚠️",
      };
    }

    if (dataInicio && hoje >= dataInicio && percentual === 0) {
      return {
        status: "Pendente",
        cor: "#ffc107",
        icone: "⏳",
      };
    }

    return {
      status: "Indefinido",
      cor: "#6c757d",
      icone: "❓",
    };
  };

  // ✅ Função para obter cor da barra de progresso
  const getProgressColor = (percentual) => {
    if (percentual === 0) return "#e9ecef";
    if (percentual < 25) return "#17a2b8";
    if (percentual < 50) return "#ffc107";
    if (percentual < 75) return "#fd7e14";
    if (percentual < 100) return "#28a745";
    return "#dc3545"; // Excedido
  };

  // ✅ Processamento das emendas com cálculos reais
  const emendasProcessadas = useMemo(() => {
    return emendas.map((emenda) => {
      const execucao = calcularExecucao(emenda);
      const statusInfo = calcularStatus(emenda);

      return {
        ...emenda,
        execucaoCalculada: execucao,
        statusCalculado: statusInfo,
      };
    });
  }, [emendas]);

  // ✅ Função de ordenação
  const handleSort = (field) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  // ✅ Emendas ordenadas
  const emendasOrdenadas = useMemo(() => {
    if (!sortField) return emendasProcessadas;

    return [...emendasProcessadas].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Tratamento especial para campos calculados
      if (sortField === "execucao") {
        aValue = a.execucaoCalculada.percentual;
        bValue = b.execucaoCalculada.percentual;
      }

      if (sortField === "status") {
        aValue = a.statusCalculado.status;
        bValue = b.statusCalculado.status;
      }

      // Ordenação numérica
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Ordenação alfabética
      const aStr = String(aValue || "").toLowerCase();
      const bStr = String(bValue || "").toLowerCase();

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [emendasProcessadas, sortField, sortDirection]);

  // ✅ Função para formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  if (!emendas || emendas.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📄</div>
        <h3 style={styles.emptyTitle}>Nenhuma emenda encontrada</h3>
        <p style={styles.emptyDescription}>
          Adicione uma nova emenda para começar.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th} onClick={() => handleSort("numero")}>
                📋 Emenda{" "}
                {sortField === "numero" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={styles.th} onClick={() => handleSort("parlamentar")}>
                👤 Parlamentar{" "}
                {sortField === "parlamentar" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={styles.th} onClick={() => handleSort("tipo")}>
                🏷️ Tipo{" "}
                {sortField === "tipo" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={styles.th} onClick={() => handleSort("municipio")}>
                🏛️ Município/UF{" "}
                {sortField === "municipio" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={styles.th} onClick={() => handleSort("valorRecurso")}>
                💰 Valor Total{" "}
                {sortField === "valorRecurso" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={styles.th} onClick={() => handleSort("execucao")}>
                📊 Execução{" "}
                {sortField === "execucao" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={styles.th} onClick={() => handleSort("status")}>
                🏃 Status{" "}
                {sortField === "status" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={styles.thActions}>⚙️ Ações</th>
            </tr>
          </thead>
          <tbody>
            {emendasOrdenadas.map((emenda) => (
              <tr key={emenda.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.emendaInfo}>
                    <div style={styles.numeroEmenda}>
                      {emenda.numero || "S/N"}
                    </div>
                    <div style={styles.dataInfo}>
                      Criada:{" "}
                      {emenda.createdAt
                        ? new Date(emenda.createdAt).toLocaleDateString("pt-BR")
                        : "N/A"}
                    </div>
                  </div>
                </td>

                <td style={styles.td}>
                  <div style={styles.parlamentarInfo}>
                    <div style={styles.parlamentarNome}>
                      {emenda.parlamentar}
                    </div>
                    <div style={styles.numeroEmendaSecundario}>
                      Nº {emenda.numeroEmenda}
                    </div>
                  </div>
                </td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.tipoBadge,
                      backgroundColor:
                        emenda.tipo === "Individual"
                          ? "#007bff"
                          : emenda.tipo === "Bancada"
                            ? "#28a745"
                            : "#ffc107",
                    }}
                  >
                    {emenda.tipo}
                  </span>
                </td>

                <td style={styles.td}>
                  <div style={styles.localInfo}>
                    <div style={styles.municipio}>{emenda.municipio}</div>
                    <div style={styles.uf}>{emenda.uf}</div>
                  </div>
                </td>

                <td style={styles.td}>
                  <div style={styles.valorInfo}>
                    <div style={styles.valorPrincipal}>
                      {formatCurrency(emenda.valorRecurso)}
                    </div>
                    {emenda.saldo !== undefined && (
                      <div style={styles.saldoInfo}>
                        Saldo: {formatCurrency(emenda.saldo)}
                      </div>
                    )}
                  </div>
                </td>

                {/* ✅ EXECUÇÃO REAL CALCULADA */}
                <td style={styles.td}>
                  <div style={styles.execucaoContainer}>
                    <div style={styles.execucaoTexto}>
                      {emenda.execucaoCalculada.texto}
                    </div>
                    <div style={styles.progressBarContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${Math.min(emenda.execucaoCalculada.percentual, 100)}%`,
                          backgroundColor: getProgressColor(
                            emenda.execucaoCalculada.percentual,
                          ),
                        }}
                      />
                    </div>
                    {emenda.totalDespesas > 0 && (
                      <div style={styles.despesasInfo}>
                        {emenda.totalDespesas} despesa
                        {emenda.totalDespesas > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </td>

                {/* ✅ STATUS REAL CALCULADO */}
                <td style={styles.td}>
                  <div style={styles.statusContainer}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: emenda.statusCalculado.cor,
                      }}
                    >
                      {emenda.statusCalculado.icone}{" "}
                      {emenda.statusCalculado.status}
                    </span>
                    {emenda.finalExecucao && (
                      <div style={styles.prazoInfo}>
                        Prazo:{" "}
                        {new Date(emenda.finalExecucao).toLocaleDateString(
                          "pt-BR",
                        )}
                      </div>
                    )}
                  </div>
                </td>

                <td style={styles.td}>
                  <div style={styles.actionsContainer}>
                    <button
                      onClick={() => onView(emenda)}
                      style={styles.actionButton}
                      title="Visualizar"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => onEdit(emenda)}
                      style={styles.actionButton}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {onDespesas && (
                      <button
                        onClick={() => onDespesas(emenda)}
                        style={{
                          ...styles.actionButton,
                          ...styles.despesasButton,
                        }}
                        title="Gerenciar Despesas"
                      >
                        💰
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(emenda.id)}
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Informações de rodapé */}
      <div style={styles.footer}>
        <div style={styles.footerInfo}>
          Total de {emendas.length} emenda{emendas.length !== 1 ? "s" : ""}{" "}
          encontrada{emendas.length !== 1 ? "s" : ""}
        </div>
        <div style={styles.footerLegend}>
          <span style={styles.legendItem}>
            <span
              style={{ ...styles.legendColor, backgroundColor: "#28a745" }}
            ></span>
            Concluído
          </span>
          <span style={styles.legendItem}>
            <span
              style={{ ...styles.legendColor, backgroundColor: "#ffc107" }}
            ></span>
            Em Andamento
          </span>
          <span style={styles.legendItem}>
            <span
              style={{ ...styles.legendColor, backgroundColor: "#6c757d" }}
            ></span>
            Não Iniciado
          </span>
        </div>
      </div>
    </div>
  );
};

// ✅ Estilos expandidos para novos elementos
const styles = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden",
    margin: "20px 0",
  },

  tableContainer: {
    overflowX: "auto",
    maxHeight: "70vh",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  thead: {
    backgroundColor: "#154360",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  th: {
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    userSelect: "none",
    borderBottom: "2px solid #4A90E2",
  },

  thActions: {
    padding: "16px 12px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "13px",
    borderBottom: "2px solid #4A90E2",
  },

  tr: {
    borderBottom: "1px solid #e9ecef",
    transition: "background-color 0.3s ease",
  },

  td: {
    padding: "16px 12px",
    verticalAlign: "top",
    borderBottom: "1px solid #f1f3f4",
  },

  // ✅ Estilos para execução
  execucaoContainer: {
    minWidth: "150px",
  },

  execucaoTexto: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "6px",
  },

  progressBarContainer: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "4px",
  },

  progressBar: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },

  despesasInfo: {
    fontSize: "11px",
    color: "#6c757d",
    fontStyle: "italic",
  },

  // ✅ Estilos para status
  statusContainer: {
    minWidth: "120px",
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    textAlign: "center",
    minWidth: "100px",
    marginBottom: "4px",
  },

  prazoInfo: {
    fontSize: "11px",
    color: "#6c757d",
  },

  // Estilos existentes continuam...
  emendaInfo: {
    minWidth: "120px",
  },

  numeroEmenda: {
    fontWeight: "600",
    color: "#154360",
    fontSize: "14px",
  },

  dataInfo: {
    fontSize: "11px",
    color: "#6c757d",
    marginTop: "2px",
  },

  parlamentarInfo: {
    minWidth: "150px",
  },

  parlamentarNome: {
    fontWeight: "600",
    color: "#333",
    marginBottom: "2px",
  },

  numeroEmendaSecundario: {
    fontSize: "11px",
    color: "#6c757d",
  },

  tipoBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  localInfo: {
    minWidth: "120px",
  },

  municipio: {
    fontWeight: "500",
    color: "#333",
  },

  uf: {
    fontSize: "12px",
    color: "#6c757d",
    marginTop: "2px",
  },

  valorInfo: {
    textAlign: "right",
    minWidth: "120px",
  },

  valorPrincipal: {
    fontWeight: "600",
    color: "#154360",
    fontSize: "14px",
  },

  saldoInfo: {
    fontSize: "11px",
    color: "#6c757d",
    marginTop: "2px",
  },

  actionsContainer: {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  actionButton: {
    background: "none",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease",
    backgroundColor: "#f8f9fa",
    minWidth: "36px",
  },

  despesasButton: {
    borderColor: "#28a745",
    color: "#28a745",
    backgroundColor: "#f8fff8",
  },

  deleteButton: {
    borderColor: "#dc3545",
    color: "#dc3545",
    backgroundColor: "#fff8f8",
  },

  // ✅ Estilos para rodapé
  footer: {
    padding: "16px 20px",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #e9ecef",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },

  footerInfo: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500",
  },

  footerLegend: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#6c757d",
  },

  legendColor: {
    width: "12px",
    height: "12px",
    borderRadius: "2px",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#6c757d",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.7,
  },

  emptyTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "600",
  },

  emptyDescription: {
    margin: 0,
    fontSize: "14px",
  },
};

export default EmendasTable;
