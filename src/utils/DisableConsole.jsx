// Arquivo: src/utils/DisableConsole.jsx
// Sistema avançado de controle de logs com níveis

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  VERBOSE: 4
};

// Configuração de nível de log baseada no ambiente
const getLogLevel = () => {
  if (import.meta.env.PROD) return LOG_LEVELS.ERROR;
  if (import.meta.env.VITE_LOG_LEVEL === 'quiet') return LOG_LEVELS.WARN;
  if (import.meta.env.VITE_LOG_LEVEL === 'minimal') return LOG_LEVELS.INFO;
  return LOG_LEVELS.DEBUG; // Padrão para desenvolvimento
};

export const configureConsole = () => {
  const currentLevel = getLogLevel();
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
    timeStamp: console.timeStamp
  };

  // Sistema de log inteligente
  const createLogWrapper = (level, method) => {
    return (...args) => {
      if (currentLevel >= level) {
        // Filtrar logs específicos em desenvolvimento
        if (import.meta.env.DEV) {
          const message = args[0];
          
          // Reduzir logs repetitivos do Firebase
          if (typeof message === 'string' && (
            message.includes('🔥 Firebase Config Status') ||
            message.includes('🔒 AuditService inicializado') ||
            message.includes('Firebase Environment')
          )) {
            // Mostrar apenas uma vez por sessão
            const key = `logged_${message.substring(0, 30)}`;
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, 'true');
          }
        }
        
        originalConsole[method](...args);
      }
    };
  };

  // Configurar níveis de log
  if (currentLevel < LOG_LEVELS.VERBOSE) {
    console.debug = currentLevel >= LOG_LEVELS.DEBUG ? createLogWrapper(LOG_LEVELS.DEBUG, 'debug') : noop;
    console.log = currentLevel >= LOG_LEVELS.DEBUG ? createLogWrapper(LOG_LEVELS.DEBUG, 'log') : noop;
  }

  if (currentLevel < LOG_LEVELS.INFO) {
    console.info = currentLevel >= LOG_LEVELS.INFO ? createLogWrapper(LOG_LEVELS.INFO, 'info') : noop;
  }

  if (currentLevel < LOG_LEVELS.WARN) {
    console.warn = currentLevel >= LOG_LEVELS.WARN ? createLogWrapper(LOG_LEVELS.WARN, 'warn') : noop;
  }

  // Sempre manter error em desenvolvimento, desabilitar só em produção
  if (import.meta.env.PROD) {
    console.error = noop;
  }

  // Desabilitar métodos de debug em produção
  if (import.meta.env.PROD) {
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

  // Logging de inicialização apenas uma vez
  if (currentLevel >= LOG_LEVELS.INFO && !sessionStorage.getItem('console_configured')) {
    originalConsole.info(`🔧 Console configurado - Nível: ${Object.keys(LOG_LEVELS)[currentLevel]} (${currentLevel})`);
    sessionStorage.setItem('console_configured', 'true');
  }
};

// Compatibilidade com função anterior
export const disableConsoleInProduction = configureConsole;

// Como usar no main.jsx:
// import { disableConsoleInProduction } from './utils/DisableConsole';
// disableConsoleInProduction();
