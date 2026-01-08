# Tarefas Pendentes para Proxima Sessao

## Concluido - Refatoracao Execucao Orcamentaria (2026-01-08)

### Mudancas Implementadas

1. **Unificacao de Secoes (ExecucaoOrcamentaria.jsx)**
   - Removida secao separada "Despesas Executadas"
   - Tudo agora aparece dentro de "Execucao Orcamentaria"
   - Naturezas virtuais criadas automaticamente das despesas existentes

2. **Sistema de Naturezas Consolidadas**
   - Despesas sem `naturezaId` sao agrupadas por codigo (ex: 339030)
   - Naturezas virtuais tem borda tracejada laranja e badge "Pendente"
   - Botao "Regularizar" para definir valor alocado

3. **Melhorias de Acessibilidade (P0)**
   - NaturezaCard: role="button", tabIndex, aria-expanded
   - NaturezaForm: htmlFor/id nos labels/inputs
   - Feedback de validacao com role="status"

4. **Consistencia Design System (P1)**
   - ~60 cores hardcoded substituidas por variaveis CSS
   - Padronizacao de border-radius, font-size, font-weight

---

## Testes Necessarios

### Testes Manuais Prioritarios

| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Despesas sem natureza | 1. Abrir emenda com despesas antigas (sem naturezaId) | Devem aparecer como naturezas virtuais (borda laranja) |
| Regularizacao | 1. Expandir natureza virtual 2. Clicar "Regularizar" 3. Definir valor | Natureza real criada, despesas vinculadas |
| Valor minimo | Tentar alocar valor menor que total executado | Deve bloquear com mensagem de erro |
| Nova despesa em virtual | Clicar "Nova Despesa" em natureza virtual | Deve pedir para regularizar primeiro |
| Navegacao teclado | Usar Tab/Enter nos cards de natureza | Deve expandir/colapsar corretamente |

### Testes de Integracao

- [ ] Verificar se despesas migradas tem `naturezaId` correto no Firestore
- [ ] Testar com usuario Operador (permissoes limitadas)
- [ ] Testar com usuario Gestor
- [ ] Verificar calculo de saldo apos regularizacao
- [ ] Testar exclusao de natureza (so permitido sem despesas)

### Testes de Regressao

- [ ] Criar nova natureza manualmente ainda funciona
- [ ] Editar natureza existente ainda funciona
- [ ] Adicionar despesa em natureza real ainda funciona
- [ ] Calculos de execucao no header ainda corretos

---

## Melhorias Pendentes

### Prioridade Alta

1. **Migracao em Lote**
   - Botao "Regularizar Todas" para naturezas virtuais
   - Sugerir valor baseado no saldo disponivel

2. **Validacao de Valor**
   - Alertar se valor alocado > saldo livre da emenda
   - Sugerir distribuicao proporcional

### Prioridade Media

1. **UI/UX**
   - Animacao ao expandir/colapsar naturezas virtuais
   - Indicador visual de progresso da regularizacao
   - Tooltip explicando o que e "regularizar"

2. **Performance**
   - Memoizar `naturezasConsolidadas` de forma mais eficiente
   - Lazy loading das despesas ao expandir

### Prioridade Baixa

1. **Dark Mode**
   - Verificar contraste das cores de natureza virtual em dark mode
   - Ajustar cor do badge "Pendente" se necessario

2. **Responsividade**
   - Testar formulario de regularizacao em mobile
   - Ajustar grid de metricas em telas pequenas

---

## Bugs Conhecidos

| Bug | Severidade | Status |
|-----|------------|--------|
| Nenhum identificado ate o momento | - | - |

---

## Anotacoes Tecnicas

### Estrutura de Natureza Virtual
```javascript
{
  id: "virtual_339030",      // Prefixo virtual_
  codigo: "339030",
  descricao: "339030 - MATERIAL DE CONSUMO",
  valorAlocado: 0,           // Sempre 0 (pendente)
  valorExecutado: 15000.00,  // Soma das despesas
  saldoDisponivel: -15000,   // Negativo = precisa alocar
  status: "pendente_regularizacao",
  isVirtual: true,           // Flag identificadora
  despesasVinculadas: [...], // Array de despesas
  quantidadeDespesas: 3
}
```

### Fluxo de Regularizacao
```
1. Usuario expande natureza virtual
2. Clica em "Regularizar Natureza"
3. Define valor (minimo = valorExecutado)
4. Sistema:
   a. Cria documento em colecao `naturezas`
   b. Atualiza cada despesa com `naturezaId`
   c. Recarrega dados
```

---

## Historico

- **2026-01-08**: Unificacao de naturezas + despesas executadas
- **2026-01-07**: Auditoria Firebase completa
- **2026-01-06**: Criacao do arquivo de tarefas pendentes
