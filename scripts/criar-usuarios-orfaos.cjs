/**
 * 🔧 CRIAR DOCUMENTOS PARA CONTAS ÓRFÃS
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-migration/prod-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const usuarios = [
  {
    uid: '0d4YAM0IA9NfMIPdYhIYGEtL9pX2',
    email: 'sdaemendasrayany@gmail.com',
    nome: 'Rayany - SDA',
    tipo: 'operador',
    municipio: 'São Domingos do Azeitão',
    uf: 'MA'
  },
  {
    uid: '1trVeEhENUUdTlOuVPGalPOeFKs1',
    email: 'emendas.axixa@gmail.com',
    nome: 'Emendas Axixá',
    tipo: 'gestor',
    municipio: 'Axixá',
    uf: 'MA'
  },
  {
    uid: '2Kl7xgcu6eVR3fYA2YVoIqH9U9D2',
    email: 'araujoinformatica.monitoramento@gmail.com',
    nome: 'Araujo Informática - Monitoramento',
    tipo: 'admin',
    municipio: '',
    uf: ''
  },
  {
    uid: 'CMbEOBiBNnRdPF1DrAO7D30aAd03',
    email: 'emendasucupiradonorte@gmail.com',
    nome: 'Emendas Sucupira do Norte',
    tipo: 'gestor',
    municipio: 'Sucupira do Norte',
    uf: 'MA'
  },
  {
    uid: 'Nl082gN4HaXQ0k44rtCg4fHdfIE3',
    email: 'emendas.morros@gmail.com',
    nome: 'Emendas Morros',
    tipo: 'gestor',
    municipio: 'Morros',
    uf: 'MA'
  },
  {
    uid: 'wtjPGNjP5ualVtV67Rih0CB6ueo1',
    email: 'paulinett@live.com',
    nome: 'Paulinett (Live)',
    tipo: 'admin',
    municipio: '',
    uf: ''
  },
  {
    uid: 'zRdQX7js0UbMhHaw7nNYdLnWKZJ2',
    email: 'paulinett1508@gmail.com',
    nome: 'Paulinett (Gmail)',
    tipo: 'admin',
    municipio: '',
    uf: ''
  }
];

async function criarDocumentos() {
  console.log('🔧 Criando documentos no Firestore e atualizando claims...\n');
  console.log('='.repeat(70));

  let criados = 0;
  let erros = 0;

  for (const user of usuarios) {
    try {
      // 1. Criar documento no Firestore
      const docData = {
        uid: user.uid,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        role: user.tipo === 'admin' ? 'admin' : user.tipo,
        status: 'ativo',
        ativo: true,
        municipio: user.municipio,
        uf: user.uf,
        telefone: '',
        departamento: '',
        primeiroAcesso: false,
        criadoEm: admin.firestore.Timestamp.now(),
        dataAtualizacao: admin.firestore.Timestamp.now(),
        criadoPor: 'script-correcao',
        observacoes: 'Documento criado via script para conta órfã'
      };

      await db.collection('usuarios').doc(user.uid).set(docData);
      console.log(`\n✅ Documento criado: ${user.email}`);
      console.log(`   Tipo: ${user.tipo}`);
      console.log(`   Município: ${user.municipio || '(admin)'}`);

      // 2. Atualizar custom claims no Auth
      await auth.setCustomUserClaims(user.uid, {
        tipo: user.tipo,
        municipio: user.municipio || null,
        uf: user.uf || null,
        status: 'ativo'
      });
      console.log(`   ✅ Claims atualizados no Auth`);

      criados++;

    } catch (error) {
      console.log(`\n❌ Erro em ${user.email}: ${error.message}`);
      erros++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO:');
  console.log(`   ✅ Criados: ${criados}`);
  console.log(`   ❌ Erros: ${erros}`);
  console.log('\n⚠️  Usuários devem fazer LOGOUT e LOGIN para aplicar os claims!');
  console.log('='.repeat(70));

  process.exit(0);
}

criarDocumentos();
