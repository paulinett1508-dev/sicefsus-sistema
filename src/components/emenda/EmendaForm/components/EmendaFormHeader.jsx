import React from "react";

const EmendaFormHeader = ({
  isEditMode,
  emendaData,
  currentStep,
  totalSteps,
  stepTitles = [
    "Identificação",
    "Dados Básicos",
    "Beneficiário",
    "Dados Bancários",
    "Cronograma",
    "Ações/Serviços",
    "Informações Complementares",
  ],
}) => {
  return (
    <div className="emenda-form-header">
      {/* Banner Principal - SEM ID em modo edição */}
      <div className="header-banner">
        <div className="banner-content">
          <div className="banner-left">
            <h2 className="banner-title">
              {isEditMode ? "✏️ Editar Emenda" : "➕ Nova Emenda"}
            </h2>
            {/* Só mostra número da emenda se não estiver em modo edição OU se for visualização */}
            {!isEditMode && emendaData?.numero && (
              <span className="emenda-numero">Nº {emendaData.numero}</span>
            )}
            {/* Em modo edição, mostra status mais elegante */}
            {isEditMode && emendaData?.status && (
              <span
                className={`status-badge status-${emendaData.status.toLowerCase()}`}
              >
                {emendaData.status}
              </span>
            )}
          </div>

          <div className="banner-right">
            <div className="progress-info">
              <span className="step-counter">
                Etapa {currentStep} de {totalSteps}
              </span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de Progresso */}
      <div className="steps-indicator">
        {stepTitles.map((title, index) => (
          <div
            key={index}
            className={`step-item ${
              index + 1 === currentStep
                ? "active"
                : index + 1 < currentStep
                  ? "completed"
                  : "pending"
            }`}
          >
            <div className="step-circle">
              {index + 1 < currentStep ? "✓" : index + 1}
            </div>
            <span className="step-title">{title}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .emenda-form-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .header-banner {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .banner-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .banner-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .banner-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0;
        }

        .emenda-numero {
          font-size: 0.9rem;
          color: #4a5568;
          font-weight: 600;
          background: #e2e8f0;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          display: inline-block;
        }

        .status-badge {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-ativa {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-pendente {
          background: #fef5e7;
          color: #c05621;
        }

        .status-finalizada {
          background: #e2e8f0;
          color: #2d3748;
        }

        .banner-right {
          display: flex;
          align-items: center;
        }

        .progress-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .step-counter {
          font-size: 0.9rem;
          color: #4a5568;
          font-weight: 600;
        }

        .progress-bar {
          width: 200px;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #48bb78, #38a169);
          transition: width 0.3s ease;
        }

        .steps-indicator {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 100px;
          flex-shrink: 0;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .step-item.pending .step-circle {
          background: rgba(255, 255, 255, 0.3);
          color: #a0aec0;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .step-item.active .step-circle {
          background: #4299e1;
          color: white;
          border: 2px solid #4299e1;
          box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.3);
        }

        .step-item.completed .step-circle {
          background: #48bb78;
          color: white;
          border: 2px solid #48bb78;
        }

        .step-title {
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .step-item.pending .step-title {
          opacity: 0.7;
        }

        .step-item.active .step-title {
          opacity: 1;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .banner-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .progress-bar {
            width: 150px;
          }

          .steps-indicator {
            justify-content: flex-start;
          }

          .step-item {
            min-width: 80px;
          }

          .step-circle {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmendaFormHeader;
