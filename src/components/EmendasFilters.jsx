import React, { useState, useEffect } from "react";

const EmendasFilters = ({ emendas = [], onFilterChange, totalEmendas = 0 }) => {
  // ✅ FILTROS BÁSICOS APENAS (4 campos como Despesas)
  const [filtros, setFiltros] = useState({
    parlamentar: "",
    numeroEmenda: "",
    municipioUf: "",
    tipo: "",
  });

  const [emendasFiltradas, setEmendasFiltradas] = useState([]);

  // ✅ FUNÇÃO FILTRAR SIMPLIFICADA
  const filtrarEmendas = (emendas, filtros) => {
    return emendas.filter((emenda) => {
      // Filtro Parlamentar
      if (
        filtros.parlamentar &&
        !emenda.autor?.toLowerCase().includes(filtros.parlamentar.toLowerCase())
      ) {
        return false;
      }

      // Filtro Número da Emenda
      if (
        filtros.numeroEmenda &&
        !emenda.numero
          ?.toLowerCase()
          .includes(filtros.numeroEmenda.toLowerCase())
      ) {
        return false;
      }

      // Filtro Município/UF combinado
      if (filtros.municipioUf) {
        const termo = filtros.municipioUf.toLowerCase();
        const municipio = emenda.municipio?.toLowerCase() || "";
        const uf = emenda.uf?.toLowerCase() || "";
        const combinado = `${municipio}, ${uf}`.toLowerCase();

        if (
          !municipio.includes(termo) &&
          !uf.includes(termo) &&
          !combinado.includes(termo)
        ) {
          return false;
        }
      }

      // Filtro Tipo
      if (filtros.tipo && emenda.tipo !== filtros.tipo) {
        return false;
      }

      return true;
    });
  };

  // ✅ APLICAR FILTROS AUTOMATICAMENTE
  useEffect(() => {
    const resultado = filtrarEmendas(emendas, filtros);
    setEmendasFiltradas(resultado);
    if (onFilterChange) {
      onFilterChange(resultado);
    }
  }, [emendas, filtros, onFilterChange]);

  // ✅ ATUALIZAR FILTRO
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ✅ LIMPAR FILTROS
  const limparFiltros = () => {
    const filtrosLimpos = {
      parlamentar: "",
      numeroEmenda: "",
      municipioUf: "",
      tipo: "",
    };
    setFiltros(filtrosLimpos);
  };

  // ✅ CONTAR FILTROS ATIVOS
  const contarFiltrosAtivos = () => {
    return Object.values(filtros).filter((valor) => valor.trim() !== "").length;
  };

  return (
    <div style={styles.container}>
      {/* ✅ HEADER IGUAL DESPESAS */}
      <div style={styles.header}>
        <h3 style={styles.title}>🔍 Filtros de Pesquisa</h3>
        <div style={styles.resultsBadge}>
          {totalEmendas} emendas encontradas
        </div>
      </div>

      {/* ✅ FILTROS BÁSICOS (4 CAMPOS) */}
      <div style={styles.filtersGrid}>
        {/* Parlamentar */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>👤 Parlamentar</label>
          <input
            type="text"
            placeholder="Digite o nome do parlamentar..."
            value={filtros.parlamentar}
            onChange={(e) => handleFiltroChange("parlamentar", e.target.value)}
            style={styles.filterInput}
          />
        </div>

        {/* Número da Emenda */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>🔢 Número da Emenda</label>
          <input
            type="text"
            placeholder="Ex: E2025001"
            value={filtros.numeroEmenda}
            onChange={(e) => handleFiltroChange("numeroEmenda", e.target.value)}
            style={styles.filterInput}
          />
        </div>

        {/* Município/UF */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>🏙️ Município/UF</label>
          <input
            type="text"
            placeholder="São Paulo, SP"
            value={filtros.municipioUf}
            onChange={(e) => handleFiltroChange("municipioUf", e.target.value)}
            style={styles.filterInput}
          />
        </div>

        {/* Tipo */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>📋 Tipo de Emenda</label>
          <select
            value={filtros.tipo}
            onChange={(e) => handleFiltroChange("tipo", e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">Todos os tipos</option>
            <option value="Individual">Individual</option>
            <option value="Bancada Estadual">Bancada Estadual</option>
            <option value="Bancada Regional">Bancada Regional</option>
            <option value="Comissão">Comissão</option>
            <option value="Relator">Relator</option>
            <option value="Bancada Municipal">Bancada Municipal</option>
            <option value="Coletiva">Coletiva</option>
          </select>
        </div>
      </div>

      {/* ✅ BOTÕES DE AÇÃO */}
      <div style={styles.filterActions}>
        <button
          onClick={() => {
            /* Filtros são aplicados automaticamente */
          }}
          style={styles.buttonFilter}
          disabled={contarFiltrosAtivos() === 0}
        >
          🔍 {contarFiltrosAtivos()} Filtro
          {contarFiltrosAtivos() !== 1 ? "s" : ""} Ativo
          {contarFiltrosAtivos() !== 1 ? "s" : ""}
        </button>

        <button
          onClick={limparFiltros}
          style={styles.buttonClear}
          disabled={contarFiltrosAtivos() === 0}
        >
          🗑️ Limpar Filtros
        </button>
      </div>
    </div>
  );
};

// ✅ ESTILOS PADRONIZADOS COM DESPESAS
const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2c3e50",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  resultsBadge: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
  },

  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "6px",
  },

  filterInput: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    transition: "border-color 0.2s",
    backgroundColor: "#fafbfc",
  },

  filterSelect: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },

  filterActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },

  buttonFilter: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
  },

  buttonClear: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
  },
};

export default EmendasFilters;
