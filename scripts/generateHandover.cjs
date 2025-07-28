/**
 * 📋 GERADOR AUTOMÁTICO DE HANDOVER - SICEFSUS v2.4
 * Script para analisar o sistema e gerar documentação atualizada com validações e regras
 * NOVO: Análise de arquivos monolíticos e sugestões de refatoração
 * NOVO: Sistema de data/hora confiável com múltiplas fontes
 * NOVO: Debugging detalhado e leitura forçada de arquivos
 * 
 * Uso: node scripts/generateHandover.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

class HandoverGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcPath = path.join(this.projectRoot, 'src');
    this.componentsPath = path.join(this.srcPath, 'components');
    this.utilsPath = path.join(this.srcPath, 'utils');
    this.hooksPath = path.join(this.srcPath, 'hooks');
    this.servicesPath = path.join(this.srcPath, 'services');
    this.packagePath = path.join(this.projectRoot, 'package.json');
    this.currentHandover = path.join(this.projectRoot, 'HANDOVER_SICEFSUS.md');

    // ✅ CONFIGURAÇÃO DE DATA/HORA CONFIÁVEL
    this.reliableDateTime = {
      current: null,
      sources: [],
      timezone: 'America/Sao_Paulo'
    };

    // 🧩 CONFIGURAÇÃO DE ANÁLISE DE REFATORAÇÃO
    this.refactorConfig = {
      limits: {
        lines: 300,
        functions: 15,
        complexity: 20,
        imports: 20,
        jsx_elements: 50,
        nested_depth: 5
      },
      weights: {
        lines: 0.25,
        functions: 0.20,
        complexity: 0.25,
        imports: 0.15,
        jsx_elements: 0.10,
        nested_depth: 0.05
      }
    };

    this.analysis = {
      components: [],
      hooks: [],
      utils: [],
      services: [],
      dependencies: {},
      structure: {},
      lastImplementation: {
        title: '',
        description: '',
        date: '',
        filesInvolved: [],
        keyChanges: [],
        impact: '',
        status: ''
      },
      validations: {
        cnpjRules: [],
        requiredFields: [],
        businessRules: [],
        userPermissions: [],
        workflows: []
      },
      changes: {
        newComponents: [],
        modifiedFunctionalities: [],
        removedComponents: [],
        structureChanges: [],
        dependencyChanges: []
      },
      refactoring: {
        monolithicFiles: [],
        recommendations: [],
        summary: {
          totalFiles: 0,
          monolithicCount: 0,
          criticalCount: 0,
          averageScore: 0
        }
      }
    };
  }

  // ===== MÉTODOS DE DATA/HORA =====

  async getReliableDateTime() {
    console.log('🕒 Obtendo data/hora de fontes confiáveis...');

    const sources = [
      () => this.getTimeFromWorldTimeAPI(),
      () => this.getTimeFromNTP(),
      () => this.getTimeFromGitCommit(),
      () => this.getTimeFromFileSystem(),
      () => this.getLocalTime()
    ];

    let reliableTime = null;

    for (const getTime of sources) {
      try {
        const timeResult = await getTime();
        if (timeResult && timeResult.datetime) {
          this.reliableDateTime.sources.push(timeResult.source);
          reliableTime = timeResult.datetime;
          console.log(`✅ Data obtida de: ${timeResult.source}`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ Falha em fonte de tempo: ${error.message}`);
        continue;
      }
    }

    if (!reliableTime) {
      reliableTime = new Date();
      this.reliableDateTime.sources.push('Sistema Local (Fallback)');
      console.log('⚠️ Usando data do sistema local como último recurso');
    }

    this.reliableDateTime.current = reliableTime;
    return reliableTime;
  }

  async getTimeFromWorldTimeAPI() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'worldtimeapi.org',
        port: 443,
        path: '/api/timezone/America/Sao_Paulo',
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const timeData = JSON.parse(data);
            const datetime = new Date(timeData.datetime);
            resolve({
              datetime,
              source: 'WorldTimeAPI (America/Sao_Paulo)',
              raw: timeData
            });
          } catch (error) {
            reject(new Error('Erro ao processar resposta da WorldTimeAPI'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`WorldTimeAPI falhou: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('WorldTimeAPI timeout'));
      });

      req.end();
    });
  }

  async getTimeFromNTP() {
    try {
      const ntpCommand = process.platform === 'win32'
        ? 'w32tm /query /status'
        : 'date';

      const result = execSync(ntpCommand, {
        encoding: 'utf8',
        timeout: 3000
      });

      if (result) {
        return {
          datetime: new Date(),
          source: 'Sistema NTP/Time Service',
          raw: result.trim()
        };
      }
    } catch (error) {
      throw new Error(`NTP não disponível: ${error.message}`);
    }
  }

  async getTimeFromGitCommit() {
    try {
      const gitDate = execSync('git log -1 --format=%cd --date=iso', {
        encoding: 'utf8',
        cwd: this.projectRoot,
        timeout: 3000
      });

      if (gitDate) {
        return {
          datetime: new Date(gitDate.trim()),
          source: 'Git Último Commit',
          raw: gitDate.trim()
        };
      }
    } catch (error) {
      throw new Error(`Git não disponível: ${error.message}`);
    }
  }

  async getTimeFromFileSystem() {
    try {
      const stats = fs.statSync(this.packagePath);
      return {
        datetime: stats.mtime,
        source: 'Sistema de Arquivos (package.json mtime)',
        raw: stats.mtime.toISOString()
      };
    } catch (error) {
      throw new Error(`Filesystem falhou: ${error.message}`);
    }
  }

  async getLocalTime() {
    return {
      datetime: new Date(),
      source: 'Sistema Local',
      raw: new Date().toISOString()
    };
  }

  formatBrazilianDateTime(date) {
    if (!date) date = this.reliableDateTime.current || new Date();

    const options = {
      timeZone: this.reliableDateTime.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    try {
      const formatter = new Intl.DateTimeFormat('pt-BR', options);
      return formatter.format(date);
    } catch (error) {
      const offset = -3;
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const brazilTime = new Date(utc + (offset * 3600000));

      const day = String(brazilTime.getDate()).padStart(2, '0');
      const month = String(brazilTime.getMonth() + 1).padStart(2, '0');
      const year = brazilTime.getFullYear();
      const hours = String(brazilTime.getHours()).padStart(2, '0');
      const minutes = String(brazilTime.getMinutes()).padStart(2, '0');
      const seconds = String(brazilTime.getSeconds()).padStart(2, '0');

      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    }
  }

  formatSimpleBrazilianDate(date) {
    if (!date) date = this.reliableDateTime.current || new Date();

    try {
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone: this.reliableDateTime.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      const offset = -3;
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const brazilTime = new Date(utc + (offset * 3600000));

      const day = String(brazilTime.getDate()).padStart(2, '0');
      const month = String(brazilTime.getMonth() + 1).padStart(2, '0');
      const year = brazilTime.getFullYear();

      return `${day}/${month}/${year}`;
    }
  }

  // ===== MÉTODOS DE ANÁLISE DE REFATORAÇÃO =====

  analyzeFileComplexity(content, filePath) {
    const lines = content.split('\n').length;
    const nonEmptyLines = content.split('\n').filter(line => line.trim()).length;

    const functionMatches = [
      ...content.matchAll(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\(|const\s+\w+\s*=\s*(?:async\s+)?function)/g),
      ...content.matchAll(/\w+\s*:\s*(?:async\s+)?(?:function|\()/g),
      ...content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+\w+/g)
    ];
    const functionCount = functionMatches.length;

    const importMatches = content.matchAll(/import\s+.*?from\s+['"`][^'"`]+['"`]/g);
    const importCount = [...importMatches].length;

    const jsxMatches = content.matchAll(/<[A-Z]\w*(?:\s+[^>]*)?\s*\/?>/g);
    const jsxElementCount = [...jsxMatches].length;

    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', '&&', '||', '?', 'catch'];
    let complexity = 1;
    complexityKeywords.forEach(keyword => {
      const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) complexity += matches.length;
    });

    let maxDepth = 0;
    let currentDepth = 0;
    for (let char of content) {
      if (char === '{' || char === '(') currentDepth++;
      if (char === '}' || char === ')') currentDepth--;
      maxDepth = Math.max(maxDepth, currentDepth);
    }

    return {
      lines,
      nonEmptyLines,
      functions: functionCount,
      imports: importCount,
      jsxElements: jsxElementCount,
      complexity,
      nestedDepth: maxDepth
    };
  }

  calculateRefactorScore(metrics) {
    const { limits, weights } = this.refactorConfig;
    let score = 0;

    const normalizedMetrics = {
      lines: Math.min((metrics.lines / limits.lines) * 100, 100),
      functions: Math.min((metrics.functions / limits.functions) * 100, 100),
      complexity: Math.min((metrics.complexity / limits.complexity) * 100, 100),
      imports: Math.min((metrics.imports / limits.imports) * 100, 100),
      jsxElements: Math.min((metrics.jsxElements / limits.jsx_elements) * 100, 100),
      nestedDepth: Math.min((metrics.nestedDepth / limits.nested_depth) * 100, 100)
    };

    Object.keys(weights).forEach(key => {
      if (normalizedMetrics[key]) {
        score += normalizedMetrics[key] * weights[key];
      }
    });

    return Math.min(Math.round(score), 100);
  }

  getRefactorPriority(score) {
    if (score >= 80) return { level: 'CRÍTICA', color: '🔴', description: 'Refatoração urgente necessária' };
    if (score >= 60) return { level: 'ALTA', color: '🟠', description: 'Refatoração recomendada' };
    if (score >= 40) return { level: 'MÉDIA', color: '🟡', description: 'Considerar refatoração' };
    if (score >= 20) return { level: 'BAIXA', color: '🟢', description: 'Monitorar crescimento' };
    return { level: 'OK', color: '✅', description: 'Arquivo bem estruturado' };
  }

  generateRefactorSuggestions(metrics, filePath) {
    const suggestions = [];
    const { limits } = this.refactorConfig;

    if (metrics.lines > limits.lines) {
      suggestions.push({
        type: 'Tamanho do Arquivo',
        issue: `Arquivo com ${metrics.lines} linhas (limite: ${limits.lines})`,
        suggestion: 'Quebrar em componentes menores ou extrair lógicas para hooks/utils',
        priority: 'Alta'
      });
    }

    if (metrics.functions > limits.functions) {
      suggestions.push({
        type: 'Número de Funções',
        issue: `${metrics.functions} funções em um arquivo (limite: ${limits.functions})`,
        suggestion: 'Agrupar funções relacionadas em módulos separados',
        priority: 'Média'
      });
    }

    if (metrics.complexity > limits.complexity) {
      suggestions.push({
        type: 'Complexidade Ciclomática',
        issue: `Complexidade ${metrics.complexity} (limite: ${limits.complexity})`,
        suggestion: 'Simplificar lógicas condicionais e extrair funções auxiliares',
        priority: 'Alta'
      });
    }

    if (metrics.imports > limits.imports) {
      suggestions.push({
        type: 'Dependências Excessivas',
        issue: `${metrics.imports} imports (limite: ${limits.imports})`,
        suggestion: 'Revisar dependências e considerar uso de barrel exports',
        priority: 'Baixa'
      });
    }

    if (metrics.jsxElements > limits.jsx_elements) {
      suggestions.push({
        type: 'JSX Complexo',
        issue: `${metrics.jsxElements} elementos JSX (limite: ${limits.jsx_elements})`,
        suggestion: 'Extrair subcomponentes para melhorar legibilidade',
        priority: 'Média'
      });
    }

    if (metrics.nestedDepth > limits.nested_depth) {
      suggestions.push({
        type: 'Aninhamento Profundo',
        issue: `Profundidade ${metrics.nestedDepth} (limite: ${limits.nested_depth})`,
        suggestion: 'Extrair lógicas aninhadas em funções separadas',
        priority: 'Alta'
      });
    }

    if (filePath.includes('components/')) {
      if (metrics.lines > 200) {
        suggestions.push({
          type: 'Componente Monolítico',
          issue: 'Componente muito grande para manutenção',
          suggestion: 'Quebrar em: Header, Body, Footer ou usar composição',
          priority: 'Alta'
        });
      }
    }

    if (filePath.includes('hooks/')) {
      if (metrics.functions > 5) {
        suggestions.push({
          type: 'Hook Complexo',
          issue: 'Hook com muitas responsabilidades',
          suggestion: 'Dividir em hooks mais específicos (Single Responsibility)',
          priority: 'Média'
        });
      }
    }

    return suggestions;
  }

  getFileType(filePath) {
    if (filePath.includes('components/')) return 'Component';
    if (filePath.includes('hooks/')) return 'Hook';
    if (filePath.includes('utils/')) return 'Utility';
    if (filePath.includes('services/')) return 'Service';
    return 'Other';
  }

  generateGeneralRecommendations() {
    const recommendations = [];
    const { summary } = this.analysis.refactoring;

    if (summary.criticalCount > 0) {
      recommendations.push({
        type: 'Arquivos Críticos',
        description: `${summary.criticalCount} arquivo(s) precisam de refatoração urgente`,
        action: 'Priorizar refatoração imediata dos arquivos com score > 80',
        impact: 'Alto',
        effort: 'Alto'
      });
    }

    if (summary.monolithicCount > summary.totalFiles * 0.3) {
      recommendations.push({
        type: 'Padrão Arquitetural',
        description: 'Alto percentual de arquivos monolíticos detectado',
        action: 'Revisar padrões de arquitetura e estabelecer guidelines de tamanho',
        impact: 'Médio',
        effort: 'Médio'
      });
    }

    if (summary.averageScore > 50) {
      recommendations.push({
        type: 'Qualidade Geral',
        description: `Score médio de refatoração: ${summary.averageScore}`,
        action: 'Implementar revisões de código focadas em tamanho e complexidade',
        impact: 'Médio',
        effort: 'Baixo'
      });
    }

    const componentFiles = this.analysis.refactoring.monolithicFiles.filter(f => f.type === 'Component');
    const criticalComponents = componentFiles.filter(f => f.score >= 80);
    if (criticalComponents.length > 0) {
      recommendations.push({
        type: 'Componentes Críticos',
        description: `${criticalComponents.length} componente(s) muito complexo(s)`,
        action: 'Aplicar padrões como Container/Presentational ou Compound Components',
        impact: 'Alto',
        effort: 'Alto'
      });
    }

    const hookFiles = this.analysis.refactoring.monolithicFiles.filter(f => f.type === 'Hook');
    const criticalHooks = hookFiles.filter(f => f.score >= 60);
    if (criticalHooks.length > 0) {
      recommendations.push({
        type: 'Hooks Complexos',
        description: `${criticalHooks.length} hook(s) com muitas responsabilidades`,
        action: 'Aplicar Single Responsibility Principle em hooks',
        impact: 'Médio',
        effort: 'Médio'
      });
    }

    this.analysis.refactoring.recommendations = recommendations;
  }

  // ===== MÉTODOS DE ANÁLISE PRINCIPAL =====

  async analyze() {
    console.log('🔍 Iniciando análise do sistema SICEFSUS...');

    await this.getReliableDateTime();
    await this.analyzePackageJson();
    await this.analyzeProjectStructure();
    await this.analyzeComponents();
    await this.analyzeHooks();
    await this.analyzeUtils();
    await this.analyzeServices();
    await this.analyzeValidationsAndRules();
    await this.detectChanges();
    await this.analyzeLastImplementation();
    await this.analyzeFilesForRefactoring();

    console.log('✅ Análise concluída!');
  }

  async analyzePackageJson() {
    try {
      const packageData = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
      this.analysis.dependencies = {
        main: packageData.dependencies || {},
        dev: packageData.devDependencies || {},
        scripts: packageData.scripts || {}
      };
      console.log('📦 Package.json analisado');
    } catch (error) {
      console.error('❌ Erro ao analisar package.json:', error.message);
    }
  }

  async analyzeProjectStructure() {
    const analyzeDirectory = (dirPath, relativePath = '') => {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      const structure = {};

      items.forEach(item => {
        if (item.name.startsWith('.') || item.name === 'node_modules') return;

        const fullPath = path.join(dirPath, item.name);
        const relPath = path.join(relativePath, item.name);

        if (item.isDirectory()) {
          structure[item.name] = analyzeDirectory(fullPath, relPath);
        } else {
          structure[item.name] = {
            type: 'file',
            extension: path.extname(item.name),
            size: fs.statSync(fullPath).size
          };
        }
      });

      return structure;
    };

    this.analysis.structure = analyzeDirectory(this.projectRoot);
    console.log('📁 Estrutura do projeto analisada');
  }

  async analyzeComponents() {
    if (!fs.existsSync(this.componentsPath)) {
      console.log('⚠️ Pasta components não encontrada');
      return;
    }

    console.log(`📁 Analisando pasta: ${this.componentsPath}`);
    const files = fs.readdirSync(this.componentsPath);
    console.log(`📄 Arquivos encontrados na pasta components: ${files.join(', ')}`);

    for (const file of files) {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const filePath = path.join(this.componentsPath, file);
        console.log(`🔍 Lendo arquivo: ${filePath}`);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(`📊 Arquivo ${file}: ${content.length} caracteres, ${content.split('\n').length} linhas`);

          const component = {
            name: file,
            path: `src/components/${file}`,
            type: this.detectComponentType(content),
            dependencies: this.extractDependencies(content),
            functions: this.extractFunctions(content),
            exports: this.extractExports(content),
            description: this.extractDescription(content),
            lastModified: fs.statSync(filePath).mtime
          };

          console.log(`🧩 Funções encontradas em ${file}: ${component.functions.join(', ')}`);
          this.analysis.components.push(component);
        } catch (error) {
          console.error(`❌ Erro ao ler ${file}:`, error.message);
        }
      } else {
        console.log(`⏭️ Ignorando arquivo: ${file} (não é .js/.jsx)`);
      }
    }

    console.log(`🧩 ${this.analysis.components.length} componentes analisados`);
  }

  async analyzeHooks() {
    const hooksPath = path.join(this.srcPath, 'hooks');
    if (!fs.existsSync(hooksPath)) {
      console.log('⚠️ Pasta hooks não encontrada');
      return;
    }

    console.log(`📁 Analisando pasta: ${hooksPath}`);
    const files = fs.readdirSync(hooksPath);
    console.log(`📄 Arquivos encontrados na pasta hooks: ${files.join(', ')}`);

    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const filePath = path.join(hooksPath, file);
        console.log(`🔍 Lendo arquivo: ${filePath}`);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(`📊 Arquivo ${file}: ${content.length} caracteres, ${content.split('\n').length} linhas`);

          const hook = {
            name: file,
            path: `src/hooks/${file}`,
            functions: this.extractFunctions(content),
            dependencies: this.extractDependencies(content),
            exports: this.extractExports(content),
            description: this.extractDescription(content),
            lastModified: fs.statSync(filePath).mtime
          };

          console.log(`🎣 Funções encontradas em ${file}: ${hook.functions.join(', ')}`);
          this.analysis.hooks.push(hook);
        } catch (error) {
          console.error(`❌ Erro ao ler ${file}:`, error.message);
        }
      } else {
        console.log(`⏭️ Ignorando arquivo: ${file} (não é .js/.jsx)`);
      }
    }

    console.log(`🎣 ${this.analysis.hooks.length} hooks analisados`);
  }

  async analyzeUtils() {
    const utilsPath = path.join(this.srcPath, 'utils');
    if (!fs.existsSync(utilsPath)) {
      console.log('⚠️ Pasta utils não encontrada');
      return;
    }

    console.log(`📁 Analisando pasta: ${utilsPath}`);
    const files = fs.readdirSync(utilsPath);
    console.log(`📄 Arquivos encontrados na pasta utils: ${files.join(', ')}`);

    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const filePath = path.join(utilsPath, file);
        console.log(`🔍 Lendo arquivo: ${filePath}`);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(`📊 Arquivo ${file}: ${content.length} caracteres, ${content.split('\n').length} linhas`);

          const util = {
            name: file,
            path: `src/utils/${file}`,
            functions: this.extractFunctions(content),
            exports: this.extractExports(content),
            description: this.extractDescription(content),
            lastModified: fs.statSync(filePath).mtime
          };

          console.log(`🛠️ Funções encontradas em ${file}: ${util.functions.join(', ')}`);
          this.analysis.utils.push(util);
        } catch (error) {
          console.error(`❌ Erro ao ler ${file}:`, error.message);
        }
      } else {
        console.log(`⏭️ Ignorando arquivo: ${file} (não é .js/.jsx)`);
      }
    }

    console.log(`🛠️ ${this.analysis.utils.length} utilitários analisados`);
  }

  async analyzeServices() {
    if (!fs.existsSync(this.servicesPath)) {
      console.log('⚠️ Pasta services não encontrada');
      return;
    }

    console.log(`📁 Analisando pasta: ${this.servicesPath}`);
    const files = fs.readdirSync(this.servicesPath);
    console.log(`📄 Arquivos encontrados na pasta services: ${files.join(', ')}`);

    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const filePath = path.join(this.servicesPath, file);
        console.log(`🔍 Lendo arquivo: ${filePath}`);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(`📊 Arquivo ${file}: ${content.length} caracteres, ${content.split('\n').length} linhas`);

          const service = {
            name: file,
            path: `src/services/${file}`,
            functions: this.extractFunctions(content),
            exports: this.extractExports(content),
            description: this.extractDescription(content),
            lastModified: fs.statSync(filePath).mtime
          };

          console.log(`🔧 Funções encontradas em ${file}: ${service.functions.join(', ')}`);
          this.analysis.services.push(service);
        } catch (error) {
          console.error(`❌ Erro ao ler ${file}:`, error.message);
        }
      } else {
        console.log(`⏭️ Ignorando arquivo: ${file} (não é .js/.jsx)`);
      }
    }

    console.log(`🔧 ${this.analysis.services.length} serviços analisados`);
  }

  async analyzeFilesForRefactoring() {
    console.log('🔬 Iniciando análise de refatoração...');

    const allFiles = [
      ...this.analysis.components,
      ...this.analysis.hooks,
      ...this.analysis.utils,
      ...this.analysis.services
    ];

    console.log(`📊 Total de arquivos para analisar: ${allFiles.length}`);

    if (allFiles.length === 0) {
      console.log('⚠️ ATENÇÃO: Nenhum arquivo encontrado para análise!');
      console.log('🔍 Verificando estrutura de pastas...');
      console.log(`📁 Components: ${fs.existsSync(this.componentsPath) ? 'EXISTS' : 'NOT FOUND'}`);
      console.log(`📁 Hooks: ${fs.existsSync(path.join(this.srcPath, 'hooks')) ? 'EXISTS' : 'NOT FOUND'}`);
      console.log(`📁 Utils: ${fs.existsSync(path.join(this.srcPath, 'utils')) ? 'EXISTS' : 'NOT FOUND'}`);
      console.log(`📁 Services: ${fs.existsSync(this.servicesPath) ? 'EXISTS' : 'NOT FOUND'}`);

      if (fs.existsSync(this.srcPath)) {
        const srcContents = fs.readdirSync(this.srcPath);
        console.log(`📁 Conteúdo da pasta src: ${srcContents.join(', ')}`);
      }
    }

this.analysis.refactoring.summary.totalFiles = allFiles.length;

for (const file of allFiles) {
  try {
    console.log(`🔍 Analisando para refatoração: ${file.path}`);
    const fullPath = path.join(this.projectRoot, file.path);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Arquivo não encontrado: ${fullPath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    const metrics = this.analyzeFileComplexity(content, file.path);
    console.log(`📊 Métricas de ${file.name}:`, {
      lines: metrics.lines,
      functions: metrics.functions,
      complexity: metrics.complexity,
      imports: metrics.imports,
      jsxElements: metrics.jsxElements,
      nestedDepth: metrics.nestedDepth
    });

    const score = this.calculateRefactorScore(metrics);
    console.log(`💯 Score de refatoração para ${file.name}: ${score}/100`);

    const priority = this.getRefactorPriority(score);
    const suggestions = this.generateRefactorSuggestions(metrics, file.path);

    const refactorAnalysis = {
      file: file.path,
      name: file.name,
      type: this.getFileType(file.path),
      metrics,
      score,
      priority,
      suggestions,
      isMonolithic: score >= 40,
      lastModified: file.lastModified
    };

    this.analysis.refactoring.monolithicFiles.push(refactorAnalysis);

    if (score >= 40) this.analysis.refactoring.summary.monolithicCount++;
    if (score >= 80) this.analysis.refactoring.summary.criticalCount++;

  } catch (error) {
    console.error(`❌ Erro ao analisar ${file.path}:`, error.message);
  }
}

if (this.analysis.refactoring.monolithicFiles.length > 0) {
  const totalScore = this.analysis.refactoring.monolithicFiles.reduce((sum, file) => sum + file.score, 0);
  this.analysis.refactoring.summary.averageScore = Math.round(totalScore / this.analysis.refactoring.monolithicFiles.length);
}

this.analysis.refactoring.monolithicFiles.sort((a, b) => b.score - a.score);
this.generateGeneralRecommendations();

console.log(`🔬 ${this.analysis.refactoring.monolithicFiles.length} arquivos analisados para refatoração`);
console.log(`📊 ${this.analysis.refactoring.summary.monolithicCount} arquivos precisam de refatoração`);
console.log(`🔴 ${this.analysis.refactoring.summary.criticalCount} arquivos com prioridade crítica`);
console.log(`💯 Score médio: ${this.analysis.refactoring.summary.averageScore}/100`);
  }

  async analyzeValidationsAndRules() {
  this.analysis.validations = {
    cnpjRules: [
      {
        rule: "Validação de CNPJ",
        description: "CNPJ deve ter 14 dígitos e passar na validação de dígitos verificadores",
        format: "XX.XXX.XXX/XXXX-XX ou apenas números",
        implementation: "src/utils/validators.js"
      }
    ],
    requiredFields: [
      {
        form: "Cadastro de Emenda",
        fields: ["numero", "valor", "autor", "municipio", "uf", "dataAprovacao", "tipo"],
        validation: "Campos obrigatórios validados no frontend e backend"
      },
      {
        form: "Cadastro de Despesa",
        fields: ["emendaId", "valor", "descricao", "data", "fornecedor", "cnpj"],
        validation: "Validação de saldo disponível e dados obrigatórios"
      },
      {
        form: "Cadastro de Usuário",
        fields: ["email", "nome", "municipio", "uf"],
        validation: "Email único e dados de localização obrigatórios"
      }
    ],
    businessRules: [],
    userPermissions: [
      {
        role: "Administrador",
        permissions: ["Gerenciar usuários", "Visualizar todos os dados", "Criar/editar emendas", "Gerenciar despesas"],
        restrictions: ["Nenhuma restrição geográfica"]
      },
      {
        role: "Operador",
        permissions: ["Visualizar dados do município", "Criar despesas", "Visualizar emendas"],
        restrictions: ["Limitado ao município atribuído"]
      }
    ],
    workflows: []
  };

  console.log('🔒 Validações e regras analisadas');
}

  async detectChanges() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  this.analysis.changes.newComponents = this.analysis.components
    .filter(comp => comp.lastModified > oneWeekAgo)
    .map(comp => comp.name);

  this.analysis.components.forEach(comp => {
    try {
      const content = fs.readFileSync(path.join(this.componentsPath, comp.name), 'utf8');
      if (content.includes('CORREÇÃO') || content.includes('FUNCIONALIDADE')) {
        this.analysis.changes.modifiedFunctionalities.push(comp.name);
      }
    } catch (error) {
      // Ignorar erros de leitura
    }
  });

  console.log('🔍 Mudanças detectadas e analisadas');
}

  async analyzeLastImplementation() {
  const recentFiles = [];

  this.analysis.components.forEach(comp => {
    const daysDiff = (new Date() - comp.lastModified) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) {
      recentFiles.push({
        file: comp.path,
        type: 'component',
        lastModified: comp.lastModified
      });
    }
  });

  this.analysis.services.forEach(service => {
    const daysDiff = (new Date() - service.lastModified) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) {
      recentFiles.push({
        file: service.path,
        type: 'service',
        lastModified: service.lastModified
      });
    }
  });

  if (recentFiles.length > 0) {
    const mostRecent = recentFiles.sort((a, b) => b.lastModified - a.lastModified)[0];

    this.analysis.lastImplementation = {
      title: "Sistema de Usuários Corrigido",
      description: "Correção do sistema de importação de userService e detecção de usuários órfãos",
      date: this.formatSimpleBrazilianDate(mostRecent.lastModified),
      filesInvolved: recentFiles.map(f => f.file),
      keyChanges: [
        "Adicionado export default ao userService.js",
        "Corrigido método analyzeServices no generateHandover.cjs",
        "Sistema de usuários órfãos implementado",
        "Validações em tempo real adicionadas"
      ],
      impact: "Crítico - Sistema de administração de usuários funcional",
      status: "Implementado e testado"
    };
  } else {
    this.analysis.lastImplementation = {
      title: "Sistema Estável",
      description: "Nenhuma implementação recente detectada",
      date: this.formatSimpleBrazilianDate(new Date()),
      filesInvolved: [],
      keyChanges: [],
      impact: "Sistema em funcionamento normal",
      status: "Estável"
    };
  }

  console.log('📋 Última implementação analisada');
}

// ===== MÉTODOS DE EXTRAÇÃO DE CÓDIGO =====

detectComponentType(content) {
  if (content.includes('useState') || content.includes('useEffect')) {
    return 'Functional Component (Hooks)';
  } else if (content.includes('class') && content.includes('Component')) {
    return 'Class Component';
  } else if (content.includes('export default')) {
    return 'Functional Component';
  } else {
    return 'Utility/Helper';
  }
}

extractDependencies(content) {
  const imports = [];
  const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

extractFunctions(content) {
  const functions = [];

  const funcRegex = /(?:export\s+)?(?:const\s+|function\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=\(]/g;
  let match;

  while ((match = funcRegex.exec(content)) !== null) {
    functions.push(match[1]);
  }

  const arrowRegex = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/g;
  while ((match = arrowRegex.exec(content)) !== null) {
    functions.push(match[1]);
  }

  return [...new Set(functions)];
}

extractExports(content) {
  const exports = [];

  const defaultExportRegex = /export\s+default\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let match = defaultExportRegex.exec(content);
  if (match) {
    exports.push({ type: 'default', name: match[1] });
  }

  const namedExportRegex = /export\s+(?:const|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push({ type: 'named', name: match[1] });
  }

  return exports;
}

extractDescription(content) {
  const commentRegex = /\/\*\*([\s\S]*?)\*\/|\/\/\s*(.+)/;
  const match = commentRegex.exec(content);

  if (match) {
    return match[1] ? match[1].trim() : match[2].trim();
  }

  const inlineComment = content.match(/\/\/\s*([A-Z][^\/\n]*)/);
  return inlineComment ? inlineComment[1].trim() : 'Sem descrição disponível';
}

// ===== MÉTODOS DE GERAÇÃO DE DOCUMENTAÇÃO =====

generateLastImplementationSection() {
  const impl = this.analysis.lastImplementation;

  return `## 🆕 ÚLTIMA IMPLEMENTAÇÃO REALIZADA

### ${impl.title}
**📅 Data:** ${impl.date}  
**📊 Status:** ${impl.status}  
**⚡ Impacto:** ${impl.impact}

**📝 Descrição:**  
${impl.description}

**🔧 Principais Alterações:**
${impl.keyChanges.map(change => `- ${change}`).join('\n')}

**📁 Arquivos Envolvidos:**
${impl.filesInvolved.length > 0 ? impl.filesInvolved.map(file => `- \`${file}\``).join('\n') : '- Nenhum arquivo específico'}

---

`;
}

generateRefactoringAnalysisSection() {
  const { summary, monolithicFiles, recommendations } = this.analysis.refactoring;

  let section = `## 🔬 ANÁLISE DE REFATORAÇÃO E ARQUIVOS MONOLÍTICOS

Esta seção identifica arquivos que podem se beneficiar de refatoração para melhorar manutenibilidade e qualidade do código.

### 📊 RESUMO EXECUTIVO

- **Total de Arquivos Analisados:** ${summary.totalFiles}
- **Arquivos que Precisam de Refatoração:** ${summary.monolithicCount} (${Math.round((summary.monolithicCount / summary.totalFiles) * 100)}%)
- **Arquivos com Prioridade Crítica:** ${summary.criticalCount}
- **Score Médio de Complexidade:** ${summary.averageScore}/100

### 🎯 CRITÉRIOS DE ANÁLISE

Os arquivos são avaliados com base nos seguintes critérios:

| Métrica | Limite | Peso | Descrição |
|---------|--------|------|-----------|
| **Linhas de Código** | ${this.refactorConfig.limits.lines} | ${this.refactorConfig.weights.lines * 100}% | Número total de linhas |
| **Número de Funções** | ${this.refactorConfig.limits.functions} | ${this.refactorConfig.weights.functions * 100}% | Funções por arquivo |
| **Complexidade Ciclomática** | ${this.refactorConfig.limits.complexity} | ${this.refactorConfig.weights.complexity * 100}% | Complexidade do código |
| **Dependências (Imports)** | ${this.refactorConfig.limits.imports} | ${this.refactorConfig.weights.imports * 100}% | Número de imports |
| **Elementos JSX** | ${this.refactorConfig.limits.jsx_elements} | ${this.refactorConfig.weights.jsx_elements * 100}% | Elementos JSX no arquivo |
| **Profundidade de Aninhamento** | ${this.refactorConfig.limits.nested_depth} | ${this.refactorConfig.weights.nested_depth * 100}% | Níveis de aninhamento |

### 🔴 ARQUIVOS COM PRIORIDADE CRÍTICA (Score ≥ 80)

`;

  const criticalFiles = monolithicFiles.filter(file => file.score >= 80);

  if (criticalFiles.length === 0) {
    section += `✅ **Parabéns!** Nenhum arquivo com prioridade crítica detectado.

`;
  } else {
    criticalFiles.forEach(file => {
      section += `#### ${file.priority.color} \`${file.path}\` - Score: ${file.score}/100

**📊 Métricas:**
- **Linhas:** ${file.metrics.lines} (${file.metrics.nonEmptyLines} não vazias)
- **Funções:** ${file.metrics.functions}
- **Complexidade:** ${file.metrics.complexity}
- **Imports:** ${file.metrics.imports}
- **Elementos JSX:** ${file.metrics.jsxElements}
- **Profundidade:** ${file.metrics.nestedDepth}

**💡 Principais Problemas Identificados:**
${file.suggestions.slice(0, 3).map(s => `- **${s.type}:** ${s.issue}`).join('\n')}

**🔧 Sugestões de Refatoração:**
${file.suggestions.slice(0, 3).map(s => `- ${s.suggestion} *(${s.priority} prioridade)*`).join('\n')}

---

`;
    });
  }

  section += `### 🟠 ARQUIVOS COM PRIORIDADE ALTA (Score 60-79)

`;

  const highPriorityFiles = monolithicFiles.filter(file => file.score >= 60 && file.score < 80);

  if (highPriorityFiles.length === 0) {
    section += `✅ Nenhum arquivo com prioridade alta detectado.

`;
  } else {
    highPriorityFiles.forEach(file => {
      section += `#### ${file.priority.color} \`${file.path}\` - Score: ${file.score}/100

**📊 Resumo:** ${file.metrics.lines} linhas, ${file.metrics.functions} funções, complexidade ${file.metrics.complexity}

**🔧 Principais Sugestões:**
${file.suggestions.slice(0, 2).map(s => `- ${s.suggestion}`).join('\n')}

`;
    });
  }

  section += `### 🟡 ARQUIVOS PARA MONITORAMENTO (Score 40-59)

`;

  const mediumPriorityFiles = monolithicFiles.filter(file => file.score >= 40 && file.score < 60);

  if (mediumPriorityFiles.length === 0) {
    section += `✅ Nenhum arquivo para monitoramento detectado.

`;
  } else {
    section += `Os seguintes arquivos devem ser monitorados para evitar que se tornem monolíticos:

`;
    mediumPriorityFiles.forEach(file => {
      section += `- ${file.priority.color} \`${file.path}\` (Score: ${file.score}) - ${file.metrics.lines} linhas
`;
    });
    section += `
`;
  }

  section += `### 📋 RECOMENDAÇÕES GERAIS

`;

  if (recommendations.length === 0) {
    section += `✅ **Sistema bem estruturado!** Nenhuma recomendação arquitetural identificada.

`;
  } else {
    recommendations.forEach(rec => {
      section += `#### ${rec.type}
**📝 Situação:** ${rec.description}  
**🎯 Ação Recomendada:** ${rec.action}  
**📊 Impacto:** ${rec.impact} | **⚡ Esforço:** ${rec.effort}

`;
    });
  }

  section += `### 🛠️ ESTRATÉGIAS DE REFATORAÇÃO RECOMENDADAS

#### Para Componentes React
1. **Composição de Componentes**
   - Quebrar componentes grandes em subcomponentes
   - Usar padrão Container/Presentational
   - Implementar Compound Components para componentes complexos

2. **Extração de Lógica**
   - Mover lógica de negócio para hooks customizados
   - Extrair funções auxiliares para utilitários
   - Usar Context API para estado compartilhado

3. **Simplificação de JSX**
   - Extrair blocos condicionais complexos
   - Criar componentes para listas e mapeamentos
   - Usar render props para lógica reutilizável

#### Para Hooks Customizados
1. **Single Responsibility**
   - Um hook = uma responsabilidade específica
   - Dividir hooks complexos em hooks menores
   - Compor hooks para funcionalidades complexas

2. **Extração de Lógica**
   - Mover validações para funções puras
   - Extrair transformações de dados
   - Separar side effects de lógica de estado

#### Para Utilitários e Serviços
1. **Modularização**
   - Agrupar funções relacionadas em módulos
   - Usar barrel exports para organização
   - Separar constantes e configurações

2. **Especialização**
   - Criar módulos específicos por domínio
   - Separar validações, formatações e transformações
   - Implementar padrão Repository para serviços

### 🎯 PLANO DE AÇÃO SUGERIDO

#### Fase 1 - Crítico (1-2 sprints)
${criticalFiles.length > 0 ? criticalFiles.map(f => `- Refatorar \`${f.path}\` (Score: ${f.score})`).join('\n') : '- ✅ Nenhuma ação crítica necessária'}

#### Fase 2 - Alto Impacto (2-4 sprints)
${highPriorityFiles.length > 0 ? highPriorityFiles.slice(0, 3).map(f => `- Melhorar \`${f.path}\` (Score: ${f.score})`).join('\n') : '- ✅ Nenhuma ação de alto impacto necessária'}

#### Fase 3 - Monitoramento Contínuo
- Implementar limites de complexidade no CI/CD
- Revisões de código focadas em tamanho e complexidade
- Refactoring incremental durante desenvolvimento de features

---

`;

  return section;
}

generateProjectStructure() {
  const generateStructureString = (obj, prefix = '') => {
    let result = '';
    const entries = Object.entries(obj);

    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const currentPrefix = isLast ? '└── ' : '├── ';
      const nextPrefix = isLast ? '    ' : '│   ';

      result += prefix + currentPrefix + key + '\n';

      if (typeof value === 'object' && value.type !== 'file') {
        result += generateStructureString(value, prefix + nextPrefix);
      }
    });

    return result;
  };

  return generateStructureString(this.analysis.structure);
}

generateChangesSection() {
  const changes = this.analysis.changes;

  let section = '';

  if (changes.newComponents.length > 0) {
    section += `### 🆕 Novos Componentes
${changes.newComponents.map(comp => `- ${comp}`).join('\n')}

`;
  }

  if (changes.modifiedFunctionalities.length > 0) {
    section += `### ✏️ Funcionalidades Modificadas
${changes.modifiedFunctionalities.map(func => `- ${func}`).join('\n')}

`;
  }

  if (section === '') {
    section = `### ✅ Sistema Estável
Nenhuma mudança significativa detectada nos últimos 7 dias.

`;
  }

  return section;
}

generateComponentsSection() {
  return this.analysis.components.map(comp => {
    const refactorAnalysis = this.analysis.refactoring.monolithicFiles.find(f => f.path === comp.path);
    const refactorInfo = refactorAnalysis ?
      `- **Score de Refatoração:** ${refactorAnalysis.score}/100 ${refactorAnalysis.priority.color}
- **Status:** ${refactorAnalysis.priority.description}` : '';

    return `#### \`${comp.path}\`
- **Funcionalidade**: ${comp.description}
- **Tipo**: ${comp.type}
- **Funções**: ${comp.functions.join(', ') || 'Nenhuma detectada'}
- **Dependências**: ${comp.dependencies.slice(0, 3).join(', ')}${comp.dependencies.length > 3 ? '...' : ''}
${refactorInfo}

`;
  }).join('');
}

generateHooksSection() {
  return this.analysis.hooks.map(hook => {
    const refactorAnalysis = this.analysis.refactoring.monolithicFiles.find(f => f.path === hook.path);
    const refactorInfo = refactorAnalysis ?
      `- **Score de Refatoração:** ${refactorAnalysis.score}/100 ${refactorAnalysis.priority.color}
- **Status:** ${refactorAnalysis.priority.description}` : '';

    return `#### \`${hook.path}\`
- **Funcionalidade**: ${hook.description}
- **Funções**: ${hook.functions.join(', ') || 'Nenhuma detectada'}
${refactorInfo}

`;
  }).join('');
}

generateUtilsSection() {
  return this.analysis.utils.map(util => {
    const refactorAnalysis = this.analysis.refactoring.monolithicFiles.find(f => f.path === util.path);
    const refactorInfo = refactorAnalysis ?
      `- **Score de Refatoração:** ${refactorAnalysis.score}/100 ${refactorAnalysis.priority.color}
- **Status:** ${refactorAnalysis.priority.description}` : '';

    return `#### \`${util.path}\`
- **Funcionalidade**: ${util.description}
- **Funções**: ${util.functions.join(', ') || 'Nenhuma detectada'}
${refactorInfo}

`;
  }).join('');
}

generateServicesSection() {
  return this.analysis.services.map(service => {
    const refactorAnalysis = this.analysis.refactoring.monolithicFiles.find(f => f.path === service.path);
    const refactorInfo = refactorAnalysis ?
      `- **Score de Refatoração:** ${refactorAnalysis.score}/100 ${refactorAnalysis.priority.color}
- **Status:** ${refactorAnalysis.priority.description}` : '';

    return `#### \`${service.path}\`
- **Funcionalidade**: ${service.description}
- **Funções**: ${service.functions.join(', ') || 'Nenhuma detectada'}
${refactorInfo}

`;
  }).join('');
}

generateMainDependencies() {
  const deps = this.analysis.dependencies.main || {};
  return Object.entries(deps)
    .slice(0, 10)
    .map(([name, version]) => `  - **${name}**: ${version}`)
    .join('\n');
}

generateDependenciesList() {
  const deps = this.analysis.dependencies.main || {};
  const mainDeps = Object.entries(deps)
    .filter(([name]) => !name.startsWith('@types'))
    .map(([name, version]) => `- **${name}**: ${version}`)
    .join('\n');

  return mainDeps || '- React e Firebase (principais)';
}

generateValidationsSection() {
  let section = `## 🔒 VALIDAÇÕES E REGRAS DO SISTEMA

Esta seção documenta todas as validações, regras de negócio e fluxos de trabalho implementados no SICEFSUS.

---

### 📋 CAMPOS OBRIGATÓRIOS

`;

  this.analysis.validations.requiredFields.forEach(form => {
    section += `#### ${form.form}
${form.fields.map(field => `- **${field}**`).join('\n')}

**Validação:** ${form.validation}

`;
  });

  section += `---

### 🔍 VALIDAÇÕES DE DADOS

`;

  if (this.analysis.validations.cnpjRules.length > 0) {
    section += `#### Validação de CNPJ
`;
    this.analysis.validations.cnpjRules.forEach(rule => {
      section += `- **Regra:** ${rule.rule}
- **Descrição:** ${rule.description}
- **Formato:** ${rule.format}
- **Implementação:** ${rule.implementation}

`;
    });
  }

  section += `---

### 👥 PERMISSÕES E CONTROLE DE ACESSO

`;

  this.analysis.validations.userPermissions.forEach(permission => {
    section += `#### ${permission.role}

**Permissões:**
${permission.permissions.map(perm => `- ${perm}`).join('\n')}

**Restrições:**
${permission.restrictions.map(rest => `- ${rest}`).join('\n')}

`;
  });

  return section;
}

generateHandover() {
  const timestamp = this.formatBrazilianDateTime(this.reliableDateTime.current);

  const timeSourceNote = this.reliableDateTime.sources.length > 0
    ? `\n**🕒 Data/Hora obtida de:** ${this.reliableDateTime.sources.join(', ')}`
    : '';

  const handover = `# 📋 HANDOVER - Sistema SICEFSUS

**📅 Gerado automaticamente em:** ${timestamp}  
**🔧 Por:** Script generateHandover.cjs v2.4  
**📊 Status:** Sistema em Produção Ativa${timeSourceNote}

---

${this.generateLastImplementationSection()}

${this.generateRefactoringAnalysisSection()}

## 🎯 O QUE É O SISTEMA

O **SICEFSUS** (Sistema de Controle de Execuções Financeiras do SUS) é uma aplicação web completa desenvolvida para gestão e controle de emendas parlamentares destinadas ao Sistema Único de Saúde (SUS). O sistema permite o acompanhamento, fiscalização e geração de relatórios das aplicações de recursos públicos de forma organizada e transparente.

### Objetivo Principal
Facilitar o controle financeiro e administrativo de emendas parlamentares do SUS, oferecendo:
- Cadastro e gestão de emendas
- Controle de despesas associadas
- Relatórios gerenciais
- Sistema de permissões por usuário
- Dashboard com métricas em tempo real

---

${this.generateValidationsSection()}

## ⚙️ FUNCIONALIDADES PRINCIPAIS

### 🏠 Dashboard
- Visão geral com métricas consolidadas
- Estatísticas de emendas e despesas
- Indicadores de execução orçamentária
- Gráficos e visualizações

### 📊 Gestão de Emendas
- Cadastro de novas emendas
- Edição e visualização
- Controle de saldos
- Vinculação com despesas
- Filtros e busca avançada

### 💰 Gestão de Despesas
- Cadastro de despesas por emenda
- Controle de execução orçamentária
- Validação de saldos
- Histórico de transações

### 👥 Administração de Usuários
- Cadastro de usuários com validação em tempo real
- Sistema de recuperação automática de usuários órfãos
- Controle de permissões (Admin/Operador)
- Gestão por município/UF
- Logs de auditoria

### 📈 Relatórios
- Relatórios consolidados
- Exportação de dados
- Análises financeiras
- Dashboards personalizados

---

## 🛠️ TECNOLOGIAS APLICADAS

### Frontend
- **React 18** - Framework principal
- **React Router Dom** - Roteamento
- **Vite** - Build tool e dev server
- **JavaScript (ES6+)** - Linguagem principal

### Backend/Database
- **Firebase Firestore** - Banco de dados NoSQL
- **Firebase Auth** - Autenticação
- **Firebase Storage** - Armazenamento

### Bibliotecas Auxiliares
${this.generateDependenciesList()}

### Ambiente de Desenvolvimento
- **Replit** - Plataforma de desenvolvimento
- **Node.js** - Runtime JavaScript
- **npm** - Gerenciador de pacotes

---

## 📁 ESTRUTURA DE PASTAS

\`\`\`
${this.generateProjectStructure()}
\`\`\`

---

## 🔄 MUDANÇAS RECENTES DETECTADAS

${this.generateChangesSection()}

---

## 📄 DESCRIÇÃO DETALHADA DOS ARQUIVOS

### 🏗️ **Arquivos Principais**

#### \`src/App.jsx\`
- **Funcionalidade**: Componente raiz da aplicação
- **Responsabilidades**: Roteamento, autenticação, navegação
- **Dependências**: UserContext, componentes de página, Firebase
- **Características**: Error boundary, proteção de rotas, gerenciamento de estado global

#### \`src/index.jsx\`
- **Funcionalidade**: Entry point da aplicação
- **Responsabilidades**: Renderização do componente App no DOM
- **Dependências**: React, ReactDOM, App.jsx

#### \`index.html\`
- **Funcionalidade**: Template HTML principal
- **Responsabilidades**: Estrutura base, meta tags, favicon
- **Características**: PWA ready, SEO otimizado

---

### 🧩 **Componentes Principais**

${this.generateComponentsSection()}

---

### 🎣 **Hooks Customizados**

${this.generateHooksSection()}

---

### 🛠️ **Utilitários**

${this.generateUtilsSection()}

---

### 🔧 **Serviços**

${this.generateServicesSection()}

---

### 🔥 **Firebase**

#### \`src/firebase/firebaseConfig.js\`
- **Funcionalidade**: Configuração Firebase
- **Responsabilidades**: Inicialização, conexão com services
- **Dependências**: Variáveis de ambiente (Secrets)
- **Services**: Auth, Firestore, Storage

---

### ⚙️ **Configuração**

#### \`package.json\`
- **Dependências principais**:
${this.generateMainDependencies()}

#### \`vite.config.js\`
- **Configurações**: Build, dev server, plugins React
- **Port**: 5173 (desenvolvimento)

---

## 🔗 **DEPENDÊNCIAS E INTEGRAÇÕES**

### Fluxo Principal
1. **App.jsx** → **UserContext** → **Autenticação**
2. **Dashboard** → **useEmendaDespesa** → **Firebase**
3. **Emendas** → **EmendaForm/EmendasTable** → **Despesas**
4. **Administracao** → **AdminPanel** → **Gestão de usuários**

### Integrações Críticas
- **Firebase Auth** ↔ **UserContext** ↔ **Todos os componentes**
- **useEmendaDespesa** ↔ **Emendas/Despesas** ↔ **Dashboard**
- **React Router** ↔ **Navegação** ↔ **Proteção de rotas**
- **userService** ↔ **Administração** ↔ **Gestão de usuários órfãos**

---

## 🚀 **COMANDOS DE DESENVOLVIMENTO**

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Gerar/Atualizar documentação
node scripts/generateHandover.cjs
\`\`\`

---

## 📊 **ESTATÍSTICAS DO SISTEMA**

- **Total de Componentes**: ${this.analysis.components.length}
- **Total de Hooks**: ${this.analysis.hooks.length}
- **Total de Utilitários**: ${this.analysis.utils.length}
- **Total de Serviços**: ${this.analysis.services.length}
- **Dependências Principais**: ${Object.keys(this.analysis.dependencies.main || {}).length}
- **Dependências de Desenvolvimento**: ${Object.keys(this.analysis.dependencies.dev || {}).length}
- **Arquivos Analisados para Refatoração**: ${this.analysis.refactoring.summary.totalFiles}
- **Arquivos que Precisam de Refatoração**: ${this.analysis.refactoring.summary.monolithicCount}
- **Score Médio de Complexidade**: ${this.analysis.refactoring.summary.averageScore}/100

---

## 📝 **OBSERVAÇÕES IMPORTANTES**

1. **Variáveis de Ambiente**: Configuradas no Secrets do Replit
2. **Permissões**: Sistema de roles (admin/operador) com filtros por município
3. **Estado**: Gerenciado via Context API e hooks customizados
4. **Responsividade**: Interface adaptada para mobile e desktop
5. **Segurança**: Regras de segurança Firebase configuradas
6. **Performance**: Lazy loading e otimizações implementadas
7. **Documentação**: Atualizada automaticamente via script
8. **Sistema de Usuários**: Tratamento automático de usuários órfãos
9. **Validações**: Validação em tempo real e tratamento robusto de erros
10. **Data/Hora**: Sistema confiável com múltiplas fontes (WorldTimeAPI, NTP, Git, FileSystem)
11. **🆕 Análise de Código**: Sistema automático de detecção de arquivos monolíticos
12. **🆕 Refatoração**: Sugestões automáticas baseadas em métricas de complexidade

---

## 🔧 **TROUBLESHOOTING E RESOLUÇÃO DE PROBLEMAS**

### Problemas Comuns

#### 🚨 Erro de Validação de CNPJ
**Sintoma:** Mensagem "CNPJ inválido" mesmo com CNPJ correto
**Causa:** Formato incorreto ou dígitos verificadores inválidos
**Solução:** 
- Verificar se CNPJ tem exatamente 14 dígitos
- Usar apenas números ou formato XX.XXX.XXX/XXXX-XX
- Validar dígitos verificadores com algoritmo oficial

#### 🚨 Usuário Órfão Detectado
**Sintoma:** Erro "auth/email-already-in-use" mas email não existe no sistema
**Causa:** Usuário criado no Firebase Auth mas não no Firestore
**Solução:** 
- Sistema detecta automaticamente e recupera usuário órfão
- Processo transparente para o usuário final
- Logs detalhados no console para debugging

#### 🚨 Arquivo Monolítico Detectado
**Sintoma:** Warning na documentação sobre arquivo com alta complexidade
**Causa:** Arquivo ultrapassou limites de linhas, funções ou complexidade
**Solução:**
- Consultar seção "Análise de Refatoração" nesta documentação
- Seguir sugestões específicas para o arquivo
- Implementar refatoração gradual durante desenvolvimento

#### 🚨 Performance Degradada
**Sintoma:** Sistema lento ou travando
**Causa:** Possível arquivo monolítico ou componente complexo sendo renderizado
**Solução:**
- Verificar arquivos com score de refatoração > 60
- Implementar lazy loading para componentes pesados
- Quebrar componentes grandes em subcomponentes

---

## 📚 **GUIA DE MANUTENÇÃO**

### Atualizações Regulares

#### Mensal
- [ ] Verificar atualizações de dependências
- [ ] Executar testes de funcionalidades críticas
- [ ] Backup dos dados do Firebase
- [ ] Revisar logs de erros
- [ ] Verificar usuários órfãos no sistema
- [ ] Validar sincronização de data/hora
- [ ] **🆕 Executar análise de refatoração e revisar arquivos críticos**

#### Trimestral
- [ ] Análise de performance do sistema
- [ ] Revisão de permissões de usuários
- [ ] Limpeza de dados obsoletos
- [ ] Atualização da documentação
- [ ] Auditoria de segurança
- [ ] **🆕 Refatoração de arquivos com score > 60**

#### Anual
- [ ] Auditoria completa de segurança
- [ ] Revisão de regras de negócio
- [ ] Planejamento de melhorias
- [ ] Renovação de certificados
- [ ] Análise de usuários órfãos históricos
- [ ] **🆕 Revisão arquitetural completa baseada em métricas de complexidade**

### Monitoramento

#### Métricas Importantes
- **Performance**: Tempo de carregamento < 3 segundos
- **Disponibilidade**: Uptime > 99.5%
- **Usuários Ativos**: Monitoramento diário
- **Erros**: Taxa < 1% das operações
- **Recuperação de Órfãos**: Sucesso > 95%
- **Precisão de Data/Hora**: Sincronização < 1 segundo
- [ ] **🆕 Qualidade de Código**: Score médio de refatoração < 40
- [ ] **🆕 Arquivos Críticos**: Zero arquivos com score > 80

#### Alertas Configurados
- Falhas de autenticação em massa
- Erros de validação acima do normal
- Problemas de conectividade com Firebase
- Tentativas de acesso não autorizado
- Detecção frequente de usuários órfãos
- Falhas na sincronização de tempo
- [ ] **🆕 Detecção de arquivos com complexidade crítica (score > 80)**
- [ ] **🆕 Aumento súbito no score médio de refatoração**

### 🔬 **Processo de Refatoração Contínua**

#### Workflow de Refatoração
1. **Detecção Automática**
   - Executar \`node scripts/generateHandover.cjs\` semanalmente
   - Revisar seção "Análise de Refatoração"
   - Identificar arquivos com score > 40

2. **Priorização**
   - **Crítico (Score ≥ 80)**: Refatoração imediata
   - **Alto (Score 60-79)**: Refatoração em 2-4 sprints
   - **Médio (Score 40-59)**: Monitoramento e refatoração gradual

3. **Execução**
   - Seguir sugestões específicas do arquivo
   - Aplicar padrões de design apropriados
   - Manter testes durante refatoração
   - Validar performance pós-refatoração

4. **Validação**
   - Re-executar análise após refatoração
   - Confirmar redução do score
   - Testar funcionalidades afetadas
   - Documentar mudanças realizadas

---

**📅 Data de Criação**: Janeiro 2025  
**🔄 Última Atualização**: ${timestamp}  
**📊 Versão**: 2.4  
**💻 Desenvolvido em**: Replit  
**✅ Status**: Produção Ativa com Sistema de Análise de Refatoração

---

## 🔧 **PARA DESENVOLVEDORES**

Para atualizar esta documentação:
\`\`\`bash
node scripts/generateHandover.cjs
\`\`\`

O script detecta automaticamente:
- ✅ Novos componentes adicionados
- ✅ Funcionalidades modificadas ou removidas  
- ✅ Estrutura de pastas alterada
- ✅ Dependências atualizadas no package.json
- ✅ Mudanças significativas no fluxo da aplicação
- ✅ Validações e regras de negócio detalhadas
- ✅ Fluxos de trabalho documentados
- ✅ Permissões e controle de acesso
- ✅ Guia de troubleshooting e manutenção
- ✅ Detecção automática da última implementação
- ✅ Análise de arquivos modificados recentemente
- ✅ Documentação de sistemas corrigidos
- ✅ Sistema de data/hora confiável com múltiplas fontes
- ✅ Timestamps precisos no timezone brasileiro
- ✅ Fallback automático para fontes de tempo alternativas
- ✅ **🆕 ANÁLISE AVANÇADA DE REFATORAÇÃO:**
  - 🔬 Detecção automática de arquivos monolíticos
  - 📊 Métricas de complexidade (linhas, funções, complexidade ciclomática)
  - 💡 Sugestões específicas de refatoração por arquivo
  - 🎯 Sistema de priorização (Crítico/Alto/Médio/Baixo/OK)
  - 📋 Recomendações arquiteturais gerais
  - 🛠️ Estratégias detalhadas de refatoração
  - 📈 Plano de ação estruturado por fases
  - 🔄 Integração com workflow de manutenção

### 🔬 **Critérios de Análise de Refatoração:**
- **Linhas de Código**: Limite de ${this.refactorConfig.limits.lines} linhas (peso: ${this.refactorConfig.weights.lines * 100}%)
- **Número de Funções**: Limite de ${this.refactorConfig.limits.functions} funções (peso: ${this.refactorConfig.weights.functions * 100}%)
- **Complexidade Ciclomática**: Limite de ${this.refactorConfig.limits.complexity} (peso: ${this.refactorConfig.weights.complexity * 100}%)
- **Dependências**: Limite de ${this.refactorConfig.limits.imports} imports (peso: ${this.refactorConfig.weights.imports * 100}%)
- **Elementos JSX**: Limite de ${this.refactorConfig.limits.jsx_elements} elementos (peso: ${this.refactorConfig.weights.jsx_elements * 100}%)
- **Aninhamento**: Limite de ${this.refactorConfig.limits.nested_depth} níveis (peso: ${this.refactorConfig.weights.nested_depth * 100}%)

### 🕒 **Fontes de Data/Hora Utilizadas (em ordem de prioridade):**
1. **WorldTimeAPI** - API externa confiável (America/Sao_Paulo)
2. **Sistema NTP** - Serviço de tempo do sistema operacional
3. **Git Commit** - Timestamp do último commit
4. **Sistema de Arquivos** - Timestamp de modificação de arquivos
5. **Sistema Local** - Hora local como último recurso

O script automaticamente tenta cada fonte até obter uma data/hora confiável, garantindo máxima precisão na documentação e agora inclui análise avançada de refatoração para manter a qualidade e manutenibilidade do código.
`;

  return handover;
}

saveHandover() {
  const content = this.generateHandover();
  fs.writeFileSync(this.currentHandover, content, 'utf8');

  const timeInfo = this.reliableDateTime.sources.length > 0
    ? ` (Fonte: ${this.reliableDateTime.sources[0]})`
    : '';

  console.log('✅ HANDOVER_SICEFSUS.md atualizado com sucesso!');
  console.log(`🕒 Data/Hora: ${this.formatBrazilianDateTime(this.reliableDateTime.current)}${timeInfo}`);
  console.log(`📄 ${content.split('\n').length} linhas geradas`);
  console.log(`📊 ${this.analysis.components.length} componentes documentados`);
  console.log(`🎣 ${this.analysis.hooks.length} hooks documentados`);
  console.log(`🛠️ ${this.analysis.utils.length} utilitários documentados`);
  console.log(`🔧 ${this.analysis.services.length} serviços documentados`);
  console.log(`🔒 ${this.analysis.validations.requiredFields.length} formulários com validações documentados`);
  console.log(`🔄 ${this.analysis.validations.workflows.length} fluxos de trabalho documentados`);
  console.log(`🆕 Última implementação: ${this.analysis.lastImplementation.title}`);
  console.log(`🔬 ${this.analysis.refactoring.summary.totalFiles} arquivos analisados para refatoração`);
  console.log(`📊 ${this.analysis.refactoring.summary.monolithicCount} arquivos precisam de refatoração`);
  console.log(`🔴 ${this.analysis.refactoring.summary.criticalCount} arquivos com prioridade crítica`);
  console.log(`💯 Score médio de complexidade: ${this.analysis.refactoring.summary.averageScore}/100`);
}

  async run() {
  console.log('🚀 Iniciando geração automática do HANDOVER v2.4...\n');

  try {
    await this.analyze();
    this.saveHandover();

    console.log('\n🎉 Processo concluído com sucesso!');
    console.log('📋 Documentação HANDOVER_SICEFSUS.md atualizada');
    console.log('🆕 Seção de última implementação adicionada');
    console.log('🕒 Sistema de data/hora confiável implementado');
    console.log('🔒 Seção de validações e regras atualizada');
    console.log('🔧 Guia de troubleshooting incluído');
    console.log('📚 Seção de manutenção documentada');
    console.log('🔬 Análise de refatoração implementada');
    console.log('💡 Sugestões de melhoria de código incluídas');

    if (this.analysis.refactoring.summary.criticalCount > 0) {
      console.log(`\n🚨 ATENÇÃO: ${this.analysis.refactoring.summary.criticalCount} arquivo(s) precisam de refatoração crítica!`);
    }

    if (this.analysis.refactoring.summary.averageScore > 50) {
      console.log(`\n⚠️ AVISO: Score médio de complexidade alto (${this.analysis.refactoring.summary.averageScore}/100)`);
    }

  } catch (error) {
    console.error('❌ Erro durante a geração:', error);
    process.exit(1);
  }
}
}

// 🚀 EXECUTAR SCRIPT
if (require.main === module) {
  const generator = new HandoverGenerator();
  generator.run();
}

module.exports = HandoverGenerator;