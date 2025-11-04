
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 🔧 Shell to Markdown Converter
 * Executa comando shell e gera arquivo MD com o resultado
 */

// Configurações
const OUTPUT_DIR = path.join(process.cwd(), 'docs');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Garantir que o diretório existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Executa comando e retorna output
 */
function executeCommand(command) {
  try {
    console.log(`\n🔄 Executando: ${command}\n`);
    const output = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB
      cwd: process.cwd()
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.stderr || error.message
    };
  }
}

/**
 * Gera conteúdo Markdown
 */
function generateMarkdown(command, result) {
  const { success, output, error } = result;
  
  let content = `# 📋 Resultado do Comando Shell\n\n`;
  content += `**Data/Hora:** ${new Date().toLocaleString('pt-BR')}\n\n`;
  content += `**Comando Executado:**\n\`\`\`bash\n${command}\n\`\`\`\n\n`;
  content += `**Status:** ${success ? '✅ Sucesso' : '❌ Erro'}\n\n`;
  
  if (success) {
    content += `## 📊 Output\n\n`;
    content += `\`\`\`\n${output}\n\`\`\`\n\n`;
  } else {
    if (output) {
      content += `## 📊 Output (Parcial)\n\n`;
      content += `\`\`\`\n${output}\n\`\`\`\n\n`;
    }
    if (error) {
      content += `## ⚠️ Erro\n\n`;
      content += `\`\`\`\n${error}\n\`\`\`\n\n`;
    }
  }
  
  content += `---\n`;
  content += `*Gerado automaticamente pelo SICEFSUS*\n`;
  
  return content;
}

/**
 * Salva arquivo MD
 */
function saveMarkdown(filename, content) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`\n✅ Arquivo gerado: ${filepath}\n`);
  return filepath;
}

// Main
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📋 Shell to Markdown Converter
==============================

Uso:
  node scripts/shell-to-md.cjs "comando"
  node scripts/shell-to-md.cjs "comando" nome-arquivo.md

Exemplos:
  node scripts/shell-to-md.cjs "ls -la"
  node scripts/shell-to-md.cjs "tree src" estrutura-src.md
  node scripts/shell-to-md.cjs "npm list --depth=0" dependencias.md
  node scripts/shell-to-md.cjs "git log --oneline -10" commits.md
    `);
    process.exit(0);
  }
  
  const command = args[0];
  const customFilename = args[1];
  
  // Executar comando
  const result = executeCommand(command);
  
  // Gerar nome do arquivo
  const cmdSlug = command
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
  const filename = customFilename || `shell-output-${cmdSlug}-${timestamp}.md`;
  
  // Gerar markdown
  const markdown = generateMarkdown(command, result);
  
  // Salvar arquivo
  const filepath = saveMarkdown(filename, markdown);
  
  // Estatísticas
  const lines = markdown.split('\n').length;
  const chars = markdown.length;
  
  console.log(`📊 Estatísticas:`);
  console.log(`   Linhas: ${lines}`);
  console.log(`   Caracteres: ${chars}`);
  console.log(`   Tamanho: ${(chars / 1024).toFixed(2)} KB`);
  
  process.exit(result.success ? 0 : 1);
}

main();
