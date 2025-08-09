import React, { useState } from "react";
import CNPJInput from "../../../CNPJInput";
import MunicipioSelector from "../../../MunicipioSelector";

const DadosBeneficiario = ({
  formData,
  onChange,
  setFormData,
  styles,
  buscarDadosFornecedor,
  errors = {},
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
              onChange({
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

      {/* HEADER COLAPSÁVEL - MESMO FORMATO DE InformacoesComplementares */}
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

      {/* CONTEÚDO COLAPSÁVEL - MESMO FORMATO DE InformacoesComplementares */}
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
                onChange={onChange}
                placeholder="Nome completo da instituição beneficiária"
                style={customStyles.input}
              />
              {errors?.beneficiario && (
                <span style={customStyles.errorText}>
                  {errors.beneficiario}
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
                placeholder="Nome do responsável pela instituição"
                style={customStyles.input}
              />
            </div>

            {/* CNPJ do Beneficiário - USANDO CNPJInput COM VALIDAÇÃO */}
            <div style={customStyles.formGroup}>
              <CNPJInput
                label="CNPJ do Beneficiário (Opcional)"
                value={formData?.cnpjBeneficiario || ""}
                onChange={(e) => {
                  console.log("🔧 DadosBeneficiario CNPJ change:", e.target.value);
                  onChange({
                    target: {
                      name: "cnpjBeneficiario",
                      value: e.target.value,
                    },
                  });
                }}
                required={false}
                placeholder="00.000.000/0000-00"
                showValidation={true}
                style={customStyles.formGroup}
                inputStyle={customStyles.input}
                onValidChange={(isValid, value) => {
                  console.log("🎯 DadosBeneficiario CNPJ validation:", isValid, value);
                }}
              />
            </div>

            {/* CPF do Responsável */}
            <div style={customStyles.formGroup}>
              <label style={customStyles.label}>CPF do Responsável</label>
              <input
                type="text"
                name="cpfResponsavel"
                value={formData?.cpfResponsavel || ""}
                onChange={onChange}
                placeholder="000.000.000-00"
                style={customStyles.input}
              />
            </div>
          </div>

          {/* Seção de Localização do Beneficiário */}
          <div style={customStyles.localizacaoSection}>
            <h4 style={customStyles.sectionTitle}>
              📍 Localização do Beneficiário
            </h4>
            <div style={customStyles.localizacaoContainer}>
              <MunicipioSelector
                ufSelecionada={formData?.ufBeneficiario || ""}
                municipioSelecionado={formData?.municipioBeneficiario || ""}
                onUfChange={(uf) => {
                  onChange({
                    target: {
                      name: "ufBeneficiario",
                      value: uf,
                    },
                  });
                  // Limpar município quando UF mudar
                  if (formData?.municipioBeneficiario) {
                    onChange({
                      target: {
                        name: "municipioBeneficiario",
                        value: "",
                      },
                    });
                  }
                }}
                onMunicipioChange={(municipio) => {
                  onChange({
                    target: {
                      name: "municipioBeneficiario",
                      value: municipio,
                    },
                  });
                }}
                disabled={false}
              />
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
                onChange={onChange}
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
                onChange={onChange}
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

// Estilos customizados - MESMO FORMATO DE InformacoesComplementares
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

  localizacaoSection: {
    marginTop: "24px",
    padding: "20px",
    backgroundColor: "#f0f8ff",
    border: "2px solid #4a90e2",
    borderRadius: "8px",
  },

  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#154360",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  localizacaoContainer: {
    display: "block",
  },
};

export default DadosBeneficiario;
