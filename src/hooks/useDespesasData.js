// src/hooks/useDespesasData.js
// 🎯 Hook responsável APENAS por carregar dados de despesas e emendas
// ✅ Isolamento de lógica de fetching
// ✅ Cache e otimização
// ✅ Tratamento de erros centralizado

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
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  // 🔧 Normalizar texto para comparação
  const normalizarTexto = useCallback((texto) => {
    if (!texto) return "";
    return texto
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }, []);

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

      // 🎯 CASO 3: Operador - filtrar por município
      if (userMunicipio && userUf) {
        const emendasSnapshot = await getDocs(collection(db, "emendas"));
        const todasEmendas = emendasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const emendasFiltradas = todasEmendas.filter(
          (emenda) =>
            normalizarTexto(emenda.municipio) ===
            normalizarTexto(userMunicipio),
        );

        setEmendas(emendasFiltradas);

        // Carregar despesas dessas emendas (em lotes de 10)
        if (emendasFiltradas.length > 0) {
          const emendasIds = emendasFiltradas.map((e) => e.id);
          const despesasData = [];

          for (let i = 0; i < emendasIds.length; i += 10) {
            const batch = emendasIds.slice(i, i + 10);
            const despesasQuery = query(
              collection(db, "despesas"),
              where("emendaId", "in", batch),
            );
            const snapshot = await getDocs(despesasQuery);
            snapshot.docs.forEach((doc) => {
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
  }, [emendaIdFiltro, userRole, userMunicipio, userUf, normalizarTexto]);

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
