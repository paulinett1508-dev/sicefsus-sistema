// src/hooks/useDespesasData.js
// 🎯 Hook responsável APENAS por carregar dados de despesas e emendas
// ✅ Isolamento de lógica de fetching
// ✅ Cache e otimização
// ✅ Tratamento de erros centralizado
// ✅ CORREÇÃO P2: Filtro geográfico via query Firestore (consistente com useDashboardData)

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export function useDespesasData(usuario, emendaIdFiltro = null) {
  const [despesas, setDespesas] = useState([]);
  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const userRole = usuario?.tipo || "operador";
  const userMunicipio = usuario?.municipio?.trim();
  const userUf = usuario?.uf?.trim();

  // 📥 Carregar dados
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 🎯 CASO 1: Filtro por emenda específica
      if (emendaIdFiltro) {
        const emendaDoc = await getDoc(doc(db, "emendas", emendaIdFiltro));

        if (emendaDoc.exists()) {
          const emendaData = { id: emendaDoc.id, ...emendaDoc.data() };
          setEmendas([emendaData]);

          // Carregar apenas despesas desta emenda
          const despesasQuery = query(
            collection(db, "despesas"),
            where("emendaId", "==", emendaIdFiltro),
          );
          const despesasSnapshot = await getDocs(despesasQuery);
          const despesasData = despesasSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setDespesas(despesasData);
          return;
        }
      }

      // 🎯 CASO 2: Admin - carregar tudo
      if (userRole === "admin") {
        const emendasSnapshot = await getDocs(collection(db, "emendas"));
        const emendasData = emendasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmendas(emendasData);

        // Carregar todas as despesas
        const despesasSnapshot = await getDocs(collection(db, "despesas"));
        const despesasData = despesasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDespesas(despesasData);
        return;
      }

      // 🎯 CASO 3: Operador/Gestor - filtrar por município + UF
      // ✅ CORREÇÃO: Despesas são filtradas pelo emendaId (não têm município próprio)
      if (userMunicipio && userUf) {
        // 1. Buscar emendas do município/UF do usuário
        const emendasQuery = query(
          collection(db, "emendas"),
          where("municipio", "==", userMunicipio),
          where("uf", "==", userUf)
        );
        const emendasSnapshot = await getDocs(emendasQuery);
        const emendasData = emendasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEmendas(emendasData);

        // 2. Buscar despesas pelo emendaId (vinculadas às emendas do município)
        if (emendasData.length > 0) {
          const emendasIds = emendasData.map((e) => e.id);
          const despesasData = [];
          const batchSize = 10; // Firestore limita "in" a 10 valores

          for (let i = 0; i < emendasIds.length; i += batchSize) {
            const batch = emendasIds.slice(i, i + batchSize);
            const despesasQuery = query(
              collection(db, "despesas"),
              where("emendaId", "in", batch)
            );
            const despesasSnapshot = await getDocs(despesasQuery);
            despesasSnapshot.docs.forEach((doc) => {
              despesasData.push({ id: doc.id, ...doc.data() });
            });
          }

          setDespesas(despesasData);
        }
        return;
      }

      // 🚨 Caso não se encaixe em nenhum cenário
      setEmendas([]);
      setDespesas([]);
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [emendaIdFiltro, userRole, userMunicipio, userUf]);

  // Auto-carregar na montagem com cleanup
  useEffect(() => {
    isMountedRef.current = true;
    carregarDados();
    return () => {
      isMountedRef.current = false;
    };
  }, [carregarDados]);

  return {
    despesas,
    emendas,
    loading,
    error,
    recarregar: carregarDados,
  };
}
