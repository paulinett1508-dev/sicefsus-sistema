// src/components/UserForm.jsx - VERSÃO COMPLETA COM MELHORIAS
import React, { useEffect } from "react";
import MunicipioSelector from "./MunicipioSelector";
import { useUser } from '../context/UserContext';
import formStyles from '../utils/formStyles';

const UserForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingUser,
  saving = false,
}) => {
  const { user: currentUser } = useUser(); // Usuário logado atual

  // ✅ Estado para controlar exibição da política de segurança
  const [showSecurityPolicy, setShowSecurityPolicy] = React.useState(false);

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

  // ✅ HANDLER PARA MUDANÇA DE TIPO DE USUÁRIO
  const handleTipoChange = (newTipo) => {
    console.log("🔄 Mudando tipo de usuário para:", newTipo);
    setFormData({
      ...formData,
      role: newTipo,
      municipio: newTipo === "admin" ? "" : formData.municipio,
      uf: newTipo === "admin" ? "" : formData.uf,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    try {
      const resultado = await onSubmit(e);
      console.log("📋 Resultado da criação:", resultado);

      // ✅ Admin permanece logado - operação normal
      if (resultado && resultado.adminPreserved) {
        console.log("🎉 Usuário criado - admin permanece logado!");
        // Componente pai já tratará o sucesso
      } else if (!editingUser) {
        // ✅ FALLBACK: caso não tenha adminPreserved (edição não afeta)
        console.log("✅ Usuário criado com sucesso");
      }

    } catch (error) {
      console.error("❌ Erro no envio do formulário:", error);
      throw error;
    }
  };

  // ✅ useEffect para pré-preencher os campos do formulário se estiver editando um usuário
  useEffect(() => {
    if (editingUser) {
      setFormData({
        nome: editingUser.nome || "",
        email: editingUser.email || "",
        senha: "", // Nunca pré-preencher senha
        municipio: editingUser.municipio || "",
        uf: editingUser.uf || "",
        role: editingUser.role || "user",
        status: editingUser.status || "ativo",
        telefone: editingUser.telefone || "",
        departamento: editingUser.departamento || "",
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        senha: "",
        municipio: "",
        uf: "",
        role: "user",
        status: "ativo",
        telefone: "",
        departamento: "",
      });
    }
    setErrors({});
  }, [editingUser]);

  // ✅ useEffect para pré-preencher município/UF para operadores ao criar novo usuário
  useEffect(() => {
    // Pré-preencher município/UF para operadores
    if (!editingUser && currentUser?.tipo === 'operador' && currentUser?.municipio && currentUser?.uf) {
      setFormData(prev => ({
        ...prev,
        municipio: currentUser.municipio,
        uf: currentUser.uf,
        role: 'user' // Operadores só podem criar outros operadores
      }));
    }
  }, [editingUser, currentUser, setFormData]);


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

        {/* ✅ SEÇÃO DE POLÍTICA DE SEGURANÇA - COLAPSÁVEL NO TOPO */}
        {!editingUser && (
          <div style={styles.securityPolicyWrapper}>
            <button
              type="button"
              style={styles.securityToggleButton}
              onClick={() => setShowSecurityPolicy(!showSecurityPolicy)}
            >
              <span style={styles.securityToggleIcon}>
                {showSecurityPolicy ? "🔽" : "▶️"}
              </span>
              <span style={styles.securityToggleText}>
                🔒 Política de Segurança SICEFSUS
              </span>
              <span style={styles.securityBadge}>LGPD</span>
            </button>

            {showSecurityPolicy && (
              <div style={styles.securityPolicyContent}>
                <div style={securityStyles.container}>
                  <div style={securityStyles.backgroundPattern}></div>

                  <div style={securityStyles.cardsGrid}>
                    <div style={securityStyles.card}>
                      <div
                        style={{
                          ...securityStyles.cardIcon,
                          background:
                            "linear-gradient(135deg, #2196f322 0%, #2196f344 100%)",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>🔐</span>
                      </div>
                      <div style={securityStyles.cardContent}>
                        <h5 style={securityStyles.cardTitle}>
                          Senha Forte Automática
                        </h5>
                        <p style={securityStyles.cardText}>
                          Geração automática de senha com 12 caracteres
                          incluindo maiúsculas, minúsculas, números e símbolos
                        </p>
                      </div>
                    </div>

                    <div style={securityStyles.card}>
                      <div
                        style={{
                          ...securityStyles.cardIcon,
                          background:
                            "linear-gradient(135deg, #4caf5022 0%, #4caf5044 100%)",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>📧</span>
                      </div>
                      <div style={securityStyles.cardContent}>
                        <h5 style={securityStyles.cardTitle}>
                          Notificação Instantânea
                        </h5>
                        <p style={securityStyles.cardText}>
                          Email enviado imediatamente com link seguro para
                          configuração da conta
                        </p>
                      </div>
                    </div>

                    <div style={securityStyles.card}>
                      <div
                        style={{
                          ...securityStyles.cardIcon,
                          background:
                            "linear-gradient(135deg, #ff980022 0%, #ff980044 100%)",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>🔄</span>
                      </div>
                      <div style={securityStyles.cardContent}>
                        <h5 style={securityStyles.cardTitle}>
                          Renovação Obrigatória
                        </h5>
                        <p style={securityStyles.cardText}>
                          Política de segurança exige troca de senha no primeiro
                          acesso
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={securityStyles.footer}>
                    <div style={securityStyles.footerIcon}>
                      <span>🛡️</span>
                    </div>
                    <div style={securityStyles.footerContent}>
                      <strong style={securityStyles.footerTitle}>
                        Conformidade LGPD
                      </strong>
                      <p style={securityStyles.footerText}>
                        Em conformidade com a Lei Geral de Proteção de Dados,
                        administradores não têm acesso às senhas dos usuários,
                        garantindo total privacidade e segurança das
                        credenciais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                  disabled={saving || (editingUser && currentUser?.tipo === 'operador' && editingUser.id !== currentUser.id)} // 🆕 Impedir que operadores editem outros admins, ou que usuários editem seu próprio tipo se não for admin
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

          {/* ✅ SEÇÃO DE LOCALIZAÇÃO (APENAS OPERADORES) */}
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

              {/* 🆕 Banner informativo para operadores */}
              {currentUser?.tipo === 'operador' && !editingUser && (
                <div style={styles.operatorBanner}>
                  <div style={styles.operatorBannerIcon}>📍</div>
                  <div style={styles.operatorBannerContent}>
                    <strong>Pré-preenchimento automático:</strong>
                    <br />
                    Como operador, você só pode criar usuários para o seu município ({currentUser.municipio}/{currentUser.uf})
                  </div>
                </div>
              )}

              <div style={styles.formGroup}>
                {editingUser ? (
                  <>
                    {/* Durante edição, mostrar campos somente leitura */}
                    <div style={styles.formGroup}>
                      <label style={styles.labelRequired}>
                        Estado (UF) <span style={styles.required}>*</span>
                        <span
                          style={styles.infoIcon}
                          title="UF não pode ser alterada após criação"
                        >
                          ℹ️
                        </span>
                      </label>
                      <input
                        type="text"
                        style={{
                          ...styles.input,
                          borderColor: "var(--warning)",
                          backgroundColor: "var(--theme-surface-secondary)",
                        }}
                        value={formData.uf || ""}
                        disabled={true}
                        required={formData.role === "user"}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.labelRequired}>
                        Município <span style={styles.required}>*</span>
                        <span
                          style={styles.infoIcon}
                          title="Localização não pode ser alterada após criação"
                        >
                          ℹ️
                        </span>
                      </label>
                      <input
                        type="text"
                        style={{
                          ...styles.input,
                          borderColor: "var(--warning)",
                          backgroundColor: "var(--theme-surface-secondary)",
                        }}
                        value={formData.municipio || ""}
                        disabled={true}
                        required={formData.role === "user"}
                      />
                    </div>
                  </>
                ) : (
                  /* Durante criação, verificar se deve ser readonly */
                  <MunicipioSelector
                    ufSelecionada={formData.uf || ""}
                    municipioSelecionado={formData.municipio || ""}
                    onUfChange={(uf) => {
                      // 🆕 Bloquear mudança se operador
                      if (currentUser?.tipo === 'operador') return;

                      setFormData({
                        ...formData,
                        uf: uf,
                        municipio: "" // Limpar município quando UF mudar
                      });
                    }}
                    onMunicipioChange={(municipio) => {
                      // 🆕 Bloquear mudança se operador
                      if (currentUser?.tipo === 'operador') return;

                      setFormData({
                        ...formData,
                        municipio: municipio
                      });
                    }}
                    disabled={saving || currentUser?.tipo === 'operador'} // 🆕 Desabilitar para operadores
                  />
                )}
              </div>

              {/* ✅ PREVIEW DA CONFIGURAÇÃO existente... */}
              {formData.municipio && formData.uf && (
                <div
                  style={{
                    ...styles.emendaInfo,
                    backgroundColor: "rgba(39, 174, 96, 0.1)",
                    borderColor: "var(--success)",
                    marginTop: "24px",
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
                    📍 <strong>Localização:</strong> {formData.municipio} / {formData.uf}
                    <br />
                    🔍 <strong>Acesso:</strong> Apenas emendas de {formData.municipio}
                    <br />
                    👤 <strong>Permissões:</strong> Visualizar, criar despesas
                    {currentUser?.tipo === 'operador' && (
                      <>
                        <br />
                        🔒 <strong>Restrito:</strong> Criado por operador de {currentUser.municipio}
                      </>
                    )}
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

          {/* ✅ AÇÕES DO FORMULÁRIO */}
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
                  <div style={styles.spinner}></div>
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

// ✅ ESTILOS PRINCIPAIS (com correções de espaçamento)
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

  container: formStyles.container,

  fieldset: {
    ...formStyles.fieldset,
    marginBottom: "24px", // Espaçamento entre fieldsets
  },

  legend: formStyles.legend,
  legendIcon: formStyles.legendIcon,

  formGrid: {
    ...formStyles.formGrid,
    gap: "24px", // Espaçamento entre colunas
  },

  formGroup: {
    ...formStyles.formGroup,
    marginBottom: "20px", // Espaçamento entre campos
  },

  label: {
    ...formStyles.label,
    marginBottom: "8px", // Espaçamento entre label e input
  },

  labelRequired: {
    ...formStyles.labelRequired,
    marginBottom: "8px", // Espaçamento entre label e input
  },

  required: formStyles.required,

  input: {
    ...formStyles.input,
    marginBottom: "4px", // Pequeno espaço para helpText
  },

  select: {
    ...formStyles.select,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "20px",
    paddingRight: "40px",
  },

  helpText: {
    ...formStyles.helpText,
    marginBottom: "8px", // Espaço após helpText
  },

  emendaInfo: formStyles.emendaInfo,
  emendaInfoTitle: formStyles.emendaInfoTitle,
  emendaInfoGrid: formStyles.emendaInfoGrid,
  emendaInfoRow: formStyles.emendaInfoRow,
  buttonContainer: formStyles.buttonContainer,
  cancelButtonStyle: formStyles.cancelButtonStyle,
  submitButton: formStyles.submitButton,

  infoIcon: {
    marginLeft: "6px",
    cursor: "help",
    color: "var(--primary)",
    fontSize: "14px",
    fontWeight: "bold",
  },

  operatorBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    borderRadius: "8px",
    border: "1px solid rgba(52, 152, 219, 0.3)",
    marginBottom: "20px",
  },

  operatorBannerIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },

  operatorBannerContent: {
    fontSize: "14px",
    color: "rgba(52, 152, 219, 0.8)",
    lineHeight: "1.4",
  },


  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid currentColor",
    borderRadius: "50%",
    animation: "userFormSpin 1s linear infinite",
  },

  // ✅ NOVOS ESTILOS PARA SEÇÃO COLAPSÁVEL
  securityPolicyWrapper: {
    margin: "0 24px 20px 24px",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "var(--theme-surface)",
    border: "1px solid var(--theme-border)",
  },

  securityToggleButton: {
    width: "100%",
    padding: "16px 20px",
    background: "linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.3s ease",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a237e",
    "&:hover": {
      background: "linear-gradient(135deg, #bbdefb 0%, #c5cae9 100%)",
    },
  },

  securityToggleIcon: {
    fontSize: "12px",
    transition: "transform 0.3s ease",
    display: "inline-block",
  },

  securityToggleText: {
    flex: 1,
    textAlign: "left",
  },

  securityBadge: {
    background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    color: "white",
    fontSize: "11px",
    padding: "4px 12px",
    borderRadius: "20px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },

  securityPolicyContent: {
    borderTop: "1px solid var(--theme-border)",
    animation: "slideDown 0.3s ease-out",
    overflow: "hidden",
  },
};

// ✅ ESTILOS DA SEÇÃO DE SEGURANÇA
const securityStyles = {
  container: {
    background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    padding: "32px",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
    position: "relative",
    overflow: "hidden",
  },

  backgroundPattern: {
    position: "absolute",
    top: "-50%",
    right: "-10%",
    width: "300px",
    height: "300px",
    background:
      "radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "32px",
    position: "relative",
    zIndex: 1,
  },

  iconWrapper: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    animation: "securityPulse 2s infinite",
  },

  mainIcon: {
    fontSize: "32px",
    filter: "brightness(2)",
  },

  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a237e",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#607d8b",
    margin: "4px 0 0 0",
  },

  badge: {
    background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    color: "white",
    fontSize: "12px",
    padding: "6px 16px",
    borderRadius: "24px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    display: "inline-block",
    animation: "badgeGlow 3s ease-in-out infinite",
  },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
    position: "relative",
    zIndex: 1,
  },

  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  cardIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#263238",
    margin: "0 0 8px 0",
    letterSpacing: "-0.3px",
  },

  cardText: {
    fontSize: "14px",
    color: "#607d8b",
    margin: "0",
    lineHeight: "1.6",
  },

  footer: {
    background: "linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    border: "1px solid rgba(76, 175, 80, 0.2)",
    position: "relative",
    zIndex: 1,
  },

  footerIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  footerContent: {
    flex: 1,
  },

  footerTitle: {
    fontSize: "16px",
    color: "#1b5e20",
    display: "block",
    marginBottom: "4px",
  },

  footerText: {
    fontSize: "14px",
    color: "#37474f",
    margin: "0",
    lineHeight: "1.6",
  },
};

// ✅ ADICIONAR ANIMAÇÕES CSS
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

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
      }
      to {
        opacity: 1;
        max-height: 800px;
      }
    }

    @keyframes securityPulse {
      0% {
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
      }
      50% {
        box-shadow: 0 4px 20px rgba(33, 150, 243, 0.5);
      }
      100% {
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
      }
    }

    @keyframes badgeGlow {
      0%, 100% {
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
      }
      50% {
        box-shadow: 0 2px 12px rgba(76, 175, 80, 0.5);
      }
    }

    /* Correção para selects */
    select {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
    }

    select:hover {
      border-color: var(--primary) !important;
    }

    select:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
    }

    /* Hover nos cards de segurança */
    .security-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    /* Hover no botão de toggle */
    .security-toggle-btn:hover {
      background: linear-gradient(135deg, #bbdefb 0%, #c5cae9 100%);
    }
  `;
  document.head.appendChild(styleSheet);
}

// ✅ EXPORT DEFAULT DO COMPONENTE
export default UserForm;