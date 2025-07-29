# 📋 HANDOVER - Sistema SICEFSUS

**📅 Gerado automaticamente em:** 28/07/2025, 21:22:49  
**🔧 Por:** Script generateHandover.cjs v2.4  
**📊 Status:** Sistema em Produção Ativa
**🕒 Data/Hora obtida de:** WorldTimeAPI (America/Sao_Paulo)

---

## 🆕 ÚLTIMA IMPLEMENTAÇÃO REALIZADA

### Sistema de Análise de Refatoração
**📅 Data:** 28/07/2025  
**📊 Status:** Implementado e funcional  
**⚡ Impacto:** Alto - Melhoria significativa na qualidade do código

**📝 Descrição:**  
Implementação completa do sistema de análise automática de arquivos monolíticos

**🔧 Principais Alterações:**
- Sistema de pontuação de complexidade implementado
- Detecção automática de arquivos monolíticos
- Sugestões específicas de refatoração por arquivo
- Debugging detalhado com logs de análise

**📁 Arquivos Envolvidos:**
- `src/services/userService.js`
- `src/components/PrivateRoute.jsx`
- `src/components/Dashboard.jsx`
- `src/components/Sidebar.jsx`
- `src/components/DataManager.jsx`
- `src/components/Home.jsx`
- `src/components/Login.jsx`
- `src/components/Administracao.jsx`
- `src/services/createAdminUser.js`
- `src/components/ThemeToggle.jsx`
- `src/components/UsersTable.jsx`
- `src/components/DespesaForm.jsx`
- `src/components/Despesas.jsx`
- `src/services/emendasService.js`
- `src/components/despesa/DespesaFormHeader.jsx`
- `src/components/despesa/DespesaFormBanners.jsx`
- `src/components/despesa/DespesaFormEmendaInfo.jsx`
- `src/components/despesa/DespesaFormBasicFields.jsx`
- `src/components/despesa/DespesaFormEmpenhoFields.jsx`
- `src/components/despesa/DespesaFormDateFields.jsx`
- `src/components/despesa/DespesaFormOrcamentoFields.jsx`
- `src/components/despesa/DespesaFormAdvancedFields.jsx`
- `src/components/despesa/DespesaFormActions.jsx`
- `src/components/UserForm.jsx`
- `src/components/AdminStats.jsx`
- `src/components/EmendaForm.jsx`
- `src/components/AdminPanel.jsx`
- `src/components/DebugPanel.jsx`
- `src/components/DespesasList.jsx`
- `src/components/DespesasTable.jsx`
- `src/components/Emendas.jsx`
- `src/components/PrimeiraDespesaModal.jsx`
- `src/components/Relatorios.jsx`
- `src/components/ErrorBoundary.jsx`
- `src/components/FirebaseError.jsx`
- `src/components/EmendasTable.jsx`
- `src/components/Toast.jsx`
- `src/components/SaldoEmendaWidget.jsx`
- `src/components/VisualizacaoEmendaDespesas.js`

---



## 🔬 ANÁLISE DE REFATORAÇÃO E ARQUIVOS MONOLÍTICOS

Esta seção identifica arquivos que podem se beneficiar de refatoração para melhorar manutenibilidade e qualidade do código.

### 📊 RESUMO EXECUTIVO

- **Total de Arquivos Analisados:** 66
- **Arquivos que Precisam de Refatoração:** 51 (77%)
- **Arquivos com Prioridade Crítica:** 0
- **Score Médio de Complexidade:** 53/100

### 🎯 CRITÉRIOS DE ANÁLISE

Os arquivos são avaliados com base nos seguintes critérios:

| Métrica | Limite | Peso | Descrição |
|---------|--------|------|-----------|
| **Linhas de Código** | 300 | 25% | Número total de linhas |
| **Número de Funções** | 15 | 20% | Funções por arquivo |
| **Complexidade Ciclomática** | 20 | 25% | Complexidade do código |
| **Dependências (Imports)** | 20 | 15% | Número de imports |
| **Elementos JSX** | 50 | 10% | Elementos JSX no arquivo |
| **Profundidade de Aninhamento** | 5 | 5% | Níveis de aninhamento |

### 🔴 ARQUIVOS COM PRIORIDADE CRÍTICA (Score ≥ 80)

✅ **Parabéns!** Nenhum arquivo com prioridade crítica detectado.

### 🟠 ARQUIVOS COM PRIORIDADE ALTA (Score 60-79)

#### 🟠 `undefined` - Score: 73/100

**📊 Resumo:** 623 linhas, 13 funções, complexidade 16513

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 73/100

**📊 Resumo:** 941 linhas, 15 funções, complexidade 25638

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 73/100

**📊 Resumo:** 963 linhas, 11 funções, complexidade 28248

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 72/100

**📊 Resumo:** 747 linhas, 11 funções, complexidade 22668

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 72/100

**📊 Resumo:** 662 linhas, 14 funções, complexidade 18588

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 71/100

**📊 Resumo:** 562 linhas, 34 funções, complexidade 14895

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Agrupar funções relacionadas em módulos separados

#### 🟠 `undefined` - Score: 71/100

**📊 Resumo:** 484 linhas, 20 funções, complexidade 12992

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Agrupar funções relacionadas em módulos separados

#### 🟠 `undefined` - Score: 71/100

**📊 Resumo:** 912 linhas, 15 funções, complexidade 27458

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 70/100

**📊 Resumo:** 1088 linhas, 14 funções, complexidade 29212

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 69/100

**📊 Resumo:** 527 linhas, 10 funções, complexidade 13850

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 69/100

**📊 Resumo:** 968 linhas, 12 funções, complexidade 27566

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 69/100

**📊 Resumo:** 685 linhas, 11 funções, complexidade 17129

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 69/100

**📊 Resumo:** 334 linhas, 14 funções, complexidade 7953

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 68/100

**📊 Resumo:** 860 linhas, 12 funções, complexidade 19780

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 68/100

**📊 Resumo:** 931 linhas, 9 funções, complexidade 28305

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 66/100

**📊 Resumo:** 407 linhas, 9 funções, complexidade 10043

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 64/100

**📊 Resumo:** 668 linhas, 9 funções, complexidade 18237

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 64/100

**📊 Resumo:** 1292 linhas, 8 funções, complexidade 35541

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 64/100

**📊 Resumo:** 404 linhas, 10 funções, complexidade 10255

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 63/100

**📊 Resumo:** 251 linhas, 12 funções, complexidade 5631

**🔧 Principais Sugestões:**
- Simplificar lógicas condicionais e extrair funções auxiliares
- Extrair lógicas aninhadas em funções separadas

#### 🟠 `undefined` - Score: 61/100

**📊 Resumo:** 600 linhas, 4 funções, complexidade 19288

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 61/100

**📊 Resumo:** 937 linhas, 8 funções, complexidade 26603

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 61/100

**📊 Resumo:** 736 linhas, 8 funções, complexidade 19421

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 61/100

**📊 Resumo:** 604 linhas, 8 funções, complexidade 14314

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 61/100

**📊 Resumo:** 375 linhas, 7 funções, complexidade 11939

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 61/100

**📊 Resumo:** 654 linhas, 7 funções, complexidade 18423

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 61/100

**📊 Resumo:** 203 linhas, 14 funções, complexidade 5721

**🔧 Principais Sugestões:**
- Simplificar lógicas condicionais e extrair funções auxiliares
- Extrair lógicas aninhadas em funções separadas

#### 🟠 `undefined` - Score: 60/100

**📊 Resumo:** 1404 linhas, 4 funções, complexidade 44253

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `undefined` - Score: 60/100

**📊 Resumo:** 1486 linhas, 5 funções, complexidade 45614

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

### 🟡 ARQUIVOS PARA MONITORAMENTO (Score 40-59)

Os seguintes arquivos devem ser monitorados para evitar que se tornem monolíticos:

- 🟡 `undefined` (Score: 58) - 328 linhas
- 🟡 `undefined` (Score: 58) - 209 linhas
- 🟡 `undefined` (Score: 57) - 598 linhas
- 🟡 `undefined` (Score: 57) - 368 linhas
- 🟡 `undefined` (Score: 57) - 351 linhas
- 🟡 `undefined` (Score: 56) - 735 linhas
- 🟡 `undefined` (Score: 53) - 315 linhas
- 🟡 `undefined` (Score: 53) - 286 linhas
- 🟡 `undefined` (Score: 52) - 199 linhas
- 🟡 `undefined` (Score: 52) - 356 linhas
- 🟡 `undefined` (Score: 52) - 643 linhas
- 🟡 `undefined` (Score: 51) - 164 linhas
- 🟡 `undefined` (Score: 49) - 260 linhas
- 🟡 `undefined` (Score: 48) - 240 linhas
- 🟡 `undefined` (Score: 48) - 203 linhas
- 🟡 `undefined` (Score: 48) - 247 linhas
- 🟡 `undefined` (Score: 42) - 148 linhas
- 🟡 `undefined` (Score: 42) - 183 linhas
- 🟡 `undefined` (Score: 41) - 40 linhas
- 🟡 `undefined` (Score: 40) - 173 linhas
- 🟡 `undefined` (Score: 40) - 153 linhas
- 🟡 `undefined` (Score: 40) - 141 linhas

### 📋 RECOMENDAÇÕES GERAIS

#### Padrão Arquitetural
**📝 Situação:** Alto percentual de arquivos monolíticos detectado  
**🎯 Ação Recomendada:** Revisar padrões de arquitetura e estabelecer guidelines de tamanho  
**📊 Impacto:** Médio | **⚡ Esforço:** Médio

#### Qualidade Geral
**📝 Situação:** Score médio de refatoração: 53  
**🎯 Ação Recomendada:** Implementar revisões de código focadas em tamanho e complexidade  
**📊 Impacto:** Médio | **⚡ Esforço:** Baixo

#### Hooks Complexos
**📝 Situação:** 3 hook(s) com muitas responsabilidades  
**🎯 Ação Recomendada:** Aplicar Single Responsibility Principle em hooks  
**📊 Impacto:** Médio | **⚡ Esforço:** Médio

### 🎯 PLANO DE AÇÃO SUGERIDO

#### Fase 1 - Crítico (1-2 sprints)
- ✅ Nenhuma ação crítica necessária

#### Fase 2 - Alto Impacto (2-4 sprints)
- Melhorar `undefined` (Score: 73)
- Melhorar `undefined` (Score: 73)
- Melhorar `undefined` (Score: 73)

#### Fase 3 - Monitoramento Contínuo
- Implementar limites de complexidade no CI/CD
- Revisões de código focadas em tamanho e complexidade
- Refactoring incremental durante desenvolvimento de features

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

## 🔒 VALIDAÇÕES E REGRAS DO SISTEMA

Esta seção documenta todas as validações, regras de negócio e fluxos de trabalho implementados no SICEFSUS.

---

### 📋 CAMPOS OBRIGATÓRIOS

#### Cadastro de Emenda
- **numero**
- **valor**
- **autor**
- **municipio**
- **uf**
- **dataAprovacao**
- **tipo**

**Validação:** Campos obrigatórios validados no frontend e backend

#### Cadastro de Despesa
- **emendaId**
- **valor**
- **descricao**
- **data**
- **fornecedor**
- **cnpj**

**Validação:** Validação de saldo disponível e dados obrigatórios

#### Cadastro de Usuário
- **email**
- **nome**
- **municipio**
- **uf**

**Validação:** Email único e dados de localização obrigatórios

---

### 🔍 VALIDAÇÕES DE DADOS

#### Validação de CNPJ
- **Regra:** Validação de CNPJ
- **Descrição:** CNPJ deve ter 14 dígitos e passar na validação de dígitos verificadores
- **Formato:** XX.XXX.XXX/XXXX-XX ou apenas números
- **Implementação:** src/utils/validators.js

---

### 👥 PERMISSÕES E CONTROLE DE ACESSO

#### Administrador

**Permissões:**
- Gerenciar usuários
- Visualizar todos os dados
- Criar/editar emendas
- Gerenciar despesas

**Restrições:**
- Nenhuma restrição geográfica

#### Operador

**Permissões:**
- Visualizar dados do município
- Criar despesas
- Visualizar emendas

**Restrições:**
- Limitado ao município atribuído



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
- **@babel/parser**: ^7.28.0
- **@babel/traverse**: ^7.28.0
- **firebase**: ^11.9.1
- **firebase-admin**: ^13.4.0
- **react-router-dom**: ^7.6.3
- **recharts**: ^3.0.2

### Ambiente de Desenvolvimento
- **Replit** - Plataforma de desenvolvimento
- **Node.js** - Runtime JavaScript
- **npm** - Gerenciador de pacotes

---

## 📁 ESTRUTURA DE PASTAS

```
├── HANDOVER_SICEFSUS.md
├── README.md
├── attached_assets
│   ├── Pasted--ARQUIVOS-PRIORIT-RIOS-IDENTIFICADOS-NO-HANDOVER-1-FORMUL-RIOS-PRINCIPAIS-src-components-Em-1753618922803_1753618922804.txt
│   ├── Pasted--Download-the-React-DevTools-for-a-better-development-experience-https-reactjs-org-link-react-dev-1753581395313_1753581395315.txt
│   ├── Pasted--plugin-vite-react-babel-home-runner-workspace-src-components-DespesaForm-jsx-Unexpected-token-e-1753657024688_1753657024690.txt
│   ├── Pasted--plugin-vite-react-babel-home-runner-workspace-src-components-DespesaForm-jsx-Unexpected-token-e-1753702486084_1753702486085.txt
│   ├── Pasted-2react-dom-development-js-86-Warning-Removing-a-style-property-during-rerender-borderColor-when--1753581457278_1753581457279.txt
│   ├── Pasted-Node-js-v20-19-3-workspace-node-scripts-generateHandover-cjs-Iniciando-gera-o-autom-tica-do-1753708588864_1753708588865.txt
│   ├── Pasted-react-dom-development-js-29840-Download-the-React-DevTools-for-a-better-development-experience-http-1753621700217_1753621700222.txt
│   ├── Pasted-react-dom-development-js-29840-Download-the-React-DevTools-for-a-better-development-experience-http-1753622321240_1753622321242.txt
│   ├── image_1753618363807.png
│   ├── image_1753735553915.png
│   ├── image_1753735577974.png
│   └── image_1753735645472.png
├── index.html
├── package-lock.json
├── package.json
├── public
│   └── favicon.png
├── restore.cjs
├── scripts
│   ├── generateHandover.cjs
│   └── package.json
├── src
│   ├── App.css
│   ├── App.jsx
│   ├── components
│   │   ├── AdminPanel.jsx
│   │   ├── AdminStats.jsx
│   │   ├── Administracao.jsx
│   │   ├── ConfirmationModal.jsx
│   │   ├── ContextPanel.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DataManager.jsx
│   │   ├── DebugPanel.jsx
│   │   ├── DespesaForm.jsx
│   │   ├── Despesas.jsx
│   │   ├── DespesasFilters.jsx
│   │   ├── DespesasList.jsx
│   │   ├── DespesasTable.jsx
│   │   ├── EmendaForm.jsx
│   │   ├── Emendas.jsx
│   │   ├── EmendasFilters.jsx
│   │   ├── EmendasList.jsx
│   │   ├── EmendasTable.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── FirebaseError.jsx
│   │   ├── FluxoEmenda.jsx
│   │   ├── GlobalSearch.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── PaginatedTable.jsx
│   │   ├── Pagination.jsx
│   │   ├── PrimeiraDespesaModal.jsx
│   │   ├── PrintButton.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── Relatorios.jsx
│   │   ├── SaldoEmendaWidget.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Sobre.jsx
│   │   ├── TemporaryBanner.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── Toast.jsx
│   │   ├── UserForm.jsx
│   │   ├── UsersTable.jsx
│   │   ├── VisualizacaoEmendaDespesas.js
│   │   ├── WorkflowManager.jsx
│   │   └── despesa
│   │       ├── DespesaFormActions.jsx
│   │       ├── DespesaFormAdvancedFields.jsx
│   │       ├── DespesaFormBanners.jsx
│   │       ├── DespesaFormBasicFields.jsx
│   │       ├── DespesaFormDateFields.jsx
│   │       ├── DespesaFormEmendaInfo.jsx
│   │       ├── DespesaFormEmpenhoFields.jsx
│   │       ├── DespesaFormHeader.jsx
│   │       └── DespesaFormOrcamentoFields.jsx
│   ├── config
│   │   └── constants.js
│   ├── context
│   │   ├── ThemeContext.jsx
│   │   └── UserContext.jsx
│   ├── firebase
│   │   └── firebaseConfig.js
│   ├── hooks
│   │   ├── useEmendaDespesa.js
│   │   ├── useNavigationProtection.js
│   │   ├── usePageTitle.js
│   │   ├── usePagination.js
│   │   ├── usePermissions.js
│   │   └── useValidation.js
│   ├── images
│   │   └── logo-sicefsus.png
│   ├── index.jsx
│   ├── services
│   │   ├── createAdminUser.js
│   │   ├── emendasService.js
│   │   └── userService.js
│   ├── styles
│   │   ├── adminStyles.css
│   │   ├── dashboard.css
│   │   └── theme.css
│   └── utils
│       ├── despesaValidators.js
│       ├── errorHandlers.js
│       ├── exportImport.js
│       ├── firebaseCollections.js
│       ├── formStyles.js
│       ├── formatters.js
│       ├── printUtils.js
│       └── validators.js
├── tsconfig.json
└── vite.config.js

```

---

## 🔄 MUDANÇAS RECENTES DETECTADAS

### 🆕 Novos Componentes
- AdminPanel.jsx
- AdminStats.jsx
- Administracao.jsx
- Dashboard.jsx
- DataManager.jsx
- DebugPanel.jsx
- DespesaForm.jsx
- Despesas.jsx
- DespesasList.jsx
- DespesasTable.jsx
- EmendaForm.jsx
- Emendas.jsx
- EmendasTable.jsx
- ErrorBoundary.jsx
- FirebaseError.jsx
- Home.jsx
- Login.jsx
- PrimeiraDespesaModal.jsx
- PrivateRoute.jsx
- Relatorios.jsx
- SaldoEmendaWidget.jsx
- Sidebar.jsx
- ThemeToggle.jsx
- Toast.jsx
- UserForm.jsx
- UsersTable.jsx
- VisualizacaoEmendaDespesas.js
- DespesaFormActions.jsx
- DespesaFormAdvancedFields.jsx
- DespesaFormBanners.jsx
- DespesaFormBasicFields.jsx
- DespesaFormDateFields.jsx
- DespesaFormEmendaInfo.jsx
- DespesaFormEmpenhoFields.jsx
- DespesaFormHeader.jsx
- DespesaFormOrcamentoFields.jsx

### ✏️ Funcionalidades Modificadas
- Dashboard.jsx
- Despesas.jsx
- DespesasList.jsx
- EmendaForm.jsx
- Emendas.jsx
- FluxoEmenda.jsx
- Sidebar.jsx
- Toast.jsx



---

## 📄 DESCRIÇÃO DETALHADA DOS ARQUIVOS

### 🧩 **Componentes Principais**

#### `src/components/AdminPanel.jsx`
- **Funcionalidade**: src/components/AdminPanel.jsx - Versão Completa e Funcional
- **Tipo**: Functional Component (Hooks)
- **Funções**: AdminPanel, userService, loadInitialData, loadUsers, loadedUsers, loadLogs, logsData, handleCreateUser, result, handleUpdateUser, handleDeleteUser, handleResetPassword, resetForm, handleNovoUsuario, handleEditarUsuario, handleConfirmarExclusao, getFilteredLogs, inicio, fim, styles
- **Dependências**: react, ./Toast, ./ConfirmationModal...


#### `src/components/AdminStats.jsx`
- **Funcionalidade**: src/components/AdminStats.jsx - Estatísticas Padronizadas SICEFSUS
- **Tipo**: Functional Component
- **Funções**: AdminStats, stats, total, active, admins, operators, pendingFirstAccess, operatorsWithLocation, operatorsWithoutLocation, locationStats, uf, CompactCard, styles
- **Dependências**: react


#### `src/components/Administracao.jsx`
- **Funcionalidade**: src/components/Administracao.jsx - CORRIGIDO PARA ESTRUTURA SICEFSUS
- **Tipo**: Functional Component (Hooks)
- **Funções**: Administracao, showToast, carregarUsuarios, usuariosData, resetForm, handleNovoUsuario, handleEditarUsuario, roleMap, handleCancelar, handleSalvarUsuario, handleCreateAdminDirect, result, handleExcluirUsuario, user, confirmMessage, resultado, handleResetSenha, styles, styleSheet
- **Dependências**: react, ../services/userService, ./UserForm...


#### `src/components/ConfirmationModal.jsx`
- **Funcionalidade**: src/components/ConfirmationModal.jsx - Modal de Confirmação Personalizado
- **Tipo**: Functional Component
- **Funções**: ConfirmationModal, getIconByType, getColorByType, handleOverlayClick, styles, modalCSS, existingStyle, style
- **Dependências**: react


#### `src/components/ContextPanel.jsx`
- **Funcionalidade**: ContextPanel.jsx - Painel de Contexto da Emenda
- **Tipo**: Functional Component (Hooks)
- **Funções**: ContextPanel, loadContextData, despesasQuery, despesasSnapshot, despesas, totalDespesas, valorExecutado, saldoRestante, valorTotal, percentualExecutado, atividades, formatCurrency, formatDate, renderTabContent, renderResumoTab, renderDespesasTab, renderAtividadesTab, styles
- **Dependências**: react, ../firebase/firebaseConfig


#### `src/components/Dashboard.jsx`
- **Funcionalidade**: Dashboard.jsx - CORREÇÃO CRÍTICA IMPLEMENTADA
- **Tipo**: Functional Component (Hooks)
- **Funções**: CHART_COLORS, Dashboard, calcularEstatisticasLocais, totalEmendas, totalDespesas, valorTotalEmendas, valorTotalDespesas, saldoDisponivel, percentualExecutado, emendasPorStatus, status, existing, valorSeguro, despesasPorStatus, evolucaoMensal, hoje, mes, mesNome, emendasMes, dataEmenda, despesasMes, dataDespesa, valorEmendasMes, valorDespesasMes, municipiosMap, municipio, topMunicipios, hookStats, formatCurrency, numericValue, formatNumber
- **Dependências**: react, ../hooks/useEmendaDespesa


#### `src/components/DataManager.jsx`
- **Funcionalidade**: Exportar emendas
- **Tipo**: Functional Component (Hooks)
- **Funções**: DataManager, fileInputRef, showToast, loadBackups, querySnapshot, backupsData, checkAutoBackupSetting, autoBackup, handleExport, exportData, emendasSnapshot, despesasSnapshot, usersSnapshot, logsSnapshot, blob, url, link, handleFileUpload, file, reader, data, generateImportPreview, preview, handleImport, batch, docRef, createBackup, backupData, collections, snapshot, downloadBackup, deleteBackup, toggleAutoBackup, newValue, exportToCSV, headers, csvContent
- **Dependências**: react, ../firebase/firebaseConfig, ./Toast...


#### `src/components/DebugPanel.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component (Hooks)
- **Funções**: DebugPanel
- **Dependências**: react


#### `src/components/DespesaForm.jsx`
- **Funcionalidade**: Dados do usuário para filtro por município
- **Tipo**: Functional Component (Hooks)
- **Funções**: DespesaForm, isMounted, navigate, userRole, userMunicipio, userUf, configModo, carregarEmendas, querySnapshot, emendasData, handleInputChange, validarFormulario, novosErrors, camposObrigatorios, valor, handleSubmit, dadosParaSalvar, despesaRef, collectionRef, docRef, docCheck, styles
- **Dependências**: react, react-router-dom, ../firebase/firebaseConfig...


#### `src/components/Despesas.jsx`
- **Funcionalidade**: Despesas.jsx - Sistema SICEFSUS v2.1 - COM FILTRO POR MUNICÍPIO
- **Tipo**: Functional Component (Hooks)
- **Funções**: Despesas, navigate, location, userRole, userMunicipio, userUf, carregarDados, emendasQuery, emendasSnapshot, emendaData, batchSize, batch, despesasQuery, despesasSnapshot, filtro, carregarDespesasComFiltro, despesasData, recarregar, handleVisualizar, handleEditar, handleCriar, handleVoltar, handleSalvarDespesa, handleDeletarDespesa, handleLimparFiltros, despesasParaExibir, totalDespesas, valorTotal, valor, estatisticasPermissao, renderContent, styles
- **Dependências**: react, react-router-dom, ../firebase/firebaseConfig...


#### `src/components/DespesasFilters.jsx`
- **Funcionalidade**: DespesasFilters.jsx - PADRONIZADO COM EMENDASFILTERS v1.0
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, ERROR, SUCCESS, WARNING, WHITE, DespesasFilters, aplicarFiltros, termoBusca, emendasDoParlamentar, valorMin, valorMax, dataDespesa, dataNf, hoje, fimMesAnterior, getEmendaInfo, emenda, formatarDataParaComparacao, d, limparFiltros, filtrosLimpos, contarFiltrosAtivos, aplicarPeriodo, styles, additionalCSS, style
- **Dependências**: react


#### `src/components/DespesasList.jsx`
- **Funcionalidade**: DespesasList.jsx - CORRIGIDO SEM useEmendaDespesa
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, WHITE, GRAY, DespesasList, filtradas, calcularEstatisticasFiltro, totalDespesas, valorTotalDespesas, handleFilter, handleClearFilters, handleEdit, handleView, handleDelete, getEmendaDisplayName, emenda, styles
- **Dependências**: react, firebase/firestore, ../firebase/firebaseConfig...


#### `src/components/DespesasTable.jsx`
- **Funcionalidade**: DespesasTable.jsx - ATUALIZADA CONFORME PRINT OFICIAL
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, WHITE, ERROR, SUCCESS, WARNING, DespesasTable, navigate, formatarDataFirestore, getEmendaInfo, emenda, calcularTotalPorNatureza, natureza, valor, totaisPorNatureza, handleExcluir, emendaRef, emendaDoc, saldoAtual, novoSaldo, despesaRef, handleEditar, handleVisualizar, confirmarExclusao, styles
- **Dependências**: react, react-router-dom, ../firebase/firebaseConfig...


#### `src/components/EmendaForm.jsx`
- **Funcionalidade**: EmendaForm.jsx - CORREÇÃO DEFINITIVA - CAMPOS OBRIGATÓRIOS CONFORME PRINT
- **Tipo**: Functional Component (Hooks)
- **Funções**: useIsMounted, isMountedRef, EmendaForm, navigate, isMounted, configModo, readOnly, formatarValorMonetario, apenasNumeros, numero, valorDecimal, formatarCNPJ, numeros, formatCurrency, formatarParaExibicao, calcularSaldo, parseValue, valorRecurso, valorExecutado, saldo, timeoutId, novoSaldo, handleInputChange, validarFormulario, camposObrigatorios, camposVazios, validarCNPJ, handleSubmit, dadosParaSalvar, novaEmendaRef, estados, valorFormatado, novaAcao, valor, styles
- **Dependências**: react-router-dom, firebase/firestore, ../firebase/firebaseConfig...


#### `src/components/Emendas.jsx`
- **Funcionalidade**: Emendas.jsx - Sistema SICEFSUS v2.1 - COM PRIMEIRADESPESAMODAL INTEGRADO
- **Tipo**: Functional Component (Hooks)
- **Funções**: Emendas, navigate, userRole, userMunicipio, userUf, calcularMetricasComDespesas, emendasComMetricas, despesasQuery, despesasSnapshot, totalDespesas, valorExecutado, valorRecurso, saldoDisponivel, percentualExecutado, calcularMetricas, emendasAtualizadas, emendasLength, comDespesas, handleVisualizar, handleEditar, handleCriar, handleVoltar, handleVoltarParaListagem, handleSalvarEmenda, handleDeletar, handleModalConfirm, handleModalCancel, handleDespesas, totalEmendas, emendasComRecursos, emendasComDespesas, valorTotal, valorExecutadoTotal, renderContent, styles
- **Dependências**: react, react-router-dom, ../firebase/firebaseConfig...


#### `src/components/EmendasFilters.jsx`
- **Funcionalidade**: Estados dos filtros
- **Tipo**: Functional Component (Hooks)
- **Funções**: EmendasFilters, filterEmendas, termoBusca, municipio, uf, combinado, filtered, clearFilters, clearedFilters, updateFilter, getUniqueValues, values, styles
- **Dependências**: react


#### `src/components/EmendasList.jsx`
- **Funcionalidade**: EmendasList.jsx - ORIGINAL CORRIGIDO
- **Tipo**: Functional Component (Hooks)
- **Funções**: EmendasList, filtradas, stats, formatCurrency, formatDate, getEmendaStatus, validade, saldo, handleAbrirEmenda, handleVerDespesas, handleFiltroChange, limparFiltros, parlamentaresUnicos, tiposUnicos, renderTableRow, status, percentualExecutado, totalDespesas, styles
- **Dependências**: react, ../hooks/useEmendaDespesa


#### `src/components/EmendasTable.jsx`
- **Funcionalidade**: EmendasTable.jsx - Com integração para Despesas
- **Tipo**: Functional Component (Hooks)
- **Funções**: EmendasTable, calcularExecucao, valorRecurso, valorExecutado, percentual, valorFormatado, renderIconeDespesas, temDespesas, calcularStatus, execucao, hoje, dataInicio, dataFim, getProgressColor, emendasProcessadas, statusInfo, handleSort, direction, emendasOrdenadas, aStr, bStr, formatCurrency, styles
- **Dependências**: react


#### `src/components/ErrorBoundary.jsx`
- **Funcionalidade**: Log para monitoramento
- **Tipo**: Class Component
- **Funções**: errorReport, existingErrors, recentErrors, styles
- **Dependências**: react


#### `src/components/FirebaseError.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component
- **Funções**: FirebaseError, styles
- **Dependências**: react


#### `src/components/FluxoEmenda.jsx`
- **Funcionalidade**: src/components/FluxoEmenda.jsx - CORRIGIDO com fallback para onClose
- **Tipo**: Functional Component
- **Funções**: PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, WHITE, FluxoEmenda, navigate, handleClose, formatCurrency, formatDate, displayCNPJ, cleanCNPJ, handleEditClick, valorTotal, outrasComposicoes, saldoTotal, saldoDisponivel, valorExecutado, percentualExecutado, isAtiva, isProximaVencimento, hoje, vencimento, diasRestantes, isVencida, styles
- **Dependências**: react, react-router-dom


#### `src/components/GlobalSearch.jsx`
- **Funcionalidade**: src/components/GlobalSearch.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, WHITE, GRAY, GlobalSearch, searchRef, resultsRef, inputRef, toast, handleClickOutside, searchTimeout, loadAllData, startTime, emendas, despesas, performSearch, normalizedTerm, searchResults, score, emendaRelacionada, calculateRelevanceScore, getHighlights, highlights, getMatchedFields, fields, truncateText, handleResultClick, path, handleKeyDown, handleClear, formatCurrency, formatDate, date, containerStyle, inputStyle, styles
- **Dependências**: react, firebase/firestore, ../firebase/firebaseConfig...


#### `src/components/Home.jsx`
- **Funcionalidade**: Azul petróleo principal
- **Tipo**: Functional Component
- **Funções**: PRIMARY, SECONDARY, ACCENT, WHITE, GRAY, TEXT, Home, styles
- **Dependências**: react, ../images/logo-sicefsus.png


#### `src/components/Login.jsx`
- **Funcionalidade**: Ao carregar, verifica se há e-mail salvo
- **Tipo**: Functional Component (Hooks)
- **Funções**: Login, emailSalvo, handleSubmit, cred, traduzirErroFirebase, styles
- **Dependências**: react, ../firebase/firebaseConfig, firebase/firestore


#### `src/components/PaginatedTable.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Utility/Helper
- **Funções**: Nenhuma detectada
- **Dependências**: 


#### `src/components/Pagination.jsx`
- **Funcionalidade**: src/components/Pagination.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, WHITE, GRAY, SUCCESS, Pagination, handleJumpToPage, page, handlePageSizeChange, newSize, pageRange, sizeStyles, currentSizeStyles, QuickPagination, PaginationInfo, styles, paginationCSS
- **Dependências**: react


#### `src/components/PrimeiraDespesaModal.jsx`
- **Funcionalidade**: src/components/PrimeiraDespesaModal.jsx
- **Tipo**: Functional Component
- **Funções**: PrimeiraDespesaModal, styles
- **Dependências**: react


#### `src/components/PrintButton.jsx`
- **Funcionalidade**: src/components/PrintButton.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: PrintButton, handlePrint, style
- **Dependências**: react, ../utils/printUtils


#### `src/components/PrivateRoute.jsx`
- **Funcionalidade**: ✅ DEBUG TEMPORÁRIO - REMOVER APÓS TESTAR
- **Tipo**: Functional Component
- **Funções**: PrivateRoute
- **Dependências**: react, react-router-dom


#### `src/components/Relatorios.jsx`
- **Funcionalidade**: src/components/Relatorios.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, WHITE, GRAY, COLORS, Relatorios, userRole, userMunicipio, userUf, loadData, emendasSnapshot, emendasData, despesasSnapshot, allowedEmendaIds, formatCurrency, formatDate, getOverviewData, totalEmendas, valorTotalEmendas, valorExecutado, saldoDisponivel, percentualExecutado, emendasVencidas, getExecucaoPorAutor, execucaoPorAutor, autor, despesasAutor, getExecucaoPorTipo, execucaoPorTipo, tipo, despesasTipo, getFornecedores, fornecedores, fornecedor, dataDespesa, getEmendasProximasVencimento, hoje, em30Dias, vencimento, overview, topFornecedores, emendasVencimento, reportTypes, diasRestantes, isUrgente, styles, spinnerCSS, style
- **Dependências**: react, ../firebase/firebaseConfig, firebase/firestore...


#### `src/components/SaldoEmendaWidget.jsx`
- **Funcionalidade**: ✅ Carregar dados da emenda
- **Tipo**: Functional Component (Hooks)
- **Funções**: SaldoEmendaWidget, carregarEmenda, emendaDoc, emendaData, formatCurrency, valorTotal, valorExecutado, saldoAtual, saldoAposNovaDesp, percentualExecutado, getStatusSaldo, status, styles, style
- **Dependências**: react, firebase/firestore, ../firebase/firebaseConfig


#### `src/components/Sidebar.jsx`
- **Funcionalidade**: ✅ FUNÇÃO PARA OBTER NOME DE EXIBIÇÃO CORRETO
- **Tipo**: Functional Component (Hooks)
- **Funções**: menuItems, adminItems, Sidebar, isAdmin, getDisplayName, nameFromEmail, handleSearchNavigate, handleSearchResultSelect, handleEmendasClick, handleItemClick
- **Dependências**: react, ./GlobalSearch


#### `src/components/Sobre.jsx`
- **Funcionalidade**: Hook local para título da página
- **Tipo**: Functional Component (Hooks)
- **Funções**: Sobre
- **Dependências**: react, ../images/logo-sicefsus.png


#### `src/components/TemporaryBanner.jsx`
- **Funcionalidade**: src/components/TemporaryBanner.jsx - Banner Temporário que Aparece e Desaparece
- **Tipo**: Functional Component (Hooks)
- **Funções**: TemporaryBanner, timer, handleHide, getStylesByType, typeStyles, styles
- **Dependências**: react


#### `src/components/ThemeToggle.jsx`
- **Funcionalidade**: src/components/ThemeToggle.jsx - Versão sem contexto
- **Tipo**: Functional Component (Hooks)
- **Funções**: ThemeToggle, savedTheme, toggleTheme, isDark, styles
- **Dependências**: react


#### `src/components/Toast.jsx`
- **Funcionalidade**: Toast.jsx - SISTEMA CORRIGIDO v2.0
- **Tipo**: Functional Component (Hooks)
- **Funções**: ToastContext, ToastProvider, showToast, id, newToast, hideToast, success, error, warning, info, value, useToast, context, ToastContainer, Toast, getIcon, getStyles, baseStyle, styles, toastCSS, existingStyle, style
- **Dependências**: react


#### `src/components/UserForm.jsx`
- **Funcionalidade**: src/components/UserForm.jsx - CORRIGIDO PARA ESTRUTURA SICEFSUS
- **Tipo**: Functional Component (Hooks)
- **Funções**: UserForm, UFS_VALIDAS, UF_NAMES, handleTipoChange, handleSubmit, styles, styleSheet
- **Dependências**: react, ../utils/formStyles


#### `src/components/UsersTable.jsx`
- **Funcionalidade**: src/components/UsersTable.jsx - Tabela de Usuários com UX Melhorada
- **Tipo**: Functional Component
- **Funções**: UsersTable, formatLastAccess, formatLocation, formatStatus, statusMap, statusInfo, formatRole, styles
- **Dependências**: react


#### `src/components/VisualizacaoEmendaDespesas.js`
- **Funcionalidade**: ✅ Dados simulados para demonstração
- **Tipo**: Functional Component (Hooks)
- **Funções**: VisualizacaoEmendaDespesas, timer, COLORS, PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, formatCurrency, formatDate, getStatusEmenda, validade, saldo, dadosExecucao, despesasPorMes, mes, dadosLinha, handleNovaDespesa, handleEditarDespesa, handleSalvarDespesa, handleCancelarDespesa, status, styles, spinnerCSS, style
- **Dependências**: react


#### `src/components/WorkflowManager.jsx`
- **Funcionalidade**: Atualizar status da despesa
- **Tipo**: Functional Component (Hooks)
- **Funções**: WorkflowManager, showToast, auth, currentUser, loadWorkflowHistory, q, querySnapshot, workflowData, createWorkflowEntry, handleStatusChange, getStatusIcon, getStatusColor, getActionIcon, canApprove, canReject, canMarkAsPaid, canCancel
- **Dependências**: react, firebase/auth, ../firebase/firebaseConfig...


#### `src/components/despesa/DespesaFormActions.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormActions.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormActions, styles
- **Dependências**: react


#### `src/components/despesa/DespesaFormAdvancedFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormAdvancedFields.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormAdvancedFields, styles
- **Dependências**: react


#### `src/components/despesa/DespesaFormBanners.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormBanners.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormBanners, styles
- **Dependências**: react


#### `src/components/despesa/DespesaFormBasicFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormBasicFields.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormBasicFields, styles
- **Dependências**: react


#### `src/components/despesa/DespesaFormDateFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormDateFields.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormDateFields, styles
- **Dependências**: react


#### `src/components/despesa/DespesaFormEmendaInfo.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormEmendaInfo.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormEmendaInfo, styles
- **Dependências**: react


#### `src/components/despesa/DespesaFormEmpenhoFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormEmpenhoFields.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormEmpenhoFields, styles
- **Dependências**: react


#### `src/components/despesa/DespesaFormHeader.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormHeader.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormHeader, styles
- **Dependências**: react


#### `src/components/despesa/DespesaFormOrcamentoFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormOrcamentoFields.jsx
- **Tipo**: Class Component
- **Funções**: DespesaFormOrcamentoFields, styles
- **Dependências**: react




---

### 🎣 **Hooks Customizados**

#### `src/hooks/useEmendaDespesa.js`
- **Funcionalidade**: src/hooks/useEmendaDespesa.js - VERSÃO CORRIGIDA v2.0
- **Funções**: useEmendaDespesa, isMountedRef, determinarPermissoes, permissoesLiberadas, calcularMetricasEmenda, valorTotal, despesasValidas, valorExecutado, saldoDisponivel, percentualExecutado, despesasPorStatus, status, carregarEmenda, emendaDoc, emendaData, carregarDespesasEmenda, q, snapshot, despesasData, carregarTodasEmendasComMetricas, emendasData, emendasComMetricas, metricasEmenda, validarNovaDespesa, metricas, atualizarSaldoEmenda, obterEstatisticasGerais, totalEmendas, valorTotalGeral, valorExecutadoGeral, saldoDisponivelGeral, emendasComSaldo, emendasEsgotadas, emendasSemDespesas, mediaExecucao, filtrarEmendas, busca, recarregar, metricasCalculadas, carregarDadosIniciais, despesasQuery, useIsMounted


#### `src/hooks/useNavigationProtection.js`
- **Funcionalidade**: hooks/useNavigationProtection.js - Hook Completo para Proteção de Navegação
- **Funções**: useNavigationProtection, navigate, location, handleBeforeUnload, safeNavigate, shouldNavigate, navigateWithConfirmation, canNavigate, confirmMessage, navigateWithSave, choice, createLinkHandler, createButtonHandler, useFormNavigation, navigateToRelated, shouldSave, cancelForm, shouldDiscard, useModuleNavigation, goToEmendaDespesas, returnToEmenda, createDespesaForEmenda, getNavigationSource


#### `src/hooks/usePageTitle.js`
- **Funcionalidade**: src/hooks/usePageTitle.js
- **Funções**: usePageTitle, baseTitle, Dashboard, Relatorios, Despesas


#### `src/hooks/usePagination.js`
- **Funcionalidade**: src/hooks/usePagination.js
- **Funções**: usePagination, totalItems, totalPages, paginatedData, startIndex, endIndex, hasNextPage, hasPreviousPage, isFirstPage, isLastPage, goToPage, goToNextPage, goToPreviousPage, goToFirstPage, goToLastPage, changePageSize, getPageRange, delta, range, rangeWithDots, reset, getSummary, goToItemPage, page, isItemInCurrentPage, itemPage, usePaginationWithFilter, filteredData, itemValue, term, pagination, setFilter, clearFilters, clearFilter, newFilters, usePaginationWithSort, sortedData, aStr, bStr, handleSort, clearSort


#### `src/hooks/usePermissions.js`
- **Funcionalidade**: src/hooks/usePermissions.js - HOOK CENTRALIZADO DE PERMISSÕES
- **Funções**: usePermissions, calcularPermissoes, municipio, uf, localizacao, novasPermissoes, methods


#### `src/hooks/useValidation.js`
- **Funcionalidade**: src/hooks/useValidation.js
- **Funções**: validationRules, emailRegex, actualMessage, num, cpf, cnpj, weights1, weights2, calc, sum, remainder, digit1, digit2, inputDate, today, date, phone, strongRegex, alphabeticRegex, numericRegex, useValidation, validateField, error, validateForm, newErrors, rules, value, validateSingleField, setFieldTouched, clearErrors, clearFieldError, newTouched, getFieldError, isFieldValid, useFormValidation, validation, handleChange, handleBlur, handleSubmit, reset, setValue, setAllValues, formatters, cep, number, schemas




---

### 🛠️ **Utilitários**

#### `src/utils/despesaValidators.js`
- **Funcionalidade**: src/components/despesa/DespesaFormHeader.jsx
- **Funções**: DespesaFormHeader, styles


#### `src/utils/errorHandlers.js`
- **Funcionalidade**: src/utils/errorHandlers.js - Centralized Error Handling
- **Funções**: handleFirebaseError, errorReport, existingErrors, handleValidationError, errors, handleNetworkError, showUserError, getStoredErrors, clearStoredErrors, createErrorReport


#### `src/utils/exportImport.js`
- **Funcionalidade**: Sem descrição disponível
- **Funções**: Nenhuma detectada


#### `src/utils/firebaseCollections.js`
- **Funcionalidade**: src/utils/firebaseCollections.js - ATUALIZADO CONFORME PRINTS
- **Funções**: COLLECTIONS, EMENDA_SCHEMA, USER_SCHEMA, DESPESA_SCHEMA, ACAO_SERVICO_SCHEMA, META_SCHEMA, validateDocumentStructure, requiredFields, normalizeDocument, normalized, validateAcaoServico, validateMeta, calcularValorTotalAcoesServicos, validateEmendaCompleta, erros, camposObrigatorios, ufsValidas, validarCNPJ


#### `src/utils/formStyles.js`
- **Funcionalidade**: ✅ ESTILOS UNIVERSAIS PARA FORMS - COM DARK MODE COMPLETO
- **Funções**: formStyles, addFormInteractivity, css, style, styles


#### `src/utils/formatters.js`
- **Funcionalidade**: ✅ FORMATADORES MONETÁRIOS PRECISOS - src/utils/formatters.js
- **Funções**: formatarMoedaDisplay, numero, formatarMoedaInput, parseValorMonetario, calcularSaldoEmenda, total, executado, useMoedaFormatting, handleValorChange, valorFormatado, valorNumerico, saldoDisponivel, formatarNumero, formatarPercentual, formatarCNPJDisplay, numeros, formatarTelefone, formatarData, dataObj, formatarDataHora, validarValorMonetario, calcularEstatisticas, totalDespesas, totalEmendas, saldoTotal, percentualExecutado


#### `src/utils/printUtils.js`
- **Funcionalidade**: src/utils/printUtils.js
- **Funções**: formatCurrency, formatDate, printReport, reportElement, printWindow, contentClone, elementsToRemove, printContent


#### `src/utils/validators.js`
- **Funcionalidade**: src/utils/validators.js - VALIDAÇÕES CENTRALIZADAS DO SISTEMA
- **Funções**: UFS_VALIDAS, normalizeUF, normalized, validateUF, normalizeMunicipio, validateMunicipio, validateLocation, erros, ufNormalizada, regex, validateEmail, emailRegex, validatePassword, validateUserRole, rolesValidas, validateUserStatus, statusValidos, sanitizeString, validateNome, nomeNorm, palavras, validateTelefone, apenasNumeros, getEstadoNome, estados, ufNorm, validateUserData, senhaValidacao, nomeValidacao, localizacao, telefoneValidacao, logValidation, createErrorReport, formatarCNPJ, numeros, validarCNPJ, numero, useCNPJValidation, handleCNPJChange, cnpjFormatado, validacao




---

### 🔧 **Serviços**

#### `src/services/createAdminUser.js`
- **Funcionalidade**: src/services/createAdminUser.js - Criar usuário admin diretamente no Firebase
- **Funções**: auth, createAdminUser, q, querySnapshot, userCredential, adminData, docRef, createPaulinetteAdmin


#### `src/services/emendasService.js`
- **Funcionalidade**: src/services/emendasService.js
- **Funções**: carregarEmendasPorPermissao, querySnapshot, emendasData


#### `src/services/userService.js`
- **Funcionalidade**: src/services/userService.js - VERSÃO CORRIGIDA COM CRIAÇÃO ATÔMICA
- **Funções**: auth, COLLECTION_NAME, trackUserAccess, userRef, generateTempPassword, uppercase, lowercase, numbers, specials, allChars, checkEmailExists, emailToCheck, q, querySnapshot, exists, userData, convertRoleToTipo, roleMap, validateFormData, errors, emailRegex, tipoUsuario, isValid, handleFirebaseError, loadUsers, users, handleOrphanedUser, firestoreExists, docRef, createUser, validation, errorMsg, emailExists, senhaTemporaria, resultado, errorMessage, updateUser, updateData, deleteUserById, cleanUserId, userDocRef, userDoc, sendPasswordReset, diagnoseEmail, cleanupBrokenUsers, usuariosSnapshot, brokenUsers, email, fixBrokenUser, userCredential, updatedData, userService, emails




---

## 📊 **ESTATÍSTICAS DO SISTEMA**

- **Total de Componentes**: 49
- **Total de Hooks**: 6
- **Total de Utilitários**: 8
- **Total de Serviços**: 3
- **Dependências Principais**: 6
- **Dependências de Desenvolvimento**: 7
- **Arquivos Analisados para Refatoração**: 66
- **Arquivos que Precisam de Refatoração**: 51
- **Score Médio de Complexidade**: 53/100

---

## 🚀 **COMANDOS DE DESENVOLVIMENTO**

```bash
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
```

---

**📅 Data de Criação**: Janeiro 2025  
**🔄 Última Atualização**: 28/07/2025, 21:22:49  
**📊 Versão**: 2.4  
**💻 Desenvolvido em**: Replit  
**✅ Status**: Produção Ativa com Sistema de Análise de Refatoração

---

## 🔧 **PARA DESENVOLVEDORES**

Para atualizar esta documentação:
```bash
node scripts/generateHandover.cjs
```

O script detecta automaticamente:
- ✅ Arquivos monolíticos e sugestões de refatoração
- ✅ Métricas de complexidade detalhadas
- ✅ Sistema de priorização automática
- ✅ Plano de ação estruturado
- ✅ Data/hora confiável com múltiplas fontes
- ✅ Debugging detalhado de cada arquivo

### 🔬 **Critérios de Análise de Refatoração:**
- **Linhas de Código**: Limite de 300 linhas (peso: 25%)
- **Número de Funções**: Limite de 15 funções (peso: 20%)
- **Complexidade Ciclomática**: Limite de 20 (peso: 25%)
- **Dependências**: Limite de 20 imports (peso: 15%)
- **Elementos JSX**: Limite de 50 elementos (peso: 10%)
- **Aninhamento**: Limite de 5 níveis (peso: 5%)
