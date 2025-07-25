
#!/usr/bin/env node

/**
 * Script para regenerar a documentação do projeto
 * Uso: node gerar-docs.js [opcoes]
 * 
 * Opções:
 *   --force    Força regeneração mesmo sem mudanças
 *   --help     Mostra esta ajuda
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const DOCS_GENERATOR = './generate-full-docs.cjs';
const OUTPUT_FILE = 'DOCUMENTACAO_COMPLETA.html';
const VERSION_FILE = 'doc-version.json';

// Cores para console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showHelp() {
  log('\n📚 Gerador de Documentação - Sistema de Emendas', 'cyan');
  log('=' .repeat(50), 'cyan');
  log('\nUso:', 'bold');
  log('  node gerar-docs.js [opções]');
  log('\nOpções:', 'bold');
  log('  --force    Força regeneração mesmo sem mudanças detectadas');
  log('  --help     Mostra esta mensagem de ajuda');
  log('\nExemplos:', 'bold');
  log('  node gerar-docs.js                # Gera docs se houver mudanças');
  log('  node gerar-docs.js --force        # Força geração');
  log('\nArquivos gerados:', 'bold');
  log(`  ${OUTPUT_FILE}    # Documentação HTML`);
  log(`  ${VERSION_FILE}         # Controle de versão`);
  log('');
}

function checkPrerequisites() {
  // Verificar se o gerador existe
  if (!fs.existsSync(DOCS_GENERATOR)) {
    log('❌ Erro: Arquivo gerador não encontrado!', 'red');
    log(`   Procurando: ${DOCS_GENERATOR}`, 'yellow');
    return false;
  }

  // Verificar Node.js
  try {
    const nodeVersion = process.version;
    log(`✅ Node.js ${nodeVersion}`, 'green');
  } catch (err) {
    log('❌ Erro: Node.js não encontrado!', 'red');
    return false;
  }

  return true;
}

function getProjectStats() {
  const stats = {
    files: 0,
    jsFiles: 0,
    components: 0,
    hooks: 0
  };

  try {
    // Contar arquivos JavaScript
    const srcDir = './src';
    if (fs.existsSync(srcDir)) {
      const countFiles = (dir) => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.')) {
            countFiles(fullPath);
          } else if (stat.isFile()) {
            stats.files++;
            
            if (item.endsWith('.js') || item.endsWith('.jsx')) {
              stats.jsFiles++;
              
              if (fullPath.includes('/components/')) {
                stats.components++;
              } else if (fullPath.includes('/hooks/')) {
                stats.hooks++;
              }
            }
          }
        });
      };
      
      countFiles(srcDir);
    }
  } catch (err) {
    log('⚠️ Erro ao contar arquivos do projeto', 'yellow');
  }

  return stats;
}

function showProjectInfo() {
  log('\n📊 Informações do Projeto', 'cyan');
  log('-'.repeat(30), 'cyan');
  
  const stats = getProjectStats();
  log(`📁 Total de arquivos: ${stats.files}`);
  log(`🟨 Arquivos JS/JSX: ${stats.jsFiles}`);
  log(`⚛️ Componentes React: ${stats.components}`);
  log(`🪝 Hooks customizados: ${stats.hooks}`);
  
  // Mostrar versão atual se existir
  if (fs.existsSync(VERSION_FILE)) {
    try {
      const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
      log(`📝 Última versão: ${versionData.version}`, 'blue');
      log(`🕒 Gerada em: ${new Date(versionData.timestamp).toLocaleString('pt-BR')}`, 'blue');
    } catch (err) {
      log('⚠️ Erro ao ler versão anterior', 'yellow');
    }
  }
}

function generateDocs(force = false) {
  log('\n🔄 Iniciando geração da documentação...', 'cyan');
  
  try {
    const startTime = Date.now();
    
    // Preparar comando
    const command = `node ${DOCS_GENERATOR}`;
    
    // Se force, remover arquivo de versão para forçar regeneração
    if (force && fs.existsSync(VERSION_FILE)) {
      fs.unlinkSync(VERSION_FILE);
      log('🗑️ Arquivo de versão removido (modo --force)', 'yellow');
    }
    
    // Executar gerador
    log('📝 Executando gerador...', 'blue');
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Mostrar saída do gerador
    if (output) {
      log('\n📋 Saída do gerador:', 'blue');
      console.log(output);
    }
    
    // Verificar se arquivo foi gerado
    if (fs.existsSync(OUTPUT_FILE)) {
      const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);
      log(`\n✅ Documentação gerada com sucesso!`, 'green');
      log(`📄 Arquivo: ${OUTPUT_FILE} (${fileSize} KB)`, 'green');
      log(`⏱️ Tempo: ${duration}s`, 'green');
      
      // Mostrar instruções
      log('\n💡 Como visualizar:', 'cyan');
      log('  1. Clique no arquivo DOCUMENTACAO_COMPLETA.html no navegador de arquivos');
      log('  2. Ou abra diretamente no navegador');
      
    } else {
      log('❌ Erro: Arquivo de documentação não foi gerado!', 'red');
      return false;
    }
    
    return true;
    
  } catch (err) {
    log('\n❌ Erro ao gerar documentação:', 'red');
    log(err.message, 'red');
    
    // Mostrar mais detalhes do erro se disponível
    if (err.stdout) {
      log('\nSaída padrão:', 'yellow');
      console.log(err.stdout);
    }
    if (err.stderr) {
      log('\nErros:', 'yellow');
      console.log(err.stderr);
    }
    
    return false;
  }
}

function main() {
  // Parse argumentos
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const help = args.includes('--help');
  
  // Mostrar cabeçalho
  log('\n📚 Gerador de Documentação do Sistema', 'bold');
  log('=' .repeat(50), 'cyan');
  
  if (help) {
    showHelp();
    return;
  }
  
  // Verificar pré-requisitos
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  
  // Mostrar informações do projeto
  showProjectInfo();
  
  // Gerar documentação
  const success = generateDocs(force);
  
  if (success) {
    log('\n🎉 Processo concluído com sucesso!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Processo falhou!', 'red');
    process.exit(1);
  }
}

// Executar script
main();
