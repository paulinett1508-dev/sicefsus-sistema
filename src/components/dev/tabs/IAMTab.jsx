
// src/components/dev/tabs/IAMTab.jsx
import React, { useState } from "react";
import AlertaBanner from "../shared/AlertaBanner";

const IAMTab = () => {
  const [loading, setLoading] = useState(false);
  const [comparacao, setComparacao] = useState(null);

  // Dados das permissões IAM (baseado nas imagens fornecidas)
  const permissoesDEV = {
    projeto: "emendas-parlamentares-60dbd",
    serviceAccount: {
      email: "firebase-adminsdk-lkumj@emendas-parlamentares-60dbd.iam.gserviceaccount.com",
      papeis: [
        "Administrador de armazenamento",
        "Administrador do Firebase Authentication",
        "Agente de serviço administrador do SDK Admin do Firebase",
        "Criador do token da conta de serviço"
      ]
    },
    usuarios: [
      {
        email: "paulinett1508@gmail.com",
        nome: "Miranda",
        papel: "Proprietário",
        permissoesExcedentes: "11957/12245"
      }
    ]
  };

  const permissoesPROD = {
    projeto: "emendas-parlamentares-prod",
    serviceAccount: {
      email: "firebase-adminsdk-fbsvc@emendas-parlamentares-prod.iam.gserviceaccount.com",
      papeis: [
        "Administrador de armazenamento",
        "Administrador do Firebase Authentication",
        "Agente de serviço administrador do SDK Admin do Firebase",
        "Criador do token da conta de serviço"
      ]
    },
    usuarios: [
      {
        email: "paulinett1508@gmail.com",
        nome: "Miranda",
        papel: "Proprietário",
        permissoesExcedentes: "11957/12245"
      }
    ]
  };

  const compararPermissoes = () => {
    setLoading(true);

    setTimeout(() => {
      const diferencas = [];
      const semelhancas = [];

      // Comparar Service Accounts
      if (permissoesDEV.serviceAccount.papeis.length === permissoesPROD.serviceAccount.papeis.length) {
        const papeisDiferentes = permissoesDEV.serviceAccount.papeis.filter(
          papel => !permissoesPROD.serviceAccount.papeis.includes(papel)
        );

        if (papeisDiferentes.length === 0) {
          semelhancas.push({
            tipo: "service_account",
            mensagem: "✅ Service Accounts têm os mesmos papéis em DEV e PROD"
          });
        } else {
          diferencas.push({
            tipo: "service_account",
            mensagem: "⚠️ Papéis diferentes entre Service Accounts",
            detalhes: papeisDiferentes
          });
        }
      }

      // Comparar Usuários
      const usuariosDEV = permissoesDEV.usuarios.map(u => u.email);
      const usuariosPROD = permissoesPROD.usuarios.map(u => u.email);

      if (JSON.stringify(usuariosDEV) === JSON.stringify(usuariosPROD)) {
        semelhancas.push({
          tipo: "usuarios",
          mensagem: "✅ Mesmos usuários com acesso em DEV e PROD"
        });
      } else {
        diferencas.push({
          tipo: "usuarios",
          mensagem: "⚠️ Diferenças nos usuários com acesso"
        });
      }

      setComparacao({ diferencas, semelhancas });
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <AlertaBanner
        tipo="info"
        titulo="🔐 Comparação de Permissões IAM"
        mensagem="Visualize e compare as permissões IAM entre os ambientes DEV e PROD do Firebase"
      />

      <div style={styles.actionSection}>
        <button
          onClick={compararPermissoes}
          disabled={loading}
          style={styles.compareButton}
        >
          {loading ? "⏳ Comparando..." : "🔍 Comparar Permissões IAM"}
        </button>
      </div>

      {comparacao && (
        <>
          {/* Semelhanças */}
          {comparacao.semelhancas.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>✅ Configurações Idênticas</h3>
              {comparacao.semelhancas.map((item, idx) => (
                <div key={idx} style={styles.successCard}>
                  <p style={styles.successText}>{item.mensagem}</p>
                </div>
              ))}
            </div>
          )}

          {/* Diferenças */}
          {comparacao.diferencas.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>⚠️ Diferenças Encontradas</h3>
              {comparacao.diferencas.map((item, idx) => (
                <div key={idx} style={styles.warningCard}>
                  <p style={styles.warningText}>{item.mensagem}</p>
                  {item.detalhes && (
                    <ul>
                      {item.detalhes.map((detalhe, i) => (
                        <li key={i}>{detalhe}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tabela Comparativa Detalhada */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📊 Comparação Detalhada</h3>
            
            <div style={styles.comparisonGrid}>
              {/* Coluna DEV */}
              <div style={styles.column}>
                <h4 style={styles.columnTitle}>🧪 DEV</h4>
                <div style={styles.card}>
                  <p><strong>Projeto:</strong> {permissoesDEV.projeto}</p>
                  
                  <h5 style={styles.subTitle}>Service Account</h5>
                  <p style={styles.emailText}>{permissoesDEV.serviceAccount.email}</p>
                  <ul style={styles.rolesList}>
                    {permissoesDEV.serviceAccount.papeis.map((papel, i) => (
                      <li key={i}>{papel}</li>
                    ))}
                  </ul>

                  <h5 style={styles.subTitle}>Usuários</h5>
                  {permissoesDEV.usuarios.map((user, i) => (
                    <div key={i} style={styles.userCard}>
                      <p><strong>{user.nome}</strong></p>
                      <p>{user.email}</p>
                      <p>Papel: <strong>{user.papel}</strong></p>
                      <p>Permissões: {user.permissoesExcedentes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna PROD */}
              <div style={styles.column}>
                <h4 style={styles.columnTitle}>🚀 PROD</h4>
                <div style={styles.card}>
                  <p><strong>Projeto:</strong> {permissoesPROD.projeto}</p>
                  
                  <h5 style={styles.subTitle}>Service Account</h5>
                  <p style={styles.emailText}>{permissoesPROD.serviceAccount.email}</p>
                  <ul style={styles.rolesList}>
                    {permissoesPROD.serviceAccount.papeis.map((papel, i) => (
                      <li key={i}>{papel}</li>
                    ))}
                  </ul>

                  <h5 style={styles.subTitle}>Usuários</h5>
                  {permissoesPROD.usuarios.map((user, i) => (
                    <div key={i} style={styles.userCard}>
                      <p><strong>{user.nome}</strong></p>
                      <p>{user.email}</p>
                      <p>Papel: <strong>{user.papel}</strong></p>
                      <p>Permissões: {user.permissoesExcedentes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          <div style={styles.linksSection}>
            <h4 style={styles.linksTitle}>🔗 Links Rápidos</h4>
            <div style={styles.linksGrid}>
              <a
                href={`https://console.cloud.google.com/iam-admin/iam?project=${permissoesDEV.projeto}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                🧪 IAM DEV →
              </a>
              <a
                href={`https://console.cloud.google.com/iam-admin/iam?project=${permissoesPROD.projeto}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                🚀 IAM PROD →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },
  actionSection: {
    marginTop: "20px",
    textAlign: "center",
  },
  compareButton: {
    padding: "12px 24px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  section: {
    marginTop: "30px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  successCard: {
    padding: "15px",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  successText: {
    color: "#155724",
    margin: 0,
  },
  warningCard: {
    padding: "15px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  warningText: {
    color: "#856404",
    margin: "0 0 10px 0",
  },
  comparisonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "20px",
  },
  column: {
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    overflow: "hidden",
  },
  columnTitle: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    margin: 0,
    textAlign: "center",
    borderBottom: "1px solid #dee2e6",
  },
  card: {
    padding: "20px",
  },
  subTitle: {
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "15px",
    marginBottom: "10px",
    color: "#495057",
  },
  emailText: {
    fontSize: "12px",
    color: "#6c757d",
    wordBreak: "break-all",
    backgroundColor: "#f8f9fa",
    padding: "8px",
    borderRadius: "4px",
  },
  rolesList: {
    fontSize: "13px",
    lineHeight: "1.8",
    paddingLeft: "20px",
  },
  userCard: {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "10px",
    fontSize: "13px",
  },
  linksSection: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#e7f3ff",
    borderRadius: "8px",
  },
  linksTitle: {
    margin: "0 0 15px 0",
    color: "#1976d2",
  },
  linksGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  link: {
    display: "block",
    padding: "10px",
    backgroundColor: "white",
    color: "#1976d2",
    textDecoration: "none",
    borderRadius: "6px",
    textAlign: "center",
    border: "1px solid #2196F3",
  },
};

export default IAMTab;
