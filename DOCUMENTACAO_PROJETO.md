
# DOCUMENTAÇÃO DO PROJETO - Sistema de Gestão de Emendas Parlamentares

## 📋 VISÃO GERAL
Sistema React para gestão de emendas parlamentares e suas despesas, com autenticação Firebase e controle de permissões por roles (admin/operador).

---

## 📁 ESTRUTURA DE ARQUIVOS E FUNCIONALIDADES

### 🔧 **ARQUIVOS DE CONFIGURAÇÃO**

#### **`.replit`**
- **Objetivo**: Configuração do ambiente Replit
- **Funcionalidade**: Define comandos de execução, portas e workflows
- **Dependências**: Node.js, Firebase Tools

#### **`package.json`**
- **Objetivo**: Gerenciamento de dependências e scripts
- **Funcionalidade**: Define bibliotecas React, Firebase, routing, gráficos
- **Dependências**: React 18, Firebase 11.9.1, React Router DOM, Recharts

#### **`vite.config.js`**
- **Objetivo**: Configuração do bundler Vite
- **Funcionalidade**: Build e desenvolvimento com HMR

#### **`tsconfig.json`**
- **Objetivo**: Configuração TypeScript
- **Funcionalidade**: Suporte parcial a TS em projeto JSX

---

### 🚀 **ARQUIVOS PRINCIPAIS**

#### **`src/index.jsx`**
- **Objetivo**: Ponto de entrada da aplicação
- **Funcionalidade**: Renderiza componente App no DOM
- **Dependências**: React, ReactDOM, App.jsx

#### **`src/App.jsx`** ⭐ **ARQUIVO CENTRAL**
- **Objetivo**: Componente raiz com roteamento e autenticação
- **Funcionalidade**:
  - Sistema de rotas protegidas
  - Gerenciamento de login/logout
  - Proteção de navegação em formulários
  - Error boundaries
- **Dependências**:
  - `UserContext.jsx` (autenticação)
  - `PrivateRoute.jsx` (proteção)
  - Todos os componentes de página
  - `Toast.jsx` (notificações)

---

### 🔐 **AUTENTICAÇÃO E CONTEXTO**

#### **`src/context/UserContext.jsx`**
- **Objetivo**: Context para gerenciamento de usuário autenticado
- **Funcionalidade**:
  - Auth state do Firebase
  - Carregamento de dados do usuário
  - Persistência de sessão
- **Dependências**: `firebaseConfig.js`

#### **`src/firebase/firebaseConfig.js`**
- **Objetivo**: Configuração do Firebase
- **Funcionalidade**: Inicialização Auth e Firestore
- **Dependências**: Firebase SDK

---

### 🛡️ **HOOKS CUSTOMIZADOS**

#### **`src/hooks/useEmendaDespesa.js`** ⭐ **HOOK PRINCIPAL**
- **Objetivo**: Gerenciamento completo de emendas e despesas
- **Funcionalidade**:
  - CRUD de emendas/despesas
  - Cálculo de métricas financeiras
  - Validação de saldos
  - Filtros por permissão (admin/operador)
  - Listeners em tempo real
- **Dependências**: Firebase Firestore, hooks internos

#### **`src/hooks/usePermissions.js`**
- **Objetivo**: Centralização de lógica de permissões
- **Funcionalidade**: Determina acesso baseado em roles
- **Dependências**: `validators.js`

#### **`src/hooks/usePagination.js`**
- **Objetivo**: Paginação e filtros de dados
- **Funcionalidade**: Busca, ordenação, paginação
- **Dependências**: React hooks

#### **`src/hooks/useValidation.js`**
- **Objetivo**: Validação de formulários
- **Funcionalidade**: Regras de validação customizadas

#### **`src/hooks/useNavigationProtection.js`**
- **Objetivo**: Proteção contra perda de dados em formulários
- **Funcionalidade**: Confirmação antes de sair de formulários

#### **`src/hooks/usePageTitle.js`**
- **Objetivo**: Atualização dinâmica do título da página

---

### 🏠 **COMPONENTES DE PÁGINA**

#### **`src/components/Home.jsx`**
- **Objetivo**: Página inicial para usuários não autenticados
- **Funcionalidade**: Apresentação do sistema e botão de login

#### **`src/components/Dashboard.jsx`**
- **Objetivo**: Painel principal com métricas gerais
- **Funcionalidade**:
  - Estatísticas de emendas e despesas
  - Gráficos com Recharts
  - Filtros por período
- **Dependências**: `useEmendaDespesa.js`, Recharts

#### **`src/components/Emendas.jsx`** ⭐ **PÁGINA PRINCIPAL**
- **Objetivo**: Gerenciamento completo de emendas
- **Funcionalidade**:
  - Listagem com filtros avançados
  - CRUD de emendas
  - Navegação para fluxo de despesas
- **Dependências**:
  - `EmendasTable.jsx`
  - `EmendasFilters.jsx`
  - `EmendaForm.jsx`
  - `useEmendaDespesa.js`

#### **`src/components/Despesas.jsx`** ⭐ **PÁGINA PRINCIPAL**
- **Objetivo**: Gerenciamento completo de despesas
- **Funcionalidade**:
  - Listagem por emenda
  - CRUD de despesas
  - Validação de saldos
- **Dependências**:
  - `DespesasTable.jsx`
  - `DespesasFilters.jsx`
  - `DespesaForm.jsx`
  - `useEmendaDespesa.js`

#### **`src/components/FluxoEmenda.jsx`**
- **Objetivo**: Visualização detalhada emenda + despesas
- **Funcionalidade**:
  - Timeline de despesas
  - Detalhes financeiros
  - Histórico de movimentações
- **Dependências**: `useEmendaDespesa.js`, React Router

#### **`src/components/Relatorios.jsx`**
- **Objetivo**: Geração de relatórios
- **Funcionalidade**:
  - Relatórios por período/filtros
  - Export para impressão
- **Dependências**: `PrintButton.jsx`, `useEmendaDespesa.js`

#### **`src/components/Administracao.jsx`**
- **Objetivo**: Painel administrativo (admin only)
- **Funcionalidade**:
  - Gestão de usuários
  - Configurações do sistema
- **Dependências**: `AdminPanel.jsx`, role admin

---

### 📝 **COMPONENTES DE FORMULÁRIO**

#### **`src/components/EmendaForm.jsx`**
- **Objetivo**: Formulário de criação/edição de emendas
- **Funcionalidade**:
  - Validação de dados
  - Campos condicionais por role
- **Dependências**: `useValidation.js`, `useNavigationProtection.js`

#### **`src/components/DespesaForm.jsx`**
- **Objetivo**: Formulário de criação/edição de despesas
- **Funcionalidade**:
  - Validação de saldo disponível
  - Upload de documentos
- **Dependências**: `useEmendaDespesa.js`, `useValidation.js`

#### **`src/components/Login.jsx`**
- **Objetivo**: Formulário de autenticação
- **Funcionalidade**: Login com email/senha via Firebase Auth
- **Dependências**: `UserContext.jsx`

---

### 📊 **COMPONENTES DE TABELA E LISTAGEM**

#### **`src/components/EmendasTable.jsx`**
- **Objetivo**: Tabela principal de emendas
- **Funcionalidade**:
  - Ordenação por colunas
  - Ações contextuais (editar, ver fluxo)
- **Dependências**: `PaginatedTable.jsx`

#### **`src/components/DespesasTable.jsx`**
- **Objetivo**: Tabela principal de despesas
- **Funcionalidade**:
  - Agrupamento por emenda
  - Status de aprovação
- **Dependências**: `PaginatedTable.jsx`

#### **`src/components/PaginatedTable.jsx`**
- **Objetivo**: Componente reutilizável de tabela paginada
- **Funcionalidade**: Paginação, ordenação, filtros
- **Dependências**: `Pagination.jsx`, `usePagination.js`

#### **`src/components/EmendasList.jsx`** & **`DespesasList.jsx`**
- **Objetivo**: Versões em lista (mobile-friendly)
- **Funcionalidade**: Layout responsivo para telas pequenas

---

### 🔍 **COMPONENTES DE FILTRO E BUSCA**

#### **`src/components/EmendasFilters.jsx`**
- **Objetivo**: Filtros específicos para emendas
- **Funcionalidade**: Filtro por parlamentar, tipo, status financeiro

#### **`src/components/DespesasFilters.jsx`**
- **Objetivo**: Filtros específicos para despesas
- **Funcionalidade**: Filtro por emenda, status, valor

#### **`src/components/GlobalSearch.jsx`**
- **Objetivo**: Busca global no sistema
- **Funcionalidade**:
  - Busca em emendas e despesas
  - Highlights de resultados
  - Scores de relevância

---

### 🛠️ **COMPONENTES UTILITÁRIOS**

#### **`src/components/Sidebar.jsx`**
- **Objetivo**: Menu lateral de navegação
- **Funcionalidade**:
  - Menu responsivo
  - Indicadores de rota ativa
  - Logout
- **Dependências**: `useNavigationProtection.js`

#### **`src/components/PrivateRoute.jsx`**
- **Objetivo**: Proteção de rotas por autenticação
- **Funcionalidade**: Verifica auth e roles
- **Dependências**: `UserContext.jsx`

#### **`src/components/Toast.jsx`**
- **Objetivo**: Sistema de notificações
- **Funcionalidade**: Feedback visual para ações

#### **`src/components/ConfirmationModal.jsx`**
- **Objetivo**: Modal de confirmação reutilizável
- **Funcionalidade**: Confirmações de exclusão/ações críticas

#### **`src/components/ErrorBoundary.jsx`**
- **Objetivo**: Captura de erros React
- **Funcionalidade**: Fallback para erros não tratados

#### **`src/components/PrintButton.jsx`**
- **Objetivo**: Funcionalidade de impressão
- **Funcionalidade**: Formatação para impressão
- **Dependências**: `printUtils.js`

---

### 🎨 **ESTILOS E TEMA**

#### **`src/App.css`**
- **Objetivo**: Estilos globais da aplicação
- **Funcionalidade**: Reset CSS, utilitários, componentes base

#### **`src/styles/theme.css`**
- **Objetivo**: Sistema de design consistente
- **Funcionalidade**: Variáveis CSS, cores, tipografia

---

### 🔧 **UTILITÁRIOS**

#### **`src/utils/validators.js`**
- **Objetivo**: Funções de validação
- **Funcionalidade**: Validação de dados, normalização

#### **`src/utils/firebaseCollections.js`**
- **Objetivo**: Constantes do Firestore
- **Funcionalidade**: Nomes de coleções centralizados

#### **`src/utils/exportImport.js`**
- **Objetivo**: Funcionalidades de export/import
- **Funcionalidade**: Export CSV, backup de dados

#### **`src/utils/printUtils.js`**
- **Objetivo**: Utilitários de impressão
- **Funcionalidade**: Formatação para impressão

---

### ⚙️ **CONFIGURAÇÕES**

#### **`src/config/constants.js`**
- **Objetivo**: Constantes da aplicação
- **Funcionalidade**: URLs, limites, configurações

---

## 🔗 **FLUXO DE DEPENDÊNCIAS PRINCIPAIS**

```
App.jsx (raiz)
├── UserContext.jsx (autenticação)
├── useEmendaDespesa.js (dados principais)
├── Emendas.jsx
│   ├── EmendasTable.jsx
│   ├── EmendasFilters.jsx
│   └── EmendaForm.jsx
├── Despesas.jsx
│   ├── DespesasTable.jsx
│   ├── DespesasFilters.jsx
│   └── DespesaForm.jsx
└── FluxoEmenda.jsx (visualização)
```

## 🎯 **ARQUIVOS CRÍTICOS PARA FUNCIONAMENTO**

1. **`useEmendaDespesa.js`** - Coração do sistema de dados
2. **`UserContext.jsx`** - Autenticação e usuário
3. **`App.jsx`** - Roteamento e estrutura
4. **`firebaseConfig.js`** - Conexão com backend
5. **`Emendas.jsx`** e **`Despesas.jsx`** - Funcionalidades principais

---

## 📱 **CARACTERÍSTICAS DO SISTEMA**

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Auth + Firestore)
- **Roteamento**: React Router DOM
- **Gráficos**: Recharts
- **Estado**: Context API + Custom Hooks
- **Segurança**: Role-based permissions
- **Responsivo**: Mobile-first design
