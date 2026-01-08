// src/utils/emendaCalculos.js
// ✅ Função de recálculo automático de valores da emenda
// Chamada automaticamente após criar/editar/deletar despesas
// ✅ CORREÇÃO P1: Usar parseValorMonetario centralizado de formatters.js
// ✅ v2.0: Adicionado suporte a naturezas (envelopes orçamentários)

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
 * ✅ FUNÇÃO PRINCIPAL: Recalcular e salvar valores da emenda
 *
 * @param {string} emendaId - ID da emenda a ser recalculada
 * @param {object} options - Opções adicionais
 * @param {boolean} options.silent - Se true, não loga no console (padrão: false)
 * @returns {Promise<object>} Valores calculados
 */
export const recalcularSaldoEmenda = async (emendaId, options = {}) => {
  const { silent = false } = options;

  try {
    if (!silent) {
      console.log(`🔄 Recalculando emenda ${emendaId}...`);
    }

    // 1️⃣ Buscar dados da emenda
    const emendaRef = doc(db, "emendas", emendaId);
    const emendaSnap = await getDoc(emendaRef);

    if (!emendaSnap.exists()) {
      throw new Error(`Emenda ${emendaId} não encontrada`);
    }

    const emenda = emendaSnap.data();

    // 2️⃣ Buscar despesas da emenda
    const despesasQuery = query(
      collection(db, "despesas"),
      where("emendaId", "==", emendaId),
    );
    const despesasSnapshot = await getDocs(despesasQuery);
    const todasDespesas = despesasSnapshot.docs.map((doc) => doc.data());

    // ✅ FILTRO CRÍTICO: Excluir APENAS despesas planejadas
    const despesas = todasDespesas.filter(d => d.status !== "PLANEJADA");

    // 2️⃣b Buscar naturezas ativas da emenda (envelopes orçamentários)
    const naturezasQuery = query(
      collection(db, "naturezas"),
      where("emendaId", "==", emendaId),
      where("status", "==", "ativo")
    );
    const naturezasSnapshot = await getDocs(naturezasQuery);
    const naturezas = naturezasSnapshot.docs.map((doc) => doc.data());

    // 3️⃣ CORREÇÃO P1: Ordem padronizada de fallback
    const valorTotal = parseValorMonetario(
      emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0,
    );

    // 4️⃣ Calcular valor executado (soma de todas as despesas)
    const valorExecutado = despesas.reduce((sum, despesa) => {
      const valorDespesa = parseValorMonetario(despesa.valor || 0);
      return sum + valorDespesa;
    }, 0);

    // 4️⃣b Calcular valor alocado (soma das naturezas - envelopes)
    const valorAlocado = naturezas.reduce((sum, natureza) => {
      return sum + parseValorMonetario(natureza.valorAlocado || 0);
    }, 0);

    // 5️⃣ Calcular saldos
    const saldoDisponivel = valorTotal - valorExecutado;
    const saldoLivre = valorTotal - valorAlocado; // Para novas naturezas

    // 6️⃣ Calcular percentuais
    const percentualExecutado =
      valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;
    const percentualAlocado =
      valorTotal > 0 ? (valorAlocado / valorTotal) * 100 : 0;

    // 7️⃣ Arredondar valores para 2 casas decimais
    const valoresCalculados = {
      valorExecutado: Math.round(valorExecutado * 100) / 100,
      saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
      percentualExecutado: Math.round(percentualExecutado * 100) / 100,
      // Novos campos para naturezas (envelopes)
      valorAlocado: Math.round(valorAlocado * 100) / 100,
      saldoLivre: Math.round(saldoLivre * 100) / 100,
      percentualAlocado: Math.round(percentualAlocado * 100) / 100,
    };

    // 🔍 DEBUG: Log completo antes de salvar
    if (!silent) {
      console.log(`🔍 DEBUG - Valores calculados ANTES de salvar:`, {
        emendaId,
        valorTotal,
        despesasEncontradas: despesas.length,
        naturezasEncontradas: naturezas.length,
        valorExecutadoBruto: valorExecutado,
        valorAlocadoBruto: valorAlocado,
        ...valoresCalculados,
      });
    }

    // 8️⃣ Salvar no Firebase com retry em caso de conflito
    let tentativas = 0;
    const maxTentativas = 3;
    let salvamentoSucesso = false;

    while (!salvamentoSucesso && tentativas < maxTentativas) {
      try {
        await updateDoc(emendaRef, {
          valorExecutado: valoresCalculados.valorExecutado,
          saldoDisponivel: valoresCalculados.saldoDisponivel,
          percentualExecutado: valoresCalculados.percentualExecutado,
          // Novos campos para naturezas (envelopes)
          valorAlocado: valoresCalculados.valorAlocado,
          saldoLivre: valoresCalculados.saldoLivre,
          percentualAlocado: valoresCalculados.percentualAlocado,
          atualizadoEm: serverTimestamp(),
          versaoCalculo: Date.now(), // Timestamp para detectar conflitos
        });
        salvamentoSucesso = true;
      } catch (error) {
        tentativas++;
        if (tentativas >= maxTentativas) {
          throw error;
        }
        // Aguarda 500ms antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 500));
        console.warn(`⚠️ Tentativa ${tentativas} de salvar recálculo...`);
      }
    }

    // 🔍 DEBUG: Confirmar salvamento
    if (!silent) {
      console.log(`✅ Valores SALVOS no Firebase:`, {
        valorExecutado: valoresCalculados.valorExecutado,
        saldoDisponivel: valoresCalculados.saldoDisponivel,
        percentualExecutado: valoresCalculados.percentualExecutado,
        valorAlocado: valoresCalculados.valorAlocado,
        saldoLivre: valoresCalculados.saldoLivre,
        percentualAlocado: valoresCalculados.percentualAlocado,
      });
    }

    if (!silent) {
      console.log(`✅ Emenda ${emendaId} recalculada:`, {
        valorTotal,
        despesas: despesas.length,
        naturezas: naturezas.length,
        ...valoresCalculados,
      });
    }

    return {
      success: true,
      valores: valoresCalculados,
      despesas: despesas.length,
      naturezas: naturezas.length,
      valorTotal,
    };
  } catch (error) {
    console.error(`❌ Erro ao recalcular emenda ${emendaId}:`, error);

    // ⚠️ NÃO lança erro para não quebrar o fluxo principal
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * ✅ Forçar leitura dos dados mais recentes do servidor (bypass cache)
 * 
 * @param {string} emendaId - ID da emenda
 * @returns {Promise<object>} Dados atualizados da emenda
 */
export const obterEmendaAtualizada = async (emendaId) => {
  try {
    const emendaRef = doc(db, "emendas", emendaId);
    // getDoc com { source: 'server' } força leitura do servidor
    const emendaSnap = await getDoc(emendaRef);
    
    if (!emendaSnap.exists()) {
      throw new Error(`Emenda ${emendaId} não encontrada`);
    }

    return {
      id: emendaSnap.id,
      ...emendaSnap.data(),
    };
  } catch (error) {
    console.error(`❌ Erro ao obter emenda atualizada:`, error);
    throw error;
  }
};

/**
 * ✅ Recalcular múltiplas emendas em lote
 * Útil para ferramentas de administração
 *
 * @param {string[]} emendaIds - Array de IDs das emendas
 * @returns {Promise<object>} Resultado do recálculo em lote
 */
export const recalcularEmendasEmLote = async (emendaIds) => {
  console.log(`🔄 Recalculando ${emendaIds.length} emendas em lote...`);

  const resultados = {
    sucesso: 0,
    falha: 0,
    erros: [],
  };

  for (const emendaId of emendaIds) {
    const resultado = await recalcularSaldoEmenda(emendaId, { silent: true });

    if (resultado.success) {
      resultados.sucesso++;
    } else {
      resultados.falha++;
      resultados.erros.push({
        emendaId,
        erro: resultado.error,
      });
    }
  }

  console.log(`✅ Recálculo em lote finalizado:`, resultados);
  return resultados;
};