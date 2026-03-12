# Skill: Code Review

## Quando Usar
Esta skill é ativada quando o agente precisa revisar código para qualidade, identificar melhorias e garantir boas práticas.

## Competência
Revisar código de forma crítica mas construtiva, identificando problemas e sugerindo melhorias priorizadas.

## Checklist de Review

### Qualidade de Código
- [ ] Código limpo e legível
- [ ] Nomes de variáveis descritivos
- [ ] Funções com responsabilidade única
- [ ] Tratamento de erros adequado
- [ ] Sem código comentado/morto
- [ ] Sem console.log de debug
- [ ] Imports organizados e sem duplicatas

### Estrutura
- [ ] Componentes não muito grandes (<300 linhas)
- [ ] Funções não muito longas (<50 linhas)
- [ ] Níveis de indentação razoáveis (<4)
- [ ] Separação de concerns adequada

### React Específico
- [ ] Hooks seguem as regras (ordem, deps)
- [ ] Keys únicas e estáveis em listas
- [ ] Memoização onde necessário (useMemo, useCallback)
- [ ] Props drilling excessivo? (usar context)
- [ ] Estados locais vs globais bem definidos

### Performance
- [ ] Re-renders desnecessários
- [ ] Cálculos pesados sem memoização
- [ ] Lazy loading onde aplicável
- [ ] Queries otimizadas

### Segurança
- [ ] Inputs sanitizados
- [ ] Permissões verificadas
- [ ] Dados sensíveis protegidos
- [ ] XSS prevenido

## Métricas de Análise

### Complexidade
- Funções muito longas (>50 linhas): refatorar
- Muitos parâmetros (>4): usar objeto
- Aninhamento profundo (>4 níveis): extrair funções
- Complexidade ciclomática alta: simplificar

### Duplicação
- Código repetido em múltiplos lugares
- Padrões que poderiam ser abstraídos
- Lógica similar com pequenas variações

### Acoplamento
- Dependências excessivas entre módulos
- Componentes que sabem demais sobre outros
- Estado compartilhado desnecessariamente

## Formato de Feedback

### Por Arquivo
```markdown
## 📄 src/components/Example.jsx

### 🔴 Crítico (bloqueia merge)
- **Linha 42**: Memory leak - useEffect sem cleanup
  ```jsx
  // Sugestão de correção
  ```

### 🟡 Importante (deve corrigir)
- **Linha 78**: Função muito longa (89 linhas)
  - Extrair `handleValidation()` e `handleSubmit()`

### 🟢 Sugestão (nice to have)
- **Linha 15**: Imports poderiam ser agrupados
```

### Resumo Final
```markdown
## 📊 Resumo do Review

| Severidade | Quantidade |
|------------|------------|
| 🔴 Crítico | 2 |
| 🟡 Importante | 5 |
| 🟢 Sugestão | 8 |

### Top 3 Prioridades
1. Corrigir memory leak em useEffect
2. Adicionar tratamento de erro no submit
3. Extrair lógica de validação
```

## Prefixos de Feedback

Usar prefixos para clareza e prioridade:

| Prefixo | Significado | Acao |
|---------|-------------|------|
| **BLOCKER** | Impede merge. Seguranca, crash, perda de dados | Corrigir obrigatoriamente |
| **SUGESTAO** | Melhoria concreta de qualidade | Considerar fortemente |
| **NITPICK** | Estilo, convencao, polish | Opcional |
| **PERGUNTA** | Nao entendi a intencao | Esclarecer antes de aprovar |
| **ELOGIO** | Codigo bem feito, boa decisao | Reconhecer bom trabalho |

---

## 5 Areas de Avaliacao (agnostic-core)

### 1. Corretude
- Codigo cumpre os requisitos?
- Edge cases tratados?
- Error handling correto?
- Logica sem falhas?

### 2. Seguranca
- Inputs validados?
- Dados sensiveis protegidos?
- Permissoes verificadas?
- Dependencias auditadas?

### 3. Qualidade
- Funcoes single-purpose?
- Codigo nao duplicado (DRY)?
- Nomenclatura clara?
- Comentarios nao-obvios?
- Tech debt rastreado?

### 4. Testes
- Features novas testadas?
- Assertions legiveis?
- Mocks usados apropriadamente?

### 5. Performance
- Operacoes desnecessarias evitadas?
- Cache considerado?
- Queries otimizadas?

---

## Princípios
- Ser específico e actionable
- Explicar o "porquê" além do "o quê"
- Reconhecer o que está bom
- Priorizar feedback por impacto
- Oferecer soluções, não só críticas
- Citar localizacao exata (arquivo:linha)
- Propor solucao, nao apenas apontar problema

---

## Skills Relacionadas

- `skills/code-inspector-sparc.md` — Auditoria SPARC completa
- `skills/pre-implementation.md` — Verificacao pre-codigo
- `skills/react-performance.md` — Otimizacao React
