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

            setUsuario({
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
            });

            console.log("👤 Usuário configurado:", {
              nome: nome,
              tipo: tipo,
              municipio: userData.municipio,
              uf: userData.uf,
            });
          } else {
            console.log(
              "⚠️ Documento do usuário não encontrado, criando básico...",
            );

            // ✅ DETERMINAR TIPO BASEADO NO EMAIL
            const emailDomain = firebaseUser.email?.split("@")[1] || "";
            const isAdminEmail =
              firebaseUser.email === "paulinett1508@gmail.com";

            // ✅ CRIAR DOCUMENTO BÁSICO se não existir
            const nomeBasico =
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "Usuário";

            const basicUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              nome: nomeBasico,
              tipo: isAdminEmail ? "admin" : "operador",
              status: isAdminEmail ? "ativo" : "pendente", // Operadores começam pendentes até configuração

              // ✅ OPERADORES CRIADOS SEM MUNICÍPIO - ADMIN DEVE CONFIGURAR
              municipio: isAdminEmail ? null : null,
              uf: isAdminEmail ? null : null,

              primeiroAcesso: true,
              criadoPor: "sistema",
              dataCriacao: new Date(),
              dataAtualizacao: new Date(),

              // ✅ CAMPOS ESPECÍFICOS PARA OPERADORES
              ...(isAdminEmail
                ? {}
                : {
                    permissoes: [],
                    observacoes:
                      "⚠️ OPERADOR NÃO CONFIGURADO - Admin deve definir município/UF e ativar antes do primeiro acesso",
                  }),
            };

            // ✅ CRIAR NA COLEÇÃO CORRETA "usuarios"
            await setDoc(doc(db, "usuarios", firebaseUser.uid), basicUserData);
            console.log("✅ Novo usuário criado:", basicUserData);

            setUsuario({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              nome: nomeBasico,
              displayName: nomeBasico,
              tipo: isAdminEmail ? "admin" : "operador",
              isActive: isAdminEmail,
              status: isAdminEmail ? "ativo" : "pendente",
              municipio: null,
              uf: null,
              ...basicUserData,
            });

            // ✅ AVISO PARA OPERADORES NÃO CONFIGURADOS
            if (!isAdminEmail) {
              console.warn(
                "⚠️ Operador criado mas NÃO configurado. Admin deve definir município/UF e ativar o usuário.",
              );
            }
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
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContext };
export default UserContext;