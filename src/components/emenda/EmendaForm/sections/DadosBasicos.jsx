// src/components/emenda/EmendaForm/sections/DadosBasicos.jsx
import React from "react";

const DadosBasicos = ({ formData = {}, onChange, fieldErrors = {} }) => {
  // ✅ PROTEÇÃO CONTRA FORMDATA UNDEFINED
  if (!formData) {
    return <div>Carregando dados...</div>;
  }
  const programas = [
    "Incremento ao custeio de serviços da atenção primária à saúde",
    "Aquisição de equipamentos",
    "Construção e ampliação",
    "Reforma e adequação",
    "Custeio de serviços especializados",
    "Apoio à gestão do SUS",
    "Vigilância em Saúde",
    "Assistência Farmacêutica",
    "Outro",
  ];

  // ✅ FORMATAÇÃO MONETÁRIA INTELIGENTE
  const formatarMoedaInput = (valor) => {
    // Remove tudo exceto números
    const numero = valor.replace(/\D/g, "");

    if (!numero) return "";

    // Converte para centavos
    const centavos = parseInt(numero, 10);
    const reais = centavos / 100;

    // Formata como moeda brasileira
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(reais);
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // ✅ FORMATAÇÃO ESPECIAL PARA CAMPOS MONETÁRIOS
    if (name === "valor" || name === "valorRecurso") {
      const valorFormatado = formatarMoedaInput(value);
      onChange({ target: { name, value: valorFormatado } });
    } else {
      onChange(e);
    }
  };

  // Formatação monetária para exibição
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "R$ 0,00";
    const numericValue =
      parseFloat(
        value
          .toString()
          .replace(/[^\d,.-]/g, "")
          .replace(",", ".") || "0",
      ) || 0;
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Cálculos
  const getValorExecutado = () => {
    return parseFloat(formData?.valorExecutado || 0) || 0;
  };

  const getSaldo = () => {
    // ✅ PROTEÇÃO CONTRA UNDEFINED
    const valorBase = formData?.valor || formData?.valorRecurso || "0";
    const valorRecurso =
      parseFloat(
        valorBase
          .toString()
          .replace(/[^\d,.-]/g, "")
          .replace(",", ".") || "0",
      ) || 0;

    const outrosValores = parseFloat(formData?.outrosValores || 0) || 0;
    const valorTotal = valorRecurso + outrosValores;
    const valorExecutado = getValorExecutado();
    const saldo = valorTotal - valorExecutado;
    return { valorTotal, valorExecutado, saldo };
  };

  const { valorTotal, valorExecutado, saldo } = getSaldo();

  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        <span style={styles.sectionIcon}>💰</span>
        Dados Básicos
      </h3>

      {/* Primeira linha - Programa e Objeto */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>
            Programa <span style={styles.required}>*</span>
          </label>
          <select
            name="programa"
            value={formData?.programa || ""}
            onChange={onChange}
            style={styles.input}
            required
          >
            <option value="">Selecione o programa</option>
            {programas.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
          {fieldErrors?.programa && (
            <span style={styles.errorText}>{fieldErrors.programa}</span>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            Objeto da Proposta <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="objeto"
            value={formData?.objeto || ""}
            onChange={onChange}
            placeholder="Ex: Custeio da atenção primária à saúde"
            style={styles.input}
            required
          />
          {fieldErrors?.objeto && (
            <span style={styles.errorText}>{fieldErrors.objeto}</span>
          )}
        </div>
      </div>

      {/* Segunda linha - Parlamentar e Número */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>
            Parlamentar/Autor <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="autor"
            value={formData?.autor || ""}
            onChange={onChange}
            placeholder="Nome do parlamentar"
            style={{
              ...styles.input,
              ...(fieldErrors?.autor ? styles.inputError : {}),
            }}
            required
          />
          {fieldErrors?.autor && (
            <span style={styles.errorText}>{fieldErrors.autor}</span>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            Número da Emenda <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="numero"
            value={formData?.numero || ""}
            onChange={onChange}
            placeholder="Ex: 30460003"
            style={{
              ...styles.input,
              ...(fieldErrors?.numero ? styles.inputError : {}),
            }}
            required
          />
          {fieldErrors?.numero && (
            <span style={styles.errorText}>{fieldErrors.numero}</span>
          )}
        </div>
      </div>

      {/* Terceira linha - Tipo de Emenda e Nº da Proposta */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>
            Tipo de Emenda <span style={styles.required}>*</span>
          </label>
          <select
            name="tipo"
            value={formData?.tipo || "Individual"}
            onChange={onChange}
            style={styles.input}
            required
          >
            <option value="Individual">Emenda Individual</option>
            <option value="Bancada">Emenda de Bancada</option>
            <option value="Comissao">Emenda de Comissão</option>
            <option value="Relator">Emenda de Relator</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Nº da Proposta</label>
          <input
            type="text"
            name="numeroProposta"
            value={formData?.numeroProposta || ""}
            onChange={onChange}
            placeholder="Ex: 36000660361202500"
            style={styles.input}
          />
        </div>
      </div>

      {/* Quarta linha - Funcional e Beneficiário */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Funcional</label>
          <input
            type="text"
            name="funcional"
            value={formData?.funcional || ""}
            onChange={onChange}
            placeholder="Ex: 10301311928590021"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Beneficiário (CNPJ)</label>
          <input
            type="text"
            name="cnpjBeneficiario"
            value={formData?.cnpjBeneficiario || ""}
            onChange={onChange}
            placeholder="Ex: 11818604000166"
            style={styles.input}
          />
        </div>
      </div>

      {/* ✅ QUINTA LINHA - VALORES COM FORMATAÇÃO MELHORADA */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>
            Valor do Recurso <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="valor"
            value={formData?.valor || ""}
            onChange={handleInputChange}
            placeholder="R$ 0,00"
            style={{
              ...styles.input,
              ...styles.inputMoney,
              ...(fieldErrors?.valor ? styles.inputError : {}),
            }}
            required
          />
          {fieldErrors?.valor && (
            <span style={styles.errorText}>{fieldErrors.valor}</span>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Modalidade</label>
          <select
            name="modalidade"
            value={formData?.modalidade || ""}
            onChange={onChange}
            style={styles.input}
          >
            <option value="">Selecione a modalidade</option>
            <option value="Fundo a Fundo">Fundo a Fundo</option>
            <option value="Convênio">Convênio</option>
            <option value="Contrato">Contrato</option>
            <option value="Termo de Cooperação">Termo de Cooperação</option>
          </select>
        </div>
      </div>

      {/* Card de Resumo Financeiro */}
      <div style={styles.financialSummary}>
        <h4 style={styles.summaryTitle}>Resumo Financeiro</h4>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Valor Total:</span>
            <span style={styles.summaryValue}>
              {formatCurrency(valorTotal)}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Valor Executado:</span>
            <span style={styles.summaryValueExecuted}>
              {formatCurrency(valorExecutado)}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Saldo Disponível:</span>
            <span style={styles.summaryValueSaldo}>
              {formatCurrency(saldo)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  section: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e9ecef",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#2c3e50",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionIcon: {
    fontSize: "20px",
  },
  // ✅ GRID SINCRONIZADO - FORÇANDO ALINHAMENTO
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
    alignItems: "start",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#495057",
  },
  required: {
    color: "#dc3545",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backgroundColor: "white",
    width: "100%",
  },
  // ✅ ESTILO ESPECIAL PARA CAMPO MONETÁRIO
  inputMoney: {
    fontWeight: "600",
    color: "#059669",
    textAlign: "right",
    fontSize: "16px",
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
  },
  helperText: {
    fontSize: "12px",
    color: "#6c757d",
    marginTop: "4px",
  },
  financialSummary: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    marginTop: "24px",
    border: "1px solid #e9ecef",
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#2c3e50",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  summaryValueExecuted: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#dc3545",
  },
  summaryValueSaldo: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#28a745",
  },
};

export default DadosBasicos;
