// src/components/emenda/EmendaForm/sections/Identificacao.jsx
// ✅ CORREÇÃO: Usar CNPJInput profissional como "Dados Básicos"

import React, { useState, useEffect } from "react";
import CNPJInput from "../../../CNPJInput"; // ✅ COMPONENTE PROFISSIONAL

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

  // ✅ HANDLER PROFISSIONAL para CNPJInput (igual Dados Básicos)
  const handleCnpjChange = (cnpjValue) => {
    // CNPJInput retorna o valor, não evento
    const syntheticEvent = {
      target: {
        name: "cnpj",
        value: cnpjValue,
      },
    };

    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  // Handler específico para UF (limpa município)
  const handleUfChange = (e) => {
    // Primeiro atualiza a UF
    onChange(e); // ✅ CORREÇÃO: usar onChange ao invés de handleInputChange

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
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📋</span>
        Identificação
      </legend>

      {/* Grid de campos - IGUAL outras seções */}
      <div style={styles.fieldsGrid}>
        {/* CNPJ - Input simples para evitar erros */}
        <div style={styles.formGroup}>
          <CNPJInput
            label="CNPJ"
            value={formData?.cnpj || ""}
            onChange={(e) => {
              onChange({
                target: {
                  name: "cnpj",
                  value: e.target.value,
                },
              });
            }}
            required={true}
            placeholder="00.000.000/0000-00"
            showValidation={true}
            disabled={disabled}
            style={styles.formGroup}
            inputStyle={{
              ...styles.input,
              padding: "12px",
              fontSize: "14px",
              border: "2px solid #dee2e6",
              borderRadius: "6px",
            }}
          />
          {errors.cnpj && <small style={styles.errorText}>{errors.cnpj}</small>}
        </div>

        {/* UF */}
        <div style={styles.fieldGroup}>
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
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            🏙️ Município <span style={styles.required}>*</span>
          </label>
          <select
            name="municipio"
            value={formData?.municipio || ""}
            onChange={onChange} // ✅ CORREÇÃO: usar onChange ao invés de handleInputChange
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

// Estilos IDÊNTICOS às outras seções
const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "2px solid #e1e5e9",
    padding: "24px",
    marginBottom: "20px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e1e5e9",
  },

  sectionIcon: {
    fontSize: "24px",
    padding: "8px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
  },

  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    alignItems: "start",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "4px",
  },

  required: {
    color: "#dc3545",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e1e5e9",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },

  select: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e1e5e9",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  selectError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },

  selectLoading: {
    backgroundColor: "#f8f9fa",
    cursor: "wait",
  },

  errorMessage: {
    fontSize: "12px",
    color: "#dc3545",
    marginTop: "4px",
  },

  municipioCount: {
    fontSize: "12px",
    color: "#28a745",
    marginTop: "4px",
    fontWeight: "500",
  },
};

export default Identificacao;
