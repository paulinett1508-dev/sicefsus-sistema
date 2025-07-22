// src/components/GlobalSearch.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useToast } from "./Toast";

const PRIMARY = "#154360";
const ACCENT = "#4A90E2";
const WHITE = "#fff";
const GRAY = "#f8f9fa";

function GlobalSearch({ onNavigate, onResultSelect, compact = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({ emendas: [], lancamentos: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastSearchTime, setLastSearchTime] = useState(0);

  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();

  // Carregar todos os dados na inicialização
  useEffect(() => {
    loadAllData();
  }, []);

  // Fechar busca ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch(searchTerm);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, allData]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const [emendasSnapshot, lancamentosSnapshot] = await Promise.all([
        getDocs(query(collection(db, "emendas"), orderBy("numero"))),
        getDocs(query(collection(db, "lancamentos"), orderBy("data", "desc"))),
      ]);

      const emendas = emendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "emenda",
        ...doc.data(),
      }));

      const lancamentos = lancamentosSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "lancamento",
        ...doc.data(),
      }));

      setAllData({ emendas, lancamentos });
      setLastSearchTime(Date.now() - startTime);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados para busca");
    } finally {
      setLoading(false);
    }
  };

  const performSearch = useCallback(
    (term) => {
      const normalizedTerm = term.toLowerCase().trim();
      const searchResults = [];

      // Buscar em emendas
      allData.emendas.forEach((emenda) => {
        const score = calculateRelevanceScore(emenda, normalizedTerm, "emenda");
        if (score > 0) {
          searchResults.push({
            ...emenda,
            relevanceScore: score,
            highlights: getHighlights(emenda, normalizedTerm, "emenda"),
            matchedFields: getMatchedFields(emenda, normalizedTerm, "emenda"),
          });
        }
      });

      // Buscar em lançamentos
      allData.lancamentos.forEach((lancamento) => {
        const score = calculateRelevanceScore(
          lancamento,
          normalizedTerm,
          "lancamento",
        );
        if (score > 0) {
          // Buscar informações da emenda relacionada
          const emendaRelacionada = allData.emendas.find(
            (e) => e.id === lancamento.emendaId,
          );

          searchResults.push({
            ...lancamento,
            relevanceScore: score,
            highlights: getHighlights(lancamento, normalizedTerm, "lancamento"),
            matchedFields: getMatchedFields(
              lancamento,
              normalizedTerm,
              "lancamento",
            ),
            emendaInfo: emendaRelacionada
              ? {
                  numero: emendaRelacionada.numero,
                  autor: emendaRelacionada.autor,
                }
              : null,
          });
        }
      });

      // Ordenar por relevância
      searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setResults(searchResults.slice(0, 8)); // Limitar a 8 resultados
    },
    [allData],
  );

  const calculateRelevanceScore = (item, term, type) => {
    let score = 0;

    if (type === "emenda") {
      // Busca exata no número tem pontuação máxima
      if (item.numero?.toLowerCase().includes(term)) {
        score += item.numero?.toLowerCase() === term ? 150 : 100;
      }

      // Autor
      if (item.autor?.toLowerCase().includes(term)) {
        score += item.autor?.toLowerCase().startsWith(term) ? 90 : 70;
      }

      // Descrição
      if (item.descricao?.toLowerCase().includes(term)) score += 60;

      // Finalidade
      if (item.finalidade?.toLowerCase().includes(term)) score += 50;

      // Tipo
      if (item.tipo?.toLowerCase().includes(term)) score += 40;

      // Observações
      if (item.observacoes?.toLowerCase().includes(term)) score += 30;

      // Valor (busca parcial)
      if (item.valorTotal?.toString().includes(term)) score += 25;
    } else if (type === "lancamento") {
      // Descrição do lançamento
      if (item.descricao?.toLowerCase().includes(term)) {
        score += item.descricao?.toLowerCase().startsWith(term) ? 100 : 80;
      }

      // Fornecedor
      if (item.notaFiscalFornecedor?.toLowerCase().includes(term)) {
        score += item.notaFiscalFornecedor?.toLowerCase().startsWith(term)
          ? 90
          : 70;
      }

      // Número da nota fiscal
      if (item.notaFiscalNumero?.toLowerCase().includes(term)) {
        score += item.notaFiscalNumero?.toLowerCase() === term ? 85 : 60;
      }

      // Descrição da nota fiscal
      if (item.notaFiscalDescricao?.toLowerCase().includes(term)) score += 50;

      // Valor (busca parcial)
      if (item.valor?.toString().includes(term)) score += 30;
    }

    return score;
  };

  const getHighlights = (item, term, type) => {
    const highlights = [];

    if (type === "emenda") {
      if (item.numero?.toLowerCase().includes(term)) {
        highlights.push({
          field: "Número",
          value: item.numero,
          exact: item.numero?.toLowerCase() === term,
        });
      }
      if (item.autor?.toLowerCase().includes(term)) {
        highlights.push({ field: "Autor", value: item.autor, exact: false });
      }
      if (item.descricao?.toLowerCase().includes(term)) {
        highlights.push({
          field: "Descrição",
          value: truncateText(item.descricao, 60),
          exact: false,
        });
      }
    } else if (type === "lancamento") {
      if (item.descricao?.toLowerCase().includes(term)) {
        highlights.push({
          field: "Descrição",
          value: truncateText(item.descricao, 60),
          exact: false,
        });
      }
      if (item.notaFiscalFornecedor?.toLowerCase().includes(term)) {
        highlights.push({
          field: "Fornecedor",
          value: item.notaFiscalFornecedor,
          exact: false,
        });
      }
      if (item.notaFiscalNumero?.toLowerCase().includes(term)) {
        highlights.push({
          field: "NF",
          value: item.notaFiscalNumero,
          exact: item.notaFiscalNumero?.toLowerCase() === term,
        });
      }
    }

    return highlights;
  };

  const getMatchedFields = (item, term, type) => {
    const fields = [];

    if (type === "emenda") {
      if (item.numero?.toLowerCase().includes(term)) fields.push("numero");
      if (item.autor?.toLowerCase().includes(term)) fields.push("autor");
      if (item.descricao?.toLowerCase().includes(term))
        fields.push("descricao");
      if (item.finalidade?.toLowerCase().includes(term))
        fields.push("finalidade");
      if (item.tipo?.toLowerCase().includes(term)) fields.push("tipo");
    } else if (type === "lancamento") {
      if (item.descricao?.toLowerCase().includes(term))
        fields.push("descricao");
      if (item.notaFiscalFornecedor?.toLowerCase().includes(term))
        fields.push("fornecedor");
      if (item.notaFiscalNumero?.toLowerCase().includes(term))
        fields.push("notaFiscal");
    }

    return fields;
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleResultClick = (result) => {
    const path = result.type === "emenda" ? "/emendas" : "/lancamentos";

    if (onResultSelect) {
      onResultSelect(result);
    }

    if (onNavigate) {
      onNavigate(path);
    }

    setIsOpen(false);
    setSearchTerm("");
    setSelectedIndex(-1);

    toast.info(
      `Navegando para ${result.type === "emenda" ? "Emendas" : "Despesas"}`,
    );
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  const containerStyle = compact ? styles.compactContainer : styles.container;
  const inputStyle = compact ? styles.compactInput : styles.input;

  return (
    <div ref={searchRef} style={containerStyle}>
      <div style={styles.searchBox}>
        <div style={styles.inputContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              compact ? "Buscar..." : "Buscar emendas, lançamentos..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            autoComplete="off"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              style={styles.clearButton}
              title="Limpar busca"
            >
              ✕
            </button>
          )}
          {loading && <div style={styles.loadingIndicator}>⏳</div>}
        </div>
      </div>

      {isOpen && (
        <div ref={resultsRef} style={styles.resultsContainer}>
          {results.length > 0 ? (
            <>
              <div style={styles.resultsHeader}>
                <span>
                  {results.length} resultado{results.length !== 1 ? "s" : ""}
                </span>
                {lastSearchTime > 0 && (
                  <span style={styles.searchTime}>({lastSearchTime}ms)</span>
                )}
              </div>

              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  style={{
                    ...styles.resultItem,
                    ...(index === selectedIndex ? styles.selectedResult : {}),
                  }}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={styles.resultHeader}>
                    <div style={styles.resultTypeContainer}>
                      <span style={styles.resultType}>
                        {result.type === "emenda" ? "📄" : "💰"}
                        {result.type === "emenda" ? "Emenda" : "Lançamento"}
                      </span>
                      <span style={styles.relevanceScore}>
                        {Math.round(result.relevanceScore)}%
                      </span>
                    </div>
                  </div>

                  <div style={styles.resultContent}>
                    {result.type === "emenda" ? (
                      <>
                        <div style={styles.primaryText}>
                          {result.numero} - {result.autor}
                        </div>
                        <div style={styles.secondaryText}>
                          {formatCurrency(result.valorTotal)} • {result.tipo}
                          {result.validade &&
                            ` • ${formatDate(result.validade)}`}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={styles.primaryText}>{result.descricao}</div>
                        <div style={styles.secondaryText}>
                          {formatCurrency(result.valor)}
                          {result.notaFiscalFornecedor &&
                            ` • ${result.notaFiscalFornecedor}`}
                          {result.emendaInfo &&
                            ` • Emenda: ${result.emendaInfo.numero}`}
                        </div>
                      </>
                    )}
                  </div>

                  {result.highlights.length > 0 && (
                    <div style={styles.highlights}>
                      {result.highlights.slice(0, 2).map((highlight, i) => (
                        <span
                          key={i}
                          style={{
                            ...styles.highlight,
                            ...(highlight.exact ? styles.exactHighlight : {}),
                          }}
                        >
                          <strong>{highlight.field}:</strong> {highlight.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : searchTerm.length >= 2 ? (
            <div style={styles.noResults}>
              <div style={styles.noResultsIcon}>🔍</div>
              <div style={styles.noResultsText}>
                Nenhum resultado para "{searchTerm}"
              </div>
              <div style={styles.noResultsHint}>
                Tente termos diferentes ou verifique a ortografia
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    maxWidth: 400,
  },
  compactContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 250,
  },
  searchBox: {
    position: "relative",
  },
  inputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    border: `2px solid transparent`,
    borderRadius: 20,
    fontSize: 14,
    background: GRAY,
    transition: "all 0.2s",
    outline: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  compactInput: {
    width: "100%",
    padding: "8px 12px 8px 32px",
    border: `1px solid #ddd`,
    borderRadius: 15,
    fontSize: 13,
    background: WHITE,
    transition: "all 0.2s",
    outline: "none",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    fontSize: 16,
    color: "#666",
    zIndex: 1,
    pointerEvents: "none",
  },
  clearButton: {
    position: "absolute",
    right: 36,
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
    borderRadius: 4,
  },
  loadingIndicator: {
    position: "absolute",
    right: 12,
    fontSize: 14,
  },
  resultsContainer: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: WHITE,
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    border: "1px solid #e0e0e0",
    maxHeight: 400,
    overflowY: "auto",
    zIndex: 1000,
  },
  resultsHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    background: "#fafafa",
    display: "flex",
    justifyContent: "space-between",
  },
  searchTime: {
    color: "#999",
  },
  resultItem: {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  selectedResult: {
    backgroundColor: "#e8f4fd",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultTypeContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    justifyContent: "space-between",
  },
  resultType: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY,
    textTransform: "uppercase",
  },
  relevanceScore: {
    fontSize: 11,
    color: "#999",
    background: "#f0f0f0",
    padding: "2px 6px",
    borderRadius: 4,
  },
  resultContent: {
    marginBottom: 8,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
    lineHeight: 1.3,
  },
  secondaryText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 1.3,
  },
  highlights: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  highlight: {
    fontSize: 11,
    color: ACCENT,
    background: "#e8f4fd",
    padding: "2px 6px",
    borderRadius: 4,
  },
  exactHighlight: {
    background: "#d4edda",
    color: "#155724",
    fontWeight: "600",
  },
  noResults: {
    padding: 32,
    textAlign: "center",
    color: "#666",
  },
  noResultsIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    marginBottom: 4,
  },
  noResultsHint: {
    fontSize: 12,
    color: "#999",
  },
};

export default GlobalSearch;
