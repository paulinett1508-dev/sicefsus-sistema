// ATUALIZAÇÃO em src/components/despesa/DespesaFormDateFields.jsx
// Integrar validação de datas vs emenda

import React from "react";
import {
  validarDatasDespesaEmenda,
  formatarPeriodoVigenciaEmenda,
} from "../../utils/validators";

const DespesaFormDateFields = ({
  formData,
  errors,
  modoVisualizacao,
  handleInputChange,
  emendaInfo, // ✅ NOVO: Receber dados da emenda
}) => {
  // ✅ VALIDAÇÃO EM TEMPO REAL para cada campo de data
  const validarDataCampo = (nomeCampo, valor) => {
    if (!valor || !emendaInfo) return null;

    const validacao = validarDatasDespesaEmenda(valor, emendaInfo);
    return validacao.isValid ? null : validacao.errors[0];
  };

  // ✅ OBTER LIMITES de data baseado na emenda
  const obterLimitesData = () => {
    if (!emendaInfo) return { min: null, max: null };

    const dataInicio =
      emendaInfo.dataInicio ||
      emendaInfo.dataCriacao ||
      emendaInfo.dataAprovacao;
    const dataFim =
      emendaInfo.dataFim ||
      emendaInfo.dataValidade ||
      emendaInfo.dataVencimento;
    const hoje = new Date().toISOString().split("T")[0];

    return {
      min: dataInicio ? new Date(dataInicio).toISOString().split("T")[0] : null,
      max: dataFim
        ? Math.min(new Date(dataFim), new Date(hoje)) ===
          new Date(hoje).getTime()
          ? hoje
          : new Date(dataFim).toISOString().split("T")[0]
        : hoje,
    };
  };

  const limites = obterLimitesData();

  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        📅 <span>Datas da Execução</span>
      </h3>

      {/* ✅ BANNER informativo sobre período da emenda */}
      {emendaInfo && (
        <div style={styles.emendaDateBanner}>
          <div style={styles.bannerIcon}>📅</div>
          <div style={styles.bannerContent}>
            <strong>Período de Vigência da Emenda:</strong>
            <br />
            {formatarPeriodoVigenciaEmenda(emendaInfo)}
            <br />
            <small style={styles.bannerHint}>
              Todas as datas devem estar dentro deste período
            </small>
          </div>
        </div>
      )}

      <div style={styles.row}>
        {/* Data do Empenho */}
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>
            Data do Empenho <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="dataEmpenho"
            value={formData.dataEmpenho || ""}
            onChange={handleInputChange}
            min={limites.min}
            max={limites.max}
            style={{
              ...styles.input,
              borderColor:
                errors.dataEmpenho ||
                validarDataCampo("dataEmpenho", formData.dataEmpenho)
                  ? "#e74c3c"
                  : styles.input.borderColor,
            }}
            disabled={modoVisualizacao}
            required
          />
          {(errors.dataEmpenho ||
            validarDataCampo("dataEmpenho", formData.dataEmpenho)) && (
            <span style={styles.error}>
              {errors.dataEmpenho ||
                validarDataCampo("dataEmpenho", formData.dataEmpenho)}
            </span>
          )}
        </div>

        {/* Data da Liquidação */}
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>
            Data da Liquidação <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="dataLiquidacao"
            value={formData.dataLiquidacao || ""}
            onChange={handleInputChange}
            min={limites.min}
            max={limites.max}
            style={{
              ...styles.input,
              borderColor:
                errors.dataLiquidacao ||
                validarDataCampo("dataLiquidacao", formData.dataLiquidacao)
                  ? "#e74c3c"
                  : styles.input.borderColor,
            }}
            disabled={modoVisualizacao}
            required
          />
          {(errors.dataLiquidacao ||
            validarDataCampo("dataLiquidacao", formData.dataLiquidacao)) && (
            <span style={styles.error}>
              {errors.dataLiquidacao ||
                validarDataCampo("dataLiquidacao", formData.dataLiquidacao)}
            </span>
          )}
        </div>

        {/* Data do Pagamento */}
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>
            Data do Pagamento <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="dataPagamento"
            value={formData.dataPagamento || ""}
            onChange={handleInputChange}
            min={limites.min}
            max={limites.max}
            style={{
              ...styles.input,
              borderColor:
                errors.dataPagamento ||
                validarDataCampo("dataPagamento", formData.dataPagamento)
                  ? "#e74c3c"
                  : styles.input.borderColor,
            }}
            disabled={modoVisualizacao}
            required
          />
          {(errors.dataPagamento ||
            validarDataCampo("dataPagamento", formData.dataPagamento)) && (
            <span style={styles.error}>
              {errors.dataPagamento ||
                validarDataCampo("dataPagamento", formData.dataPagamento)}
            </span>
          )}
        </div>
      </div>

      {/* ✅ VALIDAÇÃO visual de sequência de datas */}
      {formData.dataEmpenho &&
        formData.dataLiquidacao &&
        formData.dataPagamento && (
          <ValidacaoSequenciaDatas
            dataEmpenho={formData.dataEmpenho}
            dataLiquidacao={formData.dataLiquidacao}
            dataPagamento={formData.dataPagamento}
          />
        )}
    </div>
  );
};

// ✅ COMPONENTE auxiliar para validar sequência lógica de datas
const ValidacaoSequenciaDatas = ({
  dataEmpenho,
  dataLiquidacao,
  dataPagamento,
}) => {
  const empenho = new Date(dataEmpenho);
  const liquidacao = new Date(dataLiquidacao);
  const pagamento = new Date(dataPagamento);

  const sequenciaCorreta = empenho <= liquidacao && liquidacao <= pagamento;

  return (
    <div
      style={{
        ...styles.sequenceValidation,
        backgroundColor: sequenciaCorreta
          ? "rgba(39, 174, 96, 0.1)"
          : "rgba(231, 76, 60, 0.1)",
        borderColor: sequenciaCorreta ? "#27ae60" : "#e74c3c",
      }}
    >
      <div style={styles.sequenceIcon}>{sequenciaCorreta ? "✅" : "⚠️"}</div>
      <div style={styles.sequenceContent}>
        <strong>
          {sequenciaCorreta
            ? "Sequência de Datas Correta"
            : "Atenção: Sequência de Datas"}
        </strong>
        <br />
        <small>
          {sequenciaCorreta
            ? "Empenho → Liquidação → Pagamento (ordem cronológica correta)"
            : "A ordem deve ser: Empenho ≤ Liquidação ≤ Pagamento"}
        </small>
      </div>
    </div>
  );
};

const styles = {
  section: {
    marginBottom: "32px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  emendaDateBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    borderRadius: "8px",
    border: "1px solid rgba(52, 152, 219, 0.3)",
    marginBottom: "20px",
  },

  bannerIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },

  bannerContent: {
    fontSize: "14px",
    color: "rgba(52, 152, 219, 0.8)",
    lineHeight: "1.4",
  },

  bannerHint: {
    color: "rgba(52, 152, 219, 0.6)",
    fontStyle: "italic",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
  },

  labelRequired: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: "8px",
  },

  required: {
    color: "#e74c3c",
  },

  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "2px solid #e1e8ed",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
  },

  error: {
    color: "#e74c3c",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },

  sequenceValidation: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid",
    marginTop: "16px",
  },

  sequenceIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },

  sequenceContent: {
    fontSize: "13px",
    lineHeight: "1.4",
  },
};

export default DespesaFormDateFields;
