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
