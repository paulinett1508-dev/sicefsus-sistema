import React from 'react';

function UsuariosTab() {
  return (
    <div className="tab-usuarios">
      <div className="tab-header">
        <h2>👥 Gerenciamento de Usuários</h2>
        <p className="tab-descricao">
          Ferramentas avançadas para gerenciar usuários do sistema.
        </p>
      </div>

      <div className="ferramentas-usuarios">
        <div className="ferramenta-usuario">
          <div className="usuario-icone">🔐</div>
          <h3>Resetar Senhas em Massa</h3>
          <p>Enviar email de redefinição para múltiplos usuários</p>
          <button disabled>Em breve</button>
        </div>

        <div className="ferramenta-usuario">
          <div className="usuario-icone">🚫</div>
          <h3>Suspender/Reativar</h3>
          <p>Gerenciar status de usuários em lote</p>
          <button disabled>Em breve</button>
        </div>

        <div className="ferramenta-usuario">
          <div className="usuario-icone">📊</div>
          <h3>Auditoria de Acesso</h3>
          <p>Logs de login e ações dos usuários</p>
          <button disabled>Em breve</button>
        </div>

        <div className="ferramenta-usuario">
          <div className="usuario-icone">👑</div>
          <h3>Promover/Rebaixar</h3>
          <p>Alterar permissões (operador ↔ admin)</p>
          <button disabled>Em breve</button>
        </div>

        <div className="ferramenta-usuario">
          <div className="usuario-icone">📈</div>
          <h3>Usuários Mais Ativos</h3>
          <p>Ranking por atividade no sistema</p>
          <button disabled>Em breve</button>
        </div>

        <div className="ferramenta-usuario">
          <div className="usuario-icone">⏰</div>
          <h3>Horários de Pico</h3>
          <p>Análise de uso por período</p>
          <button disabled>Em breve</button>
        </div>
      </div>

      <style jsx>{`
        .ferramentas-usuarios {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }

        .ferramenta-usuario {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          text-align: center;
          transition: all 0.3s ease;
        }

        .ferramenta-usuario:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          transform: translateY(-4px);
        }

        .usuario-icone {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .ferramenta-usuario h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #2d3748;
        }

        .ferramenta-usuario p {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #718096;
          min-height: 40px;
        }

        .ferramenta-usuario button {
          padding: 10px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .ferramenta-usuario button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default UsuariosTab;
