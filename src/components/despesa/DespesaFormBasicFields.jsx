// src/components/despesa/DespesaFormBasicFields.jsx
// ✅ ATUALIZADO: Campo "Fornecedor" removido
// 🎯 Agora apenas: Emenda, Valor, Discriminação
// 🐞 CORRIGIDO: Bug do 'undefined' ao buscar nome do parlamentar
// ✅ ATUALIZADO 04/11/2025: Campo valor mostra R$ 500,00 (com centavos)

import React from "react";

const DespesaFormBasicFields = ({
  formData,
  errors,
  emendas,
  emendaPreSelecionada,
  emendaInfo,
  userRole,
  userMunicipio,
  modoVisualizacao,
  valorError,
  handleInputChange,
}) => {
  // ✅ Função para formatar valor para exibição
  const formatarValorExibicao = (valor) => {
    if (!valor) return "0,00";

    // Se já está formatado (tem vírgula), retorna como está
    if (typeof valor === "string" && valor.includes(",")) {
      return valor;
    }

    // Se é número, formata
    const numero = typeof valor === "number" ? valor : parseFloat(valor);
    if (isNaN(numero)) return "0,00";

    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📋</span>
        Dados Básicos da Despesa
      </legend>

      <div style={styles.formGrid}>
        {/* Emenda */}
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Emenda *</label>
          {emendaPreSelecionada && emendaInfo ? (
            <>
              <input
                type="text"
                value={`${emendaInfo.autor || emendaInfo.parlamentar} - ${emendaInfo.numero || emendaInfo.numeroEmenda}`}
                style={styles.inputReadonly}
                readOnly
              />
              <input type="hidden" name="emendaId" value={formData.emendaId} />
              <span style={styles.helpText}>
                Emenda pré-selecionada do fluxo anterior
              </span>
            </>
          ) : (
            <>
              <select
                name="emendaId"
                value={formData.emendaId}
                onChange={handleInputChange}
                style={
                  errors.emendaId
                    ? { ...styles.select, borderColor: "#dc3545" }
                    : styles.select
                }
                disabled={modoVisualizacao}
                required
              >
                <option value="">
                  {emendas.length === 0
                    ? userRole === "operador"
                      ? `Nenhuma emenda encontrada para ${userMunicipio}`
                      : "Carregando emendas..."
                    : "Selecione uma emenda..."}
                </option>
                {emendas.map((emenda) => (
                  <option key={emenda.id} value={emenda.id}>
                    {emenda.autor || emenda.parlamentar} -{" "}
                    {emenda.numero || emenda.numeroEmenda} - {emenda.municipio}/
                    {emenda.uf}
                  </option>
                ))}
              </select>
              {userRole === "operador" && emendas.length === 0 && (
                <span style={styles.helpText}>
                  ⚠️ Nenhuma emenda disponível para o município{" "}
                  {userMunicipio || "não cadastrado"}. Entre em contato com o
                  administrador.
                </span>
              )}
            </>
          )}
          {errors.emendaId && (
            <span style={styles.errorText}>{errors.emendaId}</span>
          )}
        </div>

        {/* Valor */}
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Valor *</label>
          <div style={styles.inputMonetarioContainer}>
            <span style={styles.moedaPrefix}>R$</span>
            <input
              type="text"
              name="valor"
              value={formatarValorExibicao(formData.valor)}
              onChange={handleInputChange}
              style={
                errors.valor || valorError
                  ? { ...styles.inputMonetario, borderColor: "#dc3545" }
                  : styles.inputMonetario
              }
              readOnly={modoVisualizacao}
              placeholder="0,00"
              required
            />
          </div>
          {(errors.valor || valorError) && (
            <span style={styles.errorText}>{errors.valor || valorError}</span>
          )}
          <span style={styles.helpText}>
            Digite o valor normalmente. Formatação automática.
          </span>
        </div>

        {/* Discriminação */}
        <div style={styles.formGroupDiscriminacao}>
          <label style={styles.labelRequired}>Discriminação *</label>
          <input
            type="text"
            name="discriminacao"
            value={formData.discriminacao}
            onChange={handleInputChange}
            style={errors.discriminacao ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            placeholder="Descreva a discriminação da despesa..."
            required
          />
          {errors.discriminacao && (
            <span style={styles.errorText}>{errors.discriminacao}</span>
          )}
        </div>
      </div>
    </fieldset>
  );
};

const styles = {
  fieldset: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "1 / -1",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formGroupDiscriminacao: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "span 2",
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
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  inputError: {
    padding: "12px",
    border: "2px solid #dc3545",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  inputReadonly: {
    padding: "12px",
    border: "2px solid #2196f3",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    fontWeight: "bold",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
  },
  helpText: {
    color: "#6c757d",
    fontSize: "12px",
    marginTop: "5px",
  },
  inputMonetarioContainer: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  moedaPrefix: {
    position: "absolute",
    left: "12px",
    color: "#495057",
    fontWeight: "bold",
    fontSize: "14px",
    zIndex: 1,
  },
  inputMonetario: {
    padding: "12px 12px 12px 35px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
    width: "100%",
    fontWeight: "500",
  },
};

export default DespesaFormBasicFields;
