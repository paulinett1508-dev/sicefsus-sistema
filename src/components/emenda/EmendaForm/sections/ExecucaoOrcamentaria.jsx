// src/components/emenda/EmendaForm/sections/ExecucaoOrcamentaria.jsx
// 🎯 COMPONENTE UNIFICADO: Planejamento + Despesas em uma única aba
// ✅ PRESERVA 100% DOS CAMPOS EXISTENTES
// 🔄 Implementa sistema de status: PLANEJADA → EXECUTADA

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

// ✅ COMPONENTES EXISTENTES REUTILIZADOS
import ExecutarDespesaModal from "./ExecutarDespesaModal";
import DespesasList from "../../../DespesasList";
import DespesasStats from "../../../despesa/DespesasStats";
import Toast from "../../../Toast";

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

      console.log(
        `✅ Carregadas ${planejadas.length} planejadas + ${executadas.length} executadas`,
      );
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

    // Total planejado (NÃO consome saldo)
    const totalPlanejado = despesasPlanejadas.reduce(
      (sum, d) => sum + (parseFloat(d.valor) || 0),
      0,
    );

    // Total executado (CONSOME saldo)
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
      // ✅ Atualizar despesa planejada para executada
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
      }
      // ✅ Criar nova despesa executada direto
      else if (criandoDespesaExecutada) {
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

        {/* 📋 LISTA DE DESPESAS PLANEJADAS */}
        {despesasPlanejadas.length > 0 && (
          <div style={styles.listaPlanejadas}>
            <h4 style={styles.listaTitle}>📋 Despesas Planejadas</h4>
            {despesasPlanejadas.map((despesa, index) => (
              <div key={despesa.id} style={styles.despesaCardPlanejada}>
                <div style={styles.despesaStatusPlanejada}>🟡 PLANEJADA</div>
                <div style={styles.despesaContent}>
                  <div style={styles.despesaTopLine}>
                    <span style={styles.despesaNumero}>#{index + 1}</span>
                    <span style={styles.despesaDescricao}>
                      {despesa.estrategia || despesa.naturezaDespesa}
                    </span>
                    <span style={styles.despesaValorPlanejada}>
                      {parseFloat(despesa.valor || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>
                <div style={styles.despesaAcoes}>
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
              numero: formData?.numero,
              valorRecurso: formData?.valorRecurso,
              municipio: formData?.municipio,
              uf: formData?.uf,
              autor: formData?.autor,
            },
          ]}
          loading={loading}
          error={null}
          onEdit={(despesa) => console.log("Editar:", despesa)}
          onView={(despesa) => console.log("Visualizar:", despesa)}
          onRecarregar={carregarDespesas}
          usuario={usuario}
          filtroInicial={{
            emendaId: emendaId,
          }}
          usarLayoutCards={true}
        />
      </div>

      {/* 🔄 MODAL: EXECUTAR DESPESA */}
      {(executandoDespesa || criandoDespesaExecutada) && (
        <ExecutarDespesaModal
          despesa={executandoDespesa}
          emenda={{
            id: emendaId,
            ...formData,
          }}
          saldoDisponivel={stats.saldoDisponivel}
          onClose={handleCloseModal}
          onConfirm={handleConfirmarExecucao}
          usuario={usuario}
        />
      )}
    </div>
  );
};

// 🎨 ESTILOS
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  alertBox: {
    display: "flex",
    gap: "12px",
    padding: "20px",
    backgroundColor: "#eff6ff",
    border: "2px solid #bfdbfe",
    borderRadius: "12px",
  },

  alertIcon: {
    fontSize: "32px",
  },

  alertTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e40af",
    margin: "0 0 8px 0",
  },

  alertText: {
    fontSize: "14px",
    color: "#3b82f6",
    margin: 0,
  },

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

  statIcon: {
    fontSize: "32px",
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "4px",
    textTransform: "uppercase",
    fontWeight: "600",
  },

  statValue: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#154360",
  },

  statHint: {
    fontSize: "11px",
    color: "#6c757d",
    marginTop: "2px",
  },

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

  listaPlanejadas: {
    marginTop: "20px",
  },

  listaTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "12px",
  },

  // ✅ ESTILO PADRONIZADO PARA DESPESAS PLANEJADAS (amarelo)
  despesaCardPlanejada: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#fff9e6",
    border: "2px solid #ffc107",
    borderLeft: "6px solid #ffc107",
    borderRadius: "8px",
    marginBottom: "12px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(255, 193, 7, 0.1)",
  },

  despesaStatusPlanejada: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#856404",
    backgroundColor: "#fff3cd",
    padding: "6px 12px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },

  despesaContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },

  despesaTopLine: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  despesaNumero: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6c757d",
    minWidth: "32px",
  },

  despesaDescricao: {
    fontSize: "14px",
    color: "#495057",
    flex: 1,
    fontWeight: "500",
  },

  despesaValorPlanejada: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#f39c12",
    minWidth: "120px",
    textAlign: "right",
  },

  despesaAcoes: {
    display: "flex",
    gap: "8px",
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
