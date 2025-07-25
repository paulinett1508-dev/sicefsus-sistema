// Administracao.jsx - Versão Final v3.1 - IMPORTS CORRIGIDOS
import React, { useState, useEffect, useMemo } from "react";
// As informações do usuário (role, email, município, uf) já são fornecidas via prop `usuario`.
// Não precisamos mais importar métodos de autenticação ou Firestore para verificar permissões aqui.
import AdminPanel from "./AdminPanel";
// Importa a lista de emails de administradores a partir do arquivo de
// constantes centralizado. Desta forma, novos administradores podem ser
// adicionados configurando a variável de ambiente VITE_ADMIN_EMAILS.
import { ADMIN_EMAILS } from "../config/constants";

const Administracao = ({ usuario }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // ✅ A lista de emails de administradores agora é lida de ADMIN_EMAILS.
  // Consulte src/config/constants.js para entender como configurá-la via .env.

  // Sempre que o usuário prop mudar, verifica as permissões com base nas
  // informações fornecidas pelo contexto. Não há mais fallback para buscar
  // dados no Firestore aqui, pois o usuário já vem completo do UserContext.
  useEffect(() => {
    console.log("🔍 ADMINISTRACAO DEBUG - Verificando permissões...");
    console.log("👤 Usuário prop completo:", {
      usuario,
      hasUsuario: !!usuario,
      email: usuario?.email,
      role: usuario?.role,
      uid: usuario?.uid,
      municipio: usuario?.municipio,
      uf: usuario?.uf,
      isActive: usuario?.isActive
    });
    console.log("📋 ADMIN_EMAILS configurados:", ADMIN_EMAILS);
    console.log("🔧 Firebase API Key presente:", !!import.meta.env.VITE_FIREBASE_API_KEY);

    setLoading(true);
    setError(null);

    // ✅ Verificar se Firebase está configurado
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setIsAdmin(false);
      setUserInfo(null);
      setError("Firebase não configurado. Configure as variáveis de ambiente no Secrets do Replit.");
      setLoading(false);
      console.error("❌ Firebase não configurado para administração");
      return;
    }

    if (!usuario) {
      setIsAdmin(false);
      setUserInfo(null);
      setError("Usuário não autenticado");
      setLoading(false);
      console.log("❌ Usuário não autenticado");
      return;
    }

    // Usa dados do usuário para definir info e permissões
    setUserInfo(usuario);
    const isUserAdmin =
      usuario.role === "admin" ||
      ADMIN_EMAILS.includes((usuario.email || "").toLowerCase());

    console.log("🔐 Verificação de permissões:", {
      userRole: usuario.role,
      userEmail: usuario.email,
      isRoleAdmin: usuario.role === "admin",
      isEmailAdmin: ADMIN_EMAILS.includes((usuario.email || "").toLowerCase()),
      finalIsAdmin: isUserAdmin
    });

    setIsAdmin(isUserAdmin);
    console.log("👑 Resultado final - É admin?", isUserAdmin);
    setLoading(false);
  }, [usuario]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Verificando permissões...</h3>
          <p>Aguarde enquanto validamos seu acesso ao painel administrativo</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Erro de Acesso</h3>
          <p>{error}</p>
          <div className="debug-info">
            <h4>Informações de Debug:</h4>
            <pre>{JSON.stringify({ usuario, userInfo, error }, null, 2)}</pre>
          </div>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <div className="denied-container">
          <div className="denied-icon">🚫</div>
          <h3>Acesso Negado</h3>
          <p>Você não tem permissão para acessar o painel administrativo.</p>
          <p>
            Apenas usuários com perfil de administrador podem acessar esta área.
          </p>
          <div className="user-info">
            <strong>Usuário atual:</strong>{" "}
            {userInfo?.email || "Não identificado"}
            <br />
            <strong>Perfil:</strong> {userInfo?.role || "Não definido"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="administracao-container">
      {/* ✅ CORREÇÃO: Header melhorado sem informações desnecessárias para admins */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">👑</div>
            <div className="header-info">
              <h1>Gestão de Usuários</h1>
              <div className="header-details">
                <span className="user-email">{userInfo?.email}</span>
                {/* ✅ CORREÇÃO: Só mostrar localização se não for admin */}
                {userInfo?.role !== "admin" &&
                  userInfo?.municipio &&
                  userInfo?.uf && (
                    <span className="user-location">
                      📍 {userInfo.municipio} - {userInfo.uf}
                    </span>
                  )}
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="admin-badge">
              <span className="badge-icon">👑</span>
              <span className="badge-text">Administrador</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Painel administrativo */}
      <div className="admin-content">
        <AdminPanel usuario={userInfo} />
      </div>

      <style>{`
        .administracao-container {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .admin-header {
          background: linear-gradient(135deg, #154360 0%, #1e5f7a 100%);
          color: white;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .header-info h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
        }

        .header-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
          opacity: 0.9;
        }

        .user-email {
          font-weight: 500;
        }

        .user-location {
          font-size: 13px;
          opacity: 0.8;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .admin-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 10px 16px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .badge-icon {
          font-size: 16px;
        }

        .admin-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 25px;
        }

        .admin-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .loading-container {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e1e5e9;
          border-top: 4px solid #154360;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .loading-container h3 {
          margin: 0 0 10px 0;
          color: #154360;
          font-size: 20px;
        }

        .loading-container p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .admin-error {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .error-container {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .error-container h3 {
          margin: 0 0 15px 0;
          color: #E74C3C;
          font-size: 24px;
        }

        .error-container p {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 16px;
        }

        .debug-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }

        .debug-info h4 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 14px;
        }

        .debug-info pre {
          font-size: 12px;
          color: #666;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .retry-button {
          background: #154360;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          background: #1e5f7a;
          transform: translateY(-1px);
        }

        .admin-denied {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .denied-container {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }

        .denied-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .denied-container h3 {
          margin: 0 0 15px 0;
          color: #E74C3C;
          font-size: 24px;
        }

        .denied-container p {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 16px;
          line-height: 1.5;
        }

        .user-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          text-align: left;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .admin-header {
            padding: 20px 15px;
          }

          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .header-left {
            flex-direction: column;
            gap: 15px;
          }

          .header-info h1 {
            font-size: 24px;
          }

          .admin-content {
            padding: 20px 15px;
          }

          .loading-container,
          .error-container,
          .denied-container {
            margin: 20px;
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Administracao;