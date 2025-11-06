// src/components/despesa/DespesaFormClassificacaoFuncional.jsx
// ✅ ATUALIZADO 06/11/2025: Corrigido select de Natureza - usando apenas constants.js
// 🔧 CORREÇÃO: Removida dependência do Firebase para naturezas (causava erro de permissão)

import React, { useState } from "react";
import {
  NATUREZAS_DESPESA,
  ELEMENTOS_DESPESA,
  ACOES_ORCAMENTARIAS,
  STATUS_PAGAMENTO_DESPESA,
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
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [cnpjEncontrado, setCnpjEncontrado] = useState(false);

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
    return resultado == digitos.charAt(1);
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

  const formatarCEP = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros.replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
  };

  // 🔌 BUSCAR CNPJ
  const buscarDadosCNPJ = async (cnpj) => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");

    if (cnpjLimpo.length !== 14 || !validarCNPJ(cnpj)) {
      return;
    }

    setBuscandoCNPJ(true);
    setCnpjEncontrado(false);

    try {
      let dados = null;

      // Tentar BrasilAPI
      try {
        const response = await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
        );
        if (response.ok) {
          dados = await response.json();
        }
      } catch (error) {
        console.log("BrasilAPI indisponível");
      }

      // Fallback: ReceitaWS via proxy
      if (!dados) {
        const response = await fetch(
          `https://api.allorigins.win/get?url=${encodeURIComponent(
            `https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`,
          )}`,
        );
        const result = await response.json();
        dados = JSON.parse(result.contents);
      }

      if (!dados || dados.status === "ERROR") {
        throw new Error("CNPJ não encontrado");
      }

      // Preencher campos
      if (dados.nome || dados.razao_social) {
        handleInputChange({
          target: {
            name: "fornecedor",
            value: dados.nome || dados.razao_social,
          },
        });
      }

      if (dados.fantasia || dados.nome_fantasia) {
        handleInputChange({
          target: {
            name: "nomeFantasia",
            value: dados.fantasia || dados.nome_fantasia,
          },
        });
      }

      if (dados.telefone || dados.ddd_telefone_1) {
        const tel = (dados.telefone || dados.ddd_telefone_1).replace(
          /[^\d]/g,
          "",
        );
        handleInputChange({
          target: { name: "telefoneFornecedor", value: formatarTelefone(tel) },
        });
      }

      if (dados.email) {
        handleInputChange({
          target: { name: "emailFornecedor", value: dados.email },
        });
      }

      // Separar endereço, cidade/UF e CEP
      const endereco = [
        dados.logradouro,
        dados.numero,
        dados.complemento,
        dados.bairro,
      ]
        .filter(Boolean)
        .join(", ");

      if (endereco) {
        handleInputChange({
          target: { name: "enderecoFornecedor", value: endereco },
        });
      }

      if (dados.municipio && dados.uf) {
        handleInputChange({
          target: { name: "cidadeUf", value: `${dados.municipio}/${dados.uf}` },
        });
      }

      if (dados.cep) {
        handleInputChange({
          target: { name: "cep", value: formatarCEP(dados.cep) },
        });
      }

      // Situação cadastral
      const situacao = dados.situacao || "ATIVA";
      handleInputChange({
        target: { name: "situacaoCadastral", value: situacao.toUpperCase() },
      });

      setCnpjEncontrado(true);
      setCnpjError("");
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setCnpjError("CNPJ não encontrado");
      setCnpjEncontrado(false);
    } finally {
      setBuscandoCNPJ(false);
    }
  };

  const handleCNPJChange = (e) => {
    const { value } = e.target;
    const cnpjFormatado = formatarCNPJ(value);

    handleInputChange({
      target: { name: "cnpjFornecedor", value: cnpjFormatado },
    });

    const cnpjLimpo = cnpjFormatado.replace(/[^\d]/g, "");

    if (cnpjLimpo.length === 14) {
      if (!validarCNPJ(cnpjFormatado)) {
        setCnpjError("CNPJ inválido");
        setCnpjEncontrado(false);
      } else {
        setCnpjError("");
        buscarDadosCNPJ(cnpjFormatado);
      }
    } else if (cnpjLimpo.length > 0 && cnpjLimpo.length < 14) {
      setCnpjError("CNPJ incompleto");
      setCnpjEncontrado(false);
    } else {
      setCnpjError("");
      setCnpjEncontrado(false);
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
    handleInputChange({
      target: { name: "telefoneFornecedor", value: telefoneFormatado },
    });
  };

  const handleCEPChange = (e) => {
    const { value } = e.target;
    const cepFormatado = formatarCEP(value);
    handleInputChange({
      target: { name: "cep", value: cepFormatado },
    });
  };

  const handleNaturezaChange = (e) => {
    const valor = e.target.value;

    if (valor === "__DIGITAR_OUTRA__") {
      setModoNaturezaCustomizada(true);
      return;
    }

    if (modoNaturezaCustomizada) {
      setModoNaturezaCustomizada(false);
      setNaturezaCustomizada("");
    }

    handleInputChange(e);
  };

  const salvarNaturezaCustomizada = () => {
    if (naturezaCustomizada.trim()) {
      handleInputChange({
        target: { name: "naturezaDespesa", value: naturezaCustomizada },
      });
      setModoNaturezaCustomizada(false);
      setNaturezaCustomizada("");
    }
  };

  const handleElementoChange = (e) => {
    const valor = e.target.value;

    if (valor === "__DIGITAR_OUTRO__") {
      setModoElementoCustomizado(true);
      return;
    }

    if (modoElementoCustomizado) {
      setModoElementoCustomizado(false);
      setElementoCustomizado("");
    }

    handleInputChange(e);
  };

  const salvarElementoCustomizado = () => {
    if (elementoCustomizado.trim()) {
      handleInputChange({
        target: { name: "elementoDespesa", value: elementoCustomizado },
      });
      setModoElementoCustomizado(false);
      setElementoCustomizado("");
    }
  };

  const getCorSituacao = (situacao) => {
    if (!situacao) return "#6c757d";
    const situacaoUpper = situacao.toUpperCase();
    if (situacaoUpper.includes("ATIVA") || situacaoUpper.includes("REGULAR"))
      return "#27AE60";
    if (
      situacaoUpper.includes("SUSPENSA") ||
      situacaoUpper.includes("PENDENTE")
    )
      return "#f39c12";
    if (
      situacaoUpper.includes("BAIXADA") ||
      situacaoUpper.includes("CANCELADA") ||
      situacaoUpper.includes("INAPTA")
    )
      return "#e74c3c";
    return "#6c757d";
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>💼</span>
        Classificação Funcional-Programática
      </legend>

      {/* LINHA 1: Natureza de Despesa | Elemento de Despesa | Status de Pagamento */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.labelRequired}>
            Natureza de Despesa <span style={{ color: "#dc3545" }}>*</span>
          </label>
          {!modoNaturezaCustomizada ? (
            <select
              name="naturezaDespesa"
              value={formData.naturezaDespesa || ""}
              onChange={handleNaturezaChange}
              style={styles.select}
              disabled={modoVisualizacao}
            >
              <option value="">Selecione...</option>
              {NATUREZAS_DESPESA.map((nat) => (
                <option key={nat.codigo} value={nat.nome}>
                  {nat.nome}
                </option>
              ))}
              <option value="__DIGITAR_OUTRA__">✏️ Digitar Outra...</option>
            </select>
          ) : (
            <div style={styles.inputCustomizadoWrapper}>
              <input
                type="text"
                value={naturezaCustomizada}
                onChange={(e) => setNaturezaCustomizada(e.target.value)}
                placeholder="Digite a natureza de despesa..."
                style={styles.input}
                autoFocus
              />
              <button
                type="button"
                onClick={salvarNaturezaCustomizada}
                style={styles.voltarButton}
              >
                ✓ Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModoNaturezaCustomizada(false);
                  setNaturezaCustomizada("");
                }}
                style={styles.voltarButton}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Elemento de Despesa</label>
          {!modoElementoCustomizado ? (
            <select
              name="elementoDespesa"
              value={formData.elementoDespesa || ""}
              onChange={handleElementoChange}
              style={styles.select}
              disabled={modoVisualizacao}
            >
              <option value="">Selecione...</option>
              {ELEMENTOS_DESPESA.map((el) => (
                <option key={el.codigo} value={el.nome}>
                  {el.nome}
                </option>
              ))}
              <option value="__DIGITAR_OUTRO__">✏️ Digitar Outro...</option>
            </select>
          ) : (
            <div style={styles.inputCustomizadoWrapper}>
              <input
                type="text"
                value={elementoCustomizado}
                onChange={(e) => setElementoCustomizado(e.target.value)}
                placeholder="Digite o elemento de despesa..."
                style={styles.input}
                autoFocus
              />
              <button
                type="button"
                onClick={salvarElementoCustomizado}
                style={styles.voltarButton}
              >
                ✓ Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModoElementoCustomizado(false);
                  setElementoCustomizado("");
                }}
                style={styles.voltarButton}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status de Pagamento</label>
          <select
            name="statusPagamento"
            value={formData.statusPagamento || ""}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            <option value="">Selecione...</option>
            {STATUS_PAGAMENTO_DESPESA.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LINHA 2: Ação Orçamentária | Fonte de Recurso | Programa de Trabalho */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Ação Orçamentária</label>
          <select
            name="acao"
            value={formData.acao || ""}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            <option value="">Selecione...</option>
            {ACOES_ORCAMENTARIAS.map((acao) => (
              <option key={acao.codigo} value={acao.nome}>
                {acao.nome}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Fonte de Recurso</label>
          <input
            type="text"
            name="fonteRecurso"
            value={formData.fonteRecurso || ""}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Ex: 0100 - Recursos Ordinários"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Programa de Trabalho</label>
          <input
            type="text"
            name="programaTrabalho"
            value={formData.programaTrabalho || ""}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Ex: 10.301.1234.2000"
          />
        </div>
      </div>

      {/* SEPARADOR VISUAL */}
      <div style={styles.divider}>
        <span style={styles.dividerText}>DADOS DO FORNECEDOR</span>
      </div>

      {/* LINHA 3: CNPJ | Razão Social */}
      <div style={styles.formRowCNPJ}>
        <div style={styles.formGroupCNPJWrapper}>
          <div style={styles.formGroupCNPJ}>
            <label style={styles.labelRequired}>
              CNPJ <span style={{ color: "#dc3545" }}>*</span>
              {cnpjError && <span style={styles.validationBadge}>⚠️</span>}
              {cnpjEncontrado && (
                <span style={{ ...styles.validationBadge, color: "#27AE60" }}>
                  ✓
                </span>
              )}
            </label>
            <input
              type="text"
              name="cnpjFornecedor"
              value={formData.cnpjFornecedor || ""}
              onChange={handleCNPJChange}
              style={cnpjError ? styles.inputError : styles.input}
              readOnly={modoVisualizacao}
              placeholder="00.000.000/0000-00"
              maxLength="18"
            />
            {cnpjError && <span style={styles.errorText}>{cnpjError}</span>}
          </div>
          {!modoVisualizacao && (
            <button
              type="button"
              onClick={() => buscarDadosCNPJ(formData.cnpjFornecedor)}
              disabled={
                buscandoCNPJ ||
                !formData.cnpjFornecedor ||
                formData.cnpjFornecedor.replace(/\D/g, "").length !== 14
              }
              style={{
                ...styles.btnRefresh,
                opacity:
                  buscandoCNPJ ||
                  !formData.cnpjFornecedor ||
                  formData.cnpjFornecedor.replace(/\D/g, "").length !== 14
                    ? 0.5
                    : 1,
                cursor:
                  buscandoCNPJ ||
                  !formData.cnpjFornecedor ||
                  formData.cnpjFornecedor.replace(/\D/g, "").length !== 14
                    ? "not-allowed"
                    : "pointer",
              }}
              title="Buscar dados do CNPJ"
            >
              {buscandoCNPJ ? "🔄" : "🔍"}
            </button>
          )}
        </div>

        <div style={styles.formGroupRazaoSocial}>
          <label style={styles.labelRequired}>
            Razão Social <span style={{ color: "#dc3545" }}>*</span>
          </label>
          <input
            type="text"
            name="fornecedor"
            value={formData.fornecedor || ""}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Preenchido automaticamente"
          />
        </div>
      </div>

      {/* LINHA 4: Nome Fantasia | Telefone | Email */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nome Fantasia</label>
          <input
            type="text"
            name="nomeFantasia"
            value={formData.nomeFantasia || ""}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Preenchido automaticamente"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Telefone</label>
          <input
            type="text"
            name="telefoneFornecedor"
            value={formData.telefoneFornecedor || ""}
            onChange={handleTelefoneChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="(00) 00000-0000"
            maxLength="15"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Email {emailError && <span style={styles.validationBadge}>⚠️</span>}
          </label>
          <input
            type="email"
            name="emailFornecedor"
            value={formData.emailFornecedor || ""}
            onChange={handleEmailChange}
            style={emailError ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            placeholder="fornecedor@email.com"
          />
          {emailError && <span style={styles.errorText}>{emailError}</span>}
        </div>
      </div>

      {/* LINHA 6: Endereço | Cidade/UF | CEP */}
      <div style={styles.formRowEndereco}>
        <div style={styles.formGroupEndereco}>
          <label style={styles.label}>Endereço</label>
          <input
            type="text"
            name="enderecoFornecedor"
            value={formData.enderecoFornecedor || ""}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Logradouro, número, complemento, bairro"
          />
        </div>

        <div style={styles.formGroupCidade}>
          <label style={styles.label}>Cidade/UF</label>
          <input
            type="text"
            name="cidadeUf"
            value={formData.cidadeUf || ""}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Cidade/UF"
          />
        </div>

        <div style={styles.formGroupCEP}>
          <label style={styles.label}>CEP</label>
          <input
            type="text"
            name="cep"
            value={formData.cep || ""}
            onChange={handleCEPChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="00000-000"
            maxLength="9"
          />
        </div>
      </div>

      {/* LINHA 7: Situação Cadastral e Observações */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Situação Cadastral</label>
          <input
            type="text"
            name="situacaoCadastral"
            value={formData.situacaoCadastral || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              color: getCorSituacao(formData.situacaoCadastral),
              fontWeight: "bold",
              backgroundColor: "#f8f9fa",
              cursor: "not-allowed",
            }}
            readOnly={true}
            placeholder="Preenchido automaticamente"
          />
        </div>

        <div style={styles.formGroupLarge}>
          <label style={styles.label}>Observações</label>
          <input
            type="text"
            name="observacoes"
            value={formData.observacoes || ""}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Observações adicionais"
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
  legendIcon: { fontSize: "18px" },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "20px",
  },
  formRowCNPJ: {
    display: "grid",
    gridTemplateColumns: "270px 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  formRowEndereco: {
    display: "grid",
    gridTemplateColumns: "1fr 280px 150px",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroupCNPJWrapper: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  formGroupCNPJ: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  btnRefresh: {
    backgroundColor: "#154360",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "18px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    height: "46px",
    minWidth: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formGroupRazaoSocial: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formGroupEndereco: { display: "flex", flexDirection: "column", gap: "8px" },
  formGroupCidade: { display: "flex", flexDirection: "column", gap: "8px" },
  formGroupCEP: { display: "flex", flexDirection: "column", gap: "8px" },
  formGroupLarge: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "span 2",
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
  validationBadge: { marginLeft: "5px", fontSize: "12px", color: "#dc3545" },
  inputCustomizadoWrapper: { display: "flex", gap: "8px" },
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
    color: "#154360",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
};

export default DespesaFormClassificacaoFuncional;