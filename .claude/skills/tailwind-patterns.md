# Tailwind CSS Patterns

Padroes e boas praticas para Tailwind CSS.
Aplicavel ao SICEFSUS (Tailwind-based design system v2.0, fonte Inter).

Adaptado do agnostic-core (MIT). Fonte: skills/frontend/tailwind-patterns.md

---

## DESIGN RESPONSIVO

Abordagem mobile-first (estilos base = mobile, breakpoints adicionam).

| Breakpoint | Largura | Uso |
|------------|---------|-----|
| sm | 640px | telefone landscape |
| md | 768px | tablet |
| lg | 1024px | desktop |
| xl | 1280px | desktop grande |

```jsx
className="text-sm md:text-base lg:text-lg"
```

---

## DARK MODE

Estrategia class-based (recomendado para apps com toggle manual):

```jsx
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
```

Definir cores semanticas facilita dark mode:
```css
:root {
  --color-bg: white;
  --color-text: #1a1a1a;
}
.dark {
  --color-bg: #1a1a1a;
  --color-text: #e5e5e5;
}
```

---

## SISTEMA DE CORES

Niveis de tokens:
- **Primitivos**: cores brutas (`--color-blue-500`)
- **Semanticos**: intencao (`--color-primary`, `--color-danger`)
- **Componente**: especificos (`--color-btn-bg`)

Paleta minima: primary, secondary, accent, neutral, success, warning, danger.

---

## PADROES DE LAYOUT

```jsx
// Flexbox
className="flex items-center justify-between gap-4"

// Grid responsivo
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Grid auto-fit (sem breakpoints)
className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6"

// Stack vertical
className="flex flex-col gap-4"

// Centro absoluto
className="grid place-items-center"
```

---

## TIPOGRAFIA

| Classe | Tamanho | Uso |
|--------|---------|-----|
| text-xs | 12px | labels menores |
| text-sm | 14px | texto secundario |
| text-base | 16px | corpo |
| text-lg | 18px | subtitulos |
| text-xl | 20px | titulos secundarios |
| text-2xl | 24px | subtitulos |
| text-3xl | 30px | titulos |

Nao usar mais de 3-4 tamanhos por pagina.

---

## ANIMACOES

```jsx
// Transicoes suaves
className="transition-colors duration-200 ease-in-out"
className="transition-transform duration-300 hover:scale-105"

// Acessibilidade
className="motion-safe:animate-fade-in motion-reduce:animate-none"
```

---

## QUANDO EXTRAIR COMPONENTE

Regra dos 3 usos:
- 1 uso → inline classes
- 2 usos → considere
- 3 usos → extraia componente React (nao @apply)

---

## ANTI-PATTERNS

- Valores arbitrarios excessivos: `mt-[13px] text-[#3b82f6]` → definir no tema
- `!important` em muitos lugares → problema de especificidade
- `@apply` para tudo → perde utility-first
- Classes dinamicas com template strings → Tailwind nao detecta
  - CORRETO: `const colors = { primary: 'text-blue-500' }`
- Duplicar variantes em muitos elementos → extrair componente
- Misturar Tailwind com CSS custom sem necessidade

---

## Contexto SICEFSUS

- Design System v2.0 com paleta Tailwind (Blue #2563EB, Emerald, Amber, Red)
- Fonte Inter adicionada
- Ver `.claude/docs/DESIGN_SYSTEM.md` para paleta completa
- Icones: Material Symbols Outlined (nao emojis)
