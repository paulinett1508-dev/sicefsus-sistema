// src/components/despesa/DespesaFormClassificacaoFuncional.jsx
// ✅ LAYOUT PROFISSIONAL: Campos otimizados e organizados
// 🎨 VISUAL APRIMORADO: Cores dinâmicas na situação cadastral
// 🔌 API CNPJ: Busca automática com proxy CORS

import React, { useState } from "react";
import {
  ELEMENTOS_DESPESA,
  ACOES_ORCAMENTARIAS,
  STATUS_PAGAMENTO_DESPESA,
} from "../../config/constants";
import { useNaturezasDespesa } from "../../hooks/useNaturezasDespesa"; // 🆕 Hook para naturezas dinâmicas

const DespesaFormClassificacaoFuncional = ({
  formData,
  errors,
  modoVisualizacao,
  handleInputChange,
}) => {
  // 🆕 Hook para carregar naturezas dinâmicas (fixas + Firebase)
  const { naturezas, loading: loadingNaturezas } = useNaturezasDespesa();

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

  // 🎨 Cor da situação cadastral
  const getCorSituacao = (situacao) => {
    if (!situacao) return "#6c757d";
    const situacaoUpper = situacao.toUpperCase();
    if (situacaoUpper.includes("ATIVA")) return "#27ae60";
    if (
      situacaoUpper.includes("INAPTA") ||
      situacaoUpper.includes("SUSPENS") ||
      situacaoUpper.includes("BAIXA") ||
      situacaoUpper.includes("INATIVA")
    )
      return "#dc3545";
    return "#6c757d";
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📊</span>
        Classificação Funcional-Programática
      </legend>

      {/* LINHA 1: Ação e Status */}
      <div style={styles.formRow}>
        <div style={styles.formGroupLarge}>
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
            {ACOES_ORCAMENTARIAS.map((acao) => (
              <option key={acao.codigo} value={acao.codigo}>
                {acao.codigo} - {acao.descricao}
              </option>
            ))}
          </select>
          {errors.acao && <span style={styles.errorText}>{errors.acao}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status Pagamento</label>
          <select
            name="statusPagamento"
            value={formData.statusPagamento || "pendente"}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            {STATUS_PAGAMENTO_DESPESA.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LINHA 2: Categoria e Natureza */}
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

        <div style={styles.formGroupLarge}>
          <label style={styles.label}>Natureza de Despesa</label>
          {!modoNaturezaCustomizada ? (
            <select
              name="naturezaDespesa"
              value={formData.naturezaDespesa || ""}
              onChange={handleNaturezaChange}
              style={styles.select}
              disabled={modoVisualizacao || loadingNaturezas}
            >
              <option value="">
                {loadingNaturezas ? "⏳ Carregando naturezas..." : "Selecione a natureza de despesas"}
              </option>
              {naturezas && naturezas.map((natureza, index) => (
                <option key={`natureza-${index}`} value={natureza}>
                  {natureza}
                </option>
              ))}
              <option disabled>──────────────────</option>
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

      {/* DIVISOR */}
      <div style={styles.divider}>
        <span style={styles.dividerText}>
          🔍 DADOS DO FORNECEDOR
          {buscandoCNPJ && " 🔄 CONSULTANDO..."}
          {cnpjEncontrado && !buscandoCNPJ && " ✅ PREENCHIDO"}
        </span>
      </div>

      {/* LINHA 4: CNPJ + Botão Atualizar + Razão Social */}
      <div style={styles.formRowCNPJ}>
        <div style={styles.formGroupCNPJWrapper}>
          <div style={styles.formGroupCNPJ}>
            <label style={styles.label}>
              CNPJ{" "}
              {cnpjError && (
                <span style={styles.validationBadge}>⚠️ {cnpjError}</span>
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
          </div>

          {!modoVisualizacao && formData.cnpjFornecedor && (
            <button
              type="button"
              onClick={() => {
                if (formData.cnpjFornecedor) {
                  buscarDadosCNPJ(formData.cnpjFornecedor);
                }
              }}
              style={styles.btnRefresh}
              title="Atualizar dados do CNPJ"
              disabled={buscandoCNPJ}
            >
              {buscandoCNPJ ? "🔄" : "🔃"}
            </button>
          )}
        </div>

        <div style={styles.formGroupRazaoSocial}>
          <label style={styles.label}>Razão Social</label>
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

      {/* LINHA 5: Nome Fantasia, Telefone, Email */}
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