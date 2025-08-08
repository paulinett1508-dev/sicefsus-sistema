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

// Inicializar Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
