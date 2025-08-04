import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function PrivateRoute({ children, requiredRole }) {
  // ✅ CORREÇÃO: Usar o contexto diretamente ao invés de receber via props
  const { user: usuario, loading } = useUser();

  // ✅ DEBUG TEMPORÁRIO - REMOVER APÓS TESTAR
  console.log("🔍 PrivateRoute verificação:", {
    usuario: usuario?.nome,
    email: usuario?.email,
    tipo: usuario?.tipo,
    role: usuario?.role,
    requiredRole: requiredRole,
    isAuthenticated: !!usuario,
    shouldHaveAccess:
      requiredRole === "admin" ? usuario?.tipo === "admin" : true,
    loading: loading,
  });

  // ✅ AGUARDAR CARREGAMENTO DO CONTEXTO
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  // ✅ VERIFICAÇÃO PRINCIPAL: Usuário autenticado
  if (!usuario) {
    console.log(
      "❌ PrivateRoute: Usuário não autenticado, redirecionando para /",
    );
    return <Navigate to="/" />;
  }

  // ✅ VERIFICAÇÃO AVANÇADA: Usuário inativo
  if (usuario.status === "inativo") {
    console.log(
      "❌ PrivateRoute: Usuário inativo, redirecionando para /unauthorized",
    );
    return <Navigate to="/unauthorized" />;
  }

  // ✅ VERIFICAÇÃO DE ROLE ESPECÍFICA (COMPATIBILIDADE DUPLA)
  if (requiredRole) {
    if (requiredRole === "admin") {
      // ✅ VERIFICAR TANTO 'tipo' QUANTO 'role' PARA COMPATIBILIDADE
      const isAdmin = usuario.tipo === "admin" || usuario.role === "admin";
      if (!isAdmin) {
        console.log(
          "❌ PrivateRoute: Usuário não é admin, redirecionando para /unauthorized",
        );
        console.log(
          `   Tipo: ${usuario.tipo}, Role: ${usuario.role}, Requerido: admin`,
        );
        return <Navigate to="/unauthorized" />;
      }
    }
    // ✅ VERIFICAÇÃO PARA OPERADOR/USER
    else if (requiredRole === "operador" || requiredRole === "user") {
      const isOperadorOrAdmin =
        usuario.tipo === "operador" ||
        usuario.tipo === "admin" ||
        usuario.role === "user" ||
        usuario.role === "admin";

      if (!isOperadorOrAdmin) {
        console.log("❌ PrivateRoute: Usuário não é operador nem admin");
        return <Navigate to="/unauthorized" />;
      }
    }
  }

  // ✅ VERIFICAÇÃO ESPECIAL: Operador sem localização
  if (usuario.tipo === "operador" || usuario.role === "user") {
    if (!usuario.municipio || !usuario.uf) {
      console.log(
        "❌ PrivateRoute: Operador sem localização definida, redirecionando para /unauthorized",
      );
      return (
        <Navigate
          to="/unauthorized"
          state={{
            message:
              "Operador sem localização definida. Contate o administrador para configurar município/UF.",
          }}
        />
      );
    }
  }

  console.log("✅ PrivateRoute: Acesso autorizado");
  return children;
}
