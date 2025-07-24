
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary capturou erro:', error);
    console.error('📍 Stack trace:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log para monitoramento (não incluir em produção)
    if (import.meta.env.DEV) {
      console.group('🐛 Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
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
                <summary>Detalhes do erro (modo desenvolvimento)</summary>
                <pre style={styles.errorStack}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
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
                onClick={() => this.setState({ hasError: false })}
                style={styles.retryButton}
              >
                🔁 Tentar Novamente
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
    min-height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px'
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
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  errorStack: {
    fontSize: '12px',
    color: '#666',
    overflow: 'auto',
    maxHeight: '200px'
  },
  errorActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  reloadButton: {
    backgroundColor: '#E74C3C',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  },
  retryButton: {
    backgroundColor: '#154360',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  }
};

export default ErrorBoundary;
