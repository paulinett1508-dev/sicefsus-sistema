import React from "react";
import { formatarMoeda } from "../../utils/formatters";

/**
 * Componente: Campos Básicos da Despesa
 *
 * Responsabilidades:
 * - Exibir emenda vinculada (não editável)
 * - Campo de valor editável (com alerta se valor planejado foi alterado)
 * - Campo de discriminação (1 linha editável)
 * - Mostrar saldo após execução
 *
 * Usado em: ExecutarDespesaModal, DespesaForm
 */
const DespesaFormBasicFields = ({
  formData,
  handleChange,
  emenda,
  modo,
  despesaPlanejada, // Opcional: despesa planejada sendo executada
}) => {
  // Calcula o saldo após a despesa
  const valorDespesa =
    typeof formData.valor === "string"
      ? // Utiliza parseValorMonetario se disponível, caso contrário, assume 0
        (typeof parseValorMonetario === "function" ? parseValorMonetario(formData.valor) : 0)
      : formData.valor || 0;

  const saldoAposExecucao = (emenda?.saldoDisponivel || 0) - valorDespesa;

  // Verifica se o valor foi alterado em relação ao planejado
  const valorAlterado =
    despesaPlanejada && Math.abs(valorDespesa - despesaPlanejada.valor) > 0.01;

  return (
    <div className="section">
      <div className="section-header">
        <span className="section-icon">📋</span>
        <h3>Dados Básicos da Despesa</h3>
      </div>

      <div className="form-row">
        {/* EMENDA VINCULADA */}
        <div className="form-group">
          <label htmlFor="emendaId">🔗 Emenda Vinculada *</label>
          <input
            type="text"
            id="emendaId"
            value={
              emenda
                ? `${emenda.numeroEmenda} - ${emenda.parlamentar}`
                : "Carregando..."
            }
            readOnly
            disabled
            style={{
              backgroundColor: "#f8f9fa",
              cursor: "not-allowed",
              color: "#495057",
            }}
          />
        </div>

        {/* VALOR DA DESPESA */}
        <div className="form-group">
          <label htmlFor="valor">💰 Valor da Despesa *</label>
          <input
            type="text"
            id="valor"
            name="valor"
            value={formData.valor || ""}
            onChange={handleChange}
            placeholder="R$ 0,00"
            disabled={modo === "visualizar"}
            required
            style={{
              fontWeight: "600",
              fontSize: "1.1rem",
              color: valorAlterado ? "#e67e22" : "#2c3e50",
            }}
          />

          {/* Alerta de valor alterado */}
          {valorAlterado && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px 12px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "6px",
                fontSize: "0.85rem",
                color: "#856404",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠️</span>
              <span>
                Valor alterado! Planejado:{" "}
                <strong>{formatarMoeda(despesaPlanejada.valor)}</strong>
              </span>
            </div>
          )}

          {/* Info de saldo após execução */}
          {emenda && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "0.85rem",
                color: saldoAposExecucao < 0 ? "#dc3545" : "#6c757d",
              }}
            >
              Saldo após execução:{" "}
              <strong>{formatarMoeda(saldoAposExecucao)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* DISCRIMINAÇÃO DA DESPESA - AJUSTADO */}
      <div className="form-group">
        <label htmlFor="discriminacao">📄 Discriminação da Despesa</label>
        <div style={{ position: "relative" }}>
          <textarea
            id="discriminacao"
            name="discriminacao"
            value={formData.discriminacao || ""}
            onChange={handleChange}
            placeholder="Descreva brevemente o objeto da despesa (opcional)"
            disabled={modo === "visualizar"}
            rows={1}
            style={{
              minHeight: "56px",
              resize: "vertical",
              paddingRight: formData.discriminacao ? "40px" : "12px",
              fontFamily: "inherit",
            }}
          />
          {formData.discriminacao && modo !== "visualizar" && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleChange({
                  target: {
                    name: "discriminacao",
                    value: "",
                  },
                });
              }}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#6c757d",
                fontSize: "1.2rem",
                lineHeight: "1",
              }}
              title="Limpar campo"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DespesaFormBasicFields;