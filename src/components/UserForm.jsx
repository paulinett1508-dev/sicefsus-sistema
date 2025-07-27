// src/components/UserForm.jsx - Formulário de Usuário com UX Melhorada
import React, { useEffect } from "react";
import { getEstadoNome } from "../utils/validators";
import { formStyles, addFormInteractivity } from "../utils/formStyles";

const UserForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingUser,
  saving = false,
}) => {
  console.log("🎭 DEBUG: UserForm renderizado com props:", {
    formData,
    editingUser: !!editingUser,
    saving
  });

  // ✅ Adicionar interatividade dos formulários
  useEffect(() => {
    console.log("🔄 DEBUG: UserForm useEffect executado");
    addFormInteractivity();
  }, []);

  // ✅ LISTA DE UFS (centralizada)
  const UFS_VALIDAS = [
    "ac", "al", "ap", "am", "ba", "ce", "df", "es", "go", "ma",
    "mt", "ms", "mg", "pa", "pb", "pr", "pe", "pi", "rj", "rn",
    "rs", "ro", "rr", "sc", "sp", "se", "to",
  ];

  const handleRoleChange = (newRole) => {
    setFormData({
      ...formData,
      role: newRole,
      municipio: newRole === "admin" ? "" : formData.municipio,
      uf: newRole === "admin" ? "" : formData.uf,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div style={styles.overlay} onClick={(e) => {
      console.log("🖱️ DEBUG: Clique no overlay", e.target === e.currentTarget);
      if (e.target === e.currentTarget) {
        console.log("🚪 DEBUG: Fechando modal via overlay");
        onCancel();
      }
    }}>
      <div style={styles.modal} onClick={(e) => {
        console.log("🖱️ DEBUG: Clique no modal");
        e.stopPropagation();
      }}>
        {/* ✅ HEADER MINIMALISTA */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            {editingUser ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <button
            style={styles.closeButton}
            onClick={onCancel}
            disabled={saving}
            type="button"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        <form style={styles.container} onSubmit={handleSubmit}>
          {/* ✅ SEÇÃO DADOS PESSOAIS */}
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              <span style={styles.legendIcon}>👤</span>
              Dados Pessoais
            </legend>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.labelRequired}>
                  Email <span style={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  style={styles.input}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={editingUser || saving}
                  required
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelRequired}>
                  Nome Completo <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  disabled={saving}
                  required
                  placeholder="Nome completo do usuário"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Departamento</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.departamento}
                  onChange={(e) =>
                    setFormData({ ...formData, departamento: e.target.value })
                  }
                  disabled={saving}
                  placeholder="Ex: Secretaria de Saúde"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Telefone</label>
                <input
                  type="tel"
                  style={styles.input}
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  disabled={saving}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {/* ✅ INFORMAÇÃO SOBRE SEGURANÇA DE SENHA MELHORADA */}
            {!editingUser && (
              <div style={styles.emendaInfo}>
                <h4 style={styles.emendaInfoTitle}>
                  🔒 Segurança da Senha
                </h4>
                <div style={styles.emendaInfoGrid}>
                  <div style={styles.emendaInfoRow}>
                    • Uma senha temporária será gerada automaticamente
                  </div>
                  <div style={styles.emendaInfoRow}>
                    • O usuário receberá email com instruções de primeiro acesso
                  </div>
                  <div style={styles.emendaInfoRow}>
                    • No primeiro login, será obrigatório alterar a senha
                  </div>
                  <div style={styles.emendaInfoRow}>
                    • Conforme LGPD, admins não definem senhas de usuários
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          {/* ✅ SEÇÃO CONFIGURAÇÕES DE ACESSO */}
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>
              <span style={styles.legendIcon}>🔐</span>
              Configurações de Acesso
            </legend>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Perfil do Usuário</label>
                <select
                  style={styles.select}
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={saving}
                >
                  <option value="user">👤 Operador</option>
                  <option value="admin">👑 Administrador</option>
                </select>
                <small style={styles.helpText}>
                  {formData.role === "admin"
                    ? "Acesso total ao sistema"
                    : "Acesso limitado por localização"}
                </small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.select}
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
          </fieldset>

          {/* ✅ SEÇÃO DE LOCALIZAÇÃO OBRIGATÓRIA (APENAS OPERADORES) */}
          {formData.role === "user" && (
            <fieldset style={{...styles.fieldset, borderColor: "var(--error)", backgroundColor: "var(--error-light)"}}>
              <legend style={{...styles.legend, borderColor: "var(--error)", color: "var(--error)"}}>
                <span style={styles.legendIcon}>📍</span>
                Localização de Acesso (OBRIGATÓRIO)
              </legend>

              <div style={{...styles.emendaInfo, backgroundColor: "var(--error-light)", borderColor: "var(--error)"}}>
                <div style={{margin: 0, color: "var(--error-dark)", fontWeight: "600"}}>
                  🔒 <strong>IMPORTANTE:</strong> Operadores só podem visualizar e gerenciar emendas do município cadastrado
                </div>
                <div style={{marginTop: "8px", color: "var(--error-dark)", fontSize: "0.9em"}}>
                  • O município definido aqui determina quais emendas o usuário poderá acessar<br/>
                  • Esta configuração não pode ser alterada após a criação do usuário<br/>
                  • Para mudança de localização, será necessário criar novo usuário
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.labelRequired}>
                    Município <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    style={{...styles.input, borderColor: "var(--error)"}}
                    value={formData.municipio}
                    onChange={(e) =>
                      setFormData({ ...formData, municipio: e.target.value.trim() })
                    }
                    disabled={saving || editingUser}
                    placeholder="Ex: São Paulo, Rio de Janeiro, Belo Horizonte"
                    required={formData.role === "user"}
                    minLength="2"
                    maxLength="100"
                  />
                  <small style={{...styles.helpText, color: "var(--error-dark)"}}>
                    {editingUser ? "Localização não pode ser alterada após criação" : "Digite o nome completo do município"}
                  </small>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.labelRequired}>
                    Estado (UF) <span style={styles.required}>*</span>
                  </label>
                  <select
                    style={{...styles.select, borderColor: "var(--error)"}}
                    value={formData.uf}
                    onChange={(e) =>
                      setFormData({ ...formData, uf: e.target.value })
                    }
                    disabled={saving || editingUser}
                    required={formData.role === "user"}
                  >
                    <option value="">Selecione o Estado</option>
                    {UFS_VALIDAS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf.toUpperCase()} - {getEstadoNome(uf)}
                      </option>
                    ))}
                  </select>
                  <small style={{...styles.helpText, color: "var(--error-dark)"}}>
                    {editingUser ? "UF não pode ser alterada após criação" : "Selecione o estado do município"}
                  </small>
                </div>
              </div>
            </fieldset>
          )}

          {/* ✅ AÇÕES DO FORMULÁRIO MELHORADAS */}
          <div style={styles.buttonContainer}>
            <button
              type="button"
              style={styles.cancelButtonStyle}
              onClick={onCancel}
              disabled={saving}
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer"
              }}
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
  );
};

// ✅ ESTILOS UNIVERSAIS APLICADOS (seguindo padrão EmendaForm/DespesaForm)
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
    backdropFilter: "blur(12px) saturate(180%)",
    animation: "fadeIn 0.3s ease",
  },

  modal: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-lg)",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    border: "2px solid var(--primary)",
    color: "var(--theme-text)",
    animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    transition: "all 0.3s ease",
  },

  header: {
    ...formStyles.header,
    borderRadius: "12px 12px 0 0",
    borderBottom: "2px solid var(--theme-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    ...formStyles.headerTitle,
    margin: 0,
    fontSize: "1.4em",
    fontWeight: "600",
  },

  closeButton: {
    background: "var(--theme-surface-secondary)",
    border: "1px solid var(--theme-border)",
    color: "var(--theme-text-secondary)",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    fontSize: "1.1em",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  // ✅ APLICANDO ESTILOS UNIVERSAIS DO SISTEMA
  container: formStyles.container,
  fieldset: formStyles.fieldset,
  legend: formStyles.legend,
  legendIcon: formStyles.legendIcon,
  formGrid: formStyles.formGrid,
  formGroup: formStyles.formGroup,
  label: formStyles.label,
  labelRequired: formStyles.labelRequired,
  required: formStyles.required,
  input: formStyles.input,
  select: formStyles.select,
  helpText: formStyles.helpText,
  emendaInfo: formStyles.emendaInfo,
  emendaInfoTitle: formStyles.emendaInfoTitle,
  emendaInfoGrid: formStyles.emendaInfoGrid,
  emendaInfoRow: formStyles.emendaInfoRow,
  buttonContainer: formStyles.buttonContainer,
  cancelButtonStyle: formStyles.cancelButtonStyle,
  submitButton: formStyles.submitButton,
};

export default UserForm;