// DespesasFilters.jsx - PADRONIZADO COM EMENDASFILTERS v1.0
// ✅ Mesmo padrão visual e estrutural dos filtros de emendas

import React, { useState, useEffect } from "react";

// ✅ CORES PADRONIZADAS (mesmo padrão do Emendas)
const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const ERROR = "#E74C3C";
const SUCCESS = "#27AE60";
const WARNING = "#F39C12";
const WHITE = "#fff";

export default function DespesasFilters({
  despesas,
  emendas,
  onFilter,
  onClear,
  filtroInicial = null,
}) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    emendaId: "",
    parlamentar: "",
    numeroEmpenho: "",
    naturezaDespesa: "",
    fornecedor: "",
    valorMin: "",
    valorMax: "",
    dataDespesaInicio: "",
    dataDespesaFim: "",
    dataNfInicio: "",
    dataNfFim: "",
    numeroNf: "",
    numeroDespesa: "",
    descricao: "",
    periodo: "",
    busca: "",
  });

  // ✅ Listas únicas para selects dinâmicos
  const [fornecedoresUnicos, setFornecedoresUnicos] = useState([]);
  const [descricoesUnicas, setDescricoesUnicas] = useState([]);
  const [parlamentaresUnicos, setParlamentaresUnicos] = useState([]);
  const [naturezasUnicas, setNaturezasUnicas] = useState([]);

  // ✅ Aplicar filtro inicial se existir
  useEffect(() => {
    if (filtroInicial?.emendaId) {
      setFiltros((prev) => ({
        ...prev,
        emendaId: filtroInicial.emendaId,
      }));
      setMostrarFiltros(false); // Não mostrar filtros se há filtro automático
    }
  }, [filtroInicial]);

  // ✅ Extrair valores únicos quando despesas mudam
  useEffect(() => {
    if (despesas && despesas.length > 0) {
      setFornecedoresUnicos(
        [
          ...new Set(
            despesas.map((d) => d.notaFiscalFornecedor).filter(Boolean),
          ),
        ].sort(),
      );

      setDescricoesUnicas(
        [...new Set(despesas.map((d) => d.descricao).filter(Boolean))].sort(),
      );

      setNaturezasUnicas(
        [
          ...new Set(despesas.map((d) => d.naturezaDespesa).filter(Boolean)),
        ].sort(),
      );
    }

    if (emendas && emendas.length > 0) {
      setParlamentaresUnicos(
        [...new Set(emendas.map((e) => e.parlamentar).filter(Boolean))].sort(),
      );
    }
  }, [despesas, emendas]);

  // ✅ Aplicar filtros sempre que mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, despesas]);

  const aplicarFiltros = () => {
    if (!despesas) return;

    let resultado = [...despesas];

    // Filtro de busca geral
    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (despesa) =>
          despesa.descricao?.toLowerCase().includes(termoBusca) ||
          despesa.notaFiscalFornecedor?.toLowerCase().includes(termoBusca) ||
          despesa.notaFiscalNumero?.toLowerCase().includes(termoBusca) ||
          despesa.numero?.toLowerCase().includes(termoBusca) ||
          despesa.numeroEmpenho?.toLowerCase().includes(termoBusca) ||
          getEmendaInfo(despesa.emendaId).toLowerCase().includes(termoBusca),
      );
    }

    // Filtro por Número da Despesa
    if (filtros.numeroDespesa) {
      resultado = resultado.filter((despesa) =>
        despesa.numero
          ?.toLowerCase()
          .includes(filtros.numeroDespesa.toLowerCase()),
      );
    }

    // Filtro por Emenda
    if (filtros.emendaId) {
      resultado = resultado.filter(
        (despesa) => despesa.emendaId === filtros.emendaId,
      );
    }

    // Filtro por Parlamentar
    if (filtros.parlamentar) {
      const emendasDoParlamentar =
        emendas
          ?.filter((e) => e.parlamentar === filtros.parlamentar)
          .map((e) => e.id) || [];
      resultado = resultado.filter((despesa) =>
        emendasDoParlamentar.includes(despesa.emendaId),
      );
    }

    // Filtro por Número do Empenho
    if (filtros.numeroEmpenho) {
      resultado = resultado.filter((despesa) =>
        despesa.numeroEmpenho
          ?.toLowerCase()
          .includes(filtros.numeroEmpenho.toLowerCase()),
      );
    }

    // Filtro por Natureza da Despesa
    if (filtros.naturezaDespesa) {
      resultado = resultado.filter(
        (despesa) => despesa.naturezaDespesa === filtros.naturezaDespesa,
      );
    }

    // Filtro por Fornecedor
    if (filtros.fornecedor) {
      resultado = resultado.filter((despesa) =>
        despesa.notaFiscalFornecedor
          ?.toLowerCase()
          .includes(filtros.fornecedor.toLowerCase()),
      );
    }

    // Filtro por Descrição
    if (filtros.descricao) {
      resultado = resultado.filter((despesa) =>
        despesa.descricao
          ?.toLowerCase()
          .includes(filtros.descricao.toLowerCase()),
      );
    }

    // Filtro por Número NF
    if (filtros.numeroNf) {
      resultado = resultado.filter((despesa) =>
        despesa.notaFiscalNumero
          ?.toLowerCase()
          .includes(filtros.numeroNf.toLowerCase()),
      );
    }

    // Filtro por Valor Mínimo
    if (filtros.valorMin) {
      const valorMin = parseFloat(
        filtros.valorMin.replace(/[^\d,]/g, "").replace(",", "."),
      );
      if (!isNaN(valorMin)) {
        resultado = resultado.filter((despesa) => despesa.valor >= valorMin);
      }
    }

    // Filtro por Valor Máximo
    if (filtros.valorMax) {
      const valorMax = parseFloat(
        filtros.valorMax.replace(/[^\d,]/g, "").replace(",", "."),
      );
      if (!isNaN(valorMax)) {
        resultado = resultado.filter((despesa) => despesa.valor <= valorMax);
      }
    }

    // Filtros de data
    if (filtros.dataDespesaInicio) {
      resultado = resultado.filter((despesa) => {
        const dataDespesa = formatarDataParaComparacao(despesa.data);
        return dataDespesa >= filtros.dataDespesaInicio;
      });
    }

    if (filtros.dataDespesaFim) {
      resultado = resultado.filter((despesa) => {
        const dataDespesa = formatarDataParaComparacao(despesa.data);
        return dataDespesa <= filtros.dataDespesaFim;
      });
    }

    if (filtros.dataNfInicio) {
      resultado = resultado.filter((despesa) => {
        const dataNf = formatarDataParaComparacao(despesa.notaFiscalData);
        return dataNf >= filtros.dataNfInicio;
      });
    }

    if (filtros.dataNfFim) {
      resultado = resultado.filter((despesa) => {
        const dataNf = formatarDataParaComparacao(despesa.notaFiscalData);
        return dataNf <= filtros.dataNfFim;
      });
    }

    // Filtro por Período Predefinido
    if (filtros.periodo) {
      const hoje = new Date();
      let dataInicio;

      switch (filtros.periodo) {
        case "ultimos_7_dias":
          dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "ultimos_30_dias":
          dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "ultimos_90_dias":
          dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "este_mes":
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          break;
        case "mes_anterior":
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
          const fimMesAnterior = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            0,
          );
          resultado = resultado.filter((despesa) => {
            const dataDespesa = new Date(
              formatarDataParaComparacao(despesa.data),
            );
            return dataDespesa >= dataInicio && dataDespesa <= fimMesAnterior;
          });
          onFilter(resultado);
          return;
        default:
          break;
      }

      if (dataInicio) {
        resultado = resultado.filter((despesa) => {
          const dataDespesa = new Date(
            formatarDataParaComparacao(despesa.data),
          );
          return dataDespesa >= dataInicio;
        });
      }
    }

    // Chamar callback com resultados filtrados
    onFilter(resultado);
  };

  // ✅ Helper para buscar informações da emenda
  const getEmendaInfo = (emendaId) => {
    if (!emendas) return "Carregando...";
    const emenda = emendas.find((e) => e.id === emendaId);
    return emenda
      ? `${emenda.numero} - ${emenda.parlamentar}`
      : "Emenda não encontrada";
  };

  // ✅ Helper para formatar data para comparação
  const formatarDataParaComparacao = (data) => {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (data.seconds) {
      const d = new Date(data.seconds * 1000);
      return d.toISOString().split("T")[0];
    }
    if (data instanceof Date) {
      return data.toISOString().split("T")[0];
    }
    return "";
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      emendaId: "",
      parlamentar: "",
      numeroEmpenho: "",
      naturezaDespesa: "",
      fornecedor: "",
      valorMin: "",
      valorMax: "",
      dataDespesaInicio: "",
      dataDespesaFim: "",
      dataNfInicio: "",
      dataNfFim: "",
      numeroNf: "",
      numeroDespesa: "",
      descricao: "",
      periodo: "",
      busca: "",
    };
    setFiltros(filtrosLimpos);
    onClear();
  };

  const contarFiltrosAtivos = () => {
    return Object.values(filtros).filter(
      (valor) => valor !== "" && valor !== false,
    ).length;
  };

  // ✅ Handlers para períodos predefinidos
  const aplicarPeriodo = (tipoPeriodo) => {
    setFiltros((prev) => ({
      ...prev,
      periodo: tipoPeriodo,
      dataDespesaInicio: "",
      dataDespesaFim: "",
    }));
  };

  return (
    <div style={styles.container}>
      {/* ✅ Não mostrar filtros se há filtro automático de emenda */}
      {!filtroInicial?.emendaId && (
        <div style={styles.headerActions}>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            style={{
              ...styles.filterToggle,
              backgroundColor: mostrarFiltros ? ACCENT : "#f0f0f0",
              color: mostrarFiltros ? WHITE : "#666",
            }}
          >
            🔍 Filtros Avançados
            {contarFiltrosAtivos() > 0 && (
              <span style={styles.filterBadge}>{contarFiltrosAtivos()}</span>
            )}
          </button>

          {contarFiltrosAtivos() > 0 && (
            <button onClick={limparFiltros} style={styles.clearButton}>
              ✖️ Limpar Filtros
            </button>
          )}
        </div>
      )}

      {/* ✅ Seção de Filtros Expansível */}
      {mostrarFiltros && !filtroInicial?.emendaId && (
        <div style={styles.filterSection}>
          {/* Linha 1: Busca Geral */}
          <div style={styles.filterRow}>
            <div style={styles.filterGroupFull}>
              <label style={styles.filterLabel}>🔍 Busca Geral</label>
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, busca: e.target.value }))
                }
                placeholder="Pesquisar por número, descrição, fornecedor, empenho, NF..."
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Linha 2: Identificação */}
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>#️⃣ Número Despesa</label>
              <input
                type="text"
                value={filtros.numeroDespesa}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    numeroDespesa: e.target.value,
                  }))
                }
                placeholder="Ex: D2025001"
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>💼 Número Empenho</label>
              <input
                type="text"
                value={filtros.numeroEmpenho}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    numeroEmpenho: e.target.value,
                  }))
                }
                placeholder="Ex: 2025NE000123"
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>📋 Emenda</label>
              <select
                value={filtros.emendaId}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, emendaId: e.target.value }))
                }
                style={styles.filterSelect}
              >
                <option value="">Todas as Emendas</option>
                {emendas &&
                  emendas.map((emenda) => (
                    <option key={emenda.id} value={emenda.id}>
                      {emenda.numero} - {emenda.parlamentar}
                    </option>
                  ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>👤 Parlamentar</label>
              <select
                value={filtros.parlamentar}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    parlamentar: e.target.value,
                  }))
                }
                style={styles.filterSelect}
              >
                <option value="">Todos</option>
                {parlamentaresUnicos.map((parlamentar) => (
                  <option key={parlamentar} value={parlamentar}>
                    {parlamentar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Classificação e Fornecedor */}
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>🏷️ Natureza da Despesa</label>
              <select
                value={filtros.naturezaDespesa}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    naturezaDespesa: e.target.value,
                  }))
                }
                style={styles.filterSelect}
              >
                <option value="">Todas</option>
                {naturezasUnicas.map((natureza) => (
                  <option key={natureza} value={natureza}>
                    {natureza}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>🏢 Fornecedor</label>
              <select
                value={filtros.fornecedor}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    fornecedor: e.target.value,
                  }))
                }
                style={styles.filterSelect}
              >
                <option value="">Todos</option>
                {fornecedoresUnicos.map((fornecedor) => (
                  <option key={fornecedor} value={fornecedor}>
                    {fornecedor}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>📝 Descrição</label>
              <select
                value={filtros.descricao}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, descricao: e.target.value }))
                }
                style={styles.filterSelect}
              >
                <option value="">Todas</option>
                {descricoesUnicas.slice(0, 20).map((desc) => (
                  <option key={desc} value={desc}>
                    {desc.length > 30 ? desc.substring(0, 30) + "..." : desc}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>🧾 Número NF</label>
              <input
                type="text"
                value={filtros.numeroNf}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, numeroNf: e.target.value }))
                }
                placeholder="Ex: NF-001234"
                style={styles.filterInput}
              />
            </div>
          </div>

          {/* Linha 4: Valores e Período */}
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>💰 Valor Mínimo (R$)</label>
              <input
                type="text"
                value={filtros.valorMin}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, valorMin: e.target.value }))
                }
                placeholder="Ex: 1000"
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>💰 Valor Máximo (R$)</label>
              <input
                type="text"
                value={filtros.valorMax}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, valorMax: e.target.value }))
                }
                placeholder="Ex: 50000"
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>⏱️ Período</label>
              <select
                value={filtros.periodo}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    periodo: e.target.value,
                    dataDespesaInicio: "",
                    dataDespesaFim: "",
                  }))
                }
                style={styles.filterSelect}
              >
                <option value="">Personalizado</option>
                <option value="ultimos_7_dias">Últimos 7 dias</option>
                <option value="ultimos_30_dias">Últimos 30 dias</option>
                <option value="ultimos_90_dias">Últimos 90 dias</option>
                <option value="este_mes">Este mês</option>
                <option value="mes_anterior">Mês anterior</option>
              </select>
            </div>
          </div>

          {/* Linha 5: Filtros de Data (só aparece se período for "Personalizado") */}
          {!filtros.periodo && (
            <div style={styles.filterRow}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📅 Data Despesa De</label>
                <input
                  type="date"
                  value={filtros.dataDespesaInicio}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      dataDespesaInicio: e.target.value,
                    }))
                  }
                  style={styles.filterInput}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📅 Data Despesa Até</label>
                <input
                  type="date"
                  value={filtros.dataDespesaFim}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      dataDespesaFim: e.target.value,
                    }))
                  }
                  style={styles.filterInput}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📄 Data NF De</label>
                <input
                  type="date"
                  value={filtros.dataNfInicio}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      dataNfInicio: e.target.value,
                    }))
                  }
                  style={styles.filterInput}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📄 Data NF Até</label>
                <input
                  type="date"
                  value={filtros.dataNfFim}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      dataNfFim: e.target.value,
                    }))
                  }
                  style={styles.filterInput}
                />
              </div>
            </div>
          )}

          {/* Botões de Período Rápido */}
          <div style={styles.quickFilters}>
            <span style={styles.quickFiltersLabel}>⚡ Filtros Rápidos:</span>
            <button
              onClick={() => aplicarPeriodo("ultimos_7_dias")}
              style={styles.quickButton}
            >
              🗓️ 7 dias
            </button>
            <button
              onClick={() => aplicarPeriodo("ultimos_30_dias")}
              style={styles.quickButton}
            >
              📅 30 dias
            </button>
            <button
              onClick={() => aplicarPeriodo("este_mes")}
              style={styles.quickButton}
            >
              📊 Este mês
            </button>
            <button onClick={limparFiltros} style={styles.clearQuickButton}>
              🔄 Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Estilos padronizados (mesmo padrão do EmendasFilters)
const styles = {
  container: {
    margin: "0 32px 16px 32px",
  },

  headerActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },

  filterToggle: {
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.3s ease",
    position: "relative",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  filterBadge: {
    backgroundColor: ERROR,
    color: WHITE,
    borderRadius: "50%",
    width: 20,
    height: 20,
    fontSize: 11,
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    animation: "pulse 2s infinite",
  },

  clearButton: {
    padding: "10px 16px",
    border: `2px solid ${ERROR}`,
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    backgroundColor: WHITE,
    color: ERROR,
    fontWeight: "600",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  filterSection: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 24,
    border: "1px solid #e9ecef",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    marginBottom: 16,
  },

  filterRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  filterGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    gridColumn: "1 / -1",
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  searchInput: {
    padding: "10px 14px",
    border: "2px solid #e1e8ed",
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: WHITE,
    transition: "border-color 0.3s ease",
    fontFamily: "inherit",
  },

  filterInput: {
    padding: "10px 14px",
    border: "2px solid #e1e8ed",
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: WHITE,
    transition: "border-color 0.3s ease",
    fontFamily: "inherit",
  },

  filterSelect: {
    padding: "10px 14px",
    border: "2px solid #e1e8ed",
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: WHITE,
    cursor: "pointer",
    transition: "border-color 0.3s ease",
    fontFamily: "inherit",
  },

  quickFilters: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTop: "2px solid #f8f9fa",
    flexWrap: "wrap",
  },

  quickFiltersLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY,
    marginRight: 8,
  },

  quickButton: {
    padding: "8px 14px",
    border: `2px solid ${ACCENT}`,
    borderRadius: 6,
    backgroundColor: WHITE,
    color: ACCENT,
    fontSize: 12,
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  clearQuickButton: {
    padding: "8px 14px",
    border: `2px solid ${WARNING}`,
    borderRadius: 6,
    backgroundColor: WARNING,
    color: WHITE,
    fontSize: 12,
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
};

// ✅ CSS adicional para animações
const additionalCSS = `
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
  }
}

.filter-input:focus,
.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: ${ACCENT};
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.quick-button:hover {
  background-color: ${ACCENT};
  color: white;
  transform: translateY(-1px);
}

.clear-quick-button:hover {
  background-color: ${ERROR};
  border-color: ${ERROR};
  transform: translateY(-1px);
}

.clear-button:hover {
  background-color: ${ERROR};
  color: white;
  transform: translateY(-1px);
}

.filter-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .quick-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .quick-filters > div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
`;

// Inserir CSS dinamicamente
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = additionalCSS;
  document.head.appendChild(style);
}
