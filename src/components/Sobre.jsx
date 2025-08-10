import React, { useEffect } from "react";
import logoSicefsus from "../images/logo-sicefsus.png";
import logoAraujoInfo from "../images/logoaraujoinfo.png";
import logoSopro from "../images/logo-sopro.jpeg"; // Importando a logo SOPRO

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
            <h2>📊 Informações do Sistema</h2>
            <div className="sistema-info">
              <div className="info-item">
                <strong>Versão:</strong> 2.1.0
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
              com nossa equipe especializada através dos canais oficiais.
            </p>

            <div className="suporte-empresa">
              <img
                src={logoAraujoInfo}
                alt="Araujo Informática Logo"
                className="suporte-logo"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="suporte-empresa-info">
                <h3 className="empresa-nome">
                  Araujo Informática e Soluções Cloud
                </h3>
                <p className="empresa-descricao">
                  Especialistas em soluções tecnológicas para o setor público
                </p>
              </div>
            </div>

            <div className="suporte-info">
              <div className="suporte-item">
                <strong>📱 WhatsApp:</strong>
                <a
                  href="https://wa.me/5589944452244"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="suporte-link whatsapp-link"
                >
                  +55 89 9444-5244
                </a>
              </div>
              <div className="suporte-item">
                <strong>📧 Instagram:</strong>
                <a
                  href="https://instagram.com/araujoinformatica.flo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="suporte-link instagram-link"
                >
                  @araujoinformatica.flo
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="sobre-footer">
          <div className="footer-content">
            {import.meta.env.MODE === 'production' ? (
              // MODO PRODUÇÃO - Logo SOPRO + Texto desenvolvido por
              <>
                <img
                  src={logoSopro}
                  alt="SOPRO Logo"
                  className="sopro-logo"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="footer-text-container">
                  <p className="sobre-footer-text">
                    Desenvolvido por SOPRO - Solution Provider
                  </p>
                  <p className="sobre-footer-text" style={{fontSize: '0.8em', marginTop: '4px', opacity: 0.8}}>
                    © 2025 - Todos os direitos reservados
                  </p>
                </div>
              </>
            ) : (
              // MODO DESENVOLVIMENTO - Logo oculta + Texto original
              <p className="sobre-footer-text">
                © 2025 SICEFSUS - Sistema de Controle de Emendas e Fiscalização do SUS
              </p>
            )}
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

        .suporte-empresa {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 25px 0;
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border-radius: 12px;
          border: 2px solid #e9ecef;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .suporte-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          background: white;
          padding: 8px;
        }

        .suporte-empresa-info {
          flex: 1;
        }

        .empresa-nome {
          font-size: 1.4em;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        .empresa-descricao {
          font-size: 0.95em;
          color: #666;
          margin: 0;
          font-style: italic;
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

        .suporte-link {
          color: #154360;
          text-decoration: none;
          font-weight: 500;
          margin-left: 8px;
          transition: all 0.3s ease;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }

        .suporte-link:hover {
          color: white;
          text-decoration: none;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .whatsapp-link:hover {
          background: #25D366;
        }

        .instagram-link:hover {
          background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
        }

        .sobre-footer {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #dee2e6;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .sopro-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
          border-radius: 10px;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .sopro-logo:hover {
          opacity: 1;
        }

        .sobre-footer-text {
          margin: 0;
          color: #666;
          font-size: 0.9em;
          font-weight: 500;
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

          .suporte-empresa {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .suporte-logo {
            width: 60px;
            height: 60px;
          }

          .empresa-nome {
            font-size: 1.2em;
          }

          .footer-content {
            flex-direction: column;
            gap: 8px;
          }

          .sopro-logo {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </>
  );
};

export default Sobre;