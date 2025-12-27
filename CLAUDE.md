# SICEFSUS - Sistema de Gestao de Emendas Parlamentares

## Visao Geral
Sistema brasileiro para gerenciamento de emendas parlamentares e despesas de saude.
- **Stack:** React + Firebase (Firestore + Auth)
- **Deploy:** Replit
- **Usuarios:** Admin (ve tudo), Gestor (municipio), Operador (municipio)
- **Design System:** v2.0 (Inter font, Tailwind-based colors)

## Ultima Atualizacao - 27/12/2025

**Transformacao Visual Aplicada:**
- Paleta de cores atualizada para estilo moderno (Tailwind)
- Fonte Inter adicionada
- Novas classes CSS utilitarias
- Ver `DESIGN_SYSTEM.md` para detalhes completos

## Arquivos Criticos (LEIA ANTES DE MODIFICAR)

### Fundacao
- `src/App.jsx` - Rotas e navegacao central
- `src/context/UserContext.jsx` - Autenticacao e dados do usuario
- `src/firebase/firebaseConfig.js` - Conexao Firebase
- `src/config/constants.js` - Listas fixas (programas, naturezas)

### Hooks Principais
- `src/hooks/useEmendaFormData.js` - CRUD de emendas
- `src/hooks/useDespesasData.js` - CRUD de despesas
- `src/hooks/usePermissions.js` - Permissoes Admin/Gestor/Operador
- `src/hooks/useDashboardData.js` - Dados do Dashboard

---

# Mapeamento de Estrutura Completo

## 1. Arvore de Arquivos (src/ - 3 niveis)

```
src/
├── App.jsx                          # Componente principal com rotas
├── index.jsx                        # Entry point da aplicacao
├── App.css                          # Estilos globais
│
├── components/
│   ├── Dashboard.jsx                # Dashboard principal
│   ├── Login.jsx                    # Tela de login
│   ├── Emendas.jsx                  # Lista de emendas
│   ├── Despesas.jsx                 # Lista de despesas (obsoleto)
│   ├── Relatorios.jsx               # Modulo de relatorios
│   ├── Sidebar.jsx                  # Menu lateral
│   ├── Administracao.jsx            # Painel administrativo
│   ├── PrivateRoute.jsx             # Protecao de rotas
│   ├── ErrorBoundary.jsx            # Tratamento de erros
│   │
│   ├── emenda/
│   │   ├── EmendaForm/              # Formulario de emenda (multi-tabs)
│   │   │   ├── index.jsx
│   │   │   ├── components/          # EmendaFormHeader, TabNavigation
│   │   │   └── sections/            # DadosBasicos, Cronograma, DespesasTab
│   │   ├── EmendaDetail/            # Detalhes da emenda
│   │   │   ├── index.jsx
│   │   │   ├── components/          # EmendaHeader, EmendaKPIs, EmendaTabs
│   │   │   └── sections/            # VisaoGeralTab, DespesasTab
│   │   ├── EmendasTable.jsx         # Tabela de emendas
│   │   ├── EmendasFilters.jsx       # Filtros de emendas
│   │   └── ModalExclusaoEmenda.jsx  # Modal de exclusao
│   │
│   ├── despesa/
│   │   ├── DespesaCard/             # Cards de despesa
│   │   ├── DespesaFormActions.jsx   # Acoes do formulario
│   │   ├── DespesaFormBasicFields.jsx
│   │   ├── DespesaFormDateFields.jsx
│   │   ├── DespesaFormEmpenhoFields.jsx
│   │   └── DespesasStats.jsx        # Estatisticas
│   │
│   ├── DashboardComponents/
│   │   ├── CronogramaWidget.jsx     # Widget de cronograma
│   │   ├── DashboardExecucao.jsx    # Metricas de execucao
│   │   ├── DashboardTimeline.jsx    # Linha do tempo
│   │   ├── DashboardRankings.jsx    # Rankings
│   │   ├── DashboardMunicipios.jsx  # Ranking de municipios
│   │   └── DashboardAlertasDetalhados.jsx
│   │
│   ├── admin/
│   │   ├── UsersSection.jsx         # Gestao de usuarios
│   │   ├── UserModal.jsx            # Modal de usuario
│   │   ├── UsersTable.jsx           # Tabela de usuarios
│   │   └── MigracaoCompleta.jsx     # Ferramenta de migracao
│   │
│   ├── dev/
│   │   ├── FerramentasDev.jsx       # Ferramentas de desenvolvimento
│   │   ├── tabs/                    # Abas: Diagnostico, Backup, etc
│   │   └── shared/                  # Componentes compartilhados
│   │
│   └── relatorios/
│       ├── geradores/               # Geradores de PDF
│       ├── RelatoriosConfig.jsx
│       └── RelatoriosFiltros.jsx
│
├── context/
│   └── UserContext.jsx              # Contexto de autenticacao/usuario
│
├── hooks/
│   ├── useDashboardData.js          # Dados do dashboard
│   ├── usePermissions.js            # Controle de permissoes
│   ├── useDespesasData.js           # Dados de despesas
│   ├── useDespesasCalculos.js       # Calculos de despesas
│   ├── useEmendaFormData.js         # Dados do formulario de emenda
│   ├── useEmendaFormNavigation.js   # Navegacao do formulario
│   ├── useEmendaDespesa.js          # Operacoes emenda-despesa
│   ├── useNavigationProtection.js   # Protecao de navegacao
│   ├── useRelatoriosData.js         # Dados de relatorios
│   ├── useValidation.js             # Validacoes
│   ├── usePagination.js             # Paginacao
│   ├── usePageTitle.js              # Titulo da pagina
│   └── useVersion.js                # Controle de versao
│
├── services/
│   ├── emendasService.js            # Servico de emendas
│   ├── userService.js               # Servico de usuarios
│   ├── auditService.js              # Servico de auditoria
│   └── createAdminUser.js           # Criacao de admin
│
├── firebase/
│   └── firebaseConfig.js            # Configuracao Firebase
│
├── config/
│   └── constants.js                 # Constantes do sistema
│
├── utils/
│   ├── formatters.js                # Formatadores (moeda, data)
│   ├── validators.js                # Validadores
│   ├── emendaCalculos.js            # Calculos de emenda
│   ├── despesaValidators.js         # Validadores de despesa
│   ├── firebaseHelpers.js           # Helpers do Firebase
│   ├── firebaseCollections.js       # Nomes das colecoes
│   ├── errorHandlers.js             # Tratamento de erros
│   ├── versionControl.js            # Controle de versao
│   ├── exportImport.js              # Exportacao/importacao
│   ├── pdfHelpers.js                # Helpers de PDF
│   ├── guiaPdfGenerator.js          # Gerador de guias PDF
│   └── municipiosCache.js           # Cache de municipios
│
├── styles/
│   └── [arquivos CSS]
│
└── images/
    └── [imagens e logos]
```

---

## 2. Dependencias entre Componentes

### App.jsx
**Importa:**
- `react-router-dom`: Router, Routes, Route, Navigate
- `firebase/auth`: onAuthStateChanged, signOut
- `./components/Toast`: ToastProvider
- `./components/Sidebar`: Sidebar
- `./components/Login`: Login
- `./components/Dashboard`: Dashboard
- `./components/Emendas`: Emendas
- `./components/emenda/EmendaForm`: EmendaForm
- `./components/Relatorios`: Relatorios
- `./components/Administracao`: Administracao
- `./components/admin/MigracaoCompleta`: MigracaoCompleta
- `./components/dev/FerramentasDev`: FerramentasDev
- `./context/UserContext`: useUser, UserProvider
- `./hooks/useVersion`: useVersion
- `./firebase/firebaseConfig`: auth, db

**Quem importa App.jsx:** `index.jsx`

---

### Dashboard.jsx
**Importa:**
- `react-router-dom`: useNavigate
- `../hooks/usePermissions`: usePermissions
- `../hooks/useDashboardData`: useDashboardData
- `./DashboardComponents/CronogramaWidget`
- `./DashboardComponents/DashboardExecucao`
- `./DashboardComponents/DashboardTimeline`
- `./DashboardComponents/DashboardRankings`
- `./DashboardComponents/DashboardMunicipios`
- `./DashboardComponents/DashboardAlertasDetalhados`

**Quem importa Dashboard.jsx:** `App.jsx`

---

### Emendas.jsx
**Importa:**
- `react-router-dom`: useNavigate, useLocation
- `firebase/firestore`: collection, getDocs, deleteDoc, doc, query, where
- `../firebase/firebaseConfig`: db
- `../context/UserContext`: useUser
- `../hooks/useVersion`: useVersion
- `./EmendasFilters`: EmendasFilters
- `./EmendasTable`: EmendasTable
- `./Toast`: Toast
- `./emenda/ModalExclusaoEmenda`: ModalExclusaoEmenda

**Quem importa Emendas.jsx:** `App.jsx`

---

### EmendaForm (index.jsx)
**Importa:**
- `react-router-dom`: useNavigate, useParams
- `firebase/firestore`: doc, getDoc, setDoc, updateDoc, collection, addDoc
- `../../../firebase/firebaseConfig`: db
- `../../../context/UserContext`: useUser
- `./sections/*`: DadosBasicos, Cronograma, DespesasTab
- `./components/*`: EmendaFormHeader, TabNavigation, EmendaFormActions

**Quem importa EmendaForm:** `App.jsx`

---

### UserContext.jsx
**Importa:**
- `firebase/auth`: onAuthStateChanged
- `firebase/firestore`: doc, getDoc, setDoc
- `../firebase/firebaseConfig`: auth, db

**Quem importa UserContext.jsx:**
- `App.jsx`
- `components/Emendas.jsx`
- `components/Despesas.jsx`
- `components/Dashboard.jsx`
- `components/Administracao.jsx`
- Diversos outros componentes

---

### usePermissions.js
**Importa:**
- `../utils/validators`: validateLocation, normalizeUF, normalizeMunicipio

**Quem importa usePermissions:**
- `components/Dashboard.jsx`
- `hooks/useDashboardData.js`
- Componentes que precisam verificar permissoes

---

### useDashboardData.js
**Importa:**
- `firebase/firestore`: collection, getDocs, query, where
- `../firebase/firebaseConfig`: db
- `../utils/formatters`: parseValorMonetario

**Quem importa useDashboardData:** `components/Dashboard.jsx`

---

## 3. Fluxo de Dados

### Login -> Dashboard

```
1. Login.jsx
   ├── Usuario insere email/senha
   ├── signInWithEmailAndPassword(auth, email, senha)
   ├── buscarDadosUsuario(uid, email)
   │   └── getDoc(doc(db, "usuarios", uid))
   ├── Valida: status === "ativo", municipio/uf para operador
   └── onLoginSuccess(dadosUsuario)

2. App.jsx
   ├── UserContext detecta onAuthStateChanged
   ├── Carrega dados do Firestore (usuarios/{uid})
   ├── Normaliza campos: nome, tipo, municipio, uf
   └── Navigate("/dashboard")

3. Dashboard.jsx
   ├── useUser() -> obtem usuario do contexto
   ├── usePermissions(usuario) -> calcula permissoes
   │   ├── admin: acessoTotal = true
   │   ├── gestor: filtroAplicado + municipio/UF
   │   └── operador: filtroAplicado + municipio/UF
   ├── useDashboardData(user, permissions)
   │   ├── Admin: carregarDadosAdmin() -> todas emendas/despesas
   │   └── Operador/Gestor: carregarDadosOperador() -> filtrado
   └── Renderiza widgets: Execucao, Timeline, Rankings, Alertas
```

---

### Emenda (criar/editar/listar)

```
LISTAR:
1. Emendas.jsx
   ├── useUser() -> dados do usuario
   ├── Query Firestore com filtros (admin ve tudo, outros filtram)
   ├── Mapeia emendas com calculos de execucao
   └── Renderiza EmendasTable + EmendasFilters

CRIAR:
1. Navegacao: /emendas/novo
2. EmendaForm/index.jsx
   ├── useParams() -> id = undefined (novo)
   ├── Estado inicial vazio
   ├── Usuario preenche abas:
   │   ├── DadosBasicos (identificacao, beneficiario)
   │   ├── Cronograma (datas, metas)
   │   └── ClassificacaoTecnica
   └── handleSalvar()
       └── addDoc(collection(db, "emendas"), dados)

EDITAR:
1. Navegacao: /emendas/:id ou /emendas/:id/editar
2. EmendaForm/index.jsx
   ├── useParams() -> { id }
   ├── Carrega: getDoc(doc(db, "emendas", id))
   ├── Popula formulario com dados existentes
   └── handleSalvar()
       └── updateDoc(doc(db, "emendas", id), dados)
```

---

### Despesa (criar/editar/listar)

```
LISTAR (dentro de EmendaForm):
1. EmendaForm -> DespesasTab
   ├── Recebe emendaId via props
   ├── Query: where("emendaId", "==", emendaId)
   └── Renderiza lista de despesas (cards)

CRIAR:
1. DespesasTab ou NovaDespesaTab
   ├── Formulario de despesa (valor, descricao, etc.)
   ├── Validacoes: saldo disponivel, campos obrigatorios
   └── addDoc(collection(db, "despesas"), {
         emendaId,
         municipio,
         uf,
         valor,
         status: "planejada" | "executada",
         ...
       })

EDITAR:
1. DespesaCard -> Acao de editar
   ├── Modal/Form com dados da despesa
   └── updateDoc(doc(db, "despesas", despesaId), dados)

EXECUTAR:
1. DespesaCardPlanejada -> Botao "Executar"
2. ExecutarDespesaModal
   ├── Preenche dados de execucao (nota fiscal, etc.)
   └── updateDoc -> status: "executada"
```

---

## 4. Hooks e Contexts

### Contexto

| Context | Arquivo | Onde e usado |
|---------|---------|--------------|
| `UserContext` | `src/context/UserContext.jsx` | App.jsx (Provider), Dashboard, Emendas, Despesas, Administracao, EmendaForm |
| `NavigationProtectionContext` | `src/App.jsx` (inline) | App.jsx, Sidebar, formularios |
| `ToastContext` | `src/components/Toast.jsx` | App.jsx (Provider), componentes com notificacoes |

---

### Hooks Customizados

| Hook | Arquivo | Onde e usado |
|------|---------|--------------|
| `useDashboardData` | `src/hooks/useDashboardData.js` | Dashboard.jsx |
| `usePermissions` | `src/hooks/usePermissions.js` | Dashboard.jsx, Emendas.jsx, EmendaForm, DespesasTab |
| `useDespesasData` | `src/hooks/useDespesasData.js` | Componentes de despesas |
| `useDespesasCalculos` | `src/hooks/useDespesasCalculos.js` | DespesasTab, calculos financeiros |
| `useEmendaFormData` | `src/hooks/useEmendaFormData.js` | EmendaForm/index.jsx |
| `useEmendaFormNavigation` | `src/hooks/useEmendaFormNavigation.js` | EmendaForm (navegacao entre abas) |
| `useEmendaDespesa` | `src/hooks/useEmendaDespesa.js` | Operacoes CRUD emenda-despesa |
| `useNavigationProtection` | `src/hooks/useNavigationProtection.js` | App.jsx, formularios |
| `useRelatoriosData` | `src/hooks/useRelatoriosData.js` | Relatorios.jsx |
| `useValidation` | `src/hooks/useValidation.js` | Formularios em geral |
| `usePagination` | `src/hooks/usePagination.js` | Tabelas paginadas |
| `usePageTitle` | `src/hooks/usePageTitle.js` | Componentes de pagina |
| `useVersion` | `src/hooks/useVersion.js` | App.jsx, Sidebar |

---

## Tipos de Usuario e Permissoes

| Tipo | Acesso | Filtro Geografico | Pode Deletar Emenda | Pode Gerenciar Usuarios |
|------|--------|-------------------|---------------------|-------------------------|
| `admin` | Total | Nenhum | Sim | Sim |
| `gestor` | Municipio/UF | Sim | Sim | Nao |
| `operador` | Municipio/UF | Sim | Nao | Nao |

---

## Colecoes Firebase

| Colecao | Campos principais |
|---------|-------------------|
| `usuarios` | uid, email, nome, tipo, municipio, uf, status, superAdmin |
| `emendas` | id, numero, autor, municipio, uf, valor, dataValidade, status |
| `despesas` | id, emendaId, municipio, uf, valor, status, descricao, dataExecucao |

---

## Regras de Desenvolvimento

### SEMPRE
- Validar dados com `src/utils/validators.js`
- Usar `src/utils/formatters.js` para valores monetarios
- Testar como Admin E como Operador
- Preservar codigo funcional - mudancas cirurgicas

### NUNCA
- Reescrever codigo funcional sem necessidade
- Misturar strings e numeros em calculos monetarios
- Salvar dados sem validacao previa
- Commitar arquivos `.env`

## Dicas
- Despesas PLANEJADA nao consomem saldo
- Despesas EXECUTADA tem 33+ campos obrigatorios
- CNPJ usa lookup automatico (ReceitaWS/BrasilAPI)
- Valores em BRL: sempre usar formatters

---

## Comandos Claude Disponiveis

Comandos customizados em `.claude/commands/`:

| Comando | Funcao |
|---------|--------|
| `@estrutura.md` | Gera mapa completo do projeto |
| `@audit.md` | Auditoria completa do sistema |
| `@fix.md` | Corrige problemas identificados |
| `@review.md` | Review de codigo |
| `@check-bugs.md` | Busca bugs potenciais |
| `@check-env.md` | Verifica variaveis de ambiente |
| `@firebase-check.md` | Status do Firebase |

---

## Firebase MCP Server

Servidor MCP para operacoes diretas no Firestore.

**Localizacao:** `firebase-mcp-server/`

**Verificar config:** `bash firebase-mcp-server/check-config.sh`

**Ambientes:**
- DEV: Desenvolvimento/testes
- PROD: Producao

---

## Historico de Sessao (27/12/2025)

### Tarefas Realizadas
1. Mapeamento completo da estrutura do projeto
2. Auditoria de seguranca
3. Correcoes de seguranca:
   - Removido log de senha temporaria em `userService.js`
   - Removido log de token em `ExecucaoOrcamentaria.jsx`
   - Deletado arquivo duplicado `SaldoNaturezaWidget (copy).jsx`
4. Configuracao do Firebase MCP Server
5. Criacao de comandos Claude customizados

### Issues Conhecidas
- 6-8 componentes potencialmente orfaos (debug/test)
- Alguns formularios nao usam `validators.js`
- ~21% dos useEffects tem cleanup

### Proximos Passos Sugeridos
- Revisar componentes orfaos
- Adicionar validadores nos formularios faltantes
- Verificar useEffects que precisam de cleanup
