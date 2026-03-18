---
name: debugging-sistematico
description: "Processo metódico em 4 fases para investigar e corrigir bugs"
---

# Debugging Sistematico — 4 Fases

Processo metodico para investigar e corrigir bugs.

Adaptado do agnostic-core (MIT). Fonte: skills/audit/systematic-debugging.md

---

## PROCESSO DE 4 FASES

```
1. REPRODUZIR → confirmar o bug com passos exatos
2. ISOLAR    → reduzir escopo ate encontrar a area
3. ENTENDER  → descobrir a causa raiz (nao o sintoma)
4. CORRIGIR  → aplicar correcao e prevenir regressao
```

---

## FASE 1 — REPRODUZIR

**Coletar informacoes:**
- [ ] Qual o comportamento esperado vs observado?
- [ ] Passos exatos para reproduzir (1, 2, 3...)
- [ ] Ambiente: browser, OS, versao, staging/producao?
- [ ] Frequencia: sempre, as vezes, raro?
- [ ] Quando comecou? (correlacionar com deploys recentes)

**Se nao reproduzir:**
- Verificar diferencas de ambiente (producao vs local)
- Verificar dados especificos do usuario
- Adicionar logging temporario

---

## FASE 2 — ISOLAR

**Tecnicas de isolamento:**
- `git bisect` → encontrar o commit que introduziu o bug
- Comentar codigo → remover partes ate o bug desaparecer
- Dados minimos → testar com o menor input que reproduz
- Ambiente limpo → sem extensoes, cache, plugins

**Perguntas:**
- [ ] Quando comecou? Correlacionar com commits recentes
- [ ] O que mudou? Diff entre versao funcional e bugada
- [ ] Ocorre em todos os ambientes?
- [ ] Ocorre com todos os usuarios/dados?

---

## FASE 3 — ENTENDER (5 Whys)

Exemplo:
```
Por que o usuario ve erro 500?
  → Porque a query retorna null
Por que a query retorna null?
  → Porque o campo foi renomeado na migration
Por que o campo renomeado quebrou?
  → Porque o codigo ainda referencia o nome antigo
Por que o codigo nao foi atualizado?
  → Porque migration e codigo foram em commits separados
Por que nao foi pego nos testes?
  → Porque nao tem teste de integracao para esse endpoint
```

**Diferenciar:**
- Sintoma → erro visivel para o usuario
- Causa imediata → o que gerou o erro
- Causa raiz → processo/pratica que permitiu o erro

---

## FASE 4 — CORRIGIR E VERIFICAR

**Antes de corrigir:**
- [ ] Entendi a causa raiz (nao apenas o sintoma)?
- [ ] A correcao resolve a raiz ou mascara o sintoma?
- [ ] Pode introduzir efeitos colaterais?

**Apos corrigir:**
- [ ] Bug nao reproduz mais (testar com passos da Fase 1)
- [ ] Funcionalidades relacionadas continuam funcionando
- [ ] Teste de regressao adicionado
- [ ] Sem efeitos colaterais

---

## ANTI-PATTERNS

| Anti-Pattern | Solucao |
|-------------|---------|
| Mudancas aleatorias ("vou mudar pra ver") | Usar evidencias |
| Ignorar evidencias que contradizem hipotese | Mudar a teoria |
| Parar no sintoma ("consertei o erro 500") | Perguntar "por que aconteceu?" |
| Nao adicionar teste de regressao | Sem teste = bug volta |
| Debugar em producao com mudancas ao vivo | Reproduzir local |
| "Funciona na minha maquina" | Verificar ambiente/dados/config |

---

## CHECKLIST RAPIDO

**Antes:**
- [ ] Tenho passos claros de reproducao?
- [ ] Sei quando comecou?
- [ ] Sei em quais ambientes ocorre?

**Durante:**
- [ ] Olhando causa raiz ou apenas sintoma?
- [ ] Usando dados/evidencias ou chutando?
- [ ] Isolei o escopo (git bisect, caso minimo)?

**Apos:**
- [ ] Bug nao reproduz?
- [ ] Teste de regressao adicionado?
- [ ] Areas relacionadas verificadas?

---

## Skills Relacionadas

- `skills/resolver-problema.md` — Diagnostico sistematico (5 fases)
- `skills/code-review.md` — Prevencao via revisao
- `skills/testing-guide.md` — Testes de regressao
