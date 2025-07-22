import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, usuario, requiredRole }) {
  if (!usuario) {
    // Não autenticado
    return <Navigate to="/" />;
  }
  if (requiredRole && usuario.role !== requiredRole) {
    // Autenticado, mas não tem a role necessária
    return <Navigate to="/unauthorized" />;
  }
  // Autenticado e autorizado
  return children;
}
