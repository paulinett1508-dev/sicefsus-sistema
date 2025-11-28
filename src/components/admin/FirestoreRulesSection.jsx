import React, { useState, useEffect } from "react";
import "../../styles/adminStyles.css";

export default function FirestoreRulesSection() {
  const [rulesContent, setRulesContent] = useState("");
  const [loading, setLoading] = useState(true);

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
      setRulesContent("// ❌ Erro ao carregar firestore.rules");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rulesContent);
    alert("✅ Rules copiadas para a área de transferência!");
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>⏳ Carregando Firestore Rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>🔐 Firestore Rules - Validação e Aplicação</h2>
        <p>
          Visualize as rules atuais de DEV e aplique manualmente em PROD via
          Firebase Console
        </p>
      </div>

      {/* Banner de Instruções */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
          📋 Como Aplicar as Rules em PROD
        </h3>
        <ol style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.8" }}>
          <li>
            <strong>Copie as Rules abaixo</strong> (botão "📋 Copiar Rules")
          </li>
          <li>
            Acesse o{" "}
            <a
              href="https://console.firebase.google.com/project/emendas-parlamentares-prod/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ffd700", textDecoration: "underline" }}
            >
              Firebase Console - PROD
            </a>
          </li>
          <li>
            Navegue até <strong>Firestore Database → Rules</strong>
          </li>
          <li>
            <strong>Cole as Rules</strong> no editor
          </li>
          <li>
            Clique em <strong>"Publicar"</strong> para aplicar
          </li>
        </ol>
      </div>

      {/* Verificação de Perfil Gestor */}
      <div
        style={{
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>
          ⚠️ Verificação Importante
        </h4>
        <p style={{ margin: 0, color: "#856404" }}>
          As rules abaixo já contemplam o perfil <strong>Gestor</strong> com
          todas as permissões necessárias:
        </p>
        <ul style={{ margin: "10px 0 0 0", color: "#856404" }}>
          <li>✅ Função <code>isGestor()</code> implementada</li>
          <li>✅ Permissões de leitura/criação/edição de emendas</li>
          <li>✅ Permissões de exclusão de emendas (diferente do Operador)</li>
          <li>✅ Permissões de leitura/criação/edição de despesas</li>
          <li>✅ Permissões de exclusão de despesas (diferente do Operador)</li>
        </ul>
      </div>

      {/* Visualização das Rules */}
      <div
        style={{
          background: "#f8f9fa",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ margin: 0 }}>
            📄 Rules Atuais (DEV - {rulesContent.split("\n").length} linhas)
          </h3>
          <button
            onClick={copyToClipboard}
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            📋 Copiar Rules
          </button>
        </div>

        <pre
          style={{
            background: "#1e1e1e",
            color: "#d4d4d4",
            padding: "20px",
            borderRadius: "8px",
            overflow: "auto",
            maxHeight: "600px",
            fontSize: "13px",
            lineHeight: "1.6",
            margin: 0,
            border: "1px solid #333",
          }}
        >
          <code>{rulesContent}</code>
        </pre>
      </div>

      {/* Diferenças entre Perfis */}
      <div
        style={{
          background: "white",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0" }}>
          🔍 Diferenças de Permissões por Perfil
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                Permissão
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                Admin
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                Gestor
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                Operador
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                perm: "Gerenciar Usuários",
                admin: "✅",
                gestor: "❌",
                operador: "❌",
              },
              {
                perm: "Criar Emendas",
                admin: "✅",
                gestor: "✅",
                operador: "✅",
              },
              {
                perm: "Editar Emendas",
                admin: "✅",
                gestor: "✅",
                operador: "✅",
              },
              {
                perm: "Excluir Emendas",
                admin: "✅",
                gestor: "✅",
                operador: "❌",
              },
              {
                perm: "Criar Despesas",
                admin: "✅ Total",
                gestor: "✅ Município",
                operador: "✅ Município",
              },
              {
                perm: "Editar Despesas",
                admin: "✅ Total",
                gestor: "✅ Município",
                operador: "✅ Município",
              },
              {
                perm: "Excluir Despesas",
                admin: "✅ Total",
                gestor: "✅ Município",
                operador: "❌ Bloqueado",
              },
              {
                perm: "Executar Despesas",
                admin: "✅ Total",
                gestor: "✅ Município",
                operador: "❌ Bloqueado",
              },
              {
                perm: "Ver Todos os Municípios",
                admin: "✅",
                gestor: "❌",
                operador: "❌",
              },
            ].map((row, idx) => (
              <tr
                key={idx}
                style={{
                  background: idx % 2 === 0 ? "white" : "#f8f9fa",
                }}
              >
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  {row.perm}
                </td>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  {row.admin}
                </td>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  {row.gestor}
                </td>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  {row.operador}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Links Úteis */}
      <div
        style={{
          background: "#e7f3ff",
          border: "1px solid #2196F3",
          borderRadius: "8px",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#1976d2" }}>
          🔗 Links Úteis
        </h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#1976d2" }}>
          <li>
            <a
              href="https://console.firebase.google.com/project/emendas-parlamentares-prod/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1976d2" }}
            >
              Firebase Console PROD - Firestore Rules
            </a>
          </li>
          <li>
            <a
              href="https://firebase.google.com/docs/firestore/security/get-started"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1976d2" }}
            >
              Documentação Firebase - Security Rules
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}