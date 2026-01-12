import React, { useState, useEffect } from "react";

export default function FirestoreRulesSection() {
  const [rulesContent, setRulesContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadFirestoreRules();
  }, []);

  const loadFirestoreRules = async () => {
    try {
      const response = await fetch("/firestore.rules");
      const content = await response.text();
      setRulesContent(content);
    } catch (error) {
      console.error("Erro ao carregar rules:", error);
      setRulesContent("// Erro ao carregar firestore.rules");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rulesContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, color: 'var(--theme-text-muted)' }}>description</span>
          <p style={{ color: 'var(--theme-text-muted)', marginTop: 16 }}>Carregando Firestore Rules...</p>
        </div>
      </div>
    );
  }

  const permissoes = [
    { perm: "Gerenciar Usuários", admin: true, gestor: false, operador: false },
    { perm: "Criar Emendas", admin: true, gestor: true, operador: true },
    { perm: "Editar Emendas", admin: true, gestor: true, operador: true },
    { perm: "Excluir Emendas", admin: true, gestor: true, operador: false },
    { perm: "Criar Despesas", admin: true, gestor: true, operador: true },
    { perm: "Editar Despesas", admin: true, gestor: true, operador: true },
    { perm: "Excluir Despesas", admin: true, gestor: true, operador: true },
    { perm: "Executar Despesas", admin: true, gestor: true, operador: true },
    { perm: "Ver Todos Municípios", admin: true, gestor: false, operador: false },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8, verticalAlign: 'middle' }}>security</span>
            Firestore Rules
          </h2>
          <p style={styles.subtitle}>Visualize e copie as regras de segurança para aplicar em PROD</p>
        </div>
      </div>

      {/* Instruções */}
      <div style={styles.infoCard}>
        <div style={styles.infoCardHeader}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
          <span style={{ fontWeight: 600 }}>Como aplicar em PROD</span>
        </div>
        <ol style={styles.instructionList}>
          <li>Copie as rules abaixo usando o botão</li>
          <li>Acesse o <a href="https://console.firebase.google.com/project/emendas-parlamentares-prod/firestore/rules" target="_blank" rel="noopener noreferrer" style={styles.link}>Firebase Console - PROD</a></li>
          <li>Cole no editor de Rules e clique em "Publicar"</li>
        </ol>
      </div>

      {/* Code Block */}
      <div style={styles.codeSection}>
        <div style={styles.codeSectionHeader}>
          <span style={styles.codeSectionTitle}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: 'middle' }}>code</span>
            firestore.rules ({rulesContent.split("\n").length} linhas)
          </span>
          <button onClick={copyToClipboard} style={styles.copyBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: 'middle' }}>
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <pre style={styles.codeBlock}>
          <code>{rulesContent}</code>
        </pre>
      </div>

      {/* Tabela de Permissões */}
      <div style={styles.tableSection}>
        <h3 style={styles.tableSectionTitle}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}>admin_panel_settings</span>
          Matriz de Permissões
        </h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Permissão</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Admin</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Gestor</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Operador</th>
              </tr>
            </thead>
            <tbody>
              {permissoes.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--theme-hover)' }}>
                  <td style={styles.td}>{row.perm}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: row.admin ? 'var(--success)' : 'var(--danger)' }}>
                      {row.admin ? 'check_circle' : 'cancel'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: row.gestor ? 'var(--success)' : 'var(--danger)' }}>
                      {row.gestor ? 'check_circle' : 'cancel'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: row.operador ? 'var(--success)' : 'var(--danger)' }}>
                      {row.operador ? 'check_circle' : 'cancel'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Links */}
      <div style={styles.linksSection}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)', marginRight: 8 }}>link</span>
        <a href="https://console.firebase.google.com/project/emendas-parlamentares-prod/firestore/rules" target="_blank" rel="noopener noreferrer" style={styles.link}>
          Firebase Console PROD
        </a>
        <span style={{ margin: '0 12px', color: 'var(--theme-border)' }}>|</span>
        <a href="https://firebase.google.com/docs/firestore/security/get-started" target="_blank" rel="noopener noreferrer" style={styles.link}>
          Documentação
        </a>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 0,
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--theme-text)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--theme-text-muted)',
    margin: '8px 0 0 0',
  },
  infoCard: {
    background: 'var(--info-bg)',
    border: '1px solid var(--info)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--info)',
    marginBottom: 12,
  },
  instructionList: {
    margin: 0,
    paddingLeft: 20,
    color: 'var(--theme-text-secondary)',
    fontSize: 14,
    lineHeight: 1.8,
  },
  link: {
    color: 'var(--primary)',
    textDecoration: 'none',
  },
  codeSection: {
    background: 'var(--theme-surface)',
    border: '1px solid var(--theme-border)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  codeSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--theme-border)',
    background: 'var(--theme-bg)',
  },
  codeSectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--theme-text)',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'var(--success)',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  codeBlock: {
    margin: 0,
    padding: 20,
    background: 'var(--theme-surface)',
    color: 'var(--theme-text)',
    fontSize: 13,
    lineHeight: 1.6,
    overflow: 'auto',
    maxHeight: 400,
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  },
  tableSection: {
    background: 'var(--theme-surface)',
    border: '1px solid var(--theme-border)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  tableSectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--theme-text)',
    margin: '0 0 16px 0',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    padding: 12,
    textAlign: 'left',
    borderBottom: '2px solid var(--theme-border)',
    color: 'var(--theme-text)',
    fontWeight: 600,
    background: 'var(--theme-bg)',
  },
  td: {
    padding: 12,
    borderBottom: '1px solid var(--theme-border)',
    color: 'var(--theme-text-secondary)',
  },
  linksSection: {
    display: 'flex',
    alignItems: 'center',
    padding: 16,
    background: 'var(--theme-surface)',
    border: '1px solid var(--theme-border)',
    borderRadius: 8,
    fontSize: 14,
  },
};
