import React, { useEffect } from "react";
import logoSicefsus from "../images/logo-sicefsus.png";

const Sobre = () => {
  // Hook local para título da página
  useEffect(() => {
    document.title = "Sobre - SICEFSUS";
    return () => {
      document.title = "SICEFSUS";
    };
  }, []);

  return (
    <>
      <div className="sobre-container">
        <div className="sobre-header">
          <img
            src={logoSicefsus}
            alt="SICEFSUS Logo"
            className="sobre-logo"
            onError={(e) => {
              e.target.src = "/logo-sigem.png"; // Fallback para logo antiga
            }}
          />
          <h1>SICEFSUS</h1>
          <p className="sobre-subtitle">
            Sistema de Controle de Emendas e Fiscalização do SUS
          </p>
        </div>

        <div className="sobre-content">
          <div className="sobre-section">
            <h2>📋 Sobre o Sistema</h2>
            <p>
              O SICEFSUS é um sistema completo para gestão e controle de emendas
              parlamentares destinadas ao Sistema Único de Saúde (SUS),
              desenvolvido para facilitar o acompanhamento, fiscalização e
              relatórios das aplicações de recursos públicos.
            </p>
          </div>

          <div className="sobre-section">
            <h2>🎯 Funcionalidades Principais</h2>
            <div className="funcionalidades-grid">
              <div className="funcionalidade-card">
                <h3>📊 Dashboard Executivo</h3>
                <p>
                  Visão geral com KPIs importantes, gráficos interativos e
                  alertas de vencimento.
                </p>
              </div>

              <div className="funcionalidade-card">
                <h3>📄 Gestão de Emendas</h3>
                <p>
                  Cadastro completo, acompanhamento de execução e controle de
                  documentos.
                </p>
              </div>

              <div className="funcionalidade-card">
                <h3>💰 Controle de Despesas</h3>
                <p>
                  Lançamento de despesas, itens de nota fiscal e acompanhamento
                  financeiro.
                </p>
              </div>

              <div className="funcionalidade-card">
                <h3>📈 Relatórios Gerenciais</h3>
                <p>
                  Relatórios detalhados com gráficos, filtros avançados e opção
                  de impressão.
                </p>
              </div>

              <div className="funcionalidade-card">
                <h3>🔍 Busca Global</h3>
                <p>
                  Busca inteligente em todos os módulos do sistema com filtros
                  avançados.
                </p>
              </div>

              <div className="funcionalidade-card">
                <h3>🔐 Controle de Acesso</h3>
                <p>
                  Sistema de autenticação e autorização com diferentes níveis de
                  permissão.
                </p>
              </div>
            </div>
          </div>

          <div className="sobre-section">
            <h2>🛠️ Tecnologias Utilizadas</h2>
            <div className="tech-stack">
              <div className="tech-item">
                <strong>Frontend:</strong> React 18 + React Router
              </div>
              <div className="tech-item">
                <strong>Backend:</strong> Firebase (Firestore + Auth)
              </div>
              <div className="tech-item">
                <strong>Gráficos:</strong> Recharts
              </div>
              <div className="tech-item">
                <strong>Estilos:</strong> CSS3 + Responsive Design
              </div>
            </div>
          </div>

          <div className="sobre-section">
            <h2>📊 Informações do Sistema</h2>
            <div className="sistema-info">
              <div className="info-item">
                <strong>Versão:</strong> 2.0.0
              </div>
              <div className="info-item">
                <strong>Última Atualização:</strong>{" "}
                {new Date().toLocaleDateString("pt-BR")}
              </div>
              <div className="info-item">
                <strong>Status:</strong>{" "}
                <span className="status-ativo">✅ Ativo</span>
              </div>
              <div className="info-item">
                <strong>Ambiente:</strong> Produção
              </div>
            </div>
          </div>

          <div className="sobre-section">
            <h2>👥 Suporte</h2>
            <p>
              Para suporte técnico ou dúvidas sobre o sistema, entre em contato
              com a equipe de desenvolvimento através dos canais oficiais.
            </p>
            <div className="suporte-info">
              <div className="suporte-item">
                <strong>📧 Email:</strong> suporte@sicefsus.gov.br
              </div>
              <div className="suporte-item">
                <strong>📞 Telefone:</strong> (61) 3000-0000
              </div>
              <div className="suporte-item">
                <strong>🕒 Horário:</strong> Segunda a Sexta, 8h às 18h
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sobre-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .sobre-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 20px;
          background: linear-gradient(135deg, #154360 0%, #4A90E2 100%);
          border-radius: 15px;
          color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .sobre-logo {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .sobre-header h1 {
          font-size: 3em;
          margin: 10px 0;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .sobre-subtitle {
          font-size: 1.2em;
          opacity: 0.9;
          margin: 0;
        }

        .sobre-content {
          display: grid;
          gap: 30px;
        }

        .sobre-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
        }

        .sobre-section h2 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: 1.8em;
          font-weight: 600;
          border-bottom: 3px solid #4A90E2;
          padding-bottom: 10px;
        }

        .funcionalidades-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .funcionalidade-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #4A90E2;
          transition: transform 0.2s ease;
        }

        .funcionalidade-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .funcionalidade-card h3 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .funcionalidade-card p {
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        .tech-stack {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .tech-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #28a745;
        }

        .sistema-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .info-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #154360;
        }

        .status-ativo {
          color: #28a745;
          font-weight: 600;
        }

        .suporte-info {
          margin-top: 20px;
          display: grid;
          gap: 10px;
        }

        .suporte-item {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid #154360;
        }

        @media (max-width: 768px) {
          .sobre-container {
            padding: 10px;
          }

          .sobre-header h1 {
            font-size: 2.2em;
          }

          .funcionalidades-grid {
            grid-template-columns: 1fr;
          }

          .sobre-section {
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default Sobre;
