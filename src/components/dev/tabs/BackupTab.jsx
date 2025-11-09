
import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import AlertaBanner from '../shared/AlertaBanner';

function BackupTab() {
  const [formato, setFormato] = useState('json');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const exportarColecao = async (nomeColecao, nomeArquivo) => {
    try {
      setLoading(true);
      setMensagem({ tipo: 'info', texto: `Exportando ${nomeColecao}...` });

      const snapshot = await getDocs(collection(db, nomeColecao));
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (formato === 'json') {
        exportarJSON(dados, nomeArquivo);
      } else {
        exportarCSV(dados, nomeArquivo);
      }

      setMensagem({ 
        tipo: 'success', 
        texto: `✅ ${nomeColecao} exportado com sucesso! ${dados.length} registros.` 
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setMensagem({ 
        tipo: 'error', 
        texto: `❌ Erro ao exportar ${nomeColecao}: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarJSON = (dados, nomeArquivo) => {
    const dataStr = JSON.stringify(dados, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportarCSV = (dados, nomeArquivo) => {
    if (dados.length === 0) {
      setMensagem({ tipo: 'warning', texto: 'Nenhum dado para exportar' });
      return;
    }

    // Obter todas as chaves únicas
    const keys = Array.from(new Set(dados.flatMap(obj => Object.keys(obj))));
    
    // Criar cabeçalho
    const csvHeader = keys.join(',');
    
    // Criar linhas
    const csvRows = dados.map(obj => {
      return keys.map(key => {
        let value = obj[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') value = JSON.stringify(value);
        // Escapar vírgulas e aspas
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      }).join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportarTudo = async () => {
    try {
      setLoading(true);
      setMensagem({ tipo: 'info', texto: 'Iniciando backup completo...' });

      const colecoes = ['emendas', 'despesas', 'usuarios'];
      const backupCompleto = {};

      for (const nomeColecao of colecoes) {
        try {
          const snapshot = await getDocs(collection(db, nomeColecao));
          backupCompleto[nomeColecao] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (error) {
          console.warn(`Pulando coleção ${nomeColecao}:`, error.message);
          backupCompleto[nomeColecao] = [];
        }
      }
      
      // Tentar carregar auditLogs separadamente (pode falhar por permissões)
      try {
        const auditSnapshot = await getDocs(collection(db, 'auditLogs'));
        backupCompleto['auditLogs'] = auditSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.warn('AuditLogs não disponível:', error.message);
        backupCompleto['auditLogs'] = [];
      }

      const metadata = {
        dataBackup: new Date().toISOString(),
        versao: '2.3.78',
        totalRegistros: Object.values(backupCompleto).reduce((acc, arr) => acc + arr.length, 0)
      };

      const backupFinal = {
        metadata,
        dados: backupCompleto
      };

      const dataStr = JSON.stringify(backupFinal, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMensagem({ 
        tipo: 'success', 
        texto: `✅ Backup completo realizado! ${metadata.totalRegistros} registros exportados.` 
      });
    } catch (error) {
      console.error('Erro ao exportar tudo:', error);
      setMensagem({ 
        tipo: 'error', 
        texto: `❌ Erro ao criar backup completo: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-backup">
      <div className="tab-header">
        <h2>📥 Backup & Export</h2>
        <p className="tab-descricao">
          Exportar dados do sistema para backup ou análise externa.
        </p>
      </div>

      <AlertaBanner
        tipo="info"
        mensagem="Sempre faça backup antes de operações críticas no sistema."
      />

      {mensagem && (
        <AlertaBanner
          tipo={mensagem.tipo}
          mensagem={mensagem.texto}
        />
      )}

      <div className="backup-section">
        <h3>Formato de Exportação</h3>
        
        <div className="export-options">
          <label>
            <input
              type="radio"
              value="json"
              checked={formato === 'json'}
              onChange={(e) => setFormato(e.target.value)}
              disabled={loading}
            />
            JSON (estruturado, fácil restauração)
          </label>
          <label>
            <input
              type="radio"
              value="csv"
              checked={formato === 'csv'}
              onChange={(e) => setFormato(e.target.value)}
              disabled={loading}
            />
            CSV (planilha, análise em Excel)
          </label>
        </div>

        <h3>Exportar Coleções</h3>
        <div className="export-buttons">
          <button 
            className="btn-export" 
            onClick={() => exportarColecao('emendas', 'emendas')}
            disabled={loading}
          >
            {loading ? '⏳' : '📥'} Exportar Emendas
          </button>
          <button 
            className="btn-export" 
            onClick={() => exportarColecao('despesas', 'despesas')}
            disabled={loading}
          >
            {loading ? '⏳' : '📥'} Exportar Despesas
          </button>
          <button 
            className="btn-export" 
            onClick={() => exportarColecao('usuarios', 'usuarios')}
            disabled={loading}
          >
            {loading ? '⏳' : '📥'} Exportar Usuários
          </button>
          <button 
            className="btn-export" 
            onClick={() => exportarColecao('auditLogs', 'auditLogs')}
            disabled={loading}
          >
            {loading ? '⏳' : '📥'} Exportar Logs
          </button>
          <button 
            className="btn-export-all" 
            onClick={exportarTudo}
            disabled={loading}
          >
            {loading ? '⏳ Exportando...' : '📦 Exportar Backup Completo'}
          </button>
        </div>
      </div>

      <style>{`
        .backup-section {
          margin-top: 24px;
          padding: 24px;
          background: white;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .backup-section h3 {
          margin: 0 0 16px 0;
          color: #2d3748;
          font-size: 16px;
        }

        .export-options {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .export-options label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
        }

        .export-options input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .export-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .btn-export,
        .btn-export-all {
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .btn-export:hover:not(:disabled) {
          border-color: #2563eb;
          background: #eff6ff;
          transform: translateY(-1px);
        }

        .btn-export-all {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
          grid-column: 1 / -1;
          font-size: 15px;
        }

        .btn-export-all:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .btn-export:disabled,
        .btn-export-all:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}

export default BackupTab;
