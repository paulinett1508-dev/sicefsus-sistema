// src/components/UserForm.jsx - Formulário de Usuário Conforme Padrão SICEFSUS
import React from "react";
import { getEstadoNome } from "../utils/validators";

const UserForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingUser,
  saving = false,
}) => {
  // ✅ LISTA DE UFS (centralizada)
  const UFS_VALIDAS = [
    "ac",
    "al",
    "ap",
    "am",
    "ba",
    "ce",
    "df",
    "es",
    "go",
    "ma",
    "mt",
    "ms",
    "mg",
    "pa",
    "pb",
    "pr",
    "pe",
    "pi",
    "rj",
    "rn",
    "rs",
    "ro",
    "rr",
    "sc",
    "sp",
    "se",
    "to",
  ];

  const handleRoleChange = (newRole) => {
    setFormData({
      ...formData,
      role: newRole,
      municipio: newRole === "admin" ? "" : formData.municipio,
      uf: newRole === "admin" ? "" : formData.uf,
    });
  };

  return (
    <>
      <div className="form-modal-overlay">
        <div className="form-modal">
          <div className="form-modal-header">
            <h2>{editingUser ? "✏️ Editar Usuário" : "➕ Novo Usuário"}</h2>
            <button
              className="close-button"
              onClick={onCancel}
              disabled={saving}
              type="button"
            >
              ✕
            </button>
          </div>

          <form className="form-container" onSubmit={onSubmit}>
            {/* ✅ SEÇÃO DADOS PESSOAIS */}
            <div className="form-section">
              <h3 className="section-title">📋 Dados Pessoais</h3>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label required">Email</label>
                  <input
                    type="email"
                    className="field-input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={editingUser || saving}
                    required
                    placeholder="usuario@exemplo.com"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label required">Nome Completo</label>
                  <input
                    type="text"
                    className="field-input"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    disabled={saving}
                    required
                    placeholder="Nome completo do usuário"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Departamento</label>
                  <input
                    type="text"
                    className="field-input"
                    value={formData.departamento}
                    onChange={(e) =>
                      setFormData({ ...formData, departamento: e.target.value })
                    }
                    disabled={saving}
                    placeholder="Ex: Secretaria de Saúde"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Telefone</label>
                  <input
                    type="tel"
                    className="field-input"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    disabled={saving}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {/* ✅ INFORMAÇÃO SOBRE SEGURANÇA DE SENHA */}
              {!editingUser && (
                <div className="security-info">
                  <div className="info-box">
                    <h4>🔒 Segurança da Senha</h4>
                    <p>• Uma senha temporária será gerada automaticamente</p>
                    <p>
                      • O usuário receberá email com instruções de primeiro
                      acesso
                    </p>
                    <p>• No primeiro login, será obrigatório alterar a senha</p>
                    <p>
                      • Conforme LGPD, admins não definem senhas de usuários
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ SEÇÃO CONFIGURAÇÕES DE ACESSO */}
            <div className="form-section">
              <h3 className="section-title">🔐 Configurações de Acesso</h3>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Perfil do Usuário</label>
                  <select
                    className="field-select"
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={saving}
                  >
                    <option value="user">👤 Operador</option>
                    <option value="admin">👑 Administrador</option>
                  </select>
                  <small className="field-hint">
                    {formData.role === "admin"
                      ? "Acesso total ao sistema"
                      : "Acesso limitado por localização"}
                  </small>
                </div>

                <div className="form-field">
                  <label className="field-label">Status</label>
                  <select
                    className="field-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    disabled={saving}
                  >
                    <option value="ativo">✅ Ativo</option>
                    <option value="inativo">⏸️ Inativo</option>
                    <option value="bloqueado">🚫 Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ✅ SEÇÃO DE LOCALIZAÇÃO (APENAS OPERADORES) */}
            {formData.role === "user" && (
              <div className="form-section location-section">
                <h3 className="section-title">📍 Localização de Acesso</h3>
                <div className="location-info">
                  <p>
                    ⚠️ Operadores têm acesso limitado a emendas de sua região
                  </p>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="field-label required">Município</label>
                    <input
                      type="text"
                      className="field-input"
                      value={formData.municipio}
                      onChange={(e) =>
                        setFormData({ ...formData, municipio: e.target.value })
                      }
                      disabled={saving}
                      placeholder="Digite o nome do município"
                      required={formData.role === "user"}
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label required">Estado (UF)</label>
                    <select
                      className="field-select"
                      value={formData.uf}
                      onChange={(e) =>
                        setFormData({ ...formData, uf: e.target.value })
                      }
                      disabled={saving}
                      required={formData.role === "user"}
                    >
                      <option value="">Selecione o Estado</option>
                      {UFS_VALIDAS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf.toUpperCase()} - {getEstadoNome(uf)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ AÇÕES DO FORMULÁRIO */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={saving}
              >
                ❌ Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <span>
                    ⏳ {editingUser ? "Atualizando..." : "Criando..."}
                  </span>
                ) : (
                  <span>
                    {editingUser ? "💾 Atualizar" : "✅ Criar"} Usuário
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ ESTILOS CONFORME PADRÃO SICEFSUS ORIGINAL */}
      <style>{`
        .form-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .form-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border: 2px solid #154360;
        }

        .form-modal-header {
          background: linear-gradient(135deg, #154360, #1A5276);
          color: white;
          padding: 20px 25px;
          border-radius: 10px 10px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-modal-header h2 {
          margin: 0;
          font-size: 1.5em;
          font-weight: 600;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          font-size: 1.2em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .close-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .close-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-container {
          padding: 25px;
        }

        .form-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #154360;
        }

        .section-title {
          color: #154360;
          font-size: 1.1em;
          font-weight: 600;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 15px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }

        .field-label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .field-label.required::after {
          content: " *";
          color: #dc3545;
          font-weight: bold;
        }

        .field-input,
        .field-select {
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          background: white;
        }

        .field-input:focus,
        .field-select:focus {
          outline: none;
          border-color: #154360;
          box-shadow: 0 0 0 3px rgba(21, 67, 96, 0.1);
        }

        .field-input:disabled,
        .field-select:disabled {
          background: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .field-hint {
          color: #6c757d;
          font-size: 12px;
          margin-top: 5px;
          font-style: italic;
        }

        .location-section {
          border-left-color: #ffc107;
          background: #fff8e1;
        }

        .location-info {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 15px;
        }

        .location-info p {
          margin: 0;
          color: #856404;
          font-size: 14px;
          font-weight: 500;
        }

        .security-info {
          margin: 20px 0;
        }

        .info-box {
          background: #e8f4fd;
          border: 1px solid #b8daff;
          border-radius: 8px;
          padding: 15px;
          border-left: 4px solid #007bff;
        }

        .info-box h4 {
          margin: 0 0 10px 0;
          color: #004085;
          font-size: 14px;
          font-weight: 600;
        }

        .info-box p {
          margin: 5px 0;
          color: #004085;
          font-size: 13px;
          line-height: 1.4;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          padding-top: 20px;
          border-top: 2px solid #e9ecef;
          margin-top: 20px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #154360, #1A5276);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #1A5276, #2C5F84);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(21, 67, 96, 0.3);
        }

        .btn-primary:disabled {
          background: #adb5bd;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }

        .btn-secondary:disabled {
          background: #adb5bd;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .form-modal-overlay {
            padding: 10px;
          }

          .form-modal {
            max-width: 100%;
            max-height: 95vh;
          }

          .form-modal-header {
            padding: 15px 20px;
          }

          .form-modal-header h2 {
            font-size: 1.3em;
          }

          .form-container {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .form-section {
            padding: 15px;
            margin-bottom: 20px;
          }

          .form-actions {
            flex-direction: column;
            gap: 10px;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default UserForm;
