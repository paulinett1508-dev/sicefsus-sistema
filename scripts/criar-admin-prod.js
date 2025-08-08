// Script para completar APENAS os dados do Firestore
// Execute este no console do Replit

const { initializeApp } = await import("firebase/app");
const { getFirestore, doc, setDoc, getDoc } = await import(
  "firebase/firestore"
);

// Credenciais Firebase Produção
const prodConfig = {
  apiKey: "AIzaSyCKN1oTg9_eJY8DaEsh49gHeyEJ-reaITQ",
  authDomain: "emendas-parlamentares-prod.firebaseapp.com",
  projectId: "emendas-parlamentares-prod",
  storageBucket: "emendas-parlamentares-prod.firebasestorage.app",
  messagingSenderId: "188886371502",
  appId: "1:188886371502:web:055a24491df1f9f453f13f",
};

// Inicializar Firebase
const app = initializeApp(prodConfig);
const db = getFirestore(app);

// UID do usuário já criado
const userUID = "tPwEq7i3tFYzdCjPdqqVR5miIQh2";
const adminEmail = "paulinete.miranda@laboratoriosobral.com.br";

async function completarDadosFirestore() {
  try {
    console.log("🔄 Completando dados do Firestore...");

    // 1. Verificar se usuário já existe no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", userUID));

    if (!userDoc.exists()) {
      // Criar documento do usuário no Firestore
      await setDoc(doc(db, "usuarios", userUID), {
        email: adminEmail,
        nome: "Administrador Sistema",
        tipo: "admin",
        ativo: true,
        municipio: null,
        uf: null,
        data_criacao: new Date(),
        data_atualizacao: new Date(),
        ultimo_acesso: null,

        permissoes: {
          criar_emenda: true,
          editar_emenda: true,
          excluir_emenda: true,
          visualizar_todas_emendas: true,
          criar_despesa: true,
          editar_despesa: true,
          excluir_despesa: true,
          visualizar_todas_despesas: true,
          gerenciar_usuarios: true,
          criar_usuario: true,
          editar_usuario: true,
          desativar_usuario: true,
          acessar_relatorios: true,
          exportar_dados: true,
          relatorios_avancados: true,
          configurar_sistema: true,
          visualizar_auditoria: true,
          backup_dados: true,
        },

        configuracoes: {
          tema: "light",
          notificacoes_email: true,
          timezone: "America/Sao_Paulo",
          idioma: "pt-BR",
        },
      });
      console.log("✅ Documento do usuário criado no Firestore");
    } else {
      console.log("ℹ️ Usuário já existe no Firestore");
    }

    // 2. Criar configuração do sistema
    await setDoc(doc(db, "configuracoes", "sistema"), {
      versao: "1.0.0",
      ambiente: "producao",
      nome_sistema: "SICEFSUS - Sistema de Controle de Emendas",
      admin_inicial_criado: true,
      data_criacao: new Date(),
      data_atualizacao: new Date(),

      features_ativas: [
        "dashboard",
        "emendas",
        "despesas",
        "relatorios",
        "usuarios",
        "auditoria",
      ],

      em_manutencao: false,
      mensagem_manutencao: "",
      backup_automatico: true,
      logs_auditoria: true,

      seguranca: {
        sessao_expira_minutos: 120,
        tentativas_login_max: 5,
        senha_min_chars: 8,
        require_2fa: false,
      },
    });
    console.log("✅ Configurações do sistema criadas");

    // 3. Criar validações do sistema
    await setDoc(doc(db, "configuracoes", "validacoes"), {
      cnpj_obrigatorio: true,
      valor_minimo_emenda: 1000,
      valor_maximo_emenda: 50000000,
      tipos_emenda_validos: ["individual", "bancada", "comissao"],
      formato_cnpj: "XX.XXX.XXX/XXXX-XX",
      digitos_cnpj: 14,
      data_criacao: new Date(),
    });
    console.log("✅ Validações do sistema criadas");

    // 4. Criar estados brasileiros
    const estados = [
      { sigla: "AC", nome: "Acre" },
      { sigla: "AL", nome: "Alagoas" },
      { sigla: "AP", nome: "Amapá" },
      { sigla: "AM", nome: "Amazonas" },
      { sigla: "BA", nome: "Bahia" },
      { sigla: "CE", nome: "Ceará" },
      { sigla: "DF", nome: "Distrito Federal" },
      { sigla: "ES", nome: "Espírito Santo" },
      { sigla: "GO", nome: "Goiás" },
      { sigla: "MA", nome: "Maranhão" },
      { sigla: "MT", nome: "Mato Grosso" },
      { sigla: "MS", nome: "Mato Grosso do Sul" },
      { sigla: "MG", nome: "Minas Gerais" },
      { sigla: "PA", nome: "Pará" },
      { sigla: "PB", nome: "Paraíba" },
      { sigla: "PR", nome: "Paraná" },
      { sigla: "PE", nome: "Pernambuco" },
      { sigla: "PI", nome: "Piauí" },
      { sigla: "RJ", nome: "Rio de Janeiro" },
      { sigla: "RN", nome: "Rio Grande do Norte" },
      { sigla: "RS", nome: "Rio Grande do Sul" },
      { sigla: "RO", nome: "Rondônia" },
      { sigla: "RR", nome: "Roraima" },
      { sigla: "SC", nome: "Santa Catarina" },
      { sigla: "SP", nome: "São Paulo" },
      { sigla: "SE", nome: "Sergipe" },
      { sigla: "TO", nome: "Tocantins" },
    ];

    console.log("🔄 Criando estados brasileiros...");
    for (const estado of estados) {
      await setDoc(doc(db, "estados", estado.sigla), {
        nome: estado.nome,
        sigla: estado.sigla,
        ativo: true,
        data_criacao: new Date(),
      });
    }
    console.log("✅ 27 estados brasileiros criados");

    // 5. Criar tipos de emenda
    const tiposEmenda = [
      { id: "individual", nome: "Emenda Individual", ativo: true },
      { id: "bancada", nome: "Emenda de Bancada", ativo: true },
      { id: "comissao", nome: "Emenda de Comissão", ativo: true },
    ];

    for (const tipo of tiposEmenda) {
      await setDoc(doc(db, "tipos_emenda", tipo.id), {
        nome: tipo.nome,
        ativo: tipo.ativo,
        data_criacao: new Date(),
      });
    }
    console.log("✅ Tipos de emenda criados");

    // 6. Log de auditoria
    await setDoc(doc(db, "auditoria", `setup_completo_${Date.now()}`), {
      acao: "SETUP_FIRESTORE_COMPLETO",
      usuario_id: userUID,
      email: adminEmail,
      timestamp: new Date(),
      detalhes: {
        metodo: "script_firestore_only",
        ambiente: "producao",
        dados_criados: [
          "usuario_admin",
          "configuracoes_sistema",
          "estados_brasileiros",
          "tipos_emenda",
          "validacoes",
        ],
      },
    });
    console.log("✅ Log de auditoria registrado");

    console.log("\n🎉 SETUP FIRESTORE COMPLETADO COM SUCESSO!");
    console.log("\n📊 DADOS CRIADOS:");
    console.log("✅ Usuário administrador");
    console.log("✅ Configurações do sistema");
    console.log("✅ 27 estados brasileiros");
    console.log("✅ Tipos de emenda");
    console.log("✅ Validações do sistema");
    console.log("✅ Log de auditoria");

    console.log("\n🔐 CREDENCIAIS DO ADMIN:");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Senha: Admin2025!");
    console.log("🆔 UID:", userUID);

    console.log("\n🚀 PRÓXIMOS PASSOS:");
    console.log("1. ✅ Firebase produção configurado");
    console.log("2. 🔄 Configurar Vercel");
    console.log("3. 🚀 Fazer deploy produção");
    console.log("4. 🧪 Testar login admin");
  } catch (error) {
    console.error("❌ Erro ao completar Firestore:", error);
  }
}

// Executar
await completarDadosFirestore();
