
import React, { useState } from "react";
import CNPJInput from "../../../CNPJInput";

const DadosBeneficiario = ({ 
  formData, 
  onChange, 
  setFormData, 
  styles, 
  buscarDadosFornecedor, 
  errors = {} 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Função para buscar dados do CNPJ automaticamente
  const buscarDadosCNPJ = async (cnpj) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      
      if (cnpjLimpo.length !== 14) return;
      
      setLoading(true);
      
      // API pública para consulta de CNPJ
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      
      if (response.ok) {
        const dados = await response.json();
        
        // Preencher campos automaticamente
        const novosValores = {
          beneficiario: dados.razao_social || dados.nome_fantasia || formData.beneficiario,
          enderecoBeneficiario: dados.logradouro && dados.numero 
            ? `${dados.logradouro}, ${dados.numero} - ${dados.bairro}, ${dados.municipio}/${dados.uf}`
            : formData.enderecoBeneficiario,
          telefoneBeneficiario: dados.ddd_telefone_1 && dados.telefone_1 
            ? `(${dados.ddd_telefone_1}) ${dados.telefone_1}`
            : formData.telefoneBeneficiario,
          emailBeneficiario: dados.email || formData.emailBeneficiario,
          responsavelLegal: dados.qsa && dados.qsa[0] && dados.qsa[0].nome 
            ? dados.qsa[0].nome 
            : formData.responsavelLegal
        };

        // Atualizar formData com múltiplos campos
        if (setFormData) {
          setFormData(prev => ({
            ...prev,
            ...novosValores
          }));
        } else {
          // Se não tiver setFormData, usar onChange para cada campo
          Object.entries(novosValores).forEach(([key, value]) => {
            if (value && value !== formData[key]) {
              onChange({
                target: {
                  name: key,
                  value: value
                }
              });
            }
          });
        }
        
        // Expandir automaticamente para mostrar os dados preenchidos
        setIsExpanded(true);
        
        // Mostrar feedback de sucesso
        setToast({
          show: true,
          message: `✅ Dados carregados: ${dados.nome_fantasia || dados.razao_social}`,
          type: 'success'
        });
        
        // Ocultar toast após 3 segundos
        setTimeout(() => {
          setToast({ show: false, message: '', type: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      setToast({
        show: true,
        message: '⚠️ Erro ao buscar dados do CNPJ',
        type: 'error'
      });
      
      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.section}>
      {/* Toast de notificação */}
      {toast.show && (
        <div style={toast.type === 'success' ? customStyles.toastSuccess : customStyles.toastError}>
          {toast.message}
        </div>
      )}

      {/* CNPJ do Beneficiário - Campo Principal */}
      <div style={styles.content}>
        <div style={styles.row}>
          <div style={styles.field}>
            <CNPJInput
              label="CNPJ do Beneficiário"
              value={formData.cnpjBeneficiario || ''}
              onChange={(e) => {
                onChange({
                  target: {
                    name: 'cnpjBeneficiario',
                    value: e.target.value
                  }
                });
              }}
              onValidChange={(isValid, value) => {
                if (isValid && value) {
                  // Buscar dados automaticamente quando CNPJ for válido
                  buscarDadosCNPJ(value);
                }
              }}
              required={true}
              placeholder="00.000.000/0000-00"
              showValidation={true}
              disabled={loading}
              style={styles.formGroup}
            />
            
            {loading && (
              <div style={customStyles.loadingIndicator}>
                <span>🔄 Buscando dados do CNPJ...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HEADER COLAPSÁVEL para informações adicionais */}
      <div style={styles.headerContainer} onClick={toggleExpanded}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🏢</span>
          Informações Adicionais do Beneficiário (opcional)
        </h3>
        <div style={styles.toggleButton}>
          <span style={styles.toggleIcon}>
            {isExpanded ? '−' : '+'}
          </span>
          <span style={styles.toggleText}>
            {isExpanded ? 'Ocultar' : 'Exibir'}
          </span>
        </div>
      </div>

      {/* CONTEÚDO COLAPSÁVEL */}
      {isExpanded && (
        <div style={styles.content}>
          {/* Primeira linha - Nome e Endereço */}
          <fieldset style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                Nome/Razão Social do Beneficiário
              </label>
              <input
                type="text"
                name="beneficiario"
                value={formData?.beneficiario || ""}
                onChange={onChange}
                placeholder="Nome completo da instituição beneficiária"
                style={styles.input}
              />
              {errors?.beneficiario && (
                <span style={styles.errorText}>{errors.beneficiario}</span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Endereço do Beneficiário
              </label>
              <input
                type="text"
                name="enderecoBeneficiario"
                value={formData?.enderecoBeneficiario || ""}
                onChange={onChange}
                placeholder="Rua, número, bairro, cidade/UF"
                style={styles.input}
              />
            </div>
          </fieldset>

          {/* Segunda linha - Telefone, Email */}
          <fieldset style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                Telefone de Contato
              </label>
              <input
                type="text"
                name="telefoneBeneficiario"
                value={formData?.telefoneBeneficiario || ""}
                onChange={onChange}
                placeholder="(00) 00000-0000"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Email do Beneficiário
              </label>
              <input
                type="email"
                name="emailBeneficiario"
                value={formData?.emailBeneficiario || ""}
                onChange={onChange}
                placeholder="email@instituicao.com.br"
                style={styles.input}
              />
            </div>
          </fieldset>

          {/* Terceira linha - Responsável Legal e CPF */}
          <fieldset style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                Responsável Legal
              </label>
              <input
                type="text"
                name="responsavelLegal"
                value={formData?.responsavelLegal || ""}
                onChange={onChange}
                placeholder="Nome do responsável pela instituição"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                CPF do Responsável
              </label>
              <input
                type="text"
                name="cpfResponsavel"
                value={formData?.cpfResponsavel || ""}
                onChange={onChange}
                placeholder="000.000.000-00"
                style={styles.input}
              />
            </div>
          </fieldset>

          {/* BANNER INFORMATIVO */}
          <div style={styles.infoBanner}>
            <div style={styles.infoIcon}>ℹ️</div>
            <div style={styles.infoText}>
              Digite um CNPJ válido acima para preencher automaticamente os dados do beneficiário. 
              Estas informações complementam os dados básicos e facilitam o contato e acompanhamento da execução da emenda.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos customizados adicionais
const customStyles = {
  toastSuccess: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px 20px',
    borderRadius: '6px',
    border: '1px solid #c3e6cb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    fontSize: '14px',
    fontWeight: '500',
  },
  
  toastError: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 20px',
    borderRadius: '6px',
    border: '1px solid #f5c6cb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    fontSize: '14px',
    fontWeight: '500',
  },
  
  loadingIndicator: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#666',
    fontStyle: 'italic',
  },
};

const styles = {
  section: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "0",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
    marginBottom: "20px",
  },

  headerContainer: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #dee2e6",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background-color 0.2s ease",
  },

  sectionTitle: {
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

  sectionIcon: {
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

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
    border: "none",
    padding: "0",
  },

  field: {
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
    boxSizing: "border-box",
  },

  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
  },

  infoBanner: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#e3f2fd",
    border: "1px solid #bbdefb",
    borderRadius: "6px",
    marginTop: "20px",
  },

  infoIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },

  infoText: {
    fontSize: "14px",
    color: "#1565c0",
    lineHeight: "1.4",
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};

export default DadosBeneficiario;
