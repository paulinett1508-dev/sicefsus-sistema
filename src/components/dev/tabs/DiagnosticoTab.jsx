import React from 'react';

/**
 * ABA: DIAGNÓSTICO DO SISTEMA
 * 
 * INSTRUÇÕES PARA INTEGRAÇÃO:
 * 
 * Se o componente DiagnosticoSistema.jsx JÁ EXISTE no projeto:
 * 1. Importe: import DiagnosticoSistema from '../DiagnosticoSistema';
 * 2. Substitua o conteúdo do return por: <DiagnosticoSistema />
 * 
 * Se NÃO existe:
 * 1. Este placeholder mostra uma interface básica
 * 2. Implemente a lógica de diagnóstico aqui mesmo
 */
function DiagnosticoTab() {
  // VERSÃO PLACEHOLDER - Substituir quando integrar componente real
  
  const problemas = [
    { id: 1, tipo: 'CRÍTICO', emenda: 'Emenda XYZ', descricao: 'Saldo negativo detectado', severidade: 'alta' },
    { id: 2, tipo: 'AVISO', emenda: 'Emenda ABC', descricao: 'Despesa sem documentação', severidade: 'media' },
  ];

  return (
    <div className="tab-diagnostico">
      <div className="tab-header">
        <h2>🔍 Diagnóstico do Sistema</h2>
        <p className="tab-descricao">
          Identifica inconsistências, erros e problemas nos dados do sistema.
        </p>
      </div>

      <div className="diagnostico-acoes">
        <button className="btn-diagnostico primario">
          🔍 Executar Diagnóstico Completo
        </button>
        <button className="btn-diagnostico secundario">
          📊 Ver Últimos Resultados
        </button>
      </div>

      <div className="diagnostico-resultados">
        <h3>Problemas Identificados</h3>
        
        {problemas.length === 0 ? (
          <div className="sem-problemas">
            <span className="icone-sucesso">✅</span>
            <p>Nenhum problema encontrado!</p>
          </div>
        ) : (
          <div className="problemas-lista">
            {problemas.map((problema) => (
              <div key={problema.id} className={`problema-item ${problema.severidade}`}>
                <div className="problema-badge">{problema.tipo}</div>
                <div className="problema-conteudo">
                  <div className="problema-titulo">{problema.emenda}</div>
                  <div className="problema-descricao">{problema.descricao}</div>
                </div>
                <button className="btn-corrigir">Corrigir</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="diagnostico-info">
        <p>
          ℹ️ <strong>Nota:</strong> Este é um placeholder. Para usar o componente completo,
          importe <code>DiagnosticoSistema.jsx</code> se ele já existir no projeto.
        </p>
      </div>

      <style jsx>{`
        .diagnostico-acoes {
          display: flex;
          gap: 12px;
          margin: 24px 0;
        }

        .btn-diagnostico {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-diagnostico.primario {
          background: #667eea;
          color: white;
        }

        .btn-diagnostico.primario:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-diagnostico.secundario {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-diagnostico.secundario:hover {
          background: #f7fafc;
        }

        .diagnostico-resultados {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .diagnostico-resultados h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #2d3748;
        }

        .sem-problemas {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          border-radius: 8px;
          background: linear-gradient(135deg, #48bb7822 0%, #38a16922 100%);
        }

        .icone-sucesso {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .sem-problemas p {
          margin: 0;
          font-size: 16px;
          color: #2d3748;
          font-weight: 600;
        }

        .problemas-lista {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .problema-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid;
          background: #f7fafc;
        }

        .problema-item.alta {
          border-left-color: #f56565;
          background: #fff5f5;
        }

        .problema-item.media {
          border-left-color: #ffc107;
          background: #fffbeb;
        }

        .problema-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          background: #e2e8f0;
          color: #2d3748;
          white-space: nowrap;
        }

        .problema-conteudo {
          flex: 1;
        }

        .problema-titulo {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .problema-descricao {
          font-size: 13px;
          color: #718096;
        }

        .btn-corrigir {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-corrigir:hover {
          background: #5568d3;
        }

        .diagnostico-info {
          margin-top: 20px;
          padding: 16px;
          background: #e6f7ff;
          border-radius: 8px;
          border-left: 4px solid #4299e1;
        }

        .diagnostico-info p {
          margin: 0;
          font-size: 13px;
          color: #2d3748;
          line-height: 1.6;
        }

        .diagnostico-info code {
          background: #cbd5e0;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default DiagnosticoTab;
