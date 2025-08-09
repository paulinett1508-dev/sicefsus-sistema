
// scripts/increment-version.js
// ✅ INCREMENTO AUTOMÁTICO DE VERSÃO

import fs from "fs";
import path from "path";

const versionType = process.argv[2] || 'patch';

console.log(`🔄 Incrementando versão (${versionType})...`);

// Ler o arquivo versionControl.js
const versionControlPath = "./src/utils/versionControl.js";
let content = fs.readFileSync(versionControlPath, "utf8");

// Extrair versão atual
const versionMatch = content.match(/number: "(\d+\.\d+\.\d+)"/);
if (!versionMatch) {
  console.error("❌ Não foi possível encontrar a versão atual");
  process.exit(1);
}

const currentVersion = versionMatch[1];
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calcular nova versão
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`📍 Versão atual: ${currentVersion}`);
console.log(`📍 Nova versão: ${newVersion}`);

// Atualizar data e timestamp no formato brasileiro
const agora = new Date();
const newDate = agora.toLocaleDateString("pt-BR");
const newTimestamp = `${agora.toLocaleDateString("pt-BR")} às ${agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;

// Substituir no arquivo
content = content.replace(
  /number: "(\d+\.\d+\.\d+)"/,
  `number: "${newVersion}"`
);

content = content.replace(
  /date: "([^"]+)"/,
  `date: "${newDate}"`
);

content = content.replace(
  /timestamp: "([^"]+)"/,
  `timestamp: "${newTimestamp}"`
);

// Salvar arquivo
fs.writeFileSync(versionControlPath, content);
console.log("✅ versionControl.js atualizado");

// Executar sincronização
console.log("🔄 Executando sincronização...");
import("../generate-version.js");
