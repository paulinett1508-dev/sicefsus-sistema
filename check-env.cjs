const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`\n${colors.blue}════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}   Verificando Configuração de Build    ${colors.reset}`);
console.log(`${colors.blue}════════════════════════════════════════${colors.reset}\n`);

// Verificar .env.production
const envProdPath = path.join(__dirname, '.env.production');
if (fs.existsSync(envProdPath)) {
  console.log(`${colors.green}✓${colors.reset} Arquivo .env.production encontrado`);
  const envContent = fs.readFileSync(envProdPath, 'utf8');
  if (envContent.includes('VITE_ENV=production')) {
    console.log(`${colors.green}✓${colors.reset} VITE_ENV=production está configurado`);
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} VITE_ENV=production não encontrado no .env.production`);
  }
} else {
  console.log(`${colors.red}✗${colors.reset} Arquivo .env.production não encontrado`);
}

// Verificar vite.config.js
const viteConfigPath = path.join(__dirname, 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  console.log(`${colors.green}✓${colors.reset} vite.config.js encontrado`);
  const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
  if (viteContent.includes('drop_console')) {
    console.log(`${colors.green}✓${colors.reset} Configuração drop_console encontrada`);
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} Configuração drop_console não encontrada`);
  }
} else {
  console.log(`${colors.red}✗${colors.reset} vite.config.js não encontrado`);
}

// Verificar script de remoção
const removeScriptPath = path.join(__dirname, 'remove-console-prod.cjs');
if (fs.existsSync(removeScriptPath)) {
  console.log(`${colors.green}✓${colors.reset} Script remove-console-prod.cjs encontrado`);
} else {
  console.log(`${colors.red}✗${colors.reset} Script remove-console-prod.cjs não encontrado`);
}

// Verificar package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (packageJson.scripts && packageJson.scripts['build:prod']) {
    console.log(`${colors.green}✓${colors.reset} Script build:prod configurado`);
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} Script build:prod não encontrado`);
  }
}

console.log(`\n${colors.blue}════════════════════════════════════════${colors.reset}\n`);