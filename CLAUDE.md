# SICEFSUS - Sistema de Gestao de Emendas Parlamentares

## Visao Geral
Sistema brasileiro para gerenciamento de emendas parlamentares e despesas de saude.
- **Stack:** React + Firebase (Firestore + Auth)
- **Deploy:** Replit
- **Usuarios:** Admin (ve tudo), Gestor (municipio), Operador (municipio)
- **Design System:** v2.0 (Inter font, Tailwind-based colors)

## Ultima Atualizacao - 18/01/2026

## Firebase MCP Server (IMPORTANTE - Ler ao iniciar sessao)

O projeto possui um servidor MCP configurado para acesso direto ao Firestore.
**O MCP ja esta configurado e deve conectar automaticamente.**

### Verificacao Rapida
Ao iniciar uma sessao, use `mcp__firebase__firebase_status` para verificar conexao.
Se aparecer `devConnected: true` e `prodConnected: true`, esta tudo OK.

### Se o MCP nao conectar automaticamente:
1. Verificar se o processo esta rodando: `ps aux | grep firebase-mcp`
2. Se nao estiver, matar e deixar reiniciar: `pkill -f "firebase-mcp-server/dist/index.js"`
3. Aguardar 2 segundos e testar novamente com `firebase_status`

### Tools disponiveis:
| Tool | Descricao |
|------|-----------|
| `firebase_status` | Status das conexoes DEV/PROD |
| `firebase_switch` | Trocar ambiente (dev/prod) |
| `firebase_query` | Consultar documentos de colecao |
| `firebase_get_document` | Buscar documento por ID |
| `firebase_search` | Buscar por campo/valor |
| `firebase_compare` | Comparar DEV vs PROD |
| `firebase_backup` | Exportar colecao para JSON |
| `firebase_collections` | Listar colecoes disponiveis |

### Configuracao:
- **Localizacao:** `firebase-mcp-server/`
- **Credenciais:** `.claude/settings.json` (env) + `firebase-mcp-server/.env`
- **Build:** `npm run build` no diretorio do MCP
- **Ambientes:** DEV (emendas-parlamentares-60dbd) e PROD (emendas-parlamentares-prod)

---

## StatusLine (Barra de Status)

O projeto possui um statusline customizado que exibe informacoes uteis durante a sessao.

### O que exibe:
```
[Opus 4.5 | 31% | 63k/200k | 1h0m | +35/-29 | workspace/main | DEV]
```

| Campo | Cor | Descricao |
|-------|-----|-----------|
| **Modelo** | Magenta | Modelo Claude em uso (ex: Opus 4.5) |
| **Memoria %** | Verde/Amarelo/Vermelho | Porcentagem do contexto usado |
| **Tokens** | Ciano | Tokens totais (input+output) / limite |
| **Tempo** | Verde/Amarelo/Vermelho | Duracao da sessao |
| **Arquivos** | Branco | Linhas adicionadas/removidas (+/-) |
| **Diretorio/Branch** | Azul/Verde | Raiz do projeto e branch git |
| **Ambiente** | Amarelo (DEV) / Vermelho (PROD) | Ambiente Firebase ativo |

### Arquivos:
- **Script:** `.claude/statusline.sh` (commitado no git)
- **Config:** `.claude/settings.json` (chave `statusLine` - nao commitado)
- **Setup:** `.claude/setup-statusline.sh` (para configurar na primeira sessao)

### Configuracao na Primeira Sessao:
Se o statusline nao aparecer automaticamente, adicione ao `.claude/settings.json`:
```json
{
  "statusLine": {
    "type": "command",
    "command": "bash /home/runner/workspace/.claude/statusline.sh"
  },
  // ... resto das configuracoes
}
```

### Alertas de Memoria (quando fazer /compact):
| Uso | Cor | Alerta |
|-----|-----|--------|
| < 50% | Verde | Nenhum |
| 50-75% | Amarelo | `!` aparece |
| > 75% | Vermelho | `/compact` aparece |

### Cores do Tempo:
- Verde: < 30 minutos
- Amarelo: 30-60 minutos
- Vermelho: > 60 minutos

---

**Sistema de Naturezas Unificado (Envelopes Orcamentarios):**
- Secao "Despesas Executadas" removida - tudo dentro de "Execucao Orcamentaria"
- Naturezas virtuais criadas automaticamente de despesas existentes
- Botao "Regularizar" para definir valor alocado
- Despesas agrupadas por codigo de natureza (ex: 339030)
- Ver `src/components/natureza/` para componentes

**Campos de Saldo (atualizado 13/01/2026):**

| Nivel | Campo | Formula | Uso |
|-------|-------|---------|-----|
| **Emenda** | `saldoParaNaturezas` | `valor - valorAlocado` | Quanto pode alocar em NOVAS naturezas |
| **Emenda** | `saldoNaoExecutado` | `valor - valorExecutado` | Quanto ainda nao foi gasto |
| **Emenda** | `saldoLivre` | (alias) | Compatibilidade - igual a saldoParaNaturezas |
| **Emenda** | `saldoDisponivel` | (alias) | Compatibilidade - igual a saldoNaoExecutado |
| **Natureza** | `saldoDisponivel` | `valorAlocado - valorExecutado` | Quanto pode gastar em despesas DENTRO dela |

Exemplo pratico:
```
EMENDA: R$ 210,00
├── valorAlocado: R$ 150,00 (natureza)
├── valorExecutado: R$ 150,00 (despesas)
├── saldoParaNaturezas: R$ 60,00 (pode criar mais naturezas)
└── saldoNaoExecutado: R$ 60,00 (ainda nao gastou)

NATUREZA 339039:
├── valorAlocado: R$ 150,00
├── valorExecutado: R$ 150,00
└── saldoDisponivel: R$ 0,00 (esgotada)
```

**IMPORTANTE - Logica de Validacao de Despesas:**
- Ao criar despesa DENTRO de uma natureza: valida contra `natureza.saldoDisponivel`
- Se a natureza esta esgotada (saldoDisponivel <= 0): botao "Nova Despesa" mostra alerta
- O `saldoParaNaturezas` da emenda NAO pode ser usado diretamente para despesas
- Fluxo obrigatorio: Emenda -> Alocar em Natureza -> Criar Despesa na Natureza

**Transformacao Visual (27/12/2025):**
- Paleta de cores atualizada para estilo moderno (Tailwind)
- Fonte Inter adicionada
- Novas classes CSS utilitarias
- Emojis substituidos por Material Symbols Outlined icons
- Ver [.claude/docs/DESIGN_SYSTEM.md](.claude/docs/DESIGN_SYSTEM.md) para detalhes completos

**Icones - Material Symbols:**
- Usar `<span className="material-symbols-outlined">icon_name</span>`
- Tamanhos comuns: 12-16px (inline), 18-24px (titulos), 48px (empty states)
- Sempre incluir `verticalAlign: "middle"` para alinhamento

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
│   ├── Sobre.jsx                    # Pagina Sobre o sistema
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
│   ├── natureza/                    # 🆕 Sistema de envelopes orcamentarios
│   │   ├── NaturezasList.jsx        # Lista de naturezas (reais + virtuais)
│   │   ├── NaturezaCard.jsx         # Card expansivel de natureza
│   │   └── NaturezaForm.jsx         # Formulario criar/editar natureza
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
| `useNaturezasData` | `src/hooks/useNaturezasData.js` | CRUD de naturezas (envelopes orcamentarios) |
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
| `emendas` | id, numero, autor, municipio, uf, valor, valorAlocado, valorExecutado, saldoParaNaturezas, saldoNaoExecutado, dataValidade, status |
| `despesas` | id, emendaId, naturezaId, municipio, uf, valor, status, statusPagamento |
| `naturezas` | id, emendaId, codigo, descricao, valorAlocado, valorExecutado, saldoDisponivel, criadoEm |

---

## Regras de Desenvolvimento

### SEMPRE
- Validar dados com `src/utils/validators.js`
- Usar `src/utils/formatters.js` para valores monetarios
- Testar como Admin E como Operador
- Preservar codigo funcional - mudancas cirurgicas
- Atualizar `STATE.md` ao final de cada sessao de desenvolvimento

### NUNCA
- Reescrever codigo funcional sem necessidade
- Misturar strings e numeros em calculos monetarios
- Salvar dados sem validacao previa
- Commitar arquivos `.env`

### Padrao de Commits por Fase

Ao trabalhar com o framework PRD → SPEC → CODE, usar prefixos rastreavéis:

```
feat(PRD-XXX): descricao da pesquisa/requisito
spec(SPEC-XXX): descricao da especificacao tecnica
impl(SPEC-XXX): implementacao do componente/feature
fix(SPEC-XXX): correcao relacionada a implementacao
```

Para commits fora do framework de fases:
```
feat: nova funcionalidade
fix: correcao de bug
refactor: refatoracao sem mudanca de comportamento
docs: atualizacao de documentacao
chore: manutencao (scripts, config, deps)
```

Cada commit deve ser atomico (uma mudanca logica por commit) e rastreavel a fase de origem quando aplicavel.

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
| `@mapear-arquitetura-completa.md` | Gera mapa completo do projeto (componentes, hooks, fluxos) |
| `@auditoria-sistema-completa.md` | Auditoria geral (estrutura, Firebase, seguranca, consistencia) |
| `@auditoria-design-ui-ux.md` | Auditoria visual (CSS, icones, responsividade, acessibilidade) |
| `@auditoria-queries-firebase.md` | Auditoria Firebase (queries, listeners, escritas, regras) |
| `@resolver-problema-guiado.md` | Corrige problemas de forma estruturada (diagnostico + solucao) |
| `@revisar-codigo-qualidade.md` | Code review (limpeza, performance, duplicacao) |
| `@detector-bugs-async-react.md` | Busca bugs potenciais (hooks, async/await, race conditions) |
| `@verificar-ambientes-dev-prod.md` | Verifica configuracao de ambientes (.env dev/prod) |
| `@buscar-valores-hardcoded.md` | Identifica valores hardcoded (URLs, credenciais, textos) |
| `@gerenciar-ambiente-firebase.md` | Gerencia ambientes Firebase (verificar, listar, comparar) |
| `@corrigir-claims-usuarios-firebase.md` | Atualiza custom claims no Firebase Auth |
| `@gerar-documentacao-handover.md` | Gera documentacao completa do sistema |
| `@migrar-acoes-para-despesas.md` | Migra acoesServicos para colecao despesas (PLANEJADA) |
| `@tarefas-pendentes-dark-mode.md` | Tarefas pendentes P1/P2 de dark mode (proxima sessao) |

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
6. **Substituicao de emojis por Material Symbols icons:**
   - Componentes principais: Toast, ConfirmationModal, UserForm
   - Tabelas: EmendasTable, DespesasTable, UsersTable
   - Filtros: EmendasFilters, DespesasFilters
   - Widgets: SaldoEmendaWidget, SaldoNaturezaWidget, FluxoEmenda
   - Formularios: EmendaForm, DespesaForm components
   - Paginas: Sobre, Dashboard, Emendas, Login
   - Admin: AdminHeader, LogsSection, EmendaDetail components

### Padrao de Icones Material Symbols
```jsx
// Inline com texto
<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>icon_name</span>

// Em titulos
<span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: "middle", marginRight: 6 }}>icon_name</span>

// Empty states
<span className="material-symbols-outlined" style={{ fontSize: 48 }}>icon_name</span>
```

### Icones Comuns Utilizados
| Emoji | Material Symbol |
|-------|-----------------|
| check/success | `check_circle` |
| error/cancel | `cancel` |
| warning | `warning` |
| info | `info` |
| edit | `edit` |
| delete | `delete` |
| search | `search` |
| payments/money | `payments` |
| description/document | `description` |
| analytics/chart | `analytics` |
| location | `location_on` |
| calendar | `calendar_today` |
| person | `person` |
| settings | `settings` |

### Issues Conhecidas
- Alguns componentes de debug ainda tem emojis (baixa prioridade)
- ~21% dos useEffects tem cleanup

### Proximos Passos Sugeridos
- Verificar useEffects que precisam de cleanup
- Completar substituicao de emojis em componentes dev/debug

---

## Framework de Desenvolvimento com Skills (IMPORTANTE)

### Conceito

As skills em `.claude/skills/` sao um **FRAMEWORK DE TRABALHO** reutilizavel, nao codigo especifico.
O objetivo e separar o desenvolvimento em **3 sessoes isoladas** para preservar a janela de contexto (200k tokens).

### Fluxo de Trabalho (para QUALQUER feature)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SESSAO 1      │     │   SESSAO 2      │     │   SESSAO 3      │
│                 │     │                 │     │                 │
│  PRD-GENERATOR  │────▶│  SPEC-GENERATOR │────▶│  CODE-IMPLEMENT │
│   (pesquisa)    │     │   (projeto)     │     │   (codigo)      │
│                 │     │                 │     │                 │
│   ~40k tokens   │     │   ~50k tokens   │     │   ~60k tokens   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
     PRD-XXX.md              SPEC-XXX.md            Codigo Final
```

**IMPORTANTE:** Cada sessao = terminal/conversa SEPARADA. Nao continuar na mesma sessao.

### As 4 Skills Principais

| Skill | Arquivo | Funcao |
|-------|---------|--------|
| **PRD-GENERATOR** | `PRD-GENERATOR.md` | Pesquisa codebase + docs + bibliotecas → gera PRD |
| **SPEC-GENERATOR** | `SPEC-GENERATOR.md` | Le PRD → gera especificacao tecnica detalhada |
| **CODE-IMPLEMENTER** | `CODE-IMPLEMENTER.md` | Le SPEC → implementa codigo final |
| **ANTI-PATTERNS-CHECKER** | `ANTI-PATTERNS-CHECKER.md` | Valida qualidade em TODAS as fases |

### ANTI-PATTERNS-CHECKER (Checkpoint de Qualidade)

**NAO e uma sessao separada.** E um checkpoint usado DENTRO de cada fase:

```
SESSAO 1 (PRD)
    ├── pesquisa...
    ├── escreve PRD...
    ├── ⚠️ ANTI-PATTERNS CHECK  ◀── valida ANTES de salvar
    └── salva PRD-X.md

SESSAO 2 (SPEC)
    ├── le PRD...
    ├── projeta arquitetura...
    ├── ⚠️ ANTI-PATTERNS CHECK  ◀── valida ANTES de salvar
    └── salva SPEC-X.md

SESSAO 3 (CODE)
    ├── le SPEC...
    ├── implementa...
    ├── ⚠️ ANTI-PATTERNS CHECK  ◀── valida ANTES de entregar
    └── codigo final
```

**5 validacoes em cada checkpoint:**
1. Overengineering? (complexidade desnecessaria)
2. Reinventando roda? (ja existe solucao)
3. Docs consultados? (documentacao lida)
4. Codigo duplicado? (DRY violado)
5. Arquivos >200 linhas? (monolitico)

Se falhar qualquer validacao → corrige → valida novamente → so entao avanca.

### Como Usar

```
Problema novo     → Abrir NOVA sessao + usar PRD-GENERATOR    → PRD.md
PRD aprovado      → Abrir NOVA sessao + usar SPEC-GENERATOR   → SPEC.md
SPEC aprovada     → Abrir NOVA sessao + usar CODE-IMPLEMENTER → Codigo
```

### Beneficios

- **Contexto limpo:** <60k tokens por sessao (nunca "cansa" a IA)
- **Artefatos persistentes:** arquivos .md entre sessoes
- **Processo auditavel:** cada fase tem checkpoint de qualidade
- **Replicavel:** funciona para qualquer problema futuro

### Exemplo de Uso Real

O sistema de permissoes (PRD-001 → SPEC-001 → codigo) foi apenas um **CASO DE USO** do framework.
As skills servem para QUALQUER problema novo.

### Localizacao dos Artefatos

- **Skills:** `.claude/skills/`
- **PRDs gerados:** `docs/prd/PRD-XXX-*.md`
- **SPECs geradas:** `docs/prd/SPEC-XXX-*.md`

---

## Comandos e Skills do Claude Code

### Organizacao (atualizado 18/01/2026)

O projeto usa dois tipos de automacao para o Claude Code:

#### Commands (`.claude/commands/`)
**Tarefas deterministicas e scripts** - acoes concretas que voce dispara manualmente.

| Comando | Descricao |
|---------|-----------|
| `corrigir-claims-usuarios-firebase` | Roda `node scripts/fix-auth-claims.cjs` para atualizar claims |
| `gerar-documentacao-handover` | Roda `node scripts/generateHandover.cjs` |
| `gerenciar-ambiente-firebase` | Verificar/comparar ambientes dev/prod |
| `migrar-acoes-para-despesas` | Migrar acoesServicos para despesas |
| `tarefas-pendentes-dark-mode` | Checklist de tarefas dark mode |
| `verificar-ambientes-dev-prod` | Verificar configuracao de ambientes |

#### Skills (`.claude/skills/`)
**Framework de desenvolvimento + competencias** - metodologia reutilizavel.

**Skills de Framework (desenvolvimento em 3 fases):**

| Skill | Funcao |
|-------|--------|
| `PRD-GENERATOR.md` | Sessao 1: Pesquisa e gera PRD |
| `SPEC-GENERATOR.md` | Sessao 2: Transforma PRD em especificacao tecnica |
| `CODE-IMPLEMENTER.md` | Sessao 3: Implementa codigo a partir da SPEC |
| `ANTI-PATTERNS-CHECKER.md` | Checkpoint de qualidade em todas as fases |

**Skills de Analise (usadas conforme necessidade):**

| Skill | Quando Usar |
|-------|-------------|
| `auditoria-design-ui-ux` | Avaliar aspectos visuais, acessibilidade, design system |
| `auditoria-firebase` | Analisar queries, listeners, regras de seguranca |
| `auditoria-sistema` | Analise holistica: estrutura, codigo morto, consistencia |
| `code-review` | Revisar codigo para qualidade e boas praticas |
| `detectar-hardcodes` | Encontrar valores hardcoded que devem ser configuraveis |
| `detector-bugs-react-async` | Identificar bugs em hooks, async/await, Firebase |
| `mapear-arquitetura` | Documentar estrutura, dependencias, fluxos de dados |
| `resolver-problema` | Diagnosticar e corrigir bugs de forma sistematica |

### Quando Usar Cada Um

```
FRAMEWORK (PRD → SPEC → CODE):
  Para desenvolver features novas ou refatoracoes grandes.
  Cada fase em sessao separada.

COMMAND:
  Para executar uma acao especifica.
  Ex: "rode o comando de handover", "/gerar-documentacao-handover"

SKILL DE ANALISE:
  Para analise ou raciocinio pontual.
  Ex: "revise esse codigo", "encontre bugs nesse componente"
```

---

## Scripts de Manutencao do Banco de Dados

Scripts Node.js para corrigir inconsistencias no Firestore. Localizados em `scripts/`.

**Requisitos:**
- Credenciais de producao em `firebase-migration/prod-credentials.json`
- Node.js com firebase-admin instalado

**Padrao de uso:**
```bash
node scripts/<script>.cjs           # Modo dry-run (apenas diagnostico)
node scripts/<script>.cjs --apply   # Aplicar correcoes
```

### Scripts Disponiveis

| Script | Funcao | Ultima Execucao |
|--------|--------|-----------------|
| `recalcular-valor-executado.cjs` | Recalcula valorExecutado nas emendas baseado na soma das despesas EXECUTADAS | 13/01/2026 - 18 emendas corrigidas |
| `corrigir-municipio-despesas.cjs` | Preenche municipio/uf nas despesas copiando da emenda vinculada | 16/01/2026 - DEV: 61, PROD: 2 |
| `deletar-despesas-orfas.cjs` | Remove despesas cujas emendas foram deletadas | 16/01/2026 - DEV: 24, PROD: 13 |
| `vincular-despesas-naturezas.cjs` | Vincula despesas a naturezas existentes ou cria novas naturezas | 13/01/2026 - 51 despesas vinculadas, 6 naturezas criadas |
| `corrigir-estouro-emendas.cjs` | Ajusta valor das emendas para cobrir despesas executadas (saldo negativo) | 13/01/2026 - 4 emendas corrigidas |
| `fix-saldo-negativo.cjs` | Corrige emendas especificas com saldo negativo (IDs hardcoded) | Script pontual |
| `corrigir-logica-orcamentaria.cjs` | Auto-regulariza naturezas e adiciona novos campos de saldo (saldoParaNaturezas, saldoNaoExecutado) | 13/01/2026 - DEV: 1 nat + 4 emendas, PROD: 11 emendas |

### Detalhes dos Scripts

#### recalcular-valor-executado.cjs
- **Problema:** Emendas com valorExecutado=0 mas com milhoes em despesas executadas
- **Solucao:** Soma todas as despesas com status="EXECUTADA" e atualiza:
  - `valorExecutado`, `saldoDisponivel`, `percentualExecutado`
  - `valorAlocado`, `saldoLivre`, `percentualAlocado`
- **Campos atualizados:** 6 campos por emenda

#### corrigir-municipio-despesas.cjs
- **Problema:** Despesas com municipio vazio ou "N/A"
- **Solucao:** Copia municipio e uf da emenda vinculada
- **Dependencia:** Despesa precisa ter emendaId valido
- **Flags:** `--dev` (banco DEV), `--apply` (executar)

#### deletar-despesas-orfas.cjs
- **Problema:** Despesas vinculadas a emendas que foram deletadas
- **Solucao:** Remove despesas cujo emendaId aponta para emenda inexistente
- **Flags:** `--dev` (banco DEV), `--apply` (executar)
- **Exibe:** Valor total das despesas orfas antes de deletar

#### vincular-despesas-naturezas.cjs
- **Problema:** Despesas sem naturezaId (nao vinculadas a envelopes orcamentarios)
- **Solucao:**
  1. Extrai codigo de natureza do campo `naturezaDespesa` (ex: "339030", "3.3.90.30", "3.3.9.0.30")
  2. Busca natureza existente com mesmo codigo + emendaId
  3. Se nao existir, cria nova natureza
  4. Vincula despesa a natureza
- **Formatos suportados:**
  - `339030` - codigo direto
  - `339030 - DESCRICAO` - codigo com descricao
  - `3.3.90.30` - formato com pontos (4 partes)
  - `3.3.9.0.30` - formato com pontos (5 partes)

#### corrigir-estouro-emendas.cjs
- **Problema:** Emendas com despesas executadas > valor da emenda (saldo negativo)
- **Solucao:** Aumenta `valor` e `valorRecurso` para cobrir o total executado
- **IDs hardcoded:** 4 emendas especificas identificadas na auditoria
- **Campos atualizados:** valor, valorRecurso, valorExecutado, saldoDisponivel, percentualExecutado

#### corrigir-logica-orcamentaria.cjs
- **Problema:** Naturezas com valorAlocado=0 mas valorExecutado>0 (nao regularizadas)
- **Solucao em 2 fases:**
  1. Auto-regulariza naturezas: define valorAlocado = valorExecutado
  2. Recalcula emendas: adiciona novos campos saldoParaNaturezas e saldoNaoExecutado
- **Flags:**
  - `--dev`: usar banco DEV em vez de PROD
  - `--apply`: aplicar correcoes (sem flag = dry-run)
- **Campos adicionados:**
  - `saldoParaNaturezas`: valor - valorAlocado (para criar novas naturezas)
  - `saldoNaoExecutado`: valor - valorExecutado (quanto ainda nao gastou)
  - Mantém aliases: saldoLivre, saldoDisponivel

### Auditoria de Integridade (16/01/2026)

Resultado da auditoria completa:

**PROD:**
| Verificacao | Antes | Depois |
|-------------|-------|--------|
| valorExecutado divergente | 18 emendas | 0 |
| Despesas sem municipio | 8 despesas | 0 |
| Despesas sem naturezaId | 100 despesas | 0 |
| Despesas orfas | 13 (R$ 214k) | 0 |

**DEV:**
| Verificacao | Antes | Depois |
|-------------|-------|--------|
| Despesas sem municipio | 84 despesas | 0 |
| Despesas orfas | 24 | 0 |

**Estado atual:**
| Ambiente | Emendas | Despesas |
|----------|---------|----------|
| PROD | 27 | 124 |
| DEV | 21 | 61 |
