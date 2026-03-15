---
name: goal-backward-planning
description: "Planejamento estruturado a partir do resultado esperado"
---

# Goal-Backward Planning

Metodologia de planejamento estruturado a partir do resultado esperado.
Substitui "o que fazer primeiro" por "o que precisa ser verdade no final".

Adaptado do agnostic-core (MIT). Fonte: skills/workflow/goal-backward-planning.md
Origem: MIT get-shit-done framework.

---

## ESTRUTURA EM 4 PASSOS

### 1. GOAL — Endpoint Observavel

Definir o que muda quando o trabalho esta completo.

```
NAO: "Implementar autenticacao"
SIM: "Usuario faz login com email/senha e recebe token JWT valido"
```

O goal deve ser observavel — alguem pode verificar sem ler o codigo.

### 2. OBSERVABLE TRUTHS — Criterios de Verificacao

Pre-condicoes e invariantes que confirmam o goal:
- Cada truth deve ser verificavel sem ambiguidade
- Exemplo: "POST /auth/login retorna 200 com {token, expiresAt}"

### 3. REQUIRED ARTIFACTS — Entregas Concretas

Arquivos, schemas, configs que habilitam verificacao:
- Arquivos de codigo fonte
- Testes
- Configs de ambiente
- Documentacao minima

### 4. KEY LINKS — Referencias Externas

Documentacao, policies e skills que previnem reinvencao.

---

## NIVEIS DE DISCOVERY

| Nivel | Escopo | Quando |
|-------|--------|--------|
| 0 | Sem pesquisa | Contexto familiar, padroes conhecidos |
| 1 | README + 2 exemplos | Nova versao, novo padrao |
| 2 | Docs completos + exemplos prod | Integracoes externas, migrations |
| 3 | POC + benchmarks + security review | Decisoes arquiteturais, performance critica |

**Principio**: nivel minimo que elimina incerteza.

---

## PARALELIZACAO EM WAVES

Agrupar por dependencias reais (nao por camada tecnica):

```
Wave 1: schemas/types (sem dependencias)
Wave 2: services (dependem dos schemas)
Wave 3: componentes (dependem dos services)
```

Tasks sem interdependencias formam waves paralelas.

---

## CHECKPOINTS

Tres tipos para validacao critica:

| Tipo | Quando |
|------|--------|
| **human-verify** | Confirmar condicoes antes de prosseguir |
| **decision** | Escolher entre opcoes com trade-offs |
| **human-action** | Passos manuais necessarios |

Nunca pular checkpoints sem resolucao explicita.

---

## CHECKLIST DE QUALIDADE

- [ ] Goal e observavel, nao uma acao
- [ ] Cada truth e verificavel sem ambiguidade
- [ ] Artifacts cobrem todos os arquivos necessarios
- [ ] Tasks agrupadas em waves de dependencia
- [ ] Checkpoints marcam decisoes irreversiveis
- [ ] Nivel de discovery corresponde ao risco
- [ ] Plano usa ~30-40% do contexto disponivel
