import React, { useState, useEffect } from "react";

const IdentificacaoUfMunicipio = ({
  cnpj,
  uf,
  municipio,
  onUfChange,
  onMunicipioChange,
  errors = {},
  disabled = false,
}) => {
  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [totalMunicipios, setTotalMunicipios] = useState(0);

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
      if (!uf) {
        setMunicipios([]);
        setTotalMunicipios(0);
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
        setTotalMunicipios(municipiosFormatados.length);

        console.log(
          `✅ ${municipiosFormatados.length} municípios carregados para ${uf}`,
        );
      } catch (error) {
        console.error("❌ Erro ao carregar municípios:", error);
        setMunicipios([]);
        setTotalMunicipios(0);
      } finally {
        setLoadingMunicipios(false);
      }
    };

    carregarMunicipios();
  }, [uf]);

  // Limpar município quando UF mudar
  useEffect(() => {
    if (municipio && onMunicipioChange) {
      onMunicipioChange("");
    }
  }, [uf]);

  const handleUfChange = (e) => {
    const novaUf = e.target.value;
    if (onUfChange) {
      onUfChange(novaUf);
    }
  };

  const handleMunicipioChange = (e) => {
    const novoMunicipio = e.target.value;
    if (onMunicipioChange) {
      onMunicipioChange(novoMunicipio);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header da seção igual ao original */}
      <div style={styles.sectionHeader}>
        <div style={styles.sectionIcon}>📋</div>
        <h3 style={styles.sectionTitle}>Identificação</h3>
      </div>

      {/* Grid de campos */}
      <div style={styles.fieldsGrid}>
        {/* CNPJ - mantém como estava */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            CNPJ <span style={styles.required}>*</span>
          </label>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={cnpj || ""}
              placeholder="00.000.000/0000-00"
              style={{
                ...styles.input,
                ...(errors.cnpj ? styles.inputError : {}),
              }}
              disabled={disabled}
              readOnly // Assumindo que CNPJ é readonly nesta tela
            />
            <div style={styles.inputIcon}>
              <span style={styles.iconCnpj}>🏢</span>
            </div>
          </div>
          {errors.cnpj && <div style={styles.errorMessage}>{errors.cnpj}</div>}
        </div>

        {/* UF - Melhorado */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            🗺️ UF <span style={styles.required}>*</span>
          </label>
          <select
            value={uf || ""}
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

        {/* Município - Melhorado */}
        <div style={styles.fieldGroupWide}>
          <label style={styles.label}>
            🏙️ Município <span style={styles.required}>*</span>
          </label>
          <select
            value={municipio || ""}
            onChange={handleMunicipioChange}
            disabled={disabled || !uf || loadingMunicipios}
            style={{
              ...styles.select,
              ...(errors.municipio ? styles.selectError : {}),
              ...(loadingMunicipios ? styles.selectLoading : {}),
            }}
          >
            <option value="">
              {loadingMunicipios
                ? "Carregando municípios..."
                : !uf
                  ? "Selecione primeiro a UF"
                  : "Selecione o município..."}
            </option>
            {municipios.map((mun) => (
              <option key={mun.id} value={mun.nome}>
                {mun.nome}
              </option>
            ))}
          </select>

          {/* Indicador de progresso */}
          {loadingMunicipios && (
            <div style={styles.loadingIndicator}>
              <div style={styles.spinner}></div>
              <span>Carregando...</span>
            </div>
          )}

          {/* Contador de municípios */}
          {totalMunicipios > 0 && !loadingMunicipios && (
            <div style={styles.municipioCount}>
              📊 {totalMunicipios} municípios disponíveis em {uf}
            </div>
          )}

          {errors.municipio && (
            <div style={styles.errorMessage}>{errors.municipio}</div>
          )}
        </div>
      </div>

      {/* Preview dos dados selecionados */}
      {uf && municipio && (
        <div style={styles.previewContainer}>
          <div style={styles.previewHeader}>
            <span style={styles.previewIcon}>✅</span>
            <span style={styles.previewTitle}>Localização Confirmada</span>
          </div>
          <div style={styles.previewContent}>
            <strong>
              {municipio}/{uf}
            </strong>
            <span style={styles.previewSubtext}>
              Dados padronizados conforme IBGE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "2px solid #e1e5e9",
    padding: "24px",
    marginBottom: "24px",
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
    gridTemplateColumns: "1fr 200px 1fr",
    gap: "20px",
    alignItems: "start",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  fieldGroupWide: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "span 1",
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

  inputContainer: {
    position: "relative",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    paddingRight: "40px",
    border: "2px solid #e1e5e9",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#f8f9fa",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },

  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },

  inputIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
  },

  iconCnpj: {
    fontSize: "16px",
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

  loadingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
    fontSize: "12px",
    color: "#6c757d",
  },

  spinner: {
    width: "12px",
    height: "12px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  municipioCount: {
    fontSize: "12px",
    color: "#28a745",
    marginTop: "4px",
    fontWeight: "500",
  },

  previewContainer: {
    marginTop: "20px",
    padding: "16px",
    backgroundColor: "#e8f5e8",
    border: "1px solid #28a745",
    borderRadius: "8px",
  },

  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },

  previewIcon: {
    fontSize: "16px",
  },

  previewTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2e7d32",
  },

  previewContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  previewSubtext: {
    fontSize: "12px",
    color: "#4caf50",
    fontStyle: "italic",
  },
};

// CSS para animação do spinner
if (
  typeof document !== "undefined" &&
  !document.getElementById("identificacao-animations")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "identificacao-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default IdentificacaoUfMunicipio;
