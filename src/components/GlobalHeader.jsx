
// src/components/GlobalHeader.jsx
import React from 'react';
import { useVersion } from '../hooks/useVersion';

const GlobalHeader = ({ 
  usuario, 
  loading = false, 
  dataCount = 0, 
  dataLabel = 'registros',
  customData = null 
}) => {
  const { formatVersion } = useVersion();
  const userRole = usuario?.tipo || "operador";
  const userMunicipio = usuario?.municipio;

  return (
    <div style={styles.compactHeader}>
      <div style={styles.statusInfo}>
        <span style={styles.statusText}>Status:</span>
        <span style={styles.statusValue}>✅ Operacional</span>
        <span style={styles.divider}>|</span>
        <span style={styles.versionText}>Versão:</span>
        <span style={styles.versionValue}>{formatVersion()}</span>
        <span style={styles.divider}>|</span>
        <span style={styles.statusText}>Usuário:</span>
        <span style={styles.versionValue}>
          {userRole === "admin"
            ? "👑 Admin"
            : `🏘️ ${userMunicipio || "Município não cadastrado"}`}
        </span>
        <span style={styles.divider}>|</span>
        <span style={styles.statusText}>Dados:</span>
        <span style={styles.versionValue}>
          {loading 
            ? "Carregando..." 
            : customData || `${dataCount} ${dataLabel}`
          }
        </span>
      </div>
    </div>
  );
};

const styles = {
  compactHeader: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    padding: '8px 16px',
    marginBottom: '16px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statusInfo: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    fontSize: '13px',
  },
  statusText: {
    color: '#6c757d',
    fontWeight: '500',
  },
  statusValue: {
    color: '#28a745',
    fontWeight: '600',
  },
  versionText: {
    color: '#6c757d',
    fontWeight: '500',
  },
  versionValue: {
    color: '#495057',
    fontWeight: '600',
  },
  divider: {
    color: '#dee2e6',
    fontWeight: 'normal',
  },
};

export default GlobalHeader;
