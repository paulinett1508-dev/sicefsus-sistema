// src/hooks/useRelatoriosData.js
// ✅ ATUALIZADO 04/11/2025: Adicionados filtros por emenda e fornecedor
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Função para parsear valores monetários brasileiros
function parseValorMonetario(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  if (typeof valor === "number") return valor;
  
  // Remove R$, espaços e caracteres especiais
  let valorLimpo = String(valor)
    .replace(/R\$\s*/gi, "")
    .replace(/\s/g, "")
    .trim();
  
  // Formato brasileiro: 1.234.567,89 -> 1234567.89
  if (valorLimpo.includes(",")) {
    valorLimpo = valorLimpo.replace(/\./g, "").replace(",", ".");
  }
  
  const resultado = parseFloat(valorLimpo);
  return isNaN(resultado) ? 0 : resultado;
}

export function useRelatoriosData(usuario) {
  const [emendas, setEmendas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = usuario?.role || usuario?.tipo;
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
        const emendasData = emendasSnapshot.docs.map((doc) => {
          const data = doc.data();
          // Normalizar valor da emenda
          const valorOriginal = data.valor || data.valorRecurso || data.valorTotal || 0;
          const valorNormalizado = parseValorMonetario(valorOriginal);
          
          return {
            id: doc.id,
            ...data,
            valorTotal: valorNormalizado,
          };
        });

        setEmendas(emendasData);

        // Carregar despesas com filtro por município/UF se não for admin
        let despesasRef = collection(db, "despesas");
        if (userRole && userRole !== "admin" && userMunicipio) {
          // 🔒 Operadores/Gestores só veem despesas do seu município
          despesasRef = query(
            despesasRef,
            where("municipio", "==", userMunicipio),
          );
        }

        const despesasSnapshot = await getDocs(despesasRef);
        let despesasData = despesasSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            valor: parseValorMonetario(data.valor),
          };
        });

        // Filtro adicional por emendas permitidas (segurança extra)
        if (userRole && userRole !== "admin") {
          const allowedEmendaIds = new Set(emendasData.map((e) => e.id));
          despesasData = despesasData.filter((d) =>
            allowedEmendaIds.has(d.emendaId),
          );
        }

        setDespesas(despesasData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userRole, userMunicipio, userUf]);

  // ✅ ATUALIZADO: Função para aplicar filtros aos dados
  const aplicarFiltros = (filtros) => {
    let emendasFiltradas = [...emendas];
    let despesasFiltradas = [...despesas];

    // Filtro por período
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio);
      emendasFiltradas = emendasFiltradas.filter((e) => {
        const dataEmenda = e.dataAprovacao || e.dataOb || e.criadaEm;
        return dataEmenda && new Date(dataEmenda) >= dataInicio;
      });
      despesasFiltradas = despesasFiltradas.filter((d) => {
        const dataDespesa = d.data || d.dataEmpenho || d.criadaEm;
        return dataDespesa && new Date(dataDespesa) >= dataInicio;
      });
    }

    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      dataFim.setHours(23, 59, 59);
      emendasFiltradas = emendasFiltradas.filter((e) => {
        const dataEmenda = e.dataAprovacao || e.dataOb || e.criadaEm;
        return dataEmenda && new Date(dataEmenda) <= dataFim;
      });
      despesasFiltradas = despesasFiltradas.filter((d) => {
        const dataDespesa = d.data || d.dataEmpenho || d.criadaEm;
        return dataDespesa && new Date(dataDespesa) <= dataFim;
      });
    }

    // Filtro por parlamentar
    if (filtros.parlamentar) {
      emendasFiltradas = emendasFiltradas.filter((e) =>
        (e.autor || e.parlamentar)
          ?.toLowerCase()
          .includes(filtros.parlamentar.toLowerCase()),
      );
    }

    // ✅ NOVO: Filtro por emenda específica
    if (filtros.emenda) {
      emendasFiltradas = emendasFiltradas.filter(
        (e) => e.id === filtros.emenda,
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

    // ✅ NOVO: Filtro por fornecedor
    if (filtros.fornecedor) {
      despesasFiltradas = despesasFiltradas.filter((d) => {
        const fornecedor = (d.fornecedor || "").toLowerCase();
        const cnpj = (d.cnpjFornecedor || "").toLowerCase();
        const filtroLower = filtros.fornecedor.toLowerCase();
        return fornecedor.includes(filtroLower) || cnpj.includes(filtroLower);
      });
    }

    return { emendasFiltradas, despesasFiltradas };
  };

  // Obter listas únicas para os selects
  const parlamentares = [
    ...new Set(emendas.map((e) => e.autor || e.parlamentar).filter(Boolean)),
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
