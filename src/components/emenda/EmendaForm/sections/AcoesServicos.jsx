// src/components/emenda/EmendaForm/sections/AcoesServicos.jsx
// ✅ CORRIGIDO: Layout compacto e profissional em formato de tabela
// ✅ Otimizado para visualizar 50+ despesas sem problemas

import React, { useState } from "react";
import {
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../../utils/formatters";
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

      {/* Lista de Despesas - FORMATO TABELA COMPACTA */}
      {metasExistentes.length > 0 && (
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

          {/* ✅ TABELA COMPACTA E PROFISSIONAL */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.thNatureza}>NATUREZA</th>
                  <th style={styles.thValor}>VALOR PLANEJADO</th>
                  <th style={styles.thStatus}>STATUS</th>
                  <th style={styles.thAcoes}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
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
                    <tr
                      key={meta.id}
                      style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      <td style={styles.tdNatureza}>{meta.estrategia}</td>
                      <td style={styles.tdValor}>
                        {parseValorMonetario(meta.valorAcao).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          },
                        )}
                      </td>
                      <td style={styles.tdStatus}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(parseFloat(percentualDisponivel) <= 0
                              ? styles.statusEsgotado
                              : parseFloat(percentualDisponivel) < 50
                                ? styles.statusParcial
                                : styles.statusDisponivel),
                          }}
                        >
                          ⚪ PLANEJADA
                        </span>
                      </td>
                      <td style={styles.tdAcoes}>
                        <button
                          type="button"
                          onClick={() => handleRemoverMeta(meta.id)}
                          style={styles.btnRemover}
                          title="Remover despesa"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer com saldo total disponível */}
          <div style={styles.metasFooter}>
            <span style={styles.footerLabel}>
              💰 Saldo Disponível Total (Planejado - Executado):
            </span>
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
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    border: "1px solid #dee2e6",
    overflow: "hidden",
  },
  metasHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },
  metasTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#154360",
  },
  metasTotal: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#28a745",
  },

  // ✅ TABELA COMPACTA E PROFISSIONAL
  tableWrapper: {
    overflowX: "auto",
    maxHeight: "400px",
    overflowY: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  tableHeader: {
    backgroundColor: "#f1f3f5",
    borderBottom: "2px solid #dee2e6",
  },
  thNatureza: {
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "11px",
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    position: "sticky",
    top: 0,
    backgroundColor: "#f1f3f5",
    zIndex: 1,
  },
  thValor: {
    padding: "8px 12px",
    textAlign: "right",
    fontWeight: "600",
    fontSize: "11px",
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    position: "sticky",
    top: 0,
    backgroundColor: "#f1f3f5",
    zIndex: 1,
  },
  thStatus: {
    padding: "8px 12px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "11px",
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    position: "sticky",
    top: 0,
    backgroundColor: "#f1f3f5",
    zIndex: 1,
  },
  thAcoes: {
    padding: "8px 12px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "11px",
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    width: "80px",
    position: "sticky",
    top: 0,
    backgroundColor: "#f1f3f5",
    zIndex: 1,
  },
  evenRow: {
    backgroundColor: "#ffffff",
  },
  oddRow: {
    backgroundColor: "#f8f9fa",
  },
  tdNatureza: {
    padding: "10px 12px",
    borderBottom: "1px solid #e9ecef",
    fontSize: "13px",
    color: "#212529",
    fontWeight: "500",
  },
  tdValor: {
    padding: "10px 12px",
    borderBottom: "1px solid #e9ecef",
    fontSize: "13px",
    color: "#28a745",
    fontWeight: "600",
    textAlign: "right",
    fontFamily: "monospace",
  },
  tdStatus: {
    padding: "10px 12px",
    borderBottom: "1px solid #e9ecef",
    textAlign: "center",
  },
  tdAcoes: {
    padding: "10px 12px",
    borderBottom: "1px solid #e9ecef",
    textAlign: "center",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "12px",
    display: "inline-block",
    whiteSpace: "nowrap",
  },
  statusDisponivel: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  statusParcial: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  statusEsgotado: {
    backgroundColor: "#d1ecf1",
    color: "#0c5460",
  },
  btnRemover: {
    backgroundColor: "transparent",
    color: "#dc3545",
    border: "1px solid #dc3545",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
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
    fontSize: "13px",
    color: "#495057",
  },
  footerValue: {
    fontSize: "15px",
    color: "#16a34a",
    fontWeight: "700",
  },
};

export default AcoesServicos;
