# Skill: Resolver Problema (Diagnóstico Guiado)

## Quando Usar
Esta skill é ativada quando o usuário reporta um problema, bug ou comportamento inesperado e precisa de diagnóstico e correção.

## Competência
Diagnosticar problemas de forma sistemática, identificar causa raiz e implementar correções seguras.

## Processo de Diagnóstico

### Fase 1: Entendimento
1. **Reproduzir o problema**
   - Quais passos levam ao erro?
   - Acontece sempre ou intermitente?
   - Quais dados/inputs estão envolvidos?

2. **Coletar evidências**
   - Mensagens de erro no console
   - Stack trace
   - Estado da aplicação
   - Logs relevantes

3. **Delimitar escopo**
   - Quando começou? (commit, deploy, mudança)
   - Funciona em outros ambientes (dev/prod)?
   - Afeta todos usuários ou específicos?

### Fase 2: Investigação
1. **Identificar arquivos envolvidos**
   - Componentes relacionados à funcionalidade
   - Hooks e serviços utilizados
   - Fluxo de dados

2. **Traçar fluxo de dados**
   - De onde vem o dado?
   - Por onde passa?
   - Onde é exibido/modificado?

3. **Formular hipóteses**
   - Listar possíveis causas
   - Priorizar por probabilidade
   - Testar cada hipótese

### Fase 3: Causa Raiz
1. **Confirmar a causa**
   - Evidências que suportam
   - Evidências que refutam alternativas
   - Explicar POR QUE o bug acontece

2. **Avaliar impacto**
   - Outros lugares afetados?
   - Dados corrompidos?
   - Necessita rollback?

### Fase 4: Solução
1. **Descrever a correção**
   - O que precisa mudar
   - ANTES / DEPOIS do código
   - Justificativa técnica

2. **Listar efeitos colaterais**
   - Outros componentes impactados
   - Migrações necessárias
   - Breaking changes

3. **Implementar**
   - Código corrigido COMPLETO
   - Nunca fragmentar a solução
   - Incluir validações necessárias

### Fase 5: Validação
1. **Testar a correção**
   - Reproduzir cenário original
   - Verificar se está corrigido
   - Testar casos de borda

2. **Regressão**
   - Funcionalidades relacionadas
   - Fluxos críticos
   - Permissões e roles

## Template de Resposta

```markdown
## 🔍 Diagnóstico

**Problema reportado:** [descrição]

**Causa raiz:** [explicação técnica]

**Arquivos envolvidos:**
- `src/components/X.jsx` - [papel no bug]
- `src/hooks/useY.js` - [papel no bug]

## 🛠️ Solução

**Correção necessária:** [descrição]

**Código ANTES:**
```jsx
// código problemático
```

**Código DEPOIS:**
```jsx
// código corrigido
```

## ⚠️ Efeitos Colaterais
- [lista de impactos]

## ✅ Validação
- [ ] Cenário original funciona
- [ ] Casos de borda testados
- [ ] Sem regressões
```

## Tecnica: 5 Whys (agnostic-core)

Perguntar "por que?" 5 vezes para encontrar a causa raiz:

```
Por que o usuario ve erro 500?
  → Porque a query retorna null
Por que a query retorna null?
  → Porque o campo foi renomeado
Por que o campo renomeado quebrou?
  → Porque o codigo referencia o nome antigo
Por que o codigo nao foi atualizado?
  → Porque migration e codigo foram em commits separados
Por que nao foi pego nos testes?
  → Porque nao tem teste para esse fluxo
```

**Diferenciar:** Sintoma vs Causa imediata vs Causa raiz

---

## Tecnicas de Isolamento

- `git bisect` → encontrar commit que introduziu o bug
- Comentar codigo → remover partes ate o bug desaparecer
- Dados minimos → testar com menor input que reproduz
- Ambiente limpo → sem extensoes, cache, plugins

---

## Anti-Patterns de Debugging

| Anti-Pattern | Solucao |
|-------------|---------|
| Mudancas aleatorias | Usar evidencias |
| Ignorar evidencias contraditorias | Mudar a teoria |
| Parar no sintoma | Perguntar "por que?" |
| Sem teste de regressao | Sempre adicionar teste |
| Debugar em producao | Reproduzir local |
| "Funciona na minha maquina" | Verificar ambiente/dados |

---

## Princípios
- Nunca assumir sem evidência
- Preferir correção mínima e focada
- Documentar o raciocínio
- Validar antes de declarar resolvido

---

## Skills Relacionadas

- `skills/debugging-sistematico.md` — Processo de 4 fases detalhado
- `skills/testing-guide.md` — Testes de regressao
- `skills/code-review.md` — Prevencao via revisao
