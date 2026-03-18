---
name: owasp-checklist
description: "Referência OWASP Top 10 2021 para segurança de aplicações web"
---

# OWASP Checklist — Seguranca de Aplicacoes Web

Referencia baseada no OWASP Top 10 2021.
Usar em code review, auditoria ou avaliacao de novo modulo.

Adaptado do agnostic-core (MIT). Fonte: skills/security/owasp-checklist.md

---

## Autenticacao e Controle de Acesso

- [ ] Todas as rotas privadas validam sessao/token antes de qualquer operacao
- [ ] Retorna 401 quando nao autenticado
- [ ] Retorna 403 quando autenticado sem permissao
- [ ] Funcoes administrativas verificam papel de admin separadamente
- [ ] Sem escalacao de privilegios (usuario comum nao acessa dados de outro)

## Injecao (SQL / NoSQL)

- [ ] Queries usam parametros ou ORM (sem concatenacao de string com input)
- [ ] Tipos de entrada validados antes de usar em queries
- [ ] Operadores perigosos desabilitados (ex: `$where` em MongoDB)

## XSS — Cross-Site Scripting

- [ ] `textContent` usado em vez de `innerHTML` para dados do usuario
- [ ] Outputs em HTML escapados
- [ ] Content-Security-Policy configurado
- [ ] Bibliotecas de sanitizacao usadas quando HTML e necessario

## Validacao de Entrada

- [ ] Todos os campos validados por tipo (string, number, boolean)
- [ ] Ranges verificados (min/max)
- [ ] Formatos validados (email, data, telefone)
- [ ] Whitelist de valores aceitos (nao blacklist)
- [ ] Payloads limitados por tamanho

## Exposicao de Dados Sensiveis

- [ ] Senhas nunca retornadas nas respostas (mesmo com hash)
- [ ] Tokens e secrets removidos antes de enviar response
- [ ] Dados pessoais fora dos logs
- [ ] Stack trace oculto em producao
- [ ] Mensagens de erro genericas para o cliente

## Rate Limiting

- [ ] Endpoints criticos com limite de requests por IP
- [ ] Limite por usuario autenticado nos endpoints de escrita
- [ ] Retorna 429 quando limite atingido

## Seguranca de Sessao / Cookie

- [ ] `httpOnly: true` (previne acesso via JS)
- [ ] `secure: true` em producao (HTTPS)
- [ ] `sameSite: lax` ou `strict`
- [ ] Timeout de sessao definido
- [ ] Rotacao de session ID apos login

## Headers de Seguranca

- [ ] Content-Security-Policy
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] HSTS habilitado em producao
- [ ] X-Powered-By removido
- [ ] CORS restrito a origens da whitelist

## Dependencias e CSRF

- [ ] `npm audit` executado regularmente
- [ ] Sem vulnerabilidades conhecidas (CVSS alto)
- [ ] Endpoints de escrita validam CSRF token quando aplicavel

## Logging e Auditoria

- [ ] Acoes sensiveis logadas: quem, quando, o que (sem dados pessoais)
- [ ] Alertas para erros 401/403 repetidos

---

## Sinais de Alto Risco

| Sinal | Risco |
|-------|-------|
| Endpoint sem validacao de autenticacao | CRITICO |
| Concatenacao de input em query | CRITICO (injecao) |
| innerHTML com dados do usuario | CRITICO (XSS) |
| Senha/token no corpo da resposta | CRITICO |
| Stack trace retornado em producao | ALTO |
| Sem rate limiting em endpoint publico | ALTO |

---

## Contexto SICEFSUS

- XSS: projeto usa `createElement`/`textContent` (nunca `innerHTML`)
- Auth: Firebase Auth com custom claims (tipo, municipio, uf)
- Firestore Rules: `matchesUserLocation()` para controle de acesso
- Audit logs: colecao `audit_logs` com create-only (imutavel)
- Validacao: `src/utils/validators.js` para todos os inputs
