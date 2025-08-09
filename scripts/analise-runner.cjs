
/**
 * 📁 ANALISADOR DE ESTRUTURA - SICEFSUS
 * Script para gerar análise completa da estrutura de pastas e arquivos
 * 
 * Uso: node scripts/analise-runner.cjs
 */

const fs = require('fs');
const path = require('path');

class AnalisadorEstrutura {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.outputFile = path.join(this.projectRoot, `analise-runner-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`);
    
    this.ignoredDirs = [
      'node_modules', 
      '.git', 
      'dist', 
      'build',
      '.cache',
      '.vscode',
      '.idea',
      'coverage',
      '.nyc_output'
    ];
    
    this.analysis = {
      totalFiles: 0,
      totalDirs: 0,
      filesByExtension: {},
      structure: {}
    };
  }

  // Método principal
  async run() {
    console.log('🔍 Analisando estrutura do projeto SICEFSUS...\n');

    try {
      this.analysis.structure = this.analyzeDirectory(this.projectRoot);
      const documentation = this.generateDocumentation();
      
      fs.writeFileSync(this.outputFile, documentation);

      console.log('\n✅ Análise da estrutura gerada com sucesso!');
      console.log(`📄 Arquivo: ${path.basename(this.outputFile)}`);
      console.log(`📁 ${this.analysis.totalDirs} diretórios analisados`);
      console.log(`📄 ${this.analysis.totalFiles} arquivos encontrados`);
      console.log(`📊 Tipos de arquivo encontrados: ${Object.keys(this.analysis.filesByExtension).length}`);

    } catch (error) {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    }
  }

  // Analisar diretório recursivamente
  analyzeDirectory(dirPath, relativePath = '') {
    const structure = {};

    try {
      const items = fs.readdirSync(dirPath);

      items.forEach(item => {
        // Pular arquivos/pastas ignorados
        if (this.shouldIgnore(item)) return;

        const itemPath = path.join(dirPath, item);
        const itemRelativePath = path.join(relativePath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          this.analysis.totalDirs++;
          structure[item] = this.analyzeDirectory(itemPath, itemRelativePath);
        } else {
          this.analysis.totalFiles++;
          
          const ext = path.extname(item).toLowerCase();
          this.analysis.filesByExtension[ext] = (this.analysis.filesByExtension[ext] || 0) + 1;

          structure[item] = {
            type: 'file',
            size: this.formatFileSize(stats.size),
            modified: stats.mtime,
            extension: ext,
            lines: this.countLines(itemPath),
            category: this.categorizeFile(item, itemRelativePath)
          };
        }
      });
    } catch (error) {
      console.warn(`⚠️ Erro ao analisar ${dirPath}: ${error.message}`);
    }

    return structure;
  }

  // Verificar se deve ignorar arquivo/pasta
  shouldIgnore(item) {
    // Ignorar pastas específicas
    if (this.ignoredDirs.includes(item)) return true;
    
    // Ignorar arquivos temporários e de backup
    if (item.startsWith('.') && !['.env', '.gitignore', '.replit'].includes(item)) return true;
    if (item.endsWith('.tmp') || item.endsWith('.log')) return true;
    if (item.includes('~')) return true;

    return false;
  }

  // Contar linhas do arquivo
  countLines(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }

  // Categorizar arquivo por tipo
  categorizeFile(fileName, relativePath) {
    const ext = path.extname(fileName).toLowerCase();
    
    // Categorias específicas por extensão
    const categories = {
      '.js': '💻 JavaScript',
      '.jsx': '⚛️ Componente React',
      '.ts': '💻 TypeScript',
      '.tsx': '⚛️ Componente React TypeScript',
      '.css': '🎨 Estilos CSS',
      '.scss': '🎨 Estilos SASS',
      '.json': '📦 Arquivo de configuração JSON',
      '.md': '📖 Documentação Markdown',
      '.html': '🌐 Página HTML',
      '.png': '🖼️ Imagem PNG',
      '.jpg': '🖼️ Imagem JPEG',
      '.jpeg': '🖼️ Imagem JPEG',
      '.svg': '🎨 Ícone SVG',
      '.env': '⚙️ Variáveis de ambiente',
      '.sh': '🔧 Script Shell',
      '.cjs': '💻 CommonJS',
      '.mjs': '💻 ES Module'
    };

    // Categorias específicas por nome
    if (fileName === 'package.json') return '📦 Configuração de dependências do projeto';
    if (fileName === 'vite.config.js') return '⚙️ Configuração do Vite';
    if (fileName === '.gitignore') return '🚫 Arquivos ignorados pelo Git';
    if (fileName === 'README.md') return '📋 Documentação principal';
    if (fileName.includes('firebase')) return '🔥 Configuração Firebase';

    // Categorias por localização
    if (relativePath.includes('components/')) return '🧩 Componente React';
    if (relativePath.includes('hooks/')) return '🎣 Hook React';
    if (relativePath.includes('services/')) return '🔧 Serviço';
    if (relativePath.includes('utils/')) return '🛠️ Utilitário';
    if (relativePath.includes('styles/')) return '🎨 Arquivo de estilo';
    if (relativePath.includes('context/')) return '🗂️ Contexto React';

    return categories[ext] || '📄 Arquivo';
  }

  // Formatar tamanho do arquivo
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // Gerar árvore de estrutura
  generateStructureTree(obj, prefix = '', isLast = true) {
    let result = '';
    const entries = Object.entries(obj);

    entries.forEach(([key, value], index) => {
      const isLastItem = index === entries.length - 1;
      const connector = isLastItem ? '└── ' : '├── ';
      const extension = isLastItem ? '    ' : '│   ';

      if (value.type === 'file') {
        result += `${prefix}${connector}📄 \`${key}\` *(${value.lines} linhas)*\n`;
        result += `${prefix}${extension}  - ${value.category}\n`;
      } else {
        result += `${prefix}${connector}📁 **${key}/**\n`;
        result += this.generateStructureTree(value, prefix + extension, isLastItem);
      }
    });

    return result;
  }

  // Gerar documentação
  generateDocumentation() {
    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    return `# 📁 ANÁLISE DE ESTRUTURA - SICEFSUS

**📅 Gerado em:** ${now}  
**🎯 Projeto:** Sistema de Controle de Execuções Financeiras do SUS  
**📊 Análise:** Estrutura completa de pastas e arquivos

---

## 📊 ESTATÍSTICAS GERAIS

- **📁 Total de Diretórios:** ${this.analysis.totalDirs}
- **📄 Total de Arquivos:** ${this.analysis.totalFiles}
- **📈 Tipos de Arquivo:** ${Object.keys(this.analysis.filesByExtension).length}

### Distribuição por Tipo de Arquivo

${Object.entries(this.analysis.filesByExtension)
  .sort((a, b) => b[1] - a[1])
  .map(([ext, count]) => `- **${ext || '(sem extensão)'}:** ${count} arquivo${count > 1 ? 's' : ''}`)
  .join('\n')}

---

## 📁 ESTRUTURA COMPLETA DO PROJETO

${this.generateStructureTree(this.analysis.structure)}

---

## 🔍 PRINCIPAIS DIRETÓRIOS

### 📁 **src/** - Código-fonte principal
- **components/**: Componentes React reutilizáveis
- **hooks/**: Hooks customizados do React
- **services/**: Serviços de integração (Firebase, APIs)
- **utils/**: Funções utilitárias e helpers
- **styles/**: Arquivos de estilo CSS
- **context/**: Contextos React para estado global
- **config/**: Arquivos de configuração

### 📁 **scripts/** - Scripts de automação
- Scripts para geração de documentação
- Utilitários de build e deploy

### 📁 **public/** - Arquivos públicos
- Assets estáticos servidos diretamente

---

## 🏗️ ARQUITETURA DE COMPONENTES

### 🧩 Componentes Principais
- **Dashboard.jsx**: Painel principal do sistema
- **Emendas.jsx**: Gestão de emendas parlamentares
- **Despesas.jsx**: Controle de despesas
- **Relatorios.jsx**: Geração de relatórios
- **Administracao.jsx**: Painel administrativo

### 🎣 Hooks Customizados
- **useDashboardData.js**: Dados do dashboard
- **useEmendaDespesa.js**: Gestão de emendas e despesas
- **useRelatoriosData.js**: Dados para relatórios

### 🔧 Serviços
- **emendasService.js**: Operações com emendas
- **userService.js**: Gestão de usuários
- **auditService.js**: Auditoria do sistema

---

## 📋 ARQUIVOS DE CONFIGURAÇÃO

| Arquivo | Propósito |
|---------|-----------|
| \`package.json\` | Dependências e scripts NPM |
| \`vite.config.js\` | Configuração do bundler Vite |
| \`switch-env.sh\` | Script para alternar ambientes |
| \`.env.*\` | Variáveis de ambiente |
| \`.gitignore\` | Arquivos ignorados pelo Git |

---

## 🚀 SCRIPTS DISPONÍVEIS

### Análise e Documentação
- \`node scripts/analise-runner.cjs\` - Gerar esta análise
- \`node scripts/generateHandover.cjs\` - Gerar documentação completa

### Desenvolvimento
- \`npm run dev\` - Servidor de desenvolvimento
- \`npm run build\` - Build para produção

### Gerenciamento de Ambiente
- \`./switch-env.sh dev\` - Ambiente de desenvolvimento
- \`./switch-env.sh prod\` - Ambiente de produção

---

## 📈 MÉTRICAS DE CÓDIGO

- **Maior arquivo:** ${this.getLargestFile()}
- **Pasta com mais arquivos:** ${this.getMostPopulatedFolder()}
- **Extensão mais comum:** ${this.getMostCommonExtension()}

---

**🔄 Para atualizar esta análise:** \`node scripts/analise-runner.cjs\`
`;
  }

  // Métodos para métricas
  getLargestFile() {
    let largest = { name: 'N/A', size: 0 };
    
    const findLargest = (obj, currentPath = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        if (value.type === 'file') {
          const sizeInBytes = this.parseSizeToBytes(value.size);
          if (sizeInBytes > largest.size) {
            largest = { name: path.join(currentPath, key), size: sizeInBytes, displaySize: value.size };
          }
        } else if (typeof value === 'object' && !value.type) {
          findLargest(value, path.join(currentPath, key));
        }
      });
    };

    findLargest(this.analysis.structure);
    return `${largest.name} (${largest.displaySize})`;
  }

  getMostPopulatedFolder() {
    let mostPopulated = { name: 'N/A', count: 0 };
    
    const countFiles = (obj, currentPath = '') => {
      let count = 0;
      Object.entries(obj).forEach(([key, value]) => {
        if (value.type === 'file') {
          count++;
        } else if (typeof value === 'object' && !value.type) {
          const subCount = countFiles(value, path.join(currentPath, key));
          if (subCount > mostPopulated.count) {
            mostPopulated = { name: path.join(currentPath, key), count: subCount };
          }
        }
      });
      return count;
    };

    countFiles(this.analysis.structure);
    return `${mostPopulated.name} (${mostPopulated.count} arquivos)`;
  }

  getMostCommonExtension() {
    const sorted = Object.entries(this.analysis.filesByExtension)
      .sort((a, b) => b[1] - a[1]);
    
    return sorted.length > 0 ? `${sorted[0][0]} (${sorted[0][1]} arquivos)` : 'N/A';
  }

  parseSizeToBytes(sizeStr) {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(bytes|KB|MB)$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'KB': return value * 1024;
      case 'MB': return value * 1024 * 1024;
      default: return value;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const analisador = new AnalisadorEstrutura();
  analisador.run();
}

module.exports = AnalisadorEstrutura;
