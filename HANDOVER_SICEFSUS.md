# 📋 HANDOVER - Sistema SICEFSUS

**📅 Gerado automaticamente em:** 04/08/2025, 20:34:07  
**🔧 Por:** Script generateHandover.cjs v2.5  
**📊 Status:** Sistema em Produção Ativa
**🕒 Data/Hora obtida de:** Sistema NTP/Time Service

---

## 🆕 ÚLTIMA IMPLEMENTAÇÃO REALIZADA

### Sistema de Análise de Refatoração Corrigido
**📅 Data:** 04/08/2025  
**📊 Status:** Implementado e corrigido  
**⚡ Impacto:** Alto - Correção crítica na geração de documentação

**📝 Descrição:**  
Correção completa do sistema de análise com forçar leitura de arquivos e eliminação de campos undefined

**🔧 Principais Alterações:**
- Forçar releitura de arquivos com cache busting
- Correção de campos undefined na análise de refatoração
- Validação completa de paths e existência de arquivos
- Melhoria no debugging e logs detalhados

**📁 Arquivos Envolvidos:**
- `src/components/Dashboard.jsx`
- `src/components/Sidebar.jsx`
- `src/components/UsersTable.jsx`
- `src/components/PrivateRoute.jsx`
- `src/components/Despesas.jsx`
- `src/components/Emendas.jsx`
- `src/services/userService.js`
- `src/components/PrintButton.jsx`
- `src/components/DespesasTable.jsx`
- `src/components/DespesaForm.jsx`
- `src/components/despesa/DespesaFormDateFields.jsx`
- `src/components/despesa/DespesaFormBasicFields.jsx`
- `src/components/DespesasList.jsx`
- `src/components/emenda/EmendaForm/sections/DadosBancarios.jsx`
- `src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx`
- `src/components/emenda/EmendaForm/index.jsx`
- `src/components/emenda/EmendaForm/sections/InformacoesComplementares.jsx`
- `src/components/emenda/EmendaForm/sections/InformacoesFinais.jsx`
- `src/components/emenda/EmendaForm/sections/Identificacao.jsx`
- `src/components/emenda/EmendaForm/sections/DadosBasicos.jsx`
- `src/components/emenda/EmendaForm/sections/ClassificacaoTecnica.jsx`
- `src/components/emenda/EmendaForm/sections/AcoesServicos.jsx`
- `src/components/emenda/EmendaForm/components/EmendaFormHeader.jsx`
- `src/components/ThemeToggle.jsx`
- `src/components/emenda/EmendaForm/sections/Cronograma.jsx`
- `src/components/EmendasList.jsx`
- `src/components/VisualizacaoEmendaDespesas.jsx`
- `src/components/AdminPanel.jsx`
- `src/components/emenda/EmendaForm/components/EmendaFormCancelModal.jsx`
- `src/components/emenda/EmendaForm/components/EmendaFormActions.jsx`
- `src/components/UserForm.jsx`
- `src/components/despesa/DespesaFormEmpenhoFields.jsx`
- `src/components/despesa/DespesaFormOrcamentoFields.jsx`
- `src/components/despesa/DespesaFormAdvancedFields.jsx`
- `src/components/Sobre.jsx`
- `src/components/EmendasFilters.jsx`
- `src/components/DespesasFilters.jsx`
- `src/components/Login.jsx`
- `src/components/Administracao.jsx`
- `src/services/createAdminUser.js`

---



## 🔬 ANÁLISE DE REFATORAÇÃO E ARQUIVOS MONOLÍTICOS

Esta seção identifica arquivos que podem se beneficiar de refatoração para melhorar manutenibilidade e qualidade do código.

### 📊 RESUMO EXECUTIVO

- **Total de Arquivos Analisados:** 77
- **Arquivos que Precisam de Refatoração:** 65 (84%)
- **Arquivos com Prioridade Crítica:** 0
- **Score Médio de Complexidade:** 54/100

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

#### 🟠 `src/components/Relatorios.jsx` - Score: 73/100

**📊 Resumo:** 963 linhas, 11 funções, complexidade 28248

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/AdminPanel.jsx` - Score: 72/100

**📊 Resumo:** 412 linhas, 12 funções, complexidade 11058

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/DespesasTable.jsx` - Score: 72/100

**📊 Resumo:** 855 linhas, 14 funções, complexidade 23537

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/GlobalSearch.jsx` - Score: 72/100

**📊 Resumo:** 662 linhas, 14 funções, complexidade 18588

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/hooks/useValidation.js` - Score: 71/100

**📊 Resumo:** 591 linhas, 34 funções, complexidade 15950

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Agrupar funções relacionadas em módulos separados

#### 🟠 `src/utils/validators.js` - Score: 71/100

**📊 Resumo:** 494 linhas, 20 funções, complexidade 13328

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Agrupar funções relacionadas em módulos separados

#### 🟠 `src/services/userService.js` - Score: 71/100

**📊 Resumo:** 921 linhas, 16 funções, complexidade 27878

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Agrupar funções relacionadas em módulos separados

#### 🟠 `src/components/Administracao.jsx` - Score: 70/100

**📊 Resumo:** 475 linhas, 12 funções, complexidade 12589

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/EmendasList.jsx` - Score: 70/100

**📊 Resumo:** 1089 linhas, 14 funções, complexidade 29276

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/DataManager.jsx` - Score: 69/100

**📊 Resumo:** 968 linhas, 12 funções, complexidade 27566

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/WorkflowManager.jsx` - Score: 69/100

**📊 Resumo:** 685 linhas, 11 funções, complexidade 17129

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/emenda/EmendaForm/index.jsx` - Score: 69/100

**📊 Resumo:** 480 linhas, 5 funções, complexidade 13660

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/utils/firebaseCollections.js` - Score: 69/100

**📊 Resumo:** 334 linhas, 14 funções, complexidade 7953

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/ContextPanel.jsx` - Score: 68/100

**📊 Resumo:** 860 linhas, 12 funções, complexidade 19780

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/Despesas.jsx` - Score: 68/100

**📊 Resumo:** 1011 linhas, 9 funções, complexidade 29963

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/DespesaForm.jsx` - Score: 66/100

**📊 Resumo:** 513 linhas, 2 funções, complexidade 15334

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/DespesasList.jsx` - Score: 66/100

**📊 Resumo:** 398 linhas, 9 funções, complexidade 9811

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/Dashboard.jsx` - Score: 65/100

**📊 Resumo:** 1132 linhas, 8 funções, complexidade 33808

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/Emendas.jsx` - Score: 65/100

**📊 Resumo:** 592 linhas, 6 funções, complexidade 15720

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/FluxoEmenda.jsx` - Score: 64/100

**📊 Resumo:** 668 linhas, 9 funções, complexidade 18237

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/VisualizacaoEmendaDespesas.jsx` - Score: 64/100

**📊 Resumo:** 1292 linhas, 8 funções, complexidade 35541

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/hooks/usePagination.js` - Score: 64/100

**📊 Resumo:** 404 linhas, 10 funções, complexidade 10255

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/Toast.jsx` - Score: 63/100

**📊 Resumo:** 251 linhas, 12 funções, complexidade 5631

**🔧 Principais Sugestões:**
- Simplificar lógicas condicionais e extrair funções auxiliares
- Extrair lógicas aninhadas em funções separadas

#### 🟠 `src/components/Login.jsx` - Score: 62/100

**📊 Resumo:** 420 linhas, 7 funções, complexidade 11371

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/Sidebar.jsx` - Score: 62/100

**📊 Resumo:** 468 linhas, 7 funções, complexidade 15624

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/utils/formatters.js` - Score: 62/100

**📊 Resumo:** 215 linhas, 14 funções, complexidade 6032

**🔧 Principais Sugestões:**
- Simplificar lógicas condicionais e extrair funções auxiliares
- Extrair lógicas aninhadas em funções separadas

#### 🟠 `src/components/EmendasTable.jsx` - Score: 61/100

**📊 Resumo:** 736 linhas, 8 funções, complexidade 19421

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/components/Pagination.jsx` - Score: 61/100

**📊 Resumo:** 604 linhas, 8 funções, complexidade 14314

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/hooks/useEmendaDespesa.js` - Score: 61/100

**📊 Resumo:** 654 linhas, 7 funções, complexidade 18423

**🔧 Principais Sugestões:**
- Quebrar em componentes menores ou extrair lógicas para hooks/utils
- Simplificar lógicas condicionais e extrair funções auxiliares

#### 🟠 `src/hooks/usePermissions.js` - Score: 60/100

**📊 Resumo:** 223 linhas, 12 funções, complexidade 6241

**🔧 Principais Sugestões:**
- Simplificar lógicas condicionais e extrair funções auxiliares
- Extrair lógicas aninhadas em funções separadas

### 🟡 ARQUIVOS PARA MONITORAMENTO (Score 40-59)

Os seguintes arquivos devem ser monitorados para evitar que se tornem monolíticos:

- 🟡 `src/components/DespesasFilters.jsx` (Score: 59) - 303 linhas
- 🟡 `src/components/UsersTable.jsx` (Score: 59) - 417 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/Cronograma.jsx` (Score: 59) - 326 linhas
- 🟡 `src/components/SaldoEmendaWidget.jsx` (Score: 58) - 328 linhas
- 🟡 `src/components/EmendasFilters.jsx` (Score: 57) - 292 linhas
- 🟡 `src/hooks/useNavigationProtection.js` (Score: 57) - 351 linhas
- 🟡 `src/components/UserForm.jsx` (Score: 56) - 718 linhas
- 🟡 `src/components/Sobre.jsx` (Score: 54) - 419 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/AcoesServicos.jsx` (Score: 54) - 277 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/DadosBasicos.jsx` (Score: 54) - 295 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/InformacoesFinais.jsx` (Score: 54) - 289 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/DadosBancarios.jsx` (Score: 53) - 294 linhas
- 🟡 `src/utils/printUtils.js` (Score: 53) - 286 linhas
- 🟡 `src/components/PrimeiraDespesaModal.jsx` (Score: 52) - 356 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/InformacoesComplementares.jsx` (Score: 52) - 262 linhas
- 🟡 `src/utils/formStyles.js` (Score: 52) - 643 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/Identificacao.jsx` (Score: 51) - 238 linhas
- 🟡 `src/utils/errorHandlers.js` (Score: 51) - 164 linhas
- 🟡 `src/components/despesa/DespesaFormAdvancedFields.jsx` (Score: 50) - 269 linhas
- 🟡 `src/components/despesa/DespesaFormBasicFields.jsx` (Score: 50) - 275 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx` (Score: 50) - 261 linhas
- 🟡 `src/components/AdminStats.jsx` (Score: 48) - 240 linhas
- 🟡 `src/components/ConfirmationModal.jsx` (Score: 48) - 203 linhas
- 🟡 `src/components/emenda/EmendaForm/components/EmendaFormActions.jsx` (Score: 46) - 160 linhas
- 🟡 `src/components/emenda/EmendaForm/sections/ClassificacaoTecnica.jsx` (Score: 46) - 216 linhas
- 🟡 `src/components/despesa/DespesaFormDateFields.jsx` (Score: 44) - 184 linhas
- 🟡 `src/components/emenda/EmendaForm/components/EmendaFormCancelModal.jsx` (Score: 44) - 144 linhas
- 🟡 `src/hooks/useEmendaFormNavigation.js` (Score: 44) - 164 linhas
- 🟡 `src/components/despesa/DespesaFormOrcamentoFields.jsx` (Score: 43) - 189 linhas
- 🟡 `src/components/TemporaryBanner.jsx` (Score: 42) - 148 linhas
- 🟡 `src/hooks/usePageTitle.js` (Score: 41) - 40 linhas
- 🟡 `src/services/createAdminUser.js` (Score: 41) - 146 linhas
- 🟡 `src/components/ErrorBoundary.jsx` (Score: 40) - 173 linhas
- 🟡 `src/components/PrintButton.jsx` (Score: 40) - 105 linhas
- 🟡 `src/components/despesa/DespesaFormEmpenhoFields.jsx` (Score: 40) - 160 linhas

### 📋 RECOMENDAÇÕES GERAIS

#### Padrão Arquitetural
**📝 Situação:** Alto percentual de arquivos monolíticos detectado  
**🎯 Ação Recomendada:** Revisar padrões de arquitetura e estabelecer guidelines de tamanho  
**📊 Impacto:** Médio | **⚡ Esforço:** Médio

#### Qualidade Geral
**📝 Situação:** Score médio de refatoração: 54  
**🎯 Ação Recomendada:** Implementar revisões de código focadas em tamanho e complexidade  
**📊 Impacto:** Médio | **⚡ Esforço:** Baixo

#### Hooks Complexos
**📝 Situação:** 4 hook(s) com muitas responsabilidades  
**🎯 Ação Recomendada:** Aplicar Single Responsibility Principle em hooks  
**📊 Impacto:** Médio | **⚡ Esforço:** Médio

### 🎯 PLANO DE AÇÃO SUGERIDO

#### Fase 1 - Crítico (1-2 sprints)
- ✅ Nenhuma ação crítica necessária

#### Fase 2 - Alto Impacto (2-4 sprints)
- Melhorar `src/components/Relatorios.jsx` (Score: 73)
- Melhorar `src/components/AdminPanel.jsx` (Score: 72)
- Melhorar `src/components/DespesasTable.jsx` (Score: 72)

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
├── analise-runner-2025-08-04T18-04-16.md
├── attached_assets
│   ├── Pasted-react-dom-development-js-29840-Download-the-React-DevTools-for-a-better-development-experience-http-1754339379583_1754339379583.txt
│   ├── Pasted-react-dom-development-js-29840-Download-the-React-DevTools-for-a-better-development-experience-http-1754341213781_1754341213782.txt
│   ├── Pasted-react-dom-development-js-29840-Download-the-React-DevTools-for-a-better-development-experience-http-1754341313671_1754341313672.txt
│   ├── Pasted-react-dom-development-js-29840-Download-the-React-DevTools-for-a-better-development-experience-http-1754341366277_1754341366278.txt
│   ├── Pasted-react-dom-development-js-29840-Download-the-React-DevTools-for-a-better-development-experience-http-1754341500316_1754341500317.txt
│   ├── Pasted-react-dom-development-js-29840-Download-the-React-DevTools-for-a-better-development-experience-http-1754341673635_1754341673637.txt
│   ├── image_1754339603594.png
│   ├── image_1754339702402.png
│   ├── image_1754341860699.png
│   └── image_1754342109803.png
├── index.html
├── package-lock.json
├── package.json
├── public
│   └── favicon.png
├── restore.cjs
├── scripts
│   ├── generateHandover.cjs
│   ├── package.json
│   └── project-analyzer.js
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
│   │   ├── VisualizacaoEmendaDespesas.jsx
│   │   ├── WorkflowManager.jsx
│   │   ├── despesa
│   │   │   ├── DespesaFormActions.jsx
│   │   │   ├── DespesaFormAdvancedFields.jsx
│   │   │   ├── DespesaFormBanners.jsx
│   │   │   ├── DespesaFormBasicFields.jsx
│   │   │   ├── DespesaFormDateFields.jsx
│   │   │   ├── DespesaFormEmendaInfo.jsx
│   │   │   ├── DespesaFormEmpenhoFields.jsx
│   │   │   ├── DespesaFormHeader.jsx
│   │   │   └── DespesaFormOrcamentoFields.jsx
│   │   └── emenda
│   │       └── EmendaForm
│   │           ├── components
│   │           │   ├── EmendaFormActions.jsx
│   │           │   ├── EmendaFormCancelModal.jsx
│   │           │   └── EmendaFormHeader.jsx
│   │           ├── index.jsx
│   │           └── sections
│   │               ├── AcoesServicos.jsx
│   │               ├── ClassificacaoTecnica.jsx
│   │               ├── Cronograma.jsx
│   │               ├── DadosBancarios.jsx
│   │               ├── DadosBasicos.jsx
│   │               ├── DadosBeneficiario.jsx
│   │               ├── Identificacao.jsx
│   │               ├── InformacoesComplementares.jsx
│   │               └── InformacoesFinais.jsx
│   ├── config
│   │   └── constants.js
│   ├── context
│   │   ├── ThemeContext.jsx
│   │   └── UserContext.jsx
│   ├── firebase
│   │   └── firebaseConfig.js
│   ├── hooks
│   │   ├── useEmendaDespesa.js
│   │   ├── useEmendaFormData.js
│   │   ├── useEmendaFormNavigation.js
│   │   ├── useNavigationProtection.js
│   │   ├── usePageTitle.js
│   │   ├── usePagination.js
│   │   ├── usePermissions.js
│   │   └── useValidation.js
│   ├── images
│   │   ├── logo-sicefsus.png
│   │   └── logoaraujoinfo.png
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
- Administracao.jsx
- Dashboard.jsx
- DespesaForm.jsx
- Despesas.jsx
- DespesasFilters.jsx
- DespesasList.jsx
- DespesasTable.jsx
- Emendas.jsx
- EmendasFilters.jsx
- EmendasList.jsx
- Login.jsx
- PrintButton.jsx
- PrivateRoute.jsx
- Sidebar.jsx
- Sobre.jsx
- ThemeToggle.jsx
- UserForm.jsx
- UsersTable.jsx
- VisualizacaoEmendaDespesas.jsx
- DespesaFormAdvancedFields.jsx
- DespesaFormBasicFields.jsx
- DespesaFormDateFields.jsx
- DespesaFormEmpenhoFields.jsx
- DespesaFormOrcamentoFields.jsx
- EmendaFormActions.jsx
- EmendaFormCancelModal.jsx
- EmendaFormHeader.jsx
- index.jsx
- AcoesServicos.jsx
- ClassificacaoTecnica.jsx
- Cronograma.jsx
- DadosBancarios.jsx
- DadosBasicos.jsx
- DadosBeneficiario.jsx
- Identificacao.jsx
- InformacoesComplementares.jsx
- InformacoesFinais.jsx

### ✏️ Funcionalidades Modificadas
- Despesas.jsx
- DespesasList.jsx
- Emendas.jsx
- FluxoEmenda.jsx
- PrintButton.jsx
- Sidebar.jsx
- Toast.jsx
- index.jsx



---

## 📄 DESCRIÇÃO DETALHADA DOS ARQUIVOS

### 🧩 **Componentes Principais**

#### `src/components/AdminPanel.jsx`
- **Funcionalidade**: src/components/AdminPanel.jsx - Versão Refatorada Profissional
- **Tipo**: Functional Component (Hooks)
- **Funções**: AdminPanel, userService, loadInitialData, loadUsers, usersData, loadLogs, logsData, handleCreateUser, result, handleUpdateUser, handleDeleteUser, handleResetPassword, resetForm, startEdit, confirmDelete, getFilteredLogs, inicio, fim
- **Dependências**: react, ./Toast, ./ConfirmationModal...
- **Score de Refatoração:** 72/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/AdminStats.jsx`
- **Funcionalidade**: src/components/AdminStats.jsx - Estatísticas Padronizadas SICEFSUS
- **Tipo**: Functional Component
- **Funções**: AdminStats, stats, total, active, admins, operators, pendingFirstAccess, operatorsWithLocation, operatorsWithoutLocation, locationStats, uf, CompactCard, styles
- **Dependências**: react
- **Score de Refatoração:** 48/100 🟡
- **Status:** Considerar refatoração

#### `src/components/Administracao.jsx`
- **Funcionalidade**: src/components/Administracao.jsx - INTERFACE MELHORADA CONFORME SOLICITAÇÃO
- **Tipo**: Functional Component (Hooks)
- **Funções**: Administracao, carregarUsuarios, usuariosData, resetForm, handleNovoUsuario, handleEditarUsuario, roleMap, handleCancelar, handleSalvarUsuario, handleExcluirUsuario, confirmMessage, resultado, handleToggleStatus, novoStatus, acao, dadosAtualizacao, handleResetSenha, calcularEstatisticas, total, ativos, admins, operadores, inativos, stats, styles, styleSheet
- **Dependências**: react, ../services/userService, ./UserForm...
- **Score de Refatoração:** 70/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/ConfirmationModal.jsx`
- **Funcionalidade**: src/components/ConfirmationModal.jsx - Modal de Confirmação Personalizado
- **Tipo**: Functional Component
- **Funções**: ConfirmationModal, getIconByType, getColorByType, handleOverlayClick, styles, modalCSS, existingStyle, style
- **Dependências**: react
- **Score de Refatoração:** 48/100 🟡
- **Status:** Considerar refatoração

#### `src/components/ContextPanel.jsx`
- **Funcionalidade**: ContextPanel.jsx - Painel de Contexto da Emenda
- **Tipo**: Functional Component (Hooks)
- **Funções**: ContextPanel, loadContextData, despesasQuery, despesasSnapshot, despesas, totalDespesas, valorExecutado, saldoRestante, valorTotal, percentualExecutado, atividades, formatCurrency, formatDate, renderTabContent, renderResumoTab, renderDespesasTab, renderAtividadesTab, styles
- **Dependências**: react, ../firebase/firebaseConfig
- **Score de Refatoração:** 68/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/Dashboard.jsx`
- **Funcionalidade**: Dashboard.jsx - VERSÃO PRODUÇÃO COM LAYOUT REFINADO
- **Tipo**: Functional Component (Hooks)
- **Funções**: CronogramaWidget, navigate, hoje, processarEmendas, proximasVencer, vencidas, emAndamento, concluidas, dataValidadeStr, dataValidade, diffTime, diffDays, valorTotal, valorExecutado, percentualExecutado, emendaComDias, formatCurrency, handleCardClick, Dashboard, user, userLoading, permissions, userRole, userMunicipio, userUf, carregarDados, emendasRef, emendasSnapshot, despesasRef, despesasSnapshot, emendasQuery, emendasIds, batchSize, batch, despesasQuery, mensagemErro, calcularEstatisticas, totalEmendas, totalDespesas, valorTotalEmendas, valor, valorTotalDespesas, saldoDisponivel, stats, numericValue, styles, cronogramaStyles, styleSheet
- **Dependências**: react, firebase/firestore, ../firebase/firebaseConfig...
- **Score de Refatoração:** 65/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/DataManager.jsx`
- **Funcionalidade**: Exportar emendas
- **Tipo**: Functional Component (Hooks)
- **Funções**: DataManager, fileInputRef, showToast, loadBackups, querySnapshot, backupsData, checkAutoBackupSetting, autoBackup, handleExport, exportData, emendasSnapshot, despesasSnapshot, usersSnapshot, logsSnapshot, blob, url, link, handleFileUpload, file, reader, data, generateImportPreview, preview, handleImport, batch, docRef, createBackup, backupData, collections, snapshot, downloadBackup, deleteBackup, toggleAutoBackup, newValue, exportToCSV, headers, csvContent
- **Dependências**: react, ../firebase/firebaseConfig, ./Toast...
- **Score de Refatoração:** 69/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/DebugPanel.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component (Hooks)
- **Funções**: DebugPanel
- **Dependências**: react
- **Score de Refatoração:** 35/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/DespesaForm.jsx`
- **Funcionalidade**: src/components/DespesaForm.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: DespesaForm, isMounted, navigate, userRole, userMunicipio, userUf, configModo, carregarEmendas, querySnapshot, emendasData, handleInputChange, validarFormulario, novosErrors, camposObrigatorios, valor, dataValidade, handleSubmit, dadosParaSalvar, despesaRef, collectionRef, docRef, docCheck, styles
- **Dependências**: react, react-router-dom, ../firebase/firebaseConfig...
- **Score de Refatoração:** 66/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/Despesas.jsx`
- **Funcionalidade**: Despesas.jsx - Sistema SICEFSUS v2.1 - COM FILTROS BÁSICOS
- **Tipo**: Functional Component (Hooks)
- **Funções**: Despesas, navigate, location, userRole, userMunicipio, userUf, carregarDados, emendasQuery, emendasSnapshot, emendaData, batchSize, batch, despesasQuery, despesasSnapshot, filtro, carregarDespesasComFiltro, despesasData, handleFiltrosChange, recarregar, handleVisualizar, handleEditar, handleCriar, handleVoltar, handleSalvarDespesa, handleDeletarDespesa, handleLimparFiltros, despesasParaExibir, totalDespesas, valorTotal, valor, estatisticasPermissao, renderContent, styles, styleSheet
- **Dependências**: react, react-router-dom, ../firebase/firebaseConfig...
- **Score de Refatoração:** 68/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/DespesasFilters.jsx`
- **Funcionalidade**: ✅ FILTROS BÁSICOS (4 campos como Emendas)
- **Tipo**: Functional Component (Hooks)
- **Funções**: DespesasFilters, filtrarDespesas, termo, fornecedor, descricao, cnpj, valorDespesa, valorMinimo, valorMaximo, resultado, handleFiltroChange, limparFiltros, filtrosLimpos, contarFiltrosAtivos, getEmendaDisplayName, emenda, styles
- **Dependências**: react
- **Score de Refatoração:** 59/100 🟡
- **Status:** Considerar refatoração

#### `src/components/DespesasList.jsx`
- **Funcionalidade**: DespesasList.jsx - CORRIGIDO SEM useEmendaDespesa
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, WHITE, GRAY, DespesasList, filtradas, calcularEstatisticasFiltro, totalDespesas, valorTotalDespesas, handleFilter, handleClearFilters, handleEdit, handleView, handleDelete, getEmendaDisplayName, emenda, styles
- **Dependências**: react, firebase/firestore, ../firebase/firebaseConfig...
- **Score de Refatoração:** 66/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/DespesasTable.jsx`
- **Funcionalidade**: DespesasTable.jsx - ATUALIZADA CONFORME SOLICITAÇÃO
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, WHITE, ERROR, SUCCESS, WARNING, DespesasTable, navigate, formatarDataFirestore, getEmendaInfo, emenda, numero, parlamentar, handleExcluir, emendaRef, emendaDoc, saldoAtual, novoSaldo, despesaRef, handleEditar, handleVisualizar, confirmarExclusao, styles
- **Dependências**: react, react-router-dom, ../firebase/firebaseConfig...
- **Score de Refatoração:** 72/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/Emendas.jsx`
- **Funcionalidade**: Emendas.jsx - Layout Padronizado com Despesas v2.1
- **Tipo**: Functional Component (Hooks)
- **Funções**: Emendas, navigate, location, userRole, userMunicipio, userUf, userEmail, carregarDados, emendasRef, snapshot, emendasData, recarregar, handleFiltrosChange, handleCriar, handleEditar, handleVisualizar, handleDespesas, handleDeletar, totalEmendas, valorTotal, valor, emendasAtivas, saldo, emendasExecutadas, executado, valorExecutado, styles, styleSheet
- **Dependências**: react, react-router-dom, firebase/firestore...
- **Score de Refatoração:** 65/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/EmendasFilters.jsx`
- **Funcionalidade**: ✅ FILTROS BÁSICOS APENAS (4 campos como Despesas)
- **Tipo**: Functional Component (Hooks)
- **Funções**: EmendasFilters, filtrarEmendas, termo, municipio, uf, combinado, resultado, handleFiltroChange, limparFiltros, filtrosLimpos, contarFiltrosAtivos, styles
- **Dependências**: react
- **Score de Refatoração:** 57/100 🟡
- **Status:** Considerar refatoração

#### `src/components/EmendasList.jsx`
- **Funcionalidade**: EmendasList.jsx - ORIGINAL CORRIGIDO
- **Tipo**: Functional Component (Hooks)
- **Funções**: EmendasList, filtradas, stats, formatCurrency, formatDate, getEmendaStatus, validade, saldo, handleAbrirEmenda, handleVerDespesas, handleFiltroChange, limparFiltros, parlamentaresUnicos, tiposUnicos, renderTableRow, status, percentualExecutado, totalDespesas, styles
- **Dependências**: react, ../hooks/useEmendaDespesa
- **Score de Refatoração:** 70/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/EmendasTable.jsx`
- **Funcionalidade**: EmendasTable.jsx - Com integração para Despesas
- **Tipo**: Functional Component (Hooks)
- **Funções**: EmendasTable, calcularExecucao, valorRecurso, valorExecutado, percentual, valorFormatado, renderIconeDespesas, temDespesas, calcularStatus, execucao, hoje, dataInicio, dataFim, getProgressColor, emendasProcessadas, statusInfo, handleSort, direction, emendasOrdenadas, aStr, bStr, formatCurrency, styles
- **Dependências**: react
- **Score de Refatoração:** 61/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/ErrorBoundary.jsx`
- **Funcionalidade**: Log para monitoramento
- **Tipo**: Class Component
- **Funções**: errorReport, existingErrors, recentErrors, styles
- **Dependências**: react
- **Score de Refatoração:** 40/100 🟡
- **Status:** Considerar refatoração

#### `src/components/FirebaseError.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component
- **Funções**: FirebaseError, styles
- **Dependências**: react
- **Score de Refatoração:** 38/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/FluxoEmenda.jsx`
- **Funcionalidade**: src/components/FluxoEmenda.jsx - CORRIGIDO com fallback para onClose
- **Tipo**: Functional Component
- **Funções**: PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, WHITE, FluxoEmenda, navigate, handleClose, formatCurrency, formatDate, displayCNPJ, cleanCNPJ, handleEditClick, valorTotal, outrasComposicoes, saldoTotal, saldoDisponivel, valorExecutado, percentualExecutado, isAtiva, isProximaVencimento, hoje, vencimento, diasRestantes, isVencida, styles
- **Dependências**: react, react-router-dom
- **Score de Refatoração:** 64/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/GlobalSearch.jsx`
- **Funcionalidade**: src/components/GlobalSearch.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, WHITE, GRAY, GlobalSearch, searchRef, resultsRef, inputRef, toast, handleClickOutside, searchTimeout, loadAllData, startTime, emendas, despesas, performSearch, normalizedTerm, searchResults, score, emendaRelacionada, calculateRelevanceScore, getHighlights, highlights, getMatchedFields, fields, truncateText, handleResultClick, path, handleKeyDown, handleClear, formatCurrency, formatDate, date, containerStyle, inputStyle, styles
- **Dependências**: react, firebase/firestore, ../firebase/firebaseConfig...
- **Score de Refatoração:** 72/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/Home.jsx`
- **Funcionalidade**: Azul petróleo principal
- **Tipo**: Functional Component
- **Funções**: PRIMARY, SECONDARY, ACCENT, WHITE, GRAY, TEXT, Home, styles
- **Dependências**: react, ../images/logo-sicefsus.png
- **Score de Refatoração:** 38/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/Login.jsx`
- **Funcionalidade**: ✅ REMOVIDO: Modo cadastro não disponível no login público
- **Tipo**: Functional Component (Hooks)
- **Funções**: Login, emailSalvo, buscarDadosUsuario, userDocRef, userDoc, userData, q, querySnapshot, updateData, handleSubmit, cred, dadosUsuario, traduzirErroFirebase, styles, styleSheet
- **Dependências**: react, ../firebase/firebaseConfig, firebase/auth
- **Score de Refatoração:** 62/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/Pagination.jsx`
- **Funcionalidade**: src/components/Pagination.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, WHITE, GRAY, SUCCESS, Pagination, handleJumpToPage, page, handlePageSizeChange, newSize, pageRange, sizeStyles, currentSizeStyles, QuickPagination, PaginationInfo, styles, paginationCSS
- **Dependências**: react
- **Score de Refatoração:** 61/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/PrimeiraDespesaModal.jsx`
- **Funcionalidade**: src/components/PrimeiraDespesaModal.jsx
- **Tipo**: Functional Component
- **Funções**: PrimeiraDespesaModal, styles
- **Dependências**: react
- **Score de Refatoração:** 52/100 🟡
- **Status:** Considerar refatoração

#### `src/components/PrintButton.jsx`
- **Funcionalidade**: ✅ CORREÇÃO: Usar o contexto diretamente ao invés de receber via props
- **Tipo**: Functional Component
- **Funções**: PrivateRoute, isAdmin, isOperadorOrAdmin
- **Dependências**: react, react-router-dom, ../context/UserContext
- **Score de Refatoração:** 40/100 🟡
- **Status:** Considerar refatoração

#### `src/components/PrivateRoute.jsx`
- **Funcionalidade**: ✅ Debug simplificado (apenas quando necessário)
- **Tipo**: Functional Component
- **Funções**: PrivateRoute, isAdmin, isOperadorOrAdmin
- **Dependências**: react, react-router-dom
- **Score de Refatoração:** 37/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/Relatorios.jsx`
- **Funcionalidade**: src/components/Relatorios.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, WHITE, GRAY, COLORS, Relatorios, userRole, userMunicipio, userUf, loadData, emendasSnapshot, emendasData, despesasSnapshot, allowedEmendaIds, formatCurrency, formatDate, getOverviewData, totalEmendas, valorTotalEmendas, valorExecutado, saldoDisponivel, percentualExecutado, emendasVencidas, getExecucaoPorAutor, execucaoPorAutor, autor, despesasAutor, getExecucaoPorTipo, execucaoPorTipo, tipo, despesasTipo, getFornecedores, fornecedores, fornecedor, dataDespesa, getEmendasProximasVencimento, hoje, em30Dias, vencimento, overview, topFornecedores, emendasVencimento, reportTypes, diasRestantes, isUrgente, styles, spinnerCSS, style
- **Dependências**: react, ../firebase/firebaseConfig, firebase/firestore...
- **Score de Refatoração:** 73/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/SaldoEmendaWidget.jsx`
- **Funcionalidade**: ✅ Carregar dados da emenda
- **Tipo**: Functional Component (Hooks)
- **Funções**: SaldoEmendaWidget, carregarEmenda, emendaDoc, emendaData, formatCurrency, valorTotal, valorExecutado, saldoAtual, saldoAposNovaDesp, percentualExecutado, getStatusSaldo, status, styles, style
- **Dependências**: react, firebase/firestore, ../firebase/firebaseConfig
- **Score de Refatoração:** 58/100 🟡
- **Status:** Considerar refatoração

#### `src/components/Sidebar.jsx`
- **Funcionalidade**: ✅ ADICIONADO: Para detectar rota atual
- **Tipo**: Functional Component (Hooks)
- **Funções**: menuItems, adminItems, bottomItems, Sidebar, location, isAdmin, isCreatingEmenda, isEditingEmenda, isInFormMode, getDisplayName, nameFromEmail, handleSearchNavigate, handleSearchResultSelect, handleEmendasClick, confirmMessage, handleItemClick
- **Dependências**: react, react-router-dom, ./GlobalSearch
- **Score de Refatoração:** 62/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/Sobre.jsx`
- **Funcionalidade**: Hook local para título da página
- **Tipo**: Functional Component (Hooks)
- **Funções**: Sobre
- **Dependências**: react, ../images/logo-sicefsus.png, ../images/logoaraujoinfo.png
- **Score de Refatoração:** 54/100 🟡
- **Status:** Considerar refatoração

#### `src/components/TemporaryBanner.jsx`
- **Funcionalidade**: src/components/TemporaryBanner.jsx - Banner Temporário que Aparece e Desaparece
- **Tipo**: Functional Component (Hooks)
- **Funções**: TemporaryBanner, timer, handleHide, getStylesByType, typeStyles, styles
- **Dependências**: react
- **Score de Refatoração:** 42/100 🟡
- **Status:** Considerar refatoração

#### `src/components/ThemeToggle.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Utility/Helper
- **Funções**: Nenhuma detectada
- **Dependências**: 
- **Score de Refatoração:** 25/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/Toast.jsx`
- **Funcionalidade**: Toast.jsx - SISTEMA CORRIGIDO v2.0
- **Tipo**: Functional Component (Hooks)
- **Funções**: ToastContext, ToastProvider, showToast, id, newToast, hideToast, success, error, warning, info, value, useToast, context, ToastContainer, Toast, getIcon, getStyles, baseStyle, styles, toastCSS, existingStyle, style
- **Dependências**: react
- **Score de Refatoração:** 63/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/UserForm.jsx`
- **Funcionalidade**: src/components/UserForm.jsx - CORRIGIDO PARA ESTRUTURA SICEFSUS
- **Tipo**: Functional Component (Hooks)
- **Funções**: UserForm, UFS_VALIDAS, UF_NAMES, handleTipoChange, handleSubmit, styles, styleSheet
- **Dependências**: react, ../utils/formStyles
- **Score de Refatoração:** 56/100 🟡
- **Status:** Considerar refatoração

#### `src/components/UsersTable.jsx`
- **Funcionalidade**: src/components/UsersTable.jsx - TABELA MELHORADA COM OPÇÃO DESATIVAR
- **Tipo**: Functional Component
- **Funções**: UsersTable, formatLastAccess, formatLocation, formatStatus, statusMap, statusInfo, formatRole, styles, styleSheet
- **Dependências**: react
- **Score de Refatoração:** 59/100 🟡
- **Status:** Considerar refatoração

#### `src/components/VisualizacaoEmendaDespesas.jsx`
- **Funcionalidade**: ✅ Dados simulados para demonstração
- **Tipo**: Functional Component (Hooks)
- **Funções**: VisualizacaoEmendaDespesas, timer, COLORS, PRIMARY, ACCENT, SUCCESS, WARNING, ERROR, formatCurrency, formatDate, getStatusEmenda, validade, saldo, dadosExecucao, despesasPorMes, mes, dadosLinha, handleNovaDespesa, handleEditarDespesa, handleSalvarDespesa, handleCancelarDespesa, status, styles, spinnerCSS, style
- **Dependências**: react
- **Score de Refatoração:** 64/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/WorkflowManager.jsx`
- **Funcionalidade**: Atualizar status da despesa
- **Tipo**: Functional Component (Hooks)
- **Funções**: WorkflowManager, showToast, auth, currentUser, loadWorkflowHistory, q, querySnapshot, workflowData, createWorkflowEntry, handleStatusChange, getStatusIcon, getStatusColor, getActionIcon, canApprove, canReject, canMarkAsPaid, canCancel
- **Dependências**: react, firebase/auth, ../firebase/firebaseConfig...
- **Score de Refatoração:** 69/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/despesa/DespesaFormActions.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormActions.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormActions, styles
- **Dependências**: react
- **Score de Refatoração:** 34/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/despesa/DespesaFormAdvancedFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormAdvancedFields.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormAdvancedFields, styles
- **Dependências**: react
- **Score de Refatoração:** 50/100 🟡
- **Status:** Considerar refatoração

#### `src/components/despesa/DespesaFormBanners.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormBanners.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormBanners, styles
- **Dependências**: react
- **Score de Refatoração:** 37/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/despesa/DespesaFormBasicFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormBasicFields.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormBasicFields, styles
- **Dependências**: react
- **Score de Refatoração:** 50/100 🟡
- **Status:** Considerar refatoração

#### `src/components/despesa/DespesaFormDateFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormDateFields.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormDateFields, getDataMaxima, dataMaxima, styles
- **Dependências**: react
- **Score de Refatoração:** 44/100 🟡
- **Status:** Considerar refatoração

#### `src/components/despesa/DespesaFormEmendaInfo.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormEmendaInfo.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormEmendaInfo, styles
- **Dependências**: react
- **Score de Refatoração:** 33/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/despesa/DespesaFormEmpenhoFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormEmpenhoFields.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormEmpenhoFields, styles
- **Dependências**: react
- **Score de Refatoração:** 40/100 🟡
- **Status:** Considerar refatoração

#### `src/components/despesa/DespesaFormHeader.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormHeader.jsx
- **Tipo**: Functional Component
- **Funções**: DespesaFormHeader, styles
- **Dependências**: react
- **Score de Refatoração:** 35/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/despesa/DespesaFormOrcamentoFields.jsx`
- **Funcionalidade**: src/components/despesa/DespesaFormOrcamentoFields.jsx
- **Tipo**: Class Component
- **Funções**: DespesaFormOrcamentoFields, styles
- **Dependências**: react
- **Score de Refatoração:** 43/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/components/EmendaFormActions.jsx`
- **Funcionalidade**: src/components/emenda/EmendaForm/components/EmendaFormActions.jsx
- **Tipo**: Functional Component
- **Funções**: EmendaFormActions, navigate, handleCancel, handleVoltar, handleSubmit, styles
- **Dependências**: react, react-router-dom, ../../../../hooks/useEmendaFormNavigation
- **Score de Refatoração:** 46/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/components/EmendaFormCancelModal.jsx`
- **Funcionalidade**: src/components/emenda/EmendaForm/components/EmendaFormCancelModal.jsx
- **Tipo**: Functional Component
- **Funções**: EmendaFormCancelModal, navigate, handleConfirm, handleCancel, modalConfig
- **Dependências**: react, react-router-dom, ../../../ConfirmationModal...
- **Score de Refatoração:** 44/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/components/EmendaFormHeader.jsx`
- **Funcionalidade**: src/components/emenda/EmendaForm/components/EmendaFormHeader.jsx
- **Tipo**: Functional Component
- **Funções**: EmendaFormHeader, configuracao, config, styles
- **Dependências**: react
- **Score de Refatoração:** 36/100 🟢
- **Status:** Monitorar crescimento

#### `src/components/emenda/EmendaForm/index.jsx`
- **Funcionalidade**: src/components/emenda/EmendaForm/index.jsx - CORREÇÃO LOADING INFINITO
- **Tipo**: Functional Component (Hooks)
- **Funções**: EmendaForm, navigate, mountedRef, isEdicao, inicializar, emendaDoc, emendaData, userRole, handleInputChange, validarFormulario, errors, handleSubmit, valorNumerico, dadosParaSalvar, styles, styleSheet
- **Dependências**: react, react-router-dom, ../../../firebase/firebaseConfig...
- **Score de Refatoração:** 69/100 🟠
- **Status:** Refatoração recomendada

#### `src/components/emenda/EmendaForm/sections/AcoesServicos.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component
- **Funções**: AcoesServicos, estrategias, metas, handleInputChange, formatarMoeda, numero, centavos, reais, handleValorChange, valorFormatado, styles
- **Dependências**: react
- **Score de Refatoração:** 54/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/sections/ClassificacaoTecnica.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component
- **Funções**: ClassificacaoTecnica, tiposEmenda, handleInputChange, styles
- **Dependências**: react
- **Score de Refatoração:** 46/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/sections/Cronograma.jsx`
- **Funcionalidade**: src/components/emenda/EmendaForm/sections/Cronograma.jsx
- **Tipo**: Functional Component
- **Funções**: Cronograma, handleInputChange, isDataFutura, hoje, data, isDataValidaComparacao, isDataExcedeValidade, validade, getDataErrorMessage, inicio, fim, styles
- **Dependências**: react
- **Score de Refatoração:** 59/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/sections/DadosBancarios.jsx`
- **Funcionalidade**: src/components/emenda/EmendaForm/sections/DadosBancarios.jsx
- **Tipo**: Functional Component (Hooks)
- **Funções**: DadosBancarios, handleInputChange, bancosComuns, styles
- **Dependências**: react
- **Score de Refatoração:** 53/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/sections/DadosBasicos.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component
- **Funções**: DadosBasicos, programas, formatarMoeda, numero, centavos, reais, handleInputChange, valorFormatado, styles
- **Dependências**: react
- **Score de Refatoração:** 54/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component (Hooks)
- **Funções**: DadosBeneficiario, toggleExpanded, styles
- **Dependências**: react
- **Score de Refatoração:** 50/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/sections/Identificacao.jsx`
- **Funcionalidade**: Primeiro dígito
- **Tipo**: Functional Component
- **Funções**: Identificacao, estados, handleInputChange, formatted, isValidCNPJ, numbers, digits, getCNPJStatus, cnpjLimpo, cnpjStatus, styles
- **Dependências**: react
- **Score de Refatoração:** 51/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/sections/InformacoesComplementares.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component (Hooks)
- **Funções**: InformacoesComplementares, handleInputChange, toggleExpanded, styles
- **Dependências**: react
- **Score de Refatoração:** 52/100 🟡
- **Status:** Considerar refatoração

#### `src/components/emenda/EmendaForm/sections/InformacoesFinais.jsx`
- **Funcionalidade**: Sem descrição disponível
- **Tipo**: Functional Component (Hooks)
- **Funções**: InformacoesFinais, handleInputChange, toggleExpanded, styles
- **Dependências**: react
- **Score de Refatoração:** 54/100 🟡
- **Status:** Considerar refatoração



---

### 🎣 **Hooks Customizados**

#### `src/hooks/useEmendaDespesa.js`
- **Funcionalidade**: src/hooks/useEmendaDespesa.js - VERSÃO CORRIGIDA v2.0
- **Funções**: useEmendaDespesa, isMountedRef, determinarPermissoes, permissoesLiberadas, calcularMetricasEmenda, valorTotal, despesasValidas, valorExecutado, saldoDisponivel, percentualExecutado, despesasPorStatus, status, carregarEmenda, emendaDoc, emendaData, carregarDespesasEmenda, q, snapshot, despesasData, carregarTodasEmendasComMetricas, emendasData, emendasComMetricas, metricasEmenda, validarNovaDespesa, metricas, atualizarSaldoEmenda, obterEstatisticasGerais, totalEmendas, valorTotalGeral, valorExecutadoGeral, saldoDisponivelGeral, emendasComSaldo, emendasEsgotadas, emendasSemDespesas, mediaExecucao, filtrarEmendas, busca, recarregar, metricasCalculadas, carregarDadosIniciais, despesasQuery, useIsMounted
- **Score de Refatoração:** 61/100 🟠
- **Status:** Refatoração recomendada

#### `src/hooks/useEmendaFormNavigation.js`
- **Funcionalidade**: src/hooks/useEmendaFormNavigation.js
- **Funções**: useEmendaFormNavigation, navigate, location, navegarParaListaEmendas, tentarNavegacao, currentPath, navegarComConfirmacao, confirmed, cancelarFormulario, navegarAposSalvar, navegarParaEdicao, path, navegarParaCriacao, navegarParaVisualizacao, criarLinkProtegido
- **Score de Refatoração:** 44/100 🟡
- **Status:** Considerar refatoração

#### `src/hooks/useNavigationProtection.js`
- **Funcionalidade**: hooks/useNavigationProtection.js - Hook Completo para Proteção de Navegação
- **Funções**: useNavigationProtection, navigate, location, handleBeforeUnload, safeNavigate, shouldNavigate, navigateWithConfirmation, canNavigate, confirmMessage, navigateWithSave, choice, createLinkHandler, createButtonHandler, useFormNavigation, navigateToRelated, shouldSave, cancelForm, shouldDiscard, useModuleNavigation, goToEmendaDespesas, returnToEmenda, createDespesaForEmenda, getNavigationSource
- **Score de Refatoração:** 57/100 🟡
- **Status:** Considerar refatoração

#### `src/hooks/usePageTitle.js`
- **Funcionalidade**: src/hooks/usePageTitle.js
- **Funções**: usePageTitle, baseTitle, Dashboard, Relatorios, Despesas
- **Score de Refatoração:** 41/100 🟡
- **Status:** Considerar refatoração

#### `src/hooks/usePagination.js`
- **Funcionalidade**: src/hooks/usePagination.js
- **Funções**: usePagination, totalItems, totalPages, paginatedData, startIndex, endIndex, hasNextPage, hasPreviousPage, isFirstPage, isLastPage, goToPage, goToNextPage, goToPreviousPage, goToFirstPage, goToLastPage, changePageSize, getPageRange, delta, range, rangeWithDots, reset, getSummary, goToItemPage, page, isItemInCurrentPage, itemPage, usePaginationWithFilter, filteredData, itemValue, term, pagination, setFilter, clearFilters, clearFilter, newFilters, usePaginationWithSort, sortedData, aStr, bStr, handleSort, clearSort
- **Score de Refatoração:** 64/100 🟠
- **Status:** Refatoração recomendada

#### `src/hooks/usePermissions.js`
- **Funcionalidade**: src/hooks/usePermissions.js - HOOK CENTRALIZADO DE PERMISSÕES
- **Funções**: usePermissions, calcularPermissoes, municipio, uf, localizacao, novasPermissoes, methods
- **Score de Refatoração:** 60/100 🟠
- **Status:** Refatoração recomendada

#### `src/hooks/useValidation.js`
- **Funcionalidade**: src/hooks/useValidation.js - VERSÃO COMPLETA COM FIX
- **Funções**: validationRules, emailRegex, actualMessage, num, cpf, cnpj, weights1, weights2, calc, sum, remainder, digit1, digit2, inputDate, today, date, phone, strongRegex, alphabeticRegex, numericRegex, useValidation, validateField, error, validateForm, newErrors, rules, value, validateSingleField, setFieldTouched, clearErrors, clearFieldError, newTouched, getFieldError, isFieldValid, useFormValidation, validation, handleChange, handleBlur, handleSubmit, reset, setValue, setAllValues, formatters, cep, number, schemas
- **Score de Refatoração:** 71/100 🟠
- **Status:** Refatoração recomendada



---

### 🛠️ **Utilitários**

#### `src/utils/despesaValidators.js`
- **Funcionalidade**: src/components/despesa/DespesaFormHeader.jsx
- **Funções**: DespesaFormHeader, styles
- **Score de Refatoração:** 35/100 🟢
- **Status:** Monitorar crescimento

#### `src/utils/errorHandlers.js`
- **Funcionalidade**: src/utils/errorHandlers.js - Centralized Error Handling
- **Funções**: handleFirebaseError, errorReport, existingErrors, handleValidationError, errors, handleNetworkError, showUserError, getStoredErrors, clearStoredErrors, createErrorReport
- **Score de Refatoração:** 51/100 🟡
- **Status:** Considerar refatoração

#### `src/utils/firebaseCollections.js`
- **Funcionalidade**: src/utils/firebaseCollections.js - ATUALIZADO CONFORME PRINTS
- **Funções**: COLLECTIONS, EMENDA_SCHEMA, USER_SCHEMA, DESPESA_SCHEMA, ACAO_SERVICO_SCHEMA, META_SCHEMA, validateDocumentStructure, requiredFields, normalizeDocument, normalized, validateAcaoServico, validateMeta, calcularValorTotalAcoesServicos, validateEmendaCompleta, erros, camposObrigatorios, ufsValidas, validarCNPJ
- **Score de Refatoração:** 69/100 🟠
- **Status:** Refatoração recomendada

#### `src/utils/formStyles.js`
- **Funcionalidade**: ✅ ESTILOS UNIVERSAIS PARA FORMS - COM DARK MODE COMPLETO
- **Funções**: formStyles, addFormInteractivity, css, style, styles
- **Score de Refatoração:** 52/100 🟡
- **Status:** Considerar refatoração

#### `src/utils/formatters.js`
- **Funcionalidade**: ✅ FORMATADORES MONETÁRIOS PRECISOS - src/utils/formatters.js - VERSÃO COMPLETA
- **Funções**: formatarMoedaDisplay, numero, formatarMoedaInput, parseValorMonetario, calcularSaldoEmenda, total, executado, useMoedaFormatting, handleValorChange, valorFormatado, valorNumerico, saldoDisponivel, formatarNumero, formatarPercentual, formatarCNPJDisplay, numeros, formatarTelefone, formatarData, dataObj, formatarDataHora, validarValorMonetario, calcularEstatisticas, totalDespesas, totalEmendas, saldoTotal, percentualExecutado
- **Score de Refatoração:** 62/100 🟠
- **Status:** Refatoração recomendada

#### `src/utils/printUtils.js`
- **Funcionalidade**: src/utils/printUtils.js
- **Funções**: formatCurrency, formatDate, printReport, reportElement, printWindow, contentClone, elementsToRemove, printContent
- **Score de Refatoração:** 53/100 🟡
- **Status:** Considerar refatoração

#### `src/utils/validators.js`
- **Funcionalidade**: src/utils/validators.js - VALIDAÇÕES CENTRALIZADAS DO SISTEMA
- **Funções**: UFS_VALIDAS, normalizeUF, normalized, validateUF, normalizeMunicipio, validateMunicipio, validateLocation, erros, ufNormalizada, regex, validateEmail, emailRegex, validatePassword, validateUserTipo, tiposValidos, validateUserStatus, statusValidos, sanitizeString, validateNome, nomeNorm, palavras, validateTelefone, apenasNumeros, getEstadoNome, estados, ufNorm, validateUserData, senhaValidacao, nomeValidacao, localizacao, telefoneValidacao, logValidation, createErrorReport, formatarCNPJ, numeros, validarCNPJ, numero, useCNPJValidation, handleCNPJChange, cnpjFormatado, validacao
- **Score de Refatoração:** 71/100 🟠
- **Status:** Refatoração recomendada



---

### 🔧 **Serviços**

#### `src/services/createAdminUser.js`
- **Funcionalidade**: src/services/createAdminUser.js - Criar usuário admin diretamente no Firebase
- **Funções**: auth, createAdminUser, q, querySnapshot, userCredential, adminData, docRef, createPaulinetteAdmin
- **Score de Refatoração:** 41/100 🟡
- **Status:** Considerar refatoração

#### `src/services/emendasService.js`
- **Funcionalidade**: src/services/emendasService.js
- **Funções**: carregarEmendasPorPermissao, querySnapshot, emendasData
- **Score de Refatoração:** 33/100 🟢
- **Status:** Monitorar crescimento

#### `src/services/userService.js`
- **Funcionalidade**: src/services/userService.js - VERSÃO CORRIGIDA COM CRIAÇÃO ATÔMICA
- **Funções**: auth, COLLECTION_NAME, trackUserAccess, userRef, generateTempPassword, uppercase, lowercase, numbers, specials, allChars, checkEmailExists, emailToCheck, q, querySnapshot, exists, userData, normalizeTipo, tipoMap, convertRoleToTipo, roleMap, validateFormData, errors, emailRegex, tipoUsuario, isValid, handleFirebaseError, loadUsers, users, handleOrphanedUser, firestoreExists, docRef, createUser, validation, errorMsg, emailExists, senhaTemporaria, resultado, errorMessage, updateUser, updateData, deleteUserById, cleanUserId, userDocRef, userDoc, sendPasswordReset, diagnoseEmail, cleanupBrokenUsers, usuariosSnapshot, brokenUsers, email, fixBrokenUser, userCredential, updatedData, userService, emails
- **Score de Refatoração:** 71/100 🟠
- **Status:** Refatoração recomendada



---

## 📊 **ESTATÍSTICAS DO SISTEMA**

- **Total de Componentes**: 60
- **Total de Hooks**: 7
- **Total de Utilitários**: 7
- **Total de Serviços**: 3
- **Dependências Principais**: 6
- **Dependências de Desenvolvimento**: 7
- **Arquivos Analisados para Refatoração**: 77
- **Arquivos que Precisam de Refatoração**: 65
- **Score Médio de Complexidade**: 54/100

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
**🔄 Última Atualização**: 04/08/2025, 20:34:07  
**📊 Versão**: 2.5  
**💻 Desenvolvido em**: Replit  
**✅ Status**: Produção Ativa com Sistema de Análise de Refatoração Corrigido

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
- ✅ **NOVO:** Forçar releitura de arquivos atualizados
- ✅ **NOVO:** Correção de campos undefined
- ✅ **NOVO:** Validação completa de paths

### 🔬 **Critérios de Análise de Refatoração:**
- **Linhas de Código**: Limite de 300 linhas (peso: 25%)
- **Número de Funções**: Limite de 15 funções (peso: 20%)
- **Complexidade Ciclomática**: Limite de 20 (peso: 25%)
- **Dependências**: Limite de 20 imports (peso: 15%)
- **Elementos JSX**: Limite de 50 elementos (peso: 10%)
- **Aninhamento**: Limite de 5 níveis (peso: 5%)

### 🚨 **CORREÇÕES IMPLEMENTADAS v2.5:**

1. **Cache Busting**: Forçar releitura de arquivos com `forceReadFile()`
2. **Path Validation**: Validação completa de existência de arquivos
3. **Undefined Fields Fix**: Correção de campos undefined na seção de refatoração
4. **Enhanced Debugging**: Logs detalhados para cada arquivo analisado
5. **Error Handling**: Melhor tratamento de erros de leitura de arquivos
6. **Full Path Tracking**: Manter referência completa dos paths dos arquivos

### 📋 **STATUS DE DEBUGGING:**

- ✅ Leitura forçada de arquivos implementada
- ✅ Cache de require limpo para cada análise  
- ✅ Validação de existência de arquivos
- ✅ Logs detalhados de métricas por arquivo
- ✅ Correção de paths relativos vs absolutos
- ✅ Eliminação de campos undefined
