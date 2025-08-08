// src/hooks/useRelatoriosData.js
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export function useRelatoriosData(usuario) {
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = usuario?.role;
  const userMunicipio = usuario?.municipio;
  const userUf = usuario?.uf;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Construir query para emendas baseado no perfil do usuário
        let emendasRef = collection(db, "emendas");
        if (userRole && userRole !== "admin") {
          emendasRef = query(
            emendasRef,
            where("municipio", "==", userMunicipio || null),
            where("uf", "==", userUf || null),
          );
        }

        const emendasSnapshot = await getDocs(emendasRef);
        const emendasData = emendasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmendas(emendasData);

        // Carregar despesas
        const despesasSnapshot = await getDocs(collection(db, "despesas"));
        let despesasData = despesasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filtrar despesas se não for admin
        if (userRole && userRole !== "admin") {
          const allowedEmendaIds = new Set(emendasData.map((e) => e.id));
          despesasData = despesasData.filter((d) =>
            allowedEmendaIds.has(d.emendaId),
          );
        }

        setDespesas(despesasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userRole, userMunicipio, userUf]);

  // Função para aplicar filtros aos dados
  const aplicarFiltros = (filtros) => {
    let emendasFiltradas = [...emendas];
    let despesasFiltradas = [...despesas];

    // Filtro por período
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio);
      emendasFiltradas = emendasFiltradas.filter(
        (e) => new Date(e.dataAprovacao) >= dataInicio,
      );
      despesasFiltradas = despesasFiltradas.filter(
        (d) => new Date(d.data) >= dataInicio,
      );
    }

    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      dataFim.setHours(23, 59, 59);
      emendasFiltradas = emendasFiltradas.filter(
        (e) => new Date(e.dataAprovacao) <= dataFim,
      );
      despesasFiltradas = despesasFiltradas.filter(
        (d) => new Date(d.data) <= dataFim,
      );
    }

    // Filtro por parlamentar
    if (filtros.parlamentar) {
      emendasFiltradas = emendasFiltradas.filter((e) =>
        e.autor?.toLowerCase().includes(filtros.parlamentar.toLowerCase()),
      );
    }

    // Filtro por município
    if (filtros.municipio) {
      emendasFiltradas = emendasFiltradas.filter((e) =>
        e.municipio?.toLowerCase().includes(filtros.municipio.toLowerCase()),
      );
    }

    // Filtro por UF
    if (filtros.uf) {
      emendasFiltradas = emendasFiltradas.filter((e) => e.uf === filtros.uf);
    }

    // Filtrar despesas baseado nas emendas filtradas
    const emendasIds = new Set(emendasFiltradas.map((e) => e.id));
    despesasFiltradas = despesasFiltradas.filter((d) =>
      emendasIds.has(d.emendaId),
    );

    return { emendasFiltradas, despesasFiltradas };
  };

  // Obter listas únicas para os selects
  const parlamentares = [
    ...new Set(emendas.map((e) => e.autor).filter(Boolean)),
  ].sort();
  const ufs = [...new Set(emendas.map((e) => e.uf).filter(Boolean))].sort();

  return {
    emendas,
    despesas,
    loading,
    error,
    aplicarFiltros,
    parlamentares,
    ufs,
  };
}
