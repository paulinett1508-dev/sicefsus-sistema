# Auditoria Visual Completa do Sistema

Analise todos os aspectos visuais e de apresentação do SICEFSUS de forma integrada:

## 1. Design System & Consistência
- Verifique se todos os componentes seguem `DESIGN_SYSTEM.md` (paleta Tailwind, font Inter)
- Busque cores hardcoded em inline styles (devem estar em CSS/constants)
- Procure por tamanhos de fonte inconsistentes
- Valide espaçamentos (padding/margin) seguem escala do design system

## 2. CSS (src/styles/ e inline)
- Liste todos os arquivos CSS no projeto
- Identifique classes CSS não utilizadas em nenhum componente
- Busque estilos duplicados ou contraditórios
- Verifique imports de CSS que faltam em componentes
- Procure por `!important` que deveriam usar especificidade melhor

## 3. HTML Semântico (em JSX)
- Valide estrutura de headings (h1, h2, h3 em ordem correta)
- Verifique uso correto de `<button>` vs `<div onClick>`
- Procure por `<img>` sem `alt` (acessibilidade)
- Cheque labels vinculados a inputs (`htmlFor`)
- Valide ARIA attributes em componentes interativos

## 4. Ícones & Emojis Embutidos em JS
- **Busque emojis no código:** 
  - Patterns: `/([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}])/gu`
  - Context: onde são usados, se consistentes, se devem virar ícones
- Liste todos os emojis encontrados com localização
- Identifique substituições por ícones do `lucide-react` ou icon library usada
- Verifique se há mixtura de emojis + ícones (padronizar)

## 5. Componentes Visuais Críticos
- Procure por `<div style={...}>` com estilo crítico (deveria ser classe CSS)
- Busque `useState` para controlar themes/cores (centralizar em ThemeContext)
- Verifique modais, tooltips, popovers têm acessibilidade (focus trap, ARIA)
- Cheque loading spinners, skeletons, empty states em todos os fluxos

## 6. Responsividade
- Identifique breakpoints Tailwind usados (sm, md, lg, xl)
- Procure por media queries custom em CSS (deveriam usar Tailwind)
- Valide componentes críticos em resoluções mobile/tablet/desktop
- Busque hardcoded pixel widths que deveriam ser 100%, flex, grid

## 7. Tipografia
- Verifique se font "Inter" está carregada em `index.html`
- Procure por outras fontes importadas (consolidar ou documentar)
- Valide sizes de texto estão em escala (12px, 14px, 16px, 18px, 20px, 24px, 32px)
- Cheque line-height consistente para readability

## 8. Cores & Temas
- Mapeie todas as cores usadas no código
- Compare com paleta definida em `DESIGN_SYSTEM.md`
- Procure cores hardcoded (`#FFF`, `rgb(...)`) fora de constants
- Valide contraste de cores para acessibilidade (WCAG AA mínimo)

## 9. Animações & Transições
- Liste todas as animações/transições CSS
- Procure por delays/durations hardcoded (usar tokens)
- Valide performance (não usar transform/opacity onde possível)
- Cheque se `prefers-reduced-motion` é respeitada

## 10. Componentes Órfãos Visualmente
- Identifique componentes criados mas não renderizados
- Busque por exports de componentes visuais não importados
- Procure por estilos CSS de classes que não existem em nenhum JSX

## Padrões para Buscar

```javascript
// Emojis
/([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}])/gu

// Inline styles críticos
/style=\{\s*{[^}]*(?:width|height|color|backgroundColor)[^}]*}/g

// Cores hardcoded
/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsl\([^)]+\))/g

// !important (anti-pattern)
/!important/g

// Tamanhos fixos
/(?:width|height|padding|margin):\s*\d+px/g

// Fontes non-Inter
/font-family:\s*[^;]+(?!Inter)/g
```

## Resultado Esperado
Para cada achado:
- 📍 Arquivo:linha
- 🎨 Elemento visual afetado
- ⚠️ Inconsistência ou problema
- ✅ Sugestão de correção
- 🔗 Referência no DESIGN_SYSTEM.md (se aplicável)

## Checklist de Conclusão
- [ ] Paleta de cores mapeada e validada
- [ ] Nenhum emoji hardcoded (ou documentado para substituir)
- [ ] CSS classes orphãs removidas
- [ ] Inline styles críticos movidos para CSS
- [ ] Tipografia consistente em toda interface
- [ ] Componentes visuais acessíveis (alt, aria, contrast)
- [ ] Responsividade validada em 3+ resoluções
- [ ] Sem `!important` injustificados
- [ ] Animações respeitam `prefers-reduced-motion`
- [ ] Documentado em `DESIGN_SYSTEM.md`
