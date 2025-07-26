
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { isDarkMode, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        style={styles.compactButton}
        className="theme-toggle-button"
        title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
        aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 4px 12px var(--theme-shadow)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 8px var(--theme-shadow)';
        }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      style={styles.toggleButton}
      title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <span style={styles.icon}>
        {isDarkMode ? '☀️' : '🌙'}
      </span>
      <span style={styles.text}>
        {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
      </span>
    </button>
  );
}

const styles = {
  compactButton: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: '2px solid var(--theme-border)',
    background: 'var(--theme-surface)',
    color: 'var(--theme-text)',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px var(--theme-shadow)',
    transition: 'all 0.3s ease',
    zIndex: 'var(--z-theme-toggle)',
    position: 'relative',
  },
  
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 8,
    border: '2px solid var(--theme-border)',
    background: 'var(--theme-surface)',
    color: 'var(--theme-text)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    boxShadow: '0 2px 8px var(--theme-shadow)',
    transition: 'all 0.3s ease',
    fontFamily: 'var(--font-family)',
  },
  
  icon: {
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
  },
  
  text: {
    fontSize: 14,
    fontWeight: 500,
  },
};
