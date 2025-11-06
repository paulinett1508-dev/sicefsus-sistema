// src/components/emenda/EmendaForm/sections/ExecucaoOrcamentaria.jsx
// ✅ CORRIGIDO: Substituído modal de confirmação por ExecutarDespesaModal (formulário completo)

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
      .filter((d) => String(d.statusPagamento || "").toLowerCase() === "pago")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalLiquidado: despesasExecutadas
      .filter(
        (d) => String(d.statusPagamento || "").toLowerCase() === "liquidado",
      )
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalEmpenhado: despesasExecutadas
      .filter(
        (d) => String(d.statusPagamento || "").toLowerCase() === "empenhado",
      )
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalPendente: despesasExecutadas
      .filter((d) => {
        const status = String(d.statusPagamento || "").toLowerCase();
        return status === "pendente" || !status || status === "";
      })
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    // Contadores
    qtdPago: despesasExecutadas.filter(
      (d) => String(d.statusPagamento || "").toLowerCase() === "pago",
    ).length,
    qtdLiquidado: despesasExecutadas.filter(
      (d) => String(d.statusPagamento || "").toLowerCase() === "liquidado",
    ).length,
    qtdEmpenhado: despesasExecutadas.filter(
      (d) => String(d.statusPagamento || "").toLowerCase() === "empenhado",
    ).length,
    qtdPendente: despesasExecutadas.filter((d) => {
      const status = String(d.statusPagamento || "").toLowerCase();
      return status === "pendente" || !status || status === "";
    }).length,
  };
  const saldoDisponivel = stats.valorEmenda - stats.totalExecutado;

  // 🆕 HANDLERS PARA EDIÇÃO/VISUALIZAÇÃO DE DESPESAS
  const handleEditarDespesa = (despesa) => {
    console.log("🔧 ExecucaoOrcamentaria.handleEditarDespesa CHAMADO:", {
      despesaId: despesa?.id,
      discriminacao: despesa?.discriminacao || despesa?.estrategia,
    });

    setDespesaEmEdicao(despesa);
    setModoVisualizacao("editar");

    // Scroll suave para o topo do formulário
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleVisualizarDespesa = (despesa) => {
    console.log("👁️ ExecucaoOrcamentaria.handleVisualizarDespesa CHAMADO:", {
      despesaId: despesa?.id,
    });
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("visualizar");
  };

  const handleFecharFormulario = () => {
    console.log("🔒 handleFecharFormulario CHAMADO");
    setDespesaEmEdicao(null);
    setModoVisualizacao(null);
    console.log(
      "✅ Modal fechado - despesaEmEdicao=null, modoVisualizacao=null",
    );
  };

  const handleSucessoFormulario = () => {
    console.log("✅ handleSucessoFormulario CHAMADO - Iniciando fechamento");

    // Fechar formulário IMEDIATAMENTE
    handleFecharFormulario();

    // Recarregar despesas após pequeno delay
    setTimeout(() => {
      console.log("🔄 Recarregando despesas...");
      carregarDespesas();
    }, 100);
  };

  const handleExecutarDespesa = (despesa) => setModal({ abrir: true, despesa });
  const closeModal = () => setModal({ abrir: false, despesa: null });

  const handleRemoverDespesaPlanejada = async (id, descricao, valor) => {
    if (
      !confirm(
        `Remover a despesa planejada\n\n${descricao}\nValor: ${formatCurrency(valor)}\n\nEssa ação não pode ser desfeita. Continuar?`,
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "despesas", id));
      carregarDespesas();
      setToast({
        show: true,
        message: "Despesa planejada removida",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      alert("Erro ao remover despesa.");
    }
  };

  const showToast = (config) => {
    setToast({ show: true, ...config });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <>
      {/* 🆕 FORMULÁRIO DE EDIÇÃO/VISUALIZAÇÃO DE DESPESA - USANDO PORTAL (FORA DO DOM) */}
      {despesaEmEdicao &&
        createPortal(
          <div style={styles.formularioEdicaoOverlay}>
            <div style={styles.formularioEdicaoModal}>
              <div style={styles.formularioEdicaoHeader}>
                <h2 style={styles.formularioTitulo}>
                  {modoVisualizacao === "editar"
                    ? "✏️ Editar Despesa"
                    : "👁️ Visualizar Despesa"}
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
                  usuario={usuario}
                  onCancelar={handleFecharFormulario}
                  onSuccess={handleSucessoFormulario}
                  modoVisualizacao={modoVisualizacao === "visualizar"}
                  hideHeader={true}
                  tituloCustomizado={
                    modoVisualizacao === "editar"
                      ? "Editar Despesa"
                      : "Visualizar Despesa"
                  }
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div style={styles.container}>
        {/* Painel de Controle */}
        <div style={styles.painelControle}>
          <h2 style={styles.painelTitulo}>💰 Painel de Controle Financeiro</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>💼</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Valor da Emenda</div>
                <div style={styles.statValue}>
                  {formatCurrency(stats.valorEmenda)}
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📊</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Total Planejado</div>
                <div style={styles.statValue}>
                  {formatCurrency(stats.totalPlanejado)}
                </div>
                <div style={styles.statHint}>
                  ({despesasPlanejadas.length}{" "}
                  {despesasPlanejadas.length === 1 ? "despesa" : "despesas"})
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>💸</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Total Executado</div>
                <div style={styles.statValue}>
                  {formatCurrency(stats.totalExecutado)}
                </div>
                <div style={styles.statHint}>
                  ({despesasExecutadas.length}{" "}
                  {despesasExecutadas.length === 1 ? "despesa" : "despesas"})
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🎯</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Saldo Disponível</div>
                <div
                  style={{
                    ...styles.statValue,
                    color: saldoDisponivel < 0 ? "#dc3545" : "#28a745",
                  }}
                >
                  {formatCurrency(saldoDisponivel)}
                </div>
                <div style={styles.statHint}>
                  {saldoDisponivel < 0
                    ? "⚠️ Saldo negativo!"
                    : "✓ Saldo positivo"}
                </div>
              </div>
            </div>
          </div>

          {/* 🆕 Mini-cards: Breakdown por Status Financeiro */}
          <div style={styles.statusBreakdownContainer}>
            <div style={styles.statusBreakdownTitle}>
              Detalhamento por Status:
            </div>
            <div style={styles.statusMiniGrid}>
              {/* Pago */}
              <div style={{ ...styles.miniCard, ...styles.miniCardPago }}>
                <div style={styles.miniCardIcon}>✅</div>
                <div style={styles.miniCardContent}>
                  <div style={styles.miniCardLabel}>Pago</div>
                  <div style={styles.miniCardValue}>
                    {formatCurrency(stats.totalPago)}
                  </div>
                  <div style={styles.miniCardHint}>
                    {stats.qtdPago}{" "}
                    {stats.qtdPago === 1 ? "despesa" : "despesas"}
                  </div>
                </div>
              </div>

              {/* Liquidado */}
              <div style={{ ...styles.miniCard, ...styles.miniCardLiquidado }}>
                <div style={styles.miniCardIcon}>🟢</div>
                <div style={styles.miniCardContent}>
                  <div style={styles.miniCardLabel}>Liquidado</div>
                  <div style={styles.miniCardValue}>
                    {formatCurrency(stats.totalLiquidado)}
                  </div>
                  <div style={styles.miniCardHint}>
                    {stats.qtdLiquidado}{" "}
                    {stats.qtdLiquidado === 1 ? "despesa" : "despesas"}
                  </div>
                </div>
              </div>

              {/* Empenhado */}
              <div style={{ ...styles.miniCard, ...styles.miniCardEmpenhado }}>
                <div style={styles.miniCardIcon}>🔵</div>
                <div style={styles.miniCardContent}>
                  <div style={styles.miniCardLabel}>Empenhado</div>
                  <div style={styles.miniCardValue}>
                    {formatCurrency(stats.totalEmpenhado)}
                  </div>
                  <div style={styles.miniCardHint}>
                    {stats.qtdEmpenhado}{" "}
                    {stats.qtdEmpenhado === 1 ? "despesa" : "despesas"}
                  </div>
                </div>
              </div>

              {/* Pendente */}
              <div style={{ ...styles.miniCard, ...styles.miniCardPendente }}>
                <div style={styles.miniCardIcon}>⏳</div>
                <div style={styles.miniCardContent}>
                  <div style={styles.miniCardLabel}>Pendente</div>
                  <div style={styles.miniCardValue}>
                    {formatCurrency(stats.totalPendente)}
                  </div>
                  <div style={styles.miniCardHint}>
                    {stats.qtdPendente}{" "}
                    {stats.qtdPendente === 1 ? "despesa" : "despesas"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Planejamento */}
        <div style={styles.secao}>
          <div style={styles.secaoHeader}>
            <h3 style={styles.secaoTitulo}>🎯 Planejamento de Despesas</h3>
            <span style={styles.badge}>
              {despesasPlanejadas.length}{" "}
              {despesasPlanejadas.length === 1 ? "despesa" : "despesas"}
            </span>
          </div>

          {!temEmendaSalva ? (
            <div style={styles.emptyState}>
              <div style={{ textAlign: "center" }}>
                <div style={styles.emptyEmoji}>💡</div>
                <h4 style={styles.emptyTitle}>Salve a emenda primeiro</h4>
                <p style={styles.emptyText}>
                  Você precisa salvar a emenda antes de planejar despesas
                </p>
              </div>
            </div>
          ) : (
            <>
              <DespesaPlanejadaForm
                emendaId={emendaId}
                valorEmenda={stats.valorEmenda}
                totalExecutado={stats.totalExecutado}
                onSuccess={carregarDespesas}
                usuario={usuario}
              />

              {despesasPlanejadas.length === 0 && (
                <div style={styles.emptyState}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={styles.emptyEmoji}>📋</div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <h4 style={styles.emptyTitle}>
                          Nenhuma despesa planejada ainda
                        </h4>
                        <span
                          style={styles.infoIcon}
                          title="💡 As despesas planejadas NÃO consomem saldo. Use-as para organizar como pretende gastar a emenda antes de executar."
                        >
                          ℹ️
                        </span>
                      </div>
                      <p style={styles.emptyText}>
                        Comece adicionando uma despesa no formulário acima
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {despesasPlanejadas.length > 0 && (
                <div style={styles.tabelaWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.thead}>
                      <tr>
                        <th style={{ padding: "10px 8px", textAlign: "left" }}>
                          Natureza de Despesa
                        </th>
                        <th
                          style={{
                            padding: "10px 8px",
                            textAlign: "right",
                            width: 140,
                          }}
                        >
                          Valor Planejado
                        </th>
                        <th
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            width: 100,
                          }}
                        >
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody style={styles.tbody}>
                      {despesasPlanejadas.map((despesa, idx) => (
                        <tr
                          key={despesa.id}
                          style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                        >
                          <td style={styles.td}>
                            {despesa.estrategia || despesa.naturezaDespesa}
                          </td>
                          <td style={styles.tdValorPlanejado}>
                            {formatCurrency(despesa.valor)}
                          </td>
                          <td style={styles.td}>
                            <div style={styles.despesaAcoes}>
                              <button
                                onClick={() => handleExecutarDespesa(despesa)}
                                style={styles.btnIconExecutar}
                                title="Executar despesa"
                              >
                                ▶️
                              </button>
                              <button
                                onClick={() =>
                                  handleRemoverDespesaPlanejada(
                                    despesa.id,
                                    despesa.estrategia ||
                                      despesa.naturezaDespesa,
                                    despesa.valor,
                                  )
                                }
                                style={styles.btnIconRemover}
                                title="Remover despesa"
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
              )}
            </>
          )}
        </div>

        {/* Seção: Despesas Executadas */}
        <div style={styles.secao}>
          <div style={styles.secaoHeader}>
            <h3 style={styles.secaoTitulo}>💸 Despesas Executadas</h3>
            <span style={styles.badge}>
              {despesasExecutadas.length}{" "}
              {despesasExecutadas.length === 1 ? "despesa" : "despesas"}
            </span>
          </div>

          <DespesasList
            despesas={despesasExecutadas}
            emendas={[
              {
                id: emendaId,
                numero: formData?.numero || formData?.numeroEmenda,
                objeto: formData?.objeto,
              },
            ]}
            loading={loading}
            onEdit={handleEditarDespesa}
            onView={handleVisualizarDespesa}
            onRecarregar={carregarDespesas}
            ocultarBotaoNovo={true}
            exibirModoCards={true}
            ocultarBotoesAgrupamento={true}
          />
        </div>

        {/* ✅ MODAL USANDO DespesaForm COMPLETO (para executar despesa planejada) */}
        {modal.abrir && modal.despesa && createPortal(
          <div style={styles.formularioEdicaoOverlay}>
            <div style={styles.formularioEdicaoModal}>
              <div style={styles.formularioEdicaoHeader}>
                <h2 style={styles.formularioTitulo}>
                  ▶️ Executar Despesa Planejada
                </h2>
                <button onClick={closeModal} style={styles.btnVoltar}>
                  ✕ Fechar
                </button>
              </div>
              <div style={styles.formularioEdicaoContent}>
                <DespesaForm
                  despesaParaEditar={{
                    ...modal.despesa,
                    status: 'EXECUTADA',
                    discriminacao: modal.despesa.estrategia || modal.despesa.naturezaDespesa || '',
                  }}
                  emendaPreSelecionada={emendaId}
                  usuario={usuario}
                  onCancelar={closeModal}
                  onSuccess={async () => {
                    // Deletar despesa planejada após criar a executada
                    if (modal.despesa?.id) {
                      try {
                        await deleteDoc(doc(db, "despesas", modal.despesa.id));
                      } catch (error) {
                        console.error("Erro ao deletar despesa planejada:", error);
                      }
                    }
                    closeModal();
                    carregarDespesas();
                    showToast({
                      message: "✅ Despesa executada com sucesso!",
                      type: "success",
                    });
                  }}
                  hideHeader={true}
                  tituloCustomizado="Executar Despesa Planejada"
                />
              </div>
            </div>
          </div>,
          document.body
        )}

        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </div>
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    paddingBottom: 40,
  },
  loader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  spinner: {
    width: 48,
    height: 48,
    border: "4px solid #e9ecef",
    borderTop: "2px solid #334155",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  painelControle: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 11,
    borderBottom: "1px solid #e9ecef",
  },
  painelTitulo: {
    margin: "0 0 20px 0",
    color: "#154360",
    fontSize: 20,
    fontWeight: "bold",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    border: "1px solid #dee2e6",
  },
  statIcon: { fontSize: 20 },
  statContent: { display: "grid" },
  statLabel: { fontSize: 12, opacity: 0.8 },
  statValue: { fontSize: 18, fontWeight: 800 },
  statHint: { fontSize: 12, opacity: 0.6 },
  // 🆕 Estilos dos mini-cards de status
  statusBreakdownContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "2px solid #e9ecef",
  },
  statusBreakdownTitle: {
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
    maxWidth: 1200,
    maxHeight: "90vh",
    overflow: "auto",
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
