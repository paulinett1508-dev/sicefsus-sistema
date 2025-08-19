// src/components/emenda/EmendaForm/sections/Cronograma.jsx
import React from "react";

const Cronograma = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  // Handler com validação de datas em tempo real
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange?.({ target: { name, value } });
  };

  // Validação: Data não pode ser futura (exceto Data de Validade)
  const isDataFutura = (dataInput) => {
    if (!dataInput) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dataInput);
    return data > hoje;
  };

  // Validação: Data deve ser válida para comparação
  const isDataValidaComparacao = (dataInput) => {
    if (!dataInput) return false;
    const data = new Date(dataInput);
    return !isNaN(data.getTime());
  };

  // Validação: Verificar se data excede validade da emenda
  const isDataExcedeValidade = (dataInput, dataValidade) => {
    if (!dataInput || !dataValidade) return false;
    if (
      !isDataValidaComparacao(dataInput) ||
      !isDataValidaComparacao(dataValidade)
    )
      return false;

    const data = new Date(dataInput);
    const validade = new Date(dataValidade);
    return data > validade;
  };

  // Validação específica: OB anterior à aprovação
  const isOBAnteriorAprovacao = (dataOB, dataAprovacao) => {
    if (!dataOB || !dataAprovacao) return false;
    if (!isDataValidaComparacao(dataOB) || !isDataValidaComparacao(dataAprovacao)) return false;
    
    const ob = new Date(dataOB);
    const aprovacao = new Date(dataAprovacao);
    return ob < aprovacao;
  };

  // Função para obter mensagem de erro específica
  const getDataErrorMessage = (fieldName, value) => {
    // Importar validação centralizada
    const { validarCronogramaEmenda, normalizarDataInput } = require('../../../utils/validators');
    
    if (!value) return null;

    // Normalizar entrada
    const dataNormalizada = normalizarDataInput(value);
    if (!dataNormalizada) {
      return "Data inválida";
    }

    // Criar cronograma atual para validação completa
    const cronogramaAtual = {
      dataAprovacao: normalizarDataInput(formData?.dataAprovacao),
      dataOb: normalizarDataInput(formData?.dataOb),
      inicioExecucao: normalizarDataInput(formData?.inicioExecucao),
      finalExecucao: normalizarDataInput(formData?.finalExecucao),
      dataValidade: normalizarDataInput(formData?.dataValidade),
      [fieldName]: dataNormalizada // Aplicar o valor atual
    };

    // Validar cronograma completo
    const validacao = validarCronogramaEmenda(cronogramaAtual);
    
    // Retornar erro específico do campo
    return validacao.erros[fieldName] || null;
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📅</span>
        Cronograma
      </legend>

      {/* 🎯 BANNER EXPLICATIVO DO FLUXO CRONOLÓGICO */}
      <div style={styles.fluxoBanner}>
        <div style={styles.fluxoIcon}>🔄</div>
        <div style={styles.fluxoContent}>
          <strong>Fluxo Cronológico:</strong> 
          <span style={styles.fluxoSequence}>
            Aprovação → OB → Início → Final → Validade
          </span>
        </div>
      </div>

      <div style={styles.formGrid}>
        {/* 1️⃣ PRIMEIRO: Data de Aprovação - BASE DO PROCESSO */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <span style={styles.stepBadge}>1</span>
            Data de Aprovação <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="dataAprovacao"
            value={formData?.dataAprovacao || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors?.dataAprovacao && styles.inputError),
              ...(getDataErrorMessage("dataAprovacao", formData?.dataAprovacao) && styles.inputError),
              borderColor: '#3498db',
              borderWidth: '2px'
            }}
            disabled={disabled}
            required
          />
          {getDataErrorMessage("dataAprovacao", formData?.dataAprovacao) && (
            <small style={styles.errorText}>
              {getDataErrorMessage("dataAprovacao", formData?.dataAprovacao)}
            </small>
          )}
          {fieldErrors?.dataAprovacao && !getDataErrorMessage("dataAprovacao", formData?.dataAprovacao) && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
          <small style={styles.helperText}>🏛️ Aprovação pelo Congresso Nacional</small>
        </div>

        {/* 2️⃣ SEGUNDO: Data OB */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <span style={styles.stepBadge}>2</span>
            Data OB
          </label>
          <input
            type="date"
            name="dataOb"
            value={formData?.dataOb || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(getDataErrorMessage("dataOb", formData?.dataOb) && styles.inputError),
              opacity: formData?.dataAprovacao ? 1 : 0.6
            }}
            disabled={disabled || !formData?.dataAprovacao}
          />
          {getDataErrorMessage("dataOb", formData?.dataOb) && (
            <small style={styles.errorText}>
              {getDataErrorMessage("dataOb", formData?.dataOb)}
            </small>
          )}
          <small style={styles.helperText}>🏦 Ordem Bancária (após aprovação)</small>
        </div>

        {/* 3️⃣ TERCEIRO: Início da Execução */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <span style={styles.stepBadge}>3</span>
            Início da Execução
          </label>
          <input
            type="date"
            name="inicioExecucao"
            value={formData?.inicioExecucao || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(getDataErrorMessage("inicioExecucao", formData?.inicioExecucao) && styles.inputError),
              opacity: formData?.dataAprovacao ? 1 : 0.6
            }}
            disabled={disabled || !formData?.dataAprovacao}
          />
          {getDataErrorMessage("inicioExecucao", formData?.inicioExecucao) && (
            <small style={styles.errorText}>
              {getDataErrorMessage("inicioExecucao", formData?.inicioExecucao)}
            </small>
          )}
          <small style={styles.helperText}>🚀 Início das ações executivas</small>
        </div>

        {/* 4️⃣ QUARTO: Final da Execução */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <span style={styles.stepBadge}>4</span>
            Final da Execução
          </label>
          <input
            type="date"
            name="finalExecucao"
            value={formData?.finalExecucao || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(getDataErrorMessage("finalExecucao", formData?.finalExecucao) && styles.inputError),
              opacity: formData?.inicioExecucao ? 1 : 0.6
            }}
            disabled={disabled || !formData?.inicioExecucao}
          />
          {getDataErrorMessage("finalExecucao", formData?.finalExecucao) && (
            <small style={styles.errorText}>
              {getDataErrorMessage("finalExecucao", formData?.finalExecucao)}
            </small>
          )}
          <small style={styles.helperText}>🏁 Conclusão das ações</small>
        </div>

        {/* 5️⃣ QUINTO: Data de Validade */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <span style={styles.stepBadge}>5</span>
            Data de Validade <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="dataValidade"
            value={formData?.dataValidade || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors?.dataValidade && styles.inputError),
              borderColor: '#e74c3c',
              borderWidth: '2px'
            }}
            disabled={disabled}
            required
          />
          {fieldErrors?.dataValidade && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
          <small style={styles.helperText}>⏰ Prazo legal final</small>
        </div>

        {/* 📊 ÚLTIMO: Data da Última Atualização */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <span style={styles.stepBadge}>📊</span>
            Data da Última Atualização
          </label>
          <input
            type="date"
            value={formData?.dataUltimaAtualizacao || ""}
            style={{
              ...styles.input,
              backgroundColor: "#f8f9fa",
              cursor: "not-allowed",
            }}
            disabled={true}
            readOnly
          />
          <small style={styles.helperText}>🔄 Atualizada automaticamente</small>
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS MANTIDOS (sem o infoBox)
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
    transition: "all 0.3s ease",
    backgroundColor: "white",
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
  helperText: {
    fontSize: "12px",
    color: "#6c757d",
    marginTop: "4px",
  },
  fluxoBanner: {
    backgroundColor: "#e8f4fd",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    border: "1px solid #3498db",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  fluxoIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  fluxoContent: {
    fontSize: "14px",
    color: "#2c3e50",
  },
  fluxoSequence: {
    marginLeft: "8px",
    fontFamily: "monospace",
    color: "#3498db",
    fontWeight: "bold",
  },
  stepBadge: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#3498db",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold",
    flexShrink: 0,
    marginRight: "4px",
  },
};

export default Cronograma;
