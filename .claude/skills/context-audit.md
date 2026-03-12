# Context Audit — Auditoria de Tokens

Framework para diagnosticar e reduzir consumo de tokens automaticamente
carregados ao iniciar sessoes.

Adaptado do agnostic-core (MIT). Fonte: skills/workflow/context-audit.md

---

## O PROBLEMA

Arquivos de contexto sao carregados automaticamente (CLAUDE.md, hooks, settings).
Sem auditoria, redundancia acumula silenciosamente → sessoes lentas, tokens desperdicados.

---

## PROCESSO DE 3 FASES

### Fase 1 — Diagnostico
- [ ] Inventariar todos os arquivos auto-carregados:
  - CLAUDE.md, STATE.md
  - `.claude/settings.json` (regras)
  - Hooks configurados
- [ ] Contar linhas totais (baseline de custo)
- [ ] Identificar conteudo duplicado entre arquivos

### Fase 2 — Classificacao

Classificar cada bloco de conteudo:

| Tipo | Acao |
|------|------|
| **Instrucoes operacionais** (regras que a IA precisa seguir em toda sessao) | Manter em CLAUDE.md |
| **Referencia detalhada** (consultar sob demanda) | Mover para `.claude/docs/` |
| **Conteudo redundante** (aparece em multiplos arquivos) | Eliminar duplicatas |

### Fase 3 — Reducao
- [ ] CLAUDE.md com maximo ~150 linhas de instrucoes operacionais
- [ ] Documentacao detalhada em arquivos separados (`docs/`)
- [ ] Minimizar hooks que carregam contexto adicional
- [ ] Consolidar STATE.md para eliminar duplicacao

---

## RESULTADO ESPERADO

| Metrica | Antes | Depois |
|---------|-------|--------|
| Linhas auto-carregadas | ~800+ | ~150 |
| Reducao | - | ~80% |
| Contexto livre para trabalho | ~120k | ~180k |

---

## CHECKLIST DE AUDITORIA

- [ ] CLAUDE.md contem apenas instrucoes operacionais
- [ ] Sem duplicacao entre CLAUDE.md e STATE.md
- [ ] Documentacao de referencia em `.claude/docs/`
- [ ] Skills acessiveis sob demanda (nao carregadas automaticamente)
- [ ] Hooks minimizados
- [ ] Repetir auditoria a cada 2-4 semanas

---

## Contexto SICEFSUS

O CLAUDE.md atual e extenso (~500+ linhas) com mapeamento completo de arquitetura.
Considerar mover secoes de referencia (mapeamento de estrutura, historico de sessoes)
para `.claude/docs/` e manter apenas regras operacionais no CLAUDE.md.
