---
name: css-governance
description: "Checkpoint anti-Frankenstein CSS antes de abrir PR"
---

# CSS Governance — Checkpoint Anti-Frankenstein

Checklist para evitar CSS Frankenstein antes de abrir PR com mudancas de estilo.
Use como auto-revisao rapida ou criterio de aprovacao em code review.

CSS Frankenstein: codigo que duplica o existente, usa valores magicos, viola convencoes de escopo.

Adaptado do agnostic-core (MIT). Fonte: skills/frontend/anti-frankenstein.md + css-governance.md

---

## 5 PERGUNTAS ANTES DE COMMITAR

### 1. Ja existe CSS para isso?
- [ ] Busquei no projeto antes de criar qualquer coisa nova
- [ ] Nao existe duplicata (seletor, animacao, variavel)

### 2. Estou editando o arquivo correto?
- [ ] Global/tokens → arquivo de variaveis globais
- [ ] Componente especifico → arquivo CSS do componente
- [ ] Nao criei arquivo novo quando deveria editar um existente

### 3. Estou usando tokens de design?
- [ ] Cores: `var(--color-*)` — sem `#hex` ou `rgb()` diretamente
- [ ] Espacamento: `var(--space-*)` — sem `px` magico
- [ ] Fontes: `var(--font-family-*)` — sem `font-family` literal
- [ ] Sombras, bordas, transicoes: via variaveis do projeto

### 4. O escopo esta correto?
- [ ] CSS de componente tem prefixo ou escopo adequado
- [ ] Seletores genericos (`h1`, `button`) nao vazam para fora do modulo
- [ ] Sem `!important` (exceto override documentado de lib)

### 5. Tem justificativa para arquivo novo?
- [ ] Arquivo novo so se: novo modulo, nova pagina, ou volume > 50 linhas
- [ ] Nome em kebab-case
- [ ] Comentario no topo (proposito, dependencias)

---

## SINAIS DE ALERTA EM CODE REVIEW

Se qualquer item aparecer no diff, investigar:

| Padrao | Problema |
|--------|----------|
| `style=""` ou `style={{` | inline style em HTML/JSX |
| `#[0-9a-fA-F]{3,8}` | cor hardcoded sem var() |
| `rgba?(` | cor hardcoded sem var() |
| `@keyframes` | verificar se ja existe globalmente |
| `!important` | especificidade ou override indevido |
| `font-family:` | verificar se usa token |

---

## REGRAS FUNDAMENTAIS

1. **Buscar antes de criar**: grep por seletor existente
2. **Cores via variaveis**: `var(--nome-do-token)`, nunca hex/rgb direto
3. **Sem duplicar animacoes**: verificar `@keyframes` globais
4. **Sem inline styles**: exceto em elementos criados via JS
5. **Sem duplicar seletores**: reutilizar ou usar BEM modifiers
6. **Escopo em SPA**: prefixos para componentes dinamicos

---

## EXCECOES VALIDAS

- `style={{}}` em elementos criados 100% via JavaScript
- `!important` documentado para override de lib (ex: react-datepicker)
- Arquivo CSS novo com justificativa clara e volume suficiente

---

## Contexto SICEFSUS

O projeto usa classes CSS utilitarias (Tailwind-based) + CSS custom em `src/styles/`.
Design System v2.0 com tokens definidos em `App.css`.
Sempre verificar `src/App.css` e `src/styles/` antes de criar novas variaveis.
