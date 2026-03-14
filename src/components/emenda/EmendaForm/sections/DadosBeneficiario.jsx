// src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx
// ✅ CORREÇÃO CRÍTICA: Props limpas + Re-renderização otimizada

import React, { useState, useCallback } from "react";

const DadosBeneficiario = ({
  formData,
  onChange,
  // setFormData, // 🚨 REMOVIDO - Prop desnecessária
  // styles,      // 🚨 REMOVIDO - Não usado
  buscarDadosFornecedor,
  fieldErrors = {},
  onClearError,
  expanded,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // ✅ DEBUG: Verificar props recebidas
  React.useEffect(() => {
    console.log('📋 DadosBeneficiario - Props recebidas:', {
      hasOnChange: typeof onChange === 'function',
      hasFormData: !!formData,
      cnpj: formData?.cnpjBeneficiario || formData?.beneficiario
    });
  }, [onChange, formData]);


  // ✅ OTIMIZAÇÃO: useCallback para evitar re-renderizações
  const toggleExpanded = useCallback(() => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  }, [onToggle, isExpanded]);

  const currentExpanded = expanded !== undefined ? expanded : isExpanded;

  // ✅ OTIMIZAÇÃO: useCallback para handleChange
  const handleChange = useCallback(
    (e) => {
      const { name } = e.target;

      console.log("📄 DadosBeneficiario onChange:", {
        name,
        value: e.target.value,
        valueTipo: typeof e.target.value,
        valueLength: e.target.value?.length || 0,
      });

      onChange(e);

      // Limpar erro se campo foi preenchido
      if (onClearError && fieldErrors[name]) {
        onClearError(name);
      }
    },
    [onChange, onClearError, fieldErrors],
  );

  // ✅ CORREÇÃO: Função de busca CNPJ otimizada - SEM setFormData
  const buscarDadosCNPJ = useCallback(
    async (cnpj) => {
      try {
        const cnpjLimpo = cnpj.replace(/\D/g, "");

        if (cnpjLimpo.length !== 14) return;

        setLoading(true);

        const response = await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
        );

        if (response.ok) {
          const dados = await response.json();

          // ✅ CORREÇÃO: Usar APENAS onChange - SEM setFormData
          const novosValores = {
            beneficiario:
              dados.razao_social ||
              dados.nome_fantasia ||
              formData.beneficiario,
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

          // ✅ SOLUÇÃO OTIMIZADA: Usar apenas onChange
          Object.entries(novosValores).forEach(([key, value]) => {
            if (value && value !== formData[key]) {
              onChange({
                target: {
                  name: key,
                  value: value,
                },
              });
            }
          });

          // Expandir automaticamente para mostrar os dados preenchidos
          if (onToggle) {
            onToggle();
          } else {
            setIsExpanded(true);
          }

          setToast({
            show: true,
            message: `✅ Dados carregados: ${dados.nome_fantasia || dados.razao_social}`,
            type: "success",
          });

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
    },
    [formData, onChange, onToggle],
  );

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

      {/* HEADER COLAPSÍVEL */}
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

      {/* CONTEÚDO COLAPSÍVEL */}
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
                  ...(fieldErrors?.beneficiario && customStyles.inputError),
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
                style={customStyles.input}
              />
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
                style={customStyles.input}
              />
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
                style={customStyles.input}
              />
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
                style={customStyles.input}
              />
            </div>
          </div>

          {/* Campos de texto maiores */}
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
                style={customStyles.textarea}
              />
            </div>

            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>Informações Adicionais</label>
              <textarea
                name="infoAdicionaisBeneficiario"
                value={formData.infoAdicionaisBeneficiario || ""}
                onChange={handleChange}
                placeholder="Outras informações relevantes..."
                rows="3"
                style={customStyles.textarea}
              />
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
    border: "2px solid var(--action)",
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
    border: "2px solid var(--action)",
    color: "var(--action)",
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
    color: "var(--action)",
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
};

export default DadosBeneficiario;