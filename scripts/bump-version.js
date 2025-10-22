#!/usr/bin/env node
// scripts/bump-version.js
// 🚀 SCRIPT SIMPLES PARA INCREMENTAR VERSÃO ANTES DO REPUBLISH

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionFilePath = path.join(__dirname, "../src/utils/versionControl.js");

console.log("🔄 Incrementando versão...\n");

try {
  // Ler arquivo atual
  let content = fs.readFileSync(versionFilePath, "utf8");

  // Extrair versão atual
  const versionMatch = content.match(/number: ["'](\d+)\.(\d+)\.(\d+)["']/);

  if (!versionMatch) {
    throw new Error("❌ Formato de versão não encontrado");
  }

  const [_, major, minor, patch] = versionMatch;
  const newPatch = parseInt(patch) + 1;
  const newVersion = `${major}.${minor}.${newPatch}`;

  // Data atual formatada
  const now = new Date();
  const dataBR = now.toLocaleDateString("pt-BR");
  const horaMinuto = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const timestamp = `${dataBR} às ${horaMinuto}`;

  // Substituir versão
  content = content.replace(
    /number: ["'][\d.]+["']/,
    `number: "${newVersion}"`,
  );

  // Substituir data
  content = content.replace(/date: ["'][^"']+["']/, `date: "${dataBR}"`);

  // Substituir timestamp
  content = content.replace(
    /timestamp: ["'][^"']+["']/,
    `timestamp: "${timestamp}"`,
  );

  // Salvar arquivo
  fs.writeFileSync(versionFilePath, content, "utf8");

  console.log("✅ Versão incrementada com sucesso!\n");
  console.log(`📦 Versão anterior: ${major}.${minor}.${patch}`);
  console.log(`📦 Nova versão:     ${newVersion}`);
  console.log(`📅 Data:            ${dataBR}`);
  console.log(`⏰ Hora:            ${horaMinuto}\n`);
  console.log("🚀 Pronto para fazer o Republish!\n");
} catch (error) {
  console.error("❌ Erro ao incrementar versão:", error.message);
  process.exit(1);
}
