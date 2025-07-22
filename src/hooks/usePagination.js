// src/hooks/usePagination.js
import { useState, useMemo, useCallback } from "react";

/**
 * Hook customizado para paginação de dados
 * @param {Array} data - Array de dados para paginar
 * @param {number} itemsPerPage - Número de itens por página (padrão: 10)
 * @returns {Object} Objeto com dados paginados e funções de controle
 */
export function usePagination(data = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  // Cálculos básicos
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Dados da página atual
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Informações da página atual
  const startIndex = useMemo(() => {
    return totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize, totalItems]);

  const endIndex = useMemo(() => {
    return Math.min(currentPage * pageSize, totalItems);
  }, [currentPage, pageSize, totalItems]);

  // Estados de navegação
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Funções de navegação
  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Alterar tamanho da página
  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset para primeira página
  }, []);

  // Gerar range de páginas para exibição
  const getPageRange = useCallback(() => {
    if (totalPages <= 7) {
      // Se há 7 ou menos páginas, mostrar todas
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2; // Páginas de cada lado da atual
    const range = [];
    const rangeWithDots = [];

    // Calcular range ao redor da página atual
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Adicionar primeira página
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    // Adicionar range do meio
    rangeWithDots.push(...range);

    // Adicionar última página
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Remover duplicatas
    return rangeWithDots.filter((item, index, arr) => {
      if (typeof item === "number") {
        return arr.indexOf(item) === index;
      }
      return true;
    });
  }, [currentPage, totalPages]);

  // Reset da paginação
  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Resetar quando dados mudarem significativamente
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Informações de resumo
  const getSummary = useCallback(() => {
    if (totalItems === 0) {
      return "Nenhum item encontrado";
    }

    if (totalItems === 1) {
      return "1 item";
    }

    if (totalPages === 1) {
      return `${totalItems} itens`;
    }

    return `${startIndex} a ${endIndex} de ${totalItems} itens`;
  }, [startIndex, endIndex, totalItems, totalPages]);

  // Ir para página que contém um item específico
  const goToItemPage = useCallback(
    (itemIndex) => {
      const page = Math.ceil((itemIndex + 1) / pageSize);
      goToPage(page);
    },
    [pageSize, goToPage],
  );

  // Verificar se um item está na página atual
  const isItemInCurrentPage = useCallback(
    (itemIndex) => {
      const itemPage = Math.ceil((itemIndex + 1) / pageSize);
      return itemPage === currentPage;
    },
    [pageSize, currentPage],
  );

  return {
    // Dados
    paginatedData,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    startIndex,
    endIndex,

    // Estados
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    isEmpty: totalItems === 0,

    // Navegação
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    goToItemPage,

    // Configuração
    changePageSize,
    reset,

    // Utilitários
    getPageRange,
    getSummary,
    isItemInCurrentPage,

    // Opções de tamanho de página comuns
    pageSizeOptions: [5, 10, 25, 50, 100],
  };
}

/**
 * Hook para paginação com busca/filtros
 * @param {Array} originalData - Dados originais
 * @param {Function} filterFn - Função de filtro
 * @param {number} itemsPerPage - Itens por página
 */
export function usePaginationWithFilter(
  originalData = [],
  filterFn = null,
  itemsPerPage = 10,
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

  // Aplicar filtros aos dados
  const filteredData = useMemo(() => {
    let result = originalData;

    // Aplicar função de filtro personalizada
    if (filterFn) {
      result = result.filter(filterFn);
    }

    // Aplicar filtros do objeto filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        result = result.filter((item) => {
          const itemValue = item[key];
          if (typeof itemValue === "string") {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        });
      }
    });

    // Aplicar busca por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (value) => value && value.toString().toLowerCase().includes(term),
        ),
      );
    }

    return result;
  }, [originalData, filterFn, filters, searchTerm]);

  const pagination = usePagination(filteredData, itemsPerPage);

  // Resetar página ao mudar filtros
  useMemo(() => {
    pagination.reset();
  }, [searchTerm, filters]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return {
    ...pagination,

    // Dados de filtro
    originalData,
    filteredData,
    searchTerm,
    filters,

    // Controles de filtro
    setSearchTerm,
    setFilter,
    clearFilters,
    clearFilter,

    // Estados de filtro
    hasFilters: Object.keys(filters).length > 0 || searchTerm.length > 0,
    filteredCount: filteredData.length,
    originalCount: originalData.length,
  };
}

/**
 * Hook para paginação com ordenação
 * @param {Array} data - Dados para paginar
 * @param {string} defaultSortField - Campo padrão para ordenação
 * @param {string} defaultSortDirection - Direção padrão ('asc' ou 'desc')
 * @param {number} itemsPerPage - Itens por página
 */
export function usePaginationWithSort(
  data = [],
  defaultSortField = null,
  defaultSortDirection = "asc",
  itemsPerPage = 10,
) {
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);

  // Aplicar ordenação aos dados
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Tratar valores nulos/undefined
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Tratar números
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Tratar datas
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Tratar strings
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortField, sortDirection]);

  const pagination = usePagination(sortedData, itemsPerPage);

  const handleSort = useCallback(
    (field) => {
      if (sortField === field) {
        // Alternar direção se for o mesmo campo
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        // Novo campo, começar com ascendente
        setSortField(field);
        setSortDirection("asc");
      }
      pagination.reset(); // Voltar para primeira página
    },
    [sortField, pagination],
  );

  const clearSort = useCallback(() => {
    setSortField(null);
    setSortDirection("asc");
  }, []);

  return {
    ...pagination,

    // Dados ordenados
    sortedData,

    // Estado da ordenação
    sortField,
    sortDirection,

    // Controles de ordenação
    handleSort,
    clearSort,
    setSortField,
    setSortDirection,

    // Utilitários
    isSortedBy: (field) => sortField === field,
    getSortIcon: (field) => {
      if (sortField !== field) return "↕️";
      return sortDirection === "asc" ? "↑" : "↓";
    },
  };
}

export default usePagination;
