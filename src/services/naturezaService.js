// src/services/naturezaService.js
// Servico CRUD para naturezas de despesa (envelopes orcamentarios)

import {
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { parseValorMonetario } from "../utils/formatters";
import {
  validarAlocacaoNatureza,
  recalcularNatureza,
  recalcularAlocacaoEmenda,
} from "../utils/naturezaCalculos";
import { auditService } from "./auditService";

/**
 * Cria uma nova natureza de despesa vinculada a uma emenda
 * @param {object} dados - Dados da natureza
 * @param {object} usuario - Usuario logado
 * @returns {Promise<string>} ID da natureza criada
 */
export const criarNatureza = async (dados, usuario) => {
  try {
    const { emendaId, codigo, descricao, valorAlocado } = dados;

    // Validar campos obrigatorios
    if (!emendaId || !codigo || !valorAlocado) {
      throw new Error("Campos obrigatorios: emendaId, codigo, valorAlocado");
    }

    // Validar se valor pode ser alocado
    const validacao = await validarAlocacaoNatureza(emendaId, valorAlocado);
    if (!validacao.valido) {
      throw new Error(validacao.mensagem);
    }

    // Buscar dados da emenda para herdar municipio/uf
    const emendaRef = doc(db, "emendas", emendaId);
    const emendaSnap = await getDoc(emendaRef);

    if (!emendaSnap.exists()) {
      throw new Error("Emenda nao encontrada");
    }

    const emenda = emendaSnap.data();

    // Criar documento da natureza
    const naturezaData = {
      emendaId,
      codigo: codigo.trim(),
      descricao: descricao?.trim() || codigo.trim(),
      valorAlocado: parseValorMonetario(valorAlocado),
      valorExecutado: 0,
      saldoDisponivel: parseValorMonetario(valorAlocado),
      percentualExecutado: 0,
      status: "ativo",
      municipio: emenda.municipio,
      uf: emenda.uf,
      criadaEm: serverTimestamp(),
      criadaPor: usuario?.email || "sistema",
      atualizadoEm: serverTimestamp(),
      atualizadoPor: usuario?.email || "sistema",
    };

    const docRef = await addDoc(collection(db, "naturezas"), naturezaData);

    // Recalcular alocacao da emenda
    await recalcularAlocacaoEmenda(emendaId);

    // Log de auditoria
    await auditService.logAction({
      action: "CREATE_NATUREZA",
      resourceType: "natureza",
      resourceId: docRef.id,
      dataAfter: naturezaData,
      userId: usuario?.uid,
      userEmail: usuario?.email,
      metadata: {
        emendaId,
        valorAlocado: naturezaData.valorAlocado,
      },
    });

    console.log(`✅ Natureza criada: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erro ao criar natureza:", error);
    throw error;
  }
};

/**
 * Atualiza uma natureza existente
 * @param {string} naturezaId - ID da natureza
 * @param {object} dados - Dados a atualizar
 * @param {object} usuario - Usuario logado
 * @returns {Promise<void>}
 */
export const atualizarNatureza = async (naturezaId, dados, usuario) => {
  try {
    const naturezaRef = doc(db, "naturezas", naturezaId);
    const naturezaSnap = await getDoc(naturezaRef);

    if (!naturezaSnap.exists()) {
      throw new Error("Natureza nao encontrada");
    }

    const naturezaAtual = naturezaSnap.data();

    // Se estiver alterando o valor alocado, validar
    if (dados.valorAlocado !== undefined) {
      const novoValor = parseValorMonetario(dados.valorAlocado);
      const valorAtual = parseValorMonetario(naturezaAtual.valorAlocado);

      // Se estiver diminuindo, verificar se nao fica menor que o executado
      if (novoValor < valorAtual) {
        const valorExecutado = parseValorMonetario(naturezaAtual.valorExecutado || 0);
        if (novoValor < valorExecutado) {
          throw new Error(
            `Valor nao pode ser menor que o executado (R$ ${valorExecutado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`
          );
        }
      }

      // Se estiver aumentando, validar contra saldo livre da emenda
      if (novoValor > valorAtual) {
        const diferenca = novoValor - valorAtual;
        const validacao = await validarAlocacaoNatureza(
          naturezaAtual.emendaId,
          diferenca,
          naturezaId
        );
        if (!validacao.valido) {
          throw new Error(validacao.mensagem);
        }
      }
    }

    // Preparar dados para atualizacao
    const dadosAtualizados = {
      ...dados,
      atualizadoEm: serverTimestamp(),
      atualizadoPor: usuario?.email || "sistema",
    };

    // Se valor alocado foi alterado, recalcular saldo
    if (dados.valorAlocado !== undefined) {
      dadosAtualizados.valorAlocado = parseValorMonetario(dados.valorAlocado);
      dadosAtualizados.saldoDisponivel =
        dadosAtualizados.valorAlocado -
        parseValorMonetario(naturezaAtual.valorExecutado || 0);
      dadosAtualizados.percentualExecutado =
        dadosAtualizados.valorAlocado > 0
          ? (parseValorMonetario(naturezaAtual.valorExecutado || 0) /
              dadosAtualizados.valorAlocado) *
            100
          : 0;
    }

    await updateDoc(naturezaRef, dadosAtualizados);

    // Recalcular alocacao da emenda
    await recalcularAlocacaoEmenda(naturezaAtual.emendaId);

    // Log de auditoria
    await auditService.logAction({
      action: "UPDATE_NATUREZA",
      resourceType: "natureza",
      resourceId: naturezaId,
      dataBefore: naturezaAtual,
      dataAfter: dadosAtualizados,
      userId: usuario?.uid,
      userEmail: usuario?.email,
    });

    console.log(`✅ Natureza atualizada: ${naturezaId}`);
  } catch (error) {
    console.error("❌ Erro ao atualizar natureza:", error);
    throw error;
  }
};

/**
 * Exclui uma natureza (soft delete - muda status para "encerrado")
 * @param {string} naturezaId - ID da natureza
 * @param {object} usuario - Usuario logado
 * @param {boolean} forcarExclusao - Excluir mesmo com despesas
 * @returns {Promise<void>}
 */
export const excluirNatureza = async (naturezaId, usuario, forcarExclusao = false) => {
  try {
    const naturezaRef = doc(db, "naturezas", naturezaId);
    const naturezaSnap = await getDoc(naturezaRef);

    if (!naturezaSnap.exists()) {
      throw new Error("Natureza nao encontrada");
    }

    const natureza = naturezaSnap.data();

    // Verificar se tem despesas vinculadas
    const despesasQuery = query(
      collection(db, "despesas"),
      where("naturezaId", "==", naturezaId)
    );
    const despesasSnap = await getDocs(despesasQuery);

    if (despesasSnap.size > 0 && !forcarExclusao) {
      throw new Error(
        `Natureza possui ${despesasSnap.size} despesa(s) vinculada(s). ` +
          "Exclua as despesas primeiro ou use a opcao de exclusao forcada."
      );
    }

    // Se forcar exclusao, desvincular despesas
    if (forcarExclusao && despesasSnap.size > 0) {
      for (const despDoc of despesasSnap.docs) {
        await updateDoc(doc(db, "despesas", despDoc.id), {
          naturezaId: null,
          naturezaExcluidaEm: serverTimestamp(),
        });
      }
    }

    // Soft delete - mudar status para encerrado
    await updateDoc(naturezaRef, {
      status: "encerrado",
      encerradoEm: serverTimestamp(),
      encerradoPor: usuario?.email || "sistema",
    });

    // Recalcular alocacao da emenda
    await recalcularAlocacaoEmenda(natureza.emendaId);

    // Log de auditoria
    await auditService.logAction({
      action: "DELETE_NATUREZA",
      resourceType: "natureza",
      resourceId: naturezaId,
      dataBefore: {
        codigo: natureza.codigo,
        descricao: natureza.descricao,
        valorAlocado: natureza.valorAlocado,
        valorExecutado: natureza.valorExecutado,
        emendaId: natureza.emendaId,
        status: natureza.status,
      },
      dataAfter: { status: "encerrado" },
      user: {
        uid: usuario?.uid,
        email: usuario?.email,
        nome: usuario?.nome,
        tipo: usuario?.tipo,
        municipio: usuario?.municipio,
        uf: usuario?.uf,
      },
      metadata: {
        origem: "natureza_service",
        tipoExclusao: "soft_delete",
        despesasDesvinculadas: forcarExclusao ? despesasSnap.size : 0,
      },
      relatedResources: {
        emendaId: natureza.emendaId,
      },
    });

    console.log(`✅ Natureza encerrada: ${naturezaId}`);
  } catch (error) {
    console.error("❌ Erro ao excluir natureza:", error);
    throw error;
  }
};

/**
 * Busca uma natureza por ID
 * @param {string} naturezaId - ID da natureza
 * @returns {Promise<object|null>} Dados da natureza
 */
export const buscarNatureza = async (naturezaId) => {
  try {
    const naturezaRef = doc(db, "naturezas", naturezaId);
    const naturezaSnap = await getDoc(naturezaRef);

    if (!naturezaSnap.exists()) {
      return null;
    }

    return {
      id: naturezaSnap.id,
      ...naturezaSnap.data(),
    };
  } catch (error) {
    console.error("Erro ao buscar natureza:", error);
    throw error;
  }
};

/**
 * Lista naturezas de uma emenda
 * @param {string} emendaId - ID da emenda
 * @param {object} options - Opcoes de filtro
 * @returns {Promise<Array>} Lista de naturezas
 */
export const listarNaturezas = async (emendaId, options = {}) => {
  try {
    const { incluirEncerradas = false } = options;

    let naturezasQuery;
    if (incluirEncerradas) {
      naturezasQuery = query(
        collection(db, "naturezas"),
        where("emendaId", "==", emendaId)
      );
    } else {
      naturezasQuery = query(
        collection(db, "naturezas"),
        where("emendaId", "==", emendaId),
        where("status", "==", "ativo")
      );
    }

    const snapshot = await getDocs(naturezasQuery);
    const naturezas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordenar por codigo
    naturezas.sort((a, b) => (a.codigo || "").localeCompare(b.codigo || ""));

    return naturezas;
  } catch (error) {
    console.error("Erro ao listar naturezas:", error);
    throw error;
  }
};

/**
 * Lista despesas de uma natureza
 * @param {string} naturezaId - ID da natureza
 * @param {boolean} forceServer - Forçar leitura do servidor (ignorar cache)
 * @returns {Promise<Array>} Lista de despesas
 */
export const listarDespesasNatureza = async (naturezaId, forceServer = true) => {
  try {
    const despesasQuery = query(
      collection(db, "despesas"),
      where("naturezaId", "==", naturezaId)
    );

    // ✅ CORREÇÃO: Usar getDocsFromServer para garantir dados atualizados
    const snapshot = forceServer
      ? await getDocsFromServer(despesasQuery)
      : await getDocs(despesasQuery);

    const despesas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordenar por data de criacao (mais recentes primeiro)
    despesas.sort((a, b) => {
      const dataA = a.criadaEm?.toDate?.() || new Date(0);
      const dataB = b.criadaEm?.toDate?.() || new Date(0);
      return dataB - dataA;
    });

    console.log(`📥 Despesas carregadas para natureza ${naturezaId}:`, despesas.length, forceServer ? "(do servidor)" : "(cache)");
    return despesas;
  } catch (error) {
    console.error("Erro ao listar despesas da natureza:", error);
    throw error;
  }
};

/**
 * Verifica se uma natureza ja existe para uma emenda (mesmo codigo)
 * @param {string} emendaId - ID da emenda
 * @param {string} codigo - Codigo da natureza
 * @param {string} naturezaIdExcluir - ID a excluir (para edicao)
 * @returns {Promise<boolean>} True se ja existe
 */
export const naturezaJaExiste = async (emendaId, codigo, naturezaIdExcluir = null) => {
  try {
    const naturezasQuery = query(
      collection(db, "naturezas"),
      where("emendaId", "==", emendaId),
      where("codigo", "==", codigo.trim()),
      where("status", "==", "ativo")
    );

    const snapshot = await getDocs(naturezasQuery);
    const naturezas = snapshot.docs.filter((doc) => doc.id !== naturezaIdExcluir);

    return naturezas.length > 0;
  } catch (error) {
    console.error("Erro ao verificar natureza existente:", error);
    throw error;
  }
};
