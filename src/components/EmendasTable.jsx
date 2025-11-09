// EmendasTable.jsx - CORRIGIDO
// ✅ BUG CORRIGIDO: Removida soma incorreta de acoesServicos como despesas
// ✅ Cálculo baseado APENAS em dados reais: valorRecurso - saldoDisponivel
// ❌ REMOVIDO: Botões 👁️ (Visualizar) e 💰 (Ver Despesas) - Redundantes

import React, { useState, useMemo } from "react";

const EmendasTable = ({ emendas, onEdit, onDelete }) => {
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // ✅ REMOVIDO: Função calcularExecucao (valores já vêm calculados de Emendas.jsx)

  // ❌ REMOVIDO: Função renderIconeDespesas (botão 💰)
  // Motivo: Redundante com botão de Editar que já dá acesso às despesas

  // ✅ CORRIGIDO: Função para calcular status (usa percentualExecutado já calculado)
  const calcularStatus = (emenda) => {
    const percentual = emenda.percentualExecutado || 0;

    // ✅ Verificar se há despesas REAIS (não metas)
    const temDespesas = emenda.totalDespesas > 0;

    // Verificar datas para determinar status mais preciso
    const hoje = new Date();
    const dataInicio = emenda.inicioExecucao
      ? new Date(emenda.inicioExecucao)
      : null;
    const dataFim = emenda.finalExecucao
      ? new Date(emenda.finalExecucao)
      : emenda.dataValidade
        ? new Date(emenda.dataValidade)
        : null;

    // Verificar status do campo 'status' do Firebase
    if (emenda.status && emenda.status.toLowerCase() === "inativa") {
      return {
        status: "Inativa",
        cor: "#6c757d",
        icone: "⏸️",
      };
    }

    // ✅ LÓGICA CORRIGIDA: Considera apenas despesas reais
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
      status: "Ativa",
      cor: "#28a745",
      icone: "✅",
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

  // Função de ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const emendasOrdenadas = useMemo(() => {
    if (!sortField) return emendas;

    return [...emendas].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "numero":
          aValue = a.numero || a.numeroEmenda || "";
          bValue = b.numero || b.numeroEmenda || "";
          break;
        case "parlamentar":
          aValue = a.parlamentar || a.autor || "";
          bValue = b.parlamentar || b.autor || "";
          break;
        case "objeto":
          aValue = a.objeto || a.programa || "";
          bValue = b.objeto || b.programa || "";
          break;
        case "municipio":
          aValue = `${a.municipio || ""}/${a.uf || ""}`;
          bValue = `${b.municipio || ""}/${b.uf || ""}`;
          break;
        case "valor":
          aValue = a.valorRecurso || a.valor || 0;
          bValue = b.valorRecurso || b.valor || 0;
          break;
        case "execucao":
          aValue = a.percentualExecutado || 0;
          bValue = b.percentualExecutado || 0;
          break;
        case "status":
          aValue = calcularStatus(a).status;
          bValue = calcularStatus(b).status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [emendas, sortField, sortDirection]);

  if (!emendas || emendas.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyEmoji}>📭</div>
        <h3 style={styles.emptyTitle}>Nenhuma emenda encontrada</h3>
        <p style={styles.emptyText}>As emendas cadastradas aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th
              style={styles.th}
              onClick={() => handleSort("numero")}
              title="Ordenar por emenda"
            >
              <div style={styles.thContent}>
                EMENDA
                {sortField === "numero" && (
                  <span style={styles.sortIcon}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            </th>
            <th
              style={styles.th}
              onClick={() => handleSort("parlamentar")}
              title="Ordenar por parlamentar"
            >
              <div style={styles.thContent}>
                PARLAMENTAR
                {sortField === "parlamentar" && (
                  <span style={styles.sortIcon}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            </th>
            <th
              style={styles.th}
              onClick={() => handleSort("objeto")}
              title="Ordenar por objeto"
            >
              <div style={styles.thContent}>
                OBJETO
                {sortField === "objeto" && (
                  <span style={styles.sortIcon}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            </th>
            <th
              style={styles.th}
              onClick={() => handleSort("municipio")}
              title="Ordenar por município"
            >
              <div style={styles.thContent}>
                MUNICÍPIO/UF
                {sortField === "municipio" && (
                  <span style={styles.sortIcon}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            </th>
            <th
              style={styles.th}
              onClick={() => handleSort("valor")}
              title="Ordenar por valor"
            >
              <div style={styles.thContent}>
                VALOR TOTAL
                {sortField === "valor" && (
                  <span style={styles.sortIcon}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            </th>
            <th
              style={styles.th}
              onClick={() => handleSort("execucao")}
              title="Ordenar por execução"
            >
              <div style={styles.thContent}>
                EXECUÇÃO
                {sortField === "execucao" && (
                  <span style={styles.sortIcon}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            </th>
            <th
              style={styles.th}
              onClick={() => handleSort("status")}
              title="Ordenar por status"
            >
              <div style={styles.thContent}>
                STATUS
                {sortField === "status" && (
                  <span style={styles.sortIcon}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            </th>
            <th style={{ ...styles.th, textAlign: "center" }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {emendasOrdenadas.map((emenda, index) => {
            const status = calcularStatus(emenda);

            return (
              <tr
                key={emenda.id}
                style={index % 2 === 0 ? styles.trEven : styles.trOdd}
              >
                {/* EMENDA */}
                <td style={styles.td}>
                  <div style={styles.emendaCell}>
                    <strong style={styles.emendaNumero}>
                      {emenda.numero || emenda.numeroEmenda || "N/A"}
                    </strong>
                    <small style={styles.emendaData}>
                      {emenda.criadoEm && (
                        <>
                          Criada:{" "}
                          {new Date(
                            emenda.criadoEm.seconds * 1000,
                          ).toLocaleDateString("pt-BR")}
                        </>
                      )}
                    </small>
                  </div>
                </td>

                {/* PARLAMENTAR */}
                <td style={styles.td}>
                  <div style={styles.parlamentarCell}>
                    <strong style={styles.parlamentarNome}>
                      {emenda.parlamentar || emenda.autor || "N/A"}
                    </strong>
                    <div style={styles.tipoEmendaBadge}>
                      {emenda.tipo || emenda.tipoEmenda || "N/A"}
                    </div>
                  </div>
                </td>

                {/* OBJETO */}
                <td style={styles.td}>
                  <div style={styles.objetoCell}>
                    {emenda.objeto || emenda.programa || "N/A"}
                  </div>
                </td>

                {/* MUNICÍPIO */}
                <td style={styles.td}>
                  <div style={styles.municipioCell}>
                    <span style={styles.municipioNome}>
                      {emenda.municipio || "N/A"}
                    </span>
                    <span style={styles.ufBadge}>{emenda.uf || ""}</span>
                  </div>
                </td>

                {/* VALOR TOTAL */}
                <td style={styles.td}>
                  <div style={styles.valorCell}>
                    <strong style={styles.valorTexto}>
                      {(
                        emenda.valorRecurso ||
                        emenda.valor ||
                        emenda.valorTotal ||
                        0
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                    <small style={styles.saldoTexto}>
                      Saldo:{" "}
                      {(emenda.saldoDisponivel || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </small>
                  </div>
                </td>

                {/* EXECUÇÃO */}
                <td style={styles.td}>
                  <div style={styles.execucaoCell}>
                    <div style={styles.execucaoTexto}>
                      {(emenda.valorExecutado || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}{" "}
                      ({(emenda.percentualExecutado || 0).toFixed(1)}%)
                    </div>
                    <div style={styles.progressBarContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${Math.min(emenda.percentualExecutado || 0, 100)}%`,
                          backgroundColor: getProgressColor(
                            emenda.percentualExecutado || 0,
                          ),
                        }}
                      />
                    </div>
                    <small style={styles.despesasCount}>
                      {emenda.totalDespesas || 0} despesa(s)
                    </small>
                  </div>
                </td>

                {/* STATUS */}
                <td style={styles.td}>
                  <div
                    style={{
                      ...styles.statusBadge,
                      color: status.cor,
                    }}
                  >
                    <span style={styles.statusIcone}>{status.icone}</span>
                    <span style={styles.statusTexto}>{status.status}</span>
                  </div>
                </td>

                {/* AÇÕES */}
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <div style={styles.actionsCell}>
                    <button
                      onClick={() => onEdit(emenda)}
                      style={styles.actionButton}
                      title="Editar emenda"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(emenda.id)}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: "#dc3545",
                      }}
                      title="Excluir emenda"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  thead: {
    backgroundColor: "#2c3e50",
    color: "#ffffff",
  },
  th: {
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.2s",
  },
  thContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  sortIcon: {
    fontSize: "10px",
    opacity: 0.7,
  },
  td: {
    padding: "16px 12px",
    borderBottom: "1px solid #e9ecef",
  },
  trEven: {
    backgroundColor: "#ffffff",
  },
  trOdd: {
    backgroundColor: "#f8f9fa",
  },
  emendaCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  emendaNumero: {
    fontSize: "15px",
    color: "#2c3e50",
    fontWeight: "600",
  },
  emendaData: {
    fontSize: "11px",
    color: "#6c757d",
  },
  parlamentarCell: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  parlamentarNome: {
    fontSize: "14px",
    color: "#2c3e50",
    fontWeight: "500",
  },
  tipoEmendaBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    textTransform: "uppercase",
    width: "fit-content",
  },
  objetoCell: {
    fontSize: "13px",
    color: "#495057",
    lineHeight: "1.4",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  municipioCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  municipioNome: {
    fontSize: "13px",
    color: "#2c3e50",
    fontWeight: "500",
  },
  ufBadge: {
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
    backgroundColor: "#ffc107",
    color: "#ffffff",
  },
  valorCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  valorTexto: {
    fontSize: "15px",
    color: "#28a745",
    fontWeight: "600",
  },
  saldoTexto: {
    fontSize: "11px",
    color: "#6c757d",
  },
  execucaoCell: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "150px",
  },
  execucaoTexto: {
    fontSize: "13px",
    color: "#2c3e50",
    fontWeight: "500",
  },
  progressBarContainer: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    transition: "width 0.3s ease, background-color 0.3s ease",
    borderRadius: "4px",
  },
  despesasCount: {
    fontSize: "11px",
    color: "#6c757d",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "600",
    fontSize: "13px",
  },
  statusIcone: {
    fontSize: "16px",
  },
  statusTexto: {
    fontSize: "13px",
  },
  actionsCell: {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  actionButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#6c757d",
    color: "#ffffff",
    fontWeight: "500",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  },
  emptyEmoji: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "20px",
    color: "#2c3e50",
    marginBottom: "8px",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: "14px",
    color: "#6c757d",
  },
};

export default EmendasTable;
