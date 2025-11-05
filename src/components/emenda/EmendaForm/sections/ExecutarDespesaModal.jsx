// src/components/emenda/EmendaForm/sections/ExecutarDespesaModal.jsx
// 🎯 MODAL PARA EXECUTAR DESPESA
// ✅ CORRIGIDO: Validação de emenda antes de passar para componentes

import React, { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import {
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../../utils/formatters";

// ✅ HELPERS PARA VALIDAÇÃO DE BOTÕES
// pega o primeiro valor existente entre várias chaves comuns
const pick = (obj, keys) => {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

// parse seguro de BRL -> número (usa fallback se vier string)
const parseBRL = (v) => {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const s = String(v)
    .replace(/\s/g, "")
    .replace(/\./g, "") // remove separador de milhar
    .replace(",", ".") // vírgula -> ponto
    .replace(/[^\d.-]/g, ""); // remove qualquer coisa não numérica
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// ✅ REUTILIZA COMPONENTES MODULARES EXISTENTES
import DespesaFormBasicFields from "../../../despesa/DespesaFormBasicFields";
import DespesaFormEmpenhoFields from "../../../despesa/DespesaFormEmpenhoFields";
import DespesaFormDateFields from "../../../despesa/DespesaFormDateFields";
import DespesaFormClassificacaoFuncional from "../../../despesa/DespesaFormClassificacaoFuncional";

const ExecutarDespesaModal = ({
  isOpen,
  onClose,
  despesa, // Despesa planejada (se vier de planejamento)
  emendaId, // ID da emenda
  saldoDisponivel,
  onSuccess,
}) => {
  // 🎯 ESTADO DO FORMULÁRIO (TODOS OS 33 CAMPOS)
  const [formData, setFormData] = useState({
    emendaId: emendaId || "",
    estrategia: despesa?.estrategia || "",

    // ✅ NATUREZA + VALOR
    naturezaDespesa: despesa?.estrategia || "3.3.9.0.30 – Material de Despesa",
    valor: despesa?.valor || "",
    discriminacao: despesa?.estrategia || "",

    // ✅ EMPENHO
    numeroEmpenho: "",
    numeroNota: "",
    numeroContrato: "",

    // ✅ DATAS
    dataEmpenho: "",
    dataLiquidacao: "",
    dataPagamento: "",

    // ✅ CLASSIFICAÇÃO FUNCIONAL
    acao: "",
    classificacaoFuncional: "",
    elementoDespesa: "3.3.90.30.99 - Outros Materiais de Consumo",
    fonteRecurso: "",
    programaTrabalho: "",
    planoInterno: "",
    status: "EXECUTADA", // ✅ Status já EXECUTADA
    categoria: "",

    // ✅ FORNECEDOR (API CNPJ)
    cnpjFornecedor: "",
    fornecedor: "",
    nomeFantasia: "",
    enderecoFornecedor: "",
    cidadeUf: "",
    cep: "",
    telefoneFornecedor: "",
    emailFornecedor: "",
    situacaoCadastral: "",

    // ✅ METADADOS
    contrapartida: 0,
    percentualExecucao: 0,
    etapaExecucao: "",
    coordenadasGeograficas: "",
    populacaoBeneficiada: "",
    impactoSocial: "",
    descricao: "",
    observacoes: "",

    // ✅ LOG
    dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [naturezaAlterada, setNaturezaAlterada] = useState(false);
  const naturezaOriginal = despesa?.estrategia || despesa?.naturezaDespesa;
  const [emendaInfo, setEmendaInfo] = useState(null);

  // Carregar informações da emenda (para cabeçalho)
  useEffect(() => {
    const carregarEmenda = async () => {
      if (emendaId) {
        try {
          const emendaDoc = await getDoc(doc(db, "emendas", emendaId));
          if (emendaDoc.exists()) {
            setEmendaInfo({ id: emendaDoc.id, ...emendaDoc.data() });
          }
        } catch (error) {
          console.error("Erro ao carregar emenda:", error);
        }
      }
    };
    carregarEmenda();
  }, [emendaId]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Confirma alteração de natureza se vier de planejada
    if (
      name === "naturezaDespesa" &&
      naturezaOriginal &&
      value !== naturezaOriginal
    ) {
      const confirmar = window.confirm(
        `⚠️ ATENÇÃO: Você está alterando a Natureza de Despesa!\n\nNatureza Original:\n${naturezaOriginal}\n\nNova Natureza:\n${value}\n\nDeseja realmente alterar?`,
      );
      if (!confirmar) {
        // Se cancelar, manter valor original
        return;
      }

      setNaturezaAlterada(true);
    }

    // Formatação especial para valor monetário
    if (name === "valor") {
      setFormData((prev) => ({
        ...prev,
        [name]: formatarMoedaInput(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validarFormulario = () => {
    const novosErros = {};

    // Campos essenciais
    if (!formData.discriminacao) novosErros.discriminacao = "Campo obrigatório";
    if (!formData.valor || parseValorMonetario(formData.valor) <= 0)
      novosErros.valor = "Valor deve ser maior que zero";

    // Limite por saldo
    const valorDespesa = parseValorMonetario(formData.valor);
    if (saldoDisponivel && valorDespesa > saldoDisponivel) {
      novosErros.valor = `Saldo insuficiente. Disponível: R$ ${saldoDisponivel.toFixed(2)}`;
    }

    // Execução requer dados fiscais/datas mínimos
    if (!formData.numeroEmpenho) novosErros.numeroEmpenho = "Campo obrigatório";
    if (!formData.numeroNota) novosErros.numeroNota = "Campo obrigatório";
    if (!formData.dataEmpenho) novosErros.dataEmpenho = "Campo obrigatório";
    if (!formData.dataLiquidacao)
      novosErros.dataLiquidacao = "Campo obrigatório";
    if (!formData.dataPagamento) novosErros.dataPagamento = "Campo obrigatório";
    if (!formData.acao) novosErros.acao = "Campo obrigatório";
    if (!formData.cnpjFornecedor)
      novosErros.cnpjFornecedor = "Campo obrigatório";

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      alert("❌ Preencha todos os campos obrigatórios");
      return;
    }

    setSalvando(true);
    try {
      const despesaData = {
        ...formData,
        valor: parseValorMonetario(formData.valor),
        status: "EXECUTADA",
        criadaEm: new Date().toISOString(),
      };

      await addDoc(collection(db, "despesas"), despesaData);

      // Se veio de uma despesa planejada, deletar a planejada
      if (despesa?.id) {
        await deleteDoc(doc(db, "despesas", despesa.id));
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar despesa");
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  // 🔒 Habilitar Confirmar Execução somente com info válida mínima
  const canConfirm =
    Boolean(formData.naturezaDespesa) &&
    parseValorMonetario(formData.valor) > 0;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 📋 HEADER */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {despesa
              ? "▶️ Executar Despesa Planejada"
              : "➕ Nova Despesa Executada"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            disabled={salvando}
          >
            ✕
          </button>
        </div>

        {/* 🧾 CABEÇALHO DA EMENDA */}
        {emendaInfo && (
          <div style={styles.emendaInfo}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Parlamentar:</span>
              <span style={styles.infoValue}>
                {emendaInfo.autor || emendaInfo.parlamentar}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Número:</span>
              <span style={styles.infoValue}>{emendaInfo.numero}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Município:</span>
              <span style={styles.infoValue}>
                {emendaInfo.municipio}/{emendaInfo.uf}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Saldo Disponível:</span>
              <span
                style={{
                  ...styles.infoValue,
                  color: "#27ae60",
                  fontWeight: "bold",
                }}
              >
                {saldoDisponivel.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
        )}

        {/* ⚠️ ALERTA DE SALDO */}
        <div style={styles.alertaSaldo}>
          <div style={styles.alertaIcon}>⚠️</div>
          <div>
            <strong>Atenção:</strong> Ao executar, o valor será descontado do
            saldo disponível da emenda.
          </div>
        </div>

        {/* ⚠️ ALERTA DE NATUREZA ALTERADA */}
        {naturezaAlterada && (
          <div style={styles.alertaNatureza}>
            <div style={styles.alertaIcon}>🔄</div>
            <div>
              <strong>Natureza Alterada:</strong> A natureza de despesa foi
              modificada em relação ao planejamento original.
            </div>
          </div>
        )}

        {/* 📋 FORMULÁRIO COMPLETO */}
        <div style={styles.formContent}>
          {/* ✅ SEÇÃO 1: DADOS BÁSICOS */}
          <DespesaFormBasicFields
            formData={formData}
            errors={errors}
            emendas={emendaInfo ? [emendaInfo] : []}
            emendaPreSelecionada={emendaId}
            emendaInfo={emendaInfo}
            userRole="admin"
            userMunicipio=""
            modoVisualizacao={false}
            valorError={errors.valor}
            handleInputChange={handleInputChange}
          />

          {/* ✅ SEÇÃO 2: EMPENHO */}
          <DespesaFormEmpenhoFields
            formData={formData}
            errors={errors}
            modoVisualizacao={false}
            handleInputChange={handleInputChange}
          />

          {/* ✅ SEÇÃO 3: DATAS */}
          <DespesaFormDateFields
            formData={formData}
            errors={errors}
            modoVisualizacao={false}
            handleInputChange={handleInputChange}
            emendaInfo={emendaInfo}
          />

          {/* ✅ SEÇÃO 4: CLASSIFICAÇÃO FUNCIONAL */}
          <DespesaFormClassificacaoFuncional
            formData={formData}
            errors={errors}
            modoVisualizacao={false}
            handleInputChange={handleInputChange}
          />
        </div>

        {/* 📎 FOOTER */}
        <div style={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            style={styles.btnCancelar}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            style={{
              ...styles.btnConfirmar,
              opacity: salvando || !canConfirm ? 0.6 : 1,
              cursor: salvando || !canConfirm ? "not-allowed" : "pointer",
            }}
            disabled={salvando || !canConfirm}
          >
            {salvando ? "⏳ Salvando..." : "✅ Confirmar Execução"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 🎨 ESTILOS
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "1200px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "2px solid #e9ecef",
  },

  title: { margin: 0, fontSize: "22px", fontWeight: "bold", color: "#154360" },

  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    color: "#6c757d",
    cursor: "pointer",
    padding: 0,
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    transition: "all 0.2s",
  },

  emendaInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    padding: "16px 24px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #dee2e6",
  },
  infoItem: { display: "flex", flexDirection: "column", gap: "4px" },
  infoLabel: {
    fontSize: "11px",
    color: "#6c757d",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: { fontSize: "14px", color: "#495057", fontWeight: "500" },

  alertaSaldo: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "16px 24px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderLeft: "4px solid #ffc107",
    fontSize: "14px",
    color: "#856404",
  },

  alertaNatureza: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "16px 24px",
    backgroundColor: "#d1ecf1",
    border: "1px solid #17a2b8",
    borderLeft: "4px solid #17a2b8",
    fontSize: "14px",
    color: "#0c5460",
  },

  alertaIcon: { fontSize: "20px", flexShrink: 0 },

  formContent: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "20px 24px",
    borderTop: "2px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },

  btnCancelar: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  btnConfirmar: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(40, 167, 69, 0.2)",
  },
};

export default ExecutarDespesaModal;
