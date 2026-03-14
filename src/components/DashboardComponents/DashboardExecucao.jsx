// src/components/DashboardComponents/DashboardExecucao.jsx
// Execução por Tipo de Emenda - com detalhes por emenda e saldo por natureza

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { parseValorMonetario } from "../../utils/formatters";

const DashboardExecucao = ({ emendas = [] }) => {
  const [naturezasPorEmenda, setNaturezasPorEmenda] = useState({});
  const [expandido, setExpandido] = useState({});
  const [tiposExpandidos, setTiposExpandidos] = useState({});
  const [tiposMostrarTodos, setTiposMostrarTodos] = useState({});
  const [carregandoNaturezas, setCarregandoNaturezas] = useState(false);
  const LIMITE_EMENDAS = 5;

  // Carregar naturezas de todas as emendas
  useEffect(() => {
    const carregarNaturezas = async () => {
      if (!emendas.length) return;
      setCarregandoNaturezas(true);
      try {
        const emendasIds = emendas.map((e) => e.id);
        const naturezasMap = {};
        const batchSize = 10;

        for (let i = 0; i < emendasIds.length; i += batchSize) {
          const batch = emendasIds.slice(i, i + batchSize);
          const q = query(
            collection(db, "naturezas"),
            where("emendaId", "in", batch)
          );
          const snapshot = await getDocs(q);
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const emendaId = data.emendaId;
            if (!naturezasMap[emendaId]) naturezasMap[emendaId] = [];
            naturezasMap[emendaId].push({ id: doc.id, ...data });
          });
        }

        setNaturezasPorEmenda(naturezasMap);
      } catch (err) {
        console.error("Erro ao carregar naturezas:", err);
      } finally {
        setCarregandoNaturezas(false);
      }
    };

    carregarNaturezas();
  }, [emendas]);

  // Agrupar emendas por tipo
  const emendasPorTipo = {};
  emendas.forEach((emenda) => {
    const tipo = emenda.tipo || emenda.tipoEmenda || "Não informado";
    if (!emendasPorTipo[tipo]) emendasPorTipo[tipo] = [];
    emendasPorTipo[tipo].push(emenda);
  });

  const formatCurrency = (value) => {
    return (parseValorMonetario(value) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      if (date.toDate) date = date.toDate();
      const d = new Date(date);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("pt-BR");
    } catch {
      return "—";
    }
  };

  const getBarColor = (percentual) => {
    if (percentual >= 80) return "#10B981";
    if (percentual >= 50) return "#F59E0B";
    if (percentual >= 20) return "#E67E22";
    return "#EF4444";
  };

  const toggleExpandir = (emendaId) => {
    setExpandido((prev) => ({ ...prev, [emendaId]: !prev[emendaId] }));
  };

  if (emendas.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>payments</span>
            Execução por Tipo de Emenda
          </h3>
        </div>
        <div style={styles.emptyState}>
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>payments</span>
          Execução por Tipo de Emenda
        </h3>
        <span style={styles.subtitle}>Detalhamento por emenda</span>
      </div>

      <div style={styles.tiposContainer}>
        {Object.entries(emendasPorTipo).map(([tipo, emendasDoTipo]) => {
          const totalTipo = emendasDoTipo.reduce(
            (sum, e) => sum + parseValorMonetario(e.valor || e.valorRecurso || 0),
            0
          );
          const executadoTipo = emendasDoTipo.reduce(
            (sum, e) => sum + parseValorMonetario(e.valorExecutado || 0),
            0
          );
          const percTipo = totalTipo > 0 ? (executadoTipo / totalTipo) * 100 : 0;

          const isTipoAberto = tiposExpandidos[tipo] !== false; // aberto por padrao
          const mostrarTodos = tiposMostrarTodos[tipo] || false;
          const emendasVisiveis = mostrarTodos ? emendasDoTipo : emendasDoTipo.slice(0, LIMITE_EMENDAS);
          const temMais = emendasDoTipo.length > LIMITE_EMENDAS;

          return (
            <div key={tipo} style={styles.tipoSection}>
              {/* Header do Tipo - clicavel para collapse */}
              <div
                style={styles.tipoHeader}
                onClick={() => setTiposExpandidos((prev) => ({ ...prev, [tipo]: !isTipoAberto }))}
              >
                <div style={styles.tipoInfo}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      color: "var(--theme-text-secondary)",
                      transition: "transform 0.2s",
                      transform: isTipoAberto ? "rotate(90deg)" : "rotate(0)",
                    }}
                  >
                    chevron_right
                  </span>
                  <span style={styles.tipoLabel}>{tipo}</span>
                  <span style={styles.tipoCount}>
                    {emendasDoTipo.length} emenda{emendasDoTipo.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div style={styles.tipoMeta}>
                  <span style={{ ...styles.tipoPerc, color: getBarColor(percTipo) }}>
                    {percTipo.toFixed(0)}%
                  </span>
                  <span style={styles.tipoValor}>
                    {formatCurrency(executadoTipo)} de {formatCurrency(totalTipo)}
                  </span>
                </div>
              </div>

              {/* Barra de progresso do tipo (sempre visivel) */}
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${Math.min(percTipo, 100)}%`,
                    backgroundColor: getBarColor(percTipo),
                  }}
                />
              </div>

              {/* Lista de Emendas - colapsavel */}
              {isTipoAberto && (
              <div style={styles.emendasLista}>
                {emendasVisiveis.map((emenda) => {
                  const valor = parseValorMonetario(emenda.valor || emenda.valorRecurso || 0);
                  const executado = parseValorMonetario(emenda.valorExecutado || 0);
                  const perc = valor > 0 ? (executado / valor) * 100 : 0;
                  const isExpanded = expandido[emenda.id];
                  const naturezas = naturezasPorEmenda[emenda.id] || [];

                  return (
                    <div key={emenda.id} style={styles.emendaCard}>
                      {/* Resumo da emenda - clicavel */}
                      <div
                        style={styles.emendaResumo}
                        onClick={() => toggleExpandir(emenda.id)}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 18,
                            color: "var(--theme-text-secondary)",
                            transition: "transform 0.2s",
                            transform: isExpanded ? "rotate(90deg)" : "rotate(0)",
                            flexShrink: 0,
                          }}
                        >
                          chevron_right
                        </span>

                        <div style={styles.emendaResumoInfo}>
                          <span style={styles.emendaNumero}>
                            {emenda.numero || "S/N"}
                          </span>
                          <span style={styles.emendaParlamentar}>
                            {emenda.autor || emenda.parlamentar || "—"}
                          </span>
                        </div>

                        <div style={styles.emendaResumoValor}>
                          <span style={{ ...styles.emendaPerc, color: getBarColor(perc) }}>
                            {perc.toFixed(0)}%
                          </span>
                          <span style={styles.emendaValorTexto}>
                            {formatCurrency(valor)}
                          </span>
                        </div>
                      </div>

                      {/* Mini barra de progresso */}
                      <div style={{ ...styles.barTrack, height: 4, margin: "0 12px" }}>
                        <div
                          style={{
                            ...styles.barFill,
                            height: 4,
                            width: `${Math.min(perc, 100)}%`,
                            backgroundColor: getBarColor(perc),
                          }}
                        />
                      </div>

                      {/* Detalhes expandidos */}
                      {isExpanded && (
                        <div style={styles.emendaDetalhes}>
                          {/* Grid de informacoes */}
                          <div style={styles.detalhesGrid}>
                            <div style={styles.detalheItem}>
                              <span style={styles.detalheLabel}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>payments</span>
                                Valor Recebido
                              </span>
                              <span style={styles.detalheValor}>{formatCurrency(valor)}</span>
                            </div>
                            <div style={styles.detalheItem}>
                              <span style={styles.detalheLabel}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>person</span>
                                Parlamentar
                              </span>
                              <span style={styles.detalheValor}>
                                {emenda.autor || emenda.parlamentar || "—"}
                              </span>
                            </div>
                            <div style={styles.detalheItem}>
                              <span style={styles.detalheLabel}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>account_balance</span>
                                N° da Conta
                              </span>
                              <span style={{ ...styles.detalheValor, fontFamily: "monospace" }}>
                                {emenda.conta || "—"}
                              </span>
                            </div>
                            <div style={styles.detalheItem}>
                              <span style={styles.detalheLabel}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>calendar_today</span>
                                Data da OB
                              </span>
                              <span style={styles.detalheValor}>
                                {formatDate(emenda.dataOb || emenda.dataOB)}
                              </span>
                            </div>
                            <div style={styles.detalheItem}>
                              <span style={styles.detalheLabel}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>check_circle</span>
                                Valor Executado
                              </span>
                              <span style={{ ...styles.detalheValor, color: "#10B981", fontWeight: 700 }}>
                                {formatCurrency(executado)}
                              </span>
                            </div>
                            <div style={styles.detalheItem}>
                              <span style={styles.detalheLabel}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>savings</span>
                                Saldo Disponível
                              </span>
                              <span style={{
                                ...styles.detalheValor,
                                color: (valor - executado) > 0 ? "var(--action)" : "#EF4444",
                                fontWeight: 700,
                              }}>
                                {formatCurrency(valor - executado)}
                              </span>
                            </div>
                          </div>

                          {/* Saldo por Natureza de Despesa */}
                          <div style={styles.naturezasSection}>
                            <h4 style={styles.naturezasTitulo}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>
                                account_tree
                              </span>
                              Saldo por Natureza de Despesa
                            </h4>

                            {carregandoNaturezas ? (
                              <span style={styles.naturezasLoading}>Carregando...</span>
                            ) : naturezas.length === 0 ? (
                              <span style={styles.naturezasVazio}>Nenhuma natureza alocada</span>
                            ) : (
                              <div style={styles.naturezasLista}>
                                {naturezas.map((nat) => {
                                  const alocado = parseValorMonetario(nat.valorAlocado || 0);
                                  const execNat = parseValorMonetario(nat.valorExecutado || 0);
                                  const saldo = alocado - execNat;
                                  const percNat = alocado > 0 ? (execNat / alocado) * 100 : 0;

                                  return (
                                    <div key={nat.id} style={styles.naturezaItem}>
                                      <div style={styles.naturezaInfo}>
                                        <span style={styles.naturezaCodigo}>{nat.codigo || "—"}</span>
                                        <span style={styles.naturezaDesc}>
                                          {nat.descricao || "Sem descrição"}
                                        </span>
                                      </div>
                                      <div style={styles.naturezaValores}>
                                        <div style={styles.naturezaSaldoContainer}>
                                          <span style={{
                                            ...styles.naturezaSaldo,
                                            color: saldo > 0 ? "#10B981" : saldo < 0 ? "#EF4444" : "var(--theme-text-secondary)",
                                          }}>
                                            {formatCurrency(saldo)}
                                          </span>
                                          <span style={styles.naturezaAlocado}>
                                            de {formatCurrency(alocado)}
                                          </span>
                                        </div>
                                        <div style={{ ...styles.barTrack, height: 4, width: 80 }}>
                                          <div
                                            style={{
                                              ...styles.barFill,
                                              height: 4,
                                              width: `${Math.min(percNat, 100)}%`,
                                              backgroundColor: getBarColor(100 - percNat),
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Botao ver mais / ver menos */}
                {temMais && (
                  <button
                    type="button"
                    onClick={() => setTiposMostrarTodos((prev) => ({ ...prev, [tipo]: !mostrarTodos }))}
                    style={styles.btnVerMais}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {mostrarTodos ? "expand_less" : "expand_more"}
                    </span>
                    {mostrarTodos
                      ? "Ver menos"
                      : `Ver mais ${emendasDoTipo.length - LIMITE_EMENDAS} emenda${emendasDoTipo.length - LIMITE_EMENDAS > 1 ? "s" : ""}`}
                  </button>
                )}
              </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--theme-border)",
    marginBottom: "16px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  header: {
    marginBottom: "20px",
    borderBottom: "1px solid var(--theme-border-light)",
    paddingBottom: "12px",
  },
  title: {
    margin: "0 0 3px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--theme-text)",
  },
  subtitle: {
    color: "var(--theme-text-secondary)",
    fontSize: "13px",
    fontWeight: "400",
  },
  tiposContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
    alignItems: "start",
  },
  tipoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "var(--theme-bg, #f8fafc)",
    borderRadius: "10px",
    border: "1px solid var(--theme-border)",
    padding: "16px",
  },
  tipoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    cursor: "pointer",
  },
  tipoInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tipoLabel: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--theme-text)",
  },
  tipoCount: {
    fontSize: "12px",
    color: "var(--theme-text-muted)",
    backgroundColor: "var(--theme-border)",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  tipoMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  tipoPerc: {
    fontSize: "18px",
    fontWeight: "700",
  },
  tipoValor: {
    fontSize: "12px",
    color: "var(--theme-text-secondary)",
  },
  barTrack: {
    height: "8px",
    backgroundColor: "var(--theme-border)",
    borderRadius: "6px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    transition: "width 0.5s ease",
    borderRadius: "6px",
  },
  emendasLista: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "4px",
  },
  emendaCard: {
    backgroundColor: "var(--theme-bg, #f8fafc)",
    borderRadius: "8px",
    border: "1px solid var(--theme-border)",
    overflow: "hidden",
  },
  emendaResumo: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    gap: "10px",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  emendaResumoInfo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },
  emendaNumero: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--theme-text)",
    fontFamily: "monospace",
    backgroundColor: "var(--theme-border)",
    padding: "2px 6px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  emendaParlamentar: {
    fontSize: "13px",
    color: "var(--theme-text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  emendaResumoValor: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  emendaPerc: {
    fontSize: "14px",
    fontWeight: "700",
  },
  emendaValorTexto: {
    fontSize: "12px",
    color: "var(--theme-text-secondary)",
    fontWeight: "500",
  },
  emendaDetalhes: {
    padding: "12px 16px 16px",
    borderTop: "1px solid var(--theme-border)",
    backgroundColor: "var(--theme-surface)",
  },
  detalhesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  detalheItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  detalheLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--theme-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    display: "flex",
    alignItems: "center",
  },
  detalheValor: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--theme-text)",
  },
  naturezasSection: {
    borderTop: "1px solid var(--theme-border)",
    paddingTop: "12px",
  },
  naturezasTitulo: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--theme-text)",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    margin: "0 0 10px 0",
    display: "flex",
    alignItems: "center",
  },
  naturezasLoading: {
    fontSize: "12px",
    color: "var(--theme-text-muted)",
    fontStyle: "italic",
  },
  naturezasVazio: {
    fontSize: "12px",
    color: "var(--theme-text-muted)",
    fontStyle: "italic",
  },
  naturezasLista: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  naturezaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "8px 10px",
    backgroundColor: "var(--theme-bg, #f8fafc)",
    borderRadius: "6px",
    border: "1px solid var(--theme-border)",
  },
  naturezaInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  },
  naturezaCodigo: {
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "monospace",
    color: "var(--theme-text)",
    backgroundColor: "var(--theme-border)",
    padding: "2px 6px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  naturezaDesc: {
    fontSize: "12px",
    color: "var(--theme-text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  naturezaValores: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  naturezaSaldoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "2px",
  },
  naturezaSaldo: {
    fontSize: "13px",
    fontWeight: "700",
  },
  naturezaAlocado: {
    fontSize: "10px",
    color: "var(--theme-text-muted)",
  },
  btnVerMais: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--theme-text-secondary)",
    backgroundColor: "transparent",
    border: "1px dashed var(--theme-border)",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "var(--theme-text-muted)",
    fontStyle: "italic",
  },
};

export default DashboardExecucao;
