# PRD-001: Sistema de Permissões Granulares

**Data:** 18/01/2026
**Autor:** Claude Code
**Versão:** 1.0
**Status:** Aguardando Aprovação

---

## Objetivo

Implementar sistema robusto de permissões RBAC (Role-Based Access Control) que:
1. Diferencie claramente os 4 perfis de usuário (SuperAdmin, Admin, Gestor, Operador)
2. Aplique filtros de município onde necessário
3. Atualize Firestore Rules para validação server-side consistente
4. Mantenha compatibilidade retroativa com dados existentes
5. Use Firebase Custom Claims para melhor performance

---

## Pesquisa Realizada

### 1. Busca no Codebase

**Arquivos principais analisados:**
- `src/context/UserContext.jsx` - Contexto de autenticação (184 linhas)
- `src/hooks/usePermissions.js` - Hook de permissões (355 linhas)
- `src/services/userService.js` - CRUD de usuários (369 linhas)
- `src/utils/validators.js` - Validações centralizadas (828 linhas)
- `firestore.rules` - Regras de segurança (191 linhas)
- `src/components/Sidebar.jsx` - Menu lateral por perfil (684 linhas)
- `src/components/Administracao.jsx` - Painel administrativo (718 linhas)

**Padrão arquitetural identificado:**
- Validação client-side: `usePermissions.js` calcula permissões no frontend
- Validação server-side: `firestore.rules` valida operações no Firestore
- Contexto: `UserContext.jsx` fornece dados do usuário autenticado

### 2. Gaps e Inconsistências Identificados

| # | Problema | Localização | Impacto |
|---|----------|-------------|---------|
| 1 | `validateUserTipo` só aceita `["admin", "operador"]` - GESTOR ausente | `validators.js:163` | Alto - Gestor não é validado |
| 2 | `validateUserRole` aceita `["admin", "user", "operador"]` - inconsistente | `validators.js:183` | Médio - Duplicidade de campos |
| 3 | Operador tem `podeDeletarDespesas: true` (deveria ser false) | `usePermissions.js:115` | Alto - Violação de requisito |
| 4 | Operador pode criar emendas/naturezas (deveria ser bloqueado) | `firestore.rules:75,140` | Alto - Violação de requisito |
| 5 | Firestore Rules não filtram despesas por localização na leitura | `firestore.rules:100-102` | Alto - Vazamento de dados |
| 6 | SuperAdmin não existe nas Firestore Rules | `firestore.rules` | Médio - Sem diferenciação |
| 7 | Campos `role` e `tipo` usados simultaneamente | `userService.js:157-166` | Médio - Confusão de dados |
| 8 | Custom Claims do Firebase não são utilizados | N/A | Médio - Performance |

### 3. Soluções Externas Consultadas

**Documentação oficial Firebase:**
- [Firebase Security Rules](https://firebase.google.com/docs/rules) - Estrutura de regras
- [Role-Based Access Control](https://firebase.google.com/docs/firestore/solutions/role-based-access) - Padrão RBAC recomendado
- [Custom Claims](https://firebase.google.com/docs/rules/rules-and-auth) - Autenticação com claims

**Best Practices identificadas:**
- Usar Custom Claims para roles (validação mais rápida, sem leitura extra do Firestore)
- Manter validação redundante: client-side + server-side
- Usar funções auxiliares nas Rules para DRY
- Periodicamente revisar e testar regras de segurança

---

## Arquitetura Proposta

### Matriz de Permissões (Requisito)

| Ação | SuperAdmin | Admin | Gestor | Operador |
|------|------------|-------|--------|----------|
| **Acesso total sem filtro** | Sim | Sim | Não | Não |
| **Acesso total no município** | N/A | N/A | Sim | Sim |
| **Criar emendas** | Sim | Sim | Sim | **Não** |
| **Editar emendas** | Sim | Sim | Sim (seu município) | Sim (seu município) |
| **Deletar emendas** | Sim | Sim | Sim (seu município) | **Não** |
| **Criar naturezas** | Sim | Sim | Sim | **Não** |
| **Criar despesas** | Sim | Sim | Sim | Sim |
| **Editar despesas** | Sim | Sim | Sim (seu município) | Sim (seu município) |
| **Deletar despesas** | Sim | Sim | Sim (seu município) | **Não** |
| **Gerenciar usuários** | Sim | Sim | **Não** | **Não** |
| **Ferramentas Dev** | Sim | **Não** | **Não** | **Não** |
| **Acesso DEV/PROD** | Ambos | Definido | Definido | Definido |

### Reutilizar (Existing Code)

1. **`src/hooks/usePermissions.js`** - Estender com novas flags de permissão
   - Motivo: Hook já centraliza lógica de permissões, apenas ajustar valores

2. **`firestore.rules`** - Ajustar regras existentes
   - Motivo: Estrutura já existe, apenas corrigir inconsistências

3. **`src/context/UserContext.jsx`** - Já tem `isSuperAdmin`
   - Motivo: Apenas garantir propagação correta

### Criar (New Files)

1. **`scripts/sync-auth-claims.cjs`** (~100 linhas) - Script de sincronização
   - Responsabilidade: Sincronizar custom claims do Firebase Auth com dados do Firestore
   - Exports: função `syncUserClaims(userId)`

2. **`src/config/permissions.js`** (~80 linhas) - Constantes de permissão centralizadas
   - Responsabilidade: Single source of truth para permissões por perfil
   - Exports: `PERMISSIONS`, `ROLES`, `getPermissionsByRole()`

### Modificar (Changes to Existing)

1. **`src/hooks/usePermissions.js`** (~30 linhas alteradas)
   - Adicionar flags: `podeCriarEmendas`, `podeCriarNaturezas`, `podeDeletarDespesas`
   - Corrigir valores para OPERADOR (todos `false` para ações de escrita/delete)
   - Usar constantes de `permissions.js`

2. **`src/utils/validators.js`** (~10 linhas alteradas)
   - Linha 163: Adicionar "gestor" em `validateUserTipo`
   - Linha 183: Sincronizar `validateUserRole` com `validateUserTipo`

3. **`firestore.rules`** (~40 linhas alteradas)
   - Corrigir regras de emendas: bloquear CREATE para operador
   - Corrigir regras de naturezas: bloquear CREATE para operador
   - Corrigir regras de despesas: bloquear DELETE para operador
   - Adicionar filtro de localização na leitura de despesas

4. **`src/services/userService.js`** (~20 linhas alteradas)
   - Padronizar para usar apenas campo `tipo` (remover `role`)
   - Adicionar sincronização de custom claims na criação/atualização

5. **`src/components/Administracao.jsx`** (~5 linhas alteradas)
   - Verificar se usuário é admin antes de permitir criar usuários

---

## Plano de Implementação

### Fase 1: Padronização de Campos (Baixo Risco)

```
1. Criar src/config/permissions.js
2. Atualizar src/utils/validators.js (adicionar "gestor")
3. Atualizar src/services/userService.js (padronizar "tipo")
```

### Fase 2: Corrigir Permissões Client-Side (Médio Risco)

```
4. Atualizar src/hooks/usePermissions.js
   - Operador: podeCriarEmendas=false, podeCriarNaturezas=false, podeDeletarDespesas=false
   - Gestor: podeDeletarDespesas=true, podeGerenciarUsuarios=false
5. Atualizar componentes que usam permissões
```

### Fase 3: Corrigir Firestore Rules (Alto Risco)

```
6. Atualizar firestore.rules (DEV primeiro)
7. Testar exaustivamente em DEV
8. Deploy em PROD
```

### Fase 4: Custom Claims (Opcional/Melhoria)

```
9. Criar scripts/sync-auth-claims.cjs
10. Atualizar userService.js para usar claims
11. Migrar regras para usar request.auth.token
```

---

## Critérios de Aceitação

### Funcionalidade

- [ ] SuperAdmin acessa ferramentas dev, admin não
- [ ] Admin pode criar usuários, gestor/operador não
- [ ] Gestor pode deletar emendas/despesas do seu município
- [ ] Operador pode APENAS criar despesas e editar emendas do seu município
- [ ] Operador NÃO pode criar emendas, naturezas ou deletar nada
- [ ] Filtro de localização funciona para gestor/operador
- [ ] Validação server-side (Rules) consistente com client-side (hooks)

### Qualidade

- [ ] Código segue padrões do projeto (GUIA_DESENVOLVEDOR.md)
- [ ] Sem duplicação de código (DRY)
- [ ] Arquivos respeitam limite de 200 linhas
- [ ] Single Responsibility por arquivo

### Segurança

- [ ] Nenhum usuário consegue acessar dados fora do seu escopo
- [ ] Firestore Rules bloqueiam operações não permitidas
- [ ] Testes de penetração básicos passam (tentar operações proibidas)

### Retrocompatibilidade

- [ ] Usuários existentes continuam funcionando
- [ ] Dados existentes não são afetados
- [ ] Nenhum logout forçado durante migração

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Firestore Rules bloqueiam operações legítimas | Alta | Alto | Testar exaustivamente em DEV antes de PROD |
| Usuários operadores perdem funções que usavam | Média | Médio | Comunicar mudanças, período de transição |
| Dados inconsistentes (role vs tipo) | Média | Baixo | Script de migração para padronizar |
| Performance degradada por leituras extras | Baixa | Médio | Implementar custom claims na Fase 4 |

---

## Estimativa de Complexidade

- **Complexidade Técnica:** 3/5 (principalmente pela criticidade das Rules)
- **Arquivos Afetados:** 7 arquivos principais + firestore.rules em 2 ambientes
- **Linhas de Código:** ~200 linhas novas/alteradas
- **Fases:** 4 fases incrementais

---

## Referências

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Role-Based Access Control](https://firebase.google.com/docs/firestore/solutions/role-based-access)
- [Firebase Custom Claims](https://firebase.google.com/docs/rules/rules-and-auth)
- [Best Practices RBAC](https://bootstrapped.app/guide/how-to-secure-firebase-firestore-with-role-based-access-control-rbac)

---

## Aprovação

**Próximo passo:** Abra NOVA SESSÃO no Claude Code e execute:

```
"Gere spec de /home/runner/workspace/docs/prd/PRD-001-permissoes-granulares.md"
```

**IMPORTANTE:** Não continue nesta sessão. Abra nova sessão para manter contexto limpo.
