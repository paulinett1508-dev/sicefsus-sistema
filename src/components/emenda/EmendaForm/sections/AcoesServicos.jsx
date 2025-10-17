import React from "react";
import { formatarMoedaInput, parseValorMonetario } from "../../../../utils/formatters";

const AcoesServicos = ({ formData = {}, onChange, fieldErrors = {} }) => {
  const estrategias = [
    "Aquisição de Insumos e Materiais de Uso Contínuo para Acompanhamento de Pessoas com Condições Crônicas",
    "Oferta de medicamentos da Atenção Básica",
    "Manutenção da oferta de medicamentos, insumos e materiais de forma regular para os estabelecimentos de saúde",
    "Estratégia de Rastreamento e Controle de Condições Crônicas",
    "Custeio de serviços especializados",
    "Reforma e adequação de unidades de saúde",
    "Construção de novas unidades",
    "Aquisição de equipamentos médicos",
    "Capacitação de profissionais",
    "Outros",
  ];

  const tiposMeta = ["Quantitativa", "Simples"];

  const handleInputChange = (e) => {
    onChange(e);
  };

  const handleValorChange = (e) => {
    const { name, value } = e.target;
    const valorFormatado = formatarMoedaInput(value);
    onChange({ target: { name, value: valorFormatado } });
  };

  const handleAdicionarMeta = () => {
    if (!formData.estrategia) {
      alert("⚠️ Preencha Natureza de Despesas antes de adicionar a meta!");
      return;
    }

    // Determinar tipo de meta baseado se há valor preenchido
    const temValor = formData.valorAcao && parseValorMonetario(formData.valorAcao) > 0;
    const tipoMeta = temValor ? "Quantitativa" : "Simples";

    const novaMeta = {
      id: Date.now(),
      estrategia: formData.estrategia,
      tipoMeta: tipoMeta,
      valorAcao: temValor ? formData.valorAcao : "0",
    };

    const metasExistentes = formData.acoesServicos || [];
    const novasMetas = [...metasExistentes, novaMeta];

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
      if (meta.tipoMeta === "Quantitativa") {
        const valor = parseValorMonetario(meta.valorAcao);
        return sum + valor;
      }
      return sum;
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

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🎯</span>
        Planejamento de Despesas
      </legend>

      {/* Formulário Compacto */}
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Natureza de Despesas</label>
          <select
            name="estrategia"
            value={formData.estrategia || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.estrategia && styles.inputError),
            }}
          >
            <option value="">Selecione a natureza de despesas</option>
            {estrategias.map((estrategia) => (
              <option key={estrategia} value={estrategia}>
                {estrategia}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Valor (opcional)</label>
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
          />
          {!validacaoTotal.valido && (
            <small style={styles.errorText}>{validacaoTotal.mensagem}</small>
          )}
          <small style={styles.helpText}>
            Deixe em branco para meta simples
          </small>
        </div>

        <div style={styles.formGroup}>
          <button
            type="button"
            style={{
              ...styles.addButton,
              ...((!formData.estrategia || !validacaoTotal.valido) &&
                styles.addButtonDisabled),
            }}
            onClick={handleAdicionarMeta}
            disabled={!formData.estrategia || !validacaoTotal.valido}
          >
            ➕ Adicionar Meta
          </button>
        </div>
      </div>

      {/* Lista de Metas - Layout Compacto */}
      {metasExistentes.length > 0 && (
        <div style={styles.metasContainer}>
          <div style={styles.metasHeader}>
            <span style={styles.metasTitle}>
              📋 {metasExistentes.length} Meta(s) Cadastrada(s)
            </span>
            <span style={styles.metasTotal}>
              Total:{" "}
              {metasExistentes
                .filter((meta) => meta.tipoMeta === "Quantitativa")
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
            {metasExistentes.map((meta, index) => (
              <div key={meta.id} style={styles.metaItem}>
                <div style={styles.metaInfo}>
                  <span style={styles.metaNumber}>#{index + 1}</span>
                  <span style={styles.metaStrategy}>{meta.estrategia}</span>
                  <span style={styles.metaType}>{meta.tipoMeta}</span>
                  {meta.tipoMeta === "Quantitativa" && (
                    <span style={styles.metaValue}>{meta.valorAcao}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoverMeta(meta.id)}
                  style={styles.removeButton}
                  title="Remover meta"
                >
                  🗑️
                </button>
              </div>
            ))}
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

  // Grid Compacto - 2 colunas em telas grandes
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "24px",
    alignItems: "start",
  },

  formGroup: {
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

  helpText: {
    color: "#6c757d",
    fontSize: "11px",
    marginTop: "2px",
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

  // Layout de Metas Compacto
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

  metasList: {
    maxHeight: "200px",
    overflowY: "auto",
  },

  metaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "white",
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
    fontSize: "12px",
    color: "#495057",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  metaType: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#007bff",
    backgroundColor: "#e7f3ff",
    padding: "2px 6px",
    borderRadius: "4px",
    minWidth: "80px",
    textAlign: "center",
  },

  metaValue: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#28a745",
    minWidth: "80px",
    textAlign: "right",
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

  // Responsividade
  "@media (max-width: 768px)": {
    formGrid: {
      gridTemplateColumns: "1fr",
      gap: "8px",
    },
    metaInfo: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "4px",
    },
  },
};

export default AcoesServicos;