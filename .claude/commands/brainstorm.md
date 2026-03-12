# Brainstorm — Decisao Estruturada

Workflow para tomar decisoes tecnicas antes de implementar.

Adaptado do agnostic-core (MIT). Fonte: commands/workflows/brainstorm.md

---

## PASSO 1 — CLARIFICAR OBJETIVO

Responder antes de gerar opcoes:

- [ ] Qual problema estamos resolvendo?
- [ ] Quem e afetado?
- [ ] Quais restricoes existem (tempo, tecnologia, custo)?
- [ ] Como medimos sucesso?
- [ ] Ja tentamos algo antes? O que deu errado?

---

## PASSO 2 — GERAR OPCOES

Criar 2-4 alternativas **distintas** (nao variacoes):

Para cada opcao documentar:
- Como funciona (descricao tecnica breve)
- Vantagens
- Desvantagens
- Esforco estimado (baixo / medio / alto)
- Caso ideal de uso

---

## PASSO 3 — ANALISAR E RECOMENDAR

Comparar opcoes usando criterios:

| Criterio | Opcao A | Opcao B | Opcao C |
|----------|---------|---------|---------|
| Complexidade de implementacao | | | |
| Carga de manutencao | | | |
| Riscos tecnicos | | | |
| Alinhamento com restricoes | | | |
| Time-to-value | | | |

---

## FORMATO DE SAIDA

```markdown
## Contexto
[Problema e restricoes]

## Opcao 1: [Nome]
- Como: [descricao]
- Pros: [lista]
- Contras: [lista]
- Esforco: [baixo/medio/alto]

## Opcao 2: [Nome]
...

## Recomendacao
[Opcao escolhida + justificativa]
[Riscos mitigados]
[Proximos passos]
```

---

## PRINCIPIOS

- Ficar no nivel conceitual (sem codigo neste passo)
- Transparencia sobre complexidade
- Honestidade sobre trade-offs
- Decisao final e do implementador
- Pragmatismo > solucao elegante que nao cabe no contexto

---

## Skills Relacionadas

- `skills/goal-backward-planning.md` — Planejamento goal-backward
- `skills/pre-implementation.md` — Verificacao pre-codigo
