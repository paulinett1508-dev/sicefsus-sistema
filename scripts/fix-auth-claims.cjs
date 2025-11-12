
/**
 * 🔧 FIX AUTH CLAIMS - SICEFSUS
 * Script para adicionar custom claims aos tokens de autenticação
 * 
 * Uso: node scripts/fix-auth-claims.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-migration/prod-credentials.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function fixAuthClaims() {
  console.log('🔧 Iniciando correção de custom claims...\n');

  try {
    // Buscar todos os usuários do Firestore
    const usersSnapshot = await db.collection('usuarios').get();
    
    let updated = 0;
    let errors = 0;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;

      try {
        // Definir custom claims
        await auth.setCustomUserClaims(uid, {
          tipo: userData.tipo || 'operador',
          municipio: userData.municipio || null,
          uf: userData.uf || null,
          status: userData.status || 'ativo'
        });

        console.log(`✅ Claims atualizados para: ${userData.nome || userData.email}`);
        console.log(`   - Tipo: ${userData.tipo}`);
        console.log(`   - Município: ${userData.municipio}`);
        console.log(`   - UF: ${userData.uf}\n`);

        updated++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${userData.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 RESUMO:');
    console.log(`✅ Claims atualizados: ${updated}`);
    console.log(`❌ Erros: ${errors}`);
    console.log('\n⚠️ IMPORTANTE: Peça aos usuários para fazer LOGOUT e LOGIN novamente!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }

  process.exit(0);
}

fixAuthClaims();
