/**
 * 🔍 VERIFICAR USUÁRIOS AUTH vs FIRESTORE - SICEFSUS
 *
 * Compara usuários no Firebase Auth com documentos no Firestore
 * para identificar inconsistências.
 *
 * Uso: node scripts/verificar-usuarios-auth.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-migration/prod-credentials.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function verificarUsuarios() {
  console.log('🔍 Verificando consistência entre Firebase Auth e Firestore...\n');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. Buscar todos os usuários do Firestore
    console.log('📂 Buscando usuários no Firestore...');
    const usersSnapshot = await db.collection('usuarios').get();
    const firestoreUsers = new Map();

    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      firestoreUsers.set(doc.id, {
        uid: doc.id,
        email: data.email,
        nome: data.nome,
        tipo: data.tipo,
        status: data.status,
        municipio: data.municipio,
        uf: data.uf
      });
    });

    console.log(`   ✅ ${firestoreUsers.size} documentos encontrados no Firestore\n`);

    // 2. Buscar todos os usuários do Firebase Auth
    console.log('🔐 Buscando usuários no Firebase Auth...');
    const authUsers = new Map();
    let nextPageToken;

    do {
      const listResult = await auth.listUsers(1000, nextPageToken);
      listResult.users.forEach(user => {
        authUsers.set(user.uid, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          disabled: user.disabled,
          lastSignIn: user.metadata.lastSignInTime
        });
      });
      nextPageToken = listResult.pageToken;
    } while (nextPageToken);

    console.log(`   ✅ ${authUsers.size} contas encontradas no Firebase Auth\n`);

    // 3. Encontrar inconsistências
    console.log('='.repeat(70));
    console.log('📊 ANÁLISE DE INCONSISTÊNCIAS');
    console.log('='.repeat(70) + '\n');

    // 3a. Usuários no Firestore que NÃO existem no Auth
    console.log('❌ USUÁRIOS NO FIRESTORE SEM CONTA NO AUTH:');
    console.log('-'.repeat(70));
    let firestoreSemAuth = 0;

    for (const [uid, userData] of firestoreUsers) {
      if (!authUsers.has(uid)) {
        firestoreSemAuth++;
        console.log(`   ${firestoreSemAuth}. ${userData.nome || 'Sem nome'}`);
        console.log(`      Email: ${userData.email}`);
        console.log(`      Tipo: ${userData.tipo} | Status: ${userData.status}`);
        console.log(`      UID: ${uid}`);
        console.log(`      Município: ${userData.municipio || '-'}/${userData.uf || '-'}`);
        console.log('');
      }
    }

    if (firestoreSemAuth === 0) {
      console.log('   ✅ Nenhuma inconsistência encontrada\n');
    } else {
      console.log(`   ⚠️  Total: ${firestoreSemAuth} documento(s) órfão(s)\n`);
    }

    // 3b. Usuários no Auth que NÃO existem no Firestore
    console.log('❌ CONTAS NO AUTH SEM DOCUMENTO NO FIRESTORE:');
    console.log('-'.repeat(70));
    let authSemFirestore = 0;

    for (const [uid, authData] of authUsers) {
      if (!firestoreUsers.has(uid)) {
        authSemFirestore++;
        console.log(`   ${authSemFirestore}. ${authData.displayName || 'Sem nome'}`);
        console.log(`      Email: ${authData.email}`);
        console.log(`      Desabilitado: ${authData.disabled ? 'Sim' : 'Não'}`);
        console.log(`      Último login: ${authData.lastSignIn || 'Nunca'}`);
        console.log(`      UID: ${uid}`);
        console.log('');
      }
    }

    if (authSemFirestore === 0) {
      console.log('   ✅ Nenhuma inconsistência encontrada\n');
    } else {
      console.log(`   ⚠️  Total: ${authSemFirestore} conta(s) órfã(s)\n`);
    }

    // 4. Resumo
    console.log('='.repeat(70));
    console.log('📋 RESUMO FINAL');
    console.log('='.repeat(70));
    console.log(`   📂 Documentos no Firestore: ${firestoreUsers.size}`);
    console.log(`   🔐 Contas no Firebase Auth: ${authUsers.size}`);
    console.log('');
    console.log(`   ❌ Firestore sem Auth: ${firestoreSemAuth}`);
    console.log(`   ❌ Auth sem Firestore: ${authSemFirestore}`);
    console.log('');

    if (firestoreSemAuth > 0 || authSemFirestore > 0) {
      console.log('   ⚠️  AÇÃO NECESSÁRIA:');
      if (firestoreSemAuth > 0) {
        console.log('      - Documentos órfãos no Firestore devem ser removidos');
        console.log('        (usuários que aparecem no frontend mas não conseguem logar)');
      }
      if (authSemFirestore > 0) {
        console.log('      - Contas órfãs no Auth devem ter documento criado ou ser removidas');
      }
    } else {
      console.log('   ✅ Sistema consistente - nenhuma ação necessária');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }

  process.exit(0);
}

verificarUsuarios();
