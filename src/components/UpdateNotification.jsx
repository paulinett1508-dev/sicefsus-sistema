// src/components/UpdateNotification.jsx
import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Verificar atualizações a cada 5 minutos
  useEffect(() => {
    const checkForUpdates = async () => {
      if (import.meta.env.DEV) return; // Não verificar em dev

      try {
        setIsChecking(true);

        // Buscar versão atual do servidor
        const response = await fetch("/version.json?" + Date.now());
        if (!response.ok) return;

        const serverVersion = await response.json();
        const currentVersion = localStorage.getItem("app_version");

        // Se versão mudou, mostrar notificação
        if (currentVersion && serverVersion.version !== currentVersion) {
          setShowUpdate(true);
        }

        // Salvar versão atual
        localStorage.setItem("app_version", serverVersion.version);
      } catch (error) {
        // Silencioso em caso de erro
      } finally {
        setIsChecking(false);
      }
    };

    // Verificar imediatamente
    checkForUpdates();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    // Limpar cache e recarregar
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }

    // Redirecionar para login para evitar problemas de autenticação
    window.location.href = "/";
  };

  if (!showUpdate) return null;

  return (
    <div className="update-notification">
      <style>{`
        .update-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
          max-width: 380px;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .update-icon {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .update-content {
          flex: 1;
        }

        .update-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .update-text {
          font-size: 14px;
          opacity: 0.9;
        }

        .update-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .update-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .update-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .update-close {
          background: transparent;
          color: white;
          border: none;
          padding: 4px;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .update-close:hover {
          opacity: 1;
        }

        @media (max-width: 480px) {
          .update-notification {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>

      <RefreshCw className="update-icon" size={24} />

      <div className="update-content">
        <div className="update-title">Nova versão disponível! 🎉</div>
        <div className="update-text">
          Clique em atualizar para obter as últimas melhorias
        </div>
      </div>

      <div className="update-buttons">
        <button className="update-btn" onClick={handleUpdate}>
          Atualizar
        </button>
        <button className="update-close" onClick={() => setShowUpdate(false)}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
