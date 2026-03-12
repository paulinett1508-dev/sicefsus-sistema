# Guia de Commands e Skills — SICEFSUS

Atualizado em 12/03/2026. Conteudo do agnostic-core integrado.

---

## Commands vs Skills

### Commands (`.claude/commands/`)
Tarefas que voce dispara manualmente com `/comando`.

### Skills (`.claude/skills/`)
Competencias que o agente usa automaticamente quando relevante.

---

## Commands Disponiveis (6)

| Comando | Funcao |
|---------|--------|
| `/security-review` | Auditoria de seguranca do diff do branch atual |
| `/pending-tasks` | Tarefas pendentes para proxima sessao |
| `/corrigir-claims-usuarios-firebase` | Atualizar custom claims no Firebase Auth |
| `/brainstorm` | Decisao estruturada em 3 passos |
| `/deploy-checklist` | Checklist de deploy (pre-flight, pos-deploy, rollback) |
| `/create-feature` | Workflow completo para criar features (4 fases) |

---

## Skills Disponiveis (27)

### Framework de Desenvolvimento (4)

| Skill | Funcao |
|-------|--------|
| `PRD-GENERATOR` | Sessao 1: Pesquisa codebase/docs → gera PRD |
| `SPEC-GENERATOR` | Sessao 2: Transforma PRD em especificacao tecnica |
| `CODE-IMPLEMENTER` | Sessao 3: Implementa codigo a partir da SPEC |
| `ANTI-PATTERNS-CHECKER` | Checkpoint de qualidade em todas as fases |

### Auditoria e Analise (9)

| Skill | Funcao |
|-------|--------|
| `auditoria-design-ui-ux` | Visuais, acessibilidade, design system, Quality Gates |
| `auditoria-firebase` | Queries, listeners, regras de seguranca |
| `auditoria-sistema` | Estrutura, codigo morto, consistencia |
| `code-review` | Revisao com prefixos BLOCKER/SUGESTAO/NITPICK |
| `detectar-hardcodes` | Valores hardcoded + auditoria 4 passos |
| `detector-bugs-react-async` | Bugs em hooks, async/await, Firebase |
| `mapear-arquitetura` | Estrutura, dependencias, fluxos de dados |
| `resolver-problema` | Diagnostico com 5 Whys + anti-patterns |
| `code-inspector-sparc` | Auditoria SPARC (Security, Performance, Architecture, Reliability, Code) |

### Frontend e Performance (4)

| Skill | Funcao |
|-------|--------|
| `react-performance` | 58 regras de otimizacao React |
| `css-governance` | Checkpoint anti-Frankenstein CSS |
| `accessibility-checklist` | WCAG 2.1 AA completo |
| `tailwind-patterns` | Padroes Tailwind (responsivo, dark mode, layout) |

### Seguranca (1)

| Skill | Funcao |
|-------|--------|
| `owasp-checklist` | OWASP Top 10 2021 completo |

### Qualidade e Refatoracao (4)

| Skill | Funcao |
|-------|--------|
| `refactoring-seguro` | 7 fases de refatoracao incremental |
| `validation-checklist` | Checklist pre-deploy |
| `pre-implementation` | 5 perguntas antes de codar (YAGNI, DRY, SRP) |
| `debugging-sistematico` | 4 fases: Reproduzir → Isolar → Entender → Corrigir |

### Workflow e Gestao (3)

| Skill | Funcao |
|-------|--------|
| `context-management` | Gestao de contexto AI — pausar, handover |
| `context-audit` | Auditoria de tokens — reduzir desperdicio |
| `goal-backward-planning` | Planejamento goal-backward — waves, checkpoints |

### Testing (1)

| Skill | Funcao |
|-------|--------|
| `testing-guide` | Unit, integration, E2E, TDD |

### Firebase (1)

| Skill | Funcao |
|-------|--------|
| `gerenciar-ambientes-firebase` | Verificar/comparar ambientes dev/prod |

---

## Quando Usar

```
FEATURE NOVA (grande):
  /brainstorm → PRD-GENERATOR → SPEC-GENERATOR → CODE-IMPLEMENTER
  (cada fase em sessao separada)

FEATURE NOVA (rapida):
  /create-feature → pre-implementation → implementar

BEFORE DEPLOY:
  /deploy-checklist → validation-checklist → /security-review

CODE REVIEW:
  code-review → code-inspector-sparc → react-performance

DEBUGGING:
  resolver-problema → debugging-sistematico → testing-guide

REFATORACAO:
  refactoring-seguro → pre-implementation → ANTI-PATTERNS-CHECKER

AUDITORIA COMPLETA:
  auditoria-sistema → auditoria-firebase → auditoria-design-ui-ux
```
