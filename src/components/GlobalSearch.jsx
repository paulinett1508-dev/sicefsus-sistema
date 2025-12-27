// src/components/GlobalSearch.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useToast } from "./Toast";

// Assuming 'useAuth' provides user information including type, uf, and municipio
// This is a placeholder and would need to be imported and used correctly
// For this specific change, we are assuming 'userTipo', 'userUf', and 'userMunicipio' are available in scope
// For demonstration purposes, let's assume they are passed as props or available via context.
// In a real scenario, you'd likely have a hook like `const { user } = useAuth();`
// and then access user.tipo, user.uf, user.municipio.
// For the purpose of this edit, we'll assume these variables are accessible within the function.

const PRIMARY = "#2563EB";
const ACCENT = "#3B82F6";
const WHITE = "#ffffff";
const GRAY = "#F8FAFC";
const SLATE_50 = "#F8FAFC";
const SLATE_200 = "#E2E8F0";
const SLATE_400 = "#94A3B8";
const SLATE_500 = "#64748B";
const SLATE_700 = "#334155";

function GlobalSearch({ onNavigate, onResultSelect, compact = false, userTipo, userUf, userMunicipio }) { // Added user props for context
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({ emendas: [], despesas: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastSearchTime, setLastSearchTime] = useState(0);

  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const isMountedRef = useRef(true);
  const toast = useToast();

  // Cleanup para evitar setState após desmontagem
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Carregar todos os dados na inicialização
  useEffect(() => {
    loadAllData();
  }, [userTipo, userUf, userMunicipio]); // Added dependencies for user data

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
    // Check if user data is available before proceeding
    if (!userTipo || !userUf || !userMunicipio) {
      console.warn("User data not available, skipping initial data load for search.");
      // Optionally show a toast or handle this state appropriately
      return;
    }

    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      const startTime = Date.now();

      // Fetching despesas remains the same
      const despesasSnapshot = await getDocs(query(collection(db, "despesas"), orderBy("data", "desc")));
      if (!isMountedRef.current) return;

      const despesas = despesasSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "despesa",
        ...doc.data(),
      }));

      // Modified logic for fetching emendas based on user role and location
      console.log("🔍 Buscando emendas com filtro adequado...");

      // ✅ GESTOR/OPERADOR: Filtrar por município E UF
      let emendasQuery;
      if (userTipo === "admin") {
        emendasQuery = collection(db, "emendas");
      } else {
        // Gestor e Operador precisam filtrar por município E UF
        emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", userMunicipio),
          where("uf", "==", userUf)
        );
      }

      const emendasSnapshot = await getDocs(emendasQuery);
      if (!isMountedRef.current) return;

      const emendas = emendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "emenda",
        ...doc.data(),
      }));

      setAllData({ emendas, despesas });
      setLastSearchTime(Date.now() - startTime);
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Erro ao carregar dados:", error);
      // Only show toast if it's a permission error that needs user attention
      if (error.code === 'permission-denied') {
        toast.error("Permissão negada para acessar emendas. Verifique suas regras do Firebase.");
      } else {
        toast.error("Erro ao carregar dados para busca");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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

      // Buscar em despesas
      allData.despesas.forEach((despesa) => {
        const score = calculateRelevanceScore(
          despesa,
          normalizedTerm,
          "despesa",
        );
        if (score > 0) {
          // Buscar informações da emenda relacionada
          const emendaRelacionada = allData.emendas.find(
            (e) => e.id === despesa.emendaId,
          );

          searchResults.push({
            ...despesa,
            relevanceScore: score,
            highlights: getHighlights(despesa, normalizedTerm, "despesa"),
            matchedFields: getMatchedFields(
              despesa,
              normalizedTerm,
              "despesa",
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
    } else if (type === "despesa") {
      // Descrição do despesa
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
    } else if (type === "despesa") {
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
    } else if (type === "despesa") {
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
    const path = result.type === "emenda" ? "/emendas" : "/despesas";

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
          <span className="material-symbols-outlined" style={styles.searchIcon}>search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              compact ? "Buscar..." : "Buscar emendas, despesas..."
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
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          )}
          {loading && (
            <div style={styles.loadingIndicator}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>progress_activity</span>
            </div>
          )}
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
                        <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>
                          {result.type === "emenda" ? "description" : "payments"}
                        </span>
                        {result.type === "emenda" ? "Emenda" : "Despesa"}
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
                      {result.highlights.slice(0, 2).map((highlight) => (
                        <span
                          key={`${highlight.field}-${highlight.value}`}
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
              <span className="material-symbols-outlined" style={styles.noResultsIcon}>search_off</span>
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
    padding: "10px 16px 10px 38px",
    border: `1px solid ${SLATE_200}`,
    borderRadius: 8,
    fontSize: 14,
    background: SLATE_50,
    transition: "all 0.15s ease",
    outline: "none",
    color: SLATE_700,
    fontFamily: "'Inter', sans-serif",
  },
  compactInput: {
    width: "100%",
    padding: "8px 12px 8px 36px",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    background: SLATE_50,
    transition: "all 0.15s ease",
    outline: "none",
    color: SLATE_700,
    fontFamily: "'Inter', sans-serif",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    fontSize: 18,
    color: SLATE_400,
    zIndex: 1,
    pointerEvents: "none",
  },
  clearButton: {
    position: "absolute",
    right: 32,
    background: "none",
    border: "none",
    color: SLATE_400,
    cursor: "pointer",
    padding: 4,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    position: "absolute",
    right: 12,
    color: PRIMARY,
    display: "flex",
    alignItems: "center",
  },
  resultsContainer: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: WHITE,
    borderRadius: 12,
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    border: `1px solid ${SLATE_200}`,
    maxHeight: 400,
    overflowY: "auto",
    zIndex: 1000,
  },
  resultsHeader: {
    padding: "10px 16px",
    borderBottom: `1px solid ${SLATE_200}`,
    fontSize: 11,
    color: SLATE_500,
    fontWeight: "500",
    background: SLATE_50,
    display: "flex",
    justifyContent: "space-between",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  searchTime: {
    color: SLATE_400,
    textTransform: "lowercase",
  },
  resultItem: {
    padding: "12px 16px",
    borderBottom: `1px solid ${SLATE_50}`,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
  selectedResult: {
    backgroundColor: "rgba(37, 99, 235, 0.05)",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  resultTypeContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    justifyContent: "space-between",
  },
  resultType: {
    fontSize: 11,
    fontWeight: "600",
    color: PRIMARY,
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
  },
  relevanceScore: {
    fontSize: 10,
    color: SLATE_400,
    background: SLATE_50,
    padding: "2px 6px",
    borderRadius: 4,
    fontWeight: 500,
  },
  resultContent: {
    marginBottom: 6,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "500",
    color: SLATE_700,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  secondaryText: {
    fontSize: 12,
    color: SLATE_500,
    lineHeight: 1.4,
  },
  highlights: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  highlight: {
    fontSize: 10,
    color: PRIMARY,
    background: "rgba(37, 99, 235, 0.08)",
    padding: "2px 6px",
    borderRadius: 4,
  },
  exactHighlight: {
    background: "rgba(16, 185, 129, 0.1)",
    color: "#059669",
    fontWeight: "600",
  },
  noResults: {
    padding: 32,
    textAlign: "center",
    color: SLATE_500,
  },
  noResultsIcon: {
    fontSize: 40,
    marginBottom: 12,
    color: SLATE_400,
  },
  noResultsText: {
    fontSize: 14,
    marginBottom: 4,
    color: SLATE_700,
  },
  noResultsHint: {
    fontSize: 12,
    color: SLATE_400,
  },
};

export default GlobalSearch;