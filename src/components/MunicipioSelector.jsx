import React, { useState, useEffect } from "react";
import { carregarMunicipios as carregarMunicipiosCache } from "../utils/municipiosCache";

const MunicipioSelector = ({
  uf,
  municipioSelecionado,
  onMunicipioChange,
  disabled = false,
  placeholder = "Selecione o município...",
}) => {
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🎯 Carregar municípios da UF selecionada
  useEffect(() => {
    const carregarMunicipios = async () => {
      if (!uf) {
        setMunicipios([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`🏙️ Carregando municípios para UF: ${uf}`);

        // ✅ Usar sistema de cache inteligente
        const municipiosCarregados = await carregarMunicipiosCache(uf);

        // 📊 Formatar dados mantendo estrutura original
        const municipiosFormatados = municipiosCarregados.map((municipio) => ({
          id: municipio.id,
          nome: municipio.nome,
          codigo: municipio.id,
        }));

        console.log(
          `✅ ${municipiosFormatados.length} municípios carregados para ${uf}`,
        );
        setMunicipios(municipiosFormatados);
      } catch (err) {
        console.error("❌ Erro ao carregar municípios:", err);
        setError("Erro ao carregar municípios. Tente novamente.");
        setMunicipios([]);
      } finally {
        setLoading(false);
      }
    };

    carregarMunicipios();
  }, [uf]);

  // 🔄 Limpar seleção quando UF mudar
  useEffect(() => {
    if (municipioSelecionado && onMunicipioChange) {
      onMunicipioChange("");
    }
  }, [uf]);

  const handleMunicipioChange = (e) => {
    const municipioNome = e.target.value;
    console.log(`🏙️ Município selecionado: ${municipioNome}`);

    if (onMunicipioChange) {
      onMunicipioChange(municipioNome);
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>🏙️ Município *</label>

      <select
        value={municipioSelecionado || ""}
        onChange={handleMunicipioChange}
        disabled={disabled || loading || !uf}
        style={{
          ...styles.select,
          ...(loading ? styles.selectLoading : {}),
          ...(error ? styles.selectError : {}),
          ...(disabled ? styles.selectDisabled : {}),
        }}
      >
        <option value="">
          {loading
            ? "Carregando municípios..."
            : !uf
              ? "Selecione primeiro a UF"
              : error
                ? "Erro ao carregar municípios"
                : placeholder}
        </option>

        {municipios.map((municipio) => (
          <option key={municipio.id} value={municipio.nome}>
            {municipio.nome}
          </option>
        ))}
      </select>

      {error && <div style={styles.errorMessage}>⚠️ {error}</div>}

      {municipios.length > 0 && (
        <div style={styles.info}>
          📊 {municipios.length} municípios disponíveis em {uf}
        </div>
      )}
    </div>
  );
};

// 🎯 Componente para UF + Município integrado
const UFMunicipioSelector = ({
  ufSelecionada,
  municipioSelecionado,
  onUfChange,
  onMunicipioChange,
  disabled = false,
}) => {
  const ufs = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return (
    <div style={styles.doubleContainer}>
      {/* Seletor de UF */}
      <div style={styles.ufContainer}>
        <label style={styles.label}>🗺️ UF *</label>
        <select
          value={ufSelecionada || ""}
          onChange={(e) => onUfChange && onUfChange(e.target.value)}
          disabled={disabled}
          style={{
            ...styles.select,
            ...(disabled ? styles.selectDisabled : {}),
          }}
        >
          <option value="">Selecione a UF</option>
          {ufs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>

      {/* Seletor de Município */}
      <div style={styles.municipioContainer}>
        <MunicipioSelector
          uf={ufSelecionada}
          municipioSelecionado={municipioSelecionado}
          onMunicipioChange={onMunicipioChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

// 🎯 Exemplo de uso no sistema
const ExemploUso = () => {
  const [uf, setUf] = useState("");
  const [municipio, setMunicipio] = useState("");

  const handleSalvar = () => {
    if (!uf || !municipio) {
      alert("Selecione UF e Município!");
      return;
    }

    console.log("✅ Dados padronizados:", {
      uf,
      municipio,
      chaveUnica: `${municipio}/${uf}`,
    });

    // 🎯 Agora TODOS os cadastros terão exatamente:
    // municipio: "Barão de Grajaú"
    // uf: "MA"
    // Sem variações de grafia!
  };

  return (
    <div style={styles.exemploContainer}>
      <h3 style={styles.exemploTitle}>
        🎯 Cadastro Padronizado de Localização
      </h3>

      <UFMunicipioSelector
        ufSelecionada={uf}
        municipioSelecionado={municipio}
        onUfChange={setUf}
        onMunicipioChange={setMunicipio}
      />

      <button
        onClick={handleSalvar}
        style={styles.salvarButton}
        disabled={!uf || !municipio}
      >
        💾 Salvar Localização
      </button>

      {uf && municipio && (
        <div style={styles.preview}>
          <h4>📋 Preview dos dados:</h4>
          <p>
            <strong>UF:</strong> {uf}
          </p>
          <p>
            <strong>Município:</strong> {municipio}
          </p>
          <p>
            <strong>Chave única:</strong> {municipio}/{uf}
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
  },

  doubleContainer: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: "16px",
    alignItems: "start",
  },

  ufContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  municipioContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: "4px",
  },

  select: {
    padding: "12px",
    border: "2px solid #e1e5e9",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },

  selectLoading: {
    backgroundColor: "#f8f9fa",
    cursor: "wait",
  },

  selectError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },

  selectDisabled: {
    backgroundColor: "#f8f9fa",
    cursor: "not-allowed",
    opacity: 0.6,
  },

  errorMessage: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
  },

  info: {
    color: "#6c757d",
    fontSize: "12px",
    marginTop: "4px",
  },

  exemploContainer: {
    padding: "24px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    marginTop: "20px",
  },

  exemploTitle: {
    color: "#1E293B",
    marginBottom: "20px",
    fontSize: "18px",
  },

  salvarButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "16px",
    transition: "all 0.2s ease",
  },

  preview: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "8px",
    marginTop: "16px",
    border: "1px solid #e1e5e9",
  },
};

// Exportar ambos os componentes
export { MunicipioSelector };
export default UFMunicipioSelector;