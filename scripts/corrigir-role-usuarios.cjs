// ============================================
// scripts/corrigir-role-usuarios.cjs
// Corrige inconsistência entre campos tipo e role
// ============================================

const admin = require('firebase-admin');
const path = require('path');

// Detectar ambiente
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const applyChanges = args.includes('--apply');

// Selecionar credenciais baseado no ambiente
const credPath = isDev
  ? path.join(__dirname, '../firebase-migration/dev-credentials.json')
  : path.join(__dirname, '../firebase-migration/prod-credentials.json');

console.log(`\n🔧 Correção de Inconsistência tipo/role`);
console.log(`📍 Ambiente: ${isDev ? 'DEV' : 'PROD'}`);
console.log(`📝 Modo: ${applyChanges ? 'APLICAR CORREÇÕES' : 'APENAS DIAGNÓSTICO (dry-run)'}\n`);

let serviceAccount;
try {
  serviceAccount = require(credPath);
} catch (error) {
  console.error(`❌ Erro ao carregar credenciais de ${credPath}`);
  console.error('   Verifique se o arquivo existe.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Lista usuários com inconsistência tipo/role
 */
async function listarInconsistencias() {
  console.log('🔍 Buscando usuários com inconsistência tipo/role...\n');

  const usersSnapshot = await db.collection('usuarios').get();
  const inconsistentes = [];

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const tipo = data.tipo;
    const role = data.role;

    // Verificar se role existe e é diferente de tipo
    if (role && role !== tipo) {
      inconsistentes.push({
        id: doc.id,
        email: data.email,
        nome: data.nome,
        tipo: tipo,
        role: role,
        municipio: data.municipio,
        uf: data.uf
      });
    }
  }

  if (inconsistentes.length === 0) {
    console.log('✅ Nenhuma inconsistência encontrada!\n');
    return [];
  }

  console.log(`⚠️  Encontrados ${inconsistentes.length} usuários com inconsistência:\n`);
  console.log('┌─────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ Email                              │ tipo       │ role       │ Município           │');
  console.log('├─────────────────────────────────────────────────────────────────────────────────────┤');

  for (const user of inconsistentes) {
    const email = (user.email || 'N/A').padEnd(35).substring(0, 35);
    const tipo = (user.tipo || 'N/A').padEnd(10).substring(0, 10);
    const role = (user.role || 'N/A').padEnd(10).substring(0, 10);
    const municipio = (user.municipio || 'N/A').padEnd(20).substring(0, 20);
    console.log(`│ ${email} │ ${tipo} │ ${role} │ ${municipio} │`);
  }

  console.log('└─────────────────────────────────────────────────────────────────────────────────────┘\n');

  return inconsistentes;
}

/**
 * Corrige a inconsistência atualizando role = tipo
 */
async function corrigirInconsistencias(usuarios) {
  if (usuarios.length === 0) {
    return { corrigidos: 0, erros: 0 };
  }

  console.log('🔧 Corrigindo inconsistências...\n');

  let corrigidos = 0;
  let erros = 0;

  for (const user of usuarios) {
    try {
      if (applyChanges) {
        await db.collection('usuarios').doc(user.id).update({
          role: user.tipo,
          dataAtualizacao: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  ✅ ${user.email}: role "${user.role}" → "${user.tipo}"`);
      } else {
        console.log(`  🔄 ${user.email}: role "${user.role}" → "${user.tipo}" (dry-run)`);
      }
      corrigidos++;
    } catch (error) {
      console.log(`  ❌ ${user.email}: Erro - ${error.message}`);
      erros++;
    }
  }

  return { corrigidos, erros };
}

/**
 * Execução principal
 */
async function main() {
  try {
    const inconsistentes = await listarInconsistencias();

    if (inconsistentes.length > 0) {
      const { corrigidos, erros } = await corrigirInconsistencias(inconsistentes);

      console.log('\n📊 Resumo:');
      console.log(`   Usuários inconsistentes: ${inconsistentes.length}`);
      console.log(`   Corrigidos: ${corrigidos}`);
      console.log(`   Erros: ${erros}`);

      if (!applyChanges && inconsistentes.length > 0) {
        console.log('\n⚠️  Nenhuma alteração foi feita (dry-run).');
        console.log('   Para aplicar as correções, execute com --apply:');
        console.log(`   node scripts/corrigir-role-usuarios.cjs ${isDev ? '--dev ' : ''}--apply\n`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Mostrar ajuda
if (args.includes('--help') || args.includes('-h')) {
  console.log('Uso:');
  console.log('  node scripts/corrigir-role-usuarios.cjs           # Dry-run no PROD');
  console.log('  node scripts/corrigir-role-usuarios.cjs --apply   # Aplicar no PROD');
  console.log('  node scripts/corrigir-role-usuarios.cjs --dev     # Dry-run no DEV');
  console.log('  node scripts/corrigir-role-usuarios.cjs --dev --apply  # Aplicar no DEV');
  process.exit(0);
}

main();
