
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

// Cache para logs já exibidos
const logCache = new Map();
const SESSION_LOGS = new Set();

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

  // Função para verificar se é um log repetitivo
  const isRepetitiveLog = (message, level = 'log') => {
    if (typeof message !== 'string') return false;
    
    // Lista de padrões de logs repetitivos
    const repetitivePatterns = [
      '🔥 Firebase Config Status',
      '✅ Firebase inicializado com sucesso',
      '🔒 AuditService inicializado',
      '🔥 Firebase Environment:',
      '[vite] connecting...',
      '[vite] connected.',
      'Firebase App',
      'Firebase Configuration'
    ];

    // Verificar se corresponde a algum padrão repetitivo
    const isRepetitive = repetitivePatterns.some(pattern => 
      message.includes(pattern)
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

  // Função para verificar rate limiting
  const shouldThrottle = (message) => {
    if (typeof message !== 'string') return false;
    
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

  // Sistema de log inteligente
  const createLogWrapper = (level, method) => {
    return (...args) => {
      if (currentLevel >= level) {
        const message = args[0];
        
        // Verificar se é repetitivo ou deve ser throttled
        if (isRepetitiveLog(message, method) || shouldThrottle(message)) {
          return;
        }
        
        // Filtros específicos para desenvolvimento
        if (import.meta.env.DEV) {
          // Reduzir logs muito verbosos
          if (typeof message === 'string' && (
            message.includes('🚪 Usuário deslogado') ||
            message.includes('[vite] server connection lost') ||
            message.includes('polling for restart')
          )) {
            // Mostrar apenas se não foi mostrado nos últimos 10 segundos
            if (shouldThrottle(message)) return;
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
  } else {
    console.error = createLogWrapper(LOG_LEVELS.ERROR, 'error');
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
  if (currentLevel >= LOG_LEVELS.INFO && !SESSION_LOGS.has('console_configured')) {
    originalConsole.info(`🔧 Console configurado - Nível: ${Object.keys(LOG_LEVELS)[currentLevel]} (${currentLevel})`);
    SESSION_LOGS.add('console_configured');
  }
};

// Função para limpar cache de logs (útil para debugging)
export const clearLogCache = () => {
  logCache.clear();
  SESSION_LOGS.clear();
  console.info('🧹 Cache de logs limpo');
};

// Compatibilidade com função anterior
export const disableConsoleInProduction = configureConsole;

// Como usar no main.jsx:
// import { disableConsoleInProduction } from './utils/DisableConsole';
// disableConsoleInProduction();
