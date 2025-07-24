
import React from 'react';

export default function FirebaseError() {
  return (
    <div style={styles.container}>
      <div style={styles.errorCard}>
        <div style={styles.icon}>🔥❌</div>
        <h2 style={styles.title}>Erro de Configuração Firebase</h2>
        <p style={styles.description}>
          As variáveis de ambiente do Firebase não estão configuradas corretamente.
        </p>
        
        <div style={styles.instructions}>
          <h3>Para corrigir:</h3>
          <ol style={styles.stepsList}>
            <li>Acesse a aba <strong>Secrets</strong> no painel lateral do Replit</li>
            <li>Adicione as seguintes variáveis:</li>
            <ul style={styles.varsList}>
              <li><code>VITE_FIREBASE_API_KEY</code></li>
              <li><code>VITE_FIREBASE_AUTH_DOMAIN</code></li>
              <li><code>VITE_FIREBASE_PROJECT_ID</code></li>
              <li><code>VITE_FIREBASE_STORAGE_BUCKET</code></li>
              <li><code>VITE_FIREBASE_MESSAGING_SENDER_ID</code></li>
              <li><code>VITE_FIREBASE_APP_ID</code></li>
            </ul>
            <li>Reinicie o aplicativo</li>
          </ol>
        </div>

        <div style={styles.helpBox}>
          <p><strong>💡 Dica:</strong> Os valores devem vir do seu projeto Firebase Console</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '2px solid #dc3545',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  title: {
    color: '#dc3545',
    marginBottom: '15px',
    fontSize: '24px',
  },
  description: {
    color: '#6c757d',
    marginBottom: '30px',
    fontSize: '16px',
    lineHeight: '1.6',
  },
  instructions: {
    textAlign: 'left',
    marginBottom: '20px',
  },
  stepsList: {
    marginLeft: '20px',
    lineHeight: '1.8',
  },
  varsList: {
    marginLeft: '20px',
    marginTop: '10px',
  },
  helpBox: {
    backgroundColor: '#e7f3ff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #007bff',
    color: '#004085',
  },
};
