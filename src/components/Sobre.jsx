import React, { useEffect } from "react";
import logoSicefsusLight from "../images/logo-sicefsus-ver-modoclaro.png";
import logoSicefsusDark from "../images/logo-sicefsus-ver-mododark.png";
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
        {/* Header com Logo */}
        <div className="sobre-header">
          <div className="header-logo-title">
            <img
              src={logoSicefsusLight}
              alt="SICEFSUS Logo"
              className="sobre-logo sobre-logo-light"
            />
            <img
              src={logoSicefsusDark}
              alt="SICEFSUS Logo"
              className="sobre-logo sobre-logo-dark"
            />
            <span className="header-title">SICEFSUS</span>
          </div>
          <p className="sobre-subtitle">
            Sistema de Controle de Emendas e Fiscalização do SUS
          </p>
          <div className="version-info">
            <span className="version-badge">
              {loading ? "..." : `v${version}`}
            </span>
            <span className="status-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>check_circle</span>
              Ativo
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="sobre-content">
          {/* Sobre + Sistema Info - Side by Side */}
          <div className="intro-section">
            <div className="sobre-card">
              <h2>
                <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: "middle", marginRight: 8 }}>description</span>
                Sobre o Sistema
              </h2>
              <p>
                Sistema completo para gestão e controle de emendas parlamentares
                destinadas ao SUS, desenvolvido para facilitar o acompanhamento,
                fiscalização e relatórios das aplicações de recursos públicos.
              </p>
            </div>

            <div className="sobre-card">
              <h2>
                <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: "middle", marginRight: 8 }}>analytics</span>
                Informações do Sistema
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Versão</span>
                  <span className="info-value mono">
                    {loading ? "..." : `v${version}`}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Última Atualização</span>
                  <span className="info-value">
                    {new Date().toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="info-item no-border">
                  <span className="info-label">Ambiente</span>
                  <span className="info-value ambiente">
                    <span className="status-dot"></span>
                    Produção
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="sobre-card">
            <h2>
              <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: "middle", marginRight: 8 }}>stars</span>
              Funcionalidades Principais
            </h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">dashboard</span>
                </div>
                <div className="feature-content">
                  <h3>Dashboard Executivo</h3>
                  <p>KPIs importantes, gráficos interativos e alertas de vencimento</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">assignment</span>
                </div>
                <div className="feature-content">
                  <h3>Gestão de Emendas</h3>
                  <p>Cadastro completo, acompanhamento e controle de documentos</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">attach_money</span>
                </div>
                <div className="feature-content">
                  <h3>Controle de Despesas</h3>
                  <p>Lançamento de despesas, notas fiscais e acompanhamento financeiro</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div className="feature-content">
                  <h3>Relatórios Gerenciais</h3>
                  <p>Relatórios detalhados com gráficos e filtros avançados</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <div className="feature-content">
                  <h3>Busca Global</h3>
                  <p>Busca inteligente em todos os módulos com filtros avançados</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div className="feature-content">
                  <h3>Controle de Acesso</h3>
                  <p>Autenticação e autorização com diferentes níveis de permissão</p>
                </div>
              </div>
            </div>
          </div>

          {/* Suporte Técnico */}
          <div className="sobre-card">
            <h2>
              <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: "middle", marginRight: 8 }}>headset_mic</span>
              Suporte Técnico
            </h2>
            <div className="support-box">
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
                <p>Especialistas em soluções tecnológicas para o setor público</p>
                <a
                  href="https://wa.me/5589944452244"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-link"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>phone</span>
                  +55 89 9444-5244
                </a>
              </div>
            </div>
          </div>

          {/* LGPD e Privacidade */}
          <div className="sobre-card">
            <h2>
              <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: "middle", marginRight: 8 }}>shield</span>
              LGPD e Privacidade
            </h2>
            <div className="lgpd-info">
              <p>
                O SICEFSUS trata dados em conformidade com a <strong>Lei 13.709/2018 (LGPD)</strong>,
                fundamentado no Art. 7º, III — execucao de politicas publicas.
              </p>
              <ul className="lgpd-list">
                <li>Coletamos apenas dados necessarios para a gestao orcamentaria</li>
                <li>Nao comercializamos ou compartilhamos dados sem base legal</li>
                <li>Logs de auditoria imutaveis garantem rastreabilidade</li>
                <li>Voce pode solicitar acesso, correcao ou exclusao dos seus dados</li>
              </ul>
              <p className="lgpd-contact">
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>mail</span>
                Duvidas sobre privacidade? Contate o administrador do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sobre-container {
          min-height: 100vh;
          background: var(--theme-bg);
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--theme-text);
          line-height: 1.5;
        }

        /* Header */
        .sobre-header {
          background: var(--theme-surface);
          border: 1px solid var(--theme-border);
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .header-logo-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .sobre-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .sobre-logo-light {
          display: block;
        }

        .sobre-logo-dark {
          display: none;
        }

        [data-theme="dark"] .sobre-logo-light {
          display: none;
        }

        [data-theme="dark"] .sobre-logo-dark {
          display: block;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.02em;
        }

        .sobre-subtitle {
          font-size: 0.9rem;
          margin: 0 0 12px 0;
          font-weight: 400;
          color: var(--theme-text-secondary);
        }

        .version-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .version-badge {
          background: rgba(26, 58, 74, 0.1);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid rgba(26, 58, 74, 0.2);
        }

        .status-badge {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.2);
          display: flex;
          align-items: center;
        }

        /* Content Grid */
        .sobre-content {
          display: grid;
          gap: 16px;
        }

        /* Intro Section */
        .intro-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Cards */
        .sobre-card {
          background: var(--theme-surface);
          border: 1px solid var(--theme-border);
          border-radius: 10px;
          padding: 16px 20px;
        }

        .sobre-card h2 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: var(--primary);
          display: flex;
          align-items: center;
        }

        .sobre-card > p {
          font-size: 0.85rem;
          margin: 0;
          color: var(--theme-text-secondary);
          line-height: 1.6;
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          gap: 0;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--theme-border-light);
        }

        .info-item.no-border {
          border-bottom: none;
        }

        .info-label {
          font-size: 0.875rem;
          color: var(--theme-text-secondary);
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--theme-text);
        }

        .info-value.mono {
          font-family: monospace;
        }

        .info-value.ambiente {
          color: var(--success);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success);
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }

        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: var(--theme-surface-secondary);
          border: 1px solid var(--theme-border-light);
          border-radius: 8px;
        }

        .feature-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--theme-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .feature-icon .material-symbols-outlined {
          font-size: 18px;
        }

        .feature-content h3 {
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0 0 2px 0;
          color: var(--theme-text);
        }

        .feature-content p {
          font-size: 0.75rem;
          margin: 0;
          color: var(--theme-text-secondary);
          line-height: 1.4;
        }

        /* Support Box */
        .support-box {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--theme-surface-secondary);
          border: 1px solid var(--theme-border-light);
          border-radius: 8px;
        }

        .company-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
          border-radius: 50%;
          background: var(--theme-surface);
          flex-shrink: 0;
        }

        .company-details h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0 0 2px 0;
          color: var(--primary);
        }

        .company-details p {
          font-size: 0.8rem;
          margin: 0 0 8px 0;
          color: var(--theme-text-secondary);
        }

        .whatsapp-link {
          display: inline-flex;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--success);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .whatsapp-link:hover {
          color: var(--success-dark);
          text-decoration: underline;
        }

        .lgpd-info p {
          font-size: 0.9rem;
          color: var(--theme-text-secondary);
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .lgpd-list {
          list-style: none;
          padding: 0;
          margin: 0 0 16px 0;
        }

        .lgpd-list li {
          font-size: 0.85rem;
          color: var(--theme-text-secondary);
          padding: 6px 0 6px 20px;
          position: relative;
        }

        .lgpd-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--success);
          font-weight: bold;
        }

        .lgpd-contact {
          font-size: 0.8rem;
          color: var(--theme-text-muted);
          padding-top: 12px;
          border-top: 1px solid var(--theme-border);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sobre-container {
            padding: 16px;
          }

          .sobre-header {
            padding: 24px 16px;
          }

          .header-content {
            flex-direction: column;
          }

          .header-title {
            font-size: 1.75rem;
          }

          .intro-section {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .support-box {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
};

export default Sobre;
