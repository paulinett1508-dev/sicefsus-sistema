# Refactoring Seguro — Decomposicao Incremental

Guia para refatorar codigo de forma incremental sem quebrar o que funciona.

Adaptado do agnostic-core (MIT). Fonte: skills/audit/refactoring.md

---

## Regra de Ouro

> "E melhor um monolito funcionando do que modulos quebrados."
> Nunca refatorar sem entender 100% da logica de negocio.

---

## AS 7 FASES

### Fase 0 — Pre-Analise
- [ ] Qual e o proposito do modulo/arquivo?
- [ ] E critico (financeiro, autenticacao, dados do usuario)?
- [ ] Quando foi modificado pela ultima vez? Por que?
- [ ] Existe cobertura de testes?
- [ ] Refatoracao foi aprovada?

### Fase 1 — Analise Estrutural
- [ ] Medir: linhas totais, numero de funcoes
- [ ] Listar funcoes: nome, linhas, responsabilidade
- [ ] Identificar responsabilidades misturadas (query + negocio + HTTP)
- [ ] Criar mapa de chamadas

### Fase 2 — Mapeamento de Dependencias
- [ ] Listar imports (o que depende)
- [ ] Listar quem usa este arquivo (grep)
- [ ] Identificar "costuras naturais" para separacao
- [ ] Verificar partes mais volateis

### Fase 3 — Perguntas de Clarificacao
- [ ] Qual funcionalidade nao pode quebrar?
- [ ] Quais partes mudam com mais frequencia?
- [ ] Existe dependencia circular?
- [ ] Qual o tempo disponivel?

### Fase 4 — Proposta de Arquitetura
- [ ] Definir novos modulos com responsabilidade unica
- [ ] Mapear fluxo de dependencias
- [ ] Sem dependencias circulares
- [ ] Proposta revisada antes de codar

### Fase 5 — Extracao Incremental
- [ ] Uma funcao por vez (nao mover tudo de uma vez)
- [ ] Um commit por extracao
- [ ] Testar apos cada extracao
- [ ] Manter original funcionando enquanto extrai
- [ ] Re-exportar do original enquanto migracao nao termina

### Fase 6 — Validacao
- [ ] Todos os testes passam apos cada fase
- [ ] Smoke test manual dos fluxos criticos
- [ ] Nenhum import quebrou
- [ ] Verificar multi-tenant se aplicavel

### Fase 7 — Rollback
- [ ] Branch de feature separada
- [ ] Commits atomicos permitem revert por funcao
- [ ] Plano de rollback documentado
- [ ] Checkpoint seguro definido

---

## ANTI-PATTERNS

- **Big bang**: mover tudo de uma vez → nunca
- **Refatorar sem entender**: split sem ler toda a logica → nunca
- **Deletar imediatamente**: remover codigo antigo antes de validar o novo → nunca
- **Micro-modulos**: criar arquivo para cada funcao → overengineering
- **Refatorar + feature**: misturar no mesmo PR → separar sempre
- **Sem testes**: refatorar sem cobertura existente → risco alto

---

## SINAIS DE ALERTA

- PR com mais de 500 linhas alteradas
- Mais de 5 arquivos novos de uma vez
- Testes quebrados sem motivo claro
- "So mais um ajuste" acumulando
- Sem conseguir explicar cada novo modulo

---

## CHECKLIST FINAL

- [ ] Todos os testes passam
- [ ] Sem logica de negocio alterada (apenas estrutura)
- [ ] Sem funcionalidade nova misturada
- [ ] Todos os imports atualizados
