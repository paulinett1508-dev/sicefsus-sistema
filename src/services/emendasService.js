// src/services/emendasService.js
// ✅ Serviço especializado para carregamento de emendas com filtro por município

import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const carregarEmendasPorPermissao = async (userRole, userMunicipio, userUf) => {
  // Validacao de inputs
  if (!userRole || typeof userRole !== "string") {
    throw new Error("userRole e obrigatorio");
  }

  const rolesValidos = ["admin", "gestor", "operador", "user"];
  if (!rolesValidos.includes(userRole)) {
    throw new Error(`userRole invalido: ${userRole}`);
  }

  if (userRole !== "admin" && !userMunicipio?.trim()) {
    throw new Error("Configuração de usuário incompleta. Entre em contato com o administrador.");
  }

  try {
    let q;

    if (userRole === "admin") {
      q = query(collection(db, "emendas"));
    } else if (
      (userRole === "operador" || userRole === "user" || userRole === "gestor") &&
      userMunicipio
    ) {
      const filters = [where("municipio", "==", userMunicipio)];
      if (userUf) filters.push(where("uf", "==", userUf));
      q = query(collection(db, "emendas"), ...filters);
    } else {
      throw new Error(
        "Configuração de usuário incompleta. Entre em contato com o administrador.",
      );
    }

    const querySnapshot = await getDocs(q);
    const emendasData = [];

    querySnapshot.forEach((doc) => {
      emendasData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return emendasData;
  } catch (error) {
    console.error("Erro ao carregar emendas:", error.message);
    throw error;
  }
};
