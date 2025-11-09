import React, { useEffect } from "react";
import logoSicefsus from "../images/logo-sicefsus.png";
import logoAraujoInfo from "../images/logoaraujoinfo.png";
import { useVersion } from "../hooks/useVersion";

const Sobre = () => {
  const { version, loading } = useVersion();

  useEffect(() => {
    document.title = "Sobre - SICEFSUS";
    return () => {
      document.title = "SICEFSUS";
    };
  }, []);

  return (
    <>
      <div className="sobre-container">
        {/* Header Clean - Sem Banner */}
        <div className="sobre-header">
          <div className="header-content">
            <img
              src={logoSicefsus}
              alt="SICEFSUS Logo"
              className="sobre-logo"
              onError={(e) => {
                e.target.src = "/logo-sigem.png";
              }}
            />
            <div className="header-info">
              <h1>SICEFSUS</h1>
              <p className="sobre-subtitle">
                Sistema de Controle de Emendas e Fiscalização do SUS
              </p>
              <div className="version-info">
                <span className="version-badge">
                  {loading ? "..." : `v${version}`}
                </span>
                <span className="status-badge">✅ Ativo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="sobre-content">
          {/* Sobre + Sistema Info - Side by Side */}
          <div className="intro-section">
            <div className="about-card">
              <h2>📋 Sobre o Sistema</h2>
              <p>
                Sistema completo para gestão e controle de emendas parlamentares
                destinadas ao SUS, desenvolvido para facilitar o acompanhamento,
                fiscalização e relatórios das aplicações de recursos públicos.
              </p>
            </div>

            <div className="system-info-card">
              <h2>📊 Informações do Sistema</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Versão</span>
                  <span className="info-value">
                    {loading ? "..." : `v${version}`}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Última Atualização</span>
                  <span className="info-value">
                    {new Date().toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ambiente</span>
                  <span className="info-value">Produção</span>
                </div>
              </div>
            </div>
          </div>

          {/* Funcionalidades Compactas */}
          <div className="features-section">
            <h2>🎯 Funcionalidades Principais</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <div className="feature-content">
                  <h3>Dashboard Executivo</h3>
                  <p>
                    KPIs importantes, gráficos interativos e alertas de
                    vencimento
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📄</div>
                <div className="feature-content">
                  <h3>Gestão de Emendas</h3>
                  <p>
                    Cadastro completo, acompanhamento e controle de documentos
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <div className="feature-content">
                  <h3>Controle de Despesas</h3>
                  <p>
                    Lançamento de despesas, notas fiscais e acompanhamento
                    financeiro
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <div className="feature-content">
                  <h3>Relatórios Gerenciais</h3>
                  <p>Relatórios detalhados com gráficos e filtros avançados</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <div className="feature-content">
                  <h3>Busca Global</h3>
                  <p>
                    Busca inteligente em todos os módulos com filtros avançados
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <div className="feature-content">
                  <h3>Controle de Acesso</h3>
                  <p>
                    Autenticação e autorização com diferentes níveis de
                    permissão
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Suporte Técnico - Reorganizado */}
          <div className="support-section">
            <h2>💥 Suporte Técnico</h2>
            <div className="support-unified">
              <div className="support-header">
                <img
                  src={logoAraujoInfo}
                  alt="Araujo Informática Logo"
                  className="company-logo"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="company-details">
                  <h3>Araujo Informática e Soluções Cloud</h3>
                  <p>
                    Especialistas em soluções tecnológicas para o setor público
                  </p>
                </div>
              </div>

              <div className="contact-methods">
                <div className="contact-item">
                  <div className="contact-header">
                    <span className="contact-icon">📱</span>
                    <span className="contact-type">WhatsApp</span>
                  </div>
                  <a
                    href="https://wa.me/5589944452244"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link whatsapp"
                  >
                    +55 89 9444-5244
                  </a>
                </div>

                <div className="contact-item">
                  <div className="contact-header">
                    <span className="contact-icon">📧</span>
                    <span className="contact-type">Instagram</span>
                  </div>
                  <a
                    href="https://instagram.com/araujoinformatica.flo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link instagram"
                  >
                    @araujoinformatica.flo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Limpo */}
        <div className="sobre-footer">
          <div className="footer-content">
            <span>
              © 2025 SICEFSUS - Sistema de Controle de Emendas e Fiscalização
              do SUS
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .sobre-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #2c3e50;
          line-height: 1.5;
        }

        /* Header Clean - Sem Banner Azul */
        .sobre-header {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex; /* Changed from original */
          flex-direction: column; /* Changed from original */
          align-items: center; /* Changed from original */
        }

        .header-content {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }

        .sobre-logo {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          flex-shrink: 0;
          object-fit: contain;
          background: white;
          padding: 4px;
        }

        .header-info {
          flex: 1;
        }

        .header-info h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 6px 0;
          color: #154360;
          letter-spacing: -0.025em;
        }

        .sobre-subtitle {
          font-size: 1rem;
          margin: 0 0 12px 0;
          font-weight: 400;
          color: #64748b;
          line-height: 1.5;
        }

        .version-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .version-badge {
          background: #f0f7ff;
          color: #154360;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid #b8deff;
        }

        .status-badge {
          background: #ecfdf5;
          color: #059669;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid #a7f3d0;
        }

        /* Content Grid */
        .sobre-content {
          display: grid;
          gap: 20px;
        }

        /* Intro Section */
        .intro-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .about-card, .system-info-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .about-card h2, .system-info-card h2 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #154360;
        }

        .about-card p {
          font-size: 0.9rem;
          margin: 0;
          color: #4b5563;
          line-height: 1.6;
        }

        .info-grid {
          display: grid;
          gap: 8px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
        }

        .info-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1f2937;
        }

        /* Features Section */
        .features-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .features-section h2 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #154360;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }

        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          border-color: #154360;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(21, 67, 96, 0.15);
        }

        .feature-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature-content h3 {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #154360;
        }

        .feature-content p {
          font-size: 0.8rem;
          margin: 0;
          color: #64748b;
          line-height: 1.5;
        }

        /* Support Section - Reorganizado */
        .support-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .support-section h2 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #154360;
        }

        .support-unified {
          display: grid;
          gap: 20px;
        }

        .support-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .company-logo {
          width: 50px;
          height: 50px;
          object-fit: contain;
          border-radius: 8px;
          background: white;
          padding: 4px;
          border: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .company-details h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #154360;
        }

        .company-details p {
          font-size: 0.85rem;
          margin: 0;
          color: #64748b;
        }

        .contact-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .contact-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          display: grid;
          gap: 8px;
        }

        .contact-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .contact-icon {
          font-size: 1rem;
        }

        .contact-type {
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
        }

        .contact-link {
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
          text-align: center;
          border: 1px solid transparent;
        }

        .contact-link.whatsapp {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .contact-link.whatsapp:hover {
          background: #059669;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }

        .contact-link.instagram {
          color: #e11d48;
          background: #fdf2f8;
          border-color: #fbbf24;
        }

        .contact-link.instagram:hover {
          background: linear-gradient(45deg, #f09433, #e6683c);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
        }

        /* Footer Limpo */
        .sobre-footer {
          margin-top: 24px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          text-align: center;
        }

        .footer-content {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sobre-container {
            padding: 12px;
          }

          .header-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
          }

          .intro-section {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .support-header {
            flex-direction: column;
            text-align: center;
          }

          .contact-methods {
            grid-template-columns: 1fr;
          }

          .footer-content {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .header-info h1 {
            font-size: 1.75rem;
          }

          .sobre-subtitle {
            font-size: 0.85rem;
          }

          .version-info {
            justify-content: center;
          }

          .feature-card {
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default Sobre;