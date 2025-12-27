# 📚 Guia de Comandos Claude - SICEFSUS

Este projeto possui **11 comandos customizados** do Claude para análise, auditoria e manutenção do código.

---

## 🎯 Como Usar os Comandos

No Claude Code, digite `@` seguido do nome do arquivo na pasta `.claude/commands/`.

**Exemplo:**
```
@estrutura
```

Ou mencione o comando diretamente:
```
Faça uma auditoria do sistema
```

---

## 📋 Lista Completa de Comandos

### 1️⃣ **@estrutura** - Mapeamento de Estrutura
**Arquivo:** `estrutura.md`

**O que faz:**
Gera um mapa completo do projeto mostrando:
- ✅ Árvore de arquivos (src/ com 3 níveis)
- ✅ Dependências entre componentes (quem importa quem)
- ✅ Fluxo de dados (Login → Dashboard, CRUD de Emendas/Despesas)
- ✅ Todos os hooks customizados e onde são usados

**Quando usar:**
- Entendendo o projeto pela primeira vez
- Documentando a arquitetura
- Onboarding de novos desenvolvedores

**Resultado:** Documento markdown estruturado

---

### 2️⃣ **@audit** - Auditoria Completa do Sistema
**Arquivo:** `audit.md`

**O que faz:**
Análise completa em 4 áreas:

**1. Estrutura**
- Lista todos os arquivos em `src/`
- Identifica componentes órfãos (não utilizados)
- Verifica imports não utilizados

**2. Consistência**
- Hooks seguem padrão `use*`
- Validadores estão sendo usados nos forms
- Formatters aplicados em valores monetários

**3. Firebase**
- Todas as coleções referenciadas
- Queries sem tratamento de erro
- Listeners sem cleanup

**4. Segurança**
- `console.log` com dados sensíveis
- `.env` no `.gitignore`
- Permissões nos componentes

**Quando usar:**
- Antes de fazer deploy
- Revisões periódicas de código
- Após mudanças grandes

**Resultado:** Relatório detalhado em markdown

---

### 3️⃣ **@fix** - Correção de Problemas
**Arquivo:** `fix.md`

**O que faz:**
Processo estruturado de correção em 4 etapas:

**1. Diagnóstico**
- Identifica causa raiz
- Lista arquivos envolvidos
- Traça fluxo de dados

**2. Solução**
- Descreve correção necessária
- Mostra ANTES/DEPOIS
- Lista efeitos colaterais

**3. Implementação**
- Fornece código corrigido COMPLETO
- Sem fragmentação
- Inclui validações

**4. Teste**
- Como verificar se funcionou
- Casos de borda a testar

**Quando usar:**
- Corrigindo bugs
- Resolvendo problemas complexos
- Refatorações

**Resultado:** Correção completa e testável

---

### 4️⃣ **@review** - Code Review
**Arquivo:** `review.md`

**O que faz:**
Review detalhado com checklist:

**Checklist:**
- Código limpo e legível
- Nomes descritivos
- Responsabilidade única
- Tratamento de erros
- Sem código morto
- Sem console.log de debug
- Imports organizados

**Análise:**
1. **Complexidade:** funções >50 linhas
2. **Duplicação:** código repetido
3. **Performance:** re-renders desnecessários

**Quando usar:**
- Antes de merge/PR
- Review de código de outros devs
- Melhorando qualidade

**Resultado:** Sugestões priorizadas (alta/média/baixa)

---

### 5️⃣ **@check-bugs** - Checagem de Bugs Potenciais
**Arquivo:** `check-bugs.md`

**O que faz:**
Busca bugs comuns em 4 categorias:

**1. React**
- useEffect sem array de dependências
- Dependências faltando
- setState em componentes desmontados
- Keys duplicadas

**2. Async/Await**
- Promises sem catch
- async sem try/catch
- Race conditions

**3. Firebase**
- Queries sem limit
- onSnapshot sem unsubscribe
- Escritas sem validação

**4. Lógica de Negócio**
- Cálculos sem formatters
- Validações faltando
- Permissões não verificadas

**Quando usar:**
- Debugging preventivo
- Antes de deploy
- Após mudanças em hooks/effects

**Resultado:** Lista de problemas com arquivo:linha e correção sugerida

---

### 6️⃣ **@check-env** - Verificação de Ambientes
**Arquivo:** `check-env.md`

**O que faz:**
Analisa configuração Dev/Prod:

**1. Arquivos de Ambiente**
- Variáveis em .env.development
- Variáveis em .env.production
- Diferenças entre eles

**2. Uso no Código**
- Como diferencia dev/prod
- Flags de ambiente
- Logs de debug

**3. Firebase Config**
- Uso de variáveis de ambiente
- Risco de conectar em prod durante dev

**4. Segurança**
- .env* no .gitignore
- Valores sensíveis commitados

**5. Consistência**
- Mesmas variáveis em dev/prod
- .env.example atualizado

**Quando usar:**
- Configurando novos ambientes
- Antes de deploy para produção
- Auditoria de segurança

**Resultado:** Checklist de segurança de ambientes

---

### 7️⃣ **@firebase-check** - Auditoria Firebase
**Arquivo:** `firebase-check.md`

**O que faz:**
Analisa todas as interações com Firebase:

**1. Queries**
- Lista getDocs, getDoc, onSnapshot
- Verifica índices necessários
- Queries sem filtro de município

**2. Escritas**
- addDoc, setDoc, updateDoc, deleteDoc
- Validação antes da escrita
- Atualização de campos calculados

**3. Listeners**
- Lista onSnapshot
- Cleanup no useEffect
- Listeners duplicados

**4. Regras**
- Compara firestore.rules com queries
- Falhas de segurança

**Quando usar:**
- Otimizando performance
- Auditoria de segurança Firebase
- Antes de configurar índices

**Resultado:** Relatório de uso do Firebase

---

### 8️⃣ **@firebase-env** - Gerenciador de Ambiente Firebase
**Arquivo:** `firebase-env.md`

**O que faz:**
Comandos para gerenciar ambientes Firebase:

**Comandos:**
- Verificar ambiente atual (dev/prod)
- Listar coleções
- Comparar ambientes
- Query segura (somente leitura)

**Regras de Segurança:**
- ⚠️ NUNCA escrever em prod sem confirmação
- ⚠️ SEMPRE mostrar ambiente ativo
- ⚠️ Queries em prod devem ter LIMIT

**Indicadores:**
- 🟢 DEV - pode modificar
- 🔴 PROD - somente leitura

**Quando usar:**
- Comparando dev e prod
- Verificando dados em produção
- Debugando problemas específicos

**Resultado:** Operações seguras no Firebase

---

### 9️⃣ **@check-hardcodes** - Verificação de Hardcodes
**Arquivo:** `check-hardcodes.md`

**O que faz:**
Busca valores hardcoded em 5 categorias:

**1. URLs e Endpoints**
- URLs de API hardcoded
- URLs do Firebase
- Links externos

**2. Credenciais e IDs**
- API keys
- IDs de projeto
- Tokens/secrets

**3. Valores de Negócio**
- Percentuais fixos
- Valores monetários
- Datas/limites

**4. Textos**
- Mensagens de erro
- Labels repetidos
- Nomes fixos

**5. Configurações**
- Timeouts
- Tamanhos de paginação
- Limites de upload

**Padrões buscados:**
- URLs: `/(https?:\/\/[^\s"']+)/g`
- Firebase IDs: `/[a-zA-Z0-9-]+\.firebaseapp\.com/g`
- Valores monetários: `/R\$\s*[\d.,]+/g`
- Percentuais: `/\d+(\.\d+)?%/g`

**Quando usar:**
- Refatorando para usar configs
- Tornando código mais flexível
- Preparando para multi-tenant

**Resultado:** Lista de hardcodes com sugestões de variáveis/constantes

---

### 🔟 **@audit-css** - Auditoria de CSS/Estilos
**Arquivo:** `audit-css.md`

**O que faz:**
Analisa padronização de estilos em 5 áreas:

**1. Cores**
- Lista TODAS as cores usadas
- Cores similares que deveriam ser iguais
- Variáveis CSS vs hardcoded
- Mapeamento: cor → onde é usada

**2. Tipografia**
- font-family usadas
- font-size (devem seguir escala)
- font-weight consistente
- line-heights padronizados

**3. Espaçamentos**
- Valores de margin/padding
- Escala (4, 8, 12, 16, 24, 32...)
- Gaps consistentes

**4. Bordas e Sombras**
- border-radius padronizados
- box-shadow consistentes
- border-color na paleta

**5. Variáveis CSS**
- Definidas em :root?
- Sendo usadas ou hardcoded?
- Sugerir variáveis faltantes

**Quando usar:**
- Criando design system
- Padronizando UI
- Refatorando estilos

**Resultado:** Arquivo `DESIGN_SYSTEM.md` com paleta e padrões

---

### 1️⃣1️⃣ **@audit-html** - Auditoria de HTML/JSX
**Arquivo:** `audit-html.md`

**O que faz:**
Verifica consistência de componentes em 5 áreas:

**1. Estrutura de Páginas**
- Headers consistentes
- Breadcrumbs padronizados
- Footers uniformes
- Espaçamentos entre seções

**2. Componentes de UI**
- Botões: estilo por ação
- Inputs: labels uniformes
- Tabelas: padding consistente
- Cards: bordas/sombras padronizadas
- Modais: tamanhos uniformes

**3. Formulários**
- Labels sempre no mesmo lugar
- Campos obrigatórios marcados igualmente
- Mensagens de erro consistentes
- Botões alinhados

**4. Responsividade**
- Breakpoints consistentes
- Colapso uniforme

**5. Acessibilidade**
- Inputs com labels
- Imagens com alt
- Botões com aria-labels

**Quando usar:**
- Padronizando interface
- Melhorando UX
- Auditoria de acessibilidade

**Resultado:** Relatório com ✅/⚠️/💡 para cada seção

---

## 🎯 Comandos por Categoria

### 🔍 Análise e Documentação
- `@estrutura` - Mapear arquitetura
- `@review` - Code review

### 🛡️ Segurança e Qualidade
- `@audit` - Auditoria completa
- `@check-bugs` - Bugs potenciais
- `@check-env` - Segurança de ambientes
- `@check-hardcodes` - Valores hardcoded

### 🔧 Manutenção e Correção
- `@fix` - Corrigir problemas

### 🔥 Firebase
- `@firebase-check` - Auditoria Firebase
- `@firebase-env` - Gerenciar ambientes

### 🎨 Design e UI
- `@audit-css` - Padronização de estilos
- `@audit-html` - Consistência de componentes

---

## 💡 Dicas de Uso

### Fluxo Recomendado

**1. Início de Projeto:**
```
@estrutura  → entender arquitetura
```

**2. Desenvolvimento:**
```
@review → revisar código novo
@check-bugs → prevenir problemas
```

**3. Antes de Deploy:**
```
@audit → auditoria completa
@check-env → verificar ambientes
@firebase-check → otimizar Firebase
```

**4. Melhorias:**
```
@audit-css → padronizar estilos
@audit-html → consistência de UI
@check-hardcodes → refatorar configs
```

**5. Problemas:**
```
@fix → corrigir com metodologia
```

**6. Firebase:**
```
@firebase-env → gerenciar ambientes
@firebase-check → auditoria de queries
```

---

## 📍 Localização dos Comandos

```
/home/runner/workspace/.claude/commands/
├── estrutura.md          # Mapeamento de estrutura
├── audit.md              # Auditoria completa
├── fix.md                # Correção de problemas
├── review.md             # Code review
├── check-bugs.md         # Bugs potenciais
├── check-env.md          # Verificação de ambientes
├── firebase-check.md     # Auditoria Firebase
├── firebase-env.md       # Gerenciador Firebase
├── check-hardcodes.md    # Valores hardcoded
├── audit-css.md          # Auditoria de CSS
└── audit-html.md         # Auditoria de HTML/JSX
```

---

## 🚀 Exemplos Práticos

### Entender o projeto
```
@estrutura
```

### Antes de commitar
```
@review src/components/EmendaForm/
@check-bugs
```

### Antes de deploy
```
@audit
@check-env
@firebase-check
```

### Melhorar UI
```
@audit-css
@audit-html
```

### Debugar problema
```
@fix
# Descreva o problema e o Claude seguirá o processo estruturado
```

### Verificar Firebase
```
@firebase-env
# Compare dev vs prod
```

---

## 📝 Criando Novos Comandos

Para criar um novo comando:

1. Crie arquivo `.claude/commands/seu-comando.md`
2. Use formato markdown com instruções claras
3. Defina seções com `##`
4. Especifique resultado esperado

**Exemplo:**
```markdown
# Seu Comando

Descrição do que faz

## 1. Primeira Etapa
- Item 1
- Item 2

## 2. Segunda Etapa
- Item 1
- Item 2

Resultado esperado: formato do output
```

---

## 🎁 Benefícios

✅ **Padronização:** Todos seguem mesmo processo  
✅ **Velocidade:** Comandos prontos para usar  
✅ **Qualidade:** Checklists garantem nada esquecido  
✅ **Documentação:** Gera documentos automaticamente  
✅ **Onboarding:** Novos devs entendem rápido  
✅ **Segurança:** Auditorias periódicas automatizadas  

---

**🎉 Use os comandos e mantenha o código sempre organizado e seguro!**

