// EmendasTable.jsx - Design Moderno v3.0
// ✅ Redesign baseado no template Tailwind
// ✅ Tabela compacta com hover effects
// ✅ Status badges modernos com dots
// ✅ Progress bar no estilo template

import React, { useState, useMemo } from "react";

const EmendasTable = ({
  emendas,
  onEdit,
  onDelete,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange
}) => {
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedIds, setSelectedIds] = useState([]);

  // Calcular status da emenda
  const calcularStatus = (emenda) => {
    const percentual = emenda.percentualExecutado || 0;
    const temDespesas = emenda.totalDespesas > 0;
    const hoje = new Date();
    const dataFim = emenda.finalExecucao
      ? new Date(emenda.finalExecucao)
      : emenda.dataValidade
        ? new Date(emenda.dataValidade)
        : null;

    if (emenda.status && emenda.status.toLowerCase() === "inativa") {
      return { status: "Inativo", cor: "gray", bgClass: "bg-gray" };
    }

    if (percentual >= 100) {
      return { status: "Concluído", cor: "green", bgClass: "bg-green" };
    }

    if (dataFim && hoje > dataFim && percentual < 100) {
      return { status: "Vencido", cor: "red", bgClass: "bg-red" };
    }

    if (percentual > 0) {
      return { status: "Iniciado", cor: "blue", bgClass: "bg-blue" };
    }

    if (!temDespesas) {
      return { status: "Pendente", cor: "orange", bgClass: "bg-orange" };
    }

    return { status: "Ativo", cor: "green", bgClass: "bg-green" };
  };

  // Cores para status badges
  const statusColors = {
    blue: {
      bg: "rgba(37, 99, 235, 0.1)",
      text: "#2563EB",
      border: "rgba(37, 99, 235, 0.2)",
      dot: "#2563EB"
    },
    green: {
      bg: "rgba(16, 185, 129, 0.1)",
      text: "#059669",
      border: "rgba(16, 185, 129, 0.2)",
      dot: "#10B981"
    },
    red: {
      bg: "rgba(239, 68, 68, 0.1)",
      text: "#DC2626",
      border: "rgba(239, 68, 68, 0.2)",
      dot: "#EF4444"
    },
    orange: {
      bg: "rgba(245, 158, 11, 0.1)",
      text: "#D97706",
      border: "rgba(245, 158, 11, 0.2)",
      dot: "#F59E0B"
    },
    gray: {
      bg: "rgba(100, 116, 139, 0.1)",
      text: "#475569",
      border: "rgba(100, 116, 139, 0.2)",
      dot: "#64748B"
    }
  };

  // Cor da progress bar
  const getProgressColor = (percentual) => {
    if (percentual === 0) return "#CBD5E1";
    if (percentual < 50) return "#2563EB";
    if (percentual < 100) return "#10B981";
    return "#10B981";
  };

  // Ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Toggle seleção
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === emendas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(emendas.map(e => e.id));
    }
  };

  // Ordenar emendas
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
        case "valor":
          aValue = a.valorRecurso || a.valor || 0;
          bValue = b.valorRecurso || b.valor || 0;
          break;
        case "execucao":
          aValue = a.percentualExecutado || 0;
          bValue = b.percentualExecutado || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [emendas, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(emendasOrdenadas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const emendasPaginadas = emendasOrdenadas.slice(startIndex, startIndex + itemsPerPage);

  // Obter iniciais do parlamentar
  const getIniciais = (nome) => {
    if (!nome) return "??";
    const partes = nome.split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  if (!emendas || emendas.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}><span className="material-symbols-outlined" style={{ fontSize: 48 }}>description</span></div>
        <h3 style={styles.emptyTitle}>Nenhuma emenda encontrada</h3>
        <p style={styles.emptyText}>As emendas cadastradas aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div style={styles.tableContainer}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              {/* Checkbox */}
              <th style={{ ...styles.th, width: "40px", textAlign: "center" }}>
                <div style={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === emendas.length}
                    onChange={toggleSelectAll}
                    style={styles.checkboxInput}
                  />
                  <div style={{
                    ...styles.checkboxCustom,
                    ...(selectedIds.length === emendas.length ? styles.checkboxChecked : {})
                  }}>
                    {selectedIds.length === emendas.length && (
                      <svg style={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/>
                      </svg>
                    )}
                  </div>
                </div>
              </th>
              <th style={styles.th} onClick={() => handleSort("numero")}>Emenda</th>
              <th style={styles.th} onClick={() => handleSort("parlamentar")}>Parlamentar</th>
              <th style={styles.th}>Objeto</th>
              <th style={styles.th}>Município/UF</th>
              <th style={{ ...styles.th, textAlign: "right" }} onClick={() => handleSort("valor")}>Valor Total</th>
              <th style={{ ...styles.th, width: "112px", paddingLeft: "16px" }} onClick={() => handleSort("execucao")}>Execução</th>
              <th style={{ ...styles.th, width: "96px", textAlign: "center" }}>Status</th>
              <th style={{ ...styles.th, width: "80px", textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody style={styles.tbody}>
            {emendasPaginadas.map((emenda) => {
              const status = calcularStatus(emenda);
              const colors = statusColors[status.cor];
              const isSelected = selectedIds.includes(emenda.id);

              return (
                <tr
                  key={emenda.id}
                  style={{
                    ...styles.tr,
                    borderLeftColor: isSelected ? "var(--primary, #2563EB)" : "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--gray-50, #F8FAFC)";
                    e.currentTarget.style.borderLeftColor = "var(--primary, #2563EB)";
                    e.currentTarget.querySelector('.action-buttons').style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderLeftColor = isSelected ? "var(--primary, #2563EB)" : "transparent";
                    e.currentTarget.querySelector('.action-buttons').style.opacity = "0";
                  }}
                >
                  {/* Checkbox */}
                  <td style={{ ...styles.td, textAlign: "center", verticalAlign: "middle" }}>
                    <div style={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(emenda.id)}
                        style={styles.checkboxInput}
                      />
                      <div style={{
                        ...styles.checkboxCustom,
                        ...(isSelected ? styles.checkboxChecked : {})
                      }}>
                        {isSelected && (
                          <svg style={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Emenda */}
                  <td style={{ ...styles.td, verticalAlign: "middle" }}>
                    <div style={styles.emendaCell}>
                      <span style={styles.emendaNumero}>
                        {emenda.numero || emenda.numeroEmenda || "N/A"}
                      </span>
                      <span style={styles.emendaData}>
                        {emenda.criadoEm && new Date(emenda.criadoEm.seconds * 1000).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </td>

                  {/* Parlamentar */}
                  <td style={{ ...styles.td, verticalAlign: "middle" }}>
                    <div style={styles.parlamentarCell}>
                      <div style={styles.avatar}>
                        {getIniciais(emenda.parlamentar || emenda.autor)}
                      </div>
                      <span style={styles.parlamentarNome}>
                        {emenda.parlamentar || emenda.autor || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Objeto */}
                  <td style={{ ...styles.td, verticalAlign: "middle" }}>
                    <div style={styles.objetoCell}>
                      <span style={styles.objetoTipo}>
                        {emenda.tipo || emenda.tipoEmenda || "N/A"}
                      </span>
                      <span style={styles.objetoDescricao} title={emenda.objeto || emenda.programa}>
                        {emenda.objeto || emenda.programa || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Município/UF */}
                  <td style={{ ...styles.td, verticalAlign: "middle" }}>
                    <div style={styles.municipioCell}>
                      <span style={styles.municipioNome}>{emenda.municipio || "N/A"}</span>
                      <span style={styles.ufBadge}>{emenda.uf || ""}</span>
                    </div>
                  </td>

                  {/* Valor Total */}
                  <td style={{ ...styles.td, textAlign: "right", verticalAlign: "middle" }}>
                    <span style={styles.valorTexto}>
                      {(emenda.valorRecurso || emenda.valor || emenda.valorTotal || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </td>

                  {/* Execução */}
                  <td style={{ ...styles.td, paddingLeft: "16px", verticalAlign: "middle" }}>
                    <div style={styles.execucaoCell}>
                      <div style={styles.progressContainer}>
                        <div style={styles.progressBg}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${Math.min(emenda.percentualExecutado || 0, 100)}%`,
                              backgroundColor: getProgressColor(emenda.percentualExecutado || 0)
                            }}
                          />
                        </div>
                        <span style={styles.progressText}>
                          {(emenda.percentualExecutado || 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ ...styles.td, textAlign: "center", verticalAlign: "middle" }}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border
                    }}>
                      <span style={{ ...styles.statusDot, backgroundColor: colors.dot }} />
                      {status.status}
                    </span>
                  </td>

                  {/* Ações */}
                  <td style={{ ...styles.td, textAlign: "right", paddingRight: "12px", verticalAlign: "middle" }}>
                    <div className="action-buttons" style={styles.actionButtons}>
                      <button
                        onClick={() => onEdit(emenda)}
                        style={styles.actionBtn}
                        title="Editar"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#2563EB";
                          e.currentTarget.style.backgroundColor = "rgba(37, 99, 235, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#94A3B8";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(emenda.id)}
                        style={styles.actionBtn}
                        title="Excluir"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#EF4444";
                          e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#94A3B8";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                      </button>
                      <button
                        style={styles.actionBtn}
                        title="Mais opções"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#64748B";
                          e.currentTarget.style.backgroundColor = "var(--gray-100, #F1F5F9)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#94A3B8";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div style={styles.pagination}>
        <p style={styles.paginationText}>
          Mostrando <span style={styles.paginationBold}>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, emendasOrdenadas.length)}</span> de <span style={styles.paginationBold}>{emendasOrdenadas.length}</span>
        </p>
        <div style={styles.paginationButtons}>
          <button
            style={styles.paginationBtn}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_left</span>
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                style={{
                  ...styles.paginationBtn,
                  ...(currentPage === page ? styles.paginationBtnActive : {})
                }}
                onClick={() => onPageChange && onPageChange(page)}
              >
                {page}
              </button>
            );
          })}
          <button
            style={styles.paginationBtn}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  tableContainer: {
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.05))",
    border: "1px solid var(--theme-border, #E2E8F0)",
    overflow: "hidden",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    backgroundColor: "var(--theme-surface-secondary)",
  },
  th: {
    padding: "10px 12px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--theme-text-muted)",
    borderBottom: "1px solid var(--theme-border, #E2E8F0)",
    cursor: "pointer",
    userSelect: "none",
  },
  tbody: {
    backgroundColor: "var(--theme-surface, #ffffff)",
  },
  tr: {
    borderLeft: "2px solid transparent",
    borderBottom: "1px solid var(--theme-border-light, #F1F5F9)",
    transition: "all 0.15s ease",
  },
  td: {
    padding: "6px 12px",
    fontSize: "13px",
    height: "40px",
  },
  // Checkbox
  checkboxWrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    zIndex: 10,
  },
  checkboxCustom: {
    width: "14px",
    height: "14px",
    border: "2px solid var(--gray-300, #CBD5E1)",
    borderRadius: "4px",
    backgroundColor: "var(--theme-surface, #ffffff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },
  checkboxChecked: {
    backgroundColor: "var(--primary, #2563EB)",
    borderColor: "var(--primary, #2563EB)",
  },
  checkIcon: {
    width: "10px",
    height: "10px",
    color: "var(--white)",
  },
  // Emenda cell
  emendaCell: {
    display: "flex",
    flexDirection: "column",
  },
  emendaNumero: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--theme-text)",
  },
  emendaData: {
    fontSize: "10px",
    color: "var(--gray-400, #94A3B8)",
  },
  // Parlamentar
  parlamentarCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  avatar: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "var(--gray-100, #F1F5F9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: "700",
    color: "var(--theme-text)",
    flexShrink: 0,
  },
  parlamentarNome: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--theme-text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "140px",
  },
  // Objeto
  objetoCell: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "180px",
  },
  objetoTipo: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    color: "var(--info)",
    textTransform: "uppercase",
  },
  objetoDescricao: {
    fontSize: "11px",
    color: "var(--theme-text-muted)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  // Município
  municipioCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  municipioNome: {
    fontSize: "12px",
    color: "var(--theme-text)",
  },
  ufBadge: {
    fontSize: "9px",
    padding: "1px 4px",
    borderRadius: "4px",
    backgroundColor: "var(--gray-100, #F1F5F9)",
    color: "var(--theme-text-muted)",
    fontWeight: "500",
  },
  // Valor
  valorTexto: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--theme-text)",
    fontFamily: "monospace",
  },
  // Execução
  execucaoCell: {
    width: "100%",
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  progressBg: {
    flex: 1,
    height: "6px",
    backgroundColor: "var(--gray-100, #F1F5F9)",
    borderRadius: "9999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "9999px",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "10px",
    fontWeight: "500",
    color: "var(--theme-text-muted)",
    width: "24px",
    textAlign: "right",
  },
  // Status
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "500",
    border: "1px solid",
  },
  statusDot: {
    width: "4px",
    height: "4px",
    borderRadius: "50%",
  },
  // Actions
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "2px",
    opacity: 0,
    transition: "opacity 0.15s ease",
  },
  actionBtn: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--gray-400, #94A3B8)",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  // Pagination
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderTop: "1px solid var(--theme-border-light, #F1F5F9)",
    backgroundColor: "var(--theme-surface, #ffffff)",
  },
  paginationText: {
    fontSize: "12px",
    color: "var(--theme-text-muted)",
    margin: 0,
  },
  paginationBold: {
    fontWeight: "700",
    color: "var(--theme-text)",
  },
  paginationButtons: {
    display: "flex",
    gap: "4px",
  },
  paginationBtn: {
    padding: "4px 12px",
    borderRadius: "4px",
    border: "1px solid var(--theme-border, #E2E8F0)",
    backgroundColor: "transparent",
    color: "var(--theme-text)",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paginationBtnActive: {
    backgroundColor: "var(--primary)",
    borderColor: "var(--primary)",
    color: "var(--white)",
  },
  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    backgroundColor: "var(--theme-surface, #ffffff)",
    borderRadius: "12px",
    border: "1px solid var(--theme-border, #E2E8F0)",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--theme-text)",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: "var(--theme-text-muted)",
  },
};

export default EmendasTable;
