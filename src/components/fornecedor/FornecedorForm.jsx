// src/components/fornecedor/FornecedorForm.jsx
// Modal para criar/editar fornecedor

import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { validarCNPJ, formatarCNPJ } from "../../utils/cnpjUtils";

/**
 * Modal para criar/editar fornecedor
 */
const FornecedorForm = ({
  isVisible,
  onClose,
  onSalvar,
  fornecedor = null, // null = criar, objeto = editar
  salvando = false,
}) => {
  const { isDark } = useTheme?.() || { isDark: false };

  // Estados do formulario
  const [formData, setFormData] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    ufEndereco: "",
    cep: "",
    telefone: "",
    email: "",
    situacaoCadastral: "ATIVA",
  });

  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [cnpjError, setCnpjError] = useState("");
  const [cnpjEncontrado, setCnpjEncontrado] = useState(false);

  // Carregar dados do fornecedor para edicao
  useEffect(() => {
    if (fornecedor) {
      setFormData({
        cnpj: formatarCNPJ(fornecedor.cnpj) || "",
        razaoSocial: fornecedor.razaoSocial || "",
        nomeFantasia: fornecedor.nomeFantasia || "",
        logradouro: fornecedor.endereco?.logradouro || "",
        numero: fornecedor.endereco?.numero || "",
        complemento: fornecedor.endereco?.complemento || "",
        bairro: fornecedor.endereco?.bairro || "",
        cidade: fornecedor.endereco?.cidade || "",
        ufEndereco: fornecedor.endereco?.uf || "",
        cep: formatarCEP(fornecedor.endereco?.cep) || "",
        telefone: formatarTelefone(fornecedor.contato?.telefone) || "",
        email: fornecedor.contato?.email || "",
        situacaoCadastral: fornecedor.situacaoCadastral || "ATIVA",
      });
      setCnpjEncontrado(true);
    } else {
      // Limpar para novo fornecedor
      setFormData({
        cnpj: "",
        razaoSocial: "",
        nomeFantasia: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        ufEndereco: "",
        cep: "",
        telefone: "",
        email: "",
        situacaoCadastral: "ATIVA",
      });
      setCnpjEncontrado(false);
    }
    setCnpjError("");
  }, [fornecedor, isVisible]);

  // Formatadores
  const formatarTelefone = (valor) => {
    if (!valor) return "";
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatarCEP = (valor) => {
    if (!valor) return "";
    const numeros = valor.replace(/\D/g, "");
    return numeros.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  // Buscar dados do CNPJ via API
  const buscarDadosCNPJ = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
      setCnpjError("CNPJ deve ter 14 digitos");
      return;
    }

    if (!validarCNPJ(formData.cnpj)) {
      setCnpjError("CNPJ invalido");
      return;
    }

    setBuscandoCNPJ(true);
    setCnpjError("");

    try {
      // Buscar na BrasilAPI (fonte oficial e confiavel)
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("CNPJ nao encontrado na base da Receita Federal");
        }
        throw new Error("Servico temporariamente indisponivel. Tente novamente em alguns minutos.");
      }

      const dados = await response.json();

      // Preencher campos com dados da API
      setFormData((prev) => ({
        ...prev,
        razaoSocial: dados.razao_social || prev.razaoSocial,
        nomeFantasia: dados.nome_fantasia || prev.nomeFantasia,
        logradouro: dados.logradouro || prev.logradouro,
        numero: dados.numero || prev.numero,
        complemento: dados.complemento || prev.complemento,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.municipio || prev.cidade,
        ufEndereco: dados.uf || prev.ufEndereco,
        cep: formatarCEP(dados.cep) || prev.cep,
        telefone: formatarTelefone(dados.ddd_telefone_1 || "") || prev.telefone,
        email: dados.email || prev.email,
        situacaoCadastral: (dados.descricao_situacao_cadastral || "ATIVA").toUpperCase(),
      }));

      setCnpjEncontrado(true);
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setCnpjError(error.message || "Erro ao buscar dados do CNPJ");
      setCnpjEncontrado(false);
    } finally {
      setBuscandoCNPJ(false);
    }
  };

  // Handler de mudanca de input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cnpj") {
      const cnpjFormatado = formatarCNPJ(value);
      setFormData((prev) => ({ ...prev, cnpj: cnpjFormatado }));
      setCnpjError("");
      setCnpjEncontrado(false);
    } else if (name === "telefone") {
      setFormData((prev) => ({ ...prev, telefone: formatarTelefone(value) }));
    } else if (name === "cep") {
      setFormData((prev) => ({ ...prev, cep: formatarCEP(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validar formulario
  const validarForm = () => {
    if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
      setCnpjError("CNPJ obrigatorio");
      return false;
    }
    if (!validarCNPJ(formData.cnpj)) {
      setCnpjError("CNPJ invalido");
      return false;
    }
    if (!formData.razaoSocial?.trim()) {
      return false;
    }
    return true;
  };

  // Salvar fornecedor
  const handleSalvar = () => {
    if (!validarForm()) return;

    onSalvar({
      cnpj: formData.cnpj,
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia,
      endereco: {
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.ufEndereco,
        cep: formData.cep,
      },
      contato: {
        telefone: formData.telefone,
        email: formData.email,
      },
      situacaoCadastral: formData.situacaoCadastral,
    });
  };

  if (!isVisible) return null;

  const isEdicao = !!fornecedor;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal(isDark)} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header(isDark)}>
          <h3 style={styles.titulo(isDark)}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, marginRight: 8 }}
            >
              business
            </span>
            {isEdicao ? "Editar Fornecedor" : "Novo Fornecedor"}
          </h3>
          <button style={styles.btnFechar(isDark)} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* CNPJ */}
          <div style={styles.formGroup}>
            <label style={styles.label(isDark)}>
              CNPJ <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <div style={styles.inputGroup}>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0001-00"
                style={{
                  ...styles.input(isDark),
                  flex: 1,
                  borderColor: cnpjError
                    ? "var(--error)"
                    : cnpjEncontrado
                    ? "var(--success)"
                    : undefined,
                }}
                maxLength={18}
                disabled={isEdicao}
              />
              <button
                type="button"
                onClick={buscarDadosCNPJ}
                disabled={
                  buscandoCNPJ ||
                  formData.cnpj.replace(/\D/g, "").length !== 14 ||
                  isEdicao
                }
                style={styles.btnBuscar(isDark, buscandoCNPJ)}
                title="Buscar dados do CNPJ"
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 18,
                    animation: buscandoCNPJ ? "spin 1s linear infinite" : "none",
                  }}
                >
                  {buscandoCNPJ ? "sync" : "search"}
                </span>
              </button>
            </div>
            {cnpjError && <span style={styles.error}>{cnpjError}</span>}
            {cnpjEncontrado && !cnpjError && (
              <span style={styles.success}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>
                  check_circle
                </span>
                Dados carregados
              </span>
            )}
          </div>

          {/* Razao Social */}
          <div style={styles.formGroup}>
            <label style={styles.label(isDark)}>
              Razao Social <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              type="text"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              placeholder="Nome da empresa"
              style={styles.input(isDark)}
            />
          </div>

          {/* Nome Fantasia */}
          <div style={styles.formGroup}>
            <label style={styles.label(isDark)}>Nome Fantasia</label>
            <input
              type="text"
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              placeholder="Nome fantasia"
              style={styles.input(isDark)}
            />
          </div>

          {/* Separador - Endereco */}
          <div style={styles.separador(isDark)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>
              location_on
            </span>
            Endereco
          </div>

          {/* Logradouro + Numero */}
          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 3 }}>
              <label style={styles.label(isDark)}>Logradouro</label>
              <input
                type="text"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                placeholder="Rua, Avenida, etc."
                style={styles.input(isDark)}
              />
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label(isDark)}>Numero</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="123"
                style={styles.input(isDark)}
              />
            </div>
          </div>

          {/* Complemento + Bairro */}
          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label(isDark)}>Complemento</label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                placeholder="Sala, Andar, etc."
                style={styles.input(isDark)}
              />
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label(isDark)}>Bairro</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Bairro"
                style={styles.input(isDark)}
              />
            </div>
          </div>

          {/* Cidade + UF + CEP */}
          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 2 }}>
              <label style={styles.label(isDark)}>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Cidade"
                style={styles.input(isDark)}
              />
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label(isDark)}>UF</label>
              <input
                type="text"
                name="ufEndereco"
                value={formData.ufEndereco}
                onChange={handleChange}
                placeholder="UF"
                style={styles.input(isDark)}
                maxLength={2}
              />
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label(isDark)}>CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                style={styles.input(isDark)}
                maxLength={9}
              />
            </div>
          </div>

          {/* Separador - Contato */}
          <div style={styles.separador(isDark)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>
              contact_phone
            </span>
            Contato
          </div>

          {/* Telefone + Email */}
          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label(isDark)}>Telefone</label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                style={styles.input(isDark)}
                maxLength={15}
              />
            </div>
            <div style={{ ...styles.formGroup, flex: 2 }}>
              <label style={styles.label(isDark)}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@empresa.com"
                style={styles.input(isDark)}
              />
            </div>
          </div>

          {/* Situacao Cadastral */}
          <div style={styles.formGroup}>
            <label style={styles.label(isDark)}>Situacao Cadastral</label>
            <select
              name="situacaoCadastral"
              value={formData.situacaoCadastral}
              onChange={handleChange}
              style={styles.select(isDark)}
            >
              <option value="ATIVA">Ativa</option>
              <option value="BAIXADA">Baixada</option>
              <option value="SUSPENSA">Suspensa</option>
              <option value="INAPTA">Inapta</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer(isDark)}>
          <button
            type="button"
            onClick={onClose}
            style={styles.btnCancelar(isDark)}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            style={styles.btnSalvar}
            disabled={salvando || !formData.razaoSocial?.trim()}
          >
            {salvando ? (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16, marginRight: 6, animation: "spin 1s linear infinite" }}
                >
                  sync
                </span>
                Salvando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>
                  save
                </span>
                {isEdicao ? "Atualizar" : "Salvar"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modal: (isDark) => ({
    backgroundColor: isDark ? "var(--theme-surface)" : "#ffffff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  }),
  header: (isDark) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: `1px solid ${isDark ? "var(--theme-border)" : "#E2E8F0"}`,
    backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#F8FAFC",
  }),
  titulo: (isDark) => ({
    fontSize: "16px",
    fontWeight: "600",
    color: isDark ? "var(--theme-text)" : "#1E293B",
    margin: 0,
    display: "flex",
    alignItems: "center",
  }),
  btnFechar: (isDark) => ({
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: isDark ? "var(--theme-text-secondary)" : "#64748B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  body: {
    padding: "20px",
    overflowY: "auto",
    flex: 1,
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: (isDark) => ({
    display: "block",
    fontSize: "12px",
    fontWeight: "500",
    color: isDark ? "var(--theme-text-secondary)" : "#64748B",
    marginBottom: "6px",
  }),
  input: (isDark) => ({
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: `1px solid ${isDark ? "var(--theme-border)" : "#E2E8F0"}`,
    borderRadius: "6px",
    backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#ffffff",
    color: isDark ? "var(--theme-text)" : "#1E293B",
    outline: "none",
    boxSizing: "border-box",
  }),
  select: (isDark) => ({
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: `1px solid ${isDark ? "var(--theme-border)" : "#E2E8F0"}`,
    borderRadius: "6px",
    backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#ffffff",
    color: isDark ? "var(--theme-text)" : "#1E293B",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  }),
  inputGroup: {
    display: "flex",
    gap: "8px",
  },
  btnBuscar: (isDark, disabled) => ({
    padding: "10px 12px",
    backgroundColor: disabled
      ? isDark
        ? "var(--theme-surface-secondary)"
        : "#E2E8F0"
      : "var(--primary)",
    color: disabled ? (isDark ? "var(--theme-text-secondary)" : "#94A3B8") : "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  row: {
    display: "flex",
    gap: "12px",
  },
  separador: (isDark) => ({
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: isDark ? "var(--theme-text-secondary)" : "#64748B",
    marginTop: "8px",
    marginBottom: "16px",
    paddingTop: "16px",
    borderTop: `1px solid ${isDark ? "var(--theme-border)" : "#E2E8F0"}`,
  }),
  error: {
    display: "block",
    fontSize: "11px",
    color: "var(--error)",
    marginTop: "4px",
  },
  success: {
    display: "flex",
    alignItems: "center",
    fontSize: "11px",
    color: "var(--success)",
    marginTop: "4px",
  },
  footer: (isDark) => ({
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 20px",
    borderTop: `1px solid ${isDark ? "var(--theme-border)" : "#E2E8F0"}`,
    backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#F8FAFC",
  }),
  btnCancelar: (isDark) => ({
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "transparent",
    color: isDark ? "var(--theme-text-secondary)" : "#64748B",
    border: `1px solid ${isDark ? "var(--theme-border)" : "#E2E8F0"}`,
    borderRadius: "6px",
    cursor: "pointer",
  }),
  btnSalvar: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
};

// CSS para animacao do spinner
if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("fornecedor-form-styles");
  if (!existingStyle) {
    const style = document.createElement("style");
    style.id = "fornecedor-form-styles";
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

export default FornecedorForm;
