// src/services/emendasService.js
// ✅ Serviço especializado para carregamento de emendas com filtro por município

import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const carregarEmendasPorPermissao = async (userRole, userMunicipio, userUf) => {
  try {
    console.log("🔍 Carregando emendas com filtro por município...");

    let q;

    if (userRole === "admin") {
      console.log("👑 Usuário ADMIN - carregando todas as emendas");
      q = query(collection(db, "emendas"));
    } else if (
      (userRole === "operador" || userRole === "user") &&
      userMunicipio
    ) {
      console.log(
        `🏘️ Usuário ${userRole.toUpperCase()} - carregando emendas do município: ${userMunicipio}`,
      );
      const filters = [where("municipio", "==", userMunicipio)];
      if (userUf) filters.push(where("uf", "==", userUf));
      q = query(collection(db, "emendas"), ...filters);
    } else {
      console.warn(
        "⚠️ Usuário sem permissões definidas ou município não informado",
      );
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

    console.log(
      `✅ Emendas carregadas para ${userRole} (${userMunicipio}):`,
      emendasData.length,
    );
    return emendasData;
  } catch (error) {
    console.error("❌ Erro ao carregar emendas:", error);
    throw error;
  }
};
