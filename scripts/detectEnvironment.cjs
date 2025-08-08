/**
 * 🔍 DETECTOR DE AMBIENTE E CONFIGURAÇÃO - SICEFSUS v1.0
 * Script para detectar e validar configurações de DEV vs PROD
 * Integra com os scripts existentes generateHandover.cjs e project-analyzer.js
 * 
 * Uso: node scripts/detectEnvironment.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnvironmentDetector {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.currentDateTime = new Date();

    this.analysis = {
      currentEnvironment: 'unknown',
      configurations: {
        development: {},
        production: {},
        staging: {}
      },
      environmentFiles: [],
      deploymentConfig: {},
      gitInfo: {},
      buildInfo: {},
      firebaseConfig: {},
      scripts: {},
      environmentVariables: {},
      recommendations: [],
      issues: [],
      devProdGaps: []
    };

    // 🔧 Configurações específicas do SICEFSUS
    this.sicefsusConfig = {
      requiredEnvVars: [
        'REACT_APP_FIREBASE_API_KEY',
        'REACT_APP_FIREBASE_AUTH_DOMAIN',
        'REACT_APP_FIREBASE_PROJECT_ID',
        'REACT_APP_FIREBASE_STORAGE_BUCKET',
        'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
        'REACT_APP_FIREBASE_APP_ID'
      ],
      environments: ['development', 'production', 'staging'],
      deploymentPlatforms: ['vercel', 'firebase', 'netlify', 'replit']
    };
  }

  // ===== DETECÇÃO DE AMBIENTE ATUAL =====

  detectCurrentEnvironment() {
    console.log('🔍 Detectando ambiente atual...');

    // Verificar NODE_ENV
    const nodeEnv = process.env.NODE_ENV || 'development';

    // Verificar se está em produção (Vercel, Netlify, etc.)
    const isProduction = !!(
      process.env.VERCEL ||
      process.env.NETLIFY ||
      process.env.CI ||
      process.env.NODE_ENV === 'production'
    );

    // Verificar se está no Replit
    const isReplit = !!(
      process.env.REPL_ID ||
      process.env.REPL_SLUG ||
      fs.existsSync(path.join(this.projectRoot, '.replit'))
    );

    // Verificar build/dist existente
    const hasBuild = fs.existsSync(path.join(this.projectRoot, 'dist'));
    const hasBackupBuild = fs.existsSync(path.join(this.projectRoot, 'dist-backup'));

    let environment = 'development';

    if (isProduction) {
      environment = 'production';
    } else if (isReplit && hasBuild) {
      environment = 'staging';
    }

    this.analysis.currentEnvironment = environment;

    console.log(`📊 Ambiente detectado: ${environment}`);
    if (isReplit) console.log('🔧 Plataforma: Replit');
    if (hasBuild) console.log('📦 Build detectado');
    if (hasBackupBuild) console.log('🔄 Backup de build detectado');

    return environment;
  }

  // ===== ANÁLISE DE ARQUIVOS DE CONFIGURAÇÃO =====

  analyzeEnvironmentFiles() {
    console.log('📁 Analisando arquivos de configuração...');

    const envFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production',
      '.env.staging'
    ];

    envFiles.forEach(fileName => {
      const filePath = path.join(this.projectRoot, fileName);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const variables = this.parseEnvFile(content);

          this.analysis.environmentFiles.push({
            file: fileName,
            path: filePath,
            exists: true,
            variables,
            lineCount: content.split('\n').length
          });

          console.log(`✅ ${fileName}: ${Object.keys(variables).length} variáveis`);
        } catch (error) {
          console.error(`❌ Erro ao ler ${fileName}:`, error.message);
        }
      } else {
        this.analysis.environmentFiles.push({
          file: fileName,
          path: filePath,
          exists: false,
          variables: {},
          lineCount: 0
        });
      }
    });
  }

  parseEnvFile(content) {
    const variables = {};
    const lines = content.split('\n');

    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        variables[key.trim()] = value;
      }
    });

    return variables;
  }

  // ===== ANÁLISE DE CONFIGURAÇÃO DO FIREBASE =====

  analyzeFirebaseConfig() {
    console.log('🔥 Analisando configuração Firebase...');

    const configPath = path.join(this.projectRoot, 'src', 'firebase', 'firebaseConfig.js');

    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');

        // Extrair configuração
        const hasApiKey = content.includes('apiKey');
        const hasAuthDomain = content.includes('authDomain');
        const hasProjectId = content.includes('projectId');
        const usesEnvVars = content.includes('process.env');

        this.analysis.firebaseConfig = {
          exists: true,
          path: configPath,
          hasApiKey,
          hasAuthDomain,
          hasProjectId,
          usesEnvVars,
          configMethod: usesEnvVars ? 'environment_variables' : 'hardcoded'
        };

        console.log(`✅ Firebase config encontrado (${this.analysis.firebaseConfig.configMethod})`);
      } catch (error) {
        console.error('❌ Erro ao analisar Firebase config:', error.message);
      }
    } else {
      this.analysis.firebaseConfig = { exists: false };
      console.log('⚠️ Firebase config não encontrado');
    }
  }

  // ===== ANÁLISE DE SCRIPTS E COMANDOS =====

  analyzePackageScripts() {
    console.log('📦 Analisando scripts do package.json...');

    const packagePath = path.join(this.projectRoot, 'package.json');

    if (fs.existsSync(packagePath)) {
      try {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const scripts = packageData.scripts || {};

        this.analysis.scripts = {
          available: Object.keys(scripts),
          dev: scripts.dev || scripts.start || 'não definido',
          build: scripts.build || 'não definido',
          preview: scripts.preview || 'não definido',
          hasDevCommand: !!(scripts.dev || scripts.start),
          hasBuildCommand: !!scripts.build,
          hasPreviewCommand: !!scripts.preview,
          customScripts: Object.keys(scripts).filter(key => 
            !['dev', 'start', 'build', 'preview', 'test', 'lint'].includes(key)
          )
        };

        console.log(`✅ ${Object.keys(scripts).length} scripts encontrados`);
        if (this.analysis.scripts.customScripts.length > 0) {
          console.log(`🔧 Scripts customizados: ${this.analysis.scripts.customScripts.join(', ')}`);
        }
      } catch (error) {
        console.error('❌ Erro ao analisar package.json:', error.message);
      }
    }
  }

  // ===== ANÁLISE DE CONFIGURAÇÃO DE DEPLOY =====

  analyzeDeploymentConfig() {
    console.log('🚀 Analisando configurações de deploy...');

    const deployConfigs = [
      { file: 'vercel.json', platform: 'vercel' },
      { file: 'netlify.toml', platform: 'netlify' },
      { file: 'firebase.json', platform: 'firebase' },
      { file: '.replit', platform: 'replit' }
    ];

    deployConfigs.forEach(({ file, platform }) => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');

          this.analysis.deploymentConfig[platform] = {
            exists: true,
            file,
            path: filePath,
            content: file.endsWith('.json') ? JSON.parse(content) : content
          };

          console.log(`✅ Configuração ${platform} encontrada`);
        } catch (error) {
          console.log(`⚠️ Configuração ${platform} existe mas com erro:`, error.message);
        }
      }
    });
  }

  // ===== ANÁLISE DE INFORMAÇÕES GIT =====

  analyzeGitInfo() {
    console.log('📋 Analisando informações Git...');

    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8', cwd: this.projectRoot }).trim();
      const lastCommit = execSync('git log -1 --format="%h - %s (%cr)"', { encoding: 'utf8', cwd: this.projectRoot }).trim();
      const hasUncommitted = execSync('git status --porcelain', { encoding: 'utf8', cwd: this.projectRoot }).trim().length > 0;

      this.analysis.gitInfo = {
        available: true,
        currentBranch: branch,
        lastCommit,
        hasUncommittedChanges: hasUncommitted,
        isMainBranch: ['main', 'master'].includes(branch)
      };

      console.log(`✅ Branch: ${branch} ${this.analysis.gitInfo.isMainBranch ? '(principal)' : ''}`);
      if (hasUncommitted) console.log('⚠️ Mudanças não commitadas detectadas');
    } catch (error) {
      this.analysis.gitInfo = { available: false, error: error.message };
      console.log('⚠️ Git não disponível ou não é repositório Git');
    }
  }

  // ===== ANÁLISE DE BUILD =====

  analyzeBuildInfo() {
    console.log('🏗️ Analisando informações de build...');

    const distPath = path.join(this.projectRoot, 'dist');
    const distBackupPath = path.join(this.projectRoot, 'dist-backup');

    this.analysis.buildInfo = {
      hasDist: fs.existsSync(distPath),
      hasDistBackup: fs.existsSync(distBackupPath),
      distSize: 0,
      distBackupSize: 0,
      lastBuildTime: null,
      buildFiles: []
    };

    if (this.analysis.buildInfo.hasDist) {
      try {
        const stats = fs.statSync(distPath);
        this.analysis.buildInfo.lastBuildTime = stats.mtime;
        this.analysis.buildInfo.buildFiles = fs.readdirSync(distPath);
        console.log(`✅ Build encontrado (${this.analysis.buildInfo.buildFiles.length} arquivos)`);
      } catch (error) {
        console.log('⚠️ Erro ao analisar pasta dist');
      }
    }

    if (this.analysis.buildInfo.hasDistBackup) {
      try {
        const backupFiles = fs.readdirSync(distBackupPath);
        console.log(`🔄 Backup de build encontrado (${backupFiles.length} arquivos)`);
      } catch (error) {
        console.log('⚠️ Erro ao analisar pasta dist-backup');
      }
    }
  }

  // ===== VALIDAÇÃO DE VARIÁVEIS OBRIGATÓRIAS =====

  validateRequiredEnvironmentVariables() {
    console.log('🔒 Validando variáveis de ambiente obrigatórias...');

    const issues = [];
    const recommendations = [];

    // Verificar variáveis obrigatórias do Firebase
    this.sicefsusConfig.requiredEnvVars.forEach(varName => {
      const found = this.analysis.environmentFiles.some(envFile => 
        envFile.variables.hasOwnProperty(varName)
      );

      if (!found) {
        issues.push({
          type: 'missing_env_var',
          severity: 'high',
          message: `Variável obrigatória não encontrada: ${varName}`,
          recommendation: `Adicionar ${varName} no arquivo .env`
        });
      }
    });

    // Verificar se Firebase está usando variáveis de ambiente
    if (this.analysis.firebaseConfig.exists && !this.analysis.firebaseConfig.usesEnvVars) {
      issues.push({
        type: 'hardcoded_config',
        severity: 'medium',
        message: 'Configuração Firebase hardcoded detectada',
        recommendation: 'Migrar para variáveis de ambiente para melhor segurança'
      });
    }

    // Verificar arquivos de ambiente específicos
    const hasDevEnv = this.analysis.environmentFiles.some(f => f.file === '.env.development' && f.exists);
    const hasProdEnv = this.analysis.environmentFiles.some(f => f.file === '.env.production' && f.exists);

    if (!hasDevEnv) {
      recommendations.push({
        type: 'missing_dev_env',
        priority: 'medium',
        message: 'Arquivo .env.development não encontrado',
        benefit: 'Facilita configurações específicas de desenvolvimento'
      });
    }

    if (!hasProdEnv) {
      recommendations.push({
        type: 'missing_prod_env',
        priority: 'high',
        message: 'Arquivo .env.production não encontrado',
        benefit: 'Essencial para configurações seguras de produção'
      });
    }

    this.analysis.issues = issues;
    this.analysis.recommendations = recommendations;

    console.log(`📊 ${issues.length} problemas encontrados`);
    console.log(`💡 ${recommendations.length} recomendações geradas`);
  }

  // ===== IDENTIFICAÇÃO DE GAPS DEV/PROD =====

  identifyDevProdGaps() {
    console.log('🔍 Identificando gaps entre DEV e PROD...');

    const gaps = [];

    // Gap 1: Separação de configurações
    const mainEnvFile = this.analysis.environmentFiles.find(f => f.file === '.env');
    if (mainEnvFile && mainEnvFile.exists) {
      gaps.push({
        category: 'Configuração',
        gap: 'Arquivo .env único para todos os ambientes',
        impact: 'Risco de usar configurações de dev em prod',
        solution: 'Criar .env.development, .env.production e .env.local'
      });
    }

    // Gap 2: Scripts de build diferenciados
    if (!this.analysis.scripts.hasPreviewCommand) {
      gaps.push({
        category: 'Build/Deploy',
        gap: 'Sem comando de preview da build',
        impact: 'Dificuldade de testar build antes do deploy',
        solution: 'Adicionar script "preview" no package.json'
      });
    }

    // Gap 3: Configuração de deploy
    const hasDeployConfig = Object.keys(this.analysis.deploymentConfig).length > 0;
    if (!hasDeployConfig) {
      gaps.push({
        category: 'Deploy',
        gap: 'Sem configuração específica de deploy',
        impact: 'Deploy manual e propenso a erros',
        solution: 'Configurar vercel.json, netlify.toml ou firebase.json'
      });
    }

    // Gap 4: Estratégia de branches
    if (this.analysis.gitInfo.available && !this.analysis.gitInfo.isMainBranch) {
      gaps.push({
        category: 'Versionamento',
        gap: 'Não está na branch principal',
        impact: 'Pode estar em branch de desenvolvimento',
        solution: 'Verificar se está na branch correta para ambiente'
      });
    }

    // Gap 5: Logs e debugging
    const removeConsoleScript = this.analysis.scripts.customScripts.includes('remove-console-prod');
    if (!removeConsoleScript) {
      gaps.push({
        category: 'Debugging',
        gap: 'Sem remoção automática de console.log em produção',
        impact: 'Logs de debug expostos em produção',
        solution: 'Implementar remoção de console.log no build de produção'
      });
    }

    this.analysis.devProdGaps = gaps;
    console.log(`🔍 ${gaps.length} gaps identificados entre DEV e PROD`);
  }

  // ===== GERAÇÃO DE RELATÓRIO =====

  generateEnvironmentReport() {
    const timestamp = this.currentDateTime.toLocaleString('pt-BR');

    return `# 🔧 RELATÓRIO DE AMBIENTE - SICEFSUS

**📅 Gerado em:** ${timestamp}  
**🔧 Ambiente Detectado:** ${this.analysis.currentEnvironment.toUpperCase()}  
**📊 Status:** ${this.analysis.issues.length > 0 ? 'Requer Atenção' : 'Configurado'}

---

## 📊 RESUMO EXECUTIVO

- **Ambiente Atual:** ${this.analysis.currentEnvironment}
- **Arquivos de Configuração:** ${this.analysis.environmentFiles.filter(f => f.exists).length}/${this.analysis.environmentFiles.length}
- **Problemas Identificados:** ${this.analysis.issues.length}
- **Recomendações:** ${this.analysis.recommendations.length}
- **Gaps DEV/PROD:** ${this.analysis.devProdGaps.length}

---

## 🔧 CONFIGURAÇÃO ATUAL

### 📁 Arquivos de Ambiente

| Arquivo | Status | Variáveis | Observações |
|---------|--------|-----------|-------------|
${this.analysis.environmentFiles.map(f => 
  `| \`${f.file}\` | ${f.exists ? '✅' : '❌'} | ${f.exists ? Object.keys(f.variables).length : 0} | ${f.exists ? 'Configurado' : 'Não encontrado'} |`
).join('\n')}

### 🔥 Configuração Firebase

- **Status:** ${this.analysis.firebaseConfig.exists ? '✅ Configurado' : '❌ Não encontrado'}
${this.analysis.firebaseConfig.exists ? `- **Método:** ${this.analysis.firebaseConfig.configMethod}
- **Usa Env Vars:** ${this.analysis.firebaseConfig.usesEnvVars ? '✅' : '❌'}` : ''}

### 📦 Scripts Disponíveis

- **Desenvolvimento:** \`${this.analysis.scripts.dev}\`
- **Build:** \`${this.analysis.scripts.build}\`
- **Preview:** \`${this.analysis.scripts.preview}\`
- **Scripts Customizados:** ${this.analysis.scripts.customScripts.length} encontrados

### 🚀 Configurações de Deploy

${Object.keys(this.analysis.deploymentConfig).length > 0 ? 
  Object.keys(this.analysis.deploymentConfig).map(platform => 
    `- **${platform.toUpperCase()}:** ✅ Configurado`
  ).join('\n') : 
  '- ❌ Nenhuma configuração de deploy específica encontrada'
}

### 📋 Informações Git

${this.analysis.gitInfo.available ? 
  `- **Branch:** ${this.analysis.gitInfo.currentBranch}
- **Último Commit:** ${this.analysis.gitInfo.lastCommit}
- **Mudanças Pendentes:** ${this.analysis.gitInfo.hasUncommittedChanges ? '⚠️ Sim' : '✅ Não'}` :
  '- ❌ Git não disponível'
}

### 🏗️ Status do Build

- **Pasta dist:** ${this.analysis.buildInfo.hasDist ? '✅ Existe' : '❌ Não encontrada'}
- **Backup dist:** ${this.analysis.buildInfo.hasDistBackup ? '✅ Existe' : '❌ Não encontrada'}
${this.analysis.buildInfo.lastBuildTime ? `- **Último Build:** ${this.analysis.buildInfo.lastBuildTime.toLocaleString('pt-BR')}` : ''}

---

## 🚨 PROBLEMAS IDENTIFICADOS

${this.analysis.issues.length > 0 ? 
  this.analysis.issues.map(issue => 
    `### ${issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'} ${issue.type.replace(/_/g, ' ').toUpperCase()}

**Problema:** ${issue.message}  
**Recomendação:** ${issue.recommendation}  
**Severidade:** ${issue.severity.toUpperCase()}

`
  ).join('') : 
  '✅ **Nenhum problema crítico identificado!**\n'
}

---

## 💡 RECOMENDAÇÕES

${this.analysis.recommendations.length > 0 ? 
  this.analysis.recommendations.map(rec => 
    `### ${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.type.replace(/_/g, ' ').toUpperCase()}

**Situação:** ${rec.message}  
**Benefício:** ${rec.benefit}  
**Prioridade:** ${rec.priority.toUpperCase()}

`
  ).join('') : 
  '✅ **Sistema bem configurado!**\n'
}

---

## 🔄 GAPS DEV vs PROD

${this.analysis.devProdGaps.length > 0 ? 
  this.analysis.devProdGaps.map(gap => 
    `### 📋 ${gap.category}

**Gap Identificado:** ${gap.gap}  
**Impacto:** ${gap.impact}  
**Solução Sugerida:** ${gap.solution}

`
  ).join('') : 
  '✅ **Excelente separação entre ambientes detectada!**\n'
}

---

## 🎯 PLANO DE AÇÃO RECOMENDADO

### Fase 1 - Correções Críticas
${this.analysis.issues.filter(i => i.severity === 'high').map(issue => `- ${issue.recommendation}`).join('\n') || '✅ Nenhuma correção crítica necessária'}

### Fase 2 - Melhorias de Ambiente
${this.analysis.recommendations.filter(r => r.priority === 'high').map(rec => `- ${rec.message}`).join('\n') || '✅ Configuração de ambiente adequada'}

### Fase 3 - Otimizações
${this.analysis.devProdGaps.slice(0, 3).map(gap => `- ${gap.solution}`).join('\n') || '✅ Ambiente otimizado'}

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Desenvolvimento
- [${this.analysis.environmentFiles.find(f => f.file === '.env.development')?.exists ? 'x' : ' '}] Arquivo .env.development
- [${this.analysis.scripts.hasDevCommand ? 'x' : ' '}] Comando de desenvolvimento
- [${this.analysis.gitInfo.available ? 'x' : ' '}] Controle de versão Git

### Produção  
- [${this.analysis.environmentFiles.find(f => f.file === '.env.production')?.exists ? 'x' : ' '}] Arquivo .env.production
- [${this.analysis.scripts.hasBuildCommand ? 'x' : ' '}] Comando de build
- [${Object.keys(this.analysis.deploymentConfig).length > 0 ? 'x' : ' '}] Configuração de deploy

### Segurança
- [${this.analysis.firebaseConfig.usesEnvVars ? 'x' : ' '}] Firebase usando env vars
- [${this.analysis.scripts.customScripts.includes('remove-console-prod') ? 'x' : ' '}] Remoção de logs em prod
- [${!this.analysis.gitInfo.hasUncommittedChanges ? 'x' : ' '}] Código versionado

---

**🔧 Para executar novamente:** \`node scripts/detectEnvironment.cjs\`  
**📋 Próxima validação recomendada:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
`;
  }

  // ===== MÉTODO PRINCIPAL =====

  async analyze() {
    console.log('🔍 DETECTOR DE AMBIENTE SICEFSUS v1.0');
    console.log('='.repeat(60));

    this.detectCurrentEnvironment();
    this.analyzeEnvironmentFiles();
    this.analyzeFirebaseConfig();
    this.analyzePackageScripts();
    this.analyzeDeploymentConfig();
    this.analyzeGitInfo();
    this.analyzeBuildInfo();
    this.validateRequiredEnvironmentVariables();
    this.identifyDevProdGaps();

    console.log('\n✅ Análise de ambiente concluída!');
  }

  saveReport() {
    const report = this.generateEnvironmentReport();
    const timestamp = this.currentDateTime.toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `relatorio-ambiente-${timestamp}.md`;
    const filepath = path.join(this.projectRoot, filename);

    fs.writeFileSync(filepath, report, 'utf8');

    console.log(`\n📄 Relatório salvo: ${filename}`);
    console.log(`📊 ${this.analysis.issues.length} problemas identificados`);
    console.log(`💡 ${this.analysis.recommendations.length} recomendações geradas`);
    console.log(`🔄 ${this.analysis.devProdGaps.length} gaps DEV/PROD encontrados`);

    return filepath;
  }

  async run() {
    try {
      await this.analyze();
      const reportPath = this.saveReport();

      console.log('\n🎉 Processo concluído com sucesso!');
      console.log(`📋 Relatório detalhado: ${path.basename(reportPath)}`);

      // Resumo final
      if (this.analysis.issues.length > 0) {
        console.log(`\n🚨 ATENÇÃO: ${this.analysis.issues.length} problema(s) identificado(s)`);
        console.log('📋 Consulte o relatório para detalhes e soluções');
      } else {
        console.log('\n✅ Ambiente configurado corretamente!');
      }

    } catch (error) {
      console.error('\n❌ Erro durante análise:', error.message);
      process.exit(1);
    }
  }
}

// 🚀 EXECUTAR SCRIPT
if (require.main === module) {
  const detector = new EnvironmentDetector();
  detector.run();
}

module.exports = EnvironmentDetector;