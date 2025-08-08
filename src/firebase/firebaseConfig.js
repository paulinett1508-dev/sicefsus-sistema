// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔧 CONFIGURAÇÃO SIMPLES: Funciona em DEV e PROD
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🔍 DEBUG: Mostrar ambiente atual
const currentEnv = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const isProduction = currentEnv?.includes("-prod");
const isDevelopment = currentEnv?.includes("-60dbd");

console.log("🔥 Firebase Environment:", {
  projectId: currentEnv,
  environment: isProduction
    ? "PRODUCTION"
    : isDevelopment
      ? "DEVELOPMENT"
      : "UNKNOWN",
  timestamp: new Date().toISOString(),
});

// ⚠️ Validação crítica
if (!currentEnv) {
  console.error("❌ ERRO CRÍTICO: VITE_FIREBASE_PROJECT_ID não encontrado!");
  console.log("📋 Variáveis disponíveis:", Object.keys(import.meta.env));
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Log de status apenas em debug verbose
  if (import.meta.env.VITE_LOG_LEVEL === 'verbose') {
    console.log('🔥 Firebase Config Status:', {
      apiKey: firebaseConfig.apiKey ? '✅ Configurada' : '❌ Não configurada',
      authDomain: firebaseConfig.authDomain ? '✅ Configurada' : '❌ Não configurada',
      projectId: firebaseConfig.projectId ? '✅ Configurada' : '❌ Não configurada',
      storageBucket: firebaseConfig.storageBucket ? '✅ Configurada' : '❌ Não configurada',
      messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Configurada' : '❌ Não configurada',
      appId: firebaseConfig.appId ? '✅ Configurada' : '❌ Não configurada'
    });
  }

  // Log de inicialização apenas uma vez por sessão
  if (!sessionStorage.getItem('firebase_initialized')) {
    console.info('✅ Firebase inicializado com sucesso');
    sessionStorage.setItem('firebase_initialized', 'true');
  }

// Inicializar Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;