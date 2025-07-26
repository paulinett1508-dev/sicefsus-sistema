
// src/utils/errorHandlers.js - Centralized Error Handling
import { createErrorReport } from './validators.js';

/**
 * ✅ Handle Firebase errors with user-friendly messages
 * @param {Error} error - Firebase error
 * @param {string} context - Where the error occurred
 * @returns {string} - User-friendly error message
 */
export const handleFirebaseError = (error, context = 'Firebase Operation') => {
  console.error(`🔥 Firebase Error in ${context}:`, error);
  
  const errorReport = createErrorReport(context, error, { 
    firebaseCode: error.code,
    firebaseMessage: error.message 
  });
  
  // Store error for debugging
  try {
    const existingErrors = JSON.parse(localStorage.getItem('sicefsus_firebase_errors') || '[]');
    existingErrors.push(errorReport);
    localStorage.setItem('sicefsus_firebase_errors', JSON.stringify(existingErrors.slice(-5)));
  } catch (storageError) {
    console.warn('Could not store Firebase error:', storageError);
  }

  // Return user-friendly message based on error code
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique suas credenciais.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    case 'permission-denied':
      return 'Acesso negado. Você não tem permissão para esta operação.';
    case 'unavailable':
      return 'Serviço temporariamente indisponível. Tente novamente em alguns momentos.';
    case 'deadline-exceeded':
      return 'Tempo limite excedido. Verifique sua conexão.';
    default:
      return error.message || 'Erro inesperado. Tente novamente.';
  }
};

/**
 * ✅ Handle validation errors with context
 * @param {Object} validationResult - Result from validation function
 * @param {string} context - Context of validation
 * @returns {string} - Formatted error message
 */
export const handleValidationError = (validationResult, context = 'Validação') => {
  if (validationResult.valido) return null;
  
  const errors = Array.isArray(validationResult.erros) 
    ? validationResult.erros 
    : Object.values(validationResult.erros || {});
    
  console.warn(`⚠️ Validation errors in ${context}:`, errors);
  
  return errors.length > 1 
    ? `Múltiplos erros encontrados:\n• ${errors.join('\n• ')}`
    : errors[0] || 'Erro de validação desconhecido';
};

/**
 * ✅ Handle network errors
 * @param {Error} error - Network error
 * @param {string} context - Context where error occurred
 * @returns {string} - User-friendly message
 */
export const handleNetworkError = (error, context = 'Network Operation') => {
  console.error(`🌐 Network Error in ${context}:`, error);
  
  if (!navigator.onLine) {
    return 'Você está offline. Verifique sua conexão com a internet.';
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Erro de conexão com o servidor. Tente novamente.';
  }
  
  return 'Erro de rede. Verifique sua conexão e tente novamente.';
};

/**
 * ✅ Show user-friendly error toast/alert
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @param {Function} showToast - Toast function if available
 */
export const showUserError = (error, context, showToast = null) => {
  let message = 'Erro inesperado. Tente novamente.';
  
  if (error.code && error.code.startsWith('auth/')) {
    message = handleFirebaseError(error, context);
  } else if (error.name === 'TypeError' || error.message?.includes('fetch')) {
    message = handleNetworkError(error, context);
  } else if (error.message) {
    message = error.message;
  }
  
  if (showToast && typeof showToast === 'function') {
    showToast(message, 'error');
  } else {
    alert(`❌ ${message}`);
  }
  
  return message;
};

/**
 * ✅ Get stored errors for debugging
 * @returns {Object} - All stored errors
 */
export const getStoredErrors = () => {
  try {
    return {
      general: JSON.parse(localStorage.getItem('sicefsus_errors') || '[]'),
      firebase: JSON.parse(localStorage.getItem('sicefsus_firebase_errors') || '[]')
    };
  } catch (error) {
    console.warn('Could not retrieve stored errors:', error);
    return { general: [], firebase: [] };
  }
};

/**
 * ✅ Clear stored errors
 */
export const clearStoredErrors = () => {
  try {
    localStorage.removeItem('sicefsus_errors');
    localStorage.removeItem('sicefsus_firebase_errors');
    console.log('✅ Stored errors cleared');
  } catch (error) {
    console.warn('Could not clear stored errors:', error);
  }
};
