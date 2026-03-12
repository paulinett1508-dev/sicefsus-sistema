# Testing Guide — Unit, Integration, E2E, TDD

Guia consolidado de testes para o SICEFSUS.
Cobre testes unitarios, integracao, E2E e TDD.

Adaptado do agnostic-core (MIT). Fonte: skills/testing/*.md

---

## PIRAMIDE DE TESTES

```
        /  E2E  \        ← poucos (lentos, frageis, essenciais)
       /----------\
      / Integracao  \     ← alguns (API + banco, contratos)
     /----------------\
    /    Unitarios      \  ← muitos (rapidos, isolados, baratos)
```

---

## TESTES UNITARIOS

### Padrao AAA (Arrange-Act-Assert)
```javascript
describe('formatarMoeda', () => {
  it('deve formatar valor positivo com R$', () => {
    // Arrange
    const valor = 1234.56

    // Act
    const resultado = formatarMoeda(valor)

    // Assert
    expect(resultado).toBe('R$ 1.234,56')
  })
})
```

### Nomenclatura
```
"deve [resultado] quando [condicao]"
✅ "deve retornar zero quando lista vazia"
❌ "funciona corretamente"
```

### Cobertura
- Minimo 80% em logica de negocio
- 100% para: financeiro, autenticacao, validacoes criticas
- Coverage ≠ ausencia de bugs — testar comportamento, nao linhas

### Mocking
- Mockar: dependencias externas (Firebase, APIs)
- NAO mockar: logica de negocio interna
- Restaurar mocks: `afterEach(() => jest.restoreAllMocks())`

### Edge Cases Obrigatorios
- [ ] Input valido (caminho feliz)
- [ ] Input invalido/malformado
- [ ] Valores limite (zero, negativo, vazio, null, undefined)
- [ ] Chamadas concorrentes
- [ ] Cenarios de erro

---

## TESTES DE INTEGRACAO

### Principios
- Testar contrato entre modulos, nao implementacao interna
- Cada suite com estado proprio — sem compartilhar entre suites
- Dados criados e destruidos pelo proprio teste
- Resultado identico a cada execucao

### Para Firebase/Firestore
```javascript
// Usar Firebase Emulator para testes
beforeAll(async () => {
  await connectFirebaseEmulator()
})

afterEach(async () => {
  await clearFirestoreData()
})
```

### Cobrir Obrigatoriamente
- Caminho feliz (status 2xx + corpo correto)
- Sem autenticacao (401)
- Sem permissao (403)
- Campo obrigatorio ausente (400)
- Formato invalido (422)

---

## TESTES E2E

### Quando Usar E2E
- Fluxos criticos de usuario (login, criar emenda, executar despesa)
- Autenticacao/autorizacao
- Operacoes financeiras criticas

### Quando NAO Usar E2E
- Logica de negocio pura (usar unitario)
- Validacao de campos individuais (usar unitario)
- Contratos de API (usar integracao)

### Principios
- Testar comportamento, nao implementacao
- Testes independentes (nao depender de outro teste)
- Seletores resilientes: `data-testid` > classes CSS
- Waits explicitos, nunca `sleep()` fixo
- Focar em caminhos criticos

---

## TDD — Test-Driven Development

### Ciclo Red-Green-Refactor

```
RED    → Escrever teste que falha (comportamento nao implementado)
GREEN  → Implementar codigo MINIMO para passar
REFACTOR → Melhorar sem mudar comportamento
```

**Regra cardinal**: nunca refatorar com teste vermelho.

### Quando Usar TDD
- **Obrigatorio**: logica de negocio complexa, algoritmos, calculos financeiros
- **Opcional**: CRUD simples, controllers, migrations
- **Nao usar**: config de infra, boilerplate, codigo exploratorio

---

## CHECKLIST PRE-MERGE

- [ ] Suite passa sem falhas
- [ ] Cobertura minima atingida
- [ ] Sem testes skipados sem justificativa
- [ ] Sem `console.log` nos testes
- [ ] Testes isolados (nao dependem de ordem)
- [ ] Dados criados/destruidos pelo teste
- [ ] Sem acesso a banco/API de producao

---

## Contexto SICEFSUS

- Framework de testes: Vitest (Vite)
- Firestore: usar emulador local para integracao
- Calculos financeiros: testar com `src/utils/formatters.js` e `src/utils/emendaCalculos.js`
- Validacoes: testar `src/utils/validators.js` e `src/utils/despesaValidators.js`
- Permissoes: testar `src/hooks/usePermissions.js` como admin E operador
