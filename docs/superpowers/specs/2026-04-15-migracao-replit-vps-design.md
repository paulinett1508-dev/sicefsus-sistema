# Spec: Migração Replit → VPS com Domínio Próprio

**Data:** 2026-04-15  
**Status:** Aprovado  
**Escopo:** Mover o hosting do frontend de Replit para VPS com CI/CD automático via GitHub Actions

---

## 1. Contexto e Motivação

O sistema SICEFSUS roda atualmente no Replit com deploy estático (`dist/` servido via Vite preview). O banco de dados (Firebase Firestore) e a autenticação (Firebase Auth) já estão na infraestrutura do Google Cloud — não no Replit.

**Motivação para migrar:**
- Ter domínio próprio (`sicefsus.com.br`) com identidade profissional
- Usar a VPS já existente (`195.200.5.145`) que está sendo paga
- Ter controle total sobre o processo de deploy
- Eliminar dependência do Replit como plataforma de hosting

**O que NÃO muda com a migração:**
- Firebase Firestore (banco de dados) — zero alteração, zero migração de dados
- Firebase Auth — zero alteração, apenas 1 ajuste de configuração
- Código-fonte — nenhuma linha de código precisa ser modificada
- Dados dos usuários — mesma conta, mesma senha, mesmo acesso

---

## 2. Arquitetura Final

```
Desenvolvedor
  └── git push → main (GitHub)
        └── GitHub Actions
              ├── checkout + npm ci + npm run build
              │     └── usa VITE_FIREBASE_* dos GitHub Secrets
              └── rsync dist/ → VPS (195.200.5.145)
                    └── /var/www/sicefsus/dist/

Usuário
  └── https://sicefsus.com.br
        └── Nginx (VPS)
              ├── serve /var/www/sicefsus/dist/ (React SPA)
              └── serve /var/www/sicefsus/apresentacoes/ (HTMLs estáticos)

Firebase Firestore ──┐
Firebase Auth    ────┤──→ SDK JS no browser (inalterado)
```

---

## 3. Domínio e DNS

**Domínio alvo:** `sicefsus.com.br`  
**Registrar em:** Registro.br (~R$ 40/ano)  
**Domínio existente:** `flowdigitalstudio.com.br` — não será usado para este sistema, continua ativo separadamente

**Registros DNS a configurar no Registro.br após registro:**

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | `@` | `195.200.5.145` | 3600 |
| A | `www` | `195.200.5.145` | 3600 |

**Sequência obrigatória:**
1. Registrar domínio
2. Configurar registros A
3. Aguardar propagação DNS (até 48h — verificar com `dig sicefsus.com.br`)
4. Somente após propagação: emitir certificado SSL com Certbot

---

## 4. VPS — Nginx

**Sistema operacional presumido:** Ubuntu 22.04 LTS  
**Serviço:** Nginx  
**SSL:** Let's Encrypt via Certbot

**Estrutura de arquivos na VPS:**
```
/var/www/sicefsus/
  └── dist/                      ← build completo (atualizado pelo GitHub Actions)
        ├── index.html            ← entry point do React
        ├── assets/               ← JS/CSS com hash
        └── apresentacoes/        ← HTMLs estáticos (copiados de public/ pelo Vite no build)
              ├── index.html
              ├── institucional.html
              └── marketing.html
```

> O Vite copia automaticamente o conteúdo de `public/` para dentro de `dist/` durante o build. Os arquivos de apresentações já chegam na VPS dentro de `dist/apresentacoes/` — nenhuma cópia manual necessária.

**Configuração Nginx** (`/etc/nginx/sites-available/sicefsus`):
```nginx
server {
    listen 443 ssl;
    server_name sicefsus.com.br www.sicefsus.com.br;

    ssl_certificate     /etc/letsencrypt/live/sicefsus.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sicefsus.com.br/privkey.pem;

    root /var/www/sicefsus/dist;
    index index.html;

    # SPA: todas as rotas do React vão para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos (JS/CSS com hash no nome)
    location ~* \.(js|css|png|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redireciona HTTP → HTTPS
server {
    listen 80;
    server_name sicefsus.com.br www.sicefsus.com.br;
    return 301 https://$host$request_uri;
}
```

**Pacotes a instalar na VPS:**
```bash
apt install nginx certbot python3-certbot-nginx rsync -y
```

---

## 5. GitHub Actions — CI/CD

**Arquivo:** `.github/workflows/deploy.yml`

**Gatilho:** push na branch `main`

**Workflow:**
```yaml
name: Deploy para VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Instalar dependências
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy para VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "dist/"
          target: "/var/www/sicefsus/"
          rm: true
```

**GitHub Secrets necessários** (configurar uma vez em Settings → Secrets → Actions):

| Secret | Descrição |
|--------|-----------|
| `VPS_HOST` | `195.200.5.145` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Chave privada SSH (conteúdo de `~/.ssh/id_rsa` ou equivalente) |
| `VITE_FIREBASE_API_KEY` | Firebase API Key (PROD) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain (PROD) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID (PROD) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket (PROD) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID (PROD) |
| `VITE_FIREBASE_APP_ID` | Firebase App ID (PROD) |

**Tempo estimado por deploy:** ~2 minutos após push

---

## 6. Ajustes no Firebase

### 6.1 Authorized Domains (CRÍTICO — fazer ANTES de trocar o DNS)

**Firebase Console → Authentication → Settings → Authorized domains**

Adicionar:
- `sicefsus.com.br`
- `www.sicefsus.com.br`

Manter durante transição (remover só após confirmar migração):
- `sicefsus.replit.app`

> Se este passo for pulado, o login Firebase quebrará imediatamente após o DNS propagar para o novo domínio.

### 6.2 `VITE_FIREBASE_AUTH_DOMAIN`

Manter apontando para `<projeto>.firebaseapp.com`. Não é necessário alterar para o domínio customizado nesta migração.

### 6.3 Firestore Rules

Nenhuma alteração. As regras validam autenticação e localização do usuário — não dependem do domínio de origem.

### 6.4 CORS

O SDK JavaScript do Firebase não sofre bloqueio de CORS ao trocar de domínio. O controle é feito exclusivamente pelos Authorized Domains (item 6.1).

---

## 7. Estratégia de Migração (Zero Downtime)

A ordem das fases é obrigatória. Executar fora de sequência pode causar indisponibilidade.

### Fase 1 — Preparar infraestrutura (sem impacto nos usuários)

| Passo | Ação | Onde |
|-------|------|------|
| 1.1 | Verificar disponibilidade de `sicefsus.com.br` | registro.br |
| 1.2 | Registrar `sicefsus.com.br` | registro.br |
| 1.3 | Instalar Nginx + Certbot na VPS | VPS |
| 1.4 | Criar estrutura `/var/www/sicefsus/` | VPS |
| 1.5 | Configurar Nginx (sem SSL ainda) | VPS |
| 1.6 | Configurar GitHub Secrets | GitHub |
| 1.7 | Criar `.github/workflows/deploy.yml` | repo local |
| 1.8 | Fazer push e verificar primeiro deploy automático | GitHub Actions |
| 1.9 | Testar acesso via `http://195.200.5.145` | browser |
| 1.10 | Adicionar `sicefsus.com.br` nos Authorized Domains do Firebase | Firebase Console |

### Fase 2 — Ligar o domínio

| Passo | Ação | Onde |
|-------|------|------|
| 2.1 | Configurar registros DNS A (`@` e `www`) | Registro.br |
| 2.2 | Aguardar propagação DNS | — |
| 2.3 | Verificar propagação: `dig sicefsus.com.br` | terminal |
| 2.4 | Emitir SSL: `certbot --nginx -d sicefsus.com.br -d www.sicefsus.com.br` | VPS |
| 2.5 | Testar `https://sicefsus.com.br` completo (login, emendas, despesas) | browser |

### Fase 3 — Encerrar Replit

| Passo | Ação | Onde |
|-------|------|------|
| 3.1 | Comunicar usuários sobre nova URL | — |
| 3.2 | Manter Replit ativo por 7 dias (safety net) | Replit |
| 3.3 | Confirmar ausência de erros nos logs da VPS | VPS |
| 3.4 | Remover `sicefsus.replit.app` dos Authorized Domains | Firebase Console |
| 3.5 | Encerrar projeto no Replit | Replit |

### Rollback

Se qualquer problema for detectado na Fase 2:
1. Reverter registros DNS para apontar de volta ao Replit (ou remover os registros A)
2. Aguardar propagação
3. Sistema volta ao estado anterior sem perda de dados (Firestore não foi tocado)

---

## 8. Impacto nos Usuários

| Momento | Impacto | Duração |
|---------|---------|---------|
| Fase 1 (infraestrutura) | Nenhum — sistema continua no Replit | Dias |
| Fase 2 (DNS) | Nenhum — Replit continua ativo durante propagação | Até 48h |
| Virada do DNS | Sessões ativas expiram; usuário precisa acessar nova URL e fazer login uma vez | Instantâneo |
| Fase 3 (7 dias) | Nenhum — ambas as URLs funcionam | 7 dias |

**Comunicação recomendada aos usuários:** informar a nova URL (`https://sicefsus.com.br`) com pelo menos 24h de antecedência em relação à Fase 3.

---

## 9. Fora do Escopo

- Migração do banco de dados (Firestore permanece no Google Cloud)
- Migração do Firebase Auth
- Alteração de qualquer código-fonte do sistema
- Configuração do `firebase-mcp-server` na VPS (ferramenta de desenvolvimento, fica local)
- Subdomínios adicionais (ex: `api.sicefsus.com.br`)
- Monitoramento e alertas pós-migração (pode ser adicionado em fase posterior)
