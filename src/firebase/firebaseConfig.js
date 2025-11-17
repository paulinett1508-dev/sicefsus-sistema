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

// Determinar ambiente para exports
export const currentEnvironment = isProduction
  ? "production"
  : isDevelopment
    ? "development"
    : "unknown";
export { isProduction, isDevelopment };

// ✅ CORREÇÃO: Logs apenas em desenvolvimento
if (import.meta.env.DEV) {
  // Log de ambiente apenas uma vez por sessão
  if (!sessionStorage.getItem("firebase_env_logged")) {
    console.log("🔥 Firebase Environment:", {
      projectId: currentEnv,
      environment: currentEnvironment.toUpperCase(),
      isProduction,
      isDevelopment,
      timestamp: new Date().toISOString(),
    });
    sessionStorage.setItem("firebase_env_logged", "true");
  }

  // ⚠️ Validação crítica
  if (!currentEnv) {
    console.error("❌ ERRO CRÍTICO: VITE_FIREBASE_PROJECT_ID não encontrado!");
    console.log("📋 Variáveis disponíveis:", Object.keys(import.meta.env));
  }
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// ✅ CORREÇÃO: Log da configuração APENAS em desenvolvimento
if (import.meta.env.DEV && !sessionStorage.getItem("firebase_config_logged")) {
  console.log("🔥 Firebase Config Status:", {
    apiKey: firebaseConfig.apiKey ? "✅ Configurada" : "❌ Ausente",
    authDomain: firebaseConfig.authDomain ? "✅ Configurada" : "❌ Ausente",
    projectId: firebaseConfig.projectId ? "✅ Configurada" : "❌ Ausente",
    storageBucket: firebaseConfig.storageBucket
      ? "✅ Configurada"
      : "❌ Ausente",
    messagingSenderId: firebaseConfig.messagingSenderId
      ? "✅ Configurada"
      : "❌ Ausente",
    appId: firebaseConfig.appId ? "✅ Configurada" : "❌ Ausente",
  });
  sessionStorage.setItem("firebase_config_logged", "true");
}

// ✅ CORREÇÃO: Log de inicialização APENAS em desenvolvimento
if (import.meta.env.DEV && !sessionStorage.getItem("firebase_initialized_logged")) {
  console.log("✅ Firebase inicializado com sucesso");
  sessionStorage.setItem("firebase_initialized_logged", "true");
}

// Inicializar Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper para debug (usado nas Ferramentas Dev)
export const getFirebaseInfo = () => ({
  environment: currentEnvironment,
  projectId: currentEnv,
  isProduction,
  isDevelopment,
});

export default app;
