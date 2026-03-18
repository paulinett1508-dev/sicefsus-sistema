---
name: auditoria-firebase
description: "Analisa interações com Firebase, performance, segurança e vazamentos"
---

# Skill: Auditoria de Firebase

## Quando Usar
Esta skill é ativada quando o agente precisa analisar interações com Firebase, identificar problemas de performance, segurança ou vazamentos de recursos.

## Competência
Avaliar todas as operações Firebase (queries, escritas, listeners) identificando problemas e sugerindo otimizações.

## Heurísticas de Análise

### 1. Queries (Leitura)
- Listar todas as queries (getDocs, getDoc, onSnapshot)
- Verificar se índices necessários existem em `firestore.indexes.json`
- Identificar queries sem filtro de município (risco de segurança)
- Buscar queries sem `limit()` que podem trazer muitos dados
- Verificar uso de `where()` com operadores adequados

### 2. Escritas
- Listar todos os addDoc, setDoc, updateDoc, deleteDoc
- Verificar se há validação antes da escrita
- Confirmar atualização de campos calculados (saldo, percentual)
- Buscar operações sem tratamento de erro

### 3. Listeners (Real-time)
- Listar todos os onSnapshot
- **CRÍTICO**: Verificar se têm cleanup no useEffect return
- Identificar listeners duplicados (mesmo dado em múltiplos componentes)
- Avaliar se listener é necessário ou se query pontual bastaria

### 4. Regras de Segurança
- Comparar `firestore.rules` com queries do código
- Identificar possíveis falhas de segurança
- Verificar se regras filtram por município/usuário

### 5. Performance
- Identificar N+1 queries (loop com getDoc)
- Sugerir uso de batch operations onde aplicável
- Buscar dados desnecessários sendo carregados

## Padrões de Busca
```javascript
// Listeners sem cleanup
/onSnapshot\([^)]+\)/g  // e verificar se está no useEffect com return

// Queries sem limit
/getDocs\((?!.*limit)/g

// Escritas sem try/catch
/(addDoc|setDoc|updateDoc|deleteDoc)\([^)]+\)(?!.*catch)/g
```

## Formato de Saída
| Tipo | Arquivo | Problema | Impacto | Correção |
|------|---------|----------|---------|----------|
| Query | file.js:42 | Sem limit | Performance | Adicionar `.limit(100)` |
| Listener | hook.js:15 | Sem cleanup | Memory leak | Adicionar unsubscribe |

## Critérios de Prioridade
- **P0**: Memory leaks, falhas de segurança
- **P1**: Performance degradada, queries ineficientes
- **P2**: Otimizações, melhores práticas

> Complemento: `.agnostic-core/skills/database/query-compliance.md`, `schema-design.md`, `.agnostic-core/skills/backend/financial-operations.md` (idempotencia e atomicidade)
