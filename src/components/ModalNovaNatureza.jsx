// src/components/ModalNovaNatureza.jsx
import React, { useState } from "react";
import "./ModalNovaNatureza.css";

const ModalNovaNatureza = ({ isOpen, onClose, onSalvar }) => {
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    // Validações
    if (!codigo.trim()) {
      setErro("Código é obrigatório");
      return;
    }

    if (!descricao.trim()) {
      setErro("Descrição é obrigatória");
      return;
    }

    if (codigo.trim().length < 6) {
      setErro("Código deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      await onSalvar(codigo, descricao);

      // Limpar e fechar
      setCodigo("");
      setDescricao("");
      setErro("");
      onClose();
    } catch (error) {
      setErro(error.message || "Erro ao salvar natureza");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCodigo("");
    setDescricao("");
    setErro("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>➕ Nova Natureza de Despesa</h3>
          <button className="modal-close" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {erro && <div className="alert alert-error">{erro}</div>}

            <div className="form-group">
              <label htmlFor="codigo">
                Código <span className="required">*</span>
              </label>
              <input
                id="codigo"
                type="text"
                className="form-input"
                placeholder="Ex: 339030 ou 000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength={10}
                disabled={loading}
              />
              <small className="form-hint">
                Digite o código da natureza (pode usar apenas zeros: 000000)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="descricao">
                Descrição <span className="required">*</span>
              </label>
              <input
                id="descricao"
                type="text"
                className="form-input"
                placeholder="Ex: MATERIAL DE CONSUMO"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={150}
                disabled={loading}
              />
              <small className="form-hint">
                Descrição será convertida automaticamente para MAIÚSCULAS
              </small>
            </div>

            <div className="preview-box">
              <strong>Preview:</strong>
              <div className="preview-text">
                {codigo.trim() && descricao.trim()
                  ? `${codigo.trim()} - ${descricao.trim().toUpperCase()}`
                  : "Preencha os campos acima"}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !codigo.trim() || !descricao.trim()}
            >
              {loading ? "⏳ Salvando..." : "✅ Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovaNatureza;
