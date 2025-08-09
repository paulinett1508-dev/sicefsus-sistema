import React from "react";
import CNPJInput from "../../../CNPJInput";
import MunicipioSelector from "../../../MunicipioSelector";

const DadosBasicos = ({ formData = {}, onChange, fieldErrors = {} }) => {
  const programas = [
    "Incremento ao custeio de serviços da atenção primária à saúde",
    "Aquisição de equipamentos",
    "Construção e ampliação",
    "Reforma e adequação",
    "Custeio de serviços especializados",
    "Apoio à gestão do SUS",
    "Vigilância em Saúde",
    "Assistência Farmacêutica",
    "Outro",
  ];

  const formatarMoeda = (valor) => {
    const numero = valor.replace(/\D/g, "");
    if (!numero) return "";
    const centavos = parseInt(numero, 10);
    const reais = centavos / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(reais);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "valor" || name === "valorRecurso") {
      const valorFormatado = formatarMoeda(value);
      onChange({ target: { name, value: valorFormatado } });
    } else {
      onChange(e);
    }
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>💰</span>
        Dados Básicos
      </legend>

      <div style={styles.formGrid}>
        {/* Programa */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Programa <span style={styles.required}>*</span>
          </label>
          <select
            name="programa"
            value={formData.programa || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(fieldErrors.programa && styles.inputError),
            }}
            required
          >
            <option value="">Selecione o programa</option>
            {programas.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
          {fieldErrors.programa && (
            <small style={styles.errorText}>{fieldErrors.programa}</small>
          )}
        </div>

        {/* Objeto da Proposta */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Objeto da Proposta <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="objeto"
            value={formData.objeto || ""}
            onChange={onChange}
            placeholder="Ex: Custeio da atenção primária à saúde"
            style={{
              ...styles.input,
              ...(fieldErrors.objeto && styles.inputError),
            }}
            required
          />
          {fieldErrors.objeto && (
            <small style={styles.errorText}>{fieldErrors.objeto}</small>
          )}
        </div>

        {/* Parlamentar */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Parlamentar/Autor <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="autor"
            value={formData.autor || ""}
            onChange={onChange}
            placeholder="Nome do parlamentar"
            style={{
              ...styles.input,
              ...(fieldErrors.autor && styles.inputError),
            }}
            required
          />
          {fieldErrors.autor && (
            <small style={styles.errorText}>{fieldErrors.autor}</small>
          )}
        </div>

        {/* Número da Emenda */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Número da Emenda <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="numero"
            value={formData.numero || ""}
            onChange={onChange}
            placeholder="Ex: 30460003"
            style={{
              ...styles.input,
              ...(fieldErrors.numero && styles.inputError),
            }}
            required
          />
          {fieldErrors.numero && (
            <small style={styles.errorText}>{fieldErrors.numero}</small>
          )}
        </div>

        {/* Tipo de Emenda */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Tipo de Emenda <span style={styles.required}>*</span>
          </label>
          <select
            name="tipo"
            value={formData.tipo || "Individual"}
            onChange={onChange}
            style={styles.input}
            required
          >
            <option value="Individual">Emenda Individual</option>
            <option value="Bancada">Emenda de Bancada</option>
            <option value="Comissao">Emenda de Comissão</option>
            <option value="Relator">Emenda de Relator</option>
          </select>
        </div>

        {/* Nº da Proposta */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Nº da Proposta</label>
          <input
            type="text"
            name="numeroProposta"
            value={formData.numeroProposta || ""}
            onChange={onChange}
            placeholder="Ex: 36000660361202500"
            style={styles.input}
          />
        </div>

        {/* Funcional */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Funcional</label>
          <input
            type="text"
            name="funcional"
            value={formData.funcional || ""}
            onChange={onChange}
            placeholder="Ex: 10301311928590021"
            style={styles.input}
          />
        </div>

        {/* Beneficiário - USANDO CNPJInput COM VALIDAÇÃO EM TEMPO REAL */}
        <div style={styles.formGroup}>
          <CNPJInput
            label="Beneficiário (CNPJ)"
            value={formData.beneficiario || ""}
            onChange={(e) => {
              onChange({
                target: {
                  name: "beneficiario",
                  value: e.target.value,
                },
              });
            }}
            required={true}
            placeholder="00.000.000/0000-00"
            showValidation={true}
            style={styles.formGroup}
            inputStyle={{
              ...styles.input,
              padding: "12px", // ✅ ALINHAMENTO: mesmo padding dos outros campos
              fontSize: "14px", // ✅ ALINHAMENTO: mesmo font-size dos outros campos
              border: "2px solid #dee2e6", // ✅ ALINHAMENTO: mesma borda dos outros campos
              borderRadius: "6px", // ✅ ALINHAMENTO: mesmo border-radius dos outros campos
            }}
          />
          {fieldErrors.beneficiario && (
            <small style={styles.errorText}>{fieldErrors.beneficiario}</small>
          )}
        </div>

        {/* Valor do Recurso */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Valor do Recurso <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="valor"
            value={formData.valor || ""}
            onChange={handleInputChange}
            placeholder="R$ 0,00"
            style={{
              ...styles.input,
              ...styles.inputMoney,
              ...(fieldErrors.valor && styles.inputError),
            }}
            required
          />
          {fieldErrors.valor && (
            <small style={styles.errorText}>{fieldErrors.valor}</small>
          )}
        </div>
      </div>

      {/* Seção de Localização com Seletor Padronizado */}
      <div style={styles.localizacaoGrid}>
        <MunicipioSelector
          ufSelecionada={formData.uf || ""}
          municipioSelecionado={formData.municipio || ""}
          onUfChange={(uf) => {
            onChange({
              target: {
                name: "uf",
                value: uf,
              },
            });
            // Limpar município quando UF mudar
            if (formData.municipio) {
              onChange({
                target: {
                  name: "municipio",
                  value: "",
                },
              });
            }
          }}
          onMunicipioChange={(municipio) => {
            onChange({
              target: {
                name: "municipio",
                value: municipio,
              },
            });
          }}
          disabled={false}
        />
        
        {/* Validação de erros para localização */}
        {(fieldErrors.uf || fieldErrors.municipio) && (
          <div style={styles.localizacaoErrors}>
            {fieldErrors.uf && (
              <small style={styles.errorText}>{fieldErrors.uf}</small>
            )}
            {fieldErrors.municipio && (
              <small style={styles.errorText}>{fieldErrors.municipio}</small>
            )}
          </div>
        )}
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },
  inputMoney: {
    fontWeight: "600",
    color: "#059669",
    textAlign: "right",
    fontSize: "16px",
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  inputValid: {
    borderColor: "#28a745",
    backgroundColor: "#f8fff9",
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
  },
  successMessage: {
    color: "#27ae60",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
    fontWeight: "500",
  },
  localizacaoGrid: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    border: "2px solid #154360",
    borderRadius: "8px",
  },
  localizacaoErrors: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
};

export default DadosBasicos;
