// api/server.js - SICEFSUS Admin API
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
require("dotenv").config({ path: "../.env" }); // Ler .env da raiz

const app = express();
const PORT = process.env.ADMIN_API_PORT || 3001;

// ✅ SEGURANÇA: Rate Limiting simples (sem dependências externas)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requisições por minuto

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const record = rateLimitMap.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: "Muitas requisições. Tente novamente em 1 minuto.",
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
  }
  
  record.count++;
  next();
};

// Limpar registros antigos a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// 🔐 CONFIGURAR FIREBASE ADMIN SDK
// Usar as mesmas credenciais do frontend
const serviceAccount = {
  type: "service_account",
  project_id: process.env.VITE_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
};

// Verificar se já foi inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

// 🌐 CONFIGURAR MIDDLEWARE
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://91331338-5ea0-4039-8bb8-abc10e5bcddb-00-1rdw2huxzbjmc.worf.replit.dev",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// 📋 MIDDLEWARE DE AUTENTICAÇÃO SIMPLIFICADO
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    // Verificar token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Verificar se é admin no Firestore
    const userDoc = await admin
      .firestore()
      .collection("usuarios")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: "Usuário não encontrado" });
    }

    const userData = userDoc.data();
    if (userData.tipo !== "admin" && userData.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado - apenas admins" });
    }

    req.user = decodedToken;
    req.userData = userData;
    next();
  } catch (error) {
    console.error("❌ Erro na autenticação:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};

// 🚀 ROTAS DA API

// ✅ ROTA: Status da API
app.get("/api/admin/status", (req, res) => {
  res.json({
    status: "active",
    message: "SICEFSUS Admin API funcionando",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    project: process.env.VITE_FIREBASE_PROJECT_ID,
  });
});

// ✅ ROTA: Excluir usuário COMPLETAMENTE
app.delete("/api/admin/users/:uid", rateLimiter, authenticateAdmin, async (req, res) => {
  try {
    const { uid } = req.params;

    console.log("🗑️ Admin API: Excluindo usuário completo:", uid);

    // 1. Buscar dados do usuário antes da exclusão
    let userRecord = null;
    let userEmail = "email-não-encontrado";

    try {
      userRecord = await admin.auth().getUser(uid);
      userEmail = userRecord.email;
      console.log("📧 Email encontrado:", userEmail);
    } catch (authError) {
      console.log("⚠️ Usuário não encontrado no Auth:", authError.message);
    }

    // 2. Buscar dados do Firestore
    const userDoc = await admin
      .firestore()
      .collection("usuarios")
      .doc(uid)
      .get();

    const firestoreData = userDoc.exists ? userDoc.data() : null;

    // 3. Excluir do Firebase Auth (se existir)
    if (userRecord) {
      await admin.auth().deleteUser(uid);
      console.log("✅ Usuário excluído do Firebase Auth");
    }

    // 4. Excluir do Firestore (se existir)
    if (userDoc.exists) {
      await admin.firestore().collection("usuarios").doc(uid).delete();
      console.log("✅ Usuário excluído do Firestore");
    }

    // 5. Log de auditoria
    await admin
      .firestore()
      .collection("auditoria")
      .add({
        action: "DELETE_USER_COMPLETE",
        adminUid: req.user.uid,
        adminEmail: req.user.email,
        deletedUser: {
          uid: uid,
          email: userEmail,
          nome: firestoreData?.nome || "N/A",
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        source: "admin_api",
        method: "complete_deletion",
      });

    res.json({
      success: true,
      message: "Usuário excluído permanentemente do Auth e Firestore",
      deletedUser: {
        uid: uid,
        email: userEmail,
        authDeleted: !!userRecord,
        firestoreDeleted: userDoc.exists,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao excluir usuário:", error);

    res.status(500).json({
      success: false,
      error: "Erro ao excluir usuário",
      message: error.message,
      code: error.code,
    });
  }
});

// ✅ ROTA: Criar usuário com Admin SDK
app.post("/api/admin/users", rateLimiter, authenticateAdmin, async (req, res) => {
  try {
    const { email, nome, role, municipio, uf, departamento, telefone } =
      req.body;

    console.log("👤 Admin API: Criando usuário:", email);

    // 1. Gerar senha temporária forte
    const senhaTemporaria = Math.random().toString(36).slice(-8) + "A1!";

    // 2. Criar no Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: senhaTemporaria,
      displayName: nome,
      emailVerified: false,
    });

    console.log("✅ Usuário criado no Auth:", userRecord.uid);

    // 3. Criar documento no Firestore
    await admin
      .firestore()
      .collection("usuarios")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email: email,
        nome: nome,
        tipo: role === "admin" ? "admin" : "operador",
        status: "ativo",
        municipio: role === "admin" ? "" : municipio,
        uf: role === "admin" ? "" : uf,
        departamento: departamento || "",
        telefone: telefone || "",
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        primeiroAcesso: true,
        senhaTemporaria: senhaTemporaria,
        criadoPor: req.user.uid,
        criadoPorEmail: req.user.email,
      });

    console.log("✅ Dados salvos no Firestore");

    // 4. Gerar link de reset
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // 5. Log de auditoria
    await admin
      .firestore()
      .collection("auditoria")
      .add({
        action: "CREATE_USER_ADMIN",
        adminUid: req.user.uid,
        adminEmail: req.user.email,
        createdUser: {
          uid: userRecord.uid,
          email: email,
          nome: nome,
          tipo: role,
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        source: "admin_api",
      });

    res.json({
      success: true,
      message: "Usuário criado com sucesso via Admin SDK",
      user: {
        uid: userRecord.uid,
        email: email,
        senhaTemporaria: senhaTemporaria,
        resetLink: resetLink,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);

    res.status(500).json({
      success: false,
      error: "Erro ao criar usuário",
      message: error.message,
      code: error.code,
    });
  }
});

// ✅ ROTA: Reset de senha via Admin SDK
app.post(
  "/api/admin/users/:uid/reset-password",
  rateLimiter,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { uid } = req.params;

      // Buscar email do usuário
      const userRecord = await admin.auth().getUser(uid);

      // Gerar link de reset
      const resetLink = await admin
        .auth()
        .generatePasswordResetLink(userRecord.email);

      // Log de auditoria
      await admin
        .firestore()
        .collection("auditoria")
        .add({
          action: "RESET_PASSWORD_ADMIN",
          adminUid: req.user.uid,
          adminEmail: req.user.email,
          targetUser: {
            uid: uid,
            email: userRecord.email,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          source: "admin_api",
        });

      res.json({
        success: true,
        message: "Link de reset gerado via Admin SDK",
        resetLink: resetLink,
        email: userRecord.email,
      });
    } catch (error) {
      console.error("❌ Erro ao resetar senha:", error);

      res.status(500).json({
        success: false,
        error: "Erro ao resetar senha",
        message: error.message,
      });
    }
  },
);

// 🎯 INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 SICEFSUS Admin API rodando na porta ${PORT}`);
  console.log(`📊 Projeto Firebase: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
  console.log(`🌐 CORS habilitado para desenvolvimento`);
  console.log(`⏰ Iniciado em: ${new Date().toLocaleString("pt-BR")}`);
});

// Tratamento de erros
process.on("uncaughtException", (error) => {
  console.error("❌ Erro não capturado:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise rejeitada:", reason);
});

module.exports = app;
