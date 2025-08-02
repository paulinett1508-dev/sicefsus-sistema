import React, { useState } from "react";

const DadosBancarios = ({ formData = {}, setFormData, errors = {} }) => {
  const [mostrarBancos, setMostrarBancos] = useState(false);

  const bancosComuns = [
    { codigo: "001", nome: "Banco do Brasil S.A." },
    { codigo: "104", nome: "Caixa Econômica Federal" },
    { codigo: "237", nome: "Banco Bradesco S.A." },
    { codigo: "341", nome: "Banco Itaú S.A." },
    { codigo: "033", nome: "Banco Santander (Brasil) S.A." },
    { codigo: "745", nome: "Banco Citibank S.A." },
    { codigo: "399", nome: "HSBC Bank Brasil S.A." },
    { codigo: "212", nome: "Banco Original S.A." },
    { codigo: "260", nome: "Nu Pagamentos S.A." },
    { codigo: "336", nome: "Banco C6 S.A." },
    { codigo: "077", nome: "Banco Inter S.A." },
    { codigo: "655", nome: "Banco Votorantim S.A." },
    { codigo: "041", nome: "Banco do Estado do Rio Grande do Sul S.A." },
    { codigo: "070", nome: "Banco de Brasília S.A." },
    { codigo: "047", nome: "Banco do Estado de Sergipe S.A." },
    { codigo: "021", nome: "Banco do Estado do Espírito Santo S.A." },
    { codigo: "756", nome: "Banco Cooperativo do Brasil S.A." },
    { codigo: "748", nome: "Banco Cooperativo Sicredi S.A." },
    { codigo: "085", nome: "Cooperativa Central de Crédito Ailos" },
    { codigo: "136", nome: "Banco Unicred do Brasil" },
  ];

  const handleChange = (field, value) => {
    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const selecionarBanco = (banco) => {
    handleChange("codigoBanco", banco.codigo);
    handleChange("nomeBanco", banco.nome);
    setMostrarBancos(false);
  };

  const formatarConta = (value) => {
    // Remove caracteres não numéricos exceto hífen
    return value.replace(/[^\d-]/g, "");
  };

  const formatarAgencia = (value) => {
    // Remove caracteres não numéricos exceto hífen
    return value.replace(/[^\d-]/g, "");
  };

  return (
    <div className="dados-bancarios-section">
      <div className="section-header">
        <h3 className="section-title">
          <span className="section-icon">🏦</span>
          Dados Bancários
        </h3>
        <p className="section-description">
          Informações da conta bancária para transferência dos recursos
        </p>
      </div>

      <div className="form-grid">
        {/* Banco */}
        <div className="form-row">
          <div className="form-group banco-group">
            <label className="form-label">
              Código do Banco *
              <span className="required-indicator">obrigatório</span>
            </label>

            <div className="banco-input-container">
              <input
                type="text"
                className={`form-input codigo-banco ${errors.codigoBanco ? "error" : ""}`}
                value={formData.codigoBanco || ""}
                onChange={(e) => {
                  const codigo = e.target.value.replace(/\D/g, "").slice(0, 3);
                  handleChange("codigoBanco", codigo);

                  // Limpar nome do banco se código foi alterado
                  if (codigo !== formData.codigoBanco) {
                    handleChange("nomeBanco", "");
                  }
                }}
                placeholder="000"
                maxLength="3"
              />

              <button
                type="button"
                className="toggle-banks-button"
                onClick={() => setMostrarBancos(!mostrarBancos)}
                title={
                  mostrarBancos
                    ? "Ocultar lista de bancos"
                    : "Mostrar bancos comuns"
                }
              >
                {mostrarBancos ? "▼" : "▶"} Bancos Comuns
              </button>
            </div>

            {errors.codigoBanco && (
              <span className="error-message">{errors.codigoBanco}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Nome do Banco *
              <span className="required-indicator">obrigatório</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.nomeBanco ? "error" : ""}`}
              value={formData.nomeBanco || ""}
              onChange={(e) => handleChange("nomeBanco", e.target.value)}
              placeholder="Nome completo do banco"
              readOnly={
                !!formData.codigoBanco &&
                bancosComuns.find((b) => b.codigo === formData.codigoBanco)
              }
            />
            {errors.nomeBanco && (
              <span className="error-message">{errors.nomeBanco}</span>
            )}
          </div>
        </div>

        {/* Lista expansível de bancos */}
        {mostrarBancos && (
          <div className="bancos-list">
            <div className="bancos-header">
              <h4>Selecione um banco:</h4>
              <button
                type="button"
                className="close-list-button"
                onClick={() => setMostrarBancos(false)}
              >
                ✕
              </button>
            </div>

            <div className="bancos-grid">
              {bancosComuns.map((banco) => (
                <button
                  key={banco.codigo}
                  type="button"
                  className={`banco-item ${
                    formData.codigoBanco === banco.codigo ? "selected" : ""
                  }`}
                  onClick={() => selecionarBanco(banco)}
                >
                  <span className="banco-codigo">{banco.codigo}</span>
                  <span className="banco-nome">{banco.nome}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Agência e Conta */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Agência *<span className="required-indicator">obrigatório</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.agencia ? "error" : ""}`}
              value={formData.agencia || ""}
              onChange={(e) =>
                handleChange("agencia", formatarAgencia(e.target.value))
              }
              placeholder="0000 ou 0000-0"
              maxLength="6"
            />
            {errors.agencia && (
              <span className="error-message">{errors.agencia}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Número da Conta *
              <span className="required-indicator">obrigatório</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.conta ? "error" : ""}`}
              value={formData.conta || ""}
              onChange={(e) =>
                handleChange("conta", formatarConta(e.target.value))
              }
              placeholder="00000000-0"
              maxLength="12"
            />
            {errors.conta && (
              <span className="error-message">{errors.conta}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Tipo de Conta *
              <span className="required-indicator">obrigatório</span>
            </label>
            <select
              className={`form-input ${errors.tipoConta ? "error" : ""}`}
              value={formData.tipoConta || ""}
              onChange={(e) => handleChange("tipoConta", e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Conta Poupança</option>
              <option value="salario">Conta Salário</option>
            </select>
            {errors.tipoConta && (
              <span className="error-message">{errors.tipoConta}</span>
            )}
          </div>
        </div>

        {/* Informações do Titular */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Titular da Conta *
              <span className="required-indicator">obrigatório</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.titularConta ? "error" : ""}`}
              value={formData.titularConta || ""}
              onChange={(e) => handleChange("titularConta", e.target.value)}
              placeholder="Nome completo do titular"
            />
            {errors.titularConta && (
              <span className="error-message">{errors.titularConta}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              CPF/CNPJ do Titular *
              <span className="required-indicator">obrigatório</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.documentoTitular ? "error" : ""}`}
              value={formData.documentoTitular || ""}
              onChange={(e) => handleChange("documentoTitular", e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
            {errors.documentoTitular && (
              <span className="error-message">{errors.documentoTitular}</span>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="form-row">
          <div className="form-group full-width">
            <label className="form-label">
              Observações sobre os Dados Bancários
            </label>
            <textarea
              className="form-textarea"
              value={formData.observacoesBanco || ""}
              onChange={(e) => handleChange("observacoesBanco", e.target.value)}
              placeholder="Informações adicionais sobre a conta bancária..."
              rows="3"
              maxLength="500"
            />
            <div className="character-count">
              {(formData.observacoesBanco || "").length}/500 caracteres
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dados-bancarios-section {
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

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
          align-items: start;
        }

        .form-row:nth-child(3),
        .form-row:nth-child(4) {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .form-row:nth-child(5) {
          grid-template-columns: 1fr 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .banco-group {
          min-width: 200px;
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

        .banco-input-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #fff;
        }

        .codigo-banco {
          width: 80px;
          text-align: center;
          font-family: "Courier New", monospace;
          font-weight: 600;
        }

        .form-input:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .form-input:read-only {
          background: #f7fafc;
          color: #4a5568;
        }

        .form-input.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }

        .toggle-banks-button {
          padding: 0.5rem 1rem;
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-banks-button:hover {
          background: #3182ce;
          transform: translateY(-1px);
        }

        .bancos-list {
          grid-column: 1 / -1;
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1rem;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bancos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #cbd5e0;
        }

        .bancos-header h4 {
          margin: 0;
          color: #2d3748;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .close-list-button {
          background: #e2e8f0;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a5568;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .close-list-button:hover {
          background: #cbd5e0;
          color: #2d3748;
        }

        .bancos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 0.75rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .banco-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .banco-item:hover {
          border-color: #4299e1;
          box-shadow: 0 2px 8px rgba(66, 153, 225, 0.15);
          transform: translateY(-1px);
        }

        .banco-item.selected {
          border-color: #48bb78;
          background: #f0fff4;
          box-shadow: 0 2px 8px rgba(72, 187, 120, 0.15);
        }

        .banco-codigo {
          background: #edf2f7;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: "Courier New", monospace;
          font-weight: 600;
          font-size: 0.85rem;
          color: #2d3748;
          min-width: 40px;
          text-align: center;
        }

        .banco-item.selected .banco-codigo {
          background: #c6f6d5;
          color: #22543d;
        }

        .banco-nome {
          font-size: 0.9rem;
          color: #4a5568;
          font-weight: 500;
        }

        .banco-item.selected .banco-nome {
          color: #22543d;
          font-weight: 600;
        }

        .form-textarea {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
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
        @media (max-width: 1024px) {
          .bancos-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .dados-bancarios-section {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-row:nth-child(3),
          .form-row:nth-child(4),
          .form-row:nth-child(5) {
            grid-template-columns: 1fr;
          }

          .banco-input-container {
            flex-direction: column;
            align-items: stretch;
          }

          .toggle-banks-button {
            justify-content: center;
          }

          .bancos-grid {
            grid-template-columns: 1fr;
          }

          .bancos-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 1.2rem;
          }

          .banco-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DadosBancarios;
