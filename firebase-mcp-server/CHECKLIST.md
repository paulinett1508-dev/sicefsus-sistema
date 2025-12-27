# ✅ Checklist de Configuração do MCP Firebase

## 🎯 Status Atual

Execute o comando abaixo para ver o que já está pronto:

```bash
./check-config.sh
```

---

## 📋 Passo a Passo - Preencha o .env

### ✓ Arquivo .env já foi criado
**Local:** `/home/runner/workspace/firebase-mcp-server/.env`

Agora você precisa **substituir os valores de exemplo** pelas suas credenciais reais.

---

## 🔵 PARTE 1: Configurar Ambiente DEV

### Passo 1.1: Acessar o Firebase Console

- [ ] Abrir: https://console.firebase.google.com
- [ ] Selecionar o projeto de **DESENVOLVIMENTO**

### Passo 1.2: Gerar Service Account Key

- [ ] Clicar no ícone ⚙️ (engrenagem) no topo esquerdo
- [ ] Selecionar **"Project Settings"** (Configurações do projeto)
- [ ] Clicar na aba **"Service Accounts"**
- [ ] Rolar até o final da página
- [ ] Clicar no botão **"Generate new private key"**
- [ ] Confirmar clicando em **"Generate Key"**
- [ ] Arquivo JSON será baixado (ex: `seu-projeto-dev-firebase-adminsdk-xxx.json`)

### Passo 1.3: Extrair Informações do JSON

Abra o arquivo JSON baixado e localize:

```json
{
  "project_id": "...",        ← Copie este valor
  "client_email": "...",      ← Copie este valor
  "private_key": "...",       ← Copie este valor (com aspas e \n)
  ...
}
```

### Passo 1.4: Preencher o .env (DEV)

Edite o arquivo `.env` e substitua:

```bash
# ANTES (valores de exemplo):
FIREBASE_DEV_PROJECT_ID=seu-projeto-dev

# DEPOIS (valores reais do JSON):
FIREBASE_DEV_PROJECT_ID=meu-projeto-real-12345
```

Faça o mesmo para:
- [ ] `FIREBASE_DEV_PROJECT_ID` → campo `project_id`
- [ ] `FIREBASE_DEV_CLIENT_EMAIL` → campo `client_email`
- [ ] `FIREBASE_DEV_PRIVATE_KEY` → campo `private_key` (MANTER as aspas e \n!)

**⚠️ IMPORTANTE:** A `PRIVATE_KEY` deve incluir:
- Aspas duplas no início e fim
- `\n` (quebras de linha literais)
- BEGIN e END completos

**Exemplo correto:**
```bash
FIREBASE_DEV_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n"
```

---

## 🟢 PARTE 2: Configurar Ambiente PROD

### Passo 2.1: Repetir para Produção

- [ ] Voltar ao Firebase Console
- [ ] Selecionar o projeto de **PRODUÇÃO**
- [ ] Repetir passos 1.2 a 1.4 acima
- [ ] Preencher as variáveis `FIREBASE_PROD_*`

---

## 🔍 PARTE 3: Verificar Configuração

### Passo 3.1: Executar Script de Verificação

```bash
cd /home/runner/workspace/firebase-mcp-server
./check-config.sh
```

Deve mostrar:
```
🎉 CONFIGURAÇÃO COMPLETA E VÁLIDA!
✓ Sucessos: 23
⚠ Avisos: 0
✗ Erros: 0
```

### Passo 3.2: Testar Compilação

```bash
cd /home/runner/workspace/firebase-mcp-server
npm run build
```

Deve compilar sem erros.

### Passo 3.3: Testar Servidor (Opcional)

```bash
npm start
```

Se as credenciais estiverem corretas, o servidor deve iniciar sem erros de autenticação.

Pressione `Ctrl+C` para parar.

---

## 🔌 PARTE 4: Ativar no Claude

### Passo 4.1: Verificar Configuração do MCP

O arquivo `.claude/settings.json` já foi configurado com:

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

- [ ] Verificar se o caminho está correto
- [ ] Verificar se o arquivo existe: `dist/index.js`

### Passo 4.2: Reiniciar o Claude

- [ ] **FECHAR COMPLETAMENTE** o Claude Code (não apenas a janela)
- [ ] Reabrir o Claude Code
- [ ] O MCP Server será carregado automaticamente

---

## 🧪 PARTE 5: Testar Funcionamento

### Passo 5.1: Testar Comandos Básicos

No Claude, digite:

**Teste 1:**
```
Verifique o status do Firebase
```

**Resultado esperado:**
- Ambiente ativo (dev ou prod)
- Status de conexão
- Lista de coleções

**Teste 2:**
```
Liste as ferramentas Firebase disponíveis
```

**Resultado esperado:**
- firebase_status
- firebase_switch
- firebase_query
- firebase_get
- firebase_compare
- firebase_backup
- firebase_search

**Teste 3:**
```
Liste os documentos da coleção "usuarios"
```

**Resultado esperado:**
- Lista de documentos da coleção

---

## 📊 Resumo do Checklist

### Arquivos que você precisa editar:
- [x] `.env` ← **PREENCHER COM CREDENCIAIS REAIS**

### Arquivos já configurados automaticamente:
- [x] `.claude/settings.json` ← Já tem a configuração do MCP
- [x] `dist/index.js` ← Já foi compilado
- [x] Todas as dependências instaladas

### Próximos comandos:
1. **Editar credenciais:** `nano .env` (ou seu editor)
2. **Verificar:** `./check-config.sh`
3. **Reiniciar Claude:** Fechar e reabrir
4. **Testar:** "Verifique o status do Firebase"

---

## 🆘 Problemas Comuns

### ❌ "Invalid service account"
**Causa:** Chave privada mal formatada
**Solução:** Verifique se manteve aspas e `\n` na PRIVATE_KEY

### ❌ "Project not found"
**Causa:** PROJECT_ID incorreto
**Solução:** Confira se copiou o valor correto do JSON

### ❌ "Module not found"
**Causa:** Dependências não instaladas
**Solução:** Execute `npm install && npm run build`

### ❌ "MCP Server não aparece"
**Causa:** Claude não foi reiniciado
**Solução:** Feche COMPLETAMENTE o Claude e reabra

---

## 📞 Ajuda Adicional

- **Credenciais:** Ver `CONFIGURAR_ENV.md`
- **MCP Setup:** Ver `CONFIGURAR_CLAUDE.md`
- **Início Rápido:** Ver `INICIO_RAPIDO.md`

---

## ✅ Checklist Final

Marque conforme for avançando:

- [ ] Baixei o JSON do Firebase Console (DEV)
- [ ] Preenchi FIREBASE_DEV_PROJECT_ID no .env
- [ ] Preenchi FIREBASE_DEV_CLIENT_EMAIL no .env
- [ ] Preenchi FIREBASE_DEV_PRIVATE_KEY no .env
- [ ] Baixei o JSON do Firebase Console (PROD)
- [ ] Preenchi FIREBASE_PROD_PROJECT_ID no .env
- [ ] Preenchi FIREBASE_PROD_CLIENT_EMAIL no .env
- [ ] Preenchi FIREBASE_PROD_PRIVATE_KEY no .env
- [ ] Executei `./check-config.sh` com sucesso
- [ ] Reiniciei o Claude Code completamente
- [ ] Testei o comando "Verifique o status do Firebase"
- [ ] ✅ **TUDO FUNCIONANDO!**

---

**🎉 Quando todos os itens estiverem marcados, você terá o MCP Firebase funcionando perfeitamente!**

