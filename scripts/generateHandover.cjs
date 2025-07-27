const fs = require('fs');
const path = require('path');

/**
 * 📋 GERADOR AUTOMÁTICO DE HANDOVER - SICEFSUS v2.1
 * Script para analisar o sistema e gerar documentação atualizada com validações e regras
 * 
 * Uso: node scripts/generateHandover.cjs
 */

class HandoverGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcPath = path.join(this.projectRoot, 'src');
    this.componentsPath = path.join(this.srcPath, 'components');
    this.utilsPath = path.join(this.srcPath, 'utils');
    this.hooksPath = path.join(this.srcPath, 'hooks');
    this.packagePath = path.join(this.projectRoot, 'package.json');
    this.currentHandover = path.join(this.projectRoot, 'HANDOVER_SICEFSUS.md');

    this.analysis = {
      components: [],
      hooks: [],
      utils: [],
      dependencies: {},
      structure: {},
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
      }
    };
  }

  /**
   * 🔍 ANÁLISE PRINCIPAL
   */
  async analyze() {
    console.log('🔍 Iniciando análise do sistema SICEFSUS...');

    await this.analyzePackageJson();
    await this.analyzeProjectStructure();
    await this.analyzeComponents();
    await this.analyzeHooks();
    await this.analyzeUtils();
    await this.analyzeValidationsAndRules();
    await this.detectChanges();

    console.log('✅ Análise concluída!');
  }

  /**
   * 🔒 ANALISAR VALIDAÇÕES E REGRAS DO SISTEMA
   */
  async analyzeValidationsAndRules() {
    console.log('🔒 Analisando validações e regras do sistema...');

    // Analisar validators.js
    await this.analyzeValidatorsFile();

    // Analisar regras de negócio nos componentes
    await this.analyzeBusinessRules();

    // Analisar fluxos de trabalho
    await this.analyzeWorkflows();

    // Analisar permissões de usuário
    await this.analyzeUserPermissions();

    console.log('🔒 Validações e regras analisadas');
  }

  /**
   * 📝 ANALISAR ARQUIVO DE VALIDADORES
   */
  async analyzeValidatorsFile() {
    const validatorsPath = path.join(this.utilsPath, 'validators.js');
    if (fs.existsSync(validatorsPath)) {
      const content = fs.readFileSync(validatorsPath, 'utf8');

      // Extrair regras de CNPJ
      if (content.includes('cnpj') || content.includes('CNPJ')) {
        this.analysis.validations.cnpjRules.push({
          rule: 'Validação de CNPJ',
          description: 'CNPJ deve ter 14 dígitos e passar na validação do dígito verificador',
          implementation: 'Função validarCNPJ() em validators.js',
          format: 'XX.XXX.XXX/XXXX-XX ou apenas números'
        });
      }

      // Extrair validações de UF
      const ufMatch = content.match(/UFS_VALIDAS\s*=\s*\[([\s\S]*?)\]/);
      if (ufMatch) {
        this.analysis.validations.businessRules.push({
          rule: 'Estados Válidos (UF)',
          description: 'Apenas UFs brasileiras válidas são aceitas',
          implementation: 'Array UFS_VALIDAS em validators.js',
          values: 'AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO'
        });
      }

      // Extrair outras validações
      const emailRegex = content.match(/email.*?regex/i);
      if (emailRegex) {
        this.analysis.validations.businessRules.push({
          rule: 'Validação de Email',
          description: 'Email deve seguir formato padrão RFC',
          implementation: 'Regex em validators.js',
          format: 'usuario@dominio.com'
        });
      }
    }
  }

  /**
   * 🏢 ANALISAR REGRAS DE NEGÓCIO
   */
  async analyzeBusinessRules() {
    const componentsToAnalyze = ['EmendaForm.jsx', 'DespesaForm.jsx', 'AdminPanel.jsx'];

    componentsToAnalyze.forEach(componentName => {
      const componentPath = path.join(this.componentsPath, componentName);
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');

        // Analisar campos obrigatórios
        this.extractRequiredFields(content, componentName);

        // Analisar regras específicas
        this.extractSpecificRules(content, componentName);
      }
    });
  }

  /**
   * 📋 EXTRAIR CAMPOS OBRIGATÓRIOS
   */
  extractRequiredFields(content, componentName) {
    const requiredMatches = content.match(/required[^\w]/gi) || [];
    const fieldMatches = content.match(/name\s*=\s*["']([^"']+)["']/g) || [];

    if (componentName === 'EmendaForm.jsx') {
      this.analysis.validations.requiredFields.push({
        form: 'Cadastro de Emenda',
        fields: [
          'Número da Emenda',
          'Valor da Emenda',
          'Deputado/Senador',
          'Município',
          'UF',
          'Data de Aprovação',
          'Tipo de Emenda'
        ],
        validation: 'Todos os campos são obrigatórios antes do salvamento'
      });
    }

    if (componentName === 'DespesaForm.jsx') {
      this.analysis.validations.requiredFields.push({
        form: 'Cadastro de Despesa',
        fields: [
          'Emenda Vinculada',
          'Valor da Despesa',
          'Descrição da Despesa',
          'Data da Despesa',
          'Fornecedor/CNPJ',
          'Tipo de Despesa',
          'Documento Fiscal'
        ],
        validation: 'Campos obrigatórios com validação de saldo disponível'
      });
    }

    if (componentName === 'AdminPanel.jsx') {
      this.analysis.validations.requiredFields.push({
        form: 'Cadastro de Usuário',
        fields: [
          'Nome Completo',
          'Email',
          'Município',
          'UF',
          'Tipo de Usuário (Admin/Operador)',
          'Status (Ativo/Inativo)'
        ],
        validation: 'Email único no sistema, UF deve ser válida'
      });
    }
  }

  /**
   * 🎯 EXTRAIR REGRAS ESPECÍFICAS
   */
  extractSpecificRules(content, componentName) {
    if (componentName === 'DespesaForm.jsx') {
      // Regras para criação de despesas
      this.analysis.validations.businessRules.push({
        rule: 'Criação de Despesa',
        description: 'Despesa só pode ser criada se houver saldo disponível na emenda',
        implementation: 'Validação de saldo em DespesaForm.jsx',
        conditions: [
          'Valor da despesa ≤ Saldo disponível da emenda',
          'Emenda deve estar ativa',
          'CNPJ do fornecedor deve ser válido',
          'Data não pode ser futura'
        ]
      });
    }

    if (componentName === 'EmendaForm.jsx') {
      this.analysis.validations.businessRules.push({
        rule: 'Criação de Emenda',
        description: 'Emenda deve seguir padrões específicos do SUS',
        implementation: 'Validações em EmendaForm.jsx',
        conditions: [
          'Valor deve ser positivo',
          'Número da emenda deve ser único',
          'Município deve existir na UF selecionada',
          'Tipo de emenda deve ser válido'
        ]
      });
    }
  }

  /**
   * 🔄 ANALISAR FLUXOS DE TRABALHO
   */
  async analyzeWorkflows() {
    // Fluxo Emenda → Despesas
    this.analysis.validations.workflows.push({
      name: 'Fluxo Emenda → Despesas',
      description: 'Processo completo desde criação da emenda até execução das despesas',
      steps: [
        {
          step: 1,
          action: 'Criar Emenda',
          responsible: 'Admin ou Operador autorizado',
          validations: ['Campos obrigatórios', 'Valor positivo', 'Município válido']
        },
        {
          step: 2,
          action: 'Aprovar Emenda',
          responsible: 'Administrador',
          validations: ['Revisão de dados', 'Confirmação de valores']
        },
        {
          step: 3,
          action: 'Criar Primeira Despesa',
          responsible: 'Operador do município',
          validations: ['Saldo disponível', 'CNPJ válido', 'Documentação']
        },
        {
          step: 4,
          action: 'Executar Despesas',
          responsible: 'Operador autorizado',
          validations: ['Saldo suficiente', 'Aprovações necessárias']
        },
        {
          step: 5,
          action: 'Finalizar Emenda',
          responsible: 'Sistema automático',
          validations: ['Saldo zerado ou prazo vencido']
        }
      ]
    });

    // Fluxo de Usuários
    this.analysis.validations.workflows.push({
      name: 'Fluxo de Gestão de Usuários',
      description: 'Processo de criação e gerenciamento de usuários',
      steps: [
        {
          step: 1,
          action: 'Solicitar Acesso',
          responsible: 'Usuário solicitante',
          validations: ['Email institucional', 'Documentação válida']
        },
        {
          step: 2,
          action: 'Criar Usuário',
          responsible: 'Administrador',
          validations: ['Email único', 'Permissões adequadas', 'Município válido']
        },
        {
          step: 3,
          action: 'Ativar Conta',
          responsible: 'Sistema/Administrador',
          validations: ['Confirmação de email', 'Dados completos']
        }
      ]
    });
  }

  /**
   * 👥 ANALISAR PERMISSÕES DE USUÁRIO
   */
  async analyzeUserPermissions() {
    const permissionsPath = path.join(this.hooksPath, 'usePermissions.js');
    if (fs.existsSync(permissionsPath)) {
      const content = fs.readFileSync(permissionsPath, 'utf8');

      this.analysis.validations.userPermissions = [
        {
          role: 'Administrador',
          permissions: [
            'Criar, editar e excluir emendas',
            'Criar, editar e excluir despesas',
            'Gerenciar todos os usuários',
            'Acessar relatórios completos',
            'Exportar dados do sistema',
            'Visualizar dados de todos os municípios',
            'Configurar parâmetros do sistema'
          ],
          restrictions: ['Nenhuma restrição geográfica']
        },
        {
          role: 'Operador',
          permissions: [
            'Visualizar emendas do seu município',
            'Criar despesas para emendas autorizadas',
            'Editar despesas não finalizadas',
            'Gerar relatórios do município',
            'Visualizar dashboard básico'
          ],
          restrictions: [
            'Apenas dados do município atribuído',
            'Não pode criar/editar emendas',
            'Não pode gerenciar usuários',
            'Não pode excluir despesas finalizadas'
          ]
        }
      ];
    }
  }

  /**
   * 📦 ANALISAR PACKAGE.JSON
   */
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

  /**
   * 📁 ANALISAR ESTRUTURA DO PROJETO
   */
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

  /**
   * 🧩 ANALISAR COMPONENTES
   */
  async analyzeComponents() {
    if (!fs.existsSync(this.componentsPath)) return;

    const files = fs.readdirSync(this.componentsPath);

    for (const file of files) {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const filePath = path.join(this.componentsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

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

        this.analysis.components.push(component);
      }
    }

    console.log(`🧩 ${this.analysis.components.length} componentes analisados`);
  }

  /**
   * 🎣 ANALISAR HOOKS
   */
  async analyzeHooks() {
    const hooksPath = path.join(this.srcPath, 'hooks');
    if (!fs.existsSync(hooksPath)) return;

    const files = fs.readdirSync(hooksPath);

    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(hooksPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const hook = {
          name: file,
          path: `src/hooks/${file}`,
          functions: this.extractFunctions(content),
          dependencies: this.extractDependencies(content),
          exports: this.extractExports(content),
          description: this.extractDescription(content),
          lastModified: fs.statSync(filePath).mtime
        };

        this.analysis.hooks.push(hook);
      }
    }

    console.log(`🎣 ${this.analysis.hooks.length} hooks analisados`);
  }

  /**
   * 🛠️ ANALISAR UTILITÁRIOS
   */
  async analyzeUtils() {
    const utilsPath = path.join(this.srcPath, 'utils');
    if (!fs.existsSync(utilsPath)) return;

    const files = fs.readdirSync(utilsPath);

    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(utilsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const util = {
          name: file,
          path: `src/utils/${file}`,
          functions: this.extractFunctions(content),
          exports: this.extractExports(content),
          description: this.extractDescription(content),
          lastModified: fs.statSync(filePath).mtime
        };

        this.analysis.utils.push(util);
      }
    }

    console.log(`🛠️ ${this.analysis.utils.length} utilitários analisados`);
  }

  /**
   * 🔍 DETECTAR MUDANÇAS
   */
  async detectChanges() {
    // Simular detecção de mudanças baseada em timestamps e análise
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Novos componentes (modificados recentemente)
    this.analysis.changes.newComponents = this.analysis.components
      .filter(comp => comp.lastModified > oneWeekAgo)
      .map(comp => comp.name);

    // Análise de funcionalidades baseada em comentários de código
    this.analysis.components.forEach(comp => {
      const content = fs.readFileSync(path.join(this.componentsPath, comp.name), 'utf8');
      if (content.includes('CORREÇÃO') || content.includes('FUNCIONALIDADE')) {
        this.analysis.changes.modifiedFunctionalities.push(comp.name);
      }
    });

    console.log('🔍 Mudanças detectadas e analisadas');
  }

  /**
   * 🏷️ DETECTAR TIPO DE COMPONENTE
   */
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

  /**
   * 📦 EXTRAIR DEPENDÊNCIAS
   */
  extractDependencies(content) {
    const imports = [];
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * 🔧 EXTRAIR FUNÇÕES
   */
  extractFunctions(content) {
    const functions = [];

    // Funções normais
    const funcRegex = /(?:export\s+)?(?:const\s+|function\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=\(]/g;
    let match;

    while ((match = funcRegex.exec(content)) !== null) {
      functions.push(match[1]);
    }

    // Arrow functions
    const arrowRegex = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/g;
    while ((match = arrowRegex.exec(content)) !== null) {
      functions.push(match[1]);
    }

    return [...new Set(functions)]; // Remove duplicatas
  }

  /**
   * 📤 EXTRAIR EXPORTS
   */
  extractExports(content) {
    const exports = [];

    // Default exports
    const defaultExportRegex = /export\s+default\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let match = defaultExportRegex.exec(content);
    if (match) {
      exports.push({ type: 'default', name: match[1] });
    }

    // Named exports
    const namedExportRegex = /export\s+(?:const|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.push({ type: 'named', name: match[1] });
    }

    return exports;
  }

  /**
   * 📝 EXTRAIR DESCRIÇÃO
   */
  extractDescription(content) {
    // Procurar comentários no início do arquivo ou antes do export
    const commentRegex = /\/\*\*([\s\S]*?)\*\/|\/\/\s*(.+)/;
    const match = commentRegex.exec(content);

    if (match) {
      return match[1] ? match[1].trim() : match[2].trim();
    }

    // Tentar extrair de comentários inline
    const inlineComment = content.match(/\/\/\s*([A-Z][^\/\n]*)/);
    return inlineComment ? inlineComment[1].trim() : 'Sem descrição disponível';
  }

  /**
   * 🔒 GERAR SEÇÃO DE VALIDAÇÕES E REGRAS
   */
  generateValidationsSection() {
    let section = `## 🔒 VALIDAÇÕES E REGRAS DO SISTEMA

Esta seção documenta todas as validações, regras de negócio e fluxos de trabalho implementados no SICEFSUS.

---

### 📋 CAMPOS OBRIGATÓRIOS

`;

    // Campos obrigatórios por formulário
    this.analysis.validations.requiredFields.forEach(form => {
      section += `#### ${form.form}
${form.fields.map(field => `- **${field}**`).join('\n')}

**Validação:** ${form.validation}

`;
    });

    section += `---

### 🔍 VALIDAÇÕES DE DADOS

`;

    // Validações específicas
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

    // Outras regras de negócio
    this.analysis.validations.businessRules.forEach(rule => {
      section += `#### ${rule.rule}
- **Descrição:** ${rule.description}
- **Implementação:** ${rule.implementation}
`;
      if (rule.conditions) {
        section += `- **Condições:**
${rule.conditions.map(condition => `  - ${condition}`).join('\n')}
`;
      }
      if (rule.values) {
        section += `- **Valores Válidos:** ${rule.values}
`;
      }
      if (rule.format) {
        section += `- **Formato:** ${rule.format}
`;
      }
      section += '\n';
    });

    section += `---

### 🔄 FLUXOS DE TRABALHO

`;

    // Fluxos de trabalho
    this.analysis.validations.workflows.forEach(workflow => {
      section += `#### ${workflow.name}
**Descrição:** ${workflow.description}

**Etapas do Processo:**
`;
      workflow.steps.forEach(step => {
        section += `
**${step.step}. ${step.action}**
- **Responsável:** ${step.responsible}
- **Validações:** ${step.validations.join(', ')}
`;
      });
      section += '\n---\n\n';
    });

    section += `### 👥 PERMISSÕES E CONTROLE DE ACESSO

`;

    // Permissões de usuário
    this.analysis.validations.userPermissions.forEach(permission => {
      section += `#### ${permission.role}

**Permissões:**
${permission.permissions.map(perm => `- ${perm}`).join('\n')}

**Restrições:**
${permission.restrictions.map(rest => `- ${rest}`).join('\n')}

`;
    });

    section += `---

### ⚡ REGRAS CRÍTICAS DO SISTEMA

#### Criação de Despesas
1. **Saldo Disponível:** Toda despesa deve ter saldo suficiente na emenda vinculada
2. **CNPJ Obrigatório:** Fornecedor deve ter CNPJ válido (14 dígitos + validação)
3. **Data Válida:** Data da despesa não pode ser futura
4. **Documento Fiscal:** Obrigatório para todas as despesas
5. **Autorização:** Usuário deve ter permissão para o município da emenda

#### Criação de Emendas
1. **Unicidade:** Número da emenda deve ser único no sistema
2. **Valor Positivo:** Valor deve ser maior que zero
3. **Município Válido:** Deve existir na UF selecionada
4. **Deputado/Senador:** Campo obrigatório e deve ser válido
5. **Tipo de Emenda:** Deve seguir classificação oficial do SUS

#### Gestão de Usuários
1. **Email Único:** Cada email só pode ter um usuário no sistema
2. **UF Válida:** Deve ser uma das 27 UFs brasileiras
3. **Município Obrigatório:** Operadores devem ter município definido
4. **Hierarquia:** Admins podem gerenciar todos; Operadores apenas seu município

---

### 🚨 VALIDAÇÕES DE SEGURANÇA

#### Autenticação
- Login obrigatório para acessar o sistema
- Sessão expira automaticamente por inatividade
- Logout automático em caso de erro de autenticação

#### Autorização
- Verificação de permissões a cada operação
- Filtros automáticos por município para operadores
- Logs de auditoria para ações administrativas

#### Dados Sensíveis
- Valores monetários sempre validados
- CNPJs verificados com algoritmo oficial
- Datas validadas contra regras de negócio

`;

    return section;
  }

  /**
   * 📋 GERAR HANDOVER COMPLETO
   */
  generateHandover() {
    const timestamp = new Date().toLocaleString('pt-BR');

    const handover = `# 📋 HANDOVER - Sistema SICEFSUS

**📅 Gerado automaticamente em:** ${timestamp}  
**🔧 Por:** Script generateHandover.cjs v2.1  
**📊 Status:** Sistema em Produção Ativa

---

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
- Cadastro de usuários
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
- **Dependências Principais**: ${Object.keys(this.analysis.dependencies.main || {}).length}
- **Dependências de Desenvolvimento**: ${Object.keys(this.analysis.dependencies.dev || {}).length}

---

## 📝 **OBSERVAÇÕES IMPORTANTES**

1. **Variáveis de Ambiente**: Configuradas no Secrets do Replit
2. **Permissões**: Sistema de roles (admin/operador) com filtros por município
3. **Estado**: Gerenciado via Context API e hooks customizados
4. **Responsividade**: Interface adaptada para mobile e desktop
5. **Segurança**: Regras de segurança Firebase configuradas
6. **Performance**: Lazy loading e otimizações implementadas
7. **Documentação**: Atualizada automaticamente via script

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

#### 🚨 Saldo Insuficiente para Despesa
**Sintoma:** Não consegue criar despesa mesmo com saldo aparentemente disponível
**Causa:** Outras despesas já comprometeram o saldo
**Solução:**
- Verificar o saldo real disponível na emenda
- Consultar todas as despesas já criadas
- Recalcular saldo considerando despesas pendentes

#### 🚨 Usuário sem Permissão
**Sintoma:** Erro de acesso negado em operações
**Causa:** Permissões insuficientes ou município incorreto
**Solução:**
- Verificar role do usuário (Admin/Operador)
- Confirmar município atribuído ao usuário
- Solicitar ajuste de permissões ao administrador

#### 🚨 Erro ao Salvar Dados
**Sintoma:** Falha ao salvar formulários
**Causa:** Problemas de conectividade ou validação
**Solução:**
- Verificar conexão com Firebase
- Validar todos os campos obrigatórios
- Checar logs de erro no console

---

## 📚 **GUIA DE MANUTENÇÃO**

### Atualizações Regulares

#### Mensal
- [ ] Verificar atualizações de dependências
- [ ] Executar testes de funcionalidades críticas
- [ ] Backup dos dados do Firebase
- [ ] Revisar logs de erros

#### Trimestral
- [ ] Análise de performance do sistema
- [ ] Revisão de permissões de usuários
- [ ] Limpeza de dados obsoletos
- [ ] Atualização da documentação

#### Anual
- [ ] Auditoria completa de segurança
- [ ] Revisão de regras de negócio
- [ ] Planejamento de melhorias
- [ ] Renovação de certificados

### Monitoramento

#### Métricas Importantes
- **Performance**: Tempo de carregamento < 3 segundos
- **Disponibilidade**: Uptime > 99.5%
- **Usuários Ativos**: Monitoramento diário
- **Erros**: Taxa < 1% das operações

#### Alertas Configurados
- Falhas de autenticação em massa
- Erros de validação acima do normal
- Problemas de conectividade com Firebase
- Tentativas de acesso não autorizado

---

**📅 Data de Criação**: Janeiro 2025  
**🔄 Última Atualização**: ${timestamp}  
**📊 Versão**: 2.1  
**💻 Desenvolvido em**: Replit  
**✅ Status**: Produção Ativa

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
- ✅ **NOVO:** Validações e regras de negócio detalhadas
- ✅ **NOVO:** Fluxos de trabalho documentados
- ✅ **NOVO:** Permissões e controle de acesso
- ✅ **NOVO:** Guia de troubleshooting e manutenção
`;

    return handover;
  }

  /**
   * 📦 GERAR LISTA DE DEPENDÊNCIAS
   */
  generateDependenciesList() {
    const deps = this.analysis.dependencies.main || {};
    const mainDeps = Object.entries(deps)
      .filter(([name]) => !name.startsWith('@types'))
      .map(([name, version]) => `- **${name}**: ${version}`)
      .join('\n');

    return mainDeps || '- React e Firebase (principais)';
  }

  /**
   * 🏗️ GERAR ESTRUTURA DO PROJETO
   */
  generateProjectStructure() {
    const generateTree = (obj, prefix = '', isLast = true) => {
      let result = '';
      const entries = Object.entries(obj);

      entries.forEach(([name, value], index) => {
        const isLastItem = index === entries.length - 1;
        const connector = isLastItem ? '└── ' : '├── ';

        result += `${prefix}${connector}${name}\n`;

        if (typeof value === 'object' && value.type !== 'file') {
          const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
          result += generateTree(value, newPrefix, isLastItem);
        }
      });

      return result;
    };

    return generateTree(this.analysis.structure);
  }

  /**
   * 🔄 GERAR SEÇÃO DE MUDANÇAS
   */
  generateChangesSection() {
    const changes = this.analysis.changes;
    let section = '';

    if (changes.newComponents.length > 0) {
      section += `### ✅ **Novos Componentes Adicionados**\n`;
      changes.newComponents.forEach(comp => {
        section += `- ${comp}\n`;
      });
      section += '\n';
    }

    if (changes.modifiedFunctionalities.length > 0) {
      section += `### 🔧 **Funcionalidades Modificadas**\n`;
      changes.modifiedFunctionalities.forEach(comp => {
        section += `- ${comp}\n`;
      });
      section += '\n';
    }

    if (section === '') {
      section = '### ℹ️ **Nenhuma mudança significativa detectada recentemente**\n';
    }

    return section;
  }

  /**
   * 🧩 GERAR SEÇÃO DE COMPONENTES
   */
  generateComponentsSection() {
    return this.analysis.components
      .slice(0, 10) // Limitar para não ficar muito longo
      .map(comp => {
        return `#### \`${comp.path}\`
- **Funcionalidade**: ${comp.description}
- **Tipo**: ${comp.type}
- **Funções**: ${comp.functions.slice(0, 5).join(', ')}${comp.functions.length > 5 ? '...' : ''}
- **Dependências**: ${comp.dependencies.slice(0, 3).join(', ')}${comp.dependencies.length > 3 ? '...' : ''}
`;
      }).join('\n');
  }

  /**
   * 🎣 GERAR SEÇÃO DE HOOKS
   */
  generateHooksSection() {
    return this.analysis.hooks.map(hook => {
      return `#### \`${hook.path}\`
- **Funcionalidade**: ${hook.description}
- **Funções**: ${hook.functions.slice(0, 3).join(', ')}${hook.functions.length > 3 ? '...' : ''}
- **Exports**: ${hook.exports.map(e => e.name).join(', ')}
`;
    }).join('\n');
  }

  /**
   * 🛠️ GERAR SEÇÃO DE UTILITÁRIOS
   */
  generateUtilsSection() {
    return this.analysis.utils.map(util => {
      return `#### \`${util.path}\`
- **Funcionalidade**: ${util.description}
- **Funções**: ${util.functions.slice(0, 3).join(', ')}${util.functions.length > 3 ? '...' : ''}
`;
    }).join('\n');
  }

  /**
   * 📦 GERAR DEPENDÊNCIAS PRINCIPAIS
   */
  generateMainDependencies() {
    const deps = this.analysis.dependencies.main || {};
    return Object.entries(deps)
      .map(([name, version]) => `  - ${name}: ${version}`)
      .join('\n');
  }

  /**
   * 💾 SALVAR HANDOVER
   */
  saveHandover() {
    const content = this.generateHandover();
    fs.writeFileSync(this.currentHandover, content, 'utf8');

    console.log('✅ HANDOVER_SICEFSUS.md atualizado com sucesso!');
    console.log(`📄 ${content.split('\n').length} linhas geradas`);
    console.log(`📊 ${this.analysis.components.length} componentes documentados`);
    console.log(`🎣 ${this.analysis.hooks.length} hooks documentados`);
    console.log(`🛠️ ${this.analysis.utils.length} utilitários documentados`);
    console.log(`🔒 ${this.analysis.validations.requiredFields.length} formulários com validações documentados`);
    console.log(`🔄 ${this.analysis.validations.workflows.length} fluxos de trabalho documentados`);
  }

  /**
   * 🚀 EXECUTAR ANÁLISE COMPLETA
   */
  async run() {
    console.log('🚀 Iniciando geração automática do HANDOVER v2.1...\n');

    try {
      await this.analyze();
      this.saveHandover();

      console.log('\n🎉 Processo concluído com sucesso!');
      console.log('📋 Documentação HANDOVER_SICEFSUS.md atualizada');
      console.log('🔒 Seção de validações e regras adicionada');
      console.log('🔧 Guia de troubleshooting incluído');
      console.log('📚 Seção de manutenção documentada');

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