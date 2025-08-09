

// generate-version.js
// ✅ SINCRONIZAÇÃO AUTOMÁTICA - Lê da fonte única em versionControl.js

import fs from "fs";
import path from "path";

// ✅ IMPORTAR DA FONTE ÚNICA DA VERDADE
import { APP_VERSION, getCurrentVersion } from "./src/utils/versionControl.js";

console.log("🔄 Sincronizando versões...");
console.log("📍 Versão fonte (versionControl.js):", APP_VERSION.number);

// Ler package.json atual
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
console.log("📍 Versão package.json (antes):", packageJson.version);

// ✅ USAR A VERSÃO DA FONTE ÚNICA
const agora = new Date();
const versionInfo = {
  version: APP_VERSION.number,
  buildDate: new Date().toISOString(),
  buildDateBR: `${agora.toLocaleDateString("pt-BR")} às ${agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`,
  environment: process.env.NODE_ENV || "production",
  changes: APP_VERSION.changes,
  date: APP_VERSION.date,
  timestamp: APP_VERSION.timestamp || `${agora.toLocaleDateString("pt-BR")} às ${agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`,
};

// Salvar na pasta public
const versionPath = path.join("./public", "version.json");
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
console.log("✅ version.json atualizado:", versionInfo.version);

// ✅ SINCRONIZAR package.json COM A FONTE ÚNICA
if (packageJson.version !== APP_VERSION.number) {
  packageJson.version = APP_VERSION.number;
  fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));
  console.log("✅ package.json sincronizado:", APP_VERSION.number);
} else {
  console.log("✅ package.json já está sincronizado");
}

// Atualizar scripts se necessário
const requiredScripts = {
  build: "node generate-version.js && vite build",
  "version:sync": "node generate-version.js",
  "version:patch": "node scripts/increment-version.js patch",
  "version:minor": "node scripts/increment-version.js minor", 
  "version:major": "node scripts/increment-version.js major",
};

let scriptsUpdated = false;
Object.entries(requiredScripts).forEach(([key, value]) => {
  if (!packageJson.scripts[key] || packageJson.scripts[key] !== value) {
    packageJson.scripts[key] = value;
    scriptsUpdated = true;
  }
});

if (scriptsUpdated) {
  fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));
  console.log("✅ Scripts do package.json atualizados!");
}

console.log("🎉 Sincronização concluída - Versão:", APP_VERSION.number);

