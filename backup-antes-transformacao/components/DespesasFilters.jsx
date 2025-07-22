// src/components/LancamentosFilters.jsx - COM PLACEHOLDERS PREFIXO L
import React, { useState, useEffect } from "react";

const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const ERROR = "#E74C3C";
const WHITE = "#fff";

export default function LancamentosFilters({
  lancamentos,
  emendas,
  onFilter,
  onClear,
}) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    emendaId: "",
    fornecedor: "",
    valorMin: "",
    valorMax: "",
    dataLancamentoInicio: "",
    dataLancamentoFim: "",
    dataNfInicio: "",
    dataNfFim: "",
    numeroNf: "",
    numeroLancamento: "",
    descricao: "",
    periodo: "",
    busca: "",
  });

  // Listas únicas para selects dinâmicos
  const [fornecedoresUnicos, setFornecedoresUnicos] = useState([]);
  const [descricoesUnicas, setDescricoesUnicas] = useState([]);

  // Extrair valores únicos quando lançamentos mudam
  useEffect(() => {
    if (lancamentos && lancamentos.length > 0) {
      setFornecedoresUnicos(
        [
          ...new Set(
            lancamentos.map((l) => l.notaFiscalFornecedor).filter(Boolean),
          ),
        ].sort(),
      );
      setDescricoesUnicas(
        [
          ...new Set(lancamentos.map((l) => l.descricao).filter(Boolean)),
        ].sort(),
      );
    }
  }, [lancamentos]);

  // Aplicar filtros sempre que mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, lancamentos]);

  const aplicarFiltros = () => {
    if (!lancamentos) return;

    let resultado = [...lancamentos];

    // Filtro de busca geral
    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (lancamento) =>
          lancamento.descricao?.toLowerCase().includes(termoBusca) ||
          lancamento.notaFiscalFornecedor?.toLowerCase().includes(termoBusca) ||
          lancamento.notaFiscalNumero?.toLowerCase().includes(termoBusca) ||
          lancamento.notaFiscalDescricao?.toLowerCase().includes(termoBusca) ||
          lancamento.numero?.toLowerCase().includes(termoBusca) ||
          getEmendaInfo(lancamento.emendaId).toLowerCase().includes(termoBusca),
      );
    }

    // Filtro por Número do Lançamento
    if (filtros.numeroLancamento) {
      resultado = resultado.filter((lancamento) =>
        lancamento.numero
          ?.toLowerCase()
          .includes(filtros.numeroLancamento.toLowerCase()),
      );
    }

    // Filtro por Emenda
    if (filtros.emendaId) {
      resultado = resultado.filter(
        (lancamento) => lancamento.emendaId === filtros.emendaId,
      );
    }

    // Filtro por Fornecedor
    if (filtros.fornecedor) {
      resultado = resultado.filter((lancamento) =>
        lancamento.notaFiscalFornecedor
          ?.toLowerCase()
          .includes(filtros.fornecedor.toLowerCase()),
      );
    }

    // Filtro por Descrição
    if (filtros.descricao) {
      resultado = resultado.filter((lancamento) =>
        lancamento.descricao
          ?.toLowerCase()
          .includes(filtros.descricao.toLowerCase()),
      );
    }

    // Filtro por Número NF
    if (filtros.numeroNf) {
      resultado = resultado.filter((lancamento) =>
        lancamento.notaFiscalNumero
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
        resultado = resultado.filter(
          (lancamento) => lancamento.valor >= valorMin,
        );
      }
    }

    // Filtro por Valor Máximo
    if (filtros.valorMax) {
      const valorMax = parseFloat(
        filtros.valorMax.replace(/[^\d,]/g, "").replace(",", "."),
      );
      if (!isNaN(valorMax)) {
        resultado = resultado.filter(
          (lancamento) => lancamento.valor <= valorMax,
        );
      }
    }

    // Filtro por Data de Lançamento - Início
    if (filtros.dataLancamentoInicio) {
      resultado = resultado.filter((lancamento) => {
        const dataLanc = formatarDataParaComparacao(lancamento.data);
        return dataLanc >= filtros.dataLancamentoInicio;
      });
    }

    // Filtro por Data de Lançamento - Fim
    if (filtros.dataLancamentoFim) {
      resultado = resultado.filter((lancamento) => {
        const dataLanc = formatarDataParaComparacao(lancamento.data);
        return dataLanc <= filtros.dataLancamentoFim;
      });
    }

    // Filtro por Data NF - Início
    if (filtros.dataNfInicio) {
      resultado = resultado.filter((lancamento) => {
        const dataNf = formatarDataParaComparacao(lancamento.notaFiscalData);
        return dataNf >= filtros.dataNfInicio;
      });
    }

    // Filtro por Data NF - Fim
    if (filtros.dataNfFim) {
      resultado = resultado.filter((lancamento) => {
        const dataNf = formatarDataParaComparacao(lancamento.notaFiscalData);
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
          resultado = resultado.filter((lancamento) => {
            const dataLanc = new Date(
              formatarDataParaComparacao(lancamento.data),
            );
            return dataLanc >= dataInicio && dataLanc <= fimMesAnterior;
          });
          // Chamar callback e retornar para não aplicar filtro adicional
          onFilter(resultado);
          return;
        default:
          break;
      }

      if (dataInicio) {
        resultado = resultado.filter((lancamento) => {
          const dataLanc = new Date(
            formatarDataParaComparacao(lancamento.data),
          );
          return dataLanc >= dataInicio;
        });
      }
    }

    // Chamar callback com resultados filtrados
    onFilter(resultado);
  };

  // Helper para buscar informações da emenda
  const getEmendaInfo = (emendaId) => {
    if (!emendas) return "Carregando...";
    const emenda = emendas.find((e) => e.id === emendaId);
    return emenda
      ? `${emenda.numero} - ${emenda.parlamentar}`
      : "Emenda não encontrada";
  };

  // Helper para formatar data para comparação
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
      fornecedor: "",
      valorMin: "",
      valorMax: "",
      dataLancamentoInicio: "",
      dataLancamentoFim: "",
      dataNfInicio: "",
      dataNfFim: "",
      numeroNf: "",
      numeroLancamento: "",
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

  // Handlers para períodos predefinidos
  const aplicarPeriodo = (tipoPeriodo) => {
    setFiltros((prev) => ({
      ...prev,
      periodo: tipoPeriodo,
      dataLancamentoInicio: "",
      dataLancamentoFim: "",
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerActions}>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          style={{
            ...styles.filterToggle,
            backgroundColor: mostrarFiltros ? ACCENT : "#f0f0f0",
            color: mostrarFiltros ? WHITE : "#666",
          }}
        >
          🔍 Filtros
          {contarFiltrosAtivos() > 0 && (
            <span style={styles.filterBadge}>{contarFiltrosAtivos()}</span>
          )}
        </button>

        {contarFiltrosAtivos() > 0 && (
          <button onClick={limparFiltros} style={styles.clearButton}>
            ✖️ Limpar
          </button>
        )}
      </div>

      {/* Seção de Filtros Expansível */}
      {mostrarFiltros && (
        <div style={styles.filterSection}>
          {/* Linha 1: Busca Geral */}
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>🔍 Busca Geral</label>
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, busca: e.target.value }))
                }
                placeholder="Pesquisar por L2025001, descrição, fornecedor, nº NF..."
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Linha 2: Filtros Básicos */}
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>#️⃣ Número Lançamento</label>
              <input
                type="text"
                value={filtros.numeroLancamento}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    numeroLancamento: e.target.value,
                  }))
                }
                placeholder="Ex: L2025001"
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
                {descricoesUnicas.map((desc) => (
                  <option key={desc} value={desc}>
                    {desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Número NF e Valores */}
          <div style={styles.filterRow}>
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
                    dataLancamentoInicio: "",
                    dataLancamentoFim: "",
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

          {/* Linha 4: Filtros de Data (só aparece se período for "Personalizado") */}
          {!filtros.periodo && (
            <div style={styles.filterRow}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📅 Data Lançamento De</label>
                <input
                  type="date"
                  value={filtros.dataLancamentoInicio}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      dataLancamentoInicio: e.target.value,
                    }))
                  }
                  style={styles.filterInput}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📅 Data Lançamento Até</label>
                <input
                  type="date"
                  value={filtros.dataLancamentoFim}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      dataLancamentoFim: e.target.value,
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
            <span style={styles.quickFiltersLabel}>Filtros Rápidos:</span>
            <button
              onClick={() => aplicarPeriodo("ultimos_7_dias")}
              style={styles.quickButton}
            >
              7 dias
            </button>
            <button
              onClick={() => aplicarPeriodo("ultimos_30_dias")}
              style={styles.quickButton}
            >
              30 dias
            </button>
            <button
              onClick={() => aplicarPeriodo("este_mes")}
              style={styles.quickButton}
            >
              Este mês
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: 16,
  },

  headerActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  filterToggle: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s",
    position: "relative",
  },

  filterBadge: {
    backgroundColor: ERROR,
    color: WHITE,
    borderRadius: "50%",
    width: 18,
    height: 18,
    fontSize: 11,
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  clearButton: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
    backgroundColor: WHITE,
    color: ERROR,
    fontWeight: "500",
    transition: "all 0.2s",
  },

  filterSection: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 20,
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  filterRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  searchInput: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: WHITE,
    transition: "border-color 0.2s",
    width: "100%",
  },

  filterInput: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: WHITE,
  },

  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: WHITE,
    cursor: "pointer",
  },

  quickFilters: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #e9ecef",
    flexWrap: "wrap",
  },

  quickFiltersLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
  },

  quickButton: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: 4,
    backgroundColor: WHITE,
    color: ACCENT,
    fontSize: 12,
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s",
  },
};
