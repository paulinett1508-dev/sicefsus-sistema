// src/components/emenda/EmendaForm/sections/ExecucaoOrcamentaria.jsx
// ✅ REFATORADO:
//    - Estilo "CLEAN" aplicado: Fundo branco + acento amarelo

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
import {
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../../utils/formatters";
import { NATUREZAS_DESPESA } from "../../../../config/constants";

// ✅ COMPONENTES EXISTENTES REUTILIZADOS
import ExecutarDespesaModal from "./ExecutarDespesaModal";
import DespesasList from "../../../DespesasList";
// ✅ IMPORTAÇÃO DE ESTILOS GLOBAIS
import { despesaCardStyles } from "../../../despesa/DespesaCard/despesaCardStyles";

// 📝 COMPONENTE: FORMULÁRIO INLINE PARA DESPESA PLANEJADA
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
    const val = e.target.value;
    if (val === "__customizado__") {
      setModoCustomizado(true);
      setEstrategia("");
    } else {
      setModoCustomizado(false);
      setDespesaCustomizada("");
      setEstrategia(val);
    }
  };

  const handleValorChange = (e) => {
    const valorFormatado = formatarMoedaInput(e.target.value);
    setValor(valorFormatado);
  };

  const validarFormulario = () => {
    const estrategiaFinal = modoCustomizado ? despesaCustomizada : estrategia;
    if (!estrategiaFinal) {
      return { valido: false, mensagem: "⚠️ Preencha a Natureza de Despesa" };
    }
    if (!valor || parseValorMonetario(valor) <= 0) {
      return { valido: false, mensagem: "⚠️ O valor deve ser maior que zero" };
    }
    const valorNumerico = parseValorMonetario(valor);
    if (valorNumerico > saldoDisponivel) {
      return {
        valido: false,
        mensagem: `⚠️ Valor excede saldo disponível: R$ ${saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      };
    }
    return { valido: true };
  };

  const handleAdicionar = async () => {
    const validacao = validarFormulario();
    if (!validacao.valido) {
      alert(validacao.mensagem);
      return;
    }

    try {
      setSalvando(true);
      const estrategiaFinal = modoCustomizado ? despesaCustomizada : estrategia;

      await addDoc(collection(db, "despesas"), {
        emendaId: emendaId,
        estrategia: estrategiaFinal,
        naturezaDespesa: estrategiaFinal,
        valor: parseValorMonetario(valor),
        status: "PLANEJADA",
        criadaEm: new Date().toISOString(),
        criadaPor: usuario?.email,
        discriminacao: "",
        numeroEmpenho: "",
        numeroNota: "",
        numeroContrato: "",
        dataEmpenho: "",
        dataLiquidacao: "",
        dataPagamento: "",
      });

      // Limpar formulário
      setEstrategia("");
      setValor("");
      setModoCustomizado(false);
      setDespesaCustomizada("");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("❌ Erro ao criar despesa planejada:", error);
      alert("Erro ao criar despesa planejada");
    } finally {
      setSalvando(false);
    }
  };

  const validacao = validarFormulario();
  const podeAdicionar = validacao.valido && !salvando;

  return (
    <div style={formStyles.container}>
      <div style={formStyles.grid}>
        <div style={formStyles.formGroup}>
          <label style={formStyles.label}>Natureza de Despesa</label>
          {!modoCustomizado ? (
            <select
              value={estrategia}
              onChange={handleEstrategiaChange}
              style={formStyles.select}
            >
              <option value="">Selecione a natureza de despesas</option>
              {NATUREZAS_DESPESA.map((natureza) => (
                <option key={natureza} value={natureza}>
                  {natureza}
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
                style={formStyles.voltarButton}
                title="Voltar para seleção"
              >
                ↩️
              </button>
            </div>
          )}
        </div>

        <div style={formStyles.formGroup}>
          <label style={formStyles.labelRequired}>
            Valor <span style={formStyles.required}>*</span>
          </label>
          <input
            type="text"
            value={valor}
            onChange={handleValorChange}
            style={{
              ...formStyles.input,
              ...formStyles.inputMoney,
              ...(!validacao.valido && valor && formStyles.inputError),
            }}
            placeholder="R$ 0,00"
          />
          {!validacao.valido && valor && (
            <small style={formStyles.errorText}>{validacao.mensagem}</small>
          )}
        </div>

        <div style={formStyles.formGroupButton}>
          <label style={formStyles.labelInvisible}>Ação</label>
          <button
            type="button"
            onClick={handleAdicionar}
            disabled={!podeAdicionar}
            style={{
              ...formStyles.addButton,
              ...(!podeAdicionar && formStyles.addButtonDisabled),
            }}
          >
            {salvando ? "⏳ Salvando..." : "➕ Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// (Estilos para o formulário inline)
const formStyles = {
  container: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr auto",
    gap: "20px",
    alignItems: "end",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  formGroupButton: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontWeight: "600",
    color: "#333",
    fontSize: "13px",
    marginBottom: "2px",
  },
  labelRequired: {
    fontWeight: "600",
    color: "#333",
    fontSize: "13px",
    marginBottom: "2px",
  },
  labelInvisible: {
    fontWeight: "600",
    color: "transparent",
    fontSize: "13px",
    marginBottom: "2px",
    visibility: "hidden",
  },
  required: {
    color: "#dc3545",
  },
  select: {
    padding: "8px 12px",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
    height: "38px",
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
    height: "38px",
  },
  inputMoney: {
    fontWeight: "600",
    color: "#059669",
    textAlign: "right",
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "11px",
    marginTop: "2px",
    fontWeight: "500",
  },
  inputCustomizadoWrapper: {
    display: "flex",
    gap: "8px",
  },
  voltarButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
    height: "38px",
    whiteSpace: "nowrap",
  },
  addButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    height: "38px",
    whiteSpace: "nowrap",
  },
  addButtonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
    opacity: 0.6,
  },
};

// ==========================================================
// === COMPONENTE PRINCIPAL: ExecucaoOrcamentaria ===
// ==========================================================
const ExecucaoOrcamentaria = ({
  formData, // Dados da emenda atual
  onChange,
  fieldErrors,
  onClearError,
  usuario, // Usuário logado
}) => {
  // 🎯 ESTADOS
  const [despesasPlanejadas, setDespesasPlanejadas] = useState([]);
  const [despesasExecutadas, setDespesasExecutadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executandoDespesa, setExecutandoDespesa] = useState(null);
  const [criandoDespesaExecutada, setCriandoDespesaExecutada] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [emendaIdReal, setEmendaIdReal] = useState(null);

  // ✅ BUSCAR ID REAL DA EMENDA
  useEffect(() => {
    const buscarIdEmenda = async () => {
      if (formData?.id || formData?.emendaId) {
        setEmendaIdReal(formData.id || formData.emendaId);
        return;
      }

      if (!formData?.numero) {
        setEmendaIdReal(null);
        return;
      }

      try {
        const q = query(
          collection(db, "emendas"),
          where("numero", "==", formData.numero),
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setEmendaIdReal(snapshot.docs[0].id);
        }
      } catch (err) {
        console.error("❌ Erro ao buscar ID da emenda:", err);
      }
    };

    buscarIdEmenda();
  }, [formData?.id, formData?.emendaId, formData?.numero]);

  const emendaId = emendaIdReal || formData?.id || formData?.emendaId;
  const temEmendaSalva = !!emendaId;

  // ✅ CARREGAR DESPESAS (PLANEJADAS E EXECUTADAS)
  useEffect(() => {
    if (temEmendaSalva) {
      carregarDespesas();
    }
  }, [emendaId]);

  const carregarDespesas = async () => {
    if (!emendaId) {
      setDespesasPlanejadas([]);
      setDespesasExecutadas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const q = query(
        collection(db, "despesas"),
        where("emendaId", "==", emendaId),
      );

      const snapshot = await getDocs(q);
      const todasDespesas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ SEPARAR POR STATUS
      const planejadas = todasDespesas.filter((d) => d.status === "PLANEJADA");
      const executadas = todasDespesas.filter((d) => d.status !== "PLANEJADA");

      setDespesasPlanejadas(planejadas);
      setDespesasExecutadas(executadas);
    } catch (err) {
      console.error("❌ Erro ao carregar despesas:", err);
      setToast({
        show: true,
        message: "Erro ao carregar despesas",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 📊 CALCULAR ESTATÍSTICAS
  const calcularEstatisticas = () => {
    const valorEmenda = parseFloat(
      formData?.valorRecurso?.replace?.(/[^\d,]/g, "")?.replace(",", ".") || 0,
    );
    const totalPlanejado = despesasPlanejadas.reduce(
      (sum, d) => sum + (parseFloat(d.valor) || 0),
      0,
    );
    const totalExecutado = despesasExecutadas.reduce(
      (sum, d) => sum + (parseFloat(d.valor) || 0),
      0,
    );
    const saldoDisponivel = valorEmenda - totalExecutado;

    return {
      valorEmenda,
      totalPlanejado,
      totalExecutado,
      saldoDisponivel,
      percentualExecutado:
        valorEmenda > 0 ? (totalExecutado / valorEmenda) * 100 : 0,
    };
  };

  const stats = calcularEstatisticas();

  // 🎯 HANDLERS
  const handleExecutarDespesa = (despesa) => {
    setExecutandoDespesa(despesa);
  };

  const handleCriarDespesaExecutada = () => {
    setCriandoDespesaExecutada(true);
  };

  const handleCloseModal = () => {
    setExecutandoDespesa(null);
    setCriandoDespesaExecutada(false);
  };

  const handleConfirmarExecucao = async (dadosExecucao) => {
    try {
      if (executandoDespesa) {
        await updateDoc(doc(db, "despesas", executandoDespesa.id), {
          ...dadosExecucao,
          status: "EXECUTADA",
          executadaEm: new Date().toISOString(),
          executadoPor: usuario?.email,
        });
        setToast({
          show: true,
          message: "✅ Despesa executada com sucesso!",
          type: "success",
        });
      } else if (criandoDespesaExecutada) {
        await addDoc(collection(db, "despesas"), {
          ...dadosExecucao,
          emendaId: emendaId,
          status: "EXECUTADA",
          criadaEm: new Date().toISOString(),
          criadaPor: usuario?.email,
        });
        setToast({
          show: true,
          message: "✅ Despesa criada com sucesso!",
          type: "success",
        });
      }
      await carregarDespesas();
      handleCloseModal();
    } catch (error) {
      console.error("❌ Erro ao salvar despesa:", error);
      setToast({
        show: true,
        message: "Erro ao salvar despesa",
        type: "error",
      });
    }
  };

  const handleRemoverDespesaPlanejada = async (despesaId) => {
    if (!window.confirm("Deseja remover esta despesa planejada?")) return;

    try {
      await deleteDoc(doc(db, "despesas", despesaId));
      await carregarDespesas();
      setToast({
        show: true,
        message: "Despesa planejada removida",
        type: "success",
      });
    } catch (error) {
      console.error("❌ Erro ao remover despesa:", error);
      setToast({
        show: true,
        message: "Erro ao remover despesa",
        type: "error",
      });
    }
  };

  // 🚫 SE NÃO TEM ID DA EMENDA
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

  return (
    <div style={styles.container}>
      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* 📊 PAINEL DE CONTROLE */}
      <div style={styles.painelControle}>
        <h3 style={styles.painelTitulo}>📊 Painel de Controle Orçamentário</h3>
        <div style={styles.statsGrid}>
          {/* ... stats ... */}
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💵</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Valor da Emenda</div>
              <div style={styles.statValue}>
                {stats.valorEmenda.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Planejado</div>
              <div style={{ ...styles.statValue, color: "#f39c12" }}>
                {stats.totalPlanejado.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div style={styles.statHint}>Não consome saldo</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Executado</div>
              <div style={{ ...styles.statValue, color: "#e74c3c" }}>
                {stats.totalExecutado.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div style={styles.statHint}>
                {stats.percentualExecutado.toFixed(1)}% executado
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💚</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Saldo Disponível</div>
              <div style={{ ...styles.statValue, color: "#27ae60" }}>
                {stats.saldoDisponivel.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div style={styles.statHint}>Disponível para executar</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 SEÇÃO: PLANEJAMENTO */}
      <div style={styles.secao}>
        <div style={styles.secaoHeader}>
          <h3 style={styles.secaoTitulo}>🎯 Planejamento de Despesas</h3>
          <span style={styles.badge}>
            {despesasPlanejadas.length}{" "}
            {despesasPlanejadas.length === 1 ? "despesa" : "despesas"}
          </span>
        </div>

        {/* 📝 FORMULÁRIO INLINE PARA ADICIONAR DESPESA PLANEJADA */}
        <DespesaPlanejadaForm
          emendaId={emendaId}
          valorEmenda={stats.valorEmenda}
          totalExecutado={stats.totalExecutado}
          onSuccess={carregarDespesas}
          usuario={usuario}
        />

        {/* 📋 LISTA DE DESPESAS PLANEJADAS */}
        {despesasPlanejadas.length > 0 && (
          <div style={despesaCardStyles.despesasCardsGrid}>
            {despesasPlanejadas.map((despesa, index) => (
              // -------------------------------------------------
              // ✅ CORREÇÃO "CLEAN": Fundo branco + acento amarelo
              // -------------------------------------------------
              <div
                key={despesa.id}
                style={{
                  ...despesaCardStyles.despesaCard, // Base (branco, borda cinza)
                  borderLeft: "5px solid #ffc107", // ✅ ACENTO AMARELO
                  minHeight: "100px",
                  // ❌ Removido: backgroundColor e borderColor
                }}
              >
                <div style={styles.despesaContent}>
                  <div style={styles.despesaTopLine}>
                    <span style={despesaCardStyles.despesaNumero}>
                      #{index + 1}
                    </span>
                    <span style={despesaCardStyles.despesaStatusPlanejada}>
                      🟡 <strong>PLANEJADA</strong>
                    </span>
                  </div>
                  <div style={despesaCardStyles.despesaDescricao}>
                    {despesa.estrategia || despesa.naturezaDespesa}
                  </div>
                </div>

                <div style={styles.despesaAcoes}>
                  <div style={styles.despesaValorPlanejada}>
                    {parseFloat(despesa.valor || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecutarDespesa(despesa)}
                    style={styles.btnExecutar}
                    title="Executar despesa"
                  >
                    ▶️ Executar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoverDespesaPlanejada(despesa.id)}
                    style={styles.btnRemover}
                    title="Remover despesa"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 💸 SEÇÃO: DESPESAS EXECUTADAS */}
      <div style={styles.secao}>
        <div style={styles.secaoHeader}>
          <h3 style={styles.secaoTitulo}>💸 Despesas Executadas</h3>
          <button
            type="button"
            onClick={handleCriarDespesaExecutada}
            style={styles.btnNovaDespesa}
          >
            ➕ Nova Despesa Executada
          </button>
        </div>

        {/* ✅ REUTILIZAR COMPONENTE EXISTENTE DespesasList */}
        <DespesasList
          despesas={despesasExecutadas}
          emendas={[
            {
              id: emendaId,
              /* ...outras props da emenda... */
            },
          ]}
          loading={loading}
          error={null}
          onEdit={(despesa) => console.log("Editar:", despesa)}
          onView={(despesa) => console.log("Visualizar:", despesa)}
          onRecarregar={carregarDespesas}
          usuario={usuario}
          filtroInicial={{ emendaId: emendaId }}
          usarLayoutCards={true}
          // ✅ <DespesasList> agora usará o estilo "CLEAN"
          //    do 'despesaCardStyles.js' automaticamente.
        />
      </div>

      {/* 🔄 MODAL: EXECUTAR DESPESA */}
      {(executandoDespesa || criandoDespesaExecutada) && (
        <ExecutarDespesaModal
          despesa={executandoDespesa}
          emenda={{ id: emendaId, ...formData }}
          saldoDisponivel={stats.saldoDisponivel}
          onClose={handleCloseModal}
          onConfirm={handleConfirmarExecucao}
          usuario={usuario}
        />
      )}
    </div>
  );
};

// 🎨 ESTILOS (MANTIDOS E ENXUTOS)
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    paddingBottom: "80px",
  },
  alertBox: {
    display: "flex",
    gap: "12px",
    padding: "20px",
    backgroundColor: "#eff6ff",
    border: "2px solid #bfdbfe",
    borderRadius: "12px",
  },
  alertIcon: { fontSize: "32px" },
  alertTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e40af",
    margin: "0 0 8px 0",
  },
  alertText: { fontSize: "14px", color: "#3b82f6", margin: 0 },
  painelControle: {
    backgroundColor: "#fff",
    border: "2px solid #154360",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  painelTitulo: {
    margin: "0 0 20px 0",
    color: "#154360",
    fontSize: "20px",
    fontWeight: "bold",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  },
  statIcon: { fontSize: "32px" },
  statContent: { flex: 1 },
  statLabel: {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "4px",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  statValue: { fontSize: "18px", fontWeight: "bold", color: "#154360" },
  statHint: { fontSize: "11px", color: "#6c757d", marginTop: "2px" },
  secao: {
    backgroundColor: "#fff",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "20px",
  },
  secaoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e9ecef",
  },
  secaoTitulo: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#154360",
  },
  badge: {
    backgroundColor: "#154360",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  btnNovaDespesa: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Estilos mantidos pois são customizados para o card Planejado
  despesaContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
    justifyContent: "space-between",
  },
  despesaTopLine: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  despesaValorPlanejada: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#f39c12", // Cor do valor mantida (amarelo)
    textAlign: "right",
  },
  despesaAcoes: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-end",
  },
  btnExecutar: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  btnRemover: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default ExecucaoOrcamentaria;
