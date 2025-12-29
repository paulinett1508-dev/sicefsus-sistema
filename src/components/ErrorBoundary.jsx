import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Verificar se é erro específico de require
    if (error.message && error.message.includes('require is not defined')) {
      console.error('🔥 ERRO CRÍTICO: Uso de require() detectado no cliente!');
      console.error('Verifique se não há imports usando require() em arquivos JSX');
    }

    // Log para monitoramento
    if (import.meta.env.DEV) {
      console.group('🐛 Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Log structured error for potential monitoring services
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store error in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('sicefsus_errors') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('sicefsus_errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.warn('Could not store error in localStorage:', storageError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorCard}>
            <div style={styles.errorIcon}>💥</div>
            <h2 style={styles.errorTitle}>Oops! Algo deu errado</h2>
            <p style={styles.errorMessage}>
              Ocorreu um erro inesperado. A página será recarregada automaticamente.
            </p>

            {import.meta.env.DEV && (
              <details style={styles.errorDetails}>
                <summary style={styles.errorSummary}>Detalhes do erro (modo desenvolvimento)</summary>
                <pre style={styles.errorStack}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.errorActions}>
              <button
                onClick={() => window.location.reload()}
                style={styles.reloadButton}
              >
                🔄 Recarregar Página
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                style={styles.retryButton}
              >
                ↻ Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--theme-bg)',
    padding: '20px',
    fontFamily: 'var(--font-family)'
  },
  errorCard: {
    backgroundColor: 'var(--theme-surface)',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)',
    maxWidth: '600px',
    width: '100%',
    border: '1px solid var(--theme-border)'
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  errorTitle: {
    color: 'var(--error)',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  errorMessage: {
    color: 'var(--theme-text-secondary)',
    fontSize: '16px',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  errorDetails: {
    textAlign: 'left',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'var(--theme-surface-secondary)',
    borderRadius: '6px',
    border: '1px solid var(--theme-border)'
  },
  errorSummary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: 'var(--theme-text)'
  },
  errorStack: {
    fontSize: '12px',
    color: 'var(--error)',
    overflow: 'auto',
    maxHeight: '200px'
  },
  errorActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  reloadButton: {
    backgroundColor: 'var(--primary)',
    color: 'var(--white)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  retryButton: {
    backgroundColor: 'var(--success)',
    color: 'var(--white)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  }
};

export default ErrorBoundary;