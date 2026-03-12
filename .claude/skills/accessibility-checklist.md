# Accessibility Checklist — WCAG 2.1 AA

Checklist de acessibilidade para interfaces web.
Baseline obrigatorio: WCAG 2.1 AA. Severidades: CRITICA | ALTA | MEDIA.

Adaptado do agnostic-core (MIT). Fonte: skills/frontend/accessibility.md

---

## CONTRASTE DE CORES

- [ ] [CRITICA] Texto normal (<18pt): contraste minimo 4.5:1
- [ ] [CRITICA] Texto grande (18pt+): contraste minimo 3:1
- [ ] [CRITICA] Componentes de UI (bordas, icones): contraste minimo 3:1
- [ ] [ALTA] Texto sobre imagem/gradiente: verificar em todas as variacoes
- [ ] [ALTA] Dark/light mode: verificar contraste em ambos
- [ ] [MEDIA] Texto desabilitado: nao abaixo de 3:1

Ferramentas: axe DevTools, Colour Contrast Analyser, Chrome DevTools Accessibility.

---

## NAVEGACAO POR TECLADO

- [ ] [CRITICA] Todos os elementos interativos focaveis por Tab
- [ ] [CRITICA] Foco nao fica preso (exceto em modais ativos)
- [ ] [CRITICA] Modais: foco entra ao abrir, fica dentro, retorna ao fechar
- [ ] [CRITICA] Dropdowns: navegaveis com setas, fecham com Esc
- [ ] [ALTA] Indicador de foco visivel — outline nao removido sem substituto
- [ ] [ALTA] Tab order segue ordem logica de leitura
- [ ] [ALTA] Skip link "Pular para conteudo principal"
- [ ] [MEDIA] Atalhos de teclado documentados

---

## ESTRUTURA E SEMANTICA HTML

- [ ] [CRITICA] Um unico `<h1>` por pagina
- [ ] [CRITICA] Hierarquia sem pular niveis (h1 → h2 → h3)
- [ ] [CRITICA] Tags semanticas: `<button>` para acoes, `<a>` para navegacao
- [ ] [CRITICA] Listas usam `<ul>`/`<ol>`/`<li>`
- [ ] [ALTA] Regioes marcadas: `<header>`, `<main>`, `<nav>`, `<footer>`
- [ ] [ALTA] Formularios com `<fieldset>` e `<legend>`
- [ ] [ALTA] Tabelas com `<caption>`, `<th scope>`
- [ ] [ALTA] Idioma declarado no `lang` do `<html>`

---

## TEXTOS ALTERNATIVOS

- [ ] [CRITICA] Imagens informativas: alt descritivo do conteudo
- [ ] [CRITICA] Imagens decorativas: `alt=""` (vazio)
- [ ] [CRITICA] Icones funcionais sem texto: `aria-label`
- [ ] [ALTA] Icones decorativos ao lado de texto: `aria-hidden="true"`
- [ ] [ALTA] SVGs inline informativos: `<title>` e `role="img"`
- [ ] [ALTA] Botoes com icone apenas: `aria-label` obrigatorio

---

## ARIA E ROLES

- [ ] [CRITICA] Nao usar `aria-hidden="true"` em elementos focaveis
- [ ] [CRITICA] `aria-label` ou `aria-labelledby` em controles sem label visivel
- [ ] [ALTA] Estados dinamicos: `aria-expanded`, `aria-selected`, `aria-checked`
- [ ] [ALTA] Atualizacoes dinamicas: `aria-live="polite"` (nao urgente), `aria-live="assertive"` (erros)
- [ ] [ALTA] Loading: `role="status"` ou `aria-busy="true"`
- [ ] [MEDIA] Nao sobrescrever semantica nativa com ARIA desnecessario

---

## FORMULARIOS E VALIDACAO

- [ ] [CRITICA] Todo campo com label via `for/id` — placeholder nao substitui label
- [ ] [CRITICA] Erros associados ao campo via `aria-describedby`
- [ ] [CRITICA] Campos invalidos: `aria-invalid="true"`
- [ ] [ALTA] Erros anunciados ao screen reader apos submit
- [ ] [ALTA] Campos obrigatorios: `aria-required="true"`
- [ ] [MEDIA] Instrucoes de formato antes do campo

---

## MOVIMENTO E ANIMACAO

- [ ] [CRITICA] `@media (prefers-reduced-motion: reduce)` implementado
- [ ] [ALTA] Animacoes essenciais (loading) sobrevivem; decorativas nao
- [ ] [ALTA] Carrosseis com autoplay: pausar no foco/hover
- [ ] [MEDIA] Nenhum conteudo com flash acima de 3Hz

---

## COR COMO UNICO INDICADOR

- [ ] [CRITICA] Status nao depende apenas de cor — usar icone/texto
- [ ] [CRITICA] Links diferenciados do texto por mais que cor
- [ ] [ALTA] Graficos: usar padroes/formas/labels adicionais
- [ ] [ALTA] Obrigatoriedade: asterisco + legenda, nao apenas cor

---

## ZOOM E TEXTO FLEXIVEL

- [ ] [CRITICA] Interface funcional com zoom de 200%
- [ ] [ALTA] Fontes em rem/em, nao px fixo
- [ ] [ALTA] Componentes nao quebram com font-size aumentado

---

## CHECKLIST RAPIDO PRE-ENTREGA

- [ ] axe DevTools: zero issues criticos
- [ ] Navegar toda interface apenas com Tab/Shift+Tab/Enter/Esc/setas
- [ ] Desativar CSS e verificar ordem de conteudo
- [ ] Testar com leitor de tela (NVDA/VoiceOver)
- [ ] Simular daltonismo (Chrome DevTools > Rendering)
- [ ] Verificar contraste em elementos criticos

---

## Contexto SICEFSUS

O projeto usa Material Symbols Outlined para icones (nao emojis).
Padrao de icone: `<span className="material-symbols-outlined" style={{ fontSize, verticalAlign: "middle" }}>icon_name</span>`
Sempre incluir `aria-hidden="true"` em icones decorativos e `aria-label` em icones funcionais.
