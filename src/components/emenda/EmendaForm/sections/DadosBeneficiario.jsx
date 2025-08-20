// src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx
// ✅ CORREÇÃO CRÍTICA: Props alinhadas com EmendaForm

import React, { useState } from "react";

const DadosBeneficiario = ({
  formData,
  onChange,
  setFormData,
  styles,
  buscarDadosFornecedor,
  fieldErrors = {}, // ✅ CORREÇÃO: errors → fieldErrors
  onClearError, // ✅ ADICIONADO: prop faltante
  expanded,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const toggleExpanded = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Use external expanded state if provided, otherwise use internal state
  const currentExpanded = expanded !== undefined ? expanded : isExpanded;

  // ✅ HANDLER COM LIMPEZA DE ERRO
  const handleChange = (e) => {
    const { name } = e.target;
    onChange(e);

    // Limpar erro se campo foi preenchido
    if (onClearError && fieldErrors[name]) {
      onClearError(name);
    }
  };

  // Função para buscar dados do CNPJ automaticamente
  const buscarDadosCNPJ = async (cnpj) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, "");

      if (cnpjLimpo.length !== 14) return;

      setLoading(true);

      // API pública para consulta de CNPJ
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
      );

      if (response.ok) {
        const dados = await response.json();

        // Preencher campos automaticamente
        const novosValores = {
          beneficiario:
            dados.razao_social || dados.nome_fantasia || formData.beneficiario,
          enderecoBeneficiario:
            dados.logradouro && dados.numero
              ? `${dados.logradouro}, ${dados.numero} - ${dados.bairro}, ${dados.municipio}/${dados.uf}`
              : formData.enderecoBeneficiario,
          telefoneBeneficiario:
            dados.ddd_telefone_1 && dados.telefone_1
              ? `(${dados.ddd_telefone_1}) ${dados.telefone_1}`
              : formData.telefoneBeneficiario,
          emailBeneficiario: dados.email || formData.emailBeneficiario,
          responsavelLegal:
            dados.qsa && dados.qsa[0] && dados.qsa[0].nome
              ? dados.qsa[0].nome
              : formData.responsavelLegal,
        };

        // Atualizar formData com múltiplos campos
        if (setFormData) {
          setFormData((prev) => ({
            ...prev,
            ...novosValores,
          }));
        } else {
          // Se não tiver setFormData, usar onChange para cada campo
          Object.entries(novosValores).forEach(([key, value]) => {
            if (value && value !== formData[key]) {
              handleChange({
                target: {
                  name: key,
                  value: value,
                },
              });
            }
          });
        }

        // Expandir automaticamente para mostrar os dados preenchidos se usando estado interno
        if (onToggle) {
          onToggle(); // Use external toggle function if provided
        } else {
          setIsExpanded(true);
        }

        // Mostrar feedback de sucesso
        setToast({
          show: true,
          message: `✅ Dados carregados: ${dados.nome_fantasia || dados.razao_social}`,
          type: "success",
        });

        // Ocultar toast após 3 segundos
        setTimeout(() => {
          setToast({ show: false, message: "", type: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setToast({
        show: true,
        message: "⚠️ Erro ao buscar dados do CNPJ",
        type: "error",
      });

      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={customStyles.section}>
      {/* Toast de notificação */}
      {toast.show && (
        <div
          style={
            toast.type === "success"
              ? customStyles.toastSuccess
              : customStyles.toastError
          }
        >
          {toast.message}
        </div>
      )}

      {/* HEADER COLAPSÍVEL - MESMO FORMATO DE InformacoesComplementares */}
      <div style={customStyles.headerContainer} onClick={toggleExpanded}>
        <legend style={customStyles.legend}>
          <span style={customStyles.legendIcon}>📋</span>
          Informações Adicionais do Beneficiário (Opcional)
        </legend>
        <div style={customStyles.toggleButton}>
          <span style={customStyles.toggleIcon}>
            {currentExpanded ? "−" : "+"}
          </span>
          <span style={customStyles.toggleText}>
            {currentExpanded ? "Ocultar" : "Exibir"}
          </span>
        </div>
      </div>

      {/* CONTEÚDO COLAPSÍVEL - MESMO FORMATO DE InformacoesComplementares */}
      {currentExpanded && (
        <div style={customStyles.content}>
          <div style={customStyles.formGrid}>
            {/* Nome/Razão Social */}
            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>
                Nome/Razão Social do Beneficiário
              </label>
              <input
                type="text"
                name="beneficiario"
                value={formData?.beneficiario || ""}
                onChange={handleChange}
                placeholder="Nome completo da instituição beneficiária"
                style={{
                  ...customStyles.input,
                  ...(fieldErrors?.beneficiario && customStyles.inputError), // ✅ USANDO fieldErrors
                }}
              />
              {fieldErrors?.beneficiario && (
                <span style={customStyles.errorText}>
                  {fieldErrors.beneficiario}
                </span>
              )}
            </div>

            {/* Endereço */}
            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>Endereço do Beneficiário</label>
              <input
                type="text"
                name="enderecoBeneficiario"
                value={formData?.enderecoBeneficiario || ""}
                onChange={handleChange}
                placeholder="Rua, número, bairro, cidade/UF"
                style={{
                  ...customStyles.input,
                  ...(fieldErrors?.enderecoBeneficiario &&
                    customStyles.inputError),
                }}
              />
              {fieldErrors?.enderecoBeneficiario && (
                <span style={customStyles.errorText}>
                  {fieldErrors.enderecoBeneficiario}
                </span>
              )}
            </div>

            {/* Telefone */}
            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>Telefone de Contato</label>
              <input
                type="tel"
                name="telefoneBeneficiario"
                value={formData?.telefoneBeneficiario || ""}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                style={{
                  ...customStyles.input,
                  ...(fieldErrors?.telefoneBeneficiario &&
                    customStyles.inputError),
                }}
              />
              {fieldErrors?.telefoneBeneficiario && (
                <span style={customStyles.errorText}>
                  {fieldErrors.telefoneBeneficiario}
                </span>
              )}
            </div>

            {/* Email */}
            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>E-mail do Beneficiário</label>
              <input
                type="email"
                name="emailBeneficiario"
                value={formData?.emailBeneficiario || ""}
                onChange={handleChange}
                placeholder="email@instituicao.com.br"
                style={{
                  ...customStyles.input,
                  ...(fieldErrors?.emailBeneficiario &&
                    customStyles.inputError),
                }}
              />
              {fieldErrors?.emailBeneficiario && (
                <span style={customStyles.errorText}>
                  {fieldErrors.emailBeneficiario}
                </span>
              )}
            </div>

            {/* Responsável Legal */}
            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>Responsável Legal</label>
              <input
                type="text"
                name="responsavelLegal"
                value={formData?.responsavelLegal || ""}
                onChange={handleChange}
                placeholder="Nome do responsável pela instituição"
                style={{
                  ...customStyles.input,
                  ...(fieldErrors?.responsavelLegal && customStyles.inputError),
                }}
              />
              {fieldErrors?.responsavelLegal && (
                <span style={customStyles.errorText}>
                  {fieldErrors.responsavelLegal}
                </span>
              )}
            </div>
          </div>

          {/* Campos de texto maiores - MESMO FORMATO */}
          <div style={customStyles.textAreaGrid}>
            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>
                Observações sobre o Beneficiário
              </label>
              <textarea
                name="observacoesBeneficiario"
                value={formData.observacoesBeneficiario || ""}
                onChange={handleChange}
                placeholder="Informações complementares sobre o beneficiário..."
                rows="3"
                style={{
                  ...customStyles.textarea,
                  ...(fieldErrors?.observacoesBeneficiario &&
                    customStyles.inputError),
                }}
              />
              {fieldErrors?.observacoesBeneficiario && (
                <span style={customStyles.errorText}>
                  {fieldErrors.observacoesBeneficiario}
                </span>
              )}
            </div>

            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>Informações Adicionais</label>
              <textarea
                name="infoAdicionaisBeneficiario"
                value={formData.infoAdicionaisBeneficiario || ""}
                onChange={handleChange}
                placeholder="Outras informações relevantes..."
                rows="3"
                style={{
                  ...customStyles.textarea,
                  ...(fieldErrors?.infoAdicionaisBeneficiario &&
                    customStyles.inputError),
                }}
              />
              {fieldErrors?.infoAdicionaisBeneficiario && (
                <span style={customStyles.errorText}>
                  {fieldErrors.infoAdicionaisBeneficiario}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ ESTILOS MANTIDOS
const customStyles = {
  section: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "0",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
    marginBottom: "20px",
    marginTop: "20px",
  },

  headerContainer: {
    padding: "15px 20px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #dee2e6",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background-color 0.2s ease",
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
    margin: 0,
  },

  legendIcon: {
    fontSize: "18px",
  },

  toggleButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#495057",
    fontWeight: "500",
  },

  toggleIcon: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#154360",
  },

  toggleText: {
    fontSize: "14px",
  },

  content: {
    padding: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  textAreaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
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
  },

  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },

  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },

  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    resize: "vertical",
    fontFamily: "inherit",
  },

  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
  },

  toastSuccess: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "12px 20px",
    borderRadius: "6px",
    border: "1px solid #c3e6cb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 1000,
    fontSize: "14px",
    fontWeight: "500",
  },

  toastError: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px 20px",
    borderRadius: "6px",
    border: "1px solid #f5c6cb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 1000,
    fontSize: "14px",
    fontWeight: "500",
  },

  loadingIndicator: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#666",
    fontStyle: "italic",
  },
};

export default DadosBeneficiario;
