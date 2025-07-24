// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ✅ VALIDAÇÃO DAS VARIÁVEIS DE AMBIENTE
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

// ✅ Verificar se todas as variáveis estão definidas
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ FIREBASE CONFIG ERROR: Variáveis de ambiente ausentes:', missingVars);
  console.error('📝 Configure as seguintes variáveis no Secrets do Replit:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
}

// ✅ Log de debug das configurações (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config Status:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Configurada' : '❌ Ausente',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Configurada' : '❌ Ausente',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Configurada' : '❌ Ausente',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Configurada' : '❌ Ausente',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Configurada' : '❌ Ausente',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Configurada' : '❌ Ausente',
  });
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app, db, auth, storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  console.error('🔧 Verifique as variáveis de ambiente no Secrets do Replit');
}

export { db, auth, storage };
