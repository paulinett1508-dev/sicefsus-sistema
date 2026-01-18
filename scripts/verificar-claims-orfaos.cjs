/**
 * 🔍 VERIFICAR CLAIMS DAS CONTAS ÓRFÃS
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-migration/prod-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// UIDs das contas órfãs (sem documento no Firestore)
const orfaos = [
  { uid: '0d4YAM0IA9NfMIPdYhIYGEtL9pX2', email: 'sdaemendasrayany@gmail.com' },
  { uid: '1trVeEhENUUdTlOuVPGalPOeFKs1', email: 'emendas.axixa@gmail.com' },
  { uid: '2Kl7xgcu6eVR3fYA2YVoIqH9U9D2', email: 'araujoinformatica.monitoramento@gmail.com' },
  { uid: 'CMbEOBiBNnRdPF1DrAO7D30aAd03', email: 'emendasucupiradonorte@gmail.com' },
  { uid: 'Nl082gN4HaXQ0k44rtCg4fHdfIE3', email: 'emendas.morros@gmail.com' },
  { uid: 'wtjPGNjP5ualVtV67Rih0CB6ueo1', email: 'paulinett@live.com' },
  { uid: 'zRdQX7js0UbMhHaw7nNYdLnWKZJ2', email: 'paulinett1508@gmail.com' },
];

async function verificarClaims() {
  console.log('🔍 Verificando claims das contas órfãs...\n');
  console.log('='.repeat(80));

  for (let i = 0; i < orfaos.length; i++) {
    const { uid, email } = orfaos[i];

    try {
      const userRecord = await auth.getUser(uid);
      const claims = userRecord.customClaims || {};

      console.log(`\n${i + 1}. ${email}`);
      console.log(`   UID: ${uid}`);
      console.log(`   Nome: ${userRecord.displayName || '(não definido)'}`);
      console.log(`   Desabilitado: ${userRecord.disabled ? 'Sim' : 'Não'}`);
      console.log(`   Último login: ${userRecord.metadata.lastSignInTime || 'Nunca'}`);
      console.log(`   Criado em: ${userRecord.metadata.creationTime}`);
      console.log('   --- CLAIMS ---');

      if (Object.keys(claims).length === 0) {
        console.log('   (nenhum claim definido)');
      } else {
        console.log(`   Tipo: ${claims.tipo || '(não definido)'}`);
        console.log(`   Município: ${claims.municipio || '(não definido)'}`);
        console.log(`   UF: ${claims.uf || '(não definido)'}`);
        console.log(`   Status: ${claims.status || '(não definido)'}`);
      }

    } catch (error) {
      console.log(`\n${i + 1}. ${email}`);
      console.log(`   ❌ Erro: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  process.exit(0);
}

verificarClaims();
