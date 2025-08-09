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
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    width: '100%'
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  errorTitle: {
    color: '#E74C3C',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  errorMessage: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  errorDetails: {
    textAlign: 'left',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #dee2e6'
  },
  errorSummary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  errorStack: {
    fontSize: '12px',
    color: '#e74c3c',
    overflow: 'auto',
    maxHeight: '200px'
  },
  errorActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  reloadButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  retryButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  }
};

export default ErrorBoundary;