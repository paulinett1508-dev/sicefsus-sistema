---
name: code-implementer
description: "Implementa SPEC aprovada com código limpo seguindo padrões do projeto"
---

# CODE Implementer Skill

## Session Management
**THIS SKILL RUNS IN A FRESH ISOLATED SESSION**

## Purpose
Implement approved SPEC with clean, maintainable code following project standards. Focus ONLY on implementation, not explanation.

## Context Budget
- Maximum tokens: 50,000
- Typical usage: 30-45k tokens
- Output: Actual code files ready to use

## Prerequisites
- SPEC-XXX.md MUST exist in /mnt/user-data/outputs/
- This MUST be a NEW session (clean context)
- SPEC must be approved by user

## When to Use
Trigger when user says:
- "Implemente /mnt/user-data/outputs/SPEC-XXX.md"
- "Execute a implementação da SPEC-XXX"
- "Crie o código da SPEC-XXX"

## Workflow

### Step 1: Load ONLY the SPEC (5k tokens)
````bash
view /mnt/user-data/outputs/SPEC-XXX-[name].md
````

**CRITICAL:**
- Do NOT load PRD
- Do NOT load research
- Do NOT re-do planning
- The SPEC is the SINGLE SOURCE OF TRUTH
- Implement EXACTLY as specified

### Step 2: Load Project Standards (10k tokens)
````bash
view ~/workspace/docs/GUIA_DESENVOLVEDOR.md
view /mnt/project/REGRA__01__Estrutura_de_pastas_
view /mnt/project/REGRA__03__Comportamento_ao_entregar_um_resultado_
````

### Step 3: Implement File by File (25-30k tokens)

**Strategy based on file size:**

#### For NEW FILES (<100 lines):
Create complete file directly:
````bash
create_file ~/workspace/src/[path]/[filename]
````
Write entire content in one go.

#### For NEW FILES (≥100 lines):
Build iteratively:
1. Create with structure + imports
2. Add main logic
3. Add exports
4. Refine and validate
````bash
create_file ~/workspace/src/[path]/[filename]
# [Initial structure]

str_replace path="~/workspace/src/[path]/[filename]" old_str="[section]" new_str="[enhanced section]"
# [Add logic iteratively]
````

#### For MODIFIED FILES (<30 lines changed):
Show BEFORE/AFTER for user to apply via Replit AI Agent:
````markdown
### Arquivo: src/[filename]

**Linha [X]:**
```javascript
// ANTES
[old code]

// DEPOIS
[new code]
```

👉 **Use o Assistente do Replit para aplicar esta mudança**
````

#### For MODIFIED FILES (≥30 lines changed):
Provide COMPLETE corrected file:
````bash
view ~/workspace/src/[existing-file]  # Load current version
create_file ~/workspace/src/[existing-file].new  # Create modified version
# Then copy over original after user confirms
````

OR use str_replace for surgical changes:
````bash
str_replace path="~/workspace/src/[file]" old_str="[exact old code]" new_str="[new code]"
````

### Step 4: Move Final Files to Outputs (2k tokens)
````bash
bash_tool command="cp ~/workspace/src/[implemented-files] /mnt/user-data/outputs/" description="Copy implemented files to outputs for user download"
````

### Step 5: Present Files (1k tokens)
````bash
present_files filepaths=[
  "/mnt/user-data/outputs/file1.js",
  "/mnt/user-data/outputs/file2.jsx"
]
````

## Output Format

### For Small Changes (<30 lines total)
````markdown
✅ Implementado: [feature name]

## Mudanças Realizadas

### 1. src/hooks/useExistingHook.js

**Linha 25:**
```javascript
// ANTES
export const useExistingHook = (param1) => {

// DEPOIS
export const useExistingHook = (param1, param2 = null) => {
```

**Linha 40:**
```javascript
// ANTES
  const q = query(collection(db, 'items'));

// DEPOIS
  let q = query(collection(db, 'items'));
  if (param2) {
    q = query(q, where('field', '==', param2));
  }
```

---

### 2. src/components/Dashboard.jsx

**Linha 10:**
```javascript
// ANTES
import { useExistingHook } from '../hooks/useExistingHook';

// DEPOIS
import { useExistingHook } from '../hooks/useExistingHook';
const [filter, setFilter] = useState(null);
```

---

👉 **Use o Assistente do Replit (ícone ⚡️ ou Ctrl+I) para aplicar essas mudanças**

📊 Contexto usado: ~[X]k tokens
🔄 Sessão encerrada
````

---

### For Complete Files (≥30 lines or new files)
````markdown
✅ Implementação Concluída: [feature name]

## Arquivos Criados/Modificados

### ✨ Novos Arquivos
1. **src/hooks/useNewHook.js** (150 linhas)
2. **src/components/NewComponent.jsx** (80 linhas)

### 🔧 Arquivos Modificados
1. **src/App.jsx** (+5 linhas)
2. **src/config/constants.js** (+10 linhas)

---

## 📦 Dependências

Se houver dependências novas, instale:
```bash
npm install [package-name]@[version]
```

---

## 📁 Arquivos Prontos

[Links de download dos arquivos aparecem aqui]

---

## 🧪 Como Testar

1. Substitua os arquivos no projeto
2. Reinicie o servidor: `npm run dev`
3. Acesse: `http://localhost:5173/[route]`
4. Valide comportamento esperado

---

📊 Contexto usado: ~[X]k tokens
🔄 Sessão encerrada

✅ Implementação completa e pronta para uso
````

## Implementation Guidelines

### Code Quality Standards

**Imports Organization:**
````javascript
// 1. React/Core imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { collection, query, where } from 'firebase/firestore';

// 3. Project imports - absolute
import { db } from '../firebase/firebaseConfig';

// 4. Project imports - relative
import { formatarMoeda } from '../utils/formatters';
import { validarCNPJ } from '../utils/validators';

// 5. Styles (last)
import './Component.css';
````

**Function Organization:**
````javascript
// 1. Component/Hook declaration
export const MyComponent = ({ props }) => {

  // 2. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState();
  
  // 3. Derived values / computed
  const computed = useMemo(() => {}, [deps]);
  
  // 4. Event handlers
  const handleClick = () => {};
  
  // 5. Effects
  useEffect(() => {}, [deps]);
  
  // 6. Render
  return (<div>...</div>);
};

// 7. Helper functions (outside component)
const helperFunction = () => {};

// 8. Exports
export default MyComponent;
````

**Error Handling:**
````javascript
try {
  const result = await operation();
  // Handle success
} catch (error) {
  console.error('Descriptive error:', error);
  // User-friendly error message
  setError('Mensagem amigável para o usuário');
}
````

**Validation Pattern:**
````javascript
// Always validate before operations
if (!validarCNPJ(cnpj)) {
  throw new Error('CNPJ inválido');
}

if (valor > saldoDisponivel) {
  throw new Error('Saldo insuficiente');
}

// Proceed with operation
````

### Naming Conventions

**Files:**
- Components: `PascalCase.jsx` (e.g., `EmendaForm.jsx`)
- Hooks: `camelCase.js` (e.g., `useEmendaData.js`)
- Utils: `camelCase.js` (e.g., `validators.js`)
- Constants: `camelCase.js` (e.g., `constants.js`)

**Variables/Functions:**
- useState: `const [item, setItem] = useState()`
- Handlers: `handleAction`, `handleSubmit`, `handleChange`
- Booleans: `isLoading`, `hasError`, `canEdit`
- Async: `fetchData`, `saveEmenda`, `deleteItem`

**Constants:**
````javascript
// UPPERCASE for true constants
const MAX_ITEMS = 100;

// PascalCase for enums/config objects
export const STATUS_EMENDA = {
  ATIVA: 'ativa',
  INATIVA: 'inativa'
};
````

## Validation Before Presenting

Run final checks:

**1. File Size Check:**
````bash
bash_tool command="wc -l /home/claude/src/[files]" description="Check file sizes"
````
Ensure all files <200 lines.

**2. Imports Check:**
- All imports present
- No unused imports
- Correct paths

**3. Syntax Check:**
- No console.log left behind (except error logging)
- Proper semicolons/formatting
- Consistent style

**4. Anti-Patterns Check:**
- [ ] No overengineering
- [ ] Reused existing code
- [ ] Followed documentation
- [ ] No duplication
- [ ] Files are modular

## Critical Rules

**MUST DO:**
- ✅ ALWAYS start with clean context (new session)
- ✅ ALWAYS load ONLY the SPEC (no PRD/research)
- ✅ ALWAYS follow SPEC exactly
- ✅ ALWAYS use project standards (GUIA_DESENVOLVEDOR)
- ✅ ALWAYS copy files to /mnt/user-data/outputs/
- ✅ ALWAYS present files for download
- ✅ ALWAYS be concise (user has SPEC for context)
- ✅ ALWAYS close session after presenting

**NEVER DO:**
- ⛔ NEVER explain implementation steps (SPEC has it)
- ⛔ NEVER add unrequested features
- ⛔ NEVER create files >200 lines
- ⛔ NEVER mix concerns in one file
- ⛔ NEVER leave console.logs (except errors)
- ⛔ NEVER continue after presenting files

## Special Cases

### Installing Dependencies
If SPEC requires new packages:
````markdown
📦 Instale as dependências:
```bash
npm install [package1] [package2]
```

Justificativa (do PRD):
- [package1]: [why needed]
- [package2]: [why needed]
````

### Database Migrations
If changes affect Firestore structure:
````markdown
⚠️ ATENÇÃO: Migração de Dados Necessária

Esta implementação requer atualização na estrutura do Firestore.

**Antes de usar em PRODUÇÃO:**
1. Backup do banco: [instructions]
2. Execute script de migração: [script]
3. Valide em DEV primeiro

Ver SPEC-XXX.md seção "Migração" para detalhes.
````

### Breaking Changes
If implementation breaks existing functionality:
````markdown
🚨 BREAKING CHANGE

Esta implementação altera:
- [what changed]
- [impact on existing code]

**Ação Necessária:**
- [steps to update existing code]
- [migration path]

Ver SPEC-XXX.md seção "Breaking Changes".
````

## Success Criteria

Good implementation:
- Follows SPEC exactly
- Respects all project standards
- Files are clean and <200 lines
- No console.logs (except error handling)
- Proper error handling
- Clear variable names
- Organized imports
- Ready to use immediately

## Example Output
````markdown
✅ Implementação Concluída: Filtro por Natureza de Despesa

## Arquivos Modificados

### 1. src/hooks/useDespesasData.js
**Linha 15:**
```javascript
// ANTES
export const useDespesasData = (emendaId) => {

// DEPOIS  
export const useDespesasData = (emendaId, naturezaFiltro = null) => {
```

**Linha 30:**
```javascript
// ANTES
const q = query(collection(db, 'despesas'), where('emendaId', '==', emendaId));

// DEPOIS
let q = query(collection(db, 'despesas'), where('emendaId', '==', emendaId));
if (naturezaFiltro) {
  q = query(q, where('naturezaDespesa', '==', naturezaFiltro));
}
```

---

### 2. src/components/Dashboard.jsx
**Linha 10:**
```javascript
// ADICIONAR
import { NATUREZAS_DESPESA } from '../config/constants';
const [naturezaSelecionada, setNaturezaSelecionada] = useState(null);
```

**Linha 15:**
```javascript
// ANTES
const { despesas, loading } = useDespesasData(emendaId);

// DEPOIS
const { despesas, loading } = useDespesasData(emendaId, naturezaSelecionada);
```

**Linha 50:**
```jsx
// ADICIONAR (antes da tabela)
<select 
  value={naturezaSelecionada || ''} 
  onChange={(e) => setNaturezaSelecionada(e.target.value || null)}
  className="filtro-natureza"
>
  <option value="">Todas as Naturezas</option>
  {NATUREZAS_DESPESA.map(n => (
    <option key={n.codigo} value={n.codigo}>
      {n.codigo} - {n.nome}
    </option>
  ))}
</select>
```

---

👉 **Use o Assistente do Replit para aplicar essas mudanças**

📊 Contexto usado: ~35k tokens
🔄 Sessão encerrada

✅ Filtro implementado e pronto para uso
````