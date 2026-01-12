// src/components/natureza/NaturezasList.jsx
// Lista de naturezas de despesa de uma emenda

import React, { useState, useCallback } from "react";
import NaturezaCard from "./NaturezaCard";
import NaturezaForm from "./NaturezaForm";
import { parseValorMonetario } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";
import ConfirmationModal from "../ConfirmationModal";

/**
 * Lista de naturezas de uma emenda
 * @param {object} props
 * @param {array} props.naturezas - Lista de naturezas
 * @param {object} props.emenda - Dados da emenda
 * @param {boolean} props.loading - Se esta carregando
 * @param {boolean} props.salvando - Se esta salvando
 * @param {function} props.onCriarNatureza - Callback para criar natureza
 * @param {function} props.onEditarNatureza - Callback para editar natureza
 * @param {function} props.onExcluirNatureza - Callback para excluir natureza
 * @param {function} props.onNovaDespesa - Callback para criar despesa
 * @param {function} props.onEditarDespesa - Callback para editar despesa
 * @param {function} props.onVisualizarDespesa - Callback para visualizar despesa
 * @param {function} props.onExcluirDespesa - Callback para excluir despesa
 * @param {function} props.onCarregarDespesas - Callback para carregar despesas de uma natureza
 * @param {function} props.validarAlocacao - Funcao para validar alocacao
 * @param {object} props.despesasPorNatureza - Mapa de despesas por natureza
 */
const NaturezasList = ({
  naturezas = [],
  emenda,
  loading = false,
  salvando = false,
  onCriarNatureza,
  onEditarNatureza,
  onExcluirNatureza,
  onRegularizarNatureza,
  onNovaDespesa,
  onEditarDespesa,
  onVisualizarDespesa,
  onExcluirDespesa,
  onCarregarDespesas,
  validarAlocacao,
  despesasPorNatureza = {},
}) => {
  const { isDark } = useTheme?.() || { isDark: false };

  // Estados
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [naturezaEmEdicao, setNaturezaEmEdicao] = useState(null);
  const [naturezaParaExcluir, setNaturezaParaExcluir] = useState(null);
  const [despesaParaExcluir, setDespesaParaExcluir] = useState(null);
  const [naturezasExpandidas, setNaturezasExpandidas] = useState({});
  const [carregandoDespesas, setCarregandoDespesas] = useState({});

  // Estados para regularizacao em lote
  const [mostrarModalRegularizarTodas, setMostrarModalRegularizarTodas] = useState(false);
  const [regularizandoTodas, setRegularizandoTodas] = useState(false);
  const [progressoRegularizacao, setProgressoRegularizacao] = useState({ atual: 0, total: 0 });

  // Calcular saldo livre da emenda
  const valorTotal = parseValorMonetario(
    emenda?.valor || emenda?.valorRecurso || emenda?.valorTotal || 0
  );
  const valorAlocado = parseValorMonetario(emenda?.valorAlocado || 0);
  const saldoLivre = valorTotal - valorAlocado;

  // Calculos agregados
  const totalExecutado = naturezas.reduce(
    (sum, n) => sum + parseValorMonetario(n.valorExecutado || 0),
    0
  );

  // Naturezas virtuais para regularizacao em lote
  const naturezasVirtuais = naturezas.filter(n => n.isVirtual);
  const totalNaturezasVirtuais = naturezasVirtuais.length;
  const valorTotalVirtuais = naturezasVirtuais.reduce(
    (sum, n) => sum + parseValorMonetario(n.valorExecutado || 0),
    0
  );
  const saldoSuficiente = saldoLivre >= valorTotalVirtuais;

  // Handlers
  const handleAbrirFormulario = () => {
    setNaturezaEmEdicao(null);
    setMostrarFormulario(true);
  };

  const handleEditarNatureza = (natureza) => {
    setNaturezaEmEdicao(natureza);
    setMostrarFormulario(true);
  };

  const handleFecharFormulario = () => {
    setMostrarFormulario(false);
    setNaturezaEmEdicao(null);
  };

  const handleSalvarNatureza = async (dados) => {
    try {
      if (naturezaEmEdicao) {
        await onEditarNatureza?.(naturezaEmEdicao.id, dados);
      } else {
        await onCriarNatureza?.(dados);
      }
      handleFecharFormulario();
    } catch (error) {
      throw error;
    }
  };

  const handleConfirmarExclusao = async () => {
    if (naturezaParaExcluir) {
      try {
        await onExcluirNatureza?.(naturezaParaExcluir.id);
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
      setNaturezaParaExcluir(null);
    }
  };

  const handleConfirmarExclusaoDespesa = async () => {
    if (despesaParaExcluir) {
      try {
        await onExcluirDespesa?.(despesaParaExcluir);
      } catch (error) {
        console.error("Erro ao excluir despesa:", error);
      }
      setDespesaParaExcluir(null);
    }
  };

  // Handler para regularizar todas as naturezas virtuais em lote
  const handleRegularizarTodas = async () => {
    if (!naturezasVirtuais.length || !saldoSuficiente) return;

    setRegularizandoTodas(true);
    setProgressoRegularizacao({ atual: 0, total: naturezasVirtuais.length });

    let sucessos = 0;
    const falhas = [];

    try {
      for (let i = 0; i < naturezasVirtuais.length; i++) {
        const nat = naturezasVirtuais[i];
        setProgressoRegularizacao({ atual: i + 1, total: naturezasVirtuais.length });

        try {
          const valorAlocar = parseValorMonetario(nat.valorExecutado || 0);
          await onRegularizarNatureza?.(nat, valorAlocar);
          sucessos++;
        } catch (error) {
          console.error(`Erro ao regularizar ${nat.codigo}:`, error);
          falhas.push({ codigo: nat.codigo, erro: error.message });
        }
      }

      // Log do resultado
      if (falhas.length === 0) {
        console.log(`${sucessos} naturezas regularizadas com sucesso`);
      } else {
        console.warn(`${sucessos} sucessos, ${falhas.length} falhas:`, falhas);
      }
    } finally {
      setRegularizandoTodas(false);
      setMostrarModalRegularizarTodas(false);
      setProgressoRegularizacao({ atual: 0, total: 0 });
    }
  };

  const handleExpandir = useCallback(
    async (naturezaId, expandido) => {
      setNaturezasExpandidas((prev) => ({
        ...prev,
        [naturezaId]: expandido,
      }));

      // Nao precisa carregar despesas para naturezas virtuais (ja tem despesasVinculadas)
      const natureza = naturezas.find(n => n.id === naturezaId);
      if (natureza?.isVirtual) return;

      // Carregar despesas se expandindo e ainda nao carregadas
      if (expandido && !despesasPorNatureza[naturezaId] && onCarregarDespesas) {
        setCarregandoDespesas((prev) => ({ ...prev, [naturezaId]: true }));
        try {
          await onCarregarDespesas(naturezaId);
        } catch (error) {
          console.error("Erro ao carregar despesas:", error);
        }
        setCarregandoDespesas((prev) => ({ ...prev, [naturezaId]: false }));
      }
    },
    [naturezas, despesasPorNatureza, onCarregarDespesas]
  );

  // Estilos - Design compacto e profissional
  const styles = {
    container: {
      marginTop: "16px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    titulo: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    badge: {
      backgroundColor: "var(--primary, #2563EB)",
      color: "var(--white, #ffffff)",
      padding: "2px 6px",
      borderRadius: "var(--border-radius-full, 10px)",
      fontSize: "11px",
      fontWeight: "var(--font-weight-semibold, 600)",
    },
    btnNovo: {
      padding: "6px 12px",
      fontSize: "var(--font-size-xs, 12px)",
      fontWeight: "var(--font-weight-medium, 500)",
      border: "none",
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: "var(--primary, #2563EB)",
      color: "var(--white, #ffffff)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    btnNovoDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    resumo: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "8px",
      marginBottom: "12px",
    },
    cardResumo: {
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius, 6px)",
      padding: "10px 12px",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
    },
    cardResumoLabel: {
      fontSize: "10px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "2px",
    },
    cardResumoValor: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-bold, 700)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
    },
    lista: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    emptyState: {
      textAlign: "center",
      padding: "24px 16px",
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius-md, 8px)",
      border: `1px dashed ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
    },
    emptyIcon: {
      fontSize: 32,
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-400, #94A3B8)",
      marginBottom: "8px",
    },
    emptyTitulo: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      marginBottom: "4px",
    },
    emptyDescricao: {
      fontSize: "var(--font-size-xs, 12px)",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "12px",
    },
    loading: {
      textAlign: "center",
      padding: "24px",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
    },
    formularioContainer: {
      marginBottom: "12px",
    },
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 32, animation: "spin 1s linear infinite" }}
        >
          sync
        </span>
        <p>Carregando naturezas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.titulo}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            account_balance_wallet
          </span>
          Naturezas de Despesa
          <span style={styles.badge}>{naturezas.length}</span>
        </h3>

        {!mostrarFormulario && (
          <div style={{ display: "flex", gap: 8 }}>
            {/* Botao Regularizar Todas - so aparece quando ha virtuais */}
            {totalNaturezasVirtuais > 0 && (
              <button
                style={{
                  ...styles.btnNovo,
                  backgroundColor: saldoSuficiente ? "#f59e0b" : "#d1d5db",
                  opacity: saldoSuficiente && !regularizandoTodas ? 1 : 0.6,
                  cursor: saldoSuficiente && !regularizandoTodas ? "pointer" : "not-allowed",
                }}
                onClick={() => setMostrarModalRegularizarTodas(true)}
                disabled={!saldoSuficiente || regularizandoTodas}
                title={
                  !saldoSuficiente
                    ? `Saldo livre insuficiente. Necessario: R$ ${valorTotalVirtuais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : `Regularizar ${totalNaturezasVirtuais} natureza${totalNaturezasVirtuais > 1 ? "s" : ""} virtual${totalNaturezasVirtuais > 1 ? "is" : ""}`
                }
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  verified
                </span>
                Regularizar Todas ({totalNaturezasVirtuais})
              </button>
            )}

            {/* Botao Nova Natureza */}
            <button
              style={{
                ...styles.btnNovo,
                ...(saldoLivre <= 0 ? styles.btnNovoDisabled : {}),
              }}
              onClick={handleAbrirFormulario}
              disabled={saldoLivre <= 0}
              title={
                saldoLivre <= 0
                  ? "Sem saldo livre para alocar"
                  : "Criar nova natureza"
              }
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Nova Natureza
            </button>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div style={styles.resumo}>
        <div style={styles.cardResumo}>
          <div style={styles.cardResumoLabel}>Valor da Emenda</div>
          <div style={styles.cardResumoValor}>
            R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={styles.cardResumo}>
          <div style={styles.cardResumoLabel}>Total Alocado</div>
          <div style={{ ...styles.cardResumoValor, color: "#3b82f6" }}>
            R$ {valorAlocado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={styles.cardResumo}>
          <div style={styles.cardResumoLabel}>Saldo Livre</div>
          <div
            style={{
              ...styles.cardResumoValor,
              color: saldoLivre > 0 ? "#10b981" : "#ef4444",
            }}
          >
            R$ {saldoLivre.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={styles.cardResumo}>
          <div style={styles.cardResumoLabel}>Total Executado</div>
          <div style={{ ...styles.cardResumoValor, color: "#8b5cf6" }}>
            R$ {totalExecutado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div style={styles.formularioContainer}>
          <NaturezaForm
            onSalvar={handleSalvarNatureza}
            onCancelar={handleFecharFormulario}
            naturezaParaEditar={naturezaEmEdicao}
            saldoLivre={
              naturezaEmEdicao
                ? saldoLivre + parseValorMonetario(naturezaEmEdicao.valorAlocado || 0)
                : saldoLivre
            }
            salvando={salvando}
            validarAlocacao={validarAlocacao}
          />
        </div>
      )}

      {/* Lista de naturezas ou empty state */}
      {naturezas.length === 0 ? (
        <div style={styles.emptyState}>
          <span className="material-symbols-outlined" style={styles.emptyIcon}>
            account_balance_wallet
          </span>
          <div style={styles.emptyTitulo}>Nenhuma natureza cadastrada</div>
          <div style={styles.emptyDescricao}>
            Cadastre naturezas de despesa para organizar o orcamento da emenda em
            envelopes. Cada natureza reserva uma parte do saldo para despesas
            especificas.
          </div>
          {!mostrarFormulario && saldoLivre > 0 && (
            <button style={styles.btnNovo} onClick={handleAbrirFormulario}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Cadastrar Primeira Natureza
            </button>
          )}
        </div>
      ) : (
        <div style={styles.lista}>
          {naturezas.map((natureza) => (
            <NaturezaCard
              key={natureza.id}
              natureza={natureza}
              despesas={
                natureza.isVirtual
                  ? natureza.despesasVinculadas || []
                  : despesasPorNatureza[natureza.id] || []
              }
              carregandoDespesas={carregandoDespesas[natureza.id] || false}
              expandido={naturezasExpandidas[natureza.id] || false}
              onExpandir={handleExpandir}
              onNovaDespesa={onNovaDespesa}
              onEditarNatureza={handleEditarNatureza}
              onExcluirNatureza={(n) => setNaturezaParaExcluir(n)}
              onRegularizarNatureza={onRegularizarNatureza}
              onEditarDespesa={onEditarDespesa}
              onVisualizarDespesa={onVisualizarDespesa}
              onExcluirDespesa={(d) => setDespesaParaExcluir(d)}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmacao de exclusao de natureza */}
      {naturezaParaExcluir && (
        <ConfirmationModal
          isVisible={true}
          onCancel={() => setNaturezaParaExcluir(null)}
          onConfirm={handleConfirmarExclusao}
          title="Excluir Natureza"
          message={`Tem certeza que deseja excluir a natureza "${naturezaParaExcluir.descricao}"? O valor alocado sera liberado para o saldo livre da emenda.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
        />
      )}

      {/* Modal de confirmacao de exclusao de despesa */}
      {despesaParaExcluir && (
        <ConfirmationModal
          isVisible={true}
          onCancel={() => setDespesaParaExcluir(null)}
          onConfirm={handleConfirmarExclusaoDespesa}
          title="Excluir Despesa"
          message={`Tem certeza que deseja excluir a despesa "${despesaParaExcluir.discriminacao || despesaParaExcluir.descricao || "Despesa"}"? Esta acao nao pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
        />
      )}

      {/* Modal de confirmacao de regularizacao em lote */}
      {mostrarModalRegularizarTodas && (
        <ConfirmationModal
          isVisible={true}
          onCancel={() => !regularizandoTodas && setMostrarModalRegularizarTodas(false)}
          onConfirm={handleRegularizarTodas}
          title="Regularizar Todas as Naturezas"
          message={
            regularizandoTodas ? (
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, animation: "spin 1s linear infinite" }}
                  >
                    sync
                  </span>
                  <span style={{ fontWeight: 600 }}>Regularizando naturezas...</span>
                </div>
                <div
                  style={{
                    height: 8,
                    backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#e2e8f0",
                    borderRadius: 4,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(progressoRegularizacao.atual / progressoRegularizacao.total) * 100}%`,
                      backgroundColor: "#f59e0b",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: isDark ? "var(--theme-text-secondary)" : "#64748b",
                  }}
                >
                  {progressoRegularizacao.atual} de {progressoRegularizacao.total} naturezas
                  processadas
                </span>
              </div>
            ) : (
              <div style={{ textAlign: "left" }}>
                <p
                  style={{
                    marginBottom: 12,
                    color: isDark ? "var(--theme-text-secondary)" : "#475569",
                  }}
                >
                  As seguintes naturezas virtuais serao convertidas em naturezas reais:
                </p>

                {/* Tabela listando naturezas virtuais */}
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: "auto",
                    border: `1px solid ${isDark ? "var(--theme-border)" : "#e2e8f0"}`,
                    borderRadius: 6,
                    marginBottom: 12,
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr
                        style={{
                          backgroundColor: isDark
                            ? "var(--theme-surface-secondary)"
                            : "#f8fafc",
                          borderBottom: `1px solid ${isDark ? "var(--theme-border)" : "#e2e8f0"}`,
                        }}
                      >
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Codigo</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Descricao</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>
                          Valor a Alocar
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {naturezasVirtuais.map((nat, idx) => (
                        <tr
                          key={nat.id}
                          style={{
                            backgroundColor:
                              idx % 2 === 0
                                ? isDark
                                  ? "var(--theme-surface)"
                                  : "#fff"
                                : isDark
                                  ? "var(--theme-surface-secondary)"
                                  : "#f8fafc",
                          }}
                        >
                          <td style={{ padding: "6px 10px", fontFamily: "monospace" }}>
                            {nat.codigo}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {nat.descricao?.replace(`${nat.codigo} - `, "")}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "right",
                              fontFamily: "monospace",
                            }}
                          >
                            R${" "}
                            {parseValorMonetario(nat.valorExecutado || 0).toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumo */}
                <div
                  style={{
                    padding: 12,
                    backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#fef3c7",
                    borderRadius: 6,
                    border: `1px solid ${isDark ? "#f59e0b" : "#fcd34d"}`,
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}
                  >
                    <span style={{ fontSize: 12, color: isDark ? "#fcd34d" : "#92400e" }}>
                      Total de naturezas:
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isDark ? "#fcd34d" : "#92400e",
                      }}
                    >
                      {totalNaturezasVirtuais}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}
                  >
                    <span style={{ fontSize: 12, color: isDark ? "#fcd34d" : "#92400e" }}>
                      Valor total a alocar:
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isDark ? "#fcd34d" : "#92400e",
                      }}
                    >
                      R$ {valorTotalVirtuais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: isDark ? "#fcd34d" : "#92400e" }}>
                      Saldo livre disponivel:
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: saldoSuficiente ? "#10b981" : "#ef4444",
                      }}
                    >
                      R$ {saldoLivre.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )
          }
          confirmText={regularizandoTodas ? "Processando..." : "Confirmar Regularizacao"}
          cancelText="Cancelar"
          type="warning"
          disabled={regularizandoTodas}
        />
      )}
    </div>
  );
};

export default NaturezasList;
