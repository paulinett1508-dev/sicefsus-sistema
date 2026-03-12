# Create Feature — Workflow Completo

Template para construir features completas de ponta a ponta.

Adaptado do agnostic-core (MIT). Fonte: commands/workflows/create.md

---

## QUANDO USAR

- Criar aplicacoes/modulos novos do zero
- Implementar features que cruzam banco + backend + frontend
- Qualquer trabalho que precisa de coordenacao entre dominios

---

## 4 FASES

### FASE 1 — ANALISAR REQUISITOS

Clarificar especificacao antes de qualquer codigo:

- [ ] Qual o tipo de aplicacao/modulo?
- [ ] Quais as funcionalidades core?
- [ ] Quem sao os usuarios alvo?
- [ ] Quais restricoes existem?
- [ ] Qual e o MVP (scope minimo viavel)?

### FASE 2 — PLANEJAR

Usar goal-backward planning (ver `skills/goal-backward-planning.md`):

- [ ] Definir estado final (goal observavel)
- [ ] Listar artifacts necessarios
- [ ] Organizar trabalho em waves:

```
Wave 1: Fundacao (schemas, types, config)
Wave 2: Backend (services, hooks, Firestore)
Wave 3: Frontend (componentes, formularios, navegacao)
Wave 4: Qualidade (testes, validacao, edge cases)
Wave 5: Polish (UX, acessibilidade, performance)
```

### FASE 3 — EXECUTAR

Completar waves sequencialmente:

- [ ] Testar continuamente
- [ ] Commit apos cada unidade logica
- [ ] Nao pular para wave seguinte com testes falhando
- [ ] Usar `skills/pre-implementation.md` antes de cada arquivo novo

### FASE 4 — VERIFICAR

- [ ] Todos os requisitos atendidos (voltar a lista da Fase 1)
- [ ] Testes passam
- [ ] Build de producao funciona (`npm run build`)
- [ ] Documentacao minima existe (CLAUDE.md atualizado se necessario)

---

## FORMATO DE SAIDA

```markdown
## Feature: [Nome]
- Objetivo: [descricao]
- Stack: [tecnologias]

## Waves
### Wave 1: Fundacao
- [ ] Tarefa 1
- [ ] Tarefa 2

### Wave 2: Backend
...

## Criterios de Aceite
- [ ] Criterio 1
- [ ] Criterio 2
```

---

## Skills Relacionadas

- `skills/goal-backward-planning.md` — Planejamento estruturado
- `skills/pre-implementation.md` — Verificacao pre-codigo
- `skills/ANTI-PATTERNS-CHECKER.md` — Checkpoint de qualidade
- `skills/PRD-GENERATOR.md` → `SPEC-GENERATOR.md` → `CODE-IMPLEMENTER.md` — Framework 3 fases
