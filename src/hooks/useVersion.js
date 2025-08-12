// src/hooks/useVersion.js
import { useState, useEffect } from "react";
import { getCurrentVersion } from "../utils/versionControl.js";

/**
 * Hook personalizado para gerenciar informações de versão
 * @returns {object} Informações da versão atual
 */
export function useVersion() {
  const [versionInfo, setVersionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const version = getCurrentVersion();
      setVersionInfo(version);
    } catch (error) {
      console.error("Erro ao obter versão:", error);
      // Fallback em caso de erro
      setVersionInfo({
        number: "2.3.44",
        date: new Date().toLocaleDateString("pt-BR"),
        environment: "production",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    version: versionInfo?.number || "2.3.44",
    fullVersion: versionInfo,
    loading,
    // Função utilitária para formatar versão
    formatVersion: (prefix = "v") =>
      `${prefix}${versionInfo?.number || "2.3.44"}`,
  };
}
