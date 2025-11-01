// scripts/migrarAcoesServicosParaDespesas.js
// 🔄 MIGRAÇÃO: acoesServicos (dentro das emendas) → despesas com status PLANEJADA
// ✅ Versão ES Module compatível com o projeto

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  deleteField,
} from "firebase/firestore";

// ✅ CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDWHNf_mYvIj6-0vc6AeTEWpZxqjrzVqjs",
  authDomain: "sistema-emendas-1f12b.firebaseapp.com",
  projectId: "sistema-emendas-1f12b",
  storageBucket: "sistema-emendas-1f12b.firebasestorage.app",
  messagingSenderId: "439663331336",
  appId: "1:439663331336:web:c4b8d62df7a2b8d0949ea4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const stats = {
  totalEmendas: 0,
  emendasComAcoes: 0,
  despesasCriadas: 0,
  emendasAtualizadas: 0,
  erros: 0,
  detalhes: [],
};

function parseValorMonetario(valor) {
  if (!valor) return 0;
  const valorString = valor.toString();
  return parseFloat(valorString.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
}

async function migrarAcoesServicos() {
  console.log("🚀 INICIANDO MIGRAÇÃO: acoesServicos → despesas PLANEJADAS");
  console.log("═".repeat(60));

  try {
    // 1️⃣ BUSCAR TODAS AS EMENDAS
    console.log("\n📊 Buscando emendas no banco...");
    const emendasRef = collection(db, "emendas");
    const snapshot = await getDocs(emendasRef);

    stats.totalEmendas = snapshot.size;
    console.log(`✅ Encontradas ${stats.totalEmendas} emendas`);

    if (stats.totalEmendas === 0) {
      console.log("ℹ️  Nenhuma emenda para processar");
      return;
    }

    console.log("\n🔄 Processando emendas...\n");

    // 2️⃣ PROCESSAR CADA EMENDA
    for (const emendaDoc of snapshot.docs) {
      const emenda = emendaDoc.data();
      const emendaId = emendaDoc.id;

      // Verificar se tem acoesServicos
      if (!emenda.acoesServicos || emenda.acoesServicos.length === 0) {
        continue;
      }

      stats.emendasComAcoes++;
      console.log(`\n📋 Emenda: ${emenda.numero || emendaId}`);
      console.log(
        `   ${emenda.acoesServicos.length} ações/serviços encontrados`,
      );

      // 3️⃣ CRIAR DESPESAS PLANEJADAS
      for (const acao of emenda.acoesServicos) {
        try {
          const novaDespesa = {
            // Dados básicos
            emendaId: emendaId,
            estrategia: acao.estrategia || "",
            naturezaDespesa: acao.estrategia || "",
            valor: parseValorMonetario(acao.valorAcao),

            // Status
            status: "PLANEJADA",

            // Campos vazios (serão preenchidos na execução)
            discriminacao: "",
            numeroEmpenho: "",
            numeroNota: "",
            numeroContrato: "",
            dataEmpenho: "",
            dataLiquidacao: "",
            dataPagamento: "",
            acao: "",
            classificacaoFuncional: "",
            elementoDespesa: "",
            fonteRecurso: "",
            programaTrabalho: "",
            planoInterno: "",
            categoria: "",
            cnpjFornecedor: "",
            fornecedor: "",
            nomeFantasia: "",
            enderecoFornecedor: "",
            cidadeUf: "",
            cep: "",
            telefoneFornecedor: "",
            emailFornecedor: "",
            situacaoCadastral: "",
            contrapartida: 0,
            percentualExecucao: 0,
            etapaExecucao: "",
            coordenadasGeograficas: "",
            populacaoBeneficiada: "",
            impactoSocial: "",
            descricao: "",
            observacoes: "",

            // Auditoria
            criadaEm: new Date().toISOString(),
            criadaPor: "migracao-acoes-servicos-v1",
            dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
          };

          await addDoc(collection(db, "despesas"), novaDespesa);
          stats.despesasCriadas++;

          console.log(
            `   ✅ Despesa criada: ${acao.estrategia} - R$ ${parseValorMonetario(acao.valorAcao).toFixed(2)}`,
          );

          stats.detalhes.push({
            emendaId: emendaId,
            emendaNumero: emenda.numero || emendaId,
            estrategia: acao.estrategia,
            valor: parseValorMonetario(acao.valorAcao),
            status: "CRIADA",
          });
        } catch (error) {
          console.error(`   ❌ Erro ao criar despesa:`, error.message);
          stats.erros++;
          stats.detalhes.push({
            emendaId: emendaId,
            estrategia: acao.estrategia,
            status: "ERRO",
            erro: error.message,
          });
        }
      }

      // 4️⃣ REMOVER acoesServicos DA EMENDA
      try {
        await updateDoc(doc(db, "emendas", emendaId), {
          acoesServicos: deleteField(),
        });
        stats.emendasAtualizadas++;
        console.log(`   🗑️  Campo acoesServicos removido da emenda`);
      } catch (error) {
        console.error(`   ⚠️  Erro ao remover acoesServicos:`, error.message);
        stats.erros++;
      }
    }

    // 5️⃣ RELATÓRIO FINAL
    exibirRelatorio();
  } catch (error) {
    console.error("\n❌ ERRO NA MIGRAÇÃO:", error);
    stats.erros++;
    throw error;
  }
}

function exibirRelatorio() {
  console.log("\n" + "═".repeat(60));
  console.log("📊 RELATÓRIO FINAL DA MIGRAÇÃO");
  console.log("═".repeat(60));
  console.log(`\n📈 ESTATÍSTICAS:`);
  console.log(`   Total de emendas: ${stats.totalEmendas}`);
  console.log(`   Emendas com ações/serviços: ${stats.emendasComAcoes}`);
  console.log(`   ✅ Despesas PLANEJADAS criadas: ${stats.despesasCriadas}`);
  console.log(
    `   🗑️  Emendas atualizadas (campo removido): ${stats.emendasAtualizadas}`,
  );
  console.log(`   ❌ Erros: ${stats.erros}`);

  if (stats.despesasCriadas > 0) {
    console.log(`\n📋 DETALHAMENTO:`);
    const porEmenda = stats.detalhes.reduce((acc, item) => {
      if (item.status === "CRIADA") {
        if (!acc[item.emendaNumero]) {
          acc[item.emendaNumero] = { count: 0, total: 0 };
        }
        acc[item.emendaNumero].count++;
        acc[item.emendaNumero].total += item.valor;
      }
      return acc;
    }, {});

    Object.entries(porEmenda).forEach(([emenda, data]) => {
      console.log(
        `   Emenda ${emenda}: ${data.count} despesas - R$ ${data.total.toFixed(2)}`,
      );
    });
  }

  console.log("\n✅ MIGRAÇÃO CONCLUÍDA!");
  console.log("═".repeat(60));
  console.log("\n📍 VERIFIQUE NO FIREBASE:");
  console.log(
    '   1. Coleção despesas: Deve ter novas despesas com status "PLANEJADA"',
  );
  console.log(
    '   2. Documentos de emendas: Não devem mais ter campo "acoesServicos"',
  );
  console.log("\n🔗 Link direto:");
  console.log(
    "   https://console.firebase.google.com/project/sistema-emendas-1f12b/firestore\n",
  );
}

console.log("\n🎯 SCRIPT DE MIGRAÇÃO: acoesServicos → despesas PLANEJADAS");
console.log(
  "📝 Este script converterá o planejamento das emendas em despesas\n",
);

migrarAcoesServicos()
  .then(() => {
    console.log("\n✅ Script concluído!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Script falhou:", err);
    process.exit(1);
  });
