// src/components/emenda/EmendaForm/sections/ExecucaoOrcamentaria.jsx
// ✅ CORRIGIDO: DespesaForm não fecha mais automaticamente ao executar
// ✅ CORRIGIDO: Proteções contra fechamento acidental
// ✅ TODAS AS LÓGICAS ANTERIORES PRESERVADAS 100%

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
import { useLocation, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [emendaIdReal, setEmendaIdReal] = useState(null);

  // 🆕 Estados para edição/visualização/execução de despesa
  const [despesaEmEdicao, setDespesaEmEdicao] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState(null); // 'editar' | 'visualizar' | 'executar' | 'criar' | 'criar-executada' | null

  // ✅ RESOLVER ID - PRIORIZAR ID DIRETO (evitar consultas desnecessárias)
  useEffect(() => {
    // Prioridade absoluta: IDs diretos
    const idDireto = formData?.id || formData?.emendaId;
    
    if (idDireto) {
      console.log('✅ ExecucaoOrcamentaria - ID direto encontrado:', {
        id: idDireto,
        numero: formData?.numero,
        municipio: formData?.municipio
      });
      setEmendaIdReal(idDireto);
    } else {
      console.warn('⚠️ ExecucaoOrcamentaria - Nenhum ID encontrado:', {
        formDataKeys: formData ? Object.keys(formData) : [],
        numero: formData?.numero
      });
      setEmendaIdReal(null);
    }
  }, [formData?.id, formData?.emendaId]);

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
      const despesasCarregadas = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // ✅ ORDENAR por data de criação (mais recentes primeiro)
      despesasCarregadas.sort((a, b) => {
        const dataA = a.criadoEm?.seconds || a.criadaEm?.seconds || 0;
        const dataB = b.criadoEm?.seconds || b.criadaEm?.seconds || 0;
        return dataB - dataA; // DESC (mais recente primeiro)
      });

      setDespesas(despesasCarregadas);
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

  // 🔄 CARREGAR DESPESAS
  useEffect(() => {
    carregarDespesas();
  }, [emendaId]);

  // ✅ DETECTAR FLAG DE PRIMEIRA DESPESA (vindo do modal pós-criação)
  useEffect(() => {
    if (location.state?.criarPrimeiraDespesa && despesas.length === 0) {
      console.log("🎯 GESTOR: Abrindo modal de primeira despesa automaticamente");
      // Aguardar renderização completa
      setTimeout(() => {
        setModoVisualizacao("criar-executada"); // Abrir diretamente como criação executada
        setDespesaEmEdicao({
          status: 'EXECUTADA',
          emendaId: emendaId,
          discriminacao: '',
          valor: '',
          numeroEmenda: formData?.numero || '',
          municipio: formData?.municipio || '',
          uf: formData?.uf || '',
        });
        // Limpar state para não reabrir
        window.history.replaceState({}, document.title);
      }, 500);
    }
  }, [location.state, despesas.length, emendaId, formData?.numero, formData?.municipio, formData?.uf]);


  // ✅ CRÍTICO: Separação ESTRITA entre planejadas e executadas
  const despesasPlanejadas = despesas.filter((d) => d.status === "PLANEJADA");
  const despesasExecutadas = despesas.filter((d) => d.status !== "PLANEJADA");

  const valorEmendaParsed = (() => {
    const raw = formData?.valor || formData?.valorRecurso || 0;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string")
      return parseFloat(raw.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    return 0;
  })();

  // ✅ CORREÇÃO CRÍTICA: Despesas planejadas NÃO consomem saldo
  const stats = {
    valorEmenda: valorEmendaParsed,
    // 🟡 Planejadas: Apenas para visualização (não debitam)
    totalPlanejado: despesasPlanejadas.reduce(
      (acc, d) => acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
      0,
    ),
    // 💸 Executadas: SOMENTE estas consomem o saldo
    totalExecutado: despesasExecutadas.reduce(
      (acc, d) => acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
      0,
    ),
    // ✅ Cada status é EXCLUSIVO (uma despesa só pode estar em 1 status)
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
      .filter((d) => !d.statusPagamento || d.statusPagamento === "pendente")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
  };

  // ✅ Cálculos derivados (mantidos intactos)
  stats.saldoDisponivel = stats.valorEmenda - stats.totalExecutado;
  stats.percentualExecutado =
    (stats.totalExecutado / stats.valorEmenda) * 100 || 0;

  const showToast = (config) => {
    setToast({ show: true, ...config });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleEditarDespesa = (despesa) => {
    console.log(
      "✏️ ExecucaoOrcamentaria: Abrindo DespesaForm para EDIÇÃO",
      despesa,
    );
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("editar");
  };

  const handleVisualizarDespesa = (despesa) => {
    console.log(
      "👁️ ExecucaoOrcamentaria: Abrindo DespesaForm para VISUALIZAÇÃO",
      despesa,
    );
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("visualizar");
  };

  // ✅ Handler para executar despesa planejada (validação de saldo ocorre no salvamento)
  const handleExecutarDespesa = (despesa) => {
    console.log("▶️ ExecucaoOrcamentaria: Executando despesa planejada", {
      id: despesa.id,
      estrategia: despesa.estrategia,
      valor: despesa.valor,
    });

    console.log("✅ Abrindo DespesaForm para EXECUTAR (pré-preenchido)");
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("executar");
  };

  // ✅ Handler para fechar formulário (COM PROTEÇÃO)
  const handleFecharFormulario = (foiSalvoComSucesso = false) => {
    console.log(
      "🚪 Tentando fechar - Modo:",
      modoVisualizacao,
      "| Salvou?",
      foiSalvoComSucesso,
    );

    // ✅ PROTEÇÃO: Só confirmar cancelamento se NÃO foi salvo com sucesso
    if (modoVisualizacao === "executar" && !foiSalvoComSucesso) {
      const confirmacao = window.confirm(
        "⚠️ Cancelar execução?\n\n" +
          "Dados não salvos serão perdidos.",
      );

      if (!confirmacao) {
        console.log("❌ Fechamento cancelado pelo usuário");
        return; // NÃO FECHA
      }
    }

    console.log("✅ Fechando formulário");
    setDespesaEmEdicao(null);
    setModoVisualizacao(null);
    carregarDespesas();
  };

  const handleRemoverDespesaPlanejada = async (id, estrategia, valor) => {
    if (
      !window.confirm(
        `⚠️ Confirma remoção?\n\n` +
          `Estratégia: ${estrategia}\n` +
          `Valor: ${formatCurrency(valor)}\n\n` +
          `Esta ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "despesas", id));
      showToast({
        message: "🗑️ Despesa planejada removida",
        type: "success",
      });
      carregarDespesas();
    } catch (e) {
      console.error(e);
      showToast({
        message: "❌ Erro ao remover despesa",
        type: "error",
      });
    }
  };

  // ✅ PROTEÇÃO: Rastrear mudanças de estado
  useEffect(() => {
    console.log("🔄 ExecucaoOrcamentaria - Estado mudou:", {
      despesaEmEdicao: despesaEmEdicao?.id || null,
      modoVisualizacao,
      timestamp: new Date().toISOString(),
    });

    if (modoVisualizacao === "executar" && despesaEmEdicao) {
      console.log("🔒 Modo execução ATIVO - estado protegido");
    }
  }, [despesaEmEdicao, modoVisualizacao]);


  // Verificar se a emenda está salva
  // Verifica tanto emendaId (criação) quanto formData.id (edição)
  const emendaSalvaId = emendaId || formData?.id;

  console.log('🔍 ExecucaoOrcamentaria - IDs:', {
    emendaId,
    formDataId: formData?.id,
    emendaSalvaId,
    numeroEmenda: formData?.numeroEmenda
  });

  // ✅ LOG DETALHADO DE PERMISSÕES GESTOR
  console.log('👤 ExecucaoOrcamentaria - Usuário:', {
    email: usuario?.email,
    tipo: usuario?.tipo,
    role: usuario?.role,
    municipio: usuario?.municipio,
    uf: usuario?.uf,
    timestamp: new Date().toISOString()
  });

  if (!emendaSalvaId) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 24px',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }}>💾</div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
          Salve a emenda primeiro
        </h3>
        <p style={{ fontSize: '14px', color: '#999' }}>
          Para gerenciar despesas, salve a emenda antes de continuar.
        </p>
      </div>
    );
  }


  return (
    <div style={styles.container}>
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      {/* Estatísticas principais */}
      <div style={styles.statsWrapper}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>💰 Valor da Emenda</div>
          <div style={styles.statValue}>
            {formatCurrency(stats.valorEmenda)}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>🟡 Total Planejado</div>
          <div style={{ ...styles.statValue, color: "#f39c12" }}>
            {formatCurrency(stats.totalPlanejado)}
          </div>
          <div style={styles.statHint}>não consome saldo</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>🟢 Total Executado</div>
          <div style={{ ...styles.statValue, color: "#27ae60" }}>
            {formatCurrency(stats.totalExecutado)}
          </div>
          <div style={styles.statHint}>consome saldo</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>💵 Saldo Disponível</div>
          <div
            style={{
              ...styles.statValue,
              color:
                stats.saldoDisponivel < 0
                  ? "#e74c3c"
                  : stats.saldoDisponivel === 0
                    ? "#95a5a6"
                    : "#27ae60",
            }}
          >
            {formatCurrency(stats.saldoDisponivel)}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>📊 Percentual Executado</div>
          <div style={styles.statValue}>
            {stats.percentualExecutado.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 🆕 Mini-cards de status financeiro */}
      <div style={styles.statusFinanceiroWrapper}>
        <h4 style={styles.statusFinanceiroTitulo}>Status Financeiro</h4>
        <div style={styles.statusMiniGrid}>
          <div style={{ ...styles.miniCard, ...styles.miniCardPago }}>
            <div style={styles.miniCardIcon}>💵</div>
            <div style={styles.miniCardContent}>
              <div style={styles.miniCardLabel}>Pago</div>
              <div style={styles.miniCardValue}>
                {formatCurrency(stats.totalPago)}
              </div>
              <div style={styles.miniCardHint}>✅ Concluído</div>
            </div>
          </div>
          <div style={{ ...styles.miniCard, ...styles.miniCardLiquidado }}>
            <div style={styles.miniCardIcon}>📝</div>
            <div style={styles.miniCardContent}>
              <div style={styles.miniCardLabel}>Liquidado</div>
              <div style={styles.miniCardValue}>
                {formatCurrency(stats.totalLiquidado)}
              </div>
              <div style={styles.miniCardHint}>⏳ Aguardando pagamento</div>
            </div>
          </div>
          <div style={{ ...styles.miniCard, ...styles.miniCardEmpenhado }}>
            <div style={styles.miniCardIcon}>📋</div>
            <div style={styles.miniCardContent}>
              <div style={styles.miniCardLabel}>Empenhado</div>
              <div style={styles.miniCardValue}>
                {formatCurrency(stats.totalEmpenhado)}
              </div>
              <div style={styles.miniCardHint}>⏳ Aguardando liquidação</div>
            </div>
          </div>
          <div style={{ ...styles.miniCard, ...styles.miniCardPendente }}>
            <div style={styles.miniCardIcon}>⏰</div>
            <div style={styles.miniCardContent}>
              <div style={styles.miniCardLabel}>Pendente</div>
              <div style={styles.miniCardValue}>
                {formatCurrency(stats.totalPendente)}
              </div>
              <div style={styles.miniCardHint}>⏳ Aguardando empenho</div>
            </div>
          </div>
        </div>
      </div>



      {/* Seção: Despesas Planejadas */}
      <div style={styles.secao}>
        <div style={styles.secaoHeader}>
          <h3 style={styles.secaoTitulo}>
            🟡 Planejar Despesas{" "}
            <span
              style={styles.infoIcon}
              title="Despesas planejadas não consomem o saldo da emenda"
            >
              ℹ️
            </span>
          </h3>
          <span style={styles.badge}>
            {despesasPlanejadas.length}{" "}
            {despesasPlanejadas.length === 1 ? "despesa" : "despesas"}
          </span>
        </div>

        {temEmendaSalva && (
          <>
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
                  <div style={styles.emptyEmoji}>🎯</div>
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
                      <th style={{ padding: "12px 8px", textAlign: "left" }}>
                        NATUREZA DA DESPESA
                      </th>
                      <th style={{ padding: "12px 8px", textAlign: "right" }}>
                        VALOR
                      </th>
                      <th
                        style={{
                          padding: "12px 8px",
                          textAlign: "center",
                          width: 120,
                        }}
                      >
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
          </>
        )}
      </div>

      {/* Seção: Despesas Executadas */}
      <div style={styles.secao}>
        <div style={styles.secaoHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h3 style={styles.secaoTitulo}>💸 Despesas Executadas</h3>
            <span style={styles.badge}>
              {despesasExecutadas.length}{" "}
              {despesasExecutadas.length === 1 ? "despesa" : "despesas"}
            </span>
          </div>
          <button
            onClick={() => {
              console.log("🆕 Abrindo formulário para criar despesa executada diretamente");
              console.log("📋 Usuário completo:", {
                tipo: usuario?.tipo,
                role: usuario?.role,
                email: usuario?.email,
                municipio: usuario?.municipio,
                uf: usuario?.uf
              });
              console.log("📋 Emenda ID:", emendaId);
              console.log("📋 Form Data:", {
                numero: formData?.numero,
                municipio: formData?.municipio,
                uf: formData?.uf,
                valorRecurso: formData?.valorRecurso
              });

              // ✅ VALIDAÇÃO AMPLIADA: Verificar tipo e role
              const isAdmin = usuario?.tipo === "admin" || usuario?.role === "admin";
              const isGestor = usuario?.tipo === "gestor" || usuario?.role === "gestor";

              console.log("🔐 Verificação de permissões:", {
                isAdmin,
                isGestor,
                tipoOriginal: usuario?.tipo,
                roleOriginal: usuario?.role
              });

              if (!isAdmin && !isGestor) {
                console.error("❌ ACESSO NEGADO - Tipo:", usuario?.tipo, "| Role:", usuario?.role);
                alert("⚠️ Apenas Administradores e Gestores podem criar despesas executadas.");
                return;
              }

              // ✅ VALIDAÇÃO: Verificar se tem município/UF
              if (isGestor && (!usuario?.municipio || !usuario?.uf)) {
                console.error("❌ GESTOR SEM LOCALIZAÇÃO:", {
                  municipio: usuario?.municipio,
                  uf: usuario?.uf
                });
                alert("⚠️ Gestor precisa ter município/UF configurados para criar despesas.");
                return;
              }

              // ✅ CORREÇÃO: Criar objeto de despesa com TODOS os campos necessários
              const novaDespesa = {
                status: 'EXECUTADA',
                emendaId: emendaId,
                discriminacao: '',
                valor: '',
                numeroEmenda: formData?.numero || '',
                municipio: formData?.municipio || usuario?.municipio || '',
                uf: formData?.uf || usuario?.uf || '',
                criadoPor: usuario?.email || '',
                tipoUsuario: usuario?.tipo || usuario?.role || '',
              };

              console.log("✅ Despesa pré-configurada:", novaDespesa);

              setDespesaEmEdicao(novaDespesa);
              setModoVisualizacao("criar-executada");

              console.log("✅ Modal configurado - Modo: criar-executada | Usuário:", usuario?.tipo || usuario?.role);
            }}
            style={styles.btnNovaDespesa}
            title="Criar despesa executada"
          >
            ➕ Nova Despesa
          </button>
        </div>

        <DespesasList
          despesas={despesasExecutadas}
          emendas={[]}
          loading={loading}
          onEdit={handleEditarDespesa}
          onView={handleVisualizarDespesa}
          onRecarregar={carregarDespesas}
          ocultarBotaoNovo={true}
          exibirModoCards={true}
        />
      </div>

      {/* ✅ FORMULÁRIO UNIVERSAL: Edição | Visualização | Execução | Criação Direta */}
      {modoVisualizacao &&
        createPortal(
          <div
            style={styles.formularioEdicaoOverlay}
            onClick={(e) => {
              // ✅ BLOQUEAR fechamento ao clicar fora em modo execução ou criação
              if (
                e.target === e.currentTarget &&
                (modoVisualizacao === "executar" || modoVisualizacao === "criar" || modoVisualizacao === "criar-executada")
              ) {
                console.log("⚠️ Clique fora bloqueado - modo ativo:", modoVisualizacao);
                e.stopPropagation();
                return;
              }

              // Permitir fechar clicando fora em outros modos
              if (e.target === e.currentTarget) {
                handleFecharFormulario();
              }
            }}
          >
            <div style={styles.formularioEdicaoModal}>
              <div style={styles.formularioEdicaoHeader}>
                <h2 style={styles.formularioTitulo}>
                  {modoVisualizacao === "editar" && "📋 Informações da Despesa"}
                  {modoVisualizacao === "visualizar" && "📋 Informações da Despesa"}
                  {modoVisualizacao === "executar" && "▶️ Executar Despesa Planejada"}
                  {modoVisualizacao === "criar" && "➕ Nova Despesa"}
                  {modoVisualizacao === "criar-executada" && "➕ Nova Despesa Executada"}
                </h2>
                <button
                  onClick={() => {
                    console.log(
                      "🔘 Botão Voltar clicado - Modo:",
                      modoVisualizacao,
                    );
                    handleFecharFormulario();
                  }}
                  style={styles.btnVoltar}
                >
                  ← Voltar
                </button>
              </div>
              <div style={styles.formularioEdicaoContent}>
                <DespesaForm
                  usuario={usuario}
                  despesaParaEditar={modoVisualizacao === "criar" ? null : despesaEmEdicao}
                  emendaId={emendaId}
                  somenteLeitura={modoVisualizacao === "visualizar"}
                  modoExecucao={modoVisualizacao === "executar"} // 🔑 Flag especial
                  modoCriacaoDireta={modoVisualizacao === "criar-executada"}
                  emendaInfo={{
                    id: emendaId,
                    numero: formData?.numero,
                    municipio: formData?.municipio,
                    uf: formData?.uf,
                    autor: formData?.autor,
                    valor: stats.valorEmenda,
                  }}
                  onClose={() => {
                    console.log("📞 DespesaForm.onClose chamado");
                    handleFecharFormulario();
                  }}
                  onSuccess={() => {
                    console.log(
                      "📞 DespesaForm.onSuccess chamado - Modo:",
                      modoVisualizacao,
                    );
                    handleFecharFormulario(true); // ✅ Passa true = foi salvo com sucesso
                    showToast({
                      message:
                        modoVisualizacao === "executar"
                          ? "✅ Despesa executada com sucesso!"
                          : modoVisualizacao === "criar-executada"
                            ? "✅ Despesa criada com sucesso!"
                            : modoVisualizacao === "criar"
                              ? "✅ Despesa criada com sucesso!"
                              : "✅ Despesa atualizada com sucesso!",
                      type: "success",
                    });
                  }}
                  onSave={() => {
                    console.log(
                      "📞 DespesaForm.onSave chamado - Modo:",
                      modoVisualizacao,
                    );
                    handleFecharFormulario(true); // ✅ Passa true = foi salvo com sucesso
                    showToast({
                      message:
                        modoVisualizacao === "executar"
                          ? "✅ Despesa executada com sucesso!"
                          : modoVisualizacao === "criar-executada"
                            ? "✅ Despesa criada com sucesso!"
                            : modoVisualizacao === "criar"
                              ? "✅ Despesa criada com sucesso!"
                              : "✅ Despesa atualizada com sucesso!",
                      type: "success",
                    });
                  }}
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
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  btnNovaDespesa: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(13, 110, 253, 0.3)",
    whiteSpace: "nowrap",
  },
  statsWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#6c757d",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#154360",
    fontFamily: "monospace",
  },
  statHint: { fontSize: 11, color: "#adb5bd", marginTop: 4 },
  statusFinanceiroWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
  },
  statusFinanceiroTitulo: {
    margin: "0 0 12px 0",
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
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