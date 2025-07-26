
# 📋 HANDOVER - Sistema SICEFSUS

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
- **Recharts** - Gráficos e visualizações
- **React Hooks** - Gerenciamento de estado
- **CSS-in-JS** - Estilização inline

### Ambiente de Desenvolvimento
- **Replit** - Plataforma de desenvolvimento
- **Node.js** - Runtime JavaScript
- **npm** - Gerenciador de pacotes

---

## 📁 ESTRUTURA DE PASTAS

```
SICEFSUS/
├── public/                     # Arquivos estáticos
│   └── favicon.png
├── src/                        # Código fonte principal
│   ├── components/             # Componentes React
│   ├── config/                 # Configurações
│   ├── context/                # Context API
│   ├── firebase/               # Configuração Firebase
│   ├── hooks/                  # Custom hooks
│   ├── images/                 # Imagens e assets
│   ├── styles/                 # Estilos CSS
│   ├── utils/                  # Utilitários
│   ├── App.jsx                 # Componente principal
│   └── index.jsx              # Entry point
├── attached_assets/           # Assets anexados
├── .config/                   # Configurações do sistema
├── package.json              # Dependências npm
├── vite.config.js            # Configuração Vite
├── index.html               # HTML principal
└── README.md               # Documentação básica
```

---

## 📄 DESCRIÇÃO DETALHADA DOS ARQUIVOS

### 🏗️ **Arquivos Principais**

#### `src/App.jsx`
- **Funcionalidade**: Componente raiz da aplicação
- **Responsabilidades**: Roteamento, autenticação, navegação
- **Dependências**: UserContext, componentes de página, Firebase
- **Características**: Error boundary, proteção de rotas, gerenciamento de estado global

#### `src/index.jsx`
- **Funcionalidade**: Entry point da aplicação
- **Responsabilidades**: Renderização do componente App no DOM
- **Dependências**: React, ReactDOM, App.jsx

#### `index.html`
- **Funcionalidade**: Template HTML principal
- **Responsabilidades**: Estrutura base, meta tags, favicon
- **Características**: PWA ready, SEO otimizado

---

### 🧩 **Componentes Principais**

#### `src/components/Dashboard.jsx`
- **Funcionalidade**: Página inicial com métricas
- **Responsabilidades**: Exibir estatísticas, gráficos, KPIs
- **Dependências**: useEmendaDespesa hook, Recharts
- **Integração**: Conecta com Emendas.jsx e Despesas.jsx

#### `src/components/Emendas.jsx`
- **Funcionalidade**: Gestão completa de emendas
- **Responsabilidades**: CRUD de emendas, navegação para despesas
- **Dependências**: EmendaForm, EmendasTable, useEmendaDespesa
- **Características**: Filtros, paginação, permissões por usuário

#### `src/components/EmendaForm.jsx`
- **Funcionalidade**: Formulário de cadastro/edição de emendas
- **Responsabilidades**: Validação, salvamento, integração Firebase
- **Dependências**: Firebase Firestore, validadores
- **Modos**: Criação, edição, visualização

#### `src/components/EmendasTable.jsx`
- **Funcionalidade**: Tabela de listagem de emendas
- **Responsabilidades**: Exibição, ações (editar, deletar, despesas)
- **Dependências**: Paginação, filtros
- **Características**: Responsiva, ações condicionais

#### `src/components/Despesas.jsx`
- **Funcionalidade**: Gestão de despesas por emenda
- **Responsabilidades**: CRUD de despesas, controle de saldos
- **Dependências**: DespesaForm, DespesasTable, useEmendaDespesa
- **Integração**: Recebe contexto de emendas

#### `src/components/DespesaForm.jsx`
- **Funcionalidade**: Formulário de despesas
- **Responsabilidades**: Validação de saldos, cálculos automáticos
- **Dependências**: Firebase, validadores financeiros
- **Características**: Validação em tempo real

#### `src/components/Administracao.jsx`
- **Funcionalidade**: Painel administrativo
- **Responsabilidades**: Gestão de usuários, permissões
- **Dependências**: AdminPanel, Firebase Auth
- **Restrições**: Apenas usuários admin

---

### 🔧 **Context e Hooks**

#### `src/context/UserContext.jsx`
- **Funcionalidade**: Contexto global de usuário
- **Responsabilidades**: Autenticação, dados do usuário, permissões
- **Dependências**: Firebase Auth, Firestore
- **Características**: Provider para toda aplicação

#### `src/hooks/useEmendaDespesa.js`
- **Funcionalidade**: Hook principal para dados
- **Responsabilidades**: Carregamento de emendas/despesas, cálculos
- **Dependências**: Firebase Firestore, useEffect, useState
- **Características**: Cache, permissões, filtros automáticos

#### `src/hooks/usePagination.js`
- **Funcionalidade**: Hook para paginação
- **Responsabilidades**: Controle de páginas, itens por página
- **Dependências**: React hooks
- **Utilização**: Tabelas de emendas e despesas

---

### 🔥 **Firebase**

#### `src/firebase/firebaseConfig.js`
- **Funcionalidade**: Configuração Firebase
- **Responsabilidades**: Inicialização, conexão com services
- **Dependências**: Variáveis de ambiente (Secrets)
- **Services**: Auth, Firestore, Storage

---

### 🎨 **Estilos e Assets**

#### `src/styles/theme.css`
- **Funcionalidade**: Tema global CSS
- **Responsabilidades**: Variáveis CSS, estilos globais
- **Características**: Design system, cores padronizadas

#### `src/images/logo-sicefsus.png`
- **Funcionalidade**: Logo oficial do sistema
- **Utilização**: Header, login, documentos

---

### 🛠️ **Utilitários**

#### `src/utils/validators.js`
- **Funcionalidade**: Validadores de formulário
- **Responsabilidades**: Validação de dados, formatação
- **Utilização**: Formulários de emendas e despesas

#### `src/utils/exportImport.js`
- **Funcionalidade**: Exportação de dados
- **Responsabilidades**: Geração de relatórios, export CSV/PDF
- **Dependências**: Dados do Firebase

---

### ⚙️ **Configuração**

#### `package.json`
- **Dependências principais**:
  - react: ^18.2.0
  - react-router-dom: ^6.x
  - firebase: ^10.x
  - recharts: ^2.x
  - vite: ^5.x

#### `vite.config.js`
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

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

---

## 📝 **OBSERVAÇÕES IMPORTANTES**

1. **Variáveis de Ambiente**: Configuradas no Secrets do Replit
2. **Permissões**: Sistema de roles (admin/operador) com filtros por município
3. **Estado**: Gerenciado via Context API e hooks customizados
4. **Responsividade**: Interface adaptada para mobile e desktop
5. **Segurança**: Regras de segurança Firebase configuradas
6. **Performance**: Lazy loading e otimizações implementadas

---

**Data de Criação**: Janeiro 2025  
**Versão**: 2.0  
**Desenvolvido em**: Replit  
**Status**: Produção Ativa
