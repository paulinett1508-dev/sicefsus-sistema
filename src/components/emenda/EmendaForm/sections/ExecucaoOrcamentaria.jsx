// src/components/emenda/EmendaForm/sections/ExecucaoOrcamentaria.jsx
// Alterações: padronização visual dos botões (Executar/Remover) e confirmação detalhada ao remover.
// Lógica preservada.

import React, { useState, useEffect } from "react";
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
            style={{ ...styles.btn, ...styles.btnPrimary }}
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
    totalExecutado: despesasExecutadas.reduce(
      (acc, d) => acc + Number(d.valor || 0),
      0,
    ),
  };
  const saldoDisponivel = stats.valorEmenda - stats.totalExecutado;

  const handleExecutarDespesa = (despesa) => setModal({ abrir: true, despesa });
  const closeModal = () => setModal({ abrir: false, despesa: null });

  const handleRemoverDespesaPlanejada = async (id, descricao, valor) => {
    const confirma = window.confirm(
      `Remover a despesa planejada\n\n${descricao}\nValor: ${formatCurrency(valor)}\n\nEssa ação não pode ser desfeita. Continuar?`,
    );
    if (!confirma) return;
    try {
      await deleteDoc(doc(db, "despesas", id));
      carregarDespesas();
    } catch (e) {
      console.error(e);
      alert("Erro ao remover despesa.");
    }
  };

  if (!temEmendaSalva) {
    return (
      <div style={styles.container}>
        <div style={styles.alertBox}>
          <div style={styles.alertIcon}>ℹ️</div>
          <div>
            <h3 style={styles.alertTitle}>Salve a emenda primeiro</h3>
            <p style={styles.alertText}>
              Para gerenciar a execução orçamentária, você precisa salvar a
              emenda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div style={styles.loadingBox}>
        <div style={styles.loadingSpinner} />
        Carregando...
      </div>
    );

  return (
    <div style={styles.container}>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* Totais (sticky) */}
      <div style={styles.painelControle}>
        <h3 style={styles.painelTitulo}>📊 Painel de Controle Orçamentário</h3>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💵</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Valor da Emenda</div>
              <div style={styles.statValue}>
                {formatCurrency(stats.valorEmenda)}
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Planejado</div>
              <div style={{ ...styles.statValue, color: "#f39c12" }}>
                {formatCurrency(stats.totalPlanejado)}
              </div>
              <div style={styles.statHint}>Não consome saldo</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Executado</div>
              <div style={{ ...styles.statValue, color: "#2ecc71" }}>
                {formatCurrency(stats.totalExecutado)}
              </div>
              <div style={styles.statHint}>Impacta saldo</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💼</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Saldo Disponível</div>
              <div style={{ ...styles.statValue, color: "#154360" }}>
                {formatCurrency(saldoDisponivel)}
              </div>
              <div style={styles.statHint}>Disponível para executar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Planejamento */}
      <div style={styles.secao}>
        <div style={styles.secaoHeader}>
          <h3 style={styles.secaoTitulo}>🎯 Planejamento de Despesas</h3>
          <span style={styles.badge}>
            {despesasPlanejadas.length}{" "}
            {despesasPlanejadas.length === 1 ? "despesa" : "despesas"}
          </span>
        </div>

        <DespesaPlanejadaForm
          emendaId={emendaId}
          valorEmenda={stats.valorEmenda}
          totalExecutado={stats.totalExecutado}
          onSuccess={carregarDespesas}
          usuario={usuario}
        />

        {despesasPlanejadas.length === 0 && (
          <div style={styles.emptyState}>
            <div>
              <div style={styles.emptyEmoji}>🗂️</div>
              <h4 style={styles.emptyTitle}>Nenhuma despesa planejada ainda</h4>
              <p style={styles.emptyText}>
                Adicione uma despesa informando a <strong>Natureza</strong> e o{" "}
                <strong>Valor</strong>. As despesas planejadas <em>não</em>{" "}
                consomem o recurso da emenda — apenas após “Executar”.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("naturezaDespesaSelect");
                if (el) {
                  try {
                    el.focus();
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  } catch {}
                }
              }}
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              ➕ Adicionar despesa
            </button>
          </div>
        )}

        {despesasPlanejadas.length > 0 && (
          <div style={styles.tabelaWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Natureza</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Valor Planejado
                  </th>
                  <th style={{ ...styles.th, textAlign: "center", width: 140 }}>
                    Status
                  </th>
                  <th style={{ ...styles.th, textAlign: "center", width: 80 }}>
                    AÇÕES
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
                      <span
                        style={{
                          background: "#fff7e6",
                          border: "1px solid #ffe58f",
                          padding: "3px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                        }}
                      >
                        🟡 <strong>PLANEJADA</strong>
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={styles.despesaAcoes}>
                        <button
                          type="button"
                          onClick={() => handleExecutarDespesa(despesa)}
                          style={styles.btnIconExecutar}
                          title="Executar despesa"
                        >
                          ▶️
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoverDespesaPlanejada(
                              despesa.id,
                              despesa.estrategia || despesa.naturezaDespesa,
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
      </div>

      {/* Executadas — componente existente */}
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
              numero: formData?.numero,
              valorRecurso: formData?.valorRecurso,
              municipio: formData?.municipio,
              uf: formData?.uf,
              autor: formData?.autor,
              // O objeto da emenda é buscado aqui
              tipo: formData?.tipo,
            },
          ]}
          loading={loading}
          error={null}
          onEdit={() => {}}
          onView={() => {}}
          onRecarregar={carregarDespesas}
          usuario={usuario}
          filtroInicial={{ emendaId }}
          usarLayoutCards={false}
        />
      </div>

      {/* Modal de execução */}
      {modal.abrir && (
        <div style={modalStyles.backdrop}>
          <div style={modalStyles.modal}>
            <h3 style={modalStyles.title}>Executar Despesa</h3>
            <p style={modalStyles.text}>
              Confirma a execução da despesa{" "}
              <strong>{modal.despesa?.estrategia}</strong> no valor de{" "}
              <strong>{formatCurrency(modal.despesa?.valor)}</strong>?
            </p>
            <div style={modalStyles.actions}>
              <button
                onClick={closeModal}
                style={{ ...styles.btn, ...styles.btnSecondary }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, "despesas", modal.despesa.id), {
                      status: "EXECUTADA",
                      executadaEm: new Date().toISOString(),
                      executadoPor: usuario?.email,
                    });
                    setToast({
                      show: true,
                      message: "✅ Despesa executada",
                      type: "success",
                    });
                    closeModal();
                    carregarDespesas();
                  } catch (e) {
                    console.error(e);
                    alert("Erro ao executar.");
                  }
                }}
                style={{ ...styles.btn, ...styles.btnPrimary }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos (padronização de botões incluída)
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    paddingBottom: 80,
  },
  alertBox: {
    display: "flex",
    gap: 12,
    padding: 20,
    backgroundColor: "#eff6ff",
    border: "2px solid #bfdbfe",
    borderRadius: 12,
  },
  alertIcon: { fontSize: 32 },
  alertTitle: { margin: 0 },
  alertText: { margin: 0, opacity: 0.8 },
  loadingBox: { display: "flex", alignItems: "center", gap: 12, padding: 12 },
  loadingSpinner: {
    width: 14,
    height: 14,
    border: "2px solid #e2e8f0",
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
  // Botões padronizados
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
  // Empty state
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

const modalStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },
  modal: {
    width: "min(560px, 92vw)",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    padding: 24,
  },
  title: { marginTop: 0 },
  text: { opacity: 0.85 },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 16,
  },
};

export default ExecucaoOrcamentaria;