// src/components/emenda/EmendaForm/sections/Identificacao.jsx
// ✅ CORREÇÃO COMPLETA: Layout e lógica idênticos ao DadosBasicos

import React, { useState, useEffect, useContext } from "react";
import CNPJInput from "../../../CNPJInput";
import { UserContext } from "../../../../context/UserContext";

const Identificacao = ({
  formData = {},
  onChange,
  errors = {},
  disabled = false,
}) => {
  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const { user } = useContext(UserContext);
  const isOperador = user?.tipo === "operador";

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

  // Handler específico para UF (limpa município)
  const handleUfChange = (e) => {
    // Primeiro atualiza a UF
    onChange(e);

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

      <div style={styles.formGrid}>
        {/* CNPJ - IDÊNTICO ao Beneficiário de DadosBasicos */}
        <div style={styles.formGroup}>
          <CNPJInput
            label="CNPJ"
            value={formData.cnpj || ""}
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
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: "#dee2e6",
              borderRadius: "6px",
            }}
          />
          {errors.cnpj && <small style={styles.errorText}>{errors.cnpj}</small>}
        </div>

        {/* UF */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            UF <span style={styles.required}>*</span>
          </label>
          <select
            name="uf"
            value={formData.uf || ""}
            onChange={handleUfChange}
            disabled={disabled || isOperador}
            style={{
              ...styles.input,
              ...(errors.uf && styles.inputError),
            }}
            required
          >
            <option value="">Selecione a UF</option>
            {ufs.map((estado) => (
              <option key={estado.sigla} value={estado.sigla}>
                {estado.sigla} - {estado.nome}
              </option>
            ))}
          </select>
          {errors.uf && <small style={styles.errorText}>{errors.uf}</small>}
        </div>

        {/* Município */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Município <span style={styles.required}>*</span>
          </label>
          <select
            name="municipio"
            value={formData.municipio || ""}
            onChange={onChange}
            disabled={
              disabled || !formData?.uf || loadingMunicipios || isOperador
            }
            style={{
              ...styles.input,
              ...(errors.municipio && styles.inputError),
              ...(loadingMunicipios && styles.inputLoading),
            }}
            required
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
            <small style={styles.errorText}>{errors.municipio}</small>
          )}
        </div>

        {/* Campo Número (adicionado conforme patch) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Número da Emenda <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="numero"
            value={formData.numero || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(errors.numero ? styles.inputError : {}),
            }}
            required
          />
          {errors.numero && (
            <small style={styles.errorText}>{errors.numero}</small>
          )}
        </div>

        {/* Campo Autor (adicionado conforme patch) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Autor da Emenda <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="autor"
            value={formData.autor || ""}
            onChange={onChange}
            style={{
              ...styles.input,
              ...(errors.autor ? styles.inputError : {}),
            }}
            required
          />
          {errors.autor && (
            <small style={styles.errorText}>{errors.autor}</small>
          )}
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS IDÊNTICOS AO DadosBasicos
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
  inputLoading: {
    backgroundColor: "#f8f9fa",
    cursor: "wait",
  },
  errorText: {
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