/**
 * 🔍 VALIDADOR UNIFICADO DO SISTEMA SICEFSUS v1.0
 * Script orquestrador que executa todas as validações e análises
 * Integra: ambiente, documentação, estrutura e validações específicas
 * 
 * Uso: node scripts/validate-system.cjs [--quick] [--full] [--deploy]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SystemValidator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.scriptsPath = path.join(this.projectRoot, 'scripts');
    this.currentDateTime = new Date();

    // 🎯 Configuração de execução
    this.config = {
      mode: 'standard', // quick, standard, full, deploy
      parallel: false,
      verbose: true,
      generateReports: true,
      stopOnError: false
    };

    // 📊 Resultados consolidados
    this.results = {
      summary: {
        totalValidations: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        executionTime: 0,
        overallStatus: 'unknown'
      },
      validations: [],
      reports: [],
      recommendations: [],
      criticalIssues: [],
      environment: {},
      documentation: {},
      structure: {}
    };

    // 🔧 Scripts disponíveis e suas configurações
    this.availableScripts = {
      'check-env.cjs': {
        name: 'Validação Rápida de Ambiente',
        description: 'Verificação básica de variáveis de ambiente',
        category: 'environment',
        executionTime: 'quick',
        required: true,
        modes: ['quick', 'standard', 'full', 'deploy']
      },
      'detectEnvironment.cjs': {
        name: 'Análise Completa de Ambiente',
        description: 'Validação detalhada DEV/PROD e configurações',
        category: 'environment',
        executionTime: 'medium',
        required: true,
        modes: ['standard', 'full', 'deploy']
      },
      'generateHandover.cjs': {
        name: 'Documentação Técnica',
        description: 'Análise de código e geração de documentação',
        category: 'documentation',
        executionTime: 'slow',
        required: false,
        modes: ['full']
      },
      'project-analyzer.js': {
        name: 'Análise Estrutural',
        description: 'Estrutura de arquivos e relacionamentos',
        category: 'structure',
        executionTime: 'medium',
        required: false,
        modes: ['full']
      },
      'remove-console-prod.cjs': {
        name: 'Limpeza de Logs',
        description: 'Remove console.log para produção',
        category: 'deployment',
        executionTime: 'quick',
        required: false,
        modes: ['deploy']
      }
    };
  }

  // ===== DETECÇÃO DE SCRIPTS DISPONÍVEIS =====

  detectAvailableScripts() {
    console.log('🔍 Detectando scripts disponíveis...');

    const detectedScripts = {};

    Object.keys(this.availableScripts).forEach(scriptName => {
      const scriptPath = path.join(this.scriptsPath, scriptName);
      const exists = fs.existsSync(scriptPath);

      detectedScripts[scriptName] = {
        ...this.availableScripts[scriptName],
        available: exists,
        path: scriptPath
      };

      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${scriptName} - ${detectedScripts[scriptName].name}`);
    });

    this.availableScripts = detectedScripts;

    const availableCount = Object.values(detectedScripts).filter(s => s.available).length;
    const totalCount = Object.keys(detectedScripts).length;

    console.log(`📊 Scripts detectados: ${availableCount}/${totalCount} disponíveis`);

    return availableCount > 0;
  }

  // ===== CONFIGURAÇÃO DE MODO DE EXECUÇÃO =====

  configureModeFromArgs() {
    const args = process.argv.slice(2);

    if (args.includes('--quick')) {
      this.config.mode = 'quick';
      console.log('⚡ Modo: VALIDAÇÃO RÁPIDA');
    } else if (args.includes('--full')) {
      this.config.mode = 'full';
      console.log('🔍 Modo: ANÁLISE COMPLETA');
    } else if (args.includes('--deploy')) {
      this.config.mode = 'deploy';
      console.log('🚀 Modo: VALIDAÇÃO DE DEPLOY');
    } else {
      this.config.mode = 'standard';
      console.log('📊 Modo: VALIDAÇÃO PADRÃO');
    }

    if (args.includes('--parallel')) {
      this.config.parallel = true;
      console.log('⚡ Execução paralela habilitada');
    }

    if (args.includes('--silent')) {
      this.config.verbose = false;
      console.log('🔇 Modo silencioso ativado');
    }

    if (args.includes('--no-reports')) {
      this.config.generateReports = false;
      console.log('📄 Geração de relatórios desabilitada');
    }

    if (args.includes('--stop-on-error')) {
      this.config.stopOnError = true;
      console.log('🛑 Parar na primeira falha');
    }
  }

  // ===== EXECUÇÃO DE SCRIPT INDIVIDUAL =====

  async executeScript(scriptName, scriptConfig) {
    const startTime = Date.now();

    console.log(`\n🔄 Executando: ${scriptConfig.name}`);
    if (this.config.verbose) {
      console.log(`   📝 ${scriptConfig.description}`);
    }

    const validation = {
      script: scriptName,
      name: scriptConfig.name,
      category: scriptConfig.category,
      status: 'running',
      startTime,
      endTime: null,
      duration: 0,
      output: '',
      error: null,
      warnings: [],
      issues: [],
      success: false
    };

    try {
      // Verificar se script existe
      if (!scriptConfig.available) {
        throw new Error(`Script não encontrado: ${scriptPath}`);
      }

      // Executar script
      const output = execSync(`node "${scriptConfig.path}"`, {
        encoding: 'utf8',
        cwd: this.projectRoot,
        timeout: 120000, // 2 minutos timeout
        stdio: this.config.verbose ? 'pipe' : 'pipe'
      });

      validation.output = output;
      validation.success = true;
      validation.status = 'completed';

      // Analisar saída para detectar warnings/issues
      this.analyzeScriptOutput(validation, output);

      const duration = Date.now() - startTime;
      validation.endTime = Date.now();
      validation.duration = duration;

      console.log(`✅ ${scriptConfig.name} concluído (${duration}ms)`);

      if (validation.warnings.length > 0) {
        console.log(`⚠️  ${validation.warnings.length} aviso(s) detectado(s)`);
      }

      this.results.summary.passed++;

    } catch (error) {
      validation.error = error.message;
      validation.status = 'failed';
      validation.success = false;
      validation.endTime = Date.now();
      validation.duration = Date.now() - startTime;

      console.error(`❌ ${scriptConfig.name} falhou: ${error.message}`);

      this.results.summary.failed++;
      this.results.criticalIssues.push({
        script: scriptName,
        issue: error.message,
        category: scriptConfig.category,
        severity: 'high'
      });

      if (this.config.stopOnError) {
        throw new Error(`Execução interrompida devido a falha em: ${scriptName}`);
      }
    }

    this.results.validations.push(validation);
    this.results.summary.totalValidations++;

    return validation;
  }

  // ===== ANÁLISE DE SAÍDA DOS SCRIPTS =====

  analyzeScriptOutput(validation, output) {
    // Detectar warnings comuns
    const warningPatterns = [
      /⚠️.*$/gm,
      /ATENÇÃO.*$/gm,
      /WARNING.*$/gm,
      /problema.*encontrado/gim,
      /recomenda.*$/gm
    ];

    const issuePatterns = [
      /❌.*$/gm,
      /ERROR.*$/gm,
      /ERRO.*$/gm,
      /crítico.*$/gim,
      /falha.*$/gim
    ];

    warningPatterns.forEach(pattern => {
      const matches = output.match(pattern);
      if (matches) {
        validation.warnings.push(...matches);
        this.results.summary.warnings += matches.length;
      }
    });

    issuePatterns.forEach(pattern => {
      const matches = output.match(pattern);
      if (matches) {
        validation.issues.push(...matches);
      }
    });

    // Extrair métricas específicas
    if (validation.script === 'detectEnvironment.cjs') {
      const envMatch = output.match(/Ambiente Detectado:\s*(\w+)/i);
      if (envMatch) {
        this.results.environment.current = envMatch[1];
      }

      const issuesMatch = output.match(/(\d+)\s*problema.*identificado/i);
      if (issuesMatch) {
        this.results.environment.issues = parseInt(issuesMatch[1]);
      }
    }

    if (validation.script === 'generateHandover.cjs') {
      const filesMatch = output.match(/(\d+)\s*componentes.*documentados/i);
      if (filesMatch) {
        this.results.documentation.components = parseInt(filesMatch[1]);
      }

      const refactorMatch = output.match(/(\d+)\s*arquivos.*refatoração/i);
      if (refactorMatch) {
        this.results.documentation.refactoringNeeded = parseInt(refactorMatch[1]);
      }
    }
  }

  // ===== EXECUÇÃO SEQUENCIAL =====

  async executeSequential() {
    console.log('📋 Executando validações sequencialmente...');

    const scriptsToRun = Object.entries(this.availableScripts)
      .filter(([name, config]) => 
        config.available && 
        config.modes.includes(this.config.mode) &&
        (config.required || this.config.mode === 'full')
      )
      .sort(([,a], [,b]) => {
        // Ordem de prioridade: quick -> medium -> slow
        const order = { quick: 0, medium: 1, slow: 2 };
        return order[a.executionTime] - order[b.executionTime];
      });

    console.log(`🎯 ${scriptsToRun.length} script(s) para executar no modo ${this.config.mode}`);

    for (const [scriptName, scriptConfig] of scriptsToRun) {
      await this.executeScript(scriptName, scriptConfig);

      // Pequena pausa entre execuções
      if (scriptsToRun.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // ===== GERAÇÃO DE RELATÓRIO CONSOLIDADO =====

  generateConsolidatedReport() {
    const timestamp = this.currentDateTime.toLocaleString('pt-BR');
    const duration = this.results.summary.executionTime;

    // Determinar status geral
    if (this.results.summary.failed > 0) {
      this.results.summary.overallStatus = 'FAILED';
    } else if (this.results.summary.warnings > 0) {
      this.results.summary.overallStatus = 'WARNING';
    } else {
      this.results.summary.overallStatus = 'SUCCESS';
    }

    const statusEmoji = {
      'SUCCESS': '✅',
      'WARNING': '⚠️',
      'FAILED': '❌'
    }[this.results.summary.overallStatus];

    return `# 🔍 RELATÓRIO DE VALIDAÇÃO UNIFICADA - SICEFSUS

**📅 Executado em:** ${timestamp}  
**🔧 Modo de Execução:** ${this.config.mode.toUpperCase()}  
**📊 Status Geral:** ${statusEmoji} ${this.results.summary.overallStatus}  
**⏱️ Tempo Total:** ${duration}ms

---

## 📊 RESUMO EXECUTIVO

| Métrica | Valor | Status |
|---------|-------|--------|
| **Validações Executadas** | ${this.results.summary.totalValidations} | ${this.results.summary.totalValidations > 0 ? '✅' : '❌'} |
| **Sucessos** | ${this.results.summary.passed} | ${this.results.summary.passed > 0 ? '✅' : '➖'} |
| **Falhas** | ${this.results.summary.failed} | ${this.results.summary.failed === 0 ? '✅' : '❌'} |
| **Avisos** | ${this.results.summary.warnings} | ${this.results.summary.warnings === 0 ? '✅' : '⚠️'} |
| **Problemas Críticos** | ${this.results.criticalIssues.length} | ${this.results.criticalIssues.length === 0 ? '✅' : '🔴'} |

---

## 🔍 DETALHAMENTO DAS VALIDAÇÕES

${this.results.validations.map(validation => `
### ${validation.success ? '✅' : '❌'} ${validation.name}

- **Categoria:** ${validation.category}
- **Status:** ${validation.status}
- **Duração:** ${validation.duration}ms
- **Avisos:** ${validation.warnings.length}
- **Problemas:** ${validation.issues.length}

${validation.warnings.length > 0 ? `**⚠️ Avisos Detectados:**
${validation.warnings.slice(0, 3).map(w => `- ${w.trim()}`).join('\n')}
${validation.warnings.length > 3 ? `- ... e mais ${validation.warnings.length - 3} aviso(s)` : ''}` : ''}

${validation.error ? `**❌ Erro:** ${validation.error}` : ''}
`).join('\n')}

---

## 🎯 INFORMAÇÕES DO AMBIENTE

${this.results.environment.current ? `- **Ambiente Detectado:** ${this.results.environment.current}` : ''}
${this.results.environment.issues ? `- **Problemas de Ambiente:** ${this.results.environment.issues}` : ''}

---

## 📋 INFORMAÇÕES DE DOCUMENTAÇÃO

${this.results.documentation.components ? `- **Componentes Documentados:** ${this.results.documentation.components}` : ''}
${this.results.documentation.refactoringNeeded ? `- **Arquivos Precisam Refatoração:** ${this.results.documentation.refactoringNeeded}` : ''}

---

${this.results.criticalIssues.length > 0 ? `## 🚨 PROBLEMAS CRÍTICOS

${this.results.criticalIssues.map(issue => `
### 🔴 ${issue.script}
**Problema:** ${issue.issue}  
**Categoria:** ${issue.category}  
**Severidade:** ${issue.severity}
`).join('\n')}

---
` : ''}

## 💡 RECOMENDAÇÕES

${this.generateRecommendations()}

---

## 🎯 PRÓXIMOS PASSOS

### Ação Imediata
${this.results.summary.failed > 0 ? 
  '🔴 **Corrigir falhas críticas antes de prosseguir**' : 
  '✅ **Sistema validado com sucesso**'
}

### Melhorias Sugeridas
${this.results.summary.warnings > 0 ? 
  `⚠️ **Revisar ${this.results.summary.warnings} aviso(s) detectado(s)**` : 
  '✅ **Nenhuma melhoria crítica necessária**'
}

### Monitoramento
- 📅 **Próxima validação recomendada:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
- 🔄 **Frequência sugerida:** Semanal (ou antes de deploys importantes)

---

## 📋 COMANDOS ÚTEIS

\`\`\`bash
# Validação rápida (apenas ambiente)
node scripts/validate-system.cjs --quick

# Validação padrão (ambiente + básico)
node scripts/validate-system.cjs

# Análise completa (todos os scripts)
node scripts/validate-system.cjs --full

# Validação para deploy
node scripts/validate-system.cjs --deploy

# Execução silenciosa
node scripts/validate-system.cjs --silent

# Parar na primeira falha
node scripts/validate-system.cjs --stop-on-error
\`\`\`

---

**🔧 Executado por:** validate-system.cjs v1.0  
**📅 Próxima execução sugerida:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
`;
  }

  generateRecommendations() {
    const recommendations = [];

    // Recomendações baseadas em falhas
    if (this.results.summary.failed > 0) {
      recommendations.push('🔴 **Prioridade Alta:** Corrigir scripts que falharam antes de deploy');
    }

    // Recomendações baseadas em avisos
    if (this.results.summary.warnings > 5) {
      recommendations.push('⚠️ **Revisar configuração:** Muitos avisos detectados');
    }

    // Recomendações baseadas no ambiente
    if (this.results.environment.issues > 0) {
      recommendations.push('🔧 **Configuração:** Resolver problemas de ambiente detectados');
    }

    // Recomendações baseadas na documentação
    if (this.results.documentation.refactoringNeeded > 10) {
      recommendations.push('📝 **Refatoração:** Considerar refatoração de arquivos monolíticos');
    }

    // Recomendações baseadas no modo
    if (this.config.mode === 'quick') {
      recommendations.push('🔍 **Análise:** Considere executar `--full` para análise completa');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ **Sistema em ótimo estado!** Continue com as boas práticas');
    }

    return recommendations.map(rec => `- ${rec}`).join('\n');
  }

  // ===== SALVAMENTO DE RELATÓRIO =====

  saveConsolidatedReport() {
    if (!this.config.generateReports) {
      console.log('📄 Geração de relatórios desabilitada');
      return null;
    }

    const report = this.generateConsolidatedReport();
    const timestamp = this.currentDateTime.toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `validacao-sistema-${this.config.mode}-${timestamp}.md`;
    const filepath = path.join(this.projectRoot, filename);

    try {
      fs.writeFileSync(filepath, report, 'utf8');
      console.log(`📄 Relatório consolidado salvo: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('❌ Erro ao salvar relatório:', error.message);
      return null;
    }
  }

  // ===== MÉTODO PRINCIPAL =====

  async validate() {
    const startTime = Date.now();

    try {
      // 1. Configurar modo de execução
      this.configureModeFromArgs();

      // 2. Detectar scripts disponíveis
      const hasScripts = this.detectAvailableScripts();
      if (!hasScripts) {
        throw new Error('Nenhum script de validação encontrado');
      }

      // 3. Executar validações
      await this.executeSequential();

      // 4. Calcular tempo total
      this.results.summary.executionTime = Date.now() - startTime;

      // 5. Gerar relatório
      const reportPath = this.saveConsolidatedReport();

      // 6. Exibir resumo final
      this.displayFinalSummary(reportPath);

      // 7. Exit code baseado no resultado
      const exitCode = this.results.summary.failed > 0 ? 1 : 0;
      return exitCode;

    } catch (error) {
      console.error('\n❌ Erro crítico durante validação:', error.message);
      this.results.summary.executionTime = Date.now() - startTime;
      return 1;
    }
  }

  displayFinalSummary(reportPath) {
    const { summary } = this.results;

    console.log('\n🎉 VALIDAÇÃO UNIFICADA CONCLUÍDA');
    console.log('='.repeat(50));
    console.log(`📊 Status: ${summary.overallStatus}`);
    console.log(`✅ Sucessos: ${summary.passed}/${summary.totalValidations}`);
    console.log(`❌ Falhas: ${summary.failed}`);
    console.log(`⚠️ Avisos: ${summary.warnings}`);
    console.log(`⏱️ Tempo: ${summary.executionTime}ms`);

    if (reportPath) {
      console.log(`📄 Relatório: ${path.basename(reportPath)}`);
    }

    if (summary.failed > 0) {
      console.log('\n🚨 ATENÇÃO: Falhas detectadas!');
      console.log('📋 Consulte o relatório para detalhes');
    } else if (summary.warnings > 0) {
      console.log('\n⚠️ Sistema funcional com avisos');
    } else {
      console.log('\n✅ Sistema completamente validado!');
    }

    console.log('\n💡 Próxima validação recomendada: 7 dias');
  }

  // ===== MÉTODO DE EXECUÇÃO =====

  async run() {
    console.log('🔍 VALIDADOR UNIFICADO SICEFSUS v1.0');
    console.log('='.repeat(60));

    try {
      const exitCode = await this.validate();
      process.exit(exitCode);
    } catch (error) {
      console.error('💥 Erro fatal:', error.message);
      process.exit(1);
    }
  }
}

// ===== FUNÇÃO DE AJUDA =====

function showHelp() {
  console.log(`
🔍 VALIDADOR UNIFICADO SICEFSUS

Executa todas as validações e análises do sistema de forma orquestrada.

MODO DE USO:
  node scripts/validate-system.cjs [opções]

MODOS DE EXECUÇÃO:
  --quick     Validação rápida (apenas ambiente básico)
  --standard  Validação padrão (ambiente + validações essenciais) [PADRÃO]
  --full      Análise completa (todos os scripts disponíveis)
  --deploy    Validação para deploy (ambiente + limpeza)

OPÇÕES ADICIONAIS:
  --parallel        Execução paralela quando possível
  --silent          Modo silencioso (menos output)
  --no-reports      Não gerar relatórios em arquivo
  --stop-on-error   Parar na primeira falha
  --help            Exibir esta ajuda

EXEMPLOS:
  # Validação rápida antes de começar trabalho
  node scripts/validate-system.cjs --quick

  # Validação completa semanal
  node scripts/validate-system.cjs --full

  # Validação antes de deploy
  node scripts/validate-system.cjs --deploy --stop-on-error

  # Execução silenciosa para CI/CD
  node scripts/validate-system.cjs --silent --no-reports

SCRIPTS INTEGRADOS:
  ✅ check-env.cjs           - Validação rápida de ambiente
  ✅ detectEnvironment.cjs   - Análise completa de ambiente  
  ✅ generateHandover.cjs    - Documentação técnica
  ✅ project-analyzer.js     - Análise estrutural
  ✅ remove-console-prod.cjs - Limpeza para produção
`);
}

// 🚀 EXECUTAR SCRIPT
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const validator = new SystemValidator();
  validator.run();
}

module.exports = SystemValidator;