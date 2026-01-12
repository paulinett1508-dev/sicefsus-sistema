// src/components/despesa/DespesaFormClassificacaoFuncional.jsx
// ✅ ATUALIZADO 06/11/2025: Corrigido select de Natureza - usando apenas constants.js
// 🔧 CORREÇÃO: Removida dependência do Firebase para naturezas (causava erro de permissão)
// ✅ DARK MODE: Suporte completo ao tema escuro
// ✅ ATUALIZADO 12/01/2026: Integração com FornecedorSelect

import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import {
  NATUREZAS_DESPESA,
  ELEMENTOS_DESPESA,
  ACOES_ORCAMENTARIAS,
  STATUS_PAGAMENTO_DESPESA,
} from "../../config/constants";
import FornecedorSelect from "../fornecedor/FornecedorSelect";
import { useFornecedoresData } from "../../hooks/useFornecedoresData";

const DespesaFormClassificacaoFuncional = ({
  formData,
  errors,
  modoVisualizacao,
  handleInputChange,
}) => {
  const { isDark } = useTheme?.() || { isDark: false };
  const { usuario } = useUser?.() || { usuario: null };
  const styles = getStyles(isDark);

  // Hook de fornecedores
  const { fornecedores, loading: loadingFornecedores, criar: criarFornecedor } = useFornecedoresData(usuario);

  const [modoFornecedor, setModoFornecedor] = useState("manual"); // "selecionar" | "manual"
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
      // Buscar na BrasilAPI (fonte oficial e confiavel)
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("CNPJ nao encontrado na base da Receita Federal");
        }
        throw new Error("Servico temporariamente indisponivel. Tente novamente.");
      }

      const dados = await response.json();

      // Preencher campos com dados da BrasilAPI
      if (dados.razao_social) {
        handleInputChange({
          target: { name: "fornecedor", value: dados.razao_social },
        });
      }

      if (dados.nome_fantasia) {
        handleInputChange({
          target: { name: "nomeFantasia", value: dados.nome_fantasia },
        });
      }

      if (dados.ddd_telefone_1) {
        const tel = dados.ddd_telefone_1.replace(/[^\d]/g, "");
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
      const situacao = dados.descricao_situacao_cadastral || "ATIVA";
      handleInputChange({
        target: { name: "situacaoCadastral", value: situacao.toUpperCase() },
      });

      setCnpjEncontrado(true);
      setCnpjError("");
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setCnpjError(error.message || "Erro ao buscar CNPJ");
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

  // Handler para selecionar fornecedor existente
  const handleSelecionarFornecedor = (fornecedor) => {
    if (!fornecedor) {
      // Limpar todos os campos do fornecedor
      handleInputChange({ target: { name: "fornecedorId", value: "" } });
      handleInputChange({ target: { name: "cnpjFornecedor", value: "" } });
      handleInputChange({ target: { name: "fornecedor", value: "" } });
      handleInputChange({ target: { name: "nomeFantasia", value: "" } });
      handleInputChange({ target: { name: "telefoneFornecedor", value: "" } });
      handleInputChange({ target: { name: "emailFornecedor", value: "" } });
      handleInputChange({ target: { name: "enderecoFornecedor", value: "" } });
      handleInputChange({ target: { name: "cidadeUf", value: "" } });
      handleInputChange({ target: { name: "cep", value: "" } });
      handleInputChange({ target: { name: "situacaoCadastral", value: "" } });
      setCnpjEncontrado(false);
      return;
    }

    // Preencher campos com dados do fornecedor selecionado
    handleInputChange({ target: { name: "fornecedorId", value: fornecedor.id } });
    handleInputChange({ target: { name: "cnpjFornecedor", value: formatarCNPJ(fornecedor.cnpj || "") } });
    handleInputChange({ target: { name: "fornecedor", value: fornecedor.razaoSocial || "" } });
    handleInputChange({ target: { name: "nomeFantasia", value: fornecedor.nomeFantasia || "" } });
    handleInputChange({ target: { name: "telefoneFornecedor", value: fornecedor.contato?.telefone || "" } });
    handleInputChange({ target: { name: "emailFornecedor", value: fornecedor.contato?.email || "" } });

    // Montar endereco completo
    const endereco = fornecedor.endereco || {};
    const enderecoCompleto = [
      endereco.logradouro,
      endereco.numero && `n ${endereco.numero}`,
      endereco.complemento,
      endereco.bairro,
    ].filter(Boolean).join(", ");

    handleInputChange({ target: { name: "enderecoFornecedor", value: enderecoCompleto } });
    handleInputChange({ target: { name: "cidadeUf", value: `${endereco.cidade || ""}/${endereco.uf || ""}` } });
    handleInputChange({ target: { name: "cep", value: formatarCEP(endereco.cep || "") } });
    handleInputChange({ target: { name: "situacaoCadastral", value: fornecedor.situacaoCadastral || "ATIVA" } });

    setCnpjEncontrado(true);
    setCnpjError("");
  };

  // Handler para criar novo fornecedor via FornecedorSelect
  const handleCriarFornecedorViaSelect = async (dados) => {
    try {
      const novoId = await criarFornecedor(dados);
      return novoId;
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
      throw error;
    }
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
      return "#10B981";
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
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>work</span>
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
                <option key={nat} value={nat}>
                  {nat}
                </option>
              ))}
              <option value="__DIGITAR_OUTRA__">Digitar Outra...</option>
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
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>check</span>
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModoNaturezaCustomizada(false);
                  setNaturezaCustomizada("");
                }}
                style={styles.voltarButton}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle" }}>close</span>
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
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
              <option value="__DIGITAR_OUTRO__">Digitar Outro...</option>
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
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>check</span>
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModoElementoCustomizado(false);
                  setElementoCustomizado("");
                }}
                style={styles.voltarButton}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle" }}>close</span>
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
              <option
                key={acao.codigo}
                value={`${acao.codigo} - ${acao.descricao}`}
              >
                {acao.codigo} - {acao.descricao}
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

      {/* Toggle: Selecionar Existente ou Preencher Manualmente */}
      {!modoVisualizacao && fornecedores.length > 0 && (
        <div style={styles.fornecedorModoToggle}>
          <button
            type="button"
            style={{
              ...styles.modoToggleBtn,
              ...(modoFornecedor === "selecionar" ? styles.modoToggleBtnActive : {}),
            }}
            onClick={() => setModoFornecedor("selecionar")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>
              list
            </span>
            Selecionar Existente
          </button>
          <button
            type="button"
            style={{
              ...styles.modoToggleBtn,
              ...(modoFornecedor === "manual" ? styles.modoToggleBtnActive : {}),
            }}
            onClick={() => setModoFornecedor("manual")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>
              edit
            </span>
            Preencher Manualmente
          </button>
        </div>
      )}

      {/* Seletor de Fornecedor Existente */}
      {modoFornecedor === "selecionar" && !modoVisualizacao && fornecedores.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={styles.label}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>
              business
            </span>
            Selecionar Fornecedor
          </label>
          <FornecedorSelect
            fornecedores={fornecedores}
            value={formData.fornecedorId || ""}
            onChange={handleSelecionarFornecedor}
            onCriarFornecedor={handleCriarFornecedorViaSelect}
            loading={loadingFornecedores}
            placeholder="Busque por CNPJ ou razao social..."
          />
          {formData.fornecedorId && (
            <p style={styles.fornecedorSelecionadoHint}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#10B981", verticalAlign: "middle", marginRight: 4 }}>
                check_circle
              </span>
              Fornecedor selecionado. Campos preenchidos automaticamente.
            </p>
          )}
        </div>
      )}

      {/* LINHA 3: CNPJ | Razão Social */}
      <div style={styles.formRowCNPJ}>
        <div style={styles.formGroupCNPJWrapper}>
          <div style={styles.formGroupCNPJ}>
            <label style={styles.labelRequired}>
              CNPJ <span style={{ color: "#dc3545" }}>*</span>
              {cnpjError && <span className="material-symbols-outlined" style={{ ...styles.validationBadge, fontSize: 14 }}>warning</span>}
              {cnpjEncontrado && (
                <span style={{ ...styles.validationBadge, color: "#10B981" }}>
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
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {buscandoCNPJ ? "sync" : "search"}
              </span>
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
            Email {emailError && <span className="material-symbols-outlined" style={{ ...styles.validationBadge, fontSize: 14 }}>warning</span>}
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
              backgroundColor: isDark ? "var(--theme-input-bg, #0f172a)" : "#f8f9fa",
              cursor: "not-allowed",
              opacity: 1, // Garantir que o texto seja legível mesmo em readOnly
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

// ✅ ESTILOS COM SUPORTE A DARK MODE
const getStyles = (isDark) => ({
  fieldset: {
    border: `1px solid ${isDark ? "var(--theme-border, #334155)" : "#E2E8F0"}`,
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: isDark ? "var(--theme-surface, #1e293b)" : "#ffffff",
    boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
  },
  legend: {
    background: isDark ? "var(--theme-surface, #1e293b)" : "white",
    padding: "6px 16px",
    borderRadius: "9999px",
    border: `1px solid ${isDark ? "var(--theme-border, #334155)" : "#E2E8F0"}`,
    color: isDark ? "var(--theme-text, #e2e8f0)" : "#334155",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Inter', sans-serif",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
    gridTemplateColumns: "2fr 1fr 150px",
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
    backgroundColor: isDark ? "#3b82f6" : "#2563EB",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: isDark ? "0 2px 4px rgba(59, 130, 246, 0.3)" : "0 2px 4px rgba(37, 99, 235, 0.2)",
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
    color: isDark ? "var(--theme-text, #e2e8f0)" : "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  label: {
    fontWeight: "bold",
    color: isDark ? "var(--theme-text, #e2e8f0)" : "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  input: {
    padding: "12px",
    border: `2px solid ${isDark ? "var(--theme-border, #475569)" : "#dee2e6"}`,
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: isDark ? "var(--theme-input-bg, #0f172a)" : "white",
    color: isDark ? "var(--theme-text, #e2e8f0)" : "inherit",
    boxSizing: "border-box",
  },
  inputError: {
    padding: "12px",
    border: `2px solid ${isDark ? "#f87171" : "#dc3545"}`,
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: isDark ? "rgba(248, 113, 113, 0.1)" : "#fff5f5",
    color: isDark ? "var(--theme-text, #e2e8f0)" : "inherit",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px",
    border: `2px solid ${isDark ? "var(--theme-border, #475569)" : "#dee2e6"}`,
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: isDark ? "var(--theme-input-bg, #0f172a)" : "white",
    color: isDark ? "var(--theme-text, #e2e8f0)" : "inherit",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  errorText: {
    color: isDark ? "#f87171" : "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "500",
  },
  validationBadge: { marginLeft: "5px", color: isDark ? "#f87171" : "#dc3545", verticalAlign: "middle" },
  inputCustomizadoWrapper: { display: "flex", gap: "8px" },
  voltarButton: {
    backgroundColor: isDark ? "#475569" : "#6c757d",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
  },
  divider: {
    margin: "30px 0 20px 0",
    borderTop: `2px solid ${isDark ? "var(--theme-border, #475569)" : "#dee2e6"}`,
    position: "relative",
    height: "1px",
  },
  dividerText: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: isDark ? "var(--theme-surface, #1e293b)" : "#ffffff",
    padding: "0 15px",
    fontSize: "13px",
    fontWeight: "600",
    color: isDark ? "#60a5fa" : "#2563EB",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
  fornecedorModoToggle: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  modoToggleBtn: {
    flex: 1,
    padding: "10px 16px",
    border: `2px solid ${isDark ? "var(--theme-border, #475569)" : "#dee2e6"}`,
    borderRadius: "8px",
    backgroundColor: isDark ? "var(--theme-surface-secondary, #0f172a)" : "#f8f9fa",
    color: isDark ? "var(--theme-text-secondary, #94a3b8)" : "#6c757d",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  modoToggleBtnActive: {
    borderColor: isDark ? "#3b82f6" : "#2563EB",
    backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.05)",
    color: isDark ? "#60a5fa" : "#2563EB",
    fontWeight: "600",
  },
  fornecedorSelecionadoHint: {
    marginTop: "8px",
    fontSize: "12px",
    color: isDark ? "#86efac" : "#10B981",
    display: "flex",
    alignItems: "center",
  },
});

export default DespesaFormClassificacaoFuncional;
