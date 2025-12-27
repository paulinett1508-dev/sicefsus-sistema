# 🔧 Guia de Configuração do .env

## 📋 Passo a Passo

### 1️⃣ Acesse o Firebase Console

Vá para: https://console.firebase.google.com

### 2️⃣ Selecione seu Projeto

Escolha o projeto **DEV** primeiro, depois repita para o **PROD**.

### 3️⃣ Abra as Configurações

1. Clique no ícone de **engrenagem** ⚙️ no topo esquerdo
2. Selecione **"Project Settings"** (Configurações do projeto)

### 4️⃣ Vá para Service Accounts

1. Na tela de configurações, clique na aba **"Service Accounts"**
2. Role até encontrar o botão **"Generate new private key"** (Gerar nova chave privada)
3. Clique no botão - um aviso será exibido
4. Confirme clicando em **"Generate Key"**
5. Um arquivo JSON será baixado automaticamente

### 5️⃣ Extraia as Informações do JSON

O arquivo baixado terá este formato:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-dev",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@seu-projeto-dev.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 6️⃣ Preencha o arquivo .env

Copie os valores do JSON para o arquivo `.env`:

| Campo no .env | Campo no JSON | Exemplo |
|---------------|---------------|---------|
| `FIREBASE_DEV_PROJECT_ID` | `project_id` | `seu-projeto-dev` |
| `FIREBASE_DEV_CLIENT_EMAIL` | `client_email` | `firebase-adminsdk-xxxxx@...` |
| `FIREBASE_DEV_PRIVATE_KEY` | `private_key` | `"-----BEGIN PRIVATE KEY-----\n..."` |

#### ⚠️ IMPORTANTE sobre a PRIVATE_KEY:

- Mantenha as aspas duplas: `"-----BEGIN..."`
- Mantenha os `\n` (quebras de linha)
- A chave deve estar em uma única linha no .env
- Não remova nenhum caractere especial

**Exemplo correto:**
```bash
FIREBASE_DEV_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAAS...\n-----END PRIVATE KEY-----\n"
```

### 7️⃣ Database URL (Opcional)

Se você usa **Realtime Database** (não apenas Firestore):

1. Na mesma tela "Service Accounts"
2. Procure por "Admin SDK configuration snippet"
3. Copie a `databaseURL` mostrada

Se você usa apenas **Firestore**, pode deixar vazio ou remover essas linhas.

### 8️⃣ Repita para PROD

Repita todo o processo (passos 2-7) para o ambiente de **PRODUÇÃO**, preenchendo as variáveis `FIREBASE_PROD_*`.

## 🎯 Resultado Final

Seu arquivo `.env` deve ficar assim:

```bash
# AMBIENTE DE DESENVOLVIMENTO (DEV)
FIREBASE_DEV_PROJECT_ID=meu-projeto-dev-12345
FIREBASE_DEV_CLIENT_EMAIL=firebase-adminsdk-abc@meu-projeto-dev-12345.iam.gserviceaccount.com
FIREBASE_DEV_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"
FIREBASE_DEV_DATABASE_URL=https://meu-projeto-dev-12345.firebaseio.com

# AMBIENTE DE PRODUÇÃO (PROD)
FIREBASE_PROD_PROJECT_ID=meu-projeto-prod-67890
FIREBASE_PROD_CLIENT_EMAIL=firebase-adminsdk-xyz@meu-projeto-prod-67890.iam.gserviceaccount.com
FIREBASE_PROD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"
FIREBASE_PROD_DATABASE_URL=https://meu-projeto-prod-67890.firebaseio.com

# CONFIGURAÇÕES DO SERVIDOR
PORT=3001
MCP_TRANSPORT=stdio
```

## ✅ Verificação

Após preencher, teste a configuração executando:

```bash
npm run build
npm start
```

Se tudo estiver correto, o servidor deve iniciar sem erros de autenticação.

## 🔒 Segurança

- ❌ **NUNCA** commite o arquivo `.env` no Git
- ❌ **NUNCA** compartilhe suas chaves privadas
- ✅ O `.env` já está no `.gitignore`
- ✅ Use `.env.example` para documentar a estrutura sem expor credenciais

## 🆘 Problemas Comuns

### Erro: "Invalid service account"
- Verifique se copiou TODA a chave privada, incluindo BEGIN e END
- Verifique se manteve os `\n` na chave

### Erro: "Project not found"
- Verifique se o `project_id` está correto
- Verifique se a Service Account tem permissões no projeto

### Erro: "Parse error"
- Verifique se não há espaços extras antes das chaves privadas
- Verifique se as aspas estão fechadas corretamente
