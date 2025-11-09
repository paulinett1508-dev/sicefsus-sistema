import React from 'react';
import './shared-styles.css';

function ProgressBar({ progresso, total, label, cor = '#667eea' }) {
  const percentual = total > 0 ? Math.round((progresso / total) * 100) : 0;

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          <span className="progress-numeros">
            {progresso} / {total} ({percentual}%)
          </span>
        </div>
      )}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${percentual}%`,
            background: cor,
          }}
        >
          {percentual > 10 && (
            <span className="progress-text">{percentual}%</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
