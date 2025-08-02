import React, { useState } from "react";

const InformacoesComplementares = ({
  formData = {},
  setFormData,
  errors = {},
}) => {
  const [activeTab, setActiveTab] = useState("beneficiario");

  const handleChange = (field, value) => {
    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const tabs = [
    {
      id: "beneficiario",
      label: "Informações Adicionais do Beneficiário",
      icon: "🏢",
    },
    {
      id: "complementares",
      label: "Informações Complementares",
      icon: "📋",
    },
  ];

  return (
    <div className="informacoes-section">
      <div className="section-header">
        <h3 className="section-title">
          <span className="section-icon">📝</span>
          Informações Finais
        </h3>
        <p className="section-description">
          Complete os dados adicionais necessários para a emenda
        </p>
      </div>

      {/* Navegação por abas */}
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      <div className="tab-content">
        {activeTab === "beneficiario" && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4 className="panel-title">
                🏢 Informações Adicionais do Beneficiário
              </h4>
              <p className="panel-description">
                Dados complementares sobre a entidade beneficiária
              </p>
            </div>

            <div className="form-grid">
              {/* Área de Atuação */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Área de Atuação Principal *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <select
                    className={`form-input ${errors.areaAtuacao ? "error" : ""}`}
                    value={formData.areaAtuacao || ""}
                    onChange={(e) =>
                      handleChange("areaAtuacao", e.target.value)
                    }
                  >
                    <option value="">Selecione a área</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="assistencia-social">
                      Assistência Social
                    </option>
                    <option value="esporte-lazer">Esporte e Lazer</option>
                    <option value="cultura">Cultura</option>
                    <option value="meio-ambiente">Meio Ambiente</option>
                    <option value="infraestrutura">Infraestrutura</option>
                    <option value="desenvolvimento-social">
                      Desenvolvimento Social
                    </option>
                    <option value="outros">Outros</option>
                  </select>
                  {errors.areaAtuacao && (
                    <span className="error-message">{errors.areaAtuacao}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Tempo de Funcionamento</label>
                  <select
                    className="form-input"
                    value={formData.tempoFuncionamento || ""}
                    onChange={(e) =>
                      handleChange("tempoFuncionamento", e.target.value)
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="menos-1-ano">Menos de 1 ano</option>
                    <option value="1-2-anos">1 a 2 anos</option>
                    <option value="3-5-anos">3 a 5 anos</option>
                    <option value="6-10-anos">6 a 10 anos</option>
                    <option value="mais-10-anos">Mais de 10 anos</option>
                  </select>
                </div>
              </div>

              {/* Dados de Contato */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Telefone Institucional *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-input ${errors.telefone ? "error" : ""}`}
                    value={formData.telefone || ""}
                    onChange={(e) => {
                      const tel = e.target.value
                        .replace(/\D/g, "")
                        .replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
                      handleChange("telefone", tel);
                    }}
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                  />
                  {errors.telefone && (
                    <span className="error-message">{errors.telefone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    E-mail Institucional *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <input
                    type="email"
                    className={`form-input ${errors.emailInstitucional ? "error" : ""}`}
                    value={formData.emailInstitucional || ""}
                    onChange={(e) =>
                      handleChange("emailInstitucional", e.target.value)
                    }
                    placeholder="contato@entidade.org.br"
                  />
                  {errors.emailInstitucional && (
                    <span className="error-message">
                      {errors.emailInstitucional}
                    </span>
                  )}
                </div>
              </div>

              {/* Site e Redes Sociais */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Website/Portal</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.website || ""}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.entidade.org.br"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Redes Sociais</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.redesSociais || ""}
                    onChange={(e) =>
                      handleChange("redesSociais", e.target.value)
                    }
                    placeholder="@entidade ou links das redes"
                  />
                </div>
              </div>

              {/* Descrição da Entidade */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">
                    Descrição da Entidade *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <textarea
                    className={`form-textarea ${errors.descricaoEntidade ? "error" : ""}`}
                    value={formData.descricaoEntidade || ""}
                    onChange={(e) =>
                      handleChange("descricaoEntidade", e.target.value)
                    }
                    placeholder="Descreva a missão, objetivos e principais atividades da entidade..."
                    rows="4"
                    maxLength="1000"
                  />
                  <div className="character-count">
                    {(formData.descricaoEntidade || "").length}/1000 caracteres
                  </div>
                  {errors.descricaoEntidade && (
                    <span className="error-message">
                      {errors.descricaoEntidade}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "complementares" && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4 className="panel-title">📋 Informações Complementares</h4>
              <p className="panel-description">
                Dados adicionais sobre a execução da emenda
              </p>
            </div>

            <div className="form-grid">
              {/* Classificação e Prioridade */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Prioridade da Emenda *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <select
                    className={`form-input ${errors.prioridade ? "error" : ""}`}
                    value={formData.prioridade || ""}
                    onChange={(e) => handleChange("prioridade", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                  {errors.prioridade && (
                    <span className="error-message">{errors.prioridade}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Modalidade de Aplicação *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <select
                    className={`form-input ${errors.modalidadeAplicacao ? "error" : ""}`}
                    value={formData.modalidadeAplicacao || ""}
                    onChange={(e) =>
                      handleChange("modalidadeAplicacao", e.target.value)
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="transferencia-direta">
                      Transferência Direta
                    </option>
                    <option value="convenio">Convênio</option>
                    <option value="termo-parceria">Termo de Parceria</option>
                    <option value="contrato-repasse">
                      Contrato de Repasse
                    </option>
                  </select>
                  {errors.modalidadeAplicacao && (
                    <span className="error-message">
                      {errors.modalidadeAplicacao}
                    </span>
                  )}
                </div>
              </div>

              {/* Público Beneficiado */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Público-Alvo Beneficiado *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.publicoAlvo ? "error" : ""}`}
                    value={formData.publicoAlvo || ""}
                    onChange={(e) =>
                      handleChange("publicoAlvo", e.target.value)
                    }
                    placeholder="Ex: Crianças de 0 a 6 anos, Idosos, População em geral..."
                  />
                  {errors.publicoAlvo && (
                    <span className="error-message">{errors.publicoAlvo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Número de Beneficiários Estimado
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.numeroBeneficiarios || ""}
                    onChange={(e) =>
                      handleChange("numeroBeneficiarios", e.target.value)
                    }
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>

              {/* Indicadores e Resultados */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">
                    Indicadores de Resultado Esperado *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <textarea
                    className={`form-textarea ${errors.indicadoresResultado ? "error" : ""}`}
                    value={formData.indicadoresResultado || ""}
                    onChange={(e) =>
                      handleChange("indicadoresResultado", e.target.value)
                    }
                    placeholder="Descreva os resultados esperados e como serão medidos..."
                    rows="3"
                    maxLength="800"
                  />
                  <div className="character-count">
                    {(formData.indicadoresResultado || "").length}/800
                    caracteres
                  </div>
                  {errors.indicadoresResultado && (
                    <span className="error-message">
                      {errors.indicadoresResultado}
                    </span>
                  )}
                </div>
              </div>

              {/* Justificativa */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">
                    Justificativa da Emenda *
                    <span className="required-indicator">obrigatório</span>
                  </label>
                  <textarea
                    className={`form-textarea ${errors.justificativa ? "error" : ""}`}
                    value={formData.justificativa || ""}
                    onChange={(e) =>
                      handleChange("justificativa", e.target.value)
                    }
                    placeholder="Justifique a necessidade e importância desta emenda..."
                    rows="4"
                    maxLength="1200"
                  />
                  <div className="character-count">
                    {(formData.justificativa || "").length}/1200 caracteres
                  </div>
                  {errors.justificativa && (
                    <span className="error-message">
                      {errors.justificativa}
                    </span>
                  )}
                </div>
              </div>

              {/* Observações Finais */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Observações Adicionais</label>
                  <textarea
                    className="form-textarea"
                    value={formData.observacoesFinais || ""}
                    onChange={(e) =>
                      handleChange("observacoesFinais", e.target.value)
                    }
                    placeholder="Informações complementares que julgar necessárias..."
                    rows="3"
                    maxLength="500"
                  />
                  <div className="character-count">
                    {(formData.observacoesFinais || "").length}/500 caracteres
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .informacoes-section {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          margin-bottom: 1.5rem;
        }

        .section-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.4rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 0.5rem 0;
        }

        .section-icon {
          font-size: 1.5rem;
        }

        .section-description {
          color: #4a5568;
          margin: 0;
          font-size: 0.95rem;
        }

        .tabs-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          color: #4a5568;
          border-radius: 8px 8px 0 0;
        }

        .tab-button:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .tab-button.active {
          background: #edf2f7;
          color: #2d3748;
          border-bottom-color: #4299e1;
          font-weight: 600;
        }

        .tab-icon {
          font-size: 1.1rem;
        }

        .tab-label {
          font-size: 0.9rem;
        }

        .tab-content {
          background: #f7fafc;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .tab-panel {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .panel-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .panel-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 0.5rem 0;
        }

        .panel-description {
          color: #4a5568;
          margin: 0;
          font-size: 0.9rem;
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-weight: 600;
          color: #2d3748;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .required-indicator {
          font-size: 0.75rem;
          color: #e53e3e;
          font-weight: 400;
          background: #fed7d7;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #fff;
        }

        .form-input:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .form-input.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }

        .form-textarea {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
          background: #fff;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .form-textarea.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }

        .character-count {
          text-align: right;
          font-size: 0.8rem;
          color: #718096;
          margin-top: 0.25rem;
        }

        .error-message {
          color: #e53e3e;
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .error-message::before {
          content: "⚠️";
          font-size: 0.7rem;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .informacoes-section {
            padding: 1.5rem;
          }

          .tabs-container {
            flex-direction: column;
          }

          .tab-button {
            justify-content: flex-start;
            border-radius: 6px;
            border-bottom: none;
            border-left: 3px solid transparent;
          }

          .tab-button.active {
            border-left-color: #4299e1;
            border-bottom: none;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .tab-content {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 1.2rem;
          }

          .tab-label {
            font-size: 0.85rem;
          }

          .panel-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default InformacoesComplementares;
