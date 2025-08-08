const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Extensões de arquivo para processar
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

// Diretórios para ignorar
const ignoreDirs = ['node_modules', '.git', 'dist-backup'];

let totalFiles = 0;
let processedFiles = 0;
let removedStatements = 0;

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return extensions.includes(ext);
}

function shouldIgnoreDir(dirName) {
  return ignoreDirs.includes(dirName);
}

function removeConsoleFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileRemovedCount = 0;

    // 🔧 VERSÃO SEGURA: Apenas padrões específicos e seguros

    // 1. Console.log básicos (mais comum e seguro)
    const basicMatches = content.match(/console\.log\s*\([^)]*\)/g) || [];
    fileRemovedCount += basicMatches.length;
    content = content.replace(/console\.log\s*\([^)]*\)/g, '');

    // 2. Outros console específicos (warn, error, info, debug)
    const warnMatches = content.match(/console\.warn\s*\([^)]*\)/g) || [];
    fileRemovedCount += warnMatches.length;
    content = content.replace(/console\.warn\s*\([^)]*\)/g, '');

    const infoMatches = content.match(/console\.info\s*\([^)]*\)/g) || [];
    fileRemovedCount += infoMatches.length;
    content = content.replace(/console\.info\s*\([^)]*\)/g, '');

    const debugMatches = content.match(/console\.debug\s*\([^)]*\)/g) || [];
    fileRemovedCount += debugMatches.length;
    content = content.replace(/console\.debug\s*\([^)]*\)/g, '');

    // 3. Console.error APENAS em desenvolvimento (manter alguns em prod para debug crítico)
    // content = content.replace(/console\.error\s*\([^)]*\)/g, '');

    // 4. Debugger statements
    content = content.replace(/debugger\s*;?/g, '');

    // 5. Limpeza mínima - apenas casos óbvios
    content = content.replace(/;\s*;/g, ';'); // Ponto e vírgula duplo
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n'); // Linhas vazias excessivas

    // Verificação final - contar quantos console ainda restam
    const remainingConsoles = (content.match(/console\s*\./g) || []).length;

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`${colors.green}✓${colors.reset} Processado: ${colors.blue}${filePath}${colors.reset}`);
      console.log(`  ${colors.yellow}→${colors.reset} Removidos: ${fileRemovedCount} | Restantes: ${remainingConsoles}`);

      removedStatements += fileRemovedCount;
      processedFiles++;
    }

    totalFiles++;
  } catch (error) {
    console.error(`${colors.red}✗ Erro ao processar ${filePath}: ${error.message}${colors.reset}`);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !shouldIgnoreDir(item)) {
        processDirectory(fullPath);
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        removeConsoleFromFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`${colors.red}✗ Erro ao processar diretório ${dirPath}: ${error.message}${colors.reset}`);
  }
}

// Função principal
function main() {
  const distPath = path.join(__dirname, 'dist');

  console.log(`\n${colors.blue}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}   Removendo console.logs de produção   ${colors.reset}`);
  console.log(`${colors.blue}        (Modo Seguro)                   ${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════${colors.reset}\n`);

  if (!fs.existsSync(distPath)) {
    console.error(`${colors.red}✗ Diretório 'dist' não encontrado!${colors.reset}`);
    console.log(`${colors.yellow}Execute 'npm run build' primeiro.${colors.reset}`);
    process.exit(1);
  }

  // Fazer backup antes de processar
  const backupPath = path.join(__dirname, 'dist-backup');
  if (fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { recursive: true, force: true });
  }

  console.log(`${colors.blue}→ Criando backup...${colors.reset}`);
  fs.cpSync(distPath, backupPath, { recursive: true });
  console.log(`${colors.green}✓ Backup criado em: dist-backup${colors.reset}\n`);

  // Processar arquivos
  console.log(`${colors.blue}→ Processando arquivos...${colors.reset}\n`);
  processDirectory(distPath);

  // Relatório final
  console.log(`\n${colors.blue}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✓ Processo concluído!${colors.reset}`);
  console.log(`${colors.blue}→${colors.reset} Total de arquivos analisados: ${colors.yellow}${totalFiles}${colors.reset}`);
  console.log(`${colors.blue}→${colors.reset} Arquivos modificados: ${colors.yellow}${processedFiles}${colors.reset}`);
  console.log(`${colors.blue}→${colors.reset} Console statements removidos: ${colors.yellow}${removedStatements}${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════${colors.reset}\n`);
}

// Executar
if (require.main === module) {
  main();
}