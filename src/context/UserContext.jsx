// src/context/UserContext.jsx - CORREÇÃO COMPATIBILIDADE v2.4
// ✅ CORREÇÃO: Retornar 'user' para compatibilidade com Dashboard
// ✅ MANTÉM: Toda funcionalidade existente

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log("🔍 Carregando dados do usuário:", firebaseUser.uid);

          // ✅ CORREÇÃO PRINCIPAL: Usar coleção "usuarios" em vez de "users"
          const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("✅ Dados do usuário encontrados:", userData);

            // ✅ NORMALIZAÇÃO DE CAMPOS para compatibilidade
            const nome =
              userData.nome ||
              userData.name ||
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "Usuário";
            
            // ✅ PADRONIZAR TIPO: sempre usar "tipo"
            let tipo = userData.tipo || "operador";
            if (userData.role === "user" || userData.role === "operador") {
              tipo = "operador";
            } else if (userData.role === "admin") {
              tipo = "admin";
            }
            
            const status = userData.status || "ativo";

            const usuarioFinal = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,

              // ✅ CAMPOS NORMALIZADOS:
              nome: nome,
              displayName: nome, // Para compatibilidade com Sidebar

              // ✅ CAMPO PADRONIZADO:
              tipo: tipo, // Campo único do sistema

              // ✅ MAPEAMENTO DE STATUS:
              isActive: status === "ativo", // Para compatibilidade
              status: status, // Campo original do sistema

              // ✅ DADOS GEOGRÁFICOS:
              municipio: userData.municipio,
              uf: userData.uf,

              // ✅ MANTER TODOS OS CAMPOS ORIGINAIS:
              ...userData,
            };

            setUsuario(usuarioFinal);

            console.log("👤 Usuário configurado:", {
              nome: nome,
              tipo: tipo,
              municipio: userData.municipio,
              uf: userData.uf,
            });

            // ✅ LOG ESPECIAL PARA GESTOR
            if (tipo === "gestor") {
              console.log("🏛️ GESTOR DETECTADO - Dados completos:", {
                ...usuarioFinal,
                timestamp: new Date().toISOString()
              });
            }
          } else {
            console.warn(
              "⚠️ Documento do usuário não encontrado no Firestore",
            );

            // ✅ NÃO TENTAR CRIAR DOCUMENTO (evita erro de permissão)
            // ✅ CRIAR USUÁRIO LOCAL BÁSICO para permitir acesso ao sistema
            const emailDomain = firebaseUser.email?.split("@")[1] || "";
            const isAdminEmail =
              firebaseUser.email === "paulinett1508@gmail.com";

            const nomeBasico =
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "Usuário";

            // ✅ CRIAR OBJETO LOCAL (NÃO SALVA NO FIRESTORE)
            const localUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              nome: nomeBasico,
              displayName: nomeBasico,
              tipo: isAdminEmail ? "admin" : "operador",
              isActive: true, // Permitir acesso
              status: "pendente", // Mas marcar como pendente
              municipio: "", // Sem localização
              uf: "",
              primeiroAcesso: true,
              needsConfiguration: true, // Flag para avisar admin
            };

            setUsuario(localUserData);

            console.warn(
              "⚠️ Usuário sem cadastro no Firestore - Acesso básico concedido. Admin deve criar o usuário.",
            );
          }
        } catch (error) {
          console.error("❌ Erro ao carregar dados do usuário:", error);

          // ✅ FALLBACK robusto em caso de erro
          const isAdminEmail = firebaseUser.email === "paulinett1508@gmail.com";
          const fallbackName =
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Usuário";

          setUsuario({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nome: fallbackName,
            displayName: fallbackName,
            tipo: isAdminEmail ? "admin" : "operador",
            isActive: true,
            status: "ativo",
            municipio: "", // Sem município definido
            uf: "", // Sem UF definida
          });
        }
      } else {
        console.log("🚪 Usuário deslogado");
        setUsuario(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ CORREÇÃO CRÍTICA: Retornar 'user' para compatibilidade com Dashboard
  const value = {
    user: usuario,         // ✅ CORREÇÃO: user = usuario para compatibilidade
    usuario,               // ✅ MANTER: Para compatibilidade com código existente
    currentUser: usuario,  // ✅ ADICIONAR: currentUser para Administracao.jsx
    setUsuario,
    loading,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.tipo === "admin",
    isSuperAdmin: usuario?.tipo === "admin" && usuario?.superAdmin === true, // ✅ ADICIONAR
  };

  // 🔍 DEBUG: Log do contexto quando usuario mudar
  useEffect(() => {
    if (usuario) {
      console.log("👤 UserContext atualizado:", {
        nome: usuario.nome,
        tipo: usuario.tipo,
        superAdmin: usuario.superAdmin,
        isSuperAdmin: usuario.tipo === "admin" && usuario.superAdmin === true
      });
    }
  }, [usuario]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContext };
export default UserContext;