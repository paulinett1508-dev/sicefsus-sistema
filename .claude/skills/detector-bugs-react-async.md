# Skill: Detector de Bugs React e Async

## Quando Usar
Esta skill é ativada quando o agente precisa identificar bugs potenciais em código React, especialmente relacionados a hooks, lifecycle e operações assíncronas.

## Competência
Detectar padrões de código que frequentemente causam bugs em aplicações React com operações assíncronas.

## Heurísticas de Detecção

### 1. React Hooks

#### useEffect sem dependências
```javascript
// 🔴 BUG: executa infinitamente ou não re-executa
useEffect(() => {
  fetchData();
}); // falta []

// 🟢 CORRETO
useEffect(() => {
  fetchData();
}, []);
```

#### useEffect com dependências faltando
```javascript
// 🔴 BUG: stale closure
useEffect(() => {
  doSomething(value); // value não está nas deps
}, []);

// 🟢 CORRETO
useEffect(() => {
  doSomething(value);
}, [value]);
```

#### setState em componente desmontado
```javascript
// 🔴 BUG: memory leak / warning
useEffect(() => {
  fetchData().then(data => setData(data));
}, []);

// 🟢 CORRETO
useEffect(() => {
  let mounted = true;
  fetchData().then(data => {
    if (mounted) setData(data);
  });
  return () => { mounted = false; };
}, []);
```

#### Keys problemáticas
```javascript
// 🔴 BUG: usando index como key
{items.map((item, index) => <Item key={index} />)}

// 🔴 BUG: keys duplicadas
{items.map(item => <Item key={item.type} />)} // type pode repetir

// 🟢 CORRETO
{items.map(item => <Item key={item.id} />)}
```

### 2. Async/Await

#### Promises sem catch
```javascript
// 🔴 BUG: erro silencioso
fetchData().then(setData);

// 🟢 CORRETO
fetchData().then(setData).catch(handleError);
```

#### async sem try/catch
```javascript
// 🔴 BUG: erro não tratado
const handleSubmit = async () => {
  await saveData(form);
};

// 🟢 CORRETO
const handleSubmit = async () => {
  try {
    await saveData(form);
  } catch (error) {
    showError(error.message);
  }
};
```

#### Race conditions
```javascript
// 🔴 BUG: resposta antiga pode sobrescrever nova
const handleSearch = async (query) => {
  const results = await search(query);
  setResults(results);
};

// 🟢 CORRETO: usar AbortController ou flag
const handleSearch = async (query) => {
  const controller = new AbortController();
  try {
    const results = await search(query, { signal: controller.signal });
    setResults(results);
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
  return () => controller.abort();
};
```

### 3. Firebase Específico

#### onSnapshot sem unsubscribe
```javascript
// 🔴 BUG: memory leak
useEffect(() => {
  onSnapshot(collection(db, 'items'), setItems);
}, []);

// 🟢 CORRETO
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'items'), setItems);
  return () => unsubscribe();
}, []);
```

#### Queries sem limit
```javascript
// 🔴 RISCO: pode trazer milhares de docs
getDocs(collection(db, 'items'));

// 🟢 CORRETO
getDocs(query(collection(db, 'items'), limit(100)));
```

### 4. Lógica de Negócio

- Cálculos monetários sem formatters (precisão de float)
- Validações faltando em formulários
- Permissões não verificadas antes de ações

## Formato de Saída
Para cada bug encontrado:
```
📍 Arquivo: src/components/Example.jsx:42
🔴 Problema: useEffect sem array de dependências
💥 Impacto: Re-render infinito, performance degradada
🟢 Correção: Adicionar [] como segundo parâmetro
```

## Prioridade
- **P0**: Crashes, memory leaks, loops infinitos
- **P1**: Race conditions, dados inconsistentes
- **P2**: Warnings, más práticas
