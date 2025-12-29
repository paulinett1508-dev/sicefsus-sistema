# Pendências Dark Mode - P1/P2

Tarefas pendentes de correção do dark mode identificadas na sessão de 29/12/2025.

---

## TAREFA 1: Contraste de Texto na Tabela de Emendas
**Prioridade:** P1 (afeta legibilidade)
**Arquivo:** `src/components/EmendasTable.jsx` ou `src/components/emenda/EmendasTable.jsx`

### Problema
A tabela de emendas tem textos com cores de baixo contraste no dark mode:
- Coluna EMENDA: numero e data em cinza escuro (#6B7280)
- Coluna PARLAMENTAR: nome acinzentado, pouco legivel
- Coluna OBJETO: subtitulo muito apagado
- Coluna MUNICIPIO/UF: texto principal com pouco contraste
- Coluna VALOR TOTAL: valores monetarios pouco visiveis
- Coluna EXECUCAO: porcentagem e barra de progresso

### Correcao
Substituir cores hardcoded por variaveis CSS tematicas:

| Elemento | Cor atual | Substituir por |
|----------|-----------|----------------|
| Texto principal | #333, #374151 | var(--theme-text) |
| Texto secundario | #666, #6B7280, #9CA3AF | var(--theme-text-secondary) |
| Texto muted | #999, #94A3B8 | var(--theme-text-muted) |
| Datas/codigos | gray-500, gray-600 | var(--theme-text-secondary) |

### Buscar no codigo
```
color: "#333" ou "#374151"
color: "#666" ou "#6B7280"
color: "#999" ou "#9CA3AF"
```

---

## TAREFA 2: Contraste na Tela de Administracao/Usuarios
**Prioridade:** P1 (afeta usabilidade)
**Arquivos:**
- `src/components/Administracao.jsx`
- `src/components/admin/UsersSection.jsx`
- `src/components/admin/UsersTable.jsx`

### Problemas
1. **Faixas superiores com fundo branco**
   - Header "Operacional v2.3.70" com fundo branco/claro
   - Card "13 usuarios cadastrados" com fundo claro
   - Area das abas "Usuarios | Logs" destoa

2. **Badges amarelos muito fortes**
   - Badge "GESTOR" em amarelo (#EAB308) causa fadiga visual
   - Precisa tom mais suave/dourado escuro

3. **Tabela com baixo contraste**
   - Colunas NOME, EMAIL, LOCAL com baixo contraste

### Correcoes
```jsx
// Faixas/Headers
backgroundColor: "#ffffff" → "var(--theme-surface)"

// Badges amarelos
backgroundColor: "#EAB308" → isDark ? "#92710a" : "#EAB308"

// Zebra da tabela
backgroundColor: "#f9fafb" → "var(--theme-surface-secondary)"
```

### Paleta sugerida para badges no dark
- ADMIN: #3B82F6 (manter)
- GESTOR: #EAB308 → #B8860B (dourado escuro)
- OPERADOR: #10B981 (manter)
- ATIVO: #10B981 (manter)
- INATIVO: #EF4444 (manter)

---

## TAREFA 3: Padronizacao Dark Mode em Ferramentas Dev
**Prioridade:** P1 (fora do padrao)
**Arquivos:**
- `src/components/dev/FerramentasDev.jsx`
- `src/components/dev/FerramentasDev.module.css`
- `src/components/dev/tabs/DiagnosticoTab.jsx`
- `src/components/dev/shared/*.jsx`

### Problemas
1. **Header da tabela em roxo/azul claro** (#C4B5FD ou #8B5CF6)
2. **Linhas da tabela com fundo branco**
3. **Input de busca e select com fundo branco**
4. **Botoes de acao em roxo claro**
5. **Linha com highlight inconsistente**

### Correcoes
```jsx
// Header da tabela
backgroundColor: "#C4B5FD" → "var(--theme-surface-secondary)"
// Ou sutil: isDark ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.3)"

// Linhas da tabela
backgroundColor: "white" → "var(--theme-surface)"
// Zebra: index % 2 === 0 ? "var(--theme-surface)" : "var(--theme-surface-secondary)"

// Inputs
backgroundColor: "white" → "var(--theme-input-bg)"
color: "#333" → "var(--theme-text)"
border: "1px solid var(--theme-border)"

// Botoes de acao
backgroundColor: "#C4B5FD" → "var(--primary)"
// Ou: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"
```

### Buscar no codigo
```
backgroundColor: "white", "#fff", "#ffffff"
backgroundColor: "#C4B5FD", "#8B5CF6", "#A78BFA"
backgroundColor: "#f9fafb", "#F8FAFC", "#f3f4f6"
color: "#333", "#374151", "#1f2937"
```

---

## TAREFA 4: Otimizar Layout da Pagina Sobre
**Prioridade:** P2 (melhoria de UX)
**Arquivo:** `src/components/Sobre.jsx`

### Problemas
1. Header muito grande (logo + titulo ocupa espaco excessivo)
2. Cards muito grandes (padding exagerado)
3. Espacamento excessivo (gap entre cards muito grande)
4. Cards de funcionalidades ocupando muito espaco vertical

### Valores Alvo

| Elemento | Antes | Depois |
|----------|-------|--------|
| Header padding | 32px | 16px 24px |
| Card padding | 24px | 16px |
| Grid gap | 24px | 12px |
| Feature card padding | 16px | 10px 12px |
| Titulos de secao | 16-18px | 14px |
| Texto corpo | 14-15px | 13px |
| Icones funcionalidades | 36px | 28px |

### Correcoes CSS
```css
.sobre-header {
  padding: 16px 24px;
  margin-bottom: 16px;
}

.sobre-content {
  gap: 12px;
}

.sobre-card {
  padding: 16px;
  border-radius: 8px;
}

.features-grid {
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.feature-card {
  padding: 10px 12px;
  gap: 10px;
}

.feature-icon {
  width: 28px;
  height: 28px;
}
```

---

## Variaveis CSS de Referencia

```css
/* Superficies */
--theme-surface: #1E293B (dark) / #ffffff (light)
--theme-surface-secondary: #334155 (dark) / #f8fafc (light)

/* Inputs */
--theme-input-bg: #1E293B (dark) / #ffffff (light)
--theme-border: #475569 (dark) / #e2e8f0 (light)

/* Texto */
--theme-text: #F1F5F9 (dark) / #1e293b (light)
--theme-text-secondary: #94A3B8 (dark) / #64748b (light)
--theme-text-muted: #64748B (dark) / #94a3b8 (light)
```

---

## Ordem de Execucao Sugerida
1. Tarefa 1 - EmendasTable (mais usado)
2. Tarefa 2 - Administracao/Usuarios (P1)
3. Tarefa 3 - Ferramentas Dev (P1)
4. Tarefa 4 - Sobre (P2 - menos urgente)

## Apos Correcoes
- Rodar `npm run build` para verificar erros
- Testar visualmente em dark mode e light mode
- Commit das alteracoes
