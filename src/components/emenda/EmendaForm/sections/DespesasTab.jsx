// src/components/emenda/EmendaForm/sections/DespesasTab.jsx
// ✅ Aba de Despesas COMPLETA - Reutiliza TODO o módulo Despesas existente
// 🎯 Adaptado para funcionar dentro do contexto de uma emenda específica
// 🔧 DEBUG: Adicionados logs extremos e prevenção de navegação

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";

// ✅ IMPORTAR COMPONENTES EXISTENTES DO MÓDULO DESPESAS
import DespesaForm from "../../../DespesaForm";
import DespesasList from "../../../DespesasList";
import DespesasStats from "../../../despesa/DespesasStats";
import Toast from "../../../Toast";

const DespesasTab = ({
  formData, // Dados da emenda atual
  onChange,
  fieldErrors,
  onClearError,
  usuario, // Usuário logado
}) => {
  // 🎯 ESTADOS
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("listagem"); // 'listagem', 'criar', 'editar', 'visualizar'
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [emendaIdReal, setEmendaIdReal] = useState(null); // ✅ ID real da emenda

  // 🔍 BUSCAR ID DA EMENDA SE NÃO VIER NO FORMDATA
  useEffect(() => {
    const buscarIdEmenda = async () => {
      // Se já tem ID, não precisa buscar
      if (formData?.id || formData?.emendaId) {
        setEmendaIdReal(formData.id || formData.emendaId);
        return;
      }

      // Se não tem número, não pode buscar
      if (!formData?.numero) {
        setEmendaIdReal(null);
        return;
      }

      try {
        console.log("🔍 Buscando ID da emenda pelo número:", formData.numero);

        const q = query(
          collection(db, "emendas"),
          where("numero", "==", formData.numero),
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const emendaDoc = snapshot.docs[0];
          const idEncontrado = emendaDoc.id;
          setEmendaIdReal(idEncontrado);
          console.log("✅ ID da emenda encontrado:", idEncontrado);
        } else {
          console.warn("⚠️ Emenda não encontrada com número:", formData.numero);
          setEmendaIdReal(null);
        }
      } catch (err) {
        console.error("❌ Erro ao buscar ID da emenda:", err);
        setEmendaIdReal(null);
      }
    };

    buscarIdEmenda();
  }, [formData?.id, formData?.emendaId, formData?.numero]);

  // 💰 Objeto emenda montado a partir do formData
  const emenda = {
    id: emendaIdReal || formData?.id || formData?.emendaId,
    numero: formData?.numero,
    valorRecurso: formData?.valorRecurso,
    municipio: formData?.municipio,
    uf: formData?.uf,
    autor: formData?.autor,
    acoesServicos: formData?.acoesServicos || [],
  };

  // ✅ Verificar se tem identificador válido
  const emendaId = emenda.id;
  const temEmendaSalva = !!emendaId;

  // ✅ Array com apenas a emenda atual (para compatibilidade com componentes)
  const emendas = temEmendaSalva ? [emenda] : [];

  // Debug - ver o que está chegando
  useEffect(() => {
    console.log("🔍 DespesasTab - formData recebido:", {
      id: formData?.id,
      emendaId: formData?.emendaId,
      emendaIdReal: emendaIdReal,
      numero: formData?.numero,
      hasId: temEmendaSalva,
      formDataKeys: Object.keys(formData || {}),
    });
  }, [formData, emendaIdReal]);

  // 📄 CARREGAR DESPESAS DA EMENDA
  useEffect(() => {
    carregarDespesas();
  }, [emendaId]);

  // 🔍 DEBUG EXTREMO: Monitorar mudanças de view
  useEffect(() => {
    console.log("=".repeat(70));
    console.log("🎬 RENDER DespesasTab");
    console.log("📍 currentView:", currentView);
    console.log("📍 despesaSelecionada ID:", despesaSelecionada?.id);
    console.log(
      "📍 despesaSelecionada discriminacao:",
      despesaSelecionada?.discriminacao,
    );
    console.log(
      "📍 Vai renderizar:",
      ["criar", "editar", "visualizar"].includes(currentView)
        ? "🖊️ FORMULÁRIO"
        : "📋 LISTAGEM",
    );
    console.log("=".repeat(70));
  }, [currentView, despesaSelecionada]);

  const carregarDespesas = async () => {
    if (!emendaId) {
      setDespesas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("💰 Carregando despesas da emenda:", emendaId);

      const q = query(
        collection(db, "despesas"),
        where("emendaId", "==", emendaId),
      );

      const snapshot = await getDocs(q);
      const despesasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDespesas(despesasData);
      console.log(`✅ ${despesasData.length} despesas carregadas`);
    } catch (err) {
      console.error("❌ Erro ao carregar despesas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 HANDLERS DE NAVEGAÇÃO COM DEBUG E PREVENÇÃO
  const handleCriar = (e) => {
    // PREVENIR PROPAGAÇÃO
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("➕ handleCriar CHAMADO");
    setDespesaSelecionada(null);
    setCurrentView("criar");
    console.log("✅ currentView atualizado para: criar");
  };

  const handleEditar = (despesa, e) => {
    console.log("🔧🔧🔧 DespesasTab.handleEditar INICIADO 🔧🔧🔧");
    console.log("📦 Despesa recebida:", {
      id: despesa?.id,
      discriminacao: despesa?.discriminacao,
      fornecedor: despesa?.fornecedor,
    });
    console.log("📍 currentView ANTES:", currentView);

    // PREVENIR PROPAGAÇÃO E DEFAULT
    if (e) {
      console.log("🛑 Prevenindo propagação do evento");
      e.preventDefault();
      e.stopPropagation();
    }

    // PREVENIR NAVEGAÇÃO GLOBAL
    if (window.event) {
      console.log("🛑 Prevenindo window.event");
      window.event.stopPropagation();
      window.event.preventDefault();
    }

    // ATUALIZAR ESTADOS
    console.log("📝 Atualizando despesaSelecionada...");
    setDespesaSelecionada(despesa);

    console.log("📝 Atualizando currentView para 'editar'...");
    setCurrentView("editar");

    console.log("✅ DespesasTab.handleEditar CONCLUÍDO");
    console.log("📍 currentView DEPOIS:", "editar");
  };

  const handleVisualizar = (despesa, e) => {
    // PREVENIR PROPAGAÇÃO
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("👁️ handleVisualizar CHAMADO:", despesa?.id);
    setDespesaSelecionada(despesa);
    setCurrentView("visualizar");
  };

  const handleVoltar = () => {
    console.log("⬅️ handleVoltar CHAMADO");
    setCurrentView("listagem");
    setDespesaSelecionada(null);
    console.log("✅ Voltou para listagem");
  };

  const handleSalvarDespesa = async () => {
    console.log("💾 handleSalvarDespesa CHAMADO");
    await carregarDespesas();
    handleVoltar();
    setToast({
      show: true,
      message: "Despesa salva com sucesso!",
      type: "success",
    });
  };

  // 📊 CALCULAR SALDOS E ESTATÍSTICAS
  const calcularEstatisticas = () => {
    const totalExecutado = despesas.reduce(
      (sum, d) => sum + (parseFloat(d.valor) || 0),
      0,
    );
    const valorEmenda =
      parseFloat(
        formData?.valorRecurso?.replace?.(/[^\d,]/g, "")?.replace(",", "."),
      ) || 0;
    const saldoDisponivel = valorEmenda - totalExecutado;

    return {
      totalDespesas: despesas.length,
      valorTotalDespesas: totalExecutado,
      saldoDisponivel,
      valorEmenda,
    };
  };

  const estatisticas = calcularEstatisticas();

  // 🚫 Se não tem ID da emenda ainda
  if (!temEmendaSalva) {
    return (
      <div style={styles.container}>
        <div style={styles.alertBox}>
          <div style={styles.alertIcon}>ℹ️</div>
          <div>
            <h3 style={styles.alertTitle}>Salve a emenda primeiro</h3>
            <p style={styles.alertText}>
              Para cadastrar despesas, você precisa primeiro salvar a emenda.
            </p>
            <div style={styles.debugInfo}>
              <small>
                Debug: ID={formData?.id || "vazio"}, emendaId=
                {formData?.emendaId || "vazio"}, emendaIdReal=
                {emendaIdReal || "vazio"}, numero={formData?.numero || "vazio"}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔍 RENDERIZAÇÃO: FORMULÁRIO DE DESPESA
  if (["criar", "editar", "visualizar"].includes(currentView)) {
    console.log("🖊️ RENDERIZANDO FORMULÁRIO DE DESPESA");
    console.log("📍 Modo:", currentView);
    console.log("📦 Despesa selecionada:", despesaSelecionada?.id);

    return (
      <div style={styles.container}>
        <DespesaForm
          usuario={usuario}
          despesaParaEditar={despesaSelecionada}
          onCancelar={handleVoltar}
          onSalvar={handleSalvarDespesa}
          onSuccess={handleSalvarDespesa}
          emendasDisponiveis={emendas}
          emendaPreSelecionada={emendaId}
          emendaInfo={emenda}
          modoVisualizacao={currentView === "visualizar"}
          titulo={
            currentView === "criar"
              ? "Nova Despesa"
              : currentView === "editar"
                ? "Editar Despesa"
                : "Visualizar Despesa"
          }
        />

        {/* Toast de feedback */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    );
  }

  // 📊 RENDERIZAÇÃO: LISTAGEM DE DESPESAS
  console.log("📋 RENDERIZANDO LISTAGEM DE DESPESAS");
  return (
    <div style={styles.container}>
      {/* Toast de feedback */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* Header simplificado */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <h3 style={styles.headerTitle}>💸 Despesas Executadas</h3>
          <p style={styles.headerSubtitle}>
            {despesas.length}{" "}
            {despesas.length === 1
              ? "despesa cadastrada"
              : "despesas cadastradas"}
          </p>
        </div>
        <button type="button" onClick={handleCriar} style={styles.createButton}>
          ➕ Nova Despesa
        </button>
      </div>

      {/* Lista/Tabela de despesas - COMPONENTE ORIGINAL */}
      <DespesasList
        despesas={despesas}
        emendas={emendas}
        loading={loading}
        error={error}
        onEdit={handleEditar}
        onView={handleVisualizar}
        onRecarregar={carregarDespesas}
        usuario={usuario}
        filtroInicial={{
          emendaId: emendaId,
          emenda: emenda,
        }}
      />
    </div>
  );
};

// 🎨 ESTILOS
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minHeight: "400px",
  },
  alertBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
  },
  alertIcon: {
    fontSize: "24px",
  },
  alertTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e40af",
    margin: "0 0 4px 0",
  },
  alertText: {
    fontSize: "14px",
    color: "#3b82f6",
    margin: 0,
  },
  debugInfo: {
    marginTop: "8px",
    padding: "8px",
    backgroundColor: "#f3f4f6",
    borderRadius: "4px",
    fontSize: "11px",
    color: "#6b7280",
    fontFamily: "monospace",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "16px",
    borderBottom: "2px solid #e9ecef",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2563EB",
    margin: "0 0 4px 0",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  createButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
};

export default DespesasTab;
