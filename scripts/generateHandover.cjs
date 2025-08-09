#!/usr/bin/env node

/**
 * 📋 GERADOR DE DOCUMENTAÇÃO - SICEFSUS
 * Script simplificado para gerar documentação do sistema
 * 
 * Uso: node scripts/generateHandover.js
 */

const fs = require('fs');
const path = require('path');

class HandoverGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.outputFile = path.join(this.projectRoot, 'HANDOVER_SICEFSUS.md');

    this.analysis = {
      structure: {},
      components: [],
      hooks: [],
      utils: [],
      services: [],
      environments: {
        dev: {},
        prod: {},
        current: null
      },
      dependencies: {},
      scripts: {},
      recentChanges: [],
      importantFiles: []
    };
  }

  // ===== MÉTODO PRINCIPAL =====
  async run() {
    console.log('🚀 Gerando documentação do SICEFSUS...\n');

    try {
      await this.analyzeEnvironments();
      await this.analyzeProjectStructure();
      await this.analyzePackageJson();
      await this.analyzeSrcFiles();
      await this.detectRecentChanges();
      await this.analyzeImportantFiles();

      const documentation = this.generateDocumentation();
      fs.writeFileSync(this.outputFile, documentation);

      console.log('\n✅ Documentação gerada com sucesso!');
      console.log(`📄 Arquivo: ${this.outputFile}`);
      console.log(`📊 ${this.analysis.components.length} componentes documentados`);
      console.log(`🎣 ${this.analysis.hooks.length} hooks documentados`);
      console.log(`🛠️ ${this.analysis.utils.length} utilitários documentados`);
      console.log(`🔧 ${this.analysis.services.length} serviços documentados`);

    } catch (error) {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    }
  }

  // ===== ANÁLISE DE AMBIENTES =====
  analyzeEnvironments() {
    console.log('🔍 Analisando ambientes...');

    // Verificar .env atual
    const envPath = path.join(this.projectRoot, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');

      if (envContent.includes('emendas-parlamentares-60dbd')) {
        this.analysis.environments.current = 'development';
      } else if (envContent.includes('emendas-parlamentares-prod')) {
        this.analysis.environments.current = 'production';
      }
    }

    // Verificar arquivos de ambiente
    const envFiles = ['.env', '.env.development', '.env.production'];
    envFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const projectId = content.match(/VITE_FIREBASE_PROJECT_ID=([^\n\r]*)/);

        if (file === '.env.development') {
          this.analysis.environments.dev = {
            exists: true,
            projectId: projectId ? projectId[1] : 'não encontrado'
          };
        } else if (file === '.env.production') {
          this.analysis.environments.prod = {
            exists: true,
            projectId: projectId ? projectId[1] : 'não encontrado'
          };
        }
      }
    });

    // Verificar script switch-env.sh
    const switchEnvPath = path.join(this.projectRoot, 'switch-env.sh');
    this.analysis.environments.switchScript = fs.existsSync(switchEnvPath);
  }

  // ===== ANÁLISE DA ESTRUTURA =====
  analyzeProjectStructure() {
    console.log('📁 Analisando estrutura do projeto...');

    const analyzeDir = (dirPath, ignore = ['node_modules', '.git', 'dist', '.cache']) => {
      const structure = {};

      try {
        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
          if (ignore.includes(item) || item.startsWith('.')) return;

          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);

          if (stats.isDirectory()) {
            structure[item] = analyzeDir(itemPath);
          } else {
            // Incluir apenas arquivos relevantes
            const ext = path.extname(item);
            if (['.js', '.jsx', '.json', '.md', '.sh', '.env'].includes(ext) ||
              ['package.json', 'vite.config.js', '.gitignore'].includes(item)) {
              structure[item] = {
                type: 'file',
                size: this.formatFileSize(stats.size),
                modified: stats.mtime
              };
            }
          }
        });
      } catch (error) {
        console.warn(`⚠️ Erro ao analisar ${dirPath}: ${error.message}`);
      }

      return structure;
    };

    this.analysis.structure = analyzeDir(this.projectRoot);
  }

  // ===== ANÁLISE DO PACKAGE.JSON =====
  analyzePackageJson() {
    console.log('📦 Analisando package.json...');

    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // Dependências principais
      this.analysis.dependencies = {
        react: packageData.dependencies?.react || 'não encontrado',
        'react-router-dom': packageData.dependencies?.['react-router-dom'] || 'não encontrado',
        firebase: packageData.dependencies?.firebase || 'não encontrado',
        vite: packageData.devDependencies?.vite || 'não encontrado'
      };

      // Scripts importantes
      this.analysis.scripts = {
        dev: packageData.scripts?.dev || 'não encontrado',
        build: packageData.scripts?.build || 'não encontrado',
        'build:dev': packageData.scripts?.['build:dev'] || 'não encontrado',
        'build:prod': packageData.scripts?.['build:prod'] || 'não encontrado',
        preview: packageData.scripts?.preview || 'não encontrado'
      };
    }
  }

  // ===== ANÁLISE DOS ARQUIVOS SRC =====
  analyzeSrcFiles() {
    console.log('🔍 Analisando arquivos do código-fonte...');

    const srcPath = path.join(this.projectRoot, 'src');

    // Analisar componentes
    this.analyzeDirectory(path.join(srcPath, 'components'), 'components');

    // Analisar hooks
    this.analyzeDirectory(path.join(srcPath, 'hooks'), 'hooks');

    // Analisar utils
    this.analyzeDirectory(path.join(srcPath, 'utils'), 'utils');

    // Analisar services
    this.analyzeDirectory(path.join(srcPath, 'services'), 'services');
  }

  // ===== ANALISAR DIRETÓRIO ESPECÍFICO =====
  analyzeDirectory(dirPath, type) {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️ Pasta ${type} não encontrada`);
      return;
    }

    const files = this.getAllFiles(dirPath);

    files.forEach(file => {
      const relativePath = path.relative(this.projectRoot, file);
      const content = fs.readFileSync(file, 'utf8');
      const stats = fs.statSync(file);

      const fileInfo = {
        name: path.basename(file),
        path: relativePath,
        size: this.formatFileSize(stats.size),
        modified: stats.mtime,
        description: this.extractDescription(content),
        exports: this.extractExports(content),
        dependencies: this.extractImports(content)
      };

      this.analysis[type].push(fileInfo);
    });
  }

  // ===== DETECTAR MUDANÇAS RECENTES =====
  detectRecentChanges() {
    console.log('🔍 Detectando mudanças recentes...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Verificar todos os arquivos analisados
    const allFiles = [
      ...this.analysis.components,
      ...this.analysis.hooks,
      ...this.analysis.utils,
      ...this.analysis.services
    ];

    this.analysis.recentChanges = allFiles
      .filter(file => new Date(file.modified) > sevenDaysAgo)
      .map(file => ({
        path: file.path,
        modified: file.modified,
        type: this.getFileType(file.path)
      }))
      .sort((a, b) => new Date(b.modified) - new Date(a.modified));
  }

  // ===== ANALISAR ARQUIVOS IMPORTANTES =====
  analyzeImportantFiles() {
    console.log('📋 Identificando arquivos importantes...');

    const importantFiles = [
      'vite.config.js',
      'switch-env.sh',
      '.gitignore',
      'README.md',
      'firebase.json',
      'firestore.rules',
      'firestore.indexes.json'
    ];

    importantFiles.forEach(fileName => {
      const filePath = path.join(this.projectRoot, fileName);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        this.analysis.importantFiles.push({
          name: fileName,
          path: fileName,
          size: this.formatFileSize(stats.size),
          modified: stats.mtime,
          purpose: this.getFilePurpose(fileName)
        });
      }
    });
  }

  // ===== MÉTODOS AUXILIARES =====

  getAllFiles(dirPath, files = []) {
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.getAllFiles(itemPath, files);
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        files.push(itemPath);
      }
    });

    return files;
  }

  extractDescription(content) {
    // Procurar por comentários no início do arquivo
    const match = content.match(/^\/\*\*([\s\S]*?)\*\/|^\/\/\s*(.+)/);
    if (match) {
      return (match[1] || match[2]).trim().split('\n')[0];
    }

    // Procurar por comentários antes de exports
    const exportMatch = content.match(/\/\/\s*(.+)\s*\nexport/);
    if (exportMatch) {
      return exportMatch[1].trim();
    }

    return 'Sem descrição';
  }

  extractExports(content) {
    const exports = [];

    // Export default
    if (content.includes('export default')) {
      exports.push('default');
    }

    // Named exports
    const namedExports = content.match(/export\s+(?:const|function|class)\s+(\w+)/g);
    if (namedExports) {
      namedExports.forEach(exp => {
        const name = exp.match(/(\w+)$/);
        if (name) exports.push(name[1]);
      });
    }

    return exports;
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      // Incluir apenas imports relevantes (não node_modules)
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        imports.push(importPath);
      } else if (['react', 'firebase', 'react-router-dom'].some(lib => importPath.includes(lib))) {
        imports.push(importPath);
      }
    }

    return [...new Set(imports)];
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getFileType(filePath) {
    if (filePath.includes('components/')) return 'Componente';
    if (filePath.includes('hooks/')) return 'Hook';
    if (filePath.includes('utils/')) return 'Utilitário';
    if (filePath.includes('services/')) return 'Serviço';
    return 'Outro';
  }

  getFilePurpose(fileName) {
    const purposes = {
      'vite.config.js': 'Configuração do build e desenvolvimento',
      'switch-env.sh': 'Script para alternar entre ambientes dev/prod',
      '.gitignore': 'Arquivos ignorados pelo Git',
      'README.md': 'Documentação principal do projeto',
      'firebase.json': 'Configuração do Firebase',
      'firestore.rules': 'Regras de segurança do Firestore',
      'firestore.indexes.json': 'Índices do banco de dados'
    };

    return purposes[fileName] || 'Arquivo de configuração';
  }

  // ===== GERAR DOCUMENTAÇÃO =====
  generateDocumentation() {
    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    return `# 📋 DOCUMENTAÇÃO - Sistema SICEFSUS

**📅 Gerado em:** ${now}  
**🔧 Ambiente atual:** ${this.analysis.environments.current || 'não identificado'}  
**🌐 URL Produção:** https://sicefsus.replit.app/

---

## 🎯 SOBRE O SISTEMA

O **SICEFSUS** (Sistema de Controle de Execuções Financeiras do SUS) é uma aplicação web para gestão de emendas parlamentares do SUS, permitindo controle de despesas, relatórios e administração de usuários.

---

## 🔄 AMBIENTES E DEPLOY

### Configuração de Ambientes

**Ambiente Atual:** ${this.analysis.environments.current === 'production' ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO'}

| Ambiente | Project ID | Status |
|----------|------------|--------|
| Desenvolvimento | ${this.analysis.environments.dev.projectId || 'não configurado'} | ${this.analysis.environments.dev.exists ? '✅' : '❌'} |
| Produção | ${this.analysis.environments.prod.projectId || 'não configurado'} | ${this.analysis.environments.prod.exists ? '✅' : '❌'} |

**Script de Troca:** ${this.analysis.environments.switchScript ? '✅ switch-env.sh disponível' : '❌ switch-env.sh não encontrado'}

### Comandos de Deploy

\`\`\`bash
# Desenvolvimento
./switch-env.sh dev
npm run dev

# Produção
./switch-env.sh prod
npm run build:prod
# Clicar em "Redeploy" no Replit

# Voltar para dev
./switch-env.sh dev
\`\`\`

---

## 📁 ESTRUTURA DO PROJETO

${this.generateStructureTree(this.analysis.structure)}

---

## 🛠️ TECNOLOGIAS E DEPENDÊNCIAS

### Principais
- **React:** ${this.analysis.dependencies.react}
- **React Router:** ${this.analysis.dependencies['react-router-dom']}
- **Firebase:** ${this.analysis.dependencies.firebase}
- **Vite:** ${this.analysis.dependencies.vite}

### Scripts NPM
${Object.entries(this.analysis.scripts).map(([name, cmd]) => `- **npm run ${name}:** \`${cmd}\``).join('\n')}

---

## 📄 ARQUIVOS DO SISTEMA

### 🧩 Componentes (${this.analysis.components.length})

${this.analysis.components.map(comp => `#### \`${comp.path}\`
- **Descrição:** ${comp.description}
- **Tamanho:** ${comp.size}
- **Exports:** ${comp.exports.join(', ') || 'nenhum'}
`).join('\n')}

### 🎣 Hooks (${this.analysis.hooks.length})

${this.analysis.hooks.map(hook => `#### \`${hook.path}\`
- **Descrição:** ${hook.description}
- **Tamanho:** ${hook.size}
`).join('\n')}

### 🛠️ Utilitários (${this.analysis.utils.length})

${this.analysis.utils.map(util => `#### \`${util.path}\`
- **Descrição:** ${util.description}
- **Tamanho:** ${util.size}
`).join('\n')}

### 🔧 Serviços (${this.analysis.services.length})

${this.analysis.services.map(service => `#### \`${service.path}\`
- **Descrição:** ${service.description}
- **Tamanho:** ${service.size}
`).join('\n')}

---

## 📋 ARQUIVOS IMPORTANTES

${this.analysis.importantFiles.map(file => `### ${file.name}
- **Propósito:** ${file.purpose}
- **Tamanho:** ${file.size}
- **Modificado:** ${new Date(file.modified).toLocaleDateString('pt-BR')}
`).join('\n')}

---

## 🔄 MUDANÇAS RECENTES (Últimos 7 dias)

${this.analysis.recentChanges.length > 0 ?
        this.analysis.recentChanges.map(change =>
          `- \`${change.path}\` (${change.type}) - ${new Date(change.modified).toLocaleDateString('pt-BR')}`
        ).join('\n') :
        '✅ Nenhuma mudança nos últimos 7 dias'}

---

## 🚀 GUIA RÁPIDO

### Para Desenvolver
1. \`./switch-env.sh dev\` - Mudar para desenvolvimento
2. \`npm run dev\` - Iniciar servidor local
3. Fazer alterações
4. Testar no navegador

### Para Deploy
1. \`./switch-env.sh prod\` - Mudar para produção
2. \`npm run build:prod\` - Gerar build
3. Clicar em "Redeploy" no Replit
4. \`./switch-env.sh dev\` - Voltar para dev

### URLs
- **Desenvolvimento:** http://localhost:5173
- **Produção:** https://sicefsus.replit.app/

---

## 📊 ESTATÍSTICAS

- **Total de Componentes:** ${this.analysis.components.length}
- **Total de Hooks:** ${this.analysis.hooks.length}
- **Total de Utilitários:** ${this.analysis.utils.length}
- **Total de Serviços:** ${this.analysis.services.length}
- **Arquivos Importantes:** ${this.analysis.importantFiles.length}
- **Mudanças Recentes:** ${this.analysis.recentChanges.length}

---

**🔄 Para atualizar esta documentação:** \`node scripts/generateHandover.js\`
`;
  }

  generateStructureTree(obj, prefix = '', isLast = true) {
    let result = '';
    const entries = Object.entries(obj);

    entries.forEach(([key, value], index) => {
      const isLastItem = index === entries.length - 1;
      const connector = isLastItem ? '└── ' : '├── ';
      const extension = isLastItem ? '    ' : '│   ';

      if (value.type === 'file') {
        result += `${prefix}${connector}${key} (${value.size})\n`;
      } else {
        result += `${prefix}${connector}${key}/\n`;
        result += this.generateStructureTree(value, prefix + extension, isLastItem);
      }
    });

    return result;
  }
}

// ===== EXECUTAR =====
if (require.main === module) {
  const generator = new HandoverGenerator();
  generator.run();
}

module.exports = HandoverGenerator;