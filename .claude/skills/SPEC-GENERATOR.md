---
name: spec-generator
description: "Transforma PRD aprovado em especificação técnica detalhada"
---

# SPEC Generator Skill

## Session Management
**THIS SKILL RUNS IN A FRESH ISOLATED SESSION**

## Purpose
Transform approved PRD into detailed technical specification with exact file changes, line numbers, and implementation steps.

## Context Budget
- Maximum tokens: 50,000
- Typical usage: 30-45k tokens
- Output size: ~5kb (.md file)

## Prerequisites
- PRD-XXX.md MUST exist in /mnt/user-data/outputs/
- This MUST be a NEW session (clean context)
- PRD must be approved by user

## When to Use
Trigger when user says:
- "Gere spec de /mnt/user-data/outputs/PRD-XXX.md"
- "Crie especificação técnica do PRD-XXX"
- "Transforme PRD-XXX em SPEC"

## Workflow

### Step 1: Load ONLY the PRD (3-5k tokens)
```bash
view /mnt/user-data/outputs/PRD-XXX-[name].md
```

**CRITICAL:** 
- Do NOT load/search anything from previous session's research
- Do NOT re-do the research
- The PRD is the SINGLE SOURCE OF TRUTH
- Trust the PRD's conclusions

### Step 2: Load Project Standards (10k tokens)
```bash
view ~/workspace/docs/GUIA_DESENVOLVEDOR.md
view ~/workspace/docs/ORQUESTRADORES_SISTEMA.md
```

**Load project rules:**
```bash
view /mnt/project/REGRA__01__Estrutura_de_pastas_
view /mnt/project/REGRA__03__Comportamento_ao_entregar_um_resultado_
```

### Step 3: Analyze Affected Files (15-20k tokens)

**For each file mentioned in PRD:**

**Existing files to modify:**
```bash
view ~/workspace/src/[file-from-prd]
```

Count lines, identify insertion points, check dependencies.

**New files to create:**
- Plan structure based on similar existing files
- Define clear boundaries
- Ensure <200 lines per file

### Step 4: Generate SPEC (10-15k tokens)

Create file in `/mnt/user-data/outputs/` with this structure:

````markdown
# SPEC-XXX: [Feature Name]

**Baseado em:** PRD-XXX-[name].md  
**Data:** [current date]

## 📋 Resumo Executivo

**Objetivo:** [1-2 sentence summary from PRD]  
**Arquivos Afetados:** [total count]  
**Complexidade:** ⭐⭐⭐ (1-5 stars)

## 📂 Arquivos Afetados

### ✨ Criar (novos arquivos)
```
src/
├─ hooks/
│  └─ useNewHook.js              (150 linhas) → Business logic
│     Responsabilidade: [single responsibility]
│     Exports: [list public interface]
│
├─ components/
│  └─ NewComponent.jsx           (80 linhas)  → UI component
│     Responsabilidade: [single responsibility]
│     Props: [required props]
│
└─ utils/
   └─ newHelpers.js              (60 linhas)  → Helper functions
      Responsabilidade: [single responsibility]
      Exports: [list functions]
```

### 🔧 Modificar (arquivos existentes)
```
src/
├─ App.jsx                       (+5 linhas)   → Add route
│  Linha ~45: Import component
│  Linha ~120: Add route definition
│
├─ config/constants.js           (+10 linhas)  → New constants
│  Linha ~30: Add to NATUREZAS_DESPESA array
│
└─ hooks/useExistingHook.js      (+8 linhas)   → Extend functionality
   Linha ~25: Add new parameter
   Linha ~40: Add filter logic
```

## 📦 Dependências

### Instalar:
```bash
npm install [package-name]@[version]
```

**Justificativa:** [why this package]

## 🔧 Implementação Detalhada

### 1. src/hooks/useNewHook.js (NOVO - 150 linhas)

**Responsabilidade:** [Clear single responsibility]

**Estrutura do Arquivo:**

```javascript
// Imports (linhas 1-10)
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Tipo/Interface (linhas 12-20)
/**
 * @typedef {Object} HookReturn
 * @property {Array} data - [description]
 * @property {boolean} loading - [description]
 * @property {string|null} error - [description]
 * @property {Function} action - [description]
 */

// Hook Principal (linhas 22-140)
export const useNewHook = (param1, param2) => {
  // State declarations (linhas 23-26)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useEffect para carregar dados (linhas 28-60)
  useEffect(() => {
    // [Implementation logic]
  }, [param1, param2]);

  // Action function (linhas 62-100)
  const performAction = async (actionParam) => {
    // [Implementation logic]
  };

  // Return (linhas 102-107)
  return {
    data,
    loading,
    error,
    performAction
  };
};

// Helper Functions (linhas 109-145)
const helperFunction = (param) => {
  // [Implementation logic]
};

// Exports (linhas 147-150)
export default useNewHook;
```

**Dependências:**
- `react`: useState, useEffect
- `firebase/firestore`: collection, query, where, getDocs
- `../firebase/firebaseConfig`: db

**Lógica Principal:**
1. Inicializa estados (data, loading, error)
2. useEffect carrega dados do Firestore
3. Implementa filtros/validações
4. Retorna interface pública

**Validações:**
- Validar parâmetros antes de buscar
- Tratar erros de rede
- Validar dados retornados

---

### 2. src/components/NewComponent.jsx (NOVO - 80 linhas)

**Responsabilidade:** [Clear single responsibility]

**Estrutura do Arquivo:**

```javascript
// Imports (linhas 1-8)
import React from 'react';
import { useNewHook } from '../hooks/useNewHook';
import './NewComponent.css';

// Componente (linhas 10-75)
export const NewComponent = ({ prop1, prop2 }) => {
  // Hook usage (linhas 11-13)
  const { data, loading, error, performAction } = useNewHook(prop1);

  // Event handlers (linhas 15-25)
  const handleAction = () => {
    // [Implementation]
  };

  // Conditional renders (linhas 27-35)
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  // Main render (linhas 37-70)
  return (
    <div className="new-component">
      {/* [JSX structure] */}
    </div>
  );
};

// PropTypes (linhas 77-80)
NewComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

export default NewComponent;
```

**Props:**
- `prop1` (string, required): [description]
- `prop2` (number, optional): [description, default value]

**Estado Local:**
- Nenhum (usa apenas hook)
- OU: [local state if needed with justification]

**Estrutura JSX:**
```jsx
<div className="new-component">
  <header className="component-header">
    {/* Header content */}
  </header>
  
  <main className="component-body">
    {/* Main content */}
  </main>
  
  <footer className="component-footer">
    {/* Footer content */}
  </footer>
</div>
```

---

### 3. src/App.jsx (MODIFICAR - +5 linhas)

**Linha ~10:** Adicionar import

```javascript
// ANTES (linha 10)
import Dashboard from './components/Dashboard';

// DEPOIS (linha 10)
import Dashboard from './components/Dashboard';
import NewComponent from './components/NewComponent';  // ← ADICIONAR
```

**Linha ~120:** Adicionar rota

```javascript
// ANTES (linha 120)
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

// DEPOIS (linha 120)
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/novo" element={<NewComponent />} />  // ← ADICIONAR
      </Routes>
```

---

### 4. src/config/constants.js (MODIFICAR - +10 linhas)

**Linha ~30:** Adicionar novos valores

```javascript
// ANTES (linha 30)
export const NATUREZAS_DESPESA = [
  { codigo: '44905200', nome: 'Material de Consumo' },
  { codigo: '44905100', nome: 'Obras e Instalações' },
];

// DEPOIS (linha 30)
export const NATUREZAS_DESPESA = [
  { codigo: '44905200', nome: 'Material de Consumo' },
  { codigo: '44905100', nome: 'Obras e Instalações' },
  { codigo: '44905300', nome: 'Nova Natureza' },  // ← ADICIONAR
  { codigo: '44905400', nome: 'Outra Natureza' },  // ← ADICIONAR
];
```

---

### 5. src/utils/newHelpers.js (NOVO - 60 linhas)

**Responsabilidade:** [Specific helper functions purpose]

**Estrutura do Arquivo:**

```javascript
// Imports (linhas 1-5)
import { formatarMoeda } from './formatters';

// Helper Function 1 (linhas 7-20)
export const helperFunction1 = (param) => {
  // [Implementation]
  return result;
};

// Helper Function 2 (linhas 22-35)
export const helperFunction2 = (param) => {
  // [Implementation]
  return result;
};

// Helper Function 3 (linhas 37-50)
export const helperFunction3 = (param) => {
  // [Implementation]
  return result;
};

// Exports (linhas 52-60)
export default {
  helperFunction1,
  helperFunction2,
  helperFunction3
};
```

---

## ✅ Checklist de Implementação

### Fase 1: Preparação
- [ ] PRD-XXX.md foi lido e compreendido
- [ ] Arquivos afetados foram identificados
- [ ] Estrutura foi validada

### Fase 2: Criação de Novos Arquivos
- [ ] Criar `src/hooks/useNewHook.js`
- [ ] Criar `src/components/NewComponent.jsx`
- [ ] Criar `src/utils/newHelpers.js` (se aplicável)

### Fase 3: Modificação de Arquivos Existentes
- [ ] Modificar `src/App.jsx` (imports + routes)
- [ ] Modificar `src/config/constants.js`
- [ ] Modificar outros arquivos conforme necessário

### Fase 4: Dependências
- [ ] Instalar pacotes npm necessários
- [ ] Verificar compatibilidade de versões

### Fase 5: Validação
- [ ] Todos arquivos <200 linhas
- [ ] Single responsibility respeitado
- [ ] Sem duplicação de código
- [ ] Imports organizados

---

## 🧪 Casos de Teste

### 1. Happy Path (Caminho Feliz)

**Entrada:**
```javascript
[Exemplo de input válido]
```

**Processamento:**
1. Passo 1: [action]
2. Passo 2: [action]

**Saída Esperada:**
```javascript
[Exemplo de output esperado]
```

---

### 2. Edge Case (Caso Extremo)

**Entrada:**
```javascript
[Exemplo de input no limite]
```

**Processamento:**
1. Validação: [check]
2. Tratamento: [handling]

**Saída Esperada:**
```javascript
[Exemplo de output ou erro esperado]
```

---

### 3. Error Case (Caso de Erro)

**Entrada:**
```javascript
[Exemplo de input inválido]
```

**Processamento:**
1. Detecta: [what triggers error]
2. Trata: [how error is handled]

**Saída Esperada:**
```javascript
{
  error: "Mensagem de erro descritiva",
  code: "ERROR_CODE"
}
```

---

## 🎯 Critérios de Aceitação (do PRD)

[Copiar critérios do PRD aqui para referência durante implementação]

- [ ] [Critério 1]
- [ ] [Critério 2]
- [ ] [Critério 3]

---

## 📊 Métricas de Qualidade

### Arquitetura:
- **Arquivos novos:** [count]
- **Arquivos modificados:** [count]
- **Total de linhas:** ~[estimate]
- **Maior arquivo:** [lines] linhas

### Complexidade:
- **Complexidade ciclomática:** Baixa
- **Acoplamento:** Mínimo
- **Coesão:** Alta

---

## 🚨 Pontos de Atenção

### ⚠️ Cuidados Durante Implementação

**1. [Arquivo X]:**
- **Atenção:** [specific concern]
- **Mitigação:** [how to handle]

**2. [Lógica Y]:**
- **Risco:** [potential issue]
- **Solução:** [preventive measure]

**3. [Integração Z]:**
- **Desafio:** [integration challenge]
- **Abordagem:** [recommended approach]

---

## 📚 Referências

- **PRD-XXX:** `/mnt/user-data/outputs/PRD-XXX-[name].md`
- **Guia Desenvolvedor:** `~/workspace/docs/GUIA_DESENVOLVEDOR.md`
- **Orquestradores:** `~/workspace/docs/ORQUESTRADORES_SISTEMA.md`
- **[Documentação Externa]:** [link]

---

## 🔄 Fluxo de Implementação Recomendado

### Ordem Sugerida:

1. **Criar hooks primeiro** (`useNewHook.js`)
   - Define lógica de negócio
   - Testa isoladamente
   
2. **Criar utils depois** (`newHelpers.js`)
   - Funções auxiliares
   - Validações

3. **Criar componentes** (`NewComponent.jsx`)
   - UI que consome hooks
   - Testes visuais

4. **Modificar arquivos existentes** (`App.jsx`, `constants.js`)
   - Integração final
   - Rotas e configurações

5. **Testar fluxo completo**
   - End-to-end
   - Edge cases

---

## 📈 Estimativas

### Tempo de Implementação:
- **Hooks:** ~30-45 min
- **Components:** ~20-30 min
- **Modifications:** ~10-15 min
- **Testing:** ~15-20 min
- **Total:** ~1.5-2 horas

### Complexidade por Arquivo:
- `useNewHook.js`: ⭐⭐⭐ (média-alta)
- `NewComponent.jsx`: ⭐⭐ (média)
- `newHelpers.js`: ⭐ (baixa)
- Modificações: ⭐ (baixa)

---

````

### Step 5: Validate with Anti-Patterns Checker (5k tokens)

**Run mental validation:**

**1. ❌ Overengineering?**
- [ ] All files <200 lines
- [ ] No unnecessary abstractions
- [ ] Direct implementation

**2. ❌ Reinventing Wheel?**
- [ ] Using existing utils/hooks where possible
- [ ] Libraries are standard ones

**3. ❌ Missing Documentation?**
- [ ] SPEC has clear structure
- [ ] Line numbers are accurate
- [ ] Examples are provided

**4. ❌ Code Duplication?**
- [ ] Reusing existing code
- [ ] No repeated logic planned

**5. ❌ Monolithic Files?**
- [ ] Files properly separated
- [ ] Single responsibility each
- [ ] Clear boundaries

**If ANY validation fails, revise SPEC before saving.**

---

### Step 6: Save and Close Session

```bash
create_file /mnt/user-data/outputs/SPEC-XXX-[feature-name].md
present_files filepaths=["/mnt/user-data/outputs/SPEC-XXX-[feature-name].md"]
```

**OUTPUT MESSAGE:**
```
✅ SPEC-XXX-[feature-name].md salvo em /mnt/user-data/outputs/

📊 Especificação Técnica:
- Arquivos novos: [count]
- Arquivos modificados: [count]
- Total estimado: ~[lines] linhas
- Dependências: [count] pacotes

✅ Validação Anti-Patterns: PASSED

📈 Contexto usado: ~[X]k tokens
🔄 Sessão encerrada

👉 PRÓXIMO PASSO:
Abra NOVA SESSÃO no Claude Code e execute:

"Implemente /mnt/user-data/outputs/SPEC-XXX-[feature-name].md"

⚠️ IMPORTANTE: Não continue nesta sessão. Abra nova sessão para contexto limpo.
```

---

## Critical Rules

**MUST DO:**
- ✅ ALWAYS start with clean context (new session)
- ✅ ALWAYS load ONLY the PRD (not research)
- ✅ ALWAYS provide exact line numbers
- ✅ ALWAYS separate concerns (UI/Logic/Data)
- ✅ ALWAYS keep files <200 lines
- ✅ ALWAYS include test cases
- ✅ ALWAYS validate against anti-patterns
- ✅ ALWAYS save to /mnt/user-data/outputs/
- ✅ ALWAYS close session after output

**NEVER DO:**
- ⛔ NEVER re-do PRD research
- ⛔ NEVER proceed to CODE in same session
- ⛔ NEVER create files >200 lines
- ⛔ NEVER mix responsibilities in one file
- ⛔ NEVER guess line numbers (always view file)
- ⛔ NEVER skip validation step

---

## Success Criteria

A good SPEC:
- Has exact file paths and line numbers
- Provides complete code structure
- Includes clear test cases
- Respects 200-line limit per file
- Maintains single responsibility
- Passes all anti-pattern checks
- Ready for direct implementation

---

## Example Trigger Responses

**Good Triggers:**
- "Gere spec de /mnt/user-data/outputs/PRD-001-filtro.md"
- "Crie especificação técnica do PRD-005"
- "Transforme PRD-003 em SPEC detalhada"

**Redirect to PRD First:**
- "Crie componente de filtro" → "Primeiro, gere um PRD"
- "Implemente feature X" → "Vamos começar com um PRD"

---

## Common Pitfalls to Avoid

### ❌ Don't Do This:
```markdown
# SPEC Vague
Criar componente novo e modificar App.jsx
```

### ✅ Do This Instead:
```markdown
# SPEC Detalhada

## src/components/NewComponent.jsx (NOVO - 85 linhas)

Linha 1-8: Imports
```javascript
import React from 'react';
import { useHook } from '../hooks/useHook';
```

Linha 10-75: Component implementation
[detailed structure]

## src/App.jsx (MODIFICAR - +3 linhas)

Linha 12: ADICIONAR import
```javascript
import NewComponent from './components/NewComponent';
```

Linha 45: ADICIONAR route
```javascript
<Route path="/novo" element={<NewComponent />} />
```
```

---

**This skill ensures every implementation has a detailed blueprint ready to execute.**