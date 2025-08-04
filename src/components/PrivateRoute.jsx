import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, usuario, requiredRole }) {
  // ✅ Debug simplificado (apenas quando necessário)
  if (process.env.NODE_ENV === 'development') {
    console.log("🔍 PrivateRoute verificação:", {
      usuario: usuario?.nome || "Não identificado",
      email: usuario?.email,
      tipo: usuario?.tipo,
      requiredRole,
      isAuthenticated: !!usuario,
      hasRequiredRole: !requiredRole || usuario?.tipo === requiredRole,
    });
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

  // ✅ VERIFICAÇÃO DE TIPO PADRONIZADA
  if (requiredRole) {
    if (requiredRole === "admin") {
      const isAdmin = usuario.tipo === "admin";
      if (!isAdmin) {
        console.log(
          "❌ PrivateRoute: Usuário não é admin, redirecionando para /unauthorized",
        );
        console.log(`   Tipo: ${usuario.tipo}, Requerido: admin`);
        return <Navigate to="/unauthorized" />;
      }
    }
    // ✅ VERIFICAÇÃO PARA OPERADOR
    else if (requiredRole === "operador") {
      const isOperadorOrAdmin =
        usuario.tipo === "operador" || usuario.tipo === "admin";

      if (!isOperadorOrAdmin) {
        console.log("❌ PrivateRoute: Usuário não é operador nem admin");
        return <Navigate to="/unauthorized" />;
      }
    }
  }

  // ✅ VERIFICAÇÃO ESPECIAL: Operador sem localização
  if (usuario.tipo === "operador") {
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