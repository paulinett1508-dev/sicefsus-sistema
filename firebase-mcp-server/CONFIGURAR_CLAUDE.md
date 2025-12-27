# 🔌 Configuração do MCP Server Firebase no Claude

## 📋 Visão Geral

Este guia explica como configurar o **Firebase MCP Server** para funcionar com o Claude Code, permitindo que o assistente AI gerencie seus ambientes Firebase diretamente.

---

## 🎯 Opções de Configuração

Existem **2 formas** de configurar o MCP Server:

### 1️⃣ Configuração Local (Workspace) - **RECOMENDADO**

Adicione ao arquivo `.claude/settings.json` **no seu projeto**:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["/caminho/absoluto/para/firebase-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

✅ **Vantagens:**
- Configuração específica por projeto
- Não afeta outros projetos
- Fácil de compartilhar (pode commitar no Git)

### 2️⃣ Configuração Global (Sistema)

Adicione ao arquivo `~/.claude.json` **na sua home**:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["/caminho/absoluto/para/firebase-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

✅ **Vantagens:**
- Disponível em todos os projetos
- Configuração única

⚠️ **Desvantagens:**
- Pode causar conflitos entre projetos
- Requer caminhos absolutos

---

## 🛠️ Instalação Passo a Passo

### Passo 1: Build do Servidor

Compile o TypeScript para JavaScript:

```bash
cd /home/runner/workspace/firebase-mcp-server
npm install
npm run build
```

Isso criará a pasta `dist/` com o código compilado.

### Passo 2: Configurar o Claude

**Opção A: Workspace (Recomendado)**

Já configurado em: `.claude/settings.json`

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["/home/runner/workspace/firebase-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

**Opção B: Global**

Edite `~/.claude.json` e adicione a seção `mcpServers`.

### Passo 3: Reiniciar o Claude

Para que as mudanças tenham efeito:

1. Feche completamente o Claude Code
2. Reabra o Claude Code
3. O servidor MCP será iniciado automaticamente

---

## 🧪 Testando a Configuração

Após reiniciar o Claude, teste os comandos:

### 1. Verificar Status

```
Verifique o status do Firebase
```

O Claude deve chamar a ferramenta `firebase_status` e mostrar:
- Ambiente ativo (dev/prod)
- Status de conexão
- Coleções disponíveis

### 2. Listar Ferramentas

Peça ao Claude:

```
Quais ferramentas Firebase você tem disponível?
```

Deve listar:
- `firebase_status` - Ver status das conexões
- `firebase_switch` - Trocar entre dev/prod
- `firebase_query` - Buscar documentos
- `firebase_get` - Obter documento específico
- `firebase_compare` - Comparar ambientes
- `firebase_backup` - Fazer backup
- `firebase_search` - Buscar em múltiplas coleções

---

## ⚙️ Estrutura do Arquivo de Configuração

```json
{
  // ... outras configurações do Claude ...
  
  "mcpServers": {
    "firebase": {                    // Nome do servidor (pode ser qualquer um)
      "command": "node",              // Comando para executar (node, python, etc)
      "args": [                       // Argumentos do comando
        "/caminho/completo/para/dist/index.js"
      ],
      "env": {                        // Variáveis de ambiente (opcional)
        // "DEBUG": "true"           // Exemplo: ativar debug
      },
      "disabled": false               // false = ativo, true = desabilitado
    }
  }
}
```

### Campos Importantes:

| Campo | Descrição | Obrigatório |
|-------|-----------|-------------|
| `command` | Executável (node, python, etc) | ✅ Sim |
| `args` | Array com caminho do script | ✅ Sim |
| `env` | Variáveis de ambiente extras | ❌ Não |
| `disabled` | Desabilitar sem remover config | ❌ Não |

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente Customizadas

Se precisar passar variáveis de ambiente:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["/home/runner/workspace/firebase-mcp-server/dist/index.js"],
      "env": {
        "PORT": "3002",
        "MCP_TRANSPORT": "stdio",
        "DEBUG": "true"
      }
    }
  }
}
```

### Desabilitar Temporariamente

Para desabilitar sem remover a configuração:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["/home/runner/workspace/firebase-mcp-server/dist/index.js"],
      "disabled": true  // ← Apenas mude para true
    }
  }
}
```

### Múltiplos Servidores MCP

Você pode ter vários servidores MCP:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["/path/to/firebase-mcp-server/dist/index.js"]
    },
    "outro-servidor": {
      "command": "python",
      "args": ["/path/to/outro-servidor/main.py"]
    }
  }
}
```

---

## 📍 Caminhos Importantes

### No Workspace Atual

```
/home/runner/workspace/
├── firebase-mcp-server/
│   ├── dist/
│   │   └── index.js          ← Script compilado
│   ├── src/                  ← Código fonte TypeScript
│   ├── .env                  ← Credenciais Firebase
│   ├── .env.example          ← Modelo de credenciais
│   └── package.json
└── .claude/
    └── settings.json         ← Configuração do MCP (workspace)
```

### Global (Sistema)

```
~/.claude.json                ← Configuração do MCP (global)
```

---

## 🆘 Troubleshooting

### Erro: "MCP Server não iniciou"

**Causa:** Caminho incorreto ou build não feito

**Solução:**
```bash
cd /home/runner/workspace/firebase-mcp-server
npm run build
# Verifique se dist/index.js existe
ls -la dist/index.js
```

### Erro: "Module not found"

**Causa:** Dependências não instaladas

**Solução:**
```bash
cd /home/runner/workspace/firebase-mcp-server
npm install
npm run build
```

### Erro: "Firebase authentication failed"

**Causa:** Arquivo `.env` não configurado ou credenciais inválidas

**Solução:**
1. Verifique se `.env` existe e está preenchido
2. Consulte `CONFIGURAR_ENV.md` para instruções
3. Teste as credenciais manualmente:
```bash
npm start
```

### MCP Server não aparece no Claude

**Causa:** Claude não reiniciado ou JSON inválido

**Solução:**
1. Valide o JSON (use um validador online)
2. Feche COMPLETAMENTE o Claude
3. Reabra o Claude
4. Verifique os logs: `~/.claude/logs/`

### Ferramentas não aparecem

**Causa:** Servidor iniciou mas não registrou as ferramentas

**Solução:**
1. Verifique se o servidor está rodando:
```bash
ps aux | grep firebase-mcp-server
```
2. Veja os logs do servidor
3. Teste manualmente:
```bash
node /home/runner/workspace/firebase-mcp-server/dist/index.js
```

---

## ✅ Checklist de Configuração

- [ ] Compilar o servidor: `npm run build`
- [ ] Verificar se `dist/index.js` existe
- [ ] Configurar `.env` com credenciais Firebase
- [ ] Adicionar configuração MCP ao `.claude/settings.json` ou `~/.claude.json`
- [ ] Usar caminho absoluto no `args`
- [ ] Validar sintaxe JSON
- [ ] Reiniciar o Claude completamente
- [ ] Testar comando: "Verifique o status do Firebase"

---

## 📚 Recursos Adicionais

- **Configuração de Credenciais:** Ver `CONFIGURAR_ENV.md`
- **Documentação do MCP:** https://modelcontextprotocol.io
- **Firebase Admin SDK:** https://firebase.google.com/docs/admin/setup

---

## 🔒 Segurança

⚠️ **IMPORTANTE:**

- O arquivo `.env` contém credenciais sensíveis
- **NUNCA** compartilhe ou commite o `.env`
- O `.claude/settings.json` pode ser commitado (não contém credenciais)
- As credenciais são lidas pelo servidor MCP, não pelo Claude diretamente

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `~/.claude/logs/`
2. Teste o servidor manualmente: `npm start`
3. Valide o JSON de configuração
4. Confirme que `.env` está preenchido corretamente

