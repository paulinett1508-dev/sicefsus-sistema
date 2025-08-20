
// src/utils/simpleErrorModal.js - Solução simples para exibir erros sem foco

/**
 * Exibe um modal simples com os erros de validação
 * @param {Object} errors - Objeto com os erros de validação
 * @param {number} maxErrors - Número máximo de erros para exibir (default: 5)
 */
export const showSimpleErrorModal = (errors, maxErrors = 5) => {
  if (!errors || Object.keys(errors).length === 0) return;

  const errorEntries = Object.entries(errors);
  const errorList = errorEntries
    .slice(0, maxErrors)
    .map(([field, message]) => `• ${message.replace('🚨 ', '')}`)
    .join('\n');
    
  const errorCount = errorEntries.length;
  const hasMoreErrors = errorCount > maxErrors;
  
  const modalMessage = 
    `⚠️ CAMPOS OBRIGATÓRIOS FALTANDO\n\n` +
    `${errorList}\n\n` +
    `${hasMoreErrors ? `... e mais ${errorCount - maxErrors} campos\n\n` : ''}` +
    `Preencha os campos em vermelho e tente novamente.`;
  
  alert(modalMessage);
};

/**
 * Versão alternativa com toast personalizado (opcional)
 * @param {Object} errors - Objeto com os erros
 * @param {Function} setToast - Função para exibir toast
 */
export const showErrorToast = (errors, setToast) => {
  if (!errors || Object.keys(errors).length === 0) return;

  const errorCount = Object.keys(errors).length;
  const firstError = Object.values(errors)[0]?.replace('🚨 ', '') || 'Erro de validação';
  
  const message = errorCount === 1 
    ? firstError
    : `${firstError} (+ ${errorCount - 1} outros campos)`;

  setToast({
    show: true,
    message: `⚠️ ${message}`,
    type: 'error'
  });
};
