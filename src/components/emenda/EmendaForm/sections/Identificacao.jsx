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
  const isAdmin = user?.tipo === "admin";
  const isOperador = user?.tipo === "operador";
  const isGestor = user?.tipo === "gestor";

  // ✅ BLOQUEIO DE LOCALIZAÇÃO:
  // - Admin: NUNCA bloqueado
  // - Operador: SEMPRE bloqueado
  // - Gestor: Bloqueado apenas se já tiver UF/Município definidos
  const isBloqueadoLocalizacao = isAdmin 
    ? false // Admin NUNCA bloqueado
    : isOperador 
    ? true // Operador SEMPRE bloqueado
    : (isGestor && formData?.municipio && formData?.uf); // Gestor bloqueado se já tiver dados

  console.log('🔐 Identificacao - Bloqueio UF/Município:', {
    isAdmin,
    isOperador,
    isGestor,
    hasMunicipio: !!formData?.municipio,
    hasUF: !!formData?.uf,
    isBloqueadoLocalizacao,
    disabled // prop disabled do componente
  });


  // ✅ DEBUG: Verificar props recebidas e bloqueio
  useEffect(() => {
    console.log('📋 Identificacao - Estado de bloqueio:', {
      hasOnChange: typeof onChange === 'function',
      hasFormData: !!formData,
      userTipo: user?.tipo,
      isAdmin,
      isOperador,
      isGestor,
      hasMunicipio: !!formData?.municipio,
      hasUF: !!formData?.uf,
      isBloqueado: isBloqueadoLocalizacao
    });
  }, [onChange, formData, user?.tipo, isBloqueadoLocalizacao, isAdmin, isOperador, isGestor]);

  // ✅ OBSERVAÇÃO: O pré-preenchimento de UF/Município para GESTOR/OPERADOR
  // agora é feito diretamente no hook useEmendaFormData.js
  // Este componente apenas EXIBE os campos (já bloqueados para edição)

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
    const { name, value } = e.target;

    console.log('📝 Identificacao.handleChange:', { name, value });

    // Chamar onChange do pai
    if (onChange && typeof onChange === 'function') {
      onChange(e);
    }

    // Limpar erro se campo foi preenchido
    if (onClearError && fieldErrors[name]) {
      onClearError(name);
    }
  };

  // Handler específico para UF (limpa município)
  const handleUfChange = (e) => {
    const ufSelecionada = e.target.value;
    console.log('🗺️ UF selecionada:', ufSelecionada);

    // PRIMEIRO: Atualizar UF no estado pai
    if (onChange && typeof onChange === 'function') {
      onChange(e);
    }

    // Limpar erro do campo UF se existir
    if (onClearError && fieldErrors.uf) {
      onClearError('uf');
    }

    // DEPOIS: Limpar município quando UF mudar
    if (formData?.municipio) {
      setTimeout(() => {
        const municipioEvent = {
          target: {
            name: "municipio",
            value: "",
          },
        };
        if (onChange && typeof onChange === 'function') {
          onChange(municipioEvent);
        }
      }, 50);
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
              ...(fieldErrors.uf && styles.inputError),
              ...(isBloqueadoLocalizacao && styles.inputDisabled),
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
            disabled={disabled || !formData?.uf || loadingMunicipios || isBloqueadoLocalizacao}
            style={{
              ...styles.input,
              ...(fieldErrors.municipio && styles.inputError),
              ...(loadingMunicipios && styles.inputLoading),
              ...(isBloqueadoLocalizacao && styles.inputDisabled),
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
      {isBloqueadoLocalizacao && (
            <small style={{ ...styles.helpText, color: "var(--warning)" }}>
              🔒 {isOperador
                ? "Município e UF definidos automaticamente pelo seu perfil (não editável)"
                : "Município e UF já definidos (não podem ser alterados)"}
            </small>
          )}
    </fieldset>
  );
};

// ✅ ESTILOS MANTIDOS
const styles = {
  fieldset: {
    border: "2px solid #2563EB",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid #2563EB",
    color: "#2563EB",
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
  inputDisabled: {
    backgroundColor: "#e9ecef",
    cursor: "not-allowed",
    opacity: 0.6,
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
  helpText: {
    fontSize: "12px",
    marginTop: "10px",
    display: "block",
  },
};

export default Identificacao;