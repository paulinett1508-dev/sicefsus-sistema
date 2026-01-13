/**
 * RECALCULAR NATUREZAS - SICEFSUS
 * Script para recalcular valorExecutado das naturezas com base nas despesas EXECUTADAS.
 *
 * Lógica:
 * 1. Para cada natureza, buscar todas as despesas com naturezaId = natureza.id
 * 2. Somar os valores das despesas com status = "EXECUTADA"
 * 3. Atualizar natureza.valorExecutado com a soma
 * 4. Auto-regularizar: se valorAlocado=0 e valorExecutado>0, definir valorAlocado=valorExecutado
 * 5. Recalcular emenda.valorAlocado = soma(naturezas.valorAlocado)
 *
 * Uso:
 *   node scripts/recalcular-naturezas.cjs           # PROD dry-run
 *   node scripts/recalcular-naturezas.cjs --apply   # PROD aplicar
 *   node scripts/recalcular-naturezas.cjs --dev     # DEV dry-run
 *   node scripts/recalcular-naturezas.cjs --dev --apply # DEV aplicar
 */

const admin = require('firebase-admin');
const path = require('path');

// Verificar argumentos
const USE_DEV = process.argv.includes('--dev');
const APPLY_CHANGES = process.argv.includes('--apply');

// Selecionar credenciais
const credentialsFile = USE_DEV ? 'dev-credentials.json' : 'prod-credentials.json';
const credentialsPath = path.join(__dirname, '../firebase-migration', credentialsFile);

let serviceAccount;
try {
  serviceAccount = require(credentialsPath);
} catch (err) {
  console.error('ERRO: Arquivo de credenciais não encontrado em:', credentialsPath);
  process.exit(1);
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Buscar todas as naturezas
 */
async function buscarNaturezas() {
  const snapshot = await db.collection('naturezas').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Buscar todas as despesas
 */
async function buscarDespesas() {
  const snapshot = await db.collection('despesas').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Buscar todas as emendas
 */
async function buscarEmendas() {
  const snapshot = await db.collection('emendas').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Função principal
 */
async function main() {
  const ambiente = USE_DEV ? 'DEV (desenvolvimento)' : 'PROD (produção)';
  const modo = APPLY_CHANGES ? '⚠️  APLICAR CORREÇÕES' : '🔍 DRY-RUN (apenas diagnóstico)';

  console.log('');
  console.log('╔' + '═'.repeat(64) + '╗');
  console.log('║     RECALCULAR NATUREZAS - SICEFSUS                           ║');
  console.log('╠' + '═'.repeat(64) + '╣');
  console.log(`║  Ambiente: ${ambiente}`);
  console.log(`║  Modo: ${modo}`);
  console.log('╚' + '═'.repeat(64) + '╝');
  console.log('');

  // Buscar dados
  console.log('Buscando dados...');
  const naturezas = await buscarNaturezas();
  const despesas = await buscarDespesas();
  const emendas = await buscarEmendas();

  console.log(`Total de naturezas: ${naturezas.length}`);
  console.log(`Total de despesas: ${despesas.length}`);
  console.log(`Total de emendas: ${emendas.length}`);
  console.log('');

  // Agrupar despesas por naturezaId
  const despesasPorNatureza = {};
  for (const d of despesas) {
    if (d.naturezaId) {
      if (!despesasPorNatureza[d.naturezaId]) {
        despesasPorNatureza[d.naturezaId] = [];
      }
      despesasPorNatureza[d.naturezaId].push(d);
    }
  }

  // FASE 1: Recalcular valorExecutado das naturezas
  console.log('━━━ FASE 1: RECALCULAR VALOR EXECUTADO DAS NATUREZAS ━━━');
  console.log('');

  const naturezasParaAtualizar = [];

  for (const natureza of naturezas) {
    const despesasDaNatureza = despesasPorNatureza[natureza.id] || [];

    // Somar apenas despesas EXECUTADAS
    const somaExecutadas = despesasDaNatureza
      .filter(d => d.status === 'EXECUTADA')
      .reduce((acc, d) => {
        const valor = typeof d.valor === 'string'
          ? parseFloat(d.valor.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
          : (d.valor || 0);
        return acc + valor;
      }, 0);

    const valorExecutadoAtual = natureza.valorExecutado || 0;
    const diferenca = Math.abs(somaExecutadas - valorExecutadoAtual);

    if (diferenca > 0.01) {
      naturezasParaAtualizar.push({
        id: natureza.id,
        emendaId: natureza.emendaId,
        codigo: natureza.codigo,
        valorExecutadoAtual,
        valorExecutadoNovo: somaExecutadas,
        diferenca,
        valorAlocadoAtual: natureza.valorAlocado || 0,
      });
    }
  }

  if (naturezasParaAtualizar.length > 0) {
    console.log(`⚠️  NATUREZAS COM VALOR EXECUTADO DIVERGENTE (${naturezasParaAtualizar.length}):`);
    console.log('');
    for (const n of naturezasParaAtualizar.slice(0, 15)) {
      console.log(`  ${n.id.substring(0, 20)}... | ${n.codigo}`);
      console.log(`    Atual: R$ ${n.valorExecutadoAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log(`    Soma despesas: R$ ${n.valorExecutadoNovo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log('');
    }
    if (naturezasParaAtualizar.length > 15) {
      console.log(`  ... e mais ${naturezasParaAtualizar.length - 15}`);
      console.log('');
    }
  } else {
    console.log('✅ Todas as naturezas têm valorExecutado consistente com as despesas!');
    console.log('');
  }

  // FASE 2: Auto-regularizar naturezas (valorAlocado = valorExecutado quando valorAlocado=0)
  console.log('━━━ FASE 2: AUTO-REGULARIZAR NATUREZAS ━━━');
  console.log('');

  // Recalcular valorExecutado primeiro para ter dados atualizados
  const naturezasAtualizadas = naturezas.map(n => {
    const atualizar = naturezasParaAtualizar.find(x => x.id === n.id);
    if (atualizar) {
      return { ...n, valorExecutado: atualizar.valorExecutadoNovo };
    }
    return n;
  });

  const naturezasParaRegularizar = naturezasAtualizadas.filter(n =>
    (n.valorAlocado === 0 || n.valorAlocado === undefined) &&
    (n.valorExecutado > 0)
  );

  if (naturezasParaRegularizar.length > 0) {
    console.log(`⚠️  NATUREZAS PARA REGULARIZAR (valorAlocado=0, valorExecutado>0): ${naturezasParaRegularizar.length}`);
    console.log('');
    for (const n of naturezasParaRegularizar.slice(0, 10)) {
      console.log(`  ${n.id.substring(0, 20)}... | ${n.codigo} | Emenda: ${(n.emendaId || '').substring(0, 15)}...`);
      console.log(`    valorAlocado atual: R$ ${(n.valorAlocado || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log(`    valorExecutado: R$ ${(n.valorExecutado || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log(`    → Novo valorAlocado: R$ ${(n.valorExecutado || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log('');
    }
    if (naturezasParaRegularizar.length > 10) {
      console.log(`  ... e mais ${naturezasParaRegularizar.length - 10}`);
      console.log('');
    }
  } else {
    console.log('✅ Nenhuma natureza precisa de regularização!');
    console.log('');
  }

  // FASE 3: Recalcular emendas
  console.log('━━━ FASE 3: RECALCULAR EMENDAS ━━━');
  console.log('');

  // Agrupar naturezas por emendaId (com valores atualizados)
  const naturezasPorEmenda = {};
  for (const n of naturezasAtualizadas) {
    if (n.emendaId) {
      if (!naturezasPorEmenda[n.emendaId]) {
        naturezasPorEmenda[n.emendaId] = [];
      }
      // Aplicar regularização se necessário
      const regularizar = naturezasParaRegularizar.find(x => x.id === n.id);
      if (regularizar) {
        naturezasPorEmenda[n.emendaId].push({ ...n, valorAlocado: n.valorExecutado });
      } else {
        naturezasPorEmenda[n.emendaId].push(n);
      }
    }
  }

  const emendasParaAtualizar = [];

  for (const emenda of emendas) {
    const naturezasDaEmenda = naturezasPorEmenda[emenda.id] || [];

    const somaAlocado = naturezasDaEmenda.reduce((acc, n) => acc + (n.valorAlocado || 0), 0);
    const somaExecutado = naturezasDaEmenda.reduce((acc, n) => acc + (n.valorExecutado || 0), 0);

    const valorAlocadoAtual = emenda.valorAlocado || 0;
    const valorExecutadoAtual = emenda.valorExecutado || 0;

    const difAlocado = Math.abs(somaAlocado - valorAlocadoAtual);
    const difExecutado = Math.abs(somaExecutado - valorExecutadoAtual);

    if (difAlocado > 0.01 || difExecutado > 0.01) {
      emendasParaAtualizar.push({
        id: emenda.id,
        numero: emenda.numero,
        valor: emenda.valor,
        valorAlocadoAtual,
        valorAlocadoNovo: somaAlocado,
        valorExecutadoAtual,
        valorExecutadoNovo: somaExecutado,
      });
    }
  }

  if (emendasParaAtualizar.length > 0) {
    console.log(`⚠️  EMENDAS PARA ATUALIZAR (${emendasParaAtualizar.length}):`);
    console.log('');
    for (const e of emendasParaAtualizar.slice(0, 10)) {
      console.log(`  ${e.numero} (${e.id.substring(0, 15)}...)`);
      console.log(`    Valor emenda: R$ ${(e.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log(`    valorAlocado: R$ ${e.valorAlocadoAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})} → R$ ${e.valorAlocadoNovo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log(`    valorExecutado: R$ ${e.valorExecutadoAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})} → R$ ${e.valorExecutadoNovo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log('');
    }
    if (emendasParaAtualizar.length > 10) {
      console.log(`  ... e mais ${emendasParaAtualizar.length - 10}`);
      console.log('');
    }
  } else {
    console.log('✅ Todas as emendas estão consistentes!');
    console.log('');
  }

  // APLICAR CORREÇÕES
  if (APPLY_CHANGES) {
    console.log('═'.repeat(70));
    console.log(' APLICANDO CORREÇÕES');
    console.log('═'.repeat(70));
    console.log('');

    let naturezasAtualizadasCount = 0;
    let naturezasRegularizadasCount = 0;
    let emendasAtualizadasCount = 0;
    let erros = 0;

    // 1. Atualizar valorExecutado das naturezas
    console.log('Atualizando valorExecutado das naturezas...');
    for (const n of naturezasParaAtualizar) {
      try {
        await db.collection('naturezas').doc(n.id).update({
          valorExecutado: n.valorExecutadoNovo,
          saldoDisponivel: (n.valorAlocadoAtual || 0) - n.valorExecutadoNovo,
          percentualExecutado: n.valorAlocadoAtual > 0
            ? Math.round((n.valorExecutadoNovo / n.valorAlocadoAtual) * 100)
            : (n.valorExecutadoNovo > 0 ? 100 : 0),
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          atualizadoPor: 'Script recalcular-naturezas',
        });
        naturezasAtualizadasCount++;
      } catch (error) {
        console.log(`  ❌ Erro: ${n.id} - ${error.message}`);
        erros++;
      }
    }
    console.log(`  ✅ ${naturezasAtualizadasCount} naturezas atualizadas (valorExecutado)`);

    // 2. Regularizar naturezas (valorAlocado = valorExecutado)
    console.log('Regularizando naturezas...');
    for (const n of naturezasParaRegularizar) {
      try {
        await db.collection('naturezas').doc(n.id).update({
          valorAlocado: n.valorExecutado,
          saldoDisponivel: 0,
          percentualExecutado: 100,
          autoRegularizado: true,
          autoRegularizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          atualizadoPor: 'Script recalcular-naturezas',
        });
        naturezasRegularizadasCount++;
      } catch (error) {
        console.log(`  ❌ Erro: ${n.id} - ${error.message}`);
        erros++;
      }
    }
    console.log(`  ✅ ${naturezasRegularizadasCount} naturezas regularizadas`);

    // 3. Atualizar emendas
    console.log('Atualizando emendas...');
    for (const e of emendasParaAtualizar) {
      try {
        const valor = e.valor || 0;
        await db.collection('emendas').doc(e.id).update({
          valorAlocado: e.valorAlocadoNovo,
          valorExecutado: e.valorExecutadoNovo,
          saldoParaNaturezas: valor - e.valorAlocadoNovo,
          saldoNaoExecutado: valor - e.valorExecutadoNovo,
          saldoLivre: valor - e.valorAlocadoNovo,
          saldoDisponivel: valor - e.valorExecutadoNovo,
          percentualAlocado: valor > 0 ? Math.round((e.valorAlocadoNovo / valor) * 100 * 100) / 100 : 0,
          percentualExecutado: valor > 0 ? Math.round((e.valorExecutadoNovo / valor) * 100 * 100) / 100 : 0,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          versaoCalculo: Date.now(),
        });
        emendasAtualizadasCount++;
      } catch (error) {
        console.log(`  ❌ Erro: ${e.id} - ${error.message}`);
        erros++;
      }
    }
    console.log(`  ✅ ${emendasAtualizadasCount} emendas atualizadas`);
    console.log('');

    // Resumo final
    console.log('╔' + '═'.repeat(64) + '╗');
    console.log('║                        RESUMO FINAL                            ║');
    console.log('╠' + '═'.repeat(64) + '╣');
    console.log(`║  Naturezas atualizadas (valorExecutado): ${naturezasAtualizadasCount}`);
    console.log(`║  Naturezas regularizadas (valorAlocado):  ${naturezasRegularizadasCount}`);
    console.log(`║  Emendas recalculadas:                    ${emendasAtualizadasCount}`);
    console.log(`║  Erros:                                   ${erros}`);
    console.log('╚' + '═'.repeat(64) + '╝');
    console.log('');

  } else {
    console.log('');
    console.log('╔' + '═'.repeat(64) + '╗');
    console.log('║                    RESUMO (DRY-RUN)                            ║');
    console.log('╠' + '═'.repeat(64) + '╣');
    console.log(`║  Naturezas para atualizar (valorExecutado): ${naturezasParaAtualizar.length}`);
    console.log(`║  Naturezas para regularizar:                ${naturezasParaRegularizar.length}`);
    console.log(`║  Emendas para recalcular:                   ${emendasParaAtualizar.length}`);
    console.log('╠' + '═'.repeat(64) + '╣');
    console.log('║  ⏸️  DRY-RUN (nenhuma alteração feita)');
    console.log('╚' + '═'.repeat(64) + '╝');
    console.log('');
    console.log('💡 Para aplicar as correções, execute:');
    console.log(`   node scripts/recalcular-naturezas.cjs${USE_DEV ? ' --dev' : ''} --apply`);
    console.log('');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
