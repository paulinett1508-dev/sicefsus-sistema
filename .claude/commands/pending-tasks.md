# Tarefas Pendentes para Próxima Sessão

## Concluído - Auditoria do Sistema (2026-01-07)

### Auditoria do Sistema - Firebase Dev/Prod

**Checklist da auditoria:**
- [x] Listar todas as coleções em DEV e PROD
- [x] Comparar estrutura entre ambientes
- [x] Identificar documentos órfãos (despesas sem emenda válida)
- [x] Verificar usuários com claims desatualizados
- [x] Buscar inconsistências de dados (valores, status)
- [x] Identificar queries sem tratamento de erro no código
- [x] Verificar listeners sem cleanup

---

## Resultados da Auditoria

### 1. Configuração MCP Firebase
| Item | Status |
|------|--------|
| Arquivos e estrutura | OK |
| Build (dist/) | OK |
| Credenciais DEV | Configurado |
| Credenciais PROD | Configurado |
| Claude config | OK |

### 2. Coleções Firebase Mapeadas (7 coleções)

| Coleção | Uso | Operações |
|---------|-----|-----------|
| `usuarios` | Dados de usuários | CRUD completo |
| `emendas` | Emendas parlamentares | CRUD completo |
| `despesas` | Despesas das emendas | CRUD completo |
| `logs` | Auditoria | CREATE + READ |
| `workflow` | Estado de transições | CRUD |
| `backups` | Backups do sistema | CRUD |
| `auditLogs` | Logs (dev/backup) | READ |

### 3. Queries sem Error Handling (MCP Server)

8 pontos identificados no código do MCP server:

| Severidade | Arquivo | Operação |
|------------|---------|----------|
| ALTA | firebase.ts:108 | `count().get()` |
| ALTA | firebase.ts:158 | `getDocs` (full export) |
| ALTA | tools/index.ts:463 | `where().get()` |
| ALTA | tools/index.ts:399 | `writeFileSync()` |
| MÉDIA | firebase.ts:99 | `listCollections()` |
| MÉDIA | firebase.ts:121 | `getDocs` (limit) |
| MÉDIA | firebase.ts:138 | `getDoc` |
| BAIXA | firebase.ts:171 | `getDocs` (limit 1) |

**Nota:** Código do MCP server, não afeta app React principal.

### 4. Listeners Firebase

| Status | Total |
|--------|-------|
| Com cleanup adequado | 3 (75%) |
| Padrão não-React | 1 (25%) |

- `UserContext.jsx:25` - onAuthStateChanged - OK
- `useEmendaDespesa.js:539` - onSnapshot (emendas) - OK
- `useEmendaDespesa.js:568` - onSnapshot (despesas) - OK
- `userService.js:262` - checkAuthState - Padrão Promise (funcional)

### 5. Verificação de Integridade

Ferramenta de diagnóstico já existe em `src/components/dev/tabs/AnalisesTab.jsx`:
- Despesas órfãs (sem emenda válida)
- Emendas sem despesas
- Campos obrigatórios faltando
- Inconsistências financeiras
- Documentos malformados

### 6. Script de Claims

Disponível: `scripts/fix-auth-claims.cjs`
- Comando: `node scripts/fix-auth-claims.cjs`
- Requer: `firebase-migration/prod-credentials.json`

---

## Prioridade Alta

### 1. Corrigir Error Handling no MCP Server
**Prioridade:** Baixa (código dev, não afeta produção)

Adicionar try/catch nos 8 pontos identificados acima.

---

## Prioridade Média

### 1. Rodar Diagnóstico de Integridade em PROD
Acessar: Ferramentas Dev > Análises
- Verificar despesas órfãs
- Verificar inconsistências financeiras

### 2. Atualizar Claims de Usuários (se necessário)
Rodar script após verificar quais usuários precisam de atualização.

---

## Anotações
- Data de criação: 2026-01-06
- Auditoria concluída: 2026-01-07
- Última sessão: Auditoria completa do sistema Firebase
