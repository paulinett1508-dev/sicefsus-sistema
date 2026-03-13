// src/components/emenda/EmendaForm/sections/ExecutarDespesaModal.jsx
// 🎯 MODAL PARA EXECUTAR DESPESA PLANEJADA - VERSÃO CORRIGIDA
// ✅ Seção "Dados Básicos da Despesa" com campos corretos

import React, { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import {
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../../utils/formatters";
import { recalcularSaldoEmenda } from "../../../../utils/emendaCalculos";

const ExecutarDespesaModal = ({
  isOpen,
  onClose,
  despesa,
  emendaId,
  saldoDisponivel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    // ✅ DADOS BÁSICOS DA DESPESA
    emendaId: emendaId || "",
    valor: despesa?.valor || "",
    discriminacao: "", // ✅ VAZIO para usuário preencher
    naturezaDespesa: despesa?.estrategia || despesa?.naturezaDespesa || "",

    // Campos de execução
    numeroEmpenho: "",
    numeroNota: "",
    numeroContrato: "",
    dataEmpenho: "",
    dataLiquidacao: "",
    dataPagamento: "",
    cnpjFornecedor: "",
    fornecedor: "",
    acao: "",
  });

  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [emendaInfo, setEmendaInfo] = useState(null);
  const [valorAlterado, setValorAlterado] = useState(false);

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

  // ✅ Inicializar valor formatado quando despesa mudar
  useEffect(() => {
    if (despesa?.valor) {
      const valorNum =
        typeof despesa.valor === "number"
          ? despesa.valor
          : parseValorMonetario(despesa.valor);
      setFormData((prev) => ({
        ...prev,
        valor: formatarMoedaInput(valorNum.toString()),
      }));
    }
  }, [despesa]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Alerta ao alterar valor
    if (name === "valor") {
      const valorOriginal =
        typeof despesa?.valor === "number"
          ? despesa.valor
          : parseValorMonetario(despesa?.valor || "0");
      const valorNovo = parseValorMonetario(value);

      if (valorNovo !== valorOriginal && !valorAlterado) {
        const confirmar = window.confirm(
          `⚠️ ATENÇÃO: Você está alterando o valor da despesa!\n\n` +
            `Valor Original: R$ ${valorOriginal.toFixed(2)}\n` +
            `Novo Valor: R$ ${valorNovo.toFixed(2)}\n\n` +
            `Deseja realmente alterar?`,
        );

        if (!confirmar) return;
        setValorAlterado(true);
      }

      setFormData((prev) => ({ ...prev, [name]: formatarMoedaInput(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validar = () => {
    const erros = {};

    // Validações obrigatórias
    if (!formData.discriminacao?.trim())
      erros.discriminacao = "Campo obrigatório";
    if (!formData.valor || parseValorMonetario(formData.valor) <= 0)
      erros.valor = "Valor deve ser maior que zero";
    if (!formData.numeroEmpenho?.trim())
      erros.numeroEmpenho = "Campo obrigatório";
    if (!formData.numeroNota?.trim()) erros.numeroNota = "Campo obrigatório";
    if (!formData.cnpjFornecedor?.trim())
      erros.cnpjFornecedor = "Campo obrigatório";

    // Validação de saldo
    const valorNum = parseValorMonetario(formData.valor);
    if (valorNum > saldoDisponivel) {
      erros.valor = `Saldo insuficiente. Disponível: R$ ${saldoDisponivel.toFixed(2)}`;
    }

    setErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) {
      alert("⚠️ Preencha todos os campos obrigatórios");
      return;
    }

    setSalvando(true);
    try {
      // Criar despesa executada
      // ✅ IMPORTANTE: incluir municipio/uf da emenda para que operadores vejam a despesa
      await addDoc(collection(db, "despesas"), {
        ...formData,
        valor: parseValorMonetario(formData.valor),
        status: "EXECUTADA",
        municipio: emendaInfo?.municipio || "",
        uf: emendaInfo?.uf || "",
        criadaEm: new Date().toISOString(),
      });

      // Deletar despesa planejada
      if (despesa?.id) {
        await deleteDoc(doc(db, "despesas", despesa.id));
      }

      // Recalcular saldo da emenda após execução
      if (emendaId) {
        console.log(`Recalculando saldo da emenda ${emendaId}...`);
        await recalcularSaldoEmenda(emendaId);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao executar despesa");
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  const valorOriginal =
    typeof despesa?.valor === "number"
      ? despesa.valor
      : parseValorMonetario(despesa?.valor || "0");

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* HEADER AZUL */}
        <div style={styles.header}>
          <h2 style={styles.title}>▶️ Executar Despesa Planejada</h2>
          <button onClick={onClose} style={styles.closeBtn} disabled={salvando}>
            ✕
          </button>
        </div>

        {/* INFO DA EMENDA (azul claro) */}
        {emendaInfo && (
          <div style={styles.emendaInfo}>
            <h3 style={styles.emendaTitle}>📊 Dados da Emenda Selecionada</h3>
            <div style={styles.emendaGrid}>
              <div style={styles.emendaItem}>
                <span style={styles.emendaLabel}>Parlamentar:</span>
                <span style={styles.emendaValue}>
                  {emendaInfo.autor || emendaInfo.parlamentar}
                </span>
              </div>
              <div style={styles.emendaItem}>
                <span style={styles.emendaLabel}>Número:</span>
                <span style={styles.emendaValue}>{emendaInfo.numero}</span>
              </div>
              <div style={styles.emendaItem}>
                <span style={styles.emendaLabel}>Tipo:</span>
                <span style={styles.emendaValue}>
                  {emendaInfo.tipo || "Não informado"}
                </span>
              </div>
              <div style={styles.emendaItem}>
                <span style={styles.emendaLabel}>Município:</span>
                <span style={styles.emendaValue}>
                  {emendaInfo.municipio}/{emendaInfo.uf}
                </span>
              </div>
              <div style={styles.emendaItem}>
                <span style={styles.emendaLabel}>Valor Total:</span>
                <span style={styles.emendaValue}>
                  {parseValorMonetario(emendaInfo.valor || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div style={styles.emendaItem}>
                <span style={styles.emendaLabel}>Saldo Disponível:</span>
                <span style={styles.saldoValue}>
                  {saldoDisponivel.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div style={styles.emendaItem}>
                <span style={styles.emendaLabel}>Programa:</span>
                <span style={styles.emendaValue}>
                  {emendaInfo.programa || "Não informado"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FORMULÁRIO */}
        <div style={styles.form}>
          <div style={styles.formContent}>
            {/* ✅ SEÇÃO: DADOS BÁSICOS DA DESPESA */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Dados Básicos da Despesa</h3>

              {/* Linha 1: Emenda (readonly) + Valor (editável) */}
              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 2 }}>
                  <label style={styles.label}>
                    EMENDA *{" "}
                    <span style={styles.readonlyTag}>(não editável)</span>
                  </label>
                  <input
                    type="text"
                    value={`${emendaInfo?.numero || emendaId} - ${emendaInfo?.municipio || ""}/${emendaInfo?.uf || ""}`}
                    disabled
                    style={{
                      ...styles.input,
                      backgroundColor: "#f8f9fa",
                      cursor: "not-allowed",
                      fontWeight: 600,
                      color: "#495057",
                    }}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    VALOR * <span style={styles.editableTag}>(editável)</span>
                  </label>
                  <input
                    type="text"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    placeholder="R$ 0,00"
                    style={{
                      ...styles.input,
                      backgroundColor: valorAlterado ? "#fff3cd" : "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  />
                  {errors.valor && (
                    <span style={styles.error}>{errors.valor}</span>
                  )}
                  {valorAlterado && (
                    <span style={styles.warning}>
                      ⚠️ Valor alterado (Original: R$ {valorOriginal.toFixed(2)}
                      )
                    </span>
                  )}
                </div>
              </div>

              {/* Linha 2: Discriminação (editável em branco) */}
              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>
                    DISCRIMINAÇÃO *{" "}
                    <span style={styles.editableTag}>(preencher)</span>
                  </label>
                  <input
                    type="text"
                    name="discriminacao"
                    value={formData.discriminacao}
                    onChange={handleChange}
                    placeholder="Digite a discriminação da despesa"
                    style={{ ...styles.input, fontWeight: 500 }}
                  />
                  {errors.discriminacao && (
                    <span style={styles.error}>{errors.discriminacao}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SEÇÃO: DADOS DO EMPENHO E NOTA FISCAL */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                📋 Dados do Empenho e Nota Fiscal
              </h3>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Nº DO EMPENHO *</label>
                  <input
                    type="text"
                    name="numeroEmpenho"
                    value={formData.numeroEmpenho}
                    onChange={handleChange}
                    placeholder="Ex: 2025NE000123"
                    style={styles.input}
                  />
                  {errors.numeroEmpenho && (
                    <span style={styles.error}>{errors.numeroEmpenho}</span>
                  )}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Nº DA NOTA FISCAL *
                    <span style={styles.infoIcon} title="Número da nota fiscal">
                      ℹ️
                    </span>
                  </label>
                  <input
                    type="text"
                    name="numeroNota"
                    value={formData.numeroNota}
                    onChange={handleChange}
                    placeholder="Ex: 12345"
                    style={styles.input}
                  />
                  {errors.numeroNota && (
                    <span style={styles.error}>{errors.numeroNota}</span>
                  )}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Nº DO CONTRATO</label>
                  <input
                    type="text"
                    name="numeroContrato"
                    value={formData.numeroContrato}
                    onChange={handleChange}
                    placeholder="Ex: 2025CT000456"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO: DATAS DE EXECUÇÃO */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📅 Datas de Execução</h3>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>DATA DO EMPENHO</label>
                  <input
                    type="date"
                    name="dataEmpenho"
                    value={formData.dataEmpenho}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>DATA DA LIQUIDAÇÃO</label>
                  <input
                    type="date"
                    name="dataLiquidacao"
                    value={formData.dataLiquidacao}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>DATA DO PAGAMENTO</label>
                  <input
                    type="date"
                    name="dataPagamento"
                    value={formData.dataPagamento}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO: DADOS DO FORNECEDOR */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏢 Dados do Fornecedor</h3>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>CPF/CNPJ *</label>
                  <input
                    type="text"
                    name="cnpjFornecedor"
                    value={formData.cnpjFornecedor}
                    onChange={handleChange}
                    placeholder="CPF ou CNPJ do fornecedor"
                    style={styles.input}
                  />
                  {errors.cnpjFornecedor && (
                    <span style={styles.error}>{errors.cnpjFornecedor}</span>
                  )}
                </div>

                <div style={{ ...styles.field, flex: 2 }}>
                  <label style={styles.label}>FORNECEDOR</label>
                  <input
                    type="text"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleChange}
                    placeholder="Nome do fornecedor"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>AÇÃO</label>
                  <input
                    type="text"
                    name="acao"
                    value={formData.acao}
                    onChange={handleChange}
                    placeholder="Código da ação"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              style={styles.btnCancel}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={salvando} 
              style={styles.btnConfirm}
            >
              {salvando ? "⏳ Executando..." : "✅ Confirmar Execução"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 1000,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px",
    backgroundColor: "#3B82F6",
    borderBottom: "3px solid #357ABD",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  closeBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    border: "2px solid rgba(255,255,255,0.3)",
    fontSize: 24,
    color: "#fff",
    cursor: "pointer",
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  emendaInfo: {
    padding: "24px 28px",
    backgroundColor: "#e3f2fd",
    borderBottom: "2px solid #90caf9",
  },
  emendaTitle: {
    margin: "0 0 16px 0",
    fontSize: 16,
    fontWeight: "bold",
    color: "#1565c0",
  },
  emendaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  emendaItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  emendaLabel: {
    fontSize: 11,
    color: "#1565c0",
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  emendaValue: {
    fontSize: 14,
    color: "#0d47a1",
    fontWeight: 600,
  },
  saldoValue: {
    fontSize: 15,
    color: "#27ae60",
    fontWeight: 800,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  },
  formContent: {
    flex: 1,
    overflowY: "auto",
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 28,
    backgroundColor: "#fafbfc",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e9ecef",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    paddingBottom: 12,
    borderBottom: "2px solid #e9ecef",
  },
  row: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 200,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#495057",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  readonlyTag: {
    fontSize: 10,
    fontWeight: 600,
    color: "#6c757d",
    backgroundColor: "#f8f9fa",
    padding: "2px 8px",
    borderRadius: 4,
    marginLeft: 6,
    textTransform: "lowercase",
  },
  editableTag: {
    fontSize: 10,
    fontWeight: 600,
    color: "#0d6efd",
    backgroundColor: "#e7f1ff",
    padding: "2px 8px",
    borderRadius: 4,
    marginLeft: 6,
    textTransform: "lowercase",
  },
  infoIcon: {
    marginLeft: 6,
    cursor: "help",
    fontSize: 14,
    opacity: 0.6,
  },
  input: {
    height: 44,
    border: "1px solid #ced4da",
    borderRadius: 8,
    padding: "0 14px",
    fontSize: 15,
  },
  error: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 6,
    fontWeight: 600,
  },
  warning: {
    color: "#856404",
    fontSize: 12,
    marginTop: 6,
    fontWeight: 600,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 14,
    padding: "20px 28px",
    borderTop: "3px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },
  btnCancel: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "13px 28px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  btnConfirm: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    padding: "13px 36px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(40,167,69,0.25)",
  },
};

export default ExecutarDespesaModal;
