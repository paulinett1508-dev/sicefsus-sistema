---
name: auditoria-design-ui-ux
description: "Avalia aspectos visuais, acessibilidade e consistência de design"
---

# Skill: Auditoria de Design e UI/UX

## Quando Usar
Esta skill é ativada quando o agente precisa avaliar aspectos visuais, acessibilidade ou consistência de design no projeto.

## Competência
Analisar todos os aspectos visuais e de apresentação do SICEFSUS de forma integrada, identificando problemas e sugerindo melhorias.

## Heurísticas de Análise

### 1. Design System & Consistência
- Verificar se componentes seguem `DESIGN_SYSTEM.md` (paleta Tailwind, font Inter)
- Buscar cores hardcoded em inline styles (devem estar em CSS/constants)
- Procurar por tamanhos de fonte inconsistentes
- Validar espaçamentos (padding/margin) seguem escala do design system

### 2. CSS e Estilos
- Identificar classes CSS não utilizadas
- Buscar estilos duplicados ou contraditórios
- Procurar por `!important` que deveriam usar especificidade melhor
- Verificar imports de CSS faltantes

### 3. HTML Semântico (JSX)
- Validar estrutura de headings (h1 → h2 → h3 em ordem)
- Verificar uso correto de `<button>` vs `<div onClick>`
- Procurar `<img>` sem `alt` (acessibilidade)
- Checar labels vinculados a inputs (`htmlFor`)
- Validar ARIA attributes em componentes interativos

### 4. Ícones & Emojis
- Buscar emojis no código que deveriam ser ícones
- Verificar mixtura de emojis + ícones (padronizar)
- Sugerir substituições por `lucide-react` ou Material Symbols

### 5. Responsividade
- Identificar breakpoints Tailwind usados (sm, md, lg, xl)
- Buscar hardcoded pixel widths que deveriam ser flex/grid
- Procurar por media queries custom em CSS

### 6. Tipografia
- Verificar se font "Inter" está carregada
- Validar sizes de texto em escala consistente
- Checar line-height para readability

## Formato de Saída
Para cada problema encontrado:
- 📍 Localização (arquivo:linha)
- 🔴 Problema identificado
- 🟢 Sugestão de correção
- ⚡ Prioridade (P0/P1/P2)

## Critérios de Prioridade
- **P0**: Quebra visual, inacessibilidade crítica
- **P1**: Inconsistência com design system, UX degradada
- **P2**: Melhorias de polish, otimizações

---

## UI/UX Quality Gates (agnostic-core)

5 gates obrigatorios antes de considerar uma interface "pronta":

### Gate 1 — Hierarquia Visual
- [ ] Titulo principal e o elemento mais proeminente
- [ ] Sequencia clara: titulo → subtitulo → conteudo → acoes
- [ ] Elementos secundarios nao competem com conteudo principal
- [ ] Espacamento cria agrupamento logico

### Gate 2 — Feedback de Interacao
- [ ] Todo elemento clicavel tem hover state
- [ ] Botoes com estados: default, hover, active, disabled
- [ ] Acoes destrutivas pedem confirmacao
- [ ] Loading states em operacoes async
- [ ] Transicoes suaves (150-300ms)
- [ ] Validacao de formularios proximo ao campo com erro

### Gate 3 — Apresentacao de Dados
- [ ] Numeros grandes com separadores de milhar
- [ ] Tabelas/listas com ordenacao logica
- [ ] Estados vazios com mensagem util e acao sugerida
- [ ] Valores monetarios com simbolo consistente (R$)
- [ ] Datas no formato do locale do usuario

### Gate 4 — Responsivo e Acessivel
- [ ] Layout funciona de 320px ate 1920px
- [ ] Touch targets minimo 44x44px em mobile
- [ ] Contraste WCAG AA (4.5:1 texto normal)
- [ ] Fontes nao menores que 14px em mobile
- [ ] Sem scroll horizontal
- [ ] Tab order logico e foco visivel

### Gate 5 — Design Emocional
- [ ] Micro-interacoes em acoes importantes
- [ ] Paleta de cores transmite tom correto
- [ ] Tipografia cria personalidade (Inter)
- [ ] Empty states humanizados

**Minimo para entrega:** Gates 1-4. Gate 5 e o diferencial.

---

## WCAG 2.1 AA — Checklist Rapido (agnostic-core)

- [ ] Contraste 4.5:1 (texto normal), 3:1 (texto grande)
- [ ] Todos interativos focaveis por Tab
- [ ] Um `<h1>` por pagina, hierarquia sem pular niveis
- [ ] `alt` em imagens, `aria-label` em icones funcionais
- [ ] `prefers-reduced-motion` implementado
- [ ] Status nao depende apenas de cor

**Ferramentas:** axe DevTools, Chrome Accessibility pane, Colour Contrast Analyser

---

## Skills Relacionadas

- `skills/accessibility-checklist.md` — Checklist WCAG completo
- `skills/css-governance.md` — Governanca CSS anti-Frankenstein
- `skills/tailwind-patterns.md` — Padroes Tailwind
