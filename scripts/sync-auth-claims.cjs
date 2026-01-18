// ============================================
// scripts/sync-auth-claims.cjs
// Sincroniza custom claims do Firebase Auth
// ============================================

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const credPath = path.join(__dirname, '../firebase-migration/prod-credentials.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

/**
 * Sincroniza claims de um usuario especifico
 * @param {string} uid - UID do usuario no Firebase Auth
 * @returns {Promise<boolean>} - true se sucesso
 */
async function syncUserClaims(uid) {
  try {
    const userDoc = await db.collection('usuarios').doc(uid).get();

    if (!userDoc.exists) {
      console.log(`Usuario ${uid} nao encontrado no Firestore`);
      return false;
    }

    const userData = userDoc.data();
    const claims = {
      tipo: userData.tipo || 'operador',
      superAdmin: userData.superAdmin === true,
      municipio: userData.municipio || null,
      uf: userData.uf || null
    };

    await auth.setCustomUserClaims(uid, claims);
    console.log(`Claims atualizados para ${userData.email}: ${JSON.stringify(claims)}`);
    return true;
  } catch (error) {
    console.error(`Erro ao sincronizar claims de ${uid}:`, error.message);
    return false;
  }
}

/**
 * Sincroniza claims de todos os usuarios
 * @returns {Promise<{sucesso: number, falha: number}>}
 */
async function syncAllUsers() {
  console.log('Iniciando sincronizacao de todos os usuarios...\n');

  const usersSnapshot = await db.collection('usuarios').get();
  let sucesso = 0;
  let falha = 0;

  for (const doc of usersSnapshot.docs) {
    const result = await syncUserClaims(doc.id);
    if (result) sucesso++;
    else falha++;
  }

  console.log(`\nSincronizacao concluida: ${sucesso} sucesso, ${falha} falha`);
  return { sucesso, falha };
}

/**
 * Lista todos os usuarios e seus claims atuais
 */
async function listAllClaims() {
  console.log('Listando claims de todos os usuarios...\n');

  const usersSnapshot = await db.collection('usuarios').get();

  for (const doc of usersSnapshot.docs) {
    try {
      const userData = doc.data();
      const authUser = await auth.getUser(doc.id);
      const claims = authUser.customClaims || {};

      console.log(`${userData.email}:`);
      console.log(`  Firestore tipo: ${userData.tipo}`);
      console.log(`  Auth claims: ${JSON.stringify(claims)}`);
      console.log('');
    } catch (error) {
      console.log(`${doc.id}: Erro - ${error.message}\n`);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === '--uid' && args[1]) {
    syncUserClaims(args[1]).then(() => process.exit(0));
  } else if (args[0] === '--all') {
    syncAllUsers().then(() => process.exit(0));
  } else if (args[0] === '--list') {
    listAllClaims().then(() => process.exit(0));
  } else {
    console.log('Uso:');
    console.log('  node sync-auth-claims.cjs --uid <USER_ID>  # Sincronizar usuario especifico');
    console.log('  node sync-auth-claims.cjs --all            # Sincronizar todos');
    console.log('  node sync-auth-claims.cjs --list           # Listar claims atuais');
    process.exit(1);
  }
}

module.exports = { syncUserClaims, syncAllUsers, listAllClaims };
