#!/usr/bin/env node
// scripts/migrarParaNaturezas.cjs
// Script para migrar dados existentes para o novo sistema de naturezas (envelopes orcamentarios)
//
// OBJETIVO:
// - Converter acoesServicos[] das emendas para documentos na colecao 'naturezas'
// - Vincular despesas existentes as naturezas correspondentes
//
// USO:
//   node scripts/migrarParaNaturezas.cjs --dry-run     # Simula sem salvar
//   node scripts/migrarParaNaturezas.cjs --execute    # Executa a migracao
//   node scripts/migrarParaNaturezas.cjs --execute --dev   # Executa em DEV

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// ==== CONFIGURACAO ====
const DRY_RUN = process.argv.includes("--dry-run");
const EXECUTE = process.argv.includes("--execute");
const USE_DEV = process.argv.includes("--dev");

if (!DRY_RUN && !EXECUTE) {
  console.log(`
================================================================================
  SCRIPT DE MIGRACAO PARA NATUREZAS (ENVELOPES ORCAMENTARIOS)
================================================================================

  Este script migra os dados existentes para o novo modelo de naturezas:

  1. Converte acoesServicos[] das emendas para documentos 'naturezas'
  2. Vincula despesas existentes as naturezas correspondentes
  3. Atualiza campos de calculo nas emendas

  USO:
    node scripts/migrarParaNaturezas.cjs --dry-run        # Simula (nao salva nada)
    node scripts/migrarParaNaturezas.cjs --execute        # Executa em PROD
    node scripts/migrarParaNaturezas.cjs --execute --dev  # Executa em DEV

  ATENCAO: Sempre execute --dry-run primeiro para verificar!
================================================================================
`);
  process.exit(0);
}

console.log(`
================================================================================
  MIGRACAO PARA NATUREZAS
================================================================================
  Modo: ${DRY_RUN ? "DRY-RUN (simulacao)" : "EXECUTE (alterando dados)"}
  Ambiente: ${USE_DEV ? "DEV" : "PROD"}
================================================================================
`);

// ==== CARREGAR VARIAVEIS DE AMBIENTE ====
const envPath = path.join(__dirname, "../firebase-mcp-server/.env");
let envVars = {};

try {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      // Remover aspas se existirem
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[match[1].trim()] = value;
    }
  });
} catch (error) {
  console.error(`Erro ao carregar .env de: ${envPath}`);
  console.error(error.message);
  process.exit(1);
}

// ==== INICIALIZAR FIREBASE ADMIN ====
const prefix = USE_DEV ? "FIREBASE_DEV" : "FIREBASE_PROD";
const projectId = envVars[`${prefix}_PROJECT_ID`];
const clientEmail = envVars[`${prefix}_CLIENT_EMAIL`];
const privateKey = envVars[`${prefix}_PRIVATE_KEY`]?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(`Erro: Credenciais ${prefix} nao encontradas no .env`);
  console.error(`  PROJECT_ID: ${projectId ? "OK" : "FALTANDO"}`);
  console.error(`  CLIENT_EMAIL: ${clientEmail ? "OK" : "FALTANDO"}`);
  console.error(`  PRIVATE_KEY: ${privateKey ? "OK" : "FALTANDO"}`);
  process.exit(1);
}

console.log(`  Project ID: ${projectId}`);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = admin.firestore();

// ==== FUNCOES AUXILIARES ====

/**
 * Parse de valor monetario (BRL -> number)
 */
function parseValorMonetario(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  const str = String(valor)
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const num = Number(str);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Extrai codigo da natureza (ex: "339032 - Material" -> "339032")
 */
function extrairCodigoNatureza(descricao) {
  if (!descricao) return "000000";
  const match = descricao.match(/^(\d{6})/);
  return match ? match[1] : descricao.substring(0, 6).replace(/\D/g, "") || "000000";
}

// ==== MIGRACAO PRINCIPAL ====
async function migrar() {
  const estatisticas = {
    emendasProcessadas: 0,
    naturezasCriadas: 0,
    despesasVinculadas: 0,
    despesasOrfas: 0,
    erros: [],
  };

  try {
    // 1. Buscar todas as emendas
    console.log("\n[1/4] Buscando emendas...");
    const emendasSnapshot = await db.collection("emendas").get();
    console.log(`     Encontradas ${emendasSnapshot.size} emendas`);

    // 2. Buscar todas as despesas
    console.log("\n[2/4] Buscando despesas...");
    const despesasSnapshot = await db.collection("despesas").get();
    console.log(`     Encontradas ${despesasSnapshot.size} despesas`);

    // 3. Indexar despesas por emendaId
    const despesasPorEmenda = {};
    despesasSnapshot.forEach((doc) => {
      const data = doc.data();
      const emendaId = data.emendaId;
      if (emendaId) {
        if (!despesasPorEmenda[emendaId]) {
          despesasPorEmenda[emendaId] = [];
        }
        despesasPorEmenda[emendaId].push({ id: doc.id, ...data });
      }
    });

    // 4. Processar cada emenda
    console.log("\n[3/4] Processando emendas e criando naturezas...");

    for (const emendaDoc of emendasSnapshot.docs) {
      const emendaId = emendaDoc.id;
      const emenda = emendaDoc.data();

      console.log(`\n  Emenda ${emendaId} (${emenda.numero || "sem numero"}):`);
      estatisticas.emendasProcessadas++;

      // Verificar se ja tem naturezas (evitar re-migracao)
      const naturezasExistentes = await db
        .collection("naturezas")
        .where("emendaId", "==", emendaId)
        .get();

      if (!naturezasExistentes.empty) {
        console.log(`    -> Ja tem ${naturezasExistentes.size} naturezas, pulando...`);
        continue;
      }

      // Obter acoesServicos
      const acoesServicos = emenda.acoesServicos || [];
      const despesasEmenda = despesasPorEmenda[emendaId] || [];

      // Criar mapa de naturezas unicas (por codigo)
      const naturezasMap = new Map();

      // Processar acoesServicos existentes
      for (const acao of acoesServicos) {
        if (!acao?.estrategia) continue;

        const codigo = extrairCodigoNatureza(acao.estrategia);
        const valorAlocado = parseValorMonetario(acao.valorAlocado || acao.valor || 0);

        if (!naturezasMap.has(codigo)) {
          naturezasMap.set(codigo, {
            codigo,
            descricao: acao.estrategia,
            valorAlocado,
            despesas: [],
          });
        } else {
          // Acumular valor se codigo repetido
          naturezasMap.get(codigo).valorAlocado += valorAlocado;
        }
      }

      // Processar despesas para identificar naturezas adicionais
      for (const despesa of despesasEmenda) {
        const naturezaDespesa = despesa.naturezaDespesa || despesa.estrategia || "";
        const codigo = extrairCodigoNatureza(naturezaDespesa);

        if (!naturezasMap.has(codigo) && codigo !== "000000") {
          // Criar natureza baseada na despesa (se nao existir)
          naturezasMap.set(codigo, {
            codigo,
            descricao: naturezaDespesa,
            valorAlocado: 0, // Sera calculado depois
            despesas: [],
          });
        }

        // Vincular despesa a natureza
        if (naturezasMap.has(codigo)) {
          naturezasMap.get(codigo).despesas.push(despesa);
        }
      }

      // Criar documentos de naturezas
      for (const [codigo, naturezaData] of naturezasMap) {
        // Calcular valor executado das despesas EXECUTADAS
        const valorExecutado = naturezaData.despesas
          .filter((d) => d.status !== "PLANEJADA")
          .reduce((sum, d) => sum + parseValorMonetario(d.valor), 0);

        // Se valorAlocado for 0, usar valorExecutado como base
        if (naturezaData.valorAlocado === 0 && valorExecutado > 0) {
          naturezaData.valorAlocado = valorExecutado;
        }

        const naturezaDoc = {
          emendaId,
          codigo: naturezaData.codigo,
          descricao: naturezaData.descricao,
          valorAlocado: naturezaData.valorAlocado,
          valorExecutado: Math.round(valorExecutado * 100) / 100,
          saldoDisponivel: Math.round((naturezaData.valorAlocado - valorExecutado) * 100) / 100,
          percentualExecutado:
            naturezaData.valorAlocado > 0
              ? Math.round((valorExecutado / naturezaData.valorAlocado) * 10000) / 100
              : 0,
          status: "ativo",
          municipio: emenda.municipio || "",
          uf: emenda.uf || "",
          criadaEm: admin.firestore.FieldValue.serverTimestamp(),
          criadaPor: "migracao-automatica",
          migradaDe: "acoesServicos",
        };

        console.log(`    + Natureza ${codigo}: R$ ${naturezaData.valorAlocado} alocado, ${naturezaData.despesas.length} despesas`);

        if (!DRY_RUN) {
          // Criar natureza
          const naturezaRef = await db.collection("naturezas").add(naturezaDoc);
          estatisticas.naturezasCriadas++;

          // Vincular despesas a esta natureza
          for (const despesa of naturezaData.despesas) {
            await db.collection("despesas").doc(despesa.id).update({
              naturezaId: naturezaRef.id,
            });
            estatisticas.despesasVinculadas++;
          }
        } else {
          estatisticas.naturezasCriadas++;
          estatisticas.despesasVinculadas += naturezaData.despesas.length;
        }
      }

      // Contar despesas orfas (sem natureza correspondente)
      const despesasOrfas = despesasEmenda.filter((d) => {
        const codigo = extrairCodigoNatureza(d.naturezaDespesa || d.estrategia);
        return !naturezasMap.has(codigo) || codigo === "000000";
      });
      estatisticas.despesasOrfas += despesasOrfas.length;

      if (despesasOrfas.length > 0) {
        console.log(`    ! ${despesasOrfas.length} despesas sem natureza correspondente`);
      }

      // Atualizar campos da emenda
      if (!DRY_RUN && naturezasMap.size > 0) {
        const valorTotalAlocado = Array.from(naturezasMap.values()).reduce(
          (sum, n) => sum + n.valorAlocado,
          0
        );
        const valorEmenda = parseValorMonetario(
          emenda.valor || emenda.valorRecurso || emenda.valorTotal
        );

        await db.collection("emendas").doc(emendaId).update({
          valorAlocado: Math.round(valorTotalAlocado * 100) / 100,
          saldoLivre: Math.round((valorEmenda - valorTotalAlocado) * 100) / 100,
          percentualAlocado:
            valorEmenda > 0
              ? Math.round((valorTotalAlocado / valorEmenda) * 10000) / 100
              : 0,
          migradoParaNaturezas: true,
          migradoEm: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // ==== RELATORIO FINAL ====
    console.log(`
================================================================================
  RELATORIO ${DRY_RUN ? "(SIMULACAO)" : "FINAL"}
================================================================================
  Emendas processadas:     ${estatisticas.emendasProcessadas}
  Naturezas criadas:       ${estatisticas.naturezasCriadas}
  Despesas vinculadas:     ${estatisticas.despesasVinculadas}
  Despesas orfas:          ${estatisticas.despesasOrfas}
  Erros:                   ${estatisticas.erros.length}
================================================================================
`);

    if (estatisticas.erros.length > 0) {
      console.log("ERROS:");
      estatisticas.erros.forEach((e) => console.log(`  - ${e}`));
    }

    if (DRY_RUN) {
      console.log("\n  [DRY-RUN] Nenhuma alteracao foi feita.");
      console.log("  Execute com --execute para aplicar as mudancas.\n");
    } else {
      console.log("\n  [EXECUTE] Migracao concluida com sucesso!\n");
    }
  } catch (error) {
    console.error("\nERRO CRITICO durante migracao:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Executar
migrar();
