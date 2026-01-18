/**
 * Script: corrigir-naturezas-migradas.cjs
 *
 * Corrige naturezas que foram migradas de acoesServicos mas ficaram com valorAlocado = 0.
 * Busca o valor correto no campo legado acoesServicos da emenda e atualiza a natureza.
 *
 * Uso:
 *   node scripts/corrigir-naturezas-migradas.cjs          # Dry-run em PROD
 *   node scripts/corrigir-naturezas-migradas.cjs --dev    # Dry-run em DEV
 *   node scripts/corrigir-naturezas-migradas.cjs --apply  # Aplicar em PROD
 *   node scripts/corrigir-naturezas-migradas.cjs --dev --apply  # Aplicar em DEV
 */

const admin = require('firebase-admin');
const path = require('path');

// Argumentos
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const aplicar = args.includes('--apply');

// Configuração do ambiente
const ENV = isDev ? 'DEV' : 'PROD';
const credentialsPath = isDev
  ? path.join(__dirname, '../firebase-migration/dev-credentials.json')
  : path.join(__dirname, '../firebase-migration/prod-credentials.json');

console.log(`\n${'='.repeat(70)}`);
console.log(`🔧 CORREÇÃO DE NATUREZAS MIGRADAS SEM VALOR ALOCADO`);
console.log(`${'='.repeat(70)}`);
console.log(`📌 Ambiente: ${ENV}`);
console.log(`📌 Modo: ${aplicar ? '🔴 APLICAR CORREÇÕES' : '🟡 DRY-RUN (apenas diagnóstico)'}`);
console.log(`${'='.repeat(70)}\n`);

// Inicializar Firebase
try {
  const credentials = require(credentialsPath);
  admin.initializeApp({
    credential: admin.credential.cert(credentials)
  });
  console.log(`✅ Firebase ${ENV} conectado\n`);
} catch (error) {
  console.error(`❌ Erro ao conectar Firebase ${ENV}:`, error.message);
  process.exit(1);
}

const db = admin.firestore();

/**
 * Extrai o código da natureza de uma string como "339030 - MATERIAL DE CONSUMO"
 */
function extrairCodigoNatureza(estrategia) {
  if (!estrategia) return null;
  const match = estrategia.match(/^(\d{6})/);
  return match ? match[1] : null;
}

/**
 * Converte string de valor monetário para número
 * Ex: "600.000,00" -> 600000
 */
function parseValorMonetario(valor) {
  if (typeof valor === 'number') return valor;
  if (!valor || typeof valor !== 'string') return 0;

  // Remove pontos de milhar e substitui vírgula por ponto
  const limpo = valor.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  return parseFloat(limpo) || 0;
}

/**
 * Formata valor para exibição
 */
function formatCurrency(valor) {
  return (Number(valor) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

async function main() {
  const estatisticas = {
    naturezasAnalisadas: 0,
    naturezasComProblema: 0,
    naturezasCorrigidas: 0,
    naturezasSemCorrespondencia: 0,
    erros: 0,
    valorTotalCorrigido: 0,
  };

  try {
    // 1. Buscar todas as naturezas migradas com valorAlocado = 0
    console.log('📥 Buscando naturezas migradas com valorAlocado = 0...\n');

    const naturezasSnapshot = await db.collection('naturezas')
      .where('migradaDe', '==', 'acoesServicos')
      .where('valorAlocado', '==', 0)
      .get();

    if (naturezasSnapshot.empty) {
      console.log('✅ Nenhuma natureza migrada com valorAlocado = 0 encontrada!\n');
      return;
    }

    console.log(`📋 Encontradas ${naturezasSnapshot.size} naturezas para analisar\n`);
    console.log('-'.repeat(70));

    // 2. Processar cada natureza
    for (const naturezaDoc of naturezasSnapshot.docs) {
      estatisticas.naturezasAnalisadas++;
      const natureza = naturezaDoc.data();
      const naturezaId = naturezaDoc.id;

      console.log(`\n🔍 Natureza: ${natureza.codigo} - ${natureza.descricao?.substring(0, 40)}...`);
      console.log(`   ID: ${naturezaId}`);
      console.log(`   Emenda ID: ${natureza.emendaId}`);

      // 3. Buscar emenda correspondente
      const emendaDoc = await db.collection('emendas').doc(natureza.emendaId).get();

      if (!emendaDoc.exists) {
        console.log(`   ⚠️ Emenda não encontrada!`);
        estatisticas.naturezasSemCorrespondencia++;
        continue;
      }

      const emenda = emendaDoc.data();
      console.log(`   Emenda: ${emenda.numero} - ${emenda.municipio}/${emenda.uf}`);

      // 4. Buscar valor no campo legado acoesServicos
      const acoesServicos = emenda.acoesServicos || [];

      if (!Array.isArray(acoesServicos) || acoesServicos.length === 0) {
        console.log(`   ⚠️ Emenda sem acoesServicos legado`);
        estatisticas.naturezasSemCorrespondencia++;
        continue;
      }

      // Buscar a ação correspondente pelo código da natureza
      const acaoCorrespondente = acoesServicos.find(acao => {
        const codigoAcao = extrairCodigoNatureza(acao.estrategia);
        return codigoAcao === natureza.codigo;
      });

      if (!acaoCorrespondente) {
        console.log(`   ⚠️ Código ${natureza.codigo} não encontrado em acoesServicos`);
        console.log(`   📋 Códigos disponíveis: ${acoesServicos.map(a => extrairCodigoNatureza(a.estrategia)).join(', ')}`);
        estatisticas.naturezasSemCorrespondencia++;
        continue;
      }

      // 5. Extrair valor da ação
      const valorAcao = parseValorMonetario(acaoCorrespondente.valorAcao);

      if (valorAcao <= 0) {
        console.log(`   ⚠️ Valor da ação é zero ou inválido: ${acaoCorrespondente.valorAcao}`);
        estatisticas.naturezasSemCorrespondencia++;
        continue;
      }

      estatisticas.naturezasComProblema++;
      console.log(`   💰 Valor encontrado em acoesServicos: ${formatCurrency(valorAcao)}`);
      console.log(`   📊 valorAlocado atual: ${formatCurrency(natureza.valorAlocado)}`);
      console.log(`   📊 valorExecutado: ${formatCurrency(natureza.valorExecutado || 0)}`);

      // 6. Calcular novos valores
      const valorExecutado = parseValorMonetario(natureza.valorExecutado || 0);
      const novoSaldoDisponivel = valorAcao - valorExecutado;
      const novoPercentualExecutado = valorAcao > 0 ? (valorExecutado / valorAcao) * 100 : 0;

      console.log(`   ✏️ Correção proposta:`);
      console.log(`      valorAlocado: ${formatCurrency(0)} → ${formatCurrency(valorAcao)}`);
      console.log(`      saldoDisponivel: ${formatCurrency(0)} → ${formatCurrency(novoSaldoDisponivel)}`);
      console.log(`      percentualExecutado: 0% → ${novoPercentualExecutado.toFixed(2)}%`);

      // 7. Aplicar correção (se --apply)
      if (aplicar) {
        try {
          await db.collection('naturezas').doc(naturezaId).update({
            valorAlocado: Math.round(valorAcao * 100) / 100,
            saldoDisponivel: Math.round(novoSaldoDisponivel * 100) / 100,
            percentualExecutado: Math.round(novoPercentualExecutado * 100) / 100,
            corrigidoEm: admin.firestore.FieldValue.serverTimestamp(),
            corrigidoPor: 'script-corrigir-naturezas-migradas',
            valorOriginalAcoesServicos: acaoCorrespondente.valorAcao,
          });

          console.log(`   ✅ CORRIGIDO!`);
          estatisticas.naturezasCorrigidas++;
          estatisticas.valorTotalCorrigido += valorAcao;
        } catch (error) {
          console.log(`   ❌ Erro ao corrigir: ${error.message}`);
          estatisticas.erros++;
        }
      } else {
        console.log(`   🟡 [DRY-RUN] Correção não aplicada`);
        estatisticas.valorTotalCorrigido += valorAcao;
      }
    }

    // 8. Verificar também a emenda (atualizar valorAlocado da emenda)
    if (aplicar && estatisticas.naturezasCorrigidas > 0) {
      console.log('\n' + '-'.repeat(70));
      console.log('🔄 Recalculando valorAlocado das emendas afetadas...\n');

      // Buscar emendas únicas das naturezas corrigidas
      const emendasAfetadas = new Set();
      for (const naturezaDoc of naturezasSnapshot.docs) {
        const natureza = naturezaDoc.data();
        emendasAfetadas.add(natureza.emendaId);
      }

      for (const emendaId of emendasAfetadas) {
        // Buscar todas as naturezas ativas desta emenda
        const naturezasEmenda = await db.collection('naturezas')
          .where('emendaId', '==', emendaId)
          .where('status', '==', 'ativo')
          .get();

        let totalAlocado = 0;
        let totalExecutado = 0;

        naturezasEmenda.forEach(doc => {
          const nat = doc.data();
          totalAlocado += parseValorMonetario(nat.valorAlocado || 0);
          totalExecutado += parseValorMonetario(nat.valorExecutado || 0);
        });

        // Buscar valor total da emenda
        const emendaDoc = await db.collection('emendas').doc(emendaId).get();
        const emenda = emendaDoc.data();
        const valorEmenda = parseValorMonetario(emenda.valor || emenda.valorRecurso || 0);

        const saldoParaNaturezas = valorEmenda - totalAlocado;
        const saldoNaoExecutado = valorEmenda - totalExecutado;
        const percentualAlocado = valorEmenda > 0 ? (totalAlocado / valorEmenda) * 100 : 0;
        const percentualExecutado = valorEmenda > 0 ? (totalExecutado / valorEmenda) * 100 : 0;

        await db.collection('emendas').doc(emendaId).update({
          valorAlocado: Math.round(totalAlocado * 100) / 100,
          valorExecutado: Math.round(totalExecutado * 100) / 100,
          saldoParaNaturezas: Math.round(saldoParaNaturezas * 100) / 100,
          saldoNaoExecutado: Math.round(saldoNaoExecutado * 100) / 100,
          saldoLivre: Math.round(saldoParaNaturezas * 100) / 100,
          saldoDisponivel: Math.round(saldoNaoExecutado * 100) / 100,
          percentualAlocado: Math.round(percentualAlocado * 100) / 100,
          percentualExecutado: Math.round(percentualExecutado * 100) / 100,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`   ✅ Emenda ${emenda.numero}: valorAlocado = ${formatCurrency(totalAlocado)}`);
      }
    }

    // 9. Resumo final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMO');
    console.log('='.repeat(70));
    console.log(`   Ambiente: ${ENV}`);
    console.log(`   Naturezas analisadas: ${estatisticas.naturezasAnalisadas}`);
    console.log(`   Naturezas com problema: ${estatisticas.naturezasComProblema}`);
    console.log(`   Naturezas sem correspondência: ${estatisticas.naturezasSemCorrespondencia}`);

    if (aplicar) {
      console.log(`   ✅ Naturezas corrigidas: ${estatisticas.naturezasCorrigidas}`);
      console.log(`   ❌ Erros: ${estatisticas.erros}`);
    } else {
      console.log(`   🟡 [DRY-RUN] Correções pendentes: ${estatisticas.naturezasComProblema}`);
    }

    console.log(`   💰 Valor total ${aplicar ? 'corrigido' : 'a corrigir'}: ${formatCurrency(estatisticas.valorTotalCorrigido)}`);
    console.log('='.repeat(70));

    if (!aplicar && estatisticas.naturezasComProblema > 0) {
      console.log(`\n⚠️ Para aplicar as correções, execute:`);
      console.log(`   node scripts/corrigir-naturezas-migradas.cjs ${isDev ? '--dev ' : ''}--apply\n`);
    }

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

main();
