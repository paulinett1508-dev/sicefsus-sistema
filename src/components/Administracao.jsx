// Administracao.jsx - Versão Final v3.1 - IMPORTS CORRIGIDOS
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // ✅ CORREÇÃO: Imports completos do Firestore
import { db } from "../firebase/firebaseConfig";
import AdminPanel from "./AdminPanel";

const Administracao = ({ usuario }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Lista de emails admin como fallback
  const adminEmails = [
    "paulinett1508@gmail.com",
    "admin@sistema.com",
    "administrador@sistema.com",
  ];

  useEffect(() => {
    checkAdminPermissions();
  }, [usuario]);

  const checkAdminPermissions = async () => {
    try {
      console.log("🔍 Verificando permissões de admin...");
      console.log("👤 Usuário prop:", usuario);

      setLoading(true);
      setError(null);

      // ✅ CORREÇÃO: Usar dados do prop primeiro
      if (usuario && usuario.role) {
        console.log("✅ Usando dados do usuário prop");
        setUserInfo(usuario);
        const isUserAdmin =
          usuario.role === "admin" || adminEmails.includes(usuario.email);
        setIsAdmin(isUserAdmin);
        console.log("👑 É admin?", isUserAdmin);
        setLoading(false);
        return;
      }

      // Fallback: buscar dados no Firestore
      console.log("⚠️ Dados do prop não disponíveis, buscando no Firestore...");
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("❌ Usuário não autenticado");
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      console.log("🔍 Buscando dados no Firestore para:", currentUser.email);

      // ✅ CORREÇÃO: Agora com imports corretos
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", currentUser.email),
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        console.log("📄 Dados encontrados no Firestore:", userData);

        setUserInfo({
          ...userData,
          uid: currentUser.uid,
          email: currentUser.email,
        });

        const isUserAdmin =
          userData.role === "admin" || adminEmails.includes(currentUser.email);
        setIsAdmin(isUserAdmin);
        console.log("👑 É admin (Firestore)?", isUserAdmin);
      } else {
        // Último fallback: verificar se email está na lista de admins
        console.log(
          "⚠️ Usuário não encontrado no Firestore, verificando lista de admins...",
        );
        const isUserAdmin = adminEmails.includes(currentUser.email);
        setIsAdmin(isUserAdmin);
        console.log("👑 É admin (fallback)?", isUserAdmin);

        if (isUserAdmin) {
          setUserInfo({
            uid: currentUser.uid,
            email: currentUser.email,
            nome: "Administrador",
            role: "admin",
          });
        } else {
          setError("Usuário não encontrado no sistema");
        }
      }

      console.log("✅ Verificação de permissões concluída");
    } catch (error) {
      console.error("❌ Erro ao verificar permissões:", error);
      setError("Erro ao verificar permissões: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
