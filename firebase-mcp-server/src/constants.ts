// Constantes do MCP Firebase Server

export const SICEFSUS_COLLECTIONS = [
  'emendas',
  'despesas',
  'usuarios',
  'audit_logs',
  'configuracoes'
] as const;

export const DEFAULT_QUERY_LIMIT = 50;
export const MAX_QUERY_LIMIT = 500;

export const BACKUP_DIR = './backups';

export const ENVIRONMENT_INDICATORS = {
  dev: '🟢 DEV',
  prod: '� PROD'
} as const;

export const WARNING_MESSAGES = {
  prodWrite: '⚠️ ATENÇÃO: Operação de escrita em PRODUÇÃO requer confirmação explícita!',
  prodQuery: '⚠️ Consultando ambiente de PRODUÇÃO - apenas leitura recomendada',
  switchToProd: '⚠️ Mudando para PRODUÇÃO - cuidado com operações de escrita!'
} as const;
