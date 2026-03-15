---
name: detectar-hardcodes
description: "Identifica valores hardcoded que deveriam ser configuráveis"
---

# Skill: Detectar Valores Hardcoded

## Quando Usar
Esta skill é ativada quando o agente precisa identificar valores hardcoded no código que deveriam ser configuráveis ou centralizados.

## Competência
Buscar e classificar valores hardcoded, avaliando risco e sugerindo onde centralizá-los.

## Categorias de Hardcodes

### 1. URLs e Endpoints (🔴 Crítico)
- URLs de API hardcoded (deve vir de .env)
- URLs do Firebase hardcoded
- Links externos fixos
- Webhooks

**Patterns:**
```regex
/(https?:\/\/[^\s"'`]+)/g
/[a-zA-Z0-9-]+\.firebaseapp\.com/g
/[a-zA-Z0-9-]+\.firebasestorage\.app/g
```

### 2. Credenciais e IDs (🔴 Crítico)
- API keys no código
- IDs de projeto Firebase
- Tokens ou secrets
- Client IDs

**Patterns:**
```regex
/apiKey['":\s]+['"][^'"]+['"]/gi
/AIza[0-9A-Za-z-_]{35}/g  # Firebase API key
/['"]\d{12}['"]/g  # AWS account IDs
```

### 3. Valores de Negócio (🟡 Importante)
- Percentuais fixos (taxas, limites)
- Valores monetários fixos
- Datas fixas
- Limites de quantidade

**Patterns:**
```regex
/R\$\s*[\d.,]+/g
/\d+(\.\d+)?%/g
/\d{2}\/\d{2}\/\d{4}/g
```

### 4. Textos (🟢 Menor)
- Mensagens de erro hardcoded
- Labels repetidos em vários lugares
- Nomes de município/UF fixos
- Textos de UI

### 5. Configurações (🟡 Importante)
- Timeouts fixos
- Tamanhos de paginação
- Limites de upload
- Delays de debounce

## Processo de Análise

1. **Scan inicial**
   - Executar patterns de busca
   - Coletar todos os matches

2. **Classificar**
   - Por categoria
   - Por criticidade
   - Por frequência

3. **Contextualizar**
   - É realmente hardcode ou é OK?
   - Onde deveria estar?
   - Qual o risco?

4. **Recomendar destino**
   | Tipo | Destino Recomendado |
   |------|---------------------|
   | URLs | `.env` / environment |
   | Secrets | `.env` (nunca commitar) |
   | Negócio | `config/constants.js` |
   | Textos | `i18n` ou `constants` |
   | Config | `config/settings.js` |

## Formato de Saída

```markdown
## 🔍 Hardcodes Encontrados

### 🔴 Críticos (corrigir imediatamente)
| Arquivo | Linha | Valor | Recomendação |
|---------|-------|-------|--------------|
| firebaseConfig.js | 5 | `AIzaSy...` | Mover para VITE_FIREBASE_API_KEY |

### 🟡 Importantes (planejar correção)
| Arquivo | Linha | Valor | Recomendação |
|---------|-------|-------|--------------|
| DespesaForm.jsx | 42 | `100` (limit) | Mover para constants.js |

### 🟢 Menores (nice to have)
| Arquivo | Linha | Valor | Recomendação |
|---------|-------|-------|--------------|
| Login.jsx | 15 | "Erro ao fazer login" | Centralizar em messages.js |

## 📊 Resumo
- 🔴 Críticos: 3
- 🟡 Importantes: 8
- 🟢 Menores: 15

## 🎯 Ações Recomendadas
1. Criar `.env.example` com variáveis necessárias
2. Criar `src/config/constants.js` para valores de negócio
3. Auditar `.gitignore` para secrets
```

## Exclusões (False Positives)
- URLs em comentários/docs
- IDs de teste em arquivos de teste
- Valores em mocks
- Constantes legítimas (Math.PI, etc)

---

## Processo de Auditoria em 4 Passos (agnostic-core)

### Passo 1 — Varredura automatizada
```bash
# Buscar credenciais
grep -rn "password\|passwd\|secret\|token\|apikey\|api_key" \
  --include="*.js" --include="*.jsx" \
  --exclude-dir=node_modules src/

# Verificar historico git por credenciais expostas
git log --all -p --source | grep -i "api_key\|password\|secret" | head -50

# Verificar .gitignore
cat .gitignore | grep -E "\.env|secrets|credentials"
```

### Passo 2 — Classificar cada ocorrencia
- [ ] Qual categoria? (CRITICO / ALTO / MEDIO / BAIXO)
- [ ] Esta em codigo de producao ou apenas testes?
- [ ] Ja existe variavel de ambiente equivalente?
- [ ] Qual o impacto de expor este valor?

### Passo 3 — Verificar historico git
```bash
# Credenciais ja commitadas (mesmo removidas depois)
git log --all -p --source | grep -i "api_key\|password\|secret\|token" | head -50
```

### Passo 4 — Priorizar correcoes
1. CRITICO em producao → rotacionar credencial, corrigir codigo
2. CRITICO em historico → rotacionar + considerar reescrita
3. ALTO → criar variavel de ambiente antes do proximo deploy
4. MEDIO → criar constante nomeada (`config/constants.js`)
5. BAIXO → planejar para proximo ciclo

---

## Padroes de Correcao

### Credenciais → variaveis de ambiente
```javascript
// ERRADO
const apiKey = "sk-ant-api03-..."

// CORRETO
const apiKey = import.meta.env.VITE_API_KEY
if (!apiKey) throw new Error("VITE_API_KEY nao configurada")
```

### Constantes de negocio → centralizar
```javascript
// ERRADO (espalhado em varios arquivos)
if (items.length > 50) { ... }

// CORRETO (em config/constants.js)
export const MAX_ITEMS_PER_PAGE = 50
```

---

## Skills Relacionadas

- `skills/owasp-checklist.md` — Checklist de seguranca
- `skills/code-inspector-sparc.md` — Auditoria SPARC
