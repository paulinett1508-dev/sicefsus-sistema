# Firebase MCP Server - SICEFSUS

MCP Server para gerenciar ambientes Firebase Dev e Prod do sistema SICEFSUS.

## 🚀 Instalação

```bash
cd firebase-mcp-server
npm install
npm run build
```

## ⚙️ Configuração

Crie um arquivo `.env` com as credenciais dos dois ambientes:

```env
# Firebase DEV
FIREBASE_DEV_PROJECT_ID=seu-projeto-dev
FIREBASE_DEV_CLIENT_EMAIL=firebase-adminsdk-xxx@seu-projeto-dev.iam.gserviceaccount.com
FIREBASE_DEV_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DEV_DATABASE_URL=https://seu-projeto-dev.firebaseio.com

# Firebase PROD
FIREBASE_PROD_PROJECT_ID=sistema-emendas-1f12b
FIREBASE_PROD_CLIENT_EMAIL=firebase-adminsdk-xxx@sistema-emendas-1f12b.iam.gserviceaccount.com
FIREBASE_PROD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_PROD_DATABASE_URL=https://sistema-emendas-1f12b.firebaseio.com
```

### Obtendo as credenciais:

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Vá em **Project Settings** → **Service Accounts**
3. Clique em **Generate new private key**
4. Use os valores do JSON gerado

## 🔧 Configuração no Claude Code

Adicione ao seu `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["/caminho/para/firebase-mcp-server/dist/index.js"],
      "env": {
        "FIREBASE_DEV_PROJECT_ID": "seu-projeto-dev",
        "FIREBASE_DEV_CLIENT_EMAIL": "...",
        "FIREBASE_DEV_PRIVATE_KEY": "...",
        "FIREBASE_PROD_PROJECT_ID": "sistema-emendas-1f12b",
        "FIREBASE_PROD_CLIENT_EMAIL": "...",
        "FIREBASE_PROD_PRIVATE_KEY": "..."
      }
    }
  }
}
```

## 🛠️ Tools Disponíveis

| Tool | Descrição |
|------|-----------|
| `firebase_status` | Mostra ambiente ativo e status das conexões |
| `firebase_switch` | Troca entre dev e prod (requer confirmação para prod) |
| `firebase_query` | Consulta documentos de uma coleção |
| `firebase_get_document` | Busca documento específico por ID |
| `firebase_compare` | Compara coleção entre dev e prod |
| `firebase_backup` | Exporta coleção para arquivo JSON |
| `firebase_search` | Busca documentos por campo/valor |
| `firebase_collections` | Lista todas as coleções |

## 📖 Exemplos de Uso

### Ver status atual
```
firebase_status
```

### Trocar para produção
```
firebase_switch { "environment": "prod", "confirm": true }
```

### Consultar emendas
```
firebase_query { "collection": "emendas", "limit": 10 }
```

### Buscar por município
```
firebase_search { "collection": "emendas", "field": "municipio", "value": "Fortaleza" }
```

### Comparar dev vs prod
```
firebase_compare { "collection": "despesas" }
```

### Fazer backup
```
firebase_backup { "collection": "emendas", "environment": "prod" }
```

## ⚠️ Segurança

- **DEV** (🟢): Pode modificar livremente
- **PROD** (🔴): Somente leitura recomendada

O servidor sempre mostra um indicador visual do ambiente ativo.

## 📁 Estrutura

```
firebase-mcp-server/
├── src/
│   ├── index.ts          # Entry point
│   ├── types.ts          # TypeScript types
│   ├── constants.ts      # Constantes
│   ├── services/
│   │   └── firebase.ts   # Conexão Firebase
│   ├── schemas/
│   │   └── index.ts      # Zod schemas
│   └── tools/
│       └── index.ts      # MCP tools
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testando

```bash
# Build
npm run build

# Testar com MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## 📝 Licença

Uso interno - SICEFSUS
