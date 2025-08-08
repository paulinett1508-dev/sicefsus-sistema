// src/components/emenda/ModalExclusaoEmenda.jsx
import React from "react";
import "../../styles/modalExclusao.css";

export default function ModalExclusaoEmenda({
  isOpen,
  onClose,
  onConfirm,
  emenda,
  userRole,
  loading = false,
}) {
  if (!isOpen) return null;

  const isOperador = userRole === "operador" || userRole === "Operador";

  const handleConfirm = () => {
    if (!isOperador && emenda?.id) {
      onConfirm();
    }
  };

  // Validação de segurança
  if (!emenda) {
    return (
      <div className="modal-exclusao-overlay" onClick={onClose}>
        <div
          className="modal-exclusao-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-exclusao-header">
            <div className="modal-exclusao-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#E74C3C"
                  strokeWidth="2"
                />
                <path
                  d="M12 8V12M12 16H12.01"
                  stroke="#E74C3C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="modal-exclusao-title">Erro</h2>
          </div>
          <div className="modal-exclusao-body">
            <p className="modal-exclusao-message">
              Não foi possível identificar a emenda selecionada.
            </p>
          </div>
          <div className="modal-exclusao-footer">
            <button className="modal-btn-cancelar" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-exclusao-overlay" onClick={onClose}>
      <div
        className="modal-exclusao-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-exclusao-header">
          <div className="modal-exclusao-icon">
            {isOperador ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#F39C12"
                  strokeWidth="2"
                />
                <path
                  d="M12 8V12M12 16H12.01"
                  stroke="#F39C12"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#E74C3C"
                  strokeWidth="2"
                />
                <path
                  d="M8 12L16 12"
                  stroke="#E74C3C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <h2 className="modal-exclusao-title">
            {isOperador ? "Ação Não Permitida" : "Confirmar Exclusão"}
          </h2>
        </div>

        <div className="modal-exclusao-body">
          {isOperador ? (
            <>
              <p className="modal-exclusao-message">
                Como <strong>operador</strong>, você não tem permissão para
                excluir emendas.
              </p>
              <p className="modal-exclusao-submessage">
                Por favor, solicite a exclusão a um administrador do sistema.
              </p>
              <div className="modal-exclusao-info">
                <div className="info-icon">💡</div>
                <div className="info-text">
                  Entre em contato com o administrador responsável pelo seu
                  município para solicitar a exclusão desta emenda.
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="modal-exclusao-message">
                Tem certeza que deseja excluir esta emenda?
              </p>

              {emenda && (
                <div className="modal-exclusao-details">
                  <div className="detail-item">
                    <span className="detail-label">Número:</span>
                    <span className="detail-value">{emenda.numero}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Parlamentar:</span>
                    <span className="detail-value">
                      {emenda.autor || "Não informado"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Valor:</span>
                    <span className="detail-value">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(emenda.valorTotal || 0)}
                    </span>
                  </div>
                  {emenda.municipio && (
                    <div className="detail-item">
                      <span className="detail-label">Município:</span>
                      <span className="detail-value">
                        {emenda.municipio}/{emenda.uf}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-exclusao-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-text">
                  <strong>Atenção:</strong> Esta ação é irreversível. Todas as
                  despesas associadas a esta emenda também serão excluídas.
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-exclusao-footer">
          <button className="modal-btn-cancelar" onClick={onClose}>
            {isOperador ? "Fechar" : "Cancelar"}
          </button>
          {!isOperador && (
            <button
              className="modal-btn-confirmar"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Excluindo...
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ marginRight: "8px" }}
                  >
                    <path
                      d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Excluir Emenda
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
