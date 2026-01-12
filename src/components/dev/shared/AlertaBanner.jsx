import React from 'react';
import './shared-styles.css';

function AlertaBanner({ tipo = 'info', mensagem, onFechar, icone }) {
  // Usa CSS variables com fallback para cores hardcoded
  const tiposConfig = {
    sucesso: { cor: 'var(--success, #48bb78)', icone: '✅', label: 'Sucesso' },
    success: { cor: 'var(--success, #48bb78)', icone: '✅', label: 'Sucesso' },
    erro: { cor: 'var(--danger, #f56565)', icone: '❌', label: 'Erro' },
    error: { cor: 'var(--danger, #f56565)', icone: '❌', label: 'Erro' },
    aviso: { cor: 'var(--warning, #ffc107)', icone: '⚠️', label: 'Atenção' },
    warning: { cor: 'var(--warning, #ffc107)', icone: '⚠️', label: 'Atenção' },
    info: { cor: 'var(--info, #4299e1)', icone: 'ℹ️', label: 'Informação' },
  };

  const config = tiposConfig[tipo] || tiposConfig.info;

  return (
    <div
      className="alerta-banner"
      style={{ borderLeftColor: config.cor }}
    >
      <div className="alerta-banner-icone" style={{ color: config.cor }}>
        {icone || config.icone}
      </div>
      <div className="alerta-banner-conteudo">
        <strong>{config.label}:</strong> {mensagem}
      </div>
      {onFechar && (
        <button className="alerta-banner-fechar" onClick={onFechar}>
          ×
        </button>
      )}
    </div>
  );
}

export default AlertaBanner;
