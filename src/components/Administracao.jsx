import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import AdminPanel from "./AdminPanel";
import DataManager from "./DataManager";

const Administracao = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    checkAdminPermission();
  }, [currentUser]);

  const checkAdminPermission = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Buscar informações do usuário no Firestore
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserInfo(userData);
        setIsAdmin(userData.role === "admin");
      } else {
        // Se não encontrar o documento, verificar se o email está em uma lista de admins
        const adminEmails = [
          "admin@sicefsus.gov.br",
          "administrador@sicefsus.gov.br",
          currentUser.email, // Temporário para desenvolvimento
        ];
        setIsAdmin(adminEmails.includes(currentUser.email));
      }
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Verificando permissões...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-unauthorized">
        <div className="unauthorized-content">
          <div className="unauthorized-icon">🔐</div>
          <h2>Acesso Negado</h2>
          <p>
            Você não tem permissão para acessar o painel administrativo.
            <br />
            Apenas usuários com perfil de administrador podem acessar esta área.
          </p>
          <div className="user-info">
            <strong>Usuário:</strong> {currentUser?.email}
            <br />
            <strong>Perfil:</strong> {userInfo?.role || "user"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="administracao-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>⚙️ Administração do Sistema</h1>
          <div className="admin-info">
            <span className="admin-badge">👑 Administrador</span>
            <span className="admin-user">{currentUser?.email}</span>
          </div>
        </div>
      </div>

      <div className="admin-navigation">
        <button
          className={`nav-tab ${activeTab === "usuarios" ? "active" : ""}`}
          onClick={() => setActiveTab("usuarios")}
        >
          👥 Gestão de Usuários
        </button>
        <button
          className={`nav-tab ${activeTab === "dados" ? "active" : ""}`}
          onClick={() => setActiveTab("dados")}
        >
          📊 Gestão de Dados
        </button>
        <button
          className={`nav-tab ${activeTab === "configuracoes" ? "active" : ""}`}
          onClick={() => setActiveTab("configuracoes")}
        >
          ⚙️ Configurações
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "usuarios" && <AdminPanel />}
        {activeTab === "dados" && <DataManager />}
        {activeTab === "configuracoes" && (
          <div className="config-section">
            <div className="config-card">
              <h2>⚙️ Configurações do Sistema</h2>

              <div className="config-item">
                <h3>🔐 Segurança</h3>
                <p>Configurações de segurança e autenticação</p>
                <div className="config-actions">
                  <button className="btn-secondary" disabled>
                    Configurar 2FA (Em breve)
                  </button>
                  <button className="btn-secondary" disabled>
                    Políticas de Senha (Em breve)
                  </button>
                </div>
              </div>

              <div className="config-item">
                <h3>📧 Notificações</h3>
                <p>Configurar notificações por email e sistema</p>
                <div className="config-actions">
                  <button className="btn-secondary" disabled>
                    Email Templates (Em breve)
                  </button>
                  <button className="btn-secondary" disabled>
                    Alertas Automáticos (Em breve)
                  </button>
                </div>
              </div>

              <div className="config-item">
                <h3>🎨 Interface</h3>
                <p>Personalização da interface do sistema</p>
                <div className="config-actions">
                  <button className="btn-secondary" disabled>
                    Temas (Em breve)
                  </button>
                  <button className="btn-secondary" disabled>
                    Logo/Marca (Em breve)
                  </button>
                </div>
              </div>

              <div className="config-item">
                <h3>📈 Relatórios</h3>
                <p>Configurações de relatórios e dashboard</p>
                <div className="config-actions">
                  <button className="btn-secondary" disabled>
                    Templates Personalizados (Em breve)
                  </button>
                  <button className="btn-secondary" disabled>
                    Agendamento (Em breve)
                  </button>
                </div>
              </div>

              <div className="config-item">
                <h3>🔌 Integrações</h3>
                <p>Configurar integrações com sistemas externos</p>
                <div className="config-actions">
                  <button className="btn-secondary" disabled>
                    API Governo (Em breve)
                  </button>
                  <button className="btn-secondary" disabled>
                    Webhooks (Em breve)
                  </button>
                </div>
              </div>

              <div className="development-note">
                <h4>🚀 Roadmap de Desenvolvimento</h4>
                <p>
                  As funcionalidades marcadas como "Em breve" estão planejadas
                  para as próximas versões do sistema. As features principais
                  (Gestão de Usuários e Gestão de Dados) já estão 100%
                  funcionais.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .administracao-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .admin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .admin-unauthorized {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          padding: 20px;
        }

        .unauthorized-content {
          background: white;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          max-width: 500px;
          border: 2px solid #dc3545;
        }

        .unauthorized-icon {
          font-size: 4em;
          margin-bottom: 20px;
        }

        .unauthorized-content h2 {
          color: #dc3545;
          margin-bottom: 15px;
        }

        .unauthorized-content p {
          color: #6c757d;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .user-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          color: #495057;
          font-size: 0.9em;
          text-align: left;
        }

        .admin-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          margin: 0;
          font-size: 1.8em;
        }

        .admin-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }

        .admin-badge {
          background: rgba(255,255,255,0.2);
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.9em;
          font-weight: 500;
        }

        .admin-user {
          font-size: 0.9em;
          opacity: 0.9;
        }

        .admin-navigation {
          display: flex;
          background: white;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .nav-tab {
          flex: 1;
          padding: 15px 20px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          font-size: 16px;
        }

        .nav-tab.active {
          background: #007bff;
          color: white;
        }

        .nav-tab:hover:not(.active) {
          background: #e9ecef;
        }

        .admin-content {
          min-height: 500px;
        }

        .config-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .config-card {
          padding: 25px;
        }

        .config-card h2 {
          margin: 0 0 30px 0;
          color: #2c3e50;
          font-size: 1.5em;
        }

        .config-item {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .config-item h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 1.2em;
        }

        .config-item p {
          margin: 0 0 15px 0;
          color: #6c757d;
        }

        .config-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-secondary:disabled {
          background: #adb5bd;
          cursor: not-allowed;
        }

        .development-note {
          background: #e7f3ff;
          border: 1px solid #b8daff;
          border-radius: 8px;
          padding: 20px;
          margin-top: 30px;
        }

        .development-note h4 {
          margin: 0 0 10px 0;
          color: #004085;
        }

        .development-note p {
          margin: 0;
          color: #004085;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .administracao-container {
            padding: 10px;
          }

          .header-content {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
            text-align: center;
          }

          .admin-info {
            align-items: center;
          }

          .admin-navigation {
            flex-direction: column;
          }

          .config-actions {
            flex-direction: column;
          }

          .unauthorized-content {
            margin: 10px;
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Administracao;
