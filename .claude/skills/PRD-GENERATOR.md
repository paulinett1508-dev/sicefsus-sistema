---
name: prd-generator
description: "Pesquisa codebase e gera Product Requirements Document (PRD)"
---

# PRD Generator Skill

## Session Management
**THIS SKILL RUNS IN AN ISOLATED SESSION**

## Purpose
Generate comprehensive Product Requirements Documents (PRDs) by systematically researching codebase, documentation, and existing solutions before implementation.

## Context Budget
- Maximum tokens: 60,000
- Typical usage: 40-60k tokens
- Output size: ~3kb (.md file)

## When to Use
Trigger when user says:
- "Preciso implementar [feature]"
- "Como fazer [funcionalidade]"
- "Quero adicionar [recurso]"
- "Gere PRD para [feature]"

## Workflow

### Step 1: Understand the Request (5k tokens)
Ask clarifying questions if needed:
- What problem are we solving?
- Who is the end user?
- What's the expected behavior?
- Any specific constraints?

### Step 2: Research Codebase (20-30k tokens)

**Search for existing patterns:**
```bash
# View project structure
view ~/workspace/src/

# Search for similar implementations
bash_tool command="grep -r 'similar_pattern' ~/workspace/src/ | head -20"

# Check specific directories
view ~/workspace/src/hooks/
view ~/workspace/src/components/
view ~/workspace/src/utils/
view ~/workspace/src/services/
```

**Check project standards:**
```bash
view ~/workspace/docs/GUIA_DESENVOLVEDOR.md
view ~/workspace/docs/ORQUESTRADORES_SISTEMA.md
```

### Step 3: Research External Solutions (10-20k tokens)

**Use these tools in order:**

1. **conversation_search**: Check if we discussed this before
```
   conversation_search query="[topic] [feature]"
```

2. **web_search**: Find best practices and libraries
```
   web_search query="React [feature] best practices"
   web_search query="[library-name] npm"
```

3. **web_fetch**: Get official documentation
```
   web_fetch url="[official-docs-url]"
```

### Step 4: Generate PRD (5-10k tokens)

Create file in `/mnt/user-data/outputs/` with this structure:
```markdown
# PRD-XXX: [Feature Name]

## 🎯 Objetivo
[Clear, concise goal statement - what and why]

## 🔍 Pesquisa Realizada

### 1. Busca no Codebase
- [x] Arquivos relacionados encontrados:
  - `src/path/file1.js` - [description]
  - `src/path/file2.jsx` - [description]
- [x] Código similar identificado em:
  - `src/existing/pattern.js` - [how it works]
- [x] Padrão arquitetural: [pattern name and explanation]

### 2. Soluções Externas Disponíveis
- [x] Bibliotecas NPM pesquisadas:
  - `library-name` (version) - [pros/cons/justification]
  - ✅ RECOMENDADO: [chosen solution] - [why]
- [x] MCPs conectados relevantes:
  - [MCP name] - [how it can help]
- [x] APIs externas disponíveis:
  - [API name] - [endpoint/usage]

### 3. Documentação Consultada
- [x] Docs oficiais:
  - [Framework/Library Docs] - [key insights]
  - [link to docs]
- [x] Stack Overflow / GitHub:
  - [Relevant discussion/example] - [link]
- [x] Conversas anteriores:
  - [Previous chat reference if any]

## 🏗️ Arquitetura Proposta

### Reutilizar (Existing Code)
- `src/existing/file.js` → Extend with [specific function/method]
  - Motivo: [why reuse instead of create new]
- `src/utils/helpers.js` → Use existing [helper function]
  - Motivo: [DRY principle applied]

### Criar (New Files)
- `src/hooks/useNewHook.js` (~150 lines) → Business logic
  - Responsabilidade: [single responsibility]
  - Exports: [list public interface]
- `src/components/NewComponent.jsx` (~80 lines) → UI component
  - Responsabilidade: [single responsibility]
  - Props: [list expected props]

### Modificar (Changes to Existing)
- `src/App.jsx` (+5 lines) → Add route
  - Linha ~[X]: [specific change]
- `src/config/constants.js` (+10 lines) → Add new constants
  - Seção: [where to add]

### Dependências Necessárias
- `npm install [package-name]` (version X.Y.Z)
  - Justificativa: [why this dependency]
  - Alternativa considerada: [why not chosen]

## ✅ Critérios de Aceitação

Funcionalidade:
- [ ] [Specific behavior 1]
- [ ] [Specific behavior 2]
- [ ] [Edge case handling]

Qualidade:
- [ ] Código segue padrões do projeto (GUIA_DESENVOLVEDOR.md)
- [ ] Sem duplicação de código (DRY)
- [ ] Arquivos respeitam limite de 200 linhas
- [ ] Single Responsibility por arquivo

Documentação:
- [ ] README.md atualizado (se necessário)
- [ ] Comentários em lógica complexa
- [ ] JSDoc em funções públicas

Testes:
- [ ] Comportamento validado manualmente
- [ ] Edge cases testados
- [ ] Error handling implementado

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| [Risk description] | Alta/Média/Baixa | Alto/Médio/Baixo | [Specific mitigation strategy] |

## 📊 Estimativa de Complexidade

- **Complexidade Técnica:** ⭐⭐⭐ (1-5 stars)
- **Arquivos Afetados:** [number]
- **Linhas de Código:** ~[estimate]
- **Tempo Estimado:** [hours/days]

## 🔗 Referências

- [Link to relevant documentation]
- [Link to similar implementation]
- [Link to design/mockup if applicable]
```

### Step 5: Validate Against Anti-Patterns (3-5k tokens)

Before saving, run mental checklist:

**1. ❌ Overengineering?**
- Is this the simplest solution?
- Can a junior maintain this?
- Are we adding unnecessary complexity?

**2. ❌ Reinventing Wheel?**
- Did we check for existing libraries?
- Did we search the codebase thoroughly?
- Is there a standard solution?

**3. ❌ Missing Documentation?**
- Did we read official docs?
- Do we understand how it works?
- Are we guessing behavior?

**4. ❌ Code Duplication?**
- Does similar code already exist?
- Can we extract reusable functions?
- Did we check /utils, /hooks, /services?

**5. ❌ Monolithic Design?**
- Are we planning files <200 lines?
- Single responsibility per file?
- Clear separation of concerns?

If ANY check fails, revise architecture before proceeding.

### Step 6: Save and Close Session
```bash
create_file /mnt/user-data/outputs/PRD-XXX-[feature-name].md
present_files filepaths=["/mnt/user-data/outputs/PRD-XXX-[feature-name].md"]
```

**OUTPUT MESSAGE:**
```
✅ PRD-XXX-[feature-name].md salvo em /mnt/user-data/outputs/

📊 Resumo da Pesquisa:
- Arquivos existentes analisados: [count]
- Bibliotecas consideradas: [count]
- Docs consultadas: [count]
- Padrão identificado: [pattern name]

📈 Contexto usado: ~[X]k tokens
🔄 Sessão encerrada

👉 PRÓXIMO PASSO:
Abra NOVA SESSÃO no Claude Code e execute:

"Gere spec de /mnt/user-data/outputs/PRD-XXX-[feature-name].md"

⚠️ IMPORTANTE: Não continue nesta sessão. Abra nova sessão para manter contexto limpo.
```

## Anti-Patterns Prevention

This skill ENFORCES:
- ✅ Research BEFORE architecture
- ✅ Simplicity BEFORE complexity
- ✅ Reuse BEFORE creation
- ✅ Documentation BEFORE guessing
- ✅ DRY BEFORE duplication

## Critical Rules

**MUST DO:**
- ✅ ALWAYS search codebase first (grep, view)
- ✅ ALWAYS check for existing libraries
- ✅ ALWAYS consult official documentation
- ✅ ALWAYS validate with anti-patterns checklist
- ✅ ALWAYS save to /mnt/user-data/outputs/
- ✅ ALWAYS close session after output

**NEVER DO:**
- ⛔ NEVER skip research phase
- ⛔ NEVER assume solution without checking
- ⛔ NEVER proceed to SPEC in same session
- ⛔ NEVER keep research context in memory
- ⛔ NEVER propose solution without validation

## Success Criteria

A good PRD:
- Documents all research performed
- Proposes simplest viable solution
- Reuses existing code where possible
- References official documentation
- Passes all 5 anti-pattern checks
- Provides clear acceptance criteria
- Identifies risks proactively

## Example Triggers

**Good Triggers:**
- "Preciso adicionar filtro de despesas por natureza"
- "Como implementar validação de CNPJ"
- "Gere PRD para integração com API do IBGE"

**Bad Triggers (redirect to research first):**
- "Implemente [X]" → First generate PRD
- "Crie componente [Y]" → First generate PRD
- "Adicione função [Z]" → First generate PRD