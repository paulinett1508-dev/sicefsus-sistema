
// generate-version.js
// Gera arquivo de versão para o sistema de updates

import fs from "fs";
import path from "path";

// Ler versão do package.json
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const versionInfo = {
  version: packageJson.version || "1.0.0",
  buildDate: new Date().toISOString(),
  environment: process.env.NODE_ENV || "production",
};

// Salvar na pasta public
const versionPath = path.join("./public", "version.json");
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));

console.log("✅ Arquivo de versão gerado:", versionInfo);

// Atualizar package.json scripts
const updatedScripts = {
  ...packageJson.scripts,
  build: "node generate-version.js && vite build",
  "version:patch": "npm version patch && node generate-version.js",
  "version:minor": "npm version minor && node generate-version.js",
  "version:major": "npm version major && node generate-version.js",
};

packageJson.scripts = updatedScripts;
fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));

console.log("✅ Scripts do package.json atualizados!");
