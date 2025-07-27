
import React, { useState } from 'react';

const DebugPanel = ({ states, onToggle }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          zIndex: 9999
        }}
      >
        🐛
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>🐛 DEBUG PANEL</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      {Object.entries(states).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '5px' }}>
          <strong>{key}:</strong> {
            typeof value === 'boolean' ? (value ? '✅' : '❌') :
            typeof value === 'object' ? JSON.stringify(value, null, 2) :
            String(value)
          }
        </div>
      ))}
      
      <button
        onClick={() => {
          console.log('🎯 DEBUG: Forçando abertura do modal');
          onToggle && onToggle();
        }}
        style={{
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer',
          marginTop: '10px',
          width: '100%'
        }}
      >
        🚀 Forçar Abrir Modal
      </button>
    </div>
  );
};

export default DebugPanel;
