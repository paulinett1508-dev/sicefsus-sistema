// src/hooks/useNaturezasDespesa.js
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { NATUREZAS_DESPESA } from "../config/constants";

/**
 * Hook para gerenciar naturezas de despesa
 * Combina naturezas fixas (constants.js) + dinâmicas (Firebase)
 * ✅ Atualiza em TEMPO REAL quando novas naturezas são adicionadas
 */
export const useNaturezasDespesa = () => {
  const [naturezasDinamicas, setNaturezasDinamicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null); // Renamed from 'erro' to 'erro' as per original code for consistency

  // ✅ Carregar naturezas dinâmicas do Firebase com LISTENER EM TEMPO REAL
  useEffect(() => {
    console.log("🔄 Iniciando listener de naturezas...");
    setLoading(true);

    const q = query(
      collection(db, "naturezas_despesa"),
      orderBy("criadoEm", "desc"),
    );

    // ✅ onSnapshot = listener em tempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const naturezas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(
          `✅ Naturezas carregadas/atualizadas: ${naturezas.length} do Firebase`,
        );
        setNaturezasDinamicas(naturezas);
        setErro(null);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Erro ao carregar naturezas:", error);

        // Tratar especificamente erro de permissão
        if (error.code === 'permission-denied') {
          setErro('Sem permissão para acessar naturezas de despesa');
          // Usar dados em cache ou array vazio
          setNaturezasDinamicas([]);
        } else {
          setErro(error.message);
        }
        setLoading(false); // Ensure loading is set to false even on error
      },
    );

    // Cleanup: cancelar listener quando componente desmontar
    return () => {
      if (unsubscribe) {
        console.log("🛑 Cancelando listener de naturezas");
        try {
          unsubscribe();
        } catch (error) {
          console.warn("⚠️ Erro ao cancelar listener:", error);
        }
      }
    };
  }, []);

  // Adicionar nova natureza
  const adicionarNatureza = async (codigo, descricao) => {
    try {
      console.log("➕ Adicionando nova natureza:", { codigo, descricao });

      // Validação básica
      if (!codigo || !descricao) {
        throw new Error("Código e descrição são obrigatórios");
      }

      // Formatar no padrão: "CODIGO - DESCRICAO"
      const naturezaFormatada = `${codigo.trim()} - ${descricao.trim().toUpperCase()}`;
      console.log("📝 Natureza formatada:", naturezaFormatada);

      // Verificar se já existe (fixas + dinâmicas)
      const todasNaturezas = [
        ...NATUREZAS_DESPESA,
        ...naturezasDinamicas.map((n) => n.natureza),
      ];
      if (todasNaturezas.includes(naturezaFormatada)) {
        console.warn("⚠️ Natureza já existe:", naturezaFormatada);
        throw new Error("Esta natureza de despesa já existe");
      }

      // Salvar no Firebase
      const novoDocumento = {
        codigo: codigo.trim(),
        descricao: descricao.trim().toUpperCase(),
        natureza: naturezaFormatada,
        criadoEm: new Date(),
        ativo: true,
      };

      console.log("💾 Salvando no Firebase:", novoDocumento);
      const docRef = await addDoc(
        collection(db, "naturezas_despesa"),
        novoDocumento,
      );
      console.log("✅ Natureza salva com ID:", docRef.id);

      // ⚠️ NÃO PRECISA mais atualizar estado local, o onSnapshot faz isso automaticamente

      return {
        id: docRef.id,
        ...novoDocumento,
      };
    } catch (error) {
      console.error("❌ Erro ao adicionar natureza:", error);
      throw error;
    }
  };

  // Combinar naturezas fixas + dinâmicas
  const todasNaturezas = [
    ...NATUREZAS_DESPESA,
    ...naturezasDinamicas.map((n) => n.natureza),
  ];

  return {
    naturezas: todasNaturezas,
    naturezasDinamicas,
    loading,
    erro,
    adicionarNatureza,
  };
};