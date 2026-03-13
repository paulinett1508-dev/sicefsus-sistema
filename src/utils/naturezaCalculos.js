// src/utils/naturezaCalculos.js
// Funcoes de calculo para naturezas de despesa (envelopes orcamentarios)

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { parseValorMonetario } from "./formatters";

/**
 * Recalcula os valores de uma natureza especifica
 * @param {string} naturezaId - ID da natureza
 * @param {object} options - Opcoes
 * @returns {Promise<object>} Valores calculados
 */
export const recalcularNatureza = async (naturezaId, options = {}) => {
  const { silent = false } = options;

  try {
    if (!silent) {
      console.log(`🔄 Recalculando natureza ${naturezaId}...`);
    }

    // 1. Buscar dados da natureza
    const naturezaRef = doc(db, "naturezas", naturezaId);
    const naturezaSnap = await getDoc(naturezaRef);

    if (!naturezaSnap.exists()) {
      throw new Error(`Natureza ${naturezaId} nao encontrada`);
    }

    const natureza = naturezaSnap.data();

    // 2. Buscar despesas vinculadas a esta natureza
    const despesasQuery = query(
      collection(db, "despesas"),
      where("naturezaId", "==", naturezaId)
    );
    const despesasSnapshot = await getDocs(despesasQuery);
    const despesas = despesasSnapshot.docs.map((doc) => doc.data());

    // 3. Calcular valor executado (soma das despesas, excluindo PLANEJADA)
    const valorAlocado = parseValorMonetario(natureza.valorAlocado || 0);
    const despesasExecutadas = despesas.filter(d => d.status !== "PLANEJADA");
    const valorExecutado = despesasExecutadas.reduce((sum, despesa) => {
      return sum + parseValorMonetario(despesa.valor || 0);
    }, 0);

    // 4. Calcular saldo disponivel
    const saldoDisponivel = valorAlocado - valorExecutado;

    // 5. Calcular percentual executado
    const percentualExecutado =
      valorAlocado > 0 ? (valorExecutado / valorAlocado) * 100 : 0;

    // 6. Arredondar valores
    const valoresCalculados = {
      valorExecutado: Math.round(valorExecutado * 100) / 100,
      saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
      percentualExecutado: Math.round(percentualExecutado * 100) / 100,
    };

    if (!silent) {
      console.log(`✅ Natureza ${naturezaId} calculada:`, valoresCalculados);
    }

    // 7. Salvar no Firebase
    await updateDoc(naturezaRef, {
      ...valoresCalculados,
      atualizadoEm: serverTimestamp(),
    });

    return {
      ...valoresCalculados,
      valorAlocado,
      quantidadeDespesas: despesas.length,
    };
  } catch (error) {
    console.error(`❌ Erro ao recalcular natureza ${naturezaId}:`, error);
    throw error;
  }
};

/**
 * Recalcula os valores de alocacao de uma emenda (soma das naturezas)
 * @param {string} emendaId - ID da emenda
 * @param {object} options - Opcoes
 * @returns {Promise<object>} Valores calculados
 */
export const recalcularAlocacaoEmenda = async (emendaId, options = {}) => {
  const { silent = false } = options;

  try {
    if (!silent) {
      console.log(`🔄 Recalculando alocacao da emenda ${emendaId}...`);
    }

    // 1. Buscar dados da emenda
    const emendaRef = doc(db, "emendas", emendaId);
    const emendaSnap = await getDoc(emendaRef);

    if (!emendaSnap.exists()) {
      throw new Error(`Emenda ${emendaId} nao encontrada`);
    }

    const emenda = emendaSnap.data();
    const valorTotal = parseValorMonetario(
      emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0
    );

    // 2. Buscar todas as naturezas desta emenda
    const naturezasQuery = query(
      collection(db, "naturezas"),
      where("emendaId", "==", emendaId),
      where("status", "==", "ativo")
    );
    const naturezasSnapshot = await getDocs(naturezasQuery);
    const naturezas = naturezasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Calcular valor alocado (soma das naturezas)
    const valorAlocado = naturezas.reduce((sum, nat) => {
      return sum + parseValorMonetario(nat.valorAlocado || 0);
    }, 0);

    // 4. Calcular saldo livre (para novas naturezas)
    const saldoLivre = valorTotal - valorAlocado;

    // 5. Calcular percentual alocado
    const percentualAlocado =
      valorTotal > 0 ? (valorAlocado / valorTotal) * 100 : 0;

    // 6. Arredondar valores
    const valoresCalculados = {
      valorAlocado: Math.round(valorAlocado * 100) / 100,
      saldoLivre: Math.round(saldoLivre * 100) / 100,
      percentualAlocado: Math.round(percentualAlocado * 100) / 100,
    };

    if (!silent) {
      console.log(`✅ Emenda ${emendaId} alocacao calculada:`, valoresCalculados);
    }

    // 7. Salvar no Firebase
    await updateDoc(emendaRef, {
      ...valoresCalculados,
      atualizadoEm: serverTimestamp(),
    });

    return {
      ...valoresCalculados,
      valorTotal,
      quantidadeNaturezas: naturezas.length,
    };
  } catch (error) {
    console.error(`❌ Erro ao recalcular alocacao da emenda ${emendaId}:`, error);
    throw error;
  }
};

/**
 * Valida se um valor pode ser alocado em uma nova natureza
 * @param {string} emendaId - ID da emenda
 * @param {number} valorDesejado - Valor a ser alocado
 * @param {string} naturezaIdExcluir - ID da natureza a excluir do calculo (para edicao)
 * @returns {Promise<object>} Resultado da validacao
 */
export const validarAlocacaoNatureza = async (
  emendaId,
  valorDesejado,
  naturezaIdExcluir = null
) => {
  try {
    // 1. Buscar dados da emenda
    const emendaRef = doc(db, "emendas", emendaId);
    const emendaSnap = await getDoc(emendaRef);

    if (!emendaSnap.exists()) {
      return {
        valido: false,
        mensagem: "Emenda nao encontrada",
        saldoLivre: 0,
      };
    }

    const emenda = emendaSnap.data();
    const valorTotal = parseValorMonetario(
      emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0
    );

    // 2. Buscar naturezas existentes
    const naturezasQuery = query(
      collection(db, "naturezas"),
      where("emendaId", "==", emendaId),
      where("status", "==", "ativo")
    );
    const naturezasSnapshot = await getDocs(naturezasQuery);
    const naturezas = naturezasSnapshot.docs
      .filter((doc) => doc.id !== naturezaIdExcluir)
      .map((doc) => doc.data());

    // 3. Calcular valor ja alocado
    const valorJaAlocado = naturezas.reduce((sum, nat) => {
      return sum + parseValorMonetario(nat.valorAlocado || 0);
    }, 0);

    // 4. Calcular saldo livre
    const saldoLivre = valorTotal - valorJaAlocado;
    const valorDesejadoNum = parseValorMonetario(valorDesejado);

    // 5. Validar
    if (valorDesejadoNum <= 0) {
      return {
        valido: false,
        mensagem: "O valor deve ser maior que zero",
        saldoLivre: Math.round(saldoLivre * 100) / 100,
      };
    }

    if (valorDesejadoNum > saldoLivre) {
      return {
        valido: false,
        mensagem: `Saldo livre insuficiente. Disponivel: R$ ${saldoLivre.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        saldoLivre: Math.round(saldoLivre * 100) / 100,
      };
    }

    return {
      valido: true,
      mensagem: "Valor pode ser alocado",
      saldoLivre: Math.round(saldoLivre * 100) / 100,
      saldoAposAlocacao: Math.round((saldoLivre - valorDesejadoNum) * 100) / 100,
    };
  } catch (error) {
    console.error("Erro ao validar alocacao:", error);
    return {
      valido: false,
      mensagem: "Erro ao validar: " + error.message,
      saldoLivre: 0,
    };
  }
};

/**
 * Valida se uma despesa pode ser criada dentro de uma natureza
 * @param {string} naturezaId - ID da natureza
 * @param {number} valorDespesa - Valor da despesa
 * @param {string} despesaIdExcluir - ID da despesa a excluir (para edicao)
 * @returns {Promise<object>} Resultado da validacao
 */
export const validarDespesaNatureza = async (
  naturezaId,
  valorDespesa,
  despesaIdExcluir = null
) => {
  try {
    // 1. Buscar dados da natureza
    const naturezaRef = doc(db, "naturezas", naturezaId);
    const naturezaSnap = await getDoc(naturezaRef);

    if (!naturezaSnap.exists()) {
      return {
        valido: false,
        mensagem: "Natureza nao encontrada",
        saldoDisponivel: 0,
      };
    }

    const natureza = naturezaSnap.data();
    const valorAlocado = parseValorMonetario(natureza.valorAlocado || 0);

    // 2. Buscar despesas existentes
    const despesasQuery = query(
      collection(db, "despesas"),
      where("naturezaId", "==", naturezaId)
    );
    const despesasSnapshot = await getDocs(despesasQuery);
    const despesas = despesasSnapshot.docs
      .filter((doc) => doc.id !== despesaIdExcluir)
      .map((doc) => doc.data());

    // 3. Calcular valor ja executado
    const valorJaExecutado = despesas.reduce((sum, desp) => {
      return sum + parseValorMonetario(desp.valor || 0);
    }, 0);

    // 4. Calcular saldo disponivel
    const saldoDisponivel = valorAlocado - valorJaExecutado;
    const valorDespesaNum = parseValorMonetario(valorDespesa);

    // 5. Validar
    if (valorDespesaNum <= 0) {
      return {
        valido: false,
        mensagem: "O valor deve ser maior que zero",
        saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
      };
    }

    if (valorDespesaNum > saldoDisponivel) {
      return {
        valido: false,
        mensagem: `Saldo insuficiente na natureza. Disponivel: R$ ${saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
      };
    }

    return {
      valido: true,
      mensagem: "Despesa pode ser criada",
      saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
      saldoAposDespesa: Math.round((saldoDisponivel - valorDespesaNum) * 100) / 100,
    };
  } catch (error) {
    console.error("Erro ao validar despesa:", error);
    return {
      valido: false,
      mensagem: "Erro ao validar: " + error.message,
      saldoDisponivel: 0,
    };
  }
};

/**
 * Obtem todas as naturezas de uma emenda com calculos atualizados
 * @param {string} emendaId - ID da emenda
 * @returns {Promise<Array>} Lista de naturezas com valores
 */
export const getNaturezasComCalculo = async (emendaId) => {
  try {
    const naturezasQuery = query(
      collection(db, "naturezas"),
      where("emendaId", "==", emendaId)
    );
    const naturezasSnapshot = await getDocs(naturezasQuery);

    const naturezas = naturezasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordenar por data de criacao (mais recentes primeiro)
    naturezas.sort((a, b) => {
      const dataA = a.criadaEm?.toDate?.() || new Date(0);
      const dataB = b.criadaEm?.toDate?.() || new Date(0);
      return dataB - dataA;
    });

    return naturezas;
  } catch (error) {
    console.error("Erro ao buscar naturezas:", error);
    throw error;
  }
};

/**
 * Recalcula todas as naturezas de uma emenda
 * @param {string} emendaId - ID da emenda
 * @returns {Promise<void>}
 */
export const recalcularTodasNaturezas = async (emendaId) => {
  try {
    console.log(`🔄 Recalculando todas as naturezas da emenda ${emendaId}...`);

    const naturezas = await getNaturezasComCalculo(emendaId);

    for (const natureza of naturezas) {
      await recalcularNatureza(natureza.id, { silent: true });
    }

    // Recalcular alocacao da emenda
    await recalcularAlocacaoEmenda(emendaId, { silent: true });

    console.log(`✅ Todas as ${naturezas.length} naturezas recalculadas`);
  } catch (error) {
    console.error("Erro ao recalcular naturezas:", error);
    throw error;
  }
};
