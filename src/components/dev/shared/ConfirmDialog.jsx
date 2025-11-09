import React from 'react';
import './shared-styles.css';

function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
  tipo = 'warning', // 'warning', 'danger', 'info'
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
}) {
  if (!aberto) return null;

  const icones = {
    warning: '⚠️',
    danger: '🚨',
    info: 'ℹ️',
  };

  const cores = {
    warning: '#ffc107',
    danger: '#f56565',
    info: '#4299e1',
  };

  return (
    <>
      <div className="confirm-overlay" onClick={!loading ? onCancelar : undefined} />
      <div className="confirm-dialog">
        <div className="confirm-header" style={{ borderLeftColor: cores[tipo] }}>
          <span className="confirm-icone">{icones[tipo]}</span>
          <h3>{titulo}</h3>
        </div>

        <div className="confirm-body">
          <p>{mensagem}</p>
        </div>

        <div className="confirm-footer">
          <button
            className="btn-cancelar"
            onClick={onCancelar}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`btn-confirmar ${tipo}`}
            onClick={onConfirmar}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processando...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default ConfirmDialog;
