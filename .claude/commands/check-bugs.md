# Checagem de Bugs Potenciais

Analise o código buscando:

## 1. React
- useEffect sem array de dependências
- useEffect com dependências faltando
- setState em componentes desmontados
- Keys duplicadas ou usando index como key

## 2. Async/Await
- Promises sem catch
- async functions sem try/catch
- Race conditions em estados

## 3. Firebase
- Queries sem limit (podem trazer muitos dados)
- onSnapshot sem unsubscribe
- Escritas sem validação prévia

## 4. Lógica de Negócio
- Cálculos monetários sem formatters
- Validações faltando em formulários
- Permissões não verificadas antes de ações

Liste cada problema encontrado com:
- Arquivo e linha
- Descrição do problema
- Sugestão de correção