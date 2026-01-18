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

  // ✅ VERIFICAÇÃO DE TIPO PADRONIZADA (suporta string ou array)
  if (requiredRole) {
    // Converter para array se for string
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Verificar se o tipo do usuário está na lista de roles permitidos
    const hasRequiredRole = allowedRoles.some(role => {
      // Admin sempre tem acesso a rotas de admin
      if (role === "admin") {
        return usuario.tipo === "admin";
      }
      // Para outros roles, verificar se é o tipo exato ou é admin (que tem acesso total)
      return usuario.tipo === role || usuario.tipo === "admin";
    });

    if (!hasRequiredRole) {
      console.log(
        `❌ PrivateRoute: Usuário ${usuario.tipo} não tem acesso. Roles permitidos: ${allowedRoles.join(", ")}`,
      );
      return <Navigate to="/unauthorized" />;
    }
  }

  // ✅ VERIFICAÇÃO ESPECIAL: Operador sem localização
  // ⚠️ MUDANÇA: Não bloquear mais, apenas registrar aviso
  if (usuario.tipo === "operador") {
    if (!usuario.municipio || !usuario.uf) {
      console.warn(
        "⚠️ PrivateRoute: Operador sem localização definida, mas permitindo acesso básico",
      );
      // NÃO BLOQUEIA: usePermissions já gerencia isso
      // O usuário verá aviso no Dashboard
    }
  }

  console.log("✅ PrivateRoute: Acesso autorizado");
  return children;
}