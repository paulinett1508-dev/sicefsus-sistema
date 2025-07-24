const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Altere este ID se quiser restaurar outro documento de backup
const BACKUP_ID = "HlrWmU316w1uJ84iczad"; // <-- Substitua se for outro ID

async function restaurarColecoes() {
  try {
    const backupRef = db.collection("backups").doc(BACKUP_ID);
    const snapshot = await backupRef.get();

    if (!snapshot.exists) {
      console.log("⚠️ Backup não encontrado.");
      return;
    }

    const colecoes = snapshot.data().collections;

    for (const [nomeColecao, documentos] of Object.entries(colecoes)) {
      console.log(`📁 Restaurando coleção: ${nomeColecao}...`);

      for (const doc of documentos) {
        const id = doc.id || db.collection(nomeColecao).doc().id;
        const { id: _, ...conteudo } = doc;

        await db.collection(nomeColecao).doc(id).set(conteudo);
      }

      console.log(`✅ Coleção "${nomeColecao}" restaurada.`);
    }

    console.log("🎉 Restauração completa com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao restaurar:", error);
  }
}

restaurarColecoes();
