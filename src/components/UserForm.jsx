// src/components/UserForm.jsx - VERSÃO COMPLETA COM CORREÇÕES PARA EDIÇÃO ADMIN→OPERADOR
import React, { useEffect } from "react";
import MunicipioSelector from "./MunicipioSelector";
import { useUser } from "../context/UserContext";
import { formStyles, addFormInteractivity } from "../utils/formStyles";

const UserForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingUser,
  saving = false,
  usuario, // ✅ PROP NECESSÁRIA
}) => {
  const { user: currentUser } = useUser(); // Usuário logado atual

  // ✅ Estado para controlar exibição da política de segurança
  const [showSecurityPolicy, setShowSecurityPolicy] = React.useState(false);

  // ✅ Estado para controlar erros do formulário
  const [errors, setErrors] = React.useState({});

  // 🆕 ESTADOS PARA CONTROLE DE EDIÇÃO DINÂMICA
  const [tipoAlteradoDuranteEdicao, setTipoAlteradoDuranteEdicao] =
    React.useState(false);
  const [municipioSelectorKey, setMunicipioSelectorKey] = React.useState(0);

  // ✅ Adicionar interatividade dos formulários
  useEffect(() => {
    if (typeof addFormInteractivity === "function") {
      addFormInteractivity();
    }
  }, []);

  // 🔧 HANDLER ATUALIZADO PARA MUDANÇA DE TIPO
  const handleTipoChange = (newTipo) => {
    console.log("🔄 Mudando tipo de usuário para:", newTipo);

    // 🆕 Detectar se está editando E mudou o tipo
    const mudouTipoEdicao = editingUser && editingUser.role !== newTipo;

    if (mudouTipoEdicao) {
      console.log("🔄 Mudança de tipo detectada durante edição!");
      setTipoAlteradoDuranteEdicao(true);

      // 🆕 Forçar re-render do MunicipioSelector
      setMunicipioSelectorKey((prev) => prev + 1);
    }

    setFormData({
      ...formData,
      role: newTipo,
      // 🔧 Se mudou para admin, limpa localização
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

    // Validação para operadores e gestores
    if (formData.role === "user" || formData.role === "gestor") {
      if (!formData.municipio?.trim()) {
        alert(`Município é obrigatório para ${formData.role === "gestor" ? "gestores" : "operadores"}`);
        return;
      }
      if (!formData.uf?.trim()) {
        alert(`UF é obrigatória para ${formData.role === "gestor" ? "gestores" : "operadores"}`);
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
        role:
          editingUser.role || editingUser.tipo === "admin" ? "admin" : "user",
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
    // Reset estados de edição
    setTipoAlteradoDuranteEdicao(false);
    setMunicipioSelectorKey(0);
  }, [editingUser, setFormData]);

  // ✅ useEffect para pré-preencher município/UF para operadores ao criar novo usuário
  useEffect(() => {
    // Pré-preencher município/UF para operadores
    if (
      !editingUser &&
      currentUser?.tipo === "operador" &&
      currentUser?.municipio &&
      currentUser?.uf
    ) {
      setFormData((prev) => ({
        ...prev,
        municipio: currentUser.municipio,
        uf: currentUser.uf,
        role: "user", // Operadores só podem criar outros operadores
      }));
    }
  }, [editingUser, currentUser, setFormData]);

  // 🆕 FUNÇÃO PARA RENDERIZAR LOCALIZAÇÃO DINAMICAMENTE
  const renderLocalizacaoSection = () => {
    // ❌ Se não é operador nem gestor, não mostra nada
    if (formData.role !== "user" && formData.role !== "gestor") return null;

    // ✅ Se está criando usuário OU se houve mudança de tipo, mostra campos habilitados
    const mostrarCamposHabilitados = !editingUser || tipoAlteradoDuranteEdicao;

    return (
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
          Localização de Acesso (OBRIGATÓRIO PARA OPERADORES E GESTORES)
          <span
            style={styles.infoIcon}
            title="Operadores e Gestores só podem visualizar e gerenciar emendas do município cadastrado"
          >
            ℹ️
          </span>
        </legend>

        {/* 🆕 BANNER INFORMATIVO PARA MUDANÇA DE TIPO */}
        {tipoAlteradoDuranteEdicao && (
          <div
            style={{
              ...styles.operatorBanner,
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              borderColor: "rgba(76, 175, 80, 0.3)",
            }}
          >
            <div style={styles.operatorBannerIcon}>🔄</div>
            <div style={styles.operatorBannerContent}>
              <strong>Tipo alterado para Operador:</strong>
              <br />
              Defina a localização de acesso para este usuário.
            </div>
          </div>
        )}

        {/* 🆕 Banner informativo para operadores criando usuário */}
        {currentUser?.tipo === "operador" && !editingUser && (
          <div style={styles.operatorBanner}>
            <div style={styles.operatorBannerIcon}>📍</div>
            <div style={styles.operatorBannerContent}>
              <strong>Pré-preenchimento automático:</strong>
              <br />
              Como operador, você só pode criar usuários para o seu município (
              {currentUser.municipio}/{currentUser.uf})
            </div>
          </div>
        )}

        {mostrarCamposHabilitados ? (
          /* ✅ CAMPOS HABILITADOS - Criação OU Mudança de tipo */
          <div style={styles.formGroup}>
            {/* 🆕 MUNICIPIO SELECTOR COM KEY PARA FORÇAR RE-RENDER */}
            <MunicipioSelector
              key={`municipio-${municipioSelectorKey}-${formData.uf}`} // ✅ Key dinâmica
              ufSelecionada={formData.uf || ""}
              municipioSelecionado={formData.municipio || ""}
              onUfChange={(uf) => {
                console.log("🔄 UF mudou via MunicipioSelector:", uf);
                setFormData({
                  ...formData,
                  uf: uf,
                  municipio: "",
                });
              }}
              onMunicipioChange={(municipio) => {
                console.log("🔄 Município selecionado:", municipio);
                setFormData({
                  ...formData,
                  municipio: municipio,
                });
              }}
              disabled={
                saving ||
                (currentUser?.tipo === "operador" && !tipoAlteradoDuranteEdicao)
              }
              style={{
                borderColor: tipoAlteradoDuranteEdicao
                  ? "var(--success)"
                  : "var(--primary)",
                backgroundColor: tipoAlteradoDuranteEdicao
                  ? "rgba(39, 174, 96, 0.05)"
                  : "transparent",
              }}
            />

            {tipoAlteradoDuranteEdicao && (
              <small style={{ ...styles.helpText, color: "var(--success)" }}>
                ✅ Selecione o estado e município para o operador
              </small>
            )}
          </div>
        ) : (
          /* ❌ CAMPOS DESABILITADOS - Edição sem mudança de tipo */
          <div style={styles.formGroup}>
            {/* Usar MunicipioSelector desabilitado para manter consistência */}
            <MunicipioSelector
              ufSelecionada={formData.uf || ""}
              municipioSelecionado={formData.municipio || ""}
              onUfChange={() => {}} // Não faz nada quando desabilitado
              onMunicipioChange={() => {}} // Não faz nada quando desabilitado
              disabled={true} // Sempre desabilitado neste caso
              style={{
                borderColor: "var(--secondary)",
                backgroundColor: "var(--theme-surface-secondary)",
              }}
            />

            {/* 🆕 BOTÃO PARA PERMITIR EDIÇÃO */}
            <div
              style={{
                textAlign: "center",
                marginTop: "16px",
                padding: "16px",
                backgroundColor: "rgba(52, 152, 219, 0.1)",
                borderRadius: "8px",
                border: "1px dashed rgba(52, 152, 219, 0.3)",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "var(--primary)",
                }}
              >
                💡 <strong>Dica:</strong> Para alterar a localização, mude o
                tipo de usuário acima.
              </p>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => {
                  // Forçar mudança para admin e depois permitir volta para operador
                  handleTipoChange("admin");
                  setTimeout(() => {
                    handleTipoChange("user");
                  }, 100);
                }}
                disabled={saving}
              >
                🔄 Habilitar Edição de Localização
              </button>
            </div>
          </div>
        )}

        {/* ✅ PREVIEW DA CONFIGURAÇÃO */}
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
              {tipoAlteradoDuranteEdicao && (
                <span style={{ fontSize: "12px", color: "var(--warning)" }}>
                  (Modificado)
                </span>
              )}
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
              🔍 <strong>Acesso:</strong> Apenas emendas de {formData.municipio}
              <br />
              👤 <strong>Permissões:</strong> {formData.role === "gestor" 
                ? "Visualizar, criar, editar e deletar emendas/despesas"
                : "Visualizar, criar despesas"}
            </div>
          </div>
        )}
      </fieldset>
    );
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

        {/* ✅ SEÇÃO DE POLÍTICA DE SEGURANÇA - COLAPSÍVEL NO TOPO */}
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
                  disabled={
                    saving ||
                    (editingUser &&
                      currentUser?.tipo === "operador" &&
                      editingUser.id !== currentUser.id)
                  }
                  required
                >
                  <option value="user">👤 Operador</option>
                  <option value="gestor">🏛️ Gestor</option>
                  <option value="admin">👑 Administrador</option>
                </select>
                <small style={styles.helpText}>
                  {formData.role === "admin"
                    ? "🌐 Acesso total ao sistema (todos os municípios)"
                    : formData.role === "gestor"
                    ? "🏛️ Gerencia emendas/despesas do município (pode deletar)"
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

          {/* 🔧 SEÇÃO DE LOCALIZAÇÃO RENDERIZADA DINAMICAMENTE */}
          {renderLocalizacaoSection()}

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
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    border: "2px solid #3498db",
    color: "#2c3e50",
    animation: "userFormSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    transition: "all 0.3s ease",
  },

  header: {
    padding: "20px",
    borderRadius: "12px 12px 0 0",
    borderBottom: "2px solid #ecf0f1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    color: "white",
  },

  headerTitle: {
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

  container: {
    padding: "24px",
  },

  fieldset: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "24px",
  },

  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid #154360",
    color: "#154360",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  legendIcon: {
    fontSize: "16px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
    fontSize: "14px",
  },

  labelRequired: {
    display: "block",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
    fontSize: "14px",
  },

  required: {
    color: "#e74c3c",
    marginLeft: "4px",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "2px solid #bdc3c7",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    marginBottom: "4px",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    padding: "12px",
    border: "2px solid #bdc3c7",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "20px",
    paddingRight: "40px",
    boxSizing: "border-box",
  },

  helpText: {
    fontSize: "12px",
    color: "#7f8c8d",
    fontStyle: "italic",
    marginBottom: "8px",
  },

  emendaInfo: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    padding: "16px",
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #e9ecef",
  },

  cancelButtonStyle: {
    padding: "12px 24px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  submitButton: {
    padding: "12px 24px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  infoIcon: {
    marginLeft: "6px",
    cursor: "help",
    color: "#3498db",
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

  // ✅ NOVOS ESTILOS PARA SEÇÃO COLAPSÍVEL
  securityPolicyWrapper: {
    margin: "0 24px 20px 24px",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "white",
    border: "1px solid #e9ecef",
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
    borderTop: "1px solid #e9ecef",
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

    select {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
    }

    select:hover {
      border-color: #3498db !important;
    }

    select:focus {
      border-color: #3498db !important;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
    }

    input:focus {
      border-color: #3498db !important;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
      outline: none !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default UserForm;
