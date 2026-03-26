# SICEFSUS — Design System v3.0

## Atualizado em: 26/03/2026

---

## REGRA FUNDAMENTAL

> **A paleta do SICEFSUS e azul marinho e seus tons. Nao usar verde, laranja ou outras cores de destaque fora da escala azul. Cores de status (success, warning, error) sao excecoes restritas a indicadores semanticos — nunca para identidade visual, decoracao ou destaque.**

---

## 1. Paleta de Cores

### Identidade (Azul Marinho)

| Token | Hex | Uso |
|-------|-----|-----|
| `--navy` | `#1A3A4A` | Headers, sidebar, backgrounds escuros |
| `--navy-dark` | `#0F2634` | Backgrounds muito escuros, footer |
| `--navy-deep` | `#0D2B38` | Gradientes hero/cover |

### Acao (Azul Vibrante)

| Token | Hex | Uso |
|-------|-----|-----|
| `--action` | `#2563EB` | Botoes primarios, CTAs, links ativos |
| `--action-light` | `#3B82F6` | Hover de botoes, badges de destaque |
| `--action-dark` | `#1D4ED8` | Active state, pressed |
| `--action-bg` | `#DBEAFE` | Background suave de destaque |

### Accent (Azul Claro)

| Token | Hex | Uso |
|-------|-----|-----|
| `--accent` | `#60A5FA` | Destaques sutis, gradientes de texto no hero |
| `--accent-light` | `#93C5FD` | Bordas hover, decoracao suave |
| `--accent-bg` | `#EFF6FF` | Background de checkmarks, highlights |

### Neutros (Escala Slate)

| Token | Hex | Uso |
|-------|-----|-----|
| `--gray-50` | `#F8FAFC` | Background de paginas |
| `--gray-100` | `#F1F5F9` | Background de tabelas alternadas |
| `--gray-200` | `#E2E8F0` | Bordas padrao |
| `--gray-300` | `#CBD5E1` | Dividers, separadores |
| `--gray-400` | `#94A3B8` | Texto muted/desabilitado |
| `--gray-500` | `#64748B` | Texto secundario |
| `--gray-600` | `#475569` | Texto de corpo |
| `--gray-700` | `#334155` | Texto principal |
| `--gray-800` | `#1E293B` | Texto bold |
| `--gray-900` | `#0F172A` | Preto suave |

### Status (APENAS para indicadores semanticos)

| Token | Hex | Uso RESTRITO |
|-------|-----|-------------|
| `--success` | `#10B981` | Badges "ativo", "aprovado", check icons |
| `--warning` | `#F59E0B` | Badges "pendente", alertas |
| `--error` | `#EF4444` | Badges "erro", botoes de exclusao |
| `--info` | `#0EA5E9` | Badges informativos |

**PROIBIDO:** Usar cores de status como accent, decoracao, bordas de secoes, dividers, gradientes ou elementos de identidade visual.

---

## 2. Tipografia

### Fonte

```
Font family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
Import: https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap
```

### Escala de Tamanhos

| Token | Valor | Px | Uso |
|-------|-------|-----|-----|
| `--font-size-xs` | `0.75rem` | 12px | Labels auxiliares, footnotes |
| `--font-size-sm` | `0.875rem` | 14px | Corpo de tabelas, labels de form |
| `--font-size-base` | `1rem` | 16px | Texto padrao |
| `--font-size-lg` | `1.125rem` | 18px | Subtitulos |
| `--font-size-xl` | `1.25rem` | 20px | Titulos de secao |
| `--font-size-2xl` | `1.5rem` | 24px | Titulos de pagina |
| `--font-size-3xl` | `1.875rem` | 30px | Headings grandes |
| `--font-size-4xl` | `2.25rem` | 36px | Hero headlines |

### Pesos

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-weight-light` | 300 | Subtitulos de hero, texto decorativo |
| `--font-weight-normal` | 400 | Corpo de texto |
| `--font-weight-medium` | 500 | Labels, badges, destaque leve |
| `--font-weight-semibold` | 600 | Headers de tabela, subtitulos |
| `--font-weight-bold` | 700 | Titulos |
| `--font-weight-extrabold` | 800 | Hero titles, logo text |

### Alturas de Linha

| Contexto | Valor |
|----------|-------|
| Titulos compactos | 1.15–1.25 |
| Corpo de texto | 1.5 |
| Texto com espaco | 1.6–1.75 |

### Letter Spacing

| Contexto | Valor |
|----------|-------|
| Headlines grandes | `-0.02em` a `-0.01em` |
| Texto normal | `0` |
| Labels uppercase | `0.04em` a `0.12em` |
| Logo/brand text | `0.04em` a `0.08em` |

---

## 3. Layouts Padrao

### Container

```
Max width: 1200px
Padding lateral: 48px (desktop), 24px (tablet), 16-20px (mobile)
Centralizado: margin: 0 auto
```

### Sidebar + Content

```
Sidebar: 220px (aberta), 64px (colapsada)
Content: flex: 1, overflow auto
Header fixo: height 60px
```

### Grid de Cards

```css
/* 2 colunas desktop, 1 coluna mobile */
display: grid;
grid-template-columns: repeat(2, 1fr);  /* ou repeat(3, 1fr) para 3 cols */
gap: 20px–24px;

@media (max-width: 768px) { grid-template-columns: 1fr; }
```

### Breakpoints

| Nome | Valor | Uso |
|------|-------|-----|
| Mobile | `max-width: 480px` | Telefones |
| Tablet | `max-width: 768px` | Tablets portrait |
| Desktop | `> 768px` | Desktop padrao |

### Header/Topbar Fixo (paginas publicas)

```css
position: sticky;
top: 0;
z-index: 50–100;
background: var(--navy);
padding: 10px–14px 48px;
box-shadow: 0 2px 12px rgba(0,0,0,.25);
```

### Hero/Cover Section

```css
background: var(--navy);  /* ou gradiente navy */
min-height: 280px;
padding: 48px;
text-align: center;
color: white;
/* Elementos decorativos: gradientes radiais com rgba azul, linhas sutis */
```

### Card Padrao

```css
background: white;
border-radius: 12px;  /* --border-radius-lg */
box-shadow: 0 4px 24px rgba(15,40,48,.12);
padding: 24px;
border: 1px solid var(--gray-200);
```

### Footer (paginas publicas)

```css
background: var(--navy-dark);  /* #0D2B38 ou #0F2634 */
padding: 36px 48px 28px;
text-align: center;
/* Sempre incluir: nome do sistema, descricao, copyright, ano */
```

---

## 4. Componentes Padrao

### Botao Primario

```css
background: var(--action);       /* #2563EB */
color: white;
padding: 12px 24px;
border-radius: 8px;
font-size: 14px;
font-weight: 600;
transition: all 0.2s ease;
/* Hover: translateY(-1px), shadow-md */
/* Active: action-dark */
```

### Badge/Tag

```css
font-size: 11px;
font-weight: 600;
letter-spacing: 0.04em–0.12em;
text-transform: uppercase;
padding: 5px 14px;
border-radius: 100px;
/* Background: rgba de azul ou neutro, nunca verde/laranja */
```

### Tabela

```css
border-collapse: collapse;
border-radius: 12px;
box-shadow: var(--shadow);
/* Header: background gray-50, font-size xs, weight semibold, uppercase */
/* Cells: padding 12px, border-bottom gray-200 */
/* Hover row: background gray-50 */
```

### Modal

```css
z-index: 1050;
backdrop: rgba(0,0,0,.5) blur(12px);
border-radius: 12px;
box-shadow: 0 20px 60px rgba(0,0,0,.3);
/* Header: gradiente action -> action-dark, branco */
```

### Input/Form

```css
padding: 12px 16px;
border: 2px solid var(--gray-200);
border-radius: 8px;
font-size: 14px;
/* Focus: border action, shadow 0 0 0 3px rgba(37,99,235,.15) */
```

---

## 5. Icones

```
Biblioteca: Material Symbols Outlined
Import: Google Fonts (Material+Symbols+Outlined)
```

### Tamanhos

| Contexto | Font-size |
|----------|-----------|
| Inline com texto | 14–16px |
| Em titulos | 18–24px |
| Empty states | 48px |

### Padrao de Uso

```jsx
<span
  className="material-symbols-outlined"
  style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}
>
  icon_name
</span>
```

---

## 6. Espacamentos

| Token | Valor | Px |
|-------|-------|-----|
| `--space-1` | `0.25rem` | 4px |
| `--space-2` | `0.5rem` | 8px |
| `--space-3` | `0.75rem` | 12px |
| `--space-4` | `1rem` | 16px |
| `--space-5` | `1.25rem` | 20px |
| `--space-6` | `1.5rem` | 24px |
| `--space-8` | `2rem` | 32px |
| `--space-10` | `2.5rem` | 40px |
| `--space-12` | `3rem` | 48px |

---

## 7. Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.1)` | Elementos sutis |
| `--shadow` | `0 2px 8px rgba(0,0,0,.1)` | Cards, containers |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,.15)` | Hover elevado |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,.2)` | Modais, dropdowns |

---

## 8. Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--border-radius-sm` | 4px | Badges, inputs pequenos |
| `--border-radius` | 6–8px | Botoes, inputs |
| `--border-radius-lg` | 12px | Cards, modais |
| `--border-radius-xl` | 16px | Containers grandes |
| `--border-radius-full` | 9999px | Pills, avatares |

---

## 9. Z-Index

| Camada | Valor |
|--------|-------|
| Dropdown | 1000 |
| Sticky header | 1020 |
| Fixed header | 1030 |
| Modal backdrop | 1040 |
| Modal | 1050 |
| Popover | 1060 |
| Toast | 9999 |

---

## 10. Paginas Publicas (Apresentacoes)

As paginas em `public/apresentacoes/` sao HTML standalone (sem React). Regras especificas:

### Variaveis CSS Locais

```css
:root {
  --navy:         #1A3A4A;
  --navy-dark:    #0F2634;
  --action:       #2563EB;
  --action-light: #DBEAFE;
  --accent:       #60A5FA;
  --bg:           #F8FAFC;
  --text:         #0F172A;
  --muted:        #475569;
  --border:       #E2E8F0;
  --border-light: #F1F5F9;
}
```

### Header Bar

- Fonte: 13px, weight 600, uppercase, letter-spacing .08em
- Cor: rgba(255,255,255,.85)
- Padding compacto: 10px vertical
- Sticky top: 0

### Hero/Cover

- Background: gradiente de tons navy
- Titulo: 38px (desktop), 26px (mobile), weight 700
- Eyebrow: 11px, uppercase, letter-spacing .18em, cor accent/action
- Subtitulo: 16px, weight 300, cor rgba branco 65%
- Badges: background rgba branco 8%, borda rgba branco 15%

### Footer

- Background: navy-dark
- Centralizado, empilhado
- Incluir: nome, descricao, divider, copyright, link

---

## 11. Arquivos CSS do Projeto

| Arquivo | Funcao |
|---------|--------|
| `src/styles/theme.css` | Design system principal, CSS variables |
| `src/App.css` | Estilos globais, tabelas, formularios |
| `src/styles/dashboard.css` | Dashboard, cards de resumo |
| `src/styles/adminStyles.css` | Painel admin, modais |
| `src/styles/relatorios.css` | Relatorios, filtros |
| `src/styles/modalExclusao.css` | Modal de exclusao |

---

## 12. Checklist para Novos Componentes

- [ ] Usa apenas cores da paleta azul (navy/action/accent/neutros)
- [ ] Cores de status apenas para indicadores semanticos
- [ ] Fonte Inter com peso e tamanho da escala
- [ ] Border-radius da escala (4, 6, 8, 12, 16px)
- [ ] Sombras da escala (sm, default, md, lg)
- [ ] Responsivo nos 3 breakpoints (480, 768, desktop)
- [ ] Icones Material Symbols Outlined
- [ ] Alvos de toque minimo 44x44px

---

**Versao:** 3.0
**Data:** 26/03/2026
**Regra de ouro:** Azul marinho e seus tons. Sempre.
