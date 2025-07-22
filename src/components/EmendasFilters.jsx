import React, { useState, useEffect } from "react";

const EmendasFilters = ({
  emendas = [],
  onFilterChange,
  initialFilters = {},
}) => {
  // Estados dos filtros
  const [filters, setFilters] = useState({
    parlamentar: "",
    numero: "",
    emenda: "",
    objetoProposta: "", // ✅ Filtro específico para objeto da proposta
    municipioUf: "", // ✅ Filtro combinado Município/UF
    tipo: "",
    gnd: "",
    validade: "",
    status: "",
    valorMin: "",
    valorMax: "",
    dataObMin: "",
    dataObMax: "",
    inicioExecucaoMin: "",
    inicioExecucaoMax: "",
    finalExecucaoMin: "",
    finalExecucaoMax: "",
    cnpj: "",
    funcional: "",
    uf: "",
    municipio: "",
    outrasComposicoes: "",
    saldo: "",
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  // ✅ FUNÇÃO: Filtrar emendas melhorada
  const filterEmendas = (emendas, filters) => {
    return emendas.filter((emenda) => {
      // Filtros básicos
      if (
        filters.parlamentar &&
        !emenda.parlamentar
          ?.toLowerCase()
          .includes(filters.parlamentar.toLowerCase())
      )
        return false;
      if (
        filters.numero &&
        !emenda.numero?.toLowerCase().includes(filters.numero.toLowerCase())
      )
        return false;
      if (
        filters.emenda &&
        !emenda.emenda?.toLowerCase().includes(filters.emenda.toLowerCase())
      )
        return false;

      // ✅ NOVO: Filtro específico para objeto da proposta
      if (
        filters.objetoProposta &&
        !emenda.objetoProposta
          ?.toLowerCase()
          .includes(filters.objetoProposta.toLowerCase())
      )
        return false;

      // ✅ MELHORADO: Filtro combinado Município/UF
      if (filters.municipioUf) {
        const termoBusca = filters.municipioUf.toLowerCase();
        const municipio = emenda.municipio?.toLowerCase() || "";
        const uf = emenda.uf?.toLowerCase() || "";
        const combinado = `${municipio} - ${uf}`.toLowerCase();

        if (
          !municipio.includes(termoBusca) &&
          !uf.includes(termoBusca) &&
          !combinado.includes(termoBusca)
        ) {
          return false;
        }
      }

      if (filters.tipo && emenda.tipo !== filters.tipo) return false;
      if (filters.gnd && emenda.gnd !== filters.gnd) return false;
      if (filters.validade && emenda.validade !== filters.validade)
        return false;
      if (filters.cnpj && !emenda.cnpj?.includes(filters.cnpj)) return false;
      if (filters.funcional && !emenda.funcional?.includes(filters.funcional))
        return false;
      if (filters.uf && emenda.uf !== filters.uf) return false;
      if (
        filters.municipio &&
        !emenda.municipio
          ?.toLowerCase()
          .includes(filters.municipio.toLowerCase())
      )
        return false;

      // Filtros de valor
      if (
        filters.valorMin &&
        (emenda.valorTotal || 0) < parseFloat(filters.valorMin)
      )
        return false;
      if (
        filters.valorMax &&
        (emenda.valorTotal || 0) > parseFloat(filters.valorMax)
      )
        return false;

      // Filtros de data
      if (
        filters.dataObMin &&
        emenda.dataOb &&
        emenda.dataOb < filters.dataObMin
      )
        return false;
      if (
        filters.dataObMax &&
        emenda.dataOb &&
        emenda.dataOb > filters.dataObMax
      )
        return false;
      if (
        filters.inicioExecucaoMin &&
        emenda.inicioExecucao &&
        emenda.inicioExecucao < filters.inicioExecucaoMin
      )
        return false;
      if (
        filters.inicioExecucaoMax &&
        emenda.inicioExecucao &&
        emenda.inicioExecucao > filters.inicioExecucaoMax
      )
        return false;
      if (
        filters.finalExecucaoMin &&
        emenda.finalExecucao &&
        emenda.finalExecucao < filters.finalExecucaoMin
      )
        return false;
      if (
        filters.finalExecucaoMax &&
        emenda.finalExecucao &&
        emenda.finalExecucao > filters.finalExecucaoMax
      )
        return false;

      return true;
    });
  };

  // ✅ EFEITO: Aplicar filtros automaticamente
  useEffect(() => {
    const filtered = filterEmendas(emendas, filters);
    setResultCount(filtered.length);
    if (onFilterChange) {
      onFilterChange(filtered);
    }
  }, [emendas, filters, onFilterChange]);

  // ✅ FUNÇÃO: Limpar filtros
  const clearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    setFilters(clearedFilters);
  };

  // ✅ FUNÇÃO: Atualizar filtro
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ✅ FUNÇÃO: Obter listas únicas para selects
  const getUniqueValues = (field) => {
    const values = emendas
      .map((emenda) => emenda[field])
      .filter((value) => value && value.trim() !== "")
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return values;
  };

  // ✅ ESTILOS
  const styles = {
    container: {
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      marginBottom: "20px",
      border: "2px solid #e1e8ed",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      paddingBottom: "15px",
      borderBottom: "2px solid #f0f2f5",
    },
    title: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      color: "#2c3e50",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    resultCount: {
      background: "linear-gradient(45deg, #667eea, #764ba2)",
      color: "white",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "0.85rem",
      fontWeight: "bold",
    },
    filtersGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "15px",
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    },
    label: {
      fontSize: "0.85rem",
      fontWeight: "600",
      color: "#2c3e50",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    input: {
      padding: "8px 12px",
      border: "2px solid #e1e8ed",
      borderRadius: "8px",
      fontSize: "0.9rem",
      transition: "all 0.2s ease",
      background: "#fafbfc",
    },
    select: {
      padding: "8px 12px",
      border: "2px solid #e1e8ed",
      borderRadius: "8px",
      fontSize: "0.9rem",
      background: "#fafbfc",
      cursor: "pointer",
    },
    buttonsContainer: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      flexWrap: "wrap",
      marginTop: "20px",
      paddingTop: "15px",
      borderTop: "1px solid #f0f2f5",
    },
    button: {
      padding: "8px 16px",
      border: "none",
      borderRadius: "8px",
      fontSize: "0.85rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    primaryButton: {
      background: "linear-gradient(45deg, #4A90E2, #667eea)",
      color: "white",
      boxShadow: "0 2px 8px rgba(74, 144, 226, 0.3)",
    },
    secondaryButton: {
      background: "linear-gradient(45deg, #6c757d, #495057)",
      color: "white",
      boxShadow: "0 2px 8px rgba(108, 117, 125, 0.3)",
    },
    advancedSection: {
      marginTop: "15px",
      paddingTop: "15px",
      borderTop: "1px solid #f0f2f5",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>🔍 Filtros de Pesquisa</h3>
        <div style={styles.resultCount}>
          {resultCount} emenda{resultCount !== 1 ? "s" : ""} encontrada
          {resultCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Filtros Básicos */}
      <div style={styles.filtersGrid}>
        <div style={styles.field}>
          <label style={styles.label}>🏛️ Parlamentar</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Digite o nome do parlamentar..."
            value={filters.parlamentar}
            onChange={(e) => updateFilter("parlamentar", e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>🔢 Número da Emenda</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Ex: E2025001"
            value={filters.numero}
            onChange={(e) => updateFilter("numero", e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>📄 Emenda</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Digite o código da emenda..."
            value={filters.emenda}
            onChange={(e) => updateFilter("emenda", e.target.value)}
          />
        </div>

        {/* ✅ NOVO: Filtro específico para objeto da proposta */}
        <div style={styles.field}>
          <label style={styles.label}>🎯 Objeto da Proposta</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Digite palavras-chave do objeto..."
            value={filters.objetoProposta}
            onChange={(e) => updateFilter("objetoProposta", e.target.value)}
          />
        </div>

        {/* ✅ MELHORADO: Filtro combinado Município/UF */}
        <div style={styles.field}>
          <label style={styles.label}>🏙️ Município/UF</label>
          <input
            type="text"
            style={styles.input}
            placeholder="São Paulo, SP, São Paulo - SP..."
            value={filters.municipioUf}
            onChange={(e) => updateFilter("municipioUf", e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>📋 Tipo de Emenda</label>
          <select
            style={styles.select}
            value={filters.tipo}
            onChange={(e) => updateFilter("tipo", e.target.value)}
          >
            <option value="">Todos os tipos</option>
            <option value="Individual">Individual</option>
            <option value="Bancada Estadual">Bancada Estadual</option>
            <option value="Bancada Regional">Bancada Regional</option>
            <option value="Comissão">Comissão</option>
            <option value="Relator">Relator</option>
            <option value="Relator Setorial">Relator Setorial</option>
            <option value="Bancada Municipal">Bancada Municipal</option>
            <option value="Coletiva">Coletiva</option>
          </select>
        </div>
      </div>

      {/* Botão Mostrar/Ocultar Filtros Avançados */}
      <div style={styles.buttonsContainer}>
        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "🔼 Ocultar" : "🔽 Mostrar"} Filtros Avançados
        </button>

        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={clearFilters}
        >
          🗑️ Limpar Filtros
        </button>
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div style={styles.advancedSection}>
          <div style={styles.filtersGrid}>
            <div style={styles.field}>
              <label style={styles.label}>💰 GND</label>
              <select
                style={styles.select}
                value={filters.gnd}
                onChange={(e) => updateFilter("gnd", e.target.value)}
              >
                <option value="">Todas as GND</option>
                <option value="1 - Pessoal e Encargos Sociais">
                  1 - Pessoal e Encargos Sociais
                </option>
                <option value="2 - Juros e Encargos da Dívida">
                  2 - Juros e Encargos da Dívida
                </option>
                <option value="3 - Outras Despesas Correntes">
                  3 - Outras Despesas Correntes
                </option>
                <option value="4 - Investimentos">4 - Investimentos</option>
                <option value="5 - Inversões Financeiras">
                  5 - Inversões Financeiras
                </option>
                <option value="6 - Amortização da Dívida">
                  6 - Amortização da Dívida
                </option>
                <option value="7 - Reserva de Contingência">
                  7 - Reserva de Contingência
                </option>
                <option value="8 - Reserva do RPPS">8 - Reserva do RPPS</option>
                <option value="9 - Reserva Orçamentária">
                  9 - Reserva Orçamentária
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>📅 Data de Validade</label>
              <input
                type="date"
                style={styles.input}
                value={filters.validade}
                onChange={(e) => updateFilter("validade", e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>💼 CNPJ</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Digite o CNPJ..."
                value={filters.cnpj}
                onChange={(e) => updateFilter("cnpj", e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>🏢 Programação Funcional</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Ex: 12.361.0001"
                value={filters.funcional}
                onChange={(e) => updateFilter("funcional", e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>📍 UF</label>
              <select
                style={styles.select}
                value={filters.uf}
                onChange={(e) => updateFilter("uf", e.target.value)}
              >
                <option value="">Todos os estados</option>
                {getUniqueValues("uf").map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>🏙️ Município</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Digite o município..."
                value={filters.municipio}
                onChange={(e) => updateFilter("municipio", e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>💰 Valor Mínimo</label>
              <input
                type="number"
                style={styles.input}
                placeholder="0"
                value={filters.valorMin}
                onChange={(e) => updateFilter("valorMin", e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>💰 Valor Máximo</label>
              <input
                type="number"
                style={styles.input}
                placeholder="999999999"
                value={filters.valorMax}
                onChange={(e) => updateFilter("valorMax", e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>📅 Data OB - Início</label>
              <input
                type="date"
                style={styles.input}
                value={filters.dataObMin}
                onChange={(e) => updateFilter("dataObMin", e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>📅 Data OB - Fim</label>
              <input
                type="date"
                style={styles.input}
                value={filters.dataObMax}
                onChange={(e) => updateFilter("dataObMax", e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>🚀 Início Execução - De</label>
              <input
                type="date"
                style={styles.input}
                value={filters.inicioExecucaoMin}
                onChange={(e) =>
                  updateFilter("inicioExecucaoMin", e.target.value)
                }
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>🚀 Início Execução - Até</label>
              <input
                type="date"
                style={styles.input}
                value={filters.inicioExecucaoMax}
                onChange={(e) =>
                  updateFilter("inicioExecucaoMax", e.target.value)
                }
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>🏁 Final Execução - De</label>
              <input
                type="date"
                style={styles.input}
                value={filters.finalExecucaoMin}
                onChange={(e) =>
                  updateFilter("finalExecucaoMin", e.target.value)
                }
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>🏁 Final Execução - Até</label>
              <input
                type="date"
                style={styles.input}
                value={filters.finalExecucaoMax}
                onChange={(e) =>
                  updateFilter("finalExecucaoMax", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmendasFilters;
