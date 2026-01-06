// src/hooks/useDespesasData.js
// 🎯 Hook responsável APENAS por carregar dados de despesas e emendas
// ✅ Isolamento de lógica de fetching
// ✅ Cache e otimização
// ✅ Tratamento de erros centralizado
// ✅ CORREÇÃO P2: Filtro geográfico via query Firestore (consistente com useDashboardData)

import { useState, useEffect, useCallback } from "react";
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

      // 🎯 CASO 3: Operador/Gestor - filtrar por município + UF via query Firestore
      // ✅ CORREÇÃO P2: Usar query Firestore (consistente com useDashboardData)
      if (userMunicipio && userUf) {
        // Query com filtro composto (município + UF) diretamente no Firestore
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

        // Carregar despesas com filtro por município + UF
        if (emendasData.length > 0) {
          const despesasQuery = query(
            collection(db, "despesas"),
            where("municipio", "==", userMunicipio),
            where("uf", "==", userUf)
          );
          const despesasSnapshot = await getDocs(despesasQuery);
          const despesasData = despesasSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

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

  // 🔄 Auto-carregar na montagem
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    despesas,
    emendas,
    loading,
    error,
    recarregar: carregarDados,
  };
}
