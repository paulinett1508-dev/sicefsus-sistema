// src/components/emenda/DespesaModal.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";

const DespesaModal = ({ emenda, despesaEdit, onClose, onSalvar }) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const [formData, setFormData] = useState({
    // Dados já preenchidos pelo contexto da emenda
    emendaId: emenda?.id || "",
    numeroEmenda: emenda?.numero || "",
    municipio: emenda?.municipio || "",
    uf: emenda?.uf || "",

    // Campos principais da despesa
    data: "",
    valor: "",
    descricao: "",
    numeroEmpenho: "",
    cnpjFornecedor: "",
    razaoSocialFornecedor: "",

    // Classificações
    naturezaDespesa: "",
    elementoDespesa: "",
    estrategia: "",

    // Campos de documento
    numeroDocumentoFiscal: "",
    dataEmissaoDocumento: "",
    tipoDocumento: "",

    // Observações
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ BUSCAR NATUREZAS DO PLANEJAMENTO (acoesServicos)
  const acoesServicos = emenda?.acoesServicos || [];

  // ✅ Calcular saldo disponível por natureza
  const calcularSaldoDisponivel = (acao) => {
    const planejado =
      parseFloat(acao.valorAcao?.replace?.(/[^\d,]/g, "")?.replace(",", ".")) ||
      0;

    // Se estiver editando, não conta o valor da própria despesa
    const valorDespesaAtual =
      despesaEdit?.estrategia === acao.estrategia
        ? parseFloat(despesaEdit.valor) || 0
        : 0;

    // Buscar todas as despesas dessa natureza (exceto a atual se estiver editando)
    const despesasFirebase = []; // Será populado pelo componente pai
    const executado = despesasFirebase
      .filter(
        (d) => d.estrategia === acao.estrategia && d.id !== despesaEdit?.id,
      )
      .reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);

    return planejado - executado + valorDespesaAtual;
  };

  // Preencher formulário se for edição
  useEffect(() => {
    if (despesaEdit) {
      setFormData({
        ...formData,
        ...despesaEdit,
      });
    }
  }, [despesaEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validarFormulario = () => {
    const novosErros = {};

    // Validações obrigatórias
    if (!formData.data) novosErros.data = "Data é obrigatória";
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      novosErros.valor = "Valor deve ser maior que zero";
    }
    if (!formData.descricao) novosErros.descricao = "Descrição é obrigatória";
    if (!formData.estrategia)
      novosErros.estrategia = "Natureza de despesa é obrigatória";
    if (!formData.cnpjFornecedor)
      novosErros.cnpjFornecedor = "CNPJ do fornecedor é obrigatório";
    if (!formData.numeroDocumentoFiscal)
      novosErros.numeroDocumentoFiscal =
        "Número do documento fiscal é obrigatório";

    // ✅ Validar saldo disponível na natureza selecionada
    if (formData.estrategia) {
      const acaoSelecionada = acoesServicos.find(
        (a) => a.estrategia === formData.estrategia,
      );
      if (acaoSelecionada) {
        const saldoDisponivel = calcularSaldoDisponivel(acaoSelecionada);
        const valorDespesa = parseFloat(formData.valor) || 0;

        if (valorDespesa > saldoDisponivel) {
          novosErros.valor = `Valor ultrapassa o saldo disponível (${formatarMoeda(saldoDisponivel)})`;
        }
      }
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);

    try {
      const despesaData = {
        ...formData,
        valor: parseFloat(formData.valor),
        emendaId: emenda.id,
        numeroEmenda: emenda.numero,
        municipio: emenda.municipio,
        uf: emenda.uf,
        updatedAt: new Date().toISOString(),
      };

      if (despesaEdit?.id) {
        // Atualizar despesa existente
        await updateDoc(doc(db, "despesas", despesaEdit.id), despesaData);
        alert("Despesa atualizada com sucesso!");
      } else {
        // Criar nova despesa
        despesaData.createdAt = new Date().toISOString();
        await addDoc(collection(db, "despesas"), despesaData);
        alert("Despesa cadastrada com sucesso!");
      }

      onSalvar();
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      alert("Erro ao salvar despesa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);
  };

  // Gerar estilos com base no tema
  const styles = getStyles(isDark);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              {despesaEdit ? "Editar Despesa" : "Nova Despesa"}
            </h2>
            <p style={styles.subtitle}>
              Emenda: {emenda?.numero} | {emenda?.municipio}/{emenda?.uf}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formContent}>
            {/* Seção 1: Informações Básicas */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>description</span>
                Informações Básicas
              </h3>
              <div style={styles.grid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data da Despesa *</label>
                  <input
                    type="date"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.data ? styles.inputError : {}),
                    }}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {errors.data && (
                    <span style={styles.errorText}>{errors.data}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Valor (R$) *</label>
                  <input
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    style={{
                      ...styles.input,
                      ...(errors.valor ? styles.inputError : {}),
                    }}
                  />
                  {errors.valor && (
                    <span style={styles.errorText}>{errors.valor}</span>
                  )}
                </div>

                <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Descrição da Despesa *</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Descreva o objeto da despesa..."
                    style={{
                      ...styles.textarea,
                      ...(errors.descricao ? styles.inputError : {}),
                    }}
                  />
                  {errors.descricao && (
                    <span style={styles.errorText}>{errors.descricao}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Seção 2: Classificação */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>label</span>
                Classificação
              </h3>
              <div style={styles.grid}>
                <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>
                    Natureza de Despesa * (do Planejamento)
                  </label>
                  <select
                    name="estrategia"
                    value={formData.estrategia}
                    onChange={handleChange}
                    style={{
                      ...styles.select,
                      ...(errors.estrategia ? styles.inputError : {}),
                    }}
                  >
                    <option value="">Selecione a natureza planejada...</option>
                    {acoesServicos.length === 0 && (
                      <option value="" disabled>
                        Nenhuma natureza planejada ainda
                      </option>
                    )}
                    {acoesServicos.map((acao) => {
                      const saldo = calcularSaldoDisponivel(acao);
                      return (
                        <option
                          key={acao.estrategia}
                          value={acao.estrategia}
                          disabled={saldo <= 0}
                        >
                          {acao.estrategia} - Disponível: {formatarMoeda(saldo)}
                          {saldo <= 0 ? " (Esgotado)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {errors.estrategia && (
                    <span style={styles.errorText}>{errors.estrategia}</span>
                  )}
                  {acoesServicos.length === 0 && (
                    <span style={styles.warningText}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>lightbulb</span>
                      Primeiro planeje as naturezas de despesa na aba "Planejamento"
                    </span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nº do Empenho</label>
                  <input
                    type="text"
                    name="numeroEmpenho"
                    value={formData.numeroEmpenho}
                    onChange={handleChange}
                    placeholder="Ex: 2025NE000123"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Fornecedor */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>business</span>
                Fornecedor
              </h3>
              <div style={styles.grid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CNPJ *</label>
                  <input
                    type="text"
                    name="cnpjFornecedor"
                    value={formData.cnpjFornecedor}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    style={{
                      ...styles.input,
                      ...(errors.cnpjFornecedor ? styles.inputError : {}),
                    }}
                  />
                  {errors.cnpjFornecedor && (
                    <span style={styles.errorText}>
                      {errors.cnpjFornecedor}
                    </span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Razão Social</label>
                  <input
                    type="text"
                    name="razaoSocialFornecedor"
                    value={formData.razaoSocialFornecedor}
                    onChange={handleChange}
                    placeholder="Nome do fornecedor"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Documento Fiscal */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}><span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>article</span> Documento Fiscal</h3>
              <div style={styles.grid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nº Documento *</label>
                  <input
                    type="text"
                    name="numeroDocumentoFiscal"
                    value={formData.numeroDocumentoFiscal}
                    onChange={handleChange}
                    placeholder="Ex: NF-123456"
                    style={{
                      ...styles.input,
                      ...(errors.numeroDocumentoFiscal
                        ? styles.inputError
                        : {}),
                    }}
                  />
                  {errors.numeroDocumentoFiscal && (
                    <span style={styles.errorText}>
                      {errors.numeroDocumentoFiscal}
                    </span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de Documento</label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Selecione...</option>
                    <option value="Nota Fiscal">Nota Fiscal</option>
                    <option value="Recibo">Recibo</option>
                    <option value="Fatura">Fatura</option>
                    <option value="Cupom Fiscal">Cupom Fiscal</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Data Emissão</label>
                  <input
                    type="date"
                    name="dataEmissaoDocumento"
                    value={formData.dataEmissaoDocumento}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Seção 5: Observações */}
            <div style={styles.section}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Observações</label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Informações adicionais..."
                  style={styles.textarea}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? "Salvando..." : despesaEdit ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Função para gerar estilos com suporte a dark mode
const getStyles = (isDark) => ({
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
    backdropFilter: "blur(2px)",
  },
  modal: {
    backgroundColor: isDark ? "var(--theme-surface, #1e293b)" : "var(--theme-surface, #ffffff)",
    borderRadius: "8px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: isDark ? "1px solid var(--theme-border)" : "none",
    boxShadow: isDark
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px",
    borderBottom: `1px solid ${isDark ? "var(--theme-border)" : "#e5e7eb"}`,
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    color: isDark ? "var(--theme-text)" : "#111827",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: isDark ? "var(--theme-text-secondary)" : "#6b7280",
    marginTop: "4px",
  },
  closeButton: {
    padding: "8px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: isDark ? "var(--theme-text-secondary)" : "#6b7280",
    borderRadius: "6px",
    transition: "background-color 0.2s",
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
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: isDark ? "var(--theme-text)" : "#111827",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: isDark ? "var(--theme-text)" : "#374151",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${isDark ? "var(--theme-border)" : "#d1d5db"}`,
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    backgroundColor: isDark ? "var(--theme-input-bg, #0f172a)" : "var(--theme-input-bg, #ffffff)",
    color: isDark ? "var(--theme-text)" : "inherit",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${isDark ? "var(--theme-border)" : "#d1d5db"}`,
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: isDark ? "var(--theme-input-bg, #0f172a)" : "var(--theme-input-bg, #ffffff)",
    color: isDark ? "var(--theme-text)" : "inherit",
    cursor: "pointer",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${isDark ? "var(--theme-border)" : "#d1d5db"}`,
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    backgroundColor: isDark ? "var(--theme-input-bg, #0f172a)" : "var(--theme-input-bg, #ffffff)",
    color: isDark ? "var(--theme-text)" : "inherit",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: "12px",
    color: "#ef4444",
  },
  warningText: {
    fontSize: "12px",
    color: "#f59e0b",
    marginTop: "4px",
    display: "block",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 24px",
    borderTop: `1px solid ${isDark ? "var(--theme-border)" : "#e5e7eb"}`,
    backgroundColor: isDark ? "var(--theme-surface-secondary, #0f172a)" : "#f9fafb",
  },
  cancelButton: {
    padding: "10px 20px",
    border: `1px solid ${isDark ? "var(--theme-border)" : "#d1d5db"}`,
    backgroundColor: isDark ? "var(--theme-surface)" : "white",
    color: isDark ? "var(--theme-text)" : "#374151",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  submitButton: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
});

export default DespesaModal;
