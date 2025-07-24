// UserContext.jsx
// Este contexto centraliza a autenticação e o carregamento dos dados do usuário.
// Ele encapsula a lógica de login e logout, bem como a leitura do documento do
// usuário no Firestore. Ao consumir este contexto, os componentes podem
// acessar `user`, verificar se os dados ainda estão carregando e chamar
// `logout()` quando necessário.

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Cria o contexto. O valor padrão é `null` enquanto não há usuário autenticado.
const UserContext = createContext({ user: null, loading: true, logout: () => {} });

/**
 * Cria/atualiza o documento do usuário no Firestore se ele ainda não existir.
 * Retorna os dados completos do usuário normalizados, incluindo município e uf
 * em letras minúsculas. Este comportamento replica a função
 * `criarUsuarioSeNaoExiste` de App.jsx.
 *
 * @param {import("firebase/auth").User} firebaseUser Usuário autenticado
 * @returns {Promise<Object>} Dados do usuário
 */
async function ensureFirestoreUser(firebaseUser) {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Cria novo documento com campos básicos. Não definimos municipio/uf aqui
    // para permitir que o admin atribua esses dados posteriormente.
    const novoUsuario = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: "user",
      displayName: firebaseUser.displayName || null,
      isActive: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      municipio: null,
      uf: null,
    };
    await setDoc(userRef, novoUsuario);
    return novoUsuario;
  }

  // Se o documento já existe, atualiza o último login e retorna os dados
  await setDoc(
    userRef,
    {
      lastLogin: serverTimestamp(),
      isActive: true,
    },
    { merge: true },
  );

  const data = userDoc.data();
  return {
    // Espalha todos os campos existentes
    ...data,
    // Sobrescreve com dados do Firebase Auth por garantia
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: data.displayName || firebaseUser.displayName || null,
    role: data.role || "user",
    isActive: data.isActive !== false,
    municipio: data.municipio || null,
    // Normaliza uf (aceita UF ou uf) e converte para minúsculas
    uf: (data.uf || data.UF || null)?.toLowerCase() || null,
  };
}

/**
 * Provedor de contexto responsável por ouvir o estado de autenticação do
 * Firebase, carregar e armazenar os dados completos do usuário e disponibilizar
 * um método de logout. Componentes filhos podem consumir este contexto via
 * `useUser()`.
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Verificar se o Firebase está configurado corretamente
    if (!auth) {
      console.error("❌ Firebase Auth não está configurado. Verifique as variáveis de ambiente.");
      setLoading(false);
      setUser(null);
      return;
    }

    // ✅ Verificar se as variáveis de ambiente estão configuradas
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

    if (missingVars.length > 0) {
      console.error("❌ FIREBASE CONFIG ERROR: Variáveis de ambiente ausentes:", missingVars);
      console.error("🔧 SOLUÇÃO: Configure as variáveis no Secrets do Replit:");
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      setLoading(false);
      setUser(null);
      return;
    }

    // Inscreve-se nas mudanças de autenticação. Quando o usuário logar ou
    // deslogar, esta callback será executada.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          console.log("🔄 UserContext: Carregando dados completos do usuário...");
          const fullUser = await ensureFirestoreUser(firebaseUser);
          console.log("👤 UserContext: Dados do usuário carregados:", {
            uid: fullUser.uid,
            email: fullUser.email,
            role: fullUser.role,
            municipio: fullUser.municipio,
            uf: fullUser.uf,
            isActive: fullUser.isActive
          });

          // Se o usuário estiver desativado, não o armazena
          if (fullUser.isActive === false) {
            console.log("⚠️ UserContext: Usuário desativado");
            setUser(null);
          } else {
            console.log("✅ UserContext: Usuário ativo definido no contexto");
            setUser(fullUser);
          }
        } catch (err) {
          console.error("Erro ao carregar usuário:", err);
          if (err.code === "auth/invalid-api-key") {
            console.error("🔧 SOLUÇÃO: Configure as variáveis de ambiente do Firebase no Secrets do Replit");
            console.error("📝 Variáveis necessárias:");
            console.error("   - VITE_FIREBASE_API_KEY");
            console.error("   - VITE_FIREBASE_AUTH_DOMAIN");
            console.error("   - VITE_FIREBASE_PROJECT_ID");
            console.error("   - VITE_FIREBASE_STORAGE_BUCKET");
            console.error("   - VITE_FIREBASE_MESSAGING_SENDER_ID");
            console.error("   - VITE_FIREBASE_APP_ID");
          }
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Realiza logout do Firebase Auth e limpa o usuário do contexto.
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Erro no logout:", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook que simplifica o consumo do UserContext.
 * @returns {{user: Object|null, loading: boolean, logout: function}}
 */
export function useUser() {
  return useContext(UserContext);
}