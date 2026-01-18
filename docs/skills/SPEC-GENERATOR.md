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
```markdown
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