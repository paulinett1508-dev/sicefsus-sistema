// src/components/emenda/EmendaForm/sections/ExecucaoOrcamentaria.jsx
// ✅ CORRIGIDO: Substituído modal de confirmação por ExecutarDespesaModal (formulário completo)
// ✅ NOVO: Passa emendaInfo corretamente para DespesaForm

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import Toast from "../../../Toast";
import DespesasList from "../../../DespesasList";
import DespesaForm from "../../../DespesaForm";
import { NATUREZAS_DESPESA } from "../../../../config/constants";
import {
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../../utils/formatters";

const formatCurrency = (valor) =>
  (Number(valor) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

// ===== Formulário inline (PLANEJADA) =====
const DespesaPlanejadaForm = ({
  emendaId,
  valorEmenda,
  totalExecutado,
  onSuccess,
  usuario,
}) => {
  const [modoCustomizado, setModoCustomizado] = useState(false);
  const [despesaCustomizada, setDespesaCustomizada] = useState("");
  const [estrategia, setEstrategia] = useState("");
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const saldoDisponivel = valorEmenda - totalExecutado;

  const handleEstrategiaChange = (e) => {
    const selected = e.target.value;
    if (selected === "__customizado__") {
      setModoCustomizado(true);
      setEstrategia("");
    } else {
      setModoCustomizado(false);
      setDespesaCustomizada("");
      setEstrategia(selected);
    }
  };

  const validarFormulario = () => {
    if (!emendaId)
      return {
        valido: false,
        mensagem: "Salve a emenda antes de adicionar despesas.",
      };
    const v = parseValorMonetario(valor);
    if (!modoCustomizado && !estrategia)
      return { valido: false, mensagem: "Selecione a natureza da despesa." };
    if (modoCustomizado && !despesaCustomizada.trim())
      return { valido: false, mensagem: "Informe a natureza de despesa." };
    if (!valor || v <= 0)
      return { valido: false, mensagem: "Informe um valor válido." };
    return { valido: true };
  };

  const handleSalvarPlanejada = async () => {
    const valid = validarFormulario();
    if (!valid.valido) {
      alert(valid.mensagem);
      return;
    }
    try {
      setSalvando(true);
      const estrategiaFinal = modoCustomizado ? despesaCustomizada : estrategia;
      await addDoc(collection(db, "despesas"), {
        emendaId,
        estrategia: estrategiaFinal,
        naturezaDespesa: estrategiaFinal,
        valor: parseValorMonetario(valor),
        status: "PLANEJADA",
        criadaEm: new Date().toISOString(),
        criadaPor: usuario?.email,
      });
      setEstrategia("");
      setDespesaCustomizada("");
      setValor("");
      onSuccess?.();
    } catch (e) {
      console.error(e);
      alert("Erro ao adicionar despesa.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={styles.cardFormInline}>
      <div style={styles.formInline}>
        <div style={styles.formGroup}>
          <label style={formStyles.label}>Natureza de Despesa</label>
          {!modoCustomizado ? (
            <select
              id="naturezaDespesaSelect"
              value={estrategia}
              onChange={handleEstrategiaChange}
              style={formStyles.select}
            >
              <option value="">Selecione a natureza de despesas</option>
              {NATUREZAS_DESPESA.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value="__customizado__">✏️ Digitar outra...</option>
            </select>
          ) : (
            <div style={formStyles.inputCustomizadoWrapper}>
              <input
                type="text"
                value={despesaCustomizada}
                onChange={(e) => setDespesaCustomizada(e.target.value)}
                placeholder="Digite a natureza de despesa..."
                style={formStyles.input}
              />
              <button
                type="button"
                onClick={() => {
                  setModoCustomizado(false);
                  setDespesaCustomizada("");
                  setEstrategia("");
                }}
                style={formStyles.btnVoltarSelect}
              >
                ↩️ Voltar
              </button>
            </div>
          )}
        </div>
        <div style={styles.formGroup}>
          <label style={formStyles.label}>Valor</label>
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(formatarMoedaInput(e.target.value))}
            placeholder="R$ 0,00"
            style={{
              ...formStyles.input,
              textAlign: "right",
              fontFamily: "monospace",
            }}
          />
        </div>
        <div style={styles.formGroupButton}>
          <label style={{ visibility: "hidden" }}>Ações</label>
          <button
            type="button"
            onClick={handleSalvarPlanejada}
            disabled={salvando}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              opacity: salvando ? 0.5 : 1,
              cursor: salvando ? "not-allowed" : "pointer",
            }}
            title="Adicionar despesa planejada"
          >
            {salvando ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </div>
      <div style={styles.formFooterHint}>
        <span>Saldo disponível: </span>
        <strong>{formatCurrency(saldoDisponivel)}</strong>
        <span style={{ opacity: 0.6, marginLeft: 8 }}>
          (planejadas não consomem)
        </span>
      </div>
    </div>
  );
};

// ===== Principal =====
const ExecucaoOrcamentaria = ({ formData, usuario }) => {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [modal, setModal] = useState({ abrir: false, despesa: null });
  const [emendaIdReal, setEmendaIdReal] = useState(null);

  // 🆕 Estados para edição/visualização de despesa
  const [despesaEmEdicao, setDespesaEmEdicao] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState(null); // 'editar' | 'visualizar' | null

  // Resolver ID (id | emendaId | número)
  useEffect(() => {
    const resolverId = async () => {
      if (formData?.id || formData?.emendaId) {
        setEmendaIdReal(formData.id || formData.emendaId);
        return;
      }
      const numero = formData?.numero || formData?.numeroEmenda;
      if (!numero) {
        setEmendaIdReal(null);
        return;
      }
      try {
        const q = query(
          collection(db, "emendas"),
          where("numero", "==", numero),
        );
        const snap = await getDocs(q);
        setEmendaIdReal(!snap.empty ? snap.docs[0].id : null);
      } catch {
        setEmendaIdReal(null);
      }
    };
    resolverId();
  }, [
    formData?.id,
    formData?.emendaId,
    formData?.numero,
    formData?.numeroEmenda,
  ]);

  const emendaId = emendaIdReal || formData?.id || formData?.emendaId;
  const temEmendaSalva = !!emendaId;

  const carregarDespesas = async () => {
    if (!emendaId) {
      setDespesas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, "despesas"),
        where("emendaId", "==", emendaId),
      );
      const snap = await getDocs(q);
      setDespesas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Erro ao carregar despesas.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (temEmendaSalva) carregarDespesas(); /* eslint-disable-next-line */
  }, [emendaId]);

  const despesasPlanejadas = despesas.filter((d) => d.status === "PLANEJADA");
  const despesasExecutadas = despesas.filter((d) => d.status !== "PLANEJADA");

  // 🔍 DEBUG: Ver os dados reais das despesas
  console.log(
    "🔍 DEBUG - Despesas Executadas:",
    despesasExecutadas.map((d) => ({
      statusPagamento: d.statusPagamento,
      valor: d.valor,
      valorTipo: typeof d.valor,
      valorParsed: parseValorMonetario(d.valor),
    })),
  );

  const valorEmendaParsed = (() => {
    const raw = formData?.valor || formData?.valorRecurso || 0;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string")
      return parseFloat(raw.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    return 0;
  })();

  const stats = {
    valorEmenda: valorEmendaParsed,
    totalPlanejado: despesasPlanejadas.reduce(
      (acc, d) => acc + Number(d.valor || 0),
      0,
    ),
    // ✅ CORRIGIDO: Soma TODAS as despesas executadas (status !== PLANEJADA)
    totalExecutado: despesasExecutadas.reduce(
      (acc, d) => acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
      0,
    ),
    // 🆕 Cálculos por status financeiro (com parse robusto)
    totalPago: despesasExecutadas
      .filter((d) => d.statusPagamento === "pago")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalLiquidado: despesasExecutadas
      .filter((d) => d.statusPagamento === "liquidado")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalEmpenhado: despesasExecutadas
      .filter((d) => d.statusPagamento === "empenhado")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalPendente: despesasExecutadas
      .filter((d) => d.statusPagamento === "pendente")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
  };

  const saldoDisponivel = stats.valorEmenda - stats.totalExecutado;
  const percentualExecucao =
    stats.valorEmenda > 0
      ? Math.round((stats.totalExecutado / stats.valorEmenda) * 100)
      : 0;

  // Handlers
  const handleAdicionarDespesa = () => {
    if (!temEmendaSalva) {
      setToast({
        show: true,
        message: "Salve a emenda antes de adicionar despesas.",
        type: "error",
      });
      return;
    }
  };

  const handleEditarDespesa = (despesa) => {
    console.log("✏️ Editando despesa:", despesa);
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("editar");
  };

  const handleVisualizarDespesa = (despesa) => {
    console.log("👁️ Visualizando despesa:", despesa);
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("visualizar");
  };

  const handleFecharFormulario = () => {
    setDespesaEmEdicao(null);
    setModoVisualizacao(null);
  };

  const handleSucessoFormulario = () => {
    setDespesaEmEdicao(null);
    setModoVisualizacao(null);
    carregarDespesas();
    setToast({
      show: true,
      message: "Despesa atualizada com sucesso!",
      type: "success",
    });
  };

  const handleExecutarDespesa = async (despesaId) => {
    try {
      const despesaRef = doc(db, "despesas", despesaId);
      await updateDoc(despesaRef, { status: "EXECUTADA" });
      setToast({
        show: true,
        message: "Despesa executada com sucesso!",
        type: "success",
      });
      carregarDespesas();
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Erro ao executar despesa.",
        type: "error",
      });
    }
  };

  const handleRemoverDespesa = async (despesaId) => {
    if (!window.confirm("Tem certeza que deseja remover esta despesa?")) return;
    try {
      await deleteDoc(doc(db, "despesas", despesaId));
      setToast({
        show: true,
        message: "Despesa removida com sucesso!",
        type: "success",
      });
      carregarDespesas();
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Erro ao remover despesa.",
        type: "error",
      });
    }
  };

  // ===== Render =====
  return (
    <div style={styles.container}>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* ===== SEÇÃO: INFORMAÇÕES GERAIS ===== */}
      <div style={styles.secao}>
        <div style={styles.secaoHeader}>
          <h2 style={styles.secaoTitulo}>📊 Execução Orçamentária</h2>
        </div>

        {/* Metrics Grid */}
        <div style={styles.metricsGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricCardPrimary }}>
            <div style={styles.metricLabel}>Valor da Emenda</div>
            <div style={styles.metricValue}>
              {formatCurrency(stats.valorEmenda)}
            </div>
          </div>

          <div style={{ ...styles.metricCard, ...styles.metricCardWarning }}>
            <div style={styles.metricLabel}>Total Executado</div>
            <div style={styles.metricValue}>
              {formatCurrency(stats.totalExecutado)}
            </div>
          </div>

          <div style={{ ...styles.metricCard, ...styles.metricCardSuccess }}>
            <div style={styles.metricLabel}>Saldo Disponível</div>
            <div style={styles.metricValue}>
              {formatCurrency(Math.max(0, saldoDisponivel))}
            </div>
          </div>

          <div style={{ ...styles.metricCard, ...styles.metricCardInfo }}>
            <div style={styles.metricLabel}>Percentual Executado</div>
            <div style={styles.metricValue}>{percentualExecucao}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressLabel}>
            <span>Execução</span>
            <span>{percentualExecucao}%</span>
          </div>
          <div style={styles.progressBarContainer}>
            <div
              style={{
                ...styles.progressBar,
                width: `${Math.min(percentualExecucao, 100)}%`,
                backgroundColor:
                  percentualExecucao <= 50
                    ? "#28a745"
                    : percentualExecucao <= 80
                      ? "#ffc107"
                      : "#dc3545",
              }}
            />
          </div>
        </div>

        {/* Status Financeiro - Mini Cards */}
        <div style={styles.statusSection}>
          <div style={styles.statusLabel}>Status Financeiro</div>
          <div style={styles.statusMiniGrid}>
            <div style={{ ...styles.miniCard, ...styles.miniCardPago }}>
              <span style={styles.miniCardIcon}>✅</span>
              <div style={styles.miniCardContent}>
                <div style={styles.miniCardLabel}>Pago</div>
                <div style={styles.miniCardValue}>
                  {formatCurrency(stats.totalPago)}
                </div>
              </div>
            </div>
            <div style={{ ...styles.miniCard, ...styles.miniCardLiquidado }}>
              <span style={styles.miniCardIcon}>🔄</span>
              <div style={styles.miniCardContent}>
                <div style={styles.miniCardLabel}>Liquidado</div>
                <div style={styles.miniCardValue}>
                  {formatCurrency(stats.totalLiquidado)}
                </div>
              </div>
            </div>
            <div style={{ ...styles.miniCard, ...styles.miniCardEmpenhado }}>
              <span style={styles.miniCardIcon}>📝</span>
              <div style={styles.miniCardContent}>
                <div style={styles.miniCardLabel}>Empenhado</div>
                <div style={styles.miniCardValue}>
                  {formatCurrency(stats.totalEmpenhado)}
                </div>
              </div>
            </div>
            <div style={{ ...styles.miniCard, ...styles.miniCardPendente }}>
              <span style={styles.miniCardIcon}>⏳</span>
              <div style={styles.miniCardContent}>
                <div style={styles.miniCardLabel}>Pendente</div>
                <div style={styles.miniCardValue}>
                  {formatCurrency(stats.totalPendente)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEÇÃO: DESPESAS PLANEJADAS ===== */}
      {temEmendaSalva && (
        <div style={styles.secao}>
          <div style={styles.secaoHeader}>
            <h3 style={styles.secaoTitulo}>
              📋 Despesas Planejadas ({despesasPlanejadas.length})
            </h3>
          </div>

          <DespesaPlanejadaForm
            emendaId={emendaId}
            valorEmenda={stats.valorEmenda}
            totalExecutado={stats.totalExecutado}
            onSuccess={carregarDespesas}
            usuario={usuario}
          />

          {despesasPlanejadas.length === 0 ? (
            <div style={styles.emptyState}>
              <div>
                <div style={styles.emptyEmoji}>📭</div>
                <h3 style={styles.emptyTitle}>Nenhuma despesa planejada</h3>
                <p style={styles.emptyText}>
                  Use o formulário acima para adicionar despesas planejadas.
                </p>
              </div>
            </div>
          ) : (
            <div style={styles.tabelaWrapper}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 8px" }}>
                      Natureza
                    </th>
                    <th style={{ textAlign: "right", padding: "12px 8px" }}>
                      Valor Planejado
                    </th>
                    <th style={{ textAlign: "center", padding: "12px 8px" }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {despesasPlanejadas.map((despesa, idx) => (
                    <tr
                      key={despesa.id}
                      style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td style={styles.td}>
                        {despesa.estrategia || despesa.naturezaDespesa}
                      </td>
                      <td style={{ ...styles.td, ...styles.tdValorPlanejado }}>
                        {formatCurrency(despesa.valor)}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <div style={styles.despesaAcoes}>
                          <button
                            onClick={() => handleEditarDespesa(despesa)}
                            style={styles.btn}
                            title="Editar despesa"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleRemoverDespesa(despesa.id)}
                            style={{ ...styles.btn, ...styles.btnDanger }}
                            title="Remover despesa"
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== SEÇÃO: DESPESAS EXECUTADAS ===== */}
      {temEmendaSalva && despesasExecutadas.length > 0 && (
        <div style={styles.secao}>
          <div style={styles.secaoHeader}>
            <h3 style={styles.secaoTitulo}>
              ✅ Despesas Executadas ({despesasExecutadas.length})
            </h3>
          </div>

          <DespesasList
            despesas={despesasExecutadas}
            onEditar={handleEditarDespesa}
            onVisualizar={handleVisualizarDespesa}
            onRemover={handleRemoverDespesa}
            onExecutar={handleExecutarDespesa}
          />
        </div>
      )}

      {/* ===== EMPTY STATE: Sem emenda salva ===== */}
      {!temEmendaSalva && (
        <div style={styles.emptyState}>
          <div>
            <div style={styles.emptyEmoji}>💾</div>
            <h3 style={styles.emptyTitle}>Salve a emenda primeiro</h3>
            <p style={styles.emptyText}>
              Clique em "Salvar Emenda" para adicionar despesas.
            </p>
          </div>
        </div>
      )}

      {/* ===== MODAL: Edição de Despesa ===== */}
      {despesaEmEdicao &&
        createPortal(
          <div style={styles.formularioEdicaoOverlay}>
            <div style={styles.formularioEdicaoModal}>
              <div style={styles.formularioEdicaoHeader}>
                <h2 style={styles.formularioTitulo}>
                  {modoVisualizacao === "visualizar"
                    ? "👁️ Visualizar Despesa"
                    : "✏️ Editar Despesa"}
                </h2>
                <button
                  onClick={handleFecharFormulario}
                  style={styles.btnVoltar}
                >
                  ✕ Fechar
                </button>
              </div>
              <div style={styles.formularioEdicaoContent}>
                <DespesaForm
                  despesaParaEditar={despesaEmEdicao}
                  emendaPreSelecionada={emendaId}
                  emendaInfo={{
                    // ✅ CORRIGIDO: Passa emendaInfo com dados completos
                    id: emendaId,
                    valor: stats.valorEmenda,
                    valorTotal: stats.valorEmenda,
                    saldoDisponivel: saldoDisponivel,
                    totalExecutado: stats.totalExecutado,
                    percentualExecucao: percentualExecucao,
                    ...formData, // Inclui outros dados da emenda
                  }}
                  usuario={usuario}
                  onCancelar={handleFecharFormulario}
                  onSuccess={handleSucessoFormulario}
                  modoVisualizacao={modoVisualizacao === "visualizar"}
                  hideHeader={true}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    padding: 16,
    borderRadius: 8,
    border: "1px solid #dee2e6",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  metricCardPrimary: {
    backgroundColor: "#e7f3ff",
    borderColor: "#91d5ff",
  },
  metricCardWarning: {
    backgroundColor: "#fff7e6",
    borderColor: "#ffc53d",
  },
  metricCardSuccess: {
    backgroundColor: "#f6ffed",
    borderColor: "#b7eb8f",
  },
  metricCardInfo: {
    backgroundColor: "#e6f7ff",
    borderColor: "#69c0ff",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#666",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
    fontFamily: "monospace",
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#333",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  statusSection: {
    paddingTop: 12,
    borderTop: "1px solid #dee2e6",
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statusMiniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },
  miniCard: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid",
    transition: "all 0.2s ease",
    cursor: "default",
  },
  miniCardPago: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  miniCardLiquidado: {
    backgroundColor: "#ecfdf5",
    borderColor: "#6ee7b7",
  },
  miniCardEmpenhado: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  },
  miniCardPendente: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
  },
  miniCardIcon: {
    fontSize: 18,
    lineHeight: 1,
  },
  miniCardContent: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    flex: 1,
  },
  miniCardLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  miniCardValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    fontFamily: "monospace",
  },
  miniCardHint: {
    fontSize: 9,
    color: "#64748b",
  },
  secao: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
  },
  secaoHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "2px solid #e9ecef",
  },
  secaoTitulo: {
    margin: 0,
    fontSize: 18,
    fontWeight: "bold",
    color: "#154360",
  },
  badge: {
    backgroundColor: "#154360",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 12,
  },
  infoIcon: {
    fontSize: 16,
    cursor: "help",
    opacity: 0.6,
    transition: "opacity 0.2s",
    userSelect: "none",
  },
  cardFormInline: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  formInline: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) 160px 160px",
    gap: 12,
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  formGroupButton: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: "auto",
  },
  formFooterHint: { marginTop: 8, fontSize: 12, opacity: 0.8 },
  tabelaWrapper: {
    overflowX: "auto",
    border: "1px solid #e9ecef",
    borderRadius: 8,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: {
    backgroundColor: "#2c3e50",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    borderBottom: "2px solid #34495e",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tbody: {},
  trEven: { backgroundColor: "#f9f9f9" },
  trOdd: { backgroundColor: "#fff" },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 12,
    color: "#333",
    verticalAlign: "middle",
  },
  tdValorPlanejado: {
    fontSize: 14,
    fontWeight: 700,
    color: "#f39c12",
    textAlign: "right",
    fontFamily: "monospace",
  },
  despesaAcoes: { display: "flex", gap: 8, justifyContent: "center" },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnPrimary: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    borderColor: "#0d6efd",
  },
  btnSecondary: {
    backgroundColor: "#6c757d",
    color: "#fff",
    borderColor: "#6c757d",
  },
  btnDanger: {
    backgroundColor: "#dc3545",
    color: "white",
    transition: "background-color 0.2s",
  },
  btnIconExecutar: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnIconRemover: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: 20,
    border: "1px dashed #cbd5e1",
    borderRadius: 12,
    background: "#f8fafc",
    marginTop: 8,
    marginBottom: 12,
  },
  emptyEmoji: { fontSize: 28, marginBottom: 8 },
  emptyTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" },
  emptyText: { margin: "6px 0 0 0", fontSize: 13, color: "#475569" },
  formularioEdicaoOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  formularioEdicaoModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 1400,
    maxHeight: "95vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    border: "3px solid #4A90E2",
  },
  formularioEdicaoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    backgroundColor: "#4A90E2",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  formularioTitulo: {
    margin: 0,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  btnVoltar: {
    backgroundColor: "#fff",
    color: "#4A90E2",
    border: "none",
    padding: "10px 20px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  formularioEdicaoContent: {
    padding: 24,
    overflowY: "auto",
    flex: 1,
  },
};

const formStyles = {
  label: { fontWeight: 600, color: "#154360" },
  input: {
    border: "1px solid #dee2e6",
    borderRadius: 8,
    padding: "10px 12px",
    outline: "none",
  },
  select: {
    border: "1px solid #dee2e6",
    borderRadius: 8,
    padding: "10px 12px",
    outline: "none",
    background: "#fff",
  },
  inputCustomizadoWrapper: { display: "flex", gap: 8 },
  btnVoltarSelect: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default ExecucaoOrcamentaria;
