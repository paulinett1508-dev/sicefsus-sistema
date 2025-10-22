#!/usr/bin/env node

/**
 * 🔍 CHECK ESTRUTURA - v1.0
 * Script otimizado para mapear estrutura do projeto com resumo de conteúdo
 * 
 * FEATURES:
 * - Árvore completa de diretórios
 * - Resumo do conteúdo de cada arquivo (primeiras linhas + exports)
 * - Estatísticas gerais
 * - Identificação de componentes, hooks, services, utils
 * - Formato MD otimizado para Claude
 */

const fs = require('fs');
const path = require('path');

// ========================================
// 📋 CONFIGURAÇÕES
// ========================================
const CONFIG = {
  // Diretório raiz do projeto
  rootDir: process.cwd(),

  // Diretórios a ignorar
  ignoreDirs: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '.vscode',
    '.idea'
  ],

  // Arquivos a ignorar
  ignoreFiles: [
    '.DS_Store',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.env.local',
    '.env.production'
  ],

  // Extensões de código para análise de conteúdo
  codeExtensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.json'],

  // Número de linhas para preview
  previewLines: 5,

  // Arquivo de saída
  outputFile: 'ESTRUTURA.md'
};

// ========================================
// 🛠️ UTILITÁRIOS
// ========================================

/**
 * Verifica se deve ignorar diretório/arquivo
 */
function shouldIgnore(name, isDir) {
  if (isDir) {
    return CONFIG.ignoreDirs.includes(name);
  }
  return CONFIG.ignoreFiles.includes(name);
}

/**
 * Conta linhas de um arquivo
 */
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Extrai preview do conteúdo do arquivo
 */
function getFilePreview(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Pega as primeiras N linhas não-vazias
    const previewLines = lines
      .filter(line => line.trim())
      .slice(0, CONFIG.previewLines)
      .map(line => line.trim());

    // Detecta exports/imports importantes
    const exports = lines
      .filter(line =>
        line.includes('export default') ||
        line.includes('export const') ||
        line.includes('export function') ||
        line.includes('module.exports')
      )
      .map(line => line.trim())
      .slice(0, 3);

    return {
      preview: previewLines,
      exports: exports,
      totalLines: lines.length
    };
  } catch {
    return null;
  }
}

/**
 * Identifica tipo/propósito do arquivo
 */
function identifyFileType(filePath, fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const content = getFilePreview(filePath);

  if (!content) return '📄 Arquivo';

  // React Components
  if ((ext === '.jsx' || ext === '.tsx') &&
    content.preview.some(line => line.includes('return') || line.includes('React'))) {
    return '⚛️ Componente React';
  }

  // Hooks
  if (fileName.startsWith('use') && (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx')) {
    return '🎣 Hook React';
  }

  // Services
  if (fileName.includes('Service') || fileName.includes('service')) {
    return '🔧 Serviço';
  }

  // Utils/Helpers
  if (fileName.includes('util') || fileName.includes('helper')) {
    return '🛠️ Utilitário';
  }

  // Config files
  if (fileName.includes('config') || fileName.includes('Config')) {
    return '⚙️ Configuração';
  }

  // Styles
  if (ext === '.css' || ext === '.scss' || ext === '.sass') {
    return '🎨 Estilos';
  }

  // Tests
  if (fileName.includes('.test.') || fileName.includes('.spec.')) {
    return '🧪 Testes';
  }

  // JavaScript/TypeScript genérico
  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return '💻 JavaScript';
  }

  // JSON
  if (ext === '.json') {
    if (fileName === 'package.json') return '📦 Dependências';
    return '📋 JSON';
  }

  return '📄 Arquivo';
}

/**
 * Gera estatísticas do projeto
 */
function generateStats(structure) {
  const stats = {
    totalFiles: 0,
    totalDirs: 0,
    filesByExt: {},
    componentFiles: [],
    hookFiles: [],
    serviceFiles: [],
    utilFiles: []
  };

  function traverse(node) {
    if (node.type === 'directory') {
      stats.totalDirs++;
      node.children.forEach(traverse);
    } else if (node.type === 'file') {
      stats.totalFiles++;

      const ext = path.extname(node.name);
      stats.filesByExt[ext] = (stats.filesByExt[ext] || 0) + 1;

      // Categorizar arquivos importantes
      if (node.fileType?.includes('Componente')) {
        stats.componentFiles.push(node.path);
      } else if (node.fileType?.includes('Hook')) {
        stats.hookFiles.push(node.path);
      } else if (node.fileType?.includes('Serviço')) {
        stats.serviceFiles.push(node.path);
      } else if (node.fileType?.includes('Utilitário')) {
        stats.utilFiles.push(node.path);
      }
    }
  }

  traverse(structure);
  return stats;
}

/**
 * Escaneia diretório recursivamente
 */
function scanDirectory(dirPath, relativePath = '') {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  const children = [];

  for (const item of items) {
    if (shouldIgnore(item.name, item.isDirectory())) continue;

    const fullPath = path.join(dirPath, item.name);
    const relPath = path.join(relativePath, item.name);

    if (item.isDirectory()) {
      children.push({
        type: 'directory',
        name: item.name,
        path: relPath,
        children: scanDirectory(fullPath, relPath)
      });
    } else {
      const lines = countLines(fullPath);
      const fileType = identifyFileType(fullPath, item.name);
      const preview = getFilePreview(fullPath);

      children.push({
        type: 'file',
        name: item.name,
        path: relPath,
        lines: lines,
        fileType: fileType,
        preview: preview
      });
    }
  }

  return children.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
}

// ========================================
// 📝 GERAÇÃO DO MARKDOWN
// ========================================

function generateMarkdown(structure, stats) {
  const now = new Date();
  const timestamp = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let md = [];

  // Header
  md.push('# 🏗️ ESTRUTURA DO PROJETO - SICEFSUS\n');
  md.push(`**📅 Gerado em:** ${timestamp}\n`);
  md.push(`**📍 Diretório:** \`${CONFIG.rootDir}\`\n`);
  md.push('---\n');

  // Estatísticas
  md.push('## 📊 ESTATÍSTICAS GERAIS\n');
  md.push(`- **📁 Total de Diretórios:** ${stats.totalDirs}`);
  md.push(`- **📄 Total de Arquivos:** ${stats.totalFiles}`);
  md.push(`- **⚛️ Componentes React:** ${stats.componentFiles.length}`);
  md.push(`- **🎣 Hooks Customizados:** ${stats.hookFiles.length}`);
  md.push(`- **🔧 Services:** ${stats.serviceFiles.length}`);
  md.push(`- **🛠️ Utilitários:** ${stats.utilFiles.length}\n`);

  // Distribuição por tipo
  md.push('### 📈 Distribuição por Extensão\n');
  Object.entries(stats.filesByExt)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([ext, count]) => {
      md.push(`- **${ext || 'sem extensão'}**: ${count} arquivos`);
    });
  md.push('\n---\n');

  // Árvore de diretórios
  md.push('## 📁 ESTRUTURA DE DIRETÓRIOS\n');
  md.push('```');

  function renderTree(node, prefix = '', isLast = true) {
    const connector = isLast ? '└── ' : '├── ';
    const icon = node.type === 'directory' ? '📁' : '📄';

    if (node.type === 'directory') {
      md.push(`${prefix}${connector}${icon} ${node.name}/`);

      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      node.children.forEach((child, index) => {
        renderTree(child, newPrefix, index === node.children.length - 1);
      });
    } else {
      const lineInfo = node.lines ? ` (${node.lines} linhas)` : '';
      md.push(`${prefix}${connector}${icon} ${node.name}${lineInfo}`);
    }
  }

  structure.children.forEach((child, index) => {
    renderTree(child, '', index === structure.children.length - 1);
  });

  md.push('```\n\n---\n');

  // Detalhamento de arquivos importantes
  md.push('## 📋 ARQUIVOS IMPORTANTES\n');

  // Componentes
  if (stats.componentFiles.length > 0) {
    md.push('### ⚛️ Componentes React\n');
    stats.componentFiles.slice(0, 20).forEach(filePath => {
      md.push(`- \`${filePath}\``);
    });
    if (stats.componentFiles.length > 20) {
      md.push(`- *...e mais ${stats.componentFiles.length - 20} componentes*`);
    }
    md.push('');
  }

  // Hooks
  if (stats.hookFiles.length > 0) {
    md.push('### 🎣 Hooks Customizados\n');
    stats.hookFiles.forEach(filePath => {
      md.push(`- \`${filePath}\``);
    });
    md.push('');
  }

  // Services
  if (stats.serviceFiles.length > 0) {
    md.push('### 🔧 Services\n');
    stats.serviceFiles.forEach(filePath => {
      md.push(`- \`${filePath}\``);
    });
    md.push('');
  }

  md.push('---\n');

  // Detalhamento com preview de código
  md.push('## 🔍 CONTEÚDO DOS ARQUIVOS\n');
  md.push('*Preview das primeiras linhas dos arquivos principais*\n');

  function renderFileDetails(node, level = 0) {
    if (node.type === 'directory') {
      if (level < 3) { // Limitar profundidade
        md.push(`\n${'#'.repeat(level + 3)} 📁 ${node.name}/\n`);
        node.children.forEach(child => renderFileDetails(child, level + 1));
      }
    } else if (node.type === 'file' && node.preview && CONFIG.codeExtensions.includes(path.extname(node.name))) {
      md.push(`\n#### ${node.fileType} \`${node.name}\` (${node.lines} linhas)\n`);

      if (node.preview.exports && node.preview.exports.length > 0) {
        md.push('**Exports:**');
        md.push('```javascript');
        node.preview.exports.forEach(exp => md.push(exp));
        md.push('```\n');
      }

      if (node.preview.preview && node.preview.preview.length > 0) {
        md.push('**Preview:**');
        md.push('```javascript');
        node.preview.preview.forEach(line => md.push(line));
        md.push('```\n');
      }
    }
  }

  structure.children.forEach(child => {
    if (child.name === 'src') {
      renderFileDetails(child, 0);
    }
  });

  md.push('---\n');
  md.push('\n**🔄 Para atualizar:** `node check-estrutura.cjs`\n');

  return md.join('\n');
}

// ========================================
// 🚀 EXECUÇÃO PRINCIPAL
// ========================================

console.log('🔍 Analisando estrutura do projeto...\n');

try {
  const structure = {
    type: 'directory',
    name: path.basename(CONFIG.rootDir),
    path: '',
    children: scanDirectory(CONFIG.rootDir)
  };

  console.log('📊 Gerando estatísticas...\n');
  const stats = generateStats(structure);

  console.log('📝 Criando arquivo Markdown...\n');
  const markdown = generateMarkdown(structure, stats);

  const outputPath = path.join(CONFIG.rootDir, CONFIG.outputFile);
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log('✅ Análise concluída!\n');
  console.log(`📄 Arquivo gerado: ${CONFIG.outputFile}`);
  console.log(`📁 ${stats.totalDirs} diretórios`);
  console.log(`📄 ${stats.totalFiles} arquivos`);
  console.log(`⚛️ ${stats.componentFiles.length} componentes React`);
  console.log(`🎣 ${stats.hookFiles.length} hooks customizados\n`);

} catch (error) {
  console.error('❌ Erro ao analisar projeto:', error.message);
  process.exit(1);
}