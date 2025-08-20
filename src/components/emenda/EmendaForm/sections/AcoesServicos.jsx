import React from "react";

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

  const formatarMoeda = (valor) => {
    if (!valor) return "";
    const numero = valor.replace(/\D/g, "");
    if (!numero) return "";
    const centavos = parseInt(numero, 10);
    const reais = centavos / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(reais);
  };

  const handleValorChange = (e) => {
    const { name, value } = e.target;
    const valorFormatado = formatarMoeda(value);
    onChange({ target: { name, value: valorFormatado } });
  };

  // ✅ NOVA FUNÇÃO: Adicionar nova meta
  const handleAdicionarMeta = () => {
    // Validar se campos obrigatórios estão preenchidos
    if (!formData.estrategia || !formData.tipoMeta) {
      alert("⚠️ Preencha Estratégia e Tipo antes de adicionar a meta!");
      return;
    }

    // Validar valor para meta quantitativa
    if (formData.tipoMeta === "Quantitativa" && !formData.valorAcao) {
      alert("⚠️ Preencha o Valor para meta do tipo Quantitativa!");
      return;
    }

    // Criar nova meta
    const novaMeta = {
      id: Date.now(),
      estrategia: formData.estrategia,
      tipoMeta: formData.tipoMeta,
      valorAcao:
        formData.tipoMeta === "Quantitativa" ? formData.valorAcao : "0",
    };

    // Obter metas existentes
    const metasExistentes = formData.acoesServicos || [];

    // Adicionar nova meta ao array
    const novasMetas = [...metasExistentes, novaMeta];

    // Limpar campos para nova meta
    onChange({ target: { name: "estrategia", value: "" } });
    onChange({ target: { name: "tipoMeta", value: "" } });
    onChange({ target: { name: "valorAcao", value: "" } });

    // Atualizar array de metas
    onChange({
      target: {
        name: "acoesServicos",
        value: novasMetas,
      },
    });

    console.log("✅ Nova meta adicionada:", novaMeta);
  };

  // ✅ FUNÇÃO: Remover meta
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

    console.log("🗑️ Meta removida:", metaId);
  };

  // ✅ VALIDAÇÃO INTELIGENTE: Total de metas vs valor da emenda
  const validarTotalMetas = () => {
    if (!formData.valorRecurso) return { valido: true, mensagem: "" };

    const valorEmenda = parseFloat(
      formData.valorRecurso
        .toString()
        .replace(/[R$\s]/g, "")
        .replace(/\./g, "")
        .replace(",", "."),
    );

    // Somar valores de todas as metas quantitativas existentes
    const metasExistentes = formData.acoesServicos || [];
    const totalMetasExistentes = metasExistentes.reduce((sum, meta) => {
      if (meta.tipoMeta === "Quantitativa") {
        const valor = parseFloat(
          meta.valorAcao
            .replace(/[R$\s]/g, "")
            .replace(/\./g, "")
            .replace(",", "."),
        );
        return sum + valor;
      }
      return sum;
    }, 0);

    // Valor da meta atual (se quantitativa)
    let valorMetaAtual = 0;
    if (formData.tipoMeta === "Quantitativa" && formData.valorAcao) {
      valorMetaAtual = parseFloat(
        formData.valorAcao
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );
    }

    const totalGeral = totalMetasExistentes + valorMetaAtual;
    const saldoDisponivel = valorEmenda - totalMetasExistentes;

    if (totalGeral > valorEmenda) {
      return {
        valido: false,
        mensagem: `❌ Valor de Meta incorreto. Já foi consumido R$ ${totalMetasExistentes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} do valor da Emenda. Saldo disponível: R$ ${saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
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
  const isMetaQuantitativa = formData.tipoMeta === "Quantitativa";
  const metasExistentes = formData.acoesServicos || [];

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🎯</span>
        Ações e Serviços
        <span style={styles.optionalBadge}>SEÇÃO OPCIONAL NA CRIAÇÃO</span>
      </legend>

      {/* ✅ ALERTA INFORMATIVO */}
      <div style={styles.infoAlert}>
        <span style={styles.alertIcon}>💡</span>
        <div style={styles.alertText}>
          <strong>Esta seção é opcional durante a criação inicial.</strong>
          <br />
          Você pode preenchê-la agora ou adicionar as metas posteriormente
          durante a edição da emenda.
        </div>
      </div>

      <div style={styles.formGrid}>
        {/* ✅ MELHORIA 3: Estratégia - SEM ASTERISCO (OPCIONAL) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Estratégia
            <span style={styles.optionalLabel}>opcional</span>
          </label>
          <select
            name="estrategia"
            value={formData.estrategia || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.estrategia && styles.inputError),
            }}
          >
            <option value="">Selecione a estratégia</option>
            {estrategias.map((estrategia) => (
              <option key={estrategia} value={estrategia}>
                {estrategia}
              </option>
            ))}
          </select>
          {fieldErrors.estrategia && (
            <small style={styles.errorText}>
              Campo obrigatório para adicionar meta
            </small>
          )}
        </div>

        {/* ✅ MELHORIA 3: Tipo - SEM ASTERISCO (OPCIONAL) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Tipo
            <span style={styles.optionalLabel}>opcional</span>
          </label>
          <select
            name="tipoMeta"
            value={formData.tipoMeta || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.tipoMeta && styles.inputError),
            }}
          >
            <option value="">Selecione o tipo</option>
            {tiposMeta.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {fieldErrors.tipoMeta && (
            <small style={styles.errorText}>
              Campo obrigatório para adicionar meta
            </small>
          )}
        </div>

        {/* ✅ MELHORIA 3: Valor - SEM ASTERISCO (CONDICIONAL) */}
        {isMetaQuantitativa && (
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Valor
              <span style={styles.conditionalLabel}>
                obrigatório se Quantitativa
              </span>
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
            />
            {!validacaoTotal.valido && (
              <small style={styles.errorText}>{validacaoTotal.mensagem}</small>
            )}
            {validacaoTotal.valido &&
              validacaoTotal.saldoDisponivel !== undefined && (
                <small style={styles.successText}>
                  {validacaoTotal.mensagem}
                </small>
              )}
            {fieldErrors.valorAcao && validacaoTotal.valido && (
              <small style={styles.errorText}>
                Campo obrigatório para meta quantitativa
              </small>
            )}
          </div>
        )}
      </div>

      {/* ✅ LISTAGEM DE METAS ADICIONADAS */}
      {metasExistentes.length > 0 && (
        <div style={styles.metasListContainer}>
          <h4 style={styles.metasListTitle}>📋 Metas Cadastradas</h4>
          {metasExistentes.map((meta, index) => (
            <div key={meta.id} style={styles.metaItem}>
              <div style={styles.metaContent}>
                <div style={styles.metaHeader}>
                  <span style={styles.metaNumber}>Meta {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoverMeta(meta.id)}
                    style={styles.removeButton}
                    title="Remover meta"
                  >
                    🗑️
                  </button>
                </div>
                <div style={styles.metaDetails}>
                  <p>
                    <strong>Estratégia:</strong> {meta.estrategia}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {meta.tipoMeta}
                  </p>
                  {meta.tipoMeta === "Quantitativa" && (
                    <p>
                      <strong>Valor:</strong> {meta.valorAcao}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div style={styles.metasTotal}>
            <strong>
              Total Quantitativo:{" "}
              {metasExistentes
                .filter((meta) => meta.tipoMeta === "Quantitativa")
                .reduce((sum, meta) => {
                  const valor = parseFloat(
                    meta.valorAcao
                      .replace(/[R$\s]/g, "")
                      .replace(/\./g, "")
                      .replace(",", "."),
                  );
                  return sum + valor;
                }, 0)
                .toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
            </strong>
          </div>
        </div>
      )}

      {/* ✅ AVISO QUANDO NÃO HÁ METAS */}
      {metasExistentes.length === 0 && (
        <div style={styles.emptyAlert}>
          <span style={styles.alertIcon}>📝</span>
          <div style={styles.alertText}>
            <strong>Nenhuma meta cadastrada ainda.</strong>
            <br />
            Esta seção é opcional na criação inicial. Você pode adicionar metas
            agora ou posteriormente na edição.
          </div>
        </div>
      )}

      {/* Botão para adicionar mais metas - MELHORADO */}
      <div style={styles.addMetaSection}>
        <button
          type="button"
          style={{
            ...styles.addMetaButton,
            ...((!formData.estrategia ||
              !formData.tipoMeta ||
              !validacaoTotal.valido) &&
              styles.addMetaButtonDisabled),
          }}
          onClick={handleAdicionarMeta}
          disabled={
            !formData.estrategia || !formData.tipoMeta || !validacaoTotal.valido
          }
        >
          ➕ Adicionar Nova Meta
        </button>
        <small style={styles.addMetaHint}>
          {metasExistentes.length === 0
            ? "Preencha os campos acima e clique para adicionar (opcional)"
            : "Campos serão limpos após adicionar para criar nova meta"}
        </small>
      </div>
    </fieldset>
  );
};

const styles = {
  fieldset: {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#154360",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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

  // ✅ MELHORIA 3: NOVOS ESTILOS PARA LABELS OPCIONAIS
  optionalBadge: {
    color: "#28a745",
    fontSize: "11px",
    fontWeight: "600",
    marginLeft: "10px",
    backgroundColor: "#d4edda",
    padding: "3px 8px",
    borderRadius: "4px",
    border: "1px solid #c3e6cb",
  },

  optionalLabel: {
    color: "#28a745",
    fontSize: "11px",
    fontWeight: "500",
    marginLeft: "8px",
    backgroundColor: "#d4edda",
    padding: "2px 6px",
    borderRadius: "4px",
    border: "1px solid #c3e6cb",
  },

  conditionalLabel: {
    color: "#fd7e14",
    fontSize: "11px",
    fontWeight: "500",
    marginLeft: "8px",
    backgroundColor: "#fff3cd",
    padding: "2px 6px",
    borderRadius: "4px",
    border: "1px solid #ffeaa7",
  },

  infoAlert: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#e8f5e8",
    border: "1px solid #c3e6cb",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  required: {
    color: "#dc3545",
  },
  input: {
    padding: "12px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },
  inputMoney: {
    fontWeight: "600",
    color: "#059669",
    textAlign: "right",
    fontSize: "16px",
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  textarea: {
    padding: "12px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    resize: "vertical",
    fontFamily: "inherit",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
    fontWeight: "bold",
  },

  // ✅ NOVOS ESTILOS: Seção de adicionar meta
  addMetaSection: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    borderWidth: "2px",
    borderStyle: "dashed",
    borderColor: "#dee2e6",
    textAlign: "center",
  },

  addMetaButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "8px",
  },

  addMetaButtonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
    opacity: 0.6,
  },

  addMetaHint: {
    display: "block",
    color: "#6c757d",
    fontSize: "12px",
    fontStyle: "italic",
  },

  // ✅ NOVOS ESTILOS: Lista de metas
  metasListContainer: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#dee2e6",
  },

  metasListTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#154360",
  },

  metaItem: {
    marginBottom: "12px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e9ecef",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  metaContent: {
    width: "100%",
  },

  metaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },

  metaNumber: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#28a745",
  },

  removeButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },

  emptyAlert: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#fff3cd",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ffeaa7",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  alertIcon: {
    fontSize: "24px",
  },
  alertText: {
    color: "#856404",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  globalError: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px 16px",
    borderRadius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#f5c6cb",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },
  metasTotal: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#e8f5e8",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "14px",
    color: "#155724",
  },

  successText: {
    color: "#28a745",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
    fontWeight: "500",
  },

  metaDetails: {
    fontSize: "13px",
    color: "#495057",
    lineHeight: "1.4",
  },
};

export default AcoesServicos;
