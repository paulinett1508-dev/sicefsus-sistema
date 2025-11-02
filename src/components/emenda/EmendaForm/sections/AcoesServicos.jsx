// src/components/emenda/EmendaForm/sections/AcoesServicos.jsx
// ✅ ATUALIZADO:
// - "Meta(s)" → "Despesa" / "Despesas"
// - Removido "Simples" e "Quantitativa"
// - Campo Valor agora é obrigatório
// ✅ CORREÇÃO VISUAL:
// - Lista de despesas planejadas agora usa layout de CARD (grid)
// - Aplicado fundo amarelo para consistência com o print

import React, { useState } from "react";
import {
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../../utils/formatters";
// import SaldoNaturezaWidget from "../../../SaldoNaturezaWidget"; // ❌ REMOVIDO - Redundante
import { NATUREZAS_DESPESA } from "../../../../config/constants";

const AcoesServicos = ({
  formData = {},
  onChange,
  fieldErrors = {},
  despesas = [],
}) => {
  const [modoCustomizado, setModoCustomizado] = useState(false);
  const [despesaCustomizada, setDespesaCustomizada] = useState("");

  const handleInputChange = (e) => {
    onChange(e);
  };

  const handleValorChange = (e) => {
    const { name, value } = e.target;
    const valorFormatado = formatarMoedaInput(value);
    onChange({ target: { name, value: valorFormatado } });
  };

  const handleEstrategiaChange = (e) => {
    const valor = e.target.value;

    if (valor === "__customizado__") {
      setModoCustomizado(true);
      onChange({ target: { name: "estrategia", value: "" } });
    } else {
      setModoCustomizado(false);
      setDespesaCustomizada("");
      onChange(e);
    }
  };

  const handleDespesaCustomizadaChange = (e) => {
    const valor = e.target.value;
    setDespesaCustomizada(valor);
    onChange({ target: { name: "estrategia", value: valor } });
  };

  const handleAdicionarMeta = () => {
    const estrategiaFinal = modoCustomizado
      ? despesaCustomizada
      : formData.estrategia;

    if (!estrategiaFinal) {
      alert("⚠️ Preencha Natureza de Despesas antes de adicionar!");
      return;
    }

    // ✅ VALIDAÇÃO: Valor é obrigatório
    if (!formData.valorAcao || parseValorMonetario(formData.valorAcao) <= 0) {
      alert("⚠️ O campo Valor é obrigatório e deve ser maior que zero!");
      return;
    }

    const novaMeta = {
      id: Date.now(),
      estrategia: estrategiaFinal,
      valorAcao: formData.valorAcao,
    };

    const metasExistentes = formData.acoesServicos || [];
    const novasMetas = [...metasExistentes, novaMeta];

    // Limpar campos
    setModoCustomizado(false);
    setDespesaCustomizada("");
    onChange({ target: { name: "estrategia", value: "" } });
    onChange({ target: { name: "valorAcao", value: "" } });

    onChange({
      target: {
        name: "acoesServicos",
        value: novasMetas,
      },
    });
  };

  const handleRemoverMeta = (metaId) => {
    const metasExistentes = formData.acoesServicos || [];
    const metasAtualizadas = metasExistentes.filter(
      (meta) => meta.id !== metaId,
    );

    onChange({
      target: {
        name: "acoesServicos",
        value: metasAtualizadas,
      },
    });
  };

  const validarTotalMetas = () => {
    if (!formData.valorRecurso) return { valido: true, mensagem: "" };

    const valorEmenda = parseValorMonetario(formData.valorRecurso);

    const metasExistentes = formData.acoesServicos || [];
    const totalMetasExistentes = metasExistentes.reduce((sum, meta) => {
      const valor = parseValorMonetario(meta.valorAcao);
      return sum + valor;
    }, 0);

    let valorMetaAtual = 0;
    if (formData.valorAcao) {
      valorMetaAtual = parseValorMonetario(formData.valorAcao);
    }

    const totalGeral = totalMetasExistentes + valorMetaAtual;
    const saldoDisponivel = valorEmenda - totalMetasExistentes;

    if (totalGeral > valorEmenda) {
      return {
        valido: false,
        mensagem: `⚠️ Valor excede saldo disponível: R$ ${saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        saldoDisponivel: saldoDisponivel,
      };
    }

    return {
      valido: true,
      mensagem: `✅ Saldo disponível: R$ ${saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      saldoDisponivel: saldoDisponivel,
    };
  };

  const validacaoTotal = validarTotalMetas();
  const metasExistentes = formData.acoesServicos || [];
  const estrategiaAtual = modoCustomizado
    ? despesaCustomizada
    : formData.estrategia;

  // ✅ Validação adicional: botão só ativa se tem valor preenchido
  const valorPreenchido =
    formData.valorAcao && parseValorMonetario(formData.valorAcao) > 0;
  const podeAdicionar =
    estrategiaAtual && validacaoTotal.valido && valorPreenchido;

  // ✅ ALTERAÇÃO: Texto dinâmico "Despesa" / "Despesas"
  const textoDespesas =
    metasExistentes.length === 1
      ? "Despesa Cadastrada"
      : "Despesas Cadastradas";

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🎯</span>
        Planejamento de Despesas
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Natureza de Despesas</label>

          {!modoCustomizado ? (
            <select
              name="estrategia"
              value={formData.estrategia || ""}
              onChange={handleEstrategiaChange}
              style={{
                ...styles.input,
                ...(fieldErrors.estrategia && styles.inputError),
              }}
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
            <div style={styles.inputCustomizadoWrapper}>
              <input
                type="text"
                value={despesaCustomizada}
                onChange={handleDespesaCustomizadaChange}
                placeholder="Digite a natureza de despesa..."
                style={{
                  ...styles.input,
                  ...(fieldErrors.estrategia && styles.inputError),
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setModoCustomizado(false);
                  setDespesaCustomizada("");
                  onChange({ target: { name: "estrategia", value: "" } });
                }}
                style={styles.voltarButton}
                title="Voltar para seleção"
              >
                ↩️
              </button>
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>
            Valor <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="valorAcao"
            value={formData.valorAcao || ""}
            onChange={handleValorChange}
            style={{
              ...styles.input,
              ...styles.inputMoney,
              ...(fieldErrors.valorAcao && styles.inputError),
              ...(!validacaoTotal.valido && styles.inputError),
            }}
            placeholder="R$ 0,00"
            required
          />
          {!validacaoTotal.valido && (
            <small style={styles.errorText}>{validacaoTotal.mensagem}</small>
          )}
        </div>

        <div style={styles.formGroupButton}>
          <label style={styles.labelInvisible}>Ação</label>
          <button
            type="button"
            style={{
              ...styles.addButton,
              ...(!podeAdicionar && styles.addButtonDisabled),
            }}
            onClick={handleAdicionarMeta}
            disabled={!podeAdicionar}
          >
            ➕ Adicionar
          </button>
        </div>
      </div>

      {/* Lista de Despesas */}
      {metasExistentes.length > 0 && (
        <>
          <div style={styles.metasContainer}>
            <div style={styles.metasHeader}>
              <span style={styles.metasTitle}>
                📋 {metasExistentes.length} {textoDespesas}
              </span>
              <span style={styles.metasTotal}>
                Total:{" "}
                {metasExistentes
                  .reduce((sum, meta) => {
                    const valor = parseValorMonetario(meta.valorAcao);
                    return sum + valor;
                  }, 0)
                  .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
              </span>
            </div>

            <div style={styles.metasList}>
              {metasExistentes.map((meta, index) => {
                // Calcular saldo disponível para esta natureza
                const valorPlanejado = parseValorMonetario(meta.valorAcao);
                const valorExecutado = (despesas || [])
                  .filter((d) => d.estrategia === meta.estrategia)
                  .reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
                const saldoDisponivel = valorPlanejado - valorExecutado;
                const percentualDisponivel =
                  valorPlanejado > 0
                    ? ((saldoDisponivel / valorPlanejado) * 100).toFixed(1)
                    : 100;

                return (
                  <div key={meta.id} style={styles.metaItem}>
                    <div style={styles.metaContent}>
                      <div style={styles.metaTopLine}>
                        <span style={styles.metaNumber}>#{index + 1}</span>
                        <span style={styles.metaStrategy}>
                          {meta.estrategia}
                        </span>
                        <span style={styles.metaValue}>{meta.valorAcao}</span>
                      </div>
                      <div style={styles.metaSaldoLine}>
                        <span style={styles.metaSaldoLabel}>
                          Saldo disponível:
                        </span>
                        <span
                          style={{
                            ...styles.metaSaldoValue,
                            color: saldoDisponivel >= 0 ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {saldoDisponivel.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                        <span style={styles.metaSaldoPercent}>
                          ({percentualDisponivel}% disponível)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoverMeta(meta.id)}
                      style={styles.removeButton}
                      title="Remover natureza"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Totalizador final */}
            <div style={styles.metasFooter}>
              <span style={styles.footerLabel}>Saldo total para executar:</span>
              <span style={styles.footerValue}>
                {metasExistentes
                  .reduce((sum, meta) => {
                    const valorPlanejado = parseValorMonetario(meta.valorAcao);
                    const valorExecutado = (despesas || [])
                      .filter((d) => d.estrategia === meta.estrategia)
                      .reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
                    return sum + (valorPlanejado - valorExecutado);
                  }, 0)
                  .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
              </span>
            </div>
          </div>
        </>
      )}
    </fieldset>
  );
};

const styles = {
  fieldset: {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#154360",
    borderRadius: "10px",
    padding: "16px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "16px",
  },
  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#154360",
    color: "#154360",
    fontWeight: "bold",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendIcon: {
    fontSize: "18px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr auto",
    gap: "20px",
    marginBottom: "24px",
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
  labelInvisible: {
    fontWeight: "600",
    color: "transparent",
    fontSize: "13px",
    marginBottom: "2px",
    visibility: "hidden",
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
  required: {
    color: "#dc3545",
  },
  input: {
    padding: "8px 12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#dee2e6",
    borderRadius: "4px",
    fontSize: "14px",
    transition: "border-color 0.2s ease",
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
  metasContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #dee2e6",
    overflow: "hidden",
  },
  metasHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#e9ecef",
    borderBottom: "1px solid #dee2e6",
  },
  metasTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#154360",
  },
  metasTotal: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#28a745",
  },
  // ==================================
  // === 🎯 INÍCIO DA MODIFICAÇÃO 1 ===
  // ==================================
  metasList: {
    // ✅ CORRIGIDO: Transformado em grid para parecer "card"
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))",
    gap: "16px",
    padding: "16px", // Adicionado padding para o grid
    // ❌ REMOVIDO:
    // maxHeight: "200px",
    // overflowY: "auto",
  },
  metaItem: {
    // ✅ CORRIGIDO: Estilo de CARD aplicado (amarelo)
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "12px 16px", // Padding padrão de card
    backgroundColor: "#fffbeb", // Fundo amarelo (do print)
    borderRadius: "8px", // Borda arredondada
    border: "1px solid #fde68a", // Borda amarela
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    minHeight: "100px", // Altura mínima para alinhamento
    // ❌ REMOVIDO:
    // borderBottom: "1px solid #e9ecef",
    // backgroundColor: "white",
  },
  // ==================================
  // === 🎯 FIM DA MODIFICAÇÃO 1 ===
  // ==================================
  metaContent: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  metaTopLine: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  metaInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  metaNumber: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6c757d",
    minWidth: "24px",
  },
  metaStrategy: {
    fontSize: "13px",
    color: "#495057",
    flex: 1,
    fontWeight: "500",
  },
  metaValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#154360",
    minWidth: "120px",
    textAlign: "right",
  },
  metaSaldoLine: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingLeft: "36px",
    fontSize: "12px",
  },
  metaSaldoLabel: {
    color: "#6b7280",
  },
  metaSaldoValue: {
    fontWeight: "600",
    fontSize: "13px",
  },
  metaSaldoPercent: {
    color: "#9ca3af",
    fontSize: "11px",
  },
  metasFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#f8f9fa",
    borderTop: "2px solid #dee2e6",
    fontWeight: "600",
  },
  footerLabel: {
    fontSize: "14px",
    color: "#495057",
  },
  footerValue: {
    fontSize: "16px",
    color: "#16a34a",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "8px",
  },
};

export default AcoesServicos;
