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

## Princípios
- Ser específico e actionable
- Explicar o "porquê" além do "o quê"
- Reconhecer o que está bom
- Priorizar feedback por impacto
- Oferecer soluções, não só críticas
