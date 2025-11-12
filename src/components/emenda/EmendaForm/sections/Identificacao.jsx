// src/components/emenda/EmendaForm/sections/Identificacao.jsx
// ✅ CORREÇÃO CRÍTICA: Props alinhadas com EmendaForm

import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../../context/UserContext";
import { carregarMunicipios as carregarMunicipiosCache } from "../../../../utils/municipiosCache";

const Identificacao = ({
  formData = {},
  onChange,
  fieldErrors = {}, // ✅ CORREÇÃO: errors → fieldErrors
  onClearError, // ✅ ADICIONADO: prop faltante
  disabled = false,
}) => {
  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const { user } = useContext(UserContext);
  const isOperador = user?.tipo === "operador";
  const isGestor = user?.tipo === "gestor";
  const isBloqueadoLocalizacao = isOperador || isGestor; // ✅ Bloquear para operador E gestor

  // ✅ PRÉ-PREENCHER MUNICÍPIO/UF DO OPERADOR/GESTOR AO CRIAR NOVA EMENDA
  useEffect(() => {
    // ✅ CORREÇÃO: Só preencher se for NOVA emenda (não tem UF nem município preenchidos ainda)
    const isNovaEmenda = !formData?.uf && !formData?.municipio;
    
    if (isBloqueadoLocalizacao && user?.municipio && user?.uf && isNovaEmenda) {
      console.log(`✅ Pré-preenchendo localização do ${user?.tipo}:`, {
        municipio: user.municipio,
        uf: user.uf,
      });

      // Preencher UF
      onChange({
        target: {
          name: "uf",
          value: user.uf,
        },
      });

      // Preencher município (com delay para garantir que municípios foram carregados)
      setTimeout(() => {
        onChange({
          target: {
            name: "municipio",
            value: user.municipio,
          },
        });
      }, 500);
    }
  }, [isBloqueadoLocalizacao, user?.municipio, user?.uf, formData?.uf, formData?.municipio, onChange]);

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
        // ✅ Usar sistema de cache inteligente
        const municipiosCarregados = await carregarMunicipiosCache(uf);
        setMunicipios(municipiosCarregados);

        console.log(
          `✅ ${municipiosCarregados.length} municípios carregados para ${uf}`,
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

  // ✅ HANDLER COM LIMPEZA DE ERRO
  const handleChange = (e) => {
    const { name } = e.target;
    onChange(e);

    // Limpar erro se campo foi preenchido
    if (onClearError && fieldErrors[name]) {
      onClearError(name);
    }
  };

  // Handler específico para UF (limpa município)
  const handleUfChange = (e) => {
    handleChange(e);

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
        <span style={styles.legendIcon}>📍</span>
        Localização
      </legend>

      <div style={styles.formGrid}>
        {/* UF */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            UF <span style={styles.required}>*</span>
          </label>
          <select
            name="uf"
            value={formData.uf || ""}
            onChange={handleUfChange}
            disabled={disabled || isBloqueadoLocalizacao}
            style={{
              ...styles.input,
              ...(fieldErrors.uf && styles.inputError), // ✅ USANDO fieldErrors
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
          {fieldErrors.uf && (
            <small style={styles.errorText}>{fieldErrors.uf}</small>
          )}
        </div>

        {/* Município */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Município <span style={styles.required}>*</span>
          </label>
          <select
            name="municipio"
            value={formData.municipio || ""}
            onChange={handleChange}
            disabled={
              disabled || !formData?.uf || loadingMunicipios || isBloqueadoLocalizacao
            }
            style={{
              ...styles.input,
              ...(fieldErrors.municipio && styles.inputError), // ✅ USANDO fieldErrors
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

          {fieldErrors.municipio && (
            <small style={styles.errorText}>{fieldErrors.municipio}</small>
          )}
        </div>
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS MANTIDOS
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
