# Context Management — Gestao de Contexto AI

Estrategias para manter qualidade de resposta durante sessoes longas,
prevenindo "context rot" (degradacao progressiva conforme historico cresce).

Adaptado do agnostic-core (MIT). Fonte: skills/workflow/context-management.md

---

## NIVEIS DE QUALIDADE

| Uso de Contexto | Nivel | Qualidade |
|-----------------|-------|-----------|
| 0-30% | PICO | Respostas precisas, codigo correto |
| 30-50% | BOM | Funcional, ocasionais imprecisoes |
| 50-70% | ATENCAO | Erros comecam, referencias cruzadas falham |
| 70%+ | RUIM | Alucinacoes, codigo inconsistente |

---

## ESTRATEGIA: CONTEXTO FRESCO

Cada fase de planejamento deve ter sua propria sessao:

```
SESSAO 1: Pesquisa (PRD) → salva PRD-X.md
SESSAO 2: Especificacao (SPEC) → salva SPEC-X.md
SESSAO 3: Implementacao (CODE) → codigo final
```

**PLAN.md** serve como documento de handover entre sessoes.

---

## GATILHOS DE PAUSA

Parar e criar nova sessao quando:
- [ ] Contexto excede 50% com trabalho complexo restante
- [ ] Erros ou alucinacoes aparecem
- [ ] Funcoes inventadas (nao existem no codebase)
- [ ] Logica duplicada que ja foi corrigida
- [ ] Referencia a codigo removido como se existisse

---

## FORMATO DE HANDOVER

Ao pausar, documentar:

```markdown
## Handover — [Data]

### Concluido
- [x] Tarefa 1
- [x] Tarefa 2

### Estado Atual
- Arquivo X modificado (linhas Y-Z)
- Decisao critica: [escolha feita e por que]

### Proximos Passos
- [ ] Tarefa 3
- [ ] Tarefa 4

### Arquivos Criticos
- `src/arquivo1.js` — modificado
- `src/arquivo2.js` — a modificar
```

---

## CARREGAMENTO CIRURGICO

Em nova sessao, carregar APENAS o necessario:
1. CLAUDE.md (contexto do projeto)
2. PLAN.md ou handover (estado atual)
3. Arquivos especificos mencionados no handover

**NAO** carregar o codebase inteiro. Cada arquivo carregado consome contexto.

---

## SINAIS DE SAUDE

| Sinal | Significado |
|-------|-------------|
| Referencias a funcoes inexistentes | Context rot |
| Logica duplicada sendo proposta | Historico confuso |
| Esquecendo decisoes anteriores | Contexto excedido |
| Codigo correto e consistente | Contexto saudavel |

---

## CHECKLIST

- [ ] Cada sessao com escopo definido (<60k tokens de trabalho)
- [ ] Handover documentado ao pausar
- [ ] Carregamento cirurgico na nova sessao
- [ ] Monitorar sinais de degradacao
- [ ] Usar /compact quando statusline indicar >50%

---

## Contexto SICEFSUS

O projeto usa statusline customizado (`.claude/statusline.sh`) que mostra:
- Uso de memoria (verde <50%, amarelo 50-75%, vermelho >75%)
- Indicador `/compact` quando >75%
- Framework PRD→SPEC→CODE projetado para sessoes separadas
