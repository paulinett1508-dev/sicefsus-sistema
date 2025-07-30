// src/components/UserForm.jsx - CORRIGIDO PARA ESTRUTURA SICEFSUS
import React, { useEffect } from "react";
import { formStyles, addFormInteractivity } from "../utils/formStyles";

const UserForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingUser,
  saving = false,
}) => {
  // ✅ Adicionar interatividade dos formulários
  useEffect(() => {
    addFormInteractivity();
  }, []);

  // ✅ LISTA DE UFS CONFORME DOCUMENTAÇÃO SICEFSUS
  const UFS_VALIDAS = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  // ✅ MAPEAMENTO DE NOMES DE ESTADOS
  const UF_NAMES = {
    AC: "Acre",
    AL: "Alagoas",
    AP: "Amapá",
    AM: "Amazonas",
    BA: "Bahia",
    CE: "Ceará",
    DF: "Distrito Federal",
    ES: "Espírito Santo",
    GO: "Goiás",
    MA: "Maranhão",
    MT: "Mato Grosso",
    MS: "Mato Grosso do Sul",
    MG: "Minas Gerais",
    PA: "Pará",
    PB: "Paraíba",
    PR: "Paraná",
    PE: "Pernambuco",
    PI: "Piauí",
    RJ: "Rio de Janeiro",
    RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul",
    RO: "Rondônia",
    RR: "Roraima",
    SC: "Santa Catarina",
    SP: "São Paulo",
    SE: "Sergipe",
    TO: "Tocantins",
  };

  // ✅ HANDLER PARA MUDANÇA DE TIPO DE USUÁRIO (corrigido)
  const handleTipoChange = (newTipo) => {
    console.log("🔄 Mudando tipo de usuário para:", newTipo);

    setFormData({
      ...formData,
      role: newTipo, // Mantém compatibilidade com frontend
      municipio: newTipo === "admin" ? "" : formData.municipio,
      uf: newTipo === "admin" ? "" : formData.uf,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ VALIDAÇÃO ANTES DO ENVIO
    console.log("📝 Dados do formulário antes do envio:", formData);

    // Validações obrigatórias
    if (!formData.email?.trim()) {
      alert("Email é obrigatório");
      return;
    }

    if (!formData.nome?.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    // Validação para operadores
    if (formData.role === "user") {
      if (!formData.municipio?.trim()) {
        alert("Município é obrigatório para operadores");
        return;
      }

      if (!formData.uf?.trim()) {
        alert("UF é obrigatória para operadores");
        return;
      }
    }

    console.log("✅ Validações passed, enviando...");
    onSubmit(e);
  };

  return (
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        style={styles.modal}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* ✅ HEADER MINIMALISTA */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            {editingUser ? "✏️ Editar Usuário" : "👤 Novo Usuário"}
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
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={editingUser || saving}
                  required
                  placeholder="usuario@exemplo.com"
                />
                {editingUser && (
                  <small style={styles.helpText}>
                    <span
                      style={styles.infoIcon}
                      title="Email não pode ser alterado após criação"
                    >
                      ℹ️
                    </span>
                    Email não pode ser alterado após criação
                  </small>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelRequired}>
                  Nome Completo <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.nome || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  disabled={saving}
                  required
                  placeholder="Nome completo do usuário"
                  minLength="3"
                  maxLength="100"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Departamento</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.departamento || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, departamento: e.target.value })
                  }
                  disabled={saving}
                  placeholder="Ex: Secretaria de Saúde"
                  maxLength="100"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Telefone</label>
                <input
                  type="tel"
                  style={styles.input}
                  value={formData.telefone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  disabled={saving}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {/* ✅ INFORMAÇÃO SOBRE SEGURANÇA DE SENHA CONFORME SICEFSUS */}
            {!editingUser && (
              <div style={styles.emendaInfo}>
                <h4 style={styles.emendaInfoTitle}>
                  🔒 Política de Segurança SICEFSUS
                  <span
                    style={styles.infoIcon}
                    title="Conforme LGPD: administradores não definem senhas de usuários"
                  >
                    ℹ️
                  </span>
                </h4>
                <div style={styles.emendaInfoGrid}>
                  <div style={styles.emendaInfoRow}>
                    • Senha temporária será gerada automaticamente (12
                    caracteres seguros)
                  </div>
                  <div style={styles.emendaInfoRow}>
                    • Email com instruções de primeiro acesso será enviado
                  </div>
                  <div style={styles.emendaInfoRow}>
                    • Obrigatório alterar senha no primeiro login
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
                <label style={styles.labelRequired}>
                  Tipo de Usuário <span style={styles.required}>*</span>
                </label>
                <select
                  style={styles.select}
                  value={formData.role || "user"}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  disabled={saving}
                  required
                >
                  <option value="user">👤 Operador</option>
                  <option value="admin">👑 Administrador</option>
                </select>
                <small style={styles.helpText}>
                  {formData.role === "admin"
                    ? "🌐 Acesso total ao sistema (todos os municípios)"
                    : "📍 Acesso restrito ao município cadastrado"}
                </small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelRequired}>
                  Status <span style={styles.required}>*</span>
                </label>
                <select
                  style={styles.select}
                  value={formData.status || "ativo"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  disabled={saving}
                  required
                >
                  <option value="ativo">✅ Ativo</option>
                  <option value="inativo">⏸️ Inativo</option>
                </select>
                <small style={styles.helpText}>
                  {formData.status === "ativo"
                    ? "Usuário pode acessar o sistema"
                    : "Usuário não pode fazer login"}
                </small>
              </div>
            </div>
          </fieldset>

          {/* ✅ SEÇÃO DE LOCALIZAÇÃO OBRIGATÓRIA (APENAS OPERADORES) */}
          {formData.role === "user" && (
            <fieldset
              style={{
                ...styles.fieldset,
                borderColor: "var(--primary)",
                backgroundColor: "rgba(52, 152, 219, 0.05)",
              }}
            >
              <legend
                style={{
                  ...styles.legend,
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                  fontWeight: "600",
                }}
              >
                <span style={styles.legendIcon}>📍</span>
                Localização de Acesso (OBRIGATÓRIO PARA OPERADORES)
                <span
                  style={styles.infoIcon}
                  title="Operadores só podem visualizar e gerenciar emendas do município cadastrado"
                >
                  ℹ️
                </span>
              </legend>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.labelRequired}>
                    Município <span style={styles.required}>*</span>
                    {editingUser && (
                      <span
                        style={styles.infoIcon}
                        title="Localização não pode ser alterada após criação"
                      >
                        ℹ️
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    style={{
                      ...styles.input,
                      borderColor: editingUser
                        ? "var(--warning)"
                        : "var(--primary)",
                      backgroundColor: editingUser
                        ? "var(--theme-surface-secondary)"
                        : "white",
                    }}
                    value={formData.municipio || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        municipio: e.target.value.trim(),
                      })
                    }
                    disabled={saving || editingUser}
                    placeholder="Ex: São Paulo, Rio de Janeiro, Belo Horizonte"
                    required={formData.role === "user"}
                    minLength="2"
                    maxLength="100"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.labelRequired}>
                    Estado (UF) <span style={styles.required}>*</span>
                    {editingUser && (
                      <span
                        style={styles.infoIcon}
                        title="UF não pode ser alterada após criação"
                      >
                        ℹ️
                      </span>
                    )}
                  </label>
                  <select
                    style={{
                      ...styles.select,
                      borderColor: editingUser
                        ? "var(--warning)"
                        : "var(--primary)",
                      backgroundColor: editingUser
                        ? "var(--theme-surface-secondary)"
                        : "white",
                    }}
                    value={formData.uf || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, uf: e.target.value })
                    }
                    disabled={saving || editingUser}
                    required={formData.role === "user"}
                  >
                    <option value="">Selecione o Estado</option>
                    {UFS_VALIDAS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf} - {UF_NAMES[uf]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ✅ PREVIEW DA CONFIGURAÇÃO */}
              {formData.municipio && formData.uf && (
                <div
                  style={{
                    ...styles.emendaInfo,
                    backgroundColor: "rgba(39, 174, 96, 0.1)",
                    borderColor: "var(--success)",
                    marginTop: "16px",
                  }}
                >
                  <div
                    style={{
                      color: "var(--success)",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ✅ <strong>Configuração de Acesso:</strong>
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "12px",
                      backgroundColor: "rgba(39, 174, 96, 0.05)",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontSize: "0.9em",
                    }}
                  >
                    📍 <strong>Localização:</strong> {formData.municipio} /{" "}
                    {formData.uf}
                    <br />
                    🔍 <strong>Acesso:</strong> Apenas emendas de{" "}
                    {formData.municipio}
                    <br />
                    👤 <strong>Permissões:</strong> Visualizar, criar despesas
                  </div>
                </div>
              )}
            </fieldset>
          )}

          {/* ✅ PREVIEW PARA ADMINISTRADORES */}
          {formData.role === "admin" && (
            <fieldset
              style={{
                ...styles.fieldset,
                borderColor: "var(--warning)",
                backgroundColor: "rgba(243, 156, 18, 0.05)",
              }}
            >
              <legend
                style={{
                  ...styles.legend,
                  borderColor: "var(--warning)",
                  color: "var(--warning)",
                  fontWeight: "600",
                }}
              >
                <span style={styles.legendIcon}>👑</span>
                Configuração de Administrador
              </legend>

              <div
                style={{
                  ...styles.emendaInfo,
                  backgroundColor: "rgba(243, 156, 18, 0.1)",
                  borderColor: "var(--warning)",
                }}
              >
                <div
                  style={{
                    color: "var(--warning)",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  👑 <strong>Privilégios de Administrador:</strong>
                </div>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "rgba(243, 156, 18, 0.05)",
                    borderRadius: "6px",
                    fontSize: "0.9em",
                    lineHeight: "1.4",
                  }}
                >
                  🌐 <strong>Acesso:</strong> Todos os municípios e UFs
                  <br />
                  📋 <strong>Emendas:</strong> Criar, editar, excluir todas as
                  emendas
                  <br />
                  💰 <strong>Despesas:</strong> Gerenciar despesas de qualquer
                  emenda
                  <br />
                  👥 <strong>Usuários:</strong> Gerenciar todos os usuários do
                  sistema
                  <br />
                  📊 <strong>Relatórios:</strong> Acesso a relatórios
                  consolidados
                  <br />
                  ⚙️ <strong>Sistema:</strong> Configurações administrativas
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
                cursor: saving ? "not-allowed" : "pointer",
              }}
              disabled={saving}
            >
              {saving ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid transparent",
                      borderTop: "2px solid currentColor",
                      borderRadius: "50%",
                      animation: "userFormSpin 1s linear infinite",
                    }}
                  ></div>
                  {editingUser ? "Atualizando..." : "Criando..."}
                </span>
              ) : (
                <span>{editingUser ? "💾 Atualizar" : "✅ Criar"} Usuário</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ✅ ESTILOS UNIVERSAIS APLICADOS (seguindo padrão SICEFSUS)
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
    animation: "userFormFadeIn 0.3s ease",
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
    animation: "userFormSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    transition: "all 0.3s ease",
  },

  header: {
    ...formStyles.header,
    borderRadius: "12px 12px 0 0",
    borderBottom: "2px solid var(--theme-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background:
      "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
    color: "white",
  },

  headerTitle: {
    ...formStyles.headerTitle,
    margin: 0,
    fontSize: "1.4em",
    fontWeight: "600",
    color: "white",
  },

  closeButton: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    fontSize: "1.1em",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    backdropFilter: "blur(10px)",
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
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
    marginLeft: "5px",
  },
};

// ✅ ADICIONAR ANIMAÇÕES CSS GLOBALMENTE (uma única vez)
if (!document.getElementById("userform-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "userform-animations";
  styleSheet.type = "text/css";
  styleSheet.innerHTML = `
    @keyframes userFormSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes userFormFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes userFormSlideUp {
      from { 
        opacity: 0; 
        transform: translateY(20px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default UserForm;
