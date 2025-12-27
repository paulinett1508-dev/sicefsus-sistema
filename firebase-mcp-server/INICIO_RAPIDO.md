# ⚡ Início Rápido - Firebase MCP Server

## 🎯 Configuração em 3 Passos

### 1️⃣ Instalar e Compilar

```bash
cd /home/runner/workspace/firebase-mcp-server
npm install
npm run build
```

### 2️⃣ Configurar Credenciais

Edite o arquivo `.env` e preencha com suas credenciais Firebase:

```bash
# Para cada ambiente (DEV e PROD):
# 1. Acesse: https://console.firebase.google.com
# 2. Vá em Project Settings → Service Accounts
# 3. Clique em "Generate new private key"
# 4. Copie os valores do JSON para o .env
```

**Consulte:** [`CONFIGURAR_ENV.md`](./CONFIGURAR_ENV.md) para detalhes

### 3️⃣ Reiniciar o Claude

A configuração do MCP já está em `.claude/settings.json`:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["/home/runner/workspace/firebase-mcp-server/dist/index.js"]
    }
  }
}
```

**Feche e reabra o Claude Code** para ativar o servidor.

---

## ✅ Verificar Configuração

Execute o script de verificação:

```bash
cd /home/runner/workspace/firebase-mcp-server
./check-config.sh
```

Deve mostrar: **🎉 CONFIGURAÇÃO COMPLETA E VÁLIDA!**

---

## 🧪 Testar

No Claude, digite:

```
Verifique o status do Firebase
```

Deve retornar:
- ✅ Ambiente ativo (dev/prod)
- ✅ Status de conexão
- ✅ Lista de coleções

---

## 🛠️ Ferramentas Disponíveis

Após configurado, você terá acesso a:

| Ferramenta | Descrição |
|------------|-----------|
| `firebase_status` | Ver status e coleções |
| `firebase_switch` | Trocar entre dev/prod |
| `firebase_query` | Buscar documentos |
| `firebase_get` | Obter documento específico |
| `firebase_compare` | Comparar dev vs prod |
| `firebase_backup` | Fazer backup de coleções |
| `firebase_search` | Buscar em múltiplas coleções |

---

## 📚 Documentação Completa

- **[CONFIGURAR_ENV.md](./CONFIGURAR_ENV.md)** - Guia detalhado de credenciais
- **[CONFIGURAR_CLAUDE.md](./CONFIGURAR_CLAUDE.md)** - Guia completo do MCP
- **[README.md](./README.md)** - Documentação geral do projeto

---

## 🆘 Problemas?

### Erro de autenticação?
➜ Verifique o `.env` - consulte `CONFIGURAR_ENV.md`

### MCP não aparece no Claude?
➜ Reinicie o Claude completamente (feche e reabra)

### Ferramentas não funcionam?
➜ Execute `./check-config.sh` para diagnóstico

---

## 📦 Estrutura de Arquivos

```
firebase-mcp-server/
├── src/              # Código TypeScript
├── dist/             # Código compilado (gerado)
├── .env              # Credenciais (NUNCA commitar)
├── .env.example      # Modelo de credenciais
├── check-config.sh   # Script de verificação
├── INICIO_RAPIDO.md  # Este arquivo
├── CONFIGURAR_ENV.md # Guia de credenciais
└── CONFIGURAR_CLAUDE.md  # Guia do MCP
```

---

## 🔒 Segurança

- ✅ `.env` está no `.gitignore`
- ❌ **NUNCA** commite credenciais
- ✅ Use `.env.example` para documentação

---

## 🎉 Pronto!

Agora você pode gerenciar seus ambientes Firebase diretamente pelo Claude!

**Comando de teste:**
```
Liste as emendas do ambiente dev
```

