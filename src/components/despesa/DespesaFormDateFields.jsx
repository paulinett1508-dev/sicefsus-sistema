// src/components/despesa/DespesaFormDateFields.jsx
// ✅ LAYOUT MELHORADO: Igual ao Cronograma + Validação em tempo real

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
  emendaInfo, // ✅ Dados da emenda para validação
  onValidationChange, // ✅ NOVO: Callback para informar estado de validação ao formulário pai
}) => {
  // ✅ VALIDAÇÃO ROBUSTA baseada na Lei 4.320/64
  const validarDataCampo = (nomeCampo, valor) => {
    if (!valor) return { isValid: false, message: "Data obrigatória" };
    if (!emendaInfo) return { isValid: true, message: "" };

    const dataAtual = new Date();
    const dataInformada = new Date(valor);

    // 1. VALIDAÇÃO: Data não pode ser futura
    if (dataInformada > dataAtual) {
      return { isValid: false, message: "Data não pode ser futura" };
    }

    // 2. VALIDAÇÃO: Data deve estar no período da emenda
    const dataInicio =
      emendaInfo.dataInicio ||
      emendaInfo.dataCriacao ||
      emendaInfo.dataAprovacao;
    const dataFim =
      emendaInfo.dataFim ||
      emendaInfo.dataValidade ||
      emendaInfo.dataVencimento;

    if (dataInicio && dataInformada < new Date(dataInicio)) {
      return {
        isValid: false,
        message: `Data deve ser posterior ao início da emenda (${new Date(dataInicio).toLocaleDateString("pt-BR")})`,
      };
    }

    if (dataFim && dataInformada > new Date(dataFim)) {
      return {
        isValid: false,
        message: `Data deve ser anterior ao fim da emenda (${new Date(dataFim).toLocaleDateString("pt-BR")})`,
      };
    }

    // 3. VALIDAÇÃO ESPECÍFICA: Sequência cronológica obrigatória (Lei 4.320/64)
    if (nomeCampo === "dataLiquidacao" && formData.dataEmpenho) {
      const dataEmpenho = new Date(formData.dataEmpenho);
      if (dataInformada < dataEmpenho) {
        return {
          isValid: false,
          message:
            "Liquidação deve ser posterior ao empenho (Lei 4.320/64, Art. 63)",
        };
      }
    }

    if (nomeCampo === "dataPagamento") {
      // Pagamento deve ser posterior ao empenho
      if (formData.dataEmpenho) {
        const dataEmpenho = new Date(formData.dataEmpenho);
        if (dataInformada < dataEmpenho) {
          return {
            isValid: false,
            message: "Pagamento deve ser posterior ao empenho (Lei 4.320/64)",
          };
        }
      }

      // Pagamento deve ser posterior à liquidação
      if (formData.dataLiquidacao) {
        const dataLiquidacao = new Date(formData.dataLiquidacao);
        if (dataInformada < dataLiquidacao) {
          return {
            isValid: false,
            message:
              "Pagamento deve ser posterior à liquidação (Lei 4.320/64, Art. 64)",
          };
        }
      }
    }

    // 4. VALIDAÇÃO: Exercício fiscal (ano da emenda)
    const anoEmenda = dataInicio
      ? new Date(dataInicio).getFullYear()
      : new Date().getFullYear();
    const anoInformado = dataInformada.getFullYear();

    if (anoInformado > anoEmenda + 1) {
      return {
        isValid: false,
        message: `Data fora do exercício fiscal válido (${anoEmenda}-${anoEmenda + 1})`,
      };
    }

    return { isValid: true, message: "" };
  };

  // ✅ FUNÇÃO para verificar se o formulário tem campos inválidos
  const temCamposInvalidos = () => {
    const campos = ["dataEmpenho", "dataLiquidacao", "dataPagamento"];

    return campos.some((campo) => {
      const valor = formData[campo];
      if (!valor) return true; // Campo obrigatório vazio

      const validacao = validarDataCampo(campo, valor);
      return !validacao.isValid; // Campo com erro de validação
    });
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

    return {
      min: dataInicio ? new Date(dataInicio).toISOString().split("T")[0] : null,
      max: dataFim
        ? new Date(dataFim).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    };
  };

  const limites = obterLimitesData();

  // ✅ FUNÇÃO para obter estilo do campo baseado na validação
  const obterEstiloCampo = (nomeCampo, valor) => {
    const validacao = validarDataCampo(nomeCampo, valor);
    const temErroExterno = errors[nomeCampo];

    if (temErroExterno || !validacao.isValid) {
      return { ...styles.input, ...styles.inputError };
    }

    if (valor && validacao.isValid) {
      return { ...styles.input, ...styles.inputSuccess };
    }

    return styles.input;
  };

  // ✅ NOTIFICAR componente pai sobre mudanças na validação
  React.useEffect(() => {
    if (onValidationChange) {
      const isValid = !temCamposInvalidos();
      onValidationChange("datas", isValid);
    }
  }, [
    formData.dataEmpenho,
    formData.dataLiquidacao,
    formData.dataPagamento,
    onValidationChange,
  ]);

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📅</span>
        Datas de Execução
      </legend>

      {/* ✅ BANNER informativo sobre período da emenda */}
      {emendaInfo && (
        <div style={styles.emendaBanner}>
          📅 Período da Emenda: {formatarPeriodoVigenciaEmenda(emendaInfo)}
          <br />
          <small style={styles.bannerHint}>
            ⚖️ Fluxo obrigatório: Empenho → Liquidação → Pagamento (Lei
            4.320/64)
          </small>
        </div>
      )}

      <div style={styles.formGrid}>
        {/* Data do Empenho */}
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Data do Empenho *</label>
          <input
            type="date"
            name="dataEmpenho"
            value={formData.dataEmpenho || ""}
            onChange={handleInputChange}
            min={limites.min}
            max={limites.max}
            style={obterEstiloCampo("dataEmpenho", formData.dataEmpenho)}
            disabled={modoVisualizacao}
            required
          />
          {(errors.dataEmpenho ||
            !validarDataCampo("dataEmpenho", formData.dataEmpenho).isValid) && (
            <span style={styles.errorText}>
              {errors.dataEmpenho ||
                validarDataCampo("dataEmpenho", formData.dataEmpenho).message}
            </span>
          )}
          {formData.dataEmpenho &&
            validarDataCampo("dataEmpenho", formData.dataEmpenho).isValid &&
            !errors.dataEmpenho && (
              <span style={styles.successText}>✓ Data válida</span>
            )}
        </div>

        {/* Data da Liquidação */}
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Data da Liquidação *</label>
          <input
            type="date"
            name="dataLiquidacao"
            value={formData.dataLiquidacao || ""}
            onChange={handleInputChange}
            min={limites.min}
            max={limites.max}
            style={obterEstiloCampo("dataLiquidacao", formData.dataLiquidacao)}
            disabled={modoVisualizacao}
            required
          />
          {(errors.dataLiquidacao ||
            !validarDataCampo("dataLiquidacao", formData.dataLiquidacao)
              .isValid) && (
            <span style={styles.errorText}>
              {errors.dataLiquidacao ||
                validarDataCampo("dataLiquidacao", formData.dataLiquidacao)
                  .message}
            </span>
          )}
          {formData.dataLiquidacao &&
            validarDataCampo("dataLiquidacao", formData.dataLiquidacao)
              .isValid &&
            !errors.dataLiquidacao && (
              <span style={styles.successText}>✓ Data válida</span>
            )}
        </div>

        {/* Data do Pagamento */}
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Data do Pagamento *</label>
          <input
            type="date"
            name="dataPagamento"
            value={formData.dataPagamento || ""}
            onChange={handleInputChange}
            min={limites.min}
            max={limites.max}
            style={obterEstiloCampo("dataPagamento", formData.dataPagamento)}
            disabled={modoVisualizacao}
            required
          />
          {(errors.dataPagamento ||
            !validarDataCampo("dataPagamento", formData.dataPagamento)
              .isValid) && (
            <span style={styles.errorText}>
              {errors.dataPagamento ||
                validarDataCampo("dataPagamento", formData.dataPagamento)
                  .message}
            </span>
          )}
          {formData.dataPagamento &&
            validarDataCampo("dataPagamento", formData.dataPagamento).isValid &&
            !errors.dataPagamento && (
              <span style={styles.successText}>✓ Data válida</span>
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
    </fieldset>
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
      style={sequenciaCorreta ? styles.sequenceSuccess : styles.sequenceError}
    >
      <div style={styles.sequenceIcon}>{sequenciaCorreta ? "✅" : "⚠️"}</div>
      <div style={styles.sequenceContent}>
        <strong>
          {sequenciaCorreta
            ? "Sequência Cronológica Correta"
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

// ✅ ESTILOS IGUAIS AO CRONOGRAMA + melhorias visuais
const styles = {
  fieldset: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },

  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid #154360",
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

  emendaBanner: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    border: "1px solid rgba(52, 152, 219, 0.3)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#2980b9",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: "1.5",
  },

  bannerHint: {
    color: "rgba(52, 152, 219, 0.7)",
    fontSize: "12px",
    fontStyle: "italic",
    marginTop: "4px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  labelRequired: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
  },

  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },

  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
    boxShadow: "0 0 0 3px rgba(220, 53, 69, 0.1)",
  },

  inputSuccess: {
    borderColor: "#28a745",
    backgroundColor: "#f8fff9",
    boxShadow: "0 0 0 3px rgba(40, 167, 69, 0.1)",
  },

  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    fontWeight: "500",
  },

  successText: {
    color: "#28a745",
    fontSize: "12px",
    marginTop: "4px",
    fontWeight: "500",
  },

  sequenceSuccess: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "6px",
    border: "1px solid #28a745",
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    marginTop: "16px",
  },

  sequenceError: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "6px",
    border: "1px solid #dc3545",
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    marginTop: "16px",
  },

  sequenceIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },

  sequenceContent: {
    fontSize: "13px",
    lineHeight: "1.4",
    color: "#333",
  },
};

export default DespesaFormDateFields;
