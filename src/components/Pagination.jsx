// src/components/Pagination.jsx
import React, { useState } from 'react';

const PRIMARY = 'var(--primary)';
const ACCENT = 'var(--primary-light)';
const WHITE = 'var(--theme-surface)';
const GRAY = 'var(--theme-surface-secondary)';
const SLATE = 'var(--theme-text-secondary)';
const SUCCESS = 'var(--success)';

/**
 * Componente de Paginação
 * Trabalha em conjunto com o hook usePagination
 */
export default function Pagination({
  // Dados vindos do hook usePagination
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  startIndex,
  endIndex,
  hasNextPage,
  hasPreviousPage,
  isFirstPage,
  isLastPage,
  isEmpty,

  // Funções de navegação
  goToPage,
  goToNextPage,
  goToPreviousPage,
  goToFirstPage,
  goToLastPage,
  changePageSize,
  getPageRange,
  getSummary,

  // Opções de configuração
  pageSizeOptions = [5, 10, 25, 50, 100],
  showPageSizeSelector = true,
  showSummary = true,
  showJumpToPage = true,
  compact = false,
  className = '',

  // Customização visual
  variant = 'default', // 'default', 'minimal', 'detailed'
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const [jumpValue, setJumpValue] = useState('');

  // Não renderizar se não há itens ou apenas uma página em modo minimal
  if (isEmpty || (variant === 'minimal' && totalPages <= 1)) {
    return null;
  }

  // Lidar com input direto de página
  const handleJumpToPage = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(jumpValue);
      if (page >= 1 && page <= totalPages) {
        goToPage(page);
        setJumpValue('');
      }
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    changePageSize(newSize);
  };

  // Obter range de páginas para exibição
  const pageRange = getPageRange ? getPageRange() : [];

  // Estilos baseados no tamanho
  const sizeStyles = {
    small: {
      container: { ...styles.container, padding: '8px 0', fontSize: '12px' },
      button: { ...styles.button, padding: '4px 8px', fontSize: '12px' },
      input: { ...styles.jumpInput, padding: '2px 6px', fontSize: '12px' }
    },
    medium: {
      container: styles.container,
      button: styles.button,
      input: styles.jumpInput
    },
    large: {
      container: { ...styles.container, padding: '20px 0', fontSize: '16px' },
      button: { ...styles.button, padding: '12px 16px', fontSize: '16px' },
      input: { ...styles.jumpInput, padding: '8px 12px', fontSize: '16px' }
    }
  };

  const currentSizeStyles = sizeStyles[size];

  // Renderização compacta (apenas navegação essencial)
  if (compact) {
    return (
      <div className={className} style={{ ...currentSizeStyles.container, flexDirection: 'row', justifyContent: 'center', gap: '8px' }}>
        <button
          onClick={goToPreviousPage}
          disabled={!hasPreviousPage}
          style={!hasPreviousPage ? styles.disabledButton : currentSizeStyles.button}
          title="Página anterior"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
        </button>

        <span style={styles.pageInfo}>
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={goToNextPage}
          disabled={!hasNextPage}
          style={!hasNextPage ? styles.disabledButton : currentSizeStyles.button}
          title="Próxima página"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        </button>
      </div>
    );
  }

  // Renderização minimal (apenas números de páginas)
  if (variant === 'minimal') {
    return (
      <div className={className} style={{ ...currentSizeStyles.container, justifyContent: 'center' }}>
        <div style={styles.pageNumbers}>
          {pageRange.map((page, index) => (
            page === '...' ? (
              <span key={`dots-${index}`} style={styles.dots}>...</span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={page === currentPage ? styles.activeButton : currentSizeStyles.button}
              >
                {page}
              </button>
            )
          ))}
        </div>
      </div>
    );
  }

  // Renderização completa (padrão)
  return (
    <div className={className} style={currentSizeStyles.container}>
      {/* Informações e seletor de tamanho */}
      <div style={styles.topSection}>
        {showSummary && (
          <div style={styles.summarySection}>
            <span style={styles.summaryText}>
              {getSummary ? getSummary() : `${startIndex} a ${endIndex} de ${totalItems} itens`}
            </span>
          </div>
        )}

        {showPageSizeSelector && (
          <div style={styles.pageSizeSection}>
            <label style={styles.label}>Itens por página:</label>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              style={styles.select}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controles de navegação */}
      {totalPages > 1 && (
        <div style={styles.navigationSection}>
          {/* Botões de navegação extrema */}
          <div style={styles.navigationButtons}>
            <button
              onClick={goToFirstPage}
              disabled={isFirstPage}
              style={isFirstPage ? styles.disabledButton : currentSizeStyles.button}
              title="Primeira página"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>first_page</span>
            </button>

            <button
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage}
              style={!hasPreviousPage ? styles.disabledButton : currentSizeStyles.button}
              title="Página anterior"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
            </button>

            {/* Números das páginas */}
            <div style={styles.pageNumbers}>
              {pageRange.map((page, index) => (
                page === '...' ? (
                  <span key={`dots-${index}`} style={styles.dots}>...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    style={page === currentPage ? styles.activeButton : currentSizeStyles.button}
                    title={`Ir para página ${page}`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={!hasNextPage}
              style={!hasNextPage ? styles.disabledButton : currentSizeStyles.button}
              title="Próxima página"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </button>

            <button
              onClick={goToLastPage}
              disabled={isLastPage}
              style={isLastPage ? styles.disabledButton : currentSizeStyles.button}
              title="Última página"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>last_page</span>
            </button>
          </div>

          {/* Input direto para página */}
          {showJumpToPage && totalPages > 5 && (
            <div style={styles.jumpSection}>
              <label style={styles.label}>Ir para:</label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpValue}
                onChange={(e) => setJumpValue(e.target.value)}
                onKeyPress={handleJumpToPage}
                style={currentSizeStyles.input}
                placeholder={currentPage.toString()}
                title="Digite o número da página e pressione Enter"
              />
              <span style={styles.totalPagesText}>de {totalPages}</span>
            </div>
          )}
        </div>
      )}

      {/* Indicador de página atual (variant detailed) */}
      {variant === 'detailed' && (
        <div style={styles.detailedInfo}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(currentPage / totalPages) * 100}%`
              }}
            />
          </div>
          <span style={styles.progressText}>
            Página {currentPage} de {totalPages} ({Math.round((currentPage / totalPages) * 100)}%)
          </span>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para paginação rápida (apenas prev/next)
export function QuickPagination({
  hasNextPage,
  hasPreviousPage,
  goToNextPage,
  goToPreviousPage,
  currentPage,
  totalPages,
  className = ''
}) {
  return (
    <div className={className} style={styles.quickPagination}>
      <button
        onClick={goToPreviousPage}
        disabled={!hasPreviousPage}
        style={!hasPreviousPage ? styles.disabledButton : styles.quickButton}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>chevron_left</span>
        Anterior
      </button>

      <span style={styles.quickInfo}>
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={goToNextPage}
        disabled={!hasNextPage}
        style={!hasNextPage ? styles.disabledButton : styles.quickButton}
      >
        Próxima
        <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 4 }}>chevron_right</span>
      </button>
    </div>
  );
}

// Componente para informações de paginação apenas (sem controles)
export function PaginationInfo({
  startIndex,
  endIndex,
  totalItems,
  currentPage,
  totalPages,
  getSummary,
  className = ''
}) {
  return (
    <div className={className} style={styles.infoOnly}>
      <span style={styles.summaryText}>
        {getSummary ? getSummary() : `${startIndex} a ${endIndex} de ${totalItems} itens`}
      </span>
      <span style={styles.pageInfoText}>
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    padding: '16px 0',
    borderTop: '1px solid var(--theme-border)',
    marginTop: 16,
    backgroundColor: WHITE,
    borderRadius: '0 0 8px 8px',
    fontFamily: "'Inter', sans-serif",
  },

  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 16,
  },

  summarySection: {
    display: 'flex',
    alignItems: 'center',
  },

  summaryText: {
    fontSize: 14,
    color: SLATE,
    fontWeight: '500',
  },

  pageSizeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  label: {
    fontSize: 14,
    color: 'var(--theme-text)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },

  select: {
    padding: '6px 12px',
    border: '1px solid var(--theme-border)',
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: WHITE,
    cursor: 'pointer',
    color: 'var(--theme-text)',
  },

  navigationSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },

  navigationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },

  button: {
    padding: '8px 12px',
    border: '1px solid var(--theme-border)',
    borderRadius: 6,
    backgroundColor: WHITE,
    color: SLATE,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '500',
    transition: 'all 0.2s',
    minWidth: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    padding: '8px 12px',
    border: '1px solid var(--theme-border)',
    borderRadius: 6,
    backgroundColor: GRAY,
    color: 'var(--gray-300)',
    cursor: 'not-allowed',
    fontSize: 14,
    minWidth: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pageNumbers: {
    display: 'flex',
    gap: 2,
    margin: '0 8px',
    alignItems: 'center',
  },

  activeButton: {
    padding: '8px 12px',
    border: `1px solid ${PRIMARY}`,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    color: WHITE,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    boxShadow: `0 2px 4px rgba(37, 99, 235, 0.2)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dots: {
    padding: '8px 4px',
    color: SLATE,
    fontSize: 14,
    userSelect: 'none',
  },

  jumpSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
  },

  jumpInput: {
    width: 60,
    padding: '6px 8px',
    border: '1px solid var(--theme-border)',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 14,
  },

  totalPagesText: {
    color: SLATE,
    fontSize: 14,
  },

  // Variant: detailed
  detailedInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 300,
  },

  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'var(--gray-200)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: SUCCESS,
    transition: 'width 0.3s ease',
  },

  progressText: {
    fontSize: 12,
    color: SLATE,
  },

  // Quick pagination
  quickPagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '8px 0',
    fontFamily: "'Inter', sans-serif",
  },

  quickButton: {
    padding: '6px 12px',
    border: '1px solid var(--theme-border)',
    borderRadius: 6,
    backgroundColor: WHITE,
    color: PRIMARY,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },

  quickInfo: {
    fontSize: 14,
    color: SLATE,
    fontWeight: '500',
  },

  // Info only
  infoOnly: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderTop: '1px solid var(--theme-border)',
    marginTop: 8,
    fontFamily: "'Inter', sans-serif",
  },

  pageInfo: {
    fontSize: 14,
    color: SLATE,
    fontWeight: '500',
  },

  pageInfoText: {
    fontSize: 12,
    color: 'var(--gray-400)',
  },
};

// CSS adicional para hover effects (adicionar ao App.css)
export const paginationCSS = `
.pagination-button:hover:not(:disabled) {
  background-color: ${GRAY} !important;
  border-color: ${ACCENT} !important;
  transform: translateY(-1px);
}

.pagination-button:active:not(:disabled) {
  transform: translateY(0);
}

.pagination-input:focus {
  border-color: ${ACCENT};
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

@media (max-width: 768px) {
  .pagination-container {
    padding: 12px 0;
  }

  .pagination-top-section {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .pagination-navigation {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-page-numbers {
    order: -1;
    margin: 0 0 8px 0;
  }
}
`;

export default Pagination;
