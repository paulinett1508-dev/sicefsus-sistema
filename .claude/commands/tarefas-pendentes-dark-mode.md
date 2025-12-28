# Tarefas Pendentes - Dark Mode

Execute estas tarefas na proxima sessao para completar a implementacao de dark mode.

## Status Atual (28/12/2025)

**P0 CONCLUIDO:**
- App.css: variaveis CSS em tabelas, forms, fieldsets, scrollbars
- Login.jsx: useTheme implementado, estilos dinamicos

**Commit:** `25d97e6` - "fix: implementar dark mode em App.css e Login.jsx (P0)"

---

## PENDENTE P1 (Alta Prioridade)

### 1. DespesasTable.jsx
- Importar `useTheme` do ThemeContext
- Substituir `color: "#333"` por `isDark ? "var(--theme-text)" : "#333"`
- Substituir `color: "#666"` por `isDark ? "var(--theme-text-secondary)" : "#666"`
- Linhas criticas: 809, 935, 953, 989, 1081, 1096, 1115

### 2. AdminPanel.jsx
- 20+ ocorrencias de cores fixas (#333, #666)
- Formularios e filtros com fundos brancos
- Aplicar mesmo padrao de useTheme

### 3. FluxoEmenda.jsx
- Modal com fundo branco fixo
- Cores fixas nas linhas 433, 478, 540, 548, 557, 584, 650

### 4. Componentes DespesaForm*.jsx
- DespesaForm.jsx
- DespesaFormBasicFields.jsx
- DespesaFormDateFields.jsx
- DespesaFormEmpenhoFields.jsx
- Todos com `color: "#333"` e backgrounds brancos

---

## PENDENTE P2 (Media Prioridade)

- ErrorBoundary.jsx (linha 135)
- CNPJInput.jsx (linha 205)
- MunicipioSelector.jsx
- App.jsx (linhas 665, 687)
- DebugUsuarios.jsx (linha 131)

---

## Template de Correcao

```javascript
import { useTheme } from "../context/ThemeContext";

const Component = () => {
  const { isDark } = useTheme();

  const styles = {
    label: { color: isDark ? "var(--theme-text)" : "#333" },
    subtitle: { color: isDark ? "var(--theme-text-secondary)" : "#666" },
    container: {
      backgroundColor: isDark ? "var(--theme-surface)" : "white",
      border: `1px solid ${isDark ? "var(--theme-border)" : "#e0e0e0"}`,
    },
    input: {
      backgroundColor: isDark ? "var(--theme-input-bg)" : "white",
      color: isDark ? "var(--theme-text)" : "inherit",
    },
  };
};
```

---

## Variaveis CSS Disponiveis

```css
var(--theme-bg)                  /* Fundo geral */
var(--theme-surface)             /* Cards, modais */
var(--theme-surface-secondary)   /* Fundos secundarios */
var(--theme-input-bg)            /* Inputs */
var(--theme-text)                /* Texto principal */
var(--theme-text-secondary)      /* Texto secundario */
var(--theme-text-muted)          /* Texto desabilitado */
var(--theme-border)              /* Bordas */
```

---

## Verificacao Final

```bash
grep -rn "color.*#333" src/components/ --include="*.jsx"
grep -rn "color.*#666" src/components/ --include="*.jsx"
grep -rn "background.*white" src/components/ --include="*.jsx"
```

---

**Estimativa:** 8-10 horas para P1 + P2