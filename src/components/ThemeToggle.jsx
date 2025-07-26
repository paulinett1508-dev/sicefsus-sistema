
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { isDarkMode, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        style={styles.compactButton}
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
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--theme-surface)',
    border: '2px solid var(--theme-border)',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--theme-text)',
    fontFamily: 'var(--font-family)',
    fontSize: '14px',
    fontWeight: '500',
  },

  compactButton: {
    background: 'var(--theme-surface)',
    border: '1px solid var(--theme-border)',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px var(--theme-shadow)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    position: 'relative',
    '@media (max-width: 768px)': {
      width: '40px',
      height: '40px',
      fontSize: '18px',
    },
  },

  icon: {
    fontSize: '16px',
  },

  text: {
    fontSize: '14px',
    fontWeight: '500',
  },
};
