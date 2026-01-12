// src/hooks/useFornecedoresData.js
// Hook para carregar e gerenciar fornecedores

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { parseValorMonetario } from "../utils/formatters";

/**
 * Hook para gerenciar fornecedores
 * @param {object} usuario - Usuario logado
 * @param {object} options - Opcoes adicionais
 * @returns {object} Estado e funcoes para gerenciar fornecedores
 */
export const useFornecedoresData = (usuario, options = {}) => {
  const { municipio = null, uf = null, autoCarregar = true } = options;

  // Estados
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // Dados do usuario
  const userRole = usuario?.tipo || "operador";
  const userMunicipio = municipio || usuario?.municipio?.trim();
  const userUf = uf || usuario?.uf?.trim();

  // Listener em tempo real para fornecedores
  useEffect(() => {
    if (!autoCarregar) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let fornecedoresQuery;

    // Admin ve todos, outros filtram por UF
    if (userRole === "admin") {
      fornecedoresQuery = query(collection(db, "fornecedores"));
    } else if (userUf) {
      fornecedoresQuery = query(
        collection(db, "fornecedores"),
        where("uf", "==", userUf)
      );
    } else {
      // Sem filtro geografico, retorna vazio
      setFornecedores([]);
      setLoading(false);
      return;
    }

    // Listener em tempo real
    const unsubscribe = onSnapshot(
      fornecedoresQuery,
      (snapshot) => {
        const fornecedoresData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ordenar por razao social
        fornecedoresData.sort((a, b) =>
          (a.razaoSocial || "").localeCompare(b.razaoSocial || "")
        );

        setFornecedores(fornecedoresData);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar fornecedores:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userRole, userUf, autoCarregar]);

  // Buscar fornecedor por CNPJ
  const buscarPorCNPJ = useCallback(
    (cnpj) => {
      if (!cnpj) return null;
      const cnpjLimpo = cnpj.replace(/\D/g, "");
      return (
        fornecedores.find((f) => f.cnpj?.replace(/\D/g, "") === cnpjLimpo) ||
        null
      );
    },
    [fornecedores]
  );

  // Buscar fornecedor por ID
  const buscarPorId = useCallback(
    (fornecedorId) => {
      return fornecedores.find((f) => f.id === fornecedorId) || null;
    },
    [fornecedores]
  );

  // Verificar se CNPJ ja existe
  const verificarCNPJExistente = useCallback(
    async (cnpj, fornecedorIdExcluir = null) => {
      const cnpjLimpo = cnpj.replace(/\D/g, "");

      // Verificar no estado local primeiro
      const existeLocal = fornecedores.find(
        (f) =>
          f.cnpj?.replace(/\D/g, "") === cnpjLimpo &&
          f.id !== fornecedorIdExcluir
      );

      if (existeLocal) {
        return { existe: true, fornecedor: existeLocal };
      }

      // Verificar no Firebase (para garantir)
      try {
        const q = query(
          collection(db, "fornecedores"),
          where("cnpj", "==", cnpjLimpo)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          if (doc.id !== fornecedorIdExcluir) {
            return {
              existe: true,
              fornecedor: { id: doc.id, ...doc.data() },
            };
          }
        }
      } catch (err) {
        console.error("Erro ao verificar CNPJ:", err);
      }

      return { existe: false, fornecedor: null };
    },
    [fornecedores]
  );

  // Criar fornecedor
  const criar = useCallback(
    async (dados) => {
      setSalvando(true);
      setError(null);

      try {
        // Validar CNPJ unico
        const cnpjLimpo = dados.cnpj?.replace(/\D/g, "") || "";
        const { existe, fornecedor: existente } =
          await verificarCNPJExistente(cnpjLimpo);

        if (existe) {
          throw new Error(
            `CNPJ ja cadastrado: ${existente.razaoSocial || existente.cnpj}`
          );
        }

        // Preparar dados
        const fornecedorData = {
          cnpj: cnpjLimpo,
          razaoSocial: dados.razaoSocial?.trim() || "",
          nomeFantasia: dados.nomeFantasia?.trim() || "",
          endereco: {
            logradouro: dados.endereco?.logradouro?.trim() || dados.logradouro?.trim() || "",
            numero: dados.endereco?.numero?.trim() || dados.numero?.trim() || "",
            complemento: dados.endereco?.complemento?.trim() || dados.complemento?.trim() || "",
            bairro: dados.endereco?.bairro?.trim() || dados.bairro?.trim() || "",
            cidade: dados.endereco?.cidade?.trim() || dados.cidade?.trim() || "",
            uf: dados.endereco?.uf?.trim() || dados.ufEndereco?.trim() || userUf || "",
            cep: dados.endereco?.cep?.replace(/\D/g, "") || dados.cep?.replace(/\D/g, "") || "",
          },
          contato: {
            telefone: dados.contato?.telefone?.trim() || dados.telefone?.trim() || "",
            email: dados.contato?.email?.trim() || dados.email?.trim() || "",
          },
          situacaoCadastral: dados.situacaoCadastral || "ATIVA",
          dataUltimaConsulta: serverTimestamp(),
          // Filtros geograficos
          uf: dados.uf || userUf || "",
          municipiosAtendidos: dados.municipiosAtendidos || [userMunicipio].filter(Boolean),
          // Metadados
          criadoPor: usuario?.id || usuario?.uid || "",
          criadoEm: serverTimestamp(),
          atualizadoPor: usuario?.id || usuario?.uid || "",
          atualizadoEm: serverTimestamp(),
        };

        const docRef = await addDoc(
          collection(db, "fornecedores"),
          fornecedorData
        );

        console.log("Fornecedor criado:", docRef.id);
        return docRef.id;
      } catch (err) {
        console.error("Erro ao criar fornecedor:", err);
        setError(err.message);
        throw err;
      } finally {
        setSalvando(false);
      }
    },
    [usuario, userUf, userMunicipio, verificarCNPJExistente]
  );

  // Atualizar fornecedor
  const atualizar = useCallback(
    async (fornecedorId, dados) => {
      setSalvando(true);
      setError(null);

      try {
        // Se CNPJ foi alterado, verificar unicidade
        if (dados.cnpj) {
          const cnpjLimpo = dados.cnpj.replace(/\D/g, "");
          const { existe, fornecedor: existente } = await verificarCNPJExistente(
            cnpjLimpo,
            fornecedorId
          );

          if (existe) {
            throw new Error(
              `CNPJ ja cadastrado: ${existente.razaoSocial || existente.cnpj}`
            );
          }
        }

        const fornecedorRef = doc(db, "fornecedores", fornecedorId);

        // Preparar dados para atualizacao
        const updateData = {
          atualizadoPor: usuario?.id || usuario?.uid || "",
          atualizadoEm: serverTimestamp(),
        };

        // Adicionar campos se foram fornecidos
        if (dados.cnpj) updateData.cnpj = dados.cnpj.replace(/\D/g, "");
        if (dados.razaoSocial) updateData.razaoSocial = dados.razaoSocial.trim();
        if (dados.nomeFantasia !== undefined) updateData.nomeFantasia = dados.nomeFantasia.trim();
        if (dados.situacaoCadastral) updateData.situacaoCadastral = dados.situacaoCadastral;
        if (dados.uf) updateData.uf = dados.uf;
        if (dados.municipiosAtendidos) updateData.municipiosAtendidos = dados.municipiosAtendidos;

        // Atualizar endereco
        if (dados.endereco || dados.logradouro || dados.cidade) {
          updateData.endereco = {
            logradouro: dados.endereco?.logradouro || dados.logradouro || "",
            numero: dados.endereco?.numero || dados.numero || "",
            complemento: dados.endereco?.complemento || dados.complemento || "",
            bairro: dados.endereco?.bairro || dados.bairro || "",
            cidade: dados.endereco?.cidade || dados.cidade || "",
            uf: dados.endereco?.uf || dados.ufEndereco || "",
            cep: (dados.endereco?.cep || dados.cep || "").replace(/\D/g, ""),
          };
        }

        // Atualizar contato
        if (dados.contato || dados.telefone || dados.email) {
          updateData.contato = {
            telefone: dados.contato?.telefone || dados.telefone || "",
            email: dados.contato?.email || dados.email || "",
          };
        }

        await updateDoc(fornecedorRef, updateData);
        console.log("Fornecedor atualizado:", fornecedorId);
      } catch (err) {
        console.error("Erro ao atualizar fornecedor:", err);
        setError(err.message);
        throw err;
      } finally {
        setSalvando(false);
      }
    },
    [usuario, verificarCNPJExistente]
  );

  // Excluir fornecedor
  const excluir = useCallback(
    async (fornecedorId) => {
      setSalvando(true);
      setError(null);

      try {
        // Verificar se ha despesas vinculadas
        const despesasQuery = query(
          collection(db, "despesas"),
          where("fornecedorId", "==", fornecedorId)
        );
        const despesasSnapshot = await getDocs(despesasQuery);

        if (!despesasSnapshot.empty) {
          throw new Error(
            `Fornecedor possui ${despesasSnapshot.size} despesa(s) vinculada(s). Remova as despesas primeiro.`
          );
        }

        const fornecedorRef = doc(db, "fornecedores", fornecedorId);
        await deleteDoc(fornecedorRef);
        console.log("Fornecedor excluido:", fornecedorId);
      } catch (err) {
        console.error("Erro ao excluir fornecedor:", err);
        setError(err.message);
        throw err;
      } finally {
        setSalvando(false);
      }
    },
    []
  );

  // Filtrar fornecedores por termo de busca
  const filtrar = useCallback(
    (termo) => {
      if (!termo) return fornecedores;

      const termoLower = termo.toLowerCase();
      const termoNumerico = termo.replace(/\D/g, "");

      return fornecedores.filter((f) => {
        const matchCNPJ =
          termoNumerico && f.cnpj?.replace(/\D/g, "").includes(termoNumerico);
        const matchRazao = f.razaoSocial?.toLowerCase().includes(termoLower);
        const matchFantasia = f.nomeFantasia?.toLowerCase().includes(termoLower);
        const matchCidade = f.endereco?.cidade?.toLowerCase().includes(termoLower);

        return matchCNPJ || matchRazao || matchFantasia || matchCidade;
      });
    },
    [fornecedores]
  );

  // Calculos derivados
  const calculos = useMemo(() => {
    const total = fornecedores.length;
    const ativos = fornecedores.filter(
      (f) => f.situacaoCadastral === "ATIVA"
    ).length;
    const inativos = total - ativos;

    return {
      total,
      ativos,
      inativos,
    };
  }, [fornecedores]);

  return {
    // Estado
    fornecedores,
    loading,
    error,
    salvando,
    calculos,

    // CRUD
    criar,
    atualizar,
    excluir,

    // Buscas
    buscarPorId,
    buscarPorCNPJ,
    verificarCNPJExistente,
    filtrar,
  };
};

export default useFornecedoresData;
