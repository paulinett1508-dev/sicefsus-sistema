# SICEFSUS - Design System v2.0

## STATUS: ATUALIZADO EM 27/12/2025

**Design System atualizado com nova paleta moderna baseada em Tailwind CSS.**

---

## 1. Sistema ATUAL (theme.css v2.0)

### Paleta de Cores NOVA

```css
:root {
  /* Cores Principais (Modernas) */
  --primary: #2563EB;       /* Azul vibrante */
  --primary-light: #3B82F6;
  --primary-dark: #1D4ED8;

  --accent: #2563EB;        /* Mesmo que primary */
  --accent-light: #60A5FA;
  --accent-dark: #1D4ED8;

  --secondary: #64748B;     /* Slate para elementos secundarios */

  /* Status (Tailwind Colors) */
  --success: #10B981;       /* Emerald */
  --warning: #F59E0B;       /* Amber */
  --error: #EF4444;         /* Red */
  --info: #0EA5E9;          /* Sky */

  /* Neutros (Slate Palette) */
  --white: #ffffff;
  --black: #000000;
  --gray-50: #F8FAFC;
  --gray-100: #F1F5F9;
  --gray-200: #E2E8F0;
  --gray-300: #CBD5E1;
  --gray-400: #94A3B8;
  --gray-500: #64748B;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1E293B;
  --gray-900: #0F172A;

  /* Tema */
  --theme-bg: #F8FAFC;
  --theme-surface: #ffffff;
  --theme-text: #334155;
  --theme-border: #E2E8F0;
}
```

### Tipografia NOVA

```css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Espacamentos Atuais

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
}
```

### Border Radius

```css
:root {
  --border-radius-sm: 4px;
  --border-radius: 6px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  --border-radius-full: 9999px;
}
```

### Sombras

```css
:root {
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.25);
}
```

---

## 2. Proposta de Design (Tailwind-based)

O template HTML fornecido usa Tailwind CSS com a seguinte configuracao:

### Paleta Proposta

```javascript
colors: {
  primary: "#2563EB",          // Azul mais moderno
  "primary-hover": "#1D4ED8",
  "background-light": "#F8FAFC",
  "background-dark": "#0F172A",
  "surface-light": "#FFFFFF",
  "surface-dark": "#1E293B",
  "sidebar-dark": "#0F172A",
  "text-light": "#334155",
  "text-dark": "#F1F5F9",
  "success": "#10B981",        // Verde emerald
  "warning": "#F59E0B",        // Amber
  "danger": "#EF4444",         // Vermelho moderno
}
```

### Tipografia Proposta

```css
font-family: 'Inter', sans-serif;
```

### Comparacao de Cores

| Elemento | Atual | Proposto | Diferenca |
|----------|-------|----------|-----------|
| Primary | #154360 | #2563EB | Mais vibrante |
| Success | #27AE60 | #10B981 | Mais moderno (Emerald) |
| Warning | #F39C12 | #F59E0B | Similar (Amber) |
| Error | #E74C3C | #EF4444 | Mais brilhante |
| Background | #f4f6f8 | #F8FAFC | Quase igual |
| Text | #212529 | #334155 | Mais suave |

---

## 3. Inventario de Estilos no Codigo

### Arquivos CSS (9 arquivos)

| Arquivo | Linhas | Funcao |
|---------|--------|--------|
| `theme.css` | 565 | Design system principal |
| `App.css` | 454 | Estilos globais |
| `dashboard.css` | ~100 | Dashboard especifico |
| `adminStyles.css` | ~110 | Painel admin |
| `relatorios.css` | ~400 | Modulo relatorios |
| `modalExclusao.css` | ~220 | Modal de exclusao |
| `ModalNovaNatureza.css` | ~50 | Modal natureza |
| `shared-styles.css` | ~30 | Estilos compartilhados dev |
| `FerramentasDev.module.css` | ~20 | CSS Module dev |

### Estilos Inline (3538 ocorrencias em 138 arquivos)

A maioria dos componentes usa `const styles = {...}` para estilos inline.
Isso dificulta a padronizacao mas oferece isolamento.

### Cores Hardcoded Mais Usadas

| Cor | Ocorrencias | Uso |
|-----|-------------|-----|
| #154360 | 50+ | Primary (headers, botoes) |
| #4A90E2 | 40+ | Accent (links, destaques) |
| #27AE60 | 30+ | Success |
| #E74C3C | 30+ | Error/Danger |
| #f4f6f8 | 25+ | Background |
| #6c757d | 20+ | Secondary/Muted |
| #fff / #ffffff | 100+ | White |

---

## 4. Problemas Identificados

### 4.1 Cores Duplicadas (Mesma funcao, valores diferentes)

```
Success:
  - #27AE60 (theme.css)
  - #28a745 (App.css btn-success)
  - #2ecc71 (alguns componentes)

Error:
  - #E74C3C (theme.css)
  - #dc3545 (App.css btn-danger)
  - #c0392b (algumas variacoes)

Primary:
  - #154360 (theme.css)
  - #007bff (adminStyles.css)
```

### 4.2 Variaveis CSS Definidas mas Nao Usadas

O `theme.css` define variaveis CSS, mas muitos componentes usam valores hardcoded:

```jsx
// Componente usando hardcoded (MAU)
backgroundColor: "#154360"

// Deveria usar variavel (BOM)
backgroundColor: "var(--primary)"
```

### 4.3 Bordas Inconsistentes

```
border-radius encontrados:
- 4px, 6px, 8px, 10px, 12px, 16px, 20px, 50%
- Recomendado: usar apenas escala definida
```

---

## 5. Recomendacoes de Migracao

### FASE 1: Padronizacao Interna (SEGURO)

**Nao altera visual, apenas organiza codigo:**

1. Substituir cores hardcoded por variaveis CSS existentes
2. Unificar valores duplicados (ex: todos os success usarem #27AE60)
3. Documentar padroes no CLAUDE.md

### FASE 2: Atualizacao Incremental (MODERADO)

**Pode alterar visual levemente:**

1. Atualizar fonte para Inter (mais moderna)
2. Ajustar border-radius para escala consistente
3. Atualizar sombras para mais suaves

### FASE 3: Redesign Completo (ALTO RISCO)

**Altera visual significativamente:**

1. Migrar paleta de cores para Tailwind
2. Adicionar dark mode
3. Redesenhar componentes

---

## 6. Template de Componente Padronizado

Baseado no template HTML fornecido, aqui esta o padrao para novos componentes:

### Card Padrao

```jsx
const CardStyles = {
  container: {
    backgroundColor: 'var(--theme-surface)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'var(--space-5)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--theme-border-light)',
    transition: 'all 0.2s ease',
  },
  containerHover: {
    borderColor: 'var(--accent)',
  }
};
```

### Tabela Padrao

```jsx
const TableStyles = {
  header: {
    backgroundColor: 'var(--gray-50)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: 'var(--space-3) var(--space-4)',
    color: 'var(--gray-500)',
  },
  cell: {
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    borderBottom: '1px solid var(--theme-border-light)',
  },
  rowHover: {
    backgroundColor: 'var(--gray-50)',
    borderLeft: '2px solid var(--accent)',
  }
};
```

### Botao Padrao

```jsx
const ButtonStyles = {
  primary: {
    backgroundColor: 'var(--accent)',
    color: 'var(--white)',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--border-radius)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  primaryHover: {
    backgroundColor: 'var(--accent-dark)',
    transform: 'translateY(-1px)',
    boxShadow: 'var(--shadow-md)',
  }
};
```

---

## 7. Checklist de Seguranca para Alteracoes CSS

Antes de qualquer alteracao de estilo:

- [ ] Backup do arquivo original
- [ ] Testar em DEV primeiro
- [ ] Verificar em Chrome, Firefox, Safari
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Verificar acessibilidade (contraste, tamanho de fonte)
- [ ] Testar como Admin e Operador
- [ ] Validar formularios funcionando
- [ ] Confirmar modais abrindo/fechando
- [ ] Verificar tabelas com dados reais
- [ ] Testar em conexao lenta

---

## 8. Arquivos Criticos - NAO MODIFICAR SEM BACKUP

| Arquivo | Risco | Motivo |
|---------|-------|--------|
| `theme.css` | ALTO | Base de todo sistema |
| `App.css` | ALTO | Estilos globais |
| `Sidebar.jsx` | MEDIO | Navegacao principal |
| `Dashboard.jsx` | MEDIO | Tela inicial |
| `Login.jsx` | MEDIO | Entrada do sistema |
| `EmendaForm/` | ALTO | Formularios complexos |

---

## 9. Mapeamento: Template HTML -> Sistema Atual

### Cores do Template Tailwind

| Tailwind Class | Hex | Variavel CSS Atual |
|----------------|-----|-------------------|
| `bg-primary` | #2563EB | `--accent` (similar: #4A90E2) |
| `text-slate-800` | #1E293B | `--gray-800` (similar: #212529) |
| `text-slate-500` | #64748B | `--gray-500` (similar: #6c757d) |
| `bg-slate-50` | #F8FAFC | `--gray-50` (similar: #f8f9fa) |
| `border-slate-200` | #E2E8F0 | `--gray-200` (similar: #dee2e6) |
| `text-emerald-600` | #059669 | `--success` (similar: #27AE60) |
| `text-red-600` | #DC2626 | `--error` (similar: #E74C3C) |
| `text-orange-600` | #EA580C | `--warning` (similar: #F39C12) |

### Componentes do Template

| Template | Componente Atual | Status |
|----------|-----------------|--------|
| Sidebar | `Sidebar.jsx` | Existente, diferente |
| Header | Inline em `App.jsx` | Existente |
| Cards de estatistica | `Dashboard.jsx` | Existente, diferente |
| Tabela de emendas | `EmendasTable.jsx` | Existente, diferente |
| Paginacao | `Pagination.jsx` | Existente |
| Drawer de filtros | `EmendasFilters.jsx` | Existente, diferente |

---

## 10. Proximos Passos Recomendados

### Imediato (Sem risco)

1. Usar este documento como referencia
2. Criar variaveis CSS para cores ainda hardcoded
3. Documentar padroes para novos desenvolvedores

### Curto prazo (Baixo risco)

1. Unificar cores duplicadas
2. Padronizar border-radius
3. Atualizar fonte para Inter

### Medio prazo (Avaliar necessidade)

1. Migrar estilos inline para CSS Modules
2. Implementar design do template HTML gradualmente
3. Considerar dark mode

---

## 11. Oportunidades de Refatoracao SEGURA

### Analise de Cores Hardcoded vs CSS Variables

| Cor | Valor | Hardcoded | Usando var() | Oportunidade |
|-----|-------|-----------|--------------|--------------|
| Primary | #154360 | 157 ocorrencias | 33 ocorrencias | **124 substituicoes possiveis** |
| Accent | #4A90E2 | 42 ocorrencias | 20 ocorrencias | **22 substituicoes possiveis** |
| Success | #27AE60 | 34 ocorrencias | 17 ocorrencias | **17 substituicoes possiveis** |
| Error | #E74C3C | 35 ocorrencias | 15 ocorrencias | **20 substituicoes possiveis** |
| Background | #f4f6f8 | 8 ocorrencias | 0 ocorrencias | **8 substituicoes possiveis** |

**Total: ~191 substituicoes que NAO alteram visual**

### Arquivos com Mais Hardcodes (Prioridade para Refatoracao)

| Arquivo | Primary | Accent | Success | Error | Total |
|---------|---------|--------|---------|-------|-------|
| `emendaDetailStyles.js` | 8 | 7 | 3 | 2 | 20 |
| `VisualizacaoEmendaDespesas.jsx` | 8 | 7 | 3 | 2 | 20 |
| `DashboardAlertasDetalhados.jsx` | 2 | 0 | 3 | 9 | 14 |
| `adminStyles.css` | 12 | 0 | 0 | 0 | 12 |
| `Sobre.jsx` | 8 | 0 | 0 | 0 | 8 |
| `Emendas.jsx` | 6 | 1 | 0 | 0 | 7 |
| `printUtils.js` | 6 | 0 | 0 | 1 | 7 |
| `SaldoNaturezaWidget.jsx` | 6 | 0 | 0 | 0 | 6 |

### Exemplo de Substituicao Segura

```jsx
// ANTES (hardcoded)
const styles = {
  header: {
    backgroundColor: '#154360',
    color: '#ffffff'
  },
  button: {
    backgroundColor: '#4A90E2'
  },
  successBadge: {
    backgroundColor: '#27AE60'
  },
  errorBadge: {
    backgroundColor: '#E74C3C'
  }
};

// DEPOIS (usando variaveis - MESMO VISUAL)
const styles = {
  header: {
    backgroundColor: 'var(--primary)',
    color: 'var(--white)'
  },
  button: {
    backgroundColor: 'var(--accent)'
  },
  successBadge: {
    backgroundColor: 'var(--success)'
  },
  errorBadge: {
    backgroundColor: 'var(--error)'
  }
};
```

### Beneficios da Substituicao

1. **Zero impacto visual** - As variaveis tem os mesmos valores
2. **Manutencao facilitada** - Mudar uma variavel atualiza todo sistema
3. **Preparacao para dark mode** - Variaveis podem ser sobrescritas
4. **Consistencia garantida** - Evita cores ligeiramente diferentes
5. **Facilita futuras alteracoes** - Um lugar para mudar

### Procedimento de Substituicao Segura

1. Selecionar UM arquivo por vez
2. Fazer backup do arquivo
3. Substituir hardcodes por variaveis
4. Testar visualmente no navegador
5. Confirmar que nada mudou
6. Commitar alteracao
7. Repetir para proximo arquivo

---

## 12. Historico de Alteracoes

### v2.0 - 27/12/2025 (Transformacao Visual)

**Alteracoes Realizadas:**

| Arquivo | Alteracao |
|---------|-----------|
| `theme.css` | Nova paleta de cores, fonte Inter, sombras suaves |
| `index.html` | Preconnect para fonts.googleapis.com, theme-color atualizado |

**Mapeamento de Cores (Antigo -> Novo):**

| Variavel | Valor Antigo | Valor Novo |
|----------|--------------|------------|
| --primary | #154360 | #2563EB |
| --accent | #4A90E2 | #2563EB |
| --success | #27AE60 | #10B981 |
| --warning | #F39C12 | #F59E0B |
| --error | #E74C3C | #EF4444 |
| --info | #17a2b8 | #0EA5E9 |
| --theme-bg | #f4f6f8 | #F8FAFC |
| --theme-text | #212529 | #334155 |
| --font-family | Segoe UI | Inter |

**Novas Classes Adicionadas:**

- `.card-hover` - Cards com efeito hover
- `.badge-*` - Badges modernos (blue, green, red, orange, gray)
- `.status-dot-*` - Indicadores de status
- `.table-compact` - Tabelas compactas estilo template
- `.input-modern` - Inputs com estilo moderno
- `.avatar-*` - Avatares circulares
- `.progress-bar-*` - Barras de progresso
- `.chip` - Tags/chips
- `.divider` - Divisores

**Para Reverter (se necessario):**

Restaurar valores antigos em theme.css:
```css
--primary: #154360;
--accent: #4A90E2;
--success: #27AE60;
--warning: #F39C12;
--error: #E74C3C;
--info: #17a2b8;
--theme-bg: #f4f6f8;
--theme-text: #212529;
--font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
```

---

## 13. Acessibilidade (WCAG AA)

> Regras de acessibilidade para sistema governo/saude. Baseado em WCAG 2.1 AA
> e boas praticas para aplicacoes de setor publico.

### Contraste de Cores

| Elemento | Ratio Minimo | Nota |
|----------|-------------|------|
| Texto normal (< 18px) | 4.5:1 | Contra background |
| Texto grande (>= 18px bold ou >= 24px) | 3:1 | Contra background |
| Elementos graficos (icones, bordas) | 3:1 | Contra background adjacente |
| Componentes interativos (botoes, inputs) | 3:1 | Estado default e hover |

**Verificacao rapida:** Cores do design system v2.0 no background branco:
- `--primary (#2563EB)` sobre branco: 4.6:1 (passa AA)
- `--success (#10B981)` sobre branco: 3.1:1 (passa AA para texto grande, usar `--success-dark` para texto pequeno)
- `--error (#EF4444)` sobre branco: 3.9:1 (usar `--error-dark` para texto pequeno)
- `--warning (#F59E0B)` sobre branco: 2.1:1 (usar APENAS como background com texto escuro)

### Alvos de Toque

- Tamanho minimo: **44x44px** para elementos clicaveis (botoes, links, checkboxes)
- Espacamento minimo entre alvos: **8px**
- Excecao: links inline em texto corrido podem ser menores

### Tipografia Legivel

- Corpo de texto: **minimo 16px** (`--font-size-base`)
- Dados em tabelas: **minimo 14px** (`--font-size-sm`)
- Labels de formulario: **minimo 14px** com `font-weight: medium`
- Nunca usar abaixo de **12px** (`--font-size-xs`) exceto para informacao auxiliar

### Indicadores Visuais

- **Cor nunca como unico indicador**: sempre acompanhar com icone ou texto
  - Bom: `check_circle` verde + "Aprovado"
  - Ruim: apenas bolinha verde sem texto
- **Focus visible**: todos elementos interativos devem ter `outline` visivel ao navegar por teclado
- **Estados de erro**: usar icone `error` + mensagem de texto + borda vermelha (3 indicadores)

### Formularios

- Todo input deve ter `<label>` associado (visivel, nao apenas `aria-label`)
- Mensagens de erro devem aparecer proximo ao campo, nao apenas no topo
- Campos obrigatorios marcados com `*` E com `aria-required="true"`
- Agrupar campos relacionados com `<fieldset>` e `<legend>` quando aplicavel

### Navegacao por Teclado

- Ordem de tab logica (seguir fluxo visual da pagina)
- Modais devem prender foco (focus trap) enquanto abertos
- `Escape` deve fechar modais e dropdowns
- Skip links para conteudo principal (util quando escalar para muitos usuarios)

---

**Documento gerado em:** 27/12/2025
**Versao:** 2.1 (acessibilidade WCAG AA adicionada em 03/03/2026)
**Autor:** Claude Code Audit
