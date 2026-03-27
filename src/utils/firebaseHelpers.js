
import { clearIndexedDbPersistence } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Limpa o cache local do Firestore
 * Use com cuidado - apenas quando houver erros persistentes
 */
export const clearFirestoreCache = async () => {
  try {
    await clearIndexedDbPersistence(db);
    if (import.meta.env.DEV) console.log('✅ Cache do Firestore limpo com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    // Se falhar, recarregar a página pode ajudar
    if (error.code === 'failed-precondition') {
      if (import.meta.env.DEV) console.warn('⚠️ Feche todas as abas do app e tente novamente');
    }
    return false;
  }
};

/**
 * Verifica e corrige problemas comuns do Firestore
 */
export const diagnosticarFirestore = () => {
  const errors = [];
  
  // Verificar se há muitos listeners ativos
  const activeListeners = localStorage.getItem('firestore_active_listeners');
  if (activeListeners && parseInt(activeListeners) > 50) {
    errors.push('Muitos listeners ativos detectados');
  }
  
  // Verificar cache corrompido
  try {
    const teste = localStorage.getItem('firestore_test');
    localStorage.setItem('firestore_test', 'ok');
    localStorage.removeItem('firestore_test');
  } catch (e) {
    errors.push('Cache local pode estar corrompido');
  }
  
  return {
    temProblemas: errors.length > 0,
    problemas: errors
  };
};
