
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import AlertaBanner from '../shared/AlertaBanner';

function UsuariosTab() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    admins: 0,
    operadores: 0,
    loading: true,
  });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'usuarios'));
      const usuarios = snapshot.docs.map(doc => doc.data());

      setStats({
        total: usuarios.length,
        ativos: usuarios.filter(u => u.status === 'ativo').length,
        inativos: usuarios.filter(u => u.status !== 'ativo').length,
        admins: usuarios.filter(u => u.tipo === 'admin').length,
        operadores: usuarios.filter(u => u.tipo === 'operador').length,
        loading: false,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({ ...stats, loading: false });
    }
  };

  return (
    <div className="tab-usuarios">
      <div className="tab-header">
        <h2>👥 Gerenciamento de Usuários</h2>
        <p className="tab-descricao">
          Estatísticas e análises sobre usuários do sistema.
        </p>
      </div>

      <AlertaBanner
        tipo="info"
        mensagem="Para gerenciar usuários (criar, editar, excluir), use o módulo Administração no menu principal."
      />

      {/* Estatísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px',
      }}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{stats.loading ? '...' : stats.total}</div>
          <div style={styles.statLabel}>Total de Usuários</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statValue}>{stats.loading ? '...' : stats.ativos}</div>
          <div style={styles.statLabel}>Usuários Ativos</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🚫</div>
          <div style={styles.statValue}>{stats.loading ? '...' : stats.inativos}</div>
          <div style={styles.statLabel}>Usuários Inativos</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>👑</div>
          <div style={styles.statValue}>{stats.loading ? '...' : stats.admins}</div>
          <div style={styles.statLabel}>Administradores</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>👤</div>
          <div style={styles.statValue}>{stats.loading ? '...' : stats.operadores}</div>
          <div style={styles.statLabel}>Operadores</div>
        </div>
      </div>

      {/* Link para Administração */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h4 style={{ margin: '0 0 12px 0' }}>🔧 Gerenciar Usuários</h4>
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>
          Para criar, editar ou excluir usuários, acesse o módulo de Administração
        </p>
        <button
          onClick={() => navigate('/administracao')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Ir para Administração →
        </button>
      </div>
    </div>
  );
}

const styles = {
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#718096',
    fontWeight: '500',
  },
};

export default UsuariosTab;
