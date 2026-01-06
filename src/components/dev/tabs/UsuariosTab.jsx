
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
  const [usuarios, setUsuarios] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'usuarios'));
      const usuariosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsuarios(usuariosData);
      setStats({
        total: usuariosData.length,
        ativos: usuariosData.filter(u => u.status === 'ativo').length,
        inativos: usuariosData.filter(u => u.status !== 'ativo').length,
        admins: usuariosData.filter(u => u.tipo === 'admin').length,
        operadores: usuariosData.filter(u => u.tipo === 'operador').length,
        loading: false,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({ ...stats, loading: false });
    }
  };

  const getUsuariosPorTipo = (tipo) => {
    switch(tipo) {
      case 'total':
        return usuarios;
      case 'ativos':
        return usuarios.filter(u => u.status === 'ativo');
      case 'inativos':
        return usuarios.filter(u => u.status !== 'ativo');
      case 'admins':
        return usuarios.filter(u => u.tipo === 'admin');
      case 'operadores':
        return usuarios.filter(u => u.tipo === 'operador');
      default:
        return [];
    }
  };

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const renderCard = (tipo, icone, valor, label) => {
    const usuariosFiltrados = getUsuariosPorTipo(tipo);
    const isExpandido = expandedCards[tipo];

    return (
      <div 
        style={{
          ...styles.statCard,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isExpandido ? 'translateY(-2px)' : 'none',
          boxShadow: isExpandido ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onClick={() => toggleCard(tipo)}
      >
        <div>
          <div style={styles.statIcon}>{icone}</div>
          <div style={styles.statValue}>{stats.loading ? '...' : valor}</div>
          <div style={styles.statLabel}>{label}</div>
          <div style={{
            ...styles.expandIcon,
            transform: isExpandido ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            {isExpandido ? '▼' : '▶'}
          </div>
        </div>

        {isExpandido && usuariosFiltrados.length > 0 && (
          <div style={styles.usuariosList} onClick={(e) => e.stopPropagation()}>
            {usuariosFiltrados.map((usuario, index) => (
              <div key={usuario.id || index} style={styles.usuarioItem}>
                <div style={styles.usuarioInfo}>
                  <span style={styles.usuarioNome}>
                    {usuario.nome || usuario.email}
                  </span>
                  <span style={styles.usuarioEmail}>
                    {usuario.email}
                  </span>
                </div>
                <div style={styles.usuarioMeta}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: usuario.tipo === 'admin' ? '#667eea' : '#48bb78'
                  }}>
                    {usuario.tipo}
                  </span>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: usuario.status === 'ativo' ? '#48bb78' : '#f56565'
                  }}>
                    {usuario.status || 'ativo'}
                  </span>
                  {usuario.superAdmin && (
                    <span style={{
                      ...styles.badge,
                      backgroundColor: '#f6ad55'
                    }}>
                      👑 SUPER
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tab-usuarios">
      <div className="tab-header">
        <h2>👥 Gerenciamento de Usuários</h2>
        <p className="tab-descricao">
          Estatísticas e análises sobre usuários do sistema. Clique em cada card para ver detalhes.
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
        {renderCard('total', '👥', stats.total, 'Total de Usuários')}
        {renderCard('ativos', '✅', stats.ativos, 'Usuários Ativos')}
        {renderCard('inativos', '🚫', stats.inativos, 'Usuários Inativos')}
        {renderCard('admins', '👑', stats.admins, 'Administradores')}
        {renderCard('operadores', '👤', stats.operadores, 'Operadores')}
      </div>

      {/* Link para Administração */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        backgroundColor: 'var(--theme-surface-secondary)',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h4 style={{ margin: '0 0 12px 0' }}>🔧 Gerenciar Usuários</h4>
        <p style={{ margin: '0 0 16px 0', color: 'var(--theme-text-secondary)' }}>
          Para criar, editar ou excluir usuários, acesse o módulo de Administração
        </p>
        <button
          onClick={() => navigate('/administracao')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--primary-600)',
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
    backgroundColor: 'var(--theme-surface)',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid var(--theme-border)',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--theme-text)',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--theme-text-secondary)',
    fontWeight: '500',
    marginBottom: '8px',
  },
  expandIcon: {
    fontSize: '12px',
    color: 'var(--theme-text-muted)',
    marginTop: '8px',
  },
  usuariosList: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--theme-border)',
    maxHeight: '300px',
    overflowY: 'auto',
    textAlign: 'left',
  },
  usuarioItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: 'var(--theme-surface-secondary)',
    borderRadius: '6px',
    fontSize: '13px',
  },
  usuarioInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  usuarioNome: {
    fontWeight: '600',
    color: 'var(--theme-text)',
  },
  usuarioEmail: {
    fontSize: '12px',
    color: 'var(--theme-text-secondary)',
  },
  usuarioMeta: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
};

export default UsuariosTab;
