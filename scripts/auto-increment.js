
// scripts/auto-increment.js
// ✅ INCREMENTO AUTOMÁTICO CONDICIONAL - Só incrementa em produção

import fs from "fs";
import path from "path";

const mode = process.env.NODE_ENV || process.argv[2] || 'development';

console.log(`🔄 Verificando incremento automático (modo: ${mode})...`);

// Só incrementa se for build de produção
if (mode === 'production' || process.argv.includes('--production')) {
  console.log("🚀 Build de produção detectado - Incrementando versão patch...");
  
  // Importar e executar o incremento
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);
  
  try {
    await execAsync("node scripts/increment-version.js patch");
    console.log("✅ Versão incrementada automaticamente!");
  } catch (error) {
    console.error("❌ Erro ao incrementar versão:", error.message);
  }
} else {
  console.log("⚡ Build de desenvolvimento - Versão mantida");
}

// Sempre executar sincronização
console.log("🔄 Executando sincronização...");
await import("../generate-version.js");
