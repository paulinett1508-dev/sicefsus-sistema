---
name: gerenciar-ambientes-firebase
description: "Verifica, compara e gerencia configurações Firebase dev/prod"
---

# Skill: Gerenciar Ambientes Firebase

## Quando Usar
Esta skill é ativada quando o agente precisa verificar, comparar ou gerenciar configurações de ambientes Firebase (dev/prod).

## Competência
Analisar e gerenciar configurações de ambiente Firebase de forma segura, identificando riscos e garantindo isolamento adequado.

## Heurísticas de Análise

### 1. Identificar Ambiente Atual
- Verificar variáveis `VITE_*` carregadas
- Checar `VITE_APP_ENV` ou equivalente
- Confirmar projeto Firebase conectado
- Exibir indicador visual: 🟢 DEV / 🔴 PROD

### 2. Arquivos de Ambiente
Verificar e comparar:
- `.env` (base)
- `.env.development` (dev)
- `.env.production` (prod)
- `.env.local` (overrides locais)
- `.env.example` (documentação)

### 3. Segurança de Configuração
| Check | Risco | Ação |
|-------|-------|------|
| `.env*` no `.gitignore` | 🔴 Crítico | Adicionar imediatamente |
| Secrets commitados | 🔴 Crítico | Rotacionar e remover do histórico |
| Mesmas credenciais dev/prod | 🟡 Alto | Separar projetos Firebase |
| Sem `.env.example` | 🟢 Baixo | Criar para documentação |

### 4. Firebase Config
Verificar em `firebaseConfig.js`:
- Usa `import.meta.env.VITE_*`?
- Há fallbacks hardcoded?
- Risco de conectar em prod durante dev?

### 5. Consistência entre Ambientes
- Mesmas variáveis definidas em dev e prod?
- Valores de exemplo documentados?
- Logs de debug desabilitados em prod?

### 6. Comparação de Dados (read-only)
Quando solicitado, comparar ambientes:
- Mesmas coleções?
- Mesmos campos nos documentos?
- Quantidade de documentos?

## Regras de Segurança

```
⚠️ NUNCA escrever em prod sem confirmação EXPLÍCITA
⚠️ SEMPRE mostrar qual ambiente está ativo antes de queries
⚠️ Queries em prod DEVEM ter LIMIT
⚠️ Preferir operações read-only
```

## Indicadores Visuais

```
🟢 DEV - pode modificar livremente
🔴 PROD - somente leitura, cuidado máximo
🟡 UNKNOWN - ambiente não identificado, PARAR
```

## Formato de Saída

```markdown
## 🔍 Status do Ambiente

**Ambiente Ativo:** 🟢 DEV / 🔴 PROD
**Projeto Firebase:** projeto-xyz-dev
**Última verificação:** 2025-12-29 10:30

### Arquivos de Ambiente
| Arquivo | Existe | Variáveis |
|---------|--------|-----------|
| .env.development | ✅ | 8 vars |
| .env.production | ✅ | 8 vars |
| .env.local | ❌ | - |

### Checklist de Segurança
- [x] .env* no .gitignore
- [x] Credenciais separadas dev/prod
- [ ] .env.example atualizado
- [x] Logs desabilitados em prod

### ⚠️ Alertas
- Nenhum alerta crítico
```

## Ações Disponíveis

1. **Verificar ambiente atual** - mostrar config ativa
2. **Comparar arquivos .env** - diff entre dev e prod
3. **Auditar segurança** - checklist completo
4. **Query segura** - read-only com LIMIT
5. **Comparar estrutura de dados** - coleções e campos
