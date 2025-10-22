// src/components/despesa/DespesaFormClassificacaoFuncional.jsx
// ✅ ATUALIZADO: Importando constantes centralizadas

import React, { useState } from "react";
import {
  NATUREZAS_DESPESA,
  ELEMENTOS_DESPESA,
  ACOES_ORCAMENTARIAS,
  STATUS_DESPESAS,
} from "../../config/constants";

const DespesaFormClassificacaoFuncional = ({
  formData,
  errors,
  modoVisualizacao,
  handleInputChange,
}) => {
  const [cnpjError, setCnpjError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [modoNaturezaCustomizada, setModoNaturezaCustomizada] = useState(false);
  const [modoElementoCustomizado, setModoElementoCustomizado] = useState(false);
  const [naturezaCustomizada, setNaturezaCustomizada] = useState("");
  const [elementoCustomizado, setElementoCustomizado] = useState("");

  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");

    if (cnpjLimpo.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) return false;

    return true;
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const formatarCNPJ = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);
  };

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");

    if (apenasNumeros.length <= 10) {
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .substring(0, 14);
    } else {
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15);
    }
  };

  const handleCNPJChange = (e) => {
    const { value } = e.target;
    const cnpjFormatado = formatarCNPJ(value);

    const event = {
      target: {
        name: "cnpjFornecedor",
        value: cnpjFormatado,
      },
    };
    handleInputChange(event);

    const cnpjLimpo = cnpjFormatado.replace(/[^\d]/g, "");
    if (cnpjLimpo.length === 14) {
      if (!validarCNPJ(cnpjFormatado)) {
        setCnpjError("CNPJ inválido");
      } else {
        setCnpjError("");
      }
    } else if (cnpjLimpo.length > 0 && cnpjLimpo.length < 14) {
      setCnpjError("CNPJ incompleto");
    } else {
      setCnpjError("");
    }
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    handleInputChange(e);

    if (value && !validarEmail(value)) {
      setEmailError("Email inválido");
    } else {
      setEmailError("");
    }
  };

  const handleTelefoneChange = (e) => {
    const { value } = e.target;
    const telefoneFormatado = formatarTelefone(value);

    const event = {
      target: {
        name: "telefoneFornecedor",
        value: telefoneFormatado,
      },
    };
    handleInputChange(event);
  };

  const handleNaturezaChange = (e) => {
    const valor = e.target.value;

    if (valor === "__customizado__") {
      setModoNaturezaCustomizada(true);
      setNaturezaCustomizada("");
    } else {
      setModoNaturezaCustomizada(false);
      setNaturezaCustomizada("");
      handleInputChange(e);
    }
  };

  const handleNaturezaCustomizadaChange = (e) => {
    const valor = e.target.value;
    setNaturezaCustomizada(valor);
    handleInputChange({ target: { name: "naturezaDespesa", value: valor } });
  };

  const handleElementoChange = (e) => {
    const valor = e.target.value;

    if (valor === "__customizado__") {
      setModoElementoCustomizado(true);
      setElementoCustomizado("");
    } else {
      setModoElementoCustomizado(false);
      setElementoCustomizado("");
      handleInputChange(e);
    }
  };

  const handleElementoCustomizadoChange = (e) => {
    const valor = e.target.value;
    setElementoCustomizado(valor);
    handleInputChange({ target: { name: "elementoDespesa", value: valor } });
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📊</span>
        Classificação Funcional-Programática
      </legend>

      {/* LINHA 1: Ação, Dotação, Status */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Ação *</label>
          <select
            name="acao"
            value={formData.acao}
            onChange={handleInputChange}
            style={
              errors.acao
                ? { ...styles.select, borderColor: "#dc3545" }
                : styles.select
            }
            disabled={modoVisualizacao}
            required
          >
            <option value="">Selecione a ação</option>
            {/* ✅ ATUALIZADO: Usando constantes centralizadas */}
            {ACOES_ORCAMENTARIAS.map((acao) => (
              <option key={acao.codigo} value={acao.codigo}>
                {acao.codigo} - {acao.descricao}
              </option>
            ))}
          </select>
          {errors.acao && <span style={styles.errorText}>{errors.acao}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>Dotação Orçamentária *</label>
          <input
            type="text"
            name="dotacaoOrcamentaria"
            value={formData.dotacaoOrcamentaria}
            onChange={handleInputChange}
            style={
              errors.dotacaoOrcamentaria ? styles.inputError : styles.input
            }
            readOnly={modoVisualizacao}
            placeholder="Código da dotação orçamentária"
            required
          />
          {errors.dotacaoOrcamentaria && (
            <span style={styles.errorText}>{errors.dotacaoOrcamentaria}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            {/* ✅ ATUALIZADO: Usando constantes centralizadas */}
            {STATUS_DESPESAS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LINHA 2: Categoria, Centro de Custo, Natureza */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Categoria</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            <option value="">Selecione a categoria</option>
            <option value="equipamentos">Equipamentos</option>
            <option value="reformas">Reformas</option>
            <option value="construcao">Construção</option>
            <option value="servicos">Serviços</option>
            <option value="medicamentos">Medicamentos</option>
            <option value="materiais">Materiais</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Centro de Custo</label>
          <input
            type="text"
            name="centroCusto"
            value={formData.centroCusto}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Código do centro de custo"
          />
        </div>

        {/* ✅ ATUALIZADO: Natureza da Despesa com constantes */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Natureza da Despesa</label>
          {!modoNaturezaCustomizada ? (
            <select
              name="naturezaDespesa"
              value={formData.naturezaDespesa || ""}
              onChange={handleNaturezaChange}
              style={styles.select}
              disabled={modoVisualizacao}
            >
              <option value="">Selecione a natureza</option>
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
                value={naturezaCustomizada}
                onChange={handleNaturezaCustomizadaChange}
                placeholder="Digite a natureza da despesa..."
                style={styles.input}
                disabled={modoVisualizacao}
              />
              <button
                type="button"
                onClick={() => {
                  setModoNaturezaCustomizada(false);
                  setNaturezaCustomizada("");
                  handleInputChange({
                    target: { name: "naturezaDespesa", value: "" },
                  });
                }}
                style={styles.voltarButton}
                title="Voltar para seleção"
                disabled={modoVisualizacao}
              >
                ↩️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LINHA 3: Elemento de Despesa */}
      <div style={styles.formRow}>
        <div style={styles.formGroupFull}>
          <label style={styles.label}>Elemento de Despesa</label>
          {!modoElementoCustomizado ? (
            <select
              name="elementoDespesa"
              value={formData.elementoDespesa || ""}
              onChange={handleElementoChange}
              style={styles.select}
              disabled={modoVisualizacao}
            >
              <option value="">Selecione o elemento</option>
              {/* ✅ ATUALIZADO: Usando constantes centralizadas */}
              {ELEMENTOS_DESPESA.map((elemento) => (
                <option key={elemento} value={elemento}>
                  {elemento}
                </option>
              ))}
              <option value="__customizado__">✏️ Digitar outro...</option>
            </select>
          ) : (
            <div style={styles.inputCustomizadoWrapper}>
              <input
                type="text"
                value={elementoCustomizado}
                onChange={handleElementoCustomizadoChange}
                placeholder="Digite o elemento de despesa..."
                style={styles.input}
                disabled={modoVisualizacao}
              />
              <button
                type="button"
                onClick={() => {
                  setModoElementoCustomizado(false);
                  setElementoCustomizado("");
                  handleInputChange({
                    target: { name: "elementoDespesa", value: "" },
                  });
                }}
                style={styles.voltarButton}
                title="Voltar para seleção"
                disabled={modoVisualizacao}
              >
                ↩️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DIVISOR VISUAL */}
      <div style={styles.divider}>
        <span style={styles.dividerText}>Dados do Fornecedor</span>
      </div>

      {/* LINHA 4: CNPJ, Telefone, Email */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            CNPJ
            {cnpjError && <span style={styles.validationBadge}>⚠️</span>}
          </label>
          <input
            type="text"
            name="cnpjFornecedor"
            value={formData.cnpjFornecedor}
            onChange={handleCNPJChange}
            style={cnpjError ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            placeholder="00.000.000/0000-00"
            maxLength="18"
          />
          {cnpjError && <span style={styles.errorText}>{cnpjError}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Telefone</label>
          <input
            type="text"
            name="telefoneFornecedor"
            value={formatarTelefone(formData.telefoneFornecedor || "")}
            onChange={handleTelefoneChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="(00) 00000-0000"
            maxLength="15"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Email
            {emailError && <span style={styles.validationBadge}>⚠️</span>}
          </label>
          <input
            type="email"
            name="emailFornecedor"
            value={formData.emailFornecedor}
            onChange={handleEmailChange}
            style={emailError ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            placeholder="fornecedor@email.com"
          />
          {emailError && <span style={styles.errorText}>{emailError}</span>}
        </div>
      </div>

      {/* LINHA 5: Endereço */}
      <div style={styles.formRow}>
        <div style={styles.formGroupFull}>
          <label style={styles.label}>Endereço</label>
          <input
            type="text"
            name="enderecoFornecedor"
            value={formData.enderecoFornecedor}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Endereço completo"
          />
        </div>
      </div>

      {/* LINHA 6: Observações */}
      <div style={styles.formRow}>
        <div style={styles.formGroupFull}>
          <label style={styles.label}>Observações</label>
          <input
            type="text"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Observações adicionais sobre a despesa"
          />
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
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "1 / -1",
  },
  labelRequired: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
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
    backgroundColor: "#fff5f5",
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
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "500",
  },
  validationBadge: {
    marginLeft: "5px",
    fontSize: "12px",
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
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  divider: {
    margin: "30px 0 20px 0",
    borderTop: "2px solid #dee2e6",
    position: "relative",
    height: "1px",
  },
  dividerText: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#f8f9fa",
    padding: "0 15px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};

export default DespesaFormClassificacaoFuncional;
