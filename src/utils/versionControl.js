// src/utils/versionControl.js

// ✅ FONTE ÚNICA DA VERDADE - CONTROLE DE VERSÃO CENTRALIZADO
export const APP_VERSION = {
  number: "2.3.49",
  date: "13/08/2025",
  timestamp: "13/08/2025 às 23:54",
  changes: [
    "🚀 Sistema de versionamento centralizado implementado",
    "✅ Fonte única da verdade em versionControl.js",
    "🔧 Sincronização automática com package.json",
    "📊 Funções de incremento de versão automático",
    "🎯 Interface consistente para todos os componentes",
  ],
};

// Chave do localStorage
const VERSION_KEY = "sicefsus_version";
const LAST_CHECK_KEY = "sicefsus_last_version_check";

/**
 * Verifica se há nova versão e notifica o usuário
 */
export function checkVersion() {
  try {
    const savedVersion = localStorage.getItem(VERSION_KEY);
    const currentVersion = APP_VERSION.number;

    // Se for primeira vez ou versão diferente
    if (!savedVersion || savedVersion !== currentVersion) {
      // Delay para garantir que a página carregou
      setTimeout(() => {
        showUpdateNotification();
        localStorage.setItem(VERSION_KEY, currentVersion);
        localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
      }, 2000);
    }
  } catch (error) {
    console.error("Erro ao verificar versão:", error);
  }
}

/**
 * Exibe notificação de atualização
 */
function showUpdateNotification() {
  // Criar container da notificação
  const notification = document.createElement("div");
  notification.className = "version-notification";
  notification.innerHTML = `
    <div class="version-notification-content">
      <div class="version-notification-header">
        <h3>🎉 Sistema Atualizado!</h3>
        <button class="version-notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
      </div>
      <div class="version-notification-body">
        <p><strong>Versão ${APP_VERSION.number}</strong> - ${APP_VERSION.date}</p>
        <p><strong>Novidades desta versão:</strong></p>
        <ul>
          ${APP_VERSION.changes.map((change) => `<li>${change}</li>`).join("")}
        </ul>
        <p class="version-notification-info">
          ℹ️ Pressione <strong>F5</strong> ou <strong>Ctrl+F5</strong> para garantir que está usando a versão mais recente.
        </p>
      </div>
      <div class="version-notification-footer">
        <button class="version-notification-btn-reload" onclick="window.location.reload(true)">
          🔄 Atualizar Agora
        </button>
        <button class="version-notification-btn-later" onclick="this.parentElement.parentElement.parentElement.remove()">
          Mais Tarde
        </button>
      </div>
    </div>
  `;

  // Adicionar ao body
  document.body.appendChild(notification);

  // Adicionar estilos CSS
  addNotificationStyles();

  // Auto-remover após 30 segundos se não interagir
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 500);
    }
  }, 30000);
}

/**
 * Adiciona estilos CSS para a notificação
 */
function addNotificationStyles() {
  // Verificar se os estilos já foram adicionados
  if (document.getElementById("version-notification-styles")) return;

  const styles = document.createElement("style");
  styles.id = "version-notification-styles";
  styles.textContent = `
    .version-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 450px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.5s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    @keyframes slideIn {
      from {
        transform: translateX(500px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .version-notification.fade-out {
      animation: fadeOut 0.5s ease-out forwards;
    }

    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    .version-notification-content {
      padding: 0;
      position: relative;
    }

    .version-notification-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .version-notification-header h3 {
      margin: 0;
      font-size: 1.3em;
      font-weight: 600;
    }

    .version-notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.3s;
    }

    .version-notification-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .version-notification-body {
      padding: 20px;
      color: #333;
    }

    .version-notification-body p {
      margin: 0 0 15px 0;
      line-height: 1.5;
    }

    .version-notification-body ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .version-notification-body li {
      margin: 8px 0;
      color: #555;
    }

    .version-notification-info {
      background: #f0f7ff;
      border-left: 4px solid #2196F3;
      padding: 12px 15px;
      margin: 20px 0 0 0 !important;
      border-radius: 4px;
      font-size: 0.9em;
      color: #0c5397;
    }

    .version-notification-footer {
      padding: 0 20px 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .version-notification-footer button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .version-notification-btn-reload {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .version-notification-btn-reload:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .version-notification-btn-later {
      background: #f5f5f5;
      color: #666;
    }

    .version-notification-btn-later:hover {
      background: #e8e8e8;
    }

    /* Responsivo */
    @media (max-width: 500px) {
      .version-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .version-notification-body {
        padding: 15px;
      }

      .version-notification-footer {
        flex-direction: column;
      }

      .version-notification-footer button {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(styles);
}

/**
 * Obtém informações sobre a versão atual
 */
export function getVersionInfo() {
  return {
    ...APP_VERSION,
    lastCheck: localStorage.getItem(LAST_CHECK_KEY),
    savedVersion: localStorage.getItem(VERSION_KEY),
  };
}

/**
 * Força uma verificação de versão (útil para testes)
 */
export function forceVersionCheck() {
  localStorage.removeItem(VERSION_KEY);
  checkVersion();
}

/**
 * Obtém a versão atual - INTERFACE CONSISTENTE
 * @returns {object} Informações da versão atual
 */
export function getCurrentVersion() {
  return {
    ...APP_VERSION,
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE || 'development',
  };
}

/**
 * Incrementa a versão automaticamente
 * @param {string} type - Tipo de incremento: 'major', 'minor', 'patch'
 * @returns {string} Nova versão incrementada
 */
export function incrementVersion(type = 'patch') {
  const [major, minor, patch] = APP_VERSION.number.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Verifica se deve exibir badge de "Novo" em algum menu
 * baseado na última vez que o usuário viu a versão
 */
export function shouldShowNewBadge(featureDate) {
  const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
  if (!lastCheck) return true;

  const lastCheckDate = new Date(lastCheck);
  const feature = new Date(featureDate);

  return feature > lastCheckDate;
}
