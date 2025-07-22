import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const EmendasTable = ({
  emendas,
  onEditar,
  onVisualizar,
  onDeletar,
  onFluxo,
  onLancamentos,
  loading = false,
}) => {
  const [sortField, setSortField] = useState("numero");
  const [sortDirection, setSortDirection] = useState("desc");
  const [emendasComLancamentos, setEmendasComLancamentos] = useState(new Set());

  useEffect(() => {
    const verificarLancamentos = async () => {
      if (!emendas || emendas.length === 0) return;

      try {
        const emendasComLanc = new Set();

        for (const emenda of emendas) {
          const lancamentosRef = collection(db, "lancamentos");
          const q = query(lancamentosRef, where("emendaId", "==", emenda.id));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            emendasComLanc.add(emenda.id);
          }
        }

        setEmendasComLancamentos(emendasComLanc);
      } catch (error) {
        console.error("Erro ao verificar lançamentos:", error);
      }
    };

    verificarLancamentos();
  }, [emendas]);

  // Função para ordenação
  const handleSort = (field) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  // Aplicar ordenação
  const sortedEmendas = [...emendas].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Tratamento especial para valores numéricos
    if (
      sortField === "valorTotal" ||
      sortField === "executado" ||
      sortField === "saldo"
    ) {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    // Tratamento especial para datas
    if (
      sortField === "createdAt" ||
      sortField === "updatedAt" ||
      sortField === "validade"
    ) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Comparação
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // ✅ CORRIGIDO: Calcular percentual de execução com múltiplos campos
  const calcularPercentualExecucao = (executado, valorTotal) => {
    // Aceitar tanto parâmetros diretos quanto objeto emenda
    let execValue = executado;
    let totalValue = valorTotal;

    if (typeof executado === "object" && executado !== null) {
      execValue =
        parseFloat(executado.valorExecutado) ||
        parseFloat(executado.executado) ||
        0;
      totalValue = parseFloat(executado.valorTotal) || 0;
    } else {
      execValue = parseFloat(executado) || 0;
      totalValue = parseFloat(valorTotal) || 0;
    }

    return totalValue > 0 ? ((execValue / totalValue) * 100).toFixed(1) : 0;
  };

  // Formatar moeda
  const formatarMoeda = (valor) => {
    const numero = parseFloat(valor) || 0;
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  // Formatar data
  const formatarData = (data) => {
    if (!data) return "-";
    try {
      const date = new Date(data);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  };

  // ✅ CORRIGIDO: Obter status da emenda com múltiplos campos
  const obterStatus = (emenda) => {
    // Buscar valor executado em múltiplos campos (compatibilidade)
    const executado =
      parseFloat(emenda.valorExecutado) || parseFloat(emenda.executado) || 0;

    const valorTotal = parseFloat(emenda.valorTotal) || 0;

    // DEBUG temporário - REMOVER após teste
    if (emenda.numero) {
      console.log("=== DEBUG STATUS EMENDA ===");
      console.log("Número:", emenda.numero);
      console.log("valorExecutado:", emenda.valorExecutado);
      console.log("executado:", emenda.executado);
      console.log("valorTotal:", emenda.valorTotal);
      console.log("Executado final:", executado);
      console.log(
        "Percentual:",
        valorTotal > 0 ? (executado / valorTotal) * 100 : 0,
      );
      console.log("==========================");
    }

    const percentual = valorTotal > 0 ? (executado / valorTotal) * 100 : 0;

    // Lógica melhorada de status
    if (valorTotal === 0) {
      return { label: "Pendente", color: "#6c757d", bg: "#f8f9fa" };
    }

    if (percentual === 0) {
      return { label: "Não Iniciado", color: "#6c757d", bg: "#f8f9fa" };
    }

    if (percentual >= 100) {
      return { label: "Concluído", color: "#28a745", bg: "#e8f5e8" };
    }

    return { label: "Em Andamento", color: "#0066cc", bg: "#e6f3ff" };
  };

  // Ícone de ordenação
  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "⬆️" : "⬇️";
  };

  return (
    <div style={styles.container}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th
                style={styles.th}
                onClick={() => handleSort("numero")}
                title="Clique para ordenar"
              >
                <span style={styles.thContent}>
                  📊 Número {getSortIcon("numero")}
                </span>
              </th>
              <th
                style={styles.th}
                onClick={() => handleSort("parlamentar")}
                title="Clique para ordenar"
              >
                <span style={styles.thContent}>
                  👤 Parlamentar {getSortIcon("parlamentar")}
                </span>
              </th>
              <th
                style={styles.th}
                onClick={() => handleSort("emenda")}
                title="Clique para ordenar"
              >
                <span style={styles.thContent}>
                  📋 Emenda {getSortIcon("emenda")}
                </span>
              </th>
              <th
                style={styles.th}
                onClick={() => handleSort("tipo")}
                title="Clique para ordenar"
              >
                <span style={styles.thContent}>
                  🏷️ Tipo {getSortIcon("tipo")}
                </span>
              </th>
              <th
                style={styles.th}
                onClick={() => handleSort("municipio")}
                title="Clique para ordenar"
              >
                <span style={styles.thContent}>
                  🏙️ Município/UF {getSortIcon("municipio")}
                </span>
              </th>
              <th
                style={styles.th}
                onClick={() => handleSort("valorTotal")}
                title="Clique para ordenar"
              >
                <span style={styles.thContent}>
                  💰 Valor Total {getSortIcon("valorTotal")}
                </span>
              </th>
              <th
                style={styles.th}
                onClick={() => handleSort("executado")}
                title="Clique para ordenar"
              >
                <span style={styles.thContent}>
                  📊 Execução {getSortIcon("executado")}
                </span>
              </th>
              <th style={styles.th}>
                <span style={styles.thContent}>📈 Status</span>
              </th>
              <th style={styles.th}>
                <span style={styles.thContent}>⚙️ Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEmendas.map((emenda, index) => {
              const status = obterStatus(emenda);
              const percentualExecucao = calcularPercentualExecucao(
                emenda.valorExecutado || emenda.executado,
                emenda.valorTotal,
              );

              return (
                <tr
                  key={emenda.id}
                  style={{
                    ...styles.tr,
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                  }}
                >
                  <td style={styles.td}>
                    <div style={styles.cellContent}>
                      <strong style={styles.numero}>{emenda.numero}</strong>
                      <small style={styles.dataCreated}>
                        {formatarData(emenda.createdAt)}
                      </small>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.cellContent}>
                      <strong style={styles.parlamentar}>
                        {emenda.parlamentar}
                      </strong>
                      <small style={styles.subtitle}>{emenda.tipo}</small>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.cellContent}>
                      <span style={styles.emendaNumero}>{emenda.emenda}</span>
                      <small style={styles.validade}>
                        Válida até: {formatarData(emenda.validade)}
                      </small>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.tipo}>{emenda.tipo}</span>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.cellContent}>
                      <span style={styles.municipio}>{emenda.municipio}</span>
                      <small style={styles.uf}>{emenda.uf}</small>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.cellContent}>
                      <strong style={styles.valor}>
                        {formatarMoeda(emenda.valorTotal)}
                      </strong>
                      {emenda.outrasComposicoes &&
                        parseFloat(emenda.outrasComposicoes) > 0 && (
                          <small style={styles.outrosValores}>
                            + {formatarMoeda(emenda.outrasComposicoes)}
                          </small>
                        )}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.cellContent}>
                      <div style={styles.progressContainer}>
                        <div
                          style={{
                            ...styles.progressBar,
                            width: `${percentualExecucao}%`,
                            backgroundColor: status.color,
                          }}
                        />
                      </div>
                      <small style={styles.percentual}>
                        {percentualExecucao}% (
                        {formatarMoeda(
                          emenda.valorExecutado || emenda.executado || 0,
                        )}
                        )
                      </small>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        color: status.color,
                        backgroundColor: status.bg,
                      }}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actionsContainer}>
                      <button
                        onClick={() => onVisualizar(emenda)}
                        style={{ ...styles.actionBtn, ...styles.viewBtn }}
                        title="Visualizar"
                      >
                        👁️
                      </button>

                      <button
                        onClick={() => onEditar(emenda)}
                        style={{ ...styles.actionBtn, ...styles.editBtn }}
                        title="Editar"
                      >
                        ✏️
                      </button>

                      {emendasComLancamentos.has(emenda.id) ? (
                        <button
                          onClick={() => onLancamentos(emenda)}
                          style={{
                            ...styles.actionBtn,
                            ...styles.lancamentosBtn,
                          }}
                          title="Ver Lançamentos"
                        >
                          💰
                        </button>
                      ) : (
                        <button
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: "#e9ecef",
                            color: "#6c757d",
                            cursor: "not-allowed",
                            opacity: 0.6,
                          }}
                          title="Esta emenda ainda não possui lançamentos"
                          disabled
                        >
                          💰
                        </button>
                      )}

                      <button
                        onClick={() => onDeletar(emenda)}
                        style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                        title="Deletar"
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

        {emendas.length === 0 && (
          <div style={styles.emptyMessage}>
            <span style={styles.emptyIcon}>📋</span>
            <p>Nenhuma emenda encontrada</p>
          </div>
        )}
      </div>

      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(20, 67, 96, 0.08)",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },
  th: {
    padding: "15px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "14px",
    color: "#2c3e50",
    cursor: "pointer",
    transition: "background-color 0.2s",
    userSelect: "none",
  },
  thContent: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tr: {
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#495057",
    verticalAlign: "top",
  },
  cellContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  numero: {
    color: "#154360",
    fontWeight: "600",
    fontSize: "15px",
  },
  dataCreated: {
    color: "#6c757d",
    fontSize: "12px",
  },
  parlamentar: {
    color: "#2c3e50",
    fontWeight: "600",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "12px",
  },
  emendaNumero: {
    color: "#495057",
    fontWeight: "500",
  },
  validade: {
    color: "#6c757d",
    fontSize: "12px",
  },
  tipo: {
    color: "#495057",
    fontWeight: "500",
  },
  municipio: {
    color: "#495057",
    fontWeight: "500",
  },
  uf: {
    color: "#6c757d",
    fontSize: "12px",
    fontWeight: "600",
  },
  valor: {
    color: "#28a745",
    fontWeight: "600",
    fontSize: "15px",
  },
  outrosValores: {
    color: "#17a2b8",
    fontSize: "12px",
  },
  progressContainer: {
    width: "100%",
    height: "6px",
    backgroundColor: "#e9ecef",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "4px",
  },
  progressBar: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  percentual: {
    color: "#6c757d",
    fontSize: "11px",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid currentColor",
  },
  actionsContainer: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  actionBtn: {
    padding: "6px 8px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "32px",
    height: "32px",
  },
  viewBtn: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
  },
  editBtn: {
    backgroundColor: "#fff3e0",
    color: "#f57c00",
  },
  fluxoBtn: {
    backgroundColor: "#f3e5f5",
    color: "#7b1fa2",
  },
  lancamentosBtn: {
    backgroundColor: "#e8f5e8",
    color: "#2e7d32",
  },
  deleteBtn: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "10px",
    display: "block",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e3e3e3",
    borderTop: "4px solid #4A90E2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default EmendasTable;
