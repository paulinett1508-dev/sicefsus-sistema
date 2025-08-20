// Arquivo: src/utils/DisableConsole.jsx
// Sistema avançado de controle de logs com níveis

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  VERBOSE: 4,
};

// Configuração de nível de log baseada no ambiente
const getLogLevel = () => {
  if (import.meta.env.PROD) return LOG_LEVELS.ERROR;
  if (import.meta.env.VITE_LOG_LEVEL === "quiet") return LOG_LEVELS.WARN;
  if (import.meta.env.VITE_LOG_LEVEL === "minimal") return LOG_LEVELS.INFO;
  return LOG_LEVELS.VERBOSE; // ✅ MUDADO PARA VERBOSE EM DEV
};

// Cache para logs já exibidos
const logCache = new Map();
const SESSION_LOGS = new Set();

let isConfigured = false;

export const configureConsole = () => {
  if (isConfigured) {
    return;
  }

  const environment =
    import.meta.env.VITE_ENV || import.meta.env.NODE_ENV || "development";
  const enableLogs = import.meta.env.VITE_ENABLE_LOGS !== "false";

  const currentLogLevel = getLogLevel();

  // Função noop (no operation) para desabilitar logs
  const noop = () => {};

  // Backup dos métodos originais
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    trace: console.trace,
    table: console.table,
    time: console.time,
    timeEnd: console.timeEnd,
    group: console.group,
    groupEnd: console.groupEnd,
    groupCollapsed: console.groupCollapsed,
    assert: console.assert,
    clear: console.clear,
    count: console.count,
    countReset: console.countReset,
    dir: console.dir,
    dirxml: console.dirxml,
    profile: console.profile,
    profileEnd: console.profileEnd,
    timeLog: console.timeLog,
    timeStamp: console.timeStamp,
  };

  // ✅ FUNÇÃO MELHORADA: Permite logs de debug em desenvolvimento
  const isRepetitiveLog = (message, level = "log") => {
    if (typeof message !== "string") return false;

    // ✅ EM DESENVOLVIMENTO, NUNCA BLOQUEAR LOGS DE DEBUG
    if (
      import.meta.env.DEV &&
      (message.includes("🚨") ||
        message.includes("📄") ||
        message.includes("🔥 VALIDAÇÃO") ||
        message.includes("DEBUG") ||
        message.includes("Campo autor") ||
        message.includes("MUDANÇA DETECTADA"))
    ) {
      return false; // ✅ NUNCA BLOQUEAR LOGS DE DEBUG
    }

    // Lista de padrões de logs repetitivos (APENAS LOGS DE SISTEMA)
    const repetitivePatterns = [
      "Firebase App",
      "Firebase Configuration",
      "[vite] connecting...",
      "[vite] connected.",
      "[vite] server connection lost",
      "[vite] polling for restart",
      "🚪 Usuário deslogado",
    ];

    // Verificar se corresponde a algum padrão repetitivo
    const isRepetitive = repetitivePatterns.some((pattern) =>
      message.includes(pattern),
    );

    if (!isRepetitive) return false;

    // Para logs repetitivos, mostrar apenas uma vez por sessão
    const logKey = `${level}_${message.substring(0, 50)}`;

    if (SESSION_LOGS.has(logKey)) {
      return true; // É repetitivo e já foi mostrado
    }

    SESSION_LOGS.add(logKey);
    return false; // É repetitivo mas ainda não foi mostrado
  };

  // ✅ FUNÇÃO MELHORADA: Não throttle logs de debug
  const shouldThrottle = (message) => {
    if (typeof message !== "string") return false;

    // ✅ EM DESENVOLVIMENTO, NUNCA THROTTLE LOGS DE DEBUG
    if (
      import.meta.env.DEV &&
      (message.includes("🚨") ||
        message.includes("📄") ||
        message.includes("🔥 VALIDAÇÃO") ||
        message.includes("DEBUG") ||
        message.includes("Campo autor") ||
        message.includes("MUDANÇA DETECTADA"))
    ) {
      return false; // ✅ NUNCA THROTTLE LOGS DE DEBUG
    }

    const now = Date.now();
    const throttleTime = 5000; // 5 segundos

    // Criar chave baseada no início da mensagem
    const key = message.substring(0, 30);

    if (logCache.has(key)) {
      const lastTime = logCache.get(key);
      if (now - lastTime < throttleTime) {
        return true; // Throttle
      }
    }

    logCache.set(key, now);
    return false;
  };

  // ✅ SISTEMA DE LOG SIMPLIFICADO PARA DEV
  const createLogWrapper = (level, method) => {
    return (...args) => {
      // ✅ EM DESENVOLVIMENTO, SEMPRE PERMITIR LOGS DE DEBUG/INFO/WARN/ERROR
      if (import.meta.env.DEV) {
        const message = args[0];

        // ✅ LOGS DE DEBUG SEMPRE PASSAM
        if (
          typeof message === "string" &&
          (message.includes("🚨") ||
            message.includes("📄") ||
            message.includes("🔥 VALIDAÇÃO") ||
            message.includes("DEBUG") ||
            message.includes("Campo autor") ||
            message.includes("MUDANÇA DETECTADA"))
        ) {
          originalConsole[method](...args);
          return;
        }

        // Para outros logs, aplicar filtros normais
        if (isRepetitiveLog(message, method) || shouldThrottle(message)) {
          return;
        }

        originalConsole[method](...args);
        return;
      }

      // ✅ EM PRODUÇÃO, APLICAR FILTROS NORMAIS
      if (currentLogLevel >= level) {
        const message = args[0];

        if (isRepetitiveLog(message, method) || shouldThrottle(message)) {
          return;
        }

        originalConsole[method](...args);
      }
    };
  };

  // ✅ CONFIGURAÇÃO SIMPLIFICADA PARA DESENVOLVIMENTO
  if (import.meta.env.DEV) {
    // ✅ EM DEV, TODOS OS LOGS FUNCIONAM
    console.debug = createLogWrapper(LOG_LEVELS.DEBUG, "debug");
    console.log = createLogWrapper(LOG_LEVELS.DEBUG, "log");
    console.info = createLogWrapper(LOG_LEVELS.INFO, "info");
    console.warn = createLogWrapper(LOG_LEVELS.WARN, "warn");
    console.error = createLogWrapper(LOG_LEVELS.ERROR, "error");
  } else {
    // ✅ EM PRODUÇÃO, APLICAR FILTROS RIGOROSOS
    console.debug =
      currentLogLevel >= LOG_LEVELS.DEBUG
        ? createLogWrapper(LOG_LEVELS.DEBUG, "debug")
        : noop;
    console.log =
      currentLogLevel >= LOG_LEVELS.DEBUG
        ? createLogWrapper(LOG_LEVELS.DEBUG, "log")
        : noop;
    console.info =
      currentLogLevel >= LOG_LEVELS.INFO
        ? createLogWrapper(LOG_LEVELS.INFO, "info")
        : noop;
    console.warn =
      currentLogLevel >= LOG_LEVELS.WARN
        ? createLogWrapper(LOG_LEVELS.WARN, "warn")
        : noop;
    console.error = noop;

    // Desabilitar métodos de debug em produção
    console.trace = noop;
    console.table = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.group = noop;
    console.groupEnd = noop;
    console.groupCollapsed = noop;
    console.assert = noop;
    console.clear = noop;
    console.count = noop;
    console.countReset = noop;
    console.dir = noop;
    console.dirxml = noop;
    console.profile = noop;
    console.profileEnd = noop;
    console.timeLog = noop;
    console.timeStamp = noop;
  }

  // ✅ Logging de inicialização apenas uma vez
  if (!SESSION_LOGS.has("console_configured")) {
    originalConsole.info(
      `🔧 Console configurado - Nível: ${Object.keys(LOG_LEVELS)[currentLogLevel]} (${currentLogLevel}) - DEV: ${!!import.meta.env.DEV}`,
    );
    SESSION_LOGS.add("console_configured");
  }
  isConfigured = true;
};

// Função para limpar cache de logs (útil para debugging)
export const clearLogCache = () => {
  logCache.clear();
  SESSION_LOGS.clear();
  console.info("🧹 Cache de logs limpo");
};

// ✅ FUNÇÃO DE EMERGENCY: Restaurar console original
export const restoreOriginalConsole = () => {
  const originalMethods = [
    "log",
    "info",
    "warn",
    "error",
    "debug",
    "trace",
    "table",
    "time",
    "timeEnd",
    "group",
    "groupEnd",
    "groupCollapsed",
    "assert",
    "clear",
    "count",
    "countReset",
    "dir",
    "dirxml",
    "profile",
    "profileEnd",
    "timeLog",
    "timeStamp",
  ];

  originalMethods.forEach((method) => {
    if (
      console[`original${method.charAt(0).toUpperCase() + method.slice(1)}`]
    ) {
      console[method] =
        console[`original${method.charAt(0).toUpperCase() + method.slice(1)}`];
    }
  });

  console.info("🔧 Console original restaurado");
};

// Compatibilidade com função anterior
export const disableConsoleInProduction = configureConsole;

// Como usar no main.jsx:
// import { configureConsole } from './utils/DisableConsole';
// configureConsole();
