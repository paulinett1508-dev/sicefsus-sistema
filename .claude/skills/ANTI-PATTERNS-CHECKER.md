---
name: anti-patterns-checker
description: "Valida código e arquitetura contra 5 anti-patterns críticos"
---

# Anti-Patterns Checker Skill

## Purpose
Validate code/architecture against the 5 critical anti-patterns that distinguish senior from high-senior developers.

## When to Use
This skill should be invoked:
- **During PRD generation** (validate proposed architecture)
- **During SPEC generation** (validate technical design)
- **Before CODE implementation** (final validation)
- **On user request:** "Valide contra anti-patterns", "Rode anti-patterns check"

## The 5 Anti-Patterns

### 1. ❌ OVERENGINEERING
**Question:** "Será que tem uma forma mais simples de fazer?"

**What to Check:**
- [ ] Solution uses <3 external dependencies?
- [ ] No unnecessary abstractions or design patterns?
- [ ] A junior developer could understand and maintain this?
- [ ] Direct implementation without excessive layers?

**Red Flags:**
- Complex design patterns for simple CRUD operations
- Multiple layers of abstraction (repositories, services, adapters) for basic features
- Custom solutions when standard approaches exist
- "Future-proofing" for scenarios that may never happen
- Framework within a framework

**Good Example:**
```javascript
// ✅ SIMPLE - Direct implementation
const fetchData = async (id) => {
  const doc = await getDoc(doc(db, 'items', id));
  return doc.data();
};
```

**Bad Example:**
```javascript
// ❌ OVERENGINEERED - Unnecessary abstraction
class DataRepository {
  constructor(private adapter: FirebaseAdapter) {}
  
  async fetch(id: string): Promise<IData> {
    const strategy = this.strategyFactory.create('firebase');
    return await strategy.execute(id);
  }
}
```

---

### 2. ❌ REINVENTING THE WHEEL
**Question:** "Será que alguém já fez isso antes?"

**What to Check:**
- [ ] Searched npm/GitHub for existing solutions?
- [ ] Checked if functionality exists in project codebase?
- [ ] Using well-maintained libraries vs DIY?
- [ ] Verified no duplicate implementations?

**Red Flags:**
- Custom date formatting (use `date-fns`)
- Custom form validation (use `react-hook-form`, `zod`)
- Custom HTTP client (use `axios`, native `fetch`)
- Custom state management (use React Context, Zustand)
- Custom CSS framework (use Tailwind, existing styles)

**When DIY is OK:**
- Very simple, project-specific logic (<20 lines)
- Library adds 100kb+ for 5-line functionality
- Security/compliance requirements

**Good Example:**
```javascript
// ✅ USE LIBRARY
import { format } from 'date-fns';
const formatted = format(date, 'dd/MM/yyyy');
```

**Bad Example:**
```javascript
// ❌ REINVENTING - Custom date formatter
const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
```

---

### 3. ❌ MISSING DOCUMENTATION
**Question:** "Tem alguma documentação pra isso?"

**What to Check:**
- [ ] Read official documentation before implementation?
- [ ] Understood how library/API actually works?
- [ ] Found examples in official docs/repos?
- [ ] Consulted Stack Overflow for validated approaches?

**Red Flags:**
- "I think the API works like..." (guessing)
- "Let me try this approach..." (trial without research)
- Implementing based on assumption, not documentation
- Using deprecated methods (didn't read changelog)
- Wrong parameters/patterns (didn't check docs)

**Good Example:**
```javascript
// ✅ FOLLOWS DOCS - Official Firebase pattern
import { query, where, orderBy, limit } from 'firebase/firestore';

const q = query(
  collection(db, 'items'),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc'),
  limit(10)
);
```

**Bad Example:**
```javascript
// ❌ GUESSING - Incorrect Firebase usage
const q = collection(db, 'items')
  .where('status', '==', 'active')  // Wrong chaining
  .orderBy('createdAt')
  .limit(10);
```

**Validation:**
- Link to official docs in PRD/SPEC
- Reference to examples from official repos
- No "experimental" approaches without documentation

---

### 4. ❌ CODE DUPLICATION
**Question:** "Será que esse código já existe no projeto?"

**What to Check:**
- [ ] Searched codebase (Ctrl+Shift+F / grep)?
- [ ] Checked `/utils`, `/hooks`, `/services` for similar logic?
- [ ] Can extract reusable function from duplicated code?
- [ ] Following DRY (Don't Repeat Yourself) principle?

**Red Flags:**
- Same validation logic in multiple files
- Copy-pasted code blocks with minor variations
- Similar formatters scattered across components
- Duplicate API calls with same pattern
- Repeated calculations

**Good Example:**
```javascript
// ✅ DRY - Centralized in utils
// src/utils/formatters.js
export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Used everywhere
import { formatarMoeda } from '../utils/formatters';
const display = formatarMoeda(1500.50);
```

**Bad Example:**
```javascript
// ❌ DUPLICATED - Same logic in 3 files
// ComponenteA.jsx
const formatted = `R$ ${valor.toFixed(2).replace('.', ',')}`;

// ComponenteB.jsx  
const moeda = `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;

// ComponenteC.jsx
const valor_fmt = `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
```

**How to Fix:**
1. Search: `grep -r "similar_pattern" src/`
2. Extract: Create reusable function in `/utils` or `/hooks`
3. Replace: Import and use everywhere
4. Test: Ensure all usages work

---

### 5. ❌ MONOLITHIC FILES
**Question:** "Será que eu deveria separar isso em mais de um arquivo?"

**What to Check:**
- [ ] File is <200 lines?
- [ ] File has single, clear responsibility?
- [ ] Can easily name the file's purpose?
- [ ] No mixed concerns (UI + logic + data)?

**Red Flags:**
- Files >200 lines
- Multiple responsibilities in one file
- Hard to name the file's purpose
- Mixed UI rendering + business logic + data fetching
- "Utils.js" with 50 unrelated functions

**Good Example:**
```
src/
├─ hooks/
│  └─ useEmendaData.js        (120 lines) → Data fetching only
├─ components/
│  └─ EmendaForm.jsx          (150 lines) → UI only
└─ utils/
   ├─ validators.js           (80 lines)  → Validation only
   └─ formatters.js           (60 lines)  → Formatting only
```

**Bad Example:**
```
src/
└─ EmendaPage.jsx             (1329 lines)
   ├─ Data fetching logic
   ├─ Validation logic
   ├─ Formatting logic
   ├─ UI rendering
   ├─ Multiple sub-components
   └─ Business calculations
```

**How to Fix:**
```
BEFORE: EmendaPage.jsx (1329 lines)

AFTER:
├─ hooks/useEmendaData.js     (120 lines) → Extracted data logic
├─ utils/emendaValidators.js  (80 lines)  → Extracted validations
├─ utils/emendaFormatters.js  (60 lines)  → Extracted formatters
├─ components/EmendaForm.jsx  (150 lines) → Main component
├─ components/EmendaHeader.jsx (40 lines) → Sub-component
└─ components/EmendaTable.jsx (90 lines)  → Sub-component
```

---

## Validation Process

### During PRD Phase

Run this check on proposed architecture:
```markdown
🔍 ANTI-PATTERNS VALIDATION (PRD)

1️⃣ Overengineering: [✅ PASS / ❌ FAIL]
   [If fail: "Proposed solution has [X] abstraction layers for simple CRUD. Simplify to direct Firebase calls."]

2️⃣ Reinventing Wheel: [✅ PASS / ❌ FAIL]
   [If fail: "Custom date formatter proposed. Use date-fns library instead."]

3️⃣ Missing Docs: [✅ PASS / ❌ FAIL]
   [If fail: "No documentation links provided. Read Firebase official docs before proceeding."]

4️⃣ Code Duplication: [✅ PASS / ❌ FAIL]
   [If fail: "Similar logic exists in src/utils/validators.js. Reuse instead of recreating."]

5️⃣ Monolithic Files: [✅ PASS / ❌ FAIL]
   [If fail: "Proposed Component.jsx is 350 lines. Split into Component.jsx (UI) + useComponentData.js (logic)."]

---

[If all pass]
✅ ARQUITETURA LIMPA - PRONTA PARA SPEC

[If any fail]
⚠️ AJUSTES NECESSÁRIOS:
- [Specific fix for each failure]

Revise o PRD antes de prosseguir para SPEC.
```

---

### During SPEC Phase

Run this check on file structure:
```markdown
🔍 ANTI-PATTERNS VALIDATION (SPEC)

1️⃣ Overengineering: [✅ PASS / ❌ FAIL]
   Files: [list files]
   [If fail: "File X has unnecessary abstraction Y"]

2️⃣ Reinventing Wheel: [✅ PASS / ❌ FAIL]
   Dependencies: [list]
   [If fail: "Using existing library Z instead of custom solution"]

3️⃣ Missing Docs: [✅ PASS / ❌ FAIL]
   References: [count doc links]
   [If fail: "Add reference to official docs for API X"]

4️⃣ Code Duplication: [✅ PASS / ❌ FAIL]
   Reused code: [list reused functions]
   [If fail: "Function Y duplicates existing src/utils/Z"]

5️⃣ Monolithic Files: [✅ PASS / ❌ FAIL]
   File sizes: [list with line counts]
   [If fail: "File X is 250 lines. Split into X1.js (150) + X2.js (100)"]

---

[If all pass]
✅ SPEC VALIDADA - PRONTA PARA IMPLEMENTAÇÃO

[If any fail]
⚠️ REFATORAÇÃO NECESSÁRIA:
- [Specific refactoring for each failure]

Ajuste a SPEC antes de implementar.
```

---

### During CODE Phase

Run this check before presenting files:
```markdown
🔍 ANTI-PATTERNS VALIDATION (CODE)

1️⃣ Overengineering: [✅ PASS / ❌ FAIL]
   Complexity: [assessment]

2️⃣ Reinventing Wheel: [✅ PASS / ❌ FAIL]
   Libraries used: [list]

3️⃣ Missing Docs: [✅ PASS / ❌ FAIL]
   Implementation matches docs: [yes/no]

4️⃣ Code Duplication: [✅ PASS / ❌ FAIL]
   DRY respected: [yes/no]

5️⃣ Monolithic Files: [✅ PASS / ❌ FAIL]
   Largest file: [X] lines

---

[If all pass]
✅ CÓDIGO LIMPO E PRONTO
👍 Mantível, simples, e segue best practices

[If any fail]
⚠️ CORREÇÕES APLICADAS:
- [List fixes made before presenting]
```

---

## Quick Reference Card
```
╔══════════════════════════════════════════════════════════╗
║           ANTI-PATTERNS QUICK CHECK                      ║
╠══════════════════════════════════════════════════════════╣
║ 1. OVERENGINEERING                                       ║
║    ❓ Can I do this simpler?                             ║
║    ✅ <3 dependencies, junior can maintain               ║
║    ❌ Multiple abstractions, complex patterns            ║
╠══════════════════════════════════════════════════════════╣
║ 2. REINVENTING WHEEL                                     ║
║    ❓ Does this already exist?                           ║
║    ✅ Using standard libraries                           ║
║    ❌ Custom formatters, validators, HTTP clients        ║
╠══════════════════════════════════════════════════════════╣
║ 3. MISSING DOCS                                          ║
║    ❓ Did I read the manual?                             ║
║    ✅ Official docs consulted                            ║
║    ❌ Guessing API behavior                              ║
╠══════════════════════════════════════════════════════════╣
║ 4. CODE DUPLICATION                                      ║
║    ❓ Is this repeated elsewhere?                        ║
║    ✅ DRY, centralized in /utils or /hooks               ║
║    ❌ Copy-pasted logic across files                     ║
╠══════════════════════════════════════════════════════════╣
║ 5. MONOLITHIC FILES                                      ║
║    ❓ Should I split this?                               ║
║    ✅ <200 lines, single responsibility                  ║
║    ❌ >200 lines, mixed concerns                         ║
╚══════════════════════════════════════════════════════════╝
```

## Critical Rules

**When to Run:**
- After generating PRD (before saving)
- After generating SPEC (before saving)
- Before presenting CODE (before files)

**How to Run:**
1. Mentally check each of 5 anti-patterns
2. Document findings
3. If any fail, fix before proceeding
4. Include validation result in output

**Output Format:**
Always include validation section in PRD/SPEC/CODE output:
```markdown
🔍 VALIDAÇÃO ANTI-PATTERNS

1️⃣ Overengineering: ✅ PASS
2️⃣ Reinventing Wheel: ✅ PASS
3️⃣ Missing Docs: ✅ PASS
4️⃣ Code Duplication: ✅ PASS
5️⃣ Monolithic Files: ✅ PASS

✅ Código aprovado em todos os critérios
```

**If Validation Fails:**
- Stop process
- Document specific issues
- Provide concrete fixes
- Re-validate after fixes
- Only proceed when all checks pass

## Success Criteria

Good validation:
- Catches issues early (PRD/SPEC phase)
- Provides specific, actionable feedback
- Prevents technical debt
- Maintains code quality
- Enforces best practices
- Saves refactoring time later

This checker is the guardian of code quality in the PRD→SPEC→CODE workflow.