// src/components/emenda/EmendaForm/sections/Identificacao.jsx
// Seção de Identificação com layout IDÊNTICO às outras seções

import React, { useState, useEffect } from "react";
import CNPJInput from "../../../CNPJInput";

const Identificacao = ({
  formData,
  onChange,
  errors = {},
  disabled = false,
}) => {
  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Lista de UFs brasileiras
  const ufs = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
  ];

  // Carregar municípios quando UF mudar
  useEffect(() => {
    const carregarMunicipios = async () => {
      const uf = formData?.uf;

      if (!uf) {
        setMunicipios([]);
        return;
      }

      setLoadingMunicipios(true);

      try {
        console.log(`🏙️ Carregando municípios para ${uf}...`);

        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar municípios");
        }

        const data = await response.json();

        const municipiosFormatados = data.map((municipio) => ({
          id: municipio.id,
          nome: municipio.nome,
        }));

        setMunicipios(municipiosFormatados);
        console.log(
          `✅ ${municipiosFormatados.length} municípios carregados para ${uf}`,
        );
      } catch (error) {
        console.error("❌ Erro ao carregar municípios:", error);
        setMunicipios([]);
      } finally {
        setLoadingMunicipios(false);
      }
    };

    carregarMunicipios();
  }, [formData?.uf]);

  // Handler padrão para inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (onChange) {
      onChange(e);
    }
  };

  // Handler específico para UF (limpa município)
  const handleUfChange = (e) => {
    // Primeiro atualiza a UF
    handleInputChange(e);

    // Depois limpa o município se houver
    if (formData?.municipio) {
      const municipioEvent = {
        target: {
          name: "municipio",
          value: "",
        },
      };
      setTimeout(() => {
        if (onChange) {
          onChange(municipioEvent);
        }
      }, 100);
    }
  };

  return (
    <fieldset style={styles.fieldset}>
      {/* Header da seção - IGUAL Dados Básicos */}
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📋</span>
        Identificação
      </legend>

      {/* Grid de campos - IGUAL Dados Básicos */}
      <div style={styles.formGrid}>
        {/* CNPJ - USANDO CNPJInput COM VALIDAÇÃO EM TEMPO REAL */}
        <div style={styles.formGroup}>
          <CNPJInput
            label="CNPJ"
            value={formData?.cnpj || ""}
            onChange={(e) => {
              console.log("🔧 Identificacao CNPJ change:", e.target.value);
              handleInputChange({
                target: {
                  name: "cnpj",
                  value: e.target.value,
                },
              });
            }}
            required={true}
            placeholder="00.000.000/0000-00"
            disabled={disabled}
            showValidation={true}
            style={styles.formGroup}
            inputStyle={{
              ...styles.input,
              padding: "12px", // ✅ ALINHAMENTO: mesmo padding dos outros campos
              fontSize: "14px", // ✅ ALINHAMENTO: mesmo font-size dos outros campos
              border: "2px solid #dee2e6", // ✅ ALINHAMENTO: mesma borda dos outros campos
              borderRadius: "6px", // ✅ ALINHAMENTO: mesmo border-radius dos outros campos
            }}
            onValidChange={(isValid, value) => {
              console.log("🎯 Identificacao CNPJ validation:", isValid, value);
            }}
          />
          {errors.cnpj && <div style={styles.errorMessage}>{errors.cnpj}</div>}
        </div>

        {/* UF */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            🗺️ UF <span style={styles.required}>*</span>
          </label>
          <select
            name="uf"
            value={formData?.uf || ""}
            onChange={handleUfChange}
            disabled={disabled}
            style={{
              ...styles.select,
              ...(errors.uf ? styles.selectError : {}),
            }}
          >
            <option value="">Selecione a UF</option>
            {ufs.map((estado) => (
              <option key={estado.sigla} value={estado.sigla}>
                {estado.sigla} - {estado.nome}
              </option>
            ))}
          </select>
          {errors.uf && <div style={styles.errorMessage}>{errors.uf}</div>}
        </div>

        {/* Município */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            🏙️ Município <span style={styles.required}>*</span>
          </label>
          <select
            name="municipio"
            value={formData?.municipio || ""}
            onChange={handleInputChange}
            disabled={disabled || !formData?.uf || loadingMunicipios}
            style={{
              ...styles.select,
              ...(errors.municipio ? styles.selectError : {}),
              ...(loadingMunicipios ? styles.selectLoading : {}),
            }}
          >
            <option value="">
              {loadingMunicipios
                ? "Carregando municípios..."
                : !formData?.uf
                  ? "Selecione primeiro a UF"
                  : "Selecione o município..."}
            </option>
            {municipios.map((mun) => (
              <option key={mun.id} value={mun.nome}>
                {mun.nome}
              </option>
            ))}
          </select>

          {/* Contador de municípios */}
          {municipios.length > 0 && !loadingMunicipios && (
            <div style={styles.municipioCount}>
              📊 {municipios.length} municípios disponíveis em {formData?.uf}
            </div>
          )}

          {errors.municipio && (
            <div style={styles.errorMessage}>{errors.municipio}</div>
          )}
        </div>
      </div>
    </fieldset>
  );
};

// Estilos IDÊNTICOS à seção Dados Básicos
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

  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },

  select: {
    padding: "12px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },

  selectError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },

  selectLoading: {
    backgroundColor: "#f8f9fa",
    cursor: "wait",
  },

  errorMessage: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
  },

  municipioCount: {
    fontSize: "12px",
    color: "#28a745",
    marginTop: "4px",
    fontWeight: "500",
  },
};

export default Identificacao;
