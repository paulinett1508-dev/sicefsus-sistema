# React Performance — Guia de Otimizacao

58 regras em 8 categorias, priorizadas por impacto.
Aplicavel a React + Vite (stack do SICEFSUS).

Adaptado do agnostic-core (MIT). Fonte: skills/frontend/react-performance.md

---

## Quando Aplicar

- Desenvolvimento de novos componentes
- Implementacao de data fetching
- Code review de performance
- Refatoracao de componentes existentes
- Otimizacao de bundle e tempos de carregamento

---

## 1. ELIMINAR WATERFALLS (CRITICAL)

> "Waterfalls sao o maior problema de performance."

- **async-defer**: Nao usar `await` antes de precisar do resultado. Iniciar fetch cedo, consumir depois
- **async-parallel**: Usar `Promise.all()` para operacoes independentes
- **async-suspense**: Suspense boundaries estrategicos para carregar dados em paralelo
- **async-share**: Compartilhar promises entre componentes com `use()` do React

```jsx
// ERRADO — waterfall sequencial
const users = await getUsers()
const posts = await getPosts()

// CORRETO — paralelo
const [users, posts] = await Promise.all([getUsers(), getPosts()])
```

---

## 2. BUNDLE SIZE (CRITICAL)

- **bundle-barrel**: Evitar barrel imports (`import { X } from 'lib'`). Importar diretamente: `import X from 'lib/X'`
  - Exemplo: lucide-react barrel carrega 1.583+ modulos em vez de 3
- **bundle-dynamic**: `React.lazy()` + `Suspense` para componentes pesados
- **bundle-defer**: Bibliotecas nao-criticas (analytics, chat) carregadas apos interacao
- **bundle-preload**: Preload baseado em intencao do usuario (hover/focus)

```jsx
// ERRADO
import { Search, Home, Settings } from 'lucide-react'

// CORRETO
import Search from 'lucide-react/dist/esm/icons/search'
```

---

## 3. CLIENT-SIDE DATA FETCHING (MEDIUM-HIGH)

- **client-swr**: SWR ou React Query para deduplicacao automatica de fetches
- **client-passive**: `{ passive: true }` em event listeners de scroll/touch
- **client-storage**: localStorage com versao — invalidar ao mudar schema

---

## 4. RE-RENDER OPTIMIZATION (MEDIUM)

- **rerender-derive**: Derivar estado durante render, nao em useEffect
- **rerender-defer-read**: Adiar leitura de estado ao ponto de uso
- **rerender-no-memo-simple**: Nao usar useMemo para expressoes simples (x > 0)
- **rerender-extract-defaults**: Extrair defaults estaveis de componentes memoizados
- **rerender-primitive-deps**: Usar valores primitivos como dependencias de hooks
- **rerender-handlers**: Logica de interacao nos handlers, nao em effects
- **rerender-derived-bool**: Assinar booleans derivados, nao objetos inteiros
- **rerender-functional-setState**: `setState(prev => prev + 1)` em vez de `setState(count + 1)`
- **rerender-lazy-init**: `useState(() => expensiveCalc())` em vez de `useState(expensiveCalc())`
- **rerender-transition**: `useTransition` para atualizacoes nao-urgentes
- **rerender-ref**: `useRef` para valores transientes (nao causa re-render)

```jsx
// ERRADO — useEffect para derivar
const [total, setTotal] = useState(0)
useEffect(() => { setTotal(items.reduce((s, i) => s + i.price, 0)) }, [items])

// CORRETO — derivar no render
const total = items.reduce((s, i) => s + i.price, 0)
```

---

## 5. RENDERING PERFORMANCE (MEDIUM)

- **rendering-svg**: Animar wrapper do SVG, nao o SVG em si
- **rendering-content-visibility**: `content-visibility: auto` para listas longas
- **rendering-hoist-static**: JSX estatico fora do componente
- **rendering-ternary**: Ternario explicito em vez de `&&` (evita renderizar `0` ou `""`)
- **rendering-transition**: `useTransition` em vez de loading state manual

---

## 6. JAVASCRIPT PERFORMANCE (LOW-MEDIUM)

- **js-layout-thrashing**: Ler geometria → agrupar → escrever (evitar read-write alternados)
- **js-map-lookup**: `Map` para lookups repetidos (O(1) vs O(n) do array.find)
- **js-cache-prop**: Cachear acesso a propriedades em loops
- **js-combine-iterations**: Combinar iteracoes de array (`map` + `filter` = 1 `reduce`)
- **js-early-return**: Retornos antecipados para evitar computacao desnecessaria
- **js-set-lookup**: `Set` para verificacoes de pertencimento
- **js-immutable**: Preferir `toSorted()`, `toReversed()` (nao mutam)

---

## 7. ADVANCED PATTERNS (LOW)

- **advanced-init-once**: Inicializar app uma vez, nao por mount
- **advanced-effect-event**: `useEffectEvent` para callbacks estaveis em effects

---

## Checklist Rapido

- [ ] Sem waterfalls sequenciais (Promise.all para operacoes independentes)
- [ ] Sem barrel imports de bibliotecas grandes
- [ ] Componentes pesados com React.lazy
- [ ] Estados derivados no render, nao em useEffect
- [ ] useMemo/useCallback apenas quando necessario
- [ ] Listas longas com content-visibility ou virtualizacao
- [ ] Event listeners com passive: true em scroll/touch

---

## Skills Relacionadas

- `skills/auditoria-sistema.md` — Analise holistica do codebase
- `skills/code-review.md` — Revisao de qualidade
- `skills/detector-bugs-react-async.md` — Bugs em hooks e async
